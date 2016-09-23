'use strict';

var log = require('libzotero/lib/Log').Logger('zotero-web-library:LibrarySearchBox');

var React = require('react');

var LibrarySearchBox = React.createClass({
	componentWillMount: function(){
	},
	getInitialState: function(){
		let query = Zotero.state.getUrlVar('q');
		if(query === undefined){
			query = '';
		}
		return {
			searchType: 'simple',
			query:query
		};
	},
	search: function(evt) {
		evt.preventDefault();
		log.debug('library-search form submitted', 3);
		Zotero.state.clearUrlVars(['collectionKey', 'tag', 'q', 'qmode']);
		let query = this.state.query;
		let searchType = this.state.searchType;
		
		if(query !== '' || Zotero.state.getUrlVar('q') ){
			Zotero.state.pathVars['q'] = query;
			if(searchType != 'simple'){
				Zotero.state.pathVars['qmode'] = searchType;
			}
			Zotero.state.pushState();
		}
		return false;
	},
	clearLibraryQuery: function(){
		Zotero.state.unsetUrlVar('q');
		Zotero.state.unsetUrlVar('qmode');
		
		this.setState({query:''});
		Zotero.state.pushState();
		return;
	},
	changeSearchType: function(evt){
		evt.preventDefault();
		let selectedType = evt.target.getAttribute('data-searchtype');
		this.setState({searchType: selectedType});
	},
	changeQuery: function(evt){
		this.setState({query:evt.target.value});
	},
	render: function() {
		var placeHolder = '';
		if(this.state.searchType == 'simple'){
			placeHolder = 'Search Title, Creator, Year';
		} else if(this.state.searchType == 'everything'){
			placeHolder = 'Search Full Text';
		}
		
		return (
			<div className="btn-toolbar row" id="search-box" style={{maxWidth:'350px'}}>
				<form action="/search/" onSubmit={this.search} className="navbar-form zsearch library-search" role="search">
					<div className="input-group">
						<div className="input-group-btn">
							<button type="button" className="btn btn-default dropdown-toggle" data-toggle="dropdown"><span className="caret"></span></button>
							<ul className="dropdown-menu">
								<li><a href="#" onClick={this.changeSearchType} data-searchtype="simple">Title, Creator, Year</a></li>
								<li><a href="#" onClick={this.changeSearchType} data-searchtype="everything">Full Text</a></li>
							</ul>
						</div>
						<input onChange={this.changeQuery} value={this.state.query} type="text" name="q" id="header-search-query" className="search-query form-control" placeholder={placeHolder}/>
						<span className="input-group-btn">
							<button onClick={this.clearLibraryQuery} className="btn btn-default clear-field-button" type="button"><span className="glyphicons fonticon glyphicons-remove-2"></span></button>
						</span>
					</div>
				</form>
			</div>
		);
	}
});

module.exports = LibrarySearchBox;
