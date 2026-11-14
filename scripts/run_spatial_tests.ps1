# GeoAgri Intelligence - Run Spatial SQL Test Suite
$pgBin = "C:\Users\RDP\pgsql\bin"
$env:PATH = "$pgBin;$env:PATH"

& "$pgBin\psql.exe" -U postgres -p 5432 -d geoagri -f database/queries/04_spatial_operations_test.sql
