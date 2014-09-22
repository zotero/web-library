Zotero.ui.widgets.inviteToGroup = {};

Zotero.ui.widgets.inviteToGroup.init = function(el){
    Z.debug("inviteToGroup widget init", 3);
    //var library = Zotero.ui.getAssociatedLibrary(el);
    var groups = new Zotero.Groups();
    if(Zotero.config.loggedIn && Zotero.config.loggedInUserID){
        var groupsPromise = groups.fetchUserGroups(Zotero.config.loggedInUserID, Zotero.config.apiKey)
        .then(function(response){
            Zotero.ui.widgets.inviteToGroup.displayInviteForm(el, response.fetchedGroups);
        }).catch(Zotero.catchPromiseError);
    }
}

Zotero.ui.widgets.inviteToGroup.displayInviteForm = function(el, groups){
    Z.debug("Zotero.ui.widgets.inviteToGroup.displayInviteForm", 3);
    Z.debug(el);
    var jel = J(el);
    jel.empty();
    
    //pull out manageable groups
    var manageGroups = [];
    J.each(groups, function(ind, group){
        Z.debug(group.title);
        var userID = Zotero.config.loggedInUserID;
        var groupManageable = false;
        if(userID && (userID == group.apiObj.owner || (J.inArray(userID, group.apiObj.admins) != -1 ))) {
            Z.debug("manage group");
            manageGroups.push(group);
        }
    });
    
    var tdata = {
        groups: manageGroups,
    };
    Z.debug("rendering form");
    jel.append( J('#inviteuserformTemplate').render(tdata) );
    Z.debug("binding on form");
    jel.find("form.inviteuserform").on('submit', function(evt){
        Z.debug("inviteUserForm submitted");
        evt.preventDefault();
        var form = J(evt.target);
        Z.debug(form);
        var groupID = form.find("#groupID").val();
        var groupName = form.find("option.selected").html();
        Z.debug(groupID);
        Z.debug("posting invitation request");
        J.post("/groups/inviteuser", {ajax:true, groupID:groupID, userID:zoteroData.profileUserID}, function(data){
            Z.debug("got response from inviteuser");
            Zotero.ui.jsNotificationMessage("User has been invited to join " + groupName, 'success');
            if(data == 'true'){
                /*
                J('#invited-user-list').append("<li>" + J("#invite_group > option:selected").html() + "</li>");
                J('#invite_group > option:selected').remove();
                if(J('#invite_group > option').length === 0){
                    J('#invite_group').remove();
                    J('#invite-button').remove();
                }
                */
                Zotero.ui.jsNotificationMessage("User has been invited to join " + groupName, 'success');
            }
        }, "text");
    });
};
