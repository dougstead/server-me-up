<#
  Samples system-wide network throughput by summing "Bytes Received/sec"
  and "Bytes Sent/sec" across real network adapters, excluding loopback/
  tunnel/virtual-ish interfaces so the total roughly reflects real traffic.

  This is a system-wide metric (not per-process) -- Windows doesn't expose
  reliable per-process network byte counters without significantly more
  complexity (ETW tracing), which isn't justified for v1.
#>

$ErrorActionPreference = "Stop"

try {
    $samples = (Get-Counter -Counter @(
        "\Network Interface(*)\Bytes Received/sec",
        "\Network Interface(*)\Bytes Sent/sec"
    ) -ErrorAction Stop).CounterSamples

    $excludedPattern = "loopback|isatap|teredo|virtual|pseudo"

    $rx = ($samples |
        Where-Object { $_.Path -like "*bytes received/sec" -and $_.InstanceName -notmatch $excludedPattern } |
        Measure-Object -Property CookedValue -Sum).Sum

    $tx = ($samples |
        Where-Object { $_.Path -like "*bytes sent/sec" -and $_.InstanceName -notmatch $excludedPattern } |
        Measure-Object -Property CookedValue -Sum).Sum

    $result = [ordered]@{
        ok = $true
        receiveBytesPerSecond = $rx
        transmitBytesPerSecond = $tx
    }
} catch {
    $result = [ordered]@{
        ok = $false
    }
}

$result | ConvertTo-Json -Compress
