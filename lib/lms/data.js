var calc = require('./calc');
var snd = require('../statistic');

function LMS(db) {
    this.db = db.xcoord;
    this.key = db.meta.by.measure;
    this.errors = {
        measure: 'Values for `measure` or `' + this.key + '` are required.',
        zscore: 'Value for `zscore` or `' + this.key + '` are required.'
    };
}

LMS.prototype._named = function _params(lms) {
    return {
        'power': lms.l,
        'cv': lms.s,
        'median': lms.m
    };
};
LMS.prototype._params = function _params(xvalue) {
    return this._named(this.db[xvalue]);
};
LMS.prototype.zscore = function zscore(options) {
    if (!options || !options.measure || isNaN(options.xvalue)) {
        throw new Error(this.errors.measure);
    }
    if (!options.lms) {
        options.lms = this._params(options.xvalue);
    }
    return calc.zscore({measure: options.measure, lms: options.lms});
};
LMS.prototype.percentile = function percentile(options) {
    if (!options || !options.measure || isNaN(options.xvalue)) {
        throw new Error(this.errors.measure);
    }
    if (!options.zscore) {
        options.zscore = this.zscore(options);
    }
    return snd.cdf(options.zscore);
};
LMS.prototype.centile = function centile(options) {
    if (!options || isNaN(options.zscore) || isNaN(options.xvalue)) {
        throw new Error(this.errors.zscore);
    }
    if (!options.lms) {
        options.lms = this._params(options.xvalue);
    }
    return calc.measure(options);
};

module.exports = LMS;
