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
    palette:['#bd0026', '#e31a1c', '#fd8d3c', '#88419d', '#4d004b'],
    opacity: 0.95
    });
  } else if (type === 'Temperature') {
    var tempImg = getTempByYear(year);
    function classifyAndColorizeTemperature(temp) {
      temp = ee.Image(temp);
      var class1 = temp.updateMask(temp.gte(-35).and(temp.lt(-30))).visualize({palette: ['#313695']});
      var class2 = temp.updateMask(temp.gte(-30).and(temp.lt(-25))).visualize({palette: ['#4575b4']});
      var class3 = temp.updateMask(temp.gte(-25).and(temp.lt(-20))).visualize({palette: ['#74add1']});
      var class4 = temp.updateMask(temp.gte(-20).and(temp.lt(-15))).visualize({palette: ['#abd9e9']});
      var class5 = temp.updateMask(temp.gte(-15).and(temp.lt(-10))).visualize({palette: ['#c6dbef']});
      var class6 = temp.updateMask(temp.gte(-10).and(temp.lt(-5))).visualize({palette: ['#ffffbf']});
      var class7 = temp.updateMask(temp.gte(-5).and(temp.lt(0))).visualize({palette: ['#fee090']});
      var class8 = temp.updateMask(temp.gte(0).and(temp.lt(5))).visualize({palette: ['#fdae61']});
      var class9 = temp.updateMask(temp.gte(5).and(temp.lt(10))).visualize({palette: ['#f46d43']});
      var class10 = temp.updateMask(temp.gte(10).and(temp.lt(20))).visualize({palette: ['#d73027']});
      var class11 = temp.updateMask(temp.gte(20).and(temp.lte(25))).visualize({palette: ['#a50026']});
      return ee.ImageCollection([
        class1, class2, class3, class4, class5, class6,
        class7, class8, class9, class10, class11
      ]).mosaic();
    }
    return classifyAndColorizeTemperature(tempImg);//min(-30--35)max(20-25)
  } else if (type === 'NDVI') {
    var ndviImg = getNDVIImageByYear(year);
    function classifyAndColorize(ndvi) {
      ndvi = ee.Image(ndvi);
      var class1 = ndvi.updateMask(ndvi.lte(0.2)).visualize({palette: ['#c2b280']}); 
      var class2 = ndvi.updateMask(ndvi.gt(0.2).and(ndvi.lte(0.3))).visualize({palette: ['#d9f0a3']});
      var class3 = ndvi.updateMask(ndvi.gt(0.3).and(ndvi.lte(0.4))).visualize({palette: ['#addd8e']});
      var class4 = ndvi.updateMask(ndvi.gt(0.4).and(ndvi.lte(0.5))).visualize({palette: ['#78c679']});
      var class5 = ndvi.updateMask(ndvi.gt(0.5).and(ndvi.lte(0.6))).visualize({palette: ['#31a354']});
      var class6 = ndvi.updateMask(ndvi.gt(0.6)).visualize({palette: ['#006837']});
      return ee.ImageCollection([class1, class2, class3, class4, class5, class6]).mosaic();
    }
    return classifyAndColorize(ndviImg);
// ===== [Yifan Wu] Begin: LAYER ADd and Edit =====
  } else if (type === 'WaterBody') {
    var waterImg = getWaterbodyByYear(year);
    return waterImg.visualize({
      min: 1, max: 1, palette: ['#3b76ff']});
  }
  // ===== [Yifan Wu] End =====
}

// 双评价的那个图层切换器
function getLayer2(type) {
  var base = 'users/ixizroiesxi/';

  if (type === 'Ecology') {
    var imgshengtai = ee.Image(base + 'Slefixed').clip(defaultRegion)
    return imgshengtai.visualize({
      min: 2, max: 3,
      palette: ['#1db302', '#abff57']
    });
  } else if (type === 'Agriculture') {
    var imgnongye = ee.Image(base + 'SIr_clip').clip(defaultRegion);
    return imgnongye.visualize({
      min: 1, max: 3, //1unsuitable， 2general，3suitable
      palette: ['#f6e27f', '#f4b400', '#C68600']
    });
  } else if (type === 'Urban') {
    var imgchengzhen = ee.Image(base + 'SIu_clip').clip(defaultRegion);
    return imgchengzhen.visualize({
      min: 1, max: 3, //1unsuitable， 2general，3suitable
      palette: ['#fff5f0', '#fb6a4a', '#67000d']
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

  section2Map.addLayer(boroughStyledOutline, {}, 'boroughOutline');
}

// ===== [Yifan Wu] End =====
// ===== [Xinyi Zeng] End =====