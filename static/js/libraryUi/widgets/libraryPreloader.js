Zotero.ui.widgets.libraryPreloader = {};

//dedicated widget to preload library on init so we don't attempt to do that
//in every other widget
Zotero.ui.widgets.libraryPreloader.init = function(el){
    Z.debug("preloader init", 3);
    var library = Zotero.ui.getAssociatedLibrary(el);
    library.loadSettings();
    library.listen("deleteIdb", function(){
        library.idbLibrary.deleteDB();
    });
    library.listen("indexedDBError", function(){
    	Zotero.ui.jsNotificationMessage("There was an error initializing your library. Some data may not load properly.", 'notice');
    })
};
