// Import xarray library (commented out for JS)
// import xarray as xr

// Open netCDF file
// var ds = xr.open_dataset("data/tmp_1999.nc");

// View all variables
// console.log(ds);

// If the variable is called "temperature" or "temp", you can extract it like this
// var temp = ds['tmp'];  // or ds['temp']
// console.log(temp);

// Simple plot
// temp.isel(time=0).plot();  // Take data from the first time point


// Batch process temperature NC files
// Process files based on naming format tmp_[start_year]_[end_year].nc

// import xarray as xr
// import numpy as np
// import pandas as pd
// import rioxarray
// import datetime
// import os
// import glob
// import re
// import tqdm
// import dask

// Set Dask config to handle large files
// dask.config.set({"array.slicing.split_large_chunks": True});

// Extract years from filename
function extract_years_from_filename(filename) {
    // Extract year information from the filename
    console.log("Extracting years from filename: " + filename);
    
    // Match format: tmp_1997_1999.nc
    // var match = re.search(r'tmp_(\\d{4})_(\\d{4})\\.nc', os.path.basename(filename));
    // if (match) {
    //     var start_year = parseInt(match.group(1));
    //     var end_year = parseInt(match.group(2));
    //     console.log("Extracted years: " + start_year + "-" + end_year);
    //     return [start_year, end_year];
    // } else {
    //     var alt_match = re.search(r'(\\d{4})[-_](\\d{4})', os.path.basename(filename));
    //     if (alt_match) {
    //         var start_year = parseInt(alt_match.group(1));
    //         var end_year = parseInt(alt_match.group(2));
    //         console.log("Using alternative extraction: " + start_year + "-" + end_year);
    //         return [start_year, end_year];
    //     } else {
    //         console.log("Warning: Cannot extract years, using default 2000-2002");
    //         return [2000, 2002];
    //     }
    // }
}

// Process a single NC file and output GeoTIFF
function process_nc_file(file_path, output_dir) {
    console.log("Processing file: " + file_path);

    // Extract years
    var start_year, end_year;
    // [start_year, end_year] = extract_years_from_filename(file_path);
    var period = start_year + "-" + end_year;
    console.log("Processing period: " + period);

    // Try to open large .nc files using xarray and dask
    // try {
    //     var ds = xr.open_dataset(file_path, {chunks: {time: 1, lat: 1000, lon: 1000}});
    //     console.log("Dataset dimensions:", ds.dims);
    //     console.log("Data variables:", Object.keys(ds.data_vars));
    //     console.log("Coordinates:", Object.keys(ds.coords));
    //     if ('tmp' in ds.data_vars) {
    //         console.log("Temperature shape:", ds.tmp.shape);
    //         console.log("Temperature dtype:", ds.tmp.dtype);
    //         if (ds.tmp.attrs) {
    //             console.log("Temperature attributes:", ds.tmp.attrs);
    //         }
    //     }
    // } catch (e) {
    //     console.log("Error reading file: " + e);
    //     console.log("Trying to read without chunking...");
    //     var ds = xr.open_dataset(file_path);
    //     console.log("Successfully read. Dimensions:", ds.dims);
    // }

    // Ensure output directory exists
    // os.makedirs(output_dir, {exist_ok: true});

    // Convert temperature units from 0.1°C to °C
    // if ('tmp' in ds.data_vars) {
    //     console.log("Converting units from 0.1°C to °C");
    //     ds['tmp'] = ds['tmp'] / 10.0;
    // }

    // Set spatial dimensions
    console.log("Setting spatial dimensions: lon->x, lat->y");
    // ds = ds.rename({'lon': 'x', 'lat': 'y'});
    // ds.rio.set_spatial_dims({x_dim: 'x', y_dim: 'y'});
    // ds.rio.write_crs("EPSG:4326");

    // Time dimension handling
    // if ('time' in ds.dims) {
    //     var time_dim = ds.time;
    //     var n_months = time_dim.length;
    //     console.log("Time dimension includes " + n_months + " months");

    //     var dates = [];
    //     var year = start_year;
    //     var month = 1;
    //     for (var i = 0; i < n_months; i++) {
    //         dates.push(new Date(year, month-1, 1));
    //         month += 1;
    //         if (month > 12) {
    //             month = 1;
    //             year += 1;
    //         }
    //     }
    //     if (!ds.time.values[0].year) {
    //         ds = ds.assign_coords({time: dates});
    //     }
    // }
}
// Calculate annual mean temperature
console.log("Calculating annual mean temperature...");
// try {
//     var annual_mean = ds.groupby("time.year").mean();

//     for (var y = 0; y < annual_mean.year.values.length; y++) {
//         var year = annual_mean.year.values[y];
//         var year_data = annual_mean.sel({year: year});
//         var output_file = output_dir + "/annual_temp_" + year + ".tif";
//         console.log("Saving annual mean temperature: " + output_file);
//         year_data.tmp.rio.to_raster(output_file);
//     }
// } catch (e) {
//     console.log("Error calculating annual mean:", e);
//     console.log("Trying simplified method...");

//     var years = [start_year, start_year + 1, start_year + 2];
//     for (var i = 0; i < 3; i++) {
//         if (i*12 < ds.time.length && (i+1)*12 <= ds.time.length) {
//             var year_data = ds.isel({time: [i*12, (i+1)*12]}).mean('time');
//             var output_file = output_dir + "/annual_temp_" + years[i] + ".tif";
//             console.log("Saving simplified annual mean: " + output_file);
//             year_data.tmp.rio.to_raster(output_file);
//         }
//     }
// }

// Calculate period mean
// var period_mean = ds.mean('time');
// var output_file = output_dir + "/period_mean_" + period + ".tif";
// console.log("Saving period mean temperature: " + output_file);
// period_mean.tmp.rio.to_raster(output_file);

// Calculate seasonal means
console.log("Calculating seasonal means...");
// try {
//     var seasons = {
//         'spring': [3, 4, 5],
//         'summer': [6, 7, 8],
//         'autumn': [9, 10, 11],
//         'winter': [12, 1, 2]
//     };
//     for (var season_name in seasons) {
//         var season_months = seasons[season_name];
//         var season_data = ds.sel({time: ds.time.dt.month.isin(season_months)});
//         if (season_data.time.length > 0) {
//             var season_mean = season_data.mean('time');
//             var output_file = output_dir + "/" + season_name + "_" + period + ".tif";
//             console.log("Saving seasonal mean: " + output_file);
//             season_mean.tmp.rio.to_raster(output_file);
//         } else {
//             console.log("Warning: No data for " + season_name);
//         }
//     }
// } catch (e) {
//     console.log("Error calculating seasonal mean:", e);
// }

// Calculate temperature extremes
console.log("Calculating temperature extremes...");
// try {
//     var temp_max = ds.max('time');
//     var temp_min = ds.min('time');

//     var output_file = output_dir + "/temp_max_" + period + ".tif";
//     console.log("Saving maximum temperature: " + output_file);
//     temp_max.tmp.rio.to_raster(output_file);

//     output_file = output_dir + "/temp_min_" + period + ".tif";
//     console.log("Saving minimum temperature: " + output_file);
//     temp_min.tmp.rio.to_raster(output_file);
// } catch (e) {
//     console.log("Error calculating extremes:", e);
// }

// Calculate near 0°C areas
console.log("Calculating near 0°C isotherm area...");
// try {
//     var zero_isotherm = np.abs(period_mean.tmp) < 0.5;
//     var output_file = output_dir + "/zero_isotherm_" + period + ".tif";
//     zero_isotherm = period_mean.tmp.copy({data: zero_isotherm.astype('float32')});
//     zero_isotherm.rio.to_raster(output_file);
// } catch (e) {
//     console.log("Error calculating 0°C isotherm:", e);
// }

// Function to batch process all NC files
function batch_process_nc_files(input_dir, output_dir) {
    // Find all NC files
    // var nc_files = glob.glob(os.path.join(input_dir, "tmp_*.nc"));
    
    console.log("Found NC files in " + input_dir);
    
    // Process each file
    var periods = [];
    // for (var i = 0; i < nc_files.length; i++) {
    //     var file_path = nc_files[i];
    //     var period = process_nc_file(file_path, output_dir);
    //     periods.push(period);
    // }

    // Generate trend assets list if needed
    // if (periods.length > 1) {
    //     console.log("Generating long-term temperature trend assets...");
    //     var trend_asset_list = output_dir + "/trend_assets.txt";
    //     var f = open(trend_asset_list, "w");
    //     for (var p = 0; p < periods.length; p++) {
    //         f.write("projects/your-project-id/assets/temperature/period_mean_" + periods[p] + "\\n");
    //     }
    //     f.close();
    // }
}

// Main function
// if (__name__ == "__main__") {
    var input_dir = "data";  // Directory containing NC files
    var output_dir = "processed_temperature_data";  // Directory to save outputs

    batch_process_nc_files(input_dir, output_dir);

    console.log("Generating GEE upload script...");
    var upload_script = output_dir + "/upload_to_gee.sh";
    // var f = open(upload_script, "w");
    // f.write("#!/bin/bash\\n\\n");
    // f.write("# Script to upload processed temperature data to GEE\\n\\n");
    // var tif_files = glob.glob(os.path.join(output_dir, "*.tif"));
    // for (var i = 0; i < tif_files.length; i++) {
    //     var tif_file = tif_files[i];
    //     var base_name = os.path.basename(tif_file).replace(".tif", "");
    //     var asset_id = "projects/ee-queercyy1/assets/CASA0025_temperature/" + base_name;
    //     f.write("earthengine upload image --asset_id=" + asset_id + " \"" + tif_file + "\"\\n");
    // }
    // f.close();
    console.log("Upload script generated: " + upload_script);
    console.log("Please ensure Earth Engine CLI is installed and authorized.");
// }


// import os

// Change to your actual absolute local path
var base_path = "C:/Users/ASUS/Documents/CASA/CASA0025/processed_temperature_data";

// Original .sh file path
var input_file = "processed_temperature_data/upload_to_gee.sh";
// Output new file
var output_file = "processed_temperature_data/upload_to_gee_absolute.sh";

// Read the input shell script
// var f = open(input_file, "r", {encoding: "utf-8"});
// var lines = f.readlines();
// f.close();

var new_lines = [];
// for (var i = 0; i < lines.length; i++) {
//     var line = lines[i];
//     if (line.includes("processed_temperature_data/")) {
//         var start = line.indexOf("processed_temperature_data/");
//         var end = line.indexOf(".tif", start) + 4;
//         var relative_path = line.substring(start, end);
//         var filename = os.path.basename(relative_path);
//         var absolute_path = base_path + "/" + filename;
//         absolute_path = absolute_path.replace(/\\\\/g, "/");
//         var new_line = line.replace(relative_path, absolute_path);
//         new_lines.push(new_line);
//     } else {
//         new_lines.push(line);
//     }
// }

// Write new shell script
// var f = open(output_file, "w", {encoding: "utf-8"});
// f.writelines(new_lines);
// f.close();

console.log("✅ New script generated: " + output_file);
