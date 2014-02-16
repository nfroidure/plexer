var Stream = require('stream')
  , util = require('util')
;

// Inherit of Readable stream
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
  if(options instanceof Stream) {
    readableStream = writableStream;
    writableStream = options;
    options = {};
  } else {
    options = options || {};
  }
  options.reemitErrors = 'boolean' === typeof options.reemitErrors
    ? options.reemitErrors : true;

  // Checking arguments
  if(!(writableStream instanceof Stream.Writable
    || writableStream instanceof Stream.Duplex)) {
    throw new Error('The writable stream must be an instanceof Writable or Duplex.');
  }
  if(!(readableStream instanceof Stream.Readable)) {
    throw new Error('The readable stream must be an instanceof Readable.');
  }

  // Parent constructor
  Stream.Duplex.call(this, options);

  // Save streams refs
  this._writable = writableStream;
  this._readable = readableStream;

  if(options.reemitErrors) {
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
    _self.read(0);
  });

  this._readable.once('end', function() {
    _self.push(null);
  });
}

Duplexer.prototype._read = function(n) {
  var _self = this, chunk;
  do {
    chunk = _self._readable.read(n);
    if(null === chunk || !_self.push(chunk)) {
      break;
    }
  } while(null !== chunk);
  return _self.push('');
};

Duplexer.prototype._write = function(chunk, encoding, callback) {
  return this._writable.write(chunk, encoding, callback);
};

module.exports = Duplexer;

