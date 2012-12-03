/*
 * jQuery BBQ: Back Button & Query Library - v1.2.1 - 2/17/2010
 * http://benalman.com/projects/jquery-bbq-plugin/
 * 
 * Copyright (c) 2010 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */
(function($,p){var i,m=Array.prototype.slice,r=decodeURIComponent,a=$.param,c,l,v,b=$.bbq=$.bbq||{},q,u,j,e=$.event.special,d="hashchange",A="querystring",D="fragment",y="elemUrlAttr",g="location",k="href",t="src",x=/^.*\?|#.*$/g,w=/^.*\#/,h,C={};function E(F){return typeof F==="string"}function B(G){var F=m.call(arguments,1);return function(){return G.apply(this,F.concat(m.call(arguments)))}}function n(F){return F.replace(/^[^#]*#?(.*)$/,"$1")}function o(F){return F.replace(/(?:^[^?#]*\?([^#]*).*$)?.*/,"$1")}function f(H,M,F,I,G){var O,L,K,N,J;if(I!==i){K=F.match(H?/^([^#]*)\#?(.*)$/:/^([^#?]*)\??([^#]*)(#?.*)/);J=K[3]||"";if(G===2&&E(I)){L=I.replace(H?w:x,"")}else{N=l(K[2]);I=E(I)?l[H?D:A](I):I;L=G===2?I:G===1?$.extend({},I,N):$.extend({},N,I);L=a(L);if(H){L=L.replace(h,r)}}O=K[1]+(H?"#":L||!K[1]?"?":"")+L+J}else{O=M(F!==i?F:p[g][k])}return O}a[A]=B(f,0,o);a[D]=c=B(f,1,n);c.noEscape=function(G){G=G||"";var F=$.map(G.split(""),encodeURIComponent);h=new RegExp(F.join("|"),"g")};c.noEscape(",/");$.deparam=l=function(I,F){var H={},G={"true":!0,"false":!1,"null":null};$.each(I.replace(/\+/g," ").split("&"),function(L,Q){var K=Q.split("="),P=r(K[0]),J,O=H,M=0,R=P.split("]["),N=R.length-1;if(/\[/.test(R[0])&&/\]$/.test(R[N])){R[N]=R[N].replace(/\]$/,"");R=R.shift().split("[").concat(R);N=R.length-1}else{N=0}if(K.length===2){J=r(K[1]);if(F){J=J&&!isNaN(J)?+J:J==="undefined"?i:G[J]!==i?G[J]:J}if(N){for(;M<=N;M++){P=R[M]===""?O.length:R[M];O=O[P]=M<N?O[P]||(R[M+1]&&isNaN(R[M+1])?{}:[]):J}}else{if($.isArray(H[P])){H[P].push(J)}else{if(H[P]!==i){H[P]=[H[P],J]}else{H[P]=J}}}}else{if(P){H[P]=F?i:""}}});return H};function z(H,F,G){if(F===i||typeof F==="boolean"){G=F;F=a[H?D:A]()}else{F=E(F)?F.replace(H?w:x,""):F}return l(F,G)}l[A]=B(z,0);l[D]=v=B(z,1);$[y]||($[y]=function(F){return $.extend(C,F)})({a:k,base:k,iframe:t,img:t,input:t,form:"action",link:k,script:t});j=$[y];function s(I,G,H,F){if(!E(H)&&typeof H!=="object"){F=H;H=G;G=i}return this.each(function(){var L=$(this),J=G||j()[(this.nodeName||"").toLowerCase()]||"",K=J&&L.attr(J)||"";L.attr(J,a[I](K,H,F))})}$.fn[A]=B(s,A);$.fn[D]=B(s,D);b.pushState=q=function(I,F){if(E(I)&&/^#/.test(I)&&F===i){F=2}var H=I!==i,G=c(p[g][k],H?I:{},H?F:2);p[g][k]=G+(/#/.test(G)?"":"#")};b.getState=u=function(F,G){return F===i||typeof F==="boolean"?v(F):v(G)[F]};b.removeState=function(F){var G={};if(F!==i){G=u();$.each($.isArray(F)?F:arguments,function(I,H){delete G[H]})}q(G,2)};e[d]=$.extend(e[d],{add:function(F){var H;function G(J){var I=J[D]=c();J.getState=function(K,L){return K===i||typeof K==="boolean"?l(I,K):l(I,L)[K]};H.apply(this,arguments)}if($.isFunction(F)){H=F;return G}else{H=F.handler;F.handler=G}}})})(jQuery,this);
/*
 * jQuery hashchange event - v1.2 - 2/11/2010
 * http://benalman.com/projects/jquery-hashchange-plugin/
 * 
 * Copyright (c) 2010 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */
(function($,i,b){var j,k=$.event.special,c="location",d="hashchange",l="href",f=$.browser,g=document.documentMode,h=f.msie&&(g===b||g<8),e="on"+d in i&&!h;function a(m){m=m||i[c][l];return m.replace(/^[^#]*#?(.*)$/,"$1")}$[d+"Delay"]=100;k[d]=$.extend(k[d],{setup:function(){if(e){return false}$(j.start)},teardown:function(){if(e){return false}$(j.stop)}});j=(function(){var m={},r,n,o,q;function p(){o=q=function(s){return s};if(h){n=$('<iframe src="javascript:0"/>').hide().insertAfter("body")[0].contentWindow;q=function(){return a(n.document[c][l])};o=function(u,s){if(u!==s){var t=n.document;t.open().close();t[c].hash="#"+u}};o(a())}}m.start=function(){if(r){return}var t=a();o||p();(function s(){var v=a(),u=q(t);if(v!==t){o(t=v,u);$(i).trigger(d)}else{if(u!==t){i[c][l]=i[c][l].replace(/#.*/,"")+"#"+u}}r=setTimeout(s,$[d+"Delay"])})()};m.stop=function(){if(!n){r&&clearTimeout(r);r=0}};return m})()})(jQuery,this);

/*
 * jQuery Tiny Pub/Sub - v0.6 - 1/10/2011
 * http://benalman.com/
 *
 * Copyright (c) 2010 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */
(function($){var a=$("<b/>");$.subscribe=function(b,c){function d(){return c.apply(this,Array.prototype.slice.call(arguments,1))}d.guid=c.guid=c.guid||($.guid?$.guid++:$.event.guid++);a.bind(b,d)};$.unsubscribe=function(){a.unbind.apply(a,arguments)};$.publish=function(){a.trigger.apply(a,arguments)}})(jQuery);

var SparkMD5=function(){function h(f,d,b,a,c,e){d=k(k(d,f),k(a,e));return k(d<<c|d>>>32-c,b)}function g(f,d,b,a,c,e,g){return h(d&b|~d&a,f,d,c,e,g)}function i(f,d,b,a,c,e,g){return h(d&a|b&~a,f,d,c,e,g)}function j(f,d,b,a,c,e,g){return h(b^(d|~a),f,d,c,e,g)}function l(f,d){var b=f[0],a=f[1],c=f[2],e=f[3],b=g(b,a,c,e,d[0],7,-680876936),e=g(e,b,a,c,d[1],12,-389564586),c=g(c,e,b,a,d[2],17,606105819),a=g(a,c,e,b,d[3],22,-1044525330),b=g(b,a,c,e,d[4],7,-176418897),e=g(e,b,a,c,d[5],12,1200080426),c=g(c,
e,b,a,d[6],17,-1473231341),a=g(a,c,e,b,d[7],22,-45705983),b=g(b,a,c,e,d[8],7,1770035416),e=g(e,b,a,c,d[9],12,-1958414417),c=g(c,e,b,a,d[10],17,-42063),a=g(a,c,e,b,d[11],22,-1990404162),b=g(b,a,c,e,d[12],7,1804603682),e=g(e,b,a,c,d[13],12,-40341101),c=g(c,e,b,a,d[14],17,-1502002290),a=g(a,c,e,b,d[15],22,1236535329),b=i(b,a,c,e,d[1],5,-165796510),e=i(e,b,a,c,d[6],9,-1069501632),c=i(c,e,b,a,d[11],14,643717713),a=i(a,c,e,b,d[0],20,-373897302),b=i(b,a,c,e,d[5],5,-701558691),e=i(e,b,a,c,d[10],9,38016083),
c=i(c,e,b,a,d[15],14,-660478335),a=i(a,c,e,b,d[4],20,-405537848),b=i(b,a,c,e,d[9],5,568446438),e=i(e,b,a,c,d[14],9,-1019803690),c=i(c,e,b,a,d[3],14,-187363961),a=i(a,c,e,b,d[8],20,1163531501),b=i(b,a,c,e,d[13],5,-1444681467),e=i(e,b,a,c,d[2],9,-51403784),c=i(c,e,b,a,d[7],14,1735328473),a=i(a,c,e,b,d[12],20,-1926607734),b=h(a^c^e,b,a,d[5],4,-378558),e=h(b^a^c,e,b,d[8],11,-2022574463),c=h(e^b^a,c,e,d[11],16,1839030562),a=h(c^e^b,a,c,d[14],23,-35309556),b=h(a^c^e,b,a,d[1],4,-1530992060),e=h(b^a^c,e,
b,d[4],11,1272893353),c=h(e^b^a,c,e,d[7],16,-155497632),a=h(c^e^b,a,c,d[10],23,-1094730640),b=h(a^c^e,b,a,d[13],4,681279174),e=h(b^a^c,e,b,d[0],11,-358537222),c=h(e^b^a,c,e,d[3],16,-722521979),a=h(c^e^b,a,c,d[6],23,76029189),b=h(a^c^e,b,a,d[9],4,-640364487),e=h(b^a^c,e,b,d[12],11,-421815835),c=h(e^b^a,c,e,d[15],16,530742520),a=h(c^e^b,a,c,d[2],23,-995338651),b=j(b,a,c,e,d[0],6,-198630844),e=j(e,b,a,c,d[7],10,1126891415),c=j(c,e,b,a,d[14],15,-1416354905),a=j(a,c,e,b,d[5],21,-57434055),b=j(b,a,c,e,
d[12],6,1700485571),e=j(e,b,a,c,d[3],10,-1894986606),c=j(c,e,b,a,d[10],15,-1051523),a=j(a,c,e,b,d[1],21,-2054922799),b=j(b,a,c,e,d[8],6,1873313359),e=j(e,b,a,c,d[15],10,-30611744),c=j(c,e,b,a,d[6],15,-1560198380),a=j(a,c,e,b,d[13],21,1309151649),b=j(b,a,c,e,d[4],6,-145523070),e=j(e,b,a,c,d[11],10,-1120210379),c=j(c,e,b,a,d[2],15,718787259),a=j(a,c,e,b,d[9],21,-343485551);f[0]=k(b,f[0]);f[1]=k(a,f[1]);f[2]=k(c,f[2]);f[3]=k(e,f[3])}function n(f){var d=[],b;for(b=0;64>b;b+=4)d[b>>2]=f.charCodeAt(b)+
(f.charCodeAt(b+1)<<8)+(f.charCodeAt(b+2)<<16)+(f.charCodeAt(b+3)<<24);return d}function o(f){var d=f.length,b=[1732584193,-271733879,-1732584194,271733878],a,c,e;for(a=64;a<=d;a+=64)l(b,n(f.substring(a-64,a)));f=f.substring(a-64);c=f.length;e=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];for(a=0;a<c;a+=1)e[a>>2]|=f.charCodeAt(a)<<(a%4<<3);e[a>>2]|=128<<(a%4<<3);if(55<a){l(b,e);for(a=0;16>a;a+=1)e[a]=0}e[14]=8*d;l(b,e);return b}function m(f){var d;for(d=0;d<f.length;d+=1){for(var b=f,a=d,c=f[d],e="",g=void 0,
g=0;4>g;g+=1)e+=q[c>>8*g+4&15]+q[c>>8*g&15];b[a]=e}return f.join("")}var k=function(f,d){return f+d&4294967295},q="0,1,2,3,4,5,6,7,8,9,a,b,c,d,e,f".split(",");"5d41402abc4b2a76b9719d911017c592"!==m(o("hello"))&&(k=function(f,d){var b=(f&65535)+(d&65535);return(f>>16)+(d>>16)+(b>>16)<<16|b&65535});var p=function(){this.append=function(f){/[\u0080-\uFFFF]/.test(f)&&(f=unescape(encodeURIComponent(f)));this.appendBinary(f);return this};this.appendBinary=function(f){var d=64-this._buff.length,b=this._buff+
f.substr(0,d),a;this._length+=f.length;if(64<=b.length){l(this._state,n(b));for(a=f.length-64;d<=a;)b=f.substr(d,64),l(this._state,n(b)),d+=64;this._buff=f.substr(d,64)}else this._buff=b;return this};this.end=function(f){var d=this._buff,b=d.length,a=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],c;for(c=0;c<b;c+=1)a[c>>2]|=d.charCodeAt(c)<<(c%4<<3);a[c>>2]|=128<<(c%4<<3);if(55<c){l(this._state,a);for(c=0;16>c;c+=1)a[c]=0}a[14]=8*this._length;l(this._state,a);f=f?this._state:m(this._state);this.reset();return f};
this.reset=function(){this._buff="";this._length=0;this._state=[1732584193,-271733879,-1732584194,271733878];return this};this.destroy=function(){delete this._state;delete this._buff;delete this._length};this.reset()};p.hash=function(f,d){/[\u0080-\uFFFF]/.test(f)&&(f=unescape(encodeURIComponent(f)));var b=o(f);return d?b:m(b)};p.hashBinary=function(f,d){var b=o(f);return d?b:m(b)};return p}();'use strict';
var J = jQuery.noConflict();

var Zotero = {
    ajax: {},
    callbacks: {},
    ui: {callbacks:{}},
    url: {},
    utils: {},
    offline: {},
    temp: {},
    localizations: {},
    
    config: {librarySettings: {},
             baseApiUrl: 'https://apidev.zotero.org',
             baseWebsiteUrl: 'https://test.zotero.net',
             baseFeedUrl: 'https://apidev.zotero.org',
             proxy: true,
             apiKey: '',
             ajax: 1,
             locale: 'en-US',
             cacheStoreType: 'localStorage',
             mobile:0,
             sortOrdering: {
                 'dateAdded': 'desc',
                 'dateModified': 'desc',
                 'date': 'desc',
                 'year': 'desc',
                 'accessDate': 'desc',
                 'title': 'asc',
                 'creator': 'asc'
             },
             defaultSortColumn: 'title',
             defaultSortOrder: 'asc',
             largeFields: {
                 'title': 1,
                 'abstractNote': 1,
                 'extra' : 1
             },
             richTextFields: {
                 'note': 1
             },
             maxFieldSummaryLength: {title:60},
             exportFormats: [
                "bibtex",
                "bookmarks",
                "mods",
                "refer",
                "rdf_bibliontology",
                "rdf_dc",
                "rdf_zotero",
                "ris",
                "wikipedia"
                ],
            defaultApiArgs: {
                'order': 'title',
                'sort': 'asc',
                'limit': 50,
                'start': 0,
                'content':'json',
                'format': 'atom'
            }
             },
    
    debug: function(debugstring, level){
        if(typeof console == 'undefined'){
            return;
        }
        if(typeof(level) !== "number"){
            level = 1;
        }
        if(Zotero.prefs.debug_log && (level <= Zotero.prefs.debug_level)){
            console.log(debugstring);
        }
    },
    
    warn: function(warnstring){
        if(typeof console == 'undefined' || typeof console.warn == 'undefined'){
            this.debug(warnstring);
        }
        else{
            console.warn(warnstring);
        }
    },
    
    error: function(errorstring){
        if(typeof console == 'undefined' || typeof console.error == 'undefined'){
            this.debug(errorstring);
        }
        else{
            console.error(errorstring);
        }
    },
    
    feeds: {},
    
    cacheFeeds: {},
    
    prefs: {
        debug_level: 1, //lower level is higher priority
        debug_log: true,
        debug_mock: false
    },
    
    state: {},
    
    libraries: {},
    
    validator: {
        patterns: {
            //'itemKey': /^([A-Z0-9]{8,},?)+$/,
            'itemKey': /^.+$/,
            'collectionKey': /^([A-Z0-9]{8,})|trash$/,
            //'tag': /^[^#]*$/,
            'libraryID': /^[0-9]+$/,
            'libraryType': /^(user|group|)$/,
            'target': /^(items?|collections?|tags|children)$/,
            'targetModifier': /^(top|file|file\/view)$/,
            
            //get params
            'sort': /^(asc|desc)$/,
            'start': /^[0-9]*$/,
            'limit': /^[0-9]*$/,
            'order': /^\S*$/,
            'content': /^(json|html|csljson|bib|none)$/,
            'q': /^.*$/,
            'fq': /^\S*$/,
            'itemType': /^\S*$/,
            'locale': /^\S*$/,
            'tag': /^.*$/,
            'tagType': /^(0|1)$/,
            'key': /^\S*/,
            'format': /^(atom|bib|keys|bibtex|bookmarks|mods|refer|rdf_bibliontology|rdf_dc|rdf_zotero|ris|wikipedia)$/,
            'style': /^\S*$/,
            'linkwrap': /^(0|1)*$/
        },
        
        validate: function(arg, type){
            Z.debug("Zotero.validate");
            if(arg === ''){
                return null;
            }
            else if(arg === null){
                return true;
            }
            Z.debug(arg + " " + type);
            var patterns = this.patterns;
            
            if(patterns.hasOwnProperty(type)){
                return patterns[type].test(arg);
            }
            else{
                return null;
            }
        }
    },
    
    _logEnabled: 0,
    enableLogging: function(){
        Zotero._logEnabled++;
        if(Zotero._logEnabled > 0){
            Zotero.prefs.debug_log = true;
        }
    },
    
    disableLogging: function(){
        Zotero._logEnabled--;
        if(Zotero._logEnabled <= 0){
            Zotero._logEnabled = 0;
            Zotero.prefs.debug_log = false;
        }
    },
    
    init: function(){
        var store;
        if(Zotero.config.cacheStoreType == 'localStorage' && typeof localStorage != 'undefined'){
            store = localStorage;
        }
        else if(Zotero.config.cacheStoreType == 'sessionStorage' && typeof sessionStorage != 'undefined'){
            store = sessionStorage;
        }
        else{
            store = {};
        }
        
        Zotero.cache = new Zotero.Cache(store);
        
        //get localized item constants if not stored in localstorage
        var locale = 'en-US';
        if(Zotero.config.locale){
            locale = Zotero.config.locale;
        }
        locale = 'en-US';
        
        J.ajaxSettings.traditional = true;
        
    }
};

Zotero.Cache = function(store){
    this.store = store;
    var registry = this.store['_registry'];
    if(typeof registry == 'null' || typeof registry == 'undefined'){
        registry = {};
        this.store['_registry'] = JSON.stringify(registry);
    }
};

//build a consistent string from an object to use as a cache key
//put object key/value pairs into array, sort array, and concatenate
//array with '/'
Zotero.Cache.prototype.objectCacheString = function(params){
    var paramVarsArray = [];
    J.each(params, function(index, value){
        if(!value) { return; }
        else if(value instanceof Array){
            J.each(value, function(i, v){
                paramVarsArray.push(index + '/' + encodeURIComponent(v) );
            });
        }
        else{
            paramVarsArray.push(index + '/' + encodeURIComponent(value) );
        }
    });
    paramVarsArray.sort();
    Z.debug(paramVarsArray, 4);
    var objectCacheString = paramVarsArray.join('/');
    return objectCacheString;
};

//should use setItem and getItem if I extend that to the case where no Storage object is available in the browser
Zotero.Cache.prototype.save = function(params, object, cachetags){
    //cachetags for expiring entries
    if(!J.isArray(cachetags)){
        cachetags = [];
    }
    //get registry object from storage
    var registry = JSON.parse(this.store['_registry']);
    if(!registry){
        registry = {};
    }
    var objectCacheString = this.objectCacheString(params);
    //save object in storage
    this.store[objectCacheString] = JSON.stringify(object);
    //make registry entry for object
    var registryEntry = {'id':objectCacheString, saved:Date.now(), cachetags:cachetags};
    registry[objectCacheString] = registryEntry;
    //save registry back to storage
    this.store['_registry'] = JSON.stringify(registry);
};

Zotero.Cache.prototype.load = function(params){
    Z.debug("Zotero.Cache.load", 3);
    var objectCacheString = this.objectCacheString(params);
    Z.debug(objectCacheString, 4);
    try{
        var s = this.store[objectCacheString];
        if(!s){
            Z.debug("No value found in cache store - " + objectCacheString, 3);
            return null;
        }
        else{
            return JSON.parse(s);
        }
    }
    catch(e){
        Z.debug('Error parsing retrieved cache data', 1);
        Z.debug(objectCacheString, 2);
        Z.debug(this.store[objectCacheString], 2);
        return null;
    }
};

Zotero.Cache.prototype.expireCacheTag = function(tag){
    Z.debug("Zotero.Cache.expireCacheTag", 3);
    var registry = JSON.parse(this.store['_registry']);
    var store = this.store;
    J.each(registry, function(index, value){
        if(J.inArray(tag, value.cachetags) != (-1) ){
            Z.debug('tag ' + tag + ' found for item ' + value['id'] + ' : expiring', 4);
            delete store[value['id']];
            delete registry[value['id']];
        }
    });
};

Zotero.Cache.prototype.clear = function(){
    if(typeof(this.store.clear) == 'function'){
        this.store.clear();
    }
    else{
        this.store = {};
    }
};

//make a request to the Zotero api and get back a deferred
Zotero.apiRequest = function(url, method, body, headers){
    Z.debug("Zotero.apiRequest", 3);
    if(typeof method == 'undefined'){
        method = 'GET';
    }
    if(typeof headers == 'undefined'){
        headers = {};
    }
    
    var settings = {type: method,
                    headers:headers,
                    cache:false,
                    error: Zotero.ajax.errorCallback
                    };
    if(typeof body != 'undefined') {
        settings['data'] = body;
    }
    
    var jqxhr = J.ajax(Zotero.ajax.proxyWrapper(url, method), settings);
    return jqxhr;
};

Zotero.error = function(e){
    Z.debug("====================Zotero Error", 1);
    Z.debug(e, 1);
};

Zotero.saveLibrary = function(library){
    var dump = {};
    dump.libraryType = library.libraryType;
    dump.libraryID = library.libraryID;
    dump.libraryUrlIdentifier = library.libraryUrlIdentifier;
    dump.itemKeys = library.itemKeys;
    
    dump.collections = library.collections.dump();
    dump.items = library.items.dump();
    dump.tags = library.tags.dump();
    Zotero.cache.save({libraryString:library.libraryString}, dump);
};

Zotero.loadLibrary = function(params){
    Z.debug("Zotero.loadLibrary");
    Z.debug(params);
    var dump = Zotero.cache.load(params);
    if(dump === null){
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


Zotero.ajax.error = function(event, request, settings, exception){
    //Zotero.ui.jsNotificationMessage("Error requesting " + settings.url, 'error');
    //J("#js-message-list").append("<li>Error requesting " + settings.url + "</li>");
    Z.debug("Exception: " + exception);
    //Z.exception = exception;
};

Zotero.ajax.errorCallback = function(jqxhr, textStatus, errorThrown){
    Z.debug("ajax error callback");
    Z.debug('textStatus: ' + textStatus);
    Z.debug('errorThrown: ');
    Z.debug(errorThrown);
    Z.debug(jqxhr);
};

Zotero.ajax.activeRequests = [];

/*
 * Requires {target:items|collections|tags, libraryType:user|group, libraryID:<>}
 */
Zotero.ajax.apiRequestUrl = function(params){
    //Z.debug("Zotero.ajax.apiRequestUrl", 3);
    //Z.debug(params, 3);
    J.each(params, function(key, val){
        //should probably figure out exactly why I'm doing this, is it just to make sure no hashes snuck in?
        //if so the new validation below takes care of that instead
        if(typeof val == 'string'){
            val = val.split('#', 1);
            params[key] = val[0];
        }
        
        //validate params based on patterns in Zotero.validate
        if(Zotero.validator.validate(val, key) === false){
            //warn on invalid parameter and drop from params that will be used
            Zotero.warn("API argument failed validation: " + key + " cannot be " + val);
            Zotero.warn(params);
            console.trace();
            delete params[key];
        }
    });
    
    if(!params.target) throw "No target defined for api request";
    if(!(params.libraryType == 'user' || params.libraryType == 'group' || params.libraryType === '')) throw "Unexpected libraryType for api request" + params.libraryType;
    if((params.libraryType) && !(params.libraryID)) throw "No libraryID defined for api request";
    
    var base = Zotero.config.baseApiUrl;
    var url;
    
    if(params.libraryType !== ''){
        url = base + '/' + params.libraryType + 's/' + params.libraryID;
        if(params.collectionKey){
            if(params.collectionKey == 'trash'){
                url += '/items/trash';
                return url;
            }
            else{
                url += '/collections/' + params.collectionKey;
            }
        }
    }
    else{
        url = base;
    }
    
    switch(params.target){
        case 'items':
            url += '/items';
            break;
        case 'item':
            if(params.itemKey){
                url += '/items/' + params.itemKey;
            }
            else{
                url += '/items';
            }
            break;
        case 'collections':
            url += '/collections';
            break;
        case 'collection':
            break;
        case 'tags':
            url += '/tags';
            break;
        case 'children':
            url += '/items/' + params.itemKey + '/children';
            break;
        default:
            return false;
    }
    switch(params.targetModifier){
        case 'top':
            url += '/top';
            break;
        case 'file':
            url += '/file';
            break;
        case 'viewsnapshot':
            url += '/file/view';
            break;
    }
    //Z.debug("returning apiRequestUrl: " + url, 3);
    return url;
};

Zotero.ajax.apiQueryString = function(passedParams, useConfigKey){
    Z.debug("Zotero.ajax.apiQueryString");
    Z.debug(passedParams);
    if(useConfigKey === null || typeof useConfigKey === 'undefined'){
        useConfigKey = true;
    }
    
    J.each(passedParams, function(key, val){
        if(typeof val == 'string'){
            val = val.split('#', 1);
            passedParams[key] = val[0];
        }
    });
    if(passedParams.hasOwnProperty('order') && passedParams['order'] == 'creatorSummary'){
        passedParams['order'] = 'creator';
    }
    if(passedParams.hasOwnProperty('order') && passedParams['order'] == 'year'){
        passedParams['order'] = 'date';
    }
    if(useConfigKey && Zotero.config.apiKey){
        passedParams['key'] = Zotero.config.apiKey;
    }
    
    //Z.debug()
    if(passedParams.hasOwnProperty('sort') && passedParams['sort'] == 'undefined' ){
        //alert('fixed a bad sort');
        passedParams['sort'] = 'asc';
    }
    
    Z.debug(passedParams);
    
    var queryString = '?';
    var queryParamsArray = [];
    var queryParamOptions = ['start',
                             'limit',
                             'order',
                             'sort',
                             'content',
                             'format',
                             'q',
                             'fq',
                             'itemType',
                             'itemKey',
                             'locale',
                             'tag',
                             'tagType',
                             'key',
                             'style',
                             'linkMode',
                             'linkwrap'
                             ];
    //build simple api query parameters object
    var queryParams = {};
    J.each(queryParamOptions, function(i, val){
        if(passedParams.hasOwnProperty(val) && (passedParams[val] !== '')){
            queryParams[val] = passedParams[val];
        }
    });
    
    //take out itemKey if it is not a list
    if(passedParams.hasOwnProperty('target') && passedParams['target'] !== 'items'){
        if(queryParams.hasOwnProperty('itemKey') && queryParams['itemKey'].indexOf(',') == -1){
            delete queryParams['itemKey'];
        }
    }
    
    //add each of the found queryParams onto array
    J.each(queryParams, function(index, value){
        if(value instanceof Array){
            J.each(value, function(i, v){
                queryParamsArray.push(encodeURIComponent(index) + '=' + encodeURIComponent(v));
            });
        }
        else{
            queryParamsArray.push(encodeURIComponent(index) + '=' + encodeURIComponent(value));
        }
    });
    
    //build query string by concatenating array
    queryString += queryParamsArray.join('&');
    //Z.debug("resulting queryString:" + queryString);
    return queryString;
};

Zotero.ajax.proxyWrapper = function(requestUrl, method){
    if(Zotero.config.proxy){
        if(!method){
            method = 'GET';
        }
        return "/proxyrequest?requestMethod=" + method + "&requestUrl=" + encodeURIComponent(requestUrl);
    }
    else{
        return requestUrl;
    }
};

Zotero.ajax.parseQueryString = function(query){
    
};

Zotero.ajax.webUrl = function(args){
    
};
Zotero.Feed = function(data){
    Z.debug('Zotero.Feed', 3);
    if(typeof data == 'undefined'){
        this.title = '';
        this.id = '';
        this.totalResults = 0;
        this.apiVersion = '';
        this.links = {};
        this.lastPageStart = null;
        this.lastPage = null;
        this.currentPage = null;
        this.updated = null;
    }
    else{
        this.parseXmlFeed(data);
    }
};

Zotero.Feed.prototype.parseXmlFeed = function(data){
    var fel = J(data).find("feed");
    this.title = fel.children('title').first().text();
    this.id = fel.children('id').first().text();
    this.totalResults = fel.find('zapi\\:totalResults').first().text();
    this.apiVersion = fel.find('zapi\\:apiVersion').first().text();
    if(this.totalResults === ''){
        this.totalResults = fel.find('totalResults').first().text();
        this.apiVersion = fel.find('apiVersion').first().text();
    }
    var links = {};
    var lasthref = '';
    fel.children("link").each(function(){
        var rel = J(this).attr("rel");
        links[rel] = {
            rel  : J(this).attr("rel"),
            type : J(this).attr("type"),
            href : J(this).attr("href")
        };
        if(J(this).attr('rel') == 'last'){
            lasthref = J(this).attr('href');
        }
    });
    
    var selfhref = links['self'].href;
    this.lastPageStart = J.deparam.querystring(lasthref).start || 0;
    var limit = J.deparam.querystring(lasthref).limit || 50;
    var start = J.deparam.querystring(selfhref).start || 0;
    this.lastPage = (parseInt(this.lastPageStart, 10) / limit) + 1;
    this.currentPage = (parseInt(start, 10) / limit) + 1;
    
    this.links = links;
    
    this.updated = new Date();
    this.updated.setTime(Date.parse(fel.children("updated").first().text()));
    this.entries = fel.find('entry');
    return this;
};
Zotero.Library = function(type, libraryID, libraryUrlIdentifier, apiKey){
    Z.debug("Zotero.Library constructor", 3);
    Z.debug(libraryUrlIdentifier, 4);
    this.instance = "Zotero.Library";
    this._apiKey = apiKey || false;
    
    this.libraryBaseWebsiteUrl = Zotero.config.baseWebsiteUrl + '/';
    if(this.libraryType == 'group'){
        this.libraryBaseWebsiteUrl += 'groups/';
    }
    this.libraryBaseWebsiteUrl += libraryUrlIdentifier + '/items';
    
    //object holders within this library, whether tied to a specific library or not
    this.items = new Zotero.Items();
    this.items.owningLibrary = this;
    this.itemKeys = [];
    this.collections = new Zotero.Collections();
    this.collections.libraryUrlIdentifier = this.libraryUrlIdentifier;
    this.collections.owningLibrary = this;
    
    this.tags = new Zotero.Tags();
    
    if(!type){
        //return early if library not specified
        return;
    }
    //attributes tying instance to a specific Zotero library
    this.type = type;
    this.libraryType = type;
    this.libraryID = libraryID;
    this.libraryString = Zotero.utils.libraryString(this.type, this.libraryID);
    this.libraryUrlIdentifier = libraryUrlIdentifier;
    
    //object to hold user aliases for displaying real names
    this.usernames = {};
    
    this.cachedTags = this.getCachedTags();
    
    this.dirty = false;
    
    try{
        this.filestorage = new Zotero.Filestorage();
    }
    catch(e){
        Z.debug(e);
        Z.debug("Error creating filestorage");
        this.filestorage = false;
    }
};

Zotero.Library.prototype.sortableColumns = ['title',
                                            'creator',
                                            'itemType',
                                            'date',
                                            'year',
                                            'publisher',
                                            'publicationTitle',
                                            'journalAbbreviation',
                                            'language',
                                            'accessDate',
                                            'libraryCatalog',
                                            'callNumber',
                                            'rights',
                                            'dateAdded',
                                            'dateModified',
                                            /*'numChildren',*/
                                            'addedBy'
                                            /*'modifiedBy'*/];

Zotero.Library.prototype.displayableColumns = ['title',
                                            'creator',
                                            'itemType',
                                            'date',
                                            'year',
                                            'publisher',
                                            'publicationTitle',
                                            'journalAbbreviation',
                                            'language',
                                            'accessDate',
                                            'libraryCatalog',
                                            'callNumber',
                                            'rights',
                                            'dateAdded',
                                            'dateModified',
                                            'numChildren',
                                            'addedBy'
                                            /*'modifiedBy'*/];

Zotero.Library.prototype.groupOnlyColumns = ['addedBy'
                                             /*'modifiedBy'*/];

//this does not handle accented characters correctly
Zotero.Library.prototype.sortByTitleCompare = function(a, b){
    //Z.debug("compare by key: " + a + " < " + b + " ?", 4);
    if(a.title.toLocaleLowerCase() == b.title.toLocaleLowerCase()){
        return 0;
    }
    if(a.title.toLocaleLowerCase() < b.title.toLocaleLowerCase()){
        return -1;
    }
    return 1;
};

Zotero.Library.prototype.sortLower = function(a, b){
    if(a.toLocaleLowerCase() == b.toLocaleLowerCase()){
        return 0;
    }
    if(a.toLocaleLowerCase() < b.toLocaleLowerCase()){
        return -1;
    }
    return 1;
};

Zotero.Library.prototype.websiteUrl = function(urlvars){
    Z.debug("Zotero.library.websiteUrl", 3);
    Z.debug(urlvars, 4);
    
    var urlVarsArray = [];
    J.each(urlvars, function(index, value){
        if(value === '') return;
        urlVarsArray.push(index + '/' + value);
    });
    urlVarsArray.sort();
    Z.debug(urlVarsArray, 4);
    var pathVarsString = urlVarsArray.join('/');
    
    return this.libraryBaseWebsiteUrl + '/' + pathVarsString;
};

Zotero.Library.prototype.loadCollections = function(config){
    Z.debug("Zotero.Library.loadCollections", 3);
    var library = this;
    library.collections.loading = true;
    var deferred = new J.Deferred();
    if(!config){
        config = {};
    }
    var urlconfig = J.extend(true, {'target':'collections', 'libraryType':this.type, 'libraryID':this.libraryID, 'content':'json', limit:'100'}, config);
    var requestUrl = Zotero.ajax.apiRequestUrl(urlconfig) + Zotero.ajax.apiQueryString(urlconfig);
    
    var callback = J.proxy(function(data, textStatus, XMLHttpRequest){
        Z.debug('loadCollections proxied callback', 3);
        var library = this;
        var feed = new Zotero.Feed(data);
        feed.requestConfig = urlconfig;
        var collections = library.collections;
        var collectionsAdded = collections.addCollectionsFromFeed(feed);
        for (var i = 0; i < collectionsAdded.length; i++) {
            collectionsAdded[i].associateWithLibrary(library);
        }
        
        Z.debug("done parsing collections feed.", 3);
        if(feed.links.hasOwnProperty('next')){
            Z.debug("has next link.", 3);
            var nextLink = feed.links.next;
            var nextLinkConfig = J.deparam(J.param.querystring(nextLink.href));
            var newConfig = J.extend({}, config);
            newConfig.start = nextLinkConfig.start;
            newConfig.limit = nextLinkConfig.limit;
            var nextDeferred = this.loadCollections(newConfig);
            nextDeferred.done(J.proxy(function(collections){
                deferred.resolve(collections);
                }, this));
        }
        else{
            Z.debug("no next in collections link", 3);
            collections.collectionsArray.sort(collections.sortByTitleCompare);
            //Nest collections as entries of parent collections
            J.each(collections.collectionsArray, function(index, obj) {
                if(obj.instance === "Zotero.Collection"){
                    if(obj.nestCollection(collections)){
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
    
    if((this.collections.loaded) && (!this.collections.dirty)){
        Z.debug("already have correct collections loaded", 3);
        deferred.resolve();
        return deferred;
    }
    
    if(this.collections.loaded && this.collections.dirty){
        this.collections.collectionsArray = [];
        this.collections.loaded = false;
    }
    
    var jqxhr = this.fetchCollections(urlconfig);
    
    jqxhr.done(callback);
    jqxhr.fail(function(){deferred.reject.apply(null, arguments);}).fail(Zotero.error);
    Zotero.ajax.activeRequests.push(jqxhr);
    //Zotero.ajax.activeRequests.push({'deferred':deferred, 'publishes':'loadCollectionsDone'});
    
    
    deferred.done(function(collections){
        J.publish('loadCollectionsDone', [collections]);
    });
    
    return deferred;
};

Zotero.Library.prototype.fetchNext = function(feed, config){
    Z.debug('Zotero.Library.fetchNext', 3);
    if(feed.links.hasOwnProperty('next')){
        Z.debug("has next link.", 3);
        var nextLink = feed.links.next;
        var nextLinkConfig = J.deparam(J.param.querystring(nextLink.href));
        var newConfig = J.extend({}, config);
        newConfig.start = nextLinkConfig.start;
        newConfig.limit = nextLinkConfig.limit;
        var requestUrl = Zotero.ajax.apiRequestUrl(newConfig) + Zotero.ajax.apiQueryString(newConfig);
        var nextPromise = Zotero.apiRequest(requestUrl, 'GET');
        return nextPromise;
    }
    else{
        return false;
    }
};

Zotero.Library.prototype.fetchCollections = function(config){
    Z.debug("Zotero.Library.fetchCollections", 3);
    var library = this;
    if(!config){
        config = {};
    }
    var urlconfig = J.extend(true, {'target':'collections', 'libraryType':this.type, 'libraryID':this.libraryID, 'content':'json', limit:'100'}, config);
    var requestUrl = Zotero.ajax.apiRequestUrl(urlconfig) + Zotero.ajax.apiQueryString(urlconfig);
    
    var d = Zotero.apiRequest(requestUrl, 'GET');
    
    //var deferred = new J.Deferred();
    
    //d.done()
    return d;
};

//make request for item keys and return jquery ajax promise
Zotero.Library.prototype.fetchItemKeys = function(config){
    Z.debug("Zotero.Library.fetchItemKeys", 3);
    var library = this;
    if(typeof config == 'undefined'){
        config = {};
    }
    var urlconfig = J.extend(true, {'target':'items', 'libraryType':this.libraryType, 'libraryID':this.libraryID, 'format':'keys'}, config);
    var requestUrl = Zotero.ajax.apiRequestUrl(urlconfig) + Zotero.ajax.apiQueryString(urlconfig);
    
    var jqxhr = J.ajax(Zotero.ajax.proxyWrapper(requestUrl, 'GET'),
        {type: "GET",
         headers:{},
         cache:false,
         error: Zotero.ajax.errorCallback
        }
    );
    
    return jqxhr;
};

Zotero.Library.prototype.loadItemKeys = function(config){
    Z.debug("Zotero.Library.loadItemKeys", 3);
    var library = this;
    var jqxhr = this.fetchItemKeys(config);
    
    var callback = J.proxy(function(data, textStatus, XMLHttpRequest){
        Z.debug('loadItemKeys proxied callback', 3);
        var library = this;
        var result = data;
        
        var keys = result.split(/[\s]+/);
        library.itemKeys = keys;
    }, this);
    
    jqxhr.done(callback);
    jqxhr.fail(function(){deferred.reject.apply(null, arguments);});
    Zotero.ajax.activeRequests.push(jqxhr);
    
    return jqxhr;
};

Zotero.Library.prototype.loadItems = function(config){
    Z.debug("Zotero.Library.loadItems", 3);
    Z.debug(config);
    var library = this;
    if(!config){
        config = {};
    }

    var deferred = new J.Deferred();
    
    var defaultConfig = {target:'items',
                         targetModifier: 'top',
                         itemPage: 1,
                         limit: 25,
                         content: 'json',
                         order: Zotero.config.defaultSortColumn,
                         sort: Zotero.config.defaultSortOrder
                     };
    
    //Build config object that should be displayed next and compare to currently displayed
    var newConfig = J.extend({}, defaultConfig, config);
    newConfig.start = parseInt(newConfig.limit, 10) * (parseInt(newConfig.itemPage, 10) - 1);
    //Z.debug("newConfig");Z.debug(newConfig);
    var urlconfig = J.extend({'target':'items', 'libraryType':this.type, 'libraryID':this.libraryID}, newConfig);
    var requestUrl = Zotero.ajax.apiRequestUrl(urlconfig) + Zotero.ajax.apiQueryString(urlconfig);
    Z.debug("loadItems requestUrl:");
    Z.debug(requestUrl);
    
    var callback = J.proxy(function(data, textStatus, XMLHttpRequest){
        Z.debug('loadItems proxied callback', 3);
        var library = this;
        var jFeedOb = J(data);
        var itemfeed = new Zotero.Feed(data);
        itemfeed.requestConfig = newConfig;
        var items = library.items;
        //clear out display items
        var loadedItemsArray = items.addItemsFromFeed(itemfeed);
        for (var i = 0; i < loadedItemsArray.length; i++) {
            loadedItemsArray[i].associateWithLibrary(library);
        }
        
        library.items.displayItemsArray = loadedItemsArray;
        library.items.displayItemsUrl = requestUrl;
        library.items.displayItemsFeed = itemfeed;
        library.dirty = false;
        deferred.resolve({itemsArray:loadedItemsArray, feed:itemfeed, library:library});
    }, this);
    
    Z.debug('displayItemsUrl:' + this.items.displayItemsUrl, 4);
    Z.debug('requestUrl:' + requestUrl, 4);
    if((this.items.displayItemsUrl == requestUrl) && !(this.dirty)){
        deferred.resolve({itemsArray:this.items.displayItemsArray, feed:this.items.displayItemsFeed, library:library});
        return deferred;
    }
    else{
        var jqxhr = J.ajax(Zotero.ajax.proxyWrapper(requestUrl, 'GET'),
            {type: "GET",
             headers:{},
             cache:false,
             error: Zotero.ajax.errorCallback
            }
        );
        jqxhr.done(callback);
        jqxhr.fail(function(){deferred.reject.apply(null, arguments);}).fail(Zotero.error);
        Zotero.ajax.activeRequests.push(jqxhr);
    }
    
    deferred.done(function(itemsArray, feed, library){
        Z.debug("loadItemsDone about to publish");
        J.publish('loadItemsDone', [itemsArray, feed, library]);
    });
    
    return deferred;
};

//added so the request is always completed rather than checking if it should be
//important for parallel requests that may load more than what we just want to see right now
Zotero.Library.prototype.loadItemsSimple = function(config){
    Z.debug("Zotero.Library.loadItems", 3);
    Z.debug(config);
    var library = this;
    if(!config){
        config = {};
    }

    var deferred = new J.Deferred();
    
    var defaultConfig = {target:'items',
                         targetModifier: 'top',
                         itemPage: 1,
                         limit: 25,
                         content: 'json',
                         order: Zotero.config.defaultSortColumn,
                         sort: Zotero.config.defaultSortOrder
                     };
    
    //Build config object that should be displayed next and compare to currently displayed
    var newConfig = J.extend({}, defaultConfig, config);
    newConfig.start = parseInt(newConfig.limit, 10) * (parseInt(newConfig.itemPage, 10) - 1);
    //Z.debug("newConfig");Z.debug(newConfig);
    var urlconfig = J.extend({'target':'items', 'libraryType':this.type, 'libraryID':this.libraryID}, newConfig);
    var requestUrl = Zotero.ajax.apiRequestUrl(urlconfig) + Zotero.ajax.apiQueryString(urlconfig);
    Z.debug("loadItems requestUrl:");
    Z.debug(requestUrl);
    
    var callback = J.proxy(function(data, textStatus, XMLHttpRequest){
        Z.debug('loadItems proxied callback', 3);
        var library = this;
        var jFeedOb = J(data);
        var itemfeed = new Zotero.Feed(data);
        itemfeed.requestConfig = newConfig;
        var items = library.items;
        //clear out display items
        var loadedItemsArray = items.addItemsFromFeed(itemfeed);
        for (var i = 0; i < loadedItemsArray.length; i++) {
            loadedItemsArray[i].associateWithLibrary(library);
        }
        
        library.items.displayItemsArray = loadedItemsArray;
        library.items.displayItemsUrl = requestUrl;
        library.items.displayItemsFeed = itemfeed;
        library.dirty = false;
        deferred.resolve({itemsArray:loadedItemsArray, feed:itemfeed, library:library});
    }, this);
    
    var jqxhr = J.ajax(Zotero.ajax.proxyWrapper(requestUrl, 'GET'),
        {type: "GET",
         headers:{},
         cache:false,
         error: Zotero.ajax.errorCallback
        }
    );
    jqxhr.done(callback);
    jqxhr.fail(function(){deferred.reject.apply(null, arguments);}).fail(Zotero.error);
    Zotero.ajax.activeRequests.push(jqxhr);
    
    deferred.done(function(itemsArray, feed, library){
        Z.debug("loadItemsDone about to publish");
        J.publish('loadItemsDone', [itemsArray, feed, library]);
    });
    
    return deferred;
};

Zotero.Library.prototype.loadItem = function(itemKey) {
    Z.debug("Zotero.Library.loadItem", 3);
    if(!config){
        var config = {content:'json'};
    }
    
    var deferred = new J.Deferred();
    var urlconfig = {'target':'item', 'libraryType':this.type, 'libraryID':this.libraryID, 'itemKey':itemKey, 'content':'json'};
    var requestUrl = Zotero.ajax.apiRequestUrl(urlconfig) + Zotero.ajax.apiQueryString(urlconfig);
    var library = this;
    
    var callback = J.proxy(function(data, textStatus, XMLHttpRequest){
        var resultOb = J(data);
        var entry = J(data).find("entry").eq(0);
        var item = new Zotero.Item();
        item.libraryType = this.type;
        item.libraryID = this.libraryID;
        item.parseXmlItem(entry);
        item.owningLibrary = library;
        this.items.itemObjects[item.itemKey] = item;
        deferred.resolve(item);
    }, this);
    
    var jqxhr = J.ajax(Zotero.ajax.proxyWrapper(requestUrl, 'GET'),
        {type: "GET",
         headers:{},
         cache:false,
         error: Zotero.ajax.errorCallback
        }
    );
    
    jqxhr.done(callback);
    jqxhr.fail(function(){deferred.reject.apply(null, arguments);}).fail(Zotero.error);
    
    Zotero.ajax.activeRequests.push(jqxhr);
    
    
    deferred.done(function(item){
        J.publish('loadItemDone', [item]);
    });
    
    return deferred;
};

Zotero.Library.prototype.loadFullBib = function(itemKeys, style){
    var itemKeyString = itemKeys.join(',');
    var deferred = new J.Deferred();
    var urlconfig = {'target':'items', 'libraryType':this.type, 'libraryID':this.libraryID, 'itemKey':itemKeyString, 'format':'bib', 'linkwrap':'1'};
    if(itemKeys.length == 1){
        urlconfig.target = 'item';
    }
    if(style){
        urlconfig['style'] = style;
    }

    var requestUrl = Zotero.ajax.apiRequestUrl(urlconfig) + Zotero.ajax.apiQueryString(urlconfig);
    var library = this;
    
    var callback = J.proxy(function(data, textStatus, XMLHttpRequest){
        var bib = data;
        deferred.resolve(data);
    }, this);
    
    var jqxhr = J.ajax(Zotero.ajax.proxyWrapper(requestUrl, 'GET'),
        {type: "GET",
         headers:{},
         cache:false,
         error: Zotero.ajax.errorCallback
        }
    );
    
    jqxhr.done(callback);
    jqxhr.fail(function(){deferred.reject.apply(null, arguments);}).fail(Zotero.error);
    
    Zotero.ajax.activeRequests.push(jqxhr);
    
    deferred.done(function(item){
        J.publish('loadItemBibDone', [item]);
    });
    
    return deferred;
};

Zotero.Library.prototype.loadItemBib = function(itemKey, style) {
    Z.debug("Zotero.Library.loadItem", 3);

    var deferred = new J.Deferred();
    var urlconfig = {'target':'item', 'libraryType':this.type, 'libraryID':this.libraryID, 'itemKey':itemKey, 'content':'bib'};
    if(style){
        urlconfig['style'] = style;
    }

    var requestUrl = Zotero.ajax.apiRequestUrl(urlconfig) + Zotero.ajax.apiQueryString(urlconfig);
    var library = this;
    
    var callback = J.proxy(function(data, textStatus, XMLHttpRequest){
        var resultOb = J(data);
        var entry = J(data).find("entry").eq(0);
        var item = new Zotero.Item();
        //item.libraryType = this.type;
        //item.libraryID = this.libraryID;
        item.parseXmlItem(entry);
        //item.owningLibrary = library;
        //this.items.itemObjects[item.itemKey] = item;
        var bibContent = item.bibContent;
        deferred.resolve(bibContent);
    }, this);
    
    var jqxhr = J.ajax(Zotero.ajax.proxyWrapper(requestUrl, 'GET'),
        {type: "GET",
         headers:{},
         cache:false,
         error: Zotero.ajax.errorCallback
        }
    );
    
    jqxhr.done(callback);
    jqxhr.fail(function(){deferred.reject.apply(null, arguments);}).fail(Zotero.error);
    
    Zotero.ajax.activeRequests.push(jqxhr);
    
    deferred.done(function(item){
        J.publish('loadItemBibDone', [item]);
    });
    
    return deferred;
};

Zotero.Library.prototype.fetchTags = function(config){
    Z.debug("Zotero.Library.fetchTags", 3);
    var library = this;
    var defaultConfig = {target:'tags',
                         order:'title',
                         sort:'asc',
                         limit: 100,
                         content: 'json'
                     };
    var newConfig = J.extend({}, defaultConfig, config);
    var urlconfig = J.extend({'target':'tags', 'libraryType':this.type, 'libraryID':this.libraryID}, newConfig);
    var requestUrl = Zotero.ajax.apiRequestUrl(urlconfig) + Zotero.ajax.apiQueryString(urlconfig);
    
    var jqxhr = J.ajax(Zotero.ajax.proxyWrapper(requestUrl, 'GET'),
        {type: "GET",
         headers:{},
         cache:false,
         error: Zotero.ajax.errorCallback
        }
    );
    
    return jqxhr;
};

Zotero.Library.prototype.loadTags = function(config){
    Z.debug("Zotero.Library.loadTags", 3);
    Z.debug("passed in config:", 4);
    Z.debug(config, 4);
    var library = this;
    
    var deferred = new J.Deferred();
    
    if(typeof config == 'undefined'){
        config = {};
    }
    
    if(config.showAllTags && config.collectionKey){
        delete config.collectionKey;
    }
    
    var callback = J.proxy(function(data, textStatus, XMLHttpRequest){
        Z.debug('loadTags proxied callback', 3);
        //var library = this;
        var tagsfeed = new Zotero.Feed(data);
        tagsfeed.requestConfig = config;
        var tags = library.tags;
        var addedTags = tags.addTagsFromFeed(tagsfeed);
        
        if(tagsfeed.links.hasOwnProperty('next')){
            library.tags.hasNextLink = true;
            library.tags.nextLink = tagsfeed.links['next'];
        }
        else{
            library.tags.hasNextLink = false;
            library.tags.nextLink = null;
        }
        Z.debug("resolving loadTags deferred", 3);
        
        deferred.resolve(library.tags);
    }, this);
    
    library.tags.displayTagsArray = [];
    var jqxhr = this.fetchTags(config);
    
    jqxhr.done(callback);
    jqxhr.fail(function(){deferred.reject.apply(null, arguments);});
    Zotero.ajax.activeRequests.push(jqxhr);
    
    return deferred;
};

Zotero.Library.prototype.getCachedTags = function(){
    var tagsCacheParams = {libraryType:this.libraryType, libraryID:this.libraryID, target:'alltags'};
    var cachedTags = Zotero.cache.load(tagsCacheParams);
    return cachedTags;
};

Zotero.Library.prototype.loadAllTags = function(config, checkCached){
    Z.debug("Zotero.Library.loadAllTags", 3);
    if(typeof checkCached == 'undefined'){
        checkCached = true; //default to using the cache
    }
    if(!config){
        config = {};
    }
    
    var deferred = new J.Deferred();
    
    var defaultConfig = {target:'tags',
                         content: 'json',
                         order:'title',
                         sort:'asc',
                         limit: 100
                     };
    
    //Build config object that should be displayed next and compare to currently displayed
    var newConfig = J.extend({}, defaultConfig, config);
    
    var urlconfig = J.extend({'target':'tags', 'libraryType':this.type, 'libraryID':this.libraryID}, newConfig);
    var requestUrl = Zotero.ajax.apiRequestUrl(urlconfig) + Zotero.ajax.apiQueryString(urlconfig);
    var library = this;
    var tags = library.tags;
    
    //check if already loaded tags are okay to use
    var loadedConfig = J.extend({'target':'tags', 'libraryType':this.type, 'libraryID':this.libraryID}, defaultConfig, tags.loadedConfig);
    var loadedConfigRequestUrl = tags.loadedRequestUrl; //Zotero.ajax.apiRequestUrl(loadedConfig) + Zotero.ajax.apiQueryString(loadedConfig);
    Z.debug("requestUrl: " + requestUrl, 4);
    Z.debug('loadedConfigRequestUrl: ' + loadedConfigRequestUrl, 4);
    if(tags.loaded && (loadedConfigRequestUrl == requestUrl) && checkCached){
        //tags already has the same information we're looking for
        Z.debug("tags already loaded - publishing and resolving deferred", 3);
        deferred.resolve(tags);
        return deferred;
    }
    else{
        Z.debug("tags not loaded", 3);
        //clear library before reloading all the tags
        tags.clear();
        Z.debug("in loadAllTags: tags:", 3);
        Z.debug(tags, 4);
    }
    
    var continueLoadingCallback = J.proxy(function(tags){
        Z.debug("loadAllTags continueLoadingCallback", 3);
        var plainList = Zotero.Tags.prototype.plainTagsList(tags.tagsArray);
        plainList.sort(Zotero.Library.prototype.sortLower);
        tags.plainList = plainList;
        
        Z.debug("done parsing one tags feed - checking for more.", 3);
        
        J.publish('tags_page_loaded', [tags]);
        
        if(tags.hasNextLink){
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
        }
        else{
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
    
    //test to see if we have alltags in cache - TODO:expire or force-reload faster than session storage
    var cacheConfig = {libraryType:library.libraryType, libraryID:library.libraryID, target:'alltags'};
    var alltagsObjects = Zotero.cache.load(cacheConfig);
    if(alltagsObjects !== null && checkCached){
        library.tags.tagObjects = alltagsObjects;
        J.each(alltagsObjects, function(key, val){
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
    }
    else{
        var lDeferred = library.loadTags(urlconfig);
        Zotero.ajax.activeRequests.push(lDeferred);
        lDeferred.done(continueLoadingCallback);
    }
    
    deferred.done(J.proxy(function(){
        var library = this;
        var cacheConfig = {libraryType:library.libraryType, libraryID:library.libraryID, target:'alltags'};
        Zotero.cache.save(cacheConfig, tags.tagObjects);
    }, this));
    
    return deferred;
};

Zotero.Library.prototype.parseFeedObject = function (data) {
    Z.debug("Zotero.Library.parseFeedObject", 3);
    var feed;
    if(typeof(data) == 'string'){
        feed = JSON.parse(data);
    }
    else if(typeof(data) == 'object') {
        feed = data;
    }
    else{
        return false;
    }
    
    var t = new Date();
    t.setTime(Date.parse(feed.updated));
    feed.updated = t;
    
    return feed;
};

Zotero.Library.prototype.addCollection = function(name, parent){
    var config = {'target':'collections', 'libraryType':this.type, 'libraryID':this.libraryID};
    var requestUrl = Zotero.ajax.apiRequestUrl(config) + Zotero.ajax.apiQueryString(config);
    var requestData = JSON.stringify({name:name, parent:parent});
    
    var jqxhr = J.ajax(Zotero.ajax.proxyWrapper(requestUrl, 'POST'),
        {data: requestData,
         type: "POST",
         processData: false,
         headers:{},
         cache:false,
         error: Zotero.ajax.errorCallback
        }
    );
    
    jqxhr.done(J.proxy(function(){
        this.collections.dirty = true;
    }, this));
    jqxhr.fail(Zotero.error);
    
    Zotero.ajax.activeRequests.push(jqxhr);
    
    return jqxhr;
};

Zotero.Library.prototype.trashItem = function(itemKey){
    Z.debug("Zotero.Library.trashItem", 3);
    if(!itemKey) return false;
    
    var item = this.items.getItem(itemKey);
    item.apiObj.deleted = 1;
    return item.writeItem();
};

Zotero.Library.prototype.untrashItem = function(itemKey){
    Z.debug("Zotero.Library.untrashItem", 3);
    if(!itemKey) return false;
    
    var item = this.items.getItem(itemKey);
    item.apiObj.deleted = 0;
    return item.writeItem();
};

Zotero.Library.prototype.deleteItem = function(itemKey){
    Z.debug("Zotero.Library.trashItem", 3);
    if(!itemKey) return false;
    
    var config = {'target':'item', 'libraryType':this.type, 'libraryID':this.libraryID, 'itemKey':itemKey};
    var requestUrl = Zotero.ajax.apiRequestUrl(config) + Zotero.ajax.apiQueryString(config);
    var item = this.items.getItem(itemKey);
    
    var etag = item.etag;
    var jqxhr = J.ajax(Zotero.ajax.proxyWrapper(requestUrl, 'DELETE'),
        {type: "DELETE",
         processData: false,
         headers:{"If-Match":etag},
         cache:false,
         error: Zotero.ajax.errorCallback
        }
    );
    Zotero.ajax.activeRequests.push(jqxhr);
    
    return jqxhr;
};

Zotero.Library.prototype.addNote = function(itemKey, note){
    Z.debug('Zotero.Library.prototype.addNote', 3);
    var config = {'target':'children', 'libraryType':this.type, 'libraryID':this.libraryID, 'itemKey':itemKey};
    
    var requestUrl = Zotero.ajax.apiRequestUrl(config) + Zotero.ajax.apiQueryString(config);
    var item = this.items.getItem(itemKey);
    
    var jqxhr = J.ajax(Zotero.ajax.proxyWrapper(requestUrl, 'POST'),
        {type: "POST",
         processData: false,
         cache:false,
         error: Zotero.ajax.errorCallback
        }
    );
    Zotero.ajax.activeRequests.push(jqxhr);
    
    return jqxhr;
};

Zotero.Library.prototype.fetchGlobalItems = function(config){
    Z.debug("Zotero.Library.fetchGlobalItems", 3);
    Z.debug(config);
    var library = this;
    if(!config){
        config = {};
    }

    var deferred = new J.Deferred();
    
    var defaultConfig = {target:'items',
                         itemPage: 1,
                         limit: 25,
                         content: 'json'
                     };
    
    //Build config object that should be displayed next and compare to currently displayed
    var newConfig = J.extend({}, defaultConfig, config);
    newConfig.start = parseInt(newConfig.limit, 10) * (parseInt(newConfig.itemPage, 10) - 1);
    //Z.debug("newConfig");Z.debug(newConfig);
    var urlconfig = J.extend({'target':'items', 'libraryType': ''}, newConfig);
    var requestUrl = Zotero.ajax.apiRequestUrl(urlconfig) + Zotero.ajax.apiQueryString(urlconfig);
    Z.debug("fetchGlobalItems requestUrl:");
    Z.debug(requestUrl);
    
    var callback = J.proxy(function(data, textStatus, XMLHttpRequest){
        Z.debug('loadItems proxied callback', 3);
        Zotero.temp.globalItemsResponse = data;
        deferred.resolve(data);
    }, this);
    
    var jqxhr = J.ajax(Zotero.ajax.proxyWrapper(requestUrl, 'GET'),
        {type: "GET",
         headers:{},
         cache:false,
         dataType:'json',
         error: Zotero.ajax.errorCallback
        }
    );
    jqxhr.done(callback);
    jqxhr.fail(function(){deferred.reject.apply(null, arguments);}).fail(Zotero.error);
    Zotero.ajax.activeRequests.push(jqxhr);
    
    deferred.done(function(globalItems){
        Z.debug("fetchGlobalItemsDone about to publish");
        J.publish('fetchGlobalItemsDone', globalItems);
    });
    
    return deferred;
};

Zotero.Library.prototype.fetchGlobalItem = function(globalKey){
    Z.debug("Zotero.Library.fetchGlobalItem", 3);
    Z.debug(globalKey);
    var library = this;
    
    var deferred = new J.Deferred();
    
    var defaultConfig = {target:'item'
//                         format: 'json'
                     };
    
    //Build config object that should be displayed next and compare to currently displayed
    var newConfig = J.extend({}, defaultConfig);
    //Z.debug("newConfig");Z.debug(newConfig);
    var urlconfig = J.extend({'target':'item', 'libraryType': '', 'itemKey': globalKey}, newConfig);
    var requestUrl = Zotero.ajax.apiRequestUrl(urlconfig) + Zotero.ajax.apiQueryString(urlconfig);
    Z.debug("fetchGlobalItem requestUrl:");
    Z.debug(requestUrl);
    
    var callback = J.proxy(function(data, textStatus, XMLHttpRequest){
        Z.debug('loadItems proxied callback', 3);
        Zotero.temp.fetchGlobalItemResponse = data;
        deferred.resolve(data);
    }, this);
    
    var jqxhr = J.ajax(Zotero.ajax.proxyWrapper(requestUrl, 'GET'),
        {type: "GET",
         headers:{},
         cache:false,
         dataType:'json',
         error: Zotero.ajax.errorCallback
        }
    );
    jqxhr.done(callback);
    jqxhr.fail(function(){deferred.reject.apply(null, arguments);}).fail(Zotero.error);
    Zotero.ajax.activeRequests.push(jqxhr);
    
    deferred.done(function(globalItem){
        Z.debug("fetchGlobalItemDone about to publish");
        J.publish('fetchGlobalItemDone', globalItem);
    });
    
    return deferred;
};

Zotero.Library.prototype.fetchUserNames = function(userIDs){
    Z.debug("Zotero.Library.fetchUserNames", 3);
    var library = this;
    var reqUrl = Zotero.config.baseWebsiteUrl + '/api/useraliases?userID=' + userIDs.join(',');
    var jqxhr = J.getJSON(reqUrl, J.proxy(function(data, textStatus, jqXHR){
        Z.debug("fetchNames returned");
        Z.debug(JSON.stringify(data));
        Z.debug("userNames:");
        Z.debug(this.usernames);
        J.each(data, function(userID, aliases){
            Z.debug("userID: " + userID + " alias:");
            Z.debug(aliases);
            library.usernames[userID] = aliases;
        });
    }, this) );
    
    return jqxhr;
};

/*METHODS FOR WORKING WITH THE ENTIRE LIBRARY -- NOT FOR GENERAL USE */

Zotero.Library.prototype.fetchItemKeysModified = function(){
    return this.fetchItemKeys({'order': 'dateModified'});
};

Zotero.Library.prototype.loadCachedItems = function(){
    Z.debug("Zotero.Library.loadCachedItems", 3);
    //test to see if we have items in cache - TODO:expire or force-reload faster than session storage
    var library = this;
    var cacheConfig = {libraryType:library.libraryType, libraryID:library.libraryID, target:'allitems'};
    var allitemsObjects = Zotero.cache.load(cacheConfig);
    var itemsCount;
    if(allitemsObjects !== null){
        Z.debug("Apparently have allItemObjects - loadingDump");
        //Z.debug(allitemsObjects);
        library.items.loadDump(allitemsObjects);
        return allitemsObjects.itemsArray.length;
    }
    else{
        return false;
    }
};

Zotero.Library.prototype.saveCachedItems = function(){
    //test to see if we have items in cache - TODO:expire or force-reload faster than session storage
    var library = this;
    var cacheConfig = {libraryType:library.libraryType, libraryID:library.libraryID, target:'allitems'};
    Zotero.cache.save(cacheConfig, library.items.dump());
    return;
};

//Download and save information about every item in the library
//keys is an array of itemKeys from this library that we need to download
Zotero.Library.prototype.loadItemsFromKeysParallel = function(keys){
    Zotero.debug("Zotero.Library.loadItemsFromKeysParallel", 3);
    var library = this;
    var keyslices = [];
    while(keys.length > 0){
        keyslices.push(keys.splice(0, 50));
    }
    
    var deferred = new J.Deferred();
    var xhrs = [];
    J.each(keyslices, function(ind, keyslice){
        var keystring = keyslice.join(',');
        xhrs.push(library.loadItemsSimple({'targetModifier':null, 'itemKey':keystring, 'limit':50} ) );
    });
    
    Z.debug("loadItems XHRs to be resolved:");
    Z.debug(xhrs);
    J.when.apply(null, xhrs).then(J.proxy(function(){
        Z.debug("All parallel item requests returned - resolving deferred and publishing loadItemsFromKeysParallelDone", 3);
        deferred.resolve(true);
        J.publish('loadItemsFromKeysParallelDone');
    }, this) );
    
    return deferred;
};

Zotero.Library.prototype.loadCachedCollections = function(){
    Z.debug("Zotero.Library.loadCachedCollections", 3);
    //test to see if we have collections in cache - TODO:expire or force-reload faster than session storage
    var library = this;
    var cacheConfig = {libraryType:library.libraryType, libraryID:library.libraryID, target:'allcollections'};
    var allcollectionObjects = Zotero.cache.load(cacheConfig);
    if(allcollectionObjects !== null){
        Z.debug("Apparently have allcollectionObjects - loadingDump");
        library.collections.loadDump(allcollectionObjects);
        return true;
    }
    else{
        return false;
    }
};

//download the itemkey lists for every collection
Zotero.Library.prototype.loadCollectionMembership = function(collections){
    Z.debug("Zotero.Library.loadCollectionMembership", 3);
    var library = this;
    var deferred = new J.Deferred();
    var neededCollections = [];
    for(var i = 0; i < collections.length; i++){
        if(collections[i].itemKeys === false){
            neededCollections.push(collections[i]);
        }
    }
    
    var loadNextCollectionMembers = function(){
        var col = neededCollections.shift();
        if(typeof col == 'undefined'){
            //we're out of collections
            deferred.resolve();
            return;
        }
        else{
            var d = col.getMemberItemKeys();
            d.done(J.proxy(function(){
                loadNextCollectionMembers();
            }, this));
        }
    };
    
    loadNextCollectionMembers();
    
    return deferred;
};

//download templates for every itemType
Zotero.Library.prototype.loadItemTemplates = function(){
    
};

//download possible creatorTypes for every itemType
Zotero.Library.prototype.loadCreatorTypes = function(){
    
};

//take array of itemKeys ordered by modified
//return array of itemKeys that need to be pulled from server
Zotero.Library.prototype.findOutdatedItems = function(itemKeys){
    
};

//find itemKeys that we don't have at all locally
Zotero.Library.prototype.findMissingItems = function(itemKeys){
    var library = this;
    var missingKeys = [];
    J.each(itemKeys, function(ind, val){
        if(!(val in library.items.itemObjects) && val !== ''){
            missingKeys.push(val);
        }
    });
    return missingKeys;
};

//take an array of itemKeys ordered by dateModified and fetch the
//ones that don't match our local copy (or ones we have no copy of)
Zotero.Library.prototype.loadModifiedItems = function(itemKeys){
    Z.debug("Zotero.Library.loadModifiedItems", 3);
    var library = this;
    var missingKeys = library.findMissingItems(itemKeys);
    var needCheckingKeys = [];
    var localEtags = {}; //map of local itemKeys to local item etags
    var item;
    var keepChecking = true;
    var loadModifiedItemsDeferred = new J.Deferred();
    
    //remove missingKeys from items to check. We'll get fresh versions of those separately
    Z.debug("removing missingKeys from list of items we need to check");
    J.each(itemKeys, function(ind, val){
        if(J.inArray(val, missingKeys) == -1){
            needCheckingKeys.push(val);
            item = library.items.getItem(val);
            localEtags[val] = item.etag;
        }
        else{
            //dont need to check
        }
    });
    
    Z.debug("needCheckingKeys has " + needCheckingKeys.length + " keys");
    Z.debug(localEtags);
    var mostRecentItemKey = needCheckingKeys.shift();
    needCheckingSlices = [];
    while(needCheckingKeys.length > 0){
        needCheckingSlices.push(needCheckingKeys.splice(0, 50));
    }
    
    var checkNextSlice = function(){
        Zotero.debug("checkNextSlice", 3);
        var nextSlice = needCheckingSlices.shift();
        var keyString = nextSlice.join(',');
        var nextSliceDeferred = library.loadItems({'targetModifier':null, 'itemKey':keyString, 'limit':50});
        nextSliceDeferred.done(J.proxy(function(freshItems){
            J.each(freshItems.itemsArray, function(ind, val){
                var ikey = val.itemKey;
                if(localEtags[ikey] == val.etag){
                    //found a local item that matches so we're done - resolve deferred
                    Z.debug("Found local item that was up to date - stop checking", 3);
                    keepChecking = false;
                    loadModifiedItemsDeferred.resolve(true);
                    return false;
                }
            });
            if(keepChecking){
                checkNextSlice();
            }
        }, this));
    };
    //NOTE: we may need some different functions for fetching items that won't be in
    //danger of overwriting current ones and making it look like we were already up to date
    //currently any item fetch puts the item in the library which could also overwrite
    //local changes
    //
    //check the most recently edited item
    Z.debug("First itemKey to check - " + mostRecentItemKey, 3);
    var itemDeferred = library.loadItem(mostRecentItemKey);
    itemDeferred.done(J.proxy(function(fetchedItem){
        Z.debug("Got first item back");
        if(fetchedItem.etag == localEtags[fetchedItem.itemKey]){
            //item is up to date and we don't need to do any more
            Z.debug("local and remote etags match on first item", 3);
            J.publish("localItemsUpToDate");
            loadModifiedItemsDeferred.resolve(true);
        }
        else{
            Z.debug("local and remote etags do not match on first item - pulling down slices", 3);
            if(needCheckingSlices.length > 0){
                checkNextSlice();
            }
            else{
                Z.debug("Something wrong. Should need to check for items, but no slices to check");
            }
        }
    }, this) );
    
    return loadModifiedItemsDeferred;
};


Zotero.Library.prototype.loadModifiedCollections = function(itemKeys){
    Z.debug("Zotero.Library.loadModifiedCollections", 3);
    var library = this;
    //var missingKeys = library.findMissingCollections(itemKeys);
};

Zotero.Library.prototype.loadModifiedTags = function(itemKeys){
    Z.debug("Zotero.Library.loadModifiedTags", 3);
    var library = this;
    //var missingKeys = library.findMissingTags(itemKeys);
};

//publishes: displayedItemsUpdated
Zotero.Library.prototype.buildItemDisplayView = function(params){
    Z.debug("Zotero.Library.buildItemDisplayView", 3);
    Z.debug(params);
    //start with list of all items if we don't have collectionKey
    //otherwise get the list of items in that collection
    var library = this;
    var itemKeys;
    if(params.collectionKey){
        var collection = library.collections.getCollection(params.collectionKey);
        if(collection === false){
            Z.error("specified collectionKey - " + params.collectionKey + " - not found in current library.");
            return false;
        }
        if(collection.itemKeys === false){
            //haven't retrieved itemKeys for that collection, do so then re-run buildItemDisplayView
            var d = collection.getMemberItemKeys();
            d.done(J.proxy(library.buildItemDisplayView, this));
            return false;
        }
        else{
            itemKeys = collection.itemKeys;
        }
    }
    else{
        itemKeys = library.itemKeys;
    }
    //add top level items to displayedItemsArray
    library.items.displayItemsArray = [];
    var item;
    J.each(itemKeys, function(ind, val){
        item = library.items.getItem(val);
        if(item && (!item.parentKey)) {
            library.items.displayItemsArray.push(item);
        }
    });
    Z.debug("Starting with " + library.items.displayItemsArray.length + ' items displayed');
    //filter displayedItemsArray by selected tags
    var selectedTags = params.tag || [];
    if(typeof selectedTags == 'string') selectedTags = [selectedTags];
    //Z.debug("Selected Tags:");
    //Z.debug(selectedTags);
    //TODO: make this not perform horribly on large libraries
    var tagFilteredArray = J.grep(library.items.displayItemsArray, J.proxy(function(item, index){
        var itemTags = item.apiObj.tags;
        //Z.debug(itemTags);
        var found = false;
        for(var i = 0; i < selectedTags.length; i++){
            found = false;
            for(var j = 0; j < itemTags.length; j++){
                if(itemTags[j].tag == selectedTags[i]){
                    found = true;
                }
            }
            if(found === false) return false;
        }
        return true;
    }, this));
    
    library.items.displayItemsArray = tagFilteredArray;
    Z.debug("Filtered by tags");
    Z.debug("Down to " + library.items.displayItemsArray.length + ' items displayed');
    //filter displayedItemsArray by search term
    //(need full text array or to decide what we're actually searching on to implement this locally)
    //
    //sort displayedItemsArray by given or configured column
    Z.debug("Sorting by title");
    var orderCol = params['order'] || 'title';
    var sort = params['sort'] || 'asc';
    
    library.items.displayItemsArray.sort(J.proxy(function(a, b){
        var aval = a.get(orderCol);
        var bval = b.get(orderCol);
        //if(typeof aval == 'undefined') aval = '';
        //if(typeof bval == 'undefined') bval = '';
        
        //Z.debug("comparing '" + aval + "' to '" + bval +"'");
        if(typeof aval == 'string'){
            return aval.localeCompare(bval);
        }
        else {
            return (aval - bval);
        }
    }, this));
    
    if(sort == 'desc'){
        library.items.displayItemsArray.reverse();
    }
    //
    //publish event signalling we're done
    Z.debug("publishing displayedItemsUpdated");
    J.publish("displayedItemsUpdated");
};

Zotero.Library.prototype.saveFileOffline = function(item){
    try{
    Z.debug("Zotero.Library.saveFileOffline", 3);
    var library = this;
    var deferred = new J.Deferred();
    
    if(library.filestorage === false){
        return false;
    }
    var enclosureUrl;
    var mimetype;
    if(item.links && item.links['enclosure']){
        enclosureUrl = item.links.enclosure.href;
        mimetype = item.links.enclosure.type;
    }
    else{
        return false;
    }
    
    var reqUrl = enclosureUrl + Zotero.ajax.apiQueryString({});
    
    Z.debug("reqUrl:" + reqUrl, 3);
    
    var xhr = new XMLHttpRequest();
    xhr.open('GET', Zotero.ajax.proxyWrapper(reqUrl, 'GET'), true);
    xhr.responseType = 'blob';

    xhr.onload = function(e) {
        try{
        if (this.status == 200) {
            Z.debug("Success downloading");
            var blob = this.response;
            //Zotero.temp.fileDataUrl = Util.fileToObjectURL(blob);
            //Zotero.temp.fileUrl = Util.fileToObjectURL(blob);
            library.filestorage.filer.write('/' + item.itemKey, {data:blob, type: mimetype}, J.proxy(function(fileEntry, fileWriter){
                try{
                Z.debug("Success writing file");
                Z.debug("Saved file for item " + item.itemKey + ' for offline use');
                Z.debug("Saving file object somewhere in Zotero namespace:");
                library.filestorage.filer.open(fileEntry, J.proxy(function(file){
                    try{
                    Z.debug("reading back filesystem stored file into object url");
                    //we could return an objectUrl here, but I think that would keep it in memory when we don't necessarily need it
                    //Zotero.temp.fileUrlAfter = Util.fileToObjectURL(file);
                    deferred.resolve(true);
                    }
                    catch(e){
                        Z.debug("Caught in filer.open");
                        Z.debug(e);
                    }
                }, this) );
                }
                catch(e){
                    Z.debug("Caught in filer.write");
                    console.log(e);
                }
            }, this) );
        }
        }
        catch(e){
            Z.debug("Caught inside binary xhr onload");
            console.log(e);
        }
    };
    xhr.send();
    
    /*
    var downloadDeferred = J.get(Zotero.ajax.proxyWrapper(reqUrl, 'GET'), J.proxy(function(data, textStatus, jqXHR){
        //Z.debug(data);
        Zotero.temp.fileDataUrl = Util.strToDataURL(data, mimetype);
        library.filestorage.filer.write('/' + item.itemKey, {data:data, type: mimetype}, J.proxy(function(fileEntry, fileWriter){
            Z.debug("Success");
            Z.debug("Saved file for item " + item.itemKey + ' for offline use');
            Z.debug("Saving file object somewhere in Zotero namespace:");
            library.filestorage.filer.open(fileEntry, J.proxy(function(file){
                Zotero.temp.fileUrl = Util.fileToObjectURL(file);
            }, this) );
        }, this) );
    }, this) );
     */
        return deferred;
    }
    catch(e){
        Z.debug("Caught in Z.Library.saveFileOffline");
        console.log(e);
    }
};

//save a set of files offline, identified by itemkeys
Zotero.Library.prototype.saveFileSetOffline = function(itemKeys){
    Z.debug("Zotero.Library.saveFileSetOffline", 3);
    var library = this;
    var ds = [];
    var deferred = new J.Deferred();
    var item;
    var childItemKeys = [];
    var checkedKeys = {};
    
    J.each(itemKeys, function(ind, itemKey){
        if(checkedKeys.hasOwnProperty(itemKey)){
            return;
        }
        else{
            checkedKeys[itemKey] = 1;
        }
        item = library.items.getItem(itemKey);
        if(item && item.links && item.links['enclosure']){
            ds.push(library.saveFileOffline(item));
        }
        if(item.numChildren){
            J.each(item.childItemKeys, function(ind, val){
                childItemKeys.push(val);
            });
        }
    });
    
    J.each(childItemKeys, function(ind, itemKey){
        if(checkedKeys.hasOwnProperty(itemKey)){
            return;
        }
        else{
            checkedKeys[itemKey] = 1;
        }
        item = library.items.getItem(itemKey);
        if(item && item.links && item.links['enclosure']){
            ds.push(library.saveFileOffline(item));
        }
    });
    
    J.when.apply(null, ds).then(J.proxy(function(){
        var d = library.filestorage.listOfflineFiles();
        d.done(J.proxy(function(localItemKeys){
            deferred.resolve();
        }, this) );
    }));
    
    return deferred;
};

Zotero.Library.prototype.saveCollectionFilesOffline = function(collectionKey){
    Zotero.debug("Zotero.Library.saveCollectionFilesOffline " + collectionKey, 3);
    var library = this;
    var collection = library.collections.getCollection(collectionKey);
    var itemKeys = collection.itemKeys;
    var d = Zotero.Library.prototype.saveFileSetOffline(itemKeys);
    return d;
};


Zotero.Entry = function(){
    this.instance = "Zotero.Entry";
};

Zotero.Entry.prototype.dumpEntry = function(){
    var dump = {};
    var dataProperties = [
        'title',
        'author',
        'id',
        'published',
        'dateAdded',
        'updated',
        'dateModified',
        'links'
    ];
    for (var i = 0; i < dataProperties.length; i++) {
        dump[dataProperties[i]] = this[dataProperties[i]];
    }
    return dump;
};

Zotero.Entry.prototype.loadDumpEntry = function(dump){
    var dataProperties = [
        'title',
        'author',
        'id',
        'published',
        'dateAdded',
        'updated',
        'dateModified',
        'links'
    ];
    for (var i = 0; i < dataProperties.length; i++) {
        this[dataProperties[i]] = dump[dataProperties[i]];
    }
    return this;
};

Zotero.Entry.prototype.dump = Zotero.Entry.prototype.dumpEntry;

Zotero.Entry.prototype.parseXmlEntry = function(eel){
    Z.debug("Zotero.Entry.parseXmlEntry", 4);
    this.title = eel.children("title").text();
    
    this.author = {};
    this.author["name"] = eel.children("author").children("name").text();
    this.author["uri"] = eel.children("author").children("uri").text();
    
    this.id = eel.children('id').first().text();
    
    this.published = eel.children("published").text();
    this.dateAdded = this.published;
    
    this.updated = eel.children("updated").text();
    this.dateModified = this.updated;
    
    var links = {};
    eel.children("link").each(function(){
        var rel = J(this).attr("rel");
        links[rel] = {
            rel  : J(this).attr("rel"),
            type : J(this).attr("type"),
            href : J(this).attr("href"),
            length: J(this).attr('length')
        };
    });
    this.links = links;
};

//associate Entry with a library so we can update it on the server
Zotero.Entry.prototype.associateWithLibrary = function(library){
    this.libraryUrlIdentifier = library.libraryUrlIdentifier;
    this.libraryType = library.libraryType;
    this.libraryID = library.libraryID;
    this.owningLibrary = library;
    return this;
};
Zotero.Collections = function(feed){
    var collections = this;
    this.instance = "Zotero.Collections";
    this.collectionsArray = [];
    this.dirty = false;
    this.loaded = false;
    
    if(typeof feed == 'undefined'){
        return;
    }
    else{
        this.addCollectionsFromFeed(feed);
    }
};

Zotero.Collections.prototype.dump = function(){
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

Zotero.Collections.prototype.loadDump = function(dump){
    var collections = this;
    this.dirty = dump.dirty;
    this.loaded = dump.loaded;
    
    for (var i = 0; i < dump.collectionsArray.length; i++) {
        var collection = new Zotero.Collection();
        collection.loadDump(dump.collectionsArray[i]);
        this.addCollection(collection);
    }
    
    //populate the secondary data structures
    this.collectionsArray.sort(this.sortByTitleCompare);
    //Nest collections as entries of parent collections
    J.each(this.collectionsArray, function(index, obj) {
        if(obj.instance === "Zotero.Collection"){
            if(obj.nestCollection(collections)){
                Z.debug(obj.key + ":" + obj.title + " nested in parent.", 4);
            }
        }
    });
    this.assignDepths(0, this.collectionsArray);
    
    return this;
};

//take Collection XML and insert a Collection object
Zotero.Collections.prototype.addCollection = function(collection){
    this.collectionsArray.push(collection);
    this[collection.key] = collection;
    if(this.owningLibrary){
        collection.associateWithLibrary(this.owningLibrary);
    }
    
    return this;
};

Zotero.Collections.prototype.addCollectionsFromFeed = function(feed){
    var collections = this;
    var collectionsAdded = [];
    feed.entries.each(function(index, entry){
        var collection = new Zotero.Collection(J(entry) );
        collections.addCollection(collection);
        collectionsAdded.push(collection);
    });
    return collectionsAdded;
};

Zotero.Collections.prototype.sortByTitleCompare = function(a, b){
    //Z.debug("compare by key: " + a + " < " + b + " ?", 4);
    if(a.title.toLowerCase() == b.title.toLowerCase()){
        return 0;
    }
    if(a.title.toLowerCase() < b.title.toLowerCase()){
        return -1;
    }
    return 1;
};

Zotero.Collections.prototype.assignDepths = function(depth, cArray){
    Z.debug("Zotero.Collections.assignDepths", 3);
    var insertchildren = function(depth, children){
        J.each(children, function(index, col){
            col.nestingDepth = depth;
            if(col.hasChildren){
                insertchildren((depth + 1), col.entries);
            }
        });
    };
    J.each(this.collectionsArray, function(index, collection){
        if(collection.topLevel){
            collection.nestingDepth = 1;
            if(collection.hasChildren){
                //Z.debug(collection.entries);
                insertchildren(2, collection.entries);
            }
        }
    });
};

Zotero.Collections.prototype.nestedOrderingArray = function(){
    Z.debug("Zotero.Collections.nestedOrderingArray", 3);
    var nested = [];
    var insertchildren = function(a, children){
        J.each(children, function(index, col){
            a.push(col);
            if(col.hasChildren){
                insertchildren(a, col.entries);
            }
        });
    };
    J.each(this.collectionsArray, function(index, collection){
        if(collection.topLevel){
            nested.push(collection);
            if(collection.hasChildren){
                insertchildren(nested, collection.entries);
            }
        }
    });
    Z.debug("Done with nestedOrderingArray", 3);
    return nested;
};

Zotero.Collections.prototype.loadDataObjects = function(collectionsArray){
    Z.debug("Zotero.Collections.loadDataObjects", 3);
    var library = this.owningLibrary;
    var collections = this;
    
    J.each(collectionsArray, function(index, dataObject){
        var collectionKey = dataObject['collectionKey'];
        var collection = new Zotero.Collection();
        collection.loadObject(dataObject);
        
        collection.libraryUrlIdentifier = collections.libraryUrlIdentifier;
        collection.libraryType = library.type;
        collection.libraryID = library.libraryID;
        collection.owningLibrary = library;
        library.collections[collection.collectionKey] = collection;
        library.collections.collectionsArray.push(collection);
    });
    
    collections.collectionsArray.sort(collections.sortByTitleCompare);
    //Nest collections as entries of parent collections
    J.each(collections.collectionsArray, function(index, obj) {
        if(obj.instance === "Zotero.Collection"){
            if(obj.nestCollection(collections)){
                Z.debug(obj.key + ":" + obj.title + " nested in parent.", 4);
            }
        }
    });
    collections.assignDepths(0, collections.collectionsArray);
    
    return collections;
};

Zotero.Collections.prototype.getCollection = function(key){
    if(this.hasOwnProperty(key)){
        return this[key];
    }
    else{
        return false;
    }
};
Zotero.Items = function(feed){
    //represent items as array for ordering purposes
    this.displayItemsArray = [];
    this.displayItemsUrl = '';
    this.itemObjects = {};
    this.unsyncedItemObjects = {};
    
    if(typeof feed != 'undefined'){
        this.addItemsFromFeed(feed);
    }
};

Zotero.Items.prototype.dump = function(){
    var dump = {};
    dump.instance = "Zotero.Items.dump";
    dump.itemsArray = [];
    J.each(this.itemObjects, function(key, val){
        dump.itemsArray.push(val.dump());
    });
    return dump;
};

Zotero.Items.prototype.loadDump = function(dump){
    Z.debug("-------------------------------Zotero.Items.loadDump", 3);
    var items = this;
    var itemKeys = [];
    for (var i = 0; i < dump.itemsArray.length; i++) {
        var item = new Zotero.Item();
        item.loadDump(dump.itemsArray[i]);
        this.addItem(item);
        itemKeys.push(item.itemKey);
    }
    
    if(this.owningLibrary){
        this.owningLibrary.itemKeys = itemKeys;
    }
    
    //add child itemKeys to parent items to make getChildren work locally
    Z.debug("Adding childItemKeys to items loaded from dump");
    var parentItem;
    J.each(items.itemObjects, function(ind, item){
        if(item.parentKey){
            parentItem = items.getItem(item.parentKey);
            if(parentItem !== false){
                parentItem.childItemKeys.push(item.itemKey);
            }
        }
    });
    //TODO: load secondary data structures
    //nothing to do here yet? display items array is separate - populated with itemKey request
    
    return this;
};

Zotero.Items.prototype.getItem = function(key){
    //Z.debug("Zotero.Items.getItem", 3);
    if(this.itemObjects.hasOwnProperty(key)){
        return this.itemObjects[key];
    }
    return false;
};

Zotero.Items.prototype.getItems = function(keys){
    var items = this;
    var gotItems = [];
    for(var i = 0; i < keys.length; i++){
        gotItems.push(items.getItem(keys[i]));
    }
    return gotItems;
};

Zotero.Items.prototype.loadDataObjects = function(itemsArray){
    //Z.debug("Zotero.Items.loadDataObjects", 3);
    var loadedItems = [];
    var libraryItems = this;
    J.each(itemsArray, function(index, dataObject){
        var itemKey = dataObject['itemKey'];
        var item = new Zotero.Item();
        item.loadObject(dataObject);
        //Z.debug('item objected loaded');
        //Z.debug(item);
        libraryItems.itemObjects[itemKey] = item;
        //Z.debug('item added to items.itemObjects');
        loadedItems.push(item);
    });
    return loadedItems;
};

Zotero.Items.prototype.addItem = function(item){
    this.itemObjects[item.itemKey] = item;
    if(this.owningLibrary){
        item.associateWithLibrary(this.owningLibrary);
    }
    return this;
};

Zotero.Items.prototype.addItemsFromFeed = function(feed){
    var items = this;
    var itemsAdded = [];
    feed.entries.each(function(index, entry){
        var item = new Zotero.Item(J(entry) );
        items.addItem(item);
        itemsAdded.push(item);
    });
    return itemsAdded;
};

//return array of itemKeys that we don't have a copy of
Zotero.Items.prototype.keysNotInItems = function(keys){
    var notPresent = [];
    J.each(keys, function(ind, val){
        if(!this.itemObjects.hasOwnProperty(val)){
            notPresent.push(val);
        }
    });
    return notPresent;
};

Zotero.Tags = function(feed){
    //represent collections as array for ordering purposes
    this.displayTagsArray = [];
    this.displayTagsUrl = '';
    this.tagObjects = {};
    this.tagsArray = [];
    if(typeof feed != 'undefined'){
        this.addTagsFromFeed(feed);
    }
};

Zotero.Tags.prototype.dump = function(){
    var dump = {};
    dump.tagsArray = [];
    for (var i = 0; i < this.tagsArray.length; i++) {
        dump.tagsArray.push(this.tagsArray[i].dump());
    }
    dump.displayTagsUrl = this.displayTagsUrl;
    return dump;
};

Zotero.Tags.prototype.loadDump = function(dump){
    this.displayTagsUrl = dump.displayTagsUrl;
    for (var i = 0; i < dump.tagsArray.length; i++) {
        var tag = new Zotero.Tag();
        tag.loadDump(dump.tagsArray[i]);
        this.addTag(tag);
    }
    
    this.updateSecondaryData();
    return this;
};

Zotero.Tags.prototype.addTag = function(tag){
    this.tagObjects[tag.title] = tag;
    this.tagsArray.push(tag);
    if(this.owningLibrary){
        tag.associateWithLibrary(this.owningLibrary);
    }
};

Zotero.Tags.prototype.plainTagsList = function(tagsArray){
    Z.debug("Zotero.Tags.plainTagsList", 3);
    var plainList = [];
    J.each(tagsArray, function(index, element){
        plainList.push(element.title);
    });
    return plainList;
};

Zotero.Tags.prototype.clear = function(){
    Z.debug("Zotero.Tags.clear", 3);
    this.displayTagsArray = [];
    this.displayTagsUrl = '';
    this.tagObjects = {};
    this.tagsArray = [];
};

Zotero.Tags.prototype.updateSecondaryData = function(){
    Z.debug("Zotero.Tags.updateSecondaryData", 3);
    var tags = this;
    tags.tagsArray = [];
    J.each(tags.tagObjects, function(key, val){
        tags.tagsArray.push(val);
    });
    tags.tagsArray.sort(Zotero.Library.prototype.sortByTitleCompare);
    var plainList = tags.plainTagsList(tags.tagsArray);
    plainList.sort(Zotero.Library.prototype.sortLower);
    tags.plainList = plainList;
};

Zotero.Tags.prototype.addTagsFromFeed = function(feed){
    Z.debug('Zotero.Tags.addTagsFromFeed', 3);
    var tags = this;
    var tagsAdded = [];
    feed.entries.each(function(index, entry){
        var tag = new Zotero.Tag(J(entry));
        tags.addTag(tag);
        tagsAdded.push(tag);
    });
    return tagsAdded;
};
Zotero.Collection = function(entryEl){
    this.instance = "Zotero.Collection";
    this.libraryUrlIdentifier = '';
    this.itemKeys = false;
    if(typeof entryEl != 'undefined'){
        this.parseXmlCollection(entryEl);
    }
};

Zotero.Collection.prototype = new Zotero.Entry();
Zotero.Collection.prototype.instance = "Zotero.Collection";

Zotero.Collection.prototype.dump = function(){
    var dump = this.dumpEntry();
    var dataProperties = [
        'collectionKey',
        'key',
        'numItems',
        'numCollections',
        'name',
        'parent',
        'topLevel',
        'websiteCollectionLink',
        'hasChildren',
        'etag',
        'itemKeys'
    ];
    for (var i = 0; i < dataProperties.length; i++) {
        dump[dataProperties[i]] = this[dataProperties[i]];
    }
    return dump;
};

Zotero.Collection.prototype.loadDump = function(dump){
    this.loadDumpEntry(dump);
    var dataProperties = [
        'collectionKey',
        'key',
        'numItems',
        'numCollections',
        'name',
        'parent',
        'topLevel',
        'websiteCollectionLink',
        'hasChildren',
        'etag',
        'itemKeys'
    ];
    for (var i = 0; i < dataProperties.length; i++) {
        this[dataProperties[i]] = dump[dataProperties[i]];
    }
    return this;
};

Zotero.Collection.prototype.loadObject = function(ob){
    this.collectionKey = ob.collectionKey;
    this.dateAdded = ob.dateAdded;
    this.dateModified = ob.dateUpdated;
    this.key = this.collectionKey;
    this['links'] = ob['links'];
    this['title'] = ob['title'];
    this['name'] = ob['title'];
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
    this['name'] = cel.find("title").text();
    this.dateAdded = this.published;//cel.find("published").text();
    this.dateModified = this.updated;//cel.find("updated").text();
    var linksArray = [];
    //link parsing also done in parseXmlEntry, not sure which version is better, but this necessary for collection nesting right now
    cel.find("link").each(function(index, element){
        var link = J(element);
        linksArray.push({'rel':link.attr('rel'), 'type':link.attr('type'), 'href':link.attr('href')});
    });
    
    this.parent = null;
    this.topLevel = true;
    var collection = this;
    
    this.websiteCollectionLink = Zotero.config.baseWebsiteUrl + '/' + this.libraryUrlIdentifier + '/items/collection/' + this.collectionKey;
    this.hasChildren = (this.numCollections) ? true : false;
    
    //parse the JSON content block
    var contentEl = cel.find('content'); //possibly we should test to make sure it is application/json or zotero json
    
    var j = JSON.parse(cel.find('content').first().text());
    this['name'] = j['name'];
    this['parent'] = j['parent'];
    if(this['parent']){
        this.topLevel = false;
    }
    this.etag = contentEl.attr('zapi:etag');
};

Zotero.Collection.prototype.parseJsonXmlCollection = function(cel){
    this.parseXmlCollection(cel);
    var j = JSON.parse(cel.find("content").text());
    this['name'] = j['name'];
    this.parent = j.parent;
    if(this.parent){
        this.topLevel = false;
    }
    this.etag = cel.find("content").attr('zapi:etag');
};

Zotero.Collection.prototype.nestCollection = function(collectionList) {
    Z.debug("Zotero.Collection.nestCollection", 4);
    if(this.parent !== null){
        var parentKey = this.parent;
        if(typeof(collectionList[parentKey]) !== 'undefined'){
            Z.debug("Pushing " + this.key + "(" + this.title + ") onto entries of parent " + parentKey + "(" + collectionList[parentKey].title + ")", 4);
            var parentOb = collectionList[parentKey];
            if(typeof(parentOb.entries) === 'undefined'){
                parentOb.entries = [this];
            }
            else {
                parentOb.entries.push(this);
            }
            parentOb.hasChildren = true;
            this.topLevel = false;
            return true;
        }
    }
    return false;
};

Zotero.Collection.prototype.addItems = function(itemKeys){
    Z.debug('Zotero.Collection.addItems', 3);
    Z.debug(itemKeys, 3);
    var config = {'target':'items', 'libraryType':this.libraryType, 'libraryID':this.libraryID, 'collectionKey':this.collectionKey, 'content':'json'};
    var requestUrl = Zotero.ajax.apiRequestUrl(config) + Zotero.ajax.apiQueryString(config);
    var requestData = itemKeys.join(' ');
    
    var jqxhr = J.ajax(Zotero.ajax.proxyWrapper(requestUrl, 'POST'),
        {data: requestData,
         type: "POST",
         processData: false,
         headers:{},
         cache:false,
         error: Zotero.ajax.errorCallback
        }
    );
    
    Zotero.ajax.activeRequests.push(jqxhr);
    
    return jqxhr;
    //J.publish('Collection.addItems', [this.key, itemKeys, jqxhr]);
};

Zotero.Collection.prototype.getMemberItemKeys = function(){
    Z.debug('Zotero.Collection.getMemberItemKeys', 3);
    Z.debug('Current Collection: ' + this.collectionKey, 3);
    Z.debug(this.itemKeys, 3);
    var config = {'target':'items', 'libraryType':this.libraryType, 'libraryID':this.libraryID, 'collectionKey':this.collectionKey, 'format':'keys'};
    var requestUrl = Zotero.ajax.apiRequestUrl(config) + Zotero.ajax.apiQueryString(config);
    var deferred = new J.Deferred();
    
    var jqxhr = J.ajax(Zotero.ajax.proxyWrapper(requestUrl, 'GET'),
        {type: "GET",
         processData: false,
         headers:{},
         cache:false,
         error: Zotero.ajax.errorCallback
        }
    );
    
    jqxhr.done(J.proxy(function(data, textStatus, XMLHttpRequest){
        Z.debug('getMemberItemKeys proxied callback', 3);
        var c = this;
        var result = data;
        var keys = J.trim(result).split(/[\s]+/);
        c.itemKeys = keys;
        deferred.resolve(keys);
    }, this) );
    Zotero.ajax.activeRequests.push(jqxhr);
    
    return deferred;
};

Zotero.Collection.prototype.removeItem = function(itemKey){
    var config = {'target':'item', 'libraryType':this.libraryType, 'libraryID':this.libraryID, 'collectionKey':this.collectionKey, 'itemKey':itemKey};
    var requestUrl = Zotero.ajax.apiRequestUrl(config) + Zotero.ajax.apiQueryString(config);
    
    var jqxhr = J.ajax(Zotero.ajax.proxyWrapper(requestUrl, 'DELETE'),
        {type: "DELETE",
         processData: false,
         headers:{},
         cache:false,
         error: Zotero.ajax.errorCallback
        }
    );
    Zotero.ajax.activeRequests.push(jqxhr);
    
    return jqxhr;
    //J.publish('Collection.removeItem', [this.key, itemKey, jqxhr]);
};

Zotero.Collection.prototype.update = function(name, parentKey){
    if(!parentKey) parentKey = false;
    var config = {'target':'collection', 'libraryType':this.libraryType, 'libraryID':this.libraryID, 'collectionKey':this.key};
    var requestUrl = Zotero.ajax.apiRequestUrl(config) + Zotero.ajax.apiQueryString(config);
    var requestData = JSON.stringify({'name':name, 'parent':parentKey});
    
    var jqxhr = J.ajax(Zotero.ajax.proxyWrapper(requestUrl, 'PUT'),
        {data: requestData,
         type: "PUT",
         processData: false,
         headers:{
             'If-Match': this.etag
         },
         cache:false,
         error: Zotero.ajax.errorCallback
        }
    );
    
    Zotero.ajax.activeRequests.push(jqxhr);
    
    return jqxhr;
    //J.publish('Collection.updateCollection', [this.key, itemKey, jqxhr]);
};

Zotero.Collection.prototype.remove = function(){
    Z.debug("Zotero.Collection.delete", 3);
    var config = {'target':'collection', 'libraryType':this.libraryType, 'libraryID':this.libraryID, 'collectionKey':this.key};
    var requestUrl = Zotero.ajax.apiRequestUrl(config) + Zotero.ajax.apiQueryString(config);
    
    var jqxhr = J.ajax(Zotero.ajax.proxyWrapper(requestUrl, 'DELETE'),
        {type: "DELETE",
         processData: false,
         headers:{
             'If-Match': this.etag
         },
         cache:false,
         error: Zotero.ajax.errorCallback
        }
    );
    Zotero.ajax.activeRequests.push(jqxhr);
    
    return jqxhr;
    //J.publish('Collection.delete', [this.key, itemKey, jqxhr]);
};
Zotero.Item = function(entryEl){
    this.instance = "Zotero.Item";
    this.apiObj = {};
    this.dataFields = {};
    this.childItemKeys = [];
    if(typeof entryEl != 'undefined'){
        this.parseXmlItem(entryEl);
    }
};

Zotero.Item.prototype = new Zotero.Entry();

Zotero.Item.prototype.dump = function(){
    var dump = this.dumpEntry();
    var dataProperties = [
        'itemKey',
        'itemType',
        'creatorSummary',
        'year',
        'numChildren',
        'numTags',
        'parentKey',
        'etag',
        'contentRows',
        'apiObj',
        'mimeType',
        'translatedMimeType',
        'linkMode',
        'attachmentDownloadLink'
    ];
    for (var i = 0; i < dataProperties.length; i++) {
        dump[dataProperties[i]] = this[dataProperties[i]];
    }
    return dump;
};

Zotero.Item.prototype.loadDump = function(dump){
    this.loadDumpEntry(dump);
    var dataProperties = [
        'itemKey',
        'itemType',
        'creatorSummary',
        'year',
        'numChildren',
        'numTags',
        'parentKey',
        'etag',
        'contentRows',
        'apiObj',
        'mimeType',
        'translatedMimeType',
        'linkMode',
        'attachmentDownloadLink'
    ];
    for (var i = 0; i < dataProperties.length; i++) {
        this[dataProperties[i]] = dump[dataProperties[i]];
    }
    //TODO: load secondary data structures
    
    return this;
};

Zotero.Item.prototype.loadObject = function(ob) {
    Z.debug('Zotero.Item.loadObject', 3);
    if(typeof(ob) === 'string'){
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

Zotero.Item.prototype.parseXmlItem = function (iel) {
    this.parseXmlEntry(iel);
    
    //parse entry metadata
    this.itemKey = iel.find("zapi\\:key, key").text();
    this.itemType = iel.find("zapi\\:itemType, itemType").text();
    this.creatorSummary = iel.find("zapi\\:creatorSummary, creatorSummary").text();
    this.year = iel.find("zapi\\:year, year").text();
    this.numChildren = parseInt(iel.find("zapi\\:numChildren, numChildren").text(), 10);
    this.numTags = parseInt(iel.find("zapi\\:numTags, numChildren").text(), 10);
    
    if(isNaN(this.numChildren)){
        this.numChildren = 0;
    }
    
    this.parentKey = false;
    //set parent if can find up link in entry
    if(this.links['up']){
        var parentLink = this.links['up']['href'];
        var re = new RegExp("items\/([A-Z0-9]{8})");
        this.parentKey = re.exec(parentLink)[1];
    }
    
    //parse content block
    var contentEl = iel.children("content");
    //check for multi-content response
    var subcontents = iel.find("zapi\\:subcontent, subcontent");
    if(subcontents.size() > 0){
        for(var i = 0; i < subcontents.size(); i++){
            var sc = J(subcontents.get(i));
            this.parseContentBlock(sc);
        }
    }
    else{
        this.parseContentBlock(contentEl);
    }
};

/**
 * Parse a content or subcontent node based on its type
 * @param  {jQuery wrapped node} cel content or subcontent element
 */
Zotero.Item.prototype.parseContentBlock = function(contentEl){
    if(contentEl.attr('type') == 'application/json' || contentEl.attr('type') == 'json' || contentEl.attr('zapi:type') == 'json'){
        this.itemContentType = 'json';
        this.parseJsonItemContent(contentEl);
    }
    else if(contentEl.attr('zapi:type') == 'bib'){
        this.itemContentType = 'bib';
        this.bibContent = contentEl.text();
        this.parsedBibContent = true;
    }
    else if(contentEl.attr('type') == 'xhtml'){
        this.itemContentType = 'xhtml';
        this.parseXmlItemContent(contentEl);
    }
    else{
        this.itemContentType = 'other';
    }
};

Zotero.Item.prototype.parseXmlItemContent = function (cel) {
    var contentRows = [];
    var dataFields = {};
    cel.find("div > table").children("tr").each(function(){
        contentRows.push({
            field : J(this).attr("class"),
            fieldMapped : J(this).children("th").text(),
            fieldValue : J(this).children("td").text()
        });
    });
    this.contentRows = contentRows;
    J.each(contentRows, function(index, value){
        dataFields[value.field] = value.fieldValue;
    });
    this.dataFields = dataFields;
};

Zotero.Item.prototype.parseJsonItemContent = function (cel) {
    this.etag = cel.attr('zapi:etag');
    var dataFields = JSON.parse(cel.text());
    var contentRows = [];
    var item = this;
    J.each(dataFields, function(index, value){
        if(index == 'tags'){
            item.tags = value;
        }
        else if(index == 'creators'){
            item.creators = value;
        }
        else if(index == 'attachments'){
            item.attachments = value;
        }
        else{
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
    
    if(this.dataFields['itemType'] == 'attachment'){
        this.mimeType = this.dataFields['contentType'];
        this.translatedMimeType = Zotero.utils.translateMimeType(this.mimeType);
    }
    if(this.dataFields.hasOwnProperty('linkMode')){
        this.linkMode = this.dataFields['linkMode'];
    }
    
    this.attachmentDownloadLink = Zotero.url.attachmentDownloadLink(this);
};

Zotero.Item.prototype.initEmpty = function(itemType, linkMode){
    this.etag = '';
    var item = this;
    var deferred = new J.Deferred();
    var d = this.getItemTemplate(itemType, linkMode);
    
    var callback = J.proxy(function(template){
        this.itemType = template.itemType;
        this.itemKey = '';
        var dataFields = template;
        var contentRows = [];
        J.each(dataFields, function(index, value){
            if(index == 'tags'){
                item.tags = value;
            }
            else if(index == 'creators'){
                item.creators = value;
            }
            else{
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

Zotero.Item.prototype.writeItem = function(){
    Z.debug("Zotero.Item.writeItem", 3);
    var target = 'item';
    var item = this;
    var newItem = true;
    var newChildItem = false;
    var childrenConfig, newChildrenRequestUrl, requestData, jqxhr;
    
    if(this.itemKey){
        newItem = false;
    }
    if(newItem && this.parentItemKey){
        newChildItem = true;
        target = "children";
    }
    
    var config = {'target':target, 'libraryType':this.libraryType, 'libraryID':this.libraryID, 'itemKey':this.itemKey, 'content':'json'};
    if(newChildItem){
        config.itemKey = this.parentItemKey;
    }
    
    var requestUrl = Zotero.ajax.apiRequestUrl(config) + Zotero.ajax.apiQueryString(config);
    if(!newItem){
        childrenConfig = {'target':'children', 'libraryType':this.libraryType, 'libraryID':this.libraryID, 'itemKey':this.itemKey, 'content':'json'};
        newChildrenRequestUrl = Zotero.ajax.apiRequestUrl(childrenConfig) + Zotero.ajax.apiQueryString(childrenConfig);
    }
    
    //add empty creators if we don't have any so we don't get an error
    if(!this.apiObj.hasOwnProperty('creators')){
        this.apiObj.creators = [];
    }
    
    //add empty attachments if we don't have any so we don't get an error
    if(!this.apiObj.hasOwnProperty('attachments')){
        this.apiObj.attachments = [];
    }
    
    //remove any creators that have no names
    var newCreatorsArray = this.apiObj.creators.filter(function(c){
        if(c.name || c.firstName || c.lastName){
            return true;
        }
        return false;
    });
    this.apiObj.creators = newCreatorsArray;
    
    //update item with server response if successful
    var successCallback = J.proxy(function(data, successcode, jqXhr){
        Z.debug("writeItem successCallback", 3);
        var entryEl = J(data).find("entry");
        this.parseXmlItem(entryEl);
    }, this);
    
    var childSuccessCallback = J.proxy(function(data, successcode, jqXhr){
        Z.debug("writeItem childSuccessCallback", 3);
        if(item.numChildren){
            item.numChildren++;
        }
        else {
            item.numChildren = 1;
            J.publish("hasFirstChild", [item.itemKey]);
        }
    }, this);
    
    //copy apiObj and remove unwriteable fields
    var writeApiObj = J.extend({}, this.apiObj);
    //delete writeApiObj['linkMode'];
    delete writeApiObj['mimeType'];
    delete writeApiObj['charset'];
    //delete writeApiObj['contentType'];
    delete writeApiObj['filename'];
    delete writeApiObj['md5'];
    delete writeApiObj['mtime'];
    delete writeApiObj['zip'];
    
    //TODO: don't do this
    writeApiObj['attachments'] = [];
    
    var requests = [];
    
    if(!newItem){
        Z.debug("have itemKey, making PUT writeItem request", 3);
        
        //take notes out of apiObj and make them separate children requests
        var notes = this.apiObj.notes;
        delete this.apiObj.notes;
        delete writeApiObj.notes;
        
        //take attachments out
        delete writeApiObj.attachments;
        
        //make request to update item
        requestData = JSON.stringify(writeApiObj);
        jqxhr = J.ajax(Zotero.ajax.proxyWrapper(requestUrl, 'PUT'),
            {data: requestData,
             type: "PUT",
             processData: false,
             headers:{'If-Match': this.etag, 'Content-Type': 'application/json'},
             success: successCallback,
             cache:false,
             error: Zotero.ajax.errorCallback
            }
        );
        requests.push(jqxhr);
        
        //make requests to add new children if we have any
        if(J.isArray(notes) && notes.length){
            Z.debug("have child notes for existing item - making separate requests to create children", 3);
            var noteItemsObj = {items:notes};
            Z.debug("new child notes on existing item", 3);
            Z.debug(noteItemsObj, 4);
            requestData = JSON.stringify(noteItemsObj);
            jqxhr = J.ajax(Zotero.ajax.proxyWrapper(newChildrenRequestUrl, 'POST'),
                {data: requestData,
                 type: "POST",
                 processData: false,
                 headers:{'Content-Type': 'application/json'},
                 success: childSuccessCallback,
                 cache:false,
                 error: Zotero.ajax.errorCallback
                }
            );
            requests.push(jqxhr);
        }
    }
    else{
        Z.debug("have no itemKey, making POST writeItem request", 3);
        requestData = JSON.stringify({items:[writeApiObj]});
        jqxhr = J.ajax(Zotero.ajax.proxyWrapper(requestUrl, 'POST'),
            {data: requestData,
             type: "POST",
             processData: false,
             headers:{'Content-Type': 'application/json'},
             success: successCallback,
             cache:false,
             error: Zotero.ajax.errorCallback
            }
        );
        requests.push(jqxhr);
    }
    
    J.each(requests, function(){
        Zotero.ajax.activeRequests.push(this);
    });
    
    return J.when.apply(J, requests);
//    J.publish("itemWriteRequest", [this, jqxhr]);
};

Zotero.Item.prototype.getChildren = function(library){
    Z.debug("Zotero.Item.getChildren", 3);
    var deferred = J.Deferred();
    //short circuit if has item has no children
    if(!(this.numChildren) || (this.parentKey !== false)){
        deferred.resolve([]);
        return deferred;
    }
    
    var config = {'target':'children', 'libraryType':this.libraryType, 'libraryID':this.libraryID, 'itemKey':this.itemKey, 'content':'json'};
    var requestUrl = Zotero.ajax.apiRequestUrl(config) + Zotero.ajax.apiQueryString(config);
    
    var callback = J.proxy(function(data, textStatus, jqxhr){
        Z.debug('getChildren proxied callback', 4);
        var itemfeed = new Zotero.Feed(data);
        var items = library.items;
        var childItems = items.addItemsFromFeed(itemfeed);
        for (var i = childItems.length - 1; i >= 0; i--) {
            childItems[i].associateWithLibrary(library);
        }
        
        deferred.resolve(childItems);
    }, this);
    
    var jqxhr = J.ajax(Zotero.ajax.proxyWrapper(requestUrl, 'GET'),
        {type: "GET",
         processData: false,
         headers:{},
         cache:false,
         error: Zotero.ajax.errorCallback
        }
    );
    jqxhr.done(callback);
    jqxhr.fail(function(){deferred.reject.apply(null, arguments);});//.fail(Zotero.ui.ajaxErrorMessage);
    
    Zotero.ajax.activeRequests.push(jqxhr);
    
    return deferred;
    //J.publish('getItemChildren', [this, jqxhr]);
};

Zotero.Item.prototype.addToCollection = function(collectionKey){
    
};

Zotero.Item.prototype.getItemTypes = function (locale) {
    Z.debug("Zotero.Item.prototype.getItemTypes", 3);
    if(!locale){
        locale = 'en-US';
    }
    locale = 'en-US';

    var itemTypes = Zotero.cache.load({locale:locale, target:'itemTypes'});
    if(itemTypes){
        Z.debug("have itemTypes in localStorage", 3);
        Zotero.Item.prototype.itemTypes = itemTypes;//JSON.parse(Zotero.storage.localStorage['itemTypes']);
        return;
    }
    
    var query = Zotero.ajax.apiQueryString({locale:locale});
    var url = Zotero.config.baseApiUrl + '/itemTypes' + query;
    J.getJSON(Zotero.ajax.proxyWrapper(url, 'GET'),
            {},
            function(data, textStatus, XMLHttpRequest){
                Z.debug("got itemTypes response", 3);
                Z.debug(data, 4);
                Zotero.Item.prototype.itemTypes = data;
                Zotero.cache.save({locale:locale, target:'itemTypes'}, Zotero.Item.prototype.itemTypes);
            }
    );
};

Zotero.Item.prototype.getItemFields = function (locale) {
    Z.debug("Zotero.Item.prototype.getItemFields", 3);
    if(!locale){
        locale = 'en-US';
    }
    locale = 'en-US';
    
    var itemFields = Zotero.cache.load({locale:locale, target:'itemFields'});
    if(itemFields){
        Z.debug("have itemFields in localStorage", 3);
        Zotero.Item.prototype.itemFields = itemFields;//JSON.parse(Zotero.storage.localStorage['itemFields']);
        J.each(Zotero.Item.prototype.itemFields, function(ind, val){
            Zotero.localizations.fieldMap[val.field] = val.localized;
        });
        return;
    }
    
    var query = Zotero.ajax.apiQueryString({locale:locale});
    var requestUrl = Zotero.config.baseApiUrl + '/itemFields' + query;
    J.getJSON(Zotero.ajax.proxyWrapper(requestUrl),
            {},
            function(data, textStatus, XMLHttpRequest){
                Z.debug("got itemTypes response", 4);
                Zotero.Item.prototype.itemFields = data;
                Zotero.cache.save({locale:locale, target:'itemFields'}, data);
                //Zotero.storage.localStorage['itemFields'] = JSON.stringify(data);
                J.each(Zotero.Item.prototype.itemFields, function(ind, val){
                    Zotero.localizations.fieldMap[val.field] = val.localized;
                });
            }
    );
};

Zotero.Item.prototype.getItemTemplate = function (itemType, linkMode) {
    Z.debug("Zotero.Item.prototype.getItemTemplate", 3);
    var deferred = new J.Deferred();
    
    if(typeof itemType == 'undefined') itemType = 'document';
    if(itemType == 'attachment' && typeof linkMode == 'undefined'){
        throw "attachment template requested with no linkMode";
    }
    if(typeof linkMode == "undefined"){
        linkMode = '';
    }

    var query = Zotero.ajax.apiQueryString({itemType:itemType, linkMode:linkMode});
    var requestUrl = Zotero.config.baseApiUrl + '/items/new' + query;
    
    var cacheConfig = {itemType:itemType, target:'itemTemplate'};
    var itemTemplate = Zotero.cache.load(cacheConfig);
    if(itemTemplate){
        Z.debug("have itemTemplate in localStorage", 3);
        var template = itemTemplate;// JSON.parse(Zotero.storage.localStorage[url]);
        deferred.resolve(template);
        return deferred;
    }
    
    //callback always executed in this context
    var callback = J.proxy(function(data, textStatus, XMLHttpRequest){
        Z.debug("got itemTemplate response", 3);
        Z.debug(data, 4);
        Zotero.cache.save(cacheConfig, data);
        //Zotero.storage.localStorage[url] = JSON.stringify(data);
        deferred.resolve(data);
    }, this);
    
    J.getJSON(Zotero.ajax.proxyWrapper(requestUrl),
            {},
            callback
    );
    
    return deferred;
};

Zotero.Item.prototype.getUploadAuthorization = function(fileinfo, oldmd5){
    //fileInfo: md5, filename, filesize, mtime, zip, contentType, charset
    Z.debug("Zotero.Item.getUploadAuthorization", 3);
    var config = {'target':'item', 'targetModifier':'file', 'libraryType':this.libraryType, 'libraryID':this.libraryID, 'itemKey':this.itemKey};
    var fileconfig = J.extend({}, config);
    /*var uploadQueryString = '?';
    J.each(fileinfo, function(ind, val){
        uploadQueryString += ind + '=' + val + '&';
    });
    */
    var requestUrl = Zotero.ajax.apiRequestUrl(config) + Zotero.ajax.apiQueryString(config);// uploadQueryString;
    
    //var deferred = new J.Deferred();
    
    var headers = {};
    if(oldmd5){
        headers['If-Match'] = oldmd5;
    }
    else{
        headers['If-None-Match'] = '*';
    }

    var jqxhr = J.ajax(Zotero.ajax.proxyWrapper(requestUrl, 'POST'),
            {type: "POST",
             processData: true,
             data:fileinfo,
             headers:headers,
             //success: callback,
             cache:false,
             error: Zotero.ajax.errorCallback
            }
        );
    
    Z.debug("returning jqxhr from getUploadAuthorization", 4);
    return jqxhr;
};

Zotero.Item.prototype.registerUpload = function(uploadKey, oldmd5){
    Z.debug("Zotero.Item.registerUpload", 3);
    var config = {'target':'item', 'targetModifier':'file', 'libraryType':this.libraryType, 'libraryID':this.libraryID, 'itemKey':this.itemKey};
    var requestUrl = Zotero.ajax.apiRequestUrl(config) + Zotero.ajax.apiQueryString(config);
    
    if(!oldmd5){
        headers = {"If-None-Match": "*"};
    }
    else{
        headers = {"If-Match": oldmd5};
    }
    
    var jqxhr = J.ajax(Zotero.ajax.proxyWrapper(requestUrl, 'POST'),
            {
                type: "POST",
                processData: true,
                data:{upload: uploadKey},
                headers: headers,
                cache:false
            });
    return jqxhr;
};

Zotero.Item.prototype.fullUpload = function(file){

};

Zotero.Item.prototype.creatorTypes = {};

Zotero.Item.prototype.getCreatorTypes = function (itemType) {
    Z.debug("Zotero.Item.prototype.getCreatorTypes: " + itemType, 3);
    if(!itemType){
        itemType = 'document';
    }
    
    var deferred = new J.Deferred();
    
    //parse stored creatorTypes object if it exists
    //creatorTypes maps itemType to the possible creatorTypes
    var creatorTypes = Zotero.cache.load({target:'creatorTypes'});
    if(creatorTypes){
        Z.debug("have creatorTypes in localStorage", 3);
        Zotero.Item.prototype.creatorTypes = creatorTypes;//JSON.parse(Zotero.storage.localStorage['creatorTypes']);
    }
    
    if(Zotero.Item.prototype.creatorTypes[itemType]){
        Z.debug("creatorTypes of requested itemType available in localStorage", 3);
        Z.debug(Zotero.Item.prototype.creatorTypes, 4);
        deferred.resolve(Zotero.Item.prototype.creatorTypes[itemType]);
    }
    else{
        Z.debug("sending request for creatorTypes", 3);
        var query = Zotero.ajax.apiQueryString({itemType:itemType});
        var requestUrl = Zotero.config.baseApiUrl + '/itemTypeCreatorTypes' + query;
        var callback = J.proxy(function(data, textStatus, XMLHttpRequest){
                    Z.debug("got creatorTypes response", 4);
                    Zotero.Item.prototype.creatorTypes[itemType] = data;
                    //Zotero.storage.localStorage['creatorTypes'] = JSON.stringify(Zotero.Item.prototype.creatorTypes);
                    Zotero.cache.save({target:'creatorTypes'}, Zotero.Item.prototype.creatorTypes);
                    deferred.resolve(Zotero.Item.prototype.creatorTypes[itemType]);
                }, this);
        
        J.getJSON(Zotero.ajax.proxyWrapper(requestUrl),
                {},
                callback
        );
    }
    return deferred;
};

Zotero.Item.prototype.getCreatorFields = function (locale) {
    Z.debug("Zotero.Item.prototype.getCreatorFields", 3);
    var creatorFields = Zotero.cache.load({target:'creatorFields'});
    if(creatorFields){
        Z.debug("have creatorFields in localStorage", 3);
        Zotero.Item.prototype.creatorFields = creatorFields;// JSON.parse(Zotero.storage.localStorage['creatorFields']);
        return;
    }
    
    //if(typeof itemType == 'undefined') itemType = 'document';
    var requestUrl = Zotero.config.baseApiUrl + '/creatorFields';
    J.getJSON(Zotero.ajax.proxyWrapper(requestUrl),
            {},
            function(data, textStatus, XMLHttpRequest){
                Z.debug("got itemTypes response", 4);
                Zotero.Item.prototype.creatorFields = data;
                //Zotero.storage.localStorage['creatorFields'] = JSON.stringify(data);
                Zotero.cache.save({target:'creatorFields'}, data);
            }
    );
};

//---Functions to manually add Zotero format data instead of fetching it from the API ---
//To be used first with cached data for offline, could also maybe be used for custom types
Zotero.Item.prototype.addItemTypes = function(itemTypes, locale){
    
};

Zotero.Item.prototype.addItemFields = function(itemType, itemFields){
    
};

Zotero.Item.prototype.addCreatorTypes = function(itemType, creatorTypes){
    
};

Zotero.Item.prototype.addCreatorFields = function(itemType, creatorFields){
    
};

Zotero.Item.prototype.addItemTemplates = function(templates){
    
};

Zotero.Item.prototype.fieldMap = {
    "itemType"            : "Type",
    "title"               : "Title",
    "dateAdded"           : "Date Added",
    "dateModified"        : "Date Modified",
    "source"              : "Source",
    "notes"               : "Notes",
    "tags"                : "Tags",
    "attachments"         : "Attachments",
    "related"             : "Related",
    "url"                 : "URL",
    "rights"              : "Rights",
    "series"              : "Series",
    "volume"              : "Volume",
    "issue"               : "Issue",
    "edition"             : "Edition",
    "place"               : "Place",
    "publisher"           : "Publisher",
    "pages"               : "Pages",
    "ISBN"                : "ISBN",
    "publicationTitle"    : "Publication",
    "ISSN"                : "ISSN",
    "date"                : "Date",
    "year"                : "Year",
    "section"             : "Section",
    "callNumber"          : "Call Number",
    "archive"             : "Archive",
    "archiveLocation"     : "Loc. in Archive",
    "libraryCatalog"      : "Library Catalog",
    "distributor"         : "Distributor",
    "extra"               : "Extra",
    "journalAbbreviation" : "Journal Abbr",
    "DOI"                 : "DOI",
    "accessDate"          : "Accessed",
    "seriesTitle"         : "Series Title",
    "seriesText"          : "Series Text",
    "seriesNumber"        : "Series Number",
    "institution"         : "Institution",
    "reportType"          : "Report Type",
    "code"                : "Code",
    "session"             : "Session",
    "legislativeBody"     : "Legislative Body",
    "history"             : "History",
    "reporter"            : "Reporter",
    "court"               : "Court",
    "numberOfVolumes"     : "# of Volumes",
    "committee"           : "Committee",
    "assignee"            : "Assignee",
    "patentNumber"        : "Patent Number",
    "priorityNumbers"     : "Priority Numbers",
    "issueDate"           : "Issue Date",
    "references"          : "References",
    "legalStatus"         : "Legal Status",
    "codeNumber"          : "Code Number",
    "artworkMedium"       : "Medium",
    "number"              : "Number",
    "artworkSize"         : "Artwork Size",
    "repository"          : "Repository",
    "videoRecordingType"  : "Recording Type",
    "interviewMedium"     : "Medium",
    "letterType"          : "Type",
    "manuscriptType"      : "Type",
    "mapType"             : "Type",
    "scale"               : "Scale",
    "thesisType"          : "Type",
    "websiteType"         : "Website Type",
    "audioRecordingType"  : "Recording Type",
    "label"               : "Label",
    "presentationType"    : "Type",
    "meetingName"         : "Meeting Name",
    "studio"              : "Studio",
    "runningTime"         : "Running Time",
    "network"             : "Network",
    "postType"            : "Post Type",
    "audioFileType"       : "File Type",
    "version"             : "Version",
    "system"              : "System",
    "company"             : "Company",
    "conferenceName"      : "Conference Name",
    "encyclopediaTitle"   : "Encyclopedia Title",
    "dictionaryTitle"     : "Dictionary Title",
    "language"            : "Language",
    "programmingLanguage" : "Language",
    "university"          : "University",
    "abstractNote"        : "Abstract",
    "websiteTitle"        : "Website Title",
    "reportNumber"        : "Report Number",
    "billNumber"          : "Bill Number",
    "codeVolume"          : "Code Volume",
    "codePages"           : "Code Pages",
    "dateDecided"         : "Date Decided",
    "reporterVolume"      : "Reporter Volume",
    "firstPage"           : "First Page",
    "documentNumber"      : "Document Number",
    "dateEnacted"         : "Date Enacted",
    "publicLawNumber"     : "Public Law Number",
    "country"             : "Country",
    "applicationNumber"   : "Application Number",
    "forumTitle"          : "Forum/Listserv Title",
    "episodeNumber"       : "Episode Number",
    "blogTitle"           : "Blog Title",
    "caseName"            : "Case Name",
    "nameOfAct"           : "Name of Act",
    "subject"             : "Subject",
    "proceedingsTitle"    : "Proceedings Title",
    "bookTitle"           : "Book Title",
    "shortTitle"          : "Short Title",
    "docketNumber"        : "Docket Number",
    "numPages"            : "# of Pages",
    "note"                : "Note",
    "numChildren"         : "# of Children",
    "addedBy"             : "Added By",
    "creator"             : "Creator"
};

Zotero.localizations.fieldMap = Zotero.Item.prototype.fieldMap;

Zotero.Item.prototype.typeMap = {
    "note"                : "Note",
    "attachment"          : "Attachment",
    "book"                : "Book",
    "bookSection"         : "Book Section",
    "journalArticle"      : "Journal Article",
    "magazineArticle"     : "Magazine Article",
    "newspaperArticle"    : "Newspaper Article",
    "thesis"              : "Thesis",
    "letter"              : "Letter",
    "manuscript"          : "Manuscript",
    "interview"           : "Interview",
    "film"                : "Film",
    "artwork"             : "Artwork",
    "webpage"             : "Web Page",
    "report"              : "Report",
    "bill"                : "Bill",
    "case"                : "Case",
    "hearing"             : "Hearing",
    "patent"              : "Patent",
    "statute"             : "Statute",
    "email"               : "E-mail",
    "map"                 : "Map",
    "blogPost"            : "Blog Post",
    "instantMessage"      : "Instant Message",
    "forumPost"           : "Forum Post",
    "audioRecording"      : "Audio Recording",
    "presentation"        : "Presentation",
    "videoRecording"      : "Video Recording",
    "tvBroadcast"         : "TV Broadcast",
    "radioBroadcast"      : "Radio Broadcast",
    "podcast"             : "Podcast",
    "computerProgram"     : "Computer Program",
    "conferencePaper"     : "Conference Paper",
    "document"            : "Document",
    "encyclopediaArticle" : "Encyclopedia Article",
    "dictionaryEntry"     : "Dictionary Entry"
};

Zotero.localizations.typeMap = Zotero.Item.prototype.typeMap;

Zotero.Item.prototype.creatorMap = {
    "author"         : "Author",
    "contributor"    : "Contributor",
    "editor"         : "Editor",
    "translator"     : "Translator",
    "seriesEditor"   : "Series Editor",
    "interviewee"    : "Interview With",
    "interviewer"    : "Interviewer",
    "director"       : "Director",
    "scriptwriter"   : "Scriptwriter",
    "producer"       : "Producer",
    "castMember"     : "Cast Member",
    "sponsor"        : "Sponsor",
    "counsel"        : "Counsel",
    "inventor"       : "Inventor",
    "attorneyAgent"  : "Attorney/Agent",
    "recipient"      : "Recipient",
    "performer"      : "Performer",
    "composer"       : "Composer",
    "wordsBy"        : "Words By",
    "cartographer"   : "Cartographer",
    "programmer"     : "Programmer",
    "reviewedAuthor" : "Reviewed Author",
    "artist"         : "Artist",
    "commenter"      : "Commenter",
    "presenter"      : "Presenter",
    "guest"          : "Guest",
    "podcaster"      : "Podcaster"
};

Zotero.localizations.creatorMap = Zotero.Item.prototype.creatorMap;

Zotero.Item.prototype.itemTypeImageSrc = {
    "note"                : "note",
    "attachment"          : "attachment-pdf",
    "attachmentPdf"       : "attachment-pdf",
    "attachmentWeblink"   : "attachment-web-link",
    "attachmentSnapshot"  : "attachment-snapshot",
    "attachmentFile"      : "attachment-file",
    "attachmentLink"      : "attachment-link",
    "book"                : "book",
    "bookSection"         : "book_open",
    "journalArticle"      : "page_white_text",
    "magazineArticle"     : "layout",
    "newspaperArticle"    : "newspaper",
    "thesis"              : "report",
    "letter"              : "email_open",
    "manuscript"          : "script",
    "interview"           : "comments",
    "film"                : "film",
    "artwork"             : "picture",
    "webpage"             : "page",
    "report"              : "report",
    "bill"                : "page_white",
    "case"                : "page_white",
    "hearing"             : "page_white",
    "patent"              : "page_white",
    "statute"             : "page_white",
    "email"               : "email",
    "map"                 : "map",
    "blogPost"            : "layout",
    "instantMessage"      : "page_white",
    "forumPost"           : "page",
    "audioRecording"      : "ipod",
    "presentation"        : "page_white",
    "videoRecording"      : "film",
    "tvBroadcast"         : "television",
    "radioBroadcast"      : "transmit",
    "podcast"             : "ipod_cast",
    "computerProgram"     : "page_white_code",
    "conferencePaper"     : "treeitem-conferencePaper",
    "document"            : "page_white",
    "encyclopediaArticle" : "page_white",
    "dictionaryEntry"     : "page_white"
};

Zotero.Item.prototype.itemTypeImageClass = function(){
    //linkModes: imported_file,imported_url,linked_file,linked_url
    var item = this;
    if(item.itemType == 'attachment'){
        switch(item.linkMode){
            case 'imported_file':
                if(item.translatedMimeType == 'pdf'){
                    return this.itemTypeImageSrc['attachmentPdf'];
                }
                return this.itemTypeImageSrc['attachmentFile'];
            case 'imported_url':
                if(item.translatedMimeType == 'pdf'){
                    return this.itemTypeImageSrc['attachmentPdf'];
                }
                return this.itemTypeImageSrc['attachmentSnapshot'];
            case 'linked_file':
                return this.itemTypeImageSrc['attachmentLink'];
            case 'linked_url':
                return this.itemTypeImageSrc['attachmentWeblink'];
            default:
                return this.itemTypeImageSrc['attachment'];
        }
    }
    else {
        return item.itemType;
    }
};

Zotero.Item.prototype.get = function(key){
    if(key == 'title'){
        return this.title;
    }
    else if(key == 'creatorSummary'){
        return this.creatorSummary;
    }
    else if(key in this.apiObj){
        return this.apiObj[key];
    }
};
Zotero.Tag = function (entry) {
    this.instance = "Zotero.Tag";
    if(typeof entry != 'undefined'){
        this.parseXmlTag(entry);
    }
};

Zotero.Tag.prototype = new Zotero.Entry();

Zotero.Tag.prototype.dump = function(){
    var dump = this.dumpEntry();
    var dataProperties = [
        'numItems',
        'urlencodedtag'
    ];
    for (var i = 0; i < dataProperties.length; i++) {
        dump[dataProperties[i]] = this[dataProperties[i]];
    }
    return dump;
};

Zotero.Tag.prototype.loadDump = function(dump){
    this.loadDumpEntry(dump);
    var dataProperties = [
        'numItems',
        'urlencodedtag'
    ];
    for (var i = 0; i < dataProperties.length; i++) {
        this[dataProperties[i]] = dump[dataProperties[i]];
    }
    return this;
};

Zotero.Tag.prototype.loadObject = function(ob){
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

Zotero.Tag.prototype.parseXmlTag = function (tel) {
    //Z.debug("Zotero.Tag.parseXmlTag", 3);
    //Z.debug(tel);
    this.parseXmlEntry(tel);
    
    this.numItems = tel.find('zapi\\:numItems, numItems').text();
    this.urlencodedtag = encodeURIComponent(this.title);
    //Z.debug("Done with Zotero.Tag.parseXmlTag");
};

Zotero.Tag.prototype.getLinkParams = function () {
    var selectedTags = Zotero.ajax.getUrlVar('tag');
    if(!J.isArray(selectedTags)){
        selectedTags = [selectedTags];
    }
    
    var deparamed = Zotero.ajax.getUrlVars();
    var tagSelected = false;
    var selectedIndex = J.inArray(this.title, selectedTags);
    if(selectedIndex != (-1) ){
        tagSelected = true;
    }
    if(deparamed.hasOwnProperty('tag')){
        if(J.isArray(deparamed.tag)){
            if(!tagSelected) deparamed.tag.push(this.title);
            else{
                deparamed.tag.splice(selectedIndex, 1);
            }
        }
        else{
            if(!tagSelected) deparamed.tag = [deparamed.tag, this.title];
            else deparamed.tag = [];
        }
    }
    else{
        deparamed.tag = this.title;
    }
    
    this.linktagsparams = deparamed;
    return deparamed;
};
Zotero.Group = function () {this.instance = "Zotero.Group";};
Zotero.Group.prototype = new Zotero.Entry();
Zotero.Group.prototype.loadObject = function(ob){
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

Zotero.Group.prototype.parseXmlGroup = function (gel) {
    this.parseXmlEntry(gel);
    
    this.numItems = gel.find('zapi\\:numItems, numItems').text();
    
    var groupEl = gel.find('zxfer\\:group, group');
    if(groupEl.length !== 0){
        this.groupID = groupEl.attr("id");
        this.ownerID = groupEl.attr("owner");
        this.groupType = groupEl.attr("type");
        this.groupName = groupEl.attr("name");
        this.libraryEnabled = groupEl.attr("libraryEnabled");
        this.libraryEditing = groupEl.attr("libraryEditing");
        this.libraryReading = groupEl.attr("libraryReading");
        this.fileEditing = groupEl.attr("fileEditing");
        this.description = groupEl.find('zxfer\\:description, description').text();
        this.memberIDs = groupEl.find('zxfer\\:members, members').text().split(" ");
        this.adminIDs = groupEl.find('zxfer\\:admins, admins').text().split(" ");
        this.itemIDs = groupEl.find('zxfer\\:items, items').text().split(" ");
        
    }
    
};
Zotero.User = function () {this.instance = "Zotero.User";};
Zotero.User.prototype = new Zotero.Entry();
Zotero.User.prototype.loadObject = function(ob){
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

Zotero.User.prototype.parseXmlUser = function (tel) {
    this.parseXmlEntry(tel);
    
    var tagEl = tel.find('content>tag');
    if(tagEl.length !== 0){
        this.tagKey = tagEl.attr('key');// find("zapi\\:itemID").text();
        this.libraryID = tagEl.attr("libraryID");
        this.tagName = tagEl.attr("name");
        this.dateAdded = tagEl.attr('dateAdded');
        this.dateModified = tagEl.attr('dateModified');
    }
    
};
Zotero.utils = {
    slugify: function(name){
        var slug = J.trim(name);
        slug = slug.toLowerCase();
        slug = slug.replace( /[^a-z0-9 ._-]/g , "");
        slug = slug.replace( " ", "_", "g");
        
        return slug;
    },
    
    prependAutocomplete: function(pre, source){
        Z.debug('Zotero.utils.prependAutocomplete', 3);
        Z.debug("prepend match: " + pre);
        var satisfy;
        if(!source){
            Z.debug("source is not defined");
        }
        if(pre === ''){
            satisfy = source.slice(0);
            return satisfy;
        }
        var plen = pre.length;
        var plower = pre.toLowerCase();
        satisfy = J.map(source, function(n){
            if(n.substr(0, plen).toLowerCase() == plower){
                return n;
            }
            else{
                return null;
            }
        });
        return satisfy;
    },
    
    matchAnyAutocomplete: function(pre, source){
        Z.debug('Zotero.utils.matchAnyAutocomplete', 3);
        Z.debug("matchAny match: " + pre);
        var satisfy;
        if(!source){
            Z.debug("source is not defined");
        }
        if(pre === ''){
            satisfy = source.slice(0);
            return satisfy;
        }
        var plen = pre.length;
        var plower = pre.toLowerCase();
        satisfy = J.map(source, function(n){
            if(n.toLowerCase().indexOf(plower) != -1){
                return n;
            }
            else{
                return null;
            }
        });
        return satisfy;
    },
    
    setUserPref: function(name, value){
        Z.debug('Zotero.utils.updateUserPrefs', 3);
        var postob = {'varname': name,
                      'varvalue': value
                     };
        var jqxhr = J.get("/user/setuserpref", postob);
        
        jqxhr.done(J.proxy(function(){
            Z.debug('userpref set:' + name + " : " + value, 3);
        }), this);
        return jqxhr;
    },
    
    libraryString: function(type, libraryID){
        var lstring = '';
        if(type == 'user') lstring = 'u';
        else if(type == 'group') lstring = 'g';
        lstring += libraryID;
        return lstring;
    },
    
    //return true if retrieved more than lifetime minutes ago
    stale: function(retrievedDate, lifetime){
        var now = Date.now(); //current local time
        var elapsed = now.getTime() - retrievedDate.getTime();
        if((elapsed / 60000) > lifetime){
            return true;
        }
        return false;
    },
    
    entityify: function(str){
        var character = {
            '<' : '&lt;',
            '>' : '&gt;',
            '&' : '&amp;',
            '"' : '&quot;'
        };
        return str.replace(/[<>&"]/g, function(c) {
            return character[c];
        });
    },
    
    parseApiDate: function(datestr, date){
        //var parsems = Date.parse(datestr);
        
        var re = /([0-9]+)-([0-9]+)-([0-9]+)T([0-9]+):([0-9]+):([0-9]+)Z/;
        var matches = re.exec(datestr);
        if(matches === null){
            Z.debug("error parsing api date: " + datestr, 1);
            return null;
        }
        else{
            date = new Date(Date.UTC(matches[1], matches[2]-1, matches[3], matches[4], matches[5], matches[6]));
            return date;
        }
        
        return date;
    },
    
    compareObs: function(ob1, ob2, checkVars){
        var loopOn = checkVars;
        var useIndex = false;
        var differences = [];

        if(checkVars === undefined){
            loopOn = ob1;
            useIndex = true;
        }
        
        J.each(loopOn, function(index, Val){
            var compindex = Val;
            if(useIndex) compindex = index;
            
            if(typeof(ob1[index]) == 'object'){
                if (Zotero.utils.compareObs(ob1[compindex], ob2[compindex]).length ) {
                    differences.push(compindex);
                }
                //case 'function':
                //    if (typeof(x[p])=='undefined' || (p != 'equals' && this[p].toString() != x[p].toString())) { return false; }; break;
            }
            else{
                if (ob1[compindex] != ob2[compindex]) {
                    differences.push(compindex);
                }
            }
        });
        return differences;
    },

    /**
     * Translate common mimetypes to user friendly versions
     *
     * @param string $mimeType
     * @return string
     */
    translateMimeType: function(mimeType)
    {
        switch (mimeType) {
            case 'text/html':
                return 'html';
            
            case 'application/pdf':
            case 'application/x-pdf':
            case 'application/acrobat':
            case 'applications/vnd.pdf':
            case 'text/pdf':
            case 'text/x-pdf':
                return 'pdf';
            
            case 'image/jpg':
            case 'image/jpeg':
                return 'jpg';
            
            case 'image/gif':
                return 'gif';
            
            case 'application/msword':
            case 'application/doc':
            case 'application/vnd.msword':
            case 'application/vnd.ms-word':
            case 'application/winword':
            case 'application/word':
            case 'application/x-msw6':
            case 'application/x-msword':
                return 'doc';
            
            case 'application/vnd.oasis.opendocument.text':
            case 'application/x-vnd.oasis.opendocument.text':
                return 'odt';
            
            case 'video/flv':
            case 'video/x-flv':
                return 'flv';
            
            case 'image/tif':
            case 'image/tiff':
            case 'image/tif':
            case 'image/x-tif':
            case 'image/tiff':
            case 'image/x-tiff':
            case 'application/tif':
            case 'application/x-tif':
            case 'application/tiff':
            case 'application/x-tiff':
                return 'tiff';
            
            case 'application/zip':
            case 'application/x-zip':
            case 'application/x-zip-compressed':
            case 'application/x-compress':
            case 'application/x-compressed':
            case 'multipart/x-zip':
                return 'zip';
                
            case 'video/quicktime':
            case 'video/x-quicktime':
                return 'mov';
                
            case 'video/avi':
            case 'video/msvideo':
            case 'video/x-msvideo':
                return 'avi';
                
            case 'audio/wav':
            case 'audio/x-wav':
            case 'audio/wave':
                return 'wav';
                
            case 'audio/aiff':
            case 'audio/x-aiff':
            case 'sound/aiff':
                return 'aiff';
            
            case 'text/plain':
                return 'plain text';
            case 'application/rtf':
                return 'rtf';
                
            default:
                return mimeType;
        }
    }
};
Zotero.url.itemHref = function(item){
    var href = '';
    /*
    J.each(item.links, function(index, link){
        if(link.rel === "alternate"){
            if(link.href){
                href = link.href;
            }
        }
    });
    return href;
    */
    var library = item.owningLibrary;
    href += library.libraryBaseWebsiteUrl + '/itemKey/' + item.itemKey;
    return href;
};

Zotero.url.attachmentDownloadLink = function(item){
    var retString = '';
    if(item.links['enclosure']){
        var tail = item.links['enclosure']['href'].substr(-4, 4);
        if(tail == 'view'){
            //snapshot: redirect to view
            retString += '<a href="' + Zotero.config.baseWebsiteUrl + Zotero.config.nonparsedBaseUrl + '/' + item.itemKey + '/file/view' + '">' + 'View Snapshot</a>';
            
            //retString += '<form style="margin:0;" method="POST" action="' + item.links['enclosure']['href'] + '?key=' + Zotero.config.apiKey + '">(<input type="hidden" name="h" value="1" /><a href="#" onclick="parentNode.submit()">' + item.title + '</a>)</form>';
        }
        else{
            //file: offer download
            var enctype = Zotero.utils.translateMimeType(item.links['enclosure'].type);
            var enc = item.links['enclosure'];
            var filesize = parseInt(enc['length'], 10);
            var filesizeString = "" + filesize + " B";
            if(filesize > 1073741824){
                filesizeString = "" + (filesize / 1073741824).toFixed(1) + " GB";
            }
            else if(filesize > 1048576){
                filesizeString = "" + (filesize / 1048576).toFixed(1) + " MB";
            }
            else if(filesize > 1024){
                filesizeString = "" + (filesize / 1024).toFixed(1) + " KB";
            }
            Z.debug(enctype);
            retString += '<a href="' + Zotero.config.baseWebsiteUrl + Zotero.config.nonparsedBaseUrl + '/' + item.itemKey + '/file' + '">';
            if(enctype == 'undefined' || enctype === '' || typeof enctype == 'undefined'){
                retString += filesizeString + '</a>';
            }
            else{
                retString += enctype + ', ' + filesizeString + '</a>';
            }
            return retString;
        }
    }
    return retString;
};

Zotero.url.attachmentDownloadUrl = function(item){
    var retString = '';
    if(item.links['enclosure']){
        retString = Zotero.config.baseWebsiteUrl + Zotero.config.nonparsedBaseUrl + '/' + item.itemKey + '/file';
        var tail = item.links['enclosure']['href'].substr(-4, 4);
        if(tail == 'view'){
            //snapshot: redirect to view
            retString += '/view';
        }
    }
    else if(item.linkMode == 2 || item.linkMode == 3){
        if(item.apiObj['url']){
            retString = item.apiObj['url'];
        }
    }
    return retString;
};

Zotero.url.attachmentFileDetails = function(item){
    //file: offer download
    if(!item.links['enclosure']) return '';
    var enctype = Zotero.utils.translateMimeType(item.links['enclosure'].type);
    var enc = item.links['enclosure'];
    var filesizeString = '';
    if(enc['length']){
        var filesize = parseInt(enc['length'], 10);
        filesizeString = "" + filesize + " B";
        if(filesize > 1073741824){
            filesizeString = "" + (filesize / 1073741824).toFixed(1) + " GB";
        }
        else if(filesize > 1048576){
            filesizeString = "" + (filesize / 1048576).toFixed(1) + " MB";
        }
        else if(filesize > 1024){
            filesizeString = "" + (filesize / 1024).toFixed(1) + " KB";
        }
        return '(' + enctype + ', ' + filesizeString + ')';
    }
    else {
        return '(' + enctype + ')';
    }
};

Zotero.url.exportUrls = function(config){
    Z.debug("Zotero.url.exportUrls");
    var exportUrls = {};
    var exportConfig = {};
    J.each(Zotero.config.exportFormats, function(index, format){
        exportConfig = J.extend(config, {'format':format});
        exportUrls[format] = Zotero.ajax.apiRequestUrl(exportConfig) + Zotero.ajax.apiQueryString({format:format, limit:'25'});
    });
    Z.debug(exportUrls);
    return exportUrls;
};

Zotero.url.snapshotViewLink = function(item){
    return Zotero.ajax.apiRequestUrl({
        'target':'item',
        'targetModifier':'viewsnapshot',
        'libraryType': item.owningLibrary.libraryType,
        'libraryID': item.owningLibrary.libraryID,
        'itemKey': item.itemKey
    });
};
Zotero.file = {};

Zotero.file.getFileInfo = function(file, callback){
    //fileInfo: md5, filename, filesize, mtime, zip, contentType, charset
    if(typeof FileReader != 'function'){
        throw "FileReader not supported";
    }
    
    var fileInfo = {};
    var reader = new FileReader();
    reader.onload = function(e){
        Z.debug('Zotero.file.getFileInfo onloadFunc');
        var result = e.target.result;
        Zotero.debug(result);
        var spark = new SparkMD5();
        //fileInfo.md5 = MD5(result);
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

Zotero.file.uploadFile = function(uploadInfo, file){
    Z.debug("Zotero.file.uploadFile", 3);
    Z.debug(uploadInfo, 4);
    
    var formData = new FormData();
    J.each(uploadInfo.params, function(index, val){
        formData.append(index, val);
    });
    
    formData.append('file', file);
    
    var xhr = new XMLHttpRequest();
    
    xhr.open('POST', uploadInfo.url, true);
    
    xhr.send(formData);
    return xhr;
    //While s3 does not allow CORS this XHR will not have the normal status
    //information, but will still fire readyStateChanges so you can tell
    //when the upload has finished (even if you can't tell if it was successful
    //from JS)
};

Zotero.Filestorage = function(){
    Z.debug("Zotero.Filestorage", 3);
    var zfilestorage = this;
    this.filer = new Filer();
    this.fileEntries = {};
    Z.debug("Filer created", 3);
    this.filer.init({'persistent': true, 'size': 1024*1024*128}, J.proxy(function(fs){
        Z.debug("Filesystem created");
        zfilestorage.fs = fs;
        zfilestorage.listOfflineFiles();
    }, this)
    );
    Z.debug("returning Zotero.Filestorage");
};

//return an Object URL if we have the file for itemKey saved offline
//otherwise return false
Zotero.Filestorage.prototype.getSavedFile = function(itemKey){
    Zotero.debug("Zotero.Filestorage.getSavedFile", 3);
    var fstorage = this;
    var filer = fstorage.filer;
    var deferred = new J.Deferred();
    // Pass a path.
    filer.open(fstorage.fileEntries[itemKey], J.proxy(function(file) {
        Z.debut("filer.open callback");
        deferred.resolve(file);
    }, this), this.handleError);
    
    return deferred;
};

Zotero.Filestorage.prototype.getSavedFileObjectUrl = function(itemKey){
    Z.debug("Zotero.Filestorage.getSavedFileObjectUrl", 3);
    var fstorage = this;
    var filer = this.filer;
    var objectUrlDeferred = new J.Deferred();
    
    filer.open(fstorage.fileEntries[itemKey], J.proxy(function(file) {
        Z.debug("filer.open callback");
        objectUrlDeferred.resolve(Util.fileToObjectURL(file));
    }, this), this.handleError);
    
    return objectUrlDeferred;
};

//return deferred that resolves with array of itemKeys of files available locally
Zotero.Filestorage.prototype.listOfflineFiles = function(){
    Z.debug("Zotero.Filestorage.listOfflineFiles");
    var fstorage = this;
    var filer = fstorage.filer;
    var fileListDeferred = new J.Deferred();
    
    filer.ls('/', J.proxy(function(entries){
        Z.debug(entries);
        Zotero.offlineFilesEntries = entries;
        var itemKeys = [];
        J.each(entries, function(ind, entry){
            fstorage.fileEntries[entry.name] = entry;
            itemKeys.push(entry.name);
        });
        fileListDeferred.resolve(itemKeys);
    }, this) );
    
    return fileListDeferred;
};

Zotero.Filestorage.prototype.handleError = function(e){
    Zotero.debug("----------------Filestorage Error encountered", 2);
    Zotero.debug(e, 2);
};




var J = jQuery.noConflict();

jQuery(document).ready(function() {
    /* Elements that need to be loaded asynchronously have class .ajaxload
     * within .ajaxload elements: config vars from original pageload are held in data-* attributes of the element
     * current desired content of element will always be defined by data-* attributes overridded / supplemented by
     * url variables (hash or querystring
     * currently displayed content is defined by jQuery config object data attached to the element with key 'currentConfig'
     * each ajaxload callback is responsible for determining what changes need to be made and making them
     */
    
    Z.debug('*&^*&^*&^*&^*&^*&^*&^*&^*&^ DOM READY *&^*&^*&^*&^*&^*&^*&^*&^*&^', 3);
    Zotero.init();
});

Zotero.prefs = {
    debug_level: 3, //lower level is higher priority
    debug_log: true,
    debug_mock: false,
    javascript_enabled: false,
    library_listShowFields: ['title', 'creator', 'dateModified']
};

Zotero.init = function(){
    Z.debug("Zotero init", 3);

    //base init to setup tagline and search bar
    Zotero.pages.base.init();
    
    //run page specific init
    if(undefined !== window.zoterojsClass){
        try{
            Zotero.pages[zoterojsClass].init();
        }
        catch(err){
            Z.debug("Error running page specific init for " + zoterojsClass, 1);
        }
    }
    
    Zotero.nav.parseUrlVars();
    
    if(typeof zoteroData == 'undefined'){
        zoteroData = {};
    }
    
    //----
    Zotero.loadConfig(zoteroData);
    
    
    Zotero.config.startPageTitle = document.title;
    var store;
    if(typeof sessionStorage == 'undefined'){
        store = {};//Zotero.storage.localStorage = {};
    }
    else{
        store = sessionStorage;
    }
    Zotero.cache = new Zotero.Cache(store);

    //get localized item constants if not stored in localstorage
    var locale = "en-US";
    if(zoteroData.locale){
        locale = zoteroData.locale;
    }
    
    //decide if we're on a library page and run library specific setup
    var libraryPage = J("body").hasClass('library');
    if(libraryPage){
        Zotero.config.librarySettings.libraryUserSlug = zoteroData.libraryUserSlug;
        Zotero.config.librarySettings.libraryUserID = zoteroData.libraryUserID;
        Zotero.config.librarySettings.allowEdit = zoteroData.allowEdit;
        
        if(zoteroData.library_listShowFields){
            Zotero.prefs.library_listShowFields = zoteroData.library_listShowFields.split(',');
        }
        if(zoteroData.library_showAllTags){
            Zotero.prefs.library_showAllTags = zoteroData.library_showAllTags;
        }
        if(zoteroData.library_defaultSort){
            var defaultSort = zoteroData.library_defaultSort.split(',');
            if(defaultSort[0]){
                Zotero.config.userDefaultApiArgs['order'] = defaultSort[0];
            }
            if(defaultSort[1]){
                Zotero.config.userDefaultApiArgs['sort'] = defaultSort[1];
            }
            Zotero.config.defaultSortColumn = Zotero.config.userDefaultApiArgs['sort'];
            if(Zotero.config.defaultSortColumn == 'undefined') Zotero.config.defaultSortColumn = 'title';
        }
        
        //load general data if on library page
        if(Zotero.config.pageClass == 'user_library' || Zotero.config.pageClass == 'group_library' || Zotero.config.pageClass == 'my_library'){
            Zotero.Item.prototype.getItemTypes(locale);
            Zotero.Item.prototype.getItemFields(locale);
            Zotero.Item.prototype.getCreatorFields(locale);
            Zotero.Item.prototype.getCreatorTypes();
        }
    }
    
    Zotero.ui.init.all();
    
    J.ajaxSettings.traditional = true;
    
    if(Zotero.nav.getUrlVar('proxy') == 'false'){
        Zotero.config.proxy = false;
    }
    
    if(Zotero.prefs.server_javascript_enabled === false){
        //Zotero.utils.setUserPref('javascript_enabled', '1');
        Zotero.prefs.javascript_enabled = true;
        document.cookie = "zoterojsenabled=1; expires=; path=/";
    }
    
    //J(window).bind('statechange', Zotero.nav.urlChangeCallback);
    // Bind to StateChange Event
    History.Adapter.bind(window,'statechange',function(){ // Note: We are using statechange instead of popstate
        //debugger;
        if(Zotero.nav._ignoreStateChange > 0){
            Zotero.nav._ignoreStateChange--;
            Zotero.nav.urlAlwaysCallback();
            Z.debug("Statechange ignored " + Zotero.nav._ignoreStateChange, 3);
        }
        else{
            Zotero.nav.urlChangeCallback();
        }
        /*
        if((typeof Zotero.state.ignoreStatechange != 'undefined') && (Zotero.state.ignoreStatechange === true)){
            Zotero.state.ignoreStatechange = false;
        }
        else{
            Zotero.nav.urlChangeCallback();
        }
        */
        //var State = History.getState(); // Note: We are using History.getState() instead of event.state
        //History.log(State.data, State.title, State.url);
    });
    
    //call urlChangeCallback on first load since some browsers don't popstate onload
    Zotero.nav.urlChangeCallback();
    
};

//set up Zotero config and prefs based on passed in object
Zotero.loadConfig = function(config){
    //set up user config defaults
    Zotero.config.userDefaultApiArgs = J.extend({}, Zotero.config.defaultApiArgs);
    Zotero.config.userDefaultApiArgs['limit'] = 25;
    
    if(config.mobile){
        Zotero.config.mobile = true;
        //let selectMobilePage know this is an initial pageload
        Zotero.state.mobilePageFirstLoad = true;
    }
    
    if(typeof zoterojsClass !== 'undefined'){
        Zotero.config.pageClass = zoterojsClass;
    }
    else{
        Zotero.config.pageClass = 'default';
    }
    
    if(config.itemsPathString){
        Zotero.config.librarySettings.itemsPathString = config.itemsPathString;
        Zotero.config.nonparsedBaseUrl = config.itemsPathString;
    }
    else if(config.nonparsedBaseUrl){
        Zotero.config.nonparsedBaseUrl = config.nonparsedBaseUrl;
    }
    else{
        Zotero.config.librarySettings.itemsPathString = Zotero.config.baseWebsiteUrl ;
        Zotero.config.nonparsedBaseUrl = Zotero.config.baseWebsiteUrl;
    }
    if(config.locale){
        Zotero.config.locale = config.locale;
    }
    
    if(typeof Globalize !== 'undefined'){
        Globalize.culture(Zotero.config.locale);
    }
    
    if(config.apiKey){
        Zotero.config.apiKey = config.apiKey;
    }
    
    if(config.loggedInUserID){
        Zotero.config.loggedInUserID = config.loggedInUserID;
        Zotero.config.loggedIn = true;
    }
    else{
        Zotero.config.loggedIn = false;
    }
    
};




Zotero.nav = {};

Zotero.nav._ignoreStateChange = 0;

Zotero.nav.urlvars = {q:{},
                       f:{},
                       pathVars:{},
                       startUrl:''
                       };

Zotero.nav.replacePush = false;

Zotero.nav.startUrl = '';
Zotero.nav.currentHref = '';

Zotero.nav.pushTag = function(newtag){
    Z.debug('Zotero.nav.pushTag', 3);
    if(Zotero.nav.urlvars.pathVars['tag']){
        if(Zotero.nav.urlvars.pathVars['tag'] instanceof Array){
            Zotero.nav.urlvars.pathVars['tag'].push(newtag);
        }
        else{
            var currentTag = Zotero.nav.urlvars.pathVars['tag'];
            Zotero.nav.urlvars.pathVars['tag'] = [currentTag, newtag];
        }
    }
    else{
        Zotero.nav.urlvars.pathVars['tag'] = [newtag];
    }
    return;
};

Zotero.nav.popTag = function(oldtag){
    Z.debug('Zotero.nav.popTag', 3);
    if(!Zotero.nav.urlvars.pathVars['tag']){
        return;
    }
    else if(Zotero.nav.urlvars.pathVars['tag'] instanceof Array){
        var newTagArray = Zotero.nav.urlvars.pathVars['tag'].filter(function(element, index, array){
            return element != oldtag;
        });
        Zotero.nav.urlvars.pathVars['tag'] = newTagArray;
        return;
    }
    else if(Zotero.nav.urlvars.pathVars['tag'] == oldtag){
        Zotero.nav.urlvars.pathVars['tag'] = [];
        return;
    }
};

Zotero.nav.toggleTag = function(tagtitle){
    Z.debug('Zotero.nav.toggleTag', 3);
    if(!Zotero.nav.urlvars.pathVars['tag']){
        Z.debug("Zotero.nav.urlvars.pathVars['tag'] evaluates false");
        Z.debug(Zotero.nav.urlvars.pathVars);
        Zotero.nav.urlvars.pathVars['tag'] = [tagtitle];
        return;
    }
    else if(J.isArray(Zotero.nav.urlvars.pathVars['tag'])) {
        Z.debug("pathVars tag is array");
        if(J.inArray(tagtitle, Zotero.nav.urlvars.pathVars['tag']) != (-1) ){
            Z.debug("tag already present, removing", 3);
            var newTagArray = Zotero.nav.urlvars.pathVars['tag'].filter(function(element, index, array){
                return element != tagtitle;
            });
            Zotero.nav.urlvars.pathVars['tag'] = newTagArray;
            return;
        }
        else{
            Z.debug("pushing tag", 3);
            Zotero.nav.urlvars.pathVars['tag'].push(tagtitle);
            return;
        }
    }
    else if(Zotero.nav.urlvars.pathVars['tag'] == tagtitle){
        Zotero.nav.urlvars.pathVars['tag'] = [];
        return;
    }
    else if(typeof Zotero.nav.urlvars.pathVars['tag'] == 'string') {
        var oldValue = Zotero.nav.urlvars.pathVars['tag'];
        Zotero.nav.urlvars.pathVars['tag'] = [oldValue, tagtitle];
        return;
    }
    Z.debug("reached end of toggleTag with no satisfaction");
};

Zotero.nav.unsetUrlVar = function(unset){
    Z.debug("Zotero.nav.unsetUrlVar", 3);
    var pathVars = Zotero.nav.urlvars.pathVars;
    if(pathVars[unset]){
        delete(pathVars[unset]);
    }
};

Zotero.nav.clearUrlVars = function(except){
    Z.debug("Zotero.nav.clearUrlVars", 3);
    Z.debug(except);
    if(!except){
        except = [];
    }
    var pathVars = Zotero.nav.urlvars.pathVars;
    J.each(pathVars, function(key, value){
        if(J.inArray(key, except) == (-1)){
            Z.debug(key + " not in except array - deleting from pathVars");
            delete(pathVars[key]);
        }
    });
};

Zotero.nav.parseUrlVars = function(){
    Z.debug('Zotero.nav.parseUrlVars', 3);
    Zotero.nav.urlvars = {
        q: J.deparam(J.param.querystring()),
        f: Zotero.nav.parseFragmentVars(), // J.deparam(J.param.fragment()),
        pathVars: Zotero.nav.parsePathVars()
    };
};

Zotero.nav.parsePathVars = function(pathname){
    Z.debug('Zotero.nav.parsePathVars');
    //parse variables out of library urls
    //:userslug/items/:itemKey/*
    //:userslug/items/collection/:collectionKey
    //groups/:groupidentifier/items/:itemKey/*
    //groups/:groupidentifier/items/collection/:collectionKey/*
    if(!pathname){
        var state = History.getState();
        pathname = state.cleanUrl;//window.location.pathname
    }
    var basePath = Zotero.config.nonparsedBaseUrl;
    var split_replaced = [];
    var re = new RegExp(".*" + basePath + "\/?");
    var replaced = pathname.replace(re, '');
    
    Z.debug(replaced);
    split_replaced = replaced.split('/');
    
    Z.debug(split_replaced);
    var pathVars = {};
    for(var i=0; i<(split_replaced.length-1); i = i+2){
        var pathVar = pathVars[split_replaced[i]];
        Z.debug('pathVar: ' + pathVar);
        //if var already present change to array and/or push
        if(pathVar){
            Z.debug("pathVar already has value");
            if(pathVar instanceof Array){
                pathVar.push(decodeURIComponent(split_replaced[i+1]));
            }
            else{
                var ar = [pathVar];
                ar.push(decodeURIComponent(split_replaced[i+1]));
                pathVar = ar;
            }
        }
        //otherwise just set the value in the object
        else{
            Z.debug("pathVar does not have value");
            pathVar = decodeURIComponent(split_replaced[i+1]);
        }
        pathVars[split_replaced[i]] = pathVar;
    }
    Z.debug(pathVars);
    return pathVars;
};

Zotero.nav.parseFragmentVars = function(){
    var fragmentVars = {};
    var fragment = J.param.fragment();
    var split_fragment = fragment.split('/');
    for(var i=0; i<(split_fragment.length-1); i = i+2){
        fragmentVars[split_fragment[i]] = split_fragment[i+1];
    }
    return fragmentVars;
};

Zotero.nav.buildUrl = function(urlvars, fragment){
    //Z.debug("Zotero.nav.buildUrl", 3);
    if(typeof fragment === 'undefined') { fragment = false;}
    var basePath = Zotero.config.nonparsedBaseUrl + '/';
    
    var urlVarsArray = [];
    J.each(urlvars, function(index, value){
        if(!value) { return; }
        else if(value instanceof Array){
            J.each(value, function(i, v){
                urlVarsArray.push(index + '/' + encodeURIComponent(v) );
            });
        }
        else{
            urlVarsArray.push(index + '/' + encodeURIComponent(value) );
        }
    });
    urlVarsArray.sort();
    //Z.debug(urlVarsArray, 4);
    var pathVarsString = urlVarsArray.join('/');
    
    var url = basePath + pathVarsString;
    
    return url;
};

//addvars is an object mapping keys and values to add
//removevars is an array of var keys to remove
Zotero.nav.mutateUrl = function(addvars, removevars){
    //Z.debug("Zotero.nav.mutateUrl", 3);
    if(!addvars){
        addvars = {};
    }
    if(!removevars){
        removevars = [];
    }
    
    var urlvars = J.extend({}, Zotero.nav.urlvars.pathVars);
    J.each(addvars, function(key, val){
        urlvars[key] = val;
    });
    J.each(removevars, function(index, val){
        delete urlvars[val];
    });
    
    var url = Zotero.nav.buildUrl(urlvars, false);
    //Z.debug("mutated Url:" + url, 3);
    
    return url;
};

Zotero.nav.pushState = function(force, state){
    Z.debug('Zotero.nav.pushState', 3);
    var History = window.History;
    
    Zotero.ui.saveFormData();
    var curState = History.getState();
    curState = curState['data'];
    
    //selectively add state to hint where to go
    var s = {};
    if(state){
        s = state;
    }
    /*else{
        s = curState;
    }*/

    urlvars = Zotero.nav.urlvars.pathVars;
    
    //Z.debug(urlvars, 4);
    var url = Zotero.nav.buildUrl(urlvars, false);
    //push the state onto our page stack so we know something changed even if the url didn't
    /*
    if(Zotero.config.mobile){
        var activePageID = J.mobile.activePage.attr('id');
        if(typeof activePageID == 'undefined'){
            activePageID = null;
        }
        Zotero.nav.updateStatePageID(activePageID);
        s['_zprevPageID'] = activePageID;
    }
    Z.debug("2");
    Zotero.state.ignoreStatechange = false;
    */
    //actually push state and manually call urlChangeCallback if specified
    if(Zotero.nav.replacePush === true){
        Zotero.nav.replacePush = false;
        Zotero.nav.ignoreStateChange();
        History.replaceState(s, Zotero.config.startPageTitle, url);
    }
    else{
        History.pushState(s, Zotero.config.startPageTitle, url);
    }

    if(force){
        Zotero.nav.urlChangeCallback({type:'popstate', originalEvent:{state:urlvars}} );
    }

    document.title = Zotero.config.startPageTitle;
    Zotero.debug("leaving pushstate", 3);
};

Zotero.nav.replaceState = function(force, state){
    Z.debug("Zotero.nav.replaceState", 3);
    Zotero.ui.saveFormData();
    
    if(typeof force == 'undefined'){
        force = false;
    }
    
    //selectively add state to hint where to go
    var s = null;
    if(state){
        s = state;
    }
    
    urlvars = Zotero.nav.urlvars.pathVars;
    
    //Z.debug(urlvars, 4);
    var url = Zotero.nav.buildUrl(urlvars, false);
    //Z.debug('new url: ' + url);
    
    //ignore the statechange event History.js will fire even though we're replacing, unless forced
    Zotero.state.ignoreStatechange = true;
    Zotero.nav.ignoreStateChange();
    History.replaceState(s, null, url);
};

Zotero.nav.updateStateTitle = function(title){
    Zotero.debug("Zotero.nav.updateStateTitle", 3);
    /*
    var curState = History.getState();
    if(curState.title != title){
        Zotero.nav.ignoreStateChange();
        History.replaceState(curState.data, title, curState.url);
    }
    */
    document.title = title;
};

Zotero.nav.updateStatePageID = function(pageID){
    Z.debug("Zotero.nav.updateStatePageID " + pageID, 3);
    var curState = History.getState();
    var state = curState.data;
    if(pageID === null || pageID === undefined){
        pageID = '';
    }
    state['_zpageID'] = pageID;
    //Zotero.state.ignoreStatechange = true;
    //Zotero.nav.ignoreStateChange();
    History.replaceState(state, curState.title, curState.url);
    Zotero.state.ignoreStatechange = false;
};

Zotero.nav.getUrlVar = function(key){
    if(Zotero.nav.urlvars.pathVars.hasOwnProperty(key) && (Zotero.nav.urlvars.pathVars[key] !== '')){
        return Zotero.nav.urlvars.pathVars[key];
    }
    else if(Zotero.nav.urlvars.f.hasOwnProperty(key)){
        return Zotero.nav.urlvars.f[key];
    }
    else if(Zotero.nav.urlvars.q.hasOwnProperty(key)){
        return Zotero.nav.urlvars.q[key];
    }
    return undefined;
};

Zotero.nav.setUrlVar = function(key, val){
    Zotero.nav.urlvars.pathVars[key] = val;
};

Zotero.nav.getUrlVars = function(){
    var params = J.deparam(J.param.querystring());
    return J.extend(true,{}, Zotero.nav.urlvars.pathVars, params, J.deparam(J.param.fragment()));
};

Zotero.nav.setFragmentVar = function(key, val){
    Zotero.nav.urlvars.f[key] = val;
};

Zotero.nav.setQueryVar = function(key, val){
    if(val === ''){
        delete Zotero.nav.urlvars.q[key];
    }
    else{
        Zotero.nav.urlvars.q[key] = val;
    }
};

Zotero.nav.addQueryVar = function(key, val){
    if(Zotero.nav.urlvars.q.hasOwnProperty(key)){
        //property exists
        if(J.isArray(Zotero.nav.urlvars.q[key])){
            Zotero.nav.urlvars.q[key].push(val);
        }
        else{
            var newArray = [Zotero.nav.urlvars.q[key], val];
            Zotero.nav.urlvars.q[key] = newArray;
        }
    }
    else{
        //no value for that key yet
        Zotero.nav.urlvars.q[key] = val;
    }
    return Zotero.nav.urlvars.q[key];
};

Zotero.nav.updateFragment = function(updatedVars){
    Z.debug("updateFragment", 3);
    J.bbq.pushState(updatedVars, 0);
};

Zotero.nav.urlChangeCallback = function(event, state){
    //Zotero.enableLogging();
    Z.debug("////////////////////urlChangeCallback//////////////////", 3);
    /*if(History.getState().cleanUrl == Zotero.nav.currentHref){
        if(Zotero.nav.forceReload){
            Z.debug("current href matches new href, but forcing reload anyway", 3);
            Zotero.nav.forceReload = false;
        }
        else{
            Z.debug("current href matches new href, returning without processing urlchange", 3);
            return false;
        }
    }
    else{
        */
        Z.debug("new href, updating href and processing urlchange", 3);
        Zotero.nav.currentHref = History.getState().cleanUrl;
        var curStateVars = History.getState().data;
        //Z.debug(Zotero.nav.currentHref);
        //Z.debug(curStateVars);
    /*
    }
    */
    //process special cases in history state
    if(Zotero.config.mobile){
        
    }
    
    //reparse url to set vars in Z.ajax
    Zotero.nav.parseUrlVars();
    
    //process each dynamic element on the page
    J(".ajaxload").each(function(index, el){
//        try{
            Z.debug("ajaxload element found", 3);
            Z.debug(J(el).attr('data-function'), 3);
            //Z.debug(el);
            //call preload function if set
            var prefunctionName = J(el).data('prefunction');
            if(prefunctionName){
                Zotero.callbacks[prefunctionName](el);
            }
            //if still loading then set queued and wait for it to finish before starting again
            if(J(el).data('loading')){
                J(el).data('queuedWaiting', true);
            }
            else{
                Zotero.nav.callbackAssignedFunction(el);
            }
/*        }
        catch(e){
            Z.debug("Couldn't call ajaxload specified function", 1);
            Z.debug(e, 1);
        }
*/
    });

    //set ignoreStateChange to 0 in case we missed a decrement somewhere
    //Zotero.nav.ignoreStateChange = 0;
    Z.debug("<<<<<<<<<<<<<<<<<<<<<<<<urlChangeCallback Done>>>>>>>>>>>>>>>>>>>>>", 3);
};

Zotero.nav.urlAlwaysCallback = function(el){
    Z.debug("_____________urlAlwaysCallback________________", 3);
    
    //reparse url to set vars in Z.ajax
    Zotero.nav.parseUrlVars();
    
    //process each dynamic element on the page
    J(".ajaxload.always").each(function(index, el){
        try{
            Z.debug("ajaxload element found", 3);
            Z.debug(J(el).attr('data-function'), 3);
            //Z.debug(el);
            //call preload function if set
            var prefunctionName = J(el).data('prefunction');
            if(prefunctionName){
                Zotero.callbacks[prefunctionName](el);
            }
            //if still loading then set queued and wait for it to finish before starting again
            if(J(el).data('loading')){
                J(el).data('queuedWaiting', true);
            }
            else{
                Zotero.nav.callbackAssignedFunction(el);
            }
        }
        catch(e){
            Z.debug("Couldn't call ajaxload specified function", 1);
            Z.debug(e, 1);
        }
    });
};

Zotero.nav.callbackAssignedFunction = function(el){
    var functionName = J(el).data('function');
    if(functionName){
        Zotero.callbacks[functionName](el);
    }
};

Zotero.nav.flagLoading = function(el){
    J(el).data('loading', true);
};

Zotero.nav.doneLoading = function(el){
    Z.debug("Zotero.nav.doneLoading", 3);
    J(el).data('loading', false);
    if(J(el).data('queuedWaiting')){
        J(el).data('queuedWaiting', false);
        Zotero.nav.callbackAssignedFunction(el);
    }
};

Zotero.nav._ignoreTimer = null;

Zotero.nav.ignoreStateChange = function(){
    Z.debug("Zotero.nav.ignoreStateChange", 3);
    if(Zotero.nav._ignoreTimer){
        window.clearTimeout(Zotero.nav._ignoreTimer);
    }
    
    Zotero.nav._ignoreStateChange++;
    Z.debug(Zotero.nav._ignoreStateChange, 4);
    //zero semaphore automatically after .5 seconds
    Zotero.nav._ignoreTimer = window.setTimeout(function(){
        Z.debug("clear ignoreState semaphore", 3);
        Zotero.nav._ignoreStateChange = 0;
    }, 500);

    return;
};

Zotero.nav.proxyWrapper = function(requestUrl, method){
    if(Zotero.config.proxy){
        if(!method){
            method = 'GET';
        }
        return "/proxyrequest?requestMethod=" + method + "&requestUrl=" + encodeURIComponent(requestUrl);
    }
    else{
        return requestUrl;
    }
};

//set error handler
J("#js-message").ajaxError(Zotero.nav.error);


/**
 * JS code for Zotero's website
 *
 * LICENSE: This source file is subject to the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3 of the License,
 * or (at your option) any later version.
 *
 * @category  Zotero_WWW
 * @package   Zotero_WWW_Index
 * @copyright Copyright (c) 2008  Center for History and New Media (http://chnm.gmu.edu)
 * @license   http://www.gnu.org/licenses/agpl.html    GNU AGPL License
 * @version   $Id$
 * @since     0.0
 */

/**
 * Zotero.Pages class containing page specific functions for the website. Loaded based on
 * the value of zoterojsClass
 *
 * @copyright  Copyright (c) 2008  Center for History and New Media (http://chnm.gmu.edu)
 * @license    http://www.gnu.org/licenses/agpl.html    GNU AGPL License
 * @since      Class available since Release 0.6.1
 */
Zotero.pages = {

    baseURL:    baseURL,
    staticPath: staticPath,
    baseDomain: baseDomain,
    staticLoadUrl: window.location.pathname,
    
    //base zotero js functions that will be used on every page
    base: {

        init: function(){
            if((typeof Zotero != 'undefined' && !Zotero.config.librarySettings.mobile) || typeof Zotero == 'undefined'){
                this.tagline();
                this.setupSearch();
                this.setupNav();
                J("#sitenav .toggle").click(this.navMenu);
            }
            
            //set up support page expandos
            J(".support-menu-expand-section").hide();
            J(".support-menu-section h2").live('click', function(){
                J(this).siblings('.support-menu-expand-section').slideToggle();
            });
            
        },
        
        /**
         * Selects a random tagline for the header
         *
         * @return void
         **/
        tagline: function(){
            var taglines = [
                'See it. Save it. Sort it. Search it. Cite it.',
                'Leveraging the long tail of scholarship.',
                'A personal research assistant. Inside your browser.',
                'Goodbye 3x5 cards, hello Zotero.',
                'Citation management is only the beginning.',
                'The next-generation research tool.',
                'Research, not re-search',
                'The web now has a wrangler.'
            ];
            var pos = Math.floor(Math.random() * taglines.length);
            J("#tagline").text(taglines[pos]);
        },

        /**
         * Send search to the right place
         *
         * @return void
         **/
        setupSearch: function() {
            //Z.debug("setupSearch");
            var context = "support";
            var label   = "";
            
            // Look for a context specific search
            if(undefined !== window.zoterojsSearchContext){
                context = zoterojsSearchContext;
            }
            switch (context) {
                case "people"        : label = "Search for people";    break;
                case "group"         : label = "Search for groups";    break;
                case "documentation" : label = "Search documentation"; break;
                case "library"       : label = "Search Library";       break;
                case "grouplibrary"  : label = "Search Library";       break;
                case "support"       : label = "Search support";       break;
                case "forums"        : label = "Search forums";        break;
                default              : label = "Search support";       break;
            }
            
            J("#header-search-query").val("");
            J("#header-search-query").attr('placeholder', label);//.inputLabel(label, {color:"#aaa"});
            if(context != 'library' && context != 'grouplibrary' && context != 'forums'){
                J("#simple-search").live('submit', function(e){
                    e.preventDefault();
                    var searchUrl = Zotero.pages.baseDomain + "/search/#type/" + context;
                    var query     = J("#header-search-query").val();
                    if(query !== "" && query != label){
                        searchUrl = searchUrl + "/q/" + encodeURIComponent(query);
                    }
                    location.href = searchUrl;
                    return false;
                });
            }
            else if(context != 'forums') {
                J("#simple-search").live('submit', function(e){
                    e.preventDefault();
                    Zotero.nav.clearUrlVars(['collectionKey', 'tag', 'q']);
                    var query     = J("#header-search-query").val();
                    if(query !== "" || Zotero.nav.getUrlVar('q') ){
                        Zotero.nav.urlvars.pathVars['q'] = query;
                        Zotero.nav.pushState();
                    }
                    return false;
                });
            }
        },
        
        /**
         * Select the right nav tab
         *
         * @return void
         **/
        setupNav: function () {
            var tab = "";
            // Look for a context specific search
            if(undefined !== window.zoterojsSearchContext){
                tab = zoterojsSearchContext;
                if(tab == "support") { tab = ""; }
                
            }
            // special case for being on the home page
            if(location.pathname == "/" && location.href.search("forums.") < 0){
                tab = "home";
            }
            J("#"+tab+"-tab").addClass("selected-nav");
        }
    },
    
    extension_style: {
        init: function(){
            var url = Zotero.pages.baseURL + "/extension/autocomplete/";
            J("#styleSearch").autocomplete({
                'url': url,
                'matchContains':true,
                'mustMatch': true,
                'cacheLength': 1,
                extraParams:{"type":"style"},
                formatItem: function(resultRow, i, total, value) {
                    return resultRow[0];
                }
            });
            J("#styleSearch").autocomplete("result", function(event, data, formatted){
                location.href = Zotero.pages.baseURL + "/extension/style/" + data[1];
            });
        }
    },
    
    settings_cv: {
        init: function(){
            J(".cv-section-actions").buttonset();
            J(".cv-move-up").button('option', 'icons', {primary:'ui-icon-circle-arrow-n'}).button('option', 'text', false);
            J(".cv-move-down").button('option', 'icons', {primary:'ui-icon-circle-arrow-s'}).button('option', 'text', false);
            J(".cv-delete").button('option', 'icons', {primary:'sprite-trash'}).button('option', 'text', false);
            
            // Delete the cv section when the delete link is clicked
            J("#cv-sections .cv-delete").live("click", function(e){
                if(confirm ("Are you sure you want to delete this section")){
                    J(this).closest("li").remove();
                    //Zotero.pages.settings_cv.hideMoveLinks();
                    return false;
                }
            });
            
            // Add a new cv section when the add button is clicked
            J("#cv-sections .cv-insert-section").live("click", function(e){
                // Make sure the template textarea isn't a tiny mce instance
                //tinyMCE.execCommand('mceRemoveControl', true, "template");
                
                // Get the number of sections that exist before adding a new one
                sectionCount  = J("#cv-sections li").length;
                
                // Clone the template html
                newSection    = J("#cv-section-template li").clone(true);
                
                // The new textarea needs a unique id for tinymce to work
                newTextareaID = "cv_" + (sectionCount + 1) + "_text";
                newSection.children("textarea").attr("id", newTextareaID).addClass('tinymce').addClass('nolinks');
                
                // Insert the new section into the dom and activate tinymce control
                J(this).closest("li").after(newSection);
                
                J(".cv-section-actions").buttonset();
                J(".cv-move-up").button('option', 'icons', {primary:'ui-icon-circle-arrow-n'}).button('option', 'text', false);
                J(".cv-move-down").button('option', 'icons', {primary:'ui-icon-circle-arrow-s'}).button('option', 'text', false);
                J(".cv-delete").button('option', 'icons', {primary:'sprite-trash'}).button('option', 'text', false);
                
                tinyMCE.execCommand('mceAddControl', true, newTextareaID);
                
                //Zotero.pages.settings_cv.hideMoveLinks();
                return false;
            });
            
            // Add a new cv collection when the add button is clicked
            J("#cv-sections .cv-insert-collection").live("click", function(e){
                // Get the number of sections that exist before adding a new one
                sectionCount  = J("#cv-sections li").length;
                
                // Clone the template html
                newSection    = J("#cv-collection-template li").clone(true);
                
                // The new textarea needs a unique id for tinymce to work
                newcollectionKey = "cv_" + (sectionCount + 1) + "_collection";
                newHeadingID    = "cv_" + (sectionCount + 1) + "_heading";
                newSection.children("select").attr("id", newcollectionKey);
                newSection.children("select").attr("name", newcollectionKey);
                newSection.children(".cv-heading").attr("name", newHeadingID);
                
                // Insert the new section into the dom
                J(this).closest("li").after(newSection);
                
                J(".cv-section-actions").buttonset();
                J(".cv-move-up").button('option', 'icons', {primary:'ui-icon-circle-arrow-n'}).button('option', 'text', false);
                J(".cv-move-down").button('option', 'icons', {primary:'ui-icon-circle-arrow-s'}).button('option', 'text', false);
                J(".cv-delete").button('option', 'icons', {primary:'sprite-trash'}).button('option', 'text', false);
                
                //Zotero.pages.settings_cv.hideMoveLinks();
                return false;
            });
            
            // Move the section down when the down link is clicked
            J("#cv-sections .cv-move-down").live("click", function(e){
                if(J(this).closest('li').find("textarea").length > 0){
                    // Get the id of this section's textarea so we can disable the tinymce control before the move
                    textareaId = J(this).closest('li').find("textarea")[0].id;
                    Z.debug('textareaId:' + textareaId);
                    var editor = tinymce.get(textareaId);
                    editor.save();
                    tinymce.execCommand('mceRemoveControl', true, textareaId);
                    // Move the section and reenable the tinymce control
                    J(this).closest("li").next().after(J(this).closest("li"));
                    tinymce.execCommand('mceAddControl', true, textareaId);
                }
                else {
                    J(this).closest("li").next().after(J(this).closest("li"));
                }

                //Zotero.pages.settings_cv.hideMoveLinks();
                return false;
            });
            
            // Move the section up when the up link is clicked
            J("#cv-sections .cv-move-up").live("click", function(e){
                if(J(this).closest('li').find("textarea").length > 0){
                    // Get the id of this section's textarea so we can disable the tinymce control before the move
                    textareaId = J(this).closest('li').find("textarea")[0].id;
                    Z.debug('textareaId:' + textareaId);
                    var editor = tinymce.get(textareaId);
                    editor.save();
                    
                    tinymce.execCommand('mceRemoveControl', true, textareaId);
                    
                    // Move the section and reenable the tinymce control
                    J(this).closest("li").prev().before(J(this).closest("li"));
                    tinymce.execCommand('mceAddControl', true, textareaId);
                }
                else {
                    J(this).closest("li").prev().before(J(this).closest("li"));
                }
                //Zotero.pages.settings_cv.hideMoveLinks();
                return false;
            });
            
            // reindex the field names before submitting the form
            J("#cv-submit").click(function(e){
                J("#cv-sections li").each(function(i){
                    var heading;
                    if(J(this).attr("class") == "cv-freetext"){
                        heading = J(this).children(".cv-heading").attr("name", "cv_"+(i+1)+"_heading");
                        if(heading.val() == "Enter a section name"){
                            heading.val("");
                        }
                        J(this).children(".cv-text").attr("name", "cv_"+(i+1)+"_text");
                    }
                    else if(J(this).attr("class") == "cv-collection"){
                        heading = J(this).children(".cv-heading").attr("name", "cv_"+(i+1)+"_heading");
                        if(heading.val() == "Enter a section name"){
                            heading.val("");
                        }
                        J(this).children("select.cv-collection").attr("name", "cv_"+(i+1)+"_collection");
                    }
                });
            });
            
            // Hide unusable move links
            //this.hideMoveLinks();
            
            //init existing tinymce on first load
            Zotero.ui.init.tinyMce('nolinks');
            
            // Add some helper text over the section name
            J("li input").inputLabel("Enter a section name", {color:"#d5d5d5"});
        }
        
        // Hides move links that can't be used. e.g. you can't move the top section up.
        /*
        hideMoveLinks: function(){
            J("#cv-sections .cv-move-down").show();
            J("#cv-sections .cv-move-up").show();
            J("#cv-sections .cv-move-up:first").hide();
            J("#cv-sections .cv-move-down:last").hide();
        },
        */
    },
    
    settings_account: {
        init: function(){
            //insert slug preview label
            J('input#username').after("<label id='slugpreview'>Profile URL: " +
                                      Zotero.pages.baseDomain + "/" +
                                      Zotero.utils.slugify(J("input#username").val()) +
                                      "</label>");
    
            // When the value of the input box changes,
            J("input#username").bind("keyup change", Zotero.pages.user_register.nameChange);
            parent.checkUserSlugTimeout;
        },
        
        nameChange: function(){
            //make sure label is black after each change before checking with server
            J("#slugpreview").css("color", "black");
            
            //create slug from username
            parent.slug = Zotero.utils.slugify( J("input#username").val() );
            J("#slugpreview").text( "Profile URL: " + Zotero.pages.baseDomain + "/" + parent.slug );
            
            //check slug with server after half-second
            clearTimeout(parent.checkUserSlugTimeout);
            parent.checkUserSlugTimeout = setTimeout('Zotero.pages.user_register.checkSlug()', 500);
        },
        
        checkSlug: function(){
            J.getJSON(baseURL + "/user/checkslug", {"slug":slug}, function(data){
                if(data.valid){
                    J("#slugpreview").css("color", "green");
                } else {
                    J("#slugpreview").css("color", "red");
                }
            });
        }
    },
    
    settings_profile: {
        init: function(){
            Zotero.ui.init.tinyMce('nolinks');
        }
    },
    
    settings_privacy: {
        init: function(){
            if(!J("input#privacy_publishLibrary").attr("checked")){
                J("input#privacy_publishNotes").attr("disabled","disabled");
            }
            J("input#privacy_publishLibrary").bind("change", function(){
                if(!J("input#privacy_publishLibrary").attr("checked")){
                    J("input#privacy_publishNotes").removeAttr("checked").attr("disabled","disabled");
                }
                else{
                    J("input#privacy_publishNotes").removeAttr("disabled");
                }
            });
        }
        
    },
    
    settings_apikeys: {
        init: function(){
            
        }
    },
    
    settings_newkey: {
        init: function(){
            if(!J("input#library_access").prop("checked")){
                J("input#notes_access").prop("disabled","disabled");
            }
            J("input#library_access").bind("change", function(){
                if(!J("input#library_access").prop("checked")){
                    J("input#notes_access").prop("checked", false).prop("disabled", true);
                    J("input#write_access").prop('checked', false).prop('disabled', true);
                }
                else{
                    J("input#notes_access").prop("disabled", false);
                    J("input#write_access").prop('disabled', false);
                }
            });
            J("input#name").focus();
            
            if(zoteroData.oauthRequest){
                J("button#edit").closest('li').nextAll().hide();
                J("button#edit").click(function(e){
                    e.preventDefault();
                    J(this).closest('li').nextAll().show();
                });
            }
            
            if(!J('#individual_groups').prop('checked')) {
                J("#individual_groups").closest('li').nextAll().hide();
            }
            J("#individual_groups").bind('change', function(){
                if(J('#individual_groups').prop('checked')){
                    J("#individual_groups").closest('li').nextAll().show();
                }
                else{
                    J("#individual_groups").closest('li').nextAll().hide();
                }
            });
        }
    },
    
    settings_editkey: {
        init: function(){
            if(!J('#individual_groups').prop('checked')) {
                J("#individual_groups").closest('li').nextAll().hide();
            }
            J("#individual_groups").bind('change', function(){
                if(J('#individual_groups').prop('checked')){
                    J("#individual_groups").closest('li').nextAll().show();
                }
                else{
                    J("#individual_groups").closest('li').nextAll().hide();
                }
            });
        }
    },
    
    settings_storage: {
        init: function(){
            selectedLevel = J("input[name=storageLevel]:checked").val();
            
            Zotero.pages.settings_storage.showSelectedResults(selectedLevel);
            
            J("input[name=storageLevel]").change(function(){
                Zotero.pages.settings_storage.showSelectedResults(J("input[name=storageLevel]:checked").val());
            });
            
            J("#purge-button").click(function(){
                if(confirm("You are about to remove all uploaded files associated with your personal library.")){
                    J("#confirm_delete").val('confirmed');
                    return true;
                }
                else{
                    return false;
                }
            });
        },
        
        showSelectedResults: function(selectedLevel){
            if(selectedLevel == 2){
                J("#order-result-div").html(zoteroData.orderResult2);
            }
            else if(selectedLevel == 3){
                J("#order-result-div").html(zoteroData.orderResult3);
            }
            else if(selectedLevel == 4){
                J("#order-result-div").html(zoteroData.orderResult4);
            }
            else if(selectedLevel == 5){
                J("#order-result-div").html(zoteroData.orderResult5);
            }
        }
    },
    
    settings_commons: {
        init: function(){
        }
    },
    
    settings_deleteaccount: {
        init: function(){
            J("button#deleteaccount").click(function(){
                if(!confirm("Are you sure you want to permanently delete you account? You will not be able to recover the account or the user name.")){
                    return false;
                }
            });
        }
    },
    
    group_new: {
        init: function(){
            var timeout;
            // When the value of the input box changes,
            J("input#name").keyup(function(e){
                clearTimeout(timeout);
                timeout = setTimeout('Zotero.pages.group_new.nameChange()', 300);
            });
            
            J("input[name=group_type]").change(Zotero.pages.group_new.nameChange);
            
            //insert slug preview label
            J('input#name').after("<label id='slugpreview'>Group URL: " +
                                      Zotero.pages.baseDomain + "/" + "groups/" +
                                      Zotero.utils.slugify(J("input#name").val()) +
                                      "</label>");
            
        },
        
        nameChange: function(){
            //make sure label is black after each change before checking with server
            J("#slugpreview").css("color", "black");
            var groupType = J('input[name=group_type]:checked').val();
            // update slug preview text
            if(groupType == 'Private'){
                J("#slugpreview").text("Group URL: " +Zotero.pages.baseDomain + "/" + "groups/<number>");
            }
            else{
                J("#slugpreview").text("Group URL: " +Zotero.pages.baseDomain + "/" + "groups/" +
                Zotero.utils.slugify(J("input#name").val()) );
            }
            
            if(groupType != 'Private'){
                // Get the value of the name input
                var input = J("input#name").val();
                // Poll the server with the input value
                J.getJSON(baseURL+"/group/checkname/", {"input":input}, function(data){
                    J("#namePreview span").text(data.slug);
                    if(data.valid){
                        J("#slugpreview").css({"color":"green"});
                    } else {
                        J("#slugpreview").css({"color":"red"});
                    }
                    J("#namePreview img").remove();
                });
            }
        }
    },
    
    group_settings: {
        init: function(){
            Zotero.ui.init.tinyMce('nolinks');
            
            //tinyMCE.execCommand('mceAddControl', true, "description");
            //J("#settings_submit").bind("click", function(){ tinyMCE.execCommand('mceRemoveControl', true, 'description');});
            J("#deleteForm").submit(function(){
                if(confirm("This will permanently delete this group, including any items in the group library")){
                    J("#confirm_delete").val('confirmed');
                    return true;
                }
                else{
                    return false;
                }
            });
            J("#type-PublicOpen").click(function(){
                if(confirm("Changing a group to Public Open will remove all files from Zotero Storage")){
                    return true;
                }
                else{
                    return false;
                }
            });
        }
    },
    
    group_library_settings: {
        init: function(){
            //initially disable inputs with disallowed values for current group type
            if(J("#type-PublicOpen").prop('checked')){
                //disallow file storage options for public open groups
                J("#fileEditing-admins").prop('disabled', '1');
                J("#fileEditing-members").prop('disabled', '1');
            }
            if(J("#type-Private").prop('checked')){
                //disallow internet readable on private
                J("#libraryReading-all").prop('disabled', '1');
            }
            
            //confirmation on changing group type to public open
            J("#type-PublicOpen").click(function(){
                if(confirm("Changing a group to Public Open will remove all files from Zotero Storage")){
                    //disallow files
                    J("input[name='fileEditing']").val(['none']);
                    J("#fileEditing-admins").prop('disabled', '1');
                    J("#fileEditing-members").prop('disabled', '1');
                    //allow public library
                    J("#libraryReading-all").prop('disabled', '');
                    
                    return true;
                }
                else{
                    return false;
                }
            });
            
            J("#type-Private").click(function(){
                //select members only viewing of private group which is mandatory
                J("input[name='libraryReading']").val(['members']);
                //disable public library radio for private group
                J("#libraryReading-all").prop('disabled', '1');
                //allow files
                J("#fileEditing-admins").prop('disabled', '');
                J("#fileEditing-members").prop('disabled', '');
            });
            
            J("#type-PublicClosed").click(function(){
                //allow files
                J("#fileEditing-admins").prop('disabled', '');
                J("#fileEditing-members").prop('disabled', '');
                //allow public library
                J("#libraryReading-all").prop('disabled', '');
                
            });
        }
    },
    
    group_view: {
        init: function(){
            if(zoteroData.member == false){
                J("#membership-button").click(Zotero.pages.group_view.joinGroup);
            }
            else{
                J("#membership-button").click(Zotero.pages.group_view.leaveGroup);
            }
            
            J("#group-message-form").hide();
            J("#new-message-link").click(function(){
                J("#group-message-form").toggle();
                return false;
            });
            J(".delete-group-message-link").click(function(){
                if(confirm("Really delete message?")){
                    return true;
                }
                else{
                    return false;
                }
            });
            Zotero.ui.init.tinyMce('nolinks');
        },
        
        joinGroup: function(){
            J("#membership-button").after("<img id='spinner' src='/static/images/theme/ajax-spinner.gif'/>");
            J('img#spinner').show();
            J.post("/groups/" + zoteroData.groupID + "/join", {ajax:true}, function(data){
                if(data.pending === true){
                    J("#membership-button").replaceWith("Membership Pending");
                    J('img#spinner').remove();
                }
                else if(data.success === true){
                    J("#membership-button").val("Leave Group")
                                           .unbind()
                                           .remove()
                                           .click(Zotero.pages.group_view.leaveGroup)
                                           .wrap(document.createElement("li"))
                                           .appendTo('ul.group-information');
                    
                    if(zoteroData.group.type == 'Private'){
                        window.location = '/groups';
                    }
                    J('img#spinner').remove();
                }
                else{
                    J('img#spinner').remove();
                }
            },
            "json");
        },
        
        leaveGroup: function(){
            if(confirm("Leave group?")){
                J("#membership-button").after("<img id='spinner' src='/static/images/theme/ajax-spinner.gif'/>");
                J('img#spinner').show();
                J.post("/groups/" + zoteroData.groupID + "/leave", {ajax:true}, function(data){
                    if(data.success === true){
                        J("#membership-button").val("Join Group").unbind().click(Zotero.pages.group_view.joinGroup);
                        J('img#spinner').remove();
                        J('a[title="'+zoteroData.user.username+'"]').remove();
                        window.location = "/groups";
                    }
                    else{
                        J('img#spinner').remove();
                    }
                },
                "json");
            }
        },
        
    },
    
    group_index: {
        init: function(){
            //set up screen cast player + box
            J("#screencast-link").click(function(){
                J('#content').prepend("<div id='dimmer'><div id='intro-screencast-lightbox-div'><a href='/static/videos/group_intro.flv' id='intro-screencast-lightbox'></a><a id='close-lightbox-link'>close</a></div></div>");
                Zotero.pages.index_index.player = flowplayer("intro-screencast-lightbox", Zotero.pages.staticPath+"/library/flowplayer/flowplayer-3.1.1.swf",
                    {clip:
                        {autoPlay:true}
                    }
                );
                J('#close-lightbox-link').click(function(){
                    Zotero.pages.index_index.player.close();
                    J('#dimmer').remove();
                    J('#intro-screencast-lightbox-div').remove();
                });
                return false;
            });
            try{
                if(J("#screencast-link").length > 0){
                    flowplayer("screencast-link", Zotero.pages.staticPath+"/library/flowplayer/flowplayer-3.1.1.swf");
                }
            }
            catch (err)
            {
                
            }
        }
        
    },
    
    user_register: {
        init: function(){
            //insert slug preview label
            J('input#username').after("<label id='slugpreview'>Profile URL: " +
                                      Zotero.pages.baseDomain + "/" +
                                      Zotero.utils.slugify(J("input#username").val()) +
                                      "</label>");

            // When the value of the input box changes,
            J("input#username").bind("keyup change", Zotero.pages.user_register.nameChange);
            parent.checkUserSlugTimeout;
        },
        
        nameChange: function(){
            //make sure label is black after each change before checking with server
            J("#slugpreview").css("color", "black");
            
            //create slug from username
            parent.slug = Zotero.utils.slugify( J("input#username").val() );
            J("#slugpreview").text( "Profile URL: " + Zotero.pages.baseDomain + "/" + parent.slug );
            
            //check slug with server after half-second
            clearTimeout(parent.checkUserSlugTimeout);
            parent.checkUserSlugTimeout = setTimeout('Zotero.pages.user_register.checkSlug()', 500);
        },
        
        checkSlug: function(){
            J.getJSON(baseURL + "/user/checkslug", {"slug":slug}, function(data){
                if(data.valid){
                    J("#slugpreview").css("color", "green");
                } else {
                    J("#slugpreview").css("color", "red");
                }
            });
        }
    },
    
    user_home: {
        init: function(){
            //set up buttons on user home page
            J(".home-widget-edit-link").button({
                'text': false,
                'icons': {primary:'sprite-cog'}
            });
            
            J(".home-widget-edit").buttonset();
            J(".widget-move-up").button('option', 'icons', {primary:'ui-icon-circle-arrow-n'}).button('option', 'text', false);
            J(".widget-move-down").button('option', 'icons', {primary:'ui-icon-circle-arrow-s'}).button('option', 'text', false);
            J(".widget-remove").button('option', 'icons', {primary:'sprite-trash'}).button('option', 'text', false);
            
            
            Zotero.pages.user_home.zoteroTips = new Array(
            "<p>To see all the collections an item is in, hold down the “Option” key on Macs or the “Control” key on Windows. This will highlight all collections that contain the selected record.</p>",
            "<p>Press ”+” (plus) on the keyboard within the collections list or items list to expand all nodes and ”-” (minus) to collapse them.</p>",
            "<p>To see how many items you have, click an item in the middle column and Select All (Command-A on OS X or Control-A on Windows). A count of selected items will appear in the right column.</p>",
            "<p>Can't adjust the size of the Zotero pane downwards? The tag selector probably is in the way (it has a minimum height). Close it by dragging the top of the tag selector box to the bottom of your window.</p>",
            "<p>Right-clicking on any metadata text field which might logically use title case allows you to toggle between title and lower cases.</p>",
            "<p>Holding the Shift button while dragging and dropping an item into a text document will insert a citation, rather than the usual full reference.</p>",
            "<p>Zotero supports the standard Firefox shortcut keys for tab/window opening: Ctrl/Cmd-click for a new tab behind, Ctrl/Cmd-Shift-click for a new tab in front, and Shift-click for a new window.</p>",
            "<p>Zotero has a bunch of great keyboard shortcuts. For example, you can open and close the Zotero pane with Ctrl-Alt-Z in Windows, or Cmd-Shift-Z on a Mac.</p>",
            "<p>You can drag and drop PDFs from your desktop to your library and right click on them to have Zotero look up its metadata in Google Scholar.</p>",
            "<p>Let Zotero search inside your PDFs. Just configure your search preferences.</p>",
            "<p>Keep track of recent additions using a saved search. Click Advanced search, select 'Dated Added' > 'is in the last' > X 'days/months' fill in the desired period and save the search. This gives you a dynamic view of new items.</p>",
            "<p>Tag multiple items at once. Select them, make sure the tag selector is visible in the left pane, and drag them onto the tag you want to use. The tag will be applied to all items.</p>",
            "<p>Display a timeline to visualize your bibliography. Select a group of references, a tag, or a collection and click 'Create timeline' from the actions menu.</p>",
            "<p>Click the URL or DOI field name from any item's data column to visit the item online.</p>",
            "<p>Drag any file from your desktop into your Zotero library to attach it to an item.</p>",
            "<p>Adding a series of related references to your library? Start with one item for which you fill in the fields that are the same for all items (e.g. editors, book title, year, publisher, place) and duplicate it (Right-click > Duplicate item). Then fill in the particularities.</p>",
            "<p>Add edited volumes or book chapters as book sections.</p>",
            "<p>Zotero's Word and Open Office plugins make it easy to integrate your Zotero library into your writing process.</p>"
            );
            
            var tipnum = Math.floor(Math.random()*(Zotero.pages.user_home.zoteroTips.length));
            J("#zotero-tip-text").append(Zotero.pages.user_home.zoteroTips[tipnum]);
            J("#next-tip").click(function(){
                tipnum++;
                if(Zotero.pages.user_home.zoteroTips.length <= tipnum){
                    tipnum = 0;
                }
                J("#zotero-tip-text").html(Zotero.pages.user_home.zoteroTips[tipnum]);
                return false;
            });
            
            //Handle extra feed pages
            J(".feed-page").hide();
            J(".feed-div").each(function(){
                J(this).children(".feed-page:first").show();
            });
            J(".feed-page-prev").click(function(){
                J(this).closest(".feed-page").hide().prev(".feed-page").show();
                return false;
            });
            J(".feed-page-next").click(function(){
                J(this).closest(".feed-page").hide().next(".feed-page").show();
                return false;
            });
            
            //handle more/less toggling widget links
            J(".zoteroLibraryWidget").each(function(){J(this).find("tr").slice(4).hide();});
            J(".home-widget-library-toggle-more-link").live("click", function(e){
                e.preventDefault();
                J(this).closest(".zoteroLibraryWidget").find("tr").slice(4).show();
                J(this).replaceWith("<a href='#' class='home-widget-library-toggle-less-link clickable'>Less</a>");
            });
            J(".home-widget-library-toggle-less-link").live("click", function(e){
                e.preventDefault();
                J(this).closest(".zoteroLibraryWidget").find("tr").slice(4).hide();
                J(this).replaceWith("<a href='#' class='home-widget-library-toggle-more-link clickable'>More</a>");
            });
            
            //widget edit link toggling
            J(".home-widget-edit").hide();
            J(".home-widget-edit").hide();
            J(".home-widget-edit-link").click(function(){
                J(this).closest('.home-widget').find(".home-widget-edit").slideToggle();
                return false;
            });
            
            //special case for customize page widgets section
            //init edit links to be hidden
            //J(".home-widget-edit-link").hide();
            J("#customize-homepage-forms").hide();
            //J("#w").children(".home-widget-content").toggle().siblings(".home-widget-title").css('cursor', 'pointer');
            J("#customize-homepage-link").click(function(){
                J("#customize-homepage-forms").slideToggle();
                //J(".home-widget-edit-link").toggle();
                return false;
            });
            
            //functions to modify any widget
            J(".widget-toggle").click(function(){
                J(this).parent().siblings(".home-widget-content").slideToggle();
                return false;
            });
            J(".widget-remove").click(function(){
                var widgetID = J(this).closest(".home-widget").attr("id").substr(1);
                J.post('user/updatewidgets', {'widgetaction':'delete', 'widgetid':widgetID, 'ajax':'1'}, function(data){
                    
                    });
                J(this).closest(".home-widget").remove();
                return false;
            });
            J(".widget-move-up").click(function(){
                var widgetID = J(this).closest(".home-widget").attr("id").substr(1);
                var selected = J(this).closest(".home-widget");
                var prev = selected.prev(".home-widget");
                if(prev && prev.attr("id") != 'w'){
                    J.post('user/updatewidgets', {'widgetaction':'move', 'direction':'up', 'widgetid':widgetID, 'ajax':'1'});
                    selected.insertBefore(prev);
                }
            });
            J(".widget-move-down").click(function(){
                var widgetID = J(this).closest(".home-widget").attr("id").substr(1);
                var selected = J(this).closest(".home-widget");
                var next = selected.next(".home-widget");
                if(next){
                    J.post('user/updatewidgets', {'widgetaction':'move', 'direction':'down', 'widgetid':widgetID, 'ajax':'1'});
                    selected.insertAfter(next);
                }
            });
            
            J("#reset-widgets").click(function(){
                if(confirm("When you reset your homepage it goes back to its original settings and any changes you've made will be lost")){
                    J.post('user/updatewidgets', {'widgetaction':'reset', 'ajax':'1'}, function(){
                        window.location.href = window.location.href;
                    });
                }
            });
            
            //ajax load feeds so frame loads faster even with many/unresponsive feeds
            J(".zoteroFeedWidget").each(function(i, el){
                Zotero.pages.user_home.load_widget_content(this, function(){});
                J(this).children(".widget-title-text").html();
            });
            
            //ajax load involvement so frame loads faster even with many libraries
            J(".zoteroInvolvementWidget").each(function(i, el){
                Zotero.pages.user_home.load_widget_content(this, function(){});
                J(this).children(".widget-title-text").html();
            });
            
            
            //set timer to cycle screencasts until user clicks one
            var screencastLinks = J(".screencast-widget-link");
            Zotero.pages.user_home.screencastCounter = 0;
            Zotero.pages.user_home.stopcycle = false;
            screencastLinks.hide().eq(Zotero.pages.user_home.screencastCounter).show();
            setTimeout(Zotero.pages.user_home.cycleScreencasts, 5000);

            J("#screencast-next-link").click(function(){
                Zotero.pages.user_home.stopcycle = true;
                Zotero.pages.user_home.screencastCounter = (Zotero.pages.user_home.screencastCounter + 1) % screencastLinks.size();
                Z.debug(Zotero.pages.user_home.screencastCounter);
                screencastLinks.hide().eq(Zotero.pages.user_home.screencastCounter).show();
            });
            J("#screencast-prev-link").click(function(){
                Zotero.pages.user_home.stopcycle = true;
                Zotero.pages.user_home.screencastCounter--;
                if(Zotero.pages.user_home.screencastCounter < 0) Zotero.pages.user_home.screencastCounter = screencastLinks.size() - 1;
                Z.debug(Zotero.pages.user_home.screencastCounter);
                screencastLinks.hide().eq(Zotero.pages.user_home.screencastCounter).show();
            });

            //get user library stats for immutable area

        },
        
        load_widget_content: function(widget, callback){
            J(widget).children(".home-widget-content :not(:empty)").html("<img id='spinner' src='/static/images/theme/ajax-spinner.gif'/>");
            //J(widget).children(".home-widget-content").html("<img id='spinner' src='/static/images/theme/ajax-spinner.gif'/>");
            var widgetID = J(widget).attr("id").substr(1);
            var requrl = "/user/widgetcontent";
            J.get(requrl, {widgetid:widgetID}, function(data){
                J(widget).children(".home-widget-content").html(data);
                J(".zoteroLibraryWidget").each(callback);
            });
        },
        
        cycleScreencasts: function(){
            if(Zotero.pages.user_home.stopcycle === false){
                setTimeout(Zotero.pages.user_home.cycleScreencasts, 5000);
            }
            else{
                return false;
            }
            var screencastLinks = J(".screencast-widget-link");
            Zotero.pages.user_home.screencastCounter++;
            Zotero.pages.user_home.screencastCounter = Zotero.pages.user_home.screencastCounter % screencastLinks.size();

            screencastLinks.hide().eq(Zotero.pages.user_home.screencastCounter).show();
        }
    },
    
    user_profile: {
        init: function(){
            J('#invite-button').click(function(){
                var groupID = J("#invite_group").val();
                J.post("/groups/inviteuser", {ajax:true, groupID:groupID, userID:zoteroData.profileUserID}, function(data){
                    if(data == 'true'){
                        J('#invited-user-list').append("<li>" + J("#invite_group > option:selected").html() + "</li>");
                        J('#invite_group > option:selected').remove();
                        if(J('#invite_group > option').length === 0){
                            J('#invite_group').remove();
                            J('#invite-button').remove();
                        }
                    }
                }, "text");
            });
            J('#follow-button').click(Zotero.pages.user_profile.follow);
            J("#tag-cloud").tagcloud({type:'list', height:200, sizemin:8, sizemax:18, colormin:'#99000', colormax:'#99000'});
        },
        
        follow: function(){
            var followText = J('#follow-status-text');
            var followHtml = followText.html();
            followText.html("<img src='/static/images/theme/ajax-spinner.1231947775.gif'/>");
            J.post("/user/follow/" + zoteroData.profileUserID, {ajax:true}, function(data){
                    if(data.status == "following"){
                        J('#follow-button').val("Unfollow");
                        followText.html( followHtml.replace("not following", "following"));
                    }
                    else if(data.status == 'not following'){
                        J('#follow-button').val("Follow");
                        followText.html( followHtml.replace("following", "not following"));
                    }
                }, "json");
        }
    },
    
    group_tag: {
        init: function(){
            J("#tag-type-select").change(function(){
                J(this).parent().submit();
            });
        }
    },
    
    user_item_detail: {
        init: function(){
            
        }
    },
    
    user_item_form_init: function(){
        
    },
    
    user_item_new: {
        init: function(){
            //Zotero.pages.user_item_form_init();
        }
    },
    
    user_item_edit: {
        init: function(){
            //Zotero.pages.user_item_form_init();
        }
    },
    
    user_library: {
        init: function(){
            //Zotero.pages.user_item_form_init();
        }
    },
    
    my_library: {
        init: function(){
            //Zotero.pages.user_item_form_init();
        }
    },
    
    group_item_detail: {
        init: function(){
            
        }
    },
    
    group_library: {
        init: function(){
        }
    },
    
    message_inbox: {
        init: function(){
            var selector = J("#selector");
            
            J("#selector").change(function(){
                Z.debug("selector checkbox changed");
                if(J("#selector").prop('checked') ){
                    J("input[type=checkbox]").prop("checked", true);
                }
                else{
                    J("input[type=checkbox]").prop("checked", false);
                }
            });
            
            J("input[type=checkbox][id!=selector]").change(function(){
                Z.debug("non-selector checkbox changed");
                if(J("input[id!=selector]:checked").length > 0){
                    J("#selector").prop("checked", false);
                }
                else{
                    J("#selector").prop("checked", true);
                }
            });
            
            J.each(zoteroData.messages, function(i, msg){
                if(msg.read == 1){
                    J("#message-row-" + msg.messageID).addClass("read-message");
                }
            });
            
            J("#read-button").click(function(){Zotero.pages.message_inbox.readStatus(true);});
            J("#unread-button").click(function(){Zotero.pages.message_inbox.readStatus(false);});
            J("#delete-button").click(function(){Zotero.pages.message_inbox.deleteMessage();});
            
        },
        
        //set all checked messages to read/unread
        readStatus: function(read){
            var messageIDs = "";
            var rows = J([]);
            J("#message-spinner").show();
            
            if(J("input[type=checkbox][id^=check-]:checked").length === 0){
                return true;
            }
            J("input[type=checkbox][id^=check-]:checked").each(function(){
                messageIDs += this.id.substr(6) + ",";
                if(!rows) rows = J("#message-row-"+this.id.substr(6));
                else rows = rows.add("#message-row-"+this.id.substr(6));
            });
            
            if(read === true){
                J.post("/message/read", {ajax:true, messageIDs:messageIDs }, function(data){
                    if(data.success === true){
                        J("input[type=checkbox]").attr("checked", false);
                        checked = false;
                        rows.addClass("read-message");
                        J("#message-spinner").hide();
                    }
                    else {
                        J("#message-spinner").hide();
                        return false;
                    }
                }, "json");
            }
            else{
                J.post("/message/unread", {ajax:true, messageIDs:messageIDs }, function(data){
                    if(data.success === true){
                        J("input[type=checkbox]").attr("checked", false);
                        checked = false;
                        rows.removeClass("read-message");
                        J("#message-spinner").hide();
                    }
                    else {
                        J("#message-spinner").hide();
                        return false;
                    }
                }, "json");
            }
        },
        
        //delete all checked messages and hide them from the inbox view
        deleteMessage: function(){
            var messageIDs = "";
            var rows = J([]);
            J("#message-spinner").show();
            
            J("input[type=checkbox][id^=check-]:checked").each(function(){
                messageIDs += this.id.substr(6) + ",";
                if(!rows) rows = J("#message-row-"+this.id.substr(6));
                else rows = rows.add("#message-row-"+this.id.substr(6));
            });
            
            J.post("/message/delete", {ajax:true, messageIDs:messageIDs }, function(data){
                if(data.success === true){
                    J("input[type=checkbox]").attr("checked", false);
                    checked = false;
                    rows.hide();
                    J("#message-spinner").hide();
                }
                else {
                    J("#js-message").html("Error deleting messages");
                    J("#message-spinner").hide();
                    return false;
                }
            }, "json");
        }
    },
    
    message_view: {
        init: function(){
            if(zoteroData.read === 0){
                var inboxLink = J('#login-links > a[href="/message/inbox"]');
                inboxLink.html( inboxLink.html().replace(zoteroData.unreadCount, (zoteroData.unreadCount - 1)) );
            }
            
            //delete message
            J("#delete-button").click(function(){
                if(confirm("Delete Message?")){
                    J.post("/message/delete", {ajax:true, messageIDs: zoteroData.messageID }, function(data){
                        if(data.success === true){
                            window.location = "/message/inbox";
                        }
                    }, "json");
                }
            });
        }
    },
    
    message_compose: {
        init: function(){
            J("#contact-list").click(function(){
                J("#messageRecipient").val(J("#contact-list").val().join(", "));
            });
            Zotero.ui.init.tinyMce('nolinks');
        }
    },
    
    group_compose: {
        init: function(){
            //tinyMCE.execCommand('mceAddControl', true, "messageBody");
            //J("#submit").bind("click", function(){ tinyMCE.execCommand('mceRemoveControl', true, 'messageBody');});
            Zotero.ui.init.tinyMce('nolinks');
        }
    },
    
    index_index: {
        /*init: function(){
            flowplayer("intro-screencast", Zotero.pages.staticPath+"/library/flowplayer/flowplayer-3.1.1.swf");
        },
        */
        
        init: function(){
            //set up feature tour tab containers
            var tabContainers = J('div#features-lists > div');
            tabContainers.hide().filter(':first').show();

            J('ul#features-tabs a').click(function () {
                Zotero.pages.index_index.tabClick = true;
                tabContainers.hide();
                tabContainers.filter(this.hash).show();
                J('ul#features-tabs a').removeClass('selected');
                J(this).addClass('selected');
                return false;
            }).filter(':first').click();

            //set timer to cycle tabs until user clicks one
            Zotero.pages.index_index.tabCounter = 0;
            Zotero.pages.index_index.tabClick = false;
            //setTimeout(Zotero.pages.index_index.cycleTab, 5000);

            //set up screen cast player + box
            J("#intro-screencast-small").click(function(){
                J('#content').prepend("<div id='dimmer'><div id='intro-screencast-lightbox-div'><a href='/static/videos/zotero_1_5_cast.flv' id='intro-screencast-lightbox'></a><a id='close-lightbox-link'>close</a></div></div>");
                Zotero.pages.index_index.player = flowplayer("intro-screencast-lightbox", Zotero.pages.staticPath+"/library/flowplayer/flowplayer-3.1.1.swf",
                    {clip:
                        {autoPlay:true}
                    }
                );
                J('#close-lightbox-link').click(function(){
                    Zotero.pages.index_index.player.close();
                    J('#dimmer').remove();
                    J('#intro-screencast-lightbox-div').remove();
                });
                return false;
            });
        },
        
        cycleTab: function(){
            if(Zotero.pages.index_index.tabClick === false){
                setTimeout(Zotero.pages.index_index.cycleTab, 5000);
            }
            else{
                return false;
            }
            Zotero.pages.index_index.tabCounter++;
            Zotero.pages.index_index.tabCounter = Zotero.pages.index_index.tabCounter % 5;
            var tabContainers = J('div#features-lists > div');
            //tabContainers.hide().filter(':first').show();
            tabContainers.hide();
            tabContainers.eq(Zotero.pages.index_index.tabCounter).show();
            J('ul#features-tabs a').removeClass('selected').eq(Zotero.pages.index_index.tabCounter).addClass('selected');

        }
    },
    
    search_index: {
        init: function(){
            Z.debug("search_index init");
            // re-run search when a new tab is clicked
            J("#search-nav li a").click(function(e){
                e.preventDefault();
                Z.debug("search nav link clicked");
                var params  = Zotero.pages.search_index.parseSearchUrl();
                
                var newQueryType = J(this).attr("id").split("-")[1];
                Z.debug(newQueryType);
                
                Zotero.nav.urlvars.pathVars['type'] = newQueryType;
                
                Zotero.nav.pushState();
            });
            
            // set onlick event for submit buttons
            J(".submit-button").click(function(e){
                e.preventDefault();
                Z.debug("search submit button clicked");
                var queryType   = this.id.split("-")[0];
                var queryString = J("#"+queryType+"Query").val();
                if(!queryString || queryString === "") {return false;}
                
                // If this is a support search, see if we need to refine to forums or documentation
                if(queryType == "support"){
                    queryType = J("input[name=supportRefinement]:checked").val();
                }
                
                Zotero.nav.urlvars.pathVars['q'] = queryString;
                Zotero.nav.urlvars.pathVars['type'] = queryType;
                
                Zotero.nav.pushState();
                
                //jQuery.historyLoad(hash);
                return false;
            });

            // Set up the history plugin
            //jQuery.historyInit(Zotero.pages.search_index.pageload);
        },
        
        parseSearchUrl: function(hash){
            Z.debug('parseSearchUrl', 3);
            var params = {"type":"", "query":"", "page":""};
            
            params.type = Zotero.nav.getUrlVar('type') || 'support';
            params.query = Zotero.nav.getUrlVar('q') || '';
            params.page = Zotero.nav.getUrlVar('page') || 1;
            return params;
        },
        
        pageload: function(hash){
            // Clear any results
            Zotero.pages.search_index.clearResults();
            
            // In safari, the hash passed to this function by the history plugin is always whatever the hash was
            // when the page was first loaded. To get around this bug, we just refresh the hash by grabbing it from
            // the location object.
            hash = location.hash;
            
            // Parse the hash or if there is nothing in the hash, just bail now
            if(hash) {
                params = Zotero.pages.search_index.parseHash(hash);
            } else { return; }
			
			// Show the right tab and select the right support refinement if needed
            switch (params.type) {
                case "support":
                case "forums":
                case "documentation":
                    J("#tabs").tabs('select','#support');
                    J("input[name=supportRefinement]").val([params.type]);
                    break;
                default: J("#tabs").tabs('select','#' + params.type);
            }

            //add pubLibOnly param if box is checked
            if((params.type == "people") && (J("#peopleLibraryOnly:checked").length)){
                params.pubLibOnly = 1;
            }

            //add recent param if box checked
            if((params.type == "forums") && (J("#forumsRecent:checked").length)){
                params.recent = true;
            }
            else{
                params.recent = false;
            }
            
            // give focus to the search box
            J("#" + params.type + "Query").focus();
            
			// Load the query into the right search field
			J("#search-form .textinput").val(params.query);
            
            Zotero.pages.search_index.runSearch(params);
        },
        
        runSearch: function(params){
            Z.debug("Zotero.pages.search_index.runSearch", 3);
            Z.debug(params);
            // If it's a request for support results, pass to google search function
            if(!params.type) params.type = 'support';
            if(params.type == "support" || params.type == "forums" || params.type == "documentation"){
                Z.debug("google search");
                Zotero.pages.search_index.fetchGoogleResults(params);
            // otherwise, Make ajax request for results page
            } else if (params.query !== "") {
                Z.debug("non-google search", 3);
                Zotero.ui.showSpinner(J("#search-spinner"));
                J("#search-spinner").show();
                J.post(baseURL + "/searchresults", params, function(response){
                    J("#search-spinner").hide();
                    if(response.error){
                        J("#search-results").html("There was an error searching for groups. Please try again in a few minutes");
                    }
                    else{
                        J("#search-results").html(response.results);
                        J("#search-result-count").html("Found " + response.resultCount + " results");
                        J("#search-pagination").html(response.paginationControl);
                    }
                }, "json");
            }
            Z.debug("done with runSearch");
        },
        
        fetchGoogleResults: function(params){
            Z.debug("Zotero.pages.search_index.fetchGoogleResults", 3);
            Zotero.pages.search_index.clearResults();
            Zotero.ui.showSpinner(J("#search-spinner"));
            J("#search-spinner").show();
            // Create a new WebSearch object
            searcher = new google.search.WebSearch();
            
            // Restrict to the zotero custom search engine and specific refinments if present
            var refinement = null;
            switch (params.type) {
                case "documentation" : refinement = "Documentation"; break;
                case "forums"        : refinement = (params.recent ? "ForumsRecent" : "Forums"); break;
            }
            searcher.setSiteRestriction("008900748681634663180:wtahjnnbugc", refinement);
            
            // Turn off safe search, set result set size, and disable HTML that we won't use
            searcher.setRestriction(google.search.Search.RESTRICT_SAFESEARCH, google.search.Search.SAFESEARCH_OFF);
            searcher.setResultSetSize(google.search.Search.LARGE_RESULTSET);
            searcher.setNoHtmlGeneration();
            
            // Setup a callback to handle the results
            // Callback arguments have to be an array, so make a quick array out of our params object
            paramsArray = [params.type, params.query, params.page];
            searcher.setSearchCompleteCallback(Zotero.pages, Zotero.pages.search_index.displayGoogleResults, paramsArray);
            
            // Execute our query
            searcher.clearResults();
            searcher.execute(params.query);
        },
        
        displayGoogleResults: function(type, query, page){
            Z.debug("Zotero.pages.search_index.displayGoogleResults", 3);
            J("#search-spinner").hide();
            
            // Check if we have any results and displays them if we do
            if (searcher.results && searcher.results.length > 0) {
                Z.debug("have results in searcher, displaying results");
                for (var i in searcher.results) {
                    var r = searcher.results[i];
                    J("#search-results").append("                                                                 \
                        <li class='support-result'>                                                                    \
                          <div class='support-result-title'>                                                           \
                            <a href='"+r.url+"'>"+r.title+"</a>                                                        \
                          </div>                                                                                       \
                          <div class='support-result-content'>"+r.content+"</div>                                      \
                          <div class='support-result-url'>"+r.url.replace("http://", "")+"</div>                       \
                        </li>").show();
                }
                
                // Display the number of results found
                J("#search-result-count").html("Found " + searcher.cursor.estimatedResultCount + " results");
                
                // Add pagination links
                for (var i in searcher.cursor.pages){
                    var p = searcher.cursor.pages[i];
                    // If we're on the current page, output a number
                    if (i == searcher.cursor.currentPageIndex) {
                        J("#search-pagination").append(p.label + " | ");
                    } else {
                        J("#search-pagination").append("<a href='javascript:Zotero.pages.search_index.gotopage("+i+")'>"+p.label+"</a> | ");
                    }
                }
            }
            else{
                Z.debug("no results in searcher");
            }
        },
        
        clearResults: function(){
            J("#search-results").empty();
            J("#search-result-count").empty();
            J("#search-pagination").empty();
            window.scrollBy(0, -500);
        },
        
        gotopage: function(i){
            Zotero.pages.search_index.clearResults();
            searcher.gotoPage(i);
        }
    },
    
    search_items: {
        init: function(){
            try{
                var library = new Zotero.Library();
            }
            catch(e){
                Z.debug("Error initializing library");
            }
            
            J("#item-submit").bind('click submit', J.proxy(function(e){
                Z.debug("item search submitted", 3);
                e.preventDefault();
                e.stopImmediatePropagation();
                var q = J("#itemQuery").val();
                var globalSearchD = library.fetchGlobalItems({q:q});
                globalSearchD.done(function(globalItems){
                    Z.debug("globalItemSearch callback", 3);
                    Z.debug(globalItems);
                    J("#search-result-count").empty().append(globalItems.totalResults);
                    var jel = J("#search-results");
                    jel.empty();
                    J.each(globalItems.objects, function(ind, globalItem){
                        J("#globalitemdetailsTemplate").tmpl({globalItem:globalItem}).appendTo(jel);
                    });
                });
                return false;
            }, this ) );
        }
    },
    
    index_start: {
        init: function() {
            // Fit the iFrame to the window
            Zotero.pages.index_start.sizeIframe();

            // Resize the iframe when the window is resized
            J(window).resize(Zotero.pages.index_start.sizeIframe);
            
            // Change the iframe src
            J(".start-select").click(function(){
                J("iframe").attr("src", J(this).attr("href"));
                return false;
            });
            
            J(".start-show-overlay").click(function(){
                J("#start-overlay").show();
                return false;
            });
            
            J(".start-hide-overlay").click(function(){
                J("#start-overlay").hide();
                return false;
            });
        },
        // Resize the height of the iframe to fill the page
        sizeIframe: function() {
            J("iframe").css("height", J(window).height() - 144);
        }
    },
    
    index_startstandalone: {
        init: function() {
            var browsername = BrowserDetect.browser;
            switch(browsername){
                case 'Chrome':
                    J('#chrome-connector-download-button').closest('li').detach().prependTo('#recommended-download > ul');
                    break;
                case 'Safari':
                    J('#safari-connector-download-button').closest('li').detach().prependTo('#recommended-download > ul');
                    break;
                case 'Firefox':
                    J('#firefox-connector-message').closest('li').detach().prependTo('#recommended-download > ul');
                    break;
                default:
                    J('#connector-download-button').closest('li').detach().prependTo('#recommended-download > ul');
                    J('#other-connectors-p').hide();
            }
            J('#recommended-download > ul').prepend('<li><p>Zotero Connectors allow you to save to Zotero directly from your web browser.</p></li>');
        }
    },
    
    index_download: {
        init: function() {
            var browsername = BrowserDetect.browser;
            var os = BrowserDetect.OS;
            var arch = (navigator.userAgent.indexOf('x86_64') != -1) ? 'x86_64' : 'x86';
            
            if(os == 'Windows'){
                J('#standalone-windows-download-button').closest('li').clone().prependTo('#recommended-client-download > ul');
            }
            else if(os == 'Mac'){
                J('#standalone-mac-download-button').closest('li').clone().prependTo('#recommended-client-download > ul');
            }
            else if(os == 'Linux'){
                if(arch == 'x86_64'){
                    J('#standalone-linux64-download-button').closest('li').clone().prependTo('#recommended-client-download > ul');
                }
                else {
                    J('#standalone-linux32-download-button').closest('li').clone().prependTo('#recommended-client-download > ul');
                }
            }
            else {
                
            }
            
            J("#recommended-connector-download").show();
            switch(browsername){
                case 'Chrome':
                    //J('#chrome-connector-download-button').closest('li').clone().prependTo('#recommended-connector-download > ul');
                    J('#chrome-connector-download-button').addClass('recommended-download').closest('li').detach().prependTo('#recommended-connector-download > ul');
                    break;
                case 'Safari':
                    J('#safari-connector-download-button').addClass('recommended-download').closest('li').detach().prependTo('#recommended-connector-download > ul');
                    break;
                case 'Firefox':
                    J('#firefox-connector-download-button').addClass('recommended-download').closest('li').detach().prependTo('#recommended-connector-download > ul');
                    break;
                default:
                    J('#connector-download-button').closest('li').clone().prependTo('#recommended-connector-download > ul');
                    J('#other-connectors-p').hide();
            }
            J('#recommended-download > ul').prepend('<li><p>Zotero Connectors allow you to save to Zotero directly from your web browser.</p></li>');
        }
    },
    
    index_bookmarklet: {
        init: function(){
            J(".bookmarklet-instructions").hide();
            var section = J("#bookmarklet-tabs li.selected").data('section');
            J("#" + section + '-bookmarklet-div').show();
            
            J("#bookmarklet-tabs li").on('click', function(e){
                Z.debug("bookmarklet tab clicked");
                J("#bookmarklet-tabs li.selected").removeClass('selected');
                J(this).addClass('selected');
                var section = J(this).data('section');
                Z.debug(section);
                J(".bookmarklet-instructions").hide();
                J("#" + section + '-bookmarklet-div').show();
            });
        }
    },
    
    admin_dashboard: {
        init: function(){
            // Set up some helper text and make sure it doesn't get submitted
            var inputLabelText = "Filter log messages by keyword or log ID";
            J("#admin-query").inputLabel(inputLabelText, {color:"#999"});
            J("#admin-query-form").submit(function(){
                // This is covering for what I think is a bug in the inputLabel plugin
                if(J("#admin-query").val() == inputLabelText){
                    J("#admin-query").val("");
                }
            });
            
            // Slide down the message bodies when clicked
            J(".admin-message-title").click(function(){
                J(this).siblings(".admin-message-body").slideToggle(150);
            });
            
            // Put up a confirm when doing special admin stuff
            J("button").click(function(){
                if(!confirm("Are you sure?")){
                    return false;
                }
            });
            
            J("#admin-toggle-link").click(function(){
                J(".admin-message-body").slideToggle(true);
                return false;
            });
        }
    },
    
    admin_userstorage: {
        init: function(){
            J(".userstorage-section").hide();
            if(zoteroData.admin_userstorage_display == "user-storage-info-div"){
                J("#user-storage-info-div").show();
            }
            else if(zoteroData.admin_userstorage_display == "checkout-history-div"){
                J("#checkout-history-div").show();
            }
            J("#user-storage-button").click(function(){
                J(".userstorage-section").hide();
                J("#user-storage-info-div").show();
            });
            J("#checkout-history-button").click(function(){
                J(".userstorage-section").hide();
                J("#checkout-history-div").show();
            });
        }
    },
    
    utils: {
        
    }

}; // end zoterojs


Zotero.callbacks = {};

/**
 * Choose between displaying items list and item details
 * @param  {Dom Element} el ajaxload element
 * @return {undefined}
 */
Zotero.callbacks.chooseItemPane = function(el){
    Z.debug("Zotero.callbacks.chooseItemPane", 3);
    var showPane = 'list';
    var itemList = J("#library-items-div");
    var itemDetail = J("#item-details-div");
    
    //test if itemKey present and load/display item if it is
    var itemKey = Zotero.nav.getUrlVar('itemKey');
    Z.debug("showPane itemKey : " + itemKey, 3);
    
    if(itemKey){
        //Zotero.callbacks.loadItem(J("#item-details-div"), 'user', itemKey);
        showPane = 'detail';
    }
    else if(Zotero.nav.getUrlVar('action') == 'newItem'){
        showPane = 'detail';
    }
    
    if(showPane == 'detail'){
        Z.debug("item pane displaying detail", 3);
        itemList.hide();
        itemDetail.show();
    }
    else if(showPane == 'list'){
        Z.debug("item pane displaying list", 3);
        itemDetail.hide();
        itemList.show();
    }
    
    if(Zotero.config.mobile){
        //only show filter and search bars for list
        if(showPane == 'detail'){
            J("#items-pane-edit-panel-div").hide();
            J("#filter-guide-div").hide();
        }
        else if(showPane == 'list'){
            J("#items-pane-edit-panel-div").show();
            J("#filter-guide-div").show();
        }
    }
};

/**
 * Ajaxload library widget
 * @param  {Dom Element} el Ajaxload element
 * @return {undefined}
 */
Zotero.callbacks.loadLibraryWidget = function(el){
    Z.debug("Zotero.callbacks.loadLibraryWidget", 3);
    var jel = J(el);
    var library = Zotero.ui.getAssociatedLibrary(el);
    
    var effectiveUrlVars = ['itemPage', 'tag', 'collectionKey', 'order', 'sort', 'q'];
    
    var defaultConfig = {target:'items',
                         targetModifier: 'top',
                         itemPage: 1,
                         limit: 25,
                         content: 'json'
                     };
    
    //Build config object that should be displayed next and compare to currently displayed
    var newConfig = J.extend({}, defaultConfig);
    newConfig.start = parseInt(newConfig.limit, 10) * (parseInt(newConfig.itemPage, 10) - 1);
    
    if(!newConfig.sort){
        newConfig.sort = Zotero.config.sortOrdering[newConfig.order];
    }
    
    //don't pass top if we are searching for tags (or query?)
    if(newConfig.tag || newConfig.q){
        delete newConfig.targetModifier;
    }
    
    //clear contents and show spinner while loading
    Zotero.ui.showSpinner(el, 'horizontal');
    
    var d = library.loadItems(newConfig);
    
    d.done(J.proxy(function(loadedItems){
        J(el).empty();
        Zotero.ui.displayItemsWidget(el, newConfig, loadedItems);
        J("<a href='#' class='home-widget-library-toggle-more-link clickable'>More</a>").appendTo(J(el));
        J(el).find("tr").slice(4).hide();
    }, this));
    
    d.fail(J.proxy(function(jqxhr, textStatus, errorThrown){
        var elementMessage = Zotero.ui.ajaxErrorMessage(jqxhr);
        jel.html("<p>" + elementMessage + "</p>");
    }));
    
};

Zotero.callbacks.rejectIfPending = function(el){
    var pendingDeferred = J(el).data('pendingDeferred');
    if(pendingDeferred && pendingDeferred.hasOwnProperty('reject')){
        pendingDeferred.reject();
        J(el).removeData('pendingDeferred');
    }
};

/**
 * Ajaxload items list
 * @param  {Dom Element} el Ajaxload element
 * @return {undefined}
 */
Zotero.callbacks.loadItems = function(el){
    Z.debug("Zotero.callbacks.loadItems", 3);
    Zotero.callbacks.rejectIfPending(el);
    var jel = J(el);
    
    var library = Zotero.ui.getAssociatedLibrary(el);
    
    var effectiveUrlVars = ['itemPage', 'tag', 'collectionKey', 'order', 'sort', 'q'];
    var urlConfigVals = {};
    J.each(effectiveUrlVars, function(index, value){
        var t = Zotero.nav.getUrlVar(value);
        if(t){
            urlConfigVals[value] = t;
        }
    });
    
    var defaultConfig = {target:'items',
                         targetModifier: 'top',
                         itemPage: 1,
                         limit: 25,
                         content: 'json'
                     };
    
    //Build config object that should be displayed next and compare to currently displayed
    var newConfig = J.extend({}, Zotero.config.userDefaultApiArgs, defaultConfig, urlConfigVals);
    newConfig['collectionKey'] = urlConfigVals['collectionKey'];//always override collectionKey, even with absence of collectionKey
    newConfig.start = parseInt(newConfig.limit, 10) * (parseInt(newConfig.itemPage, 10) - 1);
    
    //don't allow ordering by addedBy if user library
    if( (newConfig.order == "addedBy") && (library.libraryType == 'user') ){
        newConfig.order = 'title';
    }
    
    if(!newConfig.sort){
        newConfig.sort = Zotero.config.sortOrdering[newConfig.order];
    }
    
    //don't pass top if we are searching for tags (or query?)
    if(newConfig.tag || newConfig.q){
        delete newConfig.targetModifier;
    }
    
    //clear contents and show spinner while loading
    Zotero.ui.showSpinner(el, 'horizontal');
    
    var d = library.loadItems(newConfig);
    
    d.done(J.proxy(function(loadedItems){
        J(el).empty();
        Zotero.ui.displayItemsFull(el, newConfig, loadedItems);
        //set currentConfig on element when done displaying
        //J(el).data('currentconfig', newConfig);
    }, this));
    
    d.fail(J.proxy(function(jqxhr, textStatus, errorThrown){
        var elementMessage = Zotero.ui.ajaxErrorMessage(jqxhr);
        jel.html("<p>" + elementMessage + "</p>");
    }));
    
    //associate promise with el so we can cancel on later loads
    jel.data('pendingDeferred', d);
};

/**
 * Ajaxload item details
 * @param  {Dom Element} el Ajaxload element
 * @return {undefined}
 */
Zotero.callbacks.loadItem = function(el){
    Z.debug("Zotero.callbacks.loadItem", 3);
    Zotero.callbacks.rejectIfPending(el);
    var jel = J(el);
    var library = Zotero.ui.getAssociatedLibrary(el);
    var d;
    //clear contents and show spinner while loading
    Zotero.ui.showSpinner(el);
    
    //if we're  creating a new item: let user choose itemType if we don't have a value
    //yet, otherwise create a new item and initialize it as an empty item of that type
    //then once we have the template in the item render it as an item edit
    if(Zotero.nav.getUrlVar('action') == 'newItem'){
        var itemType = Zotero.nav.getUrlVar('itemType');
        if(!itemType){
            jel.empty();
            J("#itemtypeselectTemplate").tmpl({itemTypes:Zotero.localizations.typeMap}).appendTo(jel);
            return;
        }
        else{
            var newItem = new Zotero.Item();
            newItem.libraryType = library.libraryType;
            newItem.libraryID = library.libraryID;
            d = newItem.initEmpty(itemType);
            jel.data('pendingDeferred', d);
            d.done(Zotero.ui.loadNewItemTemplate);
            d.fail(function(jqxhr, textStatus, errorThrown){
                Zotero.ui.jsNotificationMessage("Error loading item template", 'error');
            });
            return;
        }
    }
    
    //if it is not a new item handled above we must have an itemKey
    var itemKey = Zotero.nav.getUrlVar('itemKey');
    if(!itemKey){
        return false;
    }
    
    //get the item out of the library for display
    var item = library.items.getItem(itemKey);
    if(item){
        Z.debug("have item locally, loading details into ui", 3);
        if(Zotero.nav.getUrlVar('mode') == 'edit'){
            Zotero.ui.editItemForm(jel, item);
        }
        else{
            Zotero.ui.loadItemDetail(item, jel);
            Zotero.ui.showChildren(el, itemKey);
        }
    }
    else{
        Z.debug("must fetch item from server", 3);
        d = library.loadItem(itemKey);
        jel.data('pendingDeferred', d);
        var config = {'target':'item', 'libraryType':library.type, 'libraryID':library.libraryID, 'itemKey':itemKey, 'content':'json'};
        d.done(J.proxy(function(item){
            Z.debug("Library.loadItem done", 3);
            jel.empty();
            
            if(Zotero.nav.getUrlVar('mode') == 'edit'){
                Zotero.ui.editItemForm(jel, item);
            }
            else{
                Zotero.ui.loadItemDetail(item, jel);
                Zotero.ui.showChildren(el, itemKey);
            }
            //set currentConfig on element when done displaying
            jel.data('currentconfig', config);
        }, this));
    }
};

/**
 * Ajaxload library control panel
 * @param  {Dom Element} el Ajaxload element
 * @return {undefined}
 */
Zotero.callbacks.controlPanel = function(el){
    Z.debug("Zotero.callbacks.controlPanel", 3);
    Zotero.ui.showControlPanel(el);
    Zotero.ui.updateDisabledControlButtons();
};

/**
 * Ajaxload library tags
 * @param  {Dom Element} el Ajaxload element
 * @return {undefined}
 */
Zotero.callbacks.loadTags = function(el, checkCached){
    Z.debug('Zotero.callbacks.loadTags', 3);
    Zotero.nav.flagLoading(el);
    var jel = J(el);
    if(typeof checkCached == 'undefined'){
        checkCached = true; //default to using the cache
    }
    
    //get Zotero.Library object if already bound to element
    var library = Zotero.ui.getAssociatedLibrary(el);
    
    var defaultConfig = {};
    
    var collectionKey = Zotero.nav.getUrlVar('collectionKey') || jel.attr("data-collectionKey");
    
    var showAllTags = jel.find('#show-all-tags').filter(':checked').length;
    //var showAuto = jel.children('#show-automatic').filter(':checked').length;
    
    // put the selected tags into an array
    var selectedTags = Zotero.nav.getUrlVar('tag');
    if(!J.isArray(selectedTags)){
        if(selectedTags) {
            selectedTags = [selectedTags];
        }
        else {
            selectedTags = [];
        }
    }
    
    var newConfig;
    //api doesn't support tags filtered by tag yet, so don't include selectedTags in configs
    if(showAllTags){
        //newConfig = J.extend({}, defaultConfig, {tag:selectedTags});
        newConfig = J.extend({}, defaultConfig);
    }
    else{
        //newConfig = J.extend({}, defaultConfig, {collectionKey:collectionKey, tag:selectedTags});
        newConfig = J.extend({}, defaultConfig, {collectionKey:collectionKey});
    }
    
    Zotero.ui.showSpinner(J(el).find('div.loading'));
    
    J.subscribe('tags_page_loaded', J.proxy(function(tags){
        Z.debug("tags_page_loaded published", 3);
        J.unsubscribe('tags_page_loaded');
        
        //remove spinner
        if(!jel.data('showmore')){
            J(el).find('div.loading').empty();
        }
        var plainList = library.tags.plainTagsList(library.tags.tagsArray);
        var matchedList = Zotero.utils.prependAutocomplete('', plainList);
        Zotero.ui.displayTagsFiltered(el, library.tags, matchedList, selectedTags);
    }, this));
    
    var d = library.loadAllTags(newConfig, checkCached);
    
    d.done(J.proxy(function(tags){
        Z.debug("finished loadAllTags", 3);
        J(el).find('div.loading').empty();
        Z.debug(tags, 5);
        library.tags.loaded = true;
        library.tags.loadedConfig = newConfig;
        J(el).children('.loading').empty();
        var plainList = library.tags.plainTagsList(library.tags.tagsArray);
        Zotero.ui.displayTagsFiltered(el, library.tags, plainList, selectedTags);
        Zotero.nav.doneLoading(el);
    }, this));
    
    d.fail(J.proxy(function(jqxhr, textStatus, errorThrown){
        var elementMessage = Zotero.ui.ajaxErrorMessage(jqxhr);
        jel.html("<p>" + elementMessage + "</p>");
    }));
    
    return;
};

Zotero.callbacks.showSpinnerSection = function(el){
    Z.debug("Zotero.callbacks.showSpinnerSection", 3);
    Zotero.ui.showSpinner(J(el).children('.loading'));
};

Zotero.callbacks.appendPreloader = function(el){
    Z.debug("Zotero.callbacks.appendPreloader", 3);
    Zotero.ui.appendSpinner(el);
};

/**
 * Ajaxload library collections
 * @param  {Dom Element} el Ajaxload element
 * @return {undefined}
 */
Zotero.callbacks.loadCollections = function(el){
    Z.debug("Zotero.callbacks.loadCollections", 3);
    Zotero.nav.flagLoading(el);
    var jel = J(el);
    
    //get Zotero.Library object if already bound to element
    var library = Zotero.ui.getAssociatedLibrary(el);
    var mode = Zotero.nav.getUrlVar('mode') || 'view';
    
    Zotero.ui.updateCollectionButtons();
    //set default mode on dom element if not set
    if(!jel.data('mode')) jel.data('mode', 'view');
    
    //short circuit if widget is already loaded or loading
    if((jel.data('loaded') || (library.collections.loading)) && (!library.collections.dirty) ) {
        Z.debug("collections already loaded and clean", 3);
        if((!library.collections.loaded) && jel.data('loaded')) {
            try{
                var preloadedCollections = JSON.parse(decodeURIComponent(jel.attr('data-collections')));
                library.collections.loadDataObjects(preloadedCollections);
            }
            catch(err){
                Z.ui.jsNotificationMessage("error parsing library data", 'error');
                Z.debug("error parsing library data - collections");
                throw err;
            }
        }
        //jel.empty();
        //Zotero.ui.displayCollections(el, library.collections);
        Zotero.ui.highlightCurrentCollection();
        Zotero.ui.nestHideCollectionTree(el);
        Zotero.nav.doneLoading(el);
        return;
    }
    
    //empty contents and show spinner while loading ajax
    var clist = jel.find('#collection-list-container');
    Zotero.ui.showSpinner(clist);
    
    var d = library.loadCollections();
    d.done(J.proxy(function(){
        Zotero.nav.doneLoading(el);
        clist.empty();
        Zotero.ui.displayCollections(clist, library.collections);
        Zotero.ui.nestHideCollectionTree(clist);
        Zotero.ui.highlightCurrentCollection();
        jel.data('loaded', true);
        jel.data('mode', mode);
        Zotero.nav.doneLoading(el);
    }, this));
    
    d.fail(J.proxy(function(jqxhr, textStatus, errorThrown){
        var elementMessage = Zotero.ui.ajaxErrorMessage(jqxhr);
        jel.html("<p>" + elementMessage + "</p>");
    }));
    
    return;
};

/**
 * Ajaxload update feed link
 * @param  {Dom Element} el Ajaxload element
 * @return {undefined}
 */
Zotero.callbacks.loadFeedLink = function(el){
    Z.debug("Zotero.callbacks.loadFeedLink", 3);
    var jel = J(el);
    
    var library = Zotero.ui.getAssociatedLibrary(el);
    var loadConfig = jel.data('loadconfig');
    library.libraryLabel = loadConfig.libraryLabel;
    
    var effectiveUrlVars = ['itemPage', 'tag', 'collectionKey', 'order', 'sort', 'q'];
    var urlConfigVals = {};
    J.each(effectiveUrlVars, function(index, value){
        var t = Zotero.nav.getUrlVar(value);
        if(t){
            urlConfigVals[value] = t;
        }
    });
    
    var defaultConfig = {target:'items',
                         targetModifier: 'top',
                         itemPage: 1,
                         limit: 25
                     };
    //Build config object that should be displayed next and compare to currently displayed
    var newConfig = J.extend({}, defaultConfig, jel.data('loadconfig'), urlConfigVals);
    newConfig['collectionKey'] = urlConfigVals['collectionKey'];//always override collectionKey, even with absence of collectionKey
    newConfig.start = parseInt(newConfig.limit, 10) * (parseInt(newConfig.itemPage, 10) - 1);
    
    if(!newConfig.sort){
        newConfig.sort = Zotero.config.sortOrdering[newConfig.order];
    }
    
    //don't pass top if we are searching for tags (or query?)
    if(newConfig.tag || newConfig.q){
        delete newConfig.targetModifier;
    }
    
    var urlconfig = J.extend({'target':'items', 'libraryType':library.libraryType, 'libraryID':library.libraryID}, newConfig);
    var requestUrl = Zotero.ajax.apiRequestUrl(urlconfig) + Zotero.ajax.apiQueryString(urlconfig, false);
    var feedUrl = requestUrl.replace(Zotero.config.baseApiUrl, Zotero.config.baseFeedUrl);
    var newkeyurl = Zotero.url.requestReadApiKeyUrl(library.libraryType, library.libraryID, feedUrl);
    //save urlconfig on feed element for use in callbacks
    jel.data('urlconfig', urlconfig);
    
    //feed link to either create a new key for private feeds or a public feed url
    if((library.libraryType == 'user' && zoteroData.libraryPublish === 0) || (library.libraryType == 'group' && zoteroData.groupType == 'Private' ) ){
        J(".feed-link").attr('href', newkeyurl);
    }
    else{
        J(".feed-link").attr('href', feedUrl);
    }
    J("#library link[rel='alternate']").attr('href', feedUrl);
    
    //get list of export urls and link them
    var exportUrls = Zotero.url.exportUrls(urlconfig);
    J("#export-list").empty().append(J("#exportformatsTemplate").tmpl({exportUrls:exportUrls}));
    J("#export-list").data('urlconfig', urlconfig);
    //hide export list until requested
    J("#export-list").hide();
};

/**
 * Ajaxload user groups
 * @param  {Dom Element} el Ajaxload element
 * @return {undefined}
 */
Zotero.callbacks.loadUserGroups = function(el){
    Z.debug("Zotero.callbacks.loadUserGroups", 3);
    var jel = J(el);
    
    var config = {};
    config.userslug = jel.attr("data-userslug");
    config.target = jel.attr("data-target");
    //config.start = jel.attr("data-start");
    //config.limit = jel.attr("data-limit");
    config.content = jel.attr("data-content");
    config.raw = "1";
    
    Zotero.ajax.loadUserGroups(el, config);
};

Zotero.callbacks.userGroupsLoaded = function(el){
    Z.debug("Zotero.callbacks.userGroupsLoaded", 3);
    var jel = J(el);
    var groups = Zotero.groups;
    groups.groupsArray.sort(groups.sortByTitleCompare);
    
    var groupshtml = Zotero.ui.userGroupsDisplay(groups);
    jel.html(groupshtml);
};

/**
 * Ajaxload run z.org search
 * @param  {Dom Element} el Ajaxload element
 * @return {undefined}
 */
Zotero.callbacks.runsearch = function(el){
    Z.debug('Zotero.callbacks.runsearch', 3);
    var params = Zotero.pages.search_index.parseSearchUrl();
    
    if(!params.type){
        params.type = 'support';
    }
    var sectionID = params.type;
    if(sectionID != 'people' && sectionID != 'group'){
        sectionID = 'support';
    }
    Z.debug("search type: " + params.type, 4);
    J(".search-section").not("[id=" + sectionID + "]").hide();
    J(".search-section[id=" + sectionID + "]").show().find('input[name=q]').val(params.query);
    J("#search-nav li").removeClass('selected');
    J("#search-nav li." + params.type).addClass('selected');
    zoterojsSearchContext = params.type;
    
    if(params.query){
        Zotero.pages.search_index.runSearch(params);
    }
};

/**
 * Ajaxload library filter display panels on mobile
 * @param  {Dom Element} el Ajaxload element
 * @return {undefined}
 */
Zotero.callbacks.loadFilterGuide = function(el){
    Z.debug("Zotero.callbacks.loadFilterGuide", 3);
    var tag = Zotero.nav.getUrlVar('tag');
    if(typeof tag == 'string'){
        tag = [tag];
    }
    var collectionKey = Zotero.nav.getUrlVar('collectionKey');
    var q = Zotero.nav.getUrlVar('q');
    
    var filters = {tag: tag, collectionKey:collectionKey, q:q};
    Zotero.ui.filterGuide(el, filters);
};

/**
 * Ajaxload library action panel
 * @param  {Dom Element} el Ajaxload element
 * @return {undefined}
 */
Zotero.callbacks.actionPanel = function(el){
    Z.debug("Zotero.callbacks.actionPanel", 3);
    var mode = Zotero.nav.getUrlVar('mode');
    var elid = J(el).attr('id');
    if(elid == 'collections-pane-edit-panel-div'){
        if(mode == 'edit'){
            Zotero.ui.collectionsActionPane(J("#collections-pane-edit-panel-div"), true);
        }
        else{
            Zotero.ui.collectionsActionPane(J("#collections-pane-edit-panel-div"), false);
        }
    }
    else if(elid == 'items-pane-edit-panel-div'){
        if(mode == 'edit'){
            Zotero.ui.itemsActionPane(J("#items-pane-edit-panel-div"));
        }
        else{
            Zotero.ui.itemsSearchActionPane(J("#items-pane-edit-panel-div"));
        }
        Zotero.ui.updateDisabledControlButtons();
    }
};

/**
 * Ajaxload select the active mobile library page
 * @param  {Dom Element} el Ajaxload element
 * @return {undefined}
 */
Zotero.callbacks.selectMobilePage = function(el){
    Z.debug("Zotero.callbacks.selectMobilePage", 3);
    //don't switch to a dialog if this is the first load rather than a history event
    if(Zotero.state.mobilePageFirstLoad){
        Z.debug("first mobile pageload - ignoring page history's page", 3);
        Zotero.state.mobilePageFirstLoad = false;
        var activePageID = J.mobile.activePage.attr('id') || '';
        Zotero.nav.updateStatePageID(activePageID);
        return;
    }
    else if(Zotero.state.mobileBackButtonClicked){
        Zotero.state.mobileBackButtonClicked = false;
        var defaultPageID = J("[data-role='page']").first().attr('id');
        Zotero.nav.ignoreStateChange();
        Zotero.ui.mobile.changePage('#' + defaultPageID, {'changeHash':false});
    }
    else{
        Z.debug("Not first mobile pageload - going ahead with mobile page selection", 3);
    }
    var hState = History.getState();
    var s = hState.data;
    var page = Zotero.nav.getUrlVar('msubpage') || s._zpageID;
    if(page){
        if(J.mobile.activePage.attr('id') != page){
            Z.debug("Zotero.callbacks.selectMobilePage switching to " + page, 4);
            Zotero.nav.ignoreStateChange();
            Zotero.ui.mobile.changePage('#' + page, {'changeHash':false});
            //Zotero.nav.updateStatePageID(page);
        }
    }
    else{
        //show the first mobile page in the dom
        /*
        var defaultPageID = J("[data-role='page']").first().attr('id');
        Zotero.nav.ignoreStateChange();
        Zotero.ui.mobile.changePage('#' + defaultPageID, {'changeHash':false});
        */
        
        /*
        Z.debug('no page set, set the current page');
        //if(!s.hasOwnProperty('_zpageID'));
        var activePageID = J.mobile.activePage.attr('id') || '';
        Zotero.nav.updateStatePageID(activePageID);
        */
    }
    Zotero.ui.createOnActivePage();
    return;
};




/**
 * compatibility function between jqueryUI and jqueryMobile dialog functions
 * @param  {DOMNode} el      Dom element that will become the dialog
 * @param  {object} options Options object passed to either jqueryUI or jqueryMobile
 * @return {undefined}
 */
Zotero.ui.dialog = function(el, options){
    Z.debug("Zotero.ui.dialog", 3);
    J(el).dialog(options);
    Z.debug("exiting Zotero.ui.dialog", 3);
};

/**
 * compatibility function between jqueryUI and jqueryMobile to close a dialog
 * @param  {Dom Element} el Dialog element
 * @return {undefined}
 */
Zotero.ui.closeDialog = function(el){
    J(el).dialog('close');
};

/**
 * Update the disabled state of library control toolbar buttons depending on context
 * @return {undefined}
 */
Zotero.ui.updateDisabledControlButtons = function(){
    Z.debug("Zotero.ui.updateDisabledControlButtons", 3);
    J(".move-to-trash-link").prop('title', 'Move to Trash');
    
    J("#create-item-link").button('option', 'disabled', false);
    if((J(".itemlist-editmode-checkbox:checked").length === 0) && (!Zotero.nav.getUrlVar('itemKey')) ){
        J(".add-to-collection-link").button('option', 'disabled', true).removeClass("ui-state-hover");
        J(".remove-from-collection-link").button('option', 'disabled', true).removeClass("ui-state-hover");
        J(".move-to-trash-link").button('option', 'disabled', true).removeClass("ui-state-hover");
        J(".remove-from-trash-link").button('option', 'disabled', true).removeClass("ui-state-hover");
        
        J("#cite-link").button('option', 'disabled', true);
        J("#export-link").button('option', 'disabled', true);
    }
    else{
        J(".add-to-collection-link").button('option', 'disabled', false).removeClass("ui-state-hover");
        J(".remove-from-collection-link").button('option', 'disabled', false).removeClass("ui-state-hover");
        J(".move-to-trash-link").button('option', 'disabled', false).removeClass("ui-state-hover");
        if(Zotero.nav.getUrlVar('collectionKey') == 'trash'){
            J(".remove-from-trash-link").button('option', 'disabled', false).removeClass("ui-state-hover");
        }
        J("#cite-link").button('option', 'disabled', false);
        J("#export-link").button('option', 'disabled', false);
    }
    //only show remove from collection button if inside a collection
    if(!Zotero.nav.getUrlVar("collectionKey")){
        J(".remove-from-collection-link").button('option', 'disabled', true).removeClass("ui-state-hover");
    }
    //disable create item button if in trash
    else if(Zotero.nav.getUrlVar('collectionKey') == 'trash'){
        J("#create-item-link").button('option', 'disabled', true).removeClass('ui-state-hover');
        J(".add-to-collection-link").button('option', 'disabled', true).removeClass("ui-state-hover");
        J(".remove-from-collection-link").button('option', 'disabled', true).removeClass("ui-state-hover");
        J(".move-to-trash-link").prop('title', 'Permanently Delete');
    }
    Zotero.ui.init.editButton();
};

/**
 * Display a JS notification message to the user
 * @param  {string} message Notification message
 * @param  {string} type    confirm, notice, or error
 * @param  {int} timeout seconds to display notification
 * @return {undefined}
 */
Zotero.ui.jsNotificationMessage = function(message, type, timeout){
    Z.debug("notificationMessage: " + type + " : " + message, 3);
    if(Zotero.config.suppressErrorNotifications) return;
    if(!timeout){
        timeout = 5;
    }
    J("#js-message-list").append("<li class='jsNotificationMessage-" + type + "' >" + message + "</li>").children("li").delay(parseInt(timeout, 10) * 1000).slideUp().delay(300).queue(function(){
        J(this).remove();
    });
};

/**
 * Display an error message on ajax failure
 * @param  {jQuery XHR Promise} jqxhr jqxhr returned from jquery.ajax
 * @return {undefined}
 */
Zotero.ui.ajaxErrorMessage = function(jqxhr){
    Z.debug("Zotero.ui.ajaxErrorMessage", 3);
    if(typeof jqxhr == 'undefined'){
        Z.debug('ajaxErrorMessage called with undefined argument');
        return '';
    }
    Z.debug(jqxhr, 3);
    switch(jqxhr.status){
        case 403:
            //don't have permission to view
            if(Zotero.config.loggedIn){
                return "You do not have permission to view this library.";
            }
            else{
                Zotero.config.suppressErrorNotifications = true;
                window.location = "/user/login";
                return "";
            }
            break;
        case 404:
            Zotero.ui.jsNotificationMessage("A requested resource could not be found.", 'error');
            break;
        case 400:
            Zotero.ui.jsNotificationMessage("Bad Request", 'error');
            break;
        case 405:
            Zotero.ui.jsNotificationMessage("Method not allowed", 'error');
            break;
        case 412:
            Zotero.ui.jsNotificationMessage("Precondition failed", 'error');
            break;
        case 500:
            Zotero.ui.jsNotificationMessage("Something went wrong but we're not sure what.", 'error');
            break;
        case 501:
            Zotero.ui.jsNotificationMessage("We can't do that yet.", 'error');
            break;
        case 503:
            Zotero.ui.jsNotificationMessage("We've gone away for a little while. Please try again in a few minutes.", 'error');
            break;
        default:
            Z.debug("jqxhr status did not match any expected case");
            Z.debug(jqxhr.status);
            //Zotero.ui.jsNotificationMessage("An error occurred performing the requested action.", 'error');
    }
    return '';
};

/**
 * Scroll to the top of the window
 * @return {undefined}
 */
Zotero.ui.scrollToTop = function(){
    window.scrollBy(0, -5000);
};

/**
 * get a list of the itemKeys for items checked off in a form to know what items to operate on
 * if a single item is being displayed the form selections will be overridden
 * otherwise this function returns the data-itemkey values associated with input.itemKey-checkbox:checked
 * @param  {Form element} form Form DOM Element to pull itemkey values from
 * @return {array}
 */
Zotero.ui.getSelectedItemKeys = function(form){
    Z.debug("Zotero.ui.getSelectedItemKeys", 3);
    var itemKeys = [];
    var curItemKey = Zotero.nav.getUrlVar('itemKey');
    if(curItemKey){
        itemKeys.push(curItemKey);
    }
    else{
        if(J(form).length){
            J(form).find("input.itemKey-checkbox:checked").each(function(index, val){
                itemKeys.push(J(val).data('itemkey'));
            });
        }
        else {
            J("input.itemKey-checkbox:checked").each(function(index, val){
                itemKeys.push(J(val).data('itemkey'));
            });
        }
    }
    return itemKeys;
};

Zotero.ui.getAllFormItemKeys = function(form){
    Z.debug("Zotero.ui.getSelectedItemKeys", 3);
    var itemKeys = [];
    var curItemKey = Zotero.nav.getUrlVar('itemKey');
    if(curItemKey){
        itemKeys.push(curItemKey);
    }
    else{
        J(form).find("input.itemKey-checkbox").each(function(index, val){
            itemKeys.push(J(val).data('itemkey'));
        });
    }
    return itemKeys;
};

/**
 * Callback that will initialize an item save based on new values in an item edit form
 * @param  {event} e DOM Event triggering callback
 * @return {boolean}
 */
Zotero.ui.saveItemCallback = function(e){
    Z.debug("saveitemlink clicked", 3);
    e.preventDefault();
    Zotero.ui.scrollToTop();
    var library = Zotero.ui.getAssociatedLibrary(J(this).closest(".ajaxload"));
    //get our current representation of the item
    var itemKey = J(this).attr('data-itemKey');
    var item;
    if(itemKey){
        item = library.items.getItem(itemKey);
        Z.debug("itemKey " + itemKey + ' : ', 3);
    }
    else{
        item = J("#item-details-div").data('newitem');
        Z.debug("newItem : itemTemplate selected from form", 3);
        Z.debug(item, 3);
    }
    Zotero.ui.updateItemFromForm(item, J(this).closest("form"));
    library.dirty = true;
    Zotero.ui.showSpinner(J(this).closest(".ajaxload"));
    return false;
};

/**
 * Add selected items to collection
 * @param {string} collectionKey collectionKey of collection items will be added to
 * @param {Zotero_Library} library       Zotero library to operate on
 */
Zotero.ui.addToCollection = function(collectionKey, library){
    Z.debug("add-to-collection clicked", 3);
    var itemKeys = Zotero.ui.getSelectedItemKeys(J("#edit-mode-items-form"));
    //var library = Zotero.ui.getAssociatedLibrary(J(this).closest('div.ajaxload'));
    if(!collectionKey){
        Zotero.ui.jsNotificationMessage("No collection selected", 'error');
        return false;
    }
    if(itemKeys.length === 0){
        Zotero.ui.jsNotificationMessage("No items selected", 'notice');
        return false;
    }
    Z.debug(itemKeys, 4);
    Z.debug(collectionKey, 4);
    Z.debug(library.collections[collectionKey], 4);
    var response = library.collections[collectionKey].addItems(itemKeys);
    library.dirty = true;
    J.when(response).then(function(){
        //Zotero.nav.forceReload = true;//delete Zotero.nav.urlvars.pathVars['mode'];
        Zotero.nav.pushState(true);
    });
    return false;
};

/**
 * Conditionally show the control panel
 * @param  {Dom El} el control panel element
 * @return {undefined}
 */
Zotero.ui.showControlPanel = function(el){
    Z.debug("Zotero.ui.showControlPanel", 3);
    var jel = J(el);
    var mode = Zotero.nav.getUrlVar('mode') || 'view';
    
    if(Zotero.config.librarySettings.allowEdit === 0){
        J(".permission-edit").hide();
        J("#control-panel").hide();
    }
};

/**
 * Get an item's children and display summary info
 * @param  {DOM Element} el      element to insert into
 * @param  {string} itemKey key of parent item
 * @return {undefined}
 */
Zotero.ui.showChildren = function(el, itemKey){
    Z.debug('Zotero.ui.showChildren', 3);
    var library = Zotero.ui.getAssociatedLibrary(J(el).closest("div.ajaxload"));
    var item = library.items.getItem(itemKey);
    var attachmentsDiv = J(el).find(".item-attachments-div");
    Zotero.ui.showSpinner(attachmentsDiv);
    
    var childItemsPromise = item.getChildren(library);
    
    childItemsPromise.done(function(childItems){
        J.tmpl('childitemsTemplate', {childItems:childItems}).appendTo(J(".item-attachments-div").empty());
    });
    
    Zotero.ui.createOnActivePage(el);
};

/**
 * Add creator field to item edit form
 * @param {DOM Button} button Add creator button clicked
 */
Zotero.ui.addCreator = function(button){
    Z.debug("Zotero.ui.addCreator", 3);
    var itemKey = J(button).data('itemkey');
    var itemType = J(button).closest('form').find('select.itemType').val();
    var lastcreatorid = J("input[id^='creator_']:last").attr('id');
    var creatornum = 0;
    if(lastcreatorid){
        creatornum = parseInt(lastcreatorid.substr(8), 10);
    }
    var newindex = creatornum + 1;
    var jel = J("input[id^='creator_']:last").closest('tr');
    J.tmpl('authorelementsdoubleTemplate', {index:newindex,
                                            creator:{firstName:'', lastName:''},
                                            creatorTypes:Zotero.Item.prototype.creatorTypes[itemType]
                                            }).insertAfter(jel);
    
    Zotero.ui.init.creatorFieldButtons();
    
    Zotero.ui.createOnActivePage(jel);
};

/**
 * Remove a creator from an edit item form
 * @param  {Dom Button} button Remove creator button that was clicked
 * @return {undefined}
 */
Zotero.ui.removeCreator = function(button){
    Z.debug("Zotero.ui.removeCreator", 3);
    J(button).closest('tr').remove();
    
    Zotero.ui.createOnActivePage(button);
};

/**
 * Add a note field to an editItem Form
 * @param {Dom Button} button Add note button that was clicked
 */
Zotero.ui.addNote = function(button){
    Z.debug("Zotero.ui.addNote", 3);
    //var itemKey = J(button).data('itemkey');
    var notenum = 0;
    var lastNoteID = J("textarea[name^='note_']:last").attr('name');
    if(lastNoteID){
        notenum = parseInt(lastNoteID.substr(5), 10);
    }
    
    var newindex = notenum + 1;
    var newNoteID = "note_" + newindex;
    var jel;
    if(Zotero.config.mobile){
        jel = J("td.notes").append('<textarea cols="40" rows="24" name="' + newNoteID + '" id="' + newNoteID + '" class="tinymce default"></textarea>');
    }
    else{
        jel = J("td.notes button.add-note-button").before('<textarea cols="40" rows="24" name="' + newNoteID + '" id="' + newNoteID + '" class="tinymce default"></textarea>');
    }
    
    Z.debug("new note ID:" + newNoteID, 4);
    
    Zotero.ui.init.tinyMce('default', true, newNoteID);
    
    Zotero.ui.createOnActivePage(button);
};

/**
 * Update a Zotero_Item object from the current values of an edit item form
 * @param  {Zotero_Item} item   Zotero item to update
 * @param  {Dom Form} formEl edit item form to take values from
 * @return {bool}
 */
Zotero.ui.updateItemFromForm = function(item, formEl){
    Z.debug("Zotero.ui.updateItemFromForm", 3);
    var base = J(formEl);
    base.closest('.ajaxload').data('ignoreformstorage', true);
    var library = Zotero.ui.getAssociatedLibrary(base.closest('.ajaxload'));
    
    var itemKey = '';
    if(item.itemKey) itemKey = item.itemKey;
    //update current representation of the item with form values
    J.each(item.contentRows, function(i, row){
        var selector, inputValue, noteElID;
        if(row.field == 'note'){
            selector = "textarea[data-itemKey='" + itemKey + "'].tinymce";
            Z.debug(selector, 4);
            noteElID = J(selector).attr('id');
            Z.debug(noteElID, 4);
            inputValue = tinyMCE.get(noteElID).getContent();
        }
        else{
            selector = "[data-itemKey='" + itemKey + "'][name='" + row.field + "']";
            inputValue = base.find(selector).val();
        }
        if(typeof inputValue !== 'undefined'){
            row.fieldValue = inputValue;//base.find(selector).val();
            item.apiObj[row.field] = inputValue;//base.find(selector).val();
        }
    });
    var creators = [];
    base.find("tr.creator").each(function(index, el){
        var name, creator, firstName, lastName;
        var trindex = parseInt(J(el).attr('id').substr(8), 10);
        var creatorType = J(el).find("select[id$='creatorType']").val();
        if(J(el).hasClass('singleCreator')){
            name = J(el).find("input[id$='_name']");
            if(!name.val()){
                //can't submit authors with empty names
                return true;
            }
            creator = {creatorType: creatorType,
                            name: name.val()
                        };
        }
        else if(J(el).hasClass('doubleCreator')){
            firstName = J(el).find("input[id$='_firstName']").val();
            lastName = J(el).find("input[id$='_lastName']").val();
            if((firstName === '') && (lastName === '')){
                return true;
            }
            creator = {creatorType: creatorType,
                            firstName: firstName,
                            lastName: lastName
                            };
        }
        creators.push(creator);
    });
    
    var tags = [];
    base.find("input[id^='tag_']").each(function(index, el){
        if(J(el).val() !== ''){
            tags.push({tag: J(el).val()});
        }
    });
    
    //grab all the notes from the form and add to item
    //in the case of new items we can add notes in the creation request
    //in the case of existing items we need to post notes to /children, but we still
    //have that interface here for consistency
    var notes = [];
    base.find("textarea[name^='note_']").each(function(index, el){
        var noteid = J(el).attr('id');
        var noteContent = tinyMCE.get(noteid).getContent();
        Z.debug(noteContent, 3);
        notes.push({itemType:'note', 'note': noteContent});
    });
    item.apiObj.notes = notes;
    
    item.apiObj.creators = creators;
    item.apiObj.tags = tags;
    //var requestData = JSON.stringify(item.apiObj);
    Z.debug("pre writeItem debug", 4);
    Z.debug(item, 4);
    //show spinner before making ajax write call
    Zotero.ui.showSpinner(J(formEl).closest('.ajaxload'));
    var jqxhr = item.writeItem();
    jqxhr.done(J.proxy(function(newItemKey){
        Z.debug("item write finished", 3);
        delete Zotero.nav.urlvars.pathVars['action'];
        if(itemKey === ''){
            //newly created item, add to collection if collectionkey in url
            var collectionKey = Zotero.nav.getUrlVar('collectionKey');
            if(collectionKey){
                var collection = library.collections[collectionKey];
                collection.addItems([item.itemKey]);
                library.dirty = true;
            }
            Zotero.nav.urlvars.pathVars['itemKey'] = item.itemKey;
        }
        Zotero.nav.clearUrlVars(['itemKey', 'collectionKey']);
        Zotero.nav.pushState(true);
    }, this));
    
    //update list of tags we have if new ones added
    Z.debug('adding new tags to library tags', 3);
    var libTags = library.tags;
    J.each(tags, function(index, tagOb){
        var tagString = tagOb.tag;
        if(!libTags.tagObjects.hasOwnProperty(tagString)){
            var tag = new Zotero.Tag();
            tag.title = tagString;
            tag.numItems = 1;
            tag.urlencodedtag = encodeURIComponent(tag.title);
            libTags.tagObjects[tagString] = tag;
            libTags.updateSecondaryData();
        }
    });
};

/**
 * Load the template for a new item
 * @param  {Zotero_Item} item Item template to load
 * @return {undefined}
 */
Zotero.ui.loadNewItemTemplate = function(item){
    Z.debug("Zotero.ui.loadNewItemTemplate", 3);
    Z.debug(item, 3);
    var d = Zotero.Item.prototype.getCreatorTypes(item.itemType);
    d.done(function(itemCreatorTypes){
        var jel = J("#item-details-div").empty();
        if(item.itemType == 'note'){
            var parentKey = Zotero.nav.getUrlVar('parentKey');
            if(parentKey){
                item.parentKey = parentKey;
            }
            J.tmpl('editnoteformTemplate', {item:item,
                                         itemKey:item.itemKey
                                         }).appendTo(jel);
            
            Zotero.ui.init.tinyMce('default');
        }
        else {
            J.tmpl('itemformTemplate', {item:item.apiObj,
                                        libraryUserID:zoteroData.libraryUserID,
                                        itemKey:item.itemKey,
                                        creatorTypes:itemCreatorTypes
                                        }
                                        ).appendTo(jel);
            if(item.apiObj.tags.length === 0){
                Zotero.ui.addTag(false);
            }
            Zotero.ui.init.creatorFieldButtons();
            Zotero.ui.init.tagButtons();
            Zotero.ui.init.editButton();
        }
        jel.data('newitem', item);
        
        //load data from previously rendered form if available
        Zotero.ui.loadFormData(jel);
        
        Zotero.ui.createOnActivePage(jel);
    });
};

/**
 * Temporarily store the data in a form so it can be reloaded
 * @return {undefined}
 */
Zotero.ui.saveFormData = function(){
    Z.debug("saveFormData", 3);
    J(".ajaxload").each(function(){
        var formInputs = J(this).find('input');
        J(this).data('tempformstorage', formInputs);
    });
};

/**
 * Reload previously saved form data
 * @param  {Dom Element} el DOM Form to restore data to
 * @return {undefined}
 */
Zotero.ui.loadFormData = function(el){
    Z.debug("loadFormData", 3);
    var formData = J(el).data('tempformstorage');
    if(J(el).data("ignoreformstorage")){
        Z.debug("ignoring stored form data", 3);
        J(el).removeData('tempFormStorage');
        J(el).removeData('ignoreFormStorage');
        return;
    }
    Z.debug('formData: ', 4);
    Z.debug(formData, 4);
    if(formData){
        formData.each(function(index){
            var idstring = '#' + J(this).attr('id');
            Z.debug('idstring:' + idstring, 4);
            if(J(idstring).length){
                Z.debug('setting value of ' + idstring, 4);
                J(idstring).val(J(this).val());
            }
        });
    }
};

/**
 * Add a tag field to an edit item form
 * @param {bool} focus Whether to focus the newly added tag field
 */
Zotero.ui.addTag = function(focus) {
    Z.debug("Zotero.ui.addTag", 3);
    if(typeof focus == 'undefined'){
        focus = true;
    }
    var tagnum = 0;
    var lastTagID = J("input[id^='tag_']:last").attr('id');
    if(lastTagID){
        tagnum = parseInt(lastTagID.substr(4), 10);
    }
    
    var newindex = tagnum + 1;
    var jel = J("td.tags");
    J.tmpl('itemtagTemplate', {index:newindex}).appendTo(jel);
    
    J("input.taginput").autocomplete({
        source:function(request, callback){
            var library = Zotero.ui.getAssociatedLibrary(J(this.element.context).closest(".ajaxload"));
            var matchingTagStrings = Zotero.utils.prependAutocomplete(request.term, library.tags.plainList);
            callback(matchingTagStrings);
        },
        select: function(e, ui){
            e.preventDefault();
            e.stopImmediatePropagation();
            var value = ui.item.value;
            Zotero.ui.addTag();
        }
    });
    
    if(focus){
        J("input.taginput").last().focus();
    }
    
    Zotero.ui.init.tagButtons();
    
    Zotero.ui.createOnActivePage(jel);
};

/**
 * Remove a tag field from an edit item form
 * @param  {DOM Element} el Tag field to remove
 * @return {undefined}
 */
Zotero.ui.removeTag = function(el) {
    Z.debug("Zotero.ui.removeTag", 3);
    J(el).closest('.edit-tag-div').remove();
    
    Zotero.ui.createOnActivePage(el);
};

/**
 * Get the class for an itemType to display an appropriate icon
 * @param  {Zotero_Item} item Zotero item to get the class for
 * @return {string}
 */
Zotero.ui.itemTypeClass = function(item) {
    var itemTypeClass = item.itemType;
    if (item.itemType == 'attachment') {
        if (item.mimeType == 'application/pdf') {
            itemTypeClass += '-pdf';
        }
        else {
            switch (item.linkMode) {
                case 0: itemTypeClass += '-file'; break;
                case 1: itemTypeClass += '-file'; break;
                case 2: itemTypeClass += '-snapshot'; break;
                case 3: itemTypeClass += '-web-link'; break;
            }
        }
    }
    return "img-" + itemTypeClass;
};

/**
 * Bine collection links to take appropriate action instead of following link
 * @return {boolean}
 */
Zotero.ui.bindCollectionLinks = function(){
    Z.debug("Zotero.ui.bindCollectionLinks", 3);
    
    J("#collection-list-div").on('click', "div.folder-toggle", function(e){
        e.preventDefault();
        J(this).siblings('.collection-select-link').click();
        return false;
    });
    
    J("#collection-list-div").on('click', ".collection-select-link", function(e){
        Z.debug("collection-select-link clicked", 4);
        e.preventDefault();
        var collection, library;
        var collectionKey = J(this).attr('data-collectionkey');
        //if this is the currently selected collection, treat as expando link
        if(J(this).hasClass('current-collection')) {
            var expanded = J('.current-collection').data('expanded');
            if(expanded === true){
                Zotero.ui.nestHideCollectionTree(J("#collection-list-container"), false);
            }
            else{
                Zotero.ui.nestHideCollectionTree(J("#collection-list-container"), true);
            }
            
            //go back to items list
            Zotero.nav.clearUrlVars(['collectionKey', 'mode']);
            
            //change the mobile page if we didn't just expand a collection
            if(Zotero.config.mobile && (Zotero.nav.getUrlVar('mode') != 'edit')){
                collection = Zotero.ui.getAssociatedLibrary(J(this));
                if(!collection.hasChildren){
                    Z.debug("Changing page to items list because collection has no children", 4);
                    //Zotero.ui.mobile.changePage('#library-items-page');
                    //Zotero.ui.mobile.changePage("#library-items-page", {'changeHash':false}, false);
                    //J("#library-items-page").trigger('create');
                }
            }
            else{
                Zotero.nav.pushState();
            }
            
            //cancel action for expando link behaviour
            return false;
        }
        
        //Not currently selected collection
        Z.debug("click " + collectionKey, 4);
        Zotero.nav.clearUrlVars(['mode']);
        Zotero.nav.urlvars.pathVars['collectionKey'] = collectionKey;
        
        //url changes done, push state now
        //Zotero.nav.pushState();
        
        //change the mobile page if we didn't just expand a collection
        Z.debug("change mobile page if we didn't just expand a collection", 4);
        Z.debug(J(this), 4);
        if(Zotero.config.mobile){
            Z.debug("is mobile", 4);
            library = Zotero.ui.getAssociatedLibrary(J(this).closest('.ajaxload'));
            collection = library.collections.getCollection(collectionKey);
            if(!collection.hasChildren && (Zotero.nav.getUrlVar('mode') != 'edit')) {
                Z.debug("Changing page to items list because collection has no children", 4);
                //Zotero.ui.mobile.changePage('#library-items-page');
                Zotero.ui.mobile.changePage("#library-items-page", {'changeHash':false});
                //J("#library-items-page").trigger('create');
            }
            else{
                Zotero.nav.pushState();
            }
        }
        else{
            Zotero.nav.pushState();
        }
        
        return false;
    });
    J("#collection-list-div").on('click', "a.my-library", function(e){
        e.preventDefault();
        Zotero.nav.clearUrlVars(['mode']);
        if(Zotero.config.mobile){
            Zotero.ui.mobile.changePage("#library-items-page", {'changeHash':false});
        }
        
        Zotero.nav.pushState();
        return false;
    });
};

/**
 * Bine item links to take appropriate action instead of following link
 * @return {undefined}
 */
Zotero.ui.bindItemLinks = function(){
    Z.debug("Zotero.ui.bindItemLinks", 3);
    
    J("div#items-pane").on('click', "a.item-select-link", function(e){
        e.preventDefault();
        Z.debug("item-select-link clicked", 3);
        var itemKey = J(this).attr('data-itemKey');
        Z.debug("click " + itemKey, 4);
        Zotero.nav.urlvars.pathVars.itemKey = itemKey;
        Zotero.nav.pushState();
        //Zotero.callbacks.loadItem(el, 'user', itemKey);
    });
    J("div#items-pane").on('click', 'td[data-itemkey]:not(.edit-checkbox-td)', function(e){
        e.preventDefault();
        Z.debug("item-select-td clicked", 3);
        var itemKey = J(this).attr('data-itemKey');
        Z.debug("click " + itemKey, 4);
        Zotero.nav.urlvars.pathVars.itemKey = itemKey;
        Zotero.nav.pushState();
        //Zotero.callbacks.loadItem(el, 'user', itemKey);
    });
};

/**
 * Bind tag links to take appropriate action rather than following the link
 * @return {undefined}
 */
Zotero.ui.bindTagLinks = function(){
    Z.debug("Zotero.ui.bindTagLinks", 3);
    J("#tags-list-div, #items-pane").on('click', 'a.tag-link', function(e){
        e.preventDefault();
        J("#tag-filter-input").val('');
        Z.debug("tag-link clicked", 4);
        var tagtitle = J(this).attr('data-tagtitle');
        Zotero.nav.toggleTag(tagtitle);
        Z.debug("click " + tagtitle, 4);
        Zotero.nav.clearUrlVars(['tag', 'collectionKey']);
        Zotero.nav.pushState();
    });
};

//generate the full html for the nested collections list
/**
 * generate the full html for the nested collections list
 * @param  {Dom Element} el          Element to display collections in
 * @param  {Zotero_Collections} collections Zotero_Collections to display
 * @return {undefined}
 */
Zotero.ui.displayCollections = function(el, collections){
    Z.debug("Zotero.ui.displayCollections", 3);
    Z.debug("library Identifier " + collections.libraryUrlIdentifier, 4);
    var jel = J(el);
    var currentCollectionKey = Zotero.nav.getUrlVar('collectionKey') || '';
    var trash = collections.owningLibrary.libraryType == 'user' ? true : false;
    //var ncollections = collections.nestedOrderingArray();
    J.tmpl('collectionlistTemplate', {collections:collections.collectionsArray,
                                        libUrlIdentifier:collections.libraryUrlIdentifier,
                                        currentCollectionKey: currentCollectionKey,
                                        trash: trash
                                        //ncollections: ncollections
                                    }
                                    ).appendTo(jel);
    
    
    Zotero.ui.createOnActivePage(el);
    
};

/**
 * Nest the collection tree and hide/show appropriate nodes
 * @param  {Dom Element} el             Container element
 * @param  {boolean} expandSelected Show or hide the currently selected collection
 * @return {undefined}
 */
Zotero.ui.nestHideCollectionTree = function(el, expandSelected){
    if(typeof expandSelected == 'undefined'){
        expandSelected = true;
    }
    //nest and hide collection tree
    var jel = J(el);
    jel.find("#collection-list ul").hide().siblings(".folder-toggle")
                                        .children(".sprite-placeholder")
                                        .removeClass("sprite-placeholder")
                                        .addClass("ui-icon-triangle-1-e");
    jel.find(".current-collection").parents("ul").show();
    jel.find("#collection-list li.current-collection").children('ul').show();
    //start all twisties in closed position
    jel.find(".ui-icon-triangle-1-s").removeClass("ui-icon-triangle-1-s").addClass("ui-icon-triangle-1-e");
    //show opened twisties as expanded
    jel.find("li.current-collection").parentsUntil("#collection-list").children('div.folder-toggle').find(".ui-icon-triangle-1-e")
                                                .removeClass("ui-icon-triangle-1-e")
                                                .addClass("ui-icon-triangle-1-s");
    
    
    if(expandSelected === false){
        jel.find("#collection-list li.current-collection").children('ul').hide();
        jel.find("#collection-list li.current-collection").find(".ui-icon-triangle-1-s")
                                                    .removeClass("ui-icon-triangle-1-s")
                                                    .addClass("ui-icon-triangle-1-e");
        jel.find(".current-collection").data('expanded', false);
    }
    else{
        jel.find("li.current-collection").children('div.folder-toggle').find(".ui-icon-triangle-1-e")
                                                .removeClass("ui-icon-triangle-1-e")
                                                .addClass("ui-icon-triangle-1-s");
                                                
        jel.find(".current-collection").data('expanded', true);
    }
    
    Zotero.ui.createOnActivePage(el);
};

/**
 * Highlight the currently selected collection
 * @return {undefined}
 */
Zotero.ui.highlightCurrentCollection = function(){
    Z.debug("Zotero.ui.highlightCurrentCollection", 3);
    var collectionKey = Zotero.nav.getUrlVar('collectionKey');
    //unhighlight currently highlighted
    J("a.current-collection").closest("li").removeClass("current-collection");
    J("a.current-collection").removeClass("current-collection");
    
    if(collectionKey){
        //has collection selected, highlight it
        J("a[data-collectionKey='" + collectionKey + "']").addClass("current-collection");
        J("a[data-collectionKey='" + collectionKey + "']").closest('li').addClass("current-collection");
    }
    else{
        J("a.my-library").addClass("current-collection");
        J("a.my-library").closest('li').addClass("current-collection");
    }
};

/**
 * Update enabled/disabled for collection buttons based on context
 * @return {undefined}
 */
Zotero.ui.updateCollectionButtons = function(){
    var editCollectionsButtonsList = J(".edit-collections-buttons-list");
    editCollectionsButtonsList.buttonset().show();
    
    //enable modify and delete only if collection is selected
    J("#edit-collections-buttons-div").buttonset();
    
    J(".create-collection-link").button('option', 'icons', {primary:'sprite-toolbar-collection-add'}).button('option', 'text', false);
    J(".update-collection-link").button('option', 'icons', {primary:'sprite-toolbar-collection-edit'}).button('option', 'text', false);
    J(".delete-collection-link").button('option', 'icons', {primary:'sprite-folder_delete'}).button('option', 'text', false);
    
    if(Zotero.nav.getUrlVar("collectionKey")){
        J(".update-collection-link").button('enable');
        J(".delete-collection-link").button('enable');
    }
    else{
        J(".update-collection-link").button().button('disable');
        J(".delete-collection-link").button().button('disable');
    }
};

/**
 * Display an items widget (for logged in homepage)
 * @param  {Dom Element} el          Container
 * @param  {object} config      items config
 * @param  {array} loadedItems loaded items array
 * @return {undefined}
 */
Zotero.ui.displayItemsWidget = function(el, config, loadedItems){
    Z.debug("Zotero.ui.displayItemsWidget", 3);
    Z.debug(config, 4);
    //Z.debug(loadedItems, 4);
    //figure out pagination values
    var itemPage = parseInt(Zotero.nav.getUrlVar('itemPage'), 10) || 1;
    var feed = loadedItems.feed;
    var start = parseInt(config.start, 10) || 0;
    var limit = parseInt(config.limit, 10) || 25;
    var order = config.order || Zotero.config.userDefaultApiArgs.order;
    var sort = config.sort || Zotero.config.sortOrdering[order] || 'asc';
    var editmode = false;
    var jel = J(el);
    
    var titleParts = feed.title.split('/');
    var displayFields = Zotero.prefs.library_listShowFields;
    
    var itemsTableData = {titleParts:titleParts,
                           displayFields:displayFields,
                           items:loadedItems.itemsArray,
                           editmode:editmode,
                           order: order,
                           sort: sort,
                           library: loadedItems.library
                        };
    Zotero.ui.insertItemsTable(el, itemsTableData);
    
};

/**
 * Display the full library items section
 * @param  {Dom Element} el          Container
 * @param  {object} config      items config
 * @param  {array} loadedItems loaded items array
 * @return {undefined}
 */
Zotero.ui.displayItemsFull = function(el, config, loadedItems){
    Z.debug("Zotero.ui.displayItemsFull", 3);
    Z.debug(config, 4);
    //Z.debug(loadedItems, 4);
    
    var jel = J(el);
    var feed = loadedItems.feed;
    var filledConfig = J.extend({}, Zotero.config.defaultApiArgs, Zotero.config.userDefaultApiArgs, config);

    var titleParts = feed.title.split('/');
    var displayFields = Zotero.prefs.library_listShowFields;
    if(loadedItems.library.libraryType != 'group'){
        displayFields = J.grep(displayFields, function(el, ind){
            return J.inArray(el, Zotero.Library.prototype.groupOnlyColumns) == (-1);
        });
        /*
        displayFields = displayFields.filter(function(el, ind, array){
            return J.inArray(el, Zotero.Library.prototype.groupOnlyColumns) == (-1);
        });*/
    }
    var editmode = (Zotero.config.librarySettings.allowEdit ? true : false);
    
    var itemsTableData = {titleParts:titleParts,
                           displayFields:displayFields,
                           items:loadedItems.itemsArray,
                           editmode:editmode,
                           order: filledConfig['order'],
                           sort: filledConfig['sort'],
                           library:loadedItems.library
                        };
    Z.debug(jel, 4);
    Zotero.ui.insertItemsTable(jel, itemsTableData);
    
    if(Zotero.config.mobile){
        Zotero.ui.createOnActivePage(el);
        return;
    }
    
    var pagination = Zotero.ui.createPagination(loadedItems.feed, 'itemPage', filledConfig);
    var paginationData = {feed:feed, pagination:pagination};
    var itemPage = pagination.page;
    Zotero.ui.insertItemsPagination(el, paginationData);
    Z.debug(jel, 4);
    
    //bind pagination links
    var lel = J(el);
    J("#start-item-link").click(function(e){
        e.preventDefault();
        Zotero.nav.urlvars.pathVars['itemPage'] = '';
        Zotero.nav.pushState();
    });
    J("#prev-item-link").click(function(e){
        e.preventDefault();
        var newItemPage = itemPage - 1;
        Zotero.nav.urlvars.pathVars['itemPage'] = newItemPage;
        Zotero.nav.pushState();
    });
    J("#next-item-link").click(function(e){
        e.preventDefault();
        var newItemPage = itemPage + 1;
        Zotero.nav.urlvars.pathVars['itemPage'] = newItemPage;
        Zotero.nav.pushState();
    });
    J("#last-item-link").click(function(e){
        e.preventDefault();
        Z.debug("last-item-link clickbind", 4);
        var lasthref = '';
        J.each(feed.links, function(ind, link){
            if(link.rel === "last"){
                lasthref = link.href;
                return false;
            }
        });
        Z.debug(lasthref, 4);
        var laststart = J.deparam.querystring(lasthref).start;
        Z.debug("laststart:" + laststart, 4);
        var lastItemPage = (parseInt(laststart, 10) / limit) + 1;
        Zotero.nav.urlvars.pathVars['itemPage'] = lastItemPage;
        Zotero.nav.pushState();
    });
    
    Zotero.ui.updateDisabledControlButtons();
    
    Zotero.ui.libraryBreadcrumbs();
    
    Zotero.ui.createOnActivePage(el);
};

/**
 * Build a pagination object necessary to figure out ranges and links
 * @param  {Zotero_Feed} feed    feed object being paginated
 * @param  {string} pageVar page variable used in url
 * @param  {object} config  config used to fetch feed being paginated
 * @return {object}
 */
Zotero.ui.createPagination = function(feed, pageVar, config){
    
    //set relevant config vars to find pagination values
    var page = parseInt(Zotero.nav.getUrlVar(pageVar), 10) || 1;
    var start = parseInt(config.start, 10) || 0;
    var limit = parseInt(config.limit, 10) || 25;
    var totalResults = parseInt(feed.totalResults, 10);
    
    //figure out pagination values
    var lastDisplayed = start + limit;
    var prevPageNum = (page - 1);
    var nextPageNum = (page + 1);
    var lastPageNum = feed.lastPage;
    
    //build pagination object
    var pagination = {page:page};
    pagination.showFirstLink = start > 0;
    pagination.showPrevLink = start > 0;
    pagination.showNextLink = totalResults > lastDisplayed;
    pagination.showLastLink = totalResults > (lastDisplayed );
    
    var mutateOb = {};
    pagination.firstLink = Zotero.nav.mutateUrl(mutateOb, [pageVar]);
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

/**
 * Render and insert items table html into a container
 * @param  {Dom Element} el   Container
 * @param  {object} data Data object to pass to itemstableTemplate partial
 * @return {undefined}
 */
Zotero.ui.insertItemsTable = function(el, data){
    Z.debug("Zotero.ui.insertItemsTable", 3);
    Z.debug(data, 4);
    var a = J.tmpl('itemstableTemplate', data).appendTo(J(el));
    
    //need to test for inside initialized page or error is thrown
    if(Zotero.config.mobile && J(el).closest('.ui-page').length){
        //J(el).trigger('create');
        if(!(J(el).find('#field-list').hasClass('ui-listview'))) {
            J(el).find('#field-list').listview();
        }
        else{
            //J(el).find('#field-list').listview('refresh');
            J(el).find('#field-list').trigger('refresh');
        }
    }
    
};

/**
 * Render and insert the items pagination block into a container
 * @param  {Dom Element} el   Container
 * @param  {object} data Data object to pass to itempaginationTemplate partial
 * @return {undefined}
 */
Zotero.ui.insertItemsPagination = function(el, data){
    J.tmpl('itempaginationTemplate', data).appendTo(J(el));
    Zotero.ui.init.paginationButtons(data.pagination);
};

/**
 * Display and initialize an edit item form
 * @param  {Dom Element} el   Container
 * @param  {Zotero_Item} item Zotero Item object to associate with form
 * @return {undefined}
 */
Zotero.ui.editItemForm = function(el, item){
    Z.debug("Zotero.ui.editItemForm", 3);
    Z.debug(item, 4);
    var jel = J(el);
    if(item.itemType == 'note'){
        Z.debug("editItemForm - note", 3);
        jel.empty();
        J.tmpl('editnoteformTemplate', {item:item,
                                         itemKey:item.itemKey
                                         }).appendTo(jel);
                                         
        Zotero.ui.init.tinyMce('default');
        Zotero.ui.init.editButton();
    }
    else if(item.itemType == "attachment"){
        Z.debug("item is attachment", 4);
        jel.empty();
        var mode = Zotero.nav.getUrlVar('mode');
        J.tmpl('attachmentformTemplate', {item:item.apiObj,
                                    itemKey:item.itemKey,
                                    creatorTypes:[],
                                    mode:mode
                                    }).appendTo(jel);
        
        //add empty tag if no tags yet
        if(item.apiObj.tags.length === 0){
            Zotero.ui.addTag(false);
        }
        if(Zotero.config.mobile){
            Zotero.ui.init.editButton();
            J(el).trigger('create');
        }
        else{
            Zotero.ui.init.creatorFieldButtons();
            Zotero.ui.init.tagButtons();
            Zotero.ui.init.editButton();
        }
        Zotero.ui.init.tinyMce();
        
    }
    else{
        var p = item.getCreatorTypes(item.apiObj.itemType);
        p.done(J.proxy(function(){
            Z.debug("getCreatorTypes callback", 3);
            jel.empty();
            var mode = Zotero.nav.getUrlVar('mode');
            if(item.creators.length === 0){
                item.creators.push({creatorType: item.creatorTypes[item.itemType][0],
                                    first: '',
                                    last: ''
                                    });
                item.apiObj.creators = item.creators;
            }
            J.tmpl('itemformTemplate', {item:item.apiObj,
                                        itemKey:item.itemKey,
                                        creatorTypes:Zotero.Item.prototype.creatorTypes[item.apiObj.itemType],
                                        mode:mode
                                        }).appendTo(jel);
            
            //add empty tag if no tags yet
            if(item.apiObj.tags.length === 0){
                Zotero.ui.addTag(false);
            }
            if(Zotero.config.mobile){
                Zotero.ui.init.editButton();
                J(el).trigger('create');
            }
            else{
                Zotero.ui.init.creatorFieldButtons();
                Zotero.ui.init.tagButtons();
                Zotero.ui.init.editButton();
            }
        }, this));
    }
    
    //add autocomplete to existing tag fields
    J("input.taginput").autocomplete({
        source:function(request, callback){
            var library = Zotero.ui.getAssociatedLibrary(J(this.element.context).closest(".ajaxload"));
            var matchingTagStrings = Zotero.utils.prependAutocomplete(request.term, library.tags.plainList);
            callback(matchingTagStrings);
        },
        select: function(e, ui){
            e.preventDefault();
            e.stopImmediatePropagation();
            var value = ui.item.value;
            Zotero.ui.addTag();
        }
    });
};

/**
 * Get the Zotero Library associated with an element (generally a .ajaxload element)
 * @param  {Dom Element} el Dom element
 * @return {Zotero_Library}
 */
Zotero.ui.getAssociatedLibrary = function(el){
    Z.debug("Zotero.ui.getAssociatedLibrary", 3);
    var jel;
    if(typeof el == 'undefined'){
        jel = J("#library-items-div");
    }
    else {
        jel = J(el);
        if(jel.length === 0){
            jel = J("#library-items-div");
        }
    }
    
    //get Zotero.Library object if already bound to element
    var library = jel.data('zoterolibrary');
    if(!library){
        var loadConfig = jel.data('loadconfig');
        var libraryID = loadConfig.libraryID;
        var libraryType = loadConfig.libraryType;
        var libraryUrlIdentifier = loadConfig.libraryUrlIdentifier;
        if(Zotero.libraries[Zotero.utils.libraryString(libraryType, libraryID)]){
            library = Zotero.libraries[Zotero.utils.libraryString(libraryType, libraryID, libraryUrlIdentifier)];
        }
        else{
            library = new Zotero.Library(libraryType, libraryID, libraryUrlIdentifier);
            Zotero.libraries[Zotero.utils.libraryString(libraryType, libraryID)] = library;
        }
        jel.data('zoterolibrary', library);
    }
    return library;
};

/**
 * Empty conatiner and show preloader spinner
 * @param  {Dom Element} el   container
 * @param  {string} type type of preloader to show
 * @return {undefined}
 */
Zotero.ui.showSpinner = function(el, type){
    if(!type){
        J(el).html("<img class='spinner' src='/static/images/theme/broken-circle-spinner.gif'/>");
    }
    else if(type == 'horizontal'){
        J(el).html("<img class='spinner' src='/static/images/theme/broken-circle-spinner.gif'/>");
    }
};

/**
 * Append a preloader spinner to an element
 * @param  {Dom Element} el container
 * @return {undefined}
 */
Zotero.ui.appendSpinner = function(el){
    J(el).append("<img class='spinner' src='/static/images/theme/broken-circle-spinner.gif'/>");
};

//generate html for tags
/**
 * Display filtered list of tags
 * @param  {Dom element} el                 Container
 * @param  {Zotero_Tags} libtags            Zotero_Tags object
 * @param  {array} matchedTagStrings  tags that matched the filter string
 * @param  {array} selectedTagStrings tags that are currently selected
 * @return {undefined}
 */
Zotero.ui.displayTagsFiltered = function(el, libtags, matchedTagStrings, selectedTagStrings){
    Zotero.debug("Zotero.ui.displayTagsFiltered");
    Z.debug(selectedTagStrings, 4);
    var curPreString = J("#tag-filter-input").val();
    var jel = J(el);
    var showMore = jel.data('showmore');
    if(!showMore){
        showMore = false;
    }
    
    //jel.empty();
    var filteredTags = [];
    var selectedTags = [];
    J.each(matchedTagStrings, function(index, matchedString){
        if(libtags.tagObjects[matchedString] && (J.inArray(matchedString, selectedTagStrings) == (-1))) {
            filteredTags.push(libtags.tagObjects[matchedString]);
        }
    });
    J.each(selectedTagStrings, function(index, selectedString){
        if(libtags.tagObjects[selectedString]){
            selectedTags.push(libtags.tagObjects[selectedString]);
        }
    });
    
    //Z.debug('filteredTags:');
    //Z.debug(filteredTags);
    //Z.debug('selectedTags:');
    //Z.debug(selectedTags);
    
    var passTags;
    if(!showMore){
        passTags = filteredTags.slice(0, 25);
        J("#show-more-tags-link").show();
        J("#show-less-tags-link").hide();
    }
    else{
        passTags = filteredTags;
        J("#show-more-tags-link").hide();
        J("#show-less-tags-link").show();
    }
    
    var tagListEl = J("#tags-list").empty();
    J("#selected-tags-list").replaceWith(J.tmpl('tagunorderedlistTemplate', {tags:selectedTags, id:'selected-tags-list'}));
    J("#tags-list").replaceWith(J.tmpl('tagunorderedlistTemplate', {tags:passTags, id:'tags-list'}));
    
};

/**
 * Render and display full item details into an element
 * @param  {Zotero_Item} item Zotero Item to display
 * @param  {Dom Element} el   Container
 * @return {undefined}
 */
Zotero.ui.loadItemDetail = function(item, el){
    Z.debug("Zotero.ui.loadItemDetail", 3);
    var jel = J(el);
    jel.empty();
    //Z.debug(item, 4);
    var parentUrl = false;
    if(item.parentKey){
        parentUrl = item.owningLibrary.websiteUrl({itemKey:item.parentKey});
    }
    Z.debug(1);
    if(item.itemType == "note"){
        Z.debug("note item", 3);
        J.tmpl('itemnotedetailsTemplate', {item:item, parentUrl:parentUrl}).appendTo(jel);
    }
    else{
        Z.debug("non-note item", 3);
        J.tmpl('itemdetailsTemplate', {item:item, parentUrl:parentUrl}).appendTo(jel).trigger('create');
    }
    Z.debug(2);
    Zotero.ui.init.tinyMce('readonly');
    Zotero.ui.init.editButton();
    Zotero.ui.init.detailButtons();
    
    Zotero.ui.libraryBreadcrumbs();
    
    try{
        //trigger event for Zotero translator detection
        var ev = document.createEvent('HTMLEvents');
        ev.initEvent('ZoteroItemUpdated', true, true);
        document.dispatchEvent(ev);
    }
    catch(e){
        Zotero.debug("Error triggering ZoteroItemUpdated event");
    }
};

/**
 * Format an item field for display
 * @param  {string} field item field name
 * @param  {Zotero_Item} item  Zotero Item
 * @param  {boolean} trim  Trim output to limit length
 * @return {string}
 */
Zotero.ui.formatItemField = function(field, item, trim){
    if(typeof trim == 'undefined'){
        trim = false;
    }
    var trimLength = 0;
    var formattedString = '';
    var date;
    if(Zotero.config.maxFieldSummaryLength[field]){
        trimLength = Zotero.config.maxFieldSummaryLength[field];
    }
    switch(field){
        case "itemType":
            formattedString = Zotero.localizations.typeMap[item['itemType']];
            break;
        case "dateModified":
            if(!item['dateModified']){
                formattedString = '';
            }
            date = Zotero.utils.parseApiDate(item['dateModified']);
            if(date){
                formattedString = Globalize.format(date, 'd') + ' ' + Globalize.format(date, 't');
            }
            else{
                formattedString = item['dateModified'];
            }
            formattedString = date.toLocaleString();
            break;
        case "dateAdded":
            if(!item['dateAdded']){
                formattedString = '';
            }
            date = Zotero.utils.parseApiDate(item['dateAdded']);
            if(date){
                formattedString = Globalize.format(date, 'd') + ' ' + Globalize.format(date, 't');
            }
            else{
                formattedString = item['dateAdded'];
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
            if(typeof(item[field]) !== "undefined"){
                formattedString = item[field];
            }
            else if(item.apiObject){
                if(item.apiObject[field]){
                    formattedString = item.apiObject[field];
                }
            }
            else if(item.contentRows){
                J.each(item.contentRows, function(rowI, row){
                    if(row.field === field){
                        formattedString = row.fieldValue;
                    }
                });
            }
    }
    if(trim && (trimLength > 0) && (formattedString.length > trimLength) ) {
        return formattedString.slice(0, trimLength) + '…';
    }
    else{
        return formattedString;
    }
};

/**
 * Trim string to specified length and add ellipsis
 * @param  {string} s      string to trim
 * @param  {int} maxlen maximum length to allow for string
 * @return {string}
 */
Zotero.ui.trimString = function(s, maxlen){
    var trimLength = 35;
    var formattedString = s;
    if(maxlen){
        trimLength = maxlen;
    }
    if((trimLength > 0) && (formattedString.length > trimLength) ) {
        return formattedString.slice(0, trimLength) + '…';
    }
    else{
        return formattedString;
    }
};

/**
 * Format a date field from a Zotero Item based on locale
 * @param  {string} field field name to format
 * @param  {Zotero_Item} item  Zotero Item owning the field
 * @return {string}
 */
Zotero.ui.formatItemDateField = function(field, item){
    var date;
    switch(field){
        case "dateModified":
            if(!item['dateModified']){
                return '';
            }
            date = Zotero.utils.parseApiDate(item['dateModified']);
            if(date){
                return "<span class='localized-date-span'>" + Globalize.format(date, 'd') + "</span> <span class='localized-date-span'>" + Globalize.format(date, 't') + "</span>";
            }
            else{
                return item['dateModified'];
            }
            return date.toLocaleString();
        case "dateAdded":
            if(!item['dateAdded']){
                return '';
            }
            date = Zotero.utils.parseApiDate(item['dateAdded']);
            if(date){
                return "<span class='localized-date-span'>" + Globalize.format(date, 'd') + "</span> <span class='localized-date-span'>" + Globalize.format(date, 't') + "</span>";
            }
            else{
                return item['dateAdded'];
            }
            break;
    }
    return '';
};

/**
 * Format a content row from a Zotero Item for display
 * @param  {string} contentRow contenteRow name
 * @return {string}
 */
Zotero.ui.formatItemContentRow = function(contentRow){
    if(contentRow.field == 'date'){
        if(!contentRow.fieldValue){return '';}
        var date = Zotero.utils.parseApiDate(contentRow.value);
        if(!date){
            return contentRow.fieldValue;
        }
        else{
            return date.toLocaleString();
        }
    }
    else{
        return contentRow.fieldValue;
    }
};

Zotero.ui.userGroupsDisplay = function(groups){
    var html = '';
    J.each(groups.groupsArray, function(index, group){
        html += Zotero.ui.groupNugget(group);
    });
    return html;
};

Zotero.ui.groupTypeMap = {'Private': 'Private',
                   'PublicOpen': 'Public, Open Membership',
                   'PublicClosed': 'Public, Closed Membership'};
                   
Zotero.ui.groupAccessMap = {
                    'all'     : {'members' : 'Anyone can view, only members can edit',
                                       'admins'  : 'Anyone can view, only admins can edit'},
                    'members' : {'members' : 'Only members can view and edit',
                                       'admins'  : 'Only members can view, only admins can edit'},
                    'admins'  : {'members' : 'Only admins can view, only members can edit',
                                       'admins'  : 'Only admins can view and edit'}
                    };

Zotero.ui.groupUrl = function(group, route){
    var groupBase;
    if(group.groupType == 'Private'){
        groupBase = '/groups/' + group.groupID;
    }
    else{
        groupBase = '/groups/' + Zotero.utils.slugify(group.groupName);
    }
    var groupIDBase = '/groups/' + group.groupID;
    Zotero.debug("groupBase: " + groupBase);
    switch(route){
        case 'groupView':
            return groupBase;
        case 'groupLibrary':
            return groupBase + '/items';
        case 'groupSettings':
            return groupIDBase + '/settings';
        case 'groupMembers':
            return groupIDBase + '/members';
        case 'groupLibrarySettings':
            return groupIDBase + '/settings/library';
        case 'groupMembersSettings':
            return groupIDBase + '/settings/members';
    }
};

/**
 * Update the page's breadcrumbs based on the current state
 * @param  {Zotero_Library} library current Zotero Library
 * @param  {object} config  Current config object being displayed
 * @return {undefined}
 */
Zotero.ui.libraryBreadcrumbs = function(library, config){
    Z.debug('Zotero.ui.libraryBreadcrumbs', 3);
    try{
    var breadcrumbs;
    if(!library){
        library = Zotero.ui.getAssociatedLibrary(J("#feed-link-div"));
    }
    if(!config){
        config = Zotero.nav.getUrlVars();
    }
    Z.debug(config, 4);
    if(library.libraryType == 'user'){
        breadcrumbs = [{label:'Home', path:'/'},
                           {label:'People', path:'/people'},
                           {label:(library.libraryLabel || library.libraryUrlIdentifier), path:'/' + library.libraryUrlIdentifier},
                           {label:'Library', path:'/' + library.libraryUrlIdentifier + '/items'}];
    }
    else{
        breadcrumbs = [{label:'Home', path:'/'},
                           {label:'Groups', path:'/groups'},
                           {label:(library.libraryLabel || library.libraryUrlIdentifier), path:'/groups/' + library.libraryUrlIdentifier},
                           {label:'Library', path:'/groups/' + library.libraryUrlIdentifier + '/items'}];
    }
    if(config.collectionKey){
        Z.debug("have collectionKey", 4);
        if(library.collections[config.collectionKey]){
            breadcrumbs.push({label:library.collections[config.collectionKey]['name'], path:Zotero.nav.buildUrl({collectionKey:config.collectionKey})});
        }
    }
    if(config.itemKey){
        Z.debug("have itemKey", 4);
        breadcrumbs.push({label:library.items.getItem(config.itemKey).title, path:Zotero.nav.buildUrl({collectionKey:config.collectionKey, itemKey:config.itemKey})});
    }
    Z.debug(breadcrumbs, 4);
    J("#breadcrumbs").empty();
    J.tmpl('breadcrumbsTemplate', {breadcrumbs:breadcrumbs}).appendTo(J("#breadcrumbs"));
    var newtitle = J.tmpl('breadcrumbstitleTemplate', {breadcrumbs:breadcrumbs}).text();
    Zotero.nav.updateStateTitle(newtitle);
    Z.debug("done with breadcrumbs", 4);
    }
    catch(e){
        Zotero.debug("Error loading breadcrumbs", 2);
    }
    
};

/**
 * trigger create on actively displayed page (placeholder version of mobile function which actually does something)
 * @param  {Dom Element} el Active page element
 * @return {undefined}
 */
Zotero.ui.createOnActivePage = function(el){
    
};

/**
 * Trigger a ZoteroItemUpdated event on the document for zotero translators
 * @return {undefined}
 */
Zotero.ui.zoteroItemUpdated = function(){
    try{
        //trigger event for Zotero translator detection
        var ev = document.createEvent('HTMLEvents');
        ev.initEvent('ZoteroItemUpdated', true, true);
        document.dispatchEvent(ev);
    }
    catch(e){
        Zotero.debug("Error triggering ZoteroItemUpdated event");
    }
};



Zotero.ui.init = {};

//initialize ui
Zotero.ui.init.all = function(){
    J("#content").on('click', 'a.ajax-link', function(){
        Z.debug("ajax-link clicked with href " + J(this).attr('href'), 3);
        Z.debug("pathname " + this.pathname, 4);
        var pathvars = Zotero.nav.parsePathVars(this.pathname);
        Zotero.nav.urlvars.pathVars = pathvars;
        Zotero.nav.pushState();
        return false;
    });
    
    if(Zotero.config.mobile){
        Zotero.ui.init.mobile();
    }
    
    //run UI initialization based on what page we're on
    Z.debug("ui init based on page", 3);
    switch(Zotero.config.pageClass){
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

Zotero.ui.init.library = function(){
    Z.debug("Zotero.ui.init.library", 3);
    Zotero.ui.init.fullLibrary();
    
    //initialize tinyMCE for textareas marked as tinyMce
    var hasTinyNoLinks = J('textarea.tinymce').filter('.nolinks').length;
    var hasTinyReadOnly = J('textarea.tinymce').filter('.readonly').length;
    var hasTinyDefault = J('textarea.tinymce').not('.nolinks').not('.readonly').length;
    if(hasTinyNoLinks){
        Zotero.ui.init.tinyMce('nolinks');
    }
    if(hasTinyReadOnly){
        Zotero.ui.init.tinyMce('readonly');
    }
    if(hasTinyDefault){
        Zotero.ui.init.tinyMce('default');
    }
    
};

//initialize all the widgets that make up the library
Zotero.ui.init.fullLibrary = function(){
    Z.debug('Zotero.ui.initFullLibrary', 3);
    
    if(J("#library").hasClass('ajaxload')){
        //full synced library - handle differently
        Zotero.ui.init.offlineLibrary();
        return;
    }
    Zotero.ui.init.libraryControls();
    Zotero.ui.init.tags();
    Zotero.ui.init.collections();
    Zotero.ui.init.items();
    Zotero.ui.init.feed();
    Zotero.ui.init.libraryTemplates();
};

//initialize the library control buttons
Zotero.ui.init.libraryControls = function(){
    Z.debug("Zotero.ui.initControls", 3);
    //set up control panel buttons
    /*
    var editCollectionsButtonsList = J(".edit-collections-buttons-div");
    if(!Zotero.config.mobile){
        editCollectionsButtonsList.buttonset().show();
    }
    else{
        editCollectionsButtonsList.controlgroup().show();
    }
    */
    //make edit toolbar buttons and menus
    J("#create-item-link").button({
        text:false,
        icons: {
            primary: "sprite-toolbar-item-add"
        }
    });
    J("#edit-collections-link").button({
        text:false,
        icons: {
            primary: "sprite-folder_edit",
            secondary: "ui-icon-triangle-1-s"
        }
    });
    
    J("#move-item-links-buttonset").buttonset();
    
    J(".add-to-collection-link").button({
        text:false,
        icons: {
            primary: "sprite-folder_add_to"
        }
    });
    J(".remove-from-collection-link").button({
        text:false,
        icons: {
            primary: "sprite-folder_remove_from"
        }
    });
    J(".move-to-trash-link").button({
        text:false,
        icons: {
            primary: "sprite-trash"
        }
    });
    J(".remove-from-trash-link").button({
        text:false,
        icons: {
            primary: "sprite-trash_remove"
        }
    });
    
    J("#edit-checkbox").button({
        text:false,
        icons: {
            primary: "sprite-page_edit"
        }
    });
    
    J("#cite-link").button({
        text:false,
        icons: {
            primary: "sprite-toolbar-cite"
        }
    });
    
    J("#export-link").button({
        text:false,
        icons: {
            primary: "sprite-toolbar-export"
        }
    });
    
    
    J("#library-settings-link").button({
        text:false,
        icons: {
            primary: "sprite-timeline_marker"
        }
    });
    
    //insert the hidden library preferences and set callbacks
    J("#library-settings-form").hide();
    //Z.config.librarySettingsInit = false;
    J("#control-panel-container").on('click', '#library-settings-link', Zotero.ui.callbacks.librarySettings);
    
    //set up addToCollection button to update list when collections are loaded
    J.subscribe("loadCollectionsDone", function(collections){
        Z.debug("loadCollectionsDone callback", 4);
    });
    
    //check/uncheck all boxes in items table when master checkbox is toggled
    J('#library-items-div').on('change', ".itemlist-editmode-checkbox.all-checkbox", function(e){
        J(".itemlist-editmode-checkbox").prop('checked', J(".itemlist-editmode-checkbox.all-checkbox").prop('checked'));
        Zotero.ui.updateDisabledControlButtons();
    });
    
    //init itemkey-checkbox to enable/disable buttons that require something being selected
    J('#library-items-div').on('change', "input.itemKey-checkbox", function(e){
        Zotero.ui.updateDisabledControlButtons();
    });
    
    //first run to initialize enabled/disabled state of contextually relevant control buttons
    Zotero.ui.updateDisabledControlButtons();
    
    //bind all control buttons to their callback functions
    J("#control-panel-container").on('change', "#edit-checkbox", Zotero.ui.callbacks.toggleEdit);
    J("#collection-list-div").on('click', ".create-collection-link", Zotero.ui.callbacks.createCollection);
    J("#collection-list-div").on('click', ".update-collection-link", Zotero.ui.callbacks.updateCollection);
    J("#collection-list-div").on('click', ".delete-collection-link", Zotero.ui.callbacks.deleteCollection);
    J("#control-panel-container").on('click', ".add-to-collection-link", Zotero.ui.callbacks.addToCollection);
    J("#control-panel-container").on('click', "#create-item-link", Zotero.ui.callbacks.createItem);
    J("#control-panel-container").on('click', ".remove-from-collection-link", Zotero.ui.callbacks.removeFromCollection);
    J("#control-panel-container").on('click', ".move-to-trash-link", Zotero.ui.callbacks.moveToTrash);
    J("#control-panel-container").on('click', ".remove-from-trash-link", Zotero.ui.callbacks.removeFromTrash);
    J("#item-details-div").on('click', ".move-to-trash-link", Zotero.ui.callbacks.moveToTrash);
    
    //disable default actions for dialog form submissions
    J("delete-collection-dialog").on('submit', ".delete-collection-div form", function(e){
        e.preventDefault();
    });
    J("update-collection-dialog").on('submit', ".update-collection-div form", function(e){
        e.preventDefault();
    });
    J("create-collection-dialog").on('submit', ".new-collection-div form", function(e){
        e.preventDefault();
    });
    /*
    //not sure why I'm doing this, so comment out and see if it breaks
    J( "button.create-collection-button").live('click', function(e){
        e.preventDefault();
    });
    J("button.update-collection-button").live('click', function(e){
        e.preventDefault();
    });
    */
   
    //set initial state of search input to url value
    if(Zotero.nav.getUrlVar('q')){
        J("#header-search-query").val(Zotero.nav.getUrlVar('q'));
    }
    //clear libary query param when field cleared
    var context = 'support';
    if(undefined !== window.zoterojsSearchContext){
        context = zoterojsSearchContext;
    }
    
    if((context == 'library') || (context == 'grouplibrary')){
        var clearQuery = function(e){
            Z.debug("header search changed");
            Z.debug(e);
            Z.debug('-' + J('#header-search-query').val());
            J("#header-search-query").val('');
            Z.debug("q is now empty");
            if(Zotero.nav.getUrlVar('q')){
                Z.debug("q in url is set");
                Zotero.nav.setUrlVar('q', '');
                Zotero.nav.pushState();
            }
        };
        J("#simple-search button.clear-field-button").on('click', clearQuery);
    }
};

//initialize pagination buttons
Zotero.ui.init.paginationButtons = function(pagination){
    J("#item-pagination-div .back-item-pagination").buttonset();
    J("#item-pagination-div .forward-item-pagination").buttonset();
    J("#start-item-link").button({
        text:false,
        icons: {
            primary: "ui-icon-seek-first"
        }
    });
    J("#prev-item-link").button({
        text:false,
        icons: {
            primary: "ui-icon-triangle-1-w"
        }
    });
    J("#next-item-link").button({
        text:false,
        icons: {
            primary: "ui-icon-triangle-1-e"
        }
    });
    J("#last-item-link").button({
        text:false,
        icons: {
            primary: "ui-icon-seek-end"
        }
    });
    if(pagination.showFirstLink === false) {
        J("#start-item-link").button('option', 'disabled', true);
    }
    if(pagination.showPrevLink === false) {
        J("#prev-item-link").button('option', 'disabled', true);
    }
    if(pagination.showNextLink === false) {
        J("#next-item-link").button('option', 'disabled', true);
    }
    if(pagination.showLastLink === false) {
        J("#last-item-link").button('option', 'disabled', true);
    }
};

Zotero.ui.init.collections = function(){
    Z.debug("Zotero.ui.initCollections", 3);
};

//initialize tags widget and related library features
Zotero.ui.init.tags = function(){
    Z.debug("Zotero.ui.initTags", 3);
    //send pref to website when showAllTags is toggled
    J("#tags-list-div").on('click', "#show-all-tags", function(e){
        var show = J(this).prop('checked') ? true : false;
        Z.debug("showAllTags is " + show, 4);
        Zotero.utils.setUserPref('library_showAllTags', show);
        Zotero.callbacks.loadTags(J("#tags-list-div"));
    });
    
    J("#tags-list-div").on('click', "#show-more-tags-link", function(e){
        e.preventDefault();
        var jel = J(this).closest('#tags-list-div');
        jel.data('showmore', true);
        Zotero.callbacks.loadTags(jel);
    });
    J("#tags-list-div").on('click', "#show-less-tags-link", function(e){
        e.preventDefault();
        var jel = J(this).closest('#tags-list-div');
        jel.data('showmore', false);
        Zotero.callbacks.loadTags(jel);
    });
    
    //add tag to item and stop event propogation when tag is selected
    //from autocomplete on an item
    J("#tags-list-div").on('keydown', ".taginput", function(e){
        if ( e.keyCode === J.ui.keyCode.ENTER ){
            e.preventDefault();
            if(J(this).val() !== ''){
                Zotero.ui.addTag();
                e.stopImmediatePropagation();
            }
        }
    });
    
    //bind tag autocomplete filter in tag widget
    J("#tags-list-div").on('keyup', "#tag-filter-input", function(e){
        Z.debug(J('#tag-filter-input').val(), 3);
        Z.debug("value:" + J('#tag-filter-input').val(), 4);
        var library = Zotero.ui.getAssociatedLibrary(J('#tag-filter-input').closest('.ajaxload'));
        var libraryTagsPlainList = library.tags.plainList;
        var matchingTagStrings = Zotero.utils.matchAnyAutocomplete(J('#tag-filter-input').val(), libraryTagsPlainList);
        Zotero.ui.displayTagsFiltered(J('#tags-list-div'), library.tags, matchingTagStrings, []);
        Z.debug(matchingTagStrings, 4);
    });
    
    //bind refresh link to pull down fresh set of tags until there is a better way to
    //check for updated/removed tags in API
    J("#tags-list-div").on('click', '#refresh-tags-link', function(e){
        e.preventDefault();
        var library = Zotero.ui.getAssociatedLibrary(J('#tag-filter-input').closest('.ajaxload'));
        Zotero.callbacks.loadTags(J("#tags-list-div"), false);
        return false;
    });
};

//initialize items widget and related features
Zotero.ui.init.items = function(){
    Z.debug("Zotero.ui.initItems", 3);
    J("#item-details-div").on('click', ".saveitembutton", Zotero.ui.saveItemCallback);
    J("#item-details-div").on('submit', ".itemDetailForm", Zotero.ui.saveItemCallback);
    J("#item-details-div").on('click', ".cancelitemeditbutton", function(){
        Zotero.nav.clearUrlVars(['itemKey', 'collectionKey', 'tag', 'q']);
        Zotero.nav.pushState();
    });
    
    J("#item-details-div").on('click', ".itemTypeSelectButton", function(){
        Z.debug("itemTypeSelectButton clicked", 3);
        var itemType = J("#itemType").val();
        Zotero.nav.urlvars.pathVars['itemType'] = itemType;
        Zotero.nav.pushState();
        return false;
    });
    J("#item-details-div").on('change', ".itemDetailForm #itemTypeSelect", function(){
        Z.debug("itemTypeSelect changed", 3);
        var itemType = J(this).val();
        Zotero.nav.urlvars.pathVars['itemType'] = itemType;
        Zotero.nav.pushState();
    });
    
    
    J("#item-details-div").on('keydown', ".itemDetailForm input", function(e){
        if ( e.keyCode === J.ui.keyCode.ENTER ){
            e.preventDefault();
            var nextEligibleSiblings = J(this).nextAll("input, button, textarea, select");
            if(nextEligibleSiblings.length){
                nextEligibleSiblings.first().focus();
            }
            else{
                J(this).closest("tr").nextAll().find("input, button, textarea, select").first().focus();
            }
        }
    });
    J("#item-details-div").on('click', ".add-tag-button", function(){
        Z.debug('add tag button clicked', 4);
        Zotero.ui.addTag();
        return false;
    });
    J("#item-details-div").on('click', ".add-tag-link", function(){
        Z.debug('add tag link clicked', 4);
        Zotero.ui.addTag();
        return false;
    });
    J("#item-details-div").on('click', ".remove-tag-link", function(){
        Z.debug('remove tag link clicked', 4);
        Zotero.ui.removeTag(J(this));
        return false;
    });
    J("#item-details-div").on('click', ".add-creator-link", function(){
        Z.debug('add creator button clicked', 4);
        Zotero.ui.addCreator(this);
        return false;
    });
    J("#item-details-div").on('click', ".remove-creator-link", function(){
        Z.debug('add creator button clicked', 4);
        Zotero.ui.removeCreator(this);
        return false;
    });
    
    J("#item-details-div").on('click', ".switch-two-field-creator-link", function(){
        Z.debug("switch two field creator clicked");
        var last, first;
        var name = J(this).closest('tr.creator').find("input[id$='_name']").val();
        var split = name.split(' ');
        if(split.length > 1){
            last = split.splice(-1, 1)[0];
            first = split.join(' ');
        }
        else{
            last = name;
            first = '';
        }
        
        var itemType = J(this).closest('form').find('select.itemType').val();
        var index = parseInt(J(this).closest('tr.creator').attr('id').substr(8), 10);
        var creatorType = J(this).closest('tr.creator').find("select#creator_" + index + "_creatorType").val();
        var jel = J(this).closest('tr').replaceWith(J.tmpl('authorelementsdoubleTemplate',
                                            {index:index,
                                            creator:{firstName:first, lastName:last, creatorType:creatorType},
                                            creatorTypes:Zotero.Item.prototype.creatorTypes[itemType]
                                            }));
        
        Zotero.ui.init.creatorFieldButtons();
        //Zotero.ui.createOnActivePage(J(this));
    });
    J("#item-details-div").on('click', ".switch-single-field-creator-link", function(){
        Z.debug("switch single field clicked");
        var name;
        var firstName = J(this).closest('div.creator-input-div').find("input[id$='_firstName']").val();
        var lastName = J(this).closest('div.creator-input-div').find("input[id$='_lastName']").val();
        name = firstName + " " + lastName;
        
        var itemType = J(this).closest('form').find('select.itemType').val();
        var index = parseInt(J(this).closest('tr.creator').attr('id').substr(8), 10);
        var creatorType = J(this).closest('tr.creator').find("select#creator_" + index + "_creatorType").val();
        var jel = J(this).closest('tr').replaceWith(J.tmpl('authorelementssingleTemplate',
                                            {index:index,
                                            creator:{name:name},
                                            creatorTypes:Zotero.Item.prototype.creatorTypes[itemType]
                                            }));
        
        Zotero.ui.init.creatorFieldButtons();
        //Zotero.ui.createOnActivePage(J(this));
    });
    J("#item-details-div").on('click', ".add-note-button", function(){
        Z.debug("add note button clicked", 3);
        Zotero.ui.addNote(this);
        return false;
    });
    
    //set up sorting on header clicks
    J("#library-items-div").on('click', ".field-table-header", function(){
        Z.debug(".field-table-header clicked", 3);
        var currentOrderField = Zotero.nav.getUrlVar('order') || Zotero.config.userDefaultApiArgs.order;
        var currentOrderSort = Zotero.nav.getUrlVar('sort') || Zotero.config.userDefaultApiArgs.sort || Zotero.config.sortOrdering[currentOrderField] || 'asc';
        var newOrderField = J(this).data('columnfield');
        var newOrderSort = Zotero.config.sortOrdering[newOrderField];
        
        //only allow ordering by the fields we have
        if(J.inArray(newOrderField, Zotero.Library.prototype.sortableColumns) == (-1)){
            return false;
        }
        
        //change newSort away from the field default if that was already the current state
        if(currentOrderField == newOrderField && currentOrderSort == newOrderSort){
            if(newOrderSort == 'asc'){
                newOrderSort = 'desc';
            }
            else{
                newOrderSort = 'asc';
            }
        }
        
        //problem if there was no sort column mapped to the header that got clicked
        if(!newOrderField){
            Zotero.ui.jsNotificationMessage("no order field mapped to column");
            return false;
        }
        
        //update the url with the new values
        Zotero.nav.urlvars.pathVars['order'] = newOrderField;
        Zotero.nav.urlvars.pathVars['sort'] = newOrderSort;
        Zotero.nav.pushState();
        
        //set new order as preference and save it to use www prefs
        Zotero.config.userDefaultApiArgs.sort = newOrderSort;
        Zotero.config.userDefaultApiArgs.order = newOrderField;
        Zotero.utils.setUserPref('library_defaultSort', newOrderField + ',' + newOrderSort);
    });
    
    //bind cite item link
    J("#item-details-div").on('click', "#cite-item-link", Zotero.ui.callbacks.citeItems);
    J("#build-bibliography-link").on('click', Zotero.ui.callbacks.citeItems);
    J("#cite-link").on('click', Zotero.ui.callbacks.citeItems);
    
    //bind export links
    J("#export-formats-div").on('click', ".export-link", Zotero.ui.callbacks.exportItems);
    J("#export-link").on('click', Zotero.ui.callbacks.showExportDialog);
    
    J("#export-dialog").on('click', '.export-link', Zotero.ui.callbacks.exportItems);
    
    //bind attachment upload link
    J("#item-details-div").on('click', "#upload-attachment-link", Zotero.ui.callbacks.uploadAttachment);
    
    //subscribe to event for item getting its first child so we can re-run getChildren
    J.subscribe('hasFirstChild', function(itemKey){
        var jel = J('#item-details-div');
        Zotero.ui.showChildren(jel, itemKey);
    });
};

Zotero.ui.init.creatorFieldButtons = function(){
    if(Zotero.config.mobile){
        Zotero.ui.createOnActivePage(J("tr.creator"));
        return;
    }
    
    J(".add-remove-creator-buttons-container").buttonset();
    J("a.switch-single-field-creator-link").button({
        text:false,
        icons: {
            primary: "sprite-textfield-single"
        }
    });
    J("a.switch-two-field-creator-link").button({
        text:false,
        icons: {
            primary: "sprite-textfield-dual"
        }
    });
    J("a.remove-creator-link").button({
        text:false,
        icons: {
            primary: "sprite-minus"
        }
    });
    J("a.add-creator-link").button({
        text:false,
        icons: {
            primary: "sprite-plus"
        }
    });
};

Zotero.ui.init.editButton = function(){
    Z.debug("Zotero.ui.init.editButton", 3);
    var editEl = J("#edit-checkbox");
    if(Zotero.nav.getUrlVar('mode') == 'edit'){
        editEl.prop('checked', true);
    }
    else{
        editEl.prop('checked', false);
    }
    editEl.button('refresh');
    if(!Zotero.nav.getUrlVar('itemKey')){
        editEl.button('option', 'disabled', true);
    }
    else{
        editEl.button('option', 'disabled', false);
    }
};

Zotero.ui.init.detailButtons = function(){
    Z.debug("Zotero.ui.init.detaButtons", 3);
    J("#upload-attachment-link").button();
    J("#cite-item-link").button();
};

Zotero.ui.init.tagButtons = function(){
    J(".add-remove-tag-container").buttonset();
    J(".remove-tag-link").button({
        text:false,
        icons: {
            primary: "sprite-minus"
        }
    });
    J(".add-tag-link").button({
        text:false,
        icons: {
            primary: "sprite-plus"
        }
    });
};

Zotero.ui.init.feed = function(){
    J("#export-section-title").bind('click', function(e){
        e.preventDefault();
        J("#export-list").slideToggle();
    });
    
};

//bind citation/bib links to launch citation dialog
/*Zotero.ui.init.citation = function(){
    Z.debug("Zotero.ui.init.citation");
    var launchCiteDialog = function(e){
        var library = Zotero.ui.getAssociatedLibrary(J(this));
        
        var itemKeys = Zotero.ui.getSelectedItemKeys(J("#edit-mode-items-form"));
        if(itemKeys.length === 0){
            itemKeys = Zotero.ui.getALlFormItemKeys(J("#edit-mode-items-form"));
        }
        
        var d = library.loadItemsBib(itemKey);
    };
    J("#item-details-div").on('click', '#show-citation-link', launchCiteDialog);
};
 */
Zotero.ui.init.tinyMce = function(type, autofocus, elements){
    if(!type){
        type = 'default';
    }
    var mode = 'specific_textareas';
    if(elements){
        mode = 'exact';
    }
    else{
        elements = '';
    }
    
    Z.debug("tinyMce config of type: " + type, 3);
    
    var tmceConfig = {
        //script_url : '/static/library/tinymce_jquery/jscripts/tiny_mce/tiny_mce.js',
        mode : mode,
        elements:elements,
        theme: "advanced",
        //plugins : "pagebreak,style,layer,table,save,advhr,advimage,advlink,emotions,iespell,inlinepopups,insertdatetime,preview,media,searchreplace,print,contextmenu,paste,directionality,fullscreen,visualchars,nonbreaking,xhtmlxtras,template",
        //plugins : "pagebreak,style,layer,table,advhr,advimage,advlink,preview,searchreplace,paste",
        
        theme_advanced_toolbar_location : "top",
        theme_advanced_buttons1 : "bold,italic,underline,strikethrough,separator,sub,sup,separator,forecolorpicker,backcolorpicker,separator,blockquote,separator,link,unlink",
        theme_advanced_buttons2 : "formatselect,separator,justifyleft,justifycenter,justifyright,separator,bullist,numlist,outdent,indent,separator,removeformat,code,",
        theme_advanced_buttons3 : "",
        theme_advanced_toolbar_align : "left",
        theme_advanced_statusbar_location: 'bottom',
        theme_advanced_resizing: true,
        relative_urls: false,
        //width: '500',
        //height: '300',
        editor_selector: 'default'
    };
    
    if(autofocus){
        tmceConfig.init_instance_callback = function(inst){
            console.log("inited " + inst.editorId);
            inst.focus();
        };
    }
    
    if(type != 'nolinks'){
        tmceConfig.theme_advanced_buttons1 += ',link';
    }
    
    if(type == 'nolinks'){
        tmceConfig.editor_selector = 'nolinks';
    }
    
    if(type == 'readonly'){
        tmceConfig.readonly = 1;
        tmceConfig.editor_selector = 'readonly';
    }
    
    tinymce.init(tmceConfig);
    return tmceConfig;
};

Zotero.ui.init.libraryTemplates = function(){
    J('#tagrowTemplate').template('tagrowTemplate');
    J('#tagslistTemplate').template('tagslistTemplate');
    J('#collectionlistTemplate').template('collectionlistTemplate');
    J('#collectionrowTemplate').template('collectionrowTemplate');
    J('#itemrowTemplate').template('itemrowTemplate');
    J('#itemstableTemplate').template('itemstableTemplate');
    J('#itempaginationTemplate').template('itempaginationTemplate');
    J('#itemdetailsTemplate').template('itemdetailsTemplate');
    J('#itemnotedetailsTemplate').template('itemnotedetailsTemplate');
    J('#itemformTemplate').template('itemformTemplate');
    J('#citeitemformTemplate').template('citeitemformTemplate');
    J('#attachmentformTemplate').template('attachmentformTemplate');
    J('#attachmentuploadTemplate').template('attachmentuploadTemplate');
    J('#datafieldTemplate').template('datafieldTemplate');
    J('#editnoteformTemplate').template('editnoteformTemplate');
    J('#itemtagTemplate').template('itemtagTemplate');
    J('#itemtypeselectTemplate').template('itemtypeselectTemplate');
    J('#authorelementssingleTemplate').template('authorelementssingleTemplate');
    J('#authorelementsdoubleTemplate').template('authorelementsdoubleTemplate');
    J('#childitemsTemplate').template('childitemsTemplate');
    J('#editcollectionbuttonsTemplate').template('editcollectionbuttonsTemplate');
    J('#choosecollectionformTemplate').template('choosecollectionformTemplate');
    J('#breadcrumbsTemplate').template('breadcrumbsTemplate');
    J('#breadcrumbstitleTemplate').template('breadcrumbstitleTemplate');
    J('#newcollectionformTemplate').template('newcollectionformTemplate');
    J('#updatecollectionformTemplate').template('updatecollectionformTemplate');
    J('#deletecollectionformTemplate').template('deletecollectionformTemplate');
    J('#tagunorderedlistTemplate').template('tagunorderedlistTemplate');
    J('#librarysettingsTemplate').template('librarysettingsTemplate');
    J('#addtocollectionformTemplate').template('addtocollectionformTemplate');
    J('#exportformatsTemplate').template('exportformatsTemplate');
    
};



//callbacks for UI interactions
/**
 * Toggle library edit mode when edit button clicked
 * @param  {event} e click event
 * @return {boolean}
 */
Zotero.ui.callbacks.toggleEdit =  function(e){
    Z.debug("edit checkbox toggled", 3);
    if(J(this).prop('checked')){
        Z.debug("has val: " + J(this).val());
        Zotero.nav.urlvars.pathVars['mode'] = 'edit';
    }
    else{
        Z.debug("removing edit mode", 3);
        delete Zotero.nav.urlvars.pathVars['mode'];
    }
    Zotero.nav.pushState();
    return false;
};

/**
 * Launch create collection dialog when create-collection-link clicked
 * Default to current collection as parent of new collection, but allow change
 * @param  {event} e click even
 * @return {boolean}
 */
Zotero.ui.callbacks.createCollection = function(e){
    Z.debug("create-collection-link clicked", 3);
    Z.debug(J(this));
    var library = Zotero.ui.getAssociatedLibrary(J(this).closest(".ajaxload"));
    var ncollections = library.collections.nestedOrderingArray();
    var dialogEl = J("#create-collection-dialog").empty();
    if(Zotero.config.mobile){
        J("#newcollectionformTemplate").tmpl({ncollections:ncollections}).replaceAll(dialogEl);
    }
    else{
        J("#newcollectionformTemplate").tmpl({ncollections:ncollections}).appendTo(dialogEl);
    }
    
    var currentCollectionKey = Zotero.nav.getUrlVar('collectionKey');
    J("#new-collection-parent").val(currentCollectionKey);
    
    var createFunction = J.proxy(function(){
        var parentCollectionKey = J("#new-collection-parent").val();
        //var selectedCollectionKey = J("a.current-collection").data("collectionkey") || '';
        var newCollectionTitle = J("input#new-collection-title-input").val() || "Untitled";
        var library = Zotero.ui.getAssociatedLibrary(J(this).closest('div.ajaxload'));
        
        var d = library.addCollection(newCollectionTitle, parentCollectionKey);
        d.done(J.proxy(function(){
            //Zotero.nav.forceReload = true;//delete Zotero.nav.urlvars.pathVars['mode'];
            library.collections.dirty = true;
            Zotero.nav.pushState(true);
        }, this));
        Zotero.ui.closeDialog(J("#create-collection-dialog"));
        //J("#create-collection-dialog").dialog("close");
    },this);
    
    Zotero.ui.dialog(J('#create-collection-dialog'), {
        modal:true,
        buttons: {
            'Create': createFunction,
            'Cancel': function(){
                Zotero.ui.closeDialog(J("#create-collection-dialog"));
                //J("#create-collection-dialog").dialog("close");
            }
        }
    });
    //Zotero.ui.dialog(J("#create-collection-dialog"));
    //J("#create-collection-dialog").dialog();
    var width = J("#new-collection-parent").width() + 50;
    J("#create-collection-dialog").dialog('option', 'width', width);
    return false;
};

/**
 * Launch edit collection dialog when update-collection-link clicked
 * @param  {event} e click event
 * @return {boolean}
 */
Zotero.ui.callbacks.updateCollection =  function(e){
    Z.debug("update-collection-link clicked", 3);
    e.preventDefault();
    e.stopImmediatePropagation();
    
    var library = Zotero.ui.getAssociatedLibrary(J(this).closest(".ajaxload"));
    var ncollections = library.collections.nestedOrderingArray();
    var dialogEl = J("#modify-collection-dialog").empty();
    
    if(Zotero.config.mobile){
        J("#updatecollectionformTemplate").tmpl({ncollections:ncollections}).replaceAll(dialogEl);
    }
    else{
        J("#updatecollectionformTemplate").tmpl({ncollections:ncollections}).appendTo(dialogEl);
    }
    
    var currentCollectionKey = Zotero.nav.getUrlVar('collectionKey');
    var currentCollection = library.collections[currentCollectionKey];
    var currentParentCollectionKey = currentCollection.parent;
    J("#update-collection-parent-select").val(currentParentCollectionKey);
    J("#updated-collection-title-input").val(library.collections[currentCollectionKey].title);
    
    var saveFunction = J.proxy(function(){
        var newCollectionTitle = J("input#updated-collection-title-input").val() || "Untitled";
        var newParentCollectionKey = J("#update-collection-parent-select").val();
        
        var collection =  currentCollection;//library.collections[collectionKey];
        if(!collection){
            Zotero.ui.jsNotificationMessage("Selected collection not found", 'error');
            return false;
        }
        var d = collection.update(newCollectionTitle, newParentCollectionKey);
        d.done(J.proxy(function(){
            Zotero.ui.jsNotificationMessage("Collection Saved", 'confirm');
            library.collections.dirty = true;
            Zotero.nav.pushState(true);
            Zotero.ui.closeDialog(J("#modify-collection-dialog"));
            //J("#modify-collection-dialog").dialog("close");
        }, this));
        Zotero.ui.closeDialog(J("#modify-collection-dialog"));
        //J("#modify-collection-dialog").dialog("close");
    }, this);
    
    Zotero.ui.dialog(J("#modify-collection-dialog"), {
        modal:true,
        buttons: {
            'Save': saveFunction,
            'Cancel': function(){
                Zotero.ui.closeDialog(J("#modify-collection-dialog"));
                //J("#create-collection-dialog").dialog("close");
            }
        }
    });
    
    var width = J("#update-collection-parent-select").width() + 50;
    J("#modify-collection-dialog").dialog('option', 'width', width);
    J("#updated-collection-title-input").select();
    return false;
};

/**
 * launch delete collection dialog when delete-collection-link clicked
 * default to currently selected collection, but allow switch before delete
 * @param  {event} e click event
 * @return {boolean}
 */
Zotero.ui.callbacks.deleteCollection =  function(e){
    Z.debug("delete-collection-link clicked", 3);
    e.preventDefault();
    e.stopImmediatePropagation();
    
    var library = Zotero.ui.getAssociatedLibrary(J(this).closest(".ajaxload"));
    var currentCollectionKey = Zotero.nav.getUrlVar('collectionKey');
    var currentCollection = library.collections[currentCollectionKey];
    var dialogEl = J("#delete-collection-dialog").empty();
    
    J("#delete-collection-dialog").empty().append("");
    if(Zotero.config.mobile){
        J("#deletecollectionformTemplate").tmpl({collection:currentCollection}).replaceAll(dialogEl);
    }
    else{
        J("#deletecollectionformTemplate").tmpl({collection:currentCollection}).appendTo(dialogEl);
    }
    
    J("#delete-collection-select").val(currentCollectionKey);
    
    var deleteFunction = J.proxy(function(){
        Z.debug("Zotero.ui.deleteSelectedCollection", 3);
        var collection = currentCollection;
        if(!collection){
            Zotero.ui.jsNotificationMessage("Selected collection not found", 'error');
            return false;
        }
        var d = collection.remove();
        //var d = library.addCollection(newCollectionTitle, selectedCollectionKey);
        d.done(J.proxy(function(){
            //delete Zotero.nav.urlvars.pathVars['mode'];
            delete Zotero.nav.urlvars.pathVars['collectionKey'];
            library.collections.dirty = true;
            Zotero.nav.pushState();
            Zotero.ui.jsNotificationMessage(collection.title + " removed", 'confirm');
        }, this));
        
        Zotero.ui.closeDialog(J("#delete-collection-dialog"));
        //J("#delete-collection-dialog").dialog("close");
        return false;
    }, this);
    
    Zotero.ui.dialog(J("#delete-collection-dialog"), {
        modal:true,
        buttons: {
            'Delete': deleteFunction,
            'Cancel': function(){
                Zotero.ui.closeDialog(J("#delete-collection-dialog"));
                //J("#create-collection-dialog").dialog("close");
            }
        }
    });
    
    return false;
};

/**
 * clear path vars and send to new item page with current collection when create-item-link clicked
 * @param  {event} e click event
 * @return {boolean}
 */
Zotero.ui.callbacks.createItem = function(e){
    Z.debug("create-item-Link clicked", 3);
    var collectionKey = Zotero.nav.getUrlVar('collectionKey');
    if(collectionKey){
        Zotero.nav.urlvars.pathVars = {action:'newItem', mode:'edit', 'collectionKey':collectionKey};
    }
    else{
        Zotero.nav.urlvars.pathVars = {action:'newItem', mode:'edit'};
    }
    Zotero.nav.pushState();
    return false;
};

Zotero.ui.callbacks.citeItems = function(e){
    Z.debug("cite-item-link clicked", 3);
    e.preventDefault();
    
    //get library and build dialog
    var library = Zotero.ui.getAssociatedLibrary();
    var dialogEl = J("#cite-item-dialog").empty();
    if(Zotero.config.mobile){
        J("#citeitemformTemplate").tmpl({}).replaceAll(dialogEl);
    }
    else{
        J("#citeitemformTemplate").tmpl({}).appendTo(dialogEl);
    }
    
    
    var citeFunction = function(){
        Z.debug("citeFunction", 3);
        Zotero.ui.showSpinner(J("#cite-box-div"));
        
        var style = J("#cite-item-select").val();
        Z.debug(style, 4);
        var itemKeys = Zotero.ui.getSelectedItemKeys(J("#edit-mode-items-form"));
        if(itemKeys.length === 0){
            itemKeys = Zotero.ui.getAllFormItemKeys(J("#edit-mode-items-form"));
        }
        Z.debug(itemKeys, 4);
        var d = library.loadFullBib(itemKeys, style);
        d.done(function(bibContent){
            J("#cite-box-div").html(bibContent);
        });
    };
    
    var width = J("#cite-item-select").width() + 150;
    if(!Zotero.config.mobile){
        width = J("#cite-item-select").width() + 300;
    }
    //J("#cite-item-dialog").dialog('option', 'width', width);
    
    Zotero.ui.dialog(J("#cite-item-dialog"), {
        modal:true,
        /*buttons: {
            'Show Citation': citeFunction,
            'Cancel': function(){
                Zotero.ui.closeDialog(J("#cite-item-dialog"));
                //J("#create-collection-dialog").dialog("close");
            }
        },*/
        width: width
    });
    
    J("#cite-item-select").on('change', citeFunction);
    
    Z.debug("done with Zotero.ui.callbacks.citeItems");
    return false;
};

Zotero.ui.callbacks.showExportDialog = function(e){
    Z.debug("export-link clicked", 3);
    
    //get library and build dialog
    var library = Zotero.ui.getAssociatedLibrary(J("#feed-link-div"));
    var dialogEl = J("#export-dialog").empty();
    if(Zotero.config.mobile){
        //J("#exportTemplate").tmpl({}).replaceAll(dialogEl);
        J("#export-dialog").empty().append(J("#export-list").contents().clone() );
    }
    else{
        //J("#exportTemplate").tmpl({}).appendTo(dialogEl);
        J("#export-dialog").empty().append(J("#export-list").contents().clone() );
    }
    
    var exportFunction = function(){
        Z.debug("exportFunction", 3);
    };
    
    Zotero.ui.dialog(J("#export-dialog"), {
        modal:true,
        buttons: {
            'Cancel': function(){
                Zotero.ui.closeDialog(J("#export-dialog"));
                //J("#create-collection-dialog").dialog("close");
            }
        }
    });
    
    Z.debug("done with Zotero.ui.callbacks.exportItems");
    return false;
};

Zotero.ui.callbacks.exportItems = function(e){
    Z.debug("cite-item-link clicked", 3);
    e.preventDefault();
    
    //get library
    var library = Zotero.ui.getAssociatedLibrary(J("#feed-link-div"));
    var urlconfig = J("#feed-link-div").data('urlconfig');
    var itemKeys = Zotero.ui.getSelectedItemKeys(J("#edit-mode-items-form"));
    var requestedFormat = J(this).data('exportformat');
    var exportConfig = J.extend(urlconfig, {'format':requestedFormat});
    Z.debug(exportConfig);
    //build link to export file with selected items
    var itemKeyString = itemKeys.join(',');
    if(itemKeyString !== ''){
        exportConfig['itemKey'] = itemKeyString;
    }
    
    var exportUrl = Zotero.ajax.apiRequestUrl(exportConfig) + Zotero.ajax.apiQueryString(exportConfig);
    window.open(exportUrl, '_blank');
};

Zotero.ui.callbacks.uploadAttachment = function(e){
    Z.debug("uploadAttachment", 3);
    e.preventDefault();
    
    var library = Zotero.ui.getAssociatedLibrary(J(this).closest(".ajaxload"));
    var dialogEl = J("#upload-attachment-dialog").empty();
    if(Zotero.config.mobile){
        J("#attachmentuploadTemplate").tmpl({}).replaceAll(dialogEl);
    }
    else{
        J("#attachmentuploadTemplate").tmpl({}).appendTo(dialogEl);
    }
    
    
    var uploadFunction = function(){
        Z.debug("uploadFunction", 3);
        var fileInfo = J("#attachmentuploadfileinfo").data('fileInfo');
        
        //show spinner while working on upload
        Zotero.ui.showSpinner(J('#fileuploadspinner'));
        
        //get template item
        //create attachment item
        var parentItemKey = Zotero.nav.getUrlVar('itemKey');
        var parentItem = library.items.getItem(parentItemKey);
        var item = new Zotero.Item();
        item.owningLibrary = library;
        item.libraryType = library.type;
        item.libraryID = library.libraryID;
        item.parentItemKey = parentItemKey;
        
        var templateItemDeferred = item.initEmpty('attachment', 'imported_file');
        templateItemDeferred.done(function(item){
            Z.debug("templateItemDeferred callback");
            //create child attachment item
            
            item.title = J("#upload-file-title-input").val();
            item.apiObj['title'] = item.title;
            console.log("new title: " + item.apiObj['title']);
            
            var jqxhr = item.writeItem();
            jqxhr.done(J.proxy(function(newItemKey){
                //get upload authorization for the actual file
                var userSetFilename = J("#upload-file-title-input").val() || fileInfo.filename;
                var uploadAuth = item.getUploadAuthorization({md5:fileInfo.md5, filename:userSetFilename, filesize:fileInfo.filesize, mtime:fileInfo.mtime, contentType:fileInfo.contentType, params:1});
                uploadAuth.done(function(data, textStatus, XMLHttpRequest){
                    Z.debug("uploadAuth callback", 3);
                    var upAuthOb;
                    Z.debug(data, 4);
                    if(typeof data == "string"){upAuthOb = JSON.parse(data);}
                    else{upAuthOb = data;}
                    if(upAuthOb.exists == 1){
                        Zotero.ui.closeDialog(J("#upload-attachment-dialog"));
                        //add to parent's children counter
                        parentItem.numChildren++;
                        //TODO: refresh attachments on item page (just pushstate?)
                        Zotero.nav.pushState(true);
                    }
                    else{
                        var filedata = J("#attachmentuploadfileinfo").data('fileInfo').reader.result;
                        var file = J("#attachmentuploadfileinfo").data('file');
                        var fullUpload = Zotero.file.uploadFile(upAuthOb, file);
                        fullUpload.done(function(){
                            Z.debug("fullUpload done", 3);
                            var regUpload = item.registerUpload(upAuthOb.uploadKey);
                            regUpload.done(function(){
                                Zotero.ui.closeDialog(J("#upload-attachment-dialog"));
                                //add to parent's children counter
                                parentItem.numChildren++;
                                //TODO: refresh attachments on item page (just pushstate?)
                                Zotero.nav.pushState(true);
                            }).fail(function(jqxhr, textStatus, e){
                                Z.debug("Upload registration failed - " + textStatus, 3);
                                Zotero.ui.jsNotificationMessage("Error registering upload", 'error');
                                if(jqxhr.status == 412){
                                    Z.debug("412 Precondition Failed on upload registration", 3);
                                    Zotero.ui.jsNotificationMessage("The file has changed remotely", 'error');
                                }
                                Zotero.ui.closeDialog(J("#upload-attachment-dialog"));
                            });
                        });
                        fullUpload.upload.onprogress = function(e){
                            Z.debug('fullUpload.upload.onprogress');
                            var percentLoaded = Math.round((e.loaded / e.total) * 100);
                            //setProgress(percentLoaded, percentLoaded == 100 ? 'Finalizing.' : 'Uploading.');
                            Z.debug("Upload progress event:" + e.loaded + " / " + e.total + " : " + percentLoaded + "%");
                            J("#uploadprogressmeter").val(percentLoaded);
                        };
                    }
                }).fail(function(jqxhr, textStatus, e){
                    Z.debug("Upload authorization failed - " + textStatus, 3);
                    Zotero.ui.jsNotificationMessage("Error getting upload authorization", 'error');
                    switch(jqxhr.status){
                        case 400:
                            Z.debug("400 Bad request on upload authorization");
                            Z.debug(jqxhr.responseText);
                            break;
                        case 403:
                            Z.debug("403 Access denied uploading attachment", 3);
                            Zotero.ui.jsNotificationMessage("You do not have permission to edit files", 'error');
                            break;
                        case 409:
                            Z.debug("409 Library locked uploading attachment", 3);
                            Zotero.ui.jsNotificationMessage("The library is currently locked. Please try again in a few minutes.", 'error');
                            break;
                        case 412:
                            //shouldn't happen here in full upload
                            Z.debug("412 Precondition failed uploading attachment", 3);
                            Zotero.ui.jsNotificationMessage("File conflict. Remote file has changed", 'error');
                            break;
                        case 413:
                            Z.debug("413 Too large uploading attachment", 3);
                            Zotero.ui.jsNotificationMessage("Requested upload would exceed storage quota.", 'error');
                            break;
                        case 428:
                            Z.debug("428 Precondition failed uploading attachment", 3);
                            Zotero.ui.jsNotificationMessage("Precondition required error", 'error');
                            break;
                        case 429:
                            Z.debug("429 Too many requests uploading attachment", 3);
                            Zotero.ui.jsNotificationMessage("Too many uploads pending. Please try again in a few minutes", 'error');
                            break;
                        
                    }
                    Zotero.ui.closeDialog(J("#upload-attachment-dialog"));
                });
            }));
        });
    };
    
    Zotero.ui.dialog(J("#upload-attachment-dialog"), {
        modal:true,
        buttons: {
            'Upload': uploadFunction,
            'Cancel': function(){
                Zotero.ui.closeDialog(J("#upload-attachment-dialog"));
                //J("#create-collection-dialog").dialog("close");
            }
        },
        width:350
    });
    
    var width = J("#fileuploadinput").width() + 50;
    J("#upload-attachment-dialog").dialog('option', 'width', width);
    
    var handleFiles = function(files){
        Z.debug("attachmentUpload handleFiles", 3);
        
        if(typeof files == 'undefined' || files.length === 0){
            return false;
        }
        var file = files[0];
        J("#attachmentuploadfileinfo").data('file', file);
        
        var fileinfo = Zotero.file.getFileInfo(file, function(fileInfo){
            J("#attachmentuploadfileinfo").data('fileInfo', fileInfo);
            J("#upload-file-title-input").val(fileInfo.filename);
            J("#attachmentuploadfileinfo .uploadfilesize").html(fileInfo.filesize);
            J("#attachmentuploadfileinfo .uploadfiletype").html(fileInfo.contentType);
            //J("#attachmentuploadfileinfo .uploadfilemd5").html(fileInfo.md5);
            J("#droppedfilename").html(fileInfo.filename);
        });
        return;
    };
    
    J("#fileuploaddroptarget").on('dragenter dragover', function(e){
        e.stopPropagation();
        e.preventDefault();
    });
    
    J("#fileuploaddroptarget").on('drop', function(je){
        Z.debug("fileuploaddroptarget drop callback", 3);
        je.stopPropagation();
        je.preventDefault();
        var e = je.originalEvent;
        var dt = e.dataTransfer;
        var files = dt.files;
        handleFiles(files);
    });
    
    J("#fileuploadinput").on('change', function(je){
        Z.debug("fileuploaddroptarget callback 1");
        je.stopPropagation();
        je.preventDefault();
        var files = J("#fileuploadinput").get(0).files;
        handleFiles(files);
    });
    
    return false;
};

/**
 * Move currently displayed single item or currently checked list of items
 * to the trash when move-to-trash link clicked
 * @param  {event} e click event
 * @return {boolean}
 */
Zotero.ui.callbacks.moveToTrash =  function(e){
    e.preventDefault();
    Z.debug('move-to-trash clicked', 3);
    var itemKeys = [];
    if(Zotero.nav.getUrlVar('itemKey')){
        //item pane, just trash this item
        itemKeys = [Zotero.nav.getUrlVar('itemKey')];
    }
    else{
        itemKeys = Zotero.ui.getSelectedItemKeys(J("#edit-mode-items-form"));
    }
    
    Z.debug(itemKeys, 3);
    
    var library = Zotero.ui.getAssociatedLibrary(J(this).closest('div.ajaxload'));
    var responses = [];
    
    //show spinner before making the possibly many the ajax requests
    Zotero.ui.showSpinner(J('#library-items-div'));
    
    if(Zotero.nav.getUrlVar('collectionKey') == 'trash'){
        //items already in trash. delete them
        J.each(itemKeys, function(index, itemKey){
            //make sure item is really trashed already
            var i = library.items.getItem(itemKey);
            if(i.apiObj.deleted == 1){
                var response = library.deleteItem(itemKey);
                responses.push(response);
            }
        });
    }
    else{
        J.each(itemKeys, function(index, itemKey){
            var response = library.trashItem(itemKey);
            responses.push(response);
        });
    }
    library.dirty = true;
    J.when.apply(J, responses).then(function(){
        //Zotero.nav.forceReload = true;//delete Zotero.nav.urlvars.pathVars['mode'];
        Zotero.nav.clearUrlVars(['collectionKey', 'tag', 'q']);
        //delete Zotero.nav.urlvars.pathVars['itemKey'];
        Zotero.nav.pushState(true);
    });
    return false;
};

/**
 * Remove currently displayed single item or checked list of items from trash
 * when remove-from-trash link clicked
 * @param  {event} e click event
 * @return {boolean}
 */
Zotero.ui.callbacks.removeFromTrash =  function(e){
    Z.debug('remove-from-trash clicked', 3);
    var itemKeys = [];
    if(Zotero.nav.getUrlVar('itemKey')){
        //item pane, just trash this item
        itemKeys = [Zotero.nav.getUrlVar('itemKey')];
    }
    else{
        itemKeys = Zotero.ui.getSelectedItemKeys(J("#edit-mode-items-form"));
    }
    
    Z.debug(itemKeys, 4);
    
    var library = Zotero.ui.getAssociatedLibrary(J(this).closest('div.ajaxload'));
    var responses = [];
    
    //show spinner before making the possibly many the ajax requests
    Zotero.ui.showSpinner(J('#library-items-div'));
    
    J.each(itemKeys, function(index, itemKey){
        //make sure item is really trashed already
        var i = library.items.getItem(itemKey);
        if(i.apiObj.deleted == 1){
            var response = library.untrashItem(itemKey);
            responses.push(response);
        }
    });
    
    library.dirty = true;
    J.when.apply(J, responses).then(function(){
        //Zotero.nav.forceReload = true;//delete Zotero.nav.urlvars.pathVars['mode'];
        Zotero.nav.clearUrlVars(['collectionKey', 'tag', 'q']);
        //delete Zotero.nav.urlvars.pathVars['itemKey'];
        Zotero.nav.pushState(true);
    });
    return false;
};

/**
 * Remove currently displaying item or currently selected items from current collection
 * @param  {event} e click event
 * @return {boolean}
 */
Zotero.ui.callbacks.removeFromCollection = function(e){
    Z.debug('remove-from-collection clicked', 3);
    var itemKeys = Zotero.ui.getSelectedItemKeys(J("#edit-mode-items-form"));
    var library = Zotero.ui.getAssociatedLibrary(J(this).closest('div.ajaxload'));
    var collectionKey = Zotero.nav.getUrlVar('collectionKey');
    var collection = library.collections[collectionKey];
    var responses = [];
    J.each(itemKeys, function(index, itemKey){
        var response = collection.removeItem(itemKey);
        responses.push(response);
    });
    library.dirty = true;
    J.when.apply(this, responses).then(function(){
        Z.debug('removal responses finished. forcing reload', 3);
        //Zotero.nav.forceReload = true;//delete Zotero.nav.urlvars.pathVars['mode'];
        Zotero.nav.clearUrlVars(['collectionKey', 'tag']);
        Zotero.nav.pushState(true);
    });
    return false;
};

/**
 * Add currently displaying item or currently selected items to a chosen collection
 * @param {event} e click event
 * @return {boolean}
 */
Zotero.ui.callbacks.addToCollection =  function(e){
    Z.debug("add-to-collection-link clicked", 3);
    e.preventDefault();
    var library = Zotero.ui.getAssociatedLibrary();
    var dialogEl = J("#add-to-collection-dialog").empty();
    Z.debug(library.collections.ncollections, 4);
    J("#addtocollectionformTemplate").tmpl({ncollections:library.collections.nestedOrderingArray()}).appendTo(dialogEl);
    
    var addToFunction = J.proxy(function(){
        Z.debug("add-to-collection-select changed", 3);
        var targetCollection = J("#target-collection").val();
        Z.debug("move to: " + targetCollection, 4);
        Zotero.ui.addToCollection(targetCollection, library);
        Zotero.ui.closeDialog(J("#add-to-collection-dialog"));
        return false;
    }, this);
    
    Zotero.ui.dialog(J("#add-to-collection-dialog"), {
        modal:true,
        buttons: {
            'Add': addToFunction,
            'Cancel': function(){
                J("#add-to-collection-dialog").dialog("close");
            }
        }
    });
    
    var width = J("#target-collection").width() + 50;
    J("#add-to-collection-dialog").dialog('option', 'width', width);
    
    return false;
};

/**
 * Launch library settings dialog (currently just row selection)
 * @param  {event} e click event
 * @return {boolean}
 */
Zotero.ui.callbacks.librarySettings = function(e){
    Z.debug("library-settings-link clicked", 3);
    e.preventDefault();
    //if(Z.config.librarySettingsInit == false){
    var dialogEl = J("#library-settings-dialog").empty();
    J("#librarysettingsTemplate").tmpl({'columnFields':Zotero.Library.prototype.displayableColumns}).appendTo(dialogEl);
    
    J("#display-column-field-title").prop('checked', true).prop('disabled', true);
    J.each(Zotero.prefs.library_listShowFields, function(index, value){
        var idstring = '#display-column-field-' + value;
        J(idstring).prop('checked', true);
    });
    
    var submitFunction = J.proxy(function(){
        var showFields = [];
        J("#library-settings-form").find('input:checked').each(function(){
            showFields.push(J(this).val());
        });
        var stringShowFields = showFields.join(',');
        Zotero.utils.setUserPref('library_listShowFields', stringShowFields);
        Zotero.prefs.library_listShowFields = showFields;
        Zotero.callbacks.loadItems(J("#library-items-div"));
        //J("#library-settings-dialog").dialog("close");
        Zotero.ui.closeDialog(J("#library-settings-dialog"));
    }, this);
    
    Zotero.ui.dialog(J("#library-settings-dialog"), {
        modal:true,
        buttons: {
            'Save': submitFunction,
            'Cancel': function(){
                Zotero.ui.closeDialog(J("#library-settings-dialog"));
            }
        }
    });
};

/**
 * Change sort/order arguments when a table header is clicked
 * @param  {event} e click event
 * @return {boolean}
 */
Zotero.ui.callbacks.sortBy = function(e){
    Z.debug("sort by link clicked", 3);
    e.preventDefault();
    
    var currentOrderField = Zotero.nav.getUrlVar('order') || Zotero.config.userDefaultApiArgs.order;
    var currentOrderSort = Zotero.nav.getUrlVar('sort') || Zotero.config.sortOrdering[currentOrderField] || 'asc';
    
    var dialogEl = J("#sort-dialog");
    J("#sortdialogTemplate").tmpl({'columnFields':Zotero.Library.prototype.displayableColumns, currentOrderField:currentOrderField}).replaceAll(dialogEl);
    
    var submitFunction = J.proxy(function(){
        Z.debug("Zotero.ui.callbacks.sortBy submit callback");
        
        var currentOrderField = Zotero.nav.getUrlVar('order') || Zotero.config.userDefaultApiArgs.order;
        var currentOrderSort = Zotero.nav.getUrlVar('sort') || Zotero.config.userDefaultApiArgs.sort || Zotero.config.sortOrdering[currentOrderField] || 'asc';
        var newOrderField = J("#sortColumnSelect").val();
        var newOrderSort = J("#sortOrderSelect").val() || Zotero.config.sortOrdering[newOrderField];
        
        
        //only allow ordering by the fields we have
        if(J.inArray(newOrderField, Zotero.Library.prototype.sortableColumns) == (-1)){
            return false;
        }
        
        //change newSort away from the field default if that was already the current state
        if(currentOrderField == newOrderField && currentOrderSort == newOrderSort){
            if(newOrderSort == 'asc'){
                newOrderSort = 'desc';
            }
            else{
                newOrderSort = 'asc';
            }
        }
        
        //problem if there was no sort column mapped to the header that got clicked
        if(!newOrderField){
            Zotero.ui.jsNotificationMessage("no order field mapped to column");
            return false;
        }
        
        //update the url with the new values
        Zotero.nav.urlvars.pathVars['order'] = newOrderField;
        Zotero.nav.urlvars.pathVars['sort'] = newOrderSort;
        Zotero.nav.pushState();
        
        //set new order as preference and save it to use www prefs
        Zotero.config.userDefaultApiArgs.sort = newOrderSort;
        Zotero.config.userDefaultApiArgs.order = newOrderField;
        Zotero.utils.setUserPref('library_defaultSort', newOrderField + ',' + newOrderSort);
        
        Zotero.ui.closeDialog(J("#sort-dialog"));
        
    }, this);
    
    Zotero.ui.dialog(J("#sort-dialog"), {
        modal:true,
        buttons: {
            'Save': submitFunction,
            'Cancel': function(){
                Zotero.ui.closeDialog(J("#sort-dialog"));
            }
        }
    });
};



Zotero.url.itemHref = function(item){
    var href = '';
    /*
    J.each(item.links, function(index, link){
        if(link.rel === "alternate"){
            if(link.href){
                href = link.href;
            }
        }
    });
    return href;
    */
    var library = item.owningLibrary;
    href += library.libraryBaseWebsiteUrl + '/itemKey/' + item.itemKey;
    return href;
};

Zotero.url.attachmentDownloadLink = function(item){
    var retString = '';
    if(item.links['enclosure']){
        var tail = item.links['enclosure']['href'].substr(-4, 4);
        if(tail == 'view'){
            //snapshot: redirect to view
            retString += '<a href="' + Zotero.config.baseWebsiteUrl + Zotero.config.nonparsedBaseUrl + '/' + item.itemKey + '/file/view' + '">' + 'View Snapshot</a>';
            
            //retString += '<form style="margin:0;" method="POST" action="' + item.links['enclosure']['href'] + '?key=' + Zotero.config.apiKey + '">(<input type="hidden" name="h" value="1" /><a href="#" onclick="parentNode.submit()">' + item.title + '</a>)</form>';
        }
        else{
            //file: offer download
            var enctype = Zotero.utils.translateMimeType(item.links['enclosure'].type);
            var enc = item.links['enclosure'];
            var filesize = parseInt(enc['length'], 10);
            var filesizeString = "" + filesize + " B";
            if(filesize > 1073741824){
                filesizeString = "" + (filesize / 1073741824).toFixed(1) + " GB";
            }
            else if(filesize > 1048576){
                filesizeString = "" + (filesize / 1048576).toFixed(1) + " MB";
            }
            else if(filesize > 1024){
                filesizeString = "" + (filesize / 1024).toFixed(1) + " KB";
            }
            Z.debug(enctype);
            retString += '<a href="' + Zotero.config.baseWebsiteUrl + Zotero.config.nonparsedBaseUrl + '/' + item.itemKey + '/file' + '">';
            
            if((enctype == 'undefined') || (enctype === '') || (typeof enctype == 'undefined')){
                retString += filesizeString + '</a>';
            }
            else{
                retString += enctype + ', ' + filesizeString + '</a>';
            }
            
            return retString;
        }
    }
    return retString;
};

Zotero.url.attachmentDownloadUrl = function(item){
    var retString = '';
    if(item.links['enclosure']){
        retString = Zotero.config.baseWebsiteUrl + Zotero.config.nonparsedBaseUrl + '/' + item.itemKey + '/file';
        var tail = item.links['enclosure']['href'].substr(-4, 4);
        if(tail == 'view'){
            //snapshot: redirect to view
            retString += '/view';
        }
    }
    else if(item.linkMode == 2 || item.linkMode == 3){
        if(item.apiObj['url']){
            retString = item.apiObj['url'];
        }
    }
    return retString;
};

Zotero.url.attachmentFileDetails = function(item){
    //file: offer download
    if(!item.links['enclosure']) return '';
    var enctype = Zotero.utils.translateMimeType(item.links['enclosure'].type);
    var enc = item.links['enclosure'];
    var filesizeString = '';
    if(enc['length']){
        var filesize = parseInt(enc['length'], 10);
        filesizeString = "" + filesize + " B";
        if(filesize > 1073741824){
            filesizeString = "" + (filesize / 1073741824).toFixed(1) + " GB";
        }
        else if(filesize > 1048576){
            filesizeString = "" + (filesize / 1048576).toFixed(1) + " MB";
        }
        else if(filesize > 1024){
            filesizeString = "" + (filesize / 1024).toFixed(1) + " KB";
        }
        if((enctype == 'undefined') || (enctype === '') || (typeof enctype == 'undefined')){
            return '(' + filesizeString + ')';
        }
        else{
            return '(' + enctype + ', ' + filesizeString + ')';
        }
    }
    else {
        return '(' + enctype + ')';
    }
};

Zotero.url.exportUrls = function(config){
    Z.debug("Zotero.url.exportUrls");
    var exportUrls = {};
    var exportConfig = {};
    J.each(Zotero.config.exportFormats, function(index, format){
        exportConfig = J.extend(config, {'format':format});
        exportUrls[format] = Zotero.ajax.apiRequestUrl(exportConfig) + Zotero.ajax.apiQueryString({format:format, limit:'25'});
    });
    Z.debug(exportUrls);
    return exportUrls;
};

Zotero.url.snapshotViewLink = function(item){
    return Zotero.ajax.apiRequestUrl({
        'target':'item',
        'targetModifier':'viewsnapshot',
        'libraryType': item.owningLibrary.libraryType,
        'libraryID': item.owningLibrary.libraryID,
        'itemKey': item.itemKey
    });
};

Zotero.url.requestReadApiKeyUrl = function(libraryType, libraryID, redirect){
    var apiKeyBase = Zotero.config.baseWebsiteUrl + '/settings/keys/new';
    apiKeyBase.replace('http', 'https');
    var qparams = {'name': 'Private Feed'};
    if(libraryType == 'group'){
        qparams['library_access'] = 0;
        qparams['group_' + libraryID] = 'read';
        qparams['redirect'] = redirect;
    }
    else if(libraryType == 'user'){
        qparams['library_access'] = 1;
        qparams['notes_access'] = 1;
        qparams['keyredirect'] = redirect;
    }
    
    queryParamsArray = [];
    J.each(qparams, function(index, value){
        queryParamsArray.push(encodeURIComponent(index) + '=' + encodeURIComponent(value));
    });
    
    //build query string by concatenating array
    queryString = '?' + queryParamsArray.join('&');
    
    return apiKeyBase + queryString;
};


/*=== Full Library Loading ===*/
Zotero.callbacks.loadFullLibrary = function(el){
    Zotero.debug("Zotero.callbacks.loadFullLibrary", 3);
    //try to load library from local storage or indexedDB
    //
    //if we have local library already then pull modified item keys and get updates
    //--get list of itemkeys ordered by dateModified
    //--get a fresh copy of the most recently modified item
    //--if we have a copy of MRM and modified times/etags match we're done
    //--else: check exponentially further back items until we find a match, then load all items more recently modified
    //else: pull down enough of the library to display, then start pulling down full library
    //(or only pull down full with make available offline?)
    
    var library = Zotero.ui.getAssociatedLibrary(el);
    var displayParams = {};
    
    // put the selected tags into an array
    var selectedTags = Zotero.nav.getUrlVar('tag');
    if(!J.isArray(selectedTags)){
        if(selectedTags) {
            selectedTags = [selectedTags];
        }
        else {
            selectedTags = [];
        }
    }
    
    if(J("#library").hasClass('loaded')){
        //library has already been loaded once, just need to update view, not fetch data
        
        //update item pane display based on url
        Zotero.callbacks.chooseItemPane(J("#items-pane"));
        
        //update collection tree
        Zotero.ui.highlightCurrentCollection();
        Zotero.ui.nestHideCollectionTree(J("#collection-list-container"));
        
        //update tags display
        var plainList = library.tags.plainTagsList(library.tags.tagsArray);
        Zotero.ui.displayTagsFiltered(J("#tags-list-div"), library.tags, plainList, selectedTags);
        
        Zotero.ui.displayItemOrTemplate(library);
        
        //build new itemkeys list based on new url
        Z.debug("Building new items list to display", 3);
        //displayParams = Zotero.nav.getUrlVars();
        displayParams = J.extend({}, Zotero.config.defaultApiArgs, Zotero.config.userDefaultApiArgs, Zotero.nav.getUrlVars());
        
        Z.debug(displayParams);
        library.buildItemDisplayView(displayParams);
        //render new itemlist
        
    }
    else {
        Zotero.offline.initializeOffline();
    }
};

/* -----offline library ----- */
Zotero.ui.init.offlineLibrary = function(){
    Z.debug("Zotero.ui.init.offlineLibrary", 3);
    
    Zotero.ui.init.libraryControls();
    Zotero.ui.init.tags();
    Zotero.ui.init.collections();
    Zotero.ui.init.items();
    //Zotero.ui.init.feed();
    
    J.subscribe('loadItemsFromKeysParallelDone', function(){
        J.publish("displayedItemsUpdated");
    });
    
    J.subscribe("displayedItemsUpdated", function(){
        Z.debug("displayedItemsUpdated triggered", 3);
        var library = Zotero.ui.getAssociatedLibrary(J("#library"));
        Zotero.ui.displayItemsFullLocal(J("#library-items-div"), {}, library);
    });
    J.subscribe("collectionsUpdated", function(){
        Z.debug("collectionsUpdated triggered", 3);
        var library = Zotero.ui.getAssociatedLibrary(J("#library"));
        Zotero.ui.displayCollections(J("#collection-list-container"), library.collections.collectionsArray);
    });
    J.subscribe("tagsUpdated", function(){
        Z.debug("tagsUpdated triggered", 3);
        var library = Zotero.ui.getAssociatedLibrary(J("#library"));
        var plainList = library.tags.plainTagsList(library.tags.tagsArray);
        var matchedList = Zotero.utils.prependAutocomplete('', plainList);
        Zotero.ui.displayTagsFiltered(J("#tags-list-container") , library.tags, matchedList, selectedTags);
    });
    
    J("#makeAvailableOfflineLink").bind('click', J.proxy(function(e){
        e.preventDefault();
        var library = Zotero.ui.getAssociatedLibrary(J("#library"));
        var collectionKey = Zotero.nav.getUrlVar('collectionKey');
        var itemKeys;
        if(collectionKey){
            library.saveCollectionFilesOffline(collectionKey);
        }
        else{
            library.saveFileSetOffline(library.itemKeys);
        }
    }, this) );
};


/* ----- offline ----- */

/**
 * Display the full library items section
 * @param  {Dom Element} el          Container
 * @param  {object} config      items config
 * @param  {array} loadedItems loaded items array
 * @return {undefined}
 */
Zotero.ui.displayItemsFullLocal = function(el, config, library){
    Z.debug("Zotero.ui.displayItemsFullLocal", 3);
    Z.debug(config, 4);
    var jel = J(el);
    var filledConfig = J.extend({}, Zotero.config.defaultApiArgs, Zotero.config.userDefaultApiArgs, config);
    
    var titleParts = ['', '', ''];
    var displayFields = Zotero.prefs.library_listShowFields;
    if(library.libraryType != 'group'){
        displayFields = J.grep(displayFields, function(el, ind){
            return J.inArray(el, Zotero.Library.prototype.groupOnlyColumns) == (-1);
        });
    }
    var editmode = (Zotero.config.librarySettings.allowEdit ? true : false);
    
    var itemsTableData = {titleParts:titleParts,
                           displayFields:displayFields,
                           items:library.items.displayItemsArray,
                           editmode:editmode,
                           order: filledConfig['order'],
                           sort: filledConfig['sort'],
                           library:library
                        };
    //Z.debug(jel, 3);
    //Z.debug(itemsTableData);
    jel.empty();
    Zotero.ui.insertItemsTable(jel, itemsTableData);
    
    if(Zotero.config.mobile){
        Zotero.ui.createOnActivePage(el);
        return;
    }
    
    Zotero.ui.updateDisabledControlButtons();
    
    Zotero.ui.libraryBreadcrumbs();
    
    Zotero.ui.createOnActivePage(el);
};

/**
 * Get an item's children and display summary info
 * @param  {DOM Element} el      element to insert into
 * @param  {string} itemKey key of parent item
 * @return {undefined}
 */
Zotero.ui.showChildrenLocal = function(el, itemKey){
    Z.debug('Zotero.ui.showChildrenLocal', 3);
    var library = Zotero.ui.getAssociatedLibrary(J(el).closest("div.ajaxload"));
    var item = library.items.getItem(itemKey);
    var attachmentsDiv = J(el).find(".item-attachments-div");
    Zotero.ui.showSpinner(attachmentsDiv);
    
    var childItemKeys = item.childItemKeys;
    var childItems = library.items.getItems(childItemKeys);
    
    J("#childitemsTemplate").tmpl({childItems:childItems}).appendTo(J(".item-attachments-div").empty());
    
    Zotero.ui.createOnActivePage(el);
};

Zotero.ui.localDownloadLink = function(item, el){
    Z.debug("Zotero.ui.localDownloadLink");
    if(item.links && item.links.enclosure){
        Z.debug("should have local file");
        var d = item.owningLibrary.filestorage.getSavedFileObjectUrl(item.itemKey);
        d.done(function(url){
            Z.debug("got item's object url - adding to table");
            J("table.item-info-table tbody").append("<tr><th>Local Copy</th><td><a href='" + url + "'>Open</a></td></tr>");
        });
    }
    else{
        Z.debug("Missing link?");
    }
};

Zotero.ui.displayItemOrTemplate = function(library){
    if(Zotero.nav.getUrlVar('action') == 'newItem'){
        var itemType = Zotero.nav.getUrlVar('itemType');
        if(!itemType){
            J("#item-details-div").empty();
            J("#itemtypeselectTemplate").tmpl({itemTypes:Zotero.localizations.typeMap}).appendTo(J("#item-details-div"));
            return;
        }
        else{
            var newItem = new Zotero.Item();
            newItem.libraryType = library.libraryType;
            newItem.libraryID = library.libraryID;
            d = newItem.initEmpty(itemType);
            J("#item-details-div").data('pendingDeferred', d);
            d.done(Zotero.ui.loadNewItemTemplate);
            d.fail(function(jqxhr, textStatus, errorThrown){
                Zotero.ui.jsNotificationMessage("Error loading item template", 'error');
            });
        }
    }
    else{
        //display individual item if needed
        var itemKey = Zotero.nav.getUrlVar('itemKey');
        if(itemKey){
            //get the item out of the library for display
            var item = library.items.getItem(itemKey);
            if(item){
                Z.debug("have item locally, loading details into ui", 3);
                if(Zotero.nav.getUrlVar('mode') == 'edit'){
                    Zotero.ui.editItemForm(J("#item-details-div"), item);
                }
                else{
                    Zotero.ui.loadItemDetail(item, J("#item-details-div"));
                    Zotero.ui.showChildrenLocal(J("#item-details-div"), itemKey);
                    Zotero.ui.localDownloadLink(item, J("#item-details-div"));
                }
            }
        }
    }
    
};

//----------Zotero.offline
Zotero.offline.initializeOffline = function(){
    Z.debug("Zotero.offline.initializeOffline", 3);
    //check for cached libraryData, if not present load it before doing anything else
    var libraryDataDeferred = new J.Deferred();
    var cacheConfig = {target:'userlibrarydata'};
    var userLibraryData = Zotero.cache.load(cacheConfig);
    
    if(userLibraryData){
        Z.debug("had cached library data - resolving immediately");
        J('#library').data('loadconfig', userLibraryData.loadconfig);
        libraryDataDeferred.resolve(userLibraryData);
    }
    else{
        Z.debug("don't have cached library config data - fetching from server");
        J.getJSON('/user/userlibrarydata', J.proxy(function(data, textStatus, jqxhr){
            Z.debug("got back library config data from server");
            if(data.loggedin === false){
                window.location = '/user/login';
                return false;
            }
            else{
                J('#library').data('loadconfig', data.loadconfig);
                userLibraryData = data;
                libraryDataDeferred.resolve(userLibraryData);
            }
        }, this) );
    }
    
    libraryDataDeferred.done(function(userLibraryData){
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

Zotero.offline.loadAllItems = function(library){
    Z.debug("Zotero.offline.loadAllItems", 3);
    var itemsCacheConfig = {libraryType:library.libraryType, libraryID:library.libraryID, target:'allitems'};
    
    var haveCachedItems = library.loadCachedItems();
    if(haveCachedItems){
        //if we have cached items, display what we think the current view is right now
        //we'll update it after we make sure we're synced too
        displayParams = Zotero.nav.getUrlVars();
        library.buildItemDisplayView(displayParams);
    }
    //we need modified itemKeys regardless, so load them
    var itemKeysDeferred = library.fetchItemKeysModified();
    itemKeysDeferred.done(J.proxy(function(data, keysjqxhr){
        Z.debug("Got back itemKeys ordered by modified", 3);
        var itemKeys = J.trim(data).split("\n");
        library.itemKeys = itemKeys;
        
        if(haveCachedItems === 0 && itemKeys.length > 0) haveCachedItems = false; //explicitly set to false if no items when there are itemkeys
        if(haveCachedItems !== false){
            Z.debug("have cached items", 3);
            //pull items that we don't have at all
            var missingItemKeys = library.findMissingItems(itemKeys);
            var missingItemsDeferred = library.loadItemsFromKeysParallel(missingItemKeys);
            
            //pull modified keys
            var modifiedItemsDeferred = library.loadModifiedItems(itemKeys);
            
            //when all the deferreds are done, build the list to display
            //TODO: we may want to short circuit if there are alot of things to wait for
            J.when(missingItemsDeferred, modifiedItemsDeferred).then(J.proxy(function(){
                Z.debug("Building new items list to display", 3);
                displayParams = Zotero.nav.getUrlVars();
                library.buildItemDisplayView(displayParams);
                Zotero.cache.save(itemsCacheConfig, library.items.dump());
                
                //update item pane display based on url
                Zotero.callbacks.chooseItemPane(J("#items-pane"));
                Zotero.ui.displayItemOrTemplate(library);
            }));
        }
        else{
            //pull all itemKeys
            var loadAllItemsDeferred = library.loadItemsFromKeysParallel(itemKeys);
            loadAllItemsDeferred.done(J.proxy(function(){
                var displayParams = Zotero.nav.getUrlVars();
                Z.debug(displayParams);
                library.buildItemDisplayView(displayParams);
                Zotero.cache.save(itemsCacheConfig, library.items.dump());
            }, this ) );
        }
    }, this ) );
    
    
};

Zotero.offline.loadAllCollections = function(library){
    Z.debug("Zotero.offline.loadAllCollections", 3);
    var collectionsCacheConfig = {libraryType:library.libraryType, libraryID:library.libraryID, target:'allcollections'};
    var collectionMembersConfig = {libraryType:library.libraryType, libraryID:library.libraryID, target:'collectionmembers'};
    
    /* ---- load collections ---- */
    //get Zotero.Library object if already bound to element
    Zotero.ui.updateCollectionButtons();
    
    var haveCachedCollections = library.loadCachedCollections();
    var clist = J('#collection-list-container');
    //Zotero.ui.showSpinner(clist);
    if(haveCachedCollections){
        Z.debug("haveCachedCollections", 3);
        
        clist.empty();
        Zotero.ui.displayCollections(clist, library.collections);
        Zotero.ui.nestHideCollectionTree(clist);
        Zotero.ui.highlightCurrentCollection();
        
        //even if we have collections cached, make sure we look for collection membership info
        var collectionMembershipD = library.loadCollectionMembership(library.collections.collectionsArray);
        collectionMembershipD.done(J.proxy(function(){
            Zotero.cache.save(collectionsCacheConfig, library.collections.dump());
        }, this));
    }
    else {
        Z.debug("dont have collections - load them", 3);
        //empty contents and show spinner while loading ajax
        var d = library.loadCollections();
        d.done(J.proxy(function(){
            clist.empty();
            Zotero.ui.displayCollections(clist, library.collections);
            Zotero.ui.highlightCurrentCollection();
            Zotero.ui.nestHideCollectionTree(clist);
            
            Zotero.cache.save(collectionsCacheConfig, library.collections.dump());
            
            var collectionMembershipD = library.loadCollectionMembership(library.collections.collectionsArray);
            collectionMembershipD.done(J.proxy(function(){
                Zotero.cache.save(collectionsCacheConfig, library.collections.dump());
            }, this));
        }, this));
        
        d.fail(J.proxy(function(jqxhr, textStatus, errorThrown){
            var elementMessage = Zotero.ui.ajaxErrorMessage(jqxhr);
            jel.html("<p>" + elementMessage + "</p>");
        }));
    }
    
};

Zotero.offline.loadAllTags = function(library){
    Z.debug("Zotero.offline.loadAllTags", 3);
    var tagsCacheConfig = {libraryType:library.libraryType, libraryID:library.libraryID, target:'alltags'};
    
    /* ----- load tags ----- */
    var tagsEl = J("#tags-list-container");
    var loadTagsDeferred = library.loadAllTags({});
    
    // put the selected tags into an array
    var selectedTags = Zotero.nav.getUrlVar('tag');
    if(!J.isArray(selectedTags)){
        if(selectedTags) {
            selectedTags = [selectedTags];
        }
        else {
            selectedTags = [];
        }
    }
    
    loadTagsDeferred.done(J.proxy(function(tags){
        Z.debug("finished loadAllTags", 3);
        tagsEl.find('div.loading').empty();
        Z.debug(tags, 5);
        library.tags.loaded = true;
        library.tags.loadedConfig = {};
        tagsEl.children('.loading').empty();
        var plainList = library.tags.plainTagsList(library.tags.tagsArray);
        Zotero.ui.displayTagsFiltered(tagsEl, library.tags, plainList, selectedTags);
        Zotero.nav.doneLoading(tagsEl);
    }, this));
    
    loadTagsDeferred.fail(J.proxy(function(jqxhr, textStatus, errorThrown){
        var elementMessage = Zotero.ui.ajaxErrorMessage(jqxhr);
        jel.html("<p>" + elementMessage + "</p>");
    }));
    J("#library").addClass("loaded");
    
};

Zotero.offline.loadMetaInfo = function(library){
    Z.debug("Zotero.offline.loadMetaInfo", 3);
    /* ----- load item templates ----- */
    //all other template information is loaded and cached automatically in Zotero www init
    //but this requires many requests, so only preload templates for all itemTypes for
    //offline capable library
    if(Zotero.Item.prototype.itemTypes){
        Z.debug("have itemTypes, fetching item templates", 3);
        var itemTypes = Zotero.Item.prototype.itemTypes;
        var type;
        J.each(itemTypes, function(ind, val){
            type = val.itemType;
            if(type != 'attachment'){
                Zotero.Item.prototype.getItemTemplate(type);
            }
            Zotero.Item.prototype.getCreatorTypes(type);
        });
        //get templates for attachments with linkmodes
        Zotero.Item.prototype.getItemTemplate('attachment', 'imported_file');
        Zotero.Item.prototype.getItemTemplate('attachment', 'imported_url');
        Zotero.Item.prototype.getItemTemplate('attachment', 'linked_file');
        Zotero.Item.prototype.getItemTemplate('attachment', 'linked_url');
    }
    else {
        Z.debug("Dont yet have itemTypes, can't fetch item templates", 3);
    }
};
