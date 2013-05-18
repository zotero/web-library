Zotero.ui.widgets.createCollectionDialog = {};

Zotero.ui.widgets.createCollectionDialog.init = function(el){
    Z.debug("createcollectionsdialog widget init", 3);
    Zotero.ui.eventful.listen("createCollection", Zotero.ui.widgets.createCollectionDialog.show, {widgetEl: el});
};

Zotero.ui.widgets.createCollectionDialog.show = function(e){
    Z.debug("createCollectionDialog.show", 3);
    
    var triggeringEl = J(e.triggeringElement);
    var library = Zotero.ui.getAssociatedLibrary(triggeringEl);
    var ncollections = library.collections.nestedOrderingArray();
    
    var widgetEl = J(e.data['widgetEl']).empty();
    
    J("#newcollectiondialogTemplate").tmpl({ncollections:ncollections}).appendTo(widgetEl);
    var dialogEl = widgetEl.find(".create-collection-dialog");
    
    var currentCollectionKey = Zotero.nav.getUrlVar('collectionKey');
    dialogEl.find(".new-collection-parent").val(currentCollectionKey);
    
    var createFunction = J.proxy(function(){
        var newCollection = new Zotero.Collection();
        newCollection.parentCollectionKey = dialogEl.find(".new-collection-parent").val();
        newCollection.name = dialogEl.find("input.new-collection-title-input").val() || "Untitled";
        
        var d = library.addCollection(newCollection);
        d.done(J.proxy(function(){
            library.collections.dirty = true;
            Zotero.nav.pushState(true);
        }, this));
        Zotero.ui.closeDialog(widgetEl.find(".create-collection-dialog"));
    },this);
    
    dialogEl.find(".createButton").on('click', createFunction);
    Zotero.ui.dialog(widgetEl.find('.create-collection-dialog'), {});
    return false;
};

