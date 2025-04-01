// ===== Combined GEE Script =====
// Created: 20250401_0236
// Author: Vanvanvan
// Modules: style.js, panel.js, layer.js, draw.js, main.js


// ===== style.js =====
// ========== STYLE / CONSTANTS ==========
var PALETTE_THICKNESS = ['blue', 'white', 'red'];
var PALETTE_NDVI = ['brown', 'green'];
var STYLE_BOUNDARY = { color: 'black' };

// This file can later include:
// - Layer opacity
// - Legend styles
// - Custom control panel look

// ===== panel.js =====
// ===== panel.js =====
var leftMap;
var rightMap;
var leftLayerSelect;
var rightLayerSelect;
var yearSlider;
var yearSliderRight;

function initMapLayout() {
  leftMap = ui.Map();
  rightMap = ui.Map();

  ui.Map.Linker([leftMap, rightMap]);

  leftMap.setControlVisibility(true);
  rightMap.setControlVisibility(false);

  leftMap.setCenter(85, 30, 6);
  rightMap.setCenter(85, 30, 6);

  ui.root.widgets().reset([ui.SplitPanel({
    firstPanel: leftMap,
    secondPanel: rightMap,
    orientation: 'horizontal',
    wipe: true
  })]);

  // file name
  var header = ui.Label('呀拉索那就是，青藏高原', {
    fontWeight: 'bold',
    fontSize: '20px',
    margin: '10px 5px'
  });
  ui.root.insert(0, header);
}

function addControlPanel() {
  leftLayerSelect = ui.Select({
    items: ['Glacier Thickness', 'NDVI', 'Boundary','water'],
    placeholder: 'Left Layer',
    onChange: function(selected) {
      updateLeftLayer(selected, yearSlider.getValue());
    }
  });

  rightLayerSelect = ui.Select({
    items: ['Glacier Thickness', 'NDVI', 'Boundary','water'],
    placeholder: 'Right Layer',
    value: 'Glacier Thickness',
    onChange: function(selected) {
      updateRightLayer(selected, yearSliderRight.getValue());
    }
  });

  yearSlider = ui.Slider({
    min: 1999, max: 2020, value: 2000, step: 1,
    onChange: function(val) {
      updateLeftLayer(leftLayerSelect.getValue(), val);
    }
  });

  yearSliderRight = ui.Slider({
    min: 1999, max: 2020, value: 2020, step: 1,
    onChange: function(val) {
      updateRightLayer(rightLayerSelect.getValue(), val);
    }
  });

  // 左下角控制面板
  var leftControlPanel = ui.Panel({
    widgets: [
      ui.Label('🔹 Left Map Controls'), leftLayerSelect, yearSlider
    ],
    style: {position: 'bottom-left', width: '220px', padding: '8px'}
  });
  leftMap.add(leftControlPanel);

  // 右下角控制面板
  var rightControlPanel = ui.Panel({
    widgets: [
      ui.Label('🔸 Right Map Controls'), rightLayerSelect, yearSliderRight
    ],
    style: {position: 'bottom-right', width: '220px', padding: '8px'}
  });
  rightMap.add(rightControlPanel);

  // Draw 按钮（功能占位）
  var drawButton = ui.Button({
    label: 'Draw Polygon ✏️',
    onClick: function() {
      print('Draw polygon clicked (功能待实现)');
    },
    style: {position: 'top-right'}
  });
  rightMap.add(drawButton);
}
// ===== layer.js =====
// ========== LAYER HANDLERS ==========

function updateLeftLayer(type, year) {
    leftMap.layers().reset();
    var layer = getLayer(type, year);
    leftMap.addLayer(layer, {}, type + ' ' + year);
  }
  
  function updateRightLayer(type, year) {
    rightMap.layers().reset();
    var layer = getLayer(type, year);
    rightMap.addLayer(layer, {}, type + ' ' + year);
  }
  
  function getLayer(type, year) {
    if (type === 'Glacier Thickness') {
      return ee.Image('FAKE/THICKNESS_' + year).visualize({
        min: -50, max: 0,
        palette: ['blue', 'white', 'red']
      });
    } else if (type === 'NDVI') {
      return ee.Image('FAKE/NDVI_' + year).visualize({
        min: 0, max: 0.8,
        palette: ['brown', 'green']
      });
    } else if (type === 'Boundary') {
      return ee.FeatureCollection('FAKE/RGI').style({
        color: 'black'
      });
    }
  }
  
  function updateLeftLayer(type, year) {
    leftMap.layers().reset();
    var layer = getLayer(type, year);
    leftMap.addLayer(layer, {}, type + ' ' + year);
  }
  
  function updateRightLayer(type, year) {
    rightMap.layers().reset();
    var layer = getLayer(type, year);
    rightMap.addLayer(layer, {}, type + ' ' + year);
  }
  
  function getLayer(type, year) {
    if (type === 'Glacier Thickness') {
      return ee.Image('FAKE/THICKNESS_' + year).visualize({
        min: -50, max: 0,
        palette: PALETTE_THICKNESS
      });
    } else if (type === 'NDVI') {
      return ee.Image('FAKE/NDVI_' + year).visualize({
        min: 0, max: 0.8,
        palette: PALETTE_NDVI
      });
    } else if (type === 'Boundary') {
      return ee.FeatureCollection('FAKE/RGI').style(STYLE_BOUNDARY);
    }
  }
  
// ===== draw.js =====
// Draw polygon 功能将于后续实现
// ===== main.js =====
// ========== MAIN CONTROLLER ==========
initMapLayout();       // 初始化地图和布局
addControlPanel();     // 加载控件面板