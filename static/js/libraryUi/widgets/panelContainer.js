Zotero.ui.widgets.panelContainer = {};

Zotero.ui.widgets.panelContainer.init = function(el){
    Z.debug("panelContainer widget init", 3);
    var library = Zotero.ui.getAssociatedLibrary(el);
    
    library.listen("displayedItemsChanged showItemsPanel", Zotero.ui.widgets.panelContainer.showPanel, {widgetEl: el, panelSelector:"#items-panel"});
    library.listen("showCollectionsPanel", Zotero.ui.widgets.panelContainer.showPanel, {widgetEl: el, panelSelector:"#collections-panel"});
    library.listen("showTagsPanel", Zotero.ui.widgets.panelContainer.showPanel, {widgetEl: el, panelSelector:"#tags-panel"});
    library.listen("showItemPanel displayedItemChanged", Zotero.ui.widgets.panelContainer.showPanel, {widgetEl: el, panelSelector:"#item-panel"});
    
    Zotero.ui.widgets.panelContainer.showPanel({data: {widgetEl: el, panelSelector:"#items-panel"}});
};

Zotero.ui.widgets.panelContainer.showPanel = function(evt){
    Z.debug("panelContainer.showPanel", 3);
    var widgetEl = J(evt.data.widgetEl);
    widgetEl.find(".panelcontainer-panel").hide();
    widgetEl.find(evt.data.panelSelector).show();
    
    widgetEl.find('#panelcontainer-nav li').removeClass('active');
    switch(evt.data.panelSelector){
        case '#collections-panel':
            widgetEl.find('li.collections-nav').addClass('active');
            break;
        case '#tags-panel':
            widgetEl.find('li.tags-nav').addClass('active');
            break;
        case '#items-panel':
            widgetEl.find('li.items-nav').addClass('active');
            break;
        
    }
};
