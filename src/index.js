var isStream = require('isstream');
var Stream = require('readable-stream');
var util = require('util');

// Inherit of Duplex stream
util.inherits(Duplexer, Stream.Duplex);

// Constructor
function Duplexer(options, writableStream, readableStream) {
  var _self = this;

  // Ensure new were used
  if (!(this instanceof Duplexer)) {
    return new (Duplexer.bind.apply(Duplexer,
      [Duplexer].concat([].slice.call(arguments,0))));
  }

  // Mapping args
  if(isStream(options)) {
    readableStream = writableStream;
    writableStream = options;
    options = {};
  } else {
    options = options || {};
  }
  this._reemitErrors = 'boolean' === typeof options.reemitErrors
    ? options.reemitErrors : true;
  delete options.reemitErrors;

  // Checking arguments
  if(!isStream(writableStream, 'Writable', 'Duplex')) {
    throw new Error('The writable stream must be an instanceof Writable or Duplex.');
  }
  if(!isStream(readableStream, 'Readable')) {
    throw new Error('The readable stream must be an instanceof Readable.');
  }

  // Parent constructor
  Stream.Duplex.call(this, options);

  // Save streams refs
  this._writable = writableStream;
  this._readable = readableStream;

  // Internal state
  this._waitDatas = false;
  this._hasDatas = false;

  if('undefined' == typeof this._readable._readableState) {
    this._readable = (new Stream.Readable({
      objectMode: options.objectMode || false
    })).wrap(this._readable);
  }

  if(this._reemitErrors) {
    this._writable.on('error', function(err) {
      _self.emit('error', err);
    });
    this._readable.on('error', function(err) {
      _self.emit('error', err);
    });
  }

  this._writable.on("drain", function() {
    _self.emit("drain");
  });

  this.once('finish', function() {
    _self._writable.end();
  });

  this._writable.once('finish', function() {
    _self.end();
  });

  this._readable.on('readable', function() {
    _self._hasDatas = true;
    if(_self._waitDatas) {
      _self._pushAll();
    }
  });

  this._readable.once('end', function() {
    _self.push(null);
  });
}

Duplexer.prototype._read = function(n) {
  this._waitDatas = true;
  if(this._hasDatas) {
    this._pushAll();
  }
};

Duplexer.prototype._pushAll = function() {
  var _self = this, chunk;
  do {
    chunk = _self._readable.read();
    if(null !== chunk) {
      this._waitDatas = _self.push(chunk);
    }
    this._hasDatas = (null !== chunk);
  } while(this._waitDatas && this._hasDatas);
};

Duplexer.prototype._write = function(chunk, encoding, callback) {
  return this._writable.write(chunk, encoding, callback);
};

Duplexer.obj = function plexerObj(options) {
  var firstArgumentIsAStream = isStream(options);
  var streams = [].slice.call(arguments, firstArgumentIsAStream ? 0 : 1);
  options = firstArgumentIsAStream ? {} : options;
  options.objectMode = true;
  return Duplexer.apply({}.undef, [options].concat(streams));
};

module.exports = Duplexer;
