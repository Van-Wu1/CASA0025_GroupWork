// ===== query.js =====

// ===== [Yifan Wu] Begin 查询测试 =====
// ===== query.js =====

function queryFeatureInfo(feature) {
  var type = LayerSelect.getValue();  // 统一用 LayerSelect（而不是 leftLayerSelect）？？？
  var yearLeft = yearSliderLeft.getValue(); // 这个位置是把滑条年份打包
  var yearRight = yearSliderRight.getValue();

  if (type === 'Temperature') {
    queryTemperatureInfo(feature, yearLeft, yearRight);
  } else if (type === 'NDVI') {
    queryNDVIInfo(feature, yearLeft, yearRight);
  } else if (type === 'WaterBody') {
    queryWaterBodyInfo(feature, yearLeft, yearRight);
  } else {
    selectionLabel.setValue('已选中区域（该图层无支持的查询功能）');
  }
}

// 温度
function queryTemperatureInfo(feature, yearL, yearR) {
  var tempL = getTempByYear(yearL);
  var tempR = getTempByYear(yearR);

  var reducer = ee.Reducer.mean();
  var region = feature.geometry();

  var meanL = tempL.reduceRegion({reducer: reducer, geometry: region, scale: 1000, maxPixels: 1e13});
  var meanR = tempR.reduceRegion({reducer: reducer, geometry: region, scale: 1000, maxPixels: 1e13});

  ee.Dictionary(meanL).combine(meanR, true).evaluate(function(dict) {
    var valL = dict['temp_' + yearL] || dict['constant'];  // 适配不同命名
    var valR = dict['temp_' + yearR] || dict['constant_1'];
    var display = '气温均值\n' + yearL + '年：' + formatNum(valL) + ' °C\n' +
                                    yearR + '年：' + formatNum(valR) + ' °C';
    selectionLabel.setValue(display);
  });
}

// NDVI
function queryNDVIInfo(feature, yearL, yearR) {
  var imgL = getNDVIImageByYear(yearL);
  var imgR = getNDVIImageByYear(yearR);

  var reducer = ee.Reducer.mean();
  var region = feature.geometry();

  var meanL = imgL.reduceRegion({reducer: reducer, geometry: region, scale: 250, maxPixels: 1e13});
  var meanR = imgR.reduceRegion({reducer: reducer, geometry: region, scale: 250, maxPixels: 1e13});

  ee.Dictionary(meanL).combine(meanR, true).evaluate(function(dict) {
    var valL = dict['NDVI'] || dict['constant'];
    var valR = dict['NDVI_1'] || dict['constant_1'];
    var display = 'NDVI 均值\n' + yearL + '年：' + formatNum(valL) + '\n' +
                                  yearR + '年：' + formatNum(valR);
    selectionLabel.setValue(display);
  });
}

// 水体面积
function queryWaterBodyInfo(feature, yearL, yearR) {
  var imgL = getWaterbodyByYear(yearL);
  var imgR = getWaterbodyByYear(yearR);

  var areaImg = ee.Image.pixelArea().divide(1e6);  // km²
  var region = feature.geometry();

  var areaL = imgL.multiply(areaImg).reduceRegion({
    reducer: ee.Reducer.sum(), geometry: region, scale: 30, maxPixels: 1e13
  });
  var areaR = imgR.multiply(areaImg).reduceRegion({
    reducer: ee.Reducer.sum(), geometry: region, scale: 30, maxPixels: 1e13
  });

  ee.Dictionary(areaL).combine(areaR, true).evaluate(function(dict) {
    var valL = dict['constant'];
    var valR = dict['constant_1'];
    var display = '水体面积\n' + yearL + '年：' + formatNum(valL) + ' km²\n' +
                                  yearR + '年：' + formatNum(valR) + ' km²';
    selectionLabel.setValue(display);
  });
}

// 数字格式处理
function formatNum(value) {
  return value ? Number(value).toFixed(2) : '无数据';
}

  
  // ===== [Yifan Wu] End =====