Zotero.ui.widgets.chooseSortingDialog = {};

Zotero.ui.widgets.chooseSortingDialog.init = function(el){
    Z.debug("chooseSortingDialog widget init", 3);
    var library = Zotero.ui.getAssociatedLibrary(el);
    
    library.listen("chooseSortingDialog", Zotero.ui.widgets.chooseSortingDialog.show, {widgetEl: el});
};

Zotero.ui.widgets.chooseSortingDialog.show = function(evt){
    Z.debug("chooseSortingDialog.show", 3);
    var widgetEl = J(evt.data.widgetEl).empty();
    var library = Zotero.ui.getAssociatedLibrary(widgetEl);
    
    widgetEl.html( J("#choosesortingdialogTemplate").render({}) );
    var dialogEl = widgetEl.find(".choose-sorting-dialog");
    
    var currentSortField = Zotero.ui.getPrioritizedVariable('order', 'title');
    var currentSortOrder = Zotero.ui.getPrioritizedVariable('sort', 'asc');
    
    dialogEl.find(".sort-column-select").val(currentSortField);
    dialogEl.find(".sort-order-select").val(currentSortOrder);
    
    var saveFunction = function(){
        var newSortField = dialogEl.find(".sort-column-select").val();
        var newSortOrder = dialogEl.find(".sort-order-select").val();
        library.trigger("changeItemSorting", {newSortField:newSortField, newSortOrder:newSortOrder});
        Zotero.ui.closeDialog(dialogEl);
        return false;
    };
    
    dialogEl.find(".saveSortButton").on('click', saveFunction);
    Zotero.ui.dialog(dialogEl, {});
};

