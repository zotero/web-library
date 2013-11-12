Zotero.ui.init = {};
Zotero.ui.widgets = {};
Zotero.ui.jqui = {};

//initialize ui
Zotero.ui.init.all = function(){
    J("#content").on('click', 'a.ajax-link', function(){
        Z.debug("ajax-link clicked with href " + J(this).attr('href'), 3);
        Z.debug("pathname " + this.pathname, 4);
        var pathvars = Zotero.nav.parsePathVars(this.pathname);
        Zotero.nav.urlvars.pathVars = pathvars;
        Zotero.nav.pushState();
        return false;
    });
    
    if(Zotero.config.mobile){
        Zotero.ui.init.mobile();
    }
    
    //run UI initialization based on what page we're on
    Z.debug("ui init based on page", 3);
    switch(Zotero.config.pageClass){
        case "my_library":
        case "user_library":
        case "group_library":
            Zotero.ui.init.library();
            Zotero.ui.bindItemLinks();
            Zotero.ui.bindCollectionLinks();
            Zotero.ui.bindTagLinks();
            break;
        case "default":
    }
};

Zotero.ui.init.library = function(){
    Z.debug("Zotero.ui.init.library", 3);
    Zotero.ui.init.fullLibrary();
    
    //initialize RTE for textareas if marked
    var hasRTENoLinks = J('textarea.rte').filter('.nolinks').length;
    var hasRTEReadOnly = J('textarea.rte').filter('.readonly').length;
    var hasRTEDefault = J('textarea.rte').not('.nolinks').not('.readonly').length;
    if(hasRTENoLinks){
        Zotero.ui.init.rte('nolinks');
    }
    if(hasRTEReadOnly){
        Zotero.ui.init.rte('readonly');
    }
    if(hasRTEDefault){
        Zotero.ui.init.rte('default');
    }
    
};

//initialize all the widgets that make up the library
Zotero.ui.init.fullLibrary = function(){
    Z.debug('Zotero.ui.initFullLibrary', 3);
    
    if(J("#library").hasClass('ajaxload')){
        //full synced library - handle differently
        Zotero.ui.init.offlineLibrary();
        return;
    }
    Zotero.ui.init.libraryTemplates();
    
    Zotero.eventful.initWidgets();
};

//initialize pagination buttons
Zotero.ui.init.paginationButtons = function(pagination){
    if(Zotero.config.jqueryui === false){
        return;
    }
    /*
    J("#item-pagination-div .back-item-pagination").buttonset();
    J("#item-pagination-div .forward-item-pagination").buttonset();
    J("#start-item-link").button({
        text:false,
        icons: {
            primary: "ui-icon-seek-first"
        }
    });
    J("#prev-item-link").button({
        text:false,
        icons: {
            primary: "ui-icon-triangle-1-w"
        }
    });
    J("#next-item-link").button({
        text:false,
        icons: {
            primary: "ui-icon-triangle-1-e"
        }
    });
    J("#last-item-link").button({
        text:false,
        icons: {
            primary: "ui-icon-seek-end"
        }
    });
    if(pagination.showFirstLink === false) {
        J("#start-item-link").button('option', 'disabled', true);
    }
    if(pagination.showPrevLink === false) {
        J("#prev-item-link").button('option', 'disabled', true);
    }
    if(pagination.showNextLink === false) {
        J("#next-item-link").button('option', 'disabled', true);
    }
    if(pagination.showLastLink === false) {
        J("#last-item-link").button('option', 'disabled', true);
    }
    */
};

Zotero.ui.init.creatorFieldButtons = function(){
    /*
    if(Zotero.config.mobile){
        Zotero.ui.createOnActivePage(J("tr.creator"));
        return;
    }
    if(Zotero.config.jqueryui === false){
        return;
    }
    
    
    J(".add-remove-creator-buttons-container").buttonset();
    J("a.switch-single-field-creator-link").button({
        text:false,
        icons: {
            primary: "sprite-textfield-single"
        }
    });
    J("a.switch-two-field-creator-link").button({
        text:false,
        icons: {
            primary: "sprite-textfield-dual"
        }
    });
    J("a.remove-creator-link").button({
        text:false,
        icons: {
            primary: "sprite-minus"
        }
    });
    J("a.add-creator-link").button({
        text:false,
        icons: {
            primary: "sprite-plus"
        }
    });
*/
};

Zotero.ui.init.editButton = function(){
    /*
    Z.debug("Zotero.ui.init.editButton", 3);
    var editEl = J("#edit-checkbox");
    if(Zotero.config.jqueryui === false){
        if(Zotero.nav.getUrlVar('mode') == 'edit'){
            editEl.addClass('active');
        }
        else{
            editEl.removeClass('active');
        }

        if(!Zotero.nav.getUrlVar('itemKey')){
            editEl.addClass("disabled");
        }
        else{
            editEl.removeClass("disabled");
        }
        return;
    }
    
    if(Zotero.nav.getUrlVar('mode') == 'edit'){
        editEl.prop('checked', true);
    }
    else{
        editEl.prop('checked', false);
    }
    editEl.button('refresh');
    if(!Zotero.nav.getUrlVar('itemKey')){
        editEl.button('option', 'disabled', true);
    }
    else{
        editEl.button('option', 'disabled', false);
    }
    */
};

Zotero.ui.init.rte = function(type, autofocus, elements){
    if(Zotero.config.rte == 'ckeditor'){
        Zotero.ui.init.ckeditor(type, autofocus, elements);
        return;
    }
    else {
        Zotero.ui.init.tinyMce(type, autofocus, elements);
    }
};

Zotero.ui.init.ckeditor = function(type, autofocus, elements){
    if(!type) { type = 'default'; }
    
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
    
    J("textarea.rte").each(function(ind, el){
        var edName = J(el).attr('name');
        if(!CKEDITOR.instances[edName]){
            var editor = CKEDITOR.replace(el, config );
        }
    });
};

Zotero.ui.init.tinyMce = function(type, autofocus, elements){
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
            Z.debug("inited " + inst.editorId);
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

Zotero.ui.init.libraryTemplates = function(){
    J.views.helpers({
        Zotero: Zotero,
        J: J,
        Modernizr: Modernizr,
        displayFields: Zotero.prefs.library_listShowFields,
        zoteroFieldMap: Zotero.localizations.fieldMap,
        formatItemField: Zotero.ui.formatItemField,
        formatItemDateField: Zotero.ui.formatItemDateField,
        trimString: Zotero.ui.trimString,
        displayInDetails: function(field, item) {
            if( ( (J.inArray(field, item.hideFields) == -1) && (item.fieldMap.hasOwnProperty(field))) &&
                (J.inArray(field, ['itemType', 'title', 'creators', 'notes']) == -1)) {
                return true;
            }
            return false;
        },
        getFields: function(object) {
            var key, value,
                fieldsArray = [];
            for (key in object) {
                if (object.hasOwnProperty(key)) {
                    value = object[key];
                    // For each property/field add an object to the array, with key and value
                    fieldsArray.push({
                        key: key,
                        value: value
                    });
                }
            }
            // Return the array, to be rendered using {{for ~getFields(object)}}
            return fieldsArray;
        },
    });
    /*
    J('#tagrowTemplate').template('tagrowTemplate');
    J('#tagslistTemplate').template('tagslistTemplate');
    J('#collectionlistTemplate').template('collectionlistTemplate');
    J('#collectionrowTemplate').template('collectionrowTemplate');
    J('#itemrowTemplate').template('itemrowTemplate');
    J('#itemstableTemplate').template('itemstableTemplate');
    J('#itempaginationTemplate').template('itempaginationTemplate');
    J('#itemdetailsTemplate').template('itemdetailsTemplate');
    J('#itemnotedetailsTemplate').template('itemnotedetailsTemplate');
    J('#itemformTemplate').template('itemformTemplate');
    J('#citeitemformTemplate').template('citeitemformTemplate');
    J('#attachmentformTemplate').template('attachmentformTemplate');
    J('#attachmentuploadTemplate').template('attachmentuploadTemplate');
    J('#datafieldTemplate').template('datafieldTemplate');
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

