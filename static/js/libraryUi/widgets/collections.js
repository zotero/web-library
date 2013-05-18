Zotero.ui.widgets.collections = {};

Zotero.ui.widgets.collections.init = function(el){
    Z.debug("collections widget init", 3);
    
    Zotero.ui.eventful.listen("collectionsDirty", Zotero.ui.widgets.collections.syncCollectionsCallback, {widgetEl: el});
    Zotero.ui.eventful.listen("libraryCollectionsUpdated", Zotero.ui.widgets.collections.rerenderCollections, {widgetEl: el});
    Zotero.ui.eventful.listen("selectedCollectionChanged", Zotero.ui.widgets.collections.updateSelectedCollection, {widgetEl: el});
    
    Zotero.ui.eventful.trigger("collectionsDirty");
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
    var collectionListEl = jel.find('#collection-list-container');
    collectionListEl.empty();
    Zotero.ui.renderCollectionList(collectionListEl, library.collections);
    Zotero.ui.eventful.trigger("selectedCollectionChanged");
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
        Z.debug("collections loaded but not synced - loading updated", 3);
        var syncD = library.loadUpdatedCollections();
        syncD.done(J.proxy(function(){
            Zotero.nav.doneLoading(el);
            Zotero.ui.eventful.trigger("libraryCollectionsUpdated");
        }, this) );
        return;
    }
    else if(library.collections.loaded){
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
        var elementMessage = Zotero.ui.ajaxErrorMessage(jqxhr);
        jel.html("<p>" + elementMessage + "</p>");
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
    Z.debug("Zotero.ui.renderCollectionList", 3);
    Z.debug("library Identifier " + collections.libraryUrlIdentifier, 4);
    var jel = J(el);
    var currentCollectionKey = Zotero.nav.getUrlVar('collectionKey') || '';
    var trash = collections.owningLibrary.libraryType == 'user' ? true : false;
    //var ncollections = collections.nestedOrderingArray();
    J.tmpl('collectionlistTemplate', {collections:collections.collectionsArray,
                                        libUrlIdentifier:collections.libraryUrlIdentifier,
                                        currentCollectionKey: currentCollectionKey,
                                        trash: trash
                                        //ncollections: ncollections
                                    }
                                    ).appendTo(jel);
    
    
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
            if(Zotero.config.mobile && (Zotero.nav.getUrlVar('mode') != 'edit')){
                collection = Zotero.ui.getAssociatedLibrary(J(this));
                if(!collection.hasChildren){
                    Z.debug("Changing page to items list because collection has no children", 4);
                }
            }
            else{
                Zotero.nav.pushState();
            }
            
            //cancel action for expando link behaviour
            return false;
        }
        
        //Not currently selected collection
        Z.debug("click " + collectionKey, 4);
        Zotero.nav.clearUrlVars(['mode']);
        Zotero.nav.urlvars.pathVars['collectionKey'] = collectionKey;
        
        //change the mobile page if we didn't just expand a collection
        Z.debug("change mobile page if we didn't just expand a collection", 4);
        Z.debug(J(this), 4);
        if(Zotero.config.mobile){
            Z.debug("is mobile", 4);
            library = Zotero.ui.getAssociatedLibrary(J(this).closest('.ajaxload'));
            collection = library.collections.getCollection(collectionKey);
            if(!collection.hasChildren && (Zotero.nav.getUrlVar('mode') != 'edit')) {
                Z.debug("Changing page to items list because collection has no children", 4);
                //Zotero.ui.mobile.changePage('#library-items-page');
                Zotero.ui.mobile.changePage("#library-items-page", {'changeHash':false});
                //J("#library-items-page").trigger('create');
            }
            else{
                Zotero.nav.pushState();
            }
        }
        else{
            Zotero.nav.pushState();
        }
        
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
                                        .children(".sprite-placeholder")
                                        .removeClass("sprite-placeholder")
                                        .addClass("ui-icon-triangle-1-e");
    jel.find(".current-collection").parents("ul").show();
    jel.find("#collection-list li.current-collection").children('ul').show();
    //start all twisties in closed position
    jel.find(".ui-icon-triangle-1-s").removeClass("ui-icon-triangle-1-s").addClass("ui-icon-triangle-1-e");
    //show opened twisties as expanded
    jel.find("li.current-collection").parentsUntil("#collection-list").children('div.folder-toggle').find(".ui-icon-triangle-1-e")
                                                .removeClass("ui-icon-triangle-1-e")
                                                .addClass("ui-icon-triangle-1-s");
    
    
    if(expandSelected === false){
        jel.find("#collection-list li.current-collection").children('ul').hide();
        jel.find("#collection-list li.current-collection").find(".ui-icon-triangle-1-s")
                                                    .removeClass("ui-icon-triangle-1-s")
                                                    .addClass("ui-icon-triangle-1-e");
        jel.find(".current-collection").data('expanded', false);
    }
    else{
        jel.find("li.current-collection").children('div.folder-toggle').find(".ui-icon-triangle-1-e")
                                                .removeClass("ui-icon-triangle-1-e")
                                                .addClass("ui-icon-triangle-1-s");
                                                
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

