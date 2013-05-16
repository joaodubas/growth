#!/usr/bin/env node
var fs = require('fs'),
    path = require('path'),
    parser = require('../lib/lms/stream'),
    formater = require('../lib/lms/adapter'),
    constants = require('../lib/lms/constants');

// Map all filenames and paths, allowing the convertion between the WHO csv
// files and the json files. It also configure the initial meta information to
// each csv such as:
// -- key: value that will be used to classify the limits
// -- measure: details about the measured variable
// -- by: details about the key value
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
        to: 'child_male_c_upper_arm_for_age',
        key: 'age',
        measure: constants.CIRCUNFERENCE,
        by: constants.AGEDAY
      },
      {
        from: 'acfa_girls_p_exp',
        to: 'child_female_c_upper_arm_for_age',
        key: 'age',
        measure: constants.CIRCUNFERENCE,
        by: constants.AGEDAY
      },
      {
        from: 'hcfa_boys_p_exp',
        to: 'child_male_c_head_for_age',
        key: 'age',
        measure: constants.CIRCUNFERENCE,
        by: constants.AGEDAY
      },
      {
        from: 'hcfa_girls_p_exp',
        to: 'child_female_c_head_for_age',
        key: 'age',
        measure: constants.CIRCUNFERENCE,
        by: constants.AGEDAY
      },
      {
        from: 'ssfa_boys_p_exp',
        to: 'child_male_sk_subscapular_for_age',
        key: 'age',
        measure: constants.SKINFOLD,
        by: constants.AGEDAY
      },
      {
        from: 'ssfa_girls_p_exp',
        to: 'child_female_sk_subscapular_for_age',
        key: 'age',
        measure: constants.SKINFOLD,
        by: constants.AGEDAY
      },
      {
        from: 'tsfa_boys_p_exp',
        to: 'child_male_sk_triceps_for_age',
        key: 'age',
        measure: constants.SKINFOLD,
        by: constants.AGEDAY
      },
      {
        from: 'tsfa_girls_p_exp',
        to: 'child_female_sk_triceps_for_age',
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

var parserOptions = {delimiter: '\t', newline: '\n'};

function handleError(err) {
  process.stderr.write(err);
  process.exit(1);
}

function showProcess() {
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  process.stdout.write(this.proc + ': ' + this.filename);
}

process.stdout.write('Converting data files.');
Object.keys(filenames).forEach(function (key) {
  var info = filenames[key];
  info.files.forEach(function (files) {
    var orig = path.join(info.localdir, files.from + '.txt');
    var dest = path.join(info.todir, files.to + '.json');
    var dbfile = fs.createReadStream(orig),
        lmsparser = parser(parserOptions),
        lmsformater = formater({
          key: files.key,
          measure: files.measure,
          by: files.by
        }),
        dbjson = fs.createWriteStream(dest);
    
    dbfile.on('error', handleError);
    dbfile.once('readable', showProcess.bind({
      filename: files.from,
      proc: 'start'
    }));
    lmsparser.on('error', handleError);
    lmsformater.on('error', handleError);
    dbjson.on('error', handleError);
    dbjson.on('finish', showProcess.bind({
      filename: files.to,
      proc: 'end'
    }));

    dbfile.pipe(lmsparser).pipe(lmsformater).pipe(dbjson);
  });
});
