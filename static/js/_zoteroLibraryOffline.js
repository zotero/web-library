/*=== Full Library Loading ===*/
Zotero.callbacks.loadFullLibrary = function(el){
    Zotero.debug("Zotero.callbacks.loadFullLibrary", 3);
    //try to load library from local storage or indexedDB
    //
    //if we have local library already then pull modified item keys and get updates
    //--get list of itemkeys ordered by dateModified
    //--get a fresh copy of the most recently modified item
    //--if we have a copy of MRM and modified times/etags match we're done
    //--else: check exponentially further back items until we find a match, then load all items more recently modified
    //else: pull down enough of the library to display, then start pulling down full library
    //(or only pull down full with make available offline?)
    
    var library = Zotero.ui.getAssociatedLibrary(el);
    var displayParams = {};
    
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
    
    if(J("#library").hasClass('loaded')){
        //library has already been loaded once, just need to update view, not fetch data
        
        //update item pane display based on url
        Zotero.callbacks.chooseItemPane(J("#items-pane"));
        
        //update collection tree
        Zotero.ui.highlightCurrentCollection();
        Zotero.ui.nestHideCollectionTree(J("#collection-list-container"));
        
        //update tags display
        var plainList = library.tags.plainTagsList(library.tags.tagsArray);
        Zotero.ui.displayTagsFiltered(J("#tags-list-div"), library.tags, plainList, selectedTags);
        
        Zotero.ui.displayItemOrTemplate(library);
        
        //build new itemkeys list based on new url
        Z.debug("Building new items list to display", 3);
        //displayParams = Zotero.nav.getUrlVars();
        displayParams = J.extend({}, Zotero.config.defaultApiArgs, Zotero.nav.getUrlVars());
        
        Z.debug(displayParams);
        library.buildItemDisplayView(displayParams);
        //render new itemlist
        
    }
    else {
        Zotero.offline.initializeOffline();
    }
};

/* -----offline library ----- */
Zotero.ui.init.offlineLibrary = function(){
    Z.debug("Zotero.ui.init.offlineLibrary", 3);
    
    Zotero.ui.init.tags();
    Zotero.ui.init.collections();
    Zotero.ui.init.items();
    //Zotero.ui.init.feed();
    
    J.subscribe('loadItemsFromKeysParallelDone', function(){
        J.publish("displayedItemsUpdated");
    });
    
    J.subscribe("displayedItemsUpdated", function(){
        Z.debug("displayedItemsUpdated triggered", 3);
        var library = Zotero.ui.getAssociatedLibrary(J("#library"));
        Zotero.ui.displayItemsFullLocal(J("#library-items-div"), {}, library);
    });
    J.subscribe("collectionsUpdated", function(){
        Z.debug("collectionsUpdated triggered", 3);
        var library = Zotero.ui.getAssociatedLibrary(J("#library"));
        Zotero.ui.renderCollectionList(J("#collection-list-container"), library.collections.collectionsArray);
    });
    J.subscribe("tagsUpdated", function(){
        Z.debug("tagsUpdated triggered", 3);
        var library = Zotero.ui.getAssociatedLibrary(J("#library"));
        var plainList = library.tags.plainTagsList(library.tags.tagsArray);
        var matchedList = Zotero.utils.prependAutocomplete('', plainList);
        Zotero.ui.displayTagsFiltered(J("#tags-list-container") , library.tags, matchedList, selectedTags);
    });
    
    J("#makeAvailableOfflineLink").bind('click', J.proxy(function(e){
        e.preventDefault();
        var library = Zotero.ui.getAssociatedLibrary(J("#library"));
        var collectionKey = Zotero.nav.getUrlVar('collectionKey');
        var itemKeys;
        if(collectionKey){
            library.saveCollectionFilesOffline(collectionKey);
        }
        else{
            library.saveFileSetOffline(library.itemKeys);
        }
    }, this) );
};


/* ----- offline ----- */

/**
 * Display the full library items section
 * @param  {Dom Element} el          Container
 * @param  {object} config      items config
 * @param  {array} loadedItems loaded items array
 * @return {undefined}
 */
Zotero.ui.displayItemsFullLocal = function(el, config, library){
    Z.debug("Zotero.ui.displayItemsFullLocal", 3);
    Z.debug(config, 4);
    var jel = J(el);
    var filledConfig = J.extend({}, Zotero.config.defaultApiArgs, config);
    
    var titleParts = ['', '', ''];
    var displayFields = library.preferences.getPref('listDisplayedFields');
    if(library.libraryType != 'group'){
        displayFields = J.grep(displayFields, function(el, ind){
            return J.inArray(el, Zotero.Library.prototype.groupOnlyColumns) == (-1);
        });
    }
    var editmode = (Zotero.config.librarySettings.allowEdit ? true : false);
    
    var itemsTableData = {titleParts:titleParts,
                           displayFields:displayFields,
                           items:library.items.displayItemsArray,
                           editmode:editmode,
                           order: filledConfig['order'],
                           sort: filledConfig['sort'],
                           library:library
                        };
    //Z.debug(jel, 3);
    //Z.debug(itemsTableData);
    jel.empty();
    Zotero.ui.insertItemsTable(jel, itemsTableData);
    
    if(Zotero.config.mobile){
        Zotero.ui.createOnActivePage(el);
        return;
    }
    
    Zotero.ui.updateDisabledControlButtons();
    
    Zotero.ui.libraryBreadcrumbs();
    
    Zotero.ui.createOnActivePage(el);
};

/**
 * Get an item's children and display summary info
 * @param  {DOM Element} el      element to insert into
 * @param  {string} itemKey key of parent item
 * @return {undefined}
 */
Zotero.ui.showChildrenLocal = function(el, itemKey){
    Z.debug('Zotero.ui.showChildrenLocal', 3);
    var library = Zotero.ui.getAssociatedLibrary(J(el).closest("div.ajaxload"));
    var item = library.items.getItem(itemKey);
    var attachmentsDiv = J(el).find(".item-attachments-div");
    Zotero.ui.showSpinner(attachmentsDiv);
    
    var childItemKeys = item.childItemKeys;
    var childItems = library.items.getItems(childItemKeys);
    
    J(".item-attachments-div").html( J("#childitemsTemplate").render({childItems:childItems}) );
    
    Zotero.ui.createOnActivePage(el);
};

Zotero.ui.localDownloadLink = function(item, el){
    Z.debug("Zotero.ui.localDownloadLink");
    if(item.links && item.links.enclosure){
        Z.debug("should have local file");
        var d = item.owningLibrary.filestorage.getSavedFileObjectUrl(item.itemKey);
        d.then(function(url){
            Z.debug("got item's object url - adding to table");
            J("table.item-info-table tbody").append("<tr><th>Local Copy</th><td><a href='" + url + "'>Open</a></td></tr>");
        });
    }
    else{
        Z.debug("Missing link?");
    }
};

Zotero.ui.displayItemOrTemplate = function(library){
    if(Zotero.nav.getUrlVar('action') == 'newItem'){
        var itemType = Zotero.nav.getUrlVar('itemType');
        if(!itemType){
            J("#item-details-div").empty();
            J("#item-details-div").html( J("#itemtypeselectTemplate").render({itemTypes:Zotero.localizations.typeMap}) );
            return;
        }
        else{
            var newItem = new Zotero.Item();
            newItem.libraryType = library.libraryType;
            newItem.libraryID = library.libraryID;
            d = newItem.initEmpty(itemType);
            J("#item-details-div").data('pendingDeferred', d);
            d.then(Zotero.ui.loadNewItemTemplate, function(jqxhr, textStatus, errorThrown){
                Zotero.ui.jsNotificationMessage("Error loading item template", 'error');
            });
        }
    }
    else{
        //display individual item if needed
        var itemKey = Zotero.nav.getUrlVar('itemKey');
        if(itemKey){
            //get the item out of the library for display
            var item = library.items.getItem(itemKey);
            if(item){
                Z.debug("have item locally, loading details into ui", 3);
                if(Zotero.nav.getUrlVar('mode') == 'edit'){
                    Zotero.ui.editItemForm(J("#item-details-div"), item);
                }
                else{
                    Zotero.ui.loadItemDetail(item, J("#item-details-div"));
                    Zotero.ui.showChildrenLocal(J("#item-details-div"), itemKey);
                    Zotero.ui.localDownloadLink(item, J("#item-details-div"));
                }
            }
        }
    }
    
};

//----------Zotero.offline
Zotero.offline.initializeOffline = function(){
    Z.debug("Zotero.offline.initializeOffline", 3);
    //check for cached libraryData, if not present load it before doing anything else
    var libraryDataDeferred = new J.Deferred();
    var cacheConfig = {target:'userlibrarydata'};
    var userLibraryData = Zotero.cache.load(cacheConfig);
    
    if(userLibraryData){
        Z.debug("had cached library data - resolving immediately");
        J('#library').data('loadconfig', userLibraryData.loadconfig);
        libraryDataDeferred.resolve(userLibraryData);
    }
    else{
        Z.debug("don't have cached library config data - fetching from server");
        J.getJSON('/user/userlibrarydata', J.proxy(function(data, textStatus, jqxhr){
            Z.debug("got back library config data from server");
            if(data.loggedin === false){
                window.location = '/user/login';
                return false;
            }
            else{
                J('#library').data('loadconfig', data.loadconfig);
                userLibraryData = data;
                libraryDataDeferred.resolve(userLibraryData);
            }
        }, this) );
    }
    
    libraryDataDeferred.then(function(userLibraryData){
        Zotero.debug("Got library data");
        Zotero.debug(userLibraryData);
        
        Zotero.loadConfig(userLibraryData);
        var library = Zotero.ui.getAssociatedLibrary(J("#library"));
        
        Zotero.offline.loadAllItems(library);
        Zotero.offline.loadAllCollections(library);
        Zotero.offline.loadAllTags(library);
        
        Zotero.offline.loadMetaInfo(library);
    });
};

Zotero.offline.loadMetaInfo = function(library){
    Z.debug("Zotero.offline.loadMetaInfo", 3);
    /* ----- load item templates ----- */
    //all other template information is loaded and cached automatically in Zotero www init
    //but this requires many requests, so only preload templates for all itemTypes for
    //offline capable library
    if(Zotero.Item.prototype.itemTypes){
        Z.debug("have itemTypes, fetching item templates", 3);
        var itemTypes = Zotero.Item.prototype.itemTypes;
        var type;
        J.each(itemTypes, function(ind, val){
            type = val.itemType;
            if(type != 'attachment'){
                Zotero.Item.prototype.getItemTemplate(type);
            }
            Zotero.Item.prototype.getCreatorTypes(type);
        });
        //get templates for attachments with linkmodes
        Zotero.Item.prototype.getItemTemplate('attachment', 'imported_file');
        Zotero.Item.prototype.getItemTemplate('attachment', 'imported_url');
        Zotero.Item.prototype.getItemTemplate('attachment', 'linked_file');
        Zotero.Item.prototype.getItemTemplate('attachment', 'linked_url');
    }
    else {
        Z.debug("Dont yet have itemTypes, can't fetch item templates", 3);
    }
};
