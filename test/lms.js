var expect = require('expect.js');
var mockstream = require('./helper/stream.js');
var to_fixed = require('./helper/math.js').to_fixed;

var calc = require('../lib/lms/calc.js');
var parser = require('../lib/lms/stream.js');
var transformer = require('../lib/lms/adapter.js');
var constants = require('../lib/lms/constants.js');
var LMS = require('../lib/lms/data.js');

describe('BoxCox functionality', function () {
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

  describe('Data processing', function () {
    var data = [
      {age: 91, l: 0.3933, m: 13.4779, s: 0.07474, p01: 10.579},
      {age: 92, l: 0.3916, m: 13.49, s: 0.07476, p01: 10.589}
    ];
    var meta = {
      key: 'age',
      measure: constants.CIRCUNFERENCE,
      by: constants.AGEMONTH
    };

    function toSource(data) {
      var source = data.map(function (hash) {
        return Object.keys(hash).map(function (key) {
          return String(hash[key]);
        }).join('\t') + '\n';
      });
      source.unshift(Object.keys(data[0]).join('\t') + '\n');
      return source;
    }

    describe('Data parse stream', function () {
      it('Put data in first line as keys in dict', function (done) {
        var reader = new mockstream.MockReader({
          source: toSource(data.slice(0, 1))
        });
        var interceptor = new mockstream.MockTransformer();
        var lmsparser = new parser.LMSStream();

        interceptor.on('finish', function () {
          var parsed = JSON.parse(interceptor._accum[0]);
          expect(
            parsed
          ).to.have.keys(
            Object.keys(data[0])
          );
          done();
        });

        reader.pipe(lmsparser).pipe(interceptor);
      });

      it('Put data in second line as values in dict', function (done) {
        var reader = new mockstream.MockReader({
          source: toSource(data.slice(0, 1))
        });
        var interceptor = new mockstream.MockTransformer();
        var lmsparser = new parser.LMSStream();

        interceptor.on('finish', function () {
          var parsed = JSON.parse(interceptor._accum[0]);
          expect(
            Object.keys(parsed).map(function (key) { return parsed[key]; })
          ).to.eql(
            Object.keys(data[0]).map(function (key) { return data[0][key]; })
          );
          done();
        });

        reader.pipe(lmsparser).pipe(interceptor);
      });

      it('Convert a list of values into dict', function (done) {
        var reader = new mockstream.MockReader({
          source: toSource(data.slice())
        });
        var interceptor = new mockstream.MockTransformer();
        var lmsparser = new parser.LMSStream();
        var counter = 0;

        interceptor.on('readable', function () {
          expect(interceptor.read()).to.equal(JSON.stringify(data[counter++]));
          if (counter === data.length) {
            done();
          }
        });

        reader.pipe(lmsparser).pipe(interceptor);
      });
    });

    describe('Data transform stream', function () {
      var reader = null;
      var interceptor = null;
      var converter = null;

      function execution(callback) {
        interceptor.on('finish', function () {
          callback(interceptor._accum[0]);
        });
        reader.pipe(converter).pipe(interceptor);
      }

      beforeEach(function () {
        reader = new mockstream.MockReader({
          source: data.map(JSON.stringify)
        });
        interceptor = new mockstream.MockTransformer();
        converter = new transformer.MemoryStream(meta);
      });

      afterEach(function () {
        reader = null;
        interceptor = null;
        converter = null;
      });

      it('Add meta information in `meta` property', function (done) {
        execution(function (data) {
          expect(JSON.parse(data).meta).to.eql({
            measure: meta.measure,
            by: meta.by
          });
          done();
        });
      });

      it('Create dict of age keys with lms values', function (done) {
        execution(function (data) {
          expect(JSON.parse(data).xcoord).to.eql({
            91: {l: 0.3933, m: 13.4779, s: 0.07474},
            92: {l: 0.3916, m: 13.49, s: 0.07476}
          });
          done();
        });
      });

      it('Create list of percentile values', function (done) {
        execution(function (data) {
          expect(JSON.parse(data).percentile).to.eql([
            {xcoord: 91, p01: 10.579},
            {xcoord: 92, p01: 10.589}
          ]);
          done();
        });
      });

      it('Convert data into proper format', function (done) {
        execution(function (data) {
          var expectation = {
            meta: {
              measure: meta.measure,
              by: meta.by
            },
            xcoord: {
              91: {l: 0.3933, m: 13.4779, s: 0.07474},
              92: {l: 0.3916, m: 13.49, s: 0.07476}
            },
            percentile: [
              {xcoord: 91, p01: 10.579},
              {xcoord: 92, p01: 10.589}
            ]
          };
          expect(data).to.equal(JSON.stringify(expectation));
          done();
        });
      });
    });

    describe('Data access', function () {
      var reader = null;
      var interceptor = null;
      var lmsparser = null;
      var converter = null;

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
    });
  });
});
