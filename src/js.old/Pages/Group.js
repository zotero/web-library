'use strict';

var log = require('libzotero/lib/Log').Logger('zotero-web-library:Pages:Group');

var React = require('react');
var ReactDOM = require('react-dom');
var UserGroupInfo = require('../libraryUi/widgets/UserGroupInfo.js');
var RecentItems = require('../libraryUi/widgets/RecentItems.js');
var CreateGroup = require('../libraryUi/widgets/CreateGroup.js');

var Group = {
	group_new: {
		init: function(){
			log.debug('group_new init');
			ReactDOM.render(
				React.createElement(CreateGroup, null),
				document.getElementById('create-group')
			);
			return;
		}
	},
	
	group_settings: {
		init: function(){
			Zotero.ui.init.rte('nolinks');
			
			J('#deleteForm').submit(function(){
				if(confirm('This will permanently delete this group, including any items in the group library')){
					J('#confirm_delete').val('confirmed');
					return true;
				}
				else{
					return false;
				}
			});
			J('#type-PublicOpen').click(function(){
				if(confirm('Changing a group to Public Open will remove all files from Zotero Storage')){
					return true;
				}
				else{
					return false;
				}
			});
		}
	},
	
	group_library_settings: {
		init: function(){
			//initially disable inputs with disallowed values for current group type
			if(J('#type-PublicOpen').prop('checked')){
				//disallow file storage options for public open groups
				J('#fileEditing-admins').prop('disabled', '1');
				J('#fileEditing-members').prop('disabled', '1');
			}
			if(J('#type-Private').prop('checked')){
				//disallow internet readable on private
				J('#libraryReading-all').prop('disabled', '1');
			}
			
			//confirmation on changing group type to public open
			J('#type-PublicOpen').click(function(){
				if(confirm('Changing a group to Public Open will remove all files from Zotero Storage')){
					//disallow files
					J("input[name='fileEditing']").val(['none']);
					J('#fileEditing-admins').prop('disabled', '1');
					J('#fileEditing-members').prop('disabled', '1');
					//allow public library
					J('#libraryReading-all').prop('disabled', '');
					
					return true;
				}
				else{
					return false;
				}
			});
			
			J('#type-Private').click(function(){
				//select members only viewing of private group which is mandatory
				J("input[name='libraryReading']").val(['members']);
				//disable public library radio for private group
				J('#libraryReading-all').prop('disabled', '1');
				//allow files
				J('#fileEditing-admins').prop('disabled', '');
				J('#fileEditing-members').prop('disabled', '');
			});
			
			J('#type-PublicClosed').click(function(){
				//allow files
				J('#fileEditing-admins').prop('disabled', '');
				J('#fileEditing-members').prop('disabled', '');
				//allow public library
				J('#libraryReading-all').prop('disabled', '');
				
			});
		}
	},
	
	group_view: {
		init: function(){
			var recentItemsDiv = document.getElementById('recent-items-div');
			var library = Zotero.ui.getAssociatedLibrary(recentItemsDiv);

			ReactDOM.render(
				React.createElement(RecentItems, {library:library}),
				document.getElementById('recent-items-div')
			);

			J('#join-group-button').click(Zotero.pages.group_view.joinGroup);
			J('#leave-group-button').click(Zotero.pages.group_view.leaveGroup);
			
			Zotero.ui.init.rte('nolinks');
		},
		
		joinGroup: function(){
			Zotero.ui.showSpinner(J('.join-group-div'));
			J.post('/groups/' + zoteroData.groupID + '/join', {ajax:true}, function(data){
				if(data.pending === true){
					J('.join-group-div').empty().append('Membership Pending');
				}
				else if(data.success === true){
					Zotero.ui.jsNotificationMessage('You are now a member of this group', 'success');
				}
				else{
					J('.join-group-div').empty();
					Zotero.ui.jsNotificationMessage('There was a problem joining this group.', 'error');
				}
			},
			'json');
		},
		
		leaveGroup: function(){
			if(confirm('Leave group?')){
				Zotero.ui.showSpinner(J('.leave-group-div'));
				J.post('/groups/' + zoteroData.groupID + '/leave', {ajax:true}, function(data){
					if(data.success === true){
						J('leave-group-div').empty();
						Zotero.ui.jsNotificationMessage('You are no longer a member of this group', 'success');
					}
					else{
						J('leave-group-div').empty();
						Zotero.ui.jsNotificationMessage('There was a problem leaving this group. Please try again in a few minutes.', 'error');
					}
				},
				'json');
			}
		}
	},
	
	group_index: {
		init: function(){
			//set up screen cast player + box
			//J("video").mediaelementplayer();
			//TODO: lightbox?
			log.debug('group_index init', 3);
			ReactDOM.render(
				React.createElement(UserGroupInfo, null),
				document.getElementById('user-groups-div')
			);
		}
	},

	groupdiscussion_view: {
		init: function(){
			
		}
	},
	group_compose: {
		init: function(){
			Zotero.ui.init.rte('nolinks');
		}
	}
	
};

module.exports = Group;