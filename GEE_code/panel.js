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
