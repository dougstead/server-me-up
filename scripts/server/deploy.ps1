$ErrorActionPreference = "Stop"

$AppDirectory = "C:\Apps\server-me-up"
$TaskName = "Server Me Up"

# SelfServr's port is fixed at 3000, not left to whatever Next.js would
# otherwise default to -- this host also runs a second site, so both this
# script's own port-cleanup/verification steps and package.json's "start"
# script ("next start -p 3000") pin the same number explicitly rather than
# relying on Next's default (which the two sites would otherwise race for
# depending on boot/service-start order). If that second site is ever moved
# onto this same box's port range, give it its own fixed port too rather
# than letting either app fall back to "whatever's free".
$Port = 3000

function Assert-LastCommandSucceeded {
    param(
        [string]$Step
    )

    if ($LASTEXITCODE -ne 0) {
        throw "$Step failed with exit code $LASTEXITCODE."
    }
}

Write-Host "Deploying SelfServr..." -ForegroundColor Cyan

Set-Location $AppDirectory

Write-Host "Pulling latest code..."
git pull --ff-only
Assert-LastCommandSucceeded "git pull"

Write-Host "Stopping SelfServr..."

Stop-ScheduledTask `
    -TaskName $TaskName `
    -ErrorAction SilentlyContinue

# Stop-ScheduledTask only reliably signals the task's own process tree.
# It won't necessarily catch a stray build/esbuild process left behind by
# a previous interrupted deploy, and that's exactly what can hold
# node_modules\@esbuild\win32-x64\esbuild.exe locked and make `npm ci`
# fail with EPERM -- so also sweep for anything still running out of the
# app directory, not just whatever's bound to $Port.
function Stop-StaleAppProcesses {
    $staleProcesses = Get-CimInstance Win32_Process -ErrorAction SilentlyContinue |
        Where-Object {
            $_.ExecutablePath -and
            $_.ExecutablePath.StartsWith($AppDirectory, [System.StringComparison]::OrdinalIgnoreCase)
        }

    foreach ($process in $staleProcesses) {
        Write-Host "Stopping leftover process $($process.ProcessId) ($($process.Name))..."

        Stop-Process `
            -Id $process.ProcessId `
            -Force `
            -ErrorAction SilentlyContinue
    }

    return @($staleProcesses).Count
}

# Make absolutely sure nothing is still listening on our port.
$connections = Get-NetTCPConnection `
    -LocalPort $Port `
    -State Listen `
    -ErrorAction SilentlyContinue

foreach ($connection in $connections) {
    Write-Host "Stopping process $($connection.OwningProcess) on port $Port..."

    Stop-Process `
        -Id $connection.OwningProcess `
        -Force `
        -ErrorAction SilentlyContinue
}

Stop-StaleAppProcesses | Out-Null

# Poll for locked processes to actually exit instead of guessing with a
# fixed sleep -- a Force-killed process can take a moment to release its
# file handles.
$deadline = (Get-Date).AddSeconds(15)

while ((Get-Date) -lt $deadline) {
    if ((Stop-StaleAppProcesses) -eq 0) {
        break
    }

    Start-Sleep -Milliseconds 500
}

Start-Sleep -Seconds 2

try {
    Write-Host "Installing dependencies..."

    # A freshly-written node_modules\**\*.exe can be transiently locked by
    # antivirus/Windows Defender real-time scanning right after npm writes
    # it, independent of any leftover process -- retry a couple of times
    # before giving up, since that lock is normally released within a
    # couple of seconds.
    $maxAttempts = 3
    $attempt = 1

    while ($true) {
        npm.cmd ci

        if ($LASTEXITCODE -eq 0) {
            break
        }

        if ($attempt -ge $maxAttempts) {
            Assert-LastCommandSucceeded "npm ci"
        }

        Write-Host "npm ci failed (attempt $attempt of $maxAttempts), retrying in 5 seconds..."
        Start-Sleep -Seconds 5
        $attempt++
    }

    if (-not (Test-Path "$AppDirectory\data\cpus.json")) {
        Write-Host "CPU catalogue missing. Generating it..."

        npm.cmd run update:cpus
        Assert-LastCommandSucceeded "CPU catalogue generation"
    }

    Write-Host "Building production application..."
    npm.cmd run build
    Assert-LastCommandSucceeded "Next.js build"

    Write-Host "Starting SelfServr..."
    Start-ScheduledTask -TaskName $TaskName

    Start-Sleep -Seconds 3

    # Verify that Next.js really came back, on the port we expect --
    # if the scheduled task's own action doesn't pin -p $Port itself and
    # Next fell back to a different port, this catches that as a failure
    # rather than silently deploying a server nobody can reach on $Port.
    try {
        $response = Invoke-WebRequest `
            -Uri "http://localhost:$Port" `
            -UseBasicParsing `
            -TimeoutSec 10

        if ($response.StatusCode -ne 200) {
            throw "Server returned HTTP $($response.StatusCode)."
        }
    }
    catch {
        throw "Server did not start successfully on port ${Port}: $($_.Exception.Message)"
    }

    Write-Host "Deployment complete." -ForegroundColor Green
}
catch {
    Write-Host ""
    Write-Host "DEPLOYMENT FAILED:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red

    throw
}