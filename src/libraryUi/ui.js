'use strict';

var log = require('../Log.js').Logger('zotero-web-library:ui');

var ui = {};

/**
 * Display a JS notification message to the user
 * @param  {string} message Notification message
 * @param  {string} type    confirm, notice, or error
 * @param  {int} timeout seconds to display notification
 * @return {undefined}
 */
ui.jsNotificationMessage = function(message, type, timeout){
    log.debug("notificationMessage: " + type + " : " + message, 3);
    if(Zotero.config.suppressErrorNotifications) return;
    
    if(!timeout && (timeout !== false)){
        timeout = 5;
    }
    var alertType = "alert-info";
    if(type){
        switch(type){
            case 'error':
            case 'danger':
                alertType = 'alert-danger';
                timeout = false;
                break;
            case 'success':
            case 'confirm':
                alertType = 'alert-success';
                break;
            case 'info':
                alertType = 'alert-info';
                break;
            case 'warning':
            case 'warn':
                alertType = 'alert-warning';
                break;
        }
    }
    
    if(timeout){
        J("#js-message").append("<div class='alert alert-dismissable " + alertType + "'><button type='button' class='close' data-dismiss='alert'><span aria-hidden='true'>&times;</span><span class='sr-only'>Close</span></button>" + message + "</div>").children("div").delay(parseInt(timeout, 10) * 1000).slideUp().delay(300).queue(function(){
            J(this).remove();
        });
    } else {
        J("#js-message").append("<div class='alert alert-dismissable " + alertType + "'><button type='button' class='close' data-dismiss='alert'><span aria-hidden='true'>&times;</span><span class='sr-only'>Close</span></button>" + message + "</div>");
    }
};

/**
 * Display an error message on ajax failure
 * @param  {jQuery XHR Promise} jqxhr jqxhr returned from jquery.ajax
 * @return {undefined}
 */
ui.ajaxErrorMessage = function(jqxhr){
    log.debug("ui.ajaxErrorMessage", 3);
    if(typeof jqxhr == 'undefined'){
        log.debug('ajaxErrorMessage called with undefined argument');
        return '';
    }
    log.debug(jqxhr, 3);
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
            ui.jsNotificationMessage("A requested resource could not be found.", 'error');
            break;
        case 400:
            ui.jsNotificationMessage("Bad Request", 'error');
            break;
        case 405:
            ui.jsNotificationMessage("Method not allowed", 'error');
            break;
        case 412:
            ui.jsNotificationMessage("Precondition failed", 'error');
            break;
        case 500:
            ui.jsNotificationMessage("Something went wrong but we're not sure what.", 'error');
            break;
        case 501:
            ui.jsNotificationMessage("We can't do that yet.", 'error');
            break;
        case 503:
            ui.jsNotificationMessage("We've gone away for a little while. Please try again in a few minutes.", 'error');
            break;
        default:
            log.debug("jqxhr status did not match any expected case");
            log.debug(jqxhr.status);
            //ui.jsNotificationMessage("An error occurred performing the requested action.", 'error');
    }
    return '';
};


/**
 * Empty conatiner and show preloader spinner
 * @param  {Dom Element} el   container
 * @param  {string} type type of preloader to show
 * @return {undefined}
 */
ui.showSpinner = function(el, type){
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
ui.appendSpinner = function(el){
    var spinnerUrl = Zotero.config.baseWebsiteUrl + 'static/images/theme/broken-circle-spinner.gif';
    J(el).append("<img class='spinner' src='" + spinnerUrl + "'/>");
};

//Take a table that is present in the DOM, save the widths of the headers and the offset of the body,
//set the widths of the columns explicitly, set the header to position:fixed, set the offset of the body explictly
//this has the effect of fixed table headers with scrollable data
ui.fixTableHeaders = function(tableEl) {
    var tel = J(tableEl);
    var colWidths = [];
    tel.find("thead th").each(function(ind, th){
        var width = J(th).width();
        colWidths.push(width);
        J(th).width(width);
    });

    tel.find("tbody>tr:first>td").each(function(ind, td){
        J(td).width(colWidths[ind]);
    });

    var bodyOffset = tel.find("thead").height();

    tel.find("thead").css('position', 'fixed').css('margin-top', -bodyOffset).css('background-color', 'white').css('z-index', 10);
    tel.find("tbody").css('margin-top', bodyOffset);
    tel.css("margin-top", bodyOffset);

};

/**
 * Update a Zotero_Item object from the current values of an edit item form
 * @param  {Zotero_Item} item   Zotero item to update
 * @param  {Dom Form} formEl edit item form to take values from
 * @return {bool}
 */
/*
ui.updateItemFromForm = function(item, formEl){
    log.debug("ui.updateItemFromForm", 3);
    
    var base = J(formEl);
    base.closest('.eventfulwidget').data('ignoreformstorage', true);
    var library = ui.getAssociatedLibrary(base);
    
    var itemKey = '';
    if(item.get('key')) itemKey = item.get('key');
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
    J.each(item.apiObj.data, function(field, value){
        var selector, inputValue, noteElID;
        if(field == 'note'){
            selector = "textarea[data-itemkey='" + itemKey + "'].rte";
            log.debug(selector, 4);
            noteElID = base.find(selector).attr('id');
            log.debug(noteElID, 4);
            inputValue = ui.getRte(noteElID);
        }
        else{
            selector = "[data-itemkey='" + itemKey + "'][name='" + field + "']";
            inputValue = base.find(selector).val();
        }
        
        if(typeof inputValue !== 'undefined'){
            log.debug("updating item " + field + ": " + inputValue);
            item.set(field, inputValue);
        }
    });
    var creators = [];
    base.find("tr.creator").each(function(index, el){
        var creator = ui.creatorFromElement(el);
        if(creator !== null){
            creators.push(creator);
        }
    });
    
    var tags = [];
    base.find("input.taginput").each(function(index, el){
        var tagString = J(el).val();
        if(tagString !== ''){
            tags.push({tag: tagString});
        }
    });
    
    //grab all the notes from the form and add to item
    //in the case of new items we can add notes in the creation request
    //in the case of existing items we need to post notes to /children, but we still
    //have that interface here for consistency
    var notes = [];
    base.find("textarea.note-text").each(function(index, el){
        var noteid = J(el).attr('id');
        var noteContent = ui.getRte(noteid);
        
        var noteItem = new Zotero.Item();
        if(library){
            noteItem.associateWithLibrary(library);
        }
        noteItem.initEmptyNote();
        noteItem.set('note', noteContent);
        noteItem.setParent(item.get('key'));
        notes.push(noteItem);
    });
    
    item.notes = notes;
    if(creators.length){
        item.apiObj.data.creators = creators;
    }
    item.apiObj.data.tags = tags;
    item.synced = false;
    item.dirty = true;
    log.debug(item);
};
*/

/*
ui.creatorFromElement = function(el){
    var name, creator, firstName, lastName;
    var jel = J(el);
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
*/

ui.saveItem = function(item) {
    //var requestData = JSON.stringify(item.apiObj);
    log.debug("pre writeItem debug", 4);
    log.debug(item, 4);
    //show spinner before making ajax write call
    var library = item.owningLibrary;
    var writeResponse = item.writeItem()
    .then(function(writtenItems){
        log.debug("item write finished", 3);
        //check for errors, update nav
        if(item.writeFailure){
            log.error("Error writing item:" + item.writeFailure.message);
            ui.jsNotificationMessage('Error writing item', 'error');
            throw new Error("Error writing item:" + item.writeFailure.message);
        }
    });
    
    //update list of tags we have if new ones added
    log.debug('adding new tags to library tags', 3);
    var libTags = library.tags;
    var tags = item.apiObj.data.tags;
    J.each(tags, function(index, tagOb){
        var tagString = tagOb.tag;
        if(!libTags.tagObjects.hasOwnProperty(tagString)){
            var tag = new Zotero.Tag(tagOb);
            libTags.addTag(tag);
        }
    });
    libTags.updateSecondaryData();

    return writeResponse;
};

/**
 * Temporarily store the data in a form so it can be reloaded
 * @return {undefined}
 */
/*
ui.saveFormData = function(){
    log.debug("saveFormData", 3);
    J(".eventfulwidget").each(function(){
        var formInputs = J(this).find('input');
        J(this).data('tempformstorage', formInputs);
    });
};
*/
/**
 * Reload previously saved form data
 * @param  {Dom Element} el DOM Form to restore data to
 * @return {undefined}
 */
/*
ui.loadFormData = function(el){
    log.debug("loadFormData", 3);
    var formData = J(el).data('tempformstorage');
    if(J(el).data("ignoreformstorage")){
        log.debug("ignoring stored form data", 3);
        J(el).removeData('tempFormStorage');
        J(el).removeData('ignoreFormStorage');
        return;
    }
    log.debug('formData: ', 4);
    log.debug(formData, 4);
    if(formData){
        formData.each(function(index){
            var idstring = '#' + J(this).attr('id');
            log.debug('idstring:' + idstring, 4);
            if(J(idstring).length){
                log.debug('setting value of ' + idstring, 4);
                J(idstring).val(J(this).val());
            }
        });
    }
};
*/
/**
 * Get the class for an itemType to display an appropriate icon
 * @param  {Zotero_Item} item Zotero item to get the class for
 * @return {string}
 */
ui.itemTypeClass = function(item) {
    var itemTypeClass = item.apiObj.data.itemType;
    if (item.apiObj.data.itemType == 'attachment') {
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
 * Get the Zotero Library associated with an element (generally a .eventfulwidget element)
 * @param  {Dom Element} el Dom element
 * @return {Zotero_Library}
 */
ui.getAssociatedLibrary = function(el){
    log.debug("ui.getAssociatedLibrary", 3);
    var jel;
    if(typeof el == 'undefined'){
        jel = J(".zotero-library").first();
    }
    else {
        jel = J(el);
        if(jel.length === 0 || jel.is("#eventful") ){
            jel = J(".zotero-library").first();
            if(jel.length === 0){
                log.debug("No element passed and no default found for getAssociatedLibrary.");
                throw new Error("No element passed and no default found for getAssociatedLibrary.");
            }
        }
    }
    //get Zotero.Library object if already bound to element
    var library = jel.data('zoterolibrary');
    var libString;
    if(!library){
        //try getting it from a libraryString included on DOM element
        libString = J(el).data('library');
        if(libString){
            library = ui.libStringLibrary(libString);
        }
        jel.data('zoterolibrary', library);
    }
    //if we still don't have a library, look for the default library for the page
    if(!library){
        jel = J(".zotero-library").first();
        libString = jel.data('library');
        if(libString){
            library = ui.libStringLibrary(libString);
        }
    }
    if(!library){log.error("No associated library found");}
    return library;
};

ui.libStringLibrary = function(libString){
    var library;
    if(Zotero.libraries.hasOwnProperty(libString)){
        library = Zotero.libraries[libString];
    }
    else{
        var libConfig = Zotero.utils.parseLibString(libString);
        library = new Zotero.Library(libConfig.libraryType, libConfig.libraryID);
        Zotero.libraries[libString] = library;
    }
    return library;
};

ui.getEventLibrary = function(e){
    var tel = J(e.triggeringElement);
    if(e.library){
        return e.library;
    }
    if(e.data && e.data.library){
        return e.data.library;
    }
    log.debug(e);
    var libString = tel.data('library');
    if(!libString){
        throw "no library on event or libString on triggeringElement";
    }
    if(Zotero.libraries.hasOwnProperty(libString)){
        return Zotero.libraries[libString];
    }
    
    var libConfig = ui.parseLibString(libString);
    var library = new Zotero.Library(libConfig.libraryType, libConfig.libraryID, '');
    Zotero.libraries[Zotero.utils.libraryString(libConfig.libraryType, libConfig.libraryID)] = library;
};
/*
ui.parseLibString = function(s){
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
ui.getPrioritizedVariable = function(key, defaultVal){
    var val = Zotero.state.getUrlVar(key) || Zotero.preferences.getPref(key) || Zotero.config.defaultApiArgs[key] || defaultVal;
    return val;
};

/**
 * Scroll to the top of the window
 * @return {undefined}
 */
ui.scrollToTop = function(){
    window.scrollBy(0, -5000);
};

//get the nearest ancestor that is eventfulwidget
ui.parentWidgetEl = function(el){
    var matching;
    if(el.hasOwnProperty('data') && el.data.hasOwnProperty('widgetEl')){
        log.debug("event had widgetEl associated with it");
        return J(el.data.widgetEl);
    } else if(el.hasOwnProperty('currentTarget')){
        log.debug("event currentTarget set");
        matching = J(el.currentTarget).closest(".eventfulwidget");
        if(matching.length > 0){
            return matching.first();
        } else {
            log.debug("no matching closest to currentTarget");
            log.debug(el.currentTarget);
            log.debug(el.currentTarget);
        }
    }
    
    matching = J(el).closest(".eventfulwidget");
    if(matching.length > 0){
        log.debug("returning first closest widget");
        return matching.first();
    }
    return null;
};


var init = {};

//initialize ui
init.all = function(){
    //run UI initialization based on what page we're on
    log.debug("ui init based on page", 3);
    switch(Zotero.config.pageClass){
        case "my_library":
        case "user_library":
        case "group_library":
            init.library();
            break;
        case "default":
    }
    //init.libraryTemplates();
    Zotero.eventful.initWidgets();
    init.rte();
};

init.library = function(){
    /*
    log.debug("init.library", 3);
    
    //initialize RTE for textareas if marked
    var hasRTENoLinks = J('textarea.rte').filter('.nolinks').length;
    var hasRTEReadOnly = J('textarea.rte').filter('.readonly').length;
    var hasRTEDefault = J('textarea.rte').not('.nolinks').not('.readonly').length;
    if(hasRTENoLinks){
        init.rte('nolinks', false, J('body'));
    }
    if(hasRTEReadOnly){
        init.rte('readonly', false, J('body'));
    }
    if(hasRTEDefault){
        init.rte('default', false, J('body'));
    }
    */
};

init.rte = function(type, autofocus, container){
    log.debug("init.rte", 3);
    if(Zotero.config.rte == 'ckeditor'){
        init.ckeditor(type, autofocus, container);
        return;
    }
    else {
        init.tinyMce(type, autofocus, container);
    }
};

init.ckeditor = function(type, autofocus, container){
    log.debug('init.ckeditor', 3);
    if(!type) { type = 'default'; }
    if(!container) { container = J('body');}
    
    var ckconfig = {};
    ckconfig.toolbarGroups = [
        { name: 'clipboard',   groups: [ 'clipboard', 'undo' ] },
        //{ name: 'editing',     groups: [ 'find', 'selection' ] },
        { name: 'links' },
        { name: 'insert' },
        { name: 'forms' },
        { name: 'tools' },
        { name: 'document',    groups: [ 'mode', 'document', 'doctools' ] },
        { name: 'others' },
        '/',
        { name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ] },
        { name: 'paragraph',   groups: [ 'list', 'indent', 'blocks', 'align' ] },
        { name: 'styles' },
        { name: 'colors' },
        { name: 'about' }
    ];
    
    var nolinksckconfig = {};
    nolinksckconfig.toolbarGroups = [
        { name: 'clipboard',   groups: [ 'clipboard', 'undo' ] },
        { name: 'editing',     groups: [ 'find', 'selection' ] },
        { name: 'insert' },
        { name: 'forms' },
        { name: 'tools' },
        { name: 'document',    groups: [ 'mode', 'document', 'doctools' ] },
        { name: 'others' },
        '/',
        { name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ] },
        { name: 'paragraph',   groups: [ 'list', 'indent', 'blocks', 'align' ] },
        { name: 'styles' },
        { name: 'colors' },
        { name: 'about' }
    ];
    var readonlyckconfig = {};
    readonlyckconfig.toolbarGroups = [];
    readonlyckconfig.readOnly = true;
    
    var config;
    if(type == 'nolinks'){
        config = J.extend(true, {}, nolinksckconfig);
    }
    else if(type == 'readonly'){
        config = J.extend(true, {}, readonlyckconfig);
    }
    else {
        config = J.extend(true, {}, ckconfig);
    }
    if(autofocus){
        config.startupFocus = true;
    }
    
    log.debug("initializing CK editors", 3);
    if(J(container).is('.rte')){
        log.debug("RTE textarea - " + " - " + J(container).attr('name'), 3);
        var edName = J(container).attr('name');
        if(!CKEDITOR.instances[edName]){
            var editor = CKEDITOR.replace(J(container), config );
        }
    }
    else{
        log.debug("not a direct rte init");
        log.debug(container);
        J(container).find("textarea.rte").each(function(ind, el){
            log.debug("RTE textarea - " + ind + " - " + J(el).attr('name'), 3);
            var edName = J(el).attr('name');
            if(!CKEDITOR.instances[edName]){
                var editor = CKEDITOR.replace(el, config );
            }
        });
    }
};

init.tinyMce = function(type, autofocus, elements){
    log.debug('init.tinyMce', 3);
    if(!type){
        type = 'default';
    }
    var mode = 'specific_textareas';
    if(elements){
        mode = 'exact';
    }
    else{
        elements = '';
    }
    
    var tmceConfig = {
        //script_url : '/static/library/tinymce_jquery/jscripts/tiny_mce/tiny_mce.js',
        mode : mode,
        elements:elements,
        theme: "advanced",
        //plugins : "pagebreak,style,layer,table,save,advhr,advimage,advlink,emotions,iespell,inlinepopups,insertdatetime,preview,media,searchreplace,print,contextmenu,paste,directionality,fullscreen,visualchars,nonbreaking,xhtmlxtras,template",
        //plugins : "pagebreak,style,layer,table,advhr,advimage,advlink,preview,searchreplace,paste",
        
        theme_advanced_toolbar_location : "top",
        theme_advanced_buttons1 : "bold,italic,underline,strikethrough,separator,sub,sup,separator,forecolorpicker,backcolorpicker,separator,blockquote,separator,link,unlink",
        theme_advanced_buttons2 : "formatselect,separator,justifyleft,justifycenter,justifyright,separator,bullist,numlist,outdent,indent,separator,removeformat,code,",
        theme_advanced_buttons3 : "",
        theme_advanced_toolbar_align : "left",
        theme_advanced_statusbar_location: 'bottom',
        theme_advanced_resizing: true,
        relative_urls: false,
        //width: '500',
        //height: '300',
        editor_selector: 'default'
    };
    
    if(autofocus){
        tmceConfig.init_instance_callback = function(inst){
            log.debug("inited " + inst.editorId);
            inst.focus();
        };
    }
    
    if(type != 'nolinks'){
        tmceConfig.theme_advanced_buttons1 += ',link';
    }
    
    if(type == 'nolinks'){
        tmceConfig.editor_selector = 'nolinks';
    }
    
    if(type == 'readonly'){
        tmceConfig.readonly = 1;
        tmceConfig.editor_selector = 'readonly';
    }
    
    tinymce.init(tmceConfig);
    return tmceConfig;
};

init.libraryTemplates = function(){
    /*
    J.views.helpers({
        Zotero: Zotero,
        J: J,
        Modernizr: Modernizr,
        zoteroFieldMap: Zotero.localizations.fieldMap,
        formatItemField: Zotero.ui.formatItemField,
        formatItemDateField: Zotero.format.itemDateField,
        trimString: Zotero.ui.trimString,
        multiplyChar: function(char, num) {
            return Array(num).join(char);
        },
        displayInDetails: function(field, item) {
            if( ( (J.inArray(field, item.hideFields) == -1) && (item.fieldMap.hasOwnProperty(field))) &&
                (J.inArray(field, ['itemType', 'title', 'creators', 'notes']) == -1)) {
                return true;
            }
            return false;
        },
        nonEditable: function(field, item) {
            if( J.inArray(field, item.noEditFields) !== -1) {
                return true;
            }
        },
    });
    J.views.tags({
        'coloredTags': {
            'template': "{{for ~tag.tagCtx.args[0].matchColoredTags(~tag.tagCtx.args[1]) tmpl='#coloredtagTemplate' /}}"
        }
    });
    */
    /*
    J('#tagrowTemplate').template('tagrowTemplate');
    J('#tagslistTemplate').template('tagslistTemplate');
    J('#collectionlistTemplate').template('collectionlistTemplate');
    J('#collectionrowTemplate').template('collectionrowTemplate');
    J('#itemrowTemplate').template('itemrowTemplate');
    J('#itemstableTemplate').template('itemstableTemplate');
    J('#itemdetailsTemplate').template('itemdetailsTemplate');
    J('#itemnotedetailsTemplate').template('itemnotedetailsTemplate');
    J('#itemformTemplate').template('itemformTemplate');
    J('#citeitemformTemplate').template('citeitemformTemplate');
    J('#attachmentformTemplate').template('attachmentformTemplate');
    J('#attachmentuploadTemplate').template('attachmentuploadTemplate');
    J('#editnoteformTemplate').template('editnoteformTemplate');
    J('#itemtagTemplate').template('itemtagTemplate');
    J('#itemtypeselectTemplate').template('itemtypeselectTemplate');
    J('#authorelementssingleTemplate').template('authorelementssingleTemplate');
    J('#authorelementsdoubleTemplate').template('authorelementsdoubleTemplate');
    J('#childitemsTemplate').template('childitemsTemplate');
    J('#editcollectionbuttonsTemplate').template('editcollectionbuttonsTemplate');
    J('#choosecollectionformTemplate').template('choosecollectionformTemplate');
    J('#breadcrumbsTemplate').template('breadcrumbsTemplate');
    J('#breadcrumbstitleTemplate').template('breadcrumbstitleTemplate');
    J('#newcollectionformTemplate').template('newcollectionformTemplate');
    J('#updatecollectionformTemplate').template('updatecollectionformTemplate');
    J('#deletecollectionformTemplate').template('deletecollectionformTemplate');
    J('#tagunorderedlistTemplate').template('tagunorderedlistTemplate');
    J('#librarysettingsTemplate').template('librarysettingsTemplate');
    J('#addtocollectionformTemplate').template('addtocollectionformTemplate');
    J('#exportformatsTemplate').template('exportformatsTemplate');
    */
};

ui.init = init;
ui.widgets = {};

module.exports = ui;
