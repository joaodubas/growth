var convert = require('./convert.js');

function diff(later, base) {
  return later.getTime() - base.getTime();
}

function ageindays(doa, dob) {
  return convert.asday(diff(doa, dob));
}

function ageinmonths(doa, dob) {
  return convert.asmonth(diff(doa, dob));
}

function ageinyears(doa, dob) {
  return convert.asyear(diff(doa, dob));
}

module.exports = {
  indays: ageindays,
  inmonths: ageinmonths,
  inyears: ageinyears
};
