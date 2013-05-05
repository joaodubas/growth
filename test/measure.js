var expect = require('expect.js');
var measure = require('../lib/measure/index.js').measure;
var batchMeasure = require('../lib/measure/index.js').batchMeasure;

describe('Measurement process', function () {
  describe('Process one measurement', function () {
    var measurement;
    beforeEach(function () {
      measurement = {
        "gender": "male",
        "dob": "2000/05/09",
        "doa": "2000/10/12",
        "weight": 4.80,
        "height": 59.80,
        "c_head": 38.90,
        "c_upper_arm": 11.20,
        "sk_triceps": 5.50,
        "sk_subscapular": 4.60
      };
    });
    afterEach(function () {
      measurement = null;
    });
    it('Have a results for child measurement.', function (done) {
      measure(measurement, function (error, data) {
        expect(data).to.have.property('result');
        done();
      });
    });
    it('Calculate age in days, months and years.', function (done) {
      measure(measurement, function (error, data) {
        expect(data.result).to.have.keys([
          'ageInDays',
          'ageInMonths',
          'ageInYears'
        ]);
        done();
      });
    });
    it('Calculate zscore and percentile.', function (done) {
      measure(measurement, function (error, data) {
        var measures = [
          'weight',
          'height',
          'c_head',
          'c_upper_arm',
          'sk_triceps',
          'sk_subscapular'
        ];
        measures.forEach(function (key) {
          expect(data.result.measures[key]).to.have.keys([
            'zscore',
            'percentile'
          ]);
        });
        done();
      });
    });
    it('Calculate values only to measures passed.', function (done) {
      var toDelete = ['sk_triceps', 'sk_subscapular', 'c_upper_arm', 'c_head'];
      toDelete.forEach(function (key) { delete measurement[key] });
      measure(measurement, function (error, data) {
        expect(data.result.measures).to.not.have.keys(toDelete);
        done();
      });
    });
  });
  describe('Process measurements in batch', function () {
    var measurements;
    beforeEach(function () {
      measurements = [
        {
          "gender": "female",
          "dob": "1990/09/14",
          "doa": "1990/09/14",
          "weight": 3.20,
          "height": 48.50
        },
        {
          "gender": "female",
          "dob": "1990/09/14",
          "doa": "1997/11/19",
          "weight": 16.50,
          "height": 115.00
        }
      ];
    });
    afterEach(function() {
      measurements = [];
    });
    it('Generate result for each measurement.', function (done) {
      batchMeasure(measurements, function (error, data) {
        expect(data.length).to.equal(measurements.length);
        done();
      });
    });
    it('Get result for each measurement.', function (done) {
      batchMeasure(measurements, function (error, data) {
        data.forEach(function (result) {
          expect(result.result).to.have.keys([
            'ageInDays',
            'ageInMonths',
            'ageInYears'
          ]);
          expect(result.result.measures).to.have.keys(['weight', 'height']);
        });
        done();
      });
    });
  });
});
