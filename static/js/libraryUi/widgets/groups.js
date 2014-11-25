Zotero.ui.widgets.groups = {};

Zotero.ui.widgets.groups.init = function(el){
    Z.debug("groups widget init", 3);
    //var library = Zotero.ui.getAssociatedLibrary(el);
    var groups = new Zotero.Groups();
    if(Zotero.config.loggedIn && Zotero.config.loggedInUserID){
        Zotero.ui.showSpinner(J(el), 'horizontal');
        var groupsPromise = groups.fetchUserGroups(Zotero.config.loggedInUserID)
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
    var jel = J(el);
    jel.empty();
    if(groups.length == 0){
        jel.append("<p>You are not currently a member of any groups.</p>");
        J("#groups-blurb").removeClass('hidden');
    } else {
        J.each(groups, function(ind, group){
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
    }
};

