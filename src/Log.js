'use strict';

var log = {};

var prefLevel = 3;

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
	/*
	var prefLevel = 3;
	if(Zotero.config.storeDebug){
		if(level <= prefLevel){
			Zotero.debugstring += 'DEBUG:' + debugstring + '\n';
		}
	}
	*/
	if(typeof(level) !== 'number'){
		level = 1;
	}
	/*
	if(Zotero.preferences !== undefined){
		prefLevel = Zotero.preferences.getPref('debug_level');
	}
	*/
	if(level <= prefLevel) {
		debugOut(debugstring);
	}
};

log.warn = function(warnstring){
	/*
	if(Zotero.config.storeDebug){
		Zotero.debugstring += 'WARN:' + warnstring + '\n';
	}
	*/
	warnOut(warnstring);
};

log.error = function(errorstring){
	/*
	if(Zotero.config.storeDebug){
		Zotero.debugstring += 'ERROR:' + errorstring + '\n';
	}
	*/
	errorOut(errorstring);
};

log.debugFunction = function(prefix){
	return function(debugstring, level){
		return log.debug(`${prefix}: ${debugstring}`, level);
	};
};

log.errorFunction = function(prefix){
	return function(errorstring){
		return log.error(`${prefix}: ${errorstring}`);
	};
};

log.Logger = function(prefix){
	return {
		debug: function(debugstring, level){
			return log.debug(`${prefix}: ${debugstring}`, level);
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
