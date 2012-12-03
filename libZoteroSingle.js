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
             baseApiUrl: 'https://api.zotero.org',
             baseWebsiteUrl: 'https://zotero.org',
             baseFeedUrl: 'https://api.zotero.org',
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
    if(queryParams.hasOwnProperty('itemKey') && queryParams['itemKey'].indexOf(',') == -1){
        delete queryParams['itemKey'];
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
