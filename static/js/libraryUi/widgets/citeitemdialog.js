Zotero.ui.widgets.citeItemDialog = {};

Zotero.ui.widgets.citeItemDialog.init = function(el){
    Z.debug("citeItemDialog widget init", 3);
    Zotero.ui.widgets.citeItemDialog.getAvailableStyles();
    Zotero.ui.eventful.listen("citeItems", Zotero.ui.widgets.citeItemDialog.show, {widgetEl: el});
};

Zotero.ui.widgets.citeItemDialog.show = function(e){
    Z.debug("citeItemDialog.show", 3);
    var triggeringEl = J(e.triggeringElement);
    var hasIndependentItems = false;
    var cslItems = [];
    var library;
    
    //check if event is carrying item data with it
    if(e.hasOwnProperty("zoteroItems")){
        hasIndependentItems = true;
        J.each(e.zoteroItems, function(ind, item){
            var cslItem = item.cslItem();
            cslItems.push(cslItem);
        });
    }
    else {
        library = Zotero.ui.getAssociatedLibrary(triggeringEl);
    }
    
    var widgetEl = J(e.data['widgetEl']).empty();
    widgetEl.html( J("#citeitemdialogTemplate").render({freeStyleInput:true}) );
    var dialogEl = widgetEl.find(".cite-item-dialog");
    
    var citeFunction = function(e){
        Z.debug("citeFunction", 3);
        //Zotero.ui.showSpinner(dialogEl.find(".cite-box-div"));
        var triggeringElement = J(e.currentTarget);
        var style = '';
        if(triggeringElement.is(".cite-item-select, input.free-text-style-input")){
            style = triggeringElement.val();
        }
        else{
            style = dialogEl.find(".cite-item-select").val();
            var freeStyle = dialogEl.find("input.free-text-style-input").val();
            if(J.inArray(freeStyle, Zotero.styleList) !== -1){
                style = freeStyle;
            }
        }
        
        if(!hasIndependentItems){
            //get the selected item keys from the items widget
            var itemKeys = Zotero.ui.getSelectedItemKeys(J("#edit-mode-items-form"));
            if(itemKeys.length === 0){
                itemKeys = Zotero.ui.getAllFormItemKeys(J("#edit-mode-items-form"));
            }
            Z.debug(itemKeys, 4);
            var d = library.loadFullBib(itemKeys, style);
            d.then(J.proxy(function(bibContent){
                dialogEl.find(".cite-box-div").html(bibContent);
            }, this) );
        }
        else {
            var directPromise = Zotero.ui.widgets.citeItemDialog.directCite(cslItems, style);
            directPromise.then(J.proxy(function(bibContent){
                dialogEl.find(".cite-box-div").html(bibContent);
            }, this) );
            directPromise.then(function(data, textStatus, jqxhr){
                var bib = JSON.parse(data);
                var bibString = Zotero.ui.widgets.citeItemDialog.buildBibString(bib);
                dialogEl.find(".cite-box-div").html(bibString);
            });
        }
    };
    
    dialogEl.find(".cite-item-select").on('change', citeFunction);
    dialogEl.find("input.free-text-style-input").on('change', citeFunction);
    
    Zotero.ui.widgets.citeItemDialog.getAvailableStyles();
    dialogEl.find("input.free-text-style-input").typeahead({local:Zotero.styleList, limit:10});
    
    Zotero.ui.dialog(dialogEl, {});
    
    return false;
};

Zotero.ui.widgets.citeItemDialog.getAvailableStyles = function(){
    if(!Zotero.styleList){
        Zotero.styleList = [];
        J.getJSON(Zotero.config.styleListUrl, function(data, textStatus, jqxhr){
            Zotero.styleList = data;
        } );
    }
};

Zotero.ui.widgets.citeItemDialog.directCite = function(cslItems, style){
    var data = {};
    data.items = cslItems;
    var url = Zotero.config.citationEndpoint + '?linkwrap=1&style=' + style;
    return J.post(url, JSON.stringify(data) );
};

Zotero.ui.widgets.citeItemDialog.buildBibString = function(bib){
    var bibMeta = bib.bibliography[0];
    var bibEntries = bib.bibliography[1];
    var bibString = bibMeta.bibstart;
    for(var i = 0; i < bibEntries.length; i++){
        bibString += bibEntries[i];
    }
    bibString += bibMeta.bibend;
    return bibString;
};