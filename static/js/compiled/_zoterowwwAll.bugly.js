(function(e, t) {
    var r, a = Array.prototype.slice, o = decodeURIComponent, i = e.param, n, s, l, c, d = e.bbq = e.bbq || {}, u, p, g, m = e.event.special, f = "hashchange", h = "querystring", b = "fragment", y = "elemUrlAttr", v = "href", Z = "src", w = /^.*\?|#.*$/g, I, C, R, E, S, k = {};
    function T(e) {
        return typeof e === "string";
    }
    function D(e) {
        var t = a.call(arguments, 1);
        return function() {
            return e.apply(this, t.concat(a.call(arguments)));
        };
    }
    function x(e) {
        return e.replace(C, "$2");
    }
    function N(e) {
        return e.replace(/(?:^[^?#]*\?([^#]*).*$)?.*/, "$1");
    }
    function j(t, a, i, s, c) {
        var d, u, p, g, m;
        if (s !== r) {
            p = i.match(t ? C : /^([^#?]*)\??([^#]*)(#?.*)/);
            m = p[3] || "";
            if (c === 2 && T(s)) {
                u = s.replace(t ? I : w, "");
            } else {
                g = l(p[2]);
                s = T(s) ? l[t ? b : h](s) : s;
                u = c === 2 ? s : c === 1 ? e.extend({}, s, g) : e.extend({}, g, s);
                u = n(u);
                if (t) {
                    u = u.replace(R, o);
                }
            }
            d = p[1] + (t ? S : u || !p[1] ? "?" : "") + u + m;
        } else {
            d = a(i !== r ? i : location.href);
        }
        return d;
    }
    i[h] = D(j, 0, N);
    i[b] = s = D(j, 1, x);
    i.sorted = n = function(t, r) {
        var a = [], o = {};
        e.each(i(t, r).split("&"), function(e, t) {
            var r = t.replace(/(?:%5B|=).*$/, ""), i = o[r];
            if (!i) {
                i = o[r] = [];
                a.push(r);
            }
            i.push(t);
        });
        return e.map(a.sort(), function(e) {
            return o[e];
        }).join("&");
    };
    s.noEscape = function(t) {
        t = t || "";
        var r = e.map(t.split(""), encodeURIComponent);
        R = new RegExp(r.join("|"), "g");
    };
    s.noEscape(",/");
    s.ajaxCrawlable = function(e) {
        if (e !== r) {
            if (e) {
                I = /^.*(?:#!|#)/;
                C = /^([^#]*)(?:#!|#)?(.*)$/;
                S = "#!";
            } else {
                I = /^.*#/;
                C = /^([^#]*)#?(.*)$/;
                S = "#";
            }
            E = !!e;
        }
        return E;
    };
    s.ajaxCrawlable(0);
    e.deparam = l = function(t, a) {
        var i = {}, n = {
            "true": !0,
            "false": !1,
            "null": null
        };
        e.each(t.replace(/\+/g, " ").split("&"), function(t, s) {
            var l = s.split("="), c = o(l[0]), d, u = i, p = 0, g = c.split("]["), m = g.length - 1;
            if (/\[/.test(g[0]) && /\]$/.test(g[m])) {
                g[m] = g[m].replace(/\]$/, "");
                g = g.shift().split("[").concat(g);
                m = g.length - 1;
            } else {
                m = 0;
            }
            if (l.length === 2) {
                d = o(l[1]);
                if (a) {
                    d = d && !isNaN(d) ? +d : d === "undefined" ? r : n[d] !== r ? n[d] : d;
                }
                if (m) {
                    for (;p <= m; p++) {
                        c = g[p] === "" ? u.length : g[p];
                        u = u[c] = p < m ? u[c] || (g[p + 1] && isNaN(g[p + 1]) ? {} : []) : d;
                    }
                } else {
                    if (e.isArray(i[c])) {
                        i[c].push(d);
                    } else {
                        if (i[c] !== r) {
                            i[c] = [ i[c], d ];
                        } else {
                            i[c] = d;
                        }
                    }
                }
            } else {
                if (c) {
                    i[c] = a ? r : "";
                }
            }
        });
        return i;
    };
    function L(e, t, a) {
        if (t === r || typeof t === "boolean") {
            a = t;
            t = i[e ? b : h]();
        } else {
            t = T(t) ? t.replace(e ? I : w, "") : t;
        }
        return l(t, a);
    }
    l[h] = D(L, 0);
    l[b] = c = D(L, 1);
    e[y] || (e[y] = function(t) {
        return e.extend(k, t);
    })({
        a: v,
        base: v,
        iframe: Z,
        img: Z,
        input: Z,
        form: "action",
        link: v,
        script: Z
    });
    g = e[y];
    function J(t, a, o, n) {
        if (!T(o) && typeof o !== "object") {
            n = o;
            o = a;
            a = r;
        }
        return this.each(function() {
            var r = e(this), s = a || g()[(this.nodeName || "").toLowerCase()] || "", l = s && r.attr(s) || "";
            r.attr(s, i[t](l, o, n));
        });
    }
    e.fn[h] = D(J, h);
    e.fn[b] = D(J, b);
    d.pushState = u = function(e, t) {
        if (T(e) && /^#/.test(e) && t === r) {
            t = 2;
        }
        var a = e !== r, o = s(location.href, a ? e : {}, a ? t : 2);
        location.href = o;
    };
    d.getState = p = function(e, t) {
        return e === r || typeof e === "boolean" ? c(e) : c(t)[e];
    };
    d.removeState = function(t) {
        var a = {};
        if (t !== r) {
            a = p();
            e.each(e.isArray(t) ? t : arguments, function(e, t) {
                delete a[t];
            });
        }
        u(a, 2);
    };
    m[f] = e.extend(m[f], {
        add: function(t) {
            var a;
            function o(e) {
                var t = e[b] = s();
                e.getState = function(e, a) {
                    return e === r || typeof e === "boolean" ? l(t, e) : l(t, a)[e];
                };
                a.apply(this, arguments);
            }
            if (e.isFunction(t)) {
                a = t;
                return o;
            } else {
                a = t.handler;
                t.handler = o;
            }
        }
    });
})(jQuery, this);

!function() {
    var e, t, r, a;
    !function() {
        var o = {}, i = {};
        e = function(e, t, r) {
            o[e] = {
                deps: t,
                callback: r
            };
        }, a = r = t = function(e) {
            function r(t) {
                if ("." !== t.charAt(0)) return t;
                for (var r = t.split("/"), a = e.split("/").slice(0, -1), o = 0, i = r.length; i > o; o++) {
                    var n = r[o];
                    if (".." === n) a.pop(); else {
                        if ("." === n) continue;
                        a.push(n);
                    }
                }
                return a.join("/");
            }
            if (a._eak_seen = o, i[e]) return i[e];
            if (i[e] = {}, !o[e]) throw new Error("Could not find module " + e);
            for (var n, s = o[e], l = s.deps, c = s.callback, d = [], u = 0, p = l.length; p > u; u++) "exports" === l[u] ? d.push(n = {}) : d.push(t(r(l[u])));
            var g = c.apply(this, d);
            return i[e] = n || g;
        };
    }(), e("promise/all", [ "./utils", "exports" ], function(e, t) {
        "use strict";
        function r(e) {
            var t = this;
            if (!a(e)) throw new TypeError("You must pass an array to all.");
            return new t(function(t, r) {
                function a(e) {
                    return function(t) {
                        i(e, t);
                    };
                }
                function i(e, r) {
                    s[e] = r, 0 === --l && t(s);
                }
                var n, s = [], l = e.length;
                0 === l && t([]);
                for (var c = 0; c < e.length; c++) n = e[c], n && o(n.then) ? n.then(a(c), r) : i(c, n);
            });
        }
        var a = e.isArray, o = e.isFunction;
        t.all = r;
    }), e("promise/asap", [ "exports" ], function(e) {
        "use strict";
        function t() {
            return function() {
                process.nextTick(o);
            };
        }
        function r() {
            var e = 0, t = new l(o), r = document.createTextNode("");
            return t.observe(r, {
                characterData: !0
            }), function() {
                r.data = e = ++e % 2;
            };
        }
        function a() {
            return function() {
                c.setTimeout(o, 1);
            };
        }
        function o() {
            for (var e = 0; e < d.length; e++) {
                var t = d[e], r = t[0], a = t[1];
                r(a);
            }
            d = [];
        }
        function i(e, t) {
            var r = d.push([ e, t ]);
            1 === r && n();
        }
        var n, s = "undefined" != typeof window ? window : {}, l = s.MutationObserver || s.WebKitMutationObserver, c = "undefined" != typeof global ? global : this, d = [];
        n = "undefined" != typeof process && "[object process]" === {}.toString.call(process) ? t() : l ? r() : a(), 
        e.asap = i;
    }), e("promise/cast", [ "exports" ], function(e) {
        "use strict";
        function t(e) {
            if (e && "object" == typeof e && e.constructor === this) return e;
            var t = this;
            return new t(function(t) {
                t(e);
            });
        }
        e.cast = t;
    }), e("promise/config", [ "exports" ], function(e) {
        "use strict";
        function t(e, t) {
            return 2 !== arguments.length ? r[e] : (r[e] = t, void 0);
        }
        var r = {
            instrument: !1
        };
        e.config = r, e.configure = t;
    }), e("promise/polyfill", [ "./promise", "./utils", "exports" ], function(e, t, r) {
        "use strict";
        function a() {
            var e = "Promise" in window && "cast" in window.Promise && "resolve" in window.Promise && "reject" in window.Promise && "all" in window.Promise && "race" in window.Promise && function() {
                var e;
                return new window.Promise(function(t) {
                    e = t;
                }), i(e);
            }();
            e || (window.Promise = o);
        }
        var o = e.Promise, i = t.isFunction;
        r.polyfill = a;
    }), e("promise/promise", [ "./config", "./utils", "./cast", "./all", "./race", "./resolve", "./reject", "./asap", "exports" ], function(e, t, r, a, o, i, n, s, l) {
        "use strict";
        function c(e) {
            if (!I(e)) throw new TypeError("You must pass a resolver function as the first argument to the promise constructor");
            if (!(this instanceof c)) throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
            this._subscribers = [], d(e, this);
        }
        function d(e, t) {
            function r(e) {
                f(t, e);
            }
            function a(e) {
                b(t, e);
            }
            try {
                e(r, a);
            } catch (o) {
                a(o);
            }
        }
        function u(e, t, r, a) {
            var o, i, n, s, l = I(r);
            if (l) try {
                o = r(a), n = !0;
            } catch (c) {
                s = !0, i = c;
            } else o = a, n = !0;
            m(t, o) || (l && n ? f(t, o) : s ? b(t, i) : e === N ? f(t, o) : e === j && b(t, o));
        }
        function p(e, t, r, a) {
            var o = e._subscribers, i = o.length;
            o[i] = t, o[i + N] = r, o[i + j] = a;
        }
        function g(e, t) {
            for (var r, a, o = e._subscribers, i = e._detail, n = 0; n < o.length; n += 3) r = o[n], 
            a = o[n + t], u(t, r, a, i);
            e._subscribers = null;
        }
        function m(e, t) {
            var r, a = null;
            try {
                if (e === t) throw new TypeError("A promises callback cannot return that same promise.");
                if (w(t) && (a = t.then, I(a))) return a.call(t, function(a) {
                    return r ? !0 : (r = !0, t !== a ? f(e, a) : h(e, a), void 0);
                }, function(t) {
                    return r ? !0 : (r = !0, b(e, t), void 0);
                }), !0;
            } catch (o) {
                return r ? !0 : (b(e, o), !0);
            }
            return !1;
        }
        function f(e, t) {
            e === t ? h(e, t) : m(e, t) || h(e, t);
        }
        function h(e, t) {
            e._state === D && (e._state = x, e._detail = t, Z.async(y, e));
        }
        function b(e, t) {
            e._state === D && (e._state = x, e._detail = t, Z.async(v, e));
        }
        function y(e) {
            g(e, e._state = N);
        }
        function v(e) {
            g(e, e._state = j);
        }
        var Z = e.config, w = (e.configure, t.objectOrFunction), I = t.isFunction, C = (t.now, 
        r.cast), R = a.all, E = o.race, S = i.resolve, k = n.reject, T = s.asap;
        Z.async = T;
        var D = void 0, x = 0, N = 1, j = 2;
        c.prototype = {
            constructor: c,
            _state: void 0,
            _detail: void 0,
            _subscribers: void 0,
            then: function(e, t) {
                var r = this, a = new this.constructor(function() {});
                if (this._state) {
                    var o = arguments;
                    Z.async(function() {
                        u(r._state, a, o[r._state - 1], r._detail);
                    });
                } else p(this, a, e, t);
                return a;
            },
            "catch": function(e) {
                return this.then(null, e);
            }
        }, c.all = R, c.cast = C, c.race = E, c.resolve = S, c.reject = k, l.Promise = c;
    }), e("promise/race", [ "./utils", "exports" ], function(e, t) {
        "use strict";
        function r(e) {
            var t = this;
            if (!a(e)) throw new TypeError("You must pass an array to race.");
            return new t(function(t, r) {
                for (var a, o = 0; o < e.length; o++) a = e[o], a && "function" == typeof a.then ? a.then(t, r) : t(a);
            });
        }
        var a = e.isArray;
        t.race = r;
    }), e("promise/reject", [ "exports" ], function(e) {
        "use strict";
        function t(e) {
            var t = this;
            return new t(function(t, r) {
                r(e);
            });
        }
        e.reject = t;
    }), e("promise/resolve", [ "exports" ], function(e) {
        "use strict";
        function t(e) {
            var t = this;
            return new t(function(t) {
                t(e);
            });
        }
        e.resolve = t;
    }), e("promise/utils", [ "exports" ], function(e) {
        "use strict";
        function t(e) {
            return r(e) || "object" == typeof e && null !== e;
        }
        function r(e) {
            return "function" == typeof e;
        }
        function a(e) {
            return "[object Array]" === Object.prototype.toString.call(e);
        }
        var o = Date.now || function() {
            return new Date().getTime();
        };
        e.objectOrFunction = t, e.isFunction = r, e.isArray = a, e.now = o;
    }), t("promise/polyfill").polyfill();
}();

(function(e) {
    if (typeof exports === "object") {
        module.exports = e();
    } else {
        if (typeof define === "function" && define.amd) {
            define(e);
        } else {
            var t;
            try {
                t = window;
            } catch (r) {
                t = self;
            }
            t.SparkMD5 = e();
        }
    }
})(function(e) {
    var t = function(e, t) {
        return e + t & 4294967295;
    }, r = function(e, r, a, o, i, n) {
        r = t(t(r, e), t(o, n));
        return t(r << i | r >>> 32 - i, a);
    }, a = function(e, t, a, o, i, n, s) {
        return r(t & a | ~t & o, e, t, i, n, s);
    }, o = function(e, t, a, o, i, n, s) {
        return r(t & o | a & ~o, e, t, i, n, s);
    }, i = function(e, t, a, o, i, n, s) {
        return r(t ^ a ^ o, e, t, i, n, s);
    }, n = function(e, t, a, o, i, n, s) {
        return r(a ^ (t | ~o), e, t, i, n, s);
    }, s = function(e, r) {
        var s = e[0], l = e[1], c = e[2], d = e[3];
        s = a(s, l, c, d, r[0], 7, -680876936);
        d = a(d, s, l, c, r[1], 12, -389564586);
        c = a(c, d, s, l, r[2], 17, 606105819);
        l = a(l, c, d, s, r[3], 22, -1044525330);
        s = a(s, l, c, d, r[4], 7, -176418897);
        d = a(d, s, l, c, r[5], 12, 1200080426);
        c = a(c, d, s, l, r[6], 17, -1473231341);
        l = a(l, c, d, s, r[7], 22, -45705983);
        s = a(s, l, c, d, r[8], 7, 1770035416);
        d = a(d, s, l, c, r[9], 12, -1958414417);
        c = a(c, d, s, l, r[10], 17, -42063);
        l = a(l, c, d, s, r[11], 22, -1990404162);
        s = a(s, l, c, d, r[12], 7, 1804603682);
        d = a(d, s, l, c, r[13], 12, -40341101);
        c = a(c, d, s, l, r[14], 17, -1502002290);
        l = a(l, c, d, s, r[15], 22, 1236535329);
        s = o(s, l, c, d, r[1], 5, -165796510);
        d = o(d, s, l, c, r[6], 9, -1069501632);
        c = o(c, d, s, l, r[11], 14, 643717713);
        l = o(l, c, d, s, r[0], 20, -373897302);
        s = o(s, l, c, d, r[5], 5, -701558691);
        d = o(d, s, l, c, r[10], 9, 38016083);
        c = o(c, d, s, l, r[15], 14, -660478335);
        l = o(l, c, d, s, r[4], 20, -405537848);
        s = o(s, l, c, d, r[9], 5, 568446438);
        d = o(d, s, l, c, r[14], 9, -1019803690);
        c = o(c, d, s, l, r[3], 14, -187363961);
        l = o(l, c, d, s, r[8], 20, 1163531501);
        s = o(s, l, c, d, r[13], 5, -1444681467);
        d = o(d, s, l, c, r[2], 9, -51403784);
        c = o(c, d, s, l, r[7], 14, 1735328473);
        l = o(l, c, d, s, r[12], 20, -1926607734);
        s = i(s, l, c, d, r[5], 4, -378558);
        d = i(d, s, l, c, r[8], 11, -2022574463);
        c = i(c, d, s, l, r[11], 16, 1839030562);
        l = i(l, c, d, s, r[14], 23, -35309556);
        s = i(s, l, c, d, r[1], 4, -1530992060);
        d = i(d, s, l, c, r[4], 11, 1272893353);
        c = i(c, d, s, l, r[7], 16, -155497632);
        l = i(l, c, d, s, r[10], 23, -1094730640);
        s = i(s, l, c, d, r[13], 4, 681279174);
        d = i(d, s, l, c, r[0], 11, -358537222);
        c = i(c, d, s, l, r[3], 16, -722521979);
        l = i(l, c, d, s, r[6], 23, 76029189);
        s = i(s, l, c, d, r[9], 4, -640364487);
        d = i(d, s, l, c, r[12], 11, -421815835);
        c = i(c, d, s, l, r[15], 16, 530742520);
        l = i(l, c, d, s, r[2], 23, -995338651);
        s = n(s, l, c, d, r[0], 6, -198630844);
        d = n(d, s, l, c, r[7], 10, 1126891415);
        c = n(c, d, s, l, r[14], 15, -1416354905);
        l = n(l, c, d, s, r[5], 21, -57434055);
        s = n(s, l, c, d, r[12], 6, 1700485571);
        d = n(d, s, l, c, r[3], 10, -1894986606);
        c = n(c, d, s, l, r[10], 15, -1051523);
        l = n(l, c, d, s, r[1], 21, -2054922799);
        s = n(s, l, c, d, r[8], 6, 1873313359);
        d = n(d, s, l, c, r[15], 10, -30611744);
        c = n(c, d, s, l, r[6], 15, -1560198380);
        l = n(l, c, d, s, r[13], 21, 1309151649);
        s = n(s, l, c, d, r[4], 6, -145523070);
        d = n(d, s, l, c, r[11], 10, -1120210379);
        c = n(c, d, s, l, r[2], 15, 718787259);
        l = n(l, c, d, s, r[9], 21, -343485551);
        e[0] = t(s, e[0]);
        e[1] = t(l, e[1]);
        e[2] = t(c, e[2]);
        e[3] = t(d, e[3]);
    }, l = function(e) {
        var t = [], r;
        for (r = 0; r < 64; r += 4) {
            t[r >> 2] = e.charCodeAt(r) + (e.charCodeAt(r + 1) << 8) + (e.charCodeAt(r + 2) << 16) + (e.charCodeAt(r + 3) << 24);
        }
        return t;
    }, c = function(e) {
        var t = [], r;
        for (r = 0; r < 64; r += 4) {
            t[r >> 2] = e[r] + (e[r + 1] << 8) + (e[r + 2] << 16) + (e[r + 3] << 24);
        }
        return t;
    }, d = function(e) {
        var t = e.length, r = [ 1732584193, -271733879, -1732584194, 271733878 ], a, o, i, n, c, d;
        for (a = 64; a <= t; a += 64) {
            s(r, l(e.substring(a - 64, a)));
        }
        e = e.substring(a - 64);
        o = e.length;
        i = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
        for (a = 0; a < o; a += 1) {
            i[a >> 2] |= e.charCodeAt(a) << (a % 4 << 3);
        }
        i[a >> 2] |= 128 << (a % 4 << 3);
        if (a > 55) {
            s(r, i);
            for (a = 0; a < 16; a += 1) {
                i[a] = 0;
            }
        }
        n = t * 8;
        n = n.toString(16).match(/(.*?)(.{0,8})$/);
        c = parseInt(n[2], 16);
        d = parseInt(n[1], 16) || 0;
        i[14] = c;
        i[15] = d;
        s(r, i);
        return r;
    }, u = function(e) {
        var t = e.length, r = [ 1732584193, -271733879, -1732584194, 271733878 ], a, o, i, n, l, d;
        for (a = 64; a <= t; a += 64) {
            s(r, c(e.subarray(a - 64, a)));
        }
        e = a - 64 < t ? e.subarray(a - 64) : new Uint8Array(0);
        o = e.length;
        i = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
        for (a = 0; a < o; a += 1) {
            i[a >> 2] |= e[a] << (a % 4 << 3);
        }
        i[a >> 2] |= 128 << (a % 4 << 3);
        if (a > 55) {
            s(r, i);
            for (a = 0; a < 16; a += 1) {
                i[a] = 0;
            }
        }
        n = t * 8;
        n = n.toString(16).match(/(.*?)(.{0,8})$/);
        l = parseInt(n[2], 16);
        d = parseInt(n[1], 16) || 0;
        i[14] = l;
        i[15] = d;
        s(r, i);
        return r;
    }, p = [ "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f" ], g = function(e) {
        var t = "", r;
        for (r = 0; r < 4; r += 1) {
            t += p[e >> r * 8 + 4 & 15] + p[e >> r * 8 & 15];
        }
        return t;
    }, m = function(e) {
        var t;
        for (t = 0; t < e.length; t += 1) {
            e[t] = g(e[t]);
        }
        return e.join("");
    }, f = function(e) {
        return m(d(e));
    }, h = function() {
        this.reset();
    };
    if (f("hello") !== "5d41402abc4b2a76b9719d911017c592") {
        t = function(e, t) {
            var r = (e & 65535) + (t & 65535), a = (e >> 16) + (t >> 16) + (r >> 16);
            return a << 16 | r & 65535;
        };
    }
    h.prototype.append = function(e) {
        if (/[\u0080-\uFFFF]/.test(e)) {
            e = unescape(encodeURIComponent(e));
        }
        this.appendBinary(e);
        return this;
    };
    h.prototype.appendBinary = function(e) {
        this._buff += e;
        this._length += e.length;
        var t = this._buff.length, r;
        for (r = 64; r <= t; r += 64) {
            s(this._state, l(this._buff.substring(r - 64, r)));
        }
        this._buff = this._buff.substr(r - 64);
        return this;
    };
    h.prototype.end = function(e) {
        var t = this._buff, r = t.length, a, o = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ], i;
        for (a = 0; a < r; a += 1) {
            o[a >> 2] |= t.charCodeAt(a) << (a % 4 << 3);
        }
        this._finish(o, r);
        i = !!e ? this._state : m(this._state);
        this.reset();
        return i;
    };
    h.prototype._finish = function(e, t) {
        var r = t, a, o, i;
        e[r >> 2] |= 128 << (r % 4 << 3);
        if (r > 55) {
            s(this._state, e);
            for (r = 0; r < 16; r += 1) {
                e[r] = 0;
            }
        }
        a = this._length * 8;
        a = a.toString(16).match(/(.*?)(.{0,8})$/);
        o = parseInt(a[2], 16);
        i = parseInt(a[1], 16) || 0;
        e[14] = o;
        e[15] = i;
        s(this._state, e);
    };
    h.prototype.reset = function() {
        this._buff = "";
        this._length = 0;
        this._state = [ 1732584193, -271733879, -1732584194, 271733878 ];
        return this;
    };
    h.prototype.destroy = function() {
        delete this._state;
        delete this._buff;
        delete this._length;
    };
    h.hash = function(e, t) {
        if (/[\u0080-\uFFFF]/.test(e)) {
            e = unescape(encodeURIComponent(e));
        }
        var r = d(e);
        return !!t ? r : m(r);
    };
    h.hashBinary = function(e, t) {
        var r = d(e);
        return !!t ? r : m(r);
    };
    h.ArrayBuffer = function() {
        this.reset();
    };
    h.ArrayBuffer.prototype.append = function(e) {
        var t = this._concatArrayBuffer(this._buff, e), r = t.length, a;
        this._length += e.byteLength;
        for (a = 64; a <= r; a += 64) {
            s(this._state, c(t.subarray(a - 64, a)));
        }
        this._buff = a - 64 < r ? t.subarray(a - 64) : new Uint8Array(0);
        return this;
    };
    h.ArrayBuffer.prototype.end = function(e) {
        var t = this._buff, r = t.length, a = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ], o, i;
        for (o = 0; o < r; o += 1) {
            a[o >> 2] |= t[o] << (o % 4 << 3);
        }
        this._finish(a, r);
        i = !!e ? this._state : m(this._state);
        this.reset();
        return i;
    };
    h.ArrayBuffer.prototype._finish = h.prototype._finish;
    h.ArrayBuffer.prototype.reset = function() {
        this._buff = new Uint8Array(0);
        this._length = 0;
        this._state = [ 1732584193, -271733879, -1732584194, 271733878 ];
        return this;
    };
    h.ArrayBuffer.prototype.destroy = h.prototype.destroy;
    h.ArrayBuffer.prototype._concatArrayBuffer = function(e, t) {
        var r = e.length, a = new Uint8Array(r + t.byteLength);
        a.set(e);
        a.set(new Uint8Array(t), r);
        return a;
    };
    h.ArrayBuffer.hash = function(e, t) {
        var r = u(new Uint8Array(e));
        return !!t ? r : m(r);
    };
    return h;
});

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
        debugLogEndpoint: "",
        storeDebug: true,
        directDownloads: true,
        proxyPath: "/proxyrequest",
        ignoreLoggedInStatus: false,
        storePrefsRemote: true,
        preferUrlItem: true,
        sessionAuth: false,
        proxy: false,
        apiKey: "",
        ajax: 1,
        apiVersion: 3,
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
            start: 0
        }
    },
    debug: function(e, t) {
        var r = 3;
        if (Zotero.config.storeDebug) {
            if (t <= r) {
                Zotero.debugstring += "DEBUG:" + e + "\n";
            }
        }
        if (typeof console == "undefined") {
            return;
        }
        if (typeof t !== "number") {
            t = 1;
        }
        if (Zotero.preferences !== undefined) {
            r = Zotero.preferences.getPref("debug_level");
        }
        if (t <= r) {
            console.log(e);
        }
    },
    warn: function(e) {
        if (Zotero.config.storeDebug) {
            Zotero.debugstring += "WARN:" + e + "\n";
        }
        if (typeof console == "undefined" || typeof console.warn == "undefined") {
            this.debug(e);
        } else {
            console.warn(e);
        }
    },
    error: function(e) {
        if (Zotero.config.storeDebug) {
            Zotero.debugstring += "ERROR:" + e + "\n";
        }
        if (typeof console == "undefined" || typeof console.error == "undefined") {
            this.debug(e);
        } else {
            console.error(e);
        }
    },
    submitDebugLog: function() {
        response = J.post(Zotero.config.debugLogEndpoint, {
            debug_string: Zotero.debugstring
        }, function(e) {
            if (e.logID) {
                alert("ZoteroWWW debug logID:" + e.logID);
            } else if (e.error) {
                alert("Error submitting ZoteroWWW debug log:" + e.error);
            }
        });
    },
    catchPromiseError: function(e) {
        Zotero.error(e);
    },
    libraries: {},
    validator: {
        patterns: {
            itemKey: /^.+$/,
            collectionKey: /^([A-Z0-9]{8,})|trash$/,
            libraryID: /^[0-9]+$/,
            libraryType: /^(user|group|)$/,
            target: /^(items?|collections?|tags|children|deleted|userGroups|key|settings|publications)$/,
            targetModifier: /^(top|file|file\/view)$/,
            sort: /^(asc|desc)$/,
            start: /^[0-9]*$/,
            limit: /^[0-9]*$/,
            order: /^\S*$/,
            content: /^((html|json|data|bib|none|bibtex|bookmarks|coins|csljson|mods|refer|rdf_bibliontology|rdf_dc|ris|tei|wikipedia),?)+$/,
            include: /^((html|json|data|bib|none|bibtex|bookmarks|coins|csljson|mods|refer|rdf_bibliontology|rdf_dc|ris|tei|wikipedia),?)+$/,
            q: /^.*$/,
            fq: /^\S*$/,
            itemType: /^\S*$/,
            locale: /^\S*$/,
            tag: /^.*$/,
            tagType: /^(0|1)$/,
            key: /^\S*/,
            format: /^(json|atom|bib|keys|versions|bibtex|bookmarks|mods|refer|rdf_bibliontology|rdf_dc|rdf_zotero|ris|wikipedia)$/,
            style: /^\S*$/,
            linkwrap: /^(0|1)*$/
        },
        validate: function(e, t) {
            Z.debug("Zotero.validate", 4);
            if (e === "") {
                return null;
            } else if (e === null) {
                return true;
            }
            Z.debug(e + " " + t, 4);
            var r = this.patterns;
            if (r.hasOwnProperty(t)) {
                return r[t].test(e);
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
        var e;
        if (Zotero.config.cacheStoreType == "localStorage" && typeof localStorage != "undefined") {
            e = localStorage;
        } else if (Zotero.config.cacheStoreType == "sessionStorage" && typeof sessionStorage != "undefined") {
            e = sessionStorage;
        } else {
            e = {};
        }
        Zotero.store = e;
        Zotero.cache = new Zotero.Cache(e);
        Zotero.preferences = new Zotero.Preferences(Zotero.store, "global");
        var t = "en-US";
        if (Zotero.config.locale) {
            t = Zotero.config.locale;
        }
        t = "en-US";
        J.ajaxSettings.traditional = true;
    }
};

Zotero.Cache = function(e) {
    this.store = e;
    var t = this.store._registry;
    if (t === null || typeof t == "undefined") {
        t = {};
        this.store._registry = JSON.stringify(t);
    }
};

Zotero.Cache.prototype.objectCacheString = function(e) {
    var t = [];
    J.each(e, function(e, r) {
        if (!r) {
            return;
        } else if (r instanceof Array) {
            J.each(r, function(r, a) {
                t.push(e + "/" + encodeURIComponent(a));
            });
        } else {
            t.push(e + "/" + encodeURIComponent(r));
        }
    });
    t.sort();
    Z.debug(t, 4);
    var r = t.join("/");
    return r;
};

Zotero.Cache.prototype.save = function(e, t, r) {
    if (!J.isArray(r)) {
        r = [];
    }
    var a = JSON.parse(this.store._registry);
    if (!a) {
        a = {};
    }
    var o = this.objectCacheString(e);
    this.store[o] = JSON.stringify(t);
    var i = {
        id: o,
        saved: Date.now(),
        cachetags: r
    };
    a[o] = i;
    this.store._registry = JSON.stringify(a);
};

Zotero.Cache.prototype.load = function(e) {
    Z.debug("Zotero.Cache.load", 3);
    var t = this.objectCacheString(e);
    Z.debug(t, 4);
    try {
        var r = this.store[t];
        if (!r) {
            Z.warn("No value found in cache store - " + t, 3);
            return null;
        } else {
            return JSON.parse(r);
        }
    } catch (a) {
        Z.error("Error parsing retrieved cache data: " + t + " : " + r);
        return null;
    }
};

Zotero.Cache.prototype.expireCacheTag = function(e) {
    Z.debug("Zotero.Cache.expireCacheTag", 3);
    var t = JSON.parse(this.store._registry);
    var r = this.store;
    J.each(t, function(a, o) {
        if (J.inArray(e, o.cachetags) != -1) {
            Z.debug("tag " + e + " found for item " + o["id"] + " : expiring", 4);
            delete r[o["id"]];
            delete t[o["id"]];
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

Zotero.ajaxRequest = function(e, t, r) {
    Z.debug("Zotero.ajaxRequest ==== " + e, 3);
    if (!t) {
        t = "GET";
    }
    if (!r) {
        r = {};
    }
    var a = {
        url: e,
        type: t
    };
    a = J.extend({}, a, r);
    Z.debug(a, 3);
    return Zotero.net.queueRequest(a);
};

Zotero.trigger = function(e, t, r) {
    if (r) {
        Z.debug("filter is not false");
        e += "_" + r;
    }
    Zotero.debug("Triggering eventful " + e, 3);
    if (!t) {
        t = {};
    }
    t.zeventful = true;
    if (t.triggeringElement === null || t.triggeringElement === undefined) {
        t.triggeringElement = J("#eventful");
    }
    Zotero.debug("Triggering eventful " + e, 3);
    var a = J.Event(e, t);
    try {
        J("#eventful").trigger(a);
    } catch (a) {
        Z.error("failed triggering:" + e);
        Z.error(a);
    }
};

Zotero.listen = function(e, t, r, a) {
    if (a) {
        var o = e.split(" ");
        if (o.length > 0) {
            for (var i = 0; i < o.length; i++) {
                o[i] += "_" + a;
            }
            e = o.join(" ");
        }
    }
    Z.debug("listening on " + e, 3);
    J("#eventful").on(e, null, r, t);
};

var Z = Zotero;

Zotero.ajax.errorCallback = function(e) {
    Z.error(e);
    Z.debug("ajax error callback", 2);
    Z.debug("textStatus: " + e.textStatus, 2);
    Z.debug("errorThrown: ", 2);
    Z.debug(e.errorThrown, 2);
    Z.debug(e.jqxhr, 2);
};

Zotero.ajax.error = Zotero.ajax.errorCallback;

Zotero.ajax.activeRequests = [];

Zotero.ajax.apiRequestUrl = function(e) {
    Z.debug("Zotero.ajax.apiRequestUrl", 4);
    Z.debug(e, 4);
    J.each(e, function(t, r) {
        if (typeof r == "string") {
            r = r.split("#", 1);
            e[t] = r[0];
        }
        if (Zotero.validator.validate(r, t) === false) {
            Zotero.warn("API argument failed validation: " + t + " cannot be " + r);
            Zotero.warn(e);
            delete e[t];
        }
    });
    if (!e.target) throw new Error("No target defined for api request");
    if (!(e.libraryType == "user" || e.libraryType == "group" || e.libraryType === "")) {
        throw new Error("Unexpected libraryType for api request " + JSON.stringify(e));
    }
    if (e.libraryType && !e.libraryID) {
        throw new Error("No libraryID defined for api request");
    }
    if (e.target == "publications" && e.libraryType != "user") {
        throw new Error("publications is only valid for user libraries");
    }
    var t = Zotero.config.baseApiUrl;
    var r;
    if (e.libraryType !== "") {
        r = t + "/" + e.libraryType + "s/" + e.libraryID;
        if (e.collectionKey) {
            if (e.collectionKey == "trash") {
                r += "/items/trash";
                return r;
            } else if (e.collectionKey.indexOf(",") !== -1) {} else if (e.target != "collections") {
                r += "/collections/" + e.collectionKey;
            }
        }
    } else {
        r = t;
    }
    switch (e.target) {
      case "items":
        r += "/items";
        break;

      case "item":
        if (e.itemKey) {
            r += "/items/" + e.itemKey;
        } else {
            r += "/items";
        }
        break;

      case "collections":
        r += "/collections";
        break;

      case "childCollections":
        r += "/collections";
        break;

      case "collection":
        break;

      case "tags":
        r += "/tags";
        break;

      case "children":
        r += "/items/" + e.itemKey + "/children";
        break;

      case "key":
        r = t + "/users/" + e.libraryID + "/keys/" + e.apiKey;
        break;

      case "deleted":
        r += "/deleted";
        break;

      case "userGroups":
        r = t + "/users/" + e.libraryID + "/groups";
        break;

      case "settings":
        r += "/settings/" + (e.settingsKey || "");
        break;

      case "publications":
        r += "/publications/items";
        break;

      default:
        return false;
    }
    switch (e.targetModifier) {
      case "top":
        r += "/top";
        break;

      case "file":
        r += "/file";
        break;

      case "viewsnapshot":
        r += "/file/view";
        break;
    }
    return r;
};

Zotero.ajax.apiQueryString = function(e, t) {
    Z.debug("Zotero.ajax.apiQueryString", 4);
    Z.debug(e, 4);
    if (t === null || typeof t === "undefined") {
        t = true;
    }
    J.each(e, function(t, r) {
        if (typeof r == "string") {
            r = r.split("#", 1);
            e[t] = r[0];
        }
    });
    if (e.hasOwnProperty("order") && e["order"] == "creatorSummary") {
        e["order"] = "creator";
    }
    if (e.hasOwnProperty("order") && e["order"] == "year") {
        e["order"] = "date";
    }
    if (t && Zotero.config.sessionAuth) {
        var r = Zotero.utils.readCookie(Zotero.config.sessionCookieName);
        e["session"] = r;
    } else if (t && Zotero.config.apiKey) {
        e["key"] = Zotero.config.apiKey;
    }
    if (e.hasOwnProperty("sort") && e["sort"] == "undefined") {
        e["sort"] = "asc";
    }
    Z.debug(e, 4);
    var a = "?";
    var o = [];
    var i = [ "start", "limit", "order", "sort", "content", "include", "format", "q", "fq", "itemType", "itemKey", "collectionKey", "searchKey", "locale", "tag", "tagType", "key", "style", "linkMode", "linkwrap", "session", "newer", "since" ];
    i.sort();
    var n = {};
    J.each(i, function(t, r) {
        if (e.hasOwnProperty(r) && e[r] !== "") {
            n[r] = e[r];
        }
    });
    if (e.hasOwnProperty("target") && e["target"] !== "items") {
        if (n.hasOwnProperty("itemKey") && n["itemKey"].indexOf(",") == -1) {
            delete n["itemKey"];
        }
    }
    if (e.hasOwnProperty("target") && e["target"] !== "collections") {
        if (n.hasOwnProperty("collectionKey") && n["collectionKey"].indexOf(",") === -1) {
            delete n["collectionKey"];
        }
    }
    J.each(n, function(e, t) {
        if (t instanceof Array) {
            J.each(t, function(t, r) {
                if (e == "tag" && r[0] == "-") {
                    r = "\\" + r;
                }
                o.push(encodeURIComponent(e) + "=" + encodeURIComponent(r));
            });
        } else {
            if (e == "tag" && t[0] == "-") {
                t = "\\" + t;
            }
            o.push(encodeURIComponent(e) + "=" + encodeURIComponent(t));
        }
    });
    a += o.join("&");
    return a;
};

Zotero.ajax.apiRequestString = function(e) {
    return Zotero.ajax.apiRequestUrl(e) + Zotero.ajax.apiQueryString(e);
};

Zotero.ajax.proxyWrapper = function(e, t) {
    if (Zotero.config.proxy) {
        if (!t) {
            t = "GET";
        }
        return Zotero.config.proxyPath + "?requestMethod=" + t + "&requestUrl=" + encodeURIComponent(e);
    } else {
        return e;
    }
};

Zotero.ajax.parseQueryString = function(e) {};

Zotero.ajax.webUrl = function(e) {};

Zotero.ajax.downloadBlob = function(e) {
    return new Promise(function(t, r) {
        var a = new XMLHttpRequest();
        var o;
        a.open("GET", e, true);
        a.responseType = "blob";
        a.addEventListener("load", function() {
            if (a.status === 200) {
                Z.debug("downloadBlob Image retrieved. resolving", 3);
                t(a.response);
            } else {
                r(a.response);
            }
        });
        a.send();
    });
};

Zotero.ApiObject = function() {
    this.instance = "Zotero.ApiObject";
    this.version = 0;
};

Zotero.ApiObject.prototype.associateWithLibrary = function(e) {
    var t = this;
    t.owningLibrary = e;
    if (typeof this.apiObj.library == "object") {
        this.apiObj.library.type = e.type;
        this.apiObj.library.id = e.libraryID;
    }
    return t;
};

Zotero.ApiObject.prototype.fieldComparer = function(e) {
    if (window.Intl) {
        var t = new window.Intl.Collator();
        return function(r, a) {
            return t.compare(r.apiObj.data[e], a.apiObj.data[e]);
        };
    } else {
        return function(t, r) {
            if (t.apiObj.data[e].toLowerCase() == r.apiObj.data[e].toLowerCase()) {
                return 0;
            }
            if (t.apiObj.data[e].toLowerCase() < r.apiObj.data[e].toLowerCase()) {
                return -1;
            }
            return 1;
        };
    }
};

Zotero.ApiResponse = function(e) {
    Z.debug("Zotero.ApiResponse", 3);
    this.totalResults = 0;
    this.apiVersion = null;
    this.lastModifiedVersion = 0;
    this.linkHeader = "";
    this.links = {};
    if (e) {
        if (!e.isError) {
            this.isError = false;
        } else {
            this.isError = true;
        }
        this.data = e.data;
        this.parseResponse(e);
    }
};

Zotero.ApiResponse.prototype.parseResponse = function(e) {
    Z.debug("parseResponse");
    var t = this;
    t.jqxhr = e.jqxhr;
    t.status = e.jqxhr.status;
    t.lastModifiedVersion = e.jqxhr.getResponseHeader("Last-Modified-Version");
    t.apiVersion = e.jqxhr.getResponseHeader("Zotero-API-Version");
    t.backoff = e.jqxhr.getResponseHeader("Backoff");
    t.retryAfter = e.jqxhr.getResponseHeader("Retry-After");
    t.contentType = e.jqxhr.getResponseHeader("Content-Type");
    t.linkHeader = e.jqxhr.getResponseHeader("Link");
    t.totalResults = e.jqxhr.getResponseHeader("Total-Results");
    if (t.backoff) {
        t.backoff = parseInt(t.backoff, 10);
    }
    if (t.retryAfter) {
        t.retryAfter = parseInt(t.retryAfter, 10);
    }
    Z.debug("parse link header");
    Z.debug(t.linkHeader);
    if (t.linkHeader) {
        var r = t.linkHeader.split(",");
        var a = {};
        var o = /^<([^>]+)>; rel="([^\"]*)"$/;
        for (var i = 0; i < r.length; i++) {
            var n = o.exec(r[i].trim());
            if (n[2]) {
                a[n[2]] = n[1];
            }
        }
        t.parsedLinks = a;
    }
    Z.debug("done parsing response");
};

Zotero.Net = function() {
    this.deferredQueue = [];
    this.numRunning = 0;
    this.numConcurrent = 3;
    this.backingOff = false;
};

Zotero.Net.prototype.queueDeferred = function() {
    var e = this;
    var t = new J.Deferred();
    e.deferredQueue.push(t);
    return Promise.resolve(t);
};

Zotero.Net.prototype.queueRequest = function(e) {
    Z.debug("Zotero.Net.queueRequest", 3);
    var t = this;
    var r;
    if (J.isArray(e)) {
        r = t.queueDeferred().then(function() {
            Z.debug("running sequential after queued deferred resolved", 4);
            return t.runSequential(e);
        }).then(function(e) {
            Z.debug("runSequential done", 3);
            t.queuedRequestDone();
            return e;
        });
    } else {
        r = t.queueDeferred().then(function() {
            Z.debug("running concurrent after queued deferred resolved", 4);
            return t.runConcurrent(e);
        }).then(function(e) {
            Z.debug("done with queuedRequest");
            t.queuedRequestDone();
            return e;
        });
    }
    t.runNext();
    return r.catch(function(e) {
        Z.error("Error before leaving Zotero.Net");
        Z.error(e);
    });
};

Zotero.Net.prototype.runConcurrent = function(e) {
    Z.debug("Zotero.Net.runConcurrent", 3);
    return this.ajaxRequest(e).then(function(e) {
        Z.debug("done with runConcurrent request");
        return e;
    });
};

Zotero.Net.prototype.runSequential = function(e) {
    Z.debug("Zotero.Net.runSequential", 3);
    var t = this;
    var r = [];
    var a = Promise.resolve();
    for (var o = 0; o < e.length; o++) {
        var i = e[o];
        a = a.then(function() {
            var e = t.ajaxRequest(i).then(function(e) {
                Z.debug("pushing sequential response into result array");
                r.push(e);
            });
            return e;
        });
    }
    return a.then(function() {
        Z.debug("done with sequential aggregator promise - returning responses");
        return r;
    });
};

Zotero.Net.prototype.individualRequestDone = function(e) {
    Z.debug("Zotero.Net.individualRequestDone", 3);
    var t = this;
    var r = Date.now();
    var a = t.checkDelay(e);
    if (a > 0) {
        waitms = a * 1e3;
        t.backingOff = true;
        var o = Date.now() + waitms;
        if (o > t.waitingExpires) {
            t.waitingExpires = o;
        }
        window.setTimeout(t.runNext, waitms);
    }
    return e;
};

Zotero.Net.prototype.queuedRequestDone = function(e) {
    Z.debug("queuedRequestDone", 3);
    var t = this;
    t.numRunning--;
    t.runNext();
    return e;
};

Zotero.Net.prototype.runNext = function() {
    Z.debug("Zotero.Net.runNext", 3);
    var e = this;
    var t = Date.now();
    if (e.backingOff && e.waitingExpires > t - 100) {
        Z.debug("currently backing off", 3);
        var r = e.waitingExpires - t;
        window.setTimeout(e.runNext, r);
        return;
    } else if (e.backingOff && e.waitingExpires <= t - 100) {
        e.backingOff = false;
    }
    Z.debug(e.numRunning + "/" + e.numConcurrent + " Running. " + e.deferredQueue.length + " queued.", 3);
    while (e.deferredQueue.length > 0 && e.numRunning < e.numConcurrent) {
        e.numRunning++;
        var a = e.deferredQueue.shift();
        a.resolve();
        Z.debug(e.numRunning + "/" + e.numConcurrent + " Running. " + e.deferredQueue.length + " queued.", 3);
    }
};

Zotero.Net.prototype.checkDelay = function(e) {
    Z.debug("Zotero.Net.checkDelay");
    Z.debug(e);
    var t = this;
    var r = 0;
    if (J.isArray(e)) {
        for (var a = 0; a < e.length; a++) {
            iwait = t.checkDelay(e[a]);
            if (iwait > r) {
                r = iwait;
            }
        }
    } else {
        if (e.status == 429) {
            r = e.retryAfter;
        } else if (e.backoff) {
            r = e.backoff;
        }
    }
    return r;
};

Zotero.Net.prototype.ajaxRequest = function(e) {
    Z.debug("Zotero.Net.ajaxRequest", 3);
    var t = this;
    var r = {
        type: "GET",
        headers: {
            "Zotero-API-Version": Zotero.config.apiVersion,
            "Content-Type": "application/json"
        },
        success: function(e) {
            return e;
        },
        error: function(e) {
            Z.error("ajaxRequest rejected:" + e.jqxhr.statusCode() + " - " + e.jqxhr.responseText);
            return e;
        }
    };
    var a = J.extend({}, r.headers, e.headers);
    var o = J.extend({}, r, e);
    o.headers = a;
    if (typeof o.url == "object") {
        o.url = Zotero.ajax.apiRequestString(o.url);
    }
    o.url = Zotero.ajax.proxyWrapper(o.url, o.type);
    if (!o.url) {
        throw "No url specified in Zotero.Net.ajaxRequest";
    }
    o.zsuccess = o.success;
    o.zerror = o.error;
    delete o.success;
    delete o.error;
    ajaxpromise = new Promise(function(e, t) {
        J.ajax(o).then(function(t, r, a) {
            Z.debug("library.ajaxRequest jqxhr resolved. resolving Promise", 3);
            var o = new Zotero.ApiResponse({
                jqxhr: a,
                data: t,
                textStatus: r
            });
            e(o);
        }, function(e, r, a) {
            Z.debug("library.ajaxRequest jqxhr rejected. rejecting Promise", 3);
            var o = new Zotero.ApiResponse({
                jqxhr: e,
                textStatus: r,
                errorThrown: a,
                isError: true
            });
            t(o);
        });
    }).then(J.proxy(t.individualRequestDone, t)).then(function(e) {
        if (e.isError) {
            Z.error("re-throwing ApiResponse that was a rejection");
            throw e;
        }
        return e;
    }).then(o.zsuccess, o.zerror);
    return ajaxpromise;
};

Zotero.net = new Zotero.Net();

Zotero.Library = function(e, t, r, a) {
    Z.debug("Zotero.Library constructor", 3);
    Z.debug("Library Constructor: " + e + " " + t + " ", 3);
    var o = this;
    Z.debug(r, 4);
    o.instance = "Zotero.Library";
    o.libraryVersion = 0;
    o.syncState = {
        earliestVersion: null,
        latestVersion: null
    };
    o._apiKey = a || "";
    if (Zotero.config.librarySettings) {
        o.libraryBaseWebsiteUrl = Zotero.config.librarySettings.libraryPathString;
    } else {
        o.libraryBaseWebsiteUrl = Zotero.config.baseWebsiteUrl;
        if (e == "group") {
            o.libraryBaseWebsiteUrl += "groups/";
        }
        if (r) {
            this.libraryBaseWebsiteUrl += r + "/items";
        } else {
            Z.warn("no libraryUrlIdentifier specified");
        }
    }
    o.items = new Zotero.Items();
    o.items.owningLibrary = o;
    o.itemKeys = [];
    o.collections = new Zotero.Collections();
    o.collections.libraryUrlIdentifier = o.libraryUrlIdentifier;
    o.collections.owningLibrary = o;
    o.tags = new Zotero.Tags();
    o.searches = new Zotero.Searches();
    o.searches.owningLibrary = o;
    o.groups = new Zotero.Groups();
    o.groups.owningLibrary = o;
    o.deleted = new Zotero.Deleted();
    o.deleted.owningLibrary = o;
    if (!e) {
        Z.warn("No type specified for library");
        return;
    }
    o.type = e;
    o.libraryType = e;
    o.libraryID = t;
    o.libraryString = Zotero.utils.libraryString(o.libraryType, o.libraryID);
    o.libraryUrlIdentifier = r;
    o.preferences = new Zotero.Preferences(Zotero.store, o.libraryString);
    var i = navigator.userAgent.indexOf("Chrome") > -1;
    var n = navigator.userAgent.indexOf("MSIE") > -1;
    var s = navigator.userAgent.indexOf("Firefox") > -1;
    var l = navigator.userAgent.indexOf("Safari") > -1;
    var c = navigator.userAgent.toLowerCase().indexOf("op") > -1;
    if (i && l) {
        l = false;
    }
    if (i && c) {
        i = false;
    }
    if (l) {
        Zotero.config.useIndexedDB = false;
        Zotero.warn("Safari detected; disabling indexedDB");
    }
    if (Zotero.config.useIndexedDB === true) {
        Z.debug("Library Constructor: indexedDB init", 3);
        var d = new Zotero.Idb.Library(o.libraryString);
        d.owningLibrary = this;
        o.idbLibrary = d;
        d.init().then(function() {
            Z.debug("Library Constructor: idbInitD Done", 3);
            if (Zotero.config.preloadCachedLibrary === true) {
                Z.debug("Library Constructor: preloading cached library", 3);
                var e = o.loadIndexedDBCache();
                e.then(function() {
                    Z.debug("Library Constructor: Library.items.itemsVersion: " + o.items.itemsVersion, 3);
                    Z.debug("Library Constructor: Library.collections.collectionsVersion: " + o.collections.collectionsVersion, 3);
                    Z.debug("Library Constructor: Library.tags.tagsVersion: " + o.tags.tagsVersion, 3);
                    Z.debug("Library Constructor: Triggering cachedDataLoaded", 3);
                    o.trigger("cachedDataLoaded");
                }, function(e) {
                    Z.error("Error loading cached library");
                    Z.error(e);
                    throw new Error("Error loading cached library");
                });
            } else {
                o.trigger("cachedDataLoaded");
            }
        }, function() {
            Zotero.config.useIndexedDB = false;
            o.trigger("indexedDBError");
            o.trigger("cachedDataLoaded");
            Z.error("Error initializing indexedDB. Promise rejected.");
        });
    }
    o.dirty = false;
    o.tagsChanged = function() {};
    o.collectionsChanged = function() {};
    o.itemsChanged = function() {};
};

Zotero.Library.prototype.sortableColumns = [ "title", "creator", "itemType", "date", "year", "publisher", "publicationTitle", "journalAbbreviation", "language", "accessDate", "libraryCatalog", "callNumber", "rights", "dateAdded", "dateModified", "addedBy" ];

Zotero.Library.prototype.displayableColumns = [ "title", "creator", "itemType", "date", "year", "publisher", "publicationTitle", "journalAbbreviation", "language", "accessDate", "libraryCatalog", "callNumber", "rights", "dateAdded", "dateModified", "numChildren", "addedBy" ];

Zotero.Library.prototype.groupOnlyColumns = [ "addedBy" ];

Zotero.Library.prototype.comparer = function() {
    if (window.Intl) {
        return new window.Intl.Collator().compare;
    } else {
        return function(e, t) {
            if (e.toLocaleLowerCase() == t.toLocaleLowerCase()) {
                return 0;
            }
            if (e.toLocaleLowerCase() < t.toLocaleLowerCase()) {
                return -1;
            }
            return 1;
        };
    }
};

Zotero.Library.prototype.ajaxRequest = function(e, t, r) {
    Z.debug("Library.ajaxRequest", 3);
    if (!t) {
        t = "GET";
    }
    if (!r) {
        r = {};
    }
    var a = {
        url: e,
        type: t
    };
    a = J.extend({}, a, r);
    Z.debug(a, 3);
    return Zotero.net.queueRequest(a);
};

Zotero.Library.prototype.sequentialRequests = function(e) {
    Z.debug("Zotero.Library.sequentialRequests", 3);
    var t = this;
    return Zotero.net.queueRequest(e);
};

Zotero.Library.prototype.websiteUrl = function(e) {
    Z.debug("Zotero.library.websiteUrl", 3);
    Z.debug(e, 4);
    var t = this;
    var r = [];
    J.each(e, function(e, t) {
        if (t === "") return;
        r.push(e + "/" + t);
    });
    r.sort();
    Z.debug(r, 4);
    var a = r.join("/");
    return t.libraryBaseWebsiteUrl + "/" + a;
};

Zotero.Library.prototype.synchronize = function() {};

Zotero.Library.prototype.loadUpdatedItems = function() {
    Z.debug("Zotero.Library.loadUpdatedItems", 3);
    var e = this;
    var t = e.libraryVersion ? e.libraryVersion : e.items.itemsVersion;
    return Promise.resolve(e.updatedVersions("items", t)).then(function(t) {
        Z.debug("itemVersions resolved", 3);
        Z.debug("items Last-Modified-Version: " + t.lastModifiedVersion, 3);
        e.items.updateSyncState(t.lastModifiedVersion);
        var r = t.data;
        e.itemVersions = r;
        var a = [];
        J.each(r, function(t, r) {
            var o = e.items.getItem(t);
            if (!o || o.apiObj.key != r) {
                a.push(t);
            }
        });
        return e.loadItemsFromKeys(a);
    }).then(function(t) {
        Z.debug("loadItemsFromKeys resolved", 3);
        e.items.updateSyncedVersion();
        var r = Zotero.state.getUrlVars();
        e.buildItemDisplayView(r);
        if (Zotero.config.useIndexedDB) {
            var a = e.idbLibrary.updateItems(e.items.objectArray);
        }
    });
};

Zotero.Library.prototype.loadUpdatedCollections = function() {
    Z.debug("Zotero.Library.loadUpdatedCollections", 3);
    var e = this;
    Z.debug("library.collections.collectionsVersion:" + e.collections.collectionsVersion);
    var t = e.libraryVersion ? e.libraryVersion : e.collections.collectionsVersion;
    return e.updatedVersions("collections", t).then(function(t) {
        Z.debug("collectionVersions finished", 3);
        Z.debug("Collections Last-Modified-Version: " + t.lastModifiedVersion, 3);
        e.collections.updateSyncState(t.lastModifiedVersion);
        var r = t.data;
        e.collectionVersions = r;
        var a = [];
        J.each(r, function(t, r) {
            var o = e.collections.getCollection(t);
            if (!o || o.apiObj.version != r) {
                a.push(t);
            }
        });
        if (a.length === 0) {
            Z.debug("No collectionKeys need updating. resolving", 3);
            return t;
        } else {
            Z.debug("fetching collections by key", 3);
            return e.loadCollectionsFromKeys(a).then(function() {
                var t = e.collections;
                t.initSecondaryData();
                Z.debug("All updated collections loaded", 3);
                e.collections.updateSyncedVersion();
                var r = Zotero.state.getUrlVars();
                Z.debug("loadUpdatedCollections complete - saving collections to cache before resolving", 3);
                Z.debug("collectionsVersion: " + e.collections.collectionsVersion, 3);
                if (Zotero.config.useIndexedDB) {
                    return e.idbLibrary.updateCollections(t.collectionsArray);
                }
            });
        }
    }).then(function() {
        Z.debug("done getting collection data. requesting deleted data", 3);
        return e.getDeleted(e.libraryVersion);
    }).then(function(t) {
        Z.debug("got deleted collections data: removing local copies", 3);
        Z.debug(e.deleted);
        if (e.deleted.deletedData.collections && e.deleted.deletedData.collections.length > 0) {
            e.collections.removeLocalCollections(e.deleted.deletedData.collections);
        }
    });
};

Zotero.Library.prototype.loadUpdatedTags = function() {
    Z.debug("Zotero.Library.loadUpdatedTags", 3);
    var e = this;
    Z.debug("tagsVersion: " + e.tags.tagsVersion, 3);
    return Promise.resolve(e.loadAllTags({
        since: e.tags.tagsVersion
    })).then(function() {
        Z.debug("done getting tags, request deleted tags data", 3);
        return e.getDeleted(e.libraryVersion);
    }).then(function(t) {
        Z.debug("got deleted tags data");
        if (e.deleted.deletedData.tags && e.deleted.deletedData.tags.length > 0) {
            e.tags.removeTags(e.deleted.deletedData.tags);
        }
        if (Zotero.config.useIndexedDB) {
            Z.debug("saving updated tags to IDB", 3);
            var r = e.idbLibrary.updateTags(e.tags.tagsArray);
        }
    });
};

Zotero.Library.prototype.getDeleted = function(e) {
    Z.debug("Zotero.Library.getDeleted", 3);
    var t = this;
    var r = {
        target: "deleted",
        libraryType: t.libraryType,
        libraryID: t.libraryID,
        since: e
    };
    if (t.deleted.pending) {
        Z.debug("getDeleted resolving with previously pending promise");
        return Promise.resolve(t.deleted.pendingPromise);
    }
    Z.debug("version:" + e);
    Z.debug("sinceVersion:" + t.deleted.sinceVersion);
    Z.debug("untilVersion:" + t.deleted.untilVersion);
    if (t.deleted.untilVersion && e >= t.deleted.sinceVersion) {
        Z.debug("deletedVersion matches requested: immediately resolving");
        return Promise.resolve(t.deleted.deletedData);
    }
    t.deleted.pending = true;
    t.deleted.pendingPromise = t.ajaxRequest(r).then(function(r) {
        Z.debug("got deleted response");
        t.deleted.deletedData = r.data;
        Z.debug("Deleted Last-Modified-Version:" + r.lastModifiedVersion, 3);
        t.deleted.untilVersion = r.lastModifiedVersion;
        t.deleted.sinceVersion = e;
    }).then(function(e) {
        Z.debug("cleaning up deleted pending");
        t.deleted.pending = false;
        t.deleted.pendingPromise = false;
    });
    return t.deleted.pendingPromise;
};

Zotero.Library.prototype.processDeletions = function(e) {
    var t = this;
    t.collections.processDeletions(e.collections);
    t.items.processDeletions(e.items);
};

Zotero.Library.prototype.loadFullBib = function(e, t) {
    var r = this;
    var a = e.join(",");
    var o = {
        target: "items",
        libraryType: r.libraryType,
        libraryID: r.libraryID,
        itemKey: a,
        format: "bib",
        linkwrap: "1"
    };
    if (e.length == 1) {
        o.target = "item";
    }
    if (t) {
        o["style"] = t;
    }
    var i = r.ajaxRequest(o).then(function(e) {
        return e.data;
    });
    return i;
};

Zotero.Library.prototype.loadItemBib = function(e, t) {
    Z.debug("Zotero.Library.loadItemBib", 3);
    var r = this;
    var a = {
        target: "item",
        libraryType: r.libraryType,
        libraryID: r.libraryID,
        itemKey: e,
        content: "bib"
    };
    if (t) {
        a["style"] = t;
    }
    var o = Zotero.ajax.apiRequestString(a);
    var i = r.ajaxRequest(a).then(function(e) {
        var t = new Zotero.Item(e.data);
        var r = t.apiObj.bib;
        return r;
    });
    return i;
};

Zotero.Library.prototype.loadSettings = function() {
    Z.debug("Zotero.Library.loadSettings", 3);
    var e = this;
    var t = {
        target: "settings",
        libraryType: e.libraryType,
        libraryID: e.libraryID
    };
    return e.ajaxRequest(t).then(function(t) {
        var r;
        if (typeof t.data == "string") {
            r = JSON.parse(t.data);
        } else {
            r = t.data;
        }
        e.preferences.setPref("settings", r);
        if (r.tagColors) {
            var a = r.tagColors.value;
            e.preferences.setPref("tagColors", a);
        }
        e.trigger("settingsLoaded");
        return e.preferences;
    });
};

Zotero.Library.prototype.matchColoredTags = function(e) {
    var t = this;
    var r;
    var a = t.preferences.getPref("tagColors");
    if (!a) return [];
    var o = {};
    for (r = 0; r < a.length; r++) {
        o[a[r].name.toLowerCase()] = a[r].color;
    }
    var i = [];
    for (r = 0; r < e.length; r++) {
        if (o.hasOwnProperty(e[r])) {
            i.push(o[e[r]]);
        }
    }
    return i;
};

Zotero.Library.prototype.sendToLibrary = function(e, t) {
    var r = [];
    for (var a = 0; a < e.length; a++) {
        var o = e[a];
        var i = o.emptyJsonItem();
        i.data = J.extend({}, e[a].apiObj.data);
        i.data.key = "";
        i.data.version = 0;
        i.data.collections = [];
        delete i.data.dateModified;
        delete i.data.dateAdded;
        var n = new Zotero.Item(i);
        n.pristine = J.extend({}, n.apiObj);
        n.initSecondaryData();
        if (!n.apiObj.data.relations) {
            n.apiObj.data.relations = {};
        }
        n.apiObj.data.relations["owl:sameAs"] = Zotero.url.relationUrl(o.owningLibrary.libraryType, o.owningLibrary.libraryID, o.key);
        r.push(n);
    }
    return t.items.writeItems(r);
};

Zotero.Library.prototype.updatedVersions = function(e, t) {
    Z.debug("Library.updatedVersions", 3);
    var r = this;
    if (typeof e === "undefined") {
        e = "items";
    }
    if (typeof t === "undefined" || t === null) {
        t = r.libraryVersion;
    }
    var a = {
        target: e,
        format: "versions",
        libraryType: r.libraryType,
        libraryID: r.libraryID,
        since: t
    };
    return r.ajaxRequest(a);
};

Zotero.Library.prototype.loadItemsFromKeys = function(e) {
    Zotero.debug("Zotero.Library.loadItemsFromKeys", 3);
    var t = this;
    return t.loadFromKeys(e, "items");
};

Zotero.Library.prototype.loadCollectionsFromKeys = function(e) {
    Zotero.debug("Zotero.Library.loadCollectionsFromKeys", 3);
    var t = this;
    return t.loadFromKeys(e, "collections");
};

Zotero.Library.prototype.loadSeachesFromKeys = function(e) {
    Zotero.debug("Zotero.Library.loadSearchesFromKeys", 3);
    var t = this;
    return t.loadFromKeys(e, "searches");
};

Zotero.Library.prototype.loadFromKeys = function(e, t) {
    Zotero.debug("Zotero.Library.loadFromKeys", 3);
    if (!t) t = "items";
    var r = this;
    var a = [];
    while (e.length > 0) {
        a.push(e.splice(0, 50));
    }
    var o = [];
    J.each(a, function(e, a) {
        var i = a.join(",");
        switch (t) {
          case "items":
            o.push({
                url: {
                    target: "items",
                    targetModifier: null,
                    itemKey: i,
                    limit: 50,
                    libraryType: r.libraryType,
                    libraryID: r.libraryID
                },
                type: "GET",
                success: J.proxy(r.processLoadedItems, r)
            });
            break;

          case "collections":
            o.push({
                url: {
                    target: "collections",
                    targetModifier: null,
                    collectionKey: i,
                    limit: 50,
                    libraryType: r.libraryType,
                    libraryID: r.libraryID
                },
                type: "GET",
                success: J.proxy(r.processLoadedCollections, r)
            });
            break;

          case "searches":
            o.push({
                url: {
                    target: "searches",
                    targetModifier: null,
                    searchKey: i,
                    limit: 50,
                    libraryType: r.libraryType,
                    libraryID: r.libraryID
                },
                type: "GET"
            });
            break;
        }
    });
    var i = [];
    for (var n = 0; n < o.length; n++) {
        i.push(Zotero.net.queueRequest(o[n]));
    }
    return Promise.all(i);
};

Zotero.Library.prototype.buildItemDisplayView = function(e) {
    Z.debug("Zotero.Library.buildItemDisplayView", 3);
    Z.debug(e, 4);
    var t = this;
    if (!t.idbLibrary.db) {
        return Promise.resolve([]);
    }
    var r;
    var a = [];
    if (e.collectionKey) {
        if (e.collectionKey == "trash") {
            a.push(t.idbLibrary.filterItems("deleted", 1));
        } else {
            a.push(t.idbLibrary.filterItems("collectionKeys", e.collectionKey));
        }
    } else {
        a.push(t.idbLibrary.getOrderedItemKeys("title"));
    }
    var o = e.tag || [];
    if (typeof o == "string") o = [ o ];
    for (var i = 0; i < o.length; i++) {
        Z.debug("adding selected tag filter", 3);
        a.push(t.idbLibrary.filterItems("itemTagStrings", o[i]));
    }
    return Promise.all(a).then(function(r) {
        var a;
        for (a = 0; a < r.length; a++) {
            Z.debug("result from filterPromise: " + r[a].length, 3);
            Z.debug(r[a], 3);
        }
        var o = t.idbLibrary.intersectAll(r);
        itemsArray = t.items.getItems(o);
        Z.debug("All filters applied - Down to " + itemsArray.length + " items displayed", 3);
        Z.debug("remove child items and, if not viewing trash, deleted items", 3);
        var i = [];
        for (a = 0; a < itemsArray.length; a++) {
            if (itemsArray[a].apiObj.data.parentItem) {
                continue;
            }
            if (e.collectionKey != "trash" && itemsArray[a].apiObj.deleted) {
                continue;
            }
            i.push(itemsArray[a]);
        }
        var n = e["order"] || "title";
        var s = e["sort"] || "asc";
        Z.debug("Sorting by " + n + " - " + s, 3);
        var l = Zotero.Library.prototype.comparer();
        i.sort(function(e, t) {
            var r = e.get(n);
            var a = t.get(n);
            return l(r, a);
        });
        if (s == "desc") {
            Z.debug("sort is desc - reversing array", 4);
            i.reverse();
        }
        Z.debug("triggering publishing displayedItemsUpdated", 3);
        t.trigger("displayedItemsUpdated");
        return i;
    });
};

Zotero.Library.prototype.trigger = function(e, t) {
    var r = this;
    Zotero.trigger(e, t, r.libraryString);
};

Zotero.Library.prototype.listen = function(e, t, r) {
    var a = this;
    var o = a.libraryString;
    Zotero.listen(e, t, r, o);
};

Zotero.Container = function() {};

Zotero.Container.prototype.initSecondaryData = function() {};

Zotero.Container.prototype.addObject = function(e) {
    Zotero.debug("Zotero.Container.addObject", 4);
    var t = this;
    t.objectArray.push(e);
    t.objectMap[e.key] = e;
    if (t.owningLibrary) {
        e.associateWithLibrary(t.owningLibrary);
    }
    return t;
};

Zotero.Container.prototype.fieldComparer = function(e) {
    if (window.Intl) {
        var t = new window.Intl.Collator();
        return function(r, a) {
            return t.compare(r.apiObj.data[e], a.apiObj.data[e]);
        };
    } else {
        return function(t, r) {
            if (t.apiObj.data[e].toLowerCase() == r.apiObj.data[e].toLowerCase()) {
                return 0;
            }
            if (t.apiObj.data[e].toLowerCase() < r.apiObj.data[e].toLowerCase()) {
                return -1;
            }
            return 1;
        };
    }
};

Zotero.Container.prototype.getObject = function(e) {
    var t = this;
    if (t.objectMap.hasOwnProperty(e)) {
        return t.objectMap[e];
    } else {
        return false;
    }
};

Zotero.Container.prototype.getObjects = function(e) {
    var t = this;
    var r = [];
    var a;
    for (var o = 0; o < e.length; o++) {
        a = t.getObject(e[o]);
        if (a) {
            r.push(a);
        }
    }
    return r;
};

Zotero.Container.prototype.removeObject = function(e) {
    if (container.objectMap.hasOwnProperty(e)) {
        delete container.objectmap[e];
        container.initSecondaryData();
    }
};

Zotero.Container.prototype.removeObjects = function(e) {
    var t = this;
    for (var r = 0; r < e.length; r++) {
        delete t.objectMap[e[r]];
    }
    t.initSecondaryData();
};

Zotero.Container.prototype.writeObjects = function(e) {};

Zotero.Container.prototype.assignKeys = function(e) {
    var t;
    for (i = 0; i < e.length; i++) {
        t = e[i];
        var r = t.get("key");
        if (!r) {
            var a = Zotero.utils.getKey();
            t.set("key", a);
            t.set("version", 0);
        }
    }
    return e;
};

Zotero.Container.prototype.chunkObjectsArray = function(e) {
    var t = 50;
    var r = [];
    for (i = 0; i < e.length; i = i + t) {
        r.push(e.slice(i, i + t));
    }
    return r;
};

Zotero.Container.prototype.rawChunks = function(e) {
    var t = [];
    for (i = 0; i < e.length; i++) {
        t[i] = [];
        for (var r = 0; r < e[i].length; r++) {
            t[i].push(e[i][r].writeApiObj());
        }
    }
    return t;
};

Zotero.Container.prototype.updateSyncState = function(e) {
    var t = this;
    Z.debug("updateSyncState: " + e, 3);
    if (!t.hasOwnProperty("syncState")) {
        Z.debug("no syncState property");
        throw new Error("Attempt to update sync state of object with no syncState property");
    }
    if (t.syncState.earliestVersion === null) {
        t.syncState.earliestVersion = e;
    }
    if (t.syncState.latestVersion === null) {
        t.syncState.latestVersion = e;
    }
    if (e < t.syncState.earliestVersion) {
        t.syncState.earliestVersion = e;
    }
    if (e > t.syncState.latestVersion) {
        t.syncState.latestVersion = e;
    }
    Z.debug("done updating sync state", 3);
};

Zotero.Container.prototype.updateSyncedVersion = function(e) {
    var t = this;
    if (t.syncState.earliestVersion !== null && t.syncState.earliestVersion == t.syncState.latestVersion) {
        t.version = t.syncState.latestVersion;
        t.synced = true;
    } else if (t.syncState.earliestVersion !== null) {
        t.version = t.syncState.earliestVersion;
    }
};

Zotero.Container.prototype.processDeletions = function(e) {
    var t = this;
    for (var r = 0; r < e.length; r++) {
        var a = t.get(e[r]);
        if (a !== false) {
            if (a.synced === true) {
                t.removeObjects([ e[r] ]);
            } else {}
        }
    }
};

Zotero.Container.prototype.updateObjectsFromWriteResponse = function(e, t) {
    Z.debug("Zotero.Container.updateObjectsFromWriteResponse", 3);
    Z.debug("statusCode: " + t.status, 3);
    var r = t.data;
    if (t.status == 200) {
        Z.debug("newLastModifiedVersion: " + t.lastModifiedVersion, 3);
        if (r.hasOwnProperty("success")) {
            J.each(r.success, function(r, a) {
                var o = parseInt(r, 10);
                var i = e[o];
                if (i.key !== "" && i.key !== a) {
                    throw new Error("object key mismatch in multi-write response");
                }
                if (i.key === "") {
                    i.updateObjectKey(a);
                }
                i.set("version", t.lastModifiedVersion);
                i.synced = true;
                i.writeFailure = false;
            });
        }
        if (r.hasOwnProperty("failed")) {
            Z.debug("updating objects with failed writes", 3);
            J.each(r.failed, function(t, r) {
                Z.error("failed write " + t + " - " + r);
                var a = parseInt(t, 10);
                var o = e[a];
                o.writeFailure = r;
            });
        }
    } else if (responsexhr.status == 204) {
        e[0].synced = true;
    }
};

Zotero.Container.prototype.extractKey = function(e) {
    if (typeof e == "string") {
        return e;
    }
    return e.get("key");
};

Zotero.Collections = function(e) {
    var t = this;
    this.instance = "Zotero.Collections";
    this.version = 0;
    this.syncState = {
        earliestVersion: null,
        latestVersion: null
    };
    this.collectionObjects = {};
    this.collectionsArray = [];
    this.objectMap = this.collectionObjects;
    this.objectArray = this.collectionsArray;
    this.dirty = false;
    this.loaded = false;
    if (e) {
        this.addCollectionsFromJson(e);
        this.initSecondaryData();
    }
};

Zotero.Collections.prototype = new Zotero.Container();

Zotero.Collections.prototype.initSecondaryData = function() {
    Z.debug("Zotero.Collections.initSecondaryData", 3);
    var e = this;
    e.collectionsArray = [];
    J.each(e.collectionObjects, function(t, r) {
        e.collectionsArray.push(r);
    });
    e.collectionsArray.sort(Zotero.ApiObject.prototype.fieldComparer("name"));
    e.nestCollections();
    e.assignDepths(0, e.collectionsArray);
};

Zotero.Collections.prototype.addCollection = function(e) {
    this.addObject(e);
    return this;
};

Zotero.Collections.prototype.addCollectionsFromJson = function(e) {
    Z.debug("addCollectionsFromJson");
    Z.debug(e);
    var t = this;
    var r = [];
    J.each(e, function(e, a) {
        var o = new Zotero.Collection(a);
        t.addObject(o);
        r.push(o);
    });
    return r;
};

Zotero.Collections.prototype.assignDepths = function(e, t) {
    Z.debug("Zotero.Collections.assignDepths", 3);
    var r = this;
    var a = function(e, t) {
        J.each(t, function(t, r) {
            r.nestingDepth = e;
            if (r.hasChildren) {
                a(e + 1, r.children);
            }
        });
    };
    J.each(r.collectionsArray, function(e, t) {
        if (t.topLevel) {
            t.nestingDepth = 1;
            if (t.hasChildren) {
                a(2, t.children);
            }
        }
    });
};

Zotero.Collections.prototype.nestedOrderingArray = function() {
    Z.debug("Zotero.Collections.nestedOrderingArray", 3);
    var e = this;
    var t = [];
    var r = function(e, t) {
        J.each(t, function(t, a) {
            e.push(a);
            if (a.hasChildren) {
                r(e, a.children);
            }
        });
    };
    J.each(e.collectionsArray, function(e, a) {
        if (a.topLevel) {
            t.push(a);
            if (a.hasChildren) {
                r(t, a.children);
            }
        }
    });
    Z.debug("Done with nestedOrderingArray", 3);
    return t;
};

Zotero.Collections.prototype.getCollection = function(e) {
    return this.getObject(e);
};

Zotero.Collections.prototype.remoteDeleteCollection = function(e) {
    var t = this;
    return t.removeLocalCollection(e);
};

Zotero.Collections.prototype.removeLocalCollection = function(e) {
    var t = this;
    return t.removeLocalCollections([ e ]);
};

Zotero.Collections.prototype.removeLocalCollections = function(e) {
    var t = this;
    for (var r = 0; r < e.length; r++) {
        delete t.collectionObjects[e[r]];
    }
    t.initSecondaryData();
};

Zotero.Collections.prototype.nestCollections = function() {
    var e = this;
    J.each(e.collectionsArray, function(e, t) {
        t.children = [];
    });
    e.collectionsArray.sort(Zotero.ApiObject.prototype.fieldComparer("name"));
    J.each(e.collectionsArray, function(t, r) {
        r.nestCollection(e.collectionObjects);
    });
};

Zotero.Collections.prototype.writeCollections = function(e) {
    Z.debug("Zotero.Collections.writeCollections", 3);
    var t = this;
    var r = t.owningLibrary;
    var a = [];
    var o;
    var i = {
        target: "collections",
        libraryType: t.owningLibrary.libraryType,
        libraryID: t.owningLibrary.libraryID
    };
    var n = Zotero.ajax.apiRequestString(i);
    for (o = 0; o < e.length; o++) {
        var s = e[o];
        var l = s.get("key");
        if (l === "" || l === null) {
            var c = Zotero.utils.getKey();
            s.set("key", c);
            s.set("version", 0);
        }
    }
    var d = t.chunkObjectsArray(e);
    var u = t.rawChunks(d);
    var p = function(e) {
        Z.debug("writeCollections successCallback", 3);
        var t = this.library;
        var r = this.writeChunk;
        t.collections.updateObjectsFromWriteResponse(this.writeChunk, e);
        for (var a = 0; a < r.length; a++) {
            var o = r[a];
            if (o.synced && !o.writeFailure) {
                t.collections.addCollection(o);
                if (Zotero.config.useIndexedDB) {
                    Z.debug("updating indexedDB collections");
                    t.idbLibrary.updateCollections(r);
                }
            }
        }
        e.returnCollections = r;
        return e;
    };
    Z.debug("collections.version: " + t.version, 3);
    Z.debug("collections.libraryVersion: " + t.libraryVersion, 3);
    var g = [];
    for (o = 0; o < d.length; o++) {
        var m = {
            writeChunk: d[o],
            library: r
        };
        requestData = JSON.stringify(u[o]);
        g.push({
            url: n,
            type: "POST",
            data: requestData,
            processData: false,
            headers: {},
            success: J.proxy(p, m)
        });
    }
    return r.sequentialRequests(g).then(function(e) {
        Z.debug("Done with writeCollections sequentialRequests promise", 3);
        t.initSecondaryData();
        J.each(e, function(e, t) {
            if (t.isError || t.data.hasOwnProperty("failed") && Object.keys(t.data.failed).length > 0) {
                throw new Error("failure when writing collections");
            }
        });
        return e;
    }).catch(function(e) {
        Z.error(e);
        throw e;
    });
};

Zotero.Items = function(e) {
    this.instance = "Zotero.Items";
    this.itemsVersion = 0;
    this.syncState = {
        earliestVersion: null,
        latestVersion: null
    };
    this.itemObjects = {};
    this.objectMap = this.itemObjects;
    this.objectArray = [];
    this.unsyncedItemKeys = [];
    this.newUnsyncedItems = [];
    if (e) {
        this.addItemsFromJson(e);
    }
};

Zotero.Items.prototype = new Zotero.Container();

Zotero.Items.prototype.getItem = function(e) {
    return this.getObject(e);
};

Zotero.Items.prototype.getItems = function(e) {
    return this.getObjects(e);
};

Zotero.Items.prototype.addItem = function(e) {
    this.addObject(e);
    return this;
};

Zotero.Items.prototype.addItemsFromJson = function(e) {
    Z.debug("addItemsFromJson", 3);
    var t = this;
    var r = e;
    var a = [];
    J.each(r, function(e, r) {
        var o = new Zotero.Item(r);
        t.addItem(o);
        a.push(o);
    });
    return a;
};

Zotero.Items.prototype.removeLocalItem = function(e) {
    return this.removeObject(e);
};

Zotero.Items.prototype.removeLocalItems = function(e) {
    return this.removeObjects(e);
};

Zotero.Items.prototype.deleteItem = function(e) {
    Z.debug("Zotero.Items.deleteItem", 3);
    var t = this;
    var r;
    if (!e) return false;
    e = t.extractKey(e);
    r = t.getItem(e);
    var a = {
        target: "item",
        libraryType: t.owningLibrary.libraryType,
        libraryID: t.owningLibrary.libraryID,
        itemKey: r.key
    };
    var o = {
        url: Zotero.ajax.apiRequestString(config),
        type: "DELETE",
        headers: {
            "If-Unmodified-Since-Version": r.get("version")
        }
    };
    return Zotero.net.ajaxRequest(o);
};

Zotero.Items.prototype.deleteItems = function(e, t) {
    Z.debug("Zotero.Items.deleteItems", 3);
    var r = this;
    var a = [];
    var o;
    if (!t && r.itemsVersion !== 0) {
        t = r.itemsVersion;
    }
    var i;
    for (o = 0; o < e.length; o++) {
        if (!e[o]) continue;
        i = r.extractKey(e[o]);
        if (i) {
            a.push(i);
        }
    }
    var n = r.chunkObjectsArray(a);
    var s = [];
    for (o = 0; o < n.length; o++) {
        var l = n[o].join(",");
        var c = {
            target: "items",
            libraryType: r.owningLibrary.libraryType,
            libraryID: r.owningLibrary.libraryID,
            itemKey: l
        };
        var d = {
            url: c,
            type: "DELETE"
        };
        s.push(d);
    }
    return Zotero.net.queueRequest(s);
};

Zotero.Items.prototype.trashItems = function(e) {
    var t = this;
    var r;
    for (r = 0; r < e.length; r++) {
        var a = e[r];
        a.set("deleted", 1);
    }
    return t.writeItems(e);
};

Zotero.Items.prototype.untrashItems = function(e) {
    var t = this;
    var r;
    for (r = 0; r < e.length; r++) {
        var a = e[r];
        a.set("deleted", 0);
    }
    return t.writeItems(e);
};

Zotero.Items.prototype.findItems = function(e) {
    var t = this;
    var r = [];
    J.each(t.itemObjects, function(a, o) {
        if (e.collectionKey && J.inArray(e.collectionKey, o.apiObj.collections === -1)) {
            return;
        }
        r.push(t.itemObjects[a]);
    });
    return r;
};

Zotero.Items.prototype.atomizeItems = function(e) {
    var t = [];
    var r;
    for (var a = 0; a < e.length; a++) {
        r = e[a];
        var o = r.get("key");
        if (o === "" || o === null) {
            var i = Zotero.utils.getKey();
            r.set("key", i);
            r.set("version", 0);
        }
        t.push(r);
        if (r.hasOwnProperty("notes") && r.notes.length > 0) {
            for (var n = 0; n < r.notes.length; n++) {
                r.notes[n].set("parentItem", r.get("key"));
            }
            t = t.concat(r.notes);
        }
        if (r.hasOwnProperty("attachments") && r.attachments.length > 0) {
            for (var s = 0; s < r.attachments.length; s++) {
                r.attachments[s].set("parentItem", r.get("key"));
            }
            t = t.concat(r.attachments);
        }
    }
    return t;
};

Zotero.Items.prototype.writeItems = function(e) {
    var t = this;
    var r = t.owningLibrary;
    var a;
    var o = t.atomizeItems(e);
    var i = {
        target: "items",
        libraryType: t.owningLibrary.libraryType,
        libraryID: t.owningLibrary.libraryID
    };
    var n = Zotero.ajax.apiRequestString(i);
    var s = t.chunkObjectsArray(o);
    var l = t.rawChunks(s);
    var c = function(e) {
        Z.debug("writeItem successCallback", 3);
        t.updateObjectsFromWriteResponse(this.writeChunk, e);
        if (Zotero.config.useIndexedDB) {
            this.library.idbLibrary.updateItems(this.writeChunk);
        }
        Zotero.trigger("itemsChanged", {
            library: this.library
        });
        e.returnItems = this.writeChunk;
        return e;
    };
    Z.debug("items.itemsVersion: " + t.itemsVersion, 3);
    Z.debug("items.libraryVersion: " + t.libraryVersion, 3);
    var d = [];
    for (a = 0; a < s.length; a++) {
        var u = {
            writeChunk: s[a],
            library: r
        };
        requestData = JSON.stringify(l[a]);
        d.push({
            url: n,
            type: "POST",
            data: requestData,
            processData: false,
            success: J.proxy(c, u)
        });
    }
    return r.sequentialRequests(d).then(function(e) {
        Z.debug("Done with writeItems sequentialRequests promise", 3);
        return e;
    });
};

Zotero.Tags = function(e) {
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
    if (e) {
        this.addTagsFromJson(e);
    }
};

Zotero.Tags.prototype = new Zotero.Container();

Zotero.Tags.prototype.addTag = function(e) {
    var t = this;
    t.tagObjects[e.apiObj.tag] = e;
    t.tagsArray.push(e);
    if (t.owningLibrary) {
        e.associateWithLibrary(t.owningLibrary);
    }
};

Zotero.Tags.prototype.getTag = function(e) {
    var t = this;
    if (t.tagObjects.hasOwnProperty(e)) {
        return this.tagObjects[e];
    }
    return null;
};

Zotero.Tags.prototype.removeTag = function(e) {
    var t = this;
    delete t.tagObjects[e];
    t.updateSecondaryData();
};

Zotero.Tags.prototype.removeTags = function(e) {
    var t = this;
    J.each(e, function(e, r) {
        delete t.tagObjects[r];
    });
    t.updateSecondaryData();
};

Zotero.Tags.prototype.plainTagsList = function(e) {
    Z.debug("Zotero.Tags.plainTagsList", 3);
    var t = [];
    J.each(e, function(e, r) {
        t.push(r.apiObj.tag);
    });
    return t;
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
    var e = this;
    e.tagsArray = [];
    J.each(e.tagObjects, function(t, r) {
        e.tagsArray.push(r);
    });
    e.tagsArray.sort(Zotero.Tag.prototype.tagComparer());
    var t = e.plainTagsList(e.tagsArray);
    t.sort(Zotero.Library.prototype.comparer());
    e.plainList = t;
};

Zotero.Tags.prototype.updateTagsVersion = function(e) {
    var t = this;
    J.each(t.tagObjects, function(t, r) {
        r.set("version", e);
    });
};

Zotero.Tags.prototype.rebuildTagsArray = function() {
    var e = this;
    e.tagsArray = [];
    J.each(e.tagObjects, function(t, r) {
        e.tagsArray.push(r);
    });
};

Zotero.Tags.prototype.addTagsFromJson = function(e) {
    Z.debug("Zotero.Tags.addTagsFromJson", 3);
    var t = this;
    var r = [];
    J.each(e, function(e, a) {
        var o = new Zotero.Tag(a);
        t.addTag(o);
        r.push(o);
    });
    return r;
};

Zotero.Groups = function(e) {
    this.instance = "Zotero.Groups";
    this.groupsArray = [];
};

Zotero.Groups.prototype.fetchGroup = function(e, t) {};

Zotero.Groups.prototype.addGroupsFromJson = function(e) {
    var t = this;
    var r = [];
    J.each(e, function(e, a) {
        Z.debug(a);
        var o = new Zotero.Group(a);
        t.groupsArray.push(o);
        r.push(o);
    });
    return r;
};

Zotero.Groups.prototype.fetchUserGroups = function(e, t) {
    var r = this;
    var a = {
        target: "userGroups",
        libraryType: "user",
        libraryID: e,
        order: "title"
    };
    if (t) {
        a["key"] = t;
    } else if (r.owningLibrary) {
        a["key"] = r.owningLibrary._apiKey;
    }
    return Zotero.ajaxRequest(a).then(function(e) {
        Z.debug("fetchUserGroups proxied callback", 3);
        fetchedGroups = r.addGroupsFromJson(e.data);
        e.fetchedGroups = fetchedGroups;
        return e;
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

Zotero.Deleted = function(e) {
    this.instance = "Zotero.Deleted";
    if (typeof e === "string") {
        this.deletedData = JSON.parse(e);
    } else {
        this.deletedData = e;
    }
    this.untilVersion = null;
    this.sinceVersion = null;
    this.waitingPromises = [];
    this.pending = false;
};

Zotero.Deleted.prototype.addWaiter = function() {};

Zotero.Collection = function(e) {
    this.instance = "Zotero.Collection";
    this.libraryUrlIdentifier = "";
    this.itemKeys = false;
    this.key = "";
    this.version = 0;
    this.synced = false;
    this.pristineData = null;
    this.apiObj = {
        key: "",
        version: 0,
        library: {},
        links: {},
        meta: {},
        data: {
            key: "",
            version: 0,
            name: "",
            parentCollection: false,
            relations: {}
        }
    };
    this.children = [];
    this.topLevel = true;
    if (e) {
        this.parseJsonCollection(e);
    }
};

Zotero.Collection.prototype = new Zotero.ApiObject();

Zotero.Collection.prototype.instance = "Zotero.Collection";

Zotero.Collection.prototype.updateObjectKey = function(e) {
    this.updateCollectionKey(e);
};

Zotero.Collection.prototype.updateCollectionKey = function(e) {
    var t = this;
    t.key = e;
    t.apiObj.key = e;
    t.apiObj.data.key = e;
    return t;
};

Zotero.Collection.prototype.parseJsonCollection = function(e) {
    Z.debug("parseJsonCollection", 4);
    var t = this;
    t.key = e.key;
    t.version = e.version;
    t.apiObj = J.extend({}, e);
    t.pristineData = J.extend({}, e.data);
    t.parentCollection = false;
    t.topLevel = true;
    t.synced = true;
    t.initSecondaryData();
};

Zotero.Collection.prototype.initSecondaryData = function() {
    var e = this;
    if (e.apiObj.data["parentCollection"]) {
        e.topLevel = false;
    } else {
        e.topLevel = true;
    }
    if (Zotero.config.librarySettings.libraryPathString) {
        e.websiteCollectionLink = Zotero.config.librarySettings.libraryPathString + "/collectionKey/" + e.apiObj.key;
    } else {
        e.websiteCollectionLink = "";
    }
    e.hasChildren = e.apiObj.meta.numCollections ? true : false;
};

Zotero.Collection.prototype.nestCollection = function(e) {
    Z.debug("Zotero.Collection.nestCollection", 4);
    var t = this;
    var r = t.get("parentCollection");
    if (r !== false) {
        if (e.hasOwnProperty(r)) {
            var a = e[r];
            a.children.push(t);
            a.hasChildren = true;
            t.topLevel = false;
            return true;
        }
    }
    return false;
};

Zotero.Collection.prototype.addItems = function(e) {
    Z.debug("Zotero.Collection.addItems", 3);
    var t = this;
    var r = {
        target: "items",
        libraryType: t.apiObj.library.type,
        libraryID: t.apiObj.library.id,
        collectionKey: t.key
    };
    var a = Zotero.ajax.apiRequestUrl(r) + Zotero.ajax.apiQueryString(r);
    var o = e.join(" ");
    return Zotero.ajaxRequest(a, "POST", {
        data: o,
        processData: false
    });
};

Zotero.Collection.prototype.getMemberItemKeys = function() {
    Z.debug("Zotero.Collection.getMemberItemKeys", 3);
    var e = this;
    var t = {
        target: "items",
        libraryType: e.apiObj.library.type,
        libraryID: e.apiObj.library.id,
        collectionKey: e.key,
        format: "keys"
    };
    return Zotero.ajaxRequest(t, "GET", {
        processData: false
    }).then(function(t) {
        Z.debug("getMemberItemKeys proxied callback", 3);
        var r = t.data;
        var a = J.trim(r).split(/[\s]+/);
        e.itemKeys = a;
        return a;
    });
};

Zotero.Collection.prototype.removeItem = function(e) {
    var t = this;
    var r = {
        target: "item",
        libraryType: t.apiObj.library.type,
        libraryID: t.apiObj.library.id,
        collectionKey: t.key,
        itemKey: e
    };
    return Zotero.ajaxRequest(r, "DELETE", {
        processData: false,
        cache: false
    });
};

Zotero.Collection.prototype.update = function(e, t) {
    var r = this;
    if (!t) t = false;
    var a = {
        target: "collection",
        libraryType: r.apiObj.library.type,
        libraryID: r.apiObj.library.id,
        collectionKey: r.key
    };
    r.set("name", e);
    r.set("parentCollection", t);
    var o = r.writeApiObj();
    var i = JSON.stringify(o);
    return Zotero.ajaxRequest(a, "PUT", {
        data: i,
        processData: false,
        headers: {
            "If-Unmodified-Since-Version": r.version
        },
        cache: false
    });
};

Zotero.Collection.prototype.writeApiObj = function() {
    var e = this;
    var t = J.extend({}, e.pristineData, e.apiObj.data);
    return t;
};

Zotero.Collection.prototype.remove = function() {
    Z.debug("Zotero.Collection.delete", 3);
    var e = this;
    var t = e.owningLibrary;
    var r = {
        target: "collection",
        libraryType: e.apiObj.library.type,
        libraryID: e.apiObj.library.id,
        collectionKey: e.key
    };
    return Zotero.ajaxRequest(r, "DELETE", {
        processData: false,
        headers: {
            "If-Unmodified-Since-Version": e.version
        },
        cache: false
    }).then(function() {
        Z.debug("done deleting collection. remove local copy.", 3);
        t.collections.removeLocalCollection(e.key);
        t.trigger("libraryCollectionsUpdated");
    });
};

Zotero.Collection.prototype.get = function(e) {
    var t = this;
    switch (e) {
      case "title":
      case "name":
        return t.apiObj.data.name;

      case "collectionKey":
      case "key":
        return t.apiObj.key || t.key;

      case "collectionVersion":
      case "version":
        return t.apiObj.version;

      case "parentCollection":
        return t.apiObj.data.parentCollection;
    }
    if (e in t.apiObj.data) {
        return t.apiObj.data[e];
    } else if (t.apiObj.meta.hasOwnProperty(e)) {
        return t.apiObj.meta[e];
    } else if (t.hasOwnProperty(e)) {
        return t[e];
    }
    return null;
};

Zotero.Collection.prototype.set = function(e, t) {
    var r = this;
    if (e in r.apiObj.data) {
        r.apiObj.data[e] = t;
    }
    switch (e) {
      case "title":
      case "name":
        r.apiObj.data["name"] = t;
        break;

      case "collectionKey":
      case "key":
        r.key = t;
        r.apiObj.key = t;
        r.apiObj.data.key = t;
        break;

      case "parentCollection":
        r.apiObj.data["parentCollection"] = t;
        break;

      case "collectionVersion":
      case "version":
        r.version = t;
        r.apiObj.version = t;
        r.apiObj.data.version = t;
        break;
    }
    if (r.hasOwnProperty(e)) {
        r[e] = t;
    }
};

Zotero.Item = function(e) {
    this.instance = "Zotero.Item";
    this.version = 0;
    this.key = "";
    this.synced = false;
    this.apiObj = {};
    this.pristineData = null;
    this.childItemKeys = [];
    this.writeErrors = [];
    this.notes = [];
    if (e) {
        this.parseJsonItem(e);
    } else {
        this.parseJsonItem(this.emptyJsonItem());
    }
    this.initSecondaryData();
};

Zotero.Item.prototype = new Zotero.ApiObject();

Zotero.Item.prototype.parseJsonItem = function(e) {
    var t = this;
    t.version = e.version;
    t.key = e.key;
    t.apiObj = J.extend({}, e);
    t.pristineData = J.extend({}, e.data);
    if (!t.apiObj._supplement) {
        t.apiObj._supplement = {};
    }
};

Zotero.Item.prototype.emptyJsonItem = function() {
    return {
        key: "",
        version: 0,
        library: {},
        links: {},
        data: {
            key: "",
            version: 0,
            title: "",
            creators: [],
            collections: [],
            tags: [],
            relations: {}
        },
        meta: {},
        _supplement: {}
    };
};

Zotero.Item.prototype.initSecondaryData = function() {
    var e = this;
    e.version = e.apiObj.version;
    if (e.apiObj.data.itemType == "attachment") {
        e.mimeType = e.apiObj.data.contentType;
        e.translatedMimeType = Zotero.utils.translateMimeType(e.mimeType);
    }
    if ("linkMode" in e.apiObj) {
        e.linkMode = e.apiObj.data.linkMode;
    }
    e.attachmentDownloadUrl = Zotero.url.attachmentDownloadUrl(e);
    if (e.apiObj.meta.parsedDate) {
        e.parsedDate = new Date(e.apiObj.meta.parsedDate);
    } else {
        e.parsedDate = false;
    }
    e.synced = false;
    e.updateTagStrings();
};

Zotero.Item.prototype.updateTagStrings = function() {
    var e = this;
    var t = [];
    for (i = 0; i < e.apiObj.data.tags.length; i++) {
        t.push(e.apiObj.data.tags[i].tag);
    }
    e.apiObj._supplement.tagstrings = t;
};

Zotero.Item.prototype.initEmpty = function(e, t) {
    var r = this;
    return r.getItemTemplate(e, t).then(function(e) {
        r.initEmptyFromTemplate(e);
        return r;
    });
};

Zotero.Item.prototype.initEmptyNote = function() {
    var e = this;
    e.version = 0;
    var t = {
        itemType: "note",
        note: "",
        tags: [],
        collections: [],
        relations: {}
    };
    e.initEmptyFromTemplate(t);
    return e;
};

Zotero.Item.prototype.initEmptyFromTemplate = function(e) {
    var t = this;
    t.version = 0;
    t.key = "";
    t.pristineData = J.extend({}, e);
    t.apiObj = {
        key: "",
        version: 0,
        library: {},
        links: {},
        data: e,
        meta: {},
        _supplement: {}
    };
    t.initSecondaryData();
    return t;
};

Zotero.Item.prototype.isSupplementaryItem = function() {
    var e = this;
    var t = e.get("itemType");
    if (t == "attachment" || t == "note") {
        return true;
    }
    return false;
};

Zotero.Item.prototype.isSnapshot = function() {
    var e = this;
    if (e.apiObj.links["enclosure"]) {
        var t = e.apiObj.links["enclosure"].type;
        if (!e.apiObj.links["enclosure"]["length"] && t == "text/html") {
            return true;
        }
    }
    return false;
};

Zotero.Item.prototype.updateObjectKey = function(e) {
    return this.updateItemKey(e);
};

Zotero.Item.prototype.updateItemKey = function(e) {
    var t = this;
    t.key = e;
    t.apiObj.key = e;
    t.apiObj.data.key = e;
    t.pristineData.key = e;
    return t;
};

Zotero.Item.prototype.writeItem = function() {
    var e = this;
    if (!e.owningLibrary) {
        throw new Error("Item must be associated with a library");
    }
    return e.owningLibrary.items.writeItems([ e ]);
};

Zotero.Item.prototype.writeApiObj = function() {
    var e = this;
    if (e.apiObj.data.creators) {
        var t = e.apiObj.data.creators.filter(function(e) {
            if (e.name || e.firstName || e.lastName) {
                return true;
            }
            return false;
        });
        e.apiObj.data.creators = t;
    }
    var r = J.extend({}, e.pristineData, e.apiObj.data);
    return r;
};

Zotero.Item.prototype.createChildNotes = function(e) {
    var t = this;
    var r = [];
    var a = [];
    var o = J.proxy(function(e) {
        r.push(e);
    }, this);
    J.each(e, function(e, o) {
        var i = new Zotero.Item();
        var n = i.initEmpty("note").then(function(e) {
            e.set("note", o.note);
            e.set("parentItem", t.key);
            r.push(e);
        });
        a.push(n);
    });
    return Promise.all(a).then(function() {
        return t.owningLibrary.writeItems(r);
    });
};

Zotero.Item.prototype.writePatch = function() {};

Zotero.Item.prototype.getChildren = function(e) {
    Z.debug("Zotero.Item.getChildren");
    var t = this;
    return Promise.resolve().then(function() {
        if (!t.apiObj.meta.numChildren) {
            return [];
        }
        var r = {
            url: {
                target: "children",
                libraryType: t.apiObj.library.type,
                libraryID: t.apiObj.library.id,
                itemKey: t.key
            }
        };
        return Zotero.net.queueRequest(r).then(function(t) {
            Z.debug("getChildren proxied callback", 4);
            var r = e.items;
            var a = r.addItemsFromJson(t.data);
            for (var o = a.length - 1; o >= 0; o--) {
                a[o].associateWithLibrary(e);
            }
            return a;
        });
    });
};

Zotero.Item.prototype.getItemTypes = function(e) {
    Z.debug("Zotero.Item.prototype.getItemTypes", 3);
    if (!e) {
        e = "en-US";
    }
    e = "en-US";
    var t = Zotero.cache.load({
        locale: e,
        target: "itemTypes"
    });
    if (t) {
        Z.debug("have itemTypes in localStorage", 3);
        Zotero.Item.prototype.itemTypes = t;
        return;
    }
    var r = Zotero.ajax.apiQueryString({
        locale: e
    });
    var a = Zotero.config.baseApiUrl + "/itemTypes" + r;
    J.getJSON(Zotero.ajax.proxyWrapper(a, "GET"), {}, function(t, r, a) {
        Z.debug("got itemTypes response", 3);
        Z.debug(t, 4);
        Zotero.Item.prototype.itemTypes = t;
        Zotero.cache.save({
            locale: e,
            target: "itemTypes"
        }, Zotero.Item.prototype.itemTypes);
    });
};

Zotero.Item.prototype.getItemFields = function(e) {
    Z.debug("Zotero.Item.prototype.getItemFields", 3);
    if (!e) {
        e = "en-US";
    }
    e = "en-US";
    var t = Zotero.cache.load({
        locale: e,
        target: "itemFields"
    });
    if (t) {
        Z.debug("have itemFields in localStorage", 3);
        Zotero.Item.prototype.itemFields = t;
        J.each(Zotero.Item.prototype.itemFields, function(e, t) {
            Zotero.localizations.fieldMap[t.field] = t.localized;
        });
        return;
    }
    var r = Zotero.ajax.apiQueryString({
        locale: e
    });
    var a = Zotero.config.baseApiUrl + "/itemFields" + r;
    J.getJSON(Zotero.ajax.proxyWrapper(a), {}, function(t, r, a) {
        Z.debug("got itemTypes response", 4);
        Zotero.Item.prototype.itemFields = t;
        Zotero.cache.save({
            locale: e,
            target: "itemFields"
        }, t);
        J.each(Zotero.Item.prototype.itemFields, function(e, t) {
            Zotero.localizations.fieldMap[t.field] = t.localized;
        });
    });
};

Zotero.Item.prototype.getItemTemplate = function(e, t) {
    Z.debug("Zotero.Item.prototype.getItemTemplate", 3);
    if (typeof e == "undefined") e = "document";
    if (e == "attachment" && typeof t == "undefined") {
        throw new Error("attachment template requested with no linkMode");
    }
    if (typeof t == "undefined") {
        t = "";
    }
    var r = Zotero.ajax.apiQueryString({
        itemType: e,
        linkMode: t
    });
    var a = Zotero.config.baseApiUrl + "/items/new" + r;
    var o = {
        itemType: e,
        target: "itemTemplate"
    };
    var i = Zotero.cache.load(o);
    if (i) {
        Z.debug("have itemTemplate in localStorage", 3);
        var n = i;
        return Promise.resolve(n);
    }
    return Zotero.ajaxRequest(a, "GET", {
        dataType: "json"
    }).then(function(e) {
        Z.debug("got itemTemplate response", 3);
        Zotero.cache.save(o, e.data);
        return e.data;
    });
};

Zotero.Item.prototype.getUploadAuthorization = function(e) {
    Z.debug("Zotero.Item.getUploadAuthorization", 3);
    var t = this;
    var r = {
        target: "item",
        targetModifier: "file",
        libraryType: t.owningLibrary.type,
        libraryID: t.owningLibrary.libraryID,
        itemKey: t.key
    };
    var a = {
        "Content-Type": "application/x-www-form-urlencoded"
    };
    var o = t.get("md5");
    if (o) {
        a["If-Match"] = o;
    } else {
        a["If-None-Match"] = "*";
    }
    return Zotero.ajaxRequest(r, "POST", {
        processData: true,
        data: e,
        headers: a
    });
};

Zotero.Item.prototype.registerUpload = function(e) {
    Z.debug("Zotero.Item.registerUpload", 3);
    var t = this;
    var r = {
        target: "item",
        targetModifier: "file",
        libraryType: t.owningLibrary.type,
        libraryID: t.owningLibrary.libraryID,
        itemKey: t.key
    };
    var a = {
        "Content-Type": "application/x-www-form-urlencoded"
    };
    var o = t.get("md5");
    if (o) {
        a["If-Match"] = o;
    } else {
        a["If-None-Match"] = "*";
    }
    return Zotero.ajaxRequest(r, "POST", {
        processData: true,
        data: {
            upload: e
        },
        headers: a
    });
};

Zotero.Item.prototype.fullUpload = function(e) {};

Zotero.Item.prototype.creatorTypes = {};

Zotero.Item.prototype.getCreatorTypes = function(e) {
    Z.debug("Zotero.Item.prototype.getCreatorTypes: " + e, 3);
    if (!e) {
        e = "document";
    }
    var t = Zotero.cache.load({
        target: "creatorTypes"
    });
    if (t) {
        Z.debug("have creatorTypes in localStorage", 3);
        Zotero.Item.prototype.creatorTypes = t;
    }
    if (Zotero.Item.prototype.creatorTypes[e]) {
        Z.debug("creatorTypes of requested itemType available in localStorage", 3);
        Z.debug(Zotero.Item.prototype.creatorTypes, 4);
        return Promise.resolve(Zotero.Item.prototype.creatorTypes[e]);
    } else {
        Z.debug("sending request for creatorTypes", 3);
        var r = Zotero.ajax.apiQueryString({
            itemType: e
        });
        var a = Zotero.config.baseApiUrl + "/itemTypeCreatorTypes" + r;
        return Zotero.ajaxRequest(a, "GET", {
            dataType: "json"
        }).then(function(t) {
            Z.debug("got creatorTypes response", 4);
            Zotero.Item.prototype.creatorTypes[e] = t.data;
            Zotero.cache.save({
                target: "creatorTypes"
            }, Zotero.Item.prototype.creatorTypes);
            return Zotero.Item.prototype.creatorTypes[e];
        });
    }
};

Zotero.Item.prototype.getCreatorFields = function(e) {
    Z.debug("Zotero.Item.prototype.getCreatorFields", 3);
    var t = Zotero.cache.load({
        target: "creatorFields"
    });
    if (t) {
        Z.debug("have creatorFields in localStorage", 3);
        Zotero.Item.prototype.creatorFields = t;
        return Promise.resolve(t);
    }
    var r = Zotero.config.baseApiUrl + "/creatorFields";
    return Zotero.ajaxRequest(r, "GET", {
        dataType: "json"
    }).then(function(e) {
        Z.debug("got itemTypes response", 4);
        Zotero.Item.prototype.creatorFields = e.data;
        Zotero.cache.save({
            target: "creatorFields"
        }, e.data);
    });
};

Zotero.Item.prototype.addItemTypes = function(e, t) {};

Zotero.Item.prototype.addItemFields = function(e, t) {};

Zotero.Item.prototype.addCreatorTypes = function(e, t) {};

Zotero.Item.prototype.addCreatorFields = function(e, t) {};

Zotero.Item.prototype.addItemTemplates = function(e) {};

Zotero.Item.prototype.itemTypeImageClass = function() {
    var e = this;
    if (e.apiObj.data.itemType == "attachment") {
        switch (e.apiObj.data.linkMode) {
          case "imported_file":
            if (e.translatedMimeType == "pdf") {
                return e.itemTypeImageSrc["attachmentPdf"];
            }
            return e.itemTypeImageSrc["attachmentFile"];

          case "imported_url":
            if (e.translatedMimeType == "pdf") {
                return e.itemTypeImageSrc["attachmentPdf"];
            }
            return e.itemTypeImageSrc["attachmentSnapshot"];

          case "linked_file":
            return e.itemTypeImageSrc["attachmentLink"];

          case "linked_url":
            return e.itemTypeImageSrc["attachmentWeblink"];

          default:
            return e.itemTypeImageSrc["attachment"];
        }
    } else {
        return e.apiObj.data.itemType;
    }
};

Zotero.Item.prototype.itemTypeIconClass = function() {
    var e = this;
    var t = "fa fa-file-text-o";
    switch (e.apiObj.data.itemType) {
      case "attachment":
        switch (e.apiObj.data.linkMode) {
          case "imported_file":
            if (e.translatedMimeType == "pdf") {
                return "fa fa-file-pdf-o";
            }
            return "glyphicons glyphicons-file";

          case "imported_url":
            if (e.translatedMimeType == "pdf") {
                return "fa fa-file-pdf-o";
            }
            return "glyphicons glyphicons-file";

          case "linked_file":
            return "glyphicons glyphicons-link";

          case "linked_url":
            return "glyphicons glyphicons-link";

          default:
            return "glyphicons glyphicons-paperclip";
        }
        return "glyphicons file";

      case "artwork":
        return "glyphicons glyphicons-picture";

      case "audioRecording":
        return "glyphicons glyphicons-microphone";

      case "bill":
        return t;

      case "blogPost":
        return "glyphicons glyphicons-blog";

      case "book":
        return "glyphicons glyphicons-book";

      case "bookSection":
        return "glyphicons glyphicons-book-open";

      case "case":
        return t;

      case "computerProgram":
        return "glyphicons glyphicons-floppy-disk";

      case "conferencePaper":
        return t;

      case "dictionaryEntry":
        return "glyphicons glyphicons-translate";

      case "document":
        return "glyphicons glyphicons-file";

      case "email":
        return "glyphicons glyphicons-envelope";

      case "encyclopediaArticle":
        return "glyphicons glyphicons-bookmark";

      case "film":
        return "glyphicons glyphicons-film";

      case "forumPost":
        return "glyphicons glyphicons-bullhorn";

      case "hearing":
        return "fa fa-gavel";

      case "instantMessage":
        return "fa fa-comment-o";

      case "interview":
        return "fa fa-comments-o";

      case "journalArticle":
        return "fa fa-file-text-o";

      case "letter":
        return "glyphicons glyphicons-message-full";

      case "magazineArticle":
        return t;

      case "manuscript":
        return "glyphicons glyphicons-pen";

      case "map":
        return "glyphicons glyphicons-google-maps";

      case "newspaperArticle":
        return "fa fa-newspaper-o";

      case "note":
        return "glyphicons glyphicons-notes noteyellow";

      case "patent":
        return "glyphicons glyphicons-lightbulb";

      case "podcast":
        return "glyphicons glyphicons-ipod";

      case "presentation":
        return "glyphicons glyphicons-keynote";

      case "radioBroadcast":
        return "glyphicons glyphicons-wifi-alt";

      case "report":
        return "glyphicons glyphicons-notes-2";

      case "statue":
        return "glyphicons glyphicons-bank";

      case "thesis":
        return "fa fa-graduation-cap";

      case "tvBroadcast":
        return "glyphicons glyphicons-display";

      case "videoRecording":
        return "glyphicons glyphicons-facetime-video";

      case "webpage":
        return "glyphicons glyphicons-embed-close";

      default:
        return "glyphicons file";
    }
};

Zotero.Item.prototype.get = function(e) {
    var t = this;
    switch (e) {
      case "title":
        var r = "";
        if (t.apiObj.data.itemType == "note") {
            return t.noteTitle(t.apiObj.data.note);
        } else {
            return t.apiObj.data.title;
        }
        if (r === "") {
            return "[Untitled]";
        }
        return r;

      case "creatorSummary":
      case "creator":
        if (typeof t.apiObj.meta.creatorSummary !== "undefined") {
            return t.apiObj.meta.creatorSummary;
        } else {
            return "";
        }
        break;

      case "year":
        if (t.parsedDate) {
            return t.parsedDate.getFullYear();
        } else {
            return "";
        }
    }
    if (e in t.apiObj.data) {
        return t.apiObj.data[e];
    } else if (e in t.apiObj.meta) {
        return t.apiObj.meta[e];
    } else if (t.hasOwnProperty(e)) {
        return t[e];
    }
    return null;
};

Zotero.Item.prototype.set = function(e, t) {
    var r = this;
    if (e in r.apiObj) {
        r.apiObj[e] = t;
    }
    if (e in r.apiObj.data) {
        r.apiObj.data[e] = t;
    }
    if (e in r.apiObj.meta) {
        r.apiObj.meta[e] = t;
    }
    switch (e) {
      case "itemKey":
      case "key":
        r.key = t;
        r.apiObj.data.key = t;
        break;

      case "itemVersion":
      case "version":
        r.version = t;
        r.apiObj.data.version = t;
        break;

      case "itemType":
        r.itemType = t;
        break;

      case "linkMode":
        break;

      case "deleted":
        r.apiObj.data.deleted = t;
        break;

      case "parentItem":
        if (t === "") {
            t = false;
        }
        r.apiObj.data.parentItem = t;
        break;
    }
    return r;
};

Zotero.Item.prototype.noteTitle = function(e) {
    var t = 120;
    var r = J(e).text();
    var a = r.indexOf("\n");
    if (a != -1 && a < t) {
        return r.substr(0, a);
    } else {
        return r.substr(0, t);
    }
};

Zotero.Item.prototype.setParent = function(e) {
    var t = this;
    if (typeof e != "string" && e.hasOwnProperty("instance") && e.instance == "Zotero.Item") {
        e = e.key;
    }
    t.set("parentItem", e);
    return t;
};

Zotero.Item.prototype.addToCollection = function(e) {
    var t = this;
    if (typeof e != "string") {
        if (e.instance == "Zotero.Collection") {
            e = e.key;
        }
    }
    if (J.inArray(e, t.apiObj.data.collections) === -1) {
        t.apiObj.data.collections.push(e);
    }
    return;
};

Zotero.Item.prototype.removeFromCollection = function(e) {
    var t = this;
    if (typeof e != "string") {
        if (e.instance == "Zotero.Collection") {
            e = e.key;
        }
    }
    var r = J.inArray(e, t.apiObj.data.collections);
    if (r != -1) {
        t.apiObj.data.collections.splice(r, 1);
    }
    return;
};

Zotero.Item.prototype.uploadChildAttachment = function(e, t, r) {
    var a = this;
    Z.debug("uploadChildAttachment", 3);
    if (!a.owningLibrary) {
        return Promise.reject(new Error("Item must be associated with a library"));
    }
    e.set("parentItem", a.key);
    e.associateWithLibrary(a.owningLibrary);
    return e.writeItem().then(function(o) {
        a.numChildren++;
        return e.uploadFile(t, r);
    }, function(e) {
        throw {
            message: "Failure during attachmentItem write.",
            code: e.status,
            serverMessage: e.jqxhr.responseText,
            response: e
        };
    });
};

Zotero.Item.prototype.uploadFile = function(e, t) {
    var r = this;
    Z.debug("Zotero.Item.uploadFile", 3);
    var a = {
        md5: e.md5,
        filename: r.get("title"),
        filesize: e.filesize,
        mtime: e.mtime,
        contentType: e.contentType,
        params: 1
    };
    if (e.contentType === "") {
        a.contentType = "application/octet-stream";
    }
    return r.getUploadAuthorization(a).then(function(t) {
        Z.debug("uploadAuth callback", 3);
        var a;
        if (typeof t.data == "string") {
            a = JSON.parse(data);
        } else {
            a = t.data;
        }
        if (a.exists == 1) {
            return {
                message: "File Exists"
            };
        } else {
            return Zotero.file.uploadFile(a, e).then(function() {
                return r.registerUpload(a.uploadKey).then(function(e) {
                    if (e.isError) {
                        var t = {
                            message: "Failed to register uploaded file.",
                            code: e.status,
                            serverMessage: e.jqxhr.responseText,
                            response: e
                        };
                        Z.error(t);
                        throw t;
                    } else {
                        return {
                            message: "Upload Successful"
                        };
                    }
                });
            });
        }
    }).catch(function(e) {
        Z.debug("Failure caught during upload", 3);
        Z.debug(e, 3);
        throw {
            message: "Failure during upload.",
            code: e.status,
            serverMessage: e.jqxhr.responseText,
            response: e
        };
    });
};

Zotero.Item.prototype.cslItem = function() {
    var e = this;
    var t = e.get("itemType");
    var r = e.cslTypeMap.hasOwnProperty(t) ? e.cslTypeMap[t] : false;
    if (!r) r = "article";
    var a = (e.get("accessDate") || e.get("url")) && t in {
        journalArticle: 1,
        newspaperArticle: 1,
        magazineArticle: 1
    } && e.get("pages") && e.citePaperJournalArticleURL;
    cslItem = {
        type: r
    };
    if (e.owningLibrary) {
        cslItem["id"] = e.apiObj.library.id + "/" + e.get("key");
    } else {
        cslItem["id"] = Zotero.utils.getKey();
    }
    J.each(e.cslFieldMap, function(t, r) {
        if (t == "URL" && a) return;
        J.each(r, function(r, a) {
            var o = e.get(a);
            if (o) {
                cslItem[t] = o;
            }
        });
    });
    var o = e.get("creators");
    J.each(o, function(e, t) {
        var r = t["creatorType"];
        if (!r) return;
        var a;
        if (t.hasOwnProperty("name")) {
            a = {
                literal: t["name"]
            };
        } else {
            a = {
                family: t["lastName"],
                given: t["firstName"]
            };
        }
        if (cslItem.hasOwnProperty(r)) {
            cslItem[r].push(a);
        } else {
            cslItem[r] = [ a ];
        }
    });
    J.each(e.cslDateMap, function(t, r) {
        var a = e.get(r);
        if (a) {
            cslItem[t] = {
                raw: a
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
    versionNumber: "Version Number",
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

Zotero.Item.prototype.hideFields = [ "mimeType", "linkMode", "charset", "md5", "mtime", "version", "key", "collections", "relations", "parentItem", "contentType", "filename", "tags" ];

Zotero.Item.prototype.noEditFields = [ "accessDate", "modified", "filename", "dateAdded", "dateModified" ];

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
    versionNumber: [ "version" ],
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

Zotero.Tag = function(e) {
    this.instance = "Zotero.Tag";
    this.color = null;
    this.version = 0;
    if (typeof e == "object") {
        this.parseJsonTag(e);
    } else if (typeof e == "string") {
        this.parseJsonTag(this.templateApiObj(e));
    } else {
        this.parseJsonTag(this.tamplateApiObj(""));
    }
};

Zotero.Tag.prototype = new Zotero.ApiObject();

Zotero.Tag.prototype.parseJsonTag = function(e) {
    var t = this;
    t.apiObj = J.extend({}, e);
    t.urlencodedtag = encodeURIComponent(t.apiObj.tag);
    t.version = t.apiObj.version;
};

Zotero.Tag.prototype.templateApiObj = function(e) {
    return {
        tag: e,
        links: {},
        meta: {
            type: 0,
            numItems: 1
        }
    };
};

Zotero.Tag.prototype.tagComparer = function() {
    if (window.Intl) {
        var e = new window.Intl.Collator();
        return function(t, r) {
            return e.compare(t.apiObj.tag, r.apiObj.tag);
        };
    } else {
        return function(e, t) {
            if (e.apiObj.tag.toLocaleLowerCase() == t.apiObj.tag.toLocaleLowerCase()) {
                return 0;
            }
            if (e.apiObj.tag.toLocaleLowerCase() < t.apiObj.tag.toLocaleLowerCase()) {
                return -1;
            }
            return 1;
        };
    }
};

Zotero.Tag.prototype.set = function(e, t) {
    var r = this;
    if (e in r.apiObj) {
        r.apiObj[e] = t;
    }
    if (e in r.apiObj.meta) {
        r.apiObj.meta[e] = t;
    }
    switch (e) {
      case "tagVersion":
      case "version":
        r.version = t;
        r.apiObj.version = t;
        break;
    }
    return r;
};

Zotero.Search = function() {
    this.instance = "Zotero.Search";
    this.searchObject = {};
};

Zotero.Group = function(e) {
    var t = this;
    t.instance = "Zotero.Group";
    if (e) {
        this.parseJsonGroup(e);
    }
};

Zotero.Group.prototype = new Zotero.ApiObject();

Zotero.Group.prototype.parseJsonGroup = function(e) {
    var t = this;
    t.apiObj = e;
};

Zotero.Group.prototype.get = function(e) {
    var t = this;
    switch (e) {
      case "title":
      case "name":
        return t.apiObj.data.name;
    }
    if (e in t.apiObj) {
        return t.apiObj[e];
    }
    if (e in t.apiObj.data) {
        return t.apiObj.data[e];
    }
    if (e in t.apiObj.meta) {
        return t.apiObj.meta[e];
    }
    if (t.hasOwnProperty(e)) {
        return t[e];
    }
    return null;
};

Zotero.Group.prototype.isWritable = function(e) {
    var t = this;
    switch (true) {
      case t.get("owner") == e:
        return true;

      case t.apiObj.data.admins && t.apiObj.data.admins.indexOf(e) != -1:
        return true;

      case t.apiObj.data.libraryEditing == "members" && t.apiObj.data.members && t.apiObj.data.members.indexOf(e) != -1:
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

Zotero.User.prototype = new Zotero.ApiObject();

Zotero.User.prototype.loadObject = function(e) {
    this.title = e.title;
    this.author = e.author;
    this.tagID = e.tagID;
    this.published = e.published;
    this.updated = e.updated;
    this.links = e.links;
    this.numItems = e.numItems;
    this.items = e.items;
    this.tagType = e.tagType;
    this.modified = e.modified;
    this.added = e.added;
    this.key = e.key;
};

Zotero.User.prototype.parseXmlUser = function(e) {
    this.parseXmlEntry(e);
    var t = e.find("content>tag");
    if (t.length !== 0) {
        this.tagKey = t.attr("key");
        this.libraryID = t.attr("libraryID");
        this.tagName = t.attr("name");
        this.dateAdded = t.attr("dateAdded");
        this.dateModified = t.attr("dateModified");
    }
};

Zotero.utils = {
    randomString: function(e, t) {
        if (!t) {
            t = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
        }
        if (!e) {
            e = 8;
        }
        var r = "";
        for (var a = 0; a < e; a++) {
            var o = Math.floor(Math.random() * t.length);
            r += t.substring(o, o + 1);
        }
        return r;
    },
    getKey: function() {
        var e = "23456789ABCDEFGHIJKMNPQRSTUVWXZ";
        return Zotero.utils.randomString(8, e);
    },
    slugify: function(e) {
        var t = J.trim(e);
        t = t.toLowerCase();
        t = t.replace(/[^a-z0-9 ._-]/g, "");
        t = t.replace(/\s/g, "_");
        return t;
    },
    prependAutocomplete: function(e, t) {
        Z.debug("Zotero.utils.prependAutocomplete", 3);
        Z.debug("prepend match: " + e);
        var r;
        if (!t) {
            Z.debug("source is not defined");
        }
        if (e === "") {
            r = t.slice(0);
            return r;
        }
        var a = e.length;
        var o = e.toLowerCase();
        r = J.map(t, function(e) {
            if (e.substr(0, a).toLowerCase() == o) {
                return e;
            } else {
                return null;
            }
        });
        return r;
    },
    matchAnyAutocomplete: function(e, t) {
        Z.debug("Zotero.utils.matchAnyAutocomplete", 3);
        Z.debug("matchAny match: " + e);
        var r;
        if (!t) {
            Z.debug("source is not defined");
        }
        if (e === "") {
            r = t.slice(0);
            return r;
        }
        var a = e.length;
        var o = e.toLowerCase();
        r = J.map(t, function(e) {
            if (e.toLowerCase().indexOf(o) != -1) {
                return e;
            } else {
                return null;
            }
        });
        return r;
    },
    libraryString: function(e, t) {
        var r = "";
        if (e == "user") r = "u"; else if (e == "group") r = "g";
        r += t;
        return r;
    },
    parseLibString: function(e) {
        var t;
        var r;
        if (e.charAt(0) == "u") {
            t = "user";
        } else if (e.charAt(0) == "g") {
            t = "group";
        } else {
            throw new Error("unexpected type character in libraryString");
        }
        r = parseInt(e.substring(1));
        return {
            libraryType: t,
            libraryID: r
        };
    },
    stale: function(e, t) {
        var r = Date.now();
        var a = r.getTime() - e.getTime();
        if (a / 6e4 > t) {
            return true;
        }
        return false;
    },
    entityify: function(e) {
        var t = {
            "<": "&lt;",
            ">": "&gt;",
            "&": "&amp;",
            '"': "&quot;"
        };
        return e.replace(/[<>&"]/g, function(e) {
            return t[e];
        });
    },
    parseApiDate: function(e, t) {
        var r = /([0-9]+)-([0-9]+)-([0-9]+)T([0-9]+):([0-9]+):([0-9]+)Z/;
        var a = r.exec(e);
        if (a === null) {
            Z.error("error parsing api date: " + e);
            return null;
        } else {
            t = new Date(Date.UTC(a[1], a[2] - 1, a[3], a[4], a[5], a[6]));
            return t;
        }
        return t;
    },
    readCookie: function(e) {
        var t = e + "=";
        var r = document.cookie.split(";");
        for (var a = 0; a < r.length; a++) {
            var o = r[a];
            while (o.charAt(0) == " ") o = o.substring(1, o.length);
            if (o.indexOf(t) === 0) return o.substring(t.length, o.length);
        }
        return null;
    },
    compareObs: function(e, t, r) {
        var a = r;
        var o = false;
        var i = [];
        if (r === undefined) {
            a = e;
            o = true;
        }
        J.each(a, function(r, a) {
            var n = a;
            if (o) n = r;
            if (typeof e[r] == "object") {
                if (Zotero.utils.compareObs(e[n], t[n]).length) {
                    i.push(n);
                }
            } else {
                if (e[n] != t[n]) {
                    i.push(n);
                }
            }
        });
        return i;
    },
    translateMimeType: function(e) {
        switch (e) {
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
            return e;
        }
    },
    getKeyPermissions: function(e, t) {
        if (!e) {
            return false;
        }
        if (!t) {
            return false;
        }
        var r = {
            target: "key",
            libraryType: "user",
            libraryID: e,
            apiKey: t
        };
        var a = Zotero.ajax.apiRequestString(r);
        return Zotero.ajaxRequest(a).then(function(e) {
            var t = J(e.data).find("key");
            var r = Zotero.utils.parseKey(t);
            return r;
        });
    },
    parseKey: function(e) {
        var t = [];
        var r = {
            library: "0",
            notes: "0",
            write: "0",
            groups: {}
        };
        var a = e.find("access");
        a.each(function() {
            var e = J(this);
            if (e.attr("library")) {
                r["library"] = e.attr("library");
            }
            if (e.attr("notes")) {
                r["notes"] = e.attr("notes");
            }
            if (e.attr("group")) {
                var t = e.attr("write") == "1" ? "write" : "read";
                r["groups"][e.attr("group")] = t;
            } else if (e.attr("write")) {
                r["write"] = e.attr("write");
            }
        });
        return r;
    }
};

Zotero.url.itemHref = function(e) {
    var t = "";
    t += Zotero.config.librarySettings.libraryPathString + "/itemKey/" + e.get("key");
    return t;
};

Zotero.url.attachmentDownloadLink = function(e) {
    var t = "";
    var r = e.attachmentDownloadUrl;
    var a = e.get("contentType");
    if (e.apiObj.links && e.apiObj.links["enclosure"]) {
        if (!e.apiObj.links["enclosure"]["length"] && e.isSnapshot()) {
            t += '<a href="' + r + '">' + "View Snapshot</a>";
        } else {
            var o = Zotero.utils.translateMimeType(e.apiObj.links["enclosure"].type);
            var i = e.apiObj.links["enclosure"];
            var n = parseInt(i["length"], 10);
            var s = "" + n + " B";
            if (n > 1073741824) {
                s = "" + (n / 1073741824).toFixed(1) + " GB";
            } else if (n > 1048576) {
                s = "" + (n / 1048576).toFixed(1) + " MB";
            } else if (n > 1024) {
                s = "" + (n / 1024).toFixed(1) + " KB";
            }
            Z.debug(o, 3);
            t += '<a href="' + r + '">';
            if (o == "undefined" || o === "" || typeof o == "undefined") {
                t += s + "</a>";
            } else {
                t += o + ", " + s + "</a>";
            }
            return t;
        }
    }
    return t;
};

Zotero.url.attachmentDownloadUrl = function(e) {
    if (e.apiObj.links && e.apiObj.links["enclosure"]) {
        if (Zotero.config.proxyDownloads) {
            return Zotero.url.wwwDownloadUrl(e);
        } else {
            return Zotero.url.apiDownloadUrl(e);
        }
    }
    return false;
};

Zotero.url.apiDownloadUrl = function(e) {
    if (e.apiObj.links["enclosure"]) {
        return e.apiObj.links["enclosure"]["href"];
    }
    return false;
};

Zotero.url.proxyDownloadUrl = function(e) {
    var t = "";
    if (e.apiObj.links["enclosure"]) {
        if (Zotero.config.proxyDownloads) {
            return Zotero.config.baseDownloadUrl + "?itemkey=" + e.get("key");
        } else {
            return Zotero.url.apiDownloadUrl(e);
        }
    } else {
        return false;
    }
};

Zotero.url.wwwDownloadUrl = function(e) {
    var t = "";
    if (e.apiObj.links["enclosure"]) {
        return Zotero.config.baseZoteroWebsiteUrl + Zotero.config.librarySettings.libraryPathString + "/" + e.get("key") + "/file/view";
    } else {
        return false;
    }
};

Zotero.url.publicationsDownloadUrl = function(e) {
    if (e.apiObj.links["enclosure"]) {
        return e.apiObj.links["enclosure"]["href"];
    }
    return false;
};

Zotero.url.attachmentFileDetails = function(e) {
    if (!e.apiObj.links["enclosure"]) return "";
    var t = Zotero.utils.translateMimeType(e.apiObj.links["enclosure"].type);
    var r = e.apiObj.links["enclosure"];
    var a = "";
    if (r["length"]) {
        var o = parseInt(r["length"], 10);
        a = "" + o + " B";
        if (o > 1073741824) {
            a = "" + (o / 1073741824).toFixed(1) + " GB";
        } else if (o > 1048576) {
            a = "" + (o / 1048576).toFixed(1) + " MB";
        } else if (o > 1024) {
            a = "" + (o / 1024).toFixed(1) + " KB";
        }
        return "(" + t + ", " + a + ")";
    } else {
        return "(" + t + ")";
    }
};

Zotero.url.userWebLibrary = function(e) {
    return [ Zotero.config.baseWebsiteUrl, e, "items" ].join("/");
};

Zotero.url.groupWebLibrary = function(e) {
    if (e.type == "Private") {
        return [ Zotero.config.baseWebsiteUrl, "groups", e.get("id"), "items" ].join("/");
    } else {
        return [ Zotero.config.baseWebsiteUrl, "groups", Zotero.utils.slugify(e.get("name")), "items" ].join("/");
    }
};

Zotero.url.exportUrls = function(e) {
    Z.debug("Zotero.url.exportUrls", 3);
    var t = {};
    var r = {};
    J.each(Zotero.config.exportFormats, function(a, o) {
        r = J.extend(e, {
            format: o
        });
        t[o] = Zotero.ajax.apiRequestUrl(r) + Zotero.ajax.apiQueryString({
            format: o,
            limit: "25"
        });
    });
    return t;
};

Zotero.url.relationUrl = function(e, t, r) {
    return "http://zotero.org/" + e + "s/" + t + "/items/" + r;
};

Zotero.file = {};

Zotero.file.getFileInfo = function(e) {
    if (typeof FileReader != "function") {
        return Promise.reject(new Error("FileReader not supported"));
    }
    return new Promise(function(t, r) {
        var a = {};
        var o = new FileReader();
        o.onload = function(r) {
            Z.debug("Zotero.file.getFileInfo onloadFunc", 3);
            var o = r.target.result;
            Zotero.debug(o, 3);
            a.md5 = SparkMD5.ArrayBuffer.hash(o);
            a.filename = e.name;
            a.filesize = e.size;
            a.mtime = Date.now();
            a.contentType = e.type;
            a.filedata = o;
            t(a);
        };
        o.readAsArrayBuffer(e);
    });
};

Zotero.file.uploadFile = function(e, t) {
    Z.debug("Zotero.file.uploadFile", 3);
    Z.debug(e, 4);
    var r = new FormData();
    J.each(e.params, function(e, t) {
        r.append(e, t);
    });
    var a = new Blob([ t.filedata ], {
        type: t.contentType
    });
    r.append("file", a);
    var o = new XMLHttpRequest();
    o.open("POST", e.url, true);
    return new Promise(function(e, t) {
        o.onload = function(r) {
            Z.debug("uploadFile onload event", 3);
            if (this.status == 201) {
                Z.debug("successful upload - 201", 3);
                e();
            } else {
                Z.error("uploadFile failed - " + o.status);
                t({
                    message: "Failure uploading file.",
                    code: o.status,
                    serverMessage: o.responseText
                });
            }
        };
        o.onprogress = function(e) {
            Z.debug("progress event");
            Z.debug(e);
        };
        o.send(r);
    });
};

Zotero.Idb = {};

Zotero.Idb.Library = function(e) {
    Z.debug("Zotero.Idb.Library", 3);
    Z.debug("Initializing Zotero IDB", 3);
    this.libraryString = e;
    this.owningLibrary = null;
    this.initialized = false;
};

Zotero.Idb.Library.prototype.init = function() {
    var e = this;
    return new Promise(function(t, r) {
        var a = window.indexedDB;
        e.indexedDB = a;
        Z.debug("requesting indexedDb from browser", 3);
        var o;
        var i = a.open("Zotero_" + e.libraryString, 4);
        i.onerror = function(e) {
            Zotero.error("ERROR OPENING INDEXED DB");
            r();
        };
        var n = function(t) {
            Z.debug("Zotero.Idb onupgradeneeded or onsuccess", 3);
            var r = t.oldVersion;
            Z.debug("oldVersion: " + t.oldVersion, 3);
            var a = t.target.result;
            e.db = a;
            if (r < 4) {
                Z.debug("Existing object store names:", 3);
                Z.debug(JSON.stringify(a.objectStoreNames), 3);
                Z.debug("Deleting old object stores", 3);
                if (a.objectStoreNames["items"]) {
                    a.deleteObjectStore("items");
                }
                if (a.objectStoreNames["tags"]) {
                    a.deleteObjectStore("tags");
                }
                if (a.objectStoreNames["collections"]) {
                    a.deleteObjectStore("collections");
                }
                if (a.objectStoreNames["files"]) {
                    a.deleteObjectStore("files");
                }
                if (a.objectStoreNames["versions"]) {
                    a.deleteObjectStore("versions");
                }
                Z.debug("Existing object store names:", 3);
                Z.debug(JSON.stringify(a.objectStoreNames), 3);
                var o = a.createObjectStore("items", {
                    keyPath: "key"
                });
                var i = a.createObjectStore("collections", {
                    keyPath: "key"
                });
                var n = a.createObjectStore("tags", {
                    keyPath: "tag"
                });
                var s = a.createObjectStore("files");
                var l = a.createObjectStore("versions");
                Z.debug("itemStore index names:", 3);
                Z.debug(JSON.stringify(o.indexNames), 3);
                Z.debug("collectionStore index names:", 3);
                Z.debug(JSON.stringify(i.indexNames), 3);
                Z.debug("tagStore index names:", 3);
                Z.debug(JSON.stringify(n.indexNames), 3);
                J.each(Zotero.Item.prototype.fieldMap, function(e, t) {
                    Z.debug("Creating index on " + e, 3);
                    o.createIndex(e, "data." + e, {
                        unique: false
                    });
                });
                o.createIndex("collectionKeys", "data.collections", {
                    unique: false,
                    multiEntry: true
                });
                o.createIndex("itemTagStrings", "_supplement.tagstrings", {
                    unique: false,
                    multiEntry: true
                });
                o.createIndex("parentItemKey", "data.parentItem", {
                    unique: false
                });
                o.createIndex("libraryKey", "libraryKey", {
                    unique: false
                });
                o.createIndex("deleted", "data.deleted", {
                    unique: false
                });
                i.createIndex("name", "data.name", {
                    unique: false
                });
                i.createIndex("key", "key", {
                    unique: false
                });
                i.createIndex("parentCollection", "data.parentCollection", {
                    unique: false
                });
                n.createIndex("tag", "tag", {
                    unique: false
                });
            }
        };
        i.onupgradeneeded = n;
        i.onsuccess = function() {
            Z.debug("IDB success", 3);
            e.db = i.result;
            e.initialized = true;
            t(e);
        };
    });
};

Zotero.Idb.Library.prototype.deleteDB = function() {
    var e = this;
    e.db.close();
    return new Promise(function(t, r) {
        var a = e.indexedDB.deleteDatabase("Zotero_" + e.libraryString);
        a.onerror = function() {
            Z.error("Error deleting indexedDB");
            r();
        };
        a.onsuccess = function() {
            Z.debug("Successfully deleted indexedDB", 2);
            t();
        };
    });
};

Zotero.Idb.Library.prototype.getObjectStore = function(e, t) {
    var r = this;
    var a = r.db.transaction(e, t);
    return a.objectStore(e);
};

Zotero.Idb.Library.prototype.clearObjectStore = function(e) {
    var t = this;
    var r = getObjectStore(e, "readwrite");
    return new Promise(function(e, t) {
        var a = r.clear();
        a.onsuccess = function(t) {
            Z.debug("Store cleared", 3);
            e();
        };
        a.onerror = function(e) {
            Z.error("clearObjectStore:", e.target.errorCode);
            t();
        };
    });
};

Zotero.Idb.Library.prototype.addItems = function(e) {
    return this.addObjects(e, "item");
};

Zotero.Idb.Library.prototype.updateItems = function(e) {
    return this.updateObjects(e, "item");
};

Zotero.Idb.Library.prototype.removeItems = function(e) {
    return this.removeObjects(e, "item");
};

Zotero.Idb.Library.prototype.getItem = function(e) {
    var t = this;
    return new Promise(function(r, a) {
        var o = function(e) {
            r(e.target.result);
        };
        t.db.transaction("items").objectStore([ "items" ], "readonly").get(e).onsuccess = o;
    });
};

Zotero.Idb.Library.prototype.getAllItems = function() {
    return this.getAllObjects("item");
};

Zotero.Idb.Library.prototype.getOrderedItemKeys = function(e, t) {
    var r = this;
    Z.debug("Zotero.Idb.getOrderedItemKeys", 3);
    Z.debug("" + e + " " + t, 3);
    return new Promise(function(a, o) {
        var i = r.db.transaction([ "items" ], "readonly").objectStore("items");
        var n = i.index(e);
        if (!n) {
            throw new Error("Index for requested field '" + e + "'' not found");
        }
        var s = "next";
        if (t == "desc") {
            s = "prev";
        }
        var l = n.openKeyCursor(null, s);
        var c = [];
        l.onsuccess = J.proxy(function(e) {
            var t = e.target.result;
            if (t) {
                c.push(t.primaryKey);
                t.continue();
            } else {
                Z.debug("No more cursor: done. Resolving deferred.", 3);
                a(c);
            }
        }, this);
        l.onfailure = J.proxy(function(e) {
            o();
        }, this);
    });
};

Zotero.Idb.Library.prototype.filterItems = function(e, t) {
    var r = this;
    Z.debug("Zotero.Idb.filterItems " + e + " - " + t, 3);
    return new Promise(function(a, o) {
        var i = [];
        var n = r.db.transaction([ "items" ], "readonly").objectStore("items");
        var s = n.index(e);
        if (!s) {
            throw new Error("Index for requested field '" + e + "'' not found");
        }
        var l = "next";
        var c = IDBKeyRange.only(t);
        var d = s.openKeyCursor(c, l);
        d.onsuccess = J.proxy(function(e) {
            var t = e.target.result;
            if (t) {
                i.push(t.primaryKey);
                t.continue();
            } else {
                Z.debug("No more cursor: done. Resolving deferred.", 3);
                a(i);
            }
        }, this);
        d.onfailure = J.proxy(function(e) {
            o();
        }, this);
    });
};

Zotero.Idb.Library.prototype.inferType = function(e) {
    if (!e) {
        return false;
    }
    if (!e.instance) {
        return false;
    }
    switch (e.instance) {
      case "Zotero.Item":
        return "item";

      case "Zotero.Collection":
        return "collection";

      case "Zotero.Tag":
        return "tag";

      default:
        return false;
    }
};

Zotero.Idb.Library.prototype.getTransactionAndStore = function(e, t) {
    var r = this;
    var a;
    var o;
    switch (e) {
      case "item":
        a = r.db.transaction([ "items" ], t);
        o = a.objectStore("items");
        break;

      case "collection":
        a = r.db.transaction([ "collections" ], t);
        o = a.objectStore("collections");
        break;

      case "tag":
        a = r.db.transaction([ "tags" ], t);
        o = a.objectStore("tags");
        break;

      default:
        return Promise.reject();
    }
    return [ a, o ];
};

Zotero.Idb.Library.prototype.addObjects = function(e, t) {
    Z.debug("Zotero.Idb.Library.addObjects", 3);
    var r = this;
    if (!t) {
        t = r.inferType(e[0]);
    }
    var a = r.getTransactionAndStore(t, "readwrite");
    var o = a[0];
    var i = a[1];
    return new Promise(function(t, r) {
        o.oncomplete = function(e) {
            Zotero.debug("Add Objects transaction completed.", 3);
            t();
        };
        o.onerror = function(e) {
            Zotero.error("Add Objects transaction failed.");
            r();
        };
        var a = function(e) {
            Zotero.debug("Added Object " + e.target.result, 4);
        };
        for (var n in e) {
            var s = i.add(e[n].apiObj);
            s.onsuccess = a;
        }
    });
};

Zotero.Idb.Library.prototype.updateObjects = function(e, t) {
    Z.debug("Zotero.Idb.Library.updateObjects", 3);
    var r = this;
    if (!t) {
        t = r.inferType(e[0]);
    }
    var a = r.getTransactionAndStore(t, "readwrite");
    var o = a[0];
    var i = a[1];
    return new Promise(function(t, r) {
        o.oncomplete = function(e) {
            Zotero.debug("Update Objects transaction completed.", 3);
            t();
        };
        o.onerror = function(e) {
            Zotero.error("Update Objects transaction failed.");
            r();
        };
        var a = function(e) {
            Zotero.debug("Updated Object " + e.target.result, 4);
        };
        for (var n in e) {
            var s = i.put(e[n].apiObj);
            s.onsuccess = a;
        }
    });
};

Zotero.Idb.Library.prototype.removeObjects = function(e, t) {
    var r = this;
    if (!t) {
        t = r.inferType(e[0]);
    }
    var a = r.getTransactionAndStore(t, "readwrite");
    var o = a[0];
    var i = a[1];
    return new Promise(function(t, r) {
        o.oncomplete = function(e) {
            Zotero.debug("Remove Objects transaction completed.", 3);
            t();
        };
        o.onerror = function(e) {
            Zotero.error("Remove Objects transaction failed.");
            r();
        };
        var a = function(e) {
            Zotero.debug("Removed Object " + e.target.result, 4);
        };
        for (var n in collections) {
            var s = i.delete(e[n].key);
            s.onsuccess = a;
        }
    });
};

Zotero.Idb.Library.prototype.getAllObjects = function(e) {
    var t = this;
    if (!e) {
        e = t.inferType(objects[0]);
    }
    return new Promise(function(r, a) {
        var o = [];
        var i = t.db.transaction(e + "s").objectStore(e + "s");
        i.openCursor().onsuccess = function(e) {
            var t = e.target.result;
            if (t) {
                o.push(t.value);
                t.continue();
            } else {
                r(o);
            }
        };
    });
};

Zotero.Idb.Library.prototype.addCollections = function(e) {
    return this.addObjects(e, "collection");
};

Zotero.Idb.Library.prototype.updateCollections = function(e) {
    Z.debug("Zotero.Idb.Library.updateCollections", 3);
    return this.updateObjects(e, "collection");
};

Zotero.Idb.Library.prototype.getCollection = function(e) {
    var t = this;
    return new Promise(function(r, a) {
        var o = function(e) {
            r(e.target.result);
        };
        t.db.transaction("collections").objectStore([ "collections" ], "readonly").get(e).onsuccess = o;
    });
};

Zotero.Idb.Library.prototype.removeCollections = function(e) {
    Z.debug("Zotero.Idb.Library.removeCollections", 3);
    return this.removeObjects(e, "collection");
};

Zotero.Idb.Library.prototype.getAllCollections = function() {
    Z.debug("Zotero.Idb.Library.getAllCollections", 3);
    return this.getAllObjects("collection");
};

Zotero.Idb.Library.prototype.addTags = function(e) {
    return this.addObjects(e, "tag");
};

Zotero.Idb.Library.prototype.updateTags = function(e) {
    Z.debug("Zotero.Idb.Library.updateTags", 3);
    return this.updateObjects(e, "tag");
};

Zotero.Idb.Library.prototype.getAllTags = function() {
    Z.debug("getAllTags", 3);
    return this.getAllObjects("tag");
};

Zotero.Idb.Library.prototype.setVersion = function(e, t) {
    Z.debug("Zotero.Idb.Library.setVersion", 3);
    var r = this;
    return new Promise(function(a, o) {
        var i = r.db.transaction([ "versions" ], "readwrite");
        i.oncomplete = function(e) {
            Zotero.debug("set version transaction completed.", 3);
            a();
        };
        i.onerror = function(e) {
            Zotero.error("set version transaction failed.");
            o();
        };
        var n = i.objectStore("versions");
        var s = function(e) {
            Zotero.debug("Set Version" + e.target.result, 3);
        };
        var l = n.put(t, e);
        l.onsuccess = s;
    });
};

Zotero.Idb.Library.prototype.getVersion = function(e) {
    Z.debug("Zotero.Idb.Library.getVersion", 3);
    var t = this;
    return new Promise(function(r, a) {
        var o = function(e) {
            Z.debug("done getting version");
            r(e.target.result);
        };
        t.db.transaction([ "versions" ], "readonly").objectStore("versions").get(e).onsuccess = o;
    });
};

Zotero.Idb.Library.prototype.setFile = function(e, t) {
    Z.debug("Zotero.Idb.Library.setFile", 3);
    var r = this;
    return new Promise(function(a, o) {
        var i = r.db.transaction([ "files" ], "readwrite");
        i.oncomplete = function(e) {
            Zotero.debug("set file transaction completed.", 3);
            a();
        };
        i.onerror = function(e) {
            Zotero.error("set file transaction failed.");
            o();
        };
        var n = i.objectStore("files");
        var s = function(e) {
            Zotero.debug("Set File" + e.target.result, 3);
        };
        var l = n.put(t, e);
        l.onsuccess = s;
    });
};

Zotero.Idb.Library.prototype.getFile = function(e) {
    Z.debug("Zotero.Idb.Library.getFile", 3);
    var t = this;
    return new Promise(function(r, a) {
        var o = function(e) {
            Z.debug("done getting file");
            r(e.target.result);
        };
        t.db.transaction([ "files" ], "readonly").objectStore("files").get(e).onsuccess = o;
    });
};

Zotero.Idb.Library.prototype.deleteFile = function(e) {
    Z.debug("Zotero.Idb.Library.deleteFile", 3);
    var t = this;
    return new Promise(function(e, r) {
        var a = t.db.transaction([ "files" ], "readwrite");
        a.oncomplete = function(t) {
            Zotero.debug("delete file transaction completed.", 3);
            e();
        };
        a.onerror = function(e) {
            Zotero.error("delete file transaction failed.");
            r();
        };
        var o = a.objectStore("files");
        var i = function(e) {
            Zotero.debug("Deleted File" + e.target.result, 4);
        };
        var n = o.delete(key);
        n.onsuccess = i;
    });
};

Zotero.Idb.Library.prototype.intersect = function(e, t) {
    var r = this;
    var a = [];
    for (var o = 0; o < e.length; o++) {
        if (t.indexOf(e[o]) !== -1) {
            a.push(e[o]);
        }
    }
    return a;
};

Zotero.Idb.Library.prototype.intersectAll = function(e) {
    var t = this;
    var r = e[0];
    for (var a = 0; a < e.length - 1; a++) {
        r = t.intersect(r, e[a + 1]);
    }
    return r;
};

Zotero.Library.prototype.processLoadedCollections = function(e) {
    Z.debug("processLoadedCollections", 3);
    var t = this;
    Z.debug("adding collections to library.collections");
    var r = t.collections.addCollectionsFromJson(e.data);
    for (var a = 0; a < r.length; a++) {
        r[a].associateWithLibrary(t);
    }
    t.collections.updateSyncState(e.lastModifiedVersion);
    Zotero.trigger("loadedCollectionsProcessed", {
        library: t,
        collectionsAdded: r
    });
    return e;
};

Zotero.Library.prototype.addCollection = function(e, t) {
    Z.debug("Zotero.Library.addCollection", 3);
    var r = this;
    var a = new Zotero.Collection();
    a.associateWithLibrary(r);
    a.set("name", e);
    a.set("parentCollection", t);
    return r.collections.writeCollections([ a ]);
};

Zotero.Library.prototype.fetchItemKeys = function(e) {
    Z.debug("Zotero.Library.fetchItemKeys", 3);
    var t = this;
    if (typeof e == "undefined") {
        e = {};
    }
    var r = J.extend(true, {
        target: "items",
        libraryType: this.libraryType,
        libraryID: this.libraryID,
        format: "keys"
    }, e);
    return t.ajaxRequest(r);
};

Zotero.Library.prototype.getTrashKeys = function() {
    Z.debug("Zotero.Library.getTrashKeys", 3);
    var e = this;
    var t = {
        target: "items",
        libraryType: e.libraryType,
        libraryID: e.libraryID,
        format: "keys",
        collectionKey: "trash"
    };
    return e.ajaxRequest(t);
};

Zotero.Library.prototype.emptyTrash = function() {
    Z.debug("Zotero.Library.emptyTrash", 3);
    var e = this;
    return e.getTrashKeys().then(function(t) {
        var r = t.data.split("\n");
        return e.items.deleteItems(r, t.lastModifiedVersion);
    });
};

Zotero.Library.prototype.loadItemKeys = function(e) {
    Z.debug("Zotero.Library.loadItemKeys", 3);
    var t = this;
    return this.fetchItemKeys(e).then(function(e) {
        Z.debug("loadItemKeys proxied callback", 3);
        var r = e.data.split(/[\s]+/);
        t.itemKeys = r;
    });
};

Zotero.Library.prototype.loadItems = function(e) {
    Z.debug("Zotero.Library.loadItems", 3);
    var t = this;
    if (!e) {
        e = {};
    }
    var r = {
        target: "items",
        targetModifier: "top",
        start: 0,
        limit: 25,
        order: Zotero.config.defaultSortColumn,
        sort: Zotero.config.defaultSortOrder
    };
    var a = J.extend({}, r, e);
    var o = J.extend({
        target: "items",
        libraryType: t.libraryType,
        libraryID: t.libraryID
    }, a);
    var i = Zotero.ajax.apiRequestString(o);
    return t.ajaxRequest(i).then(function(e) {
        Z.debug("loadItems proxied callback", 3);
        var r = t.items;
        var a = r.addItemsFromJson(e.data);
        for (var o = 0; o < a.length; o++) {
            a[o].associateWithLibrary(t);
        }
        e.loadedItems = a;
        Zotero.trigger("itemsChanged", {
            library: t
        });
        return e;
    });
};

Zotero.Library.prototype.loadPublications = function(e) {
    Z.debug("Zotero.Library.loadItems", 3);
    var t = this;
    if (!e) {
        e = {};
    }
    var r = {
        target: "publications",
        start: 0,
        limit: 50,
        order: Zotero.config.defaultSortColumn,
        sort: Zotero.config.defaultSortOrder,
        include: "bib"
    };
    var a = J.extend({}, r, e);
    var o = J.extend({
        target: "publications",
        libraryType: t.libraryType,
        libraryID: t.libraryID
    }, a);
    var i = Zotero.ajax.apiRequestString(o);
    return t.ajaxRequest(i).then(function(e) {
        Z.debug("loadItems proxied callback", 3);
        publicationItems = [];
        parsedItemJson = e.data;
        J.each(parsedItemJson, function(e, t) {
            var r = new Zotero.Item(t);
            publicationItems.push(r);
        });
        e.publicationItems = publicationItems;
        return e;
    });
};

Zotero.Library.prototype.processLoadedItems = function(e) {
    Z.debug("processLoadedItems", 3);
    var t = this;
    var r = t.items;
    var a = r.addItemsFromJson(e.data);
    for (var o = 0; o < a.length; o++) {
        a[o].associateWithLibrary(t);
    }
    t.items.updateSyncState(e.lastModifiedVersion);
    Zotero.trigger("itemsChanged", {
        library: t,
        loadedItems: a
    });
    return e;
};

Zotero.Library.prototype.loadItem = function(e) {
    Z.debug("Zotero.Library.loadItem", 3);
    var t = this;
    if (!r) {
        var r = {};
    }
    var a = {
        target: "item",
        libraryType: t.libraryType,
        libraryID: t.libraryID,
        itemKey: e
    };
    return t.ajaxRequest(a).then(function(e) {
        Z.debug("Got loadItem response");
        var r = new Zotero.Item(e.data);
        r.owningLibrary = t;
        t.items.itemObjects[r.key] = r;
        Zotero.trigger("itemsChanged", {
            library: t
        });
        return r;
    }, function(e) {
        Z.debug("Error loading Item");
    });
};

Zotero.Library.prototype.trashItem = function(e) {
    var t = this;
    return t.items.trashItems([ t.items.getItem(e) ]);
};

Zotero.Library.prototype.untrashItem = function(e) {
    Z.debug("Zotero.Library.untrashItem", 3);
    if (!e) return false;
    var t = this.items.getItem(e);
    t.apiObj.deleted = 0;
    return t.writeItem();
};

Zotero.Library.prototype.deleteItem = function(e) {
    Z.debug("Zotero.Library.deleteItem", 3);
    var t = this;
    return t.items.deleteItem(e);
};

Zotero.Library.prototype.deleteItems = function(e) {
    Z.debug("Zotero.Library.deleteItems", 3);
    var t = this;
    return t.items.deleteItems(e);
};

Zotero.Library.prototype.addNote = function(e, t) {
    Z.debug("Zotero.Library.prototype.addNote", 3);
    var r = this;
    var a = {
        target: "children",
        libraryType: r.libraryType,
        libraryID: r.libraryID,
        itemKey: e
    };
    var o = Zotero.ajax.apiRequestString(a);
    var i = this.items.getItem(e);
    return r.ajaxRequest(o, "POST", {
        processData: false
    });
};

Zotero.Library.prototype.fetchGlobalItems = function(e) {
    Z.debug("Zotero.Library.fetchGlobalItems", 3);
    var t = this;
    if (!e) {
        e = {};
    }
    var r = {
        target: "items",
        start: 0,
        limit: 25
    };
    var a = J.extend({}, r, e);
    var o = J.extend({
        target: "items",
        libraryType: ""
    }, a);
    var i = Zotero.ajax.apiRequestString(o);
    return t.ajaxRequest(i, "GET", {
        dataType: "json"
    }).then(function(e) {
        Z.debug("globalItems callback", 3);
        return e.data;
    });
};

Zotero.Library.prototype.fetchGlobalItem = function(e) {
    Z.debug("Zotero.Library.fetchGlobalItem", 3);
    Z.debug(e);
    var t = this;
    var r = {
        target: "item"
    };
    var a = J.extend({}, r);
    var o = J.extend({
        target: "item",
        libraryType: "",
        itemKey: e
    }, a);
    var i = Zotero.ajax.apiRequestString(o);
    return t.ajaxRequest(i, "GET", {
        dataType: "json"
    }).then(function(e) {
        Z.debug("globalItem callback", 3);
        return e.data;
    });
};

Zotero.Library.prototype.fetchTags = function(e) {
    Z.debug("Zotero.Library.fetchTags", 3);
    var t = this;
    var r = {
        target: "tags",
        order: "title",
        sort: "asc",
        limit: 100
    };
    var a = J.extend({}, r, e);
    var o = J.extend({
        target: "tags",
        libraryType: this.libraryType,
        libraryID: this.libraryID
    }, a);
    return Zotero.ajaxRequest(o);
};

Zotero.Library.prototype.loadTags = function(e) {
    Z.debug("Zotero.Library.loadTags", 3);
    var t = this;
    if (typeof e == "undefined") {
        e = {};
    }
    if (e.showAutomaticTags && e.collectionKey) {
        delete e.collectionKey;
    }
    t.tags.displayTagsArray = [];
    return t.fetchTags(e).then(function(e) {
        Z.debug("loadTags proxied callback", 3);
        var r = e.lastModifiedVersion;
        t.tags.updateSyncState(r);
        var a = t.tags.addTagsFromJson(e.data);
        t.tags.updateTagsVersion(r);
        t.tags.rebuildTagsArray();
        if (e.parsedLinks.hasOwnProperty("next")) {
            t.tags.hasNextLink = true;
            t.tags.nextLink = e.parsedLinks["next"];
        } else {
            t.tags.hasNextLink = false;
            t.tags.nextLink = null;
        }
        t.trigger("tagsChanged", {
            library: t
        });
        return t.tags;
    });
};

Zotero.Library.prototype.loadAllTags = function(e) {
    Z.debug("Zotero.Library.loadAllTags", 3);
    var t = this;
    if (typeof e == "undefined") {
        e = {};
    }
    var r = {
        target: "tags",
        order: "title",
        sort: "asc",
        limit: 100,
        libraryType: t.libraryType,
        libraryID: t.libraryID
    };
    var a = J.extend({}, r, e);
    var o = J.extend({}, a);
    var i = Zotero.ajax.apiRequestString(o);
    var n = t.tags;
    var s = J.extend({}, r, n.loadedConfig);
    var l = n.loadedRequestUrl;
    Z.debug("requestUrl: " + i, 4);
    Z.debug("loadedConfigRequestUrl: " + l, 4);
    return new Promise(function(r, a) {
        var n = function(r) {
            Z.debug("loadAllTags continueLoadingCallback", 3);
            var a = Zotero.Tags.prototype.plainTagsList(r.tagsArray);
            a.sort(Zotero.Library.prototype.comparer());
            r.plainList = a;
            if (r.hasNextLink) {
                Z.debug("still has next link.", 3);
                r.tagsArray.sort(Zotero.Tag.prototype.tagComparer());
                a = Zotero.Tags.prototype.plainTagsList(r.tagsArray);
                a.sort(Zotero.Library.prototype.comparer());
                r.plainList = a;
                var o = r.nextLink;
                var s = J.deparam(J.param.querystring(o));
                var l = J.extend({}, e);
                l.start = s.start;
                l.limit = s.limit;
                return t.loadTags(l).then(n);
            } else {
                Z.debug("no next in tags link", 3);
                r.updateSyncedVersion();
                r.tagsArray.sort(Zotero.Tag.prototype.tagComparer());
                a = Zotero.Tags.prototype.plainTagsList(r.tagsArray);
                a.sort(Zotero.Library.prototype.comparer());
                r.plainList = a;
                Z.debug("resolving loadTags deferred", 3);
                t.tagsLoaded = true;
                t.tags.loaded = true;
                r.loadedConfig = e;
                r.loadedRequestUrl = i;
                for (var c = 0; c < t.tags.tagsArray.length; c++) {
                    r.tagsArray[c].apiObj.version = r.tagsVersion;
                }
                t.trigger("tagsChanged", {
                    library: t
                });
                return r;
            }
        };
        r(t.loadTags(o).then(n));
    });
};

Zotero.Library.prototype.loadIndexedDBCache = function() {
    Zotero.debug("Zotero.Library.loadIndexedDBCache", 3);
    var e = this;
    var t = e.idbLibrary.getAllItems();
    var r = e.idbLibrary.getAllCollections();
    var a = e.idbLibrary.getAllTags();
    t.then(function(t) {
        Z.debug("loadIndexedDBCache itemsD done", 3);
        var r = 0;
        for (var a = 0; a < t.length; a++) {
            var o = new Zotero.Item(t[a]);
            e.items.addItem(o);
            if (o.version > r) {
                r = o.version;
            }
        }
        e.items.itemsVersion = r;
        e.items.loaded = true;
        Z.debug("Done loading indexedDB items promise into library", 3);
    });
    r.then(function(t) {
        Z.debug("loadIndexedDBCache collectionsD done", 3);
        var r = 0;
        for (var a = 0; a < t.length; a++) {
            var o = new Zotero.Collection(t[a]);
            e.collections.addCollection(o);
            if (o.version > r) {
                r = o.version;
            }
        }
        e.collections.collectionsVersion = r;
        e.collections.initSecondaryData();
        e.collections.loaded = true;
    });
    a.then(function(t) {
        Z.debug("loadIndexedDBCache tagsD done", 3);
        Z.debug(t);
        var r = 0;
        var a = 0;
        for (var o = 0; o < t.length; o++) {
            var i = new Zotero.Tag(t[o]);
            e.tags.addTag(i);
            if (t[o].version > r) {
                r = t[o].version;
            }
        }
        a = r;
        e.tags.tagsVersion = a;
        e.tags.loaded = true;
    });
    return Promise.all([ t, r, a ]);
};

Zotero.Library.prototype.saveIndexedDB = function() {
    var e = this;
    var t = e.idbLibrary.updateItems(e.items.itemsArray);
    var r = e.idbLibrary.updateCollections(e.collections.collectionsArray);
    var a = e.idbLibrary.updateTags(e.tags.tagsArray);
    return Promise.all([ t, r, a ]);
};

Zotero.Preferences = function(e, t) {
    this.store = e;
    this.idString = t;
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

Zotero.Preferences.prototype.setPref = function(e, t) {
    var r = this;
    r.preferencesObject[e] = t;
    r.persist();
};

Zotero.Preferences.prototype.setPrefs = function(e) {
    var t = this;
    if (typeof e != "object") {
        throw new Error("Preferences must be an object");
    }
    t.preferencesObject = e;
    t.persist();
};

Zotero.Preferences.prototype.getPref = function(e) {
    var t = this;
    if (t.preferencesObject[e]) {
        return t.preferencesObject[e];
    } else if (t.defaults[e]) {
        return t.defaults[e];
    } else {
        return null;
    }
};

Zotero.Preferences.prototype.getPrefs = function() {
    var e = this;
    return e.preferencesObject;
};

Zotero.Preferences.prototype.persist = function() {
    var e = this;
    var t = "preferences_" + e.idString;
    e.store[t] = JSON.stringify(e.preferencesObject);
};

Zotero.Preferences.prototype.load = function() {
    var e = this;
    var t = "preferences_" + e.idString;
    var r = e.store[t];
    if (!r) {
        e.preferencesObject = {};
    } else {
        e.preferencesObject = JSON.parse(r);
    }
};

var J = jQuery.noConflict();

jQuery(document).ready(function() {
    Z.debug("===== DOM READY =====", 3);
    Zotero.state = new Zotero.State();
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
    if (window.zoteroConfig) {
        Zotero.config = J.extend({}, Zotero.config, window.zoteroConfig);
    }
    Zotero.state.rewriteAltUrl();
    if (Zotero.pages) {
        Zotero.pages.base.init();
    }
    if (window.zoterojsClass && undefined !== Zotero.pages && Zotero.pages[zoterojsClass]) {
        try {
            Zotero.pages[zoterojsClass].init();
        } catch (e) {
            Z.error("Error running page specific init for " + zoterojsClass);
            Z.error(e);
        }
    }
    if (typeof zoteroData == "undefined") {
        zoteroData = {};
    }
    if (window.nonZendPage === true) {
        return;
    }
    Zotero.state.parseUrlVars();
    Zotero.config.startPageTitle = document.title;
    var t;
    if (typeof sessionStorage == "undefined") {
        t = {};
    } else {
        t = sessionStorage;
    }
    Zotero.cache = new Zotero.Cache(t);
    Zotero.store = t;
    Zotero.preferences = new Zotero.Preferences(Zotero.store, "global");
    Zotero.preferences.defaults = J.extend({}, Zotero.preferences.defaults, Zotero.config.defaultPrefs);
    var r = "en-US";
    if (zoteroData.locale) {
        r = zoteroData.locale;
    }
    if (Zotero.config.pageClass == "user_library" || Zotero.config.pageClass == "group_library" || Zotero.config.pageClass == "my_library") {
        Z.debug("library page - ", 3);
        Zotero.state.libraryString = Zotero.utils.libraryString(Zotero.config.librarySettings.libraryType, Zotero.config.librarySettings.libraryID);
        Zotero.state.filter = Zotero.state.libraryString;
        Zotero.Item.prototype.getItemTypes(r);
        Zotero.Item.prototype.getItemFields(r);
        Zotero.Item.prototype.getCreatorFields(r);
        Zotero.Item.prototype.getCreatorTypes();
    } else {
        Z.debug("non-library page", 3);
    }
    Zotero.ui.init.all();
    J.ajaxSettings.traditional = true;
    if (Zotero.state.getUrlVar("proxy") == "false") {
        Zotero.config.proxy = false;
    }
    window.onpopstate = function() {
        Z.debug("popstate", 3);
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

Zotero.State.prototype.rewriteAltUrl = function() {
    Z.debug("rewriteAltUrl");
    var e = this;
    var t = false;
    var r = false;
    var a = false;
    var o = false;
    var i = Zotero.config.nonparsedBaseUrl;
    var n = window.location.pathname;
    var s = new RegExp(".*" + i + "/?");
    var l = /^.*\/items\/collections?\/([A-Z0-9]{8})(?:\/[A-Z0-9]{8})?$/;
    var c = /^.*\/items\/([A-Z0-9]{8})$/;
    switch (true) {
      case l.test(n):
        t = l.exec(n);
        a = t[1];
        r = t[2];
        o = true;
        break;

      case c.test(n):
        t = c.exec(n);
        r = t[1];
        o = true;
        break;
    }
    if (a) {
        e.setUrlVar("collectionKey", a);
    }
    if (r) {
        e.setUrlVar("itemKey", r);
    }
    if (o) {
        e.replaceState();
    }
};

Zotero.State.prototype.updateCurState = function() {
    var e = this;
    e.curState = J.extend({}, e.f, e.q, e.pathVars);
    return;
};

Zotero.State.prototype.savePrevState = function() {
    var e = this;
    e.prevState = e.curState;
    return;
};

Zotero.State.prototype.getSelectedItemKeys = function() {
    var e = this;
    var t = {};
    var r = [];
    J.each(e.selectedItemKeys, function(e, r) {
        t[r] = true;
    });
    J.each(t, function(e, t) {
        r.push(e);
    });
    if (r.length === 0 && e.getUrlVar("itemKey")) {
        r.push(e.getUrlVar("itemKey"));
    }
    return r;
};

Zotero.State.prototype.toggleItemSelected = function(e) {
    var t = this;
    var r = [];
    var a = false;
    var o = t.getSelectedItemKeys();
    J.each(o, function(t, o) {
        if (o == e) {
            a = true;
        } else {
            r.push(o);
        }
    });
    if (!a) {
        r.push(e);
    }
    t.selectedItemKeys = r;
};

Zotero.State.prototype.pushTag = function(e) {
    Z.debug("Zotero.State.pushTag", 3);
    var t = this;
    if (t.pathVars["tag"]) {
        if (t.pathVars["tag"] instanceof Array) {
            t.pathVars["tag"].push(e);
        } else {
            var r = t.pathVars["tag"];
            t.pathVars["tag"] = [ r, e ];
        }
    } else {
        t.pathVars["tag"] = [ e ];
    }
    return;
};

Zotero.State.prototype.popTag = function(e) {
    Z.debug("Zotero.State.popTag", 3);
    var t = this;
    if (!t.pathVars["tag"]) {
        return;
    } else if (t.pathVars["tag"] instanceof Array) {
        var r = t.pathVars["tag"].filter(function(t, r, a) {
            return t != e;
        });
        t.pathVars["tag"] = r;
        return;
    } else if (t.pathVars["tag"] == e) {
        t.pathVars["tag"] = [];
        return;
    }
};

Zotero.State.prototype.toggleTag = function(e) {
    Z.debug("Zotero.State.toggleTag", 3);
    var t = this;
    if (!t.pathVars["tag"]) {
        t.pathVars["tag"] = [ e ];
        return;
    } else if (J.isArray(t.pathVars["tag"])) {
        if (J.inArray(e, t.pathVars["tag"]) != -1) {
            var r = t.pathVars["tag"].filter(function(t, r, a) {
                return t != e;
            });
            t.pathVars["tag"] = r;
            return;
        } else {
            t.pathVars["tag"].push(e);
            return;
        }
    } else if (t.pathVars["tag"] == e) {
        t.pathVars["tag"] = [];
        return;
    } else if (typeof t.pathVars["tag"] == "string") {
        var a = t.pathVars["tag"];
        t.pathVars["tag"] = [ a, e ];
        return;
    }
};

Zotero.State.prototype.unsetUrlVar = function(e) {
    Z.debug("Zotero.State.unsetUrlVar", 3);
    var t = this;
    if (t.pathVars[e]) {
        delete t.pathVars[e];
    }
};

Zotero.State.prototype.clearUrlVars = function(e) {
    Z.debug("Zotero.State.clearUrlVars", 3);
    var t = this;
    if (!e) {
        e = [];
    }
    var r = t.pathVars;
    J.each(r, function(t, a) {
        if (J.inArray(t, e) == -1) {
            delete r[t];
        }
    });
};

Zotero.State.prototype.parseUrlVars = function() {
    Z.debug("Zotero.State.parseUrlVars", 3);
    var e = this;
    if (!e.useLocation) return;
    e.q = J.deparam(J.param.querystring());
    e.f = e.parseFragmentVars();
    e.pathVars = e.parsePathVars();
};

Zotero.State.prototype.parsePathVars = function(e) {
    Z.debug("Zotero.State.parsePathVars", 3);
    var t = this;
    var r = window.history;
    if (!e) {
        e = window.location.pathname;
    }
    var a = Zotero.config.nonparsedBaseUrl;
    var o = [];
    var i = new RegExp(".*" + a + "/?");
    var n = e.replace(i, "");
    o = n.split("/");
    var s = {};
    for (var l = 0; l < o.length - 1; l = l + 2) {
        var c = s[o[l]];
        if (c) {
            if (c instanceof Array) {
                c.push(decodeURIComponent(o[l + 1]));
            } else {
                var d = [ c ];
                d.push(decodeURIComponent(o[l + 1]));
                c = d;
            }
        } else {
            c = decodeURIComponent(o[l + 1]);
        }
        s[o[l]] = c;
    }
    if (s["itemkey"]) {
        var u = s["itemkey"];
        s["itemKey"] = u;
        delete s["itemkey"];
    }
    return s;
};

Zotero.State.prototype.parseFragmentVars = function() {
    var e = this;
    var t = {};
    var r = J.param.fragment();
    var a = r.split("/");
    for (var o = 0; o < a.length - 1; o = o + 2) {
        t[a[o]] = a[o + 1];
    }
    return t;
};

Zotero.State.prototype.buildUrl = function(e, t, r) {
    var a = this;
    if (typeof r === "undefined") {
        r = false;
    }
    if (typeof t === "undefined") {
        t = false;
    }
    var o = Zotero.config.nonparsedBaseUrl + "/";
    var i = [];
    J.each(e, function(e, t) {
        if (!t) {
            return;
        } else if (t instanceof Array) {
            J.each(t, function(t, r) {
                i.push(e + "/" + encodeURIComponent(r));
            });
        } else {
            i.push(e + "/" + encodeURIComponent(t));
        }
    });
    i.sort();
    var n = [];
    J.each(t, function(e, t) {
        if (!t) {
            return;
        } else if (t instanceof Array) {
            J.each(t, function(t, r) {
                n.push(e + "=" + encodeURIComponent(r));
            });
        } else {
            n.push(e + "=" + encodeURIComponent(t));
        }
    });
    n.sort();
    var s = i.join("/");
    var l = "";
    if (n.length) {
        l = "?" + n.join("&");
    }
    var c = o + s + l;
    return c;
};

Zotero.State.prototype.mutateUrl = function(e, t) {
    var r = this;
    if (!e) {
        e = {};
    }
    if (!t) {
        t = [];
    }
    var a = J.extend({}, r.pathVars);
    J.each(e, function(e, t) {
        a[e] = t;
    });
    J.each(t, function(e, t) {
        delete a[t];
    });
    var o = r.buildUrl(a, false);
    return o;
};

Zotero.State.prototype.pushState = function() {
    Z.debug("Zotero.State.pushState", 3);
    var e = this;
    var t = window.history;
    e.prevHref = e.curHref || window.location.href;
    var r = J.extend({}, e.f, e.q, e.pathVars);
    var a = e.pathVars;
    var o = e.q;
    var i = e.buildUrl(a, o, false);
    e.curHref = i;
    Z.debug("about to push url: " + i, 3);
    if (e.useLocation) {
        if (e.replacePush === true) {
            Z.debug("Zotero.State.pushState - replacePush", 3);
            e.replacePush = false;
            t.replaceState(r, document.title, i);
        } else {
            Z.debug("Zotero.State.pushState - pushState", 3);
            t.pushState(r, document.title, i);
            e.stateChanged();
        }
    } else {
        e.stateChanged();
    }
    Zotero.debug("leaving pushstate", 3);
};

Zotero.State.prototype.replaceState = function() {
    Z.debug("Zotero.State.replaceState", 3);
    var e = this;
    var t = window.history;
    e.updateCurState();
    var r = J.extend({}, e.curState);
    var a = e.pathVars;
    var o = e.buildUrl(a, false);
    if (e.useLocation) {
        t.replaceState(r, null, o);
        e.curHref = o;
    } else {
        e.curHref = o;
    }
};

Zotero.State.prototype.updateStateTitle = function(e) {
    Zotero.debug("Zotero.State.updateStateTitle", 3);
    var t = this;
    document.title = e;
};

Zotero.State.prototype.getUrlVar = function(e) {
    var t = this;
    if (t.pathVars.hasOwnProperty(e) && t.pathVars[e] !== "") {
        return t.pathVars[e];
    } else if (t.f.hasOwnProperty(e)) {
        return t.f[e];
    } else if (t.q.hasOwnProperty(e)) {
        return t.q[e];
    }
    return undefined;
};

Zotero.State.prototype.setUrlVar = function(e, t) {
    var r = this;
    r.pathVars[e] = t;
};

Zotero.State.prototype.getUrlVars = function() {
    var e = this;
    var t = J.deparam(J.param.querystring());
    return J.extend(true, {}, e.pathVars, t, J.deparam(J.param.fragment()));
};

Zotero.State.prototype.setFragmentVar = function(e, t) {
    var r = this;
    r.f[e] = t;
};

Zotero.State.prototype.setQueryVar = function(e, t) {
    var r = this;
    if (t === "") {
        delete r.q[e];
    } else {
        r.q[e] = t;
    }
};

Zotero.State.prototype.addQueryVar = function(e, t) {
    var r = this;
    if (r.q.hasOwnProperty(e)) {
        if (J.isArray(r.q[e])) {
            r.q[e].push(t);
        } else {
            var a = [ r.q[e], t ];
            r.q[e] = a;
        }
    } else {
        r.q[e] = t;
    }
    return r.q[e];
};

Zotero.State.prototype.updateFragment = function(e) {
    var t = this;
    Z.debug("updateFragment", 3);
    J.bbq.pushState(e, 0);
};

Zotero.State.prototype.popstateCallback = function(e) {
    var t = this;
    Z.debug("===== popstateCallback =====", 3);
    var r = window.history;
    t.prevHref = t.curHref;
    Z.debug("new href, updating href and processing urlchange", 3);
    t.curHref = window.location.href;
    t.parseUrlVars();
    t.stateChanged(e);
};

Zotero.State.prototype.stateChanged = function(e) {
    var t = this;
    Z.debug("stateChanged", 3);
    t.savePrevState();
    t.updateCurState();
    Z.debug("Checking changed variables", 3);
    var r = t.diffState(t.prevHref, t.curHref);
    var a = {};
    J.each(r, function(e, r) {
        var o = r + "Changed";
        Z.debug(o, 3);
        if (Zotero.eventful.eventMap.hasOwnProperty(o)) {
            J.each(Zotero.eventful.eventMap[o], function(e, t) {
                if (!a.hasOwnProperty(t)) {
                    a[t] = 1;
                }
            });
        }
        Z.debug("State Filter: " + t.filter, 3);
        Zotero.trigger(o, {}, t.filter);
    });
    J.each(a, function(e, r) {
        Z.debug("State Filter: " + t.filter, 3);
        Zotero.trigger(e, {}, t.filter);
    });
    Z.debug("===== stateChanged Done =====", 3);
};

Zotero.State.prototype.diffState = function(e, t) {
    Z.debug("Zotero.State.diffState", 3);
    var r = this;
    var a = J.extend({}, r.parsePathVars(e));
    var o = J.extend({}, r.parsePathVars(t));
    var i = [ "start", "limit", "order", "sort", "content", "format", "q", "fq", "itemType", "itemKey", "collectionKey", "searchKey", "locale", "tag", "tagType", "key", "style", "session", "newer", "since", "itemPage", "mode" ];
    var n = [];
    J.each(i, function(e, t) {
        if (a.hasOwnProperty(t) || o.hasOwnProperty(t)) {
            if (a[t] != o[t]) {
                n.push(t);
            }
        }
    });
    return n;
};

Zotero.Delay = function(e) {
    return new Promise(function(t, r) {
        setTimeout(function() {
            t();
        }, e);
    });
};

Zotero.widgets = {};

Zotero.eventful = {};

Zotero.eventful.events = [ "collectionsDirty", "tagsChanged", "displayedItemsChanged", "displayedItemChanged", "selectedItemsChanged", "showCitations", "showSettings", "exportItems", "libraryTagsUpdated", "uploadSuccessful", "refreshGroups", "clearLibraryQuery", "libraryItemsUpdated", "citeItems", "itemTypeChanged", "addTag", "showChildren", "selectCollection", "selectedCollectionChanged", "libraryCollectionsUpdated", "loadItemsDone", "collectionsChanged", "tagsChanged", "itemsChanged", "loadedCollectionsProcessed", "deleteProgress", "settingsLoaded", "cachedDataLoaded", "createItem", "newItem", "addToCollectionDialog", "removeFromCollection", "moveToTrash", "removeFromTrash", "toggleEdit", "clearLibraryQuery", "librarySettingsDialog", "citeItems", "exportItemsDialog", "syncLibrary", "createCollectionDialog", "updateCollectionDialog", "deleteCollectionDialog", "showMoreTags", "showFewerTags", "indexedDBError" ];

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
    J(".eventfulwidget").each(function(e, t) {
        var r = J(t).data("widget");
        if (r && Zotero.ui.widgets[r]) {
            if (Zotero.ui.widgets[r]["init"]) {
                Z.debug("eventfulwidget init: " + r, 3);
                Zotero.ui.widgets[r].init(t);
            }
        }
    });
    Zotero.eventful.initTriggers();
};

Zotero.eventful.initTriggers = function(e) {
    Zotero.debug("Zotero.eventful.initTriggers", 3);
    if (!e) {
        e = J("html");
    }
    var t = function(e) {
        Z.debug("triggerOnEvent", 3);
        e.preventDefault();
        var t = J(e.delegateTarget);
        eventName = t.data("triggers");
        Z.debug("eventName: " + eventName, 3);
        var r = t.data("library") || "";
        Zotero.trigger(eventName, {
            triggeringElement: e.currentTarget
        }, r);
    };
    J(e).find(".eventfultrigger").each(function(e, r) {
        if (J(r).data("triggerbound")) {
            return;
        }
        var a = J(r).data("event");
        if (a) {
            Z.debug("binding " + a + " on " + r.tagName, 3);
            J(r).on(a, t);
        } else {
            J(r).on("click", t);
        }
        J(r).data("triggerbound", true);
    });
};

Zotero.ui.formatItemField = function(e, t, r) {
    if (typeof r == "undefined") {
        r = false;
    }
    var a = {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: false
    };
    var o;
    if (window.Intl) {
        var i = new window.Intl.DateTimeFormat(undefined, a);
        o = i.format;
    } else {
        o = function(e) {
            return e.toLocaleString();
        };
    }
    var n = 0;
    var s = "";
    var l;
    if (Zotero.config.maxFieldSummaryLength[e]) {
        n = Zotero.config.maxFieldSummaryLength[e];
    }
    switch (e) {
      case "itemType":
        s = Zotero.localizations.typeMap[t.apiObj.data.itemType];
        break;

      case "dateModified":
        if (!t.apiObj.data["dateModified"]) {
            s = "";
        }
        l = Zotero.utils.parseApiDate(t.apiObj.data["dateModified"]);
        if (l) {
            s = o(l);
        } else {
            s = t.apiObj.data["dateModified"];
        }
        break;

      case "dateAdded":
        if (!t.apiObj.data["dateAdded"]) {
            s = "";
        }
        l = Zotero.utils.parseApiDate(t.apiObj.data["dateAdded"]);
        if (l) {
            s = o(l);
        } else {
            s = t.apiObj.data["dateAdded"];
        }
        break;

      case "title":
        s = t.get("title");
        break;

      case "creator":
      case "creatorSummary":
        s = t.get("creatorSummary");
        break;

      case "addedBy":
        if (t.apiObj.meta.createdByUser) {
            if (t.apiObj.meta.createdByUser.name !== "") {
                s = t.apiObj.meta.createdByUser.name;
            } else {
                s = t.apiObj.meta.createdByUser.username;
            }
        }
        break;

      case "modifiedBy":
        if (t.apiObj.meta.lastModifiedByUser) {
            if (t.apiObj.meta.lastModifiedByUser.name !== "") {
                s = t.apiObj.meta.lastModifiedByUser.name;
            } else {
                s = t.apiObj.meta.lastModifiedByUser.username;
            }
        }
        break;

      default:
        var c = typeof t.get(e);
        if (typeof c !== "undefined") {
            s = t.get(e);
        }
    }
    if (typeof s == "undefined") {
        Z.error("formattedString for " + e + " undefined");
        Z.error(t);
    }
    if (r) {
        return Zotero.ui.trimString(s, n);
    } else {
        return s;
    }
};

Zotero.ui.trimString = function(e, t) {
    var r = 35;
    var a = e;
    if (typeof e == "undefined") {
        Z.error("formattedString passed to trimString was undefined.");
        return "";
    }
    if (t) {
        r = t;
    }
    if (r > 0 && a.length > r) {
        return a.slice(0, r) + "…";
    } else {
        return a;
    }
};

Zotero.ui.formatItemDateField = function(e, t) {
    var r;
    var a = {
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: false
    };
    var o = {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: false
    };
    var i;
    var n;
    if (window.Intl) {
        var s = new window.Intl.DateTimeFormat(undefined, o);
        i = s.format;
        var l = new window.Intl.DateTimeFormat(undefined, a);
        n = l.format;
    } else {
        i = function(e) {
            return e.toLocaleDateString();
        };
        n = function(e) {
            return e.toLocaleTimeString();
        };
    }
    switch (e) {
      case "dateModified":
        if (!t.apiObj.data["dateModified"]) {
            return "";
        }
        r = Zotero.utils.parseApiDate(t.apiObj.data["dateModified"]);
        if (r) {
            return "<span class='localized-date-span'>" + i(r) + "</span> <span class='localized-date-span'>" + n(r) + "</span>";
        } else {
            return t.apiObj.data["dateModified"];
        }
        return r.toLocaleString();

      case "dateAdded":
        if (!t.apiObj.data["dateAdded"]) {
            return "";
        }
        r = Zotero.utils.parseApiDate(t.apiObj.data["dateAdded"]);
        if (r) {
            return "<span class='localized-date-span'>" + i(r) + "</span> <span class='localized-date-span'>" + n(r) + "</span>";
        } else {
            return t.apiObj.data["dateAdded"];
        }
        break;
    }
    return "";
};

Zotero.ui.formatItemContentRow = function(e) {
    if (e.field == "date") {
        if (!e.fieldValue) {
            return "";
        }
        var t = Zotero.utils.parseApiDate(e.value);
        if (!t) {
            return e.fieldValue;
        } else {
            return t.toLocaleString();
        }
    } else {
        return e.fieldValue;
    }
};

Zotero.ui.groupUrl = function(e, t) {
    var r;
    if (e.groupType == "Private") {
        r = "/groups/" + e.groupID;
    } else {
        r = "/groups/" + Zotero.utils.slugify(e.groupName);
    }
    var a = "/groups/" + e.groupID;
    Zotero.debug("groupBase: " + r);
    switch (t) {
      case "groupView":
        return r;

      case "groupLibrary":
        return r + "/items";

      case "groupSettings":
        return a + "/settings";

      case "groupMembers":
        return a + "/members";

      case "groupLibrarySettings":
        return a + "/settings/library";

      case "groupMembersSettings":
        return a + "/settings/members";
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

      case "default":    }
    Zotero.ui.init.libraryTemplates();
    Zotero.eventful.initWidgets();
    Zotero.ui.init.rte();
};

Zotero.ui.init.library = function() {};

Zotero.ui.init.rte = function(e, t, r) {
    Z.debug("init.rte", 3);
    if (Zotero.config.rte == "ckeditor") {
        Zotero.ui.init.ckeditor(e, t, r);
        return;
    } else {
        Zotero.ui.init.tinyMce(e, t, r);
    }
};

Zotero.ui.init.ckeditor = function(e, t, r) {
    Z.debug("init.ckeditor", 3);
    if (!e) {
        e = "default";
    }
    if (!r) {
        r = J("body");
    }
    var a = {};
    a.toolbarGroups = [ {
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
    var o = {};
    o.toolbarGroups = [ {
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
    var i = {};
    i.toolbarGroups = [];
    i.readOnly = true;
    var n;
    if (e == "nolinks") {
        n = J.extend(true, {}, o);
    } else if (e == "readonly") {
        n = J.extend(true, {}, i);
    } else {
        n = J.extend(true, {}, a);
    }
    if (t) {
        n.startupFocus = true;
    }
    Z.debug("initializing CK editors", 3);
    if (J(r).is(".rte")) {
        Z.debug("RTE textarea - " + ind + " - " + J(r).attr("name"), 3);
        var s = J(r).attr("name");
        if (!CKEDITOR.instances[s]) {
            var l = CKEDITOR.replace(J(r), n);
        }
    } else {
        Z.debug("not a direct rte init");
        Z.debug(r);
        J(r).find("textarea.rte").each(function(e, t) {
            Z.debug("RTE textarea - " + e + " - " + J(t).attr("name"), 3);
            var r = J(t).attr("name");
            if (!CKEDITOR.instances[r]) {
                var a = CKEDITOR.replace(t, n);
            }
        });
    }
};

Zotero.ui.init.tinyMce = function(e, t, r) {
    Z.debug("init.tinyMce", 3);
    if (!e) {
        e = "default";
    }
    var a = "specific_textareas";
    if (r) {
        a = "exact";
    } else {
        r = "";
    }
    var o = {
        mode: a,
        elements: r,
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
    if (t) {
        o.init_instance_callback = function(e) {
            Z.debug("inited " + e.editorId);
            e.focus();
        };
    }
    if (e != "nolinks") {
        o.theme_advanced_buttons1 += ",link";
    }
    if (e == "nolinks") {
        o.editor_selector = "nolinks";
    }
    if (e == "readonly") {
        o.readonly = 1;
        o.editor_selector = "readonly";
    }
    tinymce.init(o);
    return o;
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
        multiplyChar: function(e, t) {
            return Array(t).join(e);
        },
        displayInDetails: function(e, t) {
            if (J.inArray(e, t.hideFields) == -1 && t.fieldMap.hasOwnProperty(e) && J.inArray(e, [ "itemType", "title", "creators", "notes" ]) == -1) {
                return true;
            }
            return false;
        },
        nonEditable: function(e, t) {
            if (J.inArray(e, t.noEditFields) !== -1) {
                return true;
            }
        }
    });
    J.views.tags({
        coloredTags: {
            template: "{{for ~tag.tagCtx.args[0].matchColoredTags(~tag.tagCtx.args[1]) tmpl='#coloredtagTemplate' /}}"
        }
    });
};

Zotero.ui.saveItem = function(e) {
    Z.debug("pre writeItem debug", 4);
    Z.debug(e, 4);
    var t = e.owningLibrary;
    var r = e.writeItem().then(function(t) {
        Z.debug("item write finished", 3);
        if (e.writeFailure) {
            Z.error("Error writing item:" + e.writeFailure.message);
            Zotero.ui.jsNotificationMessage("Error writing item", "error");
            throw new Error("Error writing item:" + e.writeFailure.message);
        }
    });
    Z.debug("adding new tags to library tags", 3);
    var a = t.tags;
    var o = e.apiObj.data.tags;
    J.each(o, function(e, t) {
        var r = t.tag;
        if (!a.tagObjects.hasOwnProperty(r)) {
            var o = new Zotero.Tag(t);
            a.addTag(o);
        }
    });
    a.updateSecondaryData();
    return r;
};

Zotero.ui.itemTypeClass = function(e) {
    var t = e.apiObj.data.itemType;
    if (e.apiObj.data.itemType == "attachment") {
        if (e.mimeType == "application/pdf") {
            t += "-pdf";
        } else {
            switch (e.linkMode) {
              case 0:
                t += "-file";
                break;

              case 1:
                t += "-file";
                break;

              case 2:
                t += "-snapshot";
                break;

              case 3:
                t += "-web-link";
                break;
            }
        }
    }
    return "img-" + t;
};

Zotero.ui.getAssociatedLibrary = function(e) {
    Z.debug("Zotero.ui.getAssociatedLibrary", 3);
    var t;
    if (typeof e == "undefined") {
        t = J(".zotero-library").first();
    } else {
        t = J(e);
        if (t.length === 0 || t.is("#eventful")) {
            t = J(".zotero-library").first();
            if (t.length === 0) {
                Z.debug("No element passed and no default found for getAssociatedLibrary.");
                throw new Error("No element passed and no default found for getAssociatedLibrary.");
            }
        }
    }
    var r = t.data("zoterolibrary");
    var a;
    if (!r) {
        a = J(e).data("library");
        if (a) {
            r = Zotero.ui.libStringLibrary(a);
        }
        t.data("zoterolibrary", r);
    }
    if (!r) {
        t = J(".zotero-library").first();
        a = t.data("library");
        if (a) {
            r = Zotero.ui.libStringLibrary(a);
        }
    }
    if (!r) {
        Z.error("No associated library found");
    }
    return r;
};

Zotero.ui.libStringLibrary = function(e) {
    var t;
    if (Zotero.libraries.hasOwnProperty(e)) {
        t = Zotero.libraries[e];
    } else {
        var r = Zotero.utils.parseLibString(e);
        t = new Zotero.Library(r.libraryType, r.libraryID);
        Zotero.libraries[e] = t;
    }
    return t;
};

Zotero.ui.getEventLibrary = function(e) {
    var t = J(e.triggeringElement);
    if (e.library) {
        return e.library;
    }
    if (e.data && e.data.library) {
        return e.data.library;
    }
    Z.debug(e);
    var r = t.data("library");
    if (!r) {
        throw "no library on event or libString on triggeringElement";
    }
    if (Zotero.libraries.hasOwnProperty(r)) {
        return Zotero.libraries[r];
    }
    var a = Zotero.ui.parseLibString(r);
    library = new Zotero.Library(a.libraryType, a.libraryID, "");
    Zotero.libraries[Zotero.utils.libraryString(libraryType, libraryID)] = library;
};

Zotero.ui.getPrioritizedVariable = function(e, t) {
    var r = Zotero.state.getUrlVar(e) || Zotero.preferences.getPref(e) || Zotero.config.defaultApiArgs[e] || t;
    return r;
};

Zotero.ui.scrollToTop = function() {
    window.scrollBy(0, -5e3);
};

Zotero.ui.parentWidgetEl = function(e) {
    var t;
    if (e.hasOwnProperty("data") && e.data.hasOwnProperty("widgetEl")) {
        Z.debug("event had widgetEl associated with it");
        return J(e.data.widgetEl);
    } else if (e.hasOwnProperty("currentTarget")) {
        Z.debug("event currentTarget set");
        t = J(e.currentTarget).closest(".eventfulwidget");
        if (t.length > 0) {
            return t.first();
        } else {
            Z.debug("no matching closest to currentTarget");
            Z.debug(e.currentTarget);
            Z.debug(e.currentTarget);
        }
    }
    t = J(e).closest(".eventfulwidget");
    if (t.length > 0) {
        Z.debug("returning first closest widget");
        return t.first();
    }
    return null;
};

Zotero.ui.getSelectedItemKeys = function(e) {
    Z.debug("Zotero.ui.getSelectedItemKeys", 3);
    if (!e) {
        e = J("body");
    } else {
        e = J(e);
    }
    var t = [];
    var r = Zotero.state.getUrlVar("itemKey");
    if (r && Zotero.config.preferUrlItem !== false) {
        t.push(r);
    } else {
        e.find("input.itemKey-checkbox:checked").each(function(e, r) {
            t.push(J(r).data("itemkey"));
        });
    }
    return t;
};

Zotero.ui.getAllFormItemKeys = function(e) {
    Z.debug("Zotero.ui.getAllFormItemKeys", 3);
    if (!e) {
        e = J("body");
    } else {
        e = J(e);
    }
    var t = [];
    var r = Zotero.state.getUrlVar("itemKey");
    e.find("input.itemKey-checkbox").each(function(e, r) {
        t.push(J(r).data("itemkey"));
    });
    return t;
};

Zotero.ui.getRte = function(e) {
    Z.debug("getRte", 3);
    Z.debug("getRte", 3);
    Z.debug(e);
    switch (Zotero.config.rte) {
      case "ckeditor":
        return CKEDITOR.instances[e].getData();

      default:
        return tinyMCE.get(e).getContent();
    }
};

Zotero.ui.updateRte = function(e) {
    Z.debug("updateRte", 3);
    switch (Zotero.config.rte) {
      case "ckeditor":
        var t = "#" + e;
        data = CKEDITOR.instances[e].getData();
        J(t).val(data);
        break;

      default:
        tinyMCE.updateContent(e);
    }
};

Zotero.ui.deactivateRte = function(e) {
    Z.debug("deactivateRte", 3);
    switch (Zotero.config.rte) {
      case "ckeditor":
        if (CKEDITOR.instances[e]) {
            Z.debug("deactivating " + e, 3);
            data = CKEDITOR.instances[e].destroy();
        }
        break;

      default:
        tinymce.execCommand("mceRemoveControl", true, e);
    }
};

Zotero.ui.cleanUpRte = function(e) {
    Z.debug("cleanUpRte", 3);
    J(e).find("textarea.rte").each(function(e, t) {
        Zotero.ui.deactivateRte(J(t).attr("name"));
    });
};

Zotero.ui.jsNotificationMessage = function(e, t, r) {
    Z.debug("notificationMessage: " + t + " : " + e, 3);
    if (Zotero.config.suppressErrorNotifications) return;
    if (!r && r !== false) {
        r = 5;
    }
    var a = "alert-info";
    if (t) {
        switch (t) {
          case "error":
          case "danger":
            a = "alert-danger";
            r = false;
            break;

          case "success":
          case "confirm":
            a = "alert-success";
            break;

          case "info":
            a = "alert-info";
            break;

          case "warning":
          case "warn":
            a = "alert-warning";
            break;
        }
    }
    if (r) {
        J("#js-message").append("<div class='alert alert-dismissable " + a + "'><button type='button' class='close' data-dismiss='alert'><span aria-hidden='true'>&times;</span><span class='sr-only'>Close</span></button>" + e + "</div>").children("div").delay(parseInt(r, 10) * 1e3).slideUp().delay(300).queue(function() {
            J(this).remove();
        });
    } else {
        J("#js-message").append("<div class='alert alert-dismissable " + a + "'><button type='button' class='close' data-dismiss='alert'><span aria-hidden='true'>&times;</span><span class='sr-only'>Close</span></button>" + e + "</div>");
    }
};

Zotero.ui.ajaxErrorMessage = function(e) {
    Z.debug("Zotero.ui.ajaxErrorMessage", 3);
    if (typeof e == "undefined") {
        Z.debug("ajaxErrorMessage called with undefined argument");
        return "";
    }
    Z.debug(e, 3);
    switch (e.status) {
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
        Z.debug(e.status);
    }
    return "";
};

Zotero.ui.showSpinner = function(e, t) {
    var r = Zotero.config.baseWebsiteUrl + "/static/images/theme/broken-circle-spinner.gif";
    if (!t) {
        J(e).html("<img class='spinner' src='" + r + "'/>");
    } else if (t == "horizontal") {
        J(e).html("<img class='spinner' src='" + r + "'/>");
    }
};

Zotero.ui.appendSpinner = function(e) {
    var t = Zotero.config.baseWebsiteUrl + "static/images/theme/broken-circle-spinner.gif";
    J(e).append("<img class='spinner' src='" + t + "'/>");
};

Zotero.ui.fixTableHeaders = function(e) {
    var t = J(e);
    var r = [];
    t.find("thead th").each(function(e, t) {
        var a = J(t).width();
        r.push(a);
        J(t).width(a);
    });
    t.find("tbody>tr:first>td").each(function(e, t) {
        J(t).width(r[e]);
    });
    var a = t.find("thead").height();
    t.find("thead").css("position", "fixed").css("margin-top", -a).css("background-color", "white").css("z-index", 10);
    t.find("tbody").css("margin-top", a);
    t.css("margin-top", a);
};

Zotero.ui.zoteroItemUpdated = function() {
    try {
        var e = document.createEvent("HTMLEvents");
        e.initEvent("ZoteroItemUpdated", true, true);
        document.dispatchEvent(e);
    } catch (t) {
        Zotero.debug("Error triggering ZoteroItemUpdated event");
    }
};

Zotero.ui.dialog = function(e, t) {
    Z.debug("Zotero.ui.dialog", 3);
    t.show = true;
    t.backdrop = false;
    J(e).modal(t);
    J(e).modal("show");
    Z.debug("exiting Zotero.ui.dialog", 3);
};

Zotero.ui.closeDialog = function(e) {
    J(e).modal("hide");
};

Zotero.ui.widgets.citeItemDialog = {};

Zotero.ui.widgets.citeItemDialog.init = function(e) {
    Z.debug("citeItemDialog widget init", 3);
    var t = Zotero.ui.getAssociatedLibrary(e);
    Zotero.ui.widgets.citeItemDialog.getAvailableStyles();
    t.listen("citeItems", Zotero.ui.widgets.citeItemDialog.show, {
        widgetEl: e
    });
};

Zotero.ui.widgets.citeItemDialog.show = function(e) {
    Z.debug("citeItemDialog.show", 3);
    var t = J(e.triggeringElement);
    var r = false;
    var a = [];
    var o;
    if (e.hasOwnProperty("zoteroItems")) {
        r = true;
        J.each(e.zoteroItems, function(e, t) {
            var r = t.cslItem();
            a.push(r);
        });
    } else {
        o = Zotero.ui.getAssociatedLibrary(t);
    }
    var i = J(e.data.widgetEl).empty();
    i.html(J("#citeitemdialogTemplate").render({
        freeStyleInput: true
    }));
    var n = i.find(".cite-item-dialog");
    var s = function(t) {
        Z.debug("citeFunction", 3);
        var i = J(e.currentTarget);
        var s = "";
        if (i.is(".cite-item-select, input.free-text-style-input")) {
            s = i.val();
        } else {
            s = n.find(".cite-item-select").val();
            var l = n.find("input.free-text-style-input").val();
            if (J.inArray(l, Zotero.styleList) !== -1) {
                s = l;
            }
        }
        if (!r) {
            var c = Zotero.state.getSelectedItemKeys();
            if (c.length === 0) {
                c = Zotero.state.getSelectedItemKeys();
            }
            Z.debug(c, 4);
            o.loadFullBib(c, s).then(function(e) {
                n.find(".cite-box-div").html(e);
            }).catch(Zotero.catchPromiseError);
        } else {
            Zotero.ui.widgets.citeItemDialog.directCite(a, s).then(function(e) {
                n.find(".cite-box-div").html(e);
            }).catch(Zotero.catchPromiseError);
        }
    };
    n.find(".cite-item-select").on("change", s);
    n.find("input.free-text-style-input").on("change", s);
    Zotero.ui.widgets.citeItemDialog.getAvailableStyles();
    n.find("input.free-text-style-input").typeahead({
        local: Zotero.styleList,
        limit: 10
    });
    Zotero.ui.dialog(n, {});
    return false;
};

Zotero.ui.widgets.citeItemDialog.getAvailableStyles = function() {
    if (!Zotero.styleList) {
        Zotero.styleList = [];
        J.getJSON(Zotero.config.styleListUrl, function(e) {
            Zotero.styleList = e;
        });
    }
};

Zotero.ui.widgets.citeItemDialog.directCite = function(e, t) {
    var r = {};
    r.items = e;
    var a = Zotero.config.citationEndpoint + "?linkwrap=1&style=" + t;
    return J.post(a, JSON.stringify(r));
};

Zotero.ui.widgets.citeItemDialog.buildBibString = function(e) {
    var t = e.bibliography[0];
    var r = e.bibliography[1];
    var a = t.bibstart;
    for (var o = 0; o < r.length; o++) {
        a += r[o];
    }
    a += t.bibend;
    return a;
};

Zotero.ui.widgets.feedlink = {};

Zotero.ui.widgets.feedlink.init = function(e) {
    var t = Zotero.ui.getAssociatedLibrary(e);
    t.listen("displayedItemsChanged", Zotero.ui.widgets.feedlink.recalcFeedlink, {
        widgetEl: e
    });
};

Zotero.ui.widgets.feedlink.recalcFeedlink = function(e) {
    Z.debug("Zotero eventful loadFeedLinkCallback", 3);
    var t = J(e.data.widgetEl);
    var r = Zotero.ui.getAssociatedLibrary(t);
    var a = Zotero.ui.getItemsConfig(r);
    var o = Zotero.ajax.apiRequestUrl(a) + Zotero.ajax.apiQueryString(a, false);
    var i = o.replace(Zotero.config.baseApiUrl, Zotero.config.baseFeedUrl);
    var n = Zotero.url.requestReadApiKeyUrl(r.libraryType, r.libraryID, i);
    t.data("urlconfig", a);
    if (!Zotero.config.librarySettings.publish) {
        J(".feed-link").attr("href", n);
    } else {
        J(".feed-link").attr("href", i);
    }
    J("#library link[rel='alternate']").attr("href", i);
};

Zotero.ui.widgets.groups = {};

Zotero.ui.widgets.groups.init = function(e) {
    Z.debug("groups widget init", 3);
    var t = new Zotero.Groups();
    if (Zotero.config.loggedIn && Zotero.config.loggedInUserID) {
        Zotero.ui.showSpinner(J(e), "horizontal");
        var r = t.fetchUserGroups(Zotero.config.loggedInUserID).then(function(t) {
            var r = t.fetchedGroups;
            Zotero.ui.widgets.groups.displayGroupNuggets(e, r);
        }).catch(Zotero.catchPromiseError);
    }
};

Zotero.ui.widgets.groups.userGroupsDisplay = function(e) {
    var t = "";
    J.each(e.groupsArray, function(e, r) {
        t += Zotero.ui.groupNugget(r);
    });
    return t;
};

Zotero.ui.widgets.groups.displayGroupNuggets = function(e, t) {
    Z.debug("Zotero.ui.widgets.groups.displayGroupNuggets", 3);
    var r = J(e);
    r.empty();
    if (t.length === 0) {
        r.append("<p>You are not currently a member of any groups.</p>");
        J("#groups-blurb").removeClass("hidden");
    } else {
        J.each(t, function(e, t) {
            var a = Zotero.config.loggedInUserID;
            var o = false;
            var i = 1;
            if (t.apiObj.data.members) {
                i += t.apiObj.data.members.length;
            }
            if (t.apiObj.data.admins) {
                i += t.apiObj.data.admins.length;
            }
            if (a && (a == t.apiObj.data.owner || J.inArray(a, t.apiObj.data.admins) != -1)) {
                o = true;
            }
            var n = {
                group: t,
                groupViewUrl: Zotero.url.groupViewUrl(t),
                groupLibraryUrl: Zotero.url.groupLibraryUrl(t),
                groupSettingsUrl: Zotero.url.groupSettingsUrl(t),
                groupLibrarySettingsUrl: Zotero.url.groupLibrarySettingsUrl(t),
                groupMemberSettingsUrl: Zotero.url.groupMemberSettingsUrl(t),
                memberCount: i,
                groupManageable: o
            };
            r.append(J("#groupnuggetTemplate").render(n));
        });
    }
};

Zotero.ui.widgets.groupsList = {};

Zotero.ui.widgets.groupsList.init = function(e) {
    Z.debug("groupsList widget init", 3);
    var t = Zotero.ui.getAssociatedLibrary(e);
    t.listen("refreshGroups", Zotero.ui.widgets.groupsList.refresh, {
        widgetEl: e
    });
    t.listen("sendToGroup", Zotero.ui.widgets.groupsList.sendToGroup, {
        widgetEl: e
    });
    t.trigger("refreshGroups");
};

Zotero.ui.widgets.groupsList.refresh = function(e) {
    Zotero.debug("Zotero.ui.widgets.groupsList.refresh", 3);
    var t = e.data.widgetEl;
    var r = Zotero.ui.getAssociatedLibrary(t);
    Zotero.ui.showSpinner(t);
    var a = r.groups.fetchUserGroups(r.libraryID).then(function(e) {
        Zotero.ui.widgets.groupsList.render(t, e.fetchedGroups);
    }).catch(Zotero.catchPromiseError);
};

Zotero.ui.widgets.groupsList.render = function(e, t) {
    Z.debug("groupsList render", 3);
    J(e).empty().append(J("#groupslistTemplate").render({
        groups: t
    }));
};

Zotero.ui.widgets.inviteToGroup = {};

Zotero.ui.widgets.inviteToGroup.init = function(e) {
    Z.debug("inviteToGroup widget init", 3);
    var t = new Zotero.Groups();
    if (Zotero.config.loggedIn && Zotero.config.loggedInUserID) {
        var r = t.fetchUserGroups(Zotero.config.loggedInUserID, Zotero.config.apiKey).then(function(t) {
            Zotero.ui.widgets.inviteToGroup.displayInviteForm(e, t.fetchedGroups);
        }).catch(Zotero.catchPromiseError);
    }
};

Zotero.ui.widgets.inviteToGroup.displayInviteForm = function(e, t) {
    Z.debug("Zotero.ui.widgets.inviteToGroup.displayInviteForm", 3);
    Z.debug(e);
    var r = J(e);
    r.empty();
    var a = [];
    J.each(t, function(e, t) {
        Z.debug(t.title);
        var r = Zotero.config.loggedInUserID;
        var o = false;
        if (r && (r == t.apiObj.owner || J.inArray(r, t.apiObj.admins) != -1)) {
            Z.debug("manage group");
            a.push(t);
        }
    });
    var o = {
        groups: a
    };
    Z.debug("rendering form");
    r.append(J("#inviteuserformTemplate").render(o));
    Z.debug("binding on form");
    r.find("form.inviteuserform").on("submit", function(e) {
        Z.debug("inviteUserForm submitted");
        e.preventDefault();
        var t = J(e.target);
        Z.debug(t);
        var r = t.find("#groupID").val();
        var a = t.find("option.selected").html();
        Z.debug(r);
        Z.debug("posting invitation request");
        J.post("/groups/inviteuser", {
            ajax: true,
            groupID: r,
            userID: zoteroData.profileUserID
        }, function(e) {
            Z.debug("got response from inviteuser");
            Zotero.ui.jsNotificationMessage("User has been invited to join " + a, "success");
            if (e == "true") {
                Zotero.ui.jsNotificationMessage("User has been invited to join " + a, "success");
            }
        }, "text");
    });
};

Zotero.ui.widgets.recentItems = {};

Zotero.ui.widgets.recentItems.init = function(e) {
    Z.debug("widgets.recentItems.init");
    var t = Zotero.ui.getAssociatedLibrary(e);
    var r = J(e);
    var a = {
        limit: 10,
        order: "dateModified"
    };
    var o = t.loadItems(a).then(function(e) {
        Z.debug("got items in recentItems");
        r.empty();
        Zotero.ui.widgets.items.displayItems(r, a, e.loadedItems);
    }, function(e) {
        Z.error(e);
        Z.error("error getting items in recentItems");
        var t = Zotero.ui.ajaxErrorMessage(e.jqxhr);
        r.html("<p>" + t + "</p>");
    });
};

Zotero.ui.widgets.itemContainer = {};

Zotero.ui.widgets.itemContainer.init = function(e) {
    Z.debug("itemContainer init", 3);
    var t = Zotero.ui.getAssociatedLibrary(e);
    var r = J(e);
    t.listen("citeItems", Zotero.ui.callbacks.citeItems);
    t.listen("exportItems", Zotero.ui.callbacks.exportItems);
    r.on("click", "#item-details-div .itemTypeSelectButton", function() {
        Z.debug("itemTypeSelectButton clicked", 3);
        var e = J("#itemType").val();
        Zotero.state.pathVars["itemType"] = e;
        Zotero.state.pushState();
        return false;
    });
    r.on("change", "#item-details-div .itemDetailForm #itemTypeSelect", function() {
        Z.debug("itemTypeSelect changed", 3);
        var e = J(this).val();
        Zotero.state.pathVars["itemType"] = e;
        Zotero.state.pushState();
    });
    Zotero.state.bindTagLinks(r);
};

Zotero.ui.widgets.librarysettingsdialog = {};

Zotero.ui.widgets.librarysettingsdialog.init = function(e) {
    Z.debug("librarysettingsdialog widget init", 3);
    var t = Zotero.ui.getAssociatedLibrary(e);
    t.listen("librarySettingsDialog", Zotero.ui.widgets.librarysettingsdialog.show, {
        widgetEl: e
    });
};

Zotero.ui.widgets.librarysettingsdialog.show = function(e) {
    Z.debug("librarysettingsdialog.show", 3);
    var t = J(e.triggeringElement);
    var r = J(e.data["widgetEl"]).empty();
    r.html(J("#librarysettingsdialogTemplate").render({
        columnFields: Zotero.Library.prototype.displayableColumns
    }, {
        fieldMap: Zotero.localizations.fieldMap,
        topString: "Top String"
    }));
    var a = r.find(".library-settings-dialog");
    a.find(".display-column-field-title").prop("checked", true).prop("disabled", true);
    var o = Zotero.ui.getEventLibrary(e);
    var i = o.preferences.getPref("listDisplayedFields");
    var n = o.preferences.getPref("itemsPerPage");
    var s = o.preferences.getPref("showAutomaticTags");
    J.each(i, function(e, t) {
        var r = ".display-column-field-" + t;
        a.find(r).prop("checked", true);
    });
    J("#items-per-page").val(n);
    J("#show-automatic-tags").prop("checked", s);
    var l = J.proxy(function() {
        var e = [];
        a.find(".library-settings-form").find("input.display-column-field:checked").each(function() {
            e.push(J(this).val());
        });
        var t = parseInt(a.find("#items-per-page").val(), 10);
        var r = a.find("#show-automatic-tags:checked").length > 0 ? true : false;
        o.preferences.setPref("listDisplayedFields", e);
        o.preferences.setPref("itemsPerPage", t);
        o.preferences.setPref("showAutomaticTags", r);
        o.preferences.persist();
        Zotero.preferences.setPref("listDisplayedFields", e);
        Zotero.preferences.setPref("itemsPerPage", t);
        Zotero.preferences.setPref("showAutomaticTags", r);
        Zotero.preferences.persist();
        o.trigger("displayedItemsChanged");
        o.trigger("tagsChanged");
        Zotero.ui.closeDialog(a);
    }, this);
    a.find(".saveButton").on("click", l);
    Zotero.ui.dialog(a, {});
};

Zotero.ui.widgets.libraryPreloader = {};

Zotero.ui.widgets.libraryPreloader.init = function(e) {
    Z.debug("preloader init", 3);
    var t = Zotero.ui.getAssociatedLibrary(e);
    t.loadSettings();
    t.listen("deleteIdb", function() {
        t.idbLibrary.deleteDB();
    });
    t.listen("indexedDBError", function() {
        Zotero.ui.jsNotificationMessage("There was an error initializing your library. Some data may not load properly.", "notice");
    });
};

Zotero.ui.widgets.progressModal = {};

Zotero.ui.widgets.progressModal.init = function(e) {
    Z.debug("progressModal widget init", 3);
    Zotero.listen("progressStart", Zotero.ui.widgets.progressModal.show, {
        widgetEl: e
    });
    Zotero.listen("progressUpdate", Zotero.ui.widgets.progressModal.update, {
        widgetEl: e
    });
    Zotero.listen("progressDone", Zotero.ui.widgets.progressModal.done, {
        widgetEl: e
    });
};

Zotero.ui.widgets.progressModal.show = function(e) {
    Z.debug("progressModal.show", 3);
    var t = J(e.triggeringElement);
    var r = J(e.data["widgetEl"]).empty();
    r.html(J("#progressModalTemplate").render({
        progressTitle: e.progressTitle
    }));
    var a = r.find("#progress-modal-dialog");
    Zotero.ui.dialog(a, {});
};

Zotero.ui.widgets.progressModal.update = function(e) {
    Z.debug("progressModal.update", 3);
    var t = J(e.data["widgetEl"]);
    if (!e.progress) {
        throw new Error("No progress set on progressUpdate event");
    }
    var r = e.progress;
    t.find("progress").prop("value", r);
};

Zotero.ui.widgets.progressModal.done = function(e) {
    Z.debug("progressModal.done", 3);
    var t = J(e.data["widgetEl"]);
    var r = t.find("#progress-modal-dialog");
    Zotero.ui.closeDialog(r);
};

Zotero.ui.widgets.panelContainer = {};

Zotero.ui.widgets.panelContainer.init = function(e) {
    Z.debug("panelContainer widget init", 3);
    var t = Zotero.ui.getAssociatedLibrary(e);
    t.listen("displayedItemsChanged showItemsPanel", Zotero.ui.widgets.panelContainer.showPanel, {
        widgetEl: e,
        panelSelector: "#items-panel"
    });
    t.listen("showFiltersPanel", Zotero.ui.widgets.panelContainer.showPanel, {
        widgetEl: e,
        panelSelector: "#left-panel"
    });
    t.listen("showItemPanel displayedItemChanged", Zotero.ui.widgets.panelContainer.showPanel, {
        widgetEl: e,
        panelSelector: "#item-panel"
    });
    Zotero.listen("reflow", Zotero.ui.widgets.panelContainer.reflow, {
        widgetEl: e
    });
    Zotero.ui.widgets.panelContainer.showPanel({
        data: {
            widgetEl: e,
            panelSelector: "#items-panel"
        }
    });
    J(window).on("resize", function() {
        Zotero.ui.widgets.panelContainer.reflow({
            data: {
                widgetEl: e
            }
        });
    });
    J(e).on("click", ".single-cell-item", function() {
        t.trigger("showItemPanel");
    });
};

Zotero.ui.widgets.panelContainer.reflow = function(e) {
    Zotero.ui.widgets.panelContainer.showPanel({
        data: {
            widgetEl: e.data.widgetEl,
            panelSelector: "#items-panel"
        }
    });
    Zotero.ui.fixTableHeaders(J("#field-table"));
};

Zotero.ui.widgets.panelContainer.showPanel = function(e) {
    Z.debug("panelContainer.showPanel", 3);
    var t = J(e.data.widgetEl);
    var r = e.data.panelSelector;
    if (r == "#item-panel" && !Zotero.state.getUrlVar("itemKey")) {
        Z.debug("item-panel selected with no itemKey", 3);
        r = "#items-panel";
    }
    Z.debug("selector:" + r, 3);
    var a = "xs";
    var o = [];
    switch (true) {
      case window.matchMedia("(min-width: 1200px)").matches:
        a = "lg";
        t.find(".panelcontainer-panelcontainer").show().find(".panelcontainer-panel").show();
        break;

      case window.matchMedia("(min-width: 992px)").matches:
        a = "md";
        t.find(".panelcontainer-panelcontainer").show().find(".panelcontainer-panel").show();
        break;

      case window.matchMedia("(min-width: 768px)").matches:
        a = "sm";
        t.find(".panelcontainer-panelcontainer").show().find(".panelcontainer-panel").show();
        if (r == "#item-panel" || r == "#items-panel") {
            t.find(r).siblings(".panelcontainer-panel").hide();
            t.find(r).show();
        }
        break;

      default:
        a = "xs";
        t.find(".panelcontainer-panelcontainer").hide().find(".panelcontainer-panel").hide();
        t.find(r).show().closest(".panelcontainer-panelcontainer").show();
    }
    Z.debug("panelContainer calculated deviceSize: " + a, 3);
    t.find("#panelcontainer-nav li").removeClass("active");
    switch (r) {
      case "#collections-panel":
        t.find("li.collections-nav").addClass("active");
        break;

      case "#left-panel":
        t.find("li.filters-nav").addClass("active");
        break;
    }
};

Zotero.ui.widgets.chooseSortingDialog = {};

Zotero.ui.widgets.chooseSortingDialog.init = function(e) {
    Z.debug("chooseSortingDialog widget init", 3);
    var t = Zotero.ui.getAssociatedLibrary(e);
    t.listen("chooseSortingDialog", Zotero.ui.widgets.chooseSortingDialog.show, {
        widgetEl: e
    });
};

Zotero.ui.widgets.chooseSortingDialog.show = function(e) {
    Z.debug("chooseSortingDialog.show", 3);
    var t = J(e.data.widgetEl).empty();
    var r = Zotero.ui.getAssociatedLibrary(t);
    t.html(J("#choosesortingdialogTemplate").render({}));
    var a = t.find(".choose-sorting-dialog");
    var o = Zotero.ui.getPrioritizedVariable("order", "title");
    var i = Zotero.ui.getPrioritizedVariable("sort", "asc");
    a.find(".sort-column-select").val(o);
    a.find(".sort-order-select").val(i);
    var n = function() {
        var e = a.find(".sort-column-select").val();
        var t = a.find(".sort-order-select").val();
        r.trigger("changeItemSorting", {
            newSortField: e,
            newSortOrder: t
        });
        Zotero.ui.closeDialog(a);
        return false;
    };
    a.find(".saveSortButton").on("click", n);
    Zotero.ui.dialog(a, {});
};

Zotero.ui.widgets.imagePreview = {};

Zotero.ui.widgets.imagePreview.init = function(e) {
    var t = Zotero.ui.getAssociatedLibrary(e);
    t.listen("previewImage", Zotero.ui.widgets.imagePreview.show, {
        widgetEl: e
    });
};

Zotero.ui.widgets.imagePreview.show = function(e) {};

Zotero.ui.widgets.imageGrabber = {};

Zotero.ui.widgets.imageGrabber.init = function(e) {
    Z.debug("imageGrabber.init", 3);
    var t = Zotero.ui.getAssociatedLibrary(e);
    t.listen("grabImage", Zotero.ui.widgets.imageGrabber.grab, {
        widgetEl: e
    });
    t.listen("previewImage", Zotero.ui.widgets.imageGrabber.previewImage, {
        widgetEl: e
    });
    t.listen("previewStoredImage", Zotero.ui.widgets.imageGrabber.previewStoredImage, {
        widgetEl: e
    });
    var r = function(e) {
        var t = URL.createObjectURL(e);
        J("#preview-image").attr("src", t);
    };
    var a = J("#capture").on("change", function() {
        Z.debug("capture element changed. displaying image in preview");
        t.trigger("previewImage");
    });
};

Zotero.ui.widgets.imageGrabber.getFile = function(e) {
    return e.find("#capture").get(0).files[0];
};

Zotero.ui.widgets.imageGrabber.previewImage = function(e) {
    Z.debug("imageGrabber.previewImage", 3);
    var t = J(e.data["widgetEl"]);
    var r = Zotero.ui.widgets.imageGrabber.getFile(t);
    var a = URL.createObjectURL(r);
    t.find("#preview-image").attr("src", a);
};

Zotero.ui.widgets.imageGrabber.grab = function(e) {
    Z.debug("imageGrabber.grab", 3);
    var t = J(e.data["widgetEl"]);
    var r = Zotero.ui.getAssociatedLibrary(t);
    var a;
    var o;
    var i = new Zotero.Item();
    i.associateWithLibrary(r);
    i.initEmpty("attachment", "imported_file").then(function(e) {
        Z.debug("templateItem callback", 3);
        var a = t.find("#image-grabber-title").val();
        if (!a) a = "Untitled";
        e.set("title", a);
        e.set("itemKey", Zotero.utils.getKey());
        r.items.addItem(e);
        return r.idbLibrary.addItems([ e ]);
    }).then(function() {
        Z.debug("added item to idb", 3);
        a = Zotero.ui.widgets.imageGrabber.getFile(t);
        return Zotero.file.getFileInfo(a);
    }).then(function(e) {
        Z.debug("got fileInfo", 3);
        o = e;
        var t = o;
        return r.idbLibrary.setFile(i.get("itemKey"), t);
    }).then(function() {
        Z.debug("file saved to idb", 3);
    }).catch(Zotero.catchPromiseError);
};

Zotero.ui.widgets.imageGrabber.previewStoredImage = function(e) {
    Z.debug("imageGrabber.previewImage", 3);
    var t = J(e.data["widgetEl"]);
    var r = Zotero.ui.getAssociatedLibrary(t);
    var a = e.itemKey;
    Z.debug("itemKey: " + a);
    var o = r.items.getItem(a);
    var i = r.idbLibrary.getFile(a).then(function(e) {
        Z.debug("got Image");
        Z.debug(e);
        var r = new Blob([ e.filedata ], {
            type: e.contentType
        });
        var a = URL.createObjectURL(r);
        Z.debug(a);
        t.find("#preview-image").attr("src", a);
        window.fileData = e;
    }).catch(Zotero.catchPromiseError);
};

Zotero.ui.widgets.localItems = {};

Zotero.ui.widgets.localItems.init = function(e) {
    Z.debug("localItems widget init", 3);
    var t = Zotero.ui.getAssociatedLibrary(e);
    t.listen("changeItemSorting", Zotero.ui.callbacks.resortItems, {
        widgetEl: e
    });
    t.listen("displayedItemsChanged", Zotero.ui.widgets.localItems.updateDisplayedItems, {
        widgetEl: e
    });
    t.listen("displayedItemsUpdated", Zotero.ui.widgets.localItems.displayItems, {
        widgetEl: e
    });
    t.listen("cachedDataLoaded", Zotero.ui.widgets.localItems.displayItems, {
        widgetEl: e
    });
    var r = J(e);
    Zotero.state.bindItemLinks(r);
    r.on("change", ".itemlist-editmode-checkbox.all-checkbox", function(e) {
        J(".itemlist-editmode-checkbox").prop("checked", J(".itemlist-editmode-checkbox.all-checkbox").prop("checked"));
        t.trigger("selectedItemsChanged");
    });
    r.on("change", "input.itemKey-checkbox", function(e) {
        var r = [];
        J("input.itemKey-checkbox:checked").each(function(e, t) {
            r.push(J(t).data("itemkey"));
        });
        t.trigger("selectedItemsChanged", {
            selectedItemKeys: r
        });
    });
    Zotero.ui.widgets.localItems.bindPaginationLinks(r);
    t.trigger("displayedItemsUpdated");
};

Zotero.ui.widgets.localItems.bindPaginationLinks = function(e) {
    e.on("click", "#start-item-link", function(e) {
        e.preventDefault();
        Zotero.state.pathVars["itemPage"] = "";
        Zotero.state.pushState();
    });
    e.on("click", "#prev-item-link", function(e) {
        e.preventDefault();
        var t = Zotero.state.getUrlVar("itemPage") || "1";
        t = parseInt(t, 10);
        var r = t - 1;
        Zotero.state.pathVars["itemPage"] = r;
        Zotero.state.pushState();
    });
    e.on("click", "#next-item-link", function(e) {
        e.preventDefault();
        var t = Zotero.state.getUrlVar("itemPage") || "1";
        t = parseInt(t, 10);
        var r = t + 1;
        Zotero.state.pathVars["itemPage"] = r;
        Zotero.state.pushState();
    });
    e.on("click", "#last-item-link", function(e) {
        e.preventDefault();
        Z.debug("last-item-link clickbind", 4);
        var t = J(e.currentTarget).attr("href");
        var r = Zotero.state.parsePathVars(t);
        var a = r.itemPage;
        Zotero.state.pathVars["itemPage"] = a;
        Zotero.state.pushState();
    });
};

Zotero.ui.widgets.localItems.updateDisplayedItems = function(e) {
    Z.debug("widgets.localItems.updateDisplayedItems", 3);
    var t = J(e.data.widgetEl);
    var r = Zotero.ui.getAssociatedLibrary(t);
    var a = Zotero.ui.getItemsConfig(r);
    var o = Zotero.state.getUrlVars();
    r.buildItemDisplayView(o).then(function(e) {
        Z.debug("displayingItems in promise callback");
        t.empty();
        Zotero.ui.widgets.items.displayItems(t, a, e);
        Zotero.eventful.initTriggers();
    }).catch(Zotero.catchPromiseError);
};

Zotero.ui.widgets.siteSearch = {};

Zotero.ui.widgets.siteSearch.init = function(e) {
    Z.debug("widgets.siteSearch.init", 3);
    var t = J(e);
    Zotero.listen("searchSite", Zotero.ui.widgets.siteSearch.triggeredSearch, {
        widgetEl: e
    });
    var r = Zotero.state.getUrlVar("type");
    var a = Zotero.state.getUrlVar("q");
    Z.debug("searchType: " + r);
    switch (r) {
      case "support":
        J("a.supportTab").tab("show");
        J("#supportQuery").val(a);
        break;

      case "groups":
        J("a.groupTab").tab("show");
        J("#groupQuery").val(a);
        break;

      case "people":
        J("a.peopleTab").tab("show");
        J("#peopleQuery").val(a);
        break;
    }
    if (a) {
        Zotero.ui.widgets.siteSearch.search(r, a);
    }
};

Zotero.ui.widgets.siteSearch.triggeredSearch = function(e) {
    Z.debug("Zotero.ui.widgets.siteSearch.search", 3);
    var t = J(e.data.widgetEl);
    var r = J(e.triggeringElement);
    var a = r.data("searchtype");
    var o = r.closest(".search-section").find('input[name="q"]').val();
    if (a == "support") {
        a = t.find("input[name=supportRefinement]:checked").val();
    }
    Zotero.ui.widgets.siteSearch.search(a, o);
    return false;
};

Zotero.ui.widgets.siteSearch.search = function(e, t) {
    if (!t || t === "") {
        return false;
    }
    Zotero.state.setQueryVar("q", t);
    Zotero.state.setUrlVar("type", e);
    Zotero.state.pushState();
    var r = {
        type: e,
        query: t
    };
    Z.debug(r);
    Zotero.ui.widgets.siteSearch.runSearch(r);
};

Zotero.ui.widgets.siteSearch.runSearch = function(e) {
    Z.debug("Zotero.ui.widgets.siteSearch.runSearch", 3);
    Z.debug(e, 3);
    if (!e.type) e.type = "support";
    if (e.type == "support" || e.type == "forums" || e.type == "documentation") {
        Z.debug("google search");
        Zotero.ui.widgets.siteSearch.fetchGoogleResults(e);
    } else if (e.query !== "") {
        Z.debug("non-google search", 3);
        var t = "";
        var r = "?";
        if (e.type == "people") {
            searchPath = "/search/users";
        } else if (e.type == "groups") {
            searchPath = "/search/groups";
        }
        r += "query=" + e["query"];
        if (e["page"]) {
            r += "&page=" + e["page"];
        }
        Zotero.ui.showSpinner(J("#search-spinner"));
        J("#search-spinner").show();
        J.get(baseURL + searchPath + r, function(e) {
            J("#search-spinner").hide();
            if (e.error) {
                J("#search-results").html("There was an error searching for groups. Please try again in a few minutes");
            } else {
                J("#search-results").html(e.results);
                J("#search-result-count").html("Found " + e.resultCount + " results");
                J("#search-pagination").html(e.paginationControl);
            }
        }, "json");
    }
    Z.debug("done with runSearch");
};

Zotero.ui.widgets.siteSearch.fetchGoogleResults = function(e) {
    Z.debug("Zotero.ui.widgets.siteSearch.fetchGoogleResults", 3);
    Zotero.ui.widgets.siteSearch.clearResults();
    Zotero.ui.showSpinner(J("#search-spinner"));
    J("#search-spinner").show();
    searcher = new google.search.WebSearch();
    var t = null;
    switch (e.type) {
      case "documentation":
        t = "Documentation";
        break;

      case "forums":
        t = e.recent ? "ForumsRecent" : "Forums";
        break;
    }
    searcher.setSiteRestriction("008900748681634663180:wtahjnnbugc", t);
    searcher.setRestriction(google.search.Search.RESTRICT_SAFESEARCH, google.search.Search.SAFESEARCH_OFF);
    searcher.setResultSetSize(google.search.Search.LARGE_RESULTSET);
    searcher.setNoHtmlGeneration();
    paramsArray = [ e.type, e.query, e.page ];
    searcher.setSearchCompleteCallback(Zotero.ui.widgets.siteSearch, Zotero.ui.widgets.siteSearch.displayGoogleResults, paramsArray);
    searcher.clearResults();
    searcher.execute(e.query);
};

Zotero.ui.widgets.siteSearch.displayGoogleResults = function(e, t, r) {
    Z.debug("Zotero.ui.widgets.siteSearch.displayGoogleResults", 3);
    J("#search-spinner").hide();
    if (searcher.results && searcher.results.length > 0) {
        Z.debug("have results in searcher, displaying results");
        var a;
        for (a in searcher.results) {
            var o = searcher.results[a];
            var i = o.url.replace("http://", "");
            J("#search-results").append(J("#googlesearchresultTemplate").render({
                title: o.title,
                url: i,
                content: o.content
            })).show();
        }
        J("#search-result-count").html("Found " + searcher.cursor.estimatedResultCount + " results");
        for (a in searcher.cursor.pages) {
            var n = searcher.cursor.pages[a];
            if (a == searcher.cursor.currentPageIndex) {
                J("#search-pagination").append(n.label + " | ");
            } else {
                J("#search-pagination").append("<a href='javascript:Zotero.ui.widgets.siteSearch.gotopage(" + a + ")'>" + n.label + "</a> | ");
            }
        }
    } else {
        Z.debug("no results in searcher");
    }
};

Zotero.ui.widgets.siteSearch.clearResults = function(e) {
    e = J(e);
    e.find("#search-results").empty();
    e.find("#search-result-count").empty();
    e.find("#search-pagination").empty();
    window.scrollBy(0, -500);
};

Zotero.ui.widgets.siteSearch.gotopage = function(e) {
    Zotero.ui.widgets.siteSearch.clearResults();
    searcher.gotoPage(e);
};

Zotero.ui.widgets.publications = {};

Zotero.ui.widgets.publications.init = function(e) {
    Z.debug("widgets.publications.init");
    var t = Zotero.ui.getAssociatedLibrary(e);
    var r = J(e);
    var a = r.data("libraryID");
    var o = {
        limit: 50,
        order: "dateModified",
        sort: "desc",
        libraryType: "user",
        libraryID: a,
        target: "publications",
        include: "data,bib",
        linkwrap: "1",
        style: "apa-annotated-bibliography"
    };
    var i = t.loadPublications(o).then(function(e) {
        Z.debug("got publications", 3);
        r.empty();
        Zotero.ui.widgets.publications.displayItems(r, o, e.publicationItems);
    }, function(e) {
        Z.error(e);
        Z.error("error getting publication items");
        var t = Zotero.ui.ajaxErrorMessage(e.jqxhr);
        r.html("<p>" + t + "</p>");
    });
};

Zotero.ui.widgets.publications.displayItems = function(e, t, r) {
    Z.debug("publications.displayItems", 3);
    var a = J(e);
    var o = Zotero.ui.getAssociatedLibrary(a);
    var i = J.extend({}, Zotero.config.defaultApiArgs, t);
    var n = o.preferences.getPref("listDisplayedFields");
    if (o.libraryType != "group") {
        n = J.grep(n, function(e, t) {
            return J.inArray(e, Zotero.Library.prototype.groupOnlyColumns) == -1;
        });
    }
    var s = {};
    for (var l = 0; l < r.length; l++) {
        var c = r[l];
        var d = c.get("parentItem");
        if (d) {
            Z.debug("has parentKey, adding item to childItems object " + d);
            s[d] = c;
        }
    }
    var u = {
        items: r,
        childItems: s,
        library: o,
        displayFields: [ "title", "creator", "abstract", "date" ]
    };
    a.append(J("#publicationsTemplate").render(u));
};

"use strict";

Zotero.ui.widgets.reactaddToCollectionDialog = {};

Zotero.ui.widgets.reactaddToCollectionDialog.init = function(e) {
    Z.debug("addtocollectionsdialog widget init", 3);
    var t = Zotero.ui.getAssociatedLibrary(e);
    var r = ReactDOM.render(React.createElement(AddToCollectionDialog, {
        library: t
    }), document.getElementById("add-to-collection-dialog"));
    Zotero.ui.widgets.reactaddToCollectionDialog.reactInstance = r;
    t.listen("addToCollectionDialog", function() {
        r.setState({});
        r.openDialog();
    }, {});
};

var AddToCollectionDialog = React.createClass({
    displayName: "AddToCollectionDialog",
    getInitialState: function t() {
        return {
            collectionKey: null
        };
    },
    handleCollectionChange: function r(e) {
        this.setState({
            collectionKey: e.target.value
        });
    },
    openDialog: function a() {
        this.refs.modal.open();
    },
    closeDialog: function o(e) {
        this.refs.modal.close();
    },
    addToCollection: function n(e) {
        Z.debug("add-to-collection clicked", 3);
        var t = this.props.library;
        var r = Zotero.state.getSelectedItemKeys();
        var a = this.state.collectionKey;
        if (!a) {
            Zotero.ui.jsNotificationMessage("No collection selected", "error");
            return false;
        }
        if (r.length === 0) {
            Zotero.ui.jsNotificationMessage("No items selected", "notice");
            return false;
        }
        t.collections.getCollection(a).addItems(r).then(function(e) {
            t.dirty = true;
            Zotero.ui.jsNotificationMessage("Items added to collection", "success");
        })["catch"](Zotero.catchPromiseError);
        return false;
    },
    render: function s() {
        var e = this.props.library;
        var t = e.collections.nestedOrderingArray();
        var r = t.map(function(e, t) {
            return React.createElement("option", {
                key: e.get("key"),
                value: e.get("key")
            }, "-".repeat(e.nestingDepth), " ", e.get("name"));
        });
        return React.createElement(BootstrapModalWrapper, {
            ref: "modal"
        }, React.createElement("div", {
            id: "add-to-collection-dialog",
            className: "add-to-collection-dialog",
            role: "dialog",
            title: "Add to Collection",
            "data-keyboard": "true"
        }, React.createElement("div", {
            className: "modal-dialog"
        }, React.createElement("div", {
            className: "modal-content"
        }, React.createElement("div", {
            className: "modal-header"
        }, React.createElement("button", {
            type: "button",
            className: "close",
            "data-dismiss": "modal",
            "aria-hidden": "true"
        }, "×"), React.createElement("h3", null, "Add To Collection")), React.createElement("div", {
            className: "add-to-collection-div modal-body",
            "data-role": "content"
        }, React.createElement("form", {
            method: "POST"
        }, React.createElement("div", {
            "data-role": "fieldcontain"
        }, React.createElement("label", {
            htmlFor: "new-collection-parent"
        }, "Collection"), React.createElement("select", {
            onChange: this.handleCollectionChange,
            className: "collectionKey-select target-collection form-control"
        }, r)))), React.createElement("div", {
            className: "modal-footer"
        }, React.createElement("button", {
            onClick: this.closeDialog,
            className: "btn",
            "data-dismiss": "modal",
            "aria-hidden": "true"
        }, "Close"), React.createElement("button", {
            onClick: this.addToCollection,
            className: "btn btn-primary addButton"
        }, "Add"))))));
    }
});

var BootstrapModalWrapper = React.createClass({
    displayName: "BootstrapModalWrapper",
    componentDidMount: function l() {
        Z.debug("BootstrapModalWrapper componentDidMount");
        J(this.refs.root).modal({
            backdrop: "static",
            keyboard: false,
            show: false
        });
    },
    componentWillUnmount: function c() {
        Z.debug("BootstrapModalWrapper componentWillUnmount");
        J(this.refs.root).off("hidden", this.handleHidden);
    },
    close: function d() {
        Z.debug("BootstrapModalWrapper close");
        J(this.refs.root).modal("hide");
    },
    open: function u() {
        Z.debug("BootstrapModalWrapper open");
        J(this.refs.root).modal("show");
    },
    render: function p() {
        return React.createElement("div", {
            className: "modal",
            ref: "root"
        }, this.props.children);
    }
});

"use strict";

Zotero.ui.widgets.reactbreadcrumbs = {};

Zotero.ui.widgets.reactbreadcrumbs.init = function(e) {
    var t = Zotero.ui.getAssociatedLibrary(e);
    var r = ReactDOM.render(React.createElement(BreadCrumbs, {
        library: t
    }), document.getElementById("breadcrumbs"));
    t.listen("displayedItemsChanged displayedItemChanged selectedCollectionChanged", r.setState());
};

var BreadCrumb = React.createClass({
    displayName: "BreadCrumb",
    getInitialProps: function g() {
        return {
            label: "",
            path: ""
        };
    },
    render: function m() {
        if (this.props.path != "") {
            return React.createElement("a", {
                href: this.props.path
            }, this.props.label);
        } else {
            return this.props.label;
        }
    }
});

var BreadCrumbs = React.createClass({
    displayName: "BreadCrumbs",
    getInitialProps: function f() {
        return {
            library: null
        };
    },
    render: function h() {
        var e = this.props.library;
        if (e === null) {
            return null;
        }
        var t = [];
        var r = Zotero.state.getUrlVars();
        if (Zotero.config.breadcrumbsBase) {
            Zotero.config.breadcrumbsBase.forEach(function(e) {
                t.push(e);
            });
        } else if (e.libraryType == "user") {
            t = [ {
                label: "Home",
                path: "/"
            }, {
                label: "People",
                path: "/people"
            }, {
                label: e.libraryLabel || e.libraryUrlIdentifier,
                path: "/" + e.libraryUrlIdentifier
            }, {
                label: "Library",
                path: "/" + e.libraryUrlIdentifier + "/items"
            } ];
        } else {
            t = [ {
                label: "Home",
                path: "/"
            }, {
                label: "Groups",
                path: "/groups"
            }, {
                label: e.libraryLabel || e.libraryUrlIdentifier,
                path: "/groups/" + e.libraryUrlIdentifier
            }, {
                label: "Library",
                path: "/groups/" + e.libraryUrlIdentifier + "/items"
            } ];
        }
        if (r.collectionKey) {
            Z.debug("have collectionKey", 4);
            curCollection = e.collections.getCollection(r.collectionKey);
            if (curCollection) {
                t.push({
                    label: curCollection.get("name"),
                    path: Zotero.state.buildUrl({
                        collectionKey: r.collectionKey
                    })
                });
            }
        }
        if (r.itemKey) {
            Z.debug("have itemKey", 4);
            t.push({
                label: e.items.getItem(r.itemKey).title,
                path: Zotero.state.buildUrl({
                    collectionKey: r.collectionKey,
                    itemKey: r.itemKey
                })
            });
        }
        var a = [];
        var o = "";
        t.forEach(function(e, r) {
            a.push(React.createElement(BreadCrumb, {
                label: e.label,
                path: e.path
            }));
            if (e.label == "Home") {
                o += "Zotero | ";
            } else {
                o += e.label;
            }
            if (r < t.length) {
                a.push(" > ");
                o += " > ";
            }
        });
        if (o != "") {
            Zotero.state.updateStateTitle(o);
        }
        return React.createElement("span", null, a);
    }
});

"use strict";

Zotero.ui.widgets.reactchooseSortingDialog = {};

Zotero.ui.widgets.reactchooseSortingDialog.init = function(e) {
    Z.debug("chooseSortingDialog widget init", 3);
    var t = Zotero.ui.getAssociatedLibrary(e);
    var r = ReactDOM.render(React.createElement(ChooseSortingDialog, {
        library: t
    }), document.getElementById("choose-sorting-dialog"));
    Zotero.ui.widgets.reactchooseSortingDialog.reactInstance = r;
    var a = Zotero.ui.getPrioritizedVariable("order", "title");
    var o = Zotero.ui.getPrioritizedVariable("sort", "asc");
    r.setState({
        sortField: a,
        sortOrder: o
    });
    t.listen("chooseSortingDialog", r.openDialog, {});
};

var ChooseSortingDialog = React.createClass({
    displayName: "ChooseSortingDialog",
    getInitialState: function b() {
        return {
            sortField: "",
            sortOrder: "asc"
        };
    },
    handleFieldChange: function y(e) {
        this.setState({
            sortField: e.target.value
        });
    },
    handleOrderChange: function v(e) {
        this.setState({
            sortOrder: e.target.value
        });
    },
    saveSorting: function w() {
        library.trigger("changeItemSorting", {
            newSortField: this.state.sortField,
            newSortOrder: this.state.sortOrder
        });
        this.closeDialog();
    },
    openDialog: function I() {
        this.refs.modal.open();
    },
    closeDialog: function C(e) {
        this.refs.modal.close();
    },
    render: function R() {
        var e = this.props.library;
        var t = e.sortableColumns.map(function(e) {
            return React.createElement("option", {
                label: Zotero.localizations.fieldMap[e],
                value: e
            }, Zotero.localizations.fieldMap[e]);
        });
        return React.createElement(BootstrapModalWrapper, {
            ref: "modal"
        }, React.createElement("div", {
            id: "choose-sorting-dialog",
            className: "choose-sorting-dialog",
            role: "dialog",
            title: "Sort Order",
            "data-keyboard": "true"
        }, React.createElement("div", {
            className: "modal-dialog"
        }, React.createElement("div", {
            className: "modal-content"
        }, React.createElement("div", {
            className: "modal-header"
        }, React.createElement("button", {
            type: "button",
            className: "close",
            "data-dismiss": "modal",
            "aria-hidden": "true"
        }, "×"), React.createElement("h3", null, "Sort Items By")), React.createElement("div", {
            className: "choose-sorting-div modal-body",
            "data-role": "content"
        }, React.createElement("form", {
            className: "form-horizontal",
            role: "form"
        }, React.createElement("select", {
            defaultValue: this.state.sortField,
            onChange: this.handleFieldChange,
            id: "sort-column-select",
            className: "sort-column-select form-control",
            name: "sort-column-select"
        }, t), React.createElement("select", {
            defaultValue: this.state.sortOrder,
            onChange: this.handleOrderChange,
            id: "sort-order-select",
            className: "sort-order-select form-control",
            name: "sort-order-select"
        }, React.createElement("option", {
            label: "Ascending",
            value: "asc"
        }, "Ascending"), React.createElement("option", {
            label: "Descending",
            value: "desc"
        }, "Descending")))), React.createElement("div", {
            className: "modal-footer"
        }, React.createElement("button", {
            className: "btn",
            "data-dismiss": "modal",
            "aria-hidden": "true"
        }, "Cancel"), React.createElement("button", {
            onClick: this.saveSorting,
            className: "btn btn-primary saveSortButton"
        }, "Save"))))));
    }
});

"use strict";

Zotero.ui.widgets.reactciteItemDialog = {};

Zotero.ui.widgets.reactciteItemDialog.init = function(e) {
    Z.debug("citeItemDialog widget init", 3);
    var t = Zotero.ui.getAssociatedLibrary(e);
    var r = ReactDOM.render(React.createElement(CiteItemDialog, {
        library: t
    }), document.getElementById("cite-item-dialog"));
    Zotero.ui.widgets.reactaddToCollectionDialog.reactInstance = r;
    r.getAvailableStyles();
    t.listen("citeItems", r.openDialog, {});
};

Zotero.ui.widgets.reactciteItemDialog.show = function(e) {
    Z.debug("citeItemDialog.show", 3);
    var t = J(e.triggeringElement);
    var r = false;
    var a = [];
    var o;
    if (e.hasOwnProperty("zoteroItems")) {
        r = true;
        J.each(e.zoteroItems, function(e, t) {
            var r = t.cslItem();
            a.push(r);
        });
    } else {
        o = Zotero.ui.getAssociatedLibrary(t);
    }
    var i = J(e.data.widgetEl).empty();
    i.html(J("#citeitemdialogTemplate").render({
        freeStyleInput: true
    }));
    var n = i.find(".cite-item-dialog");
    var s = function l(t) {
        Z.debug("citeFunction", 3);
        var i = J(e.currentTarget);
        var s = "";
        if (i.is(".cite-item-select, input.free-text-style-input")) {
            s = i.val();
        } else {
            s = n.find(".cite-item-select").val();
            var l = n.find("input.free-text-style-input").val();
            if (J.inArray(l, Zotero.styleList) !== -1) {
                s = l;
            }
        }
        if (!r) {
            var c = Zotero.state.getSelectedItemKeys();
            if (c.length === 0) {
                c = Zotero.state.getSelectedItemKeys();
            }
            Z.debug(c, 4);
            o.loadFullBib(c, s).then(function(e) {
                n.find(".cite-box-div").html(e);
            })["catch"](Zotero.catchPromiseError);
        } else {
            Zotero.ui.widgets.reactciteItemDialog.directCite(a, s).then(function(e) {
                n.find(".cite-box-div").html(e);
            })["catch"](Zotero.catchPromiseError);
        }
    };
    n.find(".cite-item-select").on("change", s);
    Zotero.ui.widgets.reactciteItemDialog.getAvailableStyles();
    Zotero.ui.dialog(n, {});
    return false;
};

Zotero.ui.widgets.reactciteItemDialog.getAvailableStyles = function() {
    if (!Zotero.styleList) {
        Zotero.styleList = [];
        J.getJSON(Zotero.config.styleListUrl, function(e) {
            Zotero.styleList = e;
        });
    }
};

Zotero.ui.widgets.reactciteItemDialog.directCite = function(e, t) {
    var r = {};
    r.items = e;
    var a = Zotero.config.citationEndpoint + "?linkwrap=1&style=" + t;
    return J.post(a, JSON.stringify(r));
};

Zotero.ui.widgets.reactciteItemDialog.buildBibString = function(e) {
    var t = e.bibliography[0];
    var r = e.bibliography[1];
    var a = t.bibstart;
    for (var o = 0; o < r.length; o++) {
        a += r[o];
    }
    a += t.bibend;
    return a;
};

var CiteItemDialog = React.createClass({
    displayName: "CiteItemDialog",
    getDefaultProps: function E() {
        return {
            freeStyleInput: false
        };
    },
    getInitialState: function S() {
        return {
            styles: [],
            currentStyle: "",
            citationString: ""
        };
    },
    handleStyleChange: function k(e) {
        this.setState({
            collectionKey: e.target.value
        });
    },
    openDialog: function T() {
        this.refs.modal.open();
    },
    closeDialog: function D(e) {
        this.refs.modal.close();
    },
    cite: function x(e) {
        Z.debug("citeFunction", 3);
        var t = this;
        var r = this.props.library;
        var a = this.state.currentStyle;
        var o = Zotero.state.getSelectedItemKeys();
        r.loadFullBib(o, a).then(function(e) {
            t.setState({
                citationString: e
            });
        })["catch"](Zotero.catchPromiseError);
    },
    getAvailableStyles: function N() {
        if (!Zotero.styleList) {
            Zotero.styleList = [];
            J.getJSON(Zotero.config.styleListUrl, function(e) {
                Zotero.styleList = e;
            });
        }
    },
    directCite: function j(e, t) {
        var r = {};
        r.items = e;
        var a = Zotero.config.citationEndpoint + "?linkwrap=1&style=" + t;
        return J.post(a, JSON.stringify(r));
    },
    buildBibString: function L(e) {
        var t = e.bibliography[0];
        var r = e.bibliography[1];
        var a = t.bibstart;
        for (var o = 0; o < r.length; o++) {
            a += r[o];
        }
        a += t.bibend;
        return a;
    },
    render: function O() {
        var e = this;
        var t = this.props.library;
        var r = null;
        if (this.props.freeStyleInput) {
            r = React.createElement("input", {
                type: "text",
                className: "free-text-style-input form-control",
                placeholder: "style"
            });
        }
        var a = {
            __html: this.state.citationString
        };
        return React.createElement(BootstrapModalWrapper, {
            ref: "modal"
        }, React.createElement("div", {
            id: "cite-item-dialog",
            className: "cite-item-dialog",
            role: "dialog",
            title: "Cite",
            "data-keyboard": "true"
        }, React.createElement("div", {
            className: "modal-dialog"
        }, React.createElement("div", {
            className: "modal-content"
        }, React.createElement("div", {
            className: "modal-header"
        }, React.createElement("button", {
            type: "button",
            className: "close",
            "data-dismiss": "modal",
            "aria-hidden": "true"
        }, "×"), React.createElement("h3", null, "Cite Items")), React.createElement("div", {
            className: "cite-item-div modal-body",
            "data-role": "content"
        }, React.createElement("form", null, React.createElement("select", {
            onChange: this.cite,
            className: "cite-item-select form-control",
            id: "cite-item-select"
        }, React.createElement("option", {
            value: ""
        }, "Select Style"), React.createElement("option", {
            value: "apsa"
        }, "American Political Science Association"), React.createElement("option", {
            value: "apa"
        }, "American Psychological Association"), React.createElement("option", {
            value: "asa"
        }, "American Sociological Association"), React.createElement("option", {
            value: "chicago-author-date"
        }, "Chicago Manual of Style (Author-Date format)"), React.createElement("option", {
            value: "chicago-fullnote-bibliography"
        }, "Chicago Manual of Style (Full Note with Bibliography)"), React.createElement("option", {
            value: "chicago-note-bibliography"
        }, "Chicago Manual of Style (Note with Bibliography)"), React.createElement("option", {
            value: "harvard1"
        }, "Harvard Reference format 1"), React.createElement("option", {
            value: "ieee"
        }, "IEEE"), React.createElement("option", {
            value: "mhra"
        }, "Modern Humanities Research Association"), React.createElement("option", {
            value: "mla"
        }, "Modern Language Association"), React.createElement("option", {
            value: "nlm"
        }, "National Library of Medicine"), React.createElement("option", {
            value: "nature"
        }, "Nature"), React.createElement("option", {
            value: "vancouver"
        }, "Vancouver")), r), React.createElement("div", {
            id: "cite-box-div",
            className: "cite-box-div",
            dangerouslySetInnerHTML: a
        })), React.createElement("div", {
            className: "modal-footer"
        }, React.createElement("button", {
            className: "btn btn-default",
            "data-dismiss": "modal",
            "aria-hidden": "true"
        }, "Close"))))));
    }
});

"use strict";

Zotero.ui.widgets.reactcollections = {};

Zotero.ui.widgets.reactcollections.init = function(e) {
    var t = Zotero.ui.getAssociatedLibrary(e);
    var r = Zotero.state.getUrlVar("collectionKey");
    var a = ReactDOM.render(React.createElement(Collections, {
        library: t,
        initialCollectionKey: r
    }), document.getElementById("collection-list-div"));
    Zotero.ui.widgets.reactcollections.reactInstance = a;
};

var CollectionRow = React.createClass({
    displayName: "CollectionRow",
    getDefaultProps: function A() {
        return {
            collection: null,
            selectedCollection: "",
            depth: 0,
            expandedCollections: {}
        };
    },
    handleCollectionClick: function P(e) {
        e.preventDefault();
        var t = this.props.collection.get("collectionKey");
        Zotero.ui.widgets.reactcollections.reactInstance.setState({
            currentCollectionKey: t
        });
        Zotero.state.clearUrlVars([ "mode" ]);
        Zotero.state.pathVars["collectionKey"] = t;
        Zotero.state.pushState();
    },
    handleTwistyClick: function U(e) {
        Z.debug("handleTwistyClick");
        e.preventDefault();
        var t = this.props.collection.get("collectionKey");
        var r = this.props.expandedCollections;
        if (r[t]) {
            delete r[t];
        } else {
            r[t] = true;
        }
        Zotero.ui.widgets.reactcollections.reactInstance.setState({
            expandedCollections: r
        });
    },
    render: function F() {
        if (this.props.collection == null) {
            return null;
        }
        var e = this.props.collection;
        var t = e.get("key");
        var r = this.props.selectedCollection;
        var a = this.props.expandedCollections;
        var o = a[t] === true;
        var i = this.props.selectedCollection == t;
        var n = [];
        e.children.forEach(function(e, t) {
            n.push(React.createElement(CollectionRow, {
                key: e.get("key"),
                collection: e,
                selectedCollection: r,
                expandedCollections: a
            }));
        });
        var s = null;
        if (e.hasChildren) {
            s = React.createElement("ul", {
                hidden: !o
            }, n);
        }
        var l = "placeholder small-icon light-icon pull-left";
        if (a[t] === true) {
            l += " glyphicon glyphicon-chevron-down clickable";
        } else if (n.length > 0) {
            l += " glyphicon glyphicon-chevron-right clickable";
        }
        return React.createElement("li", {
            className: "collection-row"
        }, React.createElement("div", {
            className: "folder-toggle"
        }, React.createElement("span", {
            className: l,
            onClick: this.handleTwistyClick
        }), React.createElement("span", {
            className: "fonticon glyphicons glyphicons-folder-open barefonticon"
        })), React.createElement("a", {
            href: e.websiteCollectionLink,
            className: i ? "current-collection" : "",
            onClick: this.handleCollectionClick
        }, e.get("name")), s);
    }
});

var TrashRow = React.createClass({
    displayName: "TrashRow",
    getDefaultProps: function M() {
        return {
            collectionKey: "trash",
            selectedCollection: ""
        };
    },
    handleClick: function _() {
        Zotero.state.clearUrlVars([ "mode" ]);
        Zotero.state.pathVars["collectionKey"] = this.props.collectionKey;
        Zotero.state.pushState();
    },
    render: function K() {
        Z.debug("TrashRow render");
        var e = this.props.selectedCollection == this.props.collectionKey ? "collection-row current-collection" : "collection-row";
        return React.createElement("li", {
            className: e
        }, React.createElement("div", {
            className: "folder-toggle"
        }, React.createElement("span", {
            className: "sprite-placeholder sprite-icon-16 pull-left dui-icon"
        }), React.createElement("span", {
            className: "glyphicons fonticon glyphicons-bin barefonticon"
        })), "Trash");
    }
});

var Collections = React.createClass({
    displayName: "Collections",
    getDefaultProps: function V() {
        return {
            initialCollectionKey: null
        };
    },
    getInitialState: function q() {
        return {
            collections: null,
            currentCollectionKey: this.props.initialCollectionKey,
            expandedCollections: {},
            loading: false
        };
    },
    componentWillMount: function B() {
        var e = this;
        var t = this.props.library;
        t.listen("collectionsDirty", e.syncCollections, {});
        t.listen("libraryCollectionsUpdated", function() {
            e.setState({
                collections: t.collections
            });
        }, {});
        t.listen("cachedDataLoaded", e.syncCollections, {});
    },
    returnToLibrary: function z(e) {
        e.preventDefault();
        this.setState({
            currentCollectionKey: null
        });
        Zotero.state.clearUrlVars();
        Zotero.state.pushState();
    },
    syncCollections: function G(e) {
        Zotero.debug("react collections syncCollections", 3);
        var t = this;
        if (this.state.loading) {
            return;
        }
        var r = this.props.library;
        this.setState({
            collections: r.collections,
            loading: true
        });
        return r.loadUpdatedCollections().then(function() {
            t.setState({
                collections: r.collections,
                loading: false
            });
            r.trigger("libraryCollectionsUpdated");
        }, function(e) {
            Z.error("Error syncing collections");
            Z.error(e);
            t.setState({
                collections: r.collections,
                loading: false
            });
            r.trigger("libraryCollectionsUpdated");
            Zotero.ui.jsNotificationMessage("Error loading collections. Collections list may not be up to date", "error");
        });
    },
    render: function W() {
        Z.debug("Collections render");
        var e = this.props.library;
        var t = this.state.collections;
        if (t == null) {
            return null;
        }
        var r = this.state.collections.collectionsArray;
        var a = this.state.currentCollectionKey;
        var o = "";
        var i = this.state.expandedCollections;
        var n = [];
        if (a !== null) {
            var s = t.getCollection(a);
            var l = s;
            while (true) {
                if (l && !l.topLevel) {
                    var c = l.get("parentCollection");
                    l = t.getCollection(c);
                    n.push(c);
                    i[c] = true;
                } else {
                    break;
                }
            }
        }
        var d = [];
        r.forEach(function(e, t) {
            if (e.topLevel) {
                d.push(React.createElement(CollectionRow, {
                    key: e.get("key"),
                    collection: e,
                    selectedCollection: a,
                    expandedCollections: i
                }));
            }
        });
        var u = "my-library " + (a == null ? "current-collection" : "");
        return React.createElement("div", {
            id: "collection-list-container",
            className: "collection-list-container"
        }, React.createElement("ul", {
            id: "collection-list"
        }, React.createElement("li", null, React.createElement("span", {
            className: "glyphicons fonticon glyphicons-inbox barefonticon"
        }), React.createElement("a", {
            onClick: this.returnToLibrary,
            className: u,
            href: e.libraryBaseWebsiteUrl
        }, "Library")), d));
    }
});

"use strict";

Zotero.ui.widgets.reactcontrolPanel = {};

Zotero.ui.widgets.reactcontrolPanel.init = function(e) {
    Z.debug("Zotero.eventful.init.controlPanel", 3);
    var t = Zotero.ui.getAssociatedLibrary(e);
    var r = ReactDOM.render(React.createElement(ControlPanel, {
        library: t
    }), document.getElementById("control-panel"));
    Zotero.ui.widgets.reactcontrolPanel.reactInstance = r;
};

var GroupsButton = React.createClass({
    displayName: "GroupsButton",
    render: function H() {
        var e = "/groups";
        return React.createElement("a", {
            className: "btn btn-default navbar-btn navbar-left",
            href: e,
            title: "Groups"
        }, React.createElement("span", {
            className: "glyphicons fonticon glyphicons-group"
        }));
    }
});

var LibraryDropdown = React.createClass({
    displayName: "LibraryDropdown",
    getDefaultProps: function Q() {
        return {
            library: null,
            user: false
        };
    },
    getInitialState: function $() {
        return {
            accessibleLibraries: [],
            loading: false,
            loaded: false
        };
    },
    populateDropdown: function Y() {
        Z.debug("populateDropdown");
        var e = this;
        if (this.state.loading || this.state.loaded) {
            return;
        }
        var t = this.props.library;
        if (t == null) {
            return;
        }
        if (!Zotero.config.loggedIn) {
            throw new Error("no logged in userID. Required for libraryDropdown widget");
        }
        var r = Zotero.config.loggedInUser;
        var a = "u" + r.userID;
        var o = Zotero.url.userWebLibrary(r.slug);
        var i = Zotero.config.librarySettings.name;
        this.setState({
            loading: true
        });
        var n = t.groups.fetchUserGroups(r.userID).then(function(t) {
            Z.debug("got member groups", 3);
            var i = t.fetchedGroups;
            var n = [];
            if (!(Zotero.config.librarySettings.libraryType == "user" && Zotero.config.librarySettings.libraryID == r.userID)) {
                n.push({
                    name: "My Library",
                    libraryString: a,
                    webUrl: o
                });
            }
            for (var s = 0; s < i.length; s++) {
                if (Zotero.config.librarySettings.libraryType == "group" && i[s].get("id") == Zotero.config.librarySettings.libraryID) {
                    continue;
                }
                var l = "g" + i[s].get("id");
                n.push({
                    name: i[s].get("name"),
                    libraryString: l,
                    webUrl: Zotero.url.groupWebLibrary(i[s])
                });
            }
            e.setState({
                accessibleLibraries: n,
                loading: false,
                loaded: true
            });
        })["catch"](function(e) {
            Z.error(e);
            Z.error(e.message);
        });
    },
    render: function X() {
        if (this.props.user == false) {
            return null;
        }
        var e = Zotero.config.librarySettings.name;
        var t = this.state.accessibleLibraries;
        var r = t.map(function(e) {
            return React.createElement("li", {
                key: e.libraryString
            }, React.createElement("a", {
                role: "menuitem",
                href: e.webUrl
            }, e.name));
        });
        return React.createElement("div", {
            id: "library-dropdown",
            className: "eventfulwidget btn-group",
            "data-widget": "libraryDropdown",
            "data-library": this.props.library.libraryString
        }, React.createElement("button", {
            className: "btn btn-default navbar-btn dropdown-toggle",
            onClick: this.populateDropdown,
            "data-toggle": "dropdown",
            href: "#",
            title: "Libraries"
        }, React.createElement("span", {
            className: "glyphicons fonticon glyphicons-inbox"
        }), React.createElement("span", {
            className: "current-library-name"
        }, e), React.createElement("span", {
            className: "caret"
        })), React.createElement("ul", {
            className: "library-dropdown-list dropdown-menu actions-menu"
        }, React.createElement("li", {
            hidden: !this.state.loading
        }, React.createElement("a", {
            role: "menuitem",
            className: "clickable"
        }, "Loading...")), r));
    }
});

var ActionsDropdown = React.createClass({
    displayName: "ActionsDropdown",
    getDefaultProps: function et() {
        return {
            itemSelected: false,
            selectedCollection: false,
            library: null
        };
    },
    trashOrDeleteItems: function tt(e) {
        e.preventDefault();
        Z.debug("move-to-trash clicked", 3);
        var t = this.props.library;
        var r = Zotero.state.getSelectedItemKeys();
        var a;
        var o = t.items.getItems(r);
        var i = [];
        if (Zotero.state.getUrlVar("collectionKey") == "trash") {
            var n;
            for (n = 0; n < o.length; n++) {
                var s = o[n];
                if (s.get("deleted")) {
                    i.push(s);
                }
            }
            a = t.items.deleteItems(i);
        } else {
            a = t.items.trashItems(o);
        }
        t.dirty = true;
        a["catch"](function() {
            Z.error("Error trashing items");
        }).then(function() {
            Zotero.state.clearUrlVars([ "collectionKey", "tag", "q" ]);
            Zotero.state.pushState(true);
            t.trigger("displayedItemsChanged");
        })["catch"](Zotero.catchPromiseError);
        return false;
    },
    removeFromTrash: function rt(e) {
        Z.debug("remove-from-trash clicked", 3);
        var t = this.props.library;
        var r = Zotero.state.getSelectedItemKeys();
        var a = t.items.getItems(r);
        var o = t.items.untrashItems(a);
        t.dirty = true;
        o["catch"](function() {}).then(function() {
            Z.debug("post-removeFromTrash always execute: clearUrlVars", 3);
            Zotero.state.clearUrlVars([ "collectionKey", "tag", "q" ]);
            Zotero.state.pushState();
            t.trigger("displayedItemsChanged");
        })["catch"](Zotero.catchPromiseError);
        return false;
    },
    removeFromCollection: function at(e) {
        Z.debug("remove-from-collection clicked", 3);
        var t = this.props.library;
        var r = Zotero.state.getSelectedItemKeys();
        var a = Zotero.state.getUrlVar("collectionKey");
        var o = [];
        var i = [];
        r.forEach(function(e, r) {
            var i = t.items.getItem(e);
            i.removeFromCollection(a);
            o.push(i);
        });
        t.dirty = true;
        t.items.writeItems(o).then(function() {
            Z.debug("removal responses finished. forcing reload", 3);
            Zotero.state.clearUrlVars([ "collectionKey", "tag" ]);
            Zotero.state.pushState(true);
            t.trigger("displayedItemsChanged");
        })["catch"](Zotero.catchPromiseError);
        return false;
    },
    render: function ot() {
        var e = this.props.library;
        var t = this.props.itemSelected;
        var r = this.props.selectedCollection;
        var a = r != false;
        var o = t && r == "trash";
        var i = t && r != "trash";
        return React.createElement("div", {
            className: "btn-group"
        }, React.createElement("button", {
            className: "btn btn-default navbar-btn dropdown-toggle",
            "data-toggle": "dropdown",
            href: "#",
            title: "Actions"
        }, "Actions", React.createElement("span", {
            className: "caret"
        })), React.createElement("ul", {
            className: "dropdown-menu actions-menu"
        }, React.createElement("li", {
            className: "permission-edit selected-item-action",
            hidden: !t
        }, React.createElement("a", {
            role: "menuitem",
            className: "eventfultrigger add-to-collection-button clickable",
            "data-library": e.libraryString,
            "data-triggers": "addToCollectionDialog",
            title: "Add to Collection"
        }, "Add to Collection")), React.createElement("li", {
            className: "permission-edit selected-item-action selected-collection-action",
            hidden: !(t && a)
        }, React.createElement("a", {
            onClick: this.removeFromCollection,
            className: "remove-from-collection-button clickable",
            title: "Remove from Collection"
        }, "Remove from Collection")), React.createElement("li", {
            className: "permission-edit selected-item-action",
            hidden: !i
        }, React.createElement("a", {
            onClick: this.trashOrDeleteItems,
            className: "move-to-trash-button clickable",
            title: "Move to Trash"
        }, "Move to Trash")), React.createElement("li", {
            className: "permission-edit selected-item-action",
            hidden: !o
        }, React.createElement("a", {
            onClick: this.trashOrDeleteItems,
            className: "permanently-delete-button clickable",
            title: "Move to Trash"
        }, "Permanently Delete")), React.createElement("li", {
            className: "permission-edit selected-item-action",
            hidden: !o
        }, React.createElement("a", {
            onClick: this.removeFromTrash,
            className: "remove-from-trash-button clickable",
            title: "Remove from Trash"
        }, "Remove from Trash")), React.createElement("li", {
            className: "divider permission-edit selected-item-action"
        }), React.createElement("li", {
            className: "permission-edit"
        }, React.createElement("a", {
            className: "create-collection-button eventfultrigger clickable",
            "data-library": e.libraryString,
            "data-triggers": "createCollectionDialog",
            title: "New Collection"
        }, "Create Collection")), React.createElement("li", {
            className: "permission-edit",
            hidden: !a
        }, React.createElement("a", {
            className: "update-collection-button eventfultrigger clickable",
            "data-library": e.libraryString,
            "data-triggers": "updateCollectionDialog",
            title: "Change Collection"
        }, "Rename Collection")), React.createElement("li", {
            className: "permission-edit",
            hidden: !a
        }, React.createElement("a", {
            className: "delete-collection-button eventfultrigger clickable",
            "data-library": e.libraryString,
            "data-triggers": "deleteCollectionDialog",
            title: "Delete Collection"
        }, "Delete Collection")), React.createElement("li", {
            className: "divider permission-edit"
        }), React.createElement("li", null, React.createElement("a", {
            href: "#",
            className: "eventfultrigger clickable",
            "data-library": e.libraryString,
            "data-triggers": "librarySettingsDialog"
        }, "Library Settings")), React.createElement("li", null, React.createElement("a", {
            href: "#",
            className: "cite-button eventfultrigger clickable",
            "data-library": e.libraryString,
            "data-triggers": "citeItems"
        }, "Cite")), React.createElement("li", null, React.createElement("a", {
            href: "#",
            className: "export-button eventfultrigger clickable",
            "data-library": e.libraryString,
            "data-triggers": "exportItemsDialog"
        }, "Export")), React.createElement("li", {
            className: "divider selected-item-action"
        }), React.createElement("li", {
            className: "selected-item-action",
            hidden: !t
        }, React.createElement("a", {
            className: "send-to-library-button eventfultrigger clickable",
            "data-library": e.libraryString,
            "data-triggers": "sendToLibraryDialog",
            title: "Copy to Library"
        }, "Copy to Library")), React.createElement("li", {
            className: "divider"
        }), React.createElement("li", null, React.createElement("a", {
            href: "#",
            className: "eventfultrigger clickable",
            "data-library": e.libraryString,
            "data-triggers": "syncLibary"
        }, "Sync")), React.createElement("li", null, React.createElement("a", {
            href: "#",
            className: "eventfultrigger clickable",
            "data-library": e.libraryString,
            "data-triggers": "deleteIdb"
        }, "Delete IDB"))));
    }
});

var CreateItemDropdown = React.createClass({
    displayName: "CreateItemDropdown",
    getDefaultProps: function it() {
        return {};
    },
    createItem: function nt(e) {
        Z.debug("create-item-Link clicked", 3);
        e.preventDefault();
        var t = this.props.library;
        var r = J(e.target).data("itemtype");
        t.trigger("createItem", {
            itemType: r
        });
        return false;
    },
    render: function st() {
        var e = this;
        var t = "";
        var r = Object.keys(Zotero.Item.prototype.typeMap);
        r = r.sort();
        var a = r.map(function(t, r) {
            return React.createElement("li", {
                key: t
            }, React.createElement("a", {
                onClick: e.createItem,
                href: "#",
                "data-itemtype": t
            }, Zotero.Item.prototype.typeMap[t]));
        });
        var o = "create-item-button btn btn-default navbar-btn dropdown-toggle";
        if (Zotero.state.getUrlVar("collectionKey") == "trash") {
            o += " disabled";
        }
        return React.createElement("div", {
            className: "btn-group create-item-dropdown permission-edit"
        }, React.createElement("button", {
            type: "button",
            className: o,
            "data-toggle": "dropdown",
            title: "New Item"
        }, React.createElement("span", {
            className: "glyphicons fonticon glyphicons-plus"
        })), React.createElement("ul", {
            className: "dropdown-menu",
            role: "menu",
            style: {
                maxHeight: "300px",
                overflow: "auto"
            }
        }, a));
    }
});

var ControlPanel = React.createClass({
    displayName: "ControlPanel",
    componentWillMount: function lt() {
        reactInstance = this;
        library = this.props.library;
        reactInstance.setState({
            user: Zotero.config.loggedInUser
        });
        library.listen("selectedItemsChanged", function(e) {
            var t = e.selectedItemKeys;
            reactInstance.setState({
                selectedItems: t
            });
        }, {});
        library.listen("selectedCollectionChanged", function(e) {
            var t = Zotero.state.getUrlVar("collectionKey");
            reactInstance.setState({
                selectedCollection: t
            });
        }, {});
    },
    getDefaultProps: function ct() {
        return {};
    },
    getInitialState: function dt() {
        return {
            user: false,
            canEdit: false,
            selectedItems: [],
            selectedCollection: null
        };
    },
    render: function ut() {
        return React.createElement("div", {
            id: "control-panel",
            className: "nav navbar-nav",
            role: "navigation"
        }, React.createElement("div", {
            className: "btn-toolbar navbar-left"
        }, React.createElement(GroupsButton, {
            library: this.props.library
        }), React.createElement(LibraryDropdown, {
            user: this.state.user,
            library: this.props.library
        }), React.createElement(ActionsDropdown, {
            library: this.props.library,
            itemSelected: this.state.selectedItems.length > 0,
            selectedCollection: this.state.selectedCollection
        }), React.createElement(CreateItemDropdown, {
            library: this.props.library
        })));
    }
});

"use strict";

Zotero.ui.widgets.reactcreateCollectionDialog = {};

Zotero.ui.widgets.reactcreateCollectionDialog.init = function(e) {
    Z.debug("createcollectionsdialog widget init", 3);
    var t = Zotero.ui.getAssociatedLibrary(e);
    var r = ReactDOM.render(React.createElement(CreateCollectionDialog, {
        library: t
    }), document.getElementById("create-collection-dialog"));
    Zotero.ui.widgets.reactaddToCollectionDialog.reactInstance = r;
    t.listen("createCollectionDialog", function() {
        r.forceUpdate();
        r.openDialog();
    }, {});
};

var CreateCollectionDialog = React.createClass({
    displayName: "CreateCollectionDialog",
    getInitialState: function pt() {
        return {
            collectionName: "",
            parentCollection: null
        };
    },
    handleCollectionChange: function gt(e) {
        Z.debug(e);
        Z.debug(e.target.value);
        this.setState({
            parentCollection: e.target.value
        });
    },
    handleNameChange: function mt(e) {
        this.setState({
            collectionName: e.target.value
        });
    },
    openDialog: function ft() {
        this.refs.modal.open();
    },
    closeDialog: function ht(e) {
        this.refs.modal.close();
    },
    createCollection: function bt() {
        Z.debug("react createCollection");
        var e = this;
        var t = this.props.library;
        var r = this.state.parentCollection;
        var a = this.state.collectionName;
        if (a == "") {
            a = "Untitled";
        }
        t.addCollection(a, r).then(function(r) {
            t.collections.initSecondaryData();
            t.trigger("libraryCollectionsUpdated");
            Zotero.state.pushState();
            e.closeDialog();
            Zotero.ui.jsNotificationMessage("Collection Created", "success");
        })["catch"](function(t) {
            Zotero.ui.jsNotificationMessage("There was an error creating the collection.", "error");
            e.closeDialog();
        });
    },
    render: function yt() {
        var e = this.props.library;
        var t = e.collections.nestedOrderingArray();
        var r = t.map(function(e, t) {
            return React.createElement("option", {
                key: e.get("key"),
                value: e.get("key")
            }, "-".repeat(e.nestingDepth), " ", e.get("name"));
        });
        r.unshift(React.createElement("option", {
            key: "emptyvalue",
            value: ""
        }, "None"));
        return React.createElement(BootstrapModalWrapper, {
            ref: "modal"
        }, React.createElement("div", {
            id: "create-collection-dialog",
            className: "create-collection-dialog",
            role: "dialog",
            title: "Create Collection",
            "data-keyboard": "true"
        }, React.createElement("div", {
            className: "modal-dialog"
        }, React.createElement("div", {
            className: "modal-content"
        }, React.createElement("div", {
            className: "modal-header"
        }, React.createElement("button", {
            type: "button",
            className: "close",
            "data-dismiss": "modal",
            "aria-hidden": "true"
        }, "×"), React.createElement("h3", null, "Create Collection")), React.createElement("div", {
            className: "new-collection-div modal-body",
            "data-role": "content"
        }, React.createElement("form", {
            method: "POST"
        }, React.createElement("div", {
            "data-role": "fieldcontain"
        }, React.createElement("label", {
            htmlFor: "new-collection-title-input"
        }, "Collection Name"), React.createElement("input", {
            onChange: this.handleNameChange,
            className: "new-collection-title-input form-control",
            type: "text"
        })), React.createElement("div", {
            "data-role": "fieldcontain"
        }, React.createElement("label", {
            htmlFor: "new-collection-parent"
        }, "Parent Collection"), React.createElement("select", {
            onChange: this.handleCollectionChange,
            className: "collectionKey-select new-collection-parent form-control",
            defaultValue: ""
        }, r)))), React.createElement("div", {
            className: "modal-footer"
        }, React.createElement("button", {
            onClick: this.closeDialog,
            className: "btn",
            "data-dismiss": "modal",
            "aria-hidden": "true"
        }, "Close"), React.createElement("button", {
            onClick: this.createCollection,
            className: "btn btn-primary createButton"
        }, "Create"))))));
    }
});

"use strict";

Zotero.ui.widgets.reactcreateItemDialog = {};

Zotero.ui.widgets.reactcreateItemDialog.init = function(e) {
    Z.debug("createItemDialog widget init", 3);
    var t = Zotero.ui.getAssociatedLibrary(e);
    var r = ReactDOM.render(React.createElement(CreateItemDialog, {
        library: t
    }), document.getElementById("create-item-dialog"));
    t.listen("createItem", function(e) {
        Z.debug("Opening createItem dialog");
        Z.debug(e);
        var t = e.itemType;
        Z.debug(t);
        r.setState({
            itemType: t
        });
        r.openDialog();
    }, {});
};

var CreateItemDialog = React.createClass({
    displayName: "CreateItemDialog",
    getInitialState: function vt() {
        return {
            title: "",
            itemType: "document"
        };
    },
    handleTitleChange: function Zt(e) {
        this.setState({
            title: e.target.value
        });
    },
    createItem: function wt() {
        var e = this;
        var t = this.props.library;
        var r = this.state.itemType;
        var a = Zotero.state.getUrlVar("collectionKey");
        var o = e.state.title;
        if (o == "") {
            o = "Untitled";
        }
        var i = new Zotero.Item();
        i.initEmpty(r).then(function() {
            i.associateWithLibrary(t);
            i.set("title", o);
            if (a) {
                i.addToCollection(a);
            }
            return Zotero.ui.saveItem(i);
        }).then(function(t) {
            var r = i.get("key");
            Zotero.state.setUrlVar("itemKey", r);
            Zotero.state.pushState();
            e.closeDialog();
        })["catch"](function(t) {
            Zotero.error(t);
            Zotero.ui.jsNotificationMessage("There was an error creating the item.", "error");
            e.closeDialog();
        });
    },
    openDialog: function It() {
        this.refs.modal.open();
    },
    closeDialog: function Ct(e) {
        this.refs.modal.close();
    },
    render: function Rt() {
        return React.createElement(BootstrapModalWrapper, {
            ref: "modal"
        }, React.createElement("div", {
            id: "create-item-dialog",
            className: "create-item-dialog",
            role: "dialog",
            title: "Create Item",
            "data-keyboard": "true"
        }, React.createElement("div", {
            className: "modal-dialog"
        }, React.createElement("div", {
            className: "modal-content"
        }, React.createElement("div", {
            className: "modal-header"
        }, React.createElement("button", {
            type: "button",
            className: "close",
            "data-dismiss": "modal",
            "aria-hidden": "true"
        }, "×"), React.createElement("h3", null, "Create Item")), React.createElement("div", {
            className: "new-item-div modal-body",
            "data-role": "content"
        }, React.createElement("form", {
            method: "POST"
        }, React.createElement("div", {
            "data-role": "fieldcontain"
        }, React.createElement("label", {
            htmlFor: "new-item-title-input"
        }, "Title"), React.createElement("input", {
            onChange: this.handleTitleChange,
            id: "new-item-title-input",
            className: "new-item-title-input form-control",
            type: "text"
        })))), React.createElement("div", {
            className: "modal-footer"
        }, React.createElement("button", {
            className: "btn",
            "data-dismiss": "modal",
            "aria-hidden": "true"
        }, "Close"), React.createElement("button", {
            onClick: this.createItem,
            className: "btn btn-primary createButton"
        }, "Create"))))));
    }
});

"use strict";

Zotero.ui.widgets.reactdeleteCollectionDialog = {};

Zotero.ui.widgets.reactdeleteCollectionDialog.init = function(e) {
    Z.debug("deletecollectionsdialog widget init", 3);
    var t = Zotero.ui.getAssociatedLibrary(e);
    var r = ReactDOM.render(React.createElement(DeleteCollectionDialog, {
        library: t
    }), document.getElementById("delete-collection-dialog"));
    t.listen("deleteCollectionDialog", function() {
        r.setState({
            collectionKey: Zotero.state.getUrlVar("collectionKey")
        });
        r.openDialog();
    }, {
        widgetEl: e
    });
};

var DeleteCollectionDialog = React.createClass({
    displayName: "DeleteCollectionDialog",
    getInitialState: function Et() {
        return {
            collectionKey: null
        };
    },
    handleCollectionChange: function St(e) {
        this.setState({
            parentCollection: e.target.value
        });
    },
    deleteCollection: function kt() {
        Z.debug("DeleteCollectionDialog.deleteCollection", 3);
        var e = this;
        var t = this.props.library;
        var r = t.collections.getCollection(this.state.collectionKey);
        if (!r) {
            Zotero.ui.jsNotificationMessage("Selected collection not found", "error");
            return false;
        }
        r.remove().then(function() {
            delete Zotero.state.pathVars["collectionKey"];
            t.collections.dirty = true;
            t.collections.initSecondaryData();
            Zotero.state.pushState();
            Zotero.ui.jsNotificationMessage(r.get("title") + " removed", "confirm");
            e.closeDialog();
        })["catch"](Zotero.catchPromiseError);
        return false;
    },
    openDialog: function Tt() {
        if (!this.state.collectionKey) {
            Z.error("DeleteCollectionDialog opened with no collectionKey");
        }
        this.refs.modal.open();
    },
    closeDialog: function Dt(e) {
        this.refs.modal.close();
    },
    render: function xt() {
        var e = this.props.library;
        var t = e.collections.getCollection(this.state.collectionKey);
        if (!t) {
            return null;
        }
        return React.createElement(BootstrapModalWrapper, {
            ref: "modal"
        }, React.createElement("div", {
            id: "delete-collection-dialog",
            className: "delete-collection-dialog",
            role: "dialog",
            title: "Delete Collection",
            "data-keyboard": "true"
        }, React.createElement("div", {
            className: "modal-dialog"
        }, React.createElement("div", {
            className: "modal-content"
        }, React.createElement("div", {
            className: "modal-header"
        }, React.createElement("button", {
            type: "button",
            className: "close",
            "data-dismiss": "modal",
            "aria-hidden": "true"
        }, "×"), React.createElement("h3", null, "Delete Collection")), React.createElement("div", {
            className: "delete-collection-div modal-body"
        }, React.createElement("p", null, 'Really delete collection "', t.get("title"), '"?')), React.createElement("div", {
            className: "modal-footer"
        }, React.createElement("button", {
            className: "btn",
            "data-dismiss": "modal",
            "aria-hidden": "true"
        }, "Close"), React.createElement("button", {
            onClick: this.deleteCollection,
            className: "btn btn-primary deleteButton"
        }, "Delete"))))));
    }
});

"use strict";

Zotero.ui.widgets.reactexportItemsDialog = {};

Zotero.ui.widgets.reactexportItemsDialog.init = function(e) {
    Z.debug("exportItemDialog widget init", 3);
    var t = Zotero.ui.getAssociatedLibrary(e);
    var r = ReactDOM.render(React.createElement(ExportItemsDialog, {
        library: t
    }), document.getElementById("export-dialog"));
    t.listen("exportItemsDialog", function() {
        Z.debug("opening export dialog");
        r.openDialog();
    }, {});
    t.listen("displayedItemsChanged", function() {
        r.forceUpdate();
    }, {});
};

var ExportItemsDialog = React.createClass({
    displayName: "ExportItemsDialog",
    getInitialState: function Nt() {
        return {};
    },
    openDialog: function jt() {
        this.refs.modal.open();
    },
    closeDialog: function Lt(e) {
        this.refs.modal.close();
    },
    render: function Jt() {
        var e = this.props.library;
        var t = Zotero.ui.getItemsConfig(e);
        var r = Zotero.url.exportUrls(t);
        var a = Object.keys(r).map(function(e) {
            var t = r[e];
            return React.createElement("li", {
                key: e
            }, React.createElement("a", {
                href: t,
                target: "_blank",
                className: "export-link",
                "data-exportformat": e
            }, Zotero.config.exportFormatsMap[e]));
        });
        return React.createElement(BootstrapModalWrapper, {
            ref: "modal"
        }, React.createElement("div", {
            id: "export-items-dialog",
            className: "export-items-dialog",
            role: "dialog",
            title: "Library Settings",
            "data-keyboard": "true"
        }, React.createElement("div", {
            className: "modal-dialog"
        }, React.createElement("div", {
            className: "modal-content"
        }, React.createElement("div", {
            className: "modal-header"
        }, React.createElement("button", {
            type: "button",
            className: "close",
            "data-dismiss": "modal",
            "aria-hidden": "true"
        }, "×"), React.createElement("h3", null, "Export")), React.createElement("div", {
            className: "modal-body",
            "data-role": "content"
        }, React.createElement("div", {
            className: "export-list"
        }, React.createElement("ul", {
            id: "export-formats-ul"
        }, a))), React.createElement("div", {
            className: "modal-footer"
        }, React.createElement("button", {
            className: "btn btn-default",
            "data-dismiss": "modal",
            "aria-hidden": "true"
        }, "Close"))))));
    }
});

"use strict";

Zotero.ui.widgets.reactfilterGuide = {};

Zotero.ui.widgets.reactfilterGuide.init = function(e) {
    Z.debug("widgets.filterGuide.init", 3);
    var t = Zotero.ui.getAssociatedLibrary(e);
    var r = ReactDOM.render(React.createElement(FilterGuide, {
        library: t
    }), document.getElementById("filter-guide"));
    t.listen("displayedItemsChanged", r.refreshFilters, {});
    t.listen("displayedItemChanged", r.refreshFilters, {});
    t.listen("updateFilterGuide", r.refreshFilters, {});
    t.listen("selectedCollectionChanged", r.refreshFilters, {});
    t.listen("cachedDataLoaded", r.refreshFilters, {});
    t.listen("libraryCollectionsUpdated", r.refreshFilters, {});
};

var FilterGuide = React.createClass({
    displayName: "FilterGuide",
    getInitialState: function Ot() {
        return {
            collectionKey: "",
            tags: [],
            query: ""
        };
    },
    refreshFilters: function At(e) {
        var t = this.props.library;
        var r = Zotero.ui.getItemsConfig(t);
        this.setState({
            collectionKey: r["collectionKey"],
            tags: r["tag"],
            query: r["q"]
        });
    },
    clearFilter: function Pt(e) {
        e.preventDefault();
        Z.debug("widgets.filterGuide.clearFilter", 3);
        var t = this.props.library;
        var r = J(e.currentTarget);
        var a = r.data("collectionkey");
        var o = r.data("tag");
        var i = r.data("query");
        if (a) {
            Zotero.state.unsetUrlVar("collectionKey");
            this.setState({
                collectionKey: ""
            });
        }
        if (o) {
            Zotero.state.toggleTag(o);
            this.setState({
                tags: Zotero.state.getUrlVar("tag")
            });
        }
        if (i) {
            t.trigger("clearLibraryQuery");
            this.setState({
                query: ""
            });
            return;
        }
        Zotero.state.pushState();
    },
    render: function Ut() {
        var e = this.props.library;
        var t = null;
        var r = null;
        var a = null;
        if (this.state.collectionKey != "") {
            var o = e.collections.getCollection(this.state.collectionKey);
            if (o) {
                t = React.createElement("li", {
                    className: "filterguide-entry"
                }, React.createElement("a", {
                    onClick: this.clearFilter,
                    href: "#",
                    "data-collectionkey": this.state.collectionKey
                }, React.createElement("span", {
                    className: "glyphicons fonticon glyphicons-folder-open"
                }), React.createElement("span", {
                    className: "filterguide-label"
                }, o.get("name")), React.createElement("span", {
                    className: "glyphicons fonticon glyphicons-remove"
                })));
            }
        }
        if (this.state.tags) {
            r = this.state.tags.map(function(e) {
                return React.createElement("li", {
                    className: "filterguide-entry"
                }, React.createElement("a", {
                    onClick: this.clearFilter,
                    href: "#",
                    "data-tag": e
                }, React.createElement("span", {
                    className: "glyphicons fonticon glyphicons-tag"
                }), React.createElement("span", {
                    className: "filterguide-label"
                }, e), React.createElement("span", {
                    className: "glyphicons fonticon glyphicons-remove"
                })));
            });
        }
        if (this.state.query) {
            a = React.createElement("li", {
                className: "filterguide-entry"
            }, React.createElement("a", {
                onClick: this.clearFilter,
                href: "#",
                "data-query": this.state.query
            }, React.createElement("span", {
                className: "glyphicons fonticon glyphicons-search"
            }), React.createElement("span", {
                className: "filterguide-label"
            }, this.state.query), React.createElement("span", {
                className: "glyphicons fonticon glyphicons-remove"
            })));
        }
        return React.createElement("div", {
            className: "filter-guide col-12"
        }, React.createElement("ul", {
            className: "filterguide-list"
        }, t, r, a));
    }
});

"use strict";

var _extends = Object.assign || function(e) {
    for (var t = 1; t < arguments.length; t++) {
        var r = arguments[t];
        for (var a in r) {
            if (Object.prototype.hasOwnProperty.call(r, a)) {
                e[a] = r[a];
            }
        }
    }
    return e;
};

Zotero.ui.widgets.reactitem = {};

Zotero.ui.widgets.reactitem.init = function(e) {
    var t = Zotero.ui.getAssociatedLibrary(e);
    var r = ReactDOM.render(React.createElement(ItemDetails, {
        library: t
    }), document.getElementById("item-widget-div"));
    Zotero.ui.widgets.reactitem.reactInstance = r;
};

Zotero.ui.editMatches = function(e, t) {
    if (e === null || t === null) {
        return false;
    }
    if (t.field != e.field) {
        return false;
    }
    if (t.creatorIndex != e.creatorIndex) {
        return false;
    }
    if (e.tagIndex != t.tagIndex) {
        return false;
    }
    return true;
};

Zotero.ui.genericDisplayedFields = function(e) {
    var t = Object.keys(e.apiObj.data).filter(function(t) {
        if (e.hideFields.indexOf(t) != -1) {
            return false;
        }
        if (!e.fieldMap.hasOwnProperty(t)) {
            return false;
        }
        if (t == "title" || t == "creators" || t == "itemType") {
            return false;
        }
        return true;
    });
    return t;
};

Zotero.ui.widgets.reactitem.editFields = function(e) {
    var t = [ {
        field: "itemType"
    }, {
        field: "title"
    } ];
    var r = e.get("creators");
    r.forEach(function(e, r) {
        t.push({
            field: "creatorType",
            creatorIndex: r
        });
        if (e.name) {
            t.push({
                field: "name",
                creatorIndex: r
            });
        } else {
            t.push({
                field: "lastName",
                creatorIndex: r
            });
            t.push({
                field: "firstName",
                creatorIndex: r
            });
        }
    });
    var a = Zotero.ui.genericDisplayedFields(e);
    a.forEach(function(e, r) {
        t.push({
            field: e
        });
    });
    return t;
};

Zotero.ui.widgets.reactitem.nextEditField = function(e, t) {
    if (!t || !t.field) {
        return null;
    }
    var r = Zotero.ui.widgets.reactitem.editFields(e);
    var a;
    for (var o = 0; o < r.length; o++) {
        if (r[o].field == t.field) {
            if (r[o].creatorIndex == t.creatorIndex) {
                a = o;
            }
        }
    }
    if (a == r.length) {
        return r[0];
    } else {
        return r[o + 1];
    }
};

var CreatorRow = React.createClass({
    displayName: "CreatorRow",
    getDefaultProps: function Ft() {
        return {
            item: null,
            library: null,
            creatorIndex: 0,
            edit: null
        };
    },
    render: function Mt() {
        if (this.props.item == null) {
            return null;
        }
        var e = this.props.item;
        var t = e.get("creators")[this.props.creatorIndex];
        var r = this.props.edit;
        var a = null;
        if (t.name && t.name != "") {
            a = React.createElement(ItemField, _extends({}, this.props, {
                key: "name",
                field: "name"
            }));
        } else {
            a = [ React.createElement(ItemField, _extends({}, this.props, {
                key: "lastName",
                field: "lastName"
            })), ", ", React.createElement(ItemField, _extends({}, this.props, {
                key: "firstName",
                field: "firstName"
            })) ];
        }
        return React.createElement("tr", {
            className: "creator-row"
        }, React.createElement("th", null, React.createElement(ItemField, _extends({}, this.props, {
            field: "creatorType"
        }))), React.createElement("td", null, a, React.createElement("div", {
            className: "btn-toolbar",
            role: "toolbar"
        }, React.createElement(ToggleCreatorFieldButton, this.props), React.createElement(AddRemoveCreatorFieldButtons, this.props))));
    }
});

var ToggleCreatorFieldButton = React.createClass({
    displayName: "ToggleCreatorFieldButton",
    render: function _t() {
        return React.createElement("div", {
            className: "btn-group"
        }, React.createElement("button", {
            type: "button",
            className: "switch-two-field-creator-link btn btn-default",
            title: "Toggle single field creator",
            "data-itemkey": this.props.item.get("key"),
            "data-creatorindex": this.props.creatorIndex,
            onClick: this.switchCreatorFields
        }, React.createElement("span", {
            className: "fonticon glyphicons glyphicons-unchecked"
        })));
    },
    switchCreatorFields: function Kt(e) {
        var t = this.props.creatorIndex;
        var r = this.props.item;
        var a = r.get("creators");
        var o = a[t];
        if (o.name !== undefined) {
            var i = o.name.split(" ");
            if (i.length > 1) {
                o.lastName = i.splice(-1, 1)[0];
                o.firstName = i.join(" ");
            } else {
                o.lastName = o.name;
                o.firstName = "";
            }
            delete o.name;
        } else {
            if (o.firstName === "" && o.lastName === "") {
                o.name = "";
            } else {
                o.name = o.firstName + " " + o.lastName;
            }
            delete o.firstName;
            delete o.lastName;
        }
        a[t] = o;
        Zotero.ui.saveItem(r);
        Zotero.ui.widgets.reactitem.reactInstance.setState({
            item: r
        });
    }
});

var AddRemoveCreatorFieldButtons = React.createClass({
    displayName: "AddRemoveCreatorFieldButtons",
    render: function Vt() {
        return React.createElement("div", {
            className: "btn-group"
        }, React.createElement("button", {
            type: "button",
            className: "btn btn-default",
            "data-creatorindex": this.props.creatorIndex,
            onClick: this.removeCreator
        }, React.createElement("span", {
            className: "fonticon glyphicons glyphicons-minus"
        })), React.createElement("button", {
            type: "button",
            className: "btn btn-default",
            "data-creatorindex": this.props.creatorIndex,
            onClick: this.addCreator
        }, React.createElement("span", {
            className: "fonticon glyphicons glyphicons-plus"
        })));
    },
    addCreator: function qt(e) {
        Z.debug("addCreator");
        var t = this.props.item;
        var r = this.props.creatorIndex;
        var a = t.get("creators");
        var o = {
            creatorType: "author",
            firstName: "",
            lastName: ""
        };
        a.splice(r + 1, 0, o);
        Zotero.ui.widgets.reactitem.reactInstance.setState({
            item: t,
            edit: {
                field: "lastName",
                creatorIndex: r + 1
            }
        });
    },
    removeCreator: function Bt(e) {
        Z.debug("removeCreator");
        var t = this.props.creatorIndex;
        var r = this.props.item;
        var a = r.get("creators");
        a.splice(t, 1);
        Zotero.ui.saveItem(r);
        Zotero.ui.widgets.reactitem.reactInstance.setState({
            item: r
        });
    }
});

var ItemNavTabs = React.createClass({
    displayName: "ItemNavTabs",
    getDefaultProps: function zt() {
        return {
            item: null
        };
    },
    render: function Gt() {
        Z.debug("ItemNavTabs render");
        if (this.props.item == null) {
            return null;
        }
        if (!this.props.item.isSupplementaryItem()) {
            return React.createElement("ul", {
                className: "nav nav-tabs",
                role: "tablist"
            }, React.createElement("li", {
                role: "presentation",
                className: "active"
            }, React.createElement("a", {
                href: "#item-info-panel",
                "aria-controls": "item-info-panel",
                role: "tab",
                "data-toggle": "tab"
            }, "Info")), React.createElement("li", {
                role: "presentation"
            }, React.createElement("a", {
                href: "#item-children-panel",
                "aria-controls": "item-children-panel",
                role: "tab",
                "data-toggle": "tab"
            }, "Children")), React.createElement("li", {
                role: "presentation"
            }, React.createElement("a", {
                href: "#item-tags-panel",
                "aria-controls": "item-tags-panel",
                role: "tab",
                "data-toggle": "tab"
            }, "Tags")));
        }
        return null;
    }
});

var ItemFieldRow = React.createClass({
    displayName: "ItemFieldRow",
    getDefaultProps: function Wt() {
        return {
            item: null,
            edit: null
        };
    },
    render: function Ht() {
        var e = this.props.item;
        var t = this.props.field;
        var r = React.createElement(ItemField, {
            item: e,
            field: t,
            edit: this.props.edit
        });
        if (t == "url") {
            var a = e.get("url");
            return React.createElement("tr", null, React.createElement("th", null, React.createElement("a", {
                rel: "nofollow",
                href: a
            }, e.fieldMap[t])), React.createElement("td", {
                className: t
            }, r));
        } else if (t == "DOI") {
            var o = e.get("DOI");
            return React.createElement("tr", null, React.createElement("th", null, React.createElement("a", {
                rel: "nofollow",
                href: "http://dx.doi.org/" + o
            }, e.fieldMap[t])), React.createElement("td", {
                className: t
            }, r));
        } else if (Zotero.config.richTextFields[t]) {
            return React.createElement("tr", null, React.createElement("th", null, e.fieldMap[t], "}"), React.createElement("td", {
                className: t
            }, r));
        } else {
            return React.createElement("tr", null, React.createElement("th", null, e.fieldMap[t] || t), React.createElement("td", {
                className: t
            }, r));
        }
    }
});

var ItemField = React.createClass({
    displayName: "ItemField",
    getDefaultProps: function Qt() {
        return {
            item: null,
            field: null,
            edit: null,
            creatorIndex: null,
            tagIndex: null
        };
    },
    handleChange: function $t(e) {
        Z.debug("change on ItemField");
        Z.debug(e);
        var t = this.props.item;
        switch (this.props.field) {
          case "creatorType":
          case "name":
          case "firstName":
          case "lastName":
            var r = t.get("creators");
            var a = r[this.props.creatorIndex];
            a[this.props.field] = e.target.value;
            break;

          case "tag":
            var o = t.get("tags");
            var i = o[this.props.tagIndex];
            i.tag = e.target.value;
            break;

          default:
            t.set(this.props.field, e.target.value);
        }
        Zotero.ui.widgets.reactitem.reactInstance.setState({
            item: t
        });
    },
    handleBlur: function Yt(e) {
        Z.debug("blur on ItemField");
        Z.debug("handleBlur");
        this.handleChange(e);
        Zotero.ui.widgets.reactitem.reactInstance.setState({
            edit: null
        });
        Zotero.ui.saveItem(this.props.item);
    },
    handleFocus: function Xt(e) {
        Z.debug("focus on ItemField");
        var t = J(e.target).data("field");
        var r = J(e.target).data("creatorindex");
        var a = J(e.target).data("tagindex");
        var o = {
            field: t,
            creatorIndex: r,
            tagIndex: a
        };
        Z.debug(o);
        Zotero.ui.widgets.reactitem.reactInstance.setState({
            edit: o
        });
    },
    checkKey: function er(e) {
        Z.debug("ItemField checkKey");
        e.stopPropagation();
        if (e.keyCode === Zotero.ui.keyCode.ENTER) {
            Z.debug("ItemField checkKey enter");
            Z.debug(e);
            J(e.target).blur();
        }
    },
    render: function tr() {
        var e = this.props.item;
        var t = this.props.field;
        var r = false;
        var a = false;
        var o;
        switch (t) {
          case "creatorType":
          case "name":
          case "firstName":
          case "lastName":
            r = true;
            var i = this.props.creatorIndex;
            var n = e.get("creators")[i];
            o = n[t];
            var s = {
                name: "(name)",
                lastName: "(Last Name)",
                firstName: "(First Name)"
            };
            break;

          case "tag":
            a = true;
            var l = this.props.tagIndex;
            var c = e.get("tags")[l];
            o = c.tag;
            break;

          default:
            o = e.get(t);
        }
        var d = Zotero.ui.editMatches(this.props, this.props.edit);
        if (!d) {
            var u = {
                className: "editable-item-field",
                tabIndex: 0,
                "data-field": t,
                onFocus: this.handleFocus
            };
            if (r) {
                u["data-creatorindex"] = this.props.creatorIndex;
                var p = o == "" ? s[t] : o;
            } else if (a) {
                u["data-tagindex"] = this.props.tagIndex;
                var p = o;
            } else {
                var p = o == "" ? React.createElement("div", {
                    className: "empty-field-placeholder"
                }) : Zotero.ui.formatItemField(t, e);
            }
            return React.createElement("span", u, p);
        }
        var g = function b(e) {
            if (e != null) {
                e.focus();
            }
        };
        var m = {
            className: "form-control item-field-control " + this.props.field,
            name: t,
            defaultValue: o,
            onKeyDown: this.checkKey,
            onBlur: this.handleBlur,
            creatorindex: this.props.creatorIndex,
            tagindex: this.props.tagIndex,
            ref: g
        };
        if (r) {
            m.placeholder = s[t];
        }
        switch (this.props.field) {
          case null:
            return null;
            break;

          case "itemType":
            var f = e.itemTypes.map(function(e) {
                return React.createElement("option", {
                    key: e.itemType,
                    label: e.localized,
                    value: e.itemType
                }, e.localized);
            });
            return React.createElement("select", m, f);
            break;

          case "creatorType":
            var h = e.creatorTypes[e.get("itemType")].map(function(e) {
                return React.createElement("option", {
                    key: e.creatorType,
                    label: e.localized,
                    value: e.creatorType
                }, e.localized);
            });
            return React.createElement("select", _extends({
                id: "creatorType"
            }, m, {
                "data-creatorindex": this.props.creatorIndex
            }), h);
            break;

          default:
            if (Zotero.config.largeFields[this.props.field]) {
                return React.createElement("textarea", m);
            } else if (Zotero.config.richTextFields[this.props.field]) {
                return React.createElement("textarea", _extends({}, m, {
                    className: "rte default"
                }));
            } else {
                return React.createElement("input", _extends({
                    type: "text"
                }, m));
            }
        }
    }
});

var ItemInfoPanel = React.createClass({
    displayName: "ItemInfoPanel",
    getDefaultProps: function rr() {
        return {
            item: null,
            loading: false,
            edit: null
        };
    },
    render: function ar() {
        Z.debug("ItemInfoPanel render");
        var e = this;
        var t = this.props.library;
        var r = this.props.item;
        Z.debug("ItemInfoPanel render: items.totalResults: " + t.items.totalResults);
        var a = React.createElement("p", {
            className: "item-count",
            hidden: !this.props.libraryItemsLoaded
        }, t.items.totalResults + " items in this view");
        var o = this.props.edit;
        if (r == null) {
            return React.createElement("div", {
                id: "item-info-panel",
                role: "tabpanel",
                className: "item-details-div tab-pane active"
            }, React.createElement(LoadingSpinner, {
                loading: this.props.loading
            }), a);
        }
        var i = r.get("key");
        var n = r.owningLibrary.libraryType;
        var s = false;
        if (r.get("parentItem")) {
            s = t.websiteUrl({
                itemKey: r.get("parentItem")
            });
        }
        var l = s ? React.createElement("a", {
            href: s,
            className: "item-select-link",
            "data-itemkey": r.get("parentItem")
        }, "Parent Item") : null;
        var c;
        if (n == "user") {
            c = React.createElement("span", {
                id: "libraryUserID",
                title: r.apiObj.library.id
            });
        } else {
            c = React.createElement("span", {
                id: "libraryGroupID",
                title: r.apiObj.library.id
            });
        }
        var d = null;
        if (n == "group") {
            d = React.createElement("tr", null, React.createElement("th", null, "Added by"), React.createElement("td", {
                className: "user-creator"
            }, React.createElement("a", {
                href: r.apiObj.meta.createdByUser.links.alternate.href,
                className: "user-link"
            }, r.apiObj.meta.createdByUser.name)));
        }
        var u = [];
        var p = r.get("creators");
        if (p.length == 0) {
            p.push({
                lastName: "",
                firstName: ""
            });
        }
        if (r.isSupplementaryItem()) {
            u = null;
        } else {
            u = r.get("creators").map(function(e, a) {
                return React.createElement(CreatorRow, {
                    key: a,
                    library: t,
                    creatorIndex: a,
                    item: r,
                    edit: o
                });
            });
        }
        var g = [];
        var m = Zotero.ui.genericDisplayedFields(r);
        m.forEach(function(t) {
            g.push(React.createElement(ItemFieldRow, _extends({
                key: t
            }, e.props, {
                field: t
            })));
        });
        var f = [ "itemType", "title" ].map(function(t) {
            return React.createElement(ItemFieldRow, _extends({
                key: t
            }, e.props, {
                field: t
            }));
        });
        return React.createElement("div", {
            id: "item-info-panel",
            role: "tabpanel",
            className: "item-details-div tab-pane active"
        }, React.createElement(LoadingSpinner, {
            loading: this.props.loading
        }), l, c, React.createElement("table", {
            className: "item-info-table table",
            "data-itemkey": i
        }, React.createElement("tbody", null, d, f, u, g)));
    }
});

var TagListRow = React.createClass({
    displayName: "TagListRow",
    getDefaultProps: function or() {
        return {
            tagIndex: 0,
            tag: {
                tag: ""
            },
            item: null,
            library: null,
            edit: null
        };
    },
    removeTag: function ir(e) {
        var t = this.props.tag.tag;
        var r = this.props.item;
        var a = this.props.tagIndex;
        var o = r.get("tags");
        o.splice(a, 1);
        Zotero.ui.saveItem(r);
        Zotero.ui.widgets.reactitem.reactInstance.setState({
            item: r
        });
    },
    render: function nr() {
        return React.createElement("div", {
            className: "row item-tag-row"
        }, React.createElement("div", {
            className: "col-xs-1"
        }, React.createElement("span", {
            className: "glyphicons fonticon glyphicons-tag"
        })), React.createElement("div", {
            className: "col-xs-9"
        }, React.createElement(ItemField, _extends({}, this.props, {
            field: "tag"
        }))), React.createElement("div", {
            className: "col-xs-2"
        }, React.createElement("button", {
            type: "button",
            className: "remove-tag-link btn btn-default",
            onClick: this.removeTag
        }, React.createElement("span", {
            className: "glyphicons fonticon glyphicons-minus"
        }))));
    }
});

var ItemTagsPanel = React.createClass({
    displayName: "ItemTagsPanel",
    getInitialState: function sr() {
        return {
            newTagString: ""
        };
    },
    newTagChange: function lr(e) {
        this.setState({
            newTagString: e.target.value
        });
    },
    checkKey: function cr(e) {
        Z.debug("New tag checkKey");
        e.stopPropagation();
        if (e.keyCode === Zotero.ui.keyCode.ENTER) {
            Z.debug(e);
            var t = this.props.item;
            var r = t.get("tags");
            r.push({
                tag: e.target.value
            });
            Zotero.ui.saveItem(t);
            this.setState({
                newTagString: ""
            });
            Zotero.ui.widgets.reactitem.reactInstance.setState({
                item: t
            });
        }
    },
    render: function dr() {
        Z.debug("ItemTagsPanel render");
        var e = this;
        var t = this.props.item;
        var r = this.props.library;
        if (t == null) {
            return React.createElement("div", {
                id: "item-tags-panel",
                role: "tabpanel",
                className: "item-tags-div tab-pane"
            });
        }
        var a = [];
        var a = t.apiObj.data.tags.map(function(t, r) {
            return React.createElement(TagListRow, _extends({
                key: t.tag
            }, e.props, {
                tag: t,
                tagIndex: r
            }));
        });
        return React.createElement("div", {
            id: "item-tags-panel",
            role: "tabpanel",
            className: "item-tags-div tab-pane"
        }, React.createElement("p", null, React.createElement("span", {
            className: "tag-count"
        }, t.get("tags").length), " tags"), React.createElement("button", {
            className: "add-tag-button btn btn-default"
        }, "Add Tag"), React.createElement("div", {
            className: "item-tags-list"
        }, a), React.createElement("div", {
            className: "add-tag-form form-horizontal"
        }, React.createElement("div", {
            className: "form-group"
        }, React.createElement("div", {
            className: "col-xs-1"
        }, React.createElement("label", {
            htmlFor: "add-tag-input"
        }, React.createElement("span", {
            className: "glyphicons fonticon glyphicons-tag"
        }))), React.createElement("div", {
            className: "col-xs-11"
        }, React.createElement("input", {
            type: "text",
            onKeyDown: this.checkKey,
            onChange: this.newTagChange,
            value: this.state.newTagString,
            id: "add-tag-input",
            className: "add-tag-input form-control"
        })))));
    }
});

var ItemChildrenPanel = React.createClass({
    displayName: "ItemChildrenPanel",
    getDefaultProps: function ur() {
        return {
            childItems: []
        };
    },
    triggerUpload: function pr() {
        this.props.library.trigger("uploadAttachment");
    },
    render: function gr() {
        Z.debug("ItemChildrenPanel render");
        var e = this.props.childItems.map(function(e, t) {
            var r = e.get("title");
            var a = Zotero.url.itemHref(e);
            var o = e.itemTypeIconClass();
            var i = e.get("key");
            if (e.itemType == "note") {
                return React.createElement("li", {
                    key: i
                }, React.createElement("span", {
                    className: "fonticon barefonticon " + o
                }), React.createElement("a", {
                    className: "item-select-link",
                    "data-itemkey": e.get("key"),
                    href: a,
                    title: r
                }, r));
            } else if (e.attachmentDownloadUrl == false) {
                return React.createElement("li", {
                    key: i
                }, React.createElement("span", {
                    className: "fonticon barefonticon " + o
                }), r, "(", React.createElement("a", {
                    className: "item-select-link",
                    "data-itemkey": e.get("key"),
                    href: a,
                    title: r
                }, "Attachment Details"), ")");
            } else {
                var n = Zotero.url.attachmentDownloadUrl(e);
                return React.createElement("li", {
                    key: i
                }, React.createElement("span", {
                    className: "fonticon barefonticon " + o
                }), React.createElement("a", {
                    className: "itemdownloadlink",
                    href: n
                }, r, " ", Zotero.url.attachmentFileDetails(e)), "(", React.createElement("a", {
                    className: "item-select-link",
                    "data-itemkey": e.get("key"),
                    href: a,
                    title: r
                }, "Attachment Details"), ")");
            }
        });
        return React.createElement("div", {
            id: "item-children-panel",
            role: "tabpanel",
            className: "item-children-div tab-pane"
        }, React.createElement("ul", {
            id: "notes-and-attachments"
        }, e), React.createElement("button", {
            type: "button",
            onClick: this.triggerUpload,
            id: "upload-attachment-link",
            className: "btn btn-primary upload-attachment-button",
            hidden: !Zotero.config.librarySettings.allowUpload
        }, "Upload File"));
    }
});

var ItemDetails = React.createClass({
    displayName: "ItemDetails",
    getInitialState: function mr() {
        return {
            item: null,
            childItems: [],
            itemLoading: false,
            childrenLoading: false,
            libraryItemsLoaded: false,
            edit: null
        };
    },
    componentWillMount: function fr() {
        var e = this;
        var t = this.props.library;
        t.listen("displayedItemChanged modeChanged", e.loadItem, {});
        t.listen("uploadSuccessful", e.refreshChildren, {});
        t.listen("tagsChanged", e.updateTypeahead, {});
        t.listen("showChildren", e.refreshChildren, {});
        t.trigger("displayedItemChanged");
    },
    componentDidMount: function hr() {
        return;
        var e = this;
        var t = this.props.library;
        var r = J("input.add-tag-input");
        var a = J("input.item-field-control.tag");
        var o = t.tags.plainList;
        if (!o) {
            o = [];
        }
        var i = new Bloodhound({
            datumTokenizer: Bloodhound.tokenizers.obj.whitespace("value"),
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            local: J.map(o, function(e) {
                return {
                    value: e
                };
            })
        });
        i.initialize();
        r.typeahead("destroy");
        a.typeahead("destroy");
        r.typeahead({
            hint: true,
            highlight: true,
            minLength: 1
        }, {
            name: "tags",
            displayKey: "value",
            source: i.ttAdapter()
        });
        a.typeahead({
            hint: true,
            highlight: true,
            minLength: 1
        }, {
            name: "tags",
            displayKey: "value",
            source: i.ttAdapter()
        });
    },
    loadItem: function br() {
        Z.debug("Zotero eventful loadItem", 3);
        var e = this;
        var t = this.props.library;
        var r = Zotero.state.getUrlVar("itemKey");
        if (!r) {
            Z.debug("No itemKey - " + r, 3);
            e.setState({
                item: null
            });
            return Promise.reject(new Error("No itemkey - " + r));
        }
        var a = t.items.getItem(r);
        if (a) {
            Z.debug("have item locally, loading details into ui", 3);
            loadingPromise = Promise.resolve(a);
        } else {
            Z.debug("must fetch item from server", 3);
            var o = {
                target: "item",
                libraryType: t.type,
                libraryID: t.libraryID,
                itemKey: r
            };
            e.setState({
                itemLoading: true
            });
            loadingPromise = t.loadItem(r);
        }
        loadingPromise.then(function(e) {
            a = e;
        }).then(function() {
            return a.getCreatorTypes(a.get("itemType"));
        }).then(function(r) {
            Z.debug("done loading necessary data; displaying item");
            e.setState({
                item: a,
                itemLoading: false
            });
            t.trigger("showChildren");
            try {
                var o = document.createEvent("HTMLEvents");
                o.initEvent("ZoteroItemUpdated", true, true);
                document.dispatchEvent(o);
            } catch (i) {
                Zotero.error("Error triggering ZoteroItemUpdated event");
            }
        });
        loadingPromise["catch"](function(e) {
            Z.error("loadItem promise failed");
            Z.error(e);
        }).then(function() {
            e.setState({
                itemLoading: false
            });
        })["catch"](Zotero.catchPromiseError);
        return loadingPromise;
    },
    refreshChildren: function yr() {
        Z.debug("reactitem.refreshChildren", 3);
        var e = this;
        var t = this.props.library;
        var r = Zotero.state.getUrlVar("itemKey");
        if (!r) {
            Z.debug("No itemKey - " + r, 3);
            return Promise.reject(new Error("No itemkey - " + r));
        }
        var a = t.items.getItem(r);
        e.setState({
            loadingChildren: true
        });
        var o = a.getChildren(t).then(function(t) {
            e.setState({
                childItems: t,
                loadingChildren: false
            });
        })["catch"](Zotero.catchPromiseError);
        return o;
    },
    updateTypeahead: function vr() {
        Z.debug("updateTypeahead", 3);
        return;
        var e = this;
        var t = this.props.library;
        if (t) {
            e.addTagTypeahead();
        }
    },
    addTagTypeahead: function Zr() {
        Z.debug("adding typeahead", 3);
        var e = this;
        var t = this.props.library;
        var r = t.tags.plainList;
        if (!r) {
            r = [];
        }
        var a = new Bloodhound({
            datumTokenizer: Bloodhound.tokenizers.obj.whitespace("value"),
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            local: J.map(r, function(e) {
                return {
                    value: e
                };
            })
        });
        a.initialize();
        widgetEl.find("input.taginput").typeahead("destroy");
        widgetEl.find("input.taginput").typeahead({
            hint: true,
            highlight: true,
            minLength: 1
        }, {
            name: "tags",
            displayKey: "value",
            source: a.ttAdapter()
        });
    },
    addTagTypeaheadToInput: function wr() {
        Z.debug("adding typeahead", 3);
        var e = this;
        var t = this.props.library;
        var r = t.tags.plainList;
        if (!r) {
            r = [];
        }
        var a = new Bloodhound({
            datumTokenizer: Bloodhound.tokenizers.obj.whitespace("value"),
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            local: J.map(r, function(e) {
                return {
                    value: e
                };
            })
        });
        a.initialize();
        J(element).typeahead("destroy");
        J(element).typeahead({
            hint: true,
            highlight: true,
            minLength: 1
        }, {
            name: "tags",
            displayKey: "value",
            source: a.ttAdapter()
        });
    },
    addNote: function Ir() {
        Z.debug("Zotero.ui.addNote", 3);
        var t = J(e.currentTarget);
        var r = t.closest("form");
        var a = 0;
        var o = r.find("textarea.note-text:last").data("noteindex");
        if (o) {
            a = parseInt(o, 10);
        }
        var i = a + 1;
        var n = "note_" + i;
        var s;
        s = r.find("td.notes button.add-note-button").before('<textarea cols="40" rows="24" name="' + n + '" id="' + n + '" className="rte default note-text" data-noteindex="' + n + '"></textarea>');
        Zotero.ui.init.rte("default", true, n);
    },
    addTag: function Cr() {
        Z.debug("Zotero.ui.widgets.reactitem.addTag", 3);
        var t = J(e.triggeringElement);
        var r = J(e.data.widgetEl);
        r.find(".add-tag-form").show().find(".add-tag-input").focus();
    },
    render: function Rr() {
        Z.debug("ItemDetails render");
        var e = this.props.library;
        var t = this.state.item;
        var r = this.state.childItems;
        return React.createElement("div", {
            role: "tabpanel"
        }, React.createElement(ItemNavTabs, {
            library: e,
            item: t
        }), React.createElement("div", {
            className: "tab-content"
        }, React.createElement(ItemInfoPanel, {
            library: e,
            item: t,
            loading: this.state.itemLoading,
            libraryItemsLoaded: this.state.libraryItemsLoaded,
            edit: this.state.edit
        }), React.createElement(ItemChildrenPanel, {
            library: e,
            childItems: r,
            loading: this.state.childrenLoading
        }), React.createElement(ItemTagsPanel, {
            library: e,
            item: t,
            edit: this.state.edit
        })));
    }
});

"use strict";

Zotero.ui.widgets.reactitems = {};

Zotero.ui.widgets.reactitems.init = function(e) {
    Z.debug("widgets.items.init", 3);
    var t = Zotero.ui.getAssociatedLibrary(e);
    var r = ReactDOM.render(React.createElement(ItemsTable, {
        library: t
    }), document.getElementById("library-items-div"));
    Zotero.ui.widgets.reactitems.reactInstance = r;
};

Zotero.ui.getItemsConfig = function(e) {
    var t = [ "tag", "collectionKey", "order", "sort", "q", "qmode" ];
    var r = {};
    J.each(t, function(e, t) {
        var a = Zotero.state.getUrlVar(t);
        if (a) {
            r[t] = a;
        }
    });
    var a = {
        libraryID: e.libraryID,
        libraryType: e.libraryType,
        target: "items",
        targetModifier: "top",
        limit: e.preferences.getPref("itemsPerPage")
    };
    var o = {
        order: Zotero.preferences.getPref("order"),
        sort: Zotero.preferences.getPref("sort"),
        limit: e.preferences.getPref("itemsPerPage")
    };
    var i = J.extend({}, a, o, r);
    if (e.libraryType == "user" && Zotero.Library.prototype.groupOnlyColumns.indexOf(i.order) != -1) {
        i.order = "title";
    }
    if (!i.sort) {
        i.sort = Zotero.config.sortOrdering[i.order];
    }
    if (i.tag || i.q) {
        delete i.targetModifier;
    }
    return i;
};

Zotero.ui.widgets.reactitems.scrollAtBottom = function(e) {
    if (J(e).scrollTop() + J(e).innerHeight() >= J(e)[0].scrollHeight) {
        return true;
    }
    return false;
};

var ItemsTable = React.createClass({
    displayName: "ItemsTable",
    componentWillMount: function Er() {
        var e = this;
        var t = this.props.library;
        t.listen("displayedItemsChanged", e.loadItems, {});
        t.listen("displayedItemChanged", e.selectDisplayed);
        Zotero.listen("selectedItemsChanged", function() {
            e.setState({
                selectedItemKeys: Zotero.state.getSelectedItemKeys()
            });
        });
        t.listen("loadMoreItems", e.loadMoreItems, {});
        t.trigger("displayedItemsChanged");
        J(window).on("resize", function() {
            if (!window.matchMedia("(min-width: 768px)").matches) {
                e.setState({
                    narrow: true
                });
            } else {
                e.setState({
                    narrow: false
                });
            }
        });
    },
    getDefaultProps: function Sr() {
        return {};
    },
    getInitialState: function kr() {
        return {
            moreloading: false,
            allItemsLoaded: false,
            errorLoading: false,
            items: [],
            selectedItemKeys: [],
            allSelected: false,
            displayFields: [ "title", "creator", "dateModified" ],
            order: "title",
            sort: "asc",
            narrow: false
        };
    },
    loadItems: function Tr() {
        Z.debug("Zotero eventful loadItems", 3);
        var e = this;
        var t = this.props.library;
        var r = Zotero.ui.getItemsConfig(t);
        this.setState({
            items: [],
            moreloading: true
        });
        var a = t.loadItems(r).then(function(a) {
            if (!a.loadedItems) {
                Zotero.error("expected loadedItems on response not present");
                throw "Expected response to have loadedItems";
            }
            t.items.totalResults = a.totalResults;
            e.setState({
                items: a.loadedItems,
                moreloading: false,
                sort: r.sort,
                order: r.order
            });
        })["catch"](function(t) {
            Z.error(t);
            e.setState({
                errorLoading: true,
                moreloading: false,
                sort: r.sort,
                order: r.order
            });
        });
        return a;
    },
    loadMoreItems: function Dr() {
        Z.debug("loadMoreItems", 3);
        var e = this;
        var t = this.props.library;
        if (e.state.moreloading) {
            return;
        }
        if (e.state.allItemsLoaded) {
            return;
        }
        e.setState({
            moreloading: true
        });
        var t = e.props.library;
        var r = Zotero.ui.getItemsConfig(t);
        var a = e.state.items.length;
        r.start = a;
        var o = t.loadItems(r).then(function(t) {
            if (!t.loadedItems) {
                Zotero.error("expected loadedItems on response not present");
                throw "Expected response to have loadedItems";
            }
            var r = e.state.items.concat(t.loadedItems);
            e.setState({
                items: r,
                moreloading: false
            });
            var a = r.length;
            if (t.totalResults == a) {
                e.setState({
                    allItemsLoaded: true
                });
            }
        })["catch"](function(t) {
            Z.error(t);
            e.setState({
                errorLoading: true,
                moreloading: false
            });
        });
    },
    resortItems: function xr(e) {
        Z.debug(".field-table-header clicked", 3);
        e.preventDefault();
        var t = this;
        var r = this.props.library;
        var a = this.state.order;
        var o = this.state.sort;
        var i = J(e.target).data("columnfield");
        var n;
        if (i != a) {
            n = Zotero.config.sortOrdering[i];
        } else {
            if (o == "asc") {
                n = "desc";
            } else {
                n = "asc";
            }
        }
        if (r.sortableColumns.indexOf(i) == -1) {
            return false;
        }
        if (!i) {
            Zotero.ui.jsNotificationMessage("no order field mapped to column");
            return false;
        }
        Zotero.state.pathVars["order"] = i;
        Zotero.state.pathVars["sort"] = n;
        Zotero.state.pushState();
        r.preferences.setPref("sortField", i);
        r.preferences.setPref("sortOrder", n);
        r.preferences.setPref("order", i);
        r.preferences.setPref("sort", n);
        Zotero.preferences.setPref("order", i);
        Zotero.preferences.setPref("sort", n);
    },
    selectDisplayed: function Nr() {
        Z.debug("widgets.items.selectDisplayed", 3);
        Zotero.state.selectedItemKeys = [];
        this.setState({
            selectedItemKeys: Zotero.state.getSelectedItemKeys(),
            allSelected: false
        });
    },
    fixTableHeaders: function jr() {
        var e = this.refs.itemsTable;
        var t = J(e);
        var r = [];
        t.find("tbody tr").first().find("td").each(function(e, a) {
            var o = J(a).width();
            r.push(o);
            t.find("thead th").eq(e).width(o);
        });
        var a = t.find("thead").height();
        t.find("thead").css("position", "fixed").css("margin-top", -a).css("background-color", "white").css("z-index", 10);
        t.find("tbody").css("margin-top", a);
        t.css("margin-top", a);
    },
    handleSelectAllChange: function Lr(e) {
        var t = this.props.library;
        var r = [];
        var a = false;
        if (e.target.checked) {
            a = true;
            this.state.items.forEach(function(e) {
                r.push(e.get("key"));
            });
        } else {
            var o = Zotero.state.getUrlVar("itemKey");
            if (o) {
                r.push(o);
            }
        }
        Zotero.state.selectedItemKeys = r;
        this.setState({
            selectedItemKeys: r,
            allSelected: a
        });
        t.trigger("selectedItemsChanged", {
            selectedItemKeys: r
        });
        if (r.length === 0) {
            t.trigger("displayedItemChanged");
        }
    },
    nonreactBind: function Jr() {
        Zotero.eventful.initTriggers();
        if (J("body").hasClass("lib-body")) {
            this.fixTableHeaders(J("#field-table"));
        }
    },
    componentDidMount: function Or() {
        this.nonreactBind();
    },
    componentDidUpdate: function Ar() {
        this.nonreactBind();
    },
    render: function Pr() {
        var e = this;
        var t = this.props.library;
        var r = this.state.narrow;
        var a = this.state.order;
        var o = this.state.sort;
        var i = this.state.moreloading;
        var n = t.libraryString;
        var s = this.state.selectedItemKeys;
        var l = {};
        s.forEach(function(e) {
            l[e] = true;
        });
        var c;
        if (o == "desc") {
            c = React.createElement("span", {
                className: "glyphicon fonticon glyphicon-chevron-down pull-right"
            });
        } else {
            c = React.createElement("span", {
                className: "glyphicon fonticon glyphicon-chevron-up pull-right"
            });
        }
        var d = [ React.createElement("th", {
            key: "checkbox-header"
        }, React.createElement("input", {
            type: "checkbox",
            className: "itemlist-editmode-checkbox all-checkbox",
            name: "selectall",
            checked: this.state.allSelected,
            onChange: this.handleSelectAllChange
        })) ];
        if (r) {
            d.push(React.createElement("th", {
                key: "single-cell-header",
                className: "eventfultrigger clickable",
                "data-library": t.libraryString,
                "data-triggers": "chooseSortingDialog"
            }, Zotero.Item.prototype.fieldMap[a], c));
        } else {
            var u = this.state.displayFields.map(function(t, r) {
                var i = Zotero.Library.prototype.sortableColumns.indexOf(t) != -1;
                var n = t == a ? "selected-order sort-" + o + " " : "";
                var s = null;
                if (t == a) {
                    s = c;
                }
                return React.createElement("th", {
                    key: t,
                    onClick: e.resortItems,
                    className: "field-table-header " + n + (i ? "clickable " : ""),
                    "data-columnfield": t
                }, Zotero.Item.prototype.fieldMap[t] ? Zotero.Item.prototype.fieldMap[t] : t, s);
            });
            d = d.concat(u);
        }
        var p = this.state.items.map(function(e) {
            var t = l.hasOwnProperty(e.get("key")) ? true : false;
            var a = {
                key: e.get("key"),
                item: e,
                selected: t,
                narrow: r
            };
            return React.createElement(ItemRow, a);
        });
        return React.createElement("form", {
            className: "item-select-form",
            method: "POST"
        }, React.createElement("table", {
            id: "field-table",
            ref: "itemsTable",
            className: "wide-items-table table table-striped"
        }, React.createElement("thead", null, React.createElement("tr", null, d)), React.createElement("tbody", null, p)), React.createElement(LoadingError, {
            errorLoading: this.state.errorLoading
        }), React.createElement(LoadingSpinner, {
            loading: this.state.moreloading
        }));
    }
});

var ItemRow = React.createClass({
    displayName: "ItemRow",
    getDefaultProps: function Ur() {
        return {
            displayFields: [ "title", "creatorSummary", "dateModified" ],
            selected: false,
            item: {},
            narrow: false
        };
    },
    handleSelectChange: function Fr(e) {
        var t = this.props.item.get("key");
        Zotero.state.toggleItemSelected(t);
        selected = Zotero.state.getSelectedItemKeys();
        Zotero.ui.widgets.reactitems.reactInstance.setState({
            selectedItemKeys: selected
        });
        Zotero.ui.widgets.reactitems.reactInstance.props.library.trigger("selectedItemsChanged", {
            selectedItemKeys: selected
        });
    },
    handleItemLinkClick: function Mr(e) {
        e.preventDefault();
        var t = J(e.target).data("itemkey");
        Zotero.state.pathVars.itemKey = t;
        Zotero.state.pushState();
    },
    render: function _r() {
        var e = this;
        var t = this.props.item;
        var r = this.props.selected;
        if (!this.props.narrow) {
            var a = this.props.displayFields.map(function(r) {
                return React.createElement("td", {
                    onClick: e.handleItemLinkClick,
                    key: r,
                    className: r,
                    "data-itemkey": t.get("key")
                }, React.createElement("a", {
                    onClick: e.handleItemLinkClick,
                    className: "item-select-link",
                    "data-itemkey": t.get("key"),
                    href: Zotero.url.itemHref(t),
                    title: t.get(r)
                }, Zotero.ui.formatItemField(r, t, true)));
            });
            return React.createElement("tr", {
                className: r ? "highlighed" : ""
            }, React.createElement("td", {
                className: "edit-checkbox-td",
                "data-itemkey": t.get("key")
            }, React.createElement("input", {
                type: "checkbox",
                onChange: this.handleSelectChange,
                checked: r,
                className: "itemlist-editmode-checkbox itemKey-checkbox",
                name: "selectitem-" + t.get("key"),
                "data-itemkey": t.get("key")
            })), a);
        } else {
            return React.createElement("tr", {
                className: r ? "highlighed" : "",
                "data-itemkey": t.get("key")
            }, React.createElement("td", {
                className: "edit-checkbox-td",
                "data-itemkey": t.get("key")
            }, React.createElement("input", {
                type: "checkbox",
                className: "itemlist-editmode-checkbox itemKey-checkbox",
                name: "selectitem-" + t.get("key"),
                "data-itemkey": t.get("key")
            })), React.createElement(SingleCellItemField, {
                onClick: e.handleItemLinkClick,
                item: t,
                displayFields: this.props.displayFields
            }));
        }
    }
});

var SingleCellItemField = React.createClass({
    displayName: "SingleCellItemField",
    render: function Kr() {
        var e = this.props.item;
        var t = this.props.field;
        var r = [];
        this.props.displayFields.forEach(function(t) {
            var a = Zotero.Item.prototype.fieldMap[t] ? Zotero.Item.prototype.fieldMap[t] + ":" : "";
            if (t == "title") {
                r.push(React.createElement("span", {
                    key: "itemTypeIcon",
                    className: "sprite-icon pull-left sprite-treeitem-" + e.itemTypeImageClass()
                }));
                r.push(React.createElement(ColoredTags, {
                    key: "coloredTags",
                    item: e
                }));
                r.push(React.createElement("b", {
                    key: "title"
                }, Zotero.ui.formatItemField(t, e, true)));
            } else if (t === "dateAdded" || t === "dateModified") {
                r.push(React.createElement("p", {
                    key: t,
                    title: e.get(t),
                    dangerouslySetInnerHtml: {
                        __html: a + Zotero.ui.formatItemDateField(t, e, true)
                    }
                }));
            } else {
                r.push(React.createElement("p", {
                    key: t,
                    title: e.get(t)
                }, a, Zotero.ui.formatItemField(t, e, true)));
            }
        });
        return React.createElement("td", {
            onClick: this.props.onClick,
            className: "single-cell-item",
            "data-itemkey": e.get("key")
        }, React.createElement("a", {
            className: "item-select-link",
            "data-itemkey": e.get("key"),
            href: Zotero.url.itemHref(e)
        }, r));
    }
});

var ColoredTags = React.createClass({
    displayName: "ColoredTags",
    render: function Vr() {
        var e = this.props.item;
        var t = e.owningLibrary;
        var r = t.matchColoredTags(e.apiObj._supplement.tagstrings);
        Z.debug("coloredTags:" + JSON.stringify(r));
        return React.createElement("span", {
            className: "coloredTags"
        });
    }
});

var ColoredTag = React.createClass({
    displayName: "ColoredTag",
    render: function qr() {
        var e = {
            color: this.props.color
        };
        return React.createElement("span", {
            style: e
        }, React.createElement("span", {
            style: e,
            className: "glyphicons fonticon glyphicons-tag"
        }));
    }
});

var LoadingSpinner = React.createClass({
    displayName: "LoadingSpinner",
    render: function Br() {
        var e = Zotero.config.baseWebsiteUrl + "/static/images/theme/broken-circle-spinner.gif";
        return React.createElement("div", {
            className: "items-spinner",
            hidden: !this.props.loading
        }, React.createElement("img", {
            className: "spinner",
            src: e
        }));
    }
});

var LoadingError = React.createClass({
    displayName: "LoadingError",
    render: function zr() {
        return React.createElement("p", {
            hidden: !this.props.errorLoading
        }, "There was an error loading your items. Please try again in a few minutes.");
    }
});

"use strict";

Zotero.ui.widgets.library = {};

Zotero.ui.widgets.library.init = function(e) {
    Z.debug("Zotero.ui.widgets.library.init");
    var t = Zotero.ui.getAssociatedLibrary(e);
    var r = ReactDOM.render(React.createElement(ReactZoteroLibrary, {
        library: t
    }), document.getElementById("library-widget"));
};

var FeedLink = React.createClass({
    displayName: "FeedLink",
    render: function Gr() {
        var e = this.props.library;
        var t = Zotero.ui.getItemsConfig(e);
        var r = Zotero.ajax.apiRequestUrl(t) + Zotero.ajax.apiQueryString(t, false);
        var a = r.replace(Zotero.config.baseApiUrl, Zotero.config.baseFeedUrl);
        var o = Zotero.url.requestReadApiKeyUrl(e.libraryType, e.libraryID, a);
        var i;
        if (!Zotero.config.librarySettings.publish) {
            i = o;
        } else {
            i = a;
        }
        return React.createElement("p", null, React.createElement("a", {
            href: i,
            type: "application/atom+xml",
            rel: "alternate",
            className: "feed-link"
        }, React.createElement("span", {
            className: "sprite-icon sprite-feed"
        }), "Subscribe to this feed"));
    }
});

var ReactZoteroLibrary = React.createClass({
    displayName: "ReactZoteroLibrary",
    componentWillMount: function Wr() {
        Z.debug("ReactZoteroLibrary componentWillMount", 3);
        var e = this;
        var t = this.props.library;
        t.loadSettings();
        t.listen("deleteIdb", function() {
            t.idbLibrary.deleteDB();
        });
        t.listen("indexedDBError", function() {
            Zotero.ui.jsNotificationMessage("There was an error initializing your library. Some data may not load properly.", "notice");
        });
        t.listen("cachedDataLoaded", function() {});
    },
    componentDidMount: function Hr() {
        var e = this;
        var t = this.props.library;
        t.listen("displayedItemsChanged", function() {
            Z.debug("ReactZoteroLibrary displayedItemsChanged");
            e.refs.itemsWidget.loadItems();
        }, {});
        t.listen("tagsChanged libraryTagsUpdated selectedTagsChanged", function() {
            Z.debug("setting tags on tagsWidget from Library");
            e.refs.tagsWidget.setState({
                tags: t.tags
            });
        });
    },
    getInitialState: function Qr() {
        return {
            activePanel: "items",
            deviceSize: "xs"
        };
    },
    reflowPanelContainer: function $r() {},
    render: function Yr() {
        Z.debug("react library render");
        var e = this.props.library;
        var t = Zotero.config.loggedInUser;
        var r = t ? t.displayName : null;
        var a = Zotero.config.baseWebsiteUrl;
        var o = a + "/settings";
        var i = a + "/messages/inbox";
        var n = a + "/download";
        var s = a + "/support";
        var l = Zotero.config.baseForumsUrl;
        var c = a + "/user/logout";
        var d = a + "/user/login";
        var u = a;
        var p = function f(e) {
            return a + "/static" + e;
        };
        var g = t.unreadMessages > 0 ? React.createElement("strong", null, "Inbox (", t.unreadMessages, ")") : "Inbox";
        var m;
        if (t) {
            m = [ React.createElement("button", {
                key: "button",
                type: "button",
                href: "#",
                className: "btn btn-default navbar-btn dropdown-toggle",
                "data-toggle": "dropdown",
                role: "button",
                "aria-expanded": "false"
            }, r, React.createElement("span", {
                className: "caret"
            }), React.createElement("span", {
                className: "sr-only"
            }, "Toggle Dropdown")), React.createElement("ul", {
                key: "listEntries",
                className: "dropdown-menu",
                role: "menu"
            }, React.createElement("li", null, React.createElement("a", {
                href: o
            }, "Settings")), React.createElement("li", null, React.createElement("a", {
                href: i
            }, g)), React.createElement("li", null, React.createElement("a", {
                href: n
            }, "Download")), React.createElement("li", {
                className: "divider"
            }), React.createElement("li", null, React.createElement("a", {
                href: s,
                className: "documentation"
            }, "Documentation")), React.createElement("li", null, React.createElement("a", {
                href: l,
                className: "forums"
            }, "Forums")), React.createElement("li", {
                className: "divider"
            }), React.createElement("li", null, React.createElement("a", {
                href: c
            }, "Log Out"))) ];
        } else {
            m = React.createElement("div", {
                className: "btn-group"
            }, React.createElement("a", {
                href: d,
                className: "btn btn-default navbar-btn",
                role: "button"
            }, "Log In"), React.createElement("button", {
                type: "button",
                href: "#",
                className: "btn btn-default navbar-btn dropdown-toggle",
                "data-toggle": "dropdown",
                role: "button",
                "aria-haspopup": "true",
                "aria-expanded": "false"
            }, React.createElement("span", {
                className: "caret"
            }), React.createElement("span", {
                className: "sr-only"
            }, "Toggle Dropdown")), React.createElement("ul", {
                className: "dropdown-menu",
                role: "menu"
            }, React.createElement("li", null, React.createElement("a", {
                href: n
            }, "Download")), React.createElement("li", null, React.createElement("a", {
                href: s,
                className: "documentation"
            }, "Documentation")), React.createElement("li", null, React.createElement("a", {
                href: l,
                className: "forums"
            }, "Forums"))));
        }
        return React.createElement("div", null, React.createElement("nav", {
            id: "primarynav",
            className: "navbar navbar-default",
            role: "navigation"
        }, React.createElement("div", {
            className: "container-fluid"
        }, React.createElement("div", {
            className: "navbar-header"
        }, React.createElement("button", {
            type: "button",
            className: "navbar-toggle collapsed",
            "data-toggle": "collapse",
            "data-target": "#primary-nav-linklist"
        }, r, React.createElement("span", {
            className: "sr-only"
        }, "Toggle navigation"), React.createElement("span", {
            className: "glyphicons fonticon glyphicons-menu-hamburger"
        })), React.createElement("a", {
            className: "navbar-brand hidden-sm hidden-xs",
            href: u
        }, React.createElement("img", {
            src: p("/images/theme/zotero.png"),
            alt: "Zotero",
            height: "20px"
        })), React.createElement("a", {
            className: "navbar-brand visible-sm-block visible-xs-block",
            href: u
        }, React.createElement("img", {
            src: p("/images/theme/zotero_theme/zotero_48.png"),
            alt: "Zotero",
            height: "24px"
        }))), React.createElement("div", {
            className: "collapse navbar-collapse",
            id: "primary-nav-linklist"
        }, React.createElement(ControlPanel, {
            library: e,
            ref: "controlPanel"
        }), React.createElement("ul", {
            className: "nav navbar-nav navbar-right"
        }, m), React.createElement("div", {
            className: "eventfulwidget btn-toolbar hidden-xs navbar-right"
        }, React.createElement(LibrarySearchBox, {
            library: e
        }))))), React.createElement("div", {
            id: "js-message"
        }, React.createElement("ul", {
            id: "js-message-list"
        })), React.createElement("div", {
            id: "library",
            className: "row"
        }, React.createElement("div", {
            id: "panel-container"
        }, React.createElement("div", {
            id: "left-panel",
            className: "panelcontainer-panelcontainer col-xs-12 col-sm-4 col-md-3"
        }, React.createElement(FilterGuide, {
            ref: "filterGuide",
            library: e
        }), React.createElement("div", {
            role: "tabpanel"
        }, React.createElement("ul", {
            className: "nav nav-tabs",
            role: "tablist"
        }, React.createElement("li", {
            role: "presentation",
            className: "active"
        }, React.createElement("a", {
            href: "#collections-panel",
            "aria-controls": "collections-panel",
            role: "tab",
            "data-toggle": "tab"
        }, "Collections")), React.createElement("li", {
            role: "presentation"
        }, React.createElement("a", {
            href: "#tags-panel",
            "aria-controls": "tags-panel",
            role: "tab",
            "data-toggle": "tab"
        }, "Tags"))), React.createElement("div", {
            className: "tab-content"
        }, React.createElement("div", {
            id: "collections-panel",
            role: "tabpanel",
            className: "tab-pane active"
        }, React.createElement(Collections, {
            ref: "collectionsWidget",
            library: e
        })), React.createElement("div", {
            id: "tags-panel",
            role: "tabpanel",
            className: "tab-pane"
        }, React.createElement(Tags, {
            ref: "tagsWidget",
            library: e
        }), React.createElement(FeedLink, {
            ref: "feedLinkWidget",
            library: e
        }))))), React.createElement("div", {
            id: "right-panel",
            className: "panelcontainer-panelcontainer col-xs-12 col-sm-8 col-md-9"
        }, React.createElement("div", {
            id: "items-panel",
            className: "panelcontainer-panel col-sm-12 col-md-7"
        }, React.createElement(LibrarySearchBox, {
            library: e
        }), React.createElement("div", {
            id: "library-items-div",
            className: "library-items-div row"
        }, React.createElement(ItemsTable, {
            ref: "itemsWidget",
            library: e
        })), React.createElement("div", {
            id: "load-more-items-div",
            className: "row"
        }, React.createElement("button", {
            onClick: function() {
                e.trigger("loadMoreItems");
            },
            type: "button",
            id: "load-more-items-button",
            className: "btn btn-default"
        }, "Load More Items"))), React.createElement("div", {
            id: "item-panel",
            className: "panelcontainer-panel col-sm-12 col-md-5"
        }, React.createElement("div", {
            id: "item-widget-div",
            className: "item-details-div"
        }, React.createElement(ItemDetails, {
            ref: "itemWidget",
            library: e
        })))), React.createElement("nav", {
            id: "panelcontainer-nav",
            className: "navbar navbar-default navbar-fixed-bottom visible-xs-block",
            role: "navigation"
        }, React.createElement("div", {
            className: "container-fluid"
        }, React.createElement("ul", {
            className: "nav navbar-nav"
        }, React.createElement("li", {
            className: "eventfultrigger filters-nav",
            "data-triggers": "showFiltersPanel"
        }, React.createElement("a", {
            href: "#"
        }, "Filters")), React.createElement("li", {
            className: "eventfultrigger items-nav",
            "data-triggers": "showItemsPanel"
        }, React.createElement("a", {
            href: "#"
        }, "Items"))))), React.createElement(SendToLibraryDialog, {
            ref: "sendToLibraryDialogWidget",
            library: e
        }), React.createElement(CreateCollectionDialog, {
            ref: "createCollectionDialogWidget",
            library: e
        }), React.createElement(UpdateCollectionDialog, {
            library: e
        }), React.createElement(DeleteCollectionDialog, {
            library: e
        }), React.createElement(AddToCollectionDialog, {
            library: e
        }), React.createElement(CreateItemDialog, {
            library: e
        }), React.createElement(CiteItemDialog, {
            library: e
        }), React.createElement(UploadAttachmentDialog, {
            library: e
        }), React.createElement(ExportItemsDialog, {
            library: e
        }), React.createElement(LibrarySettingsDialog, {
            library: e
        }))));
    }
});

"use strict";

Zotero.ui.widgets.reactlibrarysettingsdialog = {};

Zotero.ui.widgets.reactlibrarysettingsdialog.init = function(e) {
    Z.debug("librarysettingsdialog widget init", 3);
    var t = Zotero.ui.getAssociatedLibrary(e);
    var r = ReactDOM.render(React.createElement(LibrarySettingsDialog, {
        library: t
    }), document.getElementById("library-settings-dialog"));
    t.listen("settingsLoaded", r.updateStateFromLibrary, {});
    t.listen("librarySettingsDialog", r.openDialog, {});
};

var LibrarySettingsDialog = React.createClass({
    displayName: "LibrarySettingsDialog",
    getInitialState: function Xr() {
        return {
            listDisplayedFields: [],
            itemsPerPage: 25,
            showAutomaticTags: true
        };
    },
    openDialog: function ea() {
        this.refs.modal.open();
    },
    closeDialog: function ta(e) {
        this.refs.modal.close();
    },
    updateShowFields: function ra(e) {
        Z.debug("updateShowFields");
        var t = this.props.library;
        var r = this.state.listDisplayedFields;
        var a = e.target.value;
        var o = e.target.checked;
        if (o) {
            Z.debug("adding field " + a + " to listDisplayedFields");
            r.push(a);
        } else {
            Z.debug("filtering field " + a + " from listDisplayedFields");
            r = r.filter(function(e) {
                if (e == a) {
                    return false;
                }
                return true;
            });
        }
        this.setState({
            listDisplayedFields: r
        });
        t.preferences.setPref("listDisplayedFields", r);
        t.preferences.persist();
        t.trigger("displayedItemsChanged");
    },
    updateShowAutomaticTags: function aa(e) {
        var t = this.props.library;
        var r = e.target.checked;
        this.setState({
            showAutomaticTags: r
        });
        t.preferences.setPref("showAutomaticTags", r);
        t.preferences.persist();
        t.trigger("tagsChanged");
    },
    updateStateFromLibrary: function oa() {
        var e = this.props.library;
        this.setState({
            listDisplayedFields: e.preferences.getPref("listDisplayedFields"),
            itemsPerPage: e.preferences.getPref("itemsPerPage"),
            showAutomaticTags: e.preferences.getPref("showAutomaticTags")
        });
    },
    render: function ia() {
        var e = this;
        var t = this.props.library;
        var r = this.state.listDisplayedFields;
        var a = this.state.itemsPerPage;
        var o = this.state.showAutomaticTags;
        var i = Zotero.localizations.fieldMap;
        var n = Zotero.Library.prototype.displayableColumns.map(function(t, a) {
            var o = r.indexOf(t) != -1;
            return React.createElement("div", {
                key: t,
                className: "checkbox"
            }, React.createElement("label", {
                htmlFor: "display-column-field-" + t
            }, React.createElement("input", {
                onChange: e.updateShowFields,
                type: "checkbox",
                checked: o,
                name: "display-column-field",
                value: t,
                id: "display-column-field-" + t,
                className: "display-column-field"
            }), i[t] || t));
        });
        return React.createElement(BootstrapModalWrapper, {
            ref: "modal"
        }, React.createElement("div", {
            id: "library-settings-dialog",
            className: "library-settings-dialog",
            role: "dialog",
            "aria-hidden": "true",
            "data-keyboard": "true"
        }, React.createElement("div", {
            className: "modal-dialog"
        }, React.createElement("div", {
            className: "modal-content"
        }, React.createElement("div", {
            className: "modal-header"
        }, React.createElement("button", {
            type: "button",
            className: "close",
            "data-dismiss": "modal",
            "aria-hidden": "true"
        }, "×"), React.createElement("h3", {
            className: "modal-title"
        }, "Library Settings")), React.createElement("div", {
            className: "modal-body"
        }, React.createElement("form", {
            id: "library-settings-form",
            className: "library-settings-form",
            role: "form"
        }, React.createElement("fieldset", null, React.createElement("legend", null, "Display Columns"), n), React.createElement("div", {
            className: "checkbox"
        }, React.createElement("label", {
            htmlFor: "show-automatic-tags"
        }, React.createElement("input", {
            onChange: this.updateShowAutomaticTags,
            type: "checkbox",
            id: "show-automatic-tags",
            name: "show-automatic-tags"
        }), "Show Automatic Tags"), React.createElement("p", {
            className: "help-block"
        }, "Automatic tags are tags added automatically when a reference was imported, rather than by a user.")))), React.createElement("div", {
            className: "modal-footer"
        }, React.createElement("button", {
            className: "btn btn-default",
            "data-dismiss": "modal",
            "aria-hidden": "true"
        }, "Close"))))));
    }
});

"use strict";

Zotero.ui.widgets.panelContainer = {};

Zotero.ui.widgets.panelContainer.init = function(e) {
    Z.debug("panelContainer widget init", 3);
    var t = Zotero.ui.getAssociatedLibrary(e);
    t.listen("displayedItemsChanged showItemsPanel", Zotero.ui.widgets.panelContainer.showPanel, {
        widgetEl: e,
        panelSelector: "#items-panel"
    });
    t.listen("showFiltersPanel", Zotero.ui.widgets.panelContainer.showPanel, {
        widgetEl: e,
        panelSelector: "#left-panel"
    });
    t.listen("showItemPanel displayedItemChanged", Zotero.ui.widgets.panelContainer.showPanel, {
        widgetEl: e,
        panelSelector: "#item-panel"
    });
    Zotero.listen("reflow", Zotero.ui.widgets.panelContainer.reflow, {
        widgetEl: e
    });
    Zotero.ui.widgets.panelContainer.showPanel({
        data: {
            widgetEl: e,
            panelSelector: "#items-panel"
        }
    });
    J(window).on("resize", function() {
        Zotero.ui.widgets.panelContainer.reflow({
            data: {
                widgetEl: e
            }
        });
    });
    J(e).on("click", ".single-cell-item", function() {
        t.trigger("showItemPanel");
    });
};

Zotero.ui.widgets.panelContainer.reflow = function(e) {
    Zotero.ui.widgets.panelContainer.showPanel({
        data: {
            widgetEl: e.data.widgetEl,
            panelSelector: "#items-panel"
        }
    });
    Zotero.ui.fixTableHeaders(J("#field-table"));
};

Zotero.ui.widgets.panelContainer.showPanel = function(e) {
    Z.debug("panelContainer.showPanel", 3);
    var t = J(e.data.widgetEl);
    var r = e.data.panelSelector;
    if (r == "#item-panel" && !Zotero.state.getUrlVar("itemKey")) {
        Z.debug("item-panel selected with no itemKey", 3);
        r = "#items-panel";
    }
    Z.debug("selector:" + r, 3);
    var a = "xs";
    var o = [];
    switch (true) {
      case window.matchMedia("(min-width: 1200px)").matches:
        a = "lg";
        t.find(".panelcontainer-panelcontainer").show().find(".panelcontainer-panel").show();
        break;

      case window.matchMedia("(min-width: 992px)").matches:
        a = "md";
        t.find(".panelcontainer-panelcontainer").show().find(".panelcontainer-panel").show();
        break;

      case window.matchMedia("(min-width: 768px)").matches:
        a = "sm";
        t.find(".panelcontainer-panelcontainer").show().find(".panelcontainer-panel").show();
        if (r == "#item-panel" || r == "#items-panel") {
            t.find(r).siblings(".panelcontainer-panel").hide();
            t.find(r).show();
        }
        break;

      default:
        a = "xs";
        t.find(".panelcontainer-panelcontainer").hide().find(".panelcontainer-panel").hide();
        t.find(r).show().closest(".panelcontainer-panelcontainer").show();
    }
    Z.debug("panelContainer calculated deviceSize: " + a, 3);
    t.find("#panelcontainer-nav li").removeClass("active");
    switch (r) {
      case "#collections-panel":
        t.find("li.collections-nav").addClass("active");
        break;

      case "#left-panel":
        t.find("li.filters-nav").addClass("active");
        break;
    }
};

"use strict";

Zotero.ui.widgets.reactsearchbox = {};

Zotero.ui.widgets.reactsearchbox.init = function(e) {
    Z.debug("Zotero.eventful.init.searchbox", 3);
    var t = Zotero.ui.getAssociatedLibrary(e);
    var r = J(e);
    var a = ReactDOM.render(React.createElement(LibrarySearchBox, {
        library: t
    }), document.getElementById("search-box"));
    Zotero.ui.widgets.reactsearchbox.reactInstance = a;
};

var LibrarySearchBox = React.createClass({
    displayName: "LibrarySearchBox",
    getInitialState: function na() {
        return {
            searchType: "simple"
        };
    },
    search: function sa(t) {
        e.preventDefault();
        Z.debug("library-search form submitted", 3);
        Zotero.state.clearUrlVars([ "collectionKey", "tag", "q", "qmode" ]);
        var r = J(t.target);
        var a = r.find("input.search-query").val();
        var o = r.find("input.search-query").data("searchtype");
        if (a !== "" || Zotero.state.getUrlVar("q")) {
            Zotero.state.pathVars["q"] = a;
            if (o != "simple") {
                Zotero.state.pathVars["qmode"] = o;
            }
            Zotero.state.pushState();
        }
        return false;
    },
    clearLibraryQuery: function la(e) {
        Zotero.state.unsetUrlVar("q");
        Zotero.state.unsetUrlVar("qmode");
        J(".search-query").val("");
        Zotero.state.pushState();
        return;
    },
    changeSearchType: function ca(e) {
        e.preventDefault();
        var t = J(e.target);
        var r = t.data("searchtype");
        this.setState({
            searchType: r
        });
    },
    render: function da() {
        var e = "";
        if (this.state.searchType == "simple") {
            e = "Search Title, Creator, Year";
        } else if (this.state.searchType == "everything") {
            e = "Search Full Text";
        }
        var t = Zotero.state.getUrlVar("q");
        return React.createElement("div", {
            className: "btn-toolbar row visible-xs",
            id: "search-box",
            style: {
                maxWidth: "350px"
            }
        }, React.createElement("form", {
            action: "/search/",
            onSubmit: this.search,
            className: "navbar-form zsearch library-search",
            role: "search"
        }, React.createElement("div", {
            className: "input-group"
        }, React.createElement("div", {
            className: "input-group-btn"
        }, React.createElement("button", {
            type: "button",
            className: "btn btn-default dropdown-toggle",
            "data-toggle": "dropdown"
        }, React.createElement("span", {
            className: "caret"
        })), React.createElement("ul", {
            className: "dropdown-menu"
        }, React.createElement("li", null, React.createElement("a", {
            href: "#",
            onClick: this.changeSearchType,
            "data-searchtype": "simple"
        }, "Title, Creator, Year")), React.createElement("li", null, React.createElement("a", {
            href: "#",
            onClick: this.changeSearchType,
            "data-searchtype": "everything"
        }, "Full Text")))), React.createElement("input", {
            defaultValue: t,
            type: "text",
            name: "q",
            id: "header-search-query",
            className: "search-query form-control",
            placeholder: e
        }), React.createElement("span", {
            className: "input-group-btn"
        }, React.createElement("button", {
            onClick: this.clearLibraryQuery,
            className: "btn btn-default clear-field-button",
            type: "button"
        }, React.createElement("span", {
            className: "glyphicons fonticon glyphicons-remove-2"
        }))))));
    }
});

"use strict";

Zotero.ui.widgets.reactsendToLibraryDialog = {};

Zotero.ui.widgets.reactsendToLibraryDialog.init = function(e) {
    Z.debug("sendToLibraryDialog widget init", 3);
    var t = Zotero.ui.getAssociatedLibrary(e);
    var r = ReactDOM.render(React.createElement(SendToLibraryDialog, {
        library: t
    }), document.getElementById("send-to-library-dialog"));
    t.listen("sendToLibraryDialog", r.openDialog, {});
};

var SendToLibraryDialog = React.createClass({
    displayName: "SendToLibraryDialog",
    getInitialState: function ua() {
        return {
            writableLibraries: [],
            loading: false,
            loaded: false
        };
    },
    handleLibraryChange: function pa(e) {
        this.setState({
            targetLibrary: e.target.value
        });
    },
    openDialog: function ga() {
        this.refs.modal.open();
        if (!this.state.loaded) {
            this.loadForeignLibraries();
        }
    },
    closeDialog: function ma(e) {
        this.refs.modal.close();
    },
    loadForeignLibraries: function fa() {
        var e = this;
        var t = this.props.library;
        var r = Zotero.config.loggedInUserID;
        var a = "u" + r;
        this.setState({
            loading: true
        });
        var o = t.groups.fetchUserGroups(r).then(function(t) {
            Z.debug("got member groups", 3);
            var o = t.fetchedGroups;
            var i = [ {
                name: "My Library",
                libraryString: a
            } ];
            for (var n = 0; n < o.length; n++) {
                if (o[n].isWritable(r)) {
                    var s = "g" + o[n].get("id");
                    i.push({
                        name: o[n].get("name"),
                        libraryString: s
                    });
                }
            }
            e.setState({
                writableLibraries: i,
                loading: false,
                loaded: true
            });
        })["catch"](function(e) {
            Zotero.ui.jsNotificationMessage("There was an error loading group libraries", "error");
            Z.error(e);
            Z.error(e.message);
        });
    },
    sendItem: function ha(e) {
        Z.debug("sendToLibrary callback", 3);
        var t = this.props.library;
        var r = this.state.targetLibrary;
        var a = Zotero.utils.parseLibString(r);
        destLibrary = new Zotero.Library(a.libraryType, a.libraryID);
        Zotero.libraries[r] = destLibrary;
        var o = Zotero.state.getSelectedItemKeys();
        if (o.length === 0) {
            Zotero.ui.jsNotificationMessage("No items selected", "notice");
            this.closeDialog();
            return false;
        }
        var i = t.items.getItems(o);
        t.sendToLibrary(i, destLibrary).then(function(e) {
            Zotero.ui.jsNotificationMessage("Items sent to other library", "notice");
        })["catch"](function(e) {
            Z.debug(e);
            Zotero.ui.jsNotificationMessage("Error sending items to other library", "notice");
        });
        this.closeDialog();
        return false;
    },
    render: function ba() {
        var e = this.state.writableLibraries;
        var t = e.map(function(e) {
            return React.createElement("option", {
                key: e.libraryString,
                value: e.libraryString
            }, e.name);
        });
        return React.createElement(BootstrapModalWrapper, {
            ref: "modal"
        }, React.createElement("div", {
            id: "send-to-library-dialog",
            className: "send-to-library-dialog",
            role: "dialog",
            "aria-hidden": "true",
            title: "Send to Library",
            "data-keyboard": "true"
        }, React.createElement("div", {
            className: "modal-dialog"
        }, React.createElement("div", {
            className: "modal-content"
        }, React.createElement("div", {
            className: "modal-header"
        }, React.createElement("button", {
            type: "button",
            className: "close",
            "data-dismiss": "modal",
            "aria-hidden": "true"
        }, "×"), React.createElement("h3", null, "Send To Library")), React.createElement("div", {
            className: "send-to-library-div modal-body",
            "data-role": "content"
        }, React.createElement("form", null, React.createElement("div", {
            "data-role": "fieldcontain"
        }, React.createElement("label", {
            htmlFor: "destination-library"
        }, "Library"), React.createElement("select", {
            onChange: this.handleLibraryChange,
            className: "destination-library-select form-control",
            name: "desination-library"
        }, t)))), React.createElement("div", {
            className: "modal-footer"
        }, React.createElement("button", {
            onClick: this.closeDialog,
            className: "btn",
            "data-dismiss": "modal",
            "aria-hidden": "true"
        }, "Close"), React.createElement("button", {
            onClick: this.sendItem,
            className: "btn btn-primary sendButton"
        }, "Send"))))));
    }
});

"use strict";

Zotero.ui.widgets.reacttags = {};

Zotero.ui.widgets.reacttags.init = function(e) {
    Z.debug("tags widget init", 3);
    var t = Zotero.ui.getAssociatedLibrary(e);
    var r = ReactDOM.render(React.createElement(Tags, {
        library: t
    }), document.getElementById("tags-list-div"));
    Zotero.ui.widgets.reacttags.reactInstance = r;
};

var TagRow = React.createClass({
    displayName: "TagRow",
    getDefaultProps: function ya() {
        return {
            showAutomatic: false
        };
    },
    handleClick: function va(e) {
        e.stopPropagation();
        e.preventDefault();
        var t = this.props.tag;
        Z.state.toggleTag(t.apiObj.tag);
        Z.state.clearUrlVars([ "tag", "collectionKey" ]);
        Z.state.pushState();
        var r = Zotero.state.getUrlVar("tag");
        if (!J.isArray(r)) {
            if (r) {
                r = [ r ];
            } else {
                r = [];
            }
        }
        Zotero.ui.widgets.reacttags.reactInstance.setState({
            selectedTags: r
        });
    },
    render: function Za() {
        var e = this.props.tag;
        var t = e.apiObj.tag;
        if (e.apiObj.meta.numItems) {
            t += " (" + e.apiObj.meta.numItems + ")";
        }
        var r = "";
        var a = {};
        if (e.color) {
            a = {
                color: e.color,
                fontWeight: "bold"
            };
        }
        if (this.props.showAutomatic == false && e.apiObj.meta.type != 0) {
            return null;
        }
        return React.createElement("li", {
            className: "tag-row"
        }, React.createElement("a", {
            onClick: this.handleClick,
            className: "tag-link",
            title: t,
            style: a,
            href: r
        }, Zotero.ui.trimString(e.apiObj.tag, 12)));
    }
});

var TagList = React.createClass({
    displayName: "TagList",
    getDefaultProps: function wa() {
        return {
            tags: [],
            showAutomatic: false,
            id: ""
        };
    },
    render: function Ia() {
        var e = this.props.showAutomatic;
        var t = this.props.tags.map(function(t, r) {
            return React.createElement(TagRow, {
                key: t.apiObj.tag,
                tag: t,
                showAutomatic: e
            });
        });
        return React.createElement("ul", {
            id: this.props.id
        }, t);
    }
});

var Tags = React.createClass({
    displayName: "Tags",
    getDefaultProps: function Ca() {
        return {};
    },
    getInitialState: function Ra() {
        return {
            tags: new Zotero.Tags(),
            tagColors: null,
            selectedTags: [],
            tagFilter: "",
            showAutomatic: false,
            loading: false
        };
    },
    componentWillMount: function Ea(e) {
        var t = this;
        var r = this.props.library;
        var a = r.preferences.getPref("tagColors");
        var o = Zotero.state.getUrlVar("tag");
        if (!J.isArray(o)) {
            if (o) {
                o = [ o ];
            } else {
                o = [];
            }
        }
        t.setState({
            tagColors: a,
            selectedTags: o
        });
        r.listen("tagsDirty", t.syncTags, {});
        r.listen("cachedDataLoaded", t.syncTags, {});
        r.listen("tagsChanged libraryTagsUpdated selectedTagsChanged", function(e) {
            t.setState({
                tags: r.tags
            });
        }, {});
    },
    handleFilterChanged: function Sa(e) {
        this.setState({
            tagFilter: e.target.value
        });
    },
    syncTags: function ka(e) {
        Z.debug("Tags.syncTags");
        var t = this;
        if (this.state.loading) {
            return;
        }
        var r = this.props.library;
        if (e.data && e.data.checkCached === false) {
            r.tags.clear();
        }
        t.setState({
            tags: r.tags,
            loading: true
        });
        loadingPromise = r.loadUpdatedTags().then(function() {
            Z.debug("syncTags done. clearing loading div");
            t.setState({
                tags: r.tags,
                loading: false
            });
            return;
        }, function(e) {
            Z.error("syncTags failed. showing local data and clearing loading div");
            t.setState({
                tags: r.tags,
                loading: false
            });
            Zotero.ui.jsNotificationMessage("There was an error loading tags. Some tags may not have been updated.", "notice");
        });
        return;
    },
    render: function Ta() {
        var e = this.state.tags;
        var t = this.state.selectedTags;
        var r = this.state.tagColors;
        if (r === null) {
            r = [];
        }
        var a = this.state.tagFilter;
        var o = e.plainTagsList(e.tagsArray);
        var i = Z.utils.matchAnyAutocomplete(a, o);
        var n = [];
        var s = [];
        r.forEach(function(t, r) {
            Z.debug("tagColor processing " + r);
            n.push(t.name.toLowerCase());
            var a = e.getTag(t.name);
            if (a) {
                a.color = t.color;
                s.push(a);
            }
        });
        var l = [];
        var c = [];
        t.forEach(function(t) {
            var r = e.getTag(t);
            if (r) {
                c.push(r);
            }
        });
        i.forEach(function(r) {
            var a = e.getTag(r);
            if (a !== null && a.apiObj.meta.numItems > 0) {
                if (t.indexOf(r) == -1 && n.indexOf(r) == -1) {
                    l.push(a);
                }
            }
        });
        return React.createElement("div", {
            id: "tags-list-div",
            className: "tags-list-div"
        }, React.createElement("div", null, React.createElement("input", {
            type: "text",
            id: "tag-filter-input",
            className: "tag-filter-input form-control",
            placeholder: "Filter Tags",
            onChange: this.handleFilterChanged
        }), React.createElement(LoadingSpinner, {
            loading: this.state.loading
        }), React.createElement(TagList, {
            tags: c,
            id: "selected-tags-list"
        }), React.createElement(TagList, {
            tags: s,
            id: "colored-tags-list"
        }), React.createElement(TagList, {
            tags: l,
            id: "tags-list"
        })));
    }
});

"use strict";

Zotero.ui.widgets.reactupdateCollectionDialog = {};

Zotero.ui.widgets.reactupdateCollectionDialog.init = function(e) {
    Z.debug("updatecollectionsdialog widget init", 3);
    var t = Zotero.ui.getAssociatedLibrary(e);
    var r = ReactDOM.render(React.createElement(UpdateCollectionDialog, {
        library: t
    }), document.getElementById("update-collection-dialog"));
    t.listen("updateCollectionDialog", function() {
        var e = Zotero.state.getUrlVar("collectionKey");
        var a = t.collections.getCollection(e);
        var o = "";
        var i = "";
        if (a) {
            o = a.get("parentCollection");
            i = a.get("name");
        }
        r.setState({
            collectionName: i,
            parentCollection: o
        });
        r.openDialog();
    }, {});
};

var UpdateCollectionDialog = React.createClass({
    displayName: "UpdateCollectionDialog",
    getInitialState: function Da() {
        return {
            collectionName: "",
            parentCollection: null
        };
    },
    handleCollectionChange: function xa(e) {
        this.setState({
            parentCollection: e.target.value
        });
    },
    handleNameChange: function Na(e) {
        this.setState({
            collectionName: e.target.value
        });
    },
    openDialog: function ja() {
        this.refs.modal.open();
    },
    closeDialog: function La(e) {
        this.refs.modal.close();
    },
    saveCollection: function Ja(e) {
        var t = this;
        var r = this.props.library;
        var a = this.state.parentCollection;
        var o = this.state.collectionName;
        if (o == "") {
            o = "Untitled";
        }
        var i = Zotero.state.getUrlVar("collectionKey");
        var n = r.collections.getCollection(i);
        if (!n) {
            Zotero.ui.jsNotificationMessage("Selected collection not found", "error");
            return false;
        }
        Z.debug("updating collection: " + a + ": " + o);
        n.update(o, a).then(function(e) {
            Zotero.ui.jsNotificationMessage("Collection Saved", "confirm");
            r.collections.dirty = true;
            r.collections.initSecondaryData();
            r.trigger("libraryCollectionsUpdated");
            Zotero.state.pushState(true);
            t.closeDialog();
        })["catch"](Zotero.catchPromiseError);
    },
    render: function Oa() {
        var e = this.props.library;
        var t = e.collections.nestedOrderingArray();
        var r = t.map(function(e, t) {
            return React.createElement("option", {
                key: e.get("key"),
                value: e.get("key")
            }, "-".repeat(e.nestingDepth), " ", e.get("name"));
        });
        r.unshift(React.createElement("option", {
            key: "emptyvalue",
            value: ""
        }, "None"));
        return React.createElement(BootstrapModalWrapper, {
            ref: "modal"
        }, React.createElement("div", {
            id: "update-collection-dialog",
            className: "update-collection-dialog",
            role: "dialog",
            title: "Update Collection",
            "data-keyboard": "true"
        }, React.createElement("div", {
            className: "modal-dialog"
        }, React.createElement("div", {
            className: "modal-content"
        }, React.createElement("div", {
            className: "modal-header"
        }, React.createElement("button", {
            type: "button",
            className: "close",
            "data-dismiss": "modal",
            "aria-hidden": "true"
        }, "×"), React.createElement("h3", null, "Update Collection")), React.createElement("div", {
            className: "update-collection-div modal-body"
        }, React.createElement("form", {
            method: "POST",
            className: "zform"
        }, React.createElement("ol", null, React.createElement("li", null, React.createElement("label", {
            htmlFor: "updated-collection-title-input"
        }, "Rename Collection"), React.createElement("input", {
            value: this.state.collectionName,
            onChange: this.handleNameChange,
            id: "updated-collection-title-input",
            className: "updated-collection-title-input form-control"
        })), React.createElement("li", null, React.createElement("label", {
            htmlFor: "update-collection-parent-select"
        }, "Parent Collection"), React.createElement("select", {
            value: this.state.parentCollection,
            onChange: this.handleCollectionChange,
            className: "collectionKey-select update-collection-parent form-control"
        }, r))))), React.createElement("div", {
            className: "modal-footer"
        }, React.createElement("button", {
            className: "btn",
            "data-dismiss": "modal",
            "aria-hidden": "true"
        }, "Close"), React.createElement("button", {
            onClick: this.saveCollection,
            className: "btn btn-primary updateButton"
        }, "Update"))))));
    }
});

"use strict";

Zotero.ui.widgets.reactuploadDialog = {};

Zotero.ui.widgets.reactuploadDialog.init = function(e) {
    Z.debug("uploaddialog widget init", 3);
    var t = Zotero.ui.getAssociatedLibrary(e);
    var r = ReactDOM.render(React.createElement(UploadAttachmentDialog, {
        library: t
    }), document.getElementById("upload-dialog"));
    t.listen("uploadAttachment", function() {
        Z.debug("got uploadAttachment event; opening upload dialog");
        r.setState({
            itemKey: Zotero.state.getUrlVar("itemKey")
        });
        r.openDialog();
    }, {});
};

var UploadAttachmentDialog = React.createClass({
    displayName: "UploadAttachmentDialog",
    getInitialState: function Aa() {
        return {
            title: "",
            fileInfo: null,
            filename: "",
            filesize: 0,
            contentType: null,
            percentLoaded: 0,
            uploading: false
        };
    },
    upload: function Pa() {
        Z.debug("uploadFunction", 3);
        var e = this;
        var t = this.props.library;
        var r = this.state.fileInfo;
        var a = this.state.title;
        var o = function c(t) {
            Z.debug("fullUpload.upload.onprogress", 3);
            var r = Math.round(t.loaded / t.total * 100);
            e.setState({
                percentLoaded: r
            });
        };
        this.setState({
            uploading: true
        });
        var i = Zotero.state.getUrlVar("itemKey");
        var n = t.items.getItem(i);
        var s;
        if (!n.get("parentItem")) {
            Z.debug("no parentItem", 3);
            var l = new Zotero.Item();
            l.associateWithLibrary(t);
            s = l.initEmpty("attachment", "imported_file").then(function(e) {
                Z.debug("templateItemDeferred callback", 3);
                e.set("title", a);
                return n.uploadChildAttachment(e, r, o);
            });
        } else if (n.get("itemType") == "attachment" && n.get("linkMode") == "imported_file") {
            Z.debug("imported_file attachment", 3);
            s = n.uploadFile(r, o);
        }
        s.then(function() {
            Z.debug("uploadSuccess", 3);
            t.trigger("uploadSuccessful");
            e.closeDialog();
        })["catch"](e.failureHandler).then(function() {
            e.closeDialog();
        });
    },
    handleUploadFailure: function Ua(e) {
        Z.debug("Upload failed", 3);
        Z.debug(e, 3);
        Zotero.ui.jsNotificationMessage("There was a problem uploading your file.", "error");
        switch (e.code) {
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
            Zotero.ui.jsNotificationMessage("Unknown error uploading file. " + e.code, "error");
        }
    },
    handleFiles: function Fa(e) {
        Z.debug("attachmentUpload handleFiles", 3);
        var t = this;
        if (typeof e == "undefined" || e.length === 0) {
            return false;
        }
        var r = e[0];
        Zotero.file.getFileInfo(r).then(function(e) {
            Z.debug(e);
            t.setState({
                fileInfo: e,
                filename: e.filename,
                filesize: e.filesize,
                contentType: e.contentType
            });
        });
        return;
    },
    handleDrop: function Ma(e) {
        Z.debug("fileuploaddroptarget drop callback", 3);
        e.stopPropagation();
        e.preventDefault();
        var t = e.originalEvent;
        var r = t.dataTransfer;
        var a = r.files;
        this.handleFiles(a);
    },
    handleFileInputChange: function _a(e) {
        Z.debug("fileuploaddroptarget callback 1", 3);
        e.stopPropagation();
        e.preventDefault();
        var t = J(this.refs.fileInput).get(0).files;
        this.handleFiles(t);
    },
    handleTitleChange: function Ka(e) {
        this.setState({
            title: e.target.value
        });
    },
    openDialog: function Va() {
        this.refs.modal.open();
    },
    closeDialog: function qa(e) {
        this.refs.modal.close();
    },
    render: function Ba() {
        var e = this.props.library;
        return React.createElement(BootstrapModalWrapper, {
            ref: "modal"
        }, React.createElement("div", {
            id: "upload-attachment-dialog",
            className: "upload-attachment-dialog",
            role: "dialog",
            title: "Upload Attachment",
            "data-keyboard": "true"
        }, React.createElement("div", {
            className: "modal-dialog"
        }, React.createElement("div", {
            className: "modal-content"
        }, React.createElement("div", {
            className: "modal-header"
        }, React.createElement("button", {
            type: "button",
            className: "close",
            "data-dismiss": "modal",
            "aria-hidden": "true"
        }, "×"), React.createElement("h3", {
            className: "modal-title"
        }, "Upload Attachment")), React.createElement("div", {
            className: "upload-attachment-div modal-body",
            "data-role": "content"
        }, React.createElement("form", {
            className: "attachmentuploadForm zform"
        }, React.createElement("h3", null, "Select a file for upload or drag and drop below"), React.createElement("span", {
            className: "btn btn-primary btn-file"
        }, "Choose File", React.createElement("input", {
            onChange: this.handleFileInputChange,
            ref: "fileInput",
            type: "file",
            id: "fileuploadinput",
            className: "fileuploadinput",
            multiple: true
        })), React.createElement("div", {
            onDrop: this.handleDrop,
            id: "fileuploaddroptarget",
            className: "fileuploaddroptarget"
        }, React.createElement("h3", null, "Drop your file here"), React.createElement("h3", {
            id: "droppedfilename",
            className: "droppedfilename"
        }), React.createElement(LoadingSpinner, {
            loading: this.state.uploading
        })), React.createElement("div", {
            id: "attachmentuploadfileinfo",
            className: "attachmentuploadfileinfo"
        }, React.createElement("table", {
            className: "table table-striped"
        }, React.createElement("tbody", null, React.createElement("tr", null, React.createElement("th", null, "Title"), React.createElement("td", null, React.createElement("input", {
            onChange: this.handleTitleChange,
            id: "upload-file-title-input",
            className: "upload-file-title-input form-control",
            type: "text"
        }))), React.createElement("tr", null, React.createElement("th", null, "Size"), React.createElement("td", {
            className: "uploadfilesize"
        }, this.state.filesize)), React.createElement("tr", null, React.createElement("th", null, "Type"), React.createElement("td", {
            className: "uploadfiletype"
        }, this.state.contentType)), React.createElement("tr", null, React.createElement("th", null, "Upload"), React.createElement("td", {
            className: "uploadprogress"
        }, React.createElement("meter", {
            min: "0",
            max: "100",
            value: "0",
            id: "uploadprogressmeter",
            value: this.state.percentLoaded
        })))))))), React.createElement("div", {
            className: "modal-footer"
        }, React.createElement("button", {
            type: "button",
            className: "btn btn-default",
            "data-dismiss": "modal",
            "aria-hidden": "true"
        }, "Close"), React.createElement("button", {
            onClick: this.upload,
            type: "button",
            className: "btn btn-primary uploadButton"
        }, "Upload"))))));
    }
});

Zotero.url.requestReadApiKeyUrl = function(e, t, r) {
    var a = Zotero.config.baseWebsiteUrl + "/settings/keys/new";
    a.replace("http", "https");
    var o = {
        name: "Private Feed"
    };
    if (e == "group") {
        o["library_access"] = 0;
        o["group_" + t] = "read";
        o["redirect"] = r;
    } else if (e == "user") {
        o["library_access"] = 1;
        o["notes_access"] = 1;
        o["redirect"] = r;
    }
    queryParamsArray = [];
    J.each(o, function(e, t) {
        queryParamsArray.push(encodeURIComponent(e) + "=" + encodeURIComponent(t));
    });
    queryString = "?" + queryParamsArray.join("&");
    return a + queryString;
};

Zotero.url.groupViewUrl = function(e) {
    if (e.get("type") == "Private") {
        return Zotero.config.baseWebsiteUrl + "/groups/" + e.get("id");
    } else {
        return Zotero.config.baseWebsiteUrl + "/groups/" + Zotero.utils.slugify(e.get("name"));
    }
};

Zotero.url.groupLibraryUrl = function(e) {
    if (e.get("type") == "Private") {
        return Zotero.config.baseWebsiteUrl + "/groups/" + e.get("id") + "/items";
    } else {
        return Zotero.config.baseWebsiteUrl + "/groups/" + Zotero.utils.slugify(e.get("name")) + "/items";
    }
};

Zotero.url.groupSettingsUrl = function(e) {
    return Zotero.config.baseWebsiteUrl + "/groups/" + e.get("id") + "/settings";
};

Zotero.url.groupMemberSettingsUrl = function(e) {
    return Zotero.config.baseWebsiteUrl + "/groups/" + e.get("id") + "/settings/members";
};

Zotero.url.groupLibrarySettingsUrl = function(e) {
    return Zotero.config.baseWebsiteUrl + "/groups/" + e.get("id") + "/settings/library";
};

Zotero.pages = {
    base: {
        init: function() {
            this.tagline();
            this.setupSearch();
            this.setupNav();
            J("#sitenav .toggle").click(this.navMenu);
            J(".support-menu-expand-section").hide();
            J(".support-menu-section").on("click", "h2", function() {
                J(this).siblings(".support-menu-expand-section").slideToggle();
            });
        },
        tagline: function() {
            var e = [ "See it. Save it. Sort it. Search it. Cite it.", "Leveraging the long tail of scholarship.", "A personal research assistant. Inside your browser.", "Goodbye 3x5 cards, hello Zotero.", "Citation management is only the beginning.", "The next-generation research tool.", "Research, not re-search", "The web now has a wrangler." ];
            var t = Math.floor(Math.random() * e.length);
            J("#tagline").text(e[t]);
        },
        setupSearch: function() {
            var e = "support";
            var t = "";
            if (undefined !== window.zoterojsSearchContext) {
                e = zoterojsSearchContext;
            }
            switch (e) {
              case "people":
                t = "Search for people";
                break;

              case "group":
                t = "Search for groups";
                break;

              case "documentation":
                t = "Search documentation";
                break;

              case "library":
                t = "Search Library";
                break;

              case "grouplibrary":
                t = "Search Library";
                break;

              case "support":
                t = "Search support";
                break;

              case "forums":
                t = "Search forums";
                break;

              default:
                t = "Search support";
                break;
            }
            if (e == "documentation" || e == "support") {
                J("#simple-search").on("submit", function(e) {
                    e.preventDefault();
                    var t = J(this).find("input[type='text']").val();
                    Z.pages.base.supportSearchRedirect(t);
                });
            }
            if (e == "people" || e == "group") {
                J("#simple-search").on("submit", function(r) {
                    r.preventDefault();
                    var a = Zotero.config.baseZoteroWebsiteUrl + "/search/#type/" + e;
                    var o = J(this).find("input[type='text']").val();
                    if (o !== "" && o != t) {
                        a = a + "/q/" + encodeURIComponent(o);
                    }
                    location.href = a;
                    return false;
                });
            }
        },
        supportSearchRedirect: function(e) {
            var t = encodeURIComponent(e + " site:www.zotero.org/support");
            Z.debug(t);
            return;
            var r = "https://duckduckgo.com/?q=" + t;
            window.location = r;
        },
        forumSearchRedirect: function(e) {
            var t = encodeURIComponent(e + " site:forums.zotero.org");
            var r = "https://duckduckgo.com/?q=" + t;
            window.location = r;
        },
        setupNav: function() {
            var e = "";
            if (undefined !== window.zoterojsSearchContext) {
                e = zoterojsSearchContext;
                if (e == "support") {
                    e = "";
                }
            }
            if (location.pathname == "/" && location.href.search("forums.") < 0) {
                e = "home";
            }
            if (e !== "") {
                J(".primarynav").find("a." + e).closest("li").addClass("active");
            }
        }
    },
    settings_cv: {
        init: function() {
            J("#cv-sections").on("click", ".cv-delete", function(e) {
                if (confirm("Are you sure you want to delete this section?")) {
                    Zotero.ui.cleanUpRte(J("#cv-sections"));
                    J(this).closest("div.cv-section").remove();
                    Zotero.ui.init.rte("default", false, J("#cv-sections"));
                    return false;
                }
            });
            J(".cv-insert-freetext").on("click", function(e) {
                var t = J("#cv-sections div.cv-section").length;
                var r = t + 1;
                var a = "cv_" + r + "_text";
                J("#cv-sections").append(J("#cvsectionTemplate").render({
                    cvSectionIndex: r,
                    cvSectionType: "text",
                    cvEntry: {}
                }));
                Zotero.ui.init.rte("default", false, J("div.cv-section").last());
                J("input.cv-heading").last().focus();
                return false;
            });
            J(".cv-insert-collection").on("click", function(e) {
                var t = J("#cv-sections div.cv-section").length;
                var r = t + 1;
                Z.debug(zoteroData.collectionOptions);
                J("#cv-sections").append(J("#cvsectionTemplate").render({
                    cvSectionIndex: r,
                    cvSectionType: "collection",
                    collectionOptions: zoteroData.collectionOptions,
                    cvEntry: {}
                }));
                J("input.cv-heading").last().focus();
                return false;
            });
            J("#cv-sections").on("click", ".cv-move-down", function(e) {
                if (J(this).closest("div.cv-section").find("textarea").length > 0) {
                    Zotero.ui.cleanUpRte(J("#cv-sections"));
                    J(this).closest("div.cv-section").next().after(J(this).closest("div.cv-section"));
                    Zotero.ui.init.rte("default", false);
                } else {
                    J(this).closest("div.cv-section").next().after(J(this).closest("div.cv-section"));
                }
                return false;
            });
            J("#cv-sections").on("click", ".cv-move-up", function(e) {
                if (J(this).closest("div.cv-section").find("textarea").length > 0) {
                    Zotero.ui.cleanUpRte(J("#cv-sections"));
                    J(this).closest("div.cv-section").prev().before(J(this).closest("div.cv-section"));
                    Zotero.ui.init.rte("default", false);
                } else {
                    J(this).closest("div.cv-section").prev().before(J(this).closest("div.cv-section"));
                }
                return false;
            });
            J("#cv-submit").click(function(e) {
                J("#cv-sections div.cv-section").each(function(e) {
                    var t;
                    if (J(this).hasClass("cv-text")) {
                        t = J(this).find(".cv-heading").attr("name", "cv_" + (e + 1) + "_heading");
                        if (t.val() == "Enter a section name") {
                            t.val("");
                        }
                        J(this).find(".cv-text").attr("name", "cv_" + (e + 1) + "_text");
                    } else if (J(this).hasClass("cv-collection")) {
                        t = J(this).find(".cv-heading").attr("name", "cv_" + (e + 1) + "_heading");
                        if (t.val() == "Enter a section name") {
                            t.val("");
                        }
                        J(this).find("select.cv-collection").attr("name", "cv_" + (e + 1) + "_collection");
                    }
                });
            });
            Zotero.ui.init.rte("nolinks", false, J("#cv-sections"));
        }
    },
    settings_account: {},
    settings_profile: {
        init: function() {
            Zotero.ui.init.rte("nolinks");
        }
    },
    settings_privacy: {
        init: function() {
            if (!J("input#privacy_publishLibrary").prop("checked")) {
                J("input#privacy_publishNotes").prop("disabled", true);
            }
            J("input#privacy_publishLibrary").bind("change", function() {
                if (!J("input#privacy_publishLibrary").prop("checked")) {
                    J("input#privacy_publishNotes").prop("checked", false).prop("disabled", true);
                } else {
                    J("input#privacy_publishNotes").prop("disabled", false);
                }
            });
        }
    },
    settings_apikeys: {
        init: function() {}
    },
    settings_newkey: {
        init: function() {
            Z.debug("zoteroPages settings_newkey", 3);
            Zotero.pages.settings_editkey.init();
        }
    },
    settings_newoauthkey: {
        init: function() {
            Zotero.pages.settings_newkey.init();
            J("button[name='edit']").closest("div.form-group").nextAll().hide();
            J("button[name='edit']").click(function(e) {
                e.preventDefault();
                J("button[name='edit']").closest("div.form-group").nextAll().show();
            });
        },
        updatePermissionsSummary: function() {
            J("#permissions-summary").empty().append(Z.pages.settings_newoauthkey.permissionsSummary());
        },
        permissionsSummary: function() {
            var e = "";
            var t = J("input#library_access").prop("checked");
            var r = J("input#notes_access").prop("checked");
            var a = J("input#write_access").prop("checked");
            if (t) {
                e += "Access to read your personal library.<br />";
            }
            if (r) {
                e += "Access to read notes in your personal library.<br />";
            }
            if (a) {
                e += "Access to read and modify your personal library.<br />";
            }
            var o = J("input[name='groups_all']:checked").val();
            switch (o) {
              case "read":
                e += "Access to read any of your group libraries<br />";
                break;

              case "write":
                e += "Access to read and modify any of your group libraries<br />";
                break;
            }
            var i = J("input#individual_groups").prop("checked");
            var n = [];
            if (i) {
                J("input.individual_group_permission:checked").each(function(t, r) {
                    var a = J(r).data("groupname");
                    var o = J(r).data("groupid");
                    var i = J(r).val();
                    switch (i) {
                      case "read":
                        e += "Access to read library for group '" + a + "'<br />";
                        break;

                      case "write":
                        e += "Access to read and modify library for group '" + a + "'<br />";
                        break;
                    }
                });
            }
            return e;
        }
    },
    settings_editkey: {
        init: function() {
            Z.debug("zoteroPages settings_editkey", 3);
            if (!J("input[type='checkbox'][name='library_access']").prop("checked")) {
                J("input[name='notes_access']").prop("disabled", "disabled");
            }
            J("input#library_access").bind("change", function() {
                if (!J("input[type='checkbox'][name='library_access']").prop("checked")) {
                    J("input[name='notes_access']").prop("checked", false).prop("disabled", true);
                    J("input[name='write_access']").prop("checked", false).prop("disabled", true);
                } else {
                    J("input[name='notes_access']").prop("disabled", false);
                    J("input[name='write_access']").prop("disabled", false);
                }
            });
            J("input[name='name']").focus();
            if (!J("input[type='checkbox'][name='individual_groups']").prop("checked")) {
                J(".individual_group_permission").closest("div.form-group").hide();
            }
            J("input[name='individual_groups']").bind("change", function() {
                Z.debug("individual groups checkbox changed");
                if (J("input[type='checkbox'][name='individual_groups']").prop("checked")) {
                    J(".individual_group_permission").closest("div.form-group").show();
                } else {
                    J(".individual_group_permission").closest("div.form-group").hide();
                }
            });
            J("input").bind("change", Zotero.pages.settings_newoauthkey.updatePermissionsSummary);
            Zotero.pages.settings_newoauthkey.updatePermissionsSummary();
        }
    },
    settings_storage: {
        init: function() {
            selectedLevel = J("input[name=storageLevel]:checked").val();
            Zotero.pages.settings_storage.showSelectedResults(selectedLevel);
            J("input[name=storageLevel]").change(function() {
                Zotero.pages.settings_storage.showSelectedResults(J("input[name=storageLevel]:checked").val());
            });
            J("#purge-button").click(function() {
                if (confirm("You are about to remove all uploaded files associated with your personal library.")) {
                    J("#confirm_delete").val("confirmed");
                    return true;
                } else {
                    return false;
                }
            });
        },
        showSelectedResults: function(e) {
            if (e == 2) {
                J("#order-result-div").html(zoteroData.orderResult2);
            } else if (e == 3) {
                J("#order-result-div").html(zoteroData.orderResult3);
            } else if (e == 4) {
                J("#order-result-div").html(zoteroData.orderResult4);
            } else if (e == 5) {
                J("#order-result-div").html(zoteroData.orderResult5);
            } else if (e == 6) {
                J("#order-result-div").html(zoteroData.orderResult6);
            }
        }
    },
    settings_deleteaccount: {
        init: function() {
            J("button#deleteaccount").click(function() {
                if (!confirm("Are you sure you want to permanently delete your account? You will not be able to recover the account or the user name.")) {
                    return false;
                }
            });
        }
    },
    group_new: {
        init: function() {
            var e;
            J("input#name").keyup(function(t) {
                clearTimeout(e);
                e = setTimeout(Zotero.pages.group_new.nameChange, 300);
            });
            J("input[name=group_type]").change(Zotero.pages.group_new.nameChange);
            J("input#name").after("<label id='slugpreview'>Group URL: " + Zotero.config.baseZoteroWebsiteUrl + "/" + "groups/" + Zotero.utils.slugify(J("input#name").val()) + "</label>");
        },
        nameChange: function() {
            J("#slugpreview").css("color", "black");
            var e = J("input[name=group_type]:checked").val();
            if (e == "Private") {
                J("#slugpreview").text("Group URL: " + Zotero.config.baseZoteroWebsiteUrl + "/" + "groups/<number>");
            } else {
                J("#slugpreview").text("Group URL: " + Zotero.config.baseZoteroWebsiteUrl + "/" + "groups/" + Zotero.utils.slugify(J("input#name").val()));
            }
            if (e != "Private") {
                var t = J("input#name").val();
                J.getJSON(baseURL + "/group/checkname/", {
                    input: t
                }, function(e) {
                    J("#namePreview span").text(e.slug);
                    if (e.valid) {
                        J("#slugpreview").css({
                            color: "green"
                        });
                    } else {
                        J("#slugpreview").css({
                            color: "red"
                        });
                    }
                    J("#namePreview img").remove();
                });
            }
        }
    },
    group_settings: {
        init: function() {
            Zotero.debug("initializing group delete form");
            Zotero.ui.init.rte("nolinks");
            J("#deleteForm").submit(function() {
                if (confirm("This will permanently delete this group, including any items in the group library")) {
                    J("#confirm_delete").val("confirmed");
                    return true;
                } else {
                    return false;
                }
            });
            J("#type-PublicOpen").click(function() {
                if (confirm("Changing a group to Public Open will remove all files from Zotero Storage")) {
                    return true;
                } else {
                    return false;
                }
            });
        }
    },
    group_library_settings: {
        init: function() {
            if (J("#type-PublicOpen").prop("checked")) {
                J("#fileEditing-admins").prop("disabled", "1");
                J("#fileEditing-members").prop("disabled", "1");
            }
            if (J("#type-Private").prop("checked")) {
                J("#libraryReading-all").prop("disabled", "1");
            }
            J("#type-PublicOpen").click(function() {
                if (confirm("Changing a group to Public Open will remove all files from Zotero Storage")) {
                    J("input[name='fileEditing']").val([ "none" ]);
                    J("#fileEditing-admins").prop("disabled", "1");
                    J("#fileEditing-members").prop("disabled", "1");
                    J("#libraryReading-all").prop("disabled", "");
                    return true;
                } else {
                    return false;
                }
            });
            J("#type-Private").click(function() {
                J("input[name='libraryReading']").val([ "members" ]);
                J("#libraryReading-all").prop("disabled", "1");
                J("#fileEditing-admins").prop("disabled", "");
                J("#fileEditing-members").prop("disabled", "");
            });
            J("#type-PublicClosed").click(function() {
                J("#fileEditing-admins").prop("disabled", "");
                J("#fileEditing-members").prop("disabled", "");
                J("#libraryReading-all").prop("disabled", "");
            });
        }
    },
    group_view: {
        init: function() {
            J("#join-group-button").click(Zotero.pages.group_view.joinGroup);
            J("#leave-group-button").click(Zotero.pages.group_view.leaveGroup);
            Zotero.ui.init.rte("nolinks");
        },
        joinGroup: function() {
            Zotero.ui.showSpinner(J(".join-group-div"));
            J.post("/groups/" + zoteroData.groupID + "/join", {
                ajax: true
            }, function(e) {
                if (e.pending === true) {
                    J(".join-group-div").empty().append("Membership Pending");
                } else if (e.success === true) {
                    Zotero.ui.jsNotificationMessage("You are now a member of this group", "success");
                } else {
                    J(".join-group-div").empty();
                    Zotero.ui.jsNotificationMessage("There was a problem joining this group.", "error");
                }
            }, "json");
        },
        leaveGroup: function() {
            if (confirm("Leave group?")) {
                Zotero.ui.showSpinner(J(".leave-group-div"));
                J.post("/groups/" + zoteroData.groupID + "/leave", {
                    ajax: true
                }, function(e) {
                    if (e.success === true) {
                        J("leave-group-div").empty();
                        Zotero.ui.jsNotificationMessage("You are no longer a member of this group", "success");
                    } else {
                        J("leave-group-div").empty();
                        Zotero.ui.jsNotificationMessage("There was a problem leaving this group. Please try again in a few minutes.", "error");
                    }
                }, "json");
            }
        }
    },
    group_index: {
        init: function() {}
    },
    groupdiscussion_view: {
        init: function() {}
    },
    user_register: {
        init: function() {
            J("input[name='username']").after("<label id='slugpreview'>Profile URL: " + Zotero.config.baseZoteroWebsiteUrl + "/" + Zotero.utils.slugify(J("input[name='username']").val()) + "</label>");
            J("input[name='username']").bind("keyup change", Zotero.pages.user_register.nameChange);
        },
        nameChange: function() {
            J("#slugpreview").css("color", "black");
            parent.slug = Zotero.utils.slugify(J("input[name='username']").val());
            J("#slugpreview").text("Profile URL: " + Zotero.config.baseZoteroWebsiteUrl + "/" + parent.slug);
            clearTimeout(parent.checkUserSlugTimeout);
            parent.checkUserSlugTimeout = setTimeout(Zotero.pages.user_register.checkSlug, 500);
        },
        checkSlug: function() {
            J.getJSON(baseURL + "/user/checkslug", {
                slug: slug
            }, function(e) {
                if (e.valid) {
                    J("#slugpreview").css("color", "green");
                } else {
                    J("#slugpreview").css("color", "red");
                }
            });
        }
    },
    user_profile: {
        init: function() {
            J("#invite-button").click(function() {
                var e = J("#invite_group").val();
                J.post("/groups/inviteuser", {
                    ajax: true,
                    groupID: e,
                    userID: zoteroData.profileUserID
                }, function(e) {
                    if (e == "true") {
                        Zotero.ui.jsNotificationMessage("User has been invited to join your group.", "success");
                        J("#invited-user-list").append("<li>" + J("#invite_group > option:selected").html() + "</li>");
                        J("#invite_group > option:selected").remove();
                        if (J("#invite_group > option").length === 0) {
                            J("#invite_group").remove();
                            J("#invite-button").remove();
                        }
                    }
                }, "text");
            });
        }
    },
    group_compose: {
        init: function() {
            Zotero.ui.init.rte("nolinks");
        }
    },
    index_index: {},
    search_index: {
        init: function() {}
    },
    search_items: {
        init: function() {
            try {
                var e = new Zotero.Library();
            } catch (t) {
                Z.debug("Error initializing library");
            }
            J("#item-submit").bind("click submit", J.proxy(function(t) {
                Z.debug("item search submitted", 3);
                t.preventDefault();
                t.stopImmediatePropagation();
                var r = J("#itemQuery").val();
                var a = e.fetchGlobalItems({
                    q: r
                });
                a.then(function(e) {
                    Z.debug("globalItemSearch callback", 3);
                    Z.debug(e);
                    J("#search-result-count").empty().append(e.totalResults);
                    var t = J("#search-results");
                    t.empty();
                    J.each(e.objects, function(e, r) {
                        J("#globalitemdetailsTemplate").tmpl({
                            globalItem: r
                        }).appendTo(t);
                    });
                });
                return false;
            }, this));
        }
    },
    index_start: {
        init: function() {
            Zotero.pages.index_start.sizeIframe();
            J(window).resize(Zotero.pages.index_start.sizeIframe);
            J(".start-select").click(function() {
                J("iframe").attr("src", J(this).attr("href"));
                return false;
            });
            J(".start-show-overlay").click(function() {
                J("#start-overlay").show();
                return false;
            });
            J(".start-hide-overlay").click(function() {
                J("#start-overlay").hide();
                return false;
            });
            Zotero.pages.user_register.init();
        },
        sizeIframe: function() {
            J("iframe").css("height", J(window).height() - 144);
        }
    },
    index_startstandalone: {
        init: function() {
            var e = BrowserDetect.browser;
            switch (e) {
              case "Chrome":
                J("#chrome-connector-download-button").closest("li").detach().prependTo("#recommended-download > ul");
                break;

              case "Safari":
                J("#safari-connector-download-button").closest("li").detach().prependTo("#recommended-download > ul");
                break;

              case "Firefox":
                J("#firefox-connector-message").closest("li").detach().prependTo("#recommended-download > ul");
                break;

              default:
                J("#connector-download-button").closest("li").detach().prependTo("#recommended-download > ul");
                J("#other-connectors-p").hide();
            }
            J("#recommended-download > ul").prepend("<li><p>Zotero Connectors allow you to save to Zotero directly from your web browser.</p></li>");
            Zotero.pages.user_register.init();
        }
    },
    index_download: {
        init: function() {
            var e = BrowserDetect.browser;
            var t = BrowserDetect.OS;
            var r = navigator.userAgent.indexOf("x86_64") != -1 ? "x86_64" : "x86";
            if (t == "Windows") {
                J("#standalone-windows-download-button").closest("li").clone().prependTo("#recommended-client-download ul");
            } else if (t == "Mac") {
                J("#standalone-mac-download-button").closest("li").clone().prependTo("#recommended-client-download ul");
            } else if (t == "Linux") {
                if (r == "x86_64") {
                    J("#standalone-linux64-download-button").closest("li").clone().prependTo("#recommended-client-download ul");
                } else {
                    J("#standalone-linux32-download-button").closest("li").clone().prependTo("#recommended-client-download ul");
                }
            } else {}
            J("#recommended-connector-download").show();
            switch (e) {
              case "Chrome":
                J("#chrome-connector-download-button").addClass("recommended-download").closest("li").detach().prependTo("#recommended-connector-download ul");
                break;

              case "Safari":
                J("#safari-connector-download-button").addClass("recommended-download").closest("li").detach().prependTo("#recommended-connector-download ul");
                break;

              case "Firefox":
                J("#firefox-connector-download-button").addClass("recommended-download").closest("li").detach().prependTo("#recommended-connector-download ul");
                break;

              default:
                J("#connector-download-button").closest("li").clone().prependTo("#recommended-connector-download ul");
                J("#other-connectors-p").hide();
            }
            J("#recommended-download ul").prepend("<li><p>Zotero Connectors allow you to save to Zotero directly from your web browser.</p></li>");
        }
    },
    index_bookmarklet: {
        init: function() {
            J(".bookmarklet-instructions").hide();
            var e = J("#bookmarklet-tabs li.selected").data("section");
            J("#" + e + "-bookmarklet-div").show();
            J("#bookmarklet-tabs li").on("click", function(e) {
                Z.debug("bookmarklet tab clicked");
                J("#bookmarklet-tabs li.selected").removeClass("selected");
                J(this).addClass("selected");
                var t = J(this).data("section");
                Z.debug(t);
                J(".bookmarklet-instructions").hide();
                J("#" + t + "-bookmarklet-div").show();
            });
        }
    }
};