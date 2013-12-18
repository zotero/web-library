Zotero.ui.widgets.itemContainer = {};

Zotero.ui.widgets.itemContainer.init = function(el){
    var container = J(el);
    
    //TODO: this should basically all be event based rather than callbacks
    Zotero.ui.eventful.listen("citeItems", Zotero.ui.callbacks.citeItems);
    Zotero.ui.eventful.listen("exportItems", Zotero.ui.callbacks.exportItems);
    
    
    container.on('click', "#item-details-div .itemTypeSelectButton", function(){
        Z.debug("itemTypeSelectButton clicked", 3);
        var itemType = J("#itemType").val();
        Zotero.nav.urlvars.pathVars['itemType'] = itemType;
        Zotero.nav.pushState();
        return false;
    });
    container.on('change', "#item-details-div .itemDetailForm #itemTypeSelect", function(){
        Z.debug("itemTypeSelect changed", 3);
        var itemType = J(this).val();
        Zotero.nav.urlvars.pathVars['itemType'] = itemType;
        Zotero.nav.pushState();
    });
};

Zotero.ui.cancelItemEdit = function(e){
    Zotero.nav.clearUrlVars(['itemKey', 'collectionKey', 'tag', 'q']);
    Zotero.nav.pushState();
};
