//Bootstrap version
Zotero.ui.dialog = function(el, options){
    Z.debug("Zotero.ui.dialog", 3);
    options.show = true;
    options.backdrop = false;
    J(el).modal(options);
    J(el).modal('show');
    Z.debug("exiting Zotero.ui.dialog", 3);
};

Zotero.ui.closeDialog = function(el){
    J(el).modal('hide');
};

Zotero.ui.callbacks.createCollection = function(e){
    Z.debug("create-collection-link clicked", 3);
    var library = Zotero.ui.getAssociatedLibrary(J(this).closest(".ajaxload"));
    var ncollections = library.collections.nestedOrderingArray();
    var dialogEl = J("#create-collection-dialog");
    J("#newcollectiondialogTemplate").tmpl({ncollections:ncollections}).replaceAll(dialogEl);
    
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
    
    dialogEl.find(".createButton").on('click', createFunction);
    Zotero.ui.dialog(J('#create-collection-dialog'), {});
    return false;
};

Zotero.ui.callbacks.updateCollection =  function(e){
    Z.debug("update-collection-link clicked", 3);
    e.preventDefault();
    e.stopImmediatePropagation();
    
    var library = Zotero.ui.getAssociatedLibrary(J(this).closest(".ajaxload"));
    var ncollections = library.collections.nestedOrderingArray();
    var dialogEl = J("#update-collection-dialog");
    J("#updatecollectiondialogTemplate").tmpl({ncollections:ncollections}).replaceAll(dialogEl);
    
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
            Zotero.ui.closeDialog(J("#update-collection-dialog"));
        }, this));
        Zotero.ui.closeDialog(J("#update-collection-dialog"));
    }, this);
    
    J("#update-collection-dialog .updateButton").on('click', saveFunction);
    Zotero.ui.dialog(J("#update-collection-dialog"),{});
    J("#updated-collection-title-input").select();
    
    return false;
};

Zotero.ui.callbacks.deleteCollection =  function(e){
    Z.debug("delete-collection-link clicked", 3);
    e.preventDefault();
    e.stopImmediatePropagation();
    
    var library = Zotero.ui.getAssociatedLibrary(J(this).closest(".ajaxload"));
    var currentCollectionKey = Zotero.nav.getUrlVar('collectionKey');
    var currentCollection = library.collections.getCollection(currentCollectionKey);
    var dialogEl = J("#delete-collection-dialog").empty();
    J("#deletecollectiondialogTemplate").tmpl({collection:currentCollection}).replaceAll(dialogEl);
    
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
    
    dialogEl.find(".deleteButton").on('click', deleteFunction);
    Zotero.ui.dialog(J("#delete-collection-dialog"), {});
    
    return false;
};

Zotero.ui.callbacks.citeItems = function(e){
    Z.debug("cite-item-link clicked", 3);
    e.preventDefault();
    
    //get library and build dialog
    var library = Zotero.ui.getAssociatedLibrary();
    var dialogEl = J("#cite-item-dialog");
    J("#citeitemdialogTemplate").tmpl({}).replaceAll(dialogEl);
    
    var citeFunction = function(){
        Z.debug("citeFunction", 3);
        Zotero.ui.showSpinner(J("#cite-box-div"));
        
        var style = J("#cite-item-select").val();
        Z.debug(style, 4);
        var itemKeys = Zotero.ui.getSelectedItemKeys(J("#edit-mode-items-form"));
        if(itemKeys.length === 0){
            itemKeys = Zotero.ui.getAllFormItemKeys(J("#edit-mode-items-form"));
        }
        Z.debug(itemKeys, 4);
        var d = library.loadFullBib(itemKeys, style);
        d.done(function(bibContent){
            J("#cite-box-div").html(bibContent);
        });
    };
    
    J("#cite-item-select").on('change', citeFunction);
    
    Zotero.ui.dialog(J("#cite-item-dialog"), {});
    
    return false;
};

Zotero.ui.callbacks.showExportDialog = function(e){
    Z.debug("export-link clicked", 3);
    //get library and build dialog
    var library = Zotero.ui.getAssociatedLibrary(J("#feed-link-div"));
    var dialogEl = J("#export-dialog");
    J("#export-dialog").empty().append(J("#export-list").contents().clone() );
    
    Zotero.ui.dialog(J("#export-dialog"), {});
    
    return false;
};

Zotero.ui.callbacks.addToCollection =  function(e){
    Z.debug("add-to-collection-link clicked", 3);
    e.preventDefault();
    var library = Zotero.ui.getAssociatedLibrary();
    var dialogEl = J("#add-to-collection-dialog").empty();
    Z.debug(library.collections.ncollections, 4);
    J("#addtocollectiondialogTemplate").tmpl({ncollections:library.collections.nestedOrderingArray()}).replaceAll(dialogEl);
    
    var addToFunction = J.proxy(function(){
        Z.debug("add-to-collection-select changed", 3);
        var targetCollection = J("#target-collection").val();
        Z.debug("move to: " + targetCollection, 4);
        Zotero.ui.addToCollection(targetCollection, library);
        Zotero.ui.closeDialog(J("#add-to-collection-dialog"));
        return false;
    }, this);
    
    J("#add-to-collection-dialog .addButton").on('click', addToFunction);
    
    Zotero.ui.dialog(J("#add-to-collection-dialog"), {});
    return false;
};

Zotero.ui.callbacks.librarySettings = function(e){
    Z.debug("library-settings-link clicked", 3);
    e.preventDefault();
    var dialogEl = J("#library-settings-dialog");
    J("#librarysettingsdialogTemplate").tmpl({'columnFields':Zotero.Library.prototype.displayableColumns}).replaceAll(dialogEl);
    
    J("#display-column-field-title").prop('checked', true).prop('disabled', true);
    J.each(Zotero.prefs.library_listShowFields, function(index, value){
        var idstring = '#display-column-field-' + value;
        J(idstring).prop('checked', true);
    });
    
    var submitFunction = J.proxy(function(){
        var showFields = [];
        J("#library-settings-form").find('input:checked').each(function(){
            showFields.push(J(this).val());
        });
        
        Zotero.utils.setUserPref('library_listShowFields', showFields);
        Zotero.prefs.library_listShowFields = showFields;
        Zotero.callbacks.loadItems(J("#library-items-div"));
        
        Zotero.ui.closeDialog(J("#library-settings-dialog"));
    }, this);
    
    dialogEl.find("saveButton").on("click", submitFunction);
    Zotero.ui.dialog(J("#library-settings-dialog"), {});
};
