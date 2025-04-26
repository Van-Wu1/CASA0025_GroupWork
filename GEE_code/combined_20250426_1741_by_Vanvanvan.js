// ===== Combined GEE Script =====
// Created: 20250426_1741
// Author: Vanvanvan
// Modules: 1style.js, 2data.js , 3layer.js, 4panel.js, 5onclick.js, 6query.js, 7main.js


// ===== 1style.js =====
// ========== STYLE ==========

// ===== [Xinyi Zeng] Begin: STYLE CONSTANTS =====


// UI Style
var buttonStyle = {
  height: '50px',
  width: '165px',
  fontSize: '14px',
  padding: '4px 10px',
  margin: '0px 6px 0px 0px'
};

var LayerSelectStyle = {
  height: '60px',
  width: '350px',
  fontSize: '14px',
  padding: '0px 10px',
  margin: '0px 6px 0px 0px'
};

// ===== [Xinyi Zeng] End =====
// ===== 2data.js  =====
// ===== data.js =====
// ========== DATASET LOADER & FILTERS ==========

/// ===== [Xinyi Zeng] Begin: DATA HANDLERS =====
var defaultRegion = ee.FeatureCollection("projects/casa0025geeappglaicier/assets/boundary/zone_clip"); //定义的冰川影响区域
var boroughRegion = ee.FeatureCollection("projects/casa0025geeappglaicier/assets/boundary/boundary_clip") //经行政区划分后的冰川影响区域
var boroughStyledOutline = boroughRegion.style({
  color: '#000000',
  fillColor: '#00000000', 
  width: 1
});
var boroughStyledContent = boroughRegion.style({
  color: '#00000000',
  fillColor: '#4A90E230',
  width: 2
});
// 这个放不到style里面
// 轮廓已更换为notion上的冰川影响区域，注意调用时更改为自己的用户名调试
// 曾习：已更换为小组资产并给予了所有人权限
// ===== [XinyiZeng] End =====

/// ===== [Xinyi Zeng] Begin: NDVI EXAMPLE 可视化失败版本 =====
// 评论：其实也还可以，看得出雏形了（V）
function getGlacierElevation(year) {
  var assetPath = 'users/ixizroiesxi/glacier_sum/glacier_changes_' + year + '_3band';
  var image = ee.Image(assetPath)
                .select('b1') 
                .clip(defaultRegion);
  return image;
}

function getTempByYear(year) {
  var assetPath = 'projects/casa0025geeappglaicier/assets/temperature/temp_' + year;
  return ee.Image(assetPath).clip(defaultRegion);
}

function getNDVIImageByYear(year) {
  var assetPath = 'projects/casa0025geeappglaicier/assets/NDVI/NDVI_' + year;
  return ee.Image(assetPath).clip(defaultRegion);
}
// ===== [XinyiZeng] End =====

// ===== [Yifan Wu] Begin: 自定义 Water Body; 预测试 =====
function getWaterbodyByYear(year) {
  var image = ee.ImageCollection("JRC/GSW1_4/YearlyHistory")
    .filter(ee.Filter.eq('year', year))
    .mosaic()
    .clip(boroughRegion);
  return image.gte(2).selfMask();  // 季节性和永久水体，后期可调
}
  
// ===== [Yifan Wu] End =====
// ===== 3layer.js =====
// ===== layer.js =====

// ===== [Xinyi Zeng] Begin: LAYER LOGIC =====
// ===== [Yifan Wu] Synchronization of dual map layers =====
function getLayer(type, year) {
  if (type === 'Glacier') {
    var glacImg = getGlacierElevation(year).clip(boroughRegion);
    // 分类分段（按数值范围重新编码）
    var classified = glacImg.expression(
    "b < -50 ? 1" +
    " : (b >= -50 && b < -20) ? 2" +
    " : (b >= -20 && b < 0) ? 3" +
    " : (b >= 0 && b < 20) ? 4" +
    " : (b >= 20) ? 5 : 0", { 'b': glacImg }
    ).selfMask();  // 去掉值为 0 的区域
  return classified.visualize({
    min: 1,
    max: 5,
    palette:['#a50026', '#f46d43', '#c2a5cf', '#5e4fa2', '#313695'],
    opacity: 0.95
    });
  } else if (type === 'Temperature') {
    var tempImg = getTempByYear(year);
    function classifyAndColorizeTemperature(temp) {
      temp = ee.Image(temp);
      var class1 = temp.updateMask(temp.gte(-35).and(temp.lt(-30))).visualize({palette: ['#313695']});
      var class2 = temp.updateMask(temp.gte(-30).and(temp.lt(-25))).visualize({palette: ['#4575b4']});
      var class3 = temp.updateMask(temp.gte(-25).and(temp.lt(-20))).visualize({palette: ['#74add1']});
      var class4 = temp.updateMask(temp.gte(-20).and(temp.lt(-15))).visualize({palette: ['#abd9e9']});
      var class5 = temp.updateMask(temp.gte(-15).and(temp.lt(-10))).visualize({palette: ['#c6dbef']});
      var class6 = temp.updateMask(temp.gte(-10).and(temp.lt(-5))).visualize({palette: ['#ffffbf']});
      var class7 = temp.updateMask(temp.gte(-5).and(temp.lt(0))).visualize({palette: ['#fee090']});
      var class8 = temp.updateMask(temp.gte(0).and(temp.lt(5))).visualize({palette: ['#fdae61']});
      var class9 = temp.updateMask(temp.gte(5).and(temp.lt(10))).visualize({palette: ['#f46d43']});
      var class10 = temp.updateMask(temp.gte(10).and(temp.lt(20))).visualize({palette: ['#d73027']});
      var class11 = temp.updateMask(temp.gte(20).and(temp.lte(25))).visualize({palette: ['#a50026']});
      return ee.ImageCollection([
        class1, class2, class3, class4, class5, class6,
        class7, class8, class9, class10, class11
      ]).mosaic();
    }
    return classifyAndColorizeTemperature(tempImg);//min(-30--35)max(20-25)
  } else if (type === 'NDVI') {
    var ndviImg = getNDVIImageByYear(year);
    function classifyAndColorize(ndvi) {
      ndvi = ee.Image(ndvi);
      var class1 = ndvi.updateMask(ndvi.lte(0.2)).visualize({palette: ['#c2b280']}); 
      var class2 = ndvi.updateMask(ndvi.gt(0.2).and(ndvi.lte(0.3))).visualize({palette: ['#d9f0a3']});
      var class3 = ndvi.updateMask(ndvi.gt(0.3).and(ndvi.lte(0.4))).visualize({palette: ['#addd8e']});
      var class4 = ndvi.updateMask(ndvi.gt(0.4).and(ndvi.lte(0.5))).visualize({palette: ['#78c679']});
      var class5 = ndvi.updateMask(ndvi.gt(0.5).and(ndvi.lte(0.6))).visualize({palette: ['#31a354']});
      var class6 = ndvi.updateMask(ndvi.gt(0.6)).visualize({palette: ['#006837']});
      return ee.ImageCollection([class1, class2, class3, class4, class5, class6]).mosaic();
    }
    return classifyAndColorize(ndviImg);
// ===== [Yifan Wu] Begin: LAYER ADd and Edit =====
  } else if (type === 'WaterBody') {
    var waterImg = getWaterbodyByYear(year);
    return waterImg.visualize({
      min: 1, max: 1, palette: 'blue'});
  }
  // ===== [Yifan Wu] End =====
}

// 双评价的那个图层切换器
function getLayer2(type) {
  var base = 'users/ixizroiesxi/';

  if (type === 'Ecology') {
    return ee.Image(base + 'Slefixed').visualize({
      min: 2, max: 3,
      palette: ['#1db302', '#abff57']
    });
  } else if (type === 'Agriculture') {
    var imgnongye = ee.Image(base + 'SIr_clip').clip(defaultRegion);
    return imgnongye.visualize({
      min: 1, max: 3, //1unsuitable， 2general，3suitable
      palette: ['#f6e27f', '#f4b400', '#C68600']
    });
  } else if (type === 'Urban') {
    var imgchengzhen = ee.Image(base + 'SIu_clip').clip(defaultRegion);
    return imgchengzhen.visualize({
      min: 1, max: 3, //1unsuitable， 2general，3suitable
      palette: ['#fff5f0', '#fb6a4a', '#67000d']
    });
  } else {
    return null;
  }
}

function updateLeftLayer(type, year) {
  leftMap.layers().reset();
  selectionInfoPanel.clear();
  var layer = getLayer(type, year);

  leftMap.addLayer(boroughStyledContent, {}, 'boroughFill');

  if (layer) {
    leftMap.addLayer(layer, {}, type + ' ' + year);
  } else {
    print(' 图层类型 "' + type + '" 暂无数据，仅为示例');
    leftLegend.clear(); 
  }

  leftMap.addLayer(boroughStyledOutline, {}, 'boroughOutline');
}

function updateRightLayer(type, year) {
  rightMap.layers().reset();
  selectionInfoPanel.clear();
  var layer = getLayer(type, year);

  rightMap.addLayer(boroughStyledContent, {}, 'boroughFill');

  if (layer) {
    rightMap.addLayer(layer, {}, type + ' ' + year);
    updateLegend(type, rightLegend); 
  } else {
    print(' 图层类型 "' + type + '" 暂无数据，仅为示例');
    rightLegend.clear();
  }

  rightMap.addLayer(boroughStyledOutline, {}, 'boroughOutline');
}

// 双评价部分的更新代码（为什么感觉一直在手搓啊
function updateEvaLayer(type) {
  section2Map.layers().reset(); 

  var layer = getLayer2(type);
  if (layer) {
    section2Map.addLayer(layer, {}, type + '评价图层');
  } else {
    print('暂无');
  }
}

// ===== [Yifan Wu] End =====
// ===== [Xinyi Zeng] End =====
// ===== 4panel.js =====
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
  items: ['Glacier', 'Temperature', 'NDVI', 'WaterBody'],
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
    
    var glacierPalette = ['#a50026', '#f46d43', '#c2a5cf', '#5e4fa2', '#313695'];
    var glacierLabels = [
      '< -50m (Extreme Ablation)', '-50 ~ -20m (Large Ablation)', '-20 ~ 0m(Small Ablation)', '0 ~ 20m(Minor Accumulation)', '> 20m(Significant Accumulation)'
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

// ===== [Shiyu Cheng] Begin =====
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
// Oh my eyes
// ===== [Shiyu Cheng] End =====


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
  selectionInfoPanel.clear();
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
    items: ['Ecology', 'Agriculture', 'Urban'],
    placeholder: 'section2 Map',
    value: 'Ecology',
    style: LayerSelectStyle,
    onChange: function(selected) {
      updateEvaLayer(selected);
      updateLegendSection2(selected, section2Legend); //更新图例
    }
  });

  leftPanel.widgets().set(3, LayerSelect2);
  selectionLabel.setValue('当前为 Section2');

  updateEvaLayer('Ecology');
  updateLegendSection2('Ecology', section2Legend); //找了一辈子位置

});

// Section1 切换逻辑
sec1.onClick(function () {
  selectionInfoPanel.clear();
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
// ===== 5onclick.js =====
// ===== onclick.js =====

// ===== [Yifan Wu] Begin 小区域点击判定 =====
var selectedFeatureLayer;

var selectedStyle = {
  color: '#00FFFF',
  width: 2,
  fillColor: '00000000'
};

function handleMapClick(coords, mapSide) {
  var point = ee.Geometry.Point(coords.lon, coords.lat);
  var selected = boroughRegion.filterBounds(point).first(); // 不用 evaluate 了！

  // 删除旧高亮图层
  if (selectedFeatureLayer) {
    leftMap.layers().remove(selectedFeatureLayer.left);
    rightMap.layers().remove(selectedFeatureLayer.right);
  }

  // 不等 evaluate，直接构造图层
  var fc = ee.FeatureCollection([selected]);  // 直接用 selected（是 ee.Feature）

  selectedFeatureLayer = {
    left: ui.Map.Layer(fc.style(selectedStyle)),
    right: ui.Map.Layer(fc.style(selectedStyle))
  };

  leftMap.layers().add(selectedFeatureLayer.left);
  rightMap.layers().add(selectedFeatureLayer.right);

  // 查询还得 evaluate，因为属性值只能这么取，，，更新点击判定逻辑，一次点击一次更新
  selected.evaluate(function(feat) {
    if (feat) {
      var feature = ee.Feature(feat);
  
      var type = LayerSelect.getValue();
      var yearL = yearSliderLeft.getValue();
      var yearR = yearSliderRight.getValue();
  
      if (type === 'Temperature') {
        queryTemperatureInfo(feature, yearL, yearR);
      } else if (type === 'NDVI') {
        queryNDVIInfo(feature, yearL, yearR);
      } else if (type === 'WaterBody') {
        queryWaterBodyInfo(feature, yearL, yearR);
      } else {
        selectionLabel.setValue('已选中一个区域（该图层暂不支持查询）');
      }
  
    } else {
      selectionLabel.setValue('未选中任何区域');
    }
  });
  
}

leftMap.onClick(function(coords) {
  handleMapClick(coords, 'left');
});
rightMap.onClick(function(coords) {
  handleMapClick(coords, 'right');
});

// ===== [Yifan Wu] End =====
// ===== 6query.js =====
// ===== query.js =====

// ===== [Yifan Wu] Begin 查询测试 =====
// ===== query.js =====

function queryFeatureInfo(feature) {
  var type = LayerSelect.getValue();  // 统一用 LayerSelect（而不是 leftLayerSelect）？？？
  var yearLeft = yearSliderLeft.getValue(); // 这个位置是把滑条年份打包
  var yearRight = yearSliderRight.getValue();
  if (type === 'Temperature') {
    queryTemperatureInfo(feature, yearLeft, yearRight);
  } else if (type === 'NDVI') {
    queryNDVIInfo(feature, yearLeft, yearRight);
  } else if (type === 'WaterBody') {
    queryWaterBodyInfo(feature, yearLeft, yearRight);
  } else {
    selectionLabel.setValue('已选中区域（该图层无支持的查询功能）');
  }
}

// ====================== Temp ======================




// ====================== Temp ======================
function renderTemperatureTable(yearL, valL, yearR, valR) {
  selectionInfoPanel.clear();

  // 插值计算
  function getDiff(val1, val2) {
    if (val1 === '无数据' || val2 === '无数据') return 'NA';
    return formatNum(val2 - val1);
  }

  // 表头行
  var headerRow = ui.Panel({
    layout: ui.Panel.Layout.flow('horizontal'),
    style: {
      border: '1px solid #ccc',
      padding: '4px 0'
    },
    widgets: [
      ui.Label('', {width: '58px'}),
      ui.Label(yearL, {width: '58px', textAlign: 'center'}),
      ui.Label(yearR, {width: '58px', textAlign: 'center'}),
      ui.Label('Difference', {width: '70px', textAlign: 'center', fontWeight: 'bold'})
    ]
  });

  // 行
  function row(label, v1, v2) {
    return ui.Panel({
      layout: ui.Panel.Layout.flow('horizontal'),
      style: {
        border: '1px solid #ccc',
        padding: '2px'
      },
      widgets: [
        ui.Label(label, {width: '58px'}),
        ui.Label(v1 + ' °C', {width: '58px'}),
        ui.Label(v2 + ' °C', {width: '58px'}),
        ui.Label(getDiff(Number(v1), Number(v2)) + ' °C', {
          width: '70px',
          fontWeight: 'bold',
          color: getDiff(Number(v1), Number(v2)) > 0 ? '#d73027' : '#1a9850' // 红升绿降
        })
      ]
    });
  }

  selectionInfoPanel.add(ui.Label('Attribute Table (Temperature)', {
    fontWeight: 'bold',
    margin: '4px 0'
  }));
  selectionInfoPanel.add(headerRow);
  selectionInfoPanel.add(row('mean', valL.mean, valR.mean));
  selectionInfoPanel.add(row('min', valL.min, valR.min));
  selectionInfoPanel.add(row('max', valL.max, valR.max));
}

function queryTemperatureInfo(feature, yearL, yearR) {
  var region = feature.geometry();
  var bandName = 'b1'; // 不同图层得先设置断点提取这个什么banName好麻烦

  var imgL = getTempByYear(yearL).select(bandName).rename('temp').clip(region);
  var imgR = getTempByYear(yearR).select(bandName).rename('temp').clip(region);

  var reducers = ee.Reducer.mean().combine({
    reducer2: ee.Reducer.minMax(),
    sharedInputs: true
  });

  var statL = imgL.reduceRegion({reducer: reducers, geometry: region, scale: 1000, maxPixels: 1e13});
  var statR = imgR.reduceRegion({reducer: reducers, geometry: region, scale: 1000, maxPixels: 1e13});

  // 用嵌套 evaluate 确保两个结果都正常解析，老天奶终于出来了...
  statL.evaluate(function(dictL) {
    statR.evaluate(function(dictR) {
      var valL = {
        mean: formatNum(dictL['temp_mean']),
        min: formatNum(dictL['temp_min']),
        max: formatNum(dictL['temp_max'])
      };
      var valR = {
        mean: formatNum(dictR['temp_mean']),
        min: formatNum(dictR['temp_min']),
        max: formatNum(dictR['temp_max'])
      };

      renderTemperatureTable(yearL, valL, yearR, valR);
    });
  });
}

  // // Breakpoint Test
  // var clipped_L = getTempByYear(yearL).clip(feature.geometry());
  // var clipped_R = getTempByYear(yearR).clip(feature.geometry());
  // print('left', clipped_L);
  // print('right', clipped_R)

  // print('Selected feature geometry', feature.geometry());
  // Map.addLayer(feature.geometry(), {color: 'red'}, '选中区域边界');

  // var tempImage = getTempByYear(2000);
  // print('Band names of temp_2000:', tempImage.bandNames());

  // print('statL', statL);
  // print('statR', statR);


// ====================== NDVI ======================
function renderNDVITable(yearL, valL, yearR, valR) {
  selectionInfoPanel.clear();

  function getDiff(val1, val2) {
    if (val1 === '无数据' || val2 === '无数据') return 'NA';
    return formatNum(val2 - val1);
  }

  var headerRow = ui.Panel({
    layout: ui.Panel.Layout.flow('horizontal'),
    style: {
      border: '1px solid #ccc',
      padding: '4px 0'
    },
    widgets: [
      ui.Label('', {width: '58px'}),
      ui.Label(yearL, {width: '58px', textAlign: 'center'}),
      ui.Label(yearR, {width: '58px', textAlign: 'center'}),
      ui.Label('Difference', {width: '70px', textAlign: 'center', fontWeight: 'bold'})
    ]
  });

  function row(label, v1, v2) {
    return ui.Panel({
      layout: ui.Panel.Layout.flow('horizontal'),
      style: {
        border: '1px solid #ccc',
        padding: '2px'
      },
      widgets: [
        ui.Label(label, {width: '58px'}),
        ui.Label(v1, {width: '58px'}),
        ui.Label(v2, {width: '58px'}),
        ui.Label(getDiff(Number(v1), Number(v2)), {
          width: '70px',
          fontWeight: 'bold',
          color: getDiff(Number(v1), Number(v2)) > 0 ? '#d73027' : '#1a9850'
        })
      ]
    });
  }

  selectionInfoPanel.add(ui.Label('Attribute Table (NDVI)', {
    fontWeight: 'bold',
    margin: '4px 0'
  }));
  selectionInfoPanel.add(headerRow);
  selectionInfoPanel.add(row('mean', valL.mean, valR.mean));
  selectionInfoPanel.add(row('min', valL.min, valR.min));
  selectionInfoPanel.add(row('max', valL.max, valR.max));
}

function queryNDVIInfo(feature, yearL, yearR) {
  var region = feature.geometry();
  var bandName = 'b1'; // 这个跑出来是b1

  var imgL = getNDVIImageByYear(yearL).select(bandName).rename('NDVI').clip(region);
  var imgR = getNDVIImageByYear(yearR).select(bandName).rename('NDVI').clip(region);

  // var ndviImage = getNDVIImageByYear(2000);
  // print('Band names of NDVI 2000:', ndviImage.bandNames());

  var reducers = ee.Reducer.mean().combine({
    reducer2: ee.Reducer.minMax(),
    sharedInputs: true
  });

  var statL = imgL.reduceRegion({reducer: reducers, geometry: region, scale: 250, maxPixels: 1e13});
  var statR = imgR.reduceRegion({reducer: reducers, geometry: region, scale: 250, maxPixels: 1e13});

  statL.evaluate(function(dictL) {
    statR.evaluate(function(dictR) {
      var valL = {
        mean: formatNum(dictL['NDVI_mean'] || dictL['constant_mean']),
        min: formatNum(dictL['NDVI_min'] || dictL['constant_min']),
        max: formatNum(dictL['NDVI_max'] || dictL['constant_max'])
      };
      var valR = {
        mean: formatNum(dictR['NDVI_mean'] || dictR['constant_mean']),
        min: formatNum(dictR['NDVI_min'] || dictR['constant_min']),
        max: formatNum(dictR['NDVI_max'] || dictR['constant_max'])
      };

      renderNDVITable(yearL, valL, yearR, valR);
    });
  });
}


// ====================== WaterBody ======================
function renderWaterBodyTable(yearL, valL, yearR, valR) {
  selectionInfoPanel.clear();

  function getDiff(val1, val2) {
    if (val1 === '无数据' || val2 === '无数据') return 'NA';
    return formatNum(val2 - val1);
  }

  var headerRow = ui.Panel({
    layout: ui.Panel.Layout.flow('horizontal'),
    style: {
      border: '1px solid #ccc',
      padding: '4px 0'
    },
    widgets: [
      ui.Label('', {width: '60px'}),
      ui.Label(yearL, {width: '60px', textAlign: 'center'}),
      ui.Label(yearR, {width: '60px', textAlign: 'center'}),
      ui.Label('Difference', {width: '70px', textAlign: 'center', fontWeight: 'bold'})
    ]
  });

  function row(label, v1, v2) {
    return ui.Panel({
      layout: ui.Panel.Layout.flow('horizontal'),
      style: {
        border: '1px solid #ccc',
        padding: '2px'
      },
      widgets: [
        ui.Label(label, {width: '60px'}),
        ui.Label(v1 + ' km²', {width: '60px'}),
        ui.Label(v2 + ' km²', {width: '60px'}),
        ui.Label(getDiff(Number(v1), Number(v2)) + ' km²', {
          width: '70px',
          fontWeight: 'bold',
          color: getDiff(Number(v1), Number(v2)) > 0 ? '#3182bd' : '#31a354'
        })
      ]
    });
  }

  selectionInfoPanel.add(ui.Label('Attribute Table (Water Body Area)', {
    fontWeight: 'bold',
    margin: '4px 0'
  }));
  selectionInfoPanel.add(headerRow);
  selectionInfoPanel.add(row('Area', valL, valR));
}


function queryWaterBodyInfo(feature, yearL, yearR) {
  var region = feature.geometry();
  var bandName = 'waterClass'; // 这个叫 叫什么我看看 waterClass

  var imgL = getWaterbodyByYear(yearL).select(bandName).rename('water');
  var imgR = getWaterbodyByYear(yearR).select(bandName).rename('water');

  // var waterImage = getWaterbodyByYear(2000);
  // print('Band names of Water Body 2000:', waterImage.bandNames());

  var areaImg = ee.Image.pixelArea().divide(1e6);  // 平方千米

  var areaL = imgL.multiply(areaImg).reduceRegion({
    reducer: ee.Reducer.sum(),
    geometry: region,
    scale: 30,
    maxPixels: 1e13
  });

  var areaR = imgR.multiply(areaImg).reduceRegion({
    reducer: ee.Reducer.sum(),
    geometry: region,
    scale: 30,
    maxPixels: 1e13
  });

  areaL.evaluate(function(dictL) {
    areaR.evaluate(function(dictR) {
      var valL = formatNum(dictL['water']);
      var valR = formatNum(dictR['water']);
      renderWaterBodyTable(yearL, valL, yearR, valR);
    });
  });
}

// ====================== Digital format processing ======================
function formatNum(value) {
  return value !== null && value !== undefined && !isNaN(value) ? Number(value).toFixed(2) : '无数据';
}
  
// ===== [Yifan Wu] End 真把我当日本人整啊 =====
// ===== 7main.js =====
// ========== MAIN CONTROLLER ==========

// ===== [Xinyi Zeng] Begin: MAIN INIT =====
updateLeftLayer(LayerSelect.getValue(), yearSliderLeft.getValue());
updateRightLayer(LayerSelect.getValue(), yearSliderRight.getValue());

// ===== [Xinyi Zeng] End =====