Zotero.ui.widgets.filterGuide = {};

Zotero.ui.widgets.filterGuide.init = function(el){
    Z.debug('widgets.filterGuide.init', 3);
    Zotero.ui.eventful.listen("displayedItemsChanged", Zotero.ui.widgets.filterGuide.refreshFilters, {widgetEl: el});
    Zotero.ui.eventful.listen("clearFilter", Zotero.ui.widgets.filterGuide.clearFilter, {widgetEl: el});
};

Zotero.ui.widgets.filterGuide.refreshFilters = function(event){
    Z.debug('widgets.filterGuide.refreshFilters', 3);
    var widgetEl = event.data.widgetEl;
    var el = widgetEl;
    var jel = J(el);
    var library = Zotero.ui.getAssociatedLibrary(el);
    
    var displayConfig = Zotero.ui.getItemsConfig(library);
    var filterData = {};
    if(displayConfig['collectionKey']){
        filterData['collection'] = library.collections.getCollection(displayConfig['collectionKey']);
    }
    if(displayConfig['tag']){
        filterData['tag'] = displayConfig['tag'];
    }
    if(displayConfig['q']){
        filterData['search'] = displayConfig['q'];
    }
    
    jel.empty();
    jel.append( J('#filterguideTemplate').render(filterData) );
    Zotero.eventful.initTriggers(widgetEl);
};

Zotero.ui.widgets.filterGuide.clearFilter = function(event){
    Z.debug('widgets.filterGuide.clearFilter', 3);
    var widgetEl = J(event.data.widgetEl);
    var triggeringEl = J(event.triggeringElement);
    var library = Zotero.ui.getAssociatedLibrary(widgetEl);
    
    var collectionKey = triggeringEl.data('collectionkey');
    var tag = triggeringEl.data('tag');
    var query = triggeringEl.data('query');
    
    if(collectionKey){
        Zotero.state.unsetUrlVar('collectionKey');
    }
    if(tag){
        Zotero.state.toggleTag(tag);
    }
    if(query){
        Zotero.ui.eventful.trigger('clearLibraryQuery');
        return;
        //Zotero.ui.clearLibraryQuery();
    }
    Zotero.state.pushState();
};
