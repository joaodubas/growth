function standard_deviation(power, median, cv, multiplier) {
    /**
     * Return the standard deviation for a given lms parameters and multiplier.
     * @param lms {Hash}: a dictionary containing the lms values:
     *     'power': the Box-Cox power (L),
     *     'median': the median value (M),
     *     'cv': the coefficient of variation (S).
     * @param multiplier {Number}: the standard deviation to be retrieved.
     * @return {Number}
     */
    return median * Math.pow(1 + power * cv * multiplier, 1 / power);
}

function standard_deviation_3_pos(power, median, cv) {
    /**
     * Return the value of +3 standard deviations for a given lms.
     * @param lms {Hash}: a dictionary containing the lms values:
     *     'power': the Box-Cox power (L),
     *     'median': the median value (M),
     *     'cv': the coefficient of variation (S).
     * @return {Number}
     */
    return standard_deviation(power, median, cv, 3);
}

function standard_deviation_3_neg(power, median, cv) {
    /**
     * Return the value of -3 standard deviations for a given lms.
     * @param lms {Hash}: a dictionary containing the lms values:
     *     'power': the Box-Cox power (L),
     *     'median': the median value (M),
     *     'cv': the coefficient of variation (S).
     * @return {Number}
     */
    return standard_deviation(power, median, cv, -3);
}

function standard_deviation_2_pos(power, median, cv) {
    /**
     * Return the value of +2 standard deviations for a given lms.
     * @param lms {Hash}: a dictionary containing the lms values:
     *     'power': the Box-Cox power (L),
     *     'median': the median value (M),
     *     'cv': the coefficient of variation (S).
     * @return {Number}
     */
    return standard_deviation(power, median, cv, 2);
}

function standard_deviation_2_neg(power, median, cv) {
    /**
     * Return the value of -2 standard deviations for a given lms.
     * @param lms {Hash}: a dictionary containing the lms values:
     *     'power': the Box-Cox power (L),
     *     'median': the median value (M),
     *     'cv': the coefficient of variation (S).
     * @return {Number}
     */
    return standard_deviation(power, median, cv, -2);
}

function zscore_individual(measure, power, median, cv) {
    /**
     * Return the individual z score for a given measure and lms parameters.
     * @param lms {Hash}: a dictionary containing the lms values:
     *     'power': the Box-Cox power (L),
     *     'median': the median value (M),
     *     'cv': the coefficient of variation (S).
     * @param measure {Number}: the measured value.
     * @return {Number}
     */
    var correct_median = Math.pow(measure / median, power) - 1;
    var deviation = cv * power;
    return correct_median / deviation;
}

function zscore_fix(zscore, measure, power, median, cv) {
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
    if (Math.abs(zscore) <= 3) {
        return zscore;
    }

    var constant = null, deviation = null, deltadeviation = null;
    if (zscore > 3) {
        constant = 3;
        deviation = standard_deviation_3_pos(power, median, cv);
        deltadeviation = deviation - standard_deviation_2_pos(power, median, cv);
    } else {
        constant = -3;
        deviation = standard_deviation_3_neg(power, median, cv);
        deltadeviation = standard_deviation_2_neg(power, median, cv) - deviation;
    }

    return constant + (measure - deviation) / deltadeviation;
}

function to_zscore(measure, power, median, cv) {
    /**
     * Convert a given measure with lms parameters to z score.
     * @param lms {Hash}: a dictionary containing the lms values:
     *     'power': the Box-Cox power (L),
     *     'median': the median value (M),
     *     'cv': the coefficient of variation (S).
     * @param measure {Number}: the measured value.
     * @return {Number}
     */
    return zscore_fix(
        zscore_individual(measure, power, median, cv),
        measure,
        power,
        median,
        cv
    );
}

function to_measure(zscore, power, median, cv) {
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
    return standard_deviation(power, median, cv, zscore);
}

/**
 * Testing
 */
function precision(value, decimal) {
    decimal = !isNaN(decimal) ? decimal : 4;
    return (value).toFixed(decimal);
}

var measures = [
    [30, -1.7862, 16.9392, 0.11070, 3.35],
    [14, -1.3529, 20.4951, 0.12579, -3.80],
    [19, -1.6318, 16.0490, 0.10038, 1.47]
];

measures.forEach(function (list) {
    var score = to_zscore(list[0], list[1], list[2], list[3]);
    console.log(
        precision((to_measure(score, list[1], list[2], list[3]))),
        list[0],
        precision((score)),
        list[4]);
});
