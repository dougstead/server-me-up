$ErrorActionPreference = "Stop"

$AppDirectory = "C:\Apps\server-me-up"
$TaskName = "Server Me Up"

Set-Location $AppDirectory

Write-Host "Refreshing CPU data..."

npm.cmd run update:cpus

Write-Host "Building Server Me Up..."

npm.cmd run build

Write-Host "Restarting Server Me Up..."

Stop-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
Start-ScheduledTask -TaskName $TaskName

Write-Host "CPU refresh complete."