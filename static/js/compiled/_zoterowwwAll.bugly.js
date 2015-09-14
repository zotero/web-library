(function(e, t) {
    var r, o = Array.prototype.slice, i = decodeURIComponent, a = e.param, n, s, l, c, d = e.bbq = e.bbq || {}, u, g, p, f = e.event.special, m = "hashchange", b = "querystring", y = "fragment", h = "elemUrlAttr", Z = "href", v = "src", w = /^.*\?|#.*$/g, I, J, T, C, k, S = {};
    function j(e) {
        return typeof e === "string";
    }
    function L(e) {
        var t = o.call(arguments, 1);
        return function() {
            return e.apply(this, t.concat(o.call(arguments)));
        };
    }
    function x(e) {
        return e.replace(J, "$2");
    }
    function D(e) {
        return e.replace(/(?:^[^?#]*\?([^#]*).*$)?.*/, "$1");
    }
    function O(t, o, a, s, c) {
        var d, u, g, p, f;
        if (s !== r) {
            g = a.match(t ? J : /^([^#?]*)\??([^#]*)(#?.*)/);
            f = g[3] || "";
            if (c === 2 && j(s)) {
                u = s.replace(t ? I : w, "");
            } else {
                p = l(g[2]);
                s = j(s) ? l[t ? y : b](s) : s;
                u = c === 2 ? s : c === 1 ? e.extend({}, s, p) : e.extend({}, p, s);
                u = n(u);
                if (t) {
                    u = u.replace(T, i);
                }
            }
            d = g[1] + (t ? k : u || !g[1] ? "?" : "") + u + f;
        } else {
            d = o(a !== r ? a : location.href);
        }
        return d;
    }
    a[b] = L(O, 0, D);
    a[y] = s = L(O, 1, x);
    a.sorted = n = function(t, r) {
        var o = [], i = {};
        e.each(a(t, r).split("&"), function(e, t) {
            var r = t.replace(/(?:%5B|=).*$/, ""), a = i[r];
            if (!a) {
                a = i[r] = [];
                o.push(r);
            }
            a.push(t);
        });
        return e.map(o.sort(), function(e) {
            return i[e];
        }).join("&");
    };
    s.noEscape = function(t) {
        t = t || "";
        var r = e.map(t.split(""), encodeURIComponent);
        T = new RegExp(r.join("|"), "g");
    };
    s.noEscape(",/");
    s.ajaxCrawlable = function(e) {
        if (e !== r) {
            if (e) {
                I = /^.*(?:#!|#)/;
                J = /^([^#]*)(?:#!|#)?(.*)$/;
                k = "#!";
            } else {
                I = /^.*#/;
                J = /^([^#]*)#?(.*)$/;
                k = "#";
            }
            C = !!e;
        }
        return C;
    };
    s.ajaxCrawlable(0);
    e.deparam = l = function(t, o) {
        var a = {}, n = {
            "true": !0,
            "false": !1,
            "null": null
        };
        e.each(t.replace(/\+/g, " ").split("&"), function(t, s) {
            var l = s.split("="), c = i(l[0]), d, u = a, g = 0, p = c.split("]["), f = p.length - 1;
            if (/\[/.test(p[0]) && /\]$/.test(p[f])) {
                p[f] = p[f].replace(/\]$/, "");
                p = p.shift().split("[").concat(p);
                f = p.length - 1;
            } else {
                f = 0;
            }
            if (l.length === 2) {
                d = i(l[1]);
                if (o) {
                    d = d && !isNaN(d) ? +d : d === "undefined" ? r : n[d] !== r ? n[d] : d;
                }
                if (f) {
                    for (;g <= f; g++) {
                        c = p[g] === "" ? u.length : p[g];
                        u = u[c] = g < f ? u[c] || (p[g + 1] && isNaN(p[g + 1]) ? {} : []) : d;
                    }
                } else {
                    if (e.isArray(a[c])) {
                        a[c].push(d);
                    } else {
                        if (a[c] !== r) {
                            a[c] = [ a[c], d ];
                        } else {
                            a[c] = d;
                        }
                    }
                }
            } else {
                if (c) {
                    a[c] = o ? r : "";
                }
            }
        });
        return a;
    };
    function A(e, t, o) {
        if (t === r || typeof t === "boolean") {
            o = t;
            t = a[e ? y : b]();
        } else {
            t = j(t) ? t.replace(e ? I : w, "") : t;
        }
        return l(t, o);
    }
    l[b] = L(A, 0);
    l[y] = c = L(A, 1);
    e[h] || (e[h] = function(t) {
        return e.extend(S, t);
    })({
        a: Z,
        base: Z,
        iframe: v,
        img: v,
        input: v,
        form: "action",
        link: Z,
        script: v
    });
    p = e[h];
    function E(t, o, i, n) {
        if (!j(i) && typeof i !== "object") {
            n = i;
            i = o;
            o = r;
        }
        return this.each(function() {
            var r = e(this), s = o || p()[(this.nodeName || "").toLowerCase()] || "", l = s && r.attr(s) || "";
            r.attr(s, a[t](l, i, n));
        });
    }
    e.fn[b] = L(E, b);
    e.fn[y] = L(E, y);
    d.pushState = u = function(e, t) {
        if (j(e) && /^#/.test(e) && t === r) {
            t = 2;
        }
        var o = e !== r, i = s(location.href, o ? e : {}, o ? t : 2);
        location.href = i;
    };
    d.getState = g = function(e, t) {
        return e === r || typeof e === "boolean" ? c(e) : c(t)[e];
    };
    d.removeState = function(t) {
        var o = {};
        if (t !== r) {
            o = g();
            e.each(e.isArray(t) ? t : arguments, function(e, t) {
                delete o[t];
            });
        }
        u(o, 2);
    };
    f[m] = e.extend(f[m], {
        add: function(t) {
            var o;
            function i(e) {
                var t = e[y] = s();
                e.getState = function(e, o) {
                    return e === r || typeof e === "boolean" ? l(t, e) : l(t, o)[e];
                };
                o.apply(this, arguments);
            }
            if (e.isFunction(t)) {
                o = t;
                return i;
            } else {
                o = t.handler;
                t.handler = i;
            }
        }
    });
})(jQuery, this);

!function() {
    var e, t, r, o;
    !function() {
        var i = {}, a = {};
        e = function(e, t, r) {
            i[e] = {
                deps: t,
                callback: r
            };
        }, o = r = t = function(e) {
            function r(t) {
                if ("." !== t.charAt(0)) return t;
                for (var r = t.split("/"), o = e.split("/").slice(0, -1), i = 0, a = r.length; a > i; i++) {
                    var n = r[i];
                    if (".." === n) o.pop(); else {
                        if ("." === n) continue;
                        o.push(n);
                    }
                }
                return o.join("/");
            }
            if (o._eak_seen = i, a[e]) return a[e];
            if (a[e] = {}, !i[e]) throw new Error("Could not find module " + e);
            for (var n, s = i[e], l = s.deps, c = s.callback, d = [], u = 0, g = l.length; g > u; u++) "exports" === l[u] ? d.push(n = {}) : d.push(t(r(l[u])));
            var p = c.apply(this, d);
            return a[e] = n || p;
        };
    }(), e("promise/all", [ "./utils", "exports" ], function(e, t) {
        "use strict";
        function r(e) {
            var t = this;
            if (!o(e)) throw new TypeError("You must pass an array to all.");
            return new t(function(t, r) {
                function o(e) {
                    return function(t) {
                        a(e, t);
                    };
                }
                function a(e, r) {
                    s[e] = r, 0 === --l && t(s);
                }
                var n, s = [], l = e.length;
                0 === l && t([]);
                for (var c = 0; c < e.length; c++) n = e[c], n && i(n.then) ? n.then(o(c), r) : a(c, n);
            });
        }
        var o = e.isArray, i = e.isFunction;
        t.all = r;
    }), e("promise/asap", [ "exports" ], function(e) {
        "use strict";
        function t() {
            return function() {
                process.nextTick(i);
            };
        }
        function r() {
            var e = 0, t = new l(i), r = document.createTextNode("");
            return t.observe(r, {
                characterData: !0
            }), function() {
                r.data = e = ++e % 2;
            };
        }
        function o() {
            return function() {
                c.setTimeout(i, 1);
            };
        }
        function i() {
            for (var e = 0; e < d.length; e++) {
                var t = d[e], r = t[0], o = t[1];
                r(o);
            }
            d = [];
        }
        function a(e, t) {
            var r = d.push([ e, t ]);
            1 === r && n();
        }
        var n, s = "undefined" != typeof window ? window : {}, l = s.MutationObserver || s.WebKitMutationObserver, c = "undefined" != typeof global ? global : this, d = [];
        n = "undefined" != typeof process && "[object process]" === {}.toString.call(process) ? t() : l ? r() : o(), 
        e.asap = a;
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
        function o() {
            var e = "Promise" in window && "cast" in window.Promise && "resolve" in window.Promise && "reject" in window.Promise && "all" in window.Promise && "race" in window.Promise && function() {
                var e;
                return new window.Promise(function(t) {
                    e = t;
                }), a(e);
            }();
            e || (window.Promise = i);
        }
        var i = e.Promise, a = t.isFunction;
        r.polyfill = o;
    }), e("promise/promise", [ "./config", "./utils", "./cast", "./all", "./race", "./resolve", "./reject", "./asap", "exports" ], function(e, t, r, o, i, a, n, s, l) {
        "use strict";
        function c(e) {
            if (!I(e)) throw new TypeError("You must pass a resolver function as the first argument to the promise constructor");
            if (!(this instanceof c)) throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
            this._subscribers = [], d(e, this);
        }
        function d(e, t) {
            function r(e) {
                m(t, e);
            }
            function o(e) {
                y(t, e);
            }
            try {
                e(r, o);
            } catch (i) {
                o(i);
            }
        }
        function u(e, t, r, o) {
            var i, a, n, s, l = I(r);
            if (l) try {
                i = r(o), n = !0;
            } catch (c) {
                s = !0, a = c;
            } else i = o, n = !0;
            f(t, i) || (l && n ? m(t, i) : s ? y(t, a) : e === D ? m(t, i) : e === O && y(t, i));
        }
        function g(e, t, r, o) {
            var i = e._subscribers, a = i.length;
            i[a] = t, i[a + D] = r, i[a + O] = o;
        }
        function p(e, t) {
            for (var r, o, i = e._subscribers, a = e._detail, n = 0; n < i.length; n += 3) r = i[n], 
            o = i[n + t], u(t, r, o, a);
            e._subscribers = null;
        }
        function f(e, t) {
            var r, o = null;
            try {
                if (e === t) throw new TypeError("A promises callback cannot return that same promise.");
                if (w(t) && (o = t.then, I(o))) return o.call(t, function(o) {
                    return r ? !0 : (r = !0, t !== o ? m(e, o) : b(e, o), void 0);
                }, function(t) {
                    return r ? !0 : (r = !0, y(e, t), void 0);
                }), !0;
            } catch (i) {
                return r ? !0 : (y(e, i), !0);
            }
            return !1;
        }
        function m(e, t) {
            e === t ? b(e, t) : f(e, t) || b(e, t);
        }
        function b(e, t) {
            e._state === L && (e._state = x, e._detail = t, v.async(h, e));
        }
        function y(e, t) {
            e._state === L && (e._state = x, e._detail = t, v.async(Z, e));
        }
        function h(e) {
            p(e, e._state = D);
        }
        function Z(e) {
            p(e, e._state = O);
        }
        var v = e.config, w = (e.configure, t.objectOrFunction), I = t.isFunction, J = (t.now, 
        r.cast), T = o.all, C = i.race, k = a.resolve, S = n.reject, j = s.asap;
        v.async = j;
        var L = void 0, x = 0, D = 1, O = 2;
        c.prototype = {
            constructor: c,
            _state: void 0,
            _detail: void 0,
            _subscribers: void 0,
            then: function(e, t) {
                var r = this, o = new this.constructor(function() {});
                if (this._state) {
                    var i = arguments;
                    v.async(function() {
                        u(r._state, o, i[r._state - 1], r._detail);
                    });
                } else g(this, o, e, t);
                return o;
            },
            "catch": function(e) {
                return this.then(null, e);
            }
        }, c.all = T, c.cast = J, c.race = C, c.resolve = k, c.reject = S, l.Promise = c;
    }), e("promise/race", [ "./utils", "exports" ], function(e, t) {
        "use strict";
        function r(e) {
            var t = this;
            if (!o(e)) throw new TypeError("You must pass an array to race.");
            return new t(function(t, r) {
                for (var o, i = 0; i < e.length; i++) o = e[i], o && "function" == typeof o.then ? o.then(t, r) : t(o);
            });
        }
        var o = e.isArray;
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
        function o(e) {
            return "[object Array]" === Object.prototype.toString.call(e);
        }
        var i = Date.now || function() {
            return new Date().getTime();
        };
        e.objectOrFunction = t, e.isFunction = r, e.isArray = o, e.now = i;
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
    }, r = function(e, r, o, i, a, n) {
        r = t(t(r, e), t(i, n));
        return t(r << a | r >>> 32 - a, o);
    }, o = function(e, t, o, i, a, n, s) {
        return r(t & o | ~t & i, e, t, a, n, s);
    }, i = function(e, t, o, i, a, n, s) {
        return r(t & i | o & ~i, e, t, a, n, s);
    }, a = function(e, t, o, i, a, n, s) {
        return r(t ^ o ^ i, e, t, a, n, s);
    }, n = function(e, t, o, i, a, n, s) {
        return r(o ^ (t | ~i), e, t, a, n, s);
    }, s = function(e, r) {
        var s = e[0], l = e[1], c = e[2], d = e[3];
        s = o(s, l, c, d, r[0], 7, -680876936);
        d = o(d, s, l, c, r[1], 12, -389564586);
        c = o(c, d, s, l, r[2], 17, 606105819);
        l = o(l, c, d, s, r[3], 22, -1044525330);
        s = o(s, l, c, d, r[4], 7, -176418897);
        d = o(d, s, l, c, r[5], 12, 1200080426);
        c = o(c, d, s, l, r[6], 17, -1473231341);
        l = o(l, c, d, s, r[7], 22, -45705983);
        s = o(s, l, c, d, r[8], 7, 1770035416);
        d = o(d, s, l, c, r[9], 12, -1958414417);
        c = o(c, d, s, l, r[10], 17, -42063);
        l = o(l, c, d, s, r[11], 22, -1990404162);
        s = o(s, l, c, d, r[12], 7, 1804603682);
        d = o(d, s, l, c, r[13], 12, -40341101);
        c = o(c, d, s, l, r[14], 17, -1502002290);
        l = o(l, c, d, s, r[15], 22, 1236535329);
        s = i(s, l, c, d, r[1], 5, -165796510);
        d = i(d, s, l, c, r[6], 9, -1069501632);
        c = i(c, d, s, l, r[11], 14, 643717713);
        l = i(l, c, d, s, r[0], 20, -373897302);
        s = i(s, l, c, d, r[5], 5, -701558691);
        d = i(d, s, l, c, r[10], 9, 38016083);
        c = i(c, d, s, l, r[15], 14, -660478335);
        l = i(l, c, d, s, r[4], 20, -405537848);
        s = i(s, l, c, d, r[9], 5, 568446438);
        d = i(d, s, l, c, r[14], 9, -1019803690);
        c = i(c, d, s, l, r[3], 14, -187363961);
        l = i(l, c, d, s, r[8], 20, 1163531501);
        s = i(s, l, c, d, r[13], 5, -1444681467);
        d = i(d, s, l, c, r[2], 9, -51403784);
        c = i(c, d, s, l, r[7], 14, 1735328473);
        l = i(l, c, d, s, r[12], 20, -1926607734);
        s = a(s, l, c, d, r[5], 4, -378558);
        d = a(d, s, l, c, r[8], 11, -2022574463);
        c = a(c, d, s, l, r[11], 16, 1839030562);
        l = a(l, c, d, s, r[14], 23, -35309556);
        s = a(s, l, c, d, r[1], 4, -1530992060);
        d = a(d, s, l, c, r[4], 11, 1272893353);
        c = a(c, d, s, l, r[7], 16, -155497632);
        l = a(l, c, d, s, r[10], 23, -1094730640);
        s = a(s, l, c, d, r[13], 4, 681279174);
        d = a(d, s, l, c, r[0], 11, -358537222);
        c = a(c, d, s, l, r[3], 16, -722521979);
        l = a(l, c, d, s, r[6], 23, 76029189);
        s = a(s, l, c, d, r[9], 4, -640364487);
        d = a(d, s, l, c, r[12], 11, -421815835);
        c = a(c, d, s, l, r[15], 16, 530742520);
        l = a(l, c, d, s, r[2], 23, -995338651);
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
        var t = e.length, r = [ 1732584193, -271733879, -1732584194, 271733878 ], o, i, a, n, c, d;
        for (o = 64; o <= t; o += 64) {
            s(r, l(e.substring(o - 64, o)));
        }
        e = e.substring(o - 64);
        i = e.length;
        a = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
        for (o = 0; o < i; o += 1) {
            a[o >> 2] |= e.charCodeAt(o) << (o % 4 << 3);
        }
        a[o >> 2] |= 128 << (o % 4 << 3);
        if (o > 55) {
            s(r, a);
            for (o = 0; o < 16; o += 1) {
                a[o] = 0;
            }
        }
        n = t * 8;
        n = n.toString(16).match(/(.*?)(.{0,8})$/);
        c = parseInt(n[2], 16);
        d = parseInt(n[1], 16) || 0;
        a[14] = c;
        a[15] = d;
        s(r, a);
        return r;
    }, u = function(e) {
        var t = e.length, r = [ 1732584193, -271733879, -1732584194, 271733878 ], o, i, a, n, l, d;
        for (o = 64; o <= t; o += 64) {
            s(r, c(e.subarray(o - 64, o)));
        }
        e = o - 64 < t ? e.subarray(o - 64) : new Uint8Array(0);
        i = e.length;
        a = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
        for (o = 0; o < i; o += 1) {
            a[o >> 2] |= e[o] << (o % 4 << 3);
        }
        a[o >> 2] |= 128 << (o % 4 << 3);
        if (o > 55) {
            s(r, a);
            for (o = 0; o < 16; o += 1) {
                a[o] = 0;
            }
        }
        n = t * 8;
        n = n.toString(16).match(/(.*?)(.{0,8})$/);
        l = parseInt(n[2], 16);
        d = parseInt(n[1], 16) || 0;
        a[14] = l;
        a[15] = d;
        s(r, a);
        return r;
    }, g = [ "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f" ], p = function(e) {
        var t = "", r;
        for (r = 0; r < 4; r += 1) {
            t += g[e >> r * 8 + 4 & 15] + g[e >> r * 8 & 15];
        }
        return t;
    }, f = function(e) {
        var t;
        for (t = 0; t < e.length; t += 1) {
            e[t] = p(e[t]);
        }
        return e.join("");
    }, m = function(e) {
        return f(d(e));
    }, b = function() {
        this.reset();
    };
    if (m("hello") !== "5d41402abc4b2a76b9719d911017c592") {
        t = function(e, t) {
            var r = (e & 65535) + (t & 65535), o = (e >> 16) + (t >> 16) + (r >> 16);
            return o << 16 | r & 65535;
        };
    }
    b.prototype.append = function(e) {
        if (/[\u0080-\uFFFF]/.test(e)) {
            e = unescape(encodeURIComponent(e));
        }
        this.appendBinary(e);
        return this;
    };
    b.prototype.appendBinary = function(e) {
        this._buff += e;
        this._length += e.length;
        var t = this._buff.length, r;
        for (r = 64; r <= t; r += 64) {
            s(this._state, l(this._buff.substring(r - 64, r)));
        }
        this._buff = this._buff.substr(r - 64);
        return this;
    };
    b.prototype.end = function(e) {
        var t = this._buff, r = t.length, o, i = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ], a;
        for (o = 0; o < r; o += 1) {
            i[o >> 2] |= t.charCodeAt(o) << (o % 4 << 3);
        }
        this._finish(i, r);
        a = !!e ? this._state : f(this._state);
        this.reset();
        return a;
    };
    b.prototype._finish = function(e, t) {
        var r = t, o, i, a;
        e[r >> 2] |= 128 << (r % 4 << 3);
        if (r > 55) {
            s(this._state, e);
            for (r = 0; r < 16; r += 1) {
                e[r] = 0;
            }
        }
        o = this._length * 8;
        o = o.toString(16).match(/(.*?)(.{0,8})$/);
        i = parseInt(o[2], 16);
        a = parseInt(o[1], 16) || 0;
        e[14] = i;
        e[15] = a;
        s(this._state, e);
    };
    b.prototype.reset = function() {
        this._buff = "";
        this._length = 0;
        this._state = [ 1732584193, -271733879, -1732584194, 271733878 ];
        return this;
    };
    b.prototype.destroy = function() {
        delete this._state;
        delete this._buff;
        delete this._length;
    };
    b.hash = function(e, t) {
        if (/[\u0080-\uFFFF]/.test(e)) {
            e = unescape(encodeURIComponent(e));
        }
        var r = d(e);
        return !!t ? r : f(r);
    };
    b.hashBinary = function(e, t) {
        var r = d(e);
        return !!t ? r : f(r);
    };
    b.ArrayBuffer = function() {
        this.reset();
    };
    b.ArrayBuffer.prototype.append = function(e) {
        var t = this._concatArrayBuffer(this._buff, e), r = t.length, o;
        this._length += e.byteLength;
        for (o = 64; o <= r; o += 64) {
            s(this._state, c(t.subarray(o - 64, o)));
        }
        this._buff = o - 64 < r ? t.subarray(o - 64) : new Uint8Array(0);
        return this;
    };
    b.ArrayBuffer.prototype.end = function(e) {
        var t = this._buff, r = t.length, o = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ], i, a;
        for (i = 0; i < r; i += 1) {
            o[i >> 2] |= t[i] << (i % 4 << 3);
        }
        this._finish(o, r);
        a = !!e ? this._state : f(this._state);
        this.reset();
        return a;
    };
    b.ArrayBuffer.prototype._finish = b.prototype._finish;
    b.ArrayBuffer.prototype.reset = function() {
        this._buff = new Uint8Array(0);
        this._length = 0;
        this._state = [ 1732584193, -271733879, -1732584194, 271733878 ];
        return this;
    };
    b.ArrayBuffer.prototype.destroy = b.prototype.destroy;
    b.ArrayBuffer.prototype._concatArrayBuffer = function(e, t) {
        var r = e.length, o = new Uint8Array(r + t.byteLength);
        o.set(e);
        o.set(new Uint8Array(t), r);
        return o;
    };
    b.ArrayBuffer.hash = function(e, t) {
        var r = u(new Uint8Array(e));
        return !!t ? r : f(r);
    };
    return b;
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
            J.each(r, function(r, o) {
                t.push(e + "/" + encodeURIComponent(o));
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
    var o = JSON.parse(this.store._registry);
    if (!o) {
        o = {};
    }
    var i = this.objectCacheString(e);
    this.store[i] = JSON.stringify(t);
    var a = {
        id: i,
        saved: Date.now(),
        cachetags: r
    };
    o[i] = a;
    this.store._registry = JSON.stringify(o);
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
    } catch (o) {
        Z.error("Error parsing retrieved cache data: " + t + " : " + r);
        return null;
    }
};

Zotero.Cache.prototype.expireCacheTag = function(e) {
    Z.debug("Zotero.Cache.expireCacheTag", 3);
    var t = JSON.parse(this.store._registry);
    var r = this.store;
    J.each(t, function(o, i) {
        if (J.inArray(e, i.cachetags) != -1) {
            Z.debug("tag " + e + " found for item " + i["id"] + " : expiring", 4);
            delete r[i["id"]];
            delete t[i["id"]];
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
    var o = {
        url: e,
        type: t
    };
    o = J.extend({}, o, r);
    Z.debug(o, 3);
    return Zotero.net.queueRequest(o);
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
    var o = J.Event(e, t);
    try {
        J("#eventful").trigger(o);
    } catch (o) {
        Z.error("failed triggering");
        Z.error(o);
    }
};

Zotero.listen = function(e, t, r, o) {
    if (o) {
        var i = e.split(" ");
        if (i.length > 0) {
            for (var a = 0; a < i.length; a++) {
                i[a] += "_" + o;
            }
            e = i.join(" ");
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
    var o = "?";
    var i = [];
    var a = [ "start", "limit", "order", "sort", "content", "include", "format", "q", "fq", "itemType", "itemKey", "collectionKey", "searchKey", "locale", "tag", "tagType", "key", "style", "linkMode", "linkwrap", "session", "newer", "since" ];
    a.sort();
    var n = {};
    J.each(a, function(t, r) {
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
                i.push(encodeURIComponent(e) + "=" + encodeURIComponent(r));
            });
        } else {
            if (e == "tag" && t[0] == "-") {
                t = "\\" + t;
            }
            i.push(encodeURIComponent(e) + "=" + encodeURIComponent(t));
        }
    });
    o += i.join("&");
    return o;
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
        var o = new XMLHttpRequest();
        var i;
        o.open("GET", e, true);
        o.responseType = "blob";
        o.addEventListener("load", function() {
            if (o.status === 200) {
                Z.debug("downloadBlob Image retrieved. resolving", 3);
                t(o.response);
            } else {
                r(o.response);
            }
        });
        o.send();
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
        return function(r, o) {
            return t.compare(r.apiObj.data[e], o.apiObj.data[e]);
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
        var o = {};
        var i = /^<([^>]+)>; rel="([^\"]*)"$/;
        for (var a = 0; a < r.length; a++) {
            var n = i.exec(r[a].trim());
            if (n[2]) {
                o[n[2]] = n[1];
            }
        }
        t.parsedLinks = o;
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
    var o = Promise.resolve();
    for (var i = 0; i < e.length; i++) {
        var a = e[i];
        o = o.then(function() {
            var e = t.ajaxRequest(a).then(function(e) {
                Z.debug("pushing sequential response into result array");
                r.push(e);
            });
            return e;
        });
    }
    return o.then(function() {
        Z.debug("done with sequential aggregator promise - returning responses");
        return r;
    });
};

Zotero.Net.prototype.individualRequestDone = function(e) {
    Z.debug("Zotero.Net.individualRequestDone", 3);
    var t = this;
    var r = Date.now();
    var o = t.checkDelay(e);
    if (o > 0) {
        waitms = o * 1e3;
        t.backingOff = true;
        var i = Date.now() + waitms;
        if (i > t.waitingExpires) {
            t.waitingExpires = i;
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
        var o = e.deferredQueue.shift();
        o.resolve();
        Z.debug(e.numRunning + "/" + e.numConcurrent + " Running. " + e.deferredQueue.length + " queued.", 3);
    }
};

Zotero.Net.prototype.checkDelay = function(e) {
    Z.debug("Zotero.Net.checkDelay");
    Z.debug(e);
    var t = this;
    var r = 0;
    if (J.isArray(e)) {
        for (var o = 0; o < e.length; o++) {
            iwait = t.checkDelay(e[o]);
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
    var o = J.extend({}, r.headers, e.headers);
    var i = J.extend({}, r, e);
    i.headers = o;
    if (typeof i.url == "object") {
        i.url = Zotero.ajax.apiRequestString(i.url);
    }
    i.url = Zotero.ajax.proxyWrapper(i.url, i.type);
    if (!i.url) {
        throw "No url specified in Zotero.Net.ajaxRequest";
    }
    i.zsuccess = i.success;
    i.zerror = i.error;
    delete i.success;
    delete i.error;
    ajaxpromise = new Promise(function(e, t) {
        J.ajax(i).then(function(t, r, o) {
            Z.debug("library.ajaxRequest jqxhr resolved. resolving Promise", 3);
            var i = new Zotero.ApiResponse({
                jqxhr: o,
                data: t,
                textStatus: r
            });
            e(i);
        }, function(e, r, o) {
            Z.debug("library.ajaxRequest jqxhr rejected. rejecting Promise", 3);
            var i = new Zotero.ApiResponse({
                jqxhr: e,
                textStatus: r,
                errorThrown: o,
                isError: true
            });
            t(i);
        });
    }).then(J.proxy(t.individualRequestDone, t)).then(function(e) {
        if (e.isError) {
            Z.error("re-throwing ApiResponse that was a rejection");
            throw e;
        }
        return e;
    }).then(i.zsuccess, i.zerror);
    return ajaxpromise;
};

Zotero.net = new Zotero.Net();

Zotero.Library = function(e, t, r, o) {
    Z.debug("Zotero.Library constructor", 3);
    Z.debug("Library Constructor: " + e + " " + t + " ", 3);
    var i = this;
    Z.debug(r, 4);
    i.instance = "Zotero.Library";
    i.libraryVersion = 0;
    i.syncState = {
        earliestVersion: null,
        latestVersion: null
    };
    i._apiKey = o || "";
    if (Zotero.config.librarySettings) {
        i.libraryBaseWebsiteUrl = Zotero.config.librarySettings.libraryPathString;
    } else {
        i.libraryBaseWebsiteUrl = Zotero.config.baseWebsiteUrl;
        if (e == "group") {
            i.libraryBaseWebsiteUrl += "groups/";
        }
        if (r) {
            this.libraryBaseWebsiteUrl += r + "/items";
        } else {
            Z.warn("no libraryUrlIdentifier specified");
        }
    }
    i.items = new Zotero.Items();
    i.items.owningLibrary = i;
    i.itemKeys = [];
    i.collections = new Zotero.Collections();
    i.collections.libraryUrlIdentifier = i.libraryUrlIdentifier;
    i.collections.owningLibrary = i;
    i.tags = new Zotero.Tags();
    i.searches = new Zotero.Searches();
    i.searches.owningLibrary = i;
    i.groups = new Zotero.Groups();
    i.groups.owningLibrary = i;
    i.deleted = new Zotero.Deleted();
    i.deleted.owningLibrary = i;
    if (!e) {
        Z.warn("No type specified for library");
        return;
    }
    i.type = e;
    i.libraryType = e;
    i.libraryID = t;
    i.libraryString = Zotero.utils.libraryString(i.libraryType, i.libraryID);
    i.libraryUrlIdentifier = r;
    i.preferences = new Zotero.Preferences(Zotero.store, i.libraryString);
    var a = navigator.userAgent.indexOf("Chrome") > -1;
    var n = navigator.userAgent.indexOf("MSIE") > -1;
    var s = navigator.userAgent.indexOf("Firefox") > -1;
    var l = navigator.userAgent.indexOf("Safari") > -1;
    var c = navigator.userAgent.toLowerCase().indexOf("op") > -1;
    if (a && l) {
        l = false;
    }
    if (a && c) {
        a = false;
    }
    if (l) {
        Zotero.config.useIndexedDB = false;
        Zotero.warn("Safari detected; disabling indexedDB");
    }
    if (Zotero.config.useIndexedDB === true) {
        Z.debug("Library Constructor: indexedDB init", 3);
        var d = new Zotero.Idb.Library(i.libraryString);
        d.owningLibrary = this;
        i.idbLibrary = d;
        d.init().then(function() {
            Z.debug("Library Constructor: idbInitD Done", 3);
            if (Zotero.config.preloadCachedLibrary === true) {
                Z.debug("Library Constructor: preloading cached library", 3);
                var e = i.loadIndexedDBCache();
                e.then(function() {
                    Z.debug("Library Constructor: Library.items.itemsVersion: " + i.items.itemsVersion, 3);
                    Z.debug("Library Constructor: Library.collections.collectionsVersion: " + i.collections.collectionsVersion, 3);
                    Z.debug("Library Constructor: Library.tags.tagsVersion: " + i.tags.tagsVersion, 3);
                    Z.debug("Library Constructor: Triggering cachedDataLoaded", 3);
                    i.trigger("cachedDataLoaded");
                }, function(e) {
                    Z.error("Error loading cached library");
                    Z.error(e);
                    throw new Error("Error loading cached library");
                });
            } else {
                i.trigger("cachedDataLoaded");
            }
        }, function() {
            Zotero.config.useIndexedDB = false;
            i.trigger("indexedDBError");
            i.trigger("cachedDataLoaded");
            Z.error("Error initializing indexedDB. Promise rejected.");
        });
    }
    i.dirty = false;
    i.tagsChanged = function() {};
    i.collectionsChanged = function() {};
    i.itemsChanged = function() {};
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
    var o = {
        url: e,
        type: t
    };
    o = J.extend({}, o, r);
    Z.debug(o, 3);
    return Zotero.net.queueRequest(o);
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
    var o = r.join("/");
    return t.libraryBaseWebsiteUrl + "/" + o;
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
        var o = [];
        J.each(r, function(t, r) {
            var i = e.items.getItem(t);
            if (!i || i.apiObj.key != r) {
                o.push(t);
            }
        });
        return e.loadItemsFromKeys(o);
    }).then(function(t) {
        Z.debug("loadItemsFromKeys resolved", 3);
        e.items.updateSyncedVersion();
        var r = Zotero.state.getUrlVars();
        e.buildItemDisplayView(r);
        if (Zotero.config.useIndexedDB) {
            var o = e.idbLibrary.updateItems(e.items.objectArray);
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
        var o = [];
        J.each(r, function(t, r) {
            var i = e.collections.getCollection(t);
            if (!i || i.apiObj.version != r) {
                o.push(t);
            }
        });
        if (o.length === 0) {
            Z.debug("No collectionKeys need updating. resolving", 3);
            return t;
        } else {
            Z.debug("fetching collections by key", 3);
            return e.loadCollectionsFromKeys(o).then(function() {
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
    var o = e.join(",");
    var i = {
        target: "items",
        libraryType: r.libraryType,
        libraryID: r.libraryID,
        itemKey: o,
        format: "bib",
        linkwrap: "1"
    };
    if (e.length == 1) {
        i.target = "item";
    }
    if (t) {
        i["style"] = t;
    }
    var a = r.ajaxRequest(i).then(function(e) {
        return e.data;
    });
    return a;
};

Zotero.Library.prototype.loadItemBib = function(e, t) {
    Z.debug("Zotero.Library.loadItemBib", 3);
    var r = this;
    var o = {
        target: "item",
        libraryType: r.libraryType,
        libraryID: r.libraryID,
        itemKey: e,
        content: "bib"
    };
    if (t) {
        o["style"] = t;
    }
    var i = Zotero.ajax.apiRequestString(o);
    var a = r.ajaxRequest(o).then(function(e) {
        var t = new Zotero.Item(e.data);
        var r = t.apiObj.bib;
        return r;
    });
    return a;
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
            var o = r.tagColors.value;
            e.preferences.setPref("tagColors", o);
        }
        e.trigger("settingsLoaded");
        return e.preferences;
    });
};

Zotero.Library.prototype.matchColoredTags = function(e) {
    var t = this;
    var r;
    var o = t.preferences.getPref("tagColors");
    if (!o) return [];
    var i = {};
    for (r = 0; r < o.length; r++) {
        i[o[r].name.toLowerCase()] = o[r].color;
    }
    var a = [];
    for (r = 0; r < e.length; r++) {
        if (i.hasOwnProperty(e[r])) {
            a.push(i[e[r]]);
        }
    }
    return a;
};

Zotero.Library.prototype.sendToLibrary = function(e, t) {
    var r = [];
    for (var o = 0; o < e.length; o++) {
        var i = e[o];
        var a = i.emptyJsonItem();
        a.data = J.extend({}, e[o].apiObj.data);
        a.data.key = "";
        a.data.version = 0;
        a.data.collections = [];
        delete a.data.dateModified;
        delete a.data.dateAdded;
        var n = new Zotero.Item(a);
        n.pristine = J.extend({}, n.apiObj);
        n.initSecondaryData();
        if (!n.apiObj.data.relations) {
            n.apiObj.data.relations = {};
        }
        n.apiObj.data.relations["owl:sameAs"] = Zotero.url.relationUrl(i.owningLibrary.libraryType, i.owningLibrary.libraryID, i.key);
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
    var o = {
        target: e,
        format: "versions",
        libraryType: r.libraryType,
        libraryID: r.libraryID,
        since: t
    };
    return r.ajaxRequest(o);
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
    var o = [];
    while (e.length > 0) {
        o.push(e.splice(0, 50));
    }
    var i = [];
    J.each(o, function(e, o) {
        var a = o.join(",");
        switch (t) {
          case "items":
            i.push({
                url: {
                    target: "items",
                    targetModifier: null,
                    itemKey: a,
                    limit: 50,
                    libraryType: r.libraryType,
                    libraryID: r.libraryID
                },
                type: "GET",
                success: J.proxy(r.processLoadedItems, r)
            });
            break;

          case "collections":
            i.push({
                url: {
                    target: "collections",
                    targetModifier: null,
                    collectionKey: a,
                    limit: 50,
                    libraryType: r.libraryType,
                    libraryID: r.libraryID
                },
                type: "GET",
                success: J.proxy(r.processLoadedCollections, r)
            });
            break;

          case "searches":
            i.push({
                url: {
                    target: "searches",
                    targetModifier: null,
                    searchKey: a,
                    limit: 50,
                    libraryType: r.libraryType,
                    libraryID: r.libraryID
                },
                type: "GET"
            });
            break;
        }
    });
    var a = [];
    for (var n = 0; n < i.length; n++) {
        a.push(Zotero.net.queueRequest(i[n]));
    }
    return Promise.all(a);
};

Zotero.Library.prototype.buildItemDisplayView = function(e) {
    Z.debug("Zotero.Library.buildItemDisplayView", 3);
    Z.debug(e, 4);
    var t = this;
    if (!t.idbLibrary.db) {
        return Promise.resolve([]);
    }
    var r;
    var o = [];
    if (e.collectionKey) {
        if (e.collectionKey == "trash") {
            o.push(t.idbLibrary.filterItems("deleted", 1));
        } else {
            o.push(t.idbLibrary.filterItems("collectionKeys", e.collectionKey));
        }
    } else {
        o.push(t.idbLibrary.getOrderedItemKeys("title"));
    }
    var i = e.tag || [];
    if (typeof i == "string") i = [ i ];
    for (var a = 0; a < i.length; a++) {
        Z.debug("adding selected tag filter", 3);
        o.push(t.idbLibrary.filterItems("itemTagStrings", i[a]));
    }
    return Promise.all(o).then(function(r) {
        var o;
        for (o = 0; o < r.length; o++) {
            Z.debug("result from filterPromise: " + r[o].length, 3);
            Z.debug(r[o], 3);
        }
        var i = t.idbLibrary.intersectAll(r);
        itemsArray = t.items.getItems(i);
        Z.debug("All filters applied - Down to " + itemsArray.length + " items displayed", 3);
        Z.debug("remove child items and, if not viewing trash, deleted items", 3);
        var a = [];
        for (o = 0; o < itemsArray.length; o++) {
            if (itemsArray[o].apiObj.data.parentItem) {
                continue;
            }
            if (e.collectionKey != "trash" && itemsArray[o].apiObj.deleted) {
                continue;
            }
            a.push(itemsArray[o]);
        }
        var n = e["order"] || "title";
        var s = e["sort"] || "asc";
        Z.debug("Sorting by " + n + " - " + s, 3);
        var l = Zotero.Library.prototype.comparer();
        a.sort(function(e, t) {
            var r = e.get(n);
            var o = t.get(n);
            return l(r, o);
        });
        if (s == "desc") {
            Z.debug("sort is desc - reversing array", 4);
            a.reverse();
        }
        Z.debug("triggering publishing displayedItemsUpdated", 3);
        t.trigger("displayedItemsUpdated");
        return a;
    });
};

Zotero.Library.prototype.trigger = function(e, t) {
    var r = this;
    Zotero.trigger(e, t, r.libraryString);
};

Zotero.Library.prototype.listen = function(e, t, r) {
    var o = this;
    var i = o.libraryString;
    Zotero.listen(e, t, r, i);
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
        return function(r, o) {
            return t.compare(r.apiObj.data[e], o.apiObj.data[e]);
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
    var o;
    for (var i = 0; i < e.length; i++) {
        o = t.getObject(e[i]);
        if (o) {
            r.push(o);
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
            var o = Zotero.utils.getKey();
            t.set("key", o);
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
        var o = t.get(e[r]);
        if (o !== false) {
            if (o.synced === true) {
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
            J.each(r.success, function(r, o) {
                var i = parseInt(r, 10);
                var a = e[i];
                if (a.key !== "" && a.key !== o) {
                    throw new Error("object key mismatch in multi-write response");
                }
                if (a.key === "") {
                    a.updateObjectKey(o);
                }
                a.set("version", t.lastModifiedVersion);
                a.synced = true;
                a.writeFailure = false;
            });
        }
        if (r.hasOwnProperty("failed")) {
            Z.debug("updating objects with failed writes", 3);
            J.each(r.failed, function(t, r) {
                Z.error("failed write " + t + " - " + r);
                var o = parseInt(t, 10);
                var i = e[o];
                i.writeFailure = r;
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
    J.each(e, function(e, o) {
        var i = new Zotero.Collection(o);
        t.addObject(i);
        r.push(i);
    });
    return r;
};

Zotero.Collections.prototype.assignDepths = function(e, t) {
    Z.debug("Zotero.Collections.assignDepths", 3);
    var r = this;
    var o = function(e, t) {
        J.each(t, function(t, r) {
            r.nestingDepth = e;
            if (r.hasChildren) {
                o(e + 1, r.children);
            }
        });
    };
    J.each(r.collectionsArray, function(e, t) {
        if (t.topLevel) {
            t.nestingDepth = 1;
            if (t.hasChildren) {
                o(2, t.children);
            }
        }
    });
};

Zotero.Collections.prototype.nestedOrderingArray = function() {
    Z.debug("Zotero.Collections.nestedOrderingArray", 3);
    var e = this;
    var t = [];
    var r = function(e, t) {
        J.each(t, function(t, o) {
            e.push(o);
            if (o.hasChildren) {
                r(e, o.children);
            }
        });
    };
    J.each(e.collectionsArray, function(e, o) {
        if (o.topLevel) {
            t.push(o);
            if (o.hasChildren) {
                r(t, o.children);
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
    var o = [];
    var i;
    var a = {
        target: "collections",
        libraryType: t.owningLibrary.libraryType,
        libraryID: t.owningLibrary.libraryID
    };
    var n = Zotero.ajax.apiRequestString(a);
    for (i = 0; i < e.length; i++) {
        var s = e[i];
        var l = s.get("key");
        if (l === "" || l === null) {
            var c = Zotero.utils.getKey();
            s.set("key", c);
            s.set("version", 0);
        }
    }
    var d = t.chunkObjectsArray(e);
    var u = t.rawChunks(d);
    var g = function(e) {
        Z.debug("writeCollections successCallback", 3);
        var t = this.library;
        var r = this.writeChunk;
        t.collections.updateObjectsFromWriteResponse(this.writeChunk, e);
        for (var o = 0; o < r.length; o++) {
            var i = r[o];
            if (i.synced && !i.writeFailure) {
                t.collections.addCollection(i);
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
    var p = [];
    for (i = 0; i < d.length; i++) {
        var f = {
            writeChunk: d[i],
            library: r
        };
        requestData = JSON.stringify(u[i]);
        p.push({
            url: n,
            type: "POST",
            data: requestData,
            processData: false,
            headers: {},
            success: J.proxy(g, f)
        });
    }
    return r.sequentialRequests(p).then(function(e) {
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
    var o = [];
    J.each(r, function(e, r) {
        var i = new Zotero.Item(r);
        t.addItem(i);
        o.push(i);
    });
    return o;
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
    var o = {
        target: "item",
        libraryType: t.owningLibrary.libraryType,
        libraryID: t.owningLibrary.libraryID,
        itemKey: r.key
    };
    var i = {
        url: Zotero.ajax.apiRequestString(config),
        type: "DELETE",
        headers: {
            "If-Unmodified-Since-Version": r.get("version")
        }
    };
    return Zotero.net.ajaxRequest(i);
};

Zotero.Items.prototype.deleteItems = function(e, t) {
    Z.debug("Zotero.Items.deleteItems", 3);
    var r = this;
    var o = [];
    var i;
    if (!t && r.itemsVersion !== 0) {
        t = r.itemsVersion;
    }
    var a;
    for (i = 0; i < e.length; i++) {
        if (!e[i]) continue;
        a = r.extractKey(e[i]);
        if (a) {
            o.push(a);
        }
    }
    var n = r.chunkObjectsArray(o);
    var s = [];
    for (i = 0; i < n.length; i++) {
        var l = n[i].join(",");
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
        var o = e[r];
        o.set("deleted", 1);
    }
    return t.writeItems(e);
};

Zotero.Items.prototype.untrashItems = function(e) {
    var t = this;
    var r;
    for (r = 0; r < e.length; r++) {
        var o = e[r];
        o.set("deleted", 0);
    }
    return t.writeItems(e);
};

Zotero.Items.prototype.findItems = function(e) {
    var t = this;
    var r = [];
    J.each(t.itemObjects, function(o, i) {
        if (e.collectionKey && J.inArray(e.collectionKey, i.apiObj.collections === -1)) {
            return;
        }
        r.push(t.itemObjects[o]);
    });
    return r;
};

Zotero.Items.prototype.atomizeItems = function(e) {
    var t = [];
    var r;
    for (var o = 0; o < e.length; o++) {
        r = e[o];
        var i = r.get("key");
        if (i === "" || i === null) {
            var a = Zotero.utils.getKey();
            r.set("key", a);
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
    var o;
    var i = t.atomizeItems(e);
    var a = {
        target: "items",
        libraryType: t.owningLibrary.libraryType,
        libraryID: t.owningLibrary.libraryID
    };
    var n = Zotero.ajax.apiRequestString(a);
    var s = t.chunkObjectsArray(i);
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
    for (o = 0; o < s.length; o++) {
        var u = {
            writeChunk: s[o],
            library: r
        };
        requestData = JSON.stringify(l[o]);
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
    J.each(e, function(e, o) {
        var i = new Zotero.Tag(o);
        t.addTag(i);
        r.push(i);
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
    J.each(e, function(e, o) {
        Z.debug(o);
        var i = new Zotero.Group(o);
        t.groupsArray.push(i);
        r.push(i);
    });
    return r;
};

Zotero.Groups.prototype.fetchUserGroups = function(e, t) {
    var r = this;
    var o = {
        target: "userGroups",
        libraryType: "user",
        libraryID: e,
        order: "title"
    };
    if (t) {
        o["key"] = t;
    } else if (r.owningLibrary) {
        o["key"] = r.owningLibrary._apiKey;
    }
    return Zotero.ajaxRequest(o).then(function(e) {
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
    if (Zotero.config.libraryPathString) {
        e.websiteCollectionLink = Zotero.config.libraryPathString + "/collectionKey/" + e.apiObj.key;
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
            var o = e[r];
            o.children.push(t);
            o.hasChildren = true;
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
    var o = Zotero.ajax.apiRequestUrl(r) + Zotero.ajax.apiQueryString(r);
    var i = e.join(" ");
    return Zotero.ajaxRequest(o, "POST", {
        data: i,
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
        var o = J.trim(r).split(/[\s]+/);
        e.itemKeys = o;
        return o;
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
    var o = {
        target: "collection",
        libraryType: r.apiObj.library.type,
        libraryID: r.apiObj.library.id,
        collectionKey: r.key
    };
    var i = r.writeApiObj();
    var a = JSON.stringify(i);
    return Zotero.ajaxRequest(o, "PUT", {
        data: a,
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
    var o = [];
    var i = J.proxy(function(e) {
        r.push(e);
    }, this);
    J.each(e, function(e, i) {
        var a = new Zotero.Item();
        var n = a.initEmpty("note").then(function(e) {
            e.set("note", i.note);
            e.set("parentItem", t.key);
            r.push(e);
        });
        o.push(n);
    });
    return Promise.all(o).then(function() {
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
            var o = r.addItemsFromJson(t.data);
            for (var i = o.length - 1; i >= 0; i--) {
                o[i].associateWithLibrary(e);
            }
            return o;
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
    var o = Zotero.config.baseApiUrl + "/itemTypes" + r;
    J.getJSON(Zotero.ajax.proxyWrapper(o, "GET"), {}, function(t, r, o) {
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
    var o = Zotero.config.baseApiUrl + "/itemFields" + r;
    J.getJSON(Zotero.ajax.proxyWrapper(o), {}, function(t, r, o) {
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
    var o = Zotero.config.baseApiUrl + "/items/new" + r;
    var i = {
        itemType: e,
        target: "itemTemplate"
    };
    var a = Zotero.cache.load(i);
    if (a) {
        Z.debug("have itemTemplate in localStorage", 3);
        var n = a;
        return Promise.resolve(n);
    }
    return Zotero.ajaxRequest(o, "GET", {
        dataType: "json"
    }).then(function(e) {
        Z.debug("got itemTemplate response", 3);
        Zotero.cache.save(i, e.data);
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
    var o = {
        "Content-Type": "application/x-www-form-urlencoded"
    };
    var i = t.get("md5");
    if (i) {
        o["If-Match"] = i;
    } else {
        o["If-None-Match"] = "*";
    }
    return Zotero.ajaxRequest(r, "POST", {
        processData: true,
        data: e,
        headers: o
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
    var o = {
        "Content-Type": "application/x-www-form-urlencoded"
    };
    var i = t.get("md5");
    if (i) {
        o["If-Match"] = i;
    } else {
        o["If-None-Match"] = "*";
    }
    return Zotero.ajaxRequest(r, "POST", {
        processData: true,
        data: {
            upload: e
        },
        headers: o
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
        var o = Zotero.config.baseApiUrl + "/itemTypeCreatorTypes" + r;
        return Zotero.ajaxRequest(o, "GET", {
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
    var o = r.indexOf("\n");
    if (o != -1 && o < t) {
        return r.substr(0, o);
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
    var o = this;
    Z.debug("uploadChildAttachment", 3);
    if (!o.owningLibrary) {
        return Promise.reject(new Error("Item must be associated with a library"));
    }
    e.set("parentItem", o.key);
    e.associateWithLibrary(o.owningLibrary);
    return e.writeItem().then(function(i) {
        o.numChildren++;
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
    var o = {
        md5: e.md5,
        filename: r.get("title"),
        filesize: e.filesize,
        mtime: e.mtime,
        contentType: e.contentType,
        params: 1
    };
    if (e.contentType === "") {
        o.contentType = "application/octet-stream";
    }
    return r.getUploadAuthorization(o).then(function(t) {
        Z.debug("uploadAuth callback", 3);
        var o;
        if (typeof t.data == "string") {
            o = JSON.parse(data);
        } else {
            o = t.data;
        }
        if (o.exists == 1) {
            return {
                message: "File Exists"
            };
        } else {
            return Zotero.file.uploadFile(o, e).then(function() {
                return r.registerUpload(o.uploadKey).then(function(e) {
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
    var o = (e.get("accessDate") || e.get("url")) && t in {
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
        if (t == "URL" && o) return;
        J.each(r, function(r, o) {
            var i = e.get(o);
            if (i) {
                cslItem[t] = i;
            }
        });
    });
    var i = e.get("creators");
    J.each(i, function(e, t) {
        var r = t["creatorType"];
        if (!r) return;
        var o;
        if (t.hasOwnProperty("name")) {
            o = {
                literal: t["name"]
            };
        } else {
            o = {
                family: t["lastName"],
                given: t["firstName"]
            };
        }
        if (cslItem.hasOwnProperty(r)) {
            cslItem[r].push(o);
        } else {
            cslItem[r] = [ o ];
        }
    });
    J.each(e.cslDateMap, function(t, r) {
        var o = e.get(r);
        if (o) {
            cslItem[t] = {
                raw: o
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
        for (var o = 0; o < e; o++) {
            var i = Math.floor(Math.random() * t.length);
            r += t.substring(i, i + 1);
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
        var o = e.length;
        var i = e.toLowerCase();
        r = J.map(t, function(e) {
            if (e.substr(0, o).toLowerCase() == i) {
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
        var o = e.length;
        var i = e.toLowerCase();
        r = J.map(t, function(e) {
            if (e.toLowerCase().indexOf(i) != -1) {
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
        var o = r.getTime() - e.getTime();
        if (o / 6e4 > t) {
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
        var o = r.exec(e);
        if (o === null) {
            Z.error("error parsing api date: " + e);
            return null;
        } else {
            t = new Date(Date.UTC(o[1], o[2] - 1, o[3], o[4], o[5], o[6]));
            return t;
        }
        return t;
    },
    readCookie: function(e) {
        var t = e + "=";
        var r = document.cookie.split(";");
        for (var o = 0; o < r.length; o++) {
            var i = r[o];
            while (i.charAt(0) == " ") i = i.substring(1, i.length);
            if (i.indexOf(t) === 0) return i.substring(t.length, i.length);
        }
        return null;
    },
    compareObs: function(e, t, r) {
        var o = r;
        var i = false;
        var a = [];
        if (r === undefined) {
            o = e;
            i = true;
        }
        J.each(o, function(r, o) {
            var n = o;
            if (i) n = r;
            if (typeof e[r] == "object") {
                if (Zotero.utils.compareObs(e[n], t[n]).length) {
                    a.push(n);
                }
            } else {
                if (e[n] != t[n]) {
                    a.push(n);
                }
            }
        });
        return a;
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
        var o = Zotero.ajax.apiRequestString(r);
        return Zotero.ajaxRequest(o).then(function(e) {
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
        var o = e.find("access");
        o.each(function() {
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
    t += Zotero.config.libraryPathString + "/itemKey/" + e.key;
    return t;
};

Zotero.url.attachmentDownloadLink = function(e) {
    var t = "";
    var r = e.attachmentDownloadUrl;
    var o = e.get("contentType");
    if (e.apiObj.links && e.apiObj.links["enclosure"]) {
        if (!e.apiObj.links["enclosure"]["length"] && e.isSnapshot()) {
            t += '<a href="' + r + '">' + "View Snapshot</a>";
        } else {
            var i = Zotero.utils.translateMimeType(e.apiObj.links["enclosure"].type);
            var a = e.apiObj.links["enclosure"];
            var n = parseInt(a["length"], 10);
            var s = "" + n + " B";
            if (n > 1073741824) {
                s = "" + (n / 1073741824).toFixed(1) + " GB";
            } else if (n > 1048576) {
                s = "" + (n / 1048576).toFixed(1) + " MB";
            } else if (n > 1024) {
                s = "" + (n / 1024).toFixed(1) + " KB";
            }
            Z.debug(i, 3);
            t += '<a href="' + r + '">';
            if (i == "undefined" || i === "" || typeof i == "undefined") {
                t += s + "</a>";
            } else {
                t += i + ", " + s + "</a>";
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

Zotero.url.attachmentFileDetails = function(e) {
    if (!e.apiObj.links["enclosure"]) return "";
    var t = Zotero.utils.translateMimeType(e.apiObj.links["enclosure"].type);
    var r = e.apiObj.links["enclosure"];
    var o = "";
    if (r["length"]) {
        var i = parseInt(r["length"], 10);
        o = "" + i + " B";
        if (i > 1073741824) {
            o = "" + (i / 1073741824).toFixed(1) + " GB";
        } else if (i > 1048576) {
            o = "" + (i / 1048576).toFixed(1) + " MB";
        } else if (i > 1024) {
            o = "" + (i / 1024).toFixed(1) + " KB";
        }
        return "(" + t + ", " + o + ")";
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
    J.each(Zotero.config.exportFormats, function(o, i) {
        r = J.extend(e, {
            format: i
        });
        t[i] = Zotero.ajax.apiRequestUrl(r) + Zotero.ajax.apiQueryString({
            format: i,
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
        var o = {};
        var i = new FileReader();
        i.onload = function(r) {
            Z.debug("Zotero.file.getFileInfo onloadFunc", 3);
            var i = r.target.result;
            Zotero.debug(i, 3);
            o.md5 = SparkMD5.ArrayBuffer.hash(i);
            o.filename = e.name;
            o.filesize = e.size;
            o.mtime = Date.now();
            o.contentType = e.type;
            o.filedata = i;
            t(o);
        };
        i.readAsArrayBuffer(e);
    });
};

Zotero.file.uploadFile = function(e, t) {
    Z.debug("Zotero.file.uploadFile", 3);
    Z.debug(e, 4);
    var r = new FormData();
    J.each(e.params, function(e, t) {
        r.append(e, t);
    });
    var o = new Blob([ t.filedata ], {
        type: t.contentType
    });
    r.append("file", o);
    var i = new XMLHttpRequest();
    i.open("POST", e.url, true);
    return new Promise(function(e, t) {
        i.onload = function(r) {
            Z.debug("uploadFile onload event", 3);
            if (this.status == 201) {
                Z.debug("successful upload - 201", 3);
                e();
            } else {
                Z.error("uploadFile failed - " + i.status);
                t({
                    message: "Failure uploading file.",
                    code: i.status,
                    serverMessage: i.responseText
                });
            }
        };
        i.onprogress = function(e) {
            Z.debug("progress event");
            Z.debug(e);
        };
        i.send(r);
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
        var o = window.indexedDB;
        e.indexedDB = o;
        Z.debug("requesting indexedDb from browser", 3);
        var i;
        var a = o.open("Zotero_" + e.libraryString, 4);
        a.onerror = function(e) {
            Zotero.error("ERROR OPENING INDEXED DB");
            r();
        };
        var n = function(t) {
            Z.debug("Zotero.Idb onupgradeneeded or onsuccess", 3);
            var r = t.oldVersion;
            Z.debug("oldVersion: " + t.oldVersion, 3);
            var o = t.target.result;
            e.db = o;
            if (r < 4) {
                Z.debug("Existing object store names:", 3);
                Z.debug(JSON.stringify(o.objectStoreNames), 3);
                Z.debug("Deleting old object stores", 3);
                if (o.objectStoreNames["items"]) {
                    o.deleteObjectStore("items");
                }
                if (o.objectStoreNames["tags"]) {
                    o.deleteObjectStore("tags");
                }
                if (o.objectStoreNames["collections"]) {
                    o.deleteObjectStore("collections");
                }
                if (o.objectStoreNames["files"]) {
                    o.deleteObjectStore("files");
                }
                if (o.objectStoreNames["versions"]) {
                    o.deleteObjectStore("versions");
                }
                Z.debug("Existing object store names:", 3);
                Z.debug(JSON.stringify(o.objectStoreNames), 3);
                var i = o.createObjectStore("items", {
                    keyPath: "key"
                });
                var a = o.createObjectStore("collections", {
                    keyPath: "key"
                });
                var n = o.createObjectStore("tags", {
                    keyPath: "tag"
                });
                var s = o.createObjectStore("files");
                var l = o.createObjectStore("versions");
                Z.debug("itemStore index names:", 3);
                Z.debug(JSON.stringify(i.indexNames), 3);
                Z.debug("collectionStore index names:", 3);
                Z.debug(JSON.stringify(a.indexNames), 3);
                Z.debug("tagStore index names:", 3);
                Z.debug(JSON.stringify(n.indexNames), 3);
                J.each(Zotero.Item.prototype.fieldMap, function(e, t) {
                    Z.debug("Creating index on " + e, 3);
                    i.createIndex(e, "data." + e, {
                        unique: false
                    });
                });
                i.createIndex("collectionKeys", "data.collections", {
                    unique: false,
                    multiEntry: true
                });
                i.createIndex("itemTagStrings", "_supplement.tagstrings", {
                    unique: false,
                    multiEntry: true
                });
                i.createIndex("parentItemKey", "data.parentItem", {
                    unique: false
                });
                i.createIndex("libraryKey", "libraryKey", {
                    unique: false
                });
                i.createIndex("deleted", "data.deleted", {
                    unique: false
                });
                a.createIndex("name", "data.name", {
                    unique: false
                });
                a.createIndex("key", "key", {
                    unique: false
                });
                a.createIndex("parentCollection", "data.parentCollection", {
                    unique: false
                });
                n.createIndex("tag", "tag", {
                    unique: false
                });
            }
        };
        a.onupgradeneeded = n;
        a.onsuccess = function() {
            Z.debug("IDB success", 3);
            e.db = a.result;
            e.initialized = true;
            t(e);
        };
    });
};

Zotero.Idb.Library.prototype.deleteDB = function() {
    var e = this;
    e.db.close();
    return new Promise(function(t, r) {
        var o = e.indexedDB.deleteDatabase("Zotero_" + e.libraryString);
        o.onerror = function() {
            Z.error("Error deleting indexedDB");
            r();
        };
        o.onsuccess = function() {
            Z.debug("Successfully deleted indexedDB", 2);
            t();
        };
    });
};

Zotero.Idb.Library.prototype.getObjectStore = function(e, t) {
    var r = this;
    var o = r.db.transaction(e, t);
    return o.objectStore(e);
};

Zotero.Idb.Library.prototype.clearObjectStore = function(e) {
    var t = this;
    var r = getObjectStore(e, "readwrite");
    return new Promise(function(e, t) {
        var o = r.clear();
        o.onsuccess = function(t) {
            Z.debug("Store cleared", 3);
            e();
        };
        o.onerror = function(e) {
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
    return new Promise(function(r, o) {
        var i = function(e) {
            r(e.target.result);
        };
        t.db.transaction("items").objectStore([ "items" ], "readonly").get(e).onsuccess = i;
    });
};

Zotero.Idb.Library.prototype.getAllItems = function() {
    return this.getAllObjects("item");
};

Zotero.Idb.Library.prototype.getOrderedItemKeys = function(e, t) {
    var r = this;
    Z.debug("Zotero.Idb.getOrderedItemKeys", 3);
    Z.debug("" + e + " " + t, 3);
    return new Promise(function(o, i) {
        var a = r.db.transaction([ "items" ], "readonly").objectStore("items");
        var n = a.index(e);
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
                o(c);
            }
        }, this);
        l.onfailure = J.proxy(function(e) {
            i();
        }, this);
    });
};

Zotero.Idb.Library.prototype.filterItems = function(e, t) {
    var r = this;
    Z.debug("Zotero.Idb.filterItems " + e + " - " + t, 3);
    return new Promise(function(o, i) {
        var a = [];
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
                a.push(t.primaryKey);
                t.continue();
            } else {
                Z.debug("No more cursor: done. Resolving deferred.", 3);
                o(a);
            }
        }, this);
        d.onfailure = J.proxy(function(e) {
            i();
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
    var o;
    var i;
    switch (e) {
      case "item":
        o = r.db.transaction([ "items" ], t);
        i = o.objectStore("items");
        break;

      case "collection":
        o = r.db.transaction([ "collections" ], t);
        i = o.objectStore("collections");
        break;

      case "tag":
        o = r.db.transaction([ "tags" ], t);
        i = o.objectStore("tags");
        break;

      default:
        return Promise.reject();
    }
    return [ o, i ];
};

Zotero.Idb.Library.prototype.addObjects = function(e, t) {
    Z.debug("Zotero.Idb.Library.addObjects", 3);
    var r = this;
    if (!t) {
        t = r.inferType(e[0]);
    }
    var o = r.getTransactionAndStore(t, "readwrite");
    var i = o[0];
    var a = o[1];
    return new Promise(function(t, r) {
        i.oncomplete = function(e) {
            Zotero.debug("Add Objects transaction completed.", 3);
            t();
        };
        i.onerror = function(e) {
            Zotero.error("Add Objects transaction failed.");
            r();
        };
        var o = function(e) {
            Zotero.debug("Added Object " + e.target.result, 4);
        };
        for (var n in e) {
            var s = a.add(e[n].apiObj);
            s.onsuccess = o;
        }
    });
};

Zotero.Idb.Library.prototype.updateObjects = function(e, t) {
    Z.debug("Zotero.Idb.Library.updateObjects", 3);
    var r = this;
    if (!t) {
        t = r.inferType(e[0]);
    }
    var o = r.getTransactionAndStore(t, "readwrite");
    var i = o[0];
    var a = o[1];
    return new Promise(function(t, r) {
        i.oncomplete = function(e) {
            Zotero.debug("Update Objects transaction completed.", 3);
            t();
        };
        i.onerror = function(e) {
            Zotero.error("Update Objects transaction failed.");
            r();
        };
        var o = function(e) {
            Zotero.debug("Updated Object " + e.target.result, 4);
        };
        for (var n in e) {
            var s = a.put(e[n].apiObj);
            s.onsuccess = o;
        }
    });
};

Zotero.Idb.Library.prototype.removeObjects = function(e, t) {
    var r = this;
    if (!t) {
        t = r.inferType(e[0]);
    }
    var o = r.getTransactionAndStore(t, "readwrite");
    var i = o[0];
    var a = o[1];
    return new Promise(function(t, r) {
        i.oncomplete = function(e) {
            Zotero.debug("Remove Objects transaction completed.", 3);
            t();
        };
        i.onerror = function(e) {
            Zotero.error("Remove Objects transaction failed.");
            r();
        };
        var o = function(e) {
            Zotero.debug("Removed Object " + e.target.result, 4);
        };
        for (var n in collections) {
            var s = a.delete(e[n].key);
            s.onsuccess = o;
        }
    });
};

Zotero.Idb.Library.prototype.getAllObjects = function(e) {
    var t = this;
    if (!e) {
        e = t.inferType(objects[0]);
    }
    return new Promise(function(r, o) {
        var i = [];
        var a = t.db.transaction(e + "s").objectStore(e + "s");
        a.openCursor().onsuccess = function(e) {
            var t = e.target.result;
            if (t) {
                i.push(t.value);
                t.continue();
            } else {
                r(i);
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
    return new Promise(function(r, o) {
        var i = function(e) {
            r(e.target.result);
        };
        t.db.transaction("collections").objectStore([ "collections" ], "readonly").get(e).onsuccess = i;
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
    return new Promise(function(o, i) {
        var a = r.db.transaction([ "versions" ], "readwrite");
        a.oncomplete = function(e) {
            Zotero.debug("set version transaction completed.", 3);
            o();
        };
        a.onerror = function(e) {
            Zotero.error("set version transaction failed.");
            i();
        };
        var n = a.objectStore("versions");
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
    return new Promise(function(r, o) {
        var i = function(e) {
            Z.debug("done getting version");
            r(e.target.result);
        };
        t.db.transaction([ "versions" ], "readonly").objectStore("versions").get(e).onsuccess = i;
    });
};

Zotero.Idb.Library.prototype.setFile = function(e, t) {
    Z.debug("Zotero.Idb.Library.setFile", 3);
    var r = this;
    return new Promise(function(o, i) {
        var a = r.db.transaction([ "files" ], "readwrite");
        a.oncomplete = function(e) {
            Zotero.debug("set file transaction completed.", 3);
            o();
        };
        a.onerror = function(e) {
            Zotero.error("set file transaction failed.");
            i();
        };
        var n = a.objectStore("files");
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
    return new Promise(function(r, o) {
        var i = function(e) {
            Z.debug("done getting file");
            r(e.target.result);
        };
        t.db.transaction([ "files" ], "readonly").objectStore("files").get(e).onsuccess = i;
    });
};

Zotero.Idb.Library.prototype.deleteFile = function(e) {
    Z.debug("Zotero.Idb.Library.deleteFile", 3);
    var t = this;
    return new Promise(function(e, r) {
        var o = t.db.transaction([ "files" ], "readwrite");
        o.oncomplete = function(t) {
            Zotero.debug("delete file transaction completed.", 3);
            e();
        };
        o.onerror = function(e) {
            Zotero.error("delete file transaction failed.");
            r();
        };
        var i = o.objectStore("files");
        var a = function(e) {
            Zotero.debug("Deleted File" + e.target.result, 4);
        };
        var n = i.delete(key);
        n.onsuccess = a;
    });
};

Zotero.Idb.Library.prototype.intersect = function(e, t) {
    var r = this;
    var o = [];
    for (var i = 0; i < e.length; i++) {
        if (t.indexOf(e[i]) !== -1) {
            o.push(e[i]);
        }
    }
    return o;
};

Zotero.Idb.Library.prototype.intersectAll = function(e) {
    var t = this;
    var r = e[0];
    for (var o = 0; o < e.length - 1; o++) {
        r = t.intersect(r, e[o + 1]);
    }
    return r;
};

Zotero.Library.prototype.processLoadedCollections = function(e) {
    Z.debug("processLoadedCollections", 3);
    var t = this;
    Z.debug("adding collections to library.collections");
    var r = t.collections.addCollectionsFromJson(e.data);
    for (var o = 0; o < r.length; o++) {
        r[o].associateWithLibrary(t);
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
    var o = new Zotero.Collection();
    o.associateWithLibrary(r);
    o.set("name", e);
    o.set("parentCollection", t);
    return r.collections.writeCollections([ o ]);
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
    var o = J.extend({}, r, e);
    var i = J.extend({
        target: "items",
        libraryType: t.libraryType,
        libraryID: t.libraryID
    }, o);
    var a = Zotero.ajax.apiRequestString(i);
    return t.ajaxRequest(a).then(function(e) {
        Z.debug("loadItems proxied callback", 3);
        var r = t.items;
        var o = r.addItemsFromJson(e.data);
        for (var i = 0; i < o.length; i++) {
            o[i].associateWithLibrary(t);
        }
        e.loadedItems = o;
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
    var o = J.extend({}, r, e);
    var i = J.extend({
        target: "publications",
        libraryType: t.libraryType,
        libraryID: t.libraryID
    }, o);
    var a = Zotero.ajax.apiRequestString(i);
    return t.ajaxRequest(a).then(function(e) {
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
    var o = r.addItemsFromJson(e.data);
    for (var i = 0; i < o.length; i++) {
        o[i].associateWithLibrary(t);
    }
    t.items.updateSyncState(e.lastModifiedVersion);
    Zotero.trigger("itemsChanged", {
        library: t,
        loadedItems: o
    });
    return e;
};

Zotero.Library.prototype.loadItem = function(e) {
    Z.debug("Zotero.Library.loadItem", 3);
    var t = this;
    if (!r) {
        var r = {};
    }
    var o = {
        target: "item",
        libraryType: t.libraryType,
        libraryID: t.libraryID,
        itemKey: e
    };
    return t.ajaxRequest(o).then(function(e) {
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
    var o = {
        target: "children",
        libraryType: r.libraryType,
        libraryID: r.libraryID,
        itemKey: e
    };
    var i = Zotero.ajax.apiRequestString(o);
    var a = this.items.getItem(e);
    return r.ajaxRequest(i, "POST", {
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
    var o = J.extend({}, r, e);
    var i = J.extend({
        target: "items",
        libraryType: ""
    }, o);
    var a = Zotero.ajax.apiRequestString(i);
    return t.ajaxRequest(a, "GET", {
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
    var o = J.extend({}, r);
    var i = J.extend({
        target: "item",
        libraryType: "",
        itemKey: e
    }, o);
    var a = Zotero.ajax.apiRequestString(i);
    return t.ajaxRequest(a, "GET", {
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
    var o = J.extend({}, r, e);
    var i = J.extend({
        target: "tags",
        libraryType: this.libraryType,
        libraryID: this.libraryID
    }, o);
    return Zotero.ajaxRequest(i);
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
        var o = t.tags.addTagsFromJson(e.data);
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
    var o = J.extend({}, r, e);
    var i = J.extend({}, o);
    var a = Zotero.ajax.apiRequestString(i);
    var n = t.tags;
    var s = J.extend({}, r, n.loadedConfig);
    var l = n.loadedRequestUrl;
    Z.debug("requestUrl: " + a, 4);
    Z.debug("loadedConfigRequestUrl: " + l, 4);
    return new Promise(function(r, o) {
        var n = function(r) {
            Z.debug("loadAllTags continueLoadingCallback", 3);
            var o = Zotero.Tags.prototype.plainTagsList(r.tagsArray);
            o.sort(Zotero.Library.prototype.comparer());
            r.plainList = o;
            if (r.hasNextLink) {
                Z.debug("still has next link.", 3);
                r.tagsArray.sort(Zotero.Tag.prototype.tagComparer());
                o = Zotero.Tags.prototype.plainTagsList(r.tagsArray);
                o.sort(Zotero.Library.prototype.comparer());
                r.plainList = o;
                var i = r.nextLink;
                var s = J.deparam(J.param.querystring(i));
                var l = J.extend({}, e);
                l.start = s.start;
                l.limit = s.limit;
                return t.loadTags(l).then(n);
            } else {
                Z.debug("no next in tags link", 3);
                r.updateSyncedVersion();
                r.tagsArray.sort(Zotero.Tag.prototype.tagComparer());
                o = Zotero.Tags.prototype.plainTagsList(r.tagsArray);
                o.sort(Zotero.Library.prototype.comparer());
                r.plainList = o;
                Z.debug("resolving loadTags deferred", 3);
                t.tagsLoaded = true;
                t.tags.loaded = true;
                r.loadedConfig = e;
                r.loadedRequestUrl = a;
                for (var c = 0; c < t.tags.tagsArray.length; c++) {
                    r.tagsArray[c].apiObj.version = r.tagsVersion;
                }
                t.trigger("tagsChanged", {
                    library: t
                });
                return r;
            }
        };
        r(t.loadTags(i).then(n));
    });
};

Zotero.Library.prototype.loadIndexedDBCache = function() {
    Zotero.debug("Zotero.Library.loadIndexedDBCache", 3);
    var e = this;
    var t = e.idbLibrary.getAllItems();
    var r = e.idbLibrary.getAllCollections();
    var o = e.idbLibrary.getAllTags();
    t.then(function(t) {
        Z.debug("loadIndexedDBCache itemsD done", 3);
        var r = 0;
        for (var o = 0; o < t.length; o++) {
            var i = new Zotero.Item(t[o]);
            e.items.addItem(i);
            if (i.version > r) {
                r = i.version;
            }
        }
        e.items.itemsVersion = r;
        e.items.loaded = true;
        Z.debug("Done loading indexedDB items promise into library", 3);
    });
    r.then(function(t) {
        Z.debug("loadIndexedDBCache collectionsD done", 3);
        var r = 0;
        for (var o = 0; o < t.length; o++) {
            var i = new Zotero.Collection(t[o]);
            e.collections.addCollection(i);
            if (i.version > r) {
                r = i.version;
            }
        }
        e.collections.collectionsVersion = r;
        e.collections.initSecondaryData();
        e.collections.loaded = true;
    });
    o.then(function(t) {
        Z.debug("loadIndexedDBCache tagsD done", 3);
        Z.debug(t);
        var r = 0;
        var o = 0;
        for (var i = 0; i < t.length; i++) {
            var a = new Zotero.Tag(t[i]);
            e.tags.addTag(a);
            if (t[i].version > r) {
                r = t[i].version;
            }
        }
        o = r;
        e.tags.tagsVersion = o;
        e.tags.loaded = true;
    });
    return Promise.all([ t, r, o ]);
};

Zotero.Library.prototype.saveIndexedDB = function() {
    var e = this;
    var t = e.idbLibrary.updateItems(e.items.itemsArray);
    var r = e.idbLibrary.updateCollections(e.collections.collectionsArray);
    var o = e.idbLibrary.updateTags(e.tags.tagsArray);
    return Promise.all([ t, r, o ]);
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
    var o = false;
    var i = false;
    var a = Zotero.config.nonparsedBaseUrl;
    var n = window.location.pathname;
    var s = new RegExp(".*" + a + "/?");
    var l = /^.*\/items\/collections?\/([A-Z0-9]{8})(?:\/[A-Z0-9]{8})?$/;
    var c = /^.*\/items\/([A-Z0-9]{8})$/;
    switch (true) {
      case l.test(n):
        t = l.exec(n);
        o = t[1];
        r = t[2];
        i = true;
        break;

      case c.test(n):
        t = c.exec(n);
        r = t[1];
        i = true;
        break;
    }
    if (o) {
        e.setUrlVar("collectionKey", o);
    }
    if (r) {
        e.setUrlVar("itemKey", r);
    }
    if (i) {
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
        var r = t.pathVars["tag"].filter(function(t, r, o) {
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
            var r = t.pathVars["tag"].filter(function(t, r, o) {
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
        var o = t.pathVars["tag"];
        t.pathVars["tag"] = [ o, e ];
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
    J.each(r, function(t, o) {
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
    var o = Zotero.config.nonparsedBaseUrl;
    var i = [];
    var a = new RegExp(".*" + o + "/?");
    var n = e.replace(a, "");
    i = n.split("/");
    var s = {};
    for (var l = 0; l < i.length - 1; l = l + 2) {
        var c = s[i[l]];
        if (c) {
            if (c instanceof Array) {
                c.push(decodeURIComponent(i[l + 1]));
            } else {
                var d = [ c ];
                d.push(decodeURIComponent(i[l + 1]));
                c = d;
            }
        } else {
            c = decodeURIComponent(i[l + 1]);
        }
        s[i[l]] = c;
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
    var o = r.split("/");
    for (var i = 0; i < o.length - 1; i = i + 2) {
        t[o[i]] = o[i + 1];
    }
    return t;
};

Zotero.State.prototype.buildUrl = function(e, t, r) {
    var o = this;
    if (typeof r === "undefined") {
        r = false;
    }
    if (typeof t === "undefined") {
        t = false;
    }
    var i = Zotero.config.nonparsedBaseUrl + "/";
    var a = [];
    J.each(e, function(e, t) {
        if (!t) {
            return;
        } else if (t instanceof Array) {
            J.each(t, function(t, r) {
                a.push(e + "/" + encodeURIComponent(r));
            });
        } else {
            a.push(e + "/" + encodeURIComponent(t));
        }
    });
    a.sort();
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
    var s = a.join("/");
    var l = "";
    if (n.length) {
        l = "?" + n.join("&");
    }
    var c = i + s + l;
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
    var o = J.extend({}, r.pathVars);
    J.each(e, function(e, t) {
        o[e] = t;
    });
    J.each(t, function(e, t) {
        delete o[t];
    });
    var i = r.buildUrl(o, false);
    return i;
};

Zotero.State.prototype.pushState = function() {
    Z.debug("Zotero.State.pushState", 3);
    var e = this;
    var t = window.history;
    e.prevHref = e.curHref || window.location.href;
    var r = J.extend({}, e.f, e.q, e.pathVars);
    var o = e.pathVars;
    var i = e.q;
    var a = e.buildUrl(o, i, false);
    e.curHref = a;
    Z.debug("about to push url: " + a, 3);
    if (e.useLocation) {
        if (e.replacePush === true) {
            Z.debug("Zotero.State.pushState - replacePush", 3);
            e.replacePush = false;
            t.replaceState(r, document.title, a);
        } else {
            Z.debug("Zotero.State.pushState - pushState", 3);
            t.pushState(r, document.title, a);
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
    var o = e.pathVars;
    var i = e.buildUrl(o, false);
    if (e.useLocation) {
        t.replaceState(r, null, i);
        e.curHref = i;
    } else {
        e.curHref = i;
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
            var o = [ r.q[e], t ];
            r.q[e] = o;
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
    var o = {};
    J.each(r, function(e, r) {
        var i = r + "Changed";
        Z.debug(i, 3);
        if (Zotero.eventful.eventMap.hasOwnProperty(i)) {
            J.each(Zotero.eventful.eventMap[i], function(e, t) {
                if (!o.hasOwnProperty(t)) {
                    o[t] = 1;
                }
            });
        }
        Z.debug("State Filter: " + t.filter, 3);
        Zotero.trigger(i, {}, t.filter);
    });
    J.each(o, function(e, r) {
        Z.debug("State Filter: " + t.filter, 3);
        Zotero.trigger(e, {}, t.filter);
    });
    Z.debug("===== stateChanged Done =====", 3);
};

Zotero.State.prototype.diffState = function(e, t) {
    Z.debug("Zotero.State.diffState", 3);
    var r = this;
    var o = J.extend({}, r.parsePathVars(e));
    var i = J.extend({}, r.parsePathVars(t));
    var a = [ "start", "limit", "order", "sort", "content", "format", "q", "fq", "itemType", "itemKey", "collectionKey", "searchKey", "locale", "tag", "tagType", "key", "style", "session", "newer", "since", "itemPage", "mode" ];
    var n = [];
    J.each(a, function(e, t) {
        if (o.hasOwnProperty(t) || i.hasOwnProperty(t)) {
            if (o[t] != i[t]) {
                n.push(t);
            }
        }
    });
    return n;
};

Zotero.State.prototype.bindTagLinks = function(e) {
    var t = this;
    Z.debug("Zotero.State.bindTagLinks", 3);
    J(e).on("click", "a.tag-link", function(e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        var r = J(this).attr("data-tagtitle");
        t.toggleTag(r);
        t.clearUrlVars([ "tag", "collectionKey" ]);
        t.pushState();
    });
};

Zotero.State.prototype.bindItemLinks = function(e) {
    Z.debug("Zotero.State.bindItemLinks", 3);
    var t = this;
    J(e).on("click", "a.item-select-link", function(e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        Z.debug("item-select-link clicked", 3);
        var r = J(this).data("itemkey");
        t.pathVars.itemKey = r;
        t.pushState();
    });
    J(e).on("click", "td[data-itemkey]:not(.edit-checkbox-td)", function(e) {
        e.preventDefault();
        Z.debug("item-select-td clicked", 3);
        var r = J(this).data("itemkey");
        t.pathVars.itemKey = r;
        t.pushState();
    });
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
        var o = J(r).data("event");
        if (o) {
            Z.debug("binding " + o + " on " + r.tagName, 3);
            J(r).on(o, t);
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
    if (window.Intl) {
        var a = new window.Intl.DateTimeFormat(undefined, o);
        i = a.format;
    } else {
        i = function(e) {
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
            s = i(l);
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
            s = i(l);
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
        if (typeof t.apiObj.data[e] !== "undefined") {
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
    var o = e;
    if (typeof e == "undefined") {
        Z.error("formattedString passed to trimString was undefined.");
        return "";
    }
    if (t) {
        r = t;
    }
    if (r > 0 && o.length > r) {
        return o.slice(0, r) + "…";
    } else {
        return o;
    }
};

Zotero.ui.formatItemDateField = function(e, t) {
    var r;
    var o = {
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: false
    };
    var i = {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: false
    };
    var a;
    var n;
    if (window.Intl) {
        var s = new window.Intl.DateTimeFormat(undefined, i);
        a = s.format;
        var l = new window.Intl.DateTimeFormat(undefined, o);
        n = l.format;
    } else {
        a = function(e) {
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
            return "<span class='localized-date-span'>" + a(r) + "</span> <span class='localized-date-span'>" + n(r) + "</span>";
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
            return "<span class='localized-date-span'>" + a(r) + "</span> <span class='localized-date-span'>" + n(r) + "</span>";
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
    var o = "/groups/" + e.groupID;
    Zotero.debug("groupBase: " + r);
    switch (t) {
      case "groupView":
        return r;

      case "groupLibrary":
        return r + "/items";

      case "groupSettings":
        return o + "/settings";

      case "groupMembers":
        return o + "/members";

      case "groupLibrarySettings":
        return o + "/settings/library";

      case "groupMembersSettings":
        return o + "/settings/members";
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
    var o = {};
    o.toolbarGroups = [ {
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
    var i = {};
    i.toolbarGroups = [ {
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
    var a = {};
    a.toolbarGroups = [];
    a.readOnly = true;
    var n;
    if (e == "nolinks") {
        n = J.extend(true, {}, i);
    } else if (e == "readonly") {
        n = J.extend(true, {}, a);
    } else {
        n = J.extend(true, {}, o);
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
                var o = CKEDITOR.replace(t, n);
            }
        });
    }
};

Zotero.ui.init.tinyMce = function(e, t, r) {
    Z.debug("init.tinyMce", 3);
    if (!e) {
        e = "default";
    }
    var o = "specific_textareas";
    if (r) {
        o = "exact";
    } else {
        r = "";
    }
    var i = {
        mode: o,
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
        i.init_instance_callback = function(e) {
            Z.debug("inited " + e.editorId);
            e.focus();
        };
    }
    if (e != "nolinks") {
        i.theme_advanced_buttons1 += ",link";
    }
    if (e == "nolinks") {
        i.editor_selector = "nolinks";
    }
    if (e == "readonly") {
        i.readonly = 1;
        i.editor_selector = "readonly";
    }
    tinymce.init(i);
    return i;
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

Zotero.ui.updateItemFromForm = function(e, t) {
    Z.debug("Zotero.ui.updateItemFromForm", 3);
    var r = J(t);
    r.closest(".eventfulwidget").data("ignoreformstorage", true);
    var o = Zotero.ui.getAssociatedLibrary(r);
    var i = "";
    if (e.get("key")) i = e.get("key"); else {
        if (o) {
            e.associateWithLibrary(o);
        }
        var a = Zotero.state.getUrlVar("collectionKey");
        if (a) {
            e.addToCollection(a);
        }
    }
    J.each(e.apiObj.data, function(t, o) {
        var a, n, s;
        if (t == "note") {
            a = "textarea[data-itemkey='" + i + "'].rte";
            Z.debug(a, 4);
            s = r.find(a).attr("id");
            Z.debug(s, 4);
            n = Zotero.ui.getRte(s);
        } else {
            a = "[data-itemkey='" + i + "'][name='" + t + "']";
            n = r.find(a).val();
        }
        if (typeof n !== "undefined") {
            Z.debug("updating item " + t + ": " + n);
            e.set(t, n);
        }
    });
    var n = [];
    r.find("tr.creator").each(function(e, t) {
        var r = Zotero.ui.creatorFromElement(t);
        if (r !== null) {
            n.push(r);
        }
    });
    var s = [];
    r.find("input.taginput").each(function(e, t) {
        var r = J(t).val();
        if (r !== "") {
            s.push({
                tag: r
            });
        }
    });
    var l = [];
    r.find("textarea.note-text").each(function(t, r) {
        var i = J(r).attr("id");
        var a = Zotero.ui.getRte(i);
        var n = new Zotero.Item();
        if (o) {
            n.associateWithLibrary(o);
        }
        n.initEmptyNote();
        n.set("note", a);
        n.setParent(e.get("key"));
        l.push(n);
    });
    e.notes = l;
    if (n.length) {
        e.apiObj.data.creators = n;
    }
    e.apiObj.data.tags = s;
    e.synced = false;
    e.dirty = true;
    Z.debug(e);
};

Zotero.ui.creatorFromElement = function(e) {
    var t, r, o, i;
    var a = J(e);
    var n = a.find("select.creator-type-select").val();
    if (a.hasClass("singleCreator")) {
        t = a.find("input.creator-name");
        if (!t.val()) {
            return null;
        }
        r = {
            creatorType: n,
            name: t.val()
        };
    } else if (a.hasClass("doubleCreator")) {
        o = a.find("input.creator-first-name").val();
        i = J(e).find("input.creator-last-name").val();
        if (o === "" && i === "") {
            return null;
        }
        r = {
            creatorType: n,
            firstName: o,
            lastName: i
        };
    }
    return r;
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
    var o = t.tags;
    var i = e.apiObj.data.tags;
    J.each(i, function(e, t) {
        var r = t.tag;
        if (!o.tagObjects.hasOwnProperty(r)) {
            var i = new Zotero.Tag(t);
            o.addTag(i);
        }
    });
    o.updateSecondaryData();
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
    var o;
    if (!r) {
        o = J(e).data("library");
        if (o) {
            r = Zotero.ui.libStringLibrary(o);
        }
        t.data("zoterolibrary", r);
    }
    if (!r) {
        t = J(".zotero-library").first();
        o = t.data("library");
        if (o) {
            r = Zotero.ui.libStringLibrary(o);
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
    var o = Zotero.ui.parseLibString(r);
    library = new Zotero.Library(o.libraryType, o.libraryID, "");
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
    var o = "alert-info";
    if (t) {
        switch (t) {
          case "error":
          case "danger":
            o = "alert-danger";
            r = false;
            break;

          case "success":
          case "confirm":
            o = "alert-success";
            break;

          case "info":
            o = "alert-info";
            break;

          case "warning":
          case "warn":
            o = "alert-warning";
            break;
        }
    }
    if (r) {
        J("#js-message").append("<div class='alert alert-dismissable " + o + "'><button type='button' class='close' data-dismiss='alert'><span aria-hidden='true'>&times;</span><span class='sr-only'>Close</span></button>" + e + "</div>").children("div").delay(parseInt(r, 10) * 1e3).slideUp().delay(300).queue(function() {
            J(this).remove();
        });
    } else {
        J("#js-message").append("<div class='alert alert-dismissable " + o + "'><button type='button' class='close' data-dismiss='alert'><span aria-hidden='true'>&times;</span><span class='sr-only'>Close</span></button>" + e + "</div>");
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
        var o = J(t).width();
        r.push(o);
        J(t).width(o);
    });
    t.find("tbody>tr:first>td").each(function(e, t) {
        J(t).width(r[e]);
    });
    var o = t.find("thead").height();
    t.find("thead").css("position", "fixed").css("margin-top", -o).css("background-color", "white").css("z-index", 10);
    t.find("tbody").css("margin-top", o);
    t.css("margin-top", o);
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

Zotero.ui.widgets.addToCollectionDialog = {};

Zotero.ui.widgets.addToCollectionDialog.init = function(e) {
    Z.debug("addtocollectionsdialog widget init", 3);
    var t = Zotero.ui.getAssociatedLibrary(e);
    t.listen("addToCollectionDialog", Zotero.ui.widgets.addToCollectionDialog.show, {
        widgetEl: e
    });
};

Zotero.ui.widgets.addToCollectionDialog.show = function(e) {
    Z.debug("addToCollectionDialog.show", 3);
    var t = J(e.triggeringElement);
    var r = Zotero.ui.getAssociatedLibrary(t);
    var o = r.collections.nestedOrderingArray();
    var i = J(e.data.widgetEl).empty();
    Z.debug("ncollections:");
    Z.debug(o);
    i.html(J("#addtocollectiondialogTemplate").render({
        ncollections: o
    }));
    var a = i.find(".add-to-collection-dialog");
    var n = function() {
        Z.debug("addToCollection callback", 3);
        var e = a.find(".collectionKey-select").val();
        Z.debug("move to: " + e, 4);
        Zotero.ui.addToCollection(e, r);
        Zotero.ui.closeDialog(a);
        return false;
    };
    a.find(".addButton").on("click", n);
    Zotero.ui.dialog(a, {});
    return false;
};

Zotero.ui.addToCollection = function(e, t) {
    Z.debug("add-to-collection clicked", 3);
    var r = Zotero.state.getSelectedItemKeys();
    if (!e) {
        Zotero.ui.jsNotificationMessage("No collection selected", "error");
        return false;
    }
    if (r.length === 0) {
        Zotero.ui.jsNotificationMessage("No items selected", "notice");
        return false;
    }
    Z.debug(r, 4);
    Z.debug(e, 4);
    t.collections.getCollection(e).addItems(r).then(function(e) {
        t.dirty = true;
        Zotero.ui.jsNotificationMessage("Items added to collection", "success");
    }).catch(Zotero.catchPromiseError);
    return false;
};

Zotero.ui.widgets.breadcrumbs = {};

Zotero.ui.widgets.breadcrumbs.init = function(e) {
    var t = Zotero.ui.getAssociatedLibrary(e);
    t.listen("displayedItemsChanged displayedItemChanged selectedCollectionChanged", Zotero.ui.libraryBreadcrumbs);
};

Zotero.ui.libraryBreadcrumbs = function(e, t) {
    Z.debug("Zotero.ui.libraryBreadcrumbs", 3);
    try {
        var r = [];
        if (!e) {
            e = Zotero.ui.getAssociatedLibrary(J("#feed-link-div"));
        }
        if (!t) {
            t = Zotero.state.getUrlVars();
        }
        if (Zotero.config.breadcrumbsBase) {
            J.each(Zotero.config.breadcrumbsBase, function(e, t) {
                r.push(t);
            });
        } else if (e.libraryType == "user") {
            r = [ {
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
            r = [ {
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
        if (t.collectionKey) {
            Z.debug("have collectionKey", 4);
            curCollection = e.collections.getCollection(t.collectionKey);
            if (curCollection) {
                r.push({
                    label: curCollection.get("name"),
                    path: Zotero.state.buildUrl({
                        collectionKey: t.collectionKey
                    })
                });
            }
        }
        if (t.itemKey) {
            Z.debug("have itemKey", 4);
            r.push({
                label: e.items.getItem(t.itemKey).title,
                path: Zotero.state.buildUrl({
                    collectionKey: t.collectionKey,
                    itemKey: t.itemKey
                })
            });
        }
        Z.debug(r, 4);
        widgetEl = J("#breadcrumbs").empty();
        widgetEl.html(J("#breadcrumbsTemplate").render({
            breadcrumbs: r
        }));
        var o = J("#breadcrumbstitleTemplate", {
            breadcrumbs: r
        }).text();
        if (o) {
            Zotero.state.updateStateTitle(o);
        }
        Z.debug("done with breadcrumbs", 4);
    } catch (i) {
        Zotero.error("Error loading breadcrumbs");
        Zotero.error(i);
    }
};

Zotero.ui.widgets.chooseLibraryDialog = {};

Zotero.ui.widgets.chooseLibraryDialog.init = function(e) {
    Z.debug("chooselibrarydialog widget init", 3);
    var t = Zotero.ui.getAssociatedLibrary(e);
    t.listen("chooseLibrary", Zotero.ui.widgets.chooseLibraryDialog.show, {
        widgetEl: e
    });
};

Zotero.ui.widgets.chooseLibraryDialog.show = function(e) {
    Z.debug("chooseLibraryDialog.show", 3);
    var t = J(e.triggeringElement);
    var r = Zotero.ui.getAssociatedLibrary(t);
    var o = r.collections.nestedOrderingArray();
    var i = J(e.data["widgetEl"]).empty();
    i(J("#addtocollectiondialogTemplate").render({
        ncollections: o
    }));
    var a = i.find(".add-to-collection-dialog");
    var n = J.proxy(function() {
        Z.debug("add-to-collection-select changed", 3);
        var e = a.find(".target-collection").val();
        Z.debug("move to: " + e, 4);
        Zotero.ui.addToCollection(e, r);
        Zotero.ui.closeDialog(a);
        return false;
    }, this);
    a.find(".addButton").on("click", n);
    Zotero.ui.dialog(a, {});
    return false;
};

Zotero.ui.widgets.chooseLibraryDialog.getAccessibleLibraries = function() {};

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
    var o = [];
    var i;
    if (e.hasOwnProperty("zoteroItems")) {
        r = true;
        J.each(e.zoteroItems, function(e, t) {
            var r = t.cslItem();
            o.push(r);
        });
    } else {
        i = Zotero.ui.getAssociatedLibrary(t);
    }
    var a = J(e.data.widgetEl).empty();
    a.html(J("#citeitemdialogTemplate").render({
        freeStyleInput: true
    }));
    var n = a.find(".cite-item-dialog");
    var s = function(t) {
        Z.debug("citeFunction", 3);
        var a = J(e.currentTarget);
        var s = "";
        if (a.is(".cite-item-select, input.free-text-style-input")) {
            s = a.val();
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
            i.loadFullBib(c, s).then(function(e) {
                n.find(".cite-box-div").html(e);
            }).catch(Zotero.catchPromiseError);
        } else {
            Zotero.ui.widgets.citeItemDialog.directCite(o, s).then(function(e) {
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
    var o = Zotero.config.citationEndpoint + "?linkwrap=1&style=" + t;
    return J.post(o, JSON.stringify(r));
};

Zotero.ui.widgets.citeItemDialog.buildBibString = function(e) {
    var t = e.bibliography[0];
    var r = e.bibliography[1];
    var o = t.bibstart;
    for (var i = 0; i < r.length; i++) {
        o += r[i];
    }
    o += t.bibend;
    return o;
};

Zotero.ui.widgets.collections = {};

Zotero.ui.widgets.collections.init = function(e) {
    Z.debug("collections widget init", 3);
    var t = Zotero.ui.getAssociatedLibrary(e);
    t.listen("collectionsDirty", Zotero.ui.widgets.collections.syncCollections, {
        widgetEl: e
    });
    t.listen("syncCollections", Zotero.ui.widgets.collections.syncCollections, {
        widgetEl: e
    });
    t.listen("syncLibrary", Zotero.ui.widgets.collections.syncCollections, {
        widgetEl: e
    });
    t.listen("cachedDataLoaded", Zotero.ui.widgets.collections.syncCollections, {
        widgetEl: e
    });
    t.listen("libraryCollectionsUpdated", Zotero.ui.widgets.collections.rerenderCollections, {
        widgetEl: e
    });
    t.listen("selectCollection", Zotero.ui.widgets.collections.selectCollection, {
        widgetEl: e
    });
    t.listen("selectedCollectionChanged", Zotero.ui.widgets.collections.updateSelectedCollection, {
        widgetEl: e
    });
    Zotero.ui.widgets.collections.bindCollectionLinks(e);
};

Zotero.ui.widgets.collections.syncCollections = function(e) {
    Zotero.debug("Zotero eventful syncCollectionsCallback", 3);
    var t = J(e.data.widgetEl);
    Zotero.ui.showSpinner(J(t).find("#collection-list-container"));
    var r = t.data("loadingPromise");
    if (r) {
        var o = t.data("loadingPromise");
        return o.then(function() {
            return Zotero.ui.widgets.collections.syncCollections(e);
        });
    }
    var i = Zotero.ui.getAssociatedLibrary(t);
    return i.loadUpdatedCollections().then(function() {
        i.trigger("libraryCollectionsUpdated");
    }, function(e) {
        Z.error("Error syncing collections");
        Z.error(e);
        i.trigger("libraryCollectionsUpdated");
        Zotero.ui.jsNotificationMessage("Error loading collections. Collections list may not be up to date", "error");
    }).then(function() {
        t.removeData("loadingPromise");
    });
};

Zotero.ui.widgets.collections.rerenderCollections = function(e) {
    Zotero.debug("Zotero.ui.widgets.collections.rerenderCollections", 3);
    var t = J(e.data.widgetEl);
    var r = Zotero.ui.getAssociatedLibrary(t);
    var o = t.find("#collection-list-container");
    o.empty();
    Zotero.ui.widgets.collections.renderCollectionList(o, r.collections);
    Z.debug("done rendering collections");
    r.trigger("selectedCollectionChanged");
};

Zotero.ui.widgets.collections.selectCollection = function(e) {};

Zotero.ui.widgets.collections.updateSelectedCollection = function(e) {
    Zotero.debug("Zotero eventful updateSelectedCollection", 3);
    var t = J(e.data.widgetEl);
    var r = t.find(".collection-list-container");
    Zotero.ui.widgets.collections.highlightCurrentCollection(t);
    Zotero.ui.widgets.collections.nestHideCollectionTree(r);
    Zotero.ui.widgets.collections.updateCollectionButtons(t);
    return;
};

Zotero.ui.widgets.collections.updateCollectionButtons = function(e) {
    if (!e) {
        e = J("body");
    }
    var t = J(e);
    if (!Zotero.config.librarySettings.allowEdit) {
        J(".permission-edit").hide();
        t.find(".create-collection-button").addClass("disabled");
        t.find(".update-collection-button").addClass("disabled");
        t.find(".delete-collection-button").addClass("disabled");
        return;
    }
    if (Zotero.state.getUrlVar("collectionKey")) {
        t.find(".update-collection-button").removeClass("disabled");
        t.find(".delete-collection-button").removeClass("disabled");
    } else {
        t.find(".update-collection-button").addClass("disabled");
        t.find(".delete-collection-button").addClass("disabled");
    }
};

Zotero.ui.widgets.collections.renderCollectionList = function(e, t) {
    Z.debug("Zotero.ui.renderCollectionList", 3);
    var r = J(e);
    var o = Zotero.state.getUrlVar("collectionKey") || "";
    var i = t.owningLibrary.libraryType == "user" ? true : false;
    r.append(J("#collectionlistTemplate").render({
        collections: t.collectionsArray,
        libUrlIdentifier: t.libraryUrlIdentifier,
        currentCollectionKey: o,
        trash: i
    }));
};

Zotero.ui.widgets.collections.bindCollectionLinks = function(e) {
    Z.debug("Zotero.ui.bindCollectionLinks", 3);
    var t = Zotero.ui.getAssociatedLibrary(e);
    J(e).on("click", "div.folder-toggle", function(e) {
        e.preventDefault();
        J(this).siblings(".collection-select-link").click();
        return false;
    });
    J(e).on("click", ".collection-select-link", function(e) {
        Z.debug("collection-select-link clicked", 4);
        e.preventDefault();
        var r = J(this).attr("data-collectionkey");
        if (J(this).hasClass("current-collection")) {
            var o = J(".current-collection").data("expanded");
            if (o === true) {
                Zotero.ui.widgets.collections.nestHideCollectionTree(J("#collection-list-container"), false);
            } else {
                Zotero.ui.widgets.collections.nestHideCollectionTree(J("#collection-list-container"), true);
            }
            Zotero.state.clearUrlVars([ "collectionKey", "mode" ]);
            return false;
        }
        t.trigger("selectCollection", {
            collectionKey: r
        });
        Z.debug("click " + r, 4);
        Zotero.state.clearUrlVars([ "mode" ]);
        Zotero.state.pathVars["collectionKey"] = r;
        Zotero.state.pushState();
        return false;
    });
    J(e).on("click", "a.my-library", function(e) {
        e.preventDefault();
        Zotero.state.clearUrlVars([ "mode" ]);
        Zotero.state.pushState();
        return false;
    });
};

Zotero.ui.widgets.collections.nestHideCollectionTree = function(e, t) {
    Z.debug("nestHideCollectionTree", 3);
    if (typeof t == "undefined") {
        t = true;
    }
    var r = J(e);
    r.find("#collection-list ul").hide().siblings(".folder-toggle").children(".placeholder").addClass("glyphicon").addClass("glyphicon-chevron-right");
    r.find(".current-collection").parents("ul").show();
    r.find("#collection-list li.current-collection").children("ul").show();
    r.find(".glyphicon-chevron-down").removeClass("glyphicon-chevron-down").addClass("glyphicon-chevron-right");
    r.find("li.current-collection").parentsUntil("#collection-list").children("div.folder-toggle").find(".glyphicon-chevron-right").removeClass("glyphicon-chevron-right").addClass("glyphicon-chevron-down");
    if (t === false) {
        r.find("#collection-list li.current-collection").children("ul").hide();
        r.find("#collection-list li.current-collection").find(".glyphicon-chevron-down").removeClass("glyphicon-chevron-down").addClass("glyphicon-chevron-right");
        r.find(".current-collection").data("expanded", false);
    } else {
        r.find("li.current-collection").children("div.folder-toggle").find(".glyphicon-chevron-right").removeClass("glyphicon-chevron-right").addClass("glyphicon-chevron-down");
        r.find(".current-collection").data("expanded", true);
    }
};

Zotero.ui.widgets.collections.highlightCurrentCollection = function(e) {
    Z.debug("Zotero.ui.widgets.collections.highlightCurrentCollection", 3);
    if (!e) {
        e = J("body");
    }
    e = J(e);
    var t = Zotero.state.getUrlVar("collectionKey");
    e.find("a.current-collection").closest("li").removeClass("current-collection");
    e.find("a.current-collection").removeClass("current-collection");
    if (t) {
        e.find("a[data-collectionKey='" + t + "']").addClass("current-collection");
        e.find("a[data-collectionKey='" + t + "']").closest("li").addClass("current-collection");
    } else {
        e.find("a.my-library").addClass("current-collection");
        e.find("a.my-library").closest("li").addClass("current-collection");
    }
};

Zotero.ui.widgets.controlPanel = {};

Zotero.ui.widgets.controlPanel.init = function(e) {
    Z.debug("Zotero.eventful.init.controlPanel", 3);
    var t = Zotero.ui.getAssociatedLibrary(e);
    Zotero.ui.showControlPanel(e);
    t.listen("selectedItemsChanged", Zotero.ui.widgets.controlPanel.selectedItemsChanged, {
        widgetEl: e
    });
    t.listen("selectedCollectionChanged", Zotero.ui.widgets.controlPanel.selectedItemsChanged, {
        widgetEl: e
    });
    t.listen("removeFromCollection", Zotero.ui.widgets.controlPanel.removeFromCollection, {
        widgetEl: e
    });
    t.listen("moveToTrash", Zotero.ui.widgets.controlPanel.moveToTrash, {
        widgetEl: e
    });
    t.listen("removeFromTrash", Zotero.ui.widgets.controlPanel.removeFromTrash, {
        widgetEl: e
    });
    t.listen("toggleEdit", Zotero.ui.widgets.controlPanel.toggleEdit, {
        widgetEl: e
    });
    var r = J(e);
    Zotero.ui.widgets.controlPanel.updateDisabledControlButtons();
    if (Zotero.state.getUrlVar("mode") == "edit") {
        r.find("button.toggle-edit-button").addClass("active");
    }
};

Zotero.ui.widgets.controlPanel.contextChanged = function(e) {
    Zotero.ui.widgets.controlPanel.updateDisabledControlButtons();
};

Zotero.ui.widgets.controlPanel.selectedItemsChanged = function(e) {
    Z.debug("Zotero.ui.widgets.controlPanel.selectedItemsChanged", 3);
    var t = e.selectedItemKeys;
    if (!t) {
        t = [];
    }
    Zotero.ui.widgets.controlPanel.updateDisabledControlButtons(t);
};

Zotero.ui.widgets.controlPanel.updateDisabledControlButtons = function(e) {
    Z.debug("Zotero.ui.widgets.controlPanel.updateDisabledControlButtons", 3);
    if (!e) {
        e = [];
    }
    J("ul.actions-menu li").show().removeClass("disabled");
    J(".create-item-button").removeClass("disabled");
    if (e.length === 0 && !Zotero.state.getUrlVar("itemKey")) {
        J(".selected-item-action").hide();
    } else {}
    if (!Zotero.state.getUrlVar("collectionKey")) {
        J(".selected-collection-action").hide();
    }
    if (Zotero.state.getUrlVar("collectionKey") == "trash") {
        J(".selected-collection-action").hide();
        J(".move-to-trash-button").hide();
        J(".create-item-button").addClass("disabled");
    }
    if (Zotero.state.getUrlVar("collectionKey") != "trash") {
        J(".permanently-delete-button").closest("li").hide();
        J(".remove-from-trash-button").closest("li").hide();
    }
};

Zotero.ui.widgets.controlPanel.toggleEdit = function(e) {
    Z.debug("edit checkbox toggled", 3);
    var t = Zotero.state.getUrlVar("mode");
    if (t != "edit") {
        Zotero.state.pathVars["mode"] = "edit";
    } else {
        delete Zotero.state.pathVars["mode"];
    }
    Zotero.state.pushState();
    return false;
};

Zotero.ui.widgets.controlPanel.createItem = function(e) {
    Z.debug("create-item-Link clicked", 3);
    var t = Zotero.state.getUrlVar("collectionKey");
    if (t) {
        Zotero.state.pathVars = {
            action: "newItem",
            mode: "edit",
            collectionKey: t
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

Zotero.ui.widgets.controlPanel.moveToTrash = function(e) {
    e.preventDefault();
    Z.debug("move-to-trash clicked", 3);
    var t = Zotero.state.getSelectedItemKeys();
    Z.debug(t, 3);
    var r = J(e.triggeringElement);
    var o = Zotero.ui.getAssociatedLibrary(r);
    var i;
    var a = o.items.getItems(t);
    var n = [];
    Zotero.ui.showSpinner(J("#library-items-div"));
    Z.debug("trashingItems:");
    Z.debug(a);
    if (Zotero.state.getUrlVar("collectionKey") == "trash") {
        var s;
        for (s = 0; s < a.length; s++) {
            var l = a[s];
            if (l.get("deleted")) {
                n.push(l);
            }
        }
        i = o.items.deleteItems(n);
    } else {
        i = o.items.trashItems(a);
    }
    o.dirty = true;
    i.catch(function() {
        Z.error("Error trashing items");
    }).then(function() {
        Zotero.state.clearUrlVars([ "collectionKey", "tag", "q" ]);
        Zotero.state.pushState(true);
        o.trigger("displayedItemsChanged");
    }).catch(Zotero.catchPromiseError);
    return false;
};

Zotero.ui.widgets.controlPanel.removeFromTrash = function(e) {
    Z.debug("remove-from-trash clicked", 3);
    var t = J(e.data.widgetEl);
    var r = Zotero.state.getSelectedItemKeys();
    Z.debug(r, 4);
    var o = J(e.triggeringElement);
    var i = Zotero.ui.getAssociatedLibrary(o);
    var a = i.items.getItems(r);
    Zotero.ui.showSpinner(J("#library-items-div"));
    var n = i.items.untrashItems(a);
    i.dirty = true;
    n.catch(function() {}).then(function() {
        Z.debug("post-removeFromTrash always execute: clearUrlVars", 3);
        Zotero.state.clearUrlVars([ "collectionKey", "tag", "q" ]);
        Zotero.state.pushState();
        i.trigger("displayedItemsChanged");
    }).catch(Zotero.catchPromiseError);
    return false;
};

Zotero.ui.widgets.controlPanel.removeFromCollection = function(e) {
    Z.debug("remove-from-collection clicked", 3);
    var t = J(e.triggeringElement);
    var r = Zotero.ui.getAssociatedLibrary(t);
    var o = Zotero.state.getSelectedItemKeys();
    var i = Zotero.state.getUrlVar("collectionKey");
    var a = [];
    var n = [];
    J.each(o, function(e, t) {
        var o = r.items.getItem(t);
        o.removeFromCollection(i);
        a.push(o);
    });
    r.dirty = true;
    r.items.writeItems(a).then(function() {
        Z.debug("removal responses finished. forcing reload", 3);
        Zotero.state.clearUrlVars([ "collectionKey", "tag" ]);
        Zotero.state.pushState(true);
        r.trigger("displayedItemsChanged");
    }).catch(Zotero.catchPromiseError);
    return false;
};

Zotero.ui.showControlPanel = function(e) {
    Z.debug("Zotero.ui.showControlPanel", 3);
    var t = J(e);
    var r = Zotero.state.getUrlVar("mode") || "view";
    if (!Zotero.config.librarySettings.allowEdit) {
        J(".permission-edit").hide();
    }
};

Zotero.ui.widgets.createCollectionDialog = {};

Zotero.ui.widgets.createCollectionDialog.init = function(e) {
    Z.debug("createcollectionsdialog widget init", 3);
    var t = Zotero.ui.getAssociatedLibrary(e);
    t.listen("createCollectionDialog", Zotero.ui.widgets.createCollectionDialog.show, {
        widgetEl: e
    });
};

Zotero.ui.widgets.createCollectionDialog.show = function(e) {
    Z.debug("createCollectionDialog.show", 3);
    var t = J(e.triggeringElement);
    var r = Zotero.ui.getAssociatedLibrary(t);
    var o = r.collections.nestedOrderingArray();
    var i = J(e.data.widgetEl).empty();
    i.html(J("#createcollectiondialogTemplate").render({
        ncollections: o
    }));
    var a = i.find(".create-collection-dialog");
    var n = Zotero.state.getUrlVar("collectionKey");
    a.find(".new-collection-parent").val(n);
    var s = function() {
        var e = new Zotero.Collection();
        var t = a.find(".new-collection-parent").val();
        var o = a.find("input.new-collection-title-input").val() || "Untitled";
        r.addCollection(o, t).then(function(e) {
            r.collections.initSecondaryData();
            r.trigger("libraryCollectionsUpdated");
            Zotero.state.pushState();
            Zotero.ui.closeDialog(i.find(".create-collection-dialog"));
            Zotero.ui.jsNotificationMessage("Collection Created", "success");
        }).catch(function(e) {
            Zotero.ui.jsNotificationMessage("There was an error creating the collection.", "error");
            Zotero.ui.closeDialog(i.find(".create-collection-dialog"));
        });
    };
    a.find(".createButton").on("click", s);
    Zotero.ui.dialog(a, {});
};

Zotero.ui.widgets.deleteCollectionDialog = {};

Zotero.ui.widgets.deleteCollectionDialog.init = function(e) {
    Z.debug("deletecollectionsdialog widget init", 3);
    var t = Zotero.ui.getAssociatedLibrary(e);
    t.listen("deleteCollectionDialog", Zotero.ui.widgets.deleteCollectionDialog.show, {
        widgetEl: e
    });
};

Zotero.ui.widgets.deleteCollectionDialog.show = function(e) {
    Z.debug("deleteCollectionDialog.show", 3);
    var t = J(e.triggeringElement);
    var r = Zotero.ui.getAssociatedLibrary(t);
    var o = Zotero.state.getUrlVar("collectionKey");
    var i = r.collections.getCollection(o);
    var a = J(e.data.widgetEl).empty();
    a.html(J("#deletecollectiondialogTemplate").render({
        collection: i
    }));
    var n = a.find(".delete-collection-dialog");
    var s = J.proxy(function() {
        Z.debug("Zotero.ui.deleteSelectedCollection", 3);
        var e = i;
        if (!e) {
            Zotero.ui.jsNotificationMessage("Selected collection not found", "error");
            return false;
        }
        e.remove().then(function() {
            delete Zotero.state.pathVars["collectionKey"];
            r.collections.dirty = true;
            r.collections.initSecondaryData();
            Zotero.state.pushState();
            Zotero.ui.jsNotificationMessage(e.get("title") + " removed", "confirm");
            Zotero.ui.closeDialog(n);
        }).catch(Zotero.catchPromiseError);
        return false;
    }, this);
    n.find(".deleteButton").on("click", s);
    Zotero.ui.dialog(n, {});
    return false;
};

Zotero.ui.widgets.createItemDialog = {};

Zotero.ui.widgets.createItemDialog.init = function(e) {
    Z.debug("createItemDialog widget init", 3);
    var t = Zotero.ui.getAssociatedLibrary(e);
    t.listen("newItem", Zotero.ui.widgets.createItemDialog.show, {
        widgetEl: e
    });
};

Zotero.ui.widgets.createItemDialog.show = function(e) {
    Z.debug("createItemDialog.show", 3);
    var t = J(e.triggeringElement);
    var r = Zotero.ui.getAssociatedLibrary(t);
    var o = J(e.data.widgetEl).empty();
    var i = t.data("itemtype");
    var a = Zotero.state.getUrlVar("collectionKey");
    o.html(J("#createitemdialogTemplate").render({}));
    var n = o.find(".create-item-dialog");
    var s = function() {
        var e = new Zotero.Item();
        e.initEmpty(i).then(function() {
            e.associateWithLibrary(r);
            var t = n.find("input.new-item-title-input").val() || "Untitled";
            e.set("title", t);
            if (a) {
                e.addToCollection(a);
            }
            return Zotero.ui.saveItem(e);
        }).then(function(t) {
            var r = e.get("key");
            Zotero.state.setUrlVar("itemKey", r);
            Zotero.state.pushState();
            Zotero.ui.closeDialog(o.find(".create-item-dialog"));
        }).catch(function(e) {
            Zotero.error(e);
            Zotero.ui.jsNotificationMessage("There was an error creating the item.", "error");
            Zotero.ui.closeDialog(o.find(".create-item-dialog"));
        });
    };
    n.find(".createButton").on("click", s);
    Zotero.ui.dialog(n, {});
};

Zotero.ui.widgets.exportItemsDialog = {};

Zotero.ui.widgets.exportItemsDialog.init = function(e) {
    Z.debug("exportItemDialog widget init", 3);
    var t = Zotero.ui.getAssociatedLibrary(e);
    t.listen("exportItemsDialog", Zotero.ui.widgets.exportItemsDialog.show, {
        widgetEl: e
    });
    t.listen("displayedItemsChanged", Zotero.ui.widgets.exportItemsDialog.updateExportLinks, {
        widgetEl: e
    });
    Zotero.ui.widgets.exportItemsDialog.updateExportLinks({
        data: {
            widgetEl: e
        }
    });
};

Zotero.ui.widgets.exportItemsDialog.show = function(e) {
    Z.debug("exportitemdialog.show", 3);
    var t = J(e.triggeringElement);
    var r = Zotero.ui.getAssociatedLibrary(t);
    var o = J(e.data.widgetEl).empty();
    o.html(J("#exportitemsdialogTemplate").render({}));
    var i = o.find(".export-items-dialog");
    i.find(".modal-body").empty().append(J(".export-list").contents().clone());
    Zotero.ui.dialog(i, {});
    return false;
};

Zotero.ui.widgets.exportItemsDialog.updateExportLinks = function(e) {
    Z.debug("exportItemsDialog.updateExportLinks", 3);
    var t = J(e.data["widgetEl"]);
    var r = Zotero.ui.getAssociatedLibrary(t);
    var o = Zotero.ui.getItemsConfig(r);
    var i = Zotero.url.exportUrls(o);
    J(".export-list").empty().append(J("#exportformatsTemplate").render({
        exportUrls: i,
        exportFormatsMap: Zotero.config.exportFormatsMap
    }));
    J(".export-list").hide();
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
    var o = Zotero.ui.getItemsConfig(r);
    var i = Zotero.ajax.apiRequestUrl(o) + Zotero.ajax.apiQueryString(o, false);
    var a = i.replace(Zotero.config.baseApiUrl, Zotero.config.baseFeedUrl);
    var n = Zotero.url.requestReadApiKeyUrl(r.libraryType, r.libraryID, a);
    t.data("urlconfig", o);
    if (!Zotero.config.librarySettings.publish) {
        J(".feed-link").attr("href", n);
    } else {
        J(".feed-link").attr("href", a);
    }
    J("#library link[rel='alternate']").attr("href", a);
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
            var o = Zotero.config.loggedInUserID;
            var i = false;
            var a = 1;
            if (t.apiObj.data.members) {
                a += t.apiObj.data.members.length;
            }
            if (t.apiObj.data.admins) {
                a += t.apiObj.data.admins.length;
            }
            if (o && (o == t.apiObj.data.owner || J.inArray(o, t.apiObj.data.admins) != -1)) {
                i = true;
            }
            var n = {
                group: t,
                groupViewUrl: Zotero.url.groupViewUrl(t),
                groupLibraryUrl: Zotero.url.groupLibraryUrl(t),
                groupSettingsUrl: Zotero.url.groupSettingsUrl(t),
                groupLibrarySettingsUrl: Zotero.url.groupLibrarySettingsUrl(t),
                groupMemberSettingsUrl: Zotero.url.groupMemberSettingsUrl(t),
                memberCount: a,
                groupManageable: i
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
    var o = r.groups.fetchUserGroups(r.libraryID).then(function(e) {
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
    var o = [];
    J.each(t, function(e, t) {
        Z.debug(t.title);
        var r = Zotero.config.loggedInUserID;
        var i = false;
        if (r && (r == t.apiObj.owner || J.inArray(r, t.apiObj.admins) != -1)) {
            Z.debug("manage group");
            o.push(t);
        }
    });
    var i = {
        groups: o
    };
    Z.debug("rendering form");
    r.append(J("#inviteuserformTemplate").render(i));
    Z.debug("binding on form");
    r.find("form.inviteuserform").on("submit", function(e) {
        Z.debug("inviteUserForm submitted");
        e.preventDefault();
        var t = J(e.target);
        Z.debug(t);
        var r = t.find("#groupID").val();
        var o = t.find("option.selected").html();
        Z.debug(r);
        Z.debug("posting invitation request");
        J.post("/groups/inviteuser", {
            ajax: true,
            groupID: r,
            userID: zoteroData.profileUserID
        }, function(e) {
            Z.debug("got response from inviteuser");
            Zotero.ui.jsNotificationMessage("User has been invited to join " + o, "success");
            if (e == "true") {
                Zotero.ui.jsNotificationMessage("User has been invited to join " + o, "success");
            }
        }, "text");
    });
};

Zotero.ui.widgets.item = {};

Zotero.ui.widgets.item.init = function(e) {
    var t = Zotero.ui.getAssociatedLibrary(e);
    t.listen("displayedItemChanged modeChanged", Zotero.ui.widgets.item.loadItem, {
        widgetEl: e
    });
    t.listen("itemTypeChanged", Zotero.ui.widgets.item.itemTypeChanged, {
        widgetEl: e
    });
    t.listen("uploadSuccessful", Zotero.ui.widgets.item.refreshChildren, {
        widgetEl: e
    });
    t.listen("addTag", Zotero.ui.widgets.item.addTag, {
        widgetEl: e
    });
    t.listen("removeTag", Zotero.ui.widgets.item.removeTag, {
        widgetEl: e
    });
    t.listen("addCreator", Zotero.ui.widgets.item.addCreator, {
        widgetEl: e
    });
    t.listen("removeCreator", Zotero.ui.widgets.item.removeCreator, {
        widgetEl: e
    });
    t.listen("switchCreatorFields", Zotero.ui.widgets.item.switchCreatorFields, {
        widgetEl: e
    });
    t.listen("addNote", Zotero.ui.widgets.item.addNote, {
        widgetEl: e
    });
    t.listen("tagsChanged", Zotero.ui.widgets.item.updateTypeahead, {
        widgetEl: e
    });
    t.listen("showChildren", Zotero.ui.widgets.item.refreshChildren, {
        widgetEl: e
    });
    t.listen("edit-item-field edit-creator-field", Zotero.ui.widgets.item.clickToEdit, {
        widgetEl: e
    });
    t.listen("edit-item-tag", Zotero.ui.widgets.item.clickToEdit, {
        widgetEl: e
    });
    var r = J(e);
    Zotero.state.bindTagLinks(r);
    Zotero.state.bindItemLinks(r);
    r.on("keydown", "input#add-tag-input", function(e) {
        Z.debug("add-tag-input keydown");
        e.stopImmediatePropagation();
        if (e.keyCode === Zotero.ui.keyCode.ENTER) {
            var o = J(this);
            var i = o.data("itemkey");
            var a = t.items.getItem(i);
            var n = o.val();
            var s = a.get("tags");
            s.push({
                tag: n
            });
            Zotero.ui.saveItem(a);
            r.find("div.item-tags-list").append(J("#taglistitemTemplate").render({
                tag: n
            }, {
                item: a,
                key: "tag",
                value: n,
                itemKey: i,
                libraryString: t.libraryString,
                tagIndex: s.length - 1
            }));
            r.find("span.tag-count").html(s.length);
            o.val("");
            Zotero.eventful.initTriggers(r);
        }
    });
    r.on("keydown", ".item-field-control", function(e) {
        e.stopImmediatePropagation();
        if (e.keyCode === Zotero.ui.keyCode.ENTER) {
            J(this).blur();
        }
    });
    r.on("blur", ".item-field-control", function(e) {
        Z.debug("blurred");
        var o = J(this);
        var i = o.data("itemkey");
        var a = t.items.getItem(i);
        var n = o.attr("name");
        var s = o.val();
        var l = o.data("creatorindex");
        var c = o.data("tagindex");
        Z.debug(n);
        Z.debug(s);
        var d = {
            item: a,
            key: n,
            value: s,
            itemKey: i,
            libraryString: t.libraryString,
            creatorIndex: l,
            tagIndex: c
        };
        if ([ "name", "firstName", "lastName", "creatorType" ].indexOf(n) != -1) {
            o.replaceWith(J("#datafieldspanTemplate").render(d));
            var u = J("tr.creator-row[data-creatorindex='" + l + "']");
            var g = Zotero.ui.widgets.item.creatorFromRow(u);
            Zotero.ui.widgets.item.updateItemCreatorField(t, i, g, l);
        } else if (n == "tag") {
            var p = a.get("tags");
            if (p[c]) {
                p[c].tag = s;
            } else {
                p[c] = {
                    tag: s
                };
            }
            Zotero.ui.saveItem(a);
            o.typeahead("destroy");
            o.replaceWith(J("#datafieldspanTemplate").render(d));
        } else {
            Zotero.ui.widgets.item.updateItemField(t, i, n, s);
            o.replaceWith(J("#datafieldspanTemplate").render(d));
        }
        Zotero.eventful.initTriggers(r);
    });
    t.trigger("displayedItemChanged");
};

Zotero.ui.widgets.item.loadItem = function(e) {
    Z.debug("Zotero eventful loadItem", 3);
    var t = J(e.data.widgetEl);
    var r = t.find("#item-info-panel");
    var o = J(e.triggeringElement);
    var i;
    Zotero.ui.cleanUpRte(t);
    var a = Zotero.ui.getAssociatedLibrary(t);
    r.empty();
    Zotero.ui.showSpinner(r);
    var n = Zotero.state.getUrlVar("itemKey");
    if (!n) {
        Z.debug("No itemKey - " + n, 3);
        r.empty();
        Zotero.ui.widgets.item.displayStats(a, t);
        return Promise.reject(new Error("No itemkey - " + n));
    }
    var s = a.items.getItem(n);
    if (s) {
        Z.debug("have item locally, loading details into ui", 3);
        i = Promise.resolve(s);
    } else {
        Z.debug("must fetch item from server", 3);
        var l = {
            target: "item",
            libraryType: a.type,
            libraryID: a.libraryID,
            itemKey: n
        };
        i = a.loadItem(n);
    }
    i.then(function(e) {
        s = e;
    }).then(function() {
        return s.getCreatorTypes(s.get("itemType"));
    }).then(function(e) {
        r.empty();
        Zotero.ui.widgets.item.loadItemDetail(s, t);
        a.trigger("showChildren");
        Zotero.eventful.initTriggers(t);
    });
    i.catch(function(e) {
        Z.error("loadItem promise failed");
        Z.error(e);
    }).then(function() {
        t.removeData("loadingPromise");
    }).catch(Zotero.catchPromiseError);
    t.data("loadingPromise", i);
    return i;
};

Zotero.ui.widgets.item.addCreator = function(e) {
    Z.debug("widgets.item.addCreator", 3);
    var t = J(e.triggeringElement);
    var r = J(e.data.widgetEl);
    var o = Zotero.ui.getAssociatedLibrary(e.data.widgetEl);
    var i = t.data("itemkey");
    var a = o.items.getItem(i);
    var n = a.get("creators").length;
    r.find("tr.creator-row").last().after(J("#creatorrowTemplate").render({}, {
        creatorIndex: n,
        libraryString: o.libraryString,
        item: a
    }));
    Zotero.eventful.initTriggers(r);
};

Zotero.ui.widgets.item.removeCreator = function(e) {
    Z.debug("widgets.item.removeCreator", 3);
    var t = J(e.triggeringElement);
    var r = J(e.data.widgetEl);
    var o = Zotero.ui.getAssociatedLibrary(e.data.widgetEl);
    var i = t.data("itemkey");
    var a = o.items.getItem(i);
    var n = t.data("creatorindex");
    var s = a.get("creators");
    s.splice(n, 1);
    Zotero.ui.saveItem(a);
    var l = r.find("tr.creator-row");
    var c = l.length;
    for (var d = 0; d < s.length; d++) {
        r.find("tr.creator-row").last().after(J("#creatorrowTemplate").render(s[d], {
            creatorIndex: d,
            libraryString: o.libraryString,
            item: a
        }));
    }
    l.remove();
    Zotero.eventful.initTriggers(r);
};

Zotero.ui.widgets.item.addNote = function(e) {
    Z.debug("Zotero.ui.addNote", 3);
    var t = J(e.currentTarget);
    var r = t.closest("form");
    var o = 0;
    var i = r.find("textarea.note-text:last").data("noteindex");
    if (i) {
        o = parseInt(i, 10);
    }
    var a = o + 1;
    var n = "note_" + a;
    var s;
    s = r.find("td.notes button.add-note-button").before('<textarea cols="40" rows="24" name="' + n + '" id="' + n + '" class="rte default note-text" data-noteindex="' + n + '"></textarea>');
    Zotero.ui.init.rte("default", true, n);
};

Zotero.ui.widgets.item.addTag = function(e, t) {
    Z.debug("Zotero.ui.widgets.item.addTag", 3);
    var r = J(e.triggeringElement);
    var o = J(e.data.widgetEl);
    o.find(".add-tag-form").show().find(".add-tag-input").focus();
};

Zotero.ui.widgets.item.removeTag = function(e) {
    Z.debug("Zotero.ui.removeTag", 3);
    var t = e.triggeringElement;
    var r = Zotero.ui.parentWidgetEl(t);
    var o = Zotero.ui.getAssociatedLibrary(r);
    var i = J(t).closest(".item-tag-row");
    var a = i.find(".editable-item-tag");
    var n = a.data("itemkey");
    var s = o.items.getItem(n);
    var l = a.data("value");
    var c = [];
    var d = s.get("tags");
    J.each(d, function(e, t) {
        if (t.tag != l) {
            Z.debug("leaving tag alone:" + t.tag);
            c.push(t);
        }
    });
    s.set("tags", c);
    Zotero.ui.saveItem(s);
    i.remove();
    if (r.find("div.edit-tag-div").length === 1) {
        Zotero.ui.widgets.item.addTag(e);
    }
};

Zotero.ui.widgets.item.addTagTypeahead = function(e, t) {
    Z.debug("adding typeahead", 3);
    var r = e.tags.plainList;
    if (!r) {
        r = [];
    }
    var o = new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace("value"),
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        local: J.map(r, function(e) {
            return {
                value: e
            };
        })
    });
    o.initialize();
    t.find("input.taginput").typeahead("destroy");
    t.find("input.taginput").typeahead({
        hint: true,
        highlight: true,
        minLength: 1
    }, {
        name: "tags",
        displayKey: "value",
        source: o.ttAdapter()
    });
};

Zotero.ui.widgets.item.addTagTypeaheadToInput = function(e, t) {
    Z.debug("adding typeahead", 3);
    var r = e.tags.plainList;
    if (!r) {
        r = [];
    }
    var o = new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace("value"),
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        local: J.map(r, function(e) {
            return {
                value: e
            };
        })
    });
    o.initialize();
    J(t).typeahead("destroy");
    J(t).typeahead({
        hint: true,
        highlight: true,
        minLength: 1
    }, {
        name: "tags",
        displayKey: "value",
        source: o.ttAdapter()
    });
};

Zotero.ui.widgets.item.loadItemDetail = function(e, t) {
    Z.debug("Zotero.ui.widgets.item.loadItemDetail", 3);
    var r = J(t);
    itemInfoPanel = r.find("#item-info-panel");
    itemInfoPanel.empty();
    var o = false;
    var i = e.owningLibrary;
    if (e.apiObj.data.parentItem) {
        o = i.websiteUrl({
            itemKey: e.apiObj.data.parentItem
        });
    }
    if (e.apiObj.data.itemType == "note") {
        Z.debug("note item", 3);
        r.empty().append(J("#itemnotedetailsTemplate").render({
            item: e,
            parentUrl: o,
            libraryString: i.libraryString
        }));
    } else {
        Z.debug("non-note item", 3);
        r.empty().append(J("#itemdetailsTemplate").render({
            item: e,
            parentUrl: o,
            libraryString: i.libraryString
        }));
    }
    var a = "default";
    if (!Zotero.config.librarySettings.allowEdit) {
        a = "readonly";
    }
    Zotero.ui.init.rte(a);
    try {
        var n = document.createEvent("HTMLEvents");
        n.initEvent("ZoteroItemUpdated", true, true);
        document.dispatchEvent(n);
    } catch (s) {
        Zotero.error("Error triggering ZoteroItemUpdated event");
    }
    r.data("itemkey", e.apiObj.key);
};

Zotero.ui.widgets.item.displayStats = function(e, t) {
    Z.debug("Zotero.ui.widgets.item.displayStats", 3);
    var r = e.items.totalResults;
    if (r) {
        J(t).html("<p class='item-count'>" + r + " items in this view</p>");
    }
};

Zotero.ui.widgets.item.refreshChildren = function(e) {
    Z.debug("Zotero.ui.widgets.item.refreshChildren", 3);
    var t = J(e.data.widgetEl);
    var r = t.find("#item-children-panel");
    var o = Zotero.ui.getAssociatedLibrary(t);
    var i = Zotero.state.getUrlVar("itemKey");
    if (!i) {
        Z.debug("No itemKey - " + i, 3);
        t.empty();
        return Promise.reject(new Error("No itemkey - " + i));
    }
    var a = o.items.getItem(i);
    Zotero.ui.showSpinner(r);
    var n = a.getChildren(o).then(function(e) {
        var t = r;
        t.html(J("#childitemsTemplate").render({
            childItems: e,
            libraryString: o.libraryString
        }));
        Zotero.eventful.initTriggers(t);
        Zotero.state.bindItemLinks(t);
    }).catch(Zotero.catchPromiseError);
    return n;
};

Zotero.ui.widgets.item.itemFormKeydown = function(e) {
    if (e.keyCode === Zotero.ui.keyCode.ENTER) {
        Z.debug(e);
        e.preventDefault();
        var t = J(this);
        if (t.hasClass("taginput")) {
            var r = Zotero.ui.getAssociatedLibrary(t);
            if (t.hasClass("tt-query")) {
                var o = t.val();
                t.typeahead("setQuery", o);
                t.trigger("blur");
            }
            if (r) {
                r.trigger("addTag");
            }
            return;
        }
        var i = J(this).nextAll("input, button, textarea, select");
        if (i.length) {
            i.first().focus();
        } else {
            J(this).closest("tr").nextAll().find("input, button, textarea, select").first().focus();
        }
    }
};

Zotero.ui.widgets.item.updateTypeahead = function(e) {
    Z.debug("updateTypeahead", 3);
    var t = J(e.data.widgetEl);
    var r = J(e.triggeringElement);
    var o = Zotero.ui.getAssociatedLibrary(t);
    if (o) {
        Zotero.ui.widgets.item.addTagTypeahead(o, t);
    }
};

Zotero.ui.widgets.item.clickToEdit = function(e) {
    Z.debug("widgets.item.clickToEdit", 3);
    if (!Zotero.config.librarySettings.allowEdit) {
        return false;
    }
    var t = J(e.triggeringElement);
    var r = J(e.data.widgetEl);
    var o = Zotero.ui.getAssociatedLibrary(e.data.widgetEl);
    var i = t.data("itemfield");
    var a = t.data("itemkey");
    var n = t.data("creatorindex");
    var s = t.data("tagindex");
    var l = o.items.getItem(a);
    var c = l.get("creators");
    var d = "";
    if (n !== undefined && c[n]) {
        d = c[n][i];
    } else if (i == "tag") {
        d = t.data("value");
    } else {
        d = l.get(i);
    }
    t.replaceWith(J("#datafieldTemplate").render({
        creatorTypes: l.creatorTypes[l.get("itemType")],
        key: i,
        value: d,
        itemKey: a,
        creatorIndex: n,
        tagIndex: s,
        library: o,
        item: l
    }));
    var u = r.find("[name='" + i + "']");
    if (i == "tag") {
        Zotero.ui.widgets.item.addTagTypeaheadToInput(o, u);
    }
    u.focus();
};

Zotero.ui.widgets.item.switchCreatorFields = function(e) {
    Z.debug("widgets.item.switchCreatorFields", 3);
    var t = J(e.triggeringElement);
    var r = t.data("creatorindex");
    var o = "tr.creator-row[data-creatorindex='" + r + "']";
    Z.debug(o);
    var i = J(o);
    var a = Zotero.ui.widgets.item.creatorFromRow(i);
    var n = J(e.data.widgetEl);
    var s = Zotero.ui.getAssociatedLibrary(e.data.widgetEl);
    var l = t.data("itemfield");
    var c = t.data("itemkey");
    var d = s.items.getItem(c);
    var u;
    var g;
    if (a.name !== undefined) {
        var p = a.name.split(" ");
        if (p.length > 1) {
            a.lastName = p.splice(-1, 1)[0];
            a.firstName = p.join(" ");
        } else {
            a.lastName = a.name;
            a.firstName = "";
        }
        delete a.name;
    } else {
        if (a.firstName === "" && a.lastName === "") {
            a.name = "";
        } else {
            a.name = a.firstName + " " + a.lastName;
        }
        delete a.firstName;
        delete a.lastName;
    }
    var f = d.get("creators");
    f[r] = a;
    Zotero.ui.saveItem(d);
    i.replaceWith(J("#creatorrowTemplate").render(a, {
        creatorIndex: r,
        libraryString: s.libraryString,
        item: d
    }));
    Zotero.eventful.initTriggers(n);
};

Zotero.ui.widgets.item.updateItemField = function(e, t, r, o) {
    Z.debug("widgets.item.updateItemField", 3);
    Z.debug("itemKey: " + t, 3);
    if (!t) {
        throw new Error("Expected widget element to have itemKey data");
    }
    var i = e.items.getItem(t);
    if (i.get(r) != o) {
        i.set(r, o);
        Zotero.ui.saveItem(i);
    }
};

Zotero.ui.widgets.item.updateItemCreatorField = function(e, t, r, o) {
    Z.debug("widgets.item.updateCreatorField", 3);
    Z.debug("itemKey: " + t, 3);
    if (!t) {
        throw new Error("Expected widget element to have itemKey data");
    }
    var i = e.items.getItem(t);
    var a = i.get("creators");
    if (a[o]) {
        a[o] = r;
        Zotero.ui.saveItem(i);
    } else {
        var n = "tr.creator-row[data-creatorindex='" + o + "']";
        var s = J(n);
        var l = Zotero.ui.widgets.item.creatorFromRow(s);
        a[o] = l;
        Zotero.ui.saveItem(i);
    }
};

Zotero.ui.widgets.item.creatorFromRow = function(e) {
    Z.debug("widgets.item.creatorFromRow", 3);
    var t = J(e);
    var r = t.find("span[data-itemfield='creatorType']").data("value");
    var o = t.find("span[data-itemfield='name']").data("value") || "";
    var i = t.find("span[data-itemfield='firstName']").data("value") || "";
    var a = t.find("span[data-itemfield='lastName']").data("value") || "";
    var n = {
        creatorType: r,
        name: o,
        firstName: i,
        lastName: a
    };
    if (n["name"] !== "") {
        delete n.firstName;
        delete n.lastName;
    } else {
        delete n["name"];
    }
    return n;
};

Zotero.ui.widgets.items = {};

Zotero.ui.widgets.items.init = function(e) {
    Z.debug("widgets.items.init");
    var t = Zotero.ui.getAssociatedLibrary(e);
    t.listen("displayedItemsChanged", Zotero.ui.widgets.items.loadItems, {
        widgetEl: e
    });
    t.listen("displayedItemChanged", Zotero.ui.widgets.items.selectDisplayed, {
        widgetEl: e
    });
    t.listen("loadMoreItems", Zotero.ui.widgets.items.loadMoreItems, {
        widgetEl: e
    });
    t.listen("changeItemSorting", Zotero.ui.callbacks.resortItems, {
        widgetEl: e
    });
    var r = J(e);
    Zotero.state.bindItemLinks(r);
    r.on("change", ".itemlist-editmode-checkbox.all-checkbox", function(e) {
        var r = J(this);
        J(".itemlist-editmode-checkbox").prop("checked", r.prop("checked"));
        var o = [];
        J("input.itemKey-checkbox:checked").each(function(e, t) {
            o.push(J(t).data("itemkey"));
        });
        Zotero.state.selectedItemKeys = o;
        t.trigger("selectedItemsChanged", {
            selectedItemKeys: o
        });
        Zotero.ui.widgets.items.highlightSelected();
        if (o.length === 0) {
            t.trigger("displayedItemChanged");
        }
    });
    r.on("change", "input.itemKey-checkbox", function(e) {
        var r = [];
        J("input.itemKey-checkbox:checked").each(function(e, t) {
            r.push(J(t).data("itemkey"));
        });
        Zotero.state.selectedItemKeys = r;
        t.trigger("selectedItemsChanged", {
            selectedItemKeys: r
        });
        Zotero.ui.widgets.items.highlightSelected();
    });
    r.closest("#items-panel").on("scroll", function(e) {
        if (Zotero.ui.widgets.items.scrollAtBottom(J(this))) {
            t.trigger("loadMoreItems");
        }
    });
    t.trigger("displayedItemsChanged");
};

Zotero.ui.widgets.items.selectDisplayed = function(e) {
    Z.debug("widgets.items.selectDisplayed", 3);
    var t = J(e.data.widgetEl);
    var r = Zotero.ui.getAssociatedLibrary(t);
    var o = Zotero.state.getUrlVar("itemKey");
    Zotero.state.selectedItemKeys = [ o ];
    var i = "selectitem-" + o;
    J(".itemlist-editmode-checkbox").prop("checked", false);
    J('[name="' + i + '"]').prop("checked", true);
    Zotero.ui.widgets.items.highlightSelected();
};

Zotero.ui.widgets.items.highlightSelected = function() {
    J(".itemlist-editmode-checkbox").closest("tr").removeClass("highlighed");
    J(".itemlist-editmode-checkbox:checked").closest("tr").addClass("highlighed");
};

Zotero.ui.widgets.items.loadItems = function(e) {
    Z.debug("Zotero eventful loadItems", 3);
    var t = J(e.data.widgetEl);
    var r = Zotero.ui.getAssociatedLibrary(t);
    var o = Zotero.ui.getItemsConfig(r);
    Zotero.ui.showSpinner(t, "horizontal");
    var i = r.loadItems(o).then(function(e) {
        t.empty();
        if (!e.loadedItems) {
            Zotero.error("expected loadedItems on response not present");
            throw "Expected response to have loadedItems";
        }
        r.items.totalResults = e.totalResults;
        Zotero.ui.widgets.items.displayItems(t, o, e.loadedItems);
    }).catch(function(e) {
        Z.error(e);
        t.html("<p>There was an error loading your items. Please try again in a few minutes.</p>");
    });
    return i;
};

Zotero.ui.widgets.items.loadMoreItems = function(e) {
    Z.debug("loadMoreItems", 3);
    var t = J(e.data.widgetEl);
    if (t.data("moreloading")) {
        return;
    }
    if (t.data("all-items-loaded")) {
        return;
    }
    t.data("moreloading", true);
    var r = Zotero.ui.getAssociatedLibrary(t);
    var o = Zotero.ui.getItemsConfig(r);
    var i = t.find("table.wide-items-table tbody>tr").length;
    Z.debug("newStart:" + i);
    o.start = i;
    Zotero.ui.showSpinner(t.find(".items-spinner").show(), "horizontal");
    var a = r.loadItems(o).then(function(e) {
        if (!e.loadedItems) {
            Zotero.error("expected loadedItems on response not present");
            throw "Expected response to have loadedItems";
        }
        Zotero.ui.widgets.items.displayMoreItems(t, e.loadedItems);
        t.removeData("moreloading");
        t.find(".items-spinner").hide();
        var r = t.find("table.narrow-items-table tbody tr").length;
        Z.debug("testing totalResults vs itemsDisplayed: " + e.totalResults, +" " + r);
        if (e.totalResults == r) {
            t.data("all-items-loaded", true);
        }
    }).catch(function(e) {
        Z.error(e);
        t.append("<p>There was an error loading your items. Please try again in a few minutes.</p>");
        t.removeData("moreloading");
        t.find(".items-spinner").hide();
    });
};

Zotero.ui.getItemsConfig = function(e) {
    var t = [ "tag", "collectionKey", "order", "sort", "q", "qmode" ];
    var r = {};
    J.each(t, function(e, t) {
        var o = Zotero.state.getUrlVar(t);
        if (o) {
            r[t] = o;
        }
    });
    var o = {
        libraryID: e.libraryID,
        libraryType: e.libraryType,
        target: "items",
        targetModifier: "top",
        limit: e.preferences.getPref("itemsPerPage")
    };
    var i = {
        order: Zotero.preferences.getPref("order"),
        sort: Zotero.preferences.getPref("sort"),
        limit: e.preferences.getPref("itemsPerPage")
    };
    var a = J.extend({}, o, i, r);
    if (a.order == "addedBy" && e.libraryType == "user") {
        a.order = "title";
    }
    if (!a.sort) {
        a.sort = Zotero.config.sortOrdering[a.order];
    }
    if (a.tag || a.q) {
        delete a.targetModifier;
    }
    return a;
};

Zotero.ui.widgets.items.displayItems = function(e, t, r) {
    Z.debug("Zotero.ui.widgets.displayItems", 3);
    var o = J(e);
    var i = Zotero.ui.getAssociatedLibrary(o);
    var a = J.extend({}, Zotero.config.defaultApiArgs, t);
    var n = i.preferences.getPref("listDisplayedFields");
    if (i.libraryType != "group") {
        n = J.grep(n, function(e, t) {
            return J.inArray(e, Zotero.Library.prototype.groupOnlyColumns) == -1;
        });
    }
    var s = {
        displayFields: n,
        items: r,
        order: a["order"],
        sort: a["sort"],
        library: i
    };
    o.append(J("#itemstableTemplate").render(s));
    Zotero.eventful.initTriggers();
    if (J("body").hasClass("lib-body")) {
        Zotero.ui.fixTableHeaders(J("#field-table"));
    }
    i.trigger("displayedItemChanged");
};

Zotero.ui.widgets.items.displayMoreItems = function(e, t) {
    Z.debug("Zotero.ui.widgets.displayItems", 3);
    var r = J(e);
    var o = Zotero.ui.getAssociatedLibrary(r);
    var i = o.preferences.getPref("listDisplayedFields");
    if (o.libraryType != "group") {
        i = J.grep(i, function(e, t) {
            return J.inArray(e, Zotero.Library.prototype.groupOnlyColumns) == -1;
        });
    }
    var a = {
        displayFields: i,
        items: t,
        library: o
    };
    var n = J("#itemrowsetTemplate").render(a);
    var s = J("#singlecellitemrowsetTemplate").render(a);
    r.find("table.wide-items-table tbody").append(n);
    r.find("table.narrow-items-table tbody").append(s);
    Zotero.eventful.initTriggers();
    Zotero.ui.fixTableHeaders(J("#field-table"));
};

Zotero.ui.callbacks.resortItems = function(e) {
    Z.debug(".field-table-header clicked", 3);
    var t = J(e.data.widgetEl);
    var r = Zotero.ui.getAssociatedLibrary(t);
    var o = Zotero.ui.getPrioritizedVariable("order", "title");
    var i = Zotero.ui.getPrioritizedVariable("sort", "asc");
    var a;
    var n;
    if (e.newSortField) {
        a = e.newSortField;
    } else {
        a = J(e.triggeringElement).data("columnfield");
    }
    if (e.newSortOrder) {
        n = e.newSortOrder;
    } else {
        n = Zotero.config.sortOrdering[a];
    }
    if (J.inArray(a, Zotero.Library.prototype.sortableColumns) == -1) {
        return false;
    }
    if (!e.newSortOrder && o == a && i == n) {
        if (n == "asc") {
            n = "desc";
        } else {
            n = "asc";
        }
    }
    if (!a) {
        Zotero.ui.jsNotificationMessage("no order field mapped to column");
        return false;
    }
    Zotero.state.pathVars["order"] = a;
    Zotero.state.pathVars["sort"] = n;
    Zotero.state.pushState();
    r.preferences.setPref("sortField", a);
    r.preferences.setPref("sortOrder", n);
    r.preferences.setPref("order", a);
    r.preferences.setPref("sort", n);
    Zotero.preferences.setPref("order", a);
    Zotero.preferences.setPref("sort", n);
};

Zotero.ui.widgets.items.scrollAtBottom = function(e) {
    if (J(e).scrollTop() + J(e).innerHeight() >= J(e)[0].scrollHeight) {
        return true;
    }
    return false;
};

Zotero.ui.widgets.recentItems = {};

Zotero.ui.widgets.recentItems.init = function(e) {
    Z.debug("widgets.recentItems.init");
    var t = Zotero.ui.getAssociatedLibrary(e);
    var r = J(e);
    var o = {
        limit: 10,
        order: "dateModified"
    };
    var i = t.loadItems(o).then(function(e) {
        Z.debug("got items in recentItems");
        r.empty();
        Zotero.ui.widgets.items.displayItems(r, o, e.loadedItems);
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
    var o = r.find(".library-settings-dialog");
    o.find(".display-column-field-title").prop("checked", true).prop("disabled", true);
    var i = Zotero.ui.getEventLibrary(e);
    var a = i.preferences.getPref("listDisplayedFields");
    var n = i.preferences.getPref("itemsPerPage");
    var s = i.preferences.getPref("showAutomaticTags");
    J.each(a, function(e, t) {
        var r = ".display-column-field-" + t;
        o.find(r).prop("checked", true);
    });
    J("#items-per-page").val(n);
    J("#show-automatic-tags").prop("checked", s);
    var l = J.proxy(function() {
        var e = [];
        o.find(".library-settings-form").find("input.display-column-field:checked").each(function() {
            e.push(J(this).val());
        });
        var t = parseInt(o.find("#items-per-page").val(), 10);
        var r = o.find("#show-automatic-tags:checked").length > 0 ? true : false;
        i.preferences.setPref("listDisplayedFields", e);
        i.preferences.setPref("itemsPerPage", t);
        i.preferences.setPref("showAutomaticTags", r);
        i.preferences.persist();
        Zotero.preferences.setPref("listDisplayedFields", e);
        Zotero.preferences.setPref("itemsPerPage", t);
        Zotero.preferences.setPref("showAutomaticTags", r);
        Zotero.preferences.persist();
        i.trigger("displayedItemsChanged");
        i.trigger("tagsChanged");
        Zotero.ui.closeDialog(o);
    }, this);
    o.find(".saveButton").on("click", l);
    Zotero.ui.dialog(o, {});
};

Zotero.ui.widgets.newItem = {};

Zotero.ui.widgets.newItem.init = function(e) {
    Z.debug("newItem eventfulwidget init", 3);
    var t = Zotero.ui.getAssociatedLibrary(e);
    var r = J(e);
    t.listen("newItem", Zotero.ui.widgets.newItem.freshitemcallback, {
        widgetEl: e
    });
    t.listen("itemTypeChanged", Zotero.ui.widgets.newItem.changeItemType, {
        widgetEl: e
    });
    t.listen("createItem", Zotero.ui.widgets.item.saveItemCallback, {
        widgetEl: e
    });
    r.on("change", "select.itemType", function(r) {
        t.trigger("itemTypeChanged", {
            triggeringElement: e
        });
    });
};

Zotero.ui.widgets.newItem.freshitemcallback = function(e) {
    Z.debug("Zotero eventful new item", 3);
    var t = e.data.widgetEl;
    var r = t;
    var o = J(e.triggeringElement);
    var i = o.data("itemtype");
    var a = new Zotero.Item();
    return a.initEmpty(i).then(function(e) {
        Zotero.ui.unassociatedItemForm(t, e);
    }, function(e) {
        Z.error(e);
        Zotero.ui.jsNotificationMessage("Error loading item template", "error");
        Z.debug(e);
        Z.debug(e.jqxhr.statusCode);
    });
};

Zotero.ui.unassociatedItemForm = function(e, t) {
    Z.debug("Zotero.ui.unassociatedItem", 3);
    Z.debug(t, 3);
    var r = J(e);
    var o = Zotero.ui.getAssociatedLibrary(e);
    var i = [];
    J.each(Zotero.Item.prototype.typeMap, function(e, t) {
        i.push(e);
    });
    i.sort();
    Z.debug(i);
    return Zotero.Item.prototype.getCreatorTypes(t.apiObj.data.itemType).then(function(e) {
        r.empty();
        if (t.apiObj.data.itemType == "note") {
            var a = Zotero.state.getUrlVar("parentKey");
            if (a) {
                t.parentKey = a;
            }
            r.append(J("#editnoteformTemplate").render({
                item: t,
                itemKey: t.get("key")
            }));
            Zotero.ui.init.rte("default");
        } else {
            r.append(J("#itemformTemplate").render({
                item: t,
                library: o,
                itemKey: t.get("key"),
                creatorTypes: e,
                itemTypes: i,
                citable: true,
                saveable: false
            }));
            if (t.apiObj.tags.length === 0) {
                Zotero.ui.widgets.item.addTag(r, false);
            }
        }
        r.find(".directciteitembutton").on("click", function(e) {
            Zotero.ui.updateItemFromForm(t, r.find("form"));
            o.trigger("citeItems", {
                zoteroItems: [ t ]
            });
        });
        Z.debug("Setting newitem data on container");
        Z.debug(t);
        Z.debug(r);
        r.data("item", t);
        Zotero.eventful.initTriggers(r);
    }).catch(Zotero.catchPromiseError);
};

Zotero.ui.widgets.newItem.changeItemType = function(e) {
    var t = Zotero.ui.parentWidgetEl(e);
    Z.debug(t.length);
    var r = t.find("select.itemType").val();
    Z.debug("newItemType:" + r);
    var o = t.data("item");
    Zotero.ui.updateItemFromForm(o, t.find("form"));
    var i = new Zotero.Item();
    return i.initEmpty(r).then(function(e) {
        Zotero.ui.translateItemType(o, e);
        Zotero.ui.unassociatedItemForm(t, e);
    }, function(e) {
        Z.error(e);
        Zotero.ui.jsNotificationMessage("Error loading item template", "error");
    });
};

Zotero.ui.translateItemType = function(e, t) {
    Z.debug("Zotero.ui.translateItemType");
    J.each(Zotero.Item.prototype.fieldMap, function(r, o) {
        if (r != "itemType" && e.apiObj.hasOwnProperty(r) && t.apiObj.hasOwnProperty(r)) {
            Z.debug("transferring value for " + r + ": " + e.get(r));
            t.set(r, e.get(r));
        }
    });
};

Zotero.ui.widgets.syncedItems = {};

Zotero.ui.widgets.syncedItems.init = function(e) {
    Z.debug("syncedItems widget init", 3);
    var t = Zotero.ui.getAssociatedLibrary(e);
    t.listen("changeItemSorting", Zotero.ui.callbacks.resortItems, {
        widgetEl: e
    });
    t.listen("localItemsChanged", Zotero.ui.widgets.syncedItems.syncItems, {
        widgetEl: e
    });
    t.listen("remoteItemsRequested", Zotero.ui.widgets.syncedItems.syncItems, {
        widgetEl: e
    });
    t.listen("syncLibrary", Zotero.ui.widgets.syncedItems.syncItems, {
        widgetEl: e
    });
    t.listen("displayedItemsChanged", Zotero.ui.widgets.syncedItems.updateDisplayedItems, {
        widgetEl: e
    });
    t.listen("cachedDataLoaded", Zotero.ui.widgets.syncedItems.syncItems, {
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
    Zotero.ui.widgets.syncedItems.bindPaginationLinks(r);
    t.trigger("displayedItemsChanged");
};

Zotero.ui.widgets.syncedItems.syncItems = function(e) {
    Zotero.debug("Zotero eventful syncItems", 3);
    var t = J(e.data.widgetEl);
    var r = Zotero.ui.getAssociatedLibrary(t);
    return r.loadUpdatedItems().then(function() {
        r.trigger("libraryItemsUpdated");
        r.trigger("displayedItemsChanged");
    }).catch(Zotero.catchPromiseError);
};

Zotero.ui.widgets.syncedItems.bindPaginationLinks = function(e) {
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
        var o = r.itemPage;
        Zotero.state.pathVars["itemPage"] = o;
        Zotero.state.pushState();
    });
};

Zotero.ui.widgets.syncedItems.updateDisplayedItems = function(e) {
    Z.debug("widgets.syncedItems.updateDisplayedItems", 3);
    var t = J(e.data.widgetEl);
    var r = Zotero.ui.getAssociatedLibrary(t);
    Z.debug(r);
    var o = Zotero.ui.getItemsConfig(r);
    var i = Zotero.state.getUrlVars();
    r.buildItemDisplayView(i).then(function(e) {
        Z.debug("displayingItems in promise callback");
        Z.debug(e);
        t.empty();
        Zotero.ui.widgets.items.displayItems(t, o, e);
        Zotero.eventful.initTriggers();
    }).catch(Zotero.catchPromiseError);
};

Zotero.ui.widgets.tags = {};

Zotero.ui.widgets.tags.init = function(e) {
    Z.debug("tags widget init", 3);
    var t = Zotero.ui.getAssociatedLibrary(e);
    t.listen("tagsDirty", Zotero.ui.widgets.tags.syncTags, {
        widgetEl: e
    });
    t.listen("cachedDataLoaded", Zotero.ui.widgets.tags.syncTags, {
        widgetEl: e
    });
    t.listen("tagsChanged libraryTagsUpdated selectedTagsChanged", Zotero.ui.widgets.tags.rerenderTags, {
        widgetEl: e
    });
    var r = J(e);
    Zotero.state.bindTagLinks(r);
    r.on("keyup", "#tag-filter-input", Zotero.ui.widgets.tags.filterTags);
};

Zotero.ui.widgets.tags.syncTags = function(e) {
    Z.debug("Zotero.ui.widgets.tags.syncTags", 3);
    var t = J(e.data.widgetEl);
    var r = t.data("loadingPromise");
    if (r) {
        var o = t.data("loadingPromise");
        return o.then(function() {
            return Zotero.ui.widgets.tags.syncTags(e);
        }).catch(Zotero.catchPromiseError);
    }
    var i = e.data.checkCached;
    if (i !== false) {
        i = true;
    }
    Zotero.ui.showSpinner(t.find("div.loading"));
    var a = Zotero.ui.getAssociatedLibrary(t);
    if (i === false) {
        a.tags.clear();
    }
    r = a.loadUpdatedTags().then(function() {
        Z.debug("syncTags done. clearing loading div");
        t.find(".loading").empty();
        a.trigger("libraryTagsUpdated");
        t.removeData("loadingPromise");
    }, function(e) {
        Z.error("syncTags failed. showing local data and clearing loading div");
        a.trigger("libraryTagsUpdated");
        t.find(".loading").empty();
        t.removeData("loadingPromise");
        Zotero.ui.jsNotificationMessage("There was an error loading tags. Some tags may not have been updated.", "notice");
    });
    t.data("loadingPromise", r);
    return r;
};

Zotero.ui.widgets.tags.rerenderTags = function(e) {
    Zotero.debug("Zotero eventful rerenderTags", 3);
    var t = J(e.data.widgetEl);
    var r = Zotero.state.getUrlVar("tag");
    if (!J.isArray(r)) {
        if (r) {
            r = [ r ];
        } else {
            r = [];
        }
    }
    t.children(".loading").empty();
    var o = Zotero.ui.getAssociatedLibrary(t);
    var i = o.tags.plainTagsList(o.tags.tagsArray);
    Zotero.ui.widgets.tags.displayTagsFiltered(t, o, i, r);
};

Zotero.ui.widgets.tags.displayTagsFiltered = function(e, t, r, o) {
    Zotero.debug("Zotero.ui.widgets.tags.displayTagsFiltered", 3);
    Z.debug(o, 4);
    var i = J("#tag-filter-input").val();
    var a = J(e);
    var n = t.tags;
    var s = t.preferences.getPref("tagColors");
    if (!s) s = [];
    var l = [];
    var c = [];
    J.each(s, function(e, t) {
        c.push(t.name.toLowerCase());
        var r = n.getTag(t.name);
        if (r) {
            r.color = t.color;
            l.push(r);
        }
    });
    var d = [];
    var u = [];
    J.each(r, function(e, t) {
        if (n.tagObjects[t] && n.tagObjects[t].apiObj.meta.numItems > 0 && J.inArray(t, o) == -1 && J.inArray(t, c) == -1) {
            d.push(n.tagObjects[t]);
        }
    });
    J.each(o, function(e, t) {
        if (n.tagObjects[t]) {
            u.push(n.tagObjects[t]);
        }
    });
    var g = J("#tags-list").empty();
    J("#colored-tags-list").replaceWith(J("#coloredtaglistTemplate").render({
        tags: l
    }));
    J("#selected-tags-list").replaceWith(J("#tagunorderedlistTemplate").render({
        tags: u,
        id: "selected-tags-list"
    }));
    J("#tags-list").replaceWith(J("#tagunorderedlistTemplate").render({
        tags: d,
        id: "tags-list"
    }));
};

Zotero.ui.widgets.tags.filterTags = function(e) {
    Z.debug("Zotero.ui.widgets.tags.filterTags", 3);
    var t = Zotero.ui.getAssociatedLibrary(J("#tag-filter-input").closest(".eventfulwidget"));
    var r = t.tags.plainList;
    var o = Zotero.utils.matchAnyAutocomplete(J("#tag-filter-input").val(), r);
    Zotero.ui.widgets.tags.displayTagsFiltered(J("#tags-list-div"), t, o, []);
    Z.debug(o, 4);
};

Zotero.ui.widgets.updateCollectionDialog = {};

Zotero.ui.widgets.updateCollectionDialog.init = function(e) {
    Z.debug("updatecollectionsdialog widget init", 3);
    var t = Zotero.ui.getAssociatedLibrary(e);
    t.listen("updateCollectionDialog", Zotero.ui.widgets.updateCollectionDialog.show, {
        widgetEl: e
    });
};

Zotero.ui.widgets.updateCollectionDialog.show = function(e) {
    Z.debug("updateCollectionDialog.show", 3);
    var t = J(e.triggeringElement);
    var r = Zotero.ui.getAssociatedLibrary(t);
    var o = r.collections.nestedOrderingArray();
    var i = J(e.data.widgetEl).empty();
    i.html(J("#updatecollectiondialogTemplate").render({
        ncollections: o
    }));
    var a = i.find(".update-collection-dialog");
    var n = Zotero.state.getUrlVar("collectionKey");
    var s = r.collections.getCollection(n);
    var l = s.parentCollection;
    a.find(".update-collection-parent-select").val(l);
    a.find(".updated-collection-title-input").val(s.get("title"));
    var c = function() {
        var e = a.find("input.updated-collection-title-input").val() || "Untitled";
        var t = a.find(".update-collection-parent-select").val();
        var o = s;
        if (!o) {
            Zotero.ui.jsNotificationMessage("Selected collection not found", "error");
            return false;
        }
        o.update(e, t).then(function(e) {
            Zotero.ui.jsNotificationMessage("Collection Saved", "confirm");
            r.collections.dirty = true;
            r.collections.initSecondaryData();
            r.trigger("libraryCollectionsUpdated");
            Zotero.state.pushState(true);
            Zotero.ui.closeDialog(a);
        }).catch(Zotero.catchPromiseError);
    };
    a.find(".updateButton").on("click", c);
    Zotero.ui.dialog(a, {});
    a.find(".updated-collection-title-input").select();
    return false;
};

Zotero.ui.widgets.uploadDialog = {};

Zotero.ui.widgets.uploadDialog.init = function(e) {
    Z.debug("uploaddialog widget init", 3);
    var t = J(e);
    var r = Zotero.ui.getAssociatedLibrary(e);
    r.listen("uploadAttachment", Zotero.ui.widgets.uploadDialog.show, {
        widgetEl: e,
        library: r
    });
    r.listen("upload", Zotero.ui.widgets.uploadDialog.upload, {
        widgetEl: e,
        library: r
    });
    t.on("click", ".uploadButton", function() {
        r.trigger("upload");
    });
};

Zotero.ui.widgets.uploadDialog.show = function(e) {
    Z.debug("uploadDialog.show", 3);
    var t = J(e.triggeringElement);
    var r = Zotero.ui.getEventLibrary(e);
    var o = J(e.data["widgetEl"]).empty();
    o.html(J("#attachmentuploadTemplate").render({}));
    var i = o.find(".upload-attachment-dialog");
    Zotero.ui.dialog(i, {});
    var a = function(e) {
        Z.debug("attachmentUpload handleFiles", 3);
        if (typeof e == "undefined" || e.length === 0) {
            return false;
        }
        var t = e[0];
        Zotero.file.getFileInfo(t).then(function(e) {
            Z.debug(e);
            o.find(".attachmentuploadfileinfo").data("fileInfo", e);
            o.find("input.upload-file-title-input").val(e.filename);
            o.find("td.uploadfilesize").html(e.filesize);
            o.find("td.uploadfiletype").html(e.contentType);
            o.find(".droppedfilename").html(e.filename);
        });
        return;
    };
    i.find("#fileuploaddroptarget").on("dragenter dragover", function(e) {
        e.stopPropagation();
        e.preventDefault();
    });
    i.find("#fileuploaddroptarget").on("drop", function(e) {
        Z.debug("fileuploaddroptarget drop callback", 3);
        e.stopPropagation();
        e.preventDefault();
        o.find(".fileuploadinput").val("");
        var t = e.originalEvent;
        var r = t.dataTransfer;
        var i = r.files;
        a(i);
    });
    i.find("#fileuploadinput").on("change", function(e) {
        Z.debug("fileuploaddroptarget callback 1", 3);
        e.stopPropagation();
        e.preventDefault();
        var t = J(this).get(0).files;
        a(t);
    });
    Zotero.eventful.initTriggers(o);
};

Zotero.ui.widgets.uploadDialog.upload = function(e) {
    Z.debug("uploadFunction", 3);
    var t = J(e.data["widgetEl"]);
    var r = e.data["library"];
    var o = t.find("div.upload-attachment-dialog");
    var i = o.find("#attachmentuploadfileinfo").data("fileInfo");
    var a = o.find("#upload-file-title-input").val();
    var n = function(e) {
        Z.debug("fullUpload.upload.onprogress", 3);
        var r = Math.round(e.loaded / e.total * 100);
        Z.debug("Upload progress event:" + e.loaded + " / " + e.total + " : " + r + "%", 3);
        t.find("#uploadprogressmeter").val(r);
    };
    Zotero.ui.showSpinner(t.find(".fileuploadspinner"));
    var s = Zotero.state.getUrlVar("itemKey");
    var l = r.items.getItem(s);
    var c;
    if (!l.get("parentItem")) {
        Z.debug("no parentItem", 3);
        var d = new Zotero.Item();
        d.associateWithLibrary(r);
        c = d.initEmpty("attachment", "imported_file").then(function(e) {
            Z.debug("templateItemDeferred callback", 3);
            e.set("title", a);
            return l.uploadChildAttachment(e, i, n);
        });
    } else if (l.get("itemType") == "attachment" && l.get("linkMode") == "imported_file") {
        Z.debug("imported_file attachment", 3);
        c = l.uploadFile(i, n);
    }
    c.then(function() {
        Z.debug("uploadSuccess", 3);
        r.trigger("uploadSuccessful");
    }).catch(Zotero.ui.widgets.uploadDialog.failureHandler).then(function() {
        Zotero.ui.closeDialog(o);
    });
};

Zotero.ui.widgets.uploadDialog.failureHandler = function(e) {
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

Zotero.ui.widgets.filterGuide = {};

Zotero.ui.widgets.filterGuide.init = function(e) {
    Z.debug("widgets.filterGuide.init", 3);
    var t = Zotero.ui.getAssociatedLibrary(e);
    t.listen("displayedItemsChanged", Zotero.ui.widgets.filterGuide.refreshFilters, {
        widgetEl: e
    });
    t.listen("displayedItemChanged", Zotero.ui.widgets.filterGuide.refreshFilters, {
        widgetEl: e
    });
    t.listen("updateFilterGuide", Zotero.ui.widgets.filterGuide.refreshFilters, {
        widgetEl: e
    });
    t.listen("libraryCollectionsUpdated", Zotero.ui.widgets.filterGuide.refreshFilters, {
        widgetEl: e
    });
    t.listen("clearFilter", Zotero.ui.widgets.filterGuide.clearFilter, {
        widgetEl: e
    });
};

Zotero.ui.widgets.filterGuide.refreshFilters = function(e) {
    Z.debug("widgets.filterGuide.refreshFilters", 3);
    var t = e.data.widgetEl;
    var r = t;
    var o = J(r);
    var i = Zotero.ui.getAssociatedLibrary(r);
    var a = Zotero.ui.getItemsConfig(i);
    var n = {};
    if (a["collectionKey"]) {
        n["collection"] = i.collections.getCollection(a["collectionKey"]);
    }
    if (a["tag"]) {
        n["tag"] = a["tag"];
    }
    if (a["q"]) {
        n["search"] = a["q"];
    }
    n["library"] = i;
    o.empty();
    o.append(J("#filterguideTemplate").render(n));
    Zotero.eventful.initTriggers(t);
};

Zotero.ui.widgets.filterGuide.clearFilter = function(e) {
    Z.debug("widgets.filterGuide.clearFilter", 3);
    var t = J(e.data.widgetEl);
    var r = J(e.triggeringElement);
    var o = Zotero.ui.getAssociatedLibrary(t);
    var i = r.data("collectionkey");
    var a = r.data("tag");
    var n = r.data("query");
    if (i) {
        Zotero.state.unsetUrlVar("collectionKey");
    }
    if (a) {
        Zotero.state.toggleTag(a);
    }
    if (n) {
        o.trigger("clearLibraryQuery");
        return;
    }
    Zotero.state.pushState();
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
    var o = r.find("#progress-modal-dialog");
    Zotero.ui.dialog(o, {});
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

Zotero.ui.widgets.sendToLibraryDialog = {};

Zotero.ui.widgets.sendToLibraryDialog.init = function(e) {
    Z.debug("sendToLibraryDialog widget init", 3);
    var t = Zotero.ui.getAssociatedLibrary(e);
    t.listen("sendToLibraryDialog", Zotero.ui.widgets.sendToLibraryDialog.show, {
        widgetEl: e
    });
};

Zotero.ui.widgets.sendToLibraryDialog.show = function(e) {
    Zotero.debug("Zotero.ui.widgets.sendToLibraryDialog.show", 3);
    var t = J(e.data.widgetEl);
    var r = Zotero.ui.getAssociatedLibrary(t);
    if (!Zotero.config.loggedIn) {
        throw new Error("no logged in userID. Required for groupsList widget");
    }
    var o = Zotero.config.loggedInUserID;
    var i = "u" + o;
    var a = r.groups.fetchUserGroups(o).then(function(e) {
        Z.debug("got member groups", 3);
        Z.debug(e);
        var a = e.fetchedGroups;
        var n = [ {
            name: "My Library",
            libraryString: i
        } ];
        for (var s = 0; s < a.length; s++) {
            if (a[s].isWritable(o)) {
                var l = "g" + a[s].get("id");
                n.push({
                    name: a[s].get("name"),
                    libraryString: l
                });
            }
        }
        t.html(J("#sendToLibraryDialogTemplate").render({
            destinationLibraries: n
        }));
        var c = t.find(".send-to-library-dialog");
        var d = function() {
            Z.debug("sendToLibrary callback", 3);
            var e = c.find(".destination-library-select").val();
            Z.debug("move to: " + e, 3);
            var t = Zotero.utils.parseLibString(e);
            destLibrary = new Zotero.Library(t.libraryType, t.libraryID);
            Zotero.libraries[e] = destLibrary;
            var o = Zotero.state.getSelectedItemKeys();
            if (o.length === 0) {
                Zotero.ui.jsNotificationMessage("No items selected", "notice");
                Zotero.ui.closeDialog(c);
                return false;
            }
            var i = r.items.getItems(o);
            r.sendToLibrary(i, destLibrary).then(function(e) {
                Zotero.ui.jsNotificationMessage("Items sent to other library", "notice");
            }).catch(function(e) {
                Z.debug(e);
                Zotero.ui.jsNotificationMessage("Error sending items to other library", "notice");
            });
            Zotero.ui.closeDialog(c);
            return false;
        };
        c.find(".sendButton").on("click", d);
        Zotero.ui.dialog(c, {});
    }).catch(function(e) {
        Z.error(e);
        Z.error(e.message);
    });
};

Zotero.ui.widgets.searchbox = {};

Zotero.ui.widgets.searchbox.init = function(e) {
    Z.debug("Zotero.eventful.init.searchbox", 3);
    var t = Zotero.ui.getAssociatedLibrary(e);
    var r = J(e);
    t.listen("clearLibraryQuery", Zotero.ui.widgets.searchbox.clearLibraryQuery, {
        widgetEl: e
    });
    if (Zotero.state.getUrlVar("q")) {
        r.find(".search-query").val(Zotero.state.getUrlVar("q"));
    }
    var o = "support";
    if (undefined !== window.zoterojsSearchContext) {
        o = zoterojsSearchContext;
    }
    r.on("click", ".library-search-type-link", function(e) {
        e.preventDefault();
        var t = J(".library-search-type-link").removeClass("selected");
        var o = J(e.target);
        var i = o.data("searchtype");
        var a = r.find("input.search-query").data("searchtype", i);
        o.addClass("selected");
        if (i == "simple") {
            a.attr("placeholder", "Search Title, Creator, Year");
        } else if (i == "everything") {
            a.attr("placeholder", "Search Full Text");
        }
    });
    r.on("submit", "form.library-search", function(e) {
        e.preventDefault();
        Z.debug("library-search form submitted", 3);
        Zotero.state.clearUrlVars([ "collectionKey", "tag", "q", "qmode" ]);
        var t = r.find("input.search-query").val();
        var o = r.find("input.search-query").data("searchtype");
        if (t !== "" || Zotero.state.getUrlVar("q")) {
            Zotero.state.pathVars["q"] = t;
            if (o != "simple") {
                Zotero.state.pathVars["qmode"] = o;
            }
            Zotero.state.pushState();
        }
        return false;
    });
    r.on("click", ".clear-field-button", function(e) {
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
    var o = "xs";
    var i = [];
    switch (true) {
      case window.matchMedia("(min-width: 1200px)").matches:
        o = "lg";
        t.find(".panelcontainer-panelcontainer").show().find(".panelcontainer-panel").show();
        break;

      case window.matchMedia("(min-width: 992px)").matches:
        o = "md";
        t.find(".panelcontainer-panelcontainer").show().find(".panelcontainer-panel").show();
        break;

      case window.matchMedia("(min-width: 768px)").matches:
        o = "sm";
        t.find(".panelcontainer-panelcontainer").show().find(".panelcontainer-panel").show();
        if (r == "#item-panel" || r == "#items-panel") {
            t.find(r).siblings(".panelcontainer-panel").hide();
            t.find(r).show();
        }
        break;

      default:
        o = "xs";
        t.find(".panelcontainer-panelcontainer").hide().find(".panelcontainer-panel").hide();
        t.find(r).show().closest(".panelcontainer-panelcontainer").show();
    }
    Z.debug("panelContainer calculated deviceSize: " + o, 3);
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
    var o = t.find(".choose-sorting-dialog");
    var i = Zotero.ui.getPrioritizedVariable("order", "title");
    var a = Zotero.ui.getPrioritizedVariable("sort", "asc");
    o.find(".sort-column-select").val(i);
    o.find(".sort-order-select").val(a);
    var n = function() {
        var e = o.find(".sort-column-select").val();
        var t = o.find(".sort-order-select").val();
        r.trigger("changeItemSorting", {
            newSortField: e,
            newSortOrder: t
        });
        Zotero.ui.closeDialog(o);
        return false;
    };
    o.find(".saveSortButton").on("click", n);
    Zotero.ui.dialog(o, {});
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
    var o = J("#capture").on("change", function() {
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
    var o = URL.createObjectURL(r);
    t.find("#preview-image").attr("src", o);
};

Zotero.ui.widgets.imageGrabber.grab = function(e) {
    Z.debug("imageGrabber.grab", 3);
    var t = J(e.data["widgetEl"]);
    var r = Zotero.ui.getAssociatedLibrary(t);
    var o;
    var i;
    var a = new Zotero.Item();
    a.associateWithLibrary(r);
    a.initEmpty("attachment", "imported_file").then(function(e) {
        Z.debug("templateItem callback", 3);
        var o = t.find("#image-grabber-title").val();
        if (!o) o = "Untitled";
        e.set("title", o);
        e.set("itemKey", Zotero.utils.getKey());
        r.items.addItem(e);
        return r.idbLibrary.addItems([ e ]);
    }).then(function() {
        Z.debug("added item to idb", 3);
        o = Zotero.ui.widgets.imageGrabber.getFile(t);
        return Zotero.file.getFileInfo(o);
    }).then(function(e) {
        Z.debug("got fileInfo", 3);
        i = e;
        var t = i;
        return r.idbLibrary.setFile(a.get("itemKey"), t);
    }).then(function() {
        Z.debug("file saved to idb", 3);
    }).catch(Zotero.catchPromiseError);
};

Zotero.ui.widgets.imageGrabber.previewStoredImage = function(e) {
    Z.debug("imageGrabber.previewImage", 3);
    var t = J(e.data["widgetEl"]);
    var r = Zotero.ui.getAssociatedLibrary(t);
    var o = e.itemKey;
    Z.debug("itemKey: " + o);
    var i = r.items.getItem(o);
    var a = r.idbLibrary.getFile(o).then(function(e) {
        Z.debug("got Image");
        Z.debug(e);
        var r = new Blob([ e.filedata ], {
            type: e.contentType
        });
        var o = URL.createObjectURL(r);
        Z.debug(o);
        t.find("#preview-image").attr("src", o);
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
        var o = r.itemPage;
        Zotero.state.pathVars["itemPage"] = o;
        Zotero.state.pushState();
    });
};

Zotero.ui.widgets.localItems.updateDisplayedItems = function(e) {
    Z.debug("widgets.localItems.updateDisplayedItems", 3);
    var t = J(e.data.widgetEl);
    var r = Zotero.ui.getAssociatedLibrary(t);
    var o = Zotero.ui.getItemsConfig(r);
    var i = Zotero.state.getUrlVars();
    r.buildItemDisplayView(i).then(function(e) {
        Z.debug("displayingItems in promise callback");
        t.empty();
        Zotero.ui.widgets.items.displayItems(t, o, e);
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
    var o = Zotero.state.getUrlVar("q");
    Z.debug("searchType: " + r);
    switch (r) {
      case "support":
        J("a.supportTab").tab("show");
        J("#supportQuery").val(o);
        break;

      case "groups":
        J("a.groupTab").tab("show");
        J("#groupQuery").val(o);
        break;

      case "people":
        J("a.peopleTab").tab("show");
        J("#peopleQuery").val(o);
        break;
    }
    if (o) {
        Zotero.ui.widgets.siteSearch.search(r, o);
    }
    t.find('a[data-toggle="tab"]').on("shown.bs.tab", Zotero.ui.widgets.siteSearch.tabChange);
};

Zotero.ui.widgets.siteSearch.tabChange = function(e) {
    Z.debug("search tab changed", 3);
    var t = J(e.target).data("searchtype");
    var r = Zotero.state.getUrlVar("q");
    J('input[data-searchtype="' + t + '"]').val(r);
    Zotero.state.setUrlVar("type", t);
    Zotero.state.pushState();
    var o = {
        type: t,
        query: r
    };
    Zotero.ui.widgets.siteSearch.runSearch(o);
};

Zotero.ui.widgets.siteSearch.triggeredSearch = function(e) {
    Z.debug("Zotero.ui.widgets.siteSearch.search", 3);
    var t = J(e.data.widgetEl);
    var r = J(e.triggeringElement);
    var o = r.data("searchtype");
    var i = r.closest(".search-section").find('input[name="q"]').val();
    if (o == "support") {
        o = t.find("input[name=supportRefinement]:checked").val();
    }
    Zotero.ui.widgets.siteSearch.search(o, i);
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
    Zotero.ui.widgets.siteSearch.clearResults(J("#site-search"));
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
        var o;
        for (o in searcher.results) {
            var i = searcher.results[o];
            var a = i.url.replace("http://", "");
            J("#search-results").append(J("#googlesearchresultTemplate").render({
                title: i.title,
                url: a,
                content: i.content
            })).show();
        }
        J("#search-result-count").html("Found " + searcher.cursor.estimatedResultCount + " results");
        for (o in searcher.cursor.pages) {
            var n = searcher.cursor.pages[o];
            if (o == searcher.cursor.currentPageIndex) {
                J("#search-pagination").append(n.label + " | ");
            } else {
                J("#search-pagination").append("<a href='javascript:Zotero.ui.widgets.siteSearch.gotopage(" + o + ")'>" + n.label + "</a> | ");
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
    Zotero.ui.widgets.siteSearch.clearResults(J("#site-search"));
    searcher.gotoPage(e);
};

Zotero.ui.widgets.libraryDropdown = {};

Zotero.ui.widgets.libraryDropdown.init = function(e) {
    Z.debug("libraryDropdown widget init", 3);
    var t = Zotero.ui.getAssociatedLibrary(e);
    var r = J(e);
    var o = Zotero.config.librarySettings.name;
    r.find("span.current-library-name").text(o);
    Zotero.listen("populateLibraryDropdown", Zotero.ui.widgets.libraryDropdown.populateDropdown, {
        widgetEl: e
    });
};

Zotero.ui.widgets.libraryDropdown.populateDropdown = function(e) {
    Zotero.debug("Zotero.ui.widgets.libraryDropdown.populateDropdown", 3);
    var t = J(e.data.widgetEl);
    if (t.data("loaded")) {
        return;
    }
    var r = Zotero.ui.getAssociatedLibrary(t);
    if (!Zotero.config.loggedIn) {
        throw new Error("no logged in userID. Required for libraryDropdown widget");
    }
    var o = Zotero.config.loggedInUser;
    var i = "u" + o.userID;
    var a = Zotero.url.userWebLibrary(o.slug);
    var n = Zotero.config.librarySettings.name;
    var s = r.groups.fetchUserGroups(o.userID).then(function(e) {
        Z.debug("got member groups", 3);
        var r = e.fetchedGroups;
        var s = [];
        if (!(Zotero.config.librarySettings.libraryType == "user" && Zotero.config.librarySettings.libraryID == o.userID)) {
            s.push({
                name: "My Library",
                libraryString: i,
                webUrl: a
            });
        }
        for (var l = 0; l < r.length; l++) {
            if (Zotero.config.librarySettings.libraryType == "group" && r[l].get("id") == Zotero.config.librarySettings.libraryID) {
                continue;
            }
            var c = "g" + r[l].get("id");
            s.push({
                name: r[l].get("name"),
                libraryString: c,
                webUrl: Zotero.url.groupWebLibrary(r[l])
            });
        }
        t.html(J("#librarydropdownTemplate").render({
            currentLibraryName: n,
            accessibleLibraries: s
        }));
        t.data("loaded", true);
    }).catch(function(e) {
        Z.error(e);
        Z.error(e.message);
    });
};

Zotero.ui.widgets.publications = {};

Zotero.ui.widgets.publications.init = function(e) {
    Z.debug("widgets.publications.init");
    var t = Zotero.ui.getAssociatedLibrary(e);
    var r = J(e);
    var o = r.data("libraryID");
    var i = {
        limit: 50,
        order: "dateModified",
        sort: "desc",
        libraryType: "user",
        libraryID: o,
        target: "publications",
        include: "data,bib",
        linkwrap: "1",
        style: "apa-annotated-bibliography"
    };
    Zotero.ui.showSpinner(r, "horizontal");
    var a = t.loadPublications(i).then(function(e) {
        Z.debug("got publications", 3);
        r.empty();
        Zotero.ui.widgets.publications.displayItems(r, i, e.publicationItems);
    }, function(e) {
        Z.error(e);
        Z.error("error getting publication items");
        var t = Zotero.ui.ajaxErrorMessage(e.jqxhr);
        r.html("<p>" + t + "</p>");
    });
};

Zotero.ui.widgets.publications.displayItems = function(e, t, r) {
    Z.debug("publications.displayItems", 3);
    var o = J(e);
    var i = Zotero.ui.getAssociatedLibrary(o);
    var a = J.extend({}, Zotero.config.defaultApiArgs, t);
    var n = i.preferences.getPref("listDisplayedFields");
    if (i.libraryType != "group") {
        n = J.grep(n, function(e, t) {
            return J.inArray(e, Zotero.Library.prototype.groupOnlyColumns) == -1;
        });
    }
    var s = [ "abstractNote" ];
    var l = {
        book: [],
        dissertation: [],
        thesis: [],
        journalArticle: [],
        conferencePaper: [],
        bookSection: [],
        magazineArticle: [],
        newspaperArticle: [],
        presentation: [],
        report: [],
        blogPost: [],
        document: [],
        other: []
    };
    var c = {};
    Z.debug("processing items");
    for (var d = 0; d < r.length; d++) {
        var u = r[d];
        var g = u.get("parentItem");
        if (g) {
            Z.debug("has parentKey, adding item to childItems object " + g);
            c[g] = u;
        }
        for (var p = 0; p < s.length; p++) {
            if (u.get(s[p])) {
                u.hasMore = true;
            }
        }
        if (u.apiObj.data["creators"] && u.apiObj.data["creators"].length > 1) {
            u.hasMore = true;
        }
        var f = u.get("itemType");
        Z.debug(f);
        Z.debug(l[f]);
        if (l[f]) {
            Z.debug("inserting into appropriate array");
            l[f].push(u);
        } else {
            Z.debug("inserting into other");
            l["other"].push(u);
        }
    }
    Z.debug("rendering publicationsData");
    Z.debug(l);
    var m = {
        items: r,
        childItems: c,
        library: i,
        moreDisplayFields: s,
        publicationTypes: l,
        displayName: Z.config.librarySettings.name
    };
    o.append(J("#publicationsTemplate").render(m));
};

Zotero.url.requestReadApiKeyUrl = function(e, t, r) {
    var o = Zotero.config.baseWebsiteUrl + "/settings/keys/new";
    o.replace("http", "https");
    var i = {
        name: "Private Feed"
    };
    if (e == "group") {
        i["library_access"] = 0;
        i["group_" + t] = "read";
        i["redirect"] = r;
    } else if (e == "user") {
        i["library_access"] = 1;
        i["notes_access"] = 1;
        i["redirect"] = r;
    }
    queryParamsArray = [];
    J.each(i, function(e, t) {
        queryParamsArray.push(encodeURIComponent(e) + "=" + encodeURIComponent(t));
    });
    queryString = "?" + queryParamsArray.join("&");
    return o + queryString;
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
                    var o = Zotero.config.baseZoteroWebsiteUrl + "/search/#type/" + e;
                    var i = J(this).find("input[type='text']").val();
                    if (i !== "" && i != t) {
                        o = o + "/q/" + encodeURIComponent(i);
                    }
                    location.href = o;
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
                var o = "cv_" + r + "_text";
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
            var o = J("input#write_access").prop("checked");
            if (t) {
                e += "Access to read your personal library.<br />";
            }
            if (r) {
                e += "Access to read notes in your personal library.<br />";
            }
            if (o) {
                e += "Access to read and modify your personal library.<br />";
            }
            var i = J("input[name='groups_all']:checked").val();
            switch (i) {
              case "read":
                e += "Access to read any of your group libraries<br />";
                break;

              case "write":
                e += "Access to read and modify any of your group libraries<br />";
                break;
            }
            var a = J("input#individual_groups").prop("checked");
            var n = [];
            if (a) {
                J("input.individual_group_permission:checked").each(function(t, r) {
                    var o = J(r).data("groupname");
                    var i = J(r).data("groupid");
                    var a = J(r).val();
                    switch (a) {
                      case "read":
                        e += "Access to read library for group '" + o + "'<br />";
                        break;

                      case "write":
                        e += "Access to read and modify library for group '" + o + "'<br />";
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
                var o = e.fetchGlobalItems({
                    q: r
                });
                o.then(function(e) {
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