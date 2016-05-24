'use strict';

var log = require('libzotero/lib/Log').Logger('zotero-web-library:Init');

log.debug('www init', 3);

var init = function(){
	log.debug('Zotero init', 3);
	
	if(window.zoteroConfig){
		Zotero.config = Z.extend({}, Zotero.config, window.zoteroConfig);
	}
	
	Zotero.state.rewriteAltUrl();
	
	//base init to setup tagline and search bar
	if(Zotero.pages){
		Zotero.pages.base.init();
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
	Zotero.preferences.defaults = Z.extend({}, Zotero.preferences.defaults, Zotero.config.defaultPrefs);
	
	//get localized item constants if not stored in localstorage
	var locale = 'en-US';
	if(zoteroData.locale){
		locale = zoteroData.locale;
	}
	
	//load general data if on library page
	if(Zotero.config.pageClass == 'user_library' || Zotero.config.pageClass == 'group_library' || Zotero.config.pageClass == 'my_library'){
		log.debug('library page - ', 3);
		Zotero.state.libraryString = Zotero.utils.libraryString(Zotero.config.librarySettings.libraryType,
		Zotero.config.librarySettings.libraryID);
		Zotero.state.filter = Zotero.state.libraryString;
		
		Zotero.Item.prototype.getItemTypes(locale);
		Zotero.Item.prototype.getItemFields(locale);
		Zotero.Item.prototype.getCreatorFields(locale);
		Zotero.Item.prototype.getCreatorTypes();
	} else {
		log.debug('non-library page', 3);
	}
	
	Zotero.ui.init.all();
	
	J.ajaxSettings.traditional = true;
	
	if(Zotero.state.getUrlVar('proxy') == 'false'){
		Zotero.config.proxy = false;
	}

	//run page specific init
	log.debug(`init page:${window.zoterojsClass}`, 1);
	if((window.zoterojsClass) && (undefined !== Zotero.pages) && Zotero.pages[zoterojsClass]) {
		try{
			Zotero.Pages[zoterojsClass].init();
		}
		catch(err){
			log.error('Error running page specific init for ' + zoterojsClass);
			log.error(err);
		}
	}
	
	// Bind to popstate to update state when browser goes back
	// only applicable if state is using location
	window.onpopstate = function(){
		log.debug('popstate', 3);
		J(window).trigger('statechange');
	};
	J(window).on('statechange', J.proxy(Zotero.state.popstateCallback, Zotero.state));
	
	//call popstateCallback on first load since some browsers don't popstate onload
	Zotero.state.popstateCallback();
};

module.exports = init;
