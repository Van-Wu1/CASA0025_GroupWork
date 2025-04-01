// ========== LAYER HANDLERS ==========

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
  
  function getLayer(type, year) {
    if (type === 'Glacier Thickness') {
      return ee.Image('FAKE/THICKNESS_' + year).visualize({
        min: -50, max: 0,
        palette: ['blue', 'white', 'red']
      });
    } else if (type === 'NDVI') {
      return ee.Image('FAKE/NDVI_' + year).visualize({
        min: 0, max: 0.8,
        palette: ['brown', 'green']
      });
    } else if (type === 'Boundary') {
      return ee.FeatureCollection('FAKE/RGI').style({
        color: 'black'
      });
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
  
  function getLayer(type, year) {
    if (type === 'Glacier Thickness') {
      return ee.Image('FAKE/THICKNESS_' + year).visualize({
        min: -50, max: 0,
        palette: PALETTE_THICKNESS
      });
    } else if (type === 'NDVI') {
      return ee.Image('FAKE/NDVI_' + year).visualize({
        min: 0, max: 0.8,
        palette: PALETTE_NDVI
      });
    } else if (type === 'Boundary') {
      return ee.FeatureCollection('FAKE/RGI').style(STYLE_BOUNDARY);
    }
  }
  