
/**
 * Callback that will initialize an item save based on new values in an item edit form
 * @param  {event} e DOM Event triggering callback
 * @return {boolean}
 */
Zotero.ui.saveItemCallback = function(e){
    Z.debug("saveitemlink clicked", 3);
    e.preventDefault();
    Zotero.ui.scrollToTop();
    var library = Zotero.ui.getAssociatedLibrary(J(this).closest(".ajaxload"));
    //get our current representation of the item
    var itemKey = J(this).attr('data-itemKey');
    var item;
    if(itemKey){
        item = library.items.getItem(itemKey);
        Z.debug("itemKey " + itemKey + ' : ', 3);
    }
    else{
        item = J("#item-details-div").data('newitem');
        Z.debug("newItem : itemTemplate selected from form", 3);
        Z.debug(item, 3);
    }
    Zotero.ui.updateItemFromForm(item, J(this).closest("form"));
    Zotero.ui.saveItem(item, J(this).closest("form"));
    library.dirty = true;
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
    //var library = Zotero.ui.getAssociatedLibrary(J(this).closest('div.ajaxload'));
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
    Z.debug(library.collections[collectionKey], 4);
    var response = library.collections[collectionKey].addItems(itemKeys);
    library.dirty = true;
    J.when(response).then(function(){
        //Zotero.nav.forceReload = true;//delete Zotero.nav.urlvars.pathVars['mode'];
        Zotero.nav.pushState(true);
    });
    return false;
};
