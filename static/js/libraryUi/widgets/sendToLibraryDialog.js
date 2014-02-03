Zotero.ui.widgets.sendToLibraryDialog = {};

Zotero.ui.widgets.sendToLibraryDialog.init = function(el){
    Z.debug("sendToLibraryDialog widget init", 3);
    var library = Zotero.ui.getAssociatedLibrary(el);
    
    library.listen("sendToLibraryDialog", Zotero.ui.widgets.sendToLibraryDialog.show, {widgetEl: el});
    
};

Zotero.ui.widgets.sendToLibraryDialog.show = function(evt){
    Zotero.debug("Zotero.ui.widgets.sendToLibraryDialog.show", 3);
    var widgetEl = J(evt.data.widgetEl);
    var library = Zotero.ui.getAssociatedLibrary(widgetEl);
    if(!Zotero.config.loggedIn){
        throw new Error("no logged in userID. Required for groupsList widget");
    }
    var userID = Zotero.config.loggedInUserID;
    var personalLibraryString = 'u' + userID;
    
    var memberGroups = library.groups.fetchUserGroups(userID)
    .then(function(memberGroups){
        Z.debug("got member groups");
        var writableLibraries = [{name:'My Library', libraryString:personalLibraryString}];
        for(var i = 0; i < memberGroups.length; i++){
            if(memberGroups[i].isWritable(userID)){
                var libraryString = 'g' + memberGroups[i].groupID;
                writableLibraries.push({
                    name: memberGroups[i].apiObj.name,
                    libraryString: libraryString,
                });
            }
        }
        widgetEl.html( J("#sendToLibraryDialogTemplate").render({destinationLibraries: writableLibraries}) );
        var dialogEl = widgetEl.find(".send-to-library-dialog");
        
        var sendFunction = function(){
            Z.debug("sendToLibrary callback", 3);
            //instantiate destination library
            var targetLibrary = dialogEl.find(".destination-library-select").val();
            Z.debug("move to: " + targetLibrary, 3);
            var destLibConfig = Zotero.utils.parseLibString(targetLibrary);
            destLibrary = new Zotero.Library(destLibConfig.libraryType, destLibConfig.libraryID);
            Zotero.libraries[targetLibrary] = destLibrary;
            
            //get items to send
            var itemKeys = Zotero.state.getSelectedItemKeys();
            if(itemKeys.length === 0){
                Zotero.ui.jsNotificationMessage("No items selected", 'notice');
                Zotero.ui.closeDialog(dialogEl);
                return false;
            }
            
            var sendItems = library.items.getItems(itemKeys);
            library.sendToLibrary(sendItems, destLibrary)
            .then(function(foreignItems){
                Zotero.ui.jsNotificationMessage("Items sent to other library", 'notice');
            }).catch(function(response){
                Z.debug(response);
                Zotero.ui.jsNotificationMessage("Error sending items to other library", 'notice');
            });
            Zotero.ui.closeDialog(dialogEl);
            return false;
        };
        
        dialogEl.find(".sendButton").on('click', sendFunction);
        
        Zotero.ui.dialog(dialogEl, {});
        
    }).catch(function(err){
        Z.debug(err);
        Z.debug(err.message);
    });
    
};
/*
Zotero.ui.widgets.sendToLibraryDialog.render = function(el, groups){
    J(el).empty().append( J("#groupslistTemplate").render({groups:groups}));
};

Zotero.ui.widgets.sendToLibraryDialog.send = function(evt){
    Zotero.debug("Zotero.ui.widgets.groupsList.sendToGroup", 3);
    var widgetEl = evt.data.widgetEl;
    var library = Zotero.ui.getAssociatedLibrary(widgetEl);
    
};
*/