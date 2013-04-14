var Transform = require('stream').Transform,
    util = require('util');


function MemoryStream(options) {
  options = options || {};
  Transform.call(this, options);
  // key contains the absissis variable
  this.key = options.key;
  // accumulator that will be sent to a writable stream
  this.memory = {
    meta: {
      measure: options.measure,
      by: options.by
    },
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
MemoryStream.prototype.end = function end(buf) {
  this.push(JSON.stringify(this.memory));
  Transform.prototype.end.call(this, buf);
};

module.exports = function (options) { return new MemoryStream(options); };
module.exports.MemoryStream = MemoryStream;
