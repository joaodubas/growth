var convert = require('./convert.js');

/**
 * Calculate the difference in milliseconds between two Date objects.
 *
 * @param later {Date}: the later date
 * @param base {Date}: the initial data
 * @return {Number}: difference between dates in miliseconds
 */
function diff(later, base) {
  return later.getTime() - base.getTime();
}

/**
 * Calculate the age in days.
 *
 * @param doa {Date}: date of assessment
 * @param dob {Date}: date of birth
 * @return {Number}: age in days
 */
function ageindays(doa, dob) {
  return convert.asday(diff(doa, dob));
}

/**
 * Calculate the age in months.
 *
 * @param doa {Date}: date of assessment
 * @param dob {Date}: date of birth
 * @return {Number}: age in months
 */
function ageinmonths(doa, dob) {
  return convert.asmonth(diff(doa, dob));
}

/**
 * Calculate the age in years.
 *
 * @param doa {Date}: date of assessment
 * @param dob {Date}: date of birth
 * @return {Number}: age in years
 */
function ageinyears(doa, dob) {
  return convert.asyear(diff(doa, dob));
}

module.exports = {
  indays: ageindays,
  inmonths: ageinmonths,
  inyears: ageinyears
};
