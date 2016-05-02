'use strict';

var log = require('../../library/libZoteroJS/src/Log.js').Logger('zotero-web-library:Pages:Group');

var Group = {
	group_new: {
		init: function(){
			var timeout;
			// When the value of the input box changes,
			J('input#name').keyup(function(e){
				clearTimeout(timeout);
				timeout = setTimeout(Zotero.pages.group_new.nameChange, 300);
			});
			
			J('input[name=group_type]').change(Zotero.pages.group_new.nameChange);
			
			//insert slug preview label
			J('input#name').after("<label id='slugpreview'>Group URL: " +
									Zotero.config.baseZoteroWebsiteUrl + '/' + 'groups/' +
									Zotero.utils.slugify(J('input#name').val()) +
									'</label>');
			
		},
		
		nameChange: function(){
			//make sure label is black after each change before checking with server
			J('#slugpreview').css('color', 'black');
			var groupType = J('input[name=group_type]:checked').val();
			// update slug preview text
			if(groupType == 'Private'){
				J('#slugpreview').text('Group URL: ' +Zotero.config.baseZoteroWebsiteUrl + '/' + 'groups/<number>');
			}
			else{
				J('#slugpreview').text('Group URL: ' +Zotero.config.baseZoteroWebsiteUrl + '/' + 'groups/' +
				Zotero.utils.slugify(J('input#name').val()) );
			}
			
			if(groupType != 'Private'){
				// Get the value of the name input
				var input = J('input#name').val();
				// Poll the server with the input value
				J.getJSON(baseURL+'/group/checkname/', {'input':input}, function(data){
					J('#namePreview span').text(data.slug);
					if(data.valid){
						J('#slugpreview').css({'color':'green'});
					} else {
						J('#slugpreview').css({'color':'red'});
					}
					J('#namePreview img').remove();
				});
			}
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