Zotero.ui.widgets.itemContainer = {};

Zotero.ui.widgets.itemContainer.init = function(el){
    var container = J(el);
    
    //TODO: this should basically all be event based rather than callbacks
    /*
    Zotero.ui.eventful.listen("saveItem", Zotero.ui.widgets.saveItemCallback);
    Zotero.ui.eventful.listen("cancelItemEdit", Zotero.ui.widgets.saveItemCallback);
    Zotero.ui.eventful.listen("addTag", Zotero.ui.addTag);
    Zotero.ui.eventful.listen("removeTag", Zotero.ui.removeTag);
    Zotero.ui.eventful.listen("addCreator", Zotero.ui.addCreator);
    Zotero.ui.eventful.listen("removeCreator", Zotero.ui.removeCreator);
    Zotero.ui.eventful.listen("switchSingleFieldCreator", Zotero.ui.widgets.switchSingleFieldCreator);
    Zotero.ui.eventful.listen("switchTwoFieldCreator", Zotero.ui.widgets.switchTwoFieldCreators);
    Zotero.ui.eventful.listen("addNote", Zotero.ui.addNote);
    */
    Zotero.ui.eventful.listen("changeItemSorting", Zotero.ui.resortItems);
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
    
    
    container.on('keydown', "#item-details-div .itemDetailForm input", function(e){
        if ( e.keyCode === Zotero.ui.keyCode.ENTER ){
            e.preventDefault();
            var nextEligibleSiblings = J(this).nextAll("input, button, textarea, select");
            if(nextEligibleSiblings.length){
                nextEligibleSiblings.first().focus();
            }
            else{
                J(this).closest("tr").nextAll().find("input, button, textarea, select").first().focus();
            }
        }
    });
    
    //subscribe to event for item getting its first child so we can re-run getChildren
    J.subscribe('hasFirstChild', function(itemKey){
        var jel = J('#item-details-div');
        Zotero.ui.showChildren(jel, itemKey);
    });
};

Zotero.ui.cancelItemEdit = function(e){
    Zotero.nav.clearUrlVars(['itemKey', 'collectionKey', 'tag', 'q']);
    Zotero.nav.pushState();
};
