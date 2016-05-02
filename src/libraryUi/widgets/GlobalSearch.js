'use strict';

var log = require('../../../library/libZoteroJS/src/Log.js').Logger('zotero-web-library:GlobalSearch');
var Net = require('../../../library/libZoteroJS/src/Net.js');
var React = require('react');
var CanonicalItem = require('./CanonicalSearchResult.js');

const baseSearchUrl = 'https://localhost:8080';

var globalSearchUrl = function(query){
	return `${baseSearchUrl}/global/items?q=${query}`;
};

var GlobalSearch = React.createClass({
	getDefaultProps: function() {
		return {
			item:null,
		};
	},
	getInitialState: function() {
		return {
			search:'',
			results: []
		};
	},
	handleSearchChange: function(evt){
		log.debug(evt);
		log.debug(`setting search state to ${evt.target.value}`);
		this.setState({search:evt.target.value});
	},
	search: function(evt){
		evt.preventDefault();
		var searchTerm = this.state.search;
		var searchUrl = globalSearchUrl(searchTerm);
		log.debug(`searching:${searchUrl}`);
		
		Net.ajax({url:searchUrl}).then((resp) => {
			log.debug(resp);
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
			log.debug(`rendering CanonicalItem for ${globalItem.ID}`);
			return (
				<CanonicalItem key={globalItem.ID} item={globalItem} />
			);
		});

		return (
			<div className='global-search'>
				<form onSubmit={this.search}>
					<div className='input-group'>
						<input type='text' className='form-control' onChange={this.handleSearchChange} />
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
