var expect = require('expect.js');
var mockstream = require('./helper/stream.js');
var to_fixed = require('./helper/math.js').to_fixed;

var LMS = require('../lib/lms/data.js');
var DB = require('../lib/lms/index.js');

describe('Database access', function () {
  it('Should have two age groups', function () {
    expect(DB).to.only.have.keys(['child', 'young']);
  });
  it('Should have two genders', function () {
    expect(DB.child).to.only.have.keys(['female', 'male']);
    expect(DB.young).to.only.have.keys(['female', 'male']);
  });
  it('Should have all available measures', function () {
    var childMeasures = [
      'weight_for_age',
      'weight_for_length',
      'weight_for_height',
      'length_height_for_age',
      'bmi_for_age',
      'c_upper_arm_for_age',
      'c_head_for_age',
      'sk_triceps_for_age',
      'sk_subscapular_for_age'
    ];
    var youngMeasures = [
      'weight_for_age',
      'height_for_age',
      'bmi_for_age'
    ];
    expect(DB.child.female).to.only.have.keys(childMeasures);
    expect(DB.child.male).to.only.have.keys(childMeasures);
    expect(DB.young.female).to.only.have.keys(youngMeasures);
    expect(DB.young.male).to.only.have.keys(youngMeasures);
  });
  it('Should implement LMS data interface', function () {
    var db = DB.child.female.bmi_for_age
    expect(db).to.be.a(LMS);
    expect(db.zscore).to.be.a(Function);
    expect(db.percentile).to.be.a(Function);
    expect(db.centile).to.be.a(Function);
  });
});

