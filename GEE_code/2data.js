// ===== data.js =====
// ========== DATASET LOADER & FILTERS ==========
// shp data
var defaultRegion = ee.FeatureCollection("projects/casa0025geeappglaicier/assets/boundary/zone_clip"); 
var boroughRegion = ee.FeatureCollection("projects/casa0025geeappglaicier/assets/boundary/boundary_clip");
var boroughStyledOutline = boroughRegion.style({
  color: '#555555',
  fillColor: '#00000000', 
  width: 0.8
});
var boroughStyledContent = boroughRegion.style({
  color: '#00000000',
  fillColor: '#ffeda040',
  width: 0
});

// Sample area conflict determination data
var reservation = ee.FeatureCollection ('projects/vanwu1/assets/reser_zone') // Protected area
var TPboundary = ee.FeatureCollection ('projects/vanwu1/assets/influ_in_TB') //glacier influence shp 
var TP_landcover = ee.ImageCollection('ESA/WorldCover/v100').first().clip(TPboundary) //ESA landcover data
var eco_zone = ee.Image('users/ixizroiesxi/Slefixed') // Ecological assessment data
var built_up = TP_landcover.select('Map').eq(50); // urban 
var cropland = TP_landcover.select('Map').eq(40); // agri
var conflict_urban = built_up.and(eco_zone) // Take the intersection of the ecological area and the built-up area
var conflict_cropland = cropland.and(eco_zone) // Take the intersection of the ecological area and the agricultural area
var conflict_urban_layer = conflict_urban.updateMask(conflict_urban);
var conflict_cropland_layer = conflict_cropland.updateMask(conflict_cropland);


// data import (section1)
function getGlacierElevation(year) {
  var assetPath = 'users/ixizroiesxi/glacier_sum/glacier_changes_' + year + '_3band';
  var image = ee.Image(assetPath)
                .select('b1') 
                .clip(defaultRegion);
  return image;
}

function getTempByYear(year) {
  var assetPath = 'projects/casa0025geeappglaicier/assets/temperature/temp_' + year;
  return ee.Image(assetPath).clip(defaultRegion);
}

function getNDVIImageByYear(year) {
  var assetPath = 'projects/casa0025geeappglaicier/assets/NDVI/NDVI_' + year;
  return ee.Image(assetPath).clip(defaultRegion);
}

function getWaterbodyByYear(year) {
  var image = ee.ImageCollection("JRC/GSW1_4/YearlyHistory")
    .filter(ee.Filter.eq('year', year))
    .mosaic()
    .clip(boroughRegion);
  return image.gte(2).selfMask(); // Seasonal and permanent water bodies
}