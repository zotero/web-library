Zotero.ui.widgets.exportItemsDialog = {};

Zotero.ui.widgets.exportItemsDialog.init = function(el){
    Z.debug("exportItemDialog widget init", 3);
    Zotero.ui.eventful.listen("exportItemsDialog", Zotero.ui.widgets.exportItemsDialog.show, {widgetEl: el});
    Zotero.ui.eventful.listen("displayedItemsChanged", Zotero.ui.widgets.exportItemsDialog.updateExportLinks, {widgetEl: el});
};

Zotero.ui.widgets.exportItemsDialog.show = function(e){
    Z.debug("exportitemdialog.show", 3);
    var triggeringEl = J(e.triggeringElement);
    var library = Zotero.ui.getAssociatedLibrary(triggeringEl);
    var widgetEl = J(e.data['widgetEl']).empty();
    widgetEl.html( J("#exportitemsdialogTemplate").render({}) );
    var dialogEl = widgetEl.find(".export-items-dialog");
    
    //get library and build dialog
    dialogEl.find(".modal-body").empty().append(widgetEl.find(".export-list").contents().clone() );
    
    Zotero.ui.dialog(dialogEl, {});
    
    return false;
};

Zotero.ui.widgets.exportItemsDialog.updateExportLinks = function(e){
    //get list of export urls and link them
    var triggeringEl = J(e.triggeringElement);
    var library = Zotero.ui.getAssociatedLibrary(triggeringEl);
    var widgetEl = J(e.data['widgetEl']);
    
    var urlconfig = Zotero.ui.getItemsConfig(library);
    
    var exportUrls = Zotero.url.exportUrls(urlconfig);
    widgetEl.find(".export-list").empty().append( J("#exportformatsTemplate").render({exportUrls:exportUrls}) );
    widgetEl.find(".export-list").data('urlconfig', urlconfig);
    //hide export list until requested
    widgetEl.find(".export-list").hide();
};
