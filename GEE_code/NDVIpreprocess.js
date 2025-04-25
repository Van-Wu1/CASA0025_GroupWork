// import mask shp file
var table = ee.FeatureCollection("projects/ee-ethanhu1823/assets/zone_clip");

// function
var processYear = function(year) {
  var startDate = ee.Date.fromYMD(year, 1, 1);
  var endDate = ee.Date.fromYMD(year, 12, 31);

  // calculate NDVI and generalize
  var ndvi = ee.ImageCollection('MODIS/061/MOD13A2')
    .filterDate(startDate, endDate)
    .select('NDVI')
    .mean()
    .divide(8000) 
    .clip(table);

  // export to Google Drive
  Export.image.toDrive({
    image: ndvi,
    description: 'NDVI_' + year,
    folder: 'NDVI_exports_zone',
    fileNamePrefix: 'NDVI_' + year,
    region: table.geometry(),
    scale: 500,
    crs: 'EPSG:4326',
    maxPixels: 1e13
  });

  // visualize(The final effect is modified in style.js and layer.js)
  var visParams = {
    min: 0,
    max: 1,
    palette: ['white', '#d9f0a3', '#addd8e', '#78c679', '#41ab5d', '#238443']
  };

 
  Map.addLayer(ndvi, visParams, 'NDVI_' + year);
};


var years = ee.List.sequence(2000, 2024);

// Iterate through each year
years.getInfo().forEach(function(year) {
  processYear(year);
});
//run the task and download GeoTIFF file in google drive