Map.setCenter(92.052, 29.179, 7);
Map.setOptions('SATELLITE');

var influ_TB = ee.FeatureCollection ('projects/ee-tartaricacid4-casa0006/assets/influ_in_TB')//冰川影响区 
var census_7th = ee.FeatureCollection ('projects/ee-tartaricacid4-casa0006/assets/7th_Census')//人口普查 
var reservation = ee.FeatureCollection ('projects/ee-tartaricacid4-casa0006/assets/reser_zone')//保护区 

var landcover = ee.ImageCollection('ESA/WorldCover/v100').first();//zhixuanqule只选取了最新影像
var visualization = {
  bands: ['Map'],
};

var built_up = landcover.select('Map').eq(50);//城市 
var cropland = landcover.select('Map').eq(40);//农田 


Map.addLayer(built_up.updateMask(built_up), {palette: ['red']}, 'Built-up zone'); 
Map.addLayer(cropland.updateMask(cropland), {palette: ['yellow']}, 'cropland'); 

var boundary_intersect = census_7th
  .filterBounds(influ_TB)
  .filter(ee.Filter.gte('pop_dens', 10));//根据人口密度筛选,参数可以调

Map.addLayer(boundary_intersect, {color: 'FF0000'}, 'selected area')
Map.addLayer(reservation, {color: 'green'}, 'reservation zone')

