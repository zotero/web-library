'use strict';

var log = require('../../library/libZoteroJS/src/Log.js').Logger('zotero-web-library:Pages:Search');

var React = require('react');
var ReactDOM = require('react-dom');
var GlobalSearch = require('../libraryUi/widgets/GlobalSearch.js');
var SiteSearch = require('../libraryUi/widgets/SiteSearch.js');

var Search = {
	site_search: {
		init: function(){
			log.debug('site search init', 3);
			ReactDOM.render(
				React.createElement(SiteSearch, null),
				document.getElementById('site-search')
			);
		}
	},
	
	globalsearch: {
		init: function(){
			log.debug('globalsearch init', 3);
			ReactDOM.render(
				React.createElement(GlobalSearch, null),
				document.getElementById('global-search')
			);
		}
	}
};

module.exports = Search;
