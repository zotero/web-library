Zotero.ui.widgets.collections = {};

Zotero.ui.widgets.collections.init = function(el){
    Z.debug("Zotero.eventful.init.syncCollections", 3);
    
    Zotero.ui.eventful.listen("collectionsDirty", Zotero.ui.widgets.collections.syncCollectionsCallback, {widgetEl: el});
    Zotero.ui.eventful.listen("libraryCollectionsUpdated", Zotero.ui.widgets.collections.rerenderCollections, {widgetEl: el});
    Zotero.ui.eventful.listen("selectedCollectionChanged", Zotero.ui.widgets.collections.updateSelectedCollection, {widgetEl: el});
    
    Zotero.ui.eventful.trigger("collectionsDirty");
};

Zotero.ui.widgets.collections.updateCollectionButtons = function(){
    Zotero.ui.updateCollectionButtons();
};

Zotero.ui.widgets.collections.rerenderCollections = function(event){
    Zotero.debug("Zotero eventful rerenderCollections");
    var widgetEl = event.data.widgetEl;
    var el = widgetEl;
    var jel = J(el);
    
    var library = Zotero.ui.getAssociatedLibrary(el);
    var clist = jel.find('#collection-list-container');
    clist.empty();
    Zotero.ui.displayCollections(clist, library.collections);
    Zotero.ui.eventful.trigger("selectedCollectionChanged");
};

Zotero.ui.widgets.collections.updateSelectedCollection = function(event){
    Zotero.debug("Zotero eventful updateSelectedCollection");
    var widgetEl = event.data.widgetEl;
    var el = widgetEl;
    var jel = J(el);
    
    var clist = jel.find('#collection-list-container');
    Zotero.ui.highlightCurrentCollection();
    Zotero.ui.nestHideCollectionTree(clist);
    Zotero.ui.updateCollectionButtons();
    return;
};

Zotero.ui.widgets.collections.syncCollectionsCallback = function(event) {
    Zotero.debug("Zotero eventful syncCollectionsCallback");
    var widgetEl = event.data.widgetEl;
    var el = widgetEl;
    
    Zotero.nav.flagLoading(el);
    var jel = J(el);
    
    //get Zotero.Library object if already bound to element
    var library = Zotero.ui.getAssociatedLibrary(el);
    var clist = jel.find('#collection-list-container');
    
    //perform actions that should always happen on pushStates
    Zotero.ui.updateCollectionButtons();
    
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
Zotero.ui.updateCollectionButtons = function(){
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
};

/**
 * launch delete collection dialog when delete-collection-link clicked
 * default to currently selected collection, but allow switch before delete
 * @param  {event} e click event
 * @return {boolean}
 */
Zotero.ui.callbacks.deleteCollection =  function(e){
    Z.debug("delete-collection-link clicked", 3);
    e.preventDefault();
    e.stopImmediatePropagation();
    
    var library = Zotero.ui.getAssociatedLibrary(J(this).closest(".ajaxload"));
    var currentCollectionKey = Zotero.nav.getUrlVar('collectionKey');
    var currentCollection = library.collections.getCollection(currentCollectionKey);
    var dialogEl = J("#delete-collection-dialog").empty();
    
    J("#delete-collection-dialog").empty().append("");
    if(Zotero.config.mobile){
        J("#deletecollectionformTemplate").tmpl({collection:currentCollection}).replaceAll(dialogEl);
    }
    else{
        J("#deletecollectionformTemplate").tmpl({collection:currentCollection}).appendTo(dialogEl);
    }
    
    J("#delete-collection-select").val(currentCollectionKey);
    
    var deleteFunction = J.proxy(function(){
        Z.debug("Zotero.ui.deleteSelectedCollection", 3);
        var collection = currentCollection;
        if(!collection){
            Zotero.ui.jsNotificationMessage("Selected collection not found", 'error');
            return false;
        }
        var d = collection.remove();
        //var d = library.addCollection(newCollectionTitle, selectedCollectionKey);
        d.done(J.proxy(function(){
            //delete Zotero.nav.urlvars.pathVars['mode'];
            delete Zotero.nav.urlvars.pathVars['collectionKey'];
            library.collections.dirty = true;
            Zotero.nav.pushState();
            Zotero.ui.jsNotificationMessage(collection.title + " removed", 'confirm');
        }, this));
        
        Zotero.ui.closeDialog(J("#delete-collection-dialog"));
        return false;
    }, this);
    
    Zotero.ui.dialog(J("#delete-collection-dialog"), {
        modal:true,
        minWidth: 300,
        draggable: false,
        buttons: {
            'Delete': deleteFunction,
            'Cancel': function(){
                Zotero.ui.closeDialog(J("#delete-collection-dialog"));
            }
        }
    });
    
    return false;
};

//generate the full html for the nested collections list
/**
 * generate the full html for the nested collections list
 * @param  {Dom Element} el          Element to display collections in
 * @param  {Zotero_Collections} collections Zotero_Collections to display
 * @return {undefined}
 */
Zotero.ui.displayCollections = function(el, collections){
    Z.debug("Zotero.ui.displayCollections", 3);
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
                    //Zotero.ui.mobile.changePage('#library-items-page');
                    //Zotero.ui.mobile.changePage("#library-items-page", {'changeHash':false}, false);
                    //J("#library-items-page").trigger('create');
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
        
        //url changes done, push state now
        //Zotero.nav.pushState();
        
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


/**
 * Add selected items to collection
 * @param {string} collectionKey collectionKey of collection items will be added to
 * @param {Zotero_Library} library       Zotero library to operate on
 */
Zotero.ui.addToCollection = function(collectionKey, library){
    Z.debug("add-to-collection clicked", 3);
    var itemKeys = Zotero.ui.getSelectedItemKeys(J("#edit-mode-items-form"));
    //var library = Zotero.ui.getAssociatedLibrary(J(this).closest('div.ajaxload'));
    if(!collectionKey){
        Zotero.ui.jsNotificationMessage("No collection selected", 'error');
        return false;
    }
    if(itemKeys.length === 0){
        Zotero.ui.jsNotificationMessage("No items selected", 'notice');
        return false;
    }
    Z.debug(itemKeys, 4);
    Z.debug(collectionKey, 4);
    var response = library.collections.getCollection(collectionKey).addItems(itemKeys);
    library.dirty = true;
    J.when(response).then(function(){
        //Zotero.nav.forceReload = true;//delete Zotero.nav.urlvars.pathVars['mode'];
        Zotero.nav.pushState(true);
    });
    return false;
};

/**
 * Launch create collection dialog when create-collection-link clicked
 * Default to current collection as parent of new collection, but allow change
 * @param  {event} e click even
 * @return {boolean}
 */
Zotero.ui.callbacks.createCollection = function(e){
    Z.debug("create-collection-link clicked", 3);
    Z.debug(J(this));
    var library = Zotero.ui.getAssociatedLibrary(J(this).closest(".ajaxload"));
    var ncollections = library.collections.nestedOrderingArray();
    var dialogEl = J("#create-collection-dialog").empty();
    if(Zotero.config.mobile){
        J("#newcollectionformTemplate").tmpl({ncollections:ncollections}).replaceAll(dialogEl);
    }
    else{
        J("#newcollectionformTemplate").tmpl({ncollections:ncollections}).appendTo(dialogEl);
    }
    
    var currentCollectionKey = Zotero.nav.getUrlVar('collectionKey');
    J("#new-collection-parent").val(currentCollectionKey);
    
    var createFunction = J.proxy(function(){
        var newCollection = new Zotero.Collection();
        newCollection.parentCollectionKey = J("#new-collection-parent").val();
        newCollection.name = J("input#new-collection-title-input").val() || "Untitled";
        
        var library = Zotero.ui.getAssociatedLibrary(J(this).closest('div.ajaxload'));
        
        //var d = library.addCollection(newCollectionTitle, parentCollectionKey);
        var d = library.addCollection(newCollection);
        d.done(J.proxy(function(){
            //Zotero.nav.forceReload = true;//delete Zotero.nav.urlvars.pathVars['mode'];
            library.collections.dirty = true;
            Zotero.nav.pushState(true);
        }, this));
        Zotero.ui.closeDialog(J("#create-collection-dialog"));
    },this);
    
    Zotero.ui.dialog(J('#create-collection-dialog'), {
        modal:true,
        minWidth: 300,
        draggable: false,
        buttons: {
            'Create': createFunction,
            'Cancel': function(){
                Zotero.ui.closeDialog(J("#create-collection-dialog"));
            }
        }
    });
    
    var width = J("#new-collection-parent").width() + 50;
    J("#create-collection-dialog").dialog('option', 'width', width);
    return false;
};

/**
 * Launch edit collection dialog when update-collection-link clicked
 * @param  {event} e click event
 * @return {boolean}
 */
Zotero.ui.callbacks.updateCollection =  function(e){
    Z.debug("update-collection-link clicked", 3);
    e.preventDefault();
    e.stopImmediatePropagation();
    
    var library = Zotero.ui.getAssociatedLibrary(J(this).closest(".ajaxload"));
    var ncollections = library.collections.nestedOrderingArray();
    var dialogEl = J("#modify-collection-dialog").empty();
    
    if(Zotero.config.mobile){
        J("#updatecollectionformTemplate").tmpl({ncollections:ncollections}).replaceAll(dialogEl);
    }
    else{
        J("#updatecollectionformTemplate").tmpl({ncollections:ncollections}).appendTo(dialogEl);
    }
    
    var currentCollectionKey = Zotero.nav.getUrlVar('collectionKey');
    var currentCollection = library.collections.getCollection(currentCollectionKey);
    var currentParentCollectionKey = currentCollection.parentCollectionKey;
    J("#update-collection-parent-select").val(currentParentCollectionKey);
    J("#updated-collection-title-input").val(currentCollection.get("title"));
    
    var saveFunction = J.proxy(function(){
        var newCollectionTitle = J("input#updated-collection-title-input").val() || "Untitled";
        var newParentCollectionKey = J("#update-collection-parent-select").val();
        
        var collection =  currentCollection;
        if(!collection){
            Zotero.ui.jsNotificationMessage("Selected collection not found", 'error');
            return false;
        }
        var d = collection.update(newCollectionTitle, newParentCollectionKey);
        d.done(J.proxy(function(){
            Zotero.ui.jsNotificationMessage("Collection Saved", 'confirm');
            library.collections.dirty = true;
            Zotero.nav.pushState(true);
            Zotero.ui.closeDialog(J("#modify-collection-dialog"));
        }, this));
        Zotero.ui.closeDialog(J("#modify-collection-dialog"));
    }, this);
    
    Zotero.ui.dialog(J("#modify-collection-dialog"), {
        modal:true,
        minWidth: 300,
        draggable: false,
        buttons: {
            'Save': saveFunction,
            'Cancel': function(){
                Zotero.ui.closeDialog(J("#modify-collection-dialog"));
            }
        }
    });
    
    var width = J("#update-collection-parent-select").width() + 50;
    J("#modify-collection-dialog").dialog('option', 'width', width);
    J("#updated-collection-title-input").select();
    return false;
};



//FROM UPDATESTATE.JS

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
Zotero.ui.highlightCurrentCollection = function(){
    Z.debug("Zotero.ui.highlightCurrentCollection", 3);
    var collectionKey = Zotero.nav.getUrlVar('collectionKey');
    //unhighlight currently highlighted
    J("a.current-collection").closest("li").removeClass("current-collection");
    J("a.current-collection").removeClass("current-collection");
    
    if(collectionKey){
        //has collection selected, highlight it
        J("a[data-collectionKey='" + collectionKey + "']").addClass("current-collection");
        J("a[data-collectionKey='" + collectionKey + "']").closest('li').addClass("current-collection");
    }
    else{
        J("a.my-library").addClass("current-collection");
        J("a.my-library").closest('li').addClass("current-collection");
    }
};

