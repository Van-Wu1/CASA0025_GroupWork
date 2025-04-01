// ===== layer.js =====
// ========== LAYER HANDLERS ==========

// ===== [Xinyi Zeng] Begin: LAYER LOGIC =====
function getLayer(type, year) {
  if (type === 'Glacier Thickness') {
    return null; // Not implemented yet
  } else if (type === 'NDVI') {
    var ndviImg = getNDVIImageByYear(year);
    return ndviImg.visualize({ min: 0, max: 0.8, palette: PALETTE_NDVI });
  } else if (type === 'Boundary') {
    var boundary = getGlacierBoundary();
    return boundary.style(STYLE_BOUNDARY);
// ===== [Yifan Wu] Begin: LAYER ADd and Edit =====
  } else if (type === 'WaterBody') {
    var waterImg = getWaterbodyByYear(year);
    return waterImg.visualize({
      min: 1, max: 1, palette: PALETTE_WATER});
  }
  // ===== [Yifan Wu] End =====
}


function updateLeftLayer(type, year) {
  leftMap.layers().reset();
  var layer = getLayer(type, year);
  if (layer) {
    leftMap.addLayer(layer, {}, type + ' ' + year);
  } else {
    print(' 图层类型 "' + type + '" 暂无数据，仅为示例');
  }
}

function updateRightLayer(type, year) {
  rightMap.layers().reset();
  var layer = getLayer(type, year);
  if (layer) {
    rightMap.addLayer(layer, {}, type + ' ' + year);
  } else {
    print(' 图层类型 "' + type + '" 暂无数据，仅为示例');
  }
}
// ===== [Xinyi Zeng] End =====

