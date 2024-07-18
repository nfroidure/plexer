import { Duplex, Readable, Writable, Stream } from 'node:stream';
import { YError } from 'yerror';

export type DuplexerOptions = {
  reemitErrors: boolean;
  objectMode: boolean;
};
export type DuplexerWritable = Writable | Duplex;

const DEFAULT_DUPLEXER_OPTIONS = {
  reemitErrors: true,
  objectMode: false,
};

/**
 * Create a duplex stream from a readable and a writable stream.cd
 */
class Duplexer extends Duplex {
  private _options: DuplexerOptions;
  private _writable: DuplexerWritable;
  private _readable: Readable;
  private _waitDatas: boolean = false;
  private _hasDatas: boolean = false;
  constructor(
    options: Partial<DuplexerOptions>,
    writableStream: DuplexerWritable,
    readableStream: Readable,
  );
  constructor(writableStream: DuplexerWritable, readableStream: Readable);
  /**
   * Creates the Duplexer instance
   * @param optionsOrWritableStream options or the writable stream
   * @param writableStreamOrReadableStream writable or readable stream
   * @param {maybeReadableStream} a readable stream
   * @return Duplexer
   */
  constructor(
    optionsOrWritableStream: Partial<DuplexerOptions> | DuplexerWritable,
    writableStreamOrReadableStream: DuplexerWritable | Readable,
    maybeReadableStream?: Readable,
  ) {
    const options =
      optionsOrWritableStream instanceof Stream
        ? DEFAULT_DUPLEXER_OPTIONS
        : {
            ...DEFAULT_DUPLEXER_OPTIONS,
            ...optionsOrWritableStream,
          };
    const writableStream =
      optionsOrWritableStream instanceof Stream
        ? optionsOrWritableStream
        : (writableStreamOrReadableStream as DuplexerWritable);
    const readableStream =
      optionsOrWritableStream instanceof Stream
        ? (writableStreamOrReadableStream as Readable)
        : (maybeReadableStream as Readable);

    if (
      !(writableStream instanceof Writable || writableStream instanceof Duplex)
    ) {
      throw new YError('E_BAD_WRITABLE_STREAM', typeof writableStream);
    }
    if (!(readableStream instanceof Readable)) {
      throw new YError('E_BAD_READABLE_STREAM', typeof readableStream);
    }

    const superOptions: Partial<DuplexerOptions> = { ...options };
    delete superOptions.reemitErrors;

    super(superOptions);

    this._options = options;
    this._writable = writableStream;
    this._readable = readableStream;

    if ('undefined' == typeof this._readable.readableFlowing) {
      this._readable = new Readable({
        objectMode: options.objectMode || false,
      }).wrap(this._readable);
    }

    if (this._options.reemitErrors) {
      this._writable.on('error', (err) => {
        this.emit('error', err);
      });
      this._readable.on('error', (err) => {
        this.emit('error', err);
      });
    }

    this._writable.on('drain', () => {
      this.emit('drain');
    });

    this.once('finish', () => {
      this._writable.end();
    });

    this._writable.once('finish', () => {
      this.end();
    });

    this._readable.on('readable', () => {
      this._hasDatas = true;
      if (this._waitDatas) {
        this._pushAll();
      }
    });

    this._readable.once('end', () => {
      this.push(null);
    });
  }

  _read() {
    this._waitDatas = true;
    if (this._hasDatas) {
      this._pushAll();
    }
  }

  private _pushAll() {
    let chunk;

    do {
      chunk = this._readable.read();
      if (null !== chunk) {
        this._waitDatas = this.push(chunk);
      }
      this._hasDatas = null !== chunk;
    } while (this._waitDatas && this._hasDatas);
  }

  _write(chunk, encoding, callback) {
    return this._writable.write(chunk, encoding, callback);
  }
}

function createObjectsDuplexer(
  options: Partial<Omit<DuplexerOptions, 'objectMode'>>,
  writableStream: DuplexerWritable,
  readableStream: Readable,
): Duplexer;
function createObjectsDuplexer(
  writableStream: DuplexerWritable,
  readableStream: Readable,
): Duplexer;
/**
 * A shortcut for `new Duplexer({objectMode: true}, writable, readable)`.
 * @param optionsOrWritableStream
 * @param writableStreamOrReadableStream
 * @param maybeReadableStream
 * @returns Duplexer
 */
function createObjectsDuplexer(
  optionsOrWritableStream: Partial<DuplexerOptions> | DuplexerWritable,
  writableStreamOrReadableStream: DuplexerWritable | Readable,
  maybeReadableStream?: Readable,
): Duplexer {
  const options =
    optionsOrWritableStream instanceof Stream ? {} : optionsOrWritableStream;
  const writableStream =
    optionsOrWritableStream instanceof Stream
      ? optionsOrWritableStream
      : (writableStreamOrReadableStream as DuplexerWritable);
  const readableStream =
    optionsOrWritableStream instanceof Stream
      ? (writableStreamOrReadableStream as Readable)
      : (maybeReadableStream as Readable);

  return new Duplexer(
    {
      ...options,
      objectMode: true,
    },
    writableStream,
    readableStream,
  );
}

function createDuplexer(
  options: Partial<DuplexerOptions>,
  writableStream: DuplexerWritable,
  readableStream: Readable,
): Duplexer;
function createDuplexer(
  writableStream: DuplexerWritable,
  readableStream: Readable,
): Duplexer;
/**
 * A functional version of Duplexer.
 * @param optionsOrWritableStream
 * @param writableStreamOrReadableStream
 * @param maybeReadableStream
 * @returns Duplexer
 */
function createDuplexer(
  optionsOrWritableStream: Partial<DuplexerOptions> | DuplexerWritable,
  writableStreamOrReadableStream: DuplexerWritable | Readable,
  maybeReadableStream?: Readable,
): Duplexer {
  const options =
    optionsOrWritableStream instanceof Stream ? {} : optionsOrWritableStream;
  const writableStream =
    optionsOrWritableStream instanceof Stream
      ? optionsOrWritableStream
      : (writableStreamOrReadableStream as DuplexerWritable);
  const readableStream =
    optionsOrWritableStream instanceof Stream
      ? (writableStreamOrReadableStream as Readable)
      : (maybeReadableStream as Readable);

  return new Duplexer(options, writableStream, readableStream);
}

export { Duplexer, createDuplexer, createObjectsDuplexer };
