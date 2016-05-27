'use strict';

var log = require('libzotero/lib/Log').Logger('zotero-web-library:GlobalSearch');
var Net = require('libzotero/lib/Net');
var React = require('react');
var CanonicalItem = require('./CanonicalSearchResult.js');

//const baseSearchUrl = 'https://52.91.6.162';
const baseSearchUrl = 'https://localhost:8080';

var globalSearchUrl = function(query){
	return `${baseSearchUrl}/global/items?q=${query}`;
};

var globalDOIUrl = function(query){
	return `${baseSearchUrl}/global/items?DOI=${query}`;
};

var GlobalSearch = React.createClass({
	componentDidMount: function(){
		if(this.state.search != ''){
			this.search();
		}
	},
	getDefaultProps: function() {
		return {
			item:null
		};
	},
	getInitialState: function() {
		let query = Zotero.state.getUrlVar('q');
		return {
			search:query,
			results: []
		};
	},
	handleSearchChange: function(evt){
		this.setState({search:evt.target.value});
	},
	search: function(evt=false){
		if(evt){
			evt.preventDefault();
		}
		var searchTerm = this.state.search;
		//update querystring
		Zotero.state.setQueryVar('q', this.state.search);
		Zotero.state.pushState();

		var searchUrl = '';
		if(searchTerm.startsWith('doi:')){
			searchUrl = globalDOIUrl(searchTerm.slice(4));
		} else {
			searchUrl = globalSearchUrl(searchTerm);
		}
		
		Net.ajax({url:searchUrl}).then((resp) => {
			var resultsObj = JSON.parse(resp.responseText);
			var globalItems = resultsObj.map(function(g){
				return g;
			});
			this.setState({results: globalItems});
		});
	},
	render: function() {
		var reactInstance = this;
		var resultNodes = reactInstance.state.results.map(function(globalItem){
			return (
				<CanonicalItem key={globalItem.ID} item={globalItem} />
			);
		});

		return (
			<div className='global-search'>
				<form id="global-search-form" onSubmit={this.search}>
					<div className='input-group'>
						<input type='text' className='form-control' value={this.state.search} onChange={this.handleSearchChange} />
						<span className='input-group-btn'>
							<button type='button' className='btn btn-default' onClick={this.search}>
								<span className='glyphicons fonticon glyphicons-search'></span>
							</button>
						</span>
					</div>
				</form>
				<div className='results'>
					{resultNodes}
				</div>
			</div>
		);
	}
});

module.exports = GlobalSearch;
