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

/**
 * Ajaxload library widget
 * @param  {Dom Element} el Ajaxload element
 * @return {undefined}
 */
Zotero.callbacks.loadLibraryWidget = function(el){
    Z.debug("Zotero.callbacks.loadLibraryWidget", 3);
    var jel = J(el);
    var library = Zotero.ui.getAssociatedLibrary(el);
    
    var effectiveUrlVars = ['itemPage', 'tag', 'collectionKey', 'order', 'sort', 'q'];
    
    var defaultConfig = {target:'items',
                         targetModifier: 'top',
                         itemPage: 1,
                         limit: 25,
                         content: 'json'
                     };
    
    //Build config object that should be displayed next and compare to currently displayed
    var newConfig = J.extend({}, defaultConfig);
    newConfig.start = parseInt(newConfig.limit, 10) * (parseInt(newConfig.itemPage, 10) - 1);
    
    if(!newConfig.sort){
        newConfig.sort = Zotero.config.sortOrdering[newConfig.order];
    }
    
    //don't pass top if we are searching for tags (or query?)
    if(newConfig.tag || newConfig.q){
        delete newConfig.targetModifier;
    }
    
    //clear contents and show spinner while loading
    Zotero.ui.showSpinner(el, 'horizontal');
    
    var d = library.loadItems(newConfig);
    
    d.done(J.proxy(function(loadedItems){
        J(el).empty();
        Zotero.ui.displayItemsWidget(el, newConfig, loadedItems);
        J("<a href='#' class='home-widget-library-toggle-more-link clickable'>More</a>").appendTo(J(el));
        J(el).find("tr").slice(4).hide();
    }, this));
    
    d.fail(J.proxy(function(jqxhr, textStatus, errorThrown){
        var elementMessage = Zotero.ui.ajaxErrorMessage(jqxhr);
        jel.html("<p>" + elementMessage + "</p>");
    }));
    
};

Zotero.callbacks.rejectIfPending = function(el){
    var pendingDeferred = J(el).data('pendingDeferred');
    if(pendingDeferred && pendingDeferred.hasOwnProperty('reject')){
        pendingDeferred.reject();
        J(el).removeData('pendingDeferred');
    }
};

/**
 * Ajaxload items list
 * @param  {Dom Element} el Ajaxload element
 * @return {undefined}
 */
Zotero.callbacks.loadItems = function(el){
    Z.debug("Zotero.callbacks.loadItems", 3);
    Zotero.callbacks.rejectIfPending(el);
    var jel = J(el);
    
    var library = Zotero.ui.getAssociatedLibrary(el);
    
    var effectiveUrlVars = ['itemPage', 'tag', 'collectionKey', 'order', 'sort', 'q'];
    var urlConfigVals = {};
    J.each(effectiveUrlVars, function(index, value){
        var t = Zotero.nav.getUrlVar(value);
        if(t){
            urlConfigVals[value] = t;
        }
    });
    
    var defaultConfig = {target:'items',
                         targetModifier: 'top',
                         itemPage: 1,
                         limit: 25,
                         content: 'json'
                     };
    
    //Build config object that should be displayed next and compare to currently displayed
    var newConfig = J.extend({}, Zotero.config.userDefaultApiArgs, defaultConfig, urlConfigVals);
    newConfig['collectionKey'] = urlConfigVals['collectionKey'];//always override collectionKey, even with absence of collectionKey
    newConfig.start = parseInt(newConfig.limit, 10) * (parseInt(newConfig.itemPage, 10) - 1);
    
    //don't allow ordering by addedBy if user library
    if( (newConfig.order == "addedBy") && (library.libraryType == 'user') ){
        newConfig.order = 'title';
    }
    
    if(!newConfig.sort){
        newConfig.sort = Zotero.config.sortOrdering[newConfig.order];
    }
    
    //don't pass top if we are searching for tags (or query?)
    if(newConfig.tag || newConfig.q){
        delete newConfig.targetModifier;
    }
    
    //clear contents and show spinner while loading
    Zotero.ui.showSpinner(el, 'horizontal');
    
    var d = library.loadItems(newConfig);
    
    d.done(J.proxy(function(loadedItems){
        J(el).empty();
        Zotero.ui.displayItemsFull(el, newConfig, loadedItems);
        //set currentConfig on element when done displaying
        //J(el).data('currentconfig', newConfig);
    }, this));
    
    d.fail(J.proxy(function(jqxhr, textStatus, errorThrown){
        var elementMessage = Zotero.ui.ajaxErrorMessage(jqxhr);
        jel.html("<p>" + elementMessage + "</p>");
    }));
    
    //associate promise with el so we can cancel on later loads
    jel.data('pendingDeferred', d);
};

/**
 * Ajaxload item details
 * @param  {Dom Element} el Ajaxload element
 * @return {undefined}
 */
Zotero.callbacks.loadItem = function(el){
    Z.debug("Zotero.callbacks.loadItem", 3);
    Zotero.callbacks.rejectIfPending(el);
    var jel = J(el);
    var library = Zotero.ui.getAssociatedLibrary(el);
    var d;
    //clear contents and show spinner while loading
    Zotero.ui.showSpinner(el);
    
    //if we're  creating a new item: let user choose itemType if we don't have a value
    //yet, otherwise create a new item and initialize it as an empty item of that type
    //then once we have the template in the item render it as an item edit
    if(Zotero.nav.getUrlVar('action') == 'newItem'){
        var itemType = Zotero.nav.getUrlVar('itemType');
        if(!itemType){
            jel.empty();
            J("#itemtypeselectTemplate").tmpl({itemTypes:Zotero.localizations.typeMap}).appendTo(jel);
            return;
        }
        else{
            var newItem = new Zotero.Item();
            newItem.libraryType = library.libraryType;
            newItem.libraryID = library.libraryID;
            d = newItem.initEmpty(itemType);
            jel.data('pendingDeferred', d);
            d.done(Zotero.ui.loadNewItemTemplate);
            d.fail(function(jqxhr, textStatus, errorThrown){
                Zotero.ui.jsNotificationMessage("Error loading item template", 'error');
            });
            return;
        }
    }
    
    //if it is not a new item handled above we must have an itemKey
    var itemKey = Zotero.nav.getUrlVar('itemKey');
    if(!itemKey){
        return false;
    }
    
    //get the item out of the library for display
    var item = library.items.getItem(itemKey);
    if(item){
        Z.debug("have item locally, loading details into ui", 3);
        if(Zotero.nav.getUrlVar('mode') == 'edit'){
            Zotero.ui.editItemForm(jel, item);
        }
        else{
            Zotero.ui.loadItemDetail(item, jel);
            Zotero.ui.showChildren(el, itemKey);
        }
    }
    else{
        Z.debug("must fetch item from server", 3);
        d = library.loadItem(itemKey);
        jel.data('pendingDeferred', d);
        var config = {'target':'item', 'libraryType':library.type, 'libraryID':library.libraryID, 'itemKey':itemKey, 'content':'json'};
        d.done(J.proxy(function(item){
            Z.debug("Library.loadItem done", 3);
            jel.empty();
            
            if(Zotero.nav.getUrlVar('mode') == 'edit'){
                Zotero.ui.editItemForm(jel, item);
            }
            else{
                Zotero.ui.loadItemDetail(item, jel);
                Zotero.ui.showChildren(el, itemKey);
            }
            //set currentConfig on element when done displaying
            jel.data('currentconfig', config);
        }, this));
    }
};

/**
 * Ajaxload library control panel
 * @param  {Dom Element} el Ajaxload element
 * @return {undefined}
 */
Zotero.callbacks.controlPanel = function(el){
    Z.debug("Zotero.callbacks.controlPanel", 3);
    Zotero.ui.showControlPanel(el);
    Zotero.ui.updateDisabledControlButtons();
};

/**
 * Ajaxload library tags
 * @param  {Dom Element} el Ajaxload element
 * @return {undefined}
 */
Zotero.callbacks.loadTags = function(el, checkCached){
    Z.debug('Zotero.callbacks.loadTags', 3);
    Zotero.nav.flagLoading(el);
    var jel = J(el);
    if(typeof checkCached == 'undefined'){
        checkCached = true; //default to using the cache
    }
    
    //get Zotero.Library object if already bound to element
    var library = Zotero.ui.getAssociatedLibrary(el);
    
    var defaultConfig = {};
    
    var collectionKey = Zotero.nav.getUrlVar('collectionKey') || jel.attr("data-collectionKey");
    
    var showAllTags = jel.find('#show-all-tags').filter(':checked').length;
    //var showAuto = jel.children('#show-automatic').filter(':checked').length;
    
    // put the selected tags into an array
    var selectedTags = Zotero.nav.getUrlVar('tag');
    if(!J.isArray(selectedTags)){
        if(selectedTags) {
            selectedTags = [selectedTags];
        }
        else {
            selectedTags = [];
        }
    }
    
    var newConfig;
    //api doesn't support tags filtered by tag yet, so don't include selectedTags in configs
    if(showAllTags){
        //newConfig = J.extend({}, defaultConfig, {tag:selectedTags});
        newConfig = J.extend({}, defaultConfig);
    }
    else{
        //newConfig = J.extend({}, defaultConfig, {collectionKey:collectionKey, tag:selectedTags});
        newConfig = J.extend({}, defaultConfig, {collectionKey:collectionKey});
    }
    
    Zotero.ui.showSpinner(J(el).find('div.loading'));
    
    J.subscribe('tags_page_loaded', J.proxy(function(tags){
        Z.debug("tags_page_loaded published", 3);
        J.unsubscribe('tags_page_loaded');
        
        //remove spinner
        if(!jel.data('showmore')){
            J(el).find('div.loading').empty();
        }
        var plainList = library.tags.plainTagsList(library.tags.tagsArray);
        var matchedList = Zotero.utils.prependAutocomplete('', plainList);
        Zotero.ui.displayTagsFiltered(el, library.tags, matchedList, selectedTags);
    }, this));
    
    var d = library.loadAllTags(newConfig, checkCached);
    
    d.done(J.proxy(function(tags){
        Z.debug("finished loadAllTags", 3);
        J(el).find('div.loading').empty();
        Z.debug(tags, 5);
        library.tags.loaded = true;
        library.tags.loadedConfig = newConfig;
        J(el).children('.loading').empty();
        var plainList = library.tags.plainTagsList(library.tags.tagsArray);
        Zotero.ui.displayTagsFiltered(el, library.tags, plainList, selectedTags);
        Zotero.nav.doneLoading(el);
    }, this));
    
    d.fail(J.proxy(function(jqxhr, textStatus, errorThrown){
        var elementMessage = Zotero.ui.ajaxErrorMessage(jqxhr);
        jel.html("<p>" + elementMessage + "</p>");
    }));
    
    return;
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
 * Ajaxload library collections
 * @param  {Dom Element} el Ajaxload element
 * @return {undefined}
 */
Zotero.callbacks.loadCollections = function(el){
    Z.debug("Zotero.callbacks.loadCollections", 3);
    Zotero.nav.flagLoading(el);
    var jel = J(el);
    
    //get Zotero.Library object if already bound to element
    var library = Zotero.ui.getAssociatedLibrary(el);
    var mode = Zotero.nav.getUrlVar('mode') || 'view';
    
    Zotero.ui.updateCollectionButtons();
    //set default mode on dom element if not set
    if(!jel.data('mode')) jel.data('mode', 'view');
    
    //short circuit if widget is already loaded or loading
    if((jel.data('loaded') || (library.collections.loading)) && (!library.collections.dirty) ) {
        Z.debug("collections already loaded and clean", 3);
        
        Zotero.ui.highlightCurrentCollection();
        Zotero.ui.nestHideCollectionTree(el);
        Zotero.nav.doneLoading(el);
        return;
    }
    
    //empty contents and show spinner while loading ajax
    var clist = jel.find('#collection-list-container');
    Zotero.ui.showSpinner(clist);
    
    var d = library.loadCollections();
    d.done(J.proxy(function(){
        Zotero.nav.doneLoading(el);
        clist.empty();
        Zotero.ui.displayCollections(clist, library.collections);
        Zotero.ui.nestHideCollectionTree(clist);
        Zotero.ui.highlightCurrentCollection();
        jel.data('loaded', true);
        jel.data('mode', mode);
        Zotero.nav.doneLoading(el);
    }, this));
    
    d.fail(J.proxy(function(jqxhr, textStatus, errorThrown){
        var elementMessage = Zotero.ui.ajaxErrorMessage(jqxhr);
        jel.html("<p>" + elementMessage + "</p>");
    }));
    
    return;
};

/**
 * Ajaxload update feed link
 * @param  {Dom Element} el Ajaxload element
 * @return {undefined}
 */
Zotero.callbacks.loadFeedLink = function(el){
    Z.debug("Zotero.callbacks.loadFeedLink", 3);
    var jel = J(el);
    
    var library = Zotero.ui.getAssociatedLibrary(el);
    var loadConfig = jel.data('loadconfig');
    library.libraryLabel = decodeURIComponent(loadConfig.libraryLabel);
    
    var effectiveUrlVars = ['itemPage', 'tag', 'collectionKey', 'order', 'sort', 'q'];
    var urlConfigVals = {};
    J.each(effectiveUrlVars, function(index, value){
        var t = Zotero.nav.getUrlVar(value);
        if(t){
            urlConfigVals[value] = t;
        }
    });
    
    var defaultConfig = {target:'items',
                         targetModifier: 'top',
                         itemPage: 1,
                         limit: 25
                     };
    //Build config object that should be displayed next and compare to currently displayed
    var newConfig = J.extend({}, defaultConfig, jel.data('loadconfig'), urlConfigVals);
    newConfig['collectionKey'] = urlConfigVals['collectionKey'];//always override collectionKey, even with absence of collectionKey
    newConfig.start = parseInt(newConfig.limit, 10) * (parseInt(newConfig.itemPage, 10) - 1);
    
    if(!newConfig.sort){
        newConfig.sort = Zotero.config.sortOrdering[newConfig.order];
    }
    
    //don't pass top if we are searching for tags (or query?)
    if(newConfig.tag || newConfig.q){
        delete newConfig.targetModifier;
    }
    
    var urlconfig = J.extend({'target':'items', 'libraryType':library.libraryType, 'libraryID':library.libraryID}, newConfig);
    var requestUrl = Zotero.ajax.apiRequestUrl(urlconfig) + Zotero.ajax.apiQueryString(urlconfig, false);
    var feedUrl = requestUrl.replace(Zotero.config.baseApiUrl, Zotero.config.baseFeedUrl);
    var newkeyurl = Zotero.url.requestReadApiKeyUrl(library.libraryType, library.libraryID, feedUrl);
    //save urlconfig on feed element for use in callbacks
    jel.data('urlconfig', urlconfig);
    
    //feed link to either create a new key for private feeds or a public feed url
    if((library.libraryType == 'user' && zoteroData.libraryPublish === 0) || (library.libraryType == 'group' && zoteroData.groupType == 'Private' ) ){
        J(".feed-link").attr('href', newkeyurl);
    }
    else{
        J(".feed-link").attr('href', feedUrl);
    }
    J("#library link[rel='alternate']").attr('href', feedUrl);
    
    //get list of export urls and link them
    var exportUrls = Zotero.url.exportUrls(urlconfig);
    J("#export-list").empty().append(J("#exportformatsTemplate").tmpl({exportUrls:exportUrls}));
    J("#export-list").data('urlconfig', urlconfig);
    //hide export list until requested
    J("#export-list").hide();
};

/**
 * Ajaxload user groups
 * @param  {Dom Element} el Ajaxload element
 * @return {undefined}
 */
Zotero.callbacks.loadUserGroups = function(el){
    Z.debug("Zotero.callbacks.loadUserGroups", 3);
    var jel = J(el);
    
    var config = {};
    config.userslug = jel.attr("data-userslug");
    config.target = jel.attr("data-target");
    //config.start = jel.attr("data-start");
    //config.limit = jel.attr("data-limit");
    config.content = jel.attr("data-content");
    config.raw = "1";
    
    Zotero.ajax.loadUserGroups(el, config);
};

Zotero.callbacks.userGroupsLoaded = function(el){
    Z.debug("Zotero.callbacks.userGroupsLoaded", 3);
    var jel = J(el);
    var groups = Zotero.groups;
    groups.groupsArray.sort(groups.sortByTitleCompare);
    
    var groupshtml = Zotero.ui.userGroupsDisplay(groups);
    jel.html(groupshtml);
};

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

/**
 * Ajaxload select the active mobile library page
 * @param  {Dom Element} el Ajaxload element
 * @return {undefined}
 */
Zotero.callbacks.selectMobilePage = function(el){
    Z.debug("Zotero.callbacks.selectMobilePage", 3);
    //don't switch to a dialog if this is the first load rather than a history event
    if(Zotero.state.mobilePageFirstLoad){
        Z.debug("first mobile pageload - ignoring page history's page", 3);
        Zotero.state.mobilePageFirstLoad = false;
        var activePageID = J.mobile.activePage.attr('id') || '';
        Zotero.nav.updateStatePageID(activePageID);
        return;
    }
    else if(Zotero.state.mobileBackButtonClicked){
        Zotero.state.mobileBackButtonClicked = false;
        var defaultPageID = J("[data-role='page']").first().attr('id');
        Zotero.nav.ignoreStateChange();
        Zotero.ui.mobile.changePage('#' + defaultPageID, {'changeHash':false});
    }
    else{
        Z.debug("Not first mobile pageload - going ahead with mobile page selection", 3);
    }
    var hState = History.getState();
    var s = hState.data;
    var page = Zotero.nav.getUrlVar('msubpage') || s._zpageID;
    if(page){
        if(J.mobile.activePage.attr('id') != page){
            Z.debug("Zotero.callbacks.selectMobilePage switching to " + page, 4);
            Zotero.nav.ignoreStateChange();
            Zotero.ui.mobile.changePage('#' + page, {'changeHash':false});
            //Zotero.nav.updateStatePageID(page);
        }
    }
    else{
        //show the first mobile page in the dom
        /*
        var defaultPageID = J("[data-role='page']").first().attr('id');
        Zotero.nav.ignoreStateChange();
        Zotero.ui.mobile.changePage('#' + defaultPageID, {'changeHash':false});
        */
        
        /*
        Z.debug('no page set, set the current page');
        //if(!s.hasOwnProperty('_zpageID'));
        var activePageID = J.mobile.activePage.attr('id') || '';
        Zotero.nav.updateStatePageID(activePageID);
        */
    }
    Zotero.ui.createOnActivePage();
    return;
};

