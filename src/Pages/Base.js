'use strict';

var log = require('../../library/libZoteroJS/src/Log.js').Logger('zotero-web-library:Pages:Base');

var React = require('react');
var ReactDOM = require('react-dom');
var SearchBox = require('../libraryUi/widgets/SearchBox.js');

//base zotero js functions that will be used on every page
var base = {};
base.init = function(){
	this.setupSearch();
	this.setupNav();
	J('#sitenav .toggle').click(this.navMenu);
	
	//set up support page expandos
	J('.support-menu-expand-section').hide();
	J('.support-menu-section').on('click', 'h2', function(){
		J(this).siblings('.support-menu-expand-section').slideToggle();
	});
	
};

/**
 * Send search to the right place
 *
 * @return void
 **/
base.setupSearch = function() {
	log.debug('setupSearch');
	let searchboxElement = document.getElementById('searchbox');
	if(searchboxElement){
		ReactDOM.render(
			React.createElement(SearchBox, null),
			searchboxElement
		);
	}
	return;
};

/**
 * Select the right nav tab
 *
 * @return void
 **/
base.setupNav = function () {
	var tab = '';
	// Look for a context specific search
	if(undefined !== window.zoterojsSearchContext){
		tab = window.zoterojsSearchContext;
		if(tab == 'support') { tab = ''; }
		
	}
	// special case for being on the home page
	if(location.pathname == '/' && location.href.search('forums.') < 0){
		tab = 'home';
	}
	if(tab !== ''){
		J('.primarynav').find('a.' + tab).closest('li').addClass('active');
	}
};

module.exports = base;
