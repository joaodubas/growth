var Transform = require('stream').Transform,
    util = require('util');


function MemoryStream(options) {
  options = options || {};
  Transform.call(this, options);
  // key contains the absissis variable
  this.key = null;
  // accumulator that will be sent to a writable stream
  this.memory = {
    xcoord: {},
    percentile: []
  };
}

util.inherits(MemoryStream, Transform);

MemoryStream.prototype._write = function _write(chunk, encoding, callback) {
  try {
    this._convert(JSON.parse(chunk));
    callback();
  } catch (e) {
    callback(e);
  }
};
MemoryStream.prototype._convert = function _convert(data) {
  var self = this,
      graph = {};
  if (!this.key) {
    this._getkey(data);
  }
  this.memory.xcoord[data[this.key]] = {
    l: data.l,
    m: data.m,
    s: data.s
  };
  Object.keys(data).filter(function (key) {
      return ['l', 'm', 's', 'stdev'].indexOf(key) < 0;
  }).forEach(function (key) {
    graph[key === self.key ? 'xcoord' : key] = data[key];
  });
  this.memory.percentile.push(graph);
};
MemoryStream.prototype._getkey = function _getkey(data) {
  var values = ['age', 'day', 'month', 'length', 'height'],
      keys = Object.keys(data);
  this.key = keys.reduce(function (accum, curr) {
    if (values.indexOf[curr] >= 0) {
      return curr;
    }
    return accum;
  });
};
MemoryStream.prototype.end = function end(buf) {
  this.push(JSON.stringify(this.memory));
  Transform.prototype.end.call(this, buf);
};

module.exports = function (options) { return new MemoryStream(options); };
module.exports.MemoryStream = MemoryStream;
