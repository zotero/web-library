#! /usr/local/bin/node

var prompt = require('prompt');
var fs = require('fs');

var schema = {
	properties: {
		username: {
			required:false,
			description: "Logged in user's username",
			default: ""
		},
		userID: {
			required: false,
			description: "Logged in user's userID",
		},
		displayName: {
			required: false,
			description: "User's display name",
			default: ""
		},
		libraryType:{
			required:true,
			description: "Type of library (user or group)",
			default: "user"
		},
		libraryID: {
			description: "Library ID (either useID or groupID)",
			pattern:/^[0-9]+$/,
			message: "Must be numeric",
		},
		libraryName: {
			description: "Library Name",
		},
		apiKey: {
			required:false,
			description: "API Key from https://www.zotero.org/settings/keys",
			default: "",
		},
		allowEdit: {
			default:false
		},
		allowUpload: {
			default: false
		},
		baseWebsiteUrl: {
			description: "Base website url"
		},
		libraryPath: {
			description: "path the library will be located at"
		},
		defaultSortColumn: {
			description: "Default sort column",
			default: "title"
		},
		defaultSortOrder: {
			description: "Default sort order (asc or desc)",
			default: "asc"
		},
	}
};

prompt.start();
prompt.get(schema, function(err, result){
	var config = {
		"librarySettings": {
			"libraryPathString": "/zotero/zotero-www/library/zotero-web-library/examples/reactlibrary/index.html",// "\/fcheslack\/items",
			"libraryType": "user",
			"libraryID": "",
			"publish": 1,
			"allowEdit": false,
			"allowUpload": false,
			"name": ""
		},
		"baseApiUrl": "https:\/\/apidev.zotero.org",
		"baseWebsiteUrl": "https:\/\/test.zotero.net",
		"baseFeedUrl": "https:\/\/apidev.zotero.org",
		"baseZoteroWebsiteUrl": "https:\/\/test.zotero.net",
		"baseDownloadUrl": "",
		"debugLogEndpoint": "",
		"proxyDownloads": false,
		"staticPath": "\/static",
		"proxyPath": "",
		"ignoreLoggedInStatus": false,
		"storePrefsRemote": false,
		"proxy": false,
		"sessionAuth": false,
		"sessionCookieName": "zotero_www_session",
		"breadcrumbsBase": [
			{
				"label": "username",
				"path": "\/"
			}
		],
		"apiKey": "",
		"apiVersion": 3,
		"useIndexedDB": true,
		"preferUrlItem": false,
		"locale": "en-US",
		"cacheStoreType": "localStorage",
		"preloadCachedLibrary": true,
		"rte": "ckeditor",
		"sortOrdering": {
			"dateAdded": "desc",
			"dateModified": "desc",
			"date": "desc",
			"year": "desc",
			"accessDate": "desc",
			"title": "asc",
			"creator": "asc"
		},
		"defaultSortColumn": "title",
		"defaultSortOrder": "asc",
		"largeFields": {
			"title": 1,
			"abstractNote": 1,
			"extra": 1
		},
		"richTextFields": {
			"note": 1
		},
		"maxFieldSummaryLength": {
			"title": 60
		},
		"exportFormats": [
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
		"exportFormatsMap": {
			"bibtex": "BibTeX",
			"bookmarks": "Bookmarks",
			"mods": "MODS",
			"refer": "Refer\/BibIX",
			"rdf_bibliontology": "Bibliontology RDF",
			"rdf_dc": "Unqualified Dublin Core RDF",
			"rdf_zotero": "Zotero RDF",
			"ris": "RIS",
			"wikipedia": "Wikipedia Citation Templates"
		},
		"defaultApiArgs": {
			"order": "title",
			"sort": "asc",
			"limit": 50,
			"start": 0,
			"content": "json",
			"format": "json"
		},
		"defaultPrefs": {
			"debug_level": 3
		},
		"pageClass": "user_library",
		"nonparsedBaseUrl": "",
		"loggedIn": false,
		"loggedInUser": false,
		"loggedInUserID": false
	};

	config.librarySettings = {
		"libraryPathString": result.libraryPath,
		"libraryType": result.libraryType,
		"libraryID": result.libraryID,
		"publish": 1,
		"allowEdit": result.allowEdit,
		"allowUpload": result.allowUpload,
		"name": result.libraryName
	};
	config.baseWebsiteUrl = result.baseWebsiteUrl;
	config.apiKey = result.apiKey;
	config.nonparsedBaseUrl = result.libraryPath;
	config.defaultSortOrder = result.defaultSortOrder;
	config.defaultSortColumn = result.defaultSortColumn;

	if(result.username){
		config.loggedInUser = {
			username: result.username,
			userID: result.userID,
			displayName: result.displayName
		}
	} else {
		config.loggedInUser = false;
		config.loggedIn = false;
		config.loggedInUserID= false;
	}

	var configstring = "window.zoteroConfig = " + JSON.stringify(config, null, "\t");
	fs.writeFileSync("libraryconfig.js", configstring);
	//console.log(configstring);
});
