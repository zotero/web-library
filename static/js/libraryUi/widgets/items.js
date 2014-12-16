Zotero.ui.widgets.items = {};

Zotero.ui.widgets.items.init = function(el){
    Z.debug("widgets.items.init");
    var library = Zotero.ui.getAssociatedLibrary(el);
    
    library.listen("displayedItemsChanged", Zotero.ui.widgets.items.loadItemsCallback, {widgetEl: el});
    library.listen("changeItemSorting", Zotero.ui.callbacks.resortItems, {widgetEl: el});
    
    //set up sorting on header clicks
    var container = J(el);
    //container.on('click', ".field-table-header", Zotero.ui.callbacks.resortItems);
    
    Zotero.state.bindItemLinks(container);
    
    //check/uncheck all boxes in items table when master checkbox is toggled
    container.on('change', ".itemlist-editmode-checkbox.all-checkbox", function(e){
        var checkbox = J(this);
        J(".itemlist-editmode-checkbox").prop('checked', checkbox.prop('checked'));
        var selectedItemKeys = [];
        J("input.itemKey-checkbox:checked").each(function(index, el){
            selectedItemKeys.push(J(el).data('itemkey'));
        });
        //library.trigger('controlPanelContextChange');
        Zotero.state.selectedItemKeys = selectedItemKeys;
        library.trigger("selectedItemsChanged", {selectedItemKeys: selectedItemKeys});
    });
    
    //init itemkey-checkbox to enable/disable buttons that require something being selected
    container.on('change', "input.itemKey-checkbox", function(e){
        //library.trigger('controlPanelContextChange');
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
    Z.debug("triggering displayedItemsChanged");
    library.trigger("displayedItemsChanged");
};

Zotero.ui.widgets.items.loadItemsCallback = function(event){
    Z.debug('Zotero eventful loadItemsCallback', 3);
    var widgetEl = J(event.data.widgetEl);
    
    var library = Zotero.ui.getAssociatedLibrary(widgetEl);
    var newConfig = Zotero.ui.getItemsConfig(library);
    
    //clear contents and show spinner while loading
    Zotero.ui.showSpinner(widgetEl, 'horizontal');
    
    var p = library.loadItems(newConfig)
    .then(function(response){
        widgetEl.empty();
        if(!response.loadedItems){
            Zotero.error("expected loadedItems on response not present");
            throw("Expected response to have loadedItems");
        }
        var pagination = Zotero.ui.createPagination(response, 'itemPage', newConfig.start, newConfig.limit);
        Zotero.ui.widgets.items.displayItems(widgetEl, newConfig, response.loadedItems, pagination);
    }).catch(function(response){
        Z.error(response);
        widgetEl.html("<p>There was an error loading your items. Please try again in a few minutes.</p>");
        //var elementMessage = Zotero.ui.ajaxErrorMessage(response.jqxhr);
        //widgetEl.html("<p>" + elementMessage + "</p>");
    });
    
    //associate promise with el so we can cancel on later loads
    widgetEl.data('loadingPromise', p);
    return p;
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
                     };
    
    var userPreferencesApiArgs = {
        order: Zotero.preferences.getPref('order'),
        sort: Zotero.preferences.getPref('sort'),
        limit: library.preferences.getPref('itemsPerPage'),
    };
    
    //Build config object that should be displayed next and compare to currently displayed
    var newConfig = J.extend({}, defaultConfig, userPreferencesApiArgs, urlConfigVals);
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
Zotero.ui.widgets.items.displayItems = function(el, config, itemsArray, pagination) {
    Z.debug("Zotero.ui.widgets.displayItems", 3);
    var jel = J(el);
    var library = Zotero.ui.getAssociatedLibrary(jel);
    
    var filledConfig = J.extend({}, Zotero.config.defaultApiArgs, config);
    var displayFields = library.preferences.getPref('listDisplayedFields');
    if(library.libraryType != 'group'){
        displayFields = J.grep(displayFields, function(el, ind){
            return J.inArray(el, Zotero.Library.prototype.groupOnlyColumns) == (-1);
        });
    }
    
    var itemsTableData = {displayFields:displayFields,
                           items:itemsArray,
                           order: filledConfig['order'],
                           sort: filledConfig['sort'],
                           library:library,
                        };

    Z.debug(itemsTableData);
    Z.debug(pagination);
    jel.append( J('#itemstableTemplate').render(itemsTableData) );
    
    if(pagination){
        jel.append( J('#itempaginationTemplate').render({pagination:pagination}) );
    }
    
    //library.trigger('controlPanelContextChange');
    Zotero.eventful.initTriggers();
};

Zotero.ui.callbacks.resortItems = function(e){
    Z.debug(".field-table-header clicked", 3);
    var widgetEl = J(e.data.widgetEl);
    var library = Zotero.ui.getAssociatedLibrary(widgetEl);
    var currentSortField = Zotero.ui.getPrioritizedVariable('order', 'title');
    var currentSortOrder = Zotero.ui.getPrioritizedVariable('sort', 'asc');
    var newSortField;
    var newSortOrder;
    if(e.newSortField){
        newSortField = e.newSortField;
    }
    else {
        newSortField = J(e.triggeringElement).data('columnfield');
    }
    if(e.newSortOrder){
        newSortOrder = e.newSortOrder;
    }
    else{
        newSortOrder = Zotero.config.sortOrdering[newSortField];
    }
    
    Z.debug("curr order field:" + currentSortField, 3);
    Z.debug("curr order sort:" + currentSortOrder, 3);
    Z.debug("New order field:" + newSortField, 3);
    Z.debug("New order sort:" + newSortOrder, 3);
    
    //only allow ordering by the fields we have
    if(J.inArray(newSortField, Zotero.Library.prototype.sortableColumns) == (-1)){
        return false;
    }
    
    //change newSort away from the field default if that was already the current state
    if((!e.newSortOrder) && currentSortField == newSortField && currentSortOrder == newSortOrder){
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
