var MILIINSEC = 1000;
var SECINMIN = 60;
var MININHOUR = 60;
var HOURINDAY = 24;
var DAYINMONTH = 30.4375;
var MONTHINYEAR = 12;
var MILIINDAY = MILIINSEC * SECINMIN * MININHOUR * HOURINDAY;
var MILIINMONTH = MILIINDAY * DAYINMONTH;
var MILIINYEAR = MILIINMONTH * MONTHINYEAR;

function diff(later, base) {
  return later.getTime() - base.getTime();
}

function asday(mili) {
  return mili / MILIINDAY;
}

function asmonth(mili) {
  return mili / MILIINMONTH;
}

function asyear(mili) {
  return mili / MILIINYEAR;
}

function ageindays(doa, dob) {
  return asday(diff(doa, dob));
}

function ageinmonths(doa, dob) {
  return asmonth(diff(doa, dob));
}

function ageinyears(doa, dob) {
  return asyear(diff(doa, dob));
}

module.exports = {
  indays: ageindays,
  inmonths: ageinmonths,
  inyears: ageinyears
};
