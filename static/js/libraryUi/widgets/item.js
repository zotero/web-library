Zotero.ui.widgets.item = {};

Zotero.ui.widgets.item.init = function(el){
    Zotero.ui.eventful.listen("displayedItemChanged modeChanged", Zotero.ui.widgets.item.loadItemCallback, {widgetEl: el});
    
    //watch buttons on item field from widget DOM element
    var container = J(el);
    
    container.on('click', ".saveitembutton", Zotero.ui.saveItemCallback);
    container.on('submit', ".itemDetailForm", Zotero.ui.saveItemCallback);
    container.on('click', ".cancelitemeditbutton", Zotero.ui.callbacks.cancelItemEdit);
    container.on('click', ".itemTypeSelectButton", Zotero.ui.callbacks.selectItemType);
    
    container.on('keydown', ".itemDetailForm input", Zotero.ui.callbacks.itemFormKeydown);
    
    container.on('click', ".add-tag-link", Zotero.ui.addTag);
    container.on('click', ".remove-tag-link", Zotero.ui.removeTag);
    container.on('click', ".add-creator-link", Zotero.ui.addCreator);
    container.on('click', ".remove-creator-link", Zotero.ui.removeCreator);
    
    container.on('click', ".switch-two-field-creator-link", Zotero.ui.callbacks.switchTwoFieldCreators);
    container.on('click', ".switch-single-field-creator-link", Zotero.ui.callbacks.switchSingleFieldCreator);
    container.on('click', ".add-note-button", Zotero.ui.addNote);
    
    //bind attachment upload link
    container.on('click', "#upload-attachment-link", function(){
        Zotero.ui.eventful.trigger("uploadAttachment");
    });
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
Zotero.ui.addCreator = function(e){
    var button = e.currentTarget;
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
Zotero.ui.removeCreator = function(e){
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
Zotero.ui.addNote = function(e){
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
            jel.append( J('#itemformTemplate').render( {item:item,
                                                        libraryUserID:zoteroData.libraryUserID,
                                                        itemKey:item.itemKey,
                                                        creatorTypes:itemCreatorTypes,
                                                        saveable: true,
                                                        citable:false
                                                        } ) );
            if(item.apiObj.tags.length === 0){
                Zotero.ui.addTag(jel, false);
            }
            Zotero.ui.init.creatorFieldButtons();
            Zotero.ui.init.tagButtons();
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
Zotero.ui.addTag = function(e, focus) {
    Z.debug("Zotero.ui.addTag", 3);
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
    
    if(Zotero.config.jqueryui === false){
        var library = Zotero.ui.getAssociatedLibrary(widgetEl);
        if(library){
            widgetEl.find("input.taginput").typeahead({source:library.tags.plainList});
        }
    }
    else {
        widgetEl.find("input.taginput").autocomplete({
            source:function(request, callback){
                var library = Zotero.ui.getAssociatedLibrary(widgetEl);
                if(library){
                    var matchingTagStrings = Zotero.utils.prependAutocomplete(request.term, library.tags.plainList);
                    callback(matchingTagStrings);
                }
            },
            select: function(e, ui){
                e.preventDefault();
                e.stopImmediatePropagation();
                var value = ui.item.value;
                Zotero.ui.addTag(e);
            }
        });
    }
    
    if(focus){
        J("input.taginput").last().focus();
    }
    
    Zotero.ui.init.tagButtons();
    
    Zotero.ui.createOnActivePage(jel);
};

/**
 * Remove a tag field from an edit item form
 * @param  {DOM Element} el Tag field to remove
 * @return {undefined}
 */
Zotero.ui.removeTag = function(e) {
    Z.debug("Zotero.ui.removeTag", 3);
    var el = e.currentTarget;
    var widgetEl = Zotero.ui.parentWidgetEl(el);
    //check to make sure there is another tag field available to use
    //if not add an empty one
    if(widgetEl.find("div.edit-tag-div").length === 1){
        Zotero.ui.addTag(e);
    }
    
    J(el).closest('.edit-tag-div').remove();
    
    Zotero.ui.createOnActivePage(el);
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
            Zotero.ui.addTag(el, false);
        }
        if(Zotero.config.mobile){
            Zotero.ui.init.editButton();
            J(el).trigger('create');
        }
        else{
            Zotero.ui.init.creatorFieldButtons();
            Zotero.ui.init.tagButtons();
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
                                                    itemKey:item.itemKey,
                                                    creatorTypes:Zotero.Item.prototype.creatorTypes[item.apiObj.itemType],
                                                    saveable: true,
                                                    citable: false
                                                    }) );
            
            //add empty tag if no tags yet
            if(item.apiObj.tags.length === 0){
                Zotero.ui.addTag(el, false);
            }
            if(Zotero.config.mobile){
                Zotero.ui.init.editButton();
                J(el).trigger('create');
            }
            else{
                Zotero.ui.init.creatorFieldButtons();
                Zotero.ui.init.tagButtons();
                Zotero.ui.init.editButton();
            }
        }, this));
    }
    
    //add autocomplete to existing tag fields
    if(Zotero.config.jqueryui === false){
        //add autocomplete to existing tag fields
        var library = Zotero.ui.getAssociatedLibrary();
        J("input.taginput").typeahead({source:library.tags.plainList});
    }
    else{
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
                Zotero.ui.addTag(e);
            }
        });
    }
    
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
    if(item.parentItemKey){
        parentUrl = item.owningLibrary.websiteUrl({itemKey:item.parentItemKey});
    }
    if(item.itemType == "note"){
        Z.debug("note item", 3);
        jel.append( J('#itemnotedetailsTemplate').render({item:item, parentUrl:parentUrl}) );
    }
    else{
        Z.debug("non-note item", 3);
        jel.append( J('#itemdetailsTemplate').render({item:item, parentUrl:parentUrl}) ).trigger('create');
    }
    Zotero.ui.init.rte('readonly');
    Zotero.ui.init.editButton();
    Zotero.ui.init.detailButtons();
    
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
Zotero.ui.saveItemCallback = function(e){
    Z.debug("saveitemlink clicked", 3);
    e.preventDefault();
    Zotero.ui.scrollToTop();
    var library = Zotero.ui.getAssociatedLibrary(J(this).closest(".ajaxload"));
    //get our current representation of the item
    var itemKey = J(this).attr('data-itemKey');
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
    Zotero.ui.updateItemFromForm(item, J(this).closest("form"));
    Zotero.ui.saveItem(item, J(this).closest("form"));
    library.dirty = true;
    return false;
};


Zotero.ui.callbacks.switchTwoFieldCreators = function(e){
    Z.debug("switch two field creator clicked");
    var jel;
    if(true){
        jel = J(e.currentTarget);
    } else {
        jel = J(this);
    }
    
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
    var creatorType = jel.closest('tr.creator').find("select#creator_" + index + "_creatorType").val();
    jel.closest('tr').replaceWith( J('#authorelementsdoubleTemplate').render({index:index,
                                                creator:{firstName:first, lastName:last, creatorType:creatorType},
                                                creatorTypes:Zotero.Item.prototype.creatorTypes[itemType]
                                                }));
    
    Zotero.ui.init.creatorFieldButtons();
    //Zotero.ui.createOnActivePage(J(this));
};

Zotero.ui.callbacks.switchSingleFieldCreator = function(e){
    Z.debug("switch single field clicked");
    var jel;
    //if(e.zeventful){
    if(true){
        jel = J(e.currentTarget);
    } else {
        jel = J(this);
    }
    
    var name;
    var firstName = jel.closest('div.creator-input-div').find("input[id$='_firstName']").val();
    var lastName = jel.closest('div.creator-input-div').find("input[id$='_lastName']").val();
    name = firstName + " " + lastName;
    
    var itemType = jel.closest('form').find('select.itemType').val();
    var index = parseInt(jel.closest('tr.creator').attr('id').substr(8), 10);
    var creatorType = jel.closest('tr.creator').find("select#creator_" + index + "_creatorType").val();
    jel.closest('tr').replaceWith( J('#authorelementssingleTemplate').render(
                                        {index:index,
                                        creator:{name:name},
                                        creatorTypes:Zotero.Item.prototype.creatorTypes[itemType]
                                        }));
    
    Zotero.ui.init.creatorFieldButtons();
};

/*
Zotero.ui.callbacks.addNote = function(e){
    Z.debug("add note button clicked", 3);
    Zotero.ui.addNote(this);
    return false;
};
*/

Zotero.ui.callbacks.uploadAttachment = function(e){
    Z.debug("uploadAttachment", 3);
    e.preventDefault();
    
    var library = Zotero.ui.getAssociatedLibrary(J(this).closest(".ajaxload"));
    var dialogEl = J("#upload-attachment-dialog").empty();
    
    if(Zotero.config.mobile){
        dialogEl.replaceWith(J("#attachmentuploadTemplate").render({}) );
    }
    else{
        dialogEl.append( J("#attachmentuploadTemplate").render({}) );
    }
    
    
    var uploadFunction = J.proxy(function(){
        Z.debug("uploadFunction", 3);
        //callback for when everything in the upload form is filled
        //grab file blob
        //grab file data given by user
        //create or modify attachment item
        //Item.uploadExistingFile or uploadChildAttachment
        
        var fileInfo = J("#attachmentuploadfileinfo").data('fileInfo');
        var file = J("#attachmentuploadfileinfo").data('file');
        var specifiedTitle = J("#upload-file-title-input").val();
        
        var progressCallback = function(e){
            Z.debug('fullUpload.upload.onprogress');
            var percentLoaded = Math.round((e.loaded / e.total) * 100);
            Z.debug("Upload progress event:" + e.loaded + " / " + e.total + " : " + percentLoaded + "%");
            J("#uploadprogressmeter").val(percentLoaded);
        };
        
        var uploadSuccess = function(){
            Zotero.ui.closeDialog(J("#upload-attachment-dialog"));
            Zotero.nav.pushState(true);
        };
        
        var uploadFailure = function(failure){
            Z.debug("Upload failed", 3);
            Z.debug(JSON.stringify(failure));
            Zotero.ui.jsNotificationMessage("There was a problem uploading your file.", 'error');
            switch(failure.code){
                case 400:
                    break;
                case 403:
                    Zotero.ui.jsNotificationMessage("You do not have permission to edit files", 'error');
                    break;
                case 409:
                    Zotero.ui.jsNotificationMessage("The library is currently locked. Please try again in a few minutes.", 'error');
                    break;
                case 412:
                    Zotero.ui.jsNotificationMessage("File conflict. Remote file has changed", 'error');
                    break;
                case 413:
                    Zotero.ui.jsNotificationMessage("Requested upload would exceed storage quota.", 'error');
                    break;
                case 428:
                    Zotero.ui.jsNotificationMessage("Precondition required error", 'error');
                    break;
                case 429:
                    Zotero.ui.jsNotificationMessage("Too many uploads pending. Please try again in a few minutes", 'error');
                    break;
            }
            Zotero.ui.closeDialog(J("#upload-attachment-dialog"));
        };
        
        //show spinner while working on upload
        Zotero.ui.showSpinner(J('#fileuploadspinner'));
        
        //upload new copy of file if we're modifying an attachment
        //create child and upload file if we're modifying a top level item
        var itemKey = Zotero.nav.getUrlVar('itemKey');
        var item = library.items.getItem(itemKey);
        
        if(!item.get("parentItem")){
            //get template item
            var childItem = new Zotero.Item();
            childItem.associateWithLibrary(library);
            var templateItemDeferred = childItem.initEmpty('attachment', 'imported_file');
            
            templateItemDeferred.done(J.proxy(function(childItem){
                Z.debug("templateItemDeferred callback");
                childItem.set('title', specifiedTitle);
                
                var uploadChildD = item.uploadChildAttachment(childItem, fileInfo, file, progressCallback);
                
                uploadChildD.done(uploadSuccess).fail(uploadFailure);
            }, this) );
        }
        else if(item.get('itemType') == 'attachment' && item.get("linkMode") == 'imported_file') {
            var uploadD = item.uploadFile(fileInfo, file, progressCallback);
            uploadD.done(uploadSuccess).fail(uploadFailure);
        }
        
    }, this);

    Zotero.ui.dialog(J("#upload-attachment-dialog"), {
        modal:true,
        minWidth: 300,
        width:350,
        draggable: false,
        buttons: {
            'Upload': uploadFunction,
            'Cancel': function(){
                Zotero.ui.closeDialog(J("#upload-attachment-dialog"));
            }
        }
    });
    
    var width = J("#fileuploadinput").width() + 50;
    J("#upload-attachment-dialog").dialog('option', 'width', width);
    
    var handleFiles = function(files){
        Z.debug("attachmentUpload handleFiles", 3);
        
        if(typeof files == 'undefined' || files.length === 0){
            return false;
        }
        var file = files[0];
        J("#attachmentuploadfileinfo").data('file', file);
        
        var fileinfo = Zotero.file.getFileInfo(file, function(fileInfo){
            J("#attachmentuploadfileinfo").data('fileInfo', fileInfo);
            J("#upload-file-title-input").val(fileInfo.filename);
            J("#attachmentuploadfileinfo .uploadfilesize").html(fileInfo.filesize);
            J("#attachmentuploadfileinfo .uploadfiletype").html(fileInfo.contentType);
            //J("#attachmentuploadfileinfo .uploadfilemd5").html(fileInfo.md5);
            J("#droppedfilename").html(fileInfo.filename);
        });
        return;
    };
    
    J("#fileuploaddroptarget").on('dragenter dragover', function(e){
        e.stopPropagation();
        e.preventDefault();
    });
    
    J("#fileuploaddroptarget").on('drop', function(je){
        Z.debug("fileuploaddroptarget drop callback", 3);
        je.stopPropagation();
        je.preventDefault();
        //clear file input so drag/drop and input don't show conflicting information
        J("#fileuploadinput").val('');
        var e = je.originalEvent;
        var dt = e.dataTransfer;
        var files = dt.files;
        handleFiles(files);
    });
    
    J("#fileuploadinput").on('change', function(je){
        Z.debug("fileuploaddroptarget callback 1");
        je.stopPropagation();
        je.preventDefault();
        var files = J("#fileuploadinput").get(0).files;
        handleFiles(files);
    });
    
    return false;
};


Zotero.ui.callbacks.cancelItemEdit = function(e){
    Zotero.nav.clearUrlVars(['itemKey', 'collectionKey', 'tag', 'q']);
    Zotero.nav.pushState();
};

Zotero.ui.callbacks.selectItemType = function(e){
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

Zotero.ui.callbacks.itemFormKeydown = function(e){
    if ( e.keyCode === J.ui.keyCode.ENTER ){
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


