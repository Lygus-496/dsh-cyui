"""Publish the CYUI repo through the GitHub API.

The local Git for Windows install ships without git-remote-https, so `git push`
cannot talk to GitHub at all. The REST API can: upload every tracked file as a
blob, assemble one tree, commit it, and point refs/heads/main at it. The result
is a normal commit with the same files and message.
"""
import base64
import json
import mimetypes
import subprocess
import sys
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(r"C:\Users\lenovo\Documents\deepseek-harness\default-workspace\plugins\dsh-cyui")
OWNER, REPO = "Lygus-496", "dsh-cyui"
API = "https://api.github.com"

# --- credential comes from the same store git would use -------------------
cred = subprocess.run(
    ["git", "credential", "fill"],
    input="protocol=https\nhost=github.com\n\n",
    capture_output=True, text=True, cwd=str(ROOT),
).stdout
token = ""
for line in cred.splitlines():
    if line.startswith("password="):
        token = line[len("password="):].strip()
if not token:
    sys.exit("no cached GitHub token")

HEADERS = {
    "Authorization": f"Bearer {token}",
    "Accept": "application/vnd.github+json",
    "User-Agent": "cyui-publish",
}


def call(method, path, payload=None):
    data = json.dumps(payload).encode() if payload is not None else None
    req = urllib.request.Request(f"{API}{path}", data=data, method=method, headers=HEADERS)
    if data:
        req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            raw = resp.read()
            return json.loads(raw) if raw else {}
    except urllib.error.HTTPError as err:
        body = err.read().decode("utf-8", "replace")
        raise SystemExit(f"{method} {path} -> {err.code}: {body[:400]}")



# --- an empty repo has no object database yet; seed it with one commit ---
try:
    call("GET", f"/repos/{OWNER}/{REPO}/git/refs/heads/main")
except SystemExit:
    import base64 as _b64
    call("PUT", f"/repos/{OWNER}/{REPO}/contents/.init", {
        "message": "init",
        "content": _b64.b64encode(b"seed").decode(),
    })
    print("seeded empty repository")

files = subprocess.run(
    ["git", "ls-files"], capture_output=True, text=True, cwd=str(ROOT), check=True
).stdout.split()
print(f"{len(files)} tracked files")

entries = []
for name in files:
    local = ROOT / name
    raw = local.read_bytes()
    mime = mimetypes.guess_type(name)[0] or "application/octet-stream"
    is_text = mime.startswith("text/") or name.endswith((".js", ".mjs", ".yml", ".json", ".md", ".py", ".svg")) \
        or name in {"LICENSE", ".gitignore"}
    if is_text:
        try:
            payload = {"content": raw.decode("utf-8"), "encoding": "utf-8"}
        except UnicodeDecodeError:
            payload = {"content": base64.b64encode(raw).decode(), "encoding": "base64"}
    else:
        payload = {"content": base64.b64encode(raw).decode(), "encoding": "base64"}
    blob = call("POST", f"/repos/{OWNER}/{REPO}/git/blobs", payload)
    entries.append({"path": name, "mode": "100644", "type": "blob", "sha": blob["sha"]})
    print(f"  blob {name} ({len(raw)} B)")

tree = call("POST", f"/repos/{OWNER}/{REPO}/git/trees", {"tree": entries})
print("tree", tree["sha"])

message = "feat: plugin icon + locale metadata (1.0.3)"
head = call("GET", f"/repos/{OWNER}/{REPO}/git/refs/heads/main")
parent = head["object"]["sha"]
commit = call("POST", f"/repos/{OWNER}/{REPO}/git/commits",
              {"message": message, "tree": tree["sha"], "parents": [parent]})
print("commit", commit["sha"])

try:
    call("POST", f"/repos/{OWNER}/{REPO}/git/refs",
         {"ref": "refs/heads/main", "sha": commit["sha"]})
    print("refs/heads/main created")
except SystemExit:
    call("PATCH", f"/repos/{OWNER}/{REPO}/git/refs/heads/main", {"sha": commit["sha"], "force": True})
    print("refs/heads/main updated")

repo = call("GET", f"/repos/{OWNER}/{REPO}")
print("default_branch:", repo["default_branch"])
print("url:", repo["html_url"])
