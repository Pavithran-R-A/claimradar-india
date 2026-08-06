for ($i = 1; $i -le 20; $i++) {
  $out = docker info --format '{{.ServerVersion}}' 2>&1
  $joined = ($out -join ' ')
  if ($LASTEXITCODE -eq 0 -and $joined -match '^\d+\.' -and $joined -notmatch 'error|500') {
    Write-Output "DOCKER_READY attempt=$i version=$joined"
    exit 0
  }
  $first = ($out | Select-Object -First 1)
  Write-Output "attempt=$i not_ready: $first"
  Start-Sleep -Seconds 30
}
Write-Output 'DOCKER_NOT_READY_AFTER_RETRIES'
exit 1
