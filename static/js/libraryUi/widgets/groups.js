Zotero.ui.widgets.groups = {};

Zotero.ui.widgets.groups.init = function(el){
    Z.debug("groups widget init", 3);
    //var library = Zotero.ui.getAssociatedLibrary(el);
    var groups = new Zotero.Groups();
    if(Zotero.config.loggedIn && Zotero.config.loggedInUserID){
        Zotero.ui.showSpinner(J(el), 'horizontal');
        var groupsPromise = groups.fetchUserGroups(Zotero.config.loggedInUserID, Zotero.config.apiKey)
        .then(function(response){
            var groups = response.fetchedGroups;
            Zotero.ui.widgets.groups.displayGroupNuggets(el, groups);
        }).catch(Zotero.catchPromiseError);
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
    Z.debug(groups);
    var jel = J(el);
    jel.empty();
    J.each(groups, function(ind, group){
        Z.debug("Displaying group nugget");
        var userID = Zotero.config.loggedInUserID;
        var groupManageable = false;
        var memberCount = 1;
        if(group.apiObj.data.members) {
            memberCount += group.apiObj.data.members.length;
        }
        if(group.apiObj.data.admins){
            memberCount += group.apiObj.data.admins.length;
        }
        
        if(userID && (userID == group.apiObj.data.owner || (J.inArray(userID, group.apiObj.data.admins) != -1 ))) {
            groupManageable = true;
        }
        //Z.debug("manageable: " + groupManageable);
        
        var tdata = {
            group:group,
            groupViewUrl:Zotero.url.groupViewUrl(group),
            groupLibraryUrl:Zotero.url.groupLibraryUrl(group),
            groupSettingsUrl:Zotero.url.groupSettingsUrl(group),
            groupLibrarySettingsUrl:Zotero.url.groupLibrarySettingsUrl(group),
            groupMemberSettingsUrl: Zotero.url.groupMemberSettingsUrl(group),
            memberCount:memberCount,
            groupManageable: groupManageable
        };
        jel.append( J('#groupnuggetTemplate').render(tdata) );
    });
};

