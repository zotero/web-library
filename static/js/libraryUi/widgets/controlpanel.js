Zotero.ui.widgets.controlPanel = {};

Zotero.ui.widgets.controlPanel.init = function(el){
    Z.debug("Zotero.eventful.init.controlPanel", 3);
    var library = Zotero.ui.getAssociatedLibrary(el);
    
    Zotero.ui.showControlPanel(el);
    //library.listen("controlPanelContextChange", Zotero.ui.widgets.controlPanel.contextChanged, {widgetEl:el});
    library.listen("selectedItemsChanged", Zotero.ui.widgets.controlPanel.selectedItemsChanged, {widgetEl:el});
    
    library.listen("removeFromCollection", Zotero.ui.widgets.controlPanel.removeFromCollection, {widgetEl:el});
    library.listen("moveToTrash", Zotero.ui.widgets.controlPanel.moveToTrash), {widgetEl:el};
    library.listen("removeFromTrash", Zotero.ui.widgets.controlPanel.removeFromTrash, {widgetEl:el});
    library.listen("toggleEdit", Zotero.ui.widgets.controlPanel.toggleEdit, {widgetEl:el});
    
    var container = J(el);
    
    Zotero.ui.widgets.controlPanel.updateDisabledControlButtons();
    //start edit button in correct state
    if(Zotero.state.getUrlVar('mode') == 'edit'){
        container.find('button.toggle-edit-button').addClass('active');
    }
};

Zotero.ui.widgets.controlPanel.contextChanged = function(evt){
    Zotero.ui.widgets.controlPanel.updateDisabledControlButtons();
};

Zotero.ui.widgets.controlPanel.selectedItemsChanged = function(evt){
    Z.debug("Zotero.ui.widgets.controlPanel.selectedItemsChanged", 3);
    var selectedItemKeys = evt.selectedItemKeys;
    if(!selectedItemKeys){
        selectedItemKeys = [];
    }
        
    Zotero.ui.widgets.controlPanel.updateDisabledControlButtons(selectedItemKeys);
};

/**
 * Update the disabled state of library control toolbar buttons depending on context
 * @return {undefined}
 */
Zotero.ui.widgets.controlPanel.updateDisabledControlButtons = function(selectedItemKeys){
    Z.debug("Zotero.ui.widgets.controlPanel.updateDisabledControlButtons", 3);
    if(!selectedItemKeys){
        selectedItemKeys = [];
    }
    
    J(".move-to-trash-button").prop('title', 'Move to Trash');
    
    J(".create-item-button").removeClass('disabled');
    if((selectedItemKeys.length === 0) && (!Zotero.state.getUrlVar('itemKey')) ){
        //then there are 0 items selected by checkbox and no item details are being displayed
        //disable all buttons that require an item to operate on
        J(".add-to-collection-button").addClass('disabled');
        J(".remove-from-collection-button").addClass('disabled');
        J(".move-to-trash-button").addClass('disabled');
        J(".remove-from-trash-button").addClass('disabled');
        
        J(".cite-button").addClass('disabled');
        J(".export-button").addClass('disabled'); //TODO: should this really be disabled? not just export everything?
    }
    else{
        //something is selected for actions to apply to
        J(".add-to-collection-button").removeClass('disabled');
        J(".remove-from-collection-button").removeClass('disabled');
        J(".move-to-trash-button").removeClass('disabled');
        if(Zotero.state.getUrlVar('collectionKey') == 'trash'){
            J(".remove-from-trash-button").removeClass('disabled');
        }
        J(".cite-button").removeClass('disabled');
        J(".export-button").removeClass('disabled');
    }
    //only show remove from collection button if inside a collection
    if(!Zotero.state.getUrlVar("collectionKey")){
        J(".remove-from-collection-button").addClass('disabled');
    }
    //disable create item button if in trash
    else if(Zotero.state.getUrlVar('collectionKey') == 'trash'){
        J(".create-item-button").addClass('disabled');
        J(".add-to-collection-button").addClass('disabled');
        J(".remove-from-collection-button").addClass('disabled');
        J(".move-to-trash-button").prop('title', 'Permanently Delete');
    }
};

/**
 * Toggle library edit mode when edit button clicked
 * @param  {event} e click event
 * @return {boolean}
 */
Zotero.ui.widgets.controlPanel.toggleEdit =  function(e){
    Z.debug("edit checkbox toggled", 3);
    var curMode = Zotero.state.getUrlVar('mode');
    if(curMode != "edit"){
        Zotero.state.pathVars['mode'] = 'edit';
    }
    else{
        delete Zotero.state.pathVars['mode'];
    }
    Zotero.state.pushState();
    return false;
};

/**
 * clear path vars and send to new item page with current collection when create-item-link clicked
 * @param  {event} e click event
 * @return {boolean}
 */
Zotero.ui.widgets.controlPanel.createItem = function(e){
    Z.debug("create-item-Link clicked", 3);
    var collectionKey = Zotero.state.getUrlVar('collectionKey');
    if(collectionKey){
        Zotero.state.pathVars = {action:'newItem', mode:'edit', 'collectionKey':collectionKey};
    }
    else{
        Zotero.state.pathVars = {action:'newItem', mode:'edit'};
    }
    Zotero.state.pushState();
    return false;
};

/**
 * Move currently displayed single item or currently checked list of items
 * to the trash when move-to-trash link clicked
 * @param  {event} e click event
 * @return {boolean}
 */
Zotero.ui.widgets.controlPanel.moveToTrash =  function(evt){
    evt.preventDefault();
    Z.debug('move-to-trash clicked', 3);
    
    var itemKeys = Zotero.state.getSelectedItemKeys();
    Z.debug(itemKeys, 3);
    
    var triggeringEl = J(evt.triggeringElement);
    var library = Zotero.ui.getAssociatedLibrary(triggeringEl);
    var response;
    
    var trashingItems = library.items.getItems(itemKeys);
    var deletingItems = []; //potentially deleting instead of trashing
    
    //show spinner before making the possibly many the ajax requests
    Zotero.ui.showSpinner(J('#library-items-div'));
    Z.debug('trashingItems:');
    Z.debug(trashingItems);
    if(Zotero.state.getUrlVar('collectionKey') == 'trash'){
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
    response.catch(function(){
        Z.error("Error trashing items");
    }).then(function(){
        Zotero.state.clearUrlVars(['collectionKey', 'tag', 'q']);
        Zotero.state.pushState(true);
        library.trigger("displayedItemsChanged");
    }).catch(Zotero.catchPromiseError);
    
    return false; //stop event bubbling
};

/**
 * Remove currently displayed single item or checked list of items from trash
 * when remove-from-trash link clicked
 * @param  {event} e click event
 * @return {boolean}
 */
Zotero.ui.widgets.controlPanel.removeFromTrash =  function(evt){
    Z.debug('remove-from-trash clicked', 3);
    var widgetEl = J(evt.data.widgetEl);
    var itemKeys = Zotero.state.getSelectedItemKeys();
    Z.debug(itemKeys, 4);
    
    var triggeringEl = J(evt.triggeringElement);
    var library = Zotero.ui.getAssociatedLibrary(triggeringEl);
    
    var untrashingItems = library.items.getItems(itemKeys);
    
    //show spinner before making the possibly many the ajax requests
    Zotero.ui.showSpinner(J('#library-items-div'));
    
    var response = library.items.untrashItems(untrashingItems);
    
    library.dirty = true;
    response.catch(function(){
        
    }).then(function(){
        Z.debug("post-removeFromTrash always execute: clearUrlVars", 3);
        Zotero.state.clearUrlVars(['collectionKey', 'tag', 'q']);
        Zotero.state.pushState();
        library.trigger("displayedItemsChanged");
    }).catch(Zotero.catchPromiseError);
    
    return false;
};

/**
 * Remove currently displaying item or currently selected items from current collection
 * @param  {event} e click event
 * @return {boolean}
 */
Zotero.ui.widgets.controlPanel.removeFromCollection = function(evt){
    Z.debug('remove-from-collection clicked', 3);
    var triggeringEl = J(evt.triggeringElement);
    var library = Zotero.ui.getAssociatedLibrary(triggeringEl);
    var itemKeys = Zotero.state.getSelectedItemKeys();
    var collectionKey = Zotero.state.getUrlVar('collectionKey');
    
    var modifiedItems = [];
    var responses = [];
    J.each(itemKeys, function(index, itemKey){
        var item = library.items.getItem(itemKey);
        item.removeFromCollection(collectionKey);
        modifiedItems.push(item);
    });
    
    library.dirty = true;
    
    library.items.writeItems(modifiedItems)
    .then(function(){
        Z.debug('removal responses finished. forcing reload', 3);
        Zotero.state.clearUrlVars(['collectionKey', 'tag']);
        Zotero.state.pushState(true);
        library.trigger("displayedItemsChanged");
    }).catch(Zotero.catchPromiseError);
    
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
    var mode = Zotero.state.getUrlVar('mode') || 'view';
    
    if(!Zotero.config.librarySettings.allowEdit){
        J(".permission-edit").hide();
    }
};
