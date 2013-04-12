#!/usr/bin/env node
var fs = require('fs'),
    path = require('path'),
    parser = require('../lib/lms/stream.js'),
    converter = require('../lib/lms/adapter.js');

var filenames = {
  child: {
    localdir: path.join(__dirname, '..', 'lib', 'lms', 'db', 'bmi-child'),
    todir: path.join(__dirname, '..', 'lib', 'lms', 'db'),
    files: [
      {
        from: 'lhfa_boys_p_exp',
        to: 'length-child_height_for_age_male'
      },
      {
        from: 'lhfa_girls_p_exp',
        to: 'length-child_height_for_age_female'
      },
      {
        from: 'wfa_boys_p_exp',
        to: 'child_weight_for_age_male'
      },
      {
        from: 'wfa_girls_p_exp',
        to: 'child_weight_for_age_female'
      },
      {
        from: 'bfa_boys_p_exp',
        to: 'child_bmi_for_age_male'
      },
      {
        from: 'bfa_girls_p_exp',
        to: 'child_bmi_for_age_female'
      },
      {
        from: 'wfl_boys_p_exp',
        to: 'child_weight_for_length_male'
      },
      {
        from: 'wfl_girls_p_exp',
        to: 'child_weight_for_length_female'
      },
      {
        from: 'wfh_boys_p_exp',
        to: 'child_weight_for_height_male'
      },
      {
        from: 'wfh_girls_p_exp',
        to: 'child_weight_for_height_female'
      },
      {
        from: 'acfa_boys_p_exp',
        to: 'child_arm_circ_for_age_male'
      },
      {
        from: 'acfa_girls_p_exp',
        to: 'child_arm_circ_for_age_female'
      },
      {
        from: 'ssfa_boys_p_exp',
        to: 'child_subscapular_skinfold_for_age_male'
      },
      {
        from: 'ssfa_girls_p_exp',
        to: 'child_subscapular_skinfold_for_age_female'
      },
      {
        from: 'tsfa_boys_p_exp',
        to: 'child_triceps_skinfod_for_age_male'
      },
      {
        from: 'tsfa_girls_p_exp',
        to: 'child_triceps_skinfod_for_age_female'
      }
    ]
  },
  young: {
    localdir: path.join(__dirname, '..', 'lib', 'lms', 'db', 'bmi-young'),
    todir: path.join(__dirname, '..', 'lib', 'lms', 'db'),
    files: [
      {
        from: 'bmi_boys_perc_WHO2007_exp',
        to: 'young_bmi_for_age_male'
      },
      {
        from: 'bmi_girls_perc_WHO2007_exp',
        to: 'young_bmi_for_age_female'
      },
      {
        from: 'wfa_boys_perc_WHO2007_exp',
        to: 'young_weight_for_age_male'
      },
      {
        from: 'wfa_girls_perc_WHO2007_exp',
        to: 'young_weight_for_age_female'
      },
      {
        from: 'hfa_boys_perc_WHO2007_exp',
        to: 'young_height_for_age_male'
      },
      {
        from: 'hfa_girls_perc_WHO2007_exp',
        to: 'young_height_for_age_female'
      }
    ]
  }
};

Object.keys(filenames).forEach(function (key) {
  var info = filenames[key];
  info.files.forEach(function (files) {
    var dbfile = fs.createReadStream(path.join(info.localdir, files.from + '.txt')),
        lmsparser = parser({delimiter: '\t', newline: '\n'}),
        lmsconverter = converter(),
        dbjson = fs.createWriteStream(path.join(info.todir, files.to + '.json'));

    dbfile.pipe(lmsparser).pipe(lmsconverter).pipe(dbjson);
  });
});
