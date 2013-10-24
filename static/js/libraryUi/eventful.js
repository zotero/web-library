Zotero.widgets = {};
Zotero.ui.eventful = {};

Zotero.ui.eventful.trigger = function(eventtype, data){
    Zotero.debug("Triggering eventful " + eventtype, 3);
    if(!data){
        data = {};
    }
    data.zeventful = true;
    var e = J.Event(eventtype, data);
    J("#eventful").trigger(e);
};

Zotero.ui.eventful.listen = function(events, handler, data){
    J("#eventful").on(events, null, data, handler);
};


Zotero.eventful = {};
Zotero.eventful.init = {};

Zotero.eventful.events = [
    "collectionsDirty",
    "tagsChanged",
    "displayedItemsChanged",
    "displayedItemChanged",
    "selectedItemsChanged",
    "showCitations",
    "showSettings",
    "exportItems"
];

Zotero.eventful.eventMap = {
    "orderChanged":["displayedItemsChanged"],
    "sortChanged":["displayedItemsChanged"],
    "collectionKeyChanged":["displayedItemsChanged", "selectedCollectionChanged"],
    "qChanged":["displayedItemsChanged"],
    "tagChanged":["displayedItemsChanged", "selectedTagsChanged"],
    "itemPageChanged":["displayedItemsChanged"],
    "itemKeyChanged":["displayedItemChanged"]
};

Zotero.eventful.initWidgets = function(){
    Zotero.nav.parsePathVars();
    
    J(".eventfulwidget").each(function(ind, el){
        var fnName = J(el).data("function");
        if(Zotero.eventful.init.hasOwnProperty(fnName)){
            Z.debug("CALLING EVENTFUL INIT: " + fnName);
            Zotero.eventful.init[fnName](el);
        }
        
        var widgetName = J(el).data("widget");
        if(widgetName && Zotero.ui.widgets[widgetName]){
            if(Zotero.ui.widgets[widgetName]['init']){
                Zotero.ui.widgets[widgetName].init(el);
            }
        }
    });
    
    Zotero.eventful.initTriggers();
    
    //TODO:set up marshalling of url var changes mapped to more specialized events
    //this is currently done in pushstate... possibly belongs here instead?
    
    //trigger events that should happen for widgets on pageload
    //mostly things that cause us to pull from the API or display something
    //for the first time
    
    //Zotero.ui.eventful.trigger("tagsDirty"); //removed to be called on indexedDB load instead
    Zotero.ui.eventful.trigger("displayedItemsChanged");
    Zotero.ui.eventful.trigger("displayedItemChanged");
};

//make html elements that are declared to trigger events trigger them
//this should be called on any elements that are inserted into the DOM
//and once on page load
Zotero.eventful.initTriggers = function(el){
    Zotero.debug("Zotero.eventful.initTriggers", 3);
    if(!el){
        el = J("html");
    }
    //initialize elements that have data-triggers info to trigger that event
    var triggerOnEvent = function(event){
        Z.debug("triggerOnEvent", 3);
        event.preventDefault();
        eventName = J(event.delegateTarget).data("triggers");
        Z.debug("eventName: " + eventName);
        Zotero.ui.eventful.trigger(eventName, {triggeringElement:event.currentTarget});
    };
    
    J(el).find(".eventfultrigger").each(function(ind, el){
        var ev = J(el).data("event");
        var libString = J(el).data("library") || "";
        
        Z.debug("binding eventfultrigger", 4);
        if(ev){
            Z.debug("binding " + ev + " trigger with " + libString + " on " + el.tagName, 4);
            //J(el).on(ev + "." + libString, triggerOnEvent);
            J(el).on(ev, triggerOnEvent);
        }
        else {
            //Z.debug("binding click trigger with on " + el.tagName, 5);
            //default to triggering on click
            //J(el).on("click" + "." + libString, triggerOnEvent);
            J(el).on("click", triggerOnEvent);
        }
    });
    /*
    J(".eventfultrigger").bind('click', function(e){
        Z.debug("eventfultrigger click");
    });*/
};
