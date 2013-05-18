Zotero.ui.widgets.addToCollectionDialog = {};

Zotero.ui.widgets.addToCollectionDialog.init = function(el){
    Z.debug("addtocollectionsdialog widget init", 3);
    Zotero.ui.eventful.listen("addToCollection", Zotero.ui.widgets.addToCollectionDialog.show, {widgetEl: el});
};

Zotero.ui.widgets.addToCollectionDialog.show = function(e){
    Z.debug("addToCollectionDialog.show", 3);
    
    var triggeringEl = J(e.triggeringElement);
    var library = Zotero.ui.getAssociatedLibrary(triggeringEl);
    var ncollections = library.collections.nestedOrderingArray();
    
    var widgetEl = J(e.data['widgetEl']).empty();
    J("#addtocollectiondialogTemplate").tmpl({ncollections:ncollections}).appendTo(widgetEl);
    var dialogEl = widgetEl.find(".add-to-collection-dialog");
    
    var addToFunction = J.proxy(function(){
        Z.debug("add-to-collection-select changed", 3);
        var targetCollection = dialogEl.find(".target-collection").val();
        Z.debug("move to: " + targetCollection, 4);
        Zotero.ui.addToCollection(targetCollection, library);
        Zotero.ui.closeDialog(dialogEl);
        return false;
    }, this);
    
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
    var itemKeys = Zotero.ui.getSelectedItemKeys(J("#edit-mode-items-form"));
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
    var response = library.collections.getCollection(collectionKey).addItems(itemKeys);
    library.dirty = true;
    J.when(response).then(function(){
        Zotero.nav.pushState(true);
    });
    return false;
};
