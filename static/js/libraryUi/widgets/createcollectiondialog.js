Zotero.ui.widgets.createCollectionDialog = {};

Zotero.ui.widgets.createCollectionDialog.init = function(el){
    Z.debug("createcollectionsdialog widget init", 3);
    Zotero.ui.eventful.listen("createCollectionDialog", Zotero.ui.widgets.createCollectionDialog.show, {widgetEl: el});
};

Zotero.ui.widgets.createCollectionDialog.show = function(evt){
    Z.debug("createCollectionDialog.show", 3);
    
    var triggeringEl = J(evt.triggeringElement);
    var library = Zotero.ui.getAssociatedLibrary(triggeringEl);
    var ncollections = library.collections.nestedOrderingArray();
    var widgetEl = J(evt.data.widgetEl).empty();
    
    widgetEl.html( J("#createcollectiondialogTemplate").render({ncollections:ncollections}) );
    var dialogEl = widgetEl.find(".create-collection-dialog");
    
    var currentCollectionKey = Zotero.state.getUrlVar('collectionKey');
    dialogEl.find(".new-collection-parent").val(currentCollectionKey);
    
    var createFunction = function(){
        var newCollection = new Zotero.Collection();
        newCollection.parentCollectionKey = dialogEl.find(".new-collection-parent").val();
        newCollection.name = dialogEl.find("input.new-collection-title-input").val() || "Untitled";
        
        library.addCollection(newCollection)
        .then(function(){
            library.collections.dirty = true;
            Zotero.state.pushState(true);
            Zotero.ui.closeDialog(widgetEl.find(".create-collection-dialog"));
        });
    };
    
    dialogEl.find(".createButton").on('click', createFunction);
    Zotero.ui.dialog(dialogEl, {});
};

