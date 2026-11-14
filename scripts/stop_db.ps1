# GeoAgri Intelligence - Stop PostgreSQL + PostGIS Server
$pgBin = "C:\Users\RDP\pgsql\bin"
$pgData = "C:\Users\RDP\pgsql\data"
$env:PATH = "$pgBin;$env:PATH"

Write-Host "Stopping PostgreSQL server..."
& "$pgBin\pg_ctl.exe" -D $pgData stop -m fast
Write-Host "PostgreSQL server stopped."
