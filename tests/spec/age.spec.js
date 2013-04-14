var age = require('../../lib/age');

describe('Age manipulation', function () {
  var doa = new Date(2013, 11, 15),
      dob = new Date(1978, 11, 15);

  function to_fixed(value, decimal) {
    decimal = !isNaN(decimal) ? decimal : 4;
    return Number(Number.prototype.toFixed.call(value, decimal));
  }

  it('Should get proper age in days', function () {
    expect(to_fixed(age.indays(doa, dob), 0)).toEqual(12784);
  });

  it('Should get proper age in months', function () {
    expect(to_fixed(age.inmonths(doa, dob), 0)).toEqual(420);
  });

  it('Should get proper age in years', function () {
    expect(to_fixed(age.inyears(doa, dob), 0)).toEqual(35);
  });
});
