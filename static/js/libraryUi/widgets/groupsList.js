Zotero.ui.widgets.groupsList = {};

Zotero.ui.widgets.groupsList.init = function(el){
    Z.debug("groupsList widget init", 3);
    
    Zotero.ui.eventful.listen("refreshGroups", Zotero.ui.widgets.groupsList.refresh, {widgetEl: el});
    Zotero.ui.eventful.listen("sendToGroup", Zotero.ui.widgets.groupsList.sendToGroup, {widgetEl: el});
    
    Zotero.ui.eventful.trigger("refreshGroups");
};

Zotero.ui.widgets.groupsList.refresh = function(e){
    Zotero.debug("Zotero.ui.widgets.groupsList.refresh", 3);
    var widgetEl = e.data.widgetEl;
    var library = Zotero.ui.getAssociatedLibrary(widgetEl);
    if(!zoteroData['loggedInUserID']){
        throw new Error("no logged in userID. Required for groupsList widget");
    }
    var memberGroups = library.groups.fetchUserGroups(zoteroData['loggedInUserID'])
    .then(function(memberGroups){
        Zotero.ui.widgets.groupsList.render(widgetEl, memberGroups);
    });
    
};

Zotero.ui.widgets.groupsList.render = function(el, groups){
    J(el).empty().append( J("#groupslistTemplate").render({groups:groups}));
};

Zotero.ui.widgets.groupsList.sendToGroup = function(e){
    
};
