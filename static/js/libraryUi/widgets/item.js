Zotero.ui.widgets.item = {};
//TODO: alot of this widget should probably be rewritten
//TODO: trigger showChildren with an extra itemID filter so quick clicks back and forth
//between items don't overwrite with the wrong children?
Zotero.ui.widgets.item.init = function(el){
    var library = Zotero.ui.getAssociatedLibrary(el);
    
    library.listen("displayedItemChanged modeChanged", Zotero.ui.widgets.item.loadItemCallback, {widgetEl: el});
    library.listen("newItem", Zotero.ui.widgets.item.loadItemCallback, {widgetEl: el, newItem:true});
    library.listen("saveItem", Zotero.ui.widgets.item.saveItemCallback, {widgetEl:el});
    library.listen("cancelItemEdit", Zotero.ui.widgets.item.cancelItemEdit, {widgetEl:el});
    library.listen("itemTypeChanged", Zotero.ui.widgets.item.itemTypeChanged, {widgetEl:el});
    library.listen("uploadSuccessful showChildren", Zotero.ui.widgets.item.showChildren, {widgetEl:el});
    
    library.listen("addTag", Zotero.ui.widgets.item.addTag, {widgetEl:el});
    library.listen("removeTag", Zotero.ui.widgets.item.removeTag, {widgetEl:el});
    library.listen("addCreator", Zotero.ui.widgets.item.addCreator, {widgetEl:el});
    library.listen("removeCreator", Zotero.ui.widgets.item.removeCreator, {widgetEl:el});
    
    library.listen("switchTwoFieldCreator", Zotero.ui.widgets.item.switchTwoFieldCreators, {widgetEl:el});
    library.listen("switchSingleFieldCreator", Zotero.ui.widgets.item.switchSingleFieldCreator, {widgetEl:el});
    library.listen("addNote", Zotero.ui.widgets.item.addNote, {widgetEl:el});
    //watch buttons on item field from widget DOM element
    var container = J(el);
    
    container.on('keydown', ".itemDetailForm input", Zotero.ui.widgets.item.itemFormKeydown);
    library.trigger("displayedItemChanged");
};

Zotero.ui.widgets.item.loadItemCallback = function(event){
    Z.debug('Zotero eventful loadItemCallback', 3);
    var widgetEl = J(event.data.widgetEl);
    var triggeringEl = J(event.triggeringElement);
    var loadingPromise;
    
    //clean up RTEs before we end up removing their dom elements out from under them
    Zotero.ui.cleanUpRte(widgetEl);
    /*
    var loadingPromise = widgetEl.data('loadingPromise');
    if(loadingPromise){
        var p = widgetEl.data('loadingPromise');
        return p.then(function(){
            return Zotero.ui.widgets.item.loadItemCallback(event);
        });
    }
    */
    Z.debug("Zotero.callbacks.loadItem", 3);
    var library = Zotero.ui.getAssociatedLibrary(widgetEl);
    //clear contents and show spinner while loading
    widgetEl.empty();
    Zotero.ui.showSpinner(widgetEl);
    
    //if this is a new item: initialize an empty item for the given itemtype
    if(event.data.newItem){
        var itemType = triggeringEl.data("itemtype");
        if(!itemType){
            itemType = 'document';
        }
        var newItem = new Zotero.Item();
        newItem.libraryType = library.libraryType;
        newItem.libraryID = library.libraryID;
        var loadingPromise = newItem.initEmpty(itemType)
        .then(function(item){
            Zotero.ui.widgets.item.editItemForm(widgetEl, item);
            widgetEl.data('newitem', item);
        },
        function(response){
            Zotero.ui.jsNotificationMessage("Error loading item template", 'error');
        });
        /*
        .then(function(){
            widgetEl.removeData('loadingPromise');
        });
        
        widgetEl.data('loadingPromise', loadingPromise);
        */
        return loadingPromise;
    }
    
    //if it is not a new item handled above we must have an itemKey
    //or display something else that's not an item
    var itemKey = Zotero.state.getUrlVar('itemKey');
    if(!itemKey){
        Z.debug("No itemKey - " + itemKey, 3);
        widgetEl.empty();
        //TODO: display information about library like client?
        return Promise.reject(new Error("No itemkey - " + itemKey));
    }
    
    //if we are showing an item, load it from local library of API
    //then display it
    var item = library.items.getItem(itemKey);
    if(item){
        Z.debug("have item locally, loading details into ui", 3);
        loadingPromise = Promise.resolve(item);
    }
    else{
        Z.debug("must fetch item from server", 3);
        var config = {
            'target':'item',
            'libraryType':library.type,
            'libraryID':library.libraryID,
            'itemKey':itemKey
        };
        loadingPromise = library.loadItem(itemKey);
    }
    loadingPromise.then(function(item){
        Z.debug("Library.loadItem done", 3);
        widgetEl.empty();
        
        if(Zotero.state.getUrlVar('mode') == 'edit'){
            Zotero.ui.widgets.item.editItemForm(widgetEl, item);
        }
        else{
            Zotero.ui.widgets.item.loadItemDetail(item, widgetEl);
            library.trigger('showChildren');
        }
        //set currentConfig on element when done displaying
        widgetEl.data('currentconfig', config);
        Zotero.eventful.initTriggers(widgetEl);
    });
    loadingPromise.catch().then(function(){
        widgetEl.removeData('loadingPromise');
    });
    
    widgetEl.data('loadingPromise', loadingPromise);
    return loadingPromise;
};

/**
 * Get an item's children and display summary info
 * @param  {DOM Element} el      element to insert into
 * @param  {string} itemKey key of parent item
 * @return {undefined}
 */
Zotero.ui.widgets.item.showChildren = function(e){
    Z.debug('Zotero.ui.widgets.item.showChildren', 3);
    var widgetEl = J(e.data.widgetEl);
    var itemKey = widgetEl.data('itemkey');
    Z.debug("itemKey: " + itemKey);
    var library = Zotero.ui.getAssociatedLibrary(widgetEl);
    Z.debug("got library");
    Z.debug(library);
    var item = library.items.getItem(itemKey);
    Z.debug('got item');
    Z.debug(item);
    var attachmentsDiv = J(widgetEl).find(".item-attachments-div");
    Zotero.ui.showSpinner(attachmentsDiv);
    Z.debug('getting children');
    var p = item.getChildren(library)
    .then(function(childItems){
        Z.debug("got children");
        var container = widgetEl.find(".item-attachments-div");
        container.html( J('#childitemsTemplate').render({childItems:childItems}) );
        Zotero.state.bindItemLinks(container);
    });
    Z.debug("fired getChildren");
    return p;
};

/**
 * Add creator field to item edit form
 * @param {DOM Button} button Add creator button clicked
 */
Zotero.ui.widgets.item.addCreator = function(e){
    var button = e.triggeringElement;
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
    jel.after( J('#authorelementsdoubleTemplate').render({index:newindex,
                                            creator:{firstName:'', lastName:''},
                                            creatorTypes:Zotero.Item.prototype.creatorTypes[itemType]
                                            }) );
};

/**
 * Remove a creator from an edit item form
 * @param  {Dom Button} button Remove creator button that was clicked
 * @return {undefined}
 */
Zotero.ui.widgets.item.removeCreator = function(e){
    var button = e.currentTarget;
    var widgetEl = Zotero.ui.parentWidgetEl(button);
    Z.debug("Zotero.ui.removeCreator", 3);
    //check to make sure there is another creator field available to use
    //if not add an empty one
    if(widgetEl.find("tr.creator").length === 1){
        Zotero.ui.addCreator(e);
    }
    
    //remove the creator as requested
    J(button).closest('tr').remove();
};

/**
 * Add a note field to an editItem Form
 * @param {Dom Button} button Add note button that was clicked
 */
Zotero.ui.widgets.item.addNote = function(e){
    Z.debug("Zotero.ui.addNote", 3);
    var button = J(e.currentTarget);
    var container = button.closest("form");
    //var itemKey = J(button).data('itemkey');
    var notenum = 0;
    var lastNoteIndex = container.find("textarea.note-text:last").data('noteindex');
    if(lastNoteIndex){
        notenum = parseInt(lastNoteIndex, 10);
    }
    
    var newindex = notenum + 1;
    var newNoteID = "note_" + newindex;
    var jel;
    jel = container.find("td.notes button.add-note-button").before('<textarea cols="40" rows="24" name="' + newNoteID + '" id="' + newNoteID + '" class="rte default note-text" data-noteindex="' + newNoteID + '"></textarea>');
    Zotero.ui.init.rte('default', true, newNoteID);
};

/**
 * Add a tag field to an edit item form
 * @param {bool} focus Whether to focus the newly added tag field
 */
Zotero.ui.widgets.item.addTag = function(e, focus) {
    Z.debug("Zotero.ui.widgets.item.addTag", 3);
    if(typeof focus == 'undefined'){
        focus = true;
    }
    var widgetEl = Zotero.ui.parentWidgetEl(e);
    var tagnum = 0;
    var lastTagID = widgetEl.find("input[id^='tag_']:last").attr('id');
    if(lastTagID){
        tagnum = parseInt(lastTagID.substr(4), 10);
    }
    
    var newindex = tagnum + 1;
    var jel = widgetEl.find("td.tags");
    jel.append( J('#itemtagTemplate').render({index:newindex}) );
    
    var library = Zotero.ui.getAssociatedLibrary(widgetEl);
    if(library){
        var typeaheadSource = library.tags.plainList;
        if(!typeaheadSource){
            typeaheadSource = [];
        }
        widgetEl.find("input.taginput").not('.tt-query').typeahead({name: 'tags', local: typeaheadSource});
    }
    
    if(focus){
        J("input.taginput").last().focus();
    }
};

/**
 * Remove a tag field from an edit item form
 * @param  {DOM Element} el Tag field to remove
 * @return {undefined}
 */
Zotero.ui.widgets.item.removeTag = function(e) {
    Z.debug("Zotero.ui.removeTag", 3);
    var el = e.currentTarget;
    var widgetEl = Zotero.ui.parentWidgetEl(el);
    //check to make sure there is another tag field available to use
    //if not add an empty one
    if(widgetEl.find("div.edit-tag-div").length === 1){
        Zotero.ui.widgets.item.addTag(e);
    }
    
    J(el).closest('.edit-tag-div').remove();
};


/**
 * Display and initialize an edit item form
 * @param  {Dom Element} el   Container
 * @param  {Zotero_Item} item Zotero Item object to associate with form
 * @return {undefined}
 */
Zotero.ui.widgets.item.editItemForm = function(el, item){
    Z.debug("Zotero.ui.widgets.item.editItemForm", 3);
    Z.debug(item, 4);
    var jel = J(el).empty();
    var library = Zotero.ui.getAssociatedLibrary(el);
    if(item.itemType == 'note'){
        Z.debug("editItemForm - note", 3);
        jel.append( J('#editnoteformTemplate').render({item:item,
                                                       library:library,
                                                       itemKey:item.apiObj.key
                                                     }) );
        
        //add empty tag if no tags yet
        if(item.apiObj.tags.length === 0){
            Zotero.ui.widgets.item.addTag(el, false);
        }
        Zotero.ui.init.rte('default');
    }
    else{
        Z.debug("itemType: " + item.apiObj.itemType, 3);
        item.getCreatorTypes(item.apiObj.itemType)
        .then(function(){
            Z.debug("getCreatorTypes done", 3);
            if(item.creators && item.creators.length === 0){
                item.creators.push({creatorType: item.creatorTypes[item.apiObj.data.itemType][0],
                                    first: '',
                                    last: ''
                                    });
                item.apiObj.creators = item.creators;
            }
            jel.append( J('#itemformTemplate').render({item:item,
                                                    library:library,
                                                    itemKey:item.apiObj.key,
                                                    creatorTypes:Zotero.Item.prototype.creatorTypes[item.apiObj.data.itemType],
                                                    }) );
            
            //add empty tag if no tags yet
            if(item.apiObj.tags.length === 0){
                Zotero.ui.widgets.item.addTag(el, false);
            }
            
            Zotero.eventful.initTriggers(jel);
            Zotero.ui.init.rte();
        });
    }
    
    //add autocomplete
    var typeaheadSource = library.tags.plainList;
    if(!typeaheadSource){
        typeaheadSource = [];
    }
    jel.find("input.taginput").typeahead('destroy').typeahead({name: 'tags', local: typeaheadSource});
};


/**
 * Render and display full item details into an element
 * @param  {Zotero_Item} item Zotero Item to display
 * @param  {Dom Element} el   Container
 * @return {undefined}
 */
Zotero.ui.widgets.item.loadItemDetail = function(item, el){
    Z.debug("Zotero.ui.widgets.item.loadItemDetail", 3);
    var jel = J(el);
    jel.empty();
    var parentUrl = false;
    var library = item.owningLibrary
    if(item.parentItemKey){
        parentUrl = library.websiteUrl({itemKey:item.parentItemKey});
    }
    if(item.apiObj.data.itemType == "note"){
        Z.debug("note item", 3);
        jel.append( J('#itemnotedetailsTemplate').render({item:item, parentUrl:parentUrl, libraryString:library.libraryString}) );
    }
    else{
        Z.debug("non-note item", 3);
        jel.append( J('#itemdetailsTemplate').render({item:item, parentUrl:parentUrl, libraryString:library.libraryString}) ).trigger('create');
    }
    Zotero.ui.init.rte('readonly');
    
    try{
        //trigger event for Zotero translator detection
        var ev = document.createEvent('HTMLEvents');
        ev.initEvent('ZoteroItemUpdated', true, true);
        document.dispatchEvent(ev);
    }
    catch(e){
        Zotero.debug("Error triggering ZoteroItemUpdated event", 1);
    }
    
    jel.data('itemkey', item.apiObj.key);
};


/**
 * Callback that will initialize an item save based on new values in an item edit form
 * @param  {event} e DOM Event triggering callback
 * @return {boolean}
 */
Zotero.ui.widgets.item.saveItemCallback = function(e){
    Z.debug("widgets.item.saveItemCallback", 3);
    e.preventDefault();
    var triggeringElement = J(e.triggeringElement);
    var widgetEl = e.data.widgetEl;
    
    Zotero.ui.scrollToTop();
    var library = Zotero.ui.getEventLibrary(e);
    //get our current representation of the item
    var itemKey = triggeringElement.data('itemkey');
    Z.debug("itemKey: " + itemKey, 3);
    var item;
    if(itemKey){
        item = library.items.getItem(itemKey);
        Z.debug("itemKey " + itemKey + ' : ', 3);
    }
    else{
        item = J("#item-details-div").data('newitem');
        Z.debug("newItem : itemTemplate selected from form", 3);
        Z.debug(item, 3);
    }
    Zotero.ui.updateItemFromForm(item, triggeringElement.closest("form"));
    Zotero.ui.saveItem(item);
    return false;
};


Zotero.ui.widgets.item.switchTwoFieldCreators = function(e){
    Z.debug("switch two field creator clicked", 3);
    var jel = J(e.triggeringElement);
    var containingTable = jel.closest('table');
    
    var last, first;
    var name = jel.closest('tr.creator').find("input[id$='_name']").val();
    var split = name.split(' ');
    if(split.length > 1){
        last = split.splice(-1, 1)[0];
        first = split.join(' ');
    }
    else{
        last = name;
        first = '';
    }
    
    var itemType = jel.closest('form').find('select.itemType').val();
    var index = parseInt(jel.closest('tr.creator').attr('id').substr(8), 10);
    var trIdString = '#creator_' + index;
    var creatorType = jel.closest('tr.creator').find("select#creator_" + index + "_creatorType").val();
    jel.closest('tr').replaceWith( J('#authorelementsdoubleTemplate').render({index:"" + index,
                                                creator:{firstName:first, lastName:last, creatorType:creatorType},
                                                creatorTypes:Zotero.Item.prototype.creatorTypes[itemType]
                                                }));
    
    Zotero.eventful.initTriggers(containingTable.find(trIdString));
};

Zotero.ui.widgets.item.switchSingleFieldCreator = function(e){
    Z.debug("switch single field clicked", 3);
    var jel = J(e.triggeringElement);
    var containingTable = jel.closest('table');
    
    var name;
    var firstName = jel.closest('div.creator-input-div').find("input[id$='_firstName']").val();
    var lastName = jel.closest('div.creator-input-div').find("input[id$='_lastName']").val();
    name = firstName + " " + lastName;
    
    var itemType = jel.closest('form').find('select.itemType').val();
    var index = parseInt(jel.closest('tr.creator').attr('id').substr(8), 10);
    var trIdString = '#creator_' + index;
    var creatorType = jel.closest('tr.creator').find("select#creator_" + index + "_creatorType").val();
    jel.closest('tr').replaceWith( J('#authorelementssingleTemplate').render(
                                        {index:""+index,
                                        creator:{name:name},
                                        creatorTypes:Zotero.Item.prototype.creatorTypes[itemType]
                                        }));
    
    Zotero.eventful.initTriggers(containingTable.find(trIdString));
};

Zotero.ui.widgets.item.cancelItemEdit = function(e){
    Zotero.state.clearUrlVars(['itemKey', 'collectionKey', 'tag', 'q']);
    Zotero.state.pushState();
};

Zotero.ui.widgets.item.itemFormKeydown = function(e){
    if ( e.keyCode === Zotero.ui.keyCode.ENTER ){
        e.preventDefault();
        var triggeringEl = J(this);
        if(triggeringEl.hasClass('taginput')){
            if(triggeringEl.hasClass('tt-query')){
                var val = triggeringEl.val();
                triggeringEl.typeahead('setQuery', val);
                triggeringEl.trigger('blur');
            }
            Zotero.trigger("addTag");
            return;
        }
        var nextEligibleSiblings = J(this).nextAll("input, button, textarea, select");
        if(nextEligibleSiblings.length){
            nextEligibleSiblings.first().focus();
        }
        else{
            J(this).closest("tr").nextAll().find("input, button, textarea, select").first().focus();
        }
    }
};


