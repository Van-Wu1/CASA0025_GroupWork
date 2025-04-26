// ===== panel.js =====

// ===== [10851] Begin: UI AND PANEL SETUP =====
// ===== [Vanvanvan] Begin: edit =====

// =============== Map基础设定 ===============
var leftMap = ui.Map();
var rightMap = ui.Map();
var section2Map = ui.Map();
ui.Map.Linker([leftMap, rightMap]);

// Hide all default controls (zoom, map type, layers, fullscreen)
leftMap.setControlVisibility(false);
rightMap.setControlVisibility(false);

// set map center
leftMap.setCenter(90, 34, 5.1);
rightMap.setCenter(90, 34, 5.1);

// 封装了一个双评价的map init的函数
function initSection2Map() {
  var singleMap = ui.Map();

  // 隐藏默认控件（缩放、类型切换、全屏等）
  singleMap.setControlVisibility(false);

  // 设置中心点与缩放等级
  singleMap.setCenter(90, 34, 5.1);

  return singleMap;
}


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

// 烦的嘞GEE的 ui.Button 不听CSS 样式去渲染，还得做统一样式再照搬
var sec1 = ui.Button({
  label: 'Interannual Comparison',
  style: buttonStyle
});

var sec2 = ui.Button({
  label: 'Dual Evaluation',
  style: buttonStyle
});

// 模块按钮 panel
var bottomPanel = ui.Panel({
  widgets: [sec1, sec2],
  layout: ui.Panel.Layout.flow('horizontal'),
  style: {padding: '10px'}
});

// 4 Layer选择（双地图锁定）
var LayerSelect = ui.Select({
  items: ['Glacier', 'NDVI', 'Temperature','WaterBody'],
  placeholder: 'Left Layer, Right Layer',
  value: 'Glacier',
  style: LayerSelectStyle,
  onChange: function(selected) {
    updateLeftLayer(selected, yearSliderLeft.getValue());
    updateRightLayer(selected, yearSliderRight.getValue());
  }
});

// 5 选中区域（废版留着占位）
var selectionLabel = ui.Label('未选中任何区域（废版留着占位）', {
  fontWeight: 'bold', fontSize: '16px', margin: '4px 10px'
});

var selectionInfoPanel = ui.Panel({
  layout: ui.Panel.Layout.flow('vertical'),
  style: {
    margin: '4px 10px',
    padding: '4px'
  }
});

// 6 总体
var leftPanel = ui.Panel({
  widgets: [header, intro, bottomPanel, LayerSelect, selectionLabel, selectionInfoPanel],
  layout: ui.Panel.Layout.flow('vertical'),
  style: {
    padding: '10px',
    width: '370px' //左侧框架宽度已做限定
  }
});

// =============== 地图区域UI交互（年份滑条+图例） ===============
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
    }
     });
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
    
    var glacierPalette = ['#a50026', '#f46d43', '#c2a5cf', '#5e4fa2', '#313695'];
    var glacierLabels = [
      '< -50m (Extreme Ablation)', '-50 ~ -20m (Large Ablation)', '-20 ~ 0m(Small Ablation)', '0 ~ 50m(Minor Accumulation)', '> 50m(Significant Accumulation)'
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
];
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

  // 色块
    var gradient = ui.Thumbnail({
      image: ee.Image.pixelLonLat().select(0), 
      params: {
        bbox: [0, 0, 1, 0.1],
        dimensions: '100x10',
        format: 'png',
        min: 0,
        max: 1,
        palette: ['brown', 'green']
      },
      style: {
        stretch: 'horizontal',
        margin: '4px 0 4px 20px'
      }
    });
  }   else if (type === 'WaterBody') {
    panel.add(ui.Label('Water body range:'));
  
    // 蓝色色块
    var blueBox = ui.Label('', {
      backgroundColor: '#0000FF',
      padding: '8px',
      margin: '4px 0px 4px 10px',
      border: '1px solid #2980b9',
      width: '40px'
    });
    panel.add(blueBox);
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
// ===== [Vanvanvan] End =====
// ===== [Xinyi Zeng] End =====


// ===== [Vanvanvan] 2个section切换（我真的对这款半自动洗衣机很无语） =====

// ========= 状态切换逻辑 ==========
// 保存初始 LayerSelect 和年份滑条控件
var originalLayerSelect = LayerSelect;
var section1State = {
  splitPanel: splitPanel,
  leftTop: leftTopPanel,
  rightTop: rightTopPanel,
  leftLegend: leftLegend,
  rightLegend: rightLegend,
  LayerSelect: LayerSelect
};

// Section2 切换逻辑
sec2.onClick(function () {
  // 禁用 S2，启用 S1
  sec2.setDisabled(true);
  sec1.setDisabled(false);

  // 移除s1组件
  leftMap.layers().reset();
  rightMap.layers().reset();
  ui.root.remove(splitPanel);
  leftMap.remove(leftTopPanel);
  rightMap.remove(rightTopPanel);
  leftMap.remove(leftLegend);
  rightMap.remove(rightLegend);

  // 创建s2
  section2Map = initSection2Map();
  ui.root.widgets().set(1, section2Map);

  // 新建一个 legend panel，不复用旧组件
  var section2Legend = ui.Panel({ style: {position: 'bottom-right', padding: '6px'} });
  section2Map.add(section2Legend);

  // 替换 LayerSelect
  var LayerSelect2 = ui.Select({
    items: ['农业', '生态', '城镇'],
    placeholder: '选择图层',
    style: buttonStyle,
    onChange: function(selected) {
      updateEvaLayer(selected);
      updateLegendSection2(selected, section2Legend); //更新图例
    }
  });

  leftPanel.widgets().set(3, LayerSelect2);
  selectionLabel.setValue('当前为 Section2');
});

// Section1 切换逻辑
sec1.onClick(function () {
  // 禁用 Section1的 启用 Section2
  sec1.setDisabled(true);
  sec2.setDisabled(false);

  // 恢复控件
  ui.root.widgets().set(1, section1State.splitPanel);
  leftMap.add(section1State.leftTop);
  rightMap.add(section1State.rightTop);
  leftMap.add(section1State.leftLegend);
  rightMap.add(section1State.rightLegend);
  leftPanel.widgets().set(3, section1State.LayerSelect);

  updateLeftLayer(LayerSelect.getValue(), yearSliderLeft.getValue());
  updateRightLayer(LayerSelect.getValue(), yearSliderRight.getValue());

  selectionLabel.setValue('未选中任何区域（已回到 Section1）');
});

// 默认启用 Section1
sec1.setDisabled(true);
// ===== [Vanvanvan] End: 老子简直是天才妈的手搓代码 =====

// add dual legend
function updateLegendSection2(type, panel) {
  panel.clear();

  if (type === '农业') {
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

  } else if (type === '城镇') {
    panel.add(ui.Label('Urban Construction Suitability', {
      fontWeight: 'bold', fontSize: '14px', margin: '0 0 6px 0'
    }));
    var urbanPalette = ['#fff5f0', '#fb6a4a', '#67000d'];
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

  } else if (type === '生态') {
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
// Oh my eyes