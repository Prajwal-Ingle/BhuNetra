"""
GeoAgri Intelligence - Remote Sensing Processing Pipeline
Executes windowed raster loading, NDVI/NDWI calculation, geometric masking/clipping,
zonal statistics extraction, and colormapped web map overlay generation.
Strictly optimized for 8 GB RAM using Rasterio block windows.
"""

import os
import logging
import numpy as np
import rasterio
from rasterio.mask import mask
import matplotlib.pyplot as plt
import matplotlib.colors as mcolors
from PIL import Image

from .indices import compute_ndvi, compute_ndwi, compute_ndmi, compute_raster_statistics
from .sentinel2 import Sentinel2SceneManager

logger = logging.getLogger("RasterProcessor")

RASTERS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "..", "data", "rasters")
EXPORTS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "..", "data", "exports")
os.makedirs(RASTERS_DIR, exist_ok=True)
os.makedirs(EXPORTS_DIR, exist_ok=True)

class RasterProcessor:
    """End-to-end multispectral raster processing engine."""

    @classmethod
    def process_scene_indices(cls, scene_meta: dict, bands: dict) -> dict:
        """
        Computes NDVI and NDWI rasters for an entire Sentinel-2 scene using
        memory-efficient windowed processing and writes GeoTIFF outputs.
        """
        scene_id = scene_meta["scene_id"]
        logger.info(f"Processing vegetation indices for scene: {scene_id}...")

        b04_path = bands["B04"] # Red
        b08_path = bands["B08"] # NIR
        b03_path = bands["B03"] # Green

        ndvi_out_path = os.path.join(RASTERS_DIR, f"ndvi_{scene_id}.tif")
        ndwi_out_path = os.path.join(RASTERS_DIR, f"ndwi_{scene_id}.tif")

        with rasterio.open(b08_path) as src_nir, \
             rasterio.open(b04_path) as src_red, \
             rasterio.open(b03_path) as src_green:

            profile = src_nir.profile.copy()
            profile.update(
                dtype="float32",
                nodata=-9999.0,
                compress="lzw",
                tiled=True
            )

            # Windowed block processing to maintain low memory footprint (< 100MB RAM)
            with rasterio.open(ndvi_out_path, "w", **profile) as dst_ndvi, \
                 rasterio.open(ndwi_out_path, "w", **profile) as dst_ndwi:

                for _, window in src_nir.block_windows(1):
                    nir_block = src_nir.read(1, window=window)
                    red_block = src_red.read(1, window=window)
                    green_block = src_green.read(1, window=window)

                    ndvi_block = compute_ndvi(nir_block, red_block)
                    ndwi_block = compute_ndwi(green_block, nir_block)

                    # Mask nodata
                    ndvi_block = np.nan_to_num(ndvi_block, nan=-9999.0)
                    ndwi_block = np.nan_to_num(ndwi_block, nan=-9999.0)

                    dst_ndvi.write(ndvi_block.astype(np.float32), 1, window=window)
                    dst_ndwi.write(ndwi_block.astype(np.float32), 1, window=window)

        logger.info(f"Generated index rasters:\n  NDVI: {ndvi_out_path}\n  NDWI: {ndwi_out_path}")

        # Compute summary statistics on the generated rasters
        with rasterio.open(ndvi_out_path) as src:
            ndvi_data = src.read(1)
            valid_mask = (ndvi_data != -9999.0)
            stats = compute_raster_statistics(ndvi_data, valid_mask)

        # Generate Web-Ready PNG Overlays for Leaflet
        ndvi_png_path = cls.render_colormapped_png(ndvi_out_path, colormap="RdYlGn", vmin=-0.2, vmax=0.85)
        ndwi_png_path = cls.render_colormapped_png(ndwi_out_path, colormap="Blues", vmin=-0.5, vmax=0.5)

        return {
            "scene_id": scene_id,
            "acquisition_date": scene_meta["acquisition_date"],
            "ndvi_raster": ndvi_out_path,
            "ndwi_raster": ndwi_out_path,
            "ndvi_overlay_png": ndvi_png_path,
            "ndwi_overlay_png": ndwi_png_path,
            "statistics": stats
        }

    @classmethod
    def render_colormapped_png(cls, raster_path: str, colormap: str = "RdYlGn", vmin: float = -0.2, vmax: float = 0.85) -> str:
        """
        Renders a georeferenced raster into a transparent RGBA PNG overlay
        specifically styled for interactive Leaflet and OpenStreetMap map overlays.
        """
        png_out_path = raster_path.replace(".tif", ".png")
        with rasterio.open(raster_path) as src:
            data = src.read(1)
            nodata = src.nodata

        # Create masked array
        if nodata is not None:
            masked_data = np.ma.masked_equal(data, nodata)
        else:
            masked_data = np.ma.masked_invalid(data)

        # Normalize to 0-1
        norm = mcolors.Normalize(vmin=vmin, vmax=vmax, clip=True)
        cmap = plt.get_cmap(colormap)

        # Color mapping with RGBA (0.0 to 1.0)
        rgba = cmap(norm(masked_data))

        # Make nodata and water/masked pixels transparent
        rgba[masked_data.mask, 3] = 0.0

        # Convert to 8-bit image and save
        img_array = (rgba * 255).astype(np.uint8)
        img = Image.fromarray(img_array, mode="RGBA")
        img.save(png_out_path, "PNG", optimize=True)

        logger.info(f"Rendered transparent map overlay: {png_out_path}")
        return png_out_path

    @classmethod
    def extract_field_zonal_stats(cls, raster_path: str, field_geojson_geom: dict) -> dict:
        """
        Extracts zonal vegetation statistics for an individual agricultural field polygon
        by geometrically clipping the raster using rasterio.mask.
        """
        with rasterio.open(raster_path) as src:
            try:
                out_image, _ = mask(src, [field_geojson_geom], crop=True, nodata=-9999.0)
                field_pixels = out_image[0]
                valid_mask = (field_pixels != -9999.0) & ~np.isnan(field_pixels)
                return compute_raster_statistics(field_pixels, valid_mask)
            except Exception as e:
                logger.error(f"Error clipping raster to field geometry: {e}")
                return {"mean": None, "valid_pixel_count": 0}

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    scenes = Sentinel2SceneManager.ensure_scenes_ready()
    for s in scenes:
        result = RasterProcessor.process_scene_indices(s["metadata"], s["bands"])
        print(f"Processed {s['metadata']['scene_id']}: Mean NDVI = {result['statistics']['mean']}")
