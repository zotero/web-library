Zotero.ui.widgets.newItem = {};

Zotero.ui.widgets.newItem.init = function(el){
    Z.debug("newItem eventfulwidget init", 3);
    var library = Zotero.ui.getAssociatedLibrary(el);
    
    var widgetEl = J(el);
    library.listen("newItem", Zotero.ui.widgets.newItem.freshitemcallback, {widgetEl: el});
    library.listen("itemTypeChanged", Zotero.ui.widgets.newItem.changeItemType, {widgetEl: el});
    library.listen("createItem", Zotero.ui.widgets.item.saveItemCallback, {widgetEl: el});
    widgetEl.on('change', 'select.itemType', function(e){
        library.trigger('itemTypeChanged', {triggeringElement:el});
    });
};

Zotero.ui.widgets.newItem.freshitemcallback = function(e){
    Z.debug('Zotero eventful new item', 3);
    var widgetEl = e.data.widgetEl;
    var el = widgetEl;
    var triggeringEl = J(e.triggeringElement);
    var itemType = triggeringEl.data("itemtype");
    
    var newItem = new Zotero.Item();
    
    return newItem.initEmpty(itemType)
    .then(function(item){
        Zotero.ui.unassociatedItemForm(widgetEl, item);
    },
    function(response){
        Zotero.ui.jsNotificationMessage("Error loading item template", 'error');
        Z.debug(response);
        Z.debug(response.jqxhr.statusCode);
    });
};

Zotero.ui.unassociatedItemForm = function(el, item){
    Z.debug("Zotero.ui.unassociatedItem", 3);
    Z.debug(item, 3);
    var container = J(el);
    var library = Zotero.ui.getAssociatedLibrary(el);
    
    //make alphabetical itemTypes list
    var itemTypes = [];
    J.each(Zotero.Item.prototype.typeMap, function(key, val){
        itemTypes.push(key);
    });
    itemTypes.sort();
    Z.debug(itemTypes);
    
    return Zotero.Item.prototype.getCreatorTypes(item.itemType)
    .then(function(itemCreatorTypes){
        container.empty();
        if(item.itemType == 'note'){
            var parentKey = Zotero.state.getUrlVar('parentKey');
            if(parentKey){
                item.parentKey = parentKey;
            }
            container.append( J('#editnoteformTemplate').render({item:item,
                                         itemKey:item.itemKey
                                         }) );
            
            Zotero.ui.init.rte('default');
        }
        else {
            container.append(J('#itemformTemplate').render( {item:item,
                                        library: library,
                                        itemKey:item.itemKey,
                                        creatorTypes:itemCreatorTypes,
                                        itemTypes: itemTypes,
                                        citable:true,
                                        saveable:false
                                        }
                                        ) );
            if(item.apiObj.tags.length === 0){
                Zotero.ui.widgets.item.addTag(container, false);
            }
            Zotero.ui.init.creatorFieldButtons();
            //Zotero.ui.init.tagButtons();
            Zotero.ui.init.editButton();
        }
        
        container.find(".directciteitembutton").on('click', function(e){
            Zotero.ui.updateItemFromForm(item, container.find("form"));
            library.trigger('citeItems', {"zoteroItems": [item]});
        } );
        /*
        container.on("click", "button.switch-two-field-creator-link", Zotero.ui.callbacks.switchTwoFieldCreators);
        container.on("click", "button.switch-single-field-creator-link", Zotero.ui.callbacks.switchSingleFieldCreator);
        container.on("click", "button.remove-creator-link", Zotero.ui.removeCreator);
        container.on("click", "button.add-creator-link", Zotero.ui.addCreator);
        */
        
        Z.debug("Setting newitem data on container");
        Z.debug(item);
        Z.debug(container);
        container.data('item', item);
        
        //load data from previously rendered form if available
        Zotero.ui.loadFormData(container);
        
        Zotero.eventful.initTriggers(container);
    });
    
};

Zotero.ui.widgets.newItem.changeItemType = function(e){
    var widgetEl = Zotero.ui.parentWidgetEl(e);
    Z.debug(widgetEl.length);
    var itemType = widgetEl.find("select.itemType").val();
    Z.debug("newItemType:" + itemType);
    
    //TODO: save values from current item and put them into new item
    var oldItem = widgetEl.data('item');
    Zotero.ui.updateItemFromForm(oldItem, widgetEl.find("form"));
    var newItem = new Zotero.Item();
    //newItem.libraryType = library.libraryType;
    //newItem.libraryID = library.libraryID;
    return newItem.initEmpty(itemType)
    .then(function(item){
        Zotero.ui.translateItemType(oldItem, item);
        Zotero.ui.unassociatedItemForm(widgetEl, item);
    },
    function(response){
        Zotero.ui.jsNotificationMessage("Error loading item template", 'error');
    });
};

Zotero.ui.translateItemType = function(firstItem, newItem){
    Z.debug("Zotero.ui.translateItemType");
    J.each(Zotero.Item.prototype.fieldMap, function(field, val){
        if( (field != "itemType") && firstItem.apiObj.hasOwnProperty(field) && newItem.apiObj.hasOwnProperty(field)){
            Z.debug("transferring value for " + field + ": " + firstItem.get(field));
            newItem.set(field, firstItem.get(field));
        }
    });
};
