Zotero.ui.widgets.localItems = {};

Zotero.ui.widgets.localItems.init = function(el){
    Z.debug("localItems widget init", 3);
    var library = Zotero.ui.getAssociatedLibrary(el);
    
    library.listen("changeItemSorting", Zotero.ui.callbacks.resortItems, {widgetEl: el});
    
    //listen for request to display different items
    library.listen("displayedItemsChanged", Zotero.ui.widgets.localItems.updateDisplayedItems, {widgetEl: el});
    library.listen("displayedItemsUpdated", Zotero.ui.widgets.localItems.displayItems, {widgetEl: el});
    library.listen("cachedDataLoaded", Zotero.ui.widgets.localItems.displayItems, {widgetEl: el});
    
    //set up sorting on header clicks
    var container = J(el);
    //container.on('click', ".field-table-header", Zotero.ui.callbacks.resortItemsLocal);
    
    Zotero.state.bindItemLinks(container);
    
    //check/uncheck all boxes in items table when master checkbox is toggled
    container.on('change', ".itemlist-editmode-checkbox.all-checkbox", function(e){
        J(".itemlist-editmode-checkbox").prop('checked', J(".itemlist-editmode-checkbox.all-checkbox").prop('checked'));
        //library.trigger('controlPanelContextChange');
        library.trigger("selectedItemsChanged");
    });
    
    //init itemkey-checkbox to enable/disable buttons that require something being selected
    container.on('change', "input.itemKey-checkbox", function(e){
        //library.trigger('controlPanelContextChange');
        var selectedItemKeys = [];
        J("input.itemKey-checkbox:checked").each(function(index, el){
            selectedItemKeys.push(J(el).data('itemkey'));
        });
        library.trigger("selectedItemsChanged", {selectedItemKeys: selectedItemKeys});
    });
    
    Zotero.ui.widgets.localItems.bindPaginationLinks(container);
    library.trigger("displayedItemsUpdated");
};

Zotero.ui.widgets.localItems.bindPaginationLinks = function(container){
    container.on('click', "#start-item-link", function(e){
        e.preventDefault();
        Zotero.state.pathVars['itemPage'] = '';
        Zotero.state.pushState();
    });
    container.on('click', "#prev-item-link", function(e){
        e.preventDefault();
        var itemPage = Zotero.state.getUrlVar('itemPage') || '1';
        itemPage = parseInt(itemPage, 10);
        var newItemPage = itemPage - 1;
        Zotero.state.pathVars['itemPage'] = newItemPage;
        Zotero.state.pushState();
    });
    container.on('click', "#next-item-link", function(e){
        e.preventDefault();
        var itemPage = Zotero.state.getUrlVar('itemPage') || '1';
        itemPage = parseInt(itemPage, 10);
        var newItemPage = itemPage + 1;
        Zotero.state.pathVars['itemPage'] = newItemPage;
        Zotero.state.pushState();
    });
    container.on('click', "#last-item-link", function(e){
        e.preventDefault();
        Z.debug("last-item-link clickbind", 4);
        var pagehref = J(e.currentTarget).attr('href');
        var pathVars = Zotero.state.parsePathVars(pagehref);
        var lastItemPage = pathVars.itemPage;
        Zotero.state.pathVars['itemPage'] = lastItemPage;
        Zotero.state.pushState();
    });
};

Zotero.ui.widgets.localItems.updateDisplayedItems = function(event){
    Z.debug("widgets.localItems.updateDisplayedItems", 3);
    //- determine what config applies that we need to find items for
    //- find the appropriate items in the store, presumably with indexedDB queries
    //- pull out x items that match (or since we have them locally anyway, just display them all)
    var widgetEl = J(event.data.widgetEl);
    var library = Zotero.ui.getAssociatedLibrary(widgetEl);
    var newConfig = Zotero.ui.getItemsConfig(library);
    
    var displayParams = Zotero.state.getUrlVars();
    library.buildItemDisplayView(displayParams)
    .then(function(displayItemsArray){
        Z.debug('displayingItems in promise callback');
        widgetEl.empty();
        Zotero.ui.widgets.items.displayItems(widgetEl, newConfig, displayItemsArray);
        Zotero.eventful.initTriggers();    
    }).catch(Zotero.catchPromiseError);
};
