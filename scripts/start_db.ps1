# GeoAgri Intelligence - Start PostgreSQL + PostGIS Server
param(
    [string]$Port = "5432"
)

$pgBin = "C:\Users\RDP\pgsql\bin"
$pgData = "C:\Users\RDP\pgsql\data"
$env:GDAL_DATA = "C:\Users\RDP\pgsql\gdal-data"
$env:PATH = "$pgBin;$env:PATH"

Write-Host "Checking PostgreSQL status on port $Port..."
$status = & "$pgBin\pg_ctl.exe" -D $pgData status 2>&1
if ($status -like "*server is running*") {
    Write-Host "PostgreSQL is already running."
} else {
    Write-Host "Starting PostgreSQL server..."
    & "$pgBin\pg_ctl.exe" -D $pgData -l "$pgData\server.log" -o "-p $Port" start
    Start-Sleep -Seconds 2
    Write-Host "PostgreSQL server started successfully."
}
