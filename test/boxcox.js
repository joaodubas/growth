var expect = require('expect.js');
var to_fixed = require('./helper/math').to_fixed;
var calc = require('../lib/lms/calc.js');

describe('Conversions between z-score and measure', function () {
  describe('From measure to z-score', function () {
    it('Get a z-score from measure and lms details', function () {
      var options = {
          measure: 19,
          lms: {power: -1.6318, median: 16.0490, cv: 0.10038}
      };
      expect(to_fixed(calc.zscore(options), 2)).to.equal(1.47);
    });

    it('Get a fixed z-score for values greater than +3', function () {
      var options = {
          measure: 30,
          lms: {power: -1.7862, median: 16.9392, cv: 0.11070}
      };
      expect(to_fixed(calc.zscore(options), 2)).to.equal(3.35);
    });

    it('Get a fixed z-score for values less than -3', function () {
      var options = {
          measure: 14,
          lms: {power: -1.3529, median: 20.4951, cv: 0.12579}
      };
      expect(to_fixed(calc.zscore(options), 2)).to.equal(-3.79);
    });
  });

  describe('From z-score to measure', function () {
    it('Get a measure from z-score and lms details', function () {
      var options = {
          zscore: 1.47,
          lms: {power: -1.6318, median: 16.0490, cv: 0.10038}
      };
      expect(to_fixed(calc.measure(options), 0)).to.equal(19);
    });

    it('Raise error for z-score greater than +3', function () {
      var options = {
          zscore: 3.35,
          lms: {power: -1.7862, median: 16.9392, cv: 0.11070}
      };
      expect(function () {
        calc.measure(options);
      }).to.throwException(
        /-3|\+3/
      );
    });

    it('Raise error for z-score less than -3', function () {
      var options = {
          zscore: -3.79,
          lms: {power: -1.3529, median: 20.4951, cv: 0.12579}
      };
      expect(function () {
        calc.measure(options);
      }).to.throwException(
        /-3|\+3/
      );
    });
  });
});

