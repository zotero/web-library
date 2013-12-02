Zotero.ui.widgets.item = {};

Zotero.ui.widgets.item.init = function(el){
    Zotero.ui.eventful.listen("displayedItemChanged modeChanged", Zotero.ui.widgets.item.loadItemCallback, {widgetEl: el});
    Zotero.ui.eventful.listen("saveItem", Zotero.ui.widgets.item.saveItemCallback, {widgetEl:el});
    Zotero.ui.eventful.listen("cancelItemEdit", Zotero.ui.widgets.item.cancelItemEdit, {widgetEl:el});
    Zotero.ui.eventful.listen("itemTypeChanged", Zotero.ui.widgets.item.itemTypeChanged, {widgetEl:el});
    
    Zotero.ui.eventful.listen("addTag", Zotero.ui.widgets.item.addTag, {widgetEl:el});
    Zotero.ui.eventful.listen("removeTag", Zotero.ui.widgets.item.removeTag, {widgetEl:el});
    Zotero.ui.eventful.listen("addCreator", Zotero.ui.widgets.item.addCreator, {widgetEl:el});
    Zotero.ui.eventful.listen("removeCreator", Zotero.ui.widgets.item.removeCreator, {widgetEl:el});
    
    Zotero.ui.eventful.listen("switchTwoFieldCreator", Zotero.ui.widgets.item.switchTwoFieldCreators, {widgetEl:el});
    Zotero.ui.eventful.listen("switchSingleFieldCreator", Zotero.ui.widgets.item.switchSingleFieldCreator, {widgetEl:el});
    Zotero.ui.eventful.listen("addNote", Zotero.ui.widgets.item.addNote, {widgetEl:el});
    //watch buttons on item field from widget DOM element
    var container = J(el);
    
    container.on('keydown', ".itemDetailForm input", Zotero.ui.widgets.item.itemFormKeydown);
};

Zotero.ui.widgets.item.loadItemCallback = function(event){
    Z.debug('Zotero eventful loadItemCallback', 3);
    var widgetEl = event.data.widgetEl;
    var el = widgetEl;
    
    Z.debug("Zotero.callbacks.loadItem", 3);
    Zotero.callbacks.rejectIfPending(el);
    var jel = J(el);
    var library = Zotero.ui.getAssociatedLibrary(el);
    var d;
    //clear contents and show spinner while loading
    jel.empty();
    Zotero.ui.showSpinner(el);
    
    //if we're  creating a new item: let user choose itemType if we don't have a value
    //yet, otherwise create a new item and initialize it as an empty item of that type
    //then once we have the template in the item render it as an item edit
    if(Zotero.nav.getUrlVar('action') == 'newItem'){
        var itemType = Zotero.nav.getUrlVar('itemType');
        if(!itemType){
            jel.empty();
            jel.html( J("#itemtypeselectTemplate").render({itemTypes:Zotero.localizations.typeMap.sort()}) );
            return;
        }
        else{
            var newItem = new Zotero.Item();
            newItem.libraryType = library.libraryType;
            newItem.libraryID = library.libraryID;
            d = newItem.initEmpty(itemType);
            jel.data('pendingDeferred', d);
            d.done(J.proxy(function(item){
                Zotero.ui.unassociatedItemForm(jel, item);
            }, this) );
            d.fail(function(jqxhr, textStatus, errorThrown){
                Zotero.ui.jsNotificationMessage("Error loading item template", 'error');
            });
            return;
        }
    }
    
    //if it is not a new item handled above we must have an itemKey
    var itemKey = Zotero.nav.getUrlVar('itemKey');
    Z.debug(Zotero.nav.getUrlVars());
    if(!itemKey){
        Z.debug("No itemKey - " + itemKey, 3);
        J(el).empty();
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
        var config = {
            'target':'item',
            'libraryType':library.type,
            'libraryID':library.libraryID,
            'itemKey':itemKey,
            'content':'json'
        };
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
            Zotero.eventful.initTriggers(J(widgetEl));
        }, this));
    }
    Zotero.eventful.initTriggers(J(widgetEl));
};

/**
 * Get an item's children and display summary info
 * @param  {DOM Element} el      element to insert into
 * @param  {string} itemKey key of parent item
 * @return {undefined}
 */
Zotero.ui.showChildren = function(el, itemKey){
    Z.debug('Zotero.ui.showChildren', 3);
    var library = Zotero.ui.getAssociatedLibrary(J(el).closest("div.ajaxload"));
    var item = library.items.getItem(itemKey);
    var attachmentsDiv = J(el).find(".item-attachments-div");
    Zotero.ui.showSpinner(attachmentsDiv);
    
    var childItemsPromise = item.getChildren(library);
    
    childItemsPromise.done(function(childItems){
        J(".item-attachments-div").html( J('#childitemsTemplate').render({childItems:childItems}) );
    });
    
    Zotero.ui.createOnActivePage(el);
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
    
    Zotero.ui.init.creatorFieldButtons();
    
    Zotero.ui.createOnActivePage(jel);
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
    
    Zotero.ui.createOnActivePage(button);
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
    if(Zotero.config.mobile){
        jel = container.find("td.notes").append('<textarea cols="40" rows="24" name="' + newNoteID + '" id="' + newNoteID + '" class="rte default note-text" data-noteindex="' + newNoteID + '"></textarea>');
    }
    else{
        jel = container.find("td.notes button.add-note-button").before('<textarea cols="40" rows="24" name="' + newNoteID + '" id="' + newNoteID + '" class="rte default note-text" data-noteindex="' + newNoteID + '"></textarea>');
    }
    
    Zotero.ui.init.rte('default', true, newNoteID);
    
    Zotero.ui.createOnActivePage(button);
};

/**
 * Load the template for a new item
 * @param  {Zotero_Item} item Item template to load
 * @return {undefined}
 */
Zotero.ui.loadNewItemTemplate = function(item){
    Z.debug("Zotero.ui.loadNewItemTemplate", 3);
    Z.debug(item, 3);
    var d = Zotero.Item.prototype.getCreatorTypes(item.itemType);
    d.done(function(itemCreatorTypes){
        var jel = J("#item-details-div").empty();
        if(item.itemType == 'note'){
            var parentKey = Zotero.nav.getUrlVar('parentKey');
            if(parentKey){
                item.parentKey = parentKey;
            }
            jel.append( J('#editnoteformTemplate').render({item:item,
                                         itemKey:item.itemKey
                                         }) );
            
            Zotero.ui.init.rte('default');
        }
        else {
            //TODO: libraryUserID is for what?
            jel.append( J('#itemformTemplate').render( {item:item,
                                                        libraryUserID:zoteroData.libraryUserID,
                                                        itemKey:item.itemKey,
                                                        creatorTypes:itemCreatorTypes,
                                                        saveable: true,
                                                        citable:false
                                                        } ) );
            if(item.apiObj.tags.length === 0){
                Zotero.ui.widgets.item.addTag(jel, false);
            }
            Zotero.ui.init.creatorFieldButtons();
            //Zotero.ui.init.tagButtons();
            Zotero.ui.init.editButton();
        }
        jel.data('newitem', item);
        
        //load data from previously rendered form if available
        Zotero.ui.loadFormData(jel);
        
        Zotero.ui.createOnActivePage(jel);
    });
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
        widgetEl.find("input.taginput").typeahead({name: 'tags', local: typeaheadSource});
    }
    
    if(focus){
        J("input.taginput").last().focus();
    }
    
    //Zotero.ui.init.tagButtons();
    
    //Zotero.ui.createOnActivePage(jel);
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
    
    //Zotero.ui.createOnActivePage(el);
};


/**
 * Display and initialize an edit item form
 * @param  {Dom Element} el   Container
 * @param  {Zotero_Item} item Zotero Item object to associate with form
 * @return {undefined}
 */
Zotero.ui.editItemForm = function(el, item){
    Z.debug("Zotero.ui.editItemForm", 3);
    Z.debug(item, 4);
    var jel = J(el);
    var library = Zotero.ui.getAssociatedLibrary(el);
    if(item.itemType == 'note'){
        Z.debug("editItemForm - note", 3);
        jel.empty();
        jel.append( J('#editnoteformTemplate').render({item:item,
                                         itemKey:item.itemKey
                                         }) );
                                         
        Zotero.ui.init.rte('default');
        Zotero.ui.init.editButton();
    }
    else if(item.itemType == "attachment"){
        Z.debug("item is attachment", 4);
        jel.empty();
        var mode = Zotero.nav.getUrlVar('mode');
        jel.append( J('#attachmentformTemplate').render({item:item,
                                    itemKey:item.itemKey,
                                    creatorTypes:[],
                                    mode:mode
                                    }) );
        
        //add empty tag if no tags yet
        if(item.apiObj.tags.length === 0){
            Zotero.ui.widgets.item.addTag(el, false);
        }
        if(Zotero.config.mobile){
            Zotero.ui.init.editButton();
            J(el).trigger('create');
        }
        else{
            Zotero.ui.init.creatorFieldButtons();
            //Zotero.ui.init.tagButtons();
            Zotero.ui.init.editButton();
        }
        Zotero.ui.init.rte();
        
    }
    else{
        var p = item.getCreatorTypes(item.apiObj.itemType);
        p.done(J.proxy(function(){
            Z.debug("getCreatorTypes callback", 3);
            jel.empty();
            var mode = Zotero.nav.getUrlVar('mode');
            if(item.creators.length === 0){
                item.creators.push({creatorType: item.creatorTypes[item.itemType][0],
                                    first: '',
                                    last: ''
                                    });
                item.apiObj.creators = item.creators;
            }
            Z.debug("Rendering item form");
            Z.debug(Zotero.Item.prototype.creatorTypes[item.apiObj.itemType]);
            jel.append( J('#itemformTemplate').render({item:item,
                                                    library:library,
                                                    itemKey:item.itemKey,
                                                    creatorTypes:Zotero.Item.prototype.creatorTypes[item.apiObj.itemType],
                                                    saveable: true,
                                                    citable: false
                                                    }) );
            
            //add empty tag if no tags yet
            if(item.apiObj.tags.length === 0){
                Zotero.ui.widgets.item.addTag(el, false);
            }
            if(Zotero.config.mobile){
                Zotero.ui.init.editButton();
                J(el).trigger('create');
            }
            else{
                Zotero.ui.init.creatorFieldButtons();
                //Zotero.ui.init.tagButtons();
                Zotero.ui.init.editButton();
            }
            Zotero.eventful.initTriggers(jel);
        }, this));
    }
    
    //add autocomplete
    var typeaheadSource = library.tags.plainList;
    if(!typeaheadSource){
        typeaheadSource = [];
    }
    J("input.taginput").typeahead({name: 'tags', local: typeaheadSource});
};


/**
 * Render and display full item details into an element
 * @param  {Zotero_Item} item Zotero Item to display
 * @param  {Dom Element} el   Container
 * @return {undefined}
 */
Zotero.ui.loadItemDetail = function(item, el){
    Z.debug("Zotero.ui.loadItemDetail", 3);
    var jel = J(el);
    jel.empty();
    var parentUrl = false;
    var library = item.owningLibrary
    if(item.parentItemKey){
        parentUrl = library.websiteUrl({itemKey:item.parentItemKey});
    }
    if(item.itemType == "note"){
        Z.debug("note item", 3);
        jel.append( J('#itemnotedetailsTemplate').render({item:item, parentUrl:parentUrl, libraryString:library.libraryString}) );
    }
    else{
        Z.debug("non-note item", 3);
        jel.append( J('#itemdetailsTemplate').render({item:item, parentUrl:parentUrl, libraryString:library.libraryString}) ).trigger('create');
    }
    Zotero.ui.init.rte('readonly');
    Zotero.ui.init.editButton();
    
    Zotero.ui.libraryBreadcrumbs();
    
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
    var el = widgetEl;
    
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
    Zotero.ui.saveItem(item, triggeringElement.closest("form"));
    library.dirty = true;
    return false;
};


Zotero.ui.widgets.item.switchTwoFieldCreators = function(e){
    Z.debug("switch two field creator clicked");
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
    
    Zotero.ui.init.creatorFieldButtons();
    Zotero.eventful.initTriggers(containingTable.find(trIdString));
    //Zotero.ui.createOnActivePage(J(this));
};

Zotero.ui.widgets.item.switchSingleFieldCreator = function(e){
    Z.debug("switch single field clicked");
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
    
    Zotero.ui.init.creatorFieldButtons();
    Zotero.eventful.initTriggers(containingTable.find(trIdString));
};

/*
Zotero.ui.callbacks.addNote = function(e){
    Z.debug("add note button clicked", 3);
    Zotero.ui.addNote(this);
    return false;
};
*/

Zotero.ui.widgets.item.cancelItemEdit = function(e){
    Zotero.nav.clearUrlVars(['itemKey', 'collectionKey', 'tag', 'q']);
    Zotero.nav.pushState();
};

Zotero.ui.widgets.item.selectItemType = function(e){
    Z.debug("itemTypeSelectButton clicked", 3);
    var jel;
    if(e.zeventful){
        jel = J(e.triggeringElement);
    } else {
        jel = J(this);
    }
    
    var itemType = J("#itemType").val();
    Zotero.nav.urlvars.pathVars['itemType'] = itemType;
    Zotero.nav.pushState();
    return false;
};

Zotero.ui.widgets.item.itemFormKeydown = function(e){
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
};


