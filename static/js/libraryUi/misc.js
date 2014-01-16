
/**
 * Update a Zotero_Item object from the current values of an edit item form
 * @param  {Zotero_Item} item   Zotero item to update
 * @param  {Dom Form} formEl edit item form to take values from
 * @return {bool}
 */
Zotero.ui.updateItemFromForm = function(item, formEl){
    Z.debug("Zotero.ui.updateItemFromForm", 3);
    
    var base = J(formEl);
    base.closest('.eventfulwidget').data('ignoreformstorage', true);
    var library = Zotero.ui.getAssociatedLibrary(base);
    
    var itemKey = '';
    if(item.itemKey) itemKey = item.itemKey;
    else {
        //new item - associate with library and add to collection if appropriate
        if(library){
            item.associateWithLibrary(library);
        }
        var collectionKey = Zotero.state.getUrlVar('collectionKey');
        if(collectionKey){
            item.addToCollection(collectionKey);
        }
    }
    //update current representation of the item with form values
    J.each(item.apiObj, function(field, value){
        var selector, inputValue, noteElID;
        if(field == 'note'){
            selector = "textarea[data-itemKey='" + itemKey + "'].rte";
            Z.debug(selector, 4);
            noteElID = base.find(selector).attr('id');
            Z.debug(noteElID, 4);
            inputValue = Zotero.ui.getRte(noteElID);
        }
        else{
            selector = "[data-itemKey='" + itemKey + "'][name='" + field + "']";
            inputValue = base.find(selector).val();
        }
        
        if(typeof inputValue !== 'undefined'){
            Z.debug("updating item " + field + ": " + inputValue);
            item.set(field, inputValue);
            //item.apiObj[field] = inputValue;//base.find(selector).val();
        }
    });
    var creators = [];
    base.find("tr.creator").each(function(index, el){
        var creator = Zotero.ui.creatorFromElement(el);
        if(creator !== null){
            creators.push(creator);
        }
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
    base.find("textarea.note-text").each(function(index, el){
        var noteid = J(el).attr('id');
        var noteContent = Zotero.ui.getRte(noteid);
        
        var noteItem = new Zotero.Item();
        if(library){
            noteItem.associateWithLibrary(library);
        }
        noteItem.initEmptyNote();
        noteItem.set('note', noteContent);
        noteItem.setParent(item.itemKey);
        notes.push(noteItem);
    });
    
    item.notes = notes;
    item.apiObj.creators = creators;
    item.apiObj.tags = tags;
    item.synced = false;
    
};

Zotero.ui.creatorFromElement = function(el){
    var name, creator, firstName, lastName;
    var jel = J(el);
    var trindex = parseInt(jel.data('creatorindex'), 10);//parseInt(jel.attr('id').substr(8), 10);
    var creatorType = jel.find("select.creator-type-select").val();
    if(jel.hasClass('singleCreator')){
        name = jel.find("input.creator-name");
        if(!name.val()){
            //can't submit authors with empty names
            return null;
        }
        creator = {creatorType: creatorType,
                        name: name.val()
                    };
    }
    else if(jel.hasClass('doubleCreator')){
        firstName = jel.find("input.creator-first-name").val();
        lastName = J(el).find("input.creator-last-name").val();
        if((firstName === '') && (lastName === '')){
            return null;
        }
        creator = {creatorType: creatorType,
                        firstName: firstName,
                        lastName: lastName
                        };
    }
    return creator;
};

Zotero.ui.saveItem = function(item) {
    //var requestData = JSON.stringify(item.apiObj);
    Z.debug("pre writeItem debug", 4);
    Z.debug(item, 4);
    //show spinner before making ajax write call
    var library = item.owningLibrary;
    item.writeItem()
    .then(function(writtenItems){
        Z.debug("item write finished", 3);
        //check for errors, update nav
        if(item.writeFailure){
            
        }
        
        delete Zotero.state.pathVars['action'];
        Zotero.state.pathVars['itemKey'] = item.itemKey;
        
        Zotero.state.clearUrlVars(['itemKey', 'collectionKey']);
        Zotero.state.pushState(true);
    });
    
    //update list of tags we have if new ones added
    Z.debug('adding new tags to library tags', 3);
    var libTags = library.tags;
    var tags = item.apiObj.tags;
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
 * Temporarily store the data in a form so it can be reloaded
 * @return {undefined}
 */
Zotero.ui.saveFormData = function(){
    Z.debug("saveFormData", 3);
    J(".eventfulwidget").each(function(){
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
 * Build a pagination object necessary to figure out ranges and links
 * @param  {Zotero_Feed} feed    feed object being paginated
 * @param  {string} pageVar page variable used in url
 * @param  {object} config  config used to fetch feed being paginated
 * @return {object}
 */
Zotero.ui.createPagination = function(feed, pageVar, config){
    
    //set relevant config vars to find pagination values
    var page = parseInt(Zotero.state.getUrlVar(pageVar), 10) || 1;
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
    pagination.firstLink = Zotero.state.mutateUrl(mutateOb, [pageVar]);
    mutateOb[pageVar] = page - 1;
    pagination.prevLink = Zotero.state.mutateUrl(mutateOb, []);
    mutateOb[pageVar] = page + 1;
    pagination.nextLink = Zotero.state.mutateUrl(mutateOb, []);
    mutateOb[pageVar] = feed.lastPage;
    pagination.lastLink = Zotero.state.mutateUrl(mutateOb, []);
    
    pagination.start = start;
    pagination.lastDisplayed = Math.min(lastDisplayed, totalResults);
    pagination.total = totalResults;
    
    Z.debug("last displayed:" + lastDisplayed + " totalResults:" + feed.totalResults, 4);
    return pagination;
};

/**
 * Get the Zotero Library associated with an element (generally a .eventfulwidget element)
 * @param  {Dom Element} el Dom element
 * @return {Zotero_Library}
 */
Zotero.ui.getAssociatedLibrary = function(el){
    Z.debug("Zotero.ui.getAssociatedLibrary", 3);
    var jel;
    if(typeof el == 'undefined'){
        jel = J(".zotero-library").first();
    }
    else {
        jel = J(el);
        if(jel.length === 0 || jel.is("#eventful") ){
            jel = J(".zotero-library").first();
            if(jel.length === 0){
                Z.debug("No element passed and no default found for getAssociatedLibrary.");
                throw new Error("No element passed and no default found for getAssociatedLibrary.");
            }
        }
    }
    
    //get Zotero.Library object if already bound to element
    var library = jel.data('zoterolibrary');
    if(!library){
        //try getting it from a libraryString included on DOM element
        var libString = J(el).data('library');
        if(libString){
            if(Zotero.libraries.hasOwnProperty(libString)){
                library = Zotero.libraries[libString];
            }
            else{
                var libConfig = Zotero.utils.parseLibString(libString);
                library = new Zotero.Library(libConfig.libraryType, libConfig.libraryID);
                Zotero.libraries[libString] = library;
            }
        }
        /*
        if(libString && Zotero.libraries.hasOwnProperty(libString)){
            library = Zotero.libraries[libString];
        }
        else if(typeof jel.attr('data-loadconfig') != 'undefined') {
            var loadConfig = jel.data('loadconfig');
            var libraryID = loadConfig.libraryID;
            var libraryType = loadConfig.libraryType;
            var libraryUrlIdentifier = loadConfig.libraryUrlIdentifier;
            if(!libraryID || !libraryType) {
                Z.debug("Bad library data attempting to get associated library: libraryID " + libraryID + " libraryType " + libraryType, 1);
                throw new Error("Bad library data attempting to get associated library: libraryID " + libraryID + " libraryType " + libraryType);
            }
            if(Zotero.libraries[Zotero.utils.libraryString(libraryType, libraryID)]){
                library = Zotero.libraries[Zotero.utils.libraryString(libraryType, libraryID, libraryUrlIdentifier)];
            }
            else{
                library = new Zotero.Library(libraryType, libraryID, libraryUrlIdentifier);
                Zotero.libraries[Zotero.utils.libraryString(libraryType, libraryID)] = library;
            }
        }
        else if(libString){
            var libData= Zotero.ui.parseLibString(libString);
            library = new Zotero.Library(libData.libraryType, libData.libraryID, "");
        }
        */
        jel.data('zoterolibrary', library);
    }
    return library;
};

Zotero.ui.getEventLibrary = function(e){
    var tel = J(e.triggeringElement);
    if(e.library){
        return e.library;
    }
    if(e.data && e.data.library){
        return e.data.library;
    }
    Z.debug(e);
    var libString = tel.data('library');
    if(!libString){
        throw "no library on event or libString on triggeringElement";
    }
    if(Zotero.libraries.hasOwnProperty(libString)){
        return Zotero.libraries[libString];
    }
    
    var libConfig = Zotero.ui.parseLibString(libString);
    library = new Zotero.Library(libConfig.libraryType, libConfig.libraryID, '');
    Zotero.libraries[Zotero.utils.libraryString(libraryType, libraryID)] = library;
};
/*
Zotero.ui.parseLibString = function(s){
    var libraryType, libraryID;
    if(s[0] == "u"){
        libraryType = "user";
    }
    else {
        libraryType = "group";
    }
    libraryID = s.slice(1);
    return {libraryType:libraryType, libraryID:libraryID};
};
*/
/**
 * Get the highest priority variable named key set from various configs
 * @param  {[type]} key [description]
 * @return {[type]}     [description]
 */
Zotero.ui.getPrioritizedVariable = function(key, defaultVal){
    var val = Zotero.state.getUrlVar(key) || Zotero.preferences.getPref(key) || Zotero.config.defaultApiArgs[key] || defaultVal;
    return val;
};

/**
 * Scroll to the top of the window
 * @return {undefined}
 */
Zotero.ui.scrollToTop = function(){
    window.scrollBy(0, -5000);
};

//get the nearest ancestor that is eventfulwidget
Zotero.ui.parentWidgetEl = function(el){
    var matching;
    if(el.hasOwnProperty('data') && el.data.hasOwnProperty('widgetEl')){
        Z.debug("event had widgetEl associated with it");
        return J(el.data.widgetEl);
    } else if(el.hasOwnProperty('currentTarget')){
        Z.debug("event currentTarget set");
        matching = J(el.currentTarget).closest(".eventfulwidget");
        if(matching.length > 0){
            return matching.first();
        } else {
            Z.debug("no matching closest to currentTarget");
            Z.debug(el.currentTarget);
            Z.debug(el.currentTarget);
        }
    }
    
    matching = J(el).closest(".eventfulwidget");
    if(matching.length > 0){
        Z.debug("returning first closest widget");
        return matching.first();
    }
    return null;
};
