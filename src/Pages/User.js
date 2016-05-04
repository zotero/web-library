'use strict';

var log = require('../../library/libZoteroJS/src/Log.js').Logger('zotero-web-library:Pages:User');

var React = require('react');
var ReactDOM = require('react-dom');
var ProfileGroupsList = require('../libraryUi/widgets/ProfileGroupsList.js');
var InviteButton = require('../libraryUi/widgets/InviteToGroup.js');

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
			var profileGroupsDiv = document.getElementById('profile-groups-div');
			var userID = profileGroupsDiv.getAttribute('data-userID');

			ReactDOM.render(
				React.createElement(ProfileGroupsList, {'userID': userID}),
				document.getElementById('profile-groups-div')
			);

			ReactDOM.render(
				React.createElement(InviteButton, null),
				document.getElementById('invite-button')
			);
		}
	}
};

module.exports = User;