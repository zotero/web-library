Zotero.ui.widgets.item = {};
//TODO: trigger showChildren with an extra itemID filter so quick clicks back and forth
//between items don't overwrite with the wrong children?
Zotero.ui.widgets.item.init = function(el){
    var library = Zotero.ui.getAssociatedLibrary(el);
    
    library.listen("displayedItemChanged modeChanged", Zotero.ui.widgets.item.loadItem, {widgetEl: el});
    library.listen("itemTypeChanged", Zotero.ui.widgets.item.itemTypeChanged, {widgetEl:el});
    library.listen("uploadSuccessful", Zotero.ui.widgets.item.refreshChildren, {widgetEl:el});
    
    library.listen("addTag", Zotero.ui.widgets.item.addTag, {widgetEl:el});
    library.listen("removeTag", Zotero.ui.widgets.item.removeTag, {widgetEl:el});
    library.listen("addCreator", Zotero.ui.widgets.item.addCreator, {widgetEl:el});
    library.listen("removeCreator", Zotero.ui.widgets.item.removeCreator, {widgetEl:el});
    
    library.listen("switchCreatorFields", Zotero.ui.widgets.item.switchCreatorFields, {widgetEl:el});
    
    library.listen("addNote", Zotero.ui.widgets.item.addNote, {widgetEl:el});
    library.listen("tagsChanged", Zotero.ui.widgets.item.updateTypeahead, {widgetEl:el});

    library.listen("showChildren", Zotero.ui.widgets.item.refreshChildren, {widgetEl:el});
    
    
    library.listen("edit-item-field", Zotero.ui.widgets.item.clickToEdit, {widgetEl:el});
    library.listen("edit-creator-field", Zotero.ui.widgets.item.clickToEdit, {widgetEl:el});
    
    //watch buttons on item field from widget DOM element
    var container = J(el);
    
    Zotero.state.bindTagLinks(container);
    container.on('keydown', ".itemDetailForm input", Zotero.ui.widgets.item.itemFormKeydown);
    
    container.on('blur', 'input,textarea,select', function(e){
        Z.debug("blurred");
        var input = J(this);
        var itemKey = input.data('itemkey');
        var item = library.items.getItem(itemKey);
        var updatedField = input.attr('name');
        var updatedValue = input.val();
        var creatorIndex = input.data('creatorindex');
        Z.debug(updatedField);
        Z.debug(updatedValue);
        var templateData = {
            item:item,
            key: updatedField,
            value: updatedValue,
            itemKey: itemKey,
            libraryString: library.libraryString,
            creatorIndex: creatorIndex,
        };

        if(creatorIndex !== undefined){
            input.replaceWith(J("#datafieldspanTemplate").render(templateData));
            var row = J("tr.creator-row[data-creatorindex='" + creatorIndex + "']");
            var updatedCreator = Zotero.ui.widgets.item.creatorFromRow(row);
            Zotero.ui.widgets.item.updateItemCreatorField(library, itemKey, updatedCreator, creatorIndex);
        }
        else {
            Zotero.ui.widgets.item.updateItemField(library, itemKey, updatedField, updatedValue);
            input.replaceWith(J("#datafieldspanTemplate").render(templateData));
        }

        Zotero.eventful.initTriggers(container);
    });

    library.trigger("displayedItemChanged");
};

Zotero.ui.widgets.item.loadItem = function(event){
    Z.debug('Zotero eventful loadItem', 3);
    var widgetEl = J(event.data.widgetEl);
    var itemInfoPanel = widgetEl.find('#item-info-panel');
    var triggeringEl = J(event.triggeringElement);
    var loadingPromise;
    
    //clean up RTEs before we end up removing their dom elements out from under them
    Zotero.ui.cleanUpRte(widgetEl);
    
    var library = Zotero.ui.getAssociatedLibrary(widgetEl);
    //clear contents and show spinner while loading
    itemInfoPanel.empty();
    Zotero.ui.showSpinner(itemInfoPanel);
    
    //get the key of the item we need to display, or display library stats
    var itemKey = Zotero.state.getUrlVar('itemKey');
    if(!itemKey){
        Z.debug("No itemKey - " + itemKey, 3);
        itemInfoPanel.empty();
        Zotero.ui.widgets.item.displayStats(library, widgetEl);
        return Promise.reject(new Error("No itemkey - " + itemKey));
    }
    
    //if we are showing an item, load it from local library of API
    //then display it
    var loadedItem = library.items.getItem(itemKey);
    if(loadedItem){
        Z.debug("have item locally, loading details into ui", 3);
        loadingPromise = Promise.resolve(loadedItem);
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
        loadedItem = item;
    }).then(function(){
        return loadedItem.getCreatorTypes(loadedItem.get('itemType'));
    }).then(function(creatorTypes){
        itemInfoPanel.empty();
        Zotero.ui.widgets.item.loadItemDetail(loadedItem, widgetEl);
        library.trigger('showChildren');
        Zotero.eventful.initTriggers(widgetEl);
    });
    loadingPromise.catch(function(err){
        Z.error("loadItem promise failed");
        Z.error(err);
    }).then(function(){
        widgetEl.removeData('loadingPromise');
    }).catch(Zotero.catchPromiseError);
    
    widgetEl.data('loadingPromise', loadingPromise);
    return loadingPromise;
};

/**
 * Add creator field to item edit form
 * @param {DOM Button} button Add creator button clicked
 */
Zotero.ui.widgets.item.addCreator = function(e){
    Z.debug("widgets.item.addCreator", 3);
    var triggeringElement = J(e.triggeringElement);
    var widgetEl = J(e.data.widgetEl);
    var library = Zotero.ui.getAssociatedLibrary(e.data.widgetEl);
    var itemKey = triggeringElement.data('itemkey');
    var item = library.items.getItem(itemKey);
    var newCreatorIndex = item.get('creators').length;
    
    widgetEl.find("tr.creator-row").last().after(J("#creatorrowTemplate").render({}, {
        creatorIndex: newCreatorIndex,
        libraryString: library.libraryString,
        item: item,
    }));

    Zotero.eventful.initTriggers(widgetEl);
};

/**
 * Remove a creator from an edit item form
 * @param  {Dom Button} button Remove creator button that was clicked
 * @return {undefined}
 */
Zotero.ui.widgets.item.removeCreator = function(e){
    Z.debug("widgets.item.removeCreator", 3);
    var triggeringElement = J(e.triggeringElement);
    var widgetEl = J(e.data.widgetEl);
    var library = Zotero.ui.getAssociatedLibrary(e.data.widgetEl);
    var itemKey = triggeringElement.data('itemkey');
    var item = library.items.getItem(itemKey);
    var creatorIndex = triggeringElement.data('creatorindex');
    
    //empty specified creator from item and save
    var creators = item.get('creators');
    creators.splice(creatorIndex, 1);
    Zotero.ui.saveItem(item);

    //re-render creator rows so they are re-indexed
    var oldRows = widgetEl.find("tr.creator-row");
    var oldRowCount = oldRows.length;
    for(var i = 0; i < creators.length; i++){
        widgetEl.find("tr.creator-row").last().after(J("#creatorrowTemplate").render(creators[i], {
            creatorIndex: i,
            libraryString: library.libraryString,
            item: item,
        }));
    }

    oldRows.remove();

    Zotero.eventful.initTriggers(widgetEl);
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
    var jel = widgetEl.find("td.tags");
    jel.append( J('#itemtagTemplate').render({'library':library}) );
    
    var library = Zotero.ui.getAssociatedLibrary(widgetEl);
    if(library){
        Zotero.ui.widgets.item.addTagTypeahead(library, widgetEl);

        //widgetEl.find("input.taginput").not('.tt-query').typeahead({name: 'tags', local: library.tags.plainList});
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
    var el = e.triggeringElement;
    var widgetEl = Zotero.ui.parentWidgetEl(el);
    //check to make sure there is another tag field available to use
    //if not add an empty one
    if(widgetEl.find("div.edit-tag-div").length === 1){
        Zotero.ui.widgets.item.addTag(e);
    }
    
    J(el).closest('.edit-tag-div').remove();
};

Zotero.ui.widgets.item.addTagTypeahead = function(library, widgetEl){
    Z.debug('adding typeahead', 3);
    var typeaheadSource = library.tags.plainList;
    if(!typeaheadSource){
        typeaheadSource = [];
    }
    var ttEngine = new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        local: J.map(typeaheadSource, function(typeaheadSource) { return { value: typeaheadSource }; })
    });
    ttEngine.initialize();
    widgetEl.find("input.taginput").typeahead('destroy');
    widgetEl.find("input.taginput").typeahead(
        {
            hint: true,
            highlight: true,
            minLength: 1
        },
        {
            name: 'tags',
            displayKey: 'value',
            source: ttEngine.ttAdapter()
            //local: library.tags.plainList
        }
    );
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
    itemInfoPanel = jel.find("#item-info-panel");
    itemInfoPanel.empty();
    var parentUrl = false;
    var library = item.owningLibrary
    if(item.apiObj.data.parentItem){
        parentUrl = library.websiteUrl({itemKey:item.apiObj.data.parentItem});
    }
    if(item.apiObj.data.itemType == "note"){
        Z.debug("note item", 3);
        itemInfoPanel.append( J('#itemnotedetailsTemplate').render({item:item, parentUrl:parentUrl, libraryString:library.libraryString}) );
    }
    else{
        Z.debug("non-note item", 3);
        jel.empty().append( J('#itemdetailsTemplate').render({item:item, parentUrl:parentUrl, libraryString:library.libraryString}) );
    }
    Zotero.ui.init.rte('readonly');
    
    try{
        //trigger event for Zotero translator detection
        var ev = document.createEvent('HTMLEvents');
        ev.initEvent('ZoteroItemUpdated', true, true);
        document.dispatchEvent(ev);
    }
    catch(e){
        Zotero.error("Error triggering ZoteroItemUpdated event");
    }
    jel.data('itemkey', item.apiObj.key);
};

//get stats from library.items and display them in the item info pane when we
//don't have a selected item to show
Zotero.ui.widgets.item.displayStats = function(library, widgetEl) {
    Z.debug("Zotero.ui.widgets.item.displayStats", 3);
    var totalResults = library.items.totalResults;
    if(totalResults){
        J(widgetEl).html("<p class='item-count'>" + totalResults + " items in this view</p>");
    }
};


/**
 * Get an item's children and display summary info
 * @param  {DOM Element} el      element to insert into
 * @param  {string} itemKey key of parent item
 * @return {undefined}
 */
Zotero.ui.widgets.item.refreshChildren = function(e){
    Z.debug('Zotero.ui.widgets.item.refreshChildren', 3);
    var widgetEl = J(e.data.widgetEl);
    var childrenPanel = widgetEl.find("#item-children-panel");
    var library = Zotero.ui.getAssociatedLibrary(widgetEl);
    var itemKey = Zotero.state.getUrlVar('itemKey');
    if(!itemKey){
        Z.debug("No itemKey - " + itemKey, 3);
        widgetEl.empty();
        //TODO: display information about library like client?
        return Promise.reject(new Error("No itemkey - " + itemKey));
    }
    
    var item = library.items.getItem(itemKey);
    
    Zotero.ui.showSpinner(childrenPanel);
    var p = item.getChildren(library)
    .then(function(childItems){
        var container = childrenPanel;
        container.html( J('#childitemsTemplate').render({childItems:childItems}) );
        Zotero.state.bindItemLinks(container);
    })
    .catch(Zotero.catchPromiseError);
    return p;
};

Zotero.ui.widgets.item.itemFormKeydown = function(e){
    if ( e.keyCode === Zotero.ui.keyCode.ENTER ){
        Z.debug(e);
        e.preventDefault();
        var triggeringEl = J(this);
        if(triggeringEl.hasClass('taginput')){
            var library = Zotero.ui.getAssociatedLibrary(triggeringEl);
            if(triggeringEl.hasClass('tt-query')){
                var val = triggeringEl.val();
                triggeringEl.typeahead('setQuery', val);
                triggeringEl.trigger('blur');
            }
            if(library){
                library.trigger("addTag");
            }
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

Zotero.ui.widgets.item.updateTypeahead = function(event){
    Z.debug("updateTypeahead", 3);
    var widgetEl = J(event.data.widgetEl);
    var triggeringEl = J(event.triggeringElement);
    var library = Zotero.ui.getAssociatedLibrary(widgetEl);
    if(library){
        Zotero.ui.widgets.item.addTagTypeahead(library, widgetEl);
    }
};



//switch an item field to a form input when clicked to edit (and is editable by the user)
Zotero.ui.widgets.item.clickToEdit = function(e){
    Z.debug("widgets.item.clickToEdit", 3);
    var triggeringElement = J(e.triggeringElement);
    var widgetEl = J(e.data.widgetEl);
    var library = Zotero.ui.getAssociatedLibrary(e.data.widgetEl);
    var itemField = triggeringElement.data('itemfield');
    var itemKey = triggeringElement.data('itemkey');
    var creatorIndex = triggeringElement.data('creatorindex');
    var item = library.items.getItem(itemKey);
    var creators = item.get('creators');
    var fieldValue = "";
    if(creatorIndex && creators[creatorIndex]){
        fieldValue = creators[creatorIndex][itemField];
    } else {
        fieldValue = item.get(itemField);
    }

    triggeringElement.replaceWith(J("#datafieldTemplate").render({
        creatorTypes: item.creatorTypes[item.get('itemType')],
        key: itemField,
        value: fieldValue,
        itemKey: itemKey,
        creatorIndex: creatorIndex,
        library:library,
        item:item,
    }));

    widgetEl.find("#" + itemField).focus();
}


//switch an item field to a form input when clicked to edit (and is editable by the user)
/*
Zotero.ui.widgets.item.clickToEditCreator = function(e){
    Z.debug("widgets.item.clickToEditCreator", 3);
    var triggeringElement = J(e.triggeringElement);
    var widgetEl = J(e.data.widgetEl);
    var library = Zotero.ui.getAssociatedLibrary(e.data.widgetEl);
    var itemField = triggeringElement.data('itemfield');
    var itemKey = triggeringElement.data('itemkey');
    var creatorIndex = triggeringElement.data('creatorindex');
    var item = library.items.getItem(itemKey);
    var creators = item.get('creators');
    var fieldValue = "";
    if(creators[creatorIndex]){
        fieldValue = creators[creatorIndex][itemField];
    }

    triggeringElement.replaceWith(J("#datafieldTemplate").render({
        creatorTypes: item.creatorTypes[item.get('itemType')],
        key: itemField,
        value: fieldValue,
        itemKey: itemKey,
        creatorIndex: creatorIndex,
        //libraryString:library.libraryString,
        item: item,
    }));

    widgetEl.find("#" + itemField).focus();
}
*/
Zotero.ui.widgets.item.switchCreatorFields = function(e){
    Z.debug("widgets.item.switchCreatorFields", 3);
    var triggeringElement = J(e.triggeringElement);
    var creatorIndex = triggeringElement.data('creatorindex');
    var rowSelector = "tr.creator-row[data-creatorindex='" + creatorIndex + "']";
    Z.debug(rowSelector);
    var row = J(rowSelector);
    var creator = Zotero.ui.widgets.item.creatorFromRow(row);
    
    var widgetEl = J(e.data.widgetEl);
    var library = Zotero.ui.getAssociatedLibrary(e.data.widgetEl);
    var itemField = triggeringElement.data('itemfield');
    var itemKey = triggeringElement.data('itemkey');
    var item = library.items.getItem(itemKey);
    var updatedField;
    var updatedValue;

    if(creator.name !== undefined){
        var split = creator.name.split(' ');
        if(split.length > 1){
            creator.lastName = split.splice(-1, 1)[0];
            creator.firstName = split.join(' ');
        }
        else{
            creator.lastName = creator.name;
            creator.firstName = '';
        }
        delete creator.name;
    } else {
        if(creator.firstName == "" && creator.lastName == "") {
            creator.name = "";
        } else {
            creator.name = creator.firstName + ' ' + creator.lastName;
        }
        delete creator.firstName;
        delete creator.lastName;
    }

    var creators = item.get('creators');
    creators[creatorIndex] = creator;
    Zotero.ui.saveItem(item);

    row.replaceWith(J("#creatorrowTemplate").render(creator, {
        creatorIndex: creatorIndex,
        libraryString: library.libraryString,
        item: item,
    }));
    Zotero.eventful.initTriggers(widgetEl);
}

/**
 * save an item after a field that was being edited has lost focus
 * @param  {event} e DOM Event triggering callback
 * @return {boolean}
 */
Zotero.ui.widgets.item.updateItemField = function(library, itemKey, updatedField, updatedValue){
    Z.debug("widgets.item.updateItemField", 3);
    Z.debug("itemKey: " + itemKey, 3);
    if(!itemKey){
        throw new Error("Expected widget element to have itemKey data");
    }
    
    var item = library.items.getItem(itemKey);
    if(item.get(updatedField) != updatedValue){
        item.set(updatedField, updatedValue);
        Zotero.ui.saveItem(item);
    }
};

/**
 * save an item after a creator field that was being edited has lost focus
 * @param  {event} e DOM Event triggering callback
 * @return {boolean}
 */
Zotero.ui.widgets.item.updateItemCreatorField = function(library, itemKey, updatedCreator, creatorIndex){
    Z.debug("widgets.item.updateCreatorField", 3);
    Z.debug("itemKey: " + itemKey, 3);
    if(!itemKey){
        throw new Error("Expected widget element to have itemKey data");
    }
    
    var item = library.items.getItem(itemKey);
    var creators = item.get('creators');
    if(creators[creatorIndex]){
        creators[creatorIndex] = updatedCreator;
        Zotero.ui.saveItem(item);
    } else {
        //get full creator information from row of data, and add creator at index
        var rowSelector = "tr.creator-row[data-creatorindex='" + creatorIndex + "']";
        var row = J(rowSelector);
        var creator = Zotero.ui.widgets.item.creatorFromRow(row);
        creators[creatorIndex] = creator;
        Zotero.ui.saveItem(item);
    }
};

Zotero.ui.widgets.item.creatorFromRow = function(rowElement) {
    Z.debug("widgets.item.creatorFromRow", 3);
    var row = J(rowElement);
    var creatorType = row.find("span[data-itemfield='creatorType']").data('value');
    var name = row.find("span[data-itemfield='name']").data('value') || "";
    var firstName = row.find("span[data-itemfield='firstName']").data('value') || "";
    var lastName = row.find("span[data-itemfield='lastName']").data('value') || "";
    
    var creator = {
        creatorType: creatorType,
        name: name,
        firstName: firstName,
        lastName: lastName,
    };
    
    if(creator['name'] != ""){
        delete creator.firstName;
        delete creator.lastName;
    } else {
        delete creator['name'];
    }
    
    return creator;
};
