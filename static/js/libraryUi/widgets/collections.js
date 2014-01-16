Zotero.ui.widgets.collections = {};

Zotero.ui.widgets.collections.init = function(el){
    Z.debug("collections widget init", 3);
    
    Zotero.ui.eventful.listen("collectionsDirty", Zotero.ui.widgets.collections.syncCollections, {widgetEl: el});
    Zotero.ui.eventful.listen("syncCollections", Zotero.ui.widgets.collections.syncCollections, {widgetEl: el});
    Zotero.ui.eventful.listen("syncLibrary", Zotero.ui.widgets.collections.syncCollections, {widgetEl: el});
    Zotero.ui.eventful.listen("cachedDataLoaded", Zotero.ui.widgets.collections.syncCollections, {widgetEl: el});
    
    Zotero.ui.eventful.listen("libraryCollectionsUpdated", Zotero.ui.widgets.collections.rerenderCollections, {widgetEl: el});
    Zotero.ui.eventful.listen("selectCollection", Zotero.ui.widgets.collections.selectCollection, {widgetEl: el});
    Zotero.ui.eventful.listen("selectedCollectionChanged", Zotero.ui.widgets.collections.updateSelectedCollection, {widgetEl: el});
    
    Zotero.ui.widgets.collections.bindCollectionLinks(el);
};

Zotero.ui.widgets.collections.syncCollections = function(event) {
    Zotero.debug("Zotero eventful syncCollectionsCallback", 3);
    var widgetEl = J(event.data.widgetEl);
    
    //get Zotero.Library object if already bound to element
    var library = Zotero.ui.getAssociatedLibrary(widgetEl);
    if(event.libraryString != library.libraryString){
        //Event was triggered for a different library
        Z.debug("event associated with different library. bailing out of syncCollectionsCallback", 3);
        return Promise.resolve();
    }
    
    //sync collections if loaded from cache but not synced
    return library.loadUpdatedCollections()
    .then(function(){
        Zotero.state.doneLoading(widgetEl);
        Zotero.ui.eventful.trigger("libraryCollectionsUpdated");
    },
    function(){
        //sync failed, but we already had some data, so show that
        Zotero.ui.eventful.trigger("libraryCollectionsUpdated");
        //TODO: display error as well
    });
};


Zotero.ui.widgets.collections.rerenderCollections = function(event){
    Zotero.debug("Zotero eventful rerenderCollections", 3);
    var widgetEl = J(event.data.widgetEl);
    
    var library = Zotero.ui.getAssociatedLibrary(widgetEl);
    library.collections.collectionsArray.sort(library.collections.sortByTitleCompare);
    var collectionListEl = widgetEl.find('#collection-list-container');
    collectionListEl.empty();
    Zotero.ui.widgets.collections.renderCollectionList(collectionListEl, library.collections);
    Zotero.ui.eventful.trigger("selectedCollectionChanged");
};

Zotero.ui.widgets.collections.selectCollection = function(event){
    
};

Zotero.ui.widgets.collections.updateSelectedCollection = function(event){
    Zotero.debug("Zotero eventful updateSelectedCollection", 3);
    var widgetEl = J(event.data.widgetEl);
    var collectionListEl = widgetEl.find('.collection-list-container');
    
    Zotero.ui.widgets.collections.highlightCurrentCollection(widgetEl);
    Zotero.ui.widgets.collections.nestHideCollectionTree(collectionListEl);
    Zotero.ui.widgets.collections.updateCollectionButtons(widgetEl);
    return;
};

Zotero.ui.widgets.collections.updateCollectionButtons = function(el){
    if(!el){
        el = J("body");
    }
    jel = J(el);
    
    //enable modify and delete only if collection is selected
    if(Zotero.state.getUrlVar("collectionKey")){
        jel.find(".update-collection-button").removeClass('disabled');
        jel.find(".delete-collection-button").removeClass('disabled');
    }
    else{
        jel.find(".update-collection-button").addClass('disabled');
        jel.find(".delete-collection-button").addClass('disabled');
    }
};

//generate the full html for the nested collections list
/**
 * generate the full html for the nested collections list
 * @param  {Dom Element} el          Element to display collections in
 * @param  {Zotero_Collections} collections Zotero_Collections to display
 * @return {undefined}
 */
Zotero.ui.widgets.collections.renderCollectionList = function(el, collections){
    Z.debug("Zotero.ui.renderCollectionList", 3);
    var widgetEl = J(el);
    var currentCollectionKey = Zotero.state.getUrlVar('collectionKey') || '';
    var trash = collections.owningLibrary.libraryType == 'user' ? true : false;
    //var ncollections = collections.nestedOrderingArray();
    widgetEl.append( J('#collectionlistTemplate').render({collections:collections.collectionsArray,
                                        libUrlIdentifier:collections.libraryUrlIdentifier,
                                        currentCollectionKey: currentCollectionKey,
                                        trash: trash
                                        //ncollections: ncollections
                                    }
                                    ) );
    
};


/**
 * Bind collection links to take appropriate action instead of following link
 * @return {boolean}
 */
Zotero.ui.widgets.collections.bindCollectionLinks = function(container){
    Z.debug("Zotero.ui.bindCollectionLinks", 3);
    
    J(container).on('click', "div.folder-toggle", function(e){
        e.preventDefault();
        J(this).siblings('.collection-select-link').click();
        return false;
    });
    
    J(container).on('click', ".collection-select-link", function(e){
        Z.debug("collection-select-link clicked", 4);
        e.preventDefault();
        var collection, library;
        var collectionKey = J(this).attr('data-collectionkey');
        //if this is the currently selected collection, treat as expando link
        if(J(this).hasClass('current-collection')) {
            var expanded = J('.current-collection').data('expanded');
            if(expanded === true){
                Zotero.ui.widgets.collections.nestHideCollectionTree(J("#collection-list-container"), false);
            }
            else{
                Zotero.ui.widgets.collections.nestHideCollectionTree(J("#collection-list-container"), true);
            }
            
            //go back to items list
            Zotero.state.clearUrlVars(['collectionKey', 'mode']);
            
            //change the mobile page if we didn't just expand a collection
            if( !(Zotero.config.mobile && (Zotero.state.getUrlVar('mode') != 'edit'))){
                Zotero.state.pushState();
            }
            
            //cancel action for expando link behaviour
            return false;
        }
        Zotero.ui.eventful.trigger("selectCollection", {collectionKey: collectionKey});
        
        //Not currently selected collection
        Z.debug("click " + collectionKey, 4);
        Zotero.state.clearUrlVars(['mode']);
        Zotero.state.pathVars['collectionKey'] = collectionKey;
        
        Zotero.state.pushState();
        return false;
    });
    
    J(container).on('click', "a.my-library", function(e){
        e.preventDefault();
        Zotero.state.clearUrlVars(['mode']);
        Zotero.state.pushState();
        return false;
    });
};

//FROM UPDATESTATE.JS
//Rendering Code

/**
 * Nest the collection tree and hide/show appropriate nodes
 * @param  {Dom Element} el             Container element
 * @param  {boolean} expandSelected Show or hide the currently selected collection
 * @return {undefined}
 */
Zotero.ui.widgets.collections.nestHideCollectionTree = function(el, expandSelected){
    Z.debug("nestHideCollectionTree", 3);
    if(typeof expandSelected == 'undefined'){
        expandSelected = true;
    }
    //nest and hide collection tree
    var jel = J(el);
    jel.find("#collection-list ul").hide().siblings(".folder-toggle")
                                        .children(".placeholder")
                                        .addClass('glyphicon')
                                        .addClass("glyphicon-chevron-right");
    jel.find(".current-collection").parents("ul").show();
    jel.find("#collection-list li.current-collection").children('ul').show();
    //start all twisties in closed position
    jel.find(".glyphicon-chevron-down").removeClass("glyphicon-chevron-down").addClass("glyphicon-chevron-right");
    //show opened twisties as expanded
    jel.find("li.current-collection").parentsUntil("#collection-list").children('div.folder-toggle').find(".glyphicon-chevron-right")
                                                .removeClass("glyphicon-chevron-right")
                                                .addClass("glyphicon-chevron-down");
    
    
    if(expandSelected === false){
        jel.find("#collection-list li.current-collection").children('ul').hide();
        jel.find("#collection-list li.current-collection").find(".glyphicon-chevron-down")
                                                    .removeClass("glyphicon-chevron-down")
                                                    .addClass("glyphicon-chevron-right");
        jel.find(".current-collection").data('expanded', false);
    }
    else{
        jel.find("li.current-collection").children('div.folder-toggle').find(".glyphicon-chevron-right")
                                                .removeClass("glyphicon-chevron-right")
                                                .addClass("glyphicon-chevron-down");
                                                
        jel.find(".current-collection").data('expanded', true);
    }
};

/**
 * Highlight the currently selected collection
 * @return {undefined}
 */
Zotero.ui.widgets.collections.highlightCurrentCollection = function(widgetEl){
    Z.debug("Zotero.ui.widgets.collections.highlightCurrentCollection", 3);
    if(!widgetEl){
        widgetEl = J("body");
    }
    var widgetEl = J(widgetEl);
    var collectionKey = Zotero.state.getUrlVar('collectionKey');
    //unhighlight currently highlighted
    widgetEl.find("a.current-collection").closest("li").removeClass("current-collection");
    widgetEl.find("a.current-collection").removeClass("current-collection");
    
    if(collectionKey){
        //has collection selected, highlight it
        widgetEl.find("a[data-collectionKey='" + collectionKey + "']").addClass("current-collection");
        widgetEl.find("a[data-collectionKey='" + collectionKey + "']").closest('li').addClass("current-collection");
    }
    else{
        widgetEl.find("a.my-library").addClass("current-collection");
        widgetEl.find("a.my-library").closest('li').addClass("current-collection");
    }
};

