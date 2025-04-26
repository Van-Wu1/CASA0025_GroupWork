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
        selectionLabel.setValue('✔ Selected(Temperature): The table is loading...');
        queryTemperatureInfo(feature, yearL, yearR);
      } else if (type === 'NDVI') {
        selectionLabel.setValue('✔ Selected(NDVI): The table is loading...');
        queryNDVIInfo(feature, yearL, yearR);
      } else if (type === 'WaterBody') {
        selectionLabel.setValue('✔ Selected(WaterBody): The table is loading...');
        queryWaterBodyInfo(feature, yearL, yearR);
      } else if (type === 'Glacier') {
        selectionLabel.setValue('✔ Selected(Glacier): The table is loading...');
        queryGlacierInfo(feature, yearL, yearR);
        // selectionLabel.setValue('选中冰川，暂未调取query，断点测试中');
      } else {
        selectionLabel.setValue('❌ 404 not found');
      }
  
    } else {
      selectionLabel.setValue('❌ 404 not found');
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