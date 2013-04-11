var Writable = require('stream').Writable,
    util = require('util');


function getkey(value) {
  var values = ['age', 'day', 'month', 'length', 'height'],
      keys = Object.keys(value);
  return keys.reduce(function (accum, curr) {
    if (values.indexOf[curr] >= 0) {
      return curr;
    }
    return accum;
  });
}

function writer(value) {
  var self = this;
  if (!this.memory) {
    this.key = getkey(value);
    this.memory = {xcoord: {}, percentile: {}};
  }
  this.memory.xcoord[value[this.key]] = {
    l: value.l,
    m: value.m,
    s: value.s
  };
  Object.keys(value).forEach(function (key) {
    if (key.charAt(0) !== 'p') {
      return false;
    }
    if (!self.memory.percentile.hasOwnProperty(key)) {
      self.memory.percentile[key] = [];
    }
    self.memory.percentile[key].push(value[key]);
  });
}

function MemoryStream(options) {
  var self = this;
  options = options || {};
  Writable.call(this, options);
  this.writer = options.writer || writer.bind(this);
}

util.inherits(MemoryStream, Writable);

MemoryStream.prototype._write = function _write(chunk, encoding, callback) {
  try {
    this.writer(JSON.parse(chunk));
    callback();
  } catch (e) {
    callback(e);
  }
};

module.exports = function (options) { return new MemoryStream(options); };
module.exports.MemoryStream = MemoryStream;
