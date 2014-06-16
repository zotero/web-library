Zotero.ui.widgets.panelContainer = {};

Zotero.ui.widgets.panelContainer.init = function(el){
    Z.debug("panelContainer widget init", 3);
    var library = Zotero.ui.getAssociatedLibrary(el);
    
    library.listen("displayedItemsChanged showItemsPanel", Zotero.ui.widgets.panelContainer.showPanel, {widgetEl: el, panelSelector:"#items-panel"});
    library.listen("showCollectionsPanel", Zotero.ui.widgets.panelContainer.showPanel, {widgetEl: el, panelSelector:"#collections-panel"});
    library.listen("showTagsPanel", Zotero.ui.widgets.panelContainer.showPanel, {widgetEl: el, panelSelector:"#tags-panel"});
    library.listen("showItemPanel displayedItemChanged", Zotero.ui.widgets.panelContainer.showPanel, {widgetEl: el, panelSelector:"#item-panel"});
    Zotero.listen("reflow", Zotero.ui.widgets.panelContainer.reflow, {widgetEl: el});
    
    Zotero.ui.widgets.panelContainer.showPanel({data: {widgetEl: el, panelSelector:"#items-panel"}});
    J(window).on('resize', function(){
        Zotero.ui.widgets.panelContainer.reflow({data: {widgetEl: el}} );
    });
    J(el).on('click', '.single-cell-item', function(){
        library.trigger('showItemPanel');
    });
};

Zotero.ui.widgets.panelContainer.reflow = function(evt){
    Zotero.ui.widgets.panelContainer.showPanel({data: {widgetEl: evt.data.widgetEl, panelSelector:"#items-panel"}});
};

Zotero.ui.widgets.panelContainer.showPanel = function(evt){
    Z.debug("panelContainer.showPanel", 3);
    var widgetEl = J(evt.data.widgetEl);
    var selector = evt.data.panelSelector;
    if(selector == "#item-panel" && (!Zotero.state.getUrlVar('itemKey'))){
        Z.debug("item-panel selected with no itemKey", 3);
        selector = "#items-panel";
    }
    Z.debug("selector:" + selector, 3);
    
    var deviceSize = 'xs';
    var displaySections = [];
    switch(true){
        case window.matchMedia("(min-width: 1200px)").matches:
            deviceSize = 'lg';
            widgetEl.find(".panelcontainer-panelcontainer").show()
            .find('.panelcontainer-panel').show();
            break;
        case window.matchMedia("(min-width: 992px)").matches:
            deviceSize = 'md';
            widgetEl.find(".panelcontainer-panelcontainer").show()
            .find('.panelcontainer-panel').show();
            break;
        case window.matchMedia("(min-width: 768px)").matches:
            deviceSize = 'sm';
            widgetEl.find(".panelcontainer-panelcontainer").show()
            .find('.panelcontainer-panel').show();
            if(selector == "#item-panel" || selector == "#items-panel"){
                widgetEl.find(selector).siblings(".panelcontainer-panel").hide();
                widgetEl.find(selector).show();
            }
            break;
        default:
            deviceSize = 'xs';
            widgetEl.find('.panelcontainer-panelcontainer').hide().find('.panelcontainer-panel').hide();
            widgetEl.find(selector).show().closest('.panelcontainer-panelcontainer').show();
    }
    Z.debug("panelContainer calculated deviceSize: " + deviceSize, 3);
    
    widgetEl.find('#panelcontainer-nav li').removeClass('active');
    
    switch(selector){
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
