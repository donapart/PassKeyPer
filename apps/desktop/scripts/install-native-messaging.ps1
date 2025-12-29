# Native Messaging Installation Script
# Installs PassKeyPer native messaging host for browser extension

Write-Host "PassKeyPer Native Messaging Host Installer" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Paths
$desktopAppPath = "$PSScriptRoot\..\..\dist\win-unpacked\PassKeyPer.exe"
$manifestPath = "$PSScriptRoot\..\native-messaging-manifest.json"

# Check if desktop app exists
if (-Not (Test-Path $desktopAppPath)) {
    Write-Host "ERROR: Desktop app not found at: $desktopAppPath" -ForegroundColor Red
    Write-Host "Please build the desktop app first: npm run build" -ForegroundColor Yellow
    exit 1
}

# Update manifest with correct path
$manifest = Get-Content $manifestPath -Raw | ConvertFrom-Json
$manifest.path = $desktopAppPath
$manifest | ConvertTo-Json -Depth 10 | Set-Content $manifestPath

Write-Host "✓ Updated manifest with desktop app path" -ForegroundColor Green

# Chrome Registry
$chromeKey = "HKCU:\Software\Google\Chrome\NativeMessagingHosts\com.passkeyper.native"
try {
    New-Item -Path $chromeKey -Force | Out-Null
    Set-ItemProperty -Path $chromeKey -Name "(Default)" -Value $manifestPath
    Write-Host "✓ Installed for Chrome" -ForegroundColor Green
} catch {
    Write-Host "⚠ Failed to install for Chrome: $_" -ForegroundColor Yellow
}

# Firefox Registry
$firefoxKey = "HKCU:\Software\Mozilla\NativeMessagingHosts\com.passkeyper.native"
try {
    New-Item -Path $firefoxKey -Force | Out-Null
    Set-ItemProperty -Path $firefoxKey -Name "(Default)" -Value $manifestPath
    Write-Host "✓ Installed for Firefox" -ForegroundColor Green
} catch {
    Write-Host "⚠ Failed to install for Firefox: $_" -ForegroundColor Yellow
}

# Edge Registry
$edgeKey = "HKCU:\Software\Microsoft\Edge\NativeMessagingHosts\com.passkeyper.native"
try {
    New-Item -Path $edgeKey -Force | Out-Null
    Set-ItemProperty -Path $edgeKey -Name "(Default)" -Value $manifestPath
    Write-Host "✓ Installed for Edge" -ForegroundColor Green
} catch {
    Write-Host "⚠ Failed to install for Edge: $_" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Installation complete!" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Load extension in your browser" -ForegroundColor White
Write-Host "2. Open PassKeyPer desktop app" -ForegroundColor White
Write-Host "3. Test extension communication" -ForegroundColor White
Write-Host ""
