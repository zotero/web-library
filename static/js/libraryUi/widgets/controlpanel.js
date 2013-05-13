Zotero.ui.widgets.controlPanel = {};

Zotero.ui.widgets.controlPanel.init = function(el){
    Z.debug("Zotero.eventful.init.controlPanel", 3);
    Zotero.ui.showControlPanel(el);
    Zotero.ui.eventful.listen("controlPanelContextChange selectedItemsChanged", Zotero.ui.updateDisabledControlButtons);
    Zotero.ui.eventful.listen("selectedCollectionChanged", Zotero.ui.updateCollectionButtons);
    
    Zotero.ui.eventful.listen("addToCollection", Zotero.ui.callbacks.addToCollection);
    Zotero.ui.eventful.listen("removeFromCollection", Zotero.ui.callbacks.removeFromCollection);
    Zotero.ui.eventful.listen("moveToTrash", Zotero.ui.callbacks.moveToTrash);
    Zotero.ui.eventful.listen("removeFromTrash", Zotero.ui.callbacks.removeFromTrash);
    Zotero.ui.eventful.listen("createCollection", Zotero.ui.callbacks.createCollection);
    Zotero.ui.eventful.listen("updateCollection", Zotero.ui.callbacks.updateCollection);
    Zotero.ui.eventful.listen("deleteCollection", Zotero.ui.callbacks.deleteCollection);
    Zotero.ui.eventful.listen("toggleEdit", Zotero.ui.callbacks.toggleEdit);
    Zotero.ui.eventful.listen("librarySettings", Zotero.ui.callbacks.librarySettings);
    Zotero.ui.eventful.listen("citeItems", Zotero.ui.callbacks.citeItems);
    Zotero.ui.eventful.listen("exportItems", Zotero.ui.callbacks.showExportDialog);
};

Zotero.ui.widgets.controlPanel.updateDisabledControlButtons = function(){
    Zotero.ui.updateDisabledControlButtons();
};

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
    J(el).find("#newitemdropdownTemplate").tmpl({itemTypes:itemTypes}).replaceAll(menuEl);
    //J(el).find(".create-item-button").dropdown();
};

/**
 * Toggle library edit mode when edit button clicked
 * @param  {event} e click event
 * @return {boolean}
 */
Zotero.ui.callbacks.toggleEdit =  function(e){
    Z.debug("edit checkbox toggled", 3);
    if(J(this).prop('checked')){
        Z.debug("has val: " + J(this).val());
        Zotero.nav.urlvars.pathVars['mode'] = 'edit';
    }
    else{
        Z.debug("removing edit mode", 3);
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

Zotero.ui.callbacks.citeItems = function(e){
    Z.debug("cite-item-link clicked", 3);
    e.preventDefault();
    
    //get library and build dialog
    var library = Zotero.ui.getAssociatedLibrary();
    var dialogEl = J("#cite-item-dialog").empty();
    if(Zotero.config.mobile){
        J("#citeitemformTemplate").tmpl({}).replaceAll(dialogEl);
    }
    else{
        J("#citeitemformTemplate").tmpl({}).appendTo(dialogEl);
    }
    
    
    var citeFunction = function(){
        Z.debug("citeFunction", 3);
        Zotero.ui.showSpinner(J("#cite-box-div"));
        
        var style = J("#cite-item-select").val();
        Z.debug(style, 4);
        var itemKeys = Zotero.ui.getSelectedItemKeys(J("#edit-mode-items-form"));
        if(itemKeys.length === 0){
            itemKeys = Zotero.ui.getAllFormItemKeys(J("#edit-mode-items-form"));
        }
        Z.debug(itemKeys, 4);
        var d = library.loadFullBib(itemKeys, style);
        d.done(function(bibContent){
            J("#cite-box-div").html(bibContent);
        });
    };
    
    Z.debug('cite item select width ' + J("#cite-item-select").width() );
    var dropdownWidth = J("#cite-item-select").width();
    dropdownWidth = dropdownWidth > 200 ? dropdownWidth : 200;
    
    var width = dropdownWidth + 150;
    if(!Zotero.config.mobile){
        width = dropdownWidth + 300;
    }
    
    Z.debug("showing cite-item dialog");
    Z.debug("width: " + width);
    Zotero.ui.dialog(J("#cite-item-dialog"), {
        modal:true,
        minWidth: 300,
        draggable: false,
        open: function(){
            var dropdownWidth = J("#cite-item-select").width();
            var width = dropdownWidth + 150;
            if(!Zotero.config.mobile){
                width = dropdownWidth + 300;
            }
            J("#cite-item-dialog").dialog('option', 'width', width);
        },
        width: width
    });
    
    J("#cite-item-select").on('change', citeFunction);
    
    Z.debug("done with Zotero.ui.callbacks.citeItems", 3);
    return false;
};

Zotero.ui.callbacks.showExportDialog = function(e){
    Z.debug("export-link clicked", 3);
    
    //get library and build dialog
    var library = Zotero.ui.getAssociatedLibrary(J("#feed-link-div"));
    var dialogEl = J("#export-dialog").empty();
    if(Zotero.config.mobile){
        //J("#exportTemplate").tmpl({}).replaceAll(dialogEl);
        J("#export-dialog").empty().append(J("#export-list").contents().clone() );
    }
    else{
        //J("#exportTemplate").tmpl({}).appendTo(dialogEl);
        J("#export-dialog").empty().append(J("#export-list").contents().clone() );
    }
    
    Zotero.ui.dialog(J("#export-dialog"), {
        modal:true,
        minWidth: 300,
        draggable: false,
        buttons: {
            'Cancel': function(){
                Zotero.ui.closeDialog(J("#export-dialog"));
            }
        }
    });
    
    Z.debug("done with Zotero.ui.callbacks.exportItems");
    return false;
};

Zotero.ui.callbacks.exportItems = function(e){
    Z.debug("cite-item-link clicked", 3);
    e.preventDefault();
    
    //get library
    var library = Zotero.ui.getAssociatedLibrary(J("#feed-link-div"));
    var urlconfig = J("#feed-link-div").data('urlconfig');
    var itemKeys = Zotero.ui.getSelectedItemKeys(J("#edit-mode-items-form"));
    var requestedFormat = J(this).data('exportformat');
    //override start and limit since we're just looking for itemKeys directly
    var exportConfig = J.extend(urlconfig, {'format':requestedFormat, start:'0', limit:null});
    
    //build link to export file with selected items
    var itemKeyString = itemKeys.join(',');
    if(itemKeyString !== ''){
        exportConfig['itemKey'] = itemKeyString;
    }
    
    var exportUrl = Zotero.ajax.apiRequestUrl(exportConfig) + Zotero.ajax.apiQueryString(exportConfig);
    window.open(exportUrl, '_blank');
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
    var collection = library.collections.getCollection(collectionKey);
    var responses = [];
    J.each(itemKeys, function(index, itemKey){
        var response = collection.removeItem(itemKey);
        responses.push(response);
    });
    library.dirty = true;
    J.when.apply(this, responses).then(function(){
        Z.debug('removal responses finished. forcing reload', 3);
        //Zotero.nav.forceReload = true;//delete Zotero.nav.urlvars.pathVars['mode'];
        Zotero.nav.clearUrlVars(['collectionKey', 'tag']);
        Zotero.nav.pushState(true);
    });
    return false;
};

/**
 * Add currently displaying item or currently selected items to a chosen collection
 * @param {event} e click event
 * @return {boolean}
 */
Zotero.ui.callbacks.addToCollection =  function(e){
    Z.debug("add-to-collection-link clicked", 3);
    e.preventDefault();
    var library = Zotero.ui.getAssociatedLibrary();
    var dialogEl = J("#add-to-collection-dialog").empty();
    Z.debug(library.collections.ncollections, 4);
    J("#addtocollectionformTemplate").tmpl({ncollections:library.collections.nestedOrderingArray()}).appendTo(dialogEl);
    
    var addToFunction = J.proxy(function(){
        Z.debug("add-to-collection-select changed", 3);
        var targetCollection = J("#target-collection").val();
        Z.debug("move to: " + targetCollection, 4);
        Zotero.ui.addToCollection(targetCollection, library);
        Zotero.ui.closeDialog(J("#add-to-collection-dialog"));
        return false;
    }, this);
    
    Zotero.ui.dialog(J("#add-to-collection-dialog"), {
        modal:true,
        minWidth: 300,
        draggable: false,
        buttons: {
            'Add': addToFunction,
            'Cancel': function(){
                J("#add-to-collection-dialog").dialog("close");
            }
        }
    });
    
    var width = J("#target-collection").width() + 50;
    //J("#add-to-collection-dialog").dialog('option', 'width', width);
    
    return false;
};

/**
 * Launch library settings dialog (currently just row selection)
 * @param  {event} e click event
 * @return {boolean}
 */
Zotero.ui.callbacks.librarySettings = function(e){
    Z.debug("library-settings-link clicked", 3);
    e.preventDefault();
    //if(Z.config.librarySettingsInit == false){
    var dialogEl = J("#library-settings-dialog").empty();
    J("#librarysettingsTemplate").tmpl({'columnFields':Zotero.Library.prototype.displayableColumns}).appendTo(dialogEl);
    
    J("#display-column-field-title").prop('checked', true).prop('disabled', true);
    J.each(Zotero.prefs.library_listShowFields, function(index, value){
        var idstring = '#display-column-field-' + value;
        J(idstring).prop('checked', true);
    });
    
    var submitFunction = J.proxy(function(){
        var showFields = [];
        J("#library-settings-form").find('input:checked').each(function(){
            showFields.push(J(this).val());
        });
        
        Zotero.utils.setUserPref('library_listShowFields', showFields);
        Zotero.prefs.library_listShowFields = showFields;
        Zotero.callbacks.loadItems(J("#library-items-div"));
        
        Zotero.ui.closeDialog(J("#library-settings-dialog"));
    }, this);
    
    Zotero.ui.dialog(J("#library-settings-dialog"), {
        modal:true,
        draggable: false,
        buttons: {
            'Save': submitFunction,
            'Cancel': function(){
                Zotero.ui.closeDialog(J("#library-settings-dialog"));
            }
        }
    });
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
