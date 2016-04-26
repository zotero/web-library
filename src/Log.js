'use strict';

var log = {};

var prefLevel = 1;

var debugOut;
var warnOut;
var errorOut;

if(typeof console == 'undefined'){
	debugOut = function(){};
	warnOut = function(){};
	errorOut = function(){};
} else {
	debugOut = function(s){
		console.log(s);
	};
	warnOut = function(s){
		console.warn(s);
	};
	errorOut = function(s){
		console.error(s);
	};
}


log.SetLevel = function(level){
	prefLevel = level;
};

log.debug = function(debugstring, level){
	if(typeof(level) !== 'number'){
		level = 1;
	}
	if(level <= prefLevel) {
		debugOut(debugstring);
	}
};

log.debugObject = function(obj, level){
	if(typeof(level) !== 'number'){
		level = 1;
	}
	if(level <= prefLevel) {
		debugOut(obj);
	}
};

log.warn = function(warnstring){
	warnOut(warnstring);
};

log.error = function(errorstring){
	errorOut(errorstring);
};

log.Logger = function(prefix, llevel=3){
	prefLevel = llevel;
	return {
		debug: function(debugstring, level){
			if(typeof debugstring == 'string'){
				return log.debug(`${prefix}: ${debugstring}`, level);
			} else {
				log.debug(`${prefix}: \\`, level);
				log.debug(debugstring, level);
				return;
			}
		},
		warn: function(warnstring){
			return log.warn(`${prefix}: ${warnstring}`);
		},
		error: function(errorstring){
			return log.error(`${prefix}: ${errorstring}`);
		}
	};
};

module.exports = log;
