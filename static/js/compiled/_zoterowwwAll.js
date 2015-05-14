/*
 * jQuery BBQ: Back Button & Query Library - v1.3pre - 8/26/2010
 * http://benalman.com/projects/jquery-bbq-plugin/
 * 
 * Copyright (c) 2010 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */
(function($,r){var h,n=Array.prototype.slice,t=decodeURIComponent,a=$.param,j,c,m,y,b=$.bbq=$.bbq||{},s,x,k,e=$.event.special,d="hashchange",B="querystring",F="fragment",z="elemUrlAttr",l="href",w="src",p=/^.*\?|#.*$/g,u,H,g,i,C,E={};function G(I){return typeof I==="string"}function D(J){var I=n.call(arguments,1);return function(){return J.apply(this,I.concat(n.call(arguments)))}}function o(I){return I.replace(H,"$2")}function q(I){return I.replace(/(?:^[^?#]*\?([^#]*).*$)?.*/,"$1")}function f(K,P,I,L,J){var R,O,N,Q,M;if(L!==h){N=I.match(K?H:/^([^#?]*)\??([^#]*)(#?.*)/);M=N[3]||"";if(J===2&&G(L)){O=L.replace(K?u:p,"")}else{Q=m(N[2]);L=G(L)?m[K?F:B](L):L;O=J===2?L:J===1?$.extend({},L,Q):$.extend({},Q,L);O=j(O);if(K){O=O.replace(g,t)}}R=N[1]+(K?C:O||!N[1]?"?":"")+O+M}else{R=P(I!==h?I:location.href)}return R}a[B]=D(f,0,q);a[F]=c=D(f,1,o);a.sorted=j=function(J,K){var I=[],L={};$.each(a(J,K).split("&"),function(P,M){var O=M.replace(/(?:%5B|=).*$/,""),N=L[O];if(!N){N=L[O]=[];I.push(O)}N.push(M)});return $.map(I.sort(),function(M){return L[M]}).join("&")};c.noEscape=function(J){J=J||"";var I=$.map(J.split(""),encodeURIComponent);g=new RegExp(I.join("|"),"g")};c.noEscape(",/");c.ajaxCrawlable=function(I){if(I!==h){if(I){u=/^.*(?:#!|#)/;H=/^([^#]*)(?:#!|#)?(.*)$/;C="#!"}else{u=/^.*#/;H=/^([^#]*)#?(.*)$/;C="#"}i=!!I}return i};c.ajaxCrawlable(0);$.deparam=m=function(L,I){var K={},J={"true":!0,"false":!1,"null":null};$.each(L.replace(/\+/g," ").split("&"),function(O,T){var N=T.split("="),S=t(N[0]),M,R=K,P=0,U=S.split("]["),Q=U.length-1;if(/\[/.test(U[0])&&/\]$/.test(U[Q])){U[Q]=U[Q].replace(/\]$/,"");U=U.shift().split("[").concat(U);Q=U.length-1}else{Q=0}if(N.length===2){M=t(N[1]);if(I){M=M&&!isNaN(M)?+M:M==="undefined"?h:J[M]!==h?J[M]:M}if(Q){for(;P<=Q;P++){S=U[P]===""?R.length:U[P];R=R[S]=P<Q?R[S]||(U[P+1]&&isNaN(U[P+1])?{}:[]):M}}else{if($.isArray(K[S])){K[S].push(M)}else{if(K[S]!==h){K[S]=[K[S],M]}else{K[S]=M}}}}else{if(S){K[S]=I?h:""}}});return K};function A(K,I,J){if(I===h||typeof I==="boolean"){J=I;I=a[K?F:B]()}else{I=G(I)?I.replace(K?u:p,""):I}return m(I,J)}m[B]=D(A,0);m[F]=y=D(A,1);$[z]||($[z]=function(I){return $.extend(E,I)})({a:l,base:l,iframe:w,img:w,input:w,form:"action",link:l,script:w});k=$[z];function v(L,J,K,I){if(!G(K)&&typeof K!=="object"){I=K;K=J;J=h}return this.each(function(){var O=$(this),M=J||k()[(this.nodeName||"").toLowerCase()]||"",N=M&&O.attr(M)||"";O.attr(M,a[L](N,K,I))})}$.fn[B]=D(v,B);$.fn[F]=D(v,F);b.pushState=s=function(L,I){if(G(L)&&/^#/.test(L)&&I===h){I=2}var K=L!==h,J=c(location.href,K?L:{},K?I:2);location.href=J};b.getState=x=function(I,J){return I===h||typeof I==="boolean"?y(I):y(J)[I]};b.removeState=function(I){var J={};if(I!==h){J=x();$.each($.isArray(I)?I:arguments,function(L,K){delete J[K]})}s(J,2)};e[d]=$.extend(e[d],{add:function(I){var K;function J(M){var L=M[F]=c();M.getState=function(N,O){return N===h||typeof N==="boolean"?m(L,N):m(L,O)[N]};K.apply(this,arguments)}if($.isFunction(I)){K=I;return J}else{K=I.handler;I.handler=J}}})})(jQuery,this);
!function(){var a,b,c,d;!function(){var e={},f={};a=function(a,b,c){e[a]={deps:b,callback:c}},d=c=b=function(a){function c(b){if("."!==b.charAt(0))return b;for(var c=b.split("/"),d=a.split("/").slice(0,-1),e=0,f=c.length;f>e;e++){var g=c[e];if(".."===g)d.pop();else{if("."===g)continue;d.push(g)}}return d.join("/")}if(d._eak_seen=e,f[a])return f[a];if(f[a]={},!e[a])throw new Error("Could not find module "+a);for(var g,h=e[a],i=h.deps,j=h.callback,k=[],l=0,m=i.length;m>l;l++)"exports"===i[l]?k.push(g={}):k.push(b(c(i[l])));var n=j.apply(this,k);return f[a]=g||n}}(),a("promise/all",["./utils","exports"],function(a,b){"use strict";function c(a){var b=this;if(!d(a))throw new TypeError("You must pass an array to all.");return new b(function(b,c){function d(a){return function(b){f(a,b)}}function f(a,c){h[a]=c,0===--i&&b(h)}var g,h=[],i=a.length;0===i&&b([]);for(var j=0;j<a.length;j++)g=a[j],g&&e(g.then)?g.then(d(j),c):f(j,g)})}var d=a.isArray,e=a.isFunction;b.all=c}),a("promise/asap",["exports"],function(a){"use strict";function b(){return function(){process.nextTick(e)}}function c(){var a=0,b=new i(e),c=document.createTextNode("");return b.observe(c,{characterData:!0}),function(){c.data=a=++a%2}}function d(){return function(){j.setTimeout(e,1)}}function e(){for(var a=0;a<k.length;a++){var b=k[a],c=b[0],d=b[1];c(d)}k=[]}function f(a,b){var c=k.push([a,b]);1===c&&g()}var g,h="undefined"!=typeof window?window:{},i=h.MutationObserver||h.WebKitMutationObserver,j="undefined"!=typeof global?global:this,k=[];g="undefined"!=typeof process&&"[object process]"==={}.toString.call(process)?b():i?c():d(),a.asap=f}),a("promise/cast",["exports"],function(a){"use strict";function b(a){if(a&&"object"==typeof a&&a.constructor===this)return a;var b=this;return new b(function(b){b(a)})}a.cast=b}),a("promise/config",["exports"],function(a){"use strict";function b(a,b){return 2!==arguments.length?c[a]:(c[a]=b,void 0)}var c={instrument:!1};a.config=c,a.configure=b}),a("promise/polyfill",["./promise","./utils","exports"],function(a,b,c){"use strict";function d(){var a="Promise"in window&&"cast"in window.Promise&&"resolve"in window.Promise&&"reject"in window.Promise&&"all"in window.Promise&&"race"in window.Promise&&function(){var a;return new window.Promise(function(b){a=b}),f(a)}();a||(window.Promise=e)}var e=a.Promise,f=b.isFunction;c.polyfill=d}),a("promise/promise",["./config","./utils","./cast","./all","./race","./resolve","./reject","./asap","exports"],function(a,b,c,d,e,f,g,h,i){"use strict";function j(a){if(!w(a))throw new TypeError("You must pass a resolver function as the first argument to the promise constructor");if(!(this instanceof j))throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");this._subscribers=[],k(a,this)}function k(a,b){function c(a){p(b,a)}function d(a){r(b,a)}try{a(c,d)}catch(e){d(e)}}function l(a,b,c,d){var e,f,g,h,i=w(c);if(i)try{e=c(d),g=!0}catch(j){h=!0,f=j}else e=d,g=!0;o(b,e)||(i&&g?p(b,e):h?r(b,f):a===F?p(b,e):a===G&&r(b,e))}function m(a,b,c,d){var e=a._subscribers,f=e.length;e[f]=b,e[f+F]=c,e[f+G]=d}function n(a,b){for(var c,d,e=a._subscribers,f=a._detail,g=0;g<e.length;g+=3)c=e[g],d=e[g+b],l(b,c,d,f);a._subscribers=null}function o(a,b){var c,d=null;try{if(a===b)throw new TypeError("A promises callback cannot return that same promise.");if(v(b)&&(d=b.then,w(d)))return d.call(b,function(d){return c?!0:(c=!0,b!==d?p(a,d):q(a,d),void 0)},function(b){return c?!0:(c=!0,r(a,b),void 0)}),!0}catch(e){return c?!0:(r(a,e),!0)}return!1}function p(a,b){a===b?q(a,b):o(a,b)||q(a,b)}function q(a,b){a._state===D&&(a._state=E,a._detail=b,u.async(s,a))}function r(a,b){a._state===D&&(a._state=E,a._detail=b,u.async(t,a))}function s(a){n(a,a._state=F)}function t(a){n(a,a._state=G)}var u=a.config,v=(a.configure,b.objectOrFunction),w=b.isFunction,x=(b.now,c.cast),y=d.all,z=e.race,A=f.resolve,B=g.reject,C=h.asap;u.async=C;var D=void 0,E=0,F=1,G=2;j.prototype={constructor:j,_state:void 0,_detail:void 0,_subscribers:void 0,then:function(a,b){var c=this,d=new this.constructor(function(){});if(this._state){var e=arguments;u.async(function(){l(c._state,d,e[c._state-1],c._detail)})}else m(this,d,a,b);return d},"catch":function(a){return this.then(null,a)}},j.all=y,j.cast=x,j.race=z,j.resolve=A,j.reject=B,i.Promise=j}),a("promise/race",["./utils","exports"],function(a,b){"use strict";function c(a){var b=this;if(!d(a))throw new TypeError("You must pass an array to race.");return new b(function(b,c){for(var d,e=0;e<a.length;e++)d=a[e],d&&"function"==typeof d.then?d.then(b,c):b(d)})}var d=a.isArray;b.race=c}),a("promise/reject",["exports"],function(a){"use strict";function b(a){var b=this;return new b(function(b,c){c(a)})}a.reject=b}),a("promise/resolve",["exports"],function(a){"use strict";function b(a){var b=this;return new b(function(b){b(a)})}a.resolve=b}),a("promise/utils",["exports"],function(a){"use strict";function b(a){return c(a)||"object"==typeof a&&null!==a}function c(a){return"function"==typeof a}function d(a){return"[object Array]"===Object.prototype.toString.call(a)}var e=Date.now||function(){return(new Date).getTime()};a.objectOrFunction=b,a.isFunction=c,a.isArray=d,a.now=e}),b("promise/polyfill").polyfill()}();(function(a){if(typeof exports==="object"){module.exports=a()}else{if(typeof define==="function"&&define.amd){define(a)}else{var c;try{c=window}catch(b){c=self}c.SparkMD5=a()}}}(function(c){var e=function(s,r){return(s+r)&4294967295},n=function(z,v,u,r,y,w){v=e(e(v,z),e(r,w));return e((v<<y)|(v>>>(32-y)),u)},a=function(v,u,A,z,r,y,w){return n((u&A)|((~u)&z),v,u,r,y,w)},k=function(v,u,A,z,r,y,w){return n((u&z)|(A&(~z)),v,u,r,y,w)},f=function(v,u,A,z,r,y,w){return n(u^A^z,v,u,r,y,w)},p=function(v,u,A,z,r,y,w){return n(A^(u|(~z)),v,u,r,y,w)},d=function(s,u){var t=s[0],r=s[1],w=s[2],v=s[3];t=a(t,r,w,v,u[0],7,-680876936);v=a(v,t,r,w,u[1],12,-389564586);w=a(w,v,t,r,u[2],17,606105819);r=a(r,w,v,t,u[3],22,-1044525330);t=a(t,r,w,v,u[4],7,-176418897);v=a(v,t,r,w,u[5],12,1200080426);w=a(w,v,t,r,u[6],17,-1473231341);r=a(r,w,v,t,u[7],22,-45705983);t=a(t,r,w,v,u[8],7,1770035416);v=a(v,t,r,w,u[9],12,-1958414417);w=a(w,v,t,r,u[10],17,-42063);r=a(r,w,v,t,u[11],22,-1990404162);t=a(t,r,w,v,u[12],7,1804603682);v=a(v,t,r,w,u[13],12,-40341101);w=a(w,v,t,r,u[14],17,-1502002290);r=a(r,w,v,t,u[15],22,1236535329);t=k(t,r,w,v,u[1],5,-165796510);v=k(v,t,r,w,u[6],9,-1069501632);w=k(w,v,t,r,u[11],14,643717713);r=k(r,w,v,t,u[0],20,-373897302);t=k(t,r,w,v,u[5],5,-701558691);v=k(v,t,r,w,u[10],9,38016083);w=k(w,v,t,r,u[15],14,-660478335);r=k(r,w,v,t,u[4],20,-405537848);t=k(t,r,w,v,u[9],5,568446438);v=k(v,t,r,w,u[14],9,-1019803690);w=k(w,v,t,r,u[3],14,-187363961);r=k(r,w,v,t,u[8],20,1163531501);t=k(t,r,w,v,u[13],5,-1444681467);v=k(v,t,r,w,u[2],9,-51403784);w=k(w,v,t,r,u[7],14,1735328473);r=k(r,w,v,t,u[12],20,-1926607734);t=f(t,r,w,v,u[5],4,-378558);v=f(v,t,r,w,u[8],11,-2022574463);w=f(w,v,t,r,u[11],16,1839030562);r=f(r,w,v,t,u[14],23,-35309556);t=f(t,r,w,v,u[1],4,-1530992060);v=f(v,t,r,w,u[4],11,1272893353);w=f(w,v,t,r,u[7],16,-155497632);r=f(r,w,v,t,u[10],23,-1094730640);t=f(t,r,w,v,u[13],4,681279174);v=f(v,t,r,w,u[0],11,-358537222);w=f(w,v,t,r,u[3],16,-722521979);r=f(r,w,v,t,u[6],23,76029189);t=f(t,r,w,v,u[9],4,-640364487);v=f(v,t,r,w,u[12],11,-421815835);w=f(w,v,t,r,u[15],16,530742520);r=f(r,w,v,t,u[2],23,-995338651);t=p(t,r,w,v,u[0],6,-198630844);v=p(v,t,r,w,u[7],10,1126891415);w=p(w,v,t,r,u[14],15,-1416354905);r=p(r,w,v,t,u[5],21,-57434055);t=p(t,r,w,v,u[12],6,1700485571);v=p(v,t,r,w,u[3],10,-1894986606);w=p(w,v,t,r,u[10],15,-1051523);r=p(r,w,v,t,u[1],21,-2054922799);t=p(t,r,w,v,u[8],6,1873313359);v=p(v,t,r,w,u[15],10,-30611744);w=p(w,v,t,r,u[6],15,-1560198380);r=p(r,w,v,t,u[13],21,1309151649);t=p(t,r,w,v,u[4],6,-145523070);v=p(v,t,r,w,u[11],10,-1120210379);w=p(w,v,t,r,u[2],15,718787259);r=p(r,w,v,t,u[9],21,-343485551);s[0]=e(t,s[0]);s[1]=e(r,s[1]);s[2]=e(w,s[2]);s[3]=e(v,s[3])},q=function(t){var u=[],r;for(r=0;r<64;r+=4){u[r>>2]=t.charCodeAt(r)+(t.charCodeAt(r+1)<<8)+(t.charCodeAt(r+2)<<16)+(t.charCodeAt(r+3)<<24)}return u},m=function(r){var t=[],s;for(s=0;s<64;s+=4){t[s>>2]=r[s]+(r[s+1]<<8)+(r[s+2]<<16)+(r[s+3]<<24)}return t},l=function(A){var u=A.length,r=[1732584193,-271733879,-1732584194,271733878],w,t,z,x,y,v;for(w=64;w<=u;w+=64){d(r,q(A.substring(w-64,w)))}A=A.substring(w-64);t=A.length;z=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];for(w=0;w<t;w+=1){z[w>>2]|=A.charCodeAt(w)<<((w%4)<<3)}z[w>>2]|=128<<((w%4)<<3);if(w>55){d(r,z);for(w=0;w<16;w+=1){z[w]=0}}x=u*8;x=x.toString(16).match(/(.*?)(.{0,8})$/);y=parseInt(x[2],16);v=parseInt(x[1],16)||0;z[14]=y;z[15]=v;d(r,z);return r},o=function(z){var t=z.length,r=[1732584193,-271733879,-1732584194,271733878],v,s,y,w,x,u;for(v=64;v<=t;v+=64){d(r,m(z.subarray(v-64,v)))}z=(v-64)<t?z.subarray(v-64):new Uint8Array(0);s=z.length;y=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];for(v=0;v<s;v+=1){y[v>>2]|=z[v]<<((v%4)<<3)}y[v>>2]|=128<<((v%4)<<3);if(v>55){d(r,y);for(v=0;v<16;v+=1){y[v]=0}}w=t*8;w=w.toString(16).match(/(.*?)(.{0,8})$/);x=parseInt(w[2],16);u=parseInt(w[1],16)||0;y[14]=x;y[15]=u;d(r,y);return r},j=["0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f"],h=function(u){var t="",r;for(r=0;r<4;r+=1){t+=j[(u>>(r*8+4))&15]+j[(u>>(r*8))&15]}return t},b=function(r){var s;for(s=0;s<r.length;s+=1){r[s]=h(r[s])}return r.join("")},i=function(r){return b(l(r))},g=function(){this.reset()};if(i("hello")!=="5d41402abc4b2a76b9719d911017c592"){e=function(r,u){var t=(r&65535)+(u&65535),s=(r>>16)+(u>>16)+(t>>16);return(s<<16)|(t&65535)}}g.prototype.append=function(r){if(/[\u0080-\uFFFF]/.test(r)){r=unescape(encodeURIComponent(r))}this.appendBinary(r);return this};g.prototype.appendBinary=function(t){this._buff+=t;this._length+=t.length;var s=this._buff.length,r;for(r=64;r<=s;r+=64){d(this._state,q(this._buff.substring(r-64,r)))}this._buff=this._buff.substr(r-64);return this};g.prototype.end=function(t){var w=this._buff,v=w.length,u,s=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],r;for(u=0;u<v;u+=1){s[u>>2]|=w.charCodeAt(u)<<((u%4)<<3)}this._finish(s,v);r=!!t?this._state:b(this._state);this.reset();return r};g.prototype._finish=function(s,w){var u=w,t,v,r;s[u>>2]|=128<<((u%4)<<3);if(u>55){d(this._state,s);for(u=0;u<16;u+=1){s[u]=0}}t=this._length*8;t=t.toString(16).match(/(.*?)(.{0,8})$/);v=parseInt(t[2],16);r=parseInt(t[1],16)||0;s[14]=v;s[15]=r;d(this._state,s)};g.prototype.reset=function(){this._buff="";this._length=0;this._state=[1732584193,-271733879,-1732584194,271733878];return this};g.prototype.destroy=function(){delete this._state;delete this._buff;delete this._length};g.hash=function(t,r){if(/[\u0080-\uFFFF]/.test(t)){t=unescape(encodeURIComponent(t))}var s=l(t);return !!r?s:b(s)};g.hashBinary=function(s,r){var t=l(s);return !!r?t:b(t)};g.ArrayBuffer=function(){this.reset()};g.ArrayBuffer.prototype.append=function(r){var u=this._concatArrayBuffer(this._buff,r),t=u.length,s;this._length+=r.byteLength;for(s=64;s<=t;s+=64){d(this._state,m(u.subarray(s-64,s)))}this._buff=(s-64)<t?u.subarray(s-64):new Uint8Array(0);return this};g.ArrayBuffer.prototype.end=function(t){var w=this._buff,v=w.length,s=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],u,r;for(u=0;u<v;u+=1){s[u>>2]|=w[u]<<((u%4)<<3)}this._finish(s,v);r=!!t?this._state:b(this._state);this.reset();return r};g.ArrayBuffer.prototype._finish=g.prototype._finish;g.ArrayBuffer.prototype.reset=function(){this._buff=new Uint8Array(0);this._length=0;this._state=[1732584193,-271733879,-1732584194,271733878];return this};g.ArrayBuffer.prototype.destroy=g.prototype.destroy;g.ArrayBuffer.prototype._concatArrayBuffer=function(u,s){var t=u.length,r=new Uint8Array(t+s.byteLength);r.set(u);r.set(new Uint8Array(s),t);return r};g.ArrayBuffer.hash=function(r,s){var t=o(new Uint8Array(r));return !!s?t:b(t)};return g}));
//'use strict';
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
        },
    },
    url: {},
    utils: {},
    offline: {},
    temp: {},
    localizations: {},
    
    config: {librarySettings: {},
             baseApiUrl: 'https://api.zotero.org',
             baseWebsiteUrl: 'https://zotero.org',
             baseFeedUrl: 'https://api.zotero.org',
             baseZoteroWebsiteUrl: 'https://www.zotero.org',
             baseDownloadUrl: 'https://www.zotero.org',
             debugLogEndpoint: '',
             storeDebug: true,
             directDownloads: true,
             proxyPath: '/proxyrequest',
             ignoreLoggedInStatus: false,
             storePrefsRemote: true,
             preferUrlItem: true,
             sessionAuth: false,
             proxy: false,
             apiKey: '',
             ajax: 1,
             apiVersion: 3,
             eventful: false,
             locale: 'en-US',
             cacheStoreType: 'localStorage',
             preloadCachedLibrary: true,
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
                'bibtex',
                'bookmarks',
                'mods',
                'refer',
                'rdf_bibliontology',
                'rdf_dc',
                'rdf_zotero',
                'ris',
                'wikipedia'
                ],
            exportFormatsMap: {
                'bibtex': 'BibTeX',
                'bookmarks': 'Bookmarks',
                'mods': 'MODS',
                'refer': 'Refer/BibIX',
                'rdf_bibliontology': 'Bibliontology RDF',
                'rdf_dc': 'Unqualified Dublin Core RDF',
                'rdf_zotero': 'Zotero RDF',
                'ris': 'RIS',
                'wikipedia': 'Wikipedia Citation Templates',
            },
            defaultApiArgs: {
                'order': 'title',
                'sort': 'asc',
                'limit': 50,
                'start': 0
            }
    },
    
    debug: function(debugstring, level){
        var prefLevel = 3;
        if(Zotero.config.storeDebug){
            if(level <= prefLevel){
                Zotero.debugstring += "DEBUG:" + debugstring + "\n";
            }
        }
        if(typeof console == 'undefined'){
            return;
        }
        if(typeof(level) !== "number"){
            level = 1;
        }
        if(Zotero.preferences !== undefined){
            prefLevel = Zotero.preferences.getPref('debug_level');
        }
        if(level <= prefLevel) {
            console.log(debugstring);
        }
    },
    
    warn: function(warnstring){
        if(Zotero.config.storeDebug){
            Zotero.debugstring += "WARN:" + warnstring + "\n";
        }
        if(typeof console == 'undefined' || typeof console.warn == 'undefined'){
            this.debug(warnstring);
        }
        else{
            console.warn(warnstring);
        }
    },
    
    error: function(errorstring){
        if(Zotero.config.storeDebug){
            Zotero.debugstring += "ERROR:" + errorstring + "\n";
        }
        if(typeof console == 'undefined' || typeof console.error == 'undefined'){
            this.debug(errorstring);
        }
        else{
            console.error(errorstring);
        }
    },

    submitDebugLog: function(){
        response = J.post(Zotero.config.debugLogEndpoint, {'debug_string': Zotero.debugstring}, function(data){
            if(data.logID) {
                alert("ZoteroWWW debug logID:" + data.logID);
            } else if (data.error) {
                alert("Error submitting ZoteroWWW debug log:" + data.error);
            }
        });
    },
    
    catchPromiseError: function(err){
        Zotero.error(err);
    },
    
    libraries: {},
    
    validator: {
        patterns: {
            //'itemKey': /^([A-Z0-9]{8,},?)+$/,
            'itemKey': /^.+$/,
            'collectionKey': /^([A-Z0-9]{8,})|trash$/,
            //'tag': /^[^#]*$/,
            'libraryID': /^[0-9]+$/,
            'libraryType': /^(user|group|)$/,
            'target': /^(items?|collections?|tags|children|deleted|userGroups|key|settings|publications)$/,
            'targetModifier': /^(top|file|file\/view)$/,
            
            //get params
            'sort': /^(asc|desc)$/,
            'start': /^[0-9]*$/,
            'limit': /^[0-9]*$/,
            'order': /^\S*$/,
            'content': /^((html|json|data|bib|none|bibtex|bookmarks|coins|csljson|mods|refer|rdf_bibliontology|rdf_dc|ris|tei|wikipedia),?)+$/,
            'include': /^((html|json|data|bib|none|bibtex|bookmarks|coins|csljson|mods|refer|rdf_bibliontology|rdf_dc|ris|tei|wikipedia),?)+$/,
            'q': /^.*$/,
            'fq': /^\S*$/,
            'itemType': /^\S*$/,
            'locale': /^\S*$/,
            'tag': /^.*$/,
            'tagType': /^(0|1)$/,
            'key': /^\S*/,
            'format': /^(json|atom|bib|keys|versions|bibtex|bookmarks|mods|refer|rdf_bibliontology|rdf_dc|rdf_zotero|ris|wikipedia)$/,
            'style': /^\S*$/,
            'linkwrap': /^(0|1)*$/
        },
        
        validate: function(arg, type){
            Z.debug("Zotero.validate", 4);
            if(arg === ''){
                return null;
            }
            else if(arg === null){
                return true;
            }
            Z.debug(arg + " " + type, 4);
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
            //TODO: enable debug_log?
        }
    },
    
    disableLogging: function(){
        Zotero._logEnabled--;
        if(Zotero._logEnabled <= 0){
            Zotero._logEnabled = 0;
            //TODO: disable debug_log?
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
        Zotero.store = store;
        
        Zotero.cache = new Zotero.Cache(store);
        
        //initialize global preferences object
        Zotero.preferences = new Zotero.Preferences(Zotero.store, 'global');
        
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
    var registry = this.store._registry;
    if(registry === null || typeof registry == 'undefined'){
        registry = {};
        this.store._registry = JSON.stringify(registry);
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
    var registry = JSON.parse(this.store._registry);
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
    this.store._registry = JSON.stringify(registry);
};

Zotero.Cache.prototype.load = function(params){
    Z.debug("Zotero.Cache.load", 3);
    var objectCacheString = this.objectCacheString(params);
    Z.debug(objectCacheString, 4);
    try{
        var s = this.store[objectCacheString];
        if(!s){
            Z.warn("No value found in cache store - " + objectCacheString, 3);
            return null;
        }
        else{
            return JSON.parse(s);
        }
    }
    catch(e){
        Z.error('Error parsing retrieved cache data: ' + objectCacheString + ' : ' + s);
        return null;
    }
};

Zotero.Cache.prototype.expireCacheTag = function(tag){
    Z.debug("Zotero.Cache.expireCacheTag", 3);
    var registry = JSON.parse(this.store._registry);
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

Zotero.ajaxRequest = function(url, type, options){
    Z.debug("Zotero.ajaxRequest ==== " + url, 3);
    if(!type){
        type = 'GET';
    }
    if(!options){
        options = {};
    }
    var requestObject = {
        url: url,
        type: type,
    };
    requestObject = J.extend({}, requestObject, options);
    Z.debug(requestObject, 3);
    return Zotero.net.queueRequest(requestObject);
};

Zotero.trigger = function(eventType, data, filter){
    if(filter){
        Z.debug("filter is not false");
        eventType += "_" + filter;
    }
    Zotero.debug("Triggering eventful " + eventType, 3);
    if(!data){
        data = {};
    }
    data.zeventful = true;
    if(data.triggeringElement === null || data.triggeringElement === undefined){
        data.triggeringElement = J("#eventful");
    }
    Zotero.debug("Triggering eventful " + eventType, 3);
    var e = J.Event(eventType, data);
    try{
        J("#eventful").trigger(e);
    }
    catch(e){
        Z.error("failed triggering");
        Z.error(e);
    }
};

Zotero.listen = function(events, handler, data, filter){
    //append filter to event strings if it's specified
    if(filter){
        var eventsArray = events.split(" ");
        if(eventsArray.length > 0){
            for(var i = 0; i < eventsArray.length; i++){
                eventsArray[i] += "_" + filter;
            }
            events = eventsArray.join(" ");
        }
    }
    Z.debug("listening on " + events, 3);
    J("#eventful").on(events, null, data, handler);
};

var Z = Zotero;


/*
Zotero.ajax.error = function(event, request, settings, exception){
    //Zotero.ui.jsNotificationMessage("Error requesting " + settings.url, 'error');
    //J("#js-message-list").append("<li>Error requesting " + settings.url + "</li>");
    Z.debug("Exception: " + exception);
    //Z.exception = exception;
};
*/
/*
Zotero.ajax.errorCallback = function(jqxhr, textStatus, errorThrown){
    Z.debug("ajax error callback", 2);
    Z.debug('textStatus: ' + textStatus, 2);
    Z.debug('errorThrown: ', 2);
    Z.debug(errorThrown, 2);
    Z.debug(jqxhr, 2);
};
*/
Zotero.ajax.errorCallback = function(response){
    Z.error(response);
    Z.debug('ajax error callback', 2);
    Z.debug('textStatus: ' + response.textStatus, 2);
    Z.debug('errorThrown: ', 2);
    Z.debug(response.errorThrown, 2);
    Z.debug(response.jqxhr, 2);
};

Zotero.ajax.error = Zotero.ajax.errorCallback;
Zotero.ajax.activeRequests = [];

/*
 * Requires {target:items|collections|tags, libraryType:user|group, libraryID:<>}
 */
Zotero.ajax.apiRequestUrl = function(params){
    Z.debug('Zotero.ajax.apiRequestUrl', 4);
    Z.debug(params, 4);
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
            Zotero.warn('API argument failed validation: ' + key + ' cannot be ' + val);
            Zotero.warn(params);
            delete params[key];
        }
    });
    
    if(!params.target) throw new Error('No target defined for api request');
    if(!(params.libraryType == 'user' ||
        params.libraryType == 'group' ||
        params.libraryType === '')) {
        throw new Error('Unexpected libraryType for api request ' + JSON.stringify(params));
    }
    if((params.libraryType) && !(params.libraryID)) {
        throw new Error('No libraryID defined for api request');
    }
    if((params.target == 'publications') && (params.libraryType != 'user')){
        throw new Error('publications is only valid for user libraries');
    }
    
    var base = Zotero.config.baseApiUrl;
    var url;
    
    if(params.libraryType !== ''){
        url = base + '/' + params.libraryType + 's/' + params.libraryID;
        if(params.collectionKey){
            if(params.collectionKey == 'trash'){
                url += '/items/trash';
                return url;
            }
            else if(params.collectionKey.indexOf(',') !== -1){
                
            }
            else if(params.target != 'collections'){
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
        case 'childCollections':
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
        case 'key':
            url = base + '/users/' + params.libraryID + '/keys/' + params.apiKey;
            break;
        case 'deleted':
            url += '/deleted';
            break;
        case 'userGroups':
            url = base + '/users/' + params.libraryID + '/groups';
            break;
        case 'settings':
            url += '/settings/' + (params.settingsKey || '');
            break;
        case 'publications':
            url += '/publications/items';
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
    Z.debug("Zotero.ajax.apiQueryString", 4);
    Z.debug(passedParams, 4);
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
    if(useConfigKey && Zotero.config.sessionAuth) {
        var sessionKey = Zotero.utils.readCookie(Zotero.config.sessionCookieName);
        passedParams['session'] = sessionKey;
    }
    else if(useConfigKey && Zotero.config.apiKey){
        passedParams['key'] = Zotero.config.apiKey;
    }
    
    //Z.debug()
    if(passedParams.hasOwnProperty('sort') && passedParams['sort'] == 'undefined' ){
        //alert('fixed a bad sort');
        passedParams['sort'] = 'asc';
    }
    
    Z.debug(passedParams, 4);
    
    var queryString = '?';
    var queryParamsArray = [];
    var queryParamOptions = ['start',
                             'limit',
                             'order',
                             'sort',
                             'content',
                             'include',
                             'format',
                             'q',
                             'fq',
                             'itemType',
                             'itemKey',
                             'collectionKey',
                             'searchKey',
                             'locale',
                             'tag',
                             'tagType',
                             'key',
                             'style',
                             'linkMode',
                             'linkwrap',
                             'session',
                             'newer',
                             'since'
                             ];
    queryParamOptions.sort();
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
    
    //take out collectionKey if it is not a list
    if(passedParams.hasOwnProperty('target') && passedParams['target'] !== 'collections'){
        if(queryParams.hasOwnProperty('collectionKey') && queryParams['collectionKey'].indexOf(',') === -1){
            delete queryParams['collectionKey'];
        }
    }
    
    //add each of the found queryParams onto array
    J.each(queryParams, function(index, value){
        if(value instanceof Array){
            J.each(value, function(i, v){
                if(index == "tag" && v[0] == "-"){
                    v = "\\" + v;
                }
                queryParamsArray.push(encodeURIComponent(index) + '=' + encodeURIComponent(v));
            });
        }
        else{
            if(index == "tag" && value[0] == "-"){
                value = "\\" + value;
            }
            queryParamsArray.push(encodeURIComponent(index) + '=' + encodeURIComponent(value));
        }
    });
    
    //build query string by concatenating array
    queryString += queryParamsArray.join('&');
    //Z.debug("resulting queryString:" + queryString);
    return queryString;
};

Zotero.ajax.apiRequestString = function(config){
    return Zotero.ajax.apiRequestUrl(config) + Zotero.ajax.apiQueryString(config);
};

Zotero.ajax.proxyWrapper = function(requestUrl, method){
    if(Zotero.config.proxy){
        if(!method){
            method = 'GET';
        }
        return Zotero.config.proxyPath + "?requestMethod=" + method + "&requestUrl=" + encodeURIComponent(requestUrl);
    }
    else{
        return requestUrl;
    }
};

Zotero.ajax.parseQueryString = function(query){
    
};

Zotero.ajax.webUrl = function(args){
    
};

Zotero.ajax.downloadBlob = function(url){
    return new Promise(function(resolve, reject){
        var xhr = new XMLHttpRequest();
        var blob;
        
        xhr.open("GET", url, true);
        xhr.responseType = "blob";
        
        xhr.addEventListener("load", function () {
            if (xhr.status === 200) {
                Z.debug("downloadBlob Image retrieved. resolving", 3);
                resolve(xhr.response);
            }
            else {
                reject(xhr.response);
            }
        } );
        // Send XHR
        xhr.send();
    });
};

Zotero.ApiObject = function(){
    this.instance = "Zotero.ApiObject";
    this.version = 0;
};

//associate Entry with a library so we can update it on the server
Zotero.ApiObject.prototype.associateWithLibrary = function(library){
    var apiObject = this;
    apiObject.owningLibrary = library;
    if(typeof this.apiObj.library == "object"){
        this.apiObj.library.type = library.type;
        this.apiObj.library.id = library.libraryID;
    }
    return apiObject;
};

Zotero.ApiObject.prototype.fieldComparer = function(attr){
    if(window.Intl){
        var collator = new window.Intl.Collator();
        return function(a, b){
            return collator.compare(a.apiObj.data[attr], b.apiObj.data[attr]);
        };
    } else {
        return function(a, b){
            if(a.apiObj.data[attr].toLowerCase() == b.apiObj.data[attr].toLowerCase()){
                return 0;
            }
            if(a.apiObj.data[attr].toLowerCase() < b.apiObj.data[attr].toLowerCase()){
                return -1;
            }
            return 1;
        };
    }
};
Zotero.ApiResponse = function(response) {
    Z.debug("Zotero.ApiResponse", 3);
    this.totalResults = 0;
    this.apiVersion = null;
    this.lastModifiedVersion = 0;
    this.linkHeader = '';
    this.links = {};
    
    if(response){
        if(!response.isError){
            this.isError = false;
        } else {
            this.isError = true;
        }
        this.data = response.data;
        //this.jqxhr = response.jqxhr;
        this.parseResponse(response);
    }
};

Zotero.ApiResponse.prototype.parseResponse = function(response){
    Z.debug("parseResponse");
    var apiResponse = this;
    apiResponse.jqxhr = response.jqxhr;
    apiResponse.status = response.jqxhr.status;
    //keep track of relevant headers
    apiResponse.lastModifiedVersion = response.jqxhr.getResponseHeader("Last-Modified-Version");
    apiResponse.apiVersion = response.jqxhr.getResponseHeader("Zotero-API-Version");
    apiResponse.backoff = response.jqxhr.getResponseHeader("Backoff");
    apiResponse.retryAfter = response.jqxhr.getResponseHeader("Retry-After");
    apiResponse.contentType = response.jqxhr.getResponseHeader("Content-Type");
    apiResponse.linkHeader = response.jqxhr.getResponseHeader("Link");
    apiResponse.totalResults = response.jqxhr.getResponseHeader("Total-Results");
    if(apiResponse.backoff){
        apiResponse.backoff = parseInt(apiResponse.backoff, 10);
    }
    if(apiResponse.retryAfter){
        apiResponse.retryAfter = parseInt(apiResponse.retryAfter, 10);
    }
    //TODO: parse link header into individual links
    Z.debug("parse link header");
    Z.debug(apiResponse.linkHeader);
    if(apiResponse.linkHeader){
        var links = apiResponse.linkHeader.split(',');
        var parsedLinks = {};
        var linkRegex = /^<([^>]+)>; rel="([^\"]*)"$/;
        for(var i = 0; i < links.length; i++){
            var matches = linkRegex.exec(links[i].trim());
            if(matches[2]){
                parsedLinks[matches[2]] = matches[1];
            }
        }
        apiResponse.parsedLinks = parsedLinks;
    }
    Z.debug("done parsing response");
};/*
 * Make concurrent and sequential network requests, respecting backoff/retry-after
 * headers, and keeping concurrent requests below a certain limit.
 * 
 * Push onto the queue individual or arrays of requestConfig objects
 * If there is room for requests and we are not currently backing off:
 *   start a sequential series, or individual request
 * When any request or set of requests finishes, we preprocess the response,
 * looking for backoff/retry-after to obey, and putting sequential responses
 * into an array. We then trigger the next waiting request.
 * 
 */

Zotero.Net = function(){
    this.deferredQueue = [];
    this.numRunning = 0;
    this.numConcurrent = 3;
    this.backingOff = false;
};

Zotero.Net.prototype.queueDeferred = function(){
    var net = this;
    var d = new J.Deferred();
    net.deferredQueue.push(d);
    return Promise.resolve(d);
};

Zotero.Net.prototype.queueRequest = function(requestObject){
    Z.debug("Zotero.Net.queueRequest", 3);
    var net = this;
    var resultPromise;
    
    if(J.isArray(requestObject)){
        resultPromise = net.queueDeferred().then(function(){
            Z.debug("running sequential after queued deferred resolved", 4);
            return net.runSequential(requestObject);
        }).then(function(response){
            Z.debug("runSequential done", 3);
            net.queuedRequestDone();
            return response;
        });
    }
    else {
        resultPromise = net.queueDeferred().then(function(){
            Z.debug("running concurrent after queued deferred resolved", 4);
            return net.runConcurrent(requestObject);
        }).then(function(response){
            Z.debug("done with queuedRequest");
            net.queuedRequestDone();
            return response;
        });
    }
    
    net.runNext();
    return resultPromise.catch(function(error){
        Z.error("Error before leaving Zotero.Net");
        Z.error(error);
    });
};

Zotero.Net.prototype.runConcurrent = function(requestObject){
    Z.debug("Zotero.Net.runConcurrent", 3);
    return this.ajaxRequest(requestObject).then(function(response){
        Z.debug("done with runConcurrent request");
        return response;
    });
};

//run the set of requests serially
//chaining each request onto the .then of the previous one, after
//adding the previous response to a responses array that will be
//returned via promise to the caller when all requests are complete
Zotero.Net.prototype.runSequential = function(requestObjects){
    Z.debug("Zotero.Net.runSequential", 3);
    var net = this;
    var responses = [];
    var seqPromise = Promise.resolve();
    
    for(var i = 0; i < requestObjects.length; i++){
        var requestObject = requestObjects[i];
        seqPromise = seqPromise.then(function(){
            var p = net.ajaxRequest(requestObject)
            .then(function(response){
                Z.debug('pushing sequential response into result array');
                responses.push(response);
            });
            return p;
        });
    }
    
    return seqPromise.then(function(){
        Z.debug("done with sequential aggregator promise - returning responses");
        return responses;
    });
};

//when one concurrent call, or a sequential series finishes, subtract it from the running
//count and run the next if there is something waiting to be run
Zotero.Net.prototype.individualRequestDone = function(response){
    Z.debug("Zotero.Net.individualRequestDone", 3);
    var net = this;
    var nowms = Date.now();
    
    //check if we need to back off before making more requests
    var wait = net.checkDelay(response);
    if(wait > 0){
        waitms = wait * 1000;
        net.backingOff = true;
        var waitExpiration = Date.now() + waitms;
        if(waitExpiration > net.waitingExpires){
            net.waitingExpires = waitExpiration;
        }
        window.setTimeout(net.runNext, waitms);
    }
    
    return response;
};

Zotero.Net.prototype.queuedRequestDone = function(response){
    Z.debug('queuedRequestDone', 3);
    var net = this;
    net.numRunning--;
    net.runNext();
    return response;
};

Zotero.Net.prototype.runNext = function(){
    Z.debug("Zotero.Net.runNext", 3);
    var net = this;
    var nowms = Date.now();
    
    //check if we're backing off and need to remain backing off,
    //or if we should now continue
    if(net.backingOff && (net.waitingExpires > (nowms - 100)) ){
        Z.debug("currently backing off", 3);
        var waitms = net.waitingExpires - nowms;
        window.setTimeout(net.runNext, waitms);
        return;
    }
    else if(net.backingOff && (net.waitingExpires <= (nowms - 100))){
        net.backingOff = false;
    }
    
    //continue making requests up to the concurrent limit
    Z.debug(net.numRunning + "/" + net.numConcurrent + " Running. " + net.deferredQueue.length + " queued.", 3);
    while((net.deferredQueue.length > 0) && (net.numRunning < net.numConcurrent)){
        net.numRunning++;
        var nextD = net.deferredQueue.shift();
        nextD.resolve();
        Z.debug(net.numRunning + "/" + net.numConcurrent + " Running. " + net.deferredQueue.length + " queued.", 3);
    }
};

Zotero.Net.prototype.checkDelay = function(response){
    Z.debug('Zotero.Net.checkDelay');
    Z.debug(response);
    var net = this;
    var wait = 0;
    if(J.isArray(response)){
        for(var i = 0; i < response.length; i++){
            iwait = net.checkDelay(response[i]);
            if(iwait > wait){
                wait = iwait;
            }
        }
    }
    else {
        if(response.status == 429){
            wait = response.retryAfter;
        }
        else if(response.backoff){
            wait = response.backoff;
        }
    }
    return wait;
};

Zotero.Net.prototype.ajaxRequest = function(requestConfig){
    Z.debug("Zotero.Net.ajaxRequest", 3);
    var net = this;
    var defaultConfig = {
        type:'GET',
        headers:{
            'Zotero-API-Version': Zotero.config.apiVersion,
            'Content-Type': 'application/json',
        },
        success: function(response){
            return response;
        },
        error: function(response){
            Z.error("ajaxRequest rejected:" + response.jqxhr.statusCode() + " - " + response.jqxhr.responseText);
            return response;
        },
        //cache:false
    };
    var headers = J.extend({}, defaultConfig.headers, requestConfig.headers);
    var config = J.extend({}, defaultConfig, requestConfig);
    config.headers = headers;
    if(typeof config.url == 'object'){
        config.url = Zotero.ajax.apiRequestString(config.url);
    }
    config.url = Zotero.ajax.proxyWrapper(config.url, config.type);
    
    if(!config.url){
        throw "No url specified in Zotero.Net.ajaxRequest";
    }
    //rename success/error callbacks so J.ajax does not actually use them
    //and we can use them as es6 promise result functions with expected
    //single value arguments
    config.zsuccess = config.success;
    config.zerror = config.error;
    delete config.success;
    delete config.error;
    
    ajaxpromise = new Promise(function(resolve, reject){
        J.ajax(config)
        .then(function(data, textStatus, jqxhr){
            Z.debug("library.ajaxRequest jqxhr resolved. resolving Promise", 3);
            var r = new Zotero.ApiResponse({
                jqxhr: jqxhr,
                data: data,
                textStatus: textStatus
            });
            resolve(r);
        }, function(jqxhr, textStatus, errorThrown){
            Z.debug("library.ajaxRequest jqxhr rejected. rejecting Promise", 3);
            var r = new Zotero.ApiResponse({
                jqxhr: jqxhr,
                textStatus: textStatus,
                errorThrown: errorThrown,
                isError: true,
            });
            reject(r);
        });
    })
    .then(J.proxy(net.individualRequestDone, net))
    .then(function(response){
        //now that we're done handling, reject
        if(response.isError){
            Z.error("re-throwing ApiResponse that was a rejection");
            throw response;
        }
        return response;
    })
    .then(config.zsuccess, config.zerror);
    
    //Zotero.ajax.activeRequests.push(ajaxpromise);
    return ajaxpromise;
};

Zotero.net = new Zotero.Net();
/**
 * A user or group Zotero library. This is generally the top level object
 * through which interactions should happen. It houses containers for
 * Zotero API objects (collections, items, etc) and handles making requests
 * with particular API credentials, as well as storing data locally.
 * @param {string} type                 type of library, 'user' or 'group'
 * @param {int} libraryID            ID of the library
 * @param {string} libraryUrlIdentifier identifier used in urls, could be library id or user/group slug
 * @param {string} apiKey               key to use for API requests
 */
Zotero.Library = function(type, libraryID, libraryUrlIdentifier, apiKey){
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
    library._apiKey = apiKey || '';
    
    if(Zotero.config.librarySettings){
        library.libraryBaseWebsiteUrl = Zotero.config.librarySettings.libraryPathString;
    }
    else{
        library.libraryBaseWebsiteUrl = Zotero.config.baseWebsiteUrl;
        if(type == 'group'){
            library.libraryBaseWebsiteUrl += 'groups/';
        }
        if(libraryUrlIdentifier){
            this.libraryBaseWebsiteUrl += libraryUrlIdentifier + '/items';
        } else {
            Z.warn("no libraryUrlIdentifier specified");
        }
    }
    //object holders within this library, whether tied to a specific library or not
    library.items = new Zotero.Items();
    library.items.owningLibrary = library;
    library.itemKeys = [];
    library.collections = new Zotero.Collections();
    library.collections.libraryUrlIdentifier = library.libraryUrlIdentifier;
    library.collections.owningLibrary = library;
    library.tags = new Zotero.Tags();
    library.searches = new Zotero.Searches();
    library.searches.owningLibrary = library;
    library.groups = new Zotero.Groups();
    library.groups.owningLibrary = library;
    library.deleted = new Zotero.Deleted();
    library.deleted.owningLibrary = library;
    
    if(!type){
        //return early if library not specified
        Z.warn("No type specified for library");
        return;
    }
    //attributes tying instance to a specific Zotero library
    library.type = type;
    library.libraryType = type;
    library.libraryID = libraryID;
    library.libraryString = Zotero.utils.libraryString(library.libraryType, library.libraryID);
    library.libraryUrlIdentifier = libraryUrlIdentifier;
    
    //initialize preferences object
    library.preferences = new Zotero.Preferences(Zotero.store, library.libraryString);
    
    //initialize indexedDB if we're supposed to use it
    //detect safari until they fix their shit
    var is_chrome = navigator.userAgent.indexOf('Chrome') > -1;
    var is_explorer = navigator.userAgent.indexOf('MSIE') > -1;
    var is_firefox = navigator.userAgent.indexOf('Firefox') > -1;
    var is_safari = navigator.userAgent.indexOf("Safari") > -1;
    var is_opera = navigator.userAgent.toLowerCase().indexOf("op") > -1;
    if ((is_chrome)&&(is_safari)) {is_safari=false;}
    if ((is_chrome)&&(is_opera)) {is_chrome=false;}
    if(is_safari) {
        Zotero.config.useIndexedDB = false;
        Zotero.warn("Safari detected; disabling indexedDB");
    }

    if(Zotero.config.useIndexedDB === true){
        Z.debug("Library Constructor: indexedDB init", 3);
        var idbLibrary = new Zotero.Idb.Library(library.libraryString);
        idbLibrary.owningLibrary = this;
        library.idbLibrary = idbLibrary;
        idbLibrary.init()
        .then(function(){
            Z.debug("Library Constructor: idbInitD Done", 3);
            if(Zotero.config.preloadCachedLibrary === true){
                Z.debug("Library Constructor: preloading cached library", 3);
                var cacheLoadD = library.loadIndexedDBCache();
                cacheLoadD.then(function(){
                    //TODO: any stuff that needs to execute only after cache is loaded
                    //possibly fire new events to cause display to refresh after load
                    Z.debug("Library Constructor: Library.items.itemsVersion: " + library.items.itemsVersion, 3);
                    Z.debug("Library Constructor: Library.collections.collectionsVersion: " + library.collections.collectionsVersion, 3);
                    Z.debug("Library Constructor: Library.tags.tagsVersion: " + library.tags.tagsVersion, 3);
                    /*
                    J.each(library.tags.tagObjects, function(key, tag){
                        Z.debug("Library Constructor: tag.version:" + tag.version);
                        Z.debug("Library Constructor: tag.version:" + tag.apiObj.version);
                    });
                    */
                    Z.debug("Library Constructor: Triggering cachedDataLoaded", 3);
                    library.trigger('cachedDataLoaded');
                },
                function(err){
                    Z.error("Error loading cached library");
                    Z.error(err);
                    throw new Error("Error loading cached library");
                });
            }
            else {
                //trigger cachedDataLoaded since we are done with that step
                library.trigger('cachedDataLoaded');
            }
        },
        function(){
            //can't use indexedDB. Set to false in config and trigger error to notify user
            Zotero.config.useIndexedDB = false;
            library.trigger("indexedDBError");
            library.trigger('cachedDataLoaded');
            Z.error("Error initializing indexedDB. Promise rejected.");
            //don't re-throw error, since we can still load data from the API
        });
    }
    
    library.dirty = false;
    
    //set noop data-change callbacks
    library.tagsChanged = function(){};
    library.collectionsChanged = function(){};
    library.itemsChanged = function(){};
};
/**
 * Items columns for which sorting is supported
 * @type {Array}
 */
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
/**
 * Columns that can be displayed in an items table UI
 * @type {Array}
 */
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
/**
 * Items columns that only apply to group libraries
 * @type {Array}
 */
Zotero.Library.prototype.groupOnlyColumns = ['addedBy'
                                             /*'modifiedBy'*/];

/**
 * Sort function that converts strings to locale lower case before comparing,
 * however this is still not particularly effective at getting correct localized
 * sorting in modern browsers due to browser implementations being poor. What we
 * really want here is to strip diacritics first.
 * @param  {string} a [description]
 * @param  {string} b [description]
 * @return {int}   [description]
 */
Zotero.Library.prototype.comparer = function(){
    if(window.Intl){
        return new window.Intl.Collator().compare;
    } else {
        return function(a, b){
            if(a.toLocaleLowerCase() == b.toLocaleLowerCase()){
                return 0;
            }
            if(a.toLocaleLowerCase() < b.toLocaleLowerCase()){
                return -1;
            }
            return 1;
        };
    }
};

//Zotero library wrapper around jQuery ajax that returns a jQuery promise
//@url String url to request or object for input to apiRequestUrl and query string
//@type request method
//@options jquery options that are not the default for Zotero requests
Zotero.Library.prototype.ajaxRequest = function(url, type, options){
    Z.debug("Library.ajaxRequest", 3);
    if(!type){
        type = 'GET';
    }
    if(!options){
        options = {};
    }
    var requestObject = {
        url: url,
        type: type,
    };
    requestObject = J.extend({}, requestObject, options);
    Z.debug(requestObject, 3);
    return Zotero.net.queueRequest(requestObject);
};

//Take an array of objects that specify Zotero API requests and perform them
//in sequence.
//return deferred that gets resolved when all requests have gone through.
//Update versions after each request, otherwise subsequent writes won't go through.
//or do we depend on specified callbacks to update versions if necessary?
//fail on error?
//request object must specify: url, method, body, headers, success callback, fail callback(?)

/**
 * Take an array of objects that specify Zotero API requests and perform them
 * in sequence. Return a promise that gets resolved when all requests have
 * gone through.
 * @param  {[] Objects} requests Array of objects specifying requests to be made
 * @return {Promise}          Promise that resolves/rejects along with requests
 */
Zotero.Library.prototype.sequentialRequests = function(requests){
    Z.debug("Zotero.Library.sequentialRequests", 3);
    var library = this;
    return Zotero.net.queueRequest(requests);
};

/**
 * Generate a website url based on a dictionary of variables and the configured
 * libraryBaseWebsiteUrl
 * @param  {Object} urlvars Dictionary of key/value variables
 * @return {string}         website url
 */
Zotero.Library.prototype.websiteUrl = function(urlvars){
    Z.debug("Zotero.library.websiteUrl", 3);
    Z.debug(urlvars, 4);
    var library = this;
    
    var urlVarsArray = [];
    J.each(urlvars, function(index, value){
        if(value === '') return;
        urlVarsArray.push(index + '/' + value);
    });
    urlVarsArray.sort();
    Z.debug(urlVarsArray, 4);
    var pathVarsString = urlVarsArray.join('/');
    
    return library.libraryBaseWebsiteUrl + '/' + pathVarsString;
};


Zotero.Library.prototype.synchronize = function(){
    //get updated group metadata if applicable
    //  (this is an individual library method, so only necessary if this is
    //  a group library and we want to keep info about it)
    //sync library data
    //  get updated collections versions newer than current library version
    //  get updated searches versions newer than current library version
    //  get updated item versions newer than current library version
    //
};

/**
 * Make and process API requests to update the local library items based on the
 * versions we have locally. When the promise is resolved, we should have up to
 * date items in this library's items container, as well as saved to indexedDB
 * if configured to use it.
 * @return {Promise} Promise
 */
Zotero.Library.prototype.loadUpdatedItems = function(){
    Z.debug("Zotero.Library.loadUpdatedItems", 3);
    var library = this;
    //sync from the libraryVersion if it exists, otherwise use the itemsVersion, which is likely
    //derived from the most recent version of any individual item we have.
    var syncFromVersion = library.libraryVersion ? library.libraryVersion : library.items.itemsVersion;
    return Promise.resolve(library.updatedVersions("items", syncFromVersion))
    .then(function(response){
        Z.debug("itemVersions resolved", 3);
        Z.debug("items Last-Modified-Version: " + response.lastModifiedVersion, 3);
        library.items.updateSyncState(response.lastModifiedVersion);
        
        var itemVersions = response.data;
        library.itemVersions = itemVersions;
        var itemKeys = [];
        J.each(itemVersions, function(key, val){
            var item = library.items.getItem(key);
            if((!item) || (item.apiObj.key != val)){
                itemKeys.push(key);
            }
        });
        return library.loadItemsFromKeys(itemKeys);
    }).then(function(responses){
        Z.debug("loadItemsFromKeys resolved", 3);
        library.items.updateSyncedVersion();
        
        //TODO: library needs its own state
        var displayParams = Zotero.state.getUrlVars();
        library.buildItemDisplayView(displayParams);
        //save updated items to IDB
        if(Zotero.config.useIndexedDB){
            var saveItemsD = library.idbLibrary.updateItems(library.items.objectArray);
        }
    });
};

Zotero.Library.prototype.loadUpdatedCollections = function(){
    Z.debug("Zotero.Library.loadUpdatedCollections", 3);
    var library = this;
    //sync from the libraryVersion if it exists, otherwise use the collectionsVersion, which is likely
    //derived from the most recent version of any individual collection we have.
    Z.debug('library.collections.collectionsVersion:' + library.collections.collectionsVersion);
    var syncFromVersion = library.libraryVersion ? library.libraryVersion : library.collections.collectionsVersion;
    //we need modified collectionKeys regardless, so load them
    return library.updatedVersions("collections", syncFromVersion)
    .then(function(response){
        Z.debug("collectionVersions finished", 3);
        Z.debug("Collections Last-Modified-Version: " + response.lastModifiedVersion, 3);
        //start the syncState version tracking. This should be the earliest version throughout
        library.collections.updateSyncState(response.lastModifiedVersion);
        
        var collectionVersions = response.data;
        library.collectionVersions = collectionVersions;
        var collectionKeys = [];
        J.each(collectionVersions, function(key, val){
            var c = library.collections.getCollection(key);
            if((!c) || (c.apiObj.version != val)){
                collectionKeys.push(key);
            }
        });
        if(collectionKeys.length === 0){
            Z.debug("No collectionKeys need updating. resolving", 3);
            return response;
        }
        else {
            Z.debug("fetching collections by key", 3);
            return library.loadCollectionsFromKeys(collectionKeys)
            .then(function(){
                var collections = library.collections;
                collections.initSecondaryData();
                
                Z.debug("All updated collections loaded", 3);
                library.collections.updateSyncedVersion();
                //TODO: library needs its own state
                var displayParams = Zotero.state.getUrlVars();
                //save updated collections to cache
                Z.debug("loadUpdatedCollections complete - saving collections to cache before resolving", 3);
                Z.debug("collectionsVersion: " + library.collections.collectionsVersion, 3);
                //library.saveCachedCollections();
                //save updated collections to IDB
                if(Zotero.config.useIndexedDB){
                    return library.idbLibrary.updateCollections(collections.collectionsArray);
                }
            });
        }
    })
    .then(function(){
        Z.debug("done getting collection data. requesting deleted data", 3);
        return library.getDeleted(library.libraryVersion);
    })
    .then(function(response){
        Z.debug("got deleted collections data: removing local copies", 3);
        Z.debug(library.deleted);
        if(library.deleted.deletedData.collections && library.deleted.deletedData.collections.length > 0 ){
            library.collections.removeLocalCollections(library.deleted.deletedData.collections);
        }
    });
};

Zotero.Library.prototype.loadUpdatedTags = function(){
    Z.debug("Zotero.Library.loadUpdatedTags", 3);
    var library = this;
    Z.debug("tagsVersion: " + library.tags.tagsVersion, 3);
    return Promise.resolve(library.loadAllTags({since:library.tags.tagsVersion}))
    .then(function(){
        Z.debug("done getting tags, request deleted tags data", 3);
        return library.getDeleted(library.libraryVersion);
    })
    .then(function(response){
        Z.debug("got deleted tags data");
        if(library.deleted.deletedData.tags && library.deleted.deletedData.tags.length > 0 ){
            library.tags.removeTags(library.deleted.deletedData.tags);
        }
        //save updated tags to IDB
        if(Zotero.config.useIndexedDB){
            Z.debug("saving updated tags to IDB", 3);
            var saveTagsD = library.idbLibrary.updateTags(library.tags.tagsArray);
        }
    });
};

Zotero.Library.prototype.getDeleted = function(version) {
    Z.debug("Zotero.Library.getDeleted", 3);
    var library = this;
    var urlconf = {target:'deleted',
                   libraryType:library.libraryType,
                   libraryID:library.libraryID,
                   since:version
               };
    
    //if there is already a request working, create a new promise to resolve
    //when the actual request finishes
    if(library.deleted.pending){
        Z.debug("getDeleted resolving with previously pending promise");
        return Promise.resolve(library.deleted.pendingPromise);
    }
    
    //don't fetch again if version we'd be requesting is between
    //deleted.newer and delete.deleted versions, just use that one
    Z.debug("version:" + version);
    Z.debug('sinceVersion:' + library.deleted.sinceVersion);
    Z.debug('untilVersion:' + library.deleted.untilVersion);
    
    if(library.deleted.untilVersion &&
        version >= library.deleted.sinceVersion /*&&
        version < library.deleted.untilVersion*/){
        Z.debug("deletedVersion matches requested: immediately resolving");
        return Promise.resolve(library.deleted.deletedData);
    }
    
    library.deleted.pending = true;
    library.deleted.pendingPromise = library.ajaxRequest(urlconf)
    .then(function(response){
        Z.debug("got deleted response");
        library.deleted.deletedData = response.data;
        Z.debug("Deleted Last-Modified-Version:" + response.lastModifiedVersion, 3);
        library.deleted.untilVersion = response.lastModifiedVersion;
        library.deleted.sinceVersion = version;
    }).then(function(response){
        Z.debug("cleaning up deleted pending");
        library.deleted.pending = false;
        library.deleted.pendingPromise = false;
    });
    
    return library.deleted.pendingPromise;
};

Zotero.Library.prototype.processDeletions = function(deletions){
    var library = this;
    //process deleted collections
    library.collections.processDeletions(deletions.collections);
    //process deleted items
    library.items.processDeletions(deletions.items);
};

//Get a full bibliography from the API for web based citating
Zotero.Library.prototype.loadFullBib = function(itemKeys, style){
    var library = this;
    var itemKeyString = itemKeys.join(',');
    var urlconfig = {
        'target':'items',
        'libraryType':library.libraryType,
        'libraryID':library.libraryID,
        'itemKey':itemKeyString,
        'format':'bib',
        'linkwrap':'1'
    };
    if(itemKeys.length == 1){
        urlconfig.target = 'item';
    }
    if(style){
        urlconfig['style'] = style;
    }
    
    var loadBibPromise = library.ajaxRequest(urlconfig)
    .then(function(response){
        return response.data;
    });
    
    return loadBibPromise;
};

//load bib for a single item from the API
Zotero.Library.prototype.loadItemBib = function(itemKey, style) {
    Z.debug("Zotero.Library.loadItemBib", 3);
    var library = this;
    var urlconfig = {
        'target':'item',
        'libraryType':library.libraryType,
        'libraryID':library.libraryID,
        'itemKey':itemKey,
        'content':'bib'
    };
    if(style){
        urlconfig['style'] = style;
    }
    
    var requestUrl = Zotero.ajax.apiRequestString(urlconfig);
    var itemBibPromise = library.ajaxRequest(urlconfig)
    .then(function(response){
        var item = new Zotero.Item(response.data);
        var bibContent = item.apiObj.bib;
        return bibContent;
    });
    
    return itemBibPromise;
};

//load library settings from Zotero API and return a promise that gets resolved with
//the Zotero.Preferences object for this library
Zotero.Library.prototype.loadSettings = function() {
    Z.debug("Zotero.Library.loadSettings", 3);
    var library = this;
    var urlconfig = {
        'target':'settings',
        'libraryType':library.libraryType,
        'libraryID':library.libraryID
    };
    
    return library.ajaxRequest(urlconfig)
    .then(function(response){
        var resultObject;
        if(typeof response.data == 'string'){
            resultObject = JSON.parse(response.data);
        }
        else {
            resultObject = response.data;
        }
        //save the full settings object so we have it available if we need to write,
        //even if it has settings we don't use or know about
        library.preferences.setPref('settings', resultObject);
        
        //pull out the settings we know we care about so we can query them directly
        if(resultObject.tagColors){
            var tagColors = resultObject.tagColors.value;
            library.preferences.setPref('tagColors', tagColors);
            /*
            for(var i = 0; i < tagColors.length; i++){
                var t = library.tags.getTag(tagColors[i].name);
                if(t){
                    t.color = tagColors[i].color;
                }
            }
            */
        }
        
        library.trigger('settingsLoaded');
        return library.preferences;
    });
};

Zotero.Library.prototype.matchColoredTags = function(tags) {
    var library = this;
    var i;
    var tagColorsSettings = library.preferences.getPref("tagColors");
    if(!tagColorsSettings) return [];
    
    var tagColorsMap = {};
    for(i = 0; i < tagColorsSettings.length; i++){
        tagColorsMap[tagColorsSettings[i].name.toLowerCase()] = tagColorsSettings[i].color;
    }
    var resultTags = [];
    
    for(i = 0; i < tags.length; i++){
        if(tagColorsMap.hasOwnProperty(tags[i]) ) {
            resultTags.push(tagColorsMap[tags[i]]);
        }
    }
    return resultTags;
};

/**
 * Duplicate existing Items from this library and save to foreignLibrary
 * with relationships indicating the ties. At time of writing, Zotero client
 * saves the relationship with either the destination group of two group
 * libraries or the personal library.
 * @param  {Zotero.Item[]} items
 * @param  {Zotero.Library} foreignLibrary
 * @return {Promise.Zotero.Item[]} - newly created items
 */
Zotero.Library.prototype.sendToLibrary = function(items, foreignLibrary){
    var foreignItems = [];
    for(var i = 0; i < items.length; i++){
        var item = items[i];
        var transferData = item.emptyJsonItem();
        transferData.data = J.extend({}, items[i].apiObj.data);
        //clear data that shouldn't be transferred:itemKey, collections
        transferData.data.key = '';
        transferData.data.version = 0;
        transferData.data.collections = [];
        delete transferData.data.dateModified;
        delete transferData.data.dateAdded;
        
        var newForeignItem = new Zotero.Item(transferData);
        
        newForeignItem.pristine = J.extend({}, newForeignItem.apiObj);
        newForeignItem.initSecondaryData();
        
        //set relationship to tie to old item
        if(!newForeignItem.apiObj.data.relations){
            newForeignItem.apiObj.data.relations = {};
        }
        newForeignItem.apiObj.data.relations['owl:sameAs'] = Zotero.url.relationUrl(item.owningLibrary.libraryType, item.owningLibrary.libraryID, item.key);
        foreignItems.push(newForeignItem);
    }
    return foreignLibrary.items.writeItems(foreignItems);
};

/*METHODS FOR WORKING WITH THE ENTIRE LIBRARY -- NOT FOR GENERAL USE */

//sync pull:
//upload changed data
// get updatedVersions for collections
// get updatedVersions for searches
// get upatedVersions for items
// (sanity check versions we have for individual objects?)
// loadCollectionsFromKeys
// loadSearchesFromKeys
// loadItemsFromKeys
// process updated objects:
//      ...
// getDeletedData
// process deleted
// checkConcurrentUpdates (compare Last-Modified-Version from collections?newer request to one from /deleted request)

Zotero.Library.prototype.updatedVersions = function(target, version){
    Z.debug("Library.updatedVersions", 3);
    var library = this;
    if(typeof target === "undefined"){
        target = "items";
    }
    if(typeof version === "undefined" || (version === null) ){
        version = library.libraryVersion;
    }
    var urlconf = {
        target: target,
        format: 'versions',
        libraryType: library.libraryType,
        libraryID: library.libraryID,
        since: version
    };
    return library.ajaxRequest(urlconf);
};

//Download and save information about every item in the library
//keys is an array of itemKeys from this library that we need to download
Zotero.Library.prototype.loadItemsFromKeys = function(keys){
    Zotero.debug("Zotero.Library.loadItemsFromKeys", 3);
    var library = this;
    return library.loadFromKeys(keys, "items");
};

//keys is an array of collectionKeys from this library that we need to download
Zotero.Library.prototype.loadCollectionsFromKeys = function(keys){
    Zotero.debug("Zotero.Library.loadCollectionsFromKeys", 3);
    var library = this;
    return library.loadFromKeys(keys, "collections");
};

//keys is an array of searchKeys from this library that we need to download
Zotero.Library.prototype.loadSeachesFromKeys = function(keys){
    Zotero.debug("Zotero.Library.loadSearchesFromKeys", 3);
    var library = this;
    return library.loadFromKeys(keys, "searches");
};

Zotero.Library.prototype.loadFromKeys = function(keys, objectType){
    Zotero.debug("Zotero.Library.loadFromKeys", 3);
    if(!objectType) objectType = 'items';
    var library = this;
    var keyslices = [];
    while(keys.length > 0){
        keyslices.push(keys.splice(0, 50));
    }
    
    var requestObjects = [];
    J.each(keyslices, function(ind, keyslice){
        var keystring = keyslice.join(',');
        switch (objectType) {
            case "items":
                requestObjects.push({
                    url: {
                        'target':'items',
                        'targetModifier':null,
                        'itemKey':keystring,
                        'limit':50,
                        'libraryType':library.libraryType,
                        'libraryID':library.libraryID,
                    },
                    type: 'GET',
                    success: J.proxy(library.processLoadedItems, library),
                });
                break;
            case "collections":
                requestObjects.push({
                    url: {
                        'target':'collections',
                        'targetModifier':null,
                        'collectionKey':keystring,
                        'limit':50,
                        'libraryType':library.libraryType,
                        'libraryID':library.libraryID,
                    },
                    type: 'GET',
                    success: J.proxy(library.processLoadedCollections, library),
                });
                break;
            case "searches":
                requestObjects.push({
                    url: {
                        'target':'searches',
                        'targetModifier':null,
                        'searchKey':keystring,
                        'limit':50,
                        'libraryType':library.libraryType,
                        'libraryID':library.libraryID,
                    },
                    type: 'GET',
                    //success: J.proxy(library.processLoadedSearches, library)
                });
                break;
        }
    });
    
    var promises = [];
    for(var i = 0; i < requestObjects.length; i++){
        promises.push(Zotero.net.queueRequest(requestObjects[i]));
    }
    return Promise.all(promises);
    /*
    return Zotero.net.queueRequest(requestObjects);
    */
};

//publishes: displayedItemsUpdated
//assume we have up to date information about items in indexeddb.
//build a list of indexedDB filter requests to then intersect to get final result
Zotero.Library.prototype.buildItemDisplayView = function(params) {
    Z.debug("Zotero.Library.buildItemDisplayView", 3);
    Z.debug(params, 4);
    //start with list of all items if we don't have collectionKey
    //otherwise get the list of items in that collection
    var library = this;
    //short-circuit if we don't have an initialized IDB yet
    if(!library.idbLibrary.db){
        return Promise.resolve([]);
    }
    
    var itemKeys;
    var filterPromises = [];
    if(params.collectionKey){
        if(params.collectionKey == 'trash'){
            filterPromises.push(library.idbLibrary.filterItems('deleted', 1));
        }
        else{
            filterPromises.push(library.idbLibrary.filterItems('collectionKeys', params.collectionKey));
        }
    }
    else {
        filterPromises.push(library.idbLibrary.getOrderedItemKeys('title'));
    }
    
    //filter by selected tags
    var selectedTags = params.tag || [];
    if(typeof selectedTags == 'string') selectedTags = [selectedTags];
    for(var i = 0; i < selectedTags.length; i++){
        Z.debug('adding selected tag filter', 3);
        filterPromises.push(library.idbLibrary.filterItems('itemTagStrings', selectedTags[i]));
    }
    
    //TODO: filter by search term. 
    //(need full text array or to decide what we're actually searching on to implement this locally)
    
    //when all the filters have been applied, combine and sort
    return Promise.all(filterPromises)
    .then(function(results){
        var i;
        for(i = 0; i < results.length; i++){
            Z.debug("result from filterPromise: " + results[i].length, 3);
            Z.debug(results[i], 3);
        }
        var finalItemKeys = library.idbLibrary.intersectAll(results);
        itemsArray = library.items.getItems(finalItemKeys);
        
        Z.debug("All filters applied - Down to " + itemsArray.length + ' items displayed', 3);
        
        Z.debug("remove child items and, if not viewing trash, deleted items", 3);
        var displayItemsArray = [];
        for(i = 0; i < itemsArray.length; i++){
            if(itemsArray[i].apiObj.data.parentItem){
                continue;
            }
            
            if(params.collectionKey != 'trash' && itemsArray[i].apiObj.deleted){
                continue;
            }
            
            displayItemsArray.push(itemsArray[i]);
        }
        
        //sort displayedItemsArray by given or configured column
        var orderCol = params['order'] || 'title';
        var sort = params['sort'] || 'asc';
        Z.debug("Sorting by " + orderCol + " - " + sort, 3);
        
        var comparer = Zotero.Library.prototype.comparer();
        
        displayItemsArray.sort(function(a, b){
            var aval = a.get(orderCol);
            var bval = b.get(orderCol);
            
            return comparer(aval, bval);
        });
        
        if(sort == 'desc'){
            Z.debug("sort is desc - reversing array", 4);
            displayItemsArray.reverse();
        }
        
        //publish event signalling we're done
        Z.debug("triggering publishing displayedItemsUpdated", 3);
        library.trigger("displayedItemsUpdated");
        return displayItemsArray;
    });
};

Zotero.Library.prototype.trigger = function(eventType, data){
    var library = this;
    Zotero.trigger(eventType, data, library.libraryString);
};

Zotero.Library.prototype.listen = function(events, handler, data){
    var library = this;
    var filter = library.libraryString;
    Zotero.listen(events, handler, data, filter);
};
Zotero.Container = function(){
    
};

Zotero.Container.prototype.initSecondaryData = function(){
    
};

Zotero.Container.prototype.addObject = function(object){
    Zotero.debug("Zotero.Container.addObject", 4);
    var container = this;
    container.objectArray.push(object);
    container.objectMap[object.key] = object;
    if(container.owningLibrary){
        object.associateWithLibrary(container.owningLibrary);
    }
    
    return container;
};

Zotero.Container.prototype.fieldComparer = function(field){
    if(window.Intl){
        var collator = new window.Intl.Collator();
        return function(a, b){
            return collator.compare(a.apiObj.data[field], b.apiObj.data[field]);
        };
    } else {
        return function(a, b){
            if(a.apiObj.data[field].toLowerCase() == b.apiObj.data[field].toLowerCase()){
                return 0;
            }
            if(a.apiObj.data[field].toLowerCase() < b.apiObj.data[field].toLowerCase()){
                return -1;
            }
            return 1;
        };
    }
};

Zotero.Container.prototype.getObject = function(key){
    var container = this;
    if(container.objectMap.hasOwnProperty(key)){
        return container.objectMap[key];
    }
    else{
        return false;
    }
};

Zotero.Container.prototype.getObjects = function(keys){
    var container = this;
    var objects = [];
    var object;
    for(var i = 0; i < keys.length; i++){
        object = container.getObject(keys[i]);
        if(object){
            objects.push(object);
        }
    }
    return objects;
};

Zotero.Container.prototype.removeObject = function(key){
    if(container.objectMap.hasOwnProperty(key)){
        delete container.objectmap[key];
        container.initSecondaryData();
    }
};

Zotero.Container.prototype.removeObjects = function(keys){
    var container = this;
    //delete Objects from objectMap;
    for(var i = 0; i < keys.length; i++){
        delete container.objectMap[keys[i]];
    }
    
    //rebuild array
    container.initSecondaryData();
};

Zotero.Container.prototype.writeObjects = function(objects){
    //TODO:implement
};

//generate keys for objects about to be written if they are new
Zotero.Container.prototype.assignKeys = function(objectsArray){
    var object;
    for(i = 0; i < objectsArray.length; i++){
        object = objectsArray[i];
        var key = object.get('key');
        if(!key) {
            var newObjectKey = Zotero.utils.getKey();
            object.set("key", newObjectKey);
            object.set("version", 0);
        }
    }
    return objectsArray;
};

//split an array of objects into chunks to write over multiple api requests
Zotero.Container.prototype.chunkObjectsArray = function(objectsArray){
    var chunkSize = 50;
    var writeChunks = [];
    
    for(i = 0; i < objectsArray.length; i = i + chunkSize){
        writeChunks.push(objectsArray.slice(i, i+chunkSize));
    }
    
    return writeChunks;
};

Zotero.Container.prototype.rawChunks = function(chunks){
    var rawChunkObjects = [];
    
    for(i = 0; i < chunks.length; i++){
        rawChunkObjects[i] = [];
        for(var j = 0; j < chunks[i].length; j++){
            rawChunkObjects[i].push(chunks[i][j].writeApiObj());
        }
    }
    return rawChunkObjects;
};

/**
 * Update syncState property on container to keep track of updates that occur during sync process.
 * Set earliestVersion to MIN(earliestVersion, version).
 * Set latestVersion to MAX(latestVersion, version).
 * This should be called with the modifiedVersion header for each response tied to this container
 * during a sync process.
 * @param  {Zotero.Container} container
 * @param  {int} version
 * @return {null}
 */
Zotero.Container.prototype.updateSyncState = function(version) {
    var container = this;
    Z.debug("updateSyncState: " + version, 3);
    if(!container.hasOwnProperty('syncState')){
        Z.debug("no syncState property");
        throw new Error("Attempt to update sync state of object with no syncState property");
    }
    if(container.syncState.earliestVersion === null){
        container.syncState.earliestVersion = version;
    }
    if(container.syncState.latestVersion === null){
        container.syncState.latestVersion = version;
    }
    if(version < container.syncState.earliestVersion){
        container.syncState.earliestVersion = version;
    }
    if(version > container.syncState.latestVersion){
        container.syncState.latestVersion = version;
    }
    Z.debug("done updating sync state", 3);
};

Zotero.Container.prototype.updateSyncedVersion = function(versionField) {
    var container = this;
    if(container.syncState.earliestVersion !== null &&
        (container.syncState.earliestVersion == container.syncState.latestVersion) ){
        container.version = container.syncState.latestVersion;
        container.synced = true;
    }
    else if(container.syncState.earliestVersion !== null) {
        container.version = container.syncState.earliestVersion;
    }
};

Zotero.Container.prototype.processDeletions = function(deletedKeys) {
    var container = this;
    for(var i = 0; i < deletedKeys.length; i++){
        var localObject = container.get(deletedKeys[i]);
        if(localObject !== false){
            //still have object locally
            if(localObject.synced === true){
                //our object is not modified, so delete it as the server thinks we should
                container.removeObjects([deletedKeys[i]]);
            }
            else {
                //TODO: conflict resolution
            }
        }
    }
};

//update items appropriately based on response to multi-write request
//for success:
//  update objectKey if item doesn't have one yet (newly created item)
//  update itemVersion to response's Last-Modified-Version header
//  mark as synced
//for unchanged:
//  don't need to do anything? itemVersion should remain the same?
//  mark as synced if not already?
//for failed:
//  add the failure to the object under writeFailure
//  don't mark as synced
//  calling code should check for writeFailure after the written objects
//  are returned
Zotero.Container.prototype.updateObjectsFromWriteResponse = function(objectsArray, response){
    Z.debug("Zotero.Container.updateObjectsFromWriteResponse", 3);
    Z.debug("statusCode: " + response.status, 3);
    var data = response.data;
    if(response.status == 200){
        Z.debug("newLastModifiedVersion: " + response.lastModifiedVersion, 3);
        //make sure writes were actually successful and
        //update the itemKey for the parent
        if(data.hasOwnProperty('success')){
            //update each successfully written item, possibly with new itemKeys
            J.each(data.success, function(ind, key){
                var i = parseInt(ind, 10);
                var object = objectsArray[i];
                //throw error if objectKey mismatch
                if(object.key !== "" && object.key !== key){
                    throw new Error("object key mismatch in multi-write response");
                }
                if(object.key === ''){
                    object.updateObjectKey(key);
                }
                object.set('version', response.lastModifiedVersion);
                object.synced = true;
                object.writeFailure = false;
            });
        }
        if(data.hasOwnProperty('failed')){
            Z.debug("updating objects with failed writes", 3);
            J.each(data.failed, function(ind, failure){
                Z.error("failed write " + ind + " - " + failure);
                var i = parseInt(ind, 10);
                var object = objectsArray[i];
                object.writeFailure = failure;
            });
        }
    }
    else if(responsexhr.status == 204){
        //single item put response, this probably should never go to this function
        objectsArray[0].synced = true;
    }
};

//return the key as a string when passed an argument that 
//could be either a string key or an object with a key property
Zotero.Container.prototype.extractKey = function(object){
    if(typeof object == 'string'){
        return object;
    }
    return object.get('key');
};
Zotero.Collections = function(jsonBody){
    var collections = this;
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
    
    if(jsonBody){
        this.addCollectionsFromJson(jsonBody);
        this.initSecondaryData();
    }
};

Zotero.Collections.prototype = new Zotero.Container();
//build up secondary data necessary to rendering and easy operations but that
//depend on all collections already being present
Zotero.Collections.prototype.initSecondaryData = function(){
    Z.debug("Zotero.Collections.initSecondaryData", 3);
    var collections = this;
    
    //rebuild collectionsArray
    collections.collectionsArray = [];
    J.each(collections.collectionObjects, function(ind, collection){
        collections.collectionsArray.push(collection);
    });
    
    collections.collectionsArray.sort(Zotero.ApiObject.prototype.fieldComparer('name'));
    collections.nestCollections();
    collections.assignDepths(0, collections.collectionsArray);
};

//take Collection XML and insert a Collection object
Zotero.Collections.prototype.addCollection = function(collection){
    this.addObject(collection);
    return this;
};

Zotero.Collections.prototype.addCollectionsFromJson = function(jsonBody){
    Z.debug("addCollectionsFromJson");
    Z.debug(jsonBody);
    var collections = this;
    var collectionsAdded = [];
    J.each(jsonBody, function(ind, collectionObj) {
        var collection = new Zotero.Collection(collectionObj);
        collections.addObject(collection);
        collectionsAdded.push(collection);
    });
    return collectionsAdded;
};

Zotero.Collections.prototype.assignDepths = function(depth, cArray){
    Z.debug("Zotero.Collections.assignDepths", 3);
    var collections = this;
    var insertchildren = function(depth, children){
        J.each(children, function(index, col){
            col.nestingDepth = depth;
            if(col.hasChildren){
                insertchildren((depth + 1), col.children);
            }
        });
    };
    J.each(collections.collectionsArray, function(index, collection){
        if(collection.topLevel){
            collection.nestingDepth = 1;
            if(collection.hasChildren){
                insertchildren(2, collection.children);
            }
        }
    });
};

Zotero.Collections.prototype.nestedOrderingArray = function(){
    Z.debug("Zotero.Collections.nestedOrderingArray", 3);
    var collections = this;
    var nested = [];
    var insertchildren = function(a, children){
        J.each(children, function(index, col){
            a.push(col);
            if(col.hasChildren){
                insertchildren(a, col.children);
            }
        });
    };
    J.each(collections.collectionsArray, function(index, collection){
        if(collection.topLevel){
            nested.push(collection);
            if(collection.hasChildren){
                insertchildren(nested, collection.children);
            }
        }
    });
    Z.debug("Done with nestedOrderingArray", 3);
    return nested;
};

Zotero.Collections.prototype.getCollection = function(key){
    return this.getObject(key);
};

Zotero.Collections.prototype.remoteDeleteCollection = function(collectionKey){
    var collections = this;
    return collections.removeLocalCollection(collectionKey);
};

Zotero.Collections.prototype.removeLocalCollection = function(collectionKey){
    var collections = this;
    return collections.removeLocalCollections([collectionKey]);
};

Zotero.Collections.prototype.removeLocalCollections = function(collectionKeys){
    var collections = this;
    //delete Collection from collectionObjects
    for(var i = 0; i < collectionKeys.length; i++){
        delete collections.collectionObjects[collectionKeys[i]];
    }
    
    //rebuild collectionsArray
    collections.initSecondaryData();
};

//reprocess all collections to add references to children inside their parents
Zotero.Collections.prototype.nestCollections = function(){
    var collections = this;
    //clear out all child references so we don't duplicate
    J.each(collections.collectionsArray, function(ind, collection){
        collection.children = [];
    });
    
    collections.collectionsArray.sort(Zotero.ApiObject.prototype.fieldComparer('name'));
    J.each(collections.collectionsArray, function(ind, collection){
        collection.nestCollection(collections.collectionObjects);
    });
};

Zotero.Collections.prototype.writeCollections = function(collectionsArray){
    Z.debug('Zotero.Collections.writeCollections', 3);
    var collections = this;
    var library = collections.owningLibrary;
    var writeCollections = [];
    var i;
    
    var config = {
        'target':'collections',
        'libraryType':collections.owningLibrary.libraryType,
        'libraryID':collections.owningLibrary.libraryID
    };
    var requestUrl = Zotero.ajax.apiRequestString(config);
    
    //add collectionKeys to collections if they don't exist yet
    for(i = 0; i < collectionsArray.length; i++){
        var collection = collectionsArray[i];
        //generate a collectionKey if the collection does not already have one
        var collectionKey = collection.get('key');
        if(collectionKey === "" || collectionKey === null) {
            var newCollectionKey = Zotero.utils.getKey();
            collection.set("key", newCollectionKey);
            collection.set("version", 0);
        }
    }

    var writeChunks = collections.chunkObjectsArray(collectionsArray);
    var rawChunkObjects = collections.rawChunks(writeChunks);
    //update collections with server response if successful
    var writeCollectionsSuccessCallback = function(response){
        Z.debug("writeCollections successCallback", 3);
        //pull vars out of this context so they're accessible in J.each context
        var library = this.library;
        var writeChunk = this.writeChunk;
        library.collections.updateObjectsFromWriteResponse(this.writeChunk, response);
        //save updated collections to collections
        for(var i = 0; i < writeChunk.length; i++){
            var collection = writeChunk[i];
            if(collection.synced && (!collection.writeFailure)) {
                library.collections.addCollection(collection);
                //save updated collections to IDB
                if(Zotero.config.useIndexedDB){
                    Z.debug("updating indexedDB collections");
                    library.idbLibrary.updateCollections(writeChunk);
                }
            }
        }
        response.returnCollections = writeChunk;
        return response;
    };
    
    Z.debug("collections.version: " + collections.version, 3);
    Z.debug("collections.libraryVersion: " + collections.libraryVersion, 3);
    
    var requestObjects = [];
    for(i = 0; i < writeChunks.length; i++){
        var successContext = {
            writeChunk: writeChunks[i],
            library: library,
        };
        
        requestData = JSON.stringify(rawChunkObjects[i]);
        requestObjects.push({
            url: requestUrl,
            type: 'POST',
            data: requestData,
            processData: false,
            headers:{
                //'If-Unmodified-Since-Version': collections.version,
                //'Content-Type': 'application/json'
            },
            success: J.proxy(writeCollectionsSuccessCallback, successContext),
        });
    }

    return library.sequentialRequests(requestObjects)
    .then(function(responses){
        Z.debug("Done with writeCollections sequentialRequests promise", 3);
        collections.initSecondaryData();
        
        J.each(responses, function(ind, response){
            if(response.isError || (response.data.hasOwnProperty('failed') && Object.keys(response.data.failed).length > 0) ){
                throw new Error("failure when writing collections");
            }
        });
        return responses;
    })
    .catch(function(err){
        Z.error(err);
        //rethrow so widget doesn't report success
        throw(err);
    });
};
Zotero.Items = function(jsonBody){
    this.instance = "Zotero.Items";
    //represent items as array for ordering purposes
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
    
    if(jsonBody){
        this.addItemsFromJson(jsonBody);
    }
};

Zotero.Items.prototype = new Zotero.Container();

Zotero.Items.prototype.getItem = function(key){
    return this.getObject(key);
};

Zotero.Items.prototype.getItems = function(keys){
    return this.getObjects(keys);
};

Zotero.Items.prototype.addItem = function(item){
    this.addObject(item);
    return this;
};

Zotero.Items.prototype.addItemsFromJson = function(jsonBody){
    Z.debug("addItemsFromJson", 3);
    var items = this;
    var parsedItemJson = jsonBody;
    var itemsAdded = [];
    J.each(parsedItemJson, function(index, itemObj) {
        var item = new Zotero.Item(itemObj);
        items.addItem(item);
        itemsAdded.push(item);
    });
    return itemsAdded;
};

//Remove item from local set if it has been marked as deleted by the server
Zotero.Items.prototype.removeLocalItem = function(key){
    return this.removeObject(key);
    /*
    var items = this;
    if(items.itemObjects.hasOwnProperty(key) && items.itemObjects[key].synced === true){
        delete items.itemObjects[key];
        return true;
    }
    return false;
    */
};

Zotero.Items.prototype.removeLocalItems = function(keys){
    return this.removeObjects(keys);
};

Zotero.Items.prototype.deleteItem = function(itemKey){
    Z.debug("Zotero.Items.deleteItem", 3);
    var items = this;
    var item;
    
    if(!itemKey) return false;
    itemKey = items.extractKey(itemKey);
    item = items.getItem(itemKey);
    
    var urlconfig = {
        'target':'item',
        'libraryType':items.owningLibrary.libraryType,
        'libraryID':items.owningLibrary.libraryID,
        'itemKey':item.key
    };
    var requestConfig = {
        url: Zotero.ajax.apiRequestString(config),
        type: 'DELETE',
        headers:{"If-Unmodified-Since-Version":item.get('version')},
    };
    
    return Zotero.net.ajaxRequest(requestConfig);
};

Zotero.Items.prototype.deleteItems = function(deleteItems, version){
    //TODO: split into multiple requests if necessary
    Z.debug("Zotero.Items.deleteItems", 3);
    var items = this;
    var deleteKeys = [];
    var i;
    if((!version) && (items.itemsVersion !== 0)){
        version = items.itemsVersion;
    }
    
    //make sure we're working with item keys, not items
    var key;
    for(i = 0; i < deleteItems.length; i++){
        if(!deleteItems[i]) continue;
        key = items.extractKey(deleteItems[i]);
        if(key){
            deleteKeys.push(key);
        }
    }
    
    //split keys into chunks of 50 per request
    var deleteChunks = items.chunkObjectsArray(deleteKeys);
    /*
    var successCallback = function(response){
        var deleteProgress = index / deleteChunks.length;
        Zotero.trigger("deleteProgress", {'progress': deleteProgress});
        return response;
    };
    */
    var requestObjects = [];
    for(i = 0; i < deleteChunks.length; i++){
        var deleteKeysString = deleteChunks[i].join(',');
        var urlconfig = {'target':'items',
                      'libraryType':items.owningLibrary.libraryType,
                      'libraryID':items.owningLibrary.libraryID,
                      'itemKey': deleteKeysString};
        //headers['If-Unmodified-Since-Version'] = version;
        
        var requestConfig = {
            url: urlconfig,
            type: 'DELETE',
        };
        requestObjects.push(requestConfig);
    }
    
    return Zotero.net.queueRequest(requestObjects);
};

Zotero.Items.prototype.trashItems = function(itemsArray){
    var items = this;
    var i;
    for(i = 0; i < itemsArray.length; i++){
        var item = itemsArray[i];
        item.set('deleted', 1);
    }
    return items.writeItems(itemsArray);
};

Zotero.Items.prototype.untrashItems = function(itemsArray){
    var items = this;
    var i;
    for(i = 0; i < itemsArray.length; i++){
        var item = itemsArray[i];
        item.set('deleted', 0);
    }
    return items.writeItems(itemsArray);
};

Zotero.Items.prototype.findItems = function(config){
    var items = this;
    var matchingItems = [];
    J.each(items.itemObjects, function(i, item){
        if(config.collectionKey && (J.inArray(config.collectionKey, item.apiObj.collections === -1) )){
            return;
        }
        matchingItems.push(items.itemObjects[i]);
    });
    return matchingItems;
};

//take an array of items and extract children into their own items
//for writing
Zotero.Items.prototype.atomizeItems = function(itemsArray){
    //process the array of items, pulling out child notes/attachments to write
    //separately with correct parentItem set and assign generated itemKeys to
    //new items
    var writeItems = [];
    var item;
    for(var i = 0; i < itemsArray.length; i++){
        item = itemsArray[i];
        //generate an itemKey if the item does not already have one
        var itemKey = item.get('key');
        if(itemKey === "" || itemKey === null) {
            var newItemKey = Zotero.utils.getKey();
            item.set("key", newItemKey);
            item.set("version", 0);
        }
        //items that already have item key always in first pass, as are their children
        writeItems.push(item);
        if(item.hasOwnProperty('notes') && item.notes.length > 0){
            for(var j = 0; j < item.notes.length; j++){
                item.notes[j].set('parentItem', item.get('key'));
            }
            writeItems = writeItems.concat(item.notes);
        }
        if(item.hasOwnProperty('attachments') && item.attachments.length > 0){
            for(var k = 0; k < item.attachments.length; k++){
                item.attachments[k].set('parentItem', item.get('key'));
            }
            writeItems = writeItems.concat(item.attachments);
        }
    }
    return writeItems;
};

//accept an array of 'Zotero.Item's
Zotero.Items.prototype.writeItems = function(itemsArray){
    var items = this;
    var library = items.owningLibrary;
    var i;
    var writeItems = items.atomizeItems(itemsArray);
    
    var config = {
        'target':'items',
        'libraryType':items.owningLibrary.libraryType,
        'libraryID':items.owningLibrary.libraryID,
    };
    var requestUrl = Zotero.ajax.apiRequestString(config);
    
    var writeChunks = items.chunkObjectsArray(writeItems);
    var rawChunkObjects = items.rawChunks(writeChunks);
    
    //update item with server response if successful
    var writeItemsSuccessCallback = function(response){
        Z.debug("writeItem successCallback", 3);
        items.updateObjectsFromWriteResponse(this.writeChunk, response);
        //save updated items to IDB
        if(Zotero.config.useIndexedDB){
            this.library.idbLibrary.updateItems(this.writeChunk);
        }
        
        Zotero.trigger("itemsChanged", {library:this.library});
        response.returnItems = this.writeChunk;
        return response;
    };
    
    Z.debug("items.itemsVersion: " + items.itemsVersion, 3);
    Z.debug("items.libraryVersion: " + items.libraryVersion, 3);
    
    var requestObjects = [];
    for(i = 0; i < writeChunks.length; i++){
        var successContext = {
            writeChunk: writeChunks[i],
            library: library,
        };
        
        requestData = JSON.stringify(rawChunkObjects[i]);
        requestObjects.push({
            url: requestUrl,
            type: 'POST',
            data: requestData,
            processData: false,
            success: J.proxy(writeItemsSuccessCallback, successContext),
        });
    }
    
    return library.sequentialRequests(requestObjects)
    .then(function(responses){
        Z.debug("Done with writeItems sequentialRequests promise", 3);
        return responses;
    });
};

/*
Zotero.Items.prototype.writeNewUnsyncedItems = function(){
    var items = this;
    var library = items.owningLibrary;
    var urlConfig = {target:'items', libraryType:library.libraryType, libraryID:library.libraryID};
    var writeUrl = Zotero.ajax.apiRequestUrl(urlConfig) + Zotero.ajax.apiQueryString(urlConfig);
    var writeData = {};
    writeData.items = [];
    for(var i = 0; i < items.newUnsyncedItems.length; i++){
        writeData.items.push(items.newUnsyncedItems[i].apiObj);
    }
    
    //make request to api to write items
    return Zotero.ajaxRequest(writeUrl, 'POST', {data:writeData})
    .then(function(response){
        if(response.jqxhr.status !== 200){
            //request atomically failed, nothing went through
        }
        else {
            //request went through and was processed
            //must check response body to know if writes failed for any reason
            var updatedVersion = response.jqxhr.getResponseHeader("Last-Modified-Version");
            if(typeof response.data !== 'object'){
                //unexpected response from server
            }
            var failedIndices = {};
            if(response.data.hasOwnProperty('success')){
                //add itemkeys to any successful creations
                J.each(response.data.success, function(key, val){
                    var index = parseInt(key, 10);
                    var objectKey = val;
                    var item = items.newUnsyncedItems[index];
                    
                    item.updateItemKey(objectKey);
                    item.version = updatedVersion;
                    item.synced = true;
                    items.addItem(item);
                });
            }
            if(response.data.hasOwnProperty('unchanged') ){
                J.each(response.data.unchanged, function(key, val){
                    
                });
            }
            if(response.data.hasOwnProperty('failed') ){
                J.each(response.data.failed, function(key, val){
                    failedIndices[key] = true;
                    Z.error("ItemWrite failed: " + val.key + " : http " + val.code + " : " + val.message, 1);
                });
            }
            
            //remove all but failed writes from newUnsyncedItems
            var newnewUnsyncedItems = [];
            J.each(items.newUnsyncedItems, function(i, v){
                if(failedIndices.hasOwnProperty(i)){
                    newnewUnsyncedItems.push(v);
                }
            });
            items.newUnsyncedItems = newnewUnsyncedItems;
        }
    });
};
*/Zotero.Tags = function(jsonBody){
    this.instance = "Zotero.Tags";
    //represent collections as array for ordering purposes
    this.tagsVersion = 0;
    this.syncState = {
        earliestVersion: null,
        latestVersion: null
    };
    this.displayTagsArray = [];
    this.displayTagsUrl = '';
    this.tagObjects = {};
    this.tagsArray = [];
    this.loaded = false;
    if(jsonBody){
        this.addTagsFromJson(jsonBody);
    }
};

Zotero.Tags.prototype = new Zotero.Container();

Zotero.Tags.prototype.addTag = function(tag){
    var tags = this;
    tags.tagObjects[tag.apiObj.tag] = tag;
    tags.tagsArray.push(tag);
    if(tags.owningLibrary){
        tag.associateWithLibrary(tags.owningLibrary);
    }
};

Zotero.Tags.prototype.getTag = function(tagname){
    var tags = this;
    if(tags.tagObjects.hasOwnProperty(tagname)){
        return this.tagObjects[tagname];
    }
    return null;
};

Zotero.Tags.prototype.removeTag = function(tagname){
    var tags = this;
    delete tags.tagObjects[tagname];
    tags.updateSecondaryData();
};

Zotero.Tags.prototype.removeTags = function(tagnames){
    var tags = this;
    J.each(tagnames, function(i, tagname){
        delete tags.tagObjects[tagname];
    });
    tags.updateSecondaryData();
};

Zotero.Tags.prototype.plainTagsList = function(tagsArray){
    Z.debug("Zotero.Tags.plainTagsList", 3);
    var plainList = [];
    J.each(tagsArray, function(index, tag){
        plainList.push(tag.apiObj.tag);
    });
    return plainList;
};

Zotero.Tags.prototype.clear = function(){
    Z.debug("Zotero.Tags.clear", 3);
    this.tagsVersion = 0;
    this.syncState.earliestVersion = null;
    this.syncState.latestVersion = null;
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
    tags.tagsArray.sort(Zotero.Tag.prototype.tagComparer());
    var plainList = tags.plainTagsList(tags.tagsArray);
    plainList.sort(Zotero.Library.prototype.comparer());
    tags.plainList = plainList;
};

Zotero.Tags.prototype.updateTagsVersion = function(tagsVersion) {
    var tags = this;
    J.each(tags.tagObjects, function(key, tag) {
        tag.set('version', tagsVersion);
    });
};

Zotero.Tags.prototype.rebuildTagsArray = function() {
    var tags = this;
    tags.tagsArray = [];
    J.each(tags.tagObjects, function(key, tag) {
        tags.tagsArray.push(tag);
    });
};

Zotero.Tags.prototype.addTagsFromJson = function(jsonBody){
    Z.debug('Zotero.Tags.addTagsFromJson', 3);
    var tags = this;
    var tagsAdded = [];
    J.each(jsonBody, function(index, tagObj){
        var tag = new Zotero.Tag(tagObj);
        tags.addTag(tag);
        tagsAdded.push(tag);
    });
    return tagsAdded;
};
Zotero.Groups = function(jsonBody){
    this.instance = 'Zotero.Groups';
    this.groupsArray = [];
};

Zotero.Groups.prototype.fetchGroup = function(groupID, apikey){
    
};

Zotero.Groups.prototype.addGroupsFromJson = function(jsonBody){
    var groups = this;
    var groupsAdded = [];
    J.each(jsonBody, function(index, groupObj){
        Z.debug(groupObj);
        var group = new Zotero.Group(groupObj);
        groups.groupsArray.push(group);
        groupsAdded.push(group);
    });
    return groupsAdded;
};

Zotero.Groups.prototype.fetchUserGroups = function(userID, apikey){
    var groups = this;
    var aparams = {
        'target':'userGroups',
        'libraryType':'user',
        'libraryID': userID,
        'order':'title'
    };
    
    if(apikey){
        aparams['key'] = apikey;
    }
    else if(groups.owningLibrary) {
        aparams['key'] = groups.owningLibrary._apiKey;
    }
    
    return Zotero.ajaxRequest(aparams)
    .then(function(response){
        Z.debug('fetchUserGroups proxied callback', 3);
        fetchedGroups = groups.addGroupsFromJson(response.data);
        response.fetchedGroups = fetchedGroups;
        return response;
    });
};

Zotero.Searches = function(){
    this.instance = "Zotero.Searches";
    this.searchObjects = {};
    this.syncState = {
        earliestVersion: null,
        latestVersion: null
    };
};
Zotero.Deleted = function(data){
    this.instance = "Zotero.Deleted";
    if(typeof data === 'string'){
        this.deletedData = JSON.parse(data);
    }
    else {
        this.deletedData = data;
    }
    this.untilVersion = null;
    this.sinceVersion = null;
    this.waitingPromises = [];
    this.pending = false;
};

//create, save referece, and return a Promise that will be resolved
//the next time we finish a deleted request
Zotero.Deleted.prototype.addWaiter = function(){
    
};
Zotero.Collection = function(collectionObj){
    this.instance = "Zotero.Collection";
    this.libraryUrlIdentifier = '';
    this.itemKeys = false;
    this.key = '';
    this.version = 0;
    this.synced = false;
    this.pristineData = null;
    this.apiObj = {
        'key': '',
        'version': 0,
        'library':{},
        'links':{},
        'meta':{},
        'data':{
            'key': '',
            'version': 0,
            'name': '',
            'parentCollection': false,
            'relations':{}
        },
    };
    this.children = [];
    this.topLevel = true;
    if(collectionObj){
        this.parseJsonCollection(collectionObj);
    }
};

Zotero.Collection.prototype = new Zotero.ApiObject();
Zotero.Collection.prototype.instance = "Zotero.Collection";

Zotero.Collection.prototype.updateObjectKey = function(collectionKey){
    this.updateCollectionKey(collectionKey);
};

Zotero.Collection.prototype.updateCollectionKey = function(collectionKey){
    var collection = this;
    collection.key = collectionKey;
    collection.apiObj.key = collectionKey;
    collection.apiObj.data.key = collectionKey;
    return collection;
};

Zotero.Collection.prototype.parseJsonCollection = function(apiObj) {
    Z.debug("parseJsonCollection", 4);
    var collection = this;
    collection.key = apiObj.key;
    collection.version = apiObj.version;
    collection.apiObj = J.extend({}, apiObj);
    collection.pristineData = J.extend({}, apiObj.data);

    collection.parentCollection = false;
    collection.topLevel = true;
    collection.synced = true;
    collection.initSecondaryData();
};

Zotero.Collection.prototype.initSecondaryData = function() {
    var collection = this;
    
    if(collection.apiObj.data['parentCollection']){
        collection.topLevel = false;
    } else {
        collection.topLevel = true;
    }
    
    if(Zotero.config.libraryPathString){
        collection.websiteCollectionLink = Zotero.config.libraryPathString + 
        '/collectionKey/' + collection.apiObj.key;
    }
    else {
        collection.websiteCollectionLink = '';
    }
    collection.hasChildren = (collection.apiObj.meta.numCollections) ? true : false;
    
};

Zotero.Collection.prototype.nestCollection = function(collectionsObject) {
    Z.debug("Zotero.Collection.nestCollection", 4);
    var collection = this;
    var parentCollectionKey = collection.get('parentCollection');
    if(parentCollectionKey !== false){
        if(collectionsObject.hasOwnProperty(parentCollectionKey)) {
            var parentOb = collectionsObject[parentCollectionKey];
            parentOb.children.push(collection);
            parentOb.hasChildren = true;
            collection.topLevel = false;
            return true;
        }
    }
    return false;
};

Zotero.Collection.prototype.addItems = function(itemKeys){
    Z.debug('Zotero.Collection.addItems', 3);
    var collection = this;
    var config = {
        'target':'items',
        'libraryType':collection.apiObj.library.type,
        'libraryID':collection.apiObj.library.id,
        'collectionKey':collection.key
    };
    var requestUrl = Zotero.ajax.apiRequestUrl(config) + Zotero.ajax.apiQueryString(config);
    var requestData = itemKeys.join(' ');
    
    return Zotero.ajaxRequest(requestUrl, 'POST',
        {data: requestData,
         processData: false
        }
    );
};

Zotero.Collection.prototype.getMemberItemKeys = function(){
    Z.debug('Zotero.Collection.getMemberItemKeys', 3);
    var collection = this;
    var config = {
        'target':'items',
        'libraryType':collection.apiObj.library.type,
        'libraryID':collection.apiObj.library.id,
        'collectionKey':collection.key,
        'format':'keys'
    };
    
    return Zotero.ajaxRequest(config, 'GET', {processData: false} )
    .then(function(response){
        Z.debug('getMemberItemKeys proxied callback', 3);
        var result = response.data;
        var keys = J.trim(result).split(/[\s]+/);
        collection.itemKeys = keys;
        return keys;
    });
};

Zotero.Collection.prototype.removeItem = function(itemKey){
    var collection = this;
    var config = {
        'target':'item',
        'libraryType':collection.apiObj.library.type,
        'libraryID':collection.apiObj.library.id,
        'collectionKey':collection.key,
        'itemKey':itemKey
    };
    return Zotero.ajaxRequest(config, 'DELETE',
        {processData: false,
         cache:false
        }
    );
};

Zotero.Collection.prototype.update = function(name, parentKey){
    var collection = this;
    if(!parentKey) parentKey = false;
    var config = {
        'target':'collection',
        'libraryType':collection.apiObj.library.type,
        'libraryID':collection.apiObj.library.id,
        'collectionKey':collection.key
    };
    
    var writeObject = collection.writeApiObj();
    var requestData = JSON.stringify(writeObject);
    
    return Zotero.ajaxRequest(config, 'PUT',
        {data: requestData,
         processData: false,
         headers:{
             'If-Unmodified-Since-Version': collection.version
         },
         cache:false
        }
    );
};

Zotero.Collection.prototype.writeApiObj = function(){
    var collection = this;
    var writeObj = J.extend({}, collection.pristineData, collection.apiObj.data);
    return writeObj;
};

Zotero.Collection.prototype.remove = function(){
    Z.debug("Zotero.Collection.delete", 3);
    var collection = this;
    var owningLibrary = collection.owningLibrary;
    var config = {
        'target':'collection',
        'libraryType':collection.apiObj.library.type,
        'libraryID':collection.apiObj.library.id,
        'collectionKey':collection.key
    };
    
    return Zotero.ajaxRequest(config, 'DELETE',
        {processData: false,
         headers:{
            'If-Unmodified-Since-Version': collection.version
         },
         cache:false
        }
    ).then(function(){
        Z.debug("done deleting collection. remove local copy.", 3);
        owningLibrary.collections.removeLocalCollection(collection.key);
        owningLibrary.trigger("libraryCollectionsUpdated");
    });
};

Zotero.Collection.prototype.get = function(key){
    var collection = this;
    switch(key) {
        case 'title':
        case 'name':
            return collection.apiObj.data.name;
        case 'collectionKey':
        case 'key':
            return collection.apiObj.key || collection.key;
        case 'collectionVersion':
        case 'version':
            return collection.apiObj.version;
        case 'parentCollection':
            return collection.apiObj.data.parentCollection;
    }
    
    if(key in collection.apiObj.data){
        return collection.apiObj.data[key];
    }
    else if(collection.apiObj.meta.hasOwnProperty(key)){
        return collection.apiObj.meta[key];
    }
    else if(collection.hasOwnProperty(key)){
        return collection[key];
    }
    
    return null;
};

Zotero.Collection.prototype.set = function(key, val){
    var collection = this;
    if(key in collection.apiObj.data){
        collection.apiObj.data[key] = val;
    }
    switch(key){
        case 'title':
        case 'name':
            collection.apiObj.data['name'] = val;
            break;
        case 'collectionKey':
        case 'key':
            collection.key = val;
            collection.apiObj.key = val;
            collection.apiObj.data.key = val;
            break;
        case 'parentCollection':
            collection.apiObj.data['parentCollection'] = val;
            break;
        case 'collectionVersion':
        case 'version':
            collection.version = val;
            collection.apiObj.version = val;
            collection.apiObj.data.version = val;
            break;
    }
    
    if(collection.hasOwnProperty(key)) {
        collection[key] = val;
    }
};
/*
 * TODO: several functions should not work unless we build a fresh item with a template
 * or parsed an item from the api with json content (things that depend on apiObj)
 * There should be a flag to note whether this is the case and throwing on attempts to
 * use these functions when it is not.
 */
Zotero.Item = function(itemObj){
    this.instance = "Zotero.Item";
    this.version = 0;
    this.key = '';
    this.synced = false;
    this.apiObj = {};
    this.pristineData = null;
    this.childItemKeys = [];
    this.writeErrors = [];
    this.notes = [];
    if(itemObj){
        this.parseJsonItem(itemObj);
    } else {
        this.parseJsonItem(this.emptyJsonItem());
    }
    this.initSecondaryData();
};

Zotero.Item.prototype = new Zotero.ApiObject();

Zotero.Item.prototype.parseJsonItem = function (apiObj) {
    var item = this;
    item.version = apiObj.version;
    item.key = apiObj.key;
    item.apiObj = J.extend({}, apiObj);
    item.pristineData = J.extend({}, apiObj.data);
    if(!item.apiObj._supplement){
        item.apiObj._supplement = {};
    }
};

Zotero.Item.prototype.emptyJsonItem = function(){
    return {
        key: '',
        version: 0,
        library:{},
        links:{},
        data: {
            key:'',
            version:0,
            title:'',
            creators:[],
            collections:[],
            tags:[],
            relations:{},
        },
        meta: {},
        _supplement: {},
    };
};

//populate property values derived from json content
Zotero.Item.prototype.initSecondaryData = function(){
    var item = this;
    
    item.version = item.apiObj.version;
    
    if(item.apiObj.data.itemType == 'attachment'){
        item.mimeType = item.apiObj.data.contentType;
        item.translatedMimeType = Zotero.utils.translateMimeType(item.mimeType);
    }
    if('linkMode' in item.apiObj){
        item.linkMode = item.apiObj.data.linkMode;
    }
    
    item.attachmentDownloadUrl = Zotero.url.attachmentDownloadUrl(item);
    
    if(item.apiObj.meta.parsedDate){
        item.parsedDate = new Date(item.apiObj.meta.parsedDate);
    } else {
        item.parsedDate = false;
    }
    
    item.synced = false;

    item.updateTagStrings();
};

Zotero.Item.prototype.updateTagStrings = function(){
    var item = this;
    var tagstrings = [];
    for (i = 0; i < item.apiObj.data.tags.length; i++) {
        tagstrings.push(item.apiObj.data.tags[i].tag);
    }
    item.apiObj._supplement.tagstrings = tagstrings;
};

Zotero.Item.prototype.initEmpty = function(itemType, linkMode){
    var item = this;
    return item.getItemTemplate(itemType, linkMode)
    .then(function(template){
        item.initEmptyFromTemplate(template);
        return item;
    });
};

//special case note initialization to guarentee synchronous and simplify some uses
Zotero.Item.prototype.initEmptyNote = function(){
    var item = this;
    item.version = 0;
    var noteTemplate = {"itemType":"note","note":"","tags":[],"collections":[],"relations":{}};
    
    item.initEmptyFromTemplate(noteTemplate);
    
    return item;
};

Zotero.Item.prototype.initEmptyFromTemplate = function(template){
    var item = this;
    item.version = 0;
    
    item.key = '';
    item.pristineData = J.extend({}, template);
    item.apiObj = {
        key: '',
        version: 0,
        library: {},
        links: {},
        data: template,
        meta: {},
        _supplement: {},
    };
    
    item.initSecondaryData();
    return item;
};

Zotero.Item.prototype.isSupplementaryItem = function(){
    var item = this;
    var itemType = item.get('itemType');
    if(itemType == "attachment" || itemType == "note"){
        return true;
    }
    return false;
};

Zotero.Item.prototype.isSnapshot = function(){
    var item = this;
    if(item.apiObj.links['enclosure']){
        var ftype = item.apiObj.links['enclosure'].type;
        if(!item.apiObj.links['enclosure']['length'] && ftype == 'text/html'){
            return true;
        }
    }
    return false;
};

Zotero.Item.prototype.updateObjectKey = function(objectKey){
    return this.updateItemKey(objectKey);
};

Zotero.Item.prototype.updateItemKey = function(itemKey){
    var item = this;
    item.key = itemKey;
    item.apiObj.key = itemKey;
    item.apiObj.data.key = itemKey;
    item.pristineData.key = itemKey;
    return item;
};

/*
 * Write updated information for the item to the api and potentiallyp
 * create new child notes (or attachments?) of this item
 */
Zotero.Item.prototype.writeItem = function(){
    var item = this;
    if(!item.owningLibrary){
        throw new Error("Item must be associated with a library");
    }
    return item.owningLibrary.items.writeItems([item]);
};

//get the JS object to be PUT/POSTed for write
Zotero.Item.prototype.writeApiObj = function(){
    var item = this;
    
    //remove any creators that have no names
    if(item.apiObj.data.creators){
        var newCreatorsArray = item.apiObj.data.creators.filter(function(c){
            if(c.name || c.firstName || c.lastName){
                return true;
            }
            return false;
        });
        item.apiObj.data.creators = newCreatorsArray;
    }
    
    //copy apiObj, extend with pristine to make sure required fields are present
    //and remove unwriteable fields(?)
    var writeApiObj = J.extend({}, item.pristineData, item.apiObj.data);
    return writeApiObj;
};

Zotero.Item.prototype.createChildNotes = function(notes){
    var item = this;
    var childItems = [];
    var childItemPromises = [];
    var initDone = J.proxy(function(templateItem){
        childItems.push(templateItem);
    }, this);
    
    J.each(notes, function(ind, note){
        var childItem = new Zotero.Item();
        var p = childItem.initEmpty('note')
        .then(function(noteItem){
            noteItem.set('note', note.note);
            noteItem.set('parentItem', item.key);
            childItems.push(noteItem);
        });
        childItemPromises.push(p);
    });
    
    return Promise.all(childItemPromises)
    .then(function(){
        return item.owningLibrary.writeItems(childItems);
    });
};

//TODO: implement
Zotero.Item.prototype.writePatch = function(){
    
};

Zotero.Item.prototype.getChildren = function(library){
    Z.debug("Zotero.Item.getChildren");
    var item = this;
    return Promise.resolve()
    .then(function(){
        //short circuit if has item has no children
        if(!item.apiObj.meta.numChildren){
            return [];
        }
        
        var config = {
            url: {
                'target':'children',
                'libraryType':item.apiObj.library.type,
                'libraryID':item.apiObj.library.id,
                'itemKey':item.key
            }
        };
        
        return Zotero.net.queueRequest(config)
        .then(function(response){
            Z.debug('getChildren proxied callback', 4);
            var items = library.items;
            var childItems = items.addItemsFromJson(response.data);
            for (var i = childItems.length - 1; i >= 0; i--) {
                childItems[i].associateWithLibrary(library);
            }
            
            return childItems;
        });
    });
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
    if(typeof itemType == 'undefined') itemType = 'document';
    if(itemType == 'attachment' && typeof linkMode == 'undefined'){
        throw new Error("attachment template requested with no linkMode");
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
        return Promise.resolve(template);
    }
    
    return Zotero.ajaxRequest(requestUrl, 'GET', {dataType:'json'})
    .then(function(response){
        Z.debug("got itemTemplate response", 3);
        Zotero.cache.save(cacheConfig, response.data);
        return response.data;
    });
};

Zotero.Item.prototype.getUploadAuthorization = function(fileinfo){
    //fileInfo: md5, filename, filesize, mtime, zip, contentType, charset
    Z.debug("Zotero.Item.getUploadAuthorization", 3);
    var item = this;
    
    var config = {
        'target':'item',
        'targetModifier':'file',
        'libraryType':item.owningLibrary.type,
        'libraryID':item.owningLibrary.libraryID,
        'itemKey':item.key
    };
    var headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
    };
    var oldmd5 = item.get('md5');
    if(oldmd5){
        headers['If-Match'] = oldmd5;
    }
    else{
        headers['If-None-Match'] = '*';
    }
    
    return Zotero.ajaxRequest(config, 'POST',
        {
            processData: true,
            data:fileinfo,
            headers:headers
        }
    );
};

Zotero.Item.prototype.registerUpload = function(uploadKey){
    Z.debug("Zotero.Item.registerUpload", 3);
    var item = this;
    var config = {
        'target':'item',
        'targetModifier':'file',
        'libraryType':item.owningLibrary.type,
        'libraryID':item.owningLibrary.libraryID,
        'itemKey':item.key
    };
    var headers = {};
    var oldmd5 = item.get('md5');
    if(oldmd5){
        headers['If-Match'] = oldmd5;
    }
    else{
        headers['If-None-Match'] = '*';
    }
    
    return Zotero.ajaxRequest(config, 'POST',
    {
        processData: true,
        data:{upload: uploadKey},
        headers: headers
    });
};

Zotero.Item.prototype.fullUpload = function(file){

};

Zotero.Item.prototype.creatorTypes = {};

Zotero.Item.prototype.getCreatorTypes = function (itemType) {
    Z.debug("Zotero.Item.prototype.getCreatorTypes: " + itemType, 3);
    if(!itemType){
        itemType = 'document';
    }
    
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
        return Promise.resolve(Zotero.Item.prototype.creatorTypes[itemType]);
    }
    else{
        Z.debug("sending request for creatorTypes", 3);
        var query = Zotero.ajax.apiQueryString({itemType:itemType});
        //TODO: this probably shouldn't be using baseApiUrl directly
        var requestUrl = Zotero.config.baseApiUrl + '/itemTypeCreatorTypes' + query;
        
        return Zotero.ajaxRequest(requestUrl, 'GET', {dataType:'json'})
        .then(function(response){
            Z.debug("got creatorTypes response", 4);
            Zotero.Item.prototype.creatorTypes[itemType] = response.data;
            //Zotero.storage.localStorage['creatorTypes'] = JSON.stringify(Zotero.Item.prototype.creatorTypes);
            Zotero.cache.save({target:'creatorTypes'}, Zotero.Item.prototype.creatorTypes);
            return Zotero.Item.prototype.creatorTypes[itemType];
        });
    }
};

Zotero.Item.prototype.getCreatorFields = function (locale) {
    Z.debug("Zotero.Item.prototype.getCreatorFields", 3);
    var creatorFields = Zotero.cache.load({target:'creatorFields'});
    if(creatorFields){
        Z.debug("have creatorFields in localStorage", 3);
        Zotero.Item.prototype.creatorFields = creatorFields;// JSON.parse(Zotero.storage.localStorage['creatorFields']);
        return Promise.resolve(creatorFields);
    }
    
    var requestUrl = Zotero.config.baseApiUrl + '/creatorFields';
    return Zotero.ajaxRequest(requestUrl, 'GET', {dataType:'json'})
    .then(function(response){
        Z.debug("got itemTypes response", 4);
        Zotero.Item.prototype.creatorFields = response.data;
        Zotero.cache.save({target:'creatorFields'}, response.data);
    });
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

Zotero.Item.prototype.itemTypeImageClass = function(){
    //linkModes: imported_file,imported_url,linked_file,linked_url
    var item = this;
    if(item.apiObj.data.itemType == 'attachment'){
        switch(item.apiObj.data.linkMode){
            case 'imported_file':
                if(item.translatedMimeType == 'pdf'){
                    return item.itemTypeImageSrc['attachmentPdf'];
                }
                return item.itemTypeImageSrc['attachmentFile'];
            case 'imported_url':
                if(item.translatedMimeType == 'pdf'){
                    return item.itemTypeImageSrc['attachmentPdf'];
                }
                return item.itemTypeImageSrc['attachmentSnapshot'];
            case 'linked_file':
                return item.itemTypeImageSrc['attachmentLink'];
            case 'linked_url':
                return item.itemTypeImageSrc['attachmentWeblink'];
            default:
                return item.itemTypeImageSrc['attachment'];
        }
    }
    else {
        return item.apiObj.data.itemType;
    }
};

Zotero.Item.prototype.itemTypeIconClass = function(){
    //linkModes: imported_file,imported_url,linked_file,linked_url
    var item = this;
    var defaultIcon = 'fa fa-file-text-o';
    switch(item.apiObj.data.itemType){
        case 'attachment':
            switch(item.apiObj.data.linkMode){
                case 'imported_file':
                    if(item.translatedMimeType == 'pdf'){
                        return 'fa fa-file-pdf-o';
                    }
                    return 'glyphicons glyphicons-file';
                case 'imported_url':
                    if(item.translatedMimeType == 'pdf'){
                        return 'fa fa-file-pdf-o';
                    }
                    return 'glyphicons glyphicons-file';
                case 'linked_file':
                    return 'glyphicons glyphicons-link';
                    //return item.itemTypeImageSrc['attachmentLink'];
                case 'linked_url':
                    return 'glyphicons glyphicons-link';
                    //return item.itemTypeImageSrc['attachmentWeblink'];
                default:
                    return 'glyphicons glyphicons-paperclip';
                    //return item.itemTypeImageSrc['attachment'];
            }
            return 'glyphicons file';
        case 'artwork':
            return 'glyphicons glyphicons-picture';
        case 'audioRecording':
            return 'glyphicons glyphicons-microphone';
        case 'bill':
            return defaultIcon;
        case 'blogPost':
            return 'glyphicons glyphicons-blog';
        case 'book':
            return 'glyphicons glyphicons-book';
        case 'bookSection':
            return 'glyphicons glyphicons-book-open';
        case 'case':
            return defaultIcon;
        case 'computerProgram':
            return 'glyphicons glyphicons-floppy-disk';
        case 'conferencePaper':
            return defaultIcon;
        case 'dictionaryEntry':
            return 'glyphicons glyphicons-translate';
        case 'document':
            return 'glyphicons glyphicons-file';
        case 'email':
            return 'glyphicons glyphicons-envelope';
        case 'encyclopediaArticle':
            return 'glyphicons glyphicons-bookmark';
        case 'film':
            return 'glyphicons glyphicons-film';
        case 'forumPost':
            return 'glyphicons glyphicons-bullhorn';
        case 'hearing':
            return 'fa fa-gavel';
        case 'instantMessage':
            return 'fa fa-comment-o';
        case 'interview':
            return 'fa fa-comments-o';
        case 'journalArticle':
            return 'fa fa-file-text-o';
        case 'letter':
            return 'glyphicons glyphicons-message-full';
        case 'magazineArticle':
            return defaultIcon;
        case 'manuscript':
            return 'glyphicons glyphicons-pen';
        case 'map':
            return 'glyphicons glyphicons-google-maps';
        case 'newspaperArticle':
            return 'fa fa-newspaper-o';
        case 'note':
            return 'glyphicons glyphicons-notes noteyellow';
        case 'patent':
            return 'glyphicons glyphicons-lightbulb';
        case 'podcast':
            return 'glyphicons glyphicons-ipod';
        case 'presentation':
            return 'glyphicons glyphicons-keynote';
        case 'radioBroadcast':
            return 'glyphicons glyphicons-wifi-alt';
        case 'report':
            return 'glyphicons glyphicons-notes-2';
        case 'statue':
            return 'glyphicons glyphicons-bank';
        case 'thesis':
            return 'fa fa-graduation-cap';
        case 'tvBroadcast':
            return 'glyphicons glyphicons-display';
        case 'videoRecording':
            return 'glyphicons glyphicons-facetime-video';
        case 'webpage':
            return 'glyphicons glyphicons-embed-close';
        default:
            return 'glyphicons file';
    }
};

Zotero.Item.prototype.get = function(key){
    var item = this;
    switch(key) {
        case 'title':
            var title = '';
            if(item.apiObj.data.itemType == 'note'){
                return item.noteTitle(item.apiObj.data.note);
            } else {
                return item.apiObj.data.title;
            }
            if(title === ''){
                return '[Untitled]';
            }
            return title;
        case 'creatorSummary':
        case 'creator':
            if(typeof item.apiObj.meta.creatorSummary !== "undefined"){
                return item.apiObj.meta.creatorSummary;
            }
            else {
                return '';
            }
            break;
        case 'year':
            if(item.parsedDate) {
                return item.parsedDate.getFullYear();
            }
            else {
                return '';
            }
    }
    
    if(key in item.apiObj.data){
        return item.apiObj.data[key];
    }
    else if(key in item.apiObj.meta){
        return item.apiObj.meta[key];
    }
    else if(item.hasOwnProperty(key)){
        return item[key];
    }
    
    return null;
};

Zotero.Item.prototype.set = function(key, val){
    var item = this;
    if(key in item.apiObj){
        item.apiObj[key] = val;
    }
    if(key in item.apiObj.data){
        item.apiObj.data[key] = val;
    }
    if(key in item.apiObj.meta){
        item.apiObj.meta[key] = val;
    }
    
    switch (key) {
        case "itemKey":
        case "key":
            item.key = val;
            item.apiObj.data.key = val;
            break;
        case "itemVersion":
        case "version":
            item.version = val;
            item.apiObj.data.version = val;
            break;
        case "itemType":
            item.itemType = val;
            //TODO: translate api object to new item type
            break;
        case "linkMode":
            break;
        case "deleted":
            item.apiObj.data.deleted = val;
            break;
        case "parentItem":
            if( val === '' ){ val = false; }
            item.apiObj.data.parentItem = val;
            break;
    }
    
//    item.synced = false;
    return item;
};

Zotero.Item.prototype.noteTitle = function(note){
    var len = 120;
    var notetext = J(note).text();
    var firstNewline = notetext.indexOf("\n");
    if((firstNewline != -1) && firstNewline < len){
        return notetext.substr(0, firstNewline);
    }
    else {
        return notetext.substr(0, len);
    }
};

Zotero.Item.prototype.setParent = function(parentItemKey){
    var item = this;
    //pull out itemKey string if we were passed an item object
    if(typeof parentItemKey != 'string' &&
        parentItemKey.hasOwnProperty('instance') &&
        parentItemKey.instance == 'Zotero.Item'){
        parentItemKey = parentItemKey.key;
    }
    item.set('parentItem', parentItemKey);
    return item;
};

Zotero.Item.prototype.addToCollection = function(collectionKey){
    var item = this;
    //take out the collection key if we're passed a collection object instead
    if(typeof collectionKey != 'string'){
        if(collectionKey.instance == 'Zotero.Collection'){
            collectionKey = collectionKey.key;
        }
    }
    if(J.inArray(collectionKey, item.apiObj.data.collections) === -1){
        item.apiObj.data.collections.push(collectionKey);
    }
    return;
};

Zotero.Item.prototype.removeFromCollection = function(collectionKey){
    var item = this;
    //take out the collection key if we're passed a collection object instead
    if(typeof collectionKey != 'string'){
        if(collectionKey.instance == 'Zotero.Collection'){
            collectionKey = collectionKey.key;
        }
    }
    var index = J.inArray(collectionKey, item.apiObj.data.collections);
    if(index != -1){
        item.apiObj.data.collections.splice(index, 1);
    }
    return;
};

Zotero.Item.prototype.uploadChildAttachment = function(childItem, fileInfo, progressCallback){
    /*
     * write child item so that it exists
     * get upload authorization for actual file
     * perform full upload
     */
    var item = this;
    Z.debug("uploadChildAttachment", 3);
    if(!item.owningLibrary){
        return Promise.reject(new Error("Item must be associated with a library"));
    }

    //make sure childItem has parent set
    childItem.set('parentItem', item.key);
    childItem.associateWithLibrary(item.owningLibrary);
    
    return childItem.writeItem()
    .then(function(response){
        //successful attachmentItemWrite
        item.numChildren++;
        return childItem.uploadFile(fileInfo, progressCallback);
    }, function(response){
        //failure during attachmentItem write
        throw {
            "message":"Failure during attachmentItem write.",
            "code": response.status,
            "serverMessage": response.rawResponse.responseText,
            "response": response
        };
    });
};

Zotero.Item.prototype.uploadFile = function(fileInfo, progressCallback){
    var item = this;
    Z.debug("Zotero.Item.uploadFile", 3);
    var uploadAuthFileData = {
        md5:fileInfo.md5,
        filename: item.get('title'),
        filesize: fileInfo.filesize,
        mtime:fileInfo.mtime,
        contentType:fileInfo.contentType,
        params:1
    };
    if(fileInfo.contentType === ""){
        uploadAuthFileData.contentType = "application/octet-stream";
    }
    return item.getUploadAuthorization(uploadAuthFileData)
    .then(function(response){
        Z.debug("uploadAuth callback", 3);
        var upAuthOb;
        if(typeof response.data == "string"){upAuthOb = JSON.parse(data);}
        else{upAuthOb = response.data;}
        if(upAuthOb.exists == 1){
            return {'message':"File Exists"};
        }
        else{
            //TODO: add progress
            return Zotero.file.uploadFile(upAuthOb, fileInfo)
            .then(function(){
                //upload was successful: register it
                return item.registerUpload(upAuthOb.uploadKey)
                .then(function(response){
                    return {'message': 'Upload Successful'};
                });
            });
        }
    }).catch(function(response){
        Z.debug("Failure caught during upload", 3);
        Z.debug(response, 3);
        throw {
            "message":"Failure during upload.",
            "code": response.status,
            "serverMessage": response.rawResponse.responseText,
            'response': response
        };
    });
};

Zotero.Item.prototype.cslItem = function(){
    var zoteroItem = this;
    
    // don't return URL or accessed information for journal articles if a
    // pages field exists
    var itemType = zoteroItem.get("itemType");//Zotero_ItemTypes::getName($zoteroItem->itemTypeID);
    var cslType = zoteroItem.cslTypeMap.hasOwnProperty(itemType) ? zoteroItem.cslTypeMap[itemType] : false;
    if (!cslType) cslType = "article";
    var ignoreURL = ((zoteroItem.get("accessDate") || zoteroItem.get("url")) &&
            itemType in {"journalArticle":1, "newspaperArticle":1, "magazineArticle":1} &&
            zoteroItem.get("pages") &&
            zoteroItem.citePaperJournalArticleURL);
    
    cslItem = {'type': cslType};
    if(zoteroItem.owningLibrary){
        cslItem['id'] = zoteroItem.apiObj.library.id + "/" + zoteroItem.get("key");
    } else {
        cslItem['id'] = Zotero.utils.getKey();
    }
    
    // get all text variables (there must be a better way)
    // TODO: does citeproc-js permit short forms?
    J.each(zoteroItem.cslFieldMap, function(variable, fields){
        if (variable == "URL" && ignoreURL) return;
        J.each(fields, function(ind, field){
            var value = zoteroItem.get(field);
            if(value){
                //TODO: strip enclosing quotes? necessary when not pulling from DB?
                cslItem[variable] = value;
            }
        });
    });
    
    // separate name variables
    var creators = zoteroItem.get('creators');
    J.each(creators, function(ind, creator){
        var creatorType = creator['creatorType'];// isset(self::$zoteroNameMap[$creatorType]) ? self::$zoteroNameMap[$creatorType] : false;
        if (!creatorType) return;
        
        var nameObj;
        if(creator.hasOwnProperty("name")){
            nameObj = {'literal': creator['name']};
        }
        else {
            nameObj = {'family': creator['lastName'], 'given': creator['firstName']};
        }
        
        if (cslItem.hasOwnProperty(creatorType)) {
            cslItem[creatorType].push(nameObj);
        }
        else {
            cslItem[creatorType] = [nameObj];
        }
    });
    
    // get date variables
    J.each(zoteroItem.cslDateMap, function(key, val){
        var date = zoteroItem.get(val);
        if (date) {
            cslItem[key] = {"raw": date};
        }
    });
    
    return cslItem;
};
Zotero.Item.prototype.fieldMap = {
    "itemType"            : "Item Type",
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
    "versionNumber"       : "Version Number",
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

Zotero.Item.prototype.hideFields = [
    "mimeType",
    "linkMode",
    "charset",
    "md5",
    "mtime",
    "version",
    "key",
    "collections",
    "relations",
    "parentItem",
    "contentType",
    "filename",
    "tags"
];

Zotero.Item.prototype.noEditFields = [
    "accessDate",
    "modified",
    "filename",
    "dateAdded",
    "dateModified"
];

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

Zotero.Item.prototype.cslNameMap = {
    "author": "author",
    "editor": "editor",
    "bookAuthor": "container-author",
    "composer": "composer",
    "interviewer": "interviewer",
    "recipient": "recipient",
    "seriesEditor": "collection-editor",
    "translator": "translator"
};

Zotero.Item.prototype.cslFieldMap = {
    "title": ["title"],
    "container-title": ["publicationTitle",  "reporter", "code"], /* reporter and code should move to SQL mapping tables */
    "collection-title": ["seriesTitle", "series"],
    "collection-number": ["seriesNumber"],
    "publisher": ["publisher", "distributor"], /* distributor should move to SQL mapping tables */
    "publisher-place": ["place"],
    "authority": ["court"],
    "page": ["pages"],
    "volume": ["volume"],
    "issue": ["issue"],
    "number-of-volumes": ["numberOfVolumes"],
    "number-of-pages": ["numPages"],
    "edition": ["edition"],
    "versionNumber": ["version"],
    "section": ["section"],
    "genre": ["type", "artworkSize"], /* artworkSize should move to SQL mapping tables, or added as a CSL variable */
    "medium": ["medium", "system"],
    "archive": ["archive"],
    "archive_location": ["archiveLocation"],
    "event": ["meetingName", "conferenceName"], /* these should be mapped to the same base field in SQL mapping tables */
    "event-place": ["place"],
    "abstract": ["abstractNote"],
    "URL": ["url"],
    "DOI": ["DOI"],
    "ISBN": ["ISBN"],
    "call-number": ["callNumber"],
    "note": ["extra"],
    "number": ["number"],
    "references": ["history"],
    "shortTitle": ["shortTitle"],
    "journalAbbreviation": ["journalAbbreviation"],
    "language": ["language"]
};

Zotero.Item.prototype.cslDateMap = {
    "issued": "date",
    "accessed": "accessDate"
};

Zotero.Item.prototype.cslTypeMap = {
    'book': "book",
    'bookSection': "chapter",
    'journalArticle': "article-journal",
    'magazineArticle': "article-magazine",
    'newspaperArticle': "article-newspaper",
    'thesis': "thesis",
    'encyclopediaArticle': "entry-encyclopedia",
    'dictionaryEntry': "entry-dictionary",
    'conferencePaper': "paper-conference",
    'letter': "personal_communication",
    'manuscript': "manuscript",
    'interview': "interview",
    'film': "motion_picture",
    'artwork': "graphic",
    'webpage': "webpage",
    'report': "report",
    'bill': "bill",
    'case': "legal_case",
    'hearing': "bill",                // ??
    'patent': "patent",
    'statute': "bill",                // ??
    'email': "personal_communication",
    'map': "map",
    'blogPost': "webpage",
    'instantMessage': "personal_communication",
    'forumPost': "webpage",
    'audioRecording': "song",     // ??
    'presentation': "speech",
    'videoRecording': "motion_picture",
    'tvBroadcast': "broadcast",
    'radioBroadcast': "broadcast",
    'podcast': "song",            // ??
    'computerProgram': "book"     // ??
};

Zotero.Item.prototype.citePaperJournalArticleURL = false;
Zotero.Tag = function (tagObj) {
    this.instance = "Zotero.Tag";
    this.color = null;
    this.version = 0;
    if( typeof tagObj == 'object'){
        this.parseJsonTag(tagObj);
    } else if(typeof tagObj == 'string') {
        this.parseJsonTag(this.templateApiObj(tagObj));
    } else {
        this.parseJsonTag(this.tamplateApiObj(''));
    }
};

Zotero.Tag.prototype = new Zotero.ApiObject();

Zotero.Tag.prototype.parseJsonTag = function(tagObj) {
    var tag = this;
    tag.apiObj = J.extend({}, tagObj);
    tag.urlencodedtag = encodeURIComponent(tag.apiObj.tag);
    tag.version = tag.apiObj.version;
};

Zotero.Tag.prototype.templateApiObj = function(tagString) {
    return {
        tag: tagString,
        links: {},
        meta: {
            type:0,
            numItems:1,
        },
    };
};

Zotero.Tag.prototype.tagComparer = function(){
    if(window.Intl){
        var collator = new window.Intl.Collator();
        return function(a, b){
            return collator.compare(a.apiObj.tag, b.apiObj.tag);
        };
    } else {
        return function(a, b) {
            if(a.apiObj.tag.toLocaleLowerCase() == b.apiObj.tag.toLocaleLowerCase()){
                return 0;
            }
            if(a.apiObj.tag.toLocaleLowerCase() < b.apiObj.tag.toLocaleLowerCase()){
                return -1;
            }
            return 1;
        };
    }
};

Zotero.Tag.prototype.set = function(key, val){
    var tag = this;
    
    if(key in tag.apiObj){
        tag.apiObj[key] = val;
    }
    if(key in tag.apiObj.meta){
        tag.apiObj.meta[key] = val;
    }
    
    switch (key) {
        case "tagVersion":
        case "version":
            tag.version = val;
            tag.apiObj.version = val;
            break;
    }
    
    return tag;
};

Zotero.Search = function(){
    this.instance = "Zotero.Search";
    this.searchObject = {};
};
Zotero.Group = function (groupObj) {
    var group = this;
    group.instance = "Zotero.Group";
    if(groupObj){
        this.parseJsonGroup(groupObj);
    }
};

Zotero.Group.prototype = new Zotero.ApiObject();

Zotero.Group.prototype.parseJsonGroup = function(groupObj) {
    var group = this;
    group.apiObj = groupObj;
};

Zotero.Group.prototype.get = function(key) {
    var group = this;
    switch(key) {
        case 'title':
        case 'name':
            return group.apiObj.data.name;
    }
    
    if(key in group.apiObj){
        return group.apiObj[key];
    }
    if(key in group.apiObj.data){
        return group.apiObj.data[key];
    }
    if(key in group.apiObj.meta){
        return group.apiObj.meta[key];
    }
    if(group.hasOwnProperty(key)){
        return group[key];
    }
    
    return null;
};

Zotero.Group.prototype.isWritable = function(userID){
    var group = this;
    switch(true){
        case group.get('owner') == userID:
            return true;
        case (group.apiObj.data.admins && (group.apiObj.data.admins.indexOf(userID) != -1) ):
            return true;
        case ((group.apiObj.data.libraryEditing == 'members') &&
              (group.apiObj.data.members) &&
              (group.apiObj.data.members.indexOf(userID) != -1)):
            return true;
        default:
            return false;
    }
};

Zotero.Group.prototype.typeMap = {
    'Private': 'Private',
    'PublicOpen': 'Public, Open Membership',
    'PublicClosed': 'Public, Closed Membership'
};

Zotero.Group.prototype.accessMap = {
    'all'     : {'members' : 'Anyone can view, only members can edit',
                       'admins'  : 'Anyone can view, only admins can edit'},
    'members' : {'members' : 'Only members can view and edit',
                       'admins'  : 'Only members can view, only admins can edit'},
    'admins'  : {'members' : 'Only admins can view, only members can edit',
                       'admins'  : 'Only admins can view and edit'}
};

Zotero.User = function () {this.instance = "Zotero.User";};
Zotero.User.prototype = new Zotero.ApiObject();
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
    randomString:function(len, chars) {
        if (!chars) {
            chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
        }
        if (!len) {
            len = 8;
        }
        var randomstring = '';
        for (var i=0; i<len; i++) {
            var rnum = Math.floor(Math.random() * chars.length);
            randomstring += chars.substring(rnum,rnum+1);
        }
        return randomstring;
    },
    
    getKey: function() {
        var baseString = "23456789ABCDEFGHIJKMNPQRSTUVWXZ";
        return Zotero.utils.randomString(8, baseString);
    },
    
    slugify: function(name){
        var slug = J.trim(name);
        slug = slug.toLowerCase();
        slug = slug.replace( /[^a-z0-9 ._-]/g , "");
        slug = slug.replace(/\s/g, "_");
        
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
    
    libraryString: function(type, libraryID){
        var lstring = '';
        if(type == 'user') lstring = 'u';
        else if(type == 'group') lstring = 'g';
        lstring += libraryID;
        return lstring;
    },
    
    parseLibString: function(libraryString){
        var type;
        var libraryID;
        if(libraryString.charAt(0) == 'u'){
            type = 'user';
        }
        else if(libraryString.charAt(0) == 'g'){
            type = 'group';
        }
        else{
            throw new Error("unexpected type character in libraryString");
        }
        libraryID = parseInt(libraryString.substring(1));
        return {libraryType:type, libraryID: libraryID};
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
            Z.error("error parsing api date: " + datestr);
            return null;
        }
        else{
            date = new Date(Date.UTC(matches[1], matches[2]-1, matches[3], matches[4], matches[5], matches[6]));
            return date;
        }
        
        return date;
    },
    
    readCookie: function(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for(var i=0;i < ca.length;i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1,c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length,c.length);
        }
        return null;
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
    },

    /**
     * Get the permissions a key has for a library
     * if no key is passed use the currently set key for the library
     *
     * @param int|string $userID
     * @param string $key
     * @return array $keyPermissions
     */
    getKeyPermissions: function(userID, key) {
        if(!userID){
            return false;
        }
        
        if(!key){
            return false;
        }
        
        var urlconfig = {'target':'key', 'libraryType':'user', 'libraryID':userID, 'apiKey':key};
        var requestUrl = Zotero.ajax.apiRequestString(urlconfig);
        
        return Zotero.ajaxRequest(requestUrl)
        .then(function(response){
            var keyNode = J(response.data).find('key');
            var keyObject = Zotero.utils.parseKey(keyNode);
            return keyObject;
        });
    },
    
    /**
     * Parse a key response into an array
     *
     * @param keyNode jQuery Dom collection from key response
     * @return array $keyPermissions
     */
    parseKey: function(keyNode){
        var key = [];
        var keyPerms = {"library":"0", "notes":"0", "write":"0", 'groups':{}};
        var accessEls = keyNode.find('access');
        accessEls.each(function(){
            var access = J(this);
            if(access.attr('library')){
                keyPerms['library'] = access.attr('library');
            }
            if(access.attr('notes')){
                keyPerms['notes'] = access.attr('notes');
            }
            if(access.attr('group')){
                var groupPermission = access.attr('write') == '1' ? 'write' : 'read';
                keyPerms['groups'][access.attr('group')] = groupPermission;
            }
            else if(access.attr('write')){
                keyPerms['write'] = access.attr('write');
            }
        });
        return keyPerms;
    }
    
};
// Url.js - construct certain urls and links locally that may depend on the
// current website's routing scheme etc. Not necessarily pointing to zotero.org
// - href for a particular item's local representation
// - link with appropriate text, to download file or view framed snapshot
// - href for file download/view, depending on whether config says to download
// directly from the api, or to proxy it
// - displayable string describing the attachment file (attachmentFileDetails)
// - list of urls for supported export formats
// 

//locally construct a url for the item on the current website
Zotero.url.itemHref = function(item){
    var href = '';
    href += Zotero.config.libraryPathString + '/itemKey/' + item.key;
    return href;
};

//construct a download link for an item's enclosure file that takes into
//account size and whether the file is a snapshot
Zotero.url.attachmentDownloadLink = function(item){
    var retString = '';
    var downloadUrl = item.attachmentDownloadUrl;
    var contentType = item.get('contentType');
    
    if(item.apiObj.links && item.apiObj.links['enclosure']){
        if(!item.apiObj.links['enclosure']['length'] && item.isSnapshot()){
            //snapshot: redirect to view
            retString += '<a href="' + downloadUrl + '">' + 'View Snapshot</a>';
        }
        else{
            //file: offer download
            var enctype = Zotero.utils.translateMimeType(item.apiObj.links['enclosure'].type);
            var enc = item.apiObj.links['enclosure'];
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
            Z.debug(enctype, 3);
            retString += '<a href="' + downloadUrl + '">';
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
    if(item.apiObj.links && item.apiObj.links['enclosure']){
        if(Zotero.config.proxyDownloads){
            //we have a proxy for downloads at baseDownloadUrl so just pass an itemkey to that
            return Zotero.url.wwwDownloadUrl(item);
        }
        else {
            return Zotero.url.apiDownloadUrl(item);
        }
    }
    return false;
};

Zotero.url.apiDownloadUrl = function(item){
    if(item.apiObj.links['enclosure']){
        return item.apiObj.links['enclosure']['href'];
    }
    return false;
};

Zotero.url.wwwDownloadUrl = function(item){
    var urlString = '';
    if(item.apiObj.links['enclosure']){
        if(Zotero.config.proxyDownloads){
            return Zotero.config.baseDownloadUrl + "?itemkey=" + item.get('key');
        }
        else{
            return Zotero.url.apiDownloadUrl(item);
        }
    }
    else {
        return false;
    }
};

Zotero.url.attachmentFileDetails = function(item){
    //file: offer download
    if(!item.apiObj.links['enclosure']) return '';
    var enctype = Zotero.utils.translateMimeType(item.apiObj.links['enclosure'].type);
    var enc = item.apiObj.links['enclosure'];
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

Zotero.url.userWebLibrary = function(slug) {
    return [Zotero.config.baseWebsiteUrl, slug, "items"].join("/");
};

Zotero.url.groupWebLibrary = function(group) {
    if(group.type == 'Private'){
        return [Zotero.config.baseWebsiteUrl, "groups", group.get('id'), "items"].join("/");
    }
    else {
        return [Zotero.config.baseWebsiteUrl, "groups", Zotero.utils.slugify(group.get('name')), "items"].join("/");
    }
};

Zotero.url.exportUrls = function(config){
    Z.debug("Zotero.url.exportUrls", 3);
    var exportUrls = {};
    var exportConfig = {};
    J.each(Zotero.config.exportFormats, function(index, format){
        exportConfig = J.extend(config, {'format':format});
        exportUrls[format] = Zotero.ajax.apiRequestUrl(exportConfig) + Zotero.ajax.apiQueryString({format:format, limit:'25'});
    });
    return exportUrls;
};

Zotero.url.relationUrl = function(libraryType, libraryID, itemKey){
    return "http://zotero.org/" + libraryType + "s/" + libraryID + "/items/" + itemKey;
};
Zotero.file = {};

Zotero.file.getFileInfo = function(file){
    //fileInfo: md5, filename, filesize, mtime, zip, contentType, charset
    if(typeof FileReader != 'function'){
        return Promise.reject(new Error("FileReader not supported"));
    }
    
    return new Promise(function(resolve, reject){
        var fileInfo = {};
        var reader = new FileReader();
        reader.onload = function(e){
            Z.debug('Zotero.file.getFileInfo onloadFunc', 3);
            var result = e.target.result;
            Zotero.debug(result, 3);
            fileInfo.md5 = SparkMD5.ArrayBuffer.hash(result);
            fileInfo.filename = file.name;
            fileInfo.filesize = file.size;
            fileInfo.mtime = Date.now();
            fileInfo.contentType = file.type;
            //fileInfo.reader = reader;
            fileInfo.filedata = result;
            resolve(fileInfo);
        };
        
        reader.readAsArrayBuffer(file);
    });
};

Zotero.file.uploadFile = function(uploadInfo, fileInfo){
    Z.debug("Zotero.file.uploadFile", 3);
    Z.debug(uploadInfo, 4);
    
    var formData = new FormData();
    J.each(uploadInfo.params, function(index, val){
        formData.append(index, val);
    });
    
    var blobData = new Blob([fileInfo.filedata], {type : fileInfo.contentType});
    formData.append('file', blobData);
    
    var xhr = new XMLHttpRequest();
    
    xhr.open('POST', uploadInfo.url, true);
    
    return new Promise(function(resolve, reject){
        xhr.onload = function(evt){
            Z.debug('uploadFile onload event', 3);
            if(this.status == 201){
                Z.debug("successful upload - 201", 3);
                resolve();
            }
            else {
                Z.error('uploadFile failed - ' + xhr.status);
                reject({
                    "message": "Failure uploading file.",
                    "code": xhr.status,
                    "serverMessage": xhr.responseText
                });
            }
        };
        
        xhr.onprogress = function(evt){
            Z.debug('progress event');
            Z.debug(evt);
        };
        xhr.send(formData);
    });
    
    //If CORS is not enabled on s3 this XHR will not have the normal status
    //information, but will still fire readyStateChanges so you can tell
    //when the upload has finished (even if you can't tell if it was successful
    //from JS)
};

Zotero.Idb = {};

//Initialize an indexedDB for the specified library user or group + id
//returns a promise that is resolved with a Zotero.Idb.Library instance when successful
//and rejected onerror
Zotero.Idb.Library = function(libraryString){
    Z.debug("Zotero.Idb.Library", 3);
    Z.debug("Initializing Zotero IDB", 3);
    this.libraryString = libraryString;
    this.owningLibrary = null;
    this.initialized = false;
};

Zotero.Idb.Library.prototype.init = function(){
    var idbLibrary = this;
    return new Promise(function(resolve, reject){
        //Don't bother with the prefixed names because they should all be irrelevant by now
        var indexedDB = window.indexedDB;
        idbLibrary.indexedDB = indexedDB;
        
        // Now we can open our database
        Z.debug("requesting indexedDb from browser", 3);
        var db;
        var request = indexedDB.open("Zotero_" + idbLibrary.libraryString, 4);
        request.onerror = function(e){
            Zotero.error("ERROR OPENING INDEXED DB");
            reject();
        };
        
        var upgradeCallback = function(event){
            Z.debug("Zotero.Idb onupgradeneeded or onsuccess", 3);
            var oldVersion = event.oldVersion;
            Z.debug("oldVersion: " + event.oldVersion, 3);
            var db = event.target.result;
            idbLibrary.db = db;
            
            if(oldVersion < 4){
                //delete old versions of object stores
                Z.debug("Existing object store names:", 3);
                Z.debug(JSON.stringify(db.objectStoreNames), 3);
                Z.debug("Deleting old object stores", 3);
                if(db.objectStoreNames["items"]){
                    db.deleteObjectStore("items");
                }
                if(db.objectStoreNames["tags"]){
                    db.deleteObjectStore("tags");
                }
                if(db.objectStoreNames["collections"]){
                    db.deleteObjectStore("collections");
                }
                if(db.objectStoreNames["files"]){
                    db.deleteObjectStore("files");
                }
                if(db.objectStoreNames["versions"]){
                    db.deleteObjectStore("versions");
                }
                Z.debug("Existing object store names:", 3);
                Z.debug(JSON.stringify(db.objectStoreNames), 3);
                
                // Create object stores to hold items, collections, and tags.
                // IDB keys are just the zotero object keys
                var itemStore = db.createObjectStore("items", { keyPath: "key" });
                var collectionStore = db.createObjectStore("collections", { keyPath: "key" });
                var tagStore = db.createObjectStore("tags", { keyPath: "tag" });
                var fileStore = db.createObjectStore("files");
                var versionStore = db.createObjectStore("versions");
                
                Z.debug("itemStore index names:", 3);
                Z.debug(JSON.stringify(itemStore.indexNames), 3);
                Z.debug("collectionStore index names:", 3);
                Z.debug(JSON.stringify(collectionStore.indexNames), 3);
                Z.debug("tagStore index names:", 3);
                Z.debug(JSON.stringify(tagStore.indexNames), 3);
                
                // Create index to search/sort items by each attribute
                J.each(Zotero.Item.prototype.fieldMap, function(key, val){
                    Z.debug("Creating index on " + key, 3);
                    itemStore.createIndex(key, "data." + key, { unique: false });
                });
                
                //itemKey index was created above with all other item fields
                //itemStore.createIndex("itemKey", "itemKey", { unique: false });
                
                //create multiEntry indices on item collectionKeys and tags
                itemStore.createIndex("collectionKeys", "data.collections", {unique: false, multiEntry:true});
                //index on extra tagstrings array since tags are objects and we can't index them directly
                itemStore.createIndex("itemTagStrings", "_supplement.tagstrings", {unique: false, multiEntry:true});
                //example filter for tag: Zotero.Idb.filterItems("itemTagStrings", "Unread");
                //example filter collection: Zotero.Idb.filterItems("collectionKeys", "<collectionKey>");
                
                //itemStore.createIndex("itemType", "itemType", { unique: false });
                itemStore.createIndex("parentItemKey", "data.parentItem", { unique: false });
                itemStore.createIndex("libraryKey", "libraryKey", { unique: false });
                itemStore.createIndex("deleted", "data.deleted", { unique: false });
                
                collectionStore.createIndex("name", "data.name", { unique: false });
                collectionStore.createIndex("key", "key", { unique: false });
                collectionStore.createIndex("parentCollection", "data.parentCollection", { unique: false });
                //collectionStore.createIndex("libraryKey", "libraryKey", { unique: false });
                
                tagStore.createIndex("tag", "tag", { unique: false });
                //tagStore.createIndex("libraryKey", "libraryKey", { unique: false });
            }
        };
        
        request.onupgradeneeded = upgradeCallback;
        
        request.onsuccess = function(){
            Z.debug("IDB success", 3);
            idbLibrary.db = request.result;
            idbLibrary.initialized = true;
            resolve(idbLibrary);
        };
    });
};

Zotero.Idb.Library.prototype.deleteDB = function(){
    var idbLibrary = this;
    idbLibrary.db.close();
    return new Promise(function(resolve, reject){
        var deleteRequest = idbLibrary.indexedDB.deleteDatabase("Zotero_" + idbLibrary.libraryString);
        deleteRequest.onerror = function(){
            Z.error("Error deleting indexedDB");
            reject();
        };
        deleteRequest.onsuccess = function(){
            Z.debug("Successfully deleted indexedDB", 2);
            resolve();
        };
    });
};

/**
* @param {string} store_name
* @param {string} mode either "readonly" or "readwrite"
*/
Zotero.Idb.Library.prototype.getObjectStore = function (store_name, mode) {
    var idbLibrary = this;
    var tx = idbLibrary.db.transaction(store_name, mode);
    return tx.objectStore(store_name);
};

Zotero.Idb.Library.prototype.clearObjectStore = function (store_name) {
    var idbLibrary = this;
    var store = getObjectStore(store_name, 'readwrite');
    return new Promise(function(resolve, reject){
        var req = store.clear();
        req.onsuccess = function(evt) {
            Z.debug("Store cleared", 3);
            resolve();
        };
        req.onerror = function (evt) {
            Z.error("clearObjectStore:", evt.target.errorCode);
            reject();
        };
    });
};

/**
* Add array of items to indexedDB
* @param {array} items
*/
Zotero.Idb.Library.prototype.addItems = function(items){
    return this.addObjects(items, 'item');
};

/**
* Update/add array of items to indexedDB
* @param {array} items
*/
Zotero.Idb.Library.prototype.updateItems = function(items){
    return this.updateObjects(items, 'item');
};

/**
* Remove array of items to indexedDB. Just references itemKey and does no other checks that items match
* @param {array} items
*/
Zotero.Idb.Library.prototype.removeItems = function(items){
    return this.removeObjects(items, 'item');
};

/**
* Get item from indexedDB that has given itemKey
* @param {string} itemKey
*/
Zotero.Idb.Library.prototype.getItem = function(itemKey){
    var idbLibrary = this;
    return new Promise(function(resolve, reject){
        var success = function(event){
            resolve(event.target.result);
        };
        idbLibrary.db.transaction("items").objectStore(["items"], "readonly").get(itemKey).onsuccess = success;
    });
};

/**
* Get all the items in this indexedDB
* @param {array} items
*/
Zotero.Idb.Library.prototype.getAllItems = function(){
    return this.getAllObjects('item');
};

Zotero.Idb.Library.prototype.getOrderedItemKeys = function(field, order){
    var idbLibrary = this;
    Z.debug("Zotero.Idb.getOrderedItemKeys", 3);
    Z.debug("" + field + " " + order, 3);
    return new Promise(function(resolve, reject){
        var objectStore = idbLibrary.db.transaction(['items'], 'readonly').objectStore('items');
        var index = objectStore.index(field);
        if(!index){
            throw new Error("Index for requested field '" + field + "'' not found");
        }
        
        var cursorDirection = "next";
        if(order == "desc"){
            cursorDirection = "prev";
        }
        
        var cursorRequest = index.openKeyCursor(null, cursorDirection);
        var itemKeys = [];
        cursorRequest.onsuccess = J.proxy(function(event) {
            var cursor = event.target.result;
            if (cursor) {
                itemKeys.push(cursor.primaryKey);
                cursor.continue();
            }
            else {
                Z.debug("No more cursor: done. Resolving deferred.", 3);
                resolve(itemKeys);
            }
        }, this);
        
        cursorRequest.onfailure = J.proxy(function(event){
            reject();
        }, this);
    });
};

//filter the items in indexedDB by value in field
Zotero.Idb.Library.prototype.filterItems = function(field, value){
    var idbLibrary = this;
    Z.debug("Zotero.Idb.filterItems " + field + " - " + value, 3);
    return new Promise(function(resolve, reject){
        var itemKeys = [];
        var objectStore = idbLibrary.db.transaction(['items'], 'readonly').objectStore('items');
        var index = objectStore.index(field);
        if(!index){
            throw new Error("Index for requested field '" + field + "'' not found");
        }
        
        var cursorDirection = "next";
        /*if(order == "desc"){
            cursorDirection = "prev";
        }*/
        
        var range = IDBKeyRange.only(value);
        var cursorRequest = index.openKeyCursor(range, cursorDirection);
        cursorRequest.onsuccess = J.proxy(function(event) {
            var cursor = event.target.result;
            if (cursor) {
                itemKeys.push(cursor.primaryKey);
                cursor.continue();
            }
            else {
                Z.debug("No more cursor: done. Resolving deferred.", 3);
                resolve(itemKeys);
            }
        }, this);
        
        cursorRequest.onfailure = J.proxy(function(event){
            reject();
        }, this);
    });
};

Zotero.Idb.Library.prototype.inferType = function(object){
    if(!object){
        return false;
    }
    if(!object.instance){
        return false;
    }
    switch(object.instance){
        case 'Zotero.Item':
            return 'item';
        case 'Zotero.Collection':
            return 'collection';
        case 'Zotero.Tag':
            return 'tag';
        default:
            return false;
    }
};

Zotero.Idb.Library.prototype.getTransactionAndStore = function(type, access){
    var idbLibrary = this;
    var transaction;
    var objectStore;
    switch(type){
        case 'item':
            transaction = idbLibrary.db.transaction(['items'], access);
            objectStore = transaction.objectStore('items');
            break;
        case 'collection':
            transaction = idbLibrary.db.transaction(['collections'], access);
            objectStore = transaction.objectStore('collections');
            break;
        case 'tag':
            transaction = idbLibrary.db.transaction(['tags'], access);
            objectStore = transaction.objectStore('tags');
            break;
        default:
            return Promise.reject();
    }
    return [transaction, objectStore];
};

Zotero.Idb.Library.prototype.addObjects = function(objects, type){
    Z.debug("Zotero.Idb.Library.addObjects", 3);
    var idbLibrary = this;
    if(!type){
        type = idbLibrary.inferType(objects[0]);
    }
    var TS = idbLibrary.getTransactionAndStore(type, 'readwrite');
    var transaction = TS[0];
    var objectStore = TS[1];
    
    return new Promise(function(resolve, reject){
        transaction.oncomplete = function(event){
            Zotero.debug("Add Objects transaction completed.", 3);
            resolve();
        };
        
        transaction.onerror = function(event){
            Zotero.error("Add Objects transaction failed.");
            reject();
        };
        
        var reqSuccess = function(event){
            Zotero.debug("Added Object " + event.target.result, 4);
        };
        for (var i in objects) {
            var request = objectStore.add(objects[i].apiObj);
            request.onsuccess = reqSuccess;
        }
    });
};

Zotero.Idb.Library.prototype.updateObjects = function(objects, type){
    Z.debug("Zotero.Idb.Library.updateObjects", 3);
    var idbLibrary = this;
    if(!type){
        type = idbLibrary.inferType(objects[0]);
    }
    var TS = idbLibrary.getTransactionAndStore(type, 'readwrite');
    var transaction = TS[0];
    var objectStore = TS[1];
    
    return new Promise(function(resolve, reject){
        transaction.oncomplete = function(event){
            Zotero.debug("Update Objects transaction completed.", 3);
            resolve();
        };
        
        transaction.onerror = function(event){
            Zotero.error("Update Objects transaction failed.");
            reject();
        };
        
        var reqSuccess = function(event){
            Zotero.debug("Updated Object " + event.target.result, 4);
        };
        for (var i in objects) {
            var request = objectStore.put(objects[i].apiObj);
            request.onsuccess = reqSuccess;
        }
    });
};

Zotero.Idb.Library.prototype.removeObjects = function(objects, type){
    var idbLibrary = this;
    if(!type){
        type = idbLibrary.inferType(objects[0]);
    }
    var TS = idbLibrary.getTransactionAndStore(type, 'readwrite');
    var transaction = TS[0];
    var objectStore = TS[1];
    
    return new Promise(function(resolve, reject){
        transaction.oncomplete = function(event){
            Zotero.debug("Remove Objects transaction completed.", 3);
            resolve();
        };
        
        transaction.onerror = function(event){
            Zotero.error("Remove Objects transaction failed.");
            reject();
        };
        
        var reqSuccess = function(event){
            Zotero.debug("Removed Object " + event.target.result, 4);
        };
        for (var i in collections) {
            var request = objectStore.delete(objects[i].key);
            request.onsuccess = reqSuccess;
        }
    });
};

Zotero.Idb.Library.prototype.getAllObjects = function(type){
    var idbLibrary = this;
    if(!type){
        type = idbLibrary.inferType(objects[0]);
    }
    return new Promise(function(resolve, reject){
        var objects = [];
        var objectStore = idbLibrary.db.transaction(type + 's').objectStore(type + 's');
        
        objectStore.openCursor().onsuccess = function(event) {
            var cursor = event.target.result;
            if (cursor) {
                objects.push(cursor.value);
                cursor.continue();
            }
            else {
                resolve(objects);
            }
        };
    });
};

Zotero.Idb.Library.prototype.addCollections = function(collections){
    return this.addObjects(collections, 'collection');
};

Zotero.Idb.Library.prototype.updateCollections = function(collections){
    Z.debug("Zotero.Idb.Library.updateCollections", 3);
    return this.updateObjects(collections, 'collection');
};

/**
* Get collection from indexedDB that has given collectionKey
* @param {string} collectionKey
*/
Zotero.Idb.Library.prototype.getCollection = function(collectionKey){
    var idbLibrary = this;
    return new Promise(function(resolve, reject){
        var success = function(event){
            resolve(event.target.result);
        };
        idbLibrary.db.transaction("collections").objectStore(["collections"], "readonly").get(collectionKey).onsuccess = success;
    });
};

Zotero.Idb.Library.prototype.removeCollections = function(collections){
    Z.debug("Zotero.Idb.Library.removeCollections", 3);
    return this.removeObjects(collections, 'collection');
};

Zotero.Idb.Library.prototype.getAllCollections = function(){
    Z.debug('Zotero.Idb.Library.getAllCollections', 3);
    return this.getAllObjects('collection');
};

Zotero.Idb.Library.prototype.addTags = function(tags){
    return this.addObjects(tags, 'tag');
};

Zotero.Idb.Library.prototype.updateTags = function(tags){
    Z.debug("Zotero.Idb.Library.updateTags", 3);
    return this.updateObjects(tags, 'tag');
};

Zotero.Idb.Library.prototype.getAllTags = function(){
    Z.debug('getAllTags', 3);
    return this.getAllObjects('tag');
};

Zotero.Idb.Library.prototype.setVersion = function(type, version){
    Z.debug("Zotero.Idb.Library.setVersion", 3);
    var idbLibrary = this;
    return new Promise(function(resolve, reject){
        var transaction = idbLibrary.db.transaction(["versions"], "readwrite");
        
        transaction.oncomplete = function(event){
            Zotero.debug("set version transaction completed.", 3);
            resolve();
        };
        
        transaction.onerror = function(event){
            Zotero.error("set version transaction failed.");
            reject();
        };
        
        var versionStore = transaction.objectStore("versions");
        var reqSuccess = function(event){
            Zotero.debug("Set Version" + event.target.result, 3);
        };
        var request = versionStore.put(version, type);
        request.onsuccess = reqSuccess;
    });
};

/**
* Get version data from indexedDB
* @param {string} type
*/
Zotero.Idb.Library.prototype.getVersion = function(type){
    Z.debug("Zotero.Idb.Library.getVersion", 3);
    var idbLibrary = this;
    return new Promise(function(resolve, reject){
        var success = function(event){
            Z.debug("done getting version");
            resolve(event.target.result);
        };
        idbLibrary.db.transaction(["versions"], "readonly").objectStore("versions").get(type).onsuccess = success;
    });
};

Zotero.Idb.Library.prototype.setFile = function(itemKey, fileData){
    Z.debug("Zotero.Idb.Library.setFile", 3);
    var idbLibrary = this;
    return new Promise(function(resolve, reject){
        var transaction = idbLibrary.db.transaction(["files"], "readwrite");
        
        transaction.oncomplete = function(event){
            Zotero.debug("set file transaction completed.", 3);
            resolve();
        };
        
        transaction.onerror = function(event){
            Zotero.error("set file transaction failed.");
            reject();
        };
        
        var fileStore = transaction.objectStore("files");
        var reqSuccess = function(event){
            Zotero.debug("Set File" + event.target.result, 3);
        };
        var request = fileStore.put(fileData, itemKey);
        request.onsuccess = reqSuccess;
    });
};

/**
* Get item from indexedDB that has given itemKey
* @param {string} itemKey
*/
Zotero.Idb.Library.prototype.getFile = function(itemKey){
    Z.debug("Zotero.Idb.Library.getFile", 3);
    var idbLibrary = this;
    return new Promise(function(resolve, reject){
        var success = function(event){
            Z.debug("done getting file");
            resolve(event.target.result);
        };
        idbLibrary.db.transaction(["files"], "readonly").objectStore("files").get(itemKey).onsuccess = success;
    });
};

Zotero.Idb.Library.prototype.deleteFile = function(itemKey){
    Z.debug("Zotero.Idb.Library.deleteFile", 3);
    var idbLibrary = this;
    return new Promise(function(resolve, reject){
        var transaction = idbLibrary.db.transaction(["files"], "readwrite");
        
        transaction.oncomplete = function(event){
            Zotero.debug("delete file transaction completed.", 3);
            resolve();
        };
        
        transaction.onerror = function(event){
            Zotero.error("delete file transaction failed.");
            reject();
        };
        
        var fileStore = transaction.objectStore("files");
        var reqSuccess = function(event){
            Zotero.debug("Deleted File" + event.target.result, 4);
        };
        var request = fileStore.delete(key);
        request.onsuccess = reqSuccess;
    });
};


//intersect two arrays of strings as an AND condition on index results
Zotero.Idb.Library.prototype.intersect = function(ar1, ar2){
    var idbLibrary = this;
    var result = [];
    for(var i = 0; i < ar1.length; i++){
        if(ar2.indexOf(ar1[i]) !== -1){
            result.push(ar1[i]);
        }
    }
    return result;
};

//intersect an array of arrays of strings as an AND condition on index results
Zotero.Idb.Library.prototype.intersectAll = function(arrs) {
    var idbLibrary = this;
    var result = arrs[0];
    for(var i = 0; i < arrs.length - 1; i++){
        result = idbLibrary.intersect(result, arrs[i+1]);
    }
    return result;
};
Zotero.Library.prototype.processLoadedCollections = function(response){
    Z.debug('processLoadedCollections', 3);
    var library = this;
    
    //clear out display items
    Z.debug("adding collections to library.collections");
    var collectionsAdded = library.collections.addCollectionsFromJson(response.data);
    for (var i = 0; i < collectionsAdded.length; i++) {
        collectionsAdded[i].associateWithLibrary(library);
    }
    //update sync state
    library.collections.updateSyncState(response.lastModifiedVersion);
    
    Zotero.trigger("loadedCollectionsProcessed", {library:library, collectionsAdded:collectionsAdded});
    return response;
};

//create+write a collection given a name and optional parentCollectionKey
Zotero.Library.prototype.addCollection = function(name, parentCollection){
    Z.debug("Zotero.Library.addCollection", 3);
    var library = this;
    
    var collection = new Zotero.Collection();
    collection.associateWithLibrary(library);
    collection.set('name', name);
    collection.set('parentCollection', parentCollection);
    
    return library.collections.writeCollections([collection]);
};

//make request for item keys and return jquery ajax promise
Zotero.Library.prototype.fetchItemKeys = function(config){
    Z.debug("Zotero.Library.fetchItemKeys", 3);
    var library = this;
    if(typeof config == 'undefined'){
        config = {};
    }
    var urlconfig = J.extend(true, {
        'target':'items',
        'libraryType':this.libraryType,
        'libraryID':this.libraryID,
        'format':'keys'
    }, config);
    
    return library.ajaxRequest(urlconfig);
};

//get keys of all items marked for deletion
Zotero.Library.prototype.getTrashKeys = function(){
    Z.debug("Zotero.Library.getTrashKeys", 3);
    var library = this;
    var urlconfig = {
        'target': 'items',
        'libraryType': library.libraryType,
        'libraryID': library.libraryID,
        'format': 'keys',
        'collectionKey': 'trash',
    };
    
    return library.ajaxRequest(urlconfig);
};

Zotero.Library.prototype.emptyTrash = function(){
    Z.debug("Zotero.Library.emptyTrash", 3);
    var library = this;
    return library.getTrashKeys()
    .then(function(response){
        var trashedItemKeys = response.data.split("\n");
        return library.items.deleteItems(trashedItemKeys, response.lastModifiedVersion);
    });
};

Zotero.Library.prototype.loadItemKeys = function(config){
    Z.debug("Zotero.Library.loadItemKeys", 3);
    var library = this;
    return this.fetchItemKeys(config)
    .then(function(response){
        Z.debug('loadItemKeys proxied callback', 3);
        var keys = response.data.split(/[\s]+/);
        library.itemKeys = keys;
    });
};

Zotero.Library.prototype.loadItems = function(config){
    Z.debug("Zotero.Library.loadItems", 3);
    var library = this;
    if(!config){
        config = {};
    }
    
    var defaultConfig = {target:'items',
                         targetModifier: 'top',
                         start: 0,
                         limit: 25,
                         order: Zotero.config.defaultSortColumn,
                         sort: Zotero.config.defaultSortOrder
                     };
    
    //Build config object that should be displayed next and compare to currently displayed
    var newConfig = J.extend({}, defaultConfig, config);
    //newConfig.start = parseInt(newConfig.limit, 10) * (parseInt(newConfig.itemPage, 10) - 1);
    
    var urlconfig = J.extend({
        'target':'items',
        'libraryType':library.libraryType,
        'libraryID':library.libraryID
    }, newConfig);
    var requestUrl = Zotero.ajax.apiRequestString(urlconfig);
    
    return library.ajaxRequest(requestUrl)
    .then(function(response){
        Z.debug('loadItems proxied callback', 3);
        //var library = this;
        var items = library.items;
        //clear out display items
        var loadedItemsArray = items.addItemsFromJson(response.data);
        for (var i = 0; i < loadedItemsArray.length; i++) {
            loadedItemsArray[i].associateWithLibrary(library);
        }
        
        response.loadedItems = loadedItemsArray;
        Zotero.trigger("itemsChanged", {library:library});
        return response;
    });
};

Zotero.Library.prototype.loadPublications = function(config){
    Z.debug("Zotero.Library.loadItems", 3);
    var library = this;
    if(!config){
        config = {};
    }
    
    var defaultConfig = {target:'publications',
                         start: 0,
                         limit: 50,
                         order: Zotero.config.defaultSortColumn,
                         sort: Zotero.config.defaultSortOrder,
                         include: 'bib',
                     };
    
    //Build config object that should be displayed next and compare to currently displayed
    var newConfig = J.extend({}, defaultConfig, config);
    
    var urlconfig = J.extend({
        'target':'publications',
        'libraryType':library.libraryType,
        'libraryID':library.libraryID
    }, newConfig);
    var requestUrl = Zotero.ajax.apiRequestString(urlconfig);
    
    return library.ajaxRequest(requestUrl)
    .then(function(response){
        Z.debug('loadItems proxied callback', 3);
        publicationItems = [];
        parsedItemJson = response.data;
        J.each(parsedItemJson, function(index, itemObj) {
            var item = new Zotero.Item(itemObj);
            publicationItems.push(item);
        });
        
        response.publicationItems = publicationItems;
        return response;
    });
};

Zotero.Library.prototype.processLoadedItems = function(response){
    Z.debug('processLoadedItems', 3);
    var library = this;
    var items = library.items;
    //clear out display items
    var loadedItemsArray = items.addItemsFromJson(response.data);
    for (var i = 0; i < loadedItemsArray.length; i++) {
        loadedItemsArray[i].associateWithLibrary(library);
    }
    
    //update sync state
    library.items.updateSyncState(response.lastModifiedVersion);
    
    Zotero.trigger("itemsChanged", {library:library, loadedItems:loadedItemsArray});
    return response;
};

Zotero.Library.prototype.loadItem = function(itemKey) {
    Z.debug("Zotero.Library.loadItem", 3);
    var library = this;
    if(!config){
        var config = {};
    }
    
    var urlconfig = {
        'target':'item',
        'libraryType':library.libraryType,
        'libraryID':library.libraryID,
        'itemKey':itemKey,
    };
    
    return library.ajaxRequest(urlconfig)
    .then(function(response){
        Z.debug("Got loadItem response");
        var item = new Zotero.Item(response.data);
        item.owningLibrary = library;
        library.items.itemObjects[item.key] = item;
        Zotero.trigger("itemsChanged", {library:library});
        return(item);
    },
    function(response){
        Z.debug("Error loading Item");
    });
};

Zotero.Library.prototype.trashItem = function(itemKey){
    var library = this;
    return library.items.trashItems([library.items.getItem(itemKey)]);
};

Zotero.Library.prototype.untrashItem = function(itemKey){
    Z.debug("Zotero.Library.untrashItem", 3);
    if(!itemKey) return false;
    
    var item = this.items.getItem(itemKey);
    item.apiObj.deleted = 0;
    return item.writeItem();
};

Zotero.Library.prototype.deleteItem = function(itemKey){
    Z.debug("Zotero.Library.deleteItem", 3);
    var library = this;
    return library.items.deleteItem(itemKey);
};

Zotero.Library.prototype.deleteItems = function(itemKeys){
    Z.debug("Zotero.Library.deleteItems", 3);
    var library = this;
    return library.items.deleteItems(itemKeys);
};

Zotero.Library.prototype.addNote = function(itemKey, note){
    Z.debug('Zotero.Library.prototype.addNote', 3);
    var library = this;
    var config = {
        'target':'children',
        'libraryType':library.libraryType,
        'libraryID':library.libraryID,
        'itemKey':itemKey
    };
    
    var requestUrl = Zotero.ajax.apiRequestString(config);
    var item = this.items.getItem(itemKey);
    
    return library.ajaxRequest(requestUrl, "POST", {processData: false});
};

Zotero.Library.prototype.fetchGlobalItems = function(config){
    Z.debug("Zotero.Library.fetchGlobalItems", 3);
    var library = this;
    if(!config){
        config = {};
    }
    
    var defaultConfig = {target:'items',
                         start: 0,
                         //itemPage: 1,
                         limit: 25,
                     };
    
    //Build config object that should be displayed next and compare to currently displayed
    var newConfig = J.extend({}, defaultConfig, config);
    //newConfig.start = parseInt(newConfig.limit, 10) * (parseInt(newConfig.itemPage, 10) - 1);
    
    var urlconfig = J.extend({'target':'items', 'libraryType': ''}, newConfig);
    var requestUrl = Zotero.ajax.apiRequestString(urlconfig);
    
    return library.ajaxRequest(requestUrl, "GET", {dataType:'json'})
    .then(function(response){
        Z.debug('globalItems callback', 3);
        return(response.data);
    });
};

Zotero.Library.prototype.fetchGlobalItem = function(globalKey){
    Z.debug("Zotero.Library.fetchGlobalItem", 3);
    Z.debug(globalKey);
    var library = this;
    
    var defaultConfig = {target:'item'};
    
    //Build config object that should be displayed next and compare to currently displayed
    var newConfig = J.extend({}, defaultConfig);
    var urlconfig = J.extend({
        'target':'item',
        'libraryType': '',
        'itemKey': globalKey
    }, newConfig);
    var requestUrl = Zotero.ajax.apiRequestString(urlconfig);
    
    return library.ajaxRequest(requestUrl, "GET", {dataType:"json"})
    .then(function(response){
        Z.debug('globalItem callback', 3);
        return(response.data);
    });
};
Zotero.Library.prototype.fetchTags = function(config){
    Z.debug("Zotero.Library.fetchTags", 3);
    var library = this;
    var defaultConfig = {
        target:'tags',
        order:'title',
        sort:'asc',
        limit: 100
    };
    var newConfig = J.extend({}, defaultConfig, config);
    var urlconfig = J.extend({
        'target':'tags',
        'libraryType':this.libraryType,
        'libraryID':this.libraryID
    }, newConfig);
    
    return Zotero.ajaxRequest(urlconfig);
};

Zotero.Library.prototype.loadTags = function(config){
    Z.debug("Zotero.Library.loadTags", 3);
    var library = this;
    
    if(typeof config == 'undefined'){
        config = {};
    }
    
    if(config.showAutomaticTags && config.collectionKey){
        delete config.collectionKey;
    }
    
    library.tags.displayTagsArray = [];
    return library.fetchTags(config)
    .then(function(response){
        Z.debug('loadTags proxied callback', 3);
        var updatedVersion = response.lastModifiedVersion;
        library.tags.updateSyncState(updatedVersion);
        var addedTags = library.tags.addTagsFromJson(response.data);
        library.tags.updateTagsVersion(updatedVersion);
        library.tags.rebuildTagsArray();
        
        if(response.parsedLinks.hasOwnProperty('next')){
            library.tags.hasNextLink = true;
            library.tags.nextLink = response.parsedLinks['next'];
        }
        else{
            library.tags.hasNextLink = false;
            library.tags.nextLink = null;
        }
        library.trigger("tagsChanged", {library:library});
        return library.tags;
    });
};


Zotero.Library.prototype.loadAllTags = function(config){
    Z.debug("Zotero.Library.loadAllTags", 3);
    var library = this;
    if(typeof config == 'undefined'){
        config = {};
    }
    
    var defaultConfig = {target:'tags',
                         order:'title',
                         sort:'asc',
                         limit: 100,
                         libraryType:library.libraryType,
                         libraryID:library.libraryID
                     };
    
    //Build config object that should be displayed next and compare to currently displayed
    var newConfig = J.extend({}, defaultConfig, config);
    var urlconfig = J.extend({}, newConfig);
    var requestUrl = Zotero.ajax.apiRequestString(urlconfig);
    var tags = library.tags;
    
    //check if already loaded tags are okay to use
    var loadedConfig = J.extend({}, defaultConfig, tags.loadedConfig);
    var loadedConfigRequestUrl = tags.loadedRequestUrl;
    Z.debug("requestUrl: " + requestUrl, 4);
    Z.debug('loadedConfigRequestUrl: ' + loadedConfigRequestUrl, 4);
    return new Promise(function(resolve, reject){
        var continueLoadingCallback = function(tags){
            Z.debug("loadAllTags continueLoadingCallback", 3);
            var plainList = Zotero.Tags.prototype.plainTagsList(tags.tagsArray);
            plainList.sort(Zotero.Library.prototype.comparer());
            tags.plainList = plainList;
            
            if(tags.hasNextLink){
                Z.debug("still has next link.", 3);
                tags.tagsArray.sort(Zotero.Tag.prototype.tagComparer());
                plainList = Zotero.Tags.prototype.plainTagsList(tags.tagsArray);
                plainList.sort(Zotero.Library.prototype.comparer());
                tags.plainList = plainList;
                
                var nextLink = tags.nextLink;
                var nextLinkConfig = J.deparam(J.param.querystring(nextLink));
                var newConfig = J.extend({}, config);
                newConfig.start = nextLinkConfig.start;
                newConfig.limit = nextLinkConfig.limit;
                return library.loadTags(newConfig).then(continueLoadingCallback);
            }
            else{
                Z.debug("no next in tags link", 3);
                tags.updateSyncedVersion();
                tags.tagsArray.sort(Zotero.Tag.prototype.tagComparer());
                plainList = Zotero.Tags.prototype.plainTagsList(tags.tagsArray);
                plainList.sort(Zotero.Library.prototype.comparer());
                tags.plainList = plainList;
                Z.debug("resolving loadTags deferred", 3);
                library.tagsLoaded = true;
                library.tags.loaded = true;
                tags.loadedConfig = config;
                tags.loadedRequestUrl = requestUrl;
                
                //update all tags with tagsVersion
                for (var i = 0; i < library.tags.tagsArray.length; i++) {
                    tags.tagsArray[i].apiObj.version = tags.tagsVersion;
                }
                
                library.trigger("tagsChanged", {library:library});
                return tags;
            }
        };
        
        resolve( library.loadTags(urlconfig)
        .then(continueLoadingCallback));
    });
};

//load objects from indexedDB
Zotero.Library.prototype.loadIndexedDBCache = function(){
    Zotero.debug("Zotero.Library.loadIndexedDBCache", 3);
    
    var library = this;
    
    var itemsPromise = library.idbLibrary.getAllItems();
    var collectionsPromise = library.idbLibrary.getAllCollections();
    var tagsPromise = library.idbLibrary.getAllTags();
    
    itemsPromise.then(function(itemsArray){
        Z.debug("loadIndexedDBCache itemsD done", 3);
        //create itemsDump from array of item objects
        var latestItemVersion = 0;
        for(var i = 0; i < itemsArray.length; i++){
            var item = new Zotero.Item(itemsArray[i]);
            library.items.addItem(item);
            if(item.version > latestItemVersion){
                latestItemVersion = item.version;
            }
        }
        library.items.itemsVersion = latestItemVersion;
        
        //TODO: add itemsVersion as last version in any of these items?
        //or store it somewhere else for indexedDB cache purposes
        library.items.loaded = true;
        Z.debug("Done loading indexedDB items promise into library", 3);
    });
    
    collectionsPromise.then(function(collectionsArray){
        Z.debug("loadIndexedDBCache collectionsD done", 3);
        //create collectionsDump from array of collection objects
        var latestCollectionVersion = 0;
        for(var i = 0; i < collectionsArray.length; i++){
            var collection = new Zotero.Collection(collectionsArray[i]);
            library.collections.addCollection(collection);
            if(collection.version > latestCollectionVersion){
                latestCollectionVersion = collection.version;
            }
        }
        library.collections.collectionsVersion = latestCollectionVersion;
        
        //TODO: add collectionsVersion as last version in any of these items?
        //or store it somewhere else for indexedDB cache purposes
        library.collections.initSecondaryData();
        library.collections.loaded = true;
    });
    
    tagsPromise.then(function(tagsArray){
        Z.debug("loadIndexedDBCache tagsD done", 3);
        Z.debug(tagsArray);
        //create tagsDump from array of tag objects
        var latestVersion = 0;
        var tagsVersion = 0;
        for(var i = 0; i < tagsArray.length; i++){
            var tag = new Zotero.Tag(tagsArray[i]);
            library.tags.addTag(tag);
            if(tagsArray[i].version > latestVersion){
                latestVersion = tagsArray[i].version;
            }
        }
        tagsVersion = latestVersion;
        library.tags.tagsVersion = tagsVersion;

        //TODO: add tagsVersion as last version in any of these items?
        //or store it somewhere else for indexedDB cache purposes
        library.tags.loaded = true;
    });
    
    
    //resolve the overall deferred when all the child deferreds are finished
    return Promise.all([itemsPromise, collectionsPromise, tagsPromise]);
};

Zotero.Library.prototype.saveIndexedDB = function(){
    var library = this;
    
    var saveItemsPromise = library.idbLibrary.updateItems(library.items.itemsArray);
    var saveCollectionsPromise = library.idbLibrary.updateCollections(library.collections.collectionsArray);
    var saveTagsPromise = library.idbLibrary.updateTags(library.tags.tagsArray);
    
    //resolve the overall deferred when all the child deferreds are finished
    return Promise.all([saveItemsPromise, saveCollectionsPromise, saveTagsPromise]);
};Zotero.Preferences = function(store, idString) {
    this.store = store;
    this.idString = idString;
    this.preferencesObject = {};
    this.defaults = {
        debug_level: 3, //lower level is higher priority
        debug_log: true,
        debug_mock: false,
        listDisplayedFields: ['title', 'creator', 'dateModified'],
        showAutomaticTags: false,//tagType:1 is automatic, tagType:0 was added by user
        itemsPerPage: 25,
        order: 'title',
        title: 'asc'
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
    if(typeof(newPrefs) != "object") {
        throw new Error("Preferences must be an object");
    }
    preferences.preferencesObject = newPrefs;
    preferences.persist();
};

Zotero.Preferences.prototype.getPref = function(key){
    var preferences = this;
    if(preferences.preferencesObject[key]){
        return preferences.preferencesObject[key];
    }
    else if(preferences.defaults[key]){
        return preferences.defaults[key];
    }
    else {
        return null;
    }
};

Zotero.Preferences.prototype.getPrefs = function(){
    var preferences = this;
    return preferences.preferencesObject;
};

Zotero.Preferences.prototype.persist = function(){
    var preferences = this;
    var storageString = 'preferences_' + preferences.idString;
    preferences.store[storageString] = JSON.stringify(preferences.preferencesObject);
};

Zotero.Preferences.prototype.load = function(){
    var preferences = this;
    var storageString = 'preferences_' + preferences.idString;
    var storageObjectString = preferences.store[storageString];
    if(!storageObjectString){
        preferences.preferencesObject = {};
    }
    else {
        preferences.preferencesObject = JSON.parse(storageObjectString);
    }
};




var J = jQuery.noConflict();

jQuery(document).ready(function() {
    /* The Zotero web library is built on top of libZotero as a group of
     * relatively independent widgets. They interact by listening to and
     * triggering events (with optional filters) on the Zotero object or
     * individual Zotero.Library objects. State is maintained by a
     * Zotero.State object that optionally stores variables in the url
     * using pushState as well. With pushState enabled back/forward
     * actions trigger events for the variables that have changed so
     * widgets listening know to update.
     */
    Z.debug('===== DOM READY =====', 3);
    Zotero.state = new Zotero.State();
    Zotero.init();
});

Zotero.defaultPrefs = {
    debug_level: 3, //lower level is higher priority
    debug_log: true,
    debug_mock: false,
    javascript_enabled: false,
};

Zotero.init = function(){
    Z.debug("Zotero init", 3);
    
    if(window.zoteroConfig){
        Zotero.config = J.extend({}, Zotero.config, window.zoteroConfig);
    }
    
    Zotero.state.rewriteAltUrl();
    
    //base init to setup tagline and search bar
    if(Zotero.pages){
        Zotero.pages.base.init();
    }
    
    //run page specific init
    if((window.zoterojsClass) && (undefined !== Zotero.pages) && Zotero.pages[zoterojsClass]) {
        try{
            Zotero.pages[zoterojsClass].init();
        }
        catch(err){
            Z.error("Error running page specific init for " + zoterojsClass);
            Z.error(err);
        }
    }
    
    if(typeof zoteroData == 'undefined'){
        zoteroData = {};
    }
    
    if(window.nonZendPage === true){
        return;
    }
    
    Zotero.state.parseUrlVars();
    
    Zotero.config.startPageTitle = document.title;
    var store;
    if(typeof sessionStorage == 'undefined'){
        store = {};//Zotero.storage.localStorage = {};
    }
    else{
        store = sessionStorage;
    }
    Zotero.cache = new Zotero.Cache(store);
    Zotero.store = store;
    //initialize global preferences object
    Zotero.preferences = new Zotero.Preferences(Zotero.store, 'global');
    Zotero.preferences.defaults = J.extend({}, Zotero.preferences.defaults, Zotero.config.defaultPrefs);
    
    //get localized item constants if not stored in localstorage
    var locale = "en-US";
    if(zoteroData.locale){
        locale = zoteroData.locale;
    }
    
    //load general data if on library page
    if(Zotero.config.pageClass == 'user_library' || Zotero.config.pageClass == 'group_library' || Zotero.config.pageClass == 'my_library'){
        Z.debug("library page - ")
        Zotero.state.libraryString = Zotero.utils.libraryString(Zotero.config.librarySettings.libraryType,
        Zotero.config.librarySettings.libraryID);
        Zotero.state.filter = Zotero.state.libraryString;
        
        Zotero.Item.prototype.getItemTypes(locale);
        Zotero.Item.prototype.getItemFields(locale);
        Zotero.Item.prototype.getCreatorFields(locale);
        Zotero.Item.prototype.getCreatorTypes();
    } else {
        Z.debug("non-library page")
    }
    
    Zotero.ui.init.all();
    
    J.ajaxSettings.traditional = true;
    
    if(Zotero.state.getUrlVar('proxy') == 'false'){
        Zotero.config.proxy = false;
    }
    
    // Bind to popstate to update state when browser goes back
    // only applicable if state is using location
    window.onpopstate = function(){
        Z.debug("popstate", 3);
        J(window).trigger('statechange');
    };
    J(window).on('statechange', J.proxy(Zotero.state.popstateCallback, Zotero.state));
    
    //call popstateCallback on first load since some browsers don't popstate onload
    Zotero.state.popstateCallback();
};



Zotero.State = function(){
    this.q = {};
    this.f = {};
    this.pathVars = {};
    this.startUrl = '';
    this.replacePush = false;
    
    //keep track of where we came from
    //update prevHref before history.pushState so we know what changed
    //update curHref when we get a popState event
    //difference between those two is what we need to look at to know what we should update
    this.curHref = '';
    this.prevHref = '';
    //state holder that will keep "current" state separate from History so we can check for updates on popstate
    //"current" here amounts to the state actually represented in the loaded page, so it will be updated after
    //events fire for a browser state change
    this.curState = {};
    this.prevState = {};
    
    //setting to determine if we modify the url or not
    this.useLocation = true;
    
    this.filter = null;
    this.selectedItemKeys = [];
};

//rewrite old style urls to current urls
Zotero.State.prototype.rewriteAltUrl = function(){
    Z.debug("rewriteAltUrl");
    var state = this;
    var replace = false;
    
    var basePath = Zotero.config.nonparsedBaseUrl;
    var pathname = window.location.pathname
    var baseRE = new RegExp(".*" + basePath + "\/?");
    var oldCollectionRE = /^.*\/items\/collections?\/([A-Z0-9]{8})(?:\/[A-Z0-9]{8})?$/;
    var oldItemRE = /^.*\/items\/([A-Z0-9]{8})$/;
    
    switch(true){
        case oldCollectionRE.test(pathname):
            var matches = oldCollectionRE.exec(pathname);
            var collectionKey = matches[1];
            var itemKey = matches[2];
            replace = true;
            break;
        case oldItemRE.test(pathname):
            var matches = oldItemRE.exec(pathname);
            var itemKey = matches[1];
            replace = true;
            break;
    }
    
    if(collectionKey){
        state.setUrlVar('collectionKey', collectionKey);
    }
    if(itemKey){
        state.setUrlVar('itemKey', itemKey);
    }
    
    if(replace){
        state.replaceState();
    }
};

Zotero.State.prototype.updateCurState = function(){
    var state = this;
    state.curState = J.extend({}, state.f, state.q, state.pathVars);
    return;
};

Zotero.State.prototype.savePrevState = function(){
    var state = this;
    state.prevState = state.curState;
    return;
};

Zotero.State.prototype.getSelectedItemKeys = function(){
    var state = this;
    //filter actual selected itemKeys so we only return unique list
    //necessary because of duplicate item checkboxes, some of which
    //may be hidden
    var uniqueKeys = {};
    var returnKeys = [];
    J.each(state.selectedItemKeys, function(ind, val){
        uniqueKeys[val] = true;
    });
    J.each(uniqueKeys, function(key, val){
        returnKeys.push(key);
    });
    if(returnKeys.length == 0 && state.getUrlVar('itemKey')){
        returnKeys.push(state.getUrlVar('itemKey'));
    }
    return returnKeys;
};

Zotero.State.prototype.pushTag = function(newtag){
    Z.debug('Zotero.State.pushTag', 3);
    var state = this;
    if(state.pathVars['tag']){
        if(state.pathVars['tag'] instanceof Array){
            state.pathVars['tag'].push(newtag);
        }
        else{
            var currentTag = state.pathVars['tag'];
            state.pathVars['tag'] = [currentTag, newtag];
        }
    }
    else{
        state.pathVars['tag'] = [newtag];
    }
    return;
};

Zotero.State.prototype.popTag = function(oldtag){
    Z.debug('Zotero.State.popTag', 3);
    var state = this;
    if(!state.pathVars['tag']){
        return;
    }
    else if(state.pathVars['tag'] instanceof Array){
        var newTagArray = state.pathVars['tag'].filter(function(element, index, array){
            return element != oldtag;
        });
        state.pathVars['tag'] = newTagArray;
        return;
    }
    else if(state.pathVars['tag'] == oldtag){
        state.pathVars['tag'] = [];
        return;
    }
};

Zotero.State.prototype.toggleTag = function(tagtitle){
    Z.debug('Zotero.State.toggleTag', 3);
    var state = this;
    if(!state.pathVars['tag']){
        state.pathVars['tag'] = [tagtitle];
        return;
    }
    else if(J.isArray(state.pathVars['tag'])) {
        if(J.inArray(tagtitle, state.pathVars['tag']) != (-1) ){
            var newTagArray = state.pathVars['tag'].filter(function(element, index, array){
                return element != tagtitle;
            });
            state.pathVars['tag'] = newTagArray;
            return;
        }
        else{
            state.pathVars['tag'].push(tagtitle);
            return;
        }
    }
    else if(state.pathVars['tag'] == tagtitle){
        state.pathVars['tag'] = [];
        return;
    }
    else if(typeof state.pathVars['tag'] == 'string') {
        var oldValue = state.pathVars['tag'];
        state.pathVars['tag'] = [oldValue, tagtitle];
        return;
    }
};

Zotero.State.prototype.unsetUrlVar = function(unset){
    Z.debug("Zotero.State.unsetUrlVar", 3);
    var state = this;
    if(state.pathVars[unset]){
        delete(state.pathVars[unset]);
    }
};

Zotero.State.prototype.clearUrlVars = function(except){
    Z.debug("Zotero.State.clearUrlVars", 3);
    var state = this;
    if(!except){
        except = [];
    }
    var pathVars = state.pathVars;
    J.each(pathVars, function(key, value){
        if(J.inArray(key, except) == (-1)){
            delete(pathVars[key]);
        }
    });
};

Zotero.State.prototype.parseUrlVars = function(){
    Z.debug('Zotero.State.parseUrlVars', 3);
    var state = this;
    if(!state.useLocation) return;
    state.q = J.deparam(J.param.querystring());
    state.f = state.parseFragmentVars(); // J.deparam(J.param.fragment()),
    state.pathVars = state.parsePathVars();
};

Zotero.State.prototype.parsePathVars = function(pathname){
    Z.debug('Zotero.State.parsePathVars', 3);
    var state = this;
    var history = window.history;
    //parse variables out of library urls
    //:userslug/items/:itemKey/*
    //:userslug/items/collection/:collectionKey
    //groups/:groupidentifier/items/:itemKey/*
    //groups/:groupidentifier/items/collection/:collectionKey/*
    if(!pathname){
        //var hstate = history.state;// History.getState();
        pathname = window.location.pathname
    }
    var basePath = Zotero.config.nonparsedBaseUrl;
    var split_replaced = [];
    var re = new RegExp(".*" + basePath + "\/?");
    var replaced = pathname.replace(re, '');
    
    split_replaced = replaced.split('/');
    
    var pathVars = {};
    for(var i=0; i<(split_replaced.length-1); i = i+2){
        var pathVar = pathVars[split_replaced[i]];
        //if var already present change to array and/or push
        if(pathVar){
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
            pathVar = decodeURIComponent(split_replaced[i+1]);
        }
        pathVars[split_replaced[i]] = pathVar;
    }
    if(pathVars['itemkey']){
        var itemKey = pathVars['itemkey'];
        pathVars['itemKey'] = itemKey;
        delete pathVars['itemkey'];
    }
    return pathVars;
};

Zotero.State.prototype.parseFragmentVars = function(){
    var state = this;
    var fragmentVars = {};
    var fragment = J.param.fragment();
    var split_fragment = fragment.split('/');
    for(var i=0; i<(split_fragment.length-1); i = i+2){
        fragmentVars[split_fragment[i]] = split_fragment[i+1];
    }
    return fragmentVars;
};

Zotero.State.prototype.buildUrl = function(urlvars, queryVars, fragmentVars){
    var state = this;
    //Z.debug("Zotero.State.buildUrl", 3);
    if(typeof fragmentVars === 'undefined') { fragmentVars = false;}
    if(typeof queryVars === 'undefined') { queryVars = false;}
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
    
    var queryVarsArray = [];
    J.each(queryVars, function(index, value){
        if(!value) { return; }
        else if(value instanceof Array){
            J.each(value, function(i, v){
                queryVarsArray.push(index + '=' + encodeURIComponent(v) );
            });
        }
        else{
            queryVarsArray.push(index + '=' + encodeURIComponent(value) );
        }
    });
    queryVarsArray.sort();
    
    var pathVarsString = urlVarsArray.join('/');
    var queryString = '';
    if(queryVarsArray.length){
        queryString = '?' + queryVarsArray.join("&");
    }
    var url = basePath + pathVarsString + queryString;
    
    return url;
};

//addvars is an object mapping keys and values to add
//removevars is an array of var keys to remove
Zotero.State.prototype.mutateUrl = function(addvars, removevars){
    var state = this;
    //Z.debug("Zotero.State.mutateUrl", 3);
    if(!addvars){
        addvars = {};
    }
    if(!removevars){
        removevars = [];
    }
    
    var urlvars = J.extend({}, state.pathVars);
    J.each(addvars, function(key, val){
        urlvars[key] = val;
    });
    J.each(removevars, function(index, val){
        delete urlvars[val];
    });
    
    var url = state.buildUrl(urlvars, false);
    //Z.debug("mutated Url:" + url, 3);
    
    return url;
};

Zotero.State.prototype.pushState = function(){
    Z.debug('Zotero.State.pushState', 3);
    var state = this;
    var history = window.history;
    
    //Zotero.ui.saveFormData();
    //make prevHref the current location before we change it
    state.prevHref = state.curHref || window.location.href;
    
    //selectively add state to hint where to go
    var s = J.extend({}, state.f, state.q, state.pathVars);
    
    var urlvars = state.pathVars;
    var queryVars = state.q;
    var url = state.buildUrl(urlvars, queryVars, false);
    state.curHref = url;
    Z.debug("about to push url: " + url, 3);
    //actually push state and manually call urlChangeCallback if specified
    if(state.useLocation){
        if(state.replacePush === true){
            Z.debug("Zotero.State.pushState - replacePush", 3);
            state.replacePush = false;
            history.replaceState(s, document.title, url);
        }
        else{
            Z.debug("Zotero.State.pushState - pushState", 3);
            history.pushState(s, document.title, url);
            state.stateChanged();
        }
    }
    else {
        state.stateChanged();
    }
    Zotero.debug("leaving pushstate", 3);
};

Zotero.State.prototype.replaceState = function(){
    Z.debug("Zotero.State.replaceState", 3);
    var state = this;
    var history = window.history;
    //update current and leave prev alone.
    //Zotero.ui.saveFormData();
    state.updateCurState();
    
    //selectively add state to hint where to go
    var s = J.extend({}, state.curState);
    var urlvars = state.pathVars;
    var url = state.buildUrl(urlvars, false);
    
    if(state.useLocation){
        history.replaceState(s, null, url);
        state.curHref = url;
    }
    else {
        state.curHref = url;
    }
};

Zotero.State.prototype.updateStateTitle = function(title){
    Zotero.debug("Zotero.State.updateStateTitle", 3);
    var state = this;
    
    document.title = title;
};

Zotero.State.prototype.getUrlVar = function(key){
    var state = this;
    if(state.pathVars.hasOwnProperty(key) && (state.pathVars[key] !== '')){
        return state.pathVars[key];
    }
    else if(state.f.hasOwnProperty(key)){
        return state.f[key];
    }
    else if(state.q.hasOwnProperty(key)){
        return state.q[key];
    }
    return undefined;
};

Zotero.State.prototype.setUrlVar = function(key, val){
    var state = this;
    state.pathVars[key] = val;
};

Zotero.State.prototype.getUrlVars = function(){
    var state = this;
    var params = J.deparam(J.param.querystring());
    return J.extend(true,{}, state.pathVars, params, J.deparam(J.param.fragment()));
};

Zotero.State.prototype.setFragmentVar = function(key, val){
    var state = this;
    state.f[key] = val;
};

Zotero.State.prototype.setQueryVar = function(key, val){
    var state = this;
    if(val === ''){
        delete state.q[key];
    }
    else{
        state.q[key] = val;
    }
};

Zotero.State.prototype.addQueryVar = function(key, val){
    var state = this;
    if(state.q.hasOwnProperty(key)){
        //property exists
        if(J.isArray(state.q[key])){
            state.q[key].push(val);
        }
        else{
            var newArray = [state.q[key], val];
            state.q[key] = newArray;
        }
    }
    else{
        //no value for that key yet
        state.q[key] = val;
    }
    return state.q[key];
};

Zotero.State.prototype.updateFragment = function(updatedVars){
    var state = this;
    Z.debug("updateFragment", 3);
    J.bbq.pushState(updatedVars, 0);
};

Zotero.State.prototype.popstateCallback = function(evt){
    var state = this;
    Z.debug("===== popstateCallback =====", 3);
    var history = window.history;
    state.prevHref = state.curHref;
    
    Z.debug("new href, updating href and processing urlchange", 3);
    state.curHref = window.location.href;// History.getState().cleanUrl;
    
    //reparse url to set vars in Z.ajax
    state.parseUrlVars();
    state.stateChanged(evt);
};

Zotero.State.prototype.stateChanged = function(event){
    var state = this;
    Z.debug("stateChanged", 3);
    state.savePrevState();
    state.updateCurState();
    //check for changed variables in the url and fire events for them
    Z.debug("Checking changed variables", 3);
    var changedVars = state.diffState(state.prevHref, state.curHref);
    var widgetEvents = {};
    J.each(changedVars, function(ind, val){
        var eventString = val + "Changed";
        Z.debug(eventString, 3);
        //map var events to widget events
        if(Zotero.eventful.eventMap.hasOwnProperty(eventString)){
            J.each(Zotero.eventful.eventMap[eventString], function(ind, val){
                if(!widgetEvents.hasOwnProperty(val)){
                    widgetEvents[val] = 1;
                }
            });
        }
        Z.debug("State Filter: " + state.filter, 3);
        Zotero.trigger(eventString, {}, state.filter);
    });
    //TODO: is this eventMap triggering necessary?
    
    J.each(widgetEvents, function(ind, val){
        Z.debug("State Filter: " + state.filter, 3);
        
        Zotero.trigger(ind, {}, state.filter);
    });
    
    Z.debug("===== stateChanged Done =====", 3);
};

Zotero.State.prototype.diffState = function(prevHref, curHref){
    Z.debug("Zotero.State.diffState", 3);
    var state = this;
    //check what has changed when a new state is pushed
    var prevVars = J.extend({}, state.parsePathVars(prevHref) );
    var curVars = J.extend({}, state.parsePathVars(curHref) );

    var monitoredVars = ['start',
                         'limit',
                         'order',
                         'sort',
                         'content',
                         'format',
                         'q',
                         'fq',
                         'itemType',
                         'itemKey',
                         'collectionKey',
                         'searchKey',
                         'locale',
                         'tag',
                         'tagType',
                         'key',
                         'style',
                         'session',
                         'newer',
                         'since',
                         'itemPage',
                         'mode'
                         ];
    var changedVars = [];
    J.each(monitoredVars, function(ind, val){
        if(prevVars.hasOwnProperty(val) || curVars.hasOwnProperty(val)){
            if(prevVars[val] != curVars[val]){
                changedVars.push(val);
            }
        }
    });
    
    return changedVars;
};

/**
 * Bind tag links to alter current state rather than following the link
 * @return {undefined}
 */
Zotero.State.prototype.bindTagLinks = function(container){
    var state = this;
    Z.debug("Zotero.State.bindTagLinks", 3);
    J(container).on('click', 'a.tag-link', function(e){
        e.preventDefault();
        e.stopImmediatePropagation();
        //J("#tag-filter-input").val('');
        var tagtitle = J(this).attr('data-tagtitle');
        state.toggleTag(tagtitle);
        state.clearUrlVars(['tag', 'collectionKey']);
        state.pushState();
    });

};

/**
 * Bind item links to take alter current state instead of following link
 * @return {undefined}
 */
Zotero.State.prototype.bindItemLinks = function(container){
    Z.debug("Zotero.State.bindItemLinks", 3);
    var state = this;
    
    J(container).on('click', "a.item-select-link", function(e){
        e.preventDefault();
        e.stopImmediatePropagation();
        Z.debug("item-select-link clicked", 3);
        var itemKey = J(this).data('itemkey');
        state.pathVars.itemKey = itemKey;
        state.pushState();
    });
    J(container).on('click', 'td[data-itemkey]:not(.edit-checkbox-td)', function(e){
        e.preventDefault();
        Z.debug("item-select-td clicked", 3);
        var itemKey = J(this).data('itemkey');
        state.pathVars.itemKey = itemKey;
        state.pushState();
    });
};


//return a promise that will resolve after mseconds milliseconds
Zotero.Delay = function(mseconds){
    return new Promise(function(resolve, reject){
        setTimeout(function(){
            resolve();
        }, mseconds);
    });
};


Zotero.widgets = {};
Zotero.eventful = {};

Zotero.eventful.events = [
    "collectionsDirty", //collections have been updated and should be synced
    "tagsChanged", //library.tags has been updated in some way
    "displayedItemsChanged", //filters for items list have changed
    "displayedItemChanged", //item selected for detailed view has changed
    "selectedItemsChanged", //items selected by checkbox for action have changed
    "showCitations", //request to show the citations for currently selected items
    "showSettings", //request to show settings panel
    "exportItems", //request to export currently selected items
    "libraryTagsUpdated",
    "uploadSuccessful",
    "refreshGroups",
    "clearLibraryQuery",
    "libraryItemsUpdated",
    "citeItems",
    "itemTypeChanged",
    "addTag",
    "showChildren",
    "selectCollection",
    "selectedCollectionChanged",
    "libraryCollectionsUpdated",
    "loadItemsDone",
    "collectionsChanged",
    "tagsChanged",
    "itemsChanged",
    "loadedCollectionsProcessed",
    "deleteProgress",
    "settingsLoaded",
    "cachedDataLoaded",
    //eventfultriggers:
    "createItem",
    "newItem",
    "addToCollectionDialog",
    "removeFromCollection",
    "moveToTrash",
    "removeFromTrash",
    "toggleEdit",
    "clearLibraryQuery",
    "librarySettingsDialog",
    "citeItems",
    "exportItemsDialog",
    "syncLibrary",
    "createCollectionDialog",
    "updateCollectionDialog",
    "deleteCollectionDialog",
    "showMoreTags",
    "showFewerTags",
    "indexedDBError",

];

Zotero.eventful.eventMap = {
    "orderChanged":["displayedItemsChanged"],
    "sortChanged":["displayedItemsChanged"],
    "collectionKeyChanged":["displayedItemsChanged", "selectedCollectionChanged"],
    "qChanged":["displayedItemsChanged"],
    "tagChanged":["displayedItemsChanged", "selectedTagsChanged"],
    "itemPageChanged":["displayedItemsChanged"],
    "itemKeyChanged":["displayedItemChanged"]
};

Zotero.eventful.initWidgets = function(){
    Zotero.state.parsePathVars();
    
    J(".eventfulwidget").each(function(ind, el){
        var widgetName = J(el).data("widget");
        if(widgetName && Zotero.ui.widgets[widgetName]){
            if(Zotero.ui.widgets[widgetName]['init']){
                Z.debug("eventfulwidget init: " + widgetName, 3);
                Zotero.ui.widgets[widgetName].init(el);
            }
        }
    });
    
    Zotero.eventful.initTriggers();
    
    //TODO:set up marshalling of url var changes mapped to more specialized events
    //this is currently done in pushstate... possibly belongs here instead?
    
    //trigger events that should happen for widgets on pageload
    //mostly things that cause us to pull from the API or display something
    //for the first time
};

//make html elements that are declared to trigger events trigger them
//this should be called on any elements that are inserted into the DOM
//and once on page load
Zotero.eventful.initTriggers = function(el){
    Zotero.debug("Zotero.eventful.initTriggers", 3);
    if(!el){
        el = J("html");
    }
    //initialize elements that have data-triggers info to trigger that event
    var triggerOnEvent = function(event){
        Z.debug("triggerOnEvent", 3);
        event.preventDefault();
        var jel = J(event.delegateTarget);
        eventName = jel.data("triggers");
        Z.debug("eventName: " + eventName, 3);
        var filter = jel.data('library') || "";
        
        Zotero.trigger(eventName, {triggeringElement:event.currentTarget}, filter);
    };
    
    J(el).find(".eventfultrigger").each(function(ind, el){
        if(J(el).data('triggerbound')){
            return;
        }
        var ev = J(el).data("event");
        
        if(ev){
            Z.debug("binding " + ev + " on " + el.tagName, 3);
            J(el).on(ev, triggerOnEvent);
        }
        else {
            //Z.debug("binding click trigger on " + el.tagName, 3);
            //default to triggering on click
            J(el).on("click", triggerOnEvent);
        }
        J(el).data('triggerbound', true);
    });
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
    var intlOptions = {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: false
    };

    var formatDate;
    if(window.Intl) {
        var dateFormatter = new window.Intl.DateTimeFormat(undefined, intlOptions);
        var formatDate = dateFormatter.format;
    } else {
        formatDate = function(date) {
            return date.toLocaleString()
        }
    }

    var trimLength = 0;
    var formattedString = '';
    var date;
    if(Zotero.config.maxFieldSummaryLength[field]){
        trimLength = Zotero.config.maxFieldSummaryLength[field];
    }
    switch(field){
        case "itemType":
            formattedString = Zotero.localizations.typeMap[item.apiObj.data.itemType];
            break;
        case "dateModified":
            if(!item.apiObj.data['dateModified']){
                formattedString = '';
            }
            date = Zotero.utils.parseApiDate(item.apiObj.data['dateModified']);
            if(date){
                formattedString = formatDate(date);
            }
            else{
                formattedString = item.apiObj.data['dateModified'];
            }
            break;
        case "dateAdded":
            if(!item.apiObj.data['dateAdded']){
                formattedString = '';
            }
            date = Zotero.utils.parseApiDate(item.apiObj.data['dateAdded']);
            if(date){
                formattedString = formatDate(date);
            }
            else{
                formattedString = item.apiObj.data['dateAdded'];
            }
            break;
        case "title":
            formattedString = item.get('title');
            break;
        case "creator":
        case "creatorSummary":
            formattedString = item.get('creatorSummary');
            break;
        case "addedBy":
            if(item.apiObj.meta.createdByUser){
                if(item.apiObj.meta.createdByUser.name != '') {
                    formattedString = item.apiObj.meta.createdByUser.name;
                }
                else {
                    formattedString = item.apiObj.meta.createdByUser.username;
                }
            }
            break;
        case "modifiedBy":
            if(item.apiObj.meta.lastModifiedByUser){
                if(item.apiObj.meta.lastModifiedByUser.name != ''){
                    formattedString = item.apiObj.meta.lastModifiedByUser.name;
                }
                else {
                    formattedString = item.apiObj.meta.lastModifiedByUser.username;
                }
            }
        default:
            if(typeof(item.apiObj.data[field]) !== "undefined"){
                formattedString = item.get(field);
            }
    }
    if(typeof formattedString == 'undefined'){
        Z.error("formattedString for " + field + " undefined");
        Z.error(item);
    }
    if(trim) {
        return Zotero.ui.trimString(formattedString, trimLength);
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
    if(typeof s == 'undefined'){
        Z.error("formattedString passed to trimString was undefined.");
        return '';
    }
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
    var timeOptions = {
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: false
    };
    var intlOptions = {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: false
    };
    
    var formatDate;
    var formatTime;
    if(window.Intl) {
        var dateFormatter = new window.Intl.DateTimeFormat(undefined, intlOptions);
        formatDate = dateFormatter.format;
        var timeFormatter = new window.Intl.DateTimeFormat(undefined, timeOptions);
        formatTime = timeFormatter.format;
    } else {
        formatDate = function(date) {
            return date.toLocaleDateString()
        }
        formatTime = function(date) {
            return date.toLocaleTimeString();
        }
    }

    switch(field){
        case "dateModified":
            if(!item.apiObj.data['dateModified']){
                return '';
            }
            date = Zotero.utils.parseApiDate(item.apiObj.data['dateModified']);
            if(date){
                return "<span class='localized-date-span'>" + formatDate(date); + "</span> <span class='localized-date-span'>" + formatTime(date); + "</span>";
            }
            else{
                return item.apiObj.data['dateModified'];
            }
            return date.toLocaleString();
        case "dateAdded":
            if(!item.apiObj.data['dateAdded']){
                return '';
            }
            date = Zotero.utils.parseApiDate(item.apiObj.data['dateAdded']);
            if(date){
                return "<span class='localized-date-span'>" + formatDate(date); + "</span> <span class='localized-date-span'>" + formatTime(date); + "</span>";
            }
            else{
                return item.apiObj.data['dateAdded'];
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


Zotero.ui.init = {};
Zotero.ui.widgets = {};

//initialize ui
Zotero.ui.init.all = function(){
    //run UI initialization based on what page we're on
    Z.debug("ui init based on page", 3);
    switch(Zotero.config.pageClass){
        case "my_library":
        case "user_library":
        case "group_library":
            Zotero.ui.init.library();
            break;
        case "default":
    }
    Zotero.ui.init.libraryTemplates();
    Zotero.eventful.initWidgets();
    Zotero.ui.init.rte()
};

Zotero.ui.init.library = function(){
    /*
    Z.debug("Zotero.ui.init.library", 3);
    
    //initialize RTE for textareas if marked
    var hasRTENoLinks = J('textarea.rte').filter('.nolinks').length;
    var hasRTEReadOnly = J('textarea.rte').filter('.readonly').length;
    var hasRTEDefault = J('textarea.rte').not('.nolinks').not('.readonly').length;
    if(hasRTENoLinks){
        Zotero.ui.init.rte('nolinks', false, J('body'));
    }
    if(hasRTEReadOnly){
        Zotero.ui.init.rte('readonly', false, J('body'));
    }
    if(hasRTEDefault){
        Zotero.ui.init.rte('default', false, J('body'));
    }
    */
};

Zotero.ui.init.rte = function(type, autofocus, container){
    Z.debug("init.rte", 3);
    if(Zotero.config.rte == 'ckeditor'){
        Zotero.ui.init.ckeditor(type, autofocus, container);
        return;
    }
    else {
        Zotero.ui.init.tinyMce(type, autofocus, container);
    }
};

Zotero.ui.init.ckeditor = function(type, autofocus, container){
    Z.debug('init.ckeditor', 3);
    if(!type) { type = 'default'; }
    if(!container) { container = J('body');}
    
    var ckconfig = {};
    ckconfig.toolbarGroups = [
        { name: 'clipboard',   groups: [ 'clipboard', 'undo' ] },
        //{ name: 'editing',     groups: [ 'find', 'selection' ] },
        { name: 'links' },
        { name: 'insert' },
        { name: 'forms' },
        { name: 'tools' },
        { name: 'document',    groups: [ 'mode', 'document', 'doctools' ] },
        { name: 'others' },
        '/',
        { name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ] },
        { name: 'paragraph',   groups: [ 'list', 'indent', 'blocks', 'align' ] },
        { name: 'styles' },
        { name: 'colors' },
        { name: 'about' }
    ];
    
    var nolinksckconfig = {};
    nolinksckconfig.toolbarGroups = [
        { name: 'clipboard',   groups: [ 'clipboard', 'undo' ] },
        { name: 'editing',     groups: [ 'find', 'selection' ] },
        { name: 'insert' },
        { name: 'forms' },
        { name: 'tools' },
        { name: 'document',    groups: [ 'mode', 'document', 'doctools' ] },
        { name: 'others' },
        '/',
        { name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ] },
        { name: 'paragraph',   groups: [ 'list', 'indent', 'blocks', 'align' ] },
        { name: 'styles' },
        { name: 'colors' },
        { name: 'about' }
    ];
    var readonlyckconfig = {};
    readonlyckconfig.toolbarGroups = [];
    readonlyckconfig.readOnly = true;
    
    var config;
    if(type == 'nolinks'){
        config = J.extend(true, {}, nolinksckconfig);
    }
    else if(type == 'readonly'){
        config = J.extend(true, {}, readonlyckconfig);
    }
    else {
        config = J.extend(true, {}, ckconfig);
    }
    if(autofocus){
        config.startupFocus = true;
    }
    
    Z.debug("initializing CK editors", 3);
    if(J(container).is('.rte')){
        Z.debug("RTE textarea - " + ind + " - " + J(container).attr('name'), 3);
        var edName = J(container).attr('name');
        if(!CKEDITOR.instances[edName]){
            var editor = CKEDITOR.replace(J(container), config );
        }
    }
    else{
        Z.debug("not a direct rte init");
        Z.debug(container);
        J(container).find("textarea.rte").each(function(ind, el){
            Z.debug("RTE textarea - " + ind + " - " + J(el).attr('name'), 3);
            var edName = J(el).attr('name');
            if(!CKEDITOR.instances[edName]){
                var editor = CKEDITOR.replace(el, config );
            }
        });
    }
};

Zotero.ui.init.tinyMce = function(type, autofocus, elements){
    Z.debug('init.tinyMce', 3);
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
            Z.debug("inited " + inst.editorId);
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
            if( ( (J.inArray(field, item.hideFields) == -1) && (item.fieldMap.hasOwnProperty(field))) &&
                (J.inArray(field, ['itemType', 'title', 'creators', 'notes']) == -1)) {
                return true;
            }
            return false;
        },
        nonEditable: function(field, item) {
            if( J.inArray(field, item.noEditFields) !== -1) {
                return true;
            }
        },
    });
    J.views.tags({
        'coloredTags': {
            'template': "{{for ~tag.tagCtx.args[0].matchColoredTags(~tag.tagCtx.args[1]) tmpl='#coloredtagTemplate' /}}"
        }
    });
    /*
    J('#tagrowTemplate').template('tagrowTemplate');
    J('#tagslistTemplate').template('tagslistTemplate');
    J('#collectionlistTemplate').template('collectionlistTemplate');
    J('#collectionrowTemplate').template('collectionrowTemplate');
    J('#itemrowTemplate').template('itemrowTemplate');
    J('#itemstableTemplate').template('itemstableTemplate');
    J('#itemdetailsTemplate').template('itemdetailsTemplate');
    J('#itemnotedetailsTemplate').template('itemnotedetailsTemplate');
    J('#itemformTemplate').template('itemformTemplate');
    J('#citeitemformTemplate').template('citeitemformTemplate');
    J('#attachmentformTemplate').template('attachmentformTemplate');
    J('#attachmentuploadTemplate').template('attachmentuploadTemplate');
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
    */
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
    base.closest('.eventfulwidget').data('ignoreformstorage', true);
    var library = Zotero.ui.getAssociatedLibrary(base);
    
    var itemKey = '';
    if(item.get('key')) itemKey = item.get('key');
    else {
        //new item - associate with library and add to collection if appropriate
        if(library){
            item.associateWithLibrary(library);
        }
        var collectionKey = Zotero.state.getUrlVar('collectionKey');
        if(collectionKey){
            item.addToCollection(collectionKey);
        }
    }
    //update current representation of the item with form values
    J.each(item.apiObj.data, function(field, value){
        var selector, inputValue, noteElID;
        if(field == 'note'){
            selector = "textarea[data-itemkey='" + itemKey + "'].rte";
            Z.debug(selector, 4);
            noteElID = base.find(selector).attr('id');
            Z.debug(noteElID, 4);
            inputValue = Zotero.ui.getRte(noteElID);
        }
        else{
            selector = "[data-itemkey='" + itemKey + "'][name='" + field + "']";
            inputValue = base.find(selector).val();
        }
        
        if(typeof inputValue !== 'undefined'){
            Z.debug("updating item " + field + ": " + inputValue);
            item.set(field, inputValue);
        }
    });
    var creators = [];
    base.find("tr.creator").each(function(index, el){
        var creator = Zotero.ui.creatorFromElement(el);
        if(creator !== null){
            creators.push(creator);
        }
    });
    
    var tags = [];
    base.find("input.taginput").each(function(index, el){
        var tagString = J(el).val();
        if(tagString !== ''){
            tags.push({tag: tagString});
        }
    });
    
    //grab all the notes from the form and add to item
    //in the case of new items we can add notes in the creation request
    //in the case of existing items we need to post notes to /children, but we still
    //have that interface here for consistency
    var notes = [];
    base.find("textarea.note-text").each(function(index, el){
        var noteid = J(el).attr('id');
        var noteContent = Zotero.ui.getRte(noteid);
        
        var noteItem = new Zotero.Item();
        if(library){
            noteItem.associateWithLibrary(library);
        }
        noteItem.initEmptyNote();
        noteItem.set('note', noteContent);
        noteItem.setParent(item.get('key'));
        notes.push(noteItem);
    });
    
    item.notes = notes;
    if(creators.length){
        item.apiObj.data.creators = creators;
    }
    item.apiObj.data.tags = tags;
    item.synced = false;
    item.dirty = true;
    Z.debug(item);
};

Zotero.ui.creatorFromElement = function(el){
    var name, creator, firstName, lastName;
    var jel = J(el);
    var creatorType = jel.find("select.creator-type-select").val();
    if(jel.hasClass('singleCreator')){
        name = jel.find("input.creator-name");
        if(!name.val()){
            //can't submit authors with empty names
            return null;
        }
        creator = {creatorType: creatorType,
                        name: name.val()
                    };
    }
    else if(jel.hasClass('doubleCreator')){
        firstName = jel.find("input.creator-first-name").val();
        lastName = J(el).find("input.creator-last-name").val();
        if((firstName === '') && (lastName === '')){
            return null;
        }
        creator = {creatorType: creatorType,
                        firstName: firstName,
                        lastName: lastName
                        };
    }
    return creator;
};

Zotero.ui.saveItem = function(item) {
    //var requestData = JSON.stringify(item.apiObj);
    Z.debug("pre writeItem debug", 4);
    Z.debug(item, 4);
    //show spinner before making ajax write call
    var library = item.owningLibrary;
    var writeResponse = item.writeItem()
    .then(function(writtenItems){
        Z.debug("item write finished", 3);
        //check for errors, update nav
        if(item.writeFailure){
            Z.error("Error writing item:" + item.writeFailure.message);
            Zotero.ui.jsNotificationMessage('Error writing item', 'error');
            throw new Error("Error writing item:" + item.writeFailure.message);
        }
    });
    
    //update list of tags we have if new ones added
    Z.debug('adding new tags to library tags', 3);
    var libTags = library.tags;
    var tags = item.apiObj.data.tags;
    J.each(tags, function(index, tagOb){
        var tagString = tagOb.tag;
        if(!libTags.tagObjects.hasOwnProperty(tagString)){
            var tag = new Zotero.Tag(tagOb);
            libTags.addTag(tag);
        }
    });
    libTags.updateSecondaryData();

    return writeResponse;
};

/**
 * Temporarily store the data in a form so it can be reloaded
 * @return {undefined}
 */
/*
Zotero.ui.saveFormData = function(){
    Z.debug("saveFormData", 3);
    J(".eventfulwidget").each(function(){
        var formInputs = J(this).find('input');
        J(this).data('tempformstorage', formInputs);
    });
};
*/
/**
 * Reload previously saved form data
 * @param  {Dom Element} el DOM Form to restore data to
 * @return {undefined}
 */
/*
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
*/
/**
 * Get the class for an itemType to display an appropriate icon
 * @param  {Zotero_Item} item Zotero item to get the class for
 * @return {string}
 */
Zotero.ui.itemTypeClass = function(item) {
    var itemTypeClass = item.apiObj.data.itemType;
    if (item.apiObj.data.itemType == 'attachment') {
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
 * Get the Zotero Library associated with an element (generally a .eventfulwidget element)
 * @param  {Dom Element} el Dom element
 * @return {Zotero_Library}
 */
Zotero.ui.getAssociatedLibrary = function(el){
    Z.debug("Zotero.ui.getAssociatedLibrary", 3);
    var jel;
    if(typeof el == 'undefined'){
        jel = J(".zotero-library").first();
    }
    else {
        jel = J(el);
        if(jel.length === 0 || jel.is("#eventful") ){
            jel = J(".zotero-library").first();
            if(jel.length === 0){
                Z.debug("No element passed and no default found for getAssociatedLibrary.");
                throw new Error("No element passed and no default found for getAssociatedLibrary.");
            }
        }
    }
    //get Zotero.Library object if already bound to element
    var library = jel.data('zoterolibrary');
    if(!library){
        //try getting it from a libraryString included on DOM element
        var libString = J(el).data('library');
        if(libString){
            library = Zotero.ui.libStringLibrary(libString);
        }
        jel.data('zoterolibrary', library);
    }
    //if we still don't have a library, look for the default library for the page
    if(!library){
        jel = J(".zotero-library").first();
        var libString = jel.data('library');
        if(libString){
            library = Zotero.ui.libStringLibrary(libString);
        }
    }
    if(!library){Z.error("No associated library found");}
    return library;
};

Zotero.ui.libStringLibrary = function(libString){
    var library;
    if(Zotero.libraries.hasOwnProperty(libString)){
        library = Zotero.libraries[libString];
    }
    else{
        var libConfig = Zotero.utils.parseLibString(libString);
        library = new Zotero.Library(libConfig.libraryType, libConfig.libraryID);
        Zotero.libraries[libString] = library;
    }
    return library;
};

Zotero.ui.getEventLibrary = function(e){
    var tel = J(e.triggeringElement);
    if(e.library){
        return e.library;
    }
    if(e.data && e.data.library){
        return e.data.library;
    }
    Z.debug(e);
    var libString = tel.data('library');
    if(!libString){
        throw "no library on event or libString on triggeringElement";
    }
    if(Zotero.libraries.hasOwnProperty(libString)){
        return Zotero.libraries[libString];
    }
    
    var libConfig = Zotero.ui.parseLibString(libString);
    library = new Zotero.Library(libConfig.libraryType, libConfig.libraryID, '');
    Zotero.libraries[Zotero.utils.libraryString(libraryType, libraryID)] = library;
};
/*
Zotero.ui.parseLibString = function(s){
    var libraryType, libraryID;
    if(s[0] == "u"){
        libraryType = "user";
    }
    else {
        libraryType = "group";
    }
    libraryID = s.slice(1);
    return {libraryType:libraryType, libraryID:libraryID};
};
*/
/**
 * Get the highest priority variable named key set from various configs
 * @param  {[type]} key [description]
 * @return {[type]}     [description]
 */
Zotero.ui.getPrioritizedVariable = function(key, defaultVal){
    var val = Zotero.state.getUrlVar(key) || Zotero.preferences.getPref(key) || Zotero.config.defaultApiArgs[key] || defaultVal;
    return val;
};

/**
 * Scroll to the top of the window
 * @return {undefined}
 */
Zotero.ui.scrollToTop = function(){
    window.scrollBy(0, -5000);
};

//get the nearest ancestor that is eventfulwidget
Zotero.ui.parentWidgetEl = function(el){
    var matching;
    if(el.hasOwnProperty('data') && el.data.hasOwnProperty('widgetEl')){
        Z.debug("event had widgetEl associated with it");
        return J(el.data.widgetEl);
    } else if(el.hasOwnProperty('currentTarget')){
        Z.debug("event currentTarget set");
        matching = J(el.currentTarget).closest(".eventfulwidget");
        if(matching.length > 0){
            return matching.first();
        } else {
            Z.debug("no matching closest to currentTarget");
            Z.debug(el.currentTarget);
            Z.debug(el.currentTarget);
        }
    }
    
    matching = J(el).closest(".eventfulwidget");
    if(matching.length > 0){
        Z.debug("returning first closest widget");
        return matching.first();
    }
    return null;
};



/**
 * get a list of the itemKeys for items checked off in a form to know what items to operate on
 * if a single item is being displayed the form selections will be overridden
 * otherwise this function returns the data-itemkey values associated with input.itemKey-checkbox:checked
 * @param  {DOM element} container Container DOM Element to pull itemkey values from
 * @return {array}
 */
Zotero.ui.getSelectedItemKeys = function(container){
    Z.debug("Zotero.ui.getSelectedItemKeys", 3);
    if(!container){
        container = J("body");
    }
    else {
        container = J(container);
    }
    var itemKeys = [];
    var curItemKey = Zotero.state.getUrlVar('itemKey');
    if(curItemKey && (Zotero.config.preferUrlItem !== false) ){
        itemKeys.push(curItemKey);
    }
    else{
        container.find("input.itemKey-checkbox:checked").each(function(index, val){
            itemKeys.push(J(val).data('itemkey'));
        });
    }
    return itemKeys;
};

Zotero.ui.getAllFormItemKeys = function(container){
    Z.debug("Zotero.ui.getAllFormItemKeys", 3);
    if(!container){
        container = J("body");
    }
    else {
        container = J(container);
    }
    var itemKeys = [];
    var curItemKey = Zotero.state.getUrlVar('itemKey');
    container.find("input.itemKey-checkbox").each(function(index, val){
        itemKeys.push(J(val).data('itemkey'));
    });
    return itemKeys;
};

Zotero.ui.getRte = function(el){
    Z.debug("getRte", 3);
    Z.debug("getRte", 3);
    Z.debug(el);
    switch(Zotero.config.rte){
        case "ckeditor":
            //var elid = "#" + el;
            //var edname = J(elid).attr('id');
            //Z.debug("EdName: " + edname, 3);
            return CKEDITOR.instances[el].getData();
        default:
            return tinyMCE.get(el).getContent();
    }
};

Zotero.ui.updateRte = function(el){
    Z.debug("updateRte", 3);
    switch(Zotero.config.rte){
        case "ckeditor":
            var elid = "#" + el;
            data = CKEDITOR.instances[el].getData();
            J(elid).val(data);
            break;
        default:
            tinyMCE.updateContent(el);
    }
};

Zotero.ui.deactivateRte = function(el){
    Z.debug("deactivateRte", 3);
    switch(Zotero.config.rte){
        case "ckeditor":
            //var elid = "#" + el;
            if(CKEDITOR.instances[el]){
                Z.debug("deactivating " + el, 3);
                data = CKEDITOR.instances[el].destroy();
            }
            break;
        default:
            tinymce.execCommand('mceRemoveControl', true, el);
    }
};

Zotero.ui.cleanUpRte = function(container){
    Z.debug("cleanUpRte", 3);
    J(container).find("textarea.rte").each(function(ind, el){
        Zotero.ui.deactivateRte(J(el).attr('name') );
    });
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
    
    if(!timeout && (timeout !== false)){
        timeout = 5;
    }
    var alertType = "alert-info";
    if(type){
        switch(type){
            case 'error':
            case 'danger':
                alertType = 'alert-danger';
                timeout = false;
                break;
            case 'success':
            case 'confirm':
                alertType = 'alert-success';
                break;
            case 'info':
                alertType = 'alert-info';
                break;
            case 'warning':
            case 'warn':
                alertType = 'alert-warning';
                break;
        }
    }
    
    if(timeout){
        J("#js-message").append("<div class='alert alert-dismissable " + alertType + "'><button type='button' class='close' data-dismiss='alert'><span aria-hidden='true'>&times;</span><span class='sr-only'>Close</span></button>" + message + "</div>").children("div").delay(parseInt(timeout, 10) * 1000).slideUp().delay(300).queue(function(){
            J(this).remove();
        });
    } else {
        J("#js-message").append("<div class='alert alert-dismissable " + alertType + "'><button type='button' class='close' data-dismiss='alert'><span aria-hidden='true'>&times;</span><span class='sr-only'>Close</span></button>" + message + "</div>");
    }
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
            if(Zotero.config.loggedIn || Zotero.config.ignoreLoggedInStatus){
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
 * Empty conatiner and show preloader spinner
 * @param  {Dom Element} el   container
 * @param  {string} type type of preloader to show
 * @return {undefined}
 */
Zotero.ui.showSpinner = function(el, type){
    var spinnerUrl = Zotero.config.baseWebsiteUrl + '/static/images/theme/broken-circle-spinner.gif';
    if(!type){
        J(el).html("<img class='spinner' src='" + spinnerUrl + "'/>");
    }
    else if(type == 'horizontal'){
        J(el).html("<img class='spinner' src='" + spinnerUrl + "'/>");
    }
};

/**
 * Append a preloader spinner to an element
 * @param  {Dom Element} el container
 * @return {undefined}
 */
Zotero.ui.appendSpinner = function(el){
    var spinnerUrl = Zotero.config.baseWebsiteUrl + 'static/images/theme/broken-circle-spinner.gif';
    J(el).append("<img class='spinner' src='" + spinnerUrl + "'/>");
};

//Take a table that is present in the DOM, save the widths of the headers and the offset of the body,
//set the widths of the columns explicitly, set the header to position:fixed, set the offset of the body explictly
//this has the effect of fixed table headers with scrollable data
Zotero.ui.fixTableHeaders = function(tableEl) {
    var tel = J(tableEl);
    var colWidths = [];
    tel.find("thead th").each(function(ind, th){
        var width = J(th).width();
        colWidths.push(width);
        J(th).width(width);
    });

    tel.find("tbody>tr:first>td").each(function(ind, td){
        J(td).width(colWidths[ind]);
    });

    var bodyOffset = tel.find("thead").height();

    tel.find("thead").css('position', 'fixed').css('margin-top', -bodyOffset).css('background-color', 'white').css('z-index', 10);
    tel.find("tbody").css('margin-top', bodyOffset);
    tel.css("margin-top", bodyOffset);

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



//Bootstrap version
Zotero.ui.dialog = function(el, options){
    Z.debug("Zotero.ui.dialog", 3);
    options.show = true;
    options.backdrop = false;
    J(el).modal(options);
    J(el).modal('show');
    Z.debug("exiting Zotero.ui.dialog", 3);
};

Zotero.ui.closeDialog = function(el){
    J(el).modal('hide');
};



Zotero.ui.widgets.addToCollectionDialog = {};

Zotero.ui.widgets.addToCollectionDialog.init = function(el){
    Z.debug("addtocollectionsdialog widget init", 3);
    var library = Zotero.ui.getAssociatedLibrary(el);
    
    library.listen("addToCollectionDialog", Zotero.ui.widgets.addToCollectionDialog.show, {widgetEl: el});
};

Zotero.ui.widgets.addToCollectionDialog.show = function(evt){
    Z.debug("addToCollectionDialog.show", 3);
    
    var triggeringEl = J(evt.triggeringElement);
    var library = Zotero.ui.getAssociatedLibrary(triggeringEl);
    var ncollections = library.collections.nestedOrderingArray();
    
    var widgetEl = J(evt.data.widgetEl).empty();
    Z.debug("ncollections:");
    Z.debug(ncollections);
    widgetEl.html( J("#addtocollectiondialogTemplate").render({ncollections:ncollections}) );
    var dialogEl = widgetEl.find(".add-to-collection-dialog");
    
    var addToFunction = function(){
        Z.debug("addToCollection callback", 3);
        var targetCollection = dialogEl.find(".collectionKey-select").val();
        Z.debug("move to: " + targetCollection, 4);
        Zotero.ui.addToCollection(targetCollection, library);
        Zotero.ui.closeDialog(dialogEl);
        return false;
    };
    
    dialogEl.find(".addButton").on('click', addToFunction);
    
    Zotero.ui.dialog(dialogEl, {});
    return false;
};

/**
 * Add selected items to collection
 * @param {string} collectionKey collectionKey of collection items will be added to
 * @param {Zotero_Library} library       Zotero library to operate on
 */
Zotero.ui.addToCollection = function(collectionKey, library){
    Z.debug("add-to-collection clicked", 3);
    var itemKeys = Zotero.state.getSelectedItemKeys();
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
    library.collections.getCollection(collectionKey).addItems(itemKeys)
    .then(function(response){
        library.dirty = true;
        Zotero.ui.jsNotificationMessage("Items added to collection", 'success');
    }).catch(Zotero.catchPromiseError);
    return false;
};


Zotero.ui.widgets.breadcrumbs = {};

Zotero.ui.widgets.breadcrumbs.init = function(el){
    var library = Zotero.ui.getAssociatedLibrary(el);
    library.listen("displayedItemsChanged displayedItemChanged selectedCollectionChanged", Zotero.ui.libraryBreadcrumbs);
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
    var breadcrumbs = [];
    if(!library){
        library = Zotero.ui.getAssociatedLibrary(J("#feed-link-div"));
    }
    if(!config){
        config = Zotero.state.getUrlVars();
    }
    
    if(Zotero.config.breadcrumbsBase){
        J.each(Zotero.config.breadcrumbsBase, function(ind, crumb){
            breadcrumbs.push(crumb);
        });
    }
    else if(library.libraryType == 'user'){
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
        curCollection = library.collections.getCollection(config.collectionKey);
        if( curCollection ){
            breadcrumbs.push({label:curCollection.get('name'), path:Zotero.state.buildUrl({collectionKey:config.collectionKey})});
        }
    }
    if(config.itemKey){
        Z.debug("have itemKey", 4);
        breadcrumbs.push({label:library.items.getItem(config.itemKey).title, path:Zotero.state.buildUrl({collectionKey:config.collectionKey, itemKey:config.itemKey})});
    }
    Z.debug(breadcrumbs, 4);
    widgetEl = J("#breadcrumbs").empty();
    widgetEl.html( J('#breadcrumbsTemplate').render({breadcrumbs:breadcrumbs}) );
    var newtitle = J('#breadcrumbstitleTemplate', {breadcrumbs:breadcrumbs}).text();
    if(newtitle){
        Zotero.state.updateStateTitle(newtitle);
    }
    Z.debug("done with breadcrumbs", 4);
    }
    catch(e){
        Zotero.error("Error loading breadcrumbs");
        Zotero.error(e);
    }
};



Zotero.ui.widgets.chooseLibraryDialog = {};

Zotero.ui.widgets.chooseLibraryDialog.init = function(el){
    Z.debug("chooselibrarydialog widget init", 3);
    var library = Zotero.ui.getAssociatedLibrary(el);
    
    library.listen("chooseLibrary", Zotero.ui.widgets.chooseLibraryDialog.show, {widgetEl: el});
};

Zotero.ui.widgets.chooseLibraryDialog.show = function(e){
    Z.debug("chooseLibraryDialog.show", 3);
    
    var triggeringEl = J(e.triggeringElement);
    var library = Zotero.ui.getAssociatedLibrary(triggeringEl);
    var ncollections = library.collections.nestedOrderingArray();
    
    var widgetEl = J(e.data['widgetEl']).empty();
    widgetEl( J("#addtocollectiondialogTemplate").render({ncollections:ncollections}) );
    var dialogEl = widgetEl.find(".add-to-collection-dialog");
    
    var addToFunction = J.proxy(function(){
        Z.debug("add-to-collection-select changed", 3);
        var targetCollection = dialogEl.find(".target-collection").val();
        Z.debug("move to: " + targetCollection, 4);
        Zotero.ui.addToCollection(targetCollection, library);
        Zotero.ui.closeDialog(dialogEl);
        return false;
    }, this);
    
    dialogEl.find(".addButton").on('click', addToFunction);
    
    Zotero.ui.dialog(dialogEl, {});
    return false;
};

Zotero.ui.widgets.chooseLibraryDialog.getAccessibleLibraries = function() {
    //TODO: everything
    //just need to fetch userGroups for key, and see if there is write access
};



Zotero.ui.widgets.citeItemDialog = {};

Zotero.ui.widgets.citeItemDialog.init = function(el){
    Z.debug("citeItemDialog widget init", 3);
    var library = Zotero.ui.getAssociatedLibrary(el);
    
    Zotero.ui.widgets.citeItemDialog.getAvailableStyles();
    library.listen("citeItems", Zotero.ui.widgets.citeItemDialog.show, {widgetEl: el});
};

Zotero.ui.widgets.citeItemDialog.show = function(evt){
    Z.debug("citeItemDialog.show", 3);
    var triggeringEl = J(evt.triggeringElement);
    var hasIndependentItems = false;
    var cslItems = [];
    var library;
    
    //check if event is carrying item data with it
    if(evt.hasOwnProperty("zoteroItems")){
        hasIndependentItems = true;
        J.each(evt.zoteroItems, function(ind, item){
            var cslItem = item.cslItem();
            cslItems.push(cslItem);
        });
    }
    else {
        library = Zotero.ui.getAssociatedLibrary(triggeringEl);
    }
    
    var widgetEl = J(evt.data.widgetEl).empty();
    widgetEl.html( J("#citeitemdialogTemplate").render({freeStyleInput:true}) );
    var dialogEl = widgetEl.find(".cite-item-dialog");
    
    var citeFunction = function(e){
        Z.debug("citeFunction", 3);
        //Zotero.ui.showSpinner(dialogEl.find(".cite-box-div"));
        var triggeringElement = J(evt.currentTarget);
        var style = '';
        if(triggeringElement.is(".cite-item-select, input.free-text-style-input")){
            style = triggeringElement.val();
        }
        else{
            style = dialogEl.find(".cite-item-select").val();
            var freeStyle = dialogEl.find("input.free-text-style-input").val();
            if(J.inArray(freeStyle, Zotero.styleList) !== -1){
                style = freeStyle;
            }
        }
        
        if(!hasIndependentItems){
            //get the selected item keys from the items widget
            var itemKeys = Zotero.state.getSelectedItemKeys();
            if(itemKeys.length === 0){
                itemKeys = Zotero.state.getSelectedItemKeys();
            }
            Z.debug(itemKeys, 4);
            library.loadFullBib(itemKeys, style)
            .then(function(bibContent){
                dialogEl.find(".cite-box-div").html(bibContent);
            }).catch(Zotero.catchPromiseError);
        }
        else {
            Zotero.ui.widgets.citeItemDialog.directCite(cslItems, style)
            .then(function(bibContent){
                dialogEl.find(".cite-box-div").html(bibContent);
            }).catch(Zotero.catchPromiseError);
            /*.then(function(response){
                var bib = JSON.parse(response.data);
                var bibString = Zotero.ui.widgets.citeItemDialog.buildBibString(bib);
                dialogEl.find(".cite-box-div").html(bibString);
            });*/
        }
    };
    
    dialogEl.find(".cite-item-select").on('change', citeFunction);
    dialogEl.find("input.free-text-style-input").on('change', citeFunction);
    
    Zotero.ui.widgets.citeItemDialog.getAvailableStyles();
    dialogEl.find("input.free-text-style-input").typeahead({local:Zotero.styleList, limit:10});
    
    Zotero.ui.dialog(dialogEl, {});
    
    return false;
};

Zotero.ui.widgets.citeItemDialog.getAvailableStyles = function(){
    if(!Zotero.styleList){
        Zotero.styleList = [];
        J.getJSON(Zotero.config.styleListUrl, function(data){
            Zotero.styleList = data;
        });
    }
};

Zotero.ui.widgets.citeItemDialog.directCite = function(cslItems, style){
    var data = {};
    data.items = cslItems;
    var url = Zotero.config.citationEndpoint + '?linkwrap=1&style=' + style;
    return J.post(url, JSON.stringify(data) );
};

Zotero.ui.widgets.citeItemDialog.buildBibString = function(bib){
    var bibMeta = bib.bibliography[0];
    var bibEntries = bib.bibliography[1];
    var bibString = bibMeta.bibstart;
    for(var i = 0; i < bibEntries.length; i++){
        bibString += bibEntries[i];
    }
    bibString += bibMeta.bibend;
    return bibString;
};

Zotero.ui.widgets.collections = {};

Zotero.ui.widgets.collections.init = function(el){
    Z.debug("collections widget init", 3);
    var library = Zotero.ui.getAssociatedLibrary(el);
    
    library.listen("collectionsDirty", Zotero.ui.widgets.collections.syncCollections, {widgetEl: el});
    library.listen("syncCollections", Zotero.ui.widgets.collections.syncCollections, {widgetEl: el});
    library.listen("syncLibrary", Zotero.ui.widgets.collections.syncCollections, {widgetEl: el});
    library.listen("cachedDataLoaded", Zotero.ui.widgets.collections.syncCollections, {widgetEl: el});
    
    library.listen("libraryCollectionsUpdated", Zotero.ui.widgets.collections.rerenderCollections, {widgetEl: el});
    library.listen("selectCollection", Zotero.ui.widgets.collections.selectCollection, {widgetEl: el});
    library.listen("selectedCollectionChanged", Zotero.ui.widgets.collections.updateSelectedCollection, {widgetEl: el});
    
    Zotero.ui.widgets.collections.bindCollectionLinks(el);
};

Zotero.ui.widgets.collections.syncCollections = function(evt) {
    Zotero.debug("Zotero eventful syncCollectionsCallback", 3);
    var widgetEl = J(evt.data.widgetEl);
    Zotero.ui.showSpinner(J(widgetEl).find("#collection-list-container") );
    var loadingPromise = widgetEl.data('loadingPromise');
    if(loadingPromise){
        var p = widgetEl.data('loadingPromise');
        return p.then(function(){
            return Zotero.ui.widgets.collections.syncCollections(evt);
        });
    }
    
    //get Zotero.Library object if already bound to element
    var library = Zotero.ui.getAssociatedLibrary(widgetEl);
    
    //sync collections if loaded from cache but not synced
    return library.loadUpdatedCollections()
    .then(function(){
        library.trigger("libraryCollectionsUpdated");
    },
    function(err){
        //sync failed, but we already had some data, so show that
        Z.error("Error syncing collections");
        Z.error(err);
        library.trigger("libraryCollectionsUpdated");
        Zotero.ui.jsNotificationMessage("Error loading collections. Collections list may not be up to date", 'error');
    }).then(function(){
        widgetEl.removeData('loadingPromise');
    });
};


Zotero.ui.widgets.collections.rerenderCollections = function(evt){
    Zotero.debug("Zotero.ui.widgets.collections.rerenderCollections", 3);
    var widgetEl = J(evt.data.widgetEl);
    
    var library = Zotero.ui.getAssociatedLibrary(widgetEl);
    var collectionListEl = widgetEl.find('#collection-list-container');
    collectionListEl.empty();
    Zotero.ui.widgets.collections.renderCollectionList(collectionListEl, library.collections);
    Z.debug("done rendering collections");
    library.trigger("selectedCollectionChanged");
};

Zotero.ui.widgets.collections.selectCollection = function(evt){
    
};

Zotero.ui.widgets.collections.updateSelectedCollection = function(evt){
    Zotero.debug("Zotero eventful updateSelectedCollection", 3);
    var widgetEl = J(evt.data.widgetEl);
    var collectionListEl = widgetEl.find('.collection-list-container');
    
    Zotero.ui.widgets.collections.highlightCurrentCollection(widgetEl);
    Zotero.ui.widgets.collections.nestHideCollectionTree(collectionListEl);
    Zotero.ui.widgets.collections.updateCollectionButtons(widgetEl);
    return;
};

Zotero.ui.widgets.collections.updateCollectionButtons = function(el){
    if(!el){
        el = J("body");
    }
    var jel = J(el);
    
    //disable everything if we're not allowed to edit the library
    if(!Zotero.config.librarySettings.allowEdit){
        J(".permission-edit").hide();
        jel.find(".create-collection-button").addClass('disabled');
        jel.find(".update-collection-button").addClass('disabled');
        jel.find(".delete-collection-button").addClass('disabled');
        return;
    }
    //enable modify and delete only if collection is selected
    if(Zotero.state.getUrlVar("collectionKey")){
        jel.find(".update-collection-button").removeClass('disabled');
        jel.find(".delete-collection-button").removeClass('disabled');
    }
    else{
        jel.find(".update-collection-button").addClass('disabled');
        jel.find(".delete-collection-button").addClass('disabled');
    }
};

//generate the full html for the nested collections list
/**
 * generate the full html for the nested collections list
 * @param  {Dom Element} el          Element to display collections in
 * @param  {Zotero_Collections} collections Zotero_Collections to display
 * @return {undefined}
 */
Zotero.ui.widgets.collections.renderCollectionList = function(el, collections){
    Z.debug("Zotero.ui.renderCollectionList", 3);
    var widgetEl = J(el);
    var currentCollectionKey = Zotero.state.getUrlVar('collectionKey') || '';
    var trash = collections.owningLibrary.libraryType == 'user' ? true : false;
    //var ncollections = collections.nestedOrderingArray();
    widgetEl.append( J('#collectionlistTemplate').render({collections:collections.collectionsArray,
                                        libUrlIdentifier:collections.libraryUrlIdentifier,
                                        currentCollectionKey: currentCollectionKey,
                                        trash: trash
                                        //ncollections: ncollections
                                    }
                                    ) );
    
};


/**
 * Bind collection links to take appropriate action instead of following link
 * @return {boolean}
 */
Zotero.ui.widgets.collections.bindCollectionLinks = function(container){
    Z.debug("Zotero.ui.bindCollectionLinks", 3);
    var library = Zotero.ui.getAssociatedLibrary(container);
    
    J(container).on('click', "div.folder-toggle", function(e){
        e.preventDefault();
        J(this).siblings('.collection-select-link').click();
        return false;
    });
    
    J(container).on('click', ".collection-select-link", function(e){
        Z.debug("collection-select-link clicked", 4);
        e.preventDefault();
        var collectionKey = J(this).attr('data-collectionkey');
        //if this is the currently selected collection, treat as expando link
        if(J(this).hasClass('current-collection')) {
            var expanded = J('.current-collection').data('expanded');
            if(expanded === true){
                Zotero.ui.widgets.collections.nestHideCollectionTree(J("#collection-list-container"), false);
            }
            else{
                Zotero.ui.widgets.collections.nestHideCollectionTree(J("#collection-list-container"), true);
            }
            
            //go back to items list
            Zotero.state.clearUrlVars(['collectionKey', 'mode']);
            
            //cancel action for expando link behaviour
            return false;
        }
        library.trigger("selectCollection", {collectionKey: collectionKey});
        
        //Not currently selected collection
        Z.debug("click " + collectionKey, 4);
        Zotero.state.clearUrlVars(['mode']);
        Zotero.state.pathVars['collectionKey'] = collectionKey;
        
        Zotero.state.pushState();
        return false;
    });
    
    J(container).on('click', "a.my-library", function(e){
        e.preventDefault();
        Zotero.state.clearUrlVars(['mode']);
        Zotero.state.pushState();
        return false;
    });
};

//FROM UPDATESTATE.JS
//Rendering Code

/**
 * Nest the collection tree and hide/show appropriate nodes
 * @param  {Dom Element} el             Container element
 * @param  {boolean} expandSelected Show or hide the currently selected collection
 * @return {undefined}
 */
Zotero.ui.widgets.collections.nestHideCollectionTree = function(el, expandSelected){
    Z.debug("nestHideCollectionTree", 3);
    if(typeof expandSelected == 'undefined'){
        expandSelected = true;
    }
    //nest and hide collection tree
    var jel = J(el);
    jel.find("#collection-list ul").hide().siblings(".folder-toggle")
                                        .children(".placeholder")
                                        .addClass('glyphicon')
                                        .addClass("glyphicon-chevron-right");
    jel.find(".current-collection").parents("ul").show();
    jel.find("#collection-list li.current-collection").children('ul').show();
    //start all twisties in closed position
    jel.find(".glyphicon-chevron-down").removeClass("glyphicon-chevron-down").addClass("glyphicon-chevron-right");
    //show opened twisties as expanded
    jel.find("li.current-collection").parentsUntil("#collection-list").children('div.folder-toggle').find(".glyphicon-chevron-right")
                                                .removeClass("glyphicon-chevron-right")
                                                .addClass("glyphicon-chevron-down");
    
    
    if(expandSelected === false){
        jel.find("#collection-list li.current-collection").children('ul').hide();
        jel.find("#collection-list li.current-collection").find(".glyphicon-chevron-down")
                                                    .removeClass("glyphicon-chevron-down")
                                                    .addClass("glyphicon-chevron-right");
        jel.find(".current-collection").data('expanded', false);
    }
    else{
        jel.find("li.current-collection").children('div.folder-toggle').find(".glyphicon-chevron-right")
                                                .removeClass("glyphicon-chevron-right")
                                                .addClass("glyphicon-chevron-down");
                                                
        jel.find(".current-collection").data('expanded', true);
    }
};

/**
 * Highlight the currently selected collection
 * @return {undefined}
 */
Zotero.ui.widgets.collections.highlightCurrentCollection = function(widgetEl){
    Z.debug("Zotero.ui.widgets.collections.highlightCurrentCollection", 3);
    if(!widgetEl){
        widgetEl = J("body");
    }
    var widgetEl = J(widgetEl);
    var collectionKey = Zotero.state.getUrlVar('collectionKey');
    //unhighlight currently highlighted
    widgetEl.find("a.current-collection").closest("li").removeClass("current-collection");
    widgetEl.find("a.current-collection").removeClass("current-collection");
    
    if(collectionKey){
        //has collection selected, highlight it
        widgetEl.find("a[data-collectionKey='" + collectionKey + "']").addClass("current-collection");
        widgetEl.find("a[data-collectionKey='" + collectionKey + "']").closest('li').addClass("current-collection");
    }
    else{
        widgetEl.find("a.my-library").addClass("current-collection");
        widgetEl.find("a.my-library").closest('li').addClass("current-collection");
    }
};



Zotero.ui.widgets.controlPanel = {};

Zotero.ui.widgets.controlPanel.init = function(el){
    Z.debug("Zotero.eventful.init.controlPanel", 3);
    var library = Zotero.ui.getAssociatedLibrary(el);
    
    Zotero.ui.showControlPanel(el);
    //library.listen("controlPanelContextChange", Zotero.ui.widgets.controlPanel.contextChanged, {widgetEl:el});
    library.listen("selectedItemsChanged", Zotero.ui.widgets.controlPanel.selectedItemsChanged, {widgetEl:el});
    library.listen("selectedCollectionChanged", Zotero.ui.widgets.controlPanel.selectedItemsChanged, {widgetEl:el});
    
    library.listen("removeFromCollection", Zotero.ui.widgets.controlPanel.removeFromCollection, {widgetEl:el});
    library.listen("moveToTrash", Zotero.ui.widgets.controlPanel.moveToTrash), {widgetEl:el};
    library.listen("removeFromTrash", Zotero.ui.widgets.controlPanel.removeFromTrash, {widgetEl:el});
    library.listen("toggleEdit", Zotero.ui.widgets.controlPanel.toggleEdit, {widgetEl:el});
    
    var container = J(el);
    
    Zotero.ui.widgets.controlPanel.updateDisabledControlButtons();
    //start edit button in correct state
    if(Zotero.state.getUrlVar('mode') == 'edit'){
        container.find('button.toggle-edit-button').addClass('active');
    }
};

Zotero.ui.widgets.controlPanel.contextChanged = function(evt){
    Zotero.ui.widgets.controlPanel.updateDisabledControlButtons();
};

Zotero.ui.widgets.controlPanel.selectedItemsChanged = function(evt){
    Z.debug("Zotero.ui.widgets.controlPanel.selectedItemsChanged", 3);
    var selectedItemKeys = evt.selectedItemKeys;
    if(!selectedItemKeys){
        selectedItemKeys = [];
    }
    
    Zotero.ui.widgets.controlPanel.updateDisabledControlButtons(selectedItemKeys);
};

/**
 * Update the disabled state of library control toolbar buttons depending on context
 * @return {undefined}
 */
Zotero.ui.widgets.controlPanel.updateDisabledControlButtons = function(selectedItemKeys){
    Z.debug("Zotero.ui.widgets.controlPanel.updateDisabledControlButtons", 3);
    if(!selectedItemKeys){
        selectedItemKeys = [];
    }
    
    //start with all menu items showing and enabled
    J("ul.actions-menu li").show().removeClass("disabled");
    J(".create-item-button").removeClass('disabled');
    
    if((selectedItemKeys.length === 0) && (!Zotero.state.getUrlVar('itemKey')) ){
        //then there are 0 items selected by checkbox and no item details are being displayed
        //hide from the menu actions that require an item to operate on
        J(".selected-item-action").hide();
        /*
        J(".add-to-collection-button").closest('li').hide();
        J(".remove-from-collection-button").closest('li').hide();
        J(".move-to-trash-button").closest('li').hide();
        J(".remove-from-trash-button").closest('li').hide();
        J(".permanently-delete-button").closest('li').hide();
        */
        //J(".cite-button").addClass('disabled');
        //J(".export-button").addClass('disabled'); //TODO: should this really be disabled? not just export everything?
    }
    else{
        //something is selected for actions to apply to
        //switch what is shown based on the selected collection
        /*
        if(Zotero.state.getUrlVar('collectionKey') == 'trash'){
            J(".move-to-trash-button").closest('li').hide();
        } else {
            J(".move-to-trash-button").closest('li').hide();
        }
        */
        //J(".cite-button").closest('li').removeClass('disabled');
        //J(".export-button").closest('li').removeClass('disabled');
    }
    
    //only show remove from collection button if inside a collection
    if(!Zotero.state.getUrlVar("collectionKey")){
        J(".selected-collection-action").hide();
        /*
        J(".remove-from-collection-button").closest('li').hide();
        */
    }
    //disable create item button if in trash
    if(Zotero.state.getUrlVar('collectionKey') == 'trash'){
        J(".selected-collection-action").hide();
        J(".move-to-trash-button").hide();
        J(".create-item-button").addClass('disabled');
        /*
        J(".add-to-collection-button").closest('li').addClass('disabled');
        J(".remove-from-collection-button").closest('li').addClass('disabled');
        */
    }
    if(Zotero.state.getUrlVar('collectionKey') != 'trash') {
        //hide trash specific actions
        J(".permanently-delete-button").closest('li').hide();
        J(".remove-from-trash-button").closest('li').hide();
    }
};

/**
 * Toggle library edit mode when edit button clicked
 * @param  {event} e click event
 * @return {boolean}
 */
Zotero.ui.widgets.controlPanel.toggleEdit =  function(e){
    Z.debug("edit checkbox toggled", 3);
    var curMode = Zotero.state.getUrlVar('mode');
    if(curMode != "edit"){
        Zotero.state.pathVars['mode'] = 'edit';
    }
    else{
        delete Zotero.state.pathVars['mode'];
    }
    Zotero.state.pushState();
    return false;
};

/**
 * clear path vars and send to new item page with current collection when create-item-link clicked
 * @param  {event} e click event
 * @return {boolean}
 */
Zotero.ui.widgets.controlPanel.createItem = function(e){
    Z.debug("create-item-Link clicked", 3);
    var collectionKey = Zotero.state.getUrlVar('collectionKey');
    if(collectionKey){
        Zotero.state.pathVars = {action:'newItem', mode:'edit', 'collectionKey':collectionKey};
    }
    else{
        Zotero.state.pathVars = {action:'newItem', mode:'edit'};
    }
    Zotero.state.pushState();
    return false;
};

/**
 * Move currently displayed single item or currently checked list of items
 * to the trash when move-to-trash link clicked
 * @param  {event} e click event
 * @return {boolean}
 */
Zotero.ui.widgets.controlPanel.moveToTrash =  function(evt){
    evt.preventDefault();
    Z.debug('move-to-trash clicked', 3);
    
    var itemKeys = Zotero.state.getSelectedItemKeys();
    Z.debug(itemKeys, 3);
    
    var triggeringEl = J(evt.triggeringElement);
    var library = Zotero.ui.getAssociatedLibrary(triggeringEl);
    var response;
    
    var trashingItems = library.items.getItems(itemKeys);
    var deletingItems = []; //potentially deleting instead of trashing
    
    //show spinner before making the possibly many the ajax requests
    Zotero.ui.showSpinner(J('#library-items-div'));
    Z.debug('trashingItems:');
    Z.debug(trashingItems);
    if(Zotero.state.getUrlVar('collectionKey') == 'trash'){
        //items already in trash. delete them
        var i;
        for(i = 0; i < trashingItems.length; i++ ){
            var item = trashingItems[i];
            if(item.get('deleted')){
                //item is already in trash, schedule for actual deletion
                deletingItems.push(item);
            }
        }
        
        //make request to permanently delete items
        response = library.items.deleteItems(deletingItems);
    }
    else{
        //items are not in trash already so just add them to it
        response = library.items.trashItems(trashingItems);
    }
    
    library.dirty = true;
    response.catch(function(){
        Z.error("Error trashing items");
    }).then(function(){
        Zotero.state.clearUrlVars(['collectionKey', 'tag', 'q']);
        Zotero.state.pushState(true);
        library.trigger("displayedItemsChanged");
    }).catch(Zotero.catchPromiseError);
    
    return false; //stop event bubbling
};

/**
 * Remove currently displayed single item or checked list of items from trash
 * when remove-from-trash link clicked
 * @param  {event} e click event
 * @return {boolean}
 */
Zotero.ui.widgets.controlPanel.removeFromTrash =  function(evt){
    Z.debug('remove-from-trash clicked', 3);
    var widgetEl = J(evt.data.widgetEl);
    var itemKeys = Zotero.state.getSelectedItemKeys();
    Z.debug(itemKeys, 4);
    
    var triggeringEl = J(evt.triggeringElement);
    var library = Zotero.ui.getAssociatedLibrary(triggeringEl);
    
    var untrashingItems = library.items.getItems(itemKeys);
    
    //show spinner before making the possibly many the ajax requests
    Zotero.ui.showSpinner(J('#library-items-div'));
    
    var response = library.items.untrashItems(untrashingItems);
    
    library.dirty = true;
    response.catch(function(){
        
    }).then(function(){
        Z.debug("post-removeFromTrash always execute: clearUrlVars", 3);
        Zotero.state.clearUrlVars(['collectionKey', 'tag', 'q']);
        Zotero.state.pushState();
        library.trigger("displayedItemsChanged");
    }).catch(Zotero.catchPromiseError);
    
    return false;
};

/**
 * Remove currently displaying item or currently selected items from current collection
 * @param  {event} e click event
 * @return {boolean}
 */
Zotero.ui.widgets.controlPanel.removeFromCollection = function(evt){
    Z.debug('remove-from-collection clicked', 3);
    var triggeringEl = J(evt.triggeringElement);
    var library = Zotero.ui.getAssociatedLibrary(triggeringEl);
    var itemKeys = Zotero.state.getSelectedItemKeys();
    var collectionKey = Zotero.state.getUrlVar('collectionKey');
    
    var modifiedItems = [];
    var responses = [];
    J.each(itemKeys, function(index, itemKey){
        var item = library.items.getItem(itemKey);
        item.removeFromCollection(collectionKey);
        modifiedItems.push(item);
    });
    
    library.dirty = true;
    
    library.items.writeItems(modifiedItems)
    .then(function(){
        Z.debug('removal responses finished. forcing reload', 3);
        Zotero.state.clearUrlVars(['collectionKey', 'tag']);
        Zotero.state.pushState(true);
        library.trigger("displayedItemsChanged");
    }).catch(Zotero.catchPromiseError);
    
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
    var mode = Zotero.state.getUrlVar('mode') || 'view';
    
    if(!Zotero.config.librarySettings.allowEdit){
        J(".permission-edit").hide();
    }
};


Zotero.ui.widgets.createCollectionDialog = {};

Zotero.ui.widgets.createCollectionDialog.init = function(el){
    Z.debug("createcollectionsdialog widget init", 3);
    var library = Zotero.ui.getAssociatedLibrary(el);
    
    library.listen("createCollectionDialog", Zotero.ui.widgets.createCollectionDialog.show, {widgetEl: el});
};

Zotero.ui.widgets.createCollectionDialog.show = function(evt){
    Z.debug("createCollectionDialog.show", 3);
    
    var triggeringEl = J(evt.triggeringElement);
    var library = Zotero.ui.getAssociatedLibrary(triggeringEl);
    var ncollections = library.collections.nestedOrderingArray();
    var widgetEl = J(evt.data.widgetEl).empty();
    
    widgetEl.html( J("#createcollectiondialogTemplate").render({ncollections:ncollections}) );
    var dialogEl = widgetEl.find(".create-collection-dialog");
    
    var currentCollectionKey = Zotero.state.getUrlVar('collectionKey');
    dialogEl.find(".new-collection-parent").val(currentCollectionKey);
    
    var createFunction = function(){
        var newCollection = new Zotero.Collection();
        var parentKey = dialogEl.find(".new-collection-parent").val();
        var name = dialogEl.find("input.new-collection-title-input").val() || "Untitled";
        
        library.addCollection(name, parentKey)
        .then(function(responses){
            library.collections.initSecondaryData();
            library.trigger('libraryCollectionsUpdated');
            Zotero.state.pushState();
            Zotero.ui.closeDialog(widgetEl.find(".create-collection-dialog"));
            Zotero.ui.jsNotificationMessage("Collection Created", 'success');
        }).catch(function(error){
            Zotero.ui.jsNotificationMessage("There was an error creating the collection.", "error");
            Zotero.ui.closeDialog(widgetEl.find(".create-collection-dialog"));
        });
    };
    
    dialogEl.find(".createButton").on('click', createFunction);
    Zotero.ui.dialog(dialogEl, {});
};



Zotero.ui.widgets.deleteCollectionDialog = {};

Zotero.ui.widgets.deleteCollectionDialog.init = function(el){
    Z.debug("deletecollectionsdialog widget init", 3);
    var library = Zotero.ui.getAssociatedLibrary(el);
    
    library.listen("deleteCollectionDialog", Zotero.ui.widgets.deleteCollectionDialog.show, {widgetEl: el});
};

Zotero.ui.widgets.deleteCollectionDialog.show = function(evt){
    Z.debug("deleteCollectionDialog.show", 3);
    
    var triggeringEl = J(evt.triggeringElement);
    var library = Zotero.ui.getAssociatedLibrary(triggeringEl);
    var currentCollectionKey = Zotero.state.getUrlVar('collectionKey');
    var currentCollection = library.collections.getCollection(currentCollectionKey);
    
    var widgetEl = J(evt.data.widgetEl).empty();
    widgetEl.html( J("#deletecollectiondialogTemplate").render({collection:currentCollection}) );
    var dialogEl = widgetEl.find(".delete-collection-dialog");
    
    var deleteFunction = J.proxy(function(){
        Z.debug("Zotero.ui.deleteSelectedCollection", 3);
        var collection = currentCollection;
        if(!collection){
            Zotero.ui.jsNotificationMessage("Selected collection not found", 'error');
            return false;
        }
        collection.remove()
        .then(function(){
            delete Zotero.state.pathVars['collectionKey'];
            library.collections.dirty = true;
            library.collections.initSecondaryData();
            Zotero.state.pushState();
            Zotero.ui.jsNotificationMessage(collection.get('title') + " removed", 'confirm');
            Zotero.ui.closeDialog(dialogEl);
        }).catch(Zotero.catchPromiseError);
        return false;
    }, this);
    
    dialogEl.find(".deleteButton").on('click', deleteFunction);
    Zotero.ui.dialog(dialogEl, {});
    
    return false;
};



Zotero.ui.widgets.createItemDialog = {};

Zotero.ui.widgets.createItemDialog.init = function(el){
    Z.debug("createItemDialog widget init", 3);
    var library = Zotero.ui.getAssociatedLibrary(el);
    
    library.listen("newItem", Zotero.ui.widgets.createItemDialog.show, {widgetEl: el});
};

Zotero.ui.widgets.createItemDialog.show = function(evt){
    Z.debug("createItemDialog.show", 3);
    
    var triggeringEl = J(evt.triggeringElement);
    var library = Zotero.ui.getAssociatedLibrary(triggeringEl);
    var widgetEl = J(evt.data.widgetEl).empty();
    var itemType = triggeringEl.data('itemtype');
    var currentCollectionKey = Zotero.state.getUrlVar('collectionKey');
    
    widgetEl.html( J("#createitemdialogTemplate").render({}) );
    var dialogEl = widgetEl.find(".create-item-dialog");
    
    var createFunction = function(){
        var item = new Zotero.Item();
        item.initEmpty(itemType).then(function(){
            item.associateWithLibrary(library);
            var title = dialogEl.find("input.new-item-title-input").val() || "Untitled";
            item.set('title', title);
            if(currentCollectionKey){
                item.addToCollection(currentCollectionKey);
            }
            return Zotero.ui.saveItem(item);
        }).then(function(responses){
            var itemKey = item.get('key');
            Zotero.state.setUrlVar('itemKey', itemKey);
            Zotero.state.pushState();
            Zotero.ui.closeDialog(widgetEl.find(".create-item-dialog"));
        }).catch(function(error){
            Zotero.error(error);
            Zotero.ui.jsNotificationMessage("There was an error creating the item.", "error");
            Zotero.ui.closeDialog(widgetEl.find(".create-item-dialog"));
        });
    };
    
    dialogEl.find(".createButton").on('click', createFunction);
    Zotero.ui.dialog(dialogEl, {});
};



Zotero.ui.widgets.exportItemsDialog = {};

Zotero.ui.widgets.exportItemsDialog.init = function(el){
    Z.debug("exportItemDialog widget init", 3);
    var library = Zotero.ui.getAssociatedLibrary(el);
    
    library.listen("exportItemsDialog", Zotero.ui.widgets.exportItemsDialog.show, {widgetEl: el});
    library.listen("displayedItemsChanged", Zotero.ui.widgets.exportItemsDialog.updateExportLinks, {widgetEl: el});
    
    Zotero.ui.widgets.exportItemsDialog.updateExportLinks({data:{widgetEl: el}});
};

Zotero.ui.widgets.exportItemsDialog.show = function(evt){
    Z.debug("exportitemdialog.show", 3);
    var triggeringEl = J(evt.triggeringElement);
    var library = Zotero.ui.getAssociatedLibrary(triggeringEl);
    var widgetEl = J(evt.data.widgetEl).empty();
    widgetEl.html( J("#exportitemsdialogTemplate").render({}) );
    var dialogEl = widgetEl.find(".export-items-dialog");
    
    dialogEl.find(".modal-body").empty().append(J(".export-list").contents().clone() );
    
    //get library and build dialog
    Zotero.ui.dialog(dialogEl, {});
    
    return false;
};

Zotero.ui.widgets.exportItemsDialog.updateExportLinks = function(evt){
    Z.debug('exportItemsDialog.updateExportLinks', 3);
    //get list of export urls and link them
    var widgetEl = J(evt.data['widgetEl']);
    var library = Zotero.ui.getAssociatedLibrary(widgetEl);
    
    var urlconfig = Zotero.ui.getItemsConfig(library);
    
    var exportUrls = Zotero.url.exportUrls(urlconfig);
    J(".export-list").empty().append( J("#exportformatsTemplate").render({exportUrls:exportUrls, exportFormatsMap: Zotero.config.exportFormatsMap}) );
    //hide export list until requested
    J(".export-list").hide();
};


Zotero.ui.widgets.feedlink = {};

Zotero.ui.widgets.feedlink.init = function(el){
    var library = Zotero.ui.getAssociatedLibrary(el);
    
    library.listen("displayedItemsChanged", Zotero.ui.widgets.feedlink.recalcFeedlink, {widgetEl: el});
};

Zotero.ui.widgets.feedlink.recalcFeedlink = function(evt){
    Z.debug('Zotero eventful loadFeedLinkCallback', 3);
    var widgetEl = J(evt.data.widgetEl);
    
    var library = Zotero.ui.getAssociatedLibrary(widgetEl);
    var urlconfig = Zotero.ui.getItemsConfig(library);
    var requestUrl = Zotero.ajax.apiRequestUrl(urlconfig) + Zotero.ajax.apiQueryString(urlconfig, false);
    var feedUrl = requestUrl.replace(Zotero.config.baseApiUrl, Zotero.config.baseFeedUrl);
    var newkeyurl = Zotero.url.requestReadApiKeyUrl(library.libraryType, library.libraryID, feedUrl);
    //save urlconfig on feed element for use in callbacks
    widgetEl.data('urlconfig', urlconfig);
    
    //feed link to either create a new key for private feeds or a public feed url
    if(!Zotero.config.librarySettings.publish){
        J(".feed-link").attr('href', newkeyurl);
    }
    else{
        J(".feed-link").attr('href', feedUrl);
    }
    J("#library link[rel='alternate']").attr('href', feedUrl);
};


Zotero.ui.widgets.groups = {};

Zotero.ui.widgets.groups.init = function(el){
    Z.debug("groups widget init", 3);
    //var library = Zotero.ui.getAssociatedLibrary(el);
    var groups = new Zotero.Groups();
    if(Zotero.config.loggedIn && Zotero.config.loggedInUserID){
        Zotero.ui.showSpinner(J(el), 'horizontal');
        var groupsPromise = groups.fetchUserGroups(Zotero.config.loggedInUserID)
        .then(function(response){
            var groups = response.fetchedGroups;
            Zotero.ui.widgets.groups.displayGroupNuggets(el, groups);
        }).catch(Zotero.catchPromiseError);
    }
}

Zotero.ui.widgets.groups.userGroupsDisplay = function(groups){
    var html = '';
    J.each(groups.groupsArray, function(index, group){
        html += Zotero.ui.groupNugget(group);
    });
    return html;
};

Zotero.ui.widgets.groups.displayGroupNuggets = function(el, groups){
    Z.debug("Zotero.ui.widgets.groups.displayGroupNuggets", 3);
    var jel = J(el);
    jel.empty();
    if(groups.length == 0){
        jel.append("<p>You are not currently a member of any groups.</p>");
        J("#groups-blurb").removeClass('hidden');
    } else {
        J.each(groups, function(ind, group){
            var userID = Zotero.config.loggedInUserID;
            var groupManageable = false;
            var memberCount = 1;
            if(group.apiObj.data.members) {
                memberCount += group.apiObj.data.members.length;
            }
            if(group.apiObj.data.admins){
                memberCount += group.apiObj.data.admins.length;
            }
            
            if(userID && (userID == group.apiObj.data.owner || (J.inArray(userID, group.apiObj.data.admins) != -1 ))) {
                groupManageable = true;
            }
            
            var tdata = {
                group:group,
                groupViewUrl:Zotero.url.groupViewUrl(group),
                groupLibraryUrl:Zotero.url.groupLibraryUrl(group),
                groupSettingsUrl:Zotero.url.groupSettingsUrl(group),
                groupLibrarySettingsUrl:Zotero.url.groupLibrarySettingsUrl(group),
                groupMemberSettingsUrl: Zotero.url.groupMemberSettingsUrl(group),
                memberCount:memberCount,
                groupManageable: groupManageable
            };
            jel.append( J('#groupnuggetTemplate').render(tdata) );
        });
    }
};



Zotero.ui.widgets.groupsList = {};

Zotero.ui.widgets.groupsList.init = function(el){
    Z.debug("groupsList widget init", 3);
    var library = Zotero.ui.getAssociatedLibrary(el);
    
    library.listen("refreshGroups", Zotero.ui.widgets.groupsList.refresh, {widgetEl: el});
    library.listen("sendToGroup", Zotero.ui.widgets.groupsList.sendToGroup, {widgetEl: el});
    
    library.trigger("refreshGroups");
};

Zotero.ui.widgets.groupsList.refresh = function(evt){
    Zotero.debug("Zotero.ui.widgets.groupsList.refresh", 3);
    var widgetEl = evt.data.widgetEl;
    var library = Zotero.ui.getAssociatedLibrary(widgetEl);
    Zotero.ui.showSpinner(widgetEl);
    var memberGroups = library.groups.fetchUserGroups(library.libraryID)
    .then(function(response){
        Zotero.ui.widgets.groupsList.render(widgetEl, response.fetchedGroups);
    }).catch(Zotero.catchPromiseError);
};

Zotero.ui.widgets.groupsList.render = function(el, groups){
    Z.debug("groupsList render", 3);
    J(el).empty().append( J("#groupslistTemplate").render({groups:groups}));
};


Zotero.ui.widgets.inviteToGroup = {};

Zotero.ui.widgets.inviteToGroup.init = function(el){
    Z.debug("inviteToGroup widget init", 3);
    //var library = Zotero.ui.getAssociatedLibrary(el);
    var groups = new Zotero.Groups();
    if(Zotero.config.loggedIn && Zotero.config.loggedInUserID){
        var groupsPromise = groups.fetchUserGroups(Zotero.config.loggedInUserID, Zotero.config.apiKey)
        .then(function(response){
            Zotero.ui.widgets.inviteToGroup.displayInviteForm(el, response.fetchedGroups);
        }).catch(Zotero.catchPromiseError);
    }
}

Zotero.ui.widgets.inviteToGroup.displayInviteForm = function(el, groups){
    Z.debug("Zotero.ui.widgets.inviteToGroup.displayInviteForm", 3);
    Z.debug(el);
    var jel = J(el);
    jel.empty();
    
    //pull out manageable groups
    var manageGroups = [];
    J.each(groups, function(ind, group){
        Z.debug(group.title);
        var userID = Zotero.config.loggedInUserID;
        var groupManageable = false;
        if(userID && (userID == group.apiObj.owner || (J.inArray(userID, group.apiObj.admins) != -1 ))) {
            Z.debug("manage group");
            manageGroups.push(group);
        }
    });
    
    var tdata = {
        groups: manageGroups,
    };
    Z.debug("rendering form");
    jel.append( J('#inviteuserformTemplate').render(tdata) );
    Z.debug("binding on form");
    jel.find("form.inviteuserform").on('submit', function(evt){
        Z.debug("inviteUserForm submitted");
        evt.preventDefault();
        var form = J(evt.target);
        Z.debug(form);
        var groupID = form.find("#groupID").val();
        var groupName = form.find("option.selected").html();
        Z.debug(groupID);
        Z.debug("posting invitation request");
        J.post("/groups/inviteuser", {ajax:true, groupID:groupID, userID:zoteroData.profileUserID}, function(data){
            Z.debug("got response from inviteuser");
            Zotero.ui.jsNotificationMessage("User has been invited to join " + groupName, 'success');
            if(data == 'true'){
                /*
                J('#invited-user-list').append("<li>" + J("#invite_group > option:selected").html() + "</li>");
                J('#invite_group > option:selected').remove();
                if(J('#invite_group > option').length === 0){
                    J('#invite_group').remove();
                    J('#invite-button').remove();
                }
                */
                Zotero.ui.jsNotificationMessage("User has been invited to join " + groupName, 'success');
            }
        }, "text");
    });
};


Zotero.ui.widgets.item = {};
//TODO: trigger showChildren with an extra itemID filter so quick clicks back and forth
//between items don't overwrite with the wrong children?
Zotero.ui.widgets.item.init = function(el){
    var library = Zotero.ui.getAssociatedLibrary(el);
    
    library.listen("displayedItemChanged modeChanged", Zotero.ui.widgets.item.loadItem, {widgetEl: el});
    library.listen("itemTypeChanged", Zotero.ui.widgets.item.itemTypeChanged, {widgetEl:el});
    library.listen("uploadSuccessful", Zotero.ui.widgets.item.refreshChildren, {widgetEl:el});
    
    library.listen("addTag", Zotero.ui.widgets.item.addTag, {widgetEl:el});
    library.listen("removeTag", Zotero.ui.widgets.item.removeTag, {widgetEl:el});
    
    library.listen("addCreator", Zotero.ui.widgets.item.addCreator, {widgetEl:el});
    library.listen("removeCreator", Zotero.ui.widgets.item.removeCreator, {widgetEl:el});
    
    library.listen("switchCreatorFields", Zotero.ui.widgets.item.switchCreatorFields, {widgetEl:el});
    
    library.listen("addNote", Zotero.ui.widgets.item.addNote, {widgetEl:el});
    library.listen("tagsChanged", Zotero.ui.widgets.item.updateTypeahead, {widgetEl:el});

    library.listen("showChildren", Zotero.ui.widgets.item.refreshChildren, {widgetEl:el});
    
    
    library.listen("edit-item-field edit-creator-field", Zotero.ui.widgets.item.clickToEdit, {widgetEl:el});
    library.listen("edit-item-tag", Zotero.ui.widgets.item.clickToEdit, {widgetEl:el});
    
    //watch buttons on item field from widget DOM element
    var container = J(el);
    
    Zotero.state.bindTagLinks(container);
    Zotero.state.bindItemLinks(container);
    
    //add a new tag when user presses enter in add-tag-input
    container.on('keydown', "input#add-tag-input", function(e){
        Z.debug("add-tag-input keydown");
        e.stopImmediatePropagation();
        if (e.keyCode === Zotero.ui.keyCode.ENTER){
            var input = J(this);
            var itemKey = input.data('itemkey');
            var item = library.items.getItem(itemKey);
            var newTagString = input.val();
            var itemTags = item.get('tags');
            itemTags.push({tag:newTagString});
            Zotero.ui.saveItem(item);
            container.find("div.item-tags-list").append(J("#taglistitemTemplate").render({tag:newTagString},
            {
                item:item,
                key: "tag",
                value: newTagString,
                itemKey: itemKey,
                libraryString: library.libraryString,
                tagIndex: (itemTags.length - 1),
            }));
            container.find('span.tag-count').html(itemTags.length);
            input.val('');
            Zotero.eventful.initTriggers(container);
        }
    });
    
    //blur field when user presses enter in item field input to trigger save
    container.on('keydown', ".item-field-control", function(e){
        e.stopImmediatePropagation();
        if (e.keyCode === Zotero.ui.keyCode.ENTER){
            J(this).blur();
        }
    });
    
    container.on('blur', '.item-field-control', function(e){
        Z.debug("blurred");
        var input = J(this);
        var itemKey = input.data('itemkey');
        var item = library.items.getItem(itemKey);
        var updatedField = input.attr('name');
        var updatedValue = input.val();
        var creatorIndex = input.data('creatorindex');
        var tagIndex = input.data('tagindex');
        Z.debug(updatedField);
        Z.debug(updatedValue);
        var templateData = {
            item:item,
            key: updatedField,
            value: updatedValue,
            itemKey: itemKey,
            libraryString: library.libraryString,
            creatorIndex: creatorIndex,
            tagIndex: tagIndex,
        };

        if(['name', 'firstName', 'lastName', 'creatorType'].indexOf(updatedField) != -1){
            //creator field
            input.replaceWith(J("#datafieldspanTemplate").render(templateData));
            var row = J("tr.creator-row[data-creatorindex='" + creatorIndex + "']");
            var updatedCreator = Zotero.ui.widgets.item.creatorFromRow(row);
            Zotero.ui.widgets.item.updateItemCreatorField(library, itemKey, updatedCreator, creatorIndex);
        } else if(updatedField == 'tag'){
            var tags = item.get('tags');
            if(tags[tagIndex]){
                tags[tagIndex].tag = updatedValue;
            } else {
                tags[tagIndex] = {tag:updatedValue};
            }
            
            Zotero.ui.saveItem(item);
            input.typeahead('destroy');
            input.replaceWith(J("#datafieldspanTemplate").render(templateData));
        }
        else {
            Zotero.ui.widgets.item.updateItemField(library, itemKey, updatedField, updatedValue);
            input.replaceWith(J("#datafieldspanTemplate").render(templateData));
        }

        Zotero.eventful.initTriggers(container);
    });

    library.trigger("displayedItemChanged");
};

Zotero.ui.widgets.item.loadItem = function(event){
    Z.debug('Zotero eventful loadItem', 3);
    var widgetEl = J(event.data.widgetEl);
    var itemInfoPanel = widgetEl.find('#item-info-panel');
    var triggeringEl = J(event.triggeringElement);
    var loadingPromise;
    
    //clean up RTEs before we end up removing their dom elements out from under them
    Zotero.ui.cleanUpRte(widgetEl);
    
    var library = Zotero.ui.getAssociatedLibrary(widgetEl);
    //clear contents and show spinner while loading
    itemInfoPanel.empty();
    Zotero.ui.showSpinner(itemInfoPanel);
    
    //get the key of the item we need to display, or display library stats
    var itemKey = Zotero.state.getUrlVar('itemKey');
    if(!itemKey){
        Z.debug("No itemKey - " + itemKey, 3);
        itemInfoPanel.empty();
        Zotero.ui.widgets.item.displayStats(library, widgetEl);
        return Promise.reject(new Error("No itemkey - " + itemKey));
    }
    
    //if we are showing an item, load it from local library of API
    //then display it
    var loadedItem = library.items.getItem(itemKey);
    if(loadedItem){
        Z.debug("have item locally, loading details into ui", 3);
        loadingPromise = Promise.resolve(loadedItem);
    }
    else{
        Z.debug("must fetch item from server", 3);
        var config = {
            'target':'item',
            'libraryType':library.type,
            'libraryID':library.libraryID,
            'itemKey':itemKey
        };
        loadingPromise = library.loadItem(itemKey);
    }
    loadingPromise.then(function(item){
        loadedItem = item;
    }).then(function(){
        return loadedItem.getCreatorTypes(loadedItem.get('itemType'));
    }).then(function(creatorTypes){
        itemInfoPanel.empty();
        Zotero.ui.widgets.item.loadItemDetail(loadedItem, widgetEl);
        library.trigger('showChildren');
        Zotero.eventful.initTriggers(widgetEl);
    });
    loadingPromise.catch(function(err){
        Z.error("loadItem promise failed");
        Z.error(err);
    }).then(function(){
        widgetEl.removeData('loadingPromise');
    }).catch(Zotero.catchPromiseError);
    
    widgetEl.data('loadingPromise', loadingPromise);
    return loadingPromise;
};

/**
 * Add creator field to item edit form
 * @param {DOM Button} button Add creator button clicked
 */
Zotero.ui.widgets.item.addCreator = function(e){
    Z.debug("widgets.item.addCreator", 3);
    var triggeringElement = J(e.triggeringElement);
    var widgetEl = J(e.data.widgetEl);
    var library = Zotero.ui.getAssociatedLibrary(e.data.widgetEl);
    var itemKey = triggeringElement.data('itemkey');
    var item = library.items.getItem(itemKey);
    var newCreatorIndex = item.get('creators').length;
    
    widgetEl.find("tr.creator-row").last().after(J("#creatorrowTemplate").render({}, {
        creatorIndex: newCreatorIndex,
        libraryString: library.libraryString,
        item: item,
    }));

    Zotero.eventful.initTriggers(widgetEl);
};

/**
 * Remove a creator from an edit item form
 * @param  {Dom Button} button Remove creator button that was clicked
 * @return {undefined}
 */
Zotero.ui.widgets.item.removeCreator = function(e){
    Z.debug("widgets.item.removeCreator", 3);
    var triggeringElement = J(e.triggeringElement);
    var widgetEl = J(e.data.widgetEl);
    var library = Zotero.ui.getAssociatedLibrary(e.data.widgetEl);
    var itemKey = triggeringElement.data('itemkey');
    var item = library.items.getItem(itemKey);
    var creatorIndex = triggeringElement.data('creatorindex');
    
    //empty specified creator from item and save
    var creators = item.get('creators');
    creators.splice(creatorIndex, 1);
    Zotero.ui.saveItem(item);

    //re-render creator rows so they are re-indexed
    var oldRows = widgetEl.find("tr.creator-row");
    var oldRowCount = oldRows.length;
    for(var i = 0; i < creators.length; i++){
        widgetEl.find("tr.creator-row").last().after(J("#creatorrowTemplate").render(creators[i], {
            creatorIndex: i,
            libraryString: library.libraryString,
            item: item,
        }));
    }

    oldRows.remove();

    Zotero.eventful.initTriggers(widgetEl);
};

/**
 * Add a note field to an editItem Form
 * @param {Dom Button} button Add note button that was clicked
 */
Zotero.ui.widgets.item.addNote = function(e){
    Z.debug("Zotero.ui.addNote", 3);
    var button = J(e.currentTarget);
    var container = button.closest("form");
    //var itemKey = J(button).data('itemkey');
    var notenum = 0;
    var lastNoteIndex = container.find("textarea.note-text:last").data('noteindex');
    if(lastNoteIndex){
        notenum = parseInt(lastNoteIndex, 10);
    }
    
    var newindex = notenum + 1;
    var newNoteID = "note_" + newindex;
    var jel;
    jel = container.find("td.notes button.add-note-button").before('<textarea cols="40" rows="24" name="' + newNoteID + '" id="' + newNoteID + '" class="rte default note-text" data-noteindex="' + newNoteID + '"></textarea>');
    Zotero.ui.init.rte('default', true, newNoteID);
};

/**
 * Add a tag field to an edit item form
 * @param {bool} focus Whether to focus the newly added tag field
 */
Zotero.ui.widgets.item.addTag = function(e, focus) {
    Z.debug("Zotero.ui.widgets.item.addTag", 3);
    var triggeringElement = J(e.triggeringElement);
    var widgetEl = J(e.data.widgetEl);
    widgetEl.find(".add-tag-form").show().find(".add-tag-input").focus();
    /*
    if(typeof focus == 'undefined'){
        focus = true;
    }
    var widgetEl = Zotero.ui.parentWidgetEl(e);
    var jel = widgetEl.find("td.tags");
    jel.append( J('#itemtagTemplate').render({'library':library}) );
    
    var library = Zotero.ui.getAssociatedLibrary(widgetEl);
    if(library){
        Zotero.ui.widgets.item.addTagTypeahead(library, widgetEl);

        //widgetEl.find("input.taginput").not('.tt-query').typeahead({name: 'tags', local: library.tags.plainList});
    }
    
    if(focus){
        J("input.taginput").last().focus();
    }
    */
};

/**
 * Remove a tag field from an edit item form
 * @param  {DOM Element} el Tag field to remove
 * @return {undefined}
 */
Zotero.ui.widgets.item.removeTag = function(e) {
    Z.debug("Zotero.ui.removeTag", 3);
    var el = e.triggeringElement;
    var widgetEl = Zotero.ui.parentWidgetEl(el);
    var library = Zotero.ui.getAssociatedLibrary(widgetEl);
    var tagRow = J(el).closest('.item-tag-row');
    var tagSpan = tagRow.find('.editable-item-tag');
    var itemKey = tagSpan.data('itemkey');
    var item = library.items.getItem(itemKey);
    var removeTagString = tagSpan.data('value');
    //remove tag from item tags array
    var newTags = [];
    var oldTags = item.get('tags');
    J.each(oldTags, function(ind, val){
        if(val.tag != removeTagString){
            Z.debug("leaving tag alone:" + val.tag);
            newTags.push(val);
        }
    });

    item.set('tags', newTags);
    Zotero.ui.saveItem(item);
    tagRow.remove();
    //check to make sure there is another tag field available to use
    //if not add an empty one
    if(widgetEl.find("div.edit-tag-div").length === 1){
        Zotero.ui.widgets.item.addTag(e);
    }
};

Zotero.ui.widgets.item.addTagTypeahead = function(library, widgetEl){
    Z.debug('adding typeahead', 3);
    var typeaheadSource = library.tags.plainList;
    if(!typeaheadSource){
        typeaheadSource = [];
    }
    var ttEngine = new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        local: J.map(typeaheadSource, function(typeaheadSource) { return { value: typeaheadSource }; })
    });
    ttEngine.initialize();
    widgetEl.find("input.taginput").typeahead('destroy');
    widgetEl.find("input.taginput").typeahead(
        {
            hint: true,
            highlight: true,
            minLength: 1
        },
        {
            name: 'tags',
            displayKey: 'value',
            source: ttEngine.ttAdapter()
            //local: library.tags.plainList
        }
    );
};

Zotero.ui.widgets.item.addTagTypeaheadToInput = function(library, element){
    Z.debug('adding typeahead', 3);
    var typeaheadSource = library.tags.plainList;
    if(!typeaheadSource){
        typeaheadSource = [];
    }
    var ttEngine = new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        local: J.map(typeaheadSource, function(typeaheadSource) { return { value: typeaheadSource }; })
    });
    ttEngine.initialize();
    J(element).typeahead('destroy');
    J(element).typeahead(
        {
            hint: true,
            highlight: true,
            minLength: 1
        },
        {
            name: 'tags',
            displayKey: 'value',
            source: ttEngine.ttAdapter()
            //local: library.tags.plainList
        }
    );
};

/**
 * Render and display full item details into an element
 * @param  {Zotero_Item} item Zotero Item to display
 * @param  {Dom Element} el   Container
 * @return {undefined}
 */
Zotero.ui.widgets.item.loadItemDetail = function(item, el){
    Z.debug("Zotero.ui.widgets.item.loadItemDetail", 3);
    var jel = J(el);
    itemInfoPanel = jel.find("#item-info-panel");
    itemInfoPanel.empty();
    var parentUrl = false;
    var library = item.owningLibrary
    if(item.apiObj.data.parentItem){
        parentUrl = library.websiteUrl({itemKey:item.apiObj.data.parentItem});
    }
    if(item.apiObj.data.itemType == "note"){
        Z.debug("note item", 3);
        itemInfoPanel.append( J('#itemnotedetailsTemplate').render({item:item, parentUrl:parentUrl, libraryString:library.libraryString}) );
    }
    else{
        Z.debug("non-note item", 3);
        jel.empty().append( J('#itemdetailsTemplate').render({item:item, parentUrl:parentUrl, libraryString:library.libraryString}) );
    }
    Zotero.ui.init.rte('readonly');
    
    try{
        //trigger event for Zotero translator detection
        var ev = document.createEvent('HTMLEvents');
        ev.initEvent('ZoteroItemUpdated', true, true);
        document.dispatchEvent(ev);
    }
    catch(e){
        Zotero.error("Error triggering ZoteroItemUpdated event");
    }
    jel.data('itemkey', item.apiObj.key);
};

//get stats from library.items and display them in the item info pane when we
//don't have a selected item to show
Zotero.ui.widgets.item.displayStats = function(library, widgetEl) {
    Z.debug("Zotero.ui.widgets.item.displayStats", 3);
    var totalResults = library.items.totalResults;
    if(totalResults){
        J(widgetEl).html("<p class='item-count'>" + totalResults + " items in this view</p>");
    }
};


/**
 * Get an item's children and display summary info
 * @param  {DOM Element} el      element to insert into
 * @param  {string} itemKey key of parent item
 * @return {undefined}
 */
Zotero.ui.widgets.item.refreshChildren = function(e){
    Z.debug('Zotero.ui.widgets.item.refreshChildren', 3);
    var widgetEl = J(e.data.widgetEl);
    var childrenPanel = widgetEl.find("#item-children-panel");
    var library = Zotero.ui.getAssociatedLibrary(widgetEl);
    var itemKey = Zotero.state.getUrlVar('itemKey');
    if(!itemKey){
        Z.debug("No itemKey - " + itemKey, 3);
        widgetEl.empty();
        //TODO: display information about library like client?
        return Promise.reject(new Error("No itemkey - " + itemKey));
    }
    
    var item = library.items.getItem(itemKey);
    
    Zotero.ui.showSpinner(childrenPanel);
    var p = item.getChildren(library)
    .then(function(childItems){
        var container = childrenPanel;
        container.html( J('#childitemsTemplate').render({childItems:childItems}) );
        Zotero.state.bindItemLinks(container);
    })
    .catch(Zotero.catchPromiseError);
    return p;
};


Zotero.ui.widgets.item.itemFormKeydown = function(e){
    if ( e.keyCode === Zotero.ui.keyCode.ENTER ){
        Z.debug(e);
        e.preventDefault();
        var triggeringEl = J(this);
        if(triggeringEl.hasClass('taginput')){
            var library = Zotero.ui.getAssociatedLibrary(triggeringEl);
            if(triggeringEl.hasClass('tt-query')){
                var val = triggeringEl.val();
                triggeringEl.typeahead('setQuery', val);
                triggeringEl.trigger('blur');
            }
            if(library){
                library.trigger("addTag");
            }
            return;
        }
        var nextEligibleSiblings = J(this).nextAll("input, button, textarea, select");
        if(nextEligibleSiblings.length){
            nextEligibleSiblings.first().focus();
        }
        else{
            J(this).closest("tr").nextAll().find("input, button, textarea, select").first().focus();
        }
    }
};

Zotero.ui.widgets.item.updateTypeahead = function(event){
    Z.debug("updateTypeahead", 3);
    var widgetEl = J(event.data.widgetEl);
    var triggeringEl = J(event.triggeringElement);
    var library = Zotero.ui.getAssociatedLibrary(widgetEl);
    if(library){
        Zotero.ui.widgets.item.addTagTypeahead(library, widgetEl);
    }
};



//switch an item field to a form input when clicked to edit (and is editable by the user)
Zotero.ui.widgets.item.clickToEdit = function(e){
    Z.debug("widgets.item.clickToEdit", 3);
    if(!Zotero.config.librarySettings.allowEdit) {
        return false;
    }
    var triggeringElement = J(e.triggeringElement);
    var widgetEl = J(e.data.widgetEl);
    var library = Zotero.ui.getAssociatedLibrary(e.data.widgetEl);
    var itemField = triggeringElement.data('itemfield');
    var itemKey = triggeringElement.data('itemkey');
    var creatorIndex = triggeringElement.data('creatorindex');
    var tagIndex = triggeringElement.data('tagindex');
    var item = library.items.getItem(itemKey);
    var creators = item.get('creators');
    var fieldValue = "";
    if(creatorIndex !== undefined && creators[creatorIndex]){
        fieldValue = creators[creatorIndex][itemField];
    } else if(itemField == 'tag'){
        fieldValue = triggeringElement.data('value');
    } else {
        fieldValue = item.get(itemField);
    }

    triggeringElement.replaceWith(J("#datafieldTemplate").render({
        creatorTypes: item.creatorTypes[item.get('itemType')],
        key: itemField,
        value: fieldValue,
        itemKey: itemKey,
        creatorIndex: creatorIndex,
        tagIndex: tagIndex,
        library:library,
        item:item,
    }));

    var createdElement = widgetEl.find("[name='" + itemField + "']");
    if(itemField == 'tag'){
        Zotero.ui.widgets.item.addTagTypeaheadToInput(library, createdElement);
    }
    createdElement.focus();
}

Zotero.ui.widgets.item.switchCreatorFields = function(e){
    Z.debug("widgets.item.switchCreatorFields", 3);
    var triggeringElement = J(e.triggeringElement);
    var creatorIndex = triggeringElement.data('creatorindex');
    var rowSelector = "tr.creator-row[data-creatorindex='" + creatorIndex + "']";
    Z.debug(rowSelector);
    var row = J(rowSelector);
    var creator = Zotero.ui.widgets.item.creatorFromRow(row);
    
    var widgetEl = J(e.data.widgetEl);
    var library = Zotero.ui.getAssociatedLibrary(e.data.widgetEl);
    var itemField = triggeringElement.data('itemfield');
    var itemKey = triggeringElement.data('itemkey');
    var item = library.items.getItem(itemKey);
    var updatedField;
    var updatedValue;

    if(creator.name !== undefined){
        var split = creator.name.split(' ');
        if(split.length > 1){
            creator.lastName = split.splice(-1, 1)[0];
            creator.firstName = split.join(' ');
        }
        else{
            creator.lastName = creator.name;
            creator.firstName = '';
        }
        delete creator.name;
    } else {
        if(creator.firstName == "" && creator.lastName == "") {
            creator.name = "";
        } else {
            creator.name = creator.firstName + ' ' + creator.lastName;
        }
        delete creator.firstName;
        delete creator.lastName;
    }

    var creators = item.get('creators');
    creators[creatorIndex] = creator;
    Zotero.ui.saveItem(item);

    row.replaceWith(J("#creatorrowTemplate").render(creator, {
        creatorIndex: creatorIndex,
        libraryString: library.libraryString,
        item: item,
    }));
    Zotero.eventful.initTriggers(widgetEl);
}

/**
 * save an item after a field that was being edited has lost focus
 * @param  {event} e DOM Event triggering callback
 * @return {boolean}
 */
Zotero.ui.widgets.item.updateItemField = function(library, itemKey, updatedField, updatedValue){
    Z.debug("widgets.item.updateItemField", 3);
    Z.debug("itemKey: " + itemKey, 3);
    if(!itemKey){
        throw new Error("Expected widget element to have itemKey data");
    }
    
    var item = library.items.getItem(itemKey);
    if(item.get(updatedField) != updatedValue){
        item.set(updatedField, updatedValue);
        Zotero.ui.saveItem(item);
    }
};

/**
 * save an item after a creator field that was being edited has lost focus
 * @param  {event} e DOM Event triggering callback
 * @return {boolean}
 */
Zotero.ui.widgets.item.updateItemCreatorField = function(library, itemKey, updatedCreator, creatorIndex){
    Z.debug("widgets.item.updateCreatorField", 3);
    Z.debug("itemKey: " + itemKey, 3);
    if(!itemKey){
        throw new Error("Expected widget element to have itemKey data");
    }
    
    var item = library.items.getItem(itemKey);
    var creators = item.get('creators');
    if(creators[creatorIndex]){
        creators[creatorIndex] = updatedCreator;
        Zotero.ui.saveItem(item);
    } else {
        //get full creator information from row of data, and add creator at index
        var rowSelector = "tr.creator-row[data-creatorindex='" + creatorIndex + "']";
        var row = J(rowSelector);
        var creator = Zotero.ui.widgets.item.creatorFromRow(row);
        creators[creatorIndex] = creator;
        Zotero.ui.saveItem(item);
    }
};

Zotero.ui.widgets.item.creatorFromRow = function(rowElement) {
    Z.debug("widgets.item.creatorFromRow", 3);
    var row = J(rowElement);
    var creatorType = row.find("span[data-itemfield='creatorType']").data('value');
    var name = row.find("span[data-itemfield='name']").data('value') || "";
    var firstName = row.find("span[data-itemfield='firstName']").data('value') || "";
    var lastName = row.find("span[data-itemfield='lastName']").data('value') || "";
    
    var creator = {
        creatorType: creatorType,
        name: name,
        firstName: firstName,
        lastName: lastName,
    };
    
    if(creator['name'] != ""){
        delete creator.firstName;
        delete creator.lastName;
    } else {
        delete creator['name'];
    }
    
    return creator;
};


Zotero.ui.widgets.items = {};

Zotero.ui.widgets.items.init = function(el){
    Z.debug("widgets.items.init");
    var library = Zotero.ui.getAssociatedLibrary(el);
    
    library.listen("displayedItemsChanged", Zotero.ui.widgets.items.loadItems, {widgetEl: el});
    library.listen("displayedItemChanged", Zotero.ui.widgets.items.selectDisplayed, {widgetEl: el});
    //library.listen("selectedItemsChanged", Zotero.ui.widgets.items.updateSelected, {widgetEl: el});
    
    library.listen("loadMoreItems", Zotero.ui.widgets.items.loadMoreItems, {widgetEl: el});
    library.listen("changeItemSorting", Zotero.ui.callbacks.resortItems, {widgetEl: el});

    
    //set up sorting on header clicks
    var container = J(el);
    //container.on('click', ".field-table-header", Zotero.ui.callbacks.resortItems);
    
    Zotero.state.bindItemLinks(container);
    
    //check/uncheck all boxes in items table when master checkbox is toggled
    container.on('change', ".itemlist-editmode-checkbox.all-checkbox", function(e){
        var checkbox = J(this);
        J(".itemlist-editmode-checkbox").prop('checked', checkbox.prop('checked'));
        var selectedItemKeys = [];
        J("input.itemKey-checkbox:checked").each(function(index, el){
            selectedItemKeys.push(J(el).data('itemkey'));
        });
        Zotero.state.selectedItemKeys = selectedItemKeys;
        library.trigger("selectedItemsChanged", {selectedItemKeys: selectedItemKeys});

        Zotero.ui.widgets.items.highlightSelected();
        //if deselected all, reselect displayed item row
        if(selectedItemKeys.length == 0){
            library.trigger('displayedItemChanged');
        }
    });
    
    //init itemkey-checkbox to enable/disable buttons that require something being selected
    container.on('change', "input.itemKey-checkbox", function(e){
        var selectedItemKeys = [];
        J("input.itemKey-checkbox:checked").each(function(index, el){
            selectedItemKeys.push(J(el).data('itemkey'));
        });
        Zotero.state.selectedItemKeys = selectedItemKeys;
        library.trigger("selectedItemsChanged", {selectedItemKeys: selectedItemKeys});

        Zotero.ui.widgets.items.highlightSelected();
    });
   
    //monitor scroll position of items pane for infinite scrolling
    container.closest("#items-panel").on('scroll', function(e){
        if(Zotero.ui.widgets.items.scrollAtBottom(J(this))){
            library.trigger("loadMoreItems");
        }
    });

    library.trigger("displayedItemsChanged");
};

//select and highlight in the itemlist the item  that is displayed
//in the item details widget
Zotero.ui.widgets.items.selectDisplayed = function(event){
    Z.debug('widgets.items.selectDisplayed', 3);
    var widgetEl = J(event.data.widgetEl);
    var library = Zotero.ui.getAssociatedLibrary(widgetEl);
    var selectedItemKey = Zotero.state.getUrlVar('itemKey');
    Zotero.state.selectedItemKeys = [selectedItemKey];
    var checkboxName = 'selectitem-' + selectedItemKey;
    
    //uncheck all checkboxes, then check the one that is newly displayed
    J(".itemlist-editmode-checkbox").prop('checked', false);
    J('[name="' + checkboxName + '"]').prop('checked', true);

    Zotero.ui.widgets.items.highlightSelected();
};

//highlight the rows that are currently selected
Zotero.ui.widgets.items.highlightSelected = function(){
    //highlight only checked rows
    J(".itemlist-editmode-checkbox").closest("tr").removeClass("highlighed");
    J(".itemlist-editmode-checkbox:checked").closest("tr").addClass("highlighed");
};

Zotero.ui.widgets.items.loadItems = function(event){
    Z.debug('Zotero eventful loadItems', 3);
    var widgetEl = J(event.data.widgetEl);
    var library = Zotero.ui.getAssociatedLibrary(widgetEl);
    var newConfig = Zotero.ui.getItemsConfig(library);
    
    //clear contents and show spinner while loading
    Zotero.ui.showSpinner(widgetEl, 'horizontal');
    
    var p = library.loadItems(newConfig)
    .then(function(response){
        widgetEl.empty();
        if(!response.loadedItems){
            Zotero.error("expected loadedItems on response not present");
            throw("Expected response to have loadedItems");
        }
        library.items.totalResults = response.totalResults;
        Zotero.ui.widgets.items.displayItems(widgetEl, newConfig, response.loadedItems);
    }).catch(function(response){
        Z.error(response);
        widgetEl.html("<p>There was an error loading your items. Please try again in a few minutes.</p>");
        //var elementMessage = Zotero.ui.ajaxErrorMessage(response.jqxhr);
    });
    return p;
};

//load more items when the user has scrolled to the bottom of the current list
Zotero.ui.widgets.items.loadMoreItems = function(event){
    Z.debug('loadMoreItems', 3);
    var widgetEl = J(event.data.widgetEl);
    //bail out if we're already fetching more items
    if(widgetEl.data('moreloading')){
        return;
    }
    //bail out if we're done loading all items
    if(widgetEl.data('all-items-loaded')){
        return;
    }
    widgetEl.data('moreloading', true);
    
    var library = Zotero.ui.getAssociatedLibrary(widgetEl);
    var newConfig = Zotero.ui.getItemsConfig(library);
    var newStart = widgetEl.find("table.wide-items-table tbody>tr").length;
    Z.debug("newStart:" + newStart);
    newConfig.start = newStart;

    //show spinner before making request
    Zotero.ui.showSpinner(widgetEl.find('.items-spinner').show(), 'horizontal');
    
    var p = library.loadItems(newConfig)
    .then(function(response){
        if(!response.loadedItems){
            Zotero.error("expected loadedItems on response not present");
            throw("Expected response to have loadedItems");
        }
        Zotero.ui.widgets.items.displayMoreItems(widgetEl, response.loadedItems);
        widgetEl.removeData('moreloading');
        widgetEl.find('.items-spinner').hide();

        //see if we're displaying as many items as there are in results
        var itemsDisplayed = widgetEl.find("table.narrow-items-table tbody tr").length;
        Z.debug("testing totalResults vs itemsDisplayed: " + response.totalResults, + " " + itemsDisplayed);
        if(response.totalResults == itemsDisplayed) {
            widgetEl.data('all-items-loaded', true);
        }
    }).catch(function(response){
        Z.error(response);
        widgetEl.append("<p>There was an error loading your items. Please try again in a few minutes.</p>");
        widgetEl.removeData('moreloading');
        widgetEl.find('.items-spinner').hide();
    });
    
};

Zotero.ui.getItemsConfig = function(library){
    var effectiveUrlVars = ['tag', 'collectionKey', 'order', 'sort', 'q'];
    var urlConfigVals = {};
    J.each(effectiveUrlVars, function(index, value){
        var t = Zotero.state.getUrlVar(value);
        if(t){
            urlConfigVals[value] = t;
        }
    });
    
    var defaultConfig = {libraryID: library.libraryID,
                         libraryType: library.libraryType,
                         target:'items',
                         targetModifier: 'top',
                         //itemPage: 1,
                         limit: library.preferences.getPref('itemsPerPage'),
                     };
    
    var userPreferencesApiArgs = {
        order: Zotero.preferences.getPref('order'),
        sort: Zotero.preferences.getPref('sort'),
        limit: library.preferences.getPref('itemsPerPage'),
    };
    
    //Build config object that should be displayed next and compare to currently displayed
    var newConfig = J.extend({}, defaultConfig, userPreferencesApiArgs, urlConfigVals);
    //newConfig.start = parseInt(newConfig.limit, 10) * (parseInt(newConfig.itemPage, 10) - 1);
    
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
    
    return newConfig;
};

/**
 * Display the full library items section
 * @param  {Dom Element} el          Container
 * @param  {object} config      items config
 * @param  {array} loadedItems loaded items array
 * @return {undefined}
 */
Zotero.ui.widgets.items.displayItems = function(el, config, itemsArray) {
    Z.debug("Zotero.ui.widgets.displayItems", 3);
    var jel = J(el);
    var library = Zotero.ui.getAssociatedLibrary(jel);
    
    var filledConfig = J.extend({}, Zotero.config.defaultApiArgs, config);
    var displayFields = library.preferences.getPref('listDisplayedFields');
    if(library.libraryType != 'group'){
        displayFields = J.grep(displayFields, function(el, ind){
            return J.inArray(el, Zotero.Library.prototype.groupOnlyColumns) == (-1);
        });
    }
    
    var itemsTableData = {displayFields:displayFields,
                           items:itemsArray,
                           order: filledConfig['order'],
                           sort: filledConfig['sort'],
                           library:library,
                        };

    jel.append( J('#itemstableTemplate').render(itemsTableData) );
    
    //library.trigger('controlPanelContextChange');
    Zotero.eventful.initTriggers();

    Zotero.ui.fixTableHeaders(J("#field-table"));
    library.trigger("displayedItemChanged");
};

Zotero.ui.widgets.items.displayMoreItems = function(el, itemsArray) {
    Z.debug("Zotero.ui.widgets.displayItems", 3);
    var jel = J(el);
    var library = Zotero.ui.getAssociatedLibrary(jel);
    
    var displayFields = library.preferences.getPref('listDisplayedFields');
    if(library.libraryType != 'group'){
        displayFields = J.grep(displayFields, function(el, ind){
            return J.inArray(el, Zotero.Library.prototype.groupOnlyColumns) == (-1);
        });
    }
    
    var itemsTableData = {displayFields:displayFields,
                           items:itemsArray,
                           library:library,
                        };

    var wideTableRows = J('#itemrowsetTemplate').render(itemsTableData);
    var narrowTableRows = J('#singlecellitemrowsetTemplate').render(itemsTableData);
    
    jel.find("table.wide-items-table tbody").append(wideTableRows);
    jel.find("table.narrow-items-table tbody").append(narrowTableRows);
    
    Zotero.eventful.initTriggers();
    Zotero.ui.fixTableHeaders(J("#field-table"));
};

Zotero.ui.callbacks.resortItems = function(e){
    Z.debug(".field-table-header clicked", 3);
    var widgetEl = J(e.data.widgetEl);
    var library = Zotero.ui.getAssociatedLibrary(widgetEl);
    var currentSortField = Zotero.ui.getPrioritizedVariable('order', 'title');
    var currentSortOrder = Zotero.ui.getPrioritizedVariable('sort', 'asc');
    var newSortField;
    var newSortOrder;
    if(e.newSortField){
        newSortField = e.newSortField;
    }
    else {
        newSortField = J(e.triggeringElement).data('columnfield');
    }
    if(e.newSortOrder){
        newSortOrder = e.newSortOrder;
    }
    else{
        newSortOrder = Zotero.config.sortOrdering[newSortField];
    }
    
    //only allow ordering by the fields we have
    if(J.inArray(newSortField, Zotero.Library.prototype.sortableColumns) == (-1)){
        return false;
    }
    
    //change newSort away from the field default if that was already the current state
    if((!e.newSortOrder) && currentSortField == newSortField && currentSortOrder == newSortOrder){
        if(newSortOrder == 'asc'){
            newSortOrder = 'desc';
        }
        else{
            newSortOrder = 'asc';
        }
    }
    
    //problem if there was no sort column mapped to the header that got clicked
    if(!newSortField){
        Zotero.ui.jsNotificationMessage("no order field mapped to column");
        return false;
    }
    
    //update the url with the new values
    Zotero.state.pathVars['order'] = newSortField;
    Zotero.state.pathVars['sort'] = newSortOrder;
    Zotero.state.pushState();
    
    //set new order as preference and save it to use www prefs
    library.preferences.setPref('sortField', newSortField);
    library.preferences.setPref('sortOrder', newSortOrder);
    library.preferences.setPref('order', newSortField);
    library.preferences.setPref('sort', newSortOrder);
    Zotero.preferences.setPref('order', newSortField);
    Zotero.preferences.setPref('sort', newSortOrder);
};

Zotero.ui.widgets.items.scrollAtBottom = function(el) {
    if(J(el).scrollTop() + J(el).innerHeight() >= J(el)[0].scrollHeight){
      return true;
   }
   return false;
};

Zotero.ui.widgets.recentItems = {};

Zotero.ui.widgets.recentItems.init = function(el){
    Z.debug("widgets.recentItems.init");
    var library = Zotero.ui.getAssociatedLibrary(el);
    var widgetEl = J(el);
    
    var config = {
        'limit': 10,
        'order': 'dateModified',
    };
    var p = library.loadItems(config)
    .then(function(response){
        Z.debug("got items in recentItems");
        widgetEl.empty();
        Zotero.ui.widgets.items.displayItems(widgetEl, config, response.loadedItems);
    },
    function(response){
        Z.error(response);
        Z.error("error getting items in recentItems");
        var elementMessage = Zotero.ui.ajaxErrorMessage(response.jqxhr);
        widgetEl.html("<p>" + elementMessage + "</p>");
    });
};


Zotero.ui.widgets.itemContainer = {};

Zotero.ui.widgets.itemContainer.init = function(el){
    Z.debug('itemContainer init', 3);
    var library = Zotero.ui.getAssociatedLibrary(el);
    var container = J(el);
    
    //TODO: this should basically all be event based rather than callbacks
    library.listen("citeItems", Zotero.ui.callbacks.citeItems);
    library.listen("exportItems", Zotero.ui.callbacks.exportItems);
    
    
    container.on('click', "#item-details-div .itemTypeSelectButton", function(){
        Z.debug("itemTypeSelectButton clicked", 3);
        var itemType = J("#itemType").val();
        Zotero.state.pathVars['itemType'] = itemType;
        Zotero.state.pushState();
        return false;
    });
    container.on('change', "#item-details-div .itemDetailForm #itemTypeSelect", function(){
        Z.debug("itemTypeSelect changed", 3);
        var itemType = J(this).val();
        Zotero.state.pathVars['itemType'] = itemType;
        Zotero.state.pushState();
    });
    
    Zotero.state.bindTagLinks(container);
};

//TODO: this some other way, and probably trigger something so the item widget will reset
/*
Zotero.ui.cancelItemEdit = function(e){
    Zotero.state.clearUrlVars(['itemKey', 'collectionKey', 'tag', 'q']);
    Zotero.state.pushState();
};
*/

/*Zotero.ui.widgets.itemChildren = {};

Zotero.ui.widgets.itemChildren.init = function(el){
    Z.debug('itemChildren init', 3);
    var library = Zotero.ui.getAssociatedLibrary(el);
    var container = J(el);
    
    library.listen("displayedItemChanged uploadSuccessful showChildren", Zotero.ui.widgets.itemChildren.refreshChildren, {widgetEl:el});
};
*/
/**
 * Get an item's children and display summary info
 * @param  {DOM Element} el      element to insert into
 * @param  {string} itemKey key of parent item
 * @return {undefined}
 */
/*
Zotero.ui.widgets.itemChildren.refreshChildren = function(e){
    Z.debug('Zotero.ui.widgets.item.showChildren', 3);
    var widgetEl = J(e.data.widgetEl);
    var library = Zotero.ui.getAssociatedLibrary(widgetEl);
    var itemKey = Zotero.state.getUrlVar('itemKey');
    if(!itemKey){
        Z.debug("No itemKey - " + itemKey, 3);
        widgetEl.empty();
        //TODO: display information about library like client?
        return Promise.reject(new Error("No itemkey - " + itemKey));
    }
    
    var item = library.items.getItem(itemKey);
    
    Zotero.ui.showSpinner(widgetEl);
    var p = item.getChildren(library)
    .then(function(childItems){
        var container = widgetEl;
        container.html( J('#childitemsTemplate').render({childItems:childItems}) );
        Zotero.state.bindItemLinks(container);
    })
    .catch(Zotero.catchPromiseError);
    return p;
};

*/

Zotero.ui.widgets.librarysettingsdialog = {};

Zotero.ui.widgets.librarysettingsdialog.init = function(el){
    Z.debug("librarysettingsdialog widget init", 3);
    var library = Zotero.ui.getAssociatedLibrary(el);
    
    library.listen("librarySettingsDialog", Zotero.ui.widgets.librarysettingsdialog.show, {widgetEl: el});
};

Zotero.ui.widgets.librarysettingsdialog.show = function(e){
    Z.debug("librarysettingsdialog.show", 3);
    var triggeringEl = J(e.triggeringElement);
    
    var widgetEl = J(e.data['widgetEl']).empty();
    widgetEl.html( J("#librarysettingsdialogTemplate").render({'columnFields': Zotero.Library.prototype.displayableColumns},
                                                               {'fieldMap': Zotero.localizations.fieldMap,
                                                               'topString' : 'Top String'
                                                                } ));
    var dialogEl = widgetEl.find(".library-settings-dialog");
    
    dialogEl.find(".display-column-field-title").prop('checked', true).prop('disabled', true);
    
    var library = Zotero.ui.getEventLibrary(e);
    var listDisplayedFields = library.preferences.getPref('listDisplayedFields');
    var itemsPerPage = library.preferences.getPref('itemsPerPage');
    var showAutomaticTags = library.preferences.getPref('showAutomaticTags');
    //var listDisplayedFields = Zotero.preferences.getPref('listDisplayedFields');
    J.each(listDisplayedFields, function(index, value){
        var classstring = '.display-column-field-' + value;
        dialogEl.find(classstring).prop('checked', true);
    });
    J("#items-per-page").val(itemsPerPage);
    J("#show-automatic-tags").prop('checked', showAutomaticTags);
    
    var submitFunction = J.proxy(function(){
        var showFields = [];
        dialogEl.find(".library-settings-form").find('input.display-column-field:checked').each(function(){
            showFields.push(J(this).val());
        });
        
        var itemsPerPage = parseInt(dialogEl.find("#items-per-page").val(), 10);
        var showAutomaticTags = dialogEl.find("#show-automatic-tags:checked").length > 0 ? true : false;
        
        library.preferences.setPref('listDisplayedFields', showFields);
        library.preferences.setPref('itemsPerPage', itemsPerPage);
        library.preferences.setPref('showAutomaticTags', showAutomaticTags);
        library.preferences.persist();
        
        Zotero.preferences.setPref('listDisplayedFields', showFields);
        Zotero.preferences.setPref('itemsPerPage', itemsPerPage);
        Zotero.preferences.setPref('showAutomaticTags', showAutomaticTags);
        Zotero.preferences.persist();
        
        library.trigger("displayedItemsChanged");
        library.trigger("tagsChanged");
        
        Zotero.ui.closeDialog(dialogEl);
    }, this);
    
    dialogEl.find(".saveButton").on("click", submitFunction);
    Zotero.ui.dialog(dialogEl, {});
};



Zotero.ui.widgets.newItem = {};

Zotero.ui.widgets.newItem.init = function(el){
    Z.debug("newItem eventfulwidget init", 3);
    var library = Zotero.ui.getAssociatedLibrary(el);
    
    var widgetEl = J(el);
    library.listen("newItem", Zotero.ui.widgets.newItem.freshitemcallback, {widgetEl: el});
    library.listen("itemTypeChanged", Zotero.ui.widgets.newItem.changeItemType, {widgetEl: el});
    library.listen("createItem", Zotero.ui.widgets.item.saveItemCallback, {widgetEl: el});
    widgetEl.on('change', 'select.itemType', function(e){
        library.trigger('itemTypeChanged', {triggeringElement:el});
    });
};

Zotero.ui.widgets.newItem.freshitemcallback = function(e){
    Z.debug('Zotero eventful new item', 3);
    var widgetEl = e.data.widgetEl;
    var el = widgetEl;
    var triggeringEl = J(e.triggeringElement);
    var itemType = triggeringEl.data("itemtype");
    
    var newItem = new Zotero.Item();
    
    return newItem.initEmpty(itemType)
    .then(function(item){
        Zotero.ui.unassociatedItemForm(widgetEl, item);
    },
    function(response){
        Z.error(response);
        Zotero.ui.jsNotificationMessage("Error loading item template", 'error');
        Z.debug(response);
        Z.debug(response.jqxhr.statusCode);
    });
};

Zotero.ui.unassociatedItemForm = function(el, item){
    Z.debug("Zotero.ui.unassociatedItem", 3);
    Z.debug(item, 3);
    var container = J(el);
    var library = Zotero.ui.getAssociatedLibrary(el);
    
    //make alphabetical itemTypes list
    var itemTypes = [];
    J.each(Zotero.Item.prototype.typeMap, function(key, val){
        itemTypes.push(key);
    });
    itemTypes.sort();
    Z.debug(itemTypes);
    
    return Zotero.Item.prototype.getCreatorTypes(item.apiObj.data.itemType)
    .then(function(itemCreatorTypes){
        container.empty();
        if(item.apiObj.data.itemType == 'note'){
            var parentKey = Zotero.state.getUrlVar('parentKey');
            if(parentKey){
                item.parentKey = parentKey;
            }
            container.append( J('#editnoteformTemplate').render({item:item,
                                         itemKey:item.get('key')
                                         }) );
            
            Zotero.ui.init.rte('default');
        }
        else {
            container.append(J('#itemformTemplate').render( {item:item,
                                        library: library,
                                        itemKey:item.get('key'),
                                        creatorTypes:itemCreatorTypes,
                                        itemTypes: itemTypes,
                                        citable:true,
                                        saveable:false
                                        }
                                        ) );
            if(item.apiObj.tags.length === 0){
                Zotero.ui.widgets.item.addTag(container, false);
            }
            //Zotero.ui.init.tagButtons();
        }
        
        container.find(".directciteitembutton").on('click', function(e){
            Zotero.ui.updateItemFromForm(item, container.find("form"));
            library.trigger('citeItems', {"zoteroItems": [item]});
        } );
        /*
        container.on("click", "button.switch-two-field-creator-link", Zotero.ui.callbacks.switchTwoFieldCreators);
        container.on("click", "button.switch-single-field-creator-link", Zotero.ui.callbacks.switchSingleFieldCreator);
        container.on("click", "button.remove-creator-link", Zotero.ui.removeCreator);
        container.on("click", "button.add-creator-link", Zotero.ui.addCreator);
        */
        
        Z.debug("Setting newitem data on container");
        Z.debug(item);
        Z.debug(container);
        container.data('item', item);
        
        Zotero.eventful.initTriggers(container);
    }).catch(Zotero.catchPromiseError);
    
};

Zotero.ui.widgets.newItem.changeItemType = function(e){
    var widgetEl = Zotero.ui.parentWidgetEl(e);
    Z.debug(widgetEl.length);
    var itemType = widgetEl.find("select.itemType").val();
    Z.debug("newItemType:" + itemType);
    
    //TODO: save values from current item and put them into new item
    var oldItem = widgetEl.data('item');
    Zotero.ui.updateItemFromForm(oldItem, widgetEl.find("form"));
    var newItem = new Zotero.Item();
    //newItem.libraryType = library.libraryType;
    //newItem.libraryID = library.libraryID;
    return newItem.initEmpty(itemType)
    .then(function(item){
        Zotero.ui.translateItemType(oldItem, item);
        Zotero.ui.unassociatedItemForm(widgetEl, item);
    },
    function(response){
        Z.error(response);
        Zotero.ui.jsNotificationMessage("Error loading item template", 'error');
    });
};

Zotero.ui.translateItemType = function(firstItem, newItem){
    Z.debug("Zotero.ui.translateItemType");
    J.each(Zotero.Item.prototype.fieldMap, function(field, val){
        if( (field != "itemType") && firstItem.apiObj.hasOwnProperty(field) && newItem.apiObj.hasOwnProperty(field)){
            Z.debug("transferring value for " + field + ": " + firstItem.get(field));
            newItem.set(field, firstItem.get(field));
        }
    });
};


Zotero.ui.widgets.syncedItems = {};

Zotero.ui.widgets.syncedItems.init = function(el){
    Z.debug("syncedItems widget init", 3);
    var library = Zotero.ui.getAssociatedLibrary(el);
    
    library.listen("changeItemSorting", Zotero.ui.callbacks.resortItems, {widgetEl: el});
    
    //listen for local items dirty and push if we have a connection
    library.listen("localItemsChanged", Zotero.ui.widgets.syncedItems.syncItems, {widgetEl: el});
    //listen for request to update remote items
    library.listen("remoteItemsRequested", Zotero.ui.widgets.syncedItems.syncItems, {widgetEl: el});
    library.listen("syncLibrary", Zotero.ui.widgets.syncedItems.syncItems, {widgetEl: el});
    //listen for request to display different items
    
    library.listen("displayedItemsChanged", Zotero.ui.widgets.syncedItems.updateDisplayedItems, {widgetEl: el});
    //library.listen("displayedItemsUpdated", Zotero.ui.widgets.syncedItems.displayItems, {widgetEl: el});
    
    library.listen("cachedDataLoaded", Zotero.ui.widgets.syncedItems.syncItems, {widgetEl: el});
    
    //set up sorting on header clicks
    var container = J(el);
    //container.on('click', ".field-table-header", Zotero.ui.callbacks.resortItemsLocal);
    
    Zotero.state.bindItemLinks(container);
    
    //check/uncheck all boxes in items table when master checkbox is toggled
    container.on('change', ".itemlist-editmode-checkbox.all-checkbox", function(e){
        J(".itemlist-editmode-checkbox").prop('checked', J(".itemlist-editmode-checkbox.all-checkbox").prop('checked'));
        //library.trigger('controlPanelContextChange');
        library.trigger("selectedItemsChanged");
    });
    
    //init itemkey-checkbox to enable/disable buttons that require something being selected
    container.on('change', "input.itemKey-checkbox", function(e){
        //library.trigger('controlPanelContextChange');
        var selectedItemKeys = [];
        J("input.itemKey-checkbox:checked").each(function(index, el){
            selectedItemKeys.push(J(el).data('itemkey'));
        });
        library.trigger("selectedItemsChanged", {selectedItemKeys: selectedItemKeys});
    });
    
    Zotero.ui.widgets.syncedItems.bindPaginationLinks(container);
    library.trigger("displayedItemsChanged");
};

Zotero.ui.widgets.syncedItems.syncItems = function(event){
    Zotero.debug("Zotero eventful syncItems", 3);
    var widgetEl = J(event.data.widgetEl);
    
    //get Zotero.Library object if already bound to element
    var library = Zotero.ui.getAssociatedLibrary(widgetEl);
    
    //sync items if loaded from cache but not synced
    return library.loadUpdatedItems()
    .then(function(){
        //Zotero.state.doneLoading(widgetEl);
        library.trigger("libraryItemsUpdated");
        library.trigger("displayedItemsChanged");
    }).catch(Zotero.catchPromiseError);
};

Zotero.ui.widgets.syncedItems.bindPaginationLinks = function(container){
    container.on('click', "#start-item-link", function(e){
        e.preventDefault();
        Zotero.state.pathVars['itemPage'] = '';
        Zotero.state.pushState();
    });
    container.on('click', "#prev-item-link", function(e){
        e.preventDefault();
        var itemPage = Zotero.state.getUrlVar('itemPage') || '1';
        itemPage = parseInt(itemPage, 10);
        var newItemPage = itemPage - 1;
        Zotero.state.pathVars['itemPage'] = newItemPage;
        Zotero.state.pushState();
    });
    container.on('click', "#next-item-link", function(e){
        e.preventDefault();
        var itemPage = Zotero.state.getUrlVar('itemPage') || '1';
        itemPage = parseInt(itemPage, 10);
        var newItemPage = itemPage + 1;
        Zotero.state.pathVars['itemPage'] = newItemPage;
        Zotero.state.pushState();
    });
    container.on('click', "#last-item-link", function(e){
        e.preventDefault();
        Z.debug("last-item-link clickbind", 4);
        var pagehref = J(e.currentTarget).attr('href');
        var pathVars = Zotero.state.parsePathVars(pagehref);
        var lastItemPage = pathVars.itemPage;
        Zotero.state.pathVars['itemPage'] = lastItemPage;
        Zotero.state.pushState();
    });
};

Zotero.ui.widgets.syncedItems.updateDisplayedItems = function(event){
    Z.debug("widgets.syncedItems.updateDisplayedItems", 3);
    //- determine what config applies that we need to find items for
    //- find the appropriate items in the store, presumably with indexedDB queries
    //- pull out x items that match (or since we have them locally anyway, just display them all)
    var widgetEl = J(event.data.widgetEl);
    var library = Zotero.ui.getAssociatedLibrary(widgetEl);
    Z.debug(library);
    var newConfig = Zotero.ui.getItemsConfig(library);
    
    var displayParams = Zotero.state.getUrlVars();
    library.buildItemDisplayView(displayParams)
    .then(function(displayItemsArray){
        Z.debug('displayingItems in promise callback');
        Z.debug(displayItemsArray);
        widgetEl.empty();
        Zotero.ui.widgets.items.displayItems(widgetEl, newConfig, displayItemsArray);
        Zotero.eventful.initTriggers();    
    }).catch(Zotero.catchPromiseError);
};

Zotero.ui.widgets.tags = {};

Zotero.ui.widgets.tags.init = function(el){
    Z.debug("tags widget init", 3);
    var library = Zotero.ui.getAssociatedLibrary(el);
    
    library.listen("tagsDirty", Zotero.ui.widgets.tags.syncTags, {widgetEl: el});
    library.listen("cachedDataLoaded", Zotero.ui.widgets.tags.syncTags, {widgetEl: el});
    library.listen("tagsChanged libraryTagsUpdated selectedTagsChanged", Zotero.ui.widgets.tags.rerenderTags, {widgetEl: el});
    
    var container = J(el);
    
    //initialize binds for widget
    Zotero.state.bindTagLinks(container);
    //TODO: make sure tag autocomplete works when editing items
    //add tag to item and stop event propogation when tag is selected
    //from autocomplete on an item
    
    //bind tag autocomplete filter in tag widget
    container.on('keyup', "#tag-filter-input", Zotero.ui.widgets.tags.filterTags);
};

Zotero.ui.widgets.tags.syncTags = function(evt){
    Z.debug('Zotero.ui.widgets.tags.syncTags', 3);
    var widgetEl = J(evt.data.widgetEl);
    var loadingPromise = widgetEl.data('loadingPromise');
    if(loadingPromise){
        var p = widgetEl.data('loadingPromise');
        return p.then(function(){
            return Zotero.ui.widgets.tags.syncTags(evt);
        }).catch(Zotero.catchPromiseError);
    }
    
    var checkCached = evt.data.checkCached;
    if(checkCached !== false){
        checkCached = true; //default to using the cache
    }
    
    Zotero.ui.showSpinner(widgetEl.find('div.loading'));
    
    //get Zotero.Library object if already bound to element
    var library = Zotero.ui.getAssociatedLibrary(widgetEl);
    //clear tags if we're explicitly not using cached tags
    if(checkCached === false){
        library.tags.clear();
    }
    
    //cached tags are preloaded with library if the cache is enabled
    //this function shouldn't be triggered until that has already been done
    loadingPromise = library.loadUpdatedTags()
    .then(function(){
        Z.debug("syncTags done. clearing loading div");
        widgetEl.find('.loading').empty();
        library.trigger("libraryTagsUpdated");
        //remove loadingPromise
        widgetEl.removeData('loadingPromise');
    },
    function(error){
        Z.error("syncTags failed. showing local data and clearing loading div");
        //sync failed, but we still have some local data, so show that
        library.trigger("libraryTagsUpdated");
        widgetEl.find('.loading').empty();
        //remove loadingPromise
        widgetEl.removeData('loadingPromise');
        Zotero.ui.jsNotificationMessage("There was an error loading tags. Some tags may not have been updated.", 'notice');
    });
    
    widgetEl.data('loadingPromise', loadingPromise);
    return loadingPromise;
};

Zotero.ui.widgets.tags.rerenderTags = function(event){
    Zotero.debug("Zotero eventful rerenderTags", 3);
    var widgetEl = J(event.data.widgetEl);
    
    // put the selected tags into an array
    var selectedTags = Zotero.state.getUrlVar('tag');
    if(!J.isArray(selectedTags)){
        if(selectedTags) {
            selectedTags = [selectedTags];
        }
        else {
            selectedTags = [];
        }
    }
    
    widgetEl.children(".loading").empty();
    var library = Zotero.ui.getAssociatedLibrary(widgetEl);
    var plainList = library.tags.plainTagsList(library.tags.tagsArray);
    Zotero.ui.widgets.tags.displayTagsFiltered(widgetEl, library, plainList, selectedTags);
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
Zotero.ui.widgets.tags.displayTagsFiltered = function(el, library, matchedTagStrings, selectedTagStrings){
    Zotero.debug("Zotero.ui.widgets.tags.displayTagsFiltered", 3);
    Z.debug(selectedTagStrings, 4);
    var curPreString = J("#tag-filter-input").val();
    var jel = J(el);
    var libtags = library.tags;
    var tagColors = library.preferences.getPref("tagColors");
    if(!tagColors) tagColors = [];
    var coloredTags = [];
    var tagColorStrings = [];
    J.each(tagColors, function(index, tagColor){
        tagColorStrings.push(tagColor.name.toLowerCase());
        var coloredTag = libtags.getTag(tagColor.name);
        if(coloredTag){
            coloredTag.color = tagColor.color;
            coloredTags.push(coloredTag);
        }
    });
    
    var filteredTags = [];
    var selectedTags = [];
    J.each(matchedTagStrings, function(index, matchedString){
        if(libtags.tagObjects[matchedString] && 
            (libtags.tagObjects[matchedString].apiObj.meta.numItems > 0) &&
            (J.inArray(matchedString, selectedTagStrings) == (-1)) &&
            (J.inArray(matchedString, tagColorStrings) == (-1)) ) {
            filteredTags.push(libtags.tagObjects[matchedString]);
        }
    });
    J.each(selectedTagStrings, function(index, selectedString){
        if(libtags.tagObjects[selectedString]){
            selectedTags.push(libtags.tagObjects[selectedString]);
        }
    });
    
    var tagListEl = J("#tags-list").empty();
    J("#colored-tags-list").replaceWith(J('#coloredtaglistTemplate').render({tags:coloredTags}));
    J("#selected-tags-list").replaceWith(J('#tagunorderedlistTemplate').render({tags:selectedTags, id:'selected-tags-list'}));
    J("#tags-list").replaceWith(J('#tagunorderedlistTemplate').render({tags:filteredTags, id:'tags-list'}));
};

Zotero.ui.widgets.tags.filterTags = function(e){
    Z.debug("Zotero.ui.widgets.tags.filterTags", 3);
    var library = Zotero.ui.getAssociatedLibrary(J('#tag-filter-input').closest('.eventfulwidget'));
    var libraryTagsPlainList = library.tags.plainList;
    var matchingTagStrings = Zotero.utils.matchAnyAutocomplete(J('#tag-filter-input').val(), libraryTagsPlainList);
    Zotero.ui.widgets.tags.displayTagsFiltered(J('#tags-list-div'), library, matchingTagStrings, []);
    Z.debug(matchingTagStrings, 4);
};



Zotero.ui.widgets.updateCollectionDialog = {};

Zotero.ui.widgets.updateCollectionDialog.init = function(el){
    Z.debug("updatecollectionsdialog widget init", 3);
    var library = Zotero.ui.getAssociatedLibrary(el);
    
    library.listen("updateCollectionDialog", Zotero.ui.widgets.updateCollectionDialog.show, {widgetEl: el});
};

Zotero.ui.widgets.updateCollectionDialog.show = function(evt){
    Z.debug("updateCollectionDialog.show", 3);
    
    var triggeringEl = J(evt.triggeringElement);
    var library = Zotero.ui.getAssociatedLibrary(triggeringEl);
    var ncollections = library.collections.nestedOrderingArray();
    
    var widgetEl = J(evt.data.widgetEl).empty();
    
    widgetEl.html( J("#updatecollectiondialogTemplate").render({ncollections:ncollections}) );
    var dialogEl = widgetEl.find(".update-collection-dialog");
    
    var currentCollectionKey = Zotero.state.getUrlVar('collectionKey');
    var currentCollection = library.collections.getCollection(currentCollectionKey);
    var currentParentCollectionKey = currentCollection.parentCollection;
    dialogEl.find(".update-collection-parent-select").val(currentParentCollectionKey);
    dialogEl.find(".updated-collection-title-input").val(currentCollection.get("title"));
    
    var saveFunction = function(){
        var newCollectionTitle = dialogEl.find("input.updated-collection-title-input").val() || "Untitled";
        var newParentCollectionKey = dialogEl.find(".update-collection-parent-select").val();
        
        var collection =  currentCollection;
        if(!collection){
            Zotero.ui.jsNotificationMessage("Selected collection not found", 'error');
            return false;
        }
        collection.update(newCollectionTitle, newParentCollectionKey)
        .then(function(response){
            Zotero.ui.jsNotificationMessage("Collection Saved", 'confirm');
            library.collections.dirty = true;
            library.collections.initSecondaryData();
            library.trigger('libraryCollectionsUpdated');
            Zotero.state.pushState(true);
            Zotero.ui.closeDialog(dialogEl);
        }).catch(Zotero.catchPromiseError);
    };
    
    dialogEl.find(".updateButton").on('click', saveFunction);
    Zotero.ui.dialog(dialogEl,{});
    dialogEl.find(".updated-collection-title-input").select();
    
    return false;
};



Zotero.ui.widgets.uploadDialog = {};

Zotero.ui.widgets.uploadDialog.init = function(el){
    Z.debug("uploaddialog widget init", 3);
    var widgetEl = J(el);
    var library = Zotero.ui.getAssociatedLibrary(el);
    
    library.listen("uploadAttachment", Zotero.ui.widgets.uploadDialog.show, {widgetEl: el, library: library});
    library.listen("upload", Zotero.ui.widgets.uploadDialog.upload, {widgetEl: el, library: library});
    
    widgetEl.on('click', '.uploadButton', function(){
        library.trigger('upload');
    });
};

Zotero.ui.widgets.uploadDialog.show = function(e){
    Z.debug("uploadDialog.show", 3);
    
    var triggeringEl = J(e.triggeringElement);
    var library = Zotero.ui.getEventLibrary(e);
    var widgetEl = J(e.data['widgetEl']).empty();
    
    widgetEl.html( J("#attachmentuploadTemplate").render({}) );
    var dialogEl = widgetEl.find(".upload-attachment-dialog");
    
    Zotero.ui.dialog(dialogEl, {});
    
    var handleFiles = function(files){
        Z.debug("attachmentUpload handleFiles", 3);
        
        if(typeof files == 'undefined' || files.length === 0){
            return false;
        }
        var file = files[0];
        
        Zotero.file.getFileInfo(file)
        .then(function(fileInfo){
            Z.debug(fileInfo);
            widgetEl.find(".attachmentuploadfileinfo").data('fileInfo', fileInfo);
            widgetEl.find("input.upload-file-title-input").val(fileInfo.filename);
            widgetEl.find("td.uploadfilesize").html(fileInfo.filesize);
            widgetEl.find("td.uploadfiletype").html(fileInfo.contentType);
            //widgetEl.find("#attachmentuploadfileinfo .uploadfilemd5").html(fileInfo.md5);
            widgetEl.find(".droppedfilename").html(fileInfo.filename);
        });
        return;
    };
    
    dialogEl.find("#fileuploaddroptarget").on('dragenter dragover', function(e){
        e.stopPropagation();
        e.preventDefault();
    });
    
    dialogEl.find("#fileuploaddroptarget").on('drop', function(je){
        Z.debug("fileuploaddroptarget drop callback", 3);
        je.stopPropagation();
        je.preventDefault();
        //clear file input so drag/drop and input don't show conflicting information
        widgetEl.find(".fileuploadinput").val('');
        var e = je.originalEvent;
        var dt = e.dataTransfer;
        var files = dt.files;
        handleFiles(files);
    });
    
    dialogEl.find("#fileuploadinput").on('change', function(je){
        Z.debug("fileuploaddroptarget callback 1", 3);
        je.stopPropagation();
        je.preventDefault();
        var files = J(this).get(0).files;
        handleFiles(files);
    });
    
    Zotero.eventful.initTriggers(widgetEl);
};

Zotero.ui.widgets.uploadDialog.upload = function(evt){
    Z.debug("uploadFunction", 3);
    var widgetEl = J(evt.data['widgetEl']);
    var library = evt.data['library'];
    
    //callback for when everything in the upload form is filled
    //grab file blob
    //grab file data given by user
    //create or modify attachment item
    //Item.uploadExistingFile or uploadChildAttachment
    
    var dialogEl = widgetEl.find('div.upload-attachment-dialog');
    var fileInfo = dialogEl.find("#attachmentuploadfileinfo").data('fileInfo');
    var specifiedTitle = dialogEl.find("#upload-file-title-input").val();
    
    var progressCallback = function(e){
        Z.debug('fullUpload.upload.onprogress', 3);
        var percentLoaded = Math.round((e.loaded / e.total) * 100);
        Z.debug("Upload progress event:" + e.loaded + " / " + e.total + " : " + percentLoaded + "%", 3);
        widgetEl.find("#uploadprogressmeter").val(percentLoaded);
    };
    
    //show spinner while working on upload
    Zotero.ui.showSpinner(widgetEl.find('.fileuploadspinner'));
    
    //upload new copy of file if we're modifying an attachment
    //create child and upload file if we're modifying a top level item
    var itemKey = Zotero.state.getUrlVar('itemKey');
    var item = library.items.getItem(itemKey);
    var uploadPromise;
    
    if(!item.get("parentItem")){
        Z.debug("no parentItem", 3);
        //get template item
        var childItem = new Zotero.Item();
        childItem.associateWithLibrary(library);
        uploadPromise = childItem.initEmpty('attachment', 'imported_file')
        .then(function(childItem){
            Z.debug("templateItemDeferred callback", 3);
            childItem.set('title', specifiedTitle);
            
            return item.uploadChildAttachment(childItem, fileInfo, progressCallback);
        });
    }
    else if(item.get('itemType') == 'attachment' && item.get("linkMode") == 'imported_file') {
        Z.debug("imported_file attachment", 3);
        uploadPromise = item.uploadFile(fileInfo, progressCallback);
    }
    
    uploadPromise.then(function(){
        Z.debug("uploadSuccess", 3);
        library.trigger("uploadSuccessful");
    }).catch(Zotero.ui.widgets.uploadDialog.failureHandler)
    .then(function(){
        Zotero.ui.closeDialog(dialogEl);
    });

};

Zotero.ui.widgets.uploadDialog.failureHandler = function(failure){
    Z.debug("Upload failed", 3);
    Z.debug(failure, 3);
    Zotero.ui.jsNotificationMessage("There was a problem uploading your file.", 'error');
    switch(failure.code){
        case 400:
            Zotero.ui.jsNotificationMessage("Bad Input. 400", 'error');
            break;
        case 403:
            Zotero.ui.jsNotificationMessage("You do not have permission to edit files", 'error');
            break;
        case 409:
            Zotero.ui.jsNotificationMessage("The library is currently locked. Please try again in a few minutes.", 'error');
            break;
        case 412:
            Zotero.ui.jsNotificationMessage("File conflict. Remote file has changed", 'error');
            break;
        case 413:
            Zotero.ui.jsNotificationMessage("Requested upload would exceed storage quota.", 'error');
            break;
        case 428:
            Zotero.ui.jsNotificationMessage("Precondition required error", 'error');
            break;
        case 429:
            Zotero.ui.jsNotificationMessage("Too many uploads pending. Please try again in a few minutes", 'error');
            break;
        default:
            Zotero.ui.jsNotificationMessage("Unknown error uploading file. " + failure.code, 'error');
    }
};


Zotero.ui.widgets.libraryPreloader = {};

//dedicated widget to preload library on init so we don't attempt to do that
//in every other widget
Zotero.ui.widgets.libraryPreloader.init = function(el){
    Z.debug("preloader init", 3);
    var library = Zotero.ui.getAssociatedLibrary(el);
    library.loadSettings();
    library.listen("deleteIdb", function(){
        library.idbLibrary.deleteDB();
    });
    library.listen("indexedDBError", function(){
    	Zotero.ui.jsNotificationMessage("There was an error initializing your library. Some data may not load properly.", 'notice');
    })
};


Zotero.ui.widgets.filterGuide = {};

Zotero.ui.widgets.filterGuide.init = function(el){
    Z.debug('widgets.filterGuide.init', 3);
    var library = Zotero.ui.getAssociatedLibrary(el);
    
    library.listen("displayedItemsChanged", Zotero.ui.widgets.filterGuide.refreshFilters, {widgetEl: el});
    library.listen("displayedItemChanged", Zotero.ui.widgets.filterGuide.refreshFilters, {widgetEl: el});
    library.listen("updateFilterGuide", Zotero.ui.widgets.filterGuide.refreshFilters, {widgetEl: el});
    library.listen("libraryCollectionsUpdated", Zotero.ui.widgets.filterGuide.refreshFilters, {widgetEl: el});
    library.listen("clearFilter", Zotero.ui.widgets.filterGuide.clearFilter, {widgetEl: el});
};

Zotero.ui.widgets.filterGuide.refreshFilters = function(event){
    Z.debug('widgets.filterGuide.refreshFilters', 3);
    var widgetEl = event.data.widgetEl;
    var el = widgetEl;
    var jel = J(el);
    var library = Zotero.ui.getAssociatedLibrary(el);
    
    var displayConfig = Zotero.ui.getItemsConfig(library);
    var filterData = {};
    if(displayConfig['collectionKey']){
        filterData['collection'] = library.collections.getCollection(displayConfig['collectionKey']);
    }
    if(displayConfig['tag']){
        filterData['tag'] = displayConfig['tag'];
    }
    if(displayConfig['q']){
        filterData['search'] = displayConfig['q'];
    }
    
    filterData['library'] = library;
    jel.empty();
    jel.append( J('#filterguideTemplate').render(filterData) );
    Zotero.eventful.initTriggers(widgetEl);
};

Zotero.ui.widgets.filterGuide.clearFilter = function(event){
    Z.debug('widgets.filterGuide.clearFilter', 3);
    var widgetEl = J(event.data.widgetEl);
    var triggeringEl = J(event.triggeringElement);
    var library = Zotero.ui.getAssociatedLibrary(widgetEl);
    
    var collectionKey = triggeringEl.data('collectionkey');
    var tag = triggeringEl.data('tag');
    var query = triggeringEl.data('query');
    
    if(collectionKey){
        Zotero.state.unsetUrlVar('collectionKey');
    }
    if(tag){
        Zotero.state.toggleTag(tag);
    }
    if(query){
        library.trigger('clearLibraryQuery');
        return;
        //Zotero.ui.clearLibraryQuery();
    }
    Zotero.state.pushState();
};


Zotero.ui.widgets.progressModal = {};

Zotero.ui.widgets.progressModal.init = function(el){
    Z.debug("progressModal widget init", 3);
    Zotero.listen("progressStart", Zotero.ui.widgets.progressModal.show, {widgetEl: el});
    Zotero.listen("progressUpdate", Zotero.ui.widgets.progressModal.update, {widgetEl: el});
    Zotero.listen("progressDone", Zotero.ui.widgets.progressModal.done, {widgetEl: el});
};

Zotero.ui.widgets.progressModal.show = function(e){
    Z.debug("progressModal.show", 3);
    var triggeringEl = J(e.triggeringElement);
    var widgetEl = J(e.data['widgetEl']).empty();
    
    widgetEl.html( J("#progressModalTemplate").render({progressTitle: e.progressTitle}) );
    var dialogEl = widgetEl.find("#progress-modal-dialog");
    Zotero.ui.dialog(dialogEl, {});
    
};

Zotero.ui.widgets.progressModal.update = function(e){
    Z.debug("progressModal.update", 3);
    var widgetEl = J(e.data['widgetEl']);
    if(!e.progress){
        throw new Error("No progress set on progressUpdate event");
    }
    var updatedProgress = e.progress;
    
    widgetEl.find("progress").prop("value", updatedProgress);
};

Zotero.ui.widgets.progressModal.done = function(e){
    Z.debug("progressModal.done", 3);
    var widgetEl = J(e.data['widgetEl']);
    var dialogEl = widgetEl.find("#progress-modal-dialog");
    Zotero.ui.closeDialog(dialogEl);
};


Zotero.ui.widgets.sendToLibraryDialog = {};

Zotero.ui.widgets.sendToLibraryDialog.init = function(el){
    Z.debug("sendToLibraryDialog widget init", 3);
    var library = Zotero.ui.getAssociatedLibrary(el);
    
    library.listen("sendToLibraryDialog", Zotero.ui.widgets.sendToLibraryDialog.show, {widgetEl: el});
    
};

Zotero.ui.widgets.sendToLibraryDialog.show = function(evt){
    Zotero.debug("Zotero.ui.widgets.sendToLibraryDialog.show", 3);
    var widgetEl = J(evt.data.widgetEl);
    var library = Zotero.ui.getAssociatedLibrary(widgetEl);
    if(!Zotero.config.loggedIn){
        throw new Error("no logged in userID. Required for groupsList widget");
    }
    var userID = Zotero.config.loggedInUserID;
    var personalLibraryString = 'u' + userID;
    
    var memberGroups = library.groups.fetchUserGroups(userID)
    .then(function(response){
        Z.debug("got member groups", 3);
        Z.debug(response);
        var memberGroups = response.fetchedGroups;
        var writableLibraries = [{name:'My Library', libraryString:personalLibraryString}];
        for(var i = 0; i < memberGroups.length; i++){
            if(memberGroups[i].isWritable(userID)){
                var libraryString = 'g' + memberGroups[i].get('id');
                writableLibraries.push({
                    name: memberGroups[i].get('name'),
                    libraryString: libraryString,
                });
            }
        }
        widgetEl.html( J("#sendToLibraryDialogTemplate").render({destinationLibraries: writableLibraries}) );
        var dialogEl = widgetEl.find(".send-to-library-dialog");
        
        var sendFunction = function(){
            Z.debug("sendToLibrary callback", 3);
            //instantiate destination library
            var targetLibrary = dialogEl.find(".destination-library-select").val();
            Z.debug("move to: " + targetLibrary, 3);
            var destLibConfig = Zotero.utils.parseLibString(targetLibrary);
            destLibrary = new Zotero.Library(destLibConfig.libraryType, destLibConfig.libraryID);
            Zotero.libraries[targetLibrary] = destLibrary;
            
            //get items to send
            var itemKeys = Zotero.state.getSelectedItemKeys();
            if(itemKeys.length === 0){
                Zotero.ui.jsNotificationMessage("No items selected", 'notice');
                Zotero.ui.closeDialog(dialogEl);
                return false;
            }
            
            var sendItems = library.items.getItems(itemKeys);
            library.sendToLibrary(sendItems, destLibrary)
            .then(function(foreignItems){
                Zotero.ui.jsNotificationMessage("Items sent to other library", 'notice');
            }).catch(function(response){
                Z.debug(response);
                Zotero.ui.jsNotificationMessage("Error sending items to other library", 'notice');
            });
            Zotero.ui.closeDialog(dialogEl);
            return false;
        };
        
        dialogEl.find(".sendButton").on('click', sendFunction);
        
        Zotero.ui.dialog(dialogEl, {});
        
    }).catch(function(err){
        Z.error(err);
        Z.error(err.message);
    });
    
};
/*
Zotero.ui.widgets.sendToLibraryDialog.render = function(el, groups){
    J(el).empty().append( J("#groupslistTemplate").render({groups:groups}));
};

Zotero.ui.widgets.sendToLibraryDialog.send = function(evt){
    Zotero.debug("Zotero.ui.widgets.groupsList.sendToGroup", 3);
    var widgetEl = evt.data.widgetEl;
    var library = Zotero.ui.getAssociatedLibrary(widgetEl);
    
};
*/

Zotero.ui.widgets.searchbox = {};

Zotero.ui.widgets.searchbox.init = function(el){
    Z.debug("Zotero.eventful.init.searchbox", 3);
    var library = Zotero.ui.getAssociatedLibrary(el);
    var container = J(el);
    
    library.listen('clearLibraryQuery', Zotero.ui.widgets.searchbox.clearLibraryQuery, {widgetEl:el});
    
    //set initial state of search input to url value
    if(Zotero.state.getUrlVar('q')){
        container.find(".search-query").val(Zotero.state.getUrlVar('q'));
    }
    
    //clear libary query param when field cleared
    var context = 'support';
    if(undefined !== window.zoterojsSearchContext){
        context = zoterojsSearchContext;
    }
    
    //set up search type links
    container.on('click', ".library-search-type-link", function(e){
        e.preventDefault();
        var typeLinks = J(".library-search-type-link").removeClass('selected');
        var selected = J(e.target);
        var selectedType = selected.data('searchtype');
        var searchInput = container.find("input.search-query").data('searchtype', selectedType);
        selected.addClass('selected');
        if(selectedType == 'simple'){
            searchInput.attr('placeholder', 'Search Title, Creator, Year');
        }
        else if(selectedType == 'everything'){
            searchInput.attr('placeholder', 'Search Full Text');
        }
    });
    
    //set up search submit for library
    container.on('submit', "form.library-search", function(e){
        e.preventDefault();
        Z.debug("library-search form submitted", 3);
        Zotero.state.clearUrlVars(['collectionKey', 'tag', 'q', 'qmode']);
        var query = container.find('input.search-query').val();
        var searchType = container.find('input.search-query').data('searchtype');
        if(query !== "" || Zotero.state.getUrlVar('q') ){
            Zotero.state.pathVars['q'] = query;
            if(searchType != "simple"){
                Zotero.state.pathVars['qmode'] = searchType;
            }
            Zotero.state.pushState();
        }
        return false;
    });
    
    container.on('click', '.clear-field-button', function(e){
        J(".search-query").val("").focus();
    });
    
};

Zotero.ui.widgets.searchbox.clearLibraryQuery = function(){
    Zotero.state.unsetUrlVar('q');
    Zotero.state.unsetUrlVar('qmode');
    
    J(".search-query").val("");
    Zotero.state.pushState();
    return;
}



Zotero.ui.widgets.panelContainer = {};

Zotero.ui.widgets.panelContainer.init = function(el){
    Z.debug("panelContainer widget init", 3);
    var library = Zotero.ui.getAssociatedLibrary(el);
    
    library.listen("displayedItemsChanged showItemsPanel", Zotero.ui.widgets.panelContainer.showPanel, {widgetEl: el, panelSelector:"#items-panel"});
    library.listen("showFiltersPanel", Zotero.ui.widgets.panelContainer.showPanel, {widgetEl: el, panelSelector:"#left-panel"});
    library.listen("showItemPanel displayedItemChanged", Zotero.ui.widgets.panelContainer.showPanel, {widgetEl: el, panelSelector:"#item-panel"});
    Zotero.listen("reflow", Zotero.ui.widgets.panelContainer.reflow, {widgetEl: el});
    
    Zotero.ui.widgets.panelContainer.showPanel({data: {widgetEl: el, panelSelector:"#items-panel"}});
    J(window).on('resize', function(){
        Zotero.ui.widgets.panelContainer.reflow({data: {widgetEl: el}} );
    });
    J(el).on('click', '.single-cell-item', function(){
        library.trigger('showItemPanel');
    });
};

Zotero.ui.widgets.panelContainer.reflow = function(evt){
    Zotero.ui.widgets.panelContainer.showPanel({data: {widgetEl: evt.data.widgetEl, panelSelector:"#items-panel"}});
    Zotero.ui.fixTableHeaders(J("#field-table"));
};

Zotero.ui.widgets.panelContainer.showPanel = function(evt){
    Z.debug("panelContainer.showPanel", 3);
    var widgetEl = J(evt.data.widgetEl);
    var selector = evt.data.panelSelector;
    if(selector == "#item-panel" && (!Zotero.state.getUrlVar('itemKey'))){
        Z.debug("item-panel selected with no itemKey", 3);
        selector = "#items-panel";
    }
    Z.debug("selector:" + selector, 3);
    
    var deviceSize = 'xs';
    var displaySections = [];
    switch(true){
        case window.matchMedia("(min-width: 1200px)").matches:
            deviceSize = 'lg';
            widgetEl.find(".panelcontainer-panelcontainer").show()
            .find('.panelcontainer-panel').show();
            break;
        case window.matchMedia("(min-width: 992px)").matches:
            deviceSize = 'md';
            widgetEl.find(".panelcontainer-panelcontainer").show()
            .find('.panelcontainer-panel').show();
            break;
        case window.matchMedia("(min-width: 768px)").matches:
            deviceSize = 'sm';
            widgetEl.find(".panelcontainer-panelcontainer").show()
            .find('.panelcontainer-panel').show();
            if(selector == "#item-panel" || selector == "#items-panel"){
                widgetEl.find(selector).siblings(".panelcontainer-panel").hide();
                widgetEl.find(selector).show();
            }
            break;
        default:
            deviceSize = 'xs';
            widgetEl.find('.panelcontainer-panelcontainer').hide().find('.panelcontainer-panel').hide();
            widgetEl.find(selector).show().closest('.panelcontainer-panelcontainer').show();
    }
    Z.debug("panelContainer calculated deviceSize: " + deviceSize, 3);
    
    widgetEl.find('#panelcontainer-nav li').removeClass('active');
    
    switch(selector){
        case '#collections-panel':
            widgetEl.find('li.collections-nav').addClass('active');
            break;
        case '#left-panel':
            widgetEl.find('li.filters-nav').addClass('active');
            break;
    }
};


Zotero.ui.widgets.chooseSortingDialog = {};

Zotero.ui.widgets.chooseSortingDialog.init = function(el){
    Z.debug("chooseSortingDialog widget init", 3);
    var library = Zotero.ui.getAssociatedLibrary(el);
    
    library.listen("chooseSortingDialog", Zotero.ui.widgets.chooseSortingDialog.show, {widgetEl: el});
};

Zotero.ui.widgets.chooseSortingDialog.show = function(evt){
    Z.debug("chooseSortingDialog.show", 3);
    var widgetEl = J(evt.data.widgetEl).empty();
    var library = Zotero.ui.getAssociatedLibrary(widgetEl);
    
    widgetEl.html( J("#choosesortingdialogTemplate").render({}) );
    var dialogEl = widgetEl.find(".choose-sorting-dialog");
    
    var currentSortField = Zotero.ui.getPrioritizedVariable('order', 'title');
    var currentSortOrder = Zotero.ui.getPrioritizedVariable('sort', 'asc');
    
    dialogEl.find(".sort-column-select").val(currentSortField);
    dialogEl.find(".sort-order-select").val(currentSortOrder);
    
    var saveFunction = function(){
        var newSortField = dialogEl.find(".sort-column-select").val();
        var newSortOrder = dialogEl.find(".sort-order-select").val();
        library.trigger("changeItemSorting", {newSortField:newSortField, newSortOrder:newSortOrder});
        Zotero.ui.closeDialog(dialogEl);
        return false;
    };
    
    dialogEl.find(".saveSortButton").on('click', saveFunction);
    Zotero.ui.dialog(dialogEl, {});
};



Zotero.ui.widgets.imagePreview = {};

//dedicated widget to preload library on init so we don't attempt to do that
//in every other widget
Zotero.ui.widgets.imagePreview.init = function(el){
    var library = Zotero.ui.getAssociatedLibrary(el);
    library.listen('previewImage', Zotero.ui.widgets.imagePreview.show, {widgetEl: el});
};

Zotero.ui.widgets.imagePreview.show = function(evt){
    
};


Zotero.ui.widgets.imageGrabber = {};

//dedicated widget to preload library on init so we don't attempt to do that
//in every other widget
Zotero.ui.widgets.imageGrabber.init = function(el){
    Z.debug("imageGrabber.init", 3)
    var library = Zotero.ui.getAssociatedLibrary(el);
    library.listen('grabImage', Zotero.ui.widgets.imageGrabber.grab, {widgetEl: el});
    library.listen('previewImage', Zotero.ui.widgets.imageGrabber.previewImage, {widgetEl: el});
    library.listen('previewStoredImage', Zotero.ui.widgets.imageGrabber.previewStoredImage, {widgetEl: el});
    
    var displayAsImage = function(file){
        var imgURL = URL.createObjectURL(file);
        J("#preview-image").attr('src', imgURL);
        
    };
    
    var inputEl = J("#capture").on('change', function(){
        Z.debug("capture element changed. displaying image in preview");
        library.trigger('previewImage');
        
    });
    
    //callback for when everything in the upload form is filled
    //grab file blob
    //grab file data given by user
    //create or modify attachment item
    //Item.uploadExistingFile or uploadChildAttachment
    
};

Zotero.ui.widgets.imageGrabber.getFile = function(container){
    return container.find("#capture").get(0).files[0];
};

Zotero.ui.widgets.imageGrabber.previewImage = function(evt){
    Z.debug('imageGrabber.previewImage', 3);
    var widgetEl = J(evt.data['widgetEl']);
    
    var file = Zotero.ui.widgets.imageGrabber.getFile(widgetEl);
    var imgUrl = URL.createObjectURL(file);
    widgetEl.find('#preview-image').attr('src', imgUrl);
    
};

Zotero.ui.widgets.imageGrabber.grab = function(evt){
    Z.debug('imageGrabber.grab', 3);
    var widgetEl = J(evt.data['widgetEl']);
    var library = Zotero.ui.getAssociatedLibrary(widgetEl);
    var file;
    var fileInfo;
    
    var childItem = new Zotero.Item();
    childItem.associateWithLibrary(library);
    childItem.initEmpty('attachment', 'imported_file')
    .then(function(childItem){
        Z.debug("templateItem callback", 3);
        var title = widgetEl.find('#image-grabber-title').val();
        if(!title) title = "Untitled";
        childItem.set('title', title);
        childItem.set('itemKey', Zotero.utils.getKey());
        library.items.addItem(childItem);
        
        return library.idbLibrary.addItems([childItem]);
    }).then(function(){
        Z.debug("added item to idb", 3);
        file = Zotero.ui.widgets.imageGrabber.getFile(widgetEl);
        return Zotero.file.getFileInfo(file);
    }).then(function(fInfo){
        Z.debug("got fileInfo", 3);
        fileInfo = fInfo;
        var fileData = fileInfo;
        //fileData.file = file;
        return library.idbLibrary.setFile(childItem.get('itemKey'), fileData);
    }).then(function(){
        Z.debug("file saved to idb", 3);
    }).catch(Zotero.catchPromiseError);
};

Zotero.ui.widgets.imageGrabber.previewStoredImage = function(evt){
    Z.debug('imageGrabber.previewImage', 3);
    var widgetEl = J(evt.data['widgetEl']);
    var library = Zotero.ui.getAssociatedLibrary(widgetEl);
    var itemKey = evt.itemKey;
    Z.debug("itemKey: " + itemKey);
    
    var previewItem = library.items.getItem(itemKey);
    var previewItemFile = library.idbLibrary.getFile(itemKey)
    .then(function(fileData){
        Z.debug("got Image");
        Z.debug(fileData);
        var b = new Blob([fileData.filedata], {type : fileData.contentType});
        var imgUrl = URL.createObjectURL(b);
        Z.debug(imgUrl);
        widgetEl.find('#preview-image').attr('src', imgUrl);
        window.fileData = fileData;
    }).catch(Zotero.catchPromiseError);
    
};

//Zotero.ui.widgets.imageGrabber.


Zotero.ui.widgets.localItems = {};

Zotero.ui.widgets.localItems.init = function(el){
    Z.debug("localItems widget init", 3);
    var library = Zotero.ui.getAssociatedLibrary(el);
    
    library.listen("changeItemSorting", Zotero.ui.callbacks.resortItems, {widgetEl: el});
    
    //listen for request to display different items
    library.listen("displayedItemsChanged", Zotero.ui.widgets.localItems.updateDisplayedItems, {widgetEl: el});
    library.listen("displayedItemsUpdated", Zotero.ui.widgets.localItems.displayItems, {widgetEl: el});
    library.listen("cachedDataLoaded", Zotero.ui.widgets.localItems.displayItems, {widgetEl: el});
    
    //set up sorting on header clicks
    var container = J(el);
    //container.on('click', ".field-table-header", Zotero.ui.callbacks.resortItemsLocal);
    
    Zotero.state.bindItemLinks(container);
    
    //check/uncheck all boxes in items table when master checkbox is toggled
    container.on('change', ".itemlist-editmode-checkbox.all-checkbox", function(e){
        J(".itemlist-editmode-checkbox").prop('checked', J(".itemlist-editmode-checkbox.all-checkbox").prop('checked'));
        //library.trigger('controlPanelContextChange');
        library.trigger("selectedItemsChanged");
    });
    
    //init itemkey-checkbox to enable/disable buttons that require something being selected
    container.on('change', "input.itemKey-checkbox", function(e){
        //library.trigger('controlPanelContextChange');
        var selectedItemKeys = [];
        J("input.itemKey-checkbox:checked").each(function(index, el){
            selectedItemKeys.push(J(el).data('itemkey'));
        });
        library.trigger("selectedItemsChanged", {selectedItemKeys: selectedItemKeys});
    });
    
    Zotero.ui.widgets.localItems.bindPaginationLinks(container);
    library.trigger("displayedItemsUpdated");
};

Zotero.ui.widgets.localItems.bindPaginationLinks = function(container){
    container.on('click', "#start-item-link", function(e){
        e.preventDefault();
        Zotero.state.pathVars['itemPage'] = '';
        Zotero.state.pushState();
    });
    container.on('click', "#prev-item-link", function(e){
        e.preventDefault();
        var itemPage = Zotero.state.getUrlVar('itemPage') || '1';
        itemPage = parseInt(itemPage, 10);
        var newItemPage = itemPage - 1;
        Zotero.state.pathVars['itemPage'] = newItemPage;
        Zotero.state.pushState();
    });
    container.on('click', "#next-item-link", function(e){
        e.preventDefault();
        var itemPage = Zotero.state.getUrlVar('itemPage') || '1';
        itemPage = parseInt(itemPage, 10);
        var newItemPage = itemPage + 1;
        Zotero.state.pathVars['itemPage'] = newItemPage;
        Zotero.state.pushState();
    });
    container.on('click', "#last-item-link", function(e){
        e.preventDefault();
        Z.debug("last-item-link clickbind", 4);
        var pagehref = J(e.currentTarget).attr('href');
        var pathVars = Zotero.state.parsePathVars(pagehref);
        var lastItemPage = pathVars.itemPage;
        Zotero.state.pathVars['itemPage'] = lastItemPage;
        Zotero.state.pushState();
    });
};

Zotero.ui.widgets.localItems.updateDisplayedItems = function(event){
    Z.debug("widgets.localItems.updateDisplayedItems", 3);
    //- determine what config applies that we need to find items for
    //- find the appropriate items in the store, presumably with indexedDB queries
    //- pull out x items that match (or since we have them locally anyway, just display them all)
    var widgetEl = J(event.data.widgetEl);
    var library = Zotero.ui.getAssociatedLibrary(widgetEl);
    var newConfig = Zotero.ui.getItemsConfig(library);
    
    var displayParams = Zotero.state.getUrlVars();
    library.buildItemDisplayView(displayParams)
    .then(function(displayItemsArray){
        Z.debug('displayingItems in promise callback');
        widgetEl.empty();
        Zotero.ui.widgets.items.displayItems(widgetEl, newConfig, displayItemsArray);
        Zotero.eventful.initTriggers();    
    }).catch(Zotero.catchPromiseError);
};


Zotero.ui.widgets.siteSearch = {};

Zotero.ui.widgets.siteSearch.init = function(el){
    Z.debug("widgets.siteSearch.init", 3);
    var widgetEl = J(el);
    Zotero.listen("searchSite", Zotero.ui.widgets.siteSearch.triggeredSearch, {widgetEl: el});
    
    var searchType = Zotero.state.getUrlVar('type');
    var query = Zotero.state.getUrlVar('q');
    Z.debug("searchType: " + searchType);
    switch(searchType){
        case 'support':
            J('a.supportTab').tab('show');
            J("#supportQuery").val(query);
            break;
        case 'groups':
            J('a.groupTab').tab('show');
            J("#groupQuery").val(query);
            break;
        case 'people':
            J('a.peopleTab').tab('show');
            J("#peopleQuery").val(query);
            break;
    }
    
    if(query){
        Zotero.ui.widgets.siteSearch.search(searchType, query);
    }
}

Zotero.ui.widgets.siteSearch.triggeredSearch = function(event){
    Z.debug("Zotero.ui.widgets.siteSearch.search", 3);
    var widgetEl = J(event.data.widgetEl);
    var triggeringEl = J(event.triggeringElement);
    
    var queryType   = triggeringEl.data('searchtype');
    var queryString = triggeringEl.closest('.search-section').find('input[name="q"]').val();
    // If this is a support search, see if we need to refine to forums or documentation
    if(queryType == "support"){
        queryType = widgetEl.find("input[name=supportRefinement]:checked").val();
    }
    
    Zotero.ui.widgets.siteSearch.search(queryType, queryString);
    return false;
};

Zotero.ui.widgets.siteSearch.search = function(queryType, queryString){
    //var queryString = J("#"+queryType+"Query").val();
    if(!queryString || queryString === "") {return false;}
    
    Zotero.state.setQueryVar('q', queryString);
    Zotero.state.setUrlVar('type', queryType);
    
    Zotero.state.pushState();
    
    var params = {type:queryType, query:queryString};
    Z.debug(params);
    Zotero.ui.widgets.siteSearch.runSearch(params);
};

Zotero.ui.widgets.siteSearch.runSearch = function(params){
    Z.debug("Zotero.ui.widgets.siteSearch.runSearch", 3);
    Z.debug(params, 3);
    // If it's a request for support results, pass to google search function
    if(!params.type) params.type = 'support';
    if(params.type == "support" || params.type == "forums" || params.type == "documentation"){
        Z.debug("google search");
        Zotero.ui.widgets.siteSearch.fetchGoogleResults(params);
    // otherwise, Make ajax request for results page
    } else if (params.query !== "") {
        Z.debug("non-google search", 3);
        var searchUrl = '';
        var queryString = '?';
        if(params.type == 'people'){
            searchPath = '/search/users';
        }
        else if(params.type == 'groups'){
            searchPath = '/search/groups';
        }
        queryString += 'query=' + params['query'];
        if(params['page']){
            queryString += '&page=' + params['page'];
        }
        Zotero.ui.showSpinner(J("#search-spinner"));
        J("#search-spinner").show();
        J.get(baseURL + searchPath + queryString, function(response){
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
};

Zotero.ui.widgets.siteSearch.fetchGoogleResults = function(params){
    Z.debug("Zotero.ui.widgets.siteSearch.fetchGoogleResults", 3);
    Zotero.ui.widgets.siteSearch.clearResults();
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
    searcher.setSearchCompleteCallback(Zotero.ui.widgets.siteSearch, Zotero.ui.widgets.siteSearch.displayGoogleResults, paramsArray);
    
    // Execute our query
    searcher.clearResults();
    searcher.execute(params.query);
};

Zotero.ui.widgets.siteSearch.displayGoogleResults = function(type, query, page){
    Z.debug("Zotero.ui.widgets.siteSearch.displayGoogleResults", 3);
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
                J("#search-pagination").append("<a href='javascript:Zotero.ui.widgets.siteSearch.gotopage("+i+")'>"+p.label+"</a> | ");
            }
        }
    }
    else{
        Z.debug("no results in searcher");
    }
};

Zotero.ui.widgets.siteSearch.clearResults = function(widgetEl){
    widgetEl = J(widgetEl);
    widgetEl.find("#search-results").empty();
    widgetEl.find("#search-result-count").empty();
    widgetEl.find("#search-pagination").empty();
    window.scrollBy(0, -500);
};

Zotero.ui.widgets.siteSearch.gotopage = function(i){
    Zotero.ui.widgets.siteSearch.clearResults();
    searcher.gotoPage(i);
};


Zotero.ui.widgets.libraryDropdown = {};

Zotero.ui.widgets.libraryDropdown.init = function(el){
    Z.debug("libraryDropdown widget init", 3);
    var library = Zotero.ui.getAssociatedLibrary(el);
    var widgetEl = J(el);
    var currentLibraryName = Zotero.config.librarySettings.name;
    //set name of current library which we already have, before fetching the rest
    widgetEl.find("span.current-library-name").text(currentLibraryName);

    Zotero.listen("populateLibraryDropdown", Zotero.ui.widgets.libraryDropdown.populateDropdown, {widgetEl: el});
};

Zotero.ui.widgets.libraryDropdown.populateDropdown = function(evt){
    Zotero.debug("Zotero.ui.widgets.libraryDropdown.populateDropdown", 3);
    var widgetEl = J(evt.data.widgetEl);
    if(widgetEl.data('loaded')){
        return;
    }

    var library = Zotero.ui.getAssociatedLibrary(widgetEl);
    if(!Zotero.config.loggedIn){
        throw new Error("no logged in userID. Required for libraryDropdown widget");
    }
    var user = Zotero.config.loggedInUser;
    var personalLibraryString = 'u' + user.userID;
    var personalLibraryUrl = Zotero.url.userWebLibrary(user.slug);
    var currentLibraryName = Zotero.config.librarySettings.name;
    
    var memberGroups = library.groups.fetchUserGroups(user.userID)
    .then(function(response){
        Z.debug("got member groups", 3);
        var memberGroups = response.fetchedGroups;
        var accessibleLibraries = [];
        if(!(Zotero.config.librarySettings.libraryType == 'user' && Zotero.config.librarySettings.libraryID == user.userID)){
            accessibleLibraries.push({
                name:'My Library',
                libraryString:personalLibraryString,
                webUrl:personalLibraryUrl
            });
        }
            
        for(var i = 0; i < memberGroups.length; i++){
            if(Zotero.config.librarySettings.libraryType == 'group' && memberGroups[i].get('id') == Zotero.config.librarySettings.libraryID){
                continue;
            }
            var libraryString = 'g' + memberGroups[i].get('id');
            accessibleLibraries.push({
                name: memberGroups[i].get('name'),
                libraryString: libraryString,
                webUrl: Zotero.url.groupWebLibrary(memberGroups[i])
            });
        }
        
        widgetEl.html(J("#librarydropdownTemplate").render({
            currentLibraryName:currentLibraryName,
            accessibleLibraries: accessibleLibraries
        }));

        widgetEl.data('loaded', true);
    }).catch(function(err){
        Z.error(err);
        Z.error(err.message);
    });
    
};


Zotero.ui.widgets.publications = {};

Zotero.ui.widgets.publications.init = function(el){
    Z.debug("widgets.publications.init");
    var library = Zotero.ui.getAssociatedLibrary(el);
    var widgetEl = J(el);
    var libraryID = widgetEl.data('libraryID');
    
    var config = {
        'limit': 50,
        'order': 'dateModified',
        'sort': 'desc',
        'libraryType': 'user',
        'libraryID': libraryID,
        'target': 'publications',
        'include': 'data,bib',
        'linkwrap': '1',
        'style': 'apa-annotated-bibliography',
    };
    var p = library.loadPublications(config)
    .then(function(response){
        Z.debug("got publications", 3);
        widgetEl.empty();
        Zotero.ui.widgets.publications.displayItems(widgetEl, config, response.publicationItems);
    },
    function(response){
        Z.error(response);
        Z.error("error getting publication items");
        var elementMessage = Zotero.ui.ajaxErrorMessage(response.jqxhr);
        widgetEl.html("<p>" + elementMessage + "</p>");
    });


};

Zotero.ui.widgets.publications.displayItems = function(el, config, itemsArray) {
    Z.debug("publications.displayItems", 3);
    var jel = J(el);
    var library = Zotero.ui.getAssociatedLibrary(jel);
    
    var filledConfig = J.extend({}, Zotero.config.defaultApiArgs, config);
    var displayFields = library.preferences.getPref('listDisplayedFields');
    if(library.libraryType != 'group'){
        displayFields = J.grep(displayFields, function(el, ind){
            return J.inArray(el, Zotero.Library.prototype.groupOnlyColumns) == (-1);
        });
    }
    //map child items to their parent keys so we can put download links in
    var childItems = {};
    for(var i = 0; i < itemsArray.length; i++){
        var item = itemsArray[i];
        var parentKey = item.get("parentItem");
        if(parentKey){
            Z.debug("has parentKey, adding item to childItems object " + parentKey);
            childItems[parentKey] = item;
        }
    }
    
    var publicationsData = {'items':itemsArray,
                            'childItems': childItems,
                            'library':library,
                            'displayFields': [
                                'title',
                                'creator',
                                'abstract',
                                'date',
                            ],
                            };

    jel.append( J('#publicationsTemplate').render(publicationsData) );
};



/*
Zotero.url.attachmentDownloadLink = function(item){
    var linkString = '';
    var enctype, enc, filesize, filesizeString;
    var downloadHref = Zotero.url.attachmentDownloadUrl(item);
    if(item.apiObj.links['enclosure']){
        if(Zotero.url.itemIsSnapshot(item)) {
            //snapshot: redirect to view
            retString += '<a href="' + downloadUrl + '">' + 'View Snapshot</a>';
        }
        else{
            //file: offer download
            enctype = Zotero.utils.translateMimeType(item.apiObj.links['enclosure'].type);
            enc = item.apiObj.links['enclosure'];
            filesize = parseInt(enc['length'], 10);
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
            Z.debug(enctype);
            linkString += '<a href="' + downloadHref + '">';
            
            if((enctype == 'undefined') || (enctype === '') || (typeof enctype == 'undefined')){
                linkString += filesizeString + '</a>';
            }
            else{
                linkString += enctype + ', ' + filesizeString + '</a>';
            }
            
            return linkString;
        }
    }
    return linkString;
};
*/
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
        qparams['redirect'] = redirect;
    }
    
    queryParamsArray = [];
    J.each(qparams, function(index, value){
        queryParamsArray.push(encodeURIComponent(index) + '=' + encodeURIComponent(value));
    });
    
    //build query string by concatenating array
    queryString = '?' + queryParamsArray.join('&');
    
    return apiKeyBase + queryString;
};

Zotero.url.groupViewUrl = function(group){
    if(group.get("type") == "Private"){
        return Zotero.config.baseWebsiteUrl + "/groups/" + group.get("id");
    }
    else {
        return Zotero.config.baseWebsiteUrl + "/groups/" + Zotero.utils.slugify(group.get("name"));
    }
};

Zotero.url.groupLibraryUrl = function(group){
    if(group.get("type") == "Private"){
        return Zotero.config.baseWebsiteUrl + "/groups/" + group.get("id") + "/items";
    }
    else {
        return Zotero.config.baseWebsiteUrl + "/groups/" + Zotero.utils.slugify(group.get("name")) + "/items";
    }
};

Zotero.url.groupSettingsUrl = function(group){
    return Zotero.config.baseWebsiteUrl + "/groups/" + group.get("id") + "/settings";
};

Zotero.url.groupMemberSettingsUrl = function(group){
    return Zotero.config.baseWebsiteUrl + "/groups/" + group.get("id") + "/settings/members";
};

Zotero.url.groupLibrarySettingsUrl = function(group){
    return Zotero.config.baseWebsiteUrl + "/groups/" + group.get("id") + "/settings/library";
};



/**
 * Zotero.Pages class containing page specific functions for the website. Loaded based on
 * the value of zoterojsClass
 */
Zotero.pages = {
    //base zotero js functions that will be used on every page
    base: {

        init: function(){
            this.tagline();
            this.setupSearch();
            this.setupNav();
            J("#sitenav .toggle").click(this.navMenu);
            
            //set up support page expandos
            J(".support-menu-expand-section").hide();
            J(".support-menu-section").on('click', "h2", function(){
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
                J("#simple-search").on('submit', function(e){
                    e.preventDefault();
                    var searchUrl = Zotero.config.baseZoteroWebsiteUrl + "/search/#type/" + context;
                    var query     = J("#header-search-query").val();
                    if(query !== "" && query != label){
                        searchUrl = searchUrl + "/q/" + encodeURIComponent(query);
                    }
                    location.href = searchUrl;
                    return false;
                });
            }
            else if(context != 'forums') {
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
            if(tab != ""){
                J(".primarynav").find("a." + tab).closest('li').addClass("active");
            }
        }
    },
    settings_cv: {
        init: function(){
            // Delete the cv section when the delete link is clicked
            J("#cv-sections").on("click", ".cv-delete", function(e){
                if(confirm ("Are you sure you want to delete this section?")){
                    // Clean up RTEs before moving the base DOM elements around
                    Zotero.ui.cleanUpRte(J("#cv-sections"));
                    
                    J(this).closest("div.cv-section").remove();
                    
                    Zotero.ui.init.rte('default', false, J("#cv-sections"));
                    
                    return false;
                }
            });
            
            // Add a new cv section when the add button is clicked
            J(".cv-insert-freetext").on("click", function(e){
                // Get the number of sections that exist before adding a new one
                var sectionCount  = J("#cv-sections div.cv-section").length;
                var newIndex = sectionCount + 1;
                var newTextareaID = "cv_" + newIndex + "_text";

                //render new section template into end of sections
                J("#cv-sections").append( J('#cvsectionTemplate').render({
                    cvSectionIndex: newIndex,
                    cvSectionType: "text",
                    cvEntry: {},
                }) );

                //activate RTE
                Zotero.ui.init.rte('default', false, J("div.cv-section").last());
                
                J("input.cv-heading").last().focus();
                return false;
            });
            
            // Add a new cv collection when the add button is clicked
            J(".cv-insert-collection").on("click", function(e){
                // Get the number of sections that exist before adding a new one
                var sectionCount  = J("#cv-sections div.cv-section").length;
                var newIndex = sectionCount + 1;
                
                //render new section template into end of sections
                Z.debug(zoteroData.collectionOptions);
                J("#cv-sections").append( J('#cvsectionTemplate').render({
                    cvSectionIndex: newIndex,
                    cvSectionType: "collection",
                    collectionOptions: zoteroData.collectionOptions,
                    cvEntry:{},
                }) );

                J("input.cv-heading").last().focus();
                return false;
            });
            
            // Move the section down when the down link is clicked
            J("#cv-sections").on("click", ".cv-move-down", function(e){
                if(J(this).closest('div.cv-section').find("textarea").length > 0){
                    // Clean up RTEs before moving the base DOM elements around
                    Zotero.ui.cleanUpRte(J("#cv-sections"));
                    
                    // Move the section and reenable the rte control
                    J(this).closest("div.cv-section").next().after(J(this).closest("div.cv-section"));
                    Zotero.ui.init.rte('default', false);
                }
                else {
                    J(this).closest("div.cv-section").next().after(J(this).closest("div.cv-section"));
                }

                //Zotero.pages.settings_cv.hideMoveLinks();
                return false;
            });
            
            // Move the section up when the up link is clicked
            J("#cv-sections").on("click", ".cv-move-up", function(e){
                if(J(this).closest('div.cv-section').find("textarea").length > 0){
                    // Clean up RTEs before moving the base DOM elements around
                    Zotero.ui.cleanUpRte(J("#cv-sections"));
                    
                    // Move the section and reenable the rte control
                    J(this).closest("div.cv-section").prev().before(J(this).closest("div.cv-section"));
                    Zotero.ui.init.rte('default', false);
                }
                else {
                    J(this).closest("div.cv-section").prev().before(J(this).closest("div.cv-section"));
                }
                //Zotero.pages.settings_cv.hideMoveLinks();
                return false;
            });
            
            // reindex the field names before submitting the form
            J("#cv-submit").click(function(e){
                J("#cv-sections div.cv-section").each(function(i){
                    var heading;
                    if(J(this).hasClass("cv-text") ){
                        heading = J(this).find(".cv-heading").attr("name", "cv_"+(i+1)+"_heading");
                        if(heading.val() == "Enter a section name"){
                            heading.val("");
                        }
                        J(this).find(".cv-text").attr("name", "cv_"+(i+1)+"_text");
                    }
                    else if(J(this).hasClass("cv-collection") ){
                        heading = J(this).find(".cv-heading").attr("name", "cv_"+(i+1)+"_heading");
                        if(heading.val() == "Enter a section name"){
                            heading.val("");
                        }
                        J(this).find("select.cv-collection").attr("name", "cv_"+(i+1)+"_collection");
                    }
                });
            });
            
            // Hide unusable move links
            //this.hideMoveLinks();
            
            //init existing rte on first load
            Zotero.ui.init.rte('nolinks', false, J("#cv-sections"));
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
    },
    
    settings_profile: {
        init: function(){
            Zotero.ui.init.rte('nolinks');
        }
    },
    
    settings_privacy: {
        //disable publishNotes checkbox when the library is not set to be public
        init: function(){
            if(!J("input#privacy_publishLibrary").prop("checked")){
                J("input#privacy_publishNotes").prop("disabled",true);
            }
            J("input#privacy_publishLibrary").bind("change", function(){
                if(!J("input#privacy_publishLibrary").prop("checked")){
                    J("input#privacy_publishNotes").prop("checked", false).prop("disabled",true);
                }
                else{
                    J("input#privacy_publishNotes").prop("disabled", false);
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
            Z.debug("zoteroPages settings_newkey", 3);
            Zotero.pages.settings_editkey.init();
        }
    },
    
    settings_newoauthkey: {
        init: function(){
            Zotero.pages.settings_newkey.init();
            
            J("button[name='edit']").closest('div.form-group').nextAll().hide();
            J("button[name='edit']").click(function(e){
                e.preventDefault();
                J("button[name='edit']").closest('div.form-group').nextAll().show();
            });
        },
        
        updatePermissionsSummary: function(){
            J("#permissions-summary").empty().append(Z.pages.settings_newoauthkey.permissionsSummary());
        },
        
        //build a human readable summary of currently selected permissions
        permissionsSummary: function(){
            var summary = '';
            var libraryAccess = J("input#library_access").prop('checked');
            var notesAccess = J("input#notes_access").prop('checked');
            var writeAccess = J("input#write_access").prop('checked');
            if(libraryAccess){
                summary += "Access to read your personal library.<br />";
            }
            if(notesAccess){
                summary += "Access to read notes in your personal library.<br />";
            }
            if(writeAccess){
                summary += "Access to read and modify your personal library.<br />";
            }
            var allGroupAccess = J("input[name='groups_all']:checked").val();
            switch(allGroupAccess){
                case 'read':
                    summary += "Access to read any of your group libraries<br />";
                    break;
                case 'write':
                    summary += "Access to read and modify any of your group libraries<br />";
                    break;
            }
            
            var allowIndividualGroupPermissions = J("input#individual_groups").prop('checked');
            var individualGroupAccess = [];
            if(allowIndividualGroupPermissions){
                J("input.individual_group_permission:checked").each(function(ind, el){
                    var groupname = J(el).data('groupname');
                    var groupID = J(el).data('groupid');
                    var permission = J(el).val();
                    switch(permission){
                        case 'read':
                            summary += "Access to read library for group '" + groupname + "'<br />";
                            break;
                        case 'write':
                            summary += "Access to read and modify library for group '" + groupname + "'<br />";
                            break;
                    }
                });
            }
            
            return summary;
        },
    },
    
    settings_editkey: {
        init: function(){
            Z.debug("zoteroPages settings_editkey", 3);
            if(!J("input[type='checkbox'][name='library_access']").prop("checked")){
                J("input[name='notes_access']").prop("disabled","disabled");
            }
            J("input#library_access").bind("change", function(){
                if(!J("input[type='checkbox'][name='library_access']").prop("checked")){
                    J("input[name='notes_access']").prop("checked", false).prop("disabled", true);
                    J("input[name='write_access']").prop('checked', false).prop('disabled', true);
                }
                else{
                    J("input[name='notes_access']").prop("disabled", false);
                    J("input[name='write_access']").prop('disabled', false);
                }
            });
            J("input[name='name']").focus();
            
            if(!(J("input[type='checkbox'][name='individual_groups']").prop('checked'))) {
                J(".individual_group_permission").closest('div.form-group').hide();
            }
            J("input[name='individual_groups']").bind('change', function(){
                Z.debug("individual groups checkbox changed");
                if(J("input[type='checkbox'][name='individual_groups']").prop('checked')){
                    J(".individual_group_permission").closest('div.form-group').show();
                }
                else{
                    J(".individual_group_permission").closest('div.form-group').hide();
                }
            });
            
            J('input').bind('change', Zotero.pages.settings_newoauthkey.updatePermissionsSummary);
            Zotero.pages.settings_newoauthkey.updatePermissionsSummary();
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
            else if(selectedLevel == 6){
                J("#order-result-div").html(zoteroData.orderResult6);
            }
        }
    },
    
    settings_deleteaccount: {
        init: function(){
            J("button#deleteaccount").click(function(){
                if(!confirm("Are you sure you want to permanently delete your account? You will not be able to recover the account or the user name.")){
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
                                      Zotero.config.baseZoteroWebsiteUrl + "/" + "groups/" +
                                      Zotero.utils.slugify(J("input#name").val()) +
                                      "</label>");
            
        },
        
        nameChange: function(){
            //make sure label is black after each change before checking with server
            J("#slugpreview").css("color", "black");
            var groupType = J('input[name=group_type]:checked').val();
            // update slug preview text
            if(groupType == 'Private'){
                J("#slugpreview").text("Group URL: " +Zotero.config.baseZoteroWebsiteUrl + "/" + "groups/<number>");
            }
            else{
                J("#slugpreview").text("Group URL: " +Zotero.config.baseZoteroWebsiteUrl + "/" + "groups/" +
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
            Zotero.debug("initializing group delete form");
            Zotero.ui.init.rte('nolinks');
            
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
            J("#join-group-button").click(Zotero.pages.group_view.joinGroup);
            J("#leave-group-button").click(Zotero.pages.group_view.leaveGroup);
            
            Zotero.ui.init.rte('nolinks');
        },
        
        joinGroup: function(){
            Zotero.ui.showSpinner(J('.join-group-div'));
            J.post("/groups/" + zoteroData.groupID + "/join", {ajax:true}, function(data){
                if(data.pending === true){
                    J(".join-group-div").empty().append("Membership Pending");
                }
                else if(data.success === true){
                    Zotero.ui.jsNotificationMessage("You are now a member of this group", 'success');
                }
                else{
                    J(".join-group-div").empty();
                    Zotero.ui.jsNotificationMessage("There was a problem joining this group.", 'error');
                }
            },
            "json");
        },
        
        leaveGroup: function(){
            if(confirm("Leave group?")){
                Zotero.ui.showSpinner(J(".leave-group-div"));
                J.post("/groups/" + zoteroData.groupID + "/leave", {ajax:true}, function(data){
                    if(data.success === true){
                        J('leave-group-div').empty();
                        Zotero.ui.jsNotificationMessage("You are no longer a member of this group", 'success');
                    }
                    else{
                        J('leave-group-div').empty();
                        Zotero.ui.jsNotificationMessage("There was a problem leaving this group. Please try again in a few minutes.", 'error');
                    }
                },
                "json");
            }
        },
    },
    
    group_index: {
        init: function(){
            //set up screen cast player + box
            //J("video").mediaelementplayer();
            //TODO: lightbox?
        }
    },

    groupdiscussion_view: {
        init: function(){
            
        }
    },
    
    user_register: {
        init: function(){
            //insert slug preview label
            J("input[name='username']").after("<label id='slugpreview'>Profile URL: " +
                                      Zotero.config.baseZoteroWebsiteUrl + "/" +
                                      Zotero.utils.slugify(J("input[name='username']").val()) +
                                      "</label>");

            // When the value of the input box changes,
            J("input[name='username']").bind("keyup change", Zotero.pages.user_register.nameChange);
            parent.checkUserSlugTimeout;
        },
        
        nameChange: function(){
            //make sure label is black after each change before checking with server
            J("#slugpreview").css("color", "black");
            
            //create slug from username
            parent.slug = Zotero.utils.slugify( J("input[name='username']").val() );
            J("#slugpreview").text( "Profile URL: " + Zotero.config.baseZoteroWebsiteUrl + "/" + parent.slug );
            
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
    
    user_profile: {
        init: function(){
            J('#invite-button').click(function(){
                var groupID = J("#invite_group").val();
                J.post("/groups/inviteuser", {ajax:true, groupID:groupID, userID:zoteroData.profileUserID}, function(data){
                    if(data == 'true'){
                        Zotero.ui.jsNotificationMessage("User has been invited to join your group.", 'success');
                        J('#invited-user-list').append("<li>" + J("#invite_group > option:selected").html() + "</li>");
                        J('#invite_group > option:selected').remove();
                        if(J('#invite_group > option').length === 0){
                            J('#invite_group').remove();
                            J('#invite-button').remove();
                        }
                    }
                }, "text");
            });
        },
    },
    group_compose: {
        init: function(){
            Zotero.ui.init.rte('nolinks');
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
            /*
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
            */
        },
        /*
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
        */
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
                globalSearchD.then(function(globalItems){
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
            
            Zotero.pages.user_register.init();
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
            
            Zotero.pages.user_register.init();
        }
    },
    
    index_download: {
        init: function() {
            var browsername = BrowserDetect.browser;
            var os = BrowserDetect.OS;
            var arch = (navigator.userAgent.indexOf('x86_64') != -1) ? 'x86_64' : 'x86';
            
            if(os == 'Windows'){
                J('#standalone-windows-download-button').closest('li').clone().prependTo('#recommended-client-download ul');
            }
            else if(os == 'Mac'){
                J('#standalone-mac-download-button').closest('li').clone().prependTo('#recommended-client-download ul');
            }
            else if(os == 'Linux'){
                if(arch == 'x86_64'){
                    J('#standalone-linux64-download-button').closest('li').clone().prependTo('#recommended-client-download ul');
                }
                else {
                    J('#standalone-linux32-download-button').closest('li').clone().prependTo('#recommended-client-download ul');
                }
            }
            else {
                
            }
            
            J("#recommended-connector-download").show();
            switch(browsername){
                case 'Chrome':
                    J('#chrome-connector-download-button').addClass('recommended-download').closest('li').detach().prependTo('#recommended-connector-download ul');
                    break;
                case 'Safari':
                    J('#safari-connector-download-button').addClass('recommended-download').closest('li').detach().prependTo('#recommended-connector-download ul');
                    break;
                case 'Firefox':
                    J('#firefox-connector-download-button').addClass('recommended-download').closest('li').detach().prependTo('#recommended-connector-download ul');
                    break;
                default:
                    J('#connector-download-button').closest('li').clone().prependTo('#recommended-connector-download ul');
                    J('#other-connectors-p').hide();
            }
            J('#recommended-download ul').prepend('<li><p>Zotero Connectors allow you to save to Zotero directly from your web browser.</p></li>');
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
}; // end zoterojs
