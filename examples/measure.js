var fs = require('fs');
var batchMeasure = require('../lib/measure').batchMeasure;

var kwanzaKofi = [
  {
    "gender": "male",
    "dob": "2000/05/09",
    "doa": "2000/10/12",
    "weight": 4.80,
    "height": 59.80,
    "c_head": 38.90,
    "c_upper_arm": 11.20,
    "sk_triceps": 5.50,
    "sk_subscapular": 4.60
  },
  {
    "gender": "male",
    "dob": "2000/05/09",
    "doa": "2000/12/12",
    "weight": 5.50,
    "height": 61.20,
    "c_head": 40.30,
    "c_upper_arm": 11.40,
    "sk_triceps": 5.20,
    "sk_subscapular": 4.40
  },
  {
    "gender": "male",
    "dob": "2000/05/09",
    "doa": "2001/03/15",
    "weight": 7.10,
    "height": 65.40,
    "c_head": 41.60,
    "c_upper_arm": 11.50,
    "sk_triceps": 4.80,
    "sk_subscapular": 4.10
  },
  {
    "gender": "male",
    "dob": "2000/05/09",
    "doa": "2001/07/26",
    "weight": 7.90,
    "height": 70.50,
    "c_head": 42.70,
    "c_upper_arm": 11.60,
    "sk_triceps": 4.50,
    "sk_subscapular": 3.90
  },
  {
    "gender": "male",
    "dob": "2000/05/09",
    "doa": "2001/12/26",
    "weight": 8.60,
    "height": 75.10,
    "c_head": 43.50,
    "c_upper_arm": 11.80,
    "sk_triceps": 4.30,
    "sk_subscapular": 3.80
  },
  {
    "gender": "male",
    "dob": "2000/05/09",
    "doa": "2002/05/29",
    "weight": 9.80,
    "height": 81.20,
    "c_head": 44.20,
    "c_upper_arm": 12.00,
    "sk_triceps": 4.30,
    "sk_subscapular": 3.70
  },
  {
    "gender": "male",
    "dob": "2000/05/09",
    "doa": "2002/12/30",
    "weight": 11.20,
    "height": 89.90,
    "c_head": 44.80,
    "c_upper_arm": 12.30,
    "sk_triceps": 4.30,
    "sk_subscapular": 3.70
  },
  {
    "gender": "male",
    "dob": "2000/05/09",
    "doa": "2003/10/26",
    "weight": 13.90,
    "height": 95.20,
    "c_head": 45.50,
    "c_upper_arm": 12.60,
    "sk_triceps": 4.20,
    "sk_subscapular": 3.60
  }
];

var hamadehLeila = [
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
    "doa": "1990/11/16",
    "weight": 4.00,
    "height": 55.00
  },
  {
    "gender": "female",
    "dob": "1990/09/14",
    "doa": "1991/06/05",
    "weight": 5.70,
    "height": 62.80
  },
  {
    "gender": "female",
    "dob": "1990/09/14",
    "doa": "1992/10/20",
    "weight": 8.40,
    "height": 80.00
  },
  {
    "gender": "female",
    "dob": "1990/09/14",
    "doa": "1994/01/20",
    "weight": 10.30,
    "height": 89.00
  },
  {
    "gender": "female",
    "dob": "1990/09/14",
    "doa": "1994/12/15",
    "weight": 11.50,
    "height": 95.00
  },
  {
    "gender": "female",
    "dob": "1990/09/14",
    "doa": "1997/11/19",
    "weight": 16.50,
    "height": 115.00
  },
  {
    "gender": "female",
    "dob": "1990/09/14",
    "doa": "2000/04/16",
    "weight": 20.00,
    "height": 123.50
  },
  {
    "gender": "female",
    "dob": "1990/09/14",
    "doa": "2004/07/13",
    "weight": 30.00,
    "height": 142.50
  },
  {
    "gender": "female",
    "dob": "1990/09/14",
    "doa": "2007/06/28",
    "weight": 37.00,
    "height": 150.00
  }
];

function createResult(measures, filename) {
  batchMeasure(measures, function (error, data) {
    if (error) {
      throw error;
    }
    var asjson = JSON.stringify(data.map(function (measure) {
      return measure.result;
    }));
    fs.writeFileSync(filename, asjson, 'utf-8');
  });
}

createResult(kwanzaKofi, 'kwanzaKofi.json');
createResult(hamadehLeila, 'hamadehLeila.json');
