# Growth calculation/classification tool

[![Build Status](https://travis-ci.org/joaodubas/growth.png?branch=master)](https://travis-ci.org/joaodubas/growth)

## Usage

To install the library all you have to do is:

```bash
$ npm install growth
```

If you don't have node installed checkout this guide.

After install the package, you can start using in the following way:

```javascript
var growth = require('growth');
var measure = {
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

function calculate(error, result) {
    if (error) {
        throw error;
    }
    console.log(result.result);
}

growth.measure(measure, calculate);
```

If you have a series of measurements, it's possible to process then in a
batch:

```javascript
var growth = require('growth');
var measures = [
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
  }
];

function calculate(error, results) {
    if (error) {
        throw error;
    }
    results.forEach(function (result) {
        console.log(result.result);
    });
}

growth.batchMeasure(measures, calculate);
```

## API

### `growth#measure`

### `growth#batchMeasure`

### `growth#Measure`

### Measure definition

## TODO

* Add license info
* Implement stream interface, something in the line of [levelUp][level-up]
* How about implement:
    * [Istanbul][istanbul] for code coverage and
    * [Complexity Report][cr] for code analysis
* Expose the `factory#db` interface contained in `lib#lms`

## Sources

* [Growth until 5 years][bmi-5]
* [Growth until 19 years][bmi-19]
* [BMI adults][bmi]

## LICENSE

Copyright (c) 2013 Joao Paulo Dubas <joao.dubas@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

[bmi-5]: http://www.who.int/childgrowth/en/
[bmi-19]: http://www.who.int/growthref/en/
[bmi]: http://apps.who.int/bmi/index.jsp?introPage=intro_3.html
[istanbul]: http://ariya.ofilabs.com/2013/05/hard-thresholds-on-javascript-code-coverage.html
[cr]: http://ariya.ofilabs.com/2013/05/continuous-monitoring-of-javascript-code-complexity.html
[level-up]: https://github.com/rvagg/node-levelup
