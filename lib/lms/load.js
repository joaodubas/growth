var fs = require('fs'),
    path = require('path'),
    parser = require('./stream.js'),
    persister = require('./adapter.js');

var root = path.resolve(path.dirname()),
    dbpath = path.join(root, 'static', 'db', 'bmi-young', 'bmi_boys_perc_WHO2007_exp.txt');


var filenames = {
        child: {
            basedir: path.join(__dirname, 'db', 'child'),
            localdir: path.join(__dirname, '..', '..', 'static', 'db', 'bmi-child'),
            files: [
                ['length_height', ['lhfa_boys_z_exp', 'lhfa_girls_z_exp']],
                ['weight', ['wfa_boys_z_exp', 'wfa_girls_z_exp']],
                ['bmi', ['bfa_boys_z_exp', 'bfa_girls_z_exp']],
                ['weight_for_length', ['wfl_boys_z_exp', 'wfl_girls_z_exp']],
                ['weigth_for_height', ['wfh_boys_z_exp', 'wfh_girls_z_exp']],
                ['arm_circunference', ['acfa_boys_z_exp', 'acfa_girls_z_exp']],
                ['subscapular_skinfold', ['ssfa_boys_z_exp', 'ssfa_girls_z_exp']],
                ['triceps_skinfold', ['tsfa_boys_z_exp', 'tsfa_girls_z_exp']]
            ]
        },
        young: {
            basedir: path.join(__dirname, 'db', 'young'),
            localdir: path.join(__dirname, '..', '..', 'static', 'db', 'bmi-young'),
            files: [
                ['bmi', ['bmi_boys_z_WHO2007_exp', 'bmi_girls_z_WHO2007_exp']],
                ['weight', ['wfa_boys_z_WHO2007_exp', 'wfa_girls_z_WHO2007_exp']],
                ['height', ['hfa_boys_z_WHO2007_exp', 'hfa_girls_z_WHO2007_exp']]
            ]
        }
    },
    toexport = {};

Object.keys(filenames).forEach(function (key) {
    var info = filenames[key];
    info.files.forEach(function (files) {
        files[1].forEach(function (basename) {
            var dbfile = fs.createReadStream(path.join(info.localdir, basename + '.txt')),
                lmsinfo = parser({delimiter: '\t', newline: '\n'}),
                inmemory = persister();

            inmemory.on('finish', function () { console.log(persister.memory.length); });

            dbfile.pipe(lmsinfo).pipe(inmemory);
        });
    });
});
