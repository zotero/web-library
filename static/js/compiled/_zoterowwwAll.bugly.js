/*
 * jQuery BBQ: Back Button & Query Library - v1.3pre - 8/26/2010
 * http://benalman.com/projects/jquery-bbq-plugin/
 * 
 * Copyright (c) 2010 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */(function($, r) {
    function G(I) {
        return typeof I === "string";
    }
    function D(J) {
        var I = n.call(arguments, 1);
        return function() {
            return J.apply(this, I.concat(n.call(arguments)));
        };
    }
    function o(I) {
        return I.replace(H, "$2");
    }
    function q(I) {
        return I.replace(/(?:^[^?#]*\?([^#]*).*$)?.*/, "$1");
    }
    function f(K, P, I, L, J) {
        var R, O, N, Q, M;
        if (L !== h) {
            N = I.match(K ? H : /^([^#?]*)\??([^#]*)(#?.*)/);
            M = N[3] || "";
            if (J === 2 && G(L)) {
                O = L.replace(K ? u : p, "");
            } else {
                Q = m(N[2]);
                L = G(L) ? m[K ? F : B](L) : L;
                O = J === 2 ? L : J === 1 ? $.extend({}, L, Q) : $.extend({}, Q, L);
                O = j(O);
                if (K) {
                    O = O.replace(g, t);
                }
            }
            R = N[1] + (K ? C : O || !N[1] ? "?" : "") + O + M;
        } else {
            R = P(I !== h ? I : location.href);
        }
        return R;
    }
    function A(K, I, J) {
        if (I === h || typeof I === "boolean") {
            J = I;
            I = a[K ? F : B]();
        } else {
            I = G(I) ? I.replace(K ? u : p, "") : I;
        }
        return m(I, J);
    }
    function v(L, J, K, I) {
        if (!G(K) && typeof K !== "object") {
            I = K;
            K = J;
            J = h;
        }
        return this.each(function() {
            var O = $(this), M = J || k()[(this.nodeName || "").toLowerCase()] || "", N = M && O.attr(M) || "";
            O.attr(M, a[L](N, K, I));
        });
    }
    var h, n = Array.prototype.slice, t = decodeURIComponent, a = $.param, j, c, m, y, b = $.bbq = $.bbq || {}, s, x, k, e = $.event.special, d = "hashchange", B = "querystring", F = "fragment", z = "elemUrlAttr", l = "href", w = "src", p = /^.*\?|#.*$/g, u, H, g, i, C, E = {};
    a[B] = D(f, 0, q);
    a[F] = c = D(f, 1, o);
    a.sorted = j = function(J, K) {
        var I = [], L = {};
        $.each(a(J, K).split("&"), function(P, M) {
            var O = M.replace(/(?:%5B|=).*$/, ""), N = L[O];
            if (!N) {
                N = L[O] = [];
                I.push(O);
            }
            N.push(M);
        });
        return $.map(I.sort(), function(M) {
            return L[M];
        }).join("&");
    };
    c.noEscape = function(J) {
        J = J || "";
        var I = $.map(J.split(""), encodeURIComponent);
        g = new RegExp(I.join("|"), "g");
    };
    c.noEscape(",/");
    c.ajaxCrawlable = function(I) {
        if (I !== h) {
            if (I) {
                u = /^.*(?:#!|#)/;
                H = /^([^#]*)(?:#!|#)?(.*)$/;
                C = "#!";
            } else {
                u = /^.*#/;
                H = /^([^#]*)#?(.*)$/;
                C = "#";
            }
            i = !!I;
        }
        return i;
    };
    c.ajaxCrawlable(0);
    $.deparam = m = function(L, I) {
        var K = {}, J = {
            "true": !0,
            "false": !1,
            "null": null
        };
        $.each(L.replace(/\+/g, " ").split("&"), function(O, T) {
            var N = T.split("="), S = t(N[0]), M, R = K, P = 0, U = S.split("]["), Q = U.length - 1;
            if (/\[/.test(U[0]) && /\]$/.test(U[Q])) {
                U[Q] = U[Q].replace(/\]$/, "");
                U = U.shift().split("[").concat(U);
                Q = U.length - 1;
            } else {
                Q = 0;
            }
            if (N.length === 2) {
                M = t(N[1]);
                if (I) {
                    M = M && !isNaN(M) ? +M : M === "undefined" ? h : J[M] !== h ? J[M] : M;
                }
                if (Q) {
                    for (; P <= Q; P++) {
                        S = U[P] === "" ? R.length : U[P];
                        R = R[S] = P < Q ? R[S] || (U[P + 1] && isNaN(U[P + 1]) ? {} : []) : M;
                    }
                } else {
                    if ($.isArray(K[S])) {
                        K[S].push(M);
                    } else {
                        if (K[S] !== h) {
                            K[S] = [ K[S], M ];
                        } else {
                            K[S] = M;
                        }
                    }
                }
            } else {
                if (S) {
                    K[S] = I ? h : "";
                }
            }
        });
        return K;
    };
    m[B] = D(A, 0);
    m[F] = y = D(A, 1);
    $[z] || ($[z] = function(I) {
        return $.extend(E, I);
    })({
        a: l,
        base: l,
        iframe: w,
        img: w,
        input: w,
        form: "action",
        link: l,
        script: w
    });
    k = $[z];
    $.fn[B] = D(v, B);
    $.fn[F] = D(v, F);
    b.pushState = s = function(L, I) {
        if (G(L) && /^#/.test(L) && I === h) {
            I = 2;
        }
        var K = L !== h, J = c(location.href, K ? L : {}, K ? I : 2);
        location.href = J;
    };
    b.getState = x = function(I, J) {
        return I === h || typeof I === "boolean" ? y(I) : y(J)[I];
    };
    b.removeState = function(I) {
        var J = {};
        if (I !== h) {
            J = x();
            $.each($.isArray(I) ? I : arguments, function(L, K) {
                delete J[K];
            });
        }
        s(J, 2);
    };
    e[d] = $.extend(e[d], {
        add: function(I) {
            function J(M) {
                var L = M[F] = c();
                M.getState = function(N, O) {
                    return N === h || typeof N === "boolean" ? m(L, N) : m(L, O)[N];
                };
                K.apply(this, arguments);
            }
            var K;
            if ($.isFunction(I)) {
                K = I;
                return J;
            } else {
                K = I.handler;
                I.handler = J;
            }
        }
    });
})(jQuery, this);

!function() {
    var a, b, c, d;
    !function() {
        var e = {}, f = {};
        a = function(a, b, c) {
            e[a] = {
                deps: b,
                callback: c
            };
        }, d = c = b = function(a) {
            function c(b) {
                if ("." !== b.charAt(0)) return b;
                for (var c = b.split("/"), d = a.split("/").slice(0, -1), e = 0, f = c.length; f > e; e++) {
                    var g = c[e];
                    if (".." === g) d.pop(); else {
                        if ("." === g) continue;
                        d.push(g);
                    }
                }
                return d.join("/");
            }
            if (d._eak_seen = e, f[a]) return f[a];
            if (f[a] = {}, !e[a]) throw new Error("Could not find module " + a);
            for (var g, h = e[a], i = h.deps, j = h.callback, k = [], l = 0, m = i.length; m > l; l++) "exports" === i[l] ? k.push(g = {}) : k.push(b(c(i[l])));
            var n = j.apply(this, k);
            return f[a] = g || n;
        };
    }(), a("promise/all", [ "./utils", "exports" ], function(a, b) {
        "use strict";
        function c(a) {
            var b = this;
            if (!d(a)) throw new TypeError("You must pass an array to all.");
            return new b(function(b, c) {
                function d(a) {
                    return function(b) {
                        f(a, b);
                    };
                }
                function f(a, c) {
                    h[a] = c, 0 === --i && b(h);
                }
                var g, h = [], i = a.length;
                0 === i && b([]);
                for (var j = 0; j < a.length; j++) g = a[j], g && e(g.then) ? g.then(d(j), c) : f(j, g);
            });
        }
        var d = a.isArray, e = a.isFunction;
        b.all = c;
    }), a("promise/asap", [ "exports" ], function(a) {
        "use strict";
        function b() {
            return function() {
                process.nextTick(e);
            };
        }
        function c() {
            var a = 0, b = new i(e), c = document.createTextNode("");
            return b.observe(c, {
                characterData: !0
            }), function() {
                c.data = a = ++a % 2;
            };
        }
        function d() {
            return function() {
                j.setTimeout(e, 1);
            };
        }
        function e() {
            for (var a = 0; a < k.length; a++) {
                var b = k[a], c = b[0], d = b[1];
                c(d);
            }
            k = [];
        }
        function f(a, b) {
            var c = k.push([ a, b ]);
            1 === c && g();
        }
        var g, h = "undefined" != typeof window ? window : {}, i = h.MutationObserver || h.WebKitMutationObserver, j = "undefined" != typeof global ? global : this, k = [];
        g = "undefined" != typeof process && "[object process]" === {}.toString.call(process) ? b() : i ? c() : d(), a.asap = f;
    }), a("promise/cast", [ "exports" ], function(a) {
        "use strict";
        function b(a) {
            if (a && "object" == typeof a && a.constructor === this) return a;
            var b = this;
            return new b(function(b) {
                b(a);
            });
        }
        a.cast = b;
    }), a("promise/config", [ "exports" ], function(a) {
        "use strict";
        function b(a, b) {
            return 2 !== arguments.length ? c[a] : (c[a] = b, void 0);
        }
        var c = {
            instrument: !1
        };
        a.config = c, a.configure = b;
    }), a("promise/polyfill", [ "./promise", "./utils", "exports" ], function(a, b, c) {
        "use strict";
        function d() {
            var a = "Promise" in window && "cast" in window.Promise && "resolve" in window.Promise && "reject" in window.Promise && "all" in window.Promise && "race" in window.Promise && function() {
                var a;
                return new window.Promise(function(b) {
                    a = b;
                }), f(a);
            }();
            a || (window.Promise = e);
        }
        var e = a.Promise, f = b.isFunction;
        c.polyfill = d;
    }), a("promise/promise", [ "./config", "./utils", "./cast", "./all", "./race", "./resolve", "./reject", "./asap", "exports" ], function(a, b, c, d, e, f, g, h, i) {
        "use strict";
        function j(a) {
            if (!w(a)) throw new TypeError("You must pass a resolver function as the first argument to the promise constructor");
            if (!(this instanceof j)) throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
            this._subscribers = [], k(a, this);
        }
        function k(a, b) {
            function c(a) {
                p(b, a);
            }
            function d(a) {
                r(b, a);
            }
            try {
                a(c, d);
            } catch (e) {
                d(e);
            }
        }
        function l(a, b, c, d) {
            var e, f, g, h, i = w(c);
            if (i) try {
                e = c(d), g = !0;
            } catch (j) {
                h = !0, f = j;
            } else e = d, g = !0;
            o(b, e) || (i && g ? p(b, e) : h ? r(b, f) : a === F ? p(b, e) : a === G && r(b, e));
        }
        function m(a, b, c, d) {
            var e = a._subscribers, f = e.length;
            e[f] = b, e[f + F] = c, e[f + G] = d;
        }
        function n(a, b) {
            for (var c, d, e = a._subscribers, f = a._detail, g = 0; g < e.length; g += 3) c = e[g], d = e[g + b], l(b, c, d, f);
            a._subscribers = null;
        }
        function o(a, b) {
            var c, d = null;
            try {
                if (a === b) throw new TypeError("A promises callback cannot return that same promise.");
                if (v(b) && (d = b.then, w(d))) return d.call(b, function(d) {
                    return c ? !0 : (c = !0, b !== d ? p(a, d) : q(a, d), void 0);
                }, function(b) {
                    return c ? !0 : (c = !0, r(a, b), void 0);
                }), !0;
            } catch (e) {
                return c ? !0 : (r(a, e), !0);
            }
            return !1;
        }
        function p(a, b) {
            a === b ? q(a, b) : o(a, b) || q(a, b);
        }
        function q(a, b) {
            a._state === D && (a._state = E, a._detail = b, u.async(s, a));
        }
        function r(a, b) {
            a._state === D && (a._state = E, a._detail = b, u.async(t, a));
        }
        function s(a) {
            n(a, a._state = F);
        }
        function t(a) {
            n(a, a._state = G);
        }
        var u = a.config, v = (a.configure, b.objectOrFunction), w = b.isFunction, x = (b.now, c.cast), y = d.all, z = e.race, A = f.resolve, B = g.reject, C = h.asap;
        u.async = C;
        var D = void 0, E = 0, F = 1, G = 2;
        j.prototype = {
            constructor: j,
            _state: void 0,
            _detail: void 0,
            _subscribers: void 0,
            then: function(a, b) {
                var c = this, d = new this.constructor(function() {});
                if (this._state) {
                    var e = arguments;
                    u.async(function() {
                        l(c._state, d, e[c._state - 1], c._detail);
                    });
                } else m(this, d, a, b);
                return d;
            },
            "catch": function(a) {
                return this.then(null, a);
            }
        }, j.all = y, j.cast = x, j.race = z, j.resolve = A, j.reject = B, i.Promise = j;
    }), a("promise/race", [ "./utils", "exports" ], function(a, b) {
        "use strict";
        function c(a) {
            var b = this;
            if (!d(a)) throw new TypeError("You must pass an array to race.");
            return new b(function(b, c) {
                for (var d, e = 0; e < a.length; e++) d = a[e], d && "function" == typeof d.then ? d.then(b, c) : b(d);
            });
        }
        var d = a.isArray;
        b.race = c;
    }), a("promise/reject", [ "exports" ], function(a) {
        "use strict";
        function b(a) {
            var b = this;
            return new b(function(b, c) {
                c(a);
            });
        }
        a.reject = b;
    }), a("promise/resolve", [ "exports" ], function(a) {
        "use strict";
        function b(a) {
            var b = this;
            return new b(function(b) {
                b(a);
            });
        }
        a.resolve = b;
    }), a("promise/utils", [ "exports" ], function(a) {
        "use strict";
        function b(a) {
            return c(a) || "object" == typeof a && null !== a;
        }
        function c(a) {
            return "function" == typeof a;
        }
        function d(a) {
            return "[object Array]" === Object.prototype.toString.call(a);
        }
        var e = Date.now || function() {
            return (new Date).getTime();
        };
        a.objectOrFunction = b, a.isFunction = c, a.isArray = d, a.now = e;
    }), b("promise/polyfill").polyfill();
}();

var SparkMD5 = function() {
    function h(f, d, b, a, c, e) {
        d = k(k(d, f), k(a, e));
        return k(d << c | d >>> 32 - c, b);
    }
    function g(f, d, b, a, c, e, g) {
        return h(d & b | ~d & a, f, d, c, e, g);
    }
    function i(f, d, b, a, c, e, g) {
        return h(d & a | b & ~a, f, d, c, e, g);
    }
    function j(f, d, b, a, c, e, g) {
        return h(b ^ (d | ~a), f, d, c, e, g);
    }
    function l(f, d) {
        var b = f[0], a = f[1], c = f[2], e = f[3], b = g(b, a, c, e, d[0], 7, -680876936), e = g(e, b, a, c, d[1], 12, -389564586), c = g(c, e, b, a, d[2], 17, 606105819), a = g(a, c, e, b, d[3], 22, -1044525330), b = g(b, a, c, e, d[4], 7, -176418897), e = g(e, b, a, c, d[5], 12, 1200080426), c = g(c, e, b, a, d[6], 17, -1473231341), a = g(a, c, e, b, d[7], 22, -45705983), b = g(b, a, c, e, d[8], 7, 1770035416), e = g(e, b, a, c, d[9], 12, -1958414417), c = g(c, e, b, a, d[10], 17, -42063), a = g(a, c, e, b, d[11], 22, -1990404162), b = g(b, a, c, e, d[12], 7, 1804603682), e = g(e, b, a, c, d[13], 12, -40341101), c = g(c, e, b, a, d[14], 17, -1502002290), a = g(a, c, e, b, d[15], 22, 1236535329), b = i(b, a, c, e, d[1], 5, -165796510), e = i(e, b, a, c, d[6], 9, -1069501632), c = i(c, e, b, a, d[11], 14, 643717713), a = i(a, c, e, b, d[0], 20, -373897302), b = i(b, a, c, e, d[5], 5, -701558691), e = i(e, b, a, c, d[10], 9, 38016083), c = i(c, e, b, a, d[15], 14, -660478335), a = i(a, c, e, b, d[4], 20, -405537848), b = i(b, a, c, e, d[9], 5, 568446438), e = i(e, b, a, c, d[14], 9, -1019803690), c = i(c, e, b, a, d[3], 14, -187363961), a = i(a, c, e, b, d[8], 20, 1163531501), b = i(b, a, c, e, d[13], 5, -1444681467), e = i(e, b, a, c, d[2], 9, -51403784), c = i(c, e, b, a, d[7], 14, 1735328473), a = i(a, c, e, b, d[12], 20, -1926607734), b = h(a ^ c ^ e, b, a, d[5], 4, -378558), e = h(b ^ a ^ c, e, b, d[8], 11, -2022574463), c = h(e ^ b ^ a, c, e, d[11], 16, 1839030562), a = h(c ^ e ^ b, a, c, d[14], 23, -35309556), b = h(a ^ c ^ e, b, a, d[1], 4, -1530992060), e = h(b ^ a ^ c, e, b, d[4], 11, 1272893353), c = h(e ^ b ^ a, c, e, d[7], 16, -155497632), a = h(c ^ e ^ b, a, c, d[10], 23, -1094730640), b = h(a ^ c ^ e, b, a, d[13], 4, 681279174), e = h(b ^ a ^ c, e, b, d[0], 11, -358537222), c = h(e ^ b ^ a, c, e, d[3], 16, -722521979), a = h(c ^ e ^ b, a, c, d[6], 23, 76029189), b = h(a ^ c ^ e, b, a, d[9], 4, -640364487), e = h(b ^ a ^ c, e, b, d[12], 11, -421815835), c = h(e ^ b ^ a, c, e, d[15], 16, 530742520), a = h(c ^ e ^ b, a, c, d[2], 23, -995338651), b = j(b, a, c, e, d[0], 6, -198630844), e = j(e, b, a, c, d[7], 10, 1126891415), c = j(c, e, b, a, d[14], 15, -1416354905), a = j(a, c, e, b, d[5], 21, -57434055), b = j(b, a, c, e, d[12], 6, 1700485571), e = j(e, b, a, c, d[3], 10, -1894986606), c = j(c, e, b, a, d[10], 15, -1051523), a = j(a, c, e, b, d[1], 21, -2054922799), b = j(b, a, c, e, d[8], 6, 1873313359), e = j(e, b, a, c, d[15], 10, -30611744), c = j(c, e, b, a, d[6], 15, -1560198380), a = j(a, c, e, b, d[13], 21, 1309151649), b = j(b, a, c, e, d[4], 6, -145523070), e = j(e, b, a, c, d[11], 10, -1120210379), c = j(c, e, b, a, d[2], 15, 718787259), a = j(a, c, e, b, d[9], 21, -343485551);
        f[0] = k(b, f[0]);
        f[1] = k(a, f[1]);
        f[2] = k(c, f[2]);
        f[3] = k(e, f[3]);
    }
    function n(f) {
        var d = [], b;
        for (b = 0; 64 > b; b += 4) d[b >> 2] = f.charCodeAt(b) + (f.charCodeAt(b + 1) << 8) + (f.charCodeAt(b + 2) << 16) + (f.charCodeAt(b + 3) << 24);
        return d;
    }
    function o(f) {
        var d = f.length, b = [ 1732584193, -271733879, -1732584194, 271733878 ], a, c, e;
        for (a = 64; a <= d; a += 64) l(b, n(f.substring(a - 64, a)));
        f = f.substring(a - 64);
        c = f.length;
        e = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
        for (a = 0; a < c; a += 1) e[a >> 2] |= f.charCodeAt(a) << (a % 4 << 3);
        e[a >> 2] |= 128 << (a % 4 << 3);
        if (55 < a) {
            l(b, e);
            for (a = 0; 16 > a; a += 1) e[a] = 0;
        }
        e[14] = 8 * d;
        l(b, e);
        return b;
    }
    function m(f) {
        var d;
        for (d = 0; d < f.length; d += 1) {
            for (var b = f, a = d, c = f[d], e = "", g = void 0, g = 0; 4 > g; g += 1) e += q[c >> 8 * g + 4 & 15] + q[c >> 8 * g & 15];
            b[a] = e;
        }
        return f.join("");
    }
    var k = function(f, d) {
        return f + d & 4294967295;
    }, q = "0,1,2,3,4,5,6,7,8,9,a,b,c,d,e,f".split(",");
    "5d41402abc4b2a76b9719d911017c592" !== m(o("hello")) && (k = function(f, d) {
        var b = (f & 65535) + (d & 65535);
        return (f >> 16) + (d >> 16) + (b >> 16) << 16 | b & 65535;
    });
    var p = function() {
        this.append = function(f) {
            /[\u0080-\uFFFF]/.test(f) && (f = unescape(encodeURIComponent(f)));
            this.appendBinary(f);
            return this;
        };
        this.appendBinary = function(f) {
            var d = 64 - this._buff.length, b = this._buff + f.substr(0, d), a;
            this._length += f.length;
            if (64 <= b.length) {
                l(this._state, n(b));
                for (a = f.length - 64; d <= a; ) b = f.substr(d, 64), l(this._state, n(b)), d += 64;
                this._buff = f.substr(d, 64);
            } else this._buff = b;
            return this;
        };
        this.end = function(f) {
            var d = this._buff, b = d.length, a = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ], c;
            for (c = 0; c < b; c += 1) a[c >> 2] |= d.charCodeAt(c) << (c % 4 << 3);
            a[c >> 2] |= 128 << (c % 4 << 3);
            if (55 < c) {
                l(this._state, a);
                for (c = 0; 16 > c; c += 1) a[c] = 0;
            }
            a[14] = 8 * this._length;
            l(this._state, a);
            f = f ? this._state : m(this._state);
            this.reset();
            return f;
        };
        this.reset = function() {
            this._buff = "";
            this._length = 0;
            this._state = [ 1732584193, -271733879, -1732584194, 271733878 ];
            return this;
        };
        this.destroy = function() {
            delete this._state;
            delete this._buff;
            delete this._length;
        };
        this.reset();
    };
    p.hash = function(f, d) {
        /[\u0080-\uFFFF]/.test(f) && (f = unescape(encodeURIComponent(f)));
        var b = o(f);
        return d ? b : m(b);
    };
    p.hashBinary = function(f, d) {
        var b = o(f);
        return d ? b : m(b);
    };
    return p;
}();

"use strict";

var idbModules = {};

(function(e) {
    function t(e, t, n, o) {
        n.target = t, "function" == typeof t[e] && t[e].apply(t, [ n ]), "function" == typeof o && o();
    }
    function n(t, n, o) {
        var i = new DOMException.constructor(0, n);
        throw i.name = t, i.message = n, e.DEBUG && (console.log(t, n, o, i), console.trace && console.trace()), i;
    }
    var o = function() {
        this.length = 0, this._items = [], Object.defineProperty && Object.defineProperty(this, "_items", {
            enumerable: !1
        });
    };
    if (o.prototype = {
        contains: function(e) {
            return -1 !== this._items.indexOf(e);
        },
        item: function(e) {
            return this._items[e];
        },
        indexOf: function(e) {
            return this._items.indexOf(e);
        },
        push: function(e) {
            this._items.push(e), this.length += 1;
            for (var t = 0; this._items.length > t; t++) this[t] = this._items[t];
        },
        splice: function() {
            this._items.splice.apply(this._items, arguments), this.length = this._items.length;
            for (var e in this) e === parseInt(e, 10) + "" && delete this[e];
            for (e = 0; this._items.length > e; e++) this[e] = this._items[e];
        }
    }, Object.defineProperty) for (var i in {
        indexOf: !1,
        push: !1,
        splice: !1
    }) Object.defineProperty(o.prototype, i, {
        enumerable: !1
    });
    e.util = {
        throwDOMException: n,
        callback: t,
        quote: function(e) {
            return "'" + e + "'";
        },
        StringList: o
    };
})(idbModules), function(idbModules) {
    var Sca = function() {
        return {
            decycle: function(object, callback) {
                function checkForCompletion() {
                    0 === queuedObjects.length && returnCallback(derezObj);
                }
                function readBlobAsDataURL(e, t) {
                    var n = new FileReader;
                    n.onloadend = function(e) {
                        var n = e.target.result, o = "blob";
                        updateEncodedBlob(n, t, o);
                    }, n.readAsDataURL(e);
                }
                function updateEncodedBlob(dataURL, path, blobtype) {
                    var encoded = queuedObjects.indexOf(path);
                    path = path.replace("$", "derezObj"), eval(path + '.$enc="' + dataURL + '"'), eval(path + '.$type="' + blobtype + '"'), queuedObjects.splice(encoded, 1), checkForCompletion();
                }
                function derez(e, t) {
                    var n, o, i;
                    if (!("object" != typeof e || null === e || e instanceof Boolean || e instanceof Date || e instanceof Number || e instanceof RegExp || e instanceof Blob || e instanceof String)) {
                        for (n = 0; objects.length > n; n += 1) if (objects[n] === e) return {
                            $ref: paths[n]
                        };
                        if (objects.push(e), paths.push(t), "[object Array]" === Object.prototype.toString.apply(e)) for (i = [], n = 0; e.length > n; n += 1) i[n] = derez(e[n], t + "[" + n + "]"); else {
                            i = {};
                            for (o in e) Object.prototype.hasOwnProperty.call(e, o) && (i[o] = derez(e[o], t + "[" + JSON.stringify(o) + "]"));
                        }
                        return i;
                    }
                    return e instanceof Blob ? (queuedObjects.push(t), readBlobAsDataURL(e, t)) : e instanceof Boolean ? e = {
                        $type: "bool",
                        $enc: "" + e
                    } : e instanceof Date ? e = {
                        $type: "date",
                        $enc: e.getTime()
                    } : e instanceof Number ? e = {
                        $type: "num",
                        $enc: "" + e
                    } : e instanceof RegExp && (e = {
                        $type: "regex",
                        $enc: "" + e
                    }), e;
                }
                var objects = [], paths = [], queuedObjects = [], returnCallback = callback, derezObj = derez(object, "$");
                checkForCompletion();
            },
            retrocycle: function retrocycle($) {
                function dataURLToBlob(e) {
                    var t, n, o, i = ";base64,";
                    if (-1 === e.indexOf(i)) return n = e.split(","), t = n[0].split(":")[1], o = n[1], new Blob([ o ], {
                        type: t
                    });
                    n = e.split(i), t = n[0].split(":")[1], o = window.atob(n[1]);
                    for (var r = o.length, a = new Uint8Array(r), s = 0; r > s; ++s) a[s] = o.charCodeAt(s);
                    return new Blob([ a.buffer ], {
                        type: t
                    });
                }
                function rez(value) {
                    var i, item, name, path;
                    if (value && "object" == typeof value) if ("[object Array]" === Object.prototype.toString.apply(value)) for (i = 0; value.length > i; i += 1) item = value[i], item && "object" == typeof item && (path = item.$ref, value[i] = "string" == typeof path && px.test(path) ? eval(path) : rez(item)); else if (void 0 !== value.$type) switch (value.$type) {
                      case "blob":
                      case "file":
                        value = dataURLToBlob(value.$enc);
                        break;
                      case "bool":
                        value = Boolean("true" === value.$enc);
                        break;
                      case "date":
                        value = new Date(value.$enc);
                        break;
                      case "num":
                        value = Number(value.$enc);
                        break;
                      case "regex":
                        value = eval(value.$enc);
                    } else for (name in value) "object" == typeof value[name] && (item = value[name], item && (path = item.$ref, value[name] = "string" == typeof path && px.test(path) ? eval(path) : rez(item)));
                    return value;
                }
                var px = /^\$(?:\[(?:\d+|\"(?:[^\\\"\u0000-\u001f]|\\([\\\"\/bfnrt]|u[0-9a-zA-Z]{4}))*\")\])*$/;
                return rez($), $;
            },
            encode: function(e, t) {
                function n(e) {
                    t(JSON.stringify(e));
                }
                this.decycle(e, n);
            },
            decode: function(e) {
                return this.retrocycle(JSON.parse(e));
            }
        };
    }();
    idbModules.Sca = Sca;
}(idbModules), function(e) {
    var t = [ "", "number", "string", "boolean", "object", "undefined" ], n = function() {
        return {
            encode: function(e) {
                return t.indexOf(typeof e) + "-" + JSON.stringify(e);
            },
            decode: function(e) {
                return e === void 0 ? void 0 : JSON.parse(e.substring(2));
            }
        };
    }, o = {
        number: n("number"),
        "boolean": n(),
        object: n(),
        string: {
            encode: function(e) {
                return t.indexOf("string") + "-" + e;
            },
            decode: function(e) {
                return "" + e.substring(2);
            }
        },
        "undefined": {
            encode: function() {
                return t.indexOf("undefined") + "-undefined";
            },
            decode: function() {
                return void 0;
            }
        }
    }, i = function() {
        return {
            encode: function(e) {
                return o[typeof e].encode(e);
            },
            decode: function(e) {
                return o[t[e.substring(0, 1)]].decode(e);
            }
        };
    }();
    e.Key = i;
}(idbModules), function(e) {
    var t = function(e, t) {
        return {
            type: e,
            debug: t,
            bubbles: !1,
            cancelable: !1,
            eventPhase: 0,
            timeStamp: new Date
        };
    };
    e.Event = t;
}(idbModules), function(e) {
    var t = function() {
        this.onsuccess = this.onerror = this.result = this.error = this.source = this.transaction = null, this.readyState = "pending";
    }, n = function() {
        this.onblocked = this.onupgradeneeded = null;
    };
    n.prototype = t, e.IDBRequest = t, e.IDBOpenRequest = n;
}(idbModules), function(e, t) {
    var n = function(e, t, n, o) {
        this.lower = e, this.upper = t, this.lowerOpen = n, this.upperOpen = o;
    };
    n.only = function(e) {
        return new n(e, e, !0, !0);
    }, n.lowerBound = function(e, o) {
        return new n(e, t, o, t);
    }, n.upperBound = function(e) {
        return new n(t, e, t, open);
    }, n.bound = function(e, t, o, i) {
        return new n(e, t, o, i);
    }, e.IDBKeyRange = n;
}(idbModules), function(e, t) {
    function n(n, o, i, r, a, s) {
        this.__range = n, this.source = this.__idbObjectStore = i, this.__req = r, this.key = t, this.direction = o, this.__keyColumnName = a, this.__valueColumnName = s, this.source.transaction.__active || e.util.throwDOMException("TransactionInactiveError - The transaction this IDBObjectStore belongs to is not active."), this.__offset = -1, this.__lastKeyContinued = t, this["continue"]();
    }
    n.prototype.__find = function(n, o, i, r) {
        var a = this, s = [ "SELECT * FROM ", e.util.quote(a.__idbObjectStore.name) ], u = [];
        s.push("WHERE ", a.__keyColumnName, " NOT NULL"), a.__range && (a.__range.lower || a.__range.upper) && (s.push("AND"), a.__range.lower && (s.push(a.__keyColumnName + (a.__range.lowerOpen ? " >" : " >= ") + " ?"), u.push(e.Key.encode(a.__range.lower))), a.__range.lower && a.__range.upper && s.push("AND"), a.__range.upper && (s.push(a.__keyColumnName + (a.__range.upperOpen ? " < " : " <= ") + " ?"), u.push(e.Key.encode(a.__range.upper)))), n !== t && (a.__lastKeyContinued = n, a.__offset = 0), a.__lastKeyContinued !== t && (s.push("AND " + a.__keyColumnName + " >= ?"), u.push(e.Key.encode(a.__lastKeyContinued))), s.push("ORDER BY ", a.__keyColumnName), s.push("LIMIT 1 OFFSET " + a.__offset), e.DEBUG && console.log(s.join(" "), u), o.executeSql(s.join(" "), u, function(n, o) {
            if (1 === o.rows.length) {
                var r = e.Key.decode(o.rows.item(0)[a.__keyColumnName]), s = "value" === a.__valueColumnName ? e.Sca.decode(o.rows.item(0)[a.__valueColumnName]) : e.Key.decode(o.rows.item(0)[a.__valueColumnName]);
                i(r, s);
            } else e.DEBUG && console.log("Reached end of cursors"), i(t, t);
        }, function(t, n) {
            e.DEBUG && console.log("Could not execute Cursor.continue"), r(n);
        });
    }, n.prototype["continue"] = function(e) {
        var n = this;
        this.__idbObjectStore.transaction.__addToTransactionQueue(function(o, i, r, a) {
            n.__offset++, n.__find(e, o, function(e, o) {
                n.key = e, n.value = o, r(n.key !== t ? n : t, n.__req);
            }, function(e) {
                a(e);
            });
        });
    }, n.prototype.advance = function(n) {
        0 >= n && e.util.throwDOMException("Type Error - Count is invalid - 0 or negative", n);
        var o = this;
        this.__idbObjectStore.transaction.__addToTransactionQueue(function(e, i, r, a) {
            o.__offset += n, o.__find(t, e, function(e, n) {
                o.key = e, o.value = n, r(o.key !== t ? o : t, o.__req);
            }, function(e) {
                a(e);
            });
        });
    }, n.prototype.update = function(n) {
        var o = this, i = this.__idbObjectStore.transaction.__createRequest(function() {});
        return e.Sca.encode(n, function(n) {
            this.__idbObjectStore.__pushToQueue(i, function(i, r, a, s) {
                o.__find(t, i, function(t) {
                    var r = "UPDATE " + e.util.quote(o.__idbObjectStore.name) + " SET value = ? WHERE key = ?";
                    e.DEBUG && console.log(r, n, t), i.executeSql(r, [ e.Sca.encode(n), e.Key.encode(t) ], function(e, n) {
                        1 === n.rowsAffected ? a(t) : s("No rowns with key found" + t);
                    }, function(e, t) {
                        s(t);
                    });
                }, function(e) {
                    s(e);
                });
            });
        }), i;
    }, n.prototype["delete"] = function() {
        var n = this;
        return this.__idbObjectStore.transaction.__addToTransactionQueue(function(o, i, r, a) {
            n.__find(t, o, function(i) {
                var s = "DELETE FROM  " + e.util.quote(n.__idbObjectStore.name) + " WHERE key = ?";
                e.DEBUG && console.log(s, i), o.executeSql(s, [ e.Key.encode(i) ], function(e, n) {
                    1 === n.rowsAffected ? r(t) : a("No rowns with key found" + i);
                }, function(e, t) {
                    a(t);
                });
            }, function(e) {
                a(e);
            });
        });
    }, e.IDBCursor = n;
}(idbModules), function(idbModules, undefined) {
    function IDBIndex(e, t) {
        this.indexName = this.name = e, this.__idbObjectStore = this.objectStore = this.source = t;
        var n = t.__storeProps && t.__storeProps.indexList;
        n && (n = JSON.parse(n)), this.keyPath = n && n[e] && n[e].keyPath || e, [ "multiEntry", "unique" ].forEach(function(t) {
            this[t] = !!(n && n[e] && n[e].optionalParams && n[e].optionalParams[t]);
        }, this);
    }
    IDBIndex.prototype.__createIndex = function(indexName, keyPath, optionalParameters) {
        var me = this, transaction = me.__idbObjectStore.transaction;
        transaction.__addToTransactionQueue(function(tx, args, success, failure) {
            me.__idbObjectStore.__getStoreProps(tx, function() {
                function error() {
                    idbModules.util.throwDOMException(0, "Could not create new index", arguments);
                }
                2 !== transaction.mode && idbModules.util.throwDOMException(0, "Invalid State error, not a version transaction", me.transaction);
                var idxList = JSON.parse(me.__idbObjectStore.__storeProps.indexList);
                idxList[indexName] !== undefined && idbModules.util.throwDOMException(0, "Index already exists on store", idxList);
                var columnName = indexName;
                idxList[indexName] = {
                    columnName: columnName,
                    keyPath: keyPath,
                    optionalParams: optionalParameters
                }, me.__idbObjectStore.__storeProps.indexList = JSON.stringify(idxList);
                var sql = [ "ALTER TABLE", idbModules.util.quote(me.__idbObjectStore.name), "ADD", columnName, "BLOB" ].join(" ");
                idbModules.DEBUG && console.log(sql), tx.executeSql(sql, [], function(tx, data) {
                    tx.executeSql("SELECT * FROM " + idbModules.util.quote(me.__idbObjectStore.name), [], function(tx, data) {
                        (function initIndexForRow(i) {
                            if (data.rows.length > i) try {
                                var value = idbModules.Sca.decode(data.rows.item(i).value), indexKey = eval("value['" + keyPath + "']");
                                tx.executeSql("UPDATE " + idbModules.util.quote(me.__idbObjectStore.name) + " set " + columnName + " = ? where key = ?", [ idbModules.Key.encode(indexKey), data.rows.item(i).key ], function() {
                                    initIndexForRow(i + 1);
                                }, error);
                            } catch (e) {
                                initIndexForRow(i + 1);
                            } else idbModules.DEBUG && console.log("Updating the indexes in table", me.__idbObjectStore.__storeProps), tx.executeSql("UPDATE __sys__ set indexList = ? where name = ?", [ me.__idbObjectStore.__storeProps.indexList, me.__idbObjectStore.name ], function() {
                                me.__idbObjectStore.__setReadyState("createIndex", !0), success(me);
                            }, error);
                        })(0);
                    }, error);
                }, error);
            }, "createObjectStore");
        });
    }, IDBIndex.prototype.openCursor = function(e, t) {
        var n = new idbModules.IDBRequest;
        return new idbModules.IDBCursor(e, t, this.source, n, this.indexName, "value"), n;
    }, IDBIndex.prototype.openKeyCursor = function(e, t) {
        var n = new idbModules.IDBRequest;
        return new idbModules.IDBCursor(e, t, this.source, n, this.indexName, "key"), n;
    }, IDBIndex.prototype.__fetchIndexData = function(e, t) {
        var n = this;
        return n.__idbObjectStore.transaction.__addToTransactionQueue(function(o, i, r, a) {
            var s = [ "SELECT * FROM ", idbModules.util.quote(n.__idbObjectStore.name), " WHERE", n.indexName, "NOT NULL" ], u = [];
            e !== undefined && (s.push("AND", n.indexName, " = ?"), u.push(idbModules.Key.encode(e))), idbModules.DEBUG && console.log("Trying to fetch data for Index", s.join(" "), u), o.executeSql(s.join(" "), u, function(e, n) {
                var o;
                o = "count" == typeof t ? n.rows.length : 0 === n.rows.length ? undefined : "key" === t ? idbModules.Key.decode(n.rows.item(0).key) : idbModules.Sca.decode(n.rows.item(0).value), r(o);
            }, a);
        });
    }, IDBIndex.prototype.get = function(e) {
        return this.__fetchIndexData(e, "value");
    }, IDBIndex.prototype.getKey = function(e) {
        return this.__fetchIndexData(e, "key");
    }, IDBIndex.prototype.count = function(e) {
        return this.__fetchIndexData(e, "count");
    }, idbModules.IDBIndex = IDBIndex;
}(idbModules), function(idbModules) {
    var IDBObjectStore = function(e, t, n) {
        this.name = e, this.transaction = t, this.__ready = {}, this.__setReadyState("createObjectStore", n === void 0 ? !0 : n), this.indexNames = new idbModules.util.StringList;
    };
    IDBObjectStore.prototype.__setReadyState = function(e, t) {
        this.__ready[e] = t;
    }, IDBObjectStore.prototype.__waitForReady = function(e, t) {
        var n = !0;
        if (t !== void 0) n = this.__ready[t] === void 0 ? !0 : this.__ready[t]; else for (var o in this.__ready) this.__ready[o] || (n = !1);
        if (n) e(); else {
            idbModules.DEBUG && console.log("Waiting for to be ready", t);
            var i = this;
            window.setTimeout(function() {
                i.__waitForReady(e, t);
            }, 100);
        }
    }, IDBObjectStore.prototype.__getStoreProps = function(e, t, n) {
        var o = this;
        this.__waitForReady(function() {
            o.__storeProps ? (idbModules.DEBUG && console.log("Store properties - cached", o.__storeProps), t(o.__storeProps)) : e.executeSql("SELECT * FROM __sys__ where name = ?", [ o.name ], function(e, n) {
                1 !== n.rows.length ? t() : (o.__storeProps = {
                    name: n.rows.item(0).name,
                    indexList: n.rows.item(0).indexList,
                    autoInc: n.rows.item(0).autoInc,
                    keyPath: n.rows.item(0).keyPath
                }, idbModules.DEBUG && console.log("Store properties", o.__storeProps), t(o.__storeProps));
            }, function() {
                t();
            });
        }, n);
    }, IDBObjectStore.prototype.__deriveKey = function(tx, value, key, callback) {
        function getNextAutoIncKey() {
            tx.executeSql("SELECT * FROM sqlite_sequence where name like ?", [ me.name ], function(e, t) {
                1 !== t.rows.length ? callback(0) : callback(t.rows.item(0).seq);
            }, function(e, t) {
                idbModules.util.throwDOMException(0, "Data Error - Could not get the auto increment value for key", t);
            });
        }
        var me = this;
        me.__getStoreProps(tx, function(props) {
            if (props || idbModules.util.throwDOMException(0, "Data Error - Could not locate defination for this table", props), props.keyPath) if (key !== void 0 && idbModules.util.throwDOMException(0, "Data Error - The object store uses in-line keys and the key parameter was provided", props), value) try {
                var primaryKey = eval("value['" + props.keyPath + "']");
                primaryKey ? callback(primaryKey) : "true" === props.autoInc ? getNextAutoIncKey() : idbModules.util.throwDOMException(0, "Data Error - Could not eval key from keyPath");
            } catch (e) {
                idbModules.util.throwDOMException(0, "Data Error - Could not eval key from keyPath", e);
            } else idbModules.util.throwDOMException(0, "Data Error - KeyPath was specified, but value was not"); else key !== void 0 ? callback(key) : "false" === props.autoInc ? idbModules.util.throwDOMException(0, "Data Error - The object store uses out-of-line keys and has no key generator and the key parameter was not provided. ", props) : getNextAutoIncKey();
        });
    }, IDBObjectStore.prototype.__insertData = function(tx, value, primaryKey, success, error) {
        var paramMap = {};
        primaryKey !== void 0 && (paramMap.key = idbModules.Key.encode(primaryKey));
        var indexes = JSON.parse(this.__storeProps.indexList);
        for (var key in indexes) try {
            paramMap[indexes[key].columnName] = idbModules.Key.encode(eval("value['" + indexes[key].keyPath + "']"));
        } catch (e) {
            error(e);
        }
        var sqlStart = [ "INSERT INTO ", idbModules.util.quote(this.name), "(" ], sqlEnd = [ " VALUES (" ], sqlValues = [];
        for (key in paramMap) sqlStart.push(key + ","), sqlEnd.push("?,"), sqlValues.push(paramMap[key]);
        sqlStart.push("value )"), sqlEnd.push("?)"), sqlValues.push(value);
        var sql = sqlStart.join(" ") + sqlEnd.join(" ");
        idbModules.DEBUG && console.log("SQL for adding", sql, sqlValues), tx.executeSql(sql, sqlValues, function() {
            success(primaryKey);
        }, function(e, t) {
            error(t);
        });
    }, IDBObjectStore.prototype.add = function(e, t) {
        var n = this, o = n.transaction.__createRequest(function() {});
        return idbModules.Sca.encode(e, function(i) {
            n.transaction.__pushToQueue(o, function(o, r, a, s) {
                n.__deriveKey(o, e, t, function(e) {
                    n.__insertData(o, i, e, a, s);
                });
            });
        }), o;
    }, IDBObjectStore.prototype.put = function(e, t) {
        var n = this, o = n.transaction.__createRequest(function() {});
        return idbModules.Sca.encode(e, function(i) {
            n.transaction.__pushToQueue(o, function(o, r, a, s) {
                n.__deriveKey(o, e, t, function(e) {
                    var t = "DELETE FROM " + idbModules.util.quote(n.name) + " where key = ?";
                    o.executeSql(t, [ idbModules.Key.encode(e) ], function(t, o) {
                        idbModules.DEBUG && console.log("Did the row with the", e, "exist? ", o.rowsAffected), n.__insertData(t, i, e, a, s);
                    }, function(e, t) {
                        s(t);
                    });
                });
            });
        }), o;
    }, IDBObjectStore.prototype.get = function(e) {
        var t = this;
        return t.transaction.__addToTransactionQueue(function(n, o, i, r) {
            t.__waitForReady(function() {
                var o = idbModules.Key.encode(e);
                idbModules.DEBUG && console.log("Fetching", t.name, o), n.executeSql("SELECT * FROM " + idbModules.util.quote(t.name) + " where key = ?", [ o ], function(e, t) {
                    idbModules.DEBUG && console.log("Fetched data", t);
                    try {
                        if (0 === t.rows.length) return i();
                        i(idbModules.Sca.decode(t.rows.item(0).value));
                    } catch (n) {
                        idbModules.DEBUG && console.log(n), i(void 0);
                    }
                }, function(e, t) {
                    r(t);
                });
            });
        });
    }, IDBObjectStore.prototype["delete"] = function(e) {
        var t = this;
        return t.transaction.__addToTransactionQueue(function(n, o, i, r) {
            t.__waitForReady(function() {
                var o = idbModules.Key.encode(e);
                idbModules.DEBUG && console.log("Fetching", t.name, o), n.executeSql("DELETE FROM " + idbModules.util.quote(t.name) + " where key = ?", [ o ], function(e, t) {
                    idbModules.DEBUG && console.log("Deleted from database", t.rowsAffected), i();
                }, function(e, t) {
                    r(t);
                });
            });
        });
    }, IDBObjectStore.prototype.clear = function() {
        var e = this;
        return e.transaction.__addToTransactionQueue(function(t, n, o, i) {
            e.__waitForReady(function() {
                t.executeSql("DELETE FROM " + idbModules.util.quote(e.name), [], function(e, t) {
                    idbModules.DEBUG && console.log("Cleared all records from database", t.rowsAffected), o();
                }, function(e, t) {
                    i(t);
                });
            });
        });
    }, IDBObjectStore.prototype.count = function(e) {
        var t = this;
        return t.transaction.__addToTransactionQueue(function(n, o, i, r) {
            t.__waitForReady(function() {
                var o = "SELECT * FROM " + idbModules.util.quote(t.name) + (e !== void 0 ? " WHERE key = ?" : ""), a = [];
                e !== void 0 && a.push(idbModules.Key.encode(e)), n.executeSql(o, a, function(e, t) {
                    i(t.rows.length);
                }, function(e, t) {
                    r(t);
                });
            });
        });
    }, IDBObjectStore.prototype.openCursor = function(e, t) {
        var n = new idbModules.IDBRequest;
        return new idbModules.IDBCursor(e, t, this, n, "key", "value"), n;
    }, IDBObjectStore.prototype.index = function(e) {
        var t = new idbModules.IDBIndex(e, this);
        return t;
    }, IDBObjectStore.prototype.createIndex = function(e, t, n) {
        var o = this;
        n = n || {}, o.__setReadyState("createIndex", !1);
        var i = new idbModules.IDBIndex(e, o);
        return o.__waitForReady(function() {
            i.__createIndex(e, t, n);
        }, "createObjectStore"), o.indexNames.push(e), i;
    }, IDBObjectStore.prototype.deleteIndex = function(e) {
        var t = new idbModules.IDBIndex(e, this, !1);
        return t.__deleteIndex(e), t;
    }, idbModules.IDBObjectStore = IDBObjectStore;
}(idbModules), function(e) {
    var t = 0, n = 1, o = 2, i = function(o, i, r) {
        if ("number" == typeof i) this.mode = i, 2 !== i && e.DEBUG && console.log("Mode should be a string, but was specified as ", i); else if ("string" == typeof i) switch (i) {
          case "readwrite":
            this.mode = n;
            break;
          case "readonly":
            this.mode = t;
            break;
          default:
            this.mode = t;
        }
        this.storeNames = "string" == typeof o ? [ o ] : o;
        for (var a = 0; this.storeNames.length > a; a++) r.objectStoreNames.contains(this.storeNames[a]) || e.util.throwDOMException(0, "The operation failed because the requested database object could not be found. For example, an object store did not exist but was being opened.", this.storeNames[a]);
        this.__active = !0, this.__running = !1, this.__requests = [], this.__aborted = !1, this.db = r, this.error = null, this.onabort = this.onerror = this.oncomplete = null;
    };
    i.prototype.__executeRequests = function() {
        if (this.__running && this.mode !== o) return e.DEBUG && console.log("Looks like the request set is already running", this.mode), void 0;
        this.__running = !0;
        var t = this;
        window.setTimeout(function() {
            2 === t.mode || t.__active || e.util.throwDOMException(0, "A request was placed against a transaction which is currently not active, or which is finished", t.__active), t.db.__db.transaction(function(n) {
                function o(t, n) {
                    n && (a.req = n), a.req.readyState = "done", a.req.result = t, delete a.req.error;
                    var o = e.Event("success");
                    e.util.callback("onsuccess", a.req, o), s++, r();
                }
                function i() {
                    a.req.readyState = "done", a.req.error = "DOMError";
                    var t = e.Event("error", arguments);
                    e.util.callback("onerror", a.req, t), s++, r();
                }
                function r() {
                    return s >= t.__requests.length ? (t.__active = !1, t.__requests = [], void 0) : (a = t.__requests[s], a.op(n, a.args, o, i), void 0);
                }
                t.__tx = n;
                var a = null, s = 0;
                try {
                    r();
                } catch (u) {
                    e.DEBUG && console.log("An exception occured in transaction", arguments), "function" == typeof t.onerror && t.onerror();
                }
            }, function() {
                e.DEBUG && console.log("An error in transaction", arguments), "function" == typeof t.onerror && t.onerror();
            }, function() {
                e.DEBUG && console.log("Transaction completed", arguments), "function" == typeof t.oncomplete && t.oncomplete();
            });
        }, 1);
    }, i.prototype.__addToTransactionQueue = function(t, n) {
        this.__active || this.mode === o || e.util.throwDOMException(0, "A request was placed against a transaction which is currently not active, or which is finished.", this.__mode);
        var i = this.__createRequest();
        return this.__pushToQueue(i, t, n), i;
    }, i.prototype.__createRequest = function() {
        var t = new e.IDBRequest;
        return t.source = this.db, t;
    }, i.prototype.__pushToQueue = function(e, t, n) {
        this.__requests.push({
            op: t,
            args: n,
            req: e
        }), this.__executeRequests();
    }, i.prototype.objectStore = function(t) {
        return new e.IDBObjectStore(t, this);
    }, i.prototype.abort = function() {
        !this.__active && e.util.throwDOMException(0, "A request was placed against a transaction which is currently not active, or which is finished", this.__active);
    }, i.prototype.READ_ONLY = 0, i.prototype.READ_WRITE = 1, i.prototype.VERSION_CHANGE = 2, e.IDBTransaction = i;
}(idbModules), function(e) {
    var t = function(t, n, o, i) {
        this.__db = t, this.version = o, this.__storeProperties = i, this.objectStoreNames = new e.util.StringList;
        for (var r = 0; i.rows.length > r; r++) this.objectStoreNames.push(i.rows.item(r).name);
        this.name = n, this.onabort = this.onerror = this.onversionchange = null;
    };
    t.prototype.createObjectStore = function(t, n) {
        var o = this;
        n = n || {}, n.keyPath = n.keyPath || null;
        var i = new e.IDBObjectStore(t, o.__versionTransaction, !1), r = o.__versionTransaction;
        return r.__addToTransactionQueue(function(r, a, s) {
            function u() {
                e.util.throwDOMException(0, "Could not create new object store", arguments);
            }
            o.__versionTransaction || e.util.throwDOMException(0, "Invalid State error", o.transaction);
            var c = [ "CREATE TABLE", e.util.quote(t), "(key BLOB", n.autoIncrement ? ", inc INTEGER PRIMARY KEY AUTOINCREMENT" : "PRIMARY KEY", ", value BLOB)" ].join(" ");
            e.DEBUG && console.log(c), r.executeSql(c, [], function(e) {
                e.executeSql("INSERT INTO __sys__ VALUES (?,?,?,?)", [ t, n.keyPath, n.autoIncrement ? !0 : !1, "{}" ], function() {
                    i.__setReadyState("createObjectStore", !0), s(i);
                }, u);
            }, u);
        }), o.objectStoreNames.push(t), i;
    }, t.prototype.deleteObjectStore = function(t) {
        var n = function() {
            e.util.throwDOMException(0, "Could not delete ObjectStore", arguments);
        }, o = this;
        !o.objectStoreNames.contains(t) && n("Object Store does not exist"), o.objectStoreNames.splice(o.objectStoreNames.indexOf(t), 1);
        var i = o.__versionTransaction;
        i.__addToTransactionQueue(function() {
            o.__versionTransaction || e.util.throwDOMException(0, "Invalid State error", o.transaction), o.__db.transaction(function(o) {
                o.executeSql("SELECT * FROM __sys__ where name = ?", [ t ], function(o, i) {
                    i.rows.length > 0 && o.executeSql("DROP TABLE " + e.util.quote(t), [], function() {
                        o.executeSql("DELETE FROM __sys__ WHERE name = ?", [ t ], function() {}, n);
                    }, n);
                });
            });
        });
    }, t.prototype.close = function() {}, t.prototype.transaction = function(t, n) {
        var o = new e.IDBTransaction(t, n || 1, this);
        return o;
    }, e.IDBDatabase = t;
}(idbModules), function(e) {
    var t = 4194304;
    if (window.openDatabase) {
        var n = window.openDatabase("__sysdb__", 1, "System Database", t);
        n.transaction(function(t) {
            t.executeSql("SELECT * FROM dbVersions", [], function() {}, function() {
                n.transaction(function(t) {
                    t.executeSql("CREATE TABLE IF NOT EXISTS dbVersions (name VARCHAR(255), version INT);", [], function() {}, function() {
                        e.util.throwDOMException("Could not create table __sysdb__ to save DB versions");
                    });
                });
            });
        }, function() {
            e.DEBUG && console.log("Error in sysdb transaction - when selecting from dbVersions", arguments);
        });
        var o = {
            open: function(o, i) {
                function r() {
                    if (!u) {
                        var t = e.Event("error", arguments);
                        s.readyState = "done", s.error = "DOMError", e.util.callback("onerror", s, t), u = !0;
                    }
                }
                function a(a) {
                    var u = window.openDatabase(o, 1, o, t);
                    s.readyState = "done", i === void 0 && (i = a || 1), (0 >= i || a > i) && e.util.throwDOMException(0, "An attempt was made to open a database using a lower version than the existing version.", i), u.transaction(function(t) {
                        t.executeSql("CREATE TABLE IF NOT EXISTS __sys__ (name VARCHAR(255), keyPath VARCHAR(255), autoInc BOOLEAN, indexList BLOB)", [], function() {
                            t.executeSql("SELECT * FROM __sys__", [], function(t, c) {
                                var d = e.Event("success");
                                s.source = s.result = new e.IDBDatabase(u, o, i, c), i > a ? n.transaction(function(t) {
                                    t.executeSql("UPDATE dbVersions set version = ? where name = ?", [ i, o ], function() {
                                        var t = e.Event("upgradeneeded");
                                        t.oldVersion = a, t.newVersion = i, s.transaction = s.result.__versionTransaction = new e.IDBTransaction([], 2, s.source), e.util.callback("onupgradeneeded", s, t, function() {
                                            var t = e.Event("success");
                                            e.util.callback("onsuccess", s, t);
                                        });
                                    }, r);
                                }, r) : e.util.callback("onsuccess", s, d);
                            }, r);
                        }, r);
                    }, r);
                }
                var s = new e.IDBOpenRequest, u = !1;
                return n.transaction(function(e) {
                    e.executeSql("SELECT * FROM dbVersions where name = ?", [ o ], function(e, t) {
                        0 === t.rows.length ? e.executeSql("INSERT INTO dbVersions VALUES (?,?)", [ o, i || 1 ], function() {
                            a(0);
                        }, r) : a(t.rows.item(0).version);
                    }, r);
                }, r), s;
            },
            deleteDatabase: function(o) {
                function i(t) {
                    if (!s) {
                        a.readyState = "done", a.error = "DOMError";
                        var n = e.Event("error");
                        n.message = t, n.debug = arguments, e.util.callback("onerror", a, n), s = !0;
                    }
                }
                function r() {
                    n.transaction(function(t) {
                        t.executeSql("DELETE FROM dbVersions where name = ? ", [ o ], function() {
                            a.result = void 0;
                            var t = e.Event("success");
                            t.newVersion = null, t.oldVersion = u, e.util.callback("onsuccess", a, t);
                        }, i);
                    }, i);
                }
                var a = new e.IDBOpenRequest, s = !1, u = null;
                return n.transaction(function(n) {
                    n.executeSql("SELECT * FROM dbVersions where name = ?", [ o ], function(n, s) {
                        if (0 === s.rows.length) {
                            a.result = void 0;
                            var c = e.Event("success");
                            return c.newVersion = null, c.oldVersion = u, e.util.callback("onsuccess", a, c), void 0;
                        }
                        u = s.rows.item(0).version;
                        var d = window.openDatabase(o, 1, o, t);
                        d.transaction(function(t) {
                            t.executeSql("SELECT * FROM __sys__", [], function(t, n) {
                                var o = n.rows;
                                (function a(n) {
                                    n >= o.length ? t.executeSql("DROP TABLE __sys__", [], function() {
                                        r();
                                    }, i) : t.executeSql("DROP TABLE " + e.util.quote(o.item(n).name), [], function() {
                                        a(n + 1);
                                    }, function() {
                                        a(n + 1);
                                    });
                                })(0);
                            }, function() {
                                r();
                            });
                        }, i);
                    });
                }, i), a;
            },
            cmp: function(t, n) {
                return e.Key.encode(t) > e.Key.encode(n) ? 1 : t === n ? 0 : -1;
            }
        };
        e.shimIndexedDB = o;
    }
}(idbModules), function(e, t) {
    e.openDatabase !== void 0 && (e.shimIndexedDB = t.shimIndexedDB, e.shimIndexedDB && (e.shimIndexedDB.__useShim = function() {
        e.indexedDB = t.shimIndexedDB, e.IDBDatabase = t.IDBDatabase, e.IDBTransaction = t.IDBTransaction, e.IDBCursor = t.IDBCursor, e.IDBKeyRange = t.IDBKeyRange;
    }, e.shimIndexedDB.__debug = function(e) {
        t.DEBUG = e;
    })), e.indexedDB = e.indexedDB || e.webkitIndexedDB || e.mozIndexedDB || e.oIndexedDB || e.msIndexedDB, e.indexedDB === void 0 && e.openDatabase !== void 0 ? e.shimIndexedDB.__useShim() : (e.IDBDatabase = e.IDBDatabase || e.webkitIDBDatabase, e.IDBTransaction = e.IDBTransaction || e.webkitIDBTransaction, e.IDBCursor = e.IDBCursor || e.webkitIDBCursor, e.IDBKeyRange = e.IDBKeyRange || e.webkitIDBKeyRange, e.IDBTransaction || (e.IDBTransaction = {}), e.IDBTransaction.READ_ONLY = e.IDBTransaction.READ_ONLY || "readonly", e.IDBTransaction.READ_WRITE = e.IDBTransaction.READ_WRITE || "readwrite");
}(window, idbModules);

var J = jQuery.noConflict();

var Zotero = {
    ajax: {},
    callbacks: {},
    ui: {
        callbacks: {},
        keyCode: {
            BACKSPACE: 8,
            COMMA: 188,
            DELETE: 46,
            DOWN: 40,
            END: 35,
            ENTER: 13,
            ESCAPE: 27,
            HOME: 36,
            LEFT: 37,
            PAGE_DOWN: 34,
            PAGE_UP: 33,
            PERIOD: 190,
            RIGHT: 39,
            SPACE: 32,
            TAB: 9,
            UP: 38
        }
    },
    url: {},
    utils: {},
    offline: {},
    temp: {},
    localizations: {},
    config: {
        librarySettings: {},
        baseApiUrl: "https://api.zotero.org",
        baseWebsiteUrl: "https://zotero.org",
        baseFeedUrl: "https://api.zotero.org",
        baseZoteroWebsiteUrl: "https://www.zotero.org",
        baseDownloadUrl: "https://www.zotero.org",
        directDownloads: true,
        proxyPath: "/proxyrequest",
        ignoreLoggedInStatus: false,
        storePrefsRemote: true,
        preferUrlItem: true,
        sessionAuth: false,
        proxy: true,
        apiKey: "",
        ajax: 1,
        apiVersion: 2,
        eventful: false,
        locale: "en-US",
        cacheStoreType: "localStorage",
        preloadCachedLibrary: true,
        mobile: 0,
        sortOrdering: {
            dateAdded: "desc",
            dateModified: "desc",
            date: "desc",
            year: "desc",
            accessDate: "desc",
            title: "asc",
            creator: "asc"
        },
        defaultSortColumn: "title",
        defaultSortOrder: "asc",
        largeFields: {
            title: 1,
            abstractNote: 1,
            extra: 1
        },
        richTextFields: {
            note: 1
        },
        maxFieldSummaryLength: {
            title: 60
        },
        exportFormats: [ "bibtex", "bookmarks", "mods", "refer", "rdf_bibliontology", "rdf_dc", "rdf_zotero", "ris", "wikipedia" ],
        exportFormatsMap: {
            bibtex: "BibTeX",
            bookmarks: "Bookmarks",
            mods: "MODS",
            refer: "Refer/BibIX",
            rdf_bibliontology: "Bibliontology RDF",
            rdf_dc: "Unqualified Dublin Core RDF",
            rdf_zotero: "Zotero RDF",
            ris: "RIS",
            wikipedia: "Wikipedia Citation Templates"
        },
        defaultApiArgs: {
            order: "title",
            sort: "asc",
            limit: 50,
            start: 0,
            content: "json",
            format: "atom"
        }
    },
    debug: function(debugstring, level) {
        var prefLevel = 3;
        if (typeof console == "undefined") {
            return;
        }
        if (typeof level !== "number") {
            level = 1;
        }
        if (Zotero.preferences !== undefined) {
            prefLevel = Zotero.preferences.getPref("debug_level");
        }
        if (level <= prefLevel) {
            console.log(debugstring);
        }
    },
    warn: function(warnstring) {
        if (typeof console == "undefined" || typeof console.warn == "undefined") {
            this.debug(warnstring);
        } else {
            console.warn(warnstring);
        }
    },
    error: function(errorstring) {
        if (typeof console == "undefined" || typeof console.error == "undefined") {
            this.debug(errorstring);
        } else {
            console.error(errorstring);
        }
    },
    feeds: {},
    cacheFeeds: {},
    libraries: {},
    validator: {
        patterns: {
            itemKey: /^.+$/,
            collectionKey: /^([A-Z0-9]{8,})|trash$/,
            libraryID: /^[0-9]+$/,
            libraryType: /^(user|group|)$/,
            target: /^(items?|collections?|tags|children|deleted|userGroups|key|settings)$/,
            targetModifier: /^(top|file|file\/view)$/,
            sort: /^(asc|desc)$/,
            start: /^[0-9]*$/,
            limit: /^[0-9]*$/,
            order: /^\S*$/,
            content: /^((html|json|bib|none|bibtex|bookmarks|coins|csljson|mods|refer|rdf_bibliontology|rdf_dc|ris|tei|wikipedia),?)+$/,
            q: /^.*$/,
            fq: /^\S*$/,
            itemType: /^\S*$/,
            locale: /^\S*$/,
            tag: /^.*$/,
            tagType: /^(0|1)$/,
            key: /^\S*/,
            format: /^(atom|bib|keys|versions|bibtex|bookmarks|mods|refer|rdf_bibliontology|rdf_dc|rdf_zotero|ris|wikipedia)$/,
            style: /^\S*$/,
            linkwrap: /^(0|1)*$/
        },
        validate: function(arg, type) {
            Z.debug("Zotero.validate", 4);
            if (arg === "") {
                return null;
            } else if (arg === null) {
                return true;
            }
            Z.debug(arg + " " + type, 4);
            var patterns = this.patterns;
            if (patterns.hasOwnProperty(type)) {
                return patterns[type].test(arg);
            } else {
                return null;
            }
        }
    },
    _logEnabled: 0,
    enableLogging: function() {
        Zotero._logEnabled++;
        if (Zotero._logEnabled > 0) {}
    },
    disableLogging: function() {
        Zotero._logEnabled--;
        if (Zotero._logEnabled <= 0) {
            Zotero._logEnabled = 0;
        }
    },
    init: function() {
        var store;
        if (Zotero.config.cacheStoreType == "localStorage" && typeof localStorage != "undefined") {
            store = localStorage;
        } else if (Zotero.config.cacheStoreType == "sessionStorage" && typeof sessionStorage != "undefined") {
            store = sessionStorage;
        } else {
            store = {};
        }
        Zotero.store = store;
        Zotero.cache = new Zotero.Cache(store);
        Zotero.preferences = new Zotero.Preferences(Zotero.store, "global");
        var locale = "en-US";
        if (Zotero.config.locale) {
            locale = Zotero.config.locale;
        }
        locale = "en-US";
        J.ajaxSettings.traditional = true;
    }
};

Zotero.Cache = function(store) {
    this.store = store;
    var registry = this.store["_registry"];
    if (typeof registry == "null" || typeof registry == "undefined") {
        registry = {};
        this.store["_registry"] = JSON.stringify(registry);
    }
};

Zotero.Cache.prototype.objectCacheString = function(params) {
    var paramVarsArray = [];
    J.each(params, function(index, value) {
        if (!value) {
            return;
        } else if (value instanceof Array) {
            J.each(value, function(i, v) {
                paramVarsArray.push(index + "/" + encodeURIComponent(v));
            });
        } else {
            paramVarsArray.push(index + "/" + encodeURIComponent(value));
        }
    });
    paramVarsArray.sort();
    Z.debug(paramVarsArray, 4);
    var objectCacheString = paramVarsArray.join("/");
    return objectCacheString;
};

Zotero.Cache.prototype.save = function(params, object, cachetags) {
    if (!J.isArray(cachetags)) {
        cachetags = [];
    }
    var registry = JSON.parse(this.store["_registry"]);
    if (!registry) {
        registry = {};
    }
    var objectCacheString = this.objectCacheString(params);
    this.store[objectCacheString] = JSON.stringify(object);
    var registryEntry = {
        id: objectCacheString,
        saved: Date.now(),
        cachetags: cachetags
    };
    registry[objectCacheString] = registryEntry;
    this.store["_registry"] = JSON.stringify(registry);
};

Zotero.Cache.prototype.load = function(params) {
    Z.debug("Zotero.Cache.load", 3);
    var objectCacheString = this.objectCacheString(params);
    Z.debug(objectCacheString, 4);
    try {
        var s = this.store[objectCacheString];
        if (!s) {
            Z.debug("No value found in cache store - " + objectCacheString, 3);
            return null;
        } else {
            return JSON.parse(s);
        }
    } catch (e) {
        Z.debug("Error parsing retrieved cache data", 1);
        Z.debug(objectCacheString, 2);
        Z.debug(this.store[objectCacheString], 2);
        return null;
    }
};

Zotero.Cache.prototype.expireCacheTag = function(tag) {
    Z.debug("Zotero.Cache.expireCacheTag", 3);
    var registry = JSON.parse(this.store["_registry"]);
    var store = this.store;
    J.each(registry, function(index, value) {
        if (J.inArray(tag, value.cachetags) != -1) {
            Z.debug("tag " + tag + " found for item " + value["id"] + " : expiring", 4);
            delete store[value["id"]];
            delete registry[value["id"]];
        }
    });
};

Zotero.Cache.prototype.clear = function() {
    if (typeof this.store.clear == "function") {
        this.store.clear();
    } else {
        this.store = {};
    }
};

Zotero.error = function(e) {
    Z.debug("=====Zotero Error", 1);
    Z.debug(e, 1);
};

Zotero.ajaxRequest = function(url, type, options) {
    Z.debug("Zotero.ajaxRequest ==== " + url, 3);
    var defaultOptions = {
        type: "GET",
        headers: {},
        cache: false,
        error: Zotero.ajax.errorCallback
    };
    var reqOptions = J.extend({}, defaultOptions, options);
    if (type) {
        reqOptions.type = type;
    }
    if (Zotero.config.apiVersion) {
        reqOptions.headers["Zotero-API-Version"] = Zotero.config.apiVersion;
    }
    var urlstring;
    if (typeof url === "object") {
        urlstring = Zotero.ajax.apiRequestString(url);
    } else if (typeof url === "string") {
        urlstring = url;
    }
    Z.debug("library.ajaxRequest urlstring " + urlstring, 3);
    var reqUrl = Zotero.ajax.proxyWrapper(urlstring, type);
    ajaxpromise = new Promise(function(resolve, reject) {
        J.ajax(reqUrl, reqOptions).then(function(data, textStatus, jqxhr) {
            resolve({
                jqxhr: jqxhr,
                data: data,
                textStatus: textStatus
            });
        }, function(jqxhr, textStatus, errorThrown) {
            reject({
                jqxhr: jqxhr,
                textStatus: textStatus,
                errorThrown: errorThrown
            });
        });
    });
    Zotero.ajax.activeRequests.push(ajaxpromise);
    return ajaxpromise;
};

Zotero.trigger = function(eventType, data, filter) {
    if (filter) {
        Z.debug("filter is not false");
        eventType += "_" + filter;
    }
    Zotero.debug("Triggering eventful " + eventType, 3);
    if (!data) {
        data = {};
    }
    data.zeventful = true;
    if (data.triggeringElement === null || data.triggeringElement === undefined) {
        data.triggeringElement = J("#eventful");
    }
    Zotero.debug("Triggering eventful " + eventType, 3);
    var e = J.Event(eventType, data);
    J("#eventful").trigger(e);
};

Zotero.listen = function(events, handler, data, filter) {
    if (filter) {
        var eventsArray = events.split(" ");
        if (eventsArray.length > 0) {
            for (var i = 0; i < eventsArray.length; i++) {
                eventsArray[i] += "_" + filter;
            }
            events = eventsArray.join(" ");
        }
    }
    Z.debug("listening on " + events, 3);
    J("#eventful").on(events, null, data, handler);
};

var Z = Zotero;

Zotero.ajax.errorCallback = function(response) {
    Z.debug("ajax error callback", 2);
    Z.debug("textStatus: " + response.textStatus, 2);
    Z.debug("errorThrown: ", 2);
    Z.debug(response.errorThrown, 2);
    Z.debug(response.jqxhr, 2);
};

Zotero.ajax.error = Zotero.ajax.errorCallback;

Zotero.ajax.activeRequests = [];

Zotero.ajax.apiRequestUrl = function(params) {
    Z.debug("Zotero.ajax.apiRequestUrl", 4);
    Z.debug(params, 4);
    J.each(params, function(key, val) {
        if (typeof val == "string") {
            val = val.split("#", 1);
            params[key] = val[0];
        }
        if (Zotero.validator.validate(val, key) === false) {
            Zotero.warn("API argument failed validation: " + key + " cannot be " + val);
            Zotero.warn(params);
            delete params[key];
        }
    });
    if (!params.target) throw new Error("No target defined for api request");
    if (!(params.libraryType == "user" || params.libraryType == "group" || params.libraryType === "")) {
        throw new Error("Unexpected libraryType for api request " + JSON.stringify(params));
    }
    if (params.libraryType && !params.libraryID) {
        throw new "No libraryID defined for api request";
    }
    var base = Zotero.config.baseApiUrl;
    var url;
    if (params.libraryType !== "") {
        url = base + "/" + params.libraryType + "s/" + params.libraryID;
        if (params.collectionKey) {
            if (params.collectionKey == "trash") {
                url += "/items/trash";
                return url;
            } else if (params.collectionKey.indexOf(",") !== -1) {} else if (params.target != "collections") {
                url += "/collections/" + params.collectionKey;
            }
        }
    } else {
        url = base;
    }
    switch (params.target) {
      case "items":
        url += "/items";
        break;
      case "item":
        if (params.itemKey) {
            url += "/items/" + params.itemKey;
        } else {
            url += "/items";
        }
        break;
      case "collections":
        url += "/collections";
        break;
      case "childCollections":
        url += "/collections";
      case "collection":
        break;
      case "tags":
        url += "/tags";
        break;
      case "children":
        url += "/items/" + params.itemKey + "/children";
        break;
      case "key":
        url = base + "/users/" + params.libraryID + "/keys/" + params.apiKey;
        break;
      case "deleted":
        url += "/deleted";
        break;
      case "userGroups":
        url = base + "/users/" + params.libraryID + "/groups";
        break;
      case "settings":
        url += "/settings/" + (params.settingsKey || "");
        break;
      default:
        return false;
    }
    switch (params.targetModifier) {
      case "top":
        url += "/top";
        break;
      case "file":
        url += "/file";
        break;
      case "viewsnapshot":
        url += "/file/view";
        break;
    }
    return url;
};

Zotero.ajax.apiQueryString = function(passedParams, useConfigKey) {
    Z.debug("Zotero.ajax.apiQueryString", 4);
    Z.debug(passedParams, 4);
    if (useConfigKey === null || typeof useConfigKey === "undefined") {
        useConfigKey = true;
    }
    J.each(passedParams, function(key, val) {
        if (typeof val == "string") {
            val = val.split("#", 1);
            passedParams[key] = val[0];
        }
    });
    if (passedParams.hasOwnProperty("order") && passedParams["order"] == "creatorSummary") {
        passedParams["order"] = "creator";
    }
    if (passedParams.hasOwnProperty("order") && passedParams["order"] == "year") {
        passedParams["order"] = "date";
    }
    if (useConfigKey && Zotero.config.sessionAuth) {
        var sessionKey = Zotero.utils.readCookie("zotero_www_session_v2");
        passedParams["session"] = sessionKey;
    } else if (useConfigKey && Zotero.config.apiKey) {
        passedParams["key"] = Zotero.config.apiKey;
    }
    if (passedParams.hasOwnProperty("sort") && passedParams["sort"] == "undefined") {
        passedParams["sort"] = "asc";
    }
    Z.debug(passedParams, 4);
    var queryString = "?";
    var queryParamsArray = [];
    var queryParamOptions = [ "start", "limit", "order", "sort", "content", "format", "q", "fq", "itemType", "itemKey", "collectionKey", "searchKey", "locale", "tag", "tagType", "key", "style", "linkMode", "linkwrap", "session", "newer" ];
    queryParamOptions.sort();
    var queryParams = {};
    J.each(queryParamOptions, function(i, val) {
        if (passedParams.hasOwnProperty(val) && passedParams[val] !== "") {
            queryParams[val] = passedParams[val];
        }
    });
    if (passedParams.hasOwnProperty("target") && passedParams["target"] !== "items") {
        if (queryParams.hasOwnProperty("itemKey") && queryParams["itemKey"].indexOf(",") == -1) {
            delete queryParams["itemKey"];
        }
    }
    if (passedParams.hasOwnProperty("target") && passedParams["target"] !== "collections") {
        if (queryParams.hasOwnProperty("collectionKey") && queryParams["collectionKey"].indexOf(",") === -1) {
            delete queryParams["collectionKey"];
        }
    }
    J.each(queryParams, function(index, value) {
        if (value instanceof Array) {
            J.each(value, function(i, v) {
                if (index == "tag" && v[0] == "-") {
                    v = "\\" + v;
                }
                queryParamsArray.push(encodeURIComponent(index) + "=" + encodeURIComponent(v));
            });
        } else {
            if (index == "tag" && value[0] == "-") {
                value = "\\" + value;
            }
            queryParamsArray.push(encodeURIComponent(index) + "=" + encodeURIComponent(value));
        }
    });
    queryString += queryParamsArray.join("&");
    return queryString;
};

Zotero.ajax.apiRequestString = function(config) {
    return Zotero.ajax.apiRequestUrl(config) + Zotero.ajax.apiQueryString(config);
};

Zotero.ajax.proxyWrapper = function(requestUrl, method) {
    if (Zotero.config.proxy) {
        if (!method) {
            method = "GET";
        }
        return Zotero.config.proxyPath + "?requestMethod=" + method + "&requestUrl=" + encodeURIComponent(requestUrl);
    } else {
        return requestUrl;
    }
};

Zotero.ajax.parseQueryString = function(query) {};

Zotero.ajax.webUrl = function(args) {};

Zotero.ajax.downloadBlob = function(url) {
    return new Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest;
        var blob;
        xhr.open("GET", url, true);
        xhr.responseType = "blob";
        xhr.addEventListener("load", function() {
            if (xhr.status === 200) {
                Z.debug("downloadBlob Image retrieved. resolving", 3);
                resolve(xhr.response);
            } else {
                reject(xhr.response);
            }
        });
        xhr.send();
    });
};

Zotero.Feed = function(data, response) {
    Z.debug("Zotero.Feed", 3);
    this.title = "";
    this.id = "";
    this.totalResults = 0;
    this.apiVersion = null;
    this.links = {};
    this.lastPageStart = null;
    this.lastPage = null;
    this.currentPage = null;
    this.updated = null;
    if (typeof data !== "undefined") {
        this.parseXmlFeed(data);
    }
    if (response) {
        this.lastModifiedVersion = response.getResponseHeader("Last-Modified-Version");
        this.apiVersion = response.getResponseHeader("Zotero-API-Version");
        this.backoff = response.getResponseHeader("Backoff");
        this.retryAfter = response.getResponseHeader("Retry-After");
        this.contentType = response.getResponseHeader("Content-Type");
    }
};

Zotero.Feed.prototype.parseXmlFeed = function(data) {
    var fel = J(data).find("feed");
    this.zoteroLastModifiedVersion = null;
    this.title = fel.children("title").first().text();
    this.id = fel.children("id").first().text();
    this.totalResults = fel.find("zapi\\:totalResults").first().text();
    if (this.totalResults === "") {
        this.totalResults = fel.find("totalResults").first().text();
    }
    var links = {};
    var lasthref = "";
    fel.children("link").each(function() {
        var rel = J(this).attr("rel");
        links[rel] = {
            rel: J(this).attr("rel"),
            type: J(this).attr("type"),
            href: J(this).attr("href")
        };
        if (J(this).attr("rel") == "last") {
            lasthref = J(this).attr("href");
        }
    });
    var selfhref = links["self"].href;
    this.lastPageStart = J.deparam.querystring(lasthref).start || 0;
    var limit = J.deparam.querystring(lasthref).limit || 50;
    var start = J.deparam.querystring(selfhref).start || 0;
    this.lastPage = parseInt(this.lastPageStart, 10) / limit + 1;
    this.currentPage = parseInt(start, 10) / limit + 1;
    this.links = links;
    this.updated = new Date;
    this.updated.setTime(Date.parse(fel.children("updated").first().text()));
    this.entries = fel.find("entry");
    return this;
};

Zotero.Library = function(type, libraryID, libraryUrlIdentifier, apiKey) {
    Z.debug("Zotero.Library constructor", 3);
    Z.debug("Library Constructor: " + type + " " + libraryID + " ", 3);
    var library = this;
    Z.debug(libraryUrlIdentifier, 4);
    library.instance = "Zotero.Library";
    library.libraryVersion = 0;
    library.syncState = {
        earliestVersion: null,
        latestVersion: null
    };
    library._apiKey = apiKey || false;
    library.libraryBaseWebsiteUrl = Zotero.config.libraryPathString;
    if (type == "group") {
        library.libraryBaseWebsiteUrl += "groups/";
    }
    this.libraryBaseWebsiteUrl += libraryUrlIdentifier + "/items";
    library.items = new Zotero.Items;
    library.items.owningLibrary = library;
    library.itemKeys = [];
    library.collections = new Zotero.Collections;
    library.collections.libraryUrlIdentifier = library.libraryUrlIdentifier;
    library.collections.owningLibrary = library;
    library.tags = new Zotero.Tags;
    library.searches = new Zotero.Searches;
    library.searches.owningLibrary = library;
    library.groups = new Zotero.Groups;
    library.groups.owningLibrary = library;
    library.deleted = new Zotero.Deleted;
    library.deleted.owningLibrary = library;
    if (!type) {
        return;
    }
    library.type = type;
    library.libraryType = type;
    library.libraryID = libraryID;
    library.libraryString = Zotero.utils.libraryString(library.libraryType, library.libraryID);
    library.libraryUrlIdentifier = libraryUrlIdentifier;
    library.preferences = new Zotero.Preferences(Zotero.store, library.libraryString);
    library.usernames = {};
    if (Zotero.config.useIndexedDB === true) {
        Z.debug("Library Constructor: indexedDB init", 3);
        var idbLibrary = new Zotero.Idb.Library(library.libraryString);
        idbLibrary.owningLibrary = this;
        library.idbLibrary = idbLibrary;
        idbLibrary.init().then(function() {
            Z.debug("Library Constructor: idbInitD Done", 3);
            if (Zotero.config.preloadCachedLibrary === true) {
                Z.debug("Library Constructor: preloading cached library", 3);
                var cacheLoadD = library.loadIndexedDBCache();
                cacheLoadD.then(function() {
                    Z.debug("Library Constructor: Library.items.itemsVersion: " + library.items.itemsVersion, 3);
                    Z.debug("Library Constructor: Library.collections.collectionsVersion: " + library.collections.collectionsVersion, 3);
                    Z.debug("Library Constructor: Library.tags.tagsVersion: " + library.tags.tagsVersion, 3);
                    Z.debug("Library Constructor: Triggering cachedDataLoaded", 3);
                    library.trigger("cachedDataLoaded");
                }, function(err) {
                    Z.debug("Error loading cached library", 1);
                    Z.debug(err, 1);
                    throw new Error("Error loading cached library");
                });
            } else {
                library.trigger("cachedDataLoaded");
            }
        }, function() {
            Z.debug("Error initialized indexedDB. Promise rejected.", 1);
            throw new Error("Error initialized indexedDB. Promise rejected.");
        });
    }
    library.dirty = false;
    library.tagsChanged = function() {};
    library.collectionsChanged = function() {};
    library.itemsChanged = function() {};
};

Zotero.Library.prototype.sortableColumns = [ "title", "creator", "itemType", "date", "year", "publisher", "publicationTitle", "journalAbbreviation", "language", "accessDate", "libraryCatalog", "callNumber", "rights", "dateAdded", "dateModified", "addedBy" ];

Zotero.Library.prototype.displayableColumns = [ "title", "creator", "itemType", "date", "year", "publisher", "publicationTitle", "journalAbbreviation", "language", "accessDate", "libraryCatalog", "callNumber", "rights", "dateAdded", "dateModified", "numChildren", "addedBy" ];

Zotero.Library.prototype.groupOnlyColumns = [ "addedBy" ];

Zotero.Library.prototype.sortByTitleCompare = function(a, b) {
    if (a.title.toLocaleLowerCase() == b.title.toLocaleLowerCase()) {
        return 0;
    }
    if (a.title.toLocaleLowerCase() < b.title.toLocaleLowerCase()) {
        return -1;
    }
    return 1;
};

Zotero.Library.prototype.sortLower = function(a, b) {
    if (a.toLocaleLowerCase() == b.toLocaleLowerCase()) {
        return 0;
    }
    if (a.toLocaleLowerCase() < b.toLocaleLowerCase()) {
        return -1;
    }
    return 1;
};

Zotero.Library.prototype.ajaxRequest = function(url, type, options) {
    Z.debug("Library.ajaxRequest", 3);
    var defaultOptions = {
        type: "GET",
        headers: {},
        cache: false
    };
    var successCallback = null;
    var failureCallback = null;
    if (options && options.success) {
        successCallback = options.success;
        delete options.success;
    }
    if (options && options.error) {
        failureCallback = options.error;
        delete options.error;
    }
    var reqOptions = J.extend({}, defaultOptions, options);
    if (type) {
        reqOptions.type = type;
    }
    if (Zotero.config.apiVersion) {
        reqOptions.headers["Zotero-API-Version"] = Zotero.config.apiVersion;
    }
    var urlstring;
    if (typeof url === "object") {
        urlstring = Zotero.ajax.apiRequestString(url);
    } else if (typeof url === "string") {
        urlstring = url;
    }
    Z.debug("library.ajaxRequest urlstring " + urlstring, 3);
    var reqUrl = Zotero.ajax.proxyWrapper(urlstring, type);
    ajaxpromise = new Promise(function(resolve, reject) {
        J.ajax(reqUrl, reqOptions).then(function(data, textStatus, jqxhr) {
            Z.debug("library.ajaxRequest jqxhr resolved. resolving Promise", 3);
            resolve({
                jqxhr: jqxhr,
                data: data,
                textStatus: textStatus
            });
        }, function(jqxhr, textStatus, errorThrown) {
            Z.debug("library.ajaxRequest jqxhr rejected. rejecting Promise", 3);
            reject({
                jqxhr: jqxhr,
                textStatus: textStatus,
                errorThrown: errorThrown
            });
        });
    });
    if (successCallback || failureCallback) {
        ajaxpromise.then(successCallback, failureCallback);
    }
    Zotero.ajax.activeRequests.push(ajaxpromise);
    return ajaxpromise;
};

Zotero.Library.prototype.sequentialRequests = function(requests) {
    Z.debug("Zotero.Library.sequentialRequests", 3);
    var library = this;
    var requestPromises = [];
    var seqPromise = Promise.resolve();
    J.each(requests, function(index, requestObject) {
        seqPromise = seqPromise.then(function() {
            var p = library.ajaxRequest(requestObject.url, requestObject.options.type, requestObject.options);
            requestPromises.push(p);
            return p;
        });
    });
    return seqPromise.then(function() {
        return requestPromises;
    });
};

Zotero.Library.prototype.websiteUrl = function(urlvars) {
    Z.debug("Zotero.library.websiteUrl", 3);
    Z.debug(urlvars, 4);
    var urlVarsArray = [];
    J.each(urlvars, function(index, value) {
        if (value === "") return;
        urlVarsArray.push(index + "/" + value);
    });
    urlVarsArray.sort();
    Z.debug(urlVarsArray, 4);
    var pathVarsString = urlVarsArray.join("/");
    return this.libraryBaseWebsiteUrl + "/" + pathVarsString;
};

Zotero.Library.prototype.synchronize = function() {};

Zotero.Library.prototype.loadUpdatedItems = function() {
    var library = this;
    var syncFromVersion = library.libraryVersion ? library.libraryVersion : library.items.itemsVersion;
    return Promise.resolve(library.updatedVersions("items", syncFromVersion)).then(function(response) {
        Z.debug("itemVersions resolved", 3);
        var updatedVersion = response.jqxhr.getResponseHeader("Last-Modified-Version");
        Z.debug("items Last-Modified-Version: " + updatedVersion, 3);
        Zotero.utils.updateSyncState(library.items, updatedVersion);
        var itemVersions = response.data;
        library.itemVersions = itemVersions;
        var itemKeys = [];
        J.each(itemVersions, function(key, val) {
            var item = library.items.getItem(key);
            if (item && item.apiObj.itemKey != val) {
                itemKeys.push(key);
            }
        });
        return library.loadItemsFromKeys(itemKeys);
    }).then(function(response) {
        Z.debug("loadItemsFromKeys resolved", 3);
        Zotero.utils.updateSyncedVersion(library.items, "itemsVersion");
        var displayParams = Zotero.state.getUrlVars();
        library.buildItemDisplayView(displayParams);
        if (Zotero.config.useIndexedDB) {
            var saveItemsD = library.idbLibrary.updateItems();
        }
    });
};

Zotero.Library.prototype.loadUpdatedCollections = function() {
    Z.debug("Zotero.Library.loadUpdatedCollections", 3);
    var library = this;
    var syncFromVersion = library.libraryVersion ? library.libraryVersion : library.collections.collectionsVersion;
    return Promise.resolve(library.updatedVersions("collections", syncFromVersion)).then(function(response) {
        Z.debug("collectionVersions finished", 3);
        var updatedVersion = response.jqxhr.getResponseHeader("Last-Modified-Version");
        Z.debug("Collections Last-Modified-Version: " + updatedVersion, 3);
        Zotero.utils.updateSyncState(library.collections.syncState, updatedVersion);
        var collectionVersions = response.data;
        library.collectionVersions = collectionVersions;
        var collectionKeys = [];
        J.each(collectionVersions, function(key, val) {
            var c = library.collections.getCollection(key);
            if (c && c.apiObj.collectionVersion != val) {
                collectionKeys.push(key);
            }
        });
        if (collectionKeys.length === 0) {
            Z.debug("No collectionKeys need updating. resolving", 3);
            return;
        } else {
            return Promise.resolve(library.loadCollectionsFromKeys(collectionKeys)).then(function() {
                var collections = library.collections;
                collections.initSecondaryData();
                Z.debug("All updated collections loaded", 3);
                Zotero.utils.updateSyncedVersion(library.collections, "collectionsVersion");
                var displayParams = Zotero.state.getUrlVars();
                Z.debug("loadUpdatedCollections complete - saving collections to cache before resolving", 3);
                Z.debug("collectionsVersion: " + library.collections.collectionsVersion, 3);
                if (Zotero.config.useIndexedDB) {
                    return library.idbLibrary.updateCollections();
                }
            });
        }
    }).then(function() {
        Z.debug("done getting collection data. requesting deleted data", 3);
        return library.getDeleted(library.libraryVersion);
    }).then(function() {
        Z.debug("got deleted collections data: removing local copies", 3);
        Z.debug(library.deleted);
        if (library.deleted.deletedData.collections && library.deleted.deletedData.collections.length > 0) {
            library.collections.removeLocalCollections(library.deleted.deletedData.collections);
        }
    });
};

Zotero.Library.prototype.loadUpdatedTags = function() {
    Z.debug("Zotero.Library.loadUpdatedTags", 3);
    var library = this;
    Z.debug("tagsVersion: " + library.tags.tagsVersion, 3);
    return Promise.resolve(library.loadAllTags({
        newer: library.tags.tagsVersion
    }, false)).then(function() {
        return library.getDeleted(library.libraryVersion);
    }).then(function() {
        if (library.deleted.deletedData.tags && library.deleted.deletedData.tags.length > 0) {
            library.tags.removeTags(library.deleted.deletedData.tags);
        }
        if (Zotero.config.useIndexedDB) {
            Z.debug("saving updated tags to IDB", 3);
            var saveTagsD = library.idbLibrary.updateTags();
        }
    });
};

Zotero.Library.prototype.getDeleted = function(version) {
    Z.debug("Zotero.Library.getDeleted", 3);
    var library = this;
    var urlconf = {
        target: "deleted",
        libraryType: library.libraryType,
        libraryID: library.libraryID,
        newer: version
    };
    if (library.deleted.deletedVersion == version) {
        Z.debug("deletedVersion matches requested: immediately resolving");
        return Promise.resolve(library.deleted.deletedData);
    }
    return library.ajaxRequest(urlconf).then(function(response) {
        Z.debug("got deleted response");
        library.deleted.deletedData = response.data;
        var responseModifiedVersion = response.jqxhr.getResponseHeader("Last-Modified-Version");
        Z.debug("Deleted Last-Modified-Version:" + responseModifiedVersion, 3);
        library.deleted.deletedVersion = responseModifiedVersion;
        library.deleted.newerVersion = version;
    });
};

Zotero.Library.prototype.processDeletions = function(deletions) {
    var library = this;
    J.each(deletions.collections, function(ind, val) {
        var localCollection = library.collections.getCollection(val);
        if (localCollection !== false) {
            if (localCollection.synced === true) {
                library.collections.deleteCollection(val);
            } else {}
        }
    });
    J.each(deletions.items, function(ind, val) {
        var localItem = library.items.getItem(val);
        if (localItem !== false) {
            if (localItem.synced === true) {
                library.items.deleteItem(val);
            }
        }
    });
};

Zotero.Library.prototype.loadFullBib = function(itemKeys, style) {
    var library = this;
    var itemKeyString = itemKeys.join(",");
    var urlconfig = {
        target: "items",
        libraryType: library.libraryType,
        libraryID: library.libraryID,
        itemKey: itemKeyString,
        format: "bib",
        linkwrap: "1"
    };
    if (itemKeys.length == 1) {
        urlconfig.target = "item";
    }
    if (style) {
        urlconfig["style"] = style;
    }
    var loadBibPromise = library.ajaxRequest(urlconfig).then(function(response) {
        return response.data;
    });
    return loadBibPromise;
};

Zotero.Library.prototype.loadItemBib = function(itemKey, style) {
    Z.debug("Zotero.Library.loadItemBib", 3);
    var library = this;
    var urlconfig = {
        target: "item",
        libraryType: library.libraryType,
        libraryID: library.libraryID,
        itemKey: itemKey,
        content: "bib"
    };
    if (style) {
        urlconfig["style"] = style;
    }
    var requestUrl = Zotero.ajax.apiRequestString(urlconfig);
    var itemBibPromise = library.ajaxRequest(urlconfig).then(function(response) {
        var resultOb = J(response.data);
        var entry = J(response.data).find("entry").eq(0);
        var item = new Zotero.Item;
        item.parseXmlItem(entry);
        var bibContent = item.bibContent;
        return bibContent;
    });
    return itemBibPromise;
};

Zotero.Library.prototype.loadSettings = function() {
    Z.debug("Zotero.Library.loadSettings", 3);
    var library = this;
    var urlconfig = {
        target: "settings",
        libraryType: library.libraryType,
        libraryID: library.libraryID
    };
    return library.ajaxRequest(urlconfig).then(function(response) {
        var resultObject;
        if (typeof response.data == "string") {
            resultObject = JSON.parse(response.data);
        } else {
            resultObject = response.data;
        }
        library.preferences.setPref("settings", resultObject);
        if (resultObject.tagColors) {
            var tagColors = resultObject.tagColors.value;
            library.preferences.setPref("tagColors", tagColors);
        }
        library.trigger("settingsLoaded");
        return library.preferences;
    });
};

Zotero.Library.prototype.matchColoredTags = function(tags) {
    var library = this;
    var tagColorsSettings = library.preferences.getPref("tagColors");
    if (!tagColorsSettings) return [];
    var tagColorsMap = {};
    for (var i = 0; i < tagColorsSettings.length; i++) {
        tagColorsMap[tagColorsSettings[i].name.toLowerCase()] = tagColorsSettings[i].color;
    }
    var resultTags = [];
    for (var i = 0; i < tags.length; i++) {
        if (tagColorsMap.hasOwnProperty(tags[i])) {
            resultTags.push(tagColorsMap[tags[i]]);
        }
    }
    return resultTags;
}, Zotero.Library.prototype.fetchUserNames = function(userIDs) {
    Z.debug("Zotero.Library.fetchUserNames", 3);
    var library = this;
    var reqUrl = Zotero.config.baseZoteroWebsiteUrl + "/api/useraliases?userID=" + userIDs.join(",");
    var usernamesPromise = new Promise(function(resolve, reject) {
        J.getJSON(reqUrl, function(data, textStatus, jqXHR) {
            J.each(data, function(userID, aliases) {
                library.usernames[userID] = aliases;
            });
            resolve(data);
        });
    });
    return usernamesPromise;
};

Zotero.Library.prototype.sendToLibrary = function(items, foreignLibrary) {
    var foreignItems = [];
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var newForeignItem = new Zotero.Item;
        newForeignItem.apiObj = J.extend({}, items[i].apiObj);
        delete newForeignItem.apiObj.itemKey;
        delete newForeignItem.apiObj.itemVersion;
        newForeignItem.apiObj.collections = [];
        newForeignItem.pristine = J.extend({}, newForeignItem.apiObj);
        newForeignItem.initSecondaryData();
        if (!newForeignItem.apiObj.relations) {
            newForeignItem.apiObj.relations = {};
        }
        newForeignItem.apiObj.relations["owl:sameAs"] = Zotero.url.relationUrl(item.owningLibrary.libraryType, item.owningLibrary.libraryID, item.itemKey);
        foreignItems.push(newForeignItem);
    }
    return foreignLibrary.items.writeItems(foreignItems);
};

Zotero.Library.prototype.updatedVersions = function(target, version) {
    Z.debug("Library.updatedVersions", 3);
    var library = this;
    if (typeof target === "undefined") {
        target = "items";
    }
    if (typeof version === "undefined" || version === null) {
        version = library.libraryVersion;
    }
    var urlconf = {
        target: target,
        format: "versions",
        libraryType: library.libraryType,
        libraryID: library.libraryID,
        newer: version
    };
    return library.ajaxRequest(urlconf);
};

Zotero.Library.prototype.loadItemsFromKeys = function(keys) {
    Zotero.debug("Zotero.Library.loadItemsFromKeys", 3);
    var library = this;
    return library.loadFromKeysSerial(keys, "items");
};

Zotero.Library.prototype.loadCollectionsFromKeys = function(keys) {
    Zotero.debug("Zotero.Library.loadCollectionsFromKeys", 3);
    var library = this;
    return library.loadFromKeysSerial(keys, "collections");
};

Zotero.Library.prototype.loadSeachesFromKeys = function(keys) {
    Zotero.debug("Zotero.Library.loadSearchesFromKeys", 3);
    var library = this;
    return library.loadFromKeysSerial(keys, "searches");
};

Zotero.Library.prototype.loadFromKeysParallel = function(keys, objectType) {
    Zotero.debug("Zotero.Library.loadFromKeysParallel", 3);
    if (!objectType) objectType = "items";
    var library = this;
    var keyslices = [];
    while (keys.length > 0) {
        keyslices.push(keys.splice(0, 50));
    }
    var promises = [];
    J.each(keyslices, function(ind, keyslice) {
        var keystring = keyslice.join(",");
        var promise;
        switch (objectType) {
          case "items":
            promise = library.loadItemsSimple({
                target: "items",
                targetModifier: null,
                itemKey: keystring,
                limit: 50
            });
            break;
          case "collections":
            promise = library.loadCollectionsSimple({
                target: "collections",
                targetModifier: null,
                collectionKey: keystring,
                limit: 50
            });
            break;
          case "searches":
            promise = library.loadSearchesSimple({
                target: "searches",
                searchKey: keystring,
                limit: 50
            });
            break;
        }
        promises.push(promise);
    });
    return Promise.all(promises);
};

Zotero.Library.prototype.loadFromKeysSerial = function(keys, objectType) {
    Zotero.debug("Zotero.Library.loadFromKeysSerial", 3);
    if (!objectType) objectType = "items";
    var library = this;
    var keyslices = [];
    while (keys.length > 0) {
        keyslices.push(keys.splice(0, 50));
    }
    var requestObjects = [];
    J.each(keyslices, function(ind, keyslice) {
        var keystring = keyslice.join(",");
        switch (objectType) {
          case "items":
            requestObjects.push({
                url: Zotero.ajax.apiRequestString({
                    target: "items",
                    targetModifier: null,
                    itemKey: keystring,
                    limit: 50,
                    content: "json",
                    libraryType: library.libraryType,
                    libraryID: library.libraryID
                }),
                options: {
                    type: "GET",
                    success: J.proxy(library.processLoadedItems, library)
                }
            });
            break;
          case "collections":
            requestObjects.push({
                url: Zotero.ajax.apiRequestString({
                    target: "collections",
                    targetModifier: null,
                    collectionKey: keystring,
                    limit: 50,
                    content: "json",
                    libraryType: library.libraryType,
                    libraryID: library.libraryID
                }),
                options: {
                    type: "GET",
                    success: J.proxy(library.processLoadedCollections, library)
                }
            });
            break;
          case "searches":
            requestObjects.push({
                url: Zotero.ajax.apiRequestString({
                    target: "searches",
                    targetModifier: null,
                    searchKey: keystring,
                    limit: 50,
                    content: "json",
                    libraryType: library.libraryType,
                    libraryID: library.libraryID
                }),
                options: {
                    type: "GET"
                }
            });
            break;
        }
    });
    return library.sequentialRequests(requestObjects);
};

Zotero.Library.prototype.buildItemDisplayView = function(params) {
    Z.debug("Zotero.Library.buildItemDisplayView", 3);
    Z.debug(params, 4);
    var library = this;
    library.itemKeys = Object.keys(library.items.itemObjects);
    if (!library.idbLibrary.db) {
        return false;
    }
    var filterPromises = [];
    var itemKeys;
    if (params.collectionKey) {
        if (params.collectionKey == "trash") {
            filterPromises.push(library.idbLibrary.filterItems("deleted", 1));
        } else {
            filterPromises.push(library.idbLibrary.filterItems("collectionKeys", params.collectionKey));
        }
    } else {
        filterPromises.push(library.idbLibrary.getOrderedItemKeys("title"));
    }
    var selectedTags = params.tag || [];
    if (typeof selectedTags == "string") selectedTags = [ selectedTags ];
    for (var i = 0; i < selectedTags.length; i++) {
        Z.debug("adding selected tag filter:", 3);
        filterPromises.push(library.idbLibrary.filterItems("itemTagStrings", selectedTags[i]));
    }
    return Promise.all(filterPromises).then(function(results) {
        for (var i = 0; i < results.length; i++) {
            Z.debug("result from filterPromise: " + results[i].length, 3);
            Z.debug(results[i], 3);
        }
        var finalItemKeys = library.idbLibrary.intersectAll(results);
        itemsArray = library.items.getItems(finalItemKeys);
        Z.debug("All filters applied - Down to " + itemsArray.length + " items displayed", 3);
        Z.debug("remove child items and, if not viewing trash, deleted items", 3);
        library.items.displayItemsArray = [];
        for (var i = 0; i < itemsArray.length; i++) {
            if (itemsArray[i].parentItemKey) {
                continue;
            }
            if (params.collectionKey != "trash" && itemsArray[i].apiObj.deleted) {
                continue;
            }
            library.items.displayItemsArray.push(itemsArray[i]);
        }
        var orderCol = params["order"] || "title";
        var sort = params["sort"] || "asc";
        Z.debug("Sorting by " + orderCol + " - " + sort, 3);
        library.items.displayItemsArray.sort(function(a, b) {
            var aval = a.get(orderCol);
            var bval = b.get(orderCol);
            if (typeof aval == "string") {
                return aval.localeCompare(bval);
            } else {
                return aval - bval;
            }
        });
        if (sort == "desc") {
            Z.debug("sort is desc - reversing array", 4);
            library.items.displayItemsArray.reverse();
        }
        Z.debug("triggering publishing displayedItemsUpdated", 3);
        library.trigger("displayedItemsUpdated");
    });
};

Zotero.Library.prototype.trigger = function(eventType, data) {
    var library = this;
    Zotero.trigger(eventType, data, library.libraryString);
};

Zotero.Library.prototype.listen = function(events, handler, data) {
    var library = this;
    var filter = library.libraryString;
    Zotero.listen(events, handler, data, filter);
};

Zotero.Entry = function() {
    this.instance = "Zotero.Entry";
    this.version = 0;
};

Zotero.Entry.prototype.dumpEntry = function() {
    var entry = this;
    var dump = {};
    var dataProperties = [ "version", "title", "author", "id", "published", "dateAdded", "updated", "dateModified", "links" ];
    for (var i = 0; i < dataProperties.length; i++) {
        dump[dataProperties[i]] = entry[dataProperties[i]];
    }
    return dump;
};

Zotero.Entry.prototype.loadDumpEntry = function(dump) {
    var dataProperties = [ "version", "title", "author", "id", "published", "dateAdded", "updated", "dateModified", "links" ];
    for (var i = 0; i < dataProperties.length; i++) {
        this[dataProperties[i]] = dump[dataProperties[i]];
    }
    return this;
};

Zotero.Entry.prototype.dump = Zotero.Entry.prototype.dumpEntry;

Zotero.Entry.prototype.parseXmlEntry = function(eel) {
    Z.debug("Zotero.Entry.parseXmlEntry", 4);
    var entry = this;
    entry.version = eel.children("zapi\\:version").text();
    entry.title = eel.children("title").text();
    entry.author = {};
    entry.author["name"] = eel.children("author").children("name").text();
    entry.author["uri"] = eel.children("author").children("uri").text();
    entry.id = eel.children("id").first().text();
    entry.published = eel.children("published").text();
    entry.dateAdded = entry.published;
    entry.updated = eel.children("updated").text();
    entry.dateModified = entry.updated;
    var links = {};
    eel.children("link").each(function() {
        var rel = J(this).attr("rel");
        links[rel] = {
            rel: J(this).attr("rel"),
            type: J(this).attr("type"),
            href: J(this).attr("href"),
            length: J(this).attr("length")
        };
    });
    entry.links = links;
};

Zotero.Entry.prototype.associateWithLibrary = function(library) {
    var entry = this;
    entry.libraryUrlIdentifier = library.libraryUrlIdentifier;
    entry.libraryType = library.libraryType;
    entry.libraryID = library.libraryID;
    entry.owningLibrary = library;
    return entry;
};

Zotero.Collections = function(feed) {
    var collections = this;
    this.instance = "Zotero.Collections";
    this.collectionsVersion = 0;
    this.syncState = {
        earliestVersion: null,
        latestVersion: null
    };
    this.collectionsArray = [];
    this.dirty = false;
    this.loaded = false;
    this.collectionObjects = {};
    if (typeof feed == "undefined") {
        return;
    } else {
        this.addCollectionsFromFeed(feed);
        this.initSecondaryData();
    }
};

Zotero.Collections.prototype.dump = function() {
    var dump = {};
    dump.instance = "Zotero.Collections";
    dump.collectionsVersion = this.collectionsVersion;
    dump.collectionsArray = [];
    for (var i = 0; i < this.collectionsArray.length; i++) {
        dump.collectionsArray.push(this.collectionsArray[i].dump());
    }
    dump.dirty = this.dirty;
    dump.loaded = this.loaded;
    return dump;
};

Zotero.Collections.prototype.loadDump = function(dump) {
    var collections = this;
    collections.collectionsVersion = dump.collectionsVersion;
    collections.dirty = dump.dirty;
    collections.loaded = dump.loaded;
    for (var i = 0; i < dump.collectionsArray.length; i++) {
        var collection = new Zotero.Collection;
        collection.loadDump(dump.collectionsArray[i]);
        collections.addCollection(collection);
    }
    collections.initSecondaryData();
    return collections;
};

Zotero.Collections.prototype.initSecondaryData = function() {
    Z.debug("Zotero.Collections.initSecondaryData", 3);
    var collections = this;
    collections.collectionsArray = [];
    J.each(collections.collectionObjects, function(ind, collection) {
        collections.collectionsArray.push(collection);
    });
    collections.collectionsArray.sort(collections.sortByTitleCompare);
    collections.nestCollections();
    collections.assignDepths(0, collections.collectionsArray);
};

Zotero.Collections.prototype.addCollection = function(collection) {
    Zotero.debug("Zotero.Collections.addCollection", 4);
    Zotero.debug(collection.collectionKey, 4);
    this.collectionsArray.push(collection);
    this.collectionObjects[collection.collectionKey] = collection;
    if (this.owningLibrary) {
        collection.associateWithLibrary(this.owningLibrary);
    }
    return this;
};

Zotero.Collections.prototype.addCollectionsFromFeed = function(feed) {
    var collections = this;
    var collectionsAdded = [];
    feed.entries.each(function(index, entry) {
        var collection = new Zotero.Collection(J(entry));
        collections.addCollection(collection);
        collectionsAdded.push(collection);
    });
    return collectionsAdded;
};

Zotero.Collections.prototype.sortByTitleCompare = function(a, b) {
    if (a.get("title").toLowerCase() == b.get("title").toLowerCase()) {
        return 0;
    }
    if (a.get("title").toLowerCase() < b.get("title").toLowerCase()) {
        return -1;
    }
    return 1;
};

Zotero.Collections.prototype.assignDepths = function(depth, cArray) {
    Z.debug("Zotero.Collections.assignDepths", 3);
    var collections = this;
    var insertchildren = function(depth, children) {
        J.each(children, function(index, col) {
            col.nestingDepth = depth;
            if (col.hasChildren) {
                insertchildren(depth + 1, col.children);
            }
        });
    };
    J.each(collections.collectionsArray, function(index, collection) {
        if (collection.topLevel) {
            collection.nestingDepth = 1;
            if (collection.hasChildren) {
                insertchildren(2, collection.children);
            }
        }
    });
};

Zotero.Collections.prototype.nestedOrderingArray = function() {
    Z.debug("Zotero.Collections.nestedOrderingArray", 3);
    var collections = this;
    var nested = [];
    var insertchildren = function(a, children) {
        J.each(children, function(index, col) {
            a.push(col);
            if (col.hasChildren) {
                insertchildren(a, col.children);
            }
        });
    };
    J.each(collections.collectionsArray, function(index, collection) {
        if (collection.topLevel) {
            nested.push(collection);
            if (collection.hasChildren) {
                insertchildren(nested, collection.children);
            }
        }
    });
    Z.debug("Done with nestedOrderingArray", 3);
    return nested;
};

Zotero.Collections.prototype.getCollection = function(key) {
    if (this.collectionObjects.hasOwnProperty(key)) {
        return this.collectionObjects[key];
    } else {
        return false;
    }
};

Zotero.Collections.prototype.remoteDeleteCollection = function(collectionKey) {
    var collections = this;
    return collections.removeLocalCollection(collectionKey);
};

Zotero.Collections.prototype.removeLocalCollection = function(collectionKey) {
    var collections = this;
    return collections.removeLocalCollections([ collectionKey ]);
};

Zotero.Collections.prototype.removeLocalCollections = function(collectionKeys) {
    var collections = this;
    for (var i = 0; i < collectionKeys.length; i++) {
        delete collections.collectionObjects[collectionKeys[i]];
    }
    collections.initSecondaryData();
};

Zotero.Collections.prototype.nestCollections = function() {
    var collections = this;
    J.each(collections.collectionsArray, function(ind, collection) {
        collection.children = [];
    });
    collections.collectionsArray.sort(collections.sortByTitleCompare);
    J.each(collections.collectionsArray, function(ind, collection) {
        collection.nestCollection(collections.collectionObjects);
    });
};

Zotero.Collections.prototype.writeCollections = function(collectionsArray) {
    Z.debug("Zotero.Collections.writeCollections", 3);
    var collections = this;
    var library = collections.owningLibrary;
    var returnCollections = [];
    var writeCollections = [];
    var i;
    var config = {
        target: "collections",
        libraryType: collections.owningLibrary.libraryType,
        libraryID: collections.owningLibrary.libraryID,
        content: "json"
    };
    var requestUrl = Zotero.ajax.apiRequestUrl(config) + Zotero.ajax.apiQueryString(config);
    var writeChunks = [];
    var writeChunkCounter = 0;
    var rawChunkObjects = [];
    var chunkSize = 50;
    var collection;
    for (i = 0; i < collectionsArray.length; i++) {
        collection = collectionsArray[i];
        var collectionKey = collection.get("collectionKey");
        if (!collectionKey) {
            var newCollectionKey = Zotero.utils.getKey();
            collection.set("collectionKey", newCollectionKey);
            collection.set("collectionVersion", 0);
        }
    }
    for (i = 0; i < collectionsArray.length; i = i + chunkSize) {
        writeChunks.push(collectionsArray.slice(i, i + chunkSize));
    }
    for (i = 0; i < writeChunks.length; i++) {
        rawChunkObjects[i] = [];
        for (var j = 0; j < writeChunks[i].length; j++) {
            rawChunkObjects[i].push(writeChunks[i][j].writeApiObj());
            Z.debug("Collection Write API Object: ");
            Z.debug(writeChunks[i][j].writeApiObj());
        }
    }
    var writeCollectionsSuccessCallback = function(response) {
        Z.debug("writeCollections successCallback", 3);
        Z.debug("response:");
        Z.debug(response);
        Z.debug("context:");
        Z.debug(this);
        Zotero.utils.updateObjectsFromWriteResponse(this.writeChunk, response.jqxhr);
        returnCollections = returnCollections.concat(this.writeChunk);
        Z.debug("returnCollections");
        Z.debug(returnCollections);
    };
    Z.debug("collections.collectionsVersion: " + collections.collectionsVersion, 3);
    Z.debug("collections.libraryVersion: " + collections.libraryVersion, 3);
    var requestObjects = [];
    for (i = 0; i < writeChunks.length; i++) {
        var successContext = {
            writeChunk: writeChunks[i],
            library: library
        };
        requestData = JSON.stringify({
            collections: rawChunkObjects[i]
        });
        requestObjects.push({
            url: requestUrl,
            options: {
                type: "POST",
                data: requestData,
                processData: false,
                headers: {
                    "Content-Type": "application/json"
                },
                success: J.proxy(writeCollectionsSuccessCallback, successContext)
            }
        });
    }
    return library.sequentialRequests(requestObjects).then(function(sequentialPromises) {
        Z.debug("Done with writeCollections sequentialRequests promise", 3);
        Z.debug(returnCollections);
        Z.debug("adding returnCollections to library.collections");
        J.each(returnCollections, function(ind, collection) {
            collections.addCollection(collection);
        });
        collections.initSecondaryData();
        return returnCollections;
    }).catch(function(err) {
        Z.debug(err);
    });
};

Zotero.Items = function(feed) {
    this.instance = "Zotero.Items";
    this.itemsVersion = 0;
    this.syncState = {
        earliestVersion: null,
        latestVersion: null
    };
    this.displayItemsArray = [];
    this.displayItemsUrl = "";
    this.itemObjects = {};
    this.unsyncedItemKeys = [];
    this.newUnsyncedItems = [];
    if (typeof feed != "undefined") {
        this.addItemsFromFeed(feed);
    }
};

Zotero.Items.prototype.dump = function() {
    Z.debug("Zotero.Items.dump", 3);
    var items = this;
    var dump = {};
    dump.instance = "Zotero.Items.dump";
    dump.itemsVersion = this.itemsVersion;
    dump.itemsArray = [];
    J.each(items.itemObjects, function(key, val) {
        Z.debug("dumping item " + key + " : " + val.itemKey, 3);
        dump.itemsArray.push(val.dump());
    });
    return dump;
};

Zotero.Items.prototype.loadDump = function(dump) {
    Z.debug("-------------------------------Zotero.Items.loadDump", 3);
    Z.debug("dump.itemsVersion: " + dump.itemsVersion, 3);
    Z.debug("dump.itemsArray length: " + dump.itemsArray.length, 3);
    this.itemsVersion = dump.itemsVersion;
    var items = this;
    var itemKeys = [];
    for (var i = 0; i < dump.itemsArray.length; i++) {
        var item = new Zotero.Item;
        item.loadDump(dump.itemsArray[i]);
        items.addItem(item);
        itemKeys.push(item.itemKey);
    }
    if (items.owningLibrary) {
        items.owningLibrary.itemKeys = itemKeys;
    }
    var parentItem;
    J.each(items.itemObjects, function(ind, item) {
        if (item.parentKey) {
            parentItem = items.getItem(item.parentKey);
            if (parentItem !== false) {
                parentItem.childItemKeys.push(item.itemKey);
            }
        }
    });
    return this;
};

Zotero.Items.prototype.getItem = function(key) {
    if (this.itemObjects.hasOwnProperty(key)) {
        return this.itemObjects[key];
    }
    return false;
};

Zotero.Items.prototype.getItems = function(keys) {
    var items = this;
    var gotItems = [];
    for (var i = 0; i < keys.length; i++) {
        gotItems.push(items.getItem(keys[i]));
    }
    return gotItems;
};

Zotero.Items.prototype.loadDataObjects = function(itemsArray) {
    var loadedItems = [];
    var libraryItems = this;
    J.each(itemsArray, function(index, dataObject) {
        var itemKey = dataObject["itemKey"];
        var item = new Zotero.Item;
        item.loadObject(dataObject);
        libraryItems.itemObjects[itemKey] = item;
        loadedItems.push(item);
    });
    return loadedItems;
};

Zotero.Items.prototype.addItem = function(item) {
    this.itemObjects[item.itemKey] = item;
    if (this.owningLibrary) {
        item.associateWithLibrary(this.owningLibrary);
    }
    return this;
};

Zotero.Items.prototype.addItemsFromFeed = function(feed) {
    var items = this;
    var itemsAdded = [];
    feed.entries.each(function(index, entry) {
        var item = new Zotero.Item(J(entry));
        items.addItem(item);
        itemsAdded.push(item);
    });
    return itemsAdded;
};

Zotero.Items.prototype.keysNotInItems = function(keys) {
    var notPresent = [];
    J.each(keys, function(ind, val) {
        if (!this.itemObjects.hasOwnProperty(val)) {
            notPresent.push(val);
        }
    });
    return notPresent;
};

Zotero.Items.prototype.remoteDeleteItem = function(key) {
    var items = this;
    if (items.itemObjects.hasOwnProperty(key) && items.itemObjects[key].synced === true) {
        delete items.itemObjects[key];
        return true;
    }
    return false;
};

Zotero.Items.prototype.deleteItem = function(itemKey) {
    Z.debug("Zotero.Items.deleteItem", 3);
    var items = this;
    var item;
    if (!itemKey) return false;
    if (typeof itemKey == "string") {
        item = items.getItem(itemKey);
    } else if (typeof itemKey == "object" && itemKey.instance == "Zotero.Item") {
        item = itemKey;
    }
    var config = {
        target: "item",
        libraryType: items.owningLibrary.libraryType,
        libraryID: items.owningLibrary.libraryID,
        itemKey: item.itemKey
    };
    var requestUrl = Zotero.ajax.apiRequestString(config);
    return Zotero.ajaxRequest(requestUrl, "DELETE", {
        processData: false,
        headers: {
            "If-Unmodified-Since-Version": item.itemVersion
        }
    });
};

Zotero.Items.prototype.deleteItems = function(deleteItems, version) {
    Z.debug("Zotero.Items.deleteItems", 3);
    var items = this;
    var deleteKeys = [];
    var i;
    if (!version && items.itemsVersion !== 0) {
        version = items.itemsVersion;
    }
    for (i = 0; i < deleteItems.length; i++) {
        if (!deleteItems[i]) continue;
        if (typeof deleteItems[i] == "string") {
            deleteKeys.push(deleteItems[i]);
        } else {
            deleteKeys.push(deleteItems[i].itemKey);
        }
    }
    var deleteChunks = [];
    var writeChunkCounter = 0;
    var chunkSize = 50;
    for (i = 0; i < deleteKeys.length; i = i + chunkSize) {
        deleteChunks.push(deleteKeys.slice(i, i + chunkSize));
    }
    var deletePromise = Promise.resolve();
    J.each(deleteChunks, function(index, chunk) {
        var deleteKeysString = chunk.join(",");
        var config = {
            target: "items",
            libraryType: items.owningLibrary.libraryType,
            libraryID: items.owningLibrary.libraryID,
            itemKey: deleteKeysString
        };
        var headers = {
            "Content-Type": "application/json"
        };
        headers["If-Unmodified-Since-Version"] = version;
        deletePromise.then(function() {
            return items.owningLibrary.ajaxRequest(config, "DELETE", {
                processData: false,
                headers: headers
            });
        }).then(function(response) {
            version = response.jqxhr.getResponseHeader("Last-Modified-Version");
            var deleteProgress = index / deleteChunks.length;
            Zotero.trigger("deleteProgress", {
                progress: deleteProgress
            });
        });
    });
    return deletePromise;
};

Zotero.Items.prototype.trashItems = function(itemsArray) {
    var items = this;
    var i;
    for (i = 0; i < itemsArray.length; i++) {
        var item = itemsArray[i];
        item.set("deleted", 1);
    }
    return items.writeItems(itemsArray);
};

Zotero.Items.prototype.untrashItems = function(itemsArray) {
    var items = this;
    var i;
    for (i = 0; i < itemsArray.length; i++) {
        var item = itemsArray[i];
        item.set("deleted", 0);
    }
    return items.writeItems(itemsArray);
};

Zotero.Items.prototype.findItems = function(config) {
    var items = this;
    var matchingItems = [];
    J.each(items.itemObjects, function(i, item) {
        if (config.collectionKey && J.inArray(config.collectionKey, item.apiObj.collections === -1)) {
            return;
        }
        matchingItems.push(items.itemObjects[i]);
    });
    return matchingItems;
};

Zotero.Items.prototype.writeItems = function(itemsArray) {
    var items = this;
    var library = items.owningLibrary;
    var returnItems = [];
    var writeItems = [];
    var i;
    var item;
    for (i = 0; i < itemsArray.length; i++) {
        item = itemsArray[i];
        var itemKey = item.get("itemKey");
        if (itemKey === "" || itemKey === null) {
            var newItemKey = Zotero.utils.getKey();
            item.set("itemKey", newItemKey);
            item.set("itemVersion", 0);
        }
        writeItems.push(item);
        if (item.hasOwnProperty("notes") && item.notes.length > 0) {
            for (var j = 0; j < item.notes.length; j++) {
                item.notes[j].set("parentItem", item.get("itemKey"));
            }
            writeItems = writeItems.concat(item.notes);
        }
        if (item.hasOwnProperty("attachments") && item.attachments.length > 0) {
            for (var k = 0; k < item.attachments.length; k++) {
                item.attachments[k].set("parentItem", item.get("itemKey"));
            }
            writeItems = writeItems.concat(item.attachments);
        }
    }
    var config = {
        target: "items",
        libraryType: items.owningLibrary.libraryType,
        libraryID: items.owningLibrary.libraryID,
        content: "json"
    };
    var requestUrl = Zotero.ajax.apiRequestUrl(config) + Zotero.ajax.apiQueryString(config);
    var writeChunks = [];
    var writeChunkCounter = 0;
    var rawChunkObjects = [];
    var chunkSize = 50;
    for (i = 0; i < writeItems.length; i = i + chunkSize) {
        writeChunks.push(writeItems.slice(i, i + chunkSize));
    }
    for (i = 0; i < writeChunks.length; i++) {
        rawChunkObjects[i] = [];
        for (var j = 0; j < writeChunks[i].length; j++) {
            rawChunkObjects[i].push(writeChunks[i][j].writeApiObj());
        }
    }
    var writeItemsSuccessCallback = function(data, textStatus, jqXhr) {
        Z.debug("writeItem successCallback", 3);
        Z.debug("successCode: " + jqXhr.status, 4);
        Zotero.utils.updateObjectsFromWriteResponse(this.writeChunk, jqXhr);
        this.library.idbLibrary.updateItems(this.writeChunk);
        this.returnItems = this.returnItems.concat(this.writeChunk);
        Zotero.trigger("itemsChanged", {
            library: this.library
        });
    };
    Z.debug("items.itemsVersion: " + items.itemsVersion, 3);
    Z.debug("items.libraryVersion: " + items.libraryVersion, 3);
    var requestObjects = [];
    for (i = 0; i < writeChunks.length; i++) {
        var successContext = {
            writeChunk: writeChunks[i],
            returnItems: returnItems,
            library: library
        };
        requestData = JSON.stringify({
            items: rawChunkObjects[i]
        });
        requestObjects.push({
            url: requestUrl,
            options: {
                type: "POST",
                data: requestData,
                processData: false,
                headers: {
                    "Content-Type": "application/json"
                },
                success: J.proxy(writeItemsSuccessCallback, successContext)
            }
        });
    }
    return library.sequentialRequests(requestObjects).then(function(sequentialPromises) {
        Z.debug("Done with writeItems sequentialRequests promise", 3);
        return returnItems;
    });
};

Zotero.Items.prototype.writeNewUnsyncedItems = function() {
    var items = this;
    var library = items.owningLibrary;
    var urlConfig = {
        target: "items",
        libraryType: library.libraryType,
        libraryID: library.libraryID
    };
    var writeUrl = Zotero.ajax.apiRequestUrl(urlConfig) + Zotero.ajax.apiQueryString(urlConfig);
    var writeData = {};
    writeData.items = [];
    for (var i = 0; i < items.newUnsyncedItems.length; i++) {
        writeData.items.push(items.newUnsyncedItems[i].apiObj);
    }
    return Zotero.ajaxRequest(writeUrl, "POST", {
        data: writeData
    }).then(function(response) {
        if (response.jqxhr.status !== 200) {} else {
            var updatedVersion = response.jqxhr.getResponseHeader("Last-Modified-Version");
            if (typeof response.data !== "object") {}
            var failedIndices = {};
            if (response.data.hasOwnProperty("success")) {
                J.each(response.data.success, function(key, val) {
                    var index = parseInt(key, 10);
                    var objectKey = val;
                    var item = items.newUnsyncedItems[index];
                    item.updateItemKey(objectKey);
                    item.itemVersion = updatedVersion;
                    item.synced = true;
                    items.addItem(item);
                });
            }
            if (response.data.hasOwnProperty("unchanged")) {
                J.each(response.data.unchanged, function(key, val) {});
            }
            if (response.data.hasOwnProperty("failed")) {
                J.each(response.data.failed, function(key, val) {
                    failedIndices[key] = true;
                    Z.debug("ItemWrite failed: " + val.key + " : http " + val.code + " : " + val.message, 1);
                });
            }
            var newnewUnsyncedItems = [];
            J.each(items.newUnsyncedItems, function(i, v) {
                if (failedIndices.hasOwnProperty(i)) {
                    newnewUnsyncedItems.push(v);
                }
            });
            items.newUnsyncedItems = newnewUnsyncedItems;
        }
    });
};

Zotero.Tags = function(feed) {
    this.instance = "Zotero.Tags";
    this.tagsVersion = 0;
    this.syncState = {
        earliestVersion: null,
        latestVersion: null
    };
    this.displayTagsArray = [];
    this.displayTagsUrl = "";
    this.tagObjects = {};
    this.tagsArray = [];
    this.loaded = false;
    if (typeof feed != "undefined") {
        this.addTagsFromFeed(feed);
    }
};

Zotero.Tags.prototype.dump = function() {
    var dump = {};
    dump.tagsVersion = this.tagsVersion;
    dump.tagsArray = [];
    for (var i = 0; i < this.tagsArray.length; i++) {
        dump.tagsArray.push(this.tagsArray[i].dump());
    }
    dump.displayTagsUrl = this.displayTagsUrl;
    return dump;
};

Zotero.Tags.prototype.loadDump = function(dump) {
    this.tagsVersion = dump.tagsVersion;
    this.displayTagsUrl = dump.displayTagsUrl;
    for (var i = 0; i < dump.tagsArray.length; i++) {
        var tag = new Zotero.Tag;
        tag.loadDump(dump.tagsArray[i]);
        this.addTag(tag);
    }
    this.updateSecondaryData();
    return this;
};

Zotero.Tags.prototype.addTag = function(tag) {
    this.tagObjects[tag.title] = tag;
    this.tagsArray.push(tag);
    if (this.owningLibrary) {
        tag.associateWithLibrary(this.owningLibrary);
    }
};

Zotero.Tags.prototype.getTag = function(tagname) {
    var tags = this;
    if (tags.tagObjects.hasOwnProperty(tagname)) {
        return this.tagObjects[tagname];
    }
    return null;
};

Zotero.Tags.prototype.removeTag = function(tagname) {
    var tags = this;
    delete tags.tagObjects[tagname];
    tags.updateSecondaryData();
};

Zotero.Tags.prototype.removeTags = function(tagnames) {
    var tags = this;
    J.each(tagnames, function(i, tagname) {
        delete tags.tagObjects[tagname];
    });
    tags.updateSecondaryData();
};

Zotero.Tags.prototype.plainTagsList = function(tagsArray) {
    Z.debug("Zotero.Tags.plainTagsList", 3);
    var plainList = [];
    J.each(tagsArray, function(index, element) {
        plainList.push(element.title);
    });
    return plainList;
};

Zotero.Tags.prototype.clear = function() {
    Z.debug("Zotero.Tags.clear", 3);
    this.tagsVersion = 0;
    this.syncState.earliestVersion = null;
    this.syncState.latestVersion = null;
    this.displayTagsArray = [];
    this.displayTagsUrl = "";
    this.tagObjects = {};
    this.tagsArray = [];
};

Zotero.Tags.prototype.updateSecondaryData = function() {
    Z.debug("Zotero.Tags.updateSecondaryData", 3);
    var tags = this;
    tags.tagsArray = [];
    J.each(tags.tagObjects, function(key, val) {
        tags.tagsArray.push(val);
    });
    tags.tagsArray.sort(Zotero.Library.prototype.sortByTitleCompare);
    var plainList = tags.plainTagsList(tags.tagsArray);
    plainList.sort(Zotero.Library.prototype.sortLower);
    tags.plainList = plainList;
};

Zotero.Tags.prototype.addTagsFromFeed = function(feed) {
    Z.debug("Zotero.Tags.addTagsFromFeed", 3);
    var tags = this;
    var tagsAdded = [];
    feed.entries.each(function(index, entry) {
        var tag = new Zotero.Tag(J(entry));
        tags.addTag(tag);
        tagsAdded.push(tag);
    });
    return tagsAdded;
};

Zotero.Groups = function(feed) {
    this.instance = "Zotero.Groups";
    this.groupsArray = [];
};

Zotero.Groups.prototype.sortByTitleCompare = function(a, b) {
    Z.debug("compare by key: " + a + " < " + b + " ?", 4);
    if (a.title.toLowerCase() == b.title.toLowerCase()) {
        return 0;
    }
    if (a.title.toLowerCase() < b.title.toLowerCase()) {
        return -1;
    }
    return 1;
};

Zotero.Groups.prototype.fetchGroup = function(groupID, apikey) {};

Zotero.Groups.prototype.addGroupsFromFeed = function(groupsFeed) {
    var groups = this;
    var groupsAdded = [];
    groupsFeed.entries.each(function(index, entry) {
        var group = new Zotero.Group(J(entry));
        groups.groupsArray.push(group);
        groupsAdded.push(group);
    });
    return groupsAdded;
};

Zotero.Groups.prototype.fetchUserGroups = function(userID, apikey) {
    var groups = this;
    var aparams = {
        target: "userGroups",
        libraryType: "user",
        libraryID: userID,
        content: "json",
        order: "title"
    };
    if (apikey) {
        aparams["key"] = apikey;
    } else {
        aparams["key"] = groups.owningLibrary._apiKey;
    }
    return Zotero.ajaxRequest(aparams).then(function(response) {
        Z.debug("fetchUserGroups proxied callback", 3);
        var groupsfeed = new Zotero.Feed(response.data, response.jqxhr);
        fetchedGroups = groups.addGroupsFromFeed(groupsfeed);
        return fetchedGroups;
    });
};

Zotero.Searches = function() {
    this.instance = "Zotero.Searches";
    this.searchObjects = {};
    this.syncState = {
        earliestVersion: null,
        latestVersion: null
    };
};

Zotero.Deleted = function(data) {
    this.instance = "Zotero.Deleted";
    if (typeof data === "string") {
        this.deletedData = JSON.parse(data);
    } else {
        this.deletedData = data;
    }
    this.deletedVersion = null;
    this.newerVersion = null;
};

Zotero.Collection = function(entryEl) {
    this.instance = "Zotero.Collection";
    this.libraryUrlIdentifier = "";
    this.itemKeys = false;
    this.collectionVersion = 0;
    this.synced = false;
    this.pristine = null;
    this.apiObj = {
        name: "",
        collectionKey: "",
        parentCollection: false,
        collectionVersion: 0,
        relations: {}
    };
    this.children = [];
    if (typeof entryEl != "undefined") {
        this.parseXmlCollection(entryEl);
    }
};

Zotero.Collection.prototype = new Zotero.Entry;

Zotero.Collection.prototype.instance = "Zotero.Collection";

Zotero.Collection.prototype.updateCollectionKey = function(collectionKey) {
    var collection = this;
    collection.collectionKey = collectionKey;
    collection.apiObj.collectionKey = collectionKey;
    return collection;
};

Zotero.Collection.prototype.dump = function() {
    Zotero.debug("Zotero.Collection.dump", 4);
    var collection = this;
    var dump = collection.dumpEntry();
    var dumpProperties = [ "apiObj", "pristine", "collectionKey", "collectionVersion", "synced", "numItems", "numCollections", "topLevel", "websiteCollectionLink", "hasChildren", "itemKeys" ];
    for (var i = 0; i < dumpProperties.length; i++) {
        dump[dumpProperties[i]] = collection[dumpProperties[i]];
    }
    return dump;
};

Zotero.Collection.prototype.loadDump = function(dump) {
    Zotero.debug("Zotero.Collection.loaddump", 4);
    var collection = this;
    collection.loadDumpEntry(dump);
    var dumpProperties = [ "apiObj", "pristine", "collectionKey", "collectionVersion", "synced", "numItems", "numCollections", "topLevel", "websiteCollectionLink", "hasChildren", "itemKeys" ];
    for (var i = 0; i < dumpProperties.length; i++) {
        collection[dumpProperties[i]] = dump[dumpProperties[i]];
    }
    collection.initSecondaryData();
    return collection;
};

Zotero.Collection.prototype.parseXmlCollection = function(cel) {
    var collection = this;
    collection.parseXmlEntry(cel);
    collection.name = cel.find("title").text();
    collection.collectionKey = cel.find("zapi\\:key, key").text();
    collection.numItems = parseInt(cel.find("zapi\\:numItems, numItems").text(), 10);
    collection.numCollections = parseInt(cel.find("zapi\\:numCollections, numCollections").text(), 10);
    collection.dateAdded = collection.published;
    collection.dateModified = collection.updated;
    collection.parentCollection = false;
    collection.topLevel = true;
    var contentEl = cel.find("content").first();
    if (contentEl) {
        collection.pristine = JSON.parse(cel.find("content").first().text());
        collection.apiObj = JSON.parse(cel.find("content").first().text());
        collection.synced = true;
    }
    collection.initSecondaryData();
};

Zotero.Collection.prototype.initSecondaryData = function() {
    var collection = this;
    collection["name"] = collection.apiObj["name"];
    collection["parentCollection"] = collection.apiObj["parentCollection"];
    if (collection["parentCollection"]) {
        collection.topLevel = false;
    }
    collection.collectionKey = collection.apiObj.collectionKey;
    collection.collectionVersion = collection.apiObj.collectionVersion;
    collection.relations = collection.apiObj.relations;
    if (Zotero.config.libraryPathString) {
        collection.websiteCollectionLink = Zotero.config.libraryPathString + "/collectionKey/" + collection.collectionKey;
    } else {
        collection.websiteCollectionLink = "";
    }
    collection.hasChildren = collection.numCollections ? true : false;
};

Zotero.Collection.prototype.nestCollection = function(collectionsObject) {
    Z.debug("Zotero.Collection.nestCollection", 4);
    var collection = this;
    if (collection.parentCollection !== false) {
        var parentKey = collection.get("parentCollection");
        if (typeof collectionsObject[parentKey] !== "undefined") {
            var parentOb = collectionsObject[parentKey];
            parentOb.children.push(collection);
            parentOb.hasChildren = true;
            collection.topLevel = false;
            return true;
        }
    }
    return false;
};

Zotero.Collection.prototype.addItems = function(itemKeys) {
    Z.debug("Zotero.Collection.addItems", 3);
    var collection = this;
    Z.debug(itemKeys, 3);
    var config = {
        target: "items",
        libraryType: collection.libraryType,
        libraryID: collection.libraryID,
        collectionKey: collection.collectionKey,
        content: "json"
    };
    var requestUrl = Zotero.ajax.apiRequestUrl(config) + Zotero.ajax.apiQueryString(config);
    var requestData = itemKeys.join(" ");
    return Zotero.ajaxRequest(requestUrl, "POST", {
        data: requestData,
        processData: false
    });
};

Zotero.Collection.prototype.getMemberItemKeys = function() {
    Z.debug("Zotero.Collection.getMemberItemKeys", 3);
    var collection = this;
    var config = {
        target: "items",
        libraryType: collection.libraryType,
        libraryID: collection.libraryID,
        collectionKey: collection.collectionKey,
        format: "keys"
    };
    return Zotero.ajaxRequest(config, "GET", {
        processData: false
    }).then(function(response) {
        Z.debug("getMemberItemKeys proxied callback", 3);
        var result = response.data;
        var keys = J.trim(result).split(/[\s]+/);
        collection.itemKeys = keys;
        return keys;
    });
};

Zotero.Collection.prototype.removeItem = function(itemKey) {
    var collection = this;
    var config = {
        target: "item",
        libraryType: collection.libraryType,
        libraryID: collection.libraryID,
        collectionKey: collection.collectionKey,
        itemKey: itemKey
    };
    return Zotero.ajaxRequest(config, "DELETE", {
        processData: false,
        cache: false
    });
};

Zotero.Collection.prototype.update = function(name, parentKey) {
    var collection = this;
    if (!parentKey) parentKey = false;
    var config = {
        target: "collection",
        libraryType: collection.libraryType,
        libraryID: collection.libraryID,
        collectionKey: collection.collectionKey
    };
    var writeObject = collection.writeApiObj();
    var requestData = JSON.stringify(writeObject);
    return Zotero.ajaxRequest(config, "PUT", {
        data: requestData,
        processData: false,
        headers: {
            "If-Unmodified-Since-Version": collection.collectionVersion
        },
        cache: false
    });
};

Zotero.Collection.prototype.writeApiObj = function() {
    var collection = this;
    var writeObj = J.extend({}, collection.pristine, collection.apiObj);
    return writeObj;
};

Zotero.Collection.prototype.remove = function() {
    Z.debug("Zotero.Collection.delete", 3);
    var collection = this;
    var owningLibrary = collection.owningLibrary;
    var config = {
        target: "collection",
        libraryType: collection.libraryType,
        libraryID: collection.libraryID,
        collectionKey: collection.collectionKey
    };
    return Zotero.ajaxRequest(config, "DELETE", {
        processData: false,
        headers: {
            "If-Unmodified-Since-Version": collection.collectionVersion
        },
        cache: false
    }).then(function() {
        Z.debug("done deleting collection. remove local copy.", 3);
        owningLibrary.collections.removeLocalCollection(collection.collectionKey);
        owningLibrary.trigger("libraryCollectionsUpdated");
    });
};

Zotero.Collection.prototype.get = function(key) {
    var collection = this;
    switch (key) {
      case "title":
      case "name":
        return collection.apiObj.name || collection.title;
      case "collectionKey":
      case "key":
        return collection.apiObj.collectionKey || collection.collectionKey;
      case "collectionVersion":
      case "version":
        return collection.collectionVersion;
      case "parentCollection":
        return collection.apiObj.parentCollection;
    }
    if (key in collection.apiObj) {
        return collection.apiObj[key];
    } else if (collection.hasOwnProperty(key)) {
        return collection[key];
    }
    return null;
};

Zotero.Collection.prototype.set = function(key, val) {
    var collection = this;
    if (key in collection.apiObj) {}
    switch (key) {
      case "title":
      case "name":
        collection.name = val;
        collection.apiObj["name"] = val;
        collection.title = val;
        break;
      case "collectionKey":
      case "key":
        collection.collectionKey = val;
        collection.apiObj["collectionKey"] = val;
        break;
      case "parentCollection":
        collection.parentCollection = val;
        collection.apiObj["parentCollection"] = val;
        break;
      case "collectionVersion":
      case "version":
        collection.collectionVersion = val;
        collection.apiObj["collectionVersion"] = val;
        break;
    }
    if (collection.hasOwnProperty(key)) {
        collection[key] = val;
    }
};

Zotero.Item = function(entryEl) {
    this.instance = "Zotero.Item";
    this.itemVersion = 0;
    this.itemKey = "";
    this.synced = false;
    this.apiObj = {};
    this.pristine = null;
    this.dataFields = {};
    this.childItemKeys = [];
    this.writeErrors = [];
    this.itemContentTypes = [];
    this.itemContentBlocks = {};
    this.notes = [];
    this.tagstrings = [];
    if (typeof entryEl != "undefined") {
        this.parseXmlItem(entryEl);
    }
};

Zotero.Item.prototype = new Zotero.Entry;

Zotero.Item.prototype.dump = function() {
    var item = this;
    var dump = item.dumpEntry();
    var dumpProperties = [ "apiObj", "pristine", "itemKey", "itemVersion", "synced", "creatorSummary", "year", "parentItemKey", "numChildren" ];
    for (var i = 0; i < dumpProperties.length; i++) {
        dump[dumpProperties[i]] = item[dumpProperties[i]];
    }
    item.updateTagStrings();
    dump["tagstrings"] = item.tagstrings;
    return dump;
};

Zotero.Item.prototype.loadDump = function(dump) {
    var item = this;
    item.loadDumpEntry(dump);
    var dumpProperties = [ "apiObj", "pristine", "itemKey", "itemVersion", "synced", "creatorSummary", "year", "parentItemKey", "numChildren" ];
    for (var i = 0; i < dumpProperties.length; i++) {
        item[dumpProperties[i]] = dump[dumpProperties[i]];
    }
    item.numTags = item.apiObj.tags.length;
    item.itemType = item.apiObj.itemType;
    item.initSecondaryData();
    return item;
};

Zotero.Item.prototype.parseXmlItem = function(iel) {
    var item = this;
    item.parseXmlEntry(iel);
    item.itemKey = iel.find("zapi\\:key, key").text();
    item.itemType = iel.find("zapi\\:itemType, itemType").text();
    item.creatorSummary = iel.find("zapi\\:creatorSummary, creatorSummary").text();
    item.year = iel.find("zapi\\:year, year").text();
    item.numChildren = parseInt(iel.find("zapi\\:numChildren, numChildren").text(), 10);
    item.numTags = parseInt(iel.find("zapi\\:numTags, numChildren").text(), 10);
    if (isNaN(item.numChildren)) {
        item.numChildren = 0;
    }
    item.parentItemKey = false;
    var contentEl = iel.children("content");
    var subcontents = iel.find("zapi\\:subcontent, subcontent");
    if (subcontents.size() > 0) {
        for (var i = 0; i < subcontents.size(); i++) {
            var sc = J(subcontents.get(i));
            item.parseContentBlock(sc);
        }
    } else {
        item.parseContentBlock(contentEl);
    }
};

Zotero.Item.prototype.parseContentBlock = function(contentEl) {
    var item = this;
    var zapiType = contentEl.attr("zapi:type");
    var contentText = contentEl.text();
    item.itemContentTypes.push(zapiType);
    item.itemContentBlocks[zapiType] = contentText;
    switch (zapiType) {
      case "json":
        item.parseJsonItemContent(contentEl);
        break;
      case "bib":
        item.bibContent = contentText;
        item.parsedBibContent = true;
        break;
      case "html":
        item.parseXmlItemContent(contentEl);
        break;
    }
};

Zotero.Item.prototype.parseXmlItemContent = function(cel) {
    var item = this;
    var dataFields = {};
    cel.find("div > table").children("tr").each(function() {
        dataFields[J(this).attr("class")] = J(this).children("td").text();
    });
    item.dataFields = dataFields;
};

Zotero.Item.prototype.parseJsonItemContent = function(cel) {
    var item = this;
    if (typeof cel === "string") {
        item.apiObj = JSON.parse(cel);
        item.pristine = JSON.parse(cel);
    } else {
        item.apiObj = JSON.parse(cel.text());
        item.pristine = JSON.parse(cel.text());
    }
    item.initSecondaryData();
};

Zotero.Item.prototype.initSecondaryData = function() {
    var item = this;
    item.itemVersion = item.apiObj.itemVersion;
    item.parentItemKey = item.apiObj.parentItem;
    if (item.apiObj.itemType == "attachment") {
        item.mimeType = item.apiObj.contentType;
        item.translatedMimeType = Zotero.utils.translateMimeType(item.mimeType);
    }
    if ("linkMode" in item.apiObj) {
        item.linkMode = item.apiObj.linkMode;
    }
    item.creators = item.apiObj.creators;
    item.attachmentDownloadUrl = Zotero.url.attachmentDownloadUrl(item);
    item.synced = false;
    item.updateTagStrings();
};

Zotero.Item.prototype.updateTagStrings = function() {
    var item = this;
    var tagstrings = [];
    for (i = 0; i < item.apiObj.tags.length; i++) {
        tagstrings.push(item.apiObj.tags[i].tag);
    }
    item.tagstrings = tagstrings;
};

Zotero.Item.prototype.initEmpty = function(itemType, linkMode) {
    var item = this;
    return item.getItemTemplate(itemType, linkMode).then(function(template) {
        item.initEmptyFromTemplate(template);
        return item;
    });
};

Zotero.Item.prototype.initEmptyNote = function() {
    var item = this;
    item.itemVersion = 0;
    var noteTemplate = {
        itemType: "note",
        note: "",
        tags: [],
        collections: [],
        relations: {}
    };
    item.initEmptyFromTemplate(noteTemplate);
    return item;
};

Zotero.Item.prototype.initEmptyFromTemplate = function(template) {
    var item = this;
    item.itemVersion = 0;
    item.itemType = template.itemType;
    item.itemKey = "";
    item.pristine = J.extend({}, template);
    item.apiObj = template;
    item.initSecondaryData();
    return item;
};

Zotero.Item.prototype.updateObjectKey = function(objectKey) {
    return this.updateItemKey(objectKey);
};

Zotero.Item.prototype.updateItemKey = function(itemKey) {
    var item = this;
    item.itemKey = itemKey;
    item.apiObj.itemKey = itemKey;
    item.pristine.itemKey = itemKey;
    return item;
};

Zotero.Item.prototype.writeItem = function() {
    var item = this;
    if (!item.owningLibrary) {
        throw new Error("Item must be associated with a library");
    }
    return item.owningLibrary.items.writeItems([ item ]);
};

Zotero.Item.prototype.writeApiObj = function() {
    var item = this;
    if (item.apiObj.creators) {
        var newCreatorsArray = item.apiObj.creators.filter(function(c) {
            if (c.name || c.firstName || c.lastName) {
                return true;
            }
            return false;
        });
        item.apiObj.creators = newCreatorsArray;
    }
    var writeApiObj = J.extend({}, item.pristine, item.apiObj);
    return writeApiObj;
};

Zotero.Item.prototype.createChildNotes = function(notes) {
    var item = this;
    var childItems = [];
    var childItemPromises = [];
    var initDone = J.proxy(function(templateItem) {
        childItems.push(templateItem);
    }, this);
    J.each(notes, function(ind, note) {
        var childItem = new Zotero.Item;
        var p = childItem.initEmpty("note").then(function(noteItem) {
            noteItem.set("note", note.note);
            noteItem.set("parentItem", item.itemKey);
            childItems.push(noteItem);
        });
        childItemPromises.push(p);
    });
    return Promise.all(childItemPromises).then(function() {
        return item.owningLibrary.writeItems(childItems);
    });
};

Zotero.Item.prototype.writePatch = function() {};

Zotero.Item.prototype.getChildren = function(library) {
    var item = this;
    Z.debug("Zotero.Item.getChildren", 3);
    return Promise.resolve().then(function() {
        if (!item.numChildren) {
            return [];
        }
        var config = {
            target: "children",
            libraryType: item.libraryType,
            libraryID: item.libraryID,
            itemKey: item.itemKey,
            content: "json"
        };
        return Zotero.ajaxRequest(config).then(function(response) {
            Z.debug("getChildren proxied callback", 4);
            var itemfeed = new Zotero.Feed(response.data, response.jqxhr);
            var items = library.items;
            var childItems = items.addItemsFromFeed(itemfeed);
            for (var i = childItems.length - 1; i >= 0; i--) {
                childItems[i].associateWithLibrary(library);
            }
            return childItems;
        });
    });
};

Zotero.Item.prototype.getItemTypes = function(locale) {
    Z.debug("Zotero.Item.prototype.getItemTypes", 3);
    if (!locale) {
        locale = "en-US";
    }
    locale = "en-US";
    var itemTypes = Zotero.cache.load({
        locale: locale,
        target: "itemTypes"
    });
    if (itemTypes) {
        Z.debug("have itemTypes in localStorage", 3);
        Zotero.Item.prototype.itemTypes = itemTypes;
        return;
    }
    var query = Zotero.ajax.apiQueryString({
        locale: locale
    });
    var url = Zotero.config.baseApiUrl + "/itemTypes" + query;
    J.getJSON(Zotero.ajax.proxyWrapper(url, "GET"), {}, function(data, textStatus, XMLHttpRequest) {
        Z.debug("got itemTypes response", 3);
        Z.debug(data, 4);
        Zotero.Item.prototype.itemTypes = data;
        Zotero.cache.save({
            locale: locale,
            target: "itemTypes"
        }, Zotero.Item.prototype.itemTypes);
    });
};

Zotero.Item.prototype.getItemFields = function(locale) {
    Z.debug("Zotero.Item.prototype.getItemFields", 3);
    if (!locale) {
        locale = "en-US";
    }
    locale = "en-US";
    var itemFields = Zotero.cache.load({
        locale: locale,
        target: "itemFields"
    });
    if (itemFields) {
        Z.debug("have itemFields in localStorage", 3);
        Zotero.Item.prototype.itemFields = itemFields;
        J.each(Zotero.Item.prototype.itemFields, function(ind, val) {
            Zotero.localizations.fieldMap[val.field] = val.localized;
        });
        return;
    }
    var query = Zotero.ajax.apiQueryString({
        locale: locale
    });
    var requestUrl = Zotero.config.baseApiUrl + "/itemFields" + query;
    J.getJSON(Zotero.ajax.proxyWrapper(requestUrl), {}, function(data, textStatus, XMLHttpRequest) {
        Z.debug("got itemTypes response", 4);
        Zotero.Item.prototype.itemFields = data;
        Zotero.cache.save({
            locale: locale,
            target: "itemFields"
        }, data);
        J.each(Zotero.Item.prototype.itemFields, function(ind, val) {
            Zotero.localizations.fieldMap[val.field] = val.localized;
        });
    });
};

Zotero.Item.prototype.getItemTemplate = function(itemType, linkMode) {
    Z.debug("Zotero.Item.prototype.getItemTemplate", 3);
    if (typeof itemType == "undefined") itemType = "document";
    if (itemType == "attachment" && typeof linkMode == "undefined") {
        throw new Error("attachment template requested with no linkMode");
    }
    if (typeof linkMode == "undefined") {
        linkMode = "";
    }
    var query = Zotero.ajax.apiQueryString({
        itemType: itemType,
        linkMode: linkMode
    });
    var requestUrl = Zotero.config.baseApiUrl + "/items/new" + query;
    var cacheConfig = {
        itemType: itemType,
        target: "itemTemplate"
    };
    var itemTemplate = Zotero.cache.load(cacheConfig);
    if (itemTemplate) {
        Z.debug("have itemTemplate in localStorage", 3);
        var template = itemTemplate;
        return Promise.resolve(template);
    }
    return Zotero.ajaxRequest(requestUrl, "GET", {
        dataType: "json"
    }).then(function(response) {
        Z.debug("got itemTemplate response", 3);
        Zotero.cache.save(cacheConfig, response.data);
        return response.data;
    });
};

Zotero.Item.prototype.getUploadAuthorization = function(fileinfo) {
    Z.debug("Zotero.Item.getUploadAuthorization", 3);
    var item = this;
    var config = {
        target: "item",
        targetModifier: "file",
        libraryType: item.libraryType,
        libraryID: item.libraryID,
        itemKey: item.itemKey
    };
    var headers = {};
    var oldmd5 = item.get("md5");
    if (oldmd5) {
        headers["If-Match"] = oldmd5;
    } else {
        headers["If-None-Match"] = "*";
    }
    return Zotero.ajaxRequest(config, "POST", {
        processData: true,
        data: fileinfo,
        headers: headers
    });
};

Zotero.Item.prototype.registerUpload = function(uploadKey) {
    Z.debug("Zotero.Item.registerUpload", 3);
    var item = this;
    var config = {
        target: "item",
        targetModifier: "file",
        libraryType: item.libraryType,
        libraryID: item.libraryID,
        itemKey: item.itemKey
    };
    var headers = {};
    var oldmd5 = item.get("md5");
    if (oldmd5) {
        headers["If-Match"] = oldmd5;
    } else {
        headers["If-None-Match"] = "*";
    }
    return Zotero.ajaxRequest(config, "POST", {
        processData: true,
        data: {
            upload: uploadKey
        },
        headers: headers
    });
};

Zotero.Item.prototype.fullUpload = function(file) {};

Zotero.Item.prototype.creatorTypes = {};

Zotero.Item.prototype.getCreatorTypes = function(itemType) {
    Z.debug("Zotero.Item.prototype.getCreatorTypes: " + itemType, 3);
    if (!itemType) {
        itemType = "document";
    }
    var creatorTypes = Zotero.cache.load({
        target: "creatorTypes"
    });
    if (creatorTypes) {
        Z.debug("have creatorTypes in localStorage", 3);
        Zotero.Item.prototype.creatorTypes = creatorTypes;
    }
    if (Zotero.Item.prototype.creatorTypes[itemType]) {
        Z.debug("creatorTypes of requested itemType available in localStorage", 3);
        Z.debug(Zotero.Item.prototype.creatorTypes, 4);
        return Promise.resolve(Zotero.Item.prototype.creatorTypes[itemType]);
    } else {
        Z.debug("sending request for creatorTypes", 3);
        var query = Zotero.ajax.apiQueryString({
            itemType: itemType
        });
        var requestUrl = Zotero.config.baseApiUrl + "/itemTypeCreatorTypes" + query;
        return Zotero.ajaxRequest(requestUrl, "GET", {
            dataType: "json"
        }).then(function(response) {
            Z.debug("got creatorTypes response", 4);
            Zotero.Item.prototype.creatorTypes[itemType] = response.data;
            Zotero.cache.save({
                target: "creatorTypes"
            }, Zotero.Item.prototype.creatorTypes);
            return Zotero.Item.prototype.creatorTypes[itemType];
        });
    }
};

Zotero.Item.prototype.getCreatorFields = function(locale) {
    Z.debug("Zotero.Item.prototype.getCreatorFields", 3);
    var creatorFields = Zotero.cache.load({
        target: "creatorFields"
    });
    if (creatorFields) {
        Z.debug("have creatorFields in localStorage", 3);
        Zotero.Item.prototype.creatorFields = creatorFields;
        return Promise.resolve(creatorFields);
    }
    var requestUrl = Zotero.config.baseApiUrl + "/creatorFields";
    return Zotero.ajaxRequest(requestUrl, "GET", {
        dataType: "json"
    }).then(function(response) {
        Z.debug("got itemTypes response", 4);
        Zotero.Item.prototype.creatorFields = response.data;
        Zotero.cache.save({
            target: "creatorFields"
        }, response.data);
    });
};

Zotero.Item.prototype.addItemTypes = function(itemTypes, locale) {};

Zotero.Item.prototype.addItemFields = function(itemType, itemFields) {};

Zotero.Item.prototype.addCreatorTypes = function(itemType, creatorTypes) {};

Zotero.Item.prototype.addCreatorFields = function(itemType, creatorFields) {};

Zotero.Item.prototype.addItemTemplates = function(templates) {};

Zotero.Item.prototype.itemTypeImageClass = function() {
    var item = this;
    if (item.itemType == "attachment") {
        switch (item.linkMode) {
          case "imported_file":
            if (item.translatedMimeType == "pdf") {
                return item.itemTypeImageSrc["attachmentPdf"];
            }
            return item.itemTypeImageSrc["attachmentFile"];
          case "imported_url":
            if (item.translatedMimeType == "pdf") {
                return item.itemTypeImageSrc["attachmentPdf"];
            }
            return item.itemTypeImageSrc["attachmentSnapshot"];
          case "linked_file":
            return item.itemTypeImageSrc["attachmentLink"];
          case "linked_url":
            return item.itemTypeImageSrc["attachmentWeblink"];
          default:
            return item.itemTypeImageSrc["attachment"];
        }
    } else {
        return item.itemType;
    }
};

Zotero.Item.prototype.get = function(key) {
    var item = this;
    switch (key) {
      case "title":
        return item.title;
      case "creatorSummary":
        return item.creatorSummary;
      case "year":
        return item.year;
    }
    if (key in item.apiObj) {
        return item.apiObj[key];
    } else if (key in item.dataFields) {
        return item.dataFields[key];
    } else if (item.hasOwnProperty(key)) {
        return item[key];
    }
    return null;
};

Zotero.Item.prototype.set = function(key, val) {
    var item = this;
    if (key in item.apiObj) {
        item.apiObj[key] = val;
    }
    switch (key) {
      case "itemKey":
        item.itemKey = val;
        item.apiObj.itemKey = val;
        break;
      case "itemVersion":
        item.itemVersion = val;
        item.apiObj.itemVersion = val;
        break;
      case "title":
        item.title = val;
        break;
      case "itemType":
        item.itemType = val;
        break;
      case "linkMode":
        break;
      case "deleted":
        item.apiObj.deleted = val;
        break;
      case "parentItem":
      case "parentItemKey":
        if (val === "") {
            val = false;
        }
        item.parentItemKey = val;
        item.apiObj.parentItem = val;
        break;
    }
    return item;
};

Zotero.Item.prototype.setParent = function(parentItemKey) {
    var item = this;
    if (typeof parentItemKey != "string" && parentItemKey.hasOwnProperty("instance") && parentItemKey.instance == "Zotero.Item") {
        parentItemKey = parentItemKey.itemKey;
    }
    item.set("parentItem", parentItemKey);
    return item;
};

Zotero.Item.prototype.addToCollection = function(collectionKey) {
    var item = this;
    if (typeof collectionKey != "string") {
        if (collectionKey.hasOwnProperty("collectionKey")) {
            collectionKey = collectionKey.collectionKey;
        }
    }
    if (J.inArray(collectionKey, item.apiObj.collections) === -1) {
        item.apiObj.collections.push(collectionKey);
    }
    return;
};

Zotero.Item.prototype.removeFromCollection = function(collectionKey) {
    var item = this;
    if (typeof collectionKey != "string") {
        if (collectionKey.hasOwnProperty("collectionKey")) {
            collectionKey = collectionKey.collectionKey;
        }
    }
    var index = J.inArray(collectionKey, item.apiObj.collections);
    if (index != -1) {
        item.apiObj.collections.splice(index, 1);
    }
    return;
};

Zotero.Item.prototype.uploadChildAttachment = function(childItem, fileInfo, fileblob, progressCallback) {
    var item = this;
    if (!item.owningLibrary) {
        return Promise.reject(new Error("Item must be associated with a library"));
    }
    childItem.set("parentItem", item.itemKey);
    childItem.associateWithLibrary(item.owningLibrary);
    return childItem.writeItem().then(function(response) {
        item.numChildren++;
        return childItem.uploadFile(fileInfo, fileblob, progressCallback);
    }, function(response) {
        return {
            message: "Failure during attachmentItem write.",
            code: response.jqxhr.status,
            serverMessage: response.jqxhr.responseText
        };
    });
};

Zotero.Item.prototype.uploadFile = function(fileInfo, fileblob, progressCallback) {
    var item = this;
    var uploadAuthFileData = {
        md5: fileInfo.md5,
        filename: item.get("title"),
        filesize: fileInfo.filesize,
        mtime: fileInfo.mtime,
        contentType: fileInfo.contentType,
        params: 1
    };
    if (fileInfo.contentType === "") {
        uploadAuthFileData.contentType = "application/octet-stream";
    }
    return item.getUploadAuthorization(uploadAuthFileData).then(function(response) {
        Z.debug("uploadAuth callback", 3);
        var upAuthOb;
        if (typeof response.data == "string") {
            upAuthOb = JSON.parse(data);
        } else {
            upAuthOb = response.data;
        }
        if (upAuthOb.exists == 1) {
            return {
                message: "File Exists"
            };
        } else {
            return new Promise(function(resolve, reject) {
                var fullUpload = Zotero.file.uploadFile(upAuthOb, fileblob);
                fullUpload.onreadystatechange = J.proxy(function(e) {
                    Z.debug("fullupload readyState: " + fullUpload.readyState, 3);
                    Z.debug("fullupload status: " + fullUpload.status, 3);
                    if (fullUpload.readyState == 4) {
                        if (fullUpload.status == 201 || Zotero.config.CORSallowed === false) {
                            item.registerUpload(upAuthOb.uploadKey).then(function(response) {
                                resolve({
                                    message: "Upload Successful"
                                });
                            }, function(response) {
                                var failure = {
                                    message: "Failed registering upload."
                                };
                                if (response.jqxhr.status == 412) {
                                    failure.code = 412;
                                    failure.serverMessage = response.jqxhr.responseText;
                                }
                                reject(failure);
                            });
                        } else {
                            reject({
                                message: "Failure uploading file.",
                                code: jqxhr.status,
                                serverMessage: jqxhr.responseText
                            });
                        }
                    }
                }, this);
                fullUpload.upload.onprogress = function(e) {
                    if (typeof progressCallback == "function") {
                        progressCallback(e);
                    }
                };
            });
        }
    }, function(response) {
        return {
            message: "Failure during upload authorization.",
            code: response.jqxhr.status,
            serverMessage: response.jqxhr.responseText
        };
    });
};

Zotero.Item.prototype.cslItem = function() {
    var zoteroItem = this;
    var itemType = zoteroItem.get("itemType");
    var cslType = zoteroItem.cslTypeMap.hasOwnProperty(itemType) ? zoteroItem.cslTypeMap[itemType] : false;
    if (!cslType) cslType = "article";
    var ignoreURL = (zoteroItem.get("accessDate") || zoteroItem.get("url")) && itemType in {
        journalArticle: 1,
        newspaperArticle: 1,
        magazineArticle: 1
    } && zoteroItem.get("pages") && zoteroItem.citePaperJournalArticleURL;
    cslItem = {
        type: cslType
    };
    if (zoteroItem.owningLibrary) {
        cslItem["id"] = zoteroItem.owningLibrary.libraryID + "/" + zoteroItem.get("itemKey");
    } else {
        cslItem["id"] = Zotero.utils.getKey();
    }
    J.each(zoteroItem.cslFieldMap, function(variable, fields) {
        if (variable == "URL" && ignoreURL) return;
        J.each(fields, function(ind, field) {
            var value = zoteroItem.get(field);
            if (value) {
                cslItem[variable] = value;
            }
        });
    });
    var creators = zoteroItem.get("creators");
    J.each(creators, function(ind, creator) {
        var creatorType = creator["creatorType"];
        if (!creatorType) return;
        var nameObj;
        if (creator.hasOwnProperty("name")) {
            nameObj = {
                literal: creator["name"]
            };
        } else {
            nameObj = {
                family: creator["lastName"],
                given: creator["firstName"]
            };
        }
        if (cslItem.hasOwnProperty(creatorType)) {
            cslItem[creatorType].push(nameObj);
        } else {
            cslItem[creatorType] = [ nameObj ];
        }
    });
    J.each(zoteroItem.cslDateMap, function(key, val) {
        var date = zoteroItem.get(val);
        if (date) {
            cslItem[key] = {
                raw: date
            };
        }
    });
    return cslItem;
};

Zotero.Item.prototype.fieldMap = {
    itemType: "Item Type",
    title: "Title",
    dateAdded: "Date Added",
    dateModified: "Date Modified",
    source: "Source",
    notes: "Notes",
    tags: "Tags",
    attachments: "Attachments",
    related: "Related",
    url: "URL",
    rights: "Rights",
    series: "Series",
    volume: "Volume",
    issue: "Issue",
    edition: "Edition",
    place: "Place",
    publisher: "Publisher",
    pages: "Pages",
    ISBN: "ISBN",
    publicationTitle: "Publication",
    ISSN: "ISSN",
    date: "Date",
    year: "Year",
    section: "Section",
    callNumber: "Call Number",
    archive: "Archive",
    archiveLocation: "Loc. in Archive",
    libraryCatalog: "Library Catalog",
    distributor: "Distributor",
    extra: "Extra",
    journalAbbreviation: "Journal Abbr",
    DOI: "DOI",
    accessDate: "Accessed",
    seriesTitle: "Series Title",
    seriesText: "Series Text",
    seriesNumber: "Series Number",
    institution: "Institution",
    reportType: "Report Type",
    code: "Code",
    session: "Session",
    legislativeBody: "Legislative Body",
    history: "History",
    reporter: "Reporter",
    court: "Court",
    numberOfVolumes: "# of Volumes",
    committee: "Committee",
    assignee: "Assignee",
    patentNumber: "Patent Number",
    priorityNumbers: "Priority Numbers",
    issueDate: "Issue Date",
    references: "References",
    legalStatus: "Legal Status",
    codeNumber: "Code Number",
    artworkMedium: "Medium",
    number: "Number",
    artworkSize: "Artwork Size",
    repository: "Repository",
    videoRecordingType: "Recording Type",
    interviewMedium: "Medium",
    letterType: "Type",
    manuscriptType: "Type",
    mapType: "Type",
    scale: "Scale",
    thesisType: "Type",
    websiteType: "Website Type",
    audioRecordingType: "Recording Type",
    label: "Label",
    presentationType: "Type",
    meetingName: "Meeting Name",
    studio: "Studio",
    runningTime: "Running Time",
    network: "Network",
    postType: "Post Type",
    audioFileType: "File Type",
    version: "Version",
    system: "System",
    company: "Company",
    conferenceName: "Conference Name",
    encyclopediaTitle: "Encyclopedia Title",
    dictionaryTitle: "Dictionary Title",
    language: "Language",
    programmingLanguage: "Language",
    university: "University",
    abstractNote: "Abstract",
    websiteTitle: "Website Title",
    reportNumber: "Report Number",
    billNumber: "Bill Number",
    codeVolume: "Code Volume",
    codePages: "Code Pages",
    dateDecided: "Date Decided",
    reporterVolume: "Reporter Volume",
    firstPage: "First Page",
    documentNumber: "Document Number",
    dateEnacted: "Date Enacted",
    publicLawNumber: "Public Law Number",
    country: "Country",
    applicationNumber: "Application Number",
    forumTitle: "Forum/Listserv Title",
    episodeNumber: "Episode Number",
    blogTitle: "Blog Title",
    caseName: "Case Name",
    nameOfAct: "Name of Act",
    subject: "Subject",
    proceedingsTitle: "Proceedings Title",
    bookTitle: "Book Title",
    shortTitle: "Short Title",
    docketNumber: "Docket Number",
    numPages: "# of Pages",
    note: "Note",
    numChildren: "# of Children",
    addedBy: "Added By",
    creator: "Creator"
};

Zotero.localizations.fieldMap = Zotero.Item.prototype.fieldMap;

Zotero.Item.prototype.typeMap = {
    note: "Note",
    attachment: "Attachment",
    book: "Book",
    bookSection: "Book Section",
    journalArticle: "Journal Article",
    magazineArticle: "Magazine Article",
    newspaperArticle: "Newspaper Article",
    thesis: "Thesis",
    letter: "Letter",
    manuscript: "Manuscript",
    interview: "Interview",
    film: "Film",
    artwork: "Artwork",
    webpage: "Web Page",
    report: "Report",
    bill: "Bill",
    "case": "Case",
    hearing: "Hearing",
    patent: "Patent",
    statute: "Statute",
    email: "E-mail",
    map: "Map",
    blogPost: "Blog Post",
    instantMessage: "Instant Message",
    forumPost: "Forum Post",
    audioRecording: "Audio Recording",
    presentation: "Presentation",
    videoRecording: "Video Recording",
    tvBroadcast: "TV Broadcast",
    radioBroadcast: "Radio Broadcast",
    podcast: "Podcast",
    computerProgram: "Computer Program",
    conferencePaper: "Conference Paper",
    document: "Document",
    encyclopediaArticle: "Encyclopedia Article",
    dictionaryEntry: "Dictionary Entry"
};

Zotero.localizations.typeMap = Zotero.Item.prototype.typeMap;

Zotero.Item.prototype.creatorMap = {
    author: "Author",
    contributor: "Contributor",
    editor: "Editor",
    translator: "Translator",
    seriesEditor: "Series Editor",
    interviewee: "Interview With",
    interviewer: "Interviewer",
    director: "Director",
    scriptwriter: "Scriptwriter",
    producer: "Producer",
    castMember: "Cast Member",
    sponsor: "Sponsor",
    counsel: "Counsel",
    inventor: "Inventor",
    attorneyAgent: "Attorney/Agent",
    recipient: "Recipient",
    performer: "Performer",
    composer: "Composer",
    wordsBy: "Words By",
    cartographer: "Cartographer",
    programmer: "Programmer",
    reviewedAuthor: "Reviewed Author",
    artist: "Artist",
    commenter: "Commenter",
    presenter: "Presenter",
    guest: "Guest",
    podcaster: "Podcaster"
};

Zotero.Item.prototype.hideFields = [ "mimeType", "linkMode", "charset", "md5", "mtime", "itemVersion", "itemKey", "collections", "relations", "parentItem", "contentType", "filename", "tags" ];

Zotero.localizations.creatorMap = Zotero.Item.prototype.creatorMap;

Zotero.Item.prototype.itemTypeImageSrc = {
    note: "note",
    attachment: "attachment-pdf",
    attachmentPdf: "attachment-pdf",
    attachmentWeblink: "attachment-web-link",
    attachmentSnapshot: "attachment-snapshot",
    attachmentFile: "attachment-file",
    attachmentLink: "attachment-link",
    book: "book",
    bookSection: "book_open",
    journalArticle: "page_white_text",
    magazineArticle: "layout",
    newspaperArticle: "newspaper",
    thesis: "report",
    letter: "email_open",
    manuscript: "script",
    interview: "comments",
    film: "film",
    artwork: "picture",
    webpage: "page",
    report: "report",
    bill: "page_white",
    "case": "page_white",
    hearing: "page_white",
    patent: "page_white",
    statute: "page_white",
    email: "email",
    map: "map",
    blogPost: "layout",
    instantMessage: "page_white",
    forumPost: "page",
    audioRecording: "ipod",
    presentation: "page_white",
    videoRecording: "film",
    tvBroadcast: "television",
    radioBroadcast: "transmit",
    podcast: "ipod_cast",
    computerProgram: "page_white_code",
    conferencePaper: "treeitem-conferencePaper",
    document: "page_white",
    encyclopediaArticle: "page_white",
    dictionaryEntry: "page_white"
};

Zotero.Item.prototype.cslNameMap = {
    author: "author",
    editor: "editor",
    bookAuthor: "container-author",
    composer: "composer",
    interviewer: "interviewer",
    recipient: "recipient",
    seriesEditor: "collection-editor",
    translator: "translator"
};

Zotero.Item.prototype.cslFieldMap = {
    title: [ "title" ],
    "container-title": [ "publicationTitle", "reporter", "code" ],
    "collection-title": [ "seriesTitle", "series" ],
    "collection-number": [ "seriesNumber" ],
    publisher: [ "publisher", "distributor" ],
    "publisher-place": [ "place" ],
    authority: [ "court" ],
    page: [ "pages" ],
    volume: [ "volume" ],
    issue: [ "issue" ],
    "number-of-volumes": [ "numberOfVolumes" ],
    "number-of-pages": [ "numPages" ],
    edition: [ "edition" ],
    version: [ "version" ],
    section: [ "section" ],
    genre: [ "type", "artworkSize" ],
    medium: [ "medium", "system" ],
    archive: [ "archive" ],
    archive_location: [ "archiveLocation" ],
    event: [ "meetingName", "conferenceName" ],
    "event-place": [ "place" ],
    "abstract": [ "abstractNote" ],
    URL: [ "url" ],
    DOI: [ "DOI" ],
    ISBN: [ "ISBN" ],
    "call-number": [ "callNumber" ],
    note: [ "extra" ],
    number: [ "number" ],
    references: [ "history" ],
    shortTitle: [ "shortTitle" ],
    journalAbbreviation: [ "journalAbbreviation" ],
    language: [ "language" ]
};

Zotero.Item.prototype.cslDateMap = {
    issued: "date",
    accessed: "accessDate"
};

Zotero.Item.prototype.cslTypeMap = {
    book: "book",
    bookSection: "chapter",
    journalArticle: "article-journal",
    magazineArticle: "article-magazine",
    newspaperArticle: "article-newspaper",
    thesis: "thesis",
    encyclopediaArticle: "entry-encyclopedia",
    dictionaryEntry: "entry-dictionary",
    conferencePaper: "paper-conference",
    letter: "personal_communication",
    manuscript: "manuscript",
    interview: "interview",
    film: "motion_picture",
    artwork: "graphic",
    webpage: "webpage",
    report: "report",
    bill: "bill",
    "case": "legal_case",
    hearing: "bill",
    patent: "patent",
    statute: "bill",
    email: "personal_communication",
    map: "map",
    blogPost: "webpage",
    instantMessage: "personal_communication",
    forumPost: "webpage",
    audioRecording: "song",
    presentation: "speech",
    videoRecording: "motion_picture",
    tvBroadcast: "broadcast",
    radioBroadcast: "broadcast",
    podcast: "song",
    computerProgram: "book"
};

Zotero.Item.prototype.citePaperJournalArticleURL = false;

Zotero.Tag = function(entry) {
    this.instance = "Zotero.Tag";
    this.color = null;
    if (typeof entry != "undefined") {
        this.parseXmlTag(entry);
    }
};

Zotero.Tag.prototype = new Zotero.Entry;

Zotero.Tag.prototype.dump = function() {
    var tag = this;
    var dump = tag.dumpEntry();
    var dumpProperties = [ "numItems", "urlencodedtag", "tagVersion", "tagType", "tag" ];
    for (var i = 0; i < dumpProperties.length; i++) {
        dump[dumpProperties[i]] = tag[dumpProperties[i]];
    }
    return dump;
};

Zotero.Tag.prototype.loadDump = function(dump) {
    var tag = this;
    tag.loadDumpEntry(dump);
    var dumpProperties = [ "numItems", "urlencodedtag", "tagVersion", "tagType", "tag" ];
    for (var i = 0; i < dumpProperties.length; i++) {
        tag[dumpProperties[i]] = dump[dumpProperties[i]];
    }
    tag.initSecondaryData();
    return tag;
};

Zotero.Tag.prototype.initSecondaryData = function() {};

Zotero.Tag.prototype.loadObject = function(ob) {
    var tag = this;
    tag.title = ob.title;
    tag.author = ob.author;
    tag.tagID = ob.tagID;
    tag.published = ob.published;
    tag.updated = ob.updated;
    tag.links = ob.links;
    tag.numItems = ob.numItems;
    tag.items = ob.items;
    tag.tagType = ob.tagType;
    tag.modified = ob.modified;
    tag.added = ob.added;
    tag.key = ob.key;
    tag.tag = ob.tag;
};

Zotero.Tag.prototype.parseXmlTag = function(tel) {
    var tag = this;
    tag.parseXmlEntry(tel);
    tag.numItems = tel.find("zapi\\:numItems, numItems").text();
    tag.urlencodedtag = encodeURIComponent(this.title);
    var contentEl = tel.find("content").first();
    tag.parseContentBlock(contentEl);
};

Zotero.Tag.prototype.parseContentBlock = function(contentEl) {
    var tag = this;
    var contentType = contentEl.attr("type");
    var contentText = contentEl.text();
    switch (contentType) {
      case "application/json":
        tag.parseJsonContent(contentEl);
        break;
    }
};

Zotero.Tag.prototype.parseJsonContent = function(cel) {
    var tag = this;
    if (typeof cel === "string") {
        tag.apiObj = JSON.parse(cel);
        tag.pristine = JSON.parse(cel);
    } else {
        tag.apiObj = JSON.parse(cel.text());
        tag.pristine = JSON.parse(cel.text());
    }
    tag.tagType = tag.apiObj["type"];
    tag.initSecondaryData();
};

Zotero.Tag.prototype.getLinkParams = function() {
    var selectedTags = Zotero.ajax.getUrlVar("tag");
    if (!J.isArray(selectedTags)) {
        selectedTags = [ selectedTags ];
    }
    var deparamed = Zotero.ajax.getUrlVars();
    var tagSelected = false;
    var selectedIndex = J.inArray(this.title, selectedTags);
    if (selectedIndex != -1) {
        tagSelected = true;
    }
    if (deparamed.hasOwnProperty("tag")) {
        if (J.isArray(deparamed.tag)) {
            if (!tagSelected) deparamed.tag.push(this.title); else {
                deparamed.tag.splice(selectedIndex, 1);
            }
        } else {
            if (!tagSelected) deparamed.tag = [ deparamed.tag, this.title ]; else deparamed.tag = [];
        }
    } else {
        deparamed.tag = this.title;
    }
    this.linktagsparams = deparamed;
    return deparamed;
};

Zotero.Search = function() {
    this.instance = "Zotero.Search";
    this.searchObject = {};
};

Zotero.Group = function(entryEl) {
    var group = this;
    group.instance = "Zotero.Group";
    if (typeof entryEl != "undefined") {
        this.parseXmlGroup(entryEl);
    }
};

Zotero.Group.prototype = new Zotero.Entry;

Zotero.Group.prototype.loadObject = function(ob) {
    var group = this;
    group.title = ob.title;
    group.author = ob.author;
    group.tagID = ob.tagID;
    group.published = ob.published;
    group.updated = ob.updated;
    group.links = ob.links;
    group.numItems = ob.numItems;
    group.items = ob.items;
    group.tagType = ob.tagType;
    group.modified = ob.modified;
    group.added = ob.added;
    group.key = ob.key;
};

Zotero.Group.prototype.parseXmlGroup = function(gel) {
    var group = this;
    group.parseXmlEntry(gel);
    group.numItems = gel.find("zapi\\:numItems, numItems").text();
    var contentEl = gel.children("content");
    var subcontents = gel.find("zapi\\:subcontent, subcontent");
    if (subcontents.size() > 0) {
        for (var i = 0; i < subcontents.size(); i++) {
            var sc = J(subcontents.get(i));
            group.parseContentBlock(sc);
        }
    } else {
        group.parseContentBlock(contentEl);
    }
    group.groupID = gel.find("zapi\\:groupID, groupID").text();
    group.numItems = gel.find("zapi\\:numItems, numItems").text();
};

Zotero.Group.prototype.parseContentBlock = function(contentEl) {
    var group = this;
    var contentType = contentEl.attr("type");
    var contentText = contentEl.text();
    switch (contentType) {
      case "json":
      case "application/json":
        group.parseJsonGroupContent(contentEl);
        break;
    }
};

Zotero.Group.prototype.parseJsonGroupContent = function(cel) {
    var group = this;
    group.apiObj = JSON.parse(cel.text());
    group.pristine = JSON.parse(cel.text());
    group.etag = cel.attr("etag");
};

Zotero.Group.prototype.get = function(key) {
    var group = this;
    switch (key) {
      case "title":
        return group.title;
    }
    if (key in group.apiObj) {
        return group.apiObj[key];
    } else if (group.hasOwnProperty(key)) {
        return group[key];
    }
    return null;
};

Zotero.Group.prototype.isWritable = function(userID) {
    var group = this;
    switch (true) {
      case group.apiObj.owner == userID:
        return true;
      case group.apiObj.admins && group.apiObj.admins.indexOf(userID) != -1:
        return true;
      case group.apiObj.libraryEditing == "members" && group.apiObj.members && group.apiObj.members.indexOf(userID) != -1:
        return true;
      default:
        return false;
    }
};

Zotero.Group.prototype.typeMap = {
    Private: "Private",
    PublicOpen: "Public, Open Membership",
    PublicClosed: "Public, Closed Membership"
};

Zotero.Group.prototype.accessMap = {
    all: {
        members: "Anyone can view, only members can edit",
        admins: "Anyone can view, only admins can edit"
    },
    members: {
        members: "Only members can view and edit",
        admins: "Only members can view, only admins can edit"
    },
    admins: {
        members: "Only admins can view, only members can edit",
        admins: "Only admins can view and edit"
    }
};

Zotero.User = function() {
    this.instance = "Zotero.User";
};

Zotero.User.prototype = new Zotero.Entry;

Zotero.User.prototype.loadObject = function(ob) {
    this.title = ob.title;
    this.author = ob.author;
    this.tagID = ob.tagID;
    this.published = ob.published;
    this.updated = ob.updated;
    this.links = ob.links;
    this.numItems = ob.numItems;
    this.items = ob.items;
    this.tagType = ob.tagType;
    this.modified = ob.modified;
    this.added = ob.added;
    this.key = ob.key;
};

Zotero.User.prototype.parseXmlUser = function(tel) {
    this.parseXmlEntry(tel);
    var tagEl = tel.find("content>tag");
    if (tagEl.length !== 0) {
        this.tagKey = tagEl.attr("key");
        this.libraryID = tagEl.attr("libraryID");
        this.tagName = tagEl.attr("name");
        this.dateAdded = tagEl.attr("dateAdded");
        this.dateModified = tagEl.attr("dateModified");
    }
};

Zotero.utils = {
    randomString: function(len, chars) {
        if (!chars) {
            chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
        }
        if (!len) {
            len = 8;
        }
        var randomstring = "";
        for (var i = 0; i < len; i++) {
            var rnum = Math.floor(Math.random() * chars.length);
            randomstring += chars.substring(rnum, rnum + 1);
        }
        return randomstring;
    },
    getKey: function() {
        var baseString = "23456789ABCDEFGHIJKMNPQRSTUVWXZ";
        return Zotero.utils.randomString(8, baseString);
    },
    updateObjectsFromWriteResponse: function(objectsArray, responsexhr) {
        Z.debug("Zotero.utils.updateObjectsFromWriteResponse", 3);
        Z.debug("statusCode: " + responsexhr.status);
        Z.debug(responsexhr.responseText, 3);
        var data = JSON.parse(responsexhr.responseText);
        if (responsexhr.status == 200) {
            var newLastModifiedVersion = responsexhr.getResponseHeader("Last-Modified-Version");
            Z.debug("newLastModifiedVersion: " + newLastModifiedVersion, 3);
            if ("success" in data) {
                J.each(data.success, function(ind, key) {
                    var i = parseInt(ind, 10);
                    var object = objectsArray[i];
                    if (!object.hasOwnProperty("instance")) {
                        throw new Error("unrecognized instance type on write object");
                    }
                    switch (object.instance) {
                      case "Zotero.Item":
                        if (object.itemKey !== "" && object.itemKey !== key) {
                            throw new Error("itemKey mismatch in multi-write response");
                        }
                        if (object.itemKey === "") {
                            if (object.hasOwnProperty("instance") && object.instance == "Zotero.Item") {
                                object.updateItemKey(key);
                            }
                        }
                        object.set("itemVersion", newLastModifiedVersion);
                        object.synced = true;
                        object.writeFailure = false;
                        break;
                      case "Zotero.Collection":
                        if (object.collectionKey && object.collectionKey !== key) {
                            throw new Error("collectionKey mismatch in multi-write response");
                        }
                        if (!object.collectionKey) {
                            object.updateCollectionKey(key);
                        }
                        object.set("collectionVersion", newLastModifiedVersion);
                        object.synced = true;
                        object.writeFailure = false;
                        break;
                    }
                });
            }
            if ("failed" in data) {
                J.each(data.failed, function(ind, failure) {
                    var i = parseInt(ind, 10);
                    var object = objectsArray[i];
                    object.writeFailure = failure;
                });
            }
        } else if (responsexhr.status == 204) {
            objectsArray[0].synced = true;
        }
    },
    slugify: function(name) {
        var slug = J.trim(name);
        slug = slug.toLowerCase();
        slug = slug.replace(/[^a-z0-9 ._-]/g, "");
        slug = slug.replace(" ", "_", "g");
        return slug;
    },
    prependAutocomplete: function(pre, source) {
        Z.debug("Zotero.utils.prependAutocomplete", 3);
        Z.debug("prepend match: " + pre);
        var satisfy;
        if (!source) {
            Z.debug("source is not defined");
        }
        if (pre === "") {
            satisfy = source.slice(0);
            return satisfy;
        }
        var plen = pre.length;
        var plower = pre.toLowerCase();
        satisfy = J.map(source, function(n) {
            if (n.substr(0, plen).toLowerCase() == plower) {
                return n;
            } else {
                return null;
            }
        });
        return satisfy;
    },
    matchAnyAutocomplete: function(pre, source) {
        Z.debug("Zotero.utils.matchAnyAutocomplete", 3);
        Z.debug("matchAny match: " + pre);
        var satisfy;
        if (!source) {
            Z.debug("source is not defined");
        }
        if (pre === "") {
            satisfy = source.slice(0);
            return satisfy;
        }
        var plen = pre.length;
        var plower = pre.toLowerCase();
        satisfy = J.map(source, function(n) {
            if (n.toLowerCase().indexOf(plower) != -1) {
                return n;
            } else {
                return null;
            }
        });
        return satisfy;
    },
    libraryString: function(type, libraryID) {
        var lstring = "";
        if (type == "user") lstring = "u"; else if (type == "group") lstring = "g";
        lstring += libraryID;
        return lstring;
    },
    parseLibString: function(libraryString) {
        var type;
        var libraryID;
        if (libraryString.charAt(0) == "u") {
            type = "user";
        } else if (libraryString.charAt(0) == "g") {
            type = "group";
        } else {
            throw new Error("unexpected type character in libraryString");
        }
        libraryID = parseInt(libraryString.substring(1));
        return {
            libraryType: type,
            libraryID: libraryID
        };
    },
    stale: function(retrievedDate, lifetime) {
        var now = Date.now();
        var elapsed = now.getTime() - retrievedDate.getTime();
        if (elapsed / 6e4 > lifetime) {
            return true;
        }
        return false;
    },
    entityify: function(str) {
        var character = {
            "<": "&lt;",
            ">": "&gt;",
            "&": "&amp;",
            '"': "&quot;"
        };
        return str.replace(/[<>&"]/g, function(c) {
            return character[c];
        });
    },
    parseApiDate: function(datestr, date) {
        var re = /([0-9]+)-([0-9]+)-([0-9]+)T([0-9]+):([0-9]+):([0-9]+)Z/;
        var matches = re.exec(datestr);
        if (matches === null) {
            Z.debug("error parsing api date: " + datestr, 1);
            return null;
        } else {
            date = new Date(Date.UTC(matches[1], matches[2] - 1, matches[3], matches[4], matches[5], matches[6]));
            return date;
        }
        return date;
    },
    readCookie: function(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(";");
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == " ") c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    },
    compareObs: function(ob1, ob2, checkVars) {
        var loopOn = checkVars;
        var useIndex = false;
        var differences = [];
        if (checkVars === undefined) {
            loopOn = ob1;
            useIndex = true;
        }
        J.each(loopOn, function(index, Val) {
            var compindex = Val;
            if (useIndex) compindex = index;
            if (typeof ob1[index] == "object") {
                if (Zotero.utils.compareObs(ob1[compindex], ob2[compindex]).length) {
                    differences.push(compindex);
                }
            } else {
                if (ob1[compindex] != ob2[compindex]) {
                    differences.push(compindex);
                }
            }
        });
        return differences;
    },
    updateSyncState: function(container, version) {
        Z.debug("updateSyncState: " + version, 3);
        if (!container.hasOwnProperty("syncState")) {
            throw new Error("Attempt to update sync state of object with no syncState property");
        }
        if (container.syncState.earliestVersion === null) {
            container.syncState.earliestVersion = version;
        }
        if (container.syncState.latestVersion === null) {
            container.syncState.latestVersion = version;
        }
        if (version < container.syncState.earliestVersion) {
            container.syncState.earliestVersion = version;
        }
        if (version > container.syncState.latestVersion) {
            container.syncState.latestVersion = version;
        }
    },
    updateSyncedVersion: function(container, versionField) {
        if (container.syncState.earliestVersion !== null && container.syncState.earliestVersion == container.syncState.latestVersion) {
            container[versionField] = container.syncState.latestVersion;
            container.synced = true;
        } else if (container.syncState.earliestVersion !== null) {
            container[versionField] = container.syncState.earliestVersion;
        }
    },
    translateMimeType: function(mimeType) {
        switch (mimeType) {
          case "text/html":
            return "html";
          case "application/pdf":
          case "application/x-pdf":
          case "application/acrobat":
          case "applications/vnd.pdf":
          case "text/pdf":
          case "text/x-pdf":
            return "pdf";
          case "image/jpg":
          case "image/jpeg":
            return "jpg";
          case "image/gif":
            return "gif";
          case "application/msword":
          case "application/doc":
          case "application/vnd.msword":
          case "application/vnd.ms-word":
          case "application/winword":
          case "application/word":
          case "application/x-msw6":
          case "application/x-msword":
            return "doc";
          case "application/vnd.oasis.opendocument.text":
          case "application/x-vnd.oasis.opendocument.text":
            return "odt";
          case "video/flv":
          case "video/x-flv":
            return "flv";
          case "image/tif":
          case "image/tiff":
          case "image/tif":
          case "image/x-tif":
          case "image/tiff":
          case "image/x-tiff":
          case "application/tif":
          case "application/x-tif":
          case "application/tiff":
          case "application/x-tiff":
            return "tiff";
          case "application/zip":
          case "application/x-zip":
          case "application/x-zip-compressed":
          case "application/x-compress":
          case "application/x-compressed":
          case "multipart/x-zip":
            return "zip";
          case "video/quicktime":
          case "video/x-quicktime":
            return "mov";
          case "video/avi":
          case "video/msvideo":
          case "video/x-msvideo":
            return "avi";
          case "audio/wav":
          case "audio/x-wav":
          case "audio/wave":
            return "wav";
          case "audio/aiff":
          case "audio/x-aiff":
          case "sound/aiff":
            return "aiff";
          case "text/plain":
            return "plain text";
          case "application/rtf":
            return "rtf";
          default:
            return mimeType;
        }
    },
    getKeyPermissions: function(userID, key) {
        if (!userID) {
            return false;
        }
        if (!key) {
            return false;
        }
        var urlconfig = {
            target: "key",
            libraryType: "user",
            libraryID: userID,
            apiKey: key
        };
        var requestUrl = Zotero.ajax.apiRequestString(urlconfig);
        return Zotero.ajaxRequest(requestUrl).then(function(response) {
            var keyNode = J(response.data).find("key");
            var keyObject = Zotero.utils.parseKey(keyNode);
            return keyObject;
        });
    },
    parseKey: function(keyNode) {
        var key = [];
        var keyPerms = {
            library: "0",
            notes: "0",
            write: "0",
            groups: {}
        };
        var accessEls = keyNode.find("access");
        accessEls.each(function() {
            var access = J(this);
            if (access.attr("library")) {
                keyPerms["library"] = access.attr("library");
            }
            if (access.attr("notes")) {
                keyPerms["notes"] = access.attr("notes");
            }
            if (access.attr("group")) {
                var groupPermission = access.attr("write") == "1" ? "write" : "read";
                keyPerms["groups"][access.attr("group")] = groupPermission;
            } else if (access.attr("write")) {
                keyPerms["write"] = access.attr("write");
            }
        });
        return keyPerms;
    }
};

Zotero.url.itemHref = function(item) {
    var href = "";
    href += Zotero.config.libraryPathString + "/itemKey/" + item.itemKey;
    return href;
};

Zotero.url.attachmentDownloadLink = function(item) {
    var retString = "";
    if (item.links && item.links["enclosure"]) {
        var tail = item.links["enclosure"]["href"].substr(-4, 4);
        if (tail == "view") {
            retString += '<a href="' + Zotero.config.baseZoteroWebsiteUrl + Zotero.config.nonparsedBaseUrl + "/" + item.itemKey + "/file/view" + '">' + "View Snapshot</a>";
        } else {
            var enctype = Zotero.utils.translateMimeType(item.links["enclosure"].type);
            var enc = item.links["enclosure"];
            var filesize = parseInt(enc["length"], 10);
            var filesizeString = "" + filesize + " B";
            if (filesize > 1073741824) {
                filesizeString = "" + (filesize / 1073741824).toFixed(1) + " GB";
            } else if (filesize > 1048576) {
                filesizeString = "" + (filesize / 1048576).toFixed(1) + " MB";
            } else if (filesize > 1024) {
                filesizeString = "" + (filesize / 1024).toFixed(1) + " KB";
            }
            Z.debug(enctype, 3);
            retString += '<a href="' + Zotero.config.baseZoteroWebsiteUrl + Zotero.config.nonparsedBaseUrl + "/" + item.itemKey + "/file" + '">';
            if (enctype == "undefined" || enctype === "" || typeof enctype == "undefined") {
                retString += filesizeString + "</a>";
            } else {
                retString += enctype + ", " + filesizeString + "</a>";
            }
            return retString;
        }
    }
    return retString;
};

Zotero.url.attachmentDownloadUrl = function(item) {
    var retString = "";
    if (item.links && item.links["enclosure"]) {
        if (Zotero.config.directDownloads) {
            retString = Zotero.config.baseZoteroWebsiteUrl + Zotero.config.nonparsedBaseUrl + "/" + item.itemKey + "/file";
            var tail = item.links["enclosure"]["href"].substr(-4, 4);
            if (tail == "view") {
                retString += "/view";
            }
        } else {
            retString = Zotero.config.baseDownloadUrl + "?itemkey=" + item.itemKey;
        }
    } else if (item.linkMode == 2 || item.linkMode == 3) {
        if (item.apiObj["url"]) {
            retString = item.apiObj["url"];
        }
    }
    return retString;
};

Zotero.url.attachmentFileDetails = function(item) {
    if (!item.links["enclosure"]) return "";
    var enctype = Zotero.utils.translateMimeType(item.links["enclosure"].type);
    var enc = item.links["enclosure"];
    var filesizeString = "";
    if (enc["length"]) {
        var filesize = parseInt(enc["length"], 10);
        filesizeString = "" + filesize + " B";
        if (filesize > 1073741824) {
            filesizeString = "" + (filesize / 1073741824).toFixed(1) + " GB";
        } else if (filesize > 1048576) {
            filesizeString = "" + (filesize / 1048576).toFixed(1) + " MB";
        } else if (filesize > 1024) {
            filesizeString = "" + (filesize / 1024).toFixed(1) + " KB";
        }
        return "(" + enctype + ", " + filesizeString + ")";
    } else {
        return "(" + enctype + ")";
    }
};

Zotero.url.exportUrls = function(config) {
    Z.debug("Zotero.url.exportUrls", 3);
    var exportUrls = {};
    var exportConfig = {};
    J.each(Zotero.config.exportFormats, function(index, format) {
        exportConfig = J.extend(config, {
            format: format
        });
        exportUrls[format] = Zotero.ajax.apiRequestUrl(exportConfig) + Zotero.ajax.apiQueryString({
            format: format,
            limit: "25"
        });
    });
    return exportUrls;
};

Zotero.url.snapshotViewLink = function(item) {
    return Zotero.ajax.apiRequestUrl({
        target: "item",
        targetModifier: "viewsnapshot",
        libraryType: item.owningLibrary.libraryType,
        libraryID: item.owningLibrary.libraryID,
        itemKey: item.itemKey
    });
};

Zotero.url.relationUrl = function(libraryType, libraryID, itemKey) {
    return "http://zotero.org/" + libraryType + "s/" + libraryID + "/items/" + itemKey;
};

Zotero.file = {};

Zotero.file.getFileInfo = function(file, callback) {
    if (typeof FileReader != "function") {
        throw new Error("FileReader not supported");
    }
    var fileInfo = {};
    var reader = new FileReader;
    reader.onload = function(e) {
        Z.debug("Zotero.file.getFileInfo onloadFunc");
        var result = e.target.result;
        Zotero.debug(result);
        var spark = new SparkMD5;
        spark.appendBinary(result);
        fileInfo.md5 = spark.end();
        Z.debug("md5:" + fileInfo.md5, 4);
        fileInfo.filename = file.name;
        fileInfo.filesize = file.size;
        fileInfo.mtime = Date.now();
        fileInfo.contentType = file.type;
        fileInfo.reader = reader;
        callback(fileInfo);
    };
    reader.readAsBinaryString(file);
};

Zotero.file.uploadFile = function(uploadInfo, file) {
    Z.debug("Zotero.file.uploadFile", 3);
    Z.debug(uploadInfo, 4);
    var formData = new FormData;
    J.each(uploadInfo.params, function(index, val) {
        formData.append(index, val);
    });
    formData.append("file", file);
    var xhr = new XMLHttpRequest;
    xhr.open("POST", uploadInfo.url, true);
    xhr.send(formData);
    return xhr;
};

Zotero.Idb = {};

Zotero.Idb.Library = function(libraryString) {
    Z.debug("Zotero.Idb.Library", 3);
    Z.debug("Initializing Zotero IDB", 3);
    this.libraryString = libraryString;
    this.owningLibrary = null;
    this.initialized = false;
};

Zotero.Idb.Library.prototype.init = function() {
    var idbLibrary = this;
    return new Promise(function(resolve, reject) {
        var indexedDB = window.indexedDB;
        idbLibrary.indexedDB = indexedDB;
        Z.debug("requesting indexedDb from browser", 3);
        var db;
        var request = indexedDB.open("Zotero_" + idbLibrary.libraryString, 3);
        request.onerror = function(e) {
            Zotero.debug("ERROR OPENING INDEXED DB", 1);
            reject();
        };
        var upgradeCallback = function(event) {
            Z.debug("Zotero.Idb onupgradeneeded or onsuccess", 3);
            var oldVersion = event.oldVersion;
            Z.debug("oldVersion: " + event.oldVersion, 3);
            var db = event.target.result;
            idbLibrary.db = db;
            if (oldVersion < 2) {
                Z.debug("Existing object store names:", 3);
                Z.debug(JSON.stringify(db.objectStoreNames), 3);
                Z.debug("Deleting old object stores", 3);
                if (db.objectStoreNames["items"]) {
                    db.deleteObjectStore("items");
                }
                if (db.objectStoreNames["tags"]) {
                    db.deleteObjectStore("tags");
                }
                if (db.objectStoreNames["collections"]) {
                    db.deleteObjectStore("collections");
                }
                Z.debug("Existing object store names:", 3);
                Z.debug(JSON.stringify(db.objectStoreNames), 3);
                var itemStore = db.createObjectStore("items", {
                    keyPath: "itemKey"
                });
                var collectionStore = db.createObjectStore("collections", {
                    keyPath: "collectionKey"
                });
                var tagStore = db.createObjectStore("tags", {
                    keyPath: "title"
                });
                var fileStore = db.createObjectStore("files");
                Z.debug("itemStore index names:", 3);
                Z.debug(JSON.stringify(itemStore.indexNames), 3);
                Z.debug("collectionStore index names:", 3);
                Z.debug(JSON.stringify(collectionStore.indexNames), 3);
                Z.debug("tagStore index names:", 3);
                Z.debug(JSON.stringify(tagStore.indexNames), 3);
                J.each(Zotero.Item.prototype.fieldMap, function(key, val) {
                    Z.debug("Creating index on " + key, 3);
                    itemStore.createIndex(key, "apiObj." + key, {
                        unique: false
                    });
                });
                itemStore.createIndex("collectionKeys", "apiObj.collections", {
                    unique: false,
                    multiEntry: true
                });
                itemStore.createIndex("itemTagStrings", "tagstrings", {
                    unique: false,
                    multiEntry: true
                });
                itemStore.createIndex("parentItemKey", "parentItemKey", {
                    unique: false
                });
                itemStore.createIndex("libraryKey", "libraryKey", {
                    unique: false
                });
                itemStore.createIndex("deleted", "apiObj.deleted", {
                    unique: false
                });
                collectionStore.createIndex("name", "name", {
                    unique: false
                });
                collectionStore.createIndex("title", "title", {
                    unique: false
                });
                collectionStore.createIndex("collectionKey", "collectionKey", {
                    unique: false
                });
                collectionStore.createIndex("parentCollection", "parentCollection", {
                    unique: false
                });
                collectionStore.createIndex("libraryKey", "libraryKey", {
                    unique: false
                });
                tagStore.createIndex("name", "name", {
                    unique: false
                });
                tagStore.createIndex("title", "title", {
                    unique: false
                });
                tagStore.createIndex("libraryKey", "libraryKey", {
                    unique: false
                });
            }
        };
        request.onupgradeneeded = upgradeCallback;
        request.onsuccess = function() {
            Z.debug("IDB success", 3);
            idbLibrary.db = request.result;
            idbLibrary.initialized = true;
            resolve(idbLibrary);
        };
    });
};

Zotero.Idb.Library.prototype.deleteDB = function() {
    var idbLibrary = this;
    idbLibrary.db.close();
    return new Promise(function(resolve, reject) {
        var deleteRequest = idbLibrary.indexedDB.deleteDatabase("Zotero_" + idbLibrary.libraryString);
        deleteRequest.onerror = function() {
            Z.debug("Error deleting indexedDB", 1);
            reject();
        };
        deleteRequest.onsuccess = function() {
            Z.debug("Successfully deleted indexedDB", 1);
            resolve();
        };
    });
};

Zotero.Idb.Library.prototype.getObjectStore = function(store_name, mode) {
    var idbLibrary = this;
    var tx = idbLibrary.db.transaction(store_name, mode);
    return tx.objectStore(store_name);
};

Zotero.Idb.Library.prototype.clearObjectStore = function(store_name) {
    var idbLibrary = this;
    var store = getObjectStore(store_name, "readwrite");
    return new Promise(function(resolve, reject) {
        var req = store.clear();
        req.onsuccess = function(evt) {
            Z.debug("Store cleared", 3);
            resolve();
        };
        req.onerror = function(evt) {
            Z.debug("clearObjectStore:", evt.target.errorCode, 1);
            reject();
        };
    });
};

Zotero.Idb.Library.prototype.addItems = function(items) {
    var idbLibrary = this;
    return new Promise(function(resolve, reject) {
        var transaction = idbLibrary.db.transaction([ "items" ], "readwrite");
        transaction.oncomplete = function(event) {
            Zotero.debug("Add Items transaction completed.", 3);
            resolve();
        };
        transaction.onerror = function(event) {
            Zotero.debug("Add Items transaction failed.", 1);
            reject();
        };
        var itemStore = transaction.objectStore("items");
        var reqSuccess = function(event) {
            Zotero.debug("Added Item " + event.target.result, 4);
        };
        for (var i in items) {
            var request = itemStore.add(items[i].dump());
            request.onsuccess = reqSuccess;
        }
    });
};

Zotero.Idb.Library.prototype.updateItems = function(items) {
    Z.debug("Zotero.Idb.Library.updateItems", 3);
    var idbLibrary = this;
    return new Promise(function(resolve, reject) {
        if (!items) {
            var library = idbLibrary.owningLibrary;
            var itemKeys = Object.keys(library.items.itemObjects);
            items = [];
            var item;
            for (var ik in itemKeys) {
                item = library.items.getItem(itemKeys[ik]);
                if (item) {
                    items.push(item);
                }
            }
        }
        var transaction = idbLibrary.db.transaction([ "items" ], "readwrite");
        transaction.oncomplete = function(event) {
            Zotero.debug("Update Items transaction completed.", 3);
            resolve();
        };
        transaction.onerror = function(event) {
            Zotero.debug("Update Items transaction failed.", 1);
            reject();
        };
        var itemStore = transaction.objectStore("items");
        var reqSuccess = function(event) {
            Zotero.debug("Added/Updated Item " + event.target.result, 4);
        };
        for (var i in items) {
            var request = itemStore.put(items[i].dump());
            request.onsuccess = reqSuccess;
        }
    });
};

Zotero.Idb.Library.prototype.removeItems = function(items) {
    var idbLibrary = this;
    return new Promise(function(resolve, reject) {
        var transaction = idbLibrary.db.transaction([ "items" ], "readwrite");
        transaction.oncomplete = function(event) {
            Zotero.debug("Remove Items transaction completed.", 3);
            resolve();
        };
        transaction.onerror = function(event) {
            Zotero.debug("Remove Items transaction failed.", 1);
            reject();
        };
        var itemStore = transaction.objectStore("items");
        var reqSuccess = function(event) {
            Zotero.debug("Removed Item " + event.target.result, 4);
        };
        for (var i in items) {
            var request = itemStore.delete(items[i].itemKey);
            request.onsuccess = reqSuccess;
        }
    });
};

Zotero.Idb.Library.prototype.getItem = function(itemKey) {
    var idbLibrary = this;
    return new Promise(function(resolve, reject) {
        var success = function(event) {
            resolve(event.target.result);
        };
        idbLibrary.db.transaction("items").objectStore([ "items" ], "readonly").get(itemKey).onsuccess = success;
    });
};

Zotero.Idb.Library.prototype.getAllItems = function() {
    var idbLibrary = this;
    return new Promise(function(resolve, reject) {
        var items = [];
        var objectStore = idbLibrary.db.transaction([ "items" ], "readonly").objectStore("items");
        objectStore.openCursor().onsuccess = function(event) {
            var cursor = event.target.result;
            if (cursor) {
                items.push(cursor.value);
                cursor.continue();
            } else {
                Z.debug("resolving idb getAllItems with " + items.length + " items", 3);
                resolve(items);
            }
        };
    });
};

Zotero.Idb.Library.prototype.getOrderedItemKeys = function(field, order) {
    var idbLibrary = this;
    Z.debug("Zotero.Idb.getOrderedItemKeys", 3);
    return new Promise(function(resolve, reject) {
        var itemKeys = [];
        var objectStore = idbLibrary.db.transaction([ "items" ], "readonly").objectStore("items");
        var index = objectStore.index(field);
        if (!index) {
            throw new Error("Index for requested field '" + field + "'' not found");
        }
        var cursorDirection = "next";
        if (order == "desc") {
            cursorDirection = "prev";
        }
        var cursorRequest = index.openKeyCursor(null, cursorDirection);
        var itemKeys = [];
        cursorRequest.onsuccess = J.proxy(function(event) {
            var cursor = event.target.result;
            if (cursor) {
                itemKeys.push(cursor.primaryKey);
                cursor.continue();
            } else {
                Z.debug("No more cursor: done. Resolving deferred.", 3);
                resolve(itemKeys);
            }
        }, this);
        cursorRequest.onfailure = J.proxy(function(event) {
            reject();
        }, this);
    });
};

Zotero.Idb.Library.prototype.filterItems = function(field, value) {
    var idbLibrary = this;
    Z.debug("Zotero.Idb.filterItems " + field + " - " + value, 3);
    return new Promise(function(resolve, reject) {
        var itemKeys = [];
        var objectStore = idbLibrary.db.transaction([ "items" ], "readonly").objectStore("items");
        var index = objectStore.index(field);
        if (!index) {
            throw new Error("Index for requested field '" + field + "'' not found");
        }
        var cursorDirection = "next";
        var range = IDBKeyRange.only(value);
        var cursorRequest = index.openKeyCursor(range, cursorDirection);
        cursorRequest.onsuccess = J.proxy(function(event) {
            var cursor = event.target.result;
            if (cursor) {
                itemKeys.push(cursor.primaryKey);
                cursor.continue();
            } else {
                Z.debug("No more cursor: done. Resolving deferred.", 3);
                resolve(itemKeys);
            }
        }, this);
        cursorRequest.onfailure = J.proxy(function(event) {
            reject();
        }, this);
    });
};

Zotero.Idb.Library.prototype.addCollections = function(collections) {
    var idbLibrary = this;
    return new Promise(function(resolve, reject) {
        var transaction = idbLibrary.db.transaction([ "collections" ], "readwrite");
        transaction.oncomplete = function(event) {
            Zotero.debug("Add Collections transaction completed.", 3);
            resolve();
        };
        transaction.onerror = function(event) {
            Zotero.debug("Add Collections transaction failed.", 1);
            reject();
        };
        var collectionStore = transaction.objectStore("collections");
        var reqSuccess = function(event) {
            Zotero.debug("Added Collection " + event.target.result, 4);
        };
        for (var i in collections) {
            var request = collectionStore.add(collections[i].dump());
            request.onsuccess = reqSuccess;
        }
    });
};

Zotero.Idb.Library.prototype.updateCollections = function(collections) {
    Z.debug("Zotero.Idb.Library.updateCollections", 3);
    var idbLibrary = this;
    return new Promise(function(resolve, reject) {
        if (!collections) {
            collections = idbLibrary.owningLibrary.collections.collectionsArray;
        }
        var transaction = idbLibrary.db.transaction([ "collections" ], "readwrite");
        transaction.oncomplete = function(event) {
            Zotero.debug("Update Collections transaction completed.", 3);
            resolve();
        };
        transaction.onerror = function(event) {
            Zotero.debug("Update Collections transaction failed.", 1);
            reject();
        };
        var collectionStore = transaction.objectStore("collections");
        var reqSuccess = function(event) {
            Zotero.debug("Updated Collection " + event.target.result, 4);
        };
        for (var i in collections) {
            var request = collectionStore.put(collections[i].dump());
            request.onsuccess = reqSuccess;
        }
    });
};

Zotero.Idb.Library.prototype.removeCollections = function(collections) {
    var idbLibrary = this;
    return new Promise(function(resolve, reject) {
        var transaction = idbLibrary.db.transaction([ "collections" ], "readwrite");
        transaction.oncomplete = function(event) {
            Zotero.debug("Remove Collections transaction completed.", 3);
            resolve();
        };
        transaction.onerror = function(event) {
            Zotero.debug("Add Collections transaction failed.", 1);
            reject();
        };
        var collectionStore = transaction.objectStore("collections");
        var reqSuccess = function(event) {
            Zotero.debug("Removed Collection " + event.target.result, 4);
        };
        for (var i in collections) {
            var request = collectionStore.delete(collections[i].collectionKey);
            request.onsuccess = reqSuccess;
        }
    });
};

Zotero.Idb.Library.prototype.getAllCollections = function() {
    var idbLibrary = this;
    return new Promise(function(resolve, reject) {
        var collections = [];
        var objectStore = idbLibrary.db.transaction("collections").objectStore("collections");
        objectStore.openCursor().onsuccess = function(event) {
            var cursor = event.target.result;
            if (cursor) {
                collections.push(cursor.value);
                cursor.continue();
            } else {
                resolve(collections);
            }
        };
    });
};

Zotero.Idb.Library.prototype.addTags = function(tags) {
    var idbLibrary = this;
    return new Promise(function(resolve, reject) {
        var transaction = idbLibrary.db.transaction([ "tags" ], "readwrite");
        transaction.oncomplete = function(event) {
            Zotero.debug("Add Tags transaction completed.", 3);
            resolve();
        };
        transaction.onerror = function(event) {
            Zotero.debug("Add Tags transaction failed.", 1);
            reject();
        };
        var tagStore = transaction.objectStore("tags");
        var reqSuccess = function(event) {
            Zotero.debug("Added Tag " + event.target.result, 4);
        };
        for (var i in tags) {
            var request = tagStore.add(tags[i].dump());
            request.onsuccess = reqSuccess;
        }
    });
};

Zotero.Idb.Library.prototype.updateTags = function(tags) {
    Z.debug("Zotero.Idb.Library.updateTags", 3);
    var idbLibrary = this;
    return new Promise(function(resolve, reject) {
        if (!tags) {
            tags = idbLibrary.owningLibrary.tags.tagsArray;
        }
        var transaction = idbLibrary.db.transaction([ "tags" ], "readwrite");
        transaction.oncomplete = function(event) {
            Zotero.debug("Update Tags transaction completed.", 3);
            resolve();
        };
        transaction.onerror = function(event) {
            Zotero.debug("Update Tags transaction failed.", 1);
            reject();
        };
        var tagStore = transaction.objectStore("tags");
        var reqSuccess = function(event) {
            Zotero.debug("Updated Tag " + event.target.result, 4);
        };
        for (var i in tags) {
            var request = tagStore.put(tags[i].dump());
            request.onsuccess = reqSuccess;
        }
    });
};

Zotero.Idb.Library.prototype.getAllTags = function() {
    var idbLibrary = this;
    return new Promise(function(resolve, reject) {
        var tags = [];
        var objectStore = idbLibrary.db.transaction([ "tags" ], "readonly").objectStore("tags");
        var index = objectStore.index("title");
        index.openCursor().onsuccess = function(event) {
            var cursor = event.target.result;
            if (cursor) {
                tags.push(cursor.value);
                cursor.continue();
            } else {
                resolve(tags);
            }
        };
    });
};

Zotero.Idb.Library.prototype.setFile = function(itemKey, file) {
    Z.debug("Zotero.Idb.Library.setFile", 3);
    var idbLibrary = this;
    return new Promise(function(resolve, reject) {
        var transaction = idbLibrary.db.transaction([ "files" ], "readwrite");
        transaction.oncomplete = function(event) {
            Zotero.debug("set file transaction completed.", 3);
            resolve();
        };
        transaction.onerror = function(event) {
            Zotero.debug("set file transaction failed.", 1);
            reject();
        };
        var fileStore = transaction.objectStore("files");
        var reqSuccess = function(event) {
            Zotero.debug("Set File" + event.target.result, 4);
        };
        var request = fileStore.put(file, key);
        request.onsuccess = reqSuccess;
    });
};

Zotero.Idb.Library.prototype.getFile = function(itemKey) {
    Z.debug("Zotero.Idb.Library.getFile", 3);
    var idbLibrary = this;
    return new Promise(function(resolve, reject) {
        var success = J.proxy(function(event) {
            resolve(event.target.result);
        }, this);
        idbLibrary.db.transaction("items").objectStore([ "files" ], "readonly").get(itemKey).onsuccess = success;
    });
};

Zotero.Idb.Library.prototype.deleteFile = function(itemKey) {
    Z.debug("Zotero.Idb.Library.deleteFile", 3);
    var idbLibrary = this;
    return new Promise(function(resolve, reject) {
        var transaction = idbLibrary.db.transaction([ "files" ], "readwrite");
        transaction.oncomplete = function(event) {
            Zotero.debug("delete file transaction completed.", 3);
            resolve();
        };
        transaction.onerror = function(event) {
            Zotero.debug("delete file transaction failed.", 1);
            reject();
        };
        var fileStore = transaction.objectStore("files");
        var reqSuccess = function(event) {
            Zotero.debug("Deleted File" + event.target.result, 4);
        };
        var request = fileStore.delete(key);
        request.onsuccess = reqSuccess;
    });
};

Zotero.Idb.Library.prototype.intersect = function(ar1, ar2) {
    var idbLibrary = this;
    var result = [];
    for (var i = 0; i < ar1.length; i++) {
        if (ar2.indexOf(ar1[i]) !== -1) {
            result.push(ar1[i]);
        }
    }
    return result;
};

Zotero.Idb.Library.prototype.intersectAll = function(arrs) {
    var idbLibrary = this;
    var result = arrs[0];
    for (var i = 0; i < arrs.length - 1; i++) {
        result = idbLibrary.intersect(result, arrs[i + 1]);
    }
    return result;
};

Zotero.Library.prototype.loadCollectionsSimple = function(config) {
    Z.debug("Zotero.Library.loadCollectionsSimple", 1);
    var library = this;
    if (!config) {
        config = {};
    }
    var defaultConfig = {
        target: "collections",
        content: "json",
        libraryType: library.libraryType,
        libraryID: library.libraryID
    };
    var urlconfig = J.extend({}, defaultConfig, config);
    var requestUrl = Zotero.ajax.apiRequestString(urlconfig);
    return library.ajaxRequest(urlconfig).then(function(response) {
        Z.debug("loadCollectionsSimple proxied callback", 1);
        var collectionsfeed = new Zotero.Feed(response.data, response.jqxhr);
        collectionsfeed.requestConfig = urlconfig;
        var collectionsAdded = library.collections.addCollectionsFromFeed(collectionsfeed);
        for (var i = 0; i < collectionsAdded.length; i++) {
            collectionsAdded[i].associateWithLibrary(library);
        }
        return collectionsAdded;
    });
};

Zotero.Library.prototype.processLoadedCollections = function(response) {
    Z.debug("processLoadedCollections", 3);
    var library = this;
    var collectionsfeed = new Zotero.Feed(response.data, response.jqxhr);
    var collectionsAdded = library.collections.addCollectionsFromFeed(collectionsfeed);
    for (var i = 0; i < collectionsAdded.length; i++) {
        collectionsAdded[i].associateWithLibrary(library);
    }
    var modifiedVersion = response.jqxhr.getResponseHeader("Last-Modified-Version");
    Zotero.utils.updateSyncState(library.collections, modifiedVersion);
    Zotero.trigger("loadedCollectionsProcessed", {
        library: library,
        collectionsAdded: collectionsAdded
    });
};

Zotero.Library.prototype.addCollection = function(name, parentCollection) {
    Z.debug("Zotero.Library.addCollection", 3);
    var library = this;
    var collection = new Zotero.Collection;
    collection.associateWithLibrary(library);
    collection.set("name", name);
    collection.set("parentCollection", parentCollection);
    return library.collections.writeCollections([ collection ]);
};

Zotero.Library.prototype.fetchItemKeys = function(config) {
    Z.debug("Zotero.Library.fetchItemKeys", 3);
    var library = this;
    if (typeof config == "undefined") {
        config = {};
    }
    var urlconfig = J.extend(true, {
        target: "items",
        libraryType: this.libraryType,
        libraryID: this.libraryID,
        format: "keys"
    }, config);
    return library.ajaxRequest(urlconfig);
};

Zotero.Library.prototype.getTrashKeys = function() {
    Z.debug("Zotero.Library.getTrashKeys", 3);
    var library = this;
    var urlconfig = {
        target: "items",
        libraryType: library.libraryType,
        libraryID: library.libraryID,
        format: "keys",
        collectionKey: "trash"
    };
    return library.ajaxRequest(urlconfig);
};

Zotero.Library.prototype.emptyTrash = function() {
    Z.debug("Zotero.Library.emptyTrash", 3);
    var library = this;
    return library.getTrashKeys().then(function(response) {
        Z.debug("got trashedItemKeys");
        var version = response.jqxhr.getResponseHeader("Last-Modified-Version");
        Z.debug("Version: " + version);
        var trashedItemKeys = response.data.split("\n");
        Z.debug(trashedItemKeys);
        return library.items.deleteItems(trashedItemKeys, version);
    });
};

Zotero.Library.prototype.loadItemKeys = function(config) {
    Z.debug("Zotero.Library.loadItemKeys", 3);
    var library = this;
    return this.fetchItemKeys(config).then(function(response) {
        Z.debug("loadItemKeys proxied callback", 3);
        var keys = response.data.split(/[\s]+/);
        library.itemKeys = keys;
    });
};

Zotero.Library.prototype.loadItems = function(config) {
    Z.debug("Zotero.Library.loadItems", 3);
    Z.debug(config);
    var library = this;
    if (!config) {
        config = {};
    }
    var defaultConfig = {
        target: "items",
        targetModifier: "top",
        itemPage: 1,
        limit: 25,
        content: "json",
        order: Zotero.config.defaultSortColumn,
        sort: Zotero.config.defaultSortOrder
    };
    var newConfig = J.extend({}, defaultConfig, config);
    newConfig.start = parseInt(newConfig.limit, 10) * (parseInt(newConfig.itemPage, 10) - 1);
    var urlconfig = J.extend({
        target: "items",
        libraryType: library.libraryType,
        libraryID: library.libraryID
    }, newConfig);
    var requestUrl = Zotero.ajax.apiRequestString(urlconfig);
    Z.debug("displayItemsUrl:" + this.items.displayItemsUrl, 4);
    Z.debug("requestUrl:" + requestUrl, 4);
    if (this.items.displayItemsUrl == requestUrl && !this.dirty) {
        return Promise.resolve({
            itemsArray: this.items.displayItemsArray,
            feed: this.items.displayItemsFeed,
            library: library
        });
    }
    return library.ajaxRequest(requestUrl).then(function(response) {
        Z.debug("loadItems proxied callback", 3);
        var jFeedOb = J(response.data);
        var itemfeed = new Zotero.Feed(response.data, response.jqxhr);
        itemfeed.requestConfig = newConfig;
        var items = library.items;
        var loadedItemsArray = items.addItemsFromFeed(itemfeed);
        for (var i = 0; i < loadedItemsArray.length; i++) {
            loadedItemsArray[i].associateWithLibrary(library);
        }
        library.items.displayItemsArray = loadedItemsArray;
        library.items.displayItemsUrl = requestUrl;
        library.items.displayItemsFeed = itemfeed;
        library.dirty = false;
        Zotero.trigger("loadItemsDone", {
            library: library
        });
        Zotero.trigger("itemsChanged", {
            library: library
        });
        return {
            itemsArray: loadedItemsArray,
            feed: itemfeed,
            library: library
        };
    });
};

Zotero.Library.prototype.loadItemsSimple = function(config) {
    Z.debug("Zotero.Library.loadItems", 3);
    var library = this;
    if (!config) {
        config = {};
    }
    var defaultConfig = {
        target: "items",
        content: "json"
    };
    var newConfig = J.extend({}, defaultConfig, config);
    var urlconfig = J.extend({
        target: "items",
        libraryType: library.libraryType,
        libraryID: library.libraryID
    }, newConfig);
    var requestUrl = Zotero.ajax.apiRequestString(urlconfig);
    return library.ajaxRequest(requestUrl).then(function(response) {
        Z.debug("loadItemsSimple callback", 3);
        var jFeedOb = J(response.data);
        var itemfeed = new Zotero.Feed(response.data, response.jqxhr);
        var items = library.items;
        var loadedItemsArray = items.addItemsFromFeed(itemfeed);
        for (var i = 0; i < loadedItemsArray.length; i++) {
            loadedItemsArray[i].associateWithLibrary(library);
        }
        library.items.displayItemsArray = loadedItemsArray;
        library.items.displayItemsUrl = requestUrl;
        library.items.displayItemsFeed = itemfeed;
        library.dirty = false;
        Zotero.trigger("itemsChanged", {
            library: library
        });
        return {
            itemsArray: loadedItemsArray,
            feed: itemfeed,
            library: library
        };
    }, function(response) {
        Z.debug("loadItemsSimple Error");
    });
};

Zotero.Library.prototype.processLoadedItems = function(response) {
    Z.debug("processLoadedItems", 3);
    var library = this;
    var jFeedOb = J(response.data);
    var itemfeed = new Zotero.Feed(response.data, response.jqxhr);
    var items = library.items;
    var loadedItemsArray = items.addItemsFromFeed(itemfeed);
    for (var i = 0; i < loadedItemsArray.length; i++) {
        loadedItemsArray[i].associateWithLibrary(library);
    }
    var modifiedVersion = response.jqxhr.getResponseHeader("Last-Modified-Version");
    Zotero.utils.updateSyncState(library.items, modifiedVersion);
    Zotero.trigger("itemsChanged", {
        library: library,
        loadedItems: loadedItemsArray
    });
};

Zotero.Library.prototype.loadItem = function(itemKey) {
    Z.debug("Zotero.Library.loadItem", 3);
    var library = this;
    if (!config) {
        var config = {
            content: "json"
        };
    }
    var urlconfig = {
        target: "item",
        libraryType: library.libraryType,
        libraryID: library.libraryID,
        itemKey: itemKey,
        content: "json"
    };
    return library.ajaxRequest(urlconfig).then(function(response) {
        var resultOb = J(response.data);
        var entry = J(response.data).find("entry").eq(0);
        var item = new Zotero.Item;
        item.libraryType = library.libraryType;
        item.libraryID = library.libraryID;
        item.parseXmlItem(entry);
        item.owningLibrary = library;
        library.items.itemObjects[item.itemKey] = item;
        Zotero.trigger("itemsChanged", {
            library: library
        });
        return item;
    }, function(response) {
        Z.debug("Error loading Item");
    });
};

Zotero.Library.prototype.trashItem = function(itemKey) {
    var library = this;
    return library.items.trashItems([ library.items.getItem(itemKey) ]);
};

Zotero.Library.prototype.untrashItem = function(itemKey) {
    Z.debug("Zotero.Library.untrashItem", 3);
    if (!itemKey) return false;
    var item = this.items.getItem(itemKey);
    item.apiObj.deleted = 0;
    return item.writeItem();
};

Zotero.Library.prototype.deleteItem = function(itemKey) {
    Z.debug("Zotero.Library.deleteItem", 3);
    var library = this;
    return library.items.deleteItem(itemKey);
};

Zotero.Library.prototype.deleteItems = function(itemKeys) {
    Z.debug("Zotero.Library.deleteItems", 3);
    var library = this;
    return library.items.deleteItems(itemKeys);
};

Zotero.Library.prototype.addNote = function(itemKey, note) {
    Z.debug("Zotero.Library.prototype.addNote", 3);
    var library = this;
    var config = {
        target: "children",
        libraryType: library.libraryType,
        libraryID: library.libraryID,
        itemKey: itemKey
    };
    var requestUrl = Zotero.ajax.apiRequestString(config);
    var item = this.items.getItem(itemKey);
    return library.ajaxRequest(requestUrl, "POST", {
        processData: false
    });
};

Zotero.Library.prototype.fetchGlobalItems = function(config) {
    Z.debug("Zotero.Library.fetchGlobalItems", 3);
    var library = this;
    if (!config) {
        config = {};
    }
    var defaultConfig = {
        target: "items",
        itemPage: 1,
        limit: 25,
        content: "json"
    };
    var newConfig = J.extend({}, defaultConfig, config);
    newConfig.start = parseInt(newConfig.limit, 10) * (parseInt(newConfig.itemPage, 10) - 1);
    var urlconfig = J.extend({
        target: "items",
        libraryType: ""
    }, newConfig);
    var requestUrl = Zotero.ajax.apiRequestString(urlconfig);
    return library.ajaxRequest(requestUrl, "GET", {
        dataType: "json"
    }).then(function(response) {
        Z.debug("globalItems callback", 3);
        return response.data;
    });
};

Zotero.Library.prototype.fetchGlobalItem = function(globalKey) {
    Z.debug("Zotero.Library.fetchGlobalItem", 3);
    Z.debug(globalKey);
    var library = this;
    var defaultConfig = {
        target: "item"
    };
    var newConfig = J.extend({}, defaultConfig);
    var urlconfig = J.extend({
        target: "item",
        libraryType: "",
        itemKey: globalKey
    }, newConfig);
    var requestUrl = Zotero.ajax.apiRequestString(urlconfig);
    return library.ajaxRequest(requestUrl, "GET", {
        dataType: "json"
    }).then(function(response) {
        Z.debug("globalItem callback", 3);
        return response.data;
    });
};

Zotero.Library.prototype.fetchTags = function(config) {
    Z.debug("Zotero.Library.fetchTags", 3);
    var library = this;
    var defaultConfig = {
        target: "tags",
        order: "title",
        sort: "asc",
        limit: 100,
        content: "json"
    };
    var newConfig = J.extend({}, defaultConfig, config);
    var urlconfig = J.extend({
        target: "tags",
        libraryType: this.libraryType,
        libraryID: this.libraryID
    }, newConfig);
    return Zotero.ajaxRequest(urlconfig);
};

Zotero.Library.prototype.loadTags = function(config) {
    Z.debug("Zotero.Library.loadTags", 3);
    var library = this;
    if (typeof config == "undefined") {
        config = {};
    }
    if (config.showAutomaticTags && config.collectionKey) {
        delete config.collectionKey;
    }
    library.tags.displayTagsArray = [];
    return library.fetchTags(config).then(function(response) {
        Z.debug("loadTags proxied callback", 3);
        var modifiedVersion = response.jqxhr.getResponseHeader("Last-Modified-Version");
        Z.debug("fetchTags Last-Modified-Version: " + modifiedVersion, 3);
        Zotero.utils.updateSyncState(library.tags, modifiedVersion);
        var tagsfeed = new Zotero.Feed(response.data, response.jqxhr);
        tagsfeed.requestConfig = config;
        var tags = library.tags;
        var addedTags = tags.addTagsFromFeed(tagsfeed);
        if (tagsfeed.links.hasOwnProperty("next")) {
            library.tags.hasNextLink = true;
            library.tags.nextLink = tagsfeed.links["next"];
        } else {
            library.tags.hasNextLink = false;
            library.tags.nextLink = null;
        }
        library.trigger("tagsChanged", {
            library: library
        });
        return library.tags;
    });
};

Zotero.Library.prototype.loadAllTags = function(config, checkCached) {
    Z.debug("Zotero.Library.loadAllTags", 3);
    Z.debug(config);
    var library = this;
    if (typeof checkCached == "undefined") {
        checkCached = true;
    }
    if (typeof config == "undefined") {
        config = {};
    }
    var defaultConfig = {
        target: "tags",
        content: "json",
        order: "title",
        sort: "asc",
        limit: 100,
        libraryType: library.libraryType,
        libraryID: library.libraryID
    };
    var newConfig = J.extend({}, defaultConfig, config);
    var urlconfig = J.extend({}, newConfig);
    var requestUrl = Zotero.ajax.apiRequestString(urlconfig);
    var tags = library.tags;
    var loadedConfig = J.extend({}, defaultConfig, tags.loadedConfig);
    var loadedConfigRequestUrl = tags.loadedRequestUrl;
    Z.debug("requestUrl: " + requestUrl, 4);
    Z.debug("loadedConfigRequestUrl: " + loadedConfigRequestUrl, 4);
    return new Promise(function(resolve, reject) {
        var continueLoadingCallback = function(tags) {
            Z.debug("loadAllTags continueLoadingCallback", 3);
            var plainList = Zotero.Tags.prototype.plainTagsList(tags.tagsArray);
            plainList.sort(Zotero.Library.prototype.sortLower);
            tags.plainList = plainList;
            Z.debug("done parsing one tags feed - checking for more.", 3);
            if (tags.hasNextLink) {
                Z.debug("still has next link.", 3);
                tags.tagsArray.sort(library.sortByTitleCompare);
                plainList = Zotero.Tags.prototype.plainTagsList(tags.tagsArray);
                plainList.sort(Zotero.Library.prototype.sortLower);
                tags.plainList = plainList;
                var nextLink = tags.nextLink;
                var nextLinkConfig = J.deparam(J.param.querystring(nextLink.href));
                var newConfig = J.extend({}, config);
                newConfig.start = nextLinkConfig.start;
                newConfig.limit = nextLinkConfig.limit;
                return library.loadTags(newConfig).then(continueLoadingCallback);
            } else {
                Z.debug("no next in tags link", 3);
                Zotero.utils.updateSyncedVersion(tags, "tagsVersion");
                tags.tagsArray.sort(library.sortByTitleCompare);
                plainList = Zotero.Tags.prototype.plainTagsList(tags.tagsArray);
                plainList.sort(Zotero.Library.prototype.sortLower);
                tags.plainList = plainList;
                Z.debug("resolving loadTags deferred", 3);
                library.tagsLoaded = true;
                library.tags.loaded = true;
                tags.loadedConfig = config;
                tags.loadedRequestUrl = requestUrl;
                for (var i = 0; i < library.tags.tagsArray.length; i++) {
                    tags.tagsArray[i].tagVersion = tags.tagsVersion;
                }
                library.trigger("tagsChanged", {
                    library: library
                });
                return tags;
            }
        };
        resolve(library.loadTags(urlconfig).then(continueLoadingCallback));
    });
};

Zotero.Library.prototype.loadItemTemplates = function() {};

Zotero.Library.prototype.loadCreatorTypes = function() {};

Zotero.Library.prototype.saveFileOffline = function(item) {
    try {
        Z.debug("Zotero.Library.saveFileOffline", 3);
        var library = this;
        var deferred = new J.Deferred;
        if (library.filestorage === false) {
            return false;
        }
        var enclosureUrl;
        var mimetype;
        if (item.links && item.links["enclosure"]) {
            enclosureUrl = item.links.enclosure.href;
            mimetype = item.links.enclosure.type;
        } else {
            return false;
        }
        var reqUrl = enclosureUrl + Zotero.ajax.apiQueryString({});
        Z.debug("reqUrl:" + reqUrl, 3);
        var xhr = new XMLHttpRequest;
        xhr.open("GET", Zotero.ajax.proxyWrapper(reqUrl, "GET"), true);
        xhr.responseType = "blob";
        xhr.onload = function(e) {
            try {
                if (this.status == 200) {
                    Z.debug("Success downloading");
                    var blob = this.response;
                    library.filestorage.filer.write("/" + item.itemKey, {
                        data: blob,
                        type: mimetype
                    }, J.proxy(function(fileEntry, fileWriter) {
                        try {
                            Z.debug("Success writing file");
                            Z.debug("Saved file for item " + item.itemKey + " for offline use");
                            Z.debug("Saving file object somewhere in Zotero namespace:");
                            library.filestorage.filer.open(fileEntry, J.proxy(function(file) {
                                try {
                                    Z.debug("reading back filesystem stored file into object url");
                                    deferred.resolve(true);
                                } catch (e) {
                                    Z.debug("Caught in filer.open");
                                    Z.debug(e);
                                }
                            }, this));
                        } catch (e) {
                            Z.debug("Caught in filer.write");
                            Z.debug(e);
                        }
                    }, this));
                }
            } catch (e) {
                Z.debug("Caught inside binary xhr onload");
                Z.debug(e);
            }
        };
        xhr.send();
        return deferred;
    } catch (e) {
        Z.debug("Caught in Z.Library.saveFileOffline");
        Z.debug(e);
    }
};

Zotero.Library.prototype.saveFileSetOffline = function(itemKeys) {
    Z.debug("Zotero.Library.saveFileSetOffline", 3);
    var library = this;
    var ds = [];
    var deferred = new J.Deferred;
    var item;
    var childItemKeys = [];
    var checkedKeys = {};
    J.each(itemKeys, function(ind, itemKey) {
        if (checkedKeys.hasOwnProperty(itemKey)) {
            return;
        } else {
            checkedKeys[itemKey] = 1;
        }
        item = library.items.getItem(itemKey);
        if (item && item.links && item.links["enclosure"]) {
            ds.push(library.saveFileOffline(item));
        }
        if (item.numChildren) {
            J.each(item.childItemKeys, function(ind, val) {
                childItemKeys.push(val);
            });
        }
    });
    J.each(childItemKeys, function(ind, itemKey) {
        if (checkedKeys.hasOwnProperty(itemKey)) {
            return;
        } else {
            checkedKeys[itemKey] = 1;
        }
        item = library.items.getItem(itemKey);
        if (item && item.links && item.links["enclosure"]) {
            ds.push(library.saveFileOffline(item));
        }
    });
    J.when.apply(null, ds).then(J.proxy(function() {
        var d = library.filestorage.listOfflineFiles();
        d.then(J.proxy(function(localItemKeys) {
            deferred.resolve();
        }, this));
    }));
    return deferred;
};

Zotero.Library.prototype.saveCollectionFilesOffline = function(collectionKey) {
    Zotero.debug("Zotero.Library.saveCollectionFilesOffline " + collectionKey, 3);
    var library = this;
    var collection = library.collections.getCollection(collectionKey);
    var itemKeys = collection.itemKeys;
    var d = Zotero.Library.prototype.saveFileSetOffline(itemKeys);
    return d;
};

Zotero.Library.prototype.loadIndexedDBCache = function() {
    Zotero.debug("Zotero.Library.loadIndexedDBCache", 3);
    var library = this;
    var itemsPromise = library.idbLibrary.getAllItems();
    var collectionsPromise = library.idbLibrary.getAllCollections();
    var tagsPromise = library.idbLibrary.getAllTags();
    itemsPromise.then(function(itemsArray) {
        Z.debug("loadIndexedDBCache itemsD done", 3);
        var latestVersion = 0;
        var dump = {};
        dump.instance = "Zotero.Items.dump";
        dump.itemsVersion = 0;
        dump.itemsArray = itemsArray;
        for (var i = 0; i < itemsArray.length; i++) {
            if (itemsArray[i].itemVersion > latestVersion) {
                latestVersion = itemsArray[i].itemVersion;
            }
        }
        dump.itemsVersion = latestVersion;
        library.items.loadDump(dump);
        library.items.loaded = true;
        Z.debug("Done loading indexedDB items promise into library", 3);
    });
    collectionsPromise.then(function(collectionsArray) {
        Z.debug("loadIndexedDBCache collectionsD done", 3);
        var latestVersion = 0;
        var dump = {};
        dump.instance = "Zotero.Collections.dump";
        dump.collectionsVersion = 0;
        dump.collectionsArray = collectionsArray;
        for (var i = 0; i < collectionsArray.length; i++) {
            if (collectionsArray[i].collectionVersion > latestVersion) {
                latestVersion = collectionsArray[i].collectionVersion;
            }
        }
        dump.collectionsVersion = latestVersion;
        library.collections.loadDump(dump);
        library.collections.loaded = true;
    });
    tagsPromise.then(function(tagsArray) {
        var latestVersion = 0;
        var dump = {};
        dump.instance = "Zotero.Collections.dump";
        dump.tagsVersion = 0;
        dump.tagsArray = tagsArray;
        for (var i = 0; i < tagsArray.length; i++) {
            if (tagsArray[i].tagVersion > latestVersion) {
                latestVersion = tagsArray[i].tagVersion;
            }
        }
        dump.tagsVersion = latestVersion;
        library.tags.loadDump(dump);
        library.tags.loaded = true;
    });
    return Promise.all([ itemsPromise, collectionsPromise, tagsPromise ]);
};

Zotero.Library.prototype.saveIndexedDB = function() {
    var library = this;
    var saveItemsPromise = library.idbLibrary.updateItems(library.items.itemsArray);
    var saveCollectionsPromise = library.idbLibrary.updateCollections(library.collections.collectionsArray);
    var saveTagsPromise = library.idbLibrary.updateTags(library.tags.tagsArray);
    return Promise.all([ saveItemsPromise, saveCollectionsPromise, saveTagsPromise ]);
};

Zotero.Library.prototype.loadCachedItems = function() {
    Zotero.debug("Zotero.Library.loadCachedItems", 3);
    var library = this;
    var cacheConfig = {
        libraryType: library.libraryType,
        libraryID: library.libraryID,
        target: "allitems"
    };
    var itemsDump = Zotero.cache.load(cacheConfig);
    if (itemsDump !== null) {
        Zotero.debug("Items dump present in cache - loading items", 3);
        library.items.loadDump(itemsDump);
        library.items.loaded = true;
        return true;
    } else {
        return false;
    }
};

Zotero.Library.prototype.saveCachedItems = function() {
    var library = this;
    var cacheConfig = {
        libraryType: library.libraryType,
        libraryID: library.libraryID,
        target: "allitems"
    };
    Zotero.cache.save(cacheConfig, library.items.dump());
    return;
};

Zotero.Library.prototype.loadCachedCollections = function() {
    Z.debug("Zotero.Library.loadCachedCollections", 3);
    var library = this;
    var cacheConfig = {
        libraryType: library.libraryType,
        libraryID: library.libraryID,
        target: "allcollections"
    };
    var collectionsDump = Zotero.cache.load(cacheConfig);
    if (collectionsDump !== null) {
        Z.debug("Collections dump present in cache - loading collections", 4);
        library.collections.loadDump(collectionsDump);
        library.collections.loaded = true;
        return true;
    } else {
        return false;
    }
};

Zotero.Library.prototype.saveCachedCollections = function() {
    var library = this;
    var cacheConfig = {
        libraryType: library.libraryType,
        libraryID: library.libraryID,
        target: "allcollections"
    };
    Zotero.cache.save(cacheConfig, library.collections.dump());
    return;
};

Zotero.Library.prototype.loadCachedTags = function() {
    var library = this;
    var cacheConfig = {
        libraryType: this.libraryType,
        libraryID: this.libraryID,
        target: "alltags"
    };
    var tagsDump = Zotero.cache.load(cacheConfig);
    if (tagsDump !== null) {
        Z.debug("Tags dump present in cache - loading", 3);
        library.tags.loadDump(tagsDump);
        library.tags.loaded = true;
        Zotero.trigger("tagsChanged", {
            library: library
        });
        return true;
    } else {
        return false;
    }
};

Zotero.Library.prototype.saveCachedTags = function() {
    var library = this;
    var cacheConfig = {
        libraryType: library.libraryType,
        libraryID: library.libraryID,
        target: "alltags"
    };
    Zotero.cache.save(cacheConfig, library.tags.dump());
    return;
};

Zotero.Preferences = function(store, idString) {
    this.store = store;
    this.idString = idString;
    this.preferencesObject = {};
    this.defaults = {
        debug_level: 3,
        debug_log: true,
        debug_mock: false,
        listDisplayedFields: [ "title", "creator", "dateModified" ],
        showAutomaticTags: false,
        itemsPerPage: 25,
        order: "title",
        title: "asc"
    };
    this.load();
};

Zotero.Preferences.prototype.setPref = function(key, value) {
    var preferences = this;
    preferences.preferencesObject[key] = value;
    preferences.persist();
};

Zotero.Preferences.prototype.setPrefs = function(newPrefs) {
    var preferences = this;
    if (typeof newPrefs != "object") {
        throw new Error("Preferences must be an object");
    }
    preferences.preferencesObject = newPrefs;
    preferences.persist();
};

Zotero.Preferences.prototype.getPref = function(key) {
    var preferences = this;
    if (preferences.preferencesObject[key]) {
        return preferences.preferencesObject[key];
    } else if (preferences.defaults[key]) {
        return preferences.defaults[key];
    } else {
        return null;
    }
};

Zotero.Preferences.prototype.getPrefs = function() {
    var preferences = this;
    return preferences.preferencesObject;
};

Zotero.Preferences.prototype.persist = function() {
    var preferences = this;
    var storageString = "preferences_" + preferences.idString;
    preferences.store[storageString] = JSON.stringify(preferences.preferencesObject);
};

Zotero.Preferences.prototype.load = function() {
    var preferences = this;
    var storageString = "preferences_" + preferences.idString;
    var storageObjectString = preferences.store[storageString];
    if (!storageObjectString) {
        preferences.preferencesObject = {};
    } else {
        preferences.preferencesObject = JSON.parse(storageObjectString);
    }
};

var J = jQuery.noConflict();

jQuery(document).ready(function() {
    Z.debug("===== DOM READY =====", 3);
    Zotero.state = new Zotero.State;
    Zotero.init();
});

Zotero.defaultPrefs = {
    debug_level: 3,
    debug_log: true,
    debug_mock: false,
    javascript_enabled: false
};

Zotero.init = function() {
    Z.debug("Zotero init", 3);
    if (Zotero.pages) {
        Zotero.pages.base.init();
    }
    if (undefined !== window.zoterojsClass && undefined !== Zotero.pages) {
        try {
            Zotero.pages[zoterojsClass].init();
        } catch (err) {
            Z.debug("Error running page specific init for " + zoterojsClass, 1);
        }
    }
    if (typeof zoterojsClass == "undefined") {
        zoterojsClass = "default";
        Zotero.config.pageClass = "default";
    }
    if (typeof Globalize !== "undefined") {
        Globalize.culture(Zotero.config.locale);
    }
    if (typeof zoteroData == "undefined") {
        zoteroData = {};
    }
    if (window.nonZendPage === true) {
        return;
    }
    Zotero.state.parseUrlVars();
    Zotero.config.startPageTitle = document.title;
    var store;
    if (typeof sessionStorage == "undefined") {
        store = {};
    } else {
        store = sessionStorage;
    }
    Zotero.cache = new Zotero.Cache(store);
    Zotero.store = store;
    Zotero.preferences = new Zotero.Preferences(Zotero.store, "global");
    Zotero.preferences.defaults = J.extend({}, Zotero.preferences.defaults, Zotero.config.defaultPrefs);
    var locale = "en-US";
    if (zoteroData.locale) {
        locale = zoteroData.locale;
    }
    var libraryPage = J("body").hasClass("library");
    if (libraryPage) {
        Zotero.state.libraryString = Zotero.utils.libraryString(zoteroData.libraryType, zoteroData.libraryID);
        Zotero.state.filter = Zotero.state.libraryString;
        if (Zotero.config.pageClass == "user_library" || Zotero.config.pageClass == "group_library" || Zotero.config.pageClass == "my_library") {
            Zotero.Item.prototype.getItemTypes(locale);
            Zotero.Item.prototype.getItemFields(locale);
            Zotero.Item.prototype.getCreatorFields(locale);
            Zotero.Item.prototype.getCreatorTypes();
        }
    }
    Zotero.ui.init.all();
    J.ajaxSettings.traditional = true;
    if (Zotero.state.getUrlVar("proxy") == "false") {
        Zotero.config.proxy = false;
    }
    if (Zotero.preferences.getPref("server_javascript_enabled") === false) {
        Zotero.preferences.setPref("server_javascript_enabled") = true;
        document.cookie = "zoterojsenabled=1; expires=; path=/";
    }
    window.onpopstate = function() {
        Z.debug("popstate");
        J(window).trigger("statechange");
    };
    J(window).on("statechange", J.proxy(Zotero.state.popstateCallback, Zotero.state));
    Zotero.state.popstateCallback();
};

Zotero.State = function() {
    this.q = {};
    this.f = {};
    this.pathVars = {};
    this.startUrl = "";
    this.replacePush = false;
    this.curHref = "";
    this.prevHref = "";
    this.curState = {};
    this.prevState = {};
    this.useLocation = true;
    this.filter = null;
    this.selectedItemKeys = [];
};

Zotero.State.prototype.updateCurState = function() {
    var state = this;
    state.curState = J.extend({}, state.f, state.q, state.pathVars);
    return;
};

Zotero.State.prototype.savePrevState = function() {
    var state = this;
    state.prevState = state.curState;
    return;
};

Zotero.State.prototype.getSelectedItemKeys = function() {
    return this.selectedItemKeys;
};

Zotero.State.prototype.pushTag = function(newtag) {
    Z.debug("Zotero.State.pushTag", 3);
    var state = this;
    if (state.pathVars["tag"]) {
        if (state.pathVars["tag"] instanceof Array) {
            state.pathVars["tag"].push(newtag);
        } else {
            var currentTag = state.pathVars["tag"];
            state.pathVars["tag"] = [ currentTag, newtag ];
        }
    } else {
        state.pathVars["tag"] = [ newtag ];
    }
    return;
};

Zotero.State.prototype.popTag = function(oldtag) {
    Z.debug("Zotero.State.popTag", 3);
    var state = this;
    if (!state.pathVars["tag"]) {
        return;
    } else if (state.pathVars["tag"] instanceof Array) {
        var newTagArray = state.pathVars["tag"].filter(function(element, index, array) {
            return element != oldtag;
        });
        state.pathVars["tag"] = newTagArray;
        return;
    } else if (state.pathVars["tag"] == oldtag) {
        state.pathVars["tag"] = [];
        return;
    }
};

Zotero.State.prototype.toggleTag = function(tagtitle) {
    Z.debug("Zotero.State.toggleTag", 3);
    var state = this;
    if (!state.pathVars["tag"]) {
        state.pathVars["tag"] = [ tagtitle ];
        return;
    } else if (J.isArray(state.pathVars["tag"])) {
        if (J.inArray(tagtitle, state.pathVars["tag"]) != -1) {
            var newTagArray = state.pathVars["tag"].filter(function(element, index, array) {
                return element != tagtitle;
            });
            state.pathVars["tag"] = newTagArray;
            return;
        } else {
            state.pathVars["tag"].push(tagtitle);
            return;
        }
    } else if (state.pathVars["tag"] == tagtitle) {
        state.pathVars["tag"] = [];
        return;
    } else if (typeof state.pathVars["tag"] == "string") {
        var oldValue = state.pathVars["tag"];
        state.pathVars["tag"] = [ oldValue, tagtitle ];
        return;
    }
};

Zotero.State.prototype.unsetUrlVar = function(unset) {
    Z.debug("Zotero.State.unsetUrlVar", 3);
    var state = this;
    if (state.pathVars[unset]) {
        delete state.pathVars[unset];
    }
};

Zotero.State.prototype.clearUrlVars = function(except) {
    Z.debug("Zotero.State.clearUrlVars", 3);
    var state = this;
    if (!except) {
        except = [];
    }
    var pathVars = state.pathVars;
    J.each(pathVars, function(key, value) {
        if (J.inArray(key, except) == -1) {
            delete pathVars[key];
        }
    });
};

Zotero.State.prototype.parseUrlVars = function() {
    Z.debug("Zotero.State.parseUrlVars", 3);
    var state = this;
    if (!state.useLocation) return;
    state.q = J.deparam(J.param.querystring());
    state.f = state.parseFragmentVars();
    state.pathVars = state.parsePathVars();
};

Zotero.State.prototype.parsePathVars = function(pathname) {
    Z.debug("Zotero.State.parsePathVars", 3);
    var state = this;
    var history = window.history;
    if (!pathname) {
        pathname = window.location.pathname;
    }
    var basePath = Zotero.config.nonparsedBaseUrl;
    var split_replaced = [];
    var re = new RegExp(".*" + basePath + "/?");
    var replaced = pathname.replace(re, "");
    split_replaced = replaced.split("/");
    var pathVars = {};
    for (var i = 0; i < split_replaced.length - 1; i = i + 2) {
        var pathVar = pathVars[split_replaced[i]];
        if (pathVar) {
            if (pathVar instanceof Array) {
                pathVar.push(decodeURIComponent(split_replaced[i + 1]));
            } else {
                var ar = [ pathVar ];
                ar.push(decodeURIComponent(split_replaced[i + 1]));
                pathVar = ar;
            }
        } else {
            pathVar = decodeURIComponent(split_replaced[i + 1]);
        }
        pathVars[split_replaced[i]] = pathVar;
    }
    if (pathVars["itemkey"]) {
        var itemKey = pathVars["itemkey"];
        pathVars["itemKey"] = itemKey;
        delete pathVars["itemkey"];
    }
    return pathVars;
};

Zotero.State.prototype.parseFragmentVars = function() {
    var state = this;
    var fragmentVars = {};
    var fragment = J.param.fragment();
    var split_fragment = fragment.split("/");
    for (var i = 0; i < split_fragment.length - 1; i = i + 2) {
        fragmentVars[split_fragment[i]] = split_fragment[i + 1];
    }
    return fragmentVars;
};

Zotero.State.prototype.buildUrl = function(urlvars, fragment) {
    var state = this;
    if (typeof fragment === "undefined") {
        fragment = false;
    }
    var basePath = Zotero.config.nonparsedBaseUrl + "/";
    var urlVarsArray = [];
    J.each(urlvars, function(index, value) {
        if (!value) {
            return;
        } else if (value instanceof Array) {
            J.each(value, function(i, v) {
                urlVarsArray.push(index + "/" + encodeURIComponent(v));
            });
        } else {
            urlVarsArray.push(index + "/" + encodeURIComponent(value));
        }
    });
    urlVarsArray.sort();
    var pathVarsString = urlVarsArray.join("/");
    var url = basePath + pathVarsString;
    return url;
};

Zotero.State.prototype.mutateUrl = function(addvars, removevars) {
    var state = this;
    if (!addvars) {
        addvars = {};
    }
    if (!removevars) {
        removevars = [];
    }
    var urlvars = J.extend({}, state.pathVars);
    J.each(addvars, function(key, val) {
        urlvars[key] = val;
    });
    J.each(removevars, function(index, val) {
        delete urlvars[val];
    });
    var url = state.buildUrl(urlvars, false);
    return url;
};

Zotero.State.prototype.pushState = function() {
    Z.debug("Zotero.State.pushState", 3);
    var state = this;
    var history = window.history;
    Zotero.ui.saveFormData();
    state.prevHref = state.curHref;
    var s = J.extend({}, state.f, state.q, state.pathVars);
    var urlvars = state.pathVars;
    var url = state.buildUrl(urlvars, false);
    state.curHref = url;
    Z.debug("about to push url: " + url, 3);
    if (state.useLocation) {
        if (state.replacePush === true) {
            Z.debug("Zotero.State.pushState - replacePush", 3);
            state.replacePush = false;
            history.replaceState(s, document.title, url);
        } else {
            Z.debug("Zotero.State.pushState - pushState", 3);
            history.pushState(s, document.title, url);
            state.stateChanged();
        }
    } else {
        state.stateChanged();
    }
    Zotero.debug("leaving pushstate", 3);
};

Zotero.State.prototype.replaceState = function() {
    Z.debug("Zotero.State.replaceState", 3);
    var state = this;
    var history = window.history;
    Zotero.ui.saveFormData();
    state.updateCurState();
    var s = J.extend({}, state.curState);
    var urlvars = state.pathVars;
    var url = state.buildUrl(urlvars, false);
    if (state.useLocation) {
        history.replaceState(s, null, url);
        state.curHref = url;
    } else {
        state.curHref = url;
    }
};

Zotero.State.prototype.updateStateTitle = function(title) {
    Zotero.debug("Zotero.State.updateStateTitle", 3);
    var state = this;
    document.title = title;
};

Zotero.State.prototype.getUrlVar = function(key) {
    var state = this;
    if (state.pathVars.hasOwnProperty(key) && state.pathVars[key] !== "") {
        return state.pathVars[key];
    } else if (state.f.hasOwnProperty(key)) {
        return state.f[key];
    } else if (state.q.hasOwnProperty(key)) {
        return state.q[key];
    }
    return undefined;
};

Zotero.State.prototype.setUrlVar = function(key, val) {
    var state = this;
    state.pathVars[key] = val;
};

Zotero.State.prototype.getUrlVars = function() {
    var state = this;
    var params = J.deparam(J.param.querystring());
    return J.extend(true, {}, state.pathVars, params, J.deparam(J.param.fragment()));
};

Zotero.State.prototype.setFragmentVar = function(key, val) {
    var state = this;
    state.f[key] = val;
};

Zotero.State.prototype.setQueryVar = function(key, val) {
    var state = this;
    if (val === "") {
        delete state.q[key];
    } else {
        state.q[key] = val;
    }
};

Zotero.State.prototype.addQueryVar = function(key, val) {
    var state = this;
    if (state.q.hasOwnProperty(key)) {
        if (J.isArray(state.q[key])) {
            state.q[key].push(val);
        } else {
            var newArray = [ state.q[key], val ];
            state.q[key] = newArray;
        }
    } else {
        state.q[key] = val;
    }
    return state.q[key];
};

Zotero.State.prototype.updateFragment = function(updatedVars) {
    var state = this;
    Z.debug("updateFragment", 3);
    J.bbq.pushState(updatedVars, 0);
};

Zotero.State.prototype.popstateCallback = function(evt) {
    var state = this;
    Z.debug("===== popstateCallback =====", 3);
    var history = window.history;
    state.prevHref = state.curHref;
    Z.debug("new href, updating href and processing urlchange", 3);
    state.curHref = window.location.href;
    state.parseUrlVars();
    state.stateChanged(evt);
};

Zotero.State.prototype.stateChanged = function(event) {
    var state = this;
    Z.debug("stateChanged", 3);
    state.savePrevState();
    state.updateCurState();
    Z.debug("Checking changed variables", 3);
    var changedVars = state.diffState(state.prevHref, state.curHref);
    var widgetEvents = {};
    J.each(changedVars, function(ind, val) {
        var eventString = val + "Changed";
        Z.debug(eventString, 3);
        if (Zotero.eventful.eventMap.hasOwnProperty(eventString)) {
            J.each(Zotero.eventful.eventMap[eventString], function(ind, val) {
                if (!widgetEvents.hasOwnProperty(val)) {
                    widgetEvents[val] = 1;
                }
            });
        }
        Z.debug("State Filter: " + state.filter, 3);
        Zotero.trigger(eventString, {}, state.filter);
    });
    J.each(widgetEvents, function(ind, val) {
        Z.debug("State Filter: " + state.filter, 3);
        Zotero.trigger(ind, {}, state.filter);
    });
    Z.debug("===== stateChanged Done =====", 3);
};

Zotero.State.prototype.diffState = function(prevHref, curHref) {
    Z.debug("Zotero.State.diffState", 3);
    var state = this;
    var prevVars = J.extend({}, state.parsePathVars(prevHref));
    var curVars = J.extend({}, state.parsePathVars(curHref));
    var monitoredVars = [ "start", "limit", "order", "sort", "content", "format", "q", "fq", "itemType", "itemKey", "collectionKey", "searchKey", "locale", "tag", "tagType", "key", "style", "session", "newer", "itemPage", "mode" ];
    var changedVars = [];
    J.each(monitoredVars, function(ind, val) {
        if (prevVars.hasOwnProperty(val) || curVars.hasOwnProperty(val)) {
            if (prevVars[val] != curVars[val]) {
                changedVars.push(val);
            }
        }
    });
    return changedVars;
};

Zotero.State.prototype.bindTagLinks = function(container) {
    var state = this;
    Z.debug("Zotero.State.bindTagLinks", 3);
    J(container).on("click", "a.tag-link", function(e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        var tagtitle = J(this).attr("data-tagtitle");
        state.toggleTag(tagtitle);
        state.clearUrlVars([ "tag", "collectionKey" ]);
        state.pushState();
    });
};

Zotero.State.prototype.bindItemLinks = function(container) {
    Z.debug("Zotero.State.bindItemLinks", 3);
    var state = this;
    J(container).on("click", "a.item-select-link", function(e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        Z.debug("item-select-link clicked", 3);
        var itemKey = J(this).data("itemkey");
        state.pathVars.itemKey = itemKey;
        state.pushState();
    });
    J(container).on("click", "td[data-itemkey]:not(.edit-checkbox-td)", function(e) {
        e.preventDefault();
        Z.debug("item-select-td clicked", 3);
        var itemKey = J(this).data("itemkey");
        state.pathVars.itemKey = itemKey;
        state.pushState();
    });
};

Zotero.Delay = function(mseconds) {
    return new Promise(function(resolve, reject) {
        setTimeout(function() {
            resolve();
        }, mseconds);
    });
};

Zotero.widgets = {};

Zotero.eventful = {};

Zotero.eventful.events = [ "collectionsDirty", "tagsChanged", "displayedItemsChanged", "displayedItemChanged", "selectedItemsChanged", "showCitations", "showSettings", "exportItems", "libraryTagsUpdated", "uploadSuccessful", "refreshGroups", "clearLibraryQuery", "libraryItemsUpdated", "citeItems", "itemTypeChanged", "addTag", "showChildren", "selectCollection", "selectedCollectionChanged", "libraryCollectionsUpdated", "loadItemsDone", "collectionsChanged", "tagsChanged", "itemsChanged", "loadedCollectionsProcessed", "deleteProgress", "settingsLoaded", "cachedDataLoaded", "createItem", "newItem", "addToCollectionDialog", "removeFromCollection", "moveToTrash", "removeFromTrash", "toggleEdit", "clearLibraryQuery", "librarySettingsDialog", "citeItems", "exportItemsDialog", "syncLibrary", "createCollectionDialog", "updateCollectionDialog", "deleteCollectionDialog", "showMoreTags", "showFewerTags" ];

Zotero.eventful.eventMap = {
    orderChanged: [ "displayedItemsChanged" ],
    sortChanged: [ "displayedItemsChanged" ],
    collectionKeyChanged: [ "displayedItemsChanged", "selectedCollectionChanged" ],
    qChanged: [ "displayedItemsChanged" ],
    tagChanged: [ "displayedItemsChanged", "selectedTagsChanged" ],
    itemPageChanged: [ "displayedItemsChanged" ],
    itemKeyChanged: [ "displayedItemChanged" ]
};

Zotero.eventful.initWidgets = function() {
    Zotero.state.parsePathVars();
    J(".eventfulwidget").each(function(ind, el) {
        var widgetName = J(el).data("widget");
        if (widgetName && Zotero.ui.widgets[widgetName]) {
            if (Zotero.ui.widgets[widgetName]["init"]) {
                Z.debug("eventfulwidget init: " + widgetName, 3);
                Zotero.ui.widgets[widgetName].init(el);
            }
        }
    });
    Zotero.eventful.initTriggers();
};

Zotero.eventful.initTriggers = function(el) {
    Zotero.debug("Zotero.eventful.initTriggers", 3);
    if (!el) {
        el = J("html");
    }
    var triggerOnEvent = function(event) {
        Z.debug("triggerOnEvent", 3);
        event.preventDefault();
        var jel = J(event.delegateTarget);
        eventName = jel.data("triggers");
        Z.debug("eventName: " + eventName, 3);
        var filter = jel.data("library") || "";
        Zotero.trigger(eventName, {
            triggeringElement: event.currentTarget
        }, filter);
    };
    J(el).find(".eventfultrigger").each(function(ind, el) {
        if (J(el).data("triggerbound")) {
            return;
        }
        var ev = J(el).data("event");
        Z.debug("binding eventfultrigger", 4);
        if (ev) {
            Z.debug("binding " + ev + " on " + el.tagName, 4);
            J(el).on(ev, triggerOnEvent);
        } else {
            J(el).on("click", triggerOnEvent);
        }
        J(el).data("triggerbound", true);
    });
};

Zotero.ui.dialog = function(el, options) {
    Z.debug("Zotero.ui.dialog", 3);
    J(el).modal(options);
    Z.debug("exiting Zotero.ui.dialog", 3);
};

Zotero.ui.closeDialog = function(el) {
    J(el).dialog("close");
};

Zotero.ui.formatItemField = function(field, item, trim) {
    if (typeof trim == "undefined") {
        trim = false;
    }
    var trimLength = 0;
    var formattedString = "";
    var date;
    if (Zotero.config.maxFieldSummaryLength[field]) {
        trimLength = Zotero.config.maxFieldSummaryLength[field];
    }
    switch (field) {
      case "itemType":
        formattedString = Zotero.localizations.typeMap[item["itemType"]];
        break;
      case "dateModified":
        if (!item["dateModified"]) {
            formattedString = "";
        }
        date = Zotero.utils.parseApiDate(item["dateModified"]);
        if (date) {
            formattedString = Globalize.format(date, "d") + " " + Globalize.format(date, "t");
        } else {
            formattedString = item["dateModified"];
        }
        formattedString = date.toLocaleString();
        break;
      case "dateAdded":
        if (!item["dateAdded"]) {
            formattedString = "";
        }
        date = Zotero.utils.parseApiDate(item["dateAdded"]);
        if (date) {
            formattedString = Globalize.format(date, "d") + " " + Globalize.format(date, "t");
        } else {
            formattedString = item["dateAdded"];
        }
        break;
      case "title":
        formattedString = item.title;
        break;
      case "creator":
        formattedString = item.creatorSummary;
        break;
      case "addedBy":
        formattedString = item.author.name;
        break;
      default:
        if (typeof item[field] !== "undefined") {
            formattedString = item[field];
        } else if (item.apiObj) {
            if (item.apiObj[field]) {
                formattedString = item.apiObj[field];
            }
        }
    }
    if (trim && trimLength > 0 && formattedString.length > trimLength) {
        return formattedString.slice(0, trimLength) + "…";
    } else {
        return formattedString;
    }
};

Zotero.ui.trimString = function(s, maxlen) {
    var trimLength = 35;
    var formattedString = s;
    if (maxlen) {
        trimLength = maxlen;
    }
    if (trimLength > 0 && formattedString.length > trimLength) {
        return formattedString.slice(0, trimLength) + "…";
    } else {
        return formattedString;
    }
};

Zotero.ui.formatItemDateField = function(field, item) {
    var date;
    switch (field) {
      case "dateModified":
        if (!item["dateModified"]) {
            return "";
        }
        date = Zotero.utils.parseApiDate(item["dateModified"]);
        if (date) {
            return "<span class='localized-date-span'>" + Globalize.format(date, "d") + "</span> <span class='localized-date-span'>" + Globalize.format(date, "t") + "</span>";
        } else {
            return item["dateModified"];
        }
        return date.toLocaleString();
      case "dateAdded":
        if (!item["dateAdded"]) {
            return "";
        }
        date = Zotero.utils.parseApiDate(item["dateAdded"]);
        if (date) {
            return "<span class='localized-date-span'>" + Globalize.format(date, "d") + "</span> <span class='localized-date-span'>" + Globalize.format(date, "t") + "</span>";
        } else {
            return item["dateAdded"];
        }
        break;
    }
    return "";
};

Zotero.ui.formatItemContentRow = function(contentRow) {
    if (contentRow.field == "date") {
        if (!contentRow.fieldValue) {
            return "";
        }
        var date = Zotero.utils.parseApiDate(contentRow.value);
        if (!date) {
            return contentRow.fieldValue;
        } else {
            return date.toLocaleString();
        }
    } else {
        return contentRow.fieldValue;
    }
};

Zotero.ui.groupUrl = function(group, route) {
    var groupBase;
    if (group.groupType == "Private") {
        groupBase = "/groups/" + group.groupID;
    } else {
        groupBase = "/groups/" + Zotero.utils.slugify(group.groupName);
    }
    var groupIDBase = "/groups/" + group.groupID;
    Zotero.debug("groupBase: " + groupBase);
    switch (route) {
      case "groupView":
        return groupBase;
      case "groupLibrary":
        return groupBase + "/items";
      case "groupSettings":
        return groupIDBase + "/settings";
      case "groupMembers":
        return groupIDBase + "/members";
      case "groupLibrarySettings":
        return groupIDBase + "/settings/library";
      case "groupMembersSettings":
        return groupIDBase + "/settings/members";
    }
};

Zotero.ui.init = {};

Zotero.ui.widgets = {};

Zotero.ui.init.all = function() {
    Z.debug("ui init based on page", 3);
    switch (Zotero.config.pageClass) {
      case "my_library":
      case "user_library":
      case "group_library":
        Zotero.ui.init.library();
        break;
      case "default":
    }
};

Zotero.ui.init.library = function() {
    Z.debug("Zotero.ui.init.library", 3);
    Zotero.ui.init.libraryTemplates();
    Zotero.eventful.initWidgets();
    var hasRTENoLinks = J("textarea.rte").filter(".nolinks").length;
    var hasRTEReadOnly = J("textarea.rte").filter(".readonly").length;
    var hasRTEDefault = J("textarea.rte").not(".nolinks").not(".readonly").length;
    if (hasRTENoLinks) {
        Zotero.ui.init.rte("nolinks");
    }
    if (hasRTEReadOnly) {
        Zotero.ui.init.rte("readonly");
    }
    if (hasRTEDefault) {
        Zotero.ui.init.rte("default");
    }
};

Zotero.ui.init.rte = function(type, autofocus, elements) {
    if (Zotero.config.rte == "ckeditor") {
        Zotero.ui.init.ckeditor(type, autofocus, elements);
        return;
    } else {
        Zotero.ui.init.tinyMce(type, autofocus, elements);
    }
};

Zotero.ui.init.ckeditor = function(type, autofocus, elements) {
    if (!type) {
        type = "default";
    }
    var ckconfig = {};
    ckconfig.toolbarGroups = [ {
        name: "clipboard",
        groups: [ "clipboard", "undo" ]
    }, {
        name: "links"
    }, {
        name: "insert"
    }, {
        name: "forms"
    }, {
        name: "tools"
    }, {
        name: "document",
        groups: [ "mode", "document", "doctools" ]
    }, {
        name: "others"
    }, "/", {
        name: "basicstyles",
        groups: [ "basicstyles", "cleanup" ]
    }, {
        name: "paragraph",
        groups: [ "list", "indent", "blocks", "align" ]
    }, {
        name: "styles"
    }, {
        name: "colors"
    }, {
        name: "about"
    } ];
    var nolinksckconfig = {};
    nolinksckconfig.toolbarGroups = [ {
        name: "clipboard",
        groups: [ "clipboard", "undo" ]
    }, {
        name: "editing",
        groups: [ "find", "selection" ]
    }, {
        name: "insert"
    }, {
        name: "forms"
    }, {
        name: "tools"
    }, {
        name: "document",
        groups: [ "mode", "document", "doctools" ]
    }, {
        name: "others"
    }, "/", {
        name: "basicstyles",
        groups: [ "basicstyles", "cleanup" ]
    }, {
        name: "paragraph",
        groups: [ "list", "indent", "blocks", "align" ]
    }, {
        name: "styles"
    }, {
        name: "colors"
    }, {
        name: "about"
    } ];
    var readonlyckconfig = {};
    readonlyckconfig.toolbarGroups = [];
    readonlyckconfig.readOnly = true;
    var config;
    if (type == "nolinks") {
        config = J.extend(true, {}, nolinksckconfig);
    } else if (type == "readonly") {
        config = J.extend(true, {}, readonlyckconfig);
    } else {
        config = J.extend(true, {}, ckconfig);
    }
    if (autofocus) {
        config.startupFocus = true;
    }
    J("textarea.rte").each(function(ind, el) {
        var edName = J(el).attr("name");
        if (!CKEDITOR.instances[edName]) {
            var editor = CKEDITOR.replace(el, config);
        }
    });
};

Zotero.ui.init.tinyMce = function(type, autofocus, elements) {
    if (!type) {
        type = "default";
    }
    var mode = "specific_textareas";
    if (elements) {
        mode = "exact";
    } else {
        elements = "";
    }
    var tmceConfig = {
        mode: mode,
        elements: elements,
        theme: "advanced",
        theme_advanced_toolbar_location: "top",
        theme_advanced_buttons1: "bold,italic,underline,strikethrough,separator,sub,sup,separator,forecolorpicker,backcolorpicker,separator,blockquote,separator,link,unlink",
        theme_advanced_buttons2: "formatselect,separator,justifyleft,justifycenter,justifyright,separator,bullist,numlist,outdent,indent,separator,removeformat,code,",
        theme_advanced_buttons3: "",
        theme_advanced_toolbar_align: "left",
        theme_advanced_statusbar_location: "bottom",
        theme_advanced_resizing: true,
        relative_urls: false,
        editor_selector: "default"
    };
    if (autofocus) {
        tmceConfig.init_instance_callback = function(inst) {
            Z.debug("inited " + inst.editorId);
            inst.focus();
        };
    }
    if (type != "nolinks") {
        tmceConfig.theme_advanced_buttons1 += ",link";
    }
    if (type == "nolinks") {
        tmceConfig.editor_selector = "nolinks";
    }
    if (type == "readonly") {
        tmceConfig.readonly = 1;
        tmceConfig.editor_selector = "readonly";
    }
    tinymce.init(tmceConfig);
    return tmceConfig;
};

Zotero.ui.init.libraryTemplates = function() {
    J.views.helpers({
        Zotero: Zotero,
        J: J,
        Modernizr: Modernizr,
        zoteroFieldMap: Zotero.localizations.fieldMap,
        formatItemField: Zotero.ui.formatItemField,
        formatItemDateField: Zotero.ui.formatItemDateField,
        trimString: Zotero.ui.trimString,
        multiplyChar: function(char, num) {
            return Array(num).join(char);
        },
        displayInDetails: function(field, item) {
            if (J.inArray(field, item.hideFields) == -1 && item.fieldMap.hasOwnProperty(field) && J.inArray(field, [ "itemType", "title", "creators", "notes" ]) == -1) {
                return true;
            }
            return false;
        }
    });
    J.views.tags({
        coloredTags: {
            template: "{{for ~tag.tagCtx.args[0].matchColoredTags(~tag.tagCtx.args[1]) tmpl='#coloredtagTemplate' /}}"
        }
    });
};

Zotero.ui.updateItemFromForm = function(item, formEl) {
    Z.debug("Zotero.ui.updateItemFromForm", 3);
    var base = J(formEl);
    base.closest(".eventfulwidget").data("ignoreformstorage", true);
    var library = Zotero.ui.getAssociatedLibrary(base);
    var itemKey = "";
    if (item.itemKey) itemKey = item.itemKey; else {
        if (library) {
            item.associateWithLibrary(library);
        }
        var collectionKey = Zotero.state.getUrlVar("collectionKey");
        if (collectionKey) {
            item.addToCollection(collectionKey);
        }
    }
    J.each(item.apiObj, function(field, value) {
        var selector, inputValue, noteElID;
        if (field == "note") {
            selector = "textarea[data-itemKey='" + itemKey + "'].rte";
            Z.debug(selector, 4);
            noteElID = base.find(selector).attr("id");
            Z.debug(noteElID, 4);
            inputValue = Zotero.ui.getRte(noteElID);
        } else {
            selector = "[data-itemKey='" + itemKey + "'][name='" + field + "']";
            inputValue = base.find(selector).val();
        }
        if (typeof inputValue !== "undefined") {
            Z.debug("updating item " + field + ": " + inputValue);
            item.set(field, inputValue);
        }
    });
    var creators = [];
    base.find("tr.creator").each(function(index, el) {
        var creator = Zotero.ui.creatorFromElement(el);
        if (creator !== null) {
            creators.push(creator);
        }
    });
    var tags = [];
    base.find("input[id^='tag_']").each(function(index, el) {
        if (J(el).val() !== "") {
            tags.push({
                tag: J(el).val()
            });
        }
    });
    var notes = [];
    base.find("textarea.note-text").each(function(index, el) {
        var noteid = J(el).attr("id");
        var noteContent = Zotero.ui.getRte(noteid);
        var noteItem = new Zotero.Item;
        if (library) {
            noteItem.associateWithLibrary(library);
        }
        noteItem.initEmptyNote();
        noteItem.set("note", noteContent);
        noteItem.setParent(item.itemKey);
        notes.push(noteItem);
    });
    item.notes = notes;
    item.apiObj.creators = creators;
    item.apiObj.tags = tags;
    item.synced = false;
};

Zotero.ui.creatorFromElement = function(el) {
    var name, creator, firstName, lastName;
    var jel = J(el);
    var trindex = parseInt(jel.data("creatorindex"), 10);
    var creatorType = jel.find("select.creator-type-select").val();
    if (jel.hasClass("singleCreator")) {
        name = jel.find("input.creator-name");
        if (!name.val()) {
            return null;
        }
        creator = {
            creatorType: creatorType,
            name: name.val()
        };
    } else if (jel.hasClass("doubleCreator")) {
        firstName = jel.find("input.creator-first-name").val();
        lastName = J(el).find("input.creator-last-name").val();
        if (firstName === "" && lastName === "") {
            return null;
        }
        creator = {
            creatorType: creatorType,
            firstName: firstName,
            lastName: lastName
        };
    }
    return creator;
};

Zotero.ui.saveItem = function(item) {
    Z.debug("pre writeItem debug", 4);
    Z.debug(item, 4);
    var library = item.owningLibrary;
    item.writeItem().then(function(writtenItems) {
        Z.debug("item write finished", 3);
        if (item.writeFailure) {}
        delete Zotero.state.pathVars["action"];
        Zotero.state.pathVars["itemKey"] = item.itemKey;
        Zotero.state.clearUrlVars([ "itemKey", "collectionKey" ]);
        Zotero.state.pushState(true);
    });
    Z.debug("adding new tags to library tags", 3);
    var libTags = library.tags;
    var tags = item.apiObj.tags;
    J.each(tags, function(index, tagOb) {
        var tagString = tagOb.tag;
        if (!libTags.tagObjects.hasOwnProperty(tagString)) {
            var tag = new Zotero.Tag;
            tag.title = tagString;
            tag.numItems = 1;
            tag.urlencodedtag = encodeURIComponent(tag.title);
            libTags.tagObjects[tagString] = tag;
            libTags.updateSecondaryData();
        }
    });
};

Zotero.ui.saveFormData = function() {
    Z.debug("saveFormData", 3);
    J(".eventfulwidget").each(function() {
        var formInputs = J(this).find("input");
        J(this).data("tempformstorage", formInputs);
    });
};

Zotero.ui.loadFormData = function(el) {
    Z.debug("loadFormData", 3);
    var formData = J(el).data("tempformstorage");
    if (J(el).data("ignoreformstorage")) {
        Z.debug("ignoring stored form data", 3);
        J(el).removeData("tempFormStorage");
        J(el).removeData("ignoreFormStorage");
        return;
    }
    Z.debug("formData: ", 4);
    Z.debug(formData, 4);
    if (formData) {
        formData.each(function(index) {
            var idstring = "#" + J(this).attr("id");
            Z.debug("idstring:" + idstring, 4);
            if (J(idstring).length) {
                Z.debug("setting value of " + idstring, 4);
                J(idstring).val(J(this).val());
            }
        });
    }
};

Zotero.ui.itemTypeClass = function(item) {
    var itemTypeClass = item.itemType;
    if (item.itemType == "attachment") {
        if (item.mimeType == "application/pdf") {
            itemTypeClass += "-pdf";
        } else {
            switch (item.linkMode) {
              case 0:
                itemTypeClass += "-file";
                break;
              case 1:
                itemTypeClass += "-file";
                break;
              case 2:
                itemTypeClass += "-snapshot";
                break;
              case 3:
                itemTypeClass += "-web-link";
                break;
            }
        }
    }
    return "img-" + itemTypeClass;
};

Zotero.ui.createPagination = function(feed, pageVar, config) {
    var page = parseInt(Zotero.state.getUrlVar(pageVar), 10) || 1;
    var start = parseInt(config.start, 10) || 0;
    var limit = parseInt(config.limit, 10) || 25;
    var totalResults = parseInt(feed.totalResults, 10);
    var lastDisplayed = start + limit;
    var prevPageNum = page - 1;
    var nextPageNum = page + 1;
    var lastPageNum = feed.lastPage;
    var pagination = {
        page: page
    };
    pagination.showFirstLink = start > 0;
    pagination.showPrevLink = start > 0;
    pagination.showNextLink = totalResults > lastDisplayed;
    pagination.showLastLink = totalResults > lastDisplayed;
    var mutateOb = {};
    pagination.firstLink = Zotero.state.mutateUrl(mutateOb, [ pageVar ]);
    mutateOb[pageVar] = page - 1;
    pagination.prevLink = Zotero.state.mutateUrl(mutateOb, []);
    mutateOb[pageVar] = page + 1;
    pagination.nextLink = Zotero.state.mutateUrl(mutateOb, []);
    mutateOb[pageVar] = feed.lastPage;
    pagination.lastLink = Zotero.state.mutateUrl(mutateOb, []);
    pagination.start = start;
    pagination.lastDisplayed = Math.min(lastDisplayed, totalResults);
    pagination.total = totalResults;
    Z.debug("last displayed:" + lastDisplayed + " totalResults:" + feed.totalResults, 4);
    return pagination;
};

Zotero.ui.getAssociatedLibrary = function(el) {
    Z.debug("Zotero.ui.getAssociatedLibrary", 3);
    var jel;
    if (typeof el == "undefined") {
        jel = J(".zotero-library").first();
    } else {
        jel = J(el);
        if (jel.length === 0 || jel.is("#eventful")) {
            jel = J(".zotero-library").first();
            if (jel.length === 0) {
                Z.debug("No element passed and no default found for getAssociatedLibrary.");
                throw new Error("No element passed and no default found for getAssociatedLibrary.");
            }
        }
    }
    var library = jel.data("zoterolibrary");
    if (!library) {
        var libString = J(el).data("library");
        if (libString) {
            if (Zotero.libraries.hasOwnProperty(libString)) {
                library = Zotero.libraries[libString];
            } else {
                var libConfig = Zotero.utils.parseLibString(libString);
                library = new Zotero.Library(libConfig.libraryType, libConfig.libraryID);
                Zotero.libraries[libString] = library;
            }
        }
        jel.data("zoterolibrary", library);
    }
    return library;
};

Zotero.ui.getEventLibrary = function(e) {
    var tel = J(e.triggeringElement);
    if (e.library) {
        return e.library;
    }
    if (e.data && e.data.library) {
        return e.data.library;
    }
    Z.debug(e);
    var libString = tel.data("library");
    if (!libString) {
        throw "no library on event or libString on triggeringElement";
    }
    if (Zotero.libraries.hasOwnProperty(libString)) {
        return Zotero.libraries[libString];
    }
    var libConfig = Zotero.ui.parseLibString(libString);
    library = new Zotero.Library(libConfig.libraryType, libConfig.libraryID, "");
    Zotero.libraries[Zotero.utils.libraryString(libraryType, libraryID)] = library;
};

Zotero.ui.getPrioritizedVariable = function(key, defaultVal) {
    var val = Zotero.state.getUrlVar(key) || Zotero.preferences.getPref(key) || Zotero.config.defaultApiArgs[key] || defaultVal;
    return val;
};

Zotero.ui.scrollToTop = function() {
    window.scrollBy(0, -5e3);
};

Zotero.ui.parentWidgetEl = function(el) {
    var matching;
    if (el.hasOwnProperty("data") && el.data.hasOwnProperty("widgetEl")) {
        Z.debug("event had widgetEl associated with it");
        return J(el.data.widgetEl);
    } else if (el.hasOwnProperty("currentTarget")) {
        Z.debug("event currentTarget set");
        matching = J(el.currentTarget).closest(".eventfulwidget");
        if (matching.length > 0) {
            return matching.first();
        } else {
            Z.debug("no matching closest to currentTarget");
            Z.debug(el.currentTarget);
            Z.debug(el.currentTarget);
        }
    }
    matching = J(el).closest(".eventfulwidget");
    if (matching.length > 0) {
        Z.debug("returning first closest widget");
        return matching.first();
    }
    return null;
};

Zotero.ui.getSelectedItemKeys = function(container) {
    Z.debug("Zotero.ui.getSelectedItemKeys", 3);
    if (!container) {
        container = J("body");
    } else {
        container = J(container);
    }
    var itemKeys = [];
    var curItemKey = Zotero.state.getUrlVar("itemKey");
    if (curItemKey && Zotero.config.preferUrlItem !== false) {
        itemKeys.push(curItemKey);
    } else {
        container.find("input.itemKey-checkbox:checked").each(function(index, val) {
            itemKeys.push(J(val).data("itemkey"));
        });
    }
    return itemKeys;
};

Zotero.ui.getAllFormItemKeys = function(container) {
    Z.debug("Zotero.ui.getAllFormItemKeys", 3);
    if (!container) {
        container = J("body");
    } else {
        container = J(container);
    }
    var itemKeys = [];
    var curItemKey = Zotero.state.getUrlVar("itemKey");
    container.find("input.itemKey-checkbox").each(function(index, val) {
        itemKeys.push(J(val).data("itemkey"));
    });
    return itemKeys;
};

Zotero.ui.getRte = function(el) {
    Z.debug("getRte", 3);
    Z.debug(el);
    switch (Zotero.config.rte) {
      case "ckeditor":
        return CKEDITOR.instances[el].getData();
      default:
        return tinyMCE.get(el).getContent();
    }
};

Zotero.ui.updateRte = function(el) {
    switch (Zotero.config.rte) {
      case "ckeditor":
        var elid = "#" + el;
        data = CKEDITOR.instances[el].getData();
        J(elid).val(data);
        break;
      default:
        tinyMCE.updateContent(el);
    }
};

Zotero.ui.deactivateRte = function(el) {
    switch (Zotero.config.rte) {
      case "ckeditor":
        var elid = "#" + el;
        data = CKEDITOR.instances[el].destroy();
        break;
      default:
        tinymce.execCommand("mceRemoveControl", true, el);
    }
};

Zotero.ui.jsNotificationMessage = function(message, type, timeout) {
    Z.debug("notificationMessage: " + type + " : " + message, 3);
    if (Zotero.config.suppressErrorNotifications) return;
    if (!timeout) {
        timeout = 5;
    }
    var alertType = "alert-info";
    if (type) {
        switch (type) {
          case "error":
            alertType = "alert-danger";
            break;
          case "success":
            alertType = "alert-success";
            break;
          case "info":
            alertType = "alert-info";
            break;
          case "warning":
            alertType = "alert-warning";
            break;
        }
    }
    J("#js-message").append("<div class='alert " + alertType + "'>" + message + "</div>").children("div").delay(parseInt(timeout, 10) * 1e3).slideUp().delay(300).queue(function() {
        J(this).remove();
    });
};

Zotero.ui.ajaxErrorMessage = function(jqxhr) {
    Z.debug("Zotero.ui.ajaxErrorMessage", 3);
    if (typeof jqxhr == "undefined") {
        Z.debug("ajaxErrorMessage called with undefined argument");
        return "";
    }
    Z.debug(jqxhr, 3);
    switch (jqxhr.status) {
      case 403:
        if (Zotero.config.loggedIn || Zotero.config.ignoreLoggedInStatus) {
            return "You do not have permission to view this library.";
        } else {
            Zotero.config.suppressErrorNotifications = true;
            window.location = "/user/login";
            return "";
        }
        break;
      case 404:
        Zotero.ui.jsNotificationMessage("A requested resource could not be found.", "error");
        break;
      case 400:
        Zotero.ui.jsNotificationMessage("Bad Request", "error");
        break;
      case 405:
        Zotero.ui.jsNotificationMessage("Method not allowed", "error");
        break;
      case 412:
        Zotero.ui.jsNotificationMessage("Precondition failed", "error");
        break;
      case 500:
        Zotero.ui.jsNotificationMessage("Something went wrong but we're not sure what.", "error");
        break;
      case 501:
        Zotero.ui.jsNotificationMessage("We can't do that yet.", "error");
        break;
      case 503:
        Zotero.ui.jsNotificationMessage("We've gone away for a little while. Please try again in a few minutes.", "error");
        break;
      default:
        Z.debug("jqxhr status did not match any expected case");
        Z.debug(jqxhr.status);
    }
    return "";
};

Zotero.ui.showSpinner = function(el, type) {
    var spinnerUrl = Zotero.config.baseWebsiteUrl + "static/images/theme/broken-circle-spinner.gif";
    if (!type) {
        J(el).html("<img class='spinner' src='" + spinnerUrl + "'/>");
    } else if (type == "horizontal") {
        J(el).html("<img class='spinner' src='" + spinnerUrl + "'/>");
    }
};

Zotero.ui.appendSpinner = function(el) {
    var spinnerUrl = Zotero.config.baseWebsiteUrl + "static/images/theme/broken-circle-spinner.gif";
    J(el).append("<img class='spinner' src='" + spinnerUrl + "'/>");
};

Zotero.ui.zoteroItemUpdated = function() {
    try {
        var ev = document.createEvent("HTMLEvents");
        ev.initEvent("ZoteroItemUpdated", true, true);
        document.dispatchEvent(ev);
    } catch (e) {
        Zotero.debug("Error triggering ZoteroItemUpdated event");
    }
};

Zotero.ui.dialog = function(el, options) {
    Z.debug("Zotero.ui.dialog", 3);
    options.show = true;
    options.backdrop = false;
    J(el).modal(options);
    J(el).modal("show");
    Z.debug("exiting Zotero.ui.dialog", 3);
};

Zotero.ui.closeDialog = function(el) {
    J(el).modal("hide");
};

Zotero.ui.widgets.addToCollectionDialog = {};

Zotero.ui.widgets.addToCollectionDialog.init = function(el) {
    Z.debug("addtocollectionsdialog widget init", 3);
    var library = Zotero.ui.getAssociatedLibrary(el);
    library.listen("addToCollectionDialog", Zotero.ui.widgets.addToCollectionDialog.show, {
        widgetEl: el
    });
};

Zotero.ui.widgets.addToCollectionDialog.show = function(evt) {
    Z.debug("addToCollectionDialog.show", 3);
    var triggeringEl = J(evt.triggeringElement);
    var library = Zotero.ui.getAssociatedLibrary(triggeringEl);
    var ncollections = library.collections.nestedOrderingArray();
    var widgetEl = J(evt.data.widgetEl).empty();
    widgetEl.html(J("#addtocollectiondialogTemplate").render({
        ncollections: ncollections
    }));
    var dialogEl = widgetEl.find(".add-to-collection-dialog");
    var addToFunction = function() {
        Z.debug("addToCollection callback", 3);
        var targetCollection = dialogEl.find(".collectionKey-select").val();
        Z.debug("move to: " + targetCollection, 4);
        Zotero.ui.addToCollection(targetCollection, library);
        Zotero.ui.closeDialog(dialogEl);
        return false;
    };
    dialogEl.find(".addButton").on("click", addToFunction);
    Zotero.ui.dialog(dialogEl, {});
    return false;
};

Zotero.ui.addToCollection = function(collectionKey, library) {
    Z.debug("add-to-collection clicked", 3);
    var itemKeys = Zotero.state.getSelectedItemKeys();
    if (!collectionKey) {
        Zotero.ui.jsNotificationMessage("No collection selected", "error");
        return false;
    }
    if (itemKeys.length === 0) {
        Zotero.ui.jsNotificationMessage("No items selected", "notice");
        return false;
    }
    Z.debug(itemKeys, 4);
    Z.debug(collectionKey, 4);
    library.collections.getCollection(collectionKey).addItems(itemKeys).then(function(response) {
        library.dirty = true;
        Zotero.ui.jsNotificationMessage("Items added to collection", "success");
    });
    return false;
};

Zotero.ui.widgets.breadcrumbs = {};

Zotero.ui.widgets.breadcrumbs.init = function(el) {
    var library = Zotero.ui.getAssociatedLibrary(el);
    library.listen("displayedItemsChanged displayedItemChanged selectedCollectionChanged", Zotero.ui.libraryBreadcrumbs);
};

Zotero.ui.libraryBreadcrumbs = function(library, config) {
    Z.debug("Zotero.ui.libraryBreadcrumbs", 3);
    try {
        var breadcrumbs = [];
        if (!library) {
            library = Zotero.ui.getAssociatedLibrary(J("#feed-link-div"));
        }
        if (!config) {
            config = Zotero.state.getUrlVars();
        }
        if (Zotero.config.breadcrumbsBase) {
            J.each(Zotero.config.breadcrumbsBase, function(ind, crumb) {
                breadcrumbs.push(crumb);
            });
        } else if (library.libraryType == "user") {
            breadcrumbs = [ {
                label: "Home",
                path: "/"
            }, {
                label: "People",
                path: "/people"
            }, {
                label: library.libraryLabel || library.libraryUrlIdentifier,
                path: "/" + library.libraryUrlIdentifier
            }, {
                label: "Library",
                path: "/" + library.libraryUrlIdentifier + "/items"
            } ];
        } else {
            breadcrumbs = [ {
                label: "Home",
                path: "/"
            }, {
                label: "Groups",
                path: "/groups"
            }, {
                label: library.libraryLabel || library.libraryUrlIdentifier,
                path: "/groups/" + library.libraryUrlIdentifier
            }, {
                label: "Library",
                path: "/groups/" + library.libraryUrlIdentifier + "/items"
            } ];
        }
        if (config.collectionKey) {
            Z.debug("have collectionKey", 4);
            curCollection = library.collections.getCollection(config.collectionKey);
            if (curCollection) {
                breadcrumbs.push({
                    label: curCollection.get("name"),
                    path: Zotero.state.buildUrl({
                        collectionKey: config.collectionKey
                    })
                });
            }
        }
        if (config.itemKey) {
            Z.debug("have itemKey", 4);
            breadcrumbs.push({
                label: library.items.getItem(config.itemKey).title,
                path: Zotero.state.buildUrl({
                    collectionKey: config.collectionKey,
                    itemKey: config.itemKey
                })
            });
        }
        Z.debug(breadcrumbs, 4);
        widgetEl = J("#breadcrumbs").empty();
        widgetEl.html(J("#breadcrumbsTemplate").render({
            breadcrumbs: breadcrumbs
        }));
        var newtitle = J("#breadcrumbstitleTemplate", {
            breadcrumbs: breadcrumbs
        }).text();
        if (newtitle) {
            Zotero.state.updateStateTitle(newtitle);
        }
        Z.debug("done with breadcrumbs", 4);
    } catch (e) {
        Zotero.debug("Error loading breadcrumbs", 2);
        Zotero.debug(e, 1);
    }
};

Zotero.ui.widgets.chooseLibraryDialog = {};

Zotero.ui.widgets.chooseLibraryDialog.init = function(el) {
    Z.debug("chooselibrarydialog widget init", 3);
    var library = Zotero.ui.getAssociatedLibrary(el);
    library.listen("chooseLibrary", Zotero.ui.widgets.chooseLibraryDialog.show, {
        widgetEl: el
    });
};

Zotero.ui.widgets.chooseLibraryDialog.show = function(e) {
    Z.debug("chooseLibraryDialog.show", 3);
    var triggeringEl = J(e.triggeringElement);
    var library = Zotero.ui.getAssociatedLibrary(triggeringEl);
    var ncollections = library.collections.nestedOrderingArray();
    var widgetEl = J(e.data["widgetEl"]).empty();
    widgetEl(J("#addtocollectiondialogTemplate").render({
        ncollections: ncollections
    }));
    var dialogEl = widgetEl.find(".add-to-collection-dialog");
    var addToFunction = J.proxy(function() {
        Z.debug("add-to-collection-select changed", 3);
        var targetCollection = dialogEl.find(".target-collection").val();
        Z.debug("move to: " + targetCollection, 4);
        Zotero.ui.addToCollection(targetCollection, library);
        Zotero.ui.closeDialog(dialogEl);
        return false;
    }, this);
    dialogEl.find(".addButton").on("click", addToFunction);
    Zotero.ui.dialog(dialogEl, {});
    return false;
};

Zotero.ui.widgets.chooseLibraryDialog.getAccessibleLibraries = function() {};

Zotero.ui.widgets.citeItemDialog = {};

Zotero.ui.widgets.citeItemDialog.init = function(el) {
    Z.debug("citeItemDialog widget init", 3);
    var library = Zotero.ui.getAssociatedLibrary(el);
    Zotero.ui.widgets.citeItemDialog.getAvailableStyles();
    library.listen("citeItems", Zotero.ui.widgets.citeItemDialog.show, {
        widgetEl: el
    });
};

Zotero.ui.widgets.citeItemDialog.show = function(evt) {
    Z.debug("citeItemDialog.show", 3);
    var triggeringEl = J(evt.triggeringElement);
    var hasIndependentItems = false;
    var cslItems = [];
    var library;
    if (evt.hasOwnProperty("zoteroItems")) {
        hasIndependentItems = true;
        J.each(evt.zoteroItems, function(ind, item) {
            var cslItem = item.cslItem();
            cslItems.push(cslItem);
        });
    } else {
        library = Zotero.ui.getAssociatedLibrary(triggeringEl);
    }
    var widgetEl = J(evt.data.widgetEl).empty();
    widgetEl.html(J("#citeitemdialogTemplate").render({
        freeStyleInput: true
    }));
    var dialogEl = widgetEl.find(".cite-item-dialog");
    var citeFunction = function(e) {
        Z.debug("citeFunction", 3);
        var triggeringElement = J(evt.currentTarget);
        var style = "";
        if (triggeringElement.is(".cite-item-select, input.free-text-style-input")) {
            style = triggeringElement.val();
        } else {
            style = dialogEl.find(".cite-item-select").val();
            var freeStyle = dialogEl.find("input.free-text-style-input").val();
            if (J.inArray(freeStyle, Zotero.styleList) !== -1) {
                style = freeStyle;
            }
        }
        if (!hasIndependentItems) {
            var itemKeys = Zotero.state.getSelectedItemKeys();
            if (itemKeys.length === 0) {
                itemKeys = Zotero.state.getSelectedItemKeys();
            }
            Z.debug(itemKeys, 4);
            library.loadFullBib(itemKeys, style).then(function(bibContent) {
                dialogEl.find(".cite-box-div").html(bibContent);
            });
        } else {
            Zotero.ui.widgets.citeItemDialog.directCite(cslItems, style).then(function(bibContent) {
                dialogEl.find(".cite-box-div").html(bibContent);
            });
        }
    };
    dialogEl.find(".cite-item-select").on("change", citeFunction);
    dialogEl.find("input.free-text-style-input").on("change", citeFunction);
    Zotero.ui.widgets.citeItemDialog.getAvailableStyles();
    dialogEl.find("input.free-text-style-input").typeahead({
        local: Zotero.styleList,
        limit: 10
    });
    Zotero.ui.dialog(dialogEl, {});
    return false;
};

Zotero.ui.widgets.citeItemDialog.getAvailableStyles = function() {
    if (!Zotero.styleList) {
        Zotero.styleList = [];
        J.getJSON(Zotero.config.styleListUrl, function(data) {
            Zotero.styleList = data;
        });
    }
};

Zotero.ui.widgets.citeItemDialog.directCite = function(cslItems, style) {
    var data = {};
    data.items = cslItems;
    var url = Zotero.config.citationEndpoint + "?linkwrap=1&style=" + style;
    return J.post(url, JSON.stringify(data));
};

Zotero.ui.widgets.citeItemDialog.buildBibString = function(bib) {
    var bibMeta = bib.bibliography[0];
    var bibEntries = bib.bibliography[1];
    var bibString = bibMeta.bibstart;
    for (var i = 0; i < bibEntries.length; i++) {
        bibString += bibEntries[i];
    }
    bibString += bibMeta.bibend;
    return bibString;
};

Zotero.ui.widgets.collections = {};

Zotero.ui.widgets.collections.init = function(el) {
    Z.debug("collections widget init", 3);
    var library = Zotero.ui.getAssociatedLibrary(el);
    library.listen("collectionsDirty", Zotero.ui.widgets.collections.syncCollections, {
        widgetEl: el
    });
    library.listen("syncCollections", Zotero.ui.widgets.collections.syncCollections, {
        widgetEl: el
    });
    library.listen("syncLibrary", Zotero.ui.widgets.collections.syncCollections, {
        widgetEl: el
    });
    library.listen("cachedDataLoaded", Zotero.ui.widgets.collections.syncCollections, {
        widgetEl: el
    });
    library.listen("libraryCollectionsUpdated", Zotero.ui.widgets.collections.rerenderCollections, {
        widgetEl: el
    });
    library.listen("selectCollection", Zotero.ui.widgets.collections.selectCollection, {
        widgetEl: el
    });
    library.listen("selectedCollectionChanged", Zotero.ui.widgets.collections.updateSelectedCollection, {
        widgetEl: el
    });
    Zotero.ui.widgets.collections.bindCollectionLinks(el);
};

Zotero.ui.widgets.collections.syncCollections = function(evt) {
    Zotero.debug("Zotero eventful syncCollectionsCallback", 3);
    var widgetEl = J(evt.data.widgetEl);
    var loadingPromise = widgetEl.data("loadingPromise");
    if (loadingPromise) {
        var p = widgetEl.data("loadingPromise");
        return p.then(function() {
            return Zotero.ui.widgets.collections.syncCollections(evt);
        });
    }
    var library = Zotero.ui.getAssociatedLibrary(widgetEl);
    return library.loadUpdatedCollections().then(function() {
        library.trigger("libraryCollectionsUpdated");
    }, function() {
        library.trigger("libraryCollectionsUpdated");
    }).then(function() {
        widgetEl.removeData("loadingPromise");
    });
};

Zotero.ui.widgets.collections.rerenderCollections = function(evt) {
    Zotero.debug("Zotero.ui.widgets.collections.rerenderCollections", 3);
    var widgetEl = J(evt.data.widgetEl);
    var library = Zotero.ui.getAssociatedLibrary(widgetEl);
    var collectionListEl = widgetEl.find("#collection-list-container");
    collectionListEl.empty();
    Zotero.ui.widgets.collections.renderCollectionList(collectionListEl, library.collections);
    Z.debug("done rendering collections");
    library.trigger("selectedCollectionChanged");
};

Zotero.ui.widgets.collections.selectCollection = function(evt) {};

Zotero.ui.widgets.collections.updateSelectedCollection = function(evt) {
    Zotero.debug("Zotero eventful updateSelectedCollection", 3);
    var widgetEl = J(evt.data.widgetEl);
    var collectionListEl = widgetEl.find(".collection-list-container");
    Zotero.ui.widgets.collections.highlightCurrentCollection(widgetEl);
    Zotero.ui.widgets.collections.nestHideCollectionTree(collectionListEl);
    Zotero.ui.widgets.collections.updateCollectionButtons(widgetEl);
    return;
};

Zotero.ui.widgets.collections.updateCollectionButtons = function(el) {
    if (!el) {
        el = J("body");
    }
    jel = J(el);
    if (Zotero.state.getUrlVar("collectionKey")) {
        jel.find(".update-collection-button").removeClass("disabled");
        jel.find(".delete-collection-button").removeClass("disabled");
    } else {
        jel.find(".update-collection-button").addClass("disabled");
        jel.find(".delete-collection-button").addClass("disabled");
    }
};

Zotero.ui.widgets.collections.renderCollectionList = function(el, collections) {
    Z.debug("Zotero.ui.renderCollectionList", 3);
    var widgetEl = J(el);
    var currentCollectionKey = Zotero.state.getUrlVar("collectionKey") || "";
    var trash = collections.owningLibrary.libraryType == "user" ? true : false;
    widgetEl.append(J("#collectionlistTemplate").render({
        collections: collections.collectionsArray,
        libUrlIdentifier: collections.libraryUrlIdentifier,
        currentCollectionKey: currentCollectionKey,
        trash: trash
    }));
};

Zotero.ui.widgets.collections.bindCollectionLinks = function(container) {
    Z.debug("Zotero.ui.bindCollectionLinks", 3);
    var library = Zotero.ui.getAssociatedLibrary(container);
    J(container).on("click", "div.folder-toggle", function(e) {
        e.preventDefault();
        J(this).siblings(".collection-select-link").click();
        return false;
    });
    J(container).on("click", ".collection-select-link", function(e) {
        Z.debug("collection-select-link clicked", 4);
        e.preventDefault();
        var collectionKey = J(this).attr("data-collectionkey");
        if (J(this).hasClass("current-collection")) {
            var expanded = J(".current-collection").data("expanded");
            if (expanded === true) {
                Zotero.ui.widgets.collections.nestHideCollectionTree(J("#collection-list-container"), false);
            } else {
                Zotero.ui.widgets.collections.nestHideCollectionTree(J("#collection-list-container"), true);
            }
            Zotero.state.clearUrlVars([ "collectionKey", "mode" ]);
            return false;
        }
        library.trigger("selectCollection", {
            collectionKey: collectionKey
        });
        Z.debug("click " + collectionKey, 4);
        Zotero.state.clearUrlVars([ "mode" ]);
        Zotero.state.pathVars["collectionKey"] = collectionKey;
        Zotero.state.pushState();
        return false;
    });
    J(container).on("click", "a.my-library", function(e) {
        e.preventDefault();
        Zotero.state.clearUrlVars([ "mode" ]);
        Zotero.state.pushState();
        return false;
    });
};

Zotero.ui.widgets.collections.nestHideCollectionTree = function(el, expandSelected) {
    Z.debug("nestHideCollectionTree", 3);
    if (typeof expandSelected == "undefined") {
        expandSelected = true;
    }
    var jel = J(el);
    jel.find("#collection-list ul").hide().siblings(".folder-toggle").children(".placeholder").addClass("glyphicon").addClass("glyphicon-chevron-right");
    jel.find(".current-collection").parents("ul").show();
    jel.find("#collection-list li.current-collection").children("ul").show();
    jel.find(".glyphicon-chevron-down").removeClass("glyphicon-chevron-down").addClass("glyphicon-chevron-right");
    jel.find("li.current-collection").parentsUntil("#collection-list").children("div.folder-toggle").find(".glyphicon-chevron-right").removeClass("glyphicon-chevron-right").addClass("glyphicon-chevron-down");
    if (expandSelected === false) {
        jel.find("#collection-list li.current-collection").children("ul").hide();
        jel.find("#collection-list li.current-collection").find(".glyphicon-chevron-down").removeClass("glyphicon-chevron-down").addClass("glyphicon-chevron-right");
        jel.find(".current-collection").data("expanded", false);
    } else {
        jel.find("li.current-collection").children("div.folder-toggle").find(".glyphicon-chevron-right").removeClass("glyphicon-chevron-right").addClass("glyphicon-chevron-down");
        jel.find(".current-collection").data("expanded", true);
    }
};

Zotero.ui.widgets.collections.highlightCurrentCollection = function(widgetEl) {
    Z.debug("Zotero.ui.widgets.collections.highlightCurrentCollection", 3);
    if (!widgetEl) {
        widgetEl = J("body");
    }
    var widgetEl = J(widgetEl);
    var collectionKey = Zotero.state.getUrlVar("collectionKey");
    widgetEl.find("a.current-collection").closest("li").removeClass("current-collection");
    widgetEl.find("a.current-collection").removeClass("current-collection");
    if (collectionKey) {
        widgetEl.find("a[data-collectionKey='" + collectionKey + "']").addClass("current-collection");
        widgetEl.find("a[data-collectionKey='" + collectionKey + "']").closest("li").addClass("current-collection");
    } else {
        widgetEl.find("a.my-library").addClass("current-collection");
        widgetEl.find("a.my-library").closest("li").addClass("current-collection");
    }
};

Zotero.ui.widgets.controlPanel = {};

Zotero.ui.widgets.controlPanel.init = function(el) {
    Z.debug("Zotero.eventful.init.controlPanel", 3);
    var library = Zotero.ui.getAssociatedLibrary(el);
    Zotero.ui.showControlPanel(el);
    library.listen("selectedItemsChanged", Zotero.ui.widgets.controlPanel.selectedItemsChanged, {
        widgetEl: el
    });
    library.listen("removeFromCollection", Zotero.ui.widgets.controlPanel.removeFromCollection, {
        widgetEl: el
    });
    library.listen("moveToTrash", Zotero.ui.widgets.controlPanel.moveToTrash), {
        widgetEl: el
    };
    library.listen("removeFromTrash", Zotero.ui.widgets.controlPanel.removeFromTrash, {
        widgetEl: el
    });
    library.listen("toggleEdit", Zotero.ui.widgets.controlPanel.toggleEdit, {
        widgetEl: el
    });
    var container = J(el);
    Zotero.ui.widgets.controlPanel.updateDisabledControlButtons();
};

Zotero.ui.widgets.controlPanel.contextChanged = function(evt) {
    Zotero.ui.widgets.controlPanel.updateDisabledControlButtons();
};

Zotero.ui.widgets.controlPanel.selectedItemsChanged = function(evt) {
    Z.debug("Zotero.ui.widgets.controlPanel.selectedItemsChanged", 3);
    var selectedItemKeys = evt.selectedItemKeys;
    if (!selectedItemKeys) {
        selectedItemKeys = [];
    }
    Zotero.ui.widgets.controlPanel.updateDisabledControlButtons(selectedItemKeys);
};

Zotero.ui.widgets.controlPanel.updateDisabledControlButtons = function(selectedItemKeys) {
    Z.debug("Zotero.ui.widgets.controlPanel.updateDisabledControlButtons", 3);
    if (!selectedItemKeys) {
        selectedItemKeys = [];
    }
    J(".move-to-trash-button").prop("title", "Move to Trash");
    J(".create-item-button").removeClass("disabled");
    if (selectedItemKeys.length === 0 && !Zotero.state.getUrlVar("itemKey")) {
        J(".add-to-collection-button").addClass("disabled");
        J(".remove-from-collection-button").addClass("disabled");
        J(".move-to-trash-button").addClass("disabled");
        J(".remove-from-trash-button").addClass("disable");
        J(".cite-button").addClass("disabled");
        J(".export-button").addClass("disabled");
    } else {
        J(".add-to-collection-button").removeClass("disabled");
        J(".remove-from-collection-button").removeClass("disabled");
        J(".move-to-trash-button").removeClass("disabled");
        if (Zotero.state.getUrlVar("collectionKey") == "trash") {
            J(".remove-from-trash-button").removeClass("disabled");
        }
        J(".cite-button").removeClass("disabled");
        J(".export-button").removeClass("disabled");
    }
    if (!Zotero.state.getUrlVar("collectionKey")) {
        J(".remove-from-collection-button").addClass("disabled");
    } else if (Zotero.state.getUrlVar("collectionKey") == "trash") {
        J(".create-item-button").addClass("disabled");
        J(".add-to-collection-button").addClass("disabled");
        J(".remove-from-collection-button").addClass("disabled");
        J(".move-to-trash-button").prop("title", "Permanently Delete");
    }
};

Zotero.ui.widgets.controlPanel.toggleEdit = function(e) {
    Z.debug("edit checkbox toggled", 3);
    var curMode = Zotero.state.getUrlVar("mode");
    if (curMode != "edit") {
        Zotero.state.pathVars["mode"] = "edit";
    } else {
        delete Zotero.state.pathVars["mode"];
    }
    Zotero.state.pushState();
    return false;
};

Zotero.ui.callbacks.createItem = function(e) {
    Z.debug("create-item-Link clicked", 3);
    var collectionKey = Zotero.state.getUrlVar("collectionKey");
    if (collectionKey) {
        Zotero.state.pathVars = {
            action: "newItem",
            mode: "edit",
            collectionKey: collectionKey
        };
    } else {
        Zotero.state.pathVars = {
            action: "newItem",
            mode: "edit"
        };
    }
    Zotero.state.pushState();
    return false;
};

Zotero.ui.callbacks.moveToTrash = function(evt) {
    evt.preventDefault();
    Z.debug("move-to-trash clicked", 3);
    var itemKeys = Zotero.state.getSelectedItemKeys();
    Z.debug(itemKeys, 3);
    var triggeringEl = J(evt.triggeringElement);
    var library = Zotero.ui.getAssociatedLibrary(triggeringEl);
    var response;
    var trashingItems = library.items.getItems(itemKeys);
    var deletingItems = [];
    Zotero.ui.showSpinner(J("#library-items-div"));
    if (Zotero.state.getUrlVar("collectionKey") == "trash") {
        var i;
        for (i = 0; i < trashingItems.length; i++) {
            var item = trashingItems[i];
            if (item.get("deleted")) {
                deletingItems.push(item);
            }
        }
        response = library.items.deleteItems(deletingItems);
    } else {
        response = library.items.trashItems(trashingItems);
    }
    library.dirty = true;
    response.catch(function() {}).then(function() {
        Zotero.state.clearUrlVars([ "collectionKey", "tag", "q" ]);
        Zotero.state.pushState(true);
        library.trigger("displayedItemsChanged");
    });
    return false;
};

Zotero.ui.widgets.controlPanel.removeFromTrash = function(evt) {
    Z.debug("remove-from-trash clicked", 3);
    var widgetEl = J(evt.data.widgetEl);
    var itemKeys = Zotero.state.getSelectedItemKeys();
    Z.debug(itemKeys, 4);
    var triggeringEl = J(evt.triggeringElement);
    var library = Zotero.ui.getAssociatedLibrary(triggeringEl);
    var untrashingItems = library.items.getItems(itemKeys);
    Zotero.ui.showSpinner(J("#library-items-div"));
    var response = library.items.untrashItems(untrashingItems);
    library.dirty = true;
    response.catch(function() {}).then(function() {
        Z.debug("post-removeFromTrash always execute: clearUrlVars", 3);
        Zotero.state.clearUrlVars([ "collectionKey", "tag", "q" ]);
        Zotero.state.pushState();
        library.trigger("displayedItemsChanged");
    });
    return false;
};

Zotero.ui.callbacks.removeFromCollection = function(evt) {
    Z.debug("remove-from-collection clicked", 3);
    var triggeringEl = J(evt.triggeringElement);
    var library = Zotero.ui.getAssociatedLibrary(triggeringEl);
    var itemKeys = Zotero.state.getSelectedItemKeys();
    var collectionKey = Zotero.state.getUrlVar("collectionKey");
    var modifiedItems = [];
    var responses = [];
    J.each(itemKeys, function(index, itemKey) {
        var item = library.items.getItem(itemKey);
        item.removeFromCollection(collectionKey);
        modifiedItems.push(item);
    });
    library.dirty = true;
    library.items.writeItems(modifiedItems).then(function() {
        Z.debug("removal responses finished. forcing reload", 3);
        Zotero.state.clearUrlVars([ "collectionKey", "tag" ]);
        Zotero.state.pushState(true);
        library.trigger("displayedItemsChanged");
    });
    return false;
};

Zotero.ui.showControlPanel = function(el) {
    Z.debug("Zotero.ui.showControlPanel", 3);
    var jel = J(el);
    var mode = Zotero.state.getUrlVar("mode") || "view";
    if (Zotero.config.librarySettings.allowEdit === 0) {
        J(".permission-edit").hide();
        J("#control-panel").hide();
    }
};

Zotero.ui.widgets.createCollectionDialog = {};

Zotero.ui.widgets.createCollectionDialog.init = function(el) {
    Z.debug("createcollectionsdialog widget init", 3);
    var library = Zotero.ui.getAssociatedLibrary(el);
    library.listen("createCollectionDialog", Zotero.ui.widgets.createCollectionDialog.show, {
        widgetEl: el
    });
};

Zotero.ui.widgets.createCollectionDialog.show = function(evt) {
    Z.debug("createCollectionDialog.show", 3);
    var triggeringEl = J(evt.triggeringElement);
    var library = Zotero.ui.getAssociatedLibrary(triggeringEl);
    var ncollections = library.collections.nestedOrderingArray();
    var widgetEl = J(evt.data.widgetEl).empty();
    widgetEl.html(J("#createcollectiondialogTemplate").render({
        ncollections: ncollections
    }));
    var dialogEl = widgetEl.find(".create-collection-dialog");
    var currentCollectionKey = Zotero.state.getUrlVar("collectionKey");
    dialogEl.find(".new-collection-parent").val(currentCollectionKey);
    var createFunction = function() {
        var newCollection = new Zotero.Collection;
        var parentKey = dialogEl.find(".new-collection-parent").val();
        var name = dialogEl.find("input.new-collection-title-input").val() || "Untitled";
        library.addCollection(name, parentKey).then(function(returnCollections) {
            library.collections.initSecondaryData();
            library.trigger("libraryCollectionsUpdated");
            Zotero.state.pushState();
            Zotero.ui.closeDialog(widgetEl.find(".create-collection-dialog"));
            Zotero.ui.jsNotificationMessage("Collection Created", "success");
        });
    };
    dialogEl.find(".createButton").on("click", createFunction);
    Zotero.ui.dialog(dialogEl, {});
};

Zotero.ui.widgets.deleteCollectionDialog = {};

Zotero.ui.widgets.deleteCollectionDialog.init = function(el) {
    Z.debug("deletecollectionsdialog widget init", 3);
    var library = Zotero.ui.getAssociatedLibrary(el);
    library.listen("deleteCollectionDialog", Zotero.ui.widgets.deleteCollectionDialog.show, {
        widgetEl: el
    });
};

Zotero.ui.widgets.deleteCollectionDialog.show = function(evt) {
    Z.debug("deleteCollectionDialog.show", 3);
    var triggeringEl = J(evt.triggeringElement);
    var library = Zotero.ui.getAssociatedLibrary(triggeringEl);
    var currentCollectionKey = Zotero.state.getUrlVar("collectionKey");
    var currentCollection = library.collections.getCollection(currentCollectionKey);
    var widgetEl = J(evt.data.widgetEl).empty();
    widgetEl.html(J("#deletecollectiondialogTemplate").render({
        collection: currentCollection
    }));
    var dialogEl = widgetEl.find(".delete-collection-dialog");
    var deleteFunction = J.proxy(function() {
        Z.debug("Zotero.ui.deleteSelectedCollection", 3);
        var collection = currentCollection;
        if (!collection) {
            Zotero.ui.jsNotificationMessage("Selected collection not found", "error");
            return false;
        }
        collection.remove().then(function() {
            delete Zotero.state.pathVars["collectionKey"];
            library.collections.dirty = true;
            library.collections.initSecondaryData();
            Zotero.state.pushState();
            Zotero.ui.jsNotificationMessage(collection.title + " removed", "confirm");
            Zotero.ui.closeDialog(dialogEl);
        });
        return false;
    }, this);
    dialogEl.find(".deleteButton").on("click", deleteFunction);
    Zotero.ui.dialog(dialogEl, {});
    return false;
};

Zotero.ui.widgets.exportItemsDialog = {};

Zotero.ui.widgets.exportItemsDialog.init = function(el) {
    Z.debug("exportItemDialog widget init", 3);
    var library = Zotero.ui.getAssociatedLibrary(el);
    library.listen("exportItemsDialog", Zotero.ui.widgets.exportItemsDialog.show, {
        widgetEl: el
    });
    library.listen("displayedItemsChanged", Zotero.ui.widgets.exportItemsDialog.updateExportLinks, {
        widgetEl: el
    });
};

Zotero.ui.widgets.exportItemsDialog.show = function(evt) {
    Z.debug("exportitemdialog.show", 3);
    var triggeringEl = J(evt.triggeringElement);
    var library = Zotero.ui.getAssociatedLibrary(triggeringEl);
    var widgetEl = J(evt.data.widgetEl).empty();
    widgetEl.html(J("#exportitemsdialogTemplate").render({}));
    var dialogEl = widgetEl.find(".export-items-dialog");
    dialogEl.find(".modal-body").empty().append(J(".export-list").contents().clone());
    Zotero.ui.dialog(dialogEl, {});
    return false;
};

Zotero.ui.widgets.exportItemsDialog.updateExportLinks = function(e) {
    Z.debug("exportItemsDialog.updateExportLinks", 3);
    var triggeringEl = J(e.triggeringElement);
    var widgetEl = J(e.data["widgetEl"]);
    var library = Zotero.ui.getAssociatedLibrary(widgetEl);
    var urlconfig = Zotero.ui.getItemsConfig(library);
    var exportUrls = Zotero.url.exportUrls(urlconfig);
    J(".export-list").empty().append(J("#exportformatsTemplate").render({
        exportUrls: exportUrls,
        exportFormatsMap: Zotero.config.exportFormatsMap
    }));
    J(".export-list").data("urlconfig", urlconfig);
    J(".export-list").hide();
};

Zotero.ui.widgets.feedlink = {};

Zotero.ui.widgets.feedlink.init = function(el) {
    var library = Zotero.ui.getAssociatedLibrary(el);
    library.listen("displayedItemsChanged", Zotero.ui.widgets.feedlink.recalcFeedlink, {
        widgetEl: el
    });
};

Zotero.ui.widgets.feedlink.recalcFeedlink = function(evt) {
    Z.debug("Zotero eventful loadFeedLinkCallback", 3);
    var widgetEl = J(evt.data.widgetEl);
    var library = Zotero.ui.getAssociatedLibrary(widgetEl);
    var urlconfig = Zotero.ui.getItemsConfig(library);
    var requestUrl = Zotero.ajax.apiRequestUrl(urlconfig) + Zotero.ajax.apiQueryString(urlconfig, false);
    var feedUrl = requestUrl.replace(Zotero.config.baseApiUrl, Zotero.config.baseFeedUrl);
    var newkeyurl = Zotero.url.requestReadApiKeyUrl(library.libraryType, library.libraryID, feedUrl);
    widgetEl.data("urlconfig", urlconfig);
    if (!Zotero.config.librarySettings.publish) {
        J(".feed-link").attr("href", newkeyurl);
    } else {
        J(".feed-link").attr("href", feedUrl);
    }
    J("#library link[rel='alternate']").attr("href", feedUrl);
};

Zotero.ui.widgets.groups = {};

Zotero.ui.userGroupsDisplay = function(groups) {
    var html = "";
    J.each(groups.groupsArray, function(index, group) {
        html += Zotero.ui.groupNugget(group);
    });
    return html;
};

Zotero.ui.displayGroupNuggets = function(el, groups) {
    var jel = J(el);
    jel.empty();
    J.each(groups, function(ind, group) {
        Z.debug("Displaying group nugget");
        Z.debug(group);
        var userID = Zotero.config.loggedInUserID;
        var groupManageable = false;
        var memberCount = 1;
        if (group.apiObj.members) {
            memberCount += group.apiObj.members.length;
        }
        if (group.apiObj.admins) {
            memberCount += group.apiObj.admins.length;
        }
        if (userID && (userID == group.apiObj.owner || J.inArray(userID, group.apiObj.admins) != -1)) {
            groupManageable = true;
        }
        jel.append(J("#groupnuggetTemplate").render({
            group: group.apiObj,
            groupViewUrl: Zotero.url.groupViewUrl(group),
            groupLibraryUrl: Zotero.url.groupLibraryUrl(group),
            groupSettingsUrl: Zotero.url.groupSettingsUrl(group),
            groupLibrarySettings: Zotero.url.groupLibrarySettingsUrl(group),
            memberCount: memberCount,
            groupManageable: groupManageable
        }));
    });
};

Zotero.ui.widgets.item = {};

Zotero.ui.widgets.item.init = function(el) {
    var library = Zotero.ui.getAssociatedLibrary(el);
    library.listen("displayedItemChanged modeChanged", Zotero.ui.widgets.item.loadItemCallback, {
        widgetEl: el
    });
    library.listen("newItem", Zotero.ui.widgets.item.loadItemCallback, {
        widgetEl: el,
        newItem: true
    });
    library.listen("saveItem", Zotero.ui.widgets.item.saveItemCallback, {
        widgetEl: el
    });
    library.listen("cancelItemEdit", Zotero.ui.widgets.item.cancelItemEdit, {
        widgetEl: el
    });
    library.listen("itemTypeChanged", Zotero.ui.widgets.item.itemTypeChanged, {
        widgetEl: el
    });
    library.listen("uploadSuccessful showChildren", Zotero.ui.widgets.item.showChildren, {
        widgetEl: el
    });
    library.listen("addTag", Zotero.ui.widgets.item.addTag, {
        widgetEl: el
    });
    library.listen("removeTag", Zotero.ui.widgets.item.removeTag, {
        widgetEl: el
    });
    library.listen("addCreator", Zotero.ui.widgets.item.addCreator, {
        widgetEl: el
    });
    library.listen("removeCreator", Zotero.ui.widgets.item.removeCreator, {
        widgetEl: el
    });
    library.listen("switchTwoFieldCreator", Zotero.ui.widgets.item.switchTwoFieldCreators, {
        widgetEl: el
    });
    library.listen("switchSingleFieldCreator", Zotero.ui.widgets.item.switchSingleFieldCreator, {
        widgetEl: el
    });
    library.listen("addNote", Zotero.ui.widgets.item.addNote, {
        widgetEl: el
    });
    var container = J(el);
    container.on("keydown", ".itemDetailForm input", Zotero.ui.widgets.item.itemFormKeydown);
    library.trigger("displayedItemChanged");
};

Zotero.ui.widgets.item.loadItemCallback = function(event) {
    Z.debug("Zotero eventful loadItemCallback", 3);
    var widgetEl = J(event.data.widgetEl);
    var triggeringEl = J(event.triggeringElement);
    var loadingPromise;
    Z.debug("Zotero.callbacks.loadItem", 3);
    var library = Zotero.ui.getAssociatedLibrary(widgetEl);
    widgetEl.empty();
    Zotero.ui.showSpinner(widgetEl);
    if (event.data.newItem) {
        var itemType = triggeringEl.data("itemtype");
        if (!itemType) {
            itemType = "document";
        }
        var newItem = new Zotero.Item;
        newItem.libraryType = library.libraryType;
        newItem.libraryID = library.libraryID;
        var loadingPromise = newItem.initEmpty(itemType).then(function(item) {
            Zotero.ui.widgets.item.editItemForm(widgetEl, item);
            widgetEl.data("newitem", item);
        }, function(response) {
            Zotero.ui.jsNotificationMessage("Error loading item template", "error");
        });
        return loadingPromise;
    }
    var itemKey = Zotero.state.getUrlVar("itemKey");
    if (!itemKey) {
        Z.debug("No itemKey - " + itemKey, 3);
        widgetEl.empty();
        return Promise.reject(new Error("No itemkey - " + itemKey));
    }
    var item = library.items.getItem(itemKey);
    if (item) {
        Z.debug("have item locally, loading details into ui", 3);
        loadingPromise = Promise.resolve(item);
    } else {
        Z.debug("must fetch item from server", 3);
        var config = {
            target: "item",
            libraryType: library.type,
            libraryID: library.libraryID,
            itemKey: itemKey,
            content: "json"
        };
        loadingPromise = library.loadItem(itemKey);
    }
    loadingPromise.then(function(item) {
        Z.debug("Library.loadItem done", 3);
        widgetEl.empty();
        if (Zotero.state.getUrlVar("mode") == "edit") {
            Zotero.ui.widgets.item.editItemForm(widgetEl, item);
        } else {
            Zotero.ui.widgets.item.loadItemDetail(item, widgetEl);
            library.trigger("showChildren");
        }
        widgetEl.data("currentconfig", config);
        Zotero.eventful.initTriggers(widgetEl);
    });
    loadingPromise.catch().then(function() {
        widgetEl.removeData("loadingPromise");
    });
    widgetEl.data("loadingPromise", loadingPromise);
    return loadingPromise;
};

Zotero.ui.widgets.item.showChildren = function(e) {
    Z.debug("Zotero.ui.widgets.item.showChildren", 3);
    var widgetEl = J(e.data.widgetEl);
    var itemKey = widgetEl.data("itemkey");
    var library = Zotero.ui.getAssociatedLibrary(widgetEl);
    var item = library.items.getItem(itemKey);
    var attachmentsDiv = J(widgetEl).find(".item-attachments-div");
    Zotero.ui.showSpinner(attachmentsDiv);
    return item.getChildren(library).then(function(childItems) {
        J(".item-attachments-div").html(J("#childitemsTemplate").render({
            childItems: childItems
        }));
    });
};

Zotero.ui.widgets.item.addCreator = function(e) {
    var button = e.triggeringElement;
    Z.debug("Zotero.ui.addCreator", 3);
    var itemKey = J(button).data("itemkey");
    var itemType = J(button).closest("form").find("select.itemType").val();
    var lastcreatorid = J("input[id^='creator_']:last").attr("id");
    var creatornum = 0;
    if (lastcreatorid) {
        creatornum = parseInt(lastcreatorid.substr(8), 10);
    }
    var newindex = creatornum + 1;
    var jel = J("input[id^='creator_']:last").closest("tr");
    jel.after(J("#authorelementsdoubleTemplate").render({
        index: newindex,
        creator: {
            firstName: "",
            lastName: ""
        },
        creatorTypes: Zotero.Item.prototype.creatorTypes[itemType]
    }));
};

Zotero.ui.widgets.item.removeCreator = function(e) {
    var button = e.currentTarget;
    var widgetEl = Zotero.ui.parentWidgetEl(button);
    Z.debug("Zotero.ui.removeCreator", 3);
    if (widgetEl.find("tr.creator").length === 1) {
        Zotero.ui.addCreator(e);
    }
    J(button).closest("tr").remove();
};

Zotero.ui.widgets.item.addNote = function(e) {
    Z.debug("Zotero.ui.addNote", 3);
    var button = J(e.currentTarget);
    var container = button.closest("form");
    var notenum = 0;
    var lastNoteIndex = container.find("textarea.note-text:last").data("noteindex");
    if (lastNoteIndex) {
        notenum = parseInt(lastNoteIndex, 10);
    }
    var newindex = notenum + 1;
    var newNoteID = "note_" + newindex;
    var jel;
    jel = container.find("td.notes button.add-note-button").before('<textarea cols="40" rows="24" name="' + newNoteID + '" id="' + newNoteID + '" class="rte default note-text" data-noteindex="' + newNoteID + '"></textarea>');
    Zotero.ui.init.rte("default", true, newNoteID);
};

Zotero.ui.widgets.item.addTag = function(e, focus) {
    Z.debug("Zotero.ui.widgets.item.addTag", 3);
    if (typeof focus == "undefined") {
        focus = true;
    }
    var widgetEl = Zotero.ui.parentWidgetEl(e);
    var tagnum = 0;
    var lastTagID = widgetEl.find("input[id^='tag_']:last").attr("id");
    if (lastTagID) {
        tagnum = parseInt(lastTagID.substr(4), 10);
    }
    var newindex = tagnum + 1;
    var jel = widgetEl.find("td.tags");
    jel.append(J("#itemtagTemplate").render({
        index: newindex
    }));
    var library = Zotero.ui.getAssociatedLibrary(widgetEl);
    if (library) {
        var typeaheadSource = library.tags.plainList;
        if (!typeaheadSource) {
            typeaheadSource = [];
        }
        widgetEl.find("input.taginput").not(".tt-query").typeahead({
            name: "tags",
            local: typeaheadSource
        });
    }
    if (focus) {
        J("input.taginput").last().focus();
    }
};

Zotero.ui.widgets.item.removeTag = function(e) {
    Z.debug("Zotero.ui.removeTag", 3);
    var el = e.currentTarget;
    var widgetEl = Zotero.ui.parentWidgetEl(el);
    if (widgetEl.find("div.edit-tag-div").length === 1) {
        Zotero.ui.widgets.item.addTag(e);
    }
    J(el).closest(".edit-tag-div").remove();
};

Zotero.ui.widgets.item.editItemForm = function(el, item) {
    Z.debug("Zotero.ui.widgets.item.editItemForm", 3);
    Z.debug(item, 4);
    var jel = J(el).empty();
    var library = Zotero.ui.getAssociatedLibrary(el);
    if (item.itemType == "note") {
        Z.debug("editItemForm - note", 3);
        jel.append(J("#editnoteformTemplate").render({
            item: item,
            itemKey: item.itemKey
        }));
        Zotero.ui.init.rte("default");
    } else if (item.itemType == "attachment") {
        Z.debug("item is attachment", 4);
        var mode = Zotero.state.getUrlVar("mode");
        jel.append(J("#attachmentformTemplate").render({
            item: item,
            itemKey: item.itemKey,
            creatorTypes: [],
            mode: mode
        }));
        if (item.apiObj.tags.length === 0) {
            Zotero.ui.widgets.item.addTag(el, false);
        }
        Zotero.ui.init.rte();
    } else {
        item.getCreatorTypes(item.apiObj.itemType).then(function() {
            Z.debug("getCreatorTypes done", 3);
            if (item.creators.length === 0) {
                item.creators.push({
                    creatorType: item.creatorTypes[item.itemType][0],
                    first: "",
                    last: ""
                });
                item.apiObj.creators = item.creators;
            }
            jel.append(J("#itemformTemplate").render({
                item: item,
                library: library,
                itemKey: item.itemKey,
                creatorTypes: Zotero.Item.prototype.creatorTypes[item.apiObj.itemType],
                saveable: true,
                citable: false
            }));
            if (item.apiObj.tags.length === 0) {
                Zotero.ui.widgets.item.addTag(el, false);
            }
            Zotero.eventful.initTriggers(jel);
        });
    }
    var typeaheadSource = library.tags.plainList;
    if (!typeaheadSource) {
        typeaheadSource = [];
    }
    jel.find("input.taginput").typeahead("destroy").typeahead({
        name: "tags",
        local: typeaheadSource
    });
};

Zotero.ui.widgets.item.loadItemDetail = function(item, el) {
    Z.debug("Zotero.ui.widgets.item.loadItemDetail", 3);
    var jel = J(el);
    jel.empty();
    var parentUrl = false;
    var library = item.owningLibrary;
    if (item.parentItemKey) {
        parentUrl = library.websiteUrl({
            itemKey: item.parentItemKey
        });
    }
    if (item.itemType == "note") {
        Z.debug("note item", 3);
        jel.append(J("#itemnotedetailsTemplate").render({
            item: item,
            parentUrl: parentUrl,
            libraryString: library.libraryString
        }));
    } else {
        Z.debug("non-note item", 3);
        jel.append(J("#itemdetailsTemplate").render({
            item: item,
            parentUrl: parentUrl,
            libraryString: library.libraryString
        })).trigger("create");
    }
    Zotero.ui.init.rte("readonly");
    try {
        var ev = document.createEvent("HTMLEvents");
        ev.initEvent("ZoteroItemUpdated", true, true);
        document.dispatchEvent(ev);
    } catch (e) {
        Zotero.debug("Error triggering ZoteroItemUpdated event", 1);
    }
    jel.data("itemkey", item.itemKey);
};

Zotero.ui.widgets.item.saveItemCallback = function(e) {
    Z.debug("widgets.item.saveItemCallback", 3);
    e.preventDefault();
    var triggeringElement = J(e.triggeringElement);
    var widgetEl = e.data.widgetEl;
    var el = widgetEl;
    Zotero.ui.scrollToTop();
    var library = Zotero.ui.getEventLibrary(e);
    var itemKey = triggeringElement.data("itemkey");
    Z.debug("itemKey: " + itemKey, 3);
    var item;
    if (itemKey) {
        item = library.items.getItem(itemKey);
        Z.debug("itemKey " + itemKey + " : ", 3);
    } else {
        item = J("#item-details-div").data("newitem");
        Z.debug("newItem : itemTemplate selected from form", 3);
        Z.debug(item, 3);
    }
    Zotero.ui.updateItemFromForm(item, triggeringElement.closest("form"));
    Zotero.ui.saveItem(item, triggeringElement.closest("form"));
    library.dirty = true;
    return false;
};

Zotero.ui.widgets.item.switchTwoFieldCreators = function(e) {
    Z.debug("switch two field creator clicked", 3);
    var jel = J(e.triggeringElement);
    var containingTable = jel.closest("table");
    var last, first;
    var name = jel.closest("tr.creator").find("input[id$='_name']").val();
    var split = name.split(" ");
    if (split.length > 1) {
        last = split.splice(-1, 1)[0];
        first = split.join(" ");
    } else {
        last = name;
        first = "";
    }
    var itemType = jel.closest("form").find("select.itemType").val();
    var index = parseInt(jel.closest("tr.creator").attr("id").substr(8), 10);
    var trIdString = "#creator_" + index;
    var creatorType = jel.closest("tr.creator").find("select#creator_" + index + "_creatorType").val();
    jel.closest("tr").replaceWith(J("#authorelementsdoubleTemplate").render({
        index: "" + index,
        creator: {
            firstName: first,
            lastName: last,
            creatorType: creatorType
        },
        creatorTypes: Zotero.Item.prototype.creatorTypes[itemType]
    }));
    Zotero.eventful.initTriggers(containingTable.find(trIdString));
};

Zotero.ui.widgets.item.switchSingleFieldCreator = function(e) {
    Z.debug("switch single field clicked", 3);
    var jel = J(e.triggeringElement);
    var containingTable = jel.closest("table");
    var name;
    var firstName = jel.closest("div.creator-input-div").find("input[id$='_firstName']").val();
    var lastName = jel.closest("div.creator-input-div").find("input[id$='_lastName']").val();
    name = firstName + " " + lastName;
    var itemType = jel.closest("form").find("select.itemType").val();
    var index = parseInt(jel.closest("tr.creator").attr("id").substr(8), 10);
    var trIdString = "#creator_" + index;
    var creatorType = jel.closest("tr.creator").find("select#creator_" + index + "_creatorType").val();
    jel.closest("tr").replaceWith(J("#authorelementssingleTemplate").render({
        index: "" + index,
        creator: {
            name: name
        },
        creatorTypes: Zotero.Item.prototype.creatorTypes[itemType]
    }));
    Zotero.eventful.initTriggers(containingTable.find(trIdString));
};

Zotero.ui.widgets.item.cancelItemEdit = function(e) {
    Zotero.state.clearUrlVars([ "itemKey", "collectionKey", "tag", "q" ]);
    Zotero.state.pushState();
};

Zotero.ui.widgets.item.itemFormKeydown = function(e) {
    if (e.keyCode === Zotero.ui.keyCode.ENTER) {
        e.preventDefault();
        var triggeringEl = J(this);
        if (triggeringEl.hasClass("taginput")) {
            if (triggeringEl.hasClass("tt-query")) {
                var val = triggeringEl.val();
                triggeringEl.typeahead("setQuery", val);
                triggeringEl.trigger("blur");
            }
            Zotero.trigger("addTag");
            return;
        }
        var nextEligibleSiblings = J(this).nextAll("input, button, textarea, select");
        if (nextEligibleSiblings.length) {
            nextEligibleSiblings.first().focus();
        } else {
            J(this).closest("tr").nextAll().find("input, button, textarea, select").first().focus();
        }
    }
};

Zotero.ui.widgets.items = {};

Zotero.ui.widgets.items.init = function(el) {
    var library = Zotero.ui.getAssociatedLibrary(el);
    library.listen("displayedItemsChanged", Zotero.ui.widgets.items.loadItemsCallback, {
        widgetEl: el
    });
    library.listen("changeItemSorting", Zotero.ui.callbacks.resortItems, {
        widgetEl: el
    });
    var container = J(el);
    Zotero.state.bindItemLinks(container);
    container.on("change", ".itemlist-editmode-checkbox.all-checkbox", function(e) {
        var checkbox = J(this);
        J(".itemlist-editmode-checkbox").prop("checked", checkbox.prop("checked"));
        var selectedItemKeys = [];
        J("input.itemKey-checkbox:checked").each(function(index, el) {
            selectedItemKeys.push(J(el).data("itemkey"));
        });
        Zotero.state.selectedItemKeys = selectedItemKeys;
        library.trigger("selectedItemsChanged", {
            selectedItemKeys: selectedItemKeys
        });
    });
    container.on("change", "input.itemKey-checkbox", function(e) {
        var selectedItemKeys = [];
        J("input.itemKey-checkbox:checked").each(function(index, el) {
            selectedItemKeys.push(J(el).data("itemkey"));
        });
        Zotero.state.selectedItemKeys = selectedItemKeys;
        library.trigger("selectedItemsChanged", {
            selectedItemKeys: selectedItemKeys
        });
    });
    container.on("click", "#start-item-link", function(e) {
        e.preventDefault();
        Zotero.state.pathVars["itemPage"] = "";
        Zotero.state.pushState();
    });
    container.on("click", "#prev-item-link", function(e) {
        e.preventDefault();
        var itemPage = Zotero.state.getUrlVar("itemPage") || "1";
        itemPage = parseInt(itemPage, 10);
        var newItemPage = itemPage - 1;
        Zotero.state.pathVars["itemPage"] = newItemPage;
        Zotero.state.pushState();
    });
    container.on("click", "#next-item-link", function(e) {
        e.preventDefault();
        var itemPage = Zotero.state.getUrlVar("itemPage") || "1";
        itemPage = parseInt(itemPage, 10);
        var newItemPage = itemPage + 1;
        Zotero.state.pathVars["itemPage"] = newItemPage;
        Zotero.state.pushState();
    });
    container.on("click", "#last-item-link", function(e) {
        e.preventDefault();
        Z.debug("last-item-link clickbind", 4);
        var pagehref = J(e.currentTarget).attr("href");
        var pathVars = Zotero.state.parsePathVars(pagehref);
        var lastItemPage = pathVars.itemPage;
        Zotero.state.pathVars["itemPage"] = lastItemPage;
        Zotero.state.pushState();
    });
    library.trigger("displayedItemsChanged");
};

Zotero.ui.widgets.items.loadItemsCallback = function(event) {
    Z.debug("Zotero eventful loadItemsCallback", 3);
    var widgetEl = J(event.data.widgetEl);
    var library = Zotero.ui.getAssociatedLibrary(widgetEl);
    var newConfig = Zotero.ui.getItemsConfig(library);
    Zotero.ui.showSpinner(widgetEl, "horizontal");
    var p = library.loadItems(newConfig).then(function(loadedItems) {
        widgetEl.empty();
        Zotero.ui.widgets.items.displayItems(widgetEl, newConfig, loadedItems);
    }, function(response) {
        var elementMessage = Zotero.ui.ajaxErrorMessage(response.jqxhr);
        widgetEl.html("<p>" + elementMessage + "</p>");
    });
    widgetEl.data("loadingPromise", p);
    return p;
};

Zotero.ui.getItemsConfig = function(library) {
    var effectiveUrlVars = [ "itemPage", "tag", "collectionKey", "order", "sort", "q" ];
    var urlConfigVals = {};
    J.each(effectiveUrlVars, function(index, value) {
        var t = Zotero.state.getUrlVar(value);
        if (t) {
            urlConfigVals[value] = t;
        }
    });
    var defaultConfig = {
        libraryID: library.libraryID,
        libraryType: library.libraryType,
        target: "items",
        targetModifier: "top",
        itemPage: 1,
        limit: library.preferences.getPref("itemsPerPage"),
        content: "json"
    };
    var userPreferencesApiArgs = {
        order: Zotero.preferences.getPref("order"),
        sort: Zotero.preferences.getPref("sort"),
        limit: library.preferences.getPref("itemsPerPage")
    };
    var newConfig = J.extend({}, defaultConfig, userPreferencesApiArgs, urlConfigVals);
    newConfig["collectionKey"] = urlConfigVals["collectionKey"];
    newConfig.start = parseInt(newConfig.limit, 10) * (parseInt(newConfig.itemPage, 10) - 1);
    if (newConfig.order == "addedBy" && library.libraryType == "user") {
        newConfig.order = "title";
    }
    if (!newConfig.sort) {
        newConfig.sort = Zotero.config.sortOrdering[newConfig.order];
    }
    if (newConfig.tag || newConfig.q) {
        delete newConfig.targetModifier;
    }
    return newConfig;
};

Zotero.ui.widgets.items.displayItems = function(el, config, loadedItems) {
    Z.debug("Zotero.ui.widgets.displayItems", 3);
    var jel = J(el);
    var library = Zotero.ui.getAssociatedLibrary(jel);
    var itemsArray;
    if (loadedItems.itemsArray) {
        itemsArray = loadedItems.itemsArray;
    } else {
        itemsArray = library.displayItemsArray;
    }
    var filledConfig = J.extend({}, Zotero.config.defaultApiArgs, config);
    var displayFields = library.preferences.getPref("listDisplayedFields");
    if (library.libraryType != "group") {
        displayFields = J.grep(displayFields, function(el, ind) {
            return J.inArray(el, Zotero.Library.prototype.groupOnlyColumns) == -1;
        });
    }
    var editmode = Zotero.config.librarySettings.allowEdit ? true : false;
    var itemsTableData = {
        displayFields: displayFields,
        items: itemsArray,
        editmode: editmode,
        order: filledConfig["order"],
        sort: filledConfig["sort"],
        library: library
    };
    jel.append(J("#itemstableTemplate").render(itemsTableData));
    if (loadedItems.feed) {
        var feed = loadedItems.feed;
        var pagination = Zotero.ui.createPagination(loadedItems.feed, "itemPage", filledConfig);
        var paginationData = {
            feed: feed,
            pagination: pagination
        };
        var itemPage = pagination.page;
        jel.append(J("#itempaginationTemplate").render(paginationData));
    }
    Zotero.eventful.initTriggers();
};

Zotero.ui.callbacks.resortItems = function(e) {
    Z.debug(".field-table-header clicked", 3);
    var widgetEl = J(e.data.widgetEl);
    var library = Zotero.ui.getAssociatedLibrary(widgetEl);
    var currentSortField = Zotero.ui.getPrioritizedVariable("order", "title");
    var currentSortOrder = Zotero.ui.getPrioritizedVariable("sort", "asc");
    var newSortField;
    var newSortOrder;
    if (e.newSortField) {
        newSortField = e.newSortField;
    } else {
        newSortField = J(e.triggeringElement).data("columnfield");
    }
    if (e.newSortOrder) {
        newSortOrder = e.newSortOrder;
    } else {
        newSortOrder = Zotero.config.sortOrdering[newSortField];
    }
    Z.debug("curr order field:" + currentSortField, 3);
    Z.debug("curr order sort:" + currentSortOrder, 3);
    Z.debug("New order field:" + newSortField, 3);
    Z.debug("New order sort:" + newSortOrder, 3);
    if (J.inArray(newSortField, Zotero.Library.prototype.sortableColumns) == -1) {
        return false;
    }
    if (!e.newSortOrder && currentSortField == newSortField && currentSortOrder == newSortOrder) {
        if (newSortOrder == "asc") {
            newSortOrder = "desc";
        } else {
            newSortOrder = "asc";
        }
    }
    if (!newSortField) {
        Zotero.ui.jsNotificationMessage("no order field mapped to column");
        return false;
    }
    Zotero.state.pathVars["order"] = newSortField;
    Zotero.state.pathVars["sort"] = newSortOrder;
    Zotero.state.pushState();
    library.preferences.setPref("sortField", newSortField);
    library.preferences.setPref("sortOrder", newSortOrder);
    library.preferences.setPref("order", newSortField);
    library.preferences.setPref("sort", newSortOrder);
    Zotero.preferences.setPref("order", newSortField);
    Zotero.preferences.setPref("sort", newSortOrder);
};

Zotero.ui.widgets.itemContainer = {};

Zotero.ui.widgets.itemContainer.init = function(el) {
    var library = Zotero.ui.getAssociatedLibrary(el);
    var container = J(el);
    library.listen("citeItems", Zotero.ui.callbacks.citeItems);
    library.listen("exportItems", Zotero.ui.callbacks.exportItems);
    container.on("click", "#item-details-div .itemTypeSelectButton", function() {
        Z.debug("itemTypeSelectButton clicked", 3);
        var itemType = J("#itemType").val();
        Zotero.state.pathVars["itemType"] = itemType;
        Zotero.state.pushState();
        return false;
    });
    container.on("change", "#item-details-div .itemDetailForm #itemTypeSelect", function() {
        Z.debug("itemTypeSelect changed", 3);
        var itemType = J(this).val();
        Zotero.state.pathVars["itemType"] = itemType;
        Zotero.state.pushState();
    });
    Zotero.state.bindTagLinks(container);
};

Zotero.ui.cancelItemEdit = function(e) {
    Zotero.state.clearUrlVars([ "itemKey", "collectionKey", "tag", "q" ]);
    Zotero.state.pushState();
};

Zotero.ui.widgets.librarysettingsdialog = {};

Zotero.ui.widgets.librarysettingsdialog.init = function(el) {
    Z.debug("librarysettingsdialog widget init", 3);
    var library = Zotero.ui.getAssociatedLibrary(el);
    library.listen("librarySettingsDialog", Zotero.ui.widgets.librarysettingsdialog.show, {
        widgetEl: el
    });
};

Zotero.ui.widgets.librarysettingsdialog.show = function(e) {
    Z.debug("librarysettingsdialog.show", 3);
    var triggeringEl = J(e.triggeringElement);
    var widgetEl = J(e.data["widgetEl"]).empty();
    widgetEl.html(J("#librarysettingsdialogTemplate").render({
        columnFields: Zotero.Library.prototype.displayableColumns
    }, {
        fieldMap: Zotero.localizations.fieldMap,
        topString: "Top String"
    }));
    var dialogEl = widgetEl.find(".library-settings-dialog");
    dialogEl.find(".display-column-field-title").prop("checked", true).prop("disabled", true);
    var library = Zotero.ui.getEventLibrary(e);
    var listDisplayedFields = library.preferences.getPref("listDisplayedFields");
    var itemsPerPage = library.preferences.getPref("itemsPerPage");
    var showAutomaticTags = library.preferences.getPref("showAutomaticTags");
    J.each(listDisplayedFields, function(index, value) {
        var classstring = ".display-column-field-" + value;
        dialogEl.find(classstring).prop("checked", true);
    });
    J("#items-per-page").val(itemsPerPage);
    J("#show-automatic-tags").prop("checked", showAutomaticTags);
    var submitFunction = J.proxy(function() {
        var showFields = [];
        dialogEl.find(".library-settings-form").find("input:checked").each(function() {
            showFields.push(J(this).val());
        });
        var itemsPerPage = parseInt(dialogEl.find("#items-per-page").val(), 10);
        var showAutomaticTags = dialogEl.find("#show-automatic-tags:checked").length > 0 ? true : false;
        library.preferences.setPref("listDisplayedFields", showFields);
        library.preferences.setPref("itemsPerPage", itemsPerPage);
        library.preferences.setPref("showAutomaticTags", showAutomaticTags);
        library.preferences.persist();
        Zotero.preferences.setPref("listDisplayedFields", showFields);
        Zotero.preferences.setPref("itemsPerPage", itemsPerPage);
        Zotero.preferences.setPref("showAutomaticTags", showAutomaticTags);
        Zotero.preferences.persist();
        library.trigger("displayedItemsChanged");
        library.trigger("tagsChanged");
        Zotero.ui.closeDialog(dialogEl);
    }, this);
    dialogEl.find(".saveButton").on("click", submitFunction);
    Zotero.ui.dialog(dialogEl, {});
};

Zotero.ui.widgets.newItem = {};

Zotero.ui.widgets.newItem.init = function(el) {
    Z.debug("newItem eventfulwidget init", 3);
    var library = Zotero.ui.getAssociatedLibrary(el);
    var widgetEl = J(el);
    library.listen("newItem", Zotero.ui.widgets.newItem.freshitemcallback, {
        widgetEl: el
    });
    library.listen("itemTypeChanged", Zotero.ui.widgets.newItem.changeItemType, {
        widgetEl: el
    });
    library.listen("createItem", Zotero.ui.widgets.item.saveItemCallback, {
        widgetEl: el
    });
    widgetEl.on("change", "select.itemType", function(e) {
        library.trigger("itemTypeChanged", {
            triggeringElement: el
        });
    });
};

Zotero.ui.widgets.newItem.freshitemcallback = function(e) {
    Z.debug("Zotero eventful new item", 3);
    var widgetEl = e.data.widgetEl;
    var el = widgetEl;
    var triggeringEl = J(e.triggeringElement);
    var itemType = triggeringEl.data("itemtype");
    var newItem = new Zotero.Item;
    return newItem.initEmpty(itemType).then(function(item) {
        Zotero.ui.unassociatedItemForm(widgetEl, item);
    }, function(response) {
        Zotero.ui.jsNotificationMessage("Error loading item template", "error");
        Z.debug(response);
        Z.debug(response.jqxhr.statusCode);
    });
};

Zotero.ui.unassociatedItemForm = function(el, item) {
    Z.debug("Zotero.ui.unassociatedItem", 3);
    Z.debug(item, 3);
    var container = J(el);
    var library = Zotero.ui.getAssociatedLibrary(el);
    var itemTypes = [];
    J.each(Zotero.Item.prototype.typeMap, function(key, val) {
        itemTypes.push(key);
    });
    itemTypes.sort();
    Z.debug(itemTypes);
    return Zotero.Item.prototype.getCreatorTypes(item.itemType).then(function(itemCreatorTypes) {
        container.empty();
        if (item.itemType == "note") {
            var parentKey = Zotero.state.getUrlVar("parentKey");
            if (parentKey) {
                item.parentKey = parentKey;
            }
            container.append(J("#editnoteformTemplate").render({
                item: item,
                itemKey: item.itemKey
            }));
            Zotero.ui.init.rte("default");
        } else {
            container.append(J("#itemformTemplate").render({
                item: item,
                library: library,
                itemKey: item.itemKey,
                creatorTypes: itemCreatorTypes,
                itemTypes: itemTypes,
                citable: true,
                saveable: false
            }));
            if (item.apiObj.tags.length === 0) {
                Zotero.ui.widgets.item.addTag(container, false);
            }
        }
        container.find(".directciteitembutton").on("click", function(e) {
            Zotero.ui.updateItemFromForm(item, container.find("form"));
            library.trigger("citeItems", {
                zoteroItems: [ item ]
            });
        });
        Z.debug("Setting newitem data on container");
        Z.debug(item);
        Z.debug(container);
        container.data("item", item);
        Zotero.ui.loadFormData(container);
        Zotero.eventful.initTriggers(container);
    });
};

Zotero.ui.widgets.newItem.changeItemType = function(e) {
    var widgetEl = Zotero.ui.parentWidgetEl(e);
    Z.debug(widgetEl.length);
    var itemType = widgetEl.find("select.itemType").val();
    Z.debug("newItemType:" + itemType);
    var oldItem = widgetEl.data("item");
    Zotero.ui.updateItemFromForm(oldItem, widgetEl.find("form"));
    var newItem = new Zotero.Item;
    return newItem.initEmpty(itemType).then(function(item) {
        Zotero.ui.translateItemType(oldItem, item);
        Zotero.ui.unassociatedItemForm(widgetEl, item);
    }, function(response) {
        Zotero.ui.jsNotificationMessage("Error loading item template", "error");
    });
};

Zotero.ui.translateItemType = function(firstItem, newItem) {
    Z.debug("Zotero.ui.translateItemType");
    J.each(Zotero.Item.prototype.fieldMap, function(field, val) {
        if (field != "itemType" && firstItem.apiObj.hasOwnProperty(field) && newItem.apiObj.hasOwnProperty(field)) {
            Z.debug("transferring value for " + field + ": " + firstItem.get(field));
            newItem.set(field, firstItem.get(field));
        }
    });
};

Zotero.ui.widgets.syncedItems = {};

Zotero.ui.widgets.syncedItems.init = function(el) {
    Z.debug("syncedItems widget init", 3);
    var library = Zotero.ui.getAssociatedLibrary(el);
    library.listen("changeItemSorting", Zotero.ui.callbacks.resortItems, {
        widgetEl: el
    });
    library.listen("localItemsChanged", Zotero.ui.widgets.syncedItems.syncItems, {
        widgetEl: el
    });
    library.listen("remoteItemsRequested", Zotero.ui.widgets.syncedItems.syncItems, {
        widgetEl: el
    });
    library.listen("syncLibrary", Zotero.ui.widgets.syncedItems.syncItems, {
        widgetEl: el
    });
    library.listen("displayedItemsChanged", Zotero.ui.widgets.syncedItems.updateDisplayedItems, {
        widgetEl: el
    });
    library.listen("displayedItemsUpdated", Zotero.ui.widgets.syncedItems.displayItems, {
        widgetEl: el
    });
    library.listen("cachedDataLoaded", Zotero.ui.widgets.syncedItems.syncItems, {
        widgetEl: el
    });
    var container = J(el);
    Zotero.state.bindItemLinks(container);
    container.on("change", ".itemlist-editmode-checkbox.all-checkbox", function(e) {
        J(".itemlist-editmode-checkbox").prop("checked", J(".itemlist-editmode-checkbox.all-checkbox").prop("checked"));
        library.trigger("selectedItemsChanged");
    });
    container.on("change", "input.itemKey-checkbox", function(e) {
        var selectedItemKeys = [];
        J("input.itemKey-checkbox:checked").each(function(index, el) {
            selectedItemKeys.push(J(el).data("itemkey"));
        });
        library.trigger("selectedItemsChanged", {
            selectedItemKeys: selectedItemKeys
        });
    });
    Zotero.ui.widgets.syncedItems.bindPaginationLinks(container);
};

Zotero.ui.widgets.syncedItems.syncItems = function(event) {
    Zotero.debug("Zotero eventful syncItems", 3);
    var widgetEl = J(event.data.widgetEl);
    var library = Zotero.ui.getAssociatedLibrary(widgetEl);
    return library.loadUpdatedItems().then(function() {
        Zotero.state.doneLoading(widgetEl);
        library.trigger("libraryItemsUpdated");
        library.trigger("displayedItemsChanged");
    });
};

Zotero.ui.widgets.syncedItems.bindPaginationLinks = function(container) {
    container.on("click", "#start-item-link", function(e) {
        e.preventDefault();
        Zotero.state.pathVars["itemPage"] = "";
        Zotero.state.pushState();
    });
    container.on("click", "#prev-item-link", function(e) {
        e.preventDefault();
        var itemPage = Zotero.state.getUrlVar("itemPage") || "1";
        itemPage = parseInt(itemPage, 10);
        var newItemPage = itemPage - 1;
        Zotero.state.pathVars["itemPage"] = newItemPage;
        Zotero.state.pushState();
    });
    container.on("click", "#next-item-link", function(e) {
        e.preventDefault();
        var itemPage = Zotero.state.getUrlVar("itemPage") || "1";
        itemPage = parseInt(itemPage, 10);
        var newItemPage = itemPage + 1;
        Zotero.state.pathVars["itemPage"] = newItemPage;
        Zotero.state.pushState();
    });
    container.on("click", "#last-item-link", function(e) {
        e.preventDefault();
        Z.debug("last-item-link clickbind", 4);
        var pagehref = J(e.currentTarget).attr("href");
        var pathVars = Zotero.state.parsePathVars(pagehref);
        var lastItemPage = pathVars.itemPage;
        Zotero.state.pathVars["itemPage"] = lastItemPage;
        Zotero.state.pushState();
    });
};

Zotero.ui.widgets.syncedItems.updateDisplayedItems = function(event) {
    Z.debug("widgets.syncedItems.updateDisplayedItems", 3);
    var widgetEl = J(event.data.widgetEl);
    var library = Zotero.ui.getAssociatedLibrary(widgetEl);
    var newConfig = Zotero.ui.getItemsConfig(library);
    var displayParams = Zotero.state.getUrlVars();
    library.buildItemDisplayView(displayParams);
};

Zotero.ui.widgets.syncedItems.displayItems = function(event) {
    var widgetEl = J(event.data.widgetEl);
    var library = Zotero.ui.getAssociatedLibrary(widgetEl);
    var newConfig = Zotero.ui.getItemsConfig(library);
    widgetEl.empty();
    Zotero.ui.displayItems(widgetEl, newConfig, {
        itemsArray: library.items.displayItemsArray,
        library: library
    });
    Zotero.eventful.initTriggers();
};

Zotero.ui.widgets.tags = {};

Zotero.ui.widgets.tags.init = function(el) {
    Z.debug("tags widget init", 3);
    var library = Zotero.ui.getAssociatedLibrary(el);
    library.listen("tagsDirty", Zotero.ui.widgets.tags.syncTags, {
        widgetEl: el
    });
    library.listen("cachedDataLoaded", Zotero.ui.widgets.tags.syncTags, {
        widgetEl: el
    });
    library.listen("tagsChanged libraryTagsUpdated selectedTagsChanged", Zotero.ui.widgets.tags.rerenderTags, {
        widgetEl: el
    });
    var container = J(el);
    Zotero.state.bindTagLinks(container);
    container.on("keyup", "#tag-filter-input", Zotero.ui.widgets.tags.filterTags);
    container.on("click", "#show-automatic-tags", function(e) {
        var show = J(this).prop("checked") ? true : false;
        Z.debug("showAutomaticTags is " + show, 4);
        Zotero.preferences.setPref("showAutomaticTags", show);
        Zotero.preferences.persist();
        library.trigger("libraryTagsUpdated");
    });
    container.on("click", "#show-more-tags-link", function(e) {
        e.preventDefault();
        var jel = J(this).closest("#tags-list-div");
        jel.data("showmore", true);
        library.trigger("libraryTagsUpdated");
    });
    container.on("click", "#show-fewer-tags-link", function(e) {
        e.preventDefault();
        var jel = J(this).closest("#tags-list-div");
        jel.data("showmore", false);
        library.trigger("libraryTagsUpdated");
    });
};

Zotero.ui.widgets.tags.syncTags = function(evt) {
    Z.debug("Zotero eventful syncTags", 1);
    var widgetEl = J(evt.data.widgetEl);
    var loadingPromise = widgetEl.data("loadingPromise");
    if (loadingPromise) {
        var p = widgetEl.data("loadingPromise");
        return p.then(function() {
            return Zotero.ui.widgets.tags.syncTags(evt);
        });
    }
    var checkCached = evt.data.checkCached;
    if (checkCached !== false) {
        checkCached = true;
    }
    Zotero.ui.showSpinner(widgetEl.find("div.loading"));
    var library = Zotero.ui.getAssociatedLibrary(widgetEl);
    if (checkCached === false) {
        library.tags.clear();
    }
    loadingPromise = library.loadUpdatedTags().then(function() {
        widgetEl.find(".loading").empty();
        library.trigger("libraryTagsUpdated");
        widgetEl.removeData("loadingPromise");
    }, function() {
        library.trigger("libraryTagsUpdated");
        widgetEl.children(".loading").empty();
        widgetEl.removeData("loadingPromise");
    });
    widgetEl.data("loadingPromise", loadingPromise);
    return loadingPromise;
};

Zotero.ui.widgets.tags.rerenderTags = function(event) {
    Zotero.debug("Zotero eventful rerenderTags", 3);
    var widgetEl = J(event.data.widgetEl);
    var selectedTags = Zotero.state.getUrlVar("tag");
    if (!J.isArray(selectedTags)) {
        if (selectedTags) {
            selectedTags = [ selectedTags ];
        } else {
            selectedTags = [];
        }
    }
    widgetEl.children(".loading").empty();
    var library = Zotero.ui.getAssociatedLibrary(widgetEl);
    var plainList = library.tags.plainTagsList(library.tags.tagsArray);
    Zotero.ui.widgets.tags.displayTagsFiltered(widgetEl, library, plainList, selectedTags);
};

Zotero.ui.widgets.tags.displayTagsFiltered = function(el, library, matchedTagStrings, selectedTagStrings) {
    Zotero.debug("Zotero.ui.widgets.tags.displayTagsFiltered", 3);
    Z.debug(selectedTagStrings, 4);
    var curPreString = J("#tag-filter-input").val();
    var jel = J(el);
    var libtags = library.tags;
    var tagColors = library.preferences.getPref("tagColors");
    if (!tagColors) tagColors = [];
    var showMore = jel.data("showmore");
    if (!showMore) {
        showMore = false;
    }
    var coloredTags = [];
    var tagColorStrings = [];
    J.each(tagColors, function(index, tagColor) {
        tagColorStrings.push(tagColor.name.toLowerCase());
        var coloredTag = libtags.getTag(tagColor.name);
        if (coloredTag) {
            coloredTag.color = tagColor.color;
            coloredTags.push(coloredTag);
        }
    });
    var filteredTags = [];
    var selectedTags = [];
    J.each(matchedTagStrings, function(index, matchedString) {
        if (libtags.tagObjects[matchedString] && J.inArray(matchedString, selectedTagStrings) == -1 && J.inArray(matchedString, tagColorStrings) == -1) {
            filteredTags.push(libtags.tagObjects[matchedString]);
        }
    });
    J.each(selectedTagStrings, function(index, selectedString) {
        if (libtags.tagObjects[selectedString]) {
            selectedTags.push(libtags.tagObjects[selectedString]);
        }
    });
    var passTags;
    if (!showMore) {
        passTags = filteredTags.slice(0, 25);
        J("#show-more-tags-link").show();
        J("#show-fewer-tags-link").hide();
    } else {
        passTags = filteredTags;
        J("#show-more-tags-link").hide();
        J("#show-fewer-tags-link").show();
    }
    var tagListEl = J("#tags-list").empty();
    J("#colored-tags-list").replaceWith(J("#coloredtaglistTemplate").render({
        tags: coloredTags
    }));
    J("#selected-tags-list").replaceWith(J("#tagunorderedlistTemplate").render({
        tags: selectedTags,
        id: "selected-tags-list"
    }));
    J("#tags-list").replaceWith(J("#tagunorderedlistTemplate").render({
        tags: passTags,
        id: "tags-list"
    }));
};

Zotero.ui.widgets.tags.filterTags = function(e) {
    Z.debug("Zotero.ui.widgets.tags.filterTags", 3);
    var library = Zotero.ui.getAssociatedLibrary(J("#tag-filter-input").closest(".eventfulwidget"));
    var libraryTagsPlainList = library.tags.plainList;
    var matchingTagStrings = Zotero.utils.matchAnyAutocomplete(J("#tag-filter-input").val(), libraryTagsPlainList);
    Zotero.ui.widgets.tags.displayTagsFiltered(J("#tags-list-div"), library, matchingTagStrings, []);
    Z.debug(matchingTagStrings, 4);
};

Zotero.ui.widgets.updateCollectionDialog = {};

Zotero.ui.widgets.updateCollectionDialog.init = function(el) {
    Z.debug("updatecollectionsdialog widget init", 3);
    var library = Zotero.ui.getAssociatedLibrary(el);
    library.listen("updateCollectionDialog", Zotero.ui.widgets.updateCollectionDialog.show, {
        widgetEl: el
    });
};

Zotero.ui.widgets.updateCollectionDialog.show = function(evt) {
    Z.debug("updateCollectionDialog.show", 1);
    var triggeringEl = J(evt.triggeringElement);
    var library = Zotero.ui.getAssociatedLibrary(triggeringEl);
    var ncollections = library.collections.nestedOrderingArray();
    var widgetEl = J(evt.data.widgetEl).empty();
    widgetEl.html(J("#updatecollectiondialogTemplate").render({
        ncollections: ncollections
    }));
    var dialogEl = widgetEl.find(".update-collection-dialog");
    var currentCollectionKey = Zotero.state.getUrlVar("collectionKey");
    var currentCollection = library.collections.getCollection(currentCollectionKey);
    var currentParentCollectionKey = currentCollection.parentCollection;
    dialogEl.find(".update-collection-parent-select").val(currentParentCollectionKey);
    dialogEl.find(".updated-collection-title-input").val(currentCollection.get("title"));
    var saveFunction = function() {
        var newCollectionTitle = dialogEl.find("input.updated-collection-title-input").val() || "Untitled";
        var newParentCollectionKey = dialogEl.find(".update-collection-parent-select").val();
        var collection = currentCollection;
        if (!collection) {
            Zotero.ui.jsNotificationMessage("Selected collection not found", "error");
            return false;
        }
        collection.update(newCollectionTitle, newParentCollectionKey).then(function(response) {
            Zotero.ui.jsNotificationMessage("Collection Saved", "confirm");
            library.collections.dirty = true;
            library.collections.initSecondaryData();
            library.trigger("libraryCollectionsUpdated");
            Zotero.state.pushState(true);
            Zotero.ui.closeDialog(dialogEl);
        });
    };
    dialogEl.find(".updateButton").on("click", saveFunction);
    Zotero.ui.dialog(dialogEl, {});
    dialogEl.find(".updated-collection-title-input").select();
    return false;
};

Zotero.ui.widgets.uploadDialog = {};

Zotero.ui.widgets.uploadDialog.init = function(el) {
    Z.debug("uploaddialog widget init", 3);
    var library = Zotero.ui.getAssociatedLibrary(el);
    library.listen("uploadAttachment", Zotero.ui.widgets.uploadDialog.show, {
        widgetEl: el,
        library: library
    });
};

Zotero.ui.widgets.uploadDialog.show = function(e) {
    Z.debug("uploadDialog.show", 3);
    var triggeringEl = J(e.triggeringElement);
    var library = Zotero.ui.getEventLibrary(e);
    var widgetEl = J(e.data["widgetEl"]).empty();
    widgetEl.html(J("#attachmentuploadTemplate").render({}));
    var dialogEl = widgetEl.find(".upload-attachment-dialog");
    var uploadFunction = function() {
        Z.debug("uploadFunction", 3);
        var fileInfo = dialogEl.find("#attachmentuploadfileinfo").data("fileInfo");
        var file = dialogEl.find("#attachmentuploadfileinfo").data("file");
        var specifiedTitle = dialogEl.find("#upload-file-title-input").val();
        var progressCallback = function(e) {
            Z.debug("fullUpload.upload.onprogress", 3);
            var percentLoaded = Math.round(e.loaded / e.total * 100);
            Z.debug("Upload progress event:" + e.loaded + " / " + e.total + " : " + percentLoaded + "%", 3);
            J("#uploadprogressmeter").val(percentLoaded);
        };
        var uploadSuccess = function() {
            Z.debug("uploadSuccess", 3);
            Zotero.ui.closeDialog(J("#upload-attachment-dialog"));
            library.trigger("uploadSuccessful");
            Zotero.state.pushState(true);
        };
        var uploadFailure = function(failure) {
            Z.debug("Upload failed", 3);
            Z.debug(failure, 3);
            Zotero.ui.jsNotificationMessage("There was a problem uploading your file.", "error");
            switch (failure.code) {
              case 400:
                Zotero.ui.jsNotificationMessage("Bad Input. 400", "error");
                break;
              case 403:
                Zotero.ui.jsNotificationMessage("You do not have permission to edit files", "error");
                break;
              case 409:
                Zotero.ui.jsNotificationMessage("The library is currently locked. Please try again in a few minutes.", "error");
                break;
              case 412:
                Zotero.ui.jsNotificationMessage("File conflict. Remote file has changed", "error");
                break;
              case 413:
                Zotero.ui.jsNotificationMessage("Requested upload would exceed storage quota.", "error");
                break;
              case 428:
                Zotero.ui.jsNotificationMessage("Precondition required error", "error");
                break;
              case 429:
                Zotero.ui.jsNotificationMessage("Too many uploads pending. Please try again in a few minutes", "error");
                break;
              default:
                Zotero.ui.jsNotificationMessage("Unknown error uploading file. " + failure.code, "error");
            }
            Zotero.ui.closeDialog(J("#upload-attachment-dialog"));
        };
        Zotero.ui.showSpinner(J("#fileuploadspinner"));
        var itemKey = Zotero.state.getUrlVar("itemKey");
        var item = library.items.getItem(itemKey);
        if (!item.get("parentItem")) {
            Z.debug("no parentItem", 3);
            var childItem = new Zotero.Item;
            childItem.associateWithLibrary(library);
            childItem.initEmpty("attachment", "imported_file").then(function(childItem) {
                Z.debug("templateItemDeferred callback", 3);
                childItem.set("title", specifiedTitle);
                item.uploadChildAttachment(childItem, fileInfo, file, progressCallback).then(uploadSuccess, uploadFailure);
            });
        } else if (item.get("itemType") == "attachment" && item.get("linkMode") == "imported_file") {
            Z.debug("imported_file attachment", 3);
            item.uploadFile(fileInfo, file, progressCallback).then(uploadSuccess, uploadFailure);
        }
    };
    dialogEl.find(".uploadButton").on("click", uploadFunction);
    Zotero.ui.dialog(dialogEl, {});
    var handleFiles = function(files) {
        Z.debug("attachmentUpload handleFiles", 3);
        if (typeof files == "undefined" || files.length === 0) {
            return false;
        }
        var file = files[0];
        J("#attachmentuploadfileinfo").data("file", file);
        var fileinfo = Zotero.file.getFileInfo(file, function(fileInfo) {
            J("#attachmentuploadfileinfo").data("fileInfo", fileInfo);
            J("#upload-file-title-input").val(fileInfo.filename);
            J("#attachmentuploadfileinfo .uploadfilesize").html(fileInfo.filesize);
            J("#attachmentuploadfileinfo .uploadfiletype").html(fileInfo.contentType);
            J("#droppedfilename").html(fileInfo.filename);
        });
        return;
    };
    dialogEl.find("#fileuploaddroptarget").on("dragenter dragover", function(e) {
        e.stopPropagation();
        e.preventDefault();
    });
    dialogEl.find("#fileuploaddroptarget").on("drop", function(je) {
        Z.debug("fileuploaddroptarget drop callback", 3);
        je.stopPropagation();
        je.preventDefault();
        J("#fileuploadinput").val("");
        var e = je.originalEvent;
        var dt = e.dataTransfer;
        var files = dt.files;
        handleFiles(files);
    });
    dialogEl.find("#fileuploadinput").on("change", function(je) {
        Z.debug("fileuploaddroptarget callback 1", 3);
        je.stopPropagation();
        je.preventDefault();
        var files = J(this).get(0).files;
        handleFiles(files);
    });
    return false;
};

Zotero.ui.widgets.libraryPreloader = {};

Zotero.ui.widgets.libraryPreloader.init = function(el) {
    var library = Zotero.ui.getAssociatedLibrary(el);
};

Zotero.ui.widgets.filterGuide = {};

Zotero.ui.widgets.filterGuide.init = function(el) {
    Z.debug("widgets.filterGuide.init", 3);
    var library = Zotero.ui.getAssociatedLibrary(el);
    library.listen("displayedItemsChanged", Zotero.ui.widgets.filterGuide.refreshFilters, {
        widgetEl: el
    });
    library.listen("clearFilter", Zotero.ui.widgets.filterGuide.clearFilter, {
        widgetEl: el
    });
};

Zotero.ui.widgets.filterGuide.refreshFilters = function(event) {
    Z.debug("widgets.filterGuide.refreshFilters", 3);
    var widgetEl = event.data.widgetEl;
    var el = widgetEl;
    var jel = J(el);
    var library = Zotero.ui.getAssociatedLibrary(el);
    var displayConfig = Zotero.ui.getItemsConfig(library);
    var filterData = {};
    if (displayConfig["collectionKey"]) {
        filterData["collection"] = library.collections.getCollection(displayConfig["collectionKey"]);
    }
    if (displayConfig["tag"]) {
        filterData["tag"] = displayConfig["tag"];
    }
    if (displayConfig["q"]) {
        filterData["search"] = displayConfig["q"];
    }
    filterData["library"] = library;
    jel.empty();
    jel.append(J("#filterguideTemplate").render(filterData));
    Zotero.eventful.initTriggers(widgetEl);
};

Zotero.ui.widgets.filterGuide.clearFilter = function(event) {
    Z.debug("widgets.filterGuide.clearFilter", 3);
    var widgetEl = J(event.data.widgetEl);
    var triggeringEl = J(event.triggeringElement);
    var library = Zotero.ui.getAssociatedLibrary(widgetEl);
    var collectionKey = triggeringEl.data("collectionkey");
    var tag = triggeringEl.data("tag");
    var query = triggeringEl.data("query");
    if (collectionKey) {
        Zotero.state.unsetUrlVar("collectionKey");
    }
    if (tag) {
        Zotero.state.toggleTag(tag);
    }
    if (query) {
        library.trigger("clearLibraryQuery");
        return;
    }
    Zotero.state.pushState();
};

Zotero.ui.widgets.progressModal = {};

Zotero.ui.widgets.progressModal.init = function(el) {
    Z.debug("progressModal widget init", 3);
    Zotero.listen("progressStart", Zotero.ui.widgets.progressModal.show, {
        widgetEl: el
    });
    Zotero.listen("progressUpdate", Zotero.ui.widgets.progressModal.update, {
        widgetEl: el
    });
    Zotero.listen("progressDone", Zotero.ui.widgets.progressModal.done, {
        widgetEl: el
    });
};

Zotero.ui.widgets.progressModal.show = function(e) {
    Z.debug("progressModal.show", 3);
    var triggeringEl = J(e.triggeringElement);
    var widgetEl = J(e.data["widgetEl"]).empty();
    widgetEl.html(J("#progressModalTemplate").render({
        progressTitle: e.progressTitle
    }));
    var dialogEl = widgetEl.find("#progress-modal-dialog");
    Zotero.ui.dialog(dialogEl, {});
};

Zotero.ui.widgets.progressModal.update = function(e) {
    Z.debug("progressModal.update", 3);
    var widgetEl = J(e.data["widgetEl"]);
    if (!e.progress) {
        throw new Error("No progress set on progressUpdate event");
    }
    var updatedProgress = e.progress;
    widgetEl.find("progress").prop("value", updatedProgress);
};

Zotero.ui.widgets.progressModal.done = function(e) {
    Z.debug("progressModal.done", 3);
    var widgetEl = J(e.data["widgetEl"]);
    var dialogEl = widgetEl.find("#progress-modal-dialog");
    Zotero.ui.closeDialog(dialogEl);
};

Zotero.ui.widgets.groupsList = {};

Zotero.ui.widgets.groupsList.init = function(el) {
    Z.debug("groupsList widget init", 3);
    var library = Zotero.ui.getAssociatedLibrary(el);
    library.listen("refreshGroups", Zotero.ui.widgets.groupsList.refresh, {
        widgetEl: el
    });
    library.listen("sendToGroup", Zotero.ui.widgets.groupsList.sendToGroup, {
        widgetEl: el
    });
    library.trigger("refreshGroups");
};

Zotero.ui.widgets.groupsList.refresh = function(evt) {
    Zotero.debug("Zotero.ui.widgets.groupsList.refresh", 3);
    var widgetEl = evt.data.widgetEl;
    var library = Zotero.ui.getAssociatedLibrary(widgetEl);
    if (!Zotero.config.loggedIn) {
        throw new Error("no logged in userID. Required for groupsList widget");
    }
    var userID = Zotero.config.loggedInUserID;
    var memberGroups = library.groups.fetchUserGroups(userID).then(function(memberGroups) {
        Zotero.ui.widgets.groupsList.render(widgetEl, memberGroups);
    });
};

Zotero.ui.widgets.groupsList.render = function(el, groups) {
    J(el).empty().append(J("#groupslistTemplate").render({
        groups: groups
    }));
};

Zotero.ui.widgets.groupsList.sendToGroup = function(evt) {
    Zotero.debug("Zotero.ui.widgets.groupsList.sendToGroup", 3);
    var widgetEl = evt.data.widgetEl;
    var library = Zotero.ui.getAssociatedLibrary(widgetEl);
};

Zotero.ui.widgets.sendToLibraryDialog = {};

Zotero.ui.widgets.sendToLibraryDialog.init = function(el) {
    Z.debug("sendToLibraryDialog widget init", 3);
    var library = Zotero.ui.getAssociatedLibrary(el);
    library.listen("sendToLibraryDialog", Zotero.ui.widgets.sendToLibraryDialog.show, {
        widgetEl: el
    });
};

Zotero.ui.widgets.sendToLibraryDialog.show = function(evt) {
    Zotero.debug("Zotero.ui.widgets.sendToLibraryDialog.show", 3);
    var widgetEl = J(evt.data.widgetEl);
    var library = Zotero.ui.getAssociatedLibrary(widgetEl);
    if (!Zotero.config.loggedIn) {
        throw new Error("no logged in userID. Required for groupsList widget");
    }
    var userID = Zotero.config.loggedInUserID;
    var personalLibraryString = "u" + userID;
    var memberGroups = library.groups.fetchUserGroups(userID).then(function(memberGroups) {
        Z.debug("got member groups");
        var writableLibraries = [ {
            name: "My Library",
            libraryString: personalLibraryString
        } ];
        for (var i = 0; i < memberGroups.length; i++) {
            if (memberGroups[i].isWritable(userID)) {
                var libraryString = "g" + memberGroups[i].groupID;
                writableLibraries.push({
                    name: memberGroups[i].apiObj.name,
                    libraryString: libraryString
                });
            }
        }
        widgetEl.html(J("#sendToLibraryDialogTemplate").render({
            destinationLibraries: writableLibraries
        }));
        var dialogEl = widgetEl.find(".send-to-library-dialog");
        var sendFunction = function() {
            Z.debug("sendToLibrary callback", 3);
            var targetLibrary = dialogEl.find(".destination-library-select").val();
            Z.debug("move to: " + targetLibrary, 3);
            var destLibConfig = Zotero.utils.parseLibString(targetLibrary);
            destLibrary = new Zotero.Library(destLibConfig.libraryType, destLibConfig.libraryID);
            Zotero.libraries[targetLibrary] = destLibrary;
            var itemKeys = Zotero.state.getSelectedItemKeys();
            if (itemKeys.length === 0) {
                Zotero.ui.jsNotificationMessage("No items selected", "notice");
                Zotero.ui.closeDialog(dialogEl);
                return false;
            }
            var sendItems = library.items.getItems(itemKeys);
            library.sendToLibrary(sendItems, destLibrary).then(function(foreignItems) {
                Zotero.ui.jsNotificationMessage("Items sent to other library", "notice");
            }).catch(function(response) {
                Z.debug(response);
                Zotero.ui.jsNotificationMessage("Error sending items to other library", "notice");
            });
            Zotero.ui.closeDialog(dialogEl);
            return false;
        };
        dialogEl.find(".sendButton").on("click", sendFunction);
        Zotero.ui.dialog(dialogEl, {});
    }).catch(function(err) {
        Z.debug(err);
        Z.debug(err.message);
    });
};

Zotero.ui.widgets.searchbox = {};

Zotero.ui.widgets.searchbox.init = function(el) {
    Z.debug("Zotero.eventful.init.searchbox", 3);
    var library = Zotero.ui.getAssociatedLibrary(el);
    var container = J(el);
    library.listen("clearLibraryQuery", Zotero.ui.widgets.searchbox.clearLibraryQuery, {
        widgetEl: el
    });
    if (Zotero.state.getUrlVar("q")) {
        container.find(".search-query").val(Zotero.state.getUrlVar("q"));
    }
    var context = "support";
    if (undefined !== window.zoterojsSearchContext) {
        context = zoterojsSearchContext;
    }
    container.on("click", ".library-search-type-link", function(e) {
        e.preventDefault();
        var typeLinks = J(".library-search-type-link").removeClass("selected");
        var selected = J(e.target);
        var selectedType = selected.data("searchtype");
        var searchInput = container.find("input.search-query").data("searchtype", selectedType);
        selected.addClass("selected");
        if (selectedType == "simple") {
            searchInput.attr("placeholder", "Search Title, Creator, Year");
        } else if (selectedType == "everything") {
            searchInput.attr("placeholder", "Search Full Text");
        }
    });
    container.on("submit", "form.library-search", function(e) {
        e.preventDefault();
        Z.debug("library-search form submitted", 3);
        Zotero.state.clearUrlVars([ "collectionKey", "tag", "q", "qmode" ]);
        var query = container.find("input.search-query").val();
        var searchType = container.find("input.search-query").data("searchtype");
        if (query !== "" || Zotero.state.getUrlVar("q")) {
            Zotero.state.pathVars["q"] = query;
            if (searchType != "simple") {
                Zotero.state.pathVars["qmode"] = searchType;
            }
            Zotero.state.pushState();
        }
        return false;
    });
    container.on("click", ".clear-field-button", function(e) {
        J(".search-query").val("").focus();
    });
};

Zotero.ui.widgets.searchbox.clearLibraryQuery = function() {
    Zotero.state.unsetUrlVar("q");
    Zotero.state.unsetUrlVar("qmode");
    J(".search-query").val("");
    Zotero.state.pushState();
    return;
};

Zotero.ui.widgets.panelContainer = {};

Zotero.ui.widgets.panelContainer.init = function(el) {
    Z.debug("panelContainer widget init", 3);
    var library = Zotero.ui.getAssociatedLibrary(el);
    library.listen("displayedItemsChanged showItemsPanel", Zotero.ui.widgets.panelContainer.showPanel, {
        widgetEl: el,
        panelSelector: "#items-panel"
    });
    library.listen("showCollectionsPanel", Zotero.ui.widgets.panelContainer.showPanel, {
        widgetEl: el,
        panelSelector: "#collections-panel"
    });
    library.listen("showTagsPanel", Zotero.ui.widgets.panelContainer.showPanel, {
        widgetEl: el,
        panelSelector: "#tags-panel"
    });
    library.listen("showItemPanel displayedItemChanged", Zotero.ui.widgets.panelContainer.showPanel, {
        widgetEl: el,
        panelSelector: "#item-panel"
    });
    Zotero.listen("reflow", Zotero.ui.widgets.panelContainer.reflow, {
        widgetEl: el
    });
    Zotero.ui.widgets.panelContainer.showPanel({
        data: {
            widgetEl: el,
            panelSelector: "#items-panel"
        }
    });
    J(window).on("resize", function() {
        Zotero.ui.widgets.panelContainer.reflow({
            data: {
                widgetEl: el
            }
        });
    });
};

Zotero.ui.widgets.panelContainer.reflow = function(evt) {
    Zotero.ui.widgets.panelContainer.showPanel({
        data: {
            widgetEl: evt.data.widgetEl,
            panelSelector: "#items-panel"
        }
    });
};

Zotero.ui.widgets.panelContainer.showPanel = function(evt) {
    Z.debug("panelContainer.showPanel", 3);
    var widgetEl = J(evt.data.widgetEl);
    var selector = evt.data.panelSelector;
    if (selector == "#item-panel" && !Zotero.state.getUrlVar("itemKey")) {
        Z.debug("item-panel selected with no itemKey", 3);
        selector = "#items-panel";
    }
    Z.debug("selector:" + selector, 3);
    var deviceSize = "xs";
    var displaySections = [];
    switch (true) {
      case window.matchMedia("(min-width: 1200px)").matches:
        deviceSize = "lg";
        widgetEl.find(".panelcontainer-panelcontainer").show().find(".panelcontainer-panel").show();
        break;
      case window.matchMedia("(min-width: 992px)").matches:
        deviceSize = "md";
        widgetEl.find(".panelcontainer-panelcontainer").show().find(".panelcontainer-panel").show();
        break;
      case window.matchMedia("(min-width: 768px)").matches:
        deviceSize = "sm";
        widgetEl.find(".panelcontainer-panelcontainer").show().find(".panelcontainer-panel").show();
        if (selector == "#item-panel" || selector == "#items-panel") {
            widgetEl.find(selector).siblings(".panelcontainer-panel").hide();
            widgetEl.find(selector).show();
        }
        break;
      default:
        deviceSize = "xs";
        widgetEl.find(".panelcontainer-panelcontainer").hide().find(".panelcontainer-panel").hide();
        widgetEl.find(selector).show().closest(".panelcontainer-panelcontainer").show();
    }
    Z.debug("panelContainer calculated deviceSize: " + deviceSize, 3);
    widgetEl.find("#panelcontainer-nav li").removeClass("active");
    switch (selector) {
      case "#collections-panel":
        widgetEl.find("li.collections-nav").addClass("active");
        break;
      case "#tags-panel":
        widgetEl.find("li.tags-nav").addClass("active");
        break;
      case "#items-panel":
        widgetEl.find("li.items-nav").addClass("active");
        break;
    }
};

Zotero.ui.widgets.chooseSortingDialog = {};

Zotero.ui.widgets.chooseSortingDialog.init = function(el) {
    Z.debug("chooseSortingDialog widget init", 3);
    var library = Zotero.ui.getAssociatedLibrary(el);
    library.listen("chooseSortingDialog", Zotero.ui.widgets.chooseSortingDialog.show, {
        widgetEl: el
    });
};

Zotero.ui.widgets.chooseSortingDialog.show = function(evt) {
    Z.debug("chooseSortingDialog.show", 3);
    var widgetEl = J(evt.data.widgetEl).empty();
    var library = Zotero.ui.getAssociatedLibrary(widgetEl);
    widgetEl.html(J("#choosesortingdialogTemplate").render({}));
    var dialogEl = widgetEl.find(".choose-sorting-dialog");
    var currentSortField = Zotero.ui.getPrioritizedVariable("order", "title");
    var currentSortOrder = Zotero.ui.getPrioritizedVariable("sort", "asc");
    dialogEl.find(".sort-column-select").val(currentSortField);
    dialogEl.find(".sort-order-select").val(currentSortOrder);
    var saveFunction = function() {
        var newSortField = dialogEl.find(".sort-column-select").val();
        var newSortOrder = dialogEl.find(".sort-order-select").val();
        library.trigger("changeItemSorting", {
            newSortField: newSortField,
            newSortOrder: newSortOrder
        });
        Zotero.ui.closeDialog(dialogEl);
        return false;
    };
    dialogEl.find(".saveSortButton").on("click", saveFunction);
    Zotero.ui.dialog(dialogEl, {});
};

Zotero.url.requestReadApiKeyUrl = function(libraryType, libraryID, redirect) {
    var apiKeyBase = Zotero.config.baseWebsiteUrl + "/settings/keys/new";
    apiKeyBase.replace("http", "https");
    var qparams = {
        name: "Private Feed"
    };
    if (libraryType == "group") {
        qparams["library_access"] = 0;
        qparams["group_" + libraryID] = "read";
        qparams["redirect"] = redirect;
    } else if (libraryType == "user") {
        qparams["library_access"] = 1;
        qparams["notes_access"] = 1;
        qparams["redirect"] = redirect;
    }
    queryParamsArray = [];
    J.each(qparams, function(index, value) {
        queryParamsArray.push(encodeURIComponent(index) + "=" + encodeURIComponent(value));
    });
    queryString = "?" + queryParamsArray.join("&");
    return apiKeyBase + queryString;
};

Zotero.url.groupViewUrl = function(group) {
    if (group.get("type") == "Private") {
        return Zotero.config.baseWebsiteUrl + "/groups/" + group.get("groupID");
    } else {
        return Zotero.config.baseWebsiteUrl + "/groups/" + Zotero.utils.slugify(group.get("name"));
    }
};

Zotero.url.groupLibraryUrl = function(group) {
    if (group.get("type") == "Private") {
        return Zotero.config.baseWebsiteUrl + "/groups/" + group.get("groupID") + "/items";
    } else {
        return Zotero.config.baseWebsiteUrl + "/groups/" + Zotero.utils.slugify(group.get("name")) + "/items";
    }
};

Zotero.url.groupSettingsUrl = function(group) {
    return Zotero.config.baseWebsiteUrl + "/groups/" + group.get("groupID") + "/settings";
};

Zotero.url.groupMemberSettingsUrl = function(group) {
    return Zotero.config.baseWebsiteUrl + "/groups/" + group.get("groupID") + "/settings/members";
};

Zotero.url.groupLibrarySettingsUrl = function(group) {
    return Zotero.config.baseWebsiteUrl + "/groups/" + group.get("groupID") + "/settings/library";
};