Zotero.ui.widgets.createItemDialog = {};

Zotero.ui.widgets.createItemDialog.init = function(el){
    Z.debug("createItemDialog widget init", 3);
    var library = Zotero.ui.getAssociatedLibrary(el);
    
    library.listen("newItem", Zotero.ui.widgets.createItemDialog.show, {widgetEl: el});
};

Zotero.ui.widgets.createItemDialog.show = function(evt){
    Z.debug("createItemDialog.show", 3);
    
    var triggeringEl = J(evt.triggeringElement);
    var library = Zotero.ui.getAssociatedLibrary(triggeringEl);
    var widgetEl = J(evt.data.widgetEl).empty();
    var itemType = triggeringEl.data('itemtype');
    var currentCollectionKey = Zotero.state.getUrlVar('collectionKey');
    
    widgetEl.html( J("#createitemdialogTemplate").render({}) );
    var dialogEl = widgetEl.find(".create-item-dialog");
    
    var createFunction = function(){
        var item = new Zotero.Item();
        item.initEmpty(itemType).then(function(){
            item.associateWithLibrary(library);
            var title = dialogEl.find("input.new-item-title-input").val() || "Untitled";
            item.set('title', title);
            if(currentCollectionKey){
                item.addToCollection(currentCollectionKey);
            }
            return Zotero.ui.saveItem(item);
        }).then(function(responses){
            var itemKey = item.get('key');
            Zotero.state.setUrlVar('itemKey', itemKey);
            Zotero.state.pushState();
            Zotero.ui.closeDialog(widgetEl.find(".create-item-dialog"));
        }).catch(function(error){
            Zotero.error(error);
            Zotero.ui.jsNotificationMessage("There was an error creating the item.", "error");
            Zotero.ui.closeDialog(widgetEl.find(".create-item-dialog"));
        });
    };
    
    dialogEl.find(".createButton").on('click', createFunction);
    Zotero.ui.dialog(dialogEl, {});
};

