
#  GEE 图层测试模板说明（组员请按指引完成）

亲爱的北鼻们，为确保你们编写的图层加载函数（如冰川厚度、NDVI、冰川边界等）正确运行，请按照以下模板进行测试。

---

## 1. 使用方式

1. 打开 Google Earth Engine: https://code.earthengine.google.com/
2. 创建一个新的脚本文件（不要在我们的作业库下）
3. 粘贴下面对应的模板代码
4. 替换你自己的 asset 路径 / 变量
5. 点击运行，检查图层是否加载成功、显示正常
6. 测试通过后，请告知

---

## 示例模板：冰川厚度图层（getThicknessLayer）

```javascript
var year = 2005;

function getThicknessLayer(year) {
  var image = ee.Image('users/yourname/thickness_' + year); // 替换为你的 asset 路径
  return image.visualize({
    min: -50,
    max: 0,
    palette: ['blue', 'white', 'red']
  });
}

Map.centerObject(ee.Geometry.Point([85, 30]), 6);
Map.addLayer(getThicknessLayer(year), {}, 'Thickness ' + year);
```

---

## 示例模板：NDVI 图层（getNDVILayer）

```javascript
var year = 2015;

function getNDVILayer(year) {
  var ndvi = ee.ImageCollection('MODIS/006/MOD13Q1')
    .filterDate(ee.Date.fromYMD(year, 6, 1), ee.Date.fromYMD(year, 9, 30))
    .select('NDVI')
    .mean()
    .multiply(0.0001);

  return ndvi.visualize({
    min: 0,
    max: 0.8,
    palette: ['brown', 'green']
  });
}

Map.setCenter(90, 32, 6);
Map.addLayer(getNDVILayer(year), {}, 'NDVI ' + year);
```

---

## 示例模板：冰川边界图层（getBoundaryLayer）

```javascript
function getBoundaryLayer() {
  var rgi = ee.FeatureCollection('users/yourname/rgi_clip'); // 替换 asset 路径
  return rgi.style({
    color: 'black',
    width: 1
  });
}

Map.setCenter(88, 28, 7);
Map.addLayer(getBoundaryLayer(), {}, 'Glacier Boundary');
```

---

### 提交方式建议

- 将函数代码贴到 GitHub `GEE_code/layers.js`
