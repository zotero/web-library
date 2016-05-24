'use strict';

var log = require('libzotero/lib/Log').Logger('zotero-web-library:ui');

var ui = {};
ui.callbacks = {};
ui.keyCode = {
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
};
	
/**
 * Display a JS notification message to the user
 * @param  {string} message Notification message
 * @param  {string} type    confirm, notice, or error
 * @param  {int} timeout seconds to display notification
 * @return {undefined}
 */
ui.jsNotificationMessage = function(message, type, timeout){
	log.debug('notificationMessage: ' + type + ' : ' + message, 3);
	if(Zotero.config.suppressErrorNotifications) return;
	
	if(!timeout && (timeout !== false)){
		timeout = 5;
	}
	var alertType = 'alert-info';
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
		J('#js-message').append("<div class='alert alert-dismissable " + alertType + "'><button type='button' class='close' data-dismiss='alert'><span aria-hidden='true'>&times;</span><span class='sr-only'>Close</span></button>" + message + '</div>').children('div').delay(parseInt(timeout, 10) * 1000).slideUp().delay(300).queue(function(){
			J(this).remove();
		});
	} else {
		J('#js-message').append("<div class='alert alert-dismissable " + alertType + "'><button type='button' class='close' data-dismiss='alert'><span aria-hidden='true'>&times;</span><span class='sr-only'>Close</span></button>" + message + '</div>');
	}
};

/**
 * Display an error message on ajax failure
 * @param  {jQuery XHR Promise} jqxhr jqxhr returned from jquery.ajax
 * @return {undefined}
 */
ui.ajaxErrorMessage = function(jqxhr){
	log.debug('ui.ajaxErrorMessage', 3);
	if(typeof jqxhr == 'undefined'){
		log.warn('ajaxErrorMessage called with undefined argument');
		return '';
	}
	log.debug(jqxhr, 3);
	switch(jqxhr.status){
		case 403:
			//don't have permission to view
			if(Zotero.config.loggedIn || Zotero.config.ignoreLoggedInStatus){
				return 'You do not have permission to view this library.';
			}
			else{
				Zotero.config.suppressErrorNotifications = true;
				window.location = '/user/login';
				return '';
			}
			break;
		case 404:
			ui.jsNotificationMessage('A requested resource could not be found.', 'error');
			break;
		case 400:
			ui.jsNotificationMessage('Bad Request', 'error');
			break;
		case 405:
			ui.jsNotificationMessage('Method not allowed', 'error');
			break;
		case 412:
			ui.jsNotificationMessage('Precondition failed', 'error');
			break;
		case 500:
			ui.jsNotificationMessage("Something went wrong but we're not sure what.", 'error');
			break;
		case 501:
			ui.jsNotificationMessage("We can't do that yet.", 'error');
			break;
		case 503:
			ui.jsNotificationMessage("We've gone away for a little while. Please try again in a few minutes.", 'error');
			break;
		default:
			log.warn('jqxhr status did not match any expected case');
			log.debug(jqxhr.status);
			//ui.jsNotificationMessage("An error occurred performing the requested action.", 'error');
	}
	return '';
};


/**
 * Empty conatiner and show preloader spinner
 * @param  {Dom Element} el   container
 * @param  {string} type type of preloader to show
 * @return {undefined}
 */
ui.showSpinner = function(el, type){
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
ui.appendSpinner = function(el){
	var spinnerUrl = Zotero.config.baseWebsiteUrl + 'static/images/theme/broken-circle-spinner.gif';
	J(el).append("<img class='spinner' src='" + spinnerUrl + "'/>");
};

ui.saveItem = function(item) {
	//var requestData = JSON.stringify(item.apiObj);
	log.debug('pre writeItem debug', 4);
	log.debug(item, 4);
	//show spinner before making ajax write call
	var library = item.owningLibrary;
	var writeResponse = item.writeItem()
	.then(function(writtenItems){
		log.debug('item write finished', 3);
		//check for errors, update nav
		if(item.writeFailure){
			log.error('Error writing item:' + item.writeFailure.message);
			ui.jsNotificationMessage('Error writing item', 'error');
			throw new Error('Error writing item:' + item.writeFailure.message);
		}
	});
	
	//update list of tags we have if new ones added
	log.debug('adding new tags to library tags', 3);
	var libTags = library.tags;
	var tags = item.apiObj.data.tags;
	tags.forEach((tagOb, index) =>{
		let tagString = tagOb.tag;
		if(!libTags.tagObjects.hasOwnProperty(tagString)){
			let tag = new Zotero.Tag(tagOb);
			libTags.addTag(tag);
		}
	});
	libTags.updateSecondaryData();

	return writeResponse;
};

/**
 * Get the class for an itemType to display an appropriate icon
 * @param  {Zotero_Item} item Zotero item to get the class for
 * @return {string}
 */
ui.itemTypeClass = function(item) {
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
	return 'img-' + itemTypeClass;
};

/**
 * Get the Zotero Library associated with an element (generally a .eventfulwidget element)
 * @param  {Dom Element} el Dom element
 * @return {Zotero_Library}
 */
ui.getAssociatedLibrary = function(el){
	log.debug('ui.getAssociatedLibrary', 3);
	var jel;
	if(typeof el == 'undefined'){
		jel = J('.zotero-library').first();
	}
	else {
		jel = J(el);
		if(jel.length === 0 || jel.is('#eventful') ){
			jel = J('.zotero-library').first();
			if(jel.length === 0){
				log.warn('No element passed and no default found for getAssociatedLibrary.');
				throw new Error('No element passed and no default found for getAssociatedLibrary.');
			}
		}
	}
	//get Zotero.Library object if already bound to element
	var library = jel.data('zoterolibrary');
	var libString;
	if(!library){
		//try getting it from a libraryString included on DOM element
		libString = J(el).data('library');
		if(libString){
			library = ui.libStringLibrary(libString);
		}
		jel.data('zoterolibrary', library);
	}
	//if we still don't have a library, look for the default library for the page
	if(!library){
		jel = J('.zotero-library').first();
		libString = jel.data('library');
		if(libString){
			library = ui.libStringLibrary(libString);
		}
	}
	if(!library){log.error('No associated library found');}
	return library;
};

ui.libStringLibrary = function(libString){
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

/**
 * Get the highest priority variable named key set from various configs
 * @param  {[type]} key [description]
 * @return {[type]}     [description]
 */
ui.getPrioritizedVariable = function(key, defaultVal){
	var val = Zotero.state.getUrlVar(key) || Zotero.preferences.getPref(key) || Zotero.config.defaultApiArgs[key] || defaultVal;
	return val;
};

/**
 * Scroll to the top of the window
 * @return {undefined}
 */
ui.scrollToTop = function(){
	window.scrollBy(0, -5000);
};

var init = {};

//initialize ui
init.all = function(){
	Zotero.eventful.initWidgets();
	init.rte();
};

init.rte = function(type, autofocus, container){
	log.debug('init.rte', 3);
	if(Zotero.config.rte == 'ckeditor'){
		init.ckeditor(type, autofocus, container);
		return;
	}
	else {
		init.tinyMce(type, autofocus, container);
	}
};

init.ckeditor = function(type, autofocus, container){
	log.debug('init.ckeditor', 3);
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
		config = Z.deepExtend({}, nolinksckconfig);
	}
	else if(type == 'readonly'){
		config = Z.deepExtend({}, readonlyckconfig);
	}
	else {
		config = Z.deepExtend({}, ckconfig);
	}
	if(autofocus){
		config.startupFocus = true;
	}
	
	log.debug('initializing CK editors', 3);
	if(J(container).is('.rte')){
		log.debug('RTE textarea - ' + ' - ' + J(container).attr('name'), 3);
		var edName = J(container).attr('name');
		if(!CKEDITOR.instances[edName]){
			var editor = CKEDITOR.replace(J(container), config );
		}
	}
	else{
		log.debug('not a direct rte init', 3);
		log.debug(container, 3);
		J(container).find('textarea.rte').each(function(ind, el){
			log.debug('RTE textarea - ' + ind + ' - ' + J(el).attr('name'), 3);
			var edName = J(el).attr('name');
			if(!CKEDITOR.instances[edName]){
				var editor = CKEDITOR.replace(el, config );
			}
		});
	}
};

init.tinyMce = function(type, autofocus, elements){
	log.debug('init.tinyMce', 3);
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
		theme: 'advanced',
		//plugins : "pagebreak,style,layer,table,save,advhr,advimage,advlink,emotions,iespell,inlinepopups,insertdatetime,preview,media,searchreplace,print,contextmenu,paste,directionality,fullscreen,visualchars,nonbreaking,xhtmlxtras,template",
		//plugins : "pagebreak,style,layer,table,advhr,advimage,advlink,preview,searchreplace,paste",
		
		theme_advanced_toolbar_location : 'top',
		theme_advanced_buttons1 : 'bold,italic,underline,strikethrough,separator,sub,sup,separator,forecolorpicker,backcolorpicker,separator,blockquote,separator,link,unlink',
		theme_advanced_buttons2 : 'formatselect,separator,justifyleft,justifycenter,justifyright,separator,bullist,numlist,outdent,indent,separator,removeformat,code,',
		theme_advanced_buttons3 : '',
		theme_advanced_toolbar_align : 'left',
		theme_advanced_statusbar_location: 'bottom',
		theme_advanced_resizing: true,
		relative_urls: false,
		//width: '500',
		//height: '300',
		editor_selector: 'default'
	};
	
	if(autofocus){
		tmceConfig.init_instance_callback = function(inst){
			log.debug('inited ' + inst.editorId, 3);
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

ui.init = init;
ui.widgets = {};

module.exports = ui;
