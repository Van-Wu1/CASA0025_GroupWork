// ===== Combined GEE Script =====
// Created: 20250424_1446
// Author: 10851
// Modules: 1style.js, 2data.js , 3layer.js, 4panel.js, 5onclick.js, 6query.js, 7main.js


// ===== 1style.js =====
// ========== STYLE / CONSTANTS ==========

// ===== [Xinyi Zeng] Begin: STYLE CONSTANTS =====
var PALETTE_THICKNESS = ['blue', 'white', 'red'];
var PALETTE_NDVI = ['brown', 'green'];
var PALETTE_WATER = ['blue'];
var STYLE_BOUNDARY = { color: 'black' };

// This file can later include:
// - Layer opacity
// - Legend styles
// - Custom control panel look

// ===== [Xinyi Zeng] End =====
// ===== 2data.js  =====
// ===== data.js =====
// ========== DATASET LOADER & FILTERS ==========

/// ===== [Xinyi Zeng] Begin: DATA HANDLERS =====
var defaultRegion = ee.FeatureCollection("projects/casa0025geeappglaicier/assets/group_assets/main_area"); 
// 轮廓已更换为notion上的冰川影响区域，注意调用时更改为自己的用户名调试
// 曾习：已更换为小组资产并给予了所有人权限
// ===== [XinyiZeng] End =====

/// ===== [Xinyi Zeng] Begin: NDVI EXAMPLE 可视化失败版本 =====
// 评论：其实也还可以，看得出雏形了（V）
var modisNDVI = ee.ImageCollection("MODIS/006/MOD13Q1")
  .filterBounds(defaultRegion)
  .select("NDVI");

function getNDVIImageByYear(year) {
  return modisNDVI
    .filter(ee.Filter.calendarRange(year, year, 'year'))
    .max()
    .multiply(0.0001)  // normalize to 0–1
    .clip(defaultRegion);
}

function getSentinel2Filtered(year, cloudThreshold) {
  return ee.ImageCollection('COPERNICUS/S2_SR')
    .filterBounds(defaultRegion)
    .filterDate(year + '-01-01', year + '-12-31')
    .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', cloudThreshold));
}

function getGlacierBoundary() {
  return ee.FeatureCollection("FAKE/RGI").filterBounds(defaultRegion);
}
// ===== [XinyiZeng] End =====


// ===== [Yifan Wu] Begin: 自定义 Water Body; 预测试 =====
var waterbody = ee.ImageCollection("JRC/GSW1_4/YearlyHistory")
  .filterBounds(defaultRegion)
  .select("WaterBody");

function getWaterbodyByYear(year) {
  var image = ee.ImageCollection("JRC/GSW1_4/YearlyHistory")
    .filter(ee.Filter.eq('year', year))
    .mosaic()
    .clip(defaultRegion);
  return image.gte(2).selfMask();  // 季节性和永久水体，后期可调
}
  
// ===== [Yifan Wu] End =====


// 可根据项目需要扩展更多数据集加载函数，如：
/*
  - getPrecipitationByYear
  - getGlacierThickness(year)
  - getLandsat(year, cloudCover)
*/

// ===== 3layer.js =====
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
    updateLegend(type, leftLegend); 
  } else {
    print(' 图层类型 "' + type + '" 暂无数据，仅为示例');
    leftLegend.clear(); 
  }
}

function updateRightLayer(type, year) {
  rightMap.layers().reset();
  var layer = getLayer(type, year);
  if (layer) {
    rightMap.addLayer(layer, {}, type + ' ' + year);
    updateLegend(type, rightLegend); 
  } else {
    print(' 图层类型 "' + type + '" 暂无数据，仅为示例');
    rightLegend.clear();
  }
}
// ===== [Xinyi Zeng] End =====


// ===== 4panel.js =====
// ===== panel.js =====

// ===== [10851] Begin: UI AND PANEL SETUP =====
// ===== [Vanvanvan] Begin: edit =====

// 1 地图设置
var leftMap = ui.Map();
var rightMap = ui.Map();
ui.Map.Linker([leftMap, rightMap]);

// Hide all default controls (zoom, map type, layers, fullscreen)
leftMap.setControlVisibility(false);
rightMap.setControlVisibility(false);

// set map center
leftMap.setCenter(85, 30, 6);
rightMap.setCenter(85, 30, 6);

// 2 split panel设置
var splitPanel = ui.SplitPanel({
  firstPanel: leftMap,
  secondPanel: rightMap,
  orientation: 'horizontal',
  wipe: true,
  style: {stretch: 'both'}
});
// ui.root.widgets().reset([splitPanel]); //我搞不好啊这里，永远不在正中
// From_Van：正在修，我在自己的GEE里删除了你的呀拉索之后，滑条回正了，所以应该是容器部分出现的问题，正在排查
//Vanvanvan: 已解决

// 3 标题 + 状态提示
// 单独的标题和状态提示
var header = ui.Label('呀拉索~青藏高原~神奇的天路~~~~~', {
  fontWeight: 'bold', fontSize: '20px', margin: '10px 5px'
});

var selectionLabel = ui.Label('未选中任何区域', {
  fontWeight: 'bold', fontSize: '16px', margin: '4px 10px'
});

// 垂直方向的 panel 包住它们
var headerPanel = ui.Panel({
  widgets: [header, selectionLabel],
  layout: ui.Panel.Layout.flow('vertical'),
  style: {padding: '10px'}
});


// 4 Layer selectors 图层选择
var leftLayerSelect = ui.Select({
  items: ['Glacier Thickness', 'NDVI', 'Boundary','WaterBody'],
  placeholder: 'Left Layer',
  value: 'Glacier Thickness',
  onChange: function(selected) {
    updateLeftLayer(selected, yearSlider.getValue());
  }
});

var rightLayerSelect = ui.Select({
  items: ['Glacier Thickness', 'NDVI', 'Boundary','WaterBody'],
  placeholder: 'Right Layer',
  value: 'Glacier Thickness',
  onChange: function(selected) {
    updateRightLayer(selected, yearSliderRight.getValue());
  }
});

// 5 Year sliders
var yearSlider = ui.Slider({
  min: 1995, max: 2025, value: 2000, step: 1,
  style: {width: '200px'},
  onChange: function(val) {
    updateLeftLayer(leftLayerSelect.getValue(), val);
  }
});

var yearSliderRight = ui.Slider({
  min: 1995, max: 2025, value: 2020, step: 1,
  style: {width: '200px'},
  onChange: function(val) {
    updateRightLayer(rightLayerSelect.getValue(), val);
  }
});

// 6 播放
var isPlaying = false;
var playButton = ui.Button({
  label: '▶ Play',
  onClick: function() {
    isPlaying = !isPlaying;
    playButton.setLabel(isPlaying ? '⏸ Pause' : '▶ Play');
    if (isPlaying) runLeftAnimation();
  }
});

function runLeftAnimation() {
  var year = yearSlider.getValue();
  if (!isPlaying || year >= 2025) {
    isPlaying = false;
    playButton.setLabel('▶ Play');
    return;
  }
  yearSlider.setValue(year + 1);
  ui.util.setTimeout(runLeftAnimation, 600); //这一闪一闪的.......
}

/// Legend rendering
function updateLegend(type, panel) {
  panel.clear();
  var title = ui.Label('Legend: ' + type, {fontWeight: 'bold'});
  panel.add(title);
  if (type === 'NDVI') {
    panel.add(ui.Label('NDVI range: 0 (brown) – 0.8 (green)'));
  } else if (type === 'Glacier Thickness') {
    panel.add(ui.Label('Thickness: blue to red (fake palette)'));
  } else if (type === 'Boundary') {
    panel.add(ui.Label('Black outlines'));
  }
}

// ===== UI Panels（控件布局）=====
var leftTopPanel = ui.Panel({
  widgets: [ui.Label('Left Controls'), leftLayerSelect, yearSlider, playButton],
  style: {position: 'top-left', padding: '8px', width: '250px'}
});

var rightTopPanel = ui.Panel({
  widgets: [ui.Label('Right Controls'), rightLayerSelect, yearSliderRight],
  style: {position: 'top-right', padding: '8px', width: '250px'}
});

var leftLegend = ui.Panel({ style: {position: 'bottom-left', padding: '6px'} });
var rightLegend = ui.Panel({ style: {position: 'bottom-right', padding: '6px'} });

leftMap.add(leftTopPanel);
leftMap.add(leftLegend);
rightMap.add(rightTopPanel);
rightMap.add(rightLegend);

ui.root.widgets().reset([headerPanel, splitPanel]);
// ===== [Vanvanvan] End =====
// ===== [Xinyi Zeng] End =====
// ===== 5onclick.js =====
// ===== draw.js =====

// ===== [Yifan Wu] Begin 小区域点击判定 =====

var selectedLayerLeft;   // 左图点击选中图层
var selectedLayerRight;  // 右图点击选中图层

// 左图点击逻辑
leftMap.onClick(function(coords) {
  var point = ee.Geometry.Point(coords.lon, coords.lat);
  var selected = defaultRegion.filterBounds(point).first();

  if (selectedLayerLeft) {
    leftMap.layers().remove(selectedLayerLeft);
  }

  selected.evaluate(function(feat) {
    if (feat) {
      var feature = ee.Feature(feat);
      var fc = ee.FeatureCollection([feature]);
      selectedLayerLeft = ui.Map.Layer(fc.style({color: 'red', width: 2, fillColor: '00000000'}));
      leftMap.layers().add(selectedLayerLeft);

      // 💡 调用左图的查询函数
      queryFeatureInfo(feature, 'left');
    } else {
      selectionLabel.setValue('未选中任何区域');
    }
  });
});

// 右图点击逻辑
rightMap.onClick(function(coords) {
  var point = ee.Geometry.Point(coords.lon, coords.lat);
  var selected = defaultRegion.filterBounds(point).first();

  if (selectedLayerRight) {
    rightMap.layers().remove(selectedLayerRight);
  }

  selected.evaluate(function(feat) {
    if (feat) {
      var feature = ee.Feature(feat);
      var fc = ee.FeatureCollection([feature]);
      selectedLayerRight = ui.Map.Layer(fc.style({color: 'blue', width: 2, fillColor: '00000000'}));  // 蓝色表示右图
      rightMap.layers().add(selectedLayerRight);

      // 💡 调用右图的查询函数
      queryFeatureInfo(feature, 'right');
    } else {
      selectionLabel.setValue('未选中任何区域');
    }
  });
});
  
// ===== [Yifan Wu] End =====
// ===== 6query.js =====
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
      selectionLabel.setValue('✔ 已选中一个区域（该图层无属性信息）');
    }
  }
  
  function queryWaterInfo(feature, year) {
    var water = getWaterbodyByYear(year);
    var pixelArea = ee.Image.pixelArea().divide(1e6);  // km²
    var waterArea = water.multiply(pixelArea).reduceRegion({
      reducer: ee.Reducer.sum(),
      geometry: feature.geometry(),
      scale: 30,
      maxPixels: 1e13
    });
  
    waterArea.evaluate(function(result) {
      var area = result['constant'];
      var value = area ? area.toFixed(2) : '0';
      selectionLabel.setValue('✔ 已选中一个区域\n水体面积：' + value + ' km²');
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
      selectionLabel.setValue('✔ 已选中一个区域\n平均 NDVI：' + value);
    });
  }
  
  // ===== [Yifan Wu] End =====
// ===== 7main.js =====
// ========== MAIN CONTROLLER ==========

// ===== [Xinyi Zeng] Begin: MAIN INIT =====
updateLeftLayer(leftLayerSelect.getValue(), yearSlider.getValue());
updateRightLayer(rightLayerSelect.getValue(), yearSliderRight.getValue());
// ===== [Xinyi Zeng] End =====