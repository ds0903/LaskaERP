# LaskaERP — повна збірка в EXE
# Запуск: .\build.ps1

$ErrorActionPreference = "Stop"
$Root = $PSScriptRoot

Write-Host "=== [1/4] Build Frontend ===" -ForegroundColor Cyan
Set-Location "$Root\frontend"
npm install
npm run build

Write-Host "=== [2/4] Build Backend (PyInstaller) ===" -ForegroundColor Cyan
Set-Location "$Root\backend"
pip install pyinstaller
pyinstaller server.spec --noconfirm

Write-Host "=== [3/4] Copy sidecar binary ===" -ForegroundColor Cyan
$BinDir = "$Root\src-tauri\binaries"
New-Item -ItemType Directory -Force -Path $BinDir | Out-Null

# Визначаємо target triple для поточної машини
$Triple = (rustc -vV | Select-String "host:").ToString().Split(":")[1].Trim()
Write-Host "  Target: $Triple"

Copy-Item "$Root\backend\dist\server.exe" "$BinDir\server-$Triple.exe" -Force

Write-Host "=== [4/4] Build Tauri EXE ===" -ForegroundColor Cyan
Set-Location "$Root"
cargo tauri build

Write-Host ""
Write-Host "=== DONE ===" -ForegroundColor Green
Write-Host "EXE знаходиться в: src-tauri\target\release\bundle\nsis\" -ForegroundColor Yellow
