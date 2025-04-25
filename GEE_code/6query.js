// ===== query.js =====

// ===== [Yifan Wu] Begin 查询测试 =====
function queryFeatureInfo(feature) {
    var type = leftLayerSelect.getValue();
    var year = yearSlider.getValue();
  
    if (type === 'WaterBody') {
      queryWaterInfo(feature, year);
    } else if (type === 'NDVI') {
      queryNDVIInfo(feature, year);
    } else {
      selectionLabel.setValue('已选中一个区域（该图层无属性信息）');
    }
  }
  
  function queryWaterInfo(feature, year) {
    var water = getWaterbodyByYear(year);
    var pixelArea = ee.Image.pixelArea().divide(1e6); 
    var waterArea = water.multiply(pixelArea).reduceRegion({
      reducer: ee.Reducer.sum(),
      geometry: feature.geometry(),
      scale: 30,
      maxPixels: 1e13
    });
  
    waterArea.evaluate(function(result) {
      var area = result['constant'];
      var value = area ? area.toFixed(2) : '0';
      selectionLabel.setValue('已选中一个区域\n暂时无法显示信息');
    });
  }
  
  function queryNDVIInfo(feature, year) {
    var ndvi = getNDVIImageByYear(year);
    var stats = ndvi.reduceRegion({
      reducer: ee.Reducer.mean(),
      geometry: feature.geometry(),
      scale: 250,
      maxPixels: 1e13
    });
  
    stats.evaluate(function(result) {
      var meanNDVI = result['NDVI'];
      var value = meanNDVI ? meanNDVI.toFixed(3) : '无数据';
      selectionLabel.setValue('已选中一个区域\n平均 NDVI：' + value);
    });
  }
  
  // ===== [Yifan Wu] End =====