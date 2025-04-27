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

// =============== conflict点击判定 ===============
// 这部分的query也放这里了，没时间逻辑分块了
function setupConflictDetection() {
  section3Map.onClick(function(coords) {
    selectionInfoPanel.clear();

    var point = ee.Geometry.Point(coords.lon, coords.lat);

    var urban_value = conflict_urban_layer.reduceRegion({
      reducer: ee.Reducer.first(),
      geometry: point,
      scale: 10,
      bestEffort: true,
      maxPixels: 1e8
    });

    var cropland_value = conflict_cropland_layer.reduceRegion({
      reducer: ee.Reducer.first(),
      geometry: point,
      scale: 10,
      bestEffort: true,
      maxPixels: 1e8
    });

    urban_value.evaluate(function(urbanVal) {
      cropland_value.evaluate(function(cropVal) {
        
        var isUrban = urbanVal.Map === 1;
        var isCropland = cropVal.Map === 1;

        // 创建表头
        var headerRow = ui.Panel({
          layout: ui.Panel.Layout.flow('horizontal'),
          style: {
            border: '1px solid #ccc',
            padding: '4px 0'
          },
          widgets: [
            ui.Label('Conflict Type', {width: '160px', fontWeight: 'bold', textAlign: 'center'}),
            ui.Label('Status', {width: '100px', fontWeight: 'bold', textAlign: 'center'})
          ]
        });

        // 创建每一行
        function createRow(label, status, color) {
          return ui.Panel({
            layout: ui.Panel.Layout.flow('horizontal'),
            style: {
              border: '1px solid #ccc',
              padding: '2px'
            },
            widgets: [
              ui.Label(label, {width: '160px'}),
              ui.Label(status, {
                width: '100px',
                fontWeight: 'bold',
                textAlign: 'center',
                color: color
              })
            ]
          });
        }

        selectionInfoPanel.add(ui.Label('Conflict Detection Results', {
          fontWeight: 'bold',
          margin: '4px 0'
        }));
        selectionInfoPanel.add(headerRow);

        if (isUrban) {
          selectionInfoPanel.add(createRow('🏙️ Built-up zone', 'Conflict', 'red'));
        } else {
          selectionInfoPanel.add(createRow('🏙️ Built-up zone', 'No conflict', 'green'));
        }

        if (isCropland) {
          selectionInfoPanel.add(createRow('🌾 Cropland', 'Conflict', 'orange'));
        } else {
          selectionInfoPanel.add(createRow('🌾 Cropland', 'No conflict', 'green'));
        }

        // 加经纬度信息
        selectionInfoPanel.add(ui.Label('📍 Longitude: ' + coords.lon.toFixed(6)));
        selectionInfoPanel.add(ui.Label('📍 Latitude: ' + coords.lat.toFixed(6)));
      });
    });
  });
}



// ===== [Yifan Wu] End =====