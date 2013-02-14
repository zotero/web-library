Zotero.ui.eventful = {};

Zotero.ui.eventful.init = function(){
    Zotero.ui.eventful.initTagsList();
    Zotero.ui.eventful.initCollectionsList();
};

Zotero.ui.eventful.trigger = function(eventtype, data){
    var e = J.Event(eventtype, data);
    J("#library").trigger(e);
};

Zotero.ui.eventful.listen = function(events, handler){
    J("#library").on(events, handler);
};

Zotero.ui.eventful.initTagsList = function(){
    var updateTags = function(e){
        var library = e.library;
        var tagsListDiv = J("#tags-list-div");
        // put the selected tags into an array
        var selectedTags = Zotero.nav.getUrlVar('tag');
        if(!J.isArray(selectedTags)){
            if(selectedTags) {
                selectedTags = [selectedTags];
            }
            else {
                selectedTags = [];
            }
        }
        
        var plainList = library.tags.plainTagsList(library.tags.tagsArray);
        var matchedList = Zotero.utils.prependAutocomplete('', plainList);
        Zotero.ui.displayTagsFiltered(tagsListDiv, library.tags, matchedList, selectedTags);
    };
    
    Zotero.ui.eventful.listen('tagsUpdated', updateTags);
};

Zotero.ui.eventful.initCollectionsList = function(){
    var updateCollections = function(e){
        var library = e.library;
        var clist = J('#collection-list-container');
        
        Zotero.ui.displayCollections(clist, library.collections);
        Zotero.ui.nestHideCollectionTree(clist);
        Zotero.ui.highlightCurrentCollection();
    };
    
    Zotero.ui.eventful.listen('collectionsUpdated', updateCollections);
};
