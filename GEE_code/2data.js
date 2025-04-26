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