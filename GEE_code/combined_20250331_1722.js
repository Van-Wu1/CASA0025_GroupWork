// ===== Combined GEE Script =====
// Created: 20250331_1722
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
// ========== MAP INIT & UI PANEL ==========

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
}

function addControlPanel() {
  leftLayerSelect = ui.Select({
    items: ['Glacier Thickness', 'NDVI', 'Boundary'],
    placeholder: 'Select Left Map Layer',
    onChange: function(selected) {
      updateLeftLayer(selected, yearSlider.getValue());
    }
  });

  rightLayerSelect = ui.Select({
    items: ['Glacier Thickness', 'NDVI', 'Boundary'],
    placeholder: 'Select Right Map Layer',
    value: 'Glacier Thickness',
    onChange: function(selected) {
      updateRightLayer(selected, yearSliderRight.getValue());
    }
  });

  yearSlider = ui.Slider({
    min: 1999,
    max: 2020,
    value: 2000,
    step: 1,
    onChange: function(val) {
      updateLeftLayer(leftLayerSelect.getValue(), val);
    }
  });

  yearSliderRight = ui.Slider({
    min: 1999,
    max: 2020,
    value: 2020,
    step: 1,
    onChange: function(val) {
      updateRightLayer(rightLayerSelect.getValue(), val);
    }
  });

  var controlPanel = ui.Panel({
    widgets: [
      ui.Label('Left Map Controls'),
      leftLayerSelect,
      yearSlider,
      ui.Label('Right Map Controls'),
      rightLayerSelect,
      yearSliderRight
    ],
    style: {position: 'top-left', width: '250px'}
  });

  leftMap.add(controlPanel);
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

// ===== main.js =====
// ========== MAIN CONTROLLER ==========
initMapLayout();       // 初始化地图和布局
addControlPanel();     // 加载控件面板