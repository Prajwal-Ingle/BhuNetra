"""
GeoAgri Intelligence - Geospatial Data Ingestion & Validation Service
Handles reading, validating, reprojecting and importing vector datasets
into the PostgreSQL / PostGIS spatial database.
"""

import os
import json
import logging
import geopandas as gpd
from shapely.geometry import Polygon, MultiPolygon
from shapely.validation import make_valid
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("GeoDataLoader")

# Database Connection URL (Standard local PostgreSQL instance)
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+psycopg2://postgres@localhost:5432/geoagri")
engine = create_engine(DATABASE_URL, echo=False)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def to_multipolygon(geom):
    """Ensure a geometry is wrapped in a Shapely MultiPolygon."""
    if geom is None:
        return None
    if not geom.is_valid:
        geom = make_valid(geom)
    if isinstance(geom, Polygon):
        return MultiPolygon([geom])
    elif isinstance(geom, MultiPolygon):
        return geom
    else:
        # If geometry collection or other, take polygon parts
        polys = [p for p in getattr(geom, 'geoms', []) if isinstance(p, Polygon)]
        return MultiPolygon(polys) if polys else None

class GeoDataLoader:
    def __init__(self, db_engine=engine):
        self.engine = db_engine

    def validate_and_repair_gdf(self, gdf: gpd.GeoDataFrame, target_srid: int = 4326) -> gpd.GeoDataFrame:
        """Validates geometries in a GeoDataFrame, repairs invalid rings, and reprojects."""
        if gdf.crs is None:
            logger.warning("Input GeoDataFrame has no CRS; assuming EPSG:4326")
            gdf = gdf.set_crs(epsg=4326)
        elif gdf.crs.to_epsg() != target_srid:
            logger.info(f"Reprojecting GeoDataFrame from {gdf.crs} to EPSG:{target_srid}")
            gdf = gdf.to_crs(epsg=target_srid)

        # Repair invalid geometries
        invalid_mask = ~gdf.geometry.is_valid
        invalid_count = invalid_mask.sum()
        if invalid_count > 0:
            logger.warning(f"Detected {invalid_count} invalid geometries. Applying shapely make_valid()...")
            gdf.loc[invalid_mask, 'geometry'] = gdf.loc[invalid_mask, 'geometry'].apply(make_valid)

        return gdf

    def import_districts(self, geojson_path: str):
        """Imports district boundaries into the 'districts' table."""
        logger.info(f"Loading districts from {geojson_path}...")
        gdf = gpd.read_file(geojson_path)
        gdf = self.validate_and_repair_gdf(gdf)
        gdf['geometry'] = gdf['geometry'].apply(to_multipolygon)

        with self.engine.begin() as conn:
            for _, row in gdf.iterrows():
                did = int(row['id'])
                dname = str(row['district_name'])
                sname = str(row['state_name'])
                wkt = row['geometry'].wkt
                conn.execute(text("""
                    INSERT INTO districts (id, district_name, state_name, geometry)
                    VALUES (:id, :district_name, :state_name, ST_Multi(ST_GeomFromText(:wkt, 4326)))
                    ON CONFLICT (district_name, state_name)
                    DO UPDATE SET geometry = EXCLUDED.geometry;
                """), {"id": did, "district_name": dname, "state_name": sname, "wkt": wkt})
            conn.execute(text("SELECT setval('districts_id_seq', (SELECT COALESCE(MAX(id), 1) FROM districts));"))
        logger.info(f"Successfully imported {len(gdf)} districts.")

    def import_villages(self, geojson_path: str):
        """Imports talukas / village administrative boundaries into 'villages'."""
        logger.info(f"Loading talukas/villages from {geojson_path}...")
        gdf = gpd.read_file(geojson_path)
        gdf = self.validate_and_repair_gdf(gdf)
        gdf['geometry'] = gdf['geometry'].apply(to_multipolygon)

        with self.engine.begin() as conn:
            for _, row in gdf.iterrows():
                vid = int(row['id'])
                vname = str(row['village_name'])
                did = int(row['district_id'])
                wkt = row['geometry'].wkt
                conn.execute(text("""
                    INSERT INTO villages (id, village_name, district_id, geometry)
                    VALUES (:id, :village_name, :district_id, ST_Multi(ST_GeomFromText(:wkt, 4326)))
                    ON CONFLICT (id)
                    DO UPDATE SET village_name = EXCLUDED.village_name,
                                  district_id = EXCLUDED.district_id,
                                  geometry = EXCLUDED.geometry;
                """), {"id": vid, "village_name": vname, "district_id": did, "wkt": wkt})
            conn.execute(text("SELECT setval('villages_id_seq', (SELECT COALESCE(MAX(id), 1) FROM villages));"))
        logger.info(f"Successfully imported {len(gdf)} talukas/villages.")

    def import_agricultural_fields(self, geojson_path: str):
        """Imports agricultural cadastral fields with projected UTM metric area."""
        logger.info(f"Loading agricultural fields from {geojson_path}...")
        gdf = gpd.read_file(geojson_path)
        gdf = self.validate_and_repair_gdf(gdf)

        # Calculate exact metric hectares in UTM Zone 44N (EPSG:32644)
        gdf_utm = gdf.to_crs(epsg=32644)
        calculated_ha = (gdf_utm.geometry.area / 10000.0).round(2)
        gdf['area_hectares'] = calculated_ha

        with self.engine.begin() as conn:
            for idx, row in gdf.iterrows():
                fid = int(row['id'])
                fname = str(row['field_name'])
                vid = int(row['village_id'])
                area_ha = float(row['area_hectares'])
                geom = row['geometry']
                if not isinstance(geom, Polygon):
                    geom = Polygon(list(geom.geoms)[0].exterior)
                wkt = geom.wkt
                conn.execute(text("""
                    INSERT INTO agricultural_fields (id, field_name, village_id, area_hectares, geometry)
                    VALUES (:id, :field_name, :village_id, :area_hectares, ST_GeomFromText(:wkt, 4326))
                    ON CONFLICT (id)
                    DO UPDATE SET field_name = EXCLUDED.field_name,
                                  village_id = EXCLUDED.village_id,
                                  area_hectares = EXCLUDED.area_hectares,
                                  geometry = EXCLUDED.geometry;
                """), {"id": fid, "field_name": fname, "village_id": vid, "area_hectares": area_ha, "wkt": wkt})
            conn.execute(text("SELECT setval('agricultural_fields_id_seq', (SELECT COALESCE(MAX(id), 1) FROM agricultural_fields));"))
        logger.info(f"Successfully imported {len(gdf)} agricultural fields.")

    def import_water_sources(self, geojson_path: str):
        """Imports water infrastructure (Rivers, Lakes, Reservoirs, Canals)."""
        logger.info(f"Loading water sources from {geojson_path}...")
        gdf = gpd.read_file(geojson_path)
        gdf = self.validate_and_repair_gdf(gdf)

        with self.engine.begin() as conn:
            for _, row in gdf.iterrows():
                wid = int(row['id'])
                sname = str(row['source_name'])
                stype = str(row['source_type'])
                wkt = row['geometry'].wkt
                conn.execute(text("""
                    INSERT INTO water_sources (id, source_name, source_type, geometry)
                    VALUES (:id, :source_name, :source_type, ST_GeomFromText(:wkt, 4326))
                    ON CONFLICT (id)
                    DO UPDATE SET source_name = EXCLUDED.source_name,
                                  source_type = EXCLUDED.source_type,
                                  geometry = EXCLUDED.geometry;
                """), {"id": wid, "source_name": sname, "source_type": stype, "wkt": wkt})
            conn.execute(text("SELECT setval('water_sources_id_seq', (SELECT COALESCE(MAX(id), 1) FROM water_sources));"))
        logger.info(f"Successfully imported {len(gdf)} water sources.")

    def import_soil_stations(self, geojson_path: str):
        """Imports soil chemistry testing stations."""
        logger.info(f"Loading soil test data from {geojson_path}...")
        gdf = gpd.read_file(geojson_path)
        gdf = self.validate_and_repair_gdf(gdf)

        with self.engine.begin() as conn:
            for _, row in gdf.iterrows():
                sid = int(row['id'])
                loc = str(row['location'])
                stype = str(row['soil_type'])
                ph = float(row['ph'])
                n = float(row['nitrogen'])
                p = float(row['phosphorus'])
                k = float(row['potassium'])
                oc = float(row['organic_carbon'])
                sdate = str(row.get('sampled_date', '2026-09-20'))
                wkt = row['geometry'].wkt
                conn.execute(text("""
                    INSERT INTO soil_data (id, location, soil_type, ph, nitrogen, phosphorus, potassium, organic_carbon, sampled_date, geometry)
                    VALUES (:id, :location, :soil_type, :ph, :nitrogen, :phosphorus, :potassium, :organic_carbon, :sampled_date, ST_GeomFromText(:wkt, 4326))
                    ON CONFLICT (id)
                    DO UPDATE SET ph = EXCLUDED.ph,
                                  nitrogen = EXCLUDED.nitrogen,
                                  phosphorus = EXCLUDED.phosphorus,
                                  potassium = EXCLUDED.potassium,
                                  organic_carbon = EXCLUDED.organic_carbon,
                                  geometry = EXCLUDED.geometry;
                """), {"id": sid, "location": loc, "soil_type": stype, "ph": ph, "nitrogen": n, "phosphorus": p, "potassium": k, "organic_carbon": oc, "sampled_date": sdate, "wkt": wkt})
            conn.execute(text("SELECT setval('soil_data_id_seq', (SELECT COALESCE(MAX(id), 1) FROM soil_data));"))
        logger.info(f"Successfully imported {len(gdf)} soil test stations.")

    def import_weather_stations(self, geojson_path: str):
        """Imports meteorological stations and observations."""
        logger.info(f"Loading weather stations from {geojson_path}...")
        gdf = gpd.read_file(geojson_path)
        gdf = self.validate_and_repair_gdf(gdf)

        with self.engine.begin() as conn:
            for _, row in gdf.iterrows():
                wid = int(row['id'])
                odate = str(row['observation_date'])
                temp = float(row['temperature'])
                rain = float(row['rainfall'])
                hum = float(row['humidity'])
                wkt = row['geometry'].wkt
                conn.execute(text("""
                    INSERT INTO weather_data (id, observation_date, temperature, rainfall, humidity, geometry)
                    VALUES (:id, :observation_date, :temperature, :rainfall, :humidity, ST_GeomFromText(:wkt, 4326))
                    ON CONFLICT (id)
                    DO UPDATE SET temperature = EXCLUDED.temperature,
                                  rainfall = EXCLUDED.rainfall,
                                  humidity = EXCLUDED.humidity,
                                  geometry = EXCLUDED.geometry;
                """), {"id": wid, "observation_date": odate, "temperature": temp, "rainfall": rain, "humidity": hum, "wkt": wkt})
            conn.execute(text("SELECT setval('weather_data_id_seq', (SELECT COALESCE(MAX(id), 1) FROM weather_data));"))
        logger.info(f"Successfully imported {len(gdf)} weather station records.")

    def import_all(self, vectors_dir: str):
        """Executes full batch ingestion of all vector layers."""
        self.import_districts(os.path.join(vectors_dir, "districts.geojson"))
        self.import_villages(os.path.join(vectors_dir, "talukas_villages.geojson"))
        self.import_agricultural_fields(os.path.join(vectors_dir, "agricultural_fields.geojson"))
        self.import_water_sources(os.path.join(vectors_dir, "water_sources.geojson"))
        self.import_soil_stations(os.path.join(vectors_dir, "soil_stations.geojson"))
        self.import_weather_stations(os.path.join(vectors_dir, "weather_stations.geojson"))
        logger.info("All layers ingested successfully into PostGIS.")

if __name__ == "__main__":
    vdir = os.path.join(os.path.dirname(__file__), "..", "..", "..", "data", "vectors")
    loader = GeoDataLoader()
    loader.import_all(vdir)
