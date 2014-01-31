Zotero.ui.widgets.librarysettingsdialog = {};

Zotero.ui.widgets.librarysettingsdialog.init = function(el){
    Z.debug("librarysettingsdialog widget init", 3);
    var library = Zotero.ui.getAssociatedLibrary(el);
    
    library.listen("librarySettingsDialog", Zotero.ui.widgets.librarysettingsdialog.show, {widgetEl: el});
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
    var listDisplayedFields = library.preferences.getPref('listDisplayedFields');
    var itemsPerPage = library.preferences.getPref('itemsPerPage');
    var showAutomaticTags = library.preferences.getPref('showAutomaticTags');
    //var listDisplayedFields = Zotero.preferences.getPref('listDisplayedFields');
    J.each(listDisplayedFields, function(index, value){
        var classstring = '.display-column-field-' + value;
        dialogEl.find(classstring).prop('checked', true);
    });
    J("#items-per-page").val(itemsPerPage);
    J("#show-automatic-tags").prop('checked', showAutomaticTags);
    
    var submitFunction = J.proxy(function(){
        var showFields = [];
        dialogEl.find(".library-settings-form").find('input:checked').each(function(){
            showFields.push(J(this).val());
        });
        
        var itemsPerPage = parseInt(dialogEl.find("#items-per-page").val(), 10);
        var showAutomaticTags = dialogEl.find("#show-automatic-tags:checked").length > 0 ? true : false;
        
        library.preferences.setPref('listDisplayedFields', showFields);
        library.preferences.setPref('itemsPerPage', itemsPerPage);
        library.preferences.setPref('showAutomaticTags', showAutomaticTags);
        library.preferences.persist();
        
        Zotero.preferences.setPref('listDisplayedFields', showFields);
        Zotero.preferences.setPref('itemsPerPage', itemsPerPage);
        Zotero.preferences.setPref('showAutomaticTags', showAutomaticTags);
        Zotero.preferences.persist();
        
        library.trigger("displayedItemsChanged");
        library.trigger("tagsChanged");
        
        Zotero.ui.closeDialog(dialogEl);
    }, this);
    
    dialogEl.find(".saveButton").on("click", submitFunction);
    Zotero.ui.dialog(dialogEl, {});
};

