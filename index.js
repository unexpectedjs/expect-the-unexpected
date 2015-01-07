var unexpected = require('unexpected');

function extend(obj) {
    var args = Array.prototype.slice.call(arguments, 1);
    args.forEach(function (source) {
        if (source) {
            for (var prop in source) {
                obj[prop] = source[prop];
            }
        }
    });
    return obj;
}

var flags = {
    not: ['to', 'be', 'have', 'include', 'only'],
    to: ['be', 'have', 'include', 'only', 'not'],
    only: ['have'],
    have: ['own'],
    be: ['an', 'a', 'and']
};

flags.and = flags.to;

var assertions = ['ok', 'within', 'empty', 'above', 'greaterThan'];

function defineNextStep(prop, parent) {
    Object.defineProperty(parent, prop, {
        get: function () {
            var obj = new ExpectFacade(parent.subject, flags[prop]);
            obj.flags = extend({}, parent.flags);
            obj.flags[prop] = true;

            if (typeof ExpectFacade.prototype[prop] === 'function') {
                var fn = function () {
                    ExpectFacade.prototype[prop].apply(obj, arguments);
                    return obj;
                };

                assertions.concat(flags[prop] || []).forEach(function (flag) {
                    defineNextStep(flag, fn);
                });

                fn.flags = obj.flags;
                fn.subject = obj.subject;

                return fn;
            }

            return obj;
        }
    });
}


function ExpectFacade(subject, nextSteps) {
    var that = this;

    this.flags = {};
    this.subject = subject;

    if (!nextSteps) {
        nextSteps = Object.keys(flags);
    }

    if (nextSteps) {
        nextSteps.forEach(function (prop) {
            defineNextStep(prop, that);
        });
    }
}

ExpectFacade.prototype.withArgs = function () {
    var result = new ExpectFacade(this.subject);
    var subject = this.subject;
    result.flags = this.flags;
    var args = arguments;
    result.subject = function () {
        return subject.apply(null, args);
    };
    return result;
};

[
    { name: 'ok', assertion: 'to be ok'},
    { name: 'be', assertion: 'to be'},
    { name: 'equal', assertion: 'to be'},
    { name: 'a', assertion: 'to be a'},
    { name: 'an', assertion: 'to be an'},
    { name: 'eql', assertion: 'to equal'},
    { name: 'match', assertion: 'to match'},
    { name: 'contain', assertion: 'to contain'},
    { name: 'string', assertion: 'to contain'}, // TODO: expect('foobar').to.include.string('foo')
    { name: 'length', assertion: 'to have length'},
    { name: 'empty', assertion: 'to be empty'},
    { name: 'throwError', assertion: 'to throw'},
    { name: 'throwException', assertion: 'to throw exception'},
    { name: 'within', assertion: 'to be within'},
    { name: 'greaterThan', assertion: 'to be greater than'},
    { name: 'above', assertion: 'to be above'},
    { name: 'lessThan', assertion: 'to be less than'},
    { name: 'below', assertion: 'to be below'}
].forEach(function (methodDefinition) {
    ExpectFacade.prototype[methodDefinition.name] = function () {
        var args = Array.prototype.slice.call(arguments);
        if (this.flags.not) {
            unexpected.it.apply(unexpected, ['not ' + methodDefinition.assertion].concat(args))(this.subject);
        } else {
            unexpected.it.apply(unexpected, [methodDefinition.assertion].concat(args))(this.subject);
        }
    };
});

['property', 'properties'].forEach(function (methodName) {
    ExpectFacade.prototype[methodName] = function () {
        var args = Array.prototype.slice.call(arguments);

        var assertion = this.flags.not ? 'not ' : '';
        assertion += 'to have ';
        assertion += this.flags.own ? 'own ' : '';
        assertion += methodName;

        unexpected.it.apply(unexpected, [assertion].concat(args))(this.subject);
    };
});

['key', 'keys'].forEach(function (methodName) {
    ExpectFacade.prototype[methodName] = function () {
        var args = Array.prototype.slice.call(arguments);

        var assertion = this.flags.not ? 'not ' : '';
        assertion += 'to ';
        assertion += this.flags.only ? 'only ' : '';
        assertion += 'have ';
        assertion += methodName;

        unexpected.it.apply(unexpected, [assertion].concat(args))(this.subject);
    };
});

ExpectFacade.prototype.fail = unexpected.fail;

function expect() {
    if (arguments.length > 1) {
        unexpected.apply(null, arguments);
    } else {
        return new ExpectFacade(arguments[0]);
    }
}

expect.fail = unexpected.fail;
expect.outputFormat = unexpected.outputFormat;

expect.version = '0.0.0';

module.exports = expect;

// console.log(expect(42).to.be.an);

expect(42).to.be(42);

expect('foo').to.eql('foo');
expect(42).to.be.a('number');

expect(function (name) {
    if (name === 'Jakob') {
        throw new Error('Goodbye Jakob');
    }

    return 'Hello ' + name;
}).withArgs('Jakob').to.throwException(/Goodbye/);

expect(function (name) {
    if (name === 'Jakob') {
        throw new Error('Goodbye Jakob');
    }

    return 'Hello ' + name;
}).withArgs('Sune').to.not.throwException();

expect(function (name) {
    if (name === 'Jakob') {
        throw new Error('Goodbye Jakob');
    }

    return 'Hello ' + name;
}).withArgs('Jakob').to.not.throwException(/odbe/);
