if(!Zotero.ui.init){
    Zotero.ui.init = {};
}

if(!Zotero.ui.widgets){
    Zotero.ui.widgets = {};
}

//initialize the library control buttons
Zotero.ui.init.libraryControls = function(){
    Z.debug("Zotero.ui.initControls", 3);
    //set up control panel buttons
    
    
    //check/uncheck all boxes in items table when master checkbox is toggled
    J('#library-items-div').on('change', ".itemlist-editmode-checkbox.all-checkbox", function(e){
        J(".itemlist-editmode-checkbox").prop('checked', J(".itemlist-editmode-checkbox.all-checkbox").prop('checked'));
        Zotero.ui.eventful.trigger("selectedItemsChanged");
    });
    
    //init itemkey-checkbox to enable/disable buttons that require something being selected
    J('#library-items-div').on('change', "input.itemKey-checkbox", function(e){
        Zotero.ui.eventful.trigger("selectedItemsChanged");
    });
    
    
    //set initial state of search input to url value
    if(Zotero.nav.getUrlVar('q')){
        J("#header-search-query").val(Zotero.nav.getUrlVar('q'));
    }
    //clear libary query param when field cleared
    var context = 'support';
    if(undefined !== window.zoterojsSearchContext){
        context = zoterojsSearchContext;
    }
    
    J("#header-search-query").val("");
    //J("#header-search-query").attr('placeholder', "Search Library");
    
    //set up search submit for library
    J("#library-search").on('submit', function(e){
        e.preventDefault();
        Zotero.nav.clearUrlVars(['collectionKey', 'tag', 'q']);
        var query     = J("#header-search-query").val();
        if(query !== "" || Zotero.nav.getUrlVar('q') ){
            Zotero.nav.urlvars.pathVars['q'] = query;
            Zotero.nav.pushState();
        }
        return false;
    });
    
    //set up library search clear button
    if((context == 'library') || (context == 'grouplibrary')){
        var clearQuery = function(e){
            J("#header-search-query").val('');
            if(Zotero.nav.getUrlVar('q')){
                Zotero.nav.setUrlVar('q', '');
                Zotero.nav.pushState();
            }
        };
        J("#library-search button.clear-field-button").on('click', clearQuery);
    }
};

Zotero.ui.init.jqueryui = function(){
};

//initialize pagination buttons
Zotero.ui.init.paginationButtons = function(pagination){
};

//initialize tags widget and related library features
Zotero.ui.init.tags = function(){
    Z.debug("Zotero.ui.initTags", 3);
};

//initialize items widget and related features
Zotero.ui.init.items = function(){
    Z.debug("Zotero.ui.initItems", 3);
    J("#item-details-div").on('click', ".saveitembutton", Zotero.ui.saveItemCallback);
    J("#item-details-div").on('submit', ".itemDetailForm", Zotero.ui.saveItemCallback);
    J("#item-details-div").on('click', ".cancelitemeditbutton", Zotero.ui.callbacks.cancelItemEdit);
    J("#item-details-div").on('click', ".itemTypeSelectButton", Zotero.ui.callbacks.selectItemType);
    
    /*
    J("#item-details-div").on('change', ".itemDetailForm #itemTypeSelect", function(){
        Z.debug("itemTypeSelect changed", 3);
        var itemType = J(this).val();
        Zotero.nav.urlvars.pathVars['itemType'] = itemType;
        Zotero.nav.pushState();
    });
    */
    
    J("#item-details-div").on('keydown', ".itemDetailForm input", Zotero.ui.callbacks.itemFormKeydown);
    
    J("#item-details-div").on('click', ".add-tag-link", Zotero.ui.addTag);
    J("#item-details-div").on('click', ".remove-tag-link", Zotero.ui.removeTag);
    J("#item-details-div").on('click', ".add-creator-link", Zotero.ui.addCreator);
    J("#item-details-div").on('click', ".remove-creator-link", Zotero.ui.removeCreator);
    
    J("#item-details-div").on('click', ".switch-two-field-creator-link", Zotero.ui.callbacks.switchTwoFieldCreators);
    J("#item-details-div").on('click', ".switch-single-field-creator-link", Zotero.ui.callbacks.switchSingleFieldCreator);
    J("#item-details-div").on('click', ".add-note-button", Zotero.ui.callbacks.addNote);
    
    //set up sorting on header clicks
    J("#library-items-div").on('click', ".field-table-header", Zotero.ui.callbacks.resortItems);
    
    //bind cite item link
    //TODO: just declare triggers on these links
    /*
    J("#item-details-div").on('click', "#cite-item-link", Zotero.ui.callbacks.citeItems);
    J("#build-bibliography-link").on('click', Zotero.ui.callbacks.citeItems);
    J("#cite-link").on('click', Zotero.ui.callbacks.citeItems);
    */
    
    //bind export links
    //J("#export-formats-div").on('click', ".export-link", Zotero.ui.callbacks.exportItems);
    //J("#export-link").on('click', Zotero.ui.callbacks.showExportDialog);
    
    //J("#export-dialog").on('click', '.export-link', Zotero.ui.callbacks.exportItems);
    
    //bind attachment upload link
    J("#item-details-div").on('click', "#upload-attachment-link", Zotero.ui.callbacks.uploadAttachment);
    
    //subscribe to event for item getting its first child so we can re-run getChildren
    /*
    J.subscribe('hasFirstChild', function(itemKey){
        var jel = J('#item-details-div');
        Zotero.ui.showChildren(jel, itemKey);
    });
    */
};

Zotero.ui.init.creatorFieldButtons = function(){
};
Zotero.ui.init.editButton = function(){
    Z.debug("Zotero.ui.init.editButton", 3);
    var editEl = J("#edit-checkbox");
    if(Zotero.nav.getUrlVar('mode') == 'edit'){
        editEl.addClass('active');
    }
    else{
        editEl.removeClass('active');
    }
    
    if(!Zotero.nav.getUrlVar('itemKey')){
        editEl.addClass("disabled");
    }
    else{
        editEl.removeClass("disabled");
    }
};
Zotero.ui.init.detailButtons = function(){
};
Zotero.ui.init.tagButtons = function(){};

Zotero.ui.removeTag = function(e){
    var el = e.currentTarget;
    Z.debug("Zotero.ui.removeTag", 3);
    J(el).closest('.edit-tag-div').remove();
    Zotero.ui.createOnActivePage(el);
};

Zotero.ui.addCreator = function(e){
    var button = e.currentTarget;
    Z.debug("Zotero.ui.addCreator", 3);
    var itemKey = J(button).data('itemkey');
    var itemType = J(button).closest('form').find('select.itemType').val();
    var lastcreatorid = J("input[id^='creator_']:last").attr('id');
    var creatornum = 0;
    if(lastcreatorid){
        creatornum = parseInt(lastcreatorid.substr(8), 10);
    }
    var newindex = creatornum + 1;
    var jel = J("input[id^='creator_']:last").closest('tr');
    J.tmpl('authorelementsdoubleTemplate', {index:newindex,
                                            creator:{firstName:'', lastName:''},
                                            creatorTypes:Zotero.Item.prototype.creatorTypes[itemType]
                                            }).insertAfter(jel);
    
    Zotero.ui.init.creatorFieldButtons();
    
    Zotero.ui.createOnActivePage(jel);
};

Zotero.ui.removeCreator = function(e){
    var button = e.currentTarget;
    Z.debug("Zotero.ui.removeCreator", 3);
    J(button).closest('tr').remove();
    
    Zotero.ui.createOnActivePage(button);
};



//bootstrap version of updateCollectionButtons
Zotero.ui.updateCollectionButtons = function(){
    //enable modify and delete only if collection is selected
    if(Zotero.nav.getUrlVar("collectionKey")){
        J(".update-collection-button").removeClass('disabled');
        J(".delete-collection-button").removeClass('disabled');
    }
    else{
        J(".update-collection-button").addClass('disabled');
        J(".delete-collection-button").addClass('disabled');
    }
};

/**
 * Toggle library edit mode when edit button clicked
 * @param  {event} e click event
 * @return {boolean}
 */
Zotero.ui.callbacks.toggleEdit =  function(e){
    Z.debug("edit checkbox toggled", 3);
    var curMode = Zotero.nav.getUrlVar('mode');
    if(curMode != "edit"){
        Zotero.nav.urlvars.pathVars['mode'] = 'edit';
    }
    else{
        delete Zotero.nav.urlvars.pathVars['mode'];
    }
    Zotero.nav.pushState();
    return false;
};
