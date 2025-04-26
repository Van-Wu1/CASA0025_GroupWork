// ===== Combined GEE Script =====
// Created: 20250425_2326
// Author: Vanvanvan
// Modules: 1style.js, 2data.js , 3layer.js, 4panel.js, 5onclick.js, 6query.js, 7main.js


// ===== 1style.js =====
// ========== STYLE ==========

// ===== [Xinyi Zeng] Begin: STYLE CONSTANTS =====
var PALETTE_NDVI = ['white', '#d9f0a3', '#addd8e', '#78c679', '#41ab5d', '#238443'];
var STYLE_TEMP = { color: 'black' };
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
  
  
var PALETTE_WATER = ['blue'];
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
  
// ===== [Xinyi Zeng] End =====
// ===== 2data.js  =====
// ===== data.js =====
// ========== DATASET LOADER & FILTERS ==========

/// ===== [Xinyi Zeng] Begin: DATA HANDLERS =====
var defaultRegion = ee.FeatureCollection("projects/casa0025geeappglaicier/assets/boundary/main_area"); //大区域
var boroughRegion = ee.FeatureCollection("projects/vanwu1/assets/testshp") //最后换入最终版本的行政区范围，现在仅为查询test版
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
function getNDVIImageByYear(year) {
  var assetPath = 'projects/casa0025geeappglaicier/assets/NDVI/NDVI_' + year;
  return ee.Image(assetPath).clip(defaultRegion);
}

function getTempByYear(year) {
  var assetPath = 'projects/casa0025geeappglaicier/assets/temperature/temp_' + year;
  return ee.Image(assetPath).clip(defaultRegion);
}

function getGlacierElevation(year) {
  var assetPath = 'users/ixizroiesxi/glacier_sum/glacier_changes_' + year + '_3band';
  var image = ee.Image(assetPath)
                .select('b1') 
                .clip(defaultRegion);
  return image;
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
    var glacImg = getGlacierElevation(year);
    return glacImg.visualize({ min: -6, max: 26, 
      palette: PALETTE_GLACIER });
  } else if (type === 'NDVI') {
    var ndviImg = getNDVIImageByYear(year);
    return classifyAndColorize(ndviImg);
  } else if (type === 'Temperature') {
    var tempImg = getTempByYear(year);
    return classifyAndColorizeTemperature(tempImg);//min(-30--35)max(20-25)
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

  if (type === '农业') {
    var imgnongye = ee.Image(base + 'SIr_clip').clip(defaultRegion);
    return imgnongye.visualize({
      min: 1, max: 2, //1不适宜， 2一般，没有3
      palette: ['#f7fcf5', '#00441b']
    });
  } else if (type === '城镇') {
    var imgchengzhen = ee.Image(base + 'SIu_clip').clip(defaultRegion);
    return imgchengzhen.visualize({
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
    panel.add(ui.Label('等待编写'));
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

// 温度
function renderTemperatureTable(yearL, valL, yearR, valR) {
  selectionInfoPanel.clear();

  var headerRow = ui.Panel({
    layout: ui.Panel.Layout.flow('horizontal'),
    style: {
      border: '1px solid #ccc',
      padding: '4px 0'
    },
    widgets: [
      ui.Label('', {width: '50px'}),
      ui.Label(yearL + ' 年', {
        width: '90px',
        fontWeight: 'bold',
        textAlign: 'center'
      }),
      ui.Label(yearR + ' 年', {
        width: '90px',
        fontWeight: 'bold',
        textAlign: 'center'
      })
    ]
  });
  
    function row(label, valL, valR) {
    return ui.Panel({
      layout: ui.Panel.Layout.flow('horizontal'),
      style: {
        border: '1px solid #ccc',
        padding: '2px'
      },
      widgets: [
        ui.Label(label, {width: '70px'}),
        ui.Label(valL, {width: '90px'}),
        ui.Label(valR, {width: '90px'})
      ]
    });
  }

  selectionInfoPanel.add(ui.Label('气温统计', {fontWeight: 'bold', margin: '4px 0'}));
  selectionInfoPanel.add(headerRow);
  selectionInfoPanel.add(row('平均温度', valL.mean + ' °C', valR.mean + ' °C'));
  selectionInfoPanel.add(row('最低温度', valL.min + ' °C', valR.min + ' °C'));
  selectionInfoPanel.add(row('最高温度', valL.max + ' °C', valR.max + ' °C'));
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


// NDVI
function queryNDVIInfo(feature, yearL, yearR) {
  var imgL = getNDVIImageByYear(yearL);
  var imgR = getNDVIImageByYear(yearR);

  var reducer = ee.Reducer.mean();
  var region = feature.geometry();

  var meanL = imgL.reduceRegion({reducer: reducer, geometry: region, scale: 250, maxPixels: 1e13});
  var meanR = imgR.reduceRegion({reducer: reducer, geometry: region, scale: 250, maxPixels: 1e13});

  ee.Dictionary(meanL).combine(meanR, true).evaluate(function(dict) {
    var valL = dict['NDVI'] || dict['constant'];
    var valR = dict['NDVI_1'] || dict['constant_1'];
    var display = 'NDVI 均值\n' + yearL + '年：' + formatNum(valL) + '\n' +
                                  yearR + '年：' + formatNum(valR);
    selectionLabel.setValue(display);
  });
}

// 水体面积
function queryWaterBodyInfo(feature, yearL, yearR) {
  var imgL = getWaterbodyByYear(yearL);
  var imgR = getWaterbodyByYear(yearR);

  var areaImg = ee.Image.pixelArea().divide(1e6);  // km²
  var region = feature.geometry();

  var areaL = imgL.multiply(areaImg).reduceRegion({
    reducer: ee.Reducer.sum(), geometry: region, scale: 30, maxPixels: 1e13
  });
  var areaR = imgR.multiply(areaImg).reduceRegion({
    reducer: ee.Reducer.sum(), geometry: region, scale: 30, maxPixels: 1e13
  });

  ee.Dictionary(areaL).combine(areaR, true).evaluate(function(dict) {
    var valL = dict['constant'];
    var valR = dict['constant_1'];
    var display = '水体面积\n' + yearL + '年：' + formatNum(valL) + ' km²\n' +
                                  yearR + '年：' + formatNum(valR) + ' km²';
    selectionLabel.setValue(display);
  });
}

// 数字格式处理
function formatNum(value) {
  return value ? Number(value).toFixed(2) : '无数据';
}

  
  // ===== [Yifan Wu] End =====
// ===== 7main.js =====
// ========== MAIN CONTROLLER ==========

// ===== [Xinyi Zeng] Begin: MAIN INIT =====
updateLeftLayer(LayerSelect.getValue(), yearSliderLeft.getValue());
updateRightLayer(LayerSelect.getValue(), yearSliderRight.getValue());

// ===== [Xinyi Zeng] End =====