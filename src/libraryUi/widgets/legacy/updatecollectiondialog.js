Zotero.ui.widgets.updateCollectionDialog = {};

Zotero.ui.widgets.updateCollectionDialog.init = function(el){
    Z.debug("updatecollectionsdialog widget init", 3);
    var library = Zotero.ui.getAssociatedLibrary(el);
    
    library.listen("updateCollectionDialog", Zotero.ui.widgets.updateCollectionDialog.show, {widgetEl: el});
};

Zotero.ui.widgets.updateCollectionDialog.show = function(evt){
    Z.debug("updateCollectionDialog.show", 3);
    
    var triggeringEl = J(evt.triggeringElement);
    var library = Zotero.ui.getAssociatedLibrary(triggeringEl);
    var ncollections = library.collections.nestedOrderingArray();
    
    var widgetEl = J(evt.data.widgetEl).empty();
    
    widgetEl.html( J("#updatecollectiondialogTemplate").render({ncollections:ncollections}) );
    var dialogEl = widgetEl.find(".update-collection-dialog");
    
    var currentCollectionKey = Zotero.state.getUrlVar('collectionKey');
    var currentCollection = library.collections.getCollection(currentCollectionKey);
    var currentParentCollectionKey = currentCollection.parentCollection;
    dialogEl.find(".update-collection-parent-select").val(currentParentCollectionKey);
    dialogEl.find(".updated-collection-title-input").val(currentCollection.get("title"));
    
    var saveFunction = function(){
        var newCollectionTitle = dialogEl.find("input.updated-collection-title-input").val() || "Untitled";
        var newParentCollectionKey = dialogEl.find(".update-collection-parent-select").val();
        
        var collection =  currentCollection;
        if(!collection){
            Zotero.ui.jsNotificationMessage("Selected collection not found", 'error');
            return false;
        }
        collection.update(newCollectionTitle, newParentCollectionKey)
        .then(function(response){
            Zotero.ui.jsNotificationMessage("Collection Saved", 'confirm');
            library.collections.dirty = true;
            library.collections.initSecondaryData();
            library.trigger('libraryCollectionsUpdated');
            Zotero.state.pushState(true);
            Zotero.ui.closeDialog(dialogEl);
        }).catch(Zotero.catchPromiseError);
    };
    
    dialogEl.find(".updateButton").on('click', saveFunction);
    Zotero.ui.dialog(dialogEl,{});
    dialogEl.find(".updated-collection-title-input").select();
    
    return false;
};

