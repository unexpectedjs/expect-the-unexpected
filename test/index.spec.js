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
});
