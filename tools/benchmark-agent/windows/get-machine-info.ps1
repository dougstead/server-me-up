<#
  Collects static machine hardware info once at benchmark startup.
  This is the only script that uses CIM (Win32_Processor etc.) -- it's
  slow-ish (~1s) but only runs once per session, not per sample.
#>

$ErrorActionPreference = "Stop"

try {
    $cpu = Get-CimInstance -ClassName Win32_Processor -ErrorAction Stop | Select-Object -First 1
    $cs = Get-CimInstance -ClassName Win32_ComputerSystem -ErrorAction Stop
    $os = Get-CimInstance -ClassName Win32_OperatingSystem -ErrorAction Stop

    $result = [ordered]@{
        ok = $true
        cpuModel = $cpu.Name.Trim()
        physicalCores = [int]$cpu.NumberOfCores
        logicalThreads = [int]$cpu.NumberOfLogicalProcessors
        totalRamBytes = [int64]$cs.TotalPhysicalMemory
        osCaption = $os.Caption
        osVersion = $os.Version
        hostname = $env:COMPUTERNAME
    }
} catch {
    $result = [ordered]@{
        ok = $false
        error = $_.Exception.Message
    }
}

$result | ConvertTo-Json -Compress
