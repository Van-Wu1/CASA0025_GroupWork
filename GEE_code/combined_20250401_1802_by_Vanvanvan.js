// ===== Combined GEE Script =====
// Created: 20250401_1802
// Author: Vanvanvan
// Modules: style.js, data.js , layer.js, panel.js, draw.js, main.js


// ===== style.js =====
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
// ===== data.js  =====
// ===== data.js =====
// ========== DATASET LOADER & FILTERS ==========

/// ===== [Xinyi Zeng] Begin: DATA HANDLERS =====
var defaultRegion = ee.Geometry.Rectangle([78, 26, 104, 39]); // 这个范围再商议，目前为了测试是一个随机的很小的范围
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

// ===== layer.js =====
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


// ===== panel.js =====
// ===== panel.js =====

// ===== [10851] Begin: UI AND PANEL SETUP =====
var leftMap = ui.Map();
var rightMap = ui.Map();
ui.Map.Linker([leftMap, rightMap]);

// Hide all default controls (zoom, map type, layers, fullscreen)
leftMap.setControlVisibility(false);
rightMap.setControlVisibility(false);


// set map center
leftMap.setCenter(85, 30, 6);
rightMap.setCenter(85, 30, 6);

// split panel
var splitPanel = ui.SplitPanel({
  firstPanel: leftMap,
  secondPanel: rightMap,
  orientation: 'horizontal',
  wipe: true,
  style: {stretch: 'both'}
});
ui.root.widgets().reset([splitPanel]); //我搞不好啊这里，永远不在正中
// From_Van：正在修，我在自己的GEE里删除了你的呀拉索之后，滑条回正了，所以应该是容器部分出现的问题，正在排查

// Header
var header = ui.Label('呀拉索~青藏高原~神奇的天路~~~~~', {
  fontWeight: 'bold', fontSize: '20px', margin: '10px 5px'
});
ui.root.insert(0, header);


// Layer selectors
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

// Year sliders
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

// Playback control for left map 
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

// UI Panels
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
// ===== [Xinyi Zeng] End =====
// ===== draw.js =====
// Draw polygon 功能将于后续实现
// ===== main.js =====
// ========== MAIN CONTROLLER ==========

// ===== [Xinyi Zeng] Begin: MAIN INIT =====
updateLeftLayer(leftLayerSelect.getValue(), yearSlider.getValue());
updateRightLayer(rightLayerSelect.getValue(), yearSliderRight.getValue());
// ===== [Xinyi Zeng] End =====