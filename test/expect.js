var expect = require('../');

expect.outputFormat('text');

/**
 * Module dependencies.
 */

function err (fn, msg) {
  try {
    fn();
    throw new Error('Expected an error');
  } catch (err) {
    // Unexpected starts the error message with a new line. Replaces it here
    // To avoid cluttering up the tests
    expect(msg).to.be(err.message.replace(/^\n/, ''));
  }
}

/**
 * Feature detection for `name` support.
 */

var nameSupported;

(function a () {
  nameSupported = 'a' == a.name;
})();

/**
 * Tests.
 */

describe('expect', function () {

  it('should have .version', function () {
    expect(expect.version).to.match(/^\d+\.\d+\.\d+$/);
  });

  it('should work in its basic form', function () {
    expect('test').to.be.a('string');
  });

  it('should test true', function () {
    expect(true).to.be(true);
    expect(false).to.not.be(true);
    expect(1).to.not.be(true);

    err(function () {
      expect('test').to.be(true);
    }, "expected 'test' to be true") // Used to be: expected 'test' to equal true
  });

  it('should allow not.to', function () {
    expect(true).not.to.be(false);

    err(function () {
      expect(false).not.to.be(false);
    }, "expected false not to be false") // Used to be: expected false to not equal false
  });

  it('should test ok', function () {
    expect(true).to.be.ok();
    expect(false).to.not.be.ok();
    expect(1).to.be.ok();
    expect(0).to.not.be.ok();

    err(function () {
      expect('').to.be.ok();
    }, "expected '' to be ok"); // Used to be: expected '' to be truthy

    err(function () {
      expect('test').to.not.be.ok();
    }, "expected 'test' not to be ok"); // Used to be: expected 'test' to be falsy
  });

  it('should test false', function () {
    expect(false).to.be(false);
    expect(true).to.not.be(false);
    expect(0).to.not.be(false);

    err(function () {
      expect('').to.be(false);
    }, "expected '' to be false") // Used to be: expected '' to equal false
  });

  it('should test functions with arguments', function () {
    function itThrowsSometimes (first, second) {
      if (first ^ second) {
        throw new Error('tell');
      }
    }

    expect(itThrowsSometimes).withArgs(false, false).to.not.throwException();
    expect(itThrowsSometimes).withArgs(false, true).to.throwException(/tell/);
    expect(itThrowsSometimes).withArgs(true, false).to.throwException(/tell/);
    expect(itThrowsSometimes).withArgs(true, true).to.not.throwException();
  });

  it('should test for exceptions', function () {
    function itThrows () {
      a.b.c;
    }

    function itThrowsString () {
      throw 'aaa';
    }

    function itThrowsMessage () {
      throw new Error('tobi');
    }

    var anonItThrows = function () {
      a.b.c;
    }

    function itWorks () {
      return
    }

    var anonItWorks = function () { }

    expect(itThrows).to.throwException();
    expect(itWorks).to.not.throwException();

    var subject;

    expect(itThrows).to.throwException(function (e) {
      subject = e;
    });

    expect(subject).to.be.an(Error);

    expect(itThrowsMessage).to.throwException(/tobi/);
    /* Used to work... Unexpected will throw an exception if you match
     * on the error, while using the not flag.
     *
     * expect(itThrowsMessage).to.not.throwException(/test/);
     */

    // Used to throw: expected 'tobi' to match /no match/
    err(function () {
      expect(itThrowsMessage).to.throwException(/no match/);
    }, [
      'expected',
      'function itThrowsMessage() {',
      '  throw new Error(\'tobi\');',
      '}',
      'to throw exception /no match/',
      '  expected Error(\'tobi\') to satisfy /no match/'
    ].join('\n'));

    var subject2;

    expect(itThrowsString).to.throwException(function (str) {
      subject2 = str;
    });

    expect(subject2).to.be('aaa');

    expect(itThrowsString).to.throwException(/aaa/);
    /* Used to work... Unexpected will throw an exception if you match
     * on the error, while using the not flag.
     *
     * expect(itThrowsString).to.not.throwException(/bbb/);
     */

    // Used to throw: expected 'aaa' to match /no match/i
    err(function () {
      expect(itThrowsString).to.throwException(/no match/i);
    }, [
      'expected',
      'function itThrowsString() {',
      '  throw \'aaa\';',
      '}',
      'to throw exception /no match/i',
      '  expected \'aaa\' to satisfy /no match/i'
    ].join('\n'));

    /* Used to work... Unexpected will throw an exception if you match
     * on the error, while using the not flag.
     *
     * var called = false;
     *
     * expect(itWorks).to.not.throwError(function () {
     *   called = true;
     * });
     *
     * expect(called).to.be(false);
     */

    // Used to throw: expected 5 to be a function
    err(function () {
      expect(5).to.throwException();
    }, [
      'expected 5 to throw exception',
      '  The assertion "to throw exception" is not defined for the type "number",',
      '  but it is defined for the type "function"'
    ].join('\n'));

    // Used to throw: expected fn not to throw an exception
    err(function () {
      expect(anonItThrows).not.to.throwException();
    }, [
      'expected',
      'function () {',
      '  a.b.c;',
      '}',
      'not to throw exception',
      '  threw: ReferenceError(\'a is not defined\')'
    ].join('\n'));

    // Used to throw: expected fn to throw an exception
    err(function () {
      expect(anonItWorks).to.throwException();
    }, 'expected function () { } to throw exception');

    /*
    if (nameSupported) {
      err(function () {
        expect(itWorks).to.throwException();
      }, 'expected itWorks to throw an exception');
    } else {
      err(function () {
        expect(itWorks).to.throwException();
      }, 'expected fn to throw an exception');
    }

    The above out commented code is replaced by the following test
    */
    err(function () {
      expect(itWorks).to.throwException();
    }, [
      'expected',
      'function itWorks() {',
      '  return',
      '}',
      'to throw exception'
    ].join('\n'));

    /*
    if (nameSupported) {
      err(function () {
        expect(itThrows).not.to.throwException();
      }, 'expected itThrows not to throw an exception');
    } else {
      err(function () {
        expect(anonItThrows).not.to.throwException();
      }, 'expected fn not to throw an exception');
    }

    The above out commented code is replaced by the following test
    */
    err(function () {
      expect(itThrows).not.to.throwException();
    }, [
      'expected',
      'function itThrows() {',
      '  a.b.c;',
      '}',
      'not to throw exception',
      '  threw: ReferenceError(\'a is not defined\')'
    ].join('\n'));
  });

  it('should test arrays', function () {
    expect([]).to.be.a('array');
    expect([]).to.be.an('array');

    err(function () {
      expect({}).to.be.an('array');
    }, 'expected {} to be an array');
  });

  it('should test regex', function () {
    expect(/a/).to.be.an('regexp');
    expect(/a/).to.be.a('regexp');

    err(function () {
      expect(null).to.be.a('regexp');
    }, 'expected null to be a regexp');
  });

  it('should test objects', function () {
    expect({}).to.be.an('object');

    err(function () {
      expect(null).to.be.an('object');
    }, 'expected null to be an object');
  });

  it('should test .equal()', function () {
    var foo;
    expect(foo).to.be(undefined);
  });

  it('should test typeof', function () {
    expect('test').to.be.a('string');

    err(function () {
      expect('test').to.not.be.a('string');
    }, "expected 'test' not to be a string");

    expect(5).to.be.a('number');

    err(function () {
      expect(5).to.not.be.a('number');
    }, "expected 5 not to be a number");
  });

  it('should test instanceof', function () {
    function Foo(){}
    expect(new Foo()).to.be.a(Foo);

    /*
    if (nameSupported) {
      err(function () {
        expect(3).to.be.a(Foo);
      }, "expected 3 to be an instance of Foo");
    } else {
      err(function () {
        expect(3).to.be.a(Foo);
      }, "expected 3 to be an instance of supplied constructor");
    }

    The above out commented code is replaced by the below:
    */
    err(function () {
      expect(3).to.be.a(Foo);
    }, 'expected 3 to be a Foo'); // Used to be: expected 3 to be an instance of Foo
  });

  it('should test within(start, finish)', function () {
    expect(5).to.be.within(3,6);
    expect(5).to.be.within(3,5);
    expect(5).to.not.be.within(1,3);

    err(function () {
      expect(5).to.not.be.within(4,6);
    }, "expected 5 not to be within 4..6"); // Used to be: expected 5 to not be within 4..6

    err(function () {
      expect(10).to.be.within(50,100);
    }, "expected 10 to be within 50..100"); // Used to be: expected 10 to be within 50..100
  });

  it('should test above(n)', function () {
    expect(5).to.be.above(2);
    expect(5).to.be.greaterThan(2);
    expect(5).to.not.be.above(5);
    expect(5).to.not.be.above(6);

    err(function () {
      expect(5).to.be.above(6);
    }, "expected 5 to be above 6");

    err(function () {
      expect(10).to.not.be.above(6);
    }, "expected 10 not to be above 6"); // Used to be: expected 10 to be below 6
  });

  it('should test match(regexp)', function () {
    expect('foobar').to.match(/^foo/)
    expect('foobar').to.not.match(/^bar/)

    err(function () {
      expect('foobar').to.match(/^bar/i)
    }, "expected 'foobar' to match /^bar/i");

    err(function () {
      expect('foobar').to.not.match(/^foo/i)
    }, [
      "expected 'foobar' not to match /^foo/i",
      '',
      'foobar'
    ].join('\n')); // Used to be: expected 'foobar' not to match /^foo/i
  });

  it('should test length(n)', function () {
    expect('test').to.have.length(4);
    expect('test').to.not.have.length(3);
    expect([1,2,3]).to.have.length(3);

    err(function () {
      expect(4).to.have.length(3);
    }, [
      'expected 4 to have length 3',
      '  The assertion "to have length" is not defined for the type "number",',
      '  but it is defined for these types: "string", "array-like"'
    ].join('\n')); // Used to be: 'expected 4 to have a property \'length\''

    err(function () {
      expect('asd').to.not.have.length(3);
    }, "expected 'asd' not to have length 3"); // Used to be: expected 'asd' to not have a length of 3
  });

  it('should test eql(val)', function () {
    expect('test').to.eql('test');
    expect({ foo: 'bar' }).to.eql({ foo: 'bar' });
    expect(1).to.eql(1);
    // expect('4').to.eql(4); - INCOMPATABILITY
    expect(/a/gmi).to.eql(/a/mig);

    err(function () {
      expect(4).to.eql(3);
    }, 'expected 4 to equal 3'); // Used to be: expected 4 to sort of equal 3
  });

  it('should test equal(val)', function () {
    expect('test').to.equal('test');
    expect(1).to.equal(1);

    err(function () {
      expect(4).to.equal(3);
    }, 'expected 4 to be 3'); // Used to be: expected 4 to equal 3

    err(function () {
      expect('4').to.equal(4);
    }, "expected '4' to be 4"); // Used to be: expected '4' to equal 4
  });

  it('should test be(val)', function () {
    expect('test').to.be('test');
    expect(1).to.be(1);

    err(function () {
      expect(4).to.be(3);
    }, 'expected 4 to be 3'); // Used to be: expected 4 to equal 3

    err(function () {
      expect('4').to.be(4);
    }, "expected '4' to be 4"); // Used to be: expected '4' to equal 4
  });

  it('should test empty', function () {
    // SEE DOCUMENTATION ON INCOMPATIBILITIES
    // Empty is basicly just an length === 0 assertion in unexpected.
    // The type system does not allow the length to be checked on other
    // types than string and object.
    expect('').to.be.empty();
    //expect({}).to.be.empty(); INCOMPATIBILITY
    expect([]).to.be.empty();
    //expect({ length: 0 }).to.be.empty(); INCOMPATIBILITY

    err(function () {
      expect(null).to.be.empty();
    }, [
      'expected null to be empty',
      '  The assertion "to be empty" is not defined for the type "null",',
      '  but it is defined for these types: "string", "array-like"'
    ].join('\n')); // Used to be: expected null to be an object

    /* INCOMPATIBILITY
    err(function () {
      expect({ a: 'b' }).to.be.empty();
    }, 'expected { a: \'b\' } to be empty');
    */

    /* INCOMPATIBILITY
    err(function () {
      expect({ length: '0' }).to.be.empty();
    }, 'expected { length: \'0\' } to be empty');
    */

    err(function () {
      expect('asd').to.be.empty();
    }, "expected 'asd' to be empty");

    err(function () {
      expect('').to.not.be.empty();
    }, "expected '' not to be empty"); // Used to be: expected '' to not be empty

    /* INCOMPATIBILITY
    err(function () {
      expect({}).to.not.be.empty();
    }, "expected {} not to be empty"); // Used to be: expected {} to not be empty
    */
  });

  it('should test property(name)', function () {
    // SEE DOCUMENTATION ON INCOMPATABILITIES
    //expect('test').to.have.property('length'); INCOMPATABILITY
    //expect(4).to.not.have.property('length'); INCOMPATABILITY
    //expect({ length: undefined }).to.have.property('length'); INCOMPATABILITY

    expect({ name: 'John' }).to.have.property('name');

    err(function () {
      expect('asd').to.have.property('foo');
    }, [
      'expected \'asd\' to have property \'foo\'',
      '  The assertion "to have property" is not defined for the type "string",',
      '  but it is defined for the type "object"'
    ].join('\n')); // Used to be: expected 'asd' to have a property 'foo'

    // The following assertion used to throw an error. It doesn't with Unexpected.
    // err(function () {
      expect({ length: undefined }).to.not.have.property('length');
    // }, "expected { length: undefined } to not have a property 'length'");
  });

  it('should test property(name, val)', function () {
    // SEE DOCUMENTATION ON INCOMPATABILITIES
    // INCOMPATABILITY
    // expect('test').to.have.property('length', 4);
    // INCOMPATABILITY
    // expect({ length: undefined }).to.have.property('length', undefined);

    // INCOMPATABILITY
    //err(function () {
    //  expect('asd').to.have.property('length', 4);
    //}, "expected 'asd' to have a property 'length' of 4, but got 3");

    // INCOMPATABILITY
    //err(function () {
    //  expect('asd').to.not.have.property('length', 3);
    //}, "expected 'asd' to not have a property 'length' of 3");

    // INCOMPATABILITY
    //err(function () {
    //  expect('asd').to.not.have.property('foo', 3);
    //}, "'asd' has no property 'foo'");

    expect({ foo: 'bar' }).to.have.property('foo', 'bar');

    err(function () {
      expect({ length: undefined }).to.not.have.property('length', undefined);
    }, "expected { length: undefined } not to have property 'length', undefined"); // Used to be: expected { length: undefined } to not have a property 'length'
  });

  it('should test own.property(name)', function () {
    // SEE DOCUMENTATION ON INCOMPATABILITIES
    // INCOMPATABILITY
    //expect('test').to.have.own.property('length');
    expect({ foo: 12 }).to.have.own.property('foo');

    err(function () {
      expect({ foo: 12 }).to.not.have.own.property('foo');
    }, "expected { foo: 12 } not to have own property 'foo'"); // Used to be: expected { foo: 12 } to not have own property 'foo'
  });

  it('should test string()', function () {
    expect('foobar').to.contain('bar');
    expect('foobar').to.contain('foo');
    expect('foobar').to.include.string('foo');
    expect('foobar').to.not.contain('baz');
    expect('foobar').to.not.include.string('baz');

    err(function () {
      expect(3).to.contain('baz');
    }, [
      'expected 3 to contain \'baz\'',
      '  The assertion "to contain" is not defined for the type "number",',
      '  but it is defined for these types: "string", "array-like"'
    ].join('\n')); // Used to be: expected 3 to contain 'baz'

    err(function () {
      expect('foobar').to.contain('baz');
    }, "expected 'foobar' to contain 'baz'");

    err(function () {
      expect('foobar').to.not.contain('bar');
    }, [
      "expected 'foobar' not to contain 'bar'",
      '',
      'foobar'
    ].join('\n')); // Used to be: expected 'foobar' to not contain 'bar'
  });

  it('should test contain()', function () {
    expect(['foo', 'bar']).to.contain('foo');
    expect(['foo', 'bar']).to.contain('foo');
    expect(['foo', 'bar']).to.contain('bar');
    expect([1,2]).to.contain(1);
    expect(['foo', 'bar']).to.not.contain('baz');
    expect(['foo', 'bar']).to.not.contain(1);

    err(function () {
      expect(['foo']).to.contain('bar');
    }, "expected [ 'foo' ] to contain 'bar'");

    err(function () {
      expect(['bar', 'foo']).to.not.contain('foo');
    }, [
      "expected [ 'bar', 'foo' ] not to contain 'foo'",
      "",
      "[",
      "  'bar',",
      "  'foo' // should be removed",
      "]"
    ].join('\n')); // Used to be: expected [ 'bar', 'foo' ] to not contain 'foo'
  });

  it('should test keys(array)', function () {
    // SEE DOCUMENTATION ON INCOMPATABILITIES
    expect({ foo: 1 }).to.have.keys(['foo']);
    expect({ foo: 1, bar: 2 }).to.have.keys(['foo', 'bar']);
    expect({ foo: 1, bar: 2 }).to.have.keys('foo', 'bar');
    expect({ foo: 1, bar: 2, baz: 3 }).to.include.keys('foo', 'bar');
    expect({ foo: 1, bar: 2, baz: 3 }).to.include.keys('bar', 'foo');
    expect({ foo: 1, bar: 2, baz: 3 }).to.include.keys('baz');

    expect({ foo: 1, bar: 2 }).to.include.keys('foo');
    expect({ foo: 1, bar: 2 }).to.include.keys('bar', 'foo');
    expect({ foo: 1, bar: 2 }).to.include.keys(['foo']);
    expect({ foo: 1, bar: 2 }).to.include.keys(['bar']);
    expect({ foo: 1, bar: 2 }).to.include.keys(['bar', 'foo']);

    expect({ foo: 1, bar: 2 }).to.not.have.keys('baz');
    expect({ foo: 1, bar: 2 }).to.not.have.keys('foo', 'baz');
    expect({ foo: 1, bar: 2 }).to.not.include.keys('baz');
    expect({ foo: 1, bar: 2 }).to.not.include.keys('foo', 'baz');
    expect({ foo: 1, bar: 2 }).to.not.include.keys('baz', 'foo');

    // INCOMPATABILITY
    //err(function () {
    //  expect({ foo: 1 }).to.have.keys();
    //}, "keys required");

    // INCOMPATABILITY
    //err(function () {
    //  expect({ foo: 1 }).to.have.keys([]);
    //}, "keys required");

    // INCOMPATABILITY
    //err(function () {
    //  expect({ foo: 1 }).to.not.have.keys([]);
    //}, "keys required");

    // INCOMPATABILITY
    //err(function () {
    //  expect({ foo: 1 }).to.include.keys([]);
    //}, "keys required");

    err(function () {
      expect({ foo: 1 }).to.have.keys(['bar']);
    }, "expected { foo: 1 } to have keys [ 'bar' ]");
    // Used to be: expected { foo: 1 } to include key 'bar'

    err(function () {
      expect({ foo: 1 }).to.have.keys(['bar', 'baz']);
    }, "expected { foo: 1 } to have keys [ 'bar', 'baz' ]");
    // Used to be: expected { foo: 1 } to include keys 'bar', and 'baz'

    err(function () {
      expect({ foo: 1 }).to.have.keys(['foo', 'bar', 'baz']);
    }, "expected { foo: 1 } to have keys [ 'foo', 'bar', 'baz' ]");
    // Used to be: expected { foo: 1 } to include keys 'foo', 'bar', and 'baz'

    err(function () {
      expect({ foo: 1 }).to.not.have.keys(['foo']);
    }, "expected { foo: 1 } not to have keys [ 'foo' ]");
    // Used to be: expected { foo: 1 } to not include key 'foo'

    err(function () {
      expect({ foo: 1 }).to.not.have.keys(['foo']);
    }, "expected { foo: 1 } not to have keys [ 'foo' ]");
    // Used to be: expected { foo: 1 } to not include key 'foo'

    err(function () {
      expect({ foo: 1, bar: 2 }).to.not.have.keys(['foo', 'bar']);
    }, "expected { foo: 1, bar: 2 } not to have keys [ 'foo', 'bar' ]");
    // Used to be: expected { foo: 1, bar: 2 } to not include keys 'foo', and 'bar'

    err(function () {
      expect({ foo: 1 }).to.not.include.keys(['foo']);
    }, "expected { foo: 1 } not to have keys [ 'foo' ]");
    // Used to be: expected { foo: 1 } to not include key 'foo'

    err(function () {
      expect({ foo: 1 }).to.include.keys('foo', 'bar');
    }, "expected { foo: 1 } to have keys 'foo', 'bar'");
    // Used to be: expected { foo: 1 } to include keys 'foo', and 'bar'

    // only
    expect({ foo: 1, bar: 1 }).to.only.have.keys('foo', 'bar');
    expect({ foo: 1, bar: 1 }).to.only.have.keys(['foo', 'bar']);

    err(function () {
      expect({ a: 'b', c: 'd' }).to.only.have.keys('a', 'b', 'c');
    }, "expected { a: 'b', c: 'd' } to only have keys 'a', 'b', 'c'");
    // Used to be: expected { a: 'b', c: 'd' } to only have keys 'a', 'b', and 'c'

    err(function () {
      expect({ a: 'b', c: 'd' }).to.only.have.keys('a');
    }, "expected { a: 'b', c: 'd' } to only have keys 'a'");
    // Used to be: expected { a: 'b', c: 'd' } to only have key 'a'
  });

  it('should allow chaining with `and`', function () {
    expect(5).to.be.a('number').and.be(5);
    expect(5).to.be.a('number').and.not.be(6);
    expect(5).to.be.a('number').and.not.be(6).and.not.be('5');

    err(function () {
      expect(5).to.be.a('number').and.not.be(5);
    }, "expected 5 not to be 5"); // Used to be: expected 5 to not equal 5

    err(function () {
      expect(5).to.be.a('number').and.not.be(6).and.not.be.above(4);
    }, "expected 5 not to be above 4"); // Used to be: expected 5 to be below 4
  });

  it('should fail with `fail`', function () {
    err(function () {
        expect().fail();
    }, "Explicit failure"); // Used to be: explicit failure
  });

  it('should fail with `fail` and custom message', function () {
    err(function () {
        expect().fail("explicit failure with message");
    }, "explicit failure with message");
  });

});
