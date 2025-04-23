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