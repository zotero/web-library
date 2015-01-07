Zotero.ui.widgets.itemChildren = {};

Zotero.ui.widgets.itemChildren.init = function(el){
    Z.debug('itemChildren init', 3);
    var library = Zotero.ui.getAssociatedLibrary(el);
    var container = J(el);
    
    library.listen("displayedItemChanged uploadSuccessful showChildren", Zotero.ui.widgets.itemChildren.refreshChildren, {widgetEl:el});
};

/**
 * Get an item's children and display summary info
 * @param  {DOM Element} el      element to insert into
 * @param  {string} itemKey key of parent item
 * @return {undefined}
 */
Zotero.ui.widgets.itemChildren.refreshChildren = function(e){
    Z.debug('Zotero.ui.widgets.item.showChildren', 3);
    var widgetEl = J(e.data.widgetEl);
    var library = Zotero.ui.getAssociatedLibrary(widgetEl);
    var itemKey = Zotero.state.getUrlVar('itemKey');
    if(!itemKey){
        Z.debug("No itemKey - " + itemKey, 3);
        widgetEl.empty();
        //TODO: display information about library like client?
        return Promise.reject(new Error("No itemkey - " + itemKey));
    }
    
    var item = library.items.getItem(itemKey);
    
    Zotero.ui.showSpinner(widgetEl);
    var p = item.getChildren(library)
    .then(function(childItems){
        var container = widgetEl;
        container.html( J('#childitemsTemplate').render({childItems:childItems}) );
        Zotero.state.bindItemLinks(container);
    })
    .catch(Zotero.catchPromiseError);
    return p;
};

