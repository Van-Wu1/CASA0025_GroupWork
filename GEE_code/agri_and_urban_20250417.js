// Self-defined area of glacier influence（定义的冰川影响范围）
var TBboundary = ee.FeatureCollection('projects/ee-farrellc63/assets/influ_in_TB') // 数据链接需要改
//Map.addLayer(TBboundary, {}, 'Tibetan Plateau Rectangle');

//basic setting（初始地图定位，需要改）
Map.setCenter(92.052, 29.179,  7);
Map.setOptions('SATELLITE'); 

// 2020 
// Agricultural（农业分析）
// step1, capacity （农业指向的资源承载力）
// 1. land source （土地资源）
var dem = ee.Image('NASA/NASADEM_HGT/001').select('elevation').clip(TBboundary);
var slope = ee.Terrain.slope(dem);
var elevation = dem;
// 1.1 slope classification （坡度）
var slopeClass = slope
  .lt(3).multiply(5)
  .add(slope.gte(3).and(slope.lt(8)).multiply(4))
  .add(slope.gte(8).and(slope.lt(15)).multiply(3))
  .add(slope.gte(15).and(slope.lt(25)).multiply(2))
  .add(slope.gte(25).multiply(1));
var baseScore = slopeClass;
// 1.2 elevation adjust （高程矫正）
// 高于 4900m 设为 1,3000–4900m 下降 2 级,2000–3000m 下降 1 级
var rule1 = elevation.gte(4900); // set level as 1 when higher than 4900m
var rule2 = elevation.gte(3000).and(elevation.lt(4900)); // set 2 level lower when higher than 3000m
var rule3 = elevation.gte(2000).and(elevation.lt(3000)); //ser 1level lower when higher than 2000m
var landScore = baseScore
  .where(rule1, 1)
  .where(rule2, baseScore.subtract(2))
  .where(rule3, baseScore.subtract(1));
// 1.3 sand (土壤质地)
var sand = ee.Image("projects/soilgrids-isric/sand_mean")
  .select('sand_0-5cm_mean')
  .divide(10)  // g/kg → % （把每千克含沙土克数转换成百分比）
  .clip(TBboundary);

var sandArea = sand.gte(70); // sand percentage higher than 70
landScore = landScore.where(sandArea, landScore.subtract(1)); // set sand land 1 level lower
landScore = landScore.clamp(1, 5);// no less than 1
// 1.4 visua
// Map.addLayer(landScore, {min: 1, max: 5, palette: ['red','orange','yellow','lightgreen','green']}, 'landscore');

// 2. water source
var precip2020 = ee.ImageCollection('UCSB-CHG/CHIRPS/DAILY')
  .filter(ee.Filter.date('2011-01-01', '2020-01-01')) // 10 years average
  .select('precipitation');
var totalPrecip2020 = precip2020.sum().divide(10).clip(TBboundary);
// 2.1 glacier melt
var glacierAreaTable = ee.FeatureCollection('projects/ee-farrellc63/assets/glacier_melt');
var glacier2020 = glacierAreaTable.filter(ee.Filter.eq('year', 2020));
var volume2020 = glacier2020.aggregate_sum('volume_m3');
var regionArea_m2 = TBboundary.geometry().area();
var glacierMelt_mm = volume2020.divide(regionArea_m2).multiply(1000);
var adjustedRain2020 = totalPrecip2020.add(glacierMelt_mm);
// 2.2 precipitation clissification
var waterScore = adjustedRain2020
  .gte(1200).multiply(5)
  .add(adjustedRain2020.gte(800).and(adjustedRain2020.lt(1200)).multiply(4))
  .add(adjustedRain2020.gte(400).and(adjustedRain2020.lt(800)).multiply(3))
  .add(adjustedRain2020.gte(200).and(adjustedRain2020.lt(400)).multiply(2))
  .add(adjustedRain2020.lt(200).multiply(1));
// 2.3 visua
//Map.addLayer(waterScore, {min: 1, max: 5, palette: ['red', 'orange', 'yellow', 'lightgreen', 'green']}, 'waterscore');

// 3. Enviornment
var tempDaily = ee.ImageCollection('ECMWF/ERA5_LAND/DAILY_AGGR')
  .filterDate('2020-01-01', '2021-01-01') 
  .select(['temperature_2m_max', 'temperature_2m_min']);
// 3.1 gdd daily
var gddDaily = tempDaily.map(function(img) {
  var Tmax = img.select('temperature_2m_max').subtract(273.15);
  var Tmin = img.select('temperature_2m_min').subtract(273.15);
  var Tavg = Tmax.add(Tmin).divide(2);
  var gdd = Tavg.subtract(10).max(0);
  return gdd.set('system:time_start', img.get('system:time_start'));
});
var gddSum = gddDaily.sum().clip(TBboundary);
Map.centerObject(TBboundary, 6);
// 3.2 classify
var heatScore = gddSum
  .gte(2000).multiply(5)
  .add(gddSum.gte(1500).and(gddSum.lt(2000)).multiply(4))
  .add(gddSum.gte(1000).and(gddSum.lt(1500)).multiply(3))
  .add(gddSum.gte(500).and(gddSum.lt(1000)).multiply(2))
  .add(gddSum.lt(500).multiply(1));
// 3.3 visua
//Map.addLayer(heatScore, {min: 1, max: 5, palette: ['red', 'orange', 'yellow', 'lightgreen', 'green']}, 'envirscore');

// 4. weighting sum
var reccrScore = landScore.multiply(0.25)
  .add(waterScore.multiply(0.33))
  .add(heatScore.multiply(0.42));
var cap_agri = reccrScore.round().clamp(1, 5);   
//Map.addLayer(cap_agri, {min: 1, max: 5, palette: ['red','orange','yellow','lightgreen','green']}, 'Resource and Environmental Carrying Capacity for agriculture');

//step2, suitability
// 5. integrity
// 5.1 filter area suitable for agri
var suitable = cap_agri.gte(2);
//Map.addLayer(suitable, {min: 0, max: 1, palette: ['white','blue']}, 'Suitable Pixels');
// 5.2 neighbour
var kernel = ee.Kernel.square(1000, 'meters');
var connScore = suitable.convolve(kernel);
// 5.3 culculate area
var kernelSize = ee.Image.constant(1).convolve(kernel);
var connIndex = connScore.divide(kernelSize);
var cultivationScore = connIndex.expression(
  "(b(0) < 0.2) ? 1" +
  " : (b(0) < 0.4) ? 2" +
  " : (b(0) < 0.6) ? 3" +
  " : (b(0) < 0.8) ? 4 : 5"
).toInt().clip(TBboundary);
// 5.4 visua
//Map.addLayer(cultivationScore, {min: 1, max: 5,palette: ['red', 'orange', 'yellow', 'lightgreen', 'green']}, 'cultivation Score');

//6. Suitability Index for agricultural production
var RECCr = cap_agri;              // 农业资源承载等级（1低 ~ 5高）
var cultivationScore = cultivationScore;  // 地块连片度等级（1低 ~ 5高）
var SIr = ee.Image(0).clip(TBboundary);
// weight matrix
SIr = SIr
  .where(RECCr.eq(5).and(cultivationScore.gte(3)), 3)  // 高 + 高/较高/一般 → 适宜
  .where(RECCr.eq(5).and(cultivationScore.lte(2)), 2)  // 高 + 较低/低 → 一般适宜
  .where(RECCr.eq(4).and(cultivationScore.gte(2)), 3)  // 较高 + 较高及以上 → 适宜
  .where(RECCr.eq(4).and(cultivationScore.eq(1)), 2)   // 较高 + 低 → 一般适宜
  .where(RECCr.eq(3), 2)                               // 中等 + 任意 → 一般适宜
  .where(RECCr.eq(2).and(cultivationScore.gte(2)), 2)  // 较低 + 一般及以上 → 一般适宜
  .where(RECCr.eq(2).and(cultivationScore.eq(1)), 1)   // 较低 + 低 → 不适宜
  .where(RECCr.eq(1), 1);                              // 低 → 不适宜
// visua settings
var SIrPalette = ['#ca0025', '#fdae61', '#1a9641']; // 不适宜-一般-适宜
//Map.addLayer(SIr, {min: 1, max: 3, palette: SIrPalette}, 'Suitability Index for agricultural production');
// 7. add glacier
var glaciers = ee.FeatureCollection('GLIMS/20230607');
var glacierMask = ee.Image.constant(1).clipToCollection(glaciers).rename('glacierMask').clip(TBboundary);
var SIrfixed = SIr.where(glacierMask.eq(1), 1); // set glacier as level 1
Map.addLayer(SIrfixed, {min: 1, max: 3, palette: SIrPalette}, 'Suitability Index for agricultural production');

// Urban Construction
// step1, capacity
// 1. land
var dem = ee.Image('NASA/NASADEM_HGT/001').select('elevation').clip(TBboundary);
var slope = ee.Terrain.slope(dem);
var elevation = dem;
// 1.1 slope classification
var slopeClass = slope
  .lt(3).multiply(5)
  .add(slope.gte(3).and(slope.lt(8)).multiply(4))
  .add(slope.gte(8).and(slope.lt(15)).multiply(3))
  .add(slope.gte(15).and(slope.lt(25)).multiply(2))
  .add(slope.gte(25).multiply(1));
var baseScore = slopeClass;
// 1.2 elevation adjust
var rule1 = elevation.gte(4900);
var rule2 = elevation.gte(3000).and(elevation.lt(4900));
var rule3 = elevation.gte(2000).and(elevation.lt(3000));
var landScore = baseScore
  .where(rule1, 1)
  .where(rule2, baseScore.subtract(2))
  .where(rule3, baseScore.subtract(1));
// 以上高程和坡度和农业计算相同，可以合并
// 1.3 terrain
var kernel = ee.Kernel.square({
  radius: 7,  
  units: 'pixels',
  magnitude: 1
});
var max = dem.reduceNeighborhood({
  reducer: ee.Reducer.max(),
  kernel: kernel
});
var min = dem.reduceNeighborhood({
  reducer: ee.Reducer.min(),
  kernel: kernel
});
var relief = max.subtract(min);  // 起伏度 = max - min
var correction = ee.Image(0)
  .where(relief.gt(100), 1)
  .where(relief.gt(200), 2);

// 1.4 terrain adjust
var landScoreCorrected = landScore.subtract(correction).clamp(1, 5);
//Map.addLayer(landScore, {min: 1, max: 5, palette: ['red','orange','yellow','lightgreen','green']}, 'landscore');

// 2. water (水资源和农业相同，可以合并)
var precip2020 = ee.ImageCollection('UCSB-CHG/CHIRPS/DAILY')
  .filter(ee.Filter.date('2011-01-01', '2020-01-01')) // 10 years average
  .select('precipitation');
var totalPrecip2020 = precip2020.sum().divide(10).clip(TBboundary);
// 2.1 glacier melt
var glacierAreaTable = ee.FeatureCollection('projects/ee-farrellc63/assets/glacier_melt');
var glacier2020 = glacierAreaTable.filter(ee.Filter.eq('year', 2020));
var volume2020 = glacier2020.aggregate_sum('volume_m3');
var regionArea_m2 = TBboundary.geometry().area();
var glacierMelt_mm = volume2020.divide(regionArea_m2).multiply(1000);
var adjustedRain2020 = totalPrecip2020.add(glacierMelt_mm);
// 2.2 precipitation clissification
var waterScore = adjustedRain2020
  .gte(1200).multiply(5)
  .add(adjustedRain2020.gte(800).and(adjustedRain2020.lt(1200)).multiply(4))
  .add(adjustedRain2020.gte(400).and(adjustedRain2020.lt(800)).multiply(3))
  .add(adjustedRain2020.gte(200).and(adjustedRain2020.lt(400)).multiply(2))
  .add(adjustedRain2020.lt(200).multiply(1));
// 2.3 visua
//Map.addLayer(waterScore, {min: 1, max: 5, palette: ['red', 'orange', 'yellow', 'lightgreen', 'green']}, 'waterscore');

// 3. enviornment
// 3.1 air quality
var pm25 = ee.ImageCollection("projects/sat-io/open-datasets/GLOBAL-SATELLITE-PM25/ANNUAL")
  .filterDate('2016-01-01', '2020-12-31')
  .filterBounds(TBboundary);
var pm25_mean = pm25.mean().clip(TBboundary);
var vis = {
  min: 0,
  max: 100,
  palette: ['green', 'yellow', 'orange', 'red']
};
//Map.centerObject(TBboundary, 6);
//Map.addLayer(pm25_mean, vis, 'PM2.5 5-Year Mean');
// 3.2 uniuniformization
var threshold = 35; // 国家二级年均标准
var minVal = 5;     // 假设最理想空气浓度
var suitabilityIndex = pm25_mean.expression(
  '(threshold - value) / (threshold - min)', {
    'value': pm25_mean,
    'threshold': threshold,
    'min': minVal
}).clamp(0, 1);
// 3.3 classify
var airscore = suitabilityIndex.expression(
  "b(0) <= 0.2 ? 1 :" +
  "b(0) <= 0.4 ? 2 :" +
  "b(0) <= 0.6 ? 3 :" +
  "b(0) <= 0.8 ? 4 : 5"
).toInt().clip(TBboundary);
//Map.addLayer(airscore, {min: 1, max: 5, palette: ['red', 'orange', 'yellow', 'lightgreen', 'green']}, 'Suitability Level');

// 4. weighting sum
var ucScore = landScore.multiply(0.25)
  .add(waterScore.multiply(0.35))
  .add(airscore.multiply(0.4));
var cap_cons = ucScore.round().clamp(1, 5);   
//Map.addLayer(cap_cons, {min: 1, max: 5, palette: ['red','orange','yellow','lightgreen','green']}, 'Resource and Environmental Carrying Capacity for constructure');

//step2, suitability
// 土地连片性和农业相同，可以合并
// 5. integrity
// 5.1 filter area suitable for agri
var suitable = cap_cons.gte(2);
//Map.addLayer(suitable, {min: 0, max: 1, palette: ['white','blue']}, 'Suitable Pixels');
// 5.2 neighbour
var kernel = ee.Kernel.square(600, 'meters');
var connScore = suitable.convolve(kernel);
// 5.3 culculate area
var kernelSize = ee.Image.constant(1).convolve(kernel);
var connIndex = connScore.divide(kernelSize);
var cultivationScore = connIndex.expression(
  "(b(0) < 0.2) ? 1" +
  " : (b(0) < 0.4) ? 2" +
  " : (b(0) < 0.6) ? 3" +
  " : (b(0) < 0.8) ? 4 : 5"
).toInt().clip(TBboundary);
// 5.5 visual
//Map.addLayer(cultivationScore, {min: 1, max: 5,palette: ['red', 'orange', 'yellow', 'lightgreen', 'green']}, 'cultivation Score');

//6. Suitability Index for agricultural production
var uc = cap_cons;              // 城镇资源承载等级（1低 ~ 5高）
var cultivationScore = cultivationScore;  // 地块连片度等级（1低 ~ 5高）
var SIu = ee.Image(0).clip(TBboundary);
SIu = SIu
  .where(uc.eq(5).and(cultivationScore.gte(3)), 3)  // 高 + 高/较高/一般 → 适宜
  .where(uc.eq(5).and(cultivationScore.lte(2)), 2)  // 高 + 较低/低 → 一般适宜
  .where(uc.eq(4).and(cultivationScore.gte(2)), 3)  // 较高 + 较高及以上 → 适宜
  .where(uc.eq(4).and(cultivationScore.eq(1)), 2)   // 较高 + 低 → 一般适宜
  .where(uc.eq(3), 2)                               // 中等 + 任意 → 一般适宜
  .where(uc.eq(2).and(cultivationScore.gte(2)), 2)  // 较低 + 一般及以上 → 一般适宜
  .where(uc.eq(2).and(cultivationScore.eq(1)), 1)   // 较低 + 低 → 不适宜
  .where(uc.eq(1), 1);                              // 低 → 不适宜
// 可视化设定
var SIuPalette = ['#ca0025', '#fdae61', '#1a9641']; // 不适宜-一般-适宜
//Map.addLayer(SIu, {min: 1, max: 3, palette: SIuPalette}, 'Suitability Index for urban construction');
// 7. add glacier（和农业相同，可以合并）
var glaciers = ee.FeatureCollection('GLIMS/20230607');
var glacierMask = ee.Image.constant(1).clipToCollection(glaciers).rename('glacierMask').clip(TBboundary);
var SIufixed = SIu.where(glacierMask.eq(1), 1);

Map.addLayer(SIufixed, {min: 1, max: 3, palette: SIuPalette}, 'Suitability Index for urban construction');