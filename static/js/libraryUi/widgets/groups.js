Zotero.ui.widgets.groups = {};

Zotero.ui.widgets.groups.init = function(el){
    Z.debug("groups widget init", 3);
    //var library = Zotero.ui.getAssociatedLibrary(el);
    var groups = new Zotero.Groups();
    if(Zotero.config.loggedIn && Zotero.config.loggedInUserID){
        var groupsPromise = groups.fetchUserGroups(Zotero.config.loggedInUserID, Zotero.config.apiKey)
        .then(function(groups){
            Zotero.ui.widgets.groups.displayGroupNuggets(el, groups);
        });
    }
}

Zotero.ui.widgets.groups.userGroupsDisplay = function(groups){
    var html = '';
    J.each(groups.groupsArray, function(index, group){
        html += Zotero.ui.groupNugget(group);
    });
    return html;
};

Zotero.ui.widgets.groups.displayGroupNuggets = function(el, groups){
    Z.debug("Zotero.ui.widgets.groups.displayGroupNuggets", 3);
    var jel = J(el);
    jel.empty();
    J.each(groups, function(ind, group){
        Z.debug("Displaying group nugget");
        var userID = Zotero.config.loggedInUserID;
        var groupManageable = false;
        var memberCount = 1;
        if(group.apiObj.members) {
            memberCount += group.apiObj.members.length;
        }
        if(group.apiObj.admins){
            memberCount += group.apiObj.admins.length;
        }
        
        //Z.debug("UserID:" + userID);
        //Z.debug("user is group owner: " + (userID == group.apiObj.owner) );
        //Z.debug("User in admins: " + (J.inArray(userID, group.apiObj.admins)));
        if(userID && (userID == group.apiObj.owner || (J.inArray(userID, group.apiObj.admins) != -1 ))) {
            groupManageable = true;
        }
        //Z.debug("manageable: " + groupManageable);
        
        var tdata = {
            group:group.apiObj,
            groupViewUrl:Zotero.url.groupViewUrl(group),
            groupLibraryUrl:Zotero.url.groupLibraryUrl(group),
            groupSettingsUrl:Zotero.url.groupSettingsUrl(group),
            groupLibrarySettings:Zotero.url.groupLibrarySettingsUrl(group),
            memberCount:memberCount,
            groupManageable: groupManageable
        };
        jel.append( J('#groupnuggetTemplate').render(tdata) );
    });
};

