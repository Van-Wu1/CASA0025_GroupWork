//fragilezone
var fragilezone = ee.Image('projects/ee-tartaricacid4-casa0006/assets/TB_cuiruo')
//Map.addLayer(fragilezone,{min:1, max:5, palette: ['#DCDEC6', '#4C5D77'] },'fragilezone2000')

//significant
var sigzone = ee.Image('projects/ee-tartaricacid4-casa0006/assets/TB_zhongyao')
//Map.addLayer(sigzone,{min:1, max:5, palette: ['#CAB0A5', '#A47764', '#67493C'] },'significantzone2000')

//merge
var merge = fragilezone.add(sigzone);


var mask1 = merge.gte(1).and(merge.lte(6));
var com_eco_zone = merge.updateMask(mask1);

var mask2 = merge.gte(7).and(merge.lte(9));
var sig_eco_zone = merge.updateMask(mask2);

var mask3 = merge.eq(10);
var very_sig_eco_zone = merge.updateMask(mask3);

// add layer
Map.addLayer(com_eco_zone, {palette: ['#D6FFD5']}, 'common');
Map.addLayer(sig_eco_zone, {palette: ['#69D359']}, 'significant');
Map.addLayer(very_sig_eco_zone, {palette: ['#1CB302']}, 'very significant');

//result of Data merge and reclassify, 3=very significant zone, 2=significant zone
var eco_result = ee.Image('projects/ee-tartaricacid4-casa0006/assets/eco_sig_verysig')
Map.addLayer(eco_result,{min:2, max:3, palette: ['#DCDEC6', '#4C5D77'] },'Eco significant zone')
