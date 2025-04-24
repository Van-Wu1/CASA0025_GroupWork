// ===== panel.js =====

// ===== [10851] Begin: UI AND PANEL SETUP =====
// ===== [Vanvanvan] Begin: edit =====

// =============== Map基础设定 ===============
var leftMap = ui.Map();
var rightMap = ui.Map();
ui.Map.Linker([leftMap, rightMap]);

// Hide all default controls (zoom, map type, layers, fullscreen)
leftMap.setControlVisibility(false);
rightMap.setControlVisibility(false);

// set map center
leftMap.setCenter(85, 30, 6);
rightMap.setCenter(85, 30, 6);

// =============== 界面左侧UI设计 ===============

// 1 顶部标题
var header = ui.Label('呀拉索~青藏高原~神奇的天路~~~~~', {
  fontWeight: 'bold', fontSize: '20px', margin: '10px 5px'
});

// 2 简介文字
var intro = ui.Label('我是文本简介：喵喵喵喵喵喵喵喵喵喵喵喵喵喵喵喵喵喵喵喵喵喵喵喵喵喵喵喵喵喵喵喵喵喵喵喵喵喵喵喵喵喵', {
  fontWeight: 'normal', fontSize: '14px', margin: '10px 5px'
});

// 3 切换模块按钮
var buttonStyle = {
  height: '32px',
  width: '100px',
  fontSize: '14px',
  padding: '4px 10px',
  margin: '0px 6px 0px 0px'
};

// 烦的嘞GEE的 ui.Button 不听CSS 样式去渲染，还得做统一样式再照搬
var sec1 = ui.Button({
  label: 'Section1',
  style: buttonStyle
});

var sec2 = ui.Button({
  label: 'Section2',
  style: buttonStyle
});

// 模块按钮 panel
var bottomPanel = ui.Panel({
  widgets: [sec1, sec2],
  layout: ui.Panel.Layout.flow('horizontal'),
  style: {padding: '10px'}
});

// 4 选中区域（废版留着占位）
var selectionLabel = ui.Label('未选中任何区域（废版留着占位）', {
  fontWeight: 'bold', fontSize: '16px', margin: '4px 10px'
});

// 5 总体
var leftPanel = ui.Panel({
  widgets: [header, intro, bottomPanel, selectionLabel],
  layout: ui.Panel.Layout.flow('vertical'),
  style: {
    padding: '10px',
    width: '350px' //左侧框架宽度已做限定
  }
});

// =============== Layer selectors 图层选择 ===============
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

// =============== 地图区域UI交互（年份滑条+图例） ===============
// 1 Year sliders
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

// 2 Legend rendering
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

// 3 split panel设置
var splitPanel = ui.SplitPanel({
  firstPanel: leftMap,
  secondPanel: rightMap,
  orientation: 'horizontal',
  wipe: true,
  style: {stretch: 'both'}
});

// 4 区块封装
var leftTopPanel = ui.Panel({
  widgets: [ui.Label('Left Controls'), leftLayerSelect, yearSlider],
  style: {position: 'top-left', padding: '8px', width: '250px'}
});

var rightTopPanel = ui.Panel({
  widgets: [ui.Label('Right Controls'), rightLayerSelect, yearSliderRight],
  style: {position: 'top-right', padding: '8px', width: '250px'}
});

var leftLegend = ui.Panel({ style: {position: 'bottom-left', padding: '6px'} });
var rightLegend = ui.Panel({ style: {position: 'bottom-right', padding: '6px'} });


// show
leftMap.add(leftTopPanel);
leftMap.add(leftLegend);
rightMap.add(rightTopPanel);
rightMap.add(rightLegend);


ui.root.clear();
ui.root.widgets().reset([leftPanel, splitPanel]);
// ===== [Vanvanvan] End =====
// ===== [Xinyi Zeng] End =====