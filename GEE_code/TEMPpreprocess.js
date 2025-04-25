// Install dependencies 
// pip install geopandas rasterio rioxarray xarray matplotlib
// Import libraries 
// import geopandas as gpd
// import rioxarray as rxr
// import xarray as xr
// import os

// Set file paths 
var temp_dir = "E:/Documents/UCL/bigData/data/processed_temperature_data";
var shp_path = "E:/Documents/UCL/bigData/data/ana_zone/zone_clip.shp";
var output_dir = "E:/Documents/UCL/bigData/data/final_temp_output";
// os.makedirs(output_dir, exist_ok=True);

// Read Tibetan Plateau boundary shapefile
// var tibet = gpd.read_file(shp_path);
var tibet = shp_path; // Placeholder: in real Python environment

// tibet = tibet.to_crs("EPSG:4326");  // Ensure coordinate system is WGS84
// Loop through TIF files from 1997 to 2014
for (var year = 1997; year <= 2014; year++) {
    var tif_path = temp_dir + "/annual_temp_" + year + ".tif";
    console.log("Processing year " + year + " file: " + tif_path);

    // Read temperature data
    // var temp = rxr.open_rasterio(tif_path, masked=True).squeeze();
    // Write spatial reference system (if not already set)
    // temp.rio.write_crs("EPSG:4326", inplace=True);
    // Clip to Tibetan Plateau boundary
    // var clipped = temp.rio.clip(tibet.geometry, tibet.crs, drop=true);
    // Output file path
    var output_path = output_dir + "/tibet_temp_" + year + ".tif";
    // clipped.rio.to_raster(output_path);

    console.log("✅ Output completed: " + output_path);
}

// Import rasterio library 
// import rasterio

// Replace with your file path
var file_path = "E:/Documents/UCL/bigData/data/final_temp_output/tibet_temp_1997.tif";

// Open the raster file (simulated, actual open is in Python)
// with rasterio.open(file_path) as src:
console.log("Filename:", file_path);
// console.log("Image width (pixels):", src.width);
// console.log("Image height (pixels):", src.height);
// console.log("Number of bands:", src.count);
// console.log("Data type:", src.dtypes);
// console.log("Coordinate Reference System (CRS):", src.crs);
// console.log("Affine transformation matrix (for spatial referencing):", src.transform);
// console.log("Bounding box:", src.bounds);
// console.log("NoData value:", src.nodata);
// console.log("Resolution (degrees):", src.res);
// Import xarray library (commented out for JS)
// import xarray as xr

// Open dataset using rasterio engine
// var ds = xr.open_dataset(file_path, {engine: 'rasterio'});
console.log(file_path); // Placeholder for dataset opening
// console.log(ds);

// Get specific variable's data type and range
// console.log("Data type:", ds['band_data'].dtype);
// console.log("Minimum value:", ds['band_data'].min().values);
// console.log("Maximum value:", ds['band_data'].max().values);
// pip install xarray rioxarray geopandas rasterio tqdm
//!pip install pydap

//import os
//import glob
//import rioxarray
//import geopandas as gpd
//import numpy as np
//from tqdm import tqdm
//import xarray as xr

// Set path
var base_dir = "E:/Documents/UCL/bigData/data/TMP14_20/15_20";
var tmin_dirs = [
    base_dir + "/wc2.1_cruts4.06_2.5m_tmin_2010-2019",
    base_dir + "/wc2.1_cruts4.06_2.5m_tmin_2020-2021"
];
var tmax_dirs = [
    base_dir + "/wc2.1_cruts4.06_2.5m_tmax_2010-2019",
    base_dir + "/wc2.1_cruts4.06_2.5m_tmax_2020-2021"
];

var shapefile_path = "E:/Documents/UCL/bigData/data/ana_zone/zone_clip.shp";
var output_dir = base_dir + "/annual_mean_temp";
// os.makedirs(output_dir, exist_ok=True);

// Read vector shapefile
// var region = gpd.read_file(shapefile_path).to_crs("EPSG:4326");
var region = shapefile_path; // Placeholder

// Set years to process
var years = [2015, 2016, 2017, 2018, 2019, 2020];

for (var y = 0; y < years.length; y++) {
    var year = years[y];
    var tmin_files = [];
    var tmax_files = [];
    
    // Get tmin and tmax files for each month
    for (var m = 1; m <= 12; m++) {
        var month_str = year + "-" + (m < 10 ? "0" + m : m);
        
        for (var i = 0; i < tmin_dirs.length; i++) {
            var tdir = tmin_dirs[i];
            // var match = glob.glob(os.path.join(tdir, "*" + month_str + ".tif"));
            // if (match) {
            //     tmin_files.push(match[0]);
            //     break;
            // }
        }
        for (var j = 0; j < tmax_dirs.length; j++) {
            var tdir2 = tmax_dirs[j];
            // var match = glob.glob(os.path.join(tdir2, "*" + month_str + ".tif"));
            // if (match) {
            //     tmax_files.push(match[0]);
            //     break;
            // }
        }
    }

    // Check if all months are available
    // if (tmin_files.length !== 12 || tmax_files.length !== 12) {
    //     console.log("❌ Missing some monthly data for year " + year);
    //     continue;
    // }

    // Monthly average synthesis
    var monthly_tmean = [];
    // for (var idx = 0; idx < tmin_files.length; idx++) {
    //     var tmin_fp = tmin_files[idx];
    //     var tmax_fp = tmax_files[idx];
    //     var tmin = rioxarray.open_rasterio(tmin_fp).squeeze();
    //     var tmax = rioxarray.open_rasterio(tmax_fp).squeeze();
    //     var tmean = (tmin + tmax) / 2;
    //     monthly_tmean.push(tmean);
    // }

    // Merge 12 months and calculate annual mean
    // var stack = xr.concat(monthly_tmean, dim="month");
    // var annual_mean = stack.mean(dim="month");

    // Set spatial reference
    // annual_mean.rio.set_spatial_dims("x", "y", inplace=true);
    // annual_mean.rio.write_crs("EPSG:4326", inplace=true);

    // Clip
    // var clipped = annual_mean.rio.clip(region.geometry, region.crs, drop=true);

    // Output TIFF
    var out_path = output_dir + "/annual_temp_" + year + ".tif";
    // clipped.rio.to_raster(out_path);

    console.log("✅ Annual mean temperature exported for " + year + ": " + out_path);
}

// Set file path
var file_path = "E:/Documents/UCL/bigData/data/TMP14_20/15_20/annual_mean_temp/annual_temp_2015.tif";

// Open the raster file (simulated, actual open is in Python)
// with rasterio.open(file_path) as src:
console.log("Filename:", file_path);
// console.log("Image width (pixels):", src.width);
// console.log("Image height (pixels):", src.height);
// console.log("Number of bands:", src.count);
// console.log("Data type:", src.dtypes);
// console.log("Coordinate Reference System (CRS):", src.crs);
// console.log("Affine transformation matrix (for spatial referencing):", src.transform);
// console.log("Bounding box:", src.bounds);
// console.log("NoData value:", src.nodata);
// console.log("Resolution (degrees):", src.res);
