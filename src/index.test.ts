import { describe, test, expect } from '@jest/globals';
import { PassThrough } from 'node:stream';
import streamtest from 'streamtest';
import {
  Duplexer,
  createDuplexer,
  createObjectsDuplexer,
} from '../src/index.js';

describe('Duplexer', () => {
  describe('in binary mode', () => {
    describe('and with async streams', () => {
      test('should work with functionnal API', async () => {
        const readable = streamtest.fromChunks([
          Buffer.from('biba'),
          Buffer.from('beloola'),
        ]);
        const writable = new PassThrough();
        const duplex = createDuplexer({}, writable, readable);

        expect(duplex instanceof Duplexer).toBeTruthy();

        // Checking writable content
        const [writableStream, writableResult] = streamtest.toText();
        writable.pipe(writableStream);

        // Checking duplex output
        const [duplexStream, duplexResult] = streamtest.toText();
        duplex.pipe(duplexStream);

        streamtest
          .fromChunks([Buffer.from('oude'), Buffer.from('lali')])
          .pipe(duplex);
        expect(await duplexResult).toEqual('bibabeloola');
        expect(await writableResult).toEqual('oudelali');
      });

      test('should work with POO API', async () => {
        const readable = streamtest.fromChunks([
          Buffer.from('biba'),
          Buffer.from('beloola'),
        ]);
        const writable = new PassThrough();
        const duplex = new Duplexer({}, writable, readable);

        // Checking writable content
        const [writableStream, writableResult] = streamtest.toText();
        writable.pipe(writableStream);

        // Checking duplex output
        const [duplexStream, duplexResult] = streamtest.toText();
        duplex.pipe(duplexStream);

        streamtest
          .fromChunks([Buffer.from('oude'), Buffer.from('lali')])
          .pipe(duplex);

        expect(await writableResult).toEqual('oudelali');
        expect(await duplexResult).toEqual('bibabeloola');
      });

      test('should reemit errors', async () => {
        const readable = new PassThrough();
        const writable = new PassThrough();
        const duplex = new Duplexer(writable, readable);
        let errorsCount = 0;

        // Checking writable content
        const [writableStream, writableResult] = streamtest.toText();
        writable.pipe(writableStream);

        // Checking duplex output
        const [duplexStream, duplexResult] = streamtest.toText();
        duplex.pipe(duplexStream);

        duplex.on('error', () => {
          errorsCount++;
        });

        setImmediate(() => {
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

        expect(await writableResult).toEqual('oudelali');
        expect(await duplexResult).toEqual('bibabeloola');
        expect(errorsCount).toEqual(2);
      });

      test('should not reemit errors when option is set', async () => {
        const readable = new PassThrough();
        const writable = new PassThrough();
        const duplex = new Duplexer(
          { reemitErrors: false },
          writable,
          readable,
        );
        let errorsCount = 0;

        // Checking writable content
        const [writableStream, writableResult] = streamtest.toText();
        writable.pipe(writableStream);

        // Checking duplex output
        const [duplexStream, duplexResult] = streamtest.toText();
        duplex.pipe(duplexStream);

        duplex.on('error', () => {
          errorsCount++;
        });

        // Catch error events
        readable.on('error', () => {});
        writable.on('error', () => {});

        setImmediate(() => {
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

        expect(await writableResult).toEqual('oudelali');
        expect(await duplexResult).toEqual('bibabeloola');
        expect(errorsCount).toEqual(0);
      });
    });

    describe('and with sync streams', () => {
      test('should work with functionnal API', async () => {
        const readable = new PassThrough();
        const writable = new PassThrough();
        const duplex = createDuplexer({}, writable, readable);

        expect(duplex instanceof Duplexer).toBeTruthy();

        // Checking writable content
        const [writableStream, writableResult] = streamtest.toText();
        writable.pipe(writableStream);

        // Checking duplex output
        const [duplexStream, duplexResult] = streamtest.toText();
        duplex.pipe(duplexStream);

        // Writing content to duplex
        duplex.write('oude');
        duplex.write('lali');
        duplex.end();

        // Writing content to readable
        readable.write('biba');
        readable.write('beloola');
        readable.end();

        expect(await writableResult).toEqual('oudelali');
        expect(await duplexResult).toEqual('bibabeloola');
      });

      test('should work with POO API', async () => {
        const readable = new PassThrough();
        const writable = new PassThrough();
        const duplex = new Duplexer(writable, readable);

        // Checking writable content
        const [writableStream, writableResult] = streamtest.toText();
        writable.pipe(writableStream);

        // Checking duplex output
        const [duplexStream, duplexResult] = streamtest.toText();
        duplex.pipe(duplexStream);

        // Writing content to duplex
        duplex.write('oude');
        duplex.write('lali');
        duplex.end();

        // Writing content to readable
        readable.write('biba');
        readable.write('beloola');
        readable.end();

        expect(await writableResult).toEqual('oudelali');
        expect(await duplexResult).toEqual('bibabeloola');
      });

      test('should reemit errors', async () => {
        const readable = new PassThrough();
        const writable = new PassThrough();
        const duplex = new Duplexer(writable, readable);
        let errorsCount = 0;

        // Checking writable content
        const [writableStream, writableResult] = streamtest.toText();
        writable.pipe(writableStream);

        // Checking duplex output
        const [duplexStream, duplexResult] = streamtest.toText();
        duplex.pipe(duplexStream);

        duplex.on('error', () => {
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

        expect(await duplexResult).toEqual('bibabeloola');
        expect(errorsCount).toEqual(2);
        expect(await writableResult).toEqual('oudelali');
      });

      test('should not reemit errors when option is set', async () => {
        const readable = new PassThrough();
        const writable = new PassThrough();
        const duplex = new Duplexer(
          { reemitErrors: false },
          writable,
          readable,
        );
        let errorsCount = 0;

        // Checking writable content
        const [writableStream, writableResult] = streamtest.toText();
        writable.pipe(writableStream);

        // Checking duplex output
        const [duplexStream, duplexResult] = streamtest.toText();
        duplex.pipe(duplexStream);

        duplex.on('error', () => {
          errorsCount++;
        });

        // Catch error events
        readable.on('error', () => {});
        writable.on('error', () => {});

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

        expect(await writableResult).toEqual('oudelali');
        expect(await duplexResult).toEqual('bibabeloola');
        expect(errorsCount).toEqual(0);
      });
    });
  });

  describe('in object mode', () => {
    const obj1 = { cnt: 'oude' };
    const obj2 = { cnt: 'lali' };
    const obj3 = { cnt: 'biba' };
    const obj4 = { cnt: 'beloola' };

    describe('and with async streams', () => {
      test('should work with functionnal API', async () => {
        const readable = streamtest.fromObjects([obj1, obj2]);
        const writable = new PassThrough({ objectMode: true });
        const duplex = createDuplexer({ objectMode: true }, writable, readable);

        expect(duplex instanceof Duplexer).toBeTruthy();

        // Checking writable content
        const [writableStream, writableResult] = streamtest.toObjects();
        writable.pipe(writableStream);

        // Checking duplex output
        const [duplexStream, duplexResult] = streamtest.toObjects();
        duplex.pipe(duplexStream);

        streamtest.fromObjects([obj3, obj4]).pipe(duplex);

        expect(await writableResult).toEqual([obj3, obj4]);
        expect(await duplexResult).toEqual([obj1, obj2]);
      });

      test('should work with functionnal API', async () => {
        const readable = streamtest.fromObjects([obj1, obj2]);
        const writable = new PassThrough({ objectMode: true });
        const duplex = createObjectsDuplexer(writable, readable);

        expect(duplex instanceof Duplexer).toBeTruthy();

        // Checking writable content
        const [writableStream, writableResult] = streamtest.toObjects();
        writable.pipe(writableStream);

        // Checking duplex output
        const [duplexStream, duplexResult] = streamtest.toObjects();
        duplex.pipe(duplexStream);

        streamtest.fromObjects([obj3, obj4]).pipe(duplex);

        expect(await writableResult).toEqual([obj3, obj4]);
        expect(await duplexResult).toEqual([obj1, obj2]);
      });

      test('should work with POO API', async () => {
        const readable = streamtest.fromObjects([obj1, obj2]);
        const writable = new PassThrough({ objectMode: true });
        const duplex = new Duplexer({ objectMode: true }, writable, readable);

        // Checking writable content
        const [writableStream, writableResult] = streamtest.toObjects();
        writable.pipe(writableStream);

        // Checking duplex output
        const [duplexStream, duplexResult] = streamtest.toObjects();
        duplex.pipe(duplexStream);

        streamtest.fromObjects([obj3, obj4]).pipe(duplex);

        expect(await writableResult).toEqual([obj3, obj4]);
        expect(await duplexResult).toEqual([obj1, obj2]);
      });

      test('should reemit errors', async () => {
        const readable = new PassThrough({ objectMode: true });
        const writable = new PassThrough({ objectMode: true });
        const duplex = new Duplexer({ objectMode: true }, writable, readable);
        let errorsCount = 0;

        // Checking writable content
        const [writableStream, writableResult] = streamtest.toObjects();
        writable.pipe(writableStream);

        // Checking duplex output
        const [duplexStream, duplexResult] = streamtest.toObjects();
        duplex.pipe(duplexStream);

        duplex.on('error', () => {
          errorsCount++;
        });

        setImmediate(() => {
          // Writing content to duplex
          duplex.write(obj1);
          writable.emit('error', new Error('hip'));
          duplex.write(obj2);
          duplex.end();

          // Writing content to readable
          readable.write(obj3);
          readable.emit('error', new Error('hip'));
          readable.write(obj4);
          readable.end();
        });

        expect(await writableResult).toEqual([obj1, obj2]);
        expect(await duplexResult).toEqual([obj3, obj4]);
        expect(errorsCount).toEqual(2);
      });

      test('should not reemit errors when option is set', async () => {
        const readable = new PassThrough({ objectMode: true });
        const writable = new PassThrough({ objectMode: true });
        const duplex = createObjectsDuplexer(
          { reemitErrors: false },
          writable,
          readable,
        );
        let errorsCount = 0;

        // Checking writable content
        const [writableStream, writableResult] = streamtest.toObjects();
        writable.pipe(writableStream);

        // Checking duplex output
        const [duplexStream, duplexResult] = streamtest.toObjects();
        duplex.pipe(duplexStream);

        duplex.on('error', () => {
          errorsCount++;
        });

        // Catch error events
        readable.on('error', () => {});
        writable.on('error', () => {});

        setImmediate(() => {
          // Writing content to duplex
          duplex.write(obj1);
          writable.emit('error', new Error('hip'));
          duplex.write(obj2);
          duplex.end();

          // Writing content to readable
          readable.write(obj3);
          readable.emit('error', new Error('hip'));
          readable.write(obj4);
          readable.end();
        });

        expect(await writableResult).toEqual([obj1, obj2]);
        expect(await duplexResult).toEqual([obj3, obj4]);
        expect(errorsCount).toEqual(0);
      });
    });

    describe('and with sync streams', () => {
      test('should work with functionnal API', async () => {
        const readable = new PassThrough({ objectMode: true });
        const writable = new PassThrough({ objectMode: true });
        const duplex = createDuplexer({ objectMode: true }, writable, readable);

        expect(duplex instanceof Duplexer).toBeTruthy();

        // Checking writable content
        const [writableStream, writableResult] = streamtest.toObjects();
        writable.pipe(writableStream);

        // Checking duplex output
        const [duplexStream, duplexResult] = streamtest.toObjects();
        duplex.pipe(duplexStream);

        // Writing content to duplex
        duplex.write(obj1);
        duplex.write(obj2);
        duplex.end();

        // Writing content to readable
        readable.write(obj3);
        readable.write(obj4);
        readable.end();

        expect(await writableResult).toEqual([obj1, obj2]);
        expect(await duplexResult).toEqual([obj3, obj4]);
      });

      test('should work with POO API', async () => {
        const readable = new PassThrough({ objectMode: true });
        const writable = new PassThrough({ objectMode: true });
        const duplex = new Duplexer({ objectMode: true }, writable, readable);

        // Checking writable content
        const [writableStream, writableResult] = streamtest.toObjects();
        writable.pipe(writableStream);

        // Checking duplex output
        const [duplexStream, duplexResult] = streamtest.toObjects();
        duplex.pipe(duplexStream);

        // Writing content to duplex
        duplex.write(obj1);
        duplex.write(obj2);
        duplex.end();

        // Writing content to readable
        readable.write(obj3);
        readable.write(obj4);
        readable.end();

        expect(await writableResult).toEqual([obj1, obj2]);
        expect(await duplexResult).toEqual([obj3, obj4]);
      });

      test('should reemit errors', async () => {
        const readable = new PassThrough({ objectMode: true });
        const writable = new PassThrough({ objectMode: true });
        const duplex = new Duplexer({ objectMode: true }, writable, readable);
        let errorsCount = 0;

        // Checking writable content
        const [writableStream, writableResult] = streamtest.toObjects();
        writable.pipe(writableStream);

        // Checking duplex output
        const [duplexStream, duplexResult] = streamtest.toObjects();
        duplex.pipe(duplexStream);

        duplex.on('error', () => {
          errorsCount++;
        });

        // Writing content to duplex
        duplex.write(obj1);
        writable.emit('error', new Error('hip'));
        duplex.write(obj2);
        duplex.end();

        // Writing content to readable
        readable.write(obj3);
        readable.emit('error', new Error('hip'));
        readable.write(obj4);
        readable.end();

        expect(await writableResult).toEqual([obj1, obj2]);
        expect(await duplexResult).toEqual([obj3, obj4]);
        expect(errorsCount).toEqual(2);
      });

      test('should not reemit errors when option is set', async () => {
        const readable = new PassThrough({ objectMode: true });
        const writable = new PassThrough({ objectMode: true });
        const duplex = new Duplexer(
          {
            objectMode: true,
            reemitErrors: false,
          },
          writable,
          readable,
        );
        let errorsCount = 0;

        // Checking writable content
        const [writableStream, writableResult] = streamtest.toObjects();
        writable.pipe(writableStream);

        // Checking duplex output
        const [duplexStream, duplexResult] = streamtest.toObjects();
        duplex.pipe(duplexStream);

        duplex.on('error', () => {
          errorsCount++;
        });

        // Catch error events
        readable.on('error', () => {});
        writable.on('error', () => {});

        // Writing content to duplex
        duplex.write(obj1);
        writable.emit('error', new Error('hip'));
        duplex.write(obj2);
        duplex.end();

        // Writing content to readable
        readable.write(obj3);
        readable.emit('error', new Error('hip'));
        readable.write(obj4);
        readable.end();

        expect(await writableResult).toEqual([obj1, obj2]);
        expect(await duplexResult).toEqual([obj3, obj4]);
        expect(errorsCount).toEqual(0);
      });
    });
  });
});
