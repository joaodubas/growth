var MILIINSEC = 1000;
var SECINMIN = 60;
var MININHOUR = 60;
var HOURINDAY = 24;
var DAYINMONTH = 30.4375;
var MONTHINYEAR = 12;
var MILIINDAY = MILIINSEC * SECINMIN * MININHOUR * HOURINDAY;
var MILIINMONTH = MILIINDAY * DAYINMONTH;
var MILIINYEAR = MILIINMONTH * MONTHINYEAR;


function asday(mili) {
  return mili / MILIINDAY;
}

function asmonth(mili) {
  return mili / MILIINMONTH;
}

function asyear(mili) {
  return mili / MILIINYEAR;
}

module.exports = {
  asday: asday,
  asmonth: asmonth,
  asyear: asyear
};
