'use strict';

var log = require('../../library/libZoteroJS/src/Log.js').Logger('zotero-web-library:Pages:Search');

var React = require('react');
var ReactDOM = require('react-dom');
var GlobalSearch = require('../libraryUi/widgets/GlobalSearch.js');

var Search = {
	search_index: {
		init: function(){
		}
	},
	
	search_items: {
		init: function(){
			try{
				var library = new Zotero.Library();
			}
			catch(e){
				log.error('Error initializing library');
			}
			
			J('#item-submit').bind('click submit', J.proxy(function(e){
				log.debug('item search submitted', 3);
				e.preventDefault();
				e.stopImmediatePropagation();
				var q = J('#itemQuery').val();
				var globalSearchD = library.fetchGlobalItems({q:q});
				globalSearchD.then(function(globalItems){
					log.debug('globalItemSearch callback', 3);
					//log.debug(globalItems);
					J('#search-result-count').empty().append(globalItems.totalResults);
					var jel = J('#search-results');
					jel.empty();
					J.each(globalItems.objects, function(ind, globalItem){
						J('#globalitemdetailsTemplate').tmpl({globalItem:globalItem}).appendTo(jel);
					});
				});
				return false;
			}, this ) );
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
