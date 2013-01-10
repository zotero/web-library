Zotero.ui.mobile = {
    currentPrimaryPage: null
};

Zotero.ui.mobile.showMenu = function(el){
    Z.debug("Zotero.ui.mobile.showMenu", 3);
    var parentPage = J(el).closest('div[data-role="page"]');
    var parentPageID = parentPage.attr('id');
    
    J('#dialogPanel').show();
    
    //TODO:change dialog to the correct menu for the context
    //Zotero.nav.replaceState(false, {mobilePage: activePageID});
    
    Zotero.ui.mobile.changePage(J('#menu-dialog'), {transition:'slidedown',
                                                    changeHash:false,
                                                    role:'dialog',
                                                    pageContainer:J('#dialogPanel')
                                                });
    //J(targetpage).trigger('create');
    Zotero.nav.pushState();
};

Zotero.ui.init.mobile = function(){
    Z.debug("Zotero.ui.initMobile", 3);
    
    J("a[data-rel='zback']").live('click', function(e){
        Z.debug("zback button clicked", 3);
        e.preventDefault();
        Zotero.nav.replacePush = false; //disable dialog's forward replace push when exiting with back
        Zotero.state.mobileBackButtonClicked = true;
        History.back();
        return false;
    });
    
    //cancel default action for dialog close buttons
    J("div[role='dialog'] a[href='#']").live('click', function(e){
        Z.debug("dialog close button clicked", 3);
        e.preventDefault();
        Zotero.nav.replacePush = false; //disable dialog's forward replace push when exiting with back
        Zotero.state.mobileBackButtonClicked = true;
        History.back();
        //Zotero.ui.mobile.changePage(J("[data-role='page']").first(), {'changeHash':false}, false);
        return false;
    });
    
    //bind title link button to nav dialog
    J(".title-link").live('click', function(e){
        Z.debug("title link clicked");
        Zotero.ui.dialog(J("#zmobile-nav-dialog"), {'changeHash':false, 'role':'dialog'});
        //Zotero.ui.mobile.changePage(J("#zmobile-nav-dialog"), {'changeHash':false, 'role':'dialog'}, true);
    });
    
    Zotero.ui.mobile.initLibrary();
    
    J.mobile.hidePageLoadingMsg();
};

Zotero.ui.mobile.initLibrary = function(){
    Z.debug("Zotero.ui.mobile.initLibrary", 3);
    //bind the separate page links for library without changing the hash
    J(".collections-page-link").live('click', function(e){
        Zotero.nav.ignoreStateChange();
        Zotero.ui.mobile.changePage("#library-collections-page", {'changeHash':false}, true);
        J("#library-collections-page").trigger('create');
        return false;
    });
    
    J(".tags-page-link").live('click', function(e){
        Zotero.nav.ignoreStateChange();
        Zotero.ui.mobile.changePage("#library-tags-page", {'changeHash':false}, true);
        J("#library-tags-page").trigger('create');
        return false;
    });
    
    J(".items-page-link").live('click', function(e){
        if(Zotero.nav.getUrlVar('itemKey')){
            Zotero.nav.unsetUrlVar('itemKey');
            Zotero.nav.pushState();
        }
        else{
            Zotero.nav.ignoreStateChange();
            Zotero.ui.mobile.changePage("#library-items-page", {'changeHash':false}, true);
            J("#library-items-page").trigger('create');
        }
        return false;
    });
    
    //subscribe to loadCollectionsDone so we can update the filter guide
    J.subscribe("loadCollectionsDone", function(collections){
        Z.debug("loadCollectionsDone callback", 4);
    });
    
    J("#clear-q-link").live('click', function(e){
        Zotero.nav.unsetUrlVar('q');
        Zotero.nav.pushState();
    });
    
    J("#clear-collection-link").live('click', function(e){
        Zotero.nav.unsetUrlVar('collectionKey');
        Zotero.nav.pushState();
    });
    
    J(".tag-filter-button").live('click', function(e){
        var tag = J(this).data('tag');
        Zotero.nav.toggleTag(tag);
        Zotero.nav.pushState();
    });
    
    //check what we get with scroll stop event
    J(document).bind('scrollstop', function(e){
        Z.debug("SCROLLSTOP");
        Z.debug(e);
        //test if we're at the bottom of the scroll area
        if(J(window).scrollTop() == J(document).height() - J(window).height()){
            Z.debug('scroll stopped at the bottom of the page');
            var activePageID = J.mobile.activePage.attr('id');
            if(activePageID == 'library-items-page' && !Zotero.nav.getUrlVar('itemKey')){
                Z.debug("active page is library items page");
                //load more items
                var vpage = (Zotero.state.itemsVPage || 1) + 1;
                Zotero.state.itemsVPage = vpage;
                var library = Zotero.ui.getAssociatedLibrary(J("#library-items-div"));
                Z.debug("virtual page:" + vpage);
                //figure out config
                var effectiveUrlVars = ['itemPage', 'tag', 'collectionKey', 'order', 'sort', 'q'];
                var urlConfigVals = {};
                J.each(effectiveUrlVars, function(index, value){
                    var t = Zotero.nav.getUrlVar(value);
                    if(t){
                        urlConfigVals[value] = t;
                    }
                });
                urlConfigVals.itemPage = vpage;
                
                var defaultConfig = {target:'items',
                                     targetModifier: 'top',
                                     itemPage: 1,
                                     limit: 25,
                                     content: 'json'
                                 };
                
                var newConfig = J.extend({}, defaultConfig, urlConfigVals);
                newConfig['collectionKey'] = urlConfigVals['collectionKey'];//always override collectionKey, even with absence of collectionKey
                newConfig.start = parseInt(newConfig.limit, 10) * (parseInt(newConfig.itemPage, 10) - 1);
                
                Z.debug(newConfig);
                
                var d = library.loadItems(newConfig);
                d.done(function(loadedItems){
                    //library.items.displayItemsArray = library.items.displayItemsArray.concat(loadedItems.itemsArray);
                    var jel = J("#library-items-div ul");
                    
                    J.each(loadedItems.itemsArray, function(ind, item){
                        J("#itemrowTemplate").tmpl({displayFields:Zotero.prefs.library_listShowFields, item:item, field:'title'}).appendTo(jel);
                    });
                    Z.debug(jel);
                    jel.listview('refresh');
                });
                
            }
        }
    });
};

Zotero.ui.mobile.loadMoreItemsInList = function(el, loadedItems){
    
};


//compatibility function between jqueryUI and jqueryMobile dialog functions
Zotero.ui.dialog = function(el, options){
    Z.debug("Zotero.ui.dialog - mobile", 3);
    
    //find the content area of the dialog element we're about to display
    //we need this so we can manually add buttons for compatbility with jqueryUI
    var contentArea = J(el).find('div[data-role="content"]');
    if(!contentArea){
        contentArea = J(el);
    }
    
    //add buttons to mobile dialog ourselves that jqueryui automatically adds
    if(options.buttons){
        J.each(options.buttons, function(key, val){
            var buttonel = J("#dialogbuttonTemplate").tmpl({'title':key}).appendTo(contentArea);
            Zotero.debug("adding button to dialog and binding callback");
            Zotero.debug(buttonel);
            buttonel.bind('click', val).button();
        });
    }
    
    //don't make all the widgets reload when we pushState for the dialog
    Zotero.state.ignoreStatechange = true;
    Zotero.nav.ignoreStateChange();
    
    //change the page including a pushState
    Zotero.ui.mobile.changePage(J(el), {'role':'dialog', 'changeHash':false, 'transition':'pop'}, true);
    
    //make sure jquerymobile enhances injected pieces
    J(el).trigger('create');
    
    //have nav replaceState instead of pushState when leaving the dialog
    Zotero.nav.replacePush = true;
    
    Z.debug("exiting Zotero.ui.dialog - mobile", 3);
};

Zotero.ui.closeDialog = function(el){
    Z.debug("Zotero.ui.closeDialog", 3);
    //get the last page from our page stack
    /*
    Z.debug("going back in history");
    var curHState = History.getState();
    if(typeof curHState !== 'undefined' && curHState.hasOwnProperty('data')){
        var prevPageID = curHState['data']['_zprevPageID'];
        if(prevPageID){

        }
    }
    */
    Zotero.nav.replacePush = false;
    History.back();
    
    //Zotero.state.ignoreStatechange = false;
    //var lastPage = J.mobile.urlHistory.getPrev()['pageUrl'];
    //Zotero.ui.mobile.changePage(lastPage, {'changeHash':false, 'reverse':true, 'transition':'pop'});
    Z.debug("done with closeDialog", 3);
};

Zotero.ui.mobile.goBack = function(){
    Z.debug("Zotero.ui.goBack", 3);
    
    /*
    //get the last page from our page stack
    var lastPage = Zotero.state.pageStack.pop();
    //if url is different just go back in history popstate, otherwise changepage to the pageID
    var state = History.getState();
    var pathname = state.cleanUrl;
    
    if(lastPage && lastPage.url != pathname){
        Z.debug("going back in history");
        History.back();
    }
    else if(lastPage) {
        Z.debug("changing page to " + lastPage.id);
        Zotero.ui.mobile.changePage('#' + lastPage.id, {'changeHash':false, 'reverse':true, 'transition':'slide'}, false);
    }
    else {
        Z.debug("no lastPage in stack", 3);
        History.back();
    }
    */
    History.back();
    //window.history.back();
};

//wrap jquerymobile changepage so we can maintain a history stack that works without urls
Zotero.ui.mobile.changePage = function(target, options, pushPage, state){
    Z.debug("Zotero.ui.mobile.changePage " + target, 3);
    Z.debug(target);
    if(typeof pushPage != 'boolean'){
        pushPage = true;
    }
    
    if(typeof target != "string"){
        Z.debug("Zotero.ui.mobile.changePage string target", 3);
        Z.debug(J(target).attr('id'), 3);
    }
    
    //we never want to change the hash
    if(options){
        options.changeHash = false;
    }
    else{
        options = {changeHash: false};
    }
    
    //var activePageID = J.mobile.activePage.attr('id');
    //var state = History.getState();
    //var pathname = state.cleanUrl;
    
    Z.debug("changing mobile page");
    Z.debug(target);
    J.mobile.changePage(target, options);
    
    //if pushPage push the state onto history stack
    if(pushPage === true){
        Z.debug("pushState after mobile changePage");
        var pageIDString;
        if(typeof target === 'string'){
            pageIDString = target;
        }
        else{
            pageIDString = J(target).attr('id');
        }
        pageIDString = pageIDString.replace('#', '');
        
        if(!state){
            state = {'_zpageID': pageIDString};
        }
        else{
            state['_zpageID'] = pageIDString;
        }
        
        Zotero.nav.pushState(false, state);
    }
    
    //update the active pageID after we've changed the page, regardless of pushState
    //(though it should always be pushing?)
    Z.debug("updateStatePageID for mobile changePage");
    //var activePageID = J.mobile.activePage.attr('id');
    //Zotero.nav.updateStatePageID(activePageID);
};

Zotero.ui.updateCollectionButtons = function(){
    var editCollectionsButtonsList = J(".edit-collections-buttons-list");
    editCollectionsButtonsList.buttonset().show();
    
    //enable modify and delete only if collection is selected
    J("#edit-collections-buttons-div").trigger('create');
    /*
    J(".create-collection-link").button();
    J(".update-collection-link").button();
    J(".delete-collection-link").button();
    */
    
    //enable/disable appropriate buttons if collection is selected
    
    if(Zotero.nav.getUrlVar("collectionKey")){
        J(".update-collection-link").removeClass('ui-disabled');
        J(".delete-collection-link").removeClass('ui-disabled');
    }
    else{
        J(".update-collection-link").addClass('ui-disabled');
        J(".delete-collection-link").addClass('ui-disabled');
    }
};

Zotero.ui.filterGuide = function(el, filters){
    Z.debug('Zotero.ui.filterGuide');
    J(el).empty();
    var library = Zotero.ui.getAssociatedLibrary(el);
    var order = Zotero.config.userDefaultApiArgs.order;
    var sort = Zotero.config.userDefaultApiArgs.sort || 'asc';
    var data = {filters:filters, sort:sort, order:order};
    Z.debug(order);
    Z.debug(sort);
    if(filters['collectionKey']){
        var collection = library.collections[filters['collectionKey']];
        data.collection = collection;
    }
    
    var a = J('#filterguideTemplate').tmpl(data).appendTo(J(el));
    Zotero.ui.createOnActivePage(el);
};

//initialize the library control buttons
Zotero.ui.init.libraryControls = function(){
    Z.debug("Zotero.ui.initControls", 3);
    //show actions link
    J("#zmobile-edit-link").live('click', Zotero.ui.callbacks.toggleEdit);
    
    //set up control panel buttons
    //insert the hidden library preferences and set callbacks
    J("#library-settings-form").hide();
    //Z.config.librarySettingsInit = false;
    J("#sort-by-link").live('click', Zotero.ui.callbacks.sortBy);
    
    //set up addToCollection button to update list when collections are loaded
    J.subscribe("loadCollectionsDone", function(collections){
        Z.debug("loadCollectionsDone callback", 4);
        Zotero.callbacks.loadFilterGuide(J("#filter-guide-div"));
    });
    
    //init itemkey-checkbox to enable/disable buttons that require something being selected
    J("input.itemKey-checkbox").live('change', function(e){
        //Z.debug("itemkey checkbox clicked", 3);
        var checked = J(this).prop('checked');
        //replace list item with new themed list item since JQM can't update individual item theme changes
        //through a listview.refresh()
        var displayFields = Zotero.prefs.library_listShowFields;
        var itemKey = J(this).data('itemkey');
        var library = Z.ui.getAssociatedLibrary(J(this).closest('.ajaxload'));
        var item = library.items.getItem(itemKey);
        var data = {'displayFields': displayFields, 'item': item, 'checked':checked};
        
        //Z.debug("itemKey: " + itemKey);
        //Z.debug(data);
        
        J("#itemrowTemplate").tmpl(data).replaceAll(J(this).closest('li'));
        //update themes for list items based on checkbox status and refresh
        //J(".itemlist-editmode-checkbox:checked").closest('li').attr('data-theme', 'a').removeClass('ui-body-c ui-btn-hover-a ui-btn-up-a ui-btn-up-c').addClass('ui-body-a ui-btn-hover-a ui-btn-up-a');
        //J(".itemlist-editmode-checkbox:not(:checked)").closest('li').attr('data-theme', 'c').removeClass('ui-body-c ui-btn-hover-a ui-btn-up-a ui-btn-up-c').addClass('ui-body-c ui-btn-hover-c ui-btn-up-c');
        J("#field-list").listview('refresh');
        
        Zotero.ui.updateDisabledControlButtons();
    });
    
    //first run to initialize enabled/disabled state of contextually relevant control buttons
    Zotero.ui.updateDisabledControlButtons();
    
    //bind all control buttons to their callback functions
    //J("#edit-checkbox").live('change', Zotero.ui.callbacks.toggleEdit);
    J(".create-collection-link").live('click', Zotero.ui.callbacks.createCollection);
    J(".update-collection-link").live('click', Zotero.ui.callbacks.updateCollection);
    J(".delete-collection-link").live('click', Zotero.ui.callbacks.deleteCollection);
    J(".add-to-collection-link").live('click', Zotero.ui.callbacks.addToCollection);
    J("#create-item-link").live('click', Zotero.ui.callbacks.createItem);
    J(".remove-from-collection-link").live('click', Zotero.ui.callbacks.removeFromCollection);
    J(".move-to-trash-link").live('click', Zotero.ui.callbacks.moveToTrash);
    J(".remove-from-trash-link").live('click', Zotero.ui.callbacks.removeFromTrash);
    J("#cite-link").live('click', Zotero.ui.callbacks.citeItems);
    
    //disable default actions for dialog form submissions
    J(".delete-collection-div form").live('submit', function(e){
        e.preventDefault();
    });
    J(".update-collection-div form").live('submit', function(e){
        e.preventDefault();
    });
    J(".new-collection-div form").live('submit', function(e){
        e.preventDefault();
    });
    J("button.create-collection-button").live('click', function(e){
        e.preventDefault();
    });
    J("button.update-collection-button").live('click', function(e){
        e.preventDefault();
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
    
    if((context == 'library') || (context == 'grouplibrary')){
        var clearQuery = function(e){
            Z.debug("header search changed");
            Z.debug(e);
            Z.debug('-' + J('#header-search-query').val());
            J("#header-search-query").val('');
            Z.debug("q is now empty");
            if(Zotero.nav.getUrlVar('q')){
                Z.debug("q in url is set");
                Zotero.nav.setUrlVar('q', '');
                Zotero.nav.pushState();
            }
        };
        J("#simple-search button.clear-field-button").live('click', clearQuery);
    }
};

//update disabled state for control buttons based on context state
Zotero.ui.updateDisabledControlButtons = function(){
    Z.debug("Zotero.ui.updateDisabledControlButtons - mobile", 3);
    J("#create-item-link").removeClass('ui-disabled');
    if((J(".itemlist-editmode-checkbox:checked").length === 0) && (!Zotero.nav.getUrlVar('itemKey')) ){
        J(".add-to-collection-link").addClass('ui-disabled');
        J(".remove-from-collection-link").addClass('ui-disabled');
        J(".move-to-trash-link").addClass('ui-disabled');
        J(".remove-from-trash-link").addClass('ui-disabled');
    }
    else{
        J(".add-to-collection-link").removeClass('ui-disabled');
        J(".remove-from-collection-link").removeClass('ui-disabled');
        J(".move-to-trash-link").removeClass('ui-disabled');
        if(Zotero.nav.getUrlVar('collectionKey') == 'trash'){
            J(".remove-from-trash-link").removeClass('ui-disabled');
        }
    }
    //only show remove from collection button if inside a collection
    if(!Zotero.nav.getUrlVar("collectionKey")){
        J(".remove-from-collection-link").addClass('ui-disabled');
    }
    //disable create item button if in trash
    else if(Zotero.nav.getUrlVar('collectionKey') == 'trash'){
        J("#create-item-link").addClass('ui-disabled');
        J(".add-to-collection-link").addClass('ui-disabled');
        J(".remove-from-collection-link").addClass('ui-disabled');
    }
    Zotero.ui.init.editButton();
    return;
};

/*
Zotero.ui.init.editButton = function(){
    Z.debug("Zotero.ui.initEditButton", 3);
};
*/
Zotero.ui.showEdit = function(){
    Z.debug("Zotero.ui.showEdit", 3);
    //figure out which pane we're in
    /*
    var activePageID = J.mobile.activePage.attr('id');
    
    if(activePageID == 'library-items-page'){
        var editActive = Zotero.state.itemsEditActive ? true : false;
        if(editActive){
            Zotero.ui.itemsSearchActionPane(J("#items-pane-edit-panel-div"));
            Zotero.state.itemsEditActive = false;
        }
        else {
            Zotero.ui.itemsActionPane(J("#items-pane-edit-panel-div"));
            Zotero.state.itemsEditActive = true;
        }
    }
    else if(activePageID == 'library-collections-page'){
        Zotero.ui.collectionsActionPane(J("#collections-pane-edit-panel-div"));
    }
    
    if(Zotero.nav.getUrlVar('mode') == 'edit'){
        delete(Zotero.nav.urlvars.pathVars['mode']);
        Zotero.nav.pushState();
    }
    else{
        Zotero.nav.urlvars.pathVars['mode'] = 'edit';
        Zotero.nav.pushState();
    }
    */
};

Zotero.ui.itemsSearchActionPane = function(el){
    J(el).empty();
    J("#searchactionpaneTemplate").tmpl({}).appendTo(J(el));
    J(el).trigger('create');
};

Zotero.ui.itemsActionPane = function(el){
    J(el).empty();
    J("#itemsactionpaneTemplate").tmpl({}).appendTo(J(el));
    J(el).trigger('create');
};

Zotero.ui.collectionsActionPane = function(el, show){
    if(show === true){
        J(el).empty();
        J("#collectionsactionpaneTemplate").tmpl({}).appendTo(J(el));
        J(el).trigger('create');
        Zotero.state.collectionsEditActive = true;
    }
    else if(show === false){
        J(el).empty();
        Zotero.state.collectionsEditActive = false;
    }
};

Zotero.ui.bindItemLinks = function(){
    Z.debug("Zotero.ui.bindItemLinks", 3);
    
    J("div#items-pane a.item-select-link").live('click', function(e){
        e.preventDefault();
        e.stopImmediatePropagation();
        Z.debug("item-select-link clicked", 3);
        var editEnabled = Zotero.nav.getUrlVar('mode') == 'edit' ? true : false;
        if(editEnabled){
            var checkbox = J(this).closest('li').find('[type="checkbox"]');
            if(checkbox.prop('checked')){
                checkbox.prop('checked', false).change();
            }
            else{
                checkbox.prop('checked', true).change();
            }
            return false;
        }
        var itemKey = J(this).attr('data-itemKey');
        Z.debug("click " + itemKey, 4);
        Zotero.nav.urlvars.pathVars.itemKey = itemKey;
        Z.debug("pushing state");
        Zotero.nav.pushState();
        //Zotero.callbacks.loadItem(el, 'user', itemKey);
    });
    J("div#items-pane td[data-itemkey]:not(.edit-checkbox-td)").live('click', function(e){
        e.preventDefault();
        Z.debug("item-select-td clicked", 3);
        var itemKey = J(this).attr('data-itemKey');
        Z.debug("click " + itemKey, 4);
        Zotero.nav.urlvars.pathVars.itemKey = itemKey;
        Zotero.nav.pushState();
        //Zotero.callbacks.loadItem(el, 'user', itemKey);
    });
};

//generate html for tags
Zotero.ui.displayTagsFiltered = function(el, libtags, matchedTagStrings, selectedTagStrings){
    Zotero.debug("Zotero.ui.displayTagsFiltered");
    var curPreString = J("#tag-filter-input").val();
    var jel = J(el);
    var showMore = jel.data('showmore');
    if(!showMore){
        showMore = false;
    }
    
    //jel.empty();
    var filteredTags = [];
    var selectedTags = [];
    J.each(matchedTagStrings, function(index, matchedString){
        if(libtags.tagObjects[matchedString] && (J.inArray(matchedString, selectedTagStrings) == (-1))) {
            filteredTags.push(libtags.tagObjects[matchedString]);
        }
    });
    J.each(selectedTagStrings, function(index, selectedString){
        if(libtags.tagObjects[selectedString]){
            selectedTags.push(libtags.tagObjects[selectedString]);
        }
    });
    
    //Z.debug('filteredTags:');
    //Z.debug(filteredTags);
    //Z.debug('selectedTags:');
    //Z.debug(selectedTags);
    
    var passTags;
    if(!showMore){
        passTags = filteredTags.slice(0, 25);
        J("#show-more-tags-link").show();
        J("#show-less-tags-link").hide();
    }
    else{
        passTags = filteredTags;
        J("#show-more-tags-link").hide();
        J("#show-less-tags-link").show();
    }
    
    var tagListEl = J("#tags-list").empty();
    J("#selected-tags-list").replaceWith(J("#tagunorderedlistTemplate").tmpl({tags:selectedTags, id:'selected-tags-list'}));
    J("#tags-list").replaceWith(J("#tagunorderedlistTemplate").tmpl({tags:passTags, id:'tags-list'}));
    
    Z.debug("about to trigger create on tag-lists-container");
    Zotero.ui.createOnActivePage(J("#tag-lists-container"));
    
};

//trigger create event on the active page for jquery-mobile
Zotero.ui.createOnActivePage = function(el){
    Z.debug("Zotero.ui.createOnActivePage");
    if(!Zotero.config.mobile) return;
    if(!el){
        //if element not passed in, just trigger create on the active mobile page
        J.mobile.activePage.trigger('create');
    }
    
    var containingPage = J(el).closest('[data-role="page"]');
    if(J.mobile.activePage.attr('id') == containingPage.attr('id')){
        containingPage.trigger('create').trigger('updatelayout');
    }
};

Zotero.ui.changeTheme = function(el, theme){
    var jel = J(el);
    jel.jqmData('theme', theme);
    jel.closest('div[data-role="page"]').trigger('refresh');
    return;
};

Zotero.ui.callbacks.toggleEdit =  function(e){
    Z.debug("edit button clicked", 3);
    if(Zotero.nav.getUrlVar('mode') != 'edit'){
        Zotero.nav.urlvars.pathVars['mode'] = 'edit';
    }
    else{
        delete Zotero.nav.urlvars.pathVars['mode'];
    }
    Zotero.nav.pushState();
    return false;
};

Zotero.ui.addTag = function(focus) {
    Z.debug("Zotero.ui.addTag", 3);
    if(typeof focus == 'undefined'){
        focus = true;
    }
    var tagnum = 0;
    var lastTagID = J("input[id^='tag_']:last").attr('id');
    if(lastTagID){
        tagnum = parseInt(lastTagID.substr(4), 10);
    }
    
    var newindex = tagnum + 1;
    var jel = J("td.tags");
    J('#itemtagTemplate').tmpl({index:newindex}).appendTo(jel);
    
    J("input.taginput").autocomplete({
        source:function(request, callback){
            var library = Zotero.ui.getAssociatedLibrary(J(this.element.context).closest(".ajaxload"));
            var matchingTagStrings = Zotero.utils.prependAutocomplete(request.term, library.tags.plainList);
            callback(matchingTagStrings);
        },
        select: function(e, ui){
            e.preventDefault();
            e.stopImmediatePropagation();
            var value = ui.item.value;
            Zotero.ui.addTag();
        }
    });
    
    if(focus){
        J("input.taginput").last().focus();
    }
    
    jel.trigger('create');
    //Zotero.ui.init.tagButtons();
};

Zotero.ui.init.tagButtons = function(){
    
    J(".add-remove-tag-container").buttonset();
    J(".remove-tag-link").button({
        text:false,
        icons: {
            primary: "sprite-minus"
        }
    });
    J(".add-tag-link").button({
        text:false,
        icons: {
            primary: "sprite-plus"
        }
    });
};

//generate html for tags
Zotero.ui.displayTagsFiltered = function(el, libtags, matchedTagStrings, selectedTagStrings){
    Zotero.debug("Zotero.ui.displayTagsFiltered");
    //Z.debug(selectedTagStrings);
    var curPreString = J("#tag-filter-input").val();
    var jel = J(el);
    
    //jel.empty();
    var filteredTags = [];
    var selectedTags = [];
    J.each(matchedTagStrings, function(index, matchedString){
        if(libtags.tagObjects[matchedString] && (J.inArray(matchedString, selectedTagStrings) == (-1))) {
            filteredTags.push(libtags.tagObjects[matchedString]);
        }
    });
    J.each(selectedTagStrings, function(index, selectedString){
        if(libtags.tagObjects[selectedString]){
            selectedTags.push(libtags.tagObjects[selectedString]);
        }
    });
    
    //Z.debug('filteredTags:');
    //Z.debug(filteredTags);
    //Z.debug('selectedTags:');
    //Z.debug(selectedTags);
    
    var passTags = filteredTags;
    J("#show-more-tags-link").hide();
    J("#show-less-tags-link").hide();
    
    var tagListEl = J("#tags-list").empty();
    J("#selected-tags-list").replaceWith(J("#tagunorderedlistTemplate").tmpl({tags:selectedTags, id:'selected-tags-list'}));
    J("#tags-list").replaceWith(J("#tagunorderedlistTemplate").tmpl({tags:passTags, id:'tags-list'}));
    
    Zotero.ui.createOnActivePage(el);
};
