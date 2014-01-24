Zotero.ui.widgets.items = {};

Zotero.ui.widgets.items.init = function(el){
    var library = Zotero.ui.getAssociatedLibrary(el);
    
    library.listen("displayedItemsChanged", Zotero.ui.widgets.items.loadItemsCallback, {widgetEl: el});
    library.listen("changeItemSorting", Zotero.ui.callbacks.resortItems, {widgetEl: el});
    
    //set up sorting on header clicks
    var container = J(el);
    //container.on('click', ".field-table-header", Zotero.ui.callbacks.resortItems);
    
    Zotero.ui.bindItemLinks(container);
    
    //check/uncheck all boxes in items table when master checkbox is toggled
    container.on('change', ".itemlist-editmode-checkbox.all-checkbox", function(e){
        J(".itemlist-editmode-checkbox").prop('checked', J(".itemlist-editmode-checkbox.all-checkbox").prop('checked'));
        var selectedItemKeys = [];
        J("input.itemKey-checkbox:checked").each(function(index, el){
            selectedItemKeys.push(J(el).data('itemkey'));
        });
        Zotero.ui.updateDisabledControlButtons();
        Zotero.state.selectedItemKeys = selectedItemKeys;
        library.trigger("selectedItemsChanged", {selectedItemKeys: selectedItemKeys});
    });
    
    //init itemkey-checkbox to enable/disable buttons that require something being selected
    container.on('change', "input.itemKey-checkbox", function(e){
        Zotero.ui.updateDisabledControlButtons();
        var selectedItemKeys = [];
        J("input.itemKey-checkbox:checked").each(function(index, el){
            selectedItemKeys.push(J(el).data('itemkey'));
        });
        Zotero.state.selectedItemKeys = selectedItemKeys;
        library.trigger("selectedItemsChanged", {selectedItemKeys: selectedItemKeys});
    });
    
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
    
    library.trigger("displayedItemsChanged");
};

Zotero.ui.widgets.items.loadItemsCallback = function(event){
    Z.debug('Zotero eventful loadItemsCallback', 3);
    var widgetEl = J(event.data.widgetEl);
    Zotero.callbacks.rejectIfPending(widgetEl);
    
    var library = Zotero.ui.getAssociatedLibrary(widgetEl);
    var newConfig = Zotero.ui.getItemsConfig(library);
    
    //clear contents and show spinner while loading
    Zotero.ui.showSpinner(widgetEl, 'horizontal');
    
    var p = library.loadItems(newConfig)
    .then(function(loadedItems){
        widgetEl.empty();
        Zotero.ui.widgets.items.displayItems(widgetEl, newConfig, loadedItems);
    },
    function(response){
        var elementMessage = Zotero.ui.ajaxErrorMessage(response.jqxhr);
        widgetEl.html("<p>" + elementMessage + "</p>");
    });
    
    //associate promise with el so we can cancel on later loads
    widgetEl.data('pendingDeferred', p);
};

Zotero.ui.getItemsConfig = function(library){
    var effectiveUrlVars = ['itemPage', 'tag', 'collectionKey', 'order', 'sort', 'q'];
    var urlConfigVals = {};
    J.each(effectiveUrlVars, function(index, value){
        var t = Zotero.state.getUrlVar(value);
        if(t){
            urlConfigVals[value] = t;
        }
    });
    
    var defaultConfig = {libraryID: library.libraryID,
                         libraryType: library.libraryType,
                         target:'items',
                         targetModifier: 'top',
                         itemPage: 1,
                         limit: library.preferences.getPref('itemsPerPage'),
                         content: 'json'
                     };
    
    var userPreferencesApiArgs = {
        order: Zotero.preferences.getPref('order'),
        sort: Zotero.preferences.getPref('sort'),
        limit: library.preferences.getPref('itemsPerPage'),
    };
    
    //Build config object that should be displayed next and compare to currently displayed
    var newConfig = J.extend({}, defaultConfig, userPreferencesApiArgs, urlConfigVals);
    //TODO: figure out if this is still necessary
    newConfig['collectionKey'] = urlConfigVals['collectionKey'];//always override collectionKey, even with absence of collectionKey
    newConfig.start = parseInt(newConfig.limit, 10) * (parseInt(newConfig.itemPage, 10) - 1);
    
    //don't allow ordering by addedBy if user library
    if( (newConfig.order == "addedBy") && (library.libraryType == 'user') ){
        newConfig.order = 'title';
    }
    
    if(!newConfig.sort){
        newConfig.sort = Zotero.config.sortOrdering[newConfig.order];
    }
    
    //don't pass top if we are searching for tags (or query?)
    if(newConfig.tag || newConfig.q){
        delete newConfig.targetModifier;
    }
    
    return newConfig;
};

/**
 * Display the full library items section
 * @param  {Dom Element} el          Container
 * @param  {object} config      items config
 * @param  {array} loadedItems loaded items array
 * @return {undefined}
 */
Zotero.ui.widgets.items.displayItems = function(el, config, loadedItems) {
    Z.debug("Zotero.ui.widgets.displayItems", 3);
    var jel = J(el);
    var library = Zotero.ui.getAssociatedLibrary(jel);
    var itemsArray;
    if(loadedItems.itemsArray){
        itemsArray = loadedItems.itemsArray;
    }
    else {
        itemsArray = library.displayItemsArray;
    }
    
    var filledConfig = J.extend({}, Zotero.config.defaultApiArgs, config);
    var displayFields = library.preferences.getPref('listDisplayedFields');
    if(library.libraryType != 'group'){
        displayFields = J.grep(displayFields, function(el, ind){
            return J.inArray(el, Zotero.Library.prototype.groupOnlyColumns) == (-1);
        });
    }
    var editmode = (Zotero.config.librarySettings.allowEdit ? true : false);
    
    var itemsTableData = {displayFields:displayFields,
                           items:itemsArray,
                           editmode:editmode,
                           order: filledConfig['order'],
                           sort: filledConfig['sort'],
                           library:library,
                        };

    jel.append( J('#itemstableTemplate').render(itemsTableData) );
    
    if(loadedItems.feed){
        var feed = loadedItems.feed;
        var pagination = Zotero.ui.createPagination(loadedItems.feed, 'itemPage', filledConfig);
        var paginationData = {feed:feed, pagination:pagination};
        var itemPage = pagination.page;
        jel.append( J('#itempaginationTemplate').render(paginationData) );
    }
    
    Zotero.ui.updateDisabledControlButtons();
    Zotero.eventful.initTriggers();
};

/**
 * Bind item links to take appropriate action instead of following link
 * @return {undefined}
 */
Zotero.ui.bindItemLinks = function(container){
    Z.debug("Zotero.ui.bindItemLinks", 3);
    
    J(container).on('click', "a.item-select-link", function(e){
        e.preventDefault();
        e.stopImmediatePropagation();
        Z.debug("item-select-link clicked", 3);
        var itemKey = J(this).data('itemkey');
        Zotero.state.pathVars.itemKey = itemKey;
        Zotero.state.pushState();
    });
    J(container).on('click', 'td[data-itemkey]:not(.edit-checkbox-td)', function(e){
        e.preventDefault();
        Z.debug("item-select-td clicked", 3);
        var itemKey = J(this).data('itemkey');
        Zotero.state.pathVars.itemKey = itemKey;
        Zotero.state.pushState();
    });
};

Zotero.ui.callbacks.resortItems = function(e){
    Z.debug(".field-table-header clicked", 3);
    var triggeringElement = e.triggeringElement;
    var library = Zotero.ui.getEventLibrary(e);
    var currentSortField = Zotero.ui.getPrioritizedVariable('order', 'title');
    var currentSortOrder = Zotero.ui.getPrioritizedVariable('sort', 'asc');
    var newSortField = J(e.triggeringElement).data('columnfield');
    //Z.debug(e.currentTarget);
    var newSortOrder = Zotero.config.sortOrdering[newSortField];
    Z.debug("curr order field:" + currentSortField, 3);
    Z.debug("curr order sort:" + currentSortOrder, 3);
    Z.debug("New order field:" + newSortField, 3);
    Z.debug("New order sort:" + newSortOrder, 3);
    
    //only allow ordering by the fields we have
    if(J.inArray(newSortField, Zotero.Library.prototype.sortableColumns) == (-1)){
        return false;
    }
    
    //change newSort away from the field default if that was already the current state
    if(currentSortField == newSortField && currentSortOrder == newSortOrder){
        if(newSortOrder == 'asc'){
            newSortOrder = 'desc';
        }
        else{
            newSortOrder = 'asc';
        }
    }
    
    //problem if there was no sort column mapped to the header that got clicked
    if(!newSortField){
        Zotero.ui.jsNotificationMessage("no order field mapped to column");
        return false;
    }
    
    //update the url with the new values
    Zotero.state.pathVars['order'] = newSortField;
    Zotero.state.pathVars['sort'] = newSortOrder;
    Zotero.state.pushState();
    
    //set new order as preference and save it to use www prefs
    library.preferences.setPref('sortField', newSortField);
    library.preferences.setPref('sortOrder', newSortOrder);
    library.preferences.setPref('order', newSortField);
    library.preferences.setPref('sort', newSortOrder);
    Zotero.preferences.setPref('order', newSortField);
    Zotero.preferences.setPref('sort', newSortOrder);
};
