var Writable = require('stream').Writable,
    util = require('util');


function writer(value) {
  if (!this.memory) {
    this.memory = [];
  }
  this.memory.push(value);
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
