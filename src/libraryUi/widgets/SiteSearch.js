'use strict';

var log = require('../../../library/libZoteroJS/src/Log.js').Logger('zotero-web-library:SiteSearch');
var net = require('../../../library/libZoteroJS/src/Net.js');
var React = require('react');
var LoadingSpinner = require('./LoadingSpinner.js');

var supportSearchRedirect = function(query) {
	var q = encodeURIComponent(query + ' site:www.zotero.org/support');
	var url = 'https://duckduckgo.com/?q=' + q;
	window.location = url;
};

var forumSearchRedirect = function(query) {
	var q = encodeURIComponent(query + ' site:forums.zotero.org');
	var url = 'https://duckduckgo.com/?q=' + q;
	/*var url = "https://www.google.com/#q=" + q;*/
	window.location = url;
};


var UserSearchResult = React.createClass({
	render: function() {
		let user = this.props.user;
		let profile = user.meta.profile;

		let profileHref = `/${user.slug}`;
		
		let imageSrc = `https://s3.amazonaws.com/zotero.org/images/settings/profile/default_squarethumb.png`;
		if(user.hasImage == true) {
			imageSrc = `https://s3.amazonaws.com/zotero.org/images/settings/profile/${user.userID}_squarethumb.png`;
		}

		let profileImage = (
			<a href={profileHref}>
				<img className="small-profile-image media-object" src={imageSrc} alt={user.displayName} title={user.displayName} />
			</a>
		);

		let profileNodes = ['title', 'affiliation', 'location', 'disciplines'].map(function(field){
			if(!profile[field]) {
				return null;
			}
			return (
				<li key={field}>{profile[field]}</li>
			);
		});

		return (
			<li className="user-result">
				<div className="nugget-user media">
					<div className="media-left">
						{profileImage}
					</div>
					<div className="media-body">
						<div className="nugget-name">
							<a href={profileHref}>{user.displayName}</a>
						</div>
						<ul className="nugget-profile list-unstyled">
							{profileNodes}
						</ul>
					</div>
				</div>
			</li>
		);
	}
});

var GroupSearchResult = React.createClass({
	render: function() {
		let group = this.props.group;
		let data = group.apiObj.data;

		let groupHref = group.apiObj.links.alternate;
		let groupLibraryHref = groupHref + '/items';

		let groupImage = null;
		if(group.wwwData.hasImage) {
			//let imageSrc = `https://s3.amazonaws.com/zotero.org/images/settings/group/default_squarethumb.png`;
			let imageSrc = `https://s3.amazonaws.com/zotero.org/images/settings/group/${data.groupID}_squarethumb.png`;
			groupImage = (
				<a href={groupHref}>
					<img className="small-profile-image media-object" src={imageSrc} alt={data.name} title={data.name} />
				</a>
			);
		}

		let libraryLink = null;
		if(data.type == 'PublicOpen' || data.type == 'PublicClosed'){
			libraryLink = (
				<a href={groupLibraryHref}>Library</a>
			);
		}

		return (
			<li className="group-result">
				<div className="nugget-group media">
					<div className="media-left">
						{groupImage}
					</div>
					<div className="media-body">
						<div className="nugget-name">
							<a href={groupHref}>{data.name}</a>
						</div>
						<dl class="nugget-profile">
							<div className="nugget-description">
								<dt>Description</dt>
								<dd>{data.description}</dd>
							</div>
							<div className="nugget-type">
								<dt>Type</dt>
								<dd>{data.type}</dd>
							</div>
						</dl>
						{libraryLink}
					</div>
				</div>
			</li>
		);
	}
});

var SiteSearch = React.createClass({
	componentWillMount: function() {
		Zotero.config.nonparsedBaseUrl = '/search';
	},
	componentDidMount: function() {
		if(this.state.query != ''){
			this.search();
		}
	},
	getDefaultProps: function() {
		return {
		};
	},
	getInitialState: function() {
		let query = Zotero.state.getUrlVar('q');
		let type = Zotero.state.getUrlVar('type');
		if(type == '' || typeof(type) == 'undefined') {
			type = 'support';
		}
		if(typeof(query) == 'undefined') {
			log.debug('query is undefined');
			query = '';
		}
		return {
			query:query,
			type:type,
			supportType:'documentation',
			loading:false,
			page:1,
			results:null,
			resultCount:null
		};
	},
	queryChanged: function(evt) {
		let newq = evt.target.value;
		this.setState({query:newq, page:1});
	},
	search: function(evt) {
		if(evt){
			evt.preventDefault();
		}
		
		let query = this.state.query;
		let type = this.state.type;

		//redirect to duckduckgo if site search
		if(type == 'support' && this.state.query !== ''){
			if(this.state.supportType == 'documentation'){
				supportSearchRedirect(this.state.query);
			} else if(this.state.supportType == 'forums'){
				forumSearchRedirect(this.state.query);
			}
		}

		Zotero.state.setQueryVar('q', query);
		Zotero.state.pushState();

		//build local search url
		let searchPath = `/search/${type}?query=${encodeURIComponent(query)}`;
		if(this.state.page > 1){
			searchPath += `&page=${this.state.page}`;
		}

		let newState = {loading:true};
		if(this.state.page == 1){
			newState.results = null;
			newState.resultCount = null;
		}
		this.setState(newState);

		net.ajax({
			type:'GET',
			url:searchPath
		}).then((request) => {
			let results = JSON.parse(request.response);
			let newResultArray = results.results;

			if(this.state.page > 1){
				newResultArray = this.state.results.concat(newResultArray);
			}
			this.setState({resultCount:results.resultCount, results:newResultArray, loading:false});
		});
	},
	loadMore: function() {
		let newPage = this.state.page + 1;
		this.setState({page:newPage}, this.search);
	},
	setType: function(evt) {
		evt.preventDefault();
		let type = evt.currentTarget.getAttribute('data-searchtype');
		this.setState({type:type, results:null, resultCount:null, loading:false});
		Zotero.state.setUrlVar('type', type);
		Zotero.state.pushState();
	},
	changeSupportType: function(evt){
		this.setState({supportType:evt.target.value});
	},
	render: function() {
		let resultNodes = null;
		if(this.state.results != null){
			switch(this.state.type){
				case 'users':
					resultNodes = this.state.results.map(function(result){
						return (
							<UserSearchResult key={result.userID} user={result} />
						);
					});
					break;
				case 'groups':
					resultNodes = this.state.results.map(function(result){
						return (
							<GroupSearchResult key={result.apiObj.id} group={result} />
						);
					});
					break;
				case 'default':
					log.warn(`unknown search type: ${this.state.type}`);
			}
			
		}
		let usersLiClassname = this.state.type == 'users' ? 'active' : '';
		let groupsLiClassname = this.state.type == 'groups' ? 'active' : '';
		let supportLiClassname = this.state.type == 'support' ? 'active' : '';
		
		let tabPanel = null;
		switch(this.state.type){
			case 'users':
				tabPanel = (
					<form onSubmit={this.search}>
						<input type="text" className="textinput form-control" value={this.state.query} onChange={this.queryChanged}/>
					</form>
				);
				break;
			case 'groups':
				tabPanel = (
					<form onSubmit={this.search}>
						<input type="text" className="textinput form-control" value={this.state.query} onChange={this.queryChanged}/>
					</form>
				);
				break;
			case 'support':
				tabPanel = (
					<form onSubmit={this.search}>
						<input type="text" className="textinput form-control" value={this.state.query} onChange={this.queryChanged}/>
						<div className="radio">
							<label><input type="radio" checked={this.state.supportType=='documentation'} name="supportType" value="documentation" onChange={this.changeSupportType}/>Documentation</label>
						</div>
						<div className="radio">
							<label><input type="radio" checked={this.state.supportType=='forums'} name="supportType" value="forums" onChange={this.changeSupportType}/>Forums</label>
						</div>
					</form>
				);
				break;
			default:
				log.warn(`unexpected search type: ${this.state.type}`);
		}

		let moreButton = null;
		if(this.state.results != null){
			if(this.state.resultCount > this.state.results.length){
				moreButton = (
					<button className="btn btn-default" onClick={this.loadMore}>More</button>
				);
			}
		}

		return (
			<div className='sitesearch'>
				<h1>Search</h1>
				<ul className='nav nav-pills'>
					<li className={usersLiClassname}><a href="#" data-searchtype="users" onClick={this.setType}><span>People</span></a></li>
					<li className={groupsLiClassname}><a href="#" data-searchtype="groups" onClick={this.setType}><span>Groups</span></a></li>
					<li className={supportLiClassname}><a href="#" data-searchtype="support" onClick={this.setType}><span>Support</span></a></li>
				</ul>
				<div className="tab-content">
					{tabPanel}
				</div>
				<div id="results">
					<h2 id="search-result-count"></h2>
					<LoadingSpinner loading={this.state.loading} />
					<ul id="search-results" className="list-unstyled">
						{resultNodes}
					</ul>
					{moreButton}
				</div>
			</div>
		);
	}
});

module.exports = SiteSearch;
