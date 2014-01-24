Zotero.ui.widgets.addToCollectionDialog = {};

Zotero.ui.widgets.addToCollectionDialog.init = function(el){
    Z.debug("addtocollectionsdialog widget init", 3);
    var library = Zotero.ui.getAssociatedLibrary(el);
    
    library.listen("addToCollectionDialog", Zotero.ui.widgets.addToCollectionDialog.show, {widgetEl: el});
};

Zotero.ui.widgets.addToCollectionDialog.show = function(evt){
    Z.debug("addToCollectionDialog.show", 3);
    
    var triggeringEl = J(evt.triggeringElement);
    var library = Zotero.ui.getAssociatedLibrary(triggeringEl);
    var ncollections = library.collections.nestedOrderingArray();
    
    var widgetEl = J(evt.data.widgetEl).empty();
    widgetEl.html( J("#addtocollectiondialogTemplate").render({ncollections:ncollections}) );
    var dialogEl = widgetEl.find(".add-to-collection-dialog");
    
    var addToFunction = function(){
        Z.debug("addToCollection callback", 3);
        var targetCollection = dialogEl.find(".collectionKey-select").val();
        Z.debug("move to: " + targetCollection, 4);
        Zotero.ui.addToCollection(targetCollection, library);
        Zotero.ui.closeDialog(dialogEl);
        return false;
    };
    
    dialogEl.find(".addButton").on('click', addToFunction);
    
    Zotero.ui.dialog(dialogEl, {});
    return false;
};

/**
 * Add selected items to collection
 * @param {string} collectionKey collectionKey of collection items will be added to
 * @param {Zotero_Library} library       Zotero library to operate on
 */
Zotero.ui.addToCollection = function(collectionKey, library){
    Z.debug("add-to-collection clicked", 3);
    var itemKeys = Zotero.state.getSelectedItemKeys();
    if(!collectionKey){
        Zotero.ui.jsNotificationMessage("No collection selected", 'error');
        return false;
    }
    if(itemKeys.length === 0){
        Zotero.ui.jsNotificationMessage("No items selected", 'notice');
        return false;
    }
    Z.debug(itemKeys, 4);
    Z.debug(collectionKey, 4);
    library.collections.getCollection(collectionKey).addItems(itemKeys)
    .then(function(response){
        library.dirty = true;
        Zotero.ui.jsNotificationMessage("Items added to collection", 'success');
    });
    return false;
};
