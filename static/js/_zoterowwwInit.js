var J = jQuery.noConflict();

jQuery(document).ready(function() {
    /* Elements that need to be loaded asynchronously have class .ajaxload
     * within .ajaxload elements: config vars from original pageload are held in data-* attributes of the element
     * current desired content of element will always be defined by data-* attributes overridded / supplemented by
     * url variables (hash or querystring
     * currently displayed content is defined by jQuery config object data attached to the element with key 'currentConfig'
     * each ajaxload callback is responsible for determining what changes need to be made and making them
     */
    
    Z.debug('*&^*&^*&^*&^*&^*&^*&^*&^*&^ DOM READY *&^*&^*&^*&^*&^*&^*&^*&^*&^', 3);
    Zotero.init();
});

Zotero.defaultPrefs = {
    debug_level: 3, //lower level is higher priority
    debug_log: true,
    debug_mock: false,
    javascript_enabled: false,
    library_listShowFields: ['title', 'creator', 'dateModified']
};

Zotero.prefs = {};

Zotero.init = function(){
    Z.debug("Zotero init", 3);

    //base init to setup tagline and search bar
    if(Zotero.pages){
        Zotero.pages.base.init();
    }
    
    //run page specific init
    if(undefined !== window.zoterojsClass){
        try{
            Zotero.pages[zoterojsClass].init();
        }
        catch(err){
            Z.debug("Error running page specific init for " + zoterojsClass, 1);
        }
    }
    
    Zotero.loadConfig(zoteroData);
    
    if(typeof zoteroData == 'undefined'){
        zoteroData = {};
    }
    
    if(window.nonZendPage === true){
        return;
    }
    
    Zotero.nav.parseUrlVars();
    
    
    Zotero.config.startPageTitle = document.title;
    var store;
    if(typeof sessionStorage == 'undefined'){
        store = {};//Zotero.storage.localStorage = {};
    }
    else{
        store = sessionStorage;
    }
    Zotero.cache = new Zotero.Cache(store);
    Zotero.store = store;
    Zotero.prefs = J.extend({}, Zotero.defaultPrefs, Zotero.prefs, Zotero.utils.getStoredPrefs());
    /*
    Zotero.prefs = new Zotero.Prefs(store);
    J.each(Zotero.defaultPrefs, function(key, val){
        if(Zotero.prefs.getPref(key) === null){
            Zotero.prefs.setPref(key, val);
        }
    });
    */
    
    //get localized item constants if not stored in localstorage
    var locale = "en-US";
    if(zoteroData.locale){
        locale = zoteroData.locale;
    }
    
    //decide if we're on a library page and run library specific setup
    var libraryPage = J("body").hasClass('library');
    if(libraryPage){
        Zotero.config.librarySettings.libraryUserSlug = zoteroData.libraryUserSlug;
        Zotero.config.librarySettings.libraryUserID = zoteroData.libraryUserID;
        Zotero.config.librarySettings.allowEdit = zoteroData.allowEdit;
        
        if(zoteroData.library_listShowFields){
            Zotero.prefs.library_listShowFields = zoteroData.library_listShowFields.split(',');
        }
        if(zoteroData.library_showAllTags){
            Zotero.prefs.library_showAllTags = zoteroData.library_showAllTags;
        }
        if(zoteroData.library_defaultSort || Zotero.prefs.library_defaultSort){
            var defaultSort;
            if(zoteroData.library_defaultSort){
                defaultSort = zoteroData.library_defaultSort.split(',');
            }
            else {
                defaultSort = Zotero.prefs.library_defaultSort.split(',');
            }
            if(defaultSort[0]){
                Zotero.config.userDefaultApiArgs['order'] = defaultSort[0];
            }
            if(defaultSort[1]){
                Zotero.config.userDefaultApiArgs['sort'] = defaultSort[1];
            }
            Zotero.config.defaultSortColumn = Zotero.config.userDefaultApiArgs['sort'];
            if(Zotero.config.defaultSortColumn == 'undefined') Zotero.config.defaultSortColumn = 'title';
        }
        
        //load general data if on library page
        if(Zotero.config.pageClass == 'user_library' || Zotero.config.pageClass == 'group_library' || Zotero.config.pageClass == 'my_library'){
            Zotero.Item.prototype.getItemTypes(locale);
            Zotero.Item.prototype.getItemFields(locale);
            Zotero.Item.prototype.getCreatorFields(locale);
            Zotero.Item.prototype.getCreatorTypes();
        }
    }
    
    Zotero.ui.init.all();
    
    J.ajaxSettings.traditional = true;
    
    if(Zotero.nav.getUrlVar('proxy') == 'false'){
        Zotero.config.proxy = false;
    }
    
    if(Zotero.prefs.server_javascript_enabled === false){
        //Zotero.utils.setUserPref('javascript_enabled', '1');
        Zotero.prefs.javascript_enabled = true;
        document.cookie = "zoterojsenabled=1; expires=; path=/";
    }
    
    //J(window).bind('statechange', Zotero.nav.urlChangeCallback);
    // Bind to StateChange Event
    History.Adapter.bind(window,'statechange', Zotero.nav.stateChangeCallback); // Note: We are using statechange instead of popstate
    
    //call urlChangeCallback on first load since some browsers don't popstate onload
    Zotero.nav.urlChangeCallback();
    
};

//set up Zotero config and prefs based on passed in object
Zotero.loadConfig = function(config){
    //set up user config defaults
    Zotero.config.userDefaultApiArgs = J.extend({}, Zotero.config.defaultApiArgs);
    Zotero.config.userDefaultApiArgs['limit'] = 25;
    
    if(config.mobile){
        Zotero.config.mobile = true;
        //let selectMobilePage know this is an initial pageload
        Zotero.state.mobilePageFirstLoad = true;
    }
    
    if(typeof zoterojsClass !== 'undefined'){
        Zotero.config.pageClass = zoterojsClass;
    }
    else{
        Zotero.config.pageClass = 'default';
    }
    
    if(config.itemsPathString){
        Zotero.config.librarySettings.itemsPathString = config.itemsPathString;
        Zotero.config.nonparsedBaseUrl = config.itemsPathString;
    }
    else if(config.nonparsedBaseUrl){
        Zotero.config.nonparsedBaseUrl = config.nonparsedBaseUrl;
    }
    else{
        Zotero.config.librarySettings.itemsPathString = Zotero.config.baseWebsiteUrl ;
        Zotero.config.nonparsedBaseUrl = Zotero.config.baseWebsiteUrl;
    }
    if(config.locale){
        Zotero.config.locale = config.locale;
    }
    
    if(typeof Globalize !== 'undefined'){
        Globalize.culture(Zotero.config.locale);
    }
    
    if(config.apiKey){
        Zotero.config.apiKey = config.apiKey;
    }
    
    if(config.loggedInUserID){
        Zotero.config.loggedInUserID = config.loggedInUserID;
        Zotero.config.loggedIn = true;
    }
    else{
        Zotero.config.loggedIn = false;
    }
    
};


