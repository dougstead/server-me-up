$ErrorActionPreference = "Stop"

$AppDirectory = "C:\Apps\server-me-up"
$TaskName = "Server Me Up"

Set-Location $AppDirectory

Write-Host "Pulling latest code..."
git pull --ff-only

Write-Host "Installing dependencies..."
npm.cmd ci

if (-not (Test-Path "$AppDirectory\data\cpus.json")) {
    Write-Host "CPU catalogue missing. Generating it..."
    npm.cmd run update:cpus
}

Write-Host "Building..."
npm.cmd run build

Write-Host "Restarting application..."
Stop-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
Start-ScheduledTask -TaskName $TaskName

Write-Host "Deployment complete."