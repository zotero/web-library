Zotero.ui.init = {};
Zotero.ui.widgets = {};

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
    
    if(Zotero.config.jqueryui){
        Zotero.ui.init.jqueryui();
    }
    
    //insert the hidden library preferences and set callbacks
    J("#library-settings-form").hide();
    //Z.config.librarySettingsInit = false;
    J("#control-panel-container").on('click', '#library-settings-link', Zotero.ui.callbacks.librarySettings);
    
    //set up addToCollection button to update list when collections are loaded
    J.subscribe("loadCollectionsDone", function(collections){
        Z.debug("loadCollectionsDone callback", 4);
    });
    
    //check/uncheck all boxes in items table when master checkbox is toggled
    J('#library-items-div').on('change', ".itemlist-editmode-checkbox.all-checkbox", function(e){
        J(".itemlist-editmode-checkbox").prop('checked', J(".itemlist-editmode-checkbox.all-checkbox").prop('checked'));
        Zotero.ui.updateDisabledControlButtons();
        Zotero.ui.eventful.trigger("selectedItemsChanged");
    });
    
    //init itemkey-checkbox to enable/disable buttons that require something being selected
    J('#library-items-div').on('change', "input.itemKey-checkbox", function(e){
        Zotero.ui.updateDisabledControlButtons();
        Zotero.ui.eventful.trigger("selectedItemsChanged");
    });
    
    //first run to initialize enabled/disabled state of contextually relevant control buttons
    Zotero.ui.updateDisabledControlButtons();
    
    //bind all control buttons to their callback functions
    if(!Zotero.config.eventful){
        J("#control-panel-container").on('change', "#edit-checkbox", Zotero.ui.callbacks.toggleEdit);
        J("#collection-list-div").on('click', ".create-collection-link", Zotero.ui.callbacks.createCollection);
        J("#collection-list-div").on('click', ".update-collection-link", Zotero.ui.callbacks.updateCollection);
        J("#collection-list-div").on('click', ".delete-collection-link", Zotero.ui.callbacks.deleteCollection);
        J("#control-panel-container").on('click', ".add-to-collection-link", Zotero.ui.callbacks.addToCollection);
        J("#control-panel-container").on('click', "#create-item-link", Zotero.ui.callbacks.createItem);
        J("#control-panel-container").on('click', ".remove-from-collection-link", Zotero.ui.callbacks.removeFromCollection);
        J("#control-panel-container").on('click', ".move-to-trash-link", Zotero.ui.callbacks.moveToTrash);
        J("#control-panel-container").on('click', ".remove-from-trash-link", Zotero.ui.callbacks.removeFromTrash);
        J("#item-details-div").on('click', ".move-to-trash-link", Zotero.ui.callbacks.moveToTrash);
    }
    
    //disable default actions for dialog form submissions
    J("delete-collection-dialog").on('submit', ".delete-collection-div form", function(e){
        e.preventDefault();
    });
    J("update-collection-dialog").on('submit', ".update-collection-div form", function(e){
        e.preventDefault();
    });
    J("create-collection-dialog").on('submit', ".new-collection-div form", function(e){
        e.preventDefault();
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
    J("#header-search-query").attr('placeholder', "Search Library");
    
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

Zotero.ui.init.jqueryui = function(){
    Z.debug("Zotero.ui.init.jqueryui", 3);
    //make edit toolbar buttons and menus
    J("#create-item-link").button({
        text:false,
        icons: {
            primary: "sprite-toolbar-item-add"
        }
    });
    J("#edit-collections-link").button({
        text:false,
        icons: {
            primary: "sprite-folder_edit",
            secondary: "ui-icon-triangle-1-s"
        }
    });
    
    J("#move-item-links-buttonset").buttonset();
    
    J(".add-to-collection-link").button({
        text:false,
        icons: {
            primary: "sprite-folder_add_to"
        }
    });
    J(".remove-from-collection-link").button({
        text:false,
        icons: {
            primary: "sprite-folder_remove_from"
        }
    });
    J(".move-to-trash-link").button({
        text:false,
        icons: {
            primary: "sprite-trash"
        }
    });
    J(".remove-from-trash-link").button({
        text:false,
        icons: {
            primary: "sprite-trash_remove"
        }
    });
    
    J("#edit-checkbox").button({
        text:false,
        icons: {
            primary: "sprite-page_edit"
        }
    });
    
    J("#cite-link").button({
        text:false,
        icons: {
            primary: "sprite-toolbar-cite"
        }
    });
    
    J("#export-link").button({
        text:false,
        icons: {
            primary: "sprite-toolbar-export"
        }
    });
    
    
    J("#library-settings-link").button({
        text:false,
        icons: {
            primary: "sprite-timeline_marker"
        }
    });

};
//initialize pagination buttons
Zotero.ui.init.paginationButtons = function(pagination){
    if(Zotero.config.jqueryui){
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
    }
};

Zotero.ui.init.collections = function(){
    Z.debug("Zotero.ui.initCollections", 3);
};

//initialize tags widget and related library features
Zotero.ui.init.tags = function(){
    Z.debug("Zotero.ui.initTags", 3);
    //send pref to website when showAllTags is toggled
    J("#tags-list-div").on('click', "#show-all-tags", function(e){
        var show = J(this).prop('checked') ? true : false;
        Z.debug("showAllTags is " + show, 4);
        Zotero.utils.setUserPref('library_showAllTags', show);
        Zotero.callbacks.loadTags(J("#tags-list-div"));
    });
    
    J("#tags-list-div").on('click', "#show-more-tags-link", function(e){
        e.preventDefault();
        var jel = J(this).closest('#tags-list-div');
        jel.data('showmore', true);
        Zotero.callbacks.loadTags(jel);
    });
    J("#tags-list-div").on('click', "#show-less-tags-link", function(e){
        e.preventDefault();
        var jel = J(this).closest('#tags-list-div');
        jel.data('showmore', false);
        Zotero.callbacks.loadTags(jel);
    });
    
    //add tag to item and stop event propogation when tag is selected
    //from autocomplete on an item
    J("#tags-list-div").on('keydown', ".taginput", function(e){
        if ( e.keyCode === J.ui.keyCode.ENTER ){
            e.preventDefault();
            if(J(this).val() !== ''){
                Zotero.ui.addTag();
                e.stopImmediatePropagation();
            }
        }
    });
    
    //bind tag autocomplete filter in tag widget
    J("#tags-list-div").on('keyup', "#tag-filter-input", function(e){
        Z.debug(J('#tag-filter-input').val(), 3);
        Z.debug("value:" + J('#tag-filter-input').val(), 4);
        var library = Zotero.ui.getAssociatedLibrary(J('#tag-filter-input').closest('.ajaxload'));
        var libraryTagsPlainList = library.tags.plainList;
        var matchingTagStrings = Zotero.utils.matchAnyAutocomplete(J('#tag-filter-input').val(), libraryTagsPlainList);
        Zotero.ui.displayTagsFiltered(J('#tags-list-div'), library.tags, matchingTagStrings, []);
        Z.debug(matchingTagStrings, 4);
    });
    
    //bind refresh link to pull down fresh set of tags until there is a better way to
    //check for updated/removed tags in API
    J("#tags-list-div").on('click', '#refresh-tags-link', function(e){
        e.preventDefault();
        var library = Zotero.ui.getAssociatedLibrary(J('#tag-filter-input').closest('.ajaxload'));
        Zotero.callbacks.loadTags(J("#tags-list-div"), false);
        return false;
    });
};

//initialize items widget and related features
Zotero.ui.init.items = function(){
    Z.debug("Zotero.ui.initItems", 3);
    J("#item-details-div").on('click', ".saveitembutton", Zotero.ui.saveItemCallback);
    J("#item-details-div").on('submit', ".itemDetailForm", Zotero.ui.saveItemCallback);
    J("#item-details-div").on('click', ".cancelitemeditbutton", function(){
        Zotero.nav.clearUrlVars(['itemKey', 'collectionKey', 'tag', 'q']);
        Zotero.nav.pushState();
    });
    
    J("#item-details-div").on('click', ".itemTypeSelectButton", function(){
        Z.debug("itemTypeSelectButton clicked", 3);
        var itemType = J("#itemType").val();
        Zotero.nav.urlvars.pathVars['itemType'] = itemType;
        Zotero.nav.pushState();
        return false;
    });
    J("#item-details-div").on('change', ".itemDetailForm #itemTypeSelect", function(){
        Z.debug("itemTypeSelect changed", 3);
        var itemType = J(this).val();
        Zotero.nav.urlvars.pathVars['itemType'] = itemType;
        Zotero.nav.pushState();
    });
    
    
    J("#item-details-div").on('keydown', ".itemDetailForm input", function(e){
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
    });
    J("#item-details-div").on('click', ".add-tag-button", function(){
        Z.debug('add tag button clicked', 4);
        Zotero.ui.addTag();
        return false;
    });
    J("#item-details-div").on('click', ".add-tag-link", function(){
        Z.debug('add tag link clicked', 4);
        Zotero.ui.addTag();
        return false;
    });
    J("#item-details-div").on('click', ".remove-tag-link", function(){
        Z.debug('remove tag link clicked', 4);
        Zotero.ui.removeTag(J(this));
        return false;
    });
    J("#item-details-div").on('click', ".add-creator-link", function(){
        Z.debug('add creator button clicked', 4);
        Zotero.ui.addCreator(this);
        return false;
    });
    J("#item-details-div").on('click', ".remove-creator-link", function(){
        Z.debug('add creator button clicked', 4);
        Zotero.ui.removeCreator(this);
        return false;
    });
    
    J("#item-details-div").on('click', ".switch-two-field-creator-link", function(){
        Z.debug("switch two field creator clicked");
        var last, first;
        var name = J(this).closest('tr.creator').find("input[id$='_name']").val();
        var split = name.split(' ');
        if(split.length > 1){
            last = split.splice(-1, 1)[0];
            first = split.join(' ');
        }
        else{
            last = name;
            first = '';
        }
        
        var itemType = J(this).closest('form').find('select.itemType').val();
        var index = parseInt(J(this).closest('tr.creator').attr('id').substr(8), 10);
        var creatorType = J(this).closest('tr.creator').find("select#creator_" + index + "_creatorType").val();
        var jel = J(this).closest('tr').replaceWith(J.tmpl('authorelementsdoubleTemplate',
                                            {index:index,
                                            creator:{firstName:first, lastName:last, creatorType:creatorType},
                                            creatorTypes:Zotero.Item.prototype.creatorTypes[itemType]
                                            }));
        
        Zotero.ui.init.creatorFieldButtons();
        //Zotero.ui.createOnActivePage(J(this));
    });
    J("#item-details-div").on('click', ".switch-single-field-creator-link", function(){
        Z.debug("switch single field clicked");
        var name;
        var firstName = J(this).closest('div.creator-input-div').find("input[id$='_firstName']").val();
        var lastName = J(this).closest('div.creator-input-div').find("input[id$='_lastName']").val();
        name = firstName + " " + lastName;
        
        var itemType = J(this).closest('form').find('select.itemType').val();
        var index = parseInt(J(this).closest('tr.creator').attr('id').substr(8), 10);
        var creatorType = J(this).closest('tr.creator').find("select#creator_" + index + "_creatorType").val();
        var jel = J(this).closest('tr').replaceWith(J.tmpl('authorelementssingleTemplate',
                                            {index:index,
                                            creator:{name:name},
                                            creatorTypes:Zotero.Item.prototype.creatorTypes[itemType]
                                            }));
        
        Zotero.ui.init.creatorFieldButtons();
        //Zotero.ui.createOnActivePage(J(this));
    });
    J("#item-details-div").on('click', ".add-note-button", function(){
        Z.debug("add note button clicked", 3);
        Zotero.ui.addNote(this);
        return false;
    });
    
    //set up sorting on header clicks
    J("#library-items-div").on('click', ".field-table-header", function(){
        Z.debug(".field-table-header clicked", 3);
        var currentOrderField = Zotero.nav.getUrlVar('order') || Zotero.config.userDefaultApiArgs.order;
        var currentOrderSort = Zotero.nav.getUrlVar('sort') || Zotero.config.userDefaultApiArgs.sort || Zotero.config.sortOrdering[currentOrderField] || 'asc';
        var newOrderField = J(this).data('columnfield');
        var newOrderSort = Zotero.config.sortOrdering[newOrderField];
        
        //only allow ordering by the fields we have
        if(J.inArray(newOrderField, Zotero.Library.prototype.sortableColumns) == (-1)){
            return false;
        }
        
        //change newSort away from the field default if that was already the current state
        if(currentOrderField == newOrderField && currentOrderSort == newOrderSort){
            if(newOrderSort == 'asc'){
                newOrderSort = 'desc';
            }
            else{
                newOrderSort = 'asc';
            }
        }
        
        //problem if there was no sort column mapped to the header that got clicked
        if(!newOrderField){
            Zotero.ui.jsNotificationMessage("no order field mapped to column");
            return false;
        }
        
        //update the url with the new values
        Zotero.nav.urlvars.pathVars['order'] = newOrderField;
        Zotero.nav.urlvars.pathVars['sort'] = newOrderSort;
        Zotero.nav.pushState();
        
        //set new order as preference and save it to use www prefs
        Zotero.config.userDefaultApiArgs.sort = newOrderSort;
        Zotero.config.userDefaultApiArgs.order = newOrderField;
        Zotero.utils.setUserPref('library_defaultSort', newOrderField + ',' + newOrderSort);
    });
    
    //bind cite item link
    J("#item-details-div").on('click', "#cite-item-link", Zotero.ui.callbacks.citeItems);
    J("#build-bibliography-link").on('click', Zotero.ui.callbacks.citeItems);
    J("#cite-link").on('click', Zotero.ui.callbacks.citeItems);
    
    //bind export links
    J("#export-formats-div").on('click', ".export-link", Zotero.ui.callbacks.exportItems);
    J("#export-link").on('click', Zotero.ui.callbacks.showExportDialog);
    
    J("#export-dialog").on('click', '.export-link', Zotero.ui.callbacks.exportItems);
    
    //bind attachment upload link
    J("#item-details-div").on('click', "#upload-attachment-link", Zotero.ui.callbacks.uploadAttachment);
    
    //subscribe to event for item getting its first child so we can re-run getChildren
    J.subscribe('hasFirstChild', function(itemKey){
        var jel = J('#item-details-div');
        Zotero.ui.showChildren(jel, itemKey);
    });
};

Zotero.ui.init.creatorFieldButtons = function(){
    if(Zotero.config.mobile){
        Zotero.ui.createOnActivePage(J("tr.creator"));
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
};

Zotero.ui.init.editButton = function(){
    Z.debug("Zotero.ui.init.editButton", 3);
    var editEl = J("#edit-checkbox");
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
};

Zotero.ui.init.detailButtons = function(){
    Z.debug("Zotero.ui.init.detaButtons", 3);
    J("#upload-attachment-link").button();
    J("#cite-item-link").button();
};

Zotero.ui.init.tagButtons = function(){
    J(".add-remove-tag-container").buttonset();
    J(".remove-tag-link").button({
        text:false,
        icons: {
            primary: "sprite-minus"
        }
    });
    J(".add-tag-link").button({
        text:false,
        icons: {
            primary: "sprite-plus"
        }
    });
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

