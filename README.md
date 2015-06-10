# Expect the Unexpected

This project implements
[Expect.js](https://github.com/Automattic/expect.js)'s interface using
[Unexpected](https://github.com/unexpectedjs/unexpected). It means
that you can replace expect.js with this module, and most of your test
suite will still run and you can start leveraging unexpected's
powerful assertions without rewriting your entire test suite.

There will be some incompatibilities where we feel that expect.js is
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

```diff
-var expect = require('expect.js');
+var expect = require('expect-the-unexpected');
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

```diff
- var expect = require('expect-the-unexpected');
+ var expect = require('unexpected');
```

## Incompatibilities

### 1: eql

Expect.js will consider the number 4 and the string '4'
equal. Unexpected does not, and we believe that it is important not to
consider them equal. It's the difference between triple and double =.

Expect these errors to pop up when replacing expect.js with
expect-the-unexpected.

### 2: property(name) property(name, val)

Expect.js would consider the following to be true:

```javascript
expect('foobar').to.have.property('length');
```

Unexpected does not. The reason is that the `length` property only exists
in javascript on the boxed string object, or if you create your strings
with `new String('foobar')`.

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

### 4: Custom Assertions

Custom assertions are implemented differently in unexpected, so that will
require a little work to fix up. The below example is an expect.js custom
assertion:

```javascript
expect.Assertion.prototype.cssClass = function (expected) {
    var $element = $(this.obj);
    var elementClasses = ($element.attr('class') || '').split(' ');

    this.obj = elementClasses;
    this.contain(expected);

    return this;
};
```

And then the same assertion in expect-the-unexpected

```javascript
expect.addAssertion('cssClass', '[not] to have css class', function (expect, subject, value) {
    var $element = $(subject);
    var elementClasses = ($element.attr('class') || '').split(' ');
    expect(elementClasses, '[not] to contain', value);
});
```

And then again as a pure unexpected custom assertion:

```javascript
expect.addAssertion('[not] to have css class', function (expect, subject, value) {
    var $element = $(subject);
    var elementClasses = ($element.attr('class') || '').split(' ');
    expect(elementClasses, '[not] to contain', value);
});
```

### 5: empty

```javascript
expect({}).to.be.empty();
```

Empty is basicly just an length === 0 assertion in unexpected.
The type system does not allow the length to be checked on other
types than string and object.

```javascript
expect([]).to.be.empty();
expect('').to.be.empty();
```

The above two examples will work without changes.


### 6: not to throw

Unexpected decided to deprecate matching on the error message when
asserting that a function did not throw an exception. We felt that it
was awkward, and that it was unclear what the intention was.

The implementation in unexpected, before it was removed, and the
implementation in expect, would both fail if the function threw an
error which message did not match the asserted value. That feels
backwards, and it can mask other errors that are thrown. You will
write better tests if you avoid this pattern.

```javascript
expect(aFunctionThatThrowsFoo, 'not to throw', 'bar');
```

## License

This module is published under the ISC license. See the [LICENSE](LICENSE)
file for details.
