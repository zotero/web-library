'use strict';

var log = require('libzotero/lib/Log').Logger('zotero-web-library:Pages');

/**
 * Zotero.Pages class containing page specific functions for the website. Loaded based on
 * the value of zoterojsClass
 */
var Pages = Zotero.extend(
	{}, 
	require('./Settings.js'), 
	require('./Group.js'), 
	require('./User.js'), 
	require('./Search.js'), 
	require('./Index.js')
);

Pages.base = require('./Base.js');

module.exports = Pages;
