function standard_deviation(options) {
    /**
     * Return the standard deviation for a given lms parameters and multiplier.
     * @param lms {Hash}: a dictionary containing the lms values:
     *     'power': the Box-Cox power (L),
     *     'median': the median value (M),
     *     'cv': the coefficient of variation (S).
     * @param multiplier {Number}: the standard deviation to be retrieved.
     * @return {Number}
     */
    var multiplier = options.multiplier,
        lms = options.lms;
    var variance = 1 + lms.power * lms.cv * multiplier;
    return lms.median * Math.pow(variance, 1 / lms.power);
}

function standard_deviation_3_pos(lms) {
    /**
     * Return the value of +3 standard deviations for a given lms.
     * @param lms {Hash}: a dictionary containing the lms values:
     *     'power': the Box-Cox power (L),
     *     'median': the median value (M),
     *     'cv': the coefficient of variation (S).
     * @return {Number}
     */
    return standard_deviation({multiplier: 3, lms: lms});
}

function standard_deviation_3_neg(lms) {
    /**
     * Return the value of -3 standard deviations for a given lms.
     * @param lms {Hash}: a dictionary containing the lms values:
     *     'power': the Box-Cox power (L),
     *     'median': the median value (M),
     *     'cv': the coefficient of variation (S).
     * @return {Number}
     */
    return standard_deviation({multiplier: -3, lms: lms});
}

function standard_deviation_2_pos(lms) {
    /**
     * Return the value of +2 standard deviations for a given lms.
     * @param lms {Hash}: a dictionary containing the lms values:
     *     'power': the Box-Cox power (L),
     *     'median': the median value (M),
     *     'cv': the coefficient of variation (S).
     * @return {Number}
     */
    return standard_deviation({multiplier: 2, lms: lms});
}

function standard_deviation_2_neg(lms) {
    /**
     * Return the value of -2 standard deviations for a given lms.
     * @param lms {Hash}: a dictionary containing the lms values:
     *     'power': the Box-Cox power (L),
     *     'median': the median value (M),
     *     'cv': the coefficient of variation (S).
     * @return {Number}
     */
    return standard_deviation({multiplier: -2, lms: lms});
}

function zscore_individual(options) {
    /**
     * Return the individual z score for a given measure and lms parameters.
     * @param lms {Hash}: a dictionary containing the lms values:
     *     'power': the Box-Cox power (L),
     *     'median': the median value (M),
     *     'cv': the coefficient of variation (S).
     * @param measure {Number}: the measured value.
     * @return {Number}
     */
    var measure = options.measure,
        lms = options.lms
    var correct_median = Math.pow(measure / lms.median, lms.power) - 1,
        deviation = lms.cv * lms.power;
    return correct_median / deviation;
}

function zscore_fix(options) {
    /**
     * Return the fixed z score for scores less than -3 or greate than +3.
     * @param lms {Hash}: a dictionary containing the lms values:
     *     'power': the Box-Cox power (L),
     *     'median': the median value (M),
     *     'cv': the coefficient of variation (S).
     * @param zscore {Number}: the individual z score obtained.
     * @param measure {Number}: the measured value.
     * @return {Number}
     */
    var zscore = options.zscore,
        measure = options.measure,
        lms = options.lms;

    if (Math.abs(zscore) <= 3) {
        return zscore;
    }

    var constant = null, deviation = null, deltadeviation = null;
    if (zscore > 3) {
        constant = 3;
        deviation = standard_deviation_3_pos(lms);
        deltadeviation = deviation - standard_deviation_2_pos(lms);
    } else {
        constant = -3;
        deviation = standard_deviation_3_neg(lms);
        deltadeviation = standard_deviation_2_neg(lms) - deviation;
    }

    return constant + (measure - deviation) / deltadeviation;
}

function to_zscore(options) {
    /**
     * Convert a given measure with lms parameters to z score.
     * @param lms {Hash}: a dictionary containing the lms values:
     *     'power': the Box-Cox power (L),
     *     'median': the median value (M),
     *     'cv': the coefficient of variation (S).
     * @param measure {Number}: the measured value.
     * @return {Number}
     */
    options.zscore = zscore_individual(options);
    return zscore_fix(options);
}

function to_measure(options) {
    /**
     * Convert a given z score with lms parameters to a measure. The estimative
     * is only valid for -3 <= zscore <= 3.
     * @param lms {Hash}: a dictionary containing the lms values:
     *     'power': the Box-Cox power (L),
     *     'median': the median value (M),
     *     'cv': the coefficient of variation (S).
     * @param zscore {Number}: a given z score.
     * @return {Number}
     */
    options.multiplier = options.zscore
    return standard_deviation(options);
}

/**
 * Testing
 */
function precision(value, decimal) {
    decimal = !isNaN(decimal) ? decimal : 4;
    return (value).toFixed(decimal);
}

var measures = [
    {measure: 30, lms: {power: -1.7862, median: 16.9392, cv: 0.11070}, expec: 3.35},
    {measure: 14, lms: {power: -1.3529, median: 20.4951, cv: 0.12579}, expec: -3.80},
    {measure: 19, lms: {power: -1.6318, median: 16.0490, cv: 0.10038}, expec: 1.47}
];

measures.forEach(function (options) {
    options.zscore = to_zscore(options);
    console.log(
        precision((to_measure(options))),
        options.measure,
        precision((score)),
        options.expec
    );
});
