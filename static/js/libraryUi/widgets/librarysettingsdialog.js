Zotero.ui.widgets.librarysettingsdialog = {};

Zotero.ui.widgets.librarysettingsdialog.init = function(el){
    Z.debug("librarysettingsdialog widget init", 3);
    Zotero.ui.eventful.listen("librarySettings", Zotero.ui.widgets.librarysettingsdialog.show, {widgetEl: el});
};

Zotero.ui.widgets.librarysettingsdialog.show = function(e){
    Z.debug("librarysettingsdialog.show", 3);
    var triggeringEl = J(e.triggeringElement);
    
    var widgetEl = J(e.data['widgetEl']).empty();
    widgetEl.html( J("#librarysettingsdialogTemplate").render({'columnFields': Zotero.Library.prototype.displayableColumns},
                                                               {'fieldMap': Zotero.localizations.fieldMap,
                                                               'topString' : 'Top String'
                                                                } ));
    var dialogEl = widgetEl.find(".library-settings-dialog");
    
    dialogEl.find(".display-column-field-title").prop('checked', true).prop('disabled', true);
    
    var library = Zotero.ui.getEventLibrary(e);
    var listShowFields = library.preferences.getPref('library_listShowFields');
    var itemsPerPage = library.preferences.getPref('itemsPerPage');
    //var listShowFields = Zotero.preferences.getPref('library_listShowFields');
    J.each(listShowFields, function(index, value){
        var classstring = '.display-column-field-' + value;
        dialogEl.find(classstring).prop('checked', true);
    });
    J("#items-per-page").val(itemsPerPage);
    
    var submitFunction = J.proxy(function(){
        var showFields = [];
        dialogEl.find(".library-settings-form").find('input:checked').each(function(){
            showFields.push(J(this).val());
        });
        
        var itemsPerPage = parseInt(dialogEl.find("#items-per-page").val(), 10);
        
        library.preferences.setPref('library_listShowFields', showFields);
        library.preferences.setPref('itemsPerPage', itemsPerPage);
        library.preferences.persist();
        Zotero.preferences.setPref('library_listShowFields', showFields);
        Zotero.preferences.setPref('itemsPerPage', itemsPerPage);
        Zotero.preferences.persist();
        
        Zotero.ui.eventful.trigger("displayedItemsChanged");
        
        Zotero.ui.closeDialog(dialogEl);
    }, this);
    
    dialogEl.find(".saveButton").on("click", submitFunction);
    Zotero.ui.dialog(dialogEl, {});
};

