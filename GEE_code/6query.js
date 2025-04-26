// ===== query.js =====

// ===== [Yifan Wu] Begin 查询测试 =====

// ====================== Glacier ======================
function renderGlacierTable(yearL, valL, yearR, valR) {
  selectionInfoPanel.clear();

  function getDiff(val1, val2) {
    if (val1 === '无数据' || val2 === '无数据') return 'NA';
    return formatNum(val2 - val1);
  }

  var headerRow = ui.Panel({
    layout: ui.Panel.Layout.flow('horizontal'),
    style: {
      border: '1px solid #ccc',
      padding: '4px 0'
    },
    widgets: [
      ui.Label('', {width: '60px'}),
      ui.Label(yearL, {width: '60px', textAlign: 'center'}),
      ui.Label(yearR, {width: '60px', textAlign: 'center'}),
      ui.Label('Difference', {width: '70px', textAlign: 'center', fontWeight: 'bold'})
    ]
  });

  function row(label, v1, v2) {
    return ui.Panel({
      layout: ui.Panel.Layout.flow('horizontal'),
      style: {
        border: '1px solid #ccc',
        padding: '2px'
      },
      widgets: [
        ui.Label(label, {width: '60px'}),
        ui.Label(v1 + ' m', {width: '60px'}),
        ui.Label(v2 + ' m', {width: '60px'}),
        ui.Label(getDiff(Number(v1), Number(v2)) + ' m', {
          width: '70px',
          fontWeight: 'bold',
          color: getDiff(Number(v1), Number(v2)) < 0 ? '#d73027' : '#1a9850' // 注意！冰川是下降是红色（融化）
        })
      ]
    });
  }

  selectionInfoPanel.add(ui.Label('Attribute Table (Glacier Elevation Change)', {
    fontWeight: 'bold',
    margin: '4px 0'
  }));
  selectionInfoPanel.add(headerRow);
  selectionInfoPanel.add(row('mean', valL.mean, valR.mean));
  selectionInfoPanel.add(row('min', valL.min, valR.min));
  selectionInfoPanel.add(row('max', valL.max, valR.max));
}

function queryGlacierInfo(feature, yearL, yearR) {
  var region = feature.geometry();
  var bandName = 'b1'; // 你的冰川变化图用的是 b1

  var imgL = getGlacierElevation(yearL).select(bandName).rename('glacier').clip(region);
  var imgR = getGlacierElevation(yearR).select(bandName).rename('glacier').clip(region);

  var reducers = ee.Reducer.mean().combine({
    reducer2: ee.Reducer.minMax(),
    sharedInputs: true
  });

  var statL = imgL.reduceRegion({reducer: reducers, geometry: region, scale: 500, maxPixels: 1e13});
  var statR = imgR.reduceRegion({reducer: reducers, geometry: region, scale: 500, maxPixels: 1e13});

  statL.evaluate(function(dictL) {
    statR.evaluate(function(dictR) {
      var valL = {
        mean: formatNum(dictL['glacier_mean']),
        min: formatNum(dictL['glacier_min']),
        max: formatNum(dictL['glacier_max'])
      };
      var valR = {
        mean: formatNum(dictR['glacier_mean']),
        min: formatNum(dictR['glacier_min']),
        max: formatNum(dictR['glacier_max'])
      };

      renderGlacierTable(yearL, valL, yearR, valR);
    });
  });
}


// ====================== Temp ======================
function renderTemperatureTable(yearL, valL, yearR, valR) {
  selectionInfoPanel.clear();

  // 插值计算
  function getDiff(val1, val2) {
    if (val1 === '无数据' || val2 === '无数据') return 'NA';
    return formatNum(val2 - val1);
  }

  // 表头行
  var headerRow = ui.Panel({
    layout: ui.Panel.Layout.flow('horizontal'),
    style: {
      border: '1px solid #ccc',
      padding: '4px 0'
    },
    widgets: [
      ui.Label('', {width: '58px'}),
      ui.Label(yearL, {width: '58px', textAlign: 'center'}),
      ui.Label(yearR, {width: '58px', textAlign: 'center'}),
      ui.Label('Difference', {width: '70px', textAlign: 'center', fontWeight: 'bold'})
    ]
  });

  // 行
  function row(label, v1, v2) {
    return ui.Panel({
      layout: ui.Panel.Layout.flow('horizontal'),
      style: {
        border: '1px solid #ccc',
        padding: '2px'
      },
      widgets: [
        ui.Label(label, {width: '58px'}),
        ui.Label(v1 + ' °C', {width: '58px'}),
        ui.Label(v2 + ' °C', {width: '58px'}),
        ui.Label(getDiff(Number(v1), Number(v2)) + ' °C', {
          width: '70px',
          fontWeight: 'bold',
          color: getDiff(Number(v1), Number(v2)) > 0 ? '#d73027' : '#1a9850' // 红升绿降
        })
      ]
    });
  }

  selectionInfoPanel.add(ui.Label('Attribute Table (Temperature)', {
    fontWeight: 'bold',
    margin: '4px 0'
  }));
  selectionInfoPanel.add(headerRow);
  selectionInfoPanel.add(row('mean', valL.mean, valR.mean));
  selectionInfoPanel.add(row('min', valL.min, valR.min));
  selectionInfoPanel.add(row('max', valL.max, valR.max));
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


// ====================== NDVI ======================
function renderNDVITable(yearL, valL, yearR, valR) {
  selectionInfoPanel.clear();

  function getDiff(val1, val2) {
    if (val1 === '无数据' || val2 === '无数据') return 'NA';
    return formatNum(val2 - val1);
  }

  var headerRow = ui.Panel({
    layout: ui.Panel.Layout.flow('horizontal'),
    style: {
      border: '1px solid #ccc',
      padding: '4px 0'
    },
    widgets: [
      ui.Label('', {width: '58px'}),
      ui.Label(yearL, {width: '58px', textAlign: 'center'}),
      ui.Label(yearR, {width: '58px', textAlign: 'center'}),
      ui.Label('Difference', {width: '70px', textAlign: 'center', fontWeight: 'bold'})
    ]
  });

  function row(label, v1, v2) {
    return ui.Panel({
      layout: ui.Panel.Layout.flow('horizontal'),
      style: {
        border: '1px solid #ccc',
        padding: '2px'
      },
      widgets: [
        ui.Label(label, {width: '58px'}),
        ui.Label(v1, {width: '58px'}),
        ui.Label(v2, {width: '58px'}),
        ui.Label(getDiff(Number(v1), Number(v2)), {
          width: '70px',
          fontWeight: 'bold',
          color: getDiff(Number(v1), Number(v2)) > 0 ? '#d73027' : '#1a9850'
        })
      ]
    });
  }

  selectionInfoPanel.add(ui.Label('Attribute Table (NDVI)', {
    fontWeight: 'bold',
    margin: '4px 0'
  }));
  selectionInfoPanel.add(headerRow);
  selectionInfoPanel.add(row('mean', valL.mean, valR.mean));
  selectionInfoPanel.add(row('min', valL.min, valR.min));
  selectionInfoPanel.add(row('max', valL.max, valR.max));
}

function queryNDVIInfo(feature, yearL, yearR) {
  var region = feature.geometry();
  var bandName = 'b1'; // 这个跑出来是b1

  var imgL = getNDVIImageByYear(yearL).select(bandName).rename('NDVI').clip(region);
  var imgR = getNDVIImageByYear(yearR).select(bandName).rename('NDVI').clip(region);

  // var ndviImage = getNDVIImageByYear(2000);
  // print('Band names of NDVI 2000:', ndviImage.bandNames());

  var reducers = ee.Reducer.mean().combine({
    reducer2: ee.Reducer.minMax(),
    sharedInputs: true
  });

  var statL = imgL.reduceRegion({reducer: reducers, geometry: region, scale: 250, maxPixels: 1e13});
  var statR = imgR.reduceRegion({reducer: reducers, geometry: region, scale: 250, maxPixels: 1e13});

  statL.evaluate(function(dictL) {
    statR.evaluate(function(dictR) {
      var valL = {
        mean: formatNum(dictL['NDVI_mean'] || dictL['constant_mean']),
        min: formatNum(dictL['NDVI_min'] || dictL['constant_min']),
        max: formatNum(dictL['NDVI_max'] || dictL['constant_max'])
      };
      var valR = {
        mean: formatNum(dictR['NDVI_mean'] || dictR['constant_mean']),
        min: formatNum(dictR['NDVI_min'] || dictR['constant_min']),
        max: formatNum(dictR['NDVI_max'] || dictR['constant_max'])
      };

      renderNDVITable(yearL, valL, yearR, valR);
    });
  });
}


// ====================== WaterBody ======================
function renderWaterBodyTable(yearL, valL, yearR, valR) {
  selectionInfoPanel.clear();

  function getDiff(val1, val2) {
    if (val1 === '无数据' || val2 === '无数据') return 'NA';
    return formatNum(val2 - val1);
  }

  var headerRow = ui.Panel({
    layout: ui.Panel.Layout.flow('horizontal'),
    style: {
      border: '1px solid #ccc',
      padding: '4px 0'
    },
    widgets: [
      ui.Label('', {width: '60px'}),
      ui.Label(yearL, {width: '60px', textAlign: 'center'}),
      ui.Label(yearR, {width: '60px', textAlign: 'center'}),
      ui.Label('Difference', {width: '70px', textAlign: 'center', fontWeight: 'bold'})
    ]
  });

  function row(label, v1, v2) {
    return ui.Panel({
      layout: ui.Panel.Layout.flow('horizontal'),
      style: {
        border: '1px solid #ccc',
        padding: '2px'
      },
      widgets: [
        ui.Label(label, {width: '60px'}),
        ui.Label(v1 + ' km²', {width: '60px'}),
        ui.Label(v2 + ' km²', {width: '60px'}),
        ui.Label(getDiff(Number(v1), Number(v2)) + ' km²', {
          width: '70px',
          fontWeight: 'bold',
          color: getDiff(Number(v1), Number(v2)) > 0 ? '#3182bd' : '#31a354'
        })
      ]
    });
  }

  selectionInfoPanel.add(ui.Label('Attribute Table (Water Body Area)', {
    fontWeight: 'bold',
    margin: '4px 0'
  }));
  selectionInfoPanel.add(headerRow);
  selectionInfoPanel.add(row('Area', valL, valR));
}


function queryWaterBodyInfo(feature, yearL, yearR) {
  var region = feature.geometry();
  var bandName = 'waterClass'; // 这个叫 叫什么我看看 waterClass

  var imgL = getWaterbodyByYear(yearL).select(bandName).rename('water');
  var imgR = getWaterbodyByYear(yearR).select(bandName).rename('water');

  // var waterImage = getWaterbodyByYear(2000);
  // print('Band names of Water Body 2000:', waterImage.bandNames());

  var areaImg = ee.Image.pixelArea().divide(1e6);  // 平方千米

  var areaL = imgL.multiply(areaImg).reduceRegion({
    reducer: ee.Reducer.sum(),
    geometry: region,
    scale: 30,
    maxPixels: 1e13
  });

  var areaR = imgR.multiply(areaImg).reduceRegion({
    reducer: ee.Reducer.sum(),
    geometry: region,
    scale: 30,
    maxPixels: 1e13
  });

  areaL.evaluate(function(dictL) {
    areaR.evaluate(function(dictR) {
      var valL = formatNum(dictL['water']);
      var valR = formatNum(dictR['water']);
      renderWaterBodyTable(yearL, valL, yearR, valR);
    });
  });
}

// ====================== Digital format processing ======================
function formatNum(value) {
  return value !== null && value !== undefined && !isNaN(value) ? Number(value).toFixed(2) : '无数据';
}
  
// ===== [Yifan Wu] End 真把我当日本人整啊 =====