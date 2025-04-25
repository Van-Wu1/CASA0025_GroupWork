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