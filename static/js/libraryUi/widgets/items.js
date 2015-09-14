Zotero.ui.widgets.items = {};

Zotero.ui.widgets.items.init = function(el){
    Z.debug("widgets.items.init");
    var library = Zotero.ui.getAssociatedLibrary(el);
    
    library.listen("displayedItemsChanged", Zotero.ui.widgets.items.loadItems, {widgetEl: el});
    library.listen("displayedItemChanged", Zotero.ui.widgets.items.selectDisplayed, {widgetEl: el});
    //library.listen("selectedItemsChanged", Zotero.ui.widgets.items.updateSelected, {widgetEl: el});
    
    library.listen("loadMoreItems", Zotero.ui.widgets.items.loadMoreItems, {widgetEl: el});
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
        Zotero.state.selectedItemKeys = selectedItemKeys;
        library.trigger("selectedItemsChanged", {selectedItemKeys: selectedItemKeys});

        Zotero.ui.widgets.items.highlightSelected();
        //if deselected all, reselect displayed item row
        if(selectedItemKeys.length === 0){
            library.trigger('displayedItemChanged');
        }
    });
    
    //init itemkey-checkbox to enable/disable buttons that require something being selected
    container.on('change', "input.itemKey-checkbox", function(e){
        var selectedItemKeys = [];
        J("input.itemKey-checkbox:checked").each(function(index, el){
            selectedItemKeys.push(J(el).data('itemkey'));
        });
        Zotero.state.selectedItemKeys = selectedItemKeys;
        library.trigger("selectedItemsChanged", {selectedItemKeys: selectedItemKeys});

        Zotero.ui.widgets.items.highlightSelected();
    });
   
    //monitor scroll position of items pane for infinite scrolling
    container.closest("#items-panel").on('scroll', function(e){
        if(Zotero.ui.widgets.items.scrollAtBottom(J(this))){
            library.trigger("loadMoreItems");
        }
    });

    library.trigger("displayedItemsChanged");
};

//select and highlight in the itemlist the item  that is displayed
//in the item details widget
Zotero.ui.widgets.items.selectDisplayed = function(event){
    Z.debug('widgets.items.selectDisplayed', 3);
    var widgetEl = J(event.data.widgetEl);
    var library = Zotero.ui.getAssociatedLibrary(widgetEl);
    var selectedItemKey = Zotero.state.getUrlVar('itemKey');
    Zotero.state.selectedItemKeys = [selectedItemKey];
    var checkboxName = 'selectitem-' + selectedItemKey;
    
    //uncheck all checkboxes, then check the one that is newly displayed
    J(".itemlist-editmode-checkbox").prop('checked', false);
    J('[name="' + checkboxName + '"]').prop('checked', true);

    Zotero.ui.widgets.items.highlightSelected();
};

//highlight the rows that are currently selected
Zotero.ui.widgets.items.highlightSelected = function(){
    //highlight only checked rows
    J(".itemlist-editmode-checkbox").closest("tr").removeClass("highlighed");
    J(".itemlist-editmode-checkbox:checked").closest("tr").addClass("highlighed");
};

Zotero.ui.widgets.items.loadItems = function(event){
    Z.debug('Zotero eventful loadItems', 3);
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
        library.items.totalResults = response.totalResults;
        Zotero.ui.widgets.items.displayItems(widgetEl, newConfig, response.loadedItems);
    }).catch(function(response){
        Z.error(response);
        widgetEl.html("<p>There was an error loading your items. Please try again in a few minutes.</p>");
        //var elementMessage = Zotero.ui.ajaxErrorMessage(response.jqxhr);
    });
    return p;
};

//load more items when the user has scrolled to the bottom of the current list
Zotero.ui.widgets.items.loadMoreItems = function(event){
    Z.debug('loadMoreItems', 3);
    var widgetEl = J(event.data.widgetEl);
    //bail out if we're already fetching more items
    if(widgetEl.data('moreloading')){
        return;
    }
    //bail out if we're done loading all items
    if(widgetEl.data('all-items-loaded')){
        return;
    }
    widgetEl.data('moreloading', true);
    
    var library = Zotero.ui.getAssociatedLibrary(widgetEl);
    var newConfig = Zotero.ui.getItemsConfig(library);
    var newStart = widgetEl.find("table.wide-items-table tbody>tr").length;
    Z.debug("newStart:" + newStart);
    newConfig.start = newStart;

    //show spinner before making request
    Zotero.ui.showSpinner(widgetEl.find('.items-spinner').show(), 'horizontal');
    
    var p = library.loadItems(newConfig)
    .then(function(response){
        if(!response.loadedItems){
            Zotero.error("expected loadedItems on response not present");
            throw("Expected response to have loadedItems");
        }
        Zotero.ui.widgets.items.displayMoreItems(widgetEl, response.loadedItems);
        widgetEl.removeData('moreloading');
        widgetEl.find('.items-spinner').hide();

        //see if we're displaying as many items as there are in results
        var itemsDisplayed = widgetEl.find("table.narrow-items-table tbody tr").length;
        Z.debug("testing totalResults vs itemsDisplayed: " + response.totalResults, + " " + itemsDisplayed);
        if(response.totalResults == itemsDisplayed) {
            widgetEl.data('all-items-loaded', true);
        }
    }).catch(function(response){
        Z.error(response);
        widgetEl.append("<p>There was an error loading your items. Please try again in a few minutes.</p>");
        widgetEl.removeData('moreloading');
        widgetEl.find('.items-spinner').hide();
    });
    
};

Zotero.ui.getItemsConfig = function(library){
    var effectiveUrlVars = ['tag', 'collectionKey', 'order', 'sort', 'q', 'qmode'];
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
                         //itemPage: 1,
                         limit: library.preferences.getPref('itemsPerPage'),
                     };
    
    var userPreferencesApiArgs = {
        order: Zotero.preferences.getPref('order'),
        sort: Zotero.preferences.getPref('sort'),
        limit: library.preferences.getPref('itemsPerPage'),
    };
    
    //Build config object that should be displayed next and compare to currently displayed
    var newConfig = J.extend({}, defaultConfig, userPreferencesApiArgs, urlConfigVals);
    //newConfig.start = parseInt(newConfig.limit, 10) * (parseInt(newConfig.itemPage, 10) - 1);
    
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
Zotero.ui.widgets.items.displayItems = function(el, config, itemsArray) {
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

    jel.append( J('#itemstableTemplate').render(itemsTableData) );
    
    //library.trigger('controlPanelContextChange');
    Zotero.eventful.initTriggers();

    if(J("body").hasClass('lib-body')){
        Zotero.ui.fixTableHeaders(J("#field-table"));
    }
    library.trigger("displayedItemChanged");
};

Zotero.ui.widgets.items.displayMoreItems = function(el, itemsArray) {
    Z.debug("Zotero.ui.widgets.displayItems", 3);
    var jel = J(el);
    var library = Zotero.ui.getAssociatedLibrary(jel);
    
    var displayFields = library.preferences.getPref('listDisplayedFields');
    if(library.libraryType != 'group'){
        displayFields = J.grep(displayFields, function(el, ind){
            return J.inArray(el, Zotero.Library.prototype.groupOnlyColumns) == (-1);
        });
    }
    
    var itemsTableData = {displayFields:displayFields,
                           items:itemsArray,
                           library:library,
                        };

    var wideTableRows = J('#itemrowsetTemplate').render(itemsTableData);
    var narrowTableRows = J('#singlecellitemrowsetTemplate').render(itemsTableData);
    
    jel.find("table.wide-items-table tbody").append(wideTableRows);
    jel.find("table.narrow-items-table tbody").append(narrowTableRows);
    
    Zotero.eventful.initTriggers();
    Zotero.ui.fixTableHeaders(J("#field-table"));
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

Zotero.ui.widgets.items.scrollAtBottom = function(el) {
    if(J(el).scrollTop() + J(el).innerHeight() >= J(el)[0].scrollHeight){
      return true;
   }
   return false;
};