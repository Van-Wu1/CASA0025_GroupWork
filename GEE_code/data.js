// ===== data.js =====
// ========== DATASET LOADER & FILTERS ==========

/// ===== [Xinyi Zeng] Begin: DATA HANDLERS =====
var defaultRegion = ee.Geometry.Rectangle([78, 26, 104, 39]); // 这个范围再商议，目前为了测试是一个随机的很小的范围
// ===== [XinyiZeng] End =====

/// ===== [Xinyi Zeng] Begin: NDVI EXAMPLE 可视化失败版本 =====
// 评论：其实也还可以，看得出雏形了（V）
var modisNDVI = ee.ImageCollection("MODIS/006/MOD13Q1")
  .filterBounds(defaultRegion)
  .select("NDVI");

function getNDVIImageByYear(year) {
  return modisNDVI
    .filter(ee.Filter.calendarRange(year, year, 'year'))
    .max()
    .multiply(0.0001)  // normalize to 0–1
    .clip(defaultRegion);
}

function getSentinel2Filtered(year, cloudThreshold) {
  return ee.ImageCollection('COPERNICUS/S2_SR')
    .filterBounds(defaultRegion)
    .filterDate(year + '-01-01', year + '-12-31')
    .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', cloudThreshold));
}

function getGlacierBoundary() {
  return ee.FeatureCollection("FAKE/RGI").filterBounds(defaultRegion);
}
// ===== [XinyiZeng] End =====


// ===== [Yifan Wu] Begin: 自定义 Water Body; 预测试 =====
var waterbody = ee.ImageCollection("JRC/GSW1_4/YearlyHistory")
  .filterBounds(defaultRegion)
  .select("WaterBody");

function getWaterbodyByYear(year) {
  var image = ee.ImageCollection("JRC/GSW1_4/YearlyHistory")
    .filter(ee.Filter.eq('year', year))
    .mosaic()
    .clip(defaultRegion);
  return image.gte(2).selfMask();  // 季节性和永久水体，后期可调
}
  
// ===== [Yifan Wu] End =====


// 可根据项目需要扩展更多数据集加载函数，如：
/*
  - getPrecipitationByYear
  - getGlacierThickness(year)
  - getLandsat(year, cloudCover)
*/
