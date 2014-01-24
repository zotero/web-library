Zotero.ui.widgets.groupsList = {};

Zotero.ui.widgets.groupsList.init = function(el){
    Z.debug("groupsList widget init", 3);
    var library = Zotero.ui.getAssociatedLibrary(el);
    
    library.listen("refreshGroups", Zotero.ui.widgets.groupsList.refresh, {widgetEl: el});
    library.listen("sendToGroup", Zotero.ui.widgets.groupsList.sendToGroup, {widgetEl: el});
    
    library.trigger("refreshGroups");
};

Zotero.ui.widgets.groupsList.refresh = function(evt){
    Zotero.debug("Zotero.ui.widgets.groupsList.refresh", 3);
    var widgetEl = evt.data.widgetEl;
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

Zotero.ui.widgets.groupsList.sendToGroup = function(evt){
    Zotero.debug("Zotero.ui.widgets.groupsList.sendToGroup", 3);
    var widgetEl = evt.data.widgetEl;
    var library = Zotero.ui.getAssociatedLibrary(widgetEl);
    
};
