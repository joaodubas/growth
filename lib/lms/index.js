var fs = require('fs');
var path = require('path');
var LMS = require('./data.js');

var root = path.resolve(path.join(path.dirname(), 'lib', 'lms', 'db'));
var dbs = {};
var filenames = (function () {
  var files = [];
  var gender = ['female', 'male'];
  var child_measures = [
    'c_upper_arm_for_age',
    'c_head_for_age',
    'bmi_for_age',
    'length_height_for_age',
    'sk_subscapular_for_age',
    'sk_triceps_for_age',
    'weight_for_age',
    'weight_for_height',
    'weight_for_length'
  ].map(function (value) { return value + '.json'; });
  var young_measures = [
    'bmi_for_age',
    'height_for_age',
    'weight_for_age'
  ].map(function (value) { return value + '.json'; });
  function merge(prefix, gender, measures) {
    gender.forEach(function (sex) {
      measures.forEach(function (measure) {
        files.push([prefix, sex, measure].join('_'));
      });
    });
  }
  merge('child', gender, child_measures);
  merge('young', gender, young_measures);
  return files;
})();

module.exports = exports = dbs;
(function retrieveDB(filenames) {
  function patternDB(filename) {
    filename = filename.replace('.json', '');
    var age, gender, measure;
    age = filename.split('_', 1);
    gender = filename.split('_', 2)[1];
    measure = filename.split(gender + '_')[1];

    return {
      age: age,
      gender: gender,
      measure: measure
    };
  }

  function requireDB(i) {
    var keys = patternDB(filenames[i]);
    if (!dbs.hasOwnProperty(keys.age)) {
      dbs[keys.age] = {};
    }
    if (!dbs[keys.age].hasOwnProperty(keys.gender)) {
      dbs[keys.age][keys.gender] = {}
    } 
    dbs[keys.age][keys.gender][keys.measure] = new LMS(require(
      path.join(root, filenames[i++])
    ));
    if (i === filenames.length) {
        return;
    }
    requireDB(i);
  }
  requireDB(0);
})(filenames);

