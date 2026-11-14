# 推送 CYUI 到 GitHub
#
# 为什么需要这个脚本：
#   E:\Git 这套 Git for Windows 缺 git-remote-https.exe，
#   补一个又因为 libcurl 版本不匹配加载失败。
#   所以用 E:\Git-mini（完整便携版）执行推送，
#   凭证复用系统里已经登录过的 Git Credential Manager。
#
# 用法：右键“使用 PowerShell 运行”，或在终端里 .\push.ps1

$ErrorActionPreference = 'Stop'

$git = 'E:\Git-mini\cmd\git.exe'
$gcm = 'E:/Git/mingw64/bin/git-credential-manager.exe'   # 正斜杠：反斜杠会被 shell 当成转义

if (-not (Test-Path $git)) {
    Write-Host "找不到便携版 git：$git" -ForegroundColor Red
    exit 1
}

$repo = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $repo

$env:GIT_TERMINAL_PROMPT = '0'

Write-Host "== 当前提交 ==" -ForegroundColor Cyan
& $git log --oneline -3

Write-Host "`n== 推送到 origin/main ==" -ForegroundColor Cyan
& $git -c "credential.helper=!$gcm" push origin main

if ($LASTEXITCODE -ne 0) {
    Write-Host "推送失败（退出码 $LASTEXITCODE）" -ForegroundColor Red
    exit $LASTEXITCODE
}

Write-Host "`n== 远程确认 ==" -ForegroundColor Cyan
& $git -c "credential.helper=!$gcm" ls-remote origin main
Write-Host "`n完成：https://github.com/Lygus-496/dsh-cyui" -ForegroundColor Green
