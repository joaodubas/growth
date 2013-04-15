var expect = require('expect.js');
var snd = require('../../lib/statistic');

describe('Calculations over the standard normal distribution', function () {
  function to_fixed(value, decimal) {
    decimal = !isNaN(decimal) ? decimal : 4;
    return Number(Number.prototype.toFixed.call(value, decimal));
  }

  var zscores = [-3, -2, -1, 0, 1, 2, 3],
      unipvalues = [0.0013, 0.0228, 0.1587, 0.5000, 0.8413, 0.9772, 0.9987],
      bipvalues = [0.0044, 0.0540, 0.2420, 0.3989, 0.2420, 0.0540, 0.0044];

  it('Should calculate proper pdf function', function () {
    zscores.forEach(function (z, index) {
      expect(to_fixed(snd.pdf(z))).to.equal(bipvalues[index]);
    });
  });

  it('Should calculate proper cdf function', function () {
    zscores.forEach(function (z, index) {
      expect(to_fixed(snd.cdf(z))).to.equal(unipvalues[index]);
    });
  });

  it('Should calculate proper inverse for cdf function', function () {
    unipvalues.forEach(function (p, index) {
      expect(to_fixed(snd.icdf(p), 0)).to.equal(zscores[index]);
    });
  });
});
