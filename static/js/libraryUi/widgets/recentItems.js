Zotero.ui.widgets.recentItems = {};

Zotero.ui.widgets.recentItems.init = function(el){
    Z.debug("widgets.recentItems.init");
    var library = Zotero.ui.getAssociatedLibrary(el);
    var widgetEl = J(el);
    
    var config = {
        'limit': 10,
        'order': 'dateModified',
    };
    var p = library.loadItems(config)
    .then(function(response){
        Z.debug("got items in recentItems");
        widgetEl.empty();
        Zotero.ui.widgets.items.displayItems(widgetEl, config, response.loadedItems);
    },
    function(response){
        Z.error(response);
        Z.error("error getting items in recentItems");
        var elementMessage = Zotero.ui.ajaxErrorMessage(response.jqxhr);
        widgetEl.html("<p>" + elementMessage + "</p>");
    });
};
