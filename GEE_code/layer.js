// ===== Combined GEE Script: Tibetan Plateau Water Viewer =====
// Created: 20250401_0221_Van

// -------------------- layer.js --------------------
function getLayer(type, year) {
  if (type === 'Glacier Thickness') {
    return ee.Image('FAKE/THICKNESS_' + year).visualize({
      min: -50, max: 0, palette: PALETTE_THICKNESS
    });
  } else if (type === 'NDVI') {
    return ee.Image('FAKE/NDVI_' + year).visualize({
      min: 0, max: 0.8, palette: PALETTE_NDVI
    });
  } else if (type === 'Boundary') {
    return ee.FeatureCollection('FAKE/RGI').style(STYLE_BOUNDARY);
  } else if (type === 'Water') {
    var dataset = ee.ImageCollection("JRC/GSW1_4/YearlyHistory");
    var region = ee.Geometry.Rectangle([78, 26, 104, 39]);
    var image = dataset.filter(ee.Filter.eq('year', year)).mosaic().clip(region);
    var waterMask = image.gte(2).selfMask(); // 仅季节性与永久水体
    return waterMask.visualize({min: 1, max: 1, palette: ['#0000FF']});
  }
}

function updateLeftLayer(type, year) {
  leftMap.layers().reset();
  var layer = getLayer(type, year);
  leftMap.addLayer(layer, {}, type + ' ' + year);
}

function updateRightLayer(type, year) {
  rightMap.layers().reset();
  var layer = getLayer(type, year);
  rightMap.addLayer(layer, {}, type + ' ' + year);
}