'use strict';

var log = require('libzotero/lib/Log').Logger('zotero-web-library:searchbox');

var React = require('react');

var SearchBox = React.createClass({
	componentWillMount: function(){
		// Look for a context specific search
		if(undefined !== window.zoterojsSearchContext){
			this.setState({searchContext: window.zoterojsSearchContext});
		}
	},
	getInitialState: function() {
		return {
			searchContext:'',
			q:''
		};
	},
	clearQuery: function() {
		this.setState({q:''});
	},
	changeQuery: function(evt) {
		this.setState({q:evt.target.value});
	},
	search: function(evt) {
		if(evt){
			evt.preventDefault();
		}
		let q = '';
		let url = '';
		switch(this.state.searchContext){
			case 'support':
			case 'documentation':
				q = encodeURIComponent(this.state.q + ' site:www.zotero.org/support');
				url = `https://duckduckgo.com/?q=${q}`;
				window.location = url;
				break;
			case 'forums':
				q = encodeURIComponent(this.state.q + ' site:forums.zotero.org');
				url = `https://duckduckgo.com/?q=${q}`;
				window.location = url;
				break;
			case 'people':
				q = encodeURIComponent(this.state.q);
				url = `/search/type/users?q=${q}`;
				window.location = url;
				break;
			case 'group':
				q = encodeURIComponent(this.state.q);
				url = `/search/type/groups?q=${q}`;
				window.location = url;
				break;
			case 'library':
			case 'grouplibrary':

				break;
		}
	},
	render: function(){

		let placeHolder = '';
		switch(this.state.searchContext){
			case 'people'        : placeHolder = 'Search People';    break;
			case 'group'         : placeHolder = 'Search Groups';    break;
			case 'documentation' : placeHolder = 'Search Documentation'; break;
			case 'library'       : placeHolder = 'Search Library';       break;
			case 'grouplibrary'  : placeHolder = 'Search Library';       break;
			case 'support'       : placeHolder = 'Search Support';       break;
			case 'forums'        : placeHolder = 'Search Forums';        break;
			default              : placeHolder = 'Search Support';
		}
		
		return (
			<form action="/search/" onSubmit={this.search} className="navbar-form navbar-right" role="search">
				<div className="input-group">
					<input onChange={this.changeQuery} value={this.state.q} type="text" name="q" id="header-search-query" className="search-query form-control" placeholder={placeHolder}/>
					<span className="input-group-btn">
						<button onClick={this.clearQuery} className="btn btn-default clear-field-button" type="button"><span className="glyphicons fonticon glyphicons-remove-2"></span></button>
					</span>
				</div>
			</form>
		);
	}
});

module.exports = SearchBox;