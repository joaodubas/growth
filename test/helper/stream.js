var stream = require('stream');

function MockReader(options) {
  options = options || {};
  if (!options.encoding) {
    options.encoding = 'utf-8';
  }

  stream.Readable.call(this, options);

  this._source = options.source;
};
MockReader.prototype = Object.create(stream.Readable.prototype, {
  constructor: { value: MockReader }
});
MockReader.prototype._read = function _read(size) {
  this.push(this._source.shift());
};


function MockTransformer(options) {
  options = options || {};
  if (!options.encoding) {
    options.encoding = 'utf-8';
  }
  stream.Transform.call(this, options);
  this._accum = [];
}
MockTransformer.prototype = Object.create(stream.Transform.prototype, {
  constructor: { value: MockTransformer}
});
MockTransformer.prototype._transform = function _transform(chunk, encoding, done) {
  this._accum.push(chunk.toString());
  this.push(chunk);
  done();
};


module.exports = {
  MockReader: MockReader,
  MockTransformer: MockTransformer
};
