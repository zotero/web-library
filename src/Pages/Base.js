'use strict';

var log = require('../../library/libZoteroJS/src/Log.js').Logger('zotero-web-library:Pages:Base');

//base zotero js functions that will be used on every page
var base = {};
base.init = function(){
	this.tagline();
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
 * Selects a random tagline for the header
 *
 * @return void
 **/
base.tagline = function(){
	var taglines = [
		'See it. Save it. Sort it. Search it. Cite it.',
		'Leveraging the long tail of scholarship.',
		'A personal research assistant. Inside your browser.',
		'Goodbye 3x5 cards, hello Zotero.',
		'Citation management is only the beginning.',
		'The next-generation research tool.',
		'Research, not re-search',
		'The web now has a wrangler.'
	];
	var pos = Math.floor(Math.random() * taglines.length);
	J('#tagline').text(taglines[pos]);
};

/**
 * Send search to the right place
 *
 * @return void
 **/
base.setupSearch = function() {
	//log.debug("setupSearch");
	var context = 'support';
	var label   = '';
	
	// Look for a context specific search
	if(undefined !== window.zoterojsSearchContext){
		context = zoterojsSearchContext;
	}
	switch (context) {
		case 'people'        : label = 'Search for people';    break;
		case 'group'         : label = 'Search for groups';    break;
		case 'documentation' : label = 'Search documentation'; break;
		case 'library'       : label = 'Search Library';       break;
		case 'grouplibrary'  : label = 'Search Library';       break;
		case 'support'       : label = 'Search support';       break;
		case 'forums'        : label = 'Search forums';        break;
		default              : label = 'Search support';       break;
	}
	
	if(context == 'documentation' || context == 'support'){
		J('#simple-search').on('submit', function(e){
			e.preventDefault();
			var query     = J(this).find("input[type='text']").val();
			Z.pages.base.supportSearchRedirect(query);
		});
	}

	if(context == 'people' || context == 'group'){
		J('#simple-search').on('submit', function(e){
			e.preventDefault();
			var searchUrl = Zotero.config.baseZoteroWebsiteUrl + '/search/#type/' + context;
			var query     = J(this).find("input[type='text']").val();
			if(query !== '' && query != label){
				searchUrl = searchUrl + '/q/' + encodeURIComponent(query);
			}
			location.href = searchUrl;
			return false;
		});
	}
};

base.supportSearchRedirect = function(query) {
	var q = encodeURIComponent(query + ' site:www.zotero.org/support');
	//log.debug(q);return;
	var url = 'https://duckduckgo.com/?q=' + q;
	window.location = url;
};

base.forumSearchRedirect = function(query) {
	var q = encodeURIComponent(query + ' site:forums.zotero.org');
	var url = 'https://duckduckgo.com/?q=' + q;
	/*var url = "https://www.google.com/#q=" + q;*/
	window.location = url;
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
		tab = zoterojsSearchContext;
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
