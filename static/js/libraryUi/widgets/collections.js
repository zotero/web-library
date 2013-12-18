Zotero.ui.widgets.collections = {};

Zotero.ui.widgets.collections.init = function(el){
    Z.debug("collections widget init", 3);
    
    Zotero.ui.eventful.listen("collectionsDirty", Zotero.ui.widgets.collections.syncCollectionsCallback, {widgetEl: el});
    Zotero.ui.eventful.listen("syncCollections", Zotero.ui.widgets.collections.syncCollectionsCallback, {widgetEl: el});
    Zotero.ui.eventful.listen("syncLibrary", Zotero.ui.widgets.collections.syncCollectionsCallback, {widgetEl: el});
    Zotero.ui.eventful.listen("libraryCollectionsUpdated", Zotero.ui.widgets.collections.rerenderCollections, {widgetEl: el});
    Zotero.ui.eventful.listen("selectCollection", Zotero.ui.widgets.collections.selectCollection, {widgetEl: el});
    Zotero.ui.eventful.listen("selectedCollectionChanged", Zotero.ui.widgets.collections.updateSelectedCollection, {widgetEl: el});
    
    Zotero.ui.eventful.listen("cachedDataLoaded", Zotero.ui.widgets.collections.syncCollectionsCallback, {widgetEl: el});

    //Zotero.ui.eventful.trigger("collectionsDirty");
    Zotero.ui.bindCollectionLinks();
};

Zotero.ui.widgets.collections.updateCollectionButtons = function(el){
    Zotero.ui.updateCollectionButtons(el);
};

Zotero.ui.widgets.collections.rerenderCollections = function(event){
    Zotero.debug("Zotero eventful rerenderCollections");
    var widgetEl = event.data.widgetEl;
    var el = widgetEl;
    var jel = J(el);
    
    var library = Zotero.ui.getAssociatedLibrary(el);
    Z.debug(library);
    library.collections.collectionsArray.sort(library.collections.sortByTitleCompare);
    var collectionListEl = jel.find('#collection-list-container');
    collectionListEl.empty();
    Z.debug("Collections count: " + library.collections.collectionsArray.length);
    Zotero.ui.renderCollectionList(collectionListEl, library.collections);
    Zotero.ui.eventful.trigger("selectedCollectionChanged");
};

Zotero.ui.widgets.collections.selectCollection = function(event){
    
};

Zotero.ui.widgets.collections.updateSelectedCollection = function(event){
    Zotero.debug("Zotero eventful updateSelectedCollection");
    var widgetEl = event.data.widgetEl;
    var el = widgetEl;
    var jel = J(el);
    
    var collectionListEl = jel.find('.collection-list-container');
    Zotero.ui.highlightCurrentCollection(widgetEl);
    Zotero.ui.nestHideCollectionTree(collectionListEl);
    Zotero.ui.updateCollectionButtons(widgetEl);
    return;
};

Zotero.ui.widgets.collections.syncCollectionsCallback = function(event) {
    Zotero.debug("Zotero eventful syncCollectionsCallback");
    var widgetEl = event.data.widgetEl;
    var el = widgetEl;
    var jel = J(el);
    
    //get Zotero.Library object if already bound to element
    var library = Zotero.ui.getAssociatedLibrary(el);
    
    //sync collections if loaded from cache but not synced
    if(library.collections.loaded && (!library.collections.synced)){
        Z.debug("collections loaded but not synced - loading updated", 1);
        var syncD = library.loadUpdatedCollections();
        syncD.done(J.proxy(function(){
            Zotero.nav.doneLoading(el);
            Zotero.ui.eventful.trigger("libraryCollectionsUpdated");
        }, this) );
        syncD.fail(J.proxy(function(){
            //sync failed, but we already had some data, so show that
            Zotero.ui.eventful.trigger("libraryCollectionsUpdated");
        }));
        return;
    }
    else if(library.collections.loaded){
        Zotero.ui.eventful.trigger("libraryCollectionsUpdated");
        return;
    }

    //if no cached or loaded data, load collections from the api
    var d = library.loadCollections();
    d.done(J.proxy(function(){
        Zotero.nav.doneLoading(el);
        jel.data('loaded', true);
        Zotero.ui.eventful.trigger("libraryCollectionsUpdated");
        Zotero.nav.doneLoading(el);
    }, this));
    
    d.fail(J.proxy(function(jqxhr, textStatus, errorThrown){
        Z.debug("FAILED SYNC COLLECTIONS REQUEST");
        var elementMessage = Zotero.ui.ajaxErrorMessage(jqxhr);
        jel.html("<p>" + elementMessage + "</p>");
        //Zotero.ui.eventful.trigger("libraryCollectionsUpdated");
    }));
    
    return;
};

/**
 * jQueryUI version of updateCollectionButtons
 * Update enabled/disabled for collection buttons based on context
 * @return {undefined}
 */
Zotero.ui.updateCollectionButtons = function(el){
    if(Zotero.config.jqueryui === false){
        if(!el){
            el = J("body");
        }
        jel = J(el);
        
        //enable modify and delete only if collection is selected
        if(Zotero.nav.getUrlVar("collectionKey")){
            jel.find(".update-collection-button").removeClass('disabled');
            jel.find(".delete-collection-button").removeClass('disabled');
        }
        else{
            jel.find(".update-collection-button").addClass('disabled');
            jel.find(".delete-collection-button").addClass('disabled');
        }
    }
    else {
        var editCollectionsButtonsList = J(".edit-collections-buttons-list");
        editCollectionsButtonsList.buttonset().show();
        
        //enable modify and delete only if collection is selected
        J("#edit-collections-buttons-div").buttonset();
        
        J(".create-collection-link").button('option', 'icons', {primary:'sprite-toolbar-collection-add'}).button('option', 'text', false);
        J(".update-collection-link").button('option', 'icons', {primary:'sprite-toolbar-collection-edit'}).button('option', 'text', false);
        J(".delete-collection-link").button('option', 'icons', {primary:'sprite-folder_delete'}).button('option', 'text', false);
        
        if(Zotero.nav.getUrlVar("collectionKey")){
            J(".update-collection-link").button('enable');
            J(".delete-collection-link").button('enable');
        }
        else{
            J(".update-collection-link").button().button('disable');
            J(".delete-collection-link").button().button('disable');
        }
    }
};

//generate the full html for the nested collections list
/**
 * generate the full html for the nested collections list
 * @param  {Dom Element} el          Element to display collections in
 * @param  {Zotero_Collections} collections Zotero_Collections to display
 * @return {undefined}
 */
Zotero.ui.renderCollectionList = function(el, collections){
    Z.debug("Zotero.ui.renderCollectionList", 1);
    Z.debug("library Identifier " + collections.libraryUrlIdentifier, 1);
    var jel = J(el);
    var currentCollectionKey = Zotero.nav.getUrlVar('collectionKey') || '';
    var trash = collections.owningLibrary.libraryType == 'user' ? true : false;
    //var ncollections = collections.nestedOrderingArray();
    jel.append( J('#collectionlistTemplate').render({collections:collections.collectionsArray,
                                        libUrlIdentifier:collections.libraryUrlIdentifier,
                                        currentCollectionKey: currentCollectionKey,
                                        trash: trash
                                        //ncollections: ncollections
                                    }
                                    ) );
    
    
    Zotero.ui.createOnActivePage(el);
    
};


/**
 * Bind collection links to take appropriate action instead of following link
 * @return {boolean}
 */
Zotero.ui.bindCollectionLinks = function(){
    Z.debug("Zotero.ui.bindCollectionLinks", 3);
    
    J("#collection-list-div").on('click', "div.folder-toggle", function(e){
        e.preventDefault();
        J(this).siblings('.collection-select-link').click();
        return false;
    });
    
    J("#collection-list-div").on('click', ".collection-select-link", function(e){
        Z.debug("collection-select-link clicked", 4);
        e.preventDefault();
        var collection, library;
        var collectionKey = J(this).attr('data-collectionkey');
        //if this is the currently selected collection, treat as expando link
        if(J(this).hasClass('current-collection')) {
            var expanded = J('.current-collection').data('expanded');
            if(expanded === true){
                Zotero.ui.nestHideCollectionTree(J("#collection-list-container"), false);
            }
            else{
                Zotero.ui.nestHideCollectionTree(J("#collection-list-container"), true);
            }
            
            //go back to items list
            Zotero.nav.clearUrlVars(['collectionKey', 'mode']);
            
            //change the mobile page if we didn't just expand a collection
            if( !(Zotero.config.mobile && (Zotero.nav.getUrlVar('mode') != 'edit'))){
                Zotero.nav.pushState();
            }
            
            //cancel action for expando link behaviour
            return false;
        }
        Zotero.ui.eventful.trigger("selectCollection", {collectionKey: collectionKey});
        
        //Not currently selected collection
        Z.debug("click " + collectionKey, 4);
        Zotero.nav.clearUrlVars(['mode']);
        Zotero.nav.urlvars.pathVars['collectionKey'] = collectionKey;
        
        Zotero.nav.pushState();
        return false;
    });

    J("#collection-list-div").on('click', "a.my-library", function(e){
        e.preventDefault();
        Zotero.nav.clearUrlVars(['mode']);
        if(Zotero.config.mobile){
            Zotero.ui.mobile.changePage("#library-items-page", {'changeHash':false});
        }
        
        Zotero.nav.pushState();
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
Zotero.ui.nestHideCollectionTree = function(el, expandSelected){
    Z.debug("nestHideCollectionTree");
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
    
    Zotero.ui.createOnActivePage(el);
};

/**
 * Highlight the currently selected collection
 * @return {undefined}
 */
Zotero.ui.highlightCurrentCollection = function(el){
    Z.debug("Zotero.ui.highlightCurrentCollection", 3);
    if(!el){
        el = J("body");
    }
    var jel = J(el);
    var collectionKey = Zotero.nav.getUrlVar('collectionKey');
    //unhighlight currently highlighted
    jel.find("a.current-collection").closest("li").removeClass("current-collection");
    jel.find("a.current-collection").removeClass("current-collection");
    
    if(collectionKey){
        //has collection selected, highlight it
        jel.find("a[data-collectionKey='" + collectionKey + "']").addClass("current-collection");
        jel.find("a[data-collectionKey='" + collectionKey + "']").closest('li').addClass("current-collection");
    }
    else{
        jel.find("a.my-library").addClass("current-collection");
        jel.find("a.my-library").closest('li').addClass("current-collection");
    }
};

