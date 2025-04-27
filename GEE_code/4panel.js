// ===== panel.js =====

// =============== Basic Settings of Map ===============
var leftMap = ui.Map();
var rightMap = ui.Map();
var section2Map = ui.Map();
var section3Map = ui.Map();
ui.Map.Linker([leftMap, rightMap]);

// Hide all default controls (zoom, map type, layers, fullscreen)
leftMap.setControlVisibility(false);
rightMap.setControlVisibility(false);

// set map center
leftMap.setCenter(90, 34, 5.1);
rightMap.setCenter(90, 34, 5.1);

// A function of map init with double evaluation is encapsulated
function initSection2Map() {
  var singleMap = ui.Map();
  singleMap.setControlVisibility(false);

  // Set basemap for Section2
  singleMap.setOptions('SATELLITE');
  singleMap.setCenter(90, 34, 5.1);

  return singleMap;
}

// Conflict
function initSection3Map() {
  var conflictMap = ui.Map();

  conflictMap.setCenter(94.364, 29.5946, 11);
  conflictMap.setOptions('SATELLITE');

  return conflictMap;
}

// =============== UI design on the left side of the interface ===============

// 1 Top title + subtitle
var header = ui.Label('GlacierShift: Mapping Glacier-Affected Regions', {
  fontWeight: 'bold', fontSize: '28px', margin: '10px 0px', textAlign: 'left',color: '#084594'
});

var headerSubtitle = ui.Label('-- Exploring Glacier Change and Conservation Planning across the Qinghai-Tibet Plateau', {
  fontWeight: 'bold', fontSize: '15.5px', margin: '2px 0px 5px 0px', textAlign: 'left', color: '#084594'
});

// 2 Brief introduction text
var instructionPanel = ui.Panel({
  layout: ui.Panel.Layout.flow('vertical'),
  style: {margin: '10px 5px'}
});

instructionPanel.add(ui.Label('Explore 2000–2020 Annual Changes', {
  fontWeight: 'bold',
  fontSize: '16px',
  margin: '2px 0px 5px 0px' 
}));

instructionPanel.add(ui.Label('Warning: Users need to register and log in to GEE to obtain the loading of data.', {
  fontWeight: 'bold', margin: '2px 5px 2px 0px', color: '#cb181d'
}));
instructionPanel.add(ui.Label('· Use the Left and Right Year Sliders to compare glacier elevation, NDVI, water body, and temperature changes.', {
  margin: '2px 5px 2px 0px'
}));

instructionPanel.add(ui.Label('· Drag the center bar to visually contrast two maps.', {
  margin: '2px 5px 2px 0px'
}));

instructionPanel.add(ui.Label('· Switch to "Dual Evaluation" to explore ecological, agricultural, and urban suitability zones.', {
  margin: '2px 5px 2px 0px'
}));

instructionPanel.add(ui.Label('· Switch to "Region Conflict Detection" to identify land use conflicts within ecological zones.', {
  margin: '2px 5px 2px 0px'
}));

instructionPanel.add(ui.Label('· Click on regions to view detailed attribute tables or conflict statuses (mainly concentrated in the city of Linzhi).', {
  margin: '2px 5px 2px 0px'
}));

// 3 Switch section button
var sec1 = ui.Button({
  label: 'Interannual Comparison',
  style: buttonStyle
});

var sec2 = ui.Button({
  label: 'Dual Evaluation',
  style: buttonStyle
});

var sec3 = ui.Button({
  label: 'Region Conflict Detection',
  style: buttonStyle
});

// Section button panel
var buttonPanel = ui.Panel({
  widgets: [
    ui.Label('🛠️ Section Select', {
      fontWeight: 'bold',
      fontSize: '16px',
      margin: '0 0 2px 0',
      textAlign: 'center'
    }),
    sec1,
    sec2,
    sec3
  ],
  layout: ui.Panel.Layout.flow('vertical'),
  style: {padding: '5px'}
});

// 4 Layer Selection (Dual Map Lock)
var LayerSelect = ui.Select({
  items: ['Glacier', 'Temperature', 'NDVI', 'WaterBody'],
  placeholder: 'Left Layer, Right Layer',
  value: 'Glacier',
  style: buttonStyle,
  onChange: function(selected) {
    updateLeftLayer(selected, yearSliderLeft.getValue());
    updateRightLayer(selected, yearSliderRight.getValue());
  }
});

// layer select panel encapsulation
var LayerSelectPanel = ui.Panel({
  layout: ui.Panel.Layout.flow('vertical'),
  widgets: [
    ui.Label('🗺️ Layer Select', {
      fontWeight: 'bold',
      fontSize: '16px',
      margin: '0 0 2px 0',
      textAlign: 'center'
    }),
    LayerSelect
  ],
  style: {padding: '5px'}
});


// 5 selectionLabel
var selectionLabel = ui.Label('🔍 Click on the map to query', {
  fontWeight: 'bold', fontSize: '16px', margin: '4px 10px'
});

var selectionInfoPanel = ui.Panel({
  layout: ui.Panel.Layout.flow('vertical'),
  style: {
    margin: '4px 10px',
    padding: '4px'
  }
});

// 6 Overall
var leftPanel = ui.Panel({
  widgets: [header, headerSubtitle, instructionPanel, buttonPanel, LayerSelectPanel, selectionLabel, selectionInfoPanel],
  layout: ui.Panel.Layout.flow('vertical'),
  style: {
    padding: '10px',
    width: '390px' // The width of the left frame has been limited
  }
});

var emptyPanel = ui.Panel({
  widgets: [],
  layout: ui.Panel.Layout.flow('vertical'),
  style: {padding: '5px'}
});


// =============== Map area UI interaction (Year slider + Legend) ===============
// 1 Year sliders
var yearSliderLeft = ui.Slider({
  min: 2000, max: 2020, value: 2000, step: 1,
  style: {width: '200px'},
  onChange: function(val) {
    updateLeftLayer(LayerSelect.getValue(), val);
  }
});

var yearSliderRight = ui.Slider({
  min: 2000, max: 2020, value: 2020, step: 1,
  style: {width: '200px'},
  onChange: function(val) {
    updateRightLayer(LayerSelect.getValue(), val);
  }
});

// 2 Legend rendering
function updateLegend(type, panel) {
  panel.clear();
  if (type === 'NDVI') {
    panel.add(ui.Label('NDVI', {
      fontWeight: 'bold',
      fontSize: '14px',
      margin: '0 0 6px 0'
    }));
    var ndviPalette = ['#c2b280', '#d9f0a3', '#addd8e', '#78c679', '#31a354', '#006837'];
    var ndviLabels = ['<=0.2', '0.2-0.3', '0.3-0.4', '0.4-0.5', '0.5-0.6', '>0.6'];

    for (var i = 0; i < ndviPalette.length; i++) {
    var colorBox = ui.Label({
    style: {
      backgroundColor: ndviPalette[i],
      padding: '8px',
      margin: '2px',
      width: '20px',
      height: '20px'
    }});
    var description = ui.Label(ndviLabels[i], {margin: '4px 0 0 6px'});
    var row = ui.Panel([colorBox, description], ui.Panel.Layout.Flow('horizontal'));
    panel.add(row);
    }

  } else if (type === 'Glacier') {
    panel.add(ui.Label('Glacier elevation change (m)', {
      fontWeight: 'bold',
      fontSize: '14px',
      margin: '0 0 6px 0'
    }));
    
    var glacierPalette = ['#bd0026', '#e31a1c', '#fd8d3c', '#88419d', '#4d004b'];
    var glacierLabels = [
      '< -50m (Extreme Ablation)', '-50 ~ -20m (Large Ablation)', '-20 ~ 0m (Small Ablation)', '0 ~ 20m (Minor Accumulation)', '> 20m (Significant Accumulation)'
    ];
    
    for (var i = 0; i < glacierPalette.length; i++) {
      var glacColorBox = ui.Label({
        style: {
          backgroundColor: glacierPalette[i],
          padding: '8px',
          margin: '2px',
          width: '20px',
          height: '20px'
        }
      });
      var glacDescription = ui.Label(glacierLabels[i], {margin: '4px 0 0 6px'});
      var glacRow = ui.Panel([glacColorBox, glacDescription], ui.Panel.Layout.Flow('horizontal'));
      panel.add(glacRow);
    }
  } else if (type === 'Temperature') {
    panel.add(ui.Label('Temperature (°C)', {
      fontWeight: 'bold',
      fontSize: '14px',
      margin: '0 0 6px 0'
    }));

    var tempPalette = [
    '#313695', '#4575b4', '#74add1', '#abd9e9', '#c6dbef',
    '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026'
    ]
    var tempLabels = [
    '-35~-30', '-30~-25', '-25~-20', '-20~-15', '-15~-10',
    '-10~-5', '-5~0', '0~5', '5~10', '10~20', '20~25'
    ];

    for (var j = 0; j < tempPalette.length; j++) {
      var tempColorBox = ui.Label({
      style: {
        backgroundColor: tempPalette[j],
        padding: '8px',
        margin: '2px',
        width: '20px',
        height: '20px'
      }
    });
    var tempDescription = ui.Label(tempLabels[j], {margin: '4px 0 0 6px'});
    var tempRow = ui.Panel([tempColorBox, tempDescription], ui.Panel.Layout.Flow('horizontal'));
    panel.add(tempRow);
}
  } else if (type === 'WaterBody') {
    panel.add(ui.Label('Water body range:'));
  
    // Blue color block
    var blueBox = ui.Label('', {
      backgroundColor: '#0000FF',
      padding: '8px',
      margin: '4px 0px 4px 10px',
      border: '1px solid #3b76ff',
      width: '40px'
    });
    panel.add(blueBox);
  }
}

// add dual legend
function updateLegendSection2(type, panel) {
  panel.clear();

  if (type === 'Agriculture') {
    panel.add(ui.Label('Agricultural Suitability', {
      fontWeight: 'bold', fontSize: '14px', margin: '0 0 6px 0'
    }));
    var agriPalette = ['#f6e27f', '#f4b400', '#C68600'];
    var agriLabels = ['1 - Unsuitable Area', '2 - General Area', '3 - Suitable Area'];

    for (var i = 0; i < agriPalette.length; i++) {
      var colorBox = ui.Label({
        style: {
          backgroundColor: agriPalette[i],
          padding: '8px',
          margin: '2px',
          width: '20px',
          height: '20px'
        }
      });
      var label = ui.Label(agriLabels[i], {margin: '4px 0 0 6px'});
      var row = ui.Panel([colorBox, label], ui.Panel.Layout.Flow('horizontal'));
      panel.add(row);
    }

  } else if (type === 'Urban') {
    panel.add(ui.Label('Urban Construction Suitability', {
      fontWeight: 'bold', fontSize: '14px', margin: '0 0 6px 0'
    }));
    var urbanPalette = ['#fcbba1', '#fb6a4a', '#67000d'];
    var urbanLabels = ['1 - Unsuitable Area', '2 - General Area', '3 - Suitable Area'];

    for (var j = 0; j < urbanPalette.length; j++) {
      var colorBox = ui.Label({
        style: {
          backgroundColor: urbanPalette[j],
          padding: '8px',
          margin: '2px',
          width: '20px',
          height: '20px'
        }
      });
      var label = ui.Label(urbanLabels[j], {margin: '4px 0 0 6px'});
      var row = ui.Panel([colorBox, label], ui.Panel.Layout.Flow('horizontal'));
      panel.add(row);
    }

  } else if (type === 'Ecology') {
    panel.add(ui.Label('Ecological Protection Suitability', {
      fontWeight: 'bold', fontSize: '14px', margin: '0 0 6px 0'
    }));
    var urbanPalette = ['#1db302', '#abff57'];
    var urbanLabels = ['2 - General Area', '3 - Suitable Area'];

    for (var j = 0; j < urbanPalette.length; j++) {
      var colorBox = ui.Label({
        style: {
          backgroundColor: urbanPalette[j],
          padding: '8px',
          margin: '2px',
          width: '20px',
          height: '20px'
        }
      });
      var label = ui.Label(urbanLabels[j], {margin: '4px 0 0 6px'});
      var row = ui.Panel([colorBox, label], ui.Panel.Layout.Flow('horizontal'));
      panel.add(row);
    }

  } else {
    panel.add(ui.Label('No legend available for this layer.'));
  }
}

// 3 split panel setting
var splitPanel = ui.SplitPanel({
  firstPanel: leftMap,
  secondPanel: rightMap,
  orientation: 'horizontal',
  wipe: true,
  style: {stretch: 'both'}
});

// 4 Block encapsulation
var leftTopPanel = ui.Panel({
  widgets: [ui.Label('Left Year Slider'), yearSliderLeft],
  style: {position: 'top-left', padding: '8px', width: '250px'}
});

var rightTopPanel = ui.Panel({
  widgets: [ui.Label('Right Year Slider'), yearSliderRight],
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


// ============== State switching logic ===============
// Save the initial LayerSelect and the year slider controls
var originalLayerSelect = LayerSelect;
var section1State = {
  splitPanel: splitPanel,
  leftTop: leftTopPanel,
  rightTop: rightTopPanel,
  leftLegend: leftLegend,
  rightLegend: rightLegend,
  LayerSelectPanel: LayerSelectPanel
};

// Section2
sec2.onClick(function () {
selectionInfoPanel.clear();

sec2.setDisabled(true);
sec1.setDisabled(false);
sec3.setDisabled(false);

// remove
leftMap.layers().reset();
rightMap.layers().reset();
ui.root.remove(splitPanel);
leftMap.remove(leftTopPanel);
rightMap.remove(rightTopPanel);
leftMap.remove(leftLegend);
rightMap.remove(rightLegend);

// create s2
section2Map = initSection2Map();
ui.root.widgets().set(1, section2Map);

// create a new legend panel
var section2Legend = ui.Panel({ style: {position: 'bottom-right', padding: '6px'} });
section2Map.add(section2Legend);

// create new LayerSelect2
var LayerSelect2 = ui.Select({
  items: ['Ecology', 'Agriculture', 'Urban'],
  placeholder: 'Section2 Map',
  value: 'Ecology',
  style: buttonStyle,
  onChange: function(selected) {
    updateEvaLayer(selected);
    updateLegendSection2(selected, section2Legend); // Update the legend
  }
});

var LayerSelect2Panel = ui.Panel({
  layout: ui.Panel.Layout.flow('vertical'),
  widgets: [
    ui.Label('🗺️ Layer Select', {
      fontWeight: 'bold',
      fontSize: '16px',
      margin: '0 0 2px 0',
      textAlign: 'center'
    }),
    LayerSelect2
  ],
  style: {padding: '5px'}
});

leftPanel.widgets().set(4, LayerSelect2Panel);
selectionLabel.setValue('ℹ️ This layer is for visualization only and does not support query operations.');

updateEvaLayer('Ecology');
updateLegendSection2('Ecology', section2Legend);
});


// Section1
sec1.onClick(function () {
  selectionInfoPanel.clear();

  sec1.setDisabled(true);
  sec2.setDisabled(false);
  sec3.setDisabled(false);

  // Restore the control
  ui.root.widgets().set(1, section1State.splitPanel);
  leftMap.add(section1State.leftTop);
  rightMap.add(section1State.rightTop);
  leftMap.add(section1State.leftLegend);
  rightMap.add(section1State.rightLegend);
  leftPanel.widgets().set(4, section1State.LayerSelectPanel);

  updateLeftLayer(LayerSelect.getValue(), yearSliderLeft.getValue());
  updateRightLayer(LayerSelect.getValue(), yearSliderRight.getValue());

  selectionLabel.setValue('🔍 Click on the map to query');
});

sec3.onClick(function () {
  selectionInfoPanel.clear();

  sec3.setDisabled(true);
  sec2.setDisabled(false);
  sec1.setDisabled(false);

  leftMap.layers().reset();
  rightMap.layers().reset();
  ui.root.remove(splitPanel);
  leftMap.remove(leftTopPanel);
  rightMap.remove(rightTopPanel);
  leftMap.remove(leftLegend);
  rightMap.remove(rightLegend);

  section3Map = initSection3Map();
  ui.root.widgets().set(1, section3Map);

  leftPanel.widgets().set(4, emptyPanel);

  setupConflictDetection();
  updateConflictLayer();
  section3Map.add(conflictlegend); 

  selectionLabel.setValue('🔍 Zoom & Explore & Query');
});

// Section1 is enabled by default
sec1.setDisabled(true);



//conflict zone legend 
var conflictlegend = ui.Panel({
  style: {
    position: 'bottom-right',
    padding: '8px 15px'
  }
});

// 图例标题
var legendTitle = ui.Label({
  value: 'Conflict zone',
  style: {
    fontWeight: 'bold',
    fontSize: '18px',
    margin: '0 0 8px 0',
    padding: '0'
  }
});
conflictlegend.add(legendTitle);

// 图例条目函数
function makeLegendRow(color, name) {
  var conflict_colorBox = ui.Label({
    style: {
      backgroundColor: color,
      padding: '8px',
      margin: '0 0 4px 0'
    }
  });
  
  var conflict_description = ui.Label({
    value: name,
    style: {margin: '0 0 4px 6px'}
  });
  
  return ui.Panel({
    widgets: [conflict_colorBox, conflict_description],
    layout: ui.Panel.Layout.Flow('horizontal')
  });
}

// 添加条目
conflictlegend.add(makeLegendRow('orange', 'Built-up conflict zone'));
conflictlegend.add(makeLegendRow('#F5DEB3', 'Cropland conflict zone'));
