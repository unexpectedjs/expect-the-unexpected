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
});
