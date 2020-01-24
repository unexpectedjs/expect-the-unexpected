(function(root, factory) {
    if (typeof exports === 'object') {
        module.exports = factory(require('unexpected'));
    } else if (typeof define === 'function' && define.amd) {
        define(['unexpected'], factory);
    } else {
        root.expect = factory(root.weknowhow.expect);
    }
})(this, function(unexpected) {
    function extend(obj) {
        var args = Array.prototype.slice.call(arguments, 1);
        args.forEach(function(source) {
            if (source) {
                for (var prop in source) {
                    obj[prop] = source[prop];
                }
            }
        });
        return obj;
    }

    function expandFlags(pattern, flags) {
        return pattern
            .replace(/\[(!?)([^\]]+)\] ?/g, function(match, negate, flag) {
                return Boolean(flags[flag]) !== Boolean(negate)
                    ? flag + ' '
                    : '';
            })
            .trim();
    }

    var flags = {
        not: ['to', 'be', 'have', 'include', 'only'],
        to: ['be', 'have', 'include', 'only', 'not'],
        only: ['have'],
        have: ['own'],
        be: ['an', 'a']
    };

    var assertions = ['ok', 'within', 'empty', 'above', 'greaterThan'];

    function defineNextStep(prop, parent, stepFlags) {
        stepFlags = stepFlags || flags;

        Object.defineProperty(parent, prop, {
            get: function() {
                var obj = new ExpectFacade(parent.subject, stepFlags[prop]);
                obj.flags = extend({}, parent.flags);
                obj.flags[prop] = true;

                if (typeof ExpectFacade.prototype[prop] === 'function') {
                    var fn = function() {
                        ExpectFacade.prototype[prop].apply(obj, arguments);

                        // allow chaining with .and.
                        defineNextStep('and', obj, { and: flags.to });

                        return obj;
                    };

                    assertions
                        .concat(flags[prop] || [])
                        .forEach(function(flag) {
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

        if (nextSteps) {
            nextSteps.forEach(function(prop) {
                defineNextStep(prop, that);
            });
        }
    }

    ExpectFacade.prototype.withArgs = function() {
        var result = new ExpectFacade(this.subject, Object.keys(flags));
        var subject = this.subject;
        result.flags = this.flags;
        var args = arguments;
        result.subject = function() {
            return subject.apply(null, args);
        };
        return result;
    };

    [
        { name: 'ok', assertion: 'to be ok' },
        { name: 'be', assertion: 'to be' },
        { name: 'equal', assertion: 'to be' },
        { name: 'a', assertion: 'to be a' },
        { name: 'an', assertion: 'to be an' },
        { name: 'eql', assertion: 'to equal' },
        { name: 'match', assertion: 'to match' },
        { name: 'contain', assertion: 'to contain' },
        { name: 'string', assertion: 'to contain' }, // TODO: expect('foobar').to.include.string('foo')
        { name: 'length', assertion: 'to have length' },
        { name: 'empty', assertion: 'to be empty' },
        { name: 'throwError', assertion: 'to throw', useExpectIt: true },
        { name: 'throwException', assertion: 'to throw', useExpectIt: true },
        { name: 'within', assertion: 'to be within' },
        { name: 'greaterThan', assertion: 'to be greater than' },
        { name: 'above', assertion: 'to be above' },
        { name: 'lessThan', assertion: 'to be less than' },
        { name: 'below', assertion: 'to be below' }
    ].forEach(function(methodDefinition) {
        ExpectFacade.prototype[methodDefinition.name] = function() {
            var args = Array.prototype.slice.call(arguments);
            var assertion = expandFlags(
                '[not] ' + methodDefinition.assertion,
                this.flags
            );

            if (
                methodDefinition.useExpectIt &&
                args.length === 1 &&
                typeof args[0] === 'function'
            ) {
                args[0] = unexpected.it(args[0]);
            }

            unexpected.apply(
                unexpected,
                [this.subject, assertion].concat(args)
            );
        };
    });

    ['property', 'properties'].forEach(function(methodName) {
        ExpectFacade.prototype[methodName] = function() {
            var args = Array.prototype.slice.call(arguments);
            var assertion = expandFlags(
                '[not] to have [own] ' + methodName,
                this.flags
            );

            unexpected.apply(
                unexpected,
                [this.subject, assertion].concat(args)
            );
        };
    });

    ['key', 'keys'].forEach(function(methodName) {
        ExpectFacade.prototype[methodName] = function() {
            var args = Array.prototype.slice.call(arguments);
            var assertion = expandFlags(
                '[not] to [only] have ' + methodName,
                this.flags
            );

            unexpected.apply(
                unexpected,
                [this.subject, assertion].concat(args)
            );
        };
    });

    ExpectFacade.prototype.fail = function() {
        var args = Array.prototype.slice.call(arguments);
        return unexpected.fail.apply(unexpected, args);
    };

    function expect() {
        if (arguments.length > 1) {
            unexpected.apply(null, arguments);
        } else {
            return new ExpectFacade(arguments[0], Object.keys(flags));
        }
    }

    expect.fail = function() {
        var args = Array.prototype.slice.call(arguments);
        return unexpected.fail.apply(unexpected, args);
    };
    expect.outputFormat = unexpected.outputFormat;

    expect.addAssertion = function(
        assertionName,
        unexpectedAssertionName,
        customAssertion
    ) {
        unexpected.addAssertion(unexpectedAssertionName, customAssertion);
        ExpectFacade.prototype[assertionName] = function() {
            var args = Array.prototype.slice.call(arguments);
            var assertion = expandFlags(unexpectedAssertionName, this.flags);

            unexpected.apply(
                unexpected,
                [this.subject, assertion].concat(args)
            );
        };
    };

    expect.version = '0.0.0';

    expect.unexpected = unexpected;

    return expect;
});
