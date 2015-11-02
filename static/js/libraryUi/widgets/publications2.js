Zotero.ui.widgets.publications = {};

Zotero.ui.widgets.publications.init = function(el){
    Z.debug("widgets.publications.init");
    var library = Zotero.ui.getAssociatedLibrary(el);
    var widgetEl = J(el);
    var libraryID = widgetEl.data('libraryID');
    
    var config = {
        'limit': 50,
        'order': 'dateModified',
        'sort': 'desc',
        'libraryType': 'user',
        'libraryID': libraryID,
        'target': 'publications',
        'include': 'data,bib',
        'linkwrap': '1',
        'style': 'apa-annotated-bibliography',
    };
    var p = library.loadPublications(config)
    .then(function(response){
        Z.debug("got publications", 3);
        widgetEl.empty();
        Zotero.ui.widgets.publications.displayItems(widgetEl, config, response.publicationItems);
    },
    function(response){
        Z.error(response);
        Z.error("error getting publication items");
        var elementMessage = Zotero.ui.ajaxErrorMessage(response.jqxhr);
        widgetEl.html("<p>" + elementMessage + "</p>");
    });


};

Zotero.ui.widgets.publications.displayItems = function(el, config, itemsArray) {
    Z.debug("publications.displayItems", 3);
    var jel = J(el);
    var library = Zotero.ui.getAssociatedLibrary(jel);
    
    var filledConfig = J.extend({}, Zotero.config.defaultApiArgs, config);
    var displayFields = library.preferences.getPref('listDisplayedFields');
    if(library.libraryType != 'group'){
        displayFields = J.grep(displayFields, function(el, ind){
            return J.inArray(el, Zotero.Library.prototype.groupOnlyColumns) == (-1);
        });
    }
    //map child items to their parent keys so we can put download links in
    var childItems = {};
    for(var i = 0; i < itemsArray.length; i++){
        var item = itemsArray[i];
        var parentKey = item.get("parentItem");
        if(parentKey){
            Z.debug("has parentKey, adding item to childItems object " + parentKey);
            childItems[parentKey] = item;
        }
    }
    
    var publicationsData = {'items':itemsArray,
                            'childItems': childItems,
                            'library':library,
                            'displayFields': [
                                'title',
                                'creator',
                                'abstract',
                                'date',
                            ],
                            };

    jel.append( J('#publicationsTemplate').render(publicationsData) );
};

