if(!Zotero.ui.init){
    Zotero.ui.init = {};
}

if(!Zotero.ui.widgets){
    Zotero.ui.widgets = {};
}

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
    Zotero.ui.init.libraryControls();
    Zotero.ui.init.tags();
    //Zotero.ui.init.collections();
    Zotero.ui.init.items();
    //Zotero.ui.init.feed();
    Zotero.ui.init.libraryTemplates();
    
    Zotero.eventful.initWidgets();
};

//initialize the library control buttons
Zotero.ui.init.libraryControls = function(){
    Z.debug("Zotero.ui.initControls", 3);
    //set up control panel buttons
    
    
    //check/uncheck all boxes in items table when master checkbox is toggled
    J('#library-items-div').on('change', ".itemlist-editmode-checkbox.all-checkbox", function(e){
        J(".itemlist-editmode-checkbox").prop('checked', J(".itemlist-editmode-checkbox.all-checkbox").prop('checked'));
        Zotero.ui.eventful.trigger("selectedItemsChanged");
    });
    
    //init itemkey-checkbox to enable/disable buttons that require something being selected
    J('#library-items-div').on('change', "input.itemKey-checkbox", function(e){
        Zotero.ui.eventful.trigger("selectedItemsChanged");
    });
    
    
    //set initial state of search input to url value
    if(Zotero.nav.getUrlVar('q')){
        J("#header-search-query").val(Zotero.nav.getUrlVar('q'));
    }
    //clear libary query param when field cleared
    var context = 'support';
    if(undefined !== window.zoterojsSearchContext){
        context = zoterojsSearchContext;
    }
    
    J("#header-search-query").val("");
    //J("#header-search-query").attr('placeholder', "Search Library");
    
    //set up search submit for library
    J("#library-search").on('submit', function(e){
        e.preventDefault();
        Zotero.nav.clearUrlVars(['collectionKey', 'tag', 'q']);
        var query     = J("#header-search-query").val();
        if(query !== "" || Zotero.nav.getUrlVar('q') ){
            Zotero.nav.urlvars.pathVars['q'] = query;
            Zotero.nav.pushState();
        }
        return false;
    });
    
    //set up library search clear button
    if((context == 'library') || (context == 'grouplibrary')){
        var clearQuery = function(e){
            J("#header-search-query").val('');
            if(Zotero.nav.getUrlVar('q')){
                Zotero.nav.setUrlVar('q', '');
                Zotero.nav.pushState();
            }
        };
        J("#library-search button.clear-field-button").on('click', clearQuery);
    }
};

//initialize pagination buttons
Zotero.ui.init.paginationButtons = function(pagination){
};

//initialize tags widget and related library features
Zotero.ui.init.tags = function(){
    Z.debug("Zotero.ui.initTags", 3);
};

//initialize items widget and related features
Zotero.ui.init.items = function(){
    Z.debug("Zotero.ui.initItems", 3);
    J("#item-details-div").on('click', ".saveitembutton", Zotero.ui.saveItemCallback);
    J("#item-details-div").on('submit', ".itemDetailForm", Zotero.ui.saveItemCallback);
    J("#item-details-div").on('click', ".cancelitemeditbutton", Zotero.ui.callbacks.cancelItemEdit);
    J("#item-details-div").on('click', ".itemTypeSelectButton", Zotero.ui.callbacks.selectItemType);
    
    /*
    J("#item-details-div").on('change', ".itemDetailForm #itemTypeSelect", function(){
        Z.debug("itemTypeSelect changed", 3);
        var itemType = J(this).val();
        Zotero.nav.urlvars.pathVars['itemType'] = itemType;
        Zotero.nav.pushState();
    });
    */
    
    J("#item-details-div").on('keydown', ".itemDetailForm input", Zotero.ui.callbacks.itemFormKeydown);
    
    J("#item-details-div").on('click', ".add-tag-link", Zotero.ui.addTag);
    J("#item-details-div").on('click', ".remove-tag-link", Zotero.ui.removeTag);
    J("#item-details-div").on('click', ".add-creator-link", Zotero.ui.addCreator);
    J("#item-details-div").on('click', ".remove-creator-link", Zotero.ui.removeCreator);
    
    J("#item-details-div").on('click', ".switch-two-field-creator-link", Zotero.ui.callbacks.switchTwoFieldCreators);
    J("#item-details-div").on('click', ".switch-single-field-creator-link", Zotero.ui.callbacks.switchSingleFieldCreator);
    J("#item-details-div").on('click', ".add-note-button", Zotero.ui.callbacks.addNote);
    
    //set up sorting on header clicks
    J("#library-items-div").on('click', ".field-table-header", Zotero.ui.callbacks.resortItems);
    
    //bind cite item link
    //TODO: just declare triggers on these links
    /*
    J("#item-details-div").on('click', "#cite-item-link", Zotero.ui.callbacks.citeItems);
    J("#build-bibliography-link").on('click', Zotero.ui.callbacks.citeItems);
    J("#cite-link").on('click', Zotero.ui.callbacks.citeItems);
    */
    
    //bind export links
    //J("#export-formats-div").on('click', ".export-link", Zotero.ui.callbacks.exportItems);
    //J("#export-link").on('click', Zotero.ui.callbacks.showExportDialog);
    
    //J("#export-dialog").on('click', '.export-link', Zotero.ui.callbacks.exportItems);
    
    //bind attachment upload link
    J("#item-details-div").on('click', "#upload-attachment-link", Zotero.ui.callbacks.uploadAttachment);
    
    //subscribe to event for item getting its first child so we can re-run getChildren
    /*
    J.subscribe('hasFirstChild', function(itemKey){
        var jel = J('#item-details-div');
        Zotero.ui.showChildren(jel, itemKey);
    });
    */
};

Zotero.ui.removeTag = function(e){
    var el = e.currentTarget;
    Z.debug("Zotero.ui.removeTag", 3);
    J(el).closest('.edit-tag-div').remove();
    Zotero.ui.createOnActivePage(el);
};

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
    J.tmpl('authorelementsdoubleTemplate', {index:newindex,
                                            creator:{firstName:'', lastName:''},
                                            creatorTypes:Zotero.Item.prototype.creatorTypes[itemType]
                                            }).insertAfter(jel);
    
    Zotero.ui.init.creatorFieldButtons();
    
    Zotero.ui.createOnActivePage(jel);
};

Zotero.ui.removeCreator = function(e){
    var button = e.currentTarget;
    Z.debug("Zotero.ui.removeCreator", 3);
    J(button).closest('tr').remove();
    
    Zotero.ui.createOnActivePage(button);
};

Zotero.ui.init.editButton = function(){
    Z.debug("Zotero.ui.init.editButton", 3);
    var editEl = J("#edit-checkbox");
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
    
};


//bootstrap version of updateCollectionButtons
Zotero.ui.updateCollectionButtons = function(){
    //enable modify and delete only if collection is selected
    if(Zotero.nav.getUrlVar("collectionKey")){
        J(".update-collection-button").removeClass('disabled');
        J(".delete-collection-button").removeClass('disabled');
    }
    else{
        J(".update-collection-button").addClass('disabled');
        J(".delete-collection-button").addClass('disabled');
    }
};

/**
 * Toggle library edit mode when edit button clicked
 * @param  {event} e click event
 * @return {boolean}
 */
Zotero.ui.callbacks.toggleEdit =  function(e){
    Z.debug("edit checkbox toggled", 3);
    var curMode = Zotero.nav.getUrlVar('mode');
    if(curMode != "edit"){
        Zotero.nav.urlvars.pathVars['mode'] = 'edit';
    }
    else{
        delete Zotero.nav.urlvars.pathVars['mode'];
    }
    Zotero.nav.pushState();
    return false;
};
