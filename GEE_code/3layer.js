// ===== layer.js =====

// ===== [Xinyi Zeng] Begin: LAYER LOGIC =====
// ===== [Yifan Wu] Synchronization of dual map layers =====
function getLayer(type, year) {
  if (type === 'Glacier') {
    var glacImg = getGlacierElevation(year).clip(boroughRegion);
    // 分类分段（按数值范围重新编码）
    var classified = glacImg.expression(
    "b < -50 ? 1" +
    " : (b >= -50 && b < -20) ? 2" +
    " : (b >= -20 && b < 0) ? 3" +
    " : (b >= 0 && b < 20) ? 4" +
    " : (b >= 20) ? 5 : 0", { 'b': glacImg }
    ).selfMask();  // 去掉值为 0 的区域
  return classified.visualize({
    min: 1,
    max: 5,
    palette:['#a50026', '#f46d43', '#c2a5cf', '#5e4fa2', '#313695'],
    opacity: 0.95
    });
  } else if (type === 'NDVI') {
    var ndviImg = getNDVIImageByYear(year);
    return classifyAndColorize(ndviImg);
  } else if (type === 'Temperature') {
    var tempImg = getTempByYear(year);
    return classifyAndColorizeTemperature(tempImg);//min(-30--35)max(20-25)
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
  var base = 'users/ixizroiesxi/';

  if (type === '农业') {
    var imgnongye = ee.Image(base + 'SIr_clip').clip(defaultRegion);
    return imgnongye.visualize({
      min: 1, max: 3, //1unsuitable， 2general，3suitable
      palette: ['#f6e27f', '#f4b400', '#C68600']
    });
  } else if (type === '城镇') {
    var imgchengzhen = ee.Image(base + 'SIu_clip').clip(defaultRegion);
    return imgchengzhen.visualize({
      min: 1, max: 3, //1unsuitable， 2general，3suitable
      palette: ['#fff5f0', '#fb6a4a', '#67000d']
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
  selectionInfoPanel.clear();
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
  selectionInfoPanel.clear();
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