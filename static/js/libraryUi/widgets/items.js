Zotero.ui.widgets.items = {};

Zotero.ui.widgets.items.init = function(el){
    Zotero.ui.eventful.listen("displayedItemsChanged", Zotero.ui.widgets.items.loadItemsCallback, {widgetEl: el});
    
    //set up sorting on header clicks
    var container = J(el);
    container.on('click', ".field-table-header", Zotero.ui.callbacks.resortItems);
    
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
    
    
};

Zotero.ui.widgets.items.loadItemsCallback = function(event){
    Z.debug('Zotero eventful loadItemsCallback', 3);
    var widgetEl = event.data.widgetEl;
    var el = widgetEl;
    
    Zotero.callbacks.rejectIfPending(el);
    var jel = J(el);
    
    var library = Zotero.ui.getAssociatedLibrary(el);
    
    var newConfig = Zotero.ui.getItemsConfig(library);
    
    //clear contents and show spinner while loading
    Zotero.ui.showSpinner(el, 'horizontal');
    
    var d = library.loadItems(newConfig);
    
    d.done(J.proxy(function(loadedItems){
        J(el).empty();
        Zotero.ui.displayItemsFull(el, newConfig, loadedItems);
        //set currentConfig on element when done displaying
        //J(el).data('currentconfig', newConfig);
    }, this));
    
    d.fail(J.proxy(function(jqxhr, textStatus, errorThrown){
        var elementMessage = Zotero.ui.ajaxErrorMessage(jqxhr);
        jel.html("<p>" + elementMessage + "</p>");
    }));
    
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
                         limit: 25,
                         content: 'json'
                     };
    
    //Build config object that should be displayed next and compare to currently displayed
    var newConfig = J.extend({}, defaultConfig, Zotero.config.userDefaultApiArgs, urlConfigVals);
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
    var limit = parseInt(config.limit, 10) || 25;
    var order = config.order || Zotero.config.userDefaultApiArgs.order;
    var sort = config.sort || Zotero.config.sortOrdering[order] || 'asc';
    var editmode = false;
    
    var displayFields = library.preferences.getPref('library_listShowFields');
    
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
Zotero.ui.displayItemsFull = function(el, config, loadedItems){
    Z.debug("Zotero.ui.displayItemsFull", 3);
    Z.debug(config, 4);
    //Z.debug(loadedItems, 4);
    
    var jel = J(el);
    var library = Zotero.ui.getAssociatedLibrary(jel);
    
    var feed = loadedItems.feed;
    var filledConfig = J.extend({}, Zotero.config.defaultApiArgs, Zotero.config.userDefaultApiArgs, config);
    var displayFields = library.preferences.getPref('library_listShowFields');
    if(loadedItems.library.libraryType != 'group'){
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
                           items:loadedItems.itemsArray,
                           editmode:editmode,
                           order: filledConfig['order'],
                           sort: filledConfig['sort'],
                           library:loadedItems.library
                        };
    Z.debug(jel, 4);
    Zotero.ui.insertItemsTable(jel, itemsTableData);
    
    if(Zotero.config.mobile){
        Zotero.ui.createOnActivePage(el);
        return;
    }
    
    var pagination = Zotero.ui.createPagination(loadedItems.feed, 'itemPage', filledConfig);
    var paginationData = {feed:feed, pagination:pagination};
    var itemPage = pagination.page;
    Zotero.ui.insertItemsPagination(el, paginationData);
    Z.debug(jel, 4);
    
    //bind pagination links
    var lel = J(el);
    J("#start-item-link").click(function(e){
        e.preventDefault();
        Zotero.nav.urlvars.pathVars['itemPage'] = '';
        Zotero.nav.pushState();
    });
    J("#prev-item-link").click(function(e){
        e.preventDefault();
        var newItemPage = itemPage - 1;
        Zotero.nav.urlvars.pathVars['itemPage'] = newItemPage;
        Zotero.nav.pushState();
    });
    J("#next-item-link").click(function(e){
        e.preventDefault();
        var newItemPage = itemPage + 1;
        Zotero.nav.urlvars.pathVars['itemPage'] = newItemPage;
        Zotero.nav.pushState();
    });
    J("#last-item-link").click(function(e){
        e.preventDefault();
        Z.debug("last-item-link clickbind", 4);
        var lasthref = '';
        J.each(feed.links, function(ind, link){
            if(link.rel === "last"){
                lasthref = link.href;
                return false;
            }
        });
        Z.debug(lasthref, 4);
        var laststart = J.deparam.querystring(lasthref).start;
        Z.debug("laststart:" + laststart, 4);
        var lastItemPage = (parseInt(laststart, 10) / limit) + 1;
        Zotero.nav.urlvars.pathVars['itemPage'] = lastItemPage;
        Zotero.nav.pushState();
    });
    
    Zotero.ui.updateDisabledControlButtons();
    
    Zotero.ui.libraryBreadcrumbs();
    
    Zotero.ui.createOnActivePage(el);
};

/**
 * Render and insert items table html into a container
 * @param  {Dom Element} el   Container
 * @param  {object} data Data object to pass to itemstableTemplate partial
 * @return {undefined}
 */
Zotero.ui.insertItemsTable = function(el, data){
    Z.debug("Zotero.ui.insertItemsTable", 3);
    Z.debug(data, 4);
    var a = J(el).append( J('#itemstableTemplate').render(data) );
    
    //need to test for inside initialized page or error is thrown
    if(Zotero.config.mobile && J(el).closest('.ui-page').length){
        //J(el).trigger('create');
        if(!(J(el).find('#field-list').hasClass('ui-listview'))) {
            J(el).find('#field-list').listview();
        }
        else{
            //J(el).find('#field-list').listview('refresh');
            J(el).find('#field-list').trigger('refresh');
        }
    }
    
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
    var currentOrderField = Zotero.ui.getPrioritizedVariable('order', 'title');
    var currentOrderSort = Zotero.ui.getPrioritizedVariable('sort', 'asc');// Zotero.nav.getUrlVar('sort') || Zotero.config.userDefaultApiArgs.sort || Zotero.config.sortOrdering[currentOrderField] || 'asc';
    var newOrderField = J(e.currentTarget).data('columnfield');
    Z.debug("New order field:" + newOrderField);
    Z.debug(e.currentTarget);
    var newOrderSort = Zotero.config.sortOrdering[newOrderField];
    
    //only allow ordering by the fields we have
    if(J.inArray(newOrderField, Zotero.Library.prototype.sortableColumns) == (-1)){
        return false;
    }
    
    //change newSort away from the field default if that was already the current state
    if(currentOrderField == newOrderField && currentOrderSort == newOrderSort){
        if(newOrderSort == 'asc'){
            newOrderSort = 'desc';
        }
        else{
            newOrderSort = 'asc';
        }
    }
    
    //problem if there was no sort column mapped to the header that got clicked
    if(!newOrderField){
        Zotero.ui.jsNotificationMessage("no order field mapped to column");
        return false;
    }
    
    //update the url with the new values
    Zotero.nav.urlvars.pathVars['order'] = newOrderField;
    Zotero.nav.urlvars.pathVars['sort'] = newOrderSort;
    Zotero.nav.pushState();
    
    //TODO: update to use Zotero.Preferences?
    //set new order as preference and save it to use www prefs
    Zotero.config.userDefaultApiArgs.sort = newOrderSort;
    Zotero.config.userDefaultApiArgs.order = newOrderField;
    Zotero.utils.setUserPref('library_defaultSort', newOrderField + ',' + newOrderSort);
};


/**
 * Change sort/order arguments when a table header is clicked
 * @param  {event} e click event
 * @return {boolean}
 */
Zotero.ui.callbacks.sortBy = function(e){
    Z.debug("sort by link clicked", 3);
    e.preventDefault();
    
    var currentOrderField = Zotero.ui.getPrioritizedVariable('order', 'title');
    var currentOrderSort = Zotero.ui.getPrioritizedVariable('sort', 'asc');// Zotero.nav.getUrlVar('sort') || Zotero.config.sortOrdering[currentOrderField] || 'asc';
    
    var dialogEl = J("#sort-dialog");
    dialogEl.replaceWith( J("#sortdialogTemplate").render({'columnFields':Zotero.Library.prototype.displayableColumns, currentOrderField:currentOrderField}) );
    
    var submitFunction = J.proxy(function(){
        Z.debug("Zotero.ui.callbacks.sortBy submit callback");
        
        var currentOrderField = Zotero.ui.getPrioritizedVariable('order', 'title');
        var currentOrderSort = Zotero.ui.getPrioritizedVariable('sort', 'asc');//Zotero.nav.getUrlVar('sort') || Zotero.config.userDefaultApiArgs.sort || Zotero.config.sortOrdering[currentOrderField] || 'asc';
        var newOrderField = J("#sortColumnSelect").val();
        var newOrderSort = J("#sortOrderSelect").val() || Zotero.config.sortOrdering[newOrderField];
        
        
        //only allow ordering by the fields we have
        if(J.inArray(newOrderField, Zotero.Library.prototype.sortableColumns) == (-1)){
            return false;
        }
        
        //change newSort away from the field default if that was already the current state
        if(currentOrderField == newOrderField && currentOrderSort == newOrderSort){
            if(newOrderSort == 'asc'){
                newOrderSort = 'desc';
            }
            else{
                newOrderSort = 'asc';
            }
        }
        
        //problem if there was no sort column mapped to the header that got clicked
        if(!newOrderField){
            Zotero.ui.jsNotificationMessage("no order field mapped to column");
            return false;
        }
        
        //update the url with the new values
        Zotero.nav.urlvars.pathVars['order'] = newOrderField;
        Zotero.nav.urlvars.pathVars['sort'] = newOrderSort;
        Zotero.nav.pushState();
        
        //TODO: update to use Zotero.Preferences?
        //set new order as preference and save it to use www prefs
        Zotero.config.userDefaultApiArgs.sort = newOrderSort;
        Zotero.config.userDefaultApiArgs.order = newOrderField;
        Zotero.utils.setUserPref('library_defaultSort', newOrderField + ',' + newOrderSort);
        
        Zotero.ui.closeDialog(J("#sort-dialog"));
        
    }, this);
    
    Zotero.ui.dialog(J("#sort-dialog"), {
        modal:true,
        minWidth: 300,
        draggable: false,
        buttons: {
            'Save': submitFunction,
            'Cancel': function(){
                Zotero.ui.closeDialog(J("#sort-dialog"));
            }
        }
    });
};
