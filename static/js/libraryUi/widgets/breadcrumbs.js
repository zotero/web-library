Zotero.ui.widgets.breadcrumbs = {};

Zotero.ui.widgets.breadcrumbs.init = function(el){
    Zotero.ui.eventful.listen("displayedItemsChanged displayedItemChanged selectedCollectionChanged", Zotero.ui.libraryBreadcrumbs);
};

/**
 * Update the page's breadcrumbs based on the current state
 * @param  {Zotero_Library} library current Zotero Library
 * @param  {object} config  Current config object being displayed
 * @return {undefined}
 */
Zotero.ui.libraryBreadcrumbs = function(library, config){
    Z.debug('Zotero.ui.libraryBreadcrumbs', 3);
    try{
    var breadcrumbs = [];
    if(!library){
        library = Zotero.ui.getAssociatedLibrary(J("#feed-link-div"));
    }
    if(!config){
        config = Zotero.nav.getUrlVars();
    }
    Z.debug(config, 2);
    if(Zotero.config.breadcrumbsBase){
        J.each(Zotero.config.breadcrumbsBase, function(ind, crumb){
            breadcrumbs.push(crumb);
        });
    }
    else if(library.libraryType == 'user'){
        breadcrumbs = [{label:'Home', path:'/'},
                       {label:'People', path:'/people'},
                       {label:(library.libraryLabel || library.libraryUrlIdentifier), path:'/' + library.libraryUrlIdentifier},
                       {label:'Library', path:'/' + library.libraryUrlIdentifier + '/items'}];
    }
    else{
        breadcrumbs = [{label:'Home', path:'/'},
                       {label:'Groups', path:'/groups'},
                       {label:(library.libraryLabel || library.libraryUrlIdentifier), path:'/groups/' + library.libraryUrlIdentifier},
                       {label:'Library', path:'/groups/' + library.libraryUrlIdentifier + '/items'}];
    }
    if(config.collectionKey){
        Z.debug("have collectionKey", 4);
        curCollection = library.collections.getCollection(config.collectionKey);
        if( curCollection ){
            breadcrumbs.push({label:curCollection.get('name'), path:Zotero.nav.buildUrl({collectionKey:config.collectionKey})});
        }
    }
    if(config.itemKey){
        Z.debug("have itemKey", 4);
        breadcrumbs.push({label:library.items.getItem(config.itemKey).title, path:Zotero.nav.buildUrl({collectionKey:config.collectionKey, itemKey:config.itemKey})});
    }
    Z.debug(breadcrumbs, 4);
    widgetEl = J("#breadcrumbs").empty();
    widgetEl.html( J('#breadcrumbsTemplate').render({breadcrumbs:breadcrumbs}) );
    var newtitle = J('#breadcrumbstitleTemplate', {breadcrumbs:breadcrumbs}).text();
    Zotero.nav.updateStateTitle(newtitle);
    Z.debug("done with breadcrumbs", 4);
    }
    catch(e){
        Zotero.debug("Error loading breadcrumbs", 2);
        Zotero.debug(e);
    }
};

