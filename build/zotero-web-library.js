"use strict";function _typeof2(obj){return obj&&typeof Symbol!=="undefined"&&obj.constructor===Symbol?"symbol":typeof obj;}(function(f){if((typeof exports==="undefined"?"undefined":_typeof2(exports))==="object"&&typeof module!=="undefined"){module.exports=f();}else if(typeof define==="function"&&define.amd){define([],f);}else {var g;if(typeof window!=="undefined"){g=window;}else if(typeof global!=="undefined"){g=global;}else if(typeof self!=="undefined"){g=self;}else {g=this;}g.Zotero=f();}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f;}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e);},l,l.exports,e,t,n,r);}return n[o].exports;}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++){s(r[o]);}return s;})({1:[function(require,module,exports){(function(global){'use strict'; // use strict;
if(typeof window==='undefined'){var globalScope=global;if(!globalScope.XMLHttpRequest){globalScope.XMLHttpRequest=require('w3c-xmlhttprequest').XMLHttpRequest;}}else {var globalScope=window;if(typeof Promise==='undefined'){require('es6-promise').polyfill();}}var Zotero=require('./src/Base.js');globalScope.Zotero=globalScope.Z=Zotero;Zotero.Cache=require('./src/Cache.js');Zotero.Ajax=Zotero.ajax=require('./src/Ajax.js');Zotero.ApiObject=require('./src/ApiObject.js');Zotero.ApiResponse=require('./src/ApiResponse.js');Zotero.Net=Zotero.net=require('./src/Net.js');Zotero.Library=require('./src/Library.js');Zotero.Container=require('./src/Container');Zotero.Collections=require('./src/Collections.js');Zotero.Items=require('./src/Items.js');Zotero.Tags=require('./src/Tags.js');Zotero.Groups=require('./src/Groups.js');Zotero.Searches=require('./src/Searches.js');Zotero.Deleted=require('./src/Deleted.js');Zotero.Collection=require('./src/Collection.js');Zotero.Localizations=Zotero.localizations=require('./src/Localizations.js');Zotero.Item=require('./src/Item.js');Zotero.Tag=require('./src/Tag.js');Zotero.Search=require('./src/Search.js');Zotero.Group=require('./src/Group.js');Zotero.User=require('./src/User.js');Zotero.Utils=Zotero.utils=require('./src/Utils.js');Zotero.Url=Zotero.url=require('./src/Url.js');Zotero.File=Zotero.file=require('./src/File.js');Zotero.Idb=require('./src/Idb.js');Zotero.Preferences=require('./src/Preferences.js');module.exports=Zotero;}).call(this,typeof global!=="undefined"?global:typeof self!=="undefined"?self:typeof window!=="undefined"?window:{});},{"./src/Ajax.js":97,"./src/ApiObject.js":98,"./src/ApiResponse.js":99,"./src/Base.js":100,"./src/Cache.js":101,"./src/Collection.js":102,"./src/Collections.js":103,"./src/Container":104,"./src/Deleted.js":105,"./src/File.js":106,"./src/Group.js":107,"./src/Groups.js":108,"./src/Idb.js":109,"./src/Item.js":110,"./src/Items.js":112,"./src/Library.js":113,"./src/Localizations.js":114,"./src/Net.js":115,"./src/Preferences.js":116,"./src/Search.js":117,"./src/Searches.js":118,"./src/Tag.js":119,"./src/Tags.js":120,"./src/Url.js":121,"./src/User.js":122,"./src/Utils.js":123,"es6-promise":83,"w3c-xmlhttprequest":2}],2:[function(require,module,exports){},{}],3:[function(require,module,exports){'use strict';var assign=require('es5-ext/object/assign'),normalizeOpts=require('es5-ext/object/normalize-options'),isCallable=require('es5-ext/object/is-callable'),contains=require('es5-ext/string/#/contains'),d;d=module.exports=function(dscr,value /*, options*/){var c,e,w,options,desc;if(arguments.length<2||typeof dscr!=='string'){options=value;value=dscr;dscr=null;}else {options=arguments[2];}if(dscr==null){c=w=true;e=false;}else {c=contains.call(dscr,'c');e=contains.call(dscr,'e');w=contains.call(dscr,'w');}desc={value:value,configurable:c,enumerable:e,writable:w};return !options?desc:assign(normalizeOpts(options),desc);};d.gs=function(dscr,get,set /*, options*/){var c,e,options,desc;if(typeof dscr!=='string'){options=set;set=get;get=dscr;dscr=null;}else {options=arguments[3];}if(get==null){get=undefined;}else if(!isCallable(get)){options=get;get=set=undefined;}else if(set==null){set=undefined;}else if(!isCallable(set)){options=set;set=undefined;}if(dscr==null){c=true;e=false;}else {c=contains.call(dscr,'c');e=contains.call(dscr,'e');}desc={get:get,set:set,configurable:c,enumerable:e};return !options?desc:assign(normalizeOpts(options),desc);};},{"es5-ext/object/assign":60,"es5-ext/object/is-callable":65,"es5-ext/object/normalize-options":71,"es5-ext/string/#/contains":75}],4:[function(require,module,exports){'use strict';var callable=require('es5-ext/object/valid-callable'),d=require('d'),isCallable=require('es5-ext/object/is-callable'),ee=require('event-emitter'),isPromise=require('./is-promise'),create=Object.create,defineProperty=Object.defineProperty,deferred,resolve,reject;module.exports=exports=(function(_exports){function exports(_x,_x2,_x3,_x4){return _exports.apply(this,arguments);}exports.toString=function(){return _exports.toString();};return exports;})(function(name,unres,onres,res){name=String(name);callable(res)&&(onres==null||callable(onres))&&callable(unres);defineProperty(exports._unresolved,name,d(unres));exports._onresolve[name]=onres;defineProperty(exports._resolved,name,d(res));exports._names.push(name);});exports._names=['done','then','valueOf'];exports._unresolved=ee(create(Function.prototype,{then:d(function(win,fail){var def;if(!this.pending)this.pending=[];def=deferred();this.pending.push('then',[win,fail,def.resolve,def.reject]);return def.promise;}),done:d(function(win,fail){win==null||callable(win);fail==null||callable(fail);if(!this.pending)this.pending=[];this.pending.push('done',arguments);}),resolved:d(false),returnsPromise:d(true),valueOf:d(function(){return this;})}));exports._onresolve={then:function then(win,fail,resolve,reject){var value,cb=this.failed?fail:win;if(cb==null){if(this.failed)reject(this.value);else resolve(this.value);return;}if(isCallable(cb)){if(isPromise(cb)){if(cb.resolved){if(cb.failed)reject(cb.value);else resolve(cb.value);return;}cb.done(resolve,reject);return;}try{value=cb(this.value);}catch(e) {reject(e);return;}resolve(value);return;}resolve(cb);},done:function done(win,fail){if(this.failed){if(fail){fail(this.value);return;}throw this.value;}if(win)win(this.value);}};exports._resolved=ee(create(Function.prototype,{then:d(function(win,fail){var value,cb=this.failed?fail:win;if(cb==null)return this;if(isCallable(cb)){if(isPromise(cb))return cb;try{value=cb(this.value);}catch(e) {return reject(e);}return resolve(value);}return resolve(cb);}),done:d(function(win,fail){win==null||callable(win);fail==null||callable(fail);if(this.failed){if(fail){fail(this.value);return;}throw this.value;}if(win)win(this.value);}),resolved:d(true),returnsPromise:d(true),valueOf:d(function(){return this.value;})}));deferred=require('./deferred');resolve=deferred.resolve;reject=deferred.reject;deferred.extend=exports;},{"./deferred":6,"./is-promise":33,"d":3,"es5-ext/object/is-callable":65,"es5-ext/object/valid-callable":72,"event-emitter":89}],5:[function(require,module,exports){ // Assimilate eventual foreign promise
'use strict';var isObject=require('es5-ext/object/is-object'),isPromise=require('./is-promise'),deferred=require('./deferred'),nextTick=require('next-tick'),getPrototypeOf=Object.getPrototypeOf;module.exports=function self(value){var then,done,def,resolve,reject;if(!value)return value;try{then=value.then;}catch(e) {return value;}if(typeof then!=='function')return value;if(isPromise(value))return value;if(!isObject(value))return value;if(!getPrototypeOf(value))return value;try{done=value.done;}catch(ignore) {}def=deferred();resolve=function resolve(value){def.resolve(self(value));};reject=function reject(value){def.reject(value);};if(typeof done==='function'){try{done.call(value,resolve,reject);}catch(e) {return def.reject(e);}return def.promise;}try{then.call(value,function(value){nextTick(function(){resolve(value);});},function(value){nextTick(function(){reject(value);});});}catch(e) {return def.reject(e);}return def.promise;};},{"./deferred":6,"./is-promise":33,"es5-ext/object/is-object":66,"next-tick":91}],6:[function(require,module,exports){ // Returns function that returns deferred or promise object.
//
// 1. If invoked without arguments then deferred object is returned
//    Deferred object consist of promise (unresolved) function and resolve
//    function through which we resolve promise
// 2. If invoked with one argument then promise is returned which resolved value
//    is given argument. Argument may be any value (even undefined),
//    if it's promise then same promise is returned
// 3. If invoked with more than one arguments then promise that resolves with
//    array of all resolved arguments is returned.
'use strict';var isError=require('es5-ext/error/is-error'),noop=require('es5-ext/function/noop'),isPromise=require('./is-promise'),every=Array.prototype.every,push=Array.prototype.push,Deferred,createDeferred,count=0,timeout,extendShim,ext,protoSupported=Boolean(isPromise.__proto__),resolve,assimilate;extendShim=function extendShim(promise){ext._names.forEach(function(name){promise[name]=function(){return promise.__proto__[name].apply(promise,arguments);};});promise.returnsPromise=true;promise.resolved=promise.__proto__.resolved;};resolve=function resolve(value,failed){var promise=function promise(win,fail){return promise.then(win,fail);};promise.value=value;promise.failed=failed;promise.__proto__=ext._resolved;if(!protoSupported){extendShim(promise);}if(createDeferred._profile)createDeferred._profile(true);return promise;};Deferred=function Deferred(){var promise=function promise(win,fail){return promise.then(win,fail);};if(!count)timeout=setTimeout(noop,1e9);++count;if(createDeferred._monitor)promise.monitor=createDeferred._monitor();promise.__proto__=ext._unresolved;if(!protoSupported)extendShim(promise);createDeferred._profile&&createDeferred._profile();this.promise=promise;this.resolve=this.resolve.bind(this);this.reject=this.reject.bind(this);};Deferred.prototype={resolved:false,_settle:function _settle(value){var i,name,data,deps,dPromise,nuDeps;this.promise.value=value;this.promise.__proto__=ext._resolved;if(!protoSupported)this.promise.resolved=true;deps=this.promise.dependencies;delete this.promise.dependencies;while(deps){for(i=0;dPromise=deps[i];++i){dPromise.value=value;dPromise.failed=this.failed;dPromise.__proto__=ext._resolved;if(!protoSupported)dPromise.resolved=true;delete dPromise.pending;if(dPromise.dependencies){if(!nuDeps)nuDeps=dPromise.dependencies;else push.apply(nuDeps,dPromise.dependencies);delete dPromise.dependencies;}}deps=nuDeps;nuDeps=null;}if(data=this.promise.pending){for(i=0;name=data[i];++i){ext._onresolve[name].apply(this.promise,data[++i]);}delete this.promise.pending;}return this.promise;},resolve:function resolve(value){if(this.resolved)return this.promise;this.resolved=true;if(! --count)clearTimeout(timeout);if(this.promise.monitor)clearTimeout(this.promise.monitor);value=assimilate(value);if(isPromise(value)){if(!value.resolved){if(!value.dependencies){value.dependencies=[];}value.dependencies.push(this.promise);if(this.promise.pending){if(value.pending){push.apply(value.pending,this.promise.pending);this.promise.pending=value.pending;if(this.promise.dependencies){this.promise.dependencies.forEach(function self(dPromise){dPromise.pending=value.pending;if(dPromise.dependencies){dPromise.dependencies.forEach(self);}});}}else {value.pending=this.promise.pending;}}else if(value.pending){this.promise.pending=value.pending;}else {this.promise.pending=value.pending=[];}return this.promise;}this.promise.failed=value.failed;value=value.value;}return this._settle(value);},reject:function reject(error){if(this.resolved)return this.promise;this.resolved=true;if(! --count)clearTimeout(timeout);if(this.promise.monitor)clearTimeout(this.promise.monitor);this.promise.failed=true;return this._settle(error);}};module.exports=createDeferred=function createDeferred(value){var l=arguments.length,d,waiting,initialized,result;if(!l)return new Deferred();if(l>1){d=new Deferred();waiting=0;result=new Array(l);every.call(arguments,function(value,index){value=assimilate(value);if(!isPromise(value)){result[index]=value;return true;}if(value.resolved){if(value.failed){d.reject(value.value);return false;}result[index]=value.value;return true;}++waiting;value.done(function(value){result[index]=value;if(! --waiting&&initialized)d.resolve(result);},d.reject);return true;});initialized=true;if(!waiting)d.resolve(result);return d.promise;}value=assimilate(value);if(isPromise(value))return value;return resolve(value,isError(value));};createDeferred.Deferred=Deferred;createDeferred.reject=function(value){return resolve(value,true);};createDeferred.resolve=function(value){value=assimilate(value);if(isPromise(value))return value;return resolve(value,false);};ext=require('./_ext');assimilate=require('./assimilate');},{"./_ext":4,"./assimilate":5,"./is-promise":33,"es5-ext/error/is-error":45,"es5-ext/function/noop":51}],7:[function(require,module,exports){ // Dynamic queue handler
// Allows to create a promise queue, where new promises can be added to queue until last promise in
// a queue resolves. Queue promise resolves with `undefined` value, when last promises resolves.
'use strict';var aFrom=require('es5-ext/array/from'),ensureIterable=require('es5-ext/iterable/validate-object'),assign=require('es5-ext/object/assign'),deferred=require('./deferred'),isPromise=require('./is-promise'),assimilate=require('./assimilate'),_DynamicQueue;module.exports=_DynamicQueue=function DynamicQueue(list){if(!(this instanceof _DynamicQueue))return new _DynamicQueue(list);list=aFrom(ensureIterable(list));assign(this,deferred());list.every(this.add,this);if(!this.waiting){this.resolve();return;}this.initialized=true;};_DynamicQueue.prototype={waiting:0,initialized:false,add:function add(value){if(this.promise.resolved)throw new Error("Queue was already resolved");++this.waiting;value=assimilate(value);if(isPromise(value)){if(!value.resolved){value.done(this._processValue.bind(this),this.reject);return true;}if(value.failed){this.reject(value.value);return false;}}return this._processValue();},_processValue:function _processValue(){if(this.promise.resolved)return;if(! --this.waiting&&this.initialized)this.resolve();return true;}};},{"./assimilate":5,"./deferred":6,"./is-promise":33,"es5-ext/array/from":38,"es5-ext/iterable/validate-object":53,"es5-ext/object/assign":60}],8:[function(require,module,exports){'use strict';var arrayOf=require('es5-ext/array/of'),deferred=require('../deferred'),isPromise=require('../is-promise'),assimilate=require('../assimilate'),push=Array.prototype.push,slice=Array.prototype.slice;module.exports=function(args,length){var i,l,arg;if(length!=null&&args.length!==length){args=slice.call(args,0,length);if(args.length<length){push.apply(args,new Array(length-args.length));}}for(i=0,l=args.length;i<l;++i){arg=assimilate(args[i]);if(isPromise(arg)){if(!arg.resolved){if(l>1)return deferred.apply(null,args);return arg(arrayOf);}if(arg.failed)return arg;args[i]=arg.value;}}return args;};},{"../assimilate":5,"../deferred":6,"../is-promise":33,"es5-ext/array/of":41}],9:[function(require,module,exports){ // Promise aware Array's every
'use strict';module.exports=require('../../lib/some-every')(false);},{"../../lib/some-every":34}],10:[function(require,module,exports){ // Promise aware Array's find
// Additionally differs from some that it returns *first in order* item that matches constraint
'use strict';var assign=require('es5-ext/object/assign'),value=require('es5-ext/object/valid-value'),callable=require('es5-ext/object/valid-callable'),deferred=require('../../deferred'),isPromise=require('../../is-promise'),assimilate=require('../../assimilate'),call=Function.prototype.call,resolve=deferred.resolve,Find;Find=function Find(list,cb,context){this.list=list;this.cb=cb;this.context=context;this.length=list.length>>>0;while(this.current<this.length){if(this.current in list){assign(this,deferred());this.processCb=this.processCb.bind(this);this.process();return this.promise;}++this.current;}return resolve(undefined);};Find.prototype={current:0,process:function process(){var value=assimilate(this.list[this.current]);if(isPromise(value)){if(!value.resolved){value.done(this.processCb,this.reject);return;}if(value.failed){this.reject(value.value);return;}value=value.value;}this.processCb(value);},processCb:function processCb(listValue){var value;if(this.cb){try{value=call.call(this.cb,this.context,listValue,this.current,this.list);}catch(e) {this.reject(e);return;}value=assimilate(value);if(isPromise(value)){if(!value.resolved){value.done(this.processValue.bind(this,listValue),this.reject);return;}if(value.failed){this.reject(value.value);return;}value=value.value;}}else {value=listValue;}this.processValue(listValue,value);},processValue:function processValue(listValue,value){if(value){this.resolve(listValue);return;}while(++this.current<this.length){if(this.current in this.list){this.process();return;}}this.resolve(undefined);}};module.exports=function(cb /*, thisArg*/){value(this);cb==null||callable(cb);return new Find(this,cb,arguments[1]);};},{"../../assimilate":5,"../../deferred":6,"../../is-promise":33,"es5-ext/object/assign":60,"es5-ext/object/valid-callable":72,"es5-ext/object/valid-value":74}],11:[function(require,module,exports){ // Promise aware Array's map
'use strict';var assign=require('es5-ext/object/assign'),value=require('es5-ext/object/valid-value'),callable=require('es5-ext/object/valid-callable'),deferred=require('../../deferred'),isPromise=require('../../is-promise'),assimilate=require('../../assimilate'),every=Array.prototype.every,call=Function.prototype.call,DMap;DMap=function DMap(list,cb,context){this.list=list;this.cb=cb;this.context=context;this.result=new Array(list.length>>>0);assign(this,deferred());every.call(list,this.process,this);if(!this.waiting)return this.resolve(this.result);this.initialized=true;return this.promise;};DMap.prototype={waiting:0,initialized:false,process:function process(value,index){++this.waiting;value=assimilate(value);if(isPromise(value)){if(!value.resolved){value.done(this.processCb.bind(this,index),this.reject);return true;}if(value.failed){this.reject(value.value);return false;}value=value.value;}return this.processCb(index,value);},processCb:function processCb(index,value){if(this.promise.resolved)return false;if(this.cb){try{value=call.call(this.cb,this.context,value,index,this.list);}catch(e) {this.reject(e);return false;}value=assimilate(value);if(isPromise(value)){if(!value.resolved){value.done(this.processValue.bind(this,index),this.reject);return true;}if(value.failed){this.reject(value.value);return false;}value=value.value;}}this.processValue(index,value);return true;},processValue:function processValue(index,value){if(this.promise.resolved)return;this.result[index]=value;if(! --this.waiting&&this.initialized)this.resolve(this.result);}};module.exports=function(cb /*, thisArg*/){value(this);cb==null||callable(cb);return new DMap(this,cb,arguments[1]);};},{"../../assimilate":5,"../../deferred":6,"../../is-promise":33,"es5-ext/object/assign":60,"es5-ext/object/valid-callable":72,"es5-ext/object/valid-value":74}],12:[function(require,module,exports){ // Promise aware Array's reduce
'use strict';var assign=require('es5-ext/object/assign'),value=require('es5-ext/object/valid-value'),callable=require('es5-ext/object/valid-callable'),deferred=require('../../deferred'),isPromise=require('../../is-promise'),assimilate=require('../../assimilate'),call=Function.prototype.call,hasOwnProperty=Object.prototype.hasOwnProperty,resolve=deferred.resolve,Reduce;Reduce=function Reduce(list,cb,initial,initialized){this.list=list;this.cb=cb;this.initialized=initialized;this.length=list.length>>>0;initial=assimilate(initial);if(isPromise(initial)){if(!initial.resolved){assign(this,deferred());initial.done((function(initial){this.value=initial;this.init();}).bind(this),this.reject);return this.promise;}this.value=initial.value;if(initial.failed)return initial;}else {this.value=initial;}return this.init();};Reduce.prototype={current:0,state:false,init:function init(){while(this.current<this.length){if(hasOwnProperty.call(this.list,this.current))break;++this.current;}if(this.current===this.length){if(!this.initialized){throw new Error("Reduce of empty array with no initial value");}return this.resolve?this.resolve(this.value):resolve(this.value);}if(!this.promise)assign(this,deferred());this.processCb=this.processCb.bind(this);this.processValue=this.processValue.bind(this);this.continue();return this.promise;},continue:function _continue(){var result;while(!this.state){result=this.process();if(this.state!=='cb')break;result=this.processCb(result);if(this.state!=='value')break;this.processValue(result);}},process:function process(){var value=assimilate(this.list[this.current]);if(isPromise(value)){if(!value.resolved){value.done((function(result){result=this.processCb(result);if(this.state!=='value')return;this.processValue(result);if(!this.state)this.continue();}).bind(this),this.reject);return;}if(value.failed){this.reject(value.value);return;}value=value.value;}this.state='cb';return value;},processCb:function processCb(value){if(!this.initialized){this.initialized=true;this.state='value';return value;}if(this.cb){try{value=call.call(this.cb,undefined,this.value,value,this.current,this.list);}catch(e) {this.reject(e);return;}value=assimilate(value);if(isPromise(value)){if(!value.resolved){value.done((function(result){this.state='value';this.processValue(result);if(!this.state)this.continue();}).bind(this),this.reject);return;}if(value.failed){this.reject(value.value);return;}value=value.value;}}this.state='value';return value;},processValue:function processValue(value){this.value=value;while(++this.current<this.length){if(hasOwnProperty.call(this.list,this.current)){this.state=false;return;}}this.resolve(this.value);}};module.exports=function(cb /*, initial*/){value(this);cb==null||callable(cb);return new Reduce(this,cb,arguments[1],arguments.length>1);};},{"../../assimilate":5,"../../deferred":6,"../../is-promise":33,"es5-ext/object/assign":60,"es5-ext/object/valid-callable":72,"es5-ext/object/valid-value":74}],13:[function(require,module,exports){ // Promise aware Array's some
'use strict';module.exports=require('../../lib/some-every')(true);},{"../../lib/some-every":34}],14:[function(require,module,exports){ // Call asynchronous function
'use strict';var toArray=require('es5-ext/array/to-array'),callable=require('es5-ext/object/valid-callable'),deferred=require('../../deferred'),isPromise=require('../../is-promise'),processArguments=require('../_process-arguments'),slice=Array.prototype.slice,apply=Function.prototype.apply,applyFn,callAsync;applyFn=function applyFn(fn,args,def){args=toArray(args);apply.call(fn,this,args.concat(function(error,result){if(error==null){def.resolve(arguments.length>2?slice.call(arguments,1):result);}else {def.reject(error);}}));};callAsync=function callAsync(fn,length,context,args){var def;args=processArguments(args,length);if(isPromise(args)){if(args.failed)return args;def=deferred();args.done(function(args){if(fn.returnsPromise)return apply.call(fn,context,args);try{applyFn.call(context,fn,args,def);}catch(e) {def.reject(e);}},def.reject);return def.promise;}if(fn.returnsPromise)return apply.call(fn,context,args);def=deferred();try{applyFn.call(context,fn,args,def);}catch(e) {def.reject(e);throw e;}return def.promise;};module.exports=exports=function exports(context /*, …args*/){return callAsync(callable(this),null,context,slice.call(arguments,1));};Object.defineProperty(exports,'_base',{configurable:true,enumerable:false,writable:true,value:callAsync});},{"../../deferred":6,"../../is-promise":33,"../_process-arguments":8,"es5-ext/array/to-array":44,"es5-ext/object/valid-callable":72}],15:[function(require,module,exports){ // Delay function execution, return promise for delayed function result
'use strict';var callable=require('es5-ext/object/valid-callable'),nextTick=require('next-tick'),ensureTimeout=require('timers-ext/valid-timeout'),deferred=require('../../deferred'),apply=Function.prototype.apply,delayed;delayed=function delayed(fn,args,resolve,reject){var value;try{value=apply.call(fn,this,args);}catch(e) {reject(e);return;}resolve(value);};module.exports=function(timeout){var fn,result,delay;fn=callable(this);if(timeout==null){delay=nextTick;}else {timeout=ensureTimeout(timeout);delay=setTimeout;}result=function result(){var def=deferred();delay(delayed.bind(this,fn,arguments,def.resolve,def.reject),timeout);return def.promise;};result.returnsPromise=true;return result;};},{"../../deferred":6,"es5-ext/object/valid-callable":72,"next-tick":91,"timers-ext/valid-timeout":96}],16:[function(require,module,exports){ // Limit number of concurrent function executions (to cLimit number).
// Limited calls are queued. Optionaly maximum queue length can also be
// controlled with qLimit value, any calls that would reach over that limit
// would be discarded (its promise would resolve with "Too many calls" error)
'use strict';var toPosInt=require('es5-ext/number/to-pos-integer'),callable=require('es5-ext/object/valid-callable'),eeUnify=require('event-emitter/unify'),deferred=require('../../deferred'),isPromise=require('../../is-promise'),assimilate=require('../../assimilate'),resolve=deferred.resolve,reject=deferred.reject,apply=Function.prototype.apply,max=Math.max,gateReject;require('../promise/finally');gateReject=function gateReject(){var e=new Error("Too many calls");e.type='deferred-gate-rejected';return reject(e);};module.exports=function(cLimit,qLimit){var fn,count,decrement,unload,queue,run,result;fn=callable(this);cLimit=max(toPosInt(cLimit),1);qLimit=qLimit==null||isNaN(qLimit)?Infinity:toPosInt(qLimit);count=0;queue=[];run=function run(thisArg,args,def){var r;try{r=apply.call(fn,thisArg,args);}catch(e) {if(!def)return reject(e);def.reject(e);unload();return;}r=assimilate(r);if(isPromise(r)){if(def)eeUnify(def.promise,r);if(!r.resolved){++count;if(def)def.resolve(r);return r.finally(decrement);}r=r.value;}if(!def)return resolve(r);def.resolve(r);unload();};decrement=function decrement(){--count;unload();};unload=function unload(){var data;if(data=queue.shift())run.apply(null,data);};result=function result(){var def;if(count>=cLimit){if(queue.length<qLimit){def=deferred();queue.push([this,arguments,def]);return def.promise;}return gateReject();}return run(this,arguments);};result.returnsPromise=true;return result;};},{"../../assimilate":5,"../../deferred":6,"../../is-promise":33,"../promise/finally":23,"es5-ext/number/to-pos-integer":58,"es5-ext/object/valid-callable":72,"event-emitter/unify":90}],17:[function(require,module,exports){ // Promisify synchronous function
'use strict';var callable=require('es5-ext/object/valid-callable'),deferred=require('../../deferred'),isPromise=require('../../is-promise'),processArguments=require('../_process-arguments'),apply=Function.prototype.apply,applyFn;applyFn=function applyFn(fn,args,resolve,reject){var value;try{value=apply.call(fn,this,args);}catch(e) {reject(e);return;}resolve(value);};module.exports=function(length){var fn,result;fn=callable(this);if(fn.returnsPromise)return fn;if(length!=null)length=length>>>0;result=function result(){var args,def;args=processArguments(arguments,length);if(isPromise(args)){if(args.failed)return args;def=deferred();args.done((function(args){applyFn.call(this,fn,args,def.resolve,def.reject);}).bind(this),def.reject);}else {def=deferred();applyFn.call(this,fn,args,def.resolve,def.reject);}return def.promise;};result.returnsPromise=true;return result;};},{"../../deferred":6,"../../is-promise":33,"../_process-arguments":8,"es5-ext/object/valid-callable":72}],18:[function(require,module,exports){ // Promisify asynchronous function
'use strict';var callable=require('es5-ext/object/valid-callable'),callAsync=require('./call-async')._base;module.exports=function(length){var fn,result;fn=callable(this);if(fn.returnsPromise)return fn;if(length!=null)length=length>>>0;result=function result(){return callAsync(fn,length,this,arguments);};result.returnsPromise=true;return result;};},{"./call-async":14,"es5-ext/object/valid-callable":72}],19:[function(require,module,exports){ // Used by promise extensions that are based on array extensions.
'use strict';var callable=require('es5-ext/object/valid-callable'),deferred=require('../../deferred'),reject=deferred.reject;module.exports=function(name,ext){deferred.extend(name,function(cb){var def;cb==null||callable(cb);if(!this.pending)this.pending=[];def=deferred();this.pending.push(name,[arguments,def.resolve,def.reject]);return def.promise;},function(args,resolve,reject){var result;if(this.failed){reject(this.value);return;}try{result=ext.apply(this.value,args);}catch(e) {reject(e);return;}resolve(result);},function(cb){cb==null||callable(cb);if(this.failed)return this;try{return ext.apply(this.value,arguments);}catch(e) {return reject(e);}});};},{"../../deferred":6,"es5-ext/object/valid-callable":72}],20:[function(require,module,exports){ // 'aside' - Promise extension
//
// promise.aside(win, fail)
//
// Works in analogous way as promise function itself (or `then`)
// but instead of adding promise to promise chain it returns context promise and
// lets callback carry on with other processing logic
'use strict';var callable=require('es5-ext/object/valid-callable'),deferred=require('../../deferred');deferred.extend('aside',function(win,fail){win==null||callable(win);fail==null||callable(fail);if(win||fail){if(!this.pending){this.pending=[];}this.pending.push('aside',arguments);}return this;},function(win,fail){var cb=this.failed?fail:win;if(cb){cb(this.value);}},function(win,fail){var cb;win==null||callable(win);fail==null||callable(fail);cb=this.failed?fail:win;if(cb){cb(this.value);}return this;});},{"../../deferred":6,"es5-ext/object/valid-callable":72}],21:[function(require,module,exports){ // 'catch' - Promise extension
//
// promise.catch(cb)
//
// Same as `then` but accepts only onFail callback
'use strict';var isCallable=require('es5-ext/object/is-callable'),validValue=require('es5-ext/object/valid-value'),deferred=require('../../deferred'),isPromise=require('../../is-promise'),resolve=deferred.resolve,reject=deferred.reject;deferred.extend('catch',function(cb){var def;validValue(cb);if(!this.pending)this.pending=[];def=deferred();this.pending.push('catch',[cb,def.resolve,def.reject]);return def.promise;},function(cb,resolve,reject){var value;if(!this.failed){resolve(this.value);return;}if(isCallable(cb)){if(isPromise(cb)){if(cb.resolved){if(cb.failed)reject(cb.value);else resolve(cb.value);}else {cb.done(resolve,reject);}return;}try{value=cb(this.value);}catch(e) {reject(e);return;}resolve(value);return;}resolve(cb);},function(cb){var value;validValue(cb);if(!this.failed)return this;if(isCallable(cb)){if(isPromise(cb))return cb;try{value=cb(this.value);}catch(e) {return reject(e);}return resolve(value);}return resolve(cb);});},{"../../deferred":6,"../../is-promise":33,"es5-ext/object/is-callable":65,"es5-ext/object/valid-value":74}],22:[function(require,module,exports){ // 'cb' - Promise extension
//
// promise.cb(cb)
//
// Handles asynchronous function style callback (which is run in next event loop
// the earliest). Returns self promise. Callback is optional.
//
// Useful when we want to configure typical asynchronous function which logic is
// internally configured with promises.
//
// Extension can be used as follows:
//
// var foo = function (arg1, arg2, cb) {
//     var d = deferred();
//     // ... implementation
//     return d.promise.cb(cb);
// };
//
// `cb` extension returns promise and handles eventual callback (optional)
'use strict';var callable=require('es5-ext/object/valid-callable'),nextTick=require('next-tick'),deferred=require('../../deferred');deferred.extend('cb',function(cb){if(cb==null)return this;callable(cb);nextTick((function(){if(this.resolved){if(this.failed)cb(this.value);else cb(null,this.value);}else {if(!this.pending)this.pending=[];this.pending.push('cb',[cb]);}}).bind(this));return this;},function(cb){if(this.failed)cb(this.value);else cb(null,this.value);},function(cb){if(cb==null)return this;callable(cb);nextTick((function(){if(this.failed)cb(this.value);else cb(null,this.value);}).bind(this));return this;});},{"../../deferred":6,"es5-ext/object/valid-callable":72,"next-tick":91}],23:[function(require,module,exports){ // 'finally' - Promise extension
//
// promise.finally(cb)
//
// Called on promise resolution returns same promise, doesn't pass any values to
// provided callback
'use strict';var callable=require('es5-ext/object/valid-callable'),deferred=require('../../deferred');deferred.extend('finally',function(cb){callable(cb);if(!this.pending)this.pending=[];this.pending.push('finally',arguments);return this;},function(cb){cb();},function(cb){callable(cb)();return this;});},{"../../deferred":6,"es5-ext/object/valid-callable":72}],24:[function(require,module,exports){ // 'get' - Promise extension
//
// promise.get(name)
//
// Resolves with property of resolved object
'use strict';var value=require('es5-ext/object/valid-value'),deferred=require('../../deferred'),reduce=Array.prototype.reduce,resolve=deferred.resolve,reject=deferred.reject;deferred.extend('get',function() /*…name*/{var def;if(!this.pending)this.pending=[];def=deferred();this.pending.push('get',[arguments,def.resolve,def.reject]);return def.promise;},function(args,resolve,reject){var result;if(this.failed)reject(this.value);try{result=reduce.call(args,function(obj,key){return value(obj)[String(key)];},this.value);}catch(e) {reject(e);return;}resolve(result);},function() /*…name*/{var result;if(this.failed)return this;try{result=reduce.call(arguments,function(obj,key){return value(obj)[String(key)];},this.value);}catch(e) {return reject(e);}return resolve(result);});},{"../../deferred":6,"es5-ext/object/valid-value":74}],25:[function(require,module,exports){ // 'invokeAsync' - Promise extension
//
// promise.invokeAsync(name[, arg0[, arg1[, ...]]])
//
// On resolved object calls asynchronous method that takes callback
// (Node.js style).
// Do not pass callback, it's handled by internal implementation.
// 'name' can be method name or method itself.
'use strict';var toArray=require('es5-ext/array/to-array'),isCallable=require('es5-ext/object/is-callable'),deferred=require('../../deferred'),isPromise=require('../../is-promise'),processArguments=require('../_process-arguments'),slice=Array.prototype.slice,apply=Function.prototype.apply,reject=deferred.reject,applyFn;applyFn=function applyFn(fn,args,resolve,reject){var result;if(fn.returnsPromise){try{result=apply.call(fn,this,args);}catch(e) {reject(e);return;}return resolve(result);}args=toArray(args).concat(function(error,result){if(error==null){resolve(arguments.length>2?slice.call(arguments,1):result);}else {reject(error);}});try{apply.call(fn,this,args);}catch(e2) {reject(e2);}};deferred.extend('invokeAsync',function(method /*, …args*/){var def;if(!this.pending)this.pending=[];def=deferred();this.pending.push('invokeAsync',[arguments,def.resolve,def.reject]);return def.promise;},function(args,resolve,reject){var fn;if(this.failed){reject(this.value);return;}if(this.value==null){reject(new TypeError("Cannot use null or undefined"));return;}fn=args[0];if(!isCallable(fn)){fn=String(fn);if(!isCallable(this.value[fn])){reject(new TypeError(fn+" is not a function"));return;}fn=this.value[fn];}args=processArguments(slice.call(args,1));if(isPromise(args)){if(args.failed){reject(args.value);return;}args.done((function(args){applyFn.call(this,fn,args,resolve,reject);}).bind(this.value),reject);}else {applyFn.call(this.value,fn,args,resolve,reject);}},function(method /*, …args*/){var args,def;if(this.failed)return this;if(this.value==null){return reject(new TypeError("Cannot use null or undefined"));}if(!isCallable(method)){method=String(method);if(!isCallable(this.value[method])){return reject(new TypeError(method+" is not a function"));}method=this.value[method];}args=processArguments(slice.call(arguments,1));if(isPromise(args)){if(args.failed)return args;def=deferred();args.done((function(args){applyFn.call(this,method,args,def.resolve,def.reject);}).bind(this.value),def.reject);}else if(!method.returnsPromise){def=deferred();applyFn.call(this.value,method,args,def.resolve,def.reject);}else {return applyFn.call(this.value,method,args,deferred,reject);}return def.promise;});},{"../../deferred":6,"../../is-promise":33,"../_process-arguments":8,"es5-ext/array/to-array":44,"es5-ext/object/is-callable":65}],26:[function(require,module,exports){ // 'invoke' - Promise extension
//
// promise.invoke(name[, arg0[, arg1[, ...]]])
//
// On resolved object calls method that returns immediately.
// 'name' can be method name or method itself.
'use strict';var isCallable=require('es5-ext/object/is-callable'),deferred=require('../../deferred'),isPromise=require('../../is-promise'),processArguments=require('../_process-arguments'),slice=Array.prototype.slice,apply=Function.prototype.apply,reject=deferred.reject,applyFn;applyFn=function applyFn(fn,args,resolve,reject){var value;try{value=apply.call(fn,this,args);}catch(e) {return reject(e);}return resolve(value);};deferred.extend('invoke',function(method /*, …args*/){var def;if(!this.pending)this.pending=[];def=deferred();this.pending.push('invoke',[arguments,def.resolve,def.reject]);return def.promise;},function(args,resolve,reject){var fn;if(this.failed){reject(this.value);return;}if(this.value==null){reject(new TypeError("Cannot use null or undefined"));return;}fn=args[0];if(!isCallable(fn)){fn=String(fn);if(!isCallable(this.value[fn])){reject(new TypeError(fn+" is not a function"));return;}fn=this.value[fn];}args=processArguments(slice.call(args,1));if(isPromise(args)){if(args.failed){reject(args.value);return;}args.done((function(args){applyFn.call(this,fn,args,resolve,reject);}).bind(this.value),reject);}else {applyFn.call(this.value,fn,args,resolve,reject);}},function(method /*, …args*/){var args,def;if(this.failed)return this;if(this.value==null){return reject(new TypeError("Cannot use null or undefined"));}if(!isCallable(method)){method=String(method);if(!isCallable(this.value[method])){return reject(new TypeError(method+" is not a function"));}method=this.value[method];}args=processArguments(slice.call(arguments,1));if(isPromise(args)){if(args.failed)return args;def=deferred();args.done((function(args){applyFn.call(this,method,args,def.resolve,def.reject);}).bind(this.value),def.reject);return def.promise;}return applyFn.call(this.value,method,args,deferred,reject);});},{"../../deferred":6,"../../is-promise":33,"../_process-arguments":8,"es5-ext/object/is-callable":65}],27:[function(require,module,exports){ // 'map' - Promise extension
//
// promise.map(fn[, thisArg[, concurrentLimit]])
//
// Promise aware map for array-like results
'use strict';require('./_array')('map',require('../array/map'));},{"../array/map":11,"./_array":19}],28:[function(require,module,exports){ // 'reduce' - Promise extension
//
// promise.reduce(fn[, initial])
//
// Promise aware reduce for array-like results
'use strict';require('./_array')('reduce',require('../array/reduce'));},{"../array/reduce":12,"./_array":19}],29:[function(require,module,exports){ // 'some' - Promise extension
//
// promise.some(fn[, thisArg])
//
// Promise aware some for array-like results
'use strict';require('./_array')('some',require('../array/some'));},{"../array/some":13,"./_array":19}],30:[function(require,module,exports){ // 'spread' - Promise extensions
//
// promise.spread(onsuccess, onerror)
//
// Matches eventual list result onto function arguments,
// otherwise works same as 'then' (promise function itself)
'use strict';var spread=require('es5-ext/function/#/spread'),callable=require('es5-ext/object/valid-callable'),isCallable=require('es5-ext/object/is-callable'),isPromise=require('../../is-promise'),deferred=require('../../deferred'),resolve=deferred.resolve,reject=deferred.reject;deferred.extend('spread',function(win,fail){var def;win==null||callable(win);if(!win&&fail==null)return this;if(!this.pending)this.pending=[];def=deferred();this.pending.push('spread',[win,fail,def.resolve,def.reject]);return def.promise;},function(win,fail,resolve,reject){var cb,value;cb=this.failed?fail:win;if(cb==null){if(this.failed)reject(this.value);else resolve(this.value);}if(isCallable(cb)){if(isPromise(cb)){if(cb.resolved){if(cb.failed)reject(cb.value);else resolve(cb.value);}else {cb.done(resolve,reject);}return;}if(!this.failed)cb=spread.call(cb);try{value=cb(this.value);}catch(e) {reject(e);return;}resolve(value);}else {resolve(cb);}},function(win,fail){var cb,value;cb=this.failed?fail:win;if(cb==null)return this;if(isCallable(cb)){if(isPromise(cb))return cb;if(!this.failed)cb=spread.call(cb);try{value=cb(this.value);}catch(e) {return reject(e);}return resolve(value);}return resolve(cb);});},{"../../deferred":6,"../../is-promise":33,"es5-ext/function/#/spread":47,"es5-ext/object/is-callable":65,"es5-ext/object/valid-callable":72}],31:[function(require,module,exports){ // This construct deferred with all needed goodies that are being exported
// when we import 'deferred' by main name.
// All available promise extensions are also initialized.
'use strict';var call=Function.prototype.call,assign=require('es5-ext/object/assign');module.exports=assign(require('./deferred'),{invokeAsync:require('./invoke-async'),isPromise:require('./is-promise'),dynamicQueue:require('./dynamic-queue'),validPromise:require('./valid-promise'),callAsync:call.bind(require('./ext/function/call-async')),delay:call.bind(require('./ext/function/delay')),gate:call.bind(require('./ext/function/gate')),monitor:require('./monitor'),promisify:call.bind(require('./ext/function/promisify')),promisifySync:call.bind(require('./ext/function/promisify-sync')),every:call.bind(require('./ext/array/every')),find:call.bind(require('./ext/array/find')),map:call.bind(require('./ext/array/map')),reduce:call.bind(require('./ext/array/reduce')),some:call.bind(require('./ext/array/some'))},require('./profiler'));require('./ext/promise/aside');require('./ext/promise/catch');require('./ext/promise/cb');require('./ext/promise/finally');require('./ext/promise/get');require('./ext/promise/invoke');require('./ext/promise/invoke-async');require('./ext/promise/map');require('./ext/promise/spread');require('./ext/promise/some');require('./ext/promise/reduce');},{"./deferred":6,"./dynamic-queue":7,"./ext/array/every":9,"./ext/array/find":10,"./ext/array/map":11,"./ext/array/reduce":12,"./ext/array/some":13,"./ext/function/call-async":14,"./ext/function/delay":15,"./ext/function/gate":16,"./ext/function/promisify":18,"./ext/function/promisify-sync":17,"./ext/promise/aside":20,"./ext/promise/catch":21,"./ext/promise/cb":22,"./ext/promise/finally":23,"./ext/promise/get":24,"./ext/promise/invoke":26,"./ext/promise/invoke-async":25,"./ext/promise/map":27,"./ext/promise/reduce":28,"./ext/promise/some":29,"./ext/promise/spread":30,"./invoke-async":32,"./is-promise":33,"./monitor":35,"./profiler":36,"./valid-promise":37,"es5-ext/object/assign":60}],32:[function(require,module,exports){ // Invoke asynchronous function
'use strict';var isCallable=require('es5-ext/object/is-callable'),callable=require('es5-ext/object/valid-callable'),value=require('es5-ext/object/valid-value'),callAsync=require('./ext/function/call-async')._base,slice=Array.prototype.slice;module.exports=function(obj,fn /*, …args*/){value(obj);if(!isCallable(fn))fn=callable(obj[fn]);return callAsync(fn,null,obj,slice.call(arguments,2));};},{"./ext/function/call-async":14,"es5-ext/object/is-callable":65,"es5-ext/object/valid-callable":72,"es5-ext/object/valid-value":74}],33:[function(require,module,exports){ // Whether given object is a promise
'use strict';module.exports=function(o){return typeof o==='function'&&typeof o.then==='function'&&o.end!==o.done;};},{}],34:[function(require,module,exports){ // Promise aware Array's some
'use strict';var assign=require('es5-ext/object/assign'),value=require('es5-ext/object/valid-value'),callable=require('es5-ext/object/valid-callable'),deferred=require('../deferred'),isPromise=require('../is-promise'),assimilate=require('../assimilate'),call=Function.prototype.call,resolve=deferred.resolve;module.exports=function(resolvent){var Iterator=function Iterator(list,cb,context){this.list=list;this.cb=cb;this.context=context;this.length=list.length>>>0;while(this.current<this.length){if(this.current in list){assign(this,deferred());this.processCb=this.processCb.bind(this);this.processValue=this.processValue.bind(this);this.continue();return this.promise;}++this.current;}return resolve(!resolvent);};Iterator.prototype={current:0,state:false,continue:function _continue(){var result;while(!this.state){result=this.process();if(this.state!=='cb')break;result=this.processCb(result);if(this.state!=='value')break;this.processValue(result);}},process:function process(){var value=assimilate(this.list[this.current]);if(isPromise(value)){if(!value.resolved){value.done((function(result){result=this.processCb(result);if(this.state!=='value')return;this.processValue(result);if(!this.state)this.continue();}).bind(this),this.reject);return;}if(value.failed){this.reject(value.value);return;}value=value.value;}this.state='cb';return value;},processCb:function processCb(value){if(this.cb){try{value=call.call(this.cb,this.context,value,this.current,this.list);}catch(e) {this.reject(e);return;}value=assimilate(value);if(isPromise(value)){if(!value.resolved){value.done((function(result){this.state='value';this.processValue(result);if(!this.state)this.continue();}).bind(this),this.reject);return;}if(value.failed){this.reject(value.value);return;}value=value.value;}}this.state='value';return value;},processValue:function processValue(value){if(Boolean(value)===resolvent){this.resolve(resolvent);return;}while(++this.current<this.length){if(this.current in this.list){this.state=false;return;}}this.resolve(!resolvent);}};return function(cb /*, thisArg*/){value(this);cb==null||callable(cb);return new Iterator(this,cb,arguments[1]);};};},{"../assimilate":5,"../deferred":6,"../is-promise":33,"es5-ext/object/assign":60,"es5-ext/object/valid-callable":72,"es5-ext/object/valid-value":74}],35:[function(require,module,exports){ // Run if you want to monitor unresolved promises (in properly working
// application there should be no promises that are never resolved)
'use strict';var max=Math.max,callable=require('es5-ext/object/valid-callable'),isCallable=require('es5-ext/object/is-callable'),toPosInt=require('es5-ext/number/to-pos-integer'),deferred=require('./deferred');exports=module.exports=function(timeout,cb){if(timeout===false){ // Cancel monitor
delete deferred._monitor;delete exports.timeout;delete exports.callback;return;}exports.timeout=timeout=max(toPosInt(timeout)||5000,50);if(cb==null){if(typeof console!=='undefined'&&console&&isCallable(console.error)){cb=function cb(e){console.error(e.stack&&e.stack.toString()||"Unresolved promise: no stack available");};}}else {callable(cb);}exports.callback=cb;deferred._monitor=function(){var e=new Error("Unresolved promise");return setTimeout(function(){if(cb)cb(e);},timeout);};};},{"./deferred":6,"es5-ext/number/to-pos-integer":58,"es5-ext/object/is-callable":65,"es5-ext/object/valid-callable":72}],36:[function(require,module,exports){'use strict';var partial=require('es5-ext/function/#/partial'),forEach=require('es5-ext/object/for-each'),pad=require('es5-ext/string/#/pad'),deferred=require('./deferred'),resolved,rStats,unresolved,uStats,profile;exports.profile=function(){resolved=0;rStats={};unresolved=0;uStats={};deferred._profile=profile;};profile=function profile(isResolved){var stack,data;if(isResolved){++resolved;data=rStats;}else {++unresolved;data=uStats;}stack=new Error().stack;if(!stack.split('\n').slice(3).some(function(line){if(line.search(/[\/\\]deferred[\/\\]/)===-1&&line.search(/[\/\\]es5-ext[\/\\]/)===-1&&line.indexOf(' (native)')===-1){line=line.replace(/\n/g,"\\n").trim();if(!data[line]){data[line]={count:0};}++data[line].count;return true;}})){if(!data.unknown){data.unknown={count:0,stack:stack};}++data.unknown.count;}};exports.profileEnd=function(){var total,lpad,log='';if(!deferred._profile){throw new Error("Deferred profiler was not initialized");}delete deferred._profile;log+="------------------------------------------------------------\n";log+="Deferred usage statistics:\n\n";total=String(resolved+unresolved);lpad=partial.call(pad," ",total.length);log+=total+" Total promises initialized\n";log+=lpad.call(unresolved)+" Initialized as Unresolved\n";log+=lpad.call(resolved)+" Initialized as Resolved\n";if(unresolved){log+="\nUnresolved promises were initialized at:\n";forEach(uStats,function(data,name){log+=lpad.call(data.count)+" "+name+"\n";},null,function(a,b){return this[b].count-this[a].count;});}if(resolved){log+="\nResolved promises were initialized at:\n";forEach(rStats,function(data,name){log+=lpad.call(data.count)+" "+name+"\n";},null,function(a,b){return this[b].count-this[a].count;});}log+="------------------------------------------------------------\n";return {log:log,resolved:{count:resolved,stats:rStats},unresolved:{count:unresolved,stats:uStats}};};},{"./deferred":6,"es5-ext/function/#/partial":46,"es5-ext/object/for-each":63,"es5-ext/string/#/pad":78}],37:[function(require,module,exports){'use strict';var isPromise=require('./is-promise');module.exports=function(x){if(!isPromise(x)){throw new TypeError(x+" is not a promise object");}return x;};},{"./is-promise":33}],38:[function(require,module,exports){'use strict';module.exports=require('./is-implemented')()?Array.from:require('./shim');},{"./is-implemented":39,"./shim":40}],39:[function(require,module,exports){'use strict';module.exports=function(){var from=Array.from,arr,result;if(typeof from!=='function')return false;arr=['raz','dwa'];result=from(arr);return Boolean(result&&result!==arr&&result[1]==='dwa');};},{}],40:[function(require,module,exports){'use strict';var iteratorSymbol=require('es6-symbol').iterator,isArguments=require('../../function/is-arguments'),isFunction=require('../../function/is-function'),toPosInt=require('../../number/to-pos-integer'),callable=require('../../object/valid-callable'),validValue=require('../../object/valid-value'),isString=require('../../string/is-string'),isArray=Array.isArray,call=Function.prototype.call,desc={configurable:true,enumerable:true,writable:true,value:null},defineProperty=Object.defineProperty;module.exports=function(arrayLike /*, mapFn, thisArg*/){var mapFn=arguments[1],thisArg=arguments[2],Constructor,i,j,arr,l,code,iterator,result,getIterator,value;arrayLike=Object(validValue(arrayLike));if(mapFn!=null)callable(mapFn);if(!this||this===Array||!isFunction(this)){ // Result: Plain array
if(!mapFn){if(isArguments(arrayLike)){ // Source: Arguments
l=arrayLike.length;if(l!==1)return Array.apply(null,arrayLike);arr=new Array(1);arr[0]=arrayLike[0];return arr;}if(isArray(arrayLike)){ // Source: Array
arr=new Array(l=arrayLike.length);for(i=0;i<l;++i){arr[i]=arrayLike[i];}return arr;}}arr=[];}else { // Result: Non plain array
Constructor=this;}if(!isArray(arrayLike)){if((getIterator=arrayLike[iteratorSymbol])!==undefined){ // Source: Iterator
iterator=callable(getIterator).call(arrayLike);if(Constructor)arr=new Constructor();result=iterator.next();i=0;while(!result.done){value=mapFn?call.call(mapFn,thisArg,result.value,i):result.value;if(!Constructor){arr[i]=value;}else {desc.value=value;defineProperty(arr,i,desc);}result=iterator.next();++i;}l=i;}else if(isString(arrayLike)){ // Source: String
l=arrayLike.length;if(Constructor)arr=new Constructor();for(i=0,j=0;i<l;++i){value=arrayLike[i];if(i+1<l){code=value.charCodeAt(0);if(code>=0xD800&&code<=0xDBFF)value+=arrayLike[++i];}value=mapFn?call.call(mapFn,thisArg,value,j):value;if(!Constructor){arr[j]=value;}else {desc.value=value;defineProperty(arr,j,desc);}++j;}l=j;}}if(l===undefined){ // Source: array or array-like
l=toPosInt(arrayLike.length);if(Constructor)arr=new Constructor(l);for(i=0;i<l;++i){value=mapFn?call.call(mapFn,thisArg,arrayLike[i],i):arrayLike[i];if(!Constructor){arr[i]=value;}else {desc.value=value;defineProperty(arr,i,desc);}}}if(Constructor){desc.value=null;arr.length=l;}return arr;};},{"../../function/is-arguments":49,"../../function/is-function":50,"../../number/to-pos-integer":58,"../../object/valid-callable":72,"../../object/valid-value":74,"../../string/is-string":82,"es6-symbol":84}],41:[function(require,module,exports){'use strict';module.exports=require('./is-implemented')()?Array.of:require('./shim');},{"./is-implemented":42,"./shim":43}],42:[function(require,module,exports){'use strict';module.exports=function(){var of=Array.of,result;if(typeof of!=='function')return false;result=of('foo','bar');return Boolean(result&&result[1]==='bar');};},{}],43:[function(require,module,exports){'use strict';var isFunction=require('../../function/is-function'),slice=Array.prototype.slice,defineProperty=Object.defineProperty,desc={configurable:true,enumerable:true,writable:true,value:null};module.exports=function() /*…items*/{var result,i,l;if(!this||this===Array||!isFunction(this))return slice.call(arguments);result=new this(l=arguments.length);for(i=0;i<l;++i){desc.value=arguments[i];defineProperty(result,i,desc);}desc.value=null;result.length=l;return result;};},{"../../function/is-function":50}],44:[function(require,module,exports){'use strict';var from=require('./from'),isArray=Array.isArray;module.exports=function(arrayLike){return isArray(arrayLike)?arrayLike:from(arrayLike);};},{"./from":38}],45:[function(require,module,exports){'use strict';var toString=Object.prototype.toString,id=toString.call(new Error());module.exports=function(x){return x&&(x instanceof Error||toString.call(x)===id)||false;};},{}],46:[function(require,module,exports){'use strict';var callable=require('../../object/valid-callable'),aFrom=require('../../array/from'),defineLength=require('../_define-length'),apply=Function.prototype.apply;module.exports=function() /*…args*/{var fn=callable(this),args=aFrom(arguments);return defineLength(function(){return apply.call(fn,this,args.concat(aFrom(arguments)));},fn.length-args.length);};},{"../../array/from":38,"../../object/valid-callable":72,"../_define-length":48}],47:[function(require,module,exports){'use strict';var callable=require('../../object/valid-callable'),apply=Function.prototype.apply;module.exports=function(){var fn=callable(this);return function(args){return apply.call(fn,this,args);};};},{"../../object/valid-callable":72}],48:[function(require,module,exports){'use strict';var toPosInt=require('../number/to-pos-integer'),test=function test(a,b){},desc,defineProperty,generate,mixin;try{Object.defineProperty(test,'length',{configurable:true,writable:false,enumerable:false,value:1});}catch(ignore) {}if(test.length===1){ // ES6
desc={configurable:true,writable:false,enumerable:false};defineProperty=Object.defineProperty;module.exports=function(fn,length){length=toPosInt(length);if(fn.length===length)return fn;desc.value=length;return defineProperty(fn,'length',desc);};}else {mixin=require('../object/mixin');generate=(function(){var cache=[];return function(l){var args,i=0;if(cache[l])return cache[l];args=[];while(l--){args.push('a'+(++i).toString(36));}return new Function('fn','return function ('+args.join(', ')+') { return fn.apply(this, arguments); };');};})();module.exports=function(src,length){var target;length=toPosInt(length);if(src.length===length)return src;target=generate(length)(src);try{mixin(target,src);}catch(ignore) {}return target;};}},{"../number/to-pos-integer":58,"../object/mixin":70}],49:[function(require,module,exports){'use strict';var toString=Object.prototype.toString,id=toString.call((function(){return arguments;})());module.exports=function(x){return toString.call(x)===id;};},{}],50:[function(require,module,exports){'use strict';var toString=Object.prototype.toString,id=toString.call(require('./noop'));module.exports=function(f){return typeof f==="function"&&toString.call(f)===id;};},{"./noop":51}],51:[function(require,module,exports){'use strict';module.exports=function(){};},{}],52:[function(require,module,exports){'use strict';var iteratorSymbol=require('es6-symbol').iterator,isArrayLike=require('../object/is-array-like');module.exports=function(x){if(x==null)return false;if(typeof x[iteratorSymbol]==='function')return true;return isArrayLike(x);};},{"../object/is-array-like":64,"es6-symbol":84}],53:[function(require,module,exports){'use strict';var isObject=require('../object/is-object'),is=require('./is');module.exports=function(x){if(is(x)&&isObject(x))return x;throw new TypeError(x+" is not an iterable or array-like object");};},{"../object/is-object":66,"./is":52}],54:[function(require,module,exports){'use strict';module.exports=require('./is-implemented')()?Math.sign:require('./shim');},{"./is-implemented":55,"./shim":56}],55:[function(require,module,exports){'use strict';module.exports=function(){var sign=Math.sign;if(typeof sign!=='function')return false;return sign(10)===1&&sign(-20)===-1;};},{}],56:[function(require,module,exports){'use strict';module.exports=function(value){value=Number(value);if(isNaN(value)||value===0)return value;return value>0?1:-1;};},{}],57:[function(require,module,exports){'use strict';var sign=require('../math/sign'),abs=Math.abs,floor=Math.floor;module.exports=function(value){if(isNaN(value))return 0;value=Number(value);if(value===0||!isFinite(value))return value;return sign(value)*floor(abs(value));};},{"../math/sign":54}],58:[function(require,module,exports){'use strict';var toInteger=require('./to-integer'),max=Math.max;module.exports=function(value){return max(0,toInteger(value));};},{"./to-integer":57}],59:[function(require,module,exports){ // Internal method, used by iteration functions.
// Calls a function for each key-value pair found in object
// Optionally takes compareFn to iterate object in specific order
'use strict';var callable=require('./valid-callable'),value=require('./valid-value'),bind=Function.prototype.bind,call=Function.prototype.call,keys=Object.keys,propertyIsEnumerable=Object.prototype.propertyIsEnumerable;module.exports=function(method,defVal){return function(obj,cb /*, thisArg, compareFn*/){var list,thisArg=arguments[2],compareFn=arguments[3];obj=Object(value(obj));callable(cb);list=keys(obj);if(compareFn){list.sort(typeof compareFn==='function'?bind.call(compareFn,obj):undefined);}if(typeof method!=='function')method=list[method];return call.call(method,list,function(key,index){if(!propertyIsEnumerable.call(obj,key))return defVal;return call.call(cb,thisArg,obj[key],key,obj,index);});};};},{"./valid-callable":72,"./valid-value":74}],60:[function(require,module,exports){'use strict';module.exports=require('./is-implemented')()?Object.assign:require('./shim');},{"./is-implemented":61,"./shim":62}],61:[function(require,module,exports){'use strict';module.exports=function(){var assign=Object.assign,obj;if(typeof assign!=='function')return false;obj={foo:'raz'};assign(obj,{bar:'dwa'},{trzy:'trzy'});return obj.foo+obj.bar+obj.trzy==='razdwatrzy';};},{}],62:[function(require,module,exports){'use strict';var keys=require('../keys'),value=require('../valid-value'),max=Math.max;module.exports=function(dest,src /*, …srcn*/){var error,i,l=max(arguments.length,2),assign;dest=Object(value(dest));assign=function assign(key){try{dest[key]=src[key];}catch(e) {if(!error)error=e;}};for(i=1;i<l;++i){src=arguments[i];keys(src).forEach(assign);}if(error!==undefined)throw error;return dest;};},{"../keys":67,"../valid-value":74}],63:[function(require,module,exports){'use strict';module.exports=require('./_iterate')('forEach');},{"./_iterate":59}],64:[function(require,module,exports){'use strict';var isFunction=require('../function/is-function'),isObject=require('./is-object');module.exports=function(x){return x!=null&&typeof x.length==='number'&&( // Just checking ((typeof x === 'object') && (typeof x !== 'function'))
// won't work right for some cases, e.g.:
// type of instance of NodeList in Safari is a 'function'
isObject(x)&&!isFunction(x)||typeof x==="string")||false;};},{"../function/is-function":50,"./is-object":66}],65:[function(require,module,exports){ // Deprecated
'use strict';module.exports=function(obj){return typeof obj==='function';};},{}],66:[function(require,module,exports){'use strict';var map={function:true,object:true};module.exports=function(x){return x!=null&&map[typeof x==="undefined"?"undefined":_typeof2(x)]||false;};},{}],67:[function(require,module,exports){'use strict';module.exports=require('./is-implemented')()?Object.keys:require('./shim');},{"./is-implemented":68,"./shim":69}],68:[function(require,module,exports){'use strict';module.exports=function(){try{Object.keys('primitive');return true;}catch(e) {return false;}};},{}],69:[function(require,module,exports){'use strict';var keys=Object.keys;module.exports=function(object){return keys(object==null?object:Object(object));};},{}],70:[function(require,module,exports){'use strict';var value=require('./valid-value'),defineProperty=Object.defineProperty,getOwnPropertyDescriptor=Object.getOwnPropertyDescriptor,getOwnPropertyNames=Object.getOwnPropertyNames;module.exports=function(target,source){var error;target=Object(value(target));getOwnPropertyNames(Object(value(source))).forEach(function(name){try{defineProperty(target,name,getOwnPropertyDescriptor(source,name));}catch(e) {error=e;}});if(error!==undefined)throw error;return target;};},{"./valid-value":74}],71:[function(require,module,exports){'use strict';var forEach=Array.prototype.forEach,create=Object.create;var process=function process(src,obj){var key;for(key in src){obj[key]=src[key];}};module.exports=function(options /*, …options*/){var result=create(null);forEach.call(arguments,function(options){if(options==null)return;process(Object(options),result);});return result;};},{}],72:[function(require,module,exports){'use strict';module.exports=function(fn){if(typeof fn!=='function')throw new TypeError(fn+" is not a function");return fn;};},{}],73:[function(require,module,exports){'use strict';var isObject=require('./is-object');module.exports=function(value){if(!isObject(value))throw new TypeError(value+" is not an Object");return value;};},{"./is-object":66}],74:[function(require,module,exports){'use strict';module.exports=function(value){if(value==null)throw new TypeError("Cannot use null or undefined");return value;};},{}],75:[function(require,module,exports){'use strict';module.exports=require('./is-implemented')()?String.prototype.contains:require('./shim');},{"./is-implemented":76,"./shim":77}],76:[function(require,module,exports){'use strict';var str='razdwatrzy';module.exports=function(){if(typeof str.contains!=='function')return false;return str.contains('dwa')===true&&str.contains('foo')===false;};},{}],77:[function(require,module,exports){'use strict';var indexOf=String.prototype.indexOf;module.exports=function(searchString /*, position*/){return indexOf.call(this,searchString,arguments[1])>-1;};},{}],78:[function(require,module,exports){'use strict';var toInteger=require('../../number/to-integer'),value=require('../../object/valid-value'),repeat=require('./repeat'),abs=Math.abs,max=Math.max;module.exports=function(fill /*, length*/){var self=String(value(this)),sLength=self.length,length=arguments[1];length=isNaN(length)?1:toInteger(length);fill=repeat.call(String(fill),abs(length));if(length>=0)return fill.slice(0,max(0,length-sLength))+self;return self+(sLength+length>=0?'':fill.slice(length+sLength));};},{"../../number/to-integer":57,"../../object/valid-value":74,"./repeat":79}],79:[function(require,module,exports){'use strict';module.exports=require('./is-implemented')()?String.prototype.repeat:require('./shim');},{"./is-implemented":80,"./shim":81}],80:[function(require,module,exports){'use strict';var str='foo';module.exports=function(){if(typeof str.repeat!=='function')return false;return str.repeat(2)==='foofoo';};},{}],81:[function(require,module,exports){ // Thanks: http://www.2ality.com/2014/01/efficient-string-repeat.html
'use strict';var value=require('../../../object/valid-value'),toInteger=require('../../../number/to-integer');module.exports=function(count){var str=String(value(this)),result;count=toInteger(count);if(count<0)throw new RangeError("Count must be >= 0");if(!isFinite(count))throw new RangeError("Count must be < ∞");result='';if(!count)return result;while(true){if(count&1)result+=str;count>>>=1;if(count<=0)break;str+=str;}return result;};},{"../../../number/to-integer":57,"../../../object/valid-value":74}],82:[function(require,module,exports){'use strict';var toString=Object.prototype.toString,id=toString.call('');module.exports=function(x){return typeof x==='string'||x&&(typeof x==="undefined"?"undefined":_typeof2(x))==='object'&&(x instanceof String||toString.call(x)===id)||false;};},{}],83:[function(require,module,exports){(function(process,global){ /*!
 * @overview es6-promise - a tiny implementation of Promises/A+.
 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
 * @license   Licensed under MIT license
 *            See https://raw.githubusercontent.com/jakearchibald/es6-promise/master/LICENSE
 * @version   3.1.2
 */(function(){"use strict";function lib$es6$promise$utils$$objectOrFunction(x){return typeof x==='function'||(typeof x==="undefined"?"undefined":_typeof2(x))==='object'&&x!==null;}function lib$es6$promise$utils$$isFunction(x){return typeof x==='function';}function lib$es6$promise$utils$$isMaybeThenable(x){return (typeof x==="undefined"?"undefined":_typeof2(x))==='object'&&x!==null;}var lib$es6$promise$utils$$_isArray;if(!Array.isArray){lib$es6$promise$utils$$_isArray=function lib$es6$promise$utils$$_isArray(x){return Object.prototype.toString.call(x)==='[object Array]';};}else {lib$es6$promise$utils$$_isArray=Array.isArray;}var lib$es6$promise$utils$$isArray=lib$es6$promise$utils$$_isArray;var lib$es6$promise$asap$$len=0;var lib$es6$promise$asap$$vertxNext;var lib$es6$promise$asap$$customSchedulerFn;var lib$es6$promise$asap$$asap=function asap(callback,arg){lib$es6$promise$asap$$queue[lib$es6$promise$asap$$len]=callback;lib$es6$promise$asap$$queue[lib$es6$promise$asap$$len+1]=arg;lib$es6$promise$asap$$len+=2;if(lib$es6$promise$asap$$len===2){ // If len is 2, that means that we need to schedule an async flush.
// If additional callbacks are queued before the queue is flushed, they
// will be processed by this flush that we are scheduling.
if(lib$es6$promise$asap$$customSchedulerFn){lib$es6$promise$asap$$customSchedulerFn(lib$es6$promise$asap$$flush);}else {lib$es6$promise$asap$$scheduleFlush();}}};function lib$es6$promise$asap$$setScheduler(scheduleFn){lib$es6$promise$asap$$customSchedulerFn=scheduleFn;}function lib$es6$promise$asap$$setAsap(asapFn){lib$es6$promise$asap$$asap=asapFn;}var lib$es6$promise$asap$$browserWindow=typeof window!=='undefined'?window:undefined;var lib$es6$promise$asap$$browserGlobal=lib$es6$promise$asap$$browserWindow||{};var lib$es6$promise$asap$$BrowserMutationObserver=lib$es6$promise$asap$$browserGlobal.MutationObserver||lib$es6$promise$asap$$browserGlobal.WebKitMutationObserver;var lib$es6$promise$asap$$isNode=typeof process!=='undefined'&&({}).toString.call(process)==='[object process]'; // test for web worker but not in IE10
var lib$es6$promise$asap$$isWorker=typeof Uint8ClampedArray!=='undefined'&&typeof importScripts!=='undefined'&&typeof MessageChannel!=='undefined'; // node
function lib$es6$promise$asap$$useNextTick(){ // node version 0.10.x displays a deprecation warning when nextTick is used recursively
// see https://github.com/cujojs/when/issues/410 for details
return function(){process.nextTick(lib$es6$promise$asap$$flush);};} // vertx
function lib$es6$promise$asap$$useVertxTimer(){return function(){lib$es6$promise$asap$$vertxNext(lib$es6$promise$asap$$flush);};}function lib$es6$promise$asap$$useMutationObserver(){var iterations=0;var observer=new lib$es6$promise$asap$$BrowserMutationObserver(lib$es6$promise$asap$$flush);var node=document.createTextNode('');observer.observe(node,{characterData:true});return function(){node.data=iterations=++iterations%2;};} // web worker
function lib$es6$promise$asap$$useMessageChannel(){var channel=new MessageChannel();channel.port1.onmessage=lib$es6$promise$asap$$flush;return function(){channel.port2.postMessage(0);};}function lib$es6$promise$asap$$useSetTimeout(){return function(){setTimeout(lib$es6$promise$asap$$flush,1);};}var lib$es6$promise$asap$$queue=new Array(1000);function lib$es6$promise$asap$$flush(){for(var i=0;i<lib$es6$promise$asap$$len;i+=2){var callback=lib$es6$promise$asap$$queue[i];var arg=lib$es6$promise$asap$$queue[i+1];callback(arg);lib$es6$promise$asap$$queue[i]=undefined;lib$es6$promise$asap$$queue[i+1]=undefined;}lib$es6$promise$asap$$len=0;}function lib$es6$promise$asap$$attemptVertx(){try{var r=require;var vertx=r('vertx');lib$es6$promise$asap$$vertxNext=vertx.runOnLoop||vertx.runOnContext;return lib$es6$promise$asap$$useVertxTimer();}catch(e) {return lib$es6$promise$asap$$useSetTimeout();}}var lib$es6$promise$asap$$scheduleFlush; // Decide what async method to use to triggering processing of queued callbacks:
if(lib$es6$promise$asap$$isNode){lib$es6$promise$asap$$scheduleFlush=lib$es6$promise$asap$$useNextTick();}else if(lib$es6$promise$asap$$BrowserMutationObserver){lib$es6$promise$asap$$scheduleFlush=lib$es6$promise$asap$$useMutationObserver();}else if(lib$es6$promise$asap$$isWorker){lib$es6$promise$asap$$scheduleFlush=lib$es6$promise$asap$$useMessageChannel();}else if(lib$es6$promise$asap$$browserWindow===undefined&&typeof require==='function'){lib$es6$promise$asap$$scheduleFlush=lib$es6$promise$asap$$attemptVertx();}else {lib$es6$promise$asap$$scheduleFlush=lib$es6$promise$asap$$useSetTimeout();}function lib$es6$promise$then$$then(onFulfillment,onRejection){var parent=this;var state=parent._state;if(state===lib$es6$promise$$internal$$FULFILLED&&!onFulfillment||state===lib$es6$promise$$internal$$REJECTED&&!onRejection){return this;}var child=new this.constructor(lib$es6$promise$$internal$$noop);var result=parent._result;if(state){var callback=arguments[state-1];lib$es6$promise$asap$$asap(function(){lib$es6$promise$$internal$$invokeCallback(state,child,callback,result);});}else {lib$es6$promise$$internal$$subscribe(parent,child,onFulfillment,onRejection);}return child;}var lib$es6$promise$then$$default=lib$es6$promise$then$$then;function lib$es6$promise$promise$resolve$$resolve(object){ /*jshint validthis:true */var Constructor=this;if(object&&(typeof object==="undefined"?"undefined":_typeof2(object))==='object'&&object.constructor===Constructor){return object;}var promise=new Constructor(lib$es6$promise$$internal$$noop);lib$es6$promise$$internal$$resolve(promise,object);return promise;}var lib$es6$promise$promise$resolve$$default=lib$es6$promise$promise$resolve$$resolve;function lib$es6$promise$$internal$$noop(){}var lib$es6$promise$$internal$$PENDING=void 0;var lib$es6$promise$$internal$$FULFILLED=1;var lib$es6$promise$$internal$$REJECTED=2;var lib$es6$promise$$internal$$GET_THEN_ERROR=new lib$es6$promise$$internal$$ErrorObject();function lib$es6$promise$$internal$$selfFulfillment(){return new TypeError("You cannot resolve a promise with itself");}function lib$es6$promise$$internal$$cannotReturnOwn(){return new TypeError('A promises callback cannot return that same promise.');}function lib$es6$promise$$internal$$getThen(promise){try{return promise.then;}catch(error) {lib$es6$promise$$internal$$GET_THEN_ERROR.error=error;return lib$es6$promise$$internal$$GET_THEN_ERROR;}}function lib$es6$promise$$internal$$tryThen(then,value,fulfillmentHandler,rejectionHandler){try{then.call(value,fulfillmentHandler,rejectionHandler);}catch(e) {return e;}}function lib$es6$promise$$internal$$handleForeignThenable(promise,thenable,then){lib$es6$promise$asap$$asap(function(promise){var sealed=false;var error=lib$es6$promise$$internal$$tryThen(then,thenable,function(value){if(sealed){return;}sealed=true;if(thenable!==value){lib$es6$promise$$internal$$resolve(promise,value);}else {lib$es6$promise$$internal$$fulfill(promise,value);}},function(reason){if(sealed){return;}sealed=true;lib$es6$promise$$internal$$reject(promise,reason);},'Settle: '+(promise._label||' unknown promise'));if(!sealed&&error){sealed=true;lib$es6$promise$$internal$$reject(promise,error);}},promise);}function lib$es6$promise$$internal$$handleOwnThenable(promise,thenable){if(thenable._state===lib$es6$promise$$internal$$FULFILLED){lib$es6$promise$$internal$$fulfill(promise,thenable._result);}else if(thenable._state===lib$es6$promise$$internal$$REJECTED){lib$es6$promise$$internal$$reject(promise,thenable._result);}else {lib$es6$promise$$internal$$subscribe(thenable,undefined,function(value){lib$es6$promise$$internal$$resolve(promise,value);},function(reason){lib$es6$promise$$internal$$reject(promise,reason);});}}function lib$es6$promise$$internal$$handleMaybeThenable(promise,maybeThenable,then){if(maybeThenable.constructor===promise.constructor&&then===lib$es6$promise$then$$default&&constructor.resolve===lib$es6$promise$promise$resolve$$default){lib$es6$promise$$internal$$handleOwnThenable(promise,maybeThenable);}else {if(then===lib$es6$promise$$internal$$GET_THEN_ERROR){lib$es6$promise$$internal$$reject(promise,lib$es6$promise$$internal$$GET_THEN_ERROR.error);}else if(then===undefined){lib$es6$promise$$internal$$fulfill(promise,maybeThenable);}else if(lib$es6$promise$utils$$isFunction(then)){lib$es6$promise$$internal$$handleForeignThenable(promise,maybeThenable,then);}else {lib$es6$promise$$internal$$fulfill(promise,maybeThenable);}}}function lib$es6$promise$$internal$$resolve(promise,value){if(promise===value){lib$es6$promise$$internal$$reject(promise,lib$es6$promise$$internal$$selfFulfillment());}else if(lib$es6$promise$utils$$objectOrFunction(value)){lib$es6$promise$$internal$$handleMaybeThenable(promise,value,lib$es6$promise$$internal$$getThen(value));}else {lib$es6$promise$$internal$$fulfill(promise,value);}}function lib$es6$promise$$internal$$publishRejection(promise){if(promise._onerror){promise._onerror(promise._result);}lib$es6$promise$$internal$$publish(promise);}function lib$es6$promise$$internal$$fulfill(promise,value){if(promise._state!==lib$es6$promise$$internal$$PENDING){return;}promise._result=value;promise._state=lib$es6$promise$$internal$$FULFILLED;if(promise._subscribers.length!==0){lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publish,promise);}}function lib$es6$promise$$internal$$reject(promise,reason){if(promise._state!==lib$es6$promise$$internal$$PENDING){return;}promise._state=lib$es6$promise$$internal$$REJECTED;promise._result=reason;lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publishRejection,promise);}function lib$es6$promise$$internal$$subscribe(parent,child,onFulfillment,onRejection){var subscribers=parent._subscribers;var length=subscribers.length;parent._onerror=null;subscribers[length]=child;subscribers[length+lib$es6$promise$$internal$$FULFILLED]=onFulfillment;subscribers[length+lib$es6$promise$$internal$$REJECTED]=onRejection;if(length===0&&parent._state){lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publish,parent);}}function lib$es6$promise$$internal$$publish(promise){var subscribers=promise._subscribers;var settled=promise._state;if(subscribers.length===0){return;}var child,callback,detail=promise._result;for(var i=0;i<subscribers.length;i+=3){child=subscribers[i];callback=subscribers[i+settled];if(child){lib$es6$promise$$internal$$invokeCallback(settled,child,callback,detail);}else {callback(detail);}}promise._subscribers.length=0;}function lib$es6$promise$$internal$$ErrorObject(){this.error=null;}var lib$es6$promise$$internal$$TRY_CATCH_ERROR=new lib$es6$promise$$internal$$ErrorObject();function lib$es6$promise$$internal$$tryCatch(callback,detail){try{return callback(detail);}catch(e) {lib$es6$promise$$internal$$TRY_CATCH_ERROR.error=e;return lib$es6$promise$$internal$$TRY_CATCH_ERROR;}}function lib$es6$promise$$internal$$invokeCallback(settled,promise,callback,detail){var hasCallback=lib$es6$promise$utils$$isFunction(callback),value,error,succeeded,failed;if(hasCallback){value=lib$es6$promise$$internal$$tryCatch(callback,detail);if(value===lib$es6$promise$$internal$$TRY_CATCH_ERROR){failed=true;error=value.error;value=null;}else {succeeded=true;}if(promise===value){lib$es6$promise$$internal$$reject(promise,lib$es6$promise$$internal$$cannotReturnOwn());return;}}else {value=detail;succeeded=true;}if(promise._state!==lib$es6$promise$$internal$$PENDING){ // noop
}else if(hasCallback&&succeeded){lib$es6$promise$$internal$$resolve(promise,value);}else if(failed){lib$es6$promise$$internal$$reject(promise,error);}else if(settled===lib$es6$promise$$internal$$FULFILLED){lib$es6$promise$$internal$$fulfill(promise,value);}else if(settled===lib$es6$promise$$internal$$REJECTED){lib$es6$promise$$internal$$reject(promise,value);}}function lib$es6$promise$$internal$$initializePromise(promise,resolver){try{resolver(function resolvePromise(value){lib$es6$promise$$internal$$resolve(promise,value);},function rejectPromise(reason){lib$es6$promise$$internal$$reject(promise,reason);});}catch(e) {lib$es6$promise$$internal$$reject(promise,e);}}function lib$es6$promise$promise$all$$all(entries){return new lib$es6$promise$enumerator$$default(this,entries).promise;}var lib$es6$promise$promise$all$$default=lib$es6$promise$promise$all$$all;function lib$es6$promise$promise$race$$race(entries){ /*jshint validthis:true */var Constructor=this;var promise=new Constructor(lib$es6$promise$$internal$$noop);if(!lib$es6$promise$utils$$isArray(entries)){lib$es6$promise$$internal$$reject(promise,new TypeError('You must pass an array to race.'));return promise;}var length=entries.length;function onFulfillment(value){lib$es6$promise$$internal$$resolve(promise,value);}function onRejection(reason){lib$es6$promise$$internal$$reject(promise,reason);}for(var i=0;promise._state===lib$es6$promise$$internal$$PENDING&&i<length;i++){lib$es6$promise$$internal$$subscribe(Constructor.resolve(entries[i]),undefined,onFulfillment,onRejection);}return promise;}var lib$es6$promise$promise$race$$default=lib$es6$promise$promise$race$$race;function lib$es6$promise$promise$reject$$reject(reason){ /*jshint validthis:true */var Constructor=this;var promise=new Constructor(lib$es6$promise$$internal$$noop);lib$es6$promise$$internal$$reject(promise,reason);return promise;}var lib$es6$promise$promise$reject$$default=lib$es6$promise$promise$reject$$reject;var lib$es6$promise$promise$$counter=0;function lib$es6$promise$promise$$needsResolver(){throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');}function lib$es6$promise$promise$$needsNew(){throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");}var lib$es6$promise$promise$$default=lib$es6$promise$promise$$Promise; /**
      Promise objects represent the eventual result of an asynchronous operation. The
      primary way of interacting with a promise is through its `then` method, which
      registers callbacks to receive either a promise's eventual value or the reason
      why the promise cannot be fulfilled.

      Terminology
      -----------

      - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
      - `thenable` is an object or function that defines a `then` method.
      - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
      - `exception` is a value that is thrown using the throw statement.
      - `reason` is a value that indicates why a promise was rejected.
      - `settled` the final resting state of a promise, fulfilled or rejected.

      A promise can be in one of three states: pending, fulfilled, or rejected.

      Promises that are fulfilled have a fulfillment value and are in the fulfilled
      state.  Promises that are rejected have a rejection reason and are in the
      rejected state.  A fulfillment value is never a thenable.

      Promises can also be said to *resolve* a value.  If this value is also a
      promise, then the original promise's settled state will match the value's
      settled state.  So a promise that *resolves* a promise that rejects will
      itself reject, and a promise that *resolves* a promise that fulfills will
      itself fulfill.


      Basic Usage:
      ------------

      ```js
      var promise = new Promise(function(resolve, reject) {
        // on success
        resolve(value);

        // on failure
        reject(reason);
      });

      promise.then(function(value) {
        // on fulfillment
      }, function(reason) {
        // on rejection
      });
      ```

      Advanced Usage:
      ---------------

      Promises shine when abstracting away asynchronous interactions such as
      `XMLHttpRequest`s.

      ```js
      function getJSON(url) {
        return new Promise(function(resolve, reject){
          var xhr = new XMLHttpRequest();

          xhr.open('GET', url);
          xhr.onreadystatechange = handler;
          xhr.responseType = 'json';
          xhr.setRequestHeader('Accept', 'application/json');
          xhr.send();

          function handler() {
            if (this.readyState === this.DONE) {
              if (this.status === 200) {
                resolve(this.response);
              } else {
                reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
              }
            }
          };
        });
      }

      getJSON('/posts.json').then(function(json) {
        // on fulfillment
      }, function(reason) {
        // on rejection
      });
      ```

      Unlike callbacks, promises are great composable primitives.

      ```js
      Promise.all([
        getJSON('/posts'),
        getJSON('/comments')
      ]).then(function(values){
        values[0] // => postsJSON
        values[1] // => commentsJSON

        return values;
      });
      ```

      @class Promise
      @param {function} resolver
      Useful for tooling.
      @constructor
    */function lib$es6$promise$promise$$Promise(resolver){this._id=lib$es6$promise$promise$$counter++;this._state=undefined;this._result=undefined;this._subscribers=[];if(lib$es6$promise$$internal$$noop!==resolver){typeof resolver!=='function'&&lib$es6$promise$promise$$needsResolver();this instanceof lib$es6$promise$promise$$Promise?lib$es6$promise$$internal$$initializePromise(this,resolver):lib$es6$promise$promise$$needsNew();}}lib$es6$promise$promise$$Promise.all=lib$es6$promise$promise$all$$default;lib$es6$promise$promise$$Promise.race=lib$es6$promise$promise$race$$default;lib$es6$promise$promise$$Promise.resolve=lib$es6$promise$promise$resolve$$default;lib$es6$promise$promise$$Promise.reject=lib$es6$promise$promise$reject$$default;lib$es6$promise$promise$$Promise._setScheduler=lib$es6$promise$asap$$setScheduler;lib$es6$promise$promise$$Promise._setAsap=lib$es6$promise$asap$$setAsap;lib$es6$promise$promise$$Promise._asap=lib$es6$promise$asap$$asap;lib$es6$promise$promise$$Promise.prototype={constructor:lib$es6$promise$promise$$Promise, /**
      The primary way of interacting with a promise is through its `then` method,
      which registers callbacks to receive either a promise's eventual value or the
      reason why the promise cannot be fulfilled.

      ```js
      findUser().then(function(user){
        // user is available
      }, function(reason){
        // user is unavailable, and you are given the reason why
      });
      ```

      Chaining
      --------

      The return value of `then` is itself a promise.  This second, 'downstream'
      promise is resolved with the return value of the first promise's fulfillment
      or rejection handler, or rejected if the handler throws an exception.

      ```js
      findUser().then(function (user) {
        return user.name;
      }, function (reason) {
        return 'default name';
      }).then(function (userName) {
        // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
        // will be `'default name'`
      });

      findUser().then(function (user) {
        throw new Error('Found user, but still unhappy');
      }, function (reason) {
        throw new Error('`findUser` rejected and we're unhappy');
      }).then(function (value) {
        // never reached
      }, function (reason) {
        // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
        // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
      });
      ```
      If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.

      ```js
      findUser().then(function (user) {
        throw new PedagogicalException('Upstream error');
      }).then(function (value) {
        // never reached
      }).then(function (value) {
        // never reached
      }, function (reason) {
        // The `PedgagocialException` is propagated all the way down to here
      });
      ```

      Assimilation
      ------------

      Sometimes the value you want to propagate to a downstream promise can only be
      retrieved asynchronously. This can be achieved by returning a promise in the
      fulfillment or rejection handler. The downstream promise will then be pending
      until the returned promise is settled. This is called *assimilation*.

      ```js
      findUser().then(function (user) {
        return findCommentsByAuthor(user);
      }).then(function (comments) {
        // The user's comments are now available
      });
      ```

      If the assimliated promise rejects, then the downstream promise will also reject.

      ```js
      findUser().then(function (user) {
        return findCommentsByAuthor(user);
      }).then(function (comments) {
        // If `findCommentsByAuthor` fulfills, we'll have the value here
      }, function (reason) {
        // If `findCommentsByAuthor` rejects, we'll have the reason here
      });
      ```

      Simple Example
      --------------

      Synchronous Example

      ```javascript
      var result;

      try {
        result = findResult();
        // success
      } catch(reason) {
        // failure
      }
      ```

      Errback Example

      ```js
      findResult(function(result, err){
        if (err) {
          // failure
        } else {
          // success
        }
      });
      ```

      Promise Example;

      ```javascript
      findResult().then(function(result){
        // success
      }, function(reason){
        // failure
      });
      ```

      Advanced Example
      --------------

      Synchronous Example

      ```javascript
      var author, books;

      try {
        author = findAuthor();
        books  = findBooksByAuthor(author);
        // success
      } catch(reason) {
        // failure
      }
      ```

      Errback Example

      ```js

      function foundBooks(books) {

      }

      function failure(reason) {

      }

      findAuthor(function(author, err){
        if (err) {
          failure(err);
          // failure
        } else {
          try {
            findBoooksByAuthor(author, function(books, err) {
              if (err) {
                failure(err);
              } else {
                try {
                  foundBooks(books);
                } catch(reason) {
                  failure(reason);
                }
              }
            });
          } catch(error) {
            failure(err);
          }
          // success
        }
      });
      ```

      Promise Example;

      ```javascript
      findAuthor().
        then(findBooksByAuthor).
        then(function(books){
          // found books
      }).catch(function(reason){
        // something went wrong
      });
      ```

      @method then
      @param {Function} onFulfilled
      @param {Function} onRejected
      Useful for tooling.
      @return {Promise}
    */then:lib$es6$promise$then$$default, /**
      `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
      as the catch block of a try/catch statement.

      ```js
      function findAuthor(){
        throw new Error('couldn't find that author');
      }

      // synchronous
      try {
        findAuthor();
      } catch(reason) {
        // something went wrong
      }

      // async with promises
      findAuthor().catch(function(reason){
        // something went wrong
      });
      ```

      @method catch
      @param {Function} onRejection
      Useful for tooling.
      @return {Promise}
    */'catch':function _catch(onRejection){return this.then(null,onRejection);}};var lib$es6$promise$enumerator$$default=lib$es6$promise$enumerator$$Enumerator;function lib$es6$promise$enumerator$$Enumerator(Constructor,input){this._instanceConstructor=Constructor;this.promise=new Constructor(lib$es6$promise$$internal$$noop);if(Array.isArray(input)){this._input=input;this.length=input.length;this._remaining=input.length;this._result=new Array(this.length);if(this.length===0){lib$es6$promise$$internal$$fulfill(this.promise,this._result);}else {this.length=this.length||0;this._enumerate();if(this._remaining===0){lib$es6$promise$$internal$$fulfill(this.promise,this._result);}}}else {lib$es6$promise$$internal$$reject(this.promise,this._validationError());}}lib$es6$promise$enumerator$$Enumerator.prototype._validationError=function(){return new Error('Array Methods must be provided an Array');};lib$es6$promise$enumerator$$Enumerator.prototype._enumerate=function(){var length=this.length;var input=this._input;for(var i=0;this._state===lib$es6$promise$$internal$$PENDING&&i<length;i++){this._eachEntry(input[i],i);}};lib$es6$promise$enumerator$$Enumerator.prototype._eachEntry=function(entry,i){var c=this._instanceConstructor;var resolve=c.resolve;if(resolve===lib$es6$promise$promise$resolve$$default){var then=lib$es6$promise$$internal$$getThen(entry);if(then===lib$es6$promise$then$$default&&entry._state!==lib$es6$promise$$internal$$PENDING){this._settledAt(entry._state,i,entry._result);}else if(typeof then!=='function'){this._remaining--;this._result[i]=entry;}else if(c===lib$es6$promise$promise$$default){var promise=new c(lib$es6$promise$$internal$$noop);lib$es6$promise$$internal$$handleMaybeThenable(promise,entry,then);this._willSettleAt(promise,i);}else {this._willSettleAt(new c(function(resolve){resolve(entry);}),i);}}else {this._willSettleAt(resolve(entry),i);}};lib$es6$promise$enumerator$$Enumerator.prototype._settledAt=function(state,i,value){var promise=this.promise;if(promise._state===lib$es6$promise$$internal$$PENDING){this._remaining--;if(state===lib$es6$promise$$internal$$REJECTED){lib$es6$promise$$internal$$reject(promise,value);}else {this._result[i]=value;}}if(this._remaining===0){lib$es6$promise$$internal$$fulfill(promise,this._result);}};lib$es6$promise$enumerator$$Enumerator.prototype._willSettleAt=function(promise,i){var enumerator=this;lib$es6$promise$$internal$$subscribe(promise,undefined,function(value){enumerator._settledAt(lib$es6$promise$$internal$$FULFILLED,i,value);},function(reason){enumerator._settledAt(lib$es6$promise$$internal$$REJECTED,i,reason);});};function lib$es6$promise$polyfill$$polyfill(){var local;if(typeof global!=='undefined'){local=global;}else if(typeof self!=='undefined'){local=self;}else {try{local=Function('return this')();}catch(e) {throw new Error('polyfill failed because global object is unavailable in this environment');}}var P=local.Promise;if(P&&Object.prototype.toString.call(P.resolve())==='[object Promise]'&&!P.cast){return;}local.Promise=lib$es6$promise$promise$$default;}var lib$es6$promise$polyfill$$default=lib$es6$promise$polyfill$$polyfill;var lib$es6$promise$umd$$ES6Promise={'Promise':lib$es6$promise$promise$$default,'polyfill':lib$es6$promise$polyfill$$default}; /* global define:true module:true window: true */if(typeof define==='function'&&define['amd']){define(function(){return lib$es6$promise$umd$$ES6Promise;});}else if(typeof module!=='undefined'&&module['exports']){module['exports']=lib$es6$promise$umd$$ES6Promise;}else if(typeof this!=='undefined'){this['ES6Promise']=lib$es6$promise$umd$$ES6Promise;}lib$es6$promise$polyfill$$default();}).call(this);}).call(this,require('_process'),typeof global!=="undefined"?global:typeof self!=="undefined"?self:typeof window!=="undefined"?window:{});},{"_process":92}],84:[function(require,module,exports){'use strict';module.exports=require('./is-implemented')()?Symbol:require('./polyfill');},{"./is-implemented":85,"./polyfill":87}],85:[function(require,module,exports){'use strict';module.exports=function(){var symbol;if(typeof Symbol!=='function')return false;symbol=Symbol('test symbol');try{String(symbol);}catch(e) {return false;}if(_typeof2(Symbol.iterator)==='symbol')return true; // Return 'true' for polyfills
if(_typeof2(Symbol.isConcatSpreadable)!=='object')return false;if(_typeof2(Symbol.iterator)!=='object')return false;if(_typeof2(Symbol.toPrimitive)!=='object')return false;if(_typeof2(Symbol.toStringTag)!=='object')return false;if(_typeof2(Symbol.unscopables)!=='object')return false;return true;};},{}],86:[function(require,module,exports){'use strict';module.exports=function(x){return x&&((typeof x==="undefined"?"undefined":_typeof2(x))==='symbol'||x['@@toStringTag']==='Symbol')||false;};},{}],87:[function(require,module,exports){ // ES2015 Symbol polyfill for environments that do not support it (or partially support it_
'use strict';var d=require('d'),validateSymbol=require('./validate-symbol'),create=Object.create,defineProperties=Object.defineProperties,defineProperty=Object.defineProperty,objPrototype=Object.prototype,NativeSymbol,SymbolPolyfill,HiddenSymbol,globalSymbols=create(null);if(typeof Symbol==='function')NativeSymbol=Symbol;var generateName=(function(){var created=create(null);return function(desc){var postfix=0,name,ie11BugWorkaround;while(created[desc+(postfix||'')]){++postfix;}desc+=postfix||'';created[desc]=true;name='@@'+desc;defineProperty(objPrototype,name,d.gs(null,function(value){ // For IE11 issue see:
// https://connect.microsoft.com/IE/feedbackdetail/view/1928508/
//    ie11-broken-getters-on-dom-objects
// https://github.com/medikoo/es6-symbol/issues/12
if(ie11BugWorkaround)return;ie11BugWorkaround=true;defineProperty(this,name,d(value));ie11BugWorkaround=false;}));return name;};})(); // Internal constructor (not one exposed) for creating Symbol instances.
// This one is used to ensure that `someSymbol instanceof Symbol` always return false
HiddenSymbol=function Symbol(description){if(this instanceof HiddenSymbol)throw new TypeError('TypeError: Symbol is not a constructor');return SymbolPolyfill(description);}; // Exposed `Symbol` constructor
// (returns instances of HiddenSymbol)
module.exports=SymbolPolyfill=function Symbol(description){var symbol;if(this instanceof Symbol)throw new TypeError('TypeError: Symbol is not a constructor');symbol=create(HiddenSymbol.prototype);description=description===undefined?'':String(description);return defineProperties(symbol,{__description__:d('',description),__name__:d('',generateName(description))});};defineProperties(SymbolPolyfill,{for:d(function(key){if(globalSymbols[key])return globalSymbols[key];return globalSymbols[key]=SymbolPolyfill(String(key));}),keyFor:d(function(s){var key;validateSymbol(s);for(key in globalSymbols){if(globalSymbols[key]===s)return key;}}), // If there's native implementation of given symbol, let's fallback to it
// to ensure proper interoperability with other native functions e.g. Array.from
hasInstance:d('',NativeSymbol&&NativeSymbol.hasInstance||SymbolPolyfill('hasInstance')),isConcatSpreadable:d('',NativeSymbol&&NativeSymbol.isConcatSpreadable||SymbolPolyfill('isConcatSpreadable')),iterator:d('',NativeSymbol&&NativeSymbol.iterator||SymbolPolyfill('iterator')),match:d('',NativeSymbol&&NativeSymbol.match||SymbolPolyfill('match')),replace:d('',NativeSymbol&&NativeSymbol.replace||SymbolPolyfill('replace')),search:d('',NativeSymbol&&NativeSymbol.search||SymbolPolyfill('search')),species:d('',NativeSymbol&&NativeSymbol.species||SymbolPolyfill('species')),split:d('',NativeSymbol&&NativeSymbol.split||SymbolPolyfill('split')),toPrimitive:d('',NativeSymbol&&NativeSymbol.toPrimitive||SymbolPolyfill('toPrimitive')),toStringTag:d('',NativeSymbol&&NativeSymbol.toStringTag||SymbolPolyfill('toStringTag')),unscopables:d('',NativeSymbol&&NativeSymbol.unscopables||SymbolPolyfill('unscopables'))}); // Internal tweaks for real symbol producer
defineProperties(HiddenSymbol.prototype,{constructor:d(SymbolPolyfill),toString:d('',function(){return this.__name__;})}); // Proper implementation of methods exposed on Symbol.prototype
// They won't be accessible on produced symbol instances as they derive from HiddenSymbol.prototype
defineProperties(SymbolPolyfill.prototype,{toString:d(function(){return 'Symbol ('+validateSymbol(this).__description__+')';}),valueOf:d(function(){return validateSymbol(this);})});defineProperty(SymbolPolyfill.prototype,SymbolPolyfill.toPrimitive,d('',function(){return validateSymbol(this);}));defineProperty(SymbolPolyfill.prototype,SymbolPolyfill.toStringTag,d('c','Symbol')); // Proper implementaton of toPrimitive and toStringTag for returned symbol instances
defineProperty(HiddenSymbol.prototype,SymbolPolyfill.toStringTag,d('c',SymbolPolyfill.prototype[SymbolPolyfill.toStringTag])); // Note: It's important to define `toPrimitive` as last one, as some implementations
// implement `toPrimitive` natively without implementing `toStringTag` (or other specified symbols)
// And that may invoke error in definition flow:
// See: https://github.com/medikoo/es6-symbol/issues/13#issuecomment-164146149
defineProperty(HiddenSymbol.prototype,SymbolPolyfill.toPrimitive,d('c',SymbolPolyfill.prototype[SymbolPolyfill.toPrimitive]));},{"./validate-symbol":88,"d":3}],88:[function(require,module,exports){'use strict';var isSymbol=require('./is-symbol');module.exports=function(value){if(!isSymbol(value))throw new TypeError(value+" is not a symbol");return value;};},{"./is-symbol":86}],89:[function(require,module,exports){'use strict';var d=require('d'),callable=require('es5-ext/object/valid-callable'),apply=Function.prototype.apply,call=Function.prototype.call,create=Object.create,defineProperty=Object.defineProperty,defineProperties=Object.defineProperties,hasOwnProperty=Object.prototype.hasOwnProperty,descriptor={configurable:true,enumerable:false,writable:true},on,_once2,off,emit,methods,descriptors,base;on=function on(type,listener){var data;callable(listener);if(!hasOwnProperty.call(this,'__ee__')){data=descriptor.value=create(null);defineProperty(this,'__ee__',descriptor);descriptor.value=null;}else {data=this.__ee__;}if(!data[type])data[type]=listener;else if(_typeof2(data[type])==='object')data[type].push(listener);else data[type]=[data[type],listener];return this;};_once2=function once(type,listener){var _once,self;callable(listener);self=this;on.call(this,type,_once=function once(){off.call(self,type,_once);apply.call(listener,this,arguments);});_once.__eeOnceListener__=listener;return this;};off=function off(type,listener){var data,listeners,candidate,i;callable(listener);if(!hasOwnProperty.call(this,'__ee__'))return this;data=this.__ee__;if(!data[type])return this;listeners=data[type];if((typeof listeners==="undefined"?"undefined":_typeof2(listeners))==='object'){for(i=0;candidate=listeners[i];++i){if(candidate===listener||candidate.__eeOnceListener__===listener){if(listeners.length===2)data[type]=listeners[i?0:1];else listeners.splice(i,1);}}}else {if(listeners===listener||listeners.__eeOnceListener__===listener){delete data[type];}}return this;};emit=function emit(type){var i,l,listener,listeners,args;if(!hasOwnProperty.call(this,'__ee__'))return;listeners=this.__ee__[type];if(!listeners)return;if((typeof listeners==="undefined"?"undefined":_typeof2(listeners))==='object'){l=arguments.length;args=new Array(l-1);for(i=1;i<l;++i){args[i-1]=arguments[i];}listeners=listeners.slice();for(i=0;listener=listeners[i];++i){apply.call(listener,this,args);}}else {switch(arguments.length){case 1:call.call(listeners,this);break;case 2:call.call(listeners,this,arguments[1]);break;case 3:call.call(listeners,this,arguments[1],arguments[2]);break;default:l=arguments.length;args=new Array(l-1);for(i=1;i<l;++i){args[i-1]=arguments[i];}apply.call(listeners,this,args);}}};methods={on:on,once:_once2,off:off,emit:emit};descriptors={on:d(on),once:d(_once2),off:d(off),emit:d(emit)};base=defineProperties({},descriptors);module.exports=exports=function exports(o){return o==null?create(base):defineProperties(Object(o),descriptors);};exports.methods=methods;},{"d":3,"es5-ext/object/valid-callable":72}],90:[function(require,module,exports){'use strict';var forEach=require('es5-ext/object/for-each'),validValue=require('es5-ext/object/valid-object'),push=Array.prototype.apply,defineProperty=Object.defineProperty,create=Object.create,hasOwnProperty=Object.prototype.hasOwnProperty,d={configurable:true,enumerable:false,writable:true};module.exports=function(e1,e2){var data;validValue(e1)&&validValue(e2);if(!hasOwnProperty.call(e1,'__ee__')){if(!hasOwnProperty.call(e2,'__ee__')){d.value=create(null);defineProperty(e1,'__ee__',d);defineProperty(e2,'__ee__',d);d.value=null;return;}d.value=e2.__ee__;defineProperty(e1,'__ee__',d);d.value=null;return;}data=d.value=e1.__ee__;if(!hasOwnProperty.call(e2,'__ee__')){defineProperty(e2,'__ee__',d);d.value=null;return;}if(data===e2.__ee__)return;forEach(e2.__ee__,function(listener,name){if(!data[name]){data[name]=listener;return;}if(_typeof2(data[name])==='object'){if((typeof listener==="undefined"?"undefined":_typeof2(listener))==='object')push.apply(data[name],listener);else data[name].push(listener);}else if((typeof listener==="undefined"?"undefined":_typeof2(listener))==='object'){listener.unshift(data[name]);data[name]=listener;}else {data[name]=[data[name],listener];}});defineProperty(e2,'__ee__',d);d.value=null;};},{"es5-ext/object/for-each":63,"es5-ext/object/valid-object":73}],91:[function(require,module,exports){(function(process){'use strict';var callable,byObserver;callable=function callable(fn){if(typeof fn!=='function')throw new TypeError(fn+" is not a function");return fn;};byObserver=function byObserver(Observer){var node=document.createTextNode(''),queue,i=0;new Observer(function(){var data;if(!queue)return;data=queue;queue=null;if(typeof data==='function'){data();return;}data.forEach(function(fn){fn();});}).observe(node,{characterData:true});return function(fn){callable(fn);if(queue){if(typeof queue==='function')queue=[queue,fn];else queue.push(fn);return;}queue=fn;node.data=i=++i%2;};};module.exports=(function(){ // Node.js
if(typeof process!=='undefined'&&process&&typeof process.nextTick==='function'){return process.nextTick;} // MutationObserver=
if((typeof document==="undefined"?"undefined":_typeof2(document))==='object'&&document){if(typeof MutationObserver==='function'){return byObserver(MutationObserver);}if(typeof WebKitMutationObserver==='function'){return byObserver(WebKitMutationObserver);}} // W3C Draft
// http://dvcs.w3.org/hg/webperf/raw-file/tip/specs/setImmediate/Overview.html
if(typeof setImmediate==='function'){return function(cb){setImmediate(callable(cb));};} // Wide available standard
if(typeof setTimeout==='function'){return function(cb){setTimeout(callable(cb),0);};}return null;})();}).call(this,require('_process'));},{"_process":92}],92:[function(require,module,exports){ // shim for using process in browser
var process=module.exports={};var queue=[];var draining=false;var currentQueue;var queueIndex=-1;function cleanUpNextTick(){draining=false;if(currentQueue.length){queue=currentQueue.concat(queue);}else {queueIndex=-1;}if(queue.length){drainQueue();}}function drainQueue(){if(draining){return;}var timeout=setTimeout(cleanUpNextTick);draining=true;var len=queue.length;while(len){currentQueue=queue;queue=[];while(++queueIndex<len){if(currentQueue){currentQueue[queueIndex].run();}}queueIndex=-1;len=queue.length;}currentQueue=null;draining=false;clearTimeout(timeout);}process.nextTick=function(fun){var args=new Array(arguments.length-1);if(arguments.length>1){for(var i=1;i<arguments.length;i++){args[i-1]=arguments[i];}}queue.push(new Item(fun,args));if(queue.length===1&&!draining){setTimeout(drainQueue,0);}}; // v8 likes predictible objects
function Item(fun,array){this.fun=fun;this.array=array;}Item.prototype.run=function(){this.fun.apply(null,this.array);};process.title='browser';process.browser=true;process.env={};process.argv=[];process.version=''; // empty string to avoid regexp issues
process.versions={};function noop(){}process.on=noop;process.addListener=noop;process.once=noop;process.off=noop;process.removeListener=noop;process.removeAllListeners=noop;process.emit=noop;process.binding=function(name){throw new Error('process.binding is not supported');};process.cwd=function(){return '/';};process.chdir=function(dir){throw new Error('process.chdir is not supported');};process.umask=function(){return 0;};},{}],93:[function(require,module,exports){(function(factory){if((typeof exports==="undefined"?"undefined":_typeof2(exports))==='object'){ // Node/CommonJS
module.exports=factory();}else if(typeof define==='function'&&define.amd){ // AMD
define(factory);}else { // Browser globals (with support for web workers)
var glob;try{glob=window;}catch(e) {glob=self;}glob.SparkMD5=factory();}})(function(undefined){'use strict'; /*
     * Fastest md5 implementation around (JKM md5).
     * Credits: Joseph Myers
     *
     * @see http://www.myersdaily.org/joseph/javascript/md5-text.html
     * @see http://jsperf.com/md5-shootout/7
     */ /* this function is much faster,
      so if possible we use it. Some IEs
      are the only ones I know of that
      need the idiotic second function,
      generated by an if clause.  */var add32=function add32(a,b){return a+b&0xFFFFFFFF;},hex_chr=['0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f'];function cmn(q,a,b,x,s,t){a=add32(add32(a,q),add32(x,t));return add32(a<<s|a>>>32-s,b);}function ff(a,b,c,d,x,s,t){return cmn(b&c|~b&d,a,b,x,s,t);}function gg(a,b,c,d,x,s,t){return cmn(b&d|c&~d,a,b,x,s,t);}function hh(a,b,c,d,x,s,t){return cmn(b^c^d,a,b,x,s,t);}function ii(a,b,c,d,x,s,t){return cmn(c^(b|~d),a,b,x,s,t);}function md5cycle(x,k){var a=x[0],b=x[1],c=x[2],d=x[3];a=ff(a,b,c,d,k[0],7,-680876936);d=ff(d,a,b,c,k[1],12,-389564586);c=ff(c,d,a,b,k[2],17,606105819);b=ff(b,c,d,a,k[3],22,-1044525330);a=ff(a,b,c,d,k[4],7,-176418897);d=ff(d,a,b,c,k[5],12,1200080426);c=ff(c,d,a,b,k[6],17,-1473231341);b=ff(b,c,d,a,k[7],22,-45705983);a=ff(a,b,c,d,k[8],7,1770035416);d=ff(d,a,b,c,k[9],12,-1958414417);c=ff(c,d,a,b,k[10],17,-42063);b=ff(b,c,d,a,k[11],22,-1990404162);a=ff(a,b,c,d,k[12],7,1804603682);d=ff(d,a,b,c,k[13],12,-40341101);c=ff(c,d,a,b,k[14],17,-1502002290);b=ff(b,c,d,a,k[15],22,1236535329);a=gg(a,b,c,d,k[1],5,-165796510);d=gg(d,a,b,c,k[6],9,-1069501632);c=gg(c,d,a,b,k[11],14,643717713);b=gg(b,c,d,a,k[0],20,-373897302);a=gg(a,b,c,d,k[5],5,-701558691);d=gg(d,a,b,c,k[10],9,38016083);c=gg(c,d,a,b,k[15],14,-660478335);b=gg(b,c,d,a,k[4],20,-405537848);a=gg(a,b,c,d,k[9],5,568446438);d=gg(d,a,b,c,k[14],9,-1019803690);c=gg(c,d,a,b,k[3],14,-187363961);b=gg(b,c,d,a,k[8],20,1163531501);a=gg(a,b,c,d,k[13],5,-1444681467);d=gg(d,a,b,c,k[2],9,-51403784);c=gg(c,d,a,b,k[7],14,1735328473);b=gg(b,c,d,a,k[12],20,-1926607734);a=hh(a,b,c,d,k[5],4,-378558);d=hh(d,a,b,c,k[8],11,-2022574463);c=hh(c,d,a,b,k[11],16,1839030562);b=hh(b,c,d,a,k[14],23,-35309556);a=hh(a,b,c,d,k[1],4,-1530992060);d=hh(d,a,b,c,k[4],11,1272893353);c=hh(c,d,a,b,k[7],16,-155497632);b=hh(b,c,d,a,k[10],23,-1094730640);a=hh(a,b,c,d,k[13],4,681279174);d=hh(d,a,b,c,k[0],11,-358537222);c=hh(c,d,a,b,k[3],16,-722521979);b=hh(b,c,d,a,k[6],23,76029189);a=hh(a,b,c,d,k[9],4,-640364487);d=hh(d,a,b,c,k[12],11,-421815835);c=hh(c,d,a,b,k[15],16,530742520);b=hh(b,c,d,a,k[2],23,-995338651);a=ii(a,b,c,d,k[0],6,-198630844);d=ii(d,a,b,c,k[7],10,1126891415);c=ii(c,d,a,b,k[14],15,-1416354905);b=ii(b,c,d,a,k[5],21,-57434055);a=ii(a,b,c,d,k[12],6,1700485571);d=ii(d,a,b,c,k[3],10,-1894986606);c=ii(c,d,a,b,k[10],15,-1051523);b=ii(b,c,d,a,k[1],21,-2054922799);a=ii(a,b,c,d,k[8],6,1873313359);d=ii(d,a,b,c,k[15],10,-30611744);c=ii(c,d,a,b,k[6],15,-1560198380);b=ii(b,c,d,a,k[13],21,1309151649);a=ii(a,b,c,d,k[4],6,-145523070);d=ii(d,a,b,c,k[11],10,-1120210379);c=ii(c,d,a,b,k[2],15,718787259);b=ii(b,c,d,a,k[9],21,-343485551);x[0]=add32(a,x[0]);x[1]=add32(b,x[1]);x[2]=add32(c,x[2]);x[3]=add32(d,x[3]);}function md5blk(s){var md5blks=[],i; /* Andy King said do it this way. */for(i=0;i<64;i+=4){md5blks[i>>2]=s.charCodeAt(i)+(s.charCodeAt(i+1)<<8)+(s.charCodeAt(i+2)<<16)+(s.charCodeAt(i+3)<<24);}return md5blks;}function md5blk_array(a){var md5blks=[],i; /* Andy King said do it this way. */for(i=0;i<64;i+=4){md5blks[i>>2]=a[i]+(a[i+1]<<8)+(a[i+2]<<16)+(a[i+3]<<24);}return md5blks;}function md51(s){var n=s.length,state=[1732584193,-271733879,-1732584194,271733878],i,length,tail,tmp,lo,hi;for(i=64;i<=n;i+=64){md5cycle(state,md5blk(s.substring(i-64,i)));}s=s.substring(i-64);length=s.length;tail=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];for(i=0;i<length;i+=1){tail[i>>2]|=s.charCodeAt(i)<<(i%4<<3);}tail[i>>2]|=0x80<<(i%4<<3);if(i>55){md5cycle(state,tail);for(i=0;i<16;i+=1){tail[i]=0;}} // Beware that the final length might not fit in 32 bits so we take care of that
tmp=n*8;tmp=tmp.toString(16).match(/(.*?)(.{0,8})$/);lo=parseInt(tmp[2],16);hi=parseInt(tmp[1],16)||0;tail[14]=lo;tail[15]=hi;md5cycle(state,tail);return state;}function md51_array(a){var n=a.length,state=[1732584193,-271733879,-1732584194,271733878],i,length,tail,tmp,lo,hi;for(i=64;i<=n;i+=64){md5cycle(state,md5blk_array(a.subarray(i-64,i)));} // Not sure if it is a bug, however IE10 will always produce a sub array of length 1
// containing the last element of the parent array if the sub array specified starts
// beyond the length of the parent array - weird.
// https://connect.microsoft.com/IE/feedback/details/771452/typed-array-subarray-issue
a=i-64<n?a.subarray(i-64):new Uint8Array(0);length=a.length;tail=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];for(i=0;i<length;i+=1){tail[i>>2]|=a[i]<<(i%4<<3);}tail[i>>2]|=0x80<<(i%4<<3);if(i>55){md5cycle(state,tail);for(i=0;i<16;i+=1){tail[i]=0;}} // Beware that the final length might not fit in 32 bits so we take care of that
tmp=n*8;tmp=tmp.toString(16).match(/(.*?)(.{0,8})$/);lo=parseInt(tmp[2],16);hi=parseInt(tmp[1],16)||0;tail[14]=lo;tail[15]=hi;md5cycle(state,tail);return state;}function rhex(n){var s='',j;for(j=0;j<4;j+=1){s+=hex_chr[n>>j*8+4&0x0F]+hex_chr[n>>j*8&0x0F];}return s;}function hex(x){var i;for(i=0;i<x.length;i+=1){x[i]=rhex(x[i]);}return x.join('');} // In some cases the fast add32 function cannot be used..
if(hex(md51('hello'))!=='5d41402abc4b2a76b9719d911017c592'){add32=function add32(x,y){var lsw=(x&0xFFFF)+(y&0xFFFF),msw=(x>>16)+(y>>16)+(lsw>>16);return msw<<16|lsw&0xFFFF;};} // ---------------------------------------------------
/**
     * ArrayBuffer slice polyfill.
     *
     * @see https://github.com/ttaubert/node-arraybuffer-slice
     */if(typeof ArrayBuffer!=='undefined'&&!ArrayBuffer.prototype.slice){(function(){function clamp(val,length){val=val|0||0;if(val<0){return Math.max(val+length,0);}return Math.min(val,length);}ArrayBuffer.prototype.slice=function(from,to){var length=this.byteLength,begin=clamp(from,length),end=length,num,target,targetArray,sourceArray;if(to!==undefined){end=clamp(to,length);}if(begin>end){return new ArrayBuffer(0);}num=end-begin;target=new ArrayBuffer(num);targetArray=new Uint8Array(target);sourceArray=new Uint8Array(this,begin,num);targetArray.set(sourceArray);return target;};})();} // ---------------------------------------------------
/**
     * Helpers.
     */function toUtf8(str){if(/[\u0080-\uFFFF]/.test(str)){str=unescape(encodeURIComponent(str));}return str;}function utf8Str2ArrayBuffer(str,returnUInt8Array){var length=str.length,buff=new ArrayBuffer(length),arr=new Uint8Array(buff),i;for(i=0;i<length;i+=1){arr[i]=str.charCodeAt(i);}return returnUInt8Array?arr:buff;}function arrayBuffer2Utf8Str(buff){return String.fromCharCode.apply(null,new Uint8Array(buff));}function concatenateArrayBuffers(first,second,returnUInt8Array){var result=new Uint8Array(first.byteLength+second.byteLength);result.set(new Uint8Array(first));result.set(new Uint8Array(second),first.byteLength);return returnUInt8Array?result:result.buffer;}function hexToBinaryString(hex){var bytes=[],length=hex.length,x;for(x=0;x<length-1;x+=2){bytes.push(parseInt(hex.substr(x,2),16));}return String.fromCharCode.apply(String,bytes);} // ---------------------------------------------------
/**
     * SparkMD5 OOP implementation.
     *
     * Use this class to perform an incremental md5, otherwise use the
     * static methods instead.
     */function SparkMD5(){ // call reset to init the instance
this.reset();} /**
     * Appends a string.
     * A conversion will be applied if an utf8 string is detected.
     *
     * @param {String} str The string to be appended
     *
     * @return {SparkMD5} The instance itself
     */SparkMD5.prototype.append=function(str){ // Converts the string to utf8 bytes if necessary
// Then append as binary
this.appendBinary(toUtf8(str));return this;}; /**
     * Appends a binary string.
     *
     * @param {String} contents The binary string to be appended
     *
     * @return {SparkMD5} The instance itself
     */SparkMD5.prototype.appendBinary=function(contents){this._buff+=contents;this._length+=contents.length;var length=this._buff.length,i;for(i=64;i<=length;i+=64){md5cycle(this._hash,md5blk(this._buff.substring(i-64,i)));}this._buff=this._buff.substring(i-64);return this;}; /**
     * Finishes the incremental computation, reseting the internal state and
     * returning the result.
     *
     * @param {Boolean} raw True to get the raw string, false to get the hex string
     *
     * @return {String} The result
     */SparkMD5.prototype.end=function(raw){var buff=this._buff,length=buff.length,i,tail=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],ret;for(i=0;i<length;i+=1){tail[i>>2]|=buff.charCodeAt(i)<<(i%4<<3);}this._finish(tail,length);ret=hex(this._hash);if(raw){ret=hexToBinaryString(ret);}this.reset();return ret;}; /**
     * Resets the internal state of the computation.
     *
     * @return {SparkMD5} The instance itself
     */SparkMD5.prototype.reset=function(){this._buff='';this._length=0;this._hash=[1732584193,-271733879,-1732584194,271733878];return this;}; /**
     * Gets the internal state of the computation.
     *
     * @return {Object} The state
     */SparkMD5.prototype.getState=function(){return {buff:this._buff,length:this._length,hash:this._hash};}; /**
     * Gets the internal state of the computation.
     *
     * @param {Object} state The state
     *
     * @return {SparkMD5} The instance itself
     */SparkMD5.prototype.setState=function(state){this._buff=state.buff;this._length=state.length;this._hash=state.hash;return this;}; /**
     * Releases memory used by the incremental buffer and other additional
     * resources. If you plan to use the instance again, use reset instead.
     */SparkMD5.prototype.destroy=function(){delete this._hash;delete this._buff;delete this._length;}; /**
     * Finish the final calculation based on the tail.
     *
     * @param {Array}  tail   The tail (will be modified)
     * @param {Number} length The length of the remaining buffer
     */SparkMD5.prototype._finish=function(tail,length){var i=length,tmp,lo,hi;tail[i>>2]|=0x80<<(i%4<<3);if(i>55){md5cycle(this._hash,tail);for(i=0;i<16;i+=1){tail[i]=0;}} // Do the final computation based on the tail and length
// Beware that the final length may not fit in 32 bits so we take care of that
tmp=this._length*8;tmp=tmp.toString(16).match(/(.*?)(.{0,8})$/);lo=parseInt(tmp[2],16);hi=parseInt(tmp[1],16)||0;tail[14]=lo;tail[15]=hi;md5cycle(this._hash,tail);}; /**
     * Performs the md5 hash on a string.
     * A conversion will be applied if utf8 string is detected.
     *
     * @param {String}  str The string
     * @param {Boolean} raw True to get the raw string, false to get the hex string
     *
     * @return {String} The result
     */SparkMD5.hash=function(str,raw){ // Converts the string to utf8 bytes if necessary
// Then compute it using the binary function
return SparkMD5.hashBinary(toUtf8(str),raw);}; /**
     * Performs the md5 hash on a binary string.
     *
     * @param {String}  content The binary string
     * @param {Boolean} raw     True to get the raw string, false to get the hex string
     *
     * @return {String} The result
     */SparkMD5.hashBinary=function(content,raw){var hash=md51(content),ret=hex(hash);return raw?hexToBinaryString(ret):ret;}; // ---------------------------------------------------
/**
     * SparkMD5 OOP implementation for array buffers.
     *
     * Use this class to perform an incremental md5 ONLY for array buffers.
     */SparkMD5.ArrayBuffer=function(){ // call reset to init the instance
this.reset();}; /**
     * Appends an array buffer.
     *
     * @param {ArrayBuffer} arr The array to be appended
     *
     * @return {SparkMD5.ArrayBuffer} The instance itself
     */SparkMD5.ArrayBuffer.prototype.append=function(arr){var buff=concatenateArrayBuffers(this._buff.buffer,arr,true),length=buff.length,i;this._length+=arr.byteLength;for(i=64;i<=length;i+=64){md5cycle(this._hash,md5blk_array(buff.subarray(i-64,i)));}this._buff=i-64<length?new Uint8Array(buff.buffer.slice(i-64)):new Uint8Array(0);return this;}; /**
     * Finishes the incremental computation, reseting the internal state and
     * returning the result.
     *
     * @param {Boolean} raw True to get the raw string, false to get the hex string
     *
     * @return {String} The result
     */SparkMD5.ArrayBuffer.prototype.end=function(raw){var buff=this._buff,length=buff.length,tail=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],i,ret;for(i=0;i<length;i+=1){tail[i>>2]|=buff[i]<<(i%4<<3);}this._finish(tail,length);ret=hex(this._hash);if(raw){ret=hexToBinaryString(ret);}this.reset();return ret;}; /**
     * Resets the internal state of the computation.
     *
     * @return {SparkMD5.ArrayBuffer} The instance itself
     */SparkMD5.ArrayBuffer.prototype.reset=function(){this._buff=new Uint8Array(0);this._length=0;this._hash=[1732584193,-271733879,-1732584194,271733878];return this;}; /**
     * Gets the internal state of the computation.
     *
     * @return {Object} The state
     */SparkMD5.ArrayBuffer.prototype.getState=function(){var state=SparkMD5.prototype.getState.call(this); // Convert buffer to a string
state.buff=arrayBuffer2Utf8Str(state.buff);return state;}; /**
     * Gets the internal state of the computation.
     *
     * @param {Object} state The state
     *
     * @return {SparkMD5.ArrayBuffer} The instance itself
     */SparkMD5.ArrayBuffer.prototype.setState=function(state){ // Convert string to buffer
state.buff=utf8Str2ArrayBuffer(state.buff,true);return SparkMD5.prototype.setState.call(this,state);};SparkMD5.ArrayBuffer.prototype.destroy=SparkMD5.prototype.destroy;SparkMD5.ArrayBuffer.prototype._finish=SparkMD5.prototype._finish; /**
     * Performs the md5 hash on an array buffer.
     *
     * @param {ArrayBuffer} arr The array buffer
     * @param {Boolean}     raw True to get the raw string, false to get the hex one
     *
     * @return {String} The result
     */SparkMD5.ArrayBuffer.hash=function(arr,raw){var hash=md51_array(new Uint8Array(arr)),ret=hex(hash);return raw?hexToBinaryString(ret):ret;};return SparkMD5;});},{}],94:[function(require,module,exports){'use strict';(function(root,factory){if(typeof define==='function'&&define.amd){ // AMD. Register as an anonymous module.
define([],factory);}else if((typeof module==="undefined"?"undefined":_typeof2(module))==='object'&&module.exports){ // Node. Does not work with strict CommonJS, but
// only CommonJS-like environments that support module.exports,
// like Node.
module.exports=factory();}else { // Browser globals (root is window)
root.striptags=factory();}})(this,function(){var STATE_OUTPUT=0,STATE_HTML=1,STATE_PRE_COMMENT=2,STATE_COMMENT=3,WHITESPACE=/\s/,ALLOWED_TAGS_REGEX=/<(\w*)>/g;function striptags(html,allowableTags){var html=html||'',state=STATE_OUTPUT,depth=0,output='',tagBuffer='',inQuote=false,i,length,c;if(typeof allowableTags==='string'){ // Parse the string into an array of tags
allowableTags=parseAllowableTags(allowableTags);}else if(!Array.isArray(allowableTags)){ // If it is not an array, explicitly set to null
allowableTags=null;}for(i=0,length=html.length;i<length;i++){c=html[i];switch(c){case '<':{ // ignore '<' if inside a quote
if(inQuote){break;} // '<' followed by a space is not a valid tag, continue
if(html[i+1]==' '){consumeCharacter(c);break;} // change to STATE_HTML
if(state==STATE_OUTPUT){state=STATE_HTML;consumeCharacter(c);break;} // ignore additional '<' characters when inside a tag
if(state==STATE_HTML){depth++;break;}consumeCharacter(c);break;}case '>':{ // something like this is happening: '<<>>'
if(depth){depth--;break;} // ignore '>' if inside a quote
if(inQuote){break;} // an HTML tag was closed
if(state==STATE_HTML){inQuote=state=0;if(allowableTags){tagBuffer+='>';flushTagBuffer();}break;} // '<!' met its ending '>'
if(state==STATE_PRE_COMMENT){inQuote=state=0;tagBuffer='';break;} // if last two characters were '--', then end comment
if(state==STATE_COMMENT&&html[i-1]=='-'&&html[i-2]=='-'){inQuote=state=0;tagBuffer='';break;}consumeCharacter(c);break;} // catch both single and double quotes
case '"':case '\'':{if(state==STATE_HTML){if(inQuote==c){ // end quote found
inQuote=false;}else if(!inQuote){ // start quote only if not already in one
inQuote=c;}}consumeCharacter(c);break;}case '!':{if(state==STATE_HTML&&html[i-1]=='<'){ // looks like we might be starting a comment
state=STATE_PRE_COMMENT;break;}consumeCharacter(c);break;}case '-':{ // if the previous two characters were '!-', this is a comment
if(state==STATE_PRE_COMMENT&&html[i-1]=='-'&&html[i-2]=='!'){state=STATE_COMMENT;break;}consumeCharacter(c);break;}case 'E':case 'e':{ // check for DOCTYPE, because it looks like a comment and isn't
if(state==STATE_PRE_COMMENT&&html.substr(i-6,7).toLowerCase()=='doctype'){state=STATE_HTML;break;}consumeCharacter(c);break;}default:{consumeCharacter(c);}}}function consumeCharacter(c){if(state==STATE_OUTPUT){output+=c;}else if(allowableTags&&state==STATE_HTML){tagBuffer+=c;}}function flushTagBuffer(){var normalized='',nonWhitespaceSeen=false,i,length,c;normalizeTagBuffer: for(i=0,length=tagBuffer.length;i<length;i++){c=tagBuffer[i].toLowerCase();switch(c){case '<':{break;}case '>':{break normalizeTagBuffer;}case '/':{nonWhitespaceSeen=true;break;}default:{if(!c.match(WHITESPACE)){nonWhitespaceSeen=true;normalized+=c;}else if(nonWhitespaceSeen){break normalizeTagBuffer;}}}}if(allowableTags.indexOf(normalized)!==-1){output+=tagBuffer;}tagBuffer='';}return output;} /**
     * Return an array containing tags that are allowed to pass through the
     * algorithm.
     *
     * @param string allowableTags A string of tags to allow (e.g. "<b><strong>").
     * @return array|null An array of allowed tags or null if none.
     */function parseAllowableTags(allowableTags){var tagsArray=[],match;while((match=ALLOWED_TAGS_REGEX.exec(allowableTags))!==null){tagsArray.push(match[1]);}return tagsArray.length!==0?tagsArray:null;}return striptags;});},{}],95:[function(require,module,exports){'use strict';module.exports=2147483647;},{}],96:[function(require,module,exports){'use strict';var toPosInt=require('es5-ext/number/to-pos-integer'),maxTimeout=require('./max-timeout');module.exports=function(value){value=toPosInt(value);if(value>maxTimeout)throw new TypeError(value+" exceeds maximum possible timeout");return value;};},{"./max-timeout":95,"es5-ext/number/to-pos-integer":58}],97:[function(require,module,exports){'use strict';var Ajax={};Ajax.errorCallback=function(response){Z.error(response);Z.debug('ajax error callback',2);Z.debug('textStatus: '+response.textStatus,2);Z.debug('errorThrown: ',2);Z.debug(response.errorThrown,2);Z.debug(response.jqxhr,2);};Ajax.error=Ajax.errorCallback;Ajax.activeRequests=[]; /*
 * Requires {target:items|collections|tags, libraryType:user|group, libraryID:<>}
 */Ajax.apiRequestUrl=function(params){Z.debug('Zotero.Ajax.apiRequestUrl',4);Z.debug(params,4);Object.keys(params).forEach(function(key){var val=params[key]; //should probably figure out exactly why I'm doing this, is it just to make sure no hashes snuck in?
//if so the new validation below takes care of that instead
if(typeof val=='string'){val=val.split('#',1);params[key]=val[0];} //validate params based on patterns in Zotero.validate
if(Zotero.validator.validate(val,key)===false){ //warn on invalid parameter and drop from params that will be used
Zotero.warn('API argument failed validation: '+key+' cannot be '+val);Zotero.warn(params);delete params[key];}});if(!params.target)throw new Error('No target defined for api request');if(!(params.libraryType=='user'||params.libraryType=='group'||params.libraryType==='')){throw new Error('Unexpected libraryType for api request '+JSON.stringify(params));}if(params.libraryType&&!params.libraryID){throw new Error('No libraryID defined for api request');}if(params.target=='publications'&&params.libraryType!='user'){throw new Error('publications is only valid for user libraries');}var base=Zotero.config.baseApiUrl;var url;if(params.libraryType!==''){url=base+'/'+params.libraryType+'s/'+params.libraryID;if(params.collectionKey){if(params.collectionKey=='trash'){url+='/items/trash';return url;}else if(params.collectionKey.indexOf(',')!==-1){}else if(params.target!='collections'){url+='/collections/'+params.collectionKey;}}}else {url=base;}switch(params.target){case 'items':url+='/items';break;case 'item':if(params.itemKey){url+='/items/'+params.itemKey;}else {url+='/items';}break;case 'collections':url+='/collections';break;case 'childCollections':url+='/collections';break;case 'collection':break;case 'tags':url+='/tags';break;case 'children':url+='/items/'+params.itemKey+'/children';break;case 'key':url=base+'/users/'+params.libraryID+'/keys/'+params.apiKey;break;case 'deleted':url+='/deleted';break;case 'userGroups':url=base+'/users/'+params.libraryID+'/groups';break;case 'settings':url+='/settings/'+(params.settingsKey||'');break;case 'publications':url+='/publications/items';break;default:return false;}switch(params.targetModifier){case 'top':url+='/top';break;case 'file':url+='/file';break;case 'viewsnapshot':url+='/file/view';break;} //Z.debug("returning apiRequestUrl: " + url, 3);
return url;};Ajax.apiQueryString=function(passedParams,useConfigKey){Z.debug('Zotero.Ajax.apiQueryString',4);Z.debug(passedParams,4);if(useConfigKey===null||typeof useConfigKey==='undefined'){useConfigKey=true;}Object.keys(passedParams).forEach(function(key){var val=passedParams[key];if(typeof val=='string'){val=val.split('#',1);passedParams[key]=val[0];}});if(passedParams.hasOwnProperty('order')&&passedParams['order']=='creatorSummary'){passedParams['order']='creator';}if(passedParams.hasOwnProperty('order')&&passedParams['order']=='year'){passedParams['order']='date';}if(useConfigKey&&Zotero.config.sessionAuth){var sessionKey=Zotero.utils.readCookie(Zotero.config.sessionCookieName);passedParams['session']=sessionKey;}else if(useConfigKey&&Zotero.config.apiKey){passedParams['key']=Zotero.config.apiKey;} //Z.debug()
if(passedParams.hasOwnProperty('sort')&&passedParams['sort']=='undefined'){ //alert('fixed a bad sort');
passedParams['sort']='asc';}Z.debug(passedParams,4);var queryString='?';var queryParamsArray=[];var queryParamOptions=['start','limit','order','sort','content','include','format','q','fq','itemType','itemKey','collectionKey','searchKey','locale','tag','tagType','key','style','linkMode','linkwrap','session','newer','since'];queryParamOptions.sort(); //build simple api query parameters object
var queryParams={};queryParamOptions.forEach(function(val){if(passedParams.hasOwnProperty(val)&&passedParams[val]!==''){queryParams[val]=passedParams[val];}}); //take out itemKey if it is not a list
if(passedParams.hasOwnProperty('target')&&passedParams['target']!=='items'){if(queryParams.hasOwnProperty('itemKey')&&queryParams['itemKey'].indexOf(',')==-1){delete queryParams['itemKey'];}} //take out collectionKey if it is not a list
if(passedParams.hasOwnProperty('target')&&passedParams['target']!=='collections'){if(queryParams.hasOwnProperty('collectionKey')&&queryParams['collectionKey'].indexOf(',')===-1){delete queryParams['collectionKey'];}} //add each of the found queryParams onto array
Object.keys(queryParams).forEach(function(key){var value=queryParams[key];if(Array.isArray(value)){value.forEach(function(v){if(key=='tag'&&v[0]=='-'){v='\\'+v;}queryParamsArray.push(encodeURIComponent(key)+'='+encodeURIComponent(v));});}else {if(key=='tag'&&value[0]=='-'){value='\\'+value;}queryParamsArray.push(encodeURIComponent(key)+'='+encodeURIComponent(value));}}); //build query string by concatenating array
queryString+=queryParamsArray.join('&'); //Z.debug("resulting queryString:" + queryString);
return queryString;};Ajax.apiRequestString=function(config){return Ajax.apiRequestUrl(config)+Ajax.apiQueryString(config);};Ajax.proxyWrapper=function(requestUrl,method){if(Zotero.config.proxy){if(!method){method='GET';}return Zotero.config.proxyPath+'?requestMethod='+method+'&requestUrl='+encodeURIComponent(requestUrl);}else {return requestUrl;}};Ajax.parseQueryString=function(query){};Ajax.webUrl=function(args){};Ajax.downloadBlob=function(url){return new Promise(function(resolve,reject){var xhr=new XMLHttpRequest();var blob;xhr.open('GET',url,true);xhr.responseType='blob';xhr.addEventListener('load',function(){if(xhr.status===200){Z.debug('downloadBlob Image retrieved. resolving',3);resolve(xhr.response);}else {reject(xhr.response);}}); // Send XHR
xhr.send();});};module.exports=Ajax;},{}],98:[function(require,module,exports){'use strict';var _typeof=typeof Symbol==="function"&&_typeof2(Symbol.iterator)==="symbol"?function(obj){return typeof obj==="undefined"?"undefined":_typeof2(obj);}:function(obj){return obj&&typeof Symbol==="function"&&obj.constructor===Symbol?"symbol":typeof obj==="undefined"?"undefined":_typeof2(obj);};module.exports=function(){this.instance='Zotero.ApiObject';this.version=0;}; //associate Entry with a library so we can update it on the server
module.exports.prototype.associateWithLibrary=function(library){var apiObject=this;apiObject.owningLibrary=library;if(_typeof(this.apiObj.library)=='object'){this.apiObj.library.type=library.type;this.apiObj.library.id=library.libraryID;}return apiObject;};module.exports.prototype.fieldComparer=function(attr){if(Intl){var collator=new Intl.Collator();return function(a,b){return collator.compare(a.apiObj.data[attr],b.apiObj.data[attr]);};}else {return function(a,b){if(a.apiObj.data[attr].toLowerCase()==b.apiObj.data[attr].toLowerCase()){return 0;}if(a.apiObj.data[attr].toLowerCase()<b.apiObj.data[attr].toLowerCase()){return -1;}return 1;};}};},{}],99:[function(require,module,exports){'use strict';module.exports=function(response){Z.debug('Zotero.ApiResponse',3);this.totalResults=0;this.apiVersion=null;this.lastModifiedVersion=0;this.linkHeader='';this.links={};if(response){if(!response.isError){this.isError=false;}else {this.isError=true;}this.data=response.data; //this.jqxhr = response.jqxhr;
this.parseResponse(response);}};module.exports.prototype.parseResponse=function(response){Z.debug('parseResponse');var apiResponse=this;apiResponse.jqxhr=response.jqxhr;apiResponse.status=response.jqxhr.status; //keep track of relevant headers
apiResponse.lastModifiedVersion=response.jqxhr.getResponseHeader('Last-Modified-Version');apiResponse.apiVersion=response.jqxhr.getResponseHeader('Zotero-API-Version');apiResponse.backoff=response.jqxhr.getResponseHeader('Backoff');apiResponse.retryAfter=response.jqxhr.getResponseHeader('Retry-After');apiResponse.contentType=response.jqxhr.getResponseHeader('Content-Type');apiResponse.linkHeader=response.jqxhr.getResponseHeader('Link');apiResponse.totalResults=response.jqxhr.getResponseHeader('Total-Results');if(apiResponse.backoff){apiResponse.backoff=parseInt(apiResponse.backoff,10);}if(apiResponse.retryAfter){apiResponse.retryAfter=parseInt(apiResponse.retryAfter,10);} //TODO: parse link header into individual links
Z.debug('parse link header');Z.debug(apiResponse.linkHeader);if(apiResponse.linkHeader){var links=apiResponse.linkHeader.split(',');var parsedLinks={};var linkRegex=/^<([^>]+)>; rel="([^\"]*)"$/;for(var i=0;i<links.length;i++){var matches=linkRegex.exec(links[i].trim());if(matches[2]){parsedLinks[matches[2]]=matches[1];}}apiResponse.parsedLinks=parsedLinks;}Z.debug('done parsing response');};},{}],100:[function(require,module,exports){'use strict';var _typeof=typeof Symbol==="function"&&_typeof2(Symbol.iterator)==="symbol"?function(obj){return typeof obj==="undefined"?"undefined":_typeof2(obj);}:function(obj){return obj&&typeof Symbol==="function"&&obj.constructor===Symbol?"symbol":typeof obj==="undefined"?"undefined":_typeof2(obj);};var Zotero={callbacks:{},ui:{callbacks:{},keyCode:{BACKSPACE:8,COMMA:188,DELETE:46,DOWN:40,END:35,ENTER:13,ESCAPE:27,HOME:36,LEFT:37,PAGE_DOWN:34,PAGE_UP:33,PERIOD:190,RIGHT:39,SPACE:32,TAB:9,UP:38}},offline:{},temp:{},config:{librarySettings:{},baseApiUrl:'https://api.zotero.org',baseWebsiteUrl:'https://zotero.org',baseFeedUrl:'https://api.zotero.org',baseZoteroWebsiteUrl:'https://www.zotero.org',baseDownloadUrl:'https://www.zotero.org',nonparsedBaseUrl:'',debugLogEndpoint:'',storeDebug:true,directDownloads:true,proxyPath:'/proxyrequest',ignoreLoggedInStatus:false,storePrefsRemote:true,preferUrlItem:true,sessionAuth:false,proxy:false,apiKey:'',apiVersion:3,locale:'en-US',cacheStoreType:'localStorage',preloadCachedLibrary:true,sortOrdering:{'dateAdded':'desc','dateModified':'desc','date':'desc','year':'desc','accessDate':'desc','title':'asc','creator':'asc'},defaultSortColumn:'title',defaultSortOrder:'asc',largeFields:{'title':1,'abstractNote':1,'extra':1},richTextFields:{'note':1},maxFieldSummaryLength:{title:60},exportFormats:['bibtex','bookmarks','mods','refer','rdf_bibliontology','rdf_dc','rdf_zotero','ris','wikipedia'],exportFormatsMap:{'bibtex':'BibTeX','bookmarks':'Bookmarks','mods':'MODS','refer':'Refer/BibIX','rdf_bibliontology':'Bibliontology RDF','rdf_dc':'Unqualified Dublin Core RDF','rdf_zotero':'Zotero RDF','ris':'RIS','wikipedia':'Wikipedia Citation Templates'},defaultApiArgs:{'order':'title','sort':'asc','limit':50,'start':0}},debug:function debug(debugstring,level){var prefLevel=3;if(Zotero.config.storeDebug){if(level<=prefLevel){Zotero.debugstring+='DEBUG:'+debugstring+'\n';}}if(typeof console=='undefined'){return;}if(typeof level!=='number'){level=1;}if(Zotero.preferences!==undefined){prefLevel=Zotero.preferences.getPref('debug_level');}if(level<=prefLevel){console.log(debugstring);}},warn:function warn(warnstring){if(Zotero.config.storeDebug){Zotero.debugstring+='WARN:'+warnstring+'\n';}if(typeof console=='undefined'||typeof console.warn=='undefined'){this.debug(warnstring);}else {console.warn(warnstring);}},error:function error(errorstring){if(Zotero.config.storeDebug){Zotero.debugstring+='ERROR:'+errorstring+'\n';}if(typeof console=='undefined'||typeof console.error=='undefined'){this.debug(errorstring);}else {console.error(errorstring);}},submitDebugLog:function submitDebugLog(){Zotero.net.ajax({url:Zotero.config.debugLogEndpoint,data:{'debug_string':Zotero.debugstring}}).then(function(xhr){var data=JSON.parse(xhr.responseText);if(data.logID){alert('ZoteroWWW debug logID:'+data.logID);}else if(data.error){alert('Error submitting ZoteroWWW debug log:'+data.error);}});},catchPromiseError:function catchPromiseError(err){Zotero.error(err);},libraries:{},validator:{patterns:{ //'itemKey': /^([A-Z0-9]{8,},?)+$/,
'itemKey':/^.+$/,'collectionKey':/^([A-Z0-9]{8,})|trash$/, //'tag': /^[^#]*$/,
'libraryID':/^[0-9]+$/,'libraryType':/^(user|group|)$/,'target':/^(items?|collections?|tags|children|deleted|userGroups|key|settings|publications)$/,'targetModifier':/^(top|file|file\/view)$/, //get params
'sort':/^(asc|desc)$/,'start':/^[0-9]*$/,'limit':/^[0-9]*$/,'order':/^\S*$/,'content':/^((html|json|data|bib|none|bibtex|bookmarks|coins|csljson|mods|refer|rdf_bibliontology|rdf_dc|ris|tei|wikipedia),?)+$/,'include':/^((html|json|data|bib|none|bibtex|bookmarks|coins|csljson|mods|refer|rdf_bibliontology|rdf_dc|ris|tei|wikipedia),?)+$/,'q':/^.*$/,'fq':/^\S*$/,'itemType':/^\S*$/,'locale':/^\S*$/,'tag':/^.*$/,'tagType':/^(0|1)$/,'key':/^\S*/,'format':/^(json|atom|bib|keys|versions|bibtex|bookmarks|mods|refer|rdf_bibliontology|rdf_dc|rdf_zotero|ris|wikipedia)$/,'style':/^\S*$/,'linkwrap':/^(0|1)*$/},validate:function validate(arg,type){Z.debug('Zotero.validate',4);if(arg===''){return null;}else if(arg===null){return true;}Z.debug(arg+' '+type,4);var patterns=this.patterns;if(patterns.hasOwnProperty(type)){return patterns[type].test(arg);}else {return null;}}},_logEnabled:0,enableLogging:function enableLogging(){Zotero._logEnabled++;if(Zotero._logEnabled>0){ //TODO: enable debug_log?
}},disableLogging:function disableLogging(){Zotero._logEnabled--;if(Zotero._logEnabled<=0){Zotero._logEnabled=0; //TODO: disable debug_log?
}},init:function init(){var store;if(Zotero.config.cacheStoreType=='localStorage'&&typeof localStorage!='undefined'){store=localStorage;}else if(Zotero.config.cacheStoreType=='sessionStorage'&&typeof sessionStorage!='undefined'){store=sessionStorage;}else {store={};}Zotero.store=store;Zotero.cache=new Zotero.Cache(store); //initialize global preferences object
Zotero.preferences=new Zotero.Preferences(Zotero.store,'global'); //get localized item constants if not stored in localstorage
var locale='en-US';if(Zotero.config.locale){locale=Zotero.config.locale;}locale='en-US';}};Zotero.ajaxRequest=function(url,type,options){Z.debug('Zotero.ajaxRequest ==== '+url,3);if(!type){type='GET';}if(!options){options={};}var requestObject={url:url,type:type};requestObject=Z.extend({},requestObject,options);Z.debug(requestObject,3);return Zotero.net.queueRequest(requestObject);}; //non-DOM (jquery) event management
Zotero.eventmanager={callbacks:{}};Zotero.trigger=function(eventType){var data=arguments.length<=1||arguments[1]===undefined?{}:arguments[1];var filter=arguments.length<=2||arguments[2]===undefined?false:arguments[2];if(filter){Z.debug('filter is not false',3);eventType+='_'+filter;}Zotero.debug('Triggering eventful '+eventType,3);Z.debug(data);data.zeventful=true; // if(data.triggeringElement === null || data.triggeringElement === undefined){
// 	data.triggeringElement = J('#eventful');
// }
try{if(Zotero.eventmanager.callbacks.hasOwnProperty(eventType)){var callbacks=Zotero.eventmanager.callbacks[eventType];callbacks.forEach(function(callback){var cdata=Z.extend({},data,callback.data);var e={data:cdata};callback.f(e);});}}catch(e) {Z.error('failed triggering:'+eventType);Z.error(e);}};Zotero.listen=function(events,handler,data,filter){Z.debug('Zotero.listen: '+events); //append filter to event strings if it's specified
var eventsArray=events.split(' ');if(eventsArray.length>0&&filter){for(var i=0;i<eventsArray.length;i++){eventsArray[i]+='_'+filter;}}eventsArray.forEach(function(ev){if(Zotero.eventmanager.callbacks.hasOwnProperty(ev)){Zotero.eventmanager.callbacks[ev].push({data:data,f:handler});}else {Zotero.eventmanager.callbacks[ev]=[{data:data,f:handler}];}});};Zotero.extend=function(){var res={};for(var i=0;i<arguments.length;i++){var a=arguments[i];if((typeof a==='undefined'?'undefined':_typeof(a))!='object'){continue;}Object.keys(a).forEach(function(key){res[key]=a[key];});}return res;};module.exports=Zotero;},{}],101:[function(require,module,exports){'use strict'; //build a consistent string from an object to use as a cache key
//put object key/value pairs into array, sort array, and concatenate
//array with '/'
module.exports=function(store){this.store=store;var registry=this.store._registry;if(registry===null||typeof registry=='undefined'){registry={};this.store._registry=JSON.stringify(registry);}};module.exports.prototype.objectCacheString=function(params){var paramVarsArray=[];Object.keys(params).forEach(function(index){var value=params[index];if(!value){return;}else if(Array.isArray(value)){value.forEach(function(v){paramVarsArray.push(index+'/'+encodeURIComponent(v));});}else {paramVarsArray.push(index+'/'+encodeURIComponent(value));}});paramVarsArray.sort();Z.debug(paramVarsArray,4);var objectCacheString=paramVarsArray.join('/');return objectCacheString;}; //should use setItem and getItem if I extend that to the case where no Storage object is available in the browser
module.exports.prototype.save=function(params,object,cachetags){ //cachetags for expiring entries
if(!Array.isArray(cachetags)){cachetags=[];} //get registry object from storage
var registry=JSON.parse(this.store._registry);if(!registry){registry={};}var objectCacheString=this.objectCacheString(params); //save object in storage
this.store[objectCacheString]=JSON.stringify(object); //make registry entry for object
var registryEntry={'id':objectCacheString,saved:Date.now(),cachetags:cachetags};registry[objectCacheString]=registryEntry; //save registry back to storage
this.store._registry=JSON.stringify(registry);};module.exports.prototype.load=function(params){Z.debug('Zotero.Cache.load',3);var objectCacheString=this.objectCacheString(params);Z.debug(objectCacheString,4);try{var s=this.store[objectCacheString];if(!s){Z.warn('No value found in cache store - '+objectCacheString,3);return null;}else {return JSON.parse(s);}}catch(e) {Z.error('Error parsing retrieved cache data: '+objectCacheString+' : '+s);return null;}};module.exports.prototype.expireCacheTag=function(tag){Z.debug('Zotero.Cache.expireCacheTag',3);var registry=JSON.parse(this.store._registry);var store=this.store;Object.keys(registry).forEach(function(index){var value=registry[index];if(value.cachetags.indexOf(tag)!=-1){Z.debug('tag '+tag+' found for item '+value['id']+' : expiring',4);delete store[value['id']];delete registry[value['id']];}});};module.exports.prototype.clear=function(){if(typeof this.store.clear=='function'){this.store.clear();}else {this.store={};}};},{}],102:[function(require,module,exports){'use strict';module.exports=function(collectionObj){this.instance='Zotero.Collection';this.libraryUrlIdentifier='';this.itemKeys=false;this.key='';this.version=0;this.synced=false;this.pristineData=null;this.apiObj={'key':'','version':0,'library':{},'links':{},'meta':{},'data':{'key':'','version':0,'name':'','parentCollection':false,'relations':{}}};this.children=[];this.topLevel=true;if(collectionObj){this.parseJsonCollection(collectionObj);}};module.exports.prototype=new Zotero.ApiObject();module.exports.prototype.instance='Zotero.Collection';module.exports.prototype.updateObjectKey=function(collectionKey){this.updateCollectionKey(collectionKey);};module.exports.prototype.updateCollectionKey=function(collectionKey){var collection=this;collection.key=collectionKey;collection.apiObj.key=collectionKey;collection.apiObj.data.key=collectionKey;return collection;};module.exports.prototype.parseJsonCollection=function(apiObj){Z.debug('parseJsonCollection',4);var collection=this;collection.key=apiObj.key;collection.version=apiObj.version;collection.apiObj=Z.extend({},apiObj);collection.pristineData=Z.extend({},apiObj.data);collection.parentCollection=false;collection.topLevel=true;collection.synced=true;collection.initSecondaryData();};module.exports.prototype.initSecondaryData=function(){var collection=this;if(collection.apiObj.data['parentCollection']){collection.topLevel=false;}else {collection.topLevel=true;}if(Zotero.config.librarySettings.libraryPathString){collection.websiteCollectionLink=Zotero.config.librarySettings.libraryPathString+'/collectionKey/'+collection.apiObj.key;}else {collection.websiteCollectionLink='';}collection.hasChildren=collection.apiObj.meta.numCollections?true:false;};module.exports.prototype.nestCollection=function(collectionsObject){Z.debug('Zotero.Collection.nestCollection',4);var collection=this;var parentCollectionKey=collection.get('parentCollection');if(parentCollectionKey!==false){if(collectionsObject.hasOwnProperty(parentCollectionKey)){var parentOb=collectionsObject[parentCollectionKey];parentOb.children.push(collection);parentOb.hasChildren=true;collection.topLevel=false;return true;}}return false;};module.exports.prototype.addItems=function(itemKeys){Z.debug('Zotero.Collection.addItems',3);var collection=this;var config={'target':'items','libraryType':collection.apiObj.library.type,'libraryID':collection.apiObj.library.id,'collectionKey':collection.key};var requestData=itemKeys.join(' ');return Zotero.ajaxRequest(config,'POST',{data:requestData});};module.exports.prototype.getMemberItemKeys=function(){Z.debug('Zotero.Collection.getMemberItemKeys',3);var collection=this;var config={'target':'items','libraryType':collection.apiObj.library.type,'libraryID':collection.apiObj.library.id,'collectionKey':collection.key,'format':'keys'};return Zotero.ajaxRequest(config,'GET',{processData:false}).then(function(response){Z.debug('getMemberItemKeys proxied callback',3);var result=response.data;var keys=result.trim().split(/[\s]+/);collection.itemKeys=keys;return keys;});};module.exports.prototype.removeItem=function(itemKey){var collection=this;var config={'target':'item','libraryType':collection.apiObj.library.type,'libraryID':collection.apiObj.library.id,'collectionKey':collection.key,'itemKey':itemKey};return Zotero.ajaxRequest(config,'DELETE',{processData:false,cache:false});};module.exports.prototype.update=function(name,parentKey){var collection=this;if(!parentKey)parentKey=false;var config={'target':'collection','libraryType':collection.apiObj.library.type,'libraryID':collection.apiObj.library.id,'collectionKey':collection.key};collection.set('name',name);collection.set('parentCollection',parentKey);var writeObject=collection.writeApiObj();var requestData=JSON.stringify(writeObject);return Zotero.ajaxRequest(config,'PUT',{data:requestData,processData:false,headers:{'If-Unmodified-Since-Version':collection.version},cache:false});};module.exports.prototype.writeApiObj=function(){var collection=this;var writeObj=Z.extend({},collection.pristineData,collection.apiObj.data);return writeObj;};module.exports.prototype.remove=function(){Z.debug('Zotero.Collection.delete',3);var collection=this;var owningLibrary=collection.owningLibrary;var config={'target':'collection','libraryType':collection.apiObj.library.type,'libraryID':collection.apiObj.library.id,'collectionKey':collection.key};return Zotero.ajaxRequest(config,'DELETE',{processData:false,headers:{'If-Unmodified-Since-Version':collection.version},cache:false}).then(function(){Z.debug('done deleting collection. remove local copy.',3);owningLibrary.collections.removeLocalCollection(collection.key);owningLibrary.trigger('libraryCollectionsUpdated');});};module.exports.prototype.get=function(key){var collection=this;switch(key){case 'title':case 'name':return collection.apiObj.data.name;case 'collectionKey':case 'key':return collection.apiObj.key||collection.key;case 'collectionVersion':case 'version':return collection.apiObj.version;case 'parentCollection':return collection.apiObj.data.parentCollection;}if(key in collection.apiObj.data){return collection.apiObj.data[key];}else if(collection.apiObj.meta.hasOwnProperty(key)){return collection.apiObj.meta[key];}else if(collection.hasOwnProperty(key)){return collection[key];}return null;}; /*
 module.exports.prototype.get = function(key){
	var collection = this;
	switch(key) {
		case 'title':
		case 'name':
			return collection.apiObj.data['name'];
		case 'collectionKey':
		case 'key':
			return collection.apiObj.key;
		case 'parentCollection':
			return collection.apiObj.data['parentCollection'];
		case 'collectionVersion':
		case 'version':
			return collection.apiObj.version;
	}
	
	if(key in collection.apiObj.data){
		return collection.apiObj.data[key];
	}
	else if(key in collection.apiObj.meta){
		return collection.apiObj.meta[key];
	}
	else if(collection.hasOwnProperty(key)){
		return collection[key];
	}
	
	return null;
};
*/module.exports.prototype.set=function(key,val){var collection=this;if(key in collection.apiObj.data){collection.apiObj.data[key]=val;}switch(key){case 'title':case 'name':collection.apiObj.data['name']=val;break;case 'collectionKey':case 'key':collection.key=val;collection.apiObj.key=val;collection.apiObj.data.key=val;break;case 'parentCollection':collection.apiObj.data['parentCollection']=val;break;case 'collectionVersion':case 'version':collection.version=val;collection.apiObj.version=val;collection.apiObj.data.version=val;break;}if(collection.hasOwnProperty(key)){collection[key]=val;}};},{}],103:[function(require,module,exports){'use strict';module.exports=function(jsonBody){var collections=this;this.instance='Zotero.Collections';this.version=0;this.syncState={earliestVersion:null,latestVersion:null};this.collectionObjects={};this.collectionsArray=[];this.objectMap=this.collectionObjects;this.objectArray=this.collectionsArray;this.dirty=false;this.loaded=false;if(jsonBody){this.addCollectionsFromJson(jsonBody);this.initSecondaryData();}};module.exports.prototype=new Zotero.Container(); //build up secondary data necessary to rendering and easy operations but that
//depend on all collections already being present
module.exports.prototype.initSecondaryData=function(){Z.debug('Zotero.Collections.initSecondaryData',3);var collections=this; //rebuild collectionsArray
collections.collectionsArray=[];Object.keys(collections.collectionObjects).forEach(function(key){var collection=collections.collectionObjects[key];collections.collectionsArray.push(collection);});collections.collectionsArray.sort(Zotero.ApiObject.prototype.fieldComparer('name'));collections.nestCollections();collections.assignDepths(0,collections.collectionsArray);}; //take Collection XML and insert a Collection object
module.exports.prototype.addCollection=function(collection){this.addObject(collection);return this;};module.exports.prototype.addCollectionsFromJson=function(jsonBody){Z.debug('addCollectionsFromJson');Z.debug(jsonBody);var collections=this;var collectionsAdded=[];jsonBody.forEach(function(collectionObj){var collection=new Zotero.Collection(collectionObj);collections.addObject(collection);collectionsAdded.push(collection);});return collectionsAdded;};module.exports.prototype.assignDepths=function(depth,cArray){Z.debug('Zotero.Collections.assignDepths',3);var collections=this;var insertchildren=function insertchildren(depth,children){children.forEach(function(col){col.nestingDepth=depth;if(col.hasChildren){insertchildren(depth+1,col.children);}});};collections.collectionsArray.forEach(function(collection){if(collection.topLevel){collection.nestingDepth=1;if(collection.hasChildren){insertchildren(2,collection.children);}}});};module.exports.prototype.nestedOrderingArray=function(){Z.debug('Zotero.Collections.nestedOrderingArray',3);var collections=this;var nested=[];var insertchildren=function insertchildren(a,children){children.forEach(function(col){a.push(col);if(col.hasChildren){insertchildren(a,col.children);}});};collections.collectionsArray.forEach(function(collection){if(collection.topLevel){nested.push(collection);if(collection.hasChildren){insertchildren(nested,collection.children);}}});Z.debug('Done with nestedOrderingArray',3);return nested;};module.exports.prototype.getCollection=function(key){return this.getObject(key);};module.exports.prototype.remoteDeleteCollection=function(collectionKey){var collections=this;return collections.removeLocalCollection(collectionKey);};module.exports.prototype.removeLocalCollection=function(collectionKey){var collections=this;return collections.removeLocalCollections([collectionKey]);};module.exports.prototype.removeLocalCollections=function(collectionKeys){var collections=this; //delete Collection from collectionObjects
for(var i=0;i<collectionKeys.length;i++){delete collections.collectionObjects[collectionKeys[i]];} //rebuild collectionsArray
collections.initSecondaryData();}; //reprocess all collections to add references to children inside their parents
module.exports.prototype.nestCollections=function(){var collections=this; //clear out all child references so we don't duplicate
collections.collectionsArray.forEach(function(collection){collection.children=[];});collections.collectionsArray.sort(Zotero.ApiObject.prototype.fieldComparer('name'));collections.collectionsArray.forEach(function(collection){collection.nestCollection(collections.collectionObjects);});};module.exports.prototype.writeCollections=function(collectionsArray){Z.debug('Zotero.Collections.writeCollections',3);var collections=this;var library=collections.owningLibrary;var i;var config={'target':'collections','libraryType':collections.owningLibrary.libraryType,'libraryID':collections.owningLibrary.libraryID};var requestUrl=Zotero.ajax.apiRequestString(config); //add collectionKeys to collections if they don't exist yet
for(i=0;i<collectionsArray.length;i++){var collection=collectionsArray[i]; //generate a collectionKey if the collection does not already have one
var collectionKey=collection.get('key');if(collectionKey===''||collectionKey===null){var newCollectionKey=Zotero.utils.getKey();collection.set('key',newCollectionKey);collection.set('version',0);}}var writeChunks=collections.chunkObjectsArray(collectionsArray);var rawChunkObjects=collections.rawChunks(writeChunks); //update collections with server response if successful
var writeCollectionsSuccessCallback=function writeCollectionsSuccessCallback(response){Z.debug('writeCollections successCallback',3);var library=this.library;var writeChunk=this.writeChunk;library.collections.updateObjectsFromWriteResponse(this.writeChunk,response); //save updated collections to collections
for(var i=0;i<writeChunk.length;i++){var collection=writeChunk[i];if(collection.synced&&!collection.writeFailure){library.collections.addCollection(collection); //save updated collections to IDB
if(Zotero.config.useIndexedDB){Z.debug('updating indexedDB collections');library.idbLibrary.updateCollections(writeChunk);}}}response.returnCollections=writeChunk;return response;};Z.debug('collections.version: '+collections.version,3);Z.debug('collections.libraryVersion: '+collections.libraryVersion,3);var requestObjects=[];for(i=0;i<writeChunks.length;i++){var successContext={writeChunk:writeChunks[i],library:library};var requestData=JSON.stringify(rawChunkObjects[i]);requestObjects.push({url:requestUrl,type:'POST',data:requestData,processData:false,headers:{ //'If-Unmodified-Since-Version': collections.version,
//'Content-Type': 'application/json'
},success:writeCollectionsSuccessCallback.bind(successContext)});}return library.sequentialRequests(requestObjects).then(function(responses){Z.debug('Done with writeCollections sequentialRequests promise',3);collections.initSecondaryData();responses.forEach(function(response){if(response.isError||response.data.hasOwnProperty('failed')&&Object.keys(response.data.failed).length>0){throw new Error('failure when writing collections');}});return responses;}).catch(function(err){Z.error(err); //rethrow so widget doesn't report success
throw err;});};},{}],104:[function(require,module,exports){'use strict';module.exports=function(){};module.exports.prototype.initSecondaryData=function(){};module.exports.prototype.addObject=function(object){Zotero.debug('Zotero.Container.addObject',4);var container=this;container.objectArray.push(object);container.objectMap[object.key]=object;if(container.owningLibrary){object.associateWithLibrary(container.owningLibrary);}return container;};module.exports.prototype.fieldComparer=function(field){if(Intl){var collator=new Intl.Collator();return function(a,b){return collator.compare(a.apiObj.data[field],b.apiObj.data[field]);};}else {return function(a,b){if(a.apiObj.data[field].toLowerCase()==b.apiObj.data[field].toLowerCase()){return 0;}if(a.apiObj.data[field].toLowerCase()<b.apiObj.data[field].toLowerCase()){return -1;}return 1;};}};module.exports.prototype.getObject=function(key){var container=this;if(container.objectMap.hasOwnProperty(key)){return container.objectMap[key];}else {return false;}};module.exports.prototype.getObjects=function(keys){var container=this;var objects=[];var object;for(var i=0;i<keys.length;i++){object=container.getObject(keys[i]);if(object){objects.push(object);}}return objects;};module.exports.prototype.removeObject=function(key){var container=this;if(container.objectMap.hasOwnProperty(key)){delete container.objectmap[key];container.initSecondaryData();}};module.exports.prototype.removeObjects=function(keys){var container=this; //delete Objects from objectMap;
for(var i=0;i<keys.length;i++){delete container.objectMap[keys[i]];} //rebuild array
container.initSecondaryData();};module.exports.prototype.writeObjects=function(objects){ //TODO:implement
}; //generate keys for objects about to be written if they are new
module.exports.prototype.assignKeys=function(objectsArray){var object;for(var i=0;i<objectsArray.length;i++){object=objectsArray[i];var key=object.get('key');if(!key){var newObjectKey=Zotero.utils.getKey();object.set('key',newObjectKey);object.set('version',0);}}return objectsArray;}; //split an array of objects into chunks to write over multiple api requests
module.exports.prototype.chunkObjectsArray=function(objectsArray){var chunkSize=50;var writeChunks=[];for(var i=0;i<objectsArray.length;i=i+chunkSize){writeChunks.push(objectsArray.slice(i,i+chunkSize));}return writeChunks;};module.exports.prototype.rawChunks=function(chunks){var rawChunkObjects=[];for(var i=0;i<chunks.length;i++){rawChunkObjects[i]=[];for(var j=0;j<chunks[i].length;j++){rawChunkObjects[i].push(chunks[i][j].writeApiObj());}}return rawChunkObjects;}; /**
 * Update syncState property on container to keep track of updates that occur during sync process.
 * Set earliestVersion to MIN(earliestVersion, version).
 * Set latestVersion to MAX(latestVersion, version).
 * This should be called with the modifiedVersion header for each response tied to this container
 * during a sync process.
 * @param  {int} version
 * @return {null}
 */module.exports.prototype.updateSyncState=function(version){var container=this;Z.debug('updateSyncState: '+version,3);if(!container.hasOwnProperty('syncState')){Z.debug('no syncState property');throw new Error('Attempt to update sync state of object with no syncState property');}if(container.syncState.earliestVersion===null){container.syncState.earliestVersion=version;}if(container.syncState.latestVersion===null){container.syncState.latestVersion=version;}if(version<container.syncState.earliestVersion){container.syncState.earliestVersion=version;}if(version>container.syncState.latestVersion){container.syncState.latestVersion=version;}Z.debug('done updating sync state',3);};module.exports.prototype.updateSyncedVersion=function(versionField){var container=this;if(container.syncState.earliestVersion!==null&&container.syncState.earliestVersion==container.syncState.latestVersion){container.version=container.syncState.latestVersion;container.synced=true;}else if(container.syncState.earliestVersion!==null){container.version=container.syncState.earliestVersion;}};module.exports.prototype.processDeletions=function(deletedKeys){var container=this;for(var i=0;i<deletedKeys.length;i++){var localObject=container.get(deletedKeys[i]);if(localObject!==false){ //still have object locally
if(localObject.synced===true){ //our object is not modified, so delete it as the server thinks we should
container.removeObjects([deletedKeys[i]]);}else { //TODO: conflict resolution
}}}}; //update items appropriately based on response to multi-write request
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
module.exports.prototype.updateObjectsFromWriteResponse=function(objectsArray,response){Z.debug('Zotero.Container.updateObjectsFromWriteResponse',3);Z.debug('statusCode: '+response.status,3);var data=response.data;if(response.status==200){Z.debug('newLastModifiedVersion: '+response.lastModifiedVersion,3); //make sure writes were actually successful and
//update the itemKey for the parent
if(data.hasOwnProperty('success')){ //update each successfully written item, possibly with new itemKeys
Object.keys(data.success).forEach(function(ind){var i=parseInt(ind,10);var key=data.success[ind];var object=objectsArray[i]; //throw error if objectKey mismatch
if(object.key!==''&&object.key!==key){throw new Error('object key mismatch in multi-write response');}if(object.key===''){object.updateObjectKey(key);}object.set('version',response.lastModifiedVersion);object.synced=true;object.writeFailure=false;});}if(data.hasOwnProperty('failed')){Z.debug('updating objects with failed writes',3);Object.keys(data.failed).forEach(function(ind){var failure=data.failed[ind];Z.error('failed write '+ind+' - '+failure);var i=parseInt(ind,10);var object=objectsArray[i];object.writeFailure=failure;});}}else if(response.status==204){ //single item put response, this probably should never go to this function
objectsArray[0].synced=true;}}; //return the key as a string when passed an argument that
//could be either a string key or an object with a key property
module.exports.prototype.extractKey=function(object){if(typeof object=='string'){return object;}return object.get('key');};},{}],105:[function(require,module,exports){'use strict';module.exports=function(data){this.instance='Zotero.Deleted';if(typeof data==='string'){this.deletedData=JSON.parse(data);}else {this.deletedData=data;}this.untilVersion=null;this.sinceVersion=null;this.waitingPromises=[];this.pending=false;}; //create, save referece, and return a Promise that will be resolved
//the next time we finish a deleted request
module.exports.prototype.addWaiter=function(){};},{}],106:[function(require,module,exports){'use strict';var SparkMD5=require('spark-md5');module.exports={};module.exports.getFileInfo=function(file){ //fileInfo: md5, filename, filesize, mtime, zip, contentType, charset
if(typeof FileReader==='undefined'){return Promise.reject(new Error('FileReader not supported'));}return new Promise(function(resolve,reject){var fileInfo={};var reader=new FileReader();reader.onload=function(e){Z.debug('Zotero.file.getFileInfo onloadFunc',3);var result=e.target.result;Zotero.debug(result,3);fileInfo.md5=SparkMD5.ArrayBuffer.hash(result);fileInfo.filename=file.name;fileInfo.filesize=file.size;fileInfo.mtime=Date.now();fileInfo.contentType=file.type; //fileInfo.reader = reader;
fileInfo.filedata=result;resolve(fileInfo);};reader.readAsArrayBuffer(file);});};module.exports.uploadFile=function(uploadInfo,fileInfo){Z.debug('Zotero.file.uploadFile',3);Z.debug(uploadInfo,4);var formData=new FormData();Object.keys(uploadInfo.params).forEach(function(key){var val=uploadInfo.params[key];formData.append(key,val);});var blobData=new Blob([fileInfo.filedata],{type:fileInfo.contentType});formData.append('file',blobData);var xhr=new XMLHttpRequest();xhr.open('POST',uploadInfo.url,true);return new Promise(function(resolve,reject){xhr.onload=function(evt){Z.debug('uploadFile onload event',3);if(this.status==201){Z.debug('successful upload - 201',3);resolve();}else {Z.error('uploadFile failed - '+xhr.status);reject({'message':'Failure uploading file.','code':xhr.status,'serverMessage':xhr.responseText});}};xhr.onprogress=function(evt){Z.debug('progress event');Z.debug(evt);};xhr.send(formData);}); //If CORS is not enabled on s3 this XHR will not have the normal status
//information, but will still fire readyStateChanges so you can tell
//when the upload has finished (even if you can't tell if it was successful
//from JS)
};},{"spark-md5":93}],107:[function(require,module,exports){'use strict';module.exports=function(groupObj){var group=this;group.instance='Zotero.Group';if(groupObj){this.parseJsonGroup(groupObj);}};module.exports.prototype=new Zotero.ApiObject();module.exports.prototype.parseJsonGroup=function(groupObj){var group=this;group.apiObj=groupObj;};module.exports.prototype.get=function(key){var group=this;switch(key){case 'title':case 'name':return group.apiObj.data.name;}if(key in group.apiObj){return group.apiObj[key];}if(key in group.apiObj.data){return group.apiObj.data[key];}if(key in group.apiObj.meta){return group.apiObj.meta[key];}if(group.hasOwnProperty(key)){return group[key];}return null;};module.exports.prototype.isWritable=function(userID){var group=this;switch(true){case group.get('owner')==userID:return true;case group.apiObj.data.admins&&group.apiObj.data.admins.indexOf(userID)!=-1:return true;case group.apiObj.data.libraryEditing=='members'&&group.apiObj.data.members&&group.apiObj.data.members.indexOf(userID)!=-1:return true;default:return false;}};module.exports.prototype.typeMap={'Private':'Private','PublicOpen':'Public, Open Membership','PublicClosed':'Public, Closed Membership'};module.exports.prototype.accessMap={'all':{'members':'Anyone can view, only members can edit','admins':'Anyone can view, only admins can edit'},'members':{'members':'Only members can view and edit','admins':'Only members can view, only admins can edit'},'admins':{'members':'Only admins can view, only members can edit','admins':'Only admins can view and edit'}};},{}],108:[function(require,module,exports){'use strict';module.exports=function(){this.instance='Zotero.Groups';this.groupsArray=[];}; /*
 module.exports.prototype.fetchGroup = function(groupID, apikey){
	//TODO: implement
};
*/module.exports.prototype.addGroupsFromJson=function(jsonBody){var groups=this;var groupsAdded=[];jsonBody.forEach(function(groupObj){Z.debug(groupObj,3);var group=new Zotero.Group(groupObj);groups.groupsArray.push(group);groupsAdded.push(group);});return groupsAdded;};module.exports.prototype.fetchUserGroups=function(userID,apikey){var groups=this;var aparams={'target':'userGroups','libraryType':'user','libraryID':userID,'order':'title'};if(apikey){aparams['key']=apikey;}else if(groups.owningLibrary){aparams['key']=groups.owningLibrary._apiKey;}return Zotero.ajaxRequest(aparams).then(function(response){Z.debug('fetchUserGroups proxied callback',3);var fetchedGroups=groups.addGroupsFromJson(response.data);response.fetchedGroups=fetchedGroups;return response;});};},{}],109:[function(require,module,exports){'use strict';module.exports={}; //Initialize an indexedDB for the specified library user or group + id
//returns a promise that is resolved with a Zotero.Idb.Library instance when successful
//and rejected onerror
module.exports.Library=function(libraryString){Z.debug('Zotero.Idb.Library',3);Z.debug('Initializing Zotero IDB',3);this.libraryString=libraryString;this.owningLibrary=null;this.initialized=false;};module.exports.Library.prototype.init=function(){var idbLibrary=this;return new Promise(function(resolve,reject){ //Don't bother with the prefixed names because they should all be irrelevant by now
var indexedDB=window.indexedDB;idbLibrary.indexedDB=indexedDB; // Now we can open our database
Z.debug('requesting indexedDb from browser',3);var request=indexedDB.open('Zotero_'+idbLibrary.libraryString,4);request.onerror=function(e){Zotero.error('ERROR OPENING INDEXED DB');reject();};var upgradeCallback=function upgradeCallback(event){Z.debug('Zotero.Idb onupgradeneeded or onsuccess',3);var oldVersion=event.oldVersion;Z.debug('oldVersion: '+event.oldVersion,3);var db=event.target.result;idbLibrary.db=db;if(oldVersion<4){ //delete old versions of object stores
Z.debug('Existing object store names:',3);Z.debug(JSON.stringify(db.objectStoreNames),3);Z.debug('Deleting old object stores',3);if(db.objectStoreNames['items']){db.deleteObjectStore('items');}if(db.objectStoreNames['tags']){db.deleteObjectStore('tags');}if(db.objectStoreNames['collections']){db.deleteObjectStore('collections');}if(db.objectStoreNames['files']){db.deleteObjectStore('files');}if(db.objectStoreNames['versions']){db.deleteObjectStore('versions');}Z.debug('Existing object store names:',3);Z.debug(JSON.stringify(db.objectStoreNames),3); // Create object stores to hold items, collections, and tags.
// IDB keys are just the zotero object keys
var itemStore=db.createObjectStore('items',{keyPath:'key'});var collectionStore=db.createObjectStore('collections',{keyPath:'key'});var tagStore=db.createObjectStore('tags',{keyPath:'tag'});var fileStore=db.createObjectStore('files');var versionStore=db.createObjectStore('versions');Z.debug('itemStore index names:',3);Z.debug(JSON.stringify(itemStore.indexNames),3);Z.debug('collectionStore index names:',3);Z.debug(JSON.stringify(collectionStore.indexNames),3);Z.debug('tagStore index names:',3);Z.debug(JSON.stringify(tagStore.indexNames),3); // Create index to search/sort items by each attribute
Object.keys(Zotero.Item.prototype.fieldMap).forEach(function(key){Z.debug('Creating index on '+key,3);itemStore.createIndex(key,'data.'+key,{unique:false});}); //itemKey index was created above with all other item fields
//itemStore.createIndex("itemKey", "itemKey", { unique: false });
//create multiEntry indices on item collectionKeys and tags
itemStore.createIndex('collectionKeys','data.collections',{unique:false,multiEntry:true}); //index on extra tagstrings array since tags are objects and we can't index them directly
itemStore.createIndex('itemTagStrings','_supplement.tagstrings',{unique:false,multiEntry:true}); //example filter for tag: Zotero.Idb.filterItems("itemTagStrings", "Unread");
//example filter collection: Zotero.Idb.filterItems("collectionKeys", "<collectionKey>");
//itemStore.createIndex("itemType", "itemType", { unique: false });
itemStore.createIndex('parentItemKey','data.parentItem',{unique:false});itemStore.createIndex('libraryKey','libraryKey',{unique:false});itemStore.createIndex('deleted','data.deleted',{unique:false});collectionStore.createIndex('name','data.name',{unique:false});collectionStore.createIndex('key','key',{unique:false});collectionStore.createIndex('parentCollection','data.parentCollection',{unique:false}); //collectionStore.createIndex("libraryKey", "libraryKey", { unique: false });
tagStore.createIndex('tag','tag',{unique:false}); //tagStore.createIndex("libraryKey", "libraryKey", { unique: false });
}};request.onupgradeneeded=upgradeCallback;request.onsuccess=function(){Z.debug('IDB success',3);idbLibrary.db=request.result;idbLibrary.initialized=true;resolve(idbLibrary);};});};module.exports.Library.prototype.deleteDB=function(){var idbLibrary=this;idbLibrary.db.close();return new Promise(function(resolve,reject){var deleteRequest=idbLibrary.indexedDB.deleteDatabase('Zotero_'+idbLibrary.libraryString);deleteRequest.onerror=function(){Z.error('Error deleting indexedDB');reject();};deleteRequest.onsuccess=function(){Z.debug('Successfully deleted indexedDB',2);resolve();};});}; /**
* @param {string} store_name
* @param {string} mode either "readonly" or "readwrite"
*/module.exports.Library.prototype.getObjectStore=function(store_name,mode){var idbLibrary=this;var tx=idbLibrary.db.transaction(store_name,mode);return tx.objectStore(store_name);};module.exports.Library.prototype.clearObjectStore=function(store_name){var idbLibrary=this;var store=idbLibrary.getObjectStore(store_name,'readwrite');return new Promise(function(resolve,reject){var req=store.clear();req.onsuccess=function(evt){Z.debug('Store cleared',3);resolve();};req.onerror=function(evt){Z.error('clearObjectStore:',evt.target.errorCode);reject();};});}; /**
* Add array of items to indexedDB
* @param {array} items
*/module.exports.Library.prototype.addItems=function(items){return this.addObjects(items,'item');}; /**
* Update/add array of items to indexedDB
* @param {array} items
*/module.exports.Library.prototype.updateItems=function(items){return this.updateObjects(items,'item');}; /**
* Remove array of items to indexedDB. Just references itemKey and does no other checks that items match
* @param {array} items
*/module.exports.Library.prototype.removeItems=function(items){return this.removeObjects(items,'item');}; /**
* Get item from indexedDB that has given itemKey
* @param {string} itemKey
*/module.exports.Library.prototype.getItem=function(itemKey){var idbLibrary=this;return new Promise(function(resolve,reject){var success=function success(event){resolve(event.target.result);};idbLibrary.db.transaction('items').objectStore(['items'],'readonly').get(itemKey).onsuccess=success;});}; /**
* Get all the items in this indexedDB
* @param {array} items
*/module.exports.Library.prototype.getAllItems=function(){return this.getAllObjects('item');};module.exports.Library.prototype.getOrderedItemKeys=function(field,order){var idbLibrary=this;Z.debug('Zotero.Idb.getOrderedItemKeys',3);Z.debug(''+field+' '+order,3);return new Promise(function(resolve,reject){var objectStore=idbLibrary.db.transaction(['items'],'readonly').objectStore('items');var index=objectStore.index(field);if(!index){throw new Error("Index for requested field '"+field+"'' not found");}var cursorDirection='next';if(order=='desc'){cursorDirection='prev';}var cursorRequest=index.openKeyCursor(null,cursorDirection);var itemKeys=[];cursorRequest.onsuccess=(function(event){var cursor=event.target.result;if(cursor){itemKeys.push(cursor.primaryKey);cursor.continue();}else {Z.debug('No more cursor: done. Resolving deferred.',3);resolve(itemKeys);}}).bind(this);cursorRequest.onfailure=(function(event){reject();}).bind(this);});}; //filter the items in indexedDB by value in field
module.exports.Library.prototype.filterItems=function(field,value){var idbLibrary=this;Z.debug('Zotero.Idb.filterItems '+field+' - '+value,3);return new Promise(function(resolve,reject){var itemKeys=[];var objectStore=idbLibrary.db.transaction(['items'],'readonly').objectStore('items');var index=objectStore.index(field);if(!index){throw new Error("Index for requested field '"+field+"'' not found");}var cursorDirection='next'; /*if(order == "desc"){
  	cursorDirection = "prev";
  }*/var range=IDBKeyRange.only(value);var cursorRequest=index.openKeyCursor(range,cursorDirection);cursorRequest.onsuccess=(function(event){var cursor=event.target.result;if(cursor){itemKeys.push(cursor.primaryKey);cursor.continue();}else {Z.debug('No more cursor: done. Resolving deferred.',3);resolve(itemKeys);}}).bind(this);cursorRequest.onfailure=(function(event){reject();}).bind(this);});};module.exports.Library.prototype.inferType=function(object){if(!object){return false;}if(!object.instance){return false;}switch(object.instance){case 'Zotero.Item':return 'item';case 'Zotero.Collection':return 'collection';case 'Zotero.Tag':return 'tag';default:return false;}};module.exports.Library.prototype.getTransactionAndStore=function(type,access){var idbLibrary=this;var transaction;var objectStore;switch(type){case 'item':transaction=idbLibrary.db.transaction(['items'],access);objectStore=transaction.objectStore('items');break;case 'collection':transaction=idbLibrary.db.transaction(['collections'],access);objectStore=transaction.objectStore('collections');break;case 'tag':transaction=idbLibrary.db.transaction(['tags'],access);objectStore=transaction.objectStore('tags');break;default:return Promise.reject();}return [transaction,objectStore];};module.exports.Library.prototype.addObjects=function(objects,type){Z.debug('Zotero.Idb.Library.addObjects',3);var idbLibrary=this;if(!type){type=idbLibrary.inferType(objects[0]);}var TS=idbLibrary.getTransactionAndStore(type,'readwrite');var transaction=TS[0];var objectStore=TS[1];return new Promise(function(resolve,reject){transaction.oncomplete=function(event){Zotero.debug('Add Objects transaction completed.',3);resolve();};transaction.onerror=function(event){Zotero.error('Add Objects transaction failed.');reject();};var reqSuccess=function reqSuccess(event){Zotero.debug('Added Object '+event.target.result,4);};for(var i in objects){var request=objectStore.add(objects[i].apiObj);request.onsuccess=reqSuccess;}});};module.exports.Library.prototype.updateObjects=function(objects,type){Z.debug('Zotero.Idb.Library.updateObjects',3);var idbLibrary=this;if(!type){type=idbLibrary.inferType(objects[0]);}var TS=idbLibrary.getTransactionAndStore(type,'readwrite');var transaction=TS[0];var objectStore=TS[1];return new Promise(function(resolve,reject){transaction.oncomplete=function(event){Zotero.debug('Update Objects transaction completed.',3);resolve();};transaction.onerror=function(event){Zotero.error('Update Objects transaction failed.');reject();};var reqSuccess=function reqSuccess(event){Zotero.debug('Updated Object '+event.target.result,4);};for(var i in objects){var request=objectStore.put(objects[i].apiObj);request.onsuccess=reqSuccess;}});};module.exports.Library.prototype.removeObjects=function(objects,type){var idbLibrary=this;if(!type){type=idbLibrary.inferType(objects[0]);}var TS=idbLibrary.getTransactionAndStore(type,'readwrite');var transaction=TS[0];var objectStore=TS[1];return new Promise(function(resolve,reject){transaction.oncomplete=function(event){Zotero.debug('Remove Objects transaction completed.',3);resolve();};transaction.onerror=function(event){Zotero.error('Remove Objects transaction failed.');reject();};var reqSuccess=function reqSuccess(event){Zotero.debug('Removed Object '+event.target.result,4);};for(var i in objects){var request=objectStore.delete(objects[i].key);request.onsuccess=reqSuccess;}});};module.exports.Library.prototype.getAllObjects=function(type){var idbLibrary=this;return new Promise(function(resolve,reject){var objects=[];var objectStore=idbLibrary.db.transaction(type+'s').objectStore(type+'s');objectStore.openCursor().onsuccess=function(event){var cursor=event.target.result;if(cursor){objects.push(cursor.value);cursor.continue();}else {resolve(objects);}};});};module.exports.Library.prototype.addCollections=function(collections){return this.addObjects(collections,'collection');};module.exports.Library.prototype.updateCollections=function(collections){Z.debug('Zotero.Idb.Library.updateCollections',3);return this.updateObjects(collections,'collection');}; /**
* Get collection from indexedDB that has given collectionKey
* @param {string} collectionKey
*/module.exports.Library.prototype.getCollection=function(collectionKey){var idbLibrary=this;return new Promise(function(resolve,reject){var success=function success(event){resolve(event.target.result);};idbLibrary.db.transaction('collections').objectStore(['collections'],'readonly').get(collectionKey).onsuccess=success;});};module.exports.Library.prototype.removeCollections=function(collections){Z.debug('Zotero.Idb.Library.removeCollections',3);return this.removeObjects(collections,'collection');};module.exports.Library.prototype.getAllCollections=function(){Z.debug('Zotero.Idb.Library.getAllCollections',3);return this.getAllObjects('collection');};module.exports.Library.prototype.addTags=function(tags){return this.addObjects(tags,'tag');};module.exports.Library.prototype.updateTags=function(tags){Z.debug('Zotero.Idb.Library.updateTags',3);return this.updateObjects(tags,'tag');};module.exports.Library.prototype.getAllTags=function(){Z.debug('getAllTags',3);return this.getAllObjects('tag');};module.exports.Library.prototype.setVersion=function(type,version){Z.debug('Zotero.Idb.Library.setVersion',3);var idbLibrary=this;return new Promise(function(resolve,reject){var transaction=idbLibrary.db.transaction(['versions'],'readwrite');transaction.oncomplete=function(event){Zotero.debug('set version transaction completed.',3);resolve();};transaction.onerror=function(event){Zotero.error('set version transaction failed.');reject();};var versionStore=transaction.objectStore('versions');var reqSuccess=function reqSuccess(event){Zotero.debug('Set Version'+event.target.result,3);};var request=versionStore.put(version,type);request.onsuccess=reqSuccess;});}; /**
* Get version data from indexedDB
* @param {string} type
*/module.exports.Library.prototype.getVersion=function(type){Z.debug('Zotero.Idb.Library.getVersion',3);var idbLibrary=this;return new Promise(function(resolve,reject){var success=function success(event){Z.debug('done getting version');resolve(event.target.result);};idbLibrary.db.transaction(['versions'],'readonly').objectStore('versions').get(type).onsuccess=success;});};module.exports.Library.prototype.setFile=function(itemKey,fileData){Z.debug('Zotero.Idb.Library.setFile',3);var idbLibrary=this;return new Promise(function(resolve,reject){var transaction=idbLibrary.db.transaction(['files'],'readwrite');transaction.oncomplete=function(event){Zotero.debug('set file transaction completed.',3);resolve();};transaction.onerror=function(event){Zotero.error('set file transaction failed.');reject();};var fileStore=transaction.objectStore('files');var reqSuccess=function reqSuccess(event){Zotero.debug('Set File'+event.target.result,3);};var request=fileStore.put(fileData,itemKey);request.onsuccess=reqSuccess;});}; /**
* Get item from indexedDB that has given itemKey
* @param {string} itemKey
*/module.exports.Library.prototype.getFile=function(itemKey){Z.debug('Zotero.Idb.Library.getFile',3);var idbLibrary=this;return new Promise(function(resolve,reject){var success=function success(event){Z.debug('done getting file');resolve(event.target.result);};idbLibrary.db.transaction(['files'],'readonly').objectStore('files').get(itemKey).onsuccess=success;});};module.exports.Library.prototype.deleteFile=function(itemKey){Z.debug('Zotero.Idb.Library.deleteFile',3);var idbLibrary=this;return new Promise(function(resolve,reject){var transaction=idbLibrary.db.transaction(['files'],'readwrite');transaction.oncomplete=function(event){Zotero.debug('delete file transaction completed.',3);resolve();};transaction.onerror=function(event){Zotero.error('delete file transaction failed.');reject();};var fileStore=transaction.objectStore('files');var reqSuccess=function reqSuccess(event){Zotero.debug('Deleted File'+event.target.result,4);};var request=fileStore.delete(itemKey);request.onsuccess=reqSuccess;});}; //intersect two arrays of strings as an AND condition on index results
module.exports.Library.prototype.intersect=function(ar1,ar2){var idbLibrary=this;var result=[];for(var i=0;i<ar1.length;i++){if(ar2.indexOf(ar1[i])!==-1){result.push(ar1[i]);}}return result;}; //intersect an array of arrays of strings as an AND condition on index results
module.exports.Library.prototype.intersectAll=function(arrs){var idbLibrary=this;var result=arrs[0];for(var i=0;i<arrs.length-1;i++){result=idbLibrary.intersect(result,arrs[i+1]);}return result;};},{}],110:[function(require,module,exports){'use strict';var striptags=require('striptags');var ItemMaps=require('./ItemMaps.js'); /*
 * TODO: several functions should not work unless we build a fresh item with a template
 * or parsed an item from the api with json content (things that depend on apiObj)
 * There should be a flag to note whether this is the case and throwing on attempts to
 * use these functions when it is not.
 */var Item=function Item(itemObj){this.instance='Zotero.Item';this.version=0;this.key='';this.synced=false;this.apiObj={};this.pristineData=null;this.childItemKeys=[];this.writeErrors=[];this.notes=[];if(itemObj){this.parseJsonItem(itemObj);}else {this.parseJsonItem(this.emptyJsonItem());}this.initSecondaryData();};Item.prototype=new Zotero.ApiObject();Item.prototype.parseJsonItem=function(apiObj){Z.debug('parseJsonItem',3);var item=this;item.version=apiObj.version;item.key=apiObj.key;item.apiObj=Z.extend({},apiObj);item.pristineData=Z.extend({},apiObj.data);if(!item.apiObj._supplement){item.apiObj._supplement={};}};Item.prototype.emptyJsonItem=function(){return {key:'',version:0,library:{},links:{},data:{key:'',version:0,title:'',creators:[],collections:[],tags:[],relations:{}},meta:{},_supplement:{}};}; //populate property values derived from json content
Item.prototype.initSecondaryData=function(){Z.debug('initSecondaryData',3);var item=this;item.version=item.apiObj.version;if(item.apiObj.data.itemType=='attachment'){item.mimeType=item.apiObj.data.contentType;item.translatedMimeType=Zotero.utils.translateMimeType(item.mimeType);}if('linkMode' in item.apiObj){item.linkMode=item.apiObj.data.linkMode;}item.attachmentDownloadUrl=Zotero.url.attachmentDownloadUrl(item);if(item.apiObj.meta.parsedDate){item.parsedDate=new Date(item.apiObj.meta.parsedDate);}else {item.parsedDate=false;}item.synced=false;item.updateTagStrings();Z.debug('done with initSecondaryData',3);};Item.prototype.updateTagStrings=function(){var item=this;var tagstrings=[];for(var i=0;i<item.apiObj.data.tags.length;i++){tagstrings.push(item.apiObj.data.tags[i].tag);}item.apiObj._supplement.tagstrings=tagstrings;};Item.prototype.initEmpty=function(itemType,linkMode){var item=this;return item.getItemTemplate(itemType,linkMode).then(function(template){item.initEmptyFromTemplate(template);return item;});}; //special case note initialization to guarentee synchronous and simplify some uses
Item.prototype.initEmptyNote=function(){var item=this;item.version=0;var noteTemplate={'itemType':'note','note':'','tags':[],'collections':[],'relations':{}};item.initEmptyFromTemplate(noteTemplate);return item;};Item.prototype.initEmptyFromTemplate=function(template){var item=this;item.version=0;item.key='';item.pristineData=Z.extend({},template);item.apiObj={key:'',version:0,library:{},links:{},data:template,meta:{},_supplement:{}};item.initSecondaryData();return item;};Item.prototype.isSupplementaryItem=function(){var item=this;var itemType=item.get('itemType');if(itemType=='attachment'||itemType=='note'){return true;}return false;};Item.prototype.isSnapshot=function(){var item=this;if(item.apiObj.links['enclosure']){var ftype=item.apiObj.links['enclosure'].type;if(!item.apiObj.links['enclosure']['length']&&ftype=='text/html'){return true;}}return false;};Item.prototype.updateObjectKey=function(objectKey){return this.updateItemKey(objectKey);};Item.prototype.updateItemKey=function(itemKey){var item=this;item.key=itemKey;item.apiObj.key=itemKey;item.apiObj.data.key=itemKey;item.pristineData.key=itemKey;return item;}; /*
 * Write updated information for the item to the api and potentiallyp
 * create new child notes (or attachments?) of this item
 */Item.prototype.writeItem=function(){var item=this;if(!item.owningLibrary){throw new Error('Item must be associated with a library');}return item.owningLibrary.items.writeItems([item]);}; //get the JS object to be PUT/POSTed for write
Item.prototype.writeApiObj=function(){var item=this; //remove any creators that have no names
if(item.apiObj.data.creators){var newCreatorsArray=item.apiObj.data.creators.filter(function(c){if(c.name||c.firstName||c.lastName){return true;}return false;});item.apiObj.data.creators=newCreatorsArray;} //copy apiObj, extend with pristine to make sure required fields are present
//and remove unwriteable fields(?)
var writeApiObj=Z.extend({},item.pristineData,item.apiObj.data);return writeApiObj;};Item.prototype.createChildNotes=function(notes){var item=this;var childItems=[];var childItemPromises=[];notes.forEach(function(note){var childItem=new Item();var p=childItem.initEmpty('note').then(function(noteItem){noteItem.set('note',note.note);noteItem.set('parentItem',item.key);childItems.push(noteItem);});childItemPromises.push(p);});return Promise.all(childItemPromises).then(function(){return item.owningLibrary.writeItems(childItems);});}; //TODO: implement
Item.prototype.writePatch=function(){};Item.prototype.getChildren=function(library){Z.debug('Zotero.Item.getChildren');var item=this;return Promise.resolve().then(function(){ //short circuit if has item has no children
if(!item.apiObj.meta.numChildren){return [];}var config={url:{'target':'children','libraryType':item.apiObj.library.type,'libraryID':item.apiObj.library.id,'itemKey':item.key}};return Zotero.net.queueRequest(config).then(function(response){Z.debug('getChildren proxied callback',4);var items=library.items;var childItems=items.addItemsFromJson(response.data);for(var i=childItems.length-1;i>=0;i--){childItems[i].associateWithLibrary(library);}return childItems;});});};Item.prototype.getItemTypes=function(locale){Z.debug('Zotero.Item.prototype.getItemTypes',3);if(!locale){locale='en-US';}locale='en-US';var itemTypes=Zotero.cache.load({locale:locale,target:'itemTypes'});if(itemTypes){Z.debug('have itemTypes in localStorage',3);Item.prototype.itemTypes=itemTypes; //JSON.parse(Zotero.storage.localStorage['itemTypes']);
return;}var query=Zotero.ajax.apiQueryString({locale:locale});var url=Zotero.config.baseApiUrl+'/itemTypes'+query;Zotero.net.ajax({url:Zotero.ajax.proxyWrapper(url,'GET'),type:'GET'}).then(function(xhr){Z.debug('got itemTypes response',3);Z.debug(xhr.response,4);Item.prototype.itemTypes=JSON.parse(xhr.responseText);Zotero.cache.save({locale:locale,target:'itemTypes'},Item.prototype.itemTypes);});};Item.prototype.getItemFields=function(locale){Z.debug('Zotero.Item.prototype.getItemFields',3);if(!locale){locale='en-US';}locale='en-US';var itemFields=Zotero.cache.load({locale:locale,target:'itemFields'});if(itemFields){Z.debug('have itemFields in localStorage',3);Item.prototype.itemFields=itemFields; //JSON.parse(Zotero.storage.localStorage['itemFields']);
Object.keys(Item.prototype.itemFields).forEach(function(key){var val=Item.prototype.itemFields[key];Zotero.localizations.fieldMap[val.field]=val.localized;});return;}var query=Zotero.ajax.apiQueryString({locale:locale});var requestUrl=Zotero.config.baseApiUrl+'/itemFields'+query;Zotero.net.ajax({url:Zotero.ajax.proxyWrapper(requestUrl),type:'GET'}).then(function(xhr){Z.debug('got itemTypes response',4);var data=JSON.parse(xhr.responseText);Item.prototype.itemFields=data;Zotero.cache.save({locale:locale,target:'itemFields'},data); //Zotero.storage.localStorage['itemFields'] = JSON.stringify(data);
Object.keys(Item.prototype.itemFields).forEach(function(key){var val=Item.prototype.itemFields[key];Zotero.localizations.fieldMap[val.field]=val.localized;});});};Item.prototype.getItemTemplate=function(){var itemType=arguments.length<=0||arguments[0]===undefined?'document':arguments[0];var linkMode=arguments.length<=1||arguments[1]===undefined?'':arguments[1];Z.debug('Zotero.Item.prototype.getItemTemplate',3);if(itemType=='attachment'&&linkMode==''){throw new Error('attachment template requested with no linkMode');}var query=Zotero.ajax.apiQueryString({itemType:itemType,linkMode:linkMode});var requestUrl=Zotero.config.baseApiUrl+'/items/new'+query;var cacheConfig={itemType:itemType,target:'itemTemplate'};var itemTemplate=Zotero.cache.load(cacheConfig);if(itemTemplate){Z.debug('have itemTemplate in localStorage',3);var template=itemTemplate; // JSON.parse(Zotero.storage.localStorage[url]);
return Promise.resolve(template);}return Zotero.ajaxRequest(requestUrl,'GET',{dataType:'json'}).then(function(response){Z.debug('got itemTemplate response',3);Zotero.cache.save(cacheConfig,response.data);return response.data;});};Item.prototype.getUploadAuthorization=function(fileinfo){ //fileInfo: md5, filename, filesize, mtime, zip, contentType, charset
Z.debug('Zotero.Item.getUploadAuthorization',3);var item=this;var config={'target':'item','targetModifier':'file','libraryType':item.owningLibrary.type,'libraryID':item.owningLibrary.libraryID,'itemKey':item.key};var headers={'Content-Type':'application/x-www-form-urlencoded'};var oldmd5=item.get('md5');if(oldmd5){headers['If-Match']=oldmd5;}else {headers['If-None-Match']='*';}return Zotero.ajaxRequest(config,'POST',{processData:true,data:fileinfo,headers:headers});};Item.prototype.registerUpload=function(uploadKey){Z.debug('Zotero.Item.registerUpload',3);var item=this;var config={'target':'item','targetModifier':'file','libraryType':item.owningLibrary.type,'libraryID':item.owningLibrary.libraryID,'itemKey':item.key};var headers={'Content-Type':'application/x-www-form-urlencoded'};var oldmd5=item.get('md5');if(oldmd5){headers['If-Match']=oldmd5;}else {headers['If-None-Match']='*';}return Zotero.ajaxRequest(config,'POST',{processData:true,data:{upload:uploadKey},headers:headers});};Item.prototype.fullUpload=function(file){};Item.prototype.creatorTypes={};Item.prototype.getCreatorTypes=function(itemType){Z.debug('Zotero.Item.prototype.getCreatorTypes: '+itemType,3);if(!itemType){itemType='document';} //parse stored creatorTypes object if it exists
//creatorTypes maps itemType to the possible creatorTypes
var creatorTypes=Zotero.cache.load({target:'creatorTypes'});if(creatorTypes){Z.debug('have creatorTypes in localStorage',3);Item.prototype.creatorTypes=creatorTypes; //JSON.parse(Zotero.storage.localStorage['creatorTypes']);
}if(Item.prototype.creatorTypes[itemType]){Z.debug('creatorTypes of requested itemType available in localStorage',3);Z.debug(Item.prototype.creatorTypes,4);return Promise.resolve(Item.prototype.creatorTypes[itemType]);}else {Z.debug('sending request for creatorTypes',3);var query=Zotero.ajax.apiQueryString({itemType:itemType}); //TODO: this probably shouldn't be using baseApiUrl directly
var requestUrl=Zotero.config.baseApiUrl+'/itemTypeCreatorTypes'+query;return Zotero.ajaxRequest(requestUrl,'GET',{dataType:'json'}).then(function(response){Z.debug('got creatorTypes response',4);Item.prototype.creatorTypes[itemType]=response.data; //Zotero.storage.localStorage['creatorTypes'] = JSON.stringify(Item.prototype.creatorTypes);
Zotero.cache.save({target:'creatorTypes'},Item.prototype.creatorTypes);return Item.prototype.creatorTypes[itemType];});}};Item.prototype.getCreatorFields=function(locale){Z.debug('Zotero.Item.prototype.getCreatorFields',3);var creatorFields=Zotero.cache.load({target:'creatorFields'});if(creatorFields){Z.debug('have creatorFields in localStorage',3);Item.prototype.creatorFields=creatorFields; // JSON.parse(Zotero.storage.localStorage['creatorFields']);
return Promise.resolve(creatorFields);}var requestUrl=Zotero.config.baseApiUrl+'/creatorFields';return Zotero.ajaxRequest(requestUrl,'GET',{dataType:'json'}).then(function(response){Z.debug('got itemTypes response',4);Item.prototype.creatorFields=response.data;Zotero.cache.save({target:'creatorFields'},response.data);});}; //---Functions to manually add Zotero format data instead of fetching it from the API ---
//To be used first with cached data for offline, could also maybe be used for custom types
Item.prototype.addItemTypes=function(itemTypes,locale){};Item.prototype.addItemFields=function(itemType,itemFields){};Item.prototype.addCreatorTypes=function(itemType,creatorTypes){};Item.prototype.addCreatorFields=function(itemType,creatorFields){};Item.prototype.addItemTemplates=function(templates){};Item.prototype.itemTypeImageClass=function(){ //linkModes: imported_file,imported_url,linked_file,linked_url
var item=this;if(item.apiObj.data.itemType=='attachment'){switch(item.apiObj.data.linkMode){case 'imported_file':if(item.translatedMimeType=='pdf'){return item.itemTypeImageSrc['attachmentPdf'];}return item.itemTypeImageSrc['attachmentFile'];case 'imported_url':if(item.translatedMimeType=='pdf'){return item.itemTypeImageSrc['attachmentPdf'];}return item.itemTypeImageSrc['attachmentSnapshot'];case 'linked_file':return item.itemTypeImageSrc['attachmentLink'];case 'linked_url':return item.itemTypeImageSrc['attachmentWeblink'];default:return item.itemTypeImageSrc['attachment'];}}else {return item.apiObj.data.itemType;}};Item.prototype.itemTypeIconClass=function(){ //linkModes: imported_file,imported_url,linked_file,linked_url
var item=this;var defaultIcon='fa fa-file-text-o';switch(item.apiObj.data.itemType){case 'attachment':switch(item.apiObj.data.linkMode){case 'imported_file':if(item.translatedMimeType=='pdf'){return 'fa fa-file-pdf-o';}return 'glyphicons glyphicons-file';case 'imported_url':if(item.translatedMimeType=='pdf'){return 'fa fa-file-pdf-o';}return 'glyphicons glyphicons-file';case 'linked_file':return 'glyphicons glyphicons-link'; //return item.itemTypeImageSrc['attachmentLink'];
case 'linked_url':return 'glyphicons glyphicons-link'; //return item.itemTypeImageSrc['attachmentWeblink'];
default:return 'glyphicons glyphicons-paperclip'; //return item.itemTypeImageSrc['attachment'];
}return 'glyphicons file';case 'artwork':return 'glyphicons glyphicons-picture';case 'audioRecording':return 'glyphicons glyphicons-microphone';case 'bill':return defaultIcon;case 'blogPost':return 'glyphicons glyphicons-blog';case 'book':return 'glyphicons glyphicons-book';case 'bookSection':return 'glyphicons glyphicons-book-open';case 'case':return defaultIcon;case 'computerProgram':return 'glyphicons glyphicons-floppy-disk';case 'conferencePaper':return defaultIcon;case 'dictionaryEntry':return 'glyphicons glyphicons-translate';case 'document':return 'glyphicons glyphicons-file';case 'email':return 'glyphicons glyphicons-envelope';case 'encyclopediaArticle':return 'glyphicons glyphicons-bookmark';case 'film':return 'glyphicons glyphicons-film';case 'forumPost':return 'glyphicons glyphicons-bullhorn';case 'hearing':return 'fa fa-gavel';case 'instantMessage':return 'fa fa-comment-o';case 'interview':return 'fa fa-comments-o';case 'journalArticle':return 'fa fa-file-text-o';case 'letter':return 'glyphicons glyphicons-message-full';case 'magazineArticle':return defaultIcon;case 'manuscript':return 'glyphicons glyphicons-pen';case 'map':return 'glyphicons glyphicons-google-maps';case 'newspaperArticle':return 'fa fa-newspaper-o';case 'note':return 'glyphicons glyphicons-notes noteyellow';case 'patent':return 'glyphicons glyphicons-lightbulb';case 'podcast':return 'glyphicons glyphicons-ipod';case 'presentation':return 'glyphicons glyphicons-keynote';case 'radioBroadcast':return 'glyphicons glyphicons-wifi-alt';case 'report':return 'glyphicons glyphicons-notes-2';case 'statue':return 'glyphicons glyphicons-bank';case 'thesis':return 'fa fa-graduation-cap';case 'tvBroadcast':return 'glyphicons glyphicons-display';case 'videoRecording':return 'glyphicons glyphicons-facetime-video';case 'webpage':return 'glyphicons glyphicons-embed-close';default:return 'glyphicons file';}};Item.prototype.get=function(key){var item=this;switch(key){case 'title':var title='';if(item.apiObj.data.itemType=='note'){return item.noteTitle(item.apiObj.data.note);}else {return item.apiObj.data.title;}if(title===''){return '[Untitled]';}return title;case 'creatorSummary':case 'creator':if(typeof item.apiObj.meta.creatorSummary!=='undefined'){return item.apiObj.meta.creatorSummary;}else {return '';}break;case 'year':if(item.parsedDate){return item.parsedDate.getFullYear();}else {return '';}}if(key in item.apiObj.data){return item.apiObj.data[key];}else if(key in item.apiObj.meta){return item.apiObj.meta[key];}else if(item.hasOwnProperty(key)){return item[key];}return null;};Item.prototype.set=function(key,val){var item=this;if(key in item.apiObj){item.apiObj[key]=val;}if(key in item.apiObj.data){item.apiObj.data[key]=val;}if(key in item.apiObj.meta){item.apiObj.meta[key]=val;}switch(key){case 'itemKey':case 'key':item.key=val;item.apiObj.data.key=val;break;case 'itemVersion':case 'version':item.version=val;item.apiObj.data.version=val;break;case 'itemType':item.itemType=val; //TODO: translate api object to new item type
break;case 'linkMode':break;case 'deleted':item.apiObj.data.deleted=val;break;case 'parentItem':if(val===''){val=false;}item.apiObj.data.parentItem=val;break;} //    item.synced = false;
return item;};Item.prototype.noteTitle=function(note){var len=120;var notetext=striptags(note);var firstNewline=notetext.indexOf('\n');if(firstNewline!=-1&&firstNewline<len){return notetext.substr(0,firstNewline);}else {return notetext.substr(0,len);}};Item.prototype.setParent=function(parentItemKey){var item=this; //pull out itemKey string if we were passed an item object
if(typeof parentItemKey!='string'&&parentItemKey.hasOwnProperty('instance')&&parentItemKey.instance=='Zotero.Item'){parentItemKey=parentItemKey.key;}item.set('parentItem',parentItemKey);return item;};Item.prototype.addToCollection=function(collectionKey){var item=this; //take out the collection key if we're passed a collection object instead
if(typeof collectionKey!='string'){if(collectionKey.instance=='Zotero.Collection'){collectionKey=collectionKey.key;}}if(item.apiObj.data.collections.indexOf(collectionKey)===-1){item.apiObj.data.collections.push(collectionKey);}return;};Item.prototype.removeFromCollection=function(collectionKey){var item=this; //take out the collection key if we're passed a collection object instead
if(typeof collectionKey!='string'){if(collectionKey.instance=='Zotero.Collection'){collectionKey=collectionKey.key;}}var index=item.apiObj.data.collections.indexOf(collectionKey);if(index!=-1){item.apiObj.data.collections.splice(index,1);}return;};Item.prototype.uploadChildAttachment=function(childItem,fileInfo,progressCallback){ /*
  * write child item so that it exists
  * get upload authorization for actual file
  * perform full upload
  */var item=this;Z.debug('uploadChildAttachment',3);if(!item.owningLibrary){return Promise.reject(new Error('Item must be associated with a library'));} //make sure childItem has parent set
childItem.set('parentItem',item.key);childItem.associateWithLibrary(item.owningLibrary);return childItem.writeItem().then(function(response){ //successful attachmentItemWrite
item.numChildren++;return childItem.uploadFile(fileInfo,progressCallback);},function(response){ //failure during attachmentItem write
throw {'message':'Failure during attachmentItem write.','code':response.status,'serverMessage':response.jqxhr.responseText,'response':response};});};Item.prototype.uploadFile=function(fileInfo,progressCallback){var item=this;Z.debug('Zotero.Item.uploadFile',3);var uploadAuthFileData={md5:fileInfo.md5,filename:item.get('title'),filesize:fileInfo.filesize,mtime:fileInfo.mtime,contentType:fileInfo.contentType,params:1};if(fileInfo.contentType===''){uploadAuthFileData.contentType='application/octet-stream';}return item.getUploadAuthorization(uploadAuthFileData).then(function(response){Z.debug('uploadAuth callback',3);var upAuthOb;if(typeof response.data=='string'){upAuthOb=JSON.parse(response.data);}else {upAuthOb=response.data;}if(upAuthOb.exists==1){return {'message':'File Exists'};}else { //TODO: add progress
return Zotero.file.uploadFile(upAuthOb,fileInfo).then(function(){ //upload was successful: register it
return item.registerUpload(upAuthOb.uploadKey).then(function(response){if(response.isError){var e={'message':'Failed to register uploaded file.','code':response.status,'serverMessage':response.jqxhr.responseText,'response':response};Z.error(e);throw e;}else {return {'message':'Upload Successful'};}});});}}).catch(function(response){Z.debug('Failure caught during upload',3);Z.debug(response,3);throw {'message':'Failure during upload.','code':response.status,'serverMessage':response.jqxhr.responseText,'response':response};});};Item.prototype.cslItem=function(){var zoteroItem=this; // don't return URL or accessed information for journal articles if a
// pages field exists
var itemType=zoteroItem.get('itemType'); //Zotero_ItemTypes::getName($zoteroItem->itemTypeID);
var cslType=zoteroItem.cslTypeMap.hasOwnProperty(itemType)?zoteroItem.cslTypeMap[itemType]:false;if(!cslType)cslType='article';var ignoreURL=(zoteroItem.get('accessDate')||zoteroItem.get('url'))&&itemType in {'journalArticle':1,'newspaperArticle':1,'magazineArticle':1}&&zoteroItem.get('pages')&&zoteroItem.citePaperJournalArticleURL;var cslItem={'type':cslType};if(zoteroItem.owningLibrary){cslItem['id']=zoteroItem.apiObj.library.id+'/'+zoteroItem.get('key');}else {cslItem['id']=Zotero.utils.getKey();} // get all text variables (there must be a better way)
// TODO: does citeproc-js permit short forms?
Object.keys(zoteroItem.cslFieldMap).forEach(function(variable){var fields=zoteroItem.cslFieldMap[variable];if(variable=='URL'&&ignoreURL)return;fields.forEach(function(field){var value=zoteroItem.get(field);if(value){ //TODO: strip enclosing quotes? necessary when not pulling from DB?
cslItem[variable]=value;}});}); // separate name variables
var creators=zoteroItem.get('creators');creators.forEach(function(creator){var creatorType=creator['creatorType']; // isset(self::$zoteroNameMap[$creatorType]) ? self::$zoteroNameMap[$creatorType] : false;
if(!creatorType)return;var nameObj;if(creator.hasOwnProperty('name')){nameObj={'literal':creator['name']};}else {nameObj={'family':creator['lastName'],'given':creator['firstName']};}if(cslItem.hasOwnProperty(creatorType)){cslItem[creatorType].push(nameObj);}else {cslItem[creatorType]=[nameObj];}}); // get date variables
Object.keys(zoteroItem.cslDateMap).forEach(function(key){var val=zoteroItem.cslDateMap[key];var date=zoteroItem.get(val);if(date){cslItem[key]={'raw':date};}});return cslItem;};Object.keys(ItemMaps).forEach(function(key){Item.prototype[key]=ItemMaps[key];});module.exports=Item;},{"./ItemMaps.js":111,"striptags":94}],111:[function(require,module,exports){'use strict';var ItemMaps={};ItemMaps.fieldMap={'itemType':'Item Type','title':'Title','dateAdded':'Date Added','dateModified':'Date Modified','source':'Source','notes':'Notes','tags':'Tags','attachments':'Attachments','related':'Related','url':'URL','rights':'Rights','series':'Series','volume':'Volume','issue':'Issue','edition':'Edition','place':'Place','publisher':'Publisher','pages':'Pages','ISBN':'ISBN','publicationTitle':'Publication','ISSN':'ISSN','date':'Date','year':'Year','section':'Section','callNumber':'Call Number','archive':'Archive','archiveLocation':'Loc. in Archive','libraryCatalog':'Library Catalog','distributor':'Distributor','extra':'Extra','journalAbbreviation':'Journal Abbr','DOI':'DOI','accessDate':'Accessed','seriesTitle':'Series Title','seriesText':'Series Text','seriesNumber':'Series Number','institution':'Institution','reportType':'Report Type','code':'Code','session':'Session','legislativeBody':'Legislative Body','history':'History','reporter':'Reporter','court':'Court','numberOfVolumes':'# of Volumes','committee':'Committee','assignee':'Assignee','patentNumber':'Patent Number','priorityNumbers':'Priority Numbers','issueDate':'Issue Date','references':'References','legalStatus':'Legal Status','codeNumber':'Code Number','artworkMedium':'Medium','number':'Number','artworkSize':'Artwork Size','repository':'Repository','videoRecordingType':'Recording Type','interviewMedium':'Medium','letterType':'Type','manuscriptType':'Type','mapType':'Type','scale':'Scale','thesisType':'Type','websiteType':'Website Type','audioRecordingType':'Recording Type','label':'Label','presentationType':'Type','meetingName':'Meeting Name','studio':'Studio','runningTime':'Running Time','network':'Network','postType':'Post Type','audioFileType':'File Type','versionNumber':'Version Number','system':'System','company':'Company','conferenceName':'Conference Name','encyclopediaTitle':'Encyclopedia Title','dictionaryTitle':'Dictionary Title','language':'Language','programmingLanguage':'Language','university':'University','abstractNote':'Abstract','websiteTitle':'Website Title','reportNumber':'Report Number','billNumber':'Bill Number','codeVolume':'Code Volume','codePages':'Code Pages','dateDecided':'Date Decided','reporterVolume':'Reporter Volume','firstPage':'First Page','documentNumber':'Document Number','dateEnacted':'Date Enacted','publicLawNumber':'Public Law Number','country':'Country','applicationNumber':'Application Number','forumTitle':'Forum/Listserv Title','episodeNumber':'Episode Number','blogTitle':'Blog Title','caseName':'Case Name','nameOfAct':'Name of Act','subject':'Subject','proceedingsTitle':'Proceedings Title','bookTitle':'Book Title','shortTitle':'Short Title','docketNumber':'Docket Number','numPages':'# of Pages','note':'Note','numChildren':'# of Children','addedBy':'Added By','creator':'Creator'};ItemMaps.typeMap={'note':'Note','attachment':'Attachment','book':'Book','bookSection':'Book Section','journalArticle':'Journal Article','magazineArticle':'Magazine Article','newspaperArticle':'Newspaper Article','thesis':'Thesis','letter':'Letter','manuscript':'Manuscript','interview':'Interview','film':'Film','artwork':'Artwork','webpage':'Web Page','report':'Report','bill':'Bill','case':'Case','hearing':'Hearing','patent':'Patent','statute':'Statute','email':'E-mail','map':'Map','blogPost':'Blog Post','instantMessage':'Instant Message','forumPost':'Forum Post','audioRecording':'Audio Recording','presentation':'Presentation','videoRecording':'Video Recording','tvBroadcast':'TV Broadcast','radioBroadcast':'Radio Broadcast','podcast':'Podcast','computerProgram':'Computer Program','conferencePaper':'Conference Paper','document':'Document','encyclopediaArticle':'Encyclopedia Article','dictionaryEntry':'Dictionary Entry'};ItemMaps.creatorMap={'author':'Author','contributor':'Contributor','editor':'Editor','translator':'Translator','seriesEditor':'Series Editor','interviewee':'Interview With','interviewer':'Interviewer','director':'Director','scriptwriter':'Scriptwriter','producer':'Producer','castMember':'Cast Member','sponsor':'Sponsor','counsel':'Counsel','inventor':'Inventor','attorneyAgent':'Attorney/Agent','recipient':'Recipient','performer':'Performer','composer':'Composer','wordsBy':'Words By','cartographer':'Cartographer','programmer':'Programmer','reviewedAuthor':'Reviewed Author','artist':'Artist','commenter':'Commenter','presenter':'Presenter','guest':'Guest','podcaster':'Podcaster'};ItemMaps.hideFields=['mimeType','linkMode','charset','md5','mtime','version','key','collections','relations','parentItem','contentType','filename','tags'];ItemMaps.noEditFields=['accessDate','modified','filename','dateAdded','dateModified'];ItemMaps.itemTypeImageSrc={'note':'note','attachment':'attachment-pdf','attachmentPdf':'attachment-pdf','attachmentWeblink':'attachment-web-link','attachmentSnapshot':'attachment-snapshot','attachmentFile':'attachment-file','attachmentLink':'attachment-link','book':'book','bookSection':'book_open','journalArticle':'page_white_text','magazineArticle':'layout','newspaperArticle':'newspaper','thesis':'report','letter':'email_open','manuscript':'script','interview':'comments','film':'film','artwork':'picture','webpage':'page','report':'report','bill':'page_white','case':'page_white','hearing':'page_white','patent':'page_white','statute':'page_white','email':'email','map':'map','blogPost':'layout','instantMessage':'page_white','forumPost':'page','audioRecording':'ipod','presentation':'page_white','videoRecording':'film','tvBroadcast':'television','radioBroadcast':'transmit','podcast':'ipod_cast','computerProgram':'page_white_code','conferencePaper':'treeitem-conferencePaper','document':'page_white','encyclopediaArticle':'page_white','dictionaryEntry':'page_white'};ItemMaps.cslNameMap={'author':'author','editor':'editor','bookAuthor':'container-author','composer':'composer','interviewer':'interviewer','recipient':'recipient','seriesEditor':'collection-editor','translator':'translator'};ItemMaps.cslFieldMap={'title':['title'],'container-title':['publicationTitle','reporter','code'], /* reporter and code should move to SQL mapping tables */'collection-title':['seriesTitle','series'],'collection-number':['seriesNumber'],'publisher':['publisher','distributor'], /* distributor should move to SQL mapping tables */'publisher-place':['place'],'authority':['court'],'page':['pages'],'volume':['volume'],'issue':['issue'],'number-of-volumes':['numberOfVolumes'],'number-of-pages':['numPages'],'edition':['edition'],'versionNumber':['version'],'section':['section'],'genre':['type','artworkSize'], /* artworkSize should move to SQL mapping tables, or added as a CSL variable */'medium':['medium','system'],'archive':['archive'],'archive_location':['archiveLocation'],'event':['meetingName','conferenceName'], /* these should be mapped to the same base field in SQL mapping tables */'event-place':['place'],'abstract':['abstractNote'],'URL':['url'],'DOI':['DOI'],'ISBN':['ISBN'],'call-number':['callNumber'],'note':['extra'],'number':['number'],'references':['history'],'shortTitle':['shortTitle'],'journalAbbreviation':['journalAbbreviation'],'language':['language']};ItemMaps.cslDateMap={'issued':'date','accessed':'accessDate'};ItemMaps.cslTypeMap={'book':'book','bookSection':'chapter','journalArticle':'article-journal','magazineArticle':'article-magazine','newspaperArticle':'article-newspaper','thesis':'thesis','encyclopediaArticle':'entry-encyclopedia','dictionaryEntry':'entry-dictionary','conferencePaper':'paper-conference','letter':'personal_communication','manuscript':'manuscript','interview':'interview','film':'motion_picture','artwork':'graphic','webpage':'webpage','report':'report','bill':'bill','case':'legal_case','hearing':'bill', // ??
'patent':'patent','statute':'bill', // ??
'email':'personal_communication','map':'map','blogPost':'webpage','instantMessage':'personal_communication','forumPost':'webpage','audioRecording':'song', // ??
'presentation':'speech','videoRecording':'motion_picture','tvBroadcast':'broadcast','radioBroadcast':'broadcast','podcast':'song', // ??
'computerProgram':'book' // ??
};ItemMaps.citePaperJournalArticleURL=false;module.exports=ItemMaps;},{}],112:[function(require,module,exports){'use strict';module.exports=function(jsonBody){this.instance='Zotero.Items'; //represent items as array for ordering purposes
this.itemsVersion=0;this.syncState={earliestVersion:null,latestVersion:null};this.itemObjects={};this.objectMap=this.itemObjects;this.objectArray=[];this.unsyncedItemKeys=[];if(jsonBody){this.addItemsFromJson(jsonBody);}};module.exports.prototype=new Zotero.Container();module.exports.prototype.getItem=function(key){return this.getObject(key);};module.exports.prototype.getItems=function(keys){return this.getObjects(keys);};module.exports.prototype.addItem=function(item){this.addObject(item);return this;};module.exports.prototype.addItemsFromJson=function(jsonBody){Z.debug('addItemsFromJson',3);var items=this;var parsedItemJson=jsonBody;var itemsAdded=[];Z.debug('looping');parsedItemJson.forEach(function(itemObj){Z.debug('creating new Item');var item=new Zotero.Item(itemObj);items.addItem(item);itemsAdded.push(item);});return itemsAdded;}; //Remove item from local set if it has been marked as deleted by the server
module.exports.prototype.removeLocalItem=function(key){return this.removeObject(key);};module.exports.prototype.removeLocalItems=function(keys){return this.removeObjects(keys);};module.exports.prototype.deleteItem=function(itemKey){Z.debug('Zotero.Items.deleteItem',3);var items=this;var item;if(!itemKey)return false;itemKey=items.extractKey(itemKey);item=items.getItem(itemKey);var urlconfig={'target':'item','libraryType':items.owningLibrary.libraryType,'libraryID':items.owningLibrary.libraryID,'itemKey':item.key};var requestConfig={url:Zotero.ajax.apiRequestString(urlconfig),type:'DELETE',headers:{'If-Unmodified-Since-Version':item.get('version')}};return Zotero.net.ajaxRequest(requestConfig);};module.exports.prototype.deleteItems=function(deleteItems,version){ //TODO: split into multiple requests if necessary
Z.debug('Zotero.Items.deleteItems',3);var items=this;var deleteKeys=[];var i;if(!version&&items.itemsVersion!==0){version=items.itemsVersion;} //make sure we're working with item keys, not items
var key;for(i=0;i<deleteItems.length;i++){if(!deleteItems[i])continue;key=items.extractKey(deleteItems[i]);if(key){deleteKeys.push(key);}} //split keys into chunks of 50 per request
var deleteChunks=items.chunkObjectsArray(deleteKeys); /*
 var successCallback = function(response){
 	var deleteProgress = index / deleteChunks.length;
 	Zotero.trigger("deleteProgress", {'progress': deleteProgress});
 	return response;
 };
 */var requestObjects=[];for(i=0;i<deleteChunks.length;i++){var deleteKeysString=deleteChunks[i].join(',');var urlconfig={'target':'items','libraryType':items.owningLibrary.libraryType,'libraryID':items.owningLibrary.libraryID,'itemKey':deleteKeysString}; //headers['If-Unmodified-Since-Version'] = version;
var requestConfig={url:urlconfig,type:'DELETE'};requestObjects.push(requestConfig);}return Zotero.net.queueRequest(requestObjects);};module.exports.prototype.trashItems=function(itemsArray){var items=this;var i;for(i=0;i<itemsArray.length;i++){var item=itemsArray[i];item.set('deleted',1);}return items.writeItems(itemsArray);};module.exports.prototype.untrashItems=function(itemsArray){var items=this;var i;for(i=0;i<itemsArray.length;i++){var item=itemsArray[i];item.set('deleted',0);}return items.writeItems(itemsArray);};module.exports.prototype.findItems=function(config){var items=this;var matchingItems=[];Object.keys(items.itemObjects).forEach(function(key){var item=item.itemObjects[key];if(config.collectionKey&&item.apiObj.collections.indexOf(config.collectionKey)===-1){return;}matchingItems.push(items.itemObjects[key]);});return matchingItems;}; //take an array of items and extract children into their own items
//for writing
module.exports.prototype.atomizeItems=function(itemsArray){ //process the array of items, pulling out child notes/attachments to write
//separately with correct parentItem set and assign generated itemKeys to
//new items
var writeItems=[];var item;for(var i=0;i<itemsArray.length;i++){item=itemsArray[i]; //generate an itemKey if the item does not already have one
var itemKey=item.get('key');if(itemKey===''||itemKey===null){var newItemKey=Zotero.utils.getKey();item.set('key',newItemKey);item.set('version',0);} //items that already have item key always in first pass, as are their children
writeItems.push(item);if(item.hasOwnProperty('notes')&&item.notes.length>0){for(var j=0;j<item.notes.length;j++){item.notes[j].set('parentItem',item.get('key'));}writeItems=writeItems.concat(item.notes);}if(item.hasOwnProperty('attachments')&&item.attachments.length>0){for(var k=0;k<item.attachments.length;k++){item.attachments[k].set('parentItem',item.get('key'));}writeItems=writeItems.concat(item.attachments);}}return writeItems;}; //accept an array of 'Zotero.Item's
module.exports.prototype.writeItems=function(itemsArray){var items=this;var library=items.owningLibrary;var i;var writeItems=items.atomizeItems(itemsArray);var config={'target':'items','libraryType':items.owningLibrary.libraryType,'libraryID':items.owningLibrary.libraryID};var requestUrl=Zotero.ajax.apiRequestString(config);var writeChunks=items.chunkObjectsArray(writeItems);var rawChunkObjects=items.rawChunks(writeChunks); //update item with server response if successful
var writeItemsSuccessCallback=function writeItemsSuccessCallback(response){Z.debug('writeItem successCallback',3);items.updateObjectsFromWriteResponse(this.writeChunk,response); //save updated items to IDB
if(Zotero.config.useIndexedDB){this.library.idbLibrary.updateItems(this.writeChunk);}Zotero.trigger('itemsChanged',{library:this.library});response.returnItems=this.writeChunk;return response;};Z.debug('items.itemsVersion: '+items.itemsVersion,3);Z.debug('items.libraryVersion: '+items.libraryVersion,3);var requestObjects=[];for(i=0;i<writeChunks.length;i++){var successContext={writeChunk:writeChunks[i],library:library};var requestData=JSON.stringify(rawChunkObjects[i]);requestObjects.push({url:requestUrl,type:'POST',data:requestData,processData:false,success:writeItemsSuccessCallback.bind(successContext)});}return library.sequentialRequests(requestObjects).then(function(responses){Z.debug('Done with writeItems sequentialRequests promise',3);return responses;});};},{}],113:[function(require,module,exports){'use strict'; /**
 * A user or group Zotero library. This is generally the top level object
 * through which interactions should happen. It houses containers for
 * Zotero API objects (collections, items, etc) and handles making requests
 * with particular API credentials, as well as storing data locally.
 * @param {string} type                 type of library, 'user' or 'group'
 * @param {int} libraryID            ID of the library
 * @param {string} libraryUrlIdentifier identifier used in urls, could be library id or user/group slug
 * @param {string} apiKey               key to use for API requests
 */var Library=function Library(type,libraryID,libraryUrlIdentifier,apiKey){Z.debug('Zotero.Library constructor',3);Z.debug('Library Constructor: '+type+' '+libraryID+' ',3);var library=this;Z.debug(libraryUrlIdentifier,4);library.instance='Zotero.Library';library.libraryVersion=0;library.syncState={earliestVersion:null,latestVersion:null};library._apiKey=apiKey||'';if(Zotero.config.librarySettings){library.libraryBaseWebsiteUrl=Zotero.config.librarySettings.libraryPathString;}else {library.libraryBaseWebsiteUrl=Zotero.config.baseWebsiteUrl;if(type=='group'){library.libraryBaseWebsiteUrl+='groups/';}if(libraryUrlIdentifier){this.libraryBaseWebsiteUrl+=libraryUrlIdentifier+'/items';}else {Z.warn('no libraryUrlIdentifier specified');}} //object holders within this library, whether tied to a specific library or not
library.items=new Zotero.Items();library.items.owningLibrary=library;library.itemKeys=[];library.collections=new Zotero.Collections();library.collections.libraryUrlIdentifier=library.libraryUrlIdentifier;library.collections.owningLibrary=library;library.tags=new Zotero.Tags();library.searches=new Zotero.Searches();library.searches.owningLibrary=library;library.groups=new Zotero.Groups();library.groups.owningLibrary=library;library.deleted=new Zotero.Deleted();library.deleted.owningLibrary=library;if(!type){ //return early if library not specified
Z.warn('No type specified for library');return;} //attributes tying instance to a specific Zotero library
library.type=type;library.libraryType=type;library.libraryID=libraryID;library.libraryString=Zotero.utils.libraryString(library.libraryType,library.libraryID);library.libraryUrlIdentifier=libraryUrlIdentifier; //initialize preferences object
library.preferences=new Zotero.Preferences(Zotero.store,library.libraryString);if(typeof window==='undefined'){Zotero.config.useIndexedDB=false;Zotero.warn('Node detected; disabling indexedDB');}else { //initialize indexedDB if we're supposed to use it
//detect safari until they fix their shit
var is_chrome=navigator.userAgent.indexOf('Chrome')>-1;var is_explorer=navigator.userAgent.indexOf('MSIE')>-1;var is_firefox=navigator.userAgent.indexOf('Firefox')>-1;var is_safari=navigator.userAgent.indexOf('Safari')>-1;var is_opera=navigator.userAgent.toLowerCase().indexOf('op')>-1;if(is_chrome&&is_safari){is_safari=false;}if(is_chrome&&is_opera){is_chrome=false;}if(is_safari){Zotero.config.useIndexedDB=false;Zotero.warn('Safari detected; disabling indexedDB');}}if(Zotero.config.useIndexedDB===true){Z.debug('Library Constructor: indexedDB init',3);var idbLibrary=new Zotero.Idb.Library(library.libraryString);idbLibrary.owningLibrary=this;library.idbLibrary=idbLibrary;idbLibrary.init().then(function(){Z.debug('Library Constructor: idbInitD Done',3);if(Zotero.config.preloadCachedLibrary===true){Z.debug('Library Constructor: preloading cached library',3);var cacheLoadD=library.loadIndexedDBCache();cacheLoadD.then(function(){ //TODO: any stuff that needs to execute only after cache is loaded
//possibly fire new events to cause display to refresh after load
Z.debug('Library Constructor: Library.items.itemsVersion: '+library.items.itemsVersion,3);Z.debug('Library Constructor: Library.collections.collectionsVersion: '+library.collections.collectionsVersion,3);Z.debug('Library Constructor: Library.tags.tagsVersion: '+library.tags.tagsVersion,3);Z.debug('Library Constructor: Triggering cachedDataLoaded',3);library.trigger('cachedDataLoaded');},function(err){Z.error('Error loading cached library');Z.error(err);throw new Error('Error loading cached library');});}else { //trigger cachedDataLoaded since we are done with that step
library.trigger('cachedDataLoaded');}},function(){ //can't use indexedDB. Set to false in config and trigger error to notify user
Zotero.config.useIndexedDB=false;library.trigger('indexedDBError');library.trigger('cachedDataLoaded');Z.error('Error initializing indexedDB. Promise rejected.'); //don't re-throw error, since we can still load data from the API
});}library.dirty=false; //set noop data-change callbacks
library.tagsChanged=function(){};library.collectionsChanged=function(){};library.itemsChanged=function(){};}; /**
 * Items columns for which sorting is supported
 * @type {Array}
 */Library.prototype.sortableColumns=['title','creator','itemType','date','year','publisher','publicationTitle','journalAbbreviation','language','accessDate','libraryCatalog','callNumber','rights','dateAdded','dateModified', /*'numChildren',*/'addedBy' /*'modifiedBy'*/]; /**
 * Columns that can be displayed in an items table UI
 * @type {Array}
 */Library.prototype.displayableColumns=['title','creator','itemType','date','year','publisher','publicationTitle','journalAbbreviation','language','accessDate','libraryCatalog','callNumber','rights','dateAdded','dateModified','numChildren','addedBy' /*'modifiedBy'*/]; /**
 * Items columns that only apply to group libraries
 * @type {Array}
 */Library.prototype.groupOnlyColumns=['addedBy' /*'modifiedBy'*/]; /**
 * Sort function that converts strings to locale lower case before comparing,
 * however this is still not particularly effective at getting correct localized
 * sorting in modern browsers due to browser implementations being poor. What we
 * really want here is to strip diacritics first.
 * @param  {string} a [description]
 * @param  {string} b [description]
 * @return {int}   [description]
 */Library.prototype.comparer=function(){if(Intl){return new Intl.Collator().compare;}else {return function(a,b){if(a.toLocaleLowerCase()==b.toLocaleLowerCase()){return 0;}if(a.toLocaleLowerCase()<b.toLocaleLowerCase()){return -1;}return 1;};}}; //Zotero library wrapper around jQuery ajax that returns a jQuery promise
//@url String url to request or object for input to apiRequestUrl and query string
//@type request method
//@options jquery options that are not the default for Zotero requests
Library.prototype.ajaxRequest=function(url,type,options){Z.debug('Library.ajaxRequest',3);if(!type){type='GET';}if(!options){options={};}var requestObject={url:url,type:type};requestObject=Z.extend({},requestObject,options);Z.debug(requestObject,3);return Zotero.net.queueRequest(requestObject);}; //Take an array of objects that specify Zotero API requests and perform them
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
 */Library.prototype.sequentialRequests=function(requests){Z.debug('Zotero.Library.sequentialRequests',3);var library=this;return Zotero.net.queueRequest(requests);}; /**
 * Generate a website url based on a dictionary of variables and the configured
 * libraryBaseWebsiteUrl
 * @param  {Object} urlvars Dictionary of key/value variables
 * @return {string}         website url
 */Library.prototype.websiteUrl=function(urlvars){Z.debug('Zotero.library.websiteUrl',3);Z.debug(urlvars,4);var library=this;var urlVarsArray=[];Object.keys(urlvars).forEach(function(key){var value=urlvars[key];if(value==='')return;urlVarsArray.push(key+'/'+value);});urlVarsArray.sort();Z.debug(urlVarsArray,4);var pathVarsString=urlVarsArray.join('/');return library.libraryBaseWebsiteUrl+'/'+pathVarsString;};Library.prototype.synchronize=function(){ //get updated group metadata if applicable
//  (this is an individual library method, so only necessary if this is
//  a group library and we want to keep info about it)
//sync library data
//  get updated collections versions newer than current library version
//  get updated searches versions newer than current library version
//  get updated item versions newer than current library version
//
}; /**
 * Make and process API requests to update the local library items based on the
 * versions we have locally. When the promise is resolved, we should have up to
 * date items in this library's items container, as well as saved to indexedDB
 * if configured to use it.
 * @return {Promise} Promise
 */Library.prototype.loadUpdatedItems=function(){Z.debug('Zotero.Library.loadUpdatedItems',3);var library=this; //sync from the libraryVersion if it exists, otherwise use the itemsVersion, which is likely
//derived from the most recent version of any individual item we have.
var syncFromVersion=library.libraryVersion?library.libraryVersion:library.items.itemsVersion;return Promise.resolve(library.updatedVersions('items',syncFromVersion)).then(function(response){Z.debug('itemVersions resolved',3);Z.debug('items Last-Modified-Version: '+response.lastModifiedVersion,3);library.items.updateSyncState(response.lastModifiedVersion);var itemVersions=response.data;library.itemVersions=itemVersions;var itemKeys=[];Object.keys(itemVersions).forEach(function(key){var val=itemVersions[key];var item=library.items.getItem(key);if(!item||item.apiObj.key!=val){itemKeys.push(key);}});return library.loadItemsFromKeys(itemKeys);}).then(function(responses){Z.debug('loadItemsFromKeys resolved',3);library.items.updateSyncedVersion(); //TODO: library needs its own state
var displayParams=Zotero.state.getUrlVars();library.buildItemDisplayView(displayParams); //save updated items to IDB
if(Zotero.config.useIndexedDB){var saveItemsD=library.idbLibrary.updateItems(library.items.objectArray);}});};Library.prototype.loadUpdatedCollections=function(){Z.debug('Zotero.Library.loadUpdatedCollections',3);var library=this; //sync from the libraryVersion if it exists, otherwise use the collectionsVersion, which is likely
//derived from the most recent version of any individual collection we have.
Z.debug('library.collections.collectionsVersion:'+library.collections.collectionsVersion);var syncFromVersion=library.libraryVersion?library.libraryVersion:library.collections.collectionsVersion; //we need modified collectionKeys regardless, so load them
return library.updatedVersions('collections',syncFromVersion).then(function(response){Z.debug('collectionVersions finished',3);Z.debug('Collections Last-Modified-Version: '+response.lastModifiedVersion,3); //start the syncState version tracking. This should be the earliest version throughout
library.collections.updateSyncState(response.lastModifiedVersion);var collectionVersions=response.data;library.collectionVersions=collectionVersions;var collectionKeys=[];Object.keys(collectionVersions).forEach(function(key){var val=collectionVersions[key];var c=library.collections.getCollection(key);if(!c||c.apiObj.version!=val){collectionKeys.push(key);}});if(collectionKeys.length===0){Z.debug('No collectionKeys need updating. resolving',3);return response;}else {Z.debug('fetching collections by key',3);return library.loadCollectionsFromKeys(collectionKeys).then(function(){var collections=library.collections;collections.initSecondaryData();Z.debug('All updated collections loaded',3);library.collections.updateSyncedVersion(); //TODO: library needs its own state
var displayParams=Zotero.state.getUrlVars(); //save updated collections to cache
Z.debug('loadUpdatedCollections complete - saving collections to cache before resolving',3);Z.debug('collectionsVersion: '+library.collections.collectionsVersion,3); //library.saveCachedCollections();
//save updated collections to IDB
if(Zotero.config.useIndexedDB){return library.idbLibrary.updateCollections(collections.collectionsArray);}});}}).then(function(){Z.debug('done getting collection data. requesting deleted data',3);return library.getDeleted(library.libraryVersion);}).then(function(response){Z.debug('got deleted collections data: removing local copies',3);Z.debug(library.deleted);if(library.deleted.deletedData.collections&&library.deleted.deletedData.collections.length>0){library.collections.removeLocalCollections(library.deleted.deletedData.collections);}});};Library.prototype.loadUpdatedTags=function(){Z.debug('Zotero.Library.loadUpdatedTags',3);var library=this;Z.debug('tagsVersion: '+library.tags.tagsVersion,3);return Promise.resolve(library.loadAllTags({since:library.tags.tagsVersion})).then(function(){Z.debug('done getting tags, request deleted tags data',3);return library.getDeleted(library.libraryVersion);}).then(function(response){Z.debug('got deleted tags data');if(library.deleted.deletedData.tags&&library.deleted.deletedData.tags.length>0){library.tags.removeTags(library.deleted.deletedData.tags);} //save updated tags to IDB
if(Zotero.config.useIndexedDB){Z.debug('saving updated tags to IDB',3);var saveTagsD=library.idbLibrary.updateTags(library.tags.tagsArray);}});};Library.prototype.getDeleted=function(version){Z.debug('Zotero.Library.getDeleted',3);var library=this;var urlconf={target:'deleted',libraryType:library.libraryType,libraryID:library.libraryID,since:version}; //if there is already a request working, create a new promise to resolve
//when the actual request finishes
if(library.deleted.pending){Z.debug('getDeleted resolving with previously pending promise');return Promise.resolve(library.deleted.pendingPromise);} //don't fetch again if version we'd be requesting is between
//deleted.newer and delete.deleted versions, just use that one
Z.debug('version:'+version);Z.debug('sinceVersion:'+library.deleted.sinceVersion);Z.debug('untilVersion:'+library.deleted.untilVersion);if(library.deleted.untilVersion&&version>=library.deleted.sinceVersion /*&&
                                                                             version < library.deleted.untilVersion*/){Z.debug('deletedVersion matches requested: immediately resolving');return Promise.resolve(library.deleted.deletedData);}library.deleted.pending=true;library.deleted.pendingPromise=library.ajaxRequest(urlconf).then(function(response){Z.debug('got deleted response');library.deleted.deletedData=response.data;Z.debug('Deleted Last-Modified-Version:'+response.lastModifiedVersion,3);library.deleted.untilVersion=response.lastModifiedVersion;library.deleted.sinceVersion=version;}).then(function(response){Z.debug('cleaning up deleted pending');library.deleted.pending=false;library.deleted.pendingPromise=false;});return library.deleted.pendingPromise;};Library.prototype.processDeletions=function(deletions){var library=this; //process deleted collections
library.collections.processDeletions(deletions.collections); //process deleted items
library.items.processDeletions(deletions.items);}; //Get a full bibliography from the API for web based citating
Library.prototype.loadFullBib=function(itemKeys,style){var library=this;var itemKeyString=itemKeys.join(',');var urlconfig={'target':'items','libraryType':library.libraryType,'libraryID':library.libraryID,'itemKey':itemKeyString,'format':'bib','linkwrap':'1'};if(itemKeys.length==1){urlconfig.target='item';}if(style){urlconfig['style']=style;}var loadBibPromise=library.ajaxRequest(urlconfig).then(function(response){return response.data;});return loadBibPromise;}; //load bib for a single item from the API
Library.prototype.loadItemBib=function(itemKey,style){Z.debug('Zotero.Library.loadItemBib',3);var library=this;var urlconfig={'target':'item','libraryType':library.libraryType,'libraryID':library.libraryID,'itemKey':itemKey,'content':'bib'};if(style){urlconfig['style']=style;}var itemBibPromise=library.ajaxRequest(urlconfig).then(function(response){var item=new Zotero.Item(response.data);var bibContent=item.apiObj.bib;return bibContent;});return itemBibPromise;}; //load library settings from Zotero API and return a promise that gets resolved with
//the Zotero.Preferences object for this library
Library.prototype.loadSettings=function(){Z.debug('Zotero.Library.loadSettings',3);var library=this;var urlconfig={'target':'settings','libraryType':library.libraryType,'libraryID':library.libraryID};return library.ajaxRequest(urlconfig).then(function(response){var resultObject;if(typeof response.data=='string'){resultObject=JSON.parse(response.data);}else {resultObject=response.data;} //save the full settings object so we have it available if we need to write,
//even if it has settings we don't use or know about
library.preferences.setPref('settings',resultObject); //pull out the settings we know we care about so we can query them directly
if(resultObject.tagColors){var tagColors=resultObject.tagColors.value;library.preferences.setPref('tagColors',tagColors); /*
   for(var i = 0; i < tagColors.length; i++){
   	var t = library.tags.getTag(tagColors[i].name);
   	if(t){
   		t.color = tagColors[i].color;
   	}
   }
   */}library.trigger('settingsLoaded');return library.preferences;});}; //take an array of tags and return subset of tags that should be colored, along with
//the colors they should be
Library.prototype.matchColoredTags=function(tags){var library=this;var i;var tagColorsSettings=library.preferences.getPref('tagColors');if(!tagColorsSettings)return [];var tagColorsMap={};for(i=0;i<tagColorsSettings.length;i++){tagColorsMap[tagColorsSettings[i].name.toLowerCase()]=tagColorsSettings[i].color;}var resultTags=[];for(i=0;i<tags.length;i++){if(tagColorsMap.hasOwnProperty(tags[i])){resultTags.push(tagColorsMap[tags[i]]);}}return resultTags;}; /**
 * Duplicate existing Items from this library and save to foreignLibrary
 * with relationships indicating the ties. At time of writing, Zotero client
 * saves the relationship with either the destination group of two group
 * libraries or the personal library.
 * @param  {Zotero.Item[]} items
 * @param  {Zotero.Library} foreignLibrary
 * @return {Promise.Zotero.Item[]} - newly created items
 */Library.prototype.sendToLibrary=function(items,foreignLibrary){var foreignItems=[];for(var i=0;i<items.length;i++){var item=items[i];var transferData=item.emptyJsonItem();transferData.data=Z.extend({},items[i].apiObj.data); //clear data that shouldn't be transferred:itemKey, collections
transferData.data.key='';transferData.data.version=0;transferData.data.collections=[];delete transferData.data.dateModified;delete transferData.data.dateAdded;var newForeignItem=new Zotero.Item(transferData);newForeignItem.pristine=Z.extend({},newForeignItem.apiObj);newForeignItem.initSecondaryData(); //set relationship to tie to old item
if(!newForeignItem.apiObj.data.relations){newForeignItem.apiObj.data.relations={};}newForeignItem.apiObj.data.relations['owl:sameAs']=Zotero.url.relationUrl(item.owningLibrary.libraryType,item.owningLibrary.libraryID,item.key);foreignItems.push(newForeignItem);}return foreignLibrary.items.writeItems(foreignItems);}; /*METHODS FOR WORKING WITH THE ENTIRE LIBRARY -- NOT FOR GENERAL USE */ //sync pull:
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
Library.prototype.updatedVersions=function(){var target=arguments.length<=0||arguments[0]===undefined?'items':arguments[0];var version=arguments.length<=1||arguments[1]===undefined?this.libraryVersion:arguments[1];Z.debug('Library.updatedVersions',3);var library=this;var urlconf={target:target,format:'versions',libraryType:library.libraryType,libraryID:library.libraryID,since:version};return library.ajaxRequest(urlconf);}; //Download and save information about every item in the library
//keys is an array of itemKeys from this library that we need to download
Library.prototype.loadItemsFromKeys=function(keys){Zotero.debug('Zotero.Library.loadItemsFromKeys',3);var library=this;return library.loadFromKeys(keys,'items');}; //keys is an array of collectionKeys from this library that we need to download
Library.prototype.loadCollectionsFromKeys=function(keys){Zotero.debug('Zotero.Library.loadCollectionsFromKeys',3);var library=this;return library.loadFromKeys(keys,'collections');}; //keys is an array of searchKeys from this library that we need to download
Library.prototype.loadSeachesFromKeys=function(keys){Zotero.debug('Zotero.Library.loadSearchesFromKeys',3);var library=this;return library.loadFromKeys(keys,'searches');};Library.prototype.loadFromKeys=function(keys,objectType){Zotero.debug('Zotero.Library.loadFromKeys',3);if(!objectType)objectType='items';var library=this;var keyslices=[];while(keys.length>0){keyslices.push(keys.splice(0,50));}var requestObjects=[];keyslices.forEach(function(keyslice){var keystring=keyslice.join(',');switch(objectType){case 'items':requestObjects.push({url:{'target':'items','targetModifier':null,'itemKey':keystring,'limit':50,'libraryType':library.libraryType,'libraryID':library.libraryID},type:'GET',success:library.processLoadedItems.bind(library)});break;case 'collections':requestObjects.push({url:{'target':'collections','targetModifier':null,'collectionKey':keystring,'limit':50,'libraryType':library.libraryType,'libraryID':library.libraryID},type:'GET',success:library.processLoadedCollections.bind(library)});break;case 'searches':requestObjects.push({url:{'target':'searches','targetModifier':null,'searchKey':keystring,'limit':50,'libraryType':library.libraryType,'libraryID':library.libraryID},type:'GET' //success: library.processLoadedSearches.bind(library)
});break;}});var promises=[];for(var i=0;i<requestObjects.length;i++){promises.push(Zotero.net.queueRequest(requestObjects[i]));}return Promise.all(promises); /*
 return Zotero.net.queueRequest(requestObjects);
 */}; //publishes: displayedItemsUpdated
//assume we have up to date information about items in indexeddb.
//build a list of indexedDB filter requests to then intersect to get final result
Library.prototype.buildItemDisplayView=function(params){Z.debug('Zotero.Library.buildItemDisplayView',3);Z.debug(params,4); //start with list of all items if we don't have collectionKey
//otherwise get the list of items in that collection
var library=this; //short-circuit if we don't have an initialized IDB yet
if(!library.idbLibrary.db){return Promise.resolve([]);}var filterPromises=[];if(params.collectionKey){if(params.collectionKey=='trash'){filterPromises.push(library.idbLibrary.filterItems('deleted',1));}else {filterPromises.push(library.idbLibrary.filterItems('collectionKeys',params.collectionKey));}}else {filterPromises.push(library.idbLibrary.getOrderedItemKeys('title'));} //filter by selected tags
var selectedTags=params.tag||[];if(typeof selectedTags=='string')selectedTags=[selectedTags];for(var i=0;i<selectedTags.length;i++){Z.debug('adding selected tag filter',3);filterPromises.push(library.idbLibrary.filterItems('itemTagStrings',selectedTags[i]));} //TODO: filter by search term.
//(need full text array or to decide what we're actually searching on to implement this locally)
//when all the filters have been applied, combine and sort
return Promise.all(filterPromises).then(function(results){var i;for(i=0;i<results.length;i++){Z.debug('result from filterPromise: '+results[i].length,3);Z.debug(results[i],3);}var finalItemKeys=library.idbLibrary.intersectAll(results);var itemsArray=library.items.getItems(finalItemKeys);Z.debug('All filters applied - Down to '+itemsArray.length+' items displayed',3);Z.debug('remove child items and, if not viewing trash, deleted items',3);var displayItemsArray=[];for(i=0;i<itemsArray.length;i++){if(itemsArray[i].apiObj.data.parentItem){continue;}if(params.collectionKey!='trash'&&itemsArray[i].apiObj.deleted){continue;}displayItemsArray.push(itemsArray[i]);} //sort displayedItemsArray by given or configured column
var orderCol=params['order']||'title';var sort=params['sort']||'asc';Z.debug('Sorting by '+orderCol+' - '+sort,3);var comparer=Zotero.Library.prototype.comparer();displayItemsArray.sort(function(a,b){var aval=a.get(orderCol);var bval=b.get(orderCol);return comparer(aval,bval);});if(sort=='desc'){Z.debug('sort is desc - reversing array',4);displayItemsArray.reverse();} //publish event signalling we're done
Z.debug('triggering publishing displayedItemsUpdated',3);library.trigger('displayedItemsUpdated');return displayItemsArray;});};Library.prototype.trigger=function(eventType,data){var library=this;Zotero.trigger(eventType,data,library.libraryString);};Library.prototype.listen=function(events,handler,data){var library=this;var filter=library.libraryString;Zotero.listen(events,handler,data,filter);}; //CollectionFunctions
Library.prototype.processLoadedCollections=function(response){Z.debug('processLoadedCollections',3);var library=this; //clear out display items
Z.debug('adding collections to library.collections');var collectionsAdded=library.collections.addCollectionsFromJson(response.data);for(var i=0;i<collectionsAdded.length;i++){collectionsAdded[i].associateWithLibrary(library);} //update sync state
library.collections.updateSyncState(response.lastModifiedVersion);Zotero.trigger('loadedCollectionsProcessed',{library:library,collectionsAdded:collectionsAdded});return response;}; //create+write a collection given a name and optional parentCollectionKey
Library.prototype.addCollection=function(name,parentCollection){Z.debug('Zotero.Library.addCollection',3);var library=this;var collection=new Zotero.Collection();collection.associateWithLibrary(library);collection.set('name',name);collection.set('parentCollection',parentCollection);return library.collections.writeCollections([collection]);}; //ItemFunctions
//make request for item keys and return jquery ajax promise
Library.prototype.fetchItemKeys=function(){var config=arguments.length<=0||arguments[0]===undefined?{}:arguments[0];Z.debug('Zotero.Library.fetchItemKeys',3);var library=this;var urlconfig=Z.extend(true,{'target':'items','libraryType':this.libraryType,'libraryID':this.libraryID,'format':'keys'},config);return library.ajaxRequest(urlconfig);}; //get keys of all items marked for deletion
Library.prototype.getTrashKeys=function(){Z.debug('Zotero.Library.getTrashKeys',3);var library=this;var urlconfig={'target':'items','libraryType':library.libraryType,'libraryID':library.libraryID,'format':'keys','collectionKey':'trash'};return library.ajaxRequest(urlconfig);};Library.prototype.emptyTrash=function(){Z.debug('Zotero.Library.emptyTrash',3);var library=this;return library.getTrashKeys().then(function(response){var trashedItemKeys=response.data.split('\n');return library.items.deleteItems(trashedItemKeys,response.lastModifiedVersion);});};Library.prototype.loadItemKeys=function(config){Z.debug('Zotero.Library.loadItemKeys',3);var library=this;return this.fetchItemKeys(config).then(function(response){Z.debug('loadItemKeys proxied callback',3);var keys=response.data.split(/[\s]+/);library.itemKeys=keys;});};Library.prototype.loadItems=function(config){Z.debug('Zotero.Library.loadItems',3);var library=this;if(!config){config={};}var defaultConfig={target:'items',targetModifier:'top',start:0,limit:25,order:Zotero.config.defaultSortColumn,sort:Zotero.config.defaultSortOrder}; //Build config object that should be displayed next and compare to currently displayed
var newConfig=Z.extend({},defaultConfig,config); //newConfig.start = parseInt(newConfig.limit, 10) * (parseInt(newConfig.itemPage, 10) - 1);
var urlconfig=Z.extend({'target':'items','libraryType':library.libraryType,'libraryID':library.libraryID},newConfig);var requestUrl=Zotero.ajax.apiRequestString(urlconfig);return library.ajaxRequest(requestUrl).then(function(response){Z.debug('loadItems proxied callback',3); //var library = this;
var items=library.items; //clear out display items
var loadedItemsArray=items.addItemsFromJson(response.data);Z.debug('Looping over loadedItemsArray');for(var i=0;i<loadedItemsArray.length;i++){loadedItemsArray[i].associateWithLibrary(library);}response.loadedItems=loadedItemsArray;Zotero.trigger('itemsChanged',{library:library});return response;});};Library.prototype.loadPublications=function(config){Z.debug('Zotero.Library.loadPublications',3);var library=this;if(!config){config={};}var defaultConfig={target:'publications',start:0,limit:50,order:Zotero.config.defaultSortColumn,sort:Zotero.config.defaultSortOrder,include:'bib'}; //Build config object that should be displayed next and compare to currently displayed
var newConfig=Z.extend({},defaultConfig,config);var urlconfig=Z.extend({'target':'publications','libraryType':library.libraryType,'libraryID':library.libraryID},newConfig);var requestUrl=Zotero.ajax.apiRequestString(urlconfig);return library.ajaxRequest(requestUrl).then(function(response){Z.debug('loadPublications proxied callback',3);var publicationItems=[];var parsedItemJson=response.data;parsedItemJson.forEach(function(itemObj){var item=new Zotero.Item(itemObj);publicationItems.push(item);});response.publicationItems=publicationItems;return response;});};Library.prototype.processLoadedItems=function(response){Z.debug('processLoadedItems',3);var library=this;var items=library.items; //clear out display items
var loadedItemsArray=items.addItemsFromJson(response.data);for(var i=0;i<loadedItemsArray.length;i++){loadedItemsArray[i].associateWithLibrary(library);} //update sync state
library.items.updateSyncState(response.lastModifiedVersion);Zotero.trigger('itemsChanged',{library:library,loadedItems:loadedItemsArray});return response;};Library.prototype.loadItem=function(itemKey){Z.debug('Zotero.Library.loadItem',3);var library=this;if(!config){var config={};}var urlconfig={'target':'item','libraryType':library.libraryType,'libraryID':library.libraryID,'itemKey':itemKey};return library.ajaxRequest(urlconfig).then(function(response){Z.debug('Got loadItem response');var item=new Zotero.Item(response.data);item.owningLibrary=library;library.items.itemObjects[item.key]=item;Zotero.trigger('itemsChanged',{library:library});return item;},function(response){Z.debug('Error loading Item');});};Library.prototype.trashItem=function(itemKey){var library=this;return library.items.trashItems([library.items.getItem(itemKey)]);};Library.prototype.untrashItem=function(itemKey){Z.debug('Zotero.Library.untrashItem',3);if(!itemKey)return false;var item=this.items.getItem(itemKey);item.apiObj.deleted=0;return item.writeItem();};Library.prototype.deleteItem=function(itemKey){Z.debug('Zotero.Library.deleteItem',3);var library=this;return library.items.deleteItem(itemKey);};Library.prototype.deleteItems=function(itemKeys){Z.debug('Zotero.Library.deleteItems',3);var library=this;return library.items.deleteItems(itemKeys);};Library.prototype.addNote=function(itemKey,note){Z.debug('Zotero.Library.prototype.addNote',3);var library=this;var config={'target':'children','libraryType':library.libraryType,'libraryID':library.libraryID,'itemKey':itemKey};var requestUrl=Zotero.ajax.apiRequestString(config);var item=this.items.getItem(itemKey);return library.ajaxRequest(requestUrl,'POST',{processData:false});};Library.prototype.fetchGlobalItems=function(config){Z.debug('Zotero.Library.fetchGlobalItems',3);var library=this;if(!config){config={};}var defaultConfig={target:'items',start:0,limit:25}; //Build config object that should be displayed next and compare to currently displayed
var newConfig=Z.extend({},defaultConfig,config); //newConfig.start = parseInt(newConfig.limit, 10) * (parseInt(newConfig.itemPage, 10) - 1);
var urlconfig=Z.extend({'target':'items','libraryType':''},newConfig);var requestUrl=Zotero.ajax.apiRequestString(urlconfig);return library.ajaxRequest(requestUrl,'GET',{dataType:'json'}).then(function(response){Z.debug('globalItems callback',3);return response.data;});};Library.prototype.fetchGlobalItem=function(globalKey){Z.debug('Zotero.Library.fetchGlobalItem',3);Z.debug(globalKey);var library=this;var defaultConfig={target:'item'}; //Build config object that should be displayed next and compare to currently displayed
var newConfig=Z.extend({},defaultConfig);var urlconfig=Z.extend({'target':'item','libraryType':'','itemKey':globalKey},newConfig);var requestUrl=Zotero.ajax.apiRequestString(urlconfig);return library.ajaxRequest(requestUrl,'GET',{dataType:'json'}).then(function(response){Z.debug('globalItem callback',3);return response.data;});}; //TagFunctions
Library.prototype.fetchTags=function(config){Z.debug('Zotero.Library.fetchTags',3);var library=this;var defaultConfig={target:'tags',order:'title',sort:'asc',limit:100};var newConfig=Z.extend({},defaultConfig,config);var urlconfig=Z.extend({'target':'tags','libraryType':this.libraryType,'libraryID':this.libraryID},newConfig);return Zotero.ajaxRequest(urlconfig);};Library.prototype.loadTags=function(){var config=arguments.length<=0||arguments[0]===undefined?{}:arguments[0];Z.debug('Zotero.Library.loadTags',3);var library=this;if(config.showAutomaticTags&&config.collectionKey){delete config.collectionKey;}library.tags.displayTagsArray=[];return library.fetchTags(config).then(function(response){Z.debug('loadTags proxied callback',3);var updatedVersion=response.lastModifiedVersion;library.tags.updateSyncState(updatedVersion);var addedTags=library.tags.addTagsFromJson(response.data);library.tags.updateTagsVersion(updatedVersion);library.tags.rebuildTagsArray();if(response.parsedLinks.hasOwnProperty('next')){library.tags.hasNextLink=true;library.tags.nextLink=response.parsedLinks['next'];}else {library.tags.hasNextLink=false;library.tags.nextLink=null;}library.trigger('tagsChanged',{library:library});return library.tags;});};Library.prototype.loadAllTags=function(){var config=arguments.length<=0||arguments[0]===undefined?{}:arguments[0];Z.debug('Zotero.Library.loadAllTags',3);var library=this;var defaultConfig={target:'tags',order:'title',sort:'asc',limit:100,libraryType:library.libraryType,libraryID:library.libraryID}; //Build config object that should be displayed next and compare to currently displayed
var newConfig=Z.extend({},defaultConfig,config);var urlconfig=Z.extend({},newConfig);var requestUrl=Zotero.ajax.apiRequestString(urlconfig);var tags=library.tags; //check if already loaded tags are okay to use
var loadedConfig=Z.extend({},defaultConfig,tags.loadedConfig);var loadedConfigRequestUrl=tags.loadedRequestUrl;Z.debug('requestUrl: '+requestUrl,4);Z.debug('loadedConfigRequestUrl: '+loadedConfigRequestUrl,4);return new Promise(function(resolve,reject){var continueLoadingCallback=function continueLoadingCallback(tags){Z.debug('loadAllTags continueLoadingCallback',3);var plainList=Zotero.Tags.prototype.plainTagsList(tags.tagsArray);plainList.sort(Library.prototype.comparer());tags.plainList=plainList;if(tags.hasNextLink){Z.debug('still has next link.',3);tags.tagsArray.sort(Zotero.Tag.prototype.tagComparer());plainList=Zotero.Tags.prototype.plainTagsList(tags.tagsArray);plainList.sort(Library.prototype.comparer());tags.plainList=plainList;var nextLink=tags.nextLink;var nextLinkConfig=Zotero.utils.parseQuery(Zotero.utils.querystring(nextLink));var newConfig=Z.extend({},config);newConfig.start=nextLinkConfig.start;newConfig.limit=nextLinkConfig.limit;return library.loadTags(newConfig).then(continueLoadingCallback);}else {Z.debug('no next in tags link',3);tags.updateSyncedVersion();tags.tagsArray.sort(Zotero.Tag.prototype.tagComparer());plainList=Zotero.Tags.prototype.plainTagsList(tags.tagsArray);plainList.sort(Library.prototype.comparer());tags.plainList=plainList;Z.debug('resolving loadTags deferred',3);library.tagsLoaded=true;library.tags.loaded=true;tags.loadedConfig=config;tags.loadedRequestUrl=requestUrl; //update all tags with tagsVersion
for(var i=0;i<library.tags.tagsArray.length;i++){tags.tagsArray[i].apiObj.version=tags.tagsVersion;}library.trigger('tagsChanged',{library:library});return tags;}};resolve(library.loadTags(urlconfig).then(continueLoadingCallback));});}; //LibraryCache
//load objects from indexedDB
Library.prototype.loadIndexedDBCache=function(){Zotero.debug('Zotero.Library.loadIndexedDBCache',3);var library=this;var itemsPromise=library.idbLibrary.getAllItems();var collectionsPromise=library.idbLibrary.getAllCollections();var tagsPromise=library.idbLibrary.getAllTags();itemsPromise.then(function(itemsArray){Z.debug('loadIndexedDBCache itemsD done',3); //create itemsDump from array of item objects
var latestItemVersion=0;for(var i=0;i<itemsArray.length;i++){var item=new Zotero.Item(itemsArray[i]);library.items.addItem(item);if(item.version>latestItemVersion){latestItemVersion=item.version;}}library.items.itemsVersion=latestItemVersion; //TODO: add itemsVersion as last version in any of these items?
//or store it somewhere else for indexedDB cache purposes
library.items.loaded=true;Z.debug('Done loading indexedDB items promise into library',3);});collectionsPromise.then(function(collectionsArray){Z.debug('loadIndexedDBCache collectionsD done',3); //create collectionsDump from array of collection objects
var latestCollectionVersion=0;for(var i=0;i<collectionsArray.length;i++){var collection=new Zotero.Collection(collectionsArray[i]);library.collections.addCollection(collection);if(collection.version>latestCollectionVersion){latestCollectionVersion=collection.version;}}library.collections.collectionsVersion=latestCollectionVersion; //TODO: add collectionsVersion as last version in any of these items?
//or store it somewhere else for indexedDB cache purposes
library.collections.initSecondaryData();library.collections.loaded=true;});tagsPromise.then(function(tagsArray){Z.debug('loadIndexedDBCache tagsD done',3);Z.debug(tagsArray); //create tagsDump from array of tag objects
var latestVersion=0;var tagsVersion=0;for(var i=0;i<tagsArray.length;i++){var tag=new Zotero.Tag(tagsArray[i]);library.tags.addTag(tag);if(tagsArray[i].version>latestVersion){latestVersion=tagsArray[i].version;}}tagsVersion=latestVersion;library.tags.tagsVersion=tagsVersion; //TODO: add tagsVersion as last version in any of these items?
//or store it somewhere else for indexedDB cache purposes
library.tags.loaded=true;}); //resolve the overall deferred when all the child deferreds are finished
return Promise.all([itemsPromise,collectionsPromise,tagsPromise]);};Library.prototype.saveIndexedDB=function(){var library=this;var saveItemsPromise=library.idbLibrary.updateItems(library.items.itemsArray);var saveCollectionsPromise=library.idbLibrary.updateCollections(library.collections.collectionsArray);var saveTagsPromise=library.idbLibrary.updateTags(library.tags.tagsArray); //resolve the overall deferred when all the child deferreds are finished
return Promise.all([saveItemsPromise,saveCollectionsPromise,saveTagsPromise]);};module.exports=Library;},{}],114:[function(require,module,exports){'use strict';var ItemMaps=require('./ItemMaps.js');module.exports.fieldMap=ItemMaps.fieldMap;module.exports.typeMap=ItemMaps.typeMap;module.exports.creatorMap=ItemMaps.creatorMap;},{"./ItemMaps.js":111}],115:[function(require,module,exports){'use strict';var _typeof=typeof Symbol==="function"&&_typeof2(Symbol.iterator)==="symbol"?function(obj){return typeof obj==="undefined"?"undefined":_typeof2(obj);}:function(obj){return obj&&typeof Symbol==="function"&&obj.constructor===Symbol?"symbol":typeof obj==="undefined"?"undefined":_typeof2(obj);};var Deferred=require('deferred'); /*
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
 */var Net=function Net(){this.deferredQueue=[];this.numRunning=0;this.numConcurrent=3;this.backingOff=false;};Net.prototype.queueDeferred=function(){var net=this;var d=new Deferred();net.deferredQueue.push(d);return Promise.resolve(d);};Net.prototype.queueRequest=function(requestObject){Z.debug('Zotero.Net.queueRequest',3);var net=this;var resultPromise;if(Array.isArray(requestObject)){resultPromise=net.queueDeferred().then(function(){Z.debug('running sequential after queued deferred resolved',4);return net.runSequential(requestObject);}).then(function(response){Z.debug('runSequential done',3);net.queuedRequestDone();return response;});}else {resultPromise=net.queueDeferred().then(function(){Z.debug('running concurrent after queued deferred resolved',4);return net.runConcurrent(requestObject);}).then(function(response){Z.debug('done with queuedRequest');net.queuedRequestDone();return response;});}net.runNext();return resultPromise.catch(function(error){Z.error('Error before leaving Zotero.Net');Z.error(error);});};Net.prototype.runConcurrent=function(requestObject){Z.debug('Zotero.Net.runConcurrent',3);return this.ajaxRequest(requestObject).then(function(response){Z.debug('done with runConcurrent request');return response;});}; //run the set of requests serially
//chaining each request onto the .then of the previous one, after
//adding the previous response to a responses array that will be
//returned via promise to the caller when all requests are complete
Net.prototype.runSequential=function(requestObjects){Z.debug('Zotero.Net.runSequential',3);var net=this;var responses=[];var seqPromise=Promise.resolve();for(var i=0;i<requestObjects.length;i++){var requestObject=requestObjects[i];seqPromise=seqPromise.then(function(){var p=net.ajaxRequest(requestObject).then(function(response){Z.debug('pushing sequential response into result array');responses.push(response);});return p;});}return seqPromise.then(function(){Z.debug('done with sequential aggregator promise - returning responses');return responses;});}; //when one concurrent call, or a sequential series finishes, subtract it from the running
//count and run the next if there is something waiting to be run
Net.prototype.individualRequestDone=function(response){Z.debug('Zotero.Net.individualRequestDone',3);var net=this; //check if we need to back off before making more requests
var wait=net.checkDelay(response);if(wait>0){var waitms=wait*1000;net.backingOff=true;var waitExpiration=Date.now()+waitms;if(waitExpiration>net.waitingExpires){net.waitingExpires=waitExpiration;}setTimeout(net.runNext,waitms);}return response;};Net.prototype.queuedRequestDone=function(response){Z.debug('queuedRequestDone',3);var net=this;net.numRunning--;net.runNext();return response;};Net.prototype.runNext=function(){Z.debug('Zotero.Net.runNext',3);var net=this;var nowms=Date.now(); //check if we're backing off and need to remain backing off,
//or if we should now continue
if(net.backingOff&&net.waitingExpires>nowms-100){Z.debug('currently backing off',3);var waitms=net.waitingExpires-nowms;setTimeout(net.runNext,waitms);return;}else if(net.backingOff&&net.waitingExpires<=nowms-100){net.backingOff=false;} //continue making requests up to the concurrent limit
Z.debug(net.numRunning+'/'+net.numConcurrent+' Running. '+net.deferredQueue.length+' queued.',3);while(net.deferredQueue.length>0&&net.numRunning<net.numConcurrent){net.numRunning++;var nextD=net.deferredQueue.shift();nextD.resolve();Z.debug(net.numRunning+'/'+net.numConcurrent+' Running. '+net.deferredQueue.length+' queued.',3);}};Net.prototype.checkDelay=function(response){Z.debug('Zotero.Net.checkDelay');Z.debug(response);var net=this;var wait=0;if(Array.isArray(response)){for(var i=0;i<response.length;i++){var iwait=net.checkDelay(response[i]);if(iwait>wait){wait=iwait;}}}else {if(response.status==429){wait=response.retryAfter;}else if(response.backoff){wait=response.backoff;}}return wait;};Net.prototype.ajaxRequest=function(requestConfig){Z.debug('Zotero.Net.ajaxRequest',3);var net=this;var defaultConfig={type:'GET',headers:{'Zotero-API-Version':Zotero.config.apiVersion,'Content-Type':'application/json'},success:function success(response){return response;},error:function error(response){Z.error('ajaxRequest rejected:'+response.jqxhr.status+' - '+response.jqxhr.responseText);return response;} //cache:false
};var headers=Z.extend({},defaultConfig.headers,requestConfig.headers);var config=Z.extend({},defaultConfig,requestConfig);config.headers=headers;if(_typeof(config.url)=='object'){config.url=Zotero.ajax.apiRequestString(config.url);}config.url=Zotero.ajax.proxyWrapper(config.url,config.type);if(!config.url){throw 'No url specified in Zotero.Net.ajaxRequest';} //rename success/error callbacks so J.ajax does not actually use them
//and we can use them as es6 promise result functions with expected
//single value arguments
config.zsuccess=config.success;config.zerror=config.error;delete config.success;delete config.error;Z.debug('AJAX config');Z.debug(config);var ajaxpromise=new Promise(function(resolve,reject){net.ajax(config).then(function(request){var data;if(request.responseType=='json'||request.responseType===''&&request.getResponseHeader('content-type')==='application/json'){try{data=JSON.parse(request.response);}catch(err) {data=request.response;}}else {data=request.response;}var r=new Zotero.ApiResponse({jqxhr:request,data:data,textStatus:request.responseText});resolve(r);},function(request){var r=new Zotero.ApiResponse({jqxhr:request,textStatus:request.responseText,isError:true});reject(r);});}).then(net.individualRequestDone.bind(net)).then(function(response){ //now that we're done handling, reject
if(response.isError){Z.error('re-throwing ApiResponse that was a rejection');throw response;}return response;}).then(config.zsuccess,config.zerror);return ajaxpromise;};Net.prototype.ajax=function(config){config=Zotero.extend({type:'GET'},config);var promise=new Promise(function(resolve,reject){var req=new XMLHttpRequest();var uri=config.url;req.open(config.type,uri);if(config.headers){Object.keys(config.headers).forEach(function(key){var val=config.headers[key];req.setRequestHeader(key,val);});}req.send(config.data);req.onload=function(){Z.debug('XMLHttpRequest done');Z.debug(req);if(req.status>=200&&req.status<300){Z.debug('200-300 response: resolving Net.ajax promise'); // Performs the function "resolve" when this.status is equal to 2xx
resolve(req);}else {Z.debug('not 200-300 response: rejecting Net.ajax promise'); // Performs the function "reject" when this.status is different than 2xx
reject(req);}};req.onerror=function(){reject(req);};});return promise;};module.exports=new Net();},{"deferred":31}],116:[function(require,module,exports){'use strict';var _typeof=typeof Symbol==="function"&&_typeof2(Symbol.iterator)==="symbol"?function(obj){return typeof obj==="undefined"?"undefined":_typeof2(obj);}:function(obj){return obj&&typeof Symbol==="function"&&obj.constructor===Symbol?"symbol":typeof obj==="undefined"?"undefined":_typeof2(obj);};module.exports=function(store,idString){this.store=store;this.idString=idString;this.preferencesObject={};this.defaults={debug_level:3, //lower level is higher priority
debug_log:true,debug_mock:false,listDisplayedFields:['title','creator','dateModified'],showAutomaticTags:false, //tagType:1 is automatic, tagType:0 was added by user
itemsPerPage:25,order:'title',title:'asc'};this.load();};module.exports.prototype.setPref=function(key,value){var preferences=this;preferences.preferencesObject[key]=value;preferences.persist();};module.exports.prototype.setPrefs=function(newPrefs){var preferences=this;if((typeof newPrefs==='undefined'?'undefined':_typeof(newPrefs))!='object'){throw new Error('Preferences must be an object');}preferences.preferencesObject=newPrefs;preferences.persist();};module.exports.prototype.getPref=function(key){var preferences=this;if(preferences.preferencesObject[key]){return preferences.preferencesObject[key];}else if(preferences.defaults[key]){return preferences.defaults[key];}else {return null;}};module.exports.prototype.getPrefs=function(){var preferences=this;return preferences.preferencesObject;};module.exports.prototype.persist=function(){var preferences=this;var storageString='preferences_'+preferences.idString;preferences.store[storageString]=JSON.stringify(preferences.preferencesObject);};module.exports.prototype.load=function(){var preferences=this;var storageString='preferences_'+preferences.idString;var storageObjectString=preferences.store[storageString];if(!storageObjectString){preferences.preferencesObject={};}else {preferences.preferencesObject=JSON.parse(storageObjectString);}};},{}],117:[function(require,module,exports){'use strict';module.exports=function(){this.instance='Zotero.Search';this.searchObject={};};},{}],118:[function(require,module,exports){'use strict';module.exports=function(){this.instance='Zotero.Searches';this.searchObjects={};this.syncState={earliestVersion:null,latestVersion:null};};},{}],119:[function(require,module,exports){'use strict';var _typeof=typeof Symbol==="function"&&_typeof2(Symbol.iterator)==="symbol"?function(obj){return typeof obj==="undefined"?"undefined":_typeof2(obj);}:function(obj){return obj&&typeof Symbol==="function"&&obj.constructor===Symbol?"symbol":typeof obj==="undefined"?"undefined":_typeof2(obj);};module.exports=function(tagObj){this.instance='Zotero.Tag';this.color=null;this.version=0;if((typeof tagObj==='undefined'?'undefined':_typeof(tagObj))=='object'){this.parseJsonTag(tagObj);}else if(typeof tagObj=='string'){this.parseJsonTag(this.templateApiObj(tagObj));}else {this.parseJsonTag(this.tamplateApiObj(''));}};module.exports.prototype=new Zotero.ApiObject();module.exports.prototype.parseJsonTag=function(tagObj){var tag=this;tag.apiObj=Z.extend({},tagObj);tag.urlencodedtag=encodeURIComponent(tag.apiObj.tag);tag.version=tag.apiObj.version;};module.exports.prototype.templateApiObj=function(tagString){return {tag:tagString,links:{},meta:{type:0,numItems:1}};};module.exports.prototype.tagComparer=function(){if(Intl){var collator=new Intl.Collator();return function(a,b){return collator.compare(a.apiObj.tag,b.apiObj.tag);};}else {return function(a,b){if(a.apiObj.tag.toLocaleLowerCase()==b.apiObj.tag.toLocaleLowerCase()){return 0;}if(a.apiObj.tag.toLocaleLowerCase()<b.apiObj.tag.toLocaleLowerCase()){return -1;}return 1;};}};module.exports.prototype.set=function(key,val){var tag=this;if(key in tag.apiObj){tag.apiObj[key]=val;}if(key in tag.apiObj.meta){tag.apiObj.meta[key]=val;}switch(key){case 'tagVersion':case 'version':tag.version=val;tag.apiObj.version=val;break;}return tag;};},{}],120:[function(require,module,exports){'use strict';module.exports=function(jsonBody){this.instance='Zotero.Tags'; //represent collections as array for ordering purposes
this.tagsVersion=0;this.syncState={earliestVersion:null,latestVersion:null};this.displayTagsArray=[];this.displayTagsUrl='';this.tagObjects={};this.tagsArray=[];this.loaded=false;if(jsonBody){this.addTagsFromJson(jsonBody);}};module.exports.prototype=new Zotero.Container();module.exports.prototype.addTag=function(tag){var tags=this;tags.tagObjects[tag.apiObj.tag]=tag;tags.tagsArray.push(tag);if(tags.owningLibrary){tag.associateWithLibrary(tags.owningLibrary);}};module.exports.prototype.getTag=function(tagname){var tags=this;if(tags.tagObjects.hasOwnProperty(tagname)){return this.tagObjects[tagname];}return null;};module.exports.prototype.removeTag=function(tagname){var tags=this;delete tags.tagObjects[tagname];tags.updateSecondaryData();};module.exports.prototype.removeTags=function(tagnames){var tags=this;tagnames.forEach(function(tagname){delete tags.tagObjects[tagname];});tags.updateSecondaryData();};module.exports.prototype.plainTagsList=function(tagsArray){Z.debug('Zotero.Tags.plainTagsList',3);var plainList=[];tagsArray.forEach(function(tag){plainList.push(tag.apiObj.tag);});return plainList;};module.exports.prototype.clear=function(){Z.debug('Zotero.Tags.clear',3);this.tagsVersion=0;this.syncState.earliestVersion=null;this.syncState.latestVersion=null;this.displayTagsArray=[];this.displayTagsUrl='';this.tagObjects={};this.tagsArray=[];};module.exports.prototype.updateSecondaryData=function(){Z.debug('Zotero.Tags.updateSecondaryData',3);var tags=this;tags.tagsArray=[];Object.keys(tags.tagObjects).forEach(function(key){var val=tags.tagObjects[key];tags.tagsArray.push(val);});tags.tagsArray.sort(Zotero.Tag.prototype.tagComparer());var plainList=tags.plainTagsList(tags.tagsArray);plainList.sort(Zotero.Library.prototype.comparer());tags.plainList=plainList;};module.exports.prototype.updateTagsVersion=function(tagsVersion){var tags=this;Object.keys(tags.tagObjects).forEach(function(key){var tag=tags.tagObjects[key];tag.set('version',tagsVersion);});};module.exports.prototype.rebuildTagsArray=function(){var tags=this;tags.tagsArray=[];Object.keys(tags.tagObjects).forEach(function(key){var tag=tags.tagObjects[key];tags.tagsArray.push(tag);});};module.exports.prototype.addTagsFromJson=function(jsonBody){Z.debug('Zotero.Tags.addTagsFromJson',3);var tags=this;var tagsAdded=[];jsonBody.forEach(function(tagObj){var tag=new Zotero.Tag(tagObj);tags.addTag(tag);tagsAdded.push(tag);});return tagsAdded;};},{}],121:[function(require,module,exports){'use strict'; // Url.js - construct certain urls and links locally that may depend on the
// current website's routing scheme etc. Not necessarily pointing to zotero.org
// - href for a particular item's local representation
// - link with appropriate text, to download file or view framed snapshot
// - href for file download/view, depending on whether config says to download
// directly from the api, or to proxy it
// - displayable string describing the attachment file (attachmentFileDetails)
// - list of urls for supported export formats
//
var Url={}; //locally construct a url for the item on the current website
Url.itemHref=function(item){var href='';href+=Zotero.config.librarySettings.libraryPathString+'/itemKey/'+item.get('key');return href;}; //construct a download link for an item's enclosure file that takes into
//account size and whether the file is a snapshot
Url.attachmentDownloadLink=function(item){var retString='';var downloadUrl=item.attachmentDownloadUrl;var contentType=item.get('contentType');if(item.apiObj.links&&item.apiObj.links['enclosure']){if(!item.apiObj.links['enclosure']['length']&&item.isSnapshot()){ //snapshot: redirect to view
retString+='<a href="'+downloadUrl+'">'+'View Snapshot</a>';}else { //file: offer download
var enctype=Zotero.utils.translateMimeType(item.apiObj.links['enclosure'].type);var enc=item.apiObj.links['enclosure'];var filesize=parseInt(enc['length'],10);var filesizeString=''+filesize+' B';if(filesize>1073741824){filesizeString=''+(filesize/1073741824).toFixed(1)+' GB';}else if(filesize>1048576){filesizeString=''+(filesize/1048576).toFixed(1)+' MB';}else if(filesize>1024){filesizeString=''+(filesize/1024).toFixed(1)+' KB';}Z.debug(enctype,3);retString+='<a href="'+downloadUrl+'">';if(enctype=='undefined'||enctype===''||typeof enctype=='undefined'){retString+=filesizeString+'</a>';}else {retString+=enctype+', '+filesizeString+'</a>';}return retString;}}return retString;};Url.attachmentDownloadUrl=function(item){if(item.apiObj.links&&item.apiObj.links['enclosure']){if(Zotero.config.proxyDownloads){ //we have a proxy for downloads at baseDownloadUrl so just pass an itemkey to that
return Url.wwwDownloadUrl(item);}else {return Url.apiDownloadUrl(item);}}return false;};Url.apiDownloadUrl=function(item){if(item.apiObj.links['enclosure']){return item.apiObj.links['enclosure']['href'];}return false;};Url.proxyDownloadUrl=function(item){if(item.apiObj.links['enclosure']){if(Zotero.config.proxyDownloads){return Zotero.config.baseDownloadUrl+'?itemkey='+item.get('key');}else {return Url.apiDownloadUrl(item);}}else {return false;}};Url.wwwDownloadUrl=function(item){if(item.apiObj.links['enclosure']){return Zotero.config.baseZoteroWebsiteUrl+Zotero.config.librarySettings.libraryPathString+'/'+item.get('key')+'/file/view';}else {return false;}};Url.publicationsDownloadUrl=function(item){if(item.apiObj.links['enclosure']){return item.apiObj.links['enclosure']['href'];}return false;};Url.attachmentFileDetails=function(item){ //file: offer download
if(!item.apiObj.links['enclosure'])return '';var enctype=Zotero.utils.translateMimeType(item.apiObj.links['enclosure'].type);var enc=item.apiObj.links['enclosure'];var filesizeString='';if(enc['length']){var filesize=parseInt(enc['length'],10);filesizeString=''+filesize+' B';if(filesize>1073741824){filesizeString=''+(filesize/1073741824).toFixed(1)+' GB';}else if(filesize>1048576){filesizeString=''+(filesize/1048576).toFixed(1)+' MB';}else if(filesize>1024){filesizeString=''+(filesize/1024).toFixed(1)+' KB';}return '('+enctype+', '+filesizeString+')';}else {return '('+enctype+')';}};Url.userWebLibrary=function(slug){return [Zotero.config.baseWebsiteUrl,slug,'items'].join('/');};Url.groupWebLibrary=function(group){if(group.type=='Private'){return [Zotero.config.baseWebsiteUrl,'groups',group.get('id'),'items'].join('/');}else {return [Zotero.config.baseWebsiteUrl,'groups',Zotero.utils.slugify(group.get('name')),'items'].join('/');}};Url.exportUrls=function(config){Z.debug('Zotero.url.exportUrls',3);var exportUrls={};var exportConfig={};Zotero.config.exportFormats.forEach(function(format){exportConfig=Z.extend(config,{'format':format});exportUrls[format]=Zotero.ajax.apiRequestUrl(exportConfig)+Zotero.ajax.apiQueryString({format:format,limit:'25'});});return exportUrls;};Url.relationUrl=function(libraryType,libraryID,itemKey){return 'http://zotero.org/'+libraryType+'s/'+libraryID+'/items/'+itemKey;};module.exports=Url;},{}],122:[function(require,module,exports){'use strict';module.exports=function(){this.instance='Zotero.User';};module.exports.prototype=new Zotero.ApiObject();module.exports.prototype.loadObject=function(ob){this.title=ob.title;this.author=ob.author;this.tagID=ob.tagID;this.published=ob.published;this.updated=ob.updated;this.links=ob.links;this.numItems=ob.numItems;this.items=ob.items;this.tagType=ob.tagType;this.modified=ob.modified;this.added=ob.added;this.key=ob.key;};module.exports.prototype.parseXmlUser=function(tel){this.parseXmlEntry(tel);var tagEl=tel.find('content>tag');if(tagEl.length!==0){this.tagKey=tagEl.attr('key'); // find("zapi\\:itemID").text();
this.libraryID=tagEl.attr('libraryID');this.tagName=tagEl.attr('name');this.dateAdded=tagEl.attr('dateAdded');this.dateModified=tagEl.attr('dateModified');}};},{}],123:[function(require,module,exports){'use strict';var Utils={randomString:function randomString(len,chars){if(!chars){chars='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';}if(!len){len=8;}var randomstring='';for(var i=0;i<len;i++){var rnum=Math.floor(Math.random()*chars.length);randomstring+=chars.substring(rnum,rnum+1);}return randomstring;},getKey:function getKey(){var baseString='23456789ABCDEFGHIJKMNPQRSTUVWXZ';return Utils.randomString(8,baseString);},slugify:function slugify(name){var slug=name.trim();slug=slug.toLowerCase();slug=slug.replace(/[^a-z0-9 ._-]/g,'');slug=slug.replace(/\s/g,'_');return slug;},prependAutocomplete:function prependAutocomplete(pre,source){Z.debug('Zotero.utils.prependAutocomplete',3);Z.debug('prepend match: '+pre);var satisfy;if(!source){Z.debug('source is not defined');}if(pre===''){satisfy=source.slice(0);return satisfy;}var plen=pre.length;var plower=pre.toLowerCase();satisfy=source.map(function(n){if(n.substr(0,plen).toLowerCase()==plower){return n;}else {return null;}});return satisfy;},matchAnyAutocomplete:function matchAnyAutocomplete(pre,source){Z.debug('Zotero.utils.matchAnyAutocomplete',3);Z.debug('matchAny match: '+pre);var satisfy;if(!source){Z.debug('source is not defined');}if(pre===''){satisfy=source.slice(0);return satisfy;}var plen=pre.length;var plower=pre.toLowerCase();satisfy=source.map(function(n){if(n.toLowerCase().indexOf(plower)!=-1){return n;}else {return null;}});return satisfy;},libraryString:function libraryString(type,libraryID){var lstring='';if(type=='user')lstring='u';else if(type=='group')lstring='g';lstring+=libraryID;return lstring;},parseLibString:function parseLibString(libraryString){var type;var libraryID;if(libraryString.charAt(0)=='u'){type='user';}else if(libraryString.charAt(0)=='g'){type='group';}else {throw new Error('unexpected type character in libraryString');}libraryID=parseInt(libraryString.substring(1));return {libraryType:type,libraryID:libraryID};}, //return true if retrieved more than lifetime minutes ago
stale:function stale(retrievedDate,lifetime){var now=Date.now(); //current local time
var elapsed=now.getTime()-retrievedDate.getTime();if(elapsed/60000>lifetime){return true;}return false;},entityify:function entityify(str){var character={'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'};return str.replace(/[<>&"]/g,function(c){return character[c];});},parseApiDate:function parseApiDate(datestr,date){ //var parsems = Date.parse(datestr);
var re=/([0-9]+)-([0-9]+)-([0-9]+)T([0-9]+):([0-9]+):([0-9]+)Z/;var matches=re.exec(datestr);if(matches===null){Z.error('error parsing api date: '+datestr);return null;}else {date=new Date(Date.UTC(matches[1],matches[2]-1,matches[3],matches[4],matches[5],matches[6]));return date;}return date;},readCookie:function readCookie(name){var nameEQ=name+'=';var ca=document.cookie.split(';');for(var i=0;i<ca.length;i++){var c=ca[i];while(c.charAt(0)==' '){c=c.substring(1,c.length);}if(c.indexOf(nameEQ)===0)return c.substring(nameEQ.length,c.length);}return null;}, /**
  * Translate common mimetypes to user friendly versions
  *
  * @param string $mimeType
  * @return string
  */translateMimeType:function translateMimeType(mimeType){switch(mimeType){case 'text/html':return 'html';case 'application/pdf':case 'application/x-pdf':case 'application/acrobat':case 'applications/vnd.pdf':case 'text/pdf':case 'text/x-pdf':return 'pdf';case 'image/jpg':case 'image/jpeg':return 'jpg';case 'image/gif':return 'gif';case 'application/msword':case 'application/doc':case 'application/vnd.msword':case 'application/vnd.ms-word':case 'application/winword':case 'application/word':case 'application/x-msw6':case 'application/x-msword':return 'doc';case 'application/vnd.oasis.opendocument.text':case 'application/x-vnd.oasis.opendocument.text':return 'odt';case 'video/flv':case 'video/x-flv':return 'flv';case 'image/tif':case 'image/tiff':case 'image/x-tif':case 'image/x-tiff':case 'application/tif':case 'application/x-tif':case 'application/tiff':case 'application/x-tiff':return 'tiff';case 'application/zip':case 'application/x-zip':case 'application/x-zip-compressed':case 'application/x-compress':case 'application/x-compressed':case 'multipart/x-zip':return 'zip';case 'video/quicktime':case 'video/x-quicktime':return 'mov';case 'video/avi':case 'video/msvideo':case 'video/x-msvideo':return 'avi';case 'audio/wav':case 'audio/x-wav':case 'audio/wave':return 'wav';case 'audio/aiff':case 'audio/x-aiff':case 'sound/aiff':return 'aiff';case 'text/plain':return 'plain text';case 'application/rtf':return 'rtf';default:return mimeType;}}, /**
  * Get the permissions a key has for a library
  * if no key is passed use the currently set key for the library
  *
  * @param int|string $userID
  * @param string $key
  * @return array $keyPermissions
  */getKeyPermissions:function getKeyPermissions(userID,key){if(!userID){return false;}if(!key){return false;}var urlconfig={'target':'key','libraryType':'user','libraryID':userID,'apiKey':key};var requestUrl=Zotero.ajax.apiRequestString(urlconfig);return Zotero.ajaxRequest(requestUrl).then(function(response){var keyObject=JSON.parse(response.data);return keyObject;});},parseQuery:function parseQuery(query){var params={};var match;var pl=/\+/g; // Regex for replacing addition symbol with a space
var search=/([^&=]+)=?([^&]*)/g;var decode=function decode(s){return decodeURIComponent(s.replace(pl,' '));};while(match=search.exec(query)){params[decode(match[1])]=decode(match[2]);}return params;},querystring:function querystring(href){var hashindex=href.indexOf('#')!=-1?href.indexOf('#'):undefined;var q=href.substring(href.indexOf('?')+1,hashindex);return q;}};module.exports=Utils;},{}]},{},[1])(1);});
"use strict";

var J = jQuery.noConflict();

jQuery(document).ready(function () {
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
    javascript_enabled: false
};

Zotero.init = function () {
    Z.debug("Zotero init", 3);

    if (window.zoteroConfig) {
        Zotero.config = J.extend({}, Zotero.config, window.zoteroConfig);
    }

    Zotero.state.rewriteAltUrl();

    //base init to setup tagline and search bar
    if (Zotero.pages) {
        Zotero.pages.base.init();
    }

    //run page specific init
    if (window.zoterojsClass && undefined !== Zotero.pages && Zotero.pages[zoterojsClass]) {
        try {
            Zotero.pages[zoterojsClass].init();
        } catch (err) {
            Z.error("Error running page specific init for " + zoterojsClass);
            Z.error(err);
        }
    }

    if (typeof zoteroData == 'undefined') {
        zoteroData = {};
    }

    if (window.nonZendPage === true) {
        return;
    }

    Zotero.state.parseUrlVars();

    Zotero.config.startPageTitle = document.title;
    var store;
    if (typeof sessionStorage == 'undefined') {
        store = {}; //Zotero.storage.localStorage = {};
    } else {
            store = sessionStorage;
        }
    Zotero.cache = new Zotero.Cache(store);
    Zotero.store = store;
    //initialize global preferences object
    Zotero.preferences = new Zotero.Preferences(Zotero.store, 'global');
    Zotero.preferences.defaults = J.extend({}, Zotero.preferences.defaults, Zotero.config.defaultPrefs);

    //get localized item constants if not stored in localstorage
    var locale = "en-US";
    if (zoteroData.locale) {
        locale = zoteroData.locale;
    }

    //load general data if on library page
    if (Zotero.config.pageClass == 'user_library' || Zotero.config.pageClass == 'group_library' || Zotero.config.pageClass == 'my_library') {
        Z.debug("library page - ", 3);
        Zotero.state.libraryString = Zotero.utils.libraryString(Zotero.config.librarySettings.libraryType, Zotero.config.librarySettings.libraryID);
        Zotero.state.filter = Zotero.state.libraryString;

        Zotero.Item.prototype.getItemTypes(locale);
        Zotero.Item.prototype.getItemFields(locale);
        Zotero.Item.prototype.getCreatorFields(locale);
        Zotero.Item.prototype.getCreatorTypes();
    } else {
        Z.debug("non-library page", 3);
    }

    Zotero.ui.init.all();

    J.ajaxSettings.traditional = true;

    if (Zotero.state.getUrlVar('proxy') == 'false') {
        Zotero.config.proxy = false;
    }

    // Bind to popstate to update state when browser goes back
    // only applicable if state is using location
    window.onpopstate = function () {
        Z.debug("popstate", 3);
        J(window).trigger('statechange');
    };
    J(window).on('statechange', J.proxy(Zotero.state.popstateCallback, Zotero.state));

    //call popstateCallback on first load since some browsers don't popstate onload
    Zotero.state.popstateCallback();
};
'use strict';

Zotero.State = function () {
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
Zotero.State.prototype.rewriteAltUrl = function () {
    Z.debug("rewriteAltUrl");
    var state = this;
    var matches = false;
    var itemKey = false;
    var collectionKey = false;
    var replace = false;

    var basePath = Zotero.config.nonparsedBaseUrl;
    var pathname = window.location.pathname;
    var baseRE = new RegExp(".*" + basePath + "\/?");
    var oldCollectionRE = /^.*\/items\/collections?\/([A-Z0-9]{8})(?:\/[A-Z0-9]{8})?$/;
    var oldItemRE = /^.*\/items\/([A-Z0-9]{8})$/;

    switch (true) {
        case oldCollectionRE.test(pathname):
            matches = oldCollectionRE.exec(pathname);
            collectionKey = matches[1];
            itemKey = matches[2];
            replace = true;
            break;
        case oldItemRE.test(pathname):
            matches = oldItemRE.exec(pathname);
            itemKey = matches[1];
            replace = true;
            break;
    }

    if (collectionKey) {
        state.setUrlVar('collectionKey', collectionKey);
    }
    if (itemKey) {
        state.setUrlVar('itemKey', itemKey);
    }

    if (replace) {
        state.replaceState();
    }
};

Zotero.State.prototype.updateCurState = function () {
    var state = this;
    state.curState = J.extend({}, state.q, state.pathVars);
    return;
};

Zotero.State.prototype.savePrevState = function () {
    var state = this;
    state.prevState = state.curState;
    return;
};

Zotero.State.prototype.getSelectedItemKeys = function () {
    var state = this;
    //filter actual selected itemKeys so we only return unique list
    //necessary because of duplicate item checkboxes, some of which
    //may be hidden
    var uniqueKeys = {};
    var returnKeys = [];
    J.each(state.selectedItemKeys, function (ind, val) {
        uniqueKeys[val] = true;
    });
    J.each(uniqueKeys, function (key, val) {
        returnKeys.push(key);
    });
    if (returnKeys.length === 0 && state.getUrlVar('itemKey')) {
        returnKeys.push(state.getUrlVar('itemKey'));
    }
    return returnKeys;
};

//toggle the selected state of the passed item key
Zotero.State.prototype.toggleItemSelected = function (itemKey) {
    var state = this;
    var newselected = [];
    var alreadySelected = false;
    var selectedItemKeys = state.getSelectedItemKeys();
    J.each(selectedItemKeys, function (ind, val) {
        if (val == itemKey) {
            alreadySelected = true;
        } else {
            newselected.push(val);
        }
    });
    if (!alreadySelected) {
        newselected.push(itemKey);
    }
    state.selectedItemKeys = newselected;
};

Zotero.State.prototype.pushTag = function (newtag) {
    Z.debug('Zotero.State.pushTag', 3);
    var state = this;
    if (state.pathVars['tag']) {
        if (state.pathVars['tag'] instanceof Array) {
            state.pathVars['tag'].push(newtag);
        } else {
            var currentTag = state.pathVars['tag'];
            state.pathVars['tag'] = [currentTag, newtag];
        }
    } else {
        state.pathVars['tag'] = [newtag];
    }
    return;
};

Zotero.State.prototype.popTag = function (oldtag) {
    Z.debug('Zotero.State.popTag', 3);
    var state = this;
    if (!state.pathVars['tag']) {
        return;
    } else if (state.pathVars['tag'] instanceof Array) {
        var newTagArray = state.pathVars['tag'].filter(function (element, index, array) {
            return element != oldtag;
        });
        state.pathVars['tag'] = newTagArray;
        return;
    } else if (state.pathVars['tag'] == oldtag) {
        state.pathVars['tag'] = [];
        return;
    }
};

Zotero.State.prototype.toggleTag = function (tagtitle) {
    Z.debug('Zotero.State.toggleTag', 3);
    var state = this;
    if (!state.pathVars['tag']) {
        state.pathVars['tag'] = [tagtitle];
        return;
    } else if (J.isArray(state.pathVars['tag'])) {
        if (J.inArray(tagtitle, state.pathVars['tag']) != -1) {
            var newTagArray = state.pathVars['tag'].filter(function (element, index, array) {
                return element != tagtitle;
            });
            state.pathVars['tag'] = newTagArray;
            return;
        } else {
            state.pathVars['tag'].push(tagtitle);
            return;
        }
    } else if (state.pathVars['tag'] == tagtitle) {
        state.pathVars['tag'] = [];
        return;
    } else if (typeof state.pathVars['tag'] == 'string') {
        var oldValue = state.pathVars['tag'];
        state.pathVars['tag'] = [oldValue, tagtitle];
        return;
    }
};

Zotero.State.prototype.unsetUrlVar = function (unset) {
    Z.debug("Zotero.State.unsetUrlVar", 3);
    var state = this;
    if (state.pathVars[unset]) {
        delete state.pathVars[unset];
    }
};

Zotero.State.prototype.clearUrlVars = function (except) {
    Z.debug("Zotero.State.clearUrlVars", 3);
    var state = this;
    if (!except) {
        except = [];
    }
    var pathVars = state.pathVars;
    J.each(pathVars, function (key, value) {
        if (J.inArray(key, except) == -1) {
            delete pathVars[key];
        }
    });
};

Zotero.State.prototype.parseUrlVars = function () {
    Z.debug('Zotero.State.parseUrlVars', 3);
    var state = this;
    if (!state.useLocation) return;
    state.q = Zotero.utils.parseQuery(Zotero.utils.querystring(window.location.href));
    state.pathVars = state.parsePathVars();
};

Zotero.State.prototype.parsePathVars = function (pathname) {
    Z.debug('Zotero.State.parsePathVars', 3);
    var state = this;
    var history = window.history;
    //parse variables out of library urls
    //:userslug/items/:itemKey/*
    //:userslug/items/collection/:collectionKey
    //groups/:groupidentifier/items/:itemKey/*
    //groups/:groupidentifier/items/collection/:collectionKey/*
    if (!pathname) {
        //var hstate = history.state;// History.getState();
        pathname = window.location.pathname;
    }
    var basePath = Zotero.config.nonparsedBaseUrl;
    basePath = basePath.replace(window.location.origin, "");
    var split_replaced = [];
    var re = new RegExp(".*" + basePath + "\/?");
    var replaced = pathname.replace(re, '');

    split_replaced = replaced.split('/');

    var pathVars = {};
    for (var i = 0; i < split_replaced.length - 1; i = i + 2) {
        var pathVar = pathVars[split_replaced[i]];
        //if var already present change to array and/or push
        if (pathVar) {
            if (pathVar instanceof Array) {
                pathVar.push(decodeURIComponent(split_replaced[i + 1]));
            } else {
                var ar = [pathVar];
                ar.push(decodeURIComponent(split_replaced[i + 1]));
                pathVar = ar;
            }
        }
        //otherwise just set the value in the object
        else {
                pathVar = decodeURIComponent(split_replaced[i + 1]);
            }
        pathVars[split_replaced[i]] = pathVar;
    }
    if (pathVars['itemkey']) {
        var itemKey = pathVars['itemkey'];
        pathVars['itemKey'] = itemKey;
        delete pathVars['itemkey'];
    }
    return pathVars;
};

Zotero.State.prototype.buildUrl = function (urlvars, queryVars) {
    var state = this;
    //Z.debug("Zotero.State.buildUrl", 3);
    if (typeof queryVars === 'undefined') {
        queryVars = false;
    }
    var basePath = Zotero.config.nonparsedBaseUrl + '/';

    var urlVarsArray = [];
    J.each(urlvars, function (index, value) {
        if (!value) {
            return;
        } else if (value instanceof Array) {
            J.each(value, function (i, v) {
                urlVarsArray.push(index + '/' + encodeURIComponent(v));
            });
        } else {
            urlVarsArray.push(index + '/' + encodeURIComponent(value));
        }
    });
    urlVarsArray.sort();

    var queryVarsArray = [];
    J.each(queryVars, function (index, value) {
        if (!value) {
            return;
        } else if (value instanceof Array) {
            J.each(value, function (i, v) {
                queryVarsArray.push(index + '=' + encodeURIComponent(v));
            });
        } else {
            queryVarsArray.push(index + '=' + encodeURIComponent(value));
        }
    });
    queryVarsArray.sort();

    var pathVarsString = urlVarsArray.join('/');
    var queryString = '';
    if (queryVarsArray.length) {
        queryString = '?' + queryVarsArray.join("&");
    }
    var url = basePath + pathVarsString + queryString;

    return url;
};

//addvars is an object mapping keys and values to add
//removevars is an array of var keys to remove
Zotero.State.prototype.mutateUrl = function (addvars, removevars) {
    var state = this;
    //Z.debug("Zotero.State.mutateUrl", 3);
    if (!addvars) {
        addvars = {};
    }
    if (!removevars) {
        removevars = [];
    }

    var urlvars = J.extend({}, state.pathVars);
    J.each(addvars, function (key, val) {
        urlvars[key] = val;
    });
    J.each(removevars, function (index, val) {
        delete urlvars[val];
    });

    var url = state.buildUrl(urlvars, false);
    //Z.debug("mutated Url:" + url, 3);

    return url;
};

Zotero.State.prototype.pushState = function () {
    Z.debug('Zotero.State.pushState', 3);
    var state = this;
    var history = window.history;

    //Zotero.ui.saveFormData();
    //make prevHref the current location before we change it
    state.prevHref = state.curHref || window.location.href;

    //selectively add state to hint where to go
    var s = J.extend({}, state.q, state.pathVars);

    var urlvars = state.pathVars;
    var queryVars = state.q;
    var url = state.buildUrl(urlvars, queryVars, false);
    state.curHref = url;
    Z.debug("about to push url: " + url, 3);
    //actually push state and manually call urlChangeCallback if specified
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

Zotero.State.prototype.replaceState = function () {
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

    if (state.useLocation) {
        history.replaceState(s, null, url);
        state.curHref = url;
    } else {
        state.curHref = url;
    }
};

Zotero.State.prototype.updateStateTitle = function (title) {
    Zotero.debug("Zotero.State.updateStateTitle", 3);
    var state = this;

    document.title = title;
};

Zotero.State.prototype.getUrlVar = function (key) {
    var state = this;
    if (state.pathVars.hasOwnProperty(key) && state.pathVars[key] !== '') {
        return state.pathVars[key];
    } else if (state.q.hasOwnProperty(key)) {
        return state.q[key];
    }
    return undefined;
};

Zotero.State.prototype.setUrlVar = function (key, val) {
    var state = this;
    state.pathVars[key] = val;
};

Zotero.State.prototype.getUrlVars = function () {
    var state = this;
    var params = Zotero.utils.parseQuery(Zotero.utils.querystring(window.location.href));
    return J.extend(true, {}, state.pathVars, params);
};

Zotero.State.prototype.setQueryVar = function (key, val) {
    var state = this;
    if (val === '') {
        delete state.q[key];
    } else {
        state.q[key] = val;
    }
};

Zotero.State.prototype.addQueryVar = function (key, val) {
    var state = this;
    if (state.q.hasOwnProperty(key)) {
        //property exists
        if (J.isArray(state.q[key])) {
            state.q[key].push(val);
        } else {
            var newArray = [state.q[key], val];
            state.q[key] = newArray;
        }
    } else {
        //no value for that key yet
        state.q[key] = val;
    }
    return state.q[key];
};

Zotero.State.prototype.popstateCallback = function (evt) {
    var state = this;
    Z.debug("===== popstateCallback =====", 3);
    var history = window.history;
    state.prevHref = state.curHref;

    Z.debug("new href, updating href and processing urlchange", 3);
    state.curHref = window.location.href; // History.getState().cleanUrl;

    //reparse url to set vars in Z.ajax
    state.parseUrlVars();
    state.stateChanged(evt);
};

Zotero.State.prototype.stateChanged = function (event) {
    var state = this;
    Z.debug("stateChanged", 3);
    state.savePrevState();
    state.updateCurState();
    //check for changed variables in the url and fire events for them
    Z.debug("Checking changed variables", 3);
    var changedVars = state.diffState(state.prevHref, state.curHref);
    var widgetEvents = {};
    J.each(changedVars, function (ind, val) {
        var eventString = val + "Changed";
        Z.debug(eventString, 3);
        //map var events to widget events
        if (Zotero.eventful.eventMap.hasOwnProperty(eventString)) {
            J.each(Zotero.eventful.eventMap[eventString], function (ind, val) {
                if (!widgetEvents.hasOwnProperty(val)) {
                    widgetEvents[val] = 1;
                }
            });
        }
        Z.debug("State Filter: " + state.filter, 3);
        Zotero.trigger(eventString, {}, state.filter);
    });
    //TODO: is this eventMap triggering necessary?

    J.each(widgetEvents, function (ind, val) {
        Z.debug("State Filter: " + state.filter, 3);

        Zotero.trigger(ind, {}, state.filter);
    });

    Z.debug("===== stateChanged Done =====", 3);
};

Zotero.State.prototype.diffState = function (prevHref, curHref) {
    Z.debug("Zotero.State.diffState", 3);
    var state = this;
    //check what has changed when a new state is pushed
    var prevVars = J.extend({}, state.parsePathVars(prevHref));
    var curVars = J.extend({}, state.parsePathVars(curHref));

    var monitoredVars = ['start', 'limit', 'order', 'sort', 'content', 'format', 'q', 'fq', 'itemType', 'itemKey', 'collectionKey', 'searchKey', 'locale', 'tag', 'tagType', 'key', 'style', 'session', 'newer', 'since', 'itemPage', 'mode'];
    var changedVars = [];
    J.each(monitoredVars, function (ind, val) {
        if (prevVars.hasOwnProperty(val) || curVars.hasOwnProperty(val)) {
            if (prevVars[val] != curVars[val]) {
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
/*
Zotero.State.prototype.bindTagLinks = function(container){
    return;
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
*/
/**
 * Bind item links to take alter current state instead of following link
 * @return {undefined}
 */
/*
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
        if(e.ctrlKey){
            state.toggleItemSelected(itemKey);
            Zotero.trigger("selectedItemsChanged");
        } else {
            state.pathVars.itemKey = itemKey;
            state.pushState();
        }
    });
};
*/
"use strict";

//return a promise that will resolve after mseconds milliseconds
Zotero.Delay = function (mseconds) {
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            resolve();
        }, mseconds);
    });
};
"use strict";

Zotero.widgets = {};
Zotero.eventful = {};

Zotero.eventful.events = ["collectionsDirty", //collections have been updated and should be synced
"tagsChanged", //library.tags has been updated in some way
"displayedItemsChanged", //filters for items list have changed
"displayedItemChanged", //item selected for detailed view has changed
"selectedItemsChanged", //items selected by checkbox for action have changed
"showCitations", //request to show the citations for currently selected items
"showSettings", //request to show settings panel
"exportItems", //request to export currently selected items
"libraryTagsUpdated", "uploadSuccessful", "refreshGroups", "clearLibraryQuery", "libraryItemsUpdated", "citeItems", "itemTypeChanged", "addTag", "showChildren", "selectCollection", "selectedCollectionChanged", "libraryCollectionsUpdated", "loadItemsDone", "collectionsChanged", "tagsChanged", "itemsChanged", "loadedCollectionsProcessed", "deleteProgress", "settingsLoaded", "cachedDataLoaded",
//eventfultriggers:
"createItem", "newItem", "addToCollectionDialog", "removeFromCollection", "moveToTrash", "removeFromTrash", "toggleEdit", "clearLibraryQuery", "librarySettingsDialog", "citeItems", "exportItemsDialog", "syncLibrary", "createCollectionDialog", "updateCollectionDialog", "deleteCollectionDialog", "showMoreTags", "showFewerTags", "indexedDBError"];

Zotero.eventful.eventMap = {
    "orderChanged": ["displayedItemsChanged"],
    "sortChanged": ["displayedItemsChanged"],
    "collectionKeyChanged": ["displayedItemsChanged", "selectedCollectionChanged"],
    "qChanged": ["displayedItemsChanged"],
    "tagChanged": ["displayedItemsChanged", "selectedTagsChanged"],
    "itemPageChanged": ["displayedItemsChanged"],
    "itemKeyChanged": ["displayedItemChanged"]
};

Zotero.eventful.initWidgets = function () {
    Zotero.state.parsePathVars();

    J(".eventfulwidget").each(function (ind, el) {
        var widgetName = J(el).data("widget");
        if (widgetName && Zotero.ui.widgets[widgetName]) {
            if (Zotero.ui.widgets[widgetName]['init']) {
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
Zotero.eventful.initTriggers = function (el) {
    Zotero.debug("Zotero.eventful.initTriggers", 3);
    if (!el) {
        el = J("html");
    }
    //initialize elements that have data-triggers info to trigger that event
    var triggerOnEvent = function triggerOnEvent(event) {
        Z.debug("triggerOnEvent", 3);
        event.preventDefault();
        var jel = J(event.delegateTarget);
        var eventName = jel.data("triggers");
        Z.debug("eventName: " + eventName, 3);
        var filter = jel.data('library') || "";

        Zotero.trigger(eventName, { triggeringElement: event.currentTarget }, filter);
    };

    J(el).find(".eventfultrigger").each(function (ind, el) {
        if (J(el).data('triggerbound')) {
            return;
        }
        var ev = J(el).data("event");

        if (ev) {
            Z.debug("binding " + ev + " on " + el.tagName, 3);
            J(el).on(ev, triggerOnEvent);
        } else {
            //Z.debug("binding click trigger on " + el.tagName, 3);
            //default to triggering on click
            J(el).on("click", triggerOnEvent);
        }
        J(el).data('triggerbound', true);
    });
};
"use strict";

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

/**
 * Format an item field for display
 * @param  {string} field item field name
 * @param  {Zotero_Item} item  Zotero Item
 * @param  {boolean} trim  Trim output to limit length
 * @return {string}
 */
Zotero.ui.formatItemField = function (field, item, trim) {
    if (typeof trim == 'undefined') {
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
    if (window.Intl) {
        var dateFormatter = new window.Intl.DateTimeFormat(undefined, intlOptions);
        formatDate = dateFormatter.format;
    } else {
        formatDate = function (date) {
            return date.toLocaleString();
        };
    }

    var trimLength = 0;
    var formattedString = '';
    var date;
    if (Zotero.config.maxFieldSummaryLength[field]) {
        trimLength = Zotero.config.maxFieldSummaryLength[field];
    }
    switch (field) {
        case "itemType":
            formattedString = Zotero.localizations.typeMap[item.apiObj.data.itemType];
            break;
        case "dateModified":
            if (!item.apiObj.data['dateModified']) {
                formattedString = '';
            }
            date = Zotero.utils.parseApiDate(item.apiObj.data['dateModified']);
            if (date) {
                formattedString = formatDate(date);
            } else {
                formattedString = item.apiObj.data['dateModified'];
            }
            break;
        case "dateAdded":
            if (!item.apiObj.data['dateAdded']) {
                formattedString = '';
            }
            date = Zotero.utils.parseApiDate(item.apiObj.data['dateAdded']);
            if (date) {
                formattedString = formatDate(date);
            } else {
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
            if (item.apiObj.meta.createdByUser) {
                if (item.apiObj.meta.createdByUser.name !== '') {
                    formattedString = item.apiObj.meta.createdByUser.name;
                } else {
                    formattedString = item.apiObj.meta.createdByUser.username;
                }
            }
            break;
        case "modifiedBy":
            if (item.apiObj.meta.lastModifiedByUser) {
                if (item.apiObj.meta.lastModifiedByUser.name !== '') {
                    formattedString = item.apiObj.meta.lastModifiedByUser.name;
                } else {
                    formattedString = item.apiObj.meta.lastModifiedByUser.username;
                }
            }
            break;
        default:
            var t = _typeof(item.get(field));
            if (typeof t !== "undefined") {
                formattedString = item.get(field);
            }
    }
    if (typeof formattedString == 'undefined') {
        Z.error("formattedString for " + field + " undefined");
        Z.error(item);
    }
    if (trim) {
        return Zotero.ui.trimString(formattedString, trimLength);
    } else {
        return formattedString;
    }
};

/**
 * Trim string to specified length and add ellipsis
 * @param  {string} s      string to trim
 * @param  {int} maxlen maximum length to allow for string
 * @return {string}
 */
Zotero.ui.trimString = function (s, maxlen) {
    var trimLength = 35;
    var formattedString = s;
    if (typeof s == 'undefined') {
        Z.error("formattedString passed to trimString was undefined.");
        return '';
    }
    if (maxlen) {
        trimLength = maxlen;
    }
    if (trimLength > 0 && formattedString.length > trimLength) {
        return formattedString.slice(0, trimLength) + '…';
    } else {
        return formattedString;
    }
};

/**
 * Format a date field from a Zotero Item based on locale
 * @param  {string} field field name to format
 * @param  {Zotero_Item} item  Zotero Item owning the field
 * @return {string}
 */
Zotero.ui.formatItemDateField = function (field, item) {
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
    if (window.Intl) {
        var dateFormatter = new window.Intl.DateTimeFormat(undefined, intlOptions);
        formatDate = dateFormatter.format;
        var timeFormatter = new window.Intl.DateTimeFormat(undefined, timeOptions);
        formatTime = timeFormatter.format;
    } else {
        formatDate = function (date) {
            return date.toLocaleDateString();
        };
        formatTime = function (date) {
            return date.toLocaleTimeString();
        };
    }

    switch (field) {
        case "dateModified":
            if (!item.apiObj.data['dateModified']) {
                return '';
            }
            date = Zotero.utils.parseApiDate(item.apiObj.data['dateModified']);
            if (date) {
                return "<span class='localized-date-span'>" + formatDate(date) + "</span> <span class='localized-date-span'>" + formatTime(date) + "</span>";
            } else {
                return item.apiObj.data['dateModified'];
            }
            return date.toLocaleString();
        case "dateAdded":
            if (!item.apiObj.data['dateAdded']) {
                return '';
            }
            date = Zotero.utils.parseApiDate(item.apiObj.data['dateAdded']);
            if (date) {
                return "<span class='localized-date-span'>" + formatDate(date) + "</span> <span class='localized-date-span'>" + formatTime(date) + "</span>";
            } else {
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
Zotero.ui.formatItemContentRow = function (contentRow) {
    if (contentRow.field == 'date') {
        if (!contentRow.fieldValue) {
            return '';
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

Zotero.ui.groupUrl = function (group, route) {
    var groupBase;
    if (group.groupType == 'Private') {
        groupBase = '/groups/' + group.groupID;
    } else {
        groupBase = '/groups/' + Zotero.utils.slugify(group.groupName);
    }
    var groupIDBase = '/groups/' + group.groupID;
    Zotero.debug("groupBase: " + groupBase);
    switch (route) {
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
"use strict";

Zotero.ui.init = {};
Zotero.ui.widgets = {};

//initialize ui
Zotero.ui.init.all = function () {
    //run UI initialization based on what page we're on
    Z.debug("ui init based on page", 3);
    switch (Zotero.config.pageClass) {
        case "my_library":
        case "user_library":
        case "group_library":
            Zotero.ui.init.library();
            break;
        case "default":
    }
    //Zotero.ui.init.libraryTemplates();
    Zotero.eventful.initWidgets();
    Zotero.ui.init.rte();
};

Zotero.ui.init.library = function () {
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

Zotero.ui.init.rte = function (type, autofocus, container) {
    Z.debug("init.rte", 3);
    if (Zotero.config.rte == 'ckeditor') {
        Zotero.ui.init.ckeditor(type, autofocus, container);
        return;
    } else {
        Zotero.ui.init.tinyMce(type, autofocus, container);
    }
};

Zotero.ui.init.ckeditor = function (type, autofocus, container) {
    Z.debug('init.ckeditor', 3);
    if (!type) {
        type = 'default';
    }
    if (!container) {
        container = J('body');
    }

    var ckconfig = {};
    ckconfig.toolbarGroups = [{ name: 'clipboard', groups: ['clipboard', 'undo'] },
    //{ name: 'editing',     groups: [ 'find', 'selection' ] },
    { name: 'links' }, { name: 'insert' }, { name: 'forms' }, { name: 'tools' }, { name: 'document', groups: ['mode', 'document', 'doctools'] }, { name: 'others' }, '/', { name: 'basicstyles', groups: ['basicstyles', 'cleanup'] }, { name: 'paragraph', groups: ['list', 'indent', 'blocks', 'align'] }, { name: 'styles' }, { name: 'colors' }, { name: 'about' }];

    var nolinksckconfig = {};
    nolinksckconfig.toolbarGroups = [{ name: 'clipboard', groups: ['clipboard', 'undo'] }, { name: 'editing', groups: ['find', 'selection'] }, { name: 'insert' }, { name: 'forms' }, { name: 'tools' }, { name: 'document', groups: ['mode', 'document', 'doctools'] }, { name: 'others' }, '/', { name: 'basicstyles', groups: ['basicstyles', 'cleanup'] }, { name: 'paragraph', groups: ['list', 'indent', 'blocks', 'align'] }, { name: 'styles' }, { name: 'colors' }, { name: 'about' }];
    var readonlyckconfig = {};
    readonlyckconfig.toolbarGroups = [];
    readonlyckconfig.readOnly = true;

    var config;
    if (type == 'nolinks') {
        config = J.extend(true, {}, nolinksckconfig);
    } else if (type == 'readonly') {
        config = J.extend(true, {}, readonlyckconfig);
    } else {
        config = J.extend(true, {}, ckconfig);
    }
    if (autofocus) {
        config.startupFocus = true;
    }

    Z.debug("initializing CK editors", 3);
    if (J(container).is('.rte')) {
        Z.debug("RTE textarea - " + " - " + J(container).attr('name'), 3);
        var edName = J(container).attr('name');
        if (!CKEDITOR.instances[edName]) {
            var editor = CKEDITOR.replace(J(container), config);
        }
    } else {
        Z.debug("not a direct rte init");
        Z.debug(container);
        J(container).find("textarea.rte").each(function (ind, el) {
            Z.debug("RTE textarea - " + ind + " - " + J(el).attr('name'), 3);
            var edName = J(el).attr('name');
            if (!CKEDITOR.instances[edName]) {
                var editor = CKEDITOR.replace(el, config);
            }
        });
    }
};

Zotero.ui.init.tinyMce = function (type, autofocus, elements) {
    Z.debug('init.tinyMce', 3);
    if (!type) {
        type = 'default';
    }
    var mode = 'specific_textareas';
    if (elements) {
        mode = 'exact';
    } else {
        elements = '';
    }

    var tmceConfig = {
        //script_url : '/static/library/tinymce_jquery/jscripts/tiny_mce/tiny_mce.js',
        mode: mode,
        elements: elements,
        theme: "advanced",
        //plugins : "pagebreak,style,layer,table,save,advhr,advimage,advlink,emotions,iespell,inlinepopups,insertdatetime,preview,media,searchreplace,print,contextmenu,paste,directionality,fullscreen,visualchars,nonbreaking,xhtmlxtras,template",
        //plugins : "pagebreak,style,layer,table,advhr,advimage,advlink,preview,searchreplace,paste",

        theme_advanced_toolbar_location: "top",
        theme_advanced_buttons1: "bold,italic,underline,strikethrough,separator,sub,sup,separator,forecolorpicker,backcolorpicker,separator,blockquote,separator,link,unlink",
        theme_advanced_buttons2: "formatselect,separator,justifyleft,justifycenter,justifyright,separator,bullist,numlist,outdent,indent,separator,removeformat,code,",
        theme_advanced_buttons3: "",
        theme_advanced_toolbar_align: "left",
        theme_advanced_statusbar_location: 'bottom',
        theme_advanced_resizing: true,
        relative_urls: false,
        //width: '500',
        //height: '300',
        editor_selector: 'default'
    };

    if (autofocus) {
        tmceConfig.init_instance_callback = function (inst) {
            Z.debug("inited " + inst.editorId);
            inst.focus();
        };
    }

    if (type != 'nolinks') {
        tmceConfig.theme_advanced_buttons1 += ',link';
    }

    if (type == 'nolinks') {
        tmceConfig.editor_selector = 'nolinks';
    }

    if (type == 'readonly') {
        tmceConfig.readonly = 1;
        tmceConfig.editor_selector = 'readonly';
    }

    tinymce.init(tmceConfig);
    return tmceConfig;
};

Zotero.ui.init.libraryTemplates = function () {
    /*
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
    */
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
"use strict";

/**
 * Update a Zotero_Item object from the current values of an edit item form
 * @param  {Zotero_Item} item   Zotero item to update
 * @param  {Dom Form} formEl edit item form to take values from
 * @return {bool}
 */
/*
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
*/

/*
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
*/

Zotero.ui.saveItem = function (item) {
    //var requestData = JSON.stringify(item.apiObj);
    Z.debug("pre writeItem debug", 4);
    Z.debug(item, 4);
    //show spinner before making ajax write call
    var library = item.owningLibrary;
    var writeResponse = item.writeItem().then(function (writtenItems) {
        Z.debug("item write finished", 3);
        //check for errors, update nav
        if (item.writeFailure) {
            Z.error("Error writing item:" + item.writeFailure.message);
            Zotero.ui.jsNotificationMessage('Error writing item', 'error');
            throw new Error("Error writing item:" + item.writeFailure.message);
        }
    });

    //update list of tags we have if new ones added
    Z.debug('adding new tags to library tags', 3);
    var libTags = library.tags;
    var tags = item.apiObj.data.tags;
    J.each(tags, function (index, tagOb) {
        var tagString = tagOb.tag;
        if (!libTags.tagObjects.hasOwnProperty(tagString)) {
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
Zotero.ui.itemTypeClass = function (item) {
    var itemTypeClass = item.apiObj.data.itemType;
    if (item.apiObj.data.itemType == 'attachment') {
        if (item.mimeType == 'application/pdf') {
            itemTypeClass += '-pdf';
        } else {
            switch (item.linkMode) {
                case 0:
                    itemTypeClass += '-file';break;
                case 1:
                    itemTypeClass += '-file';break;
                case 2:
                    itemTypeClass += '-snapshot';break;
                case 3:
                    itemTypeClass += '-web-link';break;
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
Zotero.ui.getAssociatedLibrary = function (el) {
    Z.debug("Zotero.ui.getAssociatedLibrary", 3);
    var jel;
    if (typeof el == 'undefined') {
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
    //get Zotero.Library object if already bound to element
    var library = jel.data('zoterolibrary');
    var libString;
    if (!library) {
        //try getting it from a libraryString included on DOM element
        libString = J(el).data('library');
        if (libString) {
            library = Zotero.ui.libStringLibrary(libString);
        }
        jel.data('zoterolibrary', library);
    }
    //if we still don't have a library, look for the default library for the page
    if (!library) {
        jel = J(".zotero-library").first();
        libString = jel.data('library');
        if (libString) {
            library = Zotero.ui.libStringLibrary(libString);
        }
    }
    if (!library) {
        Z.error("No associated library found");
    }
    return library;
};

Zotero.ui.libStringLibrary = function (libString) {
    var library;
    if (Zotero.libraries.hasOwnProperty(libString)) {
        library = Zotero.libraries[libString];
    } else {
        var libConfig = Zotero.utils.parseLibString(libString);
        library = new Zotero.Library(libConfig.libraryType, libConfig.libraryID);
        Zotero.libraries[libString] = library;
    }
    return library;
};

Zotero.ui.getEventLibrary = function (e) {
    var tel = J(e.triggeringElement);
    if (e.library) {
        return e.library;
    }
    if (e.data && e.data.library) {
        return e.data.library;
    }
    Z.debug(e);
    var libString = tel.data('library');
    if (!libString) {
        throw "no library on event or libString on triggeringElement";
    }
    if (Zotero.libraries.hasOwnProperty(libString)) {
        return Zotero.libraries[libString];
    }

    var libConfig = Zotero.ui.parseLibString(libString);
    var library = new Zotero.Library(libConfig.libraryType, libConfig.libraryID, '');
    Zotero.libraries[Zotero.utils.libraryString(libConfig.libraryType, libConfig.libraryID)] = library;
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
Zotero.ui.getPrioritizedVariable = function (key, defaultVal) {
    var val = Zotero.state.getUrlVar(key) || Zotero.preferences.getPref(key) || Zotero.config.defaultApiArgs[key] || defaultVal;
    return val;
};

/**
 * Scroll to the top of the window
 * @return {undefined}
 */
Zotero.ui.scrollToTop = function () {
    window.scrollBy(0, -5000);
};

//get the nearest ancestor that is eventfulwidget
Zotero.ui.parentWidgetEl = function (el) {
    var matching;
    if (el.hasOwnProperty('data') && el.data.hasOwnProperty('widgetEl')) {
        Z.debug("event had widgetEl associated with it");
        return J(el.data.widgetEl);
    } else if (el.hasOwnProperty('currentTarget')) {
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
"use strict";

/**
 * get a list of the itemKeys for items checked off in a form to know what items to operate on
 * if a single item is being displayed the form selections will be overridden
 * otherwise this function returns the data-itemkey values associated with input.itemKey-checkbox:checked
 * @param  {DOM element} container Container DOM Element to pull itemkey values from
 * @return {array}
 */
Zotero.ui.getSelectedItemKeys = function (container) {
    Z.debug("Zotero.ui.getSelectedItemKeys", 3);
    if (!container) {
        container = J("body");
    } else {
        container = J(container);
    }
    var itemKeys = [];
    var curItemKey = Zotero.state.getUrlVar('itemKey');
    if (curItemKey && Zotero.config.preferUrlItem !== false) {
        itemKeys.push(curItemKey);
    } else {
        container.find("input.itemKey-checkbox:checked").each(function (index, val) {
            itemKeys.push(J(val).data('itemkey'));
        });
    }
    return itemKeys;
};

Zotero.ui.getAllFormItemKeys = function (container) {
    Z.debug("Zotero.ui.getAllFormItemKeys", 3);
    if (!container) {
        container = J("body");
    } else {
        container = J(container);
    }
    var itemKeys = [];
    var curItemKey = Zotero.state.getUrlVar('itemKey');
    container.find("input.itemKey-checkbox").each(function (index, val) {
        itemKeys.push(J(val).data('itemkey'));
    });
    return itemKeys;
};

Zotero.ui.getRte = function (el) {
    Z.debug("getRte", 3);
    Z.debug("getRte", 3);
    Z.debug(el);
    switch (Zotero.config.rte) {
        case "ckeditor":
            //var elid = "#" + el;
            //var edname = J(elid).attr('id');
            //Z.debug("EdName: " + edname, 3);
            return CKEDITOR.instances[el].getData();
        default:
            return tinyMCE.get(el).getContent();
    }
};

Zotero.ui.updateRte = function (el) {
    Z.debug("updateRte", 3);
    switch (Zotero.config.rte) {
        case "ckeditor":
            var elid = "#" + el;
            var data = CKEDITOR.instances[el].getData();
            J(elid).val(data);
            break;
        default:
            tinyMCE.updateContent(el);
    }
};

Zotero.ui.deactivateRte = function (el) {
    Z.debug("deactivateRte", 3);
    switch (Zotero.config.rte) {
        case "ckeditor":
            //var elid = "#" + el;
            if (CKEDITOR.instances[el]) {
                Z.debug("deactivating " + el, 3);
                var data = CKEDITOR.instances[el].destroy();
            }
            break;
        default:
            tinymce.execCommand('mceRemoveControl', true, el);
    }
};

Zotero.ui.cleanUpRte = function (container) {
    Z.debug("cleanUpRte", 3);
    J(container).find("textarea.rte").each(function (ind, el) {
        Zotero.ui.deactivateRte(J(el).attr('name'));
    });
};
"use strict";

/**
 * Display a JS notification message to the user
 * @param  {string} message Notification message
 * @param  {string} type    confirm, notice, or error
 * @param  {int} timeout seconds to display notification
 * @return {undefined}
 */
Zotero.ui.jsNotificationMessage = function (message, type, timeout) {
    Z.debug("notificationMessage: " + type + " : " + message, 3);
    if (Zotero.config.suppressErrorNotifications) return;

    if (!timeout && timeout !== false) {
        timeout = 5;
    }
    var alertType = "alert-info";
    if (type) {
        switch (type) {
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

    if (timeout) {
        J("#js-message").append("<div class='alert alert-dismissable " + alertType + "'><button type='button' class='close' data-dismiss='alert'><span aria-hidden='true'>&times;</span><span class='sr-only'>Close</span></button>" + message + "</div>").children("div").delay(parseInt(timeout, 10) * 1000).slideUp().delay(300).queue(function () {
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
Zotero.ui.ajaxErrorMessage = function (jqxhr) {
    Z.debug("Zotero.ui.ajaxErrorMessage", 3);
    if (typeof jqxhr == 'undefined') {
        Z.debug('ajaxErrorMessage called with undefined argument');
        return '';
    }
    Z.debug(jqxhr, 3);
    switch (jqxhr.status) {
        case 403:
            //don't have permission to view
            if (Zotero.config.loggedIn || Zotero.config.ignoreLoggedInStatus) {
                return "You do not have permission to view this library.";
            } else {
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
Zotero.ui.showSpinner = function (el, type) {
    var spinnerUrl = Zotero.config.baseWebsiteUrl + '/static/images/theme/broken-circle-spinner.gif';
    if (!type) {
        J(el).html("<img class='spinner' src='" + spinnerUrl + "'/>");
    } else if (type == 'horizontal') {
        J(el).html("<img class='spinner' src='" + spinnerUrl + "'/>");
    }
};

/**
 * Append a preloader spinner to an element
 * @param  {Dom Element} el container
 * @return {undefined}
 */
Zotero.ui.appendSpinner = function (el) {
    var spinnerUrl = Zotero.config.baseWebsiteUrl + 'static/images/theme/broken-circle-spinner.gif';
    J(el).append("<img class='spinner' src='" + spinnerUrl + "'/>");
};

//Take a table that is present in the DOM, save the widths of the headers and the offset of the body,
//set the widths of the columns explicitly, set the header to position:fixed, set the offset of the body explictly
//this has the effect of fixed table headers with scrollable data
Zotero.ui.fixTableHeaders = function (tableEl) {
    var tel = J(tableEl);
    var colWidths = [];
    tel.find("thead th").each(function (ind, th) {
        var width = J(th).width();
        colWidths.push(width);
        J(th).width(width);
    });

    tel.find("tbody>tr:first>td").each(function (ind, td) {
        J(td).width(colWidths[ind]);
    });

    var bodyOffset = tel.find("thead").height();

    tel.find("thead").css('position', 'fixed').css('margin-top', -bodyOffset).css('background-color', 'white').css('z-index', 10);
    tel.find("tbody").css('margin-top', bodyOffset);
    tel.css("margin-top", bodyOffset);
};
'use strict';

/**
 * Trigger a ZoteroItemUpdated event on the document for zotero translators
 * @return {undefined}
 */
Zotero.ui.zoteroItemUpdated = function () {
    try {
        //trigger event for Zotero translator detection
        var ev = document.createEvent('HTMLEvents');
        ev.initEvent('ZoteroItemUpdated', true, true);
        document.dispatchEvent(ev);
    } catch (e) {
        Zotero.debug("Error triggering ZoteroItemUpdated event");
    }
};
"use strict";

//Bootstrap version
Zotero.ui.dialog = function (el, options) {
    Z.debug("Zotero.ui.dialog", 3);
    options.show = true;
    options.backdrop = false;
    J(el).modal(options);
    J(el).modal('show');
    Z.debug("exiting Zotero.ui.dialog", 3);
};

Zotero.ui.closeDialog = function (el) {
    J(el).modal('hide');
};
'use strict';

// @preserve jQuery.floatThead 1.3.2 - http://mkoryak.github.io/floatThead/ - Copyright (c) 2012 - 2015 Misha Koryak
// @license MIT

/* @author Misha Koryak
 * @projectDescription lock a table header in place while scrolling - without breaking styles or events bound to the header
 *
 * Dependencies:
 * jquery 1.9.0 + [required] OR jquery 1.7.0 + jquery UI core
 *
 * http://mkoryak.github.io/floatThead/
 *
 * Tested on FF13+, Chrome 21+, IE8, IE9, IE10, IE11
 *
 */
(function ($) {
  /**
   * provides a default config object. You can modify this after including this script if you want to change the init defaults
   * @type {Object}
   */
  $.floatThead = $.floatThead || {};
  $.floatThead.defaults = {
    headerCellSelector: 'tr:visible:first>*:visible', //thead cells are this.
    zIndex: 1001, //zindex of the floating thead (actually a container div)
    position: 'auto', // 'fixed', 'absolute', 'auto'. auto picks the best for your table scrolling type.
    top: 0, //String or function($table) - offset from top of window where the header should not pass above
    bottom: 0, //String or function($table) - offset from the bottom of the table where the header should stop scrolling
    scrollContainer: function scrollContainer($table) {
      return $([]); //if the table has horizontal scroll bars then this is the container that has overflow:auto and causes those scroll bars
    },
    getSizingRow: function getSizingRow($table, $cols, $fthCells) {
      // this is only called when using IE,
      // override it if the first row of the table is going to contain colgroups (any cell spans greater than one col)
      // it should return a jquery object containing a wrapped set of table cells comprising a row that contains no col spans and is visible
      return $table.find('tbody tr:visible:first>*:visible');
    },
    floatTableClass: 'floatThead-table',
    floatWrapperClass: 'floatThead-wrapper',
    floatContainerClass: 'floatThead-container',
    copyTableClass: true, //copy 'class' attribute from table into the floated table so that the styles match.
    enableAria: false, //will copy header text from the floated header back into the table for screen readers. Might cause the css styling to be off. beware!
    autoReflow: false, //(undocumented) - use MutationObserver api to reflow automatically when internal table DOM changes
    debug: false //print possible issues (that don't prevent script loading) to console, if console exists.
  };

  var util = window._;

  var canObserveMutations = typeof MutationObserver !== 'undefined';

  //browser stuff
  var ieVersion = (function () {
    for (var a = 3, b = document.createElement("b"), c = b.all || []; a = 1 + a, b.innerHTML = "<!--[if gt IE " + a + "]><i><![endif]-->", c[0];) {}return 4 < a ? a : document.documentMode;
  })();
  var isFF = /Gecko\//.test(navigator.userAgent);
  var isWebkit = /WebKit\//.test(navigator.userAgent);

  //safari 7 (and perhaps others) reports table width to be parent container's width if max-width is set on table. see: https://github.com/mkoryak/floatThead/issues/108
  var isTableWidthBug = function isTableWidthBug() {
    if (isWebkit) {
      var $test = $('<div style="width:0px"><table style="max-width:100%"><tr><th><div style="min-width:100px;">X</div></th></tr></table></div>');
      $("body").append($test);
      var ret = $test.find("table").width() == 0;
      $test.remove();
      return ret;
    }
    return false;
  };

  var createElements = !isFF && !ieVersion; //FF can read width from <col> elements, but webkit cannot

  var $window = $(window);

  /**
   * @param debounceMs
   * @param cb
   */
  function windowResize(eventName, cb) {
    if (ieVersion == 8) {
      //ie8 is crap: https://github.com/mkoryak/floatThead/issues/65
      var winWidth = $window.width();
      var debouncedCb = util.debounce(function () {
        var winWidthNew = $window.width();
        if (winWidth != winWidthNew) {
          winWidth = winWidthNew;
          cb();
        }
      }, 1);
      $window.on(eventName, debouncedCb);
    } else {
      $window.on(eventName, util.debounce(cb, 1));
    }
  }

  function debug(str) {
    window && window.console && window.console.error && window.console.error("jQuery.floatThead: " + str);
  }

  //returns fractional pixel widths
  function getOffsetWidth(el) {
    var rect = el.getBoundingClientRect();
    return rect.width || rect.right - rect.left;
  }

  /**
   * try to calculate the scrollbar width for your browser/os
   * @return {Number}
   */
  function scrollbarWidth() {
    var $div = $( //borrowed from anti-scroll
    '<div style="width:50px;height:50px;overflow-y:scroll;' + 'position:absolute;top:-200px;left:-200px;"><div style="height:100px;width:100%">' + '</div>');
    $('body').append($div);
    var w1 = $div.innerWidth();
    var w2 = $('div', $div).innerWidth();
    $div.remove();
    return w1 - w2;
  }
  /**
   * Check if a given table has been datatableized (http://datatables.net)
   * @param $table
   * @return {Boolean}
   */
  function isDatatable($table) {
    if ($table.dataTableSettings) {
      for (var i = 0; i < $table.dataTableSettings.length; i++) {
        var table = $table.dataTableSettings[i].nTable;
        if ($table[0] == table) {
          return true;
        }
      }
    }
    return false;
  }

  function tableWidth($table, $fthCells, isOuter) {
    // see: https://github.com/mkoryak/floatThead/issues/108
    var fn = isOuter ? "outerWidth" : "width";
    if (isTableWidthBug && $table.css("max-width")) {
      var w = 0;
      if (isOuter) {
        w += parseInt($table.css("borderLeft"), 10);
        w += parseInt($table.css("borderRight"), 10);
      }
      for (var i = 0; i < $fthCells.length; i++) {
        w += $fthCells.get(i).offsetWidth;
      }
      return w;
    } else {
      return $table[fn]();
    }
  }
  $.fn.floatThead = function (map) {
    map = map || {};
    if (!util) {
      //may have been included after the script? lets try to grab it again.
      util = window._ || $.floatThead._;
      if (!util) {
        throw new Error("jquery.floatThead-slim.js requires underscore. You should use the non-lite version since you do not have underscore.");
      }
    }

    if (ieVersion < 8) {
      return this; //no more crappy browser support.
    }

    var mObs = null; //mutation observer lives in here if we can use it / make it

    if (util.isFunction(isTableWidthBug)) {
      isTableWidthBug = isTableWidthBug();
    }

    if (util.isString(map)) {
      var command = map;
      var ret = this;
      this.filter('table').each(function () {
        var $this = $(this);
        var opts = $this.data('floatThead-lazy');
        if (opts) {
          $this.floatThead(opts);
        }
        var obj = $this.data('floatThead-attached');
        if (obj && util.isFunction(obj[command])) {
          var r = obj[command]();
          if (typeof r !== 'undefined') {
            ret = r;
          }
        }
      });
      return ret;
    }
    var opts = $.extend({}, $.floatThead.defaults || {}, map);

    $.each(map, function (key, val) {
      if (!(key in $.floatThead.defaults) && opts.debug) {
        debug("Used [" + key + "] key to init plugin, but that param is not an option for the plugin. Valid options are: " + util.keys($.floatThead.defaults).join(', '));
      }
    });
    if (opts.debug) {
      var v = $.fn.jquery.split(".");
      if (parseInt(v[0], 10) == 1 && parseInt(v[1], 10) <= 7) {
        debug("jQuery version " + $.fn.jquery + " detected! This plugin supports 1.8 or better, or 1.7.x with jQuery UI 1.8.24 -> http://jqueryui.com/resources/download/jquery-ui-1.8.24.zip");
      }
    }

    this.filter(':not(.' + opts.floatTableClass + ')').each(function () {
      var floatTheadId = util.uniqueId();
      var $table = $(this);
      if ($table.data('floatThead-attached')) {
        return true; //continue the each loop
      }
      if (!$table.is('table')) {
        throw new Error('jQuery.floatThead must be run on a table element. ex: $("table").floatThead();');
      }
      canObserveMutations = opts.autoReflow && canObserveMutations; //option defaults to false!
      var $header = $table.children('thead:first');
      var $tbody = $table.children('tbody:first');
      if ($header.length == 0 || $tbody.length == 0) {
        $table.data('floatThead-lazy', opts);
        $table.unbind("reflow").one('reflow', function () {
          $table.floatThead(opts);
        });
        return;
      }
      if ($table.data('floatThead-lazy')) {
        $table.unbind("reflow");
      }
      $table.data('floatThead-lazy', false);

      var headerFloated = true;
      var scrollingTop, scrollingBottom;
      var scrollbarOffset = { vertical: 0, horizontal: 0 };
      var scWidth = scrollbarWidth();
      var lastColumnCount = 0; //used by columnNum()
      var $scrollContainer = opts.scrollContainer($table) || $([]); //guard against returned nulls
      var locked = $scrollContainer.length > 0;

      var useAbsolutePositioning = null;
      if (typeof opts.useAbsolutePositioning !== 'undefined') {
        opts.position = 'auto';
        if (opts.useAbsolutePositioning) {
          opts.position = opts.useAbsolutePositioning ? 'absolute' : 'fixed';
        }
        debug("option 'useAbsolutePositioning' has been removed in v1.3.0, use `position:'" + opts.position + "'` instead. See docs for more info: http://mkoryak.github.io/floatThead/#options");
      }
      if (typeof opts.scrollingTop !== 'undefined') {
        opts.top = opts.scrollingTop;
        debug("option 'scrollingTop' has been renamed to 'top' in v1.3.0. See docs for more info: http://mkoryak.github.io/floatThead/#options");
      }
      if (typeof opts.scrollingBottom !== 'undefined') {
        opts.bottom = opts.scrollingBottom;
        debug("option 'scrollingBottom' has been renamed to 'bottom' in v1.3.0. See docs for more info: http://mkoryak.github.io/floatThead/#options");
      }

      if (opts.position == 'auto') {
        useAbsolutePositioning = null;
      } else if (opts.position == 'fixed') {
        useAbsolutePositioning = false;
      } else if (opts.position == 'absolute') {
        useAbsolutePositioning = true;
      } else if (opts.debug) {
        debug('Invalid value given to "position" option, valid is "fixed", "absolute" and "auto". You passed: ', opts.position);
      }

      if (useAbsolutePositioning == null) {
        //defaults: locked=true, !locked=false
        useAbsolutePositioning = locked;
      }
      var $caption = $table.find("caption");
      var haveCaption = $caption.length == 1;
      if (haveCaption) {
        var captionAlignTop = ($caption.css("caption-side") || $caption.attr("align") || "top") === "top";
      }

      var $fthGrp = $('<fthfoot style="display:table-footer-group;border-spacing:0;height:0;border-collapse:collapse;visibility:hidden"/>');

      var wrappedContainer = false; //used with absolute positioning enabled. did we need to wrap the scrollContainer/table with a relative div?
      var $wrapper = $([]); //used when absolute positioning enabled - wraps the table and the float container
      var absoluteToFixedOnScroll = ieVersion <= 9 && !locked && useAbsolutePositioning; //on IE using absolute positioning doesn't look good with window scrolling, so we change position to fixed on scroll, and then change it back to absolute when done.
      var $floatTable = $("<table/>");
      var $floatColGroup = $("<colgroup/>");
      var $tableColGroup = $table.children('colgroup:first');
      var existingColGroup = true;
      if ($tableColGroup.length == 0) {
        $tableColGroup = $("<colgroup/>");
        existingColGroup = false;
      }
      var $fthRow = $('<fthtr style="display:table-row;border-spacing:0;height:0;border-collapse:collapse"/>'); //created unstyled elements (used for sizing the table because chrome can't read <col> width)
      var $floatContainer = $('<div style="overflow: hidden;" aria-hidden="true"></div>');
      var floatTableHidden = false; //this happens when the table is hidden and we do magic when making it visible
      var $newHeader = $("<thead/>");
      var $sizerRow = $('<tr class="size-row"/>');
      var $sizerCells = $([]);
      var $tableCells = $([]); //used for sizing - either $sizerCells or $tableColGroup cols. $tableColGroup cols are only created in chrome for borderCollapse:collapse because of a chrome bug.
      var $headerCells = $([]);
      var $fthCells = $([]); //created elements

      $newHeader.append($sizerRow);
      $table.prepend($tableColGroup);
      if (createElements) {
        $fthGrp.append($fthRow);
        $table.append($fthGrp);
      }

      $floatTable.append($floatColGroup);
      $floatContainer.append($floatTable);
      if (opts.copyTableClass) {
        $floatTable.attr('class', $table.attr('class'));
      }
      $floatTable.attr({ //copy over some deprecated table attributes that people still like to use. Good thing people don't use colgroups...
        'cellpadding': $table.attr('cellpadding'),
        'cellspacing': $table.attr('cellspacing'),
        'border': $table.attr('border')
      });
      var tableDisplayCss = $table.css('display');
      $floatTable.css({
        'borderCollapse': $table.css('borderCollapse'),
        'border': $table.css('border'),
        'display': tableDisplayCss
      });
      if (tableDisplayCss == 'none') {
        floatTableHidden = true;
      }

      $floatTable.addClass(opts.floatTableClass).css({ 'margin': 0, 'border-bottom-width': 0 }); //must have no margins or you won't be able to click on things under floating table

      if (useAbsolutePositioning) {
        var makeRelative = function makeRelative($container, alwaysWrap) {
          var positionCss = $container.css('position');
          var relativeToScrollContainer = positionCss == "relative" || positionCss == "absolute";
          var $containerWrap = $container;
          if (!relativeToScrollContainer || alwaysWrap) {
            var css = { "paddingLeft": $container.css('paddingLeft'), "paddingRight": $container.css('paddingRight') };
            $floatContainer.css(css);
            $containerWrap = $container.data('floatThead-containerWrap') || $container.wrap("<div class='" + opts.floatWrapperClass + "' style='position: relative; clear:both;'></div>").parent();
            $container.data('floatThead-containerWrap', $containerWrap); //multiple tables inside one scrolling container - #242
            wrappedContainer = true;
          }
          return $containerWrap;
        };
        if (locked) {
          $wrapper = makeRelative($scrollContainer, true);
          $wrapper.prepend($floatContainer);
        } else {
          $wrapper = makeRelative($table);
          $table.before($floatContainer);
        }
      } else {
        $table.before($floatContainer);
      }

      $floatContainer.css({
        position: useAbsolutePositioning ? 'absolute' : 'fixed',
        marginTop: 0,
        top: useAbsolutePositioning ? 0 : 'auto',
        zIndex: opts.zIndex
      });
      $floatContainer.addClass(opts.floatContainerClass);
      updateScrollingOffsets();

      var layoutFixed = { 'table-layout': 'fixed' };
      var layoutAuto = { 'table-layout': $table.css('tableLayout') || 'auto' };
      var originalTableWidth = $table[0].style.width || ""; //setting this to auto is bad: #70
      var originalTableMinWidth = $table.css('minWidth') || "";

      function eventName(name) {
        return name + '.fth-' + floatTheadId + '.floatTHead';
      }

      function _setHeaderHeight() {
        var headerHeight = 0;
        $header.children("tr:visible").each(function () {
          headerHeight += $(this).outerHeight(true);
        });
        if ($table.css('border-collapse') == 'collapse') {
          var tableBorderTopHeight = parseInt($table.css('border-top-width'), 10);
          var cellBorderTopHeight = parseInt($table.find("thead tr:first").find(">*:first").css('border-top-width'), 10);
          if (tableBorderTopHeight > cellBorderTopHeight) {
            headerHeight -= tableBorderTopHeight / 2; //id love to see some docs where this magic recipe is found..
          }
        }
        $sizerRow.outerHeight(headerHeight);
        $sizerCells.outerHeight(headerHeight);
      }

      function setFloatWidth() {
        var tw = tableWidth($table, $fthCells, true);
        var width = $scrollContainer.width() || tw;
        var floatContainerWidth = $scrollContainer.css("overflow-y") != 'hidden' ? width - scrollbarOffset.vertical : width;
        $floatContainer.width(floatContainerWidth);
        if (locked) {
          var percent = 100 * tw / floatContainerWidth;
          $floatTable.css('width', percent + '%');
        } else {
          $floatTable.outerWidth(tw);
        }
      }

      function updateScrollingOffsets() {
        scrollingTop = (util.isFunction(opts.top) ? opts.top($table) : opts.top) || 0;
        scrollingBottom = (util.isFunction(opts.bottom) ? opts.bottom($table) : opts.bottom) || 0;
      }

      /**
       * get the number of columns and also rebuild resizer rows if the count is different than the last count
       */
      function columnNum() {
        var count;
        var $headerColumns = $header.find(opts.headerCellSelector);
        if (existingColGroup) {
          count = $tableColGroup.find('col').length;
        } else {
          count = 0;
          $headerColumns.each(function () {
            count += parseInt($(this).attr('colspan') || 1, 10);
          });
        }
        if (count != lastColumnCount) {
          lastColumnCount = count;
          var cells = [],
              cols = [],
              psuedo = [],
              content;
          for (var x = 0; x < count; x++) {
            if (opts.enableAria && (content = $headerColumns.eq(x).text())) {
              cells.push('<th scope="col" class="floatThead-col">' + content + '</th>');
            } else {
              cells.push('<th class="floatThead-col"/>');
            }
            cols.push('<col/>');
            psuedo.push("<fthtd style='display:table-cell;height:0;width:auto;'/>");
          }

          cols = cols.join('');
          cells = cells.join('');

          if (createElements) {
            psuedo = psuedo.join('');
            $fthRow.html(psuedo);
            $fthCells = $fthRow.find('fthtd');
          }

          $sizerRow.html(cells);
          $sizerCells = $sizerRow.find("th");
          if (!existingColGroup) {
            $tableColGroup.html(cols);
          }
          $tableCells = $tableColGroup.find('col');
          $floatColGroup.html(cols);
          $headerCells = $floatColGroup.find("col");
        }
        return count;
      }

      function refloat() {
        //make the thing float
        if (!headerFloated) {
          headerFloated = true;
          if (useAbsolutePositioning) {
            //#53, #56
            var tw = tableWidth($table, $fthCells, true);
            var wrapperWidth = $wrapper.width();
            if (tw > wrapperWidth) {
              $table.css('minWidth', tw);
            }
          }
          $table.css(layoutFixed);
          $floatTable.css(layoutFixed);
          $floatTable.append($header); //append because colgroup must go first in chrome
          $tbody.before($newHeader);
          _setHeaderHeight();
        }
      }
      function unfloat() {
        //put the header back into the table
        if (headerFloated) {
          headerFloated = false;
          if (useAbsolutePositioning) {
            //#53, #56
            $table.width(originalTableWidth);
          }
          $newHeader.detach();
          $table.prepend($header);
          $table.css(layoutAuto);
          $floatTable.css(layoutAuto);
          $table.css('minWidth', originalTableMinWidth); //this looks weird, but it's not a bug. Think about it!!
          $table.css('minWidth', tableWidth($table, $fthCells)); //#121
        }
      }
      var isHeaderFloatingLogical = false; //for the purpose of this event, the header is/isnt floating, even though the element
      //might be in some other state. this is what the header looks like to the user
      function triggerFloatEvent(isFloating) {
        if (isHeaderFloatingLogical != isFloating) {
          isHeaderFloatingLogical = isFloating;
          $table.triggerHandler("floatThead", [isFloating, $floatContainer]);
        }
      }
      function changePositioning(isAbsolute) {
        if (useAbsolutePositioning != isAbsolute) {
          useAbsolutePositioning = isAbsolute;
          $floatContainer.css({
            position: useAbsolutePositioning ? 'absolute' : 'fixed'
          });
        }
      }
      function getSizingRow($table, $cols, $fthCells, ieVersion) {
        if (createElements) {
          return $fthCells;
        } else if (ieVersion) {
          return opts.getSizingRow($table, $cols, $fthCells);
        } else {
          return $cols;
        }
      }

      /**
       * returns a function that updates the floating header's cell widths.
       * @return {Function}
       */
      function reflow() {
        var i;
        var numCols = columnNum(); //if the tables columns changed dynamically since last time (datatables), rebuild the sizer rows and get a new count

        return function () {
          $tableCells = $tableColGroup.find('col');
          var $rowCells = getSizingRow($table, $tableCells, $fthCells, ieVersion);

          if ($rowCells.length == numCols && numCols > 0) {
            if (!existingColGroup) {
              for (i = 0; i < numCols; i++) {
                $tableCells.eq(i).css('width', '');
              }
            }
            unfloat();
            var widths = [];
            for (i = 0; i < numCols; i++) {
              widths[i] = getOffsetWidth($rowCells.get(i));
            }
            for (i = 0; i < numCols; i++) {
              $headerCells.eq(i).width(widths[i]);
              $tableCells.eq(i).width(widths[i]);
            }
            refloat();
          } else {
            $floatTable.append($header);
            $table.css(layoutAuto);
            $floatTable.css(layoutAuto);
            _setHeaderHeight();
          }
          $table.triggerHandler("reflowed", [$floatContainer]);
        };
      }

      function floatContainerBorderWidth(side) {
        var border = $scrollContainer.css("border-" + side + "-width");
        var w = 0;
        if (border && ~border.indexOf('px')) {
          w = parseInt(border, 10);
        }
        return w;
      }
      /**
       * first performs initial calculations that we expect to not change when the table, window, or scrolling container are scrolled.
       * returns a function that calculates the floating container's top and left coords. takes into account if we are using page scrolling or inner scrolling
       * @return {Function}
       */
      function calculateFloatContainerPosFn() {
        var scrollingContainerTop = $scrollContainer.scrollTop();

        //this floatEnd calc was moved out of the returned function because we assume the table height doesn't change (otherwise we must reinit by calling calculateFloatContainerPosFn)
        var floatEnd;
        var tableContainerGap = 0;
        var captionHeight = haveCaption ? $caption.outerHeight(true) : 0;
        var captionScrollOffset = captionAlignTop ? captionHeight : -captionHeight;

        var floatContainerHeight = $floatContainer.height();
        var tableOffset = $table.offset();
        var tableLeftGap = 0; //can be caused by border on container (only in locked mode)
        var tableTopGap = 0;
        if (locked) {
          var containerOffset = $scrollContainer.offset();
          tableContainerGap = tableOffset.top - containerOffset.top + scrollingContainerTop;
          if (haveCaption && captionAlignTop) {
            tableContainerGap += captionHeight;
          }
          tableLeftGap = floatContainerBorderWidth('left');
          tableTopGap = floatContainerBorderWidth('top');
          tableContainerGap -= tableTopGap;
        } else {
          floatEnd = tableOffset.top - scrollingTop - floatContainerHeight + scrollingBottom + scrollbarOffset.horizontal;
        }
        var windowTop = $window.scrollTop();
        var windowLeft = $window.scrollLeft();
        var scrollContainerLeft = $scrollContainer.scrollLeft();

        return function (eventType) {
          var isTableHidden = $table[0].offsetWidth <= 0 && $table[0].offsetHeight <= 0;
          if (!isTableHidden && floatTableHidden) {
            floatTableHidden = false;
            setTimeout(function () {
              $table.triggerHandler("reflow");
            }, 1);
            return null;
          }
          if (isTableHidden) {
            //it's hidden
            floatTableHidden = true;
            if (!useAbsolutePositioning) {
              return null;
            }
          }

          if (eventType == 'windowScroll') {
            windowTop = $window.scrollTop();
            windowLeft = $window.scrollLeft();
          } else if (eventType == 'containerScroll') {
            scrollingContainerTop = $scrollContainer.scrollTop();
            scrollContainerLeft = $scrollContainer.scrollLeft();
          } else if (eventType != 'init') {
            windowTop = $window.scrollTop();
            windowLeft = $window.scrollLeft();
            scrollingContainerTop = $scrollContainer.scrollTop();
            scrollContainerLeft = $scrollContainer.scrollLeft();
          }
          if (isWebkit && (windowTop < 0 || windowLeft < 0)) {
            //chrome overscroll effect at the top of the page - breaks fixed positioned floated headers
            return;
          }

          if (absoluteToFixedOnScroll) {
            if (eventType == 'windowScrollDone') {
              changePositioning(true); //change to absolute
            } else {
                changePositioning(false); //change to fixed
              }
          } else if (eventType == 'windowScrollDone') {
              return null; //event is fired when they stop scrolling. ignore it if not 'absoluteToFixedOnScroll'
            }

          tableOffset = $table.offset();
          if (haveCaption && captionAlignTop) {
            tableOffset.top += captionHeight;
          }
          var top, left;
          var tableHeight = $table.outerHeight();

          if (locked && useAbsolutePositioning) {
            //inner scrolling, absolute positioning
            if (tableContainerGap >= scrollingContainerTop) {
              var gap = tableContainerGap - scrollingContainerTop + tableTopGap;
              top = gap > 0 ? gap : 0;
              triggerFloatEvent(false);
            } else {
              top = wrappedContainer ? tableTopGap : scrollingContainerTop;
              //headers stop at the top of the viewport
              triggerFloatEvent(true);
            }
            left = tableLeftGap;
          } else if (!locked && useAbsolutePositioning) {
            //window scrolling, absolute positioning
            if (windowTop > floatEnd + tableHeight + captionScrollOffset) {
              top = tableHeight - floatContainerHeight + captionScrollOffset; //scrolled past table
            } else if (tableOffset.top >= windowTop + scrollingTop) {
                top = 0; //scrolling to table
                unfloat();
                triggerFloatEvent(false);
              } else {
                top = scrollingTop + windowTop - tableOffset.top + tableContainerGap + (captionAlignTop ? captionHeight : 0);
                refloat(); //scrolling within table. header floated
                triggerFloatEvent(true);
              }
            left = 0;
          } else if (locked && !useAbsolutePositioning) {
            //inner scrolling, fixed positioning
            if (tableContainerGap > scrollingContainerTop || scrollingContainerTop - tableContainerGap > tableHeight) {
              top = tableOffset.top - windowTop;
              unfloat();
              triggerFloatEvent(false);
            } else {
              top = tableOffset.top + scrollingContainerTop - windowTop - tableContainerGap;
              refloat();
              triggerFloatEvent(true);
              //headers stop at the top of the viewport
            }
            left = tableOffset.left + scrollContainerLeft - windowLeft;
          } else if (!locked && !useAbsolutePositioning) {
            //window scrolling, fixed positioning
            if (windowTop > floatEnd + tableHeight + captionScrollOffset) {
              top = tableHeight + scrollingTop - windowTop + floatEnd + captionScrollOffset;
              //scrolled past the bottom of the table
            } else if (tableOffset.top > windowTop + scrollingTop) {
                top = tableOffset.top - windowTop;
                refloat();
                triggerFloatEvent(false); //this is a weird case, the header never gets unfloated and i have no no way to know
                //scrolled past the top of the table
              } else {
                  //scrolling within the table
                  top = scrollingTop;
                  triggerFloatEvent(true);
                }
            left = tableOffset.left - windowLeft;
          }
          return { top: top, left: left };
        };
      }
      /**
       * returns a function that caches old floating container position and only updates css when the position changes
       * @return {Function}
       */
      function repositionFloatContainerFn() {
        var oldTop = null;
        var oldLeft = null;
        var oldScrollLeft = null;
        return function (pos, setWidth, setHeight) {
          if (pos != null && (oldTop != pos.top || oldLeft != pos.left)) {
            $floatContainer.css({
              top: pos.top,
              left: pos.left
            });
            oldTop = pos.top;
            oldLeft = pos.left;
          }
          if (setWidth) {
            setFloatWidth();
          }
          if (setHeight) {
            _setHeaderHeight();
          }
          var scrollLeft = $scrollContainer.scrollLeft();
          if (!useAbsolutePositioning || oldScrollLeft != scrollLeft) {
            $floatContainer.scrollLeft(scrollLeft);
            oldScrollLeft = scrollLeft;
          }
        };
      }

      /**
       * checks if THIS table has scrollbars, and finds their widths
       */
      function calculateScrollBarSize() {
        //this should happen after the floating table has been positioned
        if ($scrollContainer.length) {
          if ($scrollContainer.data().perfectScrollbar) {
            scrollbarOffset = { horizontal: 0, vertical: 0 };
          } else {
            var sw = $scrollContainer.width(),
                sh = $scrollContainer.height(),
                th = $table.height(),
                tw = tableWidth($table, $fthCells);
            var offseth = sw < tw ? scWidth : 0;
            var offsetv = sh < th ? scWidth : 0;
            scrollbarOffset.horizontal = sw - offsetv < tw ? scWidth : 0;
            scrollbarOffset.vertical = sh - offseth < th ? scWidth : 0;
          }
        }
      }
      //finish up. create all calculation functions and bind them to events
      calculateScrollBarSize();

      var flow;

      var ensureReflow = function ensureReflow() {
        flow = reflow();
        flow();
      };

      ensureReflow();

      var calculateFloatContainerPos = calculateFloatContainerPosFn();
      var repositionFloatContainer = repositionFloatContainerFn();

      repositionFloatContainer(calculateFloatContainerPos('init'), true); //this must come after reflow because reflow changes scrollLeft back to 0 when it rips out the thead

      var windowScrollDoneEvent = util.debounce(function () {
        repositionFloatContainer(calculateFloatContainerPos('windowScrollDone'), false);
      }, 1);

      var windowScrollEvent = function windowScrollEvent() {
        repositionFloatContainer(calculateFloatContainerPos('windowScroll'), false);
        if (absoluteToFixedOnScroll) {
          windowScrollDoneEvent();
        }
      };
      var containerScrollEvent = function containerScrollEvent() {
        repositionFloatContainer(calculateFloatContainerPos('containerScroll'), false);
      };

      var windowResizeEvent = function windowResizeEvent() {
        if ($table.is(":hidden")) {
          return;
        }
        updateScrollingOffsets();
        calculateScrollBarSize();
        ensureReflow();
        calculateFloatContainerPos = calculateFloatContainerPosFn();
        repositionFloatContainer = repositionFloatContainerFn();
        repositionFloatContainer(calculateFloatContainerPos('resize'), true, true);
      };
      var reflowEvent = util.debounce(function () {
        if ($table.is(":hidden")) {
          return;
        }
        calculateScrollBarSize();
        updateScrollingOffsets();
        ensureReflow();
        calculateFloatContainerPos = calculateFloatContainerPosFn();
        repositionFloatContainer(calculateFloatContainerPos('reflow'), true);
      }, 1);
      if (locked) {
        //internal scrolling
        if (useAbsolutePositioning) {
          $scrollContainer.on(eventName('scroll'), containerScrollEvent);
        } else {
          $scrollContainer.on(eventName('scroll'), containerScrollEvent);
          $window.on(eventName('scroll'), windowScrollEvent);
        }
      } else {
        //window scrolling
        $window.on(eventName('scroll'), windowScrollEvent);
      }

      $window.on(eventName('load'), reflowEvent); //for tables with images

      windowResize(eventName('resize'), windowResizeEvent);
      $table.on('reflow', reflowEvent);
      if (isDatatable($table)) {
        $table.on('filter', reflowEvent).on('sort', reflowEvent).on('page', reflowEvent);
      }

      $window.on(eventName('shown.bs.tab'), reflowEvent); // people cant seem to figure out how to use this plugin with bs3 tabs... so this :P
      $window.on(eventName('tabsactivate'), reflowEvent); // same thing for jqueryui

      if (canObserveMutations) {
        var mutationElement = null;
        if (util.isFunction(opts.autoReflow)) {
          mutationElement = opts.autoReflow($table, $scrollContainer);
        }
        if (!mutationElement) {
          mutationElement = $scrollContainer.length ? $scrollContainer[0] : $table[0];
        }
        mObs = new MutationObserver(function (e) {
          var wasTableRelated = function wasTableRelated(nodes) {
            return nodes && nodes[0] && (nodes[0].nodeName == "THEAD" || nodes[0].nodeName == "TD" || nodes[0].nodeName == "TH");
          };
          for (var i = 0; i < e.length; i++) {
            if (!(wasTableRelated(e[i].addedNodes) || wasTableRelated(e[i].removedNodes))) {
              reflowEvent();
              break;
            }
          }
        });
        mObs.observe(mutationElement, {
          childList: true,
          subtree: true
        });
      }

      //attach some useful functions to the table.
      $table.data('floatThead-attached', {
        destroy: function destroy() {
          var ns = '.fth-' + floatTheadId;
          unfloat();
          $table.css(layoutAuto);
          $tableColGroup.remove();
          createElements && $fthGrp.remove();
          if ($newHeader.parent().length) {
            //only if it's in the DOM
            $newHeader.replaceWith($header);
          }
          if (canObserveMutations) {
            mObs.disconnect();
            mObs = null;
          }
          $table.off('reflow reflowed');
          $scrollContainer.off(ns);
          if (wrappedContainer) {
            if ($scrollContainer.length) {
              $scrollContainer.unwrap();
            } else {
              $table.unwrap();
            }
          }
          if (locked) {
            $scrollContainer.data('floatThead-containerWrap', false);
          } else {
            $table.data('floatThead-containerWrap', false);
          }
          $table.css('minWidth', originalTableMinWidth);
          $floatContainer.remove();
          $table.data('floatThead-attached', false);
          $window.off(ns);
        },
        reflow: function reflow() {
          reflowEvent();
        },
        setHeaderHeight: function setHeaderHeight() {
          _setHeaderHeight();
        },
        getFloatContainer: function getFloatContainer() {
          return $floatContainer;
        },
        getRowGroups: function getRowGroups() {
          if (headerFloated) {
            return $floatContainer.find('>table>thead').add($table.children("tbody,tfoot"));
          } else {
            return $table.children("thead,tbody,tfoot");
          }
        }
      });
    });
    return this;
  };
})(jQuery);

/* jQuery.floatThead.utils - http://mkoryak.github.io/floatThead/ - Copyright (c) 2012 - 2014 Misha Koryak
 * License: MIT
 *
 * This file is required if you do not use underscore in your project and you want to use floatThead.
 * It contains functions from underscore that the plugin uses.
 *
 * YOU DON'T NEED TO INCLUDE THIS IF YOU ALREADY INCLUDE UNDERSCORE!
 *
 */

(function ($) {

  $.floatThead = $.floatThead || {};

  $.floatThead._ = window._ || (function () {
    var that = {};
    var hasOwnProperty = Object.prototype.hasOwnProperty,
        isThings = ['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'];
    that.has = function (obj, key) {
      return hasOwnProperty.call(obj, key);
    };
    that.keys = function (obj) {
      if (obj !== Object(obj)) throw new TypeError('Invalid object');
      var keys = [];
      for (var key in obj) {
        if (that.has(obj, key)) keys.push(key);
      }return keys;
    };
    var idCounter = 0;
    that.uniqueId = function (prefix) {
      var id = ++idCounter + '';
      return prefix ? prefix + id : id;
    };
    $.each(isThings, function () {
      var name = this;
      that['is' + name] = function (obj) {
        return Object.prototype.toString.call(obj) == '[object ' + name + ']';
      };
    });
    that.debounce = function (func, wait, immediate) {
      var timeout, args, context, timestamp, result;
      return function () {
        context = this;
        args = arguments;
        timestamp = new Date();
        var later = function later() {
          var last = new Date() - timestamp;
          if (last < wait) {
            timeout = setTimeout(later, wait - last);
          } else {
            timeout = null;
            if (!immediate) result = func.apply(context, args);
          }
        };
        var callNow = immediate && !timeout;
        if (!timeout) {
          timeout = setTimeout(later, wait);
        }
        if (callNow) result = func.apply(context, args);
        return result;
      };
    };
    return that;
  })();
})(jQuery);
"use strict";

Zotero.ui.widgets.reactaddToCollectionDialog = {};

Zotero.ui.widgets.reactaddToCollectionDialog.init = function (el) {
	Z.debug("addtocollectionsdialog widget init", 3);
	var library = Zotero.ui.getAssociatedLibrary(el);
	var reactInstance = ReactDOM.render(React.createElement(AddToCollectionDialog, { library: library }), document.getElementById('add-to-collection-dialog'));
};

var AddToCollectionDialog = React.createClass({
	displayName: "AddToCollectionDialog",

	componentWillMount: function componentWillMount() {
		var reactInstance = this;
		var library = this.props.library;

		library.listen("addToCollectionDialog", function () {
			reactInstance.setState({});
			reactInstance.openDialog();
		}, {});
	},
	getInitialState: function getInitialState() {
		return {
			collectionKey: null
		};
	},
	handleCollectionChange: function handleCollectionChange(evt) {
		this.setState({ 'collectionKey': evt.target.value });
	},
	openDialog: function openDialog() {
		//this.setState({open:true});
		this.refs.modal.open();
	},
	closeDialog: function closeDialog(evt) {
		//this.setState({open:false});
		this.refs.modal.close();
	},
	addToCollection: function addToCollection(evt) {
		Z.debug("add-to-collection clicked", 3);
		var reactInstance = this;
		var library = this.props.library;
		var itemKeys = Zotero.state.getSelectedItemKeys();
		var collectionKey = this.state.collectionKey;
		if (!collectionKey) {
			Zotero.ui.jsNotificationMessage("No collection selected", 'error');
			return false;
		}
		if (itemKeys.length === 0) {
			Zotero.ui.jsNotificationMessage("No items selected", 'notice');
			return false;
		}

		library.collections.getCollection(collectionKey).addItems(itemKeys).then(function (response) {
			library.dirty = true;
			Zotero.ui.jsNotificationMessage("Items added to collection", 'success');
			reactInstance.closeDialog();
		}).catch(Zotero.catchPromiseError);
		return false;
	},
	render: function render() {
		var library = this.props.library;
		var ncollections = library.collections.nestedOrderingArray();

		var collectionOptions = ncollections.map(function (collection, index) {
			return React.createElement(
				"option",
				{ key: collection.get('key'), value: collection.get('key') },
				'-'.repeat(collection.nestingDepth),
				" ",
				collection.get('name')
			);
		});

		return React.createElement(
			BootstrapModalWrapper,
			{ ref: "modal" },
			React.createElement(
				"div",
				{ id: "add-to-collection-dialog", className: "add-to-collection-dialog", role: "dialog", title: "Add to Collection", "data-keyboard": "true" },
				React.createElement(
					"div",
					{ className: "modal-dialog" },
					React.createElement(
						"div",
						{ className: "modal-content" },
						React.createElement(
							"div",
							{ className: "modal-header" },
							React.createElement(
								"button",
								{ type: "button", className: "close", "data-dismiss": "modal", "aria-hidden": "true" },
								"×"
							),
							React.createElement(
								"h3",
								null,
								"Add To Collection"
							)
						),
						React.createElement(
							"div",
							{ className: "add-to-collection-div modal-body", "data-role": "content" },
							React.createElement(
								"form",
								{ method: "POST" },
								React.createElement(
									"div",
									{ "data-role": "fieldcontain" },
									React.createElement(
										"label",
										{ htmlFor: "new-collection-parent" },
										"Collection"
									),
									React.createElement(
										"select",
										{ onChange: this.handleCollectionChange, className: "collectionKey-select target-collection form-control" },
										collectionOptions
									)
								)
							)
						),
						React.createElement(
							"div",
							{ className: "modal-footer" },
							React.createElement(
								"button",
								{ onClick: this.closeDialog, className: "btn", "data-dismiss": "modal", "aria-hidden": "true" },
								"Close"
							),
							React.createElement(
								"button",
								{ onClick: this.addToCollection, className: "btn btn-primary addButton" },
								"Add"
							)
						)
					)
				)
			)
		);
	}
});

var BootstrapModalWrapper = React.createClass({
	displayName: "BootstrapModalWrapper",

	// The following two methods are the only places we need to
	// integrate Bootstrap or jQuery with the components lifecycle methods.
	componentDidMount: function componentDidMount() {
		// When the component is added, turn it into a modal
		Z.debug("BootstrapModalWrapper componentDidMount");
		J(this.refs.root).modal({ backdrop: 'static', keyboard: false, show: false });
	},
	componentWillUnmount: function componentWillUnmount() {
		Z.debug("BootstrapModalWrapper componentWillUnmount");
		J(this.refs.root).off('hidden', this.handleHidden);
	},
	close: function close() {
		Z.debug("BootstrapModalWrapper close");
		J(this.refs.root).modal('hide');
	},
	open: function open() {
		Z.debug("BootstrapModalWrapper open");
		J(this.refs.root).modal('show');
	},
	render: function render() {
		return React.createElement(
			"div",
			{ className: "modal", ref: "root" },
			this.props.children
		);
	}
});
"use strict";

Zotero.ui.widgets.reactbreadcrumbs = {};

Zotero.ui.widgets.reactbreadcrumbs.init = function (el) {
	var library = Zotero.ui.getAssociatedLibrary(el);
	var reactInstance = ReactDOM.render(React.createElement(BreadCrumbs, { library: library }), document.getElementById('breadcrumbs'));
};

var BreadCrumb = React.createClass({
	displayName: "BreadCrumb",

	getInitialProps: function getInitialProps() {
		return {
			label: "",
			path: ""
		};
	},
	render: function render() {
		if (this.props.path != "") {
			return React.createElement(
				"a",
				{ href: this.props.path },
				this.props.label
			);
		} else {
			return this.props.label;
		}
	}
});

var BreadCrumbs = React.createClass({
	displayName: "BreadCrumbs",

	componentWillMount: function componentWillMount() {
		var reactInstance = this;
		var library = this.props.library;

		library.listen("displayedItemsChanged displayedItemChanged selectedCollectionChanged", function () {
			reactInstance.forceUpdate();
		});
	},
	getInitialProps: function getInitialProps() {
		return { library: null };
	},
	render: function render() {
		var library = this.props.library;
		if (library === null) {
			return null;
		}

		var crumbs = [];
		var config = Zotero.state.getUrlVars();
		if (Zotero.config.breadcrumbsBase) {
			Zotero.config.breadcrumbsBase.forEach(function (crumb) {
				crumbs.push(crumb);
			});
		} else if (library.libraryType == 'user') {
			crumbs = [{ label: 'Home', path: '/' }, { label: 'People', path: '/people' }, { label: library.libraryLabel || library.libraryUrlIdentifier, path: '/' + library.libraryUrlIdentifier }, { label: 'Library', path: '/' + library.libraryUrlIdentifier + '/items' }];
		} else {
			crumbs = [{ label: 'Home', path: '/' }, { label: 'Groups', path: '/groups' }, { label: library.libraryLabel || library.libraryUrlIdentifier, path: '/groups/' + library.libraryUrlIdentifier }, { label: 'Library', path: '/groups/' + library.libraryUrlIdentifier + '/items' }];
		}

		if (config.collectionKey) {
			Z.debug("have collectionKey", 4);
			var curCollection = library.collections.getCollection(config.collectionKey);
			if (curCollection) {
				crumbs.push({ label: curCollection.get('name'), path: Zotero.state.buildUrl({ collectionKey: config.collectionKey }) });
			}
		}
		if (config.itemKey) {
			Z.debug("have itemKey", 4);
			crumbs.push({ label: library.items.getItem(config.itemKey).title, path: Zotero.state.buildUrl({ collectionKey: config.collectionKey, itemKey: config.itemKey }) });
		}

		var crumbNodes = [];
		var titleString = "";
		crumbs.forEach(function (crumb, index) {
			crumbNodes.push(React.createElement(BreadCrumb, { label: crumb.label, path: crumb.path }));
			if (crumb.label == "Home") {
				titleString += "Zotero | ";
			} else {
				titleString += crumb.label;
			}
			if (index < crumbs.length) {
				crumbNodes.push(" > ");
				titleString += " > ";
			}
		});

		//set window title
		if (titleString != "") {
			Zotero.state.updateStateTitle(titleString);
		}

		return React.createElement(
			"span",
			null,
			crumbNodes
		);
	}
});
"use strict";

Zotero.ui.widgets.library = {};

Zotero.ui.widgets.library.init = function (el) {
	Z.debug("Zotero.ui.widgets.library.init");
	var library = Zotero.ui.getAssociatedLibrary(el);
	var reactInstance = ReactDOM.render(React.createElement(ReactZoteroLibrary, { library: library }), document.getElementById('library-widget'));
};

var ReactZoteroLibrary = React.createClass({
	displayName: "ReactZoteroLibrary",

	componentWillMount: function componentWillMount() {
		//preload library
		Z.debug("ReactZoteroLibrary componentWillMount", 3);
		var reactInstance = this;
		Zotero.reactLibraryInstance = reactInstance;
		var library = this.props.library;
		library.loadSettings();
		library.listen("deleteIdb", function () {
			library.idbLibrary.deleteDB();
		});
		library.listen("indexedDBError", function () {
			Zotero.ui.jsNotificationMessage("There was an error initializing your library. Some data may not load properly.", 'notice');
		});
		library.listen("cachedDataLoaded", function () {});

		J(window).on('resize', function () {
			if (!window.matchMedia("(min-width: 768px)").matches) {
				if (reactInstance.state.narrow != true) {
					reactInstance.setState({ narrow: true });
				}
			} else {
				if (reactInstance.state.narrow != false) {
					reactInstance.setState({ narrow: false });
				}
			}
		});
	},
	componentDidMount: function componentDidMount() {
		var reactInstance = this;
		var library = this.props.library;
		library.listen("displayedItemsChanged", function () {
			Z.debug("ReactZoteroLibrary displayedItemsChanged");
			reactInstance.refs.itemsWidget.loadItems();
		}, {});

		library.listen("tagsChanged libraryTagsUpdated selectedTagsChanged", function () {
			Z.debug("setting tags on tagsWidget from Library");
			reactInstance.refs.tagsWidget.setState({ tags: library.tags });
		});

		//trigger loading of more items on scroll reaching bottom
		J(reactInstance.refs.itemsPanel).on('scroll', function () {
			var jel = J(reactInstance.refs.itemsPanel);
			if (jel.scrollTop() + jel.innerHeight() >= jel[0].scrollHeight) {
				reactInstance.refs.itemsWidget.loadMoreItems();
			}
		});
	},
	getInitialState: function getInitialState() {
		var narrow;
		if (!window.matchMedia("(min-width: 768px)").matches) {
			Z.debug("Library set to narrow", 3);
			narrow = true;
		} else {
			narrow = false;
		}

		return {
			narrow: narrow,
			activePanel: "items",
			deviceSize: "xs"
		};
	},
	showFiltersPanel: function showFiltersPanel(evt) {
		evt.preventDefault();
		this.setState({ activePanel: "filters" });
	},
	showItemsPanel: function showItemsPanel(evt) {
		evt.preventDefault();
		this.setState({ activePanel: "items" });
	},
	reflowPanelContainer: function reflowPanelContainer() {},
	render: function render() {
		Z.debug("react library render");
		var reactInstance = this;
		var library = this.props.library;
		var user = Zotero.config.loggedInUser;
		var userDisplayName = user ? user.displayName : null;
		var base = Zotero.config.baseWebsiteUrl;
		var settingsUrl = base + "/settings";
		var inboxUrl = base + "/messages/inbox"; //TODO
		var downloadUrl = base + "/download";
		var documentationUrl = base + "/support";
		var forumsUrl = Zotero.config.baseForumsUrl; //TODO
		var logoutUrl = base + "/user/logout";
		var loginUrl = base + "/user/login";
		var homeUrl = base;
		var staticUrl = function staticUrl(path) {
			return base + "/static" + path;
		};

		var inboxText = user.unreadMessages > 0 ? React.createElement(
			"strong",
			null,
			"Inbox (",
			user.unreadMessages,
			")"
		) : "Inbox";
		var siteActionsMenu;

		if (user) {
			siteActionsMenu = [React.createElement(
				"button",
				{ key: "button", type: "button", href: "#", className: "btn btn-default navbar-btn dropdown-toggle", "data-toggle": "dropdown", role: "button", "aria-expanded": "false" },
				userDisplayName,
				React.createElement("span", { className: "caret" }),
				React.createElement(
					"span",
					{ className: "sr-only" },
					"Toggle Dropdown"
				)
			), React.createElement(
				"ul",
				{ key: "listEntries", className: "dropdown-menu", role: "menu" },
				React.createElement(
					"li",
					null,
					React.createElement(
						"a",
						{ href: settingsUrl },
						"Settings"
					)
				),
				React.createElement(
					"li",
					null,
					React.createElement(
						"a",
						{ href: inboxUrl },
						inboxText
					)
				),
				React.createElement(
					"li",
					null,
					React.createElement(
						"a",
						{ href: downloadUrl },
						"Download"
					)
				),
				React.createElement("li", { className: "divider" }),
				React.createElement(
					"li",
					null,
					React.createElement(
						"a",
						{ href: documentationUrl, className: "documentation" },
						"Documentation"
					)
				),
				React.createElement(
					"li",
					null,
					React.createElement(
						"a",
						{ href: forumsUrl, className: "forums" },
						"Forums"
					)
				),
				React.createElement("li", { className: "divider" }),
				React.createElement(
					"li",
					null,
					React.createElement(
						"a",
						{ href: logoutUrl },
						"Log Out"
					)
				)
			)];
		} else {
			siteActionsMenu = React.createElement(
				"div",
				{ className: "btn-group" },
				React.createElement(
					"a",
					{ href: loginUrl, className: "btn btn-default navbar-btn", role: "button" },
					"Log In"
				),
				React.createElement(
					"button",
					{ type: "button", href: "#", className: "btn btn-default navbar-btn dropdown-toggle", "data-toggle": "dropdown", role: "button", "aria-haspopup": "true", "aria-expanded": "false" },
					React.createElement("span", { className: "caret" }),
					React.createElement(
						"span",
						{ className: "sr-only" },
						"Toggle Dropdown"
					)
				),
				React.createElement(
					"ul",
					{ className: "dropdown-menu", role: "menu" },
					React.createElement(
						"li",
						null,
						React.createElement(
							"a",
							{ href: downloadUrl },
							"Download"
						)
					),
					React.createElement(
						"li",
						null,
						React.createElement(
							"a",
							{ href: documentationUrl, className: "documentation" },
							"Documentation"
						)
					),
					React.createElement(
						"li",
						null,
						React.createElement(
							"a",
							{ href: forumsUrl, className: "forums" },
							"Forums"
						)
					)
				)
			);
		}

		//figure out panel visibility based on state.activePanel
		var narrow = reactInstance.state.narrow;
		var leftPanelVisible = !narrow;
		var rightPanelVisible = !narrow;
		var itemsPanelVisible = !narrow;
		var itemPanelVisible = !narrow;
		var tagsPanelVisible = !narrow;
		var collectionsPanelVisible = !narrow;
		if (narrow) {
			switch (reactInstance.state.activePanel) {
				case "items":
					rightPanelVisible = true;
					itemsPanelVisible = true;
					break;
				case "item":
					rightPanelVisible = true;
					itemPanelVisible = true;
					break;
				case "tags":
					leftPanelVisible = true;
					tagsPanelVisible = true;
					break;
				case "collections":
					leftPanelVisible = true;
					collectionsPanelVisible = true;
					break;
				case "filters":
					leftPanelVisible = true;
					break;
			}
		}

		return React.createElement(
			"div",
			null,
			React.createElement(
				"nav",
				{ id: "primarynav", className: "navbar navbar-default", role: "navigation" },
				React.createElement(
					"div",
					{ className: "container-fluid" },
					React.createElement(
						"div",
						{ className: "navbar-header" },
						React.createElement(
							"button",
							{ type: "button", className: "navbar-toggle collapsed", "data-toggle": "collapse", "data-target": "#primary-nav-linklist" },
							userDisplayName,
							React.createElement(
								"span",
								{ className: "sr-only" },
								"Toggle navigation"
							),
							React.createElement("span", { className: "glyphicons fonticon glyphicons-menu-hamburger" })
						),
						React.createElement(
							"a",
							{ className: "navbar-brand hidden-sm hidden-xs", href: homeUrl },
							React.createElement("img", { src: staticUrl('/images/theme/zotero.png'), alt: "Zotero", height: "20px" })
						),
						React.createElement(
							"a",
							{ className: "navbar-brand visible-sm-block visible-xs-block", href: homeUrl },
							React.createElement("img", { src: staticUrl('/images/theme/zotero_theme/zotero_48.png'), alt: "Zotero", height: "24px" })
						)
					),
					React.createElement(
						"div",
						{ className: "collapse navbar-collapse", id: "primary-nav-linklist" },
						React.createElement(ControlPanel, { library: library, ref: "controlPanel" }),
						React.createElement(
							"ul",
							{ className: "nav navbar-nav navbar-right" },
							siteActionsMenu
						),
						React.createElement(
							"div",
							{ className: "eventfulwidget btn-toolbar hidden-xs navbar-right" },
							React.createElement(LibrarySearchBox, { library: library })
						)
					)
				)
			),
			React.createElement(
				"div",
				{ id: "js-message" },
				React.createElement("ul", { id: "js-message-list" })
			),
			React.createElement(
				"div",
				{ id: "library", className: "row" },
				React.createElement(
					"div",
					{ id: "panel-container" },
					React.createElement(
						"div",
						{ id: "left-panel", hidden: !leftPanelVisible, className: "panelcontainer-panelcontainer col-xs-12 col-sm-4 col-md-3" },
						React.createElement(FilterGuide, { ref: "filterGuide", library: library }),
						React.createElement(
							"div",
							{ role: "tabpanel" },
							React.createElement(
								"ul",
								{ className: "nav nav-tabs", role: "tablist" },
								React.createElement(
									"li",
									{ role: "presentation", className: "active" },
									React.createElement(
										"a",
										{ href: "#collections-panel", "aria-controls": "collections-panel", role: "tab", "data-toggle": "tab" },
										"Collections"
									)
								),
								React.createElement(
									"li",
									{ role: "presentation" },
									React.createElement(
										"a",
										{ href: "#tags-panel", "aria-controls": "tags-panel", role: "tab", "data-toggle": "tab" },
										"Tags"
									)
								)
							),
							React.createElement(
								"div",
								{ className: "tab-content" },
								React.createElement(
									"div",
									{ id: "collections-panel", role: "tabpanel", className: "tab-pane active" },
									React.createElement(Collections, { ref: "collectionsWidget", library: library })
								),
								React.createElement(
									"div",
									{ id: "tags-panel", role: "tabpanel", className: "tab-pane" },
									React.createElement(Tags, { ref: "tagsWidget", library: library }),
									React.createElement(FeedLink, { ref: "feedLinkWidget", library: library })
								)
							)
						)
					),
					React.createElement(
						"div",
						{ id: "right-panel", hidden: !rightPanelVisible, className: "panelcontainer-panelcontainer col-xs-12 col-sm-8 col-md-9" },
						React.createElement(
							"div",
							{ hidden: !itemsPanelVisible, ref: "itemsPanel", id: "items-panel", className: "panelcontainer-panel col-sm-12 col-md-7" },
							React.createElement(LibrarySearchBox, { library: library }),
							React.createElement(Items, { ref: "itemsWidget", library: library, narrow: narrow }),
							React.createElement(
								"div",
								{ id: "load-more-items-div", className: "row" },
								React.createElement(
									"button",
									{ onClick: function onClick() {
											library.trigger('loadMoreItems');
										}, type: "button", id: "load-more-items-button", className: "btn btn-default" },
									"Load More Items"
								)
							)
						),
						React.createElement(
							"div",
							{ hidden: !itemPanelVisible, id: "item-panel", className: "panelcontainer-panel col-sm-12 col-md-5" },
							React.createElement(
								"div",
								{ id: "item-widget-div", className: "item-details-div" },
								React.createElement(ItemDetails, { ref: "itemWidget", library: library })
							)
						)
					),
					React.createElement(
						"nav",
						{ id: "panelcontainer-nav", className: "navbar navbar-default navbar-fixed-bottom visible-xs-block", role: "navigation" },
						React.createElement(
							"div",
							{ className: "container-fluid" },
							React.createElement(
								"ul",
								{ className: "nav navbar-nav" },
								React.createElement(
									"li",
									{ onClick: reactInstance.showFiltersPanel, className: "filters-nav" },
									React.createElement(
										"a",
										{ href: "#" },
										"Filters"
									)
								),
								React.createElement(
									"li",
									{ onClick: reactInstance.showItemsPanel, className: "items-nav" },
									React.createElement(
										"a",
										{ href: "#" },
										"Items"
									)
								)
							)
						)
					),
					React.createElement(CiteItemDialog, { library: library }),
					React.createElement(ExportItemsDialog, { library: library }),
					React.createElement(LibrarySettingsDialog, { library: library }),
					React.createElement(ChooseSortingDialog, { library: library })
				)
			)
		);
	}
});
'use strict';

Zotero.ui.widgets.reactchooseSortingDialog = {};

Zotero.ui.widgets.reactchooseSortingDialog.init = function (el) {
	Z.debug("chooseSortingDialog widget init", 3);
	var library = Zotero.ui.getAssociatedLibrary(el);
	var reactInstance = ReactDOM.render(React.createElement(ChooseSortingDialog, { library: library }), document.getElementById('choose-sorting-dialog'));
};

var ChooseSortingDialog = React.createClass({
	displayName: 'ChooseSortingDialog',

	componentWillMount: function componentWillMount() {
		var reactInstance = this;
		var library = this.props.library;

		var currentSortField = Zotero.ui.getPrioritizedVariable('order', 'title');
		var currentSortOrder = Zotero.ui.getPrioritizedVariable('sort', 'asc');
		reactInstance.setState({
			sortField: currentSortField,
			sortOrder: currentSortOrder
		});

		library.listen("chooseSortingDialog", reactInstance.openDialog, {});
	},
	getInitialState: function getInitialState() {
		return {
			sortField: "",
			sortOrder: "asc"
		};
	},
	handleFieldChange: function handleFieldChange(evt) {
		this.setState({ sortField: evt.target.value });
	},
	handleOrderChange: function handleOrderChange(evt) {
		this.setState({ sortOrder: evt.target.value });
	},
	saveSorting: function saveSorting() {
		var library = this.props.library;
		library.trigger("changeItemSorting", { newSortField: this.state.sortField, newSortOrder: this.state.sortOrder });
		this.closeDialog();
	},
	openDialog: function openDialog() {
		this.refs.modal.open();
	},
	closeDialog: function closeDialog(evt) {
		this.refs.modal.close();
	},
	render: function render() {
		var library = this.props.library;
		var sortableOptions = library.sortableColumns.map(function (col) {
			return React.createElement(
				'option',
				{ key: col, label: Zotero.localizations.fieldMap[col], value: col },
				Zotero.localizations.fieldMap[col]
			);
		});

		return React.createElement(
			BootstrapModalWrapper,
			{ ref: 'modal' },
			React.createElement(
				'div',
				{ id: 'choose-sorting-dialog', className: 'choose-sorting-dialog', role: 'dialog', title: 'Sort Order', 'data-keyboard': 'true' },
				React.createElement(
					'div',
					{ className: 'modal-dialog' },
					React.createElement(
						'div',
						{ className: 'modal-content' },
						React.createElement(
							'div',
							{ className: 'modal-header' },
							React.createElement(
								'button',
								{ type: 'button', className: 'close', 'data-dismiss': 'modal', 'aria-hidden': 'true' },
								'×'
							),
							React.createElement(
								'h3',
								null,
								'Sort Items By'
							)
						),
						React.createElement(
							'div',
							{ className: 'choose-sorting-div modal-body', 'data-role': 'content' },
							React.createElement(
								'form',
								{ className: 'form-horizontal', role: 'form' },
								React.createElement(
									'select',
									{ defaultValue: this.state.sortField, onChange: this.handleFieldChange, id: 'sort-column-select', className: 'sort-column-select form-control', name: 'sort-column-select' },
									sortableOptions
								),
								React.createElement(
									'select',
									{ defaultValue: this.state.sortOrder, onChange: this.handleOrderChange, id: 'sort-order-select', className: 'sort-order-select form-control', name: 'sort-order-select' },
									React.createElement(
										'option',
										{ label: 'Ascending', value: 'asc' },
										'Ascending'
									),
									React.createElement(
										'option',
										{ label: 'Descending', value: 'desc' },
										'Descending'
									)
								)
							)
						),
						React.createElement(
							'div',
							{ className: 'modal-footer' },
							React.createElement(
								'button',
								{ className: 'btn', 'data-dismiss': 'modal', 'aria-hidden': 'true' },
								'Cancel'
							),
							React.createElement(
								'button',
								{ onClick: this.saveSorting, className: 'btn btn-primary saveSortButton' },
								'Save'
							)
						)
					)
				)
			)
		);
	}
});
"use strict";

Zotero.ui.widgets.reactciteItemDialog = {};

Zotero.ui.widgets.reactciteItemDialog.init = function (el) {
	Z.debug("citeItemDialog widget init", 3);
	var library = Zotero.ui.getAssociatedLibrary(el);
	var reactInstance = ReactDOM.render(React.createElement(CiteItemDialog, { library: library }), document.getElementById('cite-item-dialog'));
};

var CiteItemDialog = React.createClass({
	displayName: "CiteItemDialog",

	componentWillMount: function componentWillMount() {
		var reactInstance = this;
		var library = this.props.library;

		reactInstance.getAvailableStyles();
		library.listen("citeItems", reactInstance.openDialog, {});
	},
	getDefaultProps: function getDefaultProps() {
		return {
			freeStyleInput: false
		};
	},
	getInitialState: function getInitialState() {
		return {
			styles: [],
			currentStyle: "",
			citationString: ""
		};
	},
	handleStyleChange: function handleStyleChange(evt) {
		this.setState({ 'collectionKey': evt.target.value });
	},
	openDialog: function openDialog() {
		//this.setState({open:true});
		this.refs.modal.open();
	},
	closeDialog: function closeDialog(evt) {
		//this.setState({open:false});
		this.refs.modal.close();
	},
	cite: function cite(evt) {
		Z.debug("citeFunction", 3);
		var reactInstance = this;
		var library = this.props.library;
		var style = this.state.currentStyle;

		//get the selected item keys from the items widget
		var itemKeys = Zotero.state.getSelectedItemKeys();

		library.loadFullBib(itemKeys, style).then(function (bibContent) {
			reactInstance.setState({
				citationString: bibContent
			});
			//dialogEl.find(".cite-box-div").html(bibContent);
		}).catch(Zotero.catchPromiseError);
	},
	getAvailableStyles: function getAvailableStyles() {
		if (!Zotero.styleList) {
			Zotero.styleList = [];
			J.getJSON(Zotero.config.styleListUrl, function (data) {
				Zotero.styleList = data;
			});
		}
	},
	directCite: function directCite(cslItems, style) {
		var data = {};
		data.items = cslItems;
		var url = Zotero.config.citationEndpoint + '?linkwrap=1&style=' + style;
		return J.post(url, JSON.stringify(data));
	},
	buildBibString: function buildBibString(bib) {
		var bibMeta = bib.bibliography[0];
		var bibEntries = bib.bibliography[1];
		var bibString = bibMeta.bibstart;
		for (var i = 0; i < bibEntries.length; i++) {
			bibString += bibEntries[i];
		}
		bibString += bibMeta.bibend;
		return bibString;
	},
	render: function render() {
		var reactInstance = this;
		var library = this.props.library;

		var freeStyleInput = null;
		if (this.props.freeStyleInput) {
			freeStyleInput = React.createElement("input", { type: "text", className: "free-text-style-input form-control", placeholder: "style" });
		}
		var citationHtml = { "__html": this.state.citationString };

		return React.createElement(
			BootstrapModalWrapper,
			{ ref: "modal" },
			React.createElement(
				"div",
				{ id: "cite-item-dialog", className: "cite-item-dialog", role: "dialog", title: "Cite", "data-keyboard": "true" },
				React.createElement(
					"div",
					{ className: "modal-dialog" },
					React.createElement(
						"div",
						{ className: "modal-content" },
						React.createElement(
							"div",
							{ className: "modal-header" },
							React.createElement(
								"button",
								{ type: "button", className: "close", "data-dismiss": "modal", "aria-hidden": "true" },
								"×"
							),
							React.createElement(
								"h3",
								null,
								"Cite Items"
							)
						),
						React.createElement(
							"div",
							{ className: "cite-item-div modal-body", "data-role": "content" },
							React.createElement(
								"form",
								null,
								React.createElement(
									"select",
									{ onChange: this.cite, className: "cite-item-select form-control", id: "cite-item-select" },
									React.createElement(
										"option",
										{ value: "" },
										"Select Style"
									),
									React.createElement(
										"option",
										{ value: "apsa" },
										"American Political Science Association"
									),
									React.createElement(
										"option",
										{ value: "apa" },
										"American Psychological Association"
									),
									React.createElement(
										"option",
										{ value: "asa" },
										"American Sociological Association"
									),
									React.createElement(
										"option",
										{ value: "chicago-author-date" },
										"Chicago Manual of Style (Author-Date format)"
									),
									React.createElement(
										"option",
										{ value: "chicago-fullnote-bibliography" },
										"Chicago Manual of Style (Full Note with Bibliography)"
									),
									React.createElement(
										"option",
										{ value: "chicago-note-bibliography" },
										"Chicago Manual of Style (Note with Bibliography)"
									),
									React.createElement(
										"option",
										{ value: "harvard1" },
										"Harvard Reference format 1"
									),
									React.createElement(
										"option",
										{ value: "ieee" },
										"IEEE"
									),
									React.createElement(
										"option",
										{ value: "mhra" },
										"Modern Humanities Research Association"
									),
									React.createElement(
										"option",
										{ value: "mla" },
										"Modern Language Association"
									),
									React.createElement(
										"option",
										{ value: "nlm" },
										"National Library of Medicine"
									),
									React.createElement(
										"option",
										{ value: "nature" },
										"Nature"
									),
									React.createElement(
										"option",
										{ value: "vancouver" },
										"Vancouver"
									)
								),
								freeStyleInput
							),
							React.createElement("div", { id: "cite-box-div", className: "cite-box-div", dangerouslySetInnerHTML: citationHtml })
						),
						React.createElement(
							"div",
							{ className: "modal-footer" },
							React.createElement(
								"button",
								{ className: "btn btn-default", "data-dismiss": "modal", "aria-hidden": "true" },
								"Close"
							)
						)
					)
				)
			)
		);
	}
});
'use strict';

Zotero.ui.widgets.reactcollections = {};

Zotero.ui.widgets.reactcollections.init = function (el) {
	var library = Zotero.ui.getAssociatedLibrary(el);

	var reactInstance = ReactDOM.render(React.createElement(Collections, { library: library }), document.getElementById('collection-list-div'));
};

var CollectionRow = React.createClass({
	displayName: 'CollectionRow',

	getDefaultProps: function getDefaultProps() {
		return {
			collection: null,
			selectedCollection: "",
			depth: 0,
			expandedCollections: {}
		};
	},
	handleCollectionClick: function handleCollectionClick(evt) {
		evt.preventDefault();
		var collectionKey = this.props.collection.get('collectionKey');
		//if current collect
		Zotero.state.clearUrlVars();
		Zotero.state.pathVars['collectionKey'] = collectionKey;
		Zotero.state.pushState();
	},
	handleTwistyClick: function handleTwistyClick(evt) {
		Z.debug("handleTwistyClick");
		//toggle expanded state for this collection
		evt.preventDefault();
		var collectionKey = this.props.collection.get('collectionKey');
		var exp = this.props.expandedCollections;
		if (exp[collectionKey]) {
			delete exp[collectionKey];
		} else {
			exp[collectionKey] = true;
		}
		this.props.parentCollectionsInstance.setState({ expandedCollections: exp });
	},
	render: function render() {
		//Z.debug("CollectionRow render");
		if (this.props.collection == null) {
			return null;
		}
		var collection = this.props.collection;
		var collectionKey = collection.get('key');
		var selectedCollection = this.props.selectedCollection;
		var expandedCollections = this.props.expandedCollections;
		var expanded = expandedCollections[collectionKey] === true;
		var isSelectedCollection = this.props.selectedCollection == collectionKey;

		var childRows = [];
		collection.children.forEach(function (collection) {
			childRows.push(React.createElement(CollectionRow, {
				key: collection.get('key'),
				collection: collection,
				selectedCollection: selectedCollection,
				expandedCollections: expandedCollections }));
		});
		var childrenList = null;
		if (collection.hasChildren) {
			childrenList = React.createElement(
				'ul',
				{ hidden: !expanded },
				childRows
			);
		}

		var placeholderClasses = "placeholder small-icon light-icon pull-left";
		if (expandedCollections[collectionKey] === true) {
			placeholderClasses += " glyphicon glyphicon-chevron-down clickable";
		} else if (childRows.length > 0) {
			placeholderClasses += " glyphicon glyphicon-chevron-right clickable";
		}

		return React.createElement(
			'li',
			{ className: 'collection-row' },
			React.createElement(
				'div',
				{ className: 'folder-toggle' },
				React.createElement('span', { className: placeholderClasses, onClick: this.handleTwistyClick }),
				React.createElement('span', { className: 'fonticon glyphicons glyphicons-folder-open barefonticon' })
			),
			React.createElement(
				'a',
				{ href: collection.websiteCollectionLink, className: isSelectedCollection ? "current-collection" : "", onClick: this.handleCollectionClick },
				collection.get('name')
			),
			childrenList
		);
	}
});

var TrashRow = React.createClass({
	displayName: 'TrashRow',

	getDefaultProps: function getDefaultProps() {
		return {
			collectionKey: "trash",
			selectedCollection: ""
		};
	},
	handleClick: function handleClick() {
		Zotero.state.clearUrlVars();
		Zotero.state.pathVars['collectionKey'] = this.props.collectionKey;
		Zotero.state.pushState();
	},
	render: function render() {
		Z.debug("TrashRow render");
		var className = this.props.selectedCollection == this.props.collectionKey ? "collection-row current-collection" : "collection-row";

		return React.createElement(
			'li',
			{ className: className },
			React.createElement(
				'div',
				{ className: 'folder-toggle' },
				React.createElement('span', { className: 'sprite-placeholder sprite-icon-16 pull-left dui-icon' }),
				React.createElement('span', { className: 'glyphicons fonticon glyphicons-bin barefonticon' })
			),
			'Trash'
		);
	}
});

var Collections = React.createClass({
	displayName: 'Collections',

	getDefaultProps: function getDefaultProps() {},
	getInitialState: function getInitialState() {
		var initialCollectionKey = Zotero.state.getUrlVar('collectionKey');
		return {
			collections: null,
			currentCollectionKey: initialCollectionKey,
			expandedCollections: {},
			loading: false
		};
	},
	componentWillMount: function componentWillMount() {
		var reactInstance = this;
		var library = this.props.library;

		library.listen("collectionsDirty", reactInstance.syncCollections, {});
		library.listen("libraryCollectionsUpdated", function () {
			reactInstance.setState({ collections: library.collections });
		}, {});
		library.listen("selectedCollectionChanged", function () {
			var collectionKey = Zotero.state.getUrlVar('collectionKey');
			reactInstance.setState({ currentCollectionKey: collectionKey });
		}, {});

		library.listen("cachedDataLoaded", reactInstance.syncCollections, {});
	},
	returnToLibrary: function returnToLibrary(evt) {
		evt.preventDefault();
		this.setState({ currentCollectionKey: null });
		Zotero.state.clearUrlVars();
		Zotero.state.pushState();
	},
	syncCollections: function syncCollections(evt) {
		Zotero.debug("react collections syncCollections", 3);
		var reactInstance = this;
		if (this.state.loading) {
			return;
		}
		var library = this.props.library;

		//update the widget as soon as we have the cached collections
		this.setState({ collections: library.collections, loading: true });

		//sync collections if loaded from cache but not synced
		return library.loadUpdatedCollections().then(function () {
			reactInstance.setState({ collections: library.collections, loading: false });
			library.trigger("libraryCollectionsUpdated");
		}, function (err) {
			//sync failed, but we already had some data, so show that
			Z.error("Error syncing collections");
			Z.error(err);
			reactInstance.setState({ collections: library.collections, loading: false });
			library.trigger("libraryCollectionsUpdated");
			Zotero.ui.jsNotificationMessage("Error loading collections. Collections list may not be up to date", 'error');
		});
	},
	render: function render() {
		Z.debug("Collections render");
		var reactInstance = this;
		var library = this.props.library;
		var collections = this.state.collections;
		if (collections == null) {
			return null;
		}

		var collectionsArray = this.state.collections.collectionsArray;
		var currentCollectionKey = this.state.currentCollectionKey;
		var libraryUrlIdentifier = "";
		//var libraryUrlIdentifier = (collections == null ? "" : collections.libraryUrlIdentifier);

		//Set of collections in an expanded state
		var expandedCollections = this.state.expandedCollections;

		//path from top level collection to currently selected collection, to ensure that we expand
		//them all and the current collection is visible
		var currentCollectionPath = [];
		if (currentCollectionKey !== null) {
			var currentCollection = collections.getCollection(currentCollectionKey);
			var c = currentCollection;
			while (true) {
				if (c && !c.topLevel) {
					var parentCollectionKey = c.get('parentCollection');
					c = collections.getCollection(parentCollectionKey);
					currentCollectionPath.push(parentCollectionKey);
					expandedCollections[parentCollectionKey] = true;
				} else {
					break;
				}
			}
		}

		var collectionRows = [];
		collectionsArray.forEach(function (collection) {
			if (collection.topLevel) {
				collectionRows.push(React.createElement(CollectionRow, {
					key: collection.get('key'),
					collection: collection,
					selectedCollection: currentCollectionKey,
					expandedCollections: expandedCollections,
					parentCollectionsInstance: reactInstance }));
			}
		});

		var libraryClassName = "my-library " + (currentCollectionKey == null ? "current-collection" : "");
		return React.createElement(
			'div',
			{ id: 'collection-list-div', className: 'collection-list-container' },
			React.createElement(
				'ul',
				{ id: 'collection-list' },
				React.createElement(
					'li',
					null,
					React.createElement('span', { className: 'glyphicons fonticon glyphicons-inbox barefonticon' }),
					React.createElement(
						'a',
						{ onClick: this.returnToLibrary, className: libraryClassName, href: library.libraryBaseWebsiteUrl },
						'Library'
					)
				),
				collectionRows
			)
		);
	}
});
"use strict";

Zotero.ui.widgets.reactcontrolPanel = {};

Zotero.ui.widgets.reactcontrolPanel.init = function (el) {
	Z.debug("Zotero.eventful.init.controlPanel", 3);
	var library = Zotero.ui.getAssociatedLibrary(el);

	var reactInstance = ReactDOM.render(React.createElement(ControlPanel, { library: library }), document.getElementById('control-panel'));
};

var GroupsButton = React.createClass({
	displayName: "GroupsButton",

	render: function render() {
		var groupsUrl = "/groups";
		return React.createElement(
			"a",
			{ className: "btn btn-default navbar-btn navbar-left", href: groupsUrl, title: "Groups" },
			React.createElement("span", { className: "glyphicons fonticon glyphicons-group" })
		);
	}
});

var LibraryDropdown = React.createClass({
	displayName: "LibraryDropdown",

	getDefaultProps: function getDefaultProps() {
		return {
			library: null,
			user: false
		};
	},
	getInitialState: function getInitialState() {
		return {
			accessibleLibraries: [],
			loading: false,
			loaded: false
		};
	},
	populateDropdown: function populateDropdown() {
		Z.debug("populateDropdown");
		var reactInstance = this;
		if (this.state.loading || this.state.loaded) {
			return;
		}

		var library = this.props.library;
		if (library == null) {
			return;
		}
		if (!Zotero.config.loggedIn) {
			throw new Error("no logged in userID. Required for libraryDropdown widget");
		}

		var user = Zotero.config.loggedInUser;
		var personalLibraryString = 'u' + user.userID;
		var personalLibraryUrl = Zotero.url.userWebLibrary(user.slug);
		var currentLibraryName = Zotero.config.librarySettings.name;

		this.setState({ loading: true });

		var memberGroups = library.groups.fetchUserGroups(user.userID).then(function (response) {
			Z.debug("got member groups", 3);
			var memberGroups = response.fetchedGroups;
			var accessibleLibraries = [];
			if (!(Zotero.config.librarySettings.libraryType == 'user' && Zotero.config.librarySettings.libraryID == user.userID)) {
				accessibleLibraries.push({
					name: 'My Library',
					libraryString: personalLibraryString,
					webUrl: personalLibraryUrl
				});
			}

			for (var i = 0; i < memberGroups.length; i++) {
				if (Zotero.config.librarySettings.libraryType == 'group' && memberGroups[i].get('id') == Zotero.config.librarySettings.libraryID) {
					continue;
				}
				var libraryString = 'g' + memberGroups[i].get('id');
				accessibleLibraries.push({
					name: memberGroups[i].get('name'),
					libraryString: libraryString,
					webUrl: Zotero.url.groupWebLibrary(memberGroups[i])
				});
			}

			reactInstance.setState({ accessibleLibraries: accessibleLibraries, loading: false, loaded: true });
		}).catch(function (err) {
			Z.error(err);
			Z.error(err.message);
		});
	},
	render: function render() {
		if (this.props.user == false) {
			return null;
		}

		var currentLibraryName = Zotero.config.librarySettings.name;

		var accessibleLibraries = this.state.accessibleLibraries;
		var libraryEntries = accessibleLibraries.map(function (lib) {
			return React.createElement(
				"li",
				{ key: lib.libraryString },
				React.createElement(
					"a",
					{ role: "menuitem", href: lib.webUrl },
					lib.name
				)
			);
		});

		return React.createElement(
			"div",
			{ id: "library-dropdown", className: "btn-group",
				"data-widget": "libraryDropdown", "data-library": this.props.library.libraryString },
			React.createElement(
				"button",
				{ className: "btn btn-default navbar-btn dropdown-toggle", onClick: this.populateDropdown, "data-toggle": "dropdown", href: "#", title: "Libraries" },
				React.createElement("span", { className: "glyphicons fonticon glyphicons-inbox" }),
				React.createElement(
					"span",
					{ className: "current-library-name" },
					currentLibraryName
				),
				React.createElement("span", { className: "caret" })
			),
			React.createElement(
				"ul",
				{ className: "library-dropdown-list dropdown-menu actions-menu" },
				React.createElement(
					"li",
					{ hidden: !this.state.loading },
					React.createElement(
						"a",
						{ role: "menuitem", className: "clickable" },
						"Loading..."
					)
				),
				libraryEntries
			)
		);
	}
});

var ActionsDropdown = React.createClass({
	displayName: "ActionsDropdown",

	getDefaultProps: function getDefaultProps() {
		return {
			itemSelected: false,
			selectedCollection: null,
			library: null,
			editable: false
		};
	},
	trashOrDeleteItems: function trashOrDeleteItems(evt) {
		//move currently displayed item or list of selected items to trash
		//or permanently delete items if already in trash
		evt.preventDefault();
		Z.debug('move-to-trash clicked', 3);

		var library = this.props.library;
		var itemKeys = Zotero.state.getSelectedItemKeys();
		var response;
		var trashingItems = library.items.getItems(itemKeys);
		var deletingItems = []; //potentially deleting instead of trashing

		//show spinner before making the possibly many the ajax requests
		//Zotero.ui.showSpinner(J('#library-items-div'));

		if (Zotero.state.getUrlVar('collectionKey') == 'trash') {
			//items already in trash. delete them
			var i;
			for (i = 0; i < trashingItems.length; i++) {
				var item = trashingItems[i];
				if (item.get('deleted')) {
					//item is already in trash, schedule for actual deletion
					deletingItems.push(item);
				}
			}

			//make request to permanently delete items
			response = library.items.deleteItems(deletingItems);
		} else {
			//items are not in trash already so just add them to it
			response = library.items.trashItems(trashingItems);
		}

		library.dirty = true;
		response.catch(function () {
			Z.error("Error trashing items");
		}).then(function () {
			Zotero.state.clearUrlVars(['collectionKey', 'tag', 'q']);
			Zotero.state.pushState(true);
			library.trigger("displayedItemsChanged");
		}).catch(Zotero.catchPromiseError);

		return false; //stop event bubbling
	},
	removeFromTrash: function removeFromTrash(evt) {
		//Remove currently displayed single item or checked list of items from trash
		//when remove-from-trash link clicked
		Z.debug('remove-from-trash clicked', 3);
		var library = this.props.library;
		var itemKeys = Zotero.state.getSelectedItemKeys();

		var untrashingItems = library.items.getItems(itemKeys);

		//show spinner before making the possibly many the ajax requests
		//Zotero.ui.showSpinner(J('#library-items-div'));

		var response = library.items.untrashItems(untrashingItems);

		library.dirty = true;
		response.catch(function () {}).then(function () {
			Z.debug("post-removeFromTrash always execute: clearUrlVars", 3);
			Zotero.state.clearUrlVars(['collectionKey', 'tag', 'q']);
			Zotero.state.pushState();
			library.trigger("displayedItemsChanged");
		}).catch(Zotero.catchPromiseError);

		return false;
	},
	removeFromCollection: function removeFromCollection(evt) {
		//Remove currently displayed single item or checked list of items from
		//currently selected collection
		Z.debug('remove-from-collection clicked', 3);
		var library = this.props.library;
		var itemKeys = Zotero.state.getSelectedItemKeys();
		var collectionKey = Zotero.state.getUrlVar('collectionKey');

		var modifiedItems = [];
		var responses = [];
		itemKeys.forEach(function (itemKey, index) {
			var item = library.items.getItem(itemKey);
			item.removeFromCollection(collectionKey);
			modifiedItems.push(item);
		});

		library.dirty = true;

		library.items.writeItems(modifiedItems).then(function () {
			Z.debug('removal responses finished. forcing reload', 3);
			Zotero.state.clearUrlVars(['collectionKey', 'tag']);
			Zotero.state.pushState(true);
			library.trigger("displayedItemsChanged");
		}).catch(Zotero.catchPromiseError);

		return false;
	},
	triggerLibraryEvent: function triggerLibraryEvent(evt) {
		var eventType = J(evt.target).data('triggers');
		this.props.library.trigger(eventType);
	},
	triggerSync: function triggerSync() {
		this.props.library.trigger("syncLibary");
	},
	triggerDeleteIdb: function triggerDeleteIdb() {
		this.props.library.trigger("deleteIdb");
	},
	render: function render() {
		var library = this.props.library;
		var editable = this.props.editable;
		var itemSelected = this.props.itemSelected;
		var selectedCollection = this.props.selectedCollection;
		var collectionSelected = selectedCollection != null;

		var showTrashActions = editable && itemSelected && selectedCollection == "trash";
		var showNonTrashActions = editable && itemSelected && selectedCollection != "trash";
		var showItemAction = editable && itemSelected;
		var showCollectionAction = editable && collectionSelected;

		return React.createElement(
			"div",
			{ className: "btn-group" },
			React.createElement(
				"button",
				{ className: "btn btn-default navbar-btn dropdown-toggle", "data-toggle": "dropdown", href: "#", title: "Actions" },
				"Actions",
				React.createElement("span", { className: "caret" })
			),
			React.createElement(
				"ul",
				{ className: "dropdown-menu actions-menu" },
				React.createElement(
					"li",
					{ hidden: !showItemAction },
					React.createElement(
						"a",
						{ href: "#", role: "menuitem", className: "add-to-collection-button", onClick: this.triggerLibraryEvent, "data-triggers": "addToCollectionDialog", title: "Add to Collection" },
						"Add to Collection"
					)
				),
				React.createElement(
					"li",
					{ hidden: !(showItemAction && showCollectionAction) },
					React.createElement(
						"a",
						{ onClick: this.removeFromCollection, href: "#", className: "remove-from-collection-button", title: "Remove from Collection" },
						"Remove from Collection"
					)
				),
				React.createElement(
					"li",
					{ hidden: !showNonTrashActions },
					React.createElement(
						"a",
						{ onClick: this.trashOrDeleteItems, href: "#", className: "move-to-trash-button", title: "Move to Trash" },
						"Move to Trash"
					)
				),
				React.createElement(
					"li",
					{ hidden: !showTrashActions },
					React.createElement(
						"a",
						{ onClick: this.trashOrDeleteItems, href: "#", className: "permanently-delete-button", title: "Move to Trash" },
						"Permanently Delete"
					)
				),
				React.createElement(
					"li",
					{ hidden: !showTrashActions },
					React.createElement(
						"a",
						{ onClick: this.removeFromTrash, href: "#", className: "remove-from-trash-button", title: "Remove from Trash" },
						"Remove from Trash"
					)
				),
				React.createElement("li", { className: "divider", hidden: !showItemAction }),
				React.createElement(
					"li",
					null,
					React.createElement(
						"a",
						{ className: "create-collection-button", href: "#", onClick: this.triggerLibraryEvent, "data-triggers": "createCollectionDialog", title: "New Collection" },
						"Create Collection"
					)
				),
				React.createElement(
					"li",
					{ hidden: !showCollectionAction },
					React.createElement(
						"a",
						{ href: "#", className: "update-collection-button", onClick: this.triggerLibraryEvent, "data-triggers": "updateCollectionDialog", title: "Change Collection" },
						"Rename Collection"
					)
				),
				React.createElement(
					"li",
					{ hidden: !showCollectionAction },
					React.createElement(
						"a",
						{ href: "#", className: "delete-collection-button", onClick: this.triggerLibraryEvent, "data-triggers": "deleteCollectionDialog", title: "Delete Collection" },
						"Delete Collection"
					)
				),
				React.createElement("li", { className: "divider" }),
				React.createElement(
					"li",
					null,
					React.createElement(
						"a",
						{ href: "#", onClick: this.triggerLibraryEvent, "data-triggers": "librarySettingsDialog" },
						"Library Settings"
					)
				),
				React.createElement(
					"li",
					null,
					React.createElement(
						"a",
						{ href: "#", className: "cite-button", onClick: this.triggerLibraryEvent, "data-triggers": "citeItems" },
						"Cite"
					)
				),
				React.createElement(
					"li",
					null,
					React.createElement(
						"a",
						{ href: "#", className: "export-button", onClick: this.triggerLibraryEvent, "data-triggers": "exportItemsDialog" },
						"Export"
					)
				),
				React.createElement("li", { className: "divider selected-item-action" }),
				React.createElement(
					"li",
					{ className: "selected-item-action", hidden: !showItemAction },
					React.createElement(
						"a",
						{ href: "#", className: "send-to-library-button", onClick: this.triggerLibraryEvent, "data-triggers": "sendToLibraryDialog", title: "Copy to Library" },
						"Copy to Library"
					)
				),
				React.createElement("li", { className: "divider", hidden: !showItemAction }),
				React.createElement(
					"li",
					null,
					React.createElement(
						"a",
						{ href: "#", "data-triggers": "syncLibrary", onClick: this.triggerLibraryEvent },
						"Sync"
					)
				),
				React.createElement(
					"li",
					null,
					React.createElement(
						"a",
						{ href: "#", "data-triggers": "deleteIdb", onClick: this.triggerLibraryEvent },
						"Delete IDB"
					)
				)
			)
		);
	}
});

var CreateItemDropdown = React.createClass({
	displayName: "CreateItemDropdown",

	getDefaultProps: function getDefaultProps() {
		return {
			editable: false
		};
	},
	createItem: function createItem(evt) {
		//clear path vars and send to new item page with current collection when create-item-link clicked
		Z.debug("create-item-Link clicked", 3);
		evt.preventDefault();
		var library = this.props.library;
		var itemType = J(evt.target).data('itemtype');
		library.trigger("createItem", { itemType: itemType });
		return false;
	},
	render: function render() {
		var reactInstance = this;
		var itemTypes = Object.keys(Zotero.Item.prototype.typeMap);
		itemTypes = itemTypes.sort();
		var nodes = itemTypes.map(function (itemType, ind) {
			return React.createElement(
				"li",
				{ key: itemType },
				React.createElement(
					"a",
					{ onClick: reactInstance.createItem, href: "#", "data-itemtype": itemType },
					Zotero.Item.prototype.typeMap[itemType]
				)
			);
		});

		var buttonClass = "create-item-button btn btn-default navbar-btn dropdown-toggle";
		if (Zotero.state.getUrlVar('collectionKey') == 'trash') {
			buttonClass += " disabled";
		}

		return React.createElement(
			"div",
			{ className: "btn-group create-item-dropdown", hidden: !this.props.editable },
			React.createElement(
				"button",
				{ type: "button", className: buttonClass, "data-toggle": "dropdown", title: "New Item" },
				React.createElement("span", { className: "glyphicons fonticon glyphicons-plus" })
			),
			React.createElement(
				"ul",
				{ className: "dropdown-menu", role: "menu", style: { maxHeight: "300px", overflow: "auto" } },
				nodes
			)
		);
	}
});

var ControlPanel = React.createClass({
	displayName: "ControlPanel",

	componentWillMount: function componentWillMount() {
		var reactInstance = this;
		var library = this.props.library;

		reactInstance.setState({ user: Zotero.config.loggedInUser });

		library.listen("selectedItemsChanged", function (evt) {
			Z.debug("got selectedItemsChanged event in ControlPanel - setting selectedItems");
			Z.debug(evt);
			var selectedItemKeys = evt.data.selectedItemKeys;
			reactInstance.setState({ selectedItems: selectedItemKeys });
		}, {});

		library.listen("selectedCollectionChanged", function (evt) {
			var selectedCollection = Zotero.state.getUrlVar('collectionKey');
			var selectedItemKeys = Zotero.state.getSelectedItemKeys();
			reactInstance.setState({
				selectedCollection: selectedCollection,
				selectedItems: selectedItemKeys
			});
		}, {});
	},
	getDefaultProps: function getDefaultProps() {
		return {
			editable: false
		};
	},
	getInitialState: function getInitialState() {
		var selectedItems = Zotero.state.getSelectedItemKeys();
		return {
			user: false,
			selectedItems: selectedItems,
			selectedCollection: null
		};
	},
	render: function render() {
		return React.createElement(
			"div",
			{ id: "control-panel", className: "nav navbar-nav", role: "navigation" },
			React.createElement(
				"div",
				{ className: "btn-toolbar navbar-left" },
				React.createElement(GroupsButton, { library: this.props.library }),
				React.createElement(LibraryDropdown, { user: this.state.user, library: this.props.library }),
				React.createElement(ActionsDropdown, { library: this.props.library, itemSelected: this.state.selectedItems.length > 0, selectedCollection: this.state.selectedCollection, editable: this.props.editable }),
				React.createElement(CreateItemDropdown, { library: this.props.library, editable: this.props.editable })
			)
		);
	}
});
"use strict";

Zotero.ui.widgets.reactcreateCollectionDialog = {};

Zotero.ui.widgets.reactcreateCollectionDialog.init = function (el) {
	Z.debug("createcollectionsdialog widget init", 3);
	var library = Zotero.ui.getAssociatedLibrary(el);
	var reactInstance = ReactDOM.render(React.createElement(CreateCollectionDialog, { library: library }), document.getElementById('create-collection-dialog'));
};

var CreateCollectionDialog = React.createClass({
	displayName: "CreateCollectionDialog",

	componentWillMount: function componentWillMount() {
		var reactInstance = this;
		var library = this.props.library;

		library.listen("createCollectionDialog", function () {
			reactInstance.forceUpdate();
			reactInstance.openDialog();
		}, {});
	},
	getInitialState: function getInitialState() {
		return {
			collectionName: "",
			parentCollection: null
		};
	},
	handleCollectionChange: function handleCollectionChange(evt) {
		Z.debug(evt);
		Z.debug(evt.target.value);
		this.setState({ 'parentCollection': evt.target.value });
	},
	handleNameChange: function handleNameChange(evt) {
		this.setState({ 'collectionName': evt.target.value });
	},
	openDialog: function openDialog() {
		this.refs.modal.open();
	},
	closeDialog: function closeDialog(evt) {
		this.refs.modal.close();
	},
	createCollection: function createCollection() {
		Z.debug("react createCollection");
		var reactInstance = this;
		var library = this.props.library;
		var parentKey = this.state.parentCollection;
		var name = this.state.collectionName;
		if (name == "") {
			name = "Untitled";
		}

		library.addCollection(name, parentKey).then(function (responses) {
			library.collections.initSecondaryData();
			library.trigger('libraryCollectionsUpdated');
			Zotero.state.pushState();
			reactInstance.closeDialog();
			Zotero.ui.jsNotificationMessage("Collection Created", 'success');
		}).catch(function (error) {
			Zotero.ui.jsNotificationMessage("There was an error creating the collection.", "error");
			reactInstance.closeDialog();
		});
	},
	render: function render() {
		var library = this.props.library;
		var ncollections = library.collections.nestedOrderingArray();

		var collectionOptions = ncollections.map(function (collection, index) {
			return React.createElement(
				"option",
				{ key: collection.get('key'), value: collection.get('key') },
				'-'.repeat(collection.nestingDepth),
				" ",
				collection.get('name')
			);
		});
		collectionOptions.unshift(React.createElement(
			"option",
			{ key: "emptyvalue", value: "" },
			"None"
		));

		return React.createElement(
			BootstrapModalWrapper,
			{ ref: "modal" },
			React.createElement(
				"div",
				{ id: "create-collection-dialog", className: "create-collection-dialog", role: "dialog", title: "Create Collection", "data-keyboard": "true" },
				React.createElement(
					"div",
					{ className: "modal-dialog" },
					React.createElement(
						"div",
						{ className: "modal-content" },
						React.createElement(
							"div",
							{ className: "modal-header" },
							React.createElement(
								"button",
								{ type: "button", className: "close", "data-dismiss": "modal", "aria-hidden": "true" },
								"×"
							),
							React.createElement(
								"h3",
								null,
								"Create Collection"
							)
						),
						React.createElement(
							"div",
							{ className: "new-collection-div modal-body", "data-role": "content" },
							React.createElement(
								"form",
								{ method: "POST" },
								React.createElement(
									"div",
									{ "data-role": "fieldcontain" },
									React.createElement(
										"label",
										{ htmlFor: "new-collection-title-input" },
										"Collection Name"
									),
									React.createElement("input", { onChange: this.handleNameChange, className: "new-collection-title-input form-control", type: "text" })
								),
								React.createElement(
									"div",
									{ "data-role": "fieldcontain" },
									React.createElement(
										"label",
										{ htmlFor: "new-collection-parent" },
										"Parent Collection"
									),
									React.createElement(
										"select",
										{ onChange: this.handleCollectionChange, className: "collectionKey-select new-collection-parent form-control", defaultValue: "" },
										collectionOptions
									)
								)
							)
						),
						React.createElement(
							"div",
							{ className: "modal-footer" },
							React.createElement(
								"button",
								{ onClick: this.closeDialog, className: "btn", "data-dismiss": "modal", "aria-hidden": "true" },
								"Close"
							),
							React.createElement(
								"button",
								{ onClick: this.createCollection, className: "btn btn-primary createButton" },
								"Create"
							)
						)
					)
				)
			)
		);
	}
});
"use strict";

Zotero.ui.widgets.reactcreateItemDialog = {};

Zotero.ui.widgets.reactcreateItemDialog.init = function (el) {
	Z.debug("createItemDialog widget init", 3);
	var library = Zotero.ui.getAssociatedLibrary(el);
	var reactInstance = ReactDOM.render(React.createElement(CreateItemDialog, { library: library }), document.getElementById('create-item-dialog'));
};

var CreateItemDialog = React.createClass({
	displayName: "CreateItemDialog",

	componentWillMount: function componentWillMount() {
		var reactInstance = this;
		var library = this.props.library;
		library.listen("createItem", function (evt) {
			var itemType = evt.data.itemType;
			reactInstance.setState({ itemType: itemType });
			reactInstance.openDialog();
		}, {});
	},
	getInitialState: function getInitialState() {
		return {
			title: "",
			itemType: "document"
		};
	},
	handleTitleChange: function handleTitleChange(evt) {
		this.setState({ 'title': evt.target.value });
	},
	createItem: function createItem(evt) {
		evt.preventDefault();
		var reactInstance = this;
		var library = this.props.library;
		var itemType = this.state.itemType;
		var currentCollectionKey = Zotero.state.getUrlVar('collectionKey');
		var title = reactInstance.state.title;
		if (title == "") {
			title = "Untitled";
		}

		var item = new Zotero.Item();
		item.initEmpty(itemType).then(function () {
			item.associateWithLibrary(library);
			item.set('title', title);
			if (currentCollectionKey) {
				item.addToCollection(currentCollectionKey);
			}
			return Zotero.ui.saveItem(item);
		}).then(function (responses) {
			var itemKey = item.get('key');
			Zotero.state.setUrlVar('itemKey', itemKey);
			Zotero.state.pushState();
			library.trigger("displayedItemsChanged");
			reactInstance.closeDialog();
		}).catch(function (error) {
			Zotero.error(error);
			Zotero.ui.jsNotificationMessage("There was an error creating the item.", "error");
			reactInstance.closeDialog();
		});
	},
	openDialog: function openDialog() {
		this.refs.modal.open();
	},
	closeDialog: function closeDialog(evt) {
		this.refs.modal.close();
	},
	render: function render() {
		return React.createElement(
			BootstrapModalWrapper,
			{ ref: "modal" },
			React.createElement(
				"div",
				{ id: "create-item-dialog", className: "create-item-dialog", role: "dialog", title: "Create Item", "data-keyboard": "true" },
				React.createElement(
					"div",
					{ className: "modal-dialog" },
					React.createElement(
						"div",
						{ className: "modal-content" },
						React.createElement(
							"div",
							{ className: "modal-header" },
							React.createElement(
								"button",
								{ type: "button", className: "close", "data-dismiss": "modal", "aria-hidden": "true" },
								"×"
							),
							React.createElement(
								"h3",
								null,
								"Create Item"
							)
						),
						React.createElement(
							"div",
							{ className: "new-item-div modal-body", "data-role": "content" },
							React.createElement(
								"form",
								{ onSubmit: this.createItem, method: "POST" },
								React.createElement(
									"div",
									{ "data-role": "fieldcontain" },
									React.createElement(
										"label",
										{ htmlFor: "new-item-title-input" },
										"Title"
									),
									React.createElement("input", { onChange: this.handleTitleChange, id: "new-item-title-input", className: "new-item-title-input form-control", type: "text" })
								)
							)
						),
						React.createElement(
							"div",
							{ className: "modal-footer" },
							React.createElement(
								"button",
								{ className: "btn", "data-dismiss": "modal", "aria-hidden": "true" },
								"Close"
							),
							React.createElement(
								"button",
								{ onClick: this.createItem, className: "btn btn-primary createButton" },
								"Create"
							)
						)
					)
				)
			)
		);
	}
});
"use strict";

Zotero.ui.widgets.reactdeleteCollectionDialog = {};

Zotero.ui.widgets.reactdeleteCollectionDialog.init = function (el) {
	Z.debug("deletecollectionsdialog widget init", 3);
	var library = Zotero.ui.getAssociatedLibrary(el);
	var reactInstance = ReactDOM.render(React.createElement(DeleteCollectionDialog, { library: library }), document.getElementById('delete-collection-dialog'));
};

var DeleteCollectionDialog = React.createClass({
	displayName: "DeleteCollectionDialog",

	componentWillMount: function componentWillMount() {
		var reactInstance = this;
		var library = this.props.library;

		library.listen("deleteCollectionDialog", function () {
			reactInstance.setState({ collectionKey: Zotero.state.getUrlVar("collectionKey") });
			reactInstance.openDialog();
		});
	},
	getInitialState: function getInitialState() {
		return {
			collectionKey: null
		};
	},
	handleCollectionChange: function handleCollectionChange(evt) {
		this.setState({ 'parentCollection': evt.target.value });
	},
	deleteCollection: function deleteCollection() {
		Z.debug("DeleteCollectionDialog.deleteCollection", 3);
		var reactInstance = this;
		var library = this.props.library;
		var collection = library.collections.getCollection(this.state.collectionKey);
		if (!collection) {
			Zotero.ui.jsNotificationMessage("Selected collection not found", 'error');
			return false;
		}
		collection.remove().then(function () {
			delete Zotero.state.pathVars['collectionKey'];
			library.collections.dirty = true;
			library.collections.initSecondaryData();
			Zotero.state.pushState();
			Zotero.ui.jsNotificationMessage(collection.get('title') + " removed", 'confirm');
			reactInstance.closeDialog();
		}).catch(Zotero.catchPromiseError);
		return false;
	},
	openDialog: function openDialog() {
		if (!this.state.collectionKey) {
			Z.error("DeleteCollectionDialog opened with no collectionKey");
		}
		this.refs.modal.open();
	},
	closeDialog: function closeDialog(evt) {
		this.refs.modal.close();
	},
	render: function render() {
		var library = this.props.library;
		var collection = library.collections.getCollection(this.state.collectionKey);
		if (!collection) {
			return null;
		}

		return React.createElement(
			BootstrapModalWrapper,
			{ ref: "modal" },
			React.createElement(
				"div",
				{ id: "delete-collection-dialog", className: "delete-collection-dialog", role: "dialog", title: "Delete Collection", "data-keyboard": "true" },
				React.createElement(
					"div",
					{ className: "modal-dialog" },
					React.createElement(
						"div",
						{ className: "modal-content" },
						React.createElement(
							"div",
							{ className: "modal-header" },
							React.createElement(
								"button",
								{ type: "button", className: "close", "data-dismiss": "modal", "aria-hidden": "true" },
								"×"
							),
							React.createElement(
								"h3",
								null,
								"Delete Collection"
							)
						),
						React.createElement(
							"div",
							{ className: "delete-collection-div modal-body" },
							React.createElement(
								"p",
								null,
								"Really delete collection \"",
								collection.get('title'),
								"\"?"
							)
						),
						React.createElement(
							"div",
							{ className: "modal-footer" },
							React.createElement(
								"button",
								{ className: "btn", "data-dismiss": "modal", "aria-hidden": "true" },
								"Close"
							),
							React.createElement(
								"button",
								{ onClick: this.deleteCollection, className: "btn btn-primary deleteButton" },
								"Delete"
							)
						)
					)
				)
			)
		);
	}
});
"use strict";

Zotero.ui.widgets.reactexportItemsDialog = {};

Zotero.ui.widgets.reactexportItemsDialog.init = function (el) {
	Z.debug("exportItemDialog widget init", 3);
	var library = Zotero.ui.getAssociatedLibrary(el);
	var reactInstance = ReactDOM.render(React.createElement(ExportItemsDialog, { library: library }), document.getElementById('export-dialog'));
};

var ExportItemsDialog = React.createClass({
	displayName: "ExportItemsDialog",

	componentWillMount: function componentWillMount() {
		var reactInstance = this;
		var library = this.props.library;

		library.listen("exportItemsDialog", function () {
			Z.debug("opening export dialog");
			reactInstance.openDialog();
		}, {});
		library.listen("displayedItemsChanged", function () {
			reactInstance.forceUpdate();
		}, {});
	},
	getInitialState: function getInitialState() {
		return {};
	},
	openDialog: function openDialog() {
		this.refs.modal.open();
	},
	closeDialog: function closeDialog(evt) {
		this.refs.modal.close();
	},
	render: function render() {
		var library = this.props.library;
		var urlconfig = Zotero.ui.getItemsConfig(library);
		var exportUrls = Zotero.url.exportUrls(urlconfig);

		var exportNodes = Object.keys(exportUrls).map(function (key) {
			var exportUrl = exportUrls[key];
			return React.createElement(
				"li",
				{ key: key },
				React.createElement(
					"a",
					{ href: exportUrl, target: "_blank", className: "export-link", title: key, "data-exportformat": key },
					Zotero.config.exportFormatsMap[key]
				)
			);
		});

		return React.createElement(
			BootstrapModalWrapper,
			{ ref: "modal" },
			React.createElement(
				"div",
				{ id: "export-items-dialog", className: "export-items-dialog", role: "dialog", title: "Export", "data-keyboard": "true" },
				React.createElement(
					"div",
					{ className: "modal-dialog" },
					React.createElement(
						"div",
						{ className: "modal-content" },
						React.createElement(
							"div",
							{ className: "modal-header" },
							React.createElement(
								"button",
								{ type: "button", className: "close", "data-dismiss": "modal", "aria-hidden": "true" },
								"×"
							),
							React.createElement(
								"h3",
								null,
								"Export"
							)
						),
						React.createElement(
							"div",
							{ className: "modal-body", "data-role": "content" },
							React.createElement(
								"div",
								{ className: "export-list" },
								React.createElement(
									"ul",
									{ id: "export-formats-ul" },
									exportNodes
								)
							)
						),
						React.createElement(
							"div",
							{ className: "modal-footer" },
							React.createElement(
								"button",
								{ className: "btn btn-default", "data-dismiss": "modal", "aria-hidden": "true" },
								"Close"
							)
						)
					)
				)
			)
		);
	}
});
"use strict";

var FeedLink = React.createClass({
	displayName: "FeedLink",

	render: function render() {
		var library = this.props.library;
		var urlconfig = Zotero.ui.getItemsConfig(library);
		var requestUrl = Zotero.ajax.apiRequestUrl(urlconfig) + Zotero.ajax.apiQueryString(urlconfig, false);
		var feedUrl = requestUrl.replace(Zotero.config.baseApiUrl, Zotero.config.baseFeedUrl);
		var newkeyurl = Zotero.url.requestReadApiKeyUrl(library.libraryType, library.libraryID, feedUrl);
		var feedHref;
		if (!Zotero.config.librarySettings.publish) {
			feedHref = newkeyurl;
		} else {
			feedHref = feedUrl;
		}

		return React.createElement(
			"p",
			null,
			React.createElement(
				"a",
				{ href: feedHref, type: "application/atom+xml", rel: "alternate", className: "feed-link" },
				React.createElement("span", { className: "sprite-icon sprite-feed" }),
				"Subscribe to this feed"
			)
		);
	}
});
'use strict';

Zotero.ui.widgets.reactfilterGuide = {};

Zotero.ui.widgets.reactfilterGuide.init = function (el) {
	Z.debug('widgets.filterGuide.init', 3);
	var library = Zotero.ui.getAssociatedLibrary(el);
	var reactInstance = ReactDOM.render(React.createElement(FilterGuide, { library: library }), document.getElementById('filter-guide'));
};

var FilterGuide = React.createClass({
	displayName: 'FilterGuide',

	componentWillMount: function componentWillMount() {
		var reactInstance = this;
		var library = this.props.library;

		library.listen("displayedItemsChanged", reactInstance.refreshFilters, {});
		library.listen("displayedItemChanged", reactInstance.refreshFilters, {});
		library.listen("updateFilterGuide", reactInstance.refreshFilters, {});
		library.listen("selectedCollectionChanged", reactInstance.refreshFilters, {});
		library.listen("cachedDataLoaded", reactInstance.refreshFilters, {});
		library.listen("libraryCollectionsUpdated", reactInstance.refreshFilters, {});
	},
	getInitialState: function getInitialState() {
		return {
			collectionKey: "",
			tags: [],
			query: ""
		};
	},
	refreshFilters: function refreshFilters(evt) {
		var library = this.props.library;
		var displayConfig = Zotero.ui.getItemsConfig(library);
		this.setState({
			collectionKey: displayConfig['collectionKey'],
			tags: displayConfig['tag'],
			query: displayConfig['q']
		});
	},
	clearFilter: function clearFilter(evt) {
		evt.preventDefault();
		Z.debug('widgets.filterGuide.clearFilter', 3);
		var library = this.props.library;
		var target = J(evt.currentTarget);
		var collectionKey = target.data('collectionkey');
		var tag = target.data('tag');
		var query = target.data('query');
		if (collectionKey) {
			Zotero.state.unsetUrlVar('collectionKey');
			this.setState({ collectionKey: "" });
		}
		if (tag) {
			Zotero.state.toggleTag(tag);
			this.setState({ tags: Zotero.state.getUrlVar('tag') });
		}
		if (query) {
			library.trigger('clearLibraryQuery');
			this.setState({ query: "" });
			return;
		}
		Zotero.state.pushState();
	},
	render: function render() {
		var reactInstance = this;
		var library = this.props.library;
		var collectionNodes = null;
		var tagNodes = null;
		var searchNodes = null;

		if (this.state.collectionKey != "") {
			var collection = library.collections.getCollection(this.state.collectionKey);
			if (collection) {
				collectionNodes = React.createElement(
					'li',
					{ key: "collection_" + reactInstance.state.collectionKey, className: 'filterguide-entry' },
					React.createElement(
						'a',
						{ onClick: reactInstance.clearFilter, href: '#', 'data-collectionkey': reactInstance.state.collectionKey },
						React.createElement('span', { className: 'glyphicons fonticon glyphicons-folder-open' }),
						React.createElement(
							'span',
							{ className: 'filterguide-label' },
							collection.get('name')
						),
						React.createElement('span', { className: 'glyphicons fonticon glyphicons-remove' })
					)
				);
			}
		}

		var tags = this.state.tags;
		if (typeof tags == 'string') {
			tags = [tags];
		}
		if (tags) {
			tagNodes = tags.map(function (tag) {
				return React.createElement(
					'li',
					{ key: "tag_" + tag, className: 'filterguide-entry' },
					React.createElement(
						'a',
						{ onClick: reactInstance.clearFilter, href: '#', 'data-tag': tag },
						React.createElement('span', { className: 'glyphicons fonticon glyphicons-tag' }),
						React.createElement(
							'span',
							{ className: 'filterguide-label' },
							tag
						),
						React.createElement('span', { className: 'glyphicons fonticon glyphicons-remove' })
					)
				);
			});
		}
		if (this.state.query) {
			searchNodes = React.createElement(
				'li',
				{ key: "query_" + reactInstance.state.query, className: 'filterguide-entry' },
				React.createElement(
					'a',
					{ onClick: reactInstance.clearFilter, href: '#', 'data-query': reactInstance.state.query },
					React.createElement('span', { className: 'glyphicons fonticon glyphicons-search' }),
					React.createElement(
						'span',
						{ className: 'filterguide-label' },
						reactInstance.state.query
					),
					React.createElement('span', { className: 'glyphicons fonticon glyphicons-remove' })
				)
			);
		}

		return React.createElement(
			'div',
			{ id: 'filter-guide', className: 'filter-guide col-12' },
			React.createElement(
				'ul',
				{ className: 'filterguide-list' },
				collectionNodes,
				tagNodes,
				searchNodes
			)
		);
	}
});
'use strict';

Zotero.ui.widgets.inviteToGroup = {};

Zotero.ui.widgets.inviteToGroup.init = function (el) {
	Z.debug("Zotero.ui.widgets.inviteToGroup");
	//var library = Zotero.ui.getAssociatedLibrary(el);
	var reactInstance = ReactDOM.render(React.createElement(InviteButton, null), document.getElementById('invite-to-group-div'));
};

var InviteButton = React.createClass({
	displayName: 'InviteButton',

	handleClick: function handleClick(evt) {
		var invDialog = ReactDOM.render(React.createElement(InviteDialog, null), document.getElementById('invite-to-group-dialog'));
		invDialog.openDialog();
	},
	render: function render() {
		var reactInstance = this;
		if (!Zotero.config.loggedIn) {
			return null;
		}
		if (zoteroData.profileUserID == Zotero.config.loggedInUserID) {
			return null;
		}
		return React.createElement(
			'button',
			{ className: 'btn btn-primary', onClick: reactInstance.handleClick },
			'Invite to group'
		);
	}
});

var InviteDialog = React.createClass({
	displayName: 'InviteDialog',

	componentWillMount: function componentWillMount() {
		var reactInstance = this;
		var groups = new Zotero.Groups();
		if (Zotero.config.loggedIn && Zotero.config.loggedInUserID && zoteroData.profileUserID != Zotero.config.loggedInUserID) {
			reactInstance.setState({ loading: true });
			var groupsPromise = groups.fetchUserGroups(Zotero.config.loggedInUserID).then(function (response) {
				var groups = response.fetchedGroups;
				reactInstance.setState({ groups: groups, loading: false });
			}).catch(Zotero.catchPromiseError);
		}
	},
	getInitialState: function getInitialState() {
		return {
			groups: [],
			loading: false
		};
	},
	openDialog: function openDialog() {
		//this.setState({open:true});
		this.refs.modal.open();
	},
	closeDialog: function closeDialog(evt) {
		//this.setState({open:false});
		this.refs.modal.close();
	},
	inviteToGroup: function inviteToGroup(evt) {
		var reactInstance = this;
		Z.debug(evt);
		var groupID = J(evt.currentTarget).data('groupid');

		J.ajax({
			'type': 'POST',
			'url': "/groups/inviteuser",
			'data': {
				'groupID': groupID,
				'userID': zoteroData.profileUserID
			},
			'processData': true
		}).then(function (data) {
			Z.debug("got response from inviteuser");
			if (data == 'true') {
				Zotero.ui.jsNotificationMessage("User has been invited", 'success');
			}
		});
	},
	render: function render() {
		var reactInstance = this;
		var invitedGroupIDs = zoteroData.invitedGroupIDs;

		var groupNodes = reactInstance.state.groups.map(function (group) {
			if (invitedGroupIDs.indexOf(group.get('id').toString()) != -1) {
				return React.createElement(
					'li',
					{ key: group.get('id') },
					'Invitation pending to \'',
					group.get('name'),
					'\''
				);
			} else {
				return React.createElement(
					'li',
					{ key: group.get('id') },
					React.createElement(
						'button',
						{ className: 'btn btn-default', onClick: reactInstance.inviteToGroup, 'data-groupid': group.get('id') },
						group.get('name')
					)
				);
			}
		});

		return React.createElement(
			BootstrapModalWrapper,
			{ ref: 'modal' },
			React.createElement(
				'div',
				{ id: 'invite-user-dialog', className: 'invite-user-dialog', role: 'dialog', title: 'Invite User', 'data-keyboard': 'true' },
				React.createElement(
					'div',
					{ className: 'modal-dialog' },
					React.createElement(
						'div',
						{ className: 'modal-content' },
						React.createElement(
							'div',
							{ className: 'modal-header' },
							React.createElement(
								'button',
								{ type: 'button', className: 'close', 'data-dismiss': 'modal', 'aria-hidden': 'true' },
								'×'
							),
							React.createElement(
								'h3',
								null,
								'Invite User'
							)
						),
						React.createElement(
							'div',
							{ className: 'modal-body', 'data-role': 'content' },
							React.createElement(
								'ul',
								null,
								groupNodes
							)
						)
					)
				)
			)
		);
	}
});
"use strict";

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

Zotero.ui.widgets.reactitem = {};
//TODO: trigger showChildren with an extra itemID filter so quick clicks back and forth
//between items don't overwrite with the wrong children?
Zotero.ui.widgets.reactitem.init = function (el) {
	var library = Zotero.ui.getAssociatedLibrary(el);

	var reactInstance = ReactDOM.render(React.createElement(ItemDetails, { library: library }), document.getElementById('item-widget-div'));
};

Zotero.ui.editMatches = function (props, edit) {
	if (props === null || edit === null) {
		return false;
	}
	if (edit.field != props.field) {
		return false;
	}
	//field is the same, make sure index matches if set
	if (edit.creatorIndex != props.creatorIndex) {
		//Z.debug("creatorIndex mismatch");
		return false;
	}
	if (props.tagIndex != edit.tagIndex) {
		//Z.debug("tagIndex mismatch");
		return false;
	}
	return true;
};

Zotero.ui.genericDisplayedFields = function (item) {
	var genericDisplayedFields = Object.keys(item.apiObj.data).filter(function (field) {
		if (item.hideFields.indexOf(field) != -1) {
			return false;
		}
		if (!item.fieldMap.hasOwnProperty(field)) {
			return false;
		}
		if (field == "title" || field == "creators" || field == "itemType") {
			return false;
		}
		return true;
	});
	return genericDisplayedFields;
};

Zotero.ui.widgets.reactitem.editFields = function (item) {
	var fields = [{ field: "itemType" }, { field: "title" }];
	var creators = item.get('creators');
	creators.forEach(function (k, i) {
		fields.push({ field: "creatorType", creatorIndex: i });
		if (k.name) {
			fields.push({ field: "name", creatorIndex: i });
		} else {
			fields.push({ field: "lastName", creatorIndex: i });
			fields.push({ field: "firstName", creatorIndex: i });
		}
	});

	var genericFields = Zotero.ui.genericDisplayedFields(item);
	genericFields.forEach(function (k) {
		fields.push({ field: k });
	});
	return fields;
};

//take an edit object and return the edit object selecting the next field of the item
Zotero.ui.widgets.reactitem.nextEditField = function (item, edit) {
	if (!edit || !edit.field) {
		return null;
	}
	var editFields = Zotero.ui.widgets.reactitem.editFields(item);
	var curFieldIndex;
	for (var i = 0; i < editFields.length; i++) {
		if (editFields[i].field == edit.field) {
			if (editFields[i].creatorIndex == edit.creatorIndex) {
				curFieldIndex = i;
			}
		}
	}
	if (curFieldIndex == editFields.length) {
		return editFields[0];
	} else {
		return editFields[i + 1];
	}
};

var CreatorRow = React.createClass({
	displayName: "CreatorRow",

	getDefaultProps: function getDefaultProps() {
		return {
			item: null,
			library: null,
			creatorIndex: 0,
			edit: null
		};
	},
	render: function render() {
		//Z.debug("CreatorRow render");
		if (this.props.item == null) {
			return null;
		}
		var item = this.props.item;
		var creator = item.get('creators')[this.props.creatorIndex];
		var nameSpans = null;
		if (creator.name && creator.name != "") {
			nameSpans = React.createElement(ItemField, _extends({}, this.props, { key: "name", field: "name" }));
		} else {
			nameSpans = [React.createElement(ItemField, _extends({}, this.props, { key: "lastName", field: "lastName" })), ", ", React.createElement(ItemField, _extends({}, this.props, { key: "firstName", field: "firstName" }))];
		}
		return React.createElement(
			"tr",
			{ className: "creator-row" },
			React.createElement(
				"th",
				null,
				React.createElement(ItemField, _extends({}, this.props, { field: "creatorType" }))
			),
			React.createElement(
				"td",
				null,
				nameSpans,
				React.createElement(
					"div",
					{ className: "btn-toolbar", role: "toolbar" },
					React.createElement(ToggleCreatorFieldButton, this.props),
					React.createElement(AddRemoveCreatorFieldButtons, this.props)
				)
			)
		);
	}
});

var ToggleCreatorFieldButton = React.createClass({
	displayName: "ToggleCreatorFieldButton",

	render: function render() {
		//Z.debug("ToggleCreatorFieldButton render");
		return React.createElement(
			"div",
			{ className: "btn-group" },
			React.createElement(
				"button",
				{ type: "button",
					className: "switch-two-field-creator-link btn btn-default",
					title: "Toggle single field creator",
					"data-itemkey": this.props.item.get('key'),
					"data-creatorindex": this.props.creatorIndex,
					onClick: this.switchCreatorFields },
				React.createElement("span", { className: "fonticon glyphicons glyphicons-unchecked" })
			)
		);
	},
	switchCreatorFields: function switchCreatorFields(evt) {
		//Z.debug("CreatorRow switchCreatorFields");
		var creatorIndex = this.props.creatorIndex;
		var item = this.props.item;
		var creators = item.get('creators');
		var creator = creators[creatorIndex];

		//split a single name creator into first/last, or combine first/last
		//into a single name
		if (creator.name !== undefined) {
			var split = creator.name.split(' ');
			if (split.length > 1) {
				creator.lastName = split.splice(-1, 1)[0];
				creator.firstName = split.join(' ');
			} else {
				creator.lastName = creator.name;
				creator.firstName = '';
			}
			delete creator.name;
		} else {
			if (creator.firstName === "" && creator.lastName === "") {
				creator.name = "";
			} else {
				creator.name = creator.firstName + ' ' + creator.lastName;
			}
			delete creator.firstName;
			delete creator.lastName;
		}

		creators[creatorIndex] = creator;
		Zotero.ui.saveItem(item);
		this.props.parentItemDetailsInstance.setState({ item: item });
	}
});

var AddRemoveCreatorFieldButtons = React.createClass({
	displayName: "AddRemoveCreatorFieldButtons",

	render: function render() {
		//Z.debug("AddRemoveCreatorFieldButtons render");
		return React.createElement(
			"div",
			{ className: "btn-group" },
			React.createElement(
				"button",
				{ type: "button",
					className: "btn btn-default",
					"data-creatorindex": this.props.creatorIndex,
					onClick: this.removeCreator },
				React.createElement("span", { className: "fonticon glyphicons glyphicons-minus" })
			),
			React.createElement(
				"button",
				{ type: "button",
					className: "btn btn-default",
					"data-creatorindex": this.props.creatorIndex,
					onClick: this.addCreator },
				React.createElement("span", { className: "fonticon glyphicons glyphicons-plus" })
			)
		);
	},
	addCreator: function addCreator(evt) {
		Z.debug("addCreator");
		var item = this.props.item;
		var creatorIndex = this.props.creatorIndex;
		var creators = item.get('creators');
		var newCreator = { creatorType: "author", firstName: "", lastName: "" };
		creators.splice(creatorIndex + 1, 0, newCreator);
		this.props.parentItemDetailsInstance.setState({
			item: item,
			edit: {
				field: "lastName",
				creatorIndex: creatorIndex + 1
			}
		});
	},
	removeCreator: function removeCreator(evt) {
		Z.debug("removeCreator");
		var creatorIndex = this.props.creatorIndex;
		var item = this.props.item;
		var creators = item.get('creators');
		creators.splice(creatorIndex, 1);
		Zotero.ui.saveItem(item);
		this.props.parentItemDetailsInstance.setState({ item: item });
	}
});

var ItemNavTabs = React.createClass({
	displayName: "ItemNavTabs",

	getDefaultProps: function getDefaultProps() {
		return {
			item: null
		};
	},
	render: function render() {
		Z.debug("ItemNavTabs render");
		if (this.props.item == null) {
			return null;
		}
		if (!this.props.item.isSupplementaryItem()) {
			return React.createElement(
				"ul",
				{ className: "nav nav-tabs", role: "tablist" },
				React.createElement(
					"li",
					{ role: "presentation", className: "active" },
					React.createElement(
						"a",
						{ href: "#item-info-panel", "aria-controls": "item-info-panel", role: "tab", "data-toggle": "tab" },
						"Info"
					)
				),
				React.createElement(
					"li",
					{ role: "presentation" },
					React.createElement(
						"a",
						{ href: "#item-children-panel", "aria-controls": "item-children-panel", role: "tab", "data-toggle": "tab" },
						"Children"
					)
				),
				React.createElement(
					"li",
					{ role: "presentation" },
					React.createElement(
						"a",
						{ href: "#item-tags-panel", "aria-controls": "item-tags-panel", role: "tab", "data-toggle": "tab" },
						"Tags"
					)
				)
			);
		}
		return null;
	}
});

var ItemFieldRow = React.createClass({
	displayName: "ItemFieldRow",

	getDefaultProps: function getDefaultProps() {
		return {
			item: null,
			edit: null
		};
	},
	render: function render() {
		//Z.debug("ItemFieldRow render");
		var item = this.props.item;
		var field = this.props.field;
		var placeholderOrValue = React.createElement(ItemField, { item: item, field: field, edit: this.props.edit, parentItemDetailsInstance: this.props.parentItemDetailsInstance });

		if (field == 'url') {
			var url = item.get('url');
			return React.createElement(
				"tr",
				null,
				React.createElement(
					"th",
					null,
					React.createElement(
						"a",
						{ rel: "nofollow", href: url },
						item.fieldMap[field]
					)
				),
				React.createElement(
					"td",
					{ className: field },
					placeholderOrValue
				)
			);
		} else if (field == 'DOI') {
			var doi = item.get('DOI');
			return React.createElement(
				"tr",
				null,
				React.createElement(
					"th",
					null,
					React.createElement(
						"a",
						{ rel: "nofollow", href: 'http://dx.doi.org/' + doi },
						item.fieldMap[field]
					)
				),
				React.createElement(
					"td",
					{ className: field },
					placeholderOrValue
				)
			);
		} else if (Zotero.config.richTextFields[field]) {
			return React.createElement(
				"tr",
				null,
				React.createElement(
					"th",
					null,
					item.fieldMap[field],
					"}"
				),
				React.createElement(
					"td",
					{ className: field },
					placeholderOrValue
				)
			);
		} else {
			return React.createElement(
				"tr",
				null,
				React.createElement(
					"th",
					null,
					item.fieldMap[field] || field
				),
				React.createElement(
					"td",
					{ className: field },
					placeholderOrValue
				)
			);
		}
	}
});

//set onChange
var ItemField = React.createClass({
	displayName: "ItemField",

	getDefaultProps: function getDefaultProps() {
		return {
			item: null,
			field: null,
			edit: null,
			creatorIndex: null,
			tagIndex: null
		};
	},
	handleChange: function handleChange(evt) {
		Z.debug("change on ItemField");
		Z.debug(evt);
		//set field to new value
		var item = this.props.item;
		switch (this.props.field) {
			case "creatorType":
			case "name":
			case "firstName":
			case "lastName":
				var creators = item.get('creators');
				var creator = creators[this.props.creatorIndex];
				creator[this.props.field] = evt.target.value;
				break;
			case "tag":
				var tags = item.get('tags');
				var tag = tags[this.props.tagIndex];
				tag.tag = evt.target.value;
				break;
			default:
				item.set(this.props.field, evt.target.value);
		}
		this.props.parentItemDetailsInstance.setState({ item: item });
	},
	handleBlur: function handleBlur(evt) {
		Z.debug("blur on ItemField");
		//save item, move edit to next field
		Z.debug("handleBlur");
		this.handleChange(evt);
		this.props.parentItemDetailsInstance.setState({ edit: null });
		Zotero.ui.saveItem(this.props.item);
	},
	handleFocus: function handleFocus(evt) {
		Z.debug("focus on ItemField");
		var field = J(evt.currentTarget).data('field');
		var creatorIndex = J(evt.target).data('creatorindex');
		var tagIndex = J(evt.target).data('tagindex');
		var edit = {
			field: field,
			creatorIndex: creatorIndex,
			tagIndex: tagIndex
		};
		Z.debug(edit);
		this.props.parentItemDetailsInstance.setState({
			edit: edit
		});
	},
	checkKey: function checkKey(evt) {
		Z.debug("ItemField checkKey");
		evt.stopPropagation();
		if (evt.keyCode === Zotero.ui.keyCode.ENTER) {
			//var nextEdit = Zotero.ui.widgets.reactitem.nextEditField(this.props.item, this.props.edit);
			J(evt.target).blur();
		}
	},
	render: function render() {
		//Z.debug("ItemField render");
		var item = this.props.item;
		var field = this.props.field;
		var creatorField = false;
		var tagField = false;
		var value;
		switch (field) {
			case "creatorType":
			case "name":
			case "firstName":
			case "lastName":
				creatorField = true;
				var creatorIndex = this.props.creatorIndex;
				var creator = item.get('creators')[creatorIndex];
				value = creator[field];
				var creatorPlaceHolders = {
					'name': '(name)',
					'lastName': '(Last Name)',
					'firstName': '(First Name)'
				};

				break;
			case "tag":
				tagField = true;
				var tagIndex = this.props.tagIndex;
				var tag = item.get('tags')[tagIndex];
				value = tag.tag;
				break;
			default:
				value = item.get(field);
		}

		var editThisField = Zotero.ui.editMatches(this.props, this.props.edit);
		if (!editThisField) {
			var spanProps = {
				className: "editable-item-field",
				tabIndex: 0,
				"data-field": field,
				onFocus: this.handleFocus
			};

			var p = null;
			if (creatorField) {
				spanProps.className += " creator-field";
				spanProps['data-creatorindex'] = this.props.creatorIndex;
				p = value == "" ? creatorPlaceHolders[field] : value;
			} else if (tagField) {
				spanProps.className += " tag-field";
				spanProps['data-tagindex'] = this.props.tagIndex;
				p = value;
			} else {
				p = value == "" ? React.createElement("div", { className: "empty-field-placeholder" }) : Zotero.ui.formatItemField(field, item);
			}
			return React.createElement(
				"span",
				spanProps,
				p
			);
		}

		var focusEl = function focusEl(el) {
			if (el != null) {
				el.focus();
			}
		};

		var inputProps = {
			className: "form-control item-field-control " + this.props.field,
			name: field,
			defaultValue: value,
			//onChange: this.handleChange,
			onKeyDown: this.checkKey,
			onBlur: this.handleBlur,
			creatorindex: this.props.creatorIndex,
			tagindex: this.props.tagIndex,
			ref: focusEl
		};
		if (creatorField) {
			inputProps.placeholder = creatorPlaceHolders[field];
		}

		switch (this.props.field) {
			case null:
				return null;
				break;
			case 'itemType':
				var itemTypeOptions = item.itemTypes.map(function (itemType) {
					return React.createElement(
						"option",
						{ key: itemType.itemType,
							label: itemType.localized,
							value: itemType.itemType },
						itemType.localized
					);
				});
				return React.createElement(
					"select",
					inputProps,
					itemTypeOptions
				);
				break;
			case 'creatorType':
				var creatorTypeOptions = item.creatorTypes[item.get('itemType')].map(function (creatorType) {
					return React.createElement(
						"option",
						{ key: creatorType.creatorType,
							label: creatorType.localized,
							value: creatorType.creatorType
						},
						creatorType.localized
					);
				});
				return React.createElement(
					"select",
					_extends({ id: "creatorType" }, inputProps, { "data-creatorindex": this.props.creatorIndex }),
					creatorTypeOptions
				);
				break;
			default:
				if (Zotero.config.largeFields[this.props.field]) {
					return React.createElement("textarea", inputProps);
				} else if (Zotero.config.richTextFields[this.props.field]) {
					return React.createElement("textarea", _extends({}, inputProps, { className: "rte default" }));
				} else {
					//default single line input field
					return React.createElement("input", _extends({ type: "text" }, inputProps));
				}
		}
	}
});

var ItemInfoPanel = React.createClass({
	displayName: "ItemInfoPanel",

	getDefaultProps: function getDefaultProps() {
		return {
			item: null,
			loading: false,
			edit: null
		};
	},
	render: function render() {
		Z.debug("ItemInfoPanel render");
		var reactInstance = this;
		var library = this.props.library;
		var item = this.props.item;
		Z.debug("ItemInfoPanel render: items.totalResults: " + library.items.totalResults);
		var itemCountP = React.createElement(
			"p",
			{ className: "item-count", hidden: !this.props.libraryItemsLoaded },
			library.items.totalResults + " items in this view"
		);

		var edit = this.props.edit;

		if (item == null) {
			return React.createElement(
				"div",
				{ id: "item-info-panel", role: "tabpanel", className: "item-details-div tab-pane active" },
				React.createElement(LoadingSpinner, { loading: this.props.loading }),
				itemCountP
			);
		}

		var itemKey = item.get('key');
		var libraryType = item.owningLibrary.libraryType;
		var parentUrl = false;
		if (item.get("parentItem")) {
			parentUrl = library.websiteUrl({ itemKey: item.get("parentItem") });
		}

		var parentLink = parentUrl ? React.createElement(
			"a",
			{ href: parentUrl, className: "item-select-link", "data-itemkey": item.get('parentItem') },
			"Parent Item"
		) : null;
		var libraryIDSpan;
		if (libraryType == "user") {
			libraryIDSpan = React.createElement("span", { id: "libraryUserID", title: item.apiObj.library.id });
		} else {
			libraryIDSpan = React.createElement("span", { id: "libraryGroupID", title: item.apiObj.library.id });
		}

		//the Zotero user that created the item, if it's a group library item
		var zoteroItemCreatorRow = null;
		if (libraryType == "group") {
			zoteroItemCreatorRow = React.createElement(
				"tr",
				null,
				React.createElement(
					"th",
					null,
					"Added by"
				),
				React.createElement(
					"td",
					{ className: "user-creator" },
					React.createElement(
						"a",
						{ href: item.apiObj.meta.createdByUser.links.alternate.href, className: "user-link" },
						item.apiObj.meta.createdByUser.name
					)
				)
			);
		}

		var creatorRows = [];
		var creators = item.get('creators');
		if (creators.length == 0) {
			creators.push({
				lastName: "",
				firstName: ""
			});
		}

		if (item.isSupplementaryItem()) {
			creatorRows = null;
		} else {
			creatorRows = item.get('creators').map(function (creator, ind) {
				return React.createElement(CreatorRow, { key: ind, library: library, creatorIndex: ind, item: item, edit: edit, parentItemDetailsInstance: reactInstance.props.parentItemDetailsInstance });
			});
		}

		var genericFieldRows = [];
		//filter out fields we don't want to display or don't want to include as generic
		var genericDisplayedFields = Zotero.ui.genericDisplayedFields(item);
		genericDisplayedFields.forEach(function (key) {
			genericFieldRows.push(React.createElement(ItemFieldRow, _extends({ key: key }, reactInstance.props, { field: key })));
		});

		var typeAndTitle = ["itemType", "title"].map(function (key) {
			return React.createElement(ItemFieldRow, _extends({ key: key }, reactInstance.props, { field: key }));
		});

		return React.createElement(
			"div",
			{ id: "item-info-panel", role: "tabpanel", className: "item-details-div tab-pane active" },
			React.createElement(LoadingSpinner, { loading: this.props.loading }),
			parentLink,
			libraryIDSpan,
			React.createElement(
				"table",
				{ className: "item-info-table table", "data-itemkey": itemKey },
				React.createElement(
					"tbody",
					null,
					zoteroItemCreatorRow,
					typeAndTitle,
					creatorRows,
					genericFieldRows
				)
			)
		);
	}
});

var TagListRow = React.createClass({
	displayName: "TagListRow",

	getDefaultProps: function getDefaultProps() {
		return {
			tagIndex: 0,
			tag: { tag: "" },
			item: null,
			library: null,
			edit: null
		};
	},
	removeTag: function removeTag(evt) {
		var tag = this.props.tag.tag;
		var item = this.props.item;
		var tagIndex = this.props.tagIndex;

		var tags = item.get('tags');
		tags.splice(tagIndex, 1);
		Zotero.ui.saveItem(item);
		this.props.parentItemDetailsInstance.setState({ item: item });
	},
	render: function render() {
		//Z.debug("TagListRow render");
		return React.createElement(
			"div",
			{ className: "row item-tag-row" },
			React.createElement(
				"div",
				{ className: "col-xs-1" },
				React.createElement("span", { className: "glyphicons fonticon glyphicons-tag" })
			),
			React.createElement(
				"div",
				{ className: "col-xs-9" },
				React.createElement(ItemField, _extends({}, this.props, { field: "tag" }))
			),
			React.createElement(
				"div",
				{ className: "col-xs-2" },
				React.createElement(
					"button",
					{ type: "button", className: "remove-tag-link btn btn-default", onClick: this.removeTag },
					React.createElement("span", { className: "glyphicons fonticon glyphicons-minus" })
				)
			)
		);
	}
});

var ItemTagsPanel = React.createClass({
	displayName: "ItemTagsPanel",

	getInitialState: function getInitialState() {
		return {
			newTagString: ""
		};
	},
	newTagChange: function newTagChange(evt) {
		this.setState({ newTagString: evt.target.value });
	},
	//add the new tag to the item and save if keydown is ENTER
	checkKey: function checkKey(evt) {
		Z.debug("New tag checkKey");
		evt.stopPropagation();
		if (evt.keyCode === Zotero.ui.keyCode.ENTER) {
			Z.debug(evt);
			var item = this.props.item;
			var tags = item.get('tags');
			tags.push({
				tag: evt.target.value
			});
			Zotero.ui.saveItem(item);
			this.setState({ newTagString: "" });
			this.props.parentItemDetailsInstance.setState({ item: item });
		}
	},
	render: function render() {
		Z.debug("ItemTagsPanel render");
		var reactInstance = this;
		var item = this.props.item;
		var library = this.props.library;
		if (item == null) {
			return React.createElement("div", { id: "item-tags-panel", role: "tabpanel", className: "item-tags-div tab-pane" });
		}

		var tagRows = item.apiObj.data.tags.map(function (tag, ind) {
			return React.createElement(TagListRow, _extends({ key: tag.tag }, reactInstance.props, { tag: tag, tagIndex: ind }));
		});

		return React.createElement(
			"div",
			{ id: "item-tags-panel", role: "tabpanel", className: "item-tags-div tab-pane" },
			React.createElement(
				"p",
				null,
				React.createElement(
					"span",
					{ className: "tag-count" },
					item.get('tags').length
				),
				" tags"
			),
			React.createElement(
				"button",
				{ className: "add-tag-button btn btn-default" },
				"Add Tag"
			),
			React.createElement(
				"div",
				{ className: "item-tags-list" },
				tagRows
			),
			React.createElement(
				"div",
				{ className: "add-tag-form form-horizontal" },
				React.createElement(
					"div",
					{ className: "form-group" },
					React.createElement(
						"div",
						{ className: "col-xs-1" },
						React.createElement(
							"label",
							{ htmlFor: "add-tag-input" },
							React.createElement("span", { className: "glyphicons fonticon glyphicons-tag" })
						)
					),
					React.createElement(
						"div",
						{ className: "col-xs-11" },
						React.createElement("input", { type: "text", onKeyDown: this.checkKey, onChange: this.newTagChange, value: this.state.newTagString, id: "add-tag-input", className: "add-tag-input form-control" })
					)
				)
			)
		);
	}
});

var ItemChildrenPanel = React.createClass({
	displayName: "ItemChildrenPanel",

	getDefaultProps: function getDefaultProps() {
		return {
			childItems: []
		};
	},
	triggerUpload: function triggerUpload() {
		this.props.library.trigger("uploadAttachment");
	},
	render: function render() {
		Z.debug("ItemChildrenPanel render");
		var childListEntries = this.props.childItems.map(function (item) {
			var title = item.get('title');
			var href = Zotero.url.itemHref(item);
			var iconClass = item.itemTypeIconClass();
			var key = item.get('key');
			if (item.itemType == "note") {
				return React.createElement(
					"li",
					{ key: key },
					React.createElement("span", { className: 'fonticon barefonticon ' + iconClass }),
					React.createElement(
						"a",
						{ className: "item-select-link", "data-itemkey": item.get('key'), href: href, title: title },
						title
					)
				);
			} else if (item.attachmentDownloadUrl == false) {
				return React.createElement(
					"li",
					{ key: key },
					React.createElement("span", { className: 'fonticon barefonticon ' + iconClass }),
					title,
					"(",
					React.createElement(
						"a",
						{ className: "item-select-link", "data-itemkey": item.get('key'), href: href, title: title },
						"Attachment Details"
					),
					")"
				);
			} else {
				var attachmentDownloadUrl = Zotero.url.attachmentDownloadUrl(item);
				return React.createElement(
					"li",
					{ key: key },
					React.createElement("span", { className: 'fonticon barefonticon ' + iconClass }),
					React.createElement(
						"a",
						{ className: "itemdownloadlink", href: attachmentDownloadUrl },
						title,
						" ",
						Zotero.url.attachmentFileDetails(item)
					),
					"(",
					React.createElement(
						"a",
						{ className: "item-select-link", "data-itemkey": item.get('key'), href: href, title: title },
						"Attachment Details"
					),
					")"
				);
			}
		});
		return React.createElement(
			"div",
			{ id: "item-children-panel", role: "tabpanel", className: "item-children-div tab-pane" },
			React.createElement(
				"ul",
				{ id: "notes-and-attachments" },
				childListEntries
			),
			React.createElement(
				"button",
				{ type: "button", onClick: this.triggerUpload, id: "upload-attachment-link", className: "btn btn-primary upload-attachment-button", hidden: !Zotero.config.librarySettings.allowUpload },
				"Upload File"
			)
		);
	}
});

var ItemDetails = React.createClass({
	displayName: "ItemDetails",

	getInitialState: function getInitialState() {
		return {
			item: null,
			childItems: [],
			itemLoading: false,
			childrenLoading: false,
			libraryItemsLoaded: false,
			edit: null
		};
	},
	componentWillMount: function componentWillMount() {
		var reactInstance = this;
		var library = this.props.library;
		library.listen("displayedItemChanged", reactInstance.loadItem, {});
		library.listen("uploadSuccessful", reactInstance.refreshChildren, {});

		library.listen("tagsChanged", reactInstance.updateTypeahead, {});

		library.listen("showChildren", reactInstance.refreshChildren, {});

		library.trigger("displayedItemChanged");
	},
	componentDidMount: function componentDidMount() {
		return;
		var reactInstance = this;
		var library = this.props.library;

		//add typeahead if there is a tag input
		var addTagInput = J("input.add-tag-input");
		var editTagInput = J("input.item-field-control.tag");

		var typeaheadSource = library.tags.plainList;
		if (!typeaheadSource) {
			typeaheadSource = [];
		}
		var ttEngine = new Bloodhound({
			datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
			queryTokenizer: Bloodhound.tokenizers.whitespace,
			local: J.map(typeaheadSource, function (typeaheadSource) {
				return { value: typeaheadSource };
			})
		});
		ttEngine.initialize();
		addTagInput.typeahead('destroy');
		editTagInput.typeahead('destroy');

		addTagInput.typeahead({
			hint: true,
			highlight: true,
			minLength: 1
		}, {
			name: 'tags',
			displayKey: 'value',
			source: ttEngine.ttAdapter()
			//local: library.tags.plainList
		});
		editTagInput.typeahead({
			hint: true,
			highlight: true,
			minLength: 1
		}, {
			name: 'tags',
			displayKey: 'value',
			source: ttEngine.ttAdapter()
			//local: library.tags.plainList
		});
	},
	loadItem: function loadItem() {
		Z.debug('Zotero eventful loadItem', 3);
		var reactInstance = this;
		var library = this.props.library;

		//clean up RTEs before we end up removing their dom elements out from under them
		//Zotero.ui.cleanUpRte(widgetEl);

		//get the key of the item we need to display, or display library stats
		var itemKey = Zotero.state.getUrlVar('itemKey');
		if (!itemKey) {
			Z.debug("No itemKey - " + itemKey, 3);
			reactInstance.setState({ item: null });
			return Promise.reject(new Error("No itemkey - " + itemKey));
		}

		//if we are showing an item, load it from local library of API
		//then display it
		var loadedItem = library.items.getItem(itemKey);
		var loadingPromise;
		if (loadedItem) {
			Z.debug("have item locally, loading details into ui", 3);
			loadingPromise = Promise.resolve(loadedItem);
		} else {
			Z.debug("must fetch item from server", 3);
			reactInstance.setState({ itemLoading: true });
			loadingPromise = library.loadItem(itemKey);
		}

		loadingPromise.then(function (item) {
			loadedItem = item;
		}).then(function () {
			return loadedItem.getCreatorTypes(loadedItem.get('itemType'));
		}).then(function (creatorTypes) {
			Z.debug("done loading necessary data; displaying item");
			reactInstance.setState({ item: loadedItem, itemLoading: false });
			library.trigger('showChildren');
			//Zotero.eventful.initTriggers(widgetEl);
			try {
				//trigger event for Zotero translator detection
				var ev = document.createEvent('HTMLEvents');
				ev.initEvent('ZoteroItemUpdated', true, true);
				document.dispatchEvent(ev);
			} catch (e) {
				Zotero.error("Error triggering ZoteroItemUpdated event");
			}
		});
		loadingPromise.catch(function (err) {
			Z.error("loadItem promise failed");
			Z.error(err);
		}).then(function () {
			reactInstance.setState({ itemLoading: false });
		}).catch(Zotero.catchPromiseError);

		return loadingPromise;
	},
	refreshChildren: function refreshChildren() {
		Z.debug('reactitem.refreshChildren', 3);
		var reactInstance = this;
		var library = this.props.library;

		var itemKey = Zotero.state.getUrlVar('itemKey');
		if (!itemKey) {
			Z.debug("No itemKey - " + itemKey, 3);
			return Promise.reject(new Error("No itemkey - " + itemKey));
		}

		var item = library.items.getItem(itemKey);
		reactInstance.setState({ loadingChildren: true });
		var p = item.getChildren(library).then(function (childItems) {
			reactInstance.setState({ childItems: childItems, loadingChildren: false });
		}).catch(Zotero.catchPromiseError);
		return p;
	},
	updateTypeahead: function updateTypeahead() {
		Z.debug("updateTypeahead", 3);
		return;
		var reactInstance = this;
		var library = this.props.library;
		if (library) {
			reactInstance.addTagTypeahead();
		}
	},
	addTagTypeahead: function addTagTypeahead() {
		//TODO: reactify
		Z.debug('adding typeahead', 3);
		var reactInstance = this;
		var library = this.props.library;

		var typeaheadSource = library.tags.plainList;
		if (!typeaheadSource) {
			typeaheadSource = [];
		}
		var ttEngine = new Bloodhound({
			datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
			queryTokenizer: Bloodhound.tokenizers.whitespace,
			local: J.map(typeaheadSource, function (typeaheadSource) {
				return { value: typeaheadSource };
			})
		});
		ttEngine.initialize();
		widgetEl.find("input.taginput").typeahead('destroy');
		widgetEl.find("input.taginput").typeahead({
			hint: true,
			highlight: true,
			minLength: 1
		}, {
			name: 'tags',
			displayKey: 'value',
			source: ttEngine.ttAdapter()
			//local: library.tags.plainList
		});
	},
	addTagTypeaheadToInput: function addTagTypeaheadToInput() {
		//TODO: reactify
		Z.debug('adding typeahead', 3);
		var reactInstance = this;
		var library = this.props.library;
		var typeaheadSource = library.tags.plainList;
		if (!typeaheadSource) {
			typeaheadSource = [];
		}
		var ttEngine = new Bloodhound({
			datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
			queryTokenizer: Bloodhound.tokenizers.whitespace,
			local: J.map(typeaheadSource, function (typeaheadSource) {
				return { value: typeaheadSource };
			})
		});
		ttEngine.initialize();
		J(element).typeahead('destroy');
		J(element).typeahead({
			hint: true,
			highlight: true,
			minLength: 1
		}, {
			name: 'tags',
			displayKey: 'value',
			source: ttEngine.ttAdapter()
			//local: library.tags.plainList
		});
	},
	render: function render() {
		Z.debug("ItemDetails render");
		var reactInstance = this;
		var library = this.props.library;
		var item = this.state.item;
		var childItems = this.state.childItems;

		return React.createElement(
			"div",
			{ role: "tabpanel" },
			React.createElement(ItemNavTabs, { library: library, item: item }),
			React.createElement(
				"div",
				{ className: "tab-content" },
				React.createElement(ItemInfoPanel, { library: library,
					item: item,
					loading: this.state.itemLoading,
					libraryItemsLoaded: this.state.libraryItemsLoaded,
					edit: this.state.edit,
					parentItemDetailsInstance: reactInstance
				}),
				React.createElement(ItemChildrenPanel, { parentItemDetailsInstance: reactInstance, library: library, childItems: childItems, loading: this.state.childrenLoading }),
				React.createElement(ItemTagsPanel, { parentItemDetailsInstance: reactInstance, library: library, item: item, edit: this.state.edit })
			)
		);
	}
});
'use strict';

Zotero.ui.widgets.reactitems = {};

Zotero.ui.widgets.reactitems.init = function (el) {
	Z.debug("widgets.items.init", 3);
	var library = Zotero.ui.getAssociatedLibrary(el);

	var reactInstance = ReactDOM.render(React.createElement(Items, { library: library }), document.getElementById('library-items-div'));
};

Zotero.ui.getItemsConfig = function (library) {
	var effectiveUrlVars = ['tag', 'collectionKey', 'order', 'sort', 'q', 'qmode'];
	var urlConfigVals = {};
	J.each(effectiveUrlVars, function (index, value) {
		var t = Zotero.state.getUrlVar(value);
		if (t) {
			urlConfigVals[value] = t;
		}
	});

	var defaultConfig = {
		libraryID: library.libraryID,
		libraryType: library.libraryType,
		target: 'items',
		targetModifier: 'top',
		limit: library.preferences.getPref('itemsPerPage')
	};

	var userPreferencesApiArgs = {
		order: Zotero.preferences.getPref('order'),
		sort: Zotero.preferences.getPref('sort'),
		limit: library.preferences.getPref('itemsPerPage')
	};

	//Build config object that should be displayed next and compare to currently displayed
	var newConfig = J.extend({}, defaultConfig, userPreferencesApiArgs, urlConfigVals);

	//don't allow ordering by group only columns if user library
	if (library.libraryType == 'user' && Zotero.Library.prototype.groupOnlyColumns.indexOf(newConfig.order) != -1) {
		newConfig.order = 'title';
	}

	if (!newConfig.sort) {
		newConfig.sort = Zotero.config.sortOrdering[newConfig.order];
	}

	//don't pass top if we are searching for tags (or query?)
	if (newConfig.tag || newConfig.q) {
		delete newConfig.targetModifier;
	}

	return newConfig;
};

var Items = React.createClass({
	displayName: 'Items',

	componentWillMount: function componentWillMount() {
		var reactInstance = this;
		var library = this.props.library;

		library.listen("changeItemSorting", reactInstance.resortTriggered);
		library.listen("displayedItemsChanged", reactInstance.loadItems, {});
		library.listen("displayedItemChanged", reactInstance.selectDisplayed);
		Zotero.listen("selectedItemsChanged", function () {
			reactInstance.setState({ selectedItemKeys: Zotero.state.getSelectedItemKeys() });
		});
		library.listen("selectedItemsChanged", function () {
			reactInstance.setState({ selectedItemKeys: Zotero.state.getSelectedItemKeys() });
		});

		library.listen("selectedCollectionChanged", function () {
			Zotero.state.selectedItemKeys = [];
			library.trigger("selectedItemsChanged", { selectedItemKeys: [] });
		});

		library.listen("loadMoreItems", reactInstance.loadMoreItems, {});
		library.trigger("displayedItemsChanged");
	},
	getDefaultProps: function getDefaultProps() {
		return {
			narrow: false
		};
	},
	getInitialState: function getInitialState() {
		return {
			moreloading: false,
			allItemsLoaded: false,
			errorLoading: false,
			items: [],
			selectedItemKeys: [],
			allSelected: false,
			displayFields: ["title", "creator", "dateModified"],
			order: "title",
			sort: "asc"
		};
	},
	loadItems: function loadItems() {
		Z.debug('Items.loadItems', 3);
		var reactInstance = this;
		var library = this.props.library;
		var newConfig = Zotero.ui.getItemsConfig(library);

		//clear contents and show spinner while loading
		this.setState({ items: [], moreloading: true });

		var p = library.loadItems(newConfig).then(function (response) {
			if (!response.loadedItems) {
				Zotero.error("expected loadedItems on response not present");
				throw "Expected response to have loadedItems";
			}
			library.items.totalResults = response.totalResults;
			var allLoaded = response.totalResults == response.loadedItems.length;
			reactInstance.setState({
				items: response.loadedItems,
				moreloading: false,
				sort: newConfig.sort,
				order: newConfig.order,
				allItemsLoaded: allLoaded
			});
		}).catch(function (response) {
			Z.error(response);
			reactInstance.setState({
				errorLoading: true,
				moreloading: false,
				sort: newConfig.sort,
				order: newConfig.order
			});
		});
		return p;
	},
	loadMoreItems: function loadMoreItems() {
		Z.debug('Items.loadMoreItems', 3);
		var reactInstance = this;
		var library = this.props.library;

		//bail out if we're already fetching more items
		if (reactInstance.state.moreloading) {
			return;
		}
		//bail out if we're done loading all items
		if (reactInstance.state.allItemsLoaded) {
			return;
		}

		reactInstance.setState({ moreloading: true });
		var library = reactInstance.props.library;
		var newConfig = Zotero.ui.getItemsConfig(library);
		var newStart = reactInstance.state.items.length;
		newConfig.start = newStart;

		var p = library.loadItems(newConfig).then(function (response) {
			if (!response.loadedItems) {
				Zotero.error("expected loadedItems on response not present");
				throw "Expected response to have loadedItems";
			}
			var allitems = reactInstance.state.items.concat(response.loadedItems);
			reactInstance.setState({ items: allitems, moreloading: false });

			//see if we're displaying as many items as there are in results
			var itemsDisplayed = allitems.length;
			if (response.totalResults == itemsDisplayed) {
				reactInstance.setState({ allItemsLoaded: true });
			}
		}).catch(function (response) {
			Z.error(response);
			reactInstance.setState({ errorLoading: true, moreloading: false });
		});
	},
	resortItems: function resortItems(evt) {
		//handle click on the item table header to re-sort items
		//if it is the currently sorted field, simply flip the sort order
		//if it is not the currently sorted field, set it to be the currently sorted
		//field and set the default ordering for that field
		Z.debug(".field-table-header clicked", 3);
		evt.preventDefault();
		var reactInstance = this;
		var library = this.props.library;
		var currentSortField = this.state.order;
		var currentSortOrder = this.state.sort;

		var newSortField = J(evt.target).data('columnfield');
		var newSortOrder;
		if (newSortField != currentSortField) {
			newSortOrder = Zotero.config.sortOrdering[newSortField]; //default for column
		} else {
				//swap sort order
				if (currentSortOrder == "asc") {
					newSortOrder = "desc";
				} else {
					newSortOrder = "asc";
				}
			}

		//only allow ordering by the fields we have
		if (library.sortableColumns.indexOf(newSortField) == -1) {
			return false;
		}

		//problem if there was no sort column mapped to the header that got clicked
		if (!newSortField) {
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
	},
	resortTriggered: function resortTriggered(evt) {
		Z.debug("resortTriggered");
		Z.debug(evt);
		//re-sort triggered from another widget
		var reactInstance = this;
		var library = this.props.library;
		var currentSortField = this.state.order;
		var currentSortOrder = this.state.sort;

		var newSortField = evt.data.newSortField;
		var newSortOrder = evt.data.newSortOrder;

		//only allow ordering by the fields we have
		if (library.sortableColumns.indexOf(newSortField) == -1) {
			return false;
		}

		//problem if there was no sort column mapped to the header that got clicked
		if (!newSortField) {
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
	},
	//select and highlight in the itemlist the item  that is displayed
	//in the item details widget
	selectDisplayed: function selectDisplayed() {
		Z.debug('widgets.items.selectDisplayed', 3);
		Zotero.state.selectedItemKeys = [];
		this.setState({ selectedItemKeys: Zotero.state.getSelectedItemKeys(), allSelected: false });
	},
	fixTableHeaders: function fixTableHeaders() {
		if (J("body").hasClass('lib-body')) {
			var tableEl = J(this.refs.itemsTable);
			tableEl.floatThead({
				top: function top() {
					var searchContainerEl = J('.library-search-box-container:visible');
					var primaryNavEl = J('#primarynav');
					return searchContainerEl.height() ? primaryNavEl.height() + searchContainerEl.height() + 'px' : 0;
				}
			});
		}
	},
	handleSelectAllChange: function handleSelectAllChange(evt) {
		var library = this.props.library;
		var nowselected = [];
		var allSelected = false;
		if (evt.target.checked) {
			allSelected = true;
			//select all items
			this.state.items.forEach(function (item) {
				nowselected.push(item.get('key'));
			});
		} else {
			var selectedItemKey = Zotero.state.getUrlVar('itemKey');
			if (selectedItemKey) {
				nowselected.push(selectedItemKey);
			}
		}
		Zotero.state.selectedItemKeys = nowselected;
		this.setState({ selectedItemKeys: nowselected, allSelected: allSelected });
		library.trigger("selectedItemsChanged", { selectedItemKeys: nowselected });

		//if deselected all, reselect displayed item row
		if (nowselected.length === 0) {
			library.trigger('displayedItemChanged');
		}
	},
	openSortingDialog: function openSortingDialog(evt) {
		var library = this.props.library;
		library.trigger("chooseSortingDialog");
	},
	nonreactBind: function nonreactBind() {
		this.fixTableHeaders();
	},
	componentDidMount: function componentDidMount() {
		var reactInstance = this;
		reactInstance.nonreactBind();
	},
	componentDidUpdate: function componentDidUpdate() {
		this.nonreactBind();
	},
	render: function render() {
		var reactInstance = this;
		var library = this.props.library;
		var narrow = this.props.narrow;
		var order = this.state.order;
		var sort = this.state.sort;
		var selectedItemKeys = this.state.selectedItemKeys;
		var selectedItemKeyMap = {};
		selectedItemKeys.forEach(function (itemKey) {
			selectedItemKeyMap[itemKey] = true;
		});

		var sortIcon;
		if (sort == "desc") {
			sortIcon = React.createElement('span', { className: 'glyphicon fonticon glyphicon-chevron-down pull-right' });
		} else {
			sortIcon = React.createElement('span', { className: 'glyphicon fonticon glyphicon-chevron-up pull-right' });
		}

		var headers = [React.createElement(
			'th',
			{ key: 'checkbox-header' },
			React.createElement('input', { type: 'checkbox',
				className: 'itemlist-editmode-checkbox all-checkbox',
				name: 'selectall',
				checked: this.state.allSelected,
				onChange: this.handleSelectAllChange })
		)];
		if (narrow) {
			headers.push(React.createElement(
				'th',
				{ key: 'single-cell-header', onClick: reactInstance.openSortingDialog, className: 'clickable' },
				Zotero.Item.prototype.fieldMap[order],
				sortIcon
			));
		} else {
			var fieldHeaders = this.state.displayFields.map(function (header, ind) {
				var sortable = Zotero.Library.prototype.sortableColumns.indexOf(header) != -1;
				var selectedClass = header == order ? "selected-order sort-" + sort + " " : "";
				var sortspan = null;
				if (header == order) {
					sortspan = sortIcon;
				}
				return React.createElement(
					'th',
					{
						key: header,
						onClick: reactInstance.resortItems,
						className: "field-table-header " + selectedClass + (sortable ? "clickable " : ""),
						'data-columnfield': header },
					Zotero.Item.prototype.fieldMap[header] ? Zotero.Item.prototype.fieldMap[header] : header,
					sortspan
				);
			});
			headers = headers.concat(fieldHeaders);
		}

		var itemRows = this.state.items.map(function (item) {
			var selected = selectedItemKeyMap.hasOwnProperty(item.get('key')) ? true : false;
			var p = {
				itemsReactInstance: reactInstance,
				library: library,
				key: item.get("key"),
				item: item,
				selected: selected,
				narrow: narrow
			};
			return React.createElement(ItemRow, p);
		});
		if (itemRows.length == 0) {
			var tds = this.state.displayFields.map(function (header) {
				return React.createElement('td', { key: header });
			});
			tds = [React.createElement('td', { key: 'check' })].concat(tds);
			itemRows = React.createElement(
				'tr',
				null,
				tds
			);
		}
		return React.createElement(
			'div',
			{ id: 'library-items-div', className: 'library-items-div row', ref: 'topdiv' },
			React.createElement(
				'form',
				{ className: 'item-select-form', method: 'POST' },
				React.createElement(
					'table',
					{ id: 'field-table', ref: 'itemsTable', className: 'wide-items-table table table-striped' },
					React.createElement(
						'thead',
						null,
						React.createElement(
							'tr',
							null,
							headers
						)
					),
					React.createElement(
						'tbody',
						null,
						itemRows
					)
				),
				React.createElement(LoadingError, { errorLoading: this.state.errorLoading }),
				React.createElement(LoadingSpinner, { loading: this.state.moreloading }),
				React.createElement(
					'div',
					{ hidden: this.state.allItemsLoaded, id: 'load-more-items-div', className: 'row' },
					React.createElement(
						'button',
						{ onClick: this.loadMoreItems, type: 'button', id: 'load-more-items-button', className: 'btn btn-default' },
						'Load More Items'
					)
				)
			)
		);
	}
});

var ItemRow = React.createClass({
	displayName: 'ItemRow',

	getDefaultProps: function getDefaultProps() {
		return {
			displayFields: ["title", "creatorSummary", "dateModified"],
			selected: false,
			item: {},
			narrow: false
		};
	},
	handleSelectChange: function handleSelectChange(ev) {
		var reactInstance = this;
		var library = this.props.library;
		var itemKey = this.props.item.get('key');
		Zotero.state.toggleItemSelected(itemKey);
		var selected = Zotero.state.getSelectedItemKeys();
		library.trigger("selectedItemsChanged", { selectedItemKeys: selected });
	},
	handleItemLinkClick: function handleItemLinkClick(evt) {
		evt.preventDefault();
		var itemKey = J(evt.target).data('itemkey');
		Zotero.state.pathVars.itemKey = itemKey;
		Zotero.state.pushState();
	},
	render: function render() {
		var reactInstance = this;
		var item = this.props.item;
		var selected = this.props.selected;
		if (!this.props.narrow) {
			var fields = this.props.displayFields.map(function (field) {
				var ctags = null;
				if (field == "title") {
					ctags = React.createElement(ColoredTags, { item: item });
				}
				return React.createElement(
					'td',
					{ onClick: reactInstance.handleItemLinkClick, key: field, className: field, 'data-itemkey': item.get("key") },
					ctags,
					React.createElement(
						'a',
						{ onClick: reactInstance.handleItemLinkClick, className: 'item-select-link', 'data-itemkey': item.get("key"), href: Zotero.url.itemHref(item), title: item.get(field) },
						Zotero.ui.formatItemField(field, item, true)
					)
				);
			});
			return React.createElement(
				'tr',
				{ className: selected ? "highlighed" : "" },
				React.createElement(
					'td',
					{ className: 'edit-checkbox-td', 'data-itemkey': item.get("key") },
					React.createElement('input', { type: 'checkbox', onChange: this.handleSelectChange, checked: selected, className: 'itemlist-editmode-checkbox itemKey-checkbox', name: "selectitem-" + item.get("key"), 'data-itemkey': item.get("key") })
				),
				fields
			);
		} else {
			return React.createElement(
				'tr',
				{ className: selected ? "highlighed" : "", 'data-itemkey': item.get('key') },
				React.createElement(
					'td',
					{ className: 'edit-checkbox-td', 'data-itemkey': item.get('key') },
					React.createElement('input', { type: 'checkbox', className: 'itemlist-editmode-checkbox itemKey-checkbox', name: "selectitem-" + item.get('key'), 'data-itemkey': item.get('key') })
				),
				React.createElement(SingleCellItemField, { onClick: reactInstance.handleItemLinkClick, item: item, displayFields: this.props.displayFields })
			);
		}
	}
});

var SingleCellItemField = React.createClass({
	displayName: 'SingleCellItemField',

	render: function render() {
		var item = this.props.item;
		var field = this.props.field;

		var pps = [];
		this.props.displayFields.forEach(function (field) {
			var fieldDisplayName = Zotero.Item.prototype.fieldMap[field] ? Zotero.Item.prototype.fieldMap[field] + ":" : "";
			if (field == "title") {
				pps.push(React.createElement('span', { key: 'itemTypeIcon', className: 'sprite-icon pull-left sprite-treeitem-' + item.itemTypeImageClass() }));
				pps.push(React.createElement(ColoredTags, { key: 'coloredTags', item: item }));
				pps.push(React.createElement(
					'b',
					{ key: 'title' },
					Zotero.ui.formatItemField(field, item, true)
				));
			} else if (field === 'dateAdded' || field === 'dateModified') {
				pps.push(React.createElement('p', { key: field, title: item.get(field), dangerouslySetInnerHtml: { __html: fieldDisplayName + Zotero.ui.formatItemDateField(field, item, true) } }));
			} else {
				pps.push(React.createElement(
					'p',
					{ key: field, title: item.get(field) },
					fieldDisplayName,
					Zotero.ui.formatItemField(field, item, true)
				));
			}
		});
		return React.createElement(
			'td',
			{ onClick: this.props.onClick, className: 'single-cell-item', 'data-itemkey': item.get('key') },
			React.createElement(
				'a',
				{ className: 'item-select-link', 'data-itemkey': item.get('key'), href: Zotero.url.itemHref(item) },
				pps
			)
		);
	}
});

var ColoredTags = React.createClass({
	displayName: 'ColoredTags',

	render: function render() {
		var item = this.props.item;
		var library = item.owningLibrary;

		var coloredTags = library.matchColoredTags(item.apiObj._supplement.tagstrings);
		Z.debug("coloredTags:" + JSON.stringify(coloredTags));

		var ctags = coloredTags.map(function (color) {
			return React.createElement(ColoredTag, { key: color, color: color });
		});
		return React.createElement(
			'span',
			{ className: 'coloredTags' },
			ctags
		);
	}
});

var ColoredTag = React.createClass({
	displayName: 'ColoredTag',

	render: function render() {
		var styleObj = { color: this.props.color };
		//styleObj.color += " !important";
		return React.createElement(
			'span',
			{ style: styleObj },
			React.createElement('span', { style: styleObj, className: 'glyphicons fonticon glyphicons-tag' })
		);
	}
});
"use strict";

Zotero.ui.widgets.library = {};

Zotero.ui.widgets.library.init = function (el) {
	Z.debug("Zotero.ui.widgets.library.init");
	var library = Zotero.ui.getAssociatedLibrary(el);
	var reactInstance = ReactDOM.render(React.createElement(ReactZoteroLibrary, { library: library }), document.getElementById('library-widget'));
};

var ReactZoteroLibrary = React.createClass({
	displayName: "ReactZoteroLibrary",

	componentWillMount: function componentWillMount() {
		//preload library
		Z.debug("ReactZoteroLibrary componentWillMount", 3);
		var reactInstance = this;
		Zotero.reactLibraryInstance = reactInstance;
		var library = this.props.library;
		library.loadSettings();
		library.listen("deleteIdb", function () {
			library.idbLibrary.deleteDB();
		});
		library.listen("indexedDBError", function () {
			Zotero.ui.jsNotificationMessage("There was an error initializing your library. Some data may not load properly.", 'notice');
		});
		library.listen("cachedDataLoaded", function () {});

		J(window).on('resize', function () {
			if (!window.matchMedia("(min-width: 768px)").matches) {
				if (reactInstance.state.narrow != true) {
					reactInstance.setState({ narrow: true });
				}
			} else {
				if (reactInstance.state.narrow != false) {
					reactInstance.setState({ narrow: false });
				}
			}
		});
	},
	componentDidMount: function componentDidMount() {
		var reactInstance = this;
		var library = this.props.library;
		library.listen("displayedItemsChanged", function () {
			Z.debug("ReactZoteroLibrary displayedItemsChanged");
			reactInstance.refs.itemsWidget.loadItems();
		}, {});

		library.listen("tagsChanged libraryTagsUpdated selectedTagsChanged", function () {
			Z.debug("setting tags on tagsWidget from Library");
			reactInstance.refs.tagsWidget.setState({ tags: library.tags });
		});

		//trigger loading of more items on scroll reaching bottom
		J(reactInstance.refs.itemsPanel).on('scroll', function () {
			var jel = J(reactInstance.refs.itemsPanel);
			if (jel.scrollTop() + jel.innerHeight() >= jel[0].scrollHeight) {
				reactInstance.refs.itemsWidget.loadMoreItems();
			}
		});
	},
	getInitialState: function getInitialState() {
		var narrow;
		if (!window.matchMedia("(min-width: 768px)").matches) {
			Z.debug("Library set to narrow", 3);
			narrow = true;
		} else {
			narrow = false;
		}

		return {
			narrow: narrow,
			activePanel: "items",
			deviceSize: "xs"
		};
	},
	showFiltersPanel: function showFiltersPanel(evt) {
		evt.preventDefault();
		this.setState({ activePanel: "filters" });
	},
	showItemsPanel: function showItemsPanel(evt) {
		evt.preventDefault();
		this.setState({ activePanel: "items" });
	},
	reflowPanelContainer: function reflowPanelContainer() {},
	render: function render() {
		Z.debug("react library render");
		var reactInstance = this;
		var library = this.props.library;
		var user = Zotero.config.loggedInUser;
		var userDisplayName = user ? user.displayName : null;
		var base = Zotero.config.baseWebsiteUrl;
		var settingsUrl = base + "/settings";
		var inboxUrl = base + "/messages/inbox"; //TODO
		var downloadUrl = base + "/download";
		var documentationUrl = base + "/support";
		var forumsUrl = Zotero.config.baseForumsUrl; //TODO
		var logoutUrl = base + "/user/logout";
		var loginUrl = base + "/user/login";
		var homeUrl = base;
		var staticUrl = function staticUrl(path) {
			return base + "/static" + path;
		};

		var inboxText = user.unreadMessages > 0 ? React.createElement(
			"strong",
			null,
			"Inbox (",
			user.unreadMessages,
			")"
		) : "Inbox";
		var siteActionsMenu;

		if (user) {
			siteActionsMenu = [React.createElement(
				"button",
				{ key: "button", type: "button", href: "#", className: "btn btn-default navbar-btn dropdown-toggle", "data-toggle": "dropdown", role: "button", "aria-expanded": "false" },
				userDisplayName,
				React.createElement("span", { className: "caret" }),
				React.createElement(
					"span",
					{ className: "sr-only" },
					"Toggle Dropdown"
				)
			), React.createElement(
				"ul",
				{ key: "listEntries", className: "dropdown-menu", role: "menu" },
				React.createElement(
					"li",
					null,
					React.createElement(
						"a",
						{ href: settingsUrl },
						"Settings"
					)
				),
				React.createElement(
					"li",
					null,
					React.createElement(
						"a",
						{ href: inboxUrl },
						inboxText
					)
				),
				React.createElement(
					"li",
					null,
					React.createElement(
						"a",
						{ href: downloadUrl },
						"Download"
					)
				),
				React.createElement("li", { className: "divider" }),
				React.createElement(
					"li",
					null,
					React.createElement(
						"a",
						{ href: documentationUrl, className: "documentation" },
						"Documentation"
					)
				),
				React.createElement(
					"li",
					null,
					React.createElement(
						"a",
						{ href: forumsUrl, className: "forums" },
						"Forums"
					)
				),
				React.createElement("li", { className: "divider" }),
				React.createElement(
					"li",
					null,
					React.createElement(
						"a",
						{ href: logoutUrl },
						"Log Out"
					)
				)
			)];
		} else {
			siteActionsMenu = React.createElement(
				"div",
				{ className: "btn-group" },
				React.createElement(
					"a",
					{ href: loginUrl, className: "btn btn-default navbar-btn", role: "button" },
					"Log In"
				),
				React.createElement(
					"button",
					{ type: "button", href: "#", className: "btn btn-default navbar-btn dropdown-toggle", "data-toggle": "dropdown", role: "button", "aria-haspopup": "true", "aria-expanded": "false" },
					React.createElement("span", { className: "caret" }),
					React.createElement(
						"span",
						{ className: "sr-only" },
						"Toggle Dropdown"
					)
				),
				React.createElement(
					"ul",
					{ className: "dropdown-menu", role: "menu" },
					React.createElement(
						"li",
						null,
						React.createElement(
							"a",
							{ href: downloadUrl },
							"Download"
						)
					),
					React.createElement(
						"li",
						null,
						React.createElement(
							"a",
							{ href: documentationUrl, className: "documentation" },
							"Documentation"
						)
					),
					React.createElement(
						"li",
						null,
						React.createElement(
							"a",
							{ href: forumsUrl, className: "forums" },
							"Forums"
						)
					)
				)
			);
		}

		//figure out panel visibility based on state.activePanel
		var narrow = reactInstance.state.narrow;
		var leftPanelVisible = !narrow;
		var rightPanelVisible = !narrow;
		var itemsPanelVisible = !narrow;
		var itemPanelVisible = !narrow;
		var tagsPanelVisible = !narrow;
		var collectionsPanelVisible = !narrow;
		if (narrow) {
			switch (reactInstance.state.activePanel) {
				case "items":
					rightPanelVisible = true;
					itemsPanelVisible = true;
					break;
				case "item":
					rightPanelVisible = true;
					itemPanelVisible = true;
					break;
				case "tags":
					leftPanelVisible = true;
					tagsPanelVisible = true;
					break;
				case "collections":
					leftPanelVisible = true;
					collectionsPanelVisible = true;
					break;
				case "filters":
					leftPanelVisible = true;
					break;
			}
		}

		return React.createElement(
			"div",
			null,
			React.createElement(
				"nav",
				{ id: "primarynav", className: "navbar navbar-default", role: "navigation" },
				React.createElement(
					"div",
					{ className: "container-fluid" },
					React.createElement(
						"div",
						{ className: "navbar-header" },
						React.createElement(
							"button",
							{ type: "button", className: "navbar-toggle collapsed", "data-toggle": "collapse", "data-target": "#primary-nav-linklist" },
							userDisplayName,
							React.createElement(
								"span",
								{ className: "sr-only" },
								"Toggle navigation"
							),
							React.createElement("span", { className: "glyphicons fonticon glyphicons-menu-hamburger" })
						),
						React.createElement(
							"a",
							{ className: "navbar-brand hidden-sm hidden-xs", href: homeUrl },
							React.createElement("img", { src: staticUrl('/images/theme/zotero.png'), alt: "Zotero", height: "20px" })
						),
						React.createElement(
							"a",
							{ className: "navbar-brand visible-sm-block visible-xs-block", href: homeUrl },
							React.createElement("img", { src: staticUrl('/images/theme/zotero_theme/zotero_48.png'), alt: "Zotero", height: "24px" })
						)
					),
					React.createElement(
						"div",
						{ className: "collapse navbar-collapse", id: "primary-nav-linklist" },
						React.createElement(ControlPanel, { library: library, editable: Zotero.config.librarySettings.allowEdit, ref: "controlPanel" }),
						React.createElement(
							"ul",
							{ className: "nav navbar-nav navbar-right" },
							siteActionsMenu
						),
						React.createElement(
							"div",
							{ className: "btn-toolbar hidden-xs navbar-right" },
							React.createElement(LibrarySearchBox, { library: library })
						)
					)
				)
			),
			React.createElement(
				"div",
				{ id: "js-message" },
				React.createElement("ul", { id: "js-message-list" })
			),
			React.createElement(
				"div",
				{ id: "library", className: "row" },
				React.createElement(
					"div",
					{ id: "panel-container" },
					React.createElement(
						"div",
						{ id: "left-panel", hidden: !leftPanelVisible, className: "panelcontainer-panelcontainer col-xs-12 col-sm-4 col-md-3" },
						React.createElement(FilterGuide, { ref: "filterGuide", library: library }),
						React.createElement(
							"div",
							{ role: "tabpanel" },
							React.createElement(
								"ul",
								{ className: "nav nav-tabs", role: "tablist" },
								React.createElement(
									"li",
									{ role: "presentation", className: "active" },
									React.createElement(
										"a",
										{ href: "#collections-panel", "aria-controls": "collections-panel", role: "tab", "data-toggle": "tab" },
										"Collections"
									)
								),
								React.createElement(
									"li",
									{ role: "presentation" },
									React.createElement(
										"a",
										{ href: "#tags-panel", "aria-controls": "tags-panel", role: "tab", "data-toggle": "tab" },
										"Tags"
									)
								)
							),
							React.createElement(
								"div",
								{ className: "tab-content" },
								React.createElement(
									"div",
									{ id: "collections-panel", role: "tabpanel", className: "tab-pane active" },
									React.createElement(Collections, { ref: "collectionsWidget", library: library })
								),
								React.createElement(
									"div",
									{ id: "tags-panel", role: "tabpanel", className: "tab-pane" },
									React.createElement(Tags, { ref: "tagsWidget", library: library }),
									React.createElement(FeedLink, { ref: "feedLinkWidget", library: library })
								)
							)
						)
					),
					React.createElement(
						"div",
						{ id: "right-panel", hidden: !rightPanelVisible, className: "panelcontainer-panelcontainer col-xs-12 col-sm-8 col-md-9" },
						React.createElement(
							"div",
							{ hidden: !itemsPanelVisible, ref: "itemsPanel", id: "items-panel", className: "panelcontainer-panel col-sm-12 col-md-7" },
							React.createElement(
								"div",
								{ className: "visible-xs library-search-box-container" },
								React.createElement(LibrarySearchBox, { library: library })
							),
							React.createElement(Items, { ref: "itemsWidget", library: library, narrow: narrow })
						),
						React.createElement(
							"div",
							{ hidden: !itemPanelVisible, id: "item-panel", className: "panelcontainer-panel col-sm-12 col-md-5" },
							React.createElement(
								"div",
								{ id: "item-widget-div", className: "item-details-div" },
								React.createElement(ItemDetails, { ref: "itemWidget", library: library })
							)
						)
					),
					React.createElement(
						"nav",
						{ id: "panelcontainer-nav", className: "navbar navbar-default navbar-fixed-bottom visible-xs-block", role: "navigation" },
						React.createElement(
							"div",
							{ className: "container-fluid" },
							React.createElement(
								"ul",
								{ className: "nav navbar-nav" },
								React.createElement(
									"li",
									{ onClick: reactInstance.showFiltersPanel, className: "filters-nav" },
									React.createElement(
										"a",
										{ href: "#" },
										"Filters"
									)
								),
								React.createElement(
									"li",
									{ onClick: reactInstance.showItemsPanel, className: "items-nav" },
									React.createElement(
										"a",
										{ href: "#" },
										"Items"
									)
								)
							)
						)
					),
					React.createElement(SendToLibraryDialog, { ref: "sendToLibraryDialogWidget", library: library }),
					React.createElement(CreateCollectionDialog, { ref: "createCollectionDialogWidget", library: library }),
					React.createElement(UpdateCollectionDialog, { library: library }),
					React.createElement(DeleteCollectionDialog, { library: library }),
					React.createElement(AddToCollectionDialog, { library: library }),
					React.createElement(CreateItemDialog, { library: library }),
					React.createElement(CiteItemDialog, { library: library }),
					React.createElement(UploadAttachmentDialog, { library: library }),
					React.createElement(ExportItemsDialog, { library: library }),
					React.createElement(LibrarySettingsDialog, { library: library }),
					React.createElement(ChooseSortingDialog, { library: library })
				)
			)
		);
	}
});
'use strict';

Zotero.ui.widgets.reactlibrarysettingsdialog = {};

Zotero.ui.widgets.reactlibrarysettingsdialog.init = function (el) {
	Z.debug("librarysettingsdialog widget init", 3);
	var library = Zotero.ui.getAssociatedLibrary(el);
	var reactInstance = ReactDOM.render(React.createElement(LibrarySettingsDialog, { library: library }), document.getElementById('library-settings-dialog'));
};

var LibrarySettingsDialog = React.createClass({
	displayName: 'LibrarySettingsDialog',

	componentWillMount: function componentWillMount() {
		var reactInstance = this;
		var library = this.props.library;

		library.listen('settingsLoaded', reactInstance.updateStateFromLibrary, {});
		library.listen("librarySettingsDialog", reactInstance.openDialog, {});
	},
	getInitialState: function getInitialState() {
		return {
			listDisplayedFields: [],
			itemsPerPage: 25,
			showAutomaticTags: true
		};
	},
	openDialog: function openDialog() {
		this.refs.modal.open();
	},
	closeDialog: function closeDialog(evt) {
		this.refs.modal.close();
	},
	updateShowFields: function updateShowFields(evt) {
		Z.debug("updateShowFields");
		var library = this.props.library;
		var listDisplayedFields = this.state.listDisplayedFields;
		var fieldName = evt.target.value;
		var display = evt.target.checked;

		if (display) {
			Z.debug("adding field " + fieldName + " to listDisplayedFields");
			listDisplayedFields.push(fieldName);
		} else {
			Z.debug("filtering field " + fieldName + " from listDisplayedFields");

			listDisplayedFields = listDisplayedFields.filter(function (val) {
				if (val == fieldName) {
					return false;
				}
				return true;
			});
		}

		this.setState({
			listDisplayedFields: listDisplayedFields
		});

		library.preferences.setPref("listDisplayedFields", listDisplayedFields);
		library.preferences.persist();

		library.trigger("displayedItemsChanged");
	},
	updateShowAutomaticTags: function updateShowAutomaticTags(evt) {
		var library = this.props.library;
		var showAutomaticTags = evt.target.checked;

		this.setState({
			showAutomaticTags: showAutomaticTags
		});
		library.preferences.setPref("showAutomaticTags", showAutomaticTags);
		library.preferences.persist();

		library.trigger("tagsChanged");
	}, /*
    updateItemsPerPage: function(evt) {
    var library = this.props.library;
    var itemsPerPage = evt.target.value;
    this.setState({
    itemsPerPage: itemsPerPage
    });
    library.preferences.setPref('itemsPerPage', itemsPerPage);
    library.preferences.persist();
    library.preferences.setPref("listDisplayedFields", listDisplayedFields);
    },*/
	updateStateFromLibrary: function updateStateFromLibrary() {
		var library = this.props.library;
		this.setState({
			listDisplayedFields: library.preferences.getPref('listDisplayedFields'),
			itemsPerPage: library.preferences.getPref('itemsPerPage'),
			showAutomaticTags: library.preferences.getPref('showAutomaticTags')
		});
	},
	render: function render() {
		var reactInstance = this;
		var library = this.props.library;
		var listDisplayedFields = this.state.listDisplayedFields;
		var itemsPerPage = this.state.itemsPerPage;
		var showAutomaticTags = this.state.showAutomaticTags;
		var fieldMap = Zotero.localizations.fieldMap;

		var displayFieldNodes = Zotero.Library.prototype.displayableColumns.map(function (val, ind) {
			var checked = listDisplayedFields.indexOf(val) != -1;
			return React.createElement(
				'div',
				{ key: val, className: 'checkbox' },
				React.createElement(
					'label',
					{ htmlFor: "display-column-field-" + val },
					React.createElement('input', { onChange: reactInstance.updateShowFields, type: 'checkbox', checked: checked, name: 'display-column-field', value: val, id: "display-column-field-" + val, className: 'display-column-field' }),
					fieldMap[val] || val
				)
			);
		});

		return React.createElement(
			BootstrapModalWrapper,
			{ ref: 'modal' },
			React.createElement(
				'div',
				{ id: 'library-settings-dialog', className: 'library-settings-dialog', role: 'dialog', 'aria-hidden': 'true', 'data-keyboard': 'true' },
				React.createElement(
					'div',
					{ className: 'modal-dialog' },
					React.createElement(
						'div',
						{ className: 'modal-content' },
						React.createElement(
							'div',
							{ className: 'modal-header' },
							React.createElement(
								'button',
								{ type: 'button', className: 'close', 'data-dismiss': 'modal', 'aria-hidden': 'true' },
								'×'
							),
							React.createElement(
								'h3',
								{ className: 'modal-title' },
								'Library Settings'
							)
						),
						React.createElement(
							'div',
							{ className: 'modal-body' },
							React.createElement(
								'form',
								{ id: 'library-settings-form', className: 'library-settings-form', role: 'form' },
								React.createElement(
									'fieldset',
									null,
									React.createElement(
										'legend',
										null,
										'Display Columns'
									),
									displayFieldNodes
								),
								React.createElement(
									'div',
									{ className: 'checkbox' },
									React.createElement(
										'label',
										{ htmlFor: 'show-automatic-tags' },
										React.createElement('input', { onChange: this.updateShowAutomaticTags, type: 'checkbox', id: 'show-automatic-tags', name: 'show-automatic-tags' }),
										'Show Automatic Tags'
									),
									React.createElement(
										'p',
										{ className: 'help-block' },
										'Automatic tags are tags added automatically when a reference was imported, rather than by a user.'
									)
								)
							)
						),
						React.createElement(
							'div',
							{ className: 'modal-footer' },
							React.createElement(
								'button',
								{ className: 'btn btn-default', 'data-dismiss': 'modal', 'aria-hidden': 'true' },
								'Close'
							)
						)
					)
				)
			)
		);
	}
});
"use strict";

var LoadingError = React.createClass({
	displayName: "LoadingError",

	render: function render() {
		return React.createElement(
			"p",
			{ hidden: !this.props.errorLoading },
			"There was an error loading your items. Please try again in a few minutes."
		);
	}
});
'use strict';

var LoadingSpinner = React.createClass({
	displayName: 'LoadingSpinner',

	render: function render() {
		var spinnerUrl = Zotero.config.baseWebsiteUrl + '/static/images/theme/broken-circle-spinner.gif';
		return React.createElement(
			'div',
			{ className: 'items-spinner', hidden: !this.props.loading },
			React.createElement('img', { className: 'spinner', src: spinnerUrl })
		);
	}
});
'use strict';

Zotero.ui.widgets.profileGroupsList = {};

Zotero.ui.widgets.profileGroupsList.init = function (el) {
	Z.debug("Zotero.ui.widgets.profileGroupsList");
	//var library = Zotero.ui.getAssociatedLibrary(el);
	var userID = zoteroData.profileUserID;

	var reactInstance = ReactDOM.render(React.createElement(ProfileGroupsList, { userID: userID }), document.getElementById('profile-groups-div'));
};

var ProfileGroupsList = React.createClass({
	displayName: 'ProfileGroupsList',

	componentWillMount: function componentWillMount() {
		var reactInstance = this;
		var groups = new Zotero.Groups();
		reactInstance.setState({ loading: true });
		groups.fetchUserGroups(reactInstance.props.userID).then(function (response) {
			var groups = response.fetchedGroups;
			reactInstance.setState({ groups: groups, loading: false });
		}).catch(Zotero.catchPromiseError);
	},
	getInitialState: function getInitialState() {
		return {
			groups: [],
			loading: false
		};
	},
	render: function render() {
		var reactInstance = this;
		Z.debug(reactInstance.state.groups);

		var memberGroups = reactInstance.state.groups.map(function (group) {
			return React.createElement(
				'li',
				{ key: group.get('id') },
				React.createElement(
					'a',
					{ href: Zotero.url.groupViewUrl(group) },
					group.get('name')
				)
			);
		});

		return React.createElement(
			'div',
			{ className: 'profile-groups-list' },
			React.createElement(
				'h2',
				null,
				'Groups'
			),
			React.createElement(LoadingSpinner, { loading: reactInstance.state.loading }),
			React.createElement(
				'ul',
				null,
				memberGroups
			)
		);
	}
});
'use strict';

Zotero.ui.widgets.recentItems = {};

Zotero.ui.widgets.recentItems.init = function (el) {
    Z.debug("widgets.recentItems.init");

    var library = Zotero.ui.getAssociatedLibrary(el);

    var reactInstance = ReactDOM.render(React.createElement(RecentItems, { library: library }), el);
};

var RecentItems = React.createClass({
    displayName: 'RecentItems',

    componentWillMount: function componentWillMount() {
        var reactInstance = this;
        var library = reactInstance.props.library;
        reactInstance.setState({ loading: true });
        library.loadItems({
            'limit': 10,
            'order': 'dateModified'
        }).then(function (response) {
            reactInstance.setState({ loading: false, items: response.loadedItems });
        });
    },
    getDefaultProps: function getDefaultProps() {
        return {
            displayFields: ["title", "creatorSummary", "dateModified"],
            item: {}
        };
    },
    getInitialState: function getInitialState() {
        return {
            loading: false,
            items: []
        };
    },
    render: function render() {
        var reactInstance = this;
        var itemRows = this.state.items.map(function (item) {
            return React.createElement(RecentItemRow, { key: item.get("key"), item: item });
        });

        var headers = this.props.displayFields.map(function (header) {
            return React.createElement(
                'th',
                { key: header, className: 'field-table-header' },
                Zotero.Item.prototype.fieldMap[header] ? Zotero.Item.prototype.fieldMap[header] : header
            );
        });

        return React.createElement(
            'table',
            { id: 'field-table', ref: 'itemsTable', className: 'wide-items-table table table-striped' },
            React.createElement(
                'thead',
                null,
                React.createElement(
                    'tr',
                    null,
                    headers
                )
            ),
            React.createElement(
                'tbody',
                null,
                itemRows
            )
        );
    }
});

var RecentItemRow = React.createClass({
    displayName: 'RecentItemRow',

    getDefaultProps: function getDefaultProps() {
        return {
            displayFields: ["title", "creatorSummary", "dateModified"],
            item: {}
        };
    },
    render: function render() {
        var reactInstance = this;
        var item = this.props.item;
        var fields = this.props.displayFields.map(function (field) {
            return React.createElement(
                'td',
                { key: field, className: field, 'data-itemkey': item.get("key") },
                React.createElement(
                    'a',
                    { 'data-itemkey': item.get("key"), href: Zotero.url.itemHref(item), title: item.get(field) },
                    Zotero.ui.formatItemField(field, item, true)
                )
            );
        });
        return React.createElement(
            'tr',
            null,
            fields
        );
    }
});
"use strict";

Zotero.ui.widgets.reactsearchbox = {};

Zotero.ui.widgets.reactsearchbox.init = function (el) {
	Z.debug("Zotero.eventful.init.searchbox", 3);
	var library = Zotero.ui.getAssociatedLibrary(el);
	var container = J(el);

	var reactInstance = ReactDOM.render(React.createElement(LibrarySearchBox, { library: library }), document.getElementById('search-box'));
};

var LibrarySearchBox = React.createClass({
	displayName: "LibrarySearchBox",

	getInitialState: function getInitialState() {
		return {
			searchType: "simple"
		};
	},
	search: function search(evt) {
		evt.preventDefault();
		Z.debug("library-search form submitted", 3);
		Zotero.state.clearUrlVars(['collectionKey', 'tag', 'q', 'qmode']);
		var container = J(evt.target);
		var query = container.find('input.search-query').val();
		var searchType = container.find('input.search-query').data('searchtype');
		if (query !== "" || Zotero.state.getUrlVar('q')) {
			Zotero.state.pathVars['q'] = query;
			if (searchType != "simple") {
				Zotero.state.pathVars['qmode'] = searchType;
			}
			Zotero.state.pushState();
		}
		return false;
	},
	clearLibraryQuery: function clearLibraryQuery(evt) {
		Zotero.state.unsetUrlVar('q');
		Zotero.state.unsetUrlVar('qmode');

		J(".search-query").val("");
		Zotero.state.pushState();
		return;
	},
	changeSearchType: function changeSearchType(evt) {
		evt.preventDefault();
		var selected = J(evt.target);
		var selectedType = selected.data('searchtype');
		this.setState({ searchType: selectedType });
	},
	render: function render() {
		var placeHolder = "";
		if (this.state.searchType == 'simple') {
			placeHolder = 'Search Title, Creator, Year';
		} else if (this.state.searchType == 'everything') {
			placeHolder = 'Search Full Text';
		}
		var defaultValue = Zotero.state.getUrlVar('q');

		return React.createElement(
			"div",
			{ className: "btn-toolbar row", id: "search-box", style: { maxWidth: "350px" } },
			React.createElement(
				"form",
				{ action: "/search/", onSubmit: this.search, className: "navbar-form zsearch library-search", role: "search" },
				React.createElement(
					"div",
					{ className: "input-group" },
					React.createElement(
						"div",
						{ className: "input-group-btn" },
						React.createElement(
							"button",
							{ type: "button", className: "btn btn-default dropdown-toggle", "data-toggle": "dropdown" },
							React.createElement("span", { className: "caret" })
						),
						React.createElement(
							"ul",
							{ className: "dropdown-menu" },
							React.createElement(
								"li",
								null,
								React.createElement(
									"a",
									{ href: "#", onClick: this.changeSearchType, "data-searchtype": "simple" },
									"Title, Creator, Year"
								)
							),
							React.createElement(
								"li",
								null,
								React.createElement(
									"a",
									{ href: "#", onClick: this.changeSearchType, "data-searchtype": "everything" },
									"Full Text"
								)
							)
						)
					),
					React.createElement("input", { defaultValue: defaultValue, type: "text", name: "q", id: "header-search-query", className: "search-query form-control", placeholder: placeHolder }),
					React.createElement(
						"span",
						{ className: "input-group-btn" },
						React.createElement(
							"button",
							{ onClick: this.clearLibraryQuery, className: "btn btn-default clear-field-button", type: "button" },
							React.createElement("span", { className: "glyphicons fonticon glyphicons-remove-2" })
						)
					)
				)
			)
		);
	}
});
"use strict";

Zotero.ui.widgets.reactsendToLibraryDialog = {};

Zotero.ui.widgets.reactsendToLibraryDialog.init = function (el) {
	Z.debug("sendToLibraryDialog widget init", 3);
	var library = Zotero.ui.getAssociatedLibrary(el);
	var reactInstance = ReactDOM.render(React.createElement(SendToLibraryDialog, { library: library }), document.getElementById('send-to-library-dialog'));
};

var SendToLibraryDialog = React.createClass({
	displayName: "SendToLibraryDialog",

	componentWillMount: function componentWillMount() {
		var reactInstance = this;
		var library = this.props.library;
		library.listen("sendToLibraryDialog", reactInstance.openDialog, {});
	},
	getInitialState: function getInitialState() {
		return {
			writableLibraries: [],
			loading: false,
			loaded: false
		};
	},
	handleLibraryChange: function handleLibraryChange(evt) {
		this.setState({ targetLibrary: evt.target.value });
	},
	openDialog: function openDialog() {
		this.refs.modal.open();
		if (!this.state.loaded) {
			this.loadForeignLibraries();
		}
	},
	closeDialog: function closeDialog(evt) {
		this.refs.modal.close();
	},
	loadForeignLibraries: function loadForeignLibraries() {
		var reactInstance = this;
		var library = this.props.library;
		var userID = Zotero.config.loggedInUserID;
		var personalLibraryString = 'u' + userID;

		this.setState({ loading: true });

		var memberGroups = library.groups.fetchUserGroups(userID).then(function (response) {
			Z.debug("got member groups", 3);
			var memberGroups = response.fetchedGroups;
			var writableLibraries = [{ name: 'My Library', libraryString: personalLibraryString }];
			for (var i = 0; i < memberGroups.length; i++) {
				if (memberGroups[i].isWritable(userID)) {
					var libraryString = 'g' + memberGroups[i].get('id');
					writableLibraries.push({
						name: memberGroups[i].get('name'),
						libraryString: libraryString
					});
				}
			}
			reactInstance.setState({ writableLibraries: writableLibraries, loading: false, loaded: true });
		}).catch(function (err) {
			Zotero.ui.jsNotificationMessage("There was an error loading group libraries", "error");
			Z.error(err);
			Z.error(err.message);
		});
	},
	sendItem: function sendItem(evt) {
		Z.debug("sendToLibrary callback", 3);
		var library = this.props.library;
		//instantiate destination library
		var targetLibrary = this.state.targetLibrary;
		var destLibConfig = Zotero.utils.parseLibString(targetLibrary);
		var destLibrary = new Zotero.Library(destLibConfig.libraryType, destLibConfig.libraryID);
		Zotero.libraries[targetLibrary] = destLibrary;

		//get items to send
		var itemKeys = Zotero.state.getSelectedItemKeys();
		if (itemKeys.length === 0) {
			Zotero.ui.jsNotificationMessage("No items selected", 'notice');
			this.closeDialog();
			return false;
		}

		var sendItems = library.items.getItems(itemKeys);
		library.sendToLibrary(sendItems, destLibrary).then(function (foreignItems) {
			Zotero.ui.jsNotificationMessage("Items sent to other library", 'notice');
		}).catch(function (response) {
			Z.debug(response);
			Zotero.ui.jsNotificationMessage("Error sending items to other library", 'notice');
		});
		this.closeDialog();
		return false;
	},
	render: function render() {
		var destinationLibraries = this.state.writableLibraries;
		var libraryOptions = destinationLibraries.map(function (lib) {
			return React.createElement(
				"option",
				{ key: lib.libraryString, value: lib.libraryString },
				lib.name
			);
		});
		return React.createElement(
			BootstrapModalWrapper,
			{ ref: "modal" },
			React.createElement(
				"div",
				{ id: "send-to-library-dialog", className: "send-to-library-dialog", role: "dialog", "aria-hidden": "true", title: "Send to Library", "data-keyboard": "true" },
				React.createElement(
					"div",
					{ className: "modal-dialog" },
					React.createElement(
						"div",
						{ className: "modal-content" },
						React.createElement(
							"div",
							{ className: "modal-header" },
							React.createElement(
								"button",
								{ type: "button", className: "close", "data-dismiss": "modal", "aria-hidden": "true" },
								"×"
							),
							React.createElement(
								"h3",
								null,
								"Send To Library"
							)
						),
						React.createElement(
							"div",
							{ className: "send-to-library-div modal-body", "data-role": "content" },
							React.createElement(
								"form",
								null,
								React.createElement(
									"div",
									{ "data-role": "fieldcontain" },
									React.createElement(
										"label",
										{ htmlFor: "destination-library" },
										"Library"
									),
									React.createElement(
										"select",
										{ onChange: this.handleLibraryChange, className: "destination-library-select form-control", name: "desination-library" },
										libraryOptions
									)
								)
							)
						),
						React.createElement(
							"div",
							{ className: "modal-footer" },
							React.createElement(
								"button",
								{ onClick: this.closeDialog, className: "btn", "data-dismiss": "modal", "aria-hidden": "true" },
								"Close"
							),
							React.createElement(
								"button",
								{ onClick: this.sendItem, className: "btn btn-primary sendButton" },
								"Send"
							)
						)
					)
				)
			)
		);
	}
});
'use strict';

Zotero.ui.widgets.reacttags = {};

Zotero.ui.widgets.reacttags.init = function (el) {
	Z.debug("tags widget init", 3);
	var library = Zotero.ui.getAssociatedLibrary(el);

	var reactInstance = ReactDOM.render(React.createElement(Tags, { library: library }), document.getElementById('tags-list-div'));
};

var TagRow = React.createClass({
	displayName: 'TagRow',

	getDefaultProps: function getDefaultProps() {
		return {
			showAutomatic: false
		};
	},
	handleClick: function handleClick(evt) {
		evt.stopPropagation();
		evt.preventDefault();
		var tag = this.props.tag;

		Z.state.toggleTag(tag.apiObj.tag);
		Z.state.clearUrlVars(['tag', 'collectionKey']);
		Z.state.pushState();
	},
	render: function render() {
		var tag = this.props.tag;
		var title = tag.apiObj.tag;
		if (tag.apiObj.meta.numItems) {
			title += " (" + tag.apiObj.meta.numItems + ")";
		}
		var newUrl = "";

		var tagStyle = {};
		if (tag.color) {
			tagStyle = {
				color: tag.color,
				fontWeight: "bold"
			};
		}

		//render nothing for automatic tags user doesn't want displayed
		if (this.props.showAutomatic == false && tag.apiObj.meta.type != 0) {
			return null;
		}

		return React.createElement(
			'li',
			{ className: 'tag-row' },
			React.createElement(
				'a',
				{ onClick: this.handleClick, className: 'tag-link', title: title, style: tagStyle, href: newUrl },
				Zotero.ui.trimString(tag.apiObj.tag, 12)
			)
		);
	}
});

var TagList = React.createClass({
	displayName: 'TagList',

	getDefaultProps: function getDefaultProps() {
		return {
			tags: [],
			showAutomatic: false,
			id: ""
		};
	},
	render: function render() {
		var showAutomatic = this.props.showAutomatic;
		var tagRowNodes = this.props.tags.map(function (tag, ind) {
			return React.createElement(TagRow, { key: tag.apiObj.tag, tag: tag, showAutomatic: showAutomatic });
		});

		return React.createElement(
			'ul',
			{ id: this.props.id },
			tagRowNodes
		);
	}
});

var Tags = React.createClass({
	displayName: 'Tags',

	getDefaultProps: function getDefaultProps() {
		return {};
	},
	getInitialState: function getInitialState() {
		return {
			tags: new Zotero.Tags(),
			tagColors: null,
			selectedTags: [],
			tagFilter: "",
			showAutomatic: false,
			loading: false
		};
	},
	componentWillMount: function componentWillMount(evt) {
		var reactInstance = this;
		var library = this.props.library;
		var tagColors = library.preferences.getPref("tagColors");
		reactInstance.setState({ tagColors: tagColors });

		library.listen("tagsDirty", reactInstance.syncTags, {});
		library.listen("cachedDataLoaded", reactInstance.syncTags, {});

		library.listen("tagsChanged libraryTagsUpdated selectedTagsChanged", function (evt) {
			reactInstance.setState({ tags: library.tags });
		}, {});
	},
	handleFilterChanged: function handleFilterChanged(evt) {
		this.setState({ tagFilter: evt.target.value });
	},
	getSelectedTagsArray: function getSelectedTagsArray() {
		var selectedTags = Zotero.state.getUrlVar('tag');
		if (!J.isArray(selectedTags)) {
			if (selectedTags) {
				selectedTags = [selectedTags];
			} else {
				selectedTags = [];
			}
		}
		return selectedTags;
	},
	syncTags: function syncTags(evt) {
		Z.debug("Tags.syncTags");
		var reactInstance = this;
		if (this.state.loading) {
			return;
		}
		var library = this.props.library;

		//clear tags if we're explicitly not using cached tags
		if (evt.data && evt.data.checkCached === false) {
			library.tags.clear();
		}

		reactInstance.setState({ tags: library.tags, loading: true });

		//cached tags are preloaded with library if the cache is enabled
		//this function shouldn't be triggered until that has already been done
		var loadingPromise = library.loadUpdatedTags().then(function () {
			Z.debug("syncTags done. clearing loading div");
			reactInstance.setState({ tags: library.tags, loading: false });
			return;
		}, function (error) {
			Z.error("syncTags failed. showing local data and clearing loading div");
			reactInstance.setState({ tags: library.tags, loading: false });
			Zotero.ui.jsNotificationMessage("There was an error loading tags. Some tags may not have been updated.", 'notice');
		});

		return;
	},
	render: function render() {
		var reactInstance = this;
		var tags = this.state.tags;
		var selectedTagStrings = reactInstance.getSelectedTagsArray();
		var tagColors = this.state.tagColors;
		if (tagColors === null) {
			tagColors = [];
		}

		var matchAnyFilter = this.state.tagFilter;
		var plainTagsList = tags.plainTagsList(tags.tagsArray);
		var matchedTagStrings = Z.utils.matchAnyAutocomplete(matchAnyFilter, plainTagsList);

		var tagColorStrings = [];
		var coloredTags = [];
		tagColors.forEach(function (tagColor, index) {
			Z.debug("tagColor processing " + index);
			tagColorStrings.push(tagColor.name.toLowerCase());
			var coloredTag = tags.getTag(tagColor.name);
			if (coloredTag) {
				coloredTag.color = tagColor.color;
				coloredTags.push(coloredTag);
			}
		});
		var filteredTags = [];
		var selectedTags = [];

		//always show selected tags, even if they don't pass the filter
		selectedTagStrings.forEach(function (tagString) {
			var t = tags.getTag(tagString);
			if (t) {
				selectedTags.push(t);
			}
		});
		//add to filteredTags if passes filter, and is not already selected or colored
		matchedTagStrings.forEach(function (matchedString) {
			var t = tags.getTag(matchedString);
			if (t !== null && t.apiObj.meta.numItems > 0) {
				//we have the actual tag object, and it has items
				//add to filteredTags if it is not already in colored or selected lists
				if (selectedTagStrings.indexOf(matchedString) == -1 && tagColorStrings.indexOf(matchedString) == -1) {
					filteredTags.push(t);
				}
			}
		});

		return React.createElement(
			'div',
			{ id: 'tags-list-div', className: 'tags-list-div' },
			React.createElement(
				'div',
				null,
				React.createElement('input', { type: 'text', id: 'tag-filter-input', className: 'tag-filter-input form-control', placeholder: 'Filter Tags', onChange: this.handleFilterChanged }),
				React.createElement(LoadingSpinner, { loading: this.state.loading }),
				React.createElement(TagList, { tags: selectedTags, id: 'selected-tags-list' }),
				React.createElement(TagList, { tags: coloredTags, id: 'colored-tags-list' }),
				React.createElement(TagList, { tags: filteredTags, id: 'tags-list' })
			)
		);
	}
});
"use strict";

Zotero.ui.widgets.reactupdateCollectionDialog = {};

Zotero.ui.widgets.reactupdateCollectionDialog.init = function (el) {
	Z.debug("updatecollectionsdialog widget init", 3);
	var library = Zotero.ui.getAssociatedLibrary(el);
	var reactInstance = ReactDOM.render(React.createElement(UpdateCollectionDialog, { library: library }), document.getElementById('update-collection-dialog'));
};

var UpdateCollectionDialog = React.createClass({
	displayName: "UpdateCollectionDialog",

	componentWillMount: function componentWillMount() {
		var reactInstance = this;
		var library = this.props.library;
		library.listen("updateCollectionDialog", function () {
			var currentCollectionKey = Zotero.state.getUrlVar('collectionKey');
			var currentCollection = library.collections.getCollection(currentCollectionKey);
			var parent = "";
			var name = "";
			if (currentCollection) {
				parent = currentCollection.get('parentCollection');
				name = currentCollection.get('name');
			}
			reactInstance.setState({
				collectionName: name,
				parentCollection: parent
			});
			reactInstance.openDialog();
		}, {});
	},
	getInitialState: function getInitialState() {
		return {
			collectionName: "",
			parentCollection: null
		};
	},
	handleCollectionChange: function handleCollectionChange(evt) {
		this.setState({ 'parentCollection': evt.target.value });
	},
	handleNameChange: function handleNameChange(evt) {
		this.setState({ 'collectionName': evt.target.value });
	},
	openDialog: function openDialog() {
		this.refs.modal.open();
	},
	closeDialog: function closeDialog(evt) {
		this.refs.modal.close();
	},
	saveCollection: function saveCollection(evt) {
		var reactInstance = this;
		var library = this.props.library;
		var parentKey = this.state.parentCollection;
		var name = this.state.collectionName;
		if (name == "") {
			name = "Untitled";
		}

		var currentCollectionKey = Zotero.state.getUrlVar('collectionKey');
		var collection = library.collections.getCollection(currentCollectionKey);

		if (!collection) {
			Zotero.ui.jsNotificationMessage("Selected collection not found", 'error');
			return false;
		}
		Z.debug("updating collection: " + parentKey + ": " + name);
		collection.update(name, parentKey).then(function (response) {
			Zotero.ui.jsNotificationMessage("Collection Saved", 'confirm');
			library.collections.dirty = true;
			library.collections.initSecondaryData();
			library.trigger('libraryCollectionsUpdated');
			Zotero.state.pushState(true);
			reactInstance.closeDialog();
		}).catch(Zotero.catchPromiseError);
	},
	render: function render() {
		var library = this.props.library;
		var ncollections = library.collections.nestedOrderingArray();

		var collectionOptions = ncollections.map(function (collection, index) {
			return React.createElement(
				"option",
				{ key: collection.get('key'), value: collection.get('key') },
				'-'.repeat(collection.nestingDepth),
				" ",
				collection.get('name')
			);
		});
		collectionOptions.unshift(React.createElement(
			"option",
			{ key: "emptyvalue", value: "" },
			"None"
		));

		return React.createElement(
			BootstrapModalWrapper,
			{ ref: "modal" },
			React.createElement(
				"div",
				{ id: "update-collection-dialog", className: "update-collection-dialog", role: "dialog", title: "Update Collection", "data-keyboard": "true" },
				React.createElement(
					"div",
					{ className: "modal-dialog" },
					React.createElement(
						"div",
						{ className: "modal-content" },
						React.createElement(
							"div",
							{ className: "modal-header" },
							React.createElement(
								"button",
								{ type: "button", className: "close", "data-dismiss": "modal", "aria-hidden": "true" },
								"×"
							),
							React.createElement(
								"h3",
								null,
								"Update Collection"
							)
						),
						React.createElement(
							"div",
							{ className: "update-collection-div modal-body" },
							React.createElement(
								"form",
								{ method: "POST", className: "zform" },
								React.createElement(
									"ol",
									null,
									React.createElement(
										"li",
										null,
										React.createElement(
											"label",
											{ htmlFor: "updated-collection-title-input" },
											"Rename Collection"
										),
										React.createElement("input", { value: this.state.collectionName, onChange: this.handleNameChange, id: "updated-collection-title-input", className: "updated-collection-title-input form-control" })
									),
									React.createElement(
										"li",
										null,
										React.createElement(
											"label",
											{ htmlFor: "update-collection-parent-select" },
											"Parent Collection"
										),
										React.createElement(
											"select",
											{ value: this.state.parentCollection, onChange: this.handleCollectionChange, className: "collectionKey-select update-collection-parent form-control" },
											collectionOptions
										)
									)
								)
							)
						),
						React.createElement(
							"div",
							{ className: "modal-footer" },
							React.createElement(
								"button",
								{ className: "btn", "data-dismiss": "modal", "aria-hidden": "true" },
								"Close"
							),
							React.createElement(
								"button",
								{ onClick: this.saveCollection, className: "btn btn-primary updateButton" },
								"Update"
							)
						)
					)
				)
			)
		);
	}
});
"use strict";

Zotero.ui.widgets.reactuploadDialog = {};

Zotero.ui.widgets.reactuploadDialog.init = function (el) {
	Z.debug("uploaddialog widget init", 3);
	var library = Zotero.ui.getAssociatedLibrary(el);
	var reactInstance = ReactDOM.render(React.createElement(UploadAttachmentDialog, { library: library }), document.getElementById('upload-dialog'));
};

var UploadAttachmentDialog = React.createClass({
	displayName: "UploadAttachmentDialog",

	componentWillMount: function componentWillMount() {
		var reactInstance = this;
		var library = this.props.library;
		library.listen("uploadAttachment", function () {
			Z.debug("got uploadAttachment event; opening upload dialog");
			reactInstance.setState({ itemKey: Zotero.state.getUrlVar('itemKey') });
			reactInstance.openDialog();
		}, {});
	},
	getInitialState: function getInitialState() {
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
	upload: function upload() {
		Z.debug("uploadFunction", 3);
		var reactInstance = this;
		var library = this.props.library;

		//callback for when everything in the upload form is filled
		//grab file blob
		//grab file data given by user
		//create or modify attachment item
		//Item.uploadExistingFile or uploadChildAttachment

		var fileInfo = this.state.fileInfo;
		var specifiedTitle = this.state.title;

		var progressCallback = function progressCallback(e) {
			Z.debug('fullUpload.upload.onprogress', 3);
			var percentLoaded = Math.round(e.loaded / e.total * 100);
			reactInstance.setState({ percentLoaded: percentLoaded });
		};

		this.setState({ uploading: true });

		//upload new copy of file if we're modifying an attachment
		//create child and upload file if we're modifying a top level item
		var itemKey = Zotero.state.getUrlVar('itemKey');
		var item = library.items.getItem(itemKey);
		var uploadPromise;

		if (!item.get("parentItem")) {
			Z.debug("no parentItem", 3);
			//get template item
			var childItem = new Zotero.Item();
			childItem.associateWithLibrary(library);
			uploadPromise = childItem.initEmpty('attachment', 'imported_file').then(function (childItem) {
				Z.debug("templateItemDeferred callback", 3);
				childItem.set('title', specifiedTitle);

				return item.uploadChildAttachment(childItem, fileInfo, progressCallback);
			});
		} else if (item.get('itemType') == 'attachment' && item.get("linkMode") == 'imported_file') {
			Z.debug("imported_file attachment", 3);
			uploadPromise = item.uploadFile(fileInfo, progressCallback);
		}

		uploadPromise.then(function () {
			Z.debug("uploadSuccess", 3);
			library.trigger("uploadSuccessful");
			reactInstance.closeDialog();
		}).catch(reactInstance.failureHandler).then(function () {
			reactInstance.closeDialog();
		});
	},
	handleUploadFailure: function handleUploadFailure(failure) {
		Z.debug("Upload failed", 3);
		Z.debug(failure, 3);
		Zotero.ui.jsNotificationMessage("There was a problem uploading your file.", 'error');
		switch (failure.code) {
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
	},
	handleFiles: function handleFiles(files) {
		Z.debug("attachmentUpload handleFiles", 3);
		var reactInstance = this;

		if (typeof files == 'undefined' || files.length === 0) {
			return false;
		}
		var file = files[0];

		Zotero.file.getFileInfo(file).then(function (fileInfo) {
			Z.debug(fileInfo);
			reactInstance.setState({
				fileInfo: fileInfo,
				filename: fileInfo.filename,
				filesize: fileInfo.filesize,
				contentType: fileInfo.contentType
			});
		});
		return;
	},
	handleDrop: function handleDrop(evt) {
		Z.debug("fileuploaddroptarget drop callback", 3);
		evt.stopPropagation();
		evt.preventDefault();
		//clear file input so drag/drop and input don't show conflicting information
		var e = evt.originalEvent;
		var dt = e.dataTransfer;
		var files = dt.files;
		this.handleFiles(files);
	},
	handleFileInputChange: function handleFileInputChange(evt) {
		Z.debug("fileuploaddroptarget callback 1", 3);
		evt.stopPropagation();
		evt.preventDefault();
		var files = J(this.refs.fileInput).get(0).files;
		this.handleFiles(files);
	},
	handleTitleChange: function handleTitleChange(evt) {
		this.setState({ title: evt.target.value });
	},
	openDialog: function openDialog() {
		this.refs.modal.open();
	},
	closeDialog: function closeDialog(evt) {
		this.refs.modal.close();
	},
	render: function render() {
		var library = this.props.library;

		return React.createElement(
			BootstrapModalWrapper,
			{ ref: "modal" },
			React.createElement(
				"div",
				{ id: "upload-attachment-dialog", className: "upload-attachment-dialog", role: "dialog", title: "Upload Attachment", "data-keyboard": "true" },
				React.createElement(
					"div",
					{ className: "modal-dialog" },
					React.createElement(
						"div",
						{ className: "modal-content" },
						React.createElement(
							"div",
							{ className: "modal-header" },
							React.createElement(
								"button",
								{ type: "button", className: "close", "data-dismiss": "modal", "aria-hidden": "true" },
								"×"
							),
							React.createElement(
								"h3",
								{ className: "modal-title" },
								"Upload Attachment"
							)
						),
						React.createElement(
							"div",
							{ className: "upload-attachment-div modal-body", "data-role": "content" },
							React.createElement(
								"form",
								{ className: "attachmentuploadForm zform" },
								React.createElement(
									"h3",
									null,
									"Select a file for upload or drag and drop below"
								),
								React.createElement(
									"span",
									{ className: "btn btn-primary btn-file" },
									"Choose File",
									React.createElement("input", { onChange: this.handleFileInputChange, ref: "fileInput", type: "file", id: "fileuploadinput", className: "fileuploadinput", multiple: true })
								),
								React.createElement(
									"div",
									{ onDrop: this.handleDrop, id: "fileuploaddroptarget", className: "fileuploaddroptarget" },
									React.createElement(
										"h3",
										null,
										"Drop your file here"
									),
									React.createElement("h3", { id: "droppedfilename", className: "droppedfilename" }),
									React.createElement(LoadingSpinner, { loading: this.state.uploading })
								),
								React.createElement(
									"div",
									{ id: "attachmentuploadfileinfo", className: "attachmentuploadfileinfo" },
									React.createElement(
										"table",
										{ className: "table table-striped" },
										React.createElement(
											"tbody",
											null,
											React.createElement(
												"tr",
												null,
												React.createElement(
													"th",
													null,
													"Title"
												),
												React.createElement(
													"td",
													null,
													React.createElement("input", { onChange: this.handleTitleChange, id: "upload-file-title-input", className: "upload-file-title-input form-control", type: "text" })
												)
											),
											React.createElement(
												"tr",
												null,
												React.createElement(
													"th",
													null,
													"Size"
												),
												React.createElement(
													"td",
													{ className: "uploadfilesize" },
													this.state.filesize
												)
											),
											React.createElement(
												"tr",
												null,
												React.createElement(
													"th",
													null,
													"Type"
												),
												React.createElement(
													"td",
													{ className: "uploadfiletype" },
													this.state.contentType
												)
											),
											React.createElement(
												"tr",
												null,
												React.createElement(
													"th",
													null,
													"Upload"
												),
												React.createElement(
													"td",
													{ className: "uploadprogress" },
													React.createElement("meter", { min: "0", max: "100", id: "uploadprogressmeter", value: this.state.percentLoaded })
												)
											)
										)
									)
								)
							)
						),
						React.createElement(
							"div",
							{ className: "modal-footer" },
							React.createElement(
								"button",
								{ type: "button", className: "btn btn-default", "data-dismiss": "modal", "aria-hidden": "true" },
								"Close"
							),
							React.createElement(
								"button",
								{ onClick: this.upload, type: "button", className: "btn btn-primary uploadButton" },
								"Upload"
							)
						)
					)
				)
			)
		);
	}
});
"use strict";

Zotero.ui.widgets.reactGroups = {};

Zotero.ui.widgets.reactGroups.init = function (el) {
	Z.debug("Zotero.ui.widgets.reactGroups");
	//var library = Zotero.ui.getAssociatedLibrary(el);
	var reactInstance = ReactDOM.render(React.createElement(UserGroups, null), document.getElementById('user-groups-div'));
};

var GroupNugget = React.createClass({
	displayName: "GroupNugget",

	render: function render() {
		var reactInstance = this;
		var group = this.props.group;

		var userID = Zotero.config.loggedInUserID;
		var groupManageable = false;
		var memberCount = 1;
		if (group.apiObj.data.members) {
			memberCount += group.apiObj.data.members.length;
		}
		if (group.apiObj.data.admins) {
			memberCount += group.apiObj.data.admins.length;
		}

		if (userID && (userID == group.apiObj.data.owner || J.inArray(userID, group.apiObj.data.admins) != -1)) {
			groupManageable = true;
		}

		var groupImage = null;
		if (group.hasImage) {
			groupImage = React.createElement(
				"a",
				{ href: Zotero.url.groupViewUrl(group), className: "group-image" },
				React.createElement("img", { src: Zotero.url.groupImageUrl(group), alt: "" })
			);
		}

		var manageLinks = null;
		if (groupManageable) {
			manageLinks = React.createElement(
				"nav",
				{ className: "action-links" },
				React.createElement(
					"li",
					null,
					React.createElement(
						"a",
						{ href: Zotero.url.groupSettingsUrl(group) },
						"Manage Profile"
					)
				),
				React.createElement(
					"li",
					null,
					React.createElement(
						"a",
						{ href: Zotero.url.groupMemberSettingsUrl(group) },
						"Manage Members"
					)
				),
				React.createElement(
					"li",
					null,
					React.createElement(
						"a",
						{ href: Zotero.url.groupLibrarySettingsUrl(group) },
						"Manage Library"
					)
				)
			);
		}

		var groupDescription = null;
		if (group.apiObj.data.description) {
			var markup = { __html: group.apiObj.data.description };
			groupDescription = React.createElement(
				"tr",
				null,
				React.createElement(
					"th",
					{ scope: "row" },
					"Description"
				),
				React.createElement("td", { dangerouslySetInnerHTML: markup })
			);
		}

		var libAccess = Zotero.Group.prototype.accessMap[group.apiObj.data.libraryReading][group.apiObj.data.libraryEditing];
		if (group.apiObj.data.type == 'Private' && group.apiObj.data.libraryReading == "all") {
			libAccess = Zotero.Group.prototype.accessMap['members'][group.apiObj.data.libraryEditing];
		}

		return React.createElement(
			"div",
			{ key: group.groupID, className: "nugget-group" },
			React.createElement(
				"div",
				{ className: "nugget-full" },
				groupImage,
				React.createElement(
					"div",
					{ className: "nugget-name" },
					React.createElement(
						"a",
						{ href: Zotero.url.groupViewUrl(group) },
						group.apiObj.data.name
					)
				),
				React.createElement(
					"nav",
					{ id: "group-library-link-nav", className: "action-links" },
					React.createElement(
						"ul",
						null,
						React.createElement(
							"li",
							null,
							React.createElement(
								"a",
								{ href: Zotero.url.groupLibraryUrl(group) },
								"Group Library"
							)
						)
					)
				),
				manageLinks,
				React.createElement(
					"table",
					{ className: "nugget-profile table" },
					React.createElement(
						"tbody",
						null,
						React.createElement(
							"tr",
							null,
							React.createElement(
								"th",
								{ scope: "row" },
								"Members"
							),
							React.createElement(
								"td",
								null,
								memberCount
							)
						),
						groupDescription,
						React.createElement(
							"tr",
							null,
							React.createElement(
								"th",
								{ scope: "row" },
								"Group Type"
							),
							React.createElement(
								"td",
								null,
								Zotero.Group.prototype.typeMap[group.apiObj.data.type]
							)
						),
						React.createElement(
							"tr",
							null,
							React.createElement(
								"th",
								{ scope: "row" },
								"Group Library"
							),
							React.createElement(
								"td",
								null,
								libAccess
							)
						)
					)
				)
			)
		);
	}
});

var UserGroups = React.createClass({
	displayName: "UserGroups",

	componentWillMount: function componentWillMount() {
		var reactInstance = this;
		var groups = new Zotero.Groups();
		if (Zotero.config.loggedIn && Zotero.config.loggedInUserID) {
			reactInstance.setState({ loading: true });
			var groupsPromise = groups.fetchUserGroups(Zotero.config.loggedInUserID).then(function (response) {
				var groups = response.fetchedGroups;
				reactInstance.setState({ groups: groups, loading: false });
			}).catch(Zotero.catchPromiseError);
		}
	},
	getInitialState: function getInitialState() {
		return {
			groups: [],
			loading: false
		};
	},
	render: function render() {
		var reactInstance = this;
		var groups = this.state.groups;

		var groupNuggets = groups.map(function (group) {
			return React.createElement(GroupNugget, { key: group.get('id'), group: group });
		});

		return React.createElement(
			"div",
			{ id: "user-groups-div", className: "user-groups" },
			groupNuggets,
			React.createElement(LoadingSpinner, { loading: reactInstance.state.loading })
		);
	}
});
'use strict';

Zotero.url.requestReadApiKeyUrl = function (libraryType, libraryID, redirect) {
	var apiKeyBase = Zotero.config.baseWebsiteUrl + '/settings/keys/new';
	apiKeyBase.replace('http', 'https');
	var qparams = { 'name': 'Private Feed' };
	if (libraryType == 'group') {
		qparams['library_access'] = 0;
		qparams['group_' + libraryID] = 'read';
		qparams['redirect'] = redirect;
	} else if (libraryType == 'user') {
		qparams['library_access'] = 1;
		qparams['notes_access'] = 1;
		qparams['redirect'] = redirect;
	}

	var queryParamsArray = [];
	J.each(qparams, function (index, value) {
		queryParamsArray.push(encodeURIComponent(index) + '=' + encodeURIComponent(value));
	});

	//build query string by concatenating array
	var queryString = '?' + queryParamsArray.join('&');

	return apiKeyBase + queryString;
};

Zotero.url.groupViewUrl = function (group) {
	if (group.get("type") == "Private") {
		return Zotero.config.baseWebsiteUrl + "/groups/" + group.get("id");
	} else {
		return Zotero.config.baseWebsiteUrl + "/groups/" + Zotero.utils.slugify(group.get("name"));
	}
};

Zotero.url.groupLibraryUrl = function (group) {
	if (group.get("type") == "Private") {
		return Zotero.config.baseWebsiteUrl + "/groups/" + group.get("id") + "/items";
	} else {
		return Zotero.config.baseWebsiteUrl + "/groups/" + Zotero.utils.slugify(group.get("name")) + "/items";
	}
};

Zotero.url.groupSettingsUrl = function (group) {
	return Zotero.config.baseWebsiteUrl + "/groups/" + group.get("id") + "/settings";
};

Zotero.url.groupMemberSettingsUrl = function (group) {
	return Zotero.config.baseWebsiteUrl + "/groups/" + group.get("id") + "/settings/members";
};

Zotero.url.groupLibrarySettingsUrl = function (group) {
	return Zotero.config.baseWebsiteUrl + "/groups/" + group.get("id") + "/settings/library";
};
"use strict";

/**
 * Zotero.Pages class containing page specific functions for the website. Loaded based on
 * the value of zoterojsClass
 */
Zotero.pages = {
	//base zotero js functions that will be used on every page
	base: {

		init: function init() {
			this.tagline();
			this.setupSearch();
			this.setupNav();
			J("#sitenav .toggle").click(this.navMenu);

			//set up support page expandos
			J(".support-menu-expand-section").hide();
			J(".support-menu-section").on('click', "h2", function () {
				J(this).siblings('.support-menu-expand-section').slideToggle();
			});
		},

		/**
   * Selects a random tagline for the header
   *
   * @return void
   **/
		tagline: function tagline() {
			var taglines = ['See it. Save it. Sort it. Search it. Cite it.', 'Leveraging the long tail of scholarship.', 'A personal research assistant. Inside your browser.', 'Goodbye 3x5 cards, hello Zotero.', 'Citation management is only the beginning.', 'The next-generation research tool.', 'Research, not re-search', 'The web now has a wrangler.'];
			var pos = Math.floor(Math.random() * taglines.length);
			J("#tagline").text(taglines[pos]);
		},

		/**
   * Send search to the right place
   *
   * @return void
   **/
		setupSearch: function setupSearch() {
			//Z.debug("setupSearch");
			var context = "support";
			var label = "";

			// Look for a context specific search
			if (undefined !== window.zoterojsSearchContext) {
				context = zoterojsSearchContext;
			}
			switch (context) {
				case "people":
					label = "Search for people";break;
				case "group":
					label = "Search for groups";break;
				case "documentation":
					label = "Search documentation";break;
				case "library":
					label = "Search Library";break;
				case "grouplibrary":
					label = "Search Library";break;
				case "support":
					label = "Search support";break;
				case "forums":
					label = "Search forums";break;
				default:
					label = "Search support";break;
			}

			if (context == "documentation" || context == "support") {
				J("#simple-search").on('submit', function (e) {
					e.preventDefault();
					var query = J(this).find("input[type='text']").val();
					Z.pages.base.supportSearchRedirect(query);
				});
			}

			if (context == "people" || context == "group") {
				J("#simple-search").on('submit', function (e) {
					e.preventDefault();
					var searchUrl = Zotero.config.baseZoteroWebsiteUrl + "/search/#type/" + context;
					var query = J(this).find("input[type='text']").val();
					if (query !== "" && query != label) {
						searchUrl = searchUrl + "/q/" + encodeURIComponent(query);
					}
					location.href = searchUrl;
					return false;
				});
			}
		},

		supportSearchRedirect: function supportSearchRedirect(query) {
			var q = encodeURIComponent(query + " site:www.zotero.org/support");
			Z.debug(q);return;
			var url = "https://duckduckgo.com/?q=" + q;
			/*var url = "https://www.google.com/#q=" + q;*/
			window.location = url;
		},

		forumSearchRedirect: function forumSearchRedirect(query) {
			var q = encodeURIComponent(query + " site:forums.zotero.org");
			var url = "https://duckduckgo.com/?q=" + q;
			/*var url = "https://www.google.com/#q=" + q;*/
			window.location = url;
		},
		/**
   * Select the right nav tab
   *
   * @return void
   **/
		setupNav: function setupNav() {
			var tab = "";
			// Look for a context specific search
			if (undefined !== window.zoterojsSearchContext) {
				tab = zoterojsSearchContext;
				if (tab == "support") {
					tab = "";
				}
			}
			// special case for being on the home page
			if (location.pathname == "/" && location.href.search("forums.") < 0) {
				tab = "home";
			}
			if (tab !== "") {
				J(".primarynav").find("a." + tab).closest('li').addClass("active");
			}
		}
	},
	settings_cv: {
		init: function init() {
			// Delete the cv section when the delete link is clicked
			J("#cv-sections").on("click", ".cv-delete", function (e) {
				if (confirm("Are you sure you want to delete this section?")) {
					// Clean up RTEs before moving the base DOM elements around
					Zotero.ui.cleanUpRte(J("#cv-sections"));

					J(this).closest("div.cv-section").remove();

					Zotero.ui.init.rte('default', false, J("#cv-sections"));

					return false;
				}
			});

			// Add a new cv section when the add button is clicked
			J(".cv-insert-freetext").on("click", function (e) {
				// Get the number of sections that exist before adding a new one
				var sectionCount = J("#cv-sections div.cv-section").length;
				var newIndex = sectionCount + 1;
				var newTextareaID = "cv_" + newIndex + "_text";

				//render new section template into end of sections
				J("#cv-sections").append(J('#cvsectionTemplate').render({
					cvSectionIndex: newIndex,
					cvSectionType: "text",
					cvEntry: {}
				}));

				//activate RTE
				Zotero.ui.init.rte('default', false, J("div.cv-section").last());

				J("input.cv-heading").last().focus();
				return false;
			});

			// Add a new cv collection when the add button is clicked
			J(".cv-insert-collection").on("click", function (e) {
				// Get the number of sections that exist before adding a new one
				var sectionCount = J("#cv-sections div.cv-section").length;
				var newIndex = sectionCount + 1;

				//render new section template into end of sections
				Z.debug(zoteroData.collectionOptions);
				J("#cv-sections").append(J('#cvsectionTemplate').render({
					cvSectionIndex: newIndex,
					cvSectionType: "collection",
					collectionOptions: zoteroData.collectionOptions,
					cvEntry: {}
				}));

				J("input.cv-heading").last().focus();
				return false;
			});

			// Move the section down when the down link is clicked
			J("#cv-sections").on("click", ".cv-move-down", function (e) {
				if (J(this).closest('div.cv-section').find("textarea").length > 0) {
					// Clean up RTEs before moving the base DOM elements around
					Zotero.ui.cleanUpRte(J("#cv-sections"));

					// Move the section and reenable the rte control
					J(this).closest("div.cv-section").next().after(J(this).closest("div.cv-section"));
					Zotero.ui.init.rte('default', false);
				} else {
					J(this).closest("div.cv-section").next().after(J(this).closest("div.cv-section"));
				}

				//Zotero.pages.settings_cv.hideMoveLinks();
				return false;
			});

			// Move the section up when the up link is clicked
			J("#cv-sections").on("click", ".cv-move-up", function (e) {
				if (J(this).closest('div.cv-section').find("textarea").length > 0) {
					// Clean up RTEs before moving the base DOM elements around
					Zotero.ui.cleanUpRte(J("#cv-sections"));

					// Move the section and reenable the rte control
					J(this).closest("div.cv-section").prev().before(J(this).closest("div.cv-section"));
					Zotero.ui.init.rte('default', false);
				} else {
					J(this).closest("div.cv-section").prev().before(J(this).closest("div.cv-section"));
				}
				//Zotero.pages.settings_cv.hideMoveLinks();
				return false;
			});

			// reindex the field names before submitting the form
			J("#cv-submit").click(function (e) {
				J("#cv-sections div.cv-section").each(function (i) {
					var heading;
					if (J(this).hasClass("cv-text")) {
						heading = J(this).find(".cv-heading").attr("name", "cv_" + (i + 1) + "_heading");
						if (heading.val() == "Enter a section name") {
							heading.val("");
						}
						J(this).find(".cv-text").attr("name", "cv_" + (i + 1) + "_text");
					} else if (J(this).hasClass("cv-collection")) {
						heading = J(this).find(".cv-heading").attr("name", "cv_" + (i + 1) + "_heading");
						if (heading.val() == "Enter a section name") {
							heading.val("");
						}
						J(this).find("select.cv-collection").attr("name", "cv_" + (i + 1) + "_collection");
					}
				});
			});

			//init existing rte on first load
			Zotero.ui.init.rte('nolinks', false, J("#cv-sections"));
		}
	},

	settings_account: {},

	settings_profile: {
		init: function init() {
			Zotero.ui.init.rte('nolinks');
		}
	},

	settings_privacy: {
		//disable publishNotes checkbox when the library is not set to be public
		init: function init() {
			if (!J("input#privacy_publishLibrary").prop("checked")) {
				J("input#privacy_publishNotes").prop("disabled", true);
			}
			J("input#privacy_publishLibrary").bind("change", function () {
				if (!J("input#privacy_publishLibrary").prop("checked")) {
					J("input#privacy_publishNotes").prop("checked", false).prop("disabled", true);
				} else {
					J("input#privacy_publishNotes").prop("disabled", false);
				}
			});
		}

	},

	settings_apikeys: {
		init: function init() {}
	},

	settings_newkey: {
		init: function init() {
			Z.debug("zoteroPages settings_newkey", 3);
			Zotero.pages.settings_editkey.init();
		}
	},

	settings_newoauthkey: {
		init: function init() {
			Zotero.pages.settings_newkey.init();

			J("button[name='edit']").closest('div.form-group').nextAll().hide();
			J("button[name='edit']").click(function (e) {
				e.preventDefault();
				J("button[name='edit']").closest('div.form-group').nextAll().show();
			});
		},

		updatePermissionsSummary: function updatePermissionsSummary() {
			J("#permissions-summary").empty().append(Z.pages.settings_newoauthkey.permissionsSummary());
		},

		//build a human readable summary of currently selected permissions
		permissionsSummary: function permissionsSummary() {
			var summary = '';
			var libraryAccess = J("input#library_access").prop('checked');
			var notesAccess = J("input#notes_access").prop('checked');
			var writeAccess = J("input#write_access").prop('checked');
			if (libraryAccess) {
				summary += "Access to read your personal library.<br />";
			}
			if (notesAccess) {
				summary += "Access to read notes in your personal library.<br />";
			}
			if (writeAccess) {
				summary += "Access to read and modify your personal library.<br />";
			}
			var allGroupAccess = J("input[name='groups_all']:checked").val();
			switch (allGroupAccess) {
				case 'read':
					summary += "Access to read any of your group libraries<br />";
					break;
				case 'write':
					summary += "Access to read and modify any of your group libraries<br />";
					break;
			}

			var allowIndividualGroupPermissions = J("input#individual_groups").prop('checked');
			var individualGroupAccess = [];
			if (allowIndividualGroupPermissions) {
				J("input.individual_group_permission:checked").each(function (ind, el) {
					var groupname = J(el).data('groupname');
					var groupID = J(el).data('groupid');
					var permission = J(el).val();
					switch (permission) {
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
		}
	},

	settings_editkey: {
		init: function init() {
			Z.debug("zoteroPages settings_editkey", 3);
			if (!J("input[type='checkbox'][name='library_access']").prop("checked")) {
				J("input[name='notes_access']").prop("disabled", "disabled");
			}
			J("input#library_access").bind("change", function () {
				if (!J("input[type='checkbox'][name='library_access']").prop("checked")) {
					J("input[name='notes_access']").prop("checked", false).prop("disabled", true);
					J("input[name='write_access']").prop('checked', false).prop('disabled', true);
				} else {
					J("input[name='notes_access']").prop("disabled", false);
					J("input[name='write_access']").prop('disabled', false);
				}
			});
			J("input[name='name']").focus();

			if (!J("input[type='checkbox'][name='individual_groups']").prop('checked')) {
				J(".individual_group_permission").closest('div.form-group').hide();
			}
			J("input[name='individual_groups']").bind('change', function () {
				Z.debug("individual groups checkbox changed");
				if (J("input[type='checkbox'][name='individual_groups']").prop('checked')) {
					J(".individual_group_permission").closest('div.form-group').show();
				} else {
					J(".individual_group_permission").closest('div.form-group').hide();
				}
			});

			J('input').bind('change', Zotero.pages.settings_newoauthkey.updatePermissionsSummary);
			Zotero.pages.settings_newoauthkey.updatePermissionsSummary();
		}
	},

	settings_storage: {
		init: function init() {
			var selectedLevel = J("input[name=storageLevel]:checked").val();

			Zotero.pages.settings_storage.showSelectedResults(selectedLevel);

			J("input[name=storageLevel]").change(function () {
				Zotero.pages.settings_storage.showSelectedResults(J("input[name=storageLevel]:checked").val());
			});

			J("#purge-button").click(function () {
				if (confirm("You are about to remove all uploaded files associated with your personal library.")) {
					J("#confirm_delete").val('confirmed');
					return true;
				} else {
					return false;
				}
			});
		},

		showSelectedResults: function showSelectedResults(selectedLevel) {
			if (selectedLevel == 2) {
				J("#order-result-div").html(zoteroData.orderResult2);
			} else if (selectedLevel == 3) {
				J("#order-result-div").html(zoteroData.orderResult3);
			} else if (selectedLevel == 4) {
				J("#order-result-div").html(zoteroData.orderResult4);
			} else if (selectedLevel == 5) {
				J("#order-result-div").html(zoteroData.orderResult5);
			} else if (selectedLevel == 6) {
				J("#order-result-div").html(zoteroData.orderResult6);
			}
		}
	},

	settings_deleteaccount: {
		init: function init() {
			J("button#deleteaccount").click(function () {
				if (!confirm("Are you sure you want to permanently delete your account? You will not be able to recover the account or the user name.")) {
					return false;
				}
			});
		}
	},

	group_new: {
		init: function init() {
			var timeout;
			// When the value of the input box changes,
			J("input#name").keyup(function (e) {
				clearTimeout(timeout);
				timeout = setTimeout(Zotero.pages.group_new.nameChange, 300);
			});

			J("input[name=group_type]").change(Zotero.pages.group_new.nameChange);

			//insert slug preview label
			J('input#name').after("<label id='slugpreview'>Group URL: " + Zotero.config.baseZoteroWebsiteUrl + "/" + "groups/" + Zotero.utils.slugify(J("input#name").val()) + "</label>");
		},

		nameChange: function nameChange() {
			//make sure label is black after each change before checking with server
			J("#slugpreview").css("color", "black");
			var groupType = J('input[name=group_type]:checked').val();
			// update slug preview text
			if (groupType == 'Private') {
				J("#slugpreview").text("Group URL: " + Zotero.config.baseZoteroWebsiteUrl + "/" + "groups/<number>");
			} else {
				J("#slugpreview").text("Group URL: " + Zotero.config.baseZoteroWebsiteUrl + "/" + "groups/" + Zotero.utils.slugify(J("input#name").val()));
			}

			if (groupType != 'Private') {
				// Get the value of the name input
				var input = J("input#name").val();
				// Poll the server with the input value
				J.getJSON(baseURL + "/group/checkname/", { "input": input }, function (data) {
					J("#namePreview span").text(data.slug);
					if (data.valid) {
						J("#slugpreview").css({ "color": "green" });
					} else {
						J("#slugpreview").css({ "color": "red" });
					}
					J("#namePreview img").remove();
				});
			}
		}
	},

	group_settings: {
		init: function init() {
			Zotero.debug("initializing group delete form");
			Zotero.ui.init.rte('nolinks');

			J("#deleteForm").submit(function () {
				if (confirm("This will permanently delete this group, including any items in the group library")) {
					J("#confirm_delete").val('confirmed');
					return true;
				} else {
					return false;
				}
			});
			J("#type-PublicOpen").click(function () {
				if (confirm("Changing a group to Public Open will remove all files from Zotero Storage")) {
					return true;
				} else {
					return false;
				}
			});
		}
	},

	group_library_settings: {
		init: function init() {
			//initially disable inputs with disallowed values for current group type
			if (J("#type-PublicOpen").prop('checked')) {
				//disallow file storage options for public open groups
				J("#fileEditing-admins").prop('disabled', '1');
				J("#fileEditing-members").prop('disabled', '1');
			}
			if (J("#type-Private").prop('checked')) {
				//disallow internet readable on private
				J("#libraryReading-all").prop('disabled', '1');
			}

			//confirmation on changing group type to public open
			J("#type-PublicOpen").click(function () {
				if (confirm("Changing a group to Public Open will remove all files from Zotero Storage")) {
					//disallow files
					J("input[name='fileEditing']").val(['none']);
					J("#fileEditing-admins").prop('disabled', '1');
					J("#fileEditing-members").prop('disabled', '1');
					//allow public library
					J("#libraryReading-all").prop('disabled', '');

					return true;
				} else {
					return false;
				}
			});

			J("#type-Private").click(function () {
				//select members only viewing of private group which is mandatory
				J("input[name='libraryReading']").val(['members']);
				//disable public library radio for private group
				J("#libraryReading-all").prop('disabled', '1');
				//allow files
				J("#fileEditing-admins").prop('disabled', '');
				J("#fileEditing-members").prop('disabled', '');
			});

			J("#type-PublicClosed").click(function () {
				//allow files
				J("#fileEditing-admins").prop('disabled', '');
				J("#fileEditing-members").prop('disabled', '');
				//allow public library
				J("#libraryReading-all").prop('disabled', '');
			});
		}
	},

	group_view: {
		init: function init() {
			J("#join-group-button").click(Zotero.pages.group_view.joinGroup);
			J("#leave-group-button").click(Zotero.pages.group_view.leaveGroup);

			Zotero.ui.init.rte('nolinks');
		},

		joinGroup: function joinGroup() {
			Zotero.ui.showSpinner(J('.join-group-div'));
			J.post("/groups/" + zoteroData.groupID + "/join", { ajax: true }, function (data) {
				if (data.pending === true) {
					J(".join-group-div").empty().append("Membership Pending");
				} else if (data.success === true) {
					Zotero.ui.jsNotificationMessage("You are now a member of this group", 'success');
				} else {
					J(".join-group-div").empty();
					Zotero.ui.jsNotificationMessage("There was a problem joining this group.", 'error');
				}
			}, "json");
		},

		leaveGroup: function leaveGroup() {
			if (confirm("Leave group?")) {
				Zotero.ui.showSpinner(J(".leave-group-div"));
				J.post("/groups/" + zoteroData.groupID + "/leave", { ajax: true }, function (data) {
					if (data.success === true) {
						J('leave-group-div').empty();
						Zotero.ui.jsNotificationMessage("You are no longer a member of this group", 'success');
					} else {
						J('leave-group-div').empty();
						Zotero.ui.jsNotificationMessage("There was a problem leaving this group. Please try again in a few minutes.", 'error');
					}
				}, "json");
			}
		}
	},

	group_index: {
		init: function init() {
			//set up screen cast player + box
			//J("video").mediaelementplayer();
			//TODO: lightbox?
		}
	},

	groupdiscussion_view: {
		init: function init() {}
	},

	user_register: {
		init: function init() {
			//insert slug preview label
			J("input[name='username']").after("<label id='slugpreview'>Profile URL: " + Zotero.config.baseZoteroWebsiteUrl + "/" + Zotero.utils.slugify(J("input[name='username']").val()) + "</label>");

			// When the value of the input box changes,
			J("input[name='username']").bind("keyup change", Zotero.pages.user_register.nameChange);
		},

		nameChange: function nameChange() {
			//make sure label is black after each change before checking with server
			J("#slugpreview").css("color", "black");

			//create slug from username
			parent.slug = Zotero.utils.slugify(J("input[name='username']").val());
			J("#slugpreview").text("Profile URL: " + Zotero.config.baseZoteroWebsiteUrl + "/" + parent.slug);

			//check slug with server after half-second
			clearTimeout(parent.checkUserSlugTimeout);
			parent.checkUserSlugTimeout = setTimeout(Zotero.pages.user_register.checkSlug, 500);
		},

		checkSlug: function checkSlug() {
			J.getJSON(baseURL + "/user/checkslug", { "slug": slug }, function (data) {
				if (data.valid) {
					J("#slugpreview").css("color", "green");
				} else {
					J("#slugpreview").css("color", "red");
				}
			});
		}
	},

	user_profile: {
		init: function init() {
			J('#invite-button').click(function () {
				var groupID = J("#invite_group").val();
				J.post("/groups/inviteuser", { ajax: true, groupID: groupID, userID: zoteroData.profileUserID }, function (data) {
					if (data == 'true') {
						Zotero.ui.jsNotificationMessage("User has been invited to join your group.", 'success');
						J('#invited-user-list').append("<li>" + J("#invite_group > option:selected").html() + "</li>");
						J('#invite_group > option:selected').remove();
						if (J('#invite_group > option').length === 0) {
							J('#invite_group').remove();
							J('#invite-button').remove();
						}
					}
				}, "text");
			});
		}
	},
	group_compose: {
		init: function init() {
			Zotero.ui.init.rte('nolinks');
		}
	},

	index_index: {},

	search_index: {
		init: function init() {}
	},

	search_items: {
		init: function init() {
			try {
				var library = new Zotero.Library();
			} catch (e) {
				Z.debug("Error initializing library");
			}

			J("#item-submit").bind('click submit', J.proxy(function (e) {
				Z.debug("item search submitted", 3);
				e.preventDefault();
				e.stopImmediatePropagation();
				var q = J("#itemQuery").val();
				var globalSearchD = library.fetchGlobalItems({ q: q });
				globalSearchD.then(function (globalItems) {
					Z.debug("globalItemSearch callback", 3);
					Z.debug(globalItems);
					J("#search-result-count").empty().append(globalItems.totalResults);
					var jel = J("#search-results");
					jel.empty();
					J.each(globalItems.objects, function (ind, globalItem) {
						J("#globalitemdetailsTemplate").tmpl({ globalItem: globalItem }).appendTo(jel);
					});
				});
				return false;
			}, this));
		}
	},

	index_start: {
		init: function init() {
			// Fit the iFrame to the window
			Zotero.pages.index_start.sizeIframe();

			// Resize the iframe when the window is resized
			J(window).resize(Zotero.pages.index_start.sizeIframe);

			// Change the iframe src
			J(".start-select").click(function () {
				J("iframe").attr("src", J(this).attr("href"));
				return false;
			});

			J(".start-show-overlay").click(function () {
				J("#start-overlay").show();
				return false;
			});

			J(".start-hide-overlay").click(function () {
				J("#start-overlay").hide();
				return false;
			});

			Zotero.pages.user_register.init();
		},
		// Resize the height of the iframe to fill the page
		sizeIframe: function sizeIframe() {
			J("iframe").css("height", J(window).height() - 144);
		}
	},

	index_startstandalone: {
		init: function init() {
			var browsername = BrowserDetect.browser;
			switch (browsername) {
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
		init: function init() {
			var browsername = BrowserDetect.browser;
			var os = BrowserDetect.OS;
			var arch = navigator.userAgent.indexOf('x86_64') != -1 ? 'x86_64' : 'x86';

			if (os == 'Windows') {
				J('#standalone-windows-download-button').closest('li').clone().prependTo('#recommended-client-download ul');
			} else if (os == 'Mac') {
				J('#standalone-mac-download-button').closest('li').clone().prependTo('#recommended-client-download ul');
			} else if (os == 'Linux') {
				if (arch == 'x86_64') {
					J('#standalone-linux64-download-button').closest('li').clone().prependTo('#recommended-client-download ul');
				} else {
					J('#standalone-linux32-download-button').closest('li').clone().prependTo('#recommended-client-download ul');
				}
			}

			J("#recommended-connector-download").show();
			switch (browsername) {
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
		init: function init() {
			J(".bookmarklet-instructions").hide();
			var section = J("#bookmarklet-tabs li.selected").data('section');
			J("#" + section + '-bookmarklet-div').show();

			J("#bookmarklet-tabs li").on('click', function (e) {
				Z.debug("bookmarklet tab clicked");
				J("#bookmarklet-tabs li.selected").removeClass('selected');
				J(this).addClass('selected');
				var section = J(this).data('section');
				Z.debug(section);
				J(".bookmarklet-instructions").hide();
				J("#" + section + '-bookmarklet-div').show();
			});
		}
	}
}; // end zoterojs
//# sourceMappingURL=zotero-web-library.js.map
