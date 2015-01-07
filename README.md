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

## Incompatabilities

### 1: eql

Expect.js will consider the number 4 and the string '4'
equal. Unexpected does not, and we believe that it is important not to
consider them equal. It's the difference between triple and double =.

Expect these errors to pop up when replacing expect with
expect-the-unexpected.

## License

ISC
