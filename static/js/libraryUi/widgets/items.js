Zotero.ui.widgets.items = {};

Zotero.ui.widgets.items.init = function(el){
    Zotero.ui.eventful.listen("displayedItemsChanged", Zotero.ui.widgets.items.loadItemsCallback, {widgetEl: el});
    Zotero.ui.eventful.listen("changeItemSorting", Zotero.ui.callbacks.resortItems, {widgetEl: el});
    
    //set up sorting on header clicks
    var container = J(el);
    //container.on('click', ".field-table-header", Zotero.ui.callbacks.resortItems);
    
    Zotero.ui.bindItemLinks();
    
    //check/uncheck all boxes in items table when master checkbox is toggled
    container.on('change', ".itemlist-editmode-checkbox.all-checkbox", function(e){
        J(".itemlist-editmode-checkbox").prop('checked', J(".itemlist-editmode-checkbox.all-checkbox").prop('checked'));
        Zotero.ui.updateDisabledControlButtons();
        Zotero.ui.eventful.trigger("selectedItemsChanged");
    });
    
    //init itemkey-checkbox to enable/disable buttons that require something being selected
    container.on('change', "input.itemKey-checkbox", function(e){
        Zotero.ui.updateDisabledControlButtons();
        Zotero.ui.eventful.trigger("selectedItemsChanged");
    });
    
    container.on('click', "#start-item-link", function(e){
        e.preventDefault();
        Zotero.nav.urlvars.pathVars['itemPage'] = '';
        Zotero.nav.pushState();
    });
    container.on('click', "#prev-item-link", function(e){
        e.preventDefault();
        var itemPage = Zotero.nav.getUrlVar('itemPage') || '1';
        itemPage = parseInt(itemPage, 10);
        var newItemPage = itemPage - 1;
        Zotero.nav.urlvars.pathVars['itemPage'] = newItemPage;
        Zotero.nav.pushState();
    });
    container.on('click', "#next-item-link", function(e){
        e.preventDefault();
        var itemPage = Zotero.nav.getUrlVar('itemPage') || '1';
        itemPage = parseInt(itemPage, 10);
        var newItemPage = itemPage + 1;
        Zotero.nav.urlvars.pathVars['itemPage'] = newItemPage;
        Zotero.nav.pushState();
    });
    container.on('click', "#last-item-link", function(e){
        e.preventDefault();
        Z.debug("last-item-link clickbind", 4);
        var pagehref = J(e.currentTarget).attr('href');
        var pathVars = Zotero.nav.parsePathVars(pagehref);
        var lastItemPage = pathVars.itemPage;
        Zotero.nav.urlvars.pathVars['itemPage'] = lastItemPage;
        Zotero.nav.pushState();
    });
    
};

Zotero.ui.widgets.items.loadItemsCallback = function(event){
    Z.debug('Zotero eventful loadItemsCallback', 3);
    var widgetEl = event.data.widgetEl;
    var el = widgetEl;
    
    Zotero.callbacks.rejectIfPending(el);
    var jel = J(el);
    
    var library = Zotero.ui.getAssociatedLibrary(el);
    
    var newConfig = Zotero.ui.getItemsConfig(library);
    Z.debug(newConfig);
    //clear contents and show spinner while loading
    Zotero.ui.showSpinner(el, 'horizontal');
    
    var p = library.loadItems(newConfig)
    .then(function(loadedItems){
        J(el).empty();
        Zotero.ui.displayItemsFull(el, newConfig, loadedItems);
    },
    function(response){
        var elementMessage = Zotero.ui.ajaxErrorMessage(response.jqxhr);
        jel.html("<p>" + elementMessage + "</p>");
    });
    
    //associate promise with el so we can cancel on later loads
    jel.data('pendingDeferred', d);
};

Zotero.ui.getItemsConfig = function(library){
    var effectiveUrlVars = ['itemPage', 'tag', 'collectionKey', 'order', 'sort', 'q'];
    var urlConfigVals = {};
    J.each(effectiveUrlVars, function(index, value){
        var t = Zotero.nav.getUrlVar(value);
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
 * Display an items widget (for logged in homepage)
 * @param  {Dom Element} el          Container
 * @param  {object} config      items config
 * @param  {array} loadedItems loaded items array
 * @return {undefined}
 */
Zotero.ui.displayItemsWidget = function(el, config, loadedItems){
    Z.debug("Zotero.ui.displayItemsWidget", 3);
    Z.debug(config, 4);
    var jel = J(el);
    var library = Zotero.ui.getAssociatedLibrary(jel);
    
    //Z.debug(loadedItems, 4);
    //figure out pagination values
    var itemPage = parseInt(Zotero.nav.getUrlVar('itemPage'), 10) || 1;
    var feed = loadedItems.feed;
    var start = parseInt(config.start, 10) || 0;
    var limit = parseInt(config.limit, 10) || library.preferences.getPref('itemsPerPage');
    var order = config.order || Zotero.preferences.getPref('order');
    var sort = config.sort || Zotero.config.sortOrdering[order] || 'asc';
    var editmode = false;
    
    var displayFields = library.preferences.getPref('listDisplayedFields');
    
    var itemsTableData = {displayFields:displayFields,
                           items:loadedItems.itemsArray,
                           order: order,
                           sort: sort,
                           library: loadedItems.library
                        };
    Zotero.ui.insertItemsTable(el, itemsTableData);
    
};

/**
 * Display the full library items section
 * @param  {Dom Element} el          Container
 * @param  {object} config      items config
 * @param  {array} loadedItems loaded items array
 * @return {undefined}
 */
Zotero.ui.displayItemsFull = function(el, config, loadedItems) {
    Z.debug("Zotero.ui.displayItemsFull", 3);
    Z.debug(loadedItems);
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
        /*
        displayFields = displayFields.filter(function(el, ind, array){
            return J.inArray(el, Zotero.Library.prototype.groupOnlyColumns) == (-1);
        });*/
    }
    var editmode = (Zotero.config.librarySettings.allowEdit ? true : false);
    
    var itemsTableData = {displayFields:displayFields,
                           items:itemsArray,
                           editmode:editmode,
                           order: filledConfig['order'],
                           sort: filledConfig['sort'],
                           library:library
                        };
    
    Zotero.ui.insertItemsTable(jel, itemsTableData);
    
    if(loadedItems.feed){
        var feed = loadedItems.feed;
        var pagination = Zotero.ui.createPagination(loadedItems.feed, 'itemPage', filledConfig);
        var paginationData = {feed:feed, pagination:pagination};
        var itemPage = pagination.page;
        Zotero.ui.insertItemsPagination(el, paginationData);
    }
    
    Zotero.ui.updateDisabledControlButtons();
};

/**
 * Render and insert items table html into a container
 * @param  {Dom Element} el   Container
 * @param  {object} data Data object to pass to itemstableTemplate partial
 * @return {undefined}
 */
Zotero.ui.insertItemsTable = function(el, data){
    Z.debug("Zotero.ui.insertItemsTable", 3);
    Z.debug(data);
    var a = J(el).append( J('#itemstableTemplate').render(data) );
    
    Zotero.eventful.initTriggers(J(el));
};

/**
 * Render and insert the items pagination block into a container
 * @param  {Dom Element} el   Container
 * @param  {object} data Data object to pass to itempaginationTemplate partial
 * @return {undefined}
 */
Zotero.ui.insertItemsPagination = function(el, data){
    J(el).append( J('#itempaginationTemplate').render(data) );
    Zotero.ui.init.paginationButtons(data.pagination);
};


/**
 * Bind item links to take appropriate action instead of following link
 * @return {undefined}
 */
Zotero.ui.bindItemLinks = function(){
    Z.debug("Zotero.ui.bindItemLinks", 3);
    
    J("div#items-pane").on('click', "a.item-select-link", function(e){
        e.preventDefault();
        e.stopImmediatePropagation();
        Z.debug("item-select-link clicked", 3);
        var itemKey = J(this).attr('data-itemKey');
        Z.debug("click " + itemKey, 4);
        Zotero.nav.urlvars.pathVars.itemKey = itemKey;
        Zotero.nav.pushState();
        //Zotero.callbacks.loadItem(el, 'user', itemKey);
    });
    J("div#items-pane").on('click', 'td[data-itemkey]:not(.edit-checkbox-td)', function(e){
        e.preventDefault();
        Z.debug("item-select-td clicked", 3);
        var itemKey = J(this).attr('data-itemKey');
        Z.debug("click " + itemKey, 4);
        Zotero.nav.urlvars.pathVars.itemKey = itemKey;
        Zotero.nav.pushState();
        //Zotero.callbacks.loadItem(el, 'user', itemKey);
    });
};

Zotero.ui.callbacks.resortItems = function(e){
    Z.debug(".field-table-header clicked", 3);
    var triggeringElement = e.triggeringElement;
    var library = Zotero.ui.getEventLibrary(e);
    var currentSortField = Zotero.ui.getPrioritizedVariable('order', 'title');
    var currentSortOrder = Zotero.ui.getPrioritizedVariable('sort', 'asc');
    var newSortField = J(e.triggeringElement).data('columnfield');
    Z.debug(e.currentTarget);
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
    Zotero.nav.urlvars.pathVars['order'] = newSortField;
    Zotero.nav.urlvars.pathVars['sort'] = newSortOrder;
    Zotero.nav.pushState();
    
    //set new order as preference and save it to use www prefs
    library.preferences.setPref('sortField', newSortField);
    library.preferences.setPref('sortOrder', newSortOrder);
    library.preferences.setPref('order', newSortField);
    library.preferences.setPref('sort', newSortOrder);
    Zotero.preferences.setPref('order', newSortField);
    Zotero.preferences.setPref('sort', newSortOrder);
};
