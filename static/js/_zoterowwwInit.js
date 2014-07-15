var J = jQuery.noConflict();

jQuery(document).ready(function() {
    /* The Zotero web library is built on top of libZotero as a group of
     * relatively independent widgets. They interact by listening to and
     * triggering events (with optional filters) on the Zotero object or
     * individual Zotero.Library objects. State is maintained by a
     * Zotero.State object that optionally stores variables in the url
     * using pushState as well. With pushState enabled back/forward
     * actions trigger events for the variables that have changed so
     * widgets listening know to update.
     */
    Z.debug('===== DOM READY =====', 3);
    Zotero.state = new Zotero.State();
    Zotero.init();
});

Zotero.defaultPrefs = {
    debug_level: 3, //lower level is higher priority
    debug_log: true,
    debug_mock: false,
    javascript_enabled: false,
};

Zotero.init = function(){
    Z.debug("Zotero init", 3);
    
    if(window.zoteroConfig){
        Zotero.config = J.extend({}, Zotero.config, window.zoteroConfig);
    }
    
    Zotero.state.rewriteAltUrl();
    
    //base init to setup tagline and search bar
    if(Zotero.pages){
        Zotero.pages.base.init();
    }
    
    //run page specific init
    if((window.zoterojsClass) && (undefined !== Zotero.pages) && Zotero.pages[zoterojsClass]) {
        try{
            Zotero.pages[zoterojsClass].init();
        }
        catch(err){
            Z.error("Error running page specific init for " + zoterojsClass);
            Z.error(err);
        }
    }
    
    if(typeof zoterojsClass == 'undefined'){
        zoterojsClass = 'default';
        Zotero.config.pageClass = 'default';
    }
    
    if(typeof Globalize !== 'undefined'){
        Globalize.culture(Zotero.config.locale);
    }
    
    if(typeof zoteroData == 'undefined'){
        zoteroData = {};
    }
    
    if(window.nonZendPage === true){
        return;
    }
    
    Zotero.state.parseUrlVars();
    
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
    //initialize global preferences object
    Zotero.preferences = new Zotero.Preferences(Zotero.store, 'global');
    Zotero.preferences.defaults = J.extend({}, Zotero.preferences.defaults, Zotero.config.defaultPrefs);
    
    //get localized item constants if not stored in localstorage
    var locale = "en-US";
    if(zoteroData.locale){
        locale = zoteroData.locale;
    }
    
    //decide if we're on a library page and run library specific setup
    var libraryPage = J("body").hasClass('library');
    //if(libraryPage){
    if(true){
        Z.debug("libraryPage - adding libraryString and filter", 3);
        Zotero.state.libraryString = Zotero.utils.libraryString(Zotero.config.librarySettings.libraryType,
            Zotero.config.librarySettings.libraryID);
        Zotero.state.filter = Zotero.state.libraryString;
        
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
    
    if(Zotero.state.getUrlVar('proxy') == 'false'){
        Zotero.config.proxy = false;
    }
    
    //if(Zotero.preferences.getPref('server_javascript_enabled') === false){
        //Zotero.utils.setUserPref('javascript_enabled', '1');
        Zotero.preferences.setPref('server_javascript_enabled', true);
        document.cookie = "zoterojsenabled=1; expires=; path=/";
    //}
    
    // Bind to popstate to update state when browser goes back
    // only applicable if state is using location
    window.onpopstate = function(){
        Z.debug("popstate", 3);
        J(window).trigger('statechange');
    };
    J(window).on('statechange', J.proxy(Zotero.state.popstateCallback, Zotero.state));
    
    //call popstateCallback on first load since some browsers don't popstate onload
    Zotero.state.popstateCallback();
};

