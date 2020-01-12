var unexpected = require('unexpected');
var expect = require('../');

describe('index', () => {
    it('should be a function', () => {
        unexpected(expect, 'to be a function');
    });
});
