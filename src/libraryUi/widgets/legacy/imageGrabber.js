Zotero.ui.widgets.imageGrabber = {};

//dedicated widget to preload library on init so we don't attempt to do that
//in every other widget
Zotero.ui.widgets.imageGrabber.init = function(el){
    Z.debug("imageGrabber.init", 3);
    var library = Zotero.ui.getAssociatedLibrary(el);
    library.listen('grabImage', Zotero.ui.widgets.imageGrabber.grab, {widgetEl: el});
    library.listen('previewImage', Zotero.ui.widgets.imageGrabber.previewImage, {widgetEl: el});
    library.listen('previewStoredImage', Zotero.ui.widgets.imageGrabber.previewStoredImage, {widgetEl: el});
    
    var displayAsImage = function(file){
        var imgURL = URL.createObjectURL(file);
        J("#preview-image").attr('src', imgURL);
        
    };
    
    var inputEl = J("#capture").on('change', function(){
        Z.debug("capture element changed. displaying image in preview");
        library.trigger('previewImage');
        
    });
    
    //callback for when everything in the upload form is filled
    //grab file blob
    //grab file data given by user
    //create or modify attachment item
    //Item.uploadExistingFile or uploadChildAttachment
    
};

Zotero.ui.widgets.imageGrabber.getFile = function(container){
    return container.find("#capture").get(0).files[0];
};

Zotero.ui.widgets.imageGrabber.previewImage = function(evt){
    Z.debug('imageGrabber.previewImage', 3);
    var widgetEl = J(evt.data['widgetEl']);
    
    var file = Zotero.ui.widgets.imageGrabber.getFile(widgetEl);
    var imgUrl = URL.createObjectURL(file);
    widgetEl.find('#preview-image').attr('src', imgUrl);
    
};

Zotero.ui.widgets.imageGrabber.grab = function(evt){
    Z.debug('imageGrabber.grab', 3);
    var widgetEl = J(evt.data['widgetEl']);
    var library = Zotero.ui.getAssociatedLibrary(widgetEl);
    var file;
    var fileInfo;
    
    var childItem = new Zotero.Item();
    childItem.associateWithLibrary(library);
    childItem.initEmpty('attachment', 'imported_file')
    .then(function(childItem){
        Z.debug("templateItem callback", 3);
        var title = widgetEl.find('#image-grabber-title').val();
        if(!title) title = "Untitled";
        childItem.set('title', title);
        childItem.set('itemKey', Zotero.utils.getKey());
        library.items.addItem(childItem);
        
        return library.idbLibrary.addItems([childItem]);
    }).then(function(){
        Z.debug("added item to idb", 3);
        file = Zotero.ui.widgets.imageGrabber.getFile(widgetEl);
        return Zotero.file.getFileInfo(file);
    }).then(function(fInfo){
        Z.debug("got fileInfo", 3);
        fileInfo = fInfo;
        var fileData = fileInfo;
        //fileData.file = file;
        return library.idbLibrary.setFile(childItem.get('itemKey'), fileData);
    }).then(function(){
        Z.debug("file saved to idb", 3);
    }).catch(Zotero.catchPromiseError);
};

Zotero.ui.widgets.imageGrabber.previewStoredImage = function(evt){
    Z.debug('imageGrabber.previewImage', 3);
    var widgetEl = J(evt.data['widgetEl']);
    var library = Zotero.ui.getAssociatedLibrary(widgetEl);
    var itemKey = evt.itemKey;
    Z.debug("itemKey: " + itemKey);
    
    var previewItem = library.items.getItem(itemKey);
    var previewItemFile = library.idbLibrary.getFile(itemKey)
    .then(function(fileData){
        Z.debug("got Image");
        Z.debug(fileData);
        var b = new Blob([fileData.filedata], {type : fileData.contentType});
        var imgUrl = URL.createObjectURL(b);
        Z.debug(imgUrl);
        widgetEl.find('#preview-image').attr('src', imgUrl);
        window.fileData = fileData;
    }).catch(Zotero.catchPromiseError);
    
};

//Zotero.ui.widgets.imageGrabber.
