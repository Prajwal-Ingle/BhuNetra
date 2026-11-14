import sys
import shapely
import geopandas
import rasterio
import pyproj
import sqlalchemy
import geoalchemy2
import fastapi
import sklearn
import psycopg2

print("=== PYTHON GEOSPATIAL ENVIRONMENT VERIFICATION ===")
print(f"Python: {sys.version.split()[0]}")
print(f"Shapely: {shapely.__version__}")
print(f"GeoPandas: {geopandas.__version__}")
print(f"Rasterio: {rasterio.__version__}")
print(f"PyProj: {pyproj.__version__}")
print(f"SQLAlchemy: {sqlalchemy.__version__}")
print(f"GeoAlchemy2: {geoalchemy2.__version__}")
print(f"Psycopg2: {psycopg2.__version__}")
print(f"Scikit-learn: {sklearn.__version__}")
print(f"FastAPI: {fastapi.__version__}")
print("ALL CORE GEOSPATIAL & ML LIBRARIES VERIFIED!")
