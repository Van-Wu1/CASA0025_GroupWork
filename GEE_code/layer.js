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
  } else if (type === 'water') {
    return null;
  }
}

function updateLeftLayer(type, year) {
  leftMap.layers().reset();
  var layer = getLayer(type, year);
  if (layer) {
    leftMap.addLayer(layer, {}, type + ' ' + year);
    updateLegend(type, leftLegend);
  }
}

function updateRightLayer(type, year) {
  rightMap.layers().reset();
  var layer = getLayer(type, year);
  if (layer) {
    rightMap.addLayer(layer, {}, type + ' ' + year);
    updateLegend(type, rightLegend);
  }
}
// ===== [Xinyi Zeng] End =====

