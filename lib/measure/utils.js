var MALE = 'male';
var FEMALE = 'female';
var REGEX_GENDER = new RegExp(MALE + '|' + FEMALE);

var LENGTH = [45, 110];
var HEIGHT = [65, 120];
var CHILD_IN_DAYS = [0, 1856];
var CHILD_IN_MONTHS = [0, 60.9774];
var CHILD_IN_YEARS = [0, 5.0815];
var YOUNG_IN_DAYS = [1856.6875, 6939.75];
var YOUNG_IN_MONTHS = [61, 228];
var YOUNG_IN_YEARS = [5.0833, 19];

var MESSAGES = {
  'dateconverterror': 'Date should be in the format YYYY/MM/DD.',
};

var MEASURES = [
  'weight',
  'height',
  'sk_triceps',
  'sk_subscapular',
  'c_head',
  'c_upper_arm'
];

function toDate(dateString) {
  var date = new Date(dateString);
  if (date === 'Invalid Date') {
    throw new Error(MESSAGES['dateconverterror']);
  }
  return date;
}

function isDate(key) {
  return /doa|dob/.test(key);
}

function isGender(key) {
  return REGEX_GENDER.test(key);
}

function ageGroupKey(ageindays) {
  var agegroup;
  if (ageindays >= CHILD_IN_DAYS[0] && ageindays < CHILD_IN_DAYS[1]) {
    agegroup = 'child';
  } else if (ageindays >= YOUNG_IN_DAYS[0] && ageindays < YOUNG_IN_DAYS[1]) {
    agegroup = 'young';
  } else {
    agegroup = 'adult';
  }
  return agegroup;
}

function measureKey(measures) {
  var measurekey = {}; 
  var hasheight = false;
  var hasweight = false;
  MEASURES.forEach(function (measure) {
    if (measures.indexOf(measure) < 0) {
      return;
    }
    if (measure === 'height') {
      hasheight = true;
    } else if (measure === 'weight') {
      hasweight = true;
    }
    measurekey[measure] = measure + '_for_age';
  });
  if (hasheight && hasweight) {
    measurekey['bmi'] = 'bmi_for_age';
  }
  return measurekey;
}

function lmsKey(ageindays, gender, measures) {
  var agegroup = ageGroupKey(ageindays);
  var measure = measureKey(measures);
  if (agegroup === 'child' && measure.hasOwnProperty('height')) {
    measure.height = 'length_' + measure.height;
  }
  return {
    agegroup: ageGroupKey(ageindays),
    gender: gender,
    measure: measure
  };
}

module.exports = {
  lmsKey: lmsKey,
  isDate: isDate,
  isGender: isGender,
  toDate: toDate
};
