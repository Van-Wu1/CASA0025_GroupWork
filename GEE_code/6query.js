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
function renderTemperatureTable(yearL, valL, yearR, valR) {
  selectionInfoPanel.clear();

  var headerRow = ui.Panel({
    layout: ui.Panel.Layout.flow('horizontal'),
    style: {
      border: '1px solid #ccc',
      padding: '4px 0'
    },
    widgets: [
      ui.Label('', {width: '50px'}),
      ui.Label(yearL + ' 年', {
        width: '90px',
        fontWeight: 'bold',
        textAlign: 'center'
      }),
      ui.Label(yearR + ' 年', {
        width: '90px',
        fontWeight: 'bold',
        textAlign: 'center'
      })
    ]
  });
  
    function row(label, valL, valR) {
    return ui.Panel({
      layout: ui.Panel.Layout.flow('horizontal'),
      style: {
        border: '1px solid #ccc',
        padding: '2px'
      },
      widgets: [
        ui.Label(label, {width: '70px'}),
        ui.Label(valL, {width: '90px'}),
        ui.Label(valR, {width: '90px'})
      ]
    });
  }

  selectionInfoPanel.add(ui.Label('气温统计', {fontWeight: 'bold', margin: '4px 0'}));
  selectionInfoPanel.add(headerRow);
  selectionInfoPanel.add(row('平均温度', valL.mean + ' °C', valR.mean + ' °C'));
  selectionInfoPanel.add(row('最低温度', valL.min + ' °C', valR.min + ' °C'));
  selectionInfoPanel.add(row('最高温度', valL.max + ' °C', valR.max + ' °C'));
}


function queryTemperatureInfo(feature, yearL, yearR) {
  var region = feature.geometry();
  var bandName = 'b1'; // 不同图层得先设置断点提取这个什么banName好麻烦

  var imgL = getTempByYear(yearL).select(bandName).rename('temp').clip(region);
  var imgR = getTempByYear(yearR).select(bandName).rename('temp').clip(region);

  var reducers = ee.Reducer.mean().combine({
    reducer2: ee.Reducer.minMax(),
    sharedInputs: true
  });

  var statL = imgL.reduceRegion({reducer: reducers, geometry: region, scale: 1000, maxPixels: 1e13});
  var statR = imgR.reduceRegion({reducer: reducers, geometry: region, scale: 1000, maxPixels: 1e13});

  // 用嵌套 evaluate 确保两个结果都正常解析，老天奶终于出来了...
  statL.evaluate(function(dictL) {
    statR.evaluate(function(dictR) {
      var valL = {
        mean: formatNum(dictL['temp_mean']),
        min: formatNum(dictL['temp_min']),
        max: formatNum(dictL['temp_max'])
      };
      var valR = {
        mean: formatNum(dictR['temp_mean']),
        min: formatNum(dictR['temp_min']),
        max: formatNum(dictR['temp_max'])
      };

      renderTemperatureTable(yearL, valL, yearR, valR);
    });
  });
}

  // // Breakpoint Test
  // var clipped_L = getTempByYear(yearL).clip(feature.geometry());
  // var clipped_R = getTempByYear(yearR).clip(feature.geometry());
  // print('left', clipped_L);
  // print('right', clipped_R)

  // print('Selected feature geometry', feature.geometry());
  // Map.addLayer(feature.geometry(), {color: 'red'}, '选中区域边界');

  // var tempImage = getTempByYear(2000);
  // print('Band names of temp_2000:', tempImage.bandNames());

  // print('statL', statL);
  // print('statR', statR);


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