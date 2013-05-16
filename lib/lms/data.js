var calc = require('./calc');
var snd = require('../statistic');

/**
 * Abstraction to Box-Cox model, that allows the calculation of z-score and
 * percentile values of a given measurement, and get the measurement value for
 * a given z-score, for the defined data.
 *
 * @param db {Hash}: a JSON containing the converted data for a lms csv file.
 */
function LMS(db) {
  this.db = db.xcoord;
  this.key = db.meta.by.measure;
  this.errors = {
    measure: 'Values for `measure` or `' + this.key + '` are required.',
    zscore: 'Value for `zscore` or `' + this.key + '` are required.'
  };
  this.limit = db.meta.limit;
}

/**
 * Convert the lms parameters keys into the named version.
 *
 * @param lms {Hash}: object with the keys `l`, `m`, `s`
 * @return {Hash}: translated object with the keys `power`, `median`, `cv`
 */
LMS.prototype._named = function _params(lms) {
  return {
    'power': lms.l,
    'cv': lms.s,
    'median': lms.m
  };
};
/**
 * Retrieve the lms parameters for a given xvalue.
 *
 * @param xvalue {Number|String}: value for the defined in `key`
 * @return {Hash}: lms values for the xvalue
 */
LMS.prototype._params = function _params(xvalue) {
  return this._named(this.db[xvalue]);
};
/**
 * Validate the a given xvalue in inside the limits for the data configured.
 *
 * @param xvalue {Number|String}: value for the defined `key`
 * @return {Boolean}
 */
LMS.prototype.onLimit = function onLimit(xvalue) {
  return xvalue >= this.limit.min && xvalue <= this.limit.max;
};
/**
 * Calculate the zscore for a given measurement and xvalue. Throws an Error if
 * no `measurement` or `xvalue` are set in `options`.
 *
 * @param options {Hash}: define the arguments to be used in the function, the
 * following keys are expected:
 * * `measure`: measurement for which calculated the zscore
 * * `xvalue`: to retrieve the lms parameters
 * * `lms`: a {Hash} with the lms parameters, optional
 * @return {Number} the zscore value
 */
LMS.prototype.zscore = function zscore(options) {
  if (!options || !options.measure || isNaN(options.xvalue)) {
    throw new Error(this.errors.measure);
  }
  if (!this.onLimit(options.xvalue)) {
  return NaN;
  }
  if (!options.lms) {
    options.lms = this._params(options.xvalue);
  }
  return calc.zscore({measure: options.measure, lms: options.lms});
};
/**
 * Calculate the percentile for a given measurement and xvalue. Throws an Error
 * if no `measurement` or `xvalue` are set in `options`.
 *
 * @param options {Hash}: define the arguments to be used in the function, the
 * following keys are expected:
 * * `measure`: measurement for which calculated the percentile
 * * `xvalue`: to retrieve the lms parameters
 * * `lms`: a {Hash} with the lms parameters, optional
 * @return {Number} the percentile value
 */
LMS.prototype.percentile = function percentile(options) {
  if (!options || !options.measure || isNaN(options.xvalue)) {
    throw new Error(this.errors.measure);
  }
  if (!this.onLimit(options.xvalue)) {
  return NaN;
  }
  if (!options.zscore) {
    options.zscore = this.zscore(options);
  }
  return snd.cdf(options.zscore);
};
/**
 * Calculate the centile for a given zscore and xvalue. Throws an Error if no
 * `zscore` or `xvalue` are set in `options`.
 *
 * @param options {Hash}: define the arguments to be used in the function, the
 * following keys are expected:
 * * `zscore`: measurement for which calculated the centile
 * * `xvalue`: to retrieve the lms parameters
 * * `lms`: a {Hash} with the lms parameters, optional
 * @return {Number} the centile value
 */
LMS.prototype.centile = function centile(options) {
  if (!options || isNaN(options.zscore) || isNaN(options.xvalue)) {
    throw new Error(this.errors.zscore);
  }
  if (!this.onLimit(options.xvalue)) {
    return NaN;
  }
  if (!options.lms) {
    options.lms = this._params(options.xvalue);
  }
  return calc.measure(options);
};

module.exports = LMS;
