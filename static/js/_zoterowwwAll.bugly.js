/*
 * jQuery BBQ: Back Button & Query Library - v1.2.1 - 2/17/2010
 * http://benalman.com/projects/jquery-bbq-plugin/
 * 
 * Copyright (c) 2010 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */(function($, p) {
    var i, m = Array.prototype.slice, r = decodeURIComponent, a = $.param, c, l, v, b = $.bbq = $.bbq || {}, q, u, j, e = $.event.special, d = "hashchange", A = "querystring", D = "fragment", y = "elemUrlAttr", g = "location", k = "href", t = "src", x = /^.*\?|#.*$/g, w = /^.*\#/, h, C = {};
    function E(F) {
        return typeof F === "string";
    }
    function B(G) {
        var F = m.call(arguments, 1);
        return function() {
            return G.apply(this, F.concat(m.call(arguments)));
        };
    }
    function n(F) {
        return F.replace(/^[^#]*#?(.*)$/, "$1");
    }
    function o(F) {
        return F.replace(/(?:^[^?#]*\?([^#]*).*$)?.*/, "$1");
    }
    function f(H, M, F, I, G) {
        var O, L, K, N, J;
        if (I !== i) {
            K = F.match(H ? /^([^#]*)\#?(.*)$/ : /^([^#?]*)\??([^#]*)(#?.*)/);
            J = K[3] || "";
            if (G === 2 && E(I)) {
                L = I.replace(H ? w : x, "");
            } else {
                N = l(K[2]);
                I = E(I) ? l[H ? D : A](I) : I;
                L = G === 2 ? I : G === 1 ? $.extend({}, I, N) : $.extend({}, N, I);
                L = a(L);
                if (H) {
                    L = L.replace(h, r);
                }
            }
            O = K[1] + (H ? "#" : L || !K[1] ? "?" : "") + L + J;
        } else {
            O = M(F !== i ? F : p[g][k]);
        }
        return O;
    }
    a[A] = B(f, 0, o);
    a[D] = c = B(f, 1, n);
    c.noEscape = function(G) {
        G = G || "";
        var F = $.map(G.split(""), encodeURIComponent);
        h = new RegExp(F.join("|"), "g");
    };
    c.noEscape(",/");
    $.deparam = l = function(I, F) {
        var H = {}, G = {
            "true": !0,
            "false": !1,
            "null": null
        };
        $.each(I.replace(/\+/g, " ").split("&"), function(L, Q) {
            var K = Q.split("="), P = r(K[0]), J, O = H, M = 0, R = P.split("]["), N = R.length - 1;
            if (/\[/.test(R[0]) && /\]$/.test(R[N])) {
                R[N] = R[N].replace(/\]$/, "");
                R = R.shift().split("[").concat(R);
                N = R.length - 1;
            } else {
                N = 0;
            }
            if (K.length === 2) {
                J = r(K[1]);
                if (F) {
                    J = J && !isNaN(J) ? +J : J === "undefined" ? i : G[J] !== i ? G[J] : J;
                }
                if (N) {
                    for (; M <= N; M++) {
                        P = R[M] === "" ? O.length : R[M];
                        O = O[P] = M < N ? O[P] || (R[M + 1] && isNaN(R[M + 1]) ? {} : []) : J;
                    }
                } else {
                    if ($.isArray(H[P])) {
                        H[P].push(J);
                    } else {
                        if (H[P] !== i) {
                            H[P] = [ H[P], J ];
                        } else {
                            H[P] = J;
                        }
                    }
                }
            } else {
                if (P) {
                    H[P] = F ? i : "";
                }
            }
        });
        return H;
    };
    function z(H, F, G) {
        if (F === i || typeof F === "boolean") {
            G = F;
            F = a[H ? D : A]();
        } else {
            F = E(F) ? F.replace(H ? w : x, "") : F;
        }
        return l(F, G);
    }
    l[A] = B(z, 0);
    l[D] = v = B(z, 1);
    $[y] || ($[y] = function(F) {
        return $.extend(C, F);
    })({
        a: k,
        base: k,
        iframe: t,
        img: t,
        input: t,
        form: "action",
        link: k,
        script: t
    });
    j = $[y];
    function s(I, G, H, F) {
        if (!E(H) && typeof H !== "object") {
            F = H;
            H = G;
            G = i;
        }
        return this.each(function() {
            var L = $(this), J = G || j()[(this.nodeName || "").toLowerCase()] || "", K = J && L.attr(J) || "";
            L.attr(J, a[I](K, H, F));
        });
    }
    $.fn[A] = B(s, A);
    $.fn[D] = B(s, D);
    b.pushState = q = function(I, F) {
        if (E(I) && /^#/.test(I) && F === i) {
            F = 2;
        }
        var H = I !== i, G = c(p[g][k], H ? I : {}, H ? F : 2);
        p[g][k] = G + (/#/.test(G) ? "" : "#");
    };
    b.getState = u = function(F, G) {
        return F === i || typeof F === "boolean" ? v(F) : v(G)[F];
    };
    b.removeState = function(F) {
        var G = {};
        if (F !== i) {
            G = u();
            $.each($.isArray(F) ? F : arguments, function(I, H) {
                delete G[H];
            });
        }
        q(G, 2);
    };
    e[d] = $.extend(e[d], {
        add: function(F) {
            var H;
            function G(J) {
                var I = J[D] = c();
                J.getState = function(K, L) {
                    return K === i || typeof K === "boolean" ? l(I, K) : l(I, L)[K];
                };
                H.apply(this, arguments);
            }
            if ($.isFunction(F)) {
                H = F;
                return G;
            } else {
                H = F.handler;
                F.handler = G;
            }
        }
    });
})(jQuery, this);

(function($, i, b) {
    var j, k = $.event.special, c = "location", d = "hashchange", l = "href", f = $.browser, g = document.documentMode, h = f.msie && (g === b || g < 8), e = "on" + d in i && !h;
    function a(m) {
        m = m || i[c][l];
        return m.replace(/^[^#]*#?(.*)$/, "$1");
    }
    $[d + "Delay"] = 100;
    k[d] = $.extend(k[d], {
        setup: function() {
            if (e) {
                return false;
            }
            $(j.start);
        },
        teardown: function() {
            if (e) {
                return false;
            }
            $(j.stop);
        }
    });
    j = function() {
        var m = {}, r, n, o, q;
        function p() {
            o = q = function(s) {
                return s;
            };
            if (h) {
                n = $('<iframe src="javascript:0"/>').hide().insertAfter("body")[0].contentWindow;
                q = function() {
                    return a(n.document[c][l]);
                };
                o = function(u, s) {
                    if (u !== s) {
                        var t = n.document;
                        t.open().close();
                        t[c].hash = "#" + u;
                    }
                };
                o(a());
            }
        }
        m.start = function() {
            if (r) {
                return;
            }
            var t = a();
            o || p();
            (function s() {
                var v = a(), u = q(t);
                if (v !== t) {
                    o(t = v, u);
                    $(i).trigger(d);
                } else {
                    if (u !== t) {
                        i[c][l] = i[c][l].replace(/#.*/, "") + "#" + u;
                    }
                }
                r = setTimeout(s, $[d + "Delay"]);
            })();
        };
        m.stop = function() {
            if (!n) {
                r && clearTimeout(r);
                r = 0;
            }
        };
        return m;
    }();
})(jQuery, this);

(function($) {
    var a = $("<b/>");
    $.subscribe = function(b, c) {
        function d() {
            return c.apply(this, Array.prototype.slice.call(arguments, 1));
        }
        d.guid = c.guid = c.guid || ($.guid ? $.guid++ : $.event.guid++);
        a.bind(b, d);
    };
    $.unsubscribe = function() {
        a.unbind.apply(a, arguments);
    };
    $.publish = function() {
        a.trigger.apply(a, arguments);
    };
})(jQuery);

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

var J = jQuery.noConflict();

var Zotero = {
    ajax: {},
    callbacks: {},
    ui: {
        callbacks: {}
    },
    url: {},
    utils: {},
    offline: {},
    temp: {},
    localizations: {},
    config: {
        librarySettings: {},
        baseApiUrl: "https://apidev.zotero.org",
        baseWebsiteUrl: "https://test.zotero.net",
        baseFeedUrl: "https://apidev.zotero.org",
        baseZoteroWebsiteUrl: "https://www.zotero.org",
        baseDownloadUrl: "https://www.zotero.org",
        proxyPath: "/proxyrequest",
        ignoreLoggedInStatus: false,
        storePrefsRemote: true,
        sessionAuth: false,
        proxy: true,
        apiKey: "",
        ajax: 1,
        locale: "en-US",
        cacheStoreType: "localStorage",
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
        if (typeof console == "undefined") {
            return;
        }
        if (typeof level !== "number") {
            level = 1;
        }
        if (Zotero.prefs.debug_log && level <= Zotero.prefs.debug_level) {
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
    defaultPrefs: {
        debug_level: 1,
        debug_log: true,
        debug_mock: false
    },
    prefs: {},
    state: {},
    libraries: {},
    validator: {
        patterns: {
            itemKey: /^.+$/,
            collectionKey: /^([A-Z0-9]{8,})|trash$/,
            libraryID: /^[0-9]+$/,
            libraryType: /^(user|group|)$/,
            target: /^(items?|collections?|tags|children)$/,
            targetModifier: /^(top|file|file\/view)$/,
            sort: /^(asc|desc)$/,
            start: /^[0-9]*$/,
            limit: /^[0-9]*$/,
            order: /^\S*$/,
            content: /^(json|html|csljson|bib|none)$/,
            q: /^.*$/,
            fq: /^\S*$/,
            itemType: /^\S*$/,
            locale: /^\S*$/,
            tag: /^.*$/,
            tagType: /^(0|1)$/,
            key: /^\S*/,
            format: /^(atom|bib|keys|bibtex|bookmarks|mods|refer|rdf_bibliontology|rdf_dc|rdf_zotero|ris|wikipedia)$/,
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
        if (Zotero._logEnabled > 0) {
            Zotero.prefs.debug_log = true;
        }
    },
    disableLogging: function() {
        Zotero._logEnabled--;
        if (Zotero._logEnabled <= 0) {
            Zotero._logEnabled = 0;
            Zotero.prefs.debug_log = false;
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
        Zotero.prefs = J.extend({}, Zotero.defaultPrefs, Zotero.prefs, Zotero.utils.getStoredPrefs());
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

Zotero.PrefManager = function(store) {
    this.store = store;
};

Zotero.PrefManager.prototype.setPref = function(key, val) {
    var prefs = this.store["userpreferences"];
    if (typeof prefs === "undefined") {
        prefs = {};
    }
    prefs[key] = val;
    this.store["userpreferences"] = prefs;
};

Zotero.PrefManager.prototype.setPrefs = function(prefs) {
    if (typeof prefs != "object") {
        throw "Preferences must be an object";
    }
    this.store["userpreferences"] = prefs;
};

Zotero.PrefManager.prototype.getPrefs = function() {
    var prefs = this.store["userpreferences"];
    if (typeof prefs === "undefined") {
        return {};
    }
    return prefs;
};

Zotero.PrefManager.prototype.getPref = function(key) {
    var prefs = this.store["userpreferences"];
    if (typeof prefs === "undefined") {
        return null;
    }
    return prefs["key"];
};

Zotero.apiRequest = function(url, method, body, headers) {
    Z.debug("Zotero.apiRequest", 3);
    if (typeof method == "undefined") {
        method = "GET";
    }
    if (typeof headers == "undefined") {
        headers = {};
    }
    var settings = {
        type: method,
        headers: headers,
        cache: false,
        error: Zotero.ajax.errorCallback
    };
    if (typeof body != "undefined") {
        settings["data"] = body;
    }
    var jqxhr = J.ajax(Zotero.ajax.proxyWrapper(url, method), settings);
    return jqxhr;
};

Zotero.error = function(e) {
    Z.debug("====================Zotero Error", 1);
    Z.debug(e, 1);
};

Zotero.saveLibrary = function(library) {
    var dump = {};
    dump.libraryType = library.libraryType;
    dump.libraryID = library.libraryID;
    dump.libraryUrlIdentifier = library.libraryUrlIdentifier;
    dump.itemKeys = library.itemKeys;
    dump.collections = library.collections.dump();
    dump.items = library.items.dump();
    dump.tags = library.tags.dump();
    Zotero.cache.save({
        libraryString: library.libraryString
    }, dump);
};

Zotero.loadLibrary = function(params) {
    Z.debug("Zotero.loadLibrary");
    Z.debug(params);
    var dump = Zotero.cache.load(params);
    if (dump === null) {
        Z.debug("no library found in cache");
        return false;
    }
    var library = new Zotero.Library(dump.libraryType, dump.libraryID, dump.libraryUrlIdentifier);
    library.itemKeys = dump.itemKeys;
    library.collections.loadDump(dump.collections);
    library.items.loadDump(dump.items);
    library.tags.loadDump(dump.tags);
    return library;
};

var Z = Zotero;

Zotero.ajax.error = function(event, request, settings, exception) {
    Z.debug("Exception: " + exception);
};

Zotero.ajax.errorCallback = function(jqxhr, textStatus, errorThrown) {
    Z.debug("ajax error callback");
    Z.debug("textStatus: " + textStatus);
    Z.debug("errorThrown: ");
    Z.debug(errorThrown);
    Z.debug(jqxhr);
};

Zotero.ajax.activeRequests = [];

Zotero.ajax.apiRequestUrl = function(params) {
    J.each(params, function(key, val) {
        if (typeof val == "string") {
            val = val.split("#", 1);
            params[key] = val[0];
        }
        if (Zotero.validator.validate(val, key) === false) {
            Zotero.warn("API argument failed validation: " + key + " cannot be " + val);
            Zotero.warn(params);
            console.trace();
            delete params[key];
        }
    });
    if (!params.target) throw "No target defined for api request";
    if (!(params.libraryType == "user" || params.libraryType == "group" || params.libraryType === "")) throw "Unexpected libraryType for api request " + JSON.stringify(params);
    if (params.libraryType && !params.libraryID) throw "No libraryID defined for api request";
    var base = Zotero.config.baseApiUrl;
    var url;
    if (params.libraryType !== "") {
        url = base + "/" + params.libraryType + "s/" + params.libraryID;
        if (params.collectionKey) {
            if (params.collectionKey == "trash") {
                url += "/items/trash";
                return url;
            } else {
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
      case "collection":
        break;
      case "tags":
        url += "/tags";
        break;
      case "children":
        url += "/items/" + params.itemKey + "/children";
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
    Z.debug("Zotero.ajax.apiQueryString");
    Z.debug(passedParams);
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
    Z.debug(passedParams);
    var queryString = "?";
    var queryParamsArray = [];
    var queryParamOptions = [ "start", "limit", "order", "sort", "content", "format", "q", "fq", "itemType", "itemKey", "locale", "tag", "tagType", "key", "style", "linkMode", "linkwrap", "session" ];
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
    J.each(queryParams, function(index, value) {
        if (value instanceof Array) {
            J.each(value, function(i, v) {
                queryParamsArray.push(encodeURIComponent(index) + "=" + encodeURIComponent(v));
            });
        } else {
            queryParamsArray.push(encodeURIComponent(index) + "=" + encodeURIComponent(value));
        }
    });
    queryString += queryParamsArray.join("&");
    return queryString;
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

Zotero.Feed = function(data) {
    Z.debug("Zotero.Feed", 3);
    if (typeof data == "undefined") {
        this.title = "";
        this.id = "";
        this.totalResults = 0;
        this.apiVersion = "";
        this.links = {};
        this.lastPageStart = null;
        this.lastPage = null;
        this.currentPage = null;
        this.updated = null;
    } else {
        this.parseXmlFeed(data);
    }
};

Zotero.Feed.prototype.parseXmlFeed = function(data) {
    var fel = J(data).find("feed");
    this.title = fel.children("title").first().text();
    this.id = fel.children("id").first().text();
    this.totalResults = fel.find("zapi\\:totalResults").first().text();
    this.apiVersion = fel.find("zapi\\:apiVersion").first().text();
    if (this.totalResults === "") {
        this.totalResults = fel.find("totalResults").first().text();
        this.apiVersion = fel.find("apiVersion").first().text();
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
    Z.debug(libraryUrlIdentifier, 4);
    this.instance = "Zotero.Library";
    this._apiKey = apiKey || false;
    this.libraryBaseWebsiteUrl = Zotero.config.baseWebsiteUrl + "/";
    if (this.libraryType == "group") {
        this.libraryBaseWebsiteUrl += "groups/";
    }
    this.libraryBaseWebsiteUrl += libraryUrlIdentifier + "/items";
    this.items = new Zotero.Items;
    this.items.owningLibrary = this;
    this.itemKeys = [];
    this.collections = new Zotero.Collections;
    this.collections.libraryUrlIdentifier = this.libraryUrlIdentifier;
    this.collections.owningLibrary = this;
    this.tags = new Zotero.Tags;
    if (!type) {
        return;
    }
    this.type = type;
    this.libraryType = type;
    this.libraryID = libraryID;
    this.libraryString = Zotero.utils.libraryString(this.type, this.libraryID);
    this.libraryUrlIdentifier = libraryUrlIdentifier;
    this.usernames = {};
    this.cachedTags = this.getCachedTags();
    this.dirty = false;
    try {
        this.filestorage = new Zotero.Filestorage;
    } catch (e) {
        Z.debug(e);
        Z.debug("Error creating filestorage");
        this.filestorage = false;
    }
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
    var reqUrl = Zotero.ajax.proxyWrapper(url, type);
    return J.ajax(reqUrl, reqOptions);
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

Zotero.Library.prototype.loadCollections = function(config) {
    Z.debug("Zotero.Library.loadCollections", 3);
    var library = this;
    library.collections.loading = true;
    var deferred = new J.Deferred;
    if (!config) {
        config = {};
    }
    var urlconfig = J.extend(true, {
        target: "collections",
        libraryType: this.type,
        libraryID: this.libraryID,
        content: "json",
        limit: "100"
    }, config);
    var requestUrl = Zotero.ajax.apiRequestUrl(urlconfig) + Zotero.ajax.apiQueryString(urlconfig);
    var callback = J.proxy(function(data, textStatus, XMLHttpRequest) {
        Z.debug("loadCollections proxied callback", 3);
        var library = this;
        var feed = new Zotero.Feed(data);
        feed.requestConfig = urlconfig;
        var collections = library.collections;
        var collectionsAdded = collections.addCollectionsFromFeed(feed);
        for (var i = 0; i < collectionsAdded.length; i++) {
            collectionsAdded[i].associateWithLibrary(library);
        }
        Z.debug("done parsing collections feed.", 3);
        if (feed.links.hasOwnProperty("next")) {
            Z.debug("has next link.", 3);
            var nextLink = feed.links.next;
            var nextLinkConfig = J.deparam(J.param.querystring(nextLink.href));
            var newConfig = J.extend({}, config);
            newConfig.start = nextLinkConfig.start;
            newConfig.limit = nextLinkConfig.limit;
            var nextDeferred = this.loadCollections(newConfig);
            nextDeferred.done(J.proxy(function(collections) {
                deferred.resolve(collections);
            }, this));
        } else {
            Z.debug("no next in collections link", 3);
            collections.collectionsArray.sort(collections.sortByTitleCompare);
            J.each(collections.collectionsArray, function(index, obj) {
                if (obj.instance === "Zotero.Collection") {
                    if (obj.nestCollection(collections)) {
                        Z.debug(obj.key + ":" + obj.title + " nested in parent.", 4);
                    }
                }
            });
            collections.assignDepths(0, collections.collectionsArray);
            Z.debug("resolving loadCollections deferred", 3);
            collections.dirty = false;
            collections.loaded = true;
            deferred.resolve(collections);
        }
    }, this);
    if (this.collections.loaded && !this.collections.dirty) {
        Z.debug("already have correct collections loaded", 3);
        deferred.resolve();
        return deferred;
    }
    if (this.collections.loaded && this.collections.dirty) {
        this.collections.collectionsArray = [];
        this.collections.loaded = false;
    }
    var jqxhr = this.fetchCollections(urlconfig);
    jqxhr.done(callback);
    jqxhr.fail(function() {
        deferred.reject.apply(null, arguments);
    }).fail(Zotero.error);
    Zotero.ajax.activeRequests.push(jqxhr);
    deferred.done(function(collections) {
        J.publish("loadCollectionsDone", [ collections ]);
    });
    return deferred;
};

Zotero.Library.prototype.fetchNext = function(feed, config) {
    Z.debug("Zotero.Library.fetchNext", 3);
    if (feed.links.hasOwnProperty("next")) {
        Z.debug("has next link.", 3);
        var nextLink = feed.links.next;
        var nextLinkConfig = J.deparam(J.param.querystring(nextLink.href));
        var newConfig = J.extend({}, config);
        newConfig.start = nextLinkConfig.start;
        newConfig.limit = nextLinkConfig.limit;
        var requestUrl = Zotero.ajax.apiRequestUrl(newConfig) + Zotero.ajax.apiQueryString(newConfig);
        var nextPromise = Zotero.apiRequest(requestUrl, "GET");
        return nextPromise;
    } else {
        return false;
    }
};

Zotero.Library.prototype.fetchCollections = function(config) {
    Z.debug("Zotero.Library.fetchCollections", 3);
    var library = this;
    if (!config) {
        config = {};
    }
    var urlconfig = J.extend(true, {
        target: "collections",
        libraryType: this.type,
        libraryID: this.libraryID,
        content: "json",
        limit: "100"
    }, config);
    var requestUrl = Zotero.ajax.apiRequestUrl(urlconfig) + Zotero.ajax.apiQueryString(urlconfig);
    var d = Zotero.apiRequest(requestUrl, "GET");
    return d;
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
    var requestUrl = Zotero.ajax.apiRequestUrl(urlconfig) + Zotero.ajax.apiQueryString(urlconfig);
    var jqxhr = library.ajaxRequest(requestUrl);
    return jqxhr;
};

Zotero.Library.prototype.loadItemKeys = function(config) {
    Z.debug("Zotero.Library.loadItemKeys", 3);
    var library = this;
    var jqxhr = this.fetchItemKeys(config);
    var callback = J.proxy(function(data, textStatus, XMLHttpRequest) {
        Z.debug("loadItemKeys proxied callback", 3);
        var library = this;
        var result = data;
        var keys = result.split(/[\s]+/);
        library.itemKeys = keys;
    }, this);
    jqxhr.done(callback);
    jqxhr.fail(function() {
        deferred.reject.apply(null, arguments);
    });
    Zotero.ajax.activeRequests.push(jqxhr);
    return jqxhr;
};

Zotero.Library.prototype.loadItems = function(config) {
    Z.debug("Zotero.Library.loadItems", 3);
    Z.debug(config);
    var library = this;
    if (!config) {
        config = {};
    }
    var deferred = new J.Deferred;
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
        libraryType: library.type,
        libraryID: library.libraryID
    }, newConfig);
    var requestUrl = Zotero.ajax.apiRequestUrl(urlconfig) + Zotero.ajax.apiQueryString(urlconfig);
    var callback = J.proxy(function(data, textStatus, XMLHttpRequest) {
        Z.debug("loadItems proxied callback", 3);
        var jFeedOb = J(data);
        var itemfeed = new Zotero.Feed(data);
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
        deferred.resolve({
            itemsArray: loadedItemsArray,
            feed: itemfeed,
            library: library
        });
    }, this);
    Z.debug("displayItemsUrl:" + this.items.displayItemsUrl, 4);
    Z.debug("requestUrl:" + requestUrl, 4);
    if (this.items.displayItemsUrl == requestUrl && !this.dirty) {
        deferred.resolve({
            itemsArray: this.items.displayItemsArray,
            feed: this.items.displayItemsFeed,
            library: library
        });
        return deferred;
    } else {
        var jqxhr = library.ajaxRequest(requestUrl);
        jqxhr.done(callback);
        jqxhr.fail(function() {
            deferred.reject.apply(null, arguments);
        }).fail(Zotero.error);
        Zotero.ajax.activeRequests.push(jqxhr);
    }
    deferred.done(function(itemsArray, feed, library) {
        Z.debug("loadItemsDone about to publish");
        J.publish("loadItemsDone", [ itemsArray, feed, library ]);
    });
    return deferred;
};

Zotero.Library.prototype.loadItemsSimple = function(config) {
    Z.debug("Zotero.Library.loadItems", 3);
    Z.debug(config);
    var library = this;
    if (!config) {
        config = {};
    }
    var deferred = new J.Deferred;
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
        libraryType: this.type,
        libraryID: this.libraryID
    }, newConfig);
    var requestUrl = Zotero.ajax.apiRequestUrl(urlconfig) + Zotero.ajax.apiQueryString(urlconfig);
    Z.debug("loadItems requestUrl:");
    Z.debug(requestUrl);
    var callback = J.proxy(function(data, textStatus, XMLHttpRequest) {
        Z.debug("loadItems proxied callback", 3);
        var library = this;
        var jFeedOb = J(data);
        var itemfeed = new Zotero.Feed(data);
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
        deferred.resolve({
            itemsArray: loadedItemsArray,
            feed: itemfeed,
            library: library
        });
    }, this);
    var jqxhr = library.ajaxRequest(requestUrl);
    jqxhr.done(callback);
    jqxhr.fail(function() {
        deferred.reject.apply(null, arguments);
    }).fail(Zotero.error);
    Zotero.ajax.activeRequests.push(jqxhr);
    deferred.done(function(itemsArray, feed, library) {
        Z.debug("loadItemsDone about to publish");
        J.publish("loadItemsDone", [ itemsArray, feed, library ]);
    });
    return deferred;
};

Zotero.Library.prototype.loadItem = function(itemKey) {
    Z.debug("Zotero.Library.loadItem", 3);
    if (!config) {
        var config = {
            content: "json"
        };
    }
    var deferred = new J.Deferred;
    var urlconfig = {
        target: "item",
        libraryType: this.type,
        libraryID: this.libraryID,
        itemKey: itemKey,
        content: "json"
    };
    var requestUrl = Zotero.ajax.apiRequestUrl(urlconfig) + Zotero.ajax.apiQueryString(urlconfig);
    var library = this;
    var callback = J.proxy(function(data, textStatus, XMLHttpRequest) {
        var resultOb = J(data);
        var entry = J(data).find("entry").eq(0);
        var item = new Zotero.Item;
        item.libraryType = this.type;
        item.libraryID = this.libraryID;
        item.parseXmlItem(entry);
        item.owningLibrary = library;
        this.items.itemObjects[item.itemKey] = item;
        deferred.resolve(item);
    }, this);
    var jqxhr = library.ajaxRequest(requestUrl);
    jqxhr.done(callback);
    jqxhr.fail(function() {
        deferred.reject.apply(null, arguments);
    }).fail(Zotero.error);
    Zotero.ajax.activeRequests.push(jqxhr);
    deferred.done(function(item) {
        J.publish("loadItemDone", [ item ]);
    });
    return deferred;
};

Zotero.Library.prototype.loadFullBib = function(itemKeys, style) {
    var itemKeyString = itemKeys.join(",");
    var deferred = new J.Deferred;
    var urlconfig = {
        target: "items",
        libraryType: this.type,
        libraryID: this.libraryID,
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
    var requestUrl = Zotero.ajax.apiRequestUrl(urlconfig) + Zotero.ajax.apiQueryString(urlconfig);
    var library = this;
    var callback = J.proxy(function(data, textStatus, XMLHttpRequest) {
        var bib = data;
        deferred.resolve(data);
    }, this);
    var jqxhr = library.ajaxRequest(requestUrl);
    jqxhr.done(callback);
    jqxhr.fail(function() {
        deferred.reject.apply(null, arguments);
    }).fail(Zotero.error);
    Zotero.ajax.activeRequests.push(jqxhr);
    deferred.done(function(item) {
        J.publish("loadItemBibDone", [ item ]);
    });
    return deferred;
};

Zotero.Library.prototype.loadItemBib = function(itemKey, style) {
    Z.debug("Zotero.Library.loadItem", 3);
    var deferred = new J.Deferred;
    var urlconfig = {
        target: "item",
        libraryType: this.type,
        libraryID: this.libraryID,
        itemKey: itemKey,
        content: "bib"
    };
    if (style) {
        urlconfig["style"] = style;
    }
    var requestUrl = Zotero.ajax.apiRequestUrl(urlconfig) + Zotero.ajax.apiQueryString(urlconfig);
    var library = this;
    var callback = J.proxy(function(data, textStatus, XMLHttpRequest) {
        var resultOb = J(data);
        var entry = J(data).find("entry").eq(0);
        var item = new Zotero.Item;
        item.parseXmlItem(entry);
        var bibContent = item.bibContent;
        deferred.resolve(bibContent);
    }, this);
    var jqxhr = library.ajaxRequest(requestUrl);
    jqxhr.done(callback);
    jqxhr.fail(function() {
        deferred.reject.apply(null, arguments);
    }).fail(Zotero.error);
    Zotero.ajax.activeRequests.push(jqxhr);
    deferred.done(function(item) {
        J.publish("loadItemBibDone", [ item ]);
    });
    return deferred;
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
        libraryType: this.type,
        libraryID: this.libraryID
    }, newConfig);
    var requestUrl = Zotero.ajax.apiRequestUrl(urlconfig) + Zotero.ajax.apiQueryString(urlconfig);
    var jqxhr = library.ajaxRequest(requestUrl);
    return jqxhr;
};

Zotero.Library.prototype.loadTags = function(config) {
    Z.debug("Zotero.Library.loadTags", 3);
    Z.debug("passed in config:", 4);
    Z.debug(config, 4);
    var library = this;
    var deferred = new J.Deferred;
    if (typeof config == "undefined") {
        config = {};
    }
    if (config.showAllTags && config.collectionKey) {
        delete config.collectionKey;
    }
    var callback = J.proxy(function(data, textStatus, XMLHttpRequest) {
        Z.debug("loadTags proxied callback", 3);
        var tagsfeed = new Zotero.Feed(data);
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
        Z.debug("resolving loadTags deferred", 3);
        deferred.resolve(library.tags);
    }, this);
    library.tags.displayTagsArray = [];
    var jqxhr = this.fetchTags(config);
    jqxhr.done(callback);
    jqxhr.fail(function() {
        deferred.reject.apply(null, arguments);
    });
    Zotero.ajax.activeRequests.push(jqxhr);
    return deferred;
};

Zotero.Library.prototype.getCachedTags = function() {
    var tagsCacheParams = {
        libraryType: this.libraryType,
        libraryID: this.libraryID,
        target: "alltags"
    };
    var cachedTags = Zotero.cache.load(tagsCacheParams);
    return cachedTags;
};

Zotero.Library.prototype.loadAllTags = function(config, checkCached) {
    Z.debug("Zotero.Library.loadAllTags", 3);
    if (typeof checkCached == "undefined") {
        checkCached = true;
    }
    if (!config) {
        config = {};
    }
    var deferred = new J.Deferred;
    var defaultConfig = {
        target: "tags",
        content: "json",
        order: "title",
        sort: "asc",
        limit: 100
    };
    var newConfig = J.extend({}, defaultConfig, config);
    var urlconfig = J.extend({
        target: "tags",
        libraryType: this.type,
        libraryID: this.libraryID
    }, newConfig);
    var requestUrl = Zotero.ajax.apiRequestUrl(urlconfig) + Zotero.ajax.apiQueryString(urlconfig);
    var library = this;
    var tags = library.tags;
    var loadedConfig = J.extend({
        target: "tags",
        libraryType: this.type,
        libraryID: this.libraryID
    }, defaultConfig, tags.loadedConfig);
    var loadedConfigRequestUrl = tags.loadedRequestUrl;
    Z.debug("requestUrl: " + requestUrl, 4);
    Z.debug("loadedConfigRequestUrl: " + loadedConfigRequestUrl, 4);
    if (tags.loaded && loadedConfigRequestUrl == requestUrl && checkCached) {
        Z.debug("tags already loaded - publishing and resolving deferred", 3);
        deferred.resolve(tags);
        return deferred;
    } else {
        Z.debug("tags not loaded", 3);
        tags.clear();
        Z.debug("in loadAllTags: tags:", 3);
        Z.debug(tags, 4);
    }
    var continueLoadingCallback = J.proxy(function(tags) {
        Z.debug("loadAllTags continueLoadingCallback", 3);
        var plainList = Zotero.Tags.prototype.plainTagsList(tags.tagsArray);
        plainList.sort(Zotero.Library.prototype.sortLower);
        tags.plainList = plainList;
        Z.debug("done parsing one tags feed - checking for more.", 3);
        J.publish("tags_page_loaded", [ tags ]);
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
            var nextDeferred = library.loadTags(newConfig);
            Zotero.ajax.activeRequests.push(nextDeferred);
            nextDeferred.done(continueLoadingCallback);
        } else {
            Z.debug("no next in tags link", 3);
            tags.tagsArray.sort(library.sortByTitleCompare);
            plainList = Zotero.Tags.prototype.plainTagsList(tags.tagsArray);
            plainList.sort(Zotero.Library.prototype.sortLower);
            tags.plainList = plainList;
            Z.debug("resolving loadTags deferred", 3);
            library.tagsLoaded = true;
            library.tags.loaded = true;
            tags.loadedConfig = config;
            tags.loadedRequestUrl = requestUrl;
            deferred.resolve(tags);
        }
    }, this);
    var cacheConfig = {
        libraryType: library.libraryType,
        libraryID: library.libraryID,
        target: "alltags"
    };
    var alltagsObjects = Zotero.cache.load(cacheConfig);
    if (alltagsObjects !== null && checkCached) {
        library.tags.tagObjects = alltagsObjects;
        J.each(alltagsObjects, function(key, val) {
            library.tags.tagsArray.push(val);
        });
        tags.tagsArray.sort(library.sortByTitleCompare);
        var plainList = Zotero.Tags.prototype.plainTagsList(tags.tagsArray);
        plainList.sort(Zotero.Library.prototype.sortLower);
        tags.plainList = plainList;
        Z.debug("resolving loadTags deferred", 3);
        library.tagsLoaded = true;
        library.tags.loaded = true;
        tags.loadedConfig = config;
        tags.loadedRequestUrl = requestUrl;
        deferred.resolve(tags);
    } else {
        var lDeferred = library.loadTags(urlconfig);
        Zotero.ajax.activeRequests.push(lDeferred);
        lDeferred.done(continueLoadingCallback);
    }
    deferred.done(J.proxy(function() {
        var library = this;
        var cacheConfig = {
            libraryType: library.libraryType,
            libraryID: library.libraryID,
            target: "alltags"
        };
        Zotero.cache.save(cacheConfig, tags.tagObjects);
    }, this));
    return deferred;
};

Zotero.Library.prototype.parseFeedObject = function(data) {
    Z.debug("Zotero.Library.parseFeedObject", 3);
    var feed;
    if (typeof data == "string") {
        feed = JSON.parse(data);
    } else if (typeof data == "object") {
        feed = data;
    } else {
        return false;
    }
    var t = new Date;
    t.setTime(Date.parse(feed.updated));
    feed.updated = t;
    return feed;
};

Zotero.Library.prototype.addCollection = function(name, parent) {
    var library = this;
    var config = {
        target: "collections",
        libraryType: this.type,
        libraryID: this.libraryID
    };
    var requestUrl = Zotero.ajax.apiRequestUrl(config) + Zotero.ajax.apiQueryString(config);
    var requestData = JSON.stringify({
        name: name,
        parent: parent
    });
    var jqxhr = library.ajaxRequest(requestUrl, "POST", {
        data: requestData,
        processData: false
    });
    jqxhr.done(J.proxy(function() {
        this.collections.dirty = true;
    }, this));
    jqxhr.fail(Zotero.error);
    Zotero.ajax.activeRequests.push(jqxhr);
    return jqxhr;
};

Zotero.Library.prototype.trashItem = function(itemKey) {
    Z.debug("Zotero.Library.trashItem", 3);
    if (!itemKey) return false;
    var item = this.items.getItem(itemKey);
    item.apiObj.deleted = 1;
    return item.writeItem();
};

Zotero.Library.prototype.untrashItem = function(itemKey) {
    Z.debug("Zotero.Library.untrashItem", 3);
    if (!itemKey) return false;
    var item = this.items.getItem(itemKey);
    item.apiObj.deleted = 0;
    return item.writeItem();
};

Zotero.Library.prototype.deleteItem = function(itemKey) {
    Z.debug("Zotero.Library.trashItem", 3);
    if (!itemKey) return false;
    var library = this;
    var config = {
        target: "item",
        libraryType: this.type,
        libraryID: this.libraryID,
        itemKey: itemKey
    };
    var requestUrl = Zotero.ajax.apiRequestUrl(config) + Zotero.ajax.apiQueryString(config);
    var item = this.items.getItem(itemKey);
    var etag = item.etag;
    var jqxhr = library.ajaxRequest(requestUrl, "DELETE", {
        type: "DELETE",
        processData: false,
        headers: {
            "If-Match": etag
        }
    });
    Zotero.ajax.activeRequests.push(jqxhr);
    return jqxhr;
};

Zotero.Library.prototype.addNote = function(itemKey, note) {
    Z.debug("Zotero.Library.prototype.addNote", 3);
    var library = this;
    var config = {
        target: "children",
        libraryType: this.type,
        libraryID: this.libraryID,
        itemKey: itemKey
    };
    var requestUrl = Zotero.ajax.apiRequestUrl(config) + Zotero.ajax.apiQueryString(config);
    var item = this.items.getItem(itemKey);
    var jqxhr = library.ajaxRequest(requestUrl, "POST", {
        processData: false
    });
    Zotero.ajax.activeRequests.push(jqxhr);
    return jqxhr;
};

Zotero.Library.prototype.fetchGlobalItems = function(config) {
    Z.debug("Zotero.Library.fetchGlobalItems", 3);
    Z.debug(config);
    var library = this;
    if (!config) {
        config = {};
    }
    var deferred = new J.Deferred;
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
    var requestUrl = Zotero.ajax.apiRequestUrl(urlconfig) + Zotero.ajax.apiQueryString(urlconfig);
    Z.debug("fetchGlobalItems requestUrl:");
    Z.debug(requestUrl);
    var callback = J.proxy(function(data, textStatus, XMLHttpRequest) {
        Z.debug("loadItems proxied callback", 3);
        Zotero.temp.globalItemsResponse = data;
        deferred.resolve(data);
    }, this);
    var jqxhr = library.ajaxRequest(requestUrl, "GET", {
        dataType: "json"
    });
    jqxhr.done(callback);
    jqxhr.fail(function() {
        deferred.reject.apply(null, arguments);
    }).fail(Zotero.error);
    Zotero.ajax.activeRequests.push(jqxhr);
    deferred.done(function(globalItems) {
        Z.debug("fetchGlobalItemsDone about to publish");
        J.publish("fetchGlobalItemsDone", globalItems);
    });
    return deferred;
};

Zotero.Library.prototype.fetchGlobalItem = function(globalKey) {
    Z.debug("Zotero.Library.fetchGlobalItem", 3);
    Z.debug(globalKey);
    var library = this;
    var deferred = new J.Deferred;
    var defaultConfig = {
        target: "item"
    };
    var newConfig = J.extend({}, defaultConfig);
    var urlconfig = J.extend({
        target: "item",
        libraryType: "",
        itemKey: globalKey
    }, newConfig);
    var requestUrl = Zotero.ajax.apiRequestUrl(urlconfig) + Zotero.ajax.apiQueryString(urlconfig);
    Z.debug("fetchGlobalItem requestUrl:");
    Z.debug(requestUrl);
    var callback = J.proxy(function(data, textStatus, XMLHttpRequest) {
        Z.debug("loadItems proxied callback", 3);
        Zotero.temp.fetchGlobalItemResponse = data;
        deferred.resolve(data);
    }, this);
    var jqxhr = library.ajaxRequest(requestUrl, "GET", {
        dataType: "json"
    });
    jqxhr.done(callback);
    jqxhr.fail(function() {
        deferred.reject.apply(null, arguments);
    }).fail(Zotero.error);
    Zotero.ajax.activeRequests.push(jqxhr);
    deferred.done(function(globalItem) {
        Z.debug("fetchGlobalItemDone about to publish");
        J.publish("fetchGlobalItemDone", globalItem);
    });
    return deferred;
};

Zotero.Library.prototype.fetchUserNames = function(userIDs) {
    Z.debug("Zotero.Library.fetchUserNames", 3);
    var library = this;
    var reqUrl = Zotero.config.baseZoteroWebsiteUrl + "/api/useraliases?userID=" + userIDs.join(",");
    var jqxhr = J.getJSON(reqUrl, J.proxy(function(data, textStatus, jqXHR) {
        Z.debug("fetchNames returned");
        Z.debug(JSON.stringify(data));
        Z.debug("userNames:");
        Z.debug(this.usernames);
        J.each(data, function(userID, aliases) {
            Z.debug("userID: " + userID + " alias:");
            Z.debug(aliases);
            library.usernames[userID] = aliases;
        });
    }, this));
    return jqxhr;
};

Zotero.Library.prototype.fetchItemKeysModified = function() {
    return this.fetchItemKeys({
        order: "dateModified"
    });
};

Zotero.Library.prototype.loadCachedItems = function() {
    Z.debug("Zotero.Library.loadCachedItems", 3);
    var library = this;
    var cacheConfig = {
        libraryType: library.libraryType,
        libraryID: library.libraryID,
        target: "allitems"
    };
    var allitemsObjects = Zotero.cache.load(cacheConfig);
    var itemsCount;
    if (allitemsObjects !== null) {
        Z.debug("Apparently have allItemObjects - loadingDump");
        library.items.loadDump(allitemsObjects);
        return allitemsObjects.itemsArray.length;
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

Zotero.Library.prototype.loadItemsFromKeysParallel = function(keys) {
    Zotero.debug("Zotero.Library.loadItemsFromKeysParallel", 3);
    var library = this;
    var keyslices = [];
    while (keys.length > 0) {
        keyslices.push(keys.splice(0, 50));
    }
    var deferred = new J.Deferred;
    var xhrs = [];
    J.each(keyslices, function(ind, keyslice) {
        var keystring = keyslice.join(",");
        xhrs.push(library.loadItemsSimple({
            targetModifier: null,
            itemKey: keystring,
            limit: 50
        }));
    });
    Z.debug("loadItems XHRs to be resolved:");
    Z.debug(xhrs);
    J.when.apply(null, xhrs).then(J.proxy(function() {
        Z.debug("All parallel item requests returned - resolving deferred and publishing loadItemsFromKeysParallelDone", 3);
        deferred.resolve(true);
        J.publish("loadItemsFromKeysParallelDone");
    }, this));
    return deferred;
};

Zotero.Library.prototype.loadCachedCollections = function() {
    Z.debug("Zotero.Library.loadCachedCollections", 3);
    var library = this;
    var cacheConfig = {
        libraryType: library.libraryType,
        libraryID: library.libraryID,
        target: "allcollections"
    };
    var allcollectionObjects = Zotero.cache.load(cacheConfig);
    if (allcollectionObjects !== null) {
        Z.debug("Apparently have allcollectionObjects - loadingDump");
        library.collections.loadDump(allcollectionObjects);
        return true;
    } else {
        return false;
    }
};

Zotero.Library.prototype.loadCollectionMembership = function(collections) {
    Z.debug("Zotero.Library.loadCollectionMembership", 3);
    var library = this;
    var deferred = new J.Deferred;
    var neededCollections = [];
    for (var i = 0; i < collections.length; i++) {
        if (collections[i].itemKeys === false) {
            neededCollections.push(collections[i]);
        }
    }
    var loadNextCollectionMembers = function() {
        var col = neededCollections.shift();
        if (typeof col == "undefined") {
            deferred.resolve();
            return;
        } else {
            var d = col.getMemberItemKeys();
            d.done(J.proxy(function() {
                loadNextCollectionMembers();
            }, this));
        }
    };
    loadNextCollectionMembers();
    return deferred;
};

Zotero.Library.prototype.loadItemTemplates = function() {};

Zotero.Library.prototype.loadCreatorTypes = function() {};

Zotero.Library.prototype.findOutdatedItems = function(itemKeys) {};

Zotero.Library.prototype.findMissingItems = function(itemKeys) {
    var library = this;
    var missingKeys = [];
    J.each(itemKeys, function(ind, val) {
        if (!(val in library.items.itemObjects) && val !== "") {
            missingKeys.push(val);
        }
    });
    return missingKeys;
};

Zotero.Library.prototype.loadModifiedItems = function(itemKeys) {
    Z.debug("Zotero.Library.loadModifiedItems", 3);
    var library = this;
    var missingKeys = library.findMissingItems(itemKeys);
    var needCheckingKeys = [];
    var localEtags = {};
    var item;
    var keepChecking = true;
    var loadModifiedItemsDeferred = new J.Deferred;
    Z.debug("removing missingKeys from list of items we need to check");
    J.each(itemKeys, function(ind, val) {
        if (J.inArray(val, missingKeys) == -1) {
            needCheckingKeys.push(val);
            item = library.items.getItem(val);
            localEtags[val] = item.etag;
        } else {}
    });
    Z.debug("needCheckingKeys has " + needCheckingKeys.length + " keys");
    Z.debug(localEtags);
    var mostRecentItemKey = needCheckingKeys.shift();
    needCheckingSlices = [];
    while (needCheckingKeys.length > 0) {
        needCheckingSlices.push(needCheckingKeys.splice(0, 50));
    }
    var checkNextSlice = function() {
        Zotero.debug("checkNextSlice", 3);
        var nextSlice = needCheckingSlices.shift();
        var keyString = nextSlice.join(",");
        var nextSliceDeferred = library.loadItems({
            targetModifier: null,
            itemKey: keyString,
            limit: 50
        });
        nextSliceDeferred.done(J.proxy(function(freshItems) {
            J.each(freshItems.itemsArray, function(ind, val) {
                var ikey = val.itemKey;
                if (localEtags[ikey] == val.etag) {
                    Z.debug("Found local item that was up to date - stop checking", 3);
                    keepChecking = false;
                    loadModifiedItemsDeferred.resolve(true);
                    return false;
                }
            });
            if (keepChecking) {
                checkNextSlice();
            }
        }, this));
    };
    Z.debug("First itemKey to check - " + mostRecentItemKey, 3);
    var itemDeferred = library.loadItem(mostRecentItemKey);
    itemDeferred.done(J.proxy(function(fetchedItem) {
        Z.debug("Got first item back");
        if (fetchedItem.etag == localEtags[fetchedItem.itemKey]) {
            Z.debug("local and remote etags match on first item", 3);
            J.publish("localItemsUpToDate");
            loadModifiedItemsDeferred.resolve(true);
        } else {
            Z.debug("local and remote etags do not match on first item - pulling down slices", 3);
            if (needCheckingSlices.length > 0) {
                checkNextSlice();
            } else {
                Z.debug("Something wrong. Should need to check for items, but no slices to check");
            }
        }
    }, this));
    return loadModifiedItemsDeferred;
};

Zotero.Library.prototype.loadModifiedCollections = function(itemKeys) {
    Z.debug("Zotero.Library.loadModifiedCollections", 3);
    var library = this;
};

Zotero.Library.prototype.loadModifiedTags = function(itemKeys) {
    Z.debug("Zotero.Library.loadModifiedTags", 3);
    var library = this;
};

Zotero.Library.prototype.buildItemDisplayView = function(params) {
    Z.debug("Zotero.Library.buildItemDisplayView", 3);
    Z.debug(params);
    var library = this;
    var itemKeys;
    if (params.collectionKey) {
        var collection = library.collections.getCollection(params.collectionKey);
        if (collection === false) {
            Z.error("specified collectionKey - " + params.collectionKey + " - not found in current library.");
            return false;
        }
        if (collection.itemKeys === false) {
            var d = collection.getMemberItemKeys();
            d.done(J.proxy(library.buildItemDisplayView, this));
            return false;
        } else {
            itemKeys = collection.itemKeys;
        }
    } else {
        itemKeys = library.itemKeys;
    }
    library.items.displayItemsArray = [];
    var item;
    J.each(itemKeys, function(ind, val) {
        item = library.items.getItem(val);
        if (item && !item.parentKey) {
            library.items.displayItemsArray.push(item);
        }
    });
    Z.debug("Starting with " + library.items.displayItemsArray.length + " items displayed");
    var selectedTags = params.tag || [];
    if (typeof selectedTags == "string") selectedTags = [ selectedTags ];
    var tagFilteredArray = J.grep(library.items.displayItemsArray, J.proxy(function(item, index) {
        var itemTags = item.apiObj.tags;
        var found = false;
        for (var i = 0; i < selectedTags.length; i++) {
            found = false;
            for (var j = 0; j < itemTags.length; j++) {
                if (itemTags[j].tag == selectedTags[i]) {
                    found = true;
                }
            }
            if (found === false) return false;
        }
        return true;
    }, this));
    library.items.displayItemsArray = tagFilteredArray;
    Z.debug("Filtered by tags");
    Z.debug("Down to " + library.items.displayItemsArray.length + " items displayed");
    Z.debug("Sorting by title");
    var orderCol = params["order"] || "title";
    var sort = params["sort"] || "asc";
    library.items.displayItemsArray.sort(J.proxy(function(a, b) {
        var aval = a.get(orderCol);
        var bval = b.get(orderCol);
        if (typeof aval == "string") {
            return aval.localeCompare(bval);
        } else {
            return aval - bval;
        }
    }, this));
    if (sort == "desc") {
        library.items.displayItemsArray.reverse();
    }
    Z.debug("publishing displayedItemsUpdated");
    J.publish("displayedItemsUpdated");
};

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
                            console.log(e);
                        }
                    }, this));
                }
            } catch (e) {
                Z.debug("Caught inside binary xhr onload");
                console.log(e);
            }
        };
        xhr.send();
        return deferred;
    } catch (e) {
        Z.debug("Caught in Z.Library.saveFileOffline");
        console.log(e);
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
        d.done(J.proxy(function(localItemKeys) {
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

Zotero.Entry = function() {
    this.instance = "Zotero.Entry";
};

Zotero.Entry.prototype.dumpEntry = function() {
    var dump = {};
    var dataProperties = [ "title", "author", "id", "published", "dateAdded", "updated", "dateModified", "links" ];
    for (var i = 0; i < dataProperties.length; i++) {
        dump[dataProperties[i]] = this[dataProperties[i]];
    }
    return dump;
};

Zotero.Entry.prototype.loadDumpEntry = function(dump) {
    var dataProperties = [ "title", "author", "id", "published", "dateAdded", "updated", "dateModified", "links" ];
    for (var i = 0; i < dataProperties.length; i++) {
        this[dataProperties[i]] = dump[dataProperties[i]];
    }
    return this;
};

Zotero.Entry.prototype.dump = Zotero.Entry.prototype.dumpEntry;

Zotero.Entry.prototype.parseXmlEntry = function(eel) {
    Z.debug("Zotero.Entry.parseXmlEntry", 4);
    this.title = eel.children("title").text();
    this.author = {};
    this.author["name"] = eel.children("author").children("name").text();
    this.author["uri"] = eel.children("author").children("uri").text();
    this.id = eel.children("id").first().text();
    this.published = eel.children("published").text();
    this.dateAdded = this.published;
    this.updated = eel.children("updated").text();
    this.dateModified = this.updated;
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
    this.links = links;
};

Zotero.Entry.prototype.associateWithLibrary = function(library) {
    this.libraryUrlIdentifier = library.libraryUrlIdentifier;
    this.libraryType = library.libraryType;
    this.libraryID = library.libraryID;
    this.owningLibrary = library;
    return this;
};

Zotero.Collections = function(feed) {
    var collections = this;
    this.instance = "Zotero.Collections";
    this.collectionsArray = [];
    this.dirty = false;
    this.loaded = false;
    if (typeof feed == "undefined") {
        return;
    } else {
        this.addCollectionsFromFeed(feed);
    }
};

Zotero.Collections.prototype.dump = function() {
    var dump = {};
    dump.instance = "Zotero.Collections";
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
    this.dirty = dump.dirty;
    this.loaded = dump.loaded;
    for (var i = 0; i < dump.collectionsArray.length; i++) {
        var collection = new Zotero.Collection;
        collection.loadDump(dump.collectionsArray[i]);
        this.addCollection(collection);
    }
    this.collectionsArray.sort(this.sortByTitleCompare);
    J.each(this.collectionsArray, function(index, obj) {
        if (obj.instance === "Zotero.Collection") {
            if (obj.nestCollection(collections)) {
                Z.debug(obj.key + ":" + obj.title + " nested in parent.", 4);
            }
        }
    });
    this.assignDepths(0, this.collectionsArray);
    return this;
};

Zotero.Collections.prototype.addCollection = function(collection) {
    this.collectionsArray.push(collection);
    this[collection.key] = collection;
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
    if (a.title.toLowerCase() == b.title.toLowerCase()) {
        return 0;
    }
    if (a.title.toLowerCase() < b.title.toLowerCase()) {
        return -1;
    }
    return 1;
};

Zotero.Collections.prototype.assignDepths = function(depth, cArray) {
    Z.debug("Zotero.Collections.assignDepths", 3);
    var insertchildren = function(depth, children) {
        J.each(children, function(index, col) {
            col.nestingDepth = depth;
            if (col.hasChildren) {
                insertchildren(depth + 1, col.entries);
            }
        });
    };
    J.each(this.collectionsArray, function(index, collection) {
        if (collection.topLevel) {
            collection.nestingDepth = 1;
            if (collection.hasChildren) {
                insertchildren(2, collection.entries);
            }
        }
    });
};

Zotero.Collections.prototype.nestedOrderingArray = function() {
    Z.debug("Zotero.Collections.nestedOrderingArray", 3);
    var nested = [];
    var insertchildren = function(a, children) {
        J.each(children, function(index, col) {
            a.push(col);
            if (col.hasChildren) {
                insertchildren(a, col.entries);
            }
        });
    };
    J.each(this.collectionsArray, function(index, collection) {
        if (collection.topLevel) {
            nested.push(collection);
            if (collection.hasChildren) {
                insertchildren(nested, collection.entries);
            }
        }
    });
    Z.debug("Done with nestedOrderingArray", 3);
    return nested;
};

Zotero.Collections.prototype.loadDataObjects = function(collectionsArray) {
    Z.debug("Zotero.Collections.loadDataObjects", 3);
    var library = this.owningLibrary;
    var collections = this;
    J.each(collectionsArray, function(index, dataObject) {
        var collectionKey = dataObject["collectionKey"];
        var collection = new Zotero.Collection;
        collection.loadObject(dataObject);
        collection.libraryUrlIdentifier = collections.libraryUrlIdentifier;
        collection.libraryType = library.type;
        collection.libraryID = library.libraryID;
        collection.owningLibrary = library;
        library.collections[collection.collectionKey] = collection;
        library.collections.collectionsArray.push(collection);
    });
    collections.collectionsArray.sort(collections.sortByTitleCompare);
    J.each(collections.collectionsArray, function(index, obj) {
        if (obj.instance === "Zotero.Collection") {
            if (obj.nestCollection(collections)) {
                Z.debug(obj.key + ":" + obj.title + " nested in parent.", 4);
            }
        }
    });
    collections.assignDepths(0, collections.collectionsArray);
    return collections;
};

Zotero.Collections.prototype.getCollection = function(key) {
    if (this.hasOwnProperty(key)) {
        return this[key];
    } else {
        return false;
    }
};

Zotero.Items = function(feed) {
    this.displayItemsArray = [];
    this.displayItemsUrl = "";
    this.itemObjects = {};
    this.unsyncedItemObjects = {};
    if (typeof feed != "undefined") {
        this.addItemsFromFeed(feed);
    }
};

Zotero.Items.prototype.dump = function() {
    var dump = {};
    dump.instance = "Zotero.Items.dump";
    dump.itemsArray = [];
    J.each(this.itemObjects, function(key, val) {
        dump.itemsArray.push(val.dump());
    });
    return dump;
};

Zotero.Items.prototype.loadDump = function(dump) {
    Z.debug("-------------------------------Zotero.Items.loadDump", 3);
    var items = this;
    var itemKeys = [];
    for (var i = 0; i < dump.itemsArray.length; i++) {
        var item = new Zotero.Item;
        item.loadDump(dump.itemsArray[i]);
        this.addItem(item);
        itemKeys.push(item.itemKey);
    }
    if (this.owningLibrary) {
        this.owningLibrary.itemKeys = itemKeys;
    }
    Z.debug("Adding childItemKeys to items loaded from dump");
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

Zotero.Tags = function(feed) {
    this.displayTagsArray = [];
    this.displayTagsUrl = "";
    this.tagObjects = {};
    this.tagsArray = [];
    if (typeof feed != "undefined") {
        this.addTagsFromFeed(feed);
    }
};

Zotero.Tags.prototype.dump = function() {
    var dump = {};
    dump.tagsArray = [];
    for (var i = 0; i < this.tagsArray.length; i++) {
        dump.tagsArray.push(this.tagsArray[i].dump());
    }
    dump.displayTagsUrl = this.displayTagsUrl;
    return dump;
};

Zotero.Tags.prototype.loadDump = function(dump) {
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

Zotero.Collection = function(entryEl) {
    this.instance = "Zotero.Collection";
    this.libraryUrlIdentifier = "";
    this.itemKeys = false;
    if (typeof entryEl != "undefined") {
        this.parseXmlCollection(entryEl);
    }
};

Zotero.Collection.prototype = new Zotero.Entry;

Zotero.Collection.prototype.instance = "Zotero.Collection";

Zotero.Collection.prototype.dump = function() {
    var dump = this.dumpEntry();
    var dataProperties = [ "collectionKey", "key", "numItems", "numCollections", "name", "parent", "topLevel", "websiteCollectionLink", "hasChildren", "etag", "itemKeys" ];
    for (var i = 0; i < dataProperties.length; i++) {
        dump[dataProperties[i]] = this[dataProperties[i]];
    }
    return dump;
};

Zotero.Collection.prototype.loadDump = function(dump) {
    this.loadDumpEntry(dump);
    var dataProperties = [ "collectionKey", "key", "numItems", "numCollections", "name", "parent", "topLevel", "websiteCollectionLink", "hasChildren", "etag", "itemKeys" ];
    for (var i = 0; i < dataProperties.length; i++) {
        this[dataProperties[i]] = dump[dataProperties[i]];
    }
    return this;
};

Zotero.Collection.prototype.loadObject = function(ob) {
    this.collectionKey = ob.collectionKey;
    this.dateAdded = ob.dateAdded;
    this.dateModified = ob.dateUpdated;
    this.key = this.collectionKey;
    this["links"] = ob["links"];
    this["title"] = ob["title"];
    this["name"] = ob["title"];
    this.parentCollectionKey = ob.parentCollectionKey;
    this.parent = ob.parentCollectionKey;
    this.childKeys = ob.childKeys;
    this.topLevel = true;
};

Zotero.Collection.prototype.parseXmlCollection = function(cel) {
    this.parseXmlEntry(cel);
    this.collectionKey = cel.find("zapi\\:key, key").text();
    this.numItems = parseInt(cel.find("zapi\\:numItems, numItems").text(), 10);
    this.numCollections = parseInt(cel.find("zapi\\:numCollections, numCollections").text(), 10);
    this.key = this.collectionKey;
    this["name"] = cel.find("title").text();
    this.dateAdded = this.published;
    this.dateModified = this.updated;
    var linksArray = [];
    cel.find("link").each(function(index, element) {
        var link = J(element);
        linksArray.push({
            rel: link.attr("rel"),
            type: link.attr("type"),
            href: link.attr("href")
        });
    });
    this.parent = null;
    this.topLevel = true;
    var collection = this;
    this.websiteCollectionLink = Zotero.config.baseWebsiteUrl + "/" + this.libraryUrlIdentifier + "/items/collection/" + this.collectionKey;
    this.hasChildren = this.numCollections ? true : false;
    var contentEl = cel.find("content");
    var j = JSON.parse(cel.find("content").first().text());
    this["name"] = j["name"];
    this["parent"] = j["parent"];
    if (this["parent"]) {
        this.topLevel = false;
    }
    this.etag = contentEl.attr("zapi:etag");
};

Zotero.Collection.prototype.parseJsonXmlCollection = function(cel) {
    this.parseXmlCollection(cel);
    var j = JSON.parse(cel.find("content").text());
    this["name"] = j["name"];
    this.parent = j.parent;
    if (this.parent) {
        this.topLevel = false;
    }
    this.etag = cel.find("content").attr("zapi:etag");
};

Zotero.Collection.prototype.nestCollection = function(collectionList) {
    Z.debug("Zotero.Collection.nestCollection", 4);
    if (this.parent !== null) {
        var parentKey = this.parent;
        if (typeof collectionList[parentKey] !== "undefined") {
            Z.debug("Pushing " + this.key + "(" + this.title + ") onto entries of parent " + parentKey + "(" + collectionList[parentKey].title + ")", 4);
            var parentOb = collectionList[parentKey];
            if (typeof parentOb.entries === "undefined") {
                parentOb.entries = [ this ];
            } else {
                parentOb.entries.push(this);
            }
            parentOb.hasChildren = true;
            this.topLevel = false;
            return true;
        }
    }
    return false;
};

Zotero.Collection.prototype.addItems = function(itemKeys) {
    Z.debug("Zotero.Collection.addItems", 3);
    Z.debug(itemKeys, 3);
    var config = {
        target: "items",
        libraryType: this.libraryType,
        libraryID: this.libraryID,
        collectionKey: this.collectionKey,
        content: "json"
    };
    var requestUrl = Zotero.ajax.apiRequestUrl(config) + Zotero.ajax.apiQueryString(config);
    var requestData = itemKeys.join(" ");
    var jqxhr = J.ajax(Zotero.ajax.proxyWrapper(requestUrl, "POST"), {
        data: requestData,
        type: "POST",
        processData: false,
        headers: {},
        cache: false,
        error: Zotero.ajax.errorCallback
    });
    Zotero.ajax.activeRequests.push(jqxhr);
    return jqxhr;
};

Zotero.Collection.prototype.getMemberItemKeys = function() {
    Z.debug("Zotero.Collection.getMemberItemKeys", 3);
    Z.debug("Current Collection: " + this.collectionKey, 3);
    Z.debug(this.itemKeys, 3);
    var config = {
        target: "items",
        libraryType: this.libraryType,
        libraryID: this.libraryID,
        collectionKey: this.collectionKey,
        format: "keys"
    };
    var requestUrl = Zotero.ajax.apiRequestUrl(config) + Zotero.ajax.apiQueryString(config);
    var deferred = new J.Deferred;
    var jqxhr = J.ajax(Zotero.ajax.proxyWrapper(requestUrl, "GET"), {
        type: "GET",
        processData: false,
        headers: {},
        cache: false,
        error: Zotero.ajax.errorCallback
    });
    jqxhr.done(J.proxy(function(data, textStatus, XMLHttpRequest) {
        Z.debug("getMemberItemKeys proxied callback", 3);
        var c = this;
        var result = data;
        var keys = J.trim(result).split(/[\s]+/);
        c.itemKeys = keys;
        deferred.resolve(keys);
    }, this));
    Zotero.ajax.activeRequests.push(jqxhr);
    return deferred;
};

Zotero.Collection.prototype.removeItem = function(itemKey) {
    var config = {
        target: "item",
        libraryType: this.libraryType,
        libraryID: this.libraryID,
        collectionKey: this.collectionKey,
        itemKey: itemKey
    };
    var requestUrl = Zotero.ajax.apiRequestUrl(config) + Zotero.ajax.apiQueryString(config);
    var jqxhr = J.ajax(Zotero.ajax.proxyWrapper(requestUrl, "DELETE"), {
        type: "DELETE",
        processData: false,
        headers: {},
        cache: false,
        error: Zotero.ajax.errorCallback
    });
    Zotero.ajax.activeRequests.push(jqxhr);
    return jqxhr;
};

Zotero.Collection.prototype.update = function(name, parentKey) {
    if (!parentKey) parentKey = false;
    var config = {
        target: "collection",
        libraryType: this.libraryType,
        libraryID: this.libraryID,
        collectionKey: this.key
    };
    var requestUrl = Zotero.ajax.apiRequestUrl(config) + Zotero.ajax.apiQueryString(config);
    var requestData = JSON.stringify({
        name: name,
        parent: parentKey
    });
    var jqxhr = J.ajax(Zotero.ajax.proxyWrapper(requestUrl, "PUT"), {
        data: requestData,
        type: "PUT",
        processData: false,
        headers: {
            "If-Match": this.etag
        },
        cache: false,
        error: Zotero.ajax.errorCallback
    });
    Zotero.ajax.activeRequests.push(jqxhr);
    return jqxhr;
};

Zotero.Collection.prototype.remove = function() {
    Z.debug("Zotero.Collection.delete", 3);
    var config = {
        target: "collection",
        libraryType: this.libraryType,
        libraryID: this.libraryID,
        collectionKey: this.key
    };
    var requestUrl = Zotero.ajax.apiRequestUrl(config) + Zotero.ajax.apiQueryString(config);
    var jqxhr = J.ajax(Zotero.ajax.proxyWrapper(requestUrl, "DELETE"), {
        type: "DELETE",
        processData: false,
        headers: {
            "If-Match": this.etag
        },
        cache: false,
        error: Zotero.ajax.errorCallback
    });
    Zotero.ajax.activeRequests.push(jqxhr);
    return jqxhr;
};

Zotero.Item = function(entryEl) {
    this.instance = "Zotero.Item";
    this.apiObj = {};
    this.dataFields = {};
    this.childItemKeys = [];
    if (typeof entryEl != "undefined") {
        this.parseXmlItem(entryEl);
    }
};

Zotero.Item.prototype = new Zotero.Entry;

Zotero.Item.prototype.dump = function() {
    var dump = this.dumpEntry();
    var dataProperties = [ "itemKey", "itemType", "creatorSummary", "year", "numChildren", "numTags", "parentKey", "etag", "contentRows", "apiObj", "mimeType", "translatedMimeType", "linkMode", "attachmentDownloadLink" ];
    for (var i = 0; i < dataProperties.length; i++) {
        dump[dataProperties[i]] = this[dataProperties[i]];
    }
    return dump;
};

Zotero.Item.prototype.loadDump = function(dump) {
    this.loadDumpEntry(dump);
    var dataProperties = [ "itemKey", "itemType", "creatorSummary", "year", "numChildren", "numTags", "parentKey", "etag", "contentRows", "apiObj", "mimeType", "translatedMimeType", "linkMode", "attachmentDownloadLink" ];
    for (var i = 0; i < dataProperties.length; i++) {
        this[dataProperties[i]] = dump[dataProperties[i]];
    }
    return this;
};

Zotero.Item.prototype.loadObject = function(ob) {
    Z.debug("Zotero.Item.loadObject", 3);
    if (typeof ob === "string") {
        ob = JSON.parse(ob);
    }
    this.title = ob.title;
    this.itemKey = ob.itemKey;
    this.itemType = ob.itemType;
    this.creatorSummary = ob.creatorSummary;
    this.numChildren = ob.numChildren;
    this.numTags = ob.numTags;
    this.creators = ob.creators;
    this.createdByUserID = ob.createdByUserID;
    this.lastModifiedByUserID = ob.lastModifiedByUserID;
    this.note = ob.note;
    this.linkMode = ob.linkMode;
    this.mimeType = ob.mimeType;
    this.links = ob.links;
    this.apiObj = ob.apiObject;
    this.dateAdded = ob.dateAdded;
    this.published = this.dateAdded;
    this.dateModified = ob.dateModified;
    this.updated = this.dateModified;
};

Zotero.Item.prototype.parseXmlItem = function(iel) {
    this.parseXmlEntry(iel);
    this.itemKey = iel.find("zapi\\:key, key").text();
    this.itemType = iel.find("zapi\\:itemType, itemType").text();
    this.creatorSummary = iel.find("zapi\\:creatorSummary, creatorSummary").text();
    this.year = iel.find("zapi\\:year, year").text();
    this.numChildren = parseInt(iel.find("zapi\\:numChildren, numChildren").text(), 10);
    this.numTags = parseInt(iel.find("zapi\\:numTags, numChildren").text(), 10);
    if (isNaN(this.numChildren)) {
        this.numChildren = 0;
    }
    this.parentKey = false;
    if (this.links["up"]) {
        var parentLink = this.links["up"]["href"];
        var re = new RegExp("items/([A-Z0-9]{8})");
        this.parentKey = re.exec(parentLink)[1];
    }
    var contentEl = iel.children("content");
    var subcontents = iel.find("zapi\\:subcontent, subcontent");
    if (subcontents.size() > 0) {
        for (var i = 0; i < subcontents.size(); i++) {
            var sc = J(subcontents.get(i));
            this.parseContentBlock(sc);
        }
    } else {
        this.parseContentBlock(contentEl);
    }
};

Zotero.Item.prototype.parseContentBlock = function(contentEl) {
    if (contentEl.attr("type") == "application/json" || contentEl.attr("type") == "json" || contentEl.attr("zapi:type") == "json") {
        this.itemContentType = "json";
        this.parseJsonItemContent(contentEl);
    } else if (contentEl.attr("zapi:type") == "bib") {
        this.itemContentType = "bib";
        this.bibContent = contentEl.text();
        this.parsedBibContent = true;
    } else if (contentEl.attr("type") == "xhtml") {
        this.itemContentType = "xhtml";
        this.parseXmlItemContent(contentEl);
    } else {
        this.itemContentType = "other";
    }
};

Zotero.Item.prototype.parseXmlItemContent = function(cel) {
    var contentRows = [];
    var dataFields = {};
    cel.find("div > table").children("tr").each(function() {
        contentRows.push({
            field: J(this).attr("class"),
            fieldMapped: J(this).children("th").text(),
            fieldValue: J(this).children("td").text()
        });
    });
    this.contentRows = contentRows;
    J.each(contentRows, function(index, value) {
        dataFields[value.field] = value.fieldValue;
    });
    this.dataFields = dataFields;
};

Zotero.Item.prototype.parseJsonItemContent = function(cel) {
    this.etag = cel.attr("zapi:etag");
    var dataFields = JSON.parse(cel.text());
    var contentRows = [];
    var item = this;
    J.each(dataFields, function(index, value) {
        if (index == "tags") {
            item.tags = value;
        } else if (index == "creators") {
            item.creators = value;
        } else if (index == "attachments") {
            item.attachments = value;
        } else {
            contentRows.push({
                field: index,
                fieldMapped: item.fieldMap[index],
                fieldValue: value
            });
            item.dataFields[index] = value;
        }
    });
    this.contentRows = contentRows;
    this.apiObj = dataFields;
    if (this.dataFields["itemType"] == "attachment") {
        this.mimeType = this.dataFields["contentType"];
        this.translatedMimeType = Zotero.utils.translateMimeType(this.mimeType);
    }
    if (this.dataFields.hasOwnProperty("linkMode")) {
        this.linkMode = this.dataFields["linkMode"];
    }
    this.attachmentDownloadLink = Zotero.url.attachmentDownloadLink(this);
};

Zotero.Item.prototype.initEmpty = function(itemType, linkMode) {
    this.etag = "";
    var item = this;
    var deferred = new J.Deferred;
    var d = this.getItemTemplate(itemType, linkMode);
    var callback = J.proxy(function(template) {
        this.itemType = template.itemType;
        this.itemKey = "";
        var dataFields = template;
        var contentRows = [];
        J.each(dataFields, function(index, value) {
            if (index == "tags") {
                item.tags = value;
            } else if (index == "creators") {
                item.creators = value;
            } else {
                contentRows.push({
                    field: index,
                    fieldMapped: item.fieldMap[index],
                    fieldValue: value
                });
            }
        });
        this.contentRows = contentRows;
        this.apiObj = dataFields;
        deferred.resolve(item);
    }, this);
    d.done(callback);
    return deferred;
};

Zotero.Item.prototype.writeItem = function() {
    Z.debug("Zotero.Item.writeItem", 3);
    var target = "item";
    var item = this;
    var newItem = true;
    var newChildItem = false;
    var childrenConfig, newChildrenRequestUrl, requestData, jqxhr;
    if (this.itemKey) {
        newItem = false;
    }
    if (newItem && this.parentItemKey) {
        newChildItem = true;
        target = "children";
    }
    var config = {
        target: target,
        libraryType: this.libraryType,
        libraryID: this.libraryID,
        itemKey: this.itemKey,
        content: "json"
    };
    if (newChildItem) {
        config.itemKey = this.parentItemKey;
    }
    var requestUrl = Zotero.ajax.apiRequestUrl(config) + Zotero.ajax.apiQueryString(config);
    if (!newItem) {
        childrenConfig = {
            target: "children",
            libraryType: this.libraryType,
            libraryID: this.libraryID,
            itemKey: this.itemKey,
            content: "json"
        };
        newChildrenRequestUrl = Zotero.ajax.apiRequestUrl(childrenConfig) + Zotero.ajax.apiQueryString(childrenConfig);
    }
    if (!this.apiObj.hasOwnProperty("creators")) {
        this.apiObj.creators = [];
    }
    if (!this.apiObj.hasOwnProperty("attachments")) {
        this.apiObj.attachments = [];
    }
    var newCreatorsArray = this.apiObj.creators.filter(function(c) {
        if (c.name || c.firstName || c.lastName) {
            return true;
        }
        return false;
    });
    this.apiObj.creators = newCreatorsArray;
    var successCallback = J.proxy(function(data, successcode, jqXhr) {
        Z.debug("writeItem successCallback", 3);
        var entryEl = J(data).find("entry");
        this.parseXmlItem(entryEl);
    }, this);
    var childSuccessCallback = J.proxy(function(data, successcode, jqXhr) {
        Z.debug("writeItem childSuccessCallback", 3);
        if (item.numChildren) {
            item.numChildren++;
        } else {
            item.numChildren = 1;
            J.publish("hasFirstChild", [ item.itemKey ]);
        }
    }, this);
    var writeApiObj = J.extend({}, this.apiObj);
    delete writeApiObj["mimeType"];
    delete writeApiObj["charset"];
    delete writeApiObj["filename"];
    delete writeApiObj["md5"];
    delete writeApiObj["mtime"];
    delete writeApiObj["zip"];
    writeApiObj["attachments"] = [];
    var requests = [];
    if (!newItem) {
        Z.debug("have itemKey, making PUT writeItem request", 3);
        var notes = this.apiObj.notes;
        delete this.apiObj.notes;
        delete writeApiObj.notes;
        delete writeApiObj.attachments;
        requestData = JSON.stringify(writeApiObj);
        jqxhr = J.ajax(Zotero.ajax.proxyWrapper(requestUrl, "PUT"), {
            data: requestData,
            type: "PUT",
            processData: false,
            headers: {
                "If-Match": this.etag,
                "Content-Type": "application/json"
            },
            success: successCallback,
            cache: false,
            error: Zotero.ajax.errorCallback
        });
        requests.push(jqxhr);
        if (J.isArray(notes) && notes.length) {
            Z.debug("have child notes for existing item - making separate requests to create children", 3);
            var noteItemsObj = {
                items: notes
            };
            Z.debug("new child notes on existing item", 3);
            Z.debug(noteItemsObj, 4);
            requestData = JSON.stringify(noteItemsObj);
            jqxhr = J.ajax(Zotero.ajax.proxyWrapper(newChildrenRequestUrl, "POST"), {
                data: requestData,
                type: "POST",
                processData: false,
                headers: {
                    "Content-Type": "application/json"
                },
                success: childSuccessCallback,
                cache: false,
                error: Zotero.ajax.errorCallback
            });
            requests.push(jqxhr);
        }
    } else {
        Z.debug("have no itemKey, making POST writeItem request", 3);
        requestData = JSON.stringify({
            items: [ writeApiObj ]
        });
        jqxhr = J.ajax(Zotero.ajax.proxyWrapper(requestUrl, "POST"), {
            data: requestData,
            type: "POST",
            processData: false,
            headers: {
                "Content-Type": "application/json"
            },
            success: successCallback,
            cache: false,
            error: Zotero.ajax.errorCallback
        });
        requests.push(jqxhr);
    }
    J.each(requests, function() {
        Zotero.ajax.activeRequests.push(this);
    });
    return J.when.apply(J, requests);
};

Zotero.Item.prototype.getChildren = function(library) {
    Z.debug("Zotero.Item.getChildren", 3);
    var deferred = J.Deferred();
    if (!this.numChildren || this.parentKey !== false) {
        deferred.resolve([]);
        return deferred;
    }
    var config = {
        target: "children",
        libraryType: this.libraryType,
        libraryID: this.libraryID,
        itemKey: this.itemKey,
        content: "json"
    };
    var requestUrl = Zotero.ajax.apiRequestUrl(config) + Zotero.ajax.apiQueryString(config);
    var callback = J.proxy(function(data, textStatus, jqxhr) {
        Z.debug("getChildren proxied callback", 4);
        var itemfeed = new Zotero.Feed(data);
        var items = library.items;
        var childItems = items.addItemsFromFeed(itemfeed);
        for (var i = childItems.length - 1; i >= 0; i--) {
            childItems[i].associateWithLibrary(library);
        }
        deferred.resolve(childItems);
    }, this);
    var jqxhr = J.ajax(Zotero.ajax.proxyWrapper(requestUrl, "GET"), {
        type: "GET",
        processData: false,
        headers: {},
        cache: false,
        error: Zotero.ajax.errorCallback
    });
    jqxhr.done(callback);
    jqxhr.fail(function() {
        deferred.reject.apply(null, arguments);
    });
    Zotero.ajax.activeRequests.push(jqxhr);
    return deferred;
};

Zotero.Item.prototype.addToCollection = function(collectionKey) {};

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
    var deferred = new J.Deferred;
    if (typeof itemType == "undefined") itemType = "document";
    if (itemType == "attachment" && typeof linkMode == "undefined") {
        throw "attachment template requested with no linkMode";
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
        deferred.resolve(template);
        return deferred;
    }
    var callback = J.proxy(function(data, textStatus, XMLHttpRequest) {
        Z.debug("got itemTemplate response", 3);
        Z.debug(data, 4);
        Zotero.cache.save(cacheConfig, data);
        deferred.resolve(data);
    }, this);
    J.getJSON(Zotero.ajax.proxyWrapper(requestUrl), {}, callback);
    return deferred;
};

Zotero.Item.prototype.getUploadAuthorization = function(fileinfo, oldmd5) {
    Z.debug("Zotero.Item.getUploadAuthorization", 3);
    var config = {
        target: "item",
        targetModifier: "file",
        libraryType: this.libraryType,
        libraryID: this.libraryID,
        itemKey: this.itemKey
    };
    var fileconfig = J.extend({}, config);
    var requestUrl = Zotero.ajax.apiRequestUrl(config) + Zotero.ajax.apiQueryString(config);
    var headers = {};
    if (oldmd5) {
        headers["If-Match"] = oldmd5;
    } else {
        headers["If-None-Match"] = "*";
    }
    var jqxhr = J.ajax(Zotero.ajax.proxyWrapper(requestUrl, "POST"), {
        type: "POST",
        processData: true,
        data: fileinfo,
        headers: headers,
        cache: false,
        error: Zotero.ajax.errorCallback
    });
    Z.debug("returning jqxhr from getUploadAuthorization", 4);
    return jqxhr;
};

Zotero.Item.prototype.registerUpload = function(uploadKey, oldmd5) {
    Z.debug("Zotero.Item.registerUpload", 3);
    var config = {
        target: "item",
        targetModifier: "file",
        libraryType: this.libraryType,
        libraryID: this.libraryID,
        itemKey: this.itemKey
    };
    var requestUrl = Zotero.ajax.apiRequestUrl(config) + Zotero.ajax.apiQueryString(config);
    if (!oldmd5) {
        headers = {
            "If-None-Match": "*"
        };
    } else {
        headers = {
            "If-Match": oldmd5
        };
    }
    var jqxhr = J.ajax(Zotero.ajax.proxyWrapper(requestUrl, "POST"), {
        type: "POST",
        processData: true,
        data: {
            upload: uploadKey
        },
        headers: headers,
        cache: false
    });
    return jqxhr;
};

Zotero.Item.prototype.fullUpload = function(file) {};

Zotero.Item.prototype.creatorTypes = {};

Zotero.Item.prototype.getCreatorTypes = function(itemType) {
    Z.debug("Zotero.Item.prototype.getCreatorTypes: " + itemType, 3);
    if (!itemType) {
        itemType = "document";
    }
    var deferred = new J.Deferred;
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
        deferred.resolve(Zotero.Item.prototype.creatorTypes[itemType]);
    } else {
        Z.debug("sending request for creatorTypes", 3);
        var query = Zotero.ajax.apiQueryString({
            itemType: itemType
        });
        var requestUrl = Zotero.config.baseApiUrl + "/itemTypeCreatorTypes" + query;
        var callback = J.proxy(function(data, textStatus, XMLHttpRequest) {
            Z.debug("got creatorTypes response", 4);
            Zotero.Item.prototype.creatorTypes[itemType] = data;
            Zotero.cache.save({
                target: "creatorTypes"
            }, Zotero.Item.prototype.creatorTypes);
            deferred.resolve(Zotero.Item.prototype.creatorTypes[itemType]);
        }, this);
        J.getJSON(Zotero.ajax.proxyWrapper(requestUrl), {}, callback);
    }
    return deferred;
};

Zotero.Item.prototype.getCreatorFields = function(locale) {
    Z.debug("Zotero.Item.prototype.getCreatorFields", 3);
    var creatorFields = Zotero.cache.load({
        target: "creatorFields"
    });
    if (creatorFields) {
        Z.debug("have creatorFields in localStorage", 3);
        Zotero.Item.prototype.creatorFields = creatorFields;
        return;
    }
    var requestUrl = Zotero.config.baseApiUrl + "/creatorFields";
    J.getJSON(Zotero.ajax.proxyWrapper(requestUrl), {}, function(data, textStatus, XMLHttpRequest) {
        Z.debug("got itemTypes response", 4);
        Zotero.Item.prototype.creatorFields = data;
        Zotero.cache.save({
            target: "creatorFields"
        }, data);
    });
};

Zotero.Item.prototype.addItemTypes = function(itemTypes, locale) {};

Zotero.Item.prototype.addItemFields = function(itemType, itemFields) {};

Zotero.Item.prototype.addCreatorTypes = function(itemType, creatorTypes) {};

Zotero.Item.prototype.addCreatorFields = function(itemType, creatorFields) {};

Zotero.Item.prototype.addItemTemplates = function(templates) {};

Zotero.Item.prototype.fieldMap = {
    itemType: "Type",
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

Zotero.Item.prototype.itemTypeImageClass = function() {
    var item = this;
    if (item.itemType == "attachment") {
        switch (item.linkMode) {
          case "imported_file":
            if (item.translatedMimeType == "pdf") {
                return this.itemTypeImageSrc["attachmentPdf"];
            }
            return this.itemTypeImageSrc["attachmentFile"];
          case "imported_url":
            if (item.translatedMimeType == "pdf") {
                return this.itemTypeImageSrc["attachmentPdf"];
            }
            return this.itemTypeImageSrc["attachmentSnapshot"];
          case "linked_file":
            return this.itemTypeImageSrc["attachmentLink"];
          case "linked_url":
            return this.itemTypeImageSrc["attachmentWeblink"];
          default:
            return this.itemTypeImageSrc["attachment"];
        }
    } else {
        return item.itemType;
    }
};

Zotero.Item.prototype.get = function(key) {
    if (key == "title") {
        return this.title;
    } else if (key == "creatorSummary") {
        return this.creatorSummary;
    } else if (key in this.apiObj) {
        return this.apiObj[key];
    }
};

Zotero.Tag = function(entry) {
    this.instance = "Zotero.Tag";
    if (typeof entry != "undefined") {
        this.parseXmlTag(entry);
    }
};

Zotero.Tag.prototype = new Zotero.Entry;

Zotero.Tag.prototype.dump = function() {
    var dump = this.dumpEntry();
    var dataProperties = [ "numItems", "urlencodedtag" ];
    for (var i = 0; i < dataProperties.length; i++) {
        dump[dataProperties[i]] = this[dataProperties[i]];
    }
    return dump;
};

Zotero.Tag.prototype.loadDump = function(dump) {
    this.loadDumpEntry(dump);
    var dataProperties = [ "numItems", "urlencodedtag" ];
    for (var i = 0; i < dataProperties.length; i++) {
        this[dataProperties[i]] = dump[dataProperties[i]];
    }
    return this;
};

Zotero.Tag.prototype.loadObject = function(ob) {
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
    this.tag = ob.tag;
};

Zotero.Tag.prototype.parseXmlTag = function(tel) {
    this.parseXmlEntry(tel);
    this.numItems = tel.find("zapi\\:numItems, numItems").text();
    this.urlencodedtag = encodeURIComponent(this.title);
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

Zotero.Group = function() {
    this.instance = "Zotero.Group";
};

Zotero.Group.prototype = new Zotero.Entry;

Zotero.Group.prototype.loadObject = function(ob) {
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

Zotero.Group.prototype.parseXmlGroup = function(gel) {
    this.parseXmlEntry(gel);
    this.numItems = gel.find("zapi\\:numItems, numItems").text();
    var groupEl = gel.find("zxfer\\:group, group");
    if (groupEl.length !== 0) {
        this.groupID = groupEl.attr("id");
        this.ownerID = groupEl.attr("owner");
        this.groupType = groupEl.attr("type");
        this.groupName = groupEl.attr("name");
        this.libraryEnabled = groupEl.attr("libraryEnabled");
        this.libraryEditing = groupEl.attr("libraryEditing");
        this.libraryReading = groupEl.attr("libraryReading");
        this.fileEditing = groupEl.attr("fileEditing");
        this.description = groupEl.find("zxfer\\:description, description").text();
        this.memberIDs = groupEl.find("zxfer\\:members, members").text().split(" ");
        this.adminIDs = groupEl.find("zxfer\\:admins, admins").text().split(" ");
        this.itemIDs = groupEl.find("zxfer\\:items, items").text().split(" ");
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
    setUserPref: function(name, value) {
        Z.debug("Zotero.utils.updateUserPrefs", 3);
        var prefs;
        if (typeof Zotero.store.userpreferences === "undefined") {
            Z.debug("userpreferences not stored yet");
            prefs = {};
            prefs[name] = value;
            Zotero.store.userpreferences = JSON.stringify(prefs);
        } else {
            Z.debug("userpreferences exists already");
            prefs = JSON.parse(Zotero.store.userpreferences);
            prefs[name] = value;
            Zotero.store.userpreferences = JSON.stringify(prefs);
        }
        if (Zotero.config.storePrefsRemote) {
            var postob = {
                varname: name,
                varvalue: value
            };
            var jqxhr = J.get("/user/setuserpref", postob);
            jqxhr.done(J.proxy(function() {
                Z.debug("userpref set:" + name + " : " + value, 3);
            }), this);
            return jqxhr;
        } else {
            return true;
        }
    },
    getStoredPrefs: function() {
        Z.debug("Zotero.utils.getStoredPrefs", 3);
        if (typeof Zotero.store === "undefined" || typeof Zotero.store.userpreferences === "undefined") {
            return {};
        } else {
            return JSON.parse(Zotero.store.userpreferences);
        }
    },
    saveStoredPrefs: function(prefs) {
        Z.debug("Zotero.utils.saveStoredPrefs", 3);
        if (typeof Zotero.store === "undefined") {
            return false;
        } else {
            Zotero.store.userpreferences = JSON.stringify(prefs);
            return true;
        }
    },
    libraryString: function(type, libraryID) {
        var lstring = "";
        if (type == "user") lstring = "u"; else if (type == "group") lstring = "g";
        lstring += libraryID;
        return lstring;
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
    }
};

Zotero.url.itemHref = function(item) {
    var href = "";
    var library = item.owningLibrary;
    href += library.libraryBaseWebsiteUrl + "/itemKey/" + item.itemKey;
    return href;
};

Zotero.url.attachmentDownloadLink = function(item) {
    var retString = "";
    if (item.links["enclosure"]) {
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
            Z.debug(enctype);
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
    if (item.links["enclosure"]) {
        retString = Zotero.config.baseZoteroWebsiteUrl + Zotero.config.nonparsedBaseUrl + "/" + item.itemKey + "/file";
        var tail = item.links["enclosure"]["href"].substr(-4, 4);
        if (tail == "view") {
            retString += "/view";
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
    Z.debug("Zotero.url.exportUrls");
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
    Z.debug(exportUrls);
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

Zotero.file = {};

Zotero.file.getFileInfo = function(file, callback) {
    if (typeof FileReader != "function") {
        throw "FileReader not supported";
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

Zotero.Filestorage = function() {
    Z.debug("Zotero.Filestorage", 3);
    var zfilestorage = this;
    this.filer = new Filer;
    this.fileEntries = {};
    Z.debug("Filer created", 3);
    this.filer.init({
        persistent: true,
        size: 1024 * 1024 * 128
    }, J.proxy(function(fs) {
        Z.debug("Filesystem created");
        zfilestorage.fs = fs;
        zfilestorage.listOfflineFiles();
    }, this));
    Z.debug("returning Zotero.Filestorage");
};

Zotero.Filestorage.prototype.getSavedFile = function(itemKey) {
    Zotero.debug("Zotero.Filestorage.getSavedFile", 3);
    var fstorage = this;
    var filer = fstorage.filer;
    var deferred = new J.Deferred;
    filer.open(fstorage.fileEntries[itemKey], J.proxy(function(file) {
        Z.debut("filer.open callback");
        deferred.resolve(file);
    }, this), this.handleError);
    return deferred;
};

Zotero.Filestorage.prototype.getSavedFileObjectUrl = function(itemKey) {
    Z.debug("Zotero.Filestorage.getSavedFileObjectUrl", 3);
    var fstorage = this;
    var filer = this.filer;
    var objectUrlDeferred = new J.Deferred;
    filer.open(fstorage.fileEntries[itemKey], J.proxy(function(file) {
        Z.debug("filer.open callback");
        objectUrlDeferred.resolve(Util.fileToObjectURL(file));
    }, this), this.handleError);
    return objectUrlDeferred;
};

Zotero.Filestorage.prototype.listOfflineFiles = function() {
    Z.debug("Zotero.Filestorage.listOfflineFiles");
    var fstorage = this;
    var filer = fstorage.filer;
    var fileListDeferred = new J.Deferred;
    filer.ls("/", J.proxy(function(entries) {
        Z.debug(entries);
        Zotero.offlineFilesEntries = entries;
        var itemKeys = [];
        J.each(entries, function(ind, entry) {
            fstorage.fileEntries[entry.name] = entry;
            itemKeys.push(entry.name);
        });
        fileListDeferred.resolve(itemKeys);
    }, this));
    return fileListDeferred;
};

Zotero.Filestorage.prototype.handleError = function(e) {
    Zotero.debug("----------------Filestorage Error encountered", 2);
    Zotero.debug(e, 2);
};

var J = jQuery.noConflict();

jQuery(document).ready(function() {
    Z.debug("*&^*&^*&^*&^*&^*&^*&^*&^*&^ DOM READY *&^*&^*&^*&^*&^*&^*&^*&^*&^", 3);
    Zotero.init();
});

Zotero.defaultPrefs = {
    debug_level: 3,
    debug_log: true,
    debug_mock: false,
    javascript_enabled: false,
    library_listShowFields: [ "title", "creator", "dateModified" ]
};

Zotero.prefs = {};

Zotero.init = function() {
    Z.debug("Zotero init", 3);
    if (Zotero.pages) {
        Zotero.pages.base.init();
    }
    if (undefined !== window.zoterojsClass) {
        try {
            Zotero.pages[zoterojsClass].init();
        } catch (err) {
            Z.debug("Error running page specific init for " + zoterojsClass, 1);
        }
    }
    Zotero.nav.parseUrlVars();
    if (typeof zoteroData == "undefined") {
        zoteroData = {};
    }
    Zotero.loadConfig(zoteroData);
    Zotero.config.startPageTitle = document.title;
    var store;
    if (typeof sessionStorage == "undefined") {
        store = {};
    } else {
        store = sessionStorage;
    }
    Zotero.cache = new Zotero.Cache(store);
    Zotero.store = store;
    Zotero.prefs = J.extend({}, Zotero.defaultPrefs, Zotero.prefs, Zotero.utils.getStoredPrefs());
    var locale = "en-US";
    if (zoteroData.locale) {
        locale = zoteroData.locale;
    }
    var libraryPage = J("body").hasClass("library");
    if (libraryPage) {
        Zotero.config.librarySettings.libraryUserSlug = zoteroData.libraryUserSlug;
        Zotero.config.librarySettings.libraryUserID = zoteroData.libraryUserID;
        Zotero.config.librarySettings.allowEdit = zoteroData.allowEdit;
        if (zoteroData.library_listShowFields) {
            Zotero.prefs.library_listShowFields = zoteroData.library_listShowFields.split(",");
        }
        if (zoteroData.library_showAllTags) {
            Zotero.prefs.library_showAllTags = zoteroData.library_showAllTags;
        }
        if (zoteroData.library_defaultSort || Zotero.prefs.library_defaultSort) {
            var defaultSort;
            if (zoteroData.library_defaultSort) {
                defaultSort = zoteroData.library_defaultSort.split(",");
            } else {
                defaultSort = Zotero.prefs.library_defaultSort.split(",");
            }
            if (defaultSort[0]) {
                Zotero.config.userDefaultApiArgs["order"] = defaultSort[0];
            }
            if (defaultSort[1]) {
                Zotero.config.userDefaultApiArgs["sort"] = defaultSort[1];
            }
            Zotero.config.defaultSortColumn = Zotero.config.userDefaultApiArgs["sort"];
            if (Zotero.config.defaultSortColumn == "undefined") Zotero.config.defaultSortColumn = "title";
        }
        if (Zotero.config.pageClass == "user_library" || Zotero.config.pageClass == "group_library" || Zotero.config.pageClass == "my_library") {
            Zotero.Item.prototype.getItemTypes(locale);
            Zotero.Item.prototype.getItemFields(locale);
            Zotero.Item.prototype.getCreatorFields(locale);
            Zotero.Item.prototype.getCreatorTypes();
        }
    }
    Zotero.ui.init.all();
    J.ajaxSettings.traditional = true;
    if (Zotero.nav.getUrlVar("proxy") == "false") {
        Zotero.config.proxy = false;
    }
    if (Zotero.prefs.server_javascript_enabled === false) {
        Zotero.prefs.javascript_enabled = true;
        document.cookie = "zoterojsenabled=1; expires=; path=/";
    }
    History.Adapter.bind(window, "statechange", function() {
        if (Zotero.nav._ignoreStateChange > 0) {
            Zotero.nav._ignoreStateChange--;
            Zotero.nav.urlAlwaysCallback();
            Z.debug("Statechange ignored " + Zotero.nav._ignoreStateChange, 3);
        } else {
            Zotero.nav.urlChangeCallback();
        }
    });
    Zotero.nav.urlChangeCallback();
};

Zotero.loadConfig = function(config) {
    Zotero.config.userDefaultApiArgs = J.extend({}, Zotero.config.defaultApiArgs);
    Zotero.config.userDefaultApiArgs["limit"] = 25;
    if (config.mobile) {
        Zotero.config.mobile = true;
        Zotero.state.mobilePageFirstLoad = true;
    }
    if (typeof zoterojsClass !== "undefined") {
        Zotero.config.pageClass = zoterojsClass;
    } else {
        Zotero.config.pageClass = "default";
    }
    if (config.itemsPathString) {
        Zotero.config.librarySettings.itemsPathString = config.itemsPathString;
        Zotero.config.nonparsedBaseUrl = config.itemsPathString;
    } else if (config.nonparsedBaseUrl) {
        Zotero.config.nonparsedBaseUrl = config.nonparsedBaseUrl;
    } else {
        Zotero.config.librarySettings.itemsPathString = Zotero.config.baseWebsiteUrl;
        Zotero.config.nonparsedBaseUrl = Zotero.config.baseWebsiteUrl;
    }
    if (config.locale) {
        Zotero.config.locale = config.locale;
    }
    if (typeof Globalize !== "undefined") {
        Globalize.culture(Zotero.config.locale);
    }
    if (config.apiKey) {
        Zotero.config.apiKey = config.apiKey;
    }
    if (config.loggedInUserID) {
        Zotero.config.loggedInUserID = config.loggedInUserID;
        Zotero.config.loggedIn = true;
    } else {
        Zotero.config.loggedIn = false;
    }
};

Zotero.nav = {};

Zotero.nav._ignoreStateChange = 0;

Zotero.nav.urlvars = {
    q: {},
    f: {},
    pathVars: {},
    startUrl: ""
};

Zotero.nav.replacePush = false;

Zotero.nav.startUrl = "";

Zotero.nav.currentHref = "";

Zotero.nav.pushTag = function(newtag) {
    Z.debug("Zotero.nav.pushTag", 3);
    if (Zotero.nav.urlvars.pathVars["tag"]) {
        if (Zotero.nav.urlvars.pathVars["tag"] instanceof Array) {
            Zotero.nav.urlvars.pathVars["tag"].push(newtag);
        } else {
            var currentTag = Zotero.nav.urlvars.pathVars["tag"];
            Zotero.nav.urlvars.pathVars["tag"] = [ currentTag, newtag ];
        }
    } else {
        Zotero.nav.urlvars.pathVars["tag"] = [ newtag ];
    }
    return;
};

Zotero.nav.popTag = function(oldtag) {
    Z.debug("Zotero.nav.popTag", 3);
    if (!Zotero.nav.urlvars.pathVars["tag"]) {
        return;
    } else if (Zotero.nav.urlvars.pathVars["tag"] instanceof Array) {
        var newTagArray = Zotero.nav.urlvars.pathVars["tag"].filter(function(element, index, array) {
            return element != oldtag;
        });
        Zotero.nav.urlvars.pathVars["tag"] = newTagArray;
        return;
    } else if (Zotero.nav.urlvars.pathVars["tag"] == oldtag) {
        Zotero.nav.urlvars.pathVars["tag"] = [];
        return;
    }
};

Zotero.nav.toggleTag = function(tagtitle) {
    Z.debug("Zotero.nav.toggleTag", 3);
    if (!Zotero.nav.urlvars.pathVars["tag"]) {
        Z.debug("Zotero.nav.urlvars.pathVars['tag'] evaluates false");
        Z.debug(Zotero.nav.urlvars.pathVars);
        Zotero.nav.urlvars.pathVars["tag"] = [ tagtitle ];
        return;
    } else if (J.isArray(Zotero.nav.urlvars.pathVars["tag"])) {
        Z.debug("pathVars tag is array");
        if (J.inArray(tagtitle, Zotero.nav.urlvars.pathVars["tag"]) != -1) {
            Z.debug("tag already present, removing", 3);
            var newTagArray = Zotero.nav.urlvars.pathVars["tag"].filter(function(element, index, array) {
                return element != tagtitle;
            });
            Zotero.nav.urlvars.pathVars["tag"] = newTagArray;
            return;
        } else {
            Z.debug("pushing tag", 3);
            Zotero.nav.urlvars.pathVars["tag"].push(tagtitle);
            return;
        }
    } else if (Zotero.nav.urlvars.pathVars["tag"] == tagtitle) {
        Zotero.nav.urlvars.pathVars["tag"] = [];
        return;
    } else if (typeof Zotero.nav.urlvars.pathVars["tag"] == "string") {
        var oldValue = Zotero.nav.urlvars.pathVars["tag"];
        Zotero.nav.urlvars.pathVars["tag"] = [ oldValue, tagtitle ];
        return;
    }
    Z.debug("reached end of toggleTag with no satisfaction");
};

Zotero.nav.unsetUrlVar = function(unset) {
    Z.debug("Zotero.nav.unsetUrlVar", 3);
    var pathVars = Zotero.nav.urlvars.pathVars;
    if (pathVars[unset]) {
        delete pathVars[unset];
    }
};

Zotero.nav.clearUrlVars = function(except) {
    Z.debug("Zotero.nav.clearUrlVars", 3);
    Z.debug(except);
    if (!except) {
        except = [];
    }
    var pathVars = Zotero.nav.urlvars.pathVars;
    J.each(pathVars, function(key, value) {
        if (J.inArray(key, except) == -1) {
            Z.debug(key + " not in except array - deleting from pathVars");
            delete pathVars[key];
        }
    });
};

Zotero.nav.parseUrlVars = function() {
    Z.debug("Zotero.nav.parseUrlVars", 3);
    Zotero.nav.urlvars = {
        q: J.deparam(J.param.querystring()),
        f: Zotero.nav.parseFragmentVars(),
        pathVars: Zotero.nav.parsePathVars()
    };
};

Zotero.nav.parsePathVars = function(pathname) {
    Z.debug("Zotero.nav.parsePathVars", 3);
    if (!pathname) {
        var state = History.getState();
        pathname = state.cleanUrl;
    }
    var basePath = Zotero.config.nonparsedBaseUrl;
    var split_replaced = [];
    var re = new RegExp(".*" + basePath + "/?");
    var replaced = pathname.replace(re, "");
    Z.debug(replaced, 4);
    split_replaced = replaced.split("/");
    Z.debug(split_replaced, 4);
    var pathVars = {};
    for (var i = 0; i < split_replaced.length - 1; i = i + 2) {
        var pathVar = pathVars[split_replaced[i]];
        Z.debug("pathVar: " + pathVar, 4);
        if (pathVar) {
            Z.debug("pathVar already has value", 4);
            if (pathVar instanceof Array) {
                pathVar.push(decodeURIComponent(split_replaced[i + 1]));
            } else {
                var ar = [ pathVar ];
                ar.push(decodeURIComponent(split_replaced[i + 1]));
                pathVar = ar;
            }
        } else {
            Z.debug("pathVar does not have value", 4);
            pathVar = decodeURIComponent(split_replaced[i + 1]);
        }
        pathVars[split_replaced[i]] = pathVar;
    }
    Z.debug(pathVars, 4);
    return pathVars;
};

Zotero.nav.parseFragmentVars = function() {
    var fragmentVars = {};
    var fragment = J.param.fragment();
    var split_fragment = fragment.split("/");
    for (var i = 0; i < split_fragment.length - 1; i = i + 2) {
        fragmentVars[split_fragment[i]] = split_fragment[i + 1];
    }
    return fragmentVars;
};

Zotero.nav.buildUrl = function(urlvars, fragment) {
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

Zotero.nav.mutateUrl = function(addvars, removevars) {
    if (!addvars) {
        addvars = {};
    }
    if (!removevars) {
        removevars = [];
    }
    var urlvars = J.extend({}, Zotero.nav.urlvars.pathVars);
    J.each(addvars, function(key, val) {
        urlvars[key] = val;
    });
    J.each(removevars, function(index, val) {
        delete urlvars[val];
    });
    var url = Zotero.nav.buildUrl(urlvars, false);
    return url;
};

Zotero.nav.pushState = function(force, state) {
    Z.debug("Zotero.nav.pushState", 3);
    var History = window.History;
    Zotero.ui.saveFormData();
    var curState = History.getState();
    curState = curState["data"];
    var s = {};
    if (state) {
        s = state;
    }
    urlvars = Zotero.nav.urlvars.pathVars;
    var url = Zotero.nav.buildUrl(urlvars, false);
    if (Zotero.nav.replacePush === true) {
        Zotero.nav.replacePush = false;
        Zotero.nav.ignoreStateChange();
        History.replaceState(s, Zotero.config.startPageTitle, url);
    } else {
        History.pushState(s, Zotero.config.startPageTitle, url);
    }
    if (force) {
        Zotero.nav.urlChangeCallback({
            type: "popstate",
            originalEvent: {
                state: urlvars
            }
        });
    }
    document.title = Zotero.config.startPageTitle;
    Zotero.debug("leaving pushstate", 3);
};

Zotero.nav.replaceState = function(force, state) {
    Z.debug("Zotero.nav.replaceState", 3);
    Zotero.ui.saveFormData();
    if (typeof force == "undefined") {
        force = false;
    }
    var s = null;
    if (state) {
        s = state;
    }
    urlvars = Zotero.nav.urlvars.pathVars;
    var url = Zotero.nav.buildUrl(urlvars, false);
    Zotero.state.ignoreStatechange = true;
    Zotero.nav.ignoreStateChange();
    History.replaceState(s, null, url);
};

Zotero.nav.updateStateTitle = function(title) {
    Zotero.debug("Zotero.nav.updateStateTitle", 3);
    document.title = title;
};

Zotero.nav.updateStatePageID = function(pageID) {
    Z.debug("Zotero.nav.updateStatePageID " + pageID, 3);
    var curState = History.getState();
    var state = curState.data;
    if (pageID === null || pageID === undefined) {
        pageID = "";
    }
    state["_zpageID"] = pageID;
    History.replaceState(state, curState.title, curState.url);
    Zotero.state.ignoreStatechange = false;
};

Zotero.nav.getUrlVar = function(key) {
    if (Zotero.nav.urlvars.pathVars.hasOwnProperty(key) && Zotero.nav.urlvars.pathVars[key] !== "") {
        return Zotero.nav.urlvars.pathVars[key];
    } else if (Zotero.nav.urlvars.f.hasOwnProperty(key)) {
        return Zotero.nav.urlvars.f[key];
    } else if (Zotero.nav.urlvars.q.hasOwnProperty(key)) {
        return Zotero.nav.urlvars.q[key];
    }
    return undefined;
};

Zotero.nav.setUrlVar = function(key, val) {
    Zotero.nav.urlvars.pathVars[key] = val;
};

Zotero.nav.getUrlVars = function() {
    var params = J.deparam(J.param.querystring());
    return J.extend(true, {}, Zotero.nav.urlvars.pathVars, params, J.deparam(J.param.fragment()));
};

Zotero.nav.setFragmentVar = function(key, val) {
    Zotero.nav.urlvars.f[key] = val;
};

Zotero.nav.setQueryVar = function(key, val) {
    if (val === "") {
        delete Zotero.nav.urlvars.q[key];
    } else {
        Zotero.nav.urlvars.q[key] = val;
    }
};

Zotero.nav.addQueryVar = function(key, val) {
    if (Zotero.nav.urlvars.q.hasOwnProperty(key)) {
        if (J.isArray(Zotero.nav.urlvars.q[key])) {
            Zotero.nav.urlvars.q[key].push(val);
        } else {
            var newArray = [ Zotero.nav.urlvars.q[key], val ];
            Zotero.nav.urlvars.q[key] = newArray;
        }
    } else {
        Zotero.nav.urlvars.q[key] = val;
    }
    return Zotero.nav.urlvars.q[key];
};

Zotero.nav.updateFragment = function(updatedVars) {
    Z.debug("updateFragment", 3);
    J.bbq.pushState(updatedVars, 0);
};

Zotero.nav.urlChangeCallback = function(event, state) {
    Z.debug("////////////////////urlChangeCallback//////////////////", 3);
    Z.debug("new href, updating href and processing urlchange", 3);
    Zotero.nav.currentHref = History.getState().cleanUrl;
    var curStateVars = History.getState().data;
    if (Zotero.config.mobile) {}
    Zotero.nav.parseUrlVars();
    J(".ajaxload").each(function(index, el) {
        Z.debug("ajaxload element found", 3);
        Z.debug(J(el).attr("data-function"), 3);
        var prefunctionName = J(el).data("prefunction");
        if (prefunctionName) {
            Zotero.callbacks[prefunctionName](el);
        }
        if (J(el).data("loading")) {
            J(el).data("queuedWaiting", true);
        } else {
            Zotero.nav.callbackAssignedFunction(el);
        }
    });
    Z.debug("<<<<<<<<<<<<<<<<<<<<<<<<urlChangeCallback Done>>>>>>>>>>>>>>>>>>>>>", 3);
};

Zotero.nav.urlAlwaysCallback = function(el) {
    Z.debug("_____________urlAlwaysCallback________________", 3);
    Zotero.nav.parseUrlVars();
    J(".ajaxload.always").each(function(index, el) {
        try {
            Z.debug("ajaxload element found", 3);
            Z.debug(J(el).attr("data-function"), 3);
            var prefunctionName = J(el).data("prefunction");
            if (prefunctionName) {
                Zotero.callbacks[prefunctionName](el);
            }
            if (J(el).data("loading")) {
                J(el).data("queuedWaiting", true);
            } else {
                Zotero.nav.callbackAssignedFunction(el);
            }
        } catch (e) {
            Z.debug("Couldn't call ajaxload specified function", 1);
            Z.debug(e, 1);
        }
    });
};

Zotero.nav.callbackAssignedFunction = function(el) {
    var functionName = J(el).data("function");
    if (functionName) {
        Zotero.callbacks[functionName](el);
    }
};

Zotero.nav.flagLoading = function(el) {
    J(el).data("loading", true);
};

Zotero.nav.doneLoading = function(el) {
    Z.debug("Zotero.nav.doneLoading", 3);
    J(el).data("loading", false);
    if (J(el).data("queuedWaiting")) {
        J(el).data("queuedWaiting", false);
        Zotero.nav.callbackAssignedFunction(el);
    }
};

Zotero.nav._ignoreTimer = null;

Zotero.nav.ignoreStateChange = function() {
    Z.debug("Zotero.nav.ignoreStateChange", 3);
    if (Zotero.nav._ignoreTimer) {
        window.clearTimeout(Zotero.nav._ignoreTimer);
    }
    Zotero.nav._ignoreStateChange++;
    Z.debug(Zotero.nav._ignoreStateChange, 4);
    Zotero.nav._ignoreTimer = window.setTimeout(function() {
        Z.debug("clear ignoreState semaphore", 3);
        Zotero.nav._ignoreStateChange = 0;
    }, 500);
    return;
};

J("#js-message").ajaxError(Zotero.nav.error);

Zotero.callbacks = {};

Zotero.callbacks.chooseItemPane = function(el) {
    Z.debug("Zotero.callbacks.chooseItemPane", 3);
    var showPane = "list";
    var itemList = J("#library-items-div");
    var itemDetail = J("#item-details-div");
    var itemKey = Zotero.nav.getUrlVar("itemKey");
    Z.debug("showPane itemKey : " + itemKey, 3);
    if (itemKey) {
        showPane = "detail";
    } else if (Zotero.nav.getUrlVar("action") == "newItem") {
        showPane = "detail";
    }
    if (showPane == "detail") {
        Z.debug("item pane displaying detail", 3);
        itemList.hide();
        itemDetail.show();
    } else if (showPane == "list") {
        Z.debug("item pane displaying list", 3);
        itemDetail.hide();
        itemList.show();
    }
    if (Zotero.config.mobile) {
        if (showPane == "detail") {
            J("#items-pane-edit-panel-div").hide();
            J("#filter-guide-div").hide();
        } else if (showPane == "list") {
            J("#items-pane-edit-panel-div").show();
            J("#filter-guide-div").show();
        }
    }
};

Zotero.callbacks.loadLibraryWidget = function(el) {
    Z.debug("Zotero.callbacks.loadLibraryWidget", 3);
    var jel = J(el);
    var library = Zotero.ui.getAssociatedLibrary(el);
    var effectiveUrlVars = [ "itemPage", "tag", "collectionKey", "order", "sort", "q" ];
    var defaultConfig = {
        target: "items",
        targetModifier: "top",
        itemPage: 1,
        limit: 25,
        content: "json"
    };
    var newConfig = J.extend({}, defaultConfig);
    newConfig.start = parseInt(newConfig.limit, 10) * (parseInt(newConfig.itemPage, 10) - 1);
    if (!newConfig.sort) {
        newConfig.sort = Zotero.config.sortOrdering[newConfig.order];
    }
    if (newConfig.tag || newConfig.q) {
        delete newConfig.targetModifier;
    }
    Zotero.ui.showSpinner(el, "horizontal");
    var d = library.loadItems(newConfig);
    d.done(J.proxy(function(loadedItems) {
        J(el).empty();
        Zotero.ui.displayItemsWidget(el, newConfig, loadedItems);
        J("<a href='#' class='home-widget-library-toggle-more-link clickable'>More</a>").appendTo(J(el));
        J(el).find("tr").slice(4).hide();
    }, this));
    d.fail(J.proxy(function(jqxhr, textStatus, errorThrown) {
        var elementMessage = Zotero.ui.ajaxErrorMessage(jqxhr);
        jel.html("<p>" + elementMessage + "</p>");
    }));
};

Zotero.callbacks.rejectIfPending = function(el) {
    var pendingDeferred = J(el).data("pendingDeferred");
    if (pendingDeferred && pendingDeferred.hasOwnProperty("reject")) {
        pendingDeferred.reject();
        J(el).removeData("pendingDeferred");
    }
};

Zotero.callbacks.loadItems = function(el) {
    Z.debug("Zotero.callbacks.loadItems", 3);
    Zotero.callbacks.rejectIfPending(el);
    var jel = J(el);
    var library = Zotero.ui.getAssociatedLibrary(el);
    var effectiveUrlVars = [ "itemPage", "tag", "collectionKey", "order", "sort", "q" ];
    var urlConfigVals = {};
    J.each(effectiveUrlVars, function(index, value) {
        var t = Zotero.nav.getUrlVar(value);
        if (t) {
            urlConfigVals[value] = t;
        }
    });
    var defaultConfig = {
        target: "items",
        targetModifier: "top",
        itemPage: 1,
        limit: 25,
        content: "json"
    };
    var newConfig = J.extend({}, Zotero.config.userDefaultApiArgs, defaultConfig, urlConfigVals);
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
    Zotero.ui.showSpinner(el, "horizontal");
    var d = library.loadItems(newConfig);
    d.done(J.proxy(function(loadedItems) {
        J(el).empty();
        Zotero.ui.displayItemsFull(el, newConfig, loadedItems);
    }, this));
    d.fail(J.proxy(function(jqxhr, textStatus, errorThrown) {
        var elementMessage = Zotero.ui.ajaxErrorMessage(jqxhr);
        jel.html("<p>" + elementMessage + "</p>");
    }));
    jel.data("pendingDeferred", d);
};

Zotero.callbacks.loadItem = function(el) {
    Z.debug("Zotero.callbacks.loadItem", 3);
    Zotero.callbacks.rejectIfPending(el);
    var jel = J(el);
    var library = Zotero.ui.getAssociatedLibrary(el);
    var d;
    Zotero.ui.showSpinner(el);
    if (Zotero.nav.getUrlVar("action") == "newItem") {
        var itemType = Zotero.nav.getUrlVar("itemType");
        if (!itemType) {
            jel.empty();
            J("#itemtypeselectTemplate").tmpl({
                itemTypes: Zotero.localizations.typeMap
            }).appendTo(jel);
            return;
        } else {
            var newItem = new Zotero.Item;
            newItem.libraryType = library.libraryType;
            newItem.libraryID = library.libraryID;
            d = newItem.initEmpty(itemType);
            jel.data("pendingDeferred", d);
            d.done(Zotero.ui.loadNewItemTemplate);
            d.fail(function(jqxhr, textStatus, errorThrown) {
                Zotero.ui.jsNotificationMessage("Error loading item template", "error");
            });
            return;
        }
    }
    var itemKey = Zotero.nav.getUrlVar("itemKey");
    if (!itemKey) {
        return false;
    }
    var item = library.items.getItem(itemKey);
    if (item) {
        Z.debug("have item locally, loading details into ui", 3);
        if (Zotero.nav.getUrlVar("mode") == "edit") {
            Zotero.ui.editItemForm(jel, item);
        } else {
            Zotero.ui.loadItemDetail(item, jel);
            Zotero.ui.showChildren(el, itemKey);
        }
    } else {
        Z.debug("must fetch item from server", 3);
        d = library.loadItem(itemKey);
        jel.data("pendingDeferred", d);
        var config = {
            target: "item",
            libraryType: library.type,
            libraryID: library.libraryID,
            itemKey: itemKey,
            content: "json"
        };
        d.done(J.proxy(function(item) {
            Z.debug("Library.loadItem done", 3);
            jel.empty();
            if (Zotero.nav.getUrlVar("mode") == "edit") {
                Zotero.ui.editItemForm(jel, item);
            } else {
                Zotero.ui.loadItemDetail(item, jel);
                Zotero.ui.showChildren(el, itemKey);
            }
            jel.data("currentconfig", config);
        }, this));
    }
};

Zotero.callbacks.controlPanel = function(el) {
    Z.debug("Zotero.callbacks.controlPanel", 3);
    Zotero.ui.showControlPanel(el);
    Zotero.ui.updateDisabledControlButtons();
};

Zotero.callbacks.loadTags = function(el, checkCached) {
    Z.debug("Zotero.callbacks.loadTags", 3);
    Zotero.nav.flagLoading(el);
    var jel = J(el);
    if (typeof checkCached == "undefined") {
        checkCached = true;
    }
    var library = Zotero.ui.getAssociatedLibrary(el);
    var defaultConfig = {};
    var collectionKey = Zotero.nav.getUrlVar("collectionKey") || jel.attr("data-collectionKey");
    var showAllTags = jel.find("#show-all-tags").filter(":checked").length;
    var selectedTags = Zotero.nav.getUrlVar("tag");
    if (!J.isArray(selectedTags)) {
        if (selectedTags) {
            selectedTags = [ selectedTags ];
        } else {
            selectedTags = [];
        }
    }
    var newConfig;
    if (showAllTags) {
        newConfig = J.extend({}, defaultConfig);
    } else {
        newConfig = J.extend({}, defaultConfig, {
            collectionKey: collectionKey
        });
    }
    Zotero.ui.showSpinner(J(el).find("div.loading"));
    J.subscribe("tags_page_loaded", J.proxy(function(tags) {
        Z.debug("tags_page_loaded published", 3);
        J.unsubscribe("tags_page_loaded");
        if (!jel.data("showmore")) {
            J(el).find("div.loading").empty();
        }
        var plainList = library.tags.plainTagsList(library.tags.tagsArray);
        var matchedList = Zotero.utils.prependAutocomplete("", plainList);
        Zotero.ui.displayTagsFiltered(el, library.tags, matchedList, selectedTags);
    }, this));
    var d = library.loadAllTags(newConfig, checkCached);
    d.done(J.proxy(function(tags) {
        Z.debug("finished loadAllTags", 3);
        J(el).find("div.loading").empty();
        Z.debug(tags, 5);
        library.tags.loaded = true;
        library.tags.loadedConfig = newConfig;
        J(el).children(".loading").empty();
        var plainList = library.tags.plainTagsList(library.tags.tagsArray);
        Zotero.ui.displayTagsFiltered(el, library.tags, plainList, selectedTags);
        Zotero.nav.doneLoading(el);
    }, this));
    d.fail(J.proxy(function(jqxhr, textStatus, errorThrown) {
        var elementMessage = Zotero.ui.ajaxErrorMessage(jqxhr);
        jel.html("<p>" + elementMessage + "</p>");
    }));
    return;
};

Zotero.callbacks.showSpinnerSection = function(el) {
    Z.debug("Zotero.callbacks.showSpinnerSection", 3);
    Zotero.ui.showSpinner(J(el).children(".loading"));
};

Zotero.callbacks.appendPreloader = function(el) {
    Z.debug("Zotero.callbacks.appendPreloader", 3);
    Zotero.ui.appendSpinner(el);
};

Zotero.callbacks.loadCollections = function(el) {
    Z.debug("Zotero.callbacks.loadCollections", 3);
    Zotero.nav.flagLoading(el);
    var jel = J(el);
    var library = Zotero.ui.getAssociatedLibrary(el);
    var mode = Zotero.nav.getUrlVar("mode") || "view";
    Zotero.ui.updateCollectionButtons();
    if (!jel.data("mode")) jel.data("mode", "view");
    if ((jel.data("loaded") || library.collections.loading) && !library.collections.dirty) {
        Z.debug("collections already loaded and clean", 3);
        Zotero.ui.highlightCurrentCollection();
        Zotero.ui.nestHideCollectionTree(el);
        Zotero.nav.doneLoading(el);
        return;
    }
    var clist = jel.find("#collection-list-container");
    Zotero.ui.showSpinner(clist);
    var d = library.loadCollections();
    d.done(J.proxy(function() {
        Zotero.nav.doneLoading(el);
        clist.empty();
        Zotero.ui.displayCollections(clist, library.collections);
        Zotero.ui.nestHideCollectionTree(clist);
        Zotero.ui.highlightCurrentCollection();
        jel.data("loaded", true);
        jel.data("mode", mode);
        Zotero.nav.doneLoading(el);
    }, this));
    d.fail(J.proxy(function(jqxhr, textStatus, errorThrown) {
        var elementMessage = Zotero.ui.ajaxErrorMessage(jqxhr);
        jel.html("<p>" + elementMessage + "</p>");
    }));
    return;
};

Zotero.callbacks.loadFeedLink = function(el) {
    Z.debug("Zotero.callbacks.loadFeedLink", 3);
    var jel = J(el);
    var library = Zotero.ui.getAssociatedLibrary(el);
    var loadConfig = jel.data("loadconfig");
    library.libraryLabel = decodeURIComponent(loadConfig.libraryLabel);
    var effectiveUrlVars = [ "itemPage", "tag", "collectionKey", "order", "sort", "q" ];
    var urlConfigVals = {};
    J.each(effectiveUrlVars, function(index, value) {
        var t = Zotero.nav.getUrlVar(value);
        if (t) {
            urlConfigVals[value] = t;
        }
    });
    var defaultConfig = {
        target: "items",
        targetModifier: "top",
        itemPage: 1,
        limit: 25
    };
    var newConfig = J.extend({}, defaultConfig, jel.data("loadconfig"), urlConfigVals);
    newConfig["collectionKey"] = urlConfigVals["collectionKey"];
    newConfig.start = parseInt(newConfig.limit, 10) * (parseInt(newConfig.itemPage, 10) - 1);
    if (!newConfig.sort) {
        newConfig.sort = Zotero.config.sortOrdering[newConfig.order];
    }
    if (newConfig.tag || newConfig.q) {
        delete newConfig.targetModifier;
    }
    var urlconfig = J.extend({
        target: "items",
        libraryType: library.libraryType,
        libraryID: library.libraryID
    }, newConfig);
    var requestUrl = Zotero.ajax.apiRequestUrl(urlconfig) + Zotero.ajax.apiQueryString(urlconfig, false);
    var feedUrl = requestUrl.replace(Zotero.config.baseApiUrl, Zotero.config.baseFeedUrl);
    var newkeyurl = Zotero.url.requestReadApiKeyUrl(library.libraryType, library.libraryID, feedUrl);
    jel.data("urlconfig", urlconfig);
    if (library.libraryType == "user" && zoteroData.libraryPublish === 0 || library.libraryType == "group" && zoteroData.groupType == "Private") {
        J(".feed-link").attr("href", newkeyurl);
    } else {
        J(".feed-link").attr("href", feedUrl);
    }
    J("#library link[rel='alternate']").attr("href", feedUrl);
    var exportUrls = Zotero.url.exportUrls(urlconfig);
    J("#export-list").empty().append(J("#exportformatsTemplate").tmpl({
        exportUrls: exportUrls
    }));
    J("#export-list").data("urlconfig", urlconfig);
    J("#export-list").hide();
};

Zotero.callbacks.loadUserGroups = function(el) {
    Z.debug("Zotero.callbacks.loadUserGroups", 3);
    var jel = J(el);
    var config = {};
    config.userslug = jel.attr("data-userslug");
    config.target = jel.attr("data-target");
    config.content = jel.attr("data-content");
    config.raw = "1";
    Zotero.ajax.loadUserGroups(el, config);
};

Zotero.callbacks.userGroupsLoaded = function(el) {
    Z.debug("Zotero.callbacks.userGroupsLoaded", 3);
    var jel = J(el);
    var groups = Zotero.groups;
    groups.groupsArray.sort(groups.sortByTitleCompare);
    var groupshtml = Zotero.ui.userGroupsDisplay(groups);
    jel.html(groupshtml);
};

Zotero.callbacks.runsearch = function(el) {
    Z.debug("Zotero.callbacks.runsearch", 3);
    var params = Zotero.pages.search_index.parseSearchUrl();
    if (!params.type) {
        params.type = "support";
    }
    var sectionID = params.type;
    if (sectionID != "people" && sectionID != "group") {
        sectionID = "support";
    }
    Z.debug("search type: " + params.type, 4);
    J(".search-section").not("[id=" + sectionID + "]").hide();
    J(".search-section[id=" + sectionID + "]").show().find("input[name=q]").val(params.query);
    J("#search-nav li").removeClass("selected");
    J("#search-nav li." + params.type).addClass("selected");
    zoterojsSearchContext = params.type;
    if (params.query) {
        Zotero.pages.search_index.runSearch(params);
    }
};

Zotero.callbacks.loadFilterGuide = function(el) {
    Z.debug("Zotero.callbacks.loadFilterGuide", 3);
    var tag = Zotero.nav.getUrlVar("tag");
    if (typeof tag == "string") {
        tag = [ tag ];
    }
    var collectionKey = Zotero.nav.getUrlVar("collectionKey");
    var q = Zotero.nav.getUrlVar("q");
    var filters = {
        tag: tag,
        collectionKey: collectionKey,
        q: q
    };
    Zotero.ui.filterGuide(el, filters);
};

Zotero.callbacks.actionPanel = function(el) {
    Z.debug("Zotero.callbacks.actionPanel", 3);
    var mode = Zotero.nav.getUrlVar("mode");
    var elid = J(el).attr("id");
    if (elid == "collections-pane-edit-panel-div") {
        if (mode == "edit") {
            Zotero.ui.collectionsActionPane(J("#collections-pane-edit-panel-div"), true);
        } else {
            Zotero.ui.collectionsActionPane(J("#collections-pane-edit-panel-div"), false);
        }
    } else if (elid == "items-pane-edit-panel-div") {
        if (mode == "edit") {
            Zotero.ui.itemsActionPane(J("#items-pane-edit-panel-div"));
        } else {
            Zotero.ui.itemsSearchActionPane(J("#items-pane-edit-panel-div"));
        }
        Zotero.ui.updateDisabledControlButtons();
    }
};

Zotero.callbacks.selectMobilePage = function(el) {
    Z.debug("Zotero.callbacks.selectMobilePage", 3);
    if (Zotero.state.mobilePageFirstLoad) {
        Z.debug("first mobile pageload - ignoring page history's page", 3);
        Zotero.state.mobilePageFirstLoad = false;
        var activePageID = J.mobile.activePage.attr("id") || "";
        Zotero.nav.updateStatePageID(activePageID);
        return;
    } else if (Zotero.state.mobileBackButtonClicked) {
        Zotero.state.mobileBackButtonClicked = false;
        var defaultPageID = J("[data-role='page']").first().attr("id");
        Zotero.nav.ignoreStateChange();
        Zotero.ui.mobile.changePage("#" + defaultPageID, {
            changeHash: false
        });
    } else {
        Z.debug("Not first mobile pageload - going ahead with mobile page selection", 3);
    }
    var hState = History.getState();
    var s = hState.data;
    var page = Zotero.nav.getUrlVar("msubpage") || s._zpageID;
    if (page) {
        if (J.mobile.activePage.attr("id") != page) {
            Z.debug("Zotero.callbacks.selectMobilePage switching to " + page, 4);
            Zotero.nav.ignoreStateChange();
            Zotero.ui.mobile.changePage("#" + page, {
                changeHash: false
            });
        }
    } else {}
    Zotero.ui.createOnActivePage();
    return;
};

Zotero.ui.bindCollectionLinks = function() {
    Z.debug("Zotero.ui.bindCollectionLinks", 3);
    J("#collection-list-div").on("click", "div.folder-toggle", function(e) {
        e.preventDefault();
        J(this).siblings(".collection-select-link").click();
        return false;
    });
    J("#collection-list-div").on("click", ".collection-select-link", function(e) {
        Z.debug("collection-select-link clicked", 4);
        e.preventDefault();
        var collection, library;
        var collectionKey = J(this).attr("data-collectionkey");
        if (J(this).hasClass("current-collection")) {
            var expanded = J(".current-collection").data("expanded");
            if (expanded === true) {
                Zotero.ui.nestHideCollectionTree(J("#collection-list-container"), false);
            } else {
                Zotero.ui.nestHideCollectionTree(J("#collection-list-container"), true);
            }
            Zotero.nav.clearUrlVars([ "collectionKey", "mode" ]);
            if (Zotero.config.mobile && Zotero.nav.getUrlVar("mode") != "edit") {
                collection = Zotero.ui.getAssociatedLibrary(J(this));
                if (!collection.hasChildren) {
                    Z.debug("Changing page to items list because collection has no children", 4);
                }
            } else {
                Zotero.nav.pushState();
            }
            return false;
        }
        Z.debug("click " + collectionKey, 4);
        Zotero.nav.clearUrlVars([ "mode" ]);
        Zotero.nav.urlvars.pathVars["collectionKey"] = collectionKey;
        Z.debug("change mobile page if we didn't just expand a collection", 4);
        Z.debug(J(this), 4);
        if (Zotero.config.mobile) {
            Z.debug("is mobile", 4);
            library = Zotero.ui.getAssociatedLibrary(J(this).closest(".ajaxload"));
            collection = library.collections.getCollection(collectionKey);
            if (!collection.hasChildren && Zotero.nav.getUrlVar("mode") != "edit") {
                Z.debug("Changing page to items list because collection has no children", 4);
                Zotero.ui.mobile.changePage("#library-items-page", {
                    changeHash: false
                });
            } else {
                Zotero.nav.pushState();
            }
        } else {
            Zotero.nav.pushState();
        }
        return false;
    });
    J("#collection-list-div").on("click", "a.my-library", function(e) {
        e.preventDefault();
        Zotero.nav.clearUrlVars([ "mode" ]);
        if (Zotero.config.mobile) {
            Zotero.ui.mobile.changePage("#library-items-page", {
                changeHash: false
            });
        }
        Zotero.nav.pushState();
        return false;
    });
};

Zotero.ui.bindItemLinks = function() {
    Z.debug("Zotero.ui.bindItemLinks", 3);
    J("div#items-pane").on("click", "a.item-select-link", function(e) {
        e.preventDefault();
        Z.debug("item-select-link clicked", 3);
        var itemKey = J(this).attr("data-itemKey");
        Z.debug("click " + itemKey, 4);
        Zotero.nav.urlvars.pathVars.itemKey = itemKey;
        Zotero.nav.pushState();
    });
    J("div#items-pane").on("click", "td[data-itemkey]:not(.edit-checkbox-td)", function(e) {
        e.preventDefault();
        Z.debug("item-select-td clicked", 3);
        var itemKey = J(this).attr("data-itemKey");
        Z.debug("click " + itemKey, 4);
        Zotero.nav.urlvars.pathVars.itemKey = itemKey;
        Zotero.nav.pushState();
    });
};

Zotero.ui.bindTagLinks = function() {
    Z.debug("Zotero.ui.bindTagLinks", 3);
    J("#tags-list-div, #items-pane").on("click", "a.tag-link", function(e) {
        e.preventDefault();
        J("#tag-filter-input").val("");
        Z.debug("tag-link clicked", 4);
        var tagtitle = J(this).attr("data-tagtitle");
        Zotero.nav.toggleTag(tagtitle);
        Z.debug("click " + tagtitle, 4);
        Zotero.nav.clearUrlVars([ "tag", "collectionKey" ]);
        Zotero.nav.pushState();
    });
};

Zotero.ui.saveItemCallback = function(e) {
    Z.debug("saveitemlink clicked", 3);
    e.preventDefault();
    Zotero.ui.scrollToTop();
    var library = Zotero.ui.getAssociatedLibrary(J(this).closest(".ajaxload"));
    var itemKey = J(this).attr("data-itemKey");
    var item;
    if (itemKey) {
        item = library.items.getItem(itemKey);
        Z.debug("itemKey " + itemKey + " : ", 3);
    } else {
        item = J("#item-details-div").data("newitem");
        Z.debug("newItem : itemTemplate selected from form", 3);
        Z.debug(item, 3);
    }
    Zotero.ui.updateItemFromForm(item, J(this).closest("form"));
    library.dirty = true;
    Zotero.ui.showSpinner(J(this).closest(".ajaxload"));
    return false;
};

Zotero.ui.addToCollection = function(collectionKey, library) {
    Z.debug("add-to-collection clicked", 3);
    var itemKeys = Zotero.ui.getSelectedItemKeys(J("#edit-mode-items-form"));
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
    Z.debug(library.collections[collectionKey], 4);
    var response = library.collections[collectionKey].addItems(itemKeys);
    library.dirty = true;
    J.when(response).then(function() {
        Zotero.nav.pushState(true);
    });
    return false;
};

Zotero.ui.dialog = function(el, options) {
    Z.debug("Zotero.ui.dialog", 3);
    J(el).dialog(options);
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
        } else if (item.apiObject) {
            if (item.apiObject[field]) {
                formattedString = item.apiObject[field];
            }
        } else if (item.contentRows) {
            J.each(item.contentRows, function(rowI, row) {
                if (row.field === field) {
                    formattedString = row.fieldValue;
                }
            });
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

Zotero.ui.init.all = function() {
    J("#content").on("click", "a.ajax-link", function() {
        Z.debug("ajax-link clicked with href " + J(this).attr("href"), 3);
        Z.debug("pathname " + this.pathname, 4);
        var pathvars = Zotero.nav.parsePathVars(this.pathname);
        Zotero.nav.urlvars.pathVars = pathvars;
        Zotero.nav.pushState();
        return false;
    });
    if (Zotero.config.mobile) {
        Zotero.ui.init.mobile();
    }
    Z.debug("ui init based on page", 3);
    switch (Zotero.config.pageClass) {
      case "my_library":
      case "user_library":
      case "group_library":
        Zotero.ui.init.library();
        Zotero.ui.bindItemLinks();
        Zotero.ui.bindCollectionLinks();
        Zotero.ui.bindTagLinks();
        break;
      case "default":
    }
};

Zotero.ui.init.library = function() {
    Z.debug("Zotero.ui.init.library", 3);
    Zotero.ui.init.fullLibrary();
    var hasTinyNoLinks = J("textarea.tinymce").filter(".nolinks").length;
    var hasTinyReadOnly = J("textarea.tinymce").filter(".readonly").length;
    var hasTinyDefault = J("textarea.tinymce").not(".nolinks").not(".readonly").length;
    if (hasTinyNoLinks) {
        Zotero.ui.init.tinyMce("nolinks");
    }
    if (hasTinyReadOnly) {
        Zotero.ui.init.tinyMce("readonly");
    }
    if (hasTinyDefault) {
        Zotero.ui.init.tinyMce("default");
    }
};

Zotero.ui.init.fullLibrary = function() {
    Z.debug("Zotero.ui.initFullLibrary", 3);
    if (J("#library").hasClass("ajaxload")) {
        Zotero.ui.init.offlineLibrary();
        return;
    }
    Zotero.ui.init.libraryControls();
    Zotero.ui.init.tags();
    Zotero.ui.init.collections();
    Zotero.ui.init.items();
    Zotero.ui.init.libraryTemplates();
};

Zotero.ui.init.libraryControls = function() {
    Z.debug("Zotero.ui.initControls", 3);
    J("#create-item-link").button({
        text: false,
        icons: {
            primary: "sprite-toolbar-item-add"
        }
    });
    J("#edit-collections-link").button({
        text: false,
        icons: {
            primary: "sprite-folder_edit",
            secondary: "ui-icon-triangle-1-s"
        }
    });
    J("#move-item-links-buttonset").buttonset();
    J(".add-to-collection-link").button({
        text: false,
        icons: {
            primary: "sprite-folder_add_to"
        }
    });
    J(".remove-from-collection-link").button({
        text: false,
        icons: {
            primary: "sprite-folder_remove_from"
        }
    });
    J(".move-to-trash-link").button({
        text: false,
        icons: {
            primary: "sprite-trash"
        }
    });
    J(".remove-from-trash-link").button({
        text: false,
        icons: {
            primary: "sprite-trash_remove"
        }
    });
    J("#edit-checkbox").button({
        text: false,
        icons: {
            primary: "sprite-page_edit"
        }
    });
    J("#cite-link").button({
        text: false,
        icons: {
            primary: "sprite-toolbar-cite"
        }
    });
    J("#export-link").button({
        text: false,
        icons: {
            primary: "sprite-toolbar-export"
        }
    });
    J("#library-settings-link").button({
        text: false,
        icons: {
            primary: "sprite-timeline_marker"
        }
    });
    J("#library-settings-form").hide();
    J("#control-panel-container").on("click", "#library-settings-link", Zotero.ui.callbacks.librarySettings);
    J.subscribe("loadCollectionsDone", function(collections) {
        Z.debug("loadCollectionsDone callback", 4);
    });
    J("#library-items-div").on("change", ".itemlist-editmode-checkbox.all-checkbox", function(e) {
        J(".itemlist-editmode-checkbox").prop("checked", J(".itemlist-editmode-checkbox.all-checkbox").prop("checked"));
        Zotero.ui.updateDisabledControlButtons();
    });
    J("#library-items-div").on("change", "input.itemKey-checkbox", function(e) {
        Zotero.ui.updateDisabledControlButtons();
    });
    Zotero.ui.updateDisabledControlButtons();
    J("#control-panel-container").on("change", "#edit-checkbox", Zotero.ui.callbacks.toggleEdit);
    J("#collection-list-div").on("click", ".create-collection-link", Zotero.ui.callbacks.createCollection);
    J("#collection-list-div").on("click", ".update-collection-link", Zotero.ui.callbacks.updateCollection);
    J("#collection-list-div").on("click", ".delete-collection-link", Zotero.ui.callbacks.deleteCollection);
    J("#control-panel-container").on("click", ".add-to-collection-link", Zotero.ui.callbacks.addToCollection);
    J("#control-panel-container").on("click", "#create-item-link", Zotero.ui.callbacks.createItem);
    J("#control-panel-container").on("click", ".remove-from-collection-link", Zotero.ui.callbacks.removeFromCollection);
    J("#control-panel-container").on("click", ".move-to-trash-link", Zotero.ui.callbacks.moveToTrash);
    J("#control-panel-container").on("click", ".remove-from-trash-link", Zotero.ui.callbacks.removeFromTrash);
    J("#item-details-div").on("click", ".move-to-trash-link", Zotero.ui.callbacks.moveToTrash);
    J("delete-collection-dialog").on("submit", ".delete-collection-div form", function(e) {
        e.preventDefault();
    });
    J("update-collection-dialog").on("submit", ".update-collection-div form", function(e) {
        e.preventDefault();
    });
    J("create-collection-dialog").on("submit", ".new-collection-div form", function(e) {
        e.preventDefault();
    });
    if (Zotero.nav.getUrlVar("q")) {
        J("#header-search-query").val(Zotero.nav.getUrlVar("q"));
    }
    var context = "support";
    if (undefined !== window.zoterojsSearchContext) {
        context = zoterojsSearchContext;
    }
    J("#header-search-query").val("");
    J("#header-search-query").attr("placeholder", "Search Library");
    J("#simple-search").live("submit", function(e) {
        e.preventDefault();
        Zotero.nav.clearUrlVars([ "collectionKey", "tag", "q" ]);
        var query = J("#header-search-query").val();
        if (query !== "" || Zotero.nav.getUrlVar("q")) {
            Zotero.nav.urlvars.pathVars["q"] = query;
            Zotero.nav.pushState();
        }
        return false;
    });
    if (context == "library" || context == "grouplibrary") {
        var clearQuery = function(e) {
            Z.debug("header search changed");
            Z.debug(e);
            Z.debug("-" + J("#header-search-query").val());
            J("#header-search-query").val("");
            Z.debug("q is now empty");
            if (Zotero.nav.getUrlVar("q")) {
                Z.debug("q in url is set");
                Zotero.nav.setUrlVar("q", "");
                Zotero.nav.pushState();
            }
        };
        J("#simple-search button.clear-field-button").on("click", clearQuery);
    }
};

Zotero.ui.init.paginationButtons = function(pagination) {
    J("#item-pagination-div .back-item-pagination").buttonset();
    J("#item-pagination-div .forward-item-pagination").buttonset();
    J("#start-item-link").button({
        text: false,
        icons: {
            primary: "ui-icon-seek-first"
        }
    });
    J("#prev-item-link").button({
        text: false,
        icons: {
            primary: "ui-icon-triangle-1-w"
        }
    });
    J("#next-item-link").button({
        text: false,
        icons: {
            primary: "ui-icon-triangle-1-e"
        }
    });
    J("#last-item-link").button({
        text: false,
        icons: {
            primary: "ui-icon-seek-end"
        }
    });
    if (pagination.showFirstLink === false) {
        J("#start-item-link").button("option", "disabled", true);
    }
    if (pagination.showPrevLink === false) {
        J("#prev-item-link").button("option", "disabled", true);
    }
    if (pagination.showNextLink === false) {
        J("#next-item-link").button("option", "disabled", true);
    }
    if (pagination.showLastLink === false) {
        J("#last-item-link").button("option", "disabled", true);
    }
};

Zotero.ui.init.collections = function() {
    Z.debug("Zotero.ui.initCollections", 3);
};

Zotero.ui.init.tags = function() {
    Z.debug("Zotero.ui.initTags", 3);
    J("#tags-list-div").on("click", "#show-all-tags", function(e) {
        var show = J(this).prop("checked") ? true : false;
        Z.debug("showAllTags is " + show, 4);
        Zotero.utils.setUserPref("library_showAllTags", show);
        Zotero.callbacks.loadTags(J("#tags-list-div"));
    });
    J("#tags-list-div").on("click", "#show-more-tags-link", function(e) {
        e.preventDefault();
        var jel = J(this).closest("#tags-list-div");
        jel.data("showmore", true);
        Zotero.callbacks.loadTags(jel);
    });
    J("#tags-list-div").on("click", "#show-less-tags-link", function(e) {
        e.preventDefault();
        var jel = J(this).closest("#tags-list-div");
        jel.data("showmore", false);
        Zotero.callbacks.loadTags(jel);
    });
    J("#tags-list-div").on("keydown", ".taginput", function(e) {
        if (e.keyCode === J.ui.keyCode.ENTER) {
            e.preventDefault();
            if (J(this).val() !== "") {
                Zotero.ui.addTag();
                e.stopImmediatePropagation();
            }
        }
    });
    J("#tags-list-div").on("keyup", "#tag-filter-input", function(e) {
        Z.debug(J("#tag-filter-input").val(), 3);
        Z.debug("value:" + J("#tag-filter-input").val(), 4);
        var library = Zotero.ui.getAssociatedLibrary(J("#tag-filter-input").closest(".ajaxload"));
        var libraryTagsPlainList = library.tags.plainList;
        var matchingTagStrings = Zotero.utils.matchAnyAutocomplete(J("#tag-filter-input").val(), libraryTagsPlainList);
        Zotero.ui.displayTagsFiltered(J("#tags-list-div"), library.tags, matchingTagStrings, []);
        Z.debug(matchingTagStrings, 4);
    });
    J("#tags-list-div").on("click", "#refresh-tags-link", function(e) {
        e.preventDefault();
        var library = Zotero.ui.getAssociatedLibrary(J("#tag-filter-input").closest(".ajaxload"));
        Zotero.callbacks.loadTags(J("#tags-list-div"), false);
        return false;
    });
};

Zotero.ui.init.items = function() {
    Z.debug("Zotero.ui.initItems", 3);
    J("#item-details-div").on("click", ".saveitembutton", Zotero.ui.saveItemCallback);
    J("#item-details-div").on("submit", ".itemDetailForm", Zotero.ui.saveItemCallback);
    J("#item-details-div").on("click", ".cancelitemeditbutton", function() {
        Zotero.nav.clearUrlVars([ "itemKey", "collectionKey", "tag", "q" ]);
        Zotero.nav.pushState();
    });
    J("#item-details-div").on("click", ".itemTypeSelectButton", function() {
        Z.debug("itemTypeSelectButton clicked", 3);
        var itemType = J("#itemType").val();
        Zotero.nav.urlvars.pathVars["itemType"] = itemType;
        Zotero.nav.pushState();
        return false;
    });
    J("#item-details-div").on("change", ".itemDetailForm #itemTypeSelect", function() {
        Z.debug("itemTypeSelect changed", 3);
        var itemType = J(this).val();
        Zotero.nav.urlvars.pathVars["itemType"] = itemType;
        Zotero.nav.pushState();
    });
    J("#item-details-div").on("keydown", ".itemDetailForm input", function(e) {
        if (e.keyCode === J.ui.keyCode.ENTER) {
            e.preventDefault();
            var nextEligibleSiblings = J(this).nextAll("input, button, textarea, select");
            if (nextEligibleSiblings.length) {
                nextEligibleSiblings.first().focus();
            } else {
                J(this).closest("tr").nextAll().find("input, button, textarea, select").first().focus();
            }
        }
    });
    J("#item-details-div").on("click", ".add-tag-button", function() {
        Z.debug("add tag button clicked", 4);
        Zotero.ui.addTag();
        return false;
    });
    J("#item-details-div").on("click", ".add-tag-link", function() {
        Z.debug("add tag link clicked", 4);
        Zotero.ui.addTag();
        return false;
    });
    J("#item-details-div").on("click", ".remove-tag-link", function() {
        Z.debug("remove tag link clicked", 4);
        Zotero.ui.removeTag(J(this));
        return false;
    });
    J("#item-details-div").on("click", ".add-creator-link", function() {
        Z.debug("add creator button clicked", 4);
        Zotero.ui.addCreator(this);
        return false;
    });
    J("#item-details-div").on("click", ".remove-creator-link", function() {
        Z.debug("add creator button clicked", 4);
        Zotero.ui.removeCreator(this);
        return false;
    });
    J("#item-details-div").on("click", ".switch-two-field-creator-link", function() {
        Z.debug("switch two field creator clicked");
        var last, first;
        var name = J(this).closest("tr.creator").find("input[id$='_name']").val();
        var split = name.split(" ");
        if (split.length > 1) {
            last = split.splice(-1, 1)[0];
            first = split.join(" ");
        } else {
            last = name;
            first = "";
        }
        var itemType = J(this).closest("form").find("select.itemType").val();
        var index = parseInt(J(this).closest("tr.creator").attr("id").substr(8), 10);
        var creatorType = J(this).closest("tr.creator").find("select#creator_" + index + "_creatorType").val();
        var jel = J(this).closest("tr").replaceWith(J.tmpl("authorelementsdoubleTemplate", {
            index: index,
            creator: {
                firstName: first,
                lastName: last,
                creatorType: creatorType
            },
            creatorTypes: Zotero.Item.prototype.creatorTypes[itemType]
        }));
        Zotero.ui.init.creatorFieldButtons();
    });
    J("#item-details-div").on("click", ".switch-single-field-creator-link", function() {
        Z.debug("switch single field clicked");
        var name;
        var firstName = J(this).closest("div.creator-input-div").find("input[id$='_firstName']").val();
        var lastName = J(this).closest("div.creator-input-div").find("input[id$='_lastName']").val();
        name = firstName + " " + lastName;
        var itemType = J(this).closest("form").find("select.itemType").val();
        var index = parseInt(J(this).closest("tr.creator").attr("id").substr(8), 10);
        var creatorType = J(this).closest("tr.creator").find("select#creator_" + index + "_creatorType").val();
        var jel = J(this).closest("tr").replaceWith(J.tmpl("authorelementssingleTemplate", {
            index: index,
            creator: {
                name: name
            },
            creatorTypes: Zotero.Item.prototype.creatorTypes[itemType]
        }));
        Zotero.ui.init.creatorFieldButtons();
    });
    J("#item-details-div").on("click", ".add-note-button", function() {
        Z.debug("add note button clicked", 3);
        Zotero.ui.addNote(this);
        return false;
    });
    J("#library-items-div").on("click", ".field-table-header", function() {
        Z.debug(".field-table-header clicked", 3);
        var currentOrderField = Zotero.nav.getUrlVar("order") || Zotero.config.userDefaultApiArgs.order;
        var currentOrderSort = Zotero.nav.getUrlVar("sort") || Zotero.config.userDefaultApiArgs.sort || Zotero.config.sortOrdering[currentOrderField] || "asc";
        var newOrderField = J(this).data("columnfield");
        var newOrderSort = Zotero.config.sortOrdering[newOrderField];
        if (J.inArray(newOrderField, Zotero.Library.prototype.sortableColumns) == -1) {
            return false;
        }
        if (currentOrderField == newOrderField && currentOrderSort == newOrderSort) {
            if (newOrderSort == "asc") {
                newOrderSort = "desc";
            } else {
                newOrderSort = "asc";
            }
        }
        if (!newOrderField) {
            Zotero.ui.jsNotificationMessage("no order field mapped to column");
            return false;
        }
        Zotero.nav.urlvars.pathVars["order"] = newOrderField;
        Zotero.nav.urlvars.pathVars["sort"] = newOrderSort;
        Zotero.nav.pushState();
        Zotero.config.userDefaultApiArgs.sort = newOrderSort;
        Zotero.config.userDefaultApiArgs.order = newOrderField;
        Zotero.utils.setUserPref("library_defaultSort", newOrderField + "," + newOrderSort);
    });
    J("#item-details-div").on("click", "#cite-item-link", Zotero.ui.callbacks.citeItems);
    J("#build-bibliography-link").on("click", Zotero.ui.callbacks.citeItems);
    J("#cite-link").on("click", Zotero.ui.callbacks.citeItems);
    J("#export-formats-div").on("click", ".export-link", Zotero.ui.callbacks.exportItems);
    J("#export-link").on("click", Zotero.ui.callbacks.showExportDialog);
    J("#export-dialog").on("click", ".export-link", Zotero.ui.callbacks.exportItems);
    J("#item-details-div").on("click", "#upload-attachment-link", Zotero.ui.callbacks.uploadAttachment);
    J.subscribe("hasFirstChild", function(itemKey) {
        var jel = J("#item-details-div");
        Zotero.ui.showChildren(jel, itemKey);
    });
};

Zotero.ui.init.creatorFieldButtons = function() {
    if (Zotero.config.mobile) {
        Zotero.ui.createOnActivePage(J("tr.creator"));
        return;
    }
    J(".add-remove-creator-buttons-container").buttonset();
    J("a.switch-single-field-creator-link").button({
        text: false,
        icons: {
            primary: "sprite-textfield-single"
        }
    });
    J("a.switch-two-field-creator-link").button({
        text: false,
        icons: {
            primary: "sprite-textfield-dual"
        }
    });
    J("a.remove-creator-link").button({
        text: false,
        icons: {
            primary: "sprite-minus"
        }
    });
    J("a.add-creator-link").button({
        text: false,
        icons: {
            primary: "sprite-plus"
        }
    });
};

Zotero.ui.init.editButton = function() {
    Z.debug("Zotero.ui.init.editButton", 3);
    var editEl = J("#edit-checkbox");
    if (Zotero.nav.getUrlVar("mode") == "edit") {
        editEl.prop("checked", true);
    } else {
        editEl.prop("checked", false);
    }
    editEl.button("refresh");
    if (!Zotero.nav.getUrlVar("itemKey")) {
        editEl.button("option", "disabled", true);
    } else {
        editEl.button("option", "disabled", false);
    }
};

Zotero.ui.init.detailButtons = function() {
    Z.debug("Zotero.ui.init.detaButtons", 3);
    J("#upload-attachment-link").button();
    J("#cite-item-link").button();
};

Zotero.ui.init.tagButtons = function() {
    J(".add-remove-tag-container").buttonset();
    J(".remove-tag-link").button({
        text: false,
        icons: {
            primary: "sprite-minus"
        }
    });
    J(".add-tag-link").button({
        text: false,
        icons: {
            primary: "sprite-plus"
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
    Z.debug("tinyMce config of type: " + type, 3);
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
            console.log("inited " + inst.editorId);
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
    J("#tagrowTemplate").template("tagrowTemplate");
    J("#tagslistTemplate").template("tagslistTemplate");
    J("#collectionlistTemplate").template("collectionlistTemplate");
    J("#collectionrowTemplate").template("collectionrowTemplate");
    J("#itemrowTemplate").template("itemrowTemplate");
    J("#itemstableTemplate").template("itemstableTemplate");
    J("#itempaginationTemplate").template("itempaginationTemplate");
    J("#itemdetailsTemplate").template("itemdetailsTemplate");
    J("#itemnotedetailsTemplate").template("itemnotedetailsTemplate");
    J("#itemformTemplate").template("itemformTemplate");
    J("#citeitemformTemplate").template("citeitemformTemplate");
    J("#attachmentformTemplate").template("attachmentformTemplate");
    J("#attachmentuploadTemplate").template("attachmentuploadTemplate");
    J("#datafieldTemplate").template("datafieldTemplate");
    J("#editnoteformTemplate").template("editnoteformTemplate");
    J("#itemtagTemplate").template("itemtagTemplate");
    J("#itemtypeselectTemplate").template("itemtypeselectTemplate");
    J("#authorelementssingleTemplate").template("authorelementssingleTemplate");
    J("#authorelementsdoubleTemplate").template("authorelementsdoubleTemplate");
    J("#childitemsTemplate").template("childitemsTemplate");
    J("#editcollectionbuttonsTemplate").template("editcollectionbuttonsTemplate");
    J("#choosecollectionformTemplate").template("choosecollectionformTemplate");
    J("#breadcrumbsTemplate").template("breadcrumbsTemplate");
    J("#breadcrumbstitleTemplate").template("breadcrumbstitleTemplate");
    J("#newcollectionformTemplate").template("newcollectionformTemplate");
    J("#updatecollectionformTemplate").template("updatecollectionformTemplate");
    J("#deletecollectionformTemplate").template("deletecollectionformTemplate");
    J("#tagunorderedlistTemplate").template("tagunorderedlistTemplate");
    J("#librarysettingsTemplate").template("librarysettingsTemplate");
    J("#addtocollectionformTemplate").template("addtocollectionformTemplate");
    J("#exportformatsTemplate").template("exportformatsTemplate");
};

Zotero.ui.updateItemFromForm = function(item, formEl) {
    Z.debug("Zotero.ui.updateItemFromForm", 3);
    var base = J(formEl);
    base.closest(".ajaxload").data("ignoreformstorage", true);
    var library = Zotero.ui.getAssociatedLibrary(base.closest(".ajaxload"));
    var itemKey = "";
    if (item.itemKey) itemKey = item.itemKey;
    J.each(item.contentRows, function(i, row) {
        var selector, inputValue, noteElID;
        if (row.field == "note") {
            selector = "textarea[data-itemKey='" + itemKey + "'].tinymce";
            Z.debug(selector, 4);
            noteElID = J(selector).attr("id");
            Z.debug(noteElID, 4);
            inputValue = tinyMCE.get(noteElID).getContent();
        } else {
            selector = "[data-itemKey='" + itemKey + "'][name='" + row.field + "']";
            inputValue = base.find(selector).val();
        }
        if (typeof inputValue !== "undefined") {
            row.fieldValue = inputValue;
            item.apiObj[row.field] = inputValue;
        }
    });
    var creators = [];
    base.find("tr.creator").each(function(index, el) {
        var name, creator, firstName, lastName;
        var trindex = parseInt(J(el).attr("id").substr(8), 10);
        var creatorType = J(el).find("select[id$='creatorType']").val();
        if (J(el).hasClass("singleCreator")) {
            name = J(el).find("input[id$='_name']");
            if (!name.val()) {
                return true;
            }
            creator = {
                creatorType: creatorType,
                name: name.val()
            };
        } else if (J(el).hasClass("doubleCreator")) {
            firstName = J(el).find("input[id$='_firstName']").val();
            lastName = J(el).find("input[id$='_lastName']").val();
            if (firstName === "" && lastName === "") {
                return true;
            }
            creator = {
                creatorType: creatorType,
                firstName: firstName,
                lastName: lastName
            };
        }
        creators.push(creator);
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
    base.find("textarea[name^='note_']").each(function(index, el) {
        var noteid = J(el).attr("id");
        var noteContent = tinyMCE.get(noteid).getContent();
        Z.debug(noteContent, 3);
        notes.push({
            itemType: "note",
            note: noteContent
        });
    });
    item.apiObj.notes = notes;
    item.apiObj.creators = creators;
    item.apiObj.tags = tags;
    Z.debug("pre writeItem debug", 4);
    Z.debug(item, 4);
    Zotero.ui.showSpinner(J(formEl).closest(".ajaxload"));
    var jqxhr = item.writeItem();
    jqxhr.done(J.proxy(function(newItemKey) {
        Z.debug("item write finished", 3);
        delete Zotero.nav.urlvars.pathVars["action"];
        if (itemKey === "") {
            var collectionKey = Zotero.nav.getUrlVar("collectionKey");
            if (collectionKey) {
                var collection = library.collections[collectionKey];
                collection.addItems([ item.itemKey ]);
                library.dirty = true;
            }
            Zotero.nav.urlvars.pathVars["itemKey"] = item.itemKey;
        }
        Zotero.nav.clearUrlVars([ "itemKey", "collectionKey" ]);
        Zotero.nav.pushState(true);
    }, this));
    Z.debug("adding new tags to library tags", 3);
    var libTags = library.tags;
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
    J(".ajaxload").each(function() {
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
    var page = parseInt(Zotero.nav.getUrlVar(pageVar), 10) || 1;
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
    pagination.firstLink = Zotero.nav.mutateUrl(mutateOb, [ pageVar ]);
    mutateOb[pageVar] = page - 1;
    pagination.prevLink = Zotero.nav.mutateUrl(mutateOb, []);
    mutateOb[pageVar] = page + 1;
    pagination.nextLink = Zotero.nav.mutateUrl(mutateOb, []);
    mutateOb[pageVar] = feed.lastPage;
    pagination.lastLink = Zotero.nav.mutateUrl(mutateOb, []);
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
        jel = J("#library-items-div");
    } else {
        jel = J(el);
        if (jel.length === 0) {
            jel = J("#library-items-div");
        }
    }
    var library = jel.data("zoterolibrary");
    if (!library) {
        var loadConfig = jel.data("loadconfig");
        var libraryID = loadConfig.libraryID;
        var libraryType = loadConfig.libraryType;
        var libraryUrlIdentifier = loadConfig.libraryUrlIdentifier;
        if (!libraryID || !libraryType) {
            Z.debug("Bad library data attempting to get associated library: libraryID " + libraryID + " libraryType " + libraryType, 1);
            throw "Err";
        }
        if (Zotero.libraries[Zotero.utils.libraryString(libraryType, libraryID)]) {
            library = Zotero.libraries[Zotero.utils.libraryString(libraryType, libraryID, libraryUrlIdentifier)];
        } else {
            library = new Zotero.Library(libraryType, libraryID, libraryUrlIdentifier);
            Zotero.libraries[Zotero.utils.libraryString(libraryType, libraryID)] = library;
        }
        jel.data("zoterolibrary", library);
    }
    return library;
};

Zotero.ui.getSelectedItemKeys = function(form) {
    Z.debug("Zotero.ui.getSelectedItemKeys", 3);
    var itemKeys = [];
    var curItemKey = Zotero.nav.getUrlVar("itemKey");
    if (curItemKey) {
        itemKeys.push(curItemKey);
    } else {
        if (J(form).length) {
            J(form).find("input.itemKey-checkbox:checked").each(function(index, val) {
                itemKeys.push(J(val).data("itemkey"));
            });
        } else {
            J("input.itemKey-checkbox:checked").each(function(index, val) {
                itemKeys.push(J(val).data("itemkey"));
            });
        }
    }
    return itemKeys;
};

Zotero.ui.getAllFormItemKeys = function(form) {
    Z.debug("Zotero.ui.getSelectedItemKeys", 3);
    var itemKeys = [];
    var curItemKey = Zotero.nav.getUrlVar("itemKey");
    if (curItemKey) {
        itemKeys.push(curItemKey);
    } else {
        J(form).find("input.itemKey-checkbox").each(function(index, val) {
            itemKeys.push(J(val).data("itemkey"));
        });
    }
    return itemKeys;
};

Zotero.ui.jsNotificationMessage = function(message, type, timeout) {
    Z.debug("notificationMessage: " + type + " : " + message, 3);
    if (Zotero.config.suppressErrorNotifications) return;
    if (!timeout) {
        timeout = 5;
    }
    J("#js-message-list").append("<li class='jsNotificationMessage-" + type + "' >" + message + "</li>").children("li").delay(parseInt(timeout, 10) * 1e3).slideUp().delay(300).queue(function() {
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

Zotero.ui.showChildren = function(el, itemKey) {
    Z.debug("Zotero.ui.showChildren", 3);
    var library = Zotero.ui.getAssociatedLibrary(J(el).closest("div.ajaxload"));
    var item = library.items.getItem(itemKey);
    var attachmentsDiv = J(el).find(".item-attachments-div");
    Zotero.ui.showSpinner(attachmentsDiv);
    var childItemsPromise = item.getChildren(library);
    childItemsPromise.done(function(childItems) {
        J.tmpl("childitemsTemplate", {
            childItems: childItems
        }).appendTo(J(".item-attachments-div").empty());
    });
    Zotero.ui.createOnActivePage(el);
};

Zotero.ui.addCreator = function(button) {
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
    J.tmpl("authorelementsdoubleTemplate", {
        index: newindex,
        creator: {
            firstName: "",
            lastName: ""
        },
        creatorTypes: Zotero.Item.prototype.creatorTypes[itemType]
    }).insertAfter(jel);
    Zotero.ui.init.creatorFieldButtons();
    Zotero.ui.createOnActivePage(jel);
};

Zotero.ui.removeCreator = function(button) {
    Z.debug("Zotero.ui.removeCreator", 3);
    J(button).closest("tr").remove();
    Zotero.ui.createOnActivePage(button);
};

Zotero.ui.addNote = function(button) {
    Z.debug("Zotero.ui.addNote", 3);
    var notenum = 0;
    var lastNoteID = J("textarea[name^='note_']:last").attr("name");
    if (lastNoteID) {
        notenum = parseInt(lastNoteID.substr(5), 10);
    }
    var newindex = notenum + 1;
    var newNoteID = "note_" + newindex;
    var jel;
    if (Zotero.config.mobile) {
        jel = J("td.notes").append('<textarea cols="40" rows="24" name="' + newNoteID + '" id="' + newNoteID + '" class="tinymce default"></textarea>');
    } else {
        jel = J("td.notes button.add-note-button").before('<textarea cols="40" rows="24" name="' + newNoteID + '" id="' + newNoteID + '" class="tinymce default"></textarea>');
    }
    Z.debug("new note ID:" + newNoteID, 4);
    Zotero.ui.init.tinyMce("default", true, newNoteID);
    Zotero.ui.createOnActivePage(button);
};

Zotero.ui.loadNewItemTemplate = function(item) {
    Z.debug("Zotero.ui.loadNewItemTemplate", 3);
    Z.debug(item, 3);
    var d = Zotero.Item.prototype.getCreatorTypes(item.itemType);
    d.done(function(itemCreatorTypes) {
        var jel = J("#item-details-div").empty();
        if (item.itemType == "note") {
            var parentKey = Zotero.nav.getUrlVar("parentKey");
            if (parentKey) {
                item.parentKey = parentKey;
            }
            J.tmpl("editnoteformTemplate", {
                item: item,
                itemKey: item.itemKey
            }).appendTo(jel);
            Zotero.ui.init.tinyMce("default");
        } else {
            J.tmpl("itemformTemplate", {
                item: item.apiObj,
                libraryUserID: zoteroData.libraryUserID,
                itemKey: item.itemKey,
                creatorTypes: itemCreatorTypes
            }).appendTo(jel);
            if (item.apiObj.tags.length === 0) {
                Zotero.ui.addTag(false);
            }
            Zotero.ui.init.creatorFieldButtons();
            Zotero.ui.init.tagButtons();
            Zotero.ui.init.editButton();
        }
        jel.data("newitem", item);
        Zotero.ui.loadFormData(jel);
        Zotero.ui.createOnActivePage(jel);
    });
};

Zotero.ui.addTag = function(focus) {
    Z.debug("Zotero.ui.addTag", 3);
    if (typeof focus == "undefined") {
        focus = true;
    }
    var tagnum = 0;
    var lastTagID = J("input[id^='tag_']:last").attr("id");
    if (lastTagID) {
        tagnum = parseInt(lastTagID.substr(4), 10);
    }
    var newindex = tagnum + 1;
    var jel = J("td.tags");
    J.tmpl("itemtagTemplate", {
        index: newindex
    }).appendTo(jel);
    J("input.taginput").autocomplete({
        source: function(request, callback) {
            var library = Zotero.ui.getAssociatedLibrary(J(this.element.context).closest(".ajaxload"));
            var matchingTagStrings = Zotero.utils.prependAutocomplete(request.term, library.tags.plainList);
            callback(matchingTagStrings);
        },
        select: function(e, ui) {
            e.preventDefault();
            e.stopImmediatePropagation();
            var value = ui.item.value;
            Zotero.ui.addTag();
        }
    });
    if (focus) {
        J("input.taginput").last().focus();
    }
    Zotero.ui.init.tagButtons();
    Zotero.ui.createOnActivePage(jel);
};

Zotero.ui.removeTag = function(el) {
    Z.debug("Zotero.ui.removeTag", 3);
    J(el).closest(".edit-tag-div").remove();
    Zotero.ui.createOnActivePage(el);
};

Zotero.ui.displayCollections = function(el, collections) {
    Z.debug("Zotero.ui.displayCollections", 3);
    Z.debug("library Identifier " + collections.libraryUrlIdentifier, 4);
    var jel = J(el);
    var currentCollectionKey = Zotero.nav.getUrlVar("collectionKey") || "";
    var trash = collections.owningLibrary.libraryType == "user" ? true : false;
    J.tmpl("collectionlistTemplate", {
        collections: collections.collectionsArray,
        libUrlIdentifier: collections.libraryUrlIdentifier,
        currentCollectionKey: currentCollectionKey,
        trash: trash
    }).appendTo(jel);
    Zotero.ui.createOnActivePage(el);
};

Zotero.ui.displayItemsWidget = function(el, config, loadedItems) {
    Z.debug("Zotero.ui.displayItemsWidget", 3);
    Z.debug(config, 4);
    var itemPage = parseInt(Zotero.nav.getUrlVar("itemPage"), 10) || 1;
    var feed = loadedItems.feed;
    var start = parseInt(config.start, 10) || 0;
    var limit = parseInt(config.limit, 10) || 25;
    var order = config.order || Zotero.config.userDefaultApiArgs.order;
    var sort = config.sort || Zotero.config.sortOrdering[order] || "asc";
    var editmode = false;
    var jel = J(el);
    var titleParts = feed.title.split("/");
    var displayFields = Zotero.prefs.library_listShowFields;
    var itemsTableData = {
        titleParts: titleParts,
        displayFields: displayFields,
        items: loadedItems.itemsArray,
        editmode: editmode,
        order: order,
        sort: sort,
        library: loadedItems.library
    };
    Zotero.ui.insertItemsTable(el, itemsTableData);
};

Zotero.ui.displayItemsFull = function(el, config, loadedItems) {
    Z.debug("Zotero.ui.displayItemsFull", 3);
    Z.debug(config, 4);
    var jel = J(el);
    var feed = loadedItems.feed;
    var filledConfig = J.extend({}, Zotero.config.defaultApiArgs, Zotero.config.userDefaultApiArgs, config);
    var titleParts = feed.title.split("/");
    var displayFields = Zotero.prefs.library_listShowFields;
    if (loadedItems.library.libraryType != "group") {
        displayFields = J.grep(displayFields, function(el, ind) {
            return J.inArray(el, Zotero.Library.prototype.groupOnlyColumns) == -1;
        });
    }
    var editmode = Zotero.config.librarySettings.allowEdit ? true : false;
    var itemsTableData = {
        titleParts: titleParts,
        displayFields: displayFields,
        items: loadedItems.itemsArray,
        editmode: editmode,
        order: filledConfig["order"],
        sort: filledConfig["sort"],
        library: loadedItems.library
    };
    Z.debug(jel, 4);
    Zotero.ui.insertItemsTable(jel, itemsTableData);
    if (Zotero.config.mobile) {
        Zotero.ui.createOnActivePage(el);
        return;
    }
    var pagination = Zotero.ui.createPagination(loadedItems.feed, "itemPage", filledConfig);
    var paginationData = {
        feed: feed,
        pagination: pagination
    };
    var itemPage = pagination.page;
    Zotero.ui.insertItemsPagination(el, paginationData);
    Z.debug(jel, 4);
    var lel = J(el);
    J("#start-item-link").click(function(e) {
        e.preventDefault();
        Zotero.nav.urlvars.pathVars["itemPage"] = "";
        Zotero.nav.pushState();
    });
    J("#prev-item-link").click(function(e) {
        e.preventDefault();
        var newItemPage = itemPage - 1;
        Zotero.nav.urlvars.pathVars["itemPage"] = newItemPage;
        Zotero.nav.pushState();
    });
    J("#next-item-link").click(function(e) {
        e.preventDefault();
        var newItemPage = itemPage + 1;
        Zotero.nav.urlvars.pathVars["itemPage"] = newItemPage;
        Zotero.nav.pushState();
    });
    J("#last-item-link").click(function(e) {
        e.preventDefault();
        Z.debug("last-item-link clickbind", 4);
        var lasthref = "";
        J.each(feed.links, function(ind, link) {
            if (link.rel === "last") {
                lasthref = link.href;
                return false;
            }
        });
        Z.debug(lasthref, 4);
        var laststart = J.deparam.querystring(lasthref).start;
        Z.debug("laststart:" + laststart, 4);
        var lastItemPage = parseInt(laststart, 10) / limit + 1;
        Zotero.nav.urlvars.pathVars["itemPage"] = lastItemPage;
        Zotero.nav.pushState();
    });
    Zotero.ui.updateDisabledControlButtons();
    Zotero.ui.libraryBreadcrumbs();
    Zotero.ui.createOnActivePage(el);
};

Zotero.ui.insertItemsTable = function(el, data) {
    Z.debug("Zotero.ui.insertItemsTable", 3);
    Z.debug(data, 4);
    var a = J.tmpl("itemstableTemplate", data).appendTo(J(el));
    if (Zotero.config.mobile && J(el).closest(".ui-page").length) {
        if (!J(el).find("#field-list").hasClass("ui-listview")) {
            J(el).find("#field-list").listview();
        } else {
            J(el).find("#field-list").trigger("refresh");
        }
    }
};

Zotero.ui.insertItemsPagination = function(el, data) {
    J.tmpl("itempaginationTemplate", data).appendTo(J(el));
    Zotero.ui.init.paginationButtons(data.pagination);
};

Zotero.ui.editItemForm = function(el, item) {
    Z.debug("Zotero.ui.editItemForm", 3);
    Z.debug(item, 4);
    var jel = J(el);
    if (item.itemType == "note") {
        Z.debug("editItemForm - note", 3);
        jel.empty();
        J.tmpl("editnoteformTemplate", {
            item: item,
            itemKey: item.itemKey
        }).appendTo(jel);
        Zotero.ui.init.tinyMce("default");
        Zotero.ui.init.editButton();
    } else if (item.itemType == "attachment") {
        Z.debug("item is attachment", 4);
        jel.empty();
        var mode = Zotero.nav.getUrlVar("mode");
        J.tmpl("attachmentformTemplate", {
            item: item.apiObj,
            itemKey: item.itemKey,
            creatorTypes: [],
            mode: mode
        }).appendTo(jel);
        if (item.apiObj.tags.length === 0) {
            Zotero.ui.addTag(false);
        }
        if (Zotero.config.mobile) {
            Zotero.ui.init.editButton();
            J(el).trigger("create");
        } else {
            Zotero.ui.init.creatorFieldButtons();
            Zotero.ui.init.tagButtons();
            Zotero.ui.init.editButton();
        }
        Zotero.ui.init.tinyMce();
    } else {
        var p = item.getCreatorTypes(item.apiObj.itemType);
        p.done(J.proxy(function() {
            Z.debug("getCreatorTypes callback", 3);
            jel.empty();
            var mode = Zotero.nav.getUrlVar("mode");
            if (item.creators.length === 0) {
                item.creators.push({
                    creatorType: item.creatorTypes[item.itemType][0],
                    first: "",
                    last: ""
                });
                item.apiObj.creators = item.creators;
            }
            J.tmpl("itemformTemplate", {
                item: item.apiObj,
                itemKey: item.itemKey,
                creatorTypes: Zotero.Item.prototype.creatorTypes[item.apiObj.itemType],
                mode: mode
            }).appendTo(jel);
            if (item.apiObj.tags.length === 0) {
                Zotero.ui.addTag(false);
            }
            if (Zotero.config.mobile) {
                Zotero.ui.init.editButton();
                J(el).trigger("create");
            } else {
                Zotero.ui.init.creatorFieldButtons();
                Zotero.ui.init.tagButtons();
                Zotero.ui.init.editButton();
            }
        }, this));
    }
    J("input.taginput").autocomplete({
        source: function(request, callback) {
            var library = Zotero.ui.getAssociatedLibrary(J(this.element.context).closest(".ajaxload"));
            var matchingTagStrings = Zotero.utils.prependAutocomplete(request.term, library.tags.plainList);
            callback(matchingTagStrings);
        },
        select: function(e, ui) {
            e.preventDefault();
            e.stopImmediatePropagation();
            var value = ui.item.value;
            Zotero.ui.addTag();
        }
    });
};

Zotero.ui.showSpinner = function(el, type) {
    var spinnerUrl = Zotero.config.baseWebsiteUrl + "/static/images/theme/broken-circle-spinner.gif";
    if (!type) {
        J(el).html("<img class='spinner' src='" + spinnerUrl + "'/>");
    } else if (type == "horizontal") {
        J(el).html("<img class='spinner' src='" + spinnerUrl + "'/>");
    }
};

Zotero.ui.appendSpinner = function(el) {
    var spinnerUrl = Zotero.config.baseWebsiteUrl + "/static/images/theme/broken-circle-spinner.gif";
    J(el).append("<img class='spinner' src='" + spinnerUrl + "'/>");
};

Zotero.ui.displayTagsFiltered = function(el, libtags, matchedTagStrings, selectedTagStrings) {
    Zotero.debug("Zotero.ui.displayTagsFiltered");
    Z.debug(selectedTagStrings, 4);
    var curPreString = J("#tag-filter-input").val();
    var jel = J(el);
    var showMore = jel.data("showmore");
    if (!showMore) {
        showMore = false;
    }
    var filteredTags = [];
    var selectedTags = [];
    J.each(matchedTagStrings, function(index, matchedString) {
        if (libtags.tagObjects[matchedString] && J.inArray(matchedString, selectedTagStrings) == -1) {
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
        J("#show-less-tags-link").hide();
    } else {
        passTags = filteredTags;
        J("#show-more-tags-link").hide();
        J("#show-less-tags-link").show();
    }
    var tagListEl = J("#tags-list").empty();
    J("#selected-tags-list").replaceWith(J.tmpl("tagunorderedlistTemplate", {
        tags: selectedTags,
        id: "selected-tags-list"
    }));
    J("#tags-list").replaceWith(J.tmpl("tagunorderedlistTemplate", {
        tags: passTags,
        id: "tags-list"
    }));
};

Zotero.ui.loadItemDetail = function(item, el) {
    Z.debug("Zotero.ui.loadItemDetail", 3);
    var jel = J(el);
    jel.empty();
    var parentUrl = false;
    if (item.parentKey) {
        parentUrl = item.owningLibrary.websiteUrl({
            itemKey: item.parentKey
        });
    }
    Z.debug(1);
    if (item.itemType == "note") {
        Z.debug("note item", 3);
        J.tmpl("itemnotedetailsTemplate", {
            item: item,
            parentUrl: parentUrl
        }).appendTo(jel);
    } else {
        Z.debug("non-note item", 3);
        J.tmpl("itemdetailsTemplate", {
            item: item,
            parentUrl: parentUrl
        }).appendTo(jel).trigger("create");
    }
    Z.debug(2);
    Zotero.ui.init.tinyMce("readonly");
    Zotero.ui.init.editButton();
    Zotero.ui.init.detailButtons();
    Zotero.ui.libraryBreadcrumbs();
    try {
        var ev = document.createEvent("HTMLEvents");
        ev.initEvent("ZoteroItemUpdated", true, true);
        document.dispatchEvent(ev);
    } catch (e) {
        Zotero.debug("Error triggering ZoteroItemUpdated event");
    }
};

Zotero.ui.userGroupsDisplay = function(groups) {
    var html = "";
    J.each(groups.groupsArray, function(index, group) {
        html += Zotero.ui.groupNugget(group);
    });
    return html;
};

Zotero.ui.libraryBreadcrumbs = function(library, config) {
    Z.debug("Zotero.ui.libraryBreadcrumbs", 3);
    try {
        var breadcrumbs;
        if (!library) {
            library = Zotero.ui.getAssociatedLibrary(J("#feed-link-div"));
        }
        if (!config) {
            config = Zotero.nav.getUrlVars();
        }
        Z.debug(config, 4);
        if (library.libraryType == "user") {
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
            if (library.collections[config.collectionKey]) {
                breadcrumbs.push({
                    label: library.collections[config.collectionKey]["name"],
                    path: Zotero.nav.buildUrl({
                        collectionKey: config.collectionKey
                    })
                });
            }
        }
        if (config.itemKey) {
            Z.debug("have itemKey", 4);
            breadcrumbs.push({
                label: library.items.getItem(config.itemKey).title,
                path: Zotero.nav.buildUrl({
                    collectionKey: config.collectionKey,
                    itemKey: config.itemKey
                })
            });
        }
        Z.debug(breadcrumbs, 4);
        J("#breadcrumbs").empty();
        J.tmpl("breadcrumbsTemplate", {
            breadcrumbs: breadcrumbs
        }).appendTo(J("#breadcrumbs"));
        var newtitle = J.tmpl("breadcrumbstitleTemplate", {
            breadcrumbs: breadcrumbs
        }).text();
        Zotero.nav.updateStateTitle(newtitle);
        Z.debug("done with breadcrumbs", 4);
    } catch (e) {
        Zotero.debug("Error loading breadcrumbs", 2);
    }
};

Zotero.ui.updateDisabledControlButtons = function() {
    Z.debug("Zotero.ui.updateDisabledControlButtons", 3);
    J(".move-to-trash-link").prop("title", "Move to Trash");
    J("#create-item-link").button("option", "disabled", false);
    if (J(".itemlist-editmode-checkbox:checked").length === 0 && !Zotero.nav.getUrlVar("itemKey")) {
        J(".add-to-collection-link").button("option", "disabled", true).removeClass("ui-state-hover");
        J(".remove-from-collection-link").button("option", "disabled", true).removeClass("ui-state-hover");
        J(".move-to-trash-link").button("option", "disabled", true).removeClass("ui-state-hover");
        J(".remove-from-trash-link").button("option", "disabled", true).removeClass("ui-state-hover");
        J("#cite-link").button("option", "disabled", true);
        J("#export-link").button("option", "disabled", true);
    } else {
        J(".add-to-collection-link").button("option", "disabled", false).removeClass("ui-state-hover");
        J(".remove-from-collection-link").button("option", "disabled", false).removeClass("ui-state-hover");
        J(".move-to-trash-link").button("option", "disabled", false).removeClass("ui-state-hover");
        if (Zotero.nav.getUrlVar("collectionKey") == "trash") {
            J(".remove-from-trash-link").button("option", "disabled", false).removeClass("ui-state-hover");
        }
        J("#cite-link").button("option", "disabled", false);
        J("#export-link").button("option", "disabled", false);
    }
    if (!Zotero.nav.getUrlVar("collectionKey")) {
        J(".remove-from-collection-link").button("option", "disabled", true).removeClass("ui-state-hover");
    } else if (Zotero.nav.getUrlVar("collectionKey") == "trash") {
        J("#create-item-link").button("option", "disabled", true).removeClass("ui-state-hover");
        J(".add-to-collection-link").button("option", "disabled", true).removeClass("ui-state-hover");
        J(".remove-from-collection-link").button("option", "disabled", true).removeClass("ui-state-hover");
        J(".move-to-trash-link").prop("title", "Permanently Delete");
    }
    Zotero.ui.init.editButton();
};

Zotero.ui.showControlPanel = function(el) {
    Z.debug("Zotero.ui.showControlPanel", 3);
    var jel = J(el);
    var mode = Zotero.nav.getUrlVar("mode") || "view";
    if (Zotero.config.librarySettings.allowEdit === 0) {
        J(".permission-edit").hide();
        J("#control-panel").hide();
    }
};

Zotero.ui.nestHideCollectionTree = function(el, expandSelected) {
    if (typeof expandSelected == "undefined") {
        expandSelected = true;
    }
    var jel = J(el);
    jel.find("#collection-list ul").hide().siblings(".folder-toggle").children(".sprite-placeholder").removeClass("sprite-placeholder").addClass("ui-icon-triangle-1-e");
    jel.find(".current-collection").parents("ul").show();
    jel.find("#collection-list li.current-collection").children("ul").show();
    jel.find(".ui-icon-triangle-1-s").removeClass("ui-icon-triangle-1-s").addClass("ui-icon-triangle-1-e");
    jel.find("li.current-collection").parentsUntil("#collection-list").children("div.folder-toggle").find(".ui-icon-triangle-1-e").removeClass("ui-icon-triangle-1-e").addClass("ui-icon-triangle-1-s");
    if (expandSelected === false) {
        jel.find("#collection-list li.current-collection").children("ul").hide();
        jel.find("#collection-list li.current-collection").find(".ui-icon-triangle-1-s").removeClass("ui-icon-triangle-1-s").addClass("ui-icon-triangle-1-e");
        jel.find(".current-collection").data("expanded", false);
    } else {
        jel.find("li.current-collection").children("div.folder-toggle").find(".ui-icon-triangle-1-e").removeClass("ui-icon-triangle-1-e").addClass("ui-icon-triangle-1-s");
        jel.find(".current-collection").data("expanded", true);
    }
    Zotero.ui.createOnActivePage(el);
};

Zotero.ui.highlightCurrentCollection = function() {
    Z.debug("Zotero.ui.highlightCurrentCollection", 3);
    var collectionKey = Zotero.nav.getUrlVar("collectionKey");
    J("a.current-collection").closest("li").removeClass("current-collection");
    J("a.current-collection").removeClass("current-collection");
    if (collectionKey) {
        J("a[data-collectionKey='" + collectionKey + "']").addClass("current-collection");
        J("a[data-collectionKey='" + collectionKey + "']").closest("li").addClass("current-collection");
    } else {
        J("a.my-library").addClass("current-collection");
        J("a.my-library").closest("li").addClass("current-collection");
    }
};

Zotero.ui.updateCollectionButtons = function() {
    var editCollectionsButtonsList = J(".edit-collections-buttons-list");
    editCollectionsButtonsList.buttonset().show();
    J("#edit-collections-buttons-div").buttonset();
    J(".create-collection-link").button("option", "icons", {
        primary: "sprite-toolbar-collection-add"
    }).button("option", "text", false);
    J(".update-collection-link").button("option", "icons", {
        primary: "sprite-toolbar-collection-edit"
    }).button("option", "text", false);
    J(".delete-collection-link").button("option", "icons", {
        primary: "sprite-folder_delete"
    }).button("option", "text", false);
    if (Zotero.nav.getUrlVar("collectionKey")) {
        J(".update-collection-link").button("enable");
        J(".delete-collection-link").button("enable");
    } else {
        J(".update-collection-link").button().button("disable");
        J(".delete-collection-link").button().button("disable");
    }
};

Zotero.ui.createOnActivePage = function(el) {};

Zotero.ui.zoteroItemUpdated = function() {
    try {
        var ev = document.createEvent("HTMLEvents");
        ev.initEvent("ZoteroItemUpdated", true, true);
        document.dispatchEvent(ev);
    } catch (e) {
        Zotero.debug("Error triggering ZoteroItemUpdated event");
    }
};

Zotero.ui.callbacks.toggleEdit = function(e) {
    Z.debug("edit checkbox toggled", 3);
    if (J(this).prop("checked")) {
        Z.debug("has val: " + J(this).val());
        Zotero.nav.urlvars.pathVars["mode"] = "edit";
    } else {
        Z.debug("removing edit mode", 3);
        delete Zotero.nav.urlvars.pathVars["mode"];
    }
    Zotero.nav.pushState();
    return false;
};

Zotero.ui.callbacks.createCollection = function(e) {
    Z.debug("create-collection-link clicked", 3);
    Z.debug(J(this));
    var library = Zotero.ui.getAssociatedLibrary(J(this).closest(".ajaxload"));
    var ncollections = library.collections.nestedOrderingArray();
    var dialogEl = J("#create-collection-dialog").empty();
    if (Zotero.config.mobile) {
        J("#newcollectionformTemplate").tmpl({
            ncollections: ncollections
        }).replaceAll(dialogEl);
    } else {
        J("#newcollectionformTemplate").tmpl({
            ncollections: ncollections
        }).appendTo(dialogEl);
    }
    var currentCollectionKey = Zotero.nav.getUrlVar("collectionKey");
    J("#new-collection-parent").val(currentCollectionKey);
    var createFunction = J.proxy(function() {
        var parentCollectionKey = J("#new-collection-parent").val();
        var newCollectionTitle = J("input#new-collection-title-input").val() || "Untitled";
        var library = Zotero.ui.getAssociatedLibrary(J(this).closest("div.ajaxload"));
        var d = library.addCollection(newCollectionTitle, parentCollectionKey);
        d.done(J.proxy(function() {
            library.collections.dirty = true;
            Zotero.nav.pushState(true);
        }, this));
        Zotero.ui.closeDialog(J("#create-collection-dialog"));
    }, this);
    Zotero.ui.dialog(J("#create-collection-dialog"), {
        modal: true,
        buttons: {
            Create: createFunction,
            Cancel: function() {
                Zotero.ui.closeDialog(J("#create-collection-dialog"));
            }
        }
    });
    var width = J("#new-collection-parent").width() + 50;
    J("#create-collection-dialog").dialog("option", "width", width);
    return false;
};

Zotero.ui.callbacks.updateCollection = function(e) {
    Z.debug("update-collection-link clicked", 3);
    e.preventDefault();
    e.stopImmediatePropagation();
    var library = Zotero.ui.getAssociatedLibrary(J(this).closest(".ajaxload"));
    var ncollections = library.collections.nestedOrderingArray();
    var dialogEl = J("#modify-collection-dialog").empty();
    if (Zotero.config.mobile) {
        J("#updatecollectionformTemplate").tmpl({
            ncollections: ncollections
        }).replaceAll(dialogEl);
    } else {
        J("#updatecollectionformTemplate").tmpl({
            ncollections: ncollections
        }).appendTo(dialogEl);
    }
    var currentCollectionKey = Zotero.nav.getUrlVar("collectionKey");
    var currentCollection = library.collections[currentCollectionKey];
    var currentParentCollectionKey = currentCollection.parent;
    J("#update-collection-parent-select").val(currentParentCollectionKey);
    J("#updated-collection-title-input").val(library.collections[currentCollectionKey].title);
    var saveFunction = J.proxy(function() {
        var newCollectionTitle = J("input#updated-collection-title-input").val() || "Untitled";
        var newParentCollectionKey = J("#update-collection-parent-select").val();
        var collection = currentCollection;
        if (!collection) {
            Zotero.ui.jsNotificationMessage("Selected collection not found", "error");
            return false;
        }
        var d = collection.update(newCollectionTitle, newParentCollectionKey);
        d.done(J.proxy(function() {
            Zotero.ui.jsNotificationMessage("Collection Saved", "confirm");
            library.collections.dirty = true;
            Zotero.nav.pushState(true);
            Zotero.ui.closeDialog(J("#modify-collection-dialog"));
        }, this));
        Zotero.ui.closeDialog(J("#modify-collection-dialog"));
    }, this);
    Zotero.ui.dialog(J("#modify-collection-dialog"), {
        modal: true,
        buttons: {
            Save: saveFunction,
            Cancel: function() {
                Zotero.ui.closeDialog(J("#modify-collection-dialog"));
            }
        }
    });
    var width = J("#update-collection-parent-select").width() + 50;
    J("#modify-collection-dialog").dialog("option", "width", width);
    J("#updated-collection-title-input").select();
    return false;
};

Zotero.ui.callbacks.deleteCollection = function(e) {
    Z.debug("delete-collection-link clicked", 3);
    e.preventDefault();
    e.stopImmediatePropagation();
    var library = Zotero.ui.getAssociatedLibrary(J(this).closest(".ajaxload"));
    var currentCollectionKey = Zotero.nav.getUrlVar("collectionKey");
    var currentCollection = library.collections[currentCollectionKey];
    var dialogEl = J("#delete-collection-dialog").empty();
    J("#delete-collection-dialog").empty().append("");
    if (Zotero.config.mobile) {
        J("#deletecollectionformTemplate").tmpl({
            collection: currentCollection
        }).replaceAll(dialogEl);
    } else {
        J("#deletecollectionformTemplate").tmpl({
            collection: currentCollection
        }).appendTo(dialogEl);
    }
    J("#delete-collection-select").val(currentCollectionKey);
    var deleteFunction = J.proxy(function() {
        Z.debug("Zotero.ui.deleteSelectedCollection", 3);
        var collection = currentCollection;
        if (!collection) {
            Zotero.ui.jsNotificationMessage("Selected collection not found", "error");
            return false;
        }
        var d = collection.remove();
        d.done(J.proxy(function() {
            delete Zotero.nav.urlvars.pathVars["collectionKey"];
            library.collections.dirty = true;
            Zotero.nav.pushState();
            Zotero.ui.jsNotificationMessage(collection.title + " removed", "confirm");
        }, this));
        Zotero.ui.closeDialog(J("#delete-collection-dialog"));
        return false;
    }, this);
    Zotero.ui.dialog(J("#delete-collection-dialog"), {
        modal: true,
        buttons: {
            Delete: deleteFunction,
            Cancel: function() {
                Zotero.ui.closeDialog(J("#delete-collection-dialog"));
            }
        }
    });
    return false;
};

Zotero.ui.callbacks.createItem = function(e) {
    Z.debug("create-item-Link clicked", 3);
    var collectionKey = Zotero.nav.getUrlVar("collectionKey");
    if (collectionKey) {
        Zotero.nav.urlvars.pathVars = {
            action: "newItem",
            mode: "edit",
            collectionKey: collectionKey
        };
    } else {
        Zotero.nav.urlvars.pathVars = {
            action: "newItem",
            mode: "edit"
        };
    }
    Zotero.nav.pushState();
    return false;
};

Zotero.ui.callbacks.citeItems = function(e) {
    Z.debug("cite-item-link clicked", 3);
    e.preventDefault();
    var library = Zotero.ui.getAssociatedLibrary();
    var dialogEl = J("#cite-item-dialog").empty();
    if (Zotero.config.mobile) {
        J("#citeitemformTemplate").tmpl({}).replaceAll(dialogEl);
    } else {
        J("#citeitemformTemplate").tmpl({}).appendTo(dialogEl);
    }
    var citeFunction = function() {
        Z.debug("citeFunction", 3);
        Zotero.ui.showSpinner(J("#cite-box-div"));
        var style = J("#cite-item-select").val();
        Z.debug(style, 4);
        var itemKeys = Zotero.ui.getSelectedItemKeys(J("#edit-mode-items-form"));
        if (itemKeys.length === 0) {
            itemKeys = Zotero.ui.getAllFormItemKeys(J("#edit-mode-items-form"));
        }
        Z.debug(itemKeys, 4);
        var d = library.loadFullBib(itemKeys, style);
        d.done(function(bibContent) {
            J("#cite-box-div").html(bibContent);
        });
    };
    var width = J("#cite-item-select").width() + 150;
    if (!Zotero.config.mobile) {
        width = J("#cite-item-select").width() + 300;
    }
    Zotero.ui.dialog(J("#cite-item-dialog"), {
        modal: true,
        width: width
    });
    J("#cite-item-select").on("change", citeFunction);
    Z.debug("done with Zotero.ui.callbacks.citeItems");
    return false;
};

Zotero.ui.callbacks.showExportDialog = function(e) {
    Z.debug("export-link clicked", 3);
    var library = Zotero.ui.getAssociatedLibrary(J("#feed-link-div"));
    var dialogEl = J("#export-dialog").empty();
    if (Zotero.config.mobile) {
        J("#export-dialog").empty().append(J("#export-list").contents().clone());
    } else {
        J("#export-dialog").empty().append(J("#export-list").contents().clone());
    }
    var exportFunction = function() {
        Z.debug("exportFunction", 3);
    };
    Zotero.ui.dialog(J("#export-dialog"), {
        modal: true,
        buttons: {
            Cancel: function() {
                Zotero.ui.closeDialog(J("#export-dialog"));
            }
        }
    });
    Z.debug("done with Zotero.ui.callbacks.exportItems");
    return false;
};

Zotero.ui.callbacks.exportItems = function(e) {
    Z.debug("cite-item-link clicked", 3);
    e.preventDefault();
    var library = Zotero.ui.getAssociatedLibrary(J("#feed-link-div"));
    var urlconfig = J("#feed-link-div").data("urlconfig");
    var itemKeys = Zotero.ui.getSelectedItemKeys(J("#edit-mode-items-form"));
    var requestedFormat = J(this).data("exportformat");
    var exportConfig = J.extend(urlconfig, {
        format: requestedFormat
    });
    var itemKeyString = itemKeys.join(",");
    if (itemKeyString !== "") {
        exportConfig["itemKey"] = itemKeyString;
    }
    var exportUrl = Zotero.ajax.apiRequestUrl(exportConfig) + Zotero.ajax.apiQueryString(exportConfig);
    window.open(exportUrl, "_blank");
};

Zotero.ui.callbacks.uploadAttachment = function(e) {
    Z.debug("uploadAttachment", 3);
    e.preventDefault();
    var library = Zotero.ui.getAssociatedLibrary(J(this).closest(".ajaxload"));
    var dialogEl = J("#upload-attachment-dialog").empty();
    if (Zotero.config.mobile) {
        J("#attachmentuploadTemplate").tmpl({}).replaceAll(dialogEl);
    } else {
        J("#attachmentuploadTemplate").tmpl({}).appendTo(dialogEl);
    }
    var uploadFunction = function() {
        Z.debug("uploadFunction", 3);
        var fileInfo = J("#attachmentuploadfileinfo").data("fileInfo");
        Zotero.ui.showSpinner(J("#fileuploadspinner"));
        var parentItemKey = Zotero.nav.getUrlVar("itemKey");
        var parentItem = library.items.getItem(parentItemKey);
        var item = new Zotero.Item;
        item.owningLibrary = library;
        item.libraryType = library.type;
        item.libraryID = library.libraryID;
        item.parentItemKey = parentItemKey;
        var templateItemDeferred = item.initEmpty("attachment", "imported_file");
        templateItemDeferred.done(function(item) {
            Z.debug("templateItemDeferred callback");
            item.title = J("#upload-file-title-input").val();
            item.apiObj["title"] = item.title;
            console.log("new title: " + item.apiObj["title"]);
            var jqxhr = item.writeItem();
            jqxhr.done(J.proxy(function(newItemKey) {
                var userSetFilename = J("#upload-file-title-input").val() || fileInfo.filename;
                var uploadAuth = item.getUploadAuthorization({
                    md5: fileInfo.md5,
                    filename: userSetFilename,
                    filesize: fileInfo.filesize,
                    mtime: fileInfo.mtime,
                    contentType: fileInfo.contentType,
                    params: 1
                });
                uploadAuth.done(function(data, textStatus, XMLHttpRequest) {
                    Z.debug("uploadAuth callback", 3);
                    var upAuthOb;
                    Z.debug(data, 4);
                    if (typeof data == "string") {
                        upAuthOb = JSON.parse(data);
                    } else {
                        upAuthOb = data;
                    }
                    if (upAuthOb.exists == 1) {
                        Zotero.ui.closeDialog(J("#upload-attachment-dialog"));
                        parentItem.numChildren++;
                        Zotero.nav.pushState(true);
                    } else {
                        var filedata = J("#attachmentuploadfileinfo").data("fileInfo").reader.result;
                        var file = J("#attachmentuploadfileinfo").data("file");
                        var fullUpload = Zotero.file.uploadFile(upAuthOb, file);
                        fullUpload.done(function() {
                            Z.debug("fullUpload done", 3);
                            var regUpload = item.registerUpload(upAuthOb.uploadKey);
                            regUpload.done(function() {
                                Zotero.ui.closeDialog(J("#upload-attachment-dialog"));
                                parentItem.numChildren++;
                                Zotero.nav.pushState(true);
                            }).fail(function(jqxhr, textStatus, e) {
                                Z.debug("Upload registration failed - " + textStatus, 3);
                                Zotero.ui.jsNotificationMessage("Error registering upload", "error");
                                if (jqxhr.status == 412) {
                                    Z.debug("412 Precondition Failed on upload registration", 3);
                                    Zotero.ui.jsNotificationMessage("The file has changed remotely", "error");
                                }
                                Zotero.ui.closeDialog(J("#upload-attachment-dialog"));
                            });
                        });
                        fullUpload.upload.onprogress = function(e) {
                            Z.debug("fullUpload.upload.onprogress");
                            var percentLoaded = Math.round(e.loaded / e.total * 100);
                            Z.debug("Upload progress event:" + e.loaded + " / " + e.total + " : " + percentLoaded + "%");
                            J("#uploadprogressmeter").val(percentLoaded);
                        };
                    }
                }).fail(function(jqxhr, textStatus, e) {
                    Z.debug("Upload authorization failed - " + textStatus, 3);
                    Zotero.ui.jsNotificationMessage("Error getting upload authorization", "error");
                    switch (jqxhr.status) {
                      case 400:
                        Z.debug("400 Bad request on upload authorization");
                        Z.debug(jqxhr.responseText);
                        break;
                      case 403:
                        Z.debug("403 Access denied uploading attachment", 3);
                        Zotero.ui.jsNotificationMessage("You do not have permission to edit files", "error");
                        break;
                      case 409:
                        Z.debug("409 Library locked uploading attachment", 3);
                        Zotero.ui.jsNotificationMessage("The library is currently locked. Please try again in a few minutes.", "error");
                        break;
                      case 412:
                        Z.debug("412 Precondition failed uploading attachment", 3);
                        Zotero.ui.jsNotificationMessage("File conflict. Remote file has changed", "error");
                        break;
                      case 413:
                        Z.debug("413 Too large uploading attachment", 3);
                        Zotero.ui.jsNotificationMessage("Requested upload would exceed storage quota.", "error");
                        break;
                      case 428:
                        Z.debug("428 Precondition failed uploading attachment", 3);
                        Zotero.ui.jsNotificationMessage("Precondition required error", "error");
                        break;
                      case 429:
                        Z.debug("429 Too many requests uploading attachment", 3);
                        Zotero.ui.jsNotificationMessage("Too many uploads pending. Please try again in a few minutes", "error");
                        break;
                    }
                    Zotero.ui.closeDialog(J("#upload-attachment-dialog"));
                });
            }));
        });
    };
    Zotero.ui.dialog(J("#upload-attachment-dialog"), {
        modal: true,
        buttons: {
            Upload: uploadFunction,
            Cancel: function() {
                Zotero.ui.closeDialog(J("#upload-attachment-dialog"));
            }
        },
        width: 350
    });
    var width = J("#fileuploadinput").width() + 50;
    J("#upload-attachment-dialog").dialog("option", "width", width);
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
    J("#fileuploaddroptarget").on("dragenter dragover", function(e) {
        e.stopPropagation();
        e.preventDefault();
    });
    J("#fileuploaddroptarget").on("drop", function(je) {
        Z.debug("fileuploaddroptarget drop callback", 3);
        je.stopPropagation();
        je.preventDefault();
        var e = je.originalEvent;
        var dt = e.dataTransfer;
        var files = dt.files;
        handleFiles(files);
    });
    J("#fileuploadinput").on("change", function(je) {
        Z.debug("fileuploaddroptarget callback 1");
        je.stopPropagation();
        je.preventDefault();
        var files = J("#fileuploadinput").get(0).files;
        handleFiles(files);
    });
    return false;
};

Zotero.ui.callbacks.moveToTrash = function(e) {
    e.preventDefault();
    Z.debug("move-to-trash clicked", 3);
    var itemKeys = [];
    if (Zotero.nav.getUrlVar("itemKey")) {
        itemKeys = [ Zotero.nav.getUrlVar("itemKey") ];
    } else {
        itemKeys = Zotero.ui.getSelectedItemKeys(J("#edit-mode-items-form"));
    }
    Z.debug(itemKeys, 3);
    var library = Zotero.ui.getAssociatedLibrary(J(this).closest("div.ajaxload"));
    var responses = [];
    Zotero.ui.showSpinner(J("#library-items-div"));
    if (Zotero.nav.getUrlVar("collectionKey") == "trash") {
        J.each(itemKeys, function(index, itemKey) {
            var i = library.items.getItem(itemKey);
            if (i.apiObj.deleted == 1) {
                var response = library.deleteItem(itemKey);
                responses.push(response);
            }
        });
    } else {
        J.each(itemKeys, function(index, itemKey) {
            var response = library.trashItem(itemKey);
            responses.push(response);
        });
    }
    library.dirty = true;
    J.when.apply(J, responses).then(function() {
        Zotero.nav.clearUrlVars([ "collectionKey", "tag", "q" ]);
        Zotero.nav.pushState(true);
    });
    return false;
};

Zotero.ui.callbacks.removeFromTrash = function(e) {
    Z.debug("remove-from-trash clicked", 3);
    var itemKeys = [];
    if (Zotero.nav.getUrlVar("itemKey")) {
        itemKeys = [ Zotero.nav.getUrlVar("itemKey") ];
    } else {
        itemKeys = Zotero.ui.getSelectedItemKeys(J("#edit-mode-items-form"));
    }
    Z.debug(itemKeys, 4);
    var library = Zotero.ui.getAssociatedLibrary(J(this).closest("div.ajaxload"));
    var responses = [];
    Zotero.ui.showSpinner(J("#library-items-div"));
    J.each(itemKeys, function(index, itemKey) {
        var i = library.items.getItem(itemKey);
        if (i.apiObj.deleted == 1) {
            var response = library.untrashItem(itemKey);
            responses.push(response);
        }
    });
    library.dirty = true;
    J.when.apply(J, responses).then(function() {
        Zotero.nav.clearUrlVars([ "collectionKey", "tag", "q" ]);
        Zotero.nav.pushState(true);
    });
    return false;
};

Zotero.ui.callbacks.removeFromCollection = function(e) {
    Z.debug("remove-from-collection clicked", 3);
    var itemKeys = Zotero.ui.getSelectedItemKeys(J("#edit-mode-items-form"));
    var library = Zotero.ui.getAssociatedLibrary(J(this).closest("div.ajaxload"));
    var collectionKey = Zotero.nav.getUrlVar("collectionKey");
    var collection = library.collections[collectionKey];
    var responses = [];
    J.each(itemKeys, function(index, itemKey) {
        var response = collection.removeItem(itemKey);
        responses.push(response);
    });
    library.dirty = true;
    J.when.apply(this, responses).then(function() {
        Z.debug("removal responses finished. forcing reload", 3);
        Zotero.nav.clearUrlVars([ "collectionKey", "tag" ]);
        Zotero.nav.pushState(true);
    });
    return false;
};

Zotero.ui.callbacks.addToCollection = function(e) {
    Z.debug("add-to-collection-link clicked", 3);
    e.preventDefault();
    var library = Zotero.ui.getAssociatedLibrary();
    var dialogEl = J("#add-to-collection-dialog").empty();
    Z.debug(library.collections.ncollections, 4);
    J("#addtocollectionformTemplate").tmpl({
        ncollections: library.collections.nestedOrderingArray()
    }).appendTo(dialogEl);
    var addToFunction = J.proxy(function() {
        Z.debug("add-to-collection-select changed", 3);
        var targetCollection = J("#target-collection").val();
        Z.debug("move to: " + targetCollection, 4);
        Zotero.ui.addToCollection(targetCollection, library);
        Zotero.ui.closeDialog(J("#add-to-collection-dialog"));
        return false;
    }, this);
    Zotero.ui.dialog(J("#add-to-collection-dialog"), {
        modal: true,
        buttons: {
            Add: addToFunction,
            Cancel: function() {
                J("#add-to-collection-dialog").dialog("close");
            }
        }
    });
    var width = J("#target-collection").width() + 50;
    J("#add-to-collection-dialog").dialog("option", "width", width);
    return false;
};

Zotero.ui.callbacks.librarySettings = function(e) {
    Z.debug("library-settings-link clicked", 3);
    e.preventDefault();
    var dialogEl = J("#library-settings-dialog").empty();
    J("#librarysettingsTemplate").tmpl({
        columnFields: Zotero.Library.prototype.displayableColumns
    }).appendTo(dialogEl);
    J("#display-column-field-title").prop("checked", true).prop("disabled", true);
    J.each(Zotero.prefs.library_listShowFields, function(index, value) {
        var idstring = "#display-column-field-" + value;
        J(idstring).prop("checked", true);
    });
    var submitFunction = J.proxy(function() {
        var showFields = [];
        J("#library-settings-form").find("input:checked").each(function() {
            showFields.push(J(this).val());
        });
        var stringShowFields = showFields.join(",");
        Zotero.utils.setUserPref("library_listShowFields", stringShowFields);
        Zotero.prefs.library_listShowFields = showFields;
        Zotero.callbacks.loadItems(J("#library-items-div"));
        Zotero.ui.closeDialog(J("#library-settings-dialog"));
    }, this);
    Zotero.ui.dialog(J("#library-settings-dialog"), {
        modal: true,
        buttons: {
            Save: submitFunction,
            Cancel: function() {
                Zotero.ui.closeDialog(J("#library-settings-dialog"));
            }
        }
    });
};

Zotero.ui.callbacks.sortBy = function(e) {
    Z.debug("sort by link clicked", 3);
    e.preventDefault();
    var currentOrderField = Zotero.nav.getUrlVar("order") || Zotero.config.userDefaultApiArgs.order;
    var currentOrderSort = Zotero.nav.getUrlVar("sort") || Zotero.config.sortOrdering[currentOrderField] || "asc";
    var dialogEl = J("#sort-dialog");
    J("#sortdialogTemplate").tmpl({
        columnFields: Zotero.Library.prototype.displayableColumns,
        currentOrderField: currentOrderField
    }).replaceAll(dialogEl);
    var submitFunction = J.proxy(function() {
        Z.debug("Zotero.ui.callbacks.sortBy submit callback");
        var currentOrderField = Zotero.nav.getUrlVar("order") || Zotero.config.userDefaultApiArgs.order;
        var currentOrderSort = Zotero.nav.getUrlVar("sort") || Zotero.config.userDefaultApiArgs.sort || Zotero.config.sortOrdering[currentOrderField] || "asc";
        var newOrderField = J("#sortColumnSelect").val();
        var newOrderSort = J("#sortOrderSelect").val() || Zotero.config.sortOrdering[newOrderField];
        if (J.inArray(newOrderField, Zotero.Library.prototype.sortableColumns) == -1) {
            return false;
        }
        if (currentOrderField == newOrderField && currentOrderSort == newOrderSort) {
            if (newOrderSort == "asc") {
                newOrderSort = "desc";
            } else {
                newOrderSort = "asc";
            }
        }
        if (!newOrderField) {
            Zotero.ui.jsNotificationMessage("no order field mapped to column");
            return false;
        }
        Zotero.nav.urlvars.pathVars["order"] = newOrderField;
        Zotero.nav.urlvars.pathVars["sort"] = newOrderSort;
        Zotero.nav.pushState();
        Zotero.config.userDefaultApiArgs.sort = newOrderSort;
        Zotero.config.userDefaultApiArgs.order = newOrderField;
        Zotero.utils.setUserPref("library_defaultSort", newOrderField + "," + newOrderSort);
        Zotero.ui.closeDialog(J("#sort-dialog"));
    }, this);
    Zotero.ui.dialog(J("#sort-dialog"), {
        modal: true,
        buttons: {
            Save: submitFunction,
            Cancel: function() {
                Zotero.ui.closeDialog(J("#sort-dialog"));
            }
        }
    });
};

Zotero.url.itemHref = function(item) {
    var href = "";
    var library = item.owningLibrary;
    href += library.libraryBaseWebsiteUrl + "/itemKey/" + item.itemKey;
    return href;
};

Zotero.url.attachmentDownloadLink = function(item) {
    var linkString = "";
    var enctype, enc, filesize, filesizeString;
    var downloadHref = "";
    if (item.links["enclosure"]) {
        if (Zotero.config.directDownloads) {
            downloadHref = Zotero.url.apiDownloadUrl(item);
        } else {
            downloadHref = Zotero.url.wwwDownloadUrl(item);
        }
        var tail = item.links["enclosure"]["href"].substr(-4, 4);
        if (tail == "view") {
            linkString += '<a href="' + downloadHref + '">' + "View Snapshot</a>";
        } else {
            enctype = Zotero.utils.translateMimeType(item.links["enclosure"].type);
            enc = item.links["enclosure"];
            filesize = parseInt(enc["length"], 10);
            filesizeString = "" + filesize + " B";
            if (filesize > 1073741824) {
                filesizeString = "" + (filesize / 1073741824).toFixed(1) + " GB";
            } else if (filesize > 1048576) {
                filesizeString = "" + (filesize / 1048576).toFixed(1) + " MB";
            } else if (filesize > 1024) {
                filesizeString = "" + (filesize / 1024).toFixed(1) + " KB";
            }
            Z.debug(enctype);
            linkString += '<a href="' + downloadHref + '">';
            if (enctype == "undefined" || enctype === "" || typeof enctype == "undefined") {
                linkString += filesizeString + "</a>";
            } else {
                linkString += enctype + ", " + filesizeString + "</a>";
            }
            return linkString;
        }
    }
    return linkString;
};

Zotero.url.wwwDownloadUrl = function(item) {
    var urlString = "";
    if (item.links["enclosure"]) {
        if (Zotero.config.directDownloads) {
            return Zotero.url.apiDownloadUrl(item);
        }
        urlString = Zotero.config.baseWebsiteUrl + Zotero.config.nonparsedBaseUrl + "/" + item.itemKey + "/file";
        var tail = item.links["enclosure"]["href"].substr(-4, 4);
        if (tail == "view") {
            urlString += "/view";
        }
    } else if (item.linkMode == 2 || item.linkMode == 3) {
        if (item.apiObj["url"]) {
            urlString = item.apiObj["url"];
        }
    }
    return urlString;
};

Zotero.url.apiDownloadUrl = function(item) {
    var retString = "";
    if (item.links["enclosure"]) {
        retString = item.links["enclosure"]["href"];
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
        if (enctype == "undefined" || enctype === "" || typeof enctype == "undefined") {
            return "(" + filesizeString + ")";
        } else {
            return "(" + enctype + ", " + filesizeString + ")";
        }
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
    Z.debug(exportUrls);
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
        qparams["keyredirect"] = redirect;
    }
    queryParamsArray = [];
    J.each(qparams, function(index, value) {
        queryParamsArray.push(encodeURIComponent(index) + "=" + encodeURIComponent(value));
    });
    queryString = "?" + queryParamsArray.join("&");
    return apiKeyBase + queryString;
};

Zotero.callbacks.loadFullLibrary = function(el) {
    Zotero.debug("Zotero.callbacks.loadFullLibrary", 3);
    var library = Zotero.ui.getAssociatedLibrary(el);
    var displayParams = {};
    var selectedTags = Zotero.nav.getUrlVar("tag");
    if (!J.isArray(selectedTags)) {
        if (selectedTags) {
            selectedTags = [ selectedTags ];
        } else {
            selectedTags = [];
        }
    }
    if (J("#library").hasClass("loaded")) {
        Zotero.callbacks.chooseItemPane(J("#items-pane"));
        Zotero.ui.highlightCurrentCollection();
        Zotero.ui.nestHideCollectionTree(J("#collection-list-container"));
        var plainList = library.tags.plainTagsList(library.tags.tagsArray);
        Zotero.ui.displayTagsFiltered(J("#tags-list-div"), library.tags, plainList, selectedTags);
        Zotero.ui.displayItemOrTemplate(library);
        Z.debug("Building new items list to display", 3);
        displayParams = J.extend({}, Zotero.config.defaultApiArgs, Zotero.config.userDefaultApiArgs, Zotero.nav.getUrlVars());
        Z.debug(displayParams);
        library.buildItemDisplayView(displayParams);
    } else {
        Zotero.offline.initializeOffline();
    }
};

Zotero.ui.init.offlineLibrary = function() {
    Z.debug("Zotero.ui.init.offlineLibrary", 3);
    Zotero.ui.init.libraryControls();
    Zotero.ui.init.tags();
    Zotero.ui.init.collections();
    Zotero.ui.init.items();
    J.subscribe("loadItemsFromKeysParallelDone", function() {
        J.publish("displayedItemsUpdated");
    });
    J.subscribe("displayedItemsUpdated", function() {
        Z.debug("displayedItemsUpdated triggered", 3);
        var library = Zotero.ui.getAssociatedLibrary(J("#library"));
        Zotero.ui.displayItemsFullLocal(J("#library-items-div"), {}, library);
    });
    J.subscribe("collectionsUpdated", function() {
        Z.debug("collectionsUpdated triggered", 3);
        var library = Zotero.ui.getAssociatedLibrary(J("#library"));
        Zotero.ui.displayCollections(J("#collection-list-container"), library.collections.collectionsArray);
    });
    J.subscribe("tagsUpdated", function() {
        Z.debug("tagsUpdated triggered", 3);
        var library = Zotero.ui.getAssociatedLibrary(J("#library"));
        var plainList = library.tags.plainTagsList(library.tags.tagsArray);
        var matchedList = Zotero.utils.prependAutocomplete("", plainList);
        Zotero.ui.displayTagsFiltered(J("#tags-list-container"), library.tags, matchedList, selectedTags);
    });
    J("#makeAvailableOfflineLink").bind("click", J.proxy(function(e) {
        e.preventDefault();
        var library = Zotero.ui.getAssociatedLibrary(J("#library"));
        var collectionKey = Zotero.nav.getUrlVar("collectionKey");
        var itemKeys;
        if (collectionKey) {
            library.saveCollectionFilesOffline(collectionKey);
        } else {
            library.saveFileSetOffline(library.itemKeys);
        }
    }, this));
};

Zotero.ui.displayItemsFullLocal = function(el, config, library) {
    Z.debug("Zotero.ui.displayItemsFullLocal", 3);
    Z.debug(config, 4);
    var jel = J(el);
    var filledConfig = J.extend({}, Zotero.config.defaultApiArgs, Zotero.config.userDefaultApiArgs, config);
    var titleParts = [ "", "", "" ];
    var displayFields = Zotero.prefs.library_listShowFields;
    if (library.libraryType != "group") {
        displayFields = J.grep(displayFields, function(el, ind) {
            return J.inArray(el, Zotero.Library.prototype.groupOnlyColumns) == -1;
        });
    }
    var editmode = Zotero.config.librarySettings.allowEdit ? true : false;
    var itemsTableData = {
        titleParts: titleParts,
        displayFields: displayFields,
        items: library.items.displayItemsArray,
        editmode: editmode,
        order: filledConfig["order"],
        sort: filledConfig["sort"],
        library: library
    };
    jel.empty();
    Zotero.ui.insertItemsTable(jel, itemsTableData);
    if (Zotero.config.mobile) {
        Zotero.ui.createOnActivePage(el);
        return;
    }
    Zotero.ui.updateDisabledControlButtons();
    Zotero.ui.libraryBreadcrumbs();
    Zotero.ui.createOnActivePage(el);
};

Zotero.ui.showChildrenLocal = function(el, itemKey) {
    Z.debug("Zotero.ui.showChildrenLocal", 3);
    var library = Zotero.ui.getAssociatedLibrary(J(el).closest("div.ajaxload"));
    var item = library.items.getItem(itemKey);
    var attachmentsDiv = J(el).find(".item-attachments-div");
    Zotero.ui.showSpinner(attachmentsDiv);
    var childItemKeys = item.childItemKeys;
    var childItems = library.items.getItems(childItemKeys);
    J("#childitemsTemplate").tmpl({
        childItems: childItems
    }).appendTo(J(".item-attachments-div").empty());
    Zotero.ui.createOnActivePage(el);
};

Zotero.ui.localDownloadLink = function(item, el) {
    Z.debug("Zotero.ui.localDownloadLink");
    if (item.links && item.links.enclosure) {
        Z.debug("should have local file");
        var d = item.owningLibrary.filestorage.getSavedFileObjectUrl(item.itemKey);
        d.done(function(url) {
            Z.debug("got item's object url - adding to table");
            J("table.item-info-table tbody").append("<tr><th>Local Copy</th><td><a href='" + url + "'>Open</a></td></tr>");
        });
    } else {
        Z.debug("Missing link?");
    }
};

Zotero.ui.displayItemOrTemplate = function(library) {
    if (Zotero.nav.getUrlVar("action") == "newItem") {
        var itemType = Zotero.nav.getUrlVar("itemType");
        if (!itemType) {
            J("#item-details-div").empty();
            J("#itemtypeselectTemplate").tmpl({
                itemTypes: Zotero.localizations.typeMap
            }).appendTo(J("#item-details-div"));
            return;
        } else {
            var newItem = new Zotero.Item;
            newItem.libraryType = library.libraryType;
            newItem.libraryID = library.libraryID;
            d = newItem.initEmpty(itemType);
            J("#item-details-div").data("pendingDeferred", d);
            d.done(Zotero.ui.loadNewItemTemplate);
            d.fail(function(jqxhr, textStatus, errorThrown) {
                Zotero.ui.jsNotificationMessage("Error loading item template", "error");
            });
        }
    } else {
        var itemKey = Zotero.nav.getUrlVar("itemKey");
        if (itemKey) {
            var item = library.items.getItem(itemKey);
            if (item) {
                Z.debug("have item locally, loading details into ui", 3);
                if (Zotero.nav.getUrlVar("mode") == "edit") {
                    Zotero.ui.editItemForm(J("#item-details-div"), item);
                } else {
                    Zotero.ui.loadItemDetail(item, J("#item-details-div"));
                    Zotero.ui.showChildrenLocal(J("#item-details-div"), itemKey);
                    Zotero.ui.localDownloadLink(item, J("#item-details-div"));
                }
            }
        }
    }
};

Zotero.offline.initializeOffline = function() {
    Z.debug("Zotero.offline.initializeOffline", 3);
    var libraryDataDeferred = new J.Deferred;
    var cacheConfig = {
        target: "userlibrarydata"
    };
    var userLibraryData = Zotero.cache.load(cacheConfig);
    if (userLibraryData) {
        Z.debug("had cached library data - resolving immediately");
        J("#library").data("loadconfig", userLibraryData.loadconfig);
        libraryDataDeferred.resolve(userLibraryData);
    } else {
        Z.debug("don't have cached library config data - fetching from server");
        J.getJSON("/user/userlibrarydata", J.proxy(function(data, textStatus, jqxhr) {
            Z.debug("got back library config data from server");
            if (data.loggedin === false) {
                window.location = "/user/login";
                return false;
            } else {
                J("#library").data("loadconfig", data.loadconfig);
                userLibraryData = data;
                libraryDataDeferred.resolve(userLibraryData);
            }
        }, this));
    }
    libraryDataDeferred.done(function(userLibraryData) {
        Zotero.debug("Got library data");
        Zotero.debug(userLibraryData);
        Zotero.loadConfig(userLibraryData);
        var library = Zotero.ui.getAssociatedLibrary(J("#library"));
        Zotero.offline.loadAllItems(library);
        Zotero.offline.loadAllCollections(library);
        Zotero.offline.loadAllTags(library);
        Zotero.offline.loadMetaInfo(library);
    });
};

Zotero.offline.loadAllItems = function(library) {
    Z.debug("Zotero.offline.loadAllItems", 3);
    var itemsCacheConfig = {
        libraryType: library.libraryType,
        libraryID: library.libraryID,
        target: "allitems"
    };
    var haveCachedItems = library.loadCachedItems();
    if (haveCachedItems) {
        displayParams = Zotero.nav.getUrlVars();
        library.buildItemDisplayView(displayParams);
    }
    var itemKeysDeferred = library.fetchItemKeysModified();
    itemKeysDeferred.done(J.proxy(function(data, keysjqxhr) {
        Z.debug("Got back itemKeys ordered by modified", 3);
        var itemKeys = J.trim(data).split("\n");
        library.itemKeys = itemKeys;
        if (haveCachedItems === 0 && itemKeys.length > 0) haveCachedItems = false;
        if (haveCachedItems !== false) {
            Z.debug("have cached items", 3);
            var missingItemKeys = library.findMissingItems(itemKeys);
            var missingItemsDeferred = library.loadItemsFromKeysParallel(missingItemKeys);
            var modifiedItemsDeferred = library.loadModifiedItems(itemKeys);
            J.when(missingItemsDeferred, modifiedItemsDeferred).then(J.proxy(function() {
                Z.debug("Building new items list to display", 3);
                displayParams = Zotero.nav.getUrlVars();
                library.buildItemDisplayView(displayParams);
                Zotero.cache.save(itemsCacheConfig, library.items.dump());
                Zotero.callbacks.chooseItemPane(J("#items-pane"));
                Zotero.ui.displayItemOrTemplate(library);
            }));
        } else {
            var loadAllItemsDeferred = library.loadItemsFromKeysParallel(itemKeys);
            loadAllItemsDeferred.done(J.proxy(function() {
                var displayParams = Zotero.nav.getUrlVars();
                Z.debug(displayParams);
                library.buildItemDisplayView(displayParams);
                Zotero.cache.save(itemsCacheConfig, library.items.dump());
            }, this));
        }
    }, this));
};

Zotero.offline.loadAllCollections = function(library) {
    Z.debug("Zotero.offline.loadAllCollections", 3);
    var collectionsCacheConfig = {
        libraryType: library.libraryType,
        libraryID: library.libraryID,
        target: "allcollections"
    };
    var collectionMembersConfig = {
        libraryType: library.libraryType,
        libraryID: library.libraryID,
        target: "collectionmembers"
    };
    Zotero.ui.updateCollectionButtons();
    var haveCachedCollections = library.loadCachedCollections();
    var clist = J("#collection-list-container");
    if (haveCachedCollections) {
        Z.debug("haveCachedCollections", 3);
        clist.empty();
        Zotero.ui.displayCollections(clist, library.collections);
        Zotero.ui.nestHideCollectionTree(clist);
        Zotero.ui.highlightCurrentCollection();
        var collectionMembershipD = library.loadCollectionMembership(library.collections.collectionsArray);
        collectionMembershipD.done(J.proxy(function() {
            Zotero.cache.save(collectionsCacheConfig, library.collections.dump());
        }, this));
    } else {
        Z.debug("dont have collections - load them", 3);
        var d = library.loadCollections();
        d.done(J.proxy(function() {
            clist.empty();
            Zotero.ui.displayCollections(clist, library.collections);
            Zotero.ui.highlightCurrentCollection();
            Zotero.ui.nestHideCollectionTree(clist);
            Zotero.cache.save(collectionsCacheConfig, library.collections.dump());
            var collectionMembershipD = library.loadCollectionMembership(library.collections.collectionsArray);
            collectionMembershipD.done(J.proxy(function() {
                Zotero.cache.save(collectionsCacheConfig, library.collections.dump());
            }, this));
        }, this));
        d.fail(J.proxy(function(jqxhr, textStatus, errorThrown) {
            var elementMessage = Zotero.ui.ajaxErrorMessage(jqxhr);
            jel.html("<p>" + elementMessage + "</p>");
        }));
    }
};

Zotero.offline.loadAllTags = function(library) {
    Z.debug("Zotero.offline.loadAllTags", 3);
    var tagsCacheConfig = {
        libraryType: library.libraryType,
        libraryID: library.libraryID,
        target: "alltags"
    };
    var tagsEl = J("#tags-list-container");
    var loadTagsDeferred = library.loadAllTags({});
    var selectedTags = Zotero.nav.getUrlVar("tag");
    if (!J.isArray(selectedTags)) {
        if (selectedTags) {
            selectedTags = [ selectedTags ];
        } else {
            selectedTags = [];
        }
    }
    loadTagsDeferred.done(J.proxy(function(tags) {
        Z.debug("finished loadAllTags", 3);
        tagsEl.find("div.loading").empty();
        Z.debug(tags, 5);
        library.tags.loaded = true;
        library.tags.loadedConfig = {};
        tagsEl.children(".loading").empty();
        var plainList = library.tags.plainTagsList(library.tags.tagsArray);
        Zotero.ui.displayTagsFiltered(tagsEl, library.tags, plainList, selectedTags);
        Zotero.nav.doneLoading(tagsEl);
    }, this));
    loadTagsDeferred.fail(J.proxy(function(jqxhr, textStatus, errorThrown) {
        var elementMessage = Zotero.ui.ajaxErrorMessage(jqxhr);
        jel.html("<p>" + elementMessage + "</p>");
    }));
    J("#library").addClass("loaded");
};

Zotero.offline.loadMetaInfo = function(library) {
    Z.debug("Zotero.offline.loadMetaInfo", 3);
    if (Zotero.Item.prototype.itemTypes) {
        Z.debug("have itemTypes, fetching item templates", 3);
        var itemTypes = Zotero.Item.prototype.itemTypes;
        var type;
        J.each(itemTypes, function(ind, val) {
            type = val.itemType;
            if (type != "attachment") {
                Zotero.Item.prototype.getItemTemplate(type);
            }
            Zotero.Item.prototype.getCreatorTypes(type);
        });
        Zotero.Item.prototype.getItemTemplate("attachment", "imported_file");
        Zotero.Item.prototype.getItemTemplate("attachment", "imported_url");
        Zotero.Item.prototype.getItemTemplate("attachment", "linked_file");
        Zotero.Item.prototype.getItemTemplate("attachment", "linked_url");
    } else {
        Z.debug("Dont yet have itemTypes, can't fetch item templates", 3);
    }
};