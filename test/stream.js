var expect = require('expect.js');
var mockstream = require('./helper/stream.js');
var to_fixed = require('./helper/math.js').to_fixed;

var parser = require('../lib/lms/stream.js');
var transformer = require('../lib/lms/adapter.js');
var constants = require('../lib/lms/constants.js');
var LMS = require('../lib/lms/data.js');

describe('Data processing', function () {
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
        ).to.only.have.keys(
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

    // receive a callback that will be called with the parsed data, this
    // callback represents the test being evaluated
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
        expect(JSON.parse(data).meta).to.only.have.keys([
          'measure',
          'by',
          'limit'
        ]);
        done();
      });
    });

    it('Limit is based in lower/upper values for xcoord key', function (done) {
      execution(function (data) {
        expect(JSON.parse(data).meta.limit.min).to.equal(91);
        expect(JSON.parse(data).meta.limit.max).to.equal(92);
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
            by: meta.by,
            limit: {
              min: 91,
              max: 92
            }
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
});
 
