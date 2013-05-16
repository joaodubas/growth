var MILIINSEC = 1000;
var SECINMIN = 60;
var MININHOUR = 60;
var HOURINDAY = 24;
var DAYINMONTH = 30.4375;
var MONTHINYEAR = 12;
var MILIINDAY = MILIINSEC * SECINMIN * MININHOUR * HOURINDAY;
var MILIINMONTH = MILIINDAY * DAYINMONTH;
var MILIINYEAR = MILIINMONTH * MONTHINYEAR;

/**
 * Convert miliseconds into days.
 *
 * @param mili {Number}: amount of miliseconds
 * @return {Number} amount of days
 */
function asday(mili) {
  return mili / MILIINDAY;
}

/**
 * Convert miliseconds into months.
 *
 * @param mili {Number}: amount of miliseconds
 * @return {Number} amount of months
 */
function asmonth(mili) {
  return mili / MILIINMONTH;
}

/**
 * Convert miliseconds into years
 *
 * @param mili {Number}: amount of miliseconds
 * @return {Number} amount of years
 */
function asyear(mili) {
  return mili / MILIINYEAR;
}

module.exports = {
  asday: asday,
  asmonth: asmonth,
  asyear: asyear
};
