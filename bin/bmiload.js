#!/usr/bin/env node
var fs = require('fs'),
    path = require('path'),
    parser = require('../lib/lms/stream.js'),
    formater = require('../lib/lms/adapter.js'),
    constants = require('../lib/lms/constants.js');

var filenames = {
  child: {
    localdir: path.join(__dirname, '..', 'lib', 'lms', 'db', 'bmi-child'),
    todir: path.join(__dirname, '..', 'lib', 'lms', 'db'),
    files: [
      {
        from: 'lhfa_boys_p_exp',
        to: 'child_male_length_height_for_age',
        key: 'day',
        measure: constants.HEIGHT,
        by: constants.AGEDAY
      },
      {
        from: 'lhfa_girls_p_exp',
        to: 'child_female_length_height_for_age',
        key: 'day',
        measure: constants.HEIGHT,
        by: constants.AGEDAY
      },
      {
        from: 'wfa_boys_p_exp',
        to: 'child_male_weight_for_age',
        key: 'age',
        measure: constants.WEIGHT,
        by: constants.AGEDAY
      },
      {
        from: 'wfa_girls_p_exp',
        to: 'child_female_weight_for_age',
        key: 'age',
        measure: constants.WEIGHT,
        by: constants.AGEDAY
      },
      {
        from: 'bfa_boys_p_exp',
        to: 'child_male_bmi_for_age',
        key: 'age',
        measure: constants.BMI,
        by: constants.AGEDAY
      },
      {
        from: 'bfa_girls_p_exp',
        to: 'child_female_bmi_for_age',
        key: 'age',
        measure: constants.BMI,
        by: constants.AGEDAY
      },
      {
        from: 'wfl_boys_p_exp',
        to: 'child_male_weight_for_length',
        key: 'length',
        measure: constants.WEIGHT,
        by: constants.LENGTH
      },
      {
        from: 'wfl_girls_p_exp',
        to: 'child_female_weight_for_length',
        key: 'length',
        measure: constants.WEIGHT,
        by: constants.LENGTH
      },
      {
        from: 'wfh_boys_p_exp',
        to: 'child_male_weight_for_height',
        key: 'height',
        measure: constants.WEIGHT,
        by: constants.HEIGHT
      },
      {
        from: 'wfh_girls_p_exp',
        to: 'child_female_weight_for_height',
        key: 'height',
        measure: constants.WEIGHT,
        by: constants.HEIGHT
      },
      {
        from: 'acfa_boys_p_exp',
        to: 'child_male_arm_circ_for_age',
        key: 'age',
        measure: constants.CIRCUNFERENCE,
        by: constants.AGEDAY
      },
      {
        from: 'acfa_girls_p_exp',
        to: 'child_female_arm_circ_for_age',
        key: 'age',
        measure: constants.CIRCUNFERENCE,
        by: constants.AGEDAY
      },
      {
        from: 'ssfa_boys_p_exp',
        to: 'child_male_subscapular_skinfold_for_age',
        key: 'age',
        measure: constants.SKINFOLD,
        by: constants.AGEDAY
      },
      {
        from: 'ssfa_girls_p_exp',
        to: 'child_female_subscapular_skinfold_for_age',
        key: 'age',
        measure: constants.SKINFOLD,
        by: constants.AGEDAY
      },
      {
        from: 'tsfa_boys_p_exp',
        to: 'child_male_triceps_skinfod_for_age',
        key: 'age',
        measure: constants.SKINFOLD,
        by: constants.AGEDAY
      },
      {
        from: 'tsfa_girls_p_exp',
        to: 'child_female_triceps_skinfod_for_age',
        key: 'age',
        measure: constants.SKINFOLD,
        by: constants.AGEDAY
      }
    ]
  },
  young: {
    localdir: path.join(__dirname, '..', 'lib', 'lms', 'db', 'bmi-young'),
    todir: path.join(__dirname, '..', 'lib', 'lms', 'db'),
    files: [
      {
        from: 'bmi_boys_perc_WHO2007_exp',
        to: 'young_male_bmi_for_age',
        key: 'month',
        measure: constants.BMI,
        by: constants.AGEMONTH
      },
      {
        from: 'bmi_girls_perc_WHO2007_exp',
        to: 'young_female_bmi_for_age',
        key: 'month',
        measure: constants.BMI,
        by: constants.AGEMONTH
      },
      {
        from: 'wfa_boys_perc_WHO2007_exp',
        to: 'young_male_weight_for_age',
        key: 'month',
        measure: constants.WEIGHT,
        by: constants.AGEMONTH
      },
      {
        from: 'wfa_girls_perc_WHO2007_exp',
        to: 'young_female_weight_for_age',
        key: 'month',
        measure: constants.WEIGHT,
        by: constants.AGEMONTH
      },
      {
        from: 'hfa_boys_perc_WHO2007_exp',
        to: 'young_male_height_for_age',
        key: 'month',
        measure: constants.HEIGHT,
        by: constants.AGEMONTH
      },
      {
        from: 'hfa_girls_perc_WHO2007_exp',
        to: 'young_female_height_for_age',
        key: 'month',
        measure: constants.HEIGHT,
        by: constants.AGEMONTH
      }
    ]
  }
};

Object.keys(filenames).forEach(function (key) {
  var info = filenames[key];
  info.files.forEach(function (files) {
    var dbfile = fs.createReadStream(path.join(info.localdir, files.from + '.txt')),
        lmsparser = parser({delimiter: '\t', newline: '\n'}),
        lmsformater = formater({
          key: files.key,
          measure: files.measure,
          by: files.by
        }),
        dbjson = fs.createWriteStream(path.join(info.todir, files.to + '.json'));

    dbfile.pipe(lmsparser).pipe(lmsformater).pipe(dbjson);
  });
});
