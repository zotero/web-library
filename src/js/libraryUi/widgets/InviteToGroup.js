'use strict';

var log = require('libzotero/lib/Log').Logger('zotero-web-library:inviteToGroup');

var React = require('react');
var BootstrapModalWrapper = require('./BootstrapModalWrapper.js');

var InviteButton = React.createClass({
	handleClick: function(evt){
		var invDialog = ReactDOM.render(
			<InviteDialog />,
			document.getElementById('invite-to-group-dialog')
		);
		invDialog.openDialog();
	},
	render: function() {
		var reactInstance = this;
		if(!Zotero.config.loggedIn){
			return null;
		}
		if(zoteroData.profileUserID == Zotero.config.loggedInUserID) {
			return null;
		}
		return (
			<button className="btn btn-primary" onClick={reactInstance.handleClick}>Invite to group</button>
		);
	}
});

var InviteDialog = React.createClass({
	componentWillMount: function() {
		var reactInstance = this;
		var groups = new Zotero.Groups();
		if(Zotero.config.loggedIn && Zotero.config.loggedInUserID && (zoteroData.profileUserID != Zotero.config.loggedInUserID)){
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
	openDialog: function() {
		//this.setState({open:true});
		this.refs.modal.open();
	},
	closeDialog: function(evt) {
		//this.setState({open:false});
		this.refs.modal.close();
	},
	inviteToGroup: function(evt) {
		var reactInstance = this;
		log.debug(evt);
		var groupID = parseInt(evt.currentTarget.getAttribute('data-groupid'), 10);
		
		J.ajax({
			'type': 'POST',
			'url': '/groups/inviteuser',
			'data': {
				'groupID': groupID,
				'userID': zoteroData.profileUserID
			},
			'processData': true
		}).then(function(data){
			log.debug('got response from inviteuser');
            if(data == 'true'){
                Zotero.ui.jsNotificationMessage('User has been invited', 'success');
            }
		});
	},
	render: function() {
		var reactInstance = this;
		var invitedGroupIDs = zoteroData.invitedGroupIDs;

		var groupNodes = reactInstance.state.groups.map(function(group){
			if(invitedGroupIDs.indexOf(group.get('id').toString() ) != -1){
				return (
					<li key={group.get('id')}>
						Invitation pending to '{group.get('name')}'
					</li>
				);
			} else {
				return (
					<li key={group.get('id')}>
						<button className="btn btn-default" onClick={reactInstance.inviteToGroup} data-groupid={group.get('id')}>{group.get('name')}</button>
					</li>
				);
			}
		});

		return (
			<BootstrapModalWrapper ref="modal">
				<div id="invite-user-dialog" className="invite-user-dialog" role="dialog" title="Invite User" data-keyboard="true">
					<div  className="modal-dialog">
						<div className="modal-content">
							<div className="modal-header">
								<button type="button" className="close" data-dismiss="modal" aria-hidden="true">×</button>
								<h3>Invite User</h3>
							</div>
							<div className="modal-body" data-role="content">
								<ul>
									{groupNodes}
								</ul>
							</div>
						</div>
					</div>
				</div>
			</BootstrapModalWrapper>
		);
	}
});

module.exports = InviteButton;
