Zotero.ui.widgets.uploadDialog = {};

Zotero.ui.widgets.uploadDialog.init = function(el){
    Z.debug("uploaddialog widget init", 3);
    var widgetEl = J(el);
    var library = Zotero.ui.getAssociatedLibrary(el);
    
    library.listen("uploadAttachment", Zotero.ui.widgets.uploadDialog.show, {widgetEl: el, library: library});
    library.listen("upload", Zotero.ui.widgets.uploadDialog.upload, {widgetEl: el, library: library});
    
    widgetEl.on('click', '.uploadButton', library.trigger('upload'));
};

Zotero.ui.widgets.uploadDialog.show = function(e){
    Z.debug("uploadDialog.show", 3);
    
    var triggeringEl = J(e.triggeringElement);
    var library = Zotero.ui.getEventLibrary(e);
    var widgetEl = J(e.data['widgetEl']).empty();
    
    widgetEl.html( J("#attachmentuploadTemplate").render({}) );
    var dialogEl = widgetEl.find(".upload-attachment-dialog");
    
    Zotero.ui.dialog(dialogEl, {});
    
    var handleFiles = function(files){
        Z.debug("attachmentUpload handleFiles", 3);
        
        if(typeof files == 'undefined' || files.length === 0){
            return false;
        }
        var file = files[0];
        
        Zotero.file.getFileInfo(file)
        .then(function(fileInfo){
            widgetEl.find(".attachmentuploadfileinfo").data('fileInfo', fileInfo);
            widgetEl.find("input.upload-file-title-input").val(fileInfo.filename);
            widgetEl.find("td.uploadfilesize").html(fileInfo.filesize);
            widgetEl.find("td.uploadfiletype").html(fileInfo.contentType);
            //widgetEl.find("#attachmentuploadfileinfo .uploadfilemd5").html(fileInfo.md5);
            widgetEl.find(".droppedfilename").html(fileInfo.filename);
        });
        return;
    };
    
    dialogEl.find("#fileuploaddroptarget").on('dragenter dragover', function(e){
        e.stopPropagation();
        e.preventDefault();
    });
    
    dialogEl.find("#fileuploaddroptarget").on('drop', function(je){
        Z.debug("fileuploaddroptarget drop callback", 3);
        je.stopPropagation();
        je.preventDefault();
        //clear file input so drag/drop and input don't show conflicting information
        widgetEl.find(".fileuploadinput").val('');
        var e = je.originalEvent;
        var dt = e.dataTransfer;
        var files = dt.files;
        handleFiles(files);
    });
    
    dialogEl.find("#fileuploadinput").on('change', function(je){
        Z.debug("fileuploaddroptarget callback 1", 3);
        je.stopPropagation();
        je.preventDefault();
        var files = J(this).get(0).files;
        handleFiles(files);
    });
    
    Zotero.eventful.initTriggers(widgetEl);
};

Zotero.ui.widgets.uploadDialog.upload = function(evt){
    Z.debug("uploadFunction", 3);
    var widgetEl = J(evt.data['widgetEl']);
    var library = evt.data['library'];
    
    //callback for when everything in the upload form is filled
    //grab file blob
    //grab file data given by user
    //create or modify attachment item
    //Item.uploadExistingFile or uploadChildAttachment
    
    var dialogEl = widgetEl.find('div.upload-attachment-dialog');
    var fileInfo = dialogEl.find("#attachmentuploadfileinfo").data('fileInfo');
    var specifiedTitle = dialogEl.find("#upload-file-title-input").val();
    
    var progressCallback = function(e){
        Z.debug('fullUpload.upload.onprogress', 3);
        var percentLoaded = Math.round((e.loaded / e.total) * 100);
        Z.debug("Upload progress event:" + e.loaded + " / " + e.total + " : " + percentLoaded + "%", 3);
        widgetEl.find("#uploadprogressmeter").val(percentLoaded);
    };
    
    //show spinner while working on upload
    Zotero.ui.showSpinner(widgetEl.find('.fileuploadspinner'));
    
    //upload new copy of file if we're modifying an attachment
    //create child and upload file if we're modifying a top level item
    var itemKey = Zotero.state.getUrlVar('itemKey');
    var item = library.items.getItem(itemKey);
    var uploadPromise;
    
    if(!item.get("parentItem")){
        Z.debug("no parentItem", 3);
        //get template item
        var childItem = new Zotero.Item();
        childItem.associateWithLibrary(library);
        uploadPromise = childItem.initEmpty('attachment', 'imported_file')
        .then(function(childItem){
            Z.debug("templateItemDeferred callback", 3);
            childItem.set('title', specifiedTitle);
            
            return item.uploadChildAttachment(childItem, fileInfo, progressCallback);
        });
    }
    else if(item.get('itemType') == 'attachment' && item.get("linkMode") == 'imported_file') {
        Z.debug("imported_file attachment", 3);
        uploadPromise = item.uploadFile(fileInfo, progressCallback);
    }
    
    uploadPromise.then(function(){
        Z.debug("uploadSuccess", 3);
        library.trigger("uploadSuccessful");
    }).catch(Zotero.ui.widgets.uploadDialog.failureHandler)
    .then(function(){
        Zotero.ui.closeDialog(dialogEl);
    });

};

Zotero.ui.widgets.uploadDialog.failureHandler = function(failure){
    Z.debug("Upload failed", 3);
    Z.debug(failure, 3);
    Zotero.ui.jsNotificationMessage("There was a problem uploading your file.", 'error');
    switch(failure.code){
        case 400:
            Zotero.ui.jsNotificationMessage("Bad Input. 400", 'error');
            break;
        case 403:
            Zotero.ui.jsNotificationMessage("You do not have permission to edit files", 'error');
            break;
        case 409:
            Zotero.ui.jsNotificationMessage("The library is currently locked. Please try again in a few minutes.", 'error');
            break;
        case 412:
            Zotero.ui.jsNotificationMessage("File conflict. Remote file has changed", 'error');
            break;
        case 413:
            Zotero.ui.jsNotificationMessage("Requested upload would exceed storage quota.", 'error');
            break;
        case 428:
            Zotero.ui.jsNotificationMessage("Precondition required error", 'error');
            break;
        case 429:
            Zotero.ui.jsNotificationMessage("Too many uploads pending. Please try again in a few minutes", 'error');
            break;
        default:
            Zotero.ui.jsNotificationMessage("Unknown error uploading file. " + failure.code, 'error');
    }
};
