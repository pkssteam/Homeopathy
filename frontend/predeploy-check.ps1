# predeploy-check.ps1
$ErrorActionPreference = 'Stop'

$checks = @(
  @{
    Name = 'Verify Node Packages Audit'
    Action = {
      # Alert only on high/critical, run audit
      npm audit --audit-level=high
    }
  },
  @{
    Name = 'Run Code Linter (ESLint)'
    Action = {
      npm run lint
    }
  },
  @{
    Name = 'Run Production Build Verification'
    Action = {
      npm run build
    }
  }
)

$passed = 0
$total = $checks.Count
$errors = @()

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "   Homepathy HMS Deployment Pre-Check Script" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

for ($i = 0; $i -lt $total; $i++) {
  $check = $checks[$i]
  $stepNo = $i + 1
  Write-Host "[$stepNo/$total] Running: $($check.Name)..." -NoNewline
  try {
    & $check.Action | Out-Null
    $passed++
    Write-Host " [PASS]" -ForegroundColor Green
  }
  catch {
    $message = $_.Exception.Message
    $errors += "$($check.Name) - $message"
    Write-Host " [FAIL]" -ForegroundColor Red
  }
}

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
if ($errors.Count -eq 0) {
  Write-Host "SUCCESS: All $passed/$total checks passed. Code is ready for deployment." -ForegroundColor Green
  Write-Host "=============================================" -ForegroundColor Cyan
  exit 0
} else {
  Write-Host "WARNING: $passed/$total checks passed. Failures detected." -ForegroundColor Yellow
  foreach ($err in $errors) {
    Write-Host " - $err" -ForegroundColor Red
  }
  Write-Host "=============================================" -ForegroundColor Cyan
  exit 1
}
