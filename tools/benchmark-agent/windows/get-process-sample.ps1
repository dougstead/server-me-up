<#
  Samples one process by PID: cumulative CPU time, working set, private
  memory, thread count, and (best-effort) disk IO bytes/sec.

  CPU is NOT computed here as a percentage -- this script only returns the
  raw cumulative TotalProcessorTime. The caller (Node) computes CPU% by
  diffing TotalProcessorTime between two consecutive samples against the
  wall-clock time elapsed between them. That keeps this script fast and
  stateless (no need to remember anything between invocations).

  Disk IO uses Get-Counter scoped to just this process's image name
  (not "\Process(*)\..." across the whole system) -- testing found that
  querying every process on the system in one wildcarded call intermittently
  throws "the data in one of the performance counter samples is not valid",
  almost certainly from an unrelated process elsewhere on the system having
  a transient invalid sample. Scoping to the target's own name avoids that.
  If it still fails for any reason, IO fields are left null rather than
  guessed -- disk IO is inherently best-effort on Windows without much more
  complexity than is justified for v1.

  Everything from the initial Get-Process onward is wrapped in ONE outer
  try/catch, not just the initial lookup: testing found that the process
  can exit in the gap between Get-Process succeeding and a later property
  read (e.g. TotalProcessorTime), which throws "You cannot call a method
  on a null-valued expression" rather than a clean "not found" error. Any
  failure anywhere in this script means the process is gone -- report
  found=false rather than letting a partial/garbled result through.
#>

param(
    [Parameter(Mandatory = $true)]
    [int]$ProcessId
)

$ErrorActionPreference = "Stop"

try {
    $p = Get-Process -Id $ProcessId -ErrorAction Stop

    $ioReadBytesPerSec = $null
    $ioWriteBytesPerSec = $null

    try {
        $procName = $p.ProcessName
        $samples = (Get-Counter -Counter @(
            "\Process($procName*)\ID Process",
            "\Process($procName*)\IO Read Bytes/sec",
            "\Process($procName*)\IO Write Bytes/sec"
        ) -ErrorAction Stop).CounterSamples

        $idSample = $samples |
            Where-Object { $_.Path -like "*\id process" -and [int]$_.CookedValue -eq $p.Id } |
            Select-Object -First 1

        if ($idSample) {
            $readSample = $samples |
                Where-Object { $_.Path -like "*io read bytes/sec" -and $_.InstanceName -eq $idSample.InstanceName } |
                Select-Object -First 1
            $writeSample = $samples |
                Where-Object { $_.Path -like "*io write bytes/sec" -and $_.InstanceName -eq $idSample.InstanceName } |
                Select-Object -First 1

            $ioReadBytesPerSec = $readSample.CookedValue
            $ioWriteBytesPerSec = $writeSample.CookedValue
        }
    } catch {
        # Leave IO values as $null -- best-effort only, see header comment.
        # Deliberately not re-thrown: a disk-IO failure alone shouldn't
        # sink the whole sample.
    }

    $exePath = $null
    try { $exePath = $p.Path } catch { $exePath = $null }

    $result = [ordered]@{
        found = $true
        pid = $p.Id
        processName = $p.ProcessName
        path = $exePath
        totalProcessorTimeMs = $p.TotalProcessorTime.TotalMilliseconds
        workingSet64 = $p.WorkingSet64
        privateMemorySize64 = $p.PrivateMemorySize64
        threadCount = $p.Threads.Count
        startTimeIso = $p.StartTime.ToUniversalTime().ToString("o")
        ioReadBytesPerSec = $ioReadBytesPerSec
        ioWriteBytesPerSec = $ioWriteBytesPerSec
    }
} catch {
    # Covers: PID never existed, or the process exited at any point during
    # this script's run (including between Get-Process succeeding and a
    # later property read on it).
    $result = [ordered]@{ found = $false }
}

$result | ConvertTo-Json -Compress
