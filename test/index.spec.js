var unexpected = require('unexpected');
var expect = require('../');

describe('index', () => {
    it('should be a function', () => {
        unexpected(expect, 'to be a function');
    });

    describe('.to.be.below(n)', function() {
        it('should pass', () => {
            expect(2).to.be.below(5);
        });

        it('should fail', () => {
            unexpected(
                () => {
                    expect(5).to.be.below(5);
                },
                'to throw',
                'expected 5 to be below 5'
            );
        });
    });

    describe('.to.be.lessThan(n)', () => {
        it('should pass', () => {
            expect(2).to.be.lessThan(5);
        });

        it('should fail', () => {
            unexpected(
                () => {
                    expect(5).to.be.lessThan(5);
                },
                'to throw',
                'expected 5 to be less than 5'
            );
        });
    });

    describe('.to.throw()', () => {
        it('should pass', () => {
            expect(() => {
                throw new SyntaxError();
            }).to.throw(e => {
                expect(e).to.be.a(SyntaxError);
            });
        });

        it('should fail', () => {
            unexpected(
                () => {
                    expect(() => {
                        throw new Error();
                    }).to.throw(e => {
                        expect(e).to.be.a(SyntaxError);
                    });
                },
                'to throw',
                /[ ]{2}expected Error\(\) to be a SyntaxError$/
            );
        });
    });

    describe('addAssertion()', () => {
        it('should error with an informative message', () => {
            unexpected(
                () => {
                    expect.addAssertion();
                },
                'to throw',
                'addAssertion() has been renamed addCustomAssertion()'
            );
        });
    });

    describe('addCustomAssertion()', () => {
        it('should allow a simple custom assertion', () => {
            expect.addCustomAssertion(
                'foo',
                '<string> to foo',
                (unexpected, subject) => {
                    unexpected(subject, 'to contain', 'foo');
                }
            );

            unexpected(() => {
                expect('foobar').to.foo();
            }, 'not to throw');
        });

        it('should allow a camel case assertion', () => {
            expect.addCustomAssertion(
                'lowerCaseFoo',
                '<string> to lower case foo',
                (unexpected, subject) => {
                    unexpected(subject, 'to contain', 'foo');
                }
            );

            unexpected(() => {
                expect('foobar').to.lowerCaseFoo();
            }, 'not to throw');
        });

        it('should allow an argument consuming nested', () => {
            expect.addCustomAssertion(
                'somethingAtIndex',
                '<array> to have something at index <number>',
                (unexpected, subject, value) => {
                    unexpected(subject[value], 'to be defined');
                }
            );

            unexpected(() => {
                expect([1, 2]).to.have.somethingAtIndex(1);
            }, 'not to throw');
        });
    });
});
