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