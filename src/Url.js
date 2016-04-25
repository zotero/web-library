'use strict';

var url = {};

url.requestReadApiKeyUrl = function(libraryType, libraryID, redirect){
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
	
	var queryParamsArray = [];
	J.each(qparams, function(index, value){
		queryParamsArray.push(encodeURIComponent(index) + '=' + encodeURIComponent(value));
	});
	
	//build query string by concatenating array
	var queryString = '?' + queryParamsArray.join('&');
	
	return apiKeyBase + queryString;
};

url.groupViewUrl = function(group){
	if(group.get('type') == 'Private'){
		return Zotero.config.baseWebsiteUrl + '/groups/' + group.get('id');
	}
	else {
		return Zotero.config.baseWebsiteUrl + '/groups/' + Zotero.utils.slugify(group.get('name'));
	}
};

url.groupLibraryUrl = function(group){
	if(group.get('type') == 'Private'){
		return Zotero.config.baseWebsiteUrl + '/groups/' + group.get('id') + '/items';
	}
	else {
		return Zotero.config.baseWebsiteUrl + '/groups/' + Zotero.utils.slugify(group.get('name')) + '/items';
	}
};

url.groupSettingsUrl = function(group){
	return Zotero.config.baseWebsiteUrl + '/groups/' + group.get('id') + '/settings';
};

url.groupMemberSettingsUrl = function(group){
	return Zotero.config.baseWebsiteUrl + '/groups/' + group.get('id') + '/settings/members';
};

url.groupLibrarySettingsUrl = function(group){
	return Zotero.config.baseWebsiteUrl + '/groups/' + group.get('id') + '/settings/library';
};

module.exports = url;
