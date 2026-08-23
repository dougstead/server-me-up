$ErrorActionPreference = "Stop"

$AppDirectory = "C:\Apps\server-me-up"
$TaskName = "SelfServr"

Set-Location $AppDirectory

Write-Host "Refreshing CPU data..."

npm.cmd run update:cpus

Write-Host "Building SelfServr..."

npm.cmd run build

Write-Host "Restarting SelfServr..."

Stop-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
Start-ScheduledTask -TaskName $TaskName

Write-Host "CPU refresh complete."