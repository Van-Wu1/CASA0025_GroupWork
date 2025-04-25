// ========== STYLE ==========

// ===== [Xinyi Zeng] Begin: STYLE CONSTANTS =====
var PALETTE_GLACIER = ['blue', 'white', 'red'];
var PALETTE_NDVI = ['#a6611a', '#d9f0a3', '#addd8e', '#78c679', '#31a354', '#006837'];
var STYLE_TEMP = { color: 'black' };
var PALETTE_TEMP =['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8','#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']
var PALETTE_WATER = ['blue'];
function classifyAndColorize(ndvi) {
    ndvi = ee.Image(ndvi);
  
    var class1 = ndvi.updateMask(ndvi.lte(0.2)).visualize({palette: ['#bc8f68']}); // 柔和棕色
    var class2 = ndvi.updateMask(ndvi.gt(0.2).and(ndvi.lte(0.3))).visualize({palette: ['#d9f0a3']});
    var class3 = ndvi.updateMask(ndvi.gt(0.3).and(ndvi.lte(0.4))).visualize({palette: ['#addd8e']});
    var class4 = ndvi.updateMask(ndvi.gt(0.4).and(ndvi.lte(0.5))).visualize({palette: ['#78c679']});
    var class5 = ndvi.updateMask(ndvi.gt(0.5).and(ndvi.lte(0.6))).visualize({palette: ['#31a354']});
    var class6 = ndvi.updateMask(ndvi.gt(0.6)).visualize({palette: ['#006837']});
  
    return ee.ImageCollection([class1, class2, class3, class4, class5, class6]).mosaic();
  }
  
// ===== [Xinyi Zeng] End =====