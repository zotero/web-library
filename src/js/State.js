'use strict';

var log = require('libzotero/lib/Log').Logger('zotero-web-library:State');

var State = function(){
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

	this.library = null;
	this.libraries = {};
};

//rewrite old style urls to current urls
State.prototype.rewriteAltUrl = function(){
	log.debug('rewriteAltUrl', 3);
	var state = this;
	var matches = false;
	var itemKey = false;
	var collectionKey = false;
	var replace = false;
	
	var basePath = Zotero.config.nonparsedBaseUrl;
	var pathname = window.location.pathname;
	var baseRE = new RegExp('.*' + basePath + '\/?');
	var oldCollectionRE = /^.*\/items\/collections?\/([A-Z0-9]{8})(?:\/[A-Z0-9]{8})?$/;
	var oldItemRE = /^.*\/items\/([A-Z0-9]{8})$/;

	
	switch(true){
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

State.prototype.updateCurState = function(){
	var state = this;
	state.curState = Z.extend({}, state.q, state.pathVars);
	return;
};

State.prototype.savePrevState = function(){
	var state = this;
	state.prevState = state.curState;
	return;
};

State.prototype.getSelectedItemKeys = function(){
	var state = this;
	//filter actual selected itemKeys so we only return unique list
	//necessary because of duplicate item checkboxes, some of which
	//may be hidden
	var uniqueKeys = {};
	var returnKeys = [];
	state.selectedItemKeys.forEach((val) => {
		uniqueKeys[val] = true;
	});
	for(let key in uniqueKeys){
		returnKeys.push(key);
	}
	if(returnKeys.length === 0 && state.getUrlVar('itemKey')){
		returnKeys.push(state.getUrlVar('itemKey'));
	}
	return returnKeys;
};

//toggle the selected state of the passed item key
State.prototype.toggleItemSelected = function(itemKey){
	var state = this;
	var newselected = [];
	var alreadySelected = false;
	var selectedItemKeys = state.getSelectedItemKeys();
	selectedItemKeys.forEach((val) => {
		if(val == itemKey){
			alreadySelected = true;
		} else {
			newselected.push(val);
		}
	});
	if(!alreadySelected){
		newselected.push(itemKey);
	}
	state.selectedItemKeys = newselected;
};

State.prototype.pushTag = function(newtag){
	log.debug('State.pushTag', 3);
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

State.prototype.popTag = function(oldtag){
	log.debug('State.popTag', 3);
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

State.prototype.toggleTag = function(tagtitle){
	log.debug('toggleTag', 3);
	var state = this;
	if(!state.pathVars['tag']){
		state.pathVars['tag'] = [tagtitle];
		return;
	}
	else if(Array.isArray(state.pathVars['tag'])) {
		if(state.pathVars['tag'].indexOf(tagtitle) != (-1) ){
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

State.prototype.unsetUrlVar = function(unset){
	log.debug('State.unsetUrlVar', 3);
	var state = this;
	if(state.pathVars[unset]){
		delete(state.pathVars[unset]);
	}
};

State.prototype.clearUrlVars = function(except){
	log.debug('State.clearUrlVars', 3);
	var state = this;
	if(!except){
		except = [];
	}
	var pathVars = state.pathVars;
	for(let key in pathVars){
		if(except.indexOf(key) == -1){
			delete(pathVars[key]);
		}
	}
};

State.prototype.parseUrlVars = function(){
	log.debug('State.parseUrlVars', 3);
	var state = this;
	if(!state.useLocation) return;
	state.q = Zotero.utils.parseQuery(Zotero.utils.querystring(window.location.href));
	state.pathVars = state.parsePathVars();
};

State.prototype.parsePathVars = function(pathname){
	log.debug('State.parsePathVars', 3);
	var state = this;
	var history = window.history;
	//parse variables out of library urls
	//:userslug/items/:itemKey/*
	//:userslug/items/collection/:collectionKey
	//groups/:groupidentifier/items/:itemKey/*
	//groups/:groupidentifier/items/collection/:collectionKey/*
	if(!pathname){
		//var hstate = history.state;// History.getState();
		pathname = window.location.pathname;
	}
	var basePath = Zotero.config.nonparsedBaseUrl;
	basePath = basePath.replace(window.location.origin, '');
	var split_replaced = [];
	var re = new RegExp('.*' + basePath + '\/?');
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

State.prototype.buildUrl = function(urlvars, queryVars){
	var state = this;
	log.debug('State.buildUrl', 3);
	if(typeof queryVars === 'undefined') { queryVars = false;}
	var basePath = Zotero.config.nonparsedBaseUrl + '/';
	
	var urlVarsArray = [];
	for(let index in urlvars){
		let value = urlvars[index];
		if(!value) {
			return;
		} else if(Array.isArray(value)) {
			value.forEach((v) => {
				urlVarsArray.push(index + '/' + encodeURIComponent(v) );
			});
		} else{
			urlVarsArray.push(index + '/' + encodeURIComponent(value) );
		}
	}
	urlVarsArray.sort();
	
	var queryVarsArray = [];
	for(let index in queryVars) {
		let value = queryVars[index];
		if(!value) {
			return;
		} else if(Array.isArray(value)) {
			value.forEach((v) => {
				queryVarsArray.push(index + '=' + encodeURIComponent(v) );
			});
		} else{
			queryVarsArray.push(index + '=' + encodeURIComponent(value) );
		}
	}
	queryVarsArray.sort();
	
	var pathVarsString = urlVarsArray.join('/');
	var queryString = '';
	if(queryVarsArray.length){
		queryString = '?' + queryVarsArray.join('&');
	}
	var url = basePath + pathVarsString + queryString;
	return url;
};

State.prototype.buildLibraryUrl = function(library, urlvars, queryVars){
	var state = this;
	log.debug('State.buildUrl', 3);
	if(typeof queryVars === 'undefined') { queryVars = false;}
	let basePath = '';
	switch(library.type){
		case 'user':
			basePath = `/${library.libraryUrlIdentifier}/items/`;
			break;
		case 'group':
			basePath = `/groups/${library.libraryUrlIdentifier}/items/`;
			break;
		case 'publications':
			basePath = `/${library.libraryUrlIdentifier}/publications/`;
			break;
	}
	
	var urlVarsArray = [];
	for(let index in urlvars){
		let value = urlvars[index];
		if(!value) {
			return;
		} else if(Array.isArray(value)) {
			value.forEach((v) => {
				urlVarsArray.push(index + '/' + encodeURIComponent(v) );
			});
		} else{
			urlVarsArray.push(index + '/' + encodeURIComponent(value) );
		}
	}
	urlVarsArray.sort();
	
	var queryVarsArray = [];
	for(let index in queryVars) {
		let value = queryVars[index];
		if(!value) {
			return;
		} else if(Array.isArray(value)) {
			value.forEach((v) => {
				queryVarsArray.push(index + '=' + encodeURIComponent(v) );
			});
		} else{
			queryVarsArray.push(index + '=' + encodeURIComponent(value) );
		}
	}
	queryVarsArray.sort();
	
	var pathVarsString = urlVarsArray.join('/');
	var queryString = '';
	if(queryVarsArray.length){
		queryString = '?' + queryVarsArray.join('&');
	}
	var url = basePath + pathVarsString + queryString;
	return url;
};

State.prototype.libraryFromUrl = function(path='') {
	if(path == ''){
		path = window.location.pathname;
	}

	if(path.indexOf('/items') == -1){
		return false;
	}
	log.debug(path);
	if(path.indexOf('/groups/') == 0){
		//group
		let re = /^\/groups\/(.*)\/items/;
		let matches = re.exec(path);
		if(matches === null){
			log.error('No regexp match when expecting group library pattern');
		}
		let groupidentifier = matches[1];
		return {
			type:'group',
			identifier: groupidentifier
		};
	} else if(path.indexOf('/publications') != -1){
		let re = /^\/([^\/]+)\/publications/;
		let matches = re.exec(path);
		if(matches === null){
			log.error('No regexp match when expecting publications library pattern');
		}
		let userSlug = matches[1];
		return {
			type:'publications',
			identifier: userSlug
		};
	} else {
		let re = /^\/([^\/]+)\/items/;
		let matches = re.exec(path);
		if(matches === null){
			log.error('No regexp match when expecting personal library pattern');
		}
		let userSlug = matches[1];
		return {
			type:'user',
			identifier: userSlug
		};
	}
};

//addvars is an object mapping keys and values to add
//removevars is an array of var keys to remove
State.prototype.mutateUrl = function(addvars, removevars){
	var state = this;
	//log.debug("State.mutateUrl", 3);
	if(!addvars){
		addvars = {};
	}
	if(!removevars){
		removevars = [];
	}

	var urlvars = Z.extend({}, state.pathVars);
	for(let key in addvars) {
		urlvars[key] = addvars[key];
	}
	
	if(!Array.isArray(removevars)){
		log.error('removevars is not an array');
	}
	removevars.forEach((val) => {
		delete urlvars[val];
	});
	
	var url = state.buildUrl(urlvars, false);
	
	return url;
};

State.prototype.pushState = function(){
	log.debug('State.pushState', 3);
	var state = this;
	var history = window.history;
	
	//Zotero.ui.saveFormData();
	//make prevHref the current location before we change it
	state.prevHref = state.curHref || window.location.href;
	
	//selectively add state to hint where to go
	var s = Z.extend({}, state.q, state.pathVars);
	
	var urlvars = state.pathVars;
	var queryVars = state.q;
	//var url = state.buildUrl(urlvars, queryVars);
	var url = state.buildLibraryUrl(state.library, urlvars, queryVars);
	state.curHref = url;
	log.debug('about to push url: ' + url, 3);
	//actually push state and manually call urlChangeCallback if specified
	if(state.useLocation){
		if(state.replacePush === true){
			log.debug('State.pushState - replacePush', 3);
			state.replacePush = false;
			history.replaceState(s, document.title, url);
		}
		else{
			log.debug('State.pushState - pushState', 3);
			history.pushState(s, document.title, url);
			state.stateChanged();
		}
	}
	else {
		state.stateChanged();
	}
	log.debug('leaving pushstate', 3);
};

State.prototype.replaceState = function(){
	log.debug('State.replaceState', 3);
	var state = this;
	var history = window.history;
	//update current and leave prev alone.
	//Zotero.ui.saveFormData();
	state.updateCurState();
	
	//selectively add state to hint where to go
	var s = Z.extend({}, state.curState);
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

State.prototype.updateStateTitle = function(title){
	log.debug('State.updateStateTitle', 3);
	var state = this;
	
	document.title = title;
};

State.prototype.getUrlVar = function(key){
	var state = this;
	if(state.pathVars.hasOwnProperty(key) && (state.pathVars[key] !== '')){
		return state.pathVars[key];
	}
	else if(state.q.hasOwnProperty(key)){
		return state.q[key];
	}
	return undefined;
};

State.prototype.setUrlVar = function(key, val){
	var state = this;
	state.pathVars[key] = val;
};

State.prototype.getUrlVars = function(){
	var state = this;
	var params = Zotero.utils.parseQuery(Zotero.utils.querystring(window.location.href));
	return Z.extend(true,{}, state.pathVars, params);
};

State.prototype.setQueryVar = function(key, val){
	var state = this;
	if(val === ''){
		delete state.q[key];
	}
	else{
		state.q[key] = val;
	}
};

State.prototype.addQueryVar = function(key, val){
	var state = this;
	if(state.q.hasOwnProperty(key)){
		//property exists
		if(Array.isArray(state.q[key])){
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

State.prototype.popstateCallback = function(evt){
	var state = this;
	log.debug('===== popstateCallback =====', 3);
	var history = window.history;
	state.prevHref = state.curHref;
	
	log.debug('new href, updating href and processing urlchange', 3);
	state.curHref = window.location.href;// History.getState().cleanUrl;
	
	//reparse url to set vars in Z.ajax
	state.parseUrlVars();
	state.stateChanged(evt);
};

State.prototype.stateChanged = function(){
	let state = this;
	log.debug('stateChanged', 3);
	state.savePrevState();
	state.updateCurState();
	//check if the library changed
	let libraryChanged = false;
	//let lib = this.libraryFromUrl(state.curHref);
	let lib = this.libraryFromUrl();
	if(lib.type != this.library.type || lib.identifier != this.library.libraryUrlIdentifier){
		libraryChanged = true;
		let libraryStrings = Object.keys(this.libraries);
		for(let i = 0; i < libraryStrings.length; i++){
			let libraryString = libraryStrings[i];
			let library = this.libraries[libraryString];
			if(lib.type == library.type && lib.identifier == library.libraryUrlIdentifier){
				//set State's library to the matching instance we found in libraries
				this.library = library;
				break;
			}
		}
		log.error('Library change detected, but matching library not found in Zotero.state.libraries');
	}
	if(libraryChanged){
		Zotero.trigger('libraryChanged');
	}

	//check for changed variables in the url and fire events for them
	log.debug('Checking changed variables', 3);
	var changedVars = state.diffState(state.prevHref, state.curHref);
	var widgetEvents = {};
	changedVars.forEach((val) => {
		var eventString = val + 'Changed';
		log.debug(eventString, 3);
		//map var events to widget events
		if(Zotero.eventful.eventMap.hasOwnProperty(eventString)){
			Zotero.eventful.eventMap[eventString].forEach((val) => {
				if(!widgetEvents.hasOwnProperty(val)){
					widgetEvents[val] = 1;
				}
			});
		}
		log.debug('State Filter: ' + state.filter, 3);
		Zotero.trigger(eventString, {}, state.filter);
	});
	//TODO: is this eventMap triggering necessary?
	
	for(let ind in widgetEvents) {
		Zotero.trigger(ind, {}, state.filter);
	}
	
	log.debug('===== stateChanged Done =====', 3);
};

State.prototype.diffState = function(prevHref, curHref){
	log.debug('State.diffState', 3);
	var state = this;
	//check what has changed when a new state is pushed
	var prevVars = Z.extend({}, state.parsePathVars(prevHref) );
	var curVars = Z.extend({}, state.parsePathVars(curHref) );

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
	monitoredVars.forEach((val) => {
		if(prevVars.hasOwnProperty(val) || curVars.hasOwnProperty(val)){
			if(prevVars[val] != curVars[val]){
				changedVars.push(val);
			}
		}
	});
	
	return changedVars;
};

module.exports = State;
