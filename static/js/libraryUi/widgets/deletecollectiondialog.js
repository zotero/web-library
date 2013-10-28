Zotero.ui.widgets.deleteCollectionDialog = {};

Zotero.ui.widgets.deleteCollectionDialog.init = function(el){
    Z.debug("deletecollectionsdialog widget init", 3);
    Zotero.ui.eventful.listen("deleteCollection", Zotero.ui.widgets.deleteCollectionDialog.show, {widgetEl: el});
};

Zotero.ui.widgets.deleteCollectionDialog.show = function(e){
    Z.debug("deleteCollectionDialog.show", 3);
    
    var triggeringEl = J(e.triggeringElement);
    var library = Zotero.ui.getAssociatedLibrary(triggeringEl);
    var currentCollectionKey = Zotero.nav.getUrlVar('collectionKey');
    var currentCollection = library.collections.getCollection(currentCollectionKey);
    
    var widgetEl = J(e.data['widgetEl']).empty();
    widgetEl.html( J("#deletecollectiondialogTemplate").render({collection:currentCollection}) );
    var dialogEl = widgetEl.find(".delete-collection-dialog");
    
    var deleteFunction = J.proxy(function(){
        Z.debug("Zotero.ui.deleteSelectedCollection", 3);
        var collection = currentCollection;
        if(!collection){
            Zotero.ui.jsNotificationMessage("Selected collection not found", 'error');
            return false;
        }
        var d = collection.remove();
        d.done(J.proxy(function(){
            delete Zotero.nav.urlvars.pathVars['collectionKey'];
            library.collections.dirty = true;
            Zotero.nav.pushState();
            Zotero.ui.jsNotificationMessage(collection.title + " removed", 'confirm');
        }, this));
        
        Zotero.ui.closeDialog(dialogEl);
        return false;
    }, this);
    
    dialogEl.find(".deleteButton").on('click', deleteFunction);
    Zotero.ui.dialog(dialogEl, {});
    
    return false;
};

