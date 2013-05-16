/**
 * Return the standard deviation for a given lms hash and multiplier.
 *
 * @param lms {Hash}: a dictionary containing the lms values:
 *     'power': the Box-Cox power (L),
 *     'median': the median value (M),
 *     'cv': the coefficient of variation (S).
 * @param multiplier {Number}: the standard deviation to be retrieved.
 * @return {Number}
 */
function stdev(options) {
  var multiplier = options.multiplier,
      lms = options.lms;
  var variance = 1 + lms.power * lms.cv * multiplier;
  return lms.median * Math.pow(variance, 1 / lms.power);
}

/**
 * Return the value of +3 standard deviations for a given lms.
 *
 * @param lms {Hash}: a dictionary containing the lms values:
 *     'power': the Box-Cox power (L),
 *     'median': the median value (M),
 *     'cv': the coefficient of variation (S).
 * @return {Number}
 */
function stdev_plus_3(lms) {
  return stdev({multiplier: 3, lms: lms});
}

/**
 * Return the value of -3 standard deviations for a given lms.
 *
 * @param lms {Hash}: a dictionary containing the lms values:
 *     'power': the Box-Cox power (L),
 *     'median': the median value (M),
 *     'cv': the coefficient of variation (S).
 * @return {Number}
 */
function stdev_minus_3(lms) {
  return stdev({multiplier: -3, lms: lms});
}

/**
 * Return the value of +2 standard deviations for a given lms.
 *
 * @param lms {Hash}: a dictionary containing the lms values:
 *     'power': the Box-Cox power (L),
 *     'median': the median value (M),
 *     'cv': the coefficient of variation (S).
 * @return {Number}
 */
function stdev_plus_2(lms) {
  return stdev({multiplier: 2, lms: lms});
}

/**
 * Return the value of -2 standard deviations for a given lms.
 *
 * @param lms {Hash}: a dictionary containing the lms values:
 *     'power': the Box-Cox power (L),
 *     'median': the median value (M),
 *     'cv': the coefficient of variation (S).
 * @return {Number}
 */
function stdev_minus_2(lms) {
  return stdev({multiplier: -2, lms: lms});
}

/**
 * Return the individual z score for a given measure and lms parameters.
 *
 * @param lms {Hash}: a dictionary containing the lms values:
 *     'power': the Box-Cox power (L),
 *     'median': the median value (M),
 *     'cv': the coefficient of variation (S).
 * @param measure {Number}: the measured value.
 * @return {Number}
 */
function zscore_individual(options) {
  var measure = options.measure,
      lms = options.lms;
  var correct_median = Math.pow(measure / lms.median, lms.power) - 1,
      deviation = lms.cv * lms.power;
  return correct_median / deviation;
}

/**
 * Return the fixed z score for scores less than -3 or greate than +3.
 *
 * @param lms {Hash}: a dictionary containing the lms values:
 *     'power': the Box-Cox power (L),
 *     'median': the median value (M),
 *     'cv': the coefficient of variation (S).
 * @param zscore {Number}: the individual z score obtained.
 * @param measure {Number}: the measured value.
 * @return {Number}
 */
function zscore_fix(options) {
  var zscore = options.zscore,
      measure = options.measure,
      lms = options.lms;

  if (Math.abs(zscore) <= 3) {
    return zscore;
  }

  var constant = null, deviation = null, deltadeviation = null;
  if (zscore > 3) {
    constant = 3;
    deviation = stdev_plus_3(lms);
    deltadeviation = deviation - stdev_plus_2(lms);
  } else {
    constant = -3;
    deviation = stdev_minus_3(lms);
    deltadeviation = stdev_minus_2(lms) - deviation;
  }

  return constant + (measure - deviation) / deltadeviation;
}

/**
 * Convert a given measure with lms parameters to z score.
 *
 * @param lms {Hash}: a dictionary containing the lms values:
 *     'power': the Box-Cox power (L),
 *     'median': the median value (M),
 *     'cv': the coefficient of variation (S).
 * @param measure {Number}: the measured value.
 * @return {Number}
 */
function to_zscore(options) {
  options.zscore = zscore_individual(options);
  return zscore_fix(options);
}

/**
 * Convert a given z score with lms parameters to a measure. The estimative
 * is only valid for -3 <= zscore <= 3.
 *
 * @param lms {Hash}: a dictionary containing the lms values:
 *     'power': the Box-Cox power (L),
 *     'median': the median value (M),
 *     'cv': the coefficient of variation (S).
 * @param zscore {Number}: a given z score.
 * @return {Number}
 */
function to_measure(options) {
  if (options.zscore < -3 || options.zscore > 3) {
    throw new Error('Z-score must be -3 <= z <= +3.');
  }
  options.multiplier = options.zscore;
  return stdev(options);
}

module.exports = {
  zscore: to_zscore,
  measure: to_measure
};
