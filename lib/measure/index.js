var DAY = 'indays';
var MONTH = 'inmonths';
var YEAR = 'inyears';
var MESSAGES = {
  'dateerror': 'Set a date of assessment (doa) and birthday (dob).',
  'bmierror': 'Set a weight and height.',
  'gendererror': 'Not a valid gender.'
};

var ageCalc = require('../age');
var lms = require('../lms');
var lmsKey = require('./utils').lmsKey;
var isDate = require('./utils').isDate;
var isGender = require('./utils').isGender;
var toDate = require('./utils').toDate;

module.exports = Measure;
/**
 * Process a set of measures, passing the error and result to a callback.
 *
 * The options object must contain the gender, dob and doa keys, and at least
 * one measure value. Circunferences and skinfolds measurements are only
 * available for children (0 to 5 years).
 *
 * @param options {Object}: a mesure object containing the keys:
 *   * gender {String}: male || female
 *   * dob {String}: date of birth, in the format YYYY/MM/DD
 *   * doa {String}: date of assessment, in the format YYYY/MM/DD
 *   * weight {Number}: weight measure in kilograms
 *   * height {Number}: lenght or height mesure in certimiters
 *   * c_head {Number}: head circuference measure in centimiters
 *   * c_upper_arm {Number}: arm circunference measure in centimiters
 *   * sk_triceps {Number}: triceps skinfold mesure in milimiters
 *   * sk_subscapular {Number}: subscapular skinfold measure in milimiters
 * @param callback {Function}: callback that will receive an error and an
 * instance of Measure object.
 */
module.exports.measure = function (options, callback) {
  var error;
  var measure;
  try {
    measure = new Measure(options);
  } catch (e) {
    error = e;
  }
  callback(error, measure);
};
/**
 * Process a list of measures sets, passing the error and list of results to a
 * callback.
 *
 * The measures list must contains a a series of objects container measures in
 * the same format as described for the measure function. The callback will
 * receive an error and a list of Measure instances.
 *
 * @param measures {Array}: list of measure objects, like the one used in
 * measure function.
 * @param callback {Function}: callback that will receive an error and a list
 * of Measure instances.
 */
module.exports.batchMeasure = function (measures, callback) {
  var error;
  var batch;
  try {
    batch = measures.map(function (options) {
      return new Measure(options);
    });
  } catch (e) {
    error = e;
  }
  callback(error, batch);
}

/**
 * Measure object that process a set of measures, creating a result hash
 * containing zscore and percentile to each measure, and age in days, months
 * and years.
 *
 * @param options {Object}: a mesure object containing the keys:
 *   * gender {String}: male || female
 *   * dob {String}: date of birth, in the format YYYY/MM/DD
 *   * doa {String}: date of assessment, in the format YYYY/MM/DD
 *   * weight {Number}: weight measure in kilograms
 *   * height {Number}: lenght or height mesure in certimiters
 *   * c_head {Number}: head circuference measure in centimiters
 *   * c_upper_arm {Number}: arm circunference measure in centimiters
 *   * sk_triceps {Number}: triceps skinfold mesure in milimiters
 *   * sk_subscapular {Number}: subscapular skinfold measure in milimiters
 */
function Measure(options) {
  var self = this;
  var valid_keys = [
    'dob',
    'doa',
    'gender',
    'weight',
    'height',
    'sk_triceps',
    'sk_subscapular',
    'c_head',
    'c_upper_arm'
  ];

  valid_keys.forEach(function (key) {
    if (!options.hasOwnProperty(key)) {
      return;
    }
    if (isDate(key) && options[key]) {
      options[key] = toDate(options[key]);
    } else if (key === 'gender' && !isGender(options[key])) {
      throw Error(MESSAGES['gendererror']);
    }
    self[key] = {
      value: options[key]
    };
  });

  this.ageindays = this._age(DAY);
  this.ageinmonths = this._age(MONTH);
  this.ageinyears = this._age(YEAR);
  this._bmiCalc();
  this.lmsKey = lmsKey(this.ageindays, this.gender.value, Object.keys(this));
  this._results();
};

/**
 * Calculate the age, for a given representation.
 *
 * @param repr {String}: the age representation DAY || MONTH || YEAR
 * @return {Number} age in the given representation.
 */
Measure.prototype._age = function age(repr) {
  if (!this.doa.value || !this.dob.value) {
    throw new Error(MESSAGES['dateerror']);
  }
  return ageCalc[repr](this.doa.value, this.dob.value);
};
/**
 * Set the body mass index, based in weight and height.
 */
Measure.prototype._bmiCalc = function bmiCalc() {
  if (!this.weight.value || !this.height.value) {
    throw new Error(MESSAGES['bmieerror']);
  }
  this.bmi = {
    value: this.weight.value / Math.pow(this.height.value / 100, 2)
  };
};
/**
 * Set a result object, containing the keys:
 *
 * * ageInDays {Number}
 * * ageInMonths {Number}
 * * ageInYears {Number}
 * * measures {Object}: contains all the measurements passed, within the keys
 *   * value {Number}
 *   * zscore {Number}
 *   * percentile {Number}
 */
Measure.prototype._results = function results() {
  var self = this;
  var agegroup = this.lmsKey.agegroup;
  var gender = this.lmsKey.gender;
  var measures = Object.keys(this.lmsKey.measure);
  var age = this[agegroup === 'child' ? 'ageindays' : 'ageinmonths'].toFixed(0);

  this.result = {
    ageInDays: this.ageindays,
    ageInMonths: this.ageinmonths,
    ageInYears: this.ageinyears,
    measures: {}
  };

  measures.forEach(function (measurekey) {
    var db = lms[agegroup][gender][self.lmsKey.measure[measurekey]];
    var value = self[measurekey].value;
    self[measurekey].zscore = db.zscore({
      measure: value,
      xvalue: age
    });
    self[measurekey].percentile = db.percentile({
      measure: value,
      xvalue: age
    });
    self.result.measures[measurekey] = {
      value: self[measurekey].value,
      zscore: self[measurekey].zscore,
      percentile: (self[measurekey].percentile * 100)
    };
  });
};
