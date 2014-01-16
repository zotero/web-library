Zotero.ui.widgets.tags = {};

Zotero.ui.widgets.tags.init = function(el){
    Zotero.ui.eventful.listen("tagsDirty", Zotero.ui.widgets.tags.syncTags, {widgetEl: el});
    Zotero.ui.eventful.listen("cachedDataLoaded", Zotero.ui.widgets.tags.syncTags, {widgetEl: el});
    Zotero.ui.eventful.listen("libraryTagsUpdated selectedTagsChanged", Zotero.ui.widgets.tags.rerenderTags, {widgetEl: el});
    
    var container = J(el);
    
    //initialize binds for widget
    //send pref to website when showAllTags is toggled
    container.on('click', "#show-all-tags", Zotero.ui.showAllTags);
    container.on('click', "#show-more-tags-link", Zotero.ui.showMoreTags);
    container.on('click', "#show-fewer-tags-link", Zotero.ui.showFewerTags);
    
    Zotero.ui.bindTagLinks();
    //TODO: make sure tag autocomplete works when editing items
    //add tag to item and stop event propogation when tag is selected
    //from autocomplete on an item
    
    //bind tag autocomplete filter in tag widget
    container.on('keyup', "#tag-filter-input", Zotero.ui.widgets.tags.filterTags);
    
    
    //send pref to website when showAllTags is toggled
    container.on('click', "#show-all-tags", function(e){
        var show = J(this).prop('checked') ? true : false;
        Z.debug("showAllTags is " + show, 4);
        Zotero.utils.setUserPref('library_showAllTags', show);
        Zotero.ui.eventful.trigger('libraryTagsUpdated');
    });
    
    container.on('click', "#show-more-tags-link", function(e){
        e.preventDefault();
        var jel = J(this).closest('#tags-list-div');
        jel.data('showmore', true);
        Zotero.ui.eventful.trigger('libraryTagsUpdated');
    });
    container.on('click', "#show-less-tags-link", function(e){
        e.preventDefault();
        var jel = J(this).closest('#tags-list-div');
        jel.data('showmore', false);
        Zotero.ui.eventful.trigger('libraryTagsUpdated');
    });
    
};

Zotero.ui.widgets.tags.syncTags = function(event){
    Z.debug('Zotero eventful syncTags', 1);
    var widgetEl = J(event.data.widgetEl);
    var checkCached = event.data.checkCached;
    if(checkCached !== false){
        checkCached = true; //default to using the cache
    }
    
    Zotero.state.flagLoading(widgetEl);
    Zotero.ui.showSpinner(widgetEl.find('div.loading'));
    
    //get Zotero.Library object if already bound to element
    var library = Zotero.ui.getAssociatedLibrary(widgetEl);
    //clear tags if we're explicitly not using cached tags
    if(checkCached === false){
        library.tags.clear();
    }
    
    //cached tags are preloaded with library if the cache is enabled
    //this function shouldn't be triggered until that has already been done
    return library.loadUpdatedTags()
    .then(function(){
        Zotero.state.doneLoading(widgetEl);
        widgetEl.find('.loading').empty();
        Zotero.ui.eventful.trigger("libraryTagsUpdated");
    },
    function(){
        //sync failed, but we still have some local data, so show that
        Zotero.ui.eventful.trigger("libraryTagsUpdated");
        Zotero.state.doneLoading(widgetEl);
        widgetEl.children('.loading').empty();
        //TODO: display error as well
    });
};

Zotero.ui.widgets.tags.rerenderTags = function(event){
    Zotero.debug("Zotero eventful rerenderTags", 3);
    var widgetEl = J(event.data.widgetEl);
    
    // put the selected tags into an array
    var selectedTags = Zotero.state.getUrlVar('tag');
    if(!J.isArray(selectedTags)){
        if(selectedTags) {
            selectedTags = [selectedTags];
        }
        else {
            selectedTags = [];
        }
    }
    
    widgetEl.children(".loading").empty();
    var library = Zotero.ui.getAssociatedLibrary(widgetEl);
    var plainList = library.tags.plainTagsList(library.tags.tagsArray);
    Zotero.ui.displayTagsFiltered(widgetEl, library.tags, plainList, selectedTags);
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
    Zotero.debug("Zotero.ui.displayTagsFiltered", 3);
    Z.debug(selectedTagStrings, 4);
    var curPreString = J("#tag-filter-input").val();
    var jel = J(el);
    var showMore = jel.data('showmore');
    if(!showMore){
        showMore = false;
    }
    
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
    Zotero.ui.eventful.trigger('libraryTagsUpdated');
};

Zotero.ui.showMoreTags = function(e){
    e.preventDefault();
    var jel = J(this).closest('#tags-list-div');
    jel.data('showmore', true);
    Zotero.ui.eventful.trigger('libraryTagsUpdated');
};

Zotero.ui.showFewerTags = function(e){
    e.preventDefault();
    var jel = J(this).closest('#tags-list-div');
    jel.data('showmore', false);
    Zotero.ui.eventful.trigger('libraryTagsUpdated');
};


/**
 * Bind tag links to take appropriate action rather than following the link
 * @return {undefined}
 */
Zotero.ui.bindTagLinks = function(container){
    Z.debug("Zotero.ui.bindTagLinks", 3);
    J(container).on('click', 'a.tag-link', function(e){
        e.preventDefault();
        J("#tag-filter-input").val('');
        var tagtitle = J(this).attr('data-tagtitle');
        Zotero.state.toggleTag(tagtitle);
        Zotero.state.clearUrlVars(['tag', 'collectionKey']);
        Zotero.state.pushState();
    });
};

Zotero.ui.widgets.tags.filterTags = function(e){
    Z.debug("Zotero.ui.widgets.tags.filterTags", 3);
    var library = Zotero.ui.getAssociatedLibrary(J('#tag-filter-input').closest('.eventfulwidget'));
    var libraryTagsPlainList = library.tags.plainList;
    var matchingTagStrings = Zotero.utils.matchAnyAutocomplete(J('#tag-filter-input').val(), libraryTagsPlainList);
    Zotero.ui.displayTagsFiltered(J('#tags-list-div'), library.tags, matchingTagStrings, []);
    Z.debug(matchingTagStrings, 4);
};

