// ========== STYLE ==========

// ===== [Xinyi Zeng] Begin: STYLE CONSTANTS =====
var PALETTE_NDVI = ['white', '#d9f0a3', '#addd8e', '#78c679', '#41ab5d', '#238443'];
var STYLE_TEMP = { color: 'black' };
vfunction classifyAndColorizeTemperature(temp) {
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