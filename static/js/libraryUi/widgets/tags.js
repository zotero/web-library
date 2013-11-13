Zotero.ui.widgets.tags = {};

Zotero.ui.widgets.tags.init = function(el){
    Zotero.ui.eventful.listen("tagsDirty", Zotero.ui.widgets.tags.syncTagsCallback, {widgetEl: el});
    Zotero.ui.eventful.listen("cachedDataLoaded", Zotero.ui.widgets.tags.syncTagsCallback, {widgetEl: el});
    Zotero.ui.eventful.listen("libraryTagsUpdated selectedTagsChanged", Zotero.ui.widgets.tags.rerenderTags, {widgetEl: el});
    
    var container = J(el);
    
    //initialize binds for widget
    //send pref to website when showAllTags is toggled
    container.on('click', "#show-all-tags", Zotero.ui.showAllTags);
    container.on('click', "#show-more-tags-link", Zotero.ui.showMoreTags);
    container.on('click', "#show-fewer-tags-link", Zotero.ui.showFewerTags);
    
    //TODO: make sure tag autocomplete works when editing items
    //add tag to item and stop event propogation when tag is selected
    //from autocomplete on an item
    container.on('keydown', ".taginput", function(e){
        if ( e.keyCode === Zotero.ui.keyCode.ENTER ){
            e.preventDefault();
            if(J(this).val() !== ''){
                Zotero.ui.addTag();
                e.stopImmediatePropagation();
            }
        }
    });
    
    //bind tag autocomplete filter in tag widget
    container.on('keyup', "#tag-filter-input", Zotero.ui.callbacks.filterTags);
    
    
    //send pref to website when showAllTags is toggled
    container.on('click', "#show-all-tags", function(e){
        var show = J(this).prop('checked') ? true : false;
        Z.debug("showAllTags is " + show, 4);
        Zotero.utils.setUserPref('library_showAllTags', show);
        Zotero.callbacks.loadTags(J("#tags-list-div"));
    });
    
    container.on('click', "#show-more-tags-link", function(e){
        e.preventDefault();
        var jel = J(this).closest('#tags-list-div');
        jel.data('showmore', true);
        Zotero.callbacks.loadTags(jel);
    });
    container.on('click', "#show-less-tags-link", function(e){
        e.preventDefault();
        var jel = J(this).closest('#tags-list-div');
        jel.data('showmore', false);
        Zotero.callbacks.loadTags(jel);
    });
    
    
    //bind tag autocomplete filter in tag widget
    container.on('keyup', "#tag-filter-input", function(e){
        Z.debug(J('#tag-filter-input').val(), 3);
        Z.debug("value:" + J('#tag-filter-input').val(), 4);
        var library = Zotero.ui.getAssociatedLibrary(J('#tag-filter-input').closest('.ajaxload'));
        var libraryTagsPlainList = library.tags.plainList;
        var matchingTagStrings = Zotero.utils.matchAnyAutocomplete(J('#tag-filter-input').val(), libraryTagsPlainList);
        Zotero.ui.displayTagsFiltered(J('#tags-list-div'), library.tags, matchingTagStrings, []);
        Z.debug(matchingTagStrings, 4);
    });
    
    //bind refresh link to pull down fresh set of tags until there is a better way to
    //check for updated/removed tags in API
    container.on('click', '#refresh-tags-link', function(e){
        e.preventDefault();
        var library = Zotero.ui.getAssociatedLibrary(J('#tag-filter-input').closest('.ajaxload'));
        Zotero.callbacks.loadTags(J("#tags-list-div"), false);
        return false;
    });
};

Zotero.ui.widgets.tags.syncTagsCallback = function(event){
    Z.debug('Zotero eventful syncTagsCallback', 1);
    var widgetEl = event.data.widgetEl;
    var el = widgetEl;
    var checkCached = event.data.checkCached;
    if(checkCached !== false){
        checkCached = true; //default to using the cache
    }
    
    Zotero.nav.flagLoading(el);
    var jel = J(el);
    
    //get Zotero.Library object if already bound to element
    var library = Zotero.ui.getAssociatedLibrary(el);
    //clear tags if we're explicitly not using cached tags
    if(checkCached === false){
        library.tags.clear();
    }
    
    //sync tags if loaded from cache but not synced
    if(library.tags.loaded && (!library.tags.synced)){
        Z.debug("tags loaded but not synced - loading updated", 3);
        var syncD = library.loadUpdatedTags();
        syncD.done(J.proxy(function(){
            Zotero.nav.doneLoading(el);
            Zotero.ui.eventful.trigger("libraryTagsUpdated");
        }, this) );
        syncD.fail(J.proxy(function(){
            //sync failed, but we still have some local data, so show that
            Zotero.ui.eventful.trigger("libraryTagsUpdated");
            Zotero.nav.doneLoading(el);
        }, this) );
        return;
    }
    else if(library.tags.loaded){
        Zotero.ui.eventful.trigger("libraryTagsUpdated");
        Zotero.nav.doneLoading(el);
        return;
    }
    
    //load all tags if we don't have any cached
    Zotero.ui.showSpinner(J(el).find('div.loading'));
    var d = library.loadAllTags({}, checkCached);
    d.done(J.proxy(function(tags){
        Z.debug("finished loadAllTags", 3);
        library.tags.tagsVersion = library.tags.syncState.earliestVersion;
        if(library.tags.syncState.earliestVersion == library.tags.syncState.latestVersion){
            library.tags.synced = true;
        }
        else {
            //TODO: fetch tags ?newer=tagsVersion
        }
        J(el).find('div.loading').empty();
        Z.debug(tags, 5);
        library.tags.loaded = true;
        //library.tags.loadedConfig = newConfig;
        J(el).children('.loading').empty();
        Zotero.nav.doneLoading(el);
        Zotero.ui.eventful.trigger("libraryTagsUpdated");
    }, this));
    
    d.fail(J.proxy(function(jqxhr, textStatus, errorThrown){
        var elementMessage = Zotero.ui.ajaxErrorMessage(jqxhr);
        jel.html("<p>" + elementMessage + "</p>");
    }));
    
    return;
};

Zotero.ui.widgets.tags.rerenderTags = function(event){
    Zotero.debug("Zotero eventful rerenderTags");
    var widgetEl = event.data.widgetEl;
    var el = widgetEl;
    var jel = J(el);
    
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
    
    jel.children(".loading").empty();
    var library = Zotero.ui.getAssociatedLibrary(el);
    var plainList = library.tags.plainTagsList(library.tags.tagsArray);
    Zotero.ui.displayTagsFiltered(el, library.tags, plainList, selectedTags);
};

//generate html for tags
/**
 * Display filtered list of tags
 * @param  {Dom element} el                 Container
 * @param  {Zotero_Tags} libtags            Zotero_Tags object
 * @param  {array} matchedTagStrings  tags that matched the filter string
 * @param  {array} selectedTagStrings tags that are currently selected
 * @return {undefined}
 */
Zotero.ui.displayTagsFiltered = function(el, libtags, matchedTagStrings, selectedTagStrings){
    Zotero.debug("Zotero.ui.displayTagsFiltered");
    Z.debug(selectedTagStrings, 4);
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
    
    var passTags;
    if(!showMore){
        passTags = filteredTags.slice(0, 25);
        J("#show-more-tags-link").show();
        J("#show-fewer-tags-link").hide();
    }
    else{
        passTags = filteredTags;
        J("#show-more-tags-link").hide();
        J("#show-fewer-tags-link").show();
    }
    
    var tagListEl = J("#tags-list").empty();
    J("#selected-tags-list").replaceWith(J('#tagunorderedlistTemplate').render({tags:selectedTags, id:'selected-tags-list'}));
    J("#tags-list").replaceWith(J('#tagunorderedlistTemplate').render({tags:passTags, id:'tags-list'}));
    
};

Zotero.ui.showAllTags = function(e){
    var show = J(this).prop('checked') ? true : false;
    Z.debug("showAllTags is " + show, 4);
    Zotero.utils.setUserPref('library_showAllTags', show);
    Zotero.callbacks.loadTags(J("#tags-list-div"));
};

Zotero.ui.showMoreTags = function(e){
    e.preventDefault();
    var jel = J(this).closest('#tags-list-div');
    jel.data('showmore', true);
    Zotero.callbacks.loadTags(jel);
};

Zotero.ui.showFewerTags = function(e){
    e.preventDefault();
    var jel = J(this).closest('#tags-list-div');
    jel.data('showmore', false);
    Zotero.callbacks.loadTags(jel);
};


/**
 * Bind tag links to take appropriate action rather than following the link
 * @return {undefined}
 */
Zotero.ui.bindTagLinks = function(){
    Z.debug("Zotero.ui.bindTagLinks", 3);
    J("#tags-list-div, #items-pane").on('click', 'a.tag-link', function(e){
        e.preventDefault();
        J("#tag-filter-input").val('');
        Z.debug("tag-link clicked", 4);
        var tagtitle = J(this).attr('data-tagtitle');
        Zotero.nav.toggleTag(tagtitle);
        Z.debug("click " + tagtitle, 4);
        Zotero.nav.clearUrlVars(['tag', 'collectionKey']);
        Zotero.nav.pushState();
    });
};


Zotero.ui.callbacks.filterTags = function(e){
    Z.debug("Zotero.ui.callbacks.filterTags");
    var library = Zotero.ui.getAssociatedLibrary(J('#tag-filter-input').closest('.ajaxload'));
    var libraryTagsPlainList = library.tags.plainList;
    var matchingTagStrings = Zotero.utils.matchAnyAutocomplete(J('#tag-filter-input').val(), libraryTagsPlainList);
    Zotero.ui.displayTagsFiltered(J('#tags-list-div'), library.tags, matchingTagStrings, []);
    Z.debug(matchingTagStrings, 4);
};

