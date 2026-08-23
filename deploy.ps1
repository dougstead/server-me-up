$ErrorActionPreference = "Stop"

$AppDirectory = "C:\Apps\server-me-up"
$TaskName = "Server Me Up"

Write-Host "Deploying Server Me Up..."

Set-Location $AppDirectory

Write-Host "Pulling latest code..."
git pull --ff-only

Write-Host "Installing dependencies..."
npm.cmd ci

Write-Host "Building..."
npm.cmd run build

Write-Host "Restarting application..."

Stop-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
Start-ScheduledTask -TaskName $TaskName

Write-Host "Deployment complete."