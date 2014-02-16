var assert = require('assert')
  , es = require('event-stream')
  , Duplexer = require('../src')
  , Stream = require('stream')
;

// Helpers
function writeToStreamSync(stream, chunks) {
  if(!chunks.length) {
    stream.end();
  } else {
    stream.write(chunks.shift());
    writeToStreamSync(stream, chunks);
  }
  return stream;
}
function writeToStream(stream, chunks) {
  if(!chunks.length) {
    stream.end();
  } else {
    setImmediate(function() {
      stream.write(chunks.shift());
      writeToStream(stream, chunks);
    });
  }
  return stream;
}
function readableStream(chunks) {
  var stream = new Stream.Readable();
  stream._read = function() {
    if(chunks.length) {
      setImmediate(function() {
        stream.push(chunks.shift());
        if(!chunks.length) {
          stream.push(null);
        }
      });
    }
  }
  stream.resume();
  return stream;
}

// Tests
describe('Duplexer', function() {

  describe('in binary mode', function() {

    describe('and with async streams', function() {

      it('should work with functionnal API', function(done) {
        var readable = new Stream.PassThrough()
          , writable = new Stream.PassThrough()
          , duplex = Duplexer({}, writable, readable)
        ;

        // Checking writable content
        writable.pipe(es.wait(function(err, data) {
          assert.equal(data,'oudelali');
        }));

        // Checking duplex output
        duplex.pipe(es.wait(function(err, data) {
          assert.equal(data,'bibabeloola');
          done();
        }));

        setImmediate(function() {
          // Writing content to duplex
          duplex.write('oude');
          duplex.write('lali');
          duplex.end();

          // Writing content to readable
          readable.write('biba');
          readable.write('beloola');
          readable.end();
        });

      });

      it('should work with POO API', function(done) {
        var readable = new Stream.PassThrough()
          , writable = new Stream.PassThrough()
          , duplex = new Duplexer(writable, readable)
        ;

        // Checking writable content
        writable.pipe(es.wait(function(err, data) {
          assert.equal(data,'oudelali');
        }));

        // Checking duplex output
        duplex.pipe(es.wait(function(err, data) {
          assert.equal(data,'bibabeloola');
          done();
        }));

        setImmediate(function() {
          // Writing content to duplex
          duplex.write('oude');
          duplex.write('lali');
          duplex.end();

          // Writing content to readable
          readable.write('biba');
          readable.write('beloola');
          readable.end();
        });

      });

      it('should reemit errors', function(done) {
        var readable = new Stream.PassThrough()
          , writable = new Stream.PassThrough()
          , duplex = new Duplexer(writable, readable)
          , errorsCount = 0
        ;

        // Checking writable content
        writable.pipe(es.wait(function(err, data) {
          assert.equal(data,'oudelali');
        }));

        // Checking duplex output
        duplex.pipe(es.wait(function(err, data) {
          assert.equal(data,'bibabeloola');
          assert.equal(errorsCount, 2);
          done();
        }));

        duplex.on('error', function() {
          errorsCount++;
        });

        setImmediate(function() {
          // Writing content to duplex
          duplex.write('oude');
          writable.emit('error', new Error('hip'));
          duplex.write('lali');
          duplex.end();

          // Writing content to readable
          readable.write('biba');
          readable.emit('error', new Error('hip'));
          readable.write('beloola');
          readable.end();
        });

      });

      it('should not reemit errors when option is set', function(done) {
        var readable = new Stream.PassThrough()
          , writable = new Stream.PassThrough()
          , duplex = new Duplexer({reemitErrors: false}, writable, readable)
        ;

        // Checking writable content
        writable.pipe(es.wait(function(err, data) {
          assert.equal(data,'oudelali');
        }));

        // Checking duplex output
        duplex.pipe(es.wait(function(err, data) {
          assert.equal(data,'bibabeloola');
          done();
        }));

        // Catch error events
        readable.on('error', function(){})
        writable.on('error', function(){})

        setImmediate(function() {
          // Writing content to duplex
          duplex.write('oude');
          writable.emit('error', new Error('hip'));
          duplex.write('lali');
          duplex.end();

          // Writing content to readable
          readable.write('biba');
          readable.emit('error', new Error('hip'));
          readable.write('beloola');
          readable.end();
        });

      });

    });

    describe('and with sync streams', function() {

      it('should work with functionnal API', function(done) {
        var readable = new Stream.PassThrough()
          , writable = new Stream.PassThrough()
          , duplex = Duplexer({}, writable, readable)
        ;

        // Checking writable content
        writable.pipe(es.wait(function(err, data) {
          assert.equal(data,'oudelali');
        }));

        // Checking duplex output
        duplex.pipe(es.wait(function(err, data) {
          assert.equal(data,'bibabeloola');
          done();
        }));

        // Writing content to duplex
        duplex.write('oude');
        duplex.write('lali');
        duplex.end();

        // Writing content to readable
        readable.write('biba');
        readable.write('beloola');
        readable.end();

      });

      it('should work with POO API', function(done) {
        var readable = new Stream.PassThrough()
          , writable = new Stream.PassThrough()
          , duplex = new Duplexer(writable, readable)
        ;

        // Checking writable content
        writable.pipe(es.wait(function(err, data) {
          assert.equal(data,'oudelali');
        }));

        // Checking duplex output
        duplex.pipe(es.wait(function(err, data) {
          assert.equal(data,'bibabeloola');
          done();
        }));

        // Writing content to duplex
        duplex.write('oude');
        duplex.write('lali');
        duplex.end();

        // Writing content to readable
        readable.write('biba');
        readable.write('beloola');
        readable.end();

      });

      it('should reemit errors', function(done) {
        var readable = new Stream.PassThrough()
          , writable = new Stream.PassThrough()
          , duplex = new Duplexer(null, writable, readable)
          , errorsCount = 0
        ;

        // Checking writable content
        writable.pipe(es.wait(function(err, data) {
          assert.equal(data,'oudelali');
        }));

        // Checking duplex output
        duplex.pipe(es.wait(function(err, data) {
          assert.equal(data,'bibabeloola');
          assert.equal(errorsCount, 2);
          done();
        }));

        duplex.on('error', function() {
          errorsCount++;
        });

        // Writing content to duplex
        duplex.write('oude');
        writable.emit('error', new Error('hip'));
        duplex.write('lali');
        duplex.end();

        // Writing content to readable
        readable.write('biba');
        readable.emit('error', new Error('hip'));
        readable.write('beloola');
        readable.end();

      });

      it('should not reemit errors when option is set', function(done) {
        var readable = new Stream.PassThrough()
          , writable = new Stream.PassThrough()
          , duplex = new Duplexer({reemitErrors: false}, writable, readable)
        ;

        // Checking writable content
        writable.pipe(es.wait(function(err, data) {
          assert.equal(data,'oudelali');
        }));

        // Checking duplex output
        duplex.pipe(es.wait(function(err, data) {
          assert.equal(data,'bibabeloola');
          done();
        }));

        // Catch error events
        readable.on('error', function(){})
        writable.on('error', function(){})

        // Writing content to duplex
        duplex.write('oude');
        writable.emit('error', new Error('hip'));
        duplex.write('lali');
        duplex.end();

        // Writing content to readable
        readable.write('biba');
        readable.emit('error', new Error('hip'));
        readable.write('beloola');
        readable.end();

      });

    });

  });

  it('should throw an error with bad writeable stream', function() {
    assert.throws(function() {
      new Duplexer({}, {}, new Stream.PassThrough());
    });
    assert.throws(function() {
      new Duplexer({}, new Stream.Readable(), new Stream.PassThrough());
    });
  });

  it('should throw an error with bad readable stream', function() {
    assert.throws(function() {
      new Duplexer({}, new Stream.PassThrough(), {});
    });
    assert.throws(function() {
      new Duplexer({}, new Stream.PassThrough(), new Stream.Writable());
    });
  });

});
