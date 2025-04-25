// ===== layer.js =====

// ===== [Xinyi Zeng] Begin: LAYER LOGIC =====
// ===== [Yifan Wu] Synchronization of dual map layers =====
function getLayer(type, year) {
  if (type === 'Glacier') {
    return null;
  } else if (type === 'NDVI') {
    var ndviImg = getNDVIImageByYear(year);
    return ndviImg.visualize({ min: 0, max: 0.8, palette: PALETTE_NDVI });
  } else if (type === 'Temperature') {
    var tempImg = getTempByYear(year);
    return tempImg.visualize({ min: 0, max: 0.8, palette: PALETTE_NDVI });
// ===== [Yifan Wu] Begin: LAYER ADd and Edit =====
  } else if (type === 'WaterBody') {
    var waterImg = getWaterbodyByYear(year);
    return waterImg.visualize({
      min: 1, max: 1, palette: PALETTE_WATER});
  }
  // ===== [Yifan Wu] End =====
}

// 双评价的那个图层切换器
function getLayer2(type) {
  var base = 'projects/casa0025geeappglaicier/assets/dual_evaluation/';
  var palette = ['#f7fcf5', '#00441b']; 

  if (type === '农业') {
    return ee.Image(base + 'Slrfixed').visualize({
      min: 0, max: 1,
      palette: palette
    });
  } else if (type === '城镇') {
    return ee.Image(base + 'Slufixed').visualize({
      min: 0, max: 1,
      palette: ['#fff5f0', '#67000d']
    });
  } else if (type === '生态') {
    return ee.Image(base + 'Slefixed').visualize({
      min: 2, max: 3,
      palette: ['#1db302', '#abff57']
    });
  } else {
    return null;
  }
}


function updateLeftLayer(type, year) {
  leftMap.layers().reset();
  var layer = getLayer(type, year);

  leftMap.addLayer(boroughStyledContent, {}, 'boroughFill');

  if (layer) {
    leftMap.addLayer(layer, {}, type + ' ' + year);
  } else {
    print(' 图层类型 "' + type + '" 暂无数据，仅为示例');
    leftLegend.clear(); 
  }

  leftMap.addLayer(boroughStyledOutline, {}, 'boroughOutline');
}

function updateRightLayer(type, year) {
  rightMap.layers().reset();
  var layer = getLayer(type, year);

  rightMap.addLayer(boroughStyledContent, {}, 'boroughFill');

  if (layer) {
    rightMap.addLayer(layer, {}, type + ' ' + year);
    updateLegend(type, rightLegend); 
  } else {
    print(' 图层类型 "' + type + '" 暂无数据，仅为示例');
    rightLegend.clear();
  }

  rightMap.addLayer(boroughStyledOutline, {}, 'boroughOutline');
}

// 双评价部分的更新代码（为什么感觉一直在手搓啊
function updateEvaLayer(type) {
  section2Map.layers().reset(); 

  var layer = getLayer2(type);
  if (layer) {
    section2Map.addLayer(layer, {}, type + '评价图层');
  } else {
    print('暂无');
  }
}

// ===== [Yifan Wu] End =====
// ===== [Xinyi Zeng] End =====