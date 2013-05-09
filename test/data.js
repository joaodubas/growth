var expect = require('expect.js');
var mockstream = require('./helper/stream.js');
var to_fixed = require('./helper/math.js').to_fixed;

var parser = require('../lib/lms/stream.js');
var transformer = require('../lib/lms/adapter.js');
var constants = require('../lib/lms/constants.js');
var LMS = require('../lib/lms/data.js');
var DB = require('../lib/lms/index.js');

describe('Data access', function () {
  // lines from the upper arm circunference file for boys
  var data = [
    {age: 91, l: 0.3933, m: 13.4779, s: 0.07474, p01: 10.579},
    {age: 92, l: 0.3916, m: 13.49, s: 0.07476, p01: 10.589}
  ];
  var meta = {
    key: 'age',
    measure: constants.CIRCUNFERENCE,
    by: constants.AGEDAY
  };

  // convert a dict into a csv like list, containing a row of titles and rows
  // for each data value
  function toSource(data) {
    var source = data.map(function (hash) {
      return Object.keys(hash).map(function (key) {
        return String(hash[key]);
      }).join('\t') + '\n';
    });
    source.unshift(Object.keys(data[0]).join('\t') + '\n');
    return source;
  }
  
  // stream available during test
  var reader = null;
  var interceptor = null;
  var lmsparser = null;
  var converter = null;

  // receive a callback that will be called with the parsed data, this
  // callback represents the test being evaluated
  function execution(callback) {
    interceptor.on('finish', function () {
      callback(interceptor._accum[0]);
    });
    reader.pipe(lmsparser).pipe(converter).pipe(interceptor);
  }

  beforeEach(function () {
    reader = new mockstream.MockReader({
      source: toSource(data)
    });
    interceptor = new mockstream.MockTransformer();
    lmsparser = new parser.LMSStream();
    converter = new transformer.MemoryStream(meta);
  });

  afterEach(function () {
    reader = null;
    interceptor = null;
    lmsparser = null;
    converter = null;
  });

  // base measures available for test
  var age = 91;
  var measure = 13.4779;
  var percentile = 0.5;
  var zscore = 0;

  it('Get lms parameters for age and measure', function (done) {
    execution(function (data) {
      var lms = {
        power: 0.3933,
        median: 13.4779,
        cv: 0.07474
      };
      var db = new LMS(JSON.parse(data));
      expect(db._params(age)).to.eql(lms);
      done();
    });
  });

  it('Get zscore for age and measure', function (done) {
    execution(function (data) {
      var db = new LMS(JSON.parse(data));
      expect(
        to_fixed(db.zscore({xvalue: age, measure: measure}), 4)
      ).to.eql(
        to_fixed(zscore, 4)
      );
      done();
    });
  });

  it('Get percentile for age and measure', function (done) {
    execution(function (data) {
      var db = new LMS(JSON.parse(data));
      expect(
        to_fixed(db.percentile({xvalue: age, measure: measure}), 4)
      ).to.eql(
        to_fixed(percentile, 4)
      );
      done();
    });
  });

  it('Get centile for age and zcore', function (done) {
    execution(function (data) {
      var db = new LMS(JSON.parse(data));
      expect(
        to_fixed(db.centile({xvalue: age, zscore: zscore}), 4)
      ).to.eql(
        to_fixed(measure, 4)
      );
      done();
    });
  });

  it('Throw error for missing args in zscore', function (done) {
    execution(function (data) {
      var db = new LMS(JSON.parse(data));
      expect(function () {
        db.zscore({xvalue: age});
      }).to.throwException(/measure|age/);
      expect(function () {
        db.zscore({measure: measure});
      }).to.throwException(/measure|age/);
      expect(function () {
        db.zscore({});
      }).to.throwException(/measure|age/);
      expect(function () {
        db.zscore();
      }).to.throwException(/measure|age/);
      done();
    });
  });

  it('Throw error for missing args in percentile', function (done) {
    execution(function (data) {
      var db = new LMS(JSON.parse(data));
      expect(function () {
        db.percentile({xvalue: age});
      }).to.throwException(/measure|age/);
      expect(function () {
        db.percentile({measure: measure});
      }).to.throwException(/measure|age/);
      expect(function () {
        db.percentile({});
      }).to.throwException(/measure|age/);
      expect(function () {
        db.percentile();
      }).to.throwException(/measure|age/);
      done();
    });
  });

  it('Throw error for missing args in centile', function (done) {
    execution(function (data) {
      var db = new LMS(JSON.parse(data));
      expect(function () {
        db.centile({zscore: zscore});
      }).to.throwException(/zscore|age/);
      expect(function () {
        db.centile({age: age});
      }).to.throwException(/zscore|age/);
      expect(function () {
        db.centile({});
      }).to.throwException(/zscore|age/);
      expect(function () {
        db.centile();
      }).to.throwException(/zscore|age/);
      done();
    });
  });

  it('Verifiy if key value is on/off limits', function (done) {
    execution(function (data) {
      var db = new LMS(JSON.parse(data));
      var minAge = JSON.parse(data).meta.limit.min;
      var maxAge = JSON.parse(data).meta.limit.max;
      expect(db.onLimit(minAge)).to.be.ok();
      expect(db.onLimit(maxAge)).to.be.ok();
      expect(db.onLimit(minAge - 1)).to.not.be.ok();
      expect(db.onLimit(maxAge + 1)).to.not.be.ok();
      done();
    });
  });

  it('Don\'t show zscore when key value is off limits', function (done) {
    execution(function (data) {
      var db = new LMS(JSON.parse(data));
      var minAge = JSON.parse(data).meta.limit.min;
      var maxAge = JSON.parse(data).meta.limit.max
      expect(
        isNaN(db.zscore({xvalue: minAge - 1, measure: measure}))
      ).to.be.ok();
      expect(
        isNaN(db.zscore({xvalue: maxAge + 1, measure: measure}))
      ).to.be.ok();
      done();
    });
  });

  it('Don\'t show percentile whe key value is off limits', function (done) {
    execution(function (data) {
      var db = new LMS(JSON.parse(data));
      var minAge = JSON.parse(data).meta.limit.min;
      var maxAge = JSON.parse(data).meta.limit.max;
      expect(
        isNaN(db.percentile({xvalue: minAge - 1, measure: measure}))
      ).to.be.ok();
      expect(
        isNaN(db.percentile({xvalue: maxAge + 1, measure: measure}))
      ).to.be.ok();
      done();
    });
  });

  it('Don\'t show centile when key value is off limits', function (done) {
    execution(function (data) {
      var db = new LMS(JSON.parse(data));
      var minAge = JSON.parse(data).meta.limit.min;
      var maxAge = JSON.parse(data).meta.limit.max;
      expect(
        isNaN(db.centile({xvalue: minAge - 1, zscore: zscore}))
      ).to.be.ok();
      expect(
        isNaN(db.centile({xvalue: maxAge + 1, zscore: zscore}))
      ).to.be.ok();
      done();
    });
  });
});
