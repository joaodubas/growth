var Transform = require('stream').Transform,
    util = require('util');

function LMSStream(options) {
  var defaults = {
      highWaterMark: 32,
      encoding: 'utf-8',
      objectMode: false,
      decodeStrings: true,
      delimiter: '\t',
      newline: '\n',
      quote: '\"',
      empty: '',
      hastitle: true,
      title: null
  };

  options = options || {};
  Object.keys(defaults).forEach(function (key) {
    options[key] = options[key] || defaults[key];
  });

  Transform.call(this, options);

  this.delimiter = options.delimiter;
  this.newline = options.newline;
  this.quote = options.quote;
  this.empty = options.empty;
  this.hastitle = options.hastitle;
  this.title = options.title;

  // state
  this.line = [];
  this.jsonline = {};
  this.quoted = false;
  this.field = '';
  this.linenumber = 0;
}

util.inherits(LMSStream, Transform);


LMSStream.prototype._transform = function _transform(chunk, encoding, done) {
  var chunkstr = chunk.toString();

  try {
    this._parse(chunkstr);
    done();
  } catch (e) {
    done(e);
  }
};
LMSStream.prototype._parse = function _parse(data) {
  var c = null,
      i = 0,
      j = data.length;

  for (i = 0; i < j; i += 1) {
    c = data.charAt(i);

    if (this._hasquote(c, data.charAt(i + 1)) || this._endline(c) || this._endfield(c)) {
      continue;
    }

    this.field += c;
  }
};
LMSStream.prototype._hasquote = function _hasquote(c, cn) {
  if (c === this.quote && cn !== this.quote) {
    this.quoted = !this.quoted;
    return true;
  }
  return false;
};
LMSStream.prototype._endfield = function _endfield(c) {
  if (!this.quoted && c === this.delimiter) {
    if (this.field === '') {
      this.field = this.empty;
    }
    this.line.push(this.field);
    this.field = '';
    return true;
  }
  return false;
};
LMSStream.prototype._endline = function _endline(c) {
  if (!this.quoted && this.newline.indexOf(c) >= 0) {
    this.line.push(this.field);
    this._send();
    this.linenumber += 1;
    this._reset();

    return true;
  }
  return false;
};
LMSStream.prototype._reset = function _reset() {
  // reset
  this.field = '';
  this.line = [];
  this.jsonline = {};
  this.quoted = false;
};
LMSStream.prototype._send = function _send() {
  var send = Boolean((this.hastitle && this.linenumber) || !this.hastitle);
  if (!this.title) {
    this._maketitle();
  }
  if (!send) {
    return false;
  }
  this._tojson();
  this.push(JSON.stringify(this.jsonline));
};
LMSStream.prototype._tojson = function _tojson() {
  var self = this;
  this.title.forEach(function (value, index) {
    self.jsonline[value] = Number(self.line[index]);
  });
};
LMSStream.prototype._maketitle = function _maketitle() {
  if (this.title) {
    return false;
  }
  if (!this.hastitle) {
    this._makedefaulttitle();
    return false;
  }
  this.title = this.line.map(function (value) {
    return value.toLowerCase().replace(' ', '-').replace('\r', '');
  });
};
LMSStream.prototype._makedefaulttitle = function _makedefaulttitle() {
  var len = this.field.length;
  if (!this.title) {
    this.title = [];
  }
  while (this.title.length < len) {
    this.title.push('col-' + this.title.length);
  }
};
LMSStream.prototype.end = function end(buf) {
  Transform.prototype.end.call(this, buf);
};

module.exports = function (options) {
  return new LMSStream(options);
};
module.exports.LMSStream = LMSStream;
