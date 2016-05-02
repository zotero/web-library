'use strict';

var log = require('../../library/libZoteroJS/src/Log.js').Logger('zotero-web-library:Pages:Settings');

var SettingsPages = {
	settings_cv: {
		init: function(){
			// Delete the cv section when the delete link is clicked
			J('#cv-sections').on('click', '.cv-delete', function(e){
				if(confirm ('Are you sure you want to delete this section?')){
					// Clean up RTEs before moving the base DOM elements around
					Zotero.ui.cleanUpRte(J('#cv-sections'));
					
					J(this).closest('div.cv-section').remove();
					
					Zotero.ui.init.rte('default', false, J('#cv-sections'));
					
					return false;
				}
			});
			
			// Add a new cv section when the add button is clicked
			J('.cv-insert-freetext').on('click', function(e){
				// Get the number of sections that exist before adding a new one
				var sectionCount  = J('#cv-sections div.cv-section').length;
				var newIndex = sectionCount + 1;
				var newTextareaID = 'cv_' + newIndex + '_text';

				//render new section template into end of sections
				J('#cv-sections').append( J('#cvsectionTemplate').render({
					cvSectionIndex: newIndex,
					cvSectionType: 'text',
					cvEntry: {},
				}) );

				//activate RTE
				Zotero.ui.init.rte('default', false, J('div.cv-section').last());
				
				J('input.cv-heading').last().focus();
				return false;
			});
			
			// Add a new cv collection when the add button is clicked
			J('.cv-insert-collection').on('click', function(e){
				// Get the number of sections that exist before adding a new one
				var sectionCount  = J('#cv-sections div.cv-section').length;
				var newIndex = sectionCount + 1;
				
				//render new section template into end of sections
				J('#cv-sections').append( J('#cvsectionTemplate').render({
					cvSectionIndex: newIndex,
					cvSectionType: 'collection',
					collectionOptions: zoteroData.collectionOptions,
					cvEntry:{},
				}) );

				J('input.cv-heading').last().focus();
				return false;
			});
			
			// Move the section down when the down link is clicked
			J('#cv-sections').on('click', '.cv-move-down', function(e){
				if(J(this).closest('div.cv-section').find('textarea').length > 0){
					// Clean up RTEs before moving the base DOM elements around
					Zotero.ui.cleanUpRte(J('#cv-sections'));
					
					// Move the section and reenable the rte control
					J(this).closest('div.cv-section').next().after(J(this).closest('div.cv-section'));
					Zotero.ui.init.rte('default', false);
				}
				else {
					J(this).closest('div.cv-section').next().after(J(this).closest('div.cv-section'));
				}

				//Zotero.pages.settings_cv.hideMoveLinks();
				return false;
			});
			
			// Move the section up when the up link is clicked
			J('#cv-sections').on('click', '.cv-move-up', function(e){
				if(J(this).closest('div.cv-section').find('textarea').length > 0){
					// Clean up RTEs before moving the base DOM elements around
					Zotero.ui.cleanUpRte(J('#cv-sections'));
					
					// Move the section and reenable the rte control
					J(this).closest('div.cv-section').prev().before(J(this).closest('div.cv-section'));
					Zotero.ui.init.rte('default', false);
				}
				else {
					J(this).closest('div.cv-section').prev().before(J(this).closest('div.cv-section'));
				}
				//Zotero.pages.settings_cv.hideMoveLinks();
				return false;
			});
			
			// reindex the field names before submitting the form
			J('#cv-submit').click(function(e){
				J('#cv-sections div.cv-section').each(function(i){
					var heading;
					if(J(this).hasClass('cv-text') ){
						heading = J(this).find('.cv-heading').attr('name', 'cv_'+(i+1)+'_heading');
						if(heading.val() == 'Enter a section name'){
							heading.val('');
						}
						J(this).find('.cv-text').attr('name', 'cv_'+(i+1)+'_text');
					}
					else if(J(this).hasClass('cv-collection') ){
						heading = J(this).find('.cv-heading').attr('name', 'cv_'+(i+1)+'_heading');
						if(heading.val() == 'Enter a section name'){
							heading.val('');
						}
						J(this).find('select.cv-collection').attr('name', 'cv_'+(i+1)+'_collection');
					}
				});
			});
			
			//init existing rte on first load
			Zotero.ui.init.rte('nolinks', false, J('#cv-sections'));
		}
	},
	
	settings_account: {
	},
	
	settings_profile: {
		init: function(){
			Zotero.ui.init.rte('nolinks');
		}
	},
	
	settings_privacy: {
		//disable publishNotes checkbox when the library is not set to be public
		init: function(){
			if(!J('input#privacy_publishLibrary').prop('checked')){
				J('input#privacy_publishNotes').prop('disabled',true);
			}
			J('input#privacy_publishLibrary').bind('change', function(){
				if(!J('input#privacy_publishLibrary').prop('checked')){
					J('input#privacy_publishNotes').prop('checked', false).prop('disabled',true);
				}
				else{
					J('input#privacy_publishNotes').prop('disabled', false);
				}
			});
		}
		
	},
	
	settings_apikeys: {
		init: function(){
			
		}
	},
	
	settings_newkey: {
		init: function(){
			log.debug('zoteroPages settings_newkey', 3);
			Zotero.pages.settings_editkey.init();
		}
	},
	
	settings_newoauthkey: {
		init: function(){
			Zotero.pages.settings_newkey.init();
			
			J("button[name='edit']").closest('div.form-group').nextAll().hide();
			J("button[name='edit']").click(function(e){
				e.preventDefault();
				J("button[name='edit']").closest('div.form-group').nextAll().show();
			});
		},
		
		updatePermissionsSummary: function(){
			J('#permissions-summary').empty().append(Z.pages.settings_newoauthkey.permissionsSummary());
		},
		
		//build a human readable summary of currently selected permissions
		permissionsSummary: function(){
			var summary = '';
			var libraryAccess = J('input#library_access').prop('checked');
			var notesAccess = J('input#notes_access').prop('checked');
			var writeAccess = J('input#write_access').prop('checked');
			if(libraryAccess){
				summary += 'Access to read your personal library.<br />';
			}
			if(notesAccess){
				summary += 'Access to read notes in your personal library.<br />';
			}
			if(writeAccess){
				summary += 'Access to read and modify your personal library.<br />';
			}
			var allGroupAccess = J("input[name='groups_all']:checked").val();
			switch(allGroupAccess){
				case 'read':
					summary += 'Access to read any of your group libraries<br />';
					break;
				case 'write':
					summary += 'Access to read and modify any of your group libraries<br />';
					break;
			}
			
			var allowIndividualGroupPermissions = J('input#individual_groups').prop('checked');
			var individualGroupAccess = [];
			if(allowIndividualGroupPermissions){
				J('input.individual_group_permission:checked').each(function(ind, el){
					var groupname = J(el).data('groupname');
					var groupID = J(el).data('groupid');
					var permission = J(el).val();
					switch(permission){
						case 'read':
							summary += "Access to read library for group '" + groupname + "'<br />";
							break;
						case 'write':
							summary += "Access to read and modify library for group '" + groupname + "'<br />";
							break;
					}
				});
			}
			
			return summary;
		},
	},
	
	settings_editkey: {
		init: function(){
			log.debug('zoteroPages settings_editkey', 3);
			if(!J("input[type='checkbox'][name='library_access']").prop('checked')){
				J("input[name='notes_access']").prop('disabled','disabled');
			}
			J('input#library_access').bind('change', function(){
				if(!J("input[type='checkbox'][name='library_access']").prop('checked')){
					J("input[name='notes_access']").prop('checked', false).prop('disabled', true);
					J("input[name='write_access']").prop('checked', false).prop('disabled', true);
				}
				else{
					J("input[name='notes_access']").prop('disabled', false);
					J("input[name='write_access']").prop('disabled', false);
				}
			});
			J("input[name='name']").focus();
			
			if(!(J("input[type='checkbox'][name='individual_groups']").prop('checked'))) {
				J('.individual_group_permission').closest('div.form-group').hide();
			}
			J("input[name='individual_groups']").bind('change', function(){
				if(J("input[type='checkbox'][name='individual_groups']").prop('checked')){
					J('.individual_group_permission').closest('div.form-group').show();
				}
				else{
					J('.individual_group_permission').closest('div.form-group').hide();
				}
			});
			
			J('input').bind('change', Zotero.pages.settings_newoauthkey.updatePermissionsSummary);
			Zotero.pages.settings_newoauthkey.updatePermissionsSummary();
		}
	},
	
	settings_storage: {
		init: function(){
			var selectedLevel = J('input[name=storageLevel]:checked').val();
			
			Zotero.pages.settings_storage.showSelectedResults(selectedLevel);
			
			J('input[name=storageLevel]').change(function(){
				Zotero.pages.settings_storage.showSelectedResults(J('input[name=storageLevel]:checked').val());
			});
			
			J('#purge-button').click(function(){
				if(confirm('You are about to remove all uploaded files associated with your personal library.')){
					J('#confirm_delete').val('confirmed');
					return true;
				}
				else{
					return false;
				}
			});
		},
		
		showSelectedResults: function(selectedLevel){
			if(selectedLevel == 2){
				J('#order-result-div').html(zoteroData.orderResult2);
			}
			else if(selectedLevel == 3){
				J('#order-result-div').html(zoteroData.orderResult3);
			}
			else if(selectedLevel == 4){
				J('#order-result-div').html(zoteroData.orderResult4);
			}
			else if(selectedLevel == 5){
				J('#order-result-div').html(zoteroData.orderResult5);
			}
			else if(selectedLevel == 6){
				J('#order-result-div').html(zoteroData.orderResult6);
			}
		}
	},
	
	settings_deleteaccount: {
		init: function(){
			J('button#deleteaccount').click(function(){
				if(!confirm('Are you sure you want to permanently delete your account? You will not be able to recover the account or the user name.')){
					return false;
				}
			});
		}
	}
};

module.exports = SettingsPages;