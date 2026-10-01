# Load .env
$envFile = "d:\facebook_Tool\server\.env"
Get-Content $envFile | Where-Object { $_ -match "^[A-Za-z_][A-Za-z0-9_]*=.+" } | ForEach-Object {
    $parts = $_ -split "=", 2
    $key = $parts[0].Trim()
    $val = $parts[1].Trim()
    [System.Environment]::SetEnvironmentVariable($key, $val, "Process")
}

Write-Host "[LAUNCHER] Env loaded" -ForegroundColor Cyan

# Start Backend
$backend = Start-Process -FilePath "node" -ArgumentList "d:\facebook_Tool\server\src\app.js" -PassThru -NoNewWindow
Write-Host "[LAUNCHER] Backend PID: $($backend.Id)" -ForegroundColor Green

# Start Post Worker
$worker1 = Start-Process -FilePath "node" -ArgumentList "d:\facebook_Tool\server\queues\post.worker.js" -PassThru -NoNewWindow
Write-Host "[LAUNCHER] Post Worker PID: $($worker1.Id)" -ForegroundColor Green

# Start Comment Worker
$worker2 = Start-Process -FilePath "node" -ArgumentList "d:\facebook_Tool\server\queues\comment.worker.js" -PassThru -NoNewWindow
Write-Host "[LAUNCHER] Comment Worker PID: $($worker2.Id)" -ForegroundColor Green

# Start Frontend
$frontend = Start-Process -FilePath "node" -ArgumentList "d:\facebook_Tool\client\node_modules\next\dist\bin\next", "start", "-p", "3000" -WorkingDirectory "d:\facebook_Tool\client" -PassThru -NoNewWindow
Write-Host "[LAUNCHER] Frontend PID: $($frontend.Id)" -ForegroundColor Green

# Save PIDs
$pids = @{
    backend = $backend.Id
    worker1 = $worker1.Id  
    worker2 = $worker2.Id
    frontend = $frontend.Id
}
$pids | ConvertTo-Json | Set-Content "d:\facebook_Tool\.running-pids.json"

Write-Host "[LAUNCHER] PIDs saved to .running-pids.json" -ForegroundColor Cyan
Write-Host "[LAUNCHER] Waiting for services..." -ForegroundColor Cyan

# Wait for all processes
$backend.WaitForExit()
