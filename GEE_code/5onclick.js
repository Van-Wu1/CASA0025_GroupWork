// ===== onclick.js =====

// =============== section1 Click determination ===============
var selectedFeatureLayer;

var selectedStyle = {
  color: '#00FFFF',
  width: 2,
  fillColor: '00000000'
};

function handleMapClick(coords, mapSide) {
  var point = ee.Geometry.Point(coords.lon, coords.lat);
  var selected = boroughRegion.filterBounds(point).first();

  // Delete the old highlighting layer
  if (selectedFeatureLayer) {
    leftMap.layers().remove(selectedFeatureLayer.left);
    rightMap.layers().remove(selectedFeatureLayer.right);
  }

  // Construct the layer directly without waiting for evaluation
  var fc = ee.FeatureCollection([selected]);

  selectedFeatureLayer = {
    left: ui.Map.Layer(fc.style(selectedStyle)),
    right: ui.Map.Layer(fc.style(selectedStyle))
  };

  leftMap.layers().add(selectedFeatureLayer.left);
  rightMap.layers().add(selectedFeatureLayer.right);

  selected.evaluate(function(feat) {
    if (feat) {
      var feature = ee.Feature(feat);
      var name_en = feature.get('name_en');

      print(feature);
      print(name_en);

      name_en.evaluate(function(nameVal) {
        var type = LayerSelect.getValue();
        var yearL = yearSliderLeft.getValue();
        var yearR = yearSliderRight.getValue();
  
        if (type === 'Temperature') {
          selectionLabel.setValue('✔ Selected(Temperature) (' + nameVal + ') Loading ⏳');
          queryTemperatureInfo(feature, yearL, yearR);
        } else if (type === 'NDVI') {
          selectionLabel.setValue('✔ Selected(NDVI) (' + nameVal + ') Loading ⏳');
          queryNDVIInfo(feature, yearL, yearR);
        } else if (type === 'WaterBody') {
          selectionLabel.setValue('✔ Selected(WaterBody) (' + nameVal + ') Loading ⏳');
          queryWaterBodyInfo(feature, yearL, yearR);
        } else if (type === 'Glacier') {
          selectionLabel.setValue('✔ Selected(Glacier) (' + nameVal + ') Loading ⏳');
        } else {
          selectionLabel.setValue('❌ 404 not found');
        }
      });

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

// =============== section3 Click determination ===============
// The query logic of this part is placed here
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

        // header
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

        // each line
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

        selectionInfoPanel.add(ui.Label('📍 Longitude: ' + coords.lon.toFixed(6)));
        selectionInfoPanel.add(ui.Label('📍 Latitude: ' + coords.lat.toFixed(6)));
      });
    });
  });
}
