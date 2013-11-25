Zotero.ui.widgets.uploadDialog = {};

Zotero.ui.widgets.uploadDialog.init = function(el){
    Z.debug("uploaddialog widget init", 3);
    var library = Zotero.ui.getAssociatedLibrary(el);
    Zotero.ui.eventful.listen("uploadAttachment", Zotero.ui.widgets.uploadDialog.show, {widgetEl: el, library: library});
};

Zotero.ui.widgets.uploadDialog.show = function(e){
    Z.debug("uploadDialog.show", 3);
    
    var triggeringEl = J(e.triggeringElement);
    var library = Zotero.ui.getEventLibrary(e);
    var widgetEl = J(e.data['widgetEl']).empty();
    
    widgetEl.html( J("#attachmentuploadTemplate").render({}) );
    var dialogEl = widgetEl.find(".upload-attachment-dialog");
    
    var uploadFunction = J.proxy(function(){
        Z.debug("uploadFunction", 3);
        //callback for when everything in the upload form is filled
        //grab file blob
        //grab file data given by user
        //create or modify attachment item
        //Item.uploadExistingFile or uploadChildAttachment
        
        var fileInfo = dialogEl.find("#attachmentuploadfileinfo").data('fileInfo');
        var file = dialogEl.find("#attachmentuploadfileinfo").data('file');
        var specifiedTitle = dialogEl.find("#upload-file-title-input").val();
        
        var progressCallback = function(e){
            Z.debug('fullUpload.upload.onprogress');
            var percentLoaded = Math.round((e.loaded / e.total) * 100);
            Z.debug("Upload progress event:" + e.loaded + " / " + e.total + " : " + percentLoaded + "%");
            J("#uploadprogressmeter").val(percentLoaded);
        };
        
        var uploadSuccess = function(){
            Z.debug("uploadSuccess", 3);
            Zotero.ui.closeDialog(J("#upload-attachment-dialog"));
            Zotero.nav.pushState(true);
        };
        
        var uploadFailure = function(failure){
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
            Zotero.ui.closeDialog(J("#upload-attachment-dialog"));
        };
        
        //show spinner while working on upload
        Zotero.ui.showSpinner(J('#fileuploadspinner'));
        
        //upload new copy of file if we're modifying an attachment
        //create child and upload file if we're modifying a top level item
        var itemKey = Zotero.nav.getUrlVar('itemKey');
        var item = library.items.getItem(itemKey);
        
        if(!item.get("parentItem")){
            Z.debug("no parentItem", 3);
            //get template item
            var childItem = new Zotero.Item();
            childItem.associateWithLibrary(library);
            var templateItemDeferred = childItem.initEmpty('attachment', 'imported_file');
            
            templateItemDeferred.done(J.proxy(function(childItem){
                Z.debug("templateItemDeferred callback");
                childItem.set('title', specifiedTitle);
                
                var uploadChildD = item.uploadChildAttachment(childItem, fileInfo, file, progressCallback);
                
                uploadChildD.done(uploadSuccess).fail(uploadFailure);
            }, this) );
        }
        else if(item.get('itemType') == 'attachment' && item.get("linkMode") == 'imported_file') {
            Z.debug("imported_file attachment", 3);
            var uploadD = item.uploadFile(fileInfo, file, progressCallback);
            uploadD.done(uploadSuccess).fail(uploadFailure);
        }
        
    }, this);

    dialogEl.find('.uploadButton').on('click', uploadFunction);
    Zotero.ui.dialog(dialogEl, {});
    
    var handleFiles = function(files){
        Z.debug("attachmentUpload handleFiles", 3);
        
        if(typeof files == 'undefined' || files.length === 0){
            return false;
        }
        var file = files[0];
        J("#attachmentuploadfileinfo").data('file', file);
        
        var fileinfo = Zotero.file.getFileInfo(file, function(fileInfo){
            J("#attachmentuploadfileinfo").data('fileInfo', fileInfo);
            J("#upload-file-title-input").val(fileInfo.filename);
            J("#attachmentuploadfileinfo .uploadfilesize").html(fileInfo.filesize);
            J("#attachmentuploadfileinfo .uploadfiletype").html(fileInfo.contentType);
            //J("#attachmentuploadfileinfo .uploadfilemd5").html(fileInfo.md5);
            J("#droppedfilename").html(fileInfo.filename);
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
        J("#fileuploadinput").val('');
        var e = je.originalEvent;
        var dt = e.dataTransfer;
        var files = dt.files;
        handleFiles(files);
    });
    
    dialogEl.find("#fileuploadinput").on('change', function(je){
        Z.debug("fileuploaddroptarget callback 1");
        je.stopPropagation();
        je.preventDefault();
        var files = J(this).get(0).files;
        handleFiles(files);
    });
    
    return false;
};
