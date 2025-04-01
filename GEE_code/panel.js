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

// Header
var header = ui.Label('呀拉索~青藏高原~神奇的天路~~~~~', {
  fontWeight: 'bold', fontSize: '20px', margin: '10px 5px'
});
ui.root.insert(0, header);


// Layer selectors
var leftLayerSelect = ui.Select({
  items: ['Glacier Thickness', 'NDVI', 'Boundary','water'],
  placeholder: 'Left Layer',
  onChange: function(selected) {
    updateLeftLayer(selected, yearSlider.getValue());
  }
});

var rightLayerSelect = ui.Select({
  items: ['Glacier Thickness', 'NDVI', 'Boundary','water'],
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