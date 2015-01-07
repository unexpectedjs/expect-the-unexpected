# Expect the Unexpected

This project implements Expect.js's interface using Unexpected. It
means that you can replace expect.js with this module, and most of
your test suite will still run and you can start leveraging
unexpecteds powerful assertions without rewriting your entire test
suite.

There will be some incompatabilities where we feel that expect.js is
doing wrong things or things that the author of unexpected disagreed
with.

This project is meant to make migration towards unexpected as easy as
possible.

## Getting started

Take the following test suite:

```javascript
var expect = require('expect.js');

describe('add', function () {
	it('should return a number', function () {
		var result = add(1,2);
		expect(result).to.be.a('number');
	});
	it('should add to numbers correctly', function () {
		var result = add(2,2);
		expect(result).to.be.a('number').and.to.eql(3);
	});
});
```

Install expect the unexpected by running:
```
$ npm install --save-dev expect-the-unexpected
```

And change the following:

```
- var expect = require('expect.js');
+ var expect = require('expect-the-unexpected');
```

Then when you add a new test, you can use unexpected syntax without
changing your old expect.js tests.

```javascript
var expect = require('expect-the-unexpected');

describe('add', function () {
	it('should return a number', function () {
		var result = add(1,2);
		expect(result).to.be.a('number');
	});
	it('should add to numbers correctly', function () {
		var result = add(2,2);
		expect(result).to.be.a('number').and.to.eql(3);
	});
	it('should return a curried method if only one argument is given', function () {
		var add1 = add(1);
		expect(add1, 'to be a function');
		expect(add1(2), 'to be', 3);
	});
});
```

And then, once you get around to refactor all your old expect.js
assertions, you can just require unexpected instead.

```
- var expect = require('expect-the-unexpected');
+ var expect = require('unexpected');
```

## Incompatabilities

### 1: eql

Expect.js will consider the number 4 and the string '4'
equal. Unexpected does not, and we believe that it is important not to
consider them equal. It's the difference between triple and double =.

Expect these errors to pop up when replacing expect with
expect-the-unexpected.

### 2: property(name) property(name, val)

Expect.js would consider the following to be true:

```javascript
expect('foobar').to.have.property('length');
```

Unexpected does not. The reason is that the length property only exists
in javascript on the boxed string object, or if you create your strings
with `String('foobar')`.

Expect.js would also consider the following to be true:
```javascript
expect({ foo: undefined }).to.have.property('foo');
```

Unexpected does not, as it requires a defined value to acknowledge that
the object has that property.

### 3: keys

Unexpected does not throw an error if you don't provide any keys to check
for, which expect.js does. So this won't throw an error.

```
expect({}).to.have.keys();
expect({}, 'to have keys');
```

## License

This module is published under the ISC license. See the [LICENSE](LICENSE)
file for details.
