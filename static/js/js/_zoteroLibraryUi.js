
/**
 * compatibility function between jqueryUI and jqueryMobile dialog functions
 * @param  {DOMNode} el      Dom element that will become the dialog
 * @param  {object} options Options object passed to either jqueryUI or jqueryMobile
 * @return {undefined}
 */
Zotero.ui.dialog = function(el, options){
    Z.debug("Zotero.ui.dialog", 3);
    J(el).dialog(options);
    Z.debug("exiting Zotero.ui.dialog", 3);
};

/**
 * compatibility function between jqueryUI and jqueryMobile to close a dialog
 * @param  {Dom Element} el Dialog element
 * @return {undefined}
 */
Zotero.ui.closeDialog = function(el){
    J(el).dialog('close');
};

/**
 * Update the disabled state of library control toolbar buttons depending on context
 * @return {undefined}
 */
Zotero.ui.updateDisabledControlButtons = function(){
    Z.debug("Zotero.ui.updateDisabledControlButtons", 3);
    J(".move-to-trash-link").prop('title', 'Move to Trash');
    
    J("#create-item-link").button('option', 'disabled', false);
    if((J(".itemlist-editmode-checkbox:checked").length === 0) && (!Zotero.nav.getUrlVar('itemKey')) ){
        J(".add-to-collection-link").button('option', 'disabled', true).removeClass("ui-state-hover");
        J(".remove-from-collection-link").button('option', 'disabled', true).removeClass("ui-state-hover");
        J(".move-to-trash-link").button('option', 'disabled', true).removeClass("ui-state-hover");
        J(".remove-from-trash-link").button('option', 'disabled', true).removeClass("ui-state-hover");
        
        J("#cite-link").button('option', 'disabled', true);
        J("#export-link").button('option', 'disabled', true);
    }
    else{
        J(".add-to-collection-link").button('option', 'disabled', false).removeClass("ui-state-hover");
        J(".remove-from-collection-link").button('option', 'disabled', false).removeClass("ui-state-hover");
        J(".move-to-trash-link").button('option', 'disabled', false).removeClass("ui-state-hover");
        if(Zotero.nav.getUrlVar('collectionKey') == 'trash'){
            J(".remove-from-trash-link").button('option', 'disabled', false).removeClass("ui-state-hover");
        }
        J("#cite-link").button('option', 'disabled', false);
        J("#export-link").button('option', 'disabled', false);
    }
    //only show remove from collection button if inside a collection
    if(!Zotero.nav.getUrlVar("collectionKey")){
        J(".remove-from-collection-link").button('option', 'disabled', true).removeClass("ui-state-hover");
    }
    //disable create item button if in trash
    else if(Zotero.nav.getUrlVar('collectionKey') == 'trash'){
        J("#create-item-link").button('option', 'disabled', true).removeClass('ui-state-hover');
        J(".add-to-collection-link").button('option', 'disabled', true).removeClass("ui-state-hover");
        J(".remove-from-collection-link").button('option', 'disabled', true).removeClass("ui-state-hover");
        J(".move-to-trash-link").prop('title', 'Permanently Delete');
    }
    Zotero.ui.init.editButton();
};

/**
 * Display a JS notification message to the user
 * @param  {string} message Notification message
 * @param  {string} type    confirm, notice, or error
 * @param  {int} timeout seconds to display notification
 * @return {undefined}
 */
Zotero.ui.jsNotificationMessage = function(message, type, timeout){
    Z.debug("notificationMessage: " + type + " : " + message, 3);
    if(Zotero.config.suppressErrorNotifications) return;
    if(!timeout){
        timeout = 5;
    }
    J("#js-message-list").append("<li class='jsNotificationMessage-" + type + "' >" + message + "</li>").children("li").delay(parseInt(timeout, 10) * 1000).slideUp().delay(300).queue(function(){
        J(this).remove();
    });
};

/**
 * Display an error message on ajax failure
 * @param  {jQuery XHR Promise} jqxhr jqxhr returned from jquery.ajax
 * @return {undefined}
 */
Zotero.ui.ajaxErrorMessage = function(jqxhr){
    Z.debug("Zotero.ui.ajaxErrorMessage", 3);
    if(typeof jqxhr == 'undefined'){
        Z.debug('ajaxErrorMessage called with undefined argument');
        return '';
    }
    Z.debug(jqxhr, 3);
    switch(jqxhr.status){
        case 403:
            //don't have permission to view
            if(Zotero.config.loggedIn || Zotero.config.ignoreLoggedInStatus){
                return "You do not have permission to view this library.";
            }
            else{
                Zotero.config.suppressErrorNotifications = true;
                window.location = "/user/login";
                return "";
            }
            break;
        case 404:
            Zotero.ui.jsNotificationMessage("A requested resource could not be found.", 'error');
            break;
        case 400:
            Zotero.ui.jsNotificationMessage("Bad Request", 'error');
            break;
        case 405:
            Zotero.ui.jsNotificationMessage("Method not allowed", 'error');
            break;
        case 412:
            Zotero.ui.jsNotificationMessage("Precondition failed", 'error');
            break;
        case 500:
            Zotero.ui.jsNotificationMessage("Something went wrong but we're not sure what.", 'error');
            break;
        case 501:
            Zotero.ui.jsNotificationMessage("We can't do that yet.", 'error');
            break;
        case 503:
            Zotero.ui.jsNotificationMessage("We've gone away for a little while. Please try again in a few minutes.", 'error');
            break;
        default:
            Z.debug("jqxhr status did not match any expected case");
            Z.debug(jqxhr.status);
            //Zotero.ui.jsNotificationMessage("An error occurred performing the requested action.", 'error');
    }
    return '';
};

/**
 * Scroll to the top of the window
 * @return {undefined}
 */
Zotero.ui.scrollToTop = function(){
    window.scrollBy(0, -5000);
};

/**
 * get a list of the itemKeys for items checked off in a form to know what items to operate on
 * if a single item is being displayed the form selections will be overridden
 * otherwise this function returns the data-itemkey values associated with input.itemKey-checkbox:checked
 * @param  {Form element} form Form DOM Element to pull itemkey values from
 * @return {array}
 */
Zotero.ui.getSelectedItemKeys = function(form){
    Z.debug("Zotero.ui.getSelectedItemKeys", 3);
    var itemKeys = [];
    var curItemKey = Zotero.nav.getUrlVar('itemKey');
    if(curItemKey){
        itemKeys.push(curItemKey);
    }
    else{
        if(J(form).length){
            J(form).find("input.itemKey-checkbox:checked").each(function(index, val){
                itemKeys.push(J(val).data('itemkey'));
            });
        }
        else {
            J("input.itemKey-checkbox:checked").each(function(index, val){
                itemKeys.push(J(val).data('itemkey'));
            });
        }
    }
    return itemKeys;
};

Zotero.ui.getAllFormItemKeys = function(form){
    Z.debug("Zotero.ui.getSelectedItemKeys", 3);
    var itemKeys = [];
    var curItemKey = Zotero.nav.getUrlVar('itemKey');
    if(curItemKey){
        itemKeys.push(curItemKey);
    }
    else{
        J(form).find("input.itemKey-checkbox").each(function(index, val){
            itemKeys.push(J(val).data('itemkey'));
        });
    }
    return itemKeys;
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
    library.dirty = true;
    Zotero.ui.showSpinner(J(this).closest(".ajaxload"));
    return false;
};

/**
 * Add selected items to collection
 * @param {string} collectionKey collectionKey of collection items will be added to
 * @param {Zotero_Library} library       Zotero library to operate on
 */
Zotero.ui.addToCollection = function(collectionKey, library){
    Z.debug("add-to-collection clicked", 3);
    var itemKeys = Zotero.ui.getSelectedItemKeys(J("#edit-mode-items-form"));
    //var library = Zotero.ui.getAssociatedLibrary(J(this).closest('div.ajaxload'));
    if(!collectionKey){
        Zotero.ui.jsNotificationMessage("No collection selected", 'error');
        return false;
    }
    if(itemKeys.length === 0){
        Zotero.ui.jsNotificationMessage("No items selected", 'notice');
        return false;
    }
    Z.debug(itemKeys, 4);
    Z.debug(collectionKey, 4);
    Z.debug(library.collections[collectionKey], 4);
    var response = library.collections[collectionKey].addItems(itemKeys);
    library.dirty = true;
    J.when(response).then(function(){
        //Zotero.nav.forceReload = true;//delete Zotero.nav.urlvars.pathVars['mode'];
        Zotero.nav.pushState(true);
    });
    return false;
};

/**
 * Conditionally show the control panel
 * @param  {Dom El} el control panel element
 * @return {undefined}
 */
Zotero.ui.showControlPanel = function(el){
    Z.debug("Zotero.ui.showControlPanel", 3);
    var jel = J(el);
    var mode = Zotero.nav.getUrlVar('mode') || 'view';
    
    if(Zotero.config.librarySettings.allowEdit === 0){
        J(".permission-edit").hide();
        J("#control-panel").hide();
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
        J.tmpl('childitemsTemplate', {childItems:childItems}).appendTo(J(".item-attachments-div").empty());
    });
    
    Zotero.ui.createOnActivePage(el);
};

/**
 * Add creator field to item edit form
 * @param {DOM Button} button Add creator button clicked
 */
Zotero.ui.addCreator = function(button){
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
    J.tmpl('authorelementsdoubleTemplate', {index:newindex,
                                            creator:{firstName:'', lastName:''},
                                            creatorTypes:Zotero.Item.prototype.creatorTypes[itemType]
                                            }).insertAfter(jel);
    
    Zotero.ui.init.creatorFieldButtons();
    
    Zotero.ui.createOnActivePage(jel);
};

/**
 * Remove a creator from an edit item form
 * @param  {Dom Button} button Remove creator button that was clicked
 * @return {undefined}
 */
Zotero.ui.removeCreator = function(button){
    Z.debug("Zotero.ui.removeCreator", 3);
    J(button).closest('tr').remove();
    
    Zotero.ui.createOnActivePage(button);
};

/**
 * Add a note field to an editItem Form
 * @param {Dom Button} button Add note button that was clicked
 */
Zotero.ui.addNote = function(button){
    Z.debug("Zotero.ui.addNote", 3);
    //var itemKey = J(button).data('itemkey');
    var notenum = 0;
    var lastNoteID = J("textarea[name^='note_']:last").attr('name');
    if(lastNoteID){
        notenum = parseInt(lastNoteID.substr(5), 10);
    }
    
    var newindex = notenum + 1;
    var newNoteID = "note_" + newindex;
    var jel;
    if(Zotero.config.mobile){
        jel = J("td.notes").append('<textarea cols="40" rows="24" name="' + newNoteID + '" id="' + newNoteID + '" class="tinymce default"></textarea>');
    }
    else{
        jel = J("td.notes button.add-note-button").before('<textarea cols="40" rows="24" name="' + newNoteID + '" id="' + newNoteID + '" class="tinymce default"></textarea>');
    }
    
    Z.debug("new note ID:" + newNoteID, 4);
    
    Zotero.ui.init.tinyMce('default', true, newNoteID);
    
    Zotero.ui.createOnActivePage(button);
};

/**
 * Update a Zotero_Item object from the current values of an edit item form
 * @param  {Zotero_Item} item   Zotero item to update
 * @param  {Dom Form} formEl edit item form to take values from
 * @return {bool}
 */
Zotero.ui.updateItemFromForm = function(item, formEl){
    Z.debug("Zotero.ui.updateItemFromForm", 3);
    var base = J(formEl);
    base.closest('.ajaxload').data('ignoreformstorage', true);
    var library = Zotero.ui.getAssociatedLibrary(base.closest('.ajaxload'));
    
    var itemKey = '';
    if(item.itemKey) itemKey = item.itemKey;
    //update current representation of the item with form values
    J.each(item.contentRows, function(i, row){
        var selector, inputValue, noteElID;
        if(row.field == 'note'){
            selector = "textarea[data-itemKey='" + itemKey + "'].tinymce";
            Z.debug(selector, 4);
            noteElID = J(selector).attr('id');
            Z.debug(noteElID, 4);
            inputValue = tinyMCE.get(noteElID).getContent();
        }
        else{
            selector = "[data-itemKey='" + itemKey + "'][name='" + row.field + "']";
            inputValue = base.find(selector).val();
        }
        if(typeof inputValue !== 'undefined'){
            row.fieldValue = inputValue;//base.find(selector).val();
            item.apiObj[row.field] = inputValue;//base.find(selector).val();
        }
    });
    var creators = [];
    base.find("tr.creator").each(function(index, el){
        var name, creator, firstName, lastName;
        var trindex = parseInt(J(el).attr('id').substr(8), 10);
        var creatorType = J(el).find("select[id$='creatorType']").val();
        if(J(el).hasClass('singleCreator')){
            name = J(el).find("input[id$='_name']");
            if(!name.val()){
                //can't submit authors with empty names
                return true;
            }
            creator = {creatorType: creatorType,
                            name: name.val()
                        };
        }
        else if(J(el).hasClass('doubleCreator')){
            firstName = J(el).find("input[id$='_firstName']").val();
            lastName = J(el).find("input[id$='_lastName']").val();
            if((firstName === '') && (lastName === '')){
                return true;
            }
            creator = {creatorType: creatorType,
                            firstName: firstName,
                            lastName: lastName
                            };
        }
        creators.push(creator);
    });
    
    var tags = [];
    base.find("input[id^='tag_']").each(function(index, el){
        if(J(el).val() !== ''){
            tags.push({tag: J(el).val()});
        }
    });
    
    //grab all the notes from the form and add to item
    //in the case of new items we can add notes in the creation request
    //in the case of existing items we need to post notes to /children, but we still
    //have that interface here for consistency
    var notes = [];
    base.find("textarea[name^='note_']").each(function(index, el){
        var noteid = J(el).attr('id');
        var noteContent = tinyMCE.get(noteid).getContent();
        Z.debug(noteContent, 3);
        notes.push({itemType:'note', 'note': noteContent});
    });
    item.apiObj.notes = notes;
    
    item.apiObj.creators = creators;
    item.apiObj.tags = tags;
    //var requestData = JSON.stringify(item.apiObj);
    Z.debug("pre writeItem debug", 4);
    Z.debug(item, 4);
    //show spinner before making ajax write call
    Zotero.ui.showSpinner(J(formEl).closest('.ajaxload'));
    var jqxhr = item.writeItem();
    jqxhr.done(J.proxy(function(newItemKey){
        Z.debug("item write finished", 3);
        delete Zotero.nav.urlvars.pathVars['action'];
        if(itemKey === ''){
            //newly created item, add to collection if collectionkey in url
            var collectionKey = Zotero.nav.getUrlVar('collectionKey');
            if(collectionKey){
                var collection = library.collections[collectionKey];
                collection.addItems([item.itemKey]);
                library.dirty = true;
            }
            Zotero.nav.urlvars.pathVars['itemKey'] = item.itemKey;
        }
        Zotero.nav.clearUrlVars(['itemKey', 'collectionKey']);
        Zotero.nav.pushState(true);
    }, this));
    
    //update list of tags we have if new ones added
    Z.debug('adding new tags to library tags', 3);
    var libTags = library.tags;
    J.each(tags, function(index, tagOb){
        var tagString = tagOb.tag;
        if(!libTags.tagObjects.hasOwnProperty(tagString)){
            var tag = new Zotero.Tag();
            tag.title = tagString;
            tag.numItems = 1;
            tag.urlencodedtag = encodeURIComponent(tag.title);
            libTags.tagObjects[tagString] = tag;
            libTags.updateSecondaryData();
        }
    });
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
            J.tmpl('editnoteformTemplate', {item:item,
                                         itemKey:item.itemKey
                                         }).appendTo(jel);
            
            Zotero.ui.init.tinyMce('default');
        }
        else {
            J.tmpl('itemformTemplate', {item:item.apiObj,
                                        libraryUserID:zoteroData.libraryUserID,
                                        itemKey:item.itemKey,
                                        creatorTypes:itemCreatorTypes
                                        }
                                        ).appendTo(jel);
            if(item.apiObj.tags.length === 0){
                Zotero.ui.addTag(false);
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
 * Temporarily store the data in a form so it can be reloaded
 * @return {undefined}
 */
Zotero.ui.saveFormData = function(){
    Z.debug("saveFormData", 3);
    J(".ajaxload").each(function(){
        var formInputs = J(this).find('input');
        J(this).data('tempformstorage', formInputs);
    });
};

/**
 * Reload previously saved form data
 * @param  {Dom Element} el DOM Form to restore data to
 * @return {undefined}
 */
Zotero.ui.loadFormData = function(el){
    Z.debug("loadFormData", 3);
    var formData = J(el).data('tempformstorage');
    if(J(el).data("ignoreformstorage")){
        Z.debug("ignoring stored form data", 3);
        J(el).removeData('tempFormStorage');
        J(el).removeData('ignoreFormStorage');
        return;
    }
    Z.debug('formData: ', 4);
    Z.debug(formData, 4);
    if(formData){
        formData.each(function(index){
            var idstring = '#' + J(this).attr('id');
            Z.debug('idstring:' + idstring, 4);
            if(J(idstring).length){
                Z.debug('setting value of ' + idstring, 4);
                J(idstring).val(J(this).val());
            }
        });
    }
};

/**
 * Add a tag field to an edit item form
 * @param {bool} focus Whether to focus the newly added tag field
 */
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
    J.tmpl('itemtagTemplate', {index:newindex}).appendTo(jel);
    
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
    
    Zotero.ui.init.tagButtons();
    
    Zotero.ui.createOnActivePage(jel);
};

/**
 * Remove a tag field from an edit item form
 * @param  {DOM Element} el Tag field to remove
 * @return {undefined}
 */
Zotero.ui.removeTag = function(el) {
    Z.debug("Zotero.ui.removeTag", 3);
    J(el).closest('.edit-tag-div').remove();
    
    Zotero.ui.createOnActivePage(el);
};

/**
 * Get the class for an itemType to display an appropriate icon
 * @param  {Zotero_Item} item Zotero item to get the class for
 * @return {string}
 */
Zotero.ui.itemTypeClass = function(item) {
    var itemTypeClass = item.itemType;
    if (item.itemType == 'attachment') {
        if (item.mimeType == 'application/pdf') {
            itemTypeClass += '-pdf';
        }
        else {
            switch (item.linkMode) {
                case 0: itemTypeClass += '-file'; break;
                case 1: itemTypeClass += '-file'; break;
                case 2: itemTypeClass += '-snapshot'; break;
                case 3: itemTypeClass += '-web-link'; break;
            }
        }
    }
    return "img-" + itemTypeClass;
};

/**
 * Bine collection links to take appropriate action instead of following link
 * @return {boolean}
 */
Zotero.ui.bindCollectionLinks = function(){
    Z.debug("Zotero.ui.bindCollectionLinks", 3);
    
    J("#collection-list-div").on('click', "div.folder-toggle", function(e){
        e.preventDefault();
        J(this).siblings('.collection-select-link').click();
        return false;
    });
    
    J("#collection-list-div").on('click', ".collection-select-link", function(e){
        Z.debug("collection-select-link clicked", 4);
        e.preventDefault();
        var collection, library;
        var collectionKey = J(this).attr('data-collectionkey');
        //if this is the currently selected collection, treat as expando link
        if(J(this).hasClass('current-collection')) {
            var expanded = J('.current-collection').data('expanded');
            if(expanded === true){
                Zotero.ui.nestHideCollectionTree(J("#collection-list-container"), false);
            }
            else{
                Zotero.ui.nestHideCollectionTree(J("#collection-list-container"), true);
            }
            
            //go back to items list
            Zotero.nav.clearUrlVars(['collectionKey', 'mode']);
            
            //change the mobile page if we didn't just expand a collection
            if(Zotero.config.mobile && (Zotero.nav.getUrlVar('mode') != 'edit')){
                collection = Zotero.ui.getAssociatedLibrary(J(this));
                if(!collection.hasChildren){
                    Z.debug("Changing page to items list because collection has no children", 4);
                    //Zotero.ui.mobile.changePage('#library-items-page');
                    //Zotero.ui.mobile.changePage("#library-items-page", {'changeHash':false}, false);
                    //J("#library-items-page").trigger('create');
                }
            }
            else{
                Zotero.nav.pushState();
            }
            
            //cancel action for expando link behaviour
            return false;
        }
        
        //Not currently selected collection
        Z.debug("click " + collectionKey, 4);
        Zotero.nav.clearUrlVars(['mode']);
        Zotero.nav.urlvars.pathVars['collectionKey'] = collectionKey;
        
        //url changes done, push state now
        //Zotero.nav.pushState();
        
        //change the mobile page if we didn't just expand a collection
        Z.debug("change mobile page if we didn't just expand a collection", 4);
        Z.debug(J(this), 4);
        if(Zotero.config.mobile){
            Z.debug("is mobile", 4);
            library = Zotero.ui.getAssociatedLibrary(J(this).closest('.ajaxload'));
            collection = library.collections.getCollection(collectionKey);
            if(!collection.hasChildren && (Zotero.nav.getUrlVar('mode') != 'edit')) {
                Z.debug("Changing page to items list because collection has no children", 4);
                //Zotero.ui.mobile.changePage('#library-items-page');
                Zotero.ui.mobile.changePage("#library-items-page", {'changeHash':false});
                //J("#library-items-page").trigger('create');
            }
            else{
                Zotero.nav.pushState();
            }
        }
        else{
            Zotero.nav.pushState();
        }
        
        return false;
    });
    J("#collection-list-div").on('click', "a.my-library", function(e){
        e.preventDefault();
        Zotero.nav.clearUrlVars(['mode']);
        if(Zotero.config.mobile){
            Zotero.ui.mobile.changePage("#library-items-page", {'changeHash':false});
        }
        
        Zotero.nav.pushState();
        return false;
    });
};

/**
 * Bine item links to take appropriate action instead of following link
 * @return {undefined}
 */
Zotero.ui.bindItemLinks = function(){
    Z.debug("Zotero.ui.bindItemLinks", 3);
    
    J("div#items-pane").on('click', "a.item-select-link", function(e){
        e.preventDefault();
        Z.debug("item-select-link clicked", 3);
        var itemKey = J(this).attr('data-itemKey');
        Z.debug("click " + itemKey, 4);
        Zotero.nav.urlvars.pathVars.itemKey = itemKey;
        Zotero.nav.pushState();
        //Zotero.callbacks.loadItem(el, 'user', itemKey);
    });
    J("div#items-pane").on('click', 'td[data-itemkey]:not(.edit-checkbox-td)', function(e){
        e.preventDefault();
        Z.debug("item-select-td clicked", 3);
        var itemKey = J(this).attr('data-itemKey');
        Z.debug("click " + itemKey, 4);
        Zotero.nav.urlvars.pathVars.itemKey = itemKey;
        Zotero.nav.pushState();
        //Zotero.callbacks.loadItem(el, 'user', itemKey);
    });
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

//generate the full html for the nested collections list
/**
 * generate the full html for the nested collections list
 * @param  {Dom Element} el          Element to display collections in
 * @param  {Zotero_Collections} collections Zotero_Collections to display
 * @return {undefined}
 */
Zotero.ui.displayCollections = function(el, collections){
    Z.debug("Zotero.ui.displayCollections", 3);
    Z.debug("library Identifier " + collections.libraryUrlIdentifier, 4);
    var jel = J(el);
    var currentCollectionKey = Zotero.nav.getUrlVar('collectionKey') || '';
    var trash = collections.owningLibrary.libraryType == 'user' ? true : false;
    //var ncollections = collections.nestedOrderingArray();
    J.tmpl('collectionlistTemplate', {collections:collections.collectionsArray,
                                        libUrlIdentifier:collections.libraryUrlIdentifier,
                                        currentCollectionKey: currentCollectionKey,
                                        trash: trash
                                        //ncollections: ncollections
                                    }
                                    ).appendTo(jel);
    
    
    Zotero.ui.createOnActivePage(el);
    
};

/**
 * Nest the collection tree and hide/show appropriate nodes
 * @param  {Dom Element} el             Container element
 * @param  {boolean} expandSelected Show or hide the currently selected collection
 * @return {undefined}
 */
Zotero.ui.nestHideCollectionTree = function(el, expandSelected){
    if(typeof expandSelected == 'undefined'){
        expandSelected = true;
    }
    //nest and hide collection tree
    var jel = J(el);
    jel.find("#collection-list ul").hide().siblings(".folder-toggle")
                                        .children(".sprite-placeholder")
                                        .removeClass("sprite-placeholder")
                                        .addClass("ui-icon-triangle-1-e");
    jel.find(".current-collection").parents("ul").show();
    jel.find("#collection-list li.current-collection").children('ul').show();
    //start all twisties in closed position
    jel.find(".ui-icon-triangle-1-s").removeClass("ui-icon-triangle-1-s").addClass("ui-icon-triangle-1-e");
    //show opened twisties as expanded
    jel.find("li.current-collection").parentsUntil("#collection-list").children('div.folder-toggle').find(".ui-icon-triangle-1-e")
                                                .removeClass("ui-icon-triangle-1-e")
                                                .addClass("ui-icon-triangle-1-s");
    
    
    if(expandSelected === false){
        jel.find("#collection-list li.current-collection").children('ul').hide();
        jel.find("#collection-list li.current-collection").find(".ui-icon-triangle-1-s")
                                                    .removeClass("ui-icon-triangle-1-s")
                                                    .addClass("ui-icon-triangle-1-e");
        jel.find(".current-collection").data('expanded', false);
    }
    else{
        jel.find("li.current-collection").children('div.folder-toggle').find(".ui-icon-triangle-1-e")
                                                .removeClass("ui-icon-triangle-1-e")
                                                .addClass("ui-icon-triangle-1-s");
                                                
        jel.find(".current-collection").data('expanded', true);
    }
    
    Zotero.ui.createOnActivePage(el);
};

/**
 * Highlight the currently selected collection
 * @return {undefined}
 */
Zotero.ui.highlightCurrentCollection = function(){
    Z.debug("Zotero.ui.highlightCurrentCollection", 3);
    var collectionKey = Zotero.nav.getUrlVar('collectionKey');
    //unhighlight currently highlighted
    J("a.current-collection").closest("li").removeClass("current-collection");
    J("a.current-collection").removeClass("current-collection");
    
    if(collectionKey){
        //has collection selected, highlight it
        J("a[data-collectionKey='" + collectionKey + "']").addClass("current-collection");
        J("a[data-collectionKey='" + collectionKey + "']").closest('li').addClass("current-collection");
    }
    else{
        J("a.my-library").addClass("current-collection");
        J("a.my-library").closest('li').addClass("current-collection");
    }
};

/**
 * Update enabled/disabled for collection buttons based on context
 * @return {undefined}
 */
Zotero.ui.updateCollectionButtons = function(){
    var editCollectionsButtonsList = J(".edit-collections-buttons-list");
    editCollectionsButtonsList.buttonset().show();
    
    //enable modify and delete only if collection is selected
    J("#edit-collections-buttons-div").buttonset();
    
    J(".create-collection-link").button('option', 'icons', {primary:'sprite-toolbar-collection-add'}).button('option', 'text', false);
    J(".update-collection-link").button('option', 'icons', {primary:'sprite-toolbar-collection-edit'}).button('option', 'text', false);
    J(".delete-collection-link").button('option', 'icons', {primary:'sprite-folder_delete'}).button('option', 'text', false);
    
    if(Zotero.nav.getUrlVar("collectionKey")){
        J(".update-collection-link").button('enable');
        J(".delete-collection-link").button('enable');
    }
    else{
        J(".update-collection-link").button().button('disable');
        J(".delete-collection-link").button().button('disable');
    }
};

/**
 * Display an items widget (for logged in homepage)
 * @param  {Dom Element} el          Container
 * @param  {object} config      items config
 * @param  {array} loadedItems loaded items array
 * @return {undefined}
 */
Zotero.ui.displayItemsWidget = function(el, config, loadedItems){
    Z.debug("Zotero.ui.displayItemsWidget", 3);
    Z.debug(config, 4);
    //Z.debug(loadedItems, 4);
    //figure out pagination values
    var itemPage = parseInt(Zotero.nav.getUrlVar('itemPage'), 10) || 1;
    var feed = loadedItems.feed;
    var start = parseInt(config.start, 10) || 0;
    var limit = parseInt(config.limit, 10) || 25;
    var order = config.order || Zotero.config.userDefaultApiArgs.order;
    var sort = config.sort || Zotero.config.sortOrdering[order] || 'asc';
    var editmode = false;
    var jel = J(el);
    
    var titleParts = feed.title.split('/');
    var displayFields = Zotero.prefs.library_listShowFields;
    
    var itemsTableData = {titleParts:titleParts,
                           displayFields:displayFields,
                           items:loadedItems.itemsArray,
                           editmode:editmode,
                           order: order,
                           sort: sort,
                           library: loadedItems.library
                        };
    Zotero.ui.insertItemsTable(el, itemsTableData);
    
};

/**
 * Display the full library items section
 * @param  {Dom Element} el          Container
 * @param  {object} config      items config
 * @param  {array} loadedItems loaded items array
 * @return {undefined}
 */
Zotero.ui.displayItemsFull = function(el, config, loadedItems){
    Z.debug("Zotero.ui.displayItemsFull", 3);
    Z.debug(config, 4);
    //Z.debug(loadedItems, 4);
    
    var jel = J(el);
    var feed = loadedItems.feed;
    var filledConfig = J.extend({}, Zotero.config.defaultApiArgs, Zotero.config.userDefaultApiArgs, config);

    var titleParts = feed.title.split('/');
    var displayFields = Zotero.prefs.library_listShowFields;
    if(loadedItems.library.libraryType != 'group'){
        displayFields = J.grep(displayFields, function(el, ind){
            return J.inArray(el, Zotero.Library.prototype.groupOnlyColumns) == (-1);
        });
        /*
        displayFields = displayFields.filter(function(el, ind, array){
            return J.inArray(el, Zotero.Library.prototype.groupOnlyColumns) == (-1);
        });*/
    }
    var editmode = (Zotero.config.librarySettings.allowEdit ? true : false);
    
    var itemsTableData = {titleParts:titleParts,
                           displayFields:displayFields,
                           items:loadedItems.itemsArray,
                           editmode:editmode,
                           order: filledConfig['order'],
                           sort: filledConfig['sort'],
                           library:loadedItems.library
                        };
    Z.debug(jel, 4);
    Zotero.ui.insertItemsTable(jel, itemsTableData);
    
    if(Zotero.config.mobile){
        Zotero.ui.createOnActivePage(el);
        return;
    }
    
    var pagination = Zotero.ui.createPagination(loadedItems.feed, 'itemPage', filledConfig);
    var paginationData = {feed:feed, pagination:pagination};
    var itemPage = pagination.page;
    Zotero.ui.insertItemsPagination(el, paginationData);
    Z.debug(jel, 4);
    
    //bind pagination links
    var lel = J(el);
    J("#start-item-link").click(function(e){
        e.preventDefault();
        Zotero.nav.urlvars.pathVars['itemPage'] = '';
        Zotero.nav.pushState();
    });
    J("#prev-item-link").click(function(e){
        e.preventDefault();
        var newItemPage = itemPage - 1;
        Zotero.nav.urlvars.pathVars['itemPage'] = newItemPage;
        Zotero.nav.pushState();
    });
    J("#next-item-link").click(function(e){
        e.preventDefault();
        var newItemPage = itemPage + 1;
        Zotero.nav.urlvars.pathVars['itemPage'] = newItemPage;
        Zotero.nav.pushState();
    });
    J("#last-item-link").click(function(e){
        e.preventDefault();
        Z.debug("last-item-link clickbind", 4);
        var lasthref = '';
        J.each(feed.links, function(ind, link){
            if(link.rel === "last"){
                lasthref = link.href;
                return false;
            }
        });
        Z.debug(lasthref, 4);
        var laststart = J.deparam.querystring(lasthref).start;
        Z.debug("laststart:" + laststart, 4);
        var lastItemPage = (parseInt(laststart, 10) / limit) + 1;
        Zotero.nav.urlvars.pathVars['itemPage'] = lastItemPage;
        Zotero.nav.pushState();
    });
    
    Zotero.ui.updateDisabledControlButtons();
    
    Zotero.ui.libraryBreadcrumbs();
    
    Zotero.ui.createOnActivePage(el);
};

/**
 * Build a pagination object necessary to figure out ranges and links
 * @param  {Zotero_Feed} feed    feed object being paginated
 * @param  {string} pageVar page variable used in url
 * @param  {object} config  config used to fetch feed being paginated
 * @return {object}
 */
Zotero.ui.createPagination = function(feed, pageVar, config){
    
    //set relevant config vars to find pagination values
    var page = parseInt(Zotero.nav.getUrlVar(pageVar), 10) || 1;
    var start = parseInt(config.start, 10) || 0;
    var limit = parseInt(config.limit, 10) || 25;
    var totalResults = parseInt(feed.totalResults, 10);
    
    //figure out pagination values
    var lastDisplayed = start + limit;
    var prevPageNum = (page - 1);
    var nextPageNum = (page + 1);
    var lastPageNum = feed.lastPage;
    
    //build pagination object
    var pagination = {page:page};
    pagination.showFirstLink = start > 0;
    pagination.showPrevLink = start > 0;
    pagination.showNextLink = totalResults > lastDisplayed;
    pagination.showLastLink = totalResults > (lastDisplayed );
    
    var mutateOb = {};
    pagination.firstLink = Zotero.nav.mutateUrl(mutateOb, [pageVar]);
    mutateOb[pageVar] = page - 1;
    pagination.prevLink = Zotero.nav.mutateUrl(mutateOb, []);
    mutateOb[pageVar] = page + 1;
    pagination.nextLink = Zotero.nav.mutateUrl(mutateOb, []);
    mutateOb[pageVar] = feed.lastPage;
    pagination.lastLink = Zotero.nav.mutateUrl(mutateOb, []);
    
    pagination.start = start;
    pagination.lastDisplayed = Math.min(lastDisplayed, totalResults);
    pagination.total = totalResults;
    
    Z.debug("last displayed:" + lastDisplayed + " totalResults:" + feed.totalResults, 4);
    return pagination;
};

/**
 * Render and insert items table html into a container
 * @param  {Dom Element} el   Container
 * @param  {object} data Data object to pass to itemstableTemplate partial
 * @return {undefined}
 */
Zotero.ui.insertItemsTable = function(el, data){
    Z.debug("Zotero.ui.insertItemsTable", 3);
    Z.debug(data, 4);
    var a = J.tmpl('itemstableTemplate', data).appendTo(J(el));
    
    //need to test for inside initialized page or error is thrown
    if(Zotero.config.mobile && J(el).closest('.ui-page').length){
        //J(el).trigger('create');
        if(!(J(el).find('#field-list').hasClass('ui-listview'))) {
            J(el).find('#field-list').listview();
        }
        else{
            //J(el).find('#field-list').listview('refresh');
            J(el).find('#field-list').trigger('refresh');
        }
    }
    
};

/**
 * Render and insert the items pagination block into a container
 * @param  {Dom Element} el   Container
 * @param  {object} data Data object to pass to itempaginationTemplate partial
 * @return {undefined}
 */
Zotero.ui.insertItemsPagination = function(el, data){
    J.tmpl('itempaginationTemplate', data).appendTo(J(el));
    Zotero.ui.init.paginationButtons(data.pagination);
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
        J.tmpl('editnoteformTemplate', {item:item,
                                         itemKey:item.itemKey
                                         }).appendTo(jel);
                                         
        Zotero.ui.init.tinyMce('default');
        Zotero.ui.init.editButton();
    }
    else if(item.itemType == "attachment"){
        Z.debug("item is attachment", 4);
        jel.empty();
        var mode = Zotero.nav.getUrlVar('mode');
        J.tmpl('attachmentformTemplate', {item:item.apiObj,
                                    itemKey:item.itemKey,
                                    creatorTypes:[],
                                    mode:mode
                                    }).appendTo(jel);
        
        //add empty tag if no tags yet
        if(item.apiObj.tags.length === 0){
            Zotero.ui.addTag(false);
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
        Zotero.ui.init.tinyMce();
        
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
            J.tmpl('itemformTemplate', {item:item.apiObj,
                                        itemKey:item.itemKey,
                                        creatorTypes:Zotero.Item.prototype.creatorTypes[item.apiObj.itemType],
                                        mode:mode
                                        }).appendTo(jel);
            
            //add empty tag if no tags yet
            if(item.apiObj.tags.length === 0){
                Zotero.ui.addTag(false);
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
};

/**
 * Get the Zotero Library associated with an element (generally a .ajaxload element)
 * @param  {Dom Element} el Dom element
 * @return {Zotero_Library}
 */
Zotero.ui.getAssociatedLibrary = function(el){
    Z.debug("Zotero.ui.getAssociatedLibrary", 3);
    var jel;
    if(typeof el == 'undefined'){
        jel = J("#library-items-div");
    }
    else {
        jel = J(el);
        if(jel.length === 0){
            jel = J("#library-items-div");
        }
    }
    
    //get Zotero.Library object if already bound to element
    var library = jel.data('zoterolibrary');
    if(!library){
        var loadConfig = jel.data('loadconfig');
        var libraryID = loadConfig.libraryID;
        var libraryType = loadConfig.libraryType;
        var libraryUrlIdentifier = loadConfig.libraryUrlIdentifier;
        if(!libraryID || !libraryType) {
            Z.debug("Bad library data attempting to get associated library: libraryID " + libraryID + " libraryType " + libraryType, 1);
            throw "Err";
        }
        if(Zotero.libraries[Zotero.utils.libraryString(libraryType, libraryID)]){
            library = Zotero.libraries[Zotero.utils.libraryString(libraryType, libraryID, libraryUrlIdentifier)];
        }
        else{
            library = new Zotero.Library(libraryType, libraryID, libraryUrlIdentifier);
            Zotero.libraries[Zotero.utils.libraryString(libraryType, libraryID)] = library;
        }
        jel.data('zoterolibrary', library);
    }
    return library;
};

/**
 * Empty conatiner and show preloader spinner
 * @param  {Dom Element} el   container
 * @param  {string} type type of preloader to show
 * @return {undefined}
 */
Zotero.ui.showSpinner = function(el, type){
    var spinnerUrl = Zotero.config.baseWebsiteUrl + '/static/images/theme/broken-circle-spinner.gif';
    if(!type){
        J(el).html("<img class='spinner' src='" + spinnerUrl + "'/>");
    }
    else if(type == 'horizontal'){
        J(el).html("<img class='spinner' src='" + spinnerUrl + "'/>");
    }
};

/**
 * Append a preloader spinner to an element
 * @param  {Dom Element} el container
 * @return {undefined}
 */
Zotero.ui.appendSpinner = function(el){
    var spinnerUrl = Zotero.config.baseWebsiteUrl + '/static/images/theme/broken-circle-spinner.gif';
    J(el).append("<img class='spinner' src='" + spinnerUrl + "'/>");
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
    J("#selected-tags-list").replaceWith(J.tmpl('tagunorderedlistTemplate', {tags:selectedTags, id:'selected-tags-list'}));
    J("#tags-list").replaceWith(J.tmpl('tagunorderedlistTemplate', {tags:passTags, id:'tags-list'}));
    
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
    //Z.debug(item, 4);
    var parentUrl = false;
    if(item.parentKey){
        parentUrl = item.owningLibrary.websiteUrl({itemKey:item.parentKey});
    }
    Z.debug(1);
    if(item.itemType == "note"){
        Z.debug("note item", 3);
        J.tmpl('itemnotedetailsTemplate', {item:item, parentUrl:parentUrl}).appendTo(jel);
    }
    else{
        Z.debug("non-note item", 3);
        J.tmpl('itemdetailsTemplate', {item:item, parentUrl:parentUrl}).appendTo(jel).trigger('create');
    }
    Z.debug(2);
    Zotero.ui.init.tinyMce('readonly');
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
 * Format an item field for display
 * @param  {string} field item field name
 * @param  {Zotero_Item} item  Zotero Item
 * @param  {boolean} trim  Trim output to limit length
 * @return {string}
 */
Zotero.ui.formatItemField = function(field, item, trim){
    if(typeof trim == 'undefined'){
        trim = false;
    }
    var trimLength = 0;
    var formattedString = '';
    var date;
    if(Zotero.config.maxFieldSummaryLength[field]){
        trimLength = Zotero.config.maxFieldSummaryLength[field];
    }
    switch(field){
        case "itemType":
            formattedString = Zotero.localizations.typeMap[item['itemType']];
            break;
        case "dateModified":
            if(!item['dateModified']){
                formattedString = '';
            }
            date = Zotero.utils.parseApiDate(item['dateModified']);
            if(date){
                formattedString = Globalize.format(date, 'd') + ' ' + Globalize.format(date, 't');
            }
            else{
                formattedString = item['dateModified'];
            }
            formattedString = date.toLocaleString();
            break;
        case "dateAdded":
            if(!item['dateAdded']){
                formattedString = '';
            }
            date = Zotero.utils.parseApiDate(item['dateAdded']);
            if(date){
                formattedString = Globalize.format(date, 'd') + ' ' + Globalize.format(date, 't');
            }
            else{
                formattedString = item['dateAdded'];
            }
            break;
        case "title":
            formattedString = item.title;
            break;
        case "creator":
            formattedString = item.creatorSummary;
            break;
        case "addedBy":
            formattedString = item.author.name;
            break;
        default:
            if(typeof(item[field]) !== "undefined"){
                formattedString = item[field];
            }
            else if(item.apiObject){
                if(item.apiObject[field]){
                    formattedString = item.apiObject[field];
                }
            }
            else if(item.contentRows){
                J.each(item.contentRows, function(rowI, row){
                    if(row.field === field){
                        formattedString = row.fieldValue;
                    }
                });
            }
    }
    if(trim && (trimLength > 0) && (formattedString.length > trimLength) ) {
        return formattedString.slice(0, trimLength) + '…';
    }
    else{
        return formattedString;
    }
};

/**
 * Trim string to specified length and add ellipsis
 * @param  {string} s      string to trim
 * @param  {int} maxlen maximum length to allow for string
 * @return {string}
 */
Zotero.ui.trimString = function(s, maxlen){
    var trimLength = 35;
    var formattedString = s;
    if(maxlen){
        trimLength = maxlen;
    }
    if((trimLength > 0) && (formattedString.length > trimLength) ) {
        return formattedString.slice(0, trimLength) + '…';
    }
    else{
        return formattedString;
    }
};

/**
 * Format a date field from a Zotero Item based on locale
 * @param  {string} field field name to format
 * @param  {Zotero_Item} item  Zotero Item owning the field
 * @return {string}
 */
Zotero.ui.formatItemDateField = function(field, item){
    var date;
    switch(field){
        case "dateModified":
            if(!item['dateModified']){
                return '';
            }
            date = Zotero.utils.parseApiDate(item['dateModified']);
            if(date){
                return "<span class='localized-date-span'>" + Globalize.format(date, 'd') + "</span> <span class='localized-date-span'>" + Globalize.format(date, 't') + "</span>";
            }
            else{
                return item['dateModified'];
            }
            return date.toLocaleString();
        case "dateAdded":
            if(!item['dateAdded']){
                return '';
            }
            date = Zotero.utils.parseApiDate(item['dateAdded']);
            if(date){
                return "<span class='localized-date-span'>" + Globalize.format(date, 'd') + "</span> <span class='localized-date-span'>" + Globalize.format(date, 't') + "</span>";
            }
            else{
                return item['dateAdded'];
            }
            break;
    }
    return '';
};

/**
 * Format a content row from a Zotero Item for display
 * @param  {string} contentRow contenteRow name
 * @return {string}
 */
Zotero.ui.formatItemContentRow = function(contentRow){
    if(contentRow.field == 'date'){
        if(!contentRow.fieldValue){return '';}
        var date = Zotero.utils.parseApiDate(contentRow.value);
        if(!date){
            return contentRow.fieldValue;
        }
        else{
            return date.toLocaleString();
        }
    }
    else{
        return contentRow.fieldValue;
    }
};

Zotero.ui.userGroupsDisplay = function(groups){
    var html = '';
    J.each(groups.groupsArray, function(index, group){
        html += Zotero.ui.groupNugget(group);
    });
    return html;
};

Zotero.ui.groupTypeMap = {'Private': 'Private',
                   'PublicOpen': 'Public, Open Membership',
                   'PublicClosed': 'Public, Closed Membership'};
                   
Zotero.ui.groupAccessMap = {
                    'all'     : {'members' : 'Anyone can view, only members can edit',
                                       'admins'  : 'Anyone can view, only admins can edit'},
                    'members' : {'members' : 'Only members can view and edit',
                                       'admins'  : 'Only members can view, only admins can edit'},
                    'admins'  : {'members' : 'Only admins can view, only members can edit',
                                       'admins'  : 'Only admins can view and edit'}
                    };

Zotero.ui.groupUrl = function(group, route){
    var groupBase;
    if(group.groupType == 'Private'){
        groupBase = '/groups/' + group.groupID;
    }
    else{
        groupBase = '/groups/' + Zotero.utils.slugify(group.groupName);
    }
    var groupIDBase = '/groups/' + group.groupID;
    Zotero.debug("groupBase: " + groupBase);
    switch(route){
        case 'groupView':
            return groupBase;
        case 'groupLibrary':
            return groupBase + '/items';
        case 'groupSettings':
            return groupIDBase + '/settings';
        case 'groupMembers':
            return groupIDBase + '/members';
        case 'groupLibrarySettings':
            return groupIDBase + '/settings/library';
        case 'groupMembersSettings':
            return groupIDBase + '/settings/members';
    }
};

/**
 * Update the page's breadcrumbs based on the current state
 * @param  {Zotero_Library} library current Zotero Library
 * @param  {object} config  Current config object being displayed
 * @return {undefined}
 */
Zotero.ui.libraryBreadcrumbs = function(library, config){
    Z.debug('Zotero.ui.libraryBreadcrumbs', 3);
    try{
    var breadcrumbs;
    if(!library){
        library = Zotero.ui.getAssociatedLibrary(J("#feed-link-div"));
    }
    if(!config){
        config = Zotero.nav.getUrlVars();
    }
    Z.debug(config, 4);
    if(library.libraryType == 'user'){
        breadcrumbs = [{label:'Home', path:'/'},
                           {label:'People', path:'/people'},
                           {label:(library.libraryLabel || library.libraryUrlIdentifier), path:'/' + library.libraryUrlIdentifier},
                           {label:'Library', path:'/' + library.libraryUrlIdentifier + '/items'}];
    }
    else{
        breadcrumbs = [{label:'Home', path:'/'},
                           {label:'Groups', path:'/groups'},
                           {label:(library.libraryLabel || library.libraryUrlIdentifier), path:'/groups/' + library.libraryUrlIdentifier},
                           {label:'Library', path:'/groups/' + library.libraryUrlIdentifier + '/items'}];
    }
    if(config.collectionKey){
        Z.debug("have collectionKey", 4);
        if(library.collections[config.collectionKey]){
            breadcrumbs.push({label:library.collections[config.collectionKey]['name'], path:Zotero.nav.buildUrl({collectionKey:config.collectionKey})});
        }
    }
    if(config.itemKey){
        Z.debug("have itemKey", 4);
        breadcrumbs.push({label:library.items.getItem(config.itemKey).title, path:Zotero.nav.buildUrl({collectionKey:config.collectionKey, itemKey:config.itemKey})});
    }
    Z.debug(breadcrumbs, 4);
    J("#breadcrumbs").empty();
    J.tmpl('breadcrumbsTemplate', {breadcrumbs:breadcrumbs}).appendTo(J("#breadcrumbs"));
    var newtitle = J.tmpl('breadcrumbstitleTemplate', {breadcrumbs:breadcrumbs}).text();
    Zotero.nav.updateStateTitle(newtitle);
    Z.debug("done with breadcrumbs", 4);
    }
    catch(e){
        Zotero.debug("Error loading breadcrumbs", 2);
    }
    
};

/**
 * trigger create on actively displayed page (placeholder version of mobile function which actually does something)
 * @param  {Dom Element} el Active page element
 * @return {undefined}
 */
Zotero.ui.createOnActivePage = function(el){
    
};

/**
 * Trigger a ZoteroItemUpdated event on the document for zotero translators
 * @return {undefined}
 */
Zotero.ui.zoteroItemUpdated = function(){
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

