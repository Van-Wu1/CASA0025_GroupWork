// ===== Combined GEE Script =====
// Created: 20250425_1653
// Author: Vanvanvan
// Modules: 1style.js, 2data.js , 3layer.js, 4panel.js, 5onclick.js, 6query.js, 7main.js


// ===== 1style.js =====
// ========== STYLE ==========

// ===== [Xinyi Zeng] Begin: STYLE CONSTANTS =====
var PALETTE_GLACIER = ['blue', 'white', 'red'];
var PALETTE_NDVI = ['white', '#d9f0a3', '#addd8e', '#78c679', '#41ab5d', '#238443'];
var STYLE_TEMP = { color: 'black' };
var PALETTE_TEMP =['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8','#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']
var PALETTE_WATER = ['blue'];

// ===== [Xinyi Zeng] End =====
// ===== 2data.js  =====
// ===== data.js =====
// ========== DATASET LOADER & FILTERS ==========

/// ===== [Xinyi Zeng] Begin: DATA HANDLERS =====
var defaultRegion = ee.FeatureCollection("projects/casa0025geeappglaicier/assets/boundary/main_area"); //大区域
var boroughRegion = ee.FeatureCollection("projects/vanwu1/assets/testshp") //最后换入最终版本的行政区范围，现在仅为查询test版
var boroughStyledOutline = boroughRegion.style({
  color: '#ffffff',
  fillColor: '#00000000', 
  width: 2
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
function getNDVIImageByYear(year) {
  var assetPath = 'projects/casa0025geeappglaicier/assets/NDVI/NDVI_' + year;
  return ee.Image(assetPath).clip(defaultRegion);
}

function getTempByYear(year) {
  var assetPath = 'projects/casa0025geeappglaicier/assets/temperature/temp_' + year;
  return ee.Image(assetPath).clip(defaultRegion);
}

function getGlacierBoundary() {
  return ee.FeatureCollection("FAKE/RGI").filterBounds(defaultRegion);
}
// ===== [XinyiZeng] End =====


// ===== [Yifan Wu] Begin: 自定义 Water Body; 预测试 =====
function getWaterbodyByYear(year) {
  var image = ee.ImageCollection("JRC/GSW1_4/YearlyHistory")
    .filter(ee.Filter.eq('year', year))
    .mosaic()
    .clip(defaultRegion);
  return image.gte(2).selfMask();  // 季节性和永久水体，后期可调
}
  
// ===== [Yifan Wu] End =====

function getSIRtiff(){
  var image = ee.ImageCollection("users/ixizroiexsxi/SIr_clip")
               .map(function(img) {
                 return img.clip(defaultRegion);
               });
  return image;
}


function getSIUtiff(){
  var image = ee.ImageCollection("users/ixizroiexsxi/SIu_clip")
               .map(function(img) {
                 return img.clip(defaultRegion);
               });
  return image;
}



// function getSIrTiff(){
//   var assetPath = 'users/ixizroiesxi/SIr_clip'
//   return ee.Image(assetPath).clip(defaultRegion) 
// }

// function getSIuTiff(){
//   var assetPath = 'users/ixizroiesxi/SIu_clip'
//   return ee.Image(assetPath).clip(defaultRegion) 
// }
// ===== 3layer.js =====
// ===== layer.js =====

// ===== [Xinyi Zeng] Begin: LAYER LOGIC =====
// ===== [Yifan Wu] Synchronization of dual map layers =====
function getLayer(type, year) {
  if (type === 'Glacier') {
    return null;
  } else if (type === 'NDVI') {
    var ndviImg = getNDVIImageByYear(year);
    return ndviImg.visualize({ min: 0, max: 1, palette: PALETTE_NDVI });
  } else if (type === 'Temperature') {
    var tempImg = getTempByYear(year);
    return tempImg.visualize({ min: -35, max: 25, palette: PALETTE_TEMP });//min(-30--35)max(20-25)
// ===== [Yifan Wu] Begin: LAYER ADd and Edit =====
  } else if (type === 'WaterBody') {
    var waterImg = getWaterbodyByYear(year);
    return waterImg.visualize({
      min: 1, max: 1, palette: PALETTE_WATER});
  }
  // ===== [Yifan Wu] End =====
}

// 双评价的那个图层切换器
function getLayer2(type) {
  var base = 'users/ixizroiesxi/';
  var palette = ['#f7fcf5', '#00441b']; 

  if (type === '农业') {
    var SIrImg = getSIrTiff();
    return SIrImg.visualize({
      min: 1, max: 2, //1不适宜， 2一般，没有3
      palette: palette
    });
  } else if (type === '城镇') {
    var SIrImg = getSIuTiff();
    return SIrImg.visualize({
      min: 1, max: 3, //1不适宜， 2一般，3适宜
      palette: ['#fff5f0', '#fb6a4a', '#67000d']
    });
  } else if (type === '生态') {
    return ee.Image(base + 'Slefixed').visualize({
      min: 2, max: 3,
      palette: ['#1db302', '#abff57']
    });
  } else {
    return null;
  }
}


function updateLeftLayer(type, year) {
  leftMap.layers().reset();
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

// 4 Layer选择（双地图锁定）
var LayerSelect = ui.Select({
  items: ['Glacier', 'NDVI', 'Temperature','WaterBody'],
  placeholder: 'Left Layer, Right Layer',
  value: 'Glacier',
  style: buttonStyle,
  onChange: function(selected) {
    updateLeftLayer(selected, yearSliderLeft.getValue());
    updateRightLayer(selected, yearSliderRight.getValue());
  }
});

// 5 选中区域（废版留着占位）
var selectionLabel = ui.Label('未选中任何区域（废版留着占位）', {
  fontWeight: 'bold', fontSize: '16px', margin: '4px 10px'
});

// 6 总体
var leftPanel = ui.Panel({
  widgets: [header, intro, bottomPanel, LayerSelect, selectionLabel],
  layout: ui.Panel.Layout.flow('vertical'),
  style: {
    padding: '10px',
    width: '350px' //左侧框架宽度已做限定
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
  var title = ui.Label('Legend: ' + type, {fontWeight: 'bold'});
  panel.add(title);
  if (type === 'NDVI') {
    panel.add(ui.Label('NDVI range: 0 (brown) – 0.8 (green)'));
  
    // 渐变色块
    var gradient = ui.Thumbnail({
      image: ee.Image.pixelLonLat().select(0),
      params: {
        bbox: [0, 0, 1, 0.1], 
        dimensions: '100x10',
        format: 'png',
        min: 0,
        max: 1,
        palette: ['#654321', '#8B5A2B', '#A0522D', '#9ACD32', '#228B22', '#006400']
      },
      style: {
        stretch: 'horizontal',
        margin: '4px 0 4px 20px'
      }
    });
    panel.add(gradient);
  } else if (type === 'Glacier') {
    panel.add(ui.Label('等待编写'));
  } else if (type === 'Temperature') {
    panel.add(ui.Label('Temperature (°C)')); //这个位置需要再次确认加编写文本
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

    panel.add(gradient);
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
  widgets: [ui.Label('Left Controls'), yearSliderLeft],
  style: {position: 'top-left', padding: '8px', width: '250px'}
});

var rightTopPanel = ui.Panel({
  widgets: [ui.Label('Right Controls'), yearSliderRight],
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

  // 替换 LayerSelect
  var LayerSelect2 = ui.Select({
    items: ['农业', '生态', '城镇'],
    placeholder: '选择图层',
    style: buttonStyle,
    onChange: function(selected) {
      updateEvaLayer(selected);
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

  // 查询还得 evaluate，因为属性值只能这么取
  selected.evaluate(function(feat) {
    if (feat) {
      var feature = ee.Feature(feat);
      queryFeatureInfo(feature, mapSide);
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
function queryFeatureInfo(feature) {
    var type = leftLayerSelect.getValue();
    var year = yearSlider.getValue();
  
    if (type === 'WaterBody') {
      queryWaterInfo(feature, year);
    } else if (type === 'NDVI') {
      queryNDVIInfo(feature, year);
    } else {
      selectionLabel.setValue('已选中一个区域（该图层无属性信息）');
    }
  }
  
  function queryWaterInfo(feature, year) {
    var water = getWaterbodyByYear(year);
    var pixelArea = ee.Image.pixelArea().divide(1e6); 
    var waterArea = water.multiply(pixelArea).reduceRegion({
      reducer: ee.Reducer.sum(),
      geometry: feature.geometry(),
      scale: 30,
      maxPixels: 1e13
    });
  
    waterArea.evaluate(function(result) {
      var area = result['constant'];
      var value = area ? area.toFixed(2) : '0';
      selectionLabel.setValue('已选中一个区域\n暂时无法显示信息');
    });
  }
  
  function queryNDVIInfo(feature, year) {
    var ndvi = getNDVIImageByYear(year);
    var stats = ndvi.reduceRegion({
      reducer: ee.Reducer.mean(),
      geometry: feature.geometry(),
      scale: 250,
      maxPixels: 1e13
    });
  
    stats.evaluate(function(result) {
      var meanNDVI = result['NDVI'];
      var value = meanNDVI ? meanNDVI.toFixed(3) : '无数据';
      selectionLabel.setValue('已选中一个区域\n平均 NDVI：' + value);
    });
  }
  
  // ===== [Yifan Wu] End =====
// ===== 7main.js =====
// ========== MAIN CONTROLLER ==========

// ===== [Xinyi Zeng] Begin: MAIN INIT =====
updateLeftLayer(LayerSelect.getValue(), yearSliderLeft.getValue());
updateRightLayer(LayerSelect.getValue(), yearSliderRight.getValue());

// ===== [Xinyi Zeng] End =====