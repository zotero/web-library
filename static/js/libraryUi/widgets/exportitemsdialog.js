Zotero.ui.widgets.exportItemsDialog = {};

Zotero.ui.widgets.exportItemsDialog.init = function(el){
    Z.debug("exportItemDialog widget init", 3);
    var library = Zotero.ui.getAssociatedLibrary(el);
    
    library.listen("exportItemsDialog", Zotero.ui.widgets.exportItemsDialog.show, {widgetEl: el});
    library.listen("displayedItemsChanged", Zotero.ui.widgets.exportItemsDialog.updateExportLinks, {widgetEl: el});
};

Zotero.ui.widgets.exportItemsDialog.show = function(evt){
    Z.debug("exportitemdialog.show", 3);
    var triggeringEl = J(evt.triggeringElement);
    var library = Zotero.ui.getAssociatedLibrary(triggeringEl);
    var widgetEl = J(evt.data.widgetEl).empty();
    widgetEl.html( J("#exportitemsdialogTemplate").render({}) );
    var dialogEl = widgetEl.find(".export-items-dialog");
    
    dialogEl.find(".modal-body").empty().append(J(".export-list").contents().clone() );
    
    //get library and build dialog
    Zotero.ui.dialog(dialogEl, {});
    
    return false;
};

Zotero.ui.widgets.exportItemsDialog.updateExportLinks = function(e){
    Z.debug('exportItemsDialog.updateExportLinks', 3);
    //get list of export urls and link them
    var triggeringEl = J(e.triggeringElement);
    var widgetEl = J(e.data['widgetEl']);
    var library = Zotero.ui.getAssociatedLibrary(widgetEl);
    
    var urlconfig = Zotero.ui.getItemsConfig(library);
    
    var exportUrls = Zotero.url.exportUrls(urlconfig);
    //widgetEl.find(".export-list").empty().append( J("#exportformatsTemplate").render({exportUrls:exportUrls}) );
    //widgetEl.find(".export-list").data('urlconfig', urlconfig);
    J(".export-list").empty().append( J("#exportformatsTemplate").render({exportUrls:exportUrls, exportFormatsMap: Zotero.config.exportFormatsMap}) );
    J(".export-list").data('urlconfig', urlconfig);
    //hide export list until requested
    J(".export-list").hide();
};
