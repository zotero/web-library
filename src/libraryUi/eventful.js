'use strict';

var log = require('../Log.js').Logger('zotero-web-library:eventful');

Zotero.widgets = {};
var eventful = {};

eventful.events = [
    "collectionsDirty", //collections have been updated and should be synced
    "tagsChanged", //library.tags has been updated in some way
    "displayedItemsChanged", //filters for items list have changed
    "displayedItemChanged", //item selected for detailed view has changed
    "selectedItemsChanged", //items selected by checkbox for action have changed
    "showCitations", //request to show the citations for currently selected items
    "showSettings", //request to show settings panel
    "exportItems", //request to export currently selected items
    "libraryTagsUpdated",
    "uploadSuccessful",
    "refreshGroups",
    "clearLibraryQuery",
    "libraryItemsUpdated",
    "citeItems",
    "itemTypeChanged",
    "addTag",
    "showChildren",
    "selectCollection",
    "selectedCollectionChanged",
    "libraryCollectionsUpdated",
    "loadItemsDone",
    "collectionsChanged",
    "tagsChanged",
    "itemsChanged",
    "loadedCollectionsProcessed",
    "deleteProgress",
    "settingsLoaded",
    "cachedDataLoaded",
    //eventfultriggers:
    "createItem",
    "newItem",
    "addToCollectionDialog",
    "removeFromCollection",
    "moveToTrash",
    "removeFromTrash",
    "toggleEdit",
    "clearLibraryQuery",
    "librarySettingsDialog",
    "citeItems",
    "exportItemsDialog",
    "syncLibrary",
    "createCollectionDialog",
    "updateCollectionDialog",
    "deleteCollectionDialog",
    "showMoreTags",
    "showFewerTags",
    "indexedDBError",

];

eventful.eventMap = {
    "orderChanged":["displayedItemsChanged"],
    "sortChanged":["displayedItemsChanged"],
    "collectionKeyChanged":["displayedItemsChanged", "selectedCollectionChanged"],
    "qChanged":["displayedItemsChanged"],
    "tagChanged":["displayedItemsChanged", "selectedTagsChanged"],
    "itemPageChanged":["displayedItemsChanged"],
    "itemKeyChanged":["displayedItemChanged"]
};

eventful.initWidgets = function(){
    Zotero.state.parsePathVars();
    
    J(".eventfulwidget").each(function(ind, el){
        var widgetName = J(el).data("widget");
        if(widgetName && Zotero.ui.widgets[widgetName]){
            if(Zotero.ui.widgets[widgetName]['init']){
                log.debug("eventfulwidget init: " + widgetName, 3);
                Zotero.ui.widgets[widgetName].init(el);
            }
        }
    });
    
    eventful.initTriggers();
    
    //TODO:set up marshalling of url var changes mapped to more specialized events
    //this is currently done in pushstate... possibly belongs here instead?
    
    //trigger events that should happen for widgets on pageload
    //mostly things that cause us to pull from the API or display something
    //for the first time
};

//make html elements that are declared to trigger events trigger them
//this should be called on any elements that are inserted into the DOM
//and once on page load
eventful.initTriggers = function(el){
    log.debug("eventful.initTriggers", 3);
    if(!el){
        el = J("html");
    }
    //initialize elements that have data-triggers info to trigger that event
    var triggerOnEvent = function(event){
        log.debug("triggerOnEvent", 3);
        event.preventDefault();
        var jel = J(event.delegateTarget);
        var eventName = jel.data("triggers");
        log.debug("eventName: " + eventName, 3);
        var filter = jel.data('library') || "";
        
        Zotero.trigger(eventName, {triggeringElement:event.currentTarget}, filter);
    };
    
    J(el).find(".eventfultrigger").each(function(ind, el){
        if(J(el).data('triggerbound')){
            return;
        }
        var ev = J(el).data("event");
        
        if(ev){
            log.debug("binding " + ev + " on " + el.tagName, 3);
            J(el).on(ev, triggerOnEvent);
        }
        else {
            //log.debug("binding click trigger on " + el.tagName, 3);
            //default to triggering on click
            J(el).on("click", triggerOnEvent);
        }
        J(el).data('triggerbound', true);
    });
};

module.exports = eventful;
