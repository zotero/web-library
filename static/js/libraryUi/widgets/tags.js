Zotero.ui.widgets.tags = {};

Zotero.ui.widgets.tags.init = function(el){
    Z.debug("tags widget init", 3);
    var library = Zotero.ui.getAssociatedLibrary(el);
    
    library.listen("tagsDirty", Zotero.ui.widgets.tags.syncTags, {widgetEl: el});
    library.listen("cachedDataLoaded", Zotero.ui.widgets.tags.syncTags, {widgetEl: el});
    library.listen("tagsChanged libraryTagsUpdated selectedTagsChanged", Zotero.ui.widgets.tags.rerenderTags, {widgetEl: el});
    
    var container = J(el);
    
    //initialize binds for widget
    Zotero.state.bindTagLinks(container);
    //TODO: make sure tag autocomplete works when editing items
    //add tag to item and stop event propogation when tag is selected
    //from autocomplete on an item
    
    //bind tag autocomplete filter in tag widget
    container.on('keyup', "#tag-filter-input", Zotero.ui.widgets.tags.filterTags);
    
    
    //send pref to website when showAutomaticTags is toggled
    container.on('click', "#show-automatic-tags", function(e){
        var show = J(this).prop('checked') ? true : false;
        Z.debug("showAutomaticTags is " + show, 4);
        Zotero.preferences.setPref('showAutomaticTags', show);
        Zotero.preferences.persist();
        
        library.trigger('libraryTagsUpdated');
    });
    
    container.on('click', "#show-more-tags-link", function(e){
        e.preventDefault();
        var jel = J(this).closest('#tags-list-div');
        jel.data('showmore', true);
        library.trigger('libraryTagsUpdated');
    });
    container.on('click', "#show-fewer-tags-link", function(e){
        e.preventDefault();
        var jel = J(this).closest('#tags-list-div');
        jel.data('showmore', false);
        library.trigger('libraryTagsUpdated');
    });
    
};

Zotero.ui.widgets.tags.syncTags = function(evt){
    Z.debug('Zotero eventful syncTags', 3);
    var widgetEl = J(evt.data.widgetEl);
    var loadingPromise = widgetEl.data('loadingPromise');
    if(loadingPromise){
        var p = widgetEl.data('loadingPromise');
        return p.then(function(){
            return Zotero.ui.widgets.tags.syncTags(evt);
        }).catch(Zotero.catchPromiseError);
    }
    
    var checkCached = evt.data.checkCached;
    if(checkCached !== false){
        checkCached = true; //default to using the cache
    }
    
    Zotero.ui.showSpinner(widgetEl.find('div.loading'));
    
    //get Zotero.Library object if already bound to element
    var library = Zotero.ui.getAssociatedLibrary(widgetEl);
    //clear tags if we're explicitly not using cached tags
    if(checkCached === false){
        library.tags.clear();
    }
    
    //cached tags are preloaded with library if the cache is enabled
    //this function shouldn't be triggered until that has already been done
    loadingPromise = library.loadUpdatedTags()
    .then(function(){
        Z.debug("syncTags done. clearing loading div");
        widgetEl.find('.loading').empty();
        library.trigger("libraryTagsUpdated");
        //remove loadingPromise
        widgetEl.removeData('loadingPromise');
    },
    function(error){
        Z.error("syncTags failed. showing local data and clearing loading div");
        Z.error(error);
        Z.error(error.get());
        //sync failed, but we still have some local data, so show that
        library.trigger("libraryTagsUpdated");
        widgetEl.find('.loading').empty();
        //remove loadingPromise
        widgetEl.removeData('loadingPromise');
        Zotero.ui.jsNotificationMessage("There was an error syncing tags. Some tags may not have been updated.", 'notice');
    });
    
    widgetEl.data('loadingPromise', loadingPromise);
    return loadingPromise;
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
    Zotero.ui.widgets.tags.displayTagsFiltered(widgetEl, library, plainList, selectedTags);
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
Zotero.ui.widgets.tags.displayTagsFiltered = function(el, library, matchedTagStrings, selectedTagStrings){
    Zotero.debug("Zotero.ui.widgets.tags.displayTagsFiltered", 3);
    Z.debug(selectedTagStrings, 4);
    var curPreString = J("#tag-filter-input").val();
    var jel = J(el);
    var libtags = library.tags;
    var tagColors = library.preferences.getPref("tagColors");
    if(!tagColors) tagColors = [];
    var showMore = jel.data('showmore');
    if(!showMore){
        showMore = false;
    }
    var coloredTags = [];
    var tagColorStrings = [];
    J.each(tagColors, function(index, tagColor){
        tagColorStrings.push(tagColor.name.toLowerCase());
        var coloredTag = libtags.getTag(tagColor.name);
        if(coloredTag){
            coloredTag.color = tagColor.color;
            coloredTags.push(coloredTag);
        }
    });
    
    var filteredTags = [];
    var selectedTags = [];
    J.each(matchedTagStrings, function(index, matchedString){
        if(libtags.tagObjects[matchedString] && 
            (libtags.tagObjects[matchedString].apiObj.meta.numItems > 0) &&
            (J.inArray(matchedString, selectedTagStrings) == (-1)) &&
            (J.inArray(matchedString, tagColorStrings) == (-1)) ) {
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
    J("#colored-tags-list").replaceWith(J('#coloredtaglistTemplate').render({tags:coloredTags}));
    J("#selected-tags-list").replaceWith(J('#tagunorderedlistTemplate').render({tags:selectedTags, id:'selected-tags-list'}));
    J("#tags-list").replaceWith(J('#tagunorderedlistTemplate').render({tags:passTags, id:'tags-list'}));
};

Zotero.ui.widgets.tags.filterTags = function(e){
    Z.debug("Zotero.ui.widgets.tags.filterTags", 3);
    var library = Zotero.ui.getAssociatedLibrary(J('#tag-filter-input').closest('.eventfulwidget'));
    var libraryTagsPlainList = library.tags.plainList;
    var matchingTagStrings = Zotero.utils.matchAnyAutocomplete(J('#tag-filter-input').val(), libraryTagsPlainList);
    Zotero.ui.widgets.tags.displayTagsFiltered(J('#tags-list-div'), library, matchingTagStrings, []);
    Z.debug(matchingTagStrings, 4);
};

