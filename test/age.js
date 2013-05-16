var expect = require('expect.js');
var age = require('../lib/age');
var to_fixed = require('./helper/math').to_fixed;

describe('Age manipulation', function () {
  var doa = new Date(2013, 11, 15),
      dob = new Date(1978, 11, 15);

  it('Should get proper age in days', function () {
    expect(to_fixed(age.indays(doa, dob), 0)).to.equal(12784);
  });

  it('Should get proper age in months', function () {
    expect(to_fixed(age.inmonths(doa, dob), 0)).to.equal(420);
  });

  it('Should get proper age in years', function () {
    expect(to_fixed(age.inyears(doa, dob), 0)).to.equal(35);
  });
});
