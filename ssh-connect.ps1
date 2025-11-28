$password = 'seT6EX\89vd`T3/'
$username = 'root'
$server = '188.137.254.45'

# Create a temporary expect-like script
$expectScript = @"
`$password = '$password'
`$proc = Start-Process -FilePath "`$env:TEMP\OpenSSH\OpenSSH-Win64\ssh.exe" -ArgumentList "-o StrictHostKeyChecking=no $username@$server" -NoNewWindow -PassThru -Wait
"@

# Alternative: Use plink-style command with password
Write-Host "Connecting to $server as $username..." -ForegroundColor Green
Write-Host "Password will be sent automatically..." -ForegroundColor Yellow
Write-Host ""

# Use SSH with password via stdin (requires sshpass alternative)
# Since we don't have sshpass on Windows, we'll use a different approach

# Create a temporary batch file to handle the connection
$batchFile = "$env:TEMP\ssh-connect.bat"
@"
@echo off
echo $password | "$env:TEMP\OpenSSH\OpenSSH-Win64\ssh.exe" -o StrictHostKeyChecking=no $username@$server
"@ | Out-File -FilePath $batchFile -Encoding ASCII

Write-Host "Starting SSH session..." -ForegroundColor Cyan
Write-Host "If prompted for password, use: $password" -ForegroundColor Yellow
Write-Host ""

# Execute the SSH command
& "$env:TEMP\OpenSSH\OpenSSH-Win64\ssh.exe" -o StrictHostKeyChecking=no "$username@$server"
