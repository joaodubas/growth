var fs = require('fs');
var path = require('path');
var LMS = require('./data');

var root = path.resolve(path.join(path.dirname(), 'lib', 'data', 'db'));
var dbs = {};
/**
 * List of files available to child and young of both genders. Those files will
 * be available as instances of LMS.
 */
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
/**
 * Require each file available in filenames, adding to dbs hash as an LMS
 * instance.
 */
(function retrieveDB(filenames) {
  /**
   * Create a pattern of keys to be used for a given file. The pattern
   * generated follow the rules:
   *
   * 1. age: child || young
   * 2. gender: female || male
   * 3. measure
   *
   * Those patterns are based in the filename.
   *
   * @param filename {String}: filename from which the pattern will be
   * extracted.
   * @return {Object} containing the pattern keys to be used.
   */
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

  /**
   * Require a given filename into an LMS instance and associated with the
   * hash pattern into the dbs object.
   *
   * @param i {Number}: array index
   */
  function requireDB(i) {
    var keys = patternDB(filenames[i]);
    if (!dbs.hasOwnProperty(keys.age)) {
      dbs[keys.age] = {};
    }
    if (!dbs[keys.age].hasOwnProperty(keys.gender)) {
      dbs[keys.age][keys.gender] = {};
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

