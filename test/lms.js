var expect = require('expect.js');
var mockstream = require('./helper/stream.js');

var calc = require('../lib/lms/calc.js');
var parser = require('../lib/lms/stream.js');
var transformer = require('../lib/lms/adapter.js');
var constants = require('../lib/lms/constants.js');

describe('BoxCox functionality', function () {
  describe('Conversions between z-score and measure', function () {
    function to_fixed(value, decimal) {
      decimal = !isNaN(decimal) ? decimal : 4;
      return Number(Number.prototype.toFixed.call(value, decimal));
    }

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
          'Z-score must be -3 <= z <= +3.'
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
          'Z-score must be -3 <= z <= +3.'
        );
      });
    });
  });

  describe('Data processing', function () {
    var data = [
      {
        age: 91,
        l: 0.3933,
        m: 13.4779,
        s: 0.07474,
        p01: 10.579
      },
      {
        age: 92,
        l: 0.3916,
        m: 13.49,
        s: 0.07476,
        p01: 10.589
      }
    ];
    var datameta = {
      key: 'age',
      measure: constants.CIRCUNFERENCE,
      by: constants.AGEMONTH
    }

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

      beforeEach(function () {
        reader = new mockstream.MockReader({
          source: data.map(JSON.stringify)
        });
        interceptor = new mockstream.MockTransformer();
        converter = new transformer.MemoryStream(datameta);
      });

      afterEach(function () {
        reader = null;
        interceptor = null;
        converter = null;
      });

      it('Add meta information in `meta` property', function (done) {
        interceptor.on('finish', function () {
          expect(JSON.parse(interceptor._accum[0]).meta).to.eql({
            measure: datameta.measure,
            by: datameta.by
          });
          done();
        });

        reader.pipe(converter).pipe(interceptor);
      });

      it('Create dict of age keys with lms values', function (done) {
        interceptor.on('finish', function () {
          expect(JSON.parse(interceptor._accum[0]).xcoord).to.eql({
            91: {
              l: 0.3933,
              m: 13.4779,
              s: 0.07474
            },
            92: {
              l: 0.3916,
              m: 13.49,
              s: 0.07476
            }
          });
          done();
        });

        reader.pipe(converter).pipe(interceptor);
      });

      it('Create list of percentile values', function (done) {
        interceptor.on('finish', function () {
          expect(JSON.parse(interceptor._accum[0]).percentile).to.eql([
            {
              xcoord: 91,
              p01: 10.579
            },
            {
              xcoord: 92,
              p01: 10.589
            }
          ]);

          done();
        });
        reader.pipe(converter).pipe(interceptor);
      });

      it('Convert data into proper format', function (done) {
        var expectation = {
          meta: {
            measure: datameta.measure,
            by: datameta.by
          },
          xcoord: {
            91: {
              l: 0.3933,
              m: 13.4779,
              s: 0.07474
            },
            92: {
              l: 0.3916,
              m: 13.49,
              s: 0.07476
            }
          },
          percentile: [
            {
              xcoord: 91,
              p01: 10.579
            },
            {
              xcoord: 92,
              p01: 10.589
            }
          ]
        }

        interceptor.on('finish', function () {
          expect(interceptor._accum[0]).to.equal(JSON.stringify(expectation));
          done();
        });

        reader.pipe(converter).pipe(interceptor);
      });
    });
  });
});
