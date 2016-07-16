#! /usr/local/bin/node

var prompt = require('prompt');
var fs = require('fs');

var schema = {
	properties: {
		apiEndpoint: {
			required:true,
			description: 'Api endpoint',
			default: 'https://api.zotero.org'
		},
		username: {
			required:false,
			description: 'Logged in user\'s username',
			default: ''
		},
		userID: {
			required: false,
			description: 'Logged in user\'s userID'
		},
		displayName: {
			required: false,
			description: 'User\'s display name',
			default: ''
		},
		libraryType:{
			required:true,
			description: 'Type of library (user or group)',
			default: 'user'
		},
		libraryID: {
			description: 'Library ID (either useID or groupID)',
			pattern:/^[0-9]+$/,
			message: 'Must be numeric'
		},
		libraryName: {
			description: 'Library Name'
		},
		apiKey: {
			required:false,
			description: 'API Key from https://www.zotero.org/settings/keys',
			default: ''
		},
		allowEdit: {
			default:false
		},
		allowUpload: {
			default: false
		},
		baseWebsiteUrl: {
			description: 'Base website url where zotero-web-library is placed (example.com/path/to/zotero-web-library)'
		},
		libraryPath: {
			description: 'path the library html file is located',
			default:'/examples/library'
		},
		defaultSortColumn: {
			description: 'Default sort column',
			default: 'title'
		},
		defaultSortOrder: {
			description: 'Default sort order (asc or desc)',
			default: 'asc'
		}
	}
};

prompt.start();
prompt.get(schema, function(err, result){
	var config = {};

	config.baseApiUrl = result.apiEndpoint;
	config.baseFeedUrl = result.apiEndpoint;

	config.librarySettings = {
		'libraryPathString': result.libraryPath,
		'libraryType': result.libraryType,
		'libraryID': result.libraryID,
		'publish': 1,
		'allowEdit': result.allowEdit,
		'allowUpload': result.allowUpload,
		'name': result.libraryName
	};
	config.baseWebsiteUrl = result.baseWebsiteUrl;
	config.apiKey = result.apiKey;
	config.nonparsedBaseUrl = result.baseWebsiteUrl + result.libraryPath;
	config.defaultSortOrder = result.defaultSortOrder;
	config.defaultSortColumn = result.defaultSortColumn;

	if(result.username){
		config.loggedInUser = {
			username: result.username,
			userID: result.userID,
			displayName: result.displayName
		};
		config.loggedIn = true;
		config.loggedInUserID= result.userID;
	} else {
		config.loggedInUser = false;
		config.loggedIn = false;
		config.loggedInUserID= false;
	}

	var configstring = 'window.zoteroConfig = ' + JSON.stringify(config, null, '\t') + ';';
	fs.writeFileSync('libraryconfig.js', configstring);
});
