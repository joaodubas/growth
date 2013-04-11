var fs = require('fs'),
    path = require('path'),
    parser = require('./stream.js'),
    persister = require('./adapter.js');

var filenames = {
  child: {
    localdir: path.join(__dirname, '..', '..', 'static', 'db', 'bmi-child'),
    files: [
      ['length_height', ['lhfa_boys_p_exp', 'lhfa_girls_p_exp']],
      ['weight', ['wfa_boys_p_exp', 'wfa_girls_p_exp']],
      ['bmi', ['bfa_boys_p_exp', 'bfa_girls_p_exp']],
      ['weight_for_length', ['wfl_boys_p_exp', 'wfl_girls_p_exp']],
      ['weigth_for_height', ['wfh_boys_p_exp', 'wfh_girls_p_exp']],
      ['arm_circunference', ['acfa_boys_p_exp', 'acfa_girls_p_exp']],
      ['subscapular_skinfold', ['ssfa_boys_p_exp', 'ssfa_girls_p_exp']],
      ['triceps_skinfold', ['tsfa_boys_p_exp', 'tsfa_girls_p_exp']]
    ]
  },
  young: {
    localdir: path.join(__dirname, '..', '..', 'static', 'db', 'bmi-young'),
    files: [
      ['bmi', ['bmi_boys_perc_WHO2007_exp', 'bmi_girls_perc_WHO2007_exp']],
      ['weight', ['wfa_boys_perc_WHO2007_exp', 'wfa_girls_perc_WHO2007_exp']],
      ['height', ['hfa_boys_perc_WHO2007_exp', 'hfa_girls_perc_WHO2007_exp']]
    ]
  }
};

Object.keys(filenames).forEach(function (key) {
  var info = filenames[key];
  info.files.forEach(function (files) {
    files[1].forEach(function (basename) {
      var dbfile = fs.createReadStream(path.join(info.localdir, basename + '.txt')),
          lmsinfo = parser({delimiter: '\t', newline: '\n'}),
          inmemory = persister();

      inmemory.on('finish', function () {
        console.log(
          basename,
          Object.keys(inmemory.memory.xcoord).length,
          Math.min.apply(null, (Object.keys(inmemory.memory.xcoord))),
          Math.max.apply(null, (Object.keys(inmemory.memory.xcoord)))
        );
      });

      dbfile.pipe(lmsinfo).pipe(inmemory);
    });
  });
});
