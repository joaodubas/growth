var DAY = 'indays';
var MONTH = 'inmonths';
var YEAR = 'inyears';
var MESSAGES = {
  'dateerror': 'Set a date of assessment (doa) and birthday (dob).',
  'bmierror': 'Set a weight and height.',
  'gendererror': 'Not a valid gender.'
};

var ageCalc = require('../age');
var lms = require('../lms/index.js');
var lmsKey = require('./utils.js').lmsKey;
var isDate = require('./utils.js').isDate;
var isGender = require('./utils.js').isGender;
var toDate = require('./utils.js').toDate;

module.exports = Measure;
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

Measure.prototype._age = function age(repr) {
  if (!this.doa.value || !this.dob.value) {
    throw new Error(MESSAGES['dateerror']);
  }
  return ageCalc[repr](this.doa.value, this.dob.value);
};
Measure.prototype._bmiCalc = function bmiCalc() {
  if (!this.weight.value || !this.height.value) {
    throw new Error(MESSAGES['bmieerror']);
  }
  this.bmi = {
    value: this.weight.value / Math.pow(this.height.value / 100, 2)
  };
};
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
