# API
## Classes

<dl>
<dt><a href="#Duplexer">Duplexer</a></dt>
<dd><p>Create a duplex stream from a readable and a writable stream.cd</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#createObjectsDuplexer">createObjectsDuplexer(optionsOrWritableStream, writableStreamOrReadableStream, maybeReadableStream)</a> ⇒</dt>
<dd><p>A shortcut for <code>new Duplexer({objectMode: true}, writable, readable)</code>.</p>
</dd>
<dt><a href="#createDuplexer">createDuplexer(optionsOrWritableStream, writableStreamOrReadableStream, maybeReadableStream)</a> ⇒</dt>
<dd><p>A functional version of Duplexer.</p>
</dd>
</dl>

<a name="Duplexer"></a>

## Duplexer
Create a duplex stream from a readable and a writable stream.cd

**Kind**: global class  
<a name="new_Duplexer_new"></a>

### new Duplexer(optionsOrWritableStream, writableStreamOrReadableStream, a)
Creates the Duplexer instance

**Returns**: Duplexer  

| Param | Type | Description |
| --- | --- | --- |
| optionsOrWritableStream |  | options or the writable stream |
| writableStreamOrReadableStream |  | writable or readable stream |
| a | <code>maybeReadableStream</code> | readable stream |

<a name="createObjectsDuplexer"></a>

## createObjectsDuplexer(optionsOrWritableStream, writableStreamOrReadableStream, maybeReadableStream) ⇒
A shortcut for `new Duplexer({objectMode: true}, writable, readable)`.

**Kind**: global function  
**Returns**: Duplexer  

| Param |
| --- |
| optionsOrWritableStream | 
| writableStreamOrReadableStream | 
| maybeReadableStream | 

<a name="createDuplexer"></a>

## createDuplexer(optionsOrWritableStream, writableStreamOrReadableStream, maybeReadableStream) ⇒
A functional version of Duplexer.

**Kind**: global function  
**Returns**: Duplexer  

| Param |
| --- |
| optionsOrWritableStream | 
| writableStreamOrReadableStream | 
| maybeReadableStream | 

