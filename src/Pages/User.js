'use strict';

var log = require('../../library/libZoteroJS/src/Log.js').Logger('zotero-web-library:Pages:User');

var User = {
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
	}
};

module.exports = User;