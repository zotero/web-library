'use strict';

var log = require('libzotero/lib/Log').Logger('zotero-web-library:profileGroupsList');

var React = require('react');

var LoadingSpinner = require('./LoadingSpinner.js');

var ProfileGroupsList = React.createClass({
	componentWillMount: function() {
		var reactInstance = this;
		var groups = new Zotero.Groups();
		reactInstance.setState({loading:true});
		groups.fetchUserGroups(reactInstance.props.userID)
		.then(function(response){
			var groups = response.fetchedGroups;
			reactInstance.setState({groups:groups, loading:false});
		}).catch(Zotero.catchPromiseError);
	},
	getInitialState: function() {
		return {
			groups: [],
			loading:false
		};
	},
	render: function() {
		var reactInstance = this;
		log.debug(reactInstance.state.groups);
		
		var memberGroups = reactInstance.state.groups.map(function(group){
			return (
				<li key={group.get('id')}>
					<a href={Zotero.url.groupViewUrl(group)}>{group.get('name')}</a>
				</li>
			);
		});
		
		return (
			<div className="profile-groups-list">
				<h2>Groups</h2>
				<LoadingSpinner loading={reactInstance.state.loading} />
				<ul>
					{memberGroups}
				</ul>
			</div>
		);
	}
});

module.exports = ProfileGroupsList;
