Zotero.ui.widgets.controlPanel = {};

Zotero.ui.widgets.controlPanel.init = function(el){
    Z.debug("Zotero.eventful.init.controlPanel", 3);
    Zotero.ui.showControlPanel(el);
    Zotero.ui.eventful.listen("controlPanelContextChange selectedItemsChanged", Zotero.ui.updateDisabledControlButtons);
    Zotero.ui.eventful.listen("selectedCollectionChanged", Zotero.ui.updateCollectionButtons);
    
    Zotero.ui.eventful.listen("removeFromCollection", Zotero.ui.callbacks.removeFromCollection);
    Zotero.ui.eventful.listen("moveToTrash", Zotero.ui.callbacks.moveToTrash);
    Zotero.ui.eventful.listen("removeFromTrash", Zotero.ui.callbacks.removeFromTrash);
    Zotero.ui.eventful.listen("toggleEdit", Zotero.ui.callbacks.toggleEdit);
    Zotero.ui.eventful.listen('clearLibraryQuery', Zotero.ui.clearLibraryQuery);
    
    var container = J(el);
    //set initial state of search input to url value
    if(Zotero.nav.getUrlVar('q')){
        container.find("#header-search-query").val(Zotero.nav.getUrlVar('q'));
    }
    
    //clear libary query param when field cleared
    var context = 'support';
    if(undefined !== window.zoterojsSearchContext){
        context = zoterojsSearchContext;
    }
    
    //set up search type links
    container.on('click', ".library-search-type-link", function(e){
        e.preventDefault();
        var typeLinks = J(".library-search-type-link").removeClass('selected');
        var selected = J(e.target);
        var selectedType = selected.data('searchtype');
        var searchInput = J("#header-search-query").data('searchtype', selectedType);
        selected.addClass('selected');
        if(selectedType == 'simple'){
            searchInput.attr('placeholder', 'Search Title, Creator, Year');
        }
        else if(selectedType == 'everything'){
            searchInput.attr('placeholder', 'Search Full Text');
        }
    });
    
    //set up search submit for library
    container.on('submit', "#library-search", function(e){
        e.preventDefault();
        Zotero.nav.clearUrlVars(['collectionKey', 'tag', 'q', 'qmode']);
        var query     = J("#header-search-query").val();
        var searchType = J("#header-search-query").data('searchtype');
        if(query !== "" || Zotero.nav.getUrlVar('q') ){
            Zotero.nav.urlvars.pathVars['q'] = query;
            if(searchType != "simple"){
                Zotero.nav.urlvars.pathVars['qmode'] = searchType;
            }
            Zotero.nav.pushState();
        }
        return false;
    });
    
    container.on('click', '.clear-field-button', function(e){
        J("#header-search-query").val("").focus();
    });
    
};

Zotero.ui.widgets.controlPanel.updateDisabledControlButtons = function(){
    Zotero.ui.updateDisabledControlButtons();
};

Zotero.ui.clearLibraryQuery = function(){
    Zotero.nav.unsetUrlVar('q');
    Zotero.nav.unsetUrlVar('qmode');
    
    J("#header-search-query").val("");
    Zotero.nav.pushState();
    return;
}

/**
 * Update the disabled state of library control toolbar buttons depending on context
 * @return {undefined}
 */
Zotero.ui.updateDisabledControlButtons = function(){
    Z.debug("Zotero.ui.updateDisabledControlButtons", 3);
    J(".move-to-trash-button").prop('title', 'Move to Trash');
    
    J(".create-item-button").removeClass('disabled');
    if((J(".itemlist-editmode-checkbox:checked").length === 0) && (!Zotero.nav.getUrlVar('itemKey')) ){
        //then there are 0 items selected by checkbox and no item details are being displayed
        //disable all buttons that require an item to operate on
        J(".add-to-collection-button").addClass('disabled');
        J(".remove-from-collection-button").addClass('disabled');
        J(".move-to-trash-button").addClass('disabled');
        J(".remove-from-trash-button").addClass('disable');
        
        J(".cite-button").addClass('disabled');
        J(".export-button").addClass('disabled'); //TODO: should this really be disabled? not just export everything?
    }
    else{
        //something is selected for actions to apply to
        J(".add-to-collection-button").removeClass('disabled');
        J(".remove-from-collection-button").removeClass('disabled');
        J(".move-to-trash-button").removeClass('disabled');
        if(Zotero.nav.getUrlVar('collectionKey') == 'trash'){
            J(".remove-from-trash-button").removeClass('disabled');
        }
        J(".cite-button").removeClass('disabled');
        J(".export-button").removeClass('disabled');
    }
    //only show remove from collection button if inside a collection
    if(!Zotero.nav.getUrlVar("collectionKey")){
        J(".remove-from-collection-button").addClass('disabled');
    }
    //disable create item button if in trash
    else if(Zotero.nav.getUrlVar('collectionKey') == 'trash'){
        J(".create-item-button").addClass('disabled');
        J(".add-to-collection-button").addClass('disabled');
        J(".remove-from-collection-button").addClass('disabled');
        J(".move-to-trash-button").prop('title', 'Permanently Delete');
    }
    Zotero.ui.init.editButton();
};

Zotero.ui.widgets.controlPanel.createItemDropdown = function(el){
    Z.debug("Zotero.eventful.init.createItemDropdown", 3);
    //order itemTypes
    var itemTypes = [];
    J.each(Zotero.Item.prototype.typeMap, function(key, val){
        itemTypes.push(key);
    });
    itemTypes.sort();
    //render dropdown into widget
    menuEl = J(el).find(".createitemmenu.dropdown-menu");
    menuEl.empty();
    menuEl.replaceWith( J(el).find("#newitemdropdownTemplate").render({itemTypes:itemTypes}) );
};

/**
 * Toggle library edit mode when edit button clicked
 * @param  {event} e click event
 * @return {boolean}
 */
Zotero.ui.callbacks.toggleEdit =  function(e){
    Z.debug("edit checkbox toggled", 3);
    var curMode = Zotero.nav.getUrlVar('mode');
    if(curMode != "edit"){
        Zotero.nav.urlvars.pathVars['mode'] = 'edit';
    }
    else{
        delete Zotero.nav.urlvars.pathVars['mode'];
    }
    Zotero.nav.pushState();
    return false;
};

/**
 * clear path vars and send to new item page with current collection when create-item-link clicked
 * @param  {event} e click event
 * @return {boolean}
 */
Zotero.ui.callbacks.createItem = function(e){
    Z.debug("create-item-Link clicked", 3);
    var collectionKey = Zotero.nav.getUrlVar('collectionKey');
    if(collectionKey){
        Zotero.nav.urlvars.pathVars = {action:'newItem', mode:'edit', 'collectionKey':collectionKey};
    }
    else{
        Zotero.nav.urlvars.pathVars = {action:'newItem', mode:'edit'};
    }
    Zotero.nav.pushState();
    return false;
};

/**
 * Move currently displayed single item or currently checked list of items
 * to the trash when move-to-trash link clicked
 * @param  {event} e click event
 * @return {boolean}
 */
Zotero.ui.callbacks.moveToTrash =  function(e){
    e.preventDefault();
    Z.debug('move-to-trash clicked', 3);
    
    var itemKeys = Zotero.ui.getSelectedItemKeys(J("#edit-mode-items-form"));
    Z.debug(itemKeys, 3);
    
    var library = Zotero.ui.getAssociatedLibrary(J(this).closest('div.ajaxload'));
    var response;
    
    var trashingItems = library.items.getItems(itemKeys);
    var deletingItems = []; //potentially deleting instead of trashing
    
    //show spinner before making the possibly many the ajax requests
    Zotero.ui.showSpinner(J('#library-items-div'));
    
    if(Zotero.nav.getUrlVar('collectionKey') == 'trash'){
        //items already in trash. delete them
        var i;
        for(i = 0; i < trashingItems.length; i++ ){
            var item = trashingItems[i];
            if(item.get('deleted')){
                //item is already in trash, schedule for actual deletion
                deletingItems.push(item);
            }
        }
        
        //make request to permanently delete items
        response = library.items.deleteItems(deletingItems);
    }
    else{
        //items are not in trash already so just add them to it
        response = library.items.trashItems(trashingItems);
    }
    
    library.dirty = true;
    response.always(function(){
        Zotero.nav.clearUrlVars(['collectionKey', 'tag', 'q']);
        Zotero.nav.pushState(true);
    });
    
    return false; //stop event bubbling
};

/**
 * Remove currently displayed single item or checked list of items from trash
 * when remove-from-trash link clicked
 * @param  {event} e click event
 * @return {boolean}
 */
Zotero.ui.callbacks.removeFromTrash =  function(e){
    Z.debug('remove-from-trash clicked', 3);
    var itemKeys = Zotero.ui.getSelectedItemKeys(J("#edit-mode-items-form"));
    Z.debug(itemKeys, 4);
    
    var library = Zotero.ui.getAssociatedLibrary(J(this).closest('div.ajaxload'));
    
    var untrashingItems = library.items.getItems(itemKeys);
    
    //show spinner before making the possibly many the ajax requests
    Zotero.ui.showSpinner(J('#library-items-div'));
    
    var response = library.items.untrashItems(untrashingItems);
    
    library.dirty = true;
    response.always(function(){
        Zotero.nav.clearUrlVars(['collectionKey', 'tag', 'q']);
        Zotero.nav.pushState(true);
    });
    
    return false;
};

/**
 * Remove currently displaying item or currently selected items from current collection
 * @param  {event} e click event
 * @return {boolean}
 */
Zotero.ui.callbacks.removeFromCollection = function(e){
    Z.debug('remove-from-collection clicked', 3);
    var itemKeys = Zotero.ui.getSelectedItemKeys(J("#edit-mode-items-form"));
    var library = Zotero.ui.getAssociatedLibrary(J(this).closest('div.ajaxload'));
    var collectionKey = Zotero.nav.getUrlVar('collectionKey');
    
    var modifiedItems = [];
    var responses = [];
    J.each(itemKeys, function(index, itemKey){
        var item = library.items.getItem(itemKey);
        item.removeFromCollection(collectionKey);
        modifiedItems.push(item);
    });
    
    var itemWriteDeferred = library.items.writeItems(modifiedItems);
    library.dirty = true;
    
    itemWriteDeferred.then(function(){
        Z.debug('removal responses finished. forcing reload', 3);
        Zotero.nav.clearUrlVars(['collectionKey', 'tag']);
        Zotero.nav.pushState(true);
        Zotero.ui.eventful.trigger("displayedItemsChanged");
    });
    
    return false;
};

/**
 * Conditionally show the control panel
 * @param  {Dom El} el control panel element
 * @return {undefined}
 */
Zotero.ui.showControlPanel = function(el){
    Z.debug("Zotero.ui.showControlPanel", 3);
    var jel = J(el);
    var mode = Zotero.nav.getUrlVar('mode') || 'view';
    
    if(Zotero.config.librarySettings.allowEdit === 0){
        J(".permission-edit").hide();
        J("#control-panel").hide();
    }
};
