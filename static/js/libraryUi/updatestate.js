
/**
 * Update the disabled state of library control toolbar buttons depending on context
 * @return {undefined}
 */
Zotero.ui.updateDisabledControlButtons = function(){
    Z.debug("Zotero.ui.updateDisabledControlButtons", 3);
    J(".move-to-trash-link").prop('title', 'Move to Trash');
    
    J("#create-item-link").button('option', 'disabled', false);
    if((J(".itemlist-editmode-checkbox:checked").length === 0) && (!Zotero.nav.getUrlVar('itemKey')) ){
        J(".add-to-collection-link").button('option', 'disabled', true).removeClass("ui-state-hover");
        J(".remove-from-collection-link").button('option', 'disabled', true).removeClass("ui-state-hover");
        J(".move-to-trash-link").button('option', 'disabled', true).removeClass("ui-state-hover");
        J(".remove-from-trash-link").button('option', 'disabled', true).removeClass("ui-state-hover");
        
        J("#cite-link").button('option', 'disabled', true);
        J("#export-link").button('option', 'disabled', true);
    }
    else{
        J(".add-to-collection-link").button('option', 'disabled', false).removeClass("ui-state-hover");
        J(".remove-from-collection-link").button('option', 'disabled', false).removeClass("ui-state-hover");
        J(".move-to-trash-link").button('option', 'disabled', false).removeClass("ui-state-hover");
        if(Zotero.nav.getUrlVar('collectionKey') == 'trash'){
            J(".remove-from-trash-link").button('option', 'disabled', false).removeClass("ui-state-hover");
        }
        J("#cite-link").button('option', 'disabled', false);
        J("#export-link").button('option', 'disabled', false);
    }
    //only show remove from collection button if inside a collection
    if(!Zotero.nav.getUrlVar("collectionKey")){
        J(".remove-from-collection-link").button('option', 'disabled', true).removeClass("ui-state-hover");
    }
    //disable create item button if in trash
    else if(Zotero.nav.getUrlVar('collectionKey') == 'trash'){
        J("#create-item-link").button('option', 'disabled', true).removeClass('ui-state-hover');
        J(".add-to-collection-link").button('option', 'disabled', true).removeClass("ui-state-hover");
        J(".remove-from-collection-link").button('option', 'disabled', true).removeClass("ui-state-hover");
        J(".move-to-trash-link").prop('title', 'Permanently Delete');
    }
    Zotero.ui.init.editButton();
};

/**
 * Conditionally show the control panel
 * @param  {Dom El} el control panel element
 * @return {undefined}
 */
Zotero.ui.showControlPanel = function(el){
    Z.debug("Zotero.ui.showControlPanel", 3);
    var jel = J(el);
    var mode = Zotero.nav.getUrlVar('mode') || 'view';
    
    if(Zotero.config.librarySettings.allowEdit === 0){
        J(".permission-edit").hide();
        J("#control-panel").hide();
    }
};

/**
 * Nest the collection tree and hide/show appropriate nodes
 * @param  {Dom Element} el             Container element
 * @param  {boolean} expandSelected Show or hide the currently selected collection
 * @return {undefined}
 */
Zotero.ui.nestHideCollectionTree = function(el, expandSelected){
    if(typeof expandSelected == 'undefined'){
        expandSelected = true;
    }
    //nest and hide collection tree
    var jel = J(el);
    jel.find("#collection-list ul").hide().siblings(".folder-toggle")
                                        .children(".sprite-placeholder")
                                        .removeClass("sprite-placeholder")
                                        .addClass("ui-icon-triangle-1-e");
    jel.find(".current-collection").parents("ul").show();
    jel.find("#collection-list li.current-collection").children('ul').show();
    //start all twisties in closed position
    jel.find(".ui-icon-triangle-1-s").removeClass("ui-icon-triangle-1-s").addClass("ui-icon-triangle-1-e");
    //show opened twisties as expanded
    jel.find("li.current-collection").parentsUntil("#collection-list").children('div.folder-toggle').find(".ui-icon-triangle-1-e")
                                                .removeClass("ui-icon-triangle-1-e")
                                                .addClass("ui-icon-triangle-1-s");
    
    
    if(expandSelected === false){
        jel.find("#collection-list li.current-collection").children('ul').hide();
        jel.find("#collection-list li.current-collection").find(".ui-icon-triangle-1-s")
                                                    .removeClass("ui-icon-triangle-1-s")
                                                    .addClass("ui-icon-triangle-1-e");
        jel.find(".current-collection").data('expanded', false);
    }
    else{
        jel.find("li.current-collection").children('div.folder-toggle').find(".ui-icon-triangle-1-e")
                                                .removeClass("ui-icon-triangle-1-e")
                                                .addClass("ui-icon-triangle-1-s");
                                                
        jel.find(".current-collection").data('expanded', true);
    }
    
    Zotero.ui.createOnActivePage(el);
};

/**
 * Highlight the currently selected collection
 * @return {undefined}
 */
Zotero.ui.highlightCurrentCollection = function(){
    Z.debug("Zotero.ui.highlightCurrentCollection", 3);
    var collectionKey = Zotero.nav.getUrlVar('collectionKey');
    //unhighlight currently highlighted
    J("a.current-collection").closest("li").removeClass("current-collection");
    J("a.current-collection").removeClass("current-collection");
    
    if(collectionKey){
        //has collection selected, highlight it
        J("a[data-collectionKey='" + collectionKey + "']").addClass("current-collection");
        J("a[data-collectionKey='" + collectionKey + "']").closest('li').addClass("current-collection");
    }
    else{
        J("a.my-library").addClass("current-collection");
        J("a.my-library").closest('li').addClass("current-collection");
    }
};

/**
 * Update enabled/disabled for collection buttons based on context
 * @return {undefined}
 */
Zotero.ui.updateCollectionButtons = function(){
    var editCollectionsButtonsList = J(".edit-collections-buttons-list");
    editCollectionsButtonsList.buttonset().show();
    
    //enable modify and delete only if collection is selected
    J("#edit-collections-buttons-div").buttonset();
    
    J(".create-collection-link").button('option', 'icons', {primary:'sprite-toolbar-collection-add'}).button('option', 'text', false);
    J(".update-collection-link").button('option', 'icons', {primary:'sprite-toolbar-collection-edit'}).button('option', 'text', false);
    J(".delete-collection-link").button('option', 'icons', {primary:'sprite-folder_delete'}).button('option', 'text', false);
    
    if(Zotero.nav.getUrlVar("collectionKey")){
        J(".update-collection-link").button('enable');
        J(".delete-collection-link").button('enable');
    }
    else{
        J(".update-collection-link").button().button('disable');
        J(".delete-collection-link").button().button('disable');
    }
};

/**
 * trigger create on actively displayed page (placeholder version of mobile function which actually does something)
 * @param  {Dom Element} el Active page element
 * @return {undefined}
 */
Zotero.ui.createOnActivePage = function(el){
    
};

/**
 * Trigger a ZoteroItemUpdated event on the document for zotero translators
 * @return {undefined}
 */
Zotero.ui.zoteroItemUpdated = function(){
    try{
        //trigger event for Zotero translator detection
        var ev = document.createEvent('HTMLEvents');
        ev.initEvent('ZoteroItemUpdated', true, true);
        document.dispatchEvent(ev);
    }
    catch(e){
        Zotero.debug("Error triggering ZoteroItemUpdated event");
    }
};

