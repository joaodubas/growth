var Transform = require('stream').Transform,
    util = require('util');

function LMSStream(options, callback) {
    var defaults = {
            highWaterMark: 32,
            encoding: 'utf-8',
            objectMode: false,
            decodeStrings: true,
            delimiter: ';',
            newline: '\n',
            quote: '\"',
            empty: ''
        },
        self = this;

    options = options || {};

    Transform.call(this, options);

    this.cb = null;
    if (arguments.length === 1 && typeof options === 'function') {
        this.cb = options;
        options = {};
    }

    Object.keys(defaults).forEach(function (key) {
        options[key] = options[key] || defaults[key];
    });
    this.delimiter = options.delimiter;
    this.newline = options.newline;
    this.quote = options.quote;
    this.empty = options.empty;

    // state
    this.body = [];
    this.line = [];
    this.quoted = false;
    this.field = '';
    this.linenumber = 0;

    if (this.cb) {
        this.on('error', this.cb);
    }
}

util.inherits(LMSStream, Transform);


LMSStream.prototype._transform = function _transform(chunk, encoding, done) {
    var chunkstr = chunk.toString();

    try {
        this._parse(chunkstr);
        done();
    } catch (err) {
        if (this.cb) {
            cb(err);
        }
        done(err);
    }
};
LMSStream.prototype._parse = function _parse(data) {
    var c = null,
        i = 0,
        j = data.length;

    for (i = 0; i < j; i += 1) {
        c = data.charAt(i);

        if (this._hasquote(c, data.charAt(i + 1)) || this._endline(c) || this._endfield(c)) {
            continue
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
        this.push(JSON.stringify(this.line));

        if (this.cb) {
            this.body.push(this.line);
        }

        this.linenumber += 1;

        // reset
        this.field = '';
        this.line = [];
        this.quoted = false;

        return true;
    }
    return false
};
LMSStream.prototype.end = function end(buf) {
    if (this.cb) {
        this.cb(null, this.body);
    }
    Transform.prototype.end.call(this, buf);
}

module.exports = function (options, callback) { return new LMSStream(options, callback); }
module.exports.LMSStream = LMSStream;