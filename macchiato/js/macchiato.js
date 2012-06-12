// Utility
/**
 * @param {function() : Object} promise
 * @return {Object}
 */var force = function(promise) {
    return promise();
}, is_list = function(object) {
    var i = 0, classes = [ Array, NodeList, HTMLCollection ], l = classes.length;
    for (; i < l; i++) if (object instanceof classes[i]) return !0;
    return !1;
}, is_empty = function(object) {
    var _;
    for (_ in obj) return !1;
    return !0;
}, map = function(callback, elements) {
    var i = 0, result = [], put = function(index) {
        result[index] = callback(elements[index], index);
    };
    if (is_list(elements)) {
        var l = elements.length;
        for (; i < l; i++) put(i);
    } else {
        result = {};
        for (i in elements) elements.hasOwnProperty(i) && put(i);
    }
    return result;
}, each = function(callback, elements) {
    var i = 0, call = function(index) {
        callback(elements[index], index);
    };
    if (is_list(elements)) {
        var l = elements.length;
        for (; i < l; i++) call(i);
    } else for (i in elements) elements.hasOwnProperty(i) && call(i);
}, filter = function(callback, elements) {
    var i = 0, l = elements.length, result = [], x;
    for (; i < l; i++) x = elements[i], callback(x, i) && result.push(x);
    return result;
}, createSingleton = function(object, methods) {
    object.prototype = methods;
}, SupplementMode = {
    MAX: "max",
    MIN: "min"
}, supplement = function(alt, opt_arg, opt_mode) {
    return opt_arg === undefined ? alt : opt_mode === undefined ? opt_arg : Math[opt_mode](alt, opt_arg);
}, Interface = function(name, methods) {
    if (arguments.length != 2) throw new Error("Interface constructor called with " + arguments.length + "arguments, but expected exactly 2.");
    this.name = name, this.methods = [];
    var i = 0, l = methods.length;
    for (; i < l; i++) {
        if (typeof methods[i] != "string") throw new Error("Interface constructor expects method names to be passed in as a string");
        this.methods.push(methods[i]);
    }
};

Interface.ensureImplements = function(object, a_interface) {
    if (arguments.length < 2) throw new Error("Function Interface.ensureImplements called with " + arguments.length + "arguments, but expected at least 2.");
    var i = 1, l = arguments.length, j, m;
    for (; i < l; i++) {
        var _interface = arguments[i];
        if (_interface.constructor !== Interface) throw new Error("Function Interface.ensureImplements expects arguments two and above to be instance of Interface.");
        j = 0, m = _interface.methods.length;
        for (; j < m; j++) {
            var method = _interface.methods[j];
            if (!object[method] || typeof object[method] != "function") throw new Error("Function Interface.ensureImplements: object does not implement the " + _interface.name + " interface. Method " + method + " was not found.");
        }
    }
};

var Result = function(stub) {
    return this.passed = stub.passed, this.reason = stub.reason, this.arguments = stub.arguments, this;
}, forAll = function(generators, property) {
    var testing = function() {
        var args = map(force, generators), success, reason;
        try {
            success = property.apply(property, args), reason = success ? "" : "Falsible: (" + args.join(", ") + ")";
        } catch (exception) {
            success = !1, reason = "Exception occurred: " + exception;
        }
        return new Result({
            passed: success,
            reason: reason,
            arguments: args
        });
    };
    return testing;
}, where = function(conditions, callback) {
    var i = 0, l = conditions.length;
    for (; i < l; i++) if (!conditions[i]) return {
        wasSkipped: !0
    };
    return callback();
}, Score = function() {
    var Score = function() {}, passed = 0, failure = 0, skipped = 0;
    return createSingleton(Score, {
        countUpSkipped: function() {
            skipped++;
        },
        countUpPassed: function() {
            passed++;
        },
        countUpFailure: function() {
            failure++;
        },
        clear: function() {
            passed = 0, skipped = 0, failure = 0;
        },
        get: function() {
            return {
                passed: passed,
                failure: failure,
                skipped: skipped
            };
        },
        evaluate: function() {
            var score = this.get(), isOk = failure === 0, hasSkippedCase = skipped > 0, msg = "";
            return msg = isOk ? "\u2713 OK, passed " + passed : "\u2718 Failed. after " + passed + skipped, msg += " tests.", msg += skipped > 0 ? " \u2662 skipped test" + skipped + " cases" : "", {
                ok: isOk,
                score: score,
                message: msg
            };
        }
    }), new Score;
}(), random = function(x) {
    return Math.round(Math.random() * x);
}, Seed = function() {
    var Seed = function() {}, value = 1, instance;
    return createSingleton(Seed, {
        getRange: function() {
            var mx = Math.pow(2, Math.round(value / 1.5));
            return random(mx);
        },
        linear: function(opt_a, opt_b) {
            var a = supplement(opt_a, 1, SupplementMode.MAX), b = supplement(opt_b, 0), mx = a * value + b;
            return random(mx);
        },
        quadratic: function(opt_a, opt_b, opt_c) {
            var a = supplement(opt_a, 1), b = supplement(opt_b, 0), c = supplement(opt_c, 0), mx = a * value * value + b * value + c;
            return random(mx);
        },
        exponent: function(opt_a, opt_b) {
            var a = supplement(opt_a, 2, SupplementMode.MAX), b = supplement(opt_b, 1), mx = Math.pow(a, Math.round(value * b));
            return random(mx);
        },
        logarithm: function(opt_a, opt_b, opt_c) {
            var a = supplement(opt_a, 1), b = supplement(opt_b, 2, SupplementMode.MAX), c = supplement(opt_c, 0), mx = Math.log(value * a) / Math.log(b) + c;
            return random(mx);
        },
        grow: function() {
            return value++, value;
        },
        clear: function() {
            value = 1;
        }
    }), new Seed;
}(), Combinator = function() {
    var Combinator = function() {}, instance;
    return createSingleton(Combinator, {
        sized: function(generateBySize) {
            var generate = function(opt_n) {
                var n = supplement(opt_n, Seed.exponent(2, 2 / 3));
                return generateBySize(n);
            };
            return generate;
        },
        resize: function(size, generateBySize) {
            var generate = function() {
                return generateBySize(size);
            };
            return generate;
        },
        choose: function(low, high) {
            var generate = function() {
                var l = Math.random() * low, h = Math.random() * high, i = l + h, r = Math.min(high, Math.max(low, i));
                return i;
            };
            return generate;
        },
        elements: function(list) {
            var that = this, generate;
            return generate = function() {
                var index = Math.round(that.choose(0, list.length - 1)()), item = list[index];
                return item;
            }, generate;
        },
        oneOf: function(generators) {
            var generate = this.elements(generators);
            return generate;
        },
        listOf: function(generator) {
            var that = this, generate;
            return generate = that.resize(Seed.linear(2), function(n) {
                var list = that.vectorOf(n, generator)();
                return list;
            }), generate;
        },
        listOf1: function(generator) {
            var that = this, generate;
            return generate = that.resize(Seed.linear(2, 1), function(n) {
                var list = that.vectorOf(n, generator)();
                return list;
            }), generate;
        },
        vectorOf: function(length, generator) {
            var generate = function() {
                var i = 0, list = [];
                for (; i < length; i++) list[i] = generator();
                return list;
            };
            return generate;
        },
        frequency: function(freq) {
            var that = this, generate, sum = 0, i = 0, n = 1, l = freq.length;
            for (; i < l; i++) sum += freq[i][0];
            return i = 0, generate = function() {
                n = that.choose(1, sum)();
                for (; i < l; i++) {
                    if (n < freq[i][0]) return freq[i][1]();
                    n -= freq[i][0];
                }
                return freq[l - 1][1]();
            }, generate;
        }
    }), new Combinator;
}(), GenerateRefference = function() {
    var GenerateRefference = function() {}, method, C = Combinator;
    return charInt = function() {
        var g = C.frequency([ [ 400, C.choose(65, 122) ], [ 300, C.choose(48, 57) ], [ 150, C.choose(31, 47) ], [ 140, C.choose(123, 127) ], [ 7, C.choose(128, 55295) ], [ 2, C.choose(57344, 65533) ], [ 1, C.choose(65536, 1114111) ] ]);
        return Math.round(g());
    }, method = {
        bool: function() {
            var b = C.elements([ !1, !0 ])();
            return b;
        },
        integer: C.sized(function(n) {
            var i = C.choose(-n, n)();
            return Math.round(i);
        }),
        decimal: C.sized(function(_n) {
            var prec = 9999999999999, b = C.choose(0, _n)(), n = C.choose(-b * prec, b * prec)(), d = C.choose(1, prec)();
            return Math.round(n) / Math.round(d);
        }),
        charator: function() {
            var i = charInt(), c = String.fromCharCode(i);
            return c;
        },
        string: function() {
            var cs = C.listOf(charInt)(), str = String.fromCharCode.apply(null, cs);
            return str;
        }
    }, method.number = method.decimal, createSingleton(GenerateRefference, method), new GenerateRefference;
}(), arbitrary = function() {
    var args = Array.prototype.slice.call(arguments, 0, arguments.length);
    return new arbitrary.fn.init(args);
};

arbitrary.fn = arbitrary.prototype = function() {
    var rList = /\[\s+([a-z]+)\s+\]/, selectGenerator = function(t) {
        var test = rList.exec(t);
        return test ? Combinator.elements(GenerateRefference[test[1]]) : GenerateRefference[t];
    };
    return {
        constructor: arbitrary,
        init: function(types) {
            return this.length = types.length, this.types = types, this;
        },
        types: [],
        length: 0,
        size: function() {
            return this.length;
        },
        property: function(property) {
            var generators = [], i = 0, ts = this.types, l = ts.length;
            for (; i < l; i++) try {
                var generator = selectGenerator(ts[i]);
                generators[i] = generator;
            } catch (e) {
                console && console.log && console.log(e);
            }
            return forAll(generators, property);
        }
    };
}(), arbitrary.fn.init.prototype = arbitrary.fn;

var Checker = function() {
    var Checker = function() {}, args = [], passed = !1, skipped = !1, marks = {
        skipped: "\u2662",
        passed: "\u2713",
        faild: "\u2718"
    }, currentLog;
    return createSingleton(Checker, {
        getArgs: function() {
            return args;
        },
        isPassed: function() {
            return passed;
        },
        isSkipped: function() {
            return skipped;
        },
        run: function(test, onVerbose, score) {
            var that = this, result = test();
            args = result.arguments, result.wasSkipped ? skipped = result.wasSkipped : (skipped = !1, passed = result), that.log(onVerbose, score);
        },
        lastResult: function() {
            return currentLog;
        },
        log: function(verbose, score) {
            var kind, shouldView = !1;
            skipped ? (kind = "skipped", score.countUpSkipped()) : passed ? (kind = "passed", score.countUpPassed()) : (kind = "faild", score.countUpFailure(), shouldView = !0), currentLog = marks[kind] + " ( " + map(function(a) {
                return typeof a == "string" ? '"' + a + '"' : a;
            }, args).join(", ") + " )", (verbose || shouldView) && console && console.log && console.log(currentLog);
        }
    }), new Checker;
}(), ViewInterface = new Interface("ViewInterface", [ "getTestCount", "clear", "putMsg", "putLog", "dump", "highlight" ]), View = function() {}, createView = function(stub) {
    var view = new View, name = "";
    for (name in stub) view[name] = stub[name];
    return Interface.ensureImplements(view, ViewInterface), view;
}, consoleView = function() {
    var _log = "";
    return createView({
        getTestCount: function() {
            return 100;
        },
        clear: function() {
            console.clear && console.clear(), _log = "";
        },
        putMsg: function(msg) {
            console.log(msg);
        },
        putLog: function(msg, withEscape) {
            _log += msg + "\n";
        },
        dump: function() {
            _log.length > 0 && console.log(_log);
        },
        highlight: function(isGreen, msg) {
            return msg;
        }
    });
}(), htmlView = function() {
    var _log = "";
    return createView({
        selectors: {
            counter_id: "test-count",
            messenger_id: "test-message",
            logger_id: "test-log"
        },
        setSelectors: function(identifers) {
            var members = this.selectors, name = "";
            for (name in members) {
                if (identifers[name] === undefined) throw new Error("html-test-view need selector id :" + name + ", but undefined");
                this.selectors[name] = identifers[name];
            }
            return this;
        },
        getTestCount: function() {
            return parseInt(document.getElementById(this.selectors.counter_id).value, 10);
        },
        clear: function() {
            var board = document.getElementById(this.selectors.messenger_id), consoleLine = document.getElementById(this.selectors.logger_id);
            _log = "", board.innerHTML = "", consoleLine.innerHTML = "";
        },
        putMsg: function(msg) {
            var board = document.getElementById(this.selectors.messenger_id);
            board.innerHTML += msg;
        },
        putLog: function(log, withEscape) {
            _log += (withEscape ? htmlEscape(log) : log) + "<br>";
        },
        dump: function() {
            var consoleLine = document.getElementById(this.selectors.logger_id);
            consoleLine.innerHTML = _log;
        },
        highlight: function(isGreen, msg) {
            return '<span class="' + (isGreen ? "passed" : "failed") + '">' + msg + "</span>";
        }
    });
}(), Macchiato = function() {
    var Macchiato = function() {}, view = consoleView, suites = [], check = function(label, property) {
        var i = 0, l = view.getTestCount(), allPassed = !0, result;
        for (; i < l; i++) Checker.run(property, verbose, Score), view.verbose && view.putLog(Checker.lastResult(), !0), Seed.grow();
        return result = Score.evaluate(), view.putLog(view.highlight(result.ok, label + " : " + result.message)), allPassed = allPassed && result.ok, Score.clear(), Seed.clear(), allPassed;
    };
    return createSingleton(Macchiato, {
        setVerbose: function(verbose) {
            view.verbose = verbose;
        },
        setView: function(_view) {
            Interface.ensureImplements(_view, ViewInterface), view = _view;
        },
        stock: function(p) {
            suites.push(p);
        },
        taste: function() {
            var passed = !0, i = 0, l = suites.length, label;
            view.clear();
            for (; i < l; i++) for (label in suites[i]) passed = passed && check(label, suites[i][label]);
            view.dump(), view.putMsg(passed ? "Ok, All tests succeeded!!" : "Oops! failed test exist...");
        }
    }), new Macchiato;
}();