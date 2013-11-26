Zotero.callbacks = {};

/**
 * Choose between displaying items list and item details
 * @param  {Dom Element} el ajaxload element
 * @return {undefined}
 */
Zotero.callbacks.chooseItemPane = function(el){
    Z.debug("Zotero.callbacks.chooseItemPane", 3);
    var showPane = 'list';
    var itemList = J("#library-items-div");
    var itemDetail = J("#item-details-div");
    
    //test if itemKey present and load/display item if it is
    var itemKey = Zotero.nav.getUrlVar('itemKey');
    Z.debug("showPane itemKey : " + itemKey, 3);
    
    if(itemKey){
        //Zotero.callbacks.loadItem(J("#item-details-div"), 'user', itemKey);
        showPane = 'detail';
    }
    else if(Zotero.nav.getUrlVar('action') == 'newItem'){
        showPane = 'detail';
    }
    
    if(showPane == 'detail'){
        Z.debug("item pane displaying detail", 3);
        itemList.hide();
        itemDetail.show();
    }
    else if(showPane == 'list'){
        Z.debug("item pane displaying list", 3);
        itemDetail.hide();
        itemList.show();
    }
    
    if(Zotero.config.mobile){
        //only show filter and search bars for list
        if(showPane == 'detail'){
            J("#items-pane-edit-panel-div").hide();
            J("#filter-guide-div").hide();
        }
        else if(showPane == 'list'){
            J("#items-pane-edit-panel-div").show();
            J("#filter-guide-div").show();
        }
    }
};

Zotero.callbacks.rejectIfPending = function(el){
    var pendingDeferred = J(el).data('pendingDeferred');
    if(pendingDeferred && pendingDeferred.hasOwnProperty('reject')){
        pendingDeferred.reject();
        J(el).removeData('pendingDeferred');
    }
};


Zotero.callbacks.showSpinnerSection = function(el){
    Z.debug("Zotero.callbacks.showSpinnerSection", 3);
    Zotero.ui.showSpinner(J(el).children('.loading'));
};

Zotero.callbacks.appendPreloader = function(el){
    Z.debug("Zotero.callbacks.appendPreloader", 3);
    Zotero.ui.appendSpinner(el);
};


/**
 * Ajaxload user groups
 * @param  {Dom Element} el Ajaxload element
 * @return {undefined}
 */
Zotero.callbacks.loadUserGroups = function(el){
    Z.debug("Zotero.callbacks.loadUserGroups", 3);
    var jel = J(el);
    var library = Zotero.ui.getAssociatedLibrary(el);
    var loadConfig = jel.data('loadconfig');
    var userid = loadConfig.libraryID;
    
    var groups = library.groups.fetchUserGroups(userid, library._apiKey);
    
    groups.done(J.proxy(function(fetchedGroups){
        Zotero.ui.displayGroupNuggets(el, fetchedGroups);
    }), this);
};
/*
Zotero.callbacks.userGroupsLoaded = function(el){
    Z.debug("Zotero.callbacks.userGroupsLoaded", 3);
    var jel = J(el);
    var groups = Zotero.groups;
    groups.groupsArray.sort(groups.sortByTitleCompare);
    
    var groupshtml = Zotero.ui.userGroupsDisplay(groups);
    jel.html(groupshtml);
};
*/
/**
 * Ajaxload run z.org search
 * @param  {Dom Element} el Ajaxload element
 * @return {undefined}
 */
Zotero.callbacks.runsearch = function(el){
    Z.debug('Zotero.callbacks.runsearch', 3);
    var params = Zotero.pages.search_index.parseSearchUrl();
    
    if(!params.type){
        params.type = 'support';
    }
    var sectionID = params.type;
    if(sectionID != 'people' && sectionID != 'group'){
        sectionID = 'support';
    }
    Z.debug("search type: " + params.type, 4);
    J(".search-section").not("[id=" + sectionID + "]").hide();
    J(".search-section[id=" + sectionID + "]").show().find('input[name=q]').val(params.query);
    J("#search-nav li").removeClass('selected');
    J("#search-nav li." + params.type).addClass('selected');
    zoterojsSearchContext = params.type;
    
    if(params.query){
        Zotero.pages.search_index.runSearch(params);
    }
};

/**
 * Ajaxload library filter display panels on mobile
 * @param  {Dom Element} el Ajaxload element
 * @return {undefined}
 */
Zotero.callbacks.loadFilterGuide = function(el){
    Z.debug("Zotero.callbacks.loadFilterGuide", 3);
    var tag = Zotero.nav.getUrlVar('tag');
    if(typeof tag == 'string'){
        tag = [tag];
    }
    var collectionKey = Zotero.nav.getUrlVar('collectionKey');
    var q = Zotero.nav.getUrlVar('q');
    
    var filters = {tag: tag, collectionKey:collectionKey, q:q};
    Zotero.ui.filterGuide(el, filters);
};

/**
 * Ajaxload library action panel
 * @param  {Dom Element} el Ajaxload element
 * @return {undefined}
 */
Zotero.callbacks.actionPanel = function(el){
    Z.debug("Zotero.callbacks.actionPanel", 3);
    var mode = Zotero.nav.getUrlVar('mode');
    var elid = J(el).attr('id');
    if(elid == 'collections-pane-edit-panel-div'){
        if(mode == 'edit'){
            Zotero.ui.collectionsActionPane(J("#collections-pane-edit-panel-div"), true);
        }
        else{
            Zotero.ui.collectionsActionPane(J("#collections-pane-edit-panel-div"), false);
        }
    }
    else if(elid == 'items-pane-edit-panel-div'){
        if(mode == 'edit'){
            Zotero.ui.itemsActionPane(J("#items-pane-edit-panel-div"));
        }
        else{
            Zotero.ui.itemsSearchActionPane(J("#items-pane-edit-panel-div"));
        }
        Zotero.ui.updateDisabledControlButtons();
    }
};
