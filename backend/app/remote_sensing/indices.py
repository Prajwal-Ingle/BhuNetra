"""
GeoAgri Intelligence - Remote Sensing Indices & Raster Analytics
Implements memory-efficient NDVI, NDWI, and NDMI calculations using NumPy and Rasterio.
Optimized for 8 GB RAM using windowed blocks and vectorized array math.
"""

import numpy as np
from typing import Dict, Any, Tuple

# Sentinel-2 L2A Reflectance Scale Factor (Digital Number to 0.0 - 1.0 Reflectance)
S2_SCALE_FACTOR = 10000.0

def compute_ndvi(nir: np.ndarray, red: np.ndarray, scale: bool = True) -> np.ndarray:
    """
    Computes Normalized Difference Vegetation Index (NDVI).
    NDVI = (NIR - RED) / (NIR + RED)
    Sentinel-2: NIR = Band 8 (842 nm), RED = Band 4 (665 nm).
    Range: [-1.0, 1.0].
    """
    nir_f = nir.astype(np.float32) / (S2_SCALE_FACTOR if scale and nir.max() > 2.0 else 1.0)
    red_f = red.astype(np.float32) / (S2_SCALE_FACTOR if scale and red.max() > 2.0 else 1.0)

    denominator = nir_f + red_f
    # Avoid zero division and mask invalid/negative values
    with np.errstate(divide='ignore', invalid='ignore'):
        ndvi = np.where(denominator > 0.0001, (nir_f - red_f) / denominator, np.nan)
        ndvi = np.clip(ndvi, -1.0, 1.0)
    return ndvi

def compute_ndwi(green: np.ndarray, nir: np.ndarray, scale: bool = True) -> np.ndarray:
    """
    Computes McFeeters Normalized Difference Water Index (NDWI) for surface water body detection.
    NDWI = (GREEN - NIR) / (GREEN + NIR)
    Sentinel-2: GREEN = Band 3 (560 nm), NIR = Band 8 (842 nm).
    Water bodies typically have NDWI > 0.
    """
    green_f = green.astype(np.float32) / (S2_SCALE_FACTOR if scale and green.max() > 2.0 else 1.0)
    nir_f = nir.astype(np.float32) / (S2_SCALE_FACTOR if scale and nir.max() > 2.0 else 1.0)

    denominator = green_f + nir_f
    with np.errstate(divide='ignore', invalid='ignore'):
        ndwi = np.where(denominator > 0.0001, (green_f - nir_f) / denominator, np.nan)
        ndwi = np.clip(ndwi, -1.0, 1.0)
    return ndwi

def compute_ndmi(nir: np.ndarray, swir: np.ndarray, scale: bool = True) -> np.ndarray:
    """
    Computes Normalized Difference Moisture Index (NDMI / Gao NDWI) for crop canopy moisture.
    NDMI = (NIR - SWIR) / (NIR + SWIR)
    Sentinel-2: NIR = Band 8 (842 nm), SWIR = Band 11 (1610 nm).
    Monitors plant water stress and irrigation efficiency.
    """
    nir_f = nir.astype(np.float32) / (S2_SCALE_FACTOR if scale and nir.max() > 2.0 else 1.0)
    swir_f = swir.astype(np.float32) / (S2_SCALE_FACTOR if scale and swir.max() > 2.0 else 1.0)

    denominator = nir_f + swir_f
    with np.errstate(divide='ignore', invalid='ignore'):
        ndmi = np.where(denominator > 0.0001, (nir_f - swir_f) / denominator, np.nan)
        ndmi = np.clip(ndmi, -1.0, 1.0)
    return ndmi

def compute_raster_statistics(raster_array: np.ndarray, valid_mask: np.ndarray = None) -> Dict[str, Any]:
    """
    Calculates summary statistics and vegetation condition classes on a float raster array.
    """
    if valid_mask is not None:
        data = raster_array[valid_mask & ~np.isnan(raster_array)]
    else:
        data = raster_array[~np.isnan(raster_array)]

    if data.size == 0:
        return {
            "count": 0,
            "min": None,
            "max": None,
            "mean": None,
            "std": None,
            "p10": None,
            "p50": None,
            "p90": None,
            "classification": {}
        }

    # Summary metrics
    min_val = float(np.min(data))
    max_val = float(np.max(data))
    mean_val = float(np.mean(data))
    std_val = float(np.std(data))
    p10, p50, p90 = [float(x) for x in np.percentile(data, [10, 50, 90])]

    # Agronomic NDVI Condition Classification
    total_valid = data.size
    water_bare = float(np.sum(data < 0.2) / total_valid * 100.0)
    low_vigor = float(np.sum((data >= 0.2) & (data < 0.4)) / total_valid * 100.0)
    moderate_vigor = float(np.sum((data >= 0.4) & (data < 0.6)) / total_valid * 100.0)
    healthy_vigor = float(np.sum((data >= 0.6) & (data < 0.8)) / total_valid * 100.0)
    dense_vigor = float(np.sum(data >= 0.8) / total_valid * 100.0)

    return {
        "valid_pixel_count": int(total_valid),
        "min": round(min_val, 4),
        "max": round(max_val, 4),
        "mean": round(mean_val, 4),
        "std": round(std_val, 4),
        "p10": round(p10, 4),
        "median": round(p50, 4),
        "p90": round(p90, 4),
        "classification": {
            "water_or_bare_soil_pct": round(water_bare, 2),
            "low_vegetation_pct": round(low_vigor, 2),
            "moderate_vegetation_pct": round(moderate_vigor, 2),
            "healthy_vegetation_pct": round(healthy_vigor, 2),
            "dense_canopy_pct": round(dense_vigor, 2)
        }
    }
