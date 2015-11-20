Zotero.ui.widgets.chooseLibraryDialog = {};

Zotero.ui.widgets.chooseLibraryDialog.init = function(el){
    Z.debug("chooselibrarydialog widget init", 3);
    var library = Zotero.ui.getAssociatedLibrary(el);
    
    library.listen("chooseLibrary", Zotero.ui.widgets.chooseLibraryDialog.show, {widgetEl: el});
};

Zotero.ui.widgets.chooseLibraryDialog.show = function(e){
    Z.debug("chooseLibraryDialog.show", 3);
    
    var triggeringEl = J(e.triggeringElement);
    var library = Zotero.ui.getAssociatedLibrary(triggeringEl);
    var ncollections = library.collections.nestedOrderingArray();
    
    var widgetEl = J(e.data['widgetEl']).empty();
    widgetEl( J("#addtocollectiondialogTemplate").render({ncollections:ncollections}) );
    var dialogEl = widgetEl.find(".add-to-collection-dialog");
    
    var addToFunction = J.proxy(function(){
        Z.debug("add-to-collection-select changed", 3);
        var targetCollection = dialogEl.find(".target-collection").val();
        Z.debug("move to: " + targetCollection, 4);
        Zotero.ui.addToCollection(targetCollection, library);
        Zotero.ui.closeDialog(dialogEl);
        return false;
    }, this);
    
    dialogEl.find(".addButton").on('click', addToFunction);
    
    Zotero.ui.dialog(dialogEl, {});
    return false;
};

Zotero.ui.widgets.chooseLibraryDialog.getAccessibleLibraries = function() {
    //TODO: everything
    //just need to fetch userGroups for key, and see if there is write access
};

