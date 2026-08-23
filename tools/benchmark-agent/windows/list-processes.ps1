<#
  Lists running processes (id, name, path) as JSON. Used for process
  discovery -- matching candidate game-server process names, and for
  suggesting partial matches when no exact match is found.
#>

$ErrorActionPreference = "Stop"

$list = @(Get-Process | ForEach-Object {
    $exePath = $null
    try { $exePath = $_.Path } catch { $exePath = $null }

    [ordered]@{
        id = $_.Id
        name = $_.ProcessName
        path = $exePath
    }
})

# Force array output even if only one process matched (ConvertTo-Json
# would otherwise unwrap a single-element array into a bare object).
ConvertTo-Json -InputObject $list -Compress
