var Writable = require('stream').Writable,
    util = require('util');

function MemoryStream(options) {
  Writable.call(this, options);
  this.memory = [];
}

util.inherits(MemoryStream, Writable);

MemoryStream.prototype._write = function _write(chunk, encoding, callback) {
  try {
    this.memory.push(JSON.parse(chunk));
    callback();
  } catch (e) {
    callback(e);
  }
};

module.exports = function (options) { return new MemoryStream(options); };
module.exports.MemoryStream = MemoryStream;
