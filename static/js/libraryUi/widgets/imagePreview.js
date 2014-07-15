Zotero.ui.widgets.imagePreview = {};

//dedicated widget to preload library on init so we don't attempt to do that
//in every other widget
Zotero.ui.widgets.imagePreview.init = function(el){
    var library = Zotero.ui.getAssociatedLibrary(el);
    library.listen('previewImage', Zotero.ui.widgets.imagePreview.show, {widgetEl: el});
};

Zotero.ui.widgets.imagePreview.show = function(evt){
    
};
