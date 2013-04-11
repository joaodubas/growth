var jasmine = require('jasmine-node'),
    sys = require('sys'),
    path = require('path');

for (var key in jasmine) {
  global[key] = jasmine[key];
}

var verbose = false,
    colors = false;

process.argv.forEach(function (arg) {
  switch (arg) {
    case '-c':
    case '--color':
      colors = true;
      break;
    case '-v':
    case '--verbose':
      verbose = true;
      break;
  }
});

jasmine.executeSpecsInFolder({
  specFolders: [path.join(__dirname, 'spec')],
  onComplete: function (runner, log) {
    var code = 0;
    if (runner.results().failedCount) {
      code = 1;
    }
    process.exit(code);
  },
  isVerbose: verbose,
  showColors: colors,
  useRequireJs: false,
  regExpSpec: false,
  junitreport: false,
  includeStackTrace: false
});
