'use strict';

var log = require('../../../library/libZoteroJS/src/Log.js').Logger('zotero-web-library:userGroupInfo');

var React = require('react');

var LoadingSpinner = require('./LoadingSpinner.js');

var GroupNugget = React.createClass({
	render: function() {
		var reactInstance = this;
		var group = this.props.group;

		var userID = Zotero.config.loggedInUserID;
		var groupManageable = false;
		var memberCount = 1; //owner

		let members = group.get('members');
		let admins = group.get('admins');

		memberCount += members.length;
		memberCount += admins.length;
		
		if(userID && (userID == group.apiObj.data.owner || (admins.indexOf(userID) != -1 ))) {
			groupManageable = true;
		}
		
		var groupImage = null;
		if(group.hasImage){
			groupImage = (
				<a href={Zotero.url.groupViewUrl(group)} className="group-image">
					<img src={Zotero.url.groupImageUrl(group)} alt="" />
				</a>
			);
		}

		var manageLinks = null;
		if(groupManageable){
			manageLinks = (
				<nav className="action-links">
					<li><a href={Zotero.url.groupSettingsUrl(group)}>Manage Profile</a></li>
					<li><a href={Zotero.url.groupMemberSettingsUrl(group)}>Manage Members</a></li>
					<li><a href={Zotero.url.groupLibrarySettingsUrl(group)}>Manage Library</a></li>
				</nav>
			);
		}

		var groupDescription = null;
		if(group.apiObj.data.description){
			var markup = {__html: group.apiObj.data.description};
			groupDescription = (
				<tr>
					<th scope="row">Description</th> 
					<td dangerouslySetInnerHTML={markup}></td>
				</tr>
			);
		}

		var libAccess = Zotero.Group.prototype.accessMap[group.apiObj.data.libraryReading][group.apiObj.data.libraryEditing];
		if(group.apiObj.data.type == 'Private' && group.apiObj.data.libraryReading == 'all'){
			libAccess = Zotero.Group.prototype.accessMap['members'][group.apiObj.data.libraryEditing];
		}

		return (
			<div key={group.groupID} className="nugget-group">
				<div className="nugget-full">
					{groupImage}
					<div className="nugget-name">
						<a href={Zotero.url.groupViewUrl(group)}>{group.apiObj.data.name}</a>
					</div>
					<nav id="group-library-link-nav" className="action-links">
						<ul>
						<li><a href={Zotero.url.groupLibraryUrl(group)}>Group Library</a></li>
						</ul>
					</nav>
					{manageLinks}
					<table className="nugget-profile table">
						<tbody>
						<tr>
							<th scope="row">Members</th>
							<td>{memberCount}</td>
						</tr>
						{groupDescription}
						<tr>
							<th scope="row">Group Type</th>
							<td>{Zotero.Group.prototype.typeMap[group.apiObj.data.type]}</td>
						</tr>
						<tr>
							<th scope="row">Group Library</th>
							<td>
								{libAccess}
							</td>
						</tr>
						</tbody>
					</table>
				</div>
			</div>
		);
	}
});

var UserGroups = React.createClass({
	componentWillMount: function() {
		var reactInstance = this;
		var groups = new Zotero.Groups();
		if(Zotero.config.loggedIn && Zotero.config.loggedInUserID){
			reactInstance.setState({loading:true});
			var groupsPromise = groups.fetchUserGroups(Zotero.config.loggedInUserID)
			.then(function(response){
				var groups = response.fetchedGroups;
				reactInstance.setState({groups:groups, loading:false});
			}).catch(Zotero.catchPromiseError);
		}
	},
	getInitialState: function() {
		return {
			groups: [],
			loading:false
		};
	},
	render: function() {
		var reactInstance = this;
		var groups = this.state.groups;

		var groupNuggets = groups.map(function(group){
			return (
				<GroupNugget key={group.get('id')} group={group} />
			);
		});

		return (
			<div id="user-groups-div" className="user-groups">
				{groupNuggets}
				<LoadingSpinner loading={reactInstance.state.loading} />
			</div>
		);
	}
});

module.exports = UserGroups;
