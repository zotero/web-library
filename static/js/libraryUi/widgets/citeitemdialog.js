Zotero.ui.widgets.citeItemDialog = {};

Zotero.ui.widgets.citeItemDialog.init = function(el){
    Z.debug("citeItemDialog widget init", 3);
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
    J("#citeitemdialogTemplate").tmpl({}).appendTo(widgetEl);
    var dialogEl = widgetEl.find(".cite-item-dialog");
    
    var citeFunction = function(){
        Z.debug("citeFunction", 3);
        Zotero.ui.showSpinner(dialogEl.find(".cite-box-div"));
        var style = dialogEl.find(".cite-item-select").val();
        
        if(!hasIndependentItems){
            //get the selected item keys from the items widget
            var itemKeys = Zotero.ui.getSelectedItemKeys(J("#edit-mode-items-form"));
            if(itemKeys.length === 0){
                itemKeys = Zotero.ui.getAllFormItemKeys(J("#edit-mode-items-form"));
            }
            Z.debug(itemKeys, 4);
            var d = library.loadFullBib(itemKeys, style);
            d.done(J.proxy(function(bibContent){
                dialogEl.find(".cite-box-div").html(bibContent);
            }, this) );
        }
        else {
            var directPromise = Zotero.ui.widgets.citeItemDialog.directCite(cslItems, style);
            directPromise.done(J.proxy(function(bibContent){
                dialogEl.find(".cite-box-div").html(bibContent);
            }, this) );
            directPromise.done(function(data, textStatus, jqxhr){
                Z.debug(data);
                Z.debug(textStatus);
                var bib = JSON.parse(data);
                var bibString = Zotero.ui.widgets.citeItemDialog.buildBibString(bib);
                dialogEl.find(".cite-box-div").html(bibString);
            });
        }
    };
    
    dialogEl.find(".cite-item-select").on('change', citeFunction);
    
    Zotero.ui.dialog(dialogEl, {});
    
    return false;
};

Zotero.ui.widgets.citeItemDialog.directCite = function(cslItems, style){
    var data = {};
    data.items = cslItems;
    return J.post(Zotero.ajax.proxyWrapper("http://127.0.0.1:8085/?linkwrap=1&style="+style, "POST"), JSON.stringify(data) );
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