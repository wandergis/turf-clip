//实现两个geojson之间的clip
var flatten = require('turf-flatten');
var intersect = require('turf-intersect');
var explode = require('turf-explode');
var inside = require('turf-inside');

module.exports = function clip(clipping_geojson, input_geojson) {
  var clipping_geojson_features = flatten(clipping_geojson).features;
  var input_geojson_features = flatten(input_geojson).features;
  var output_geojson = {
    "type": "FeatureCollection",
    "features": []
  };
  for (var i = clipping_geojson_features.length - 1; i >= 0; i--) {
    var geo1 = clipping_geojson_features[i];
    for (var j = input_geojson_features.length - 1; j >= 0; j--) {
      var geo2 = input_geojson_features[j];
      if (contains(geo1, geo2)) {
        output_geojson.features.push(geo2);
      } else if (contains(geo2, geo1)) {
        geo1.properties = geo2.properties;
        output_geojson.features.push(geo1);
      } else {
        var result = intersect(geo1, geo2);
        if (result) {
          result.properties = geo2.properties;
          output_geojson.features.push(result);
        }
      }
    }
  }
  // clipping_geojson.features.forEach(function(geo1, index) {
  //   input_geojson.features.forEach(function(geo2, index) {
  //     if (contains(geo1, geo2)) {
  //       output_geojson.features.push(geo2);
  //     } else if (contains(geo2, geo1)) {
  //       geo1.properties = geo2.properties;
  //       output_geojson.features.push(geo1);
  //     } else {
  //       var result = intersect(geo1, geo2);
  //       if (result) {
  //         result.properties = geo2.properties;
  //         output_geojson.features.push(result);
  //       }
  //     }
  //   });
  // });
  return output_geojson;
}

function contains(polygon1, polygon2) {
  var isInside = true;
  var features = explode(polygon2).features;
  for (var i = features.length - 1; i >= 0; i--) {
    if (!inside(features[i], polygon1)) {
      isInside = false;
      break;
    }
  }
  return isInside;
}
