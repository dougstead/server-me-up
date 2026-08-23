import { NextRequest } from "next/server";
import { games } from "@/lib/games";
import { SITE_URL } from "@/lib/site";

// Generates the downloadable hardware-scan .bat on the fly instead of
// serving a static file, so the script can remember which game's page it
// was downloaded from -- e.g. downloading it from
// /can-my-pc-run-it/arma-3 opens that same per-game page again once the
// scan finishes, instead of always landing on the generic /can-my-pc-run-it
// page (which defaults to the first game, Minecraft). The ?game= query
// param is validated against the real games list rather than trusted
// as-is, since it's interpolated into a URL baked into the script.
export async function GET(request: NextRequest) {
    const requestedGameId = request.nextUrl.searchParams.get("game");
    const game = games.find((candidate) => candidate.id === requestedGameId);
    const targetPath = game ? `/can-my-pc-run-it/${game.id}` : "/can-my-pc-run-it";
    const baseUrl = `${SITE_URL}${targetPath}`;

    const script = `<# :
@echo off
setlocal
title SelfServr - Hardware Scanner
echo SelfServr - Hardware Scanner
echo ================================
echo.
echo Reading your CPU, RAM, storage type and OS from Windows...
echo Nothing here is uploaded anywhere - these values are only used to
echo pre-fill the form at servermeup.co.uk, in your own browser.
echo.
powershell -NoProfile -ExecutionPolicy Bypass -Command "Invoke-Expression (Get-Content -LiteralPath '%~f0' -Raw)"
echo.
pause
exit /b
#>

# ------------------------------------------------------------------------
# SelfServr - Hardware Scanner (Windows)
#
# Reads local CPU, RAM, storage type and OS info via WMI/Storage cmdlets,
# then opens the "Can My Machine Run It?" page with those values
# pre-filled. Nothing is sent anywhere except your own default browser.
# ------------------------------------------------------------------------

$ErrorActionPreference = "SilentlyContinue"

$baseUrl = "${baseUrl}"

function Get-CleanCpuName {
    param([string]$RawName)

    if (-not $RawName) {
        return ""
    }

    $name = $RawName
    $name = $name -replace '\\(R\\)', ''
    $name = $name -replace '\\(TM\\)', ''
    $name = $name -replace '\\(C\\)', ''
    $name = $name -replace '\\s*@\\s*[\\d.]+\\s*GHz', ''
    $name = $name -replace '\\s*\\d+-Core Processor', ''
    $name = $name -replace '\\s*Processor\\s*$', ''
    $name = $name -replace '\\s*CPU\\s*', ' '
    $name = $name -replace '\\s{2,}', ' '

    return $name.Trim()
}

$rawCpuName = (Get-CimInstance -ClassName Win32_Processor | Select-Object -First 1).Name
$cpuName = Get-CleanCpuName -RawName $rawCpuName

$totalRamBytes = (Get-CimInstance -ClassName Win32_ComputerSystem).TotalPhysicalMemory
$ramGb = if ($totalRamBytes) { [Math]::Round($totalRamBytes / 1GB) } else { 16 }

$storageType = "ssd"
try {
    $systemDriveLetter = $env:SystemDrive.TrimEnd(":")
    $partition = Get-Partition -DriveLetter $systemDriveLetter -ErrorAction Stop
    $disk = $partition | Get-Disk -ErrorAction Stop
    $physicalDisk = Get-PhysicalDisk -ErrorAction Stop |
        Where-Object { $_.DeviceId -eq $disk.Number } |
        Select-Object -First 1

    if ($physicalDisk -and $physicalDisk.MediaType -eq "HDD") {
        $storageType = "hdd"
    }
} catch {
    # The Storage module isn't available on every system/edition.
    # Default to SSD (the common case) and let the user correct it
    # manually on the page if that's wrong.
}

Write-Host "CPU:     $cpuName"
Write-Host "RAM:     $ramGb GB"
Write-Host "Storage: $($storageType.ToUpper())"
Write-Host "OS:      Windows"
Write-Host ""

$queryParams = @(
    "cpu=$([Uri]::EscapeDataString($cpuName))",
    "ram=$ramGb",
    "storage=$storageType",
    "os=windows"
) -join "&"

$url = "\${baseUrl}?$queryParams"

Write-Host "Opening: $url"
Start-Process $url
`;

    return new Response(script, {
        headers: {
            "Content-Type": "application/octet-stream",
            "Content-Disposition":
                'attachment; filename="server-me-up-hardware-scan.bat"',
            "Cache-Control": "no-store",
        },
    });
}
