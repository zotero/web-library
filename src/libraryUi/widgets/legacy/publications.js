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
    Zotero.ui.showSpinner(widgetEl, 'horizontal');
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
    var moreDisplayFields = [
        'abstractNote',
    ];
    var publicationTypes = {
        'book': [],
        'dissertation': [],
        'thesis': [],
        'journalArticle': [],
        'conferencePaper': [],
        'bookSection': [],
        'magazineArticle': [],
        'newspaperArticle': [],
        'presentation': [],
        'report': [],
        'blogPost': [],
        'document': [],
        'other': []
    };
    //map child items to their parent keys so we can put download links in
    var childItems = {};
    Z.debug("processing items");
    for(var i = 0; i < itemsArray.length; i++){
        var item = itemsArray[i];
        var parentKey = item.get("parentItem");
        if(parentKey){
            Z.debug("has parentKey, adding item to childItems object " + parentKey);
            childItems[parentKey] = item;
        }
        
        for(var j = 0; j < moreDisplayFields.length; j++) {
            if(item.get(moreDisplayFields[j])){
                item.hasMore = true;
            }
        }
        if(item.apiObj.data['creators'] && item.apiObj.data['creators'].length > 1){
            item.hasMore = true;
        }
        var itemType = item.get('itemType');
        Z.debug(itemType);
        Z.debug(publicationTypes[itemType]);
        
        if(publicationTypes[itemType]){
            Z.debug("inserting into appropriate array");
            publicationTypes[itemType].push(item);
        } else {
            Z.debug("inserting into other")
            publicationTypes['other'].push(item);
        }
    }
    Z.debug("rendering publicationsData");
    Z.debug(publicationTypes);
    var publicationsData = {'items':itemsArray,
                            'childItems': childItems,
                            'library':library,
                            'moreDisplayFields': moreDisplayFields,
                            'publicationTypes': publicationTypes,
                            'displayName': Z.config.librarySettings.name
                            };

    jel.append( J('#publicationsTemplate').render(publicationsData) );
};

