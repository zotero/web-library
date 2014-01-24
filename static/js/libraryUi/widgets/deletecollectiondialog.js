Zotero.ui.widgets.deleteCollectionDialog = {};

Zotero.ui.widgets.deleteCollectionDialog.init = function(el){
    Z.debug("deletecollectionsdialog widget init", 3);
    var library = Zotero.ui.getAssociatedLibrary(el);
    
    library.listen("deleteCollectionDialog", Zotero.ui.widgets.deleteCollectionDialog.show, {widgetEl: el});
};

Zotero.ui.widgets.deleteCollectionDialog.show = function(evt){
    Z.debug("deleteCollectionDialog.show", 3);
    
    var triggeringEl = J(evt.triggeringElement);
    var library = Zotero.ui.getAssociatedLibrary(triggeringEl);
    var currentCollectionKey = Zotero.state.getUrlVar('collectionKey');
    var currentCollection = library.collections.getCollection(currentCollectionKey);
    
    var widgetEl = J(evt.data.widgetEl).empty();
    widgetEl.html( J("#deletecollectiondialogTemplate").render({collection:currentCollection}) );
    var dialogEl = widgetEl.find(".delete-collection-dialog");
    
    var deleteFunction = J.proxy(function(){
        Z.debug("Zotero.ui.deleteSelectedCollection", 3);
        var collection = currentCollection;
        if(!collection){
            Zotero.ui.jsNotificationMessage("Selected collection not found", 'error');
            return false;
        }
        collection.remove()
        .then(function(){
            delete Zotero.state.pathVars['collectionKey'];
            library.collections.dirty = true;
            library.collections.initSecondaryData();
            Zotero.state.pushState();
            Zotero.ui.jsNotificationMessage(collection.title + " removed", 'confirm');
            Zotero.ui.closeDialog(dialogEl);
        });
        return false;
    }, this);
    
    dialogEl.find(".deleteButton").on('click', deleteFunction);
    Zotero.ui.dialog(dialogEl, {});
    
    return false;
};

