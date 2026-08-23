$ErrorActionPreference = "Stop"

$AppDirectory = "C:\Apps\server-me-up"
$TaskName = "Server Me Up"

function Assert-LastCommandSucceeded {
    param(
        [string]$Step
    )

    if ($LASTEXITCODE -ne 0) {
        throw "$Step failed with exit code $LASTEXITCODE."
    }
}

Write-Host "Deploying Server Me Up..." -ForegroundColor Cyan

Set-Location $AppDirectory

Write-Host "Pulling latest code..."
git pull --ff-only
Assert-LastCommandSucceeded "git pull"

Write-Host "Stopping Server Me Up..."

Stop-ScheduledTask `
    -TaskName $TaskName `
    -ErrorAction SilentlyContinue

# Make absolutely sure nothing is still listening on port 3000.
$connections = Get-NetTCPConnection `
    -LocalPort 3000 `
    -State Listen `
    -ErrorAction SilentlyContinue

foreach ($connection in $connections) {
    Write-Host "Stopping process $($connection.OwningProcess) on port 3000..."

    Stop-Process `
        -Id $connection.OwningProcess `
        -Force `
        -ErrorAction SilentlyContinue
}

Start-Sleep -Seconds 2

try {
    Write-Host "Installing dependencies..."
    npm.cmd ci
    Assert-LastCommandSucceeded "npm ci"

    if (-not (Test-Path "$AppDirectory\data\cpus.json")) {
        Write-Host "CPU catalogue missing. Generating it..."

        npm.cmd run update:cpus
        Assert-LastCommandSucceeded "CPU catalogue generation"
    }

    Write-Host "Building production application..."
    npm.cmd run build
    Assert-LastCommandSucceeded "Next.js build"

    Write-Host "Starting Server Me Up..."
    Start-ScheduledTask -TaskName $TaskName

    Start-Sleep -Seconds 3

    # Verify that Next.js really came back.
    try {
        $response = Invoke-WebRequest `
            -Uri "http://localhost:3000" `
            -UseBasicParsing `
            -TimeoutSec 10

        if ($response.StatusCode -ne 200) {
            throw "Server returned HTTP $($response.StatusCode)."
        }
    }
    catch {
        throw "Server did not start successfully: $($_.Exception.Message)"
    }

    Write-Host "Deployment complete." -ForegroundColor Green
}
catch {
    Write-Host ""
    Write-Host "DEPLOYMENT FAILED:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red

    throw
}