Zotero.ui.widgets.progressModal = {};

Zotero.ui.widgets.progressModal.init = function(el){
    Z.debug("progressModal widget init", 3);
    Zotero.ui.eventful.listen("progressStart", Zotero.ui.widgets.progressModal.show, {widgetEl: el});
    Zotero.ui.eventful.listen("progressUpdate", Zotero.ui.widgets.progressModal.update, {widgetEl: el});
    Zotero.ui.eventful.listen("progressDone", Zotero.ui.widgets.progressModal.done, {widgetEl: el});
};

Zotero.ui.widgets.progressModal.show = function(e){
    Z.debug("progressModal.show", 3);
    var triggeringEl = J(e.triggeringElement);
    var widgetEl = J(e.data['widgetEl']).empty();
    
    widgetEl.html( J("#progressModalTemplate").render({progressTitle: e.progressTitle}) );
    var dialogEl = widgetEl.find("#progress-modal-dialog");
    Zotero.ui.dialog(dialogEl, {});
    
};

Zotero.ui.widgets.progressModal.update = function(e){
    Z.debug("progressModal.update", 3);
    var widgetEl = J(e.data['widgetEl']);
    if(!e.progress){
        throw new Error("No progress set on progressUpdate event");
    }
    var updatedProgress = e.progress;
    
    widgetEl.find("progress").prop("value", updatedProgress);
};

Zotero.ui.widgets.progressModal.done = function(e){
    Z.debug("progressModal.done", 3);
    var widgetEl = J(e.data['widgetEl']);
    var dialogEl = widgetEl.find("#progress-modal-dialog");
    Zotero.ui.closeDialog(dialogEl);
};
