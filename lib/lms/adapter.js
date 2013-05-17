var Transform = require('stream').Transform,
    util = require('util');

if (!Transform) {
    Transform = require('readable-stream').Transform;
}

/**
 * Transform stream that accumulate a series of JSON like structures,
 * containing pertinent information about LMS table.
 *
 * It receives a hash of options containing meta information about the file
 * being converted, and accumulates in the `memory` property.
 *
 * The options hash must contain the keys:
 * * key: absissis variable in the csv
 * * measure: details about the measured variable
 * * by: details about the key variable
 */
function MemoryStream(options) {
  options = options || {};
  Transform.call(this, options);
  // key contains the absissis variable
  this.key = options.key;
  // accumulator that will be sent to a writable stream
  this.memory = {
    meta: {
      measure: options.measure,
      by: options.by,
      limit: {
        min: null,
        max: null
      }
    },
    xcoord: {},
    percentile: []
  };
}

util.inherits(MemoryStream, Transform);

/**
 * Overwrite `_transform` method, this is responsible for call a conversion
 * method in the passed chunk.
 *
 * The passed chunk should be in the format:
 * 
 * ```json
 *   {
 *     "day": 0,
 *     "l": 1,
 *     "m": 49.8842,
 *     "s": '0.03795,
 *     "p01': 44.034,
 *     ...
 *     "p999": 55.734
 *   }
 * ```
 *
 * @param chunk {Buffer|String}: piece of data sent by other stream, treated as
 * a JSON like hash.
 * @param encoding {String}: indicate the chunk encoding, if it's a String
 * @param callback {Function}: called after process the chunk
 */
MemoryStream.prototype._transform = function _transform(chunk, encoding, callback) {
  try {
    this._convert(JSON.parse(chunk));
    callback();
  } catch (e) {
    callback(e);
  }
};
/**
 * Retrieve the pertinent data from the chunk and populate the keys of the
 * `memory` property. To know, these keys are:
 *
 * * `meta`: aggregate information about the measure and appliable limits
 * * `xcoord`: ordenate data into a hash, searchable by the `meta#key` property
 * * `percentile`: use to create growth curves in graphs
 */
MemoryStream.prototype._convert = function _convert(data) {
  var self = this,
      graph = {},
      no_min_value = this.memory.meta.limit.min === null,
      lower_min_value = this.memory.meta.limit.min > data[this.key],
      no_max_value = this.memory.meta.limit.max === null,
      greater_max_value = this.memory.meta.limit.max < data[this.key];
  this.memory.xcoord[data[this.key]] = {
    l: data.l,
    m: data.m,
    s: data.s
  };
  if (no_min_value || lower_min_value) {
    this.memory.meta.limit.min = data[this.key];
  }
  if (no_max_value || greater_max_value) {
    this.memory.meta.limit.max = data[this.key];
  }
  Object.keys(data).filter(function (key) {
      return ['l', 'm', 's', 'stdev'].indexOf(key) < 0;
  }).forEach(function (key) {
    graph[key === self.key ? 'xcoord' : key] = data[key];
  });
  this.memory.percentile.push(graph);
};
/**
 * Overwrite the `end` method, making it forward the accumulated `memory` data
 * to the next stream.
 */
MemoryStream.prototype.end = function end(buf) {
  this.push(JSON.stringify(this.memory));
  Transform.prototype.end.call(this, buf);
};

module.exports = function (options) { return new MemoryStream(options); };
module.exports.MemoryStream = MemoryStream;
