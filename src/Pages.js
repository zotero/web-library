'use strict';

var log = require('./Log.js').Logger('zotero-web-library:Pages');
var BrowserDetect = require('./BrowserDetect.js');
/**
 * Zotero.Pages class containing page specific functions for the website. Loaded based on
 * the value of zoterojsClass
 */
var Pages = {
	//base zotero js functions that will be used on every page
	base: {

		init: function(){
			this.tagline();
			this.setupSearch();
			this.setupNav();
			J('#sitenav .toggle').click(this.navMenu);
			
			//set up support page expandos
			J('.support-menu-expand-section').hide();
			J('.support-menu-section').on('click', 'h2', function(){
				J(this).siblings('.support-menu-expand-section').slideToggle();
			});
			
		},
		
		/**
		 * Selects a random tagline for the header
		 *
		 * @return void
		 **/
		tagline: function(){
			var taglines = [
				'See it. Save it. Sort it. Search it. Cite it.',
				'Leveraging the long tail of scholarship.',
				'A personal research assistant. Inside your browser.',
				'Goodbye 3x5 cards, hello Zotero.',
				'Citation management is only the beginning.',
				'The next-generation research tool.',
				'Research, not re-search',
				'The web now has a wrangler.'
			];
			var pos = Math.floor(Math.random() * taglines.length);
			J('#tagline').text(taglines[pos]);
		},

		/**
		 * Send search to the right place
		 *
		 * @return void
		 **/
		setupSearch: function() {
			//log.debug("setupSearch");
			var context = 'support';
			var label   = '';
			
			// Look for a context specific search
			if(undefined !== window.zoterojsSearchContext){
				context = zoterojsSearchContext;
			}
			switch (context) {
				case 'people'        : label = 'Search for people';    break;
				case 'group'         : label = 'Search for groups';    break;
				case 'documentation' : label = 'Search documentation'; break;
				case 'library'       : label = 'Search Library';       break;
				case 'grouplibrary'  : label = 'Search Library';       break;
				case 'support'       : label = 'Search support';       break;
				case 'forums'        : label = 'Search forums';        break;
				default              : label = 'Search support';       break;
			}
			
			if(context == 'documentation' || context == 'support'){
				J('#simple-search').on('submit', function(e){
					e.preventDefault();
					var query     = J(this).find("input[type='text']").val();
					Z.pages.base.supportSearchRedirect(query);
				});
			}

			if(context == 'people' || context == 'group'){
				J('#simple-search').on('submit', function(e){
					e.preventDefault();
					var searchUrl = Zotero.config.baseZoteroWebsiteUrl + '/search/#type/' + context;
					var query     = J(this).find("input[type='text']").val();
					if(query !== '' && query != label){
						searchUrl = searchUrl + '/q/' + encodeURIComponent(query);
					}
					location.href = searchUrl;
					return false;
				});
			}
		},
		
		supportSearchRedirect: function(query) {
			var q = encodeURIComponent(query + ' site:www.zotero.org/support');
			//log.debug(q);return;
			var url = 'https://duckduckgo.com/?q=' + q;
			window.location = url;
		},

		forumSearchRedirect: function(query) {
			var q = encodeURIComponent(query + ' site:forums.zotero.org');
			var url = 'https://duckduckgo.com/?q=' + q;
			/*var url = "https://www.google.com/#q=" + q;*/
			window.location = url;
		},
		/**
		 * Select the right nav tab
		 *
		 * @return void
		 **/
		setupNav: function () {
			var tab = '';
			// Look for a context specific search
			if(undefined !== window.zoterojsSearchContext){
				tab = zoterojsSearchContext;
				if(tab == 'support') { tab = ''; }
				
			}
			// special case for being on the home page
			if(location.pathname == '/' && location.href.search('forums.') < 0){
				tab = 'home';
			}
			if(tab !== ''){
				J('.primarynav').find('a.' + tab).closest('li').addClass('active');
			}
		}
	},
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
	},
	
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
	
	user_register: {
		init: function(){
			//insert slug preview label
			J("input[name='username']").after("<label id='slugpreview'>Profile URL: " +
									Zotero.config.baseZoteroWebsiteUrl + '/' +
									Zotero.utils.slugify(J("input[name='username']").val()) +
									'</label>');

			// When the value of the input box changes,
			J("input[name='username']").bind('keyup change', Zotero.pages.user_register.nameChange);
		},
		
		nameChange: function(){
			//make sure label is black after each change before checking with server
			J('#slugpreview').css('color', 'black');
			
			//create slug from username
			parent.slug = Zotero.utils.slugify( J("input[name='username']").val() );
			J('#slugpreview').text( 'Profile URL: ' + Zotero.config.baseZoteroWebsiteUrl + '/' + parent.slug );
			
			//check slug with server after half-second
			clearTimeout(parent.checkUserSlugTimeout);
			parent.checkUserSlugTimeout = setTimeout(Zotero.pages.user_register.checkSlug, 500);
		},
		
		checkSlug: function(){
			J.getJSON(baseURL + '/user/checkslug', {'slug':slug}, function(data){
				if(data.valid){
					J('#slugpreview').css('color', 'green');
				} else {
					J('#slugpreview').css('color', 'red');
				}
			});
		}
	},
	
	user_profile: {
		init: function(){
			J('#invite-button').click(function(){
				var groupID = J('#invite_group').val();
				J.post('/groups/inviteuser', {ajax:true, groupID:groupID, userID:zoteroData.profileUserID}, function(data){
					if(data == 'true'){
						Zotero.ui.jsNotificationMessage('User has been invited to join your group.', 'success');
						J('#invited-user-list').append('<li>' + J('#invite_group > option:selected').html() + '</li>');
						J('#invite_group > option:selected').remove();
						if(J('#invite_group > option').length === 0){
							J('#invite_group').remove();
							J('#invite-button').remove();
						}
					}
				}, 'text');
			});
		}
	},
	group_compose: {
		init: function(){
			Zotero.ui.init.rte('nolinks');
		}
	},
	
	index_index: {
	},
	
	search_index: {
		init: function(){
		}
	},
	
	search_items: {
		init: function(){
			try{
				var library = new Zotero.Library();
			}
			catch(e){
				log.error('Error initializing library');
			}
			
			J('#item-submit').bind('click submit', J.proxy(function(e){
				log.debug('item search submitted', 3);
				e.preventDefault();
				e.stopImmediatePropagation();
				var q = J('#itemQuery').val();
				var globalSearchD = library.fetchGlobalItems({q:q});
				globalSearchD.then(function(globalItems){
					log.debug('globalItemSearch callback', 3);
					//log.debug(globalItems);
					J('#search-result-count').empty().append(globalItems.totalResults);
					var jel = J('#search-results');
					jel.empty();
					J.each(globalItems.objects, function(ind, globalItem){
						J('#globalitemdetailsTemplate').tmpl({globalItem:globalItem}).appendTo(jel);
					});
				});
				return false;
			}, this ) );
		}
	},
	
	index_start: {
		init: function() {
			// Fit the iFrame to the window
			Zotero.pages.index_start.sizeIframe();

			// Resize the iframe when the window is resized
			J(window).resize(Zotero.pages.index_start.sizeIframe);
			
			// Change the iframe src
			J('.start-select').click(function(){
				J('iframe').attr('src', J(this).attr('href'));
				return false;
			});
			
			J('.start-show-overlay').click(function(){
				J('#start-overlay').show();
				return false;
			});
			
			J('.start-hide-overlay').click(function(){
				J('#start-overlay').hide();
				return false;
			});
			
			Zotero.pages.user_register.init();
		},
		// Resize the height of the iframe to fill the page
		sizeIframe: function() {
			J('iframe').css('height', J(window).height() - 144);
		}
	},
	
	index_startstandalone: {
		init: function() {
			var browsername = BrowserDetect.browser;
			switch(browsername){
				case 'Chrome':
					J('#chrome-connector-download-button').closest('li').detach().prependTo('#recommended-download > ul');
					break;
				case 'Safari':
					J('#safari-connector-download-button').closest('li').detach().prependTo('#recommended-download > ul');
					break;
				case 'Firefox':
					J('#firefox-connector-message').closest('li').detach().prependTo('#recommended-download > ul');
					break;
				default:
					J('#connector-download-button').closest('li').detach().prependTo('#recommended-download > ul');
					J('#other-connectors-p').hide();
			}
			J('#recommended-download > ul').prepend('<li><p>Zotero Connectors allow you to save to Zotero directly from your web browser.</p></li>');
			
			Zotero.pages.user_register.init();
		}
	},
	
	index_download: {
		init: function() {
			var browsername = BrowserDetect.browser;
			var os = BrowserDetect.OS;
			var arch = (navigator.userAgent.indexOf('x86_64') != -1) ? 'x86_64' : 'x86';
			
			if(os == 'Windows'){
				J('#standalone-windows-download-button').closest('li').clone().prependTo('#recommended-client-download ul');
			}
			else if(os == 'Mac'){
				J('#standalone-mac-download-button').closest('li').clone().prependTo('#recommended-client-download ul');
			}
			else if(os == 'Linux'){
				if(arch == 'x86_64'){
					J('#standalone-linux64-download-button').closest('li').clone().prependTo('#recommended-client-download ul');
				}
				else {
					J('#standalone-linux32-download-button').closest('li').clone().prependTo('#recommended-client-download ul');
				}
			}
			
			J('#recommended-connector-download').show();
			switch(browsername){
				case 'Chrome':
					J('#chrome-connector-download-button').addClass('recommended-download').closest('li').detach().prependTo('#recommended-connector-download ul');
					break;
				case 'Safari':
					J('#safari-connector-download-button').addClass('recommended-download').closest('li').detach().prependTo('#recommended-connector-download ul');
					break;
				case 'Firefox':
					J('#firefox-connector-download-button').addClass('recommended-download').closest('li').detach().prependTo('#recommended-connector-download ul');
					break;
				default:
					J('#connector-download-button').closest('li').clone().prependTo('#recommended-connector-download ul');
					J('#other-connectors-p').hide();
			}
			J('#recommended-download ul').prepend('<li><p>Zotero Connectors allow you to save to Zotero directly from your web browser.</p></li>');
		}
	},
	
	index_bookmarklet: {
		init: function(){
			J('.bookmarklet-instructions').hide();
			var section = J('#bookmarklet-tabs li.selected').data('section');
			J('#' + section + '-bookmarklet-div').show();
			
			J('#bookmarklet-tabs li').on('click', function(e){
				log.debug('bookmarklet tab clicked', 3);
				J('#bookmarklet-tabs li.selected').removeClass('selected');
				J(this).addClass('selected');
				var section = J(this).data('section');
				J('.bookmarklet-instructions').hide();
				J('#' + section + '-bookmarklet-div').show();
			});
		}
	}
}; // end zoterojs

module.exports = Pages;
