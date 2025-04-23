// ===== draw.js =====

// ===== [Yifan Wu] Begin 小区域点击判定 =====

var selectedLayerLeft;   // 左图点击选中图层
var selectedLayerRight;  // 右图点击选中图层

// 左图点击逻辑
leftMap.onClick(function(coords) {
  var point = ee.Geometry.Point(coords.lon, coords.lat);
  var selected = defaultRegion.filterBounds(point).first();

  if (selectedLayerLeft) {
    leftMap.layers().remove(selectedLayerLeft);
  }

  selected.evaluate(function(feat) {
    if (feat) {
      var feature = ee.Feature(feat);
      var fc = ee.FeatureCollection([feature]);
      selectedLayerLeft = ui.Map.Layer(fc.style({color: 'red', width: 2, fillColor: '00000000'}));
      leftMap.layers().add(selectedLayerLeft);

      // 💡 调用左图的查询函数
      queryFeatureInfo(feature, 'left');
    } else {
      selectionLabel.setValue('未选中任何区域');
    }
  });
});

// 右图点击逻辑
rightMap.onClick(function(coords) {
  var point = ee.Geometry.Point(coords.lon, coords.lat);
  var selected = defaultRegion.filterBounds(point).first();

  if (selectedLayerRight) {
    rightMap.layers().remove(selectedLayerRight);
  }

  selected.evaluate(function(feat) {
    if (feat) {
      var feature = ee.Feature(feat);
      var fc = ee.FeatureCollection([feature]);
      selectedLayerRight = ui.Map.Layer(fc.style({color: 'blue', width: 2, fillColor: '00000000'}));  // 蓝色表示右图
      rightMap.layers().add(selectedLayerRight);

      // 💡 调用右图的查询函数
      queryFeatureInfo(feature, 'right');
    } else {
      selectionLabel.setValue('未选中任何区域');
    }
  });
});
  
// ===== [Yifan Wu] End =====