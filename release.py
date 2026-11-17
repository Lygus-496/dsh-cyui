"""Cut the v1.0.4 release, using the README as the release notes."""
import json
import subprocess
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(r"C:\Users\lenovo\Documents\deepseek-harness\default-workspace\plugins\dsh-cyui")
OWNER, REPO = "Lygus-496", "dsh-cyui"
API = "https://api.github.com"

cred = subprocess.run(
    ["git", "credential", "fill"],
    input="protocol=https\nhost=github.com\n\n",
    capture_output=True, text=True, cwd=str(ROOT),
).stdout
token = next((l.split("=", 1)[1].strip() for l in cred.splitlines() if l.startswith("password=")), "")
if not token:
    raise SystemExit("no token")

HEADERS = {"Authorization": f"Bearer {token}", "Accept": "application/vnd.github+json",
           "User-Agent": "cyui-release"}


def call(method, url, payload=None, raw=None, ctype="application/json"):
    data = raw if raw is not None else (json.dumps(payload).encode() if payload is not None else None)
    req = urllib.request.Request(url, data=data, method=method, headers=dict(HEADERS))
    if data is not None:
        req.add_header("Content-Type", ctype)
    try:
        with urllib.request.urlopen(req, timeout=300) as resp:
            body = resp.read()
            return json.loads(body) if body else {}
    except urllib.error.HTTPError as err:
        raise SystemExit(f"{method} {url} -> {err.code}: {err.read().decode('utf-8', 'replace')[:500]}")


notes = (ROOT / "README.md").read_text(encoding="utf-8")
tag = "v1.2.0"

try:
    call("GET", f"{API}/repos/{OWNER}/{REPO}/releases/tags/{tag}")
    print("release exists, skipping creation")
except SystemExit:
    rel = call("POST", f"{API}/repos/{OWNER}/{REPO}/releases", {
        "tag_name": tag,
        "target_commitish": "main",
        "name": "CYUI 1.2.0",
        "body": notes,
        "draft": False,
        "prerelease": False,
    })
    print("release:", rel["html_url"])

rel = call("GET", f"{API}/repos/{OWNER}/{REPO}/releases/tags/{tag}")
tgz = ROOT / "dsh-cyui-1.2.0.tgz"
upload = f"https://uploads.github.com/repos/{OWNER}/{REPO}/releases/{rel['id']}/assets?name={tgz.name}"
asset = call("POST", upload, raw=tgz.read_bytes(), ctype="application/gzip")
print("asset:", asset["browser_download_url"], f"{asset['size']//1024} KB")
