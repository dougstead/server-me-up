$ErrorActionPreference = "Stop"

$AppDirectory = "C:\Apps\server-me-up"

Write-Host "Configuring Server Me Up scheduled tasks..."

# -----------------------------
# Main Server Task
# -----------------------------

$serverAction = New-ScheduledTaskAction `
    -Execute "cmd.exe" `
    -Argument "/c `"$AppDirectory\start-servermeup.cmd`""

$serverTrigger = New-ScheduledTaskTrigger -AtStartup

$serverSettings = New-ScheduledTaskSettingsSet `
    -StartWhenAvailable `
    -RestartCount 5 `
    -RestartInterval (New-TimeSpan -Minutes 1)

Register-ScheduledTask `
    -TaskName "Server Me Up" `
    -Action $serverAction `
    -Trigger $serverTrigger `
    -Settings $serverSettings `
    -RunLevel Highest `
    -Force

Write-Host "Created Server Me Up startup task."

# -----------------------------
# Weekly CPU Refresh Task
# -----------------------------

$cpuAction = New-ScheduledTaskAction `
    -Execute "powershell.exe" `
    -Argument "-ExecutionPolicy Bypass -File `"$AppDirectory\refresh-cpus.ps1`""

$cpuTrigger = New-ScheduledTaskTrigger `
    -Weekly `
    -DaysOfWeek Sunday `
    -At 4am

$cpuSettings = New-ScheduledTaskSettingsSet `
    -StartWhenAvailable `
    -RestartCount 3 `
    -RestartInterval (New-TimeSpan -Minutes 5)

Register-ScheduledTask `
    -TaskName "Server Me Up CPU Refresh" `
    -Action $cpuAction `
    -Trigger $cpuTrigger `
    -Settings $cpuSettings `
    -RunLevel Highest `
    -Force

Write-Host "Created weekly CPU refresh task."

Write-Host "Server setup complete."