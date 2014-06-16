
Zotero.url.itemIsSnapshot = function(item){
    if(item.apiObj.links['enclosure']){
        var ftype = item.apiObj.links['enclosure'].type;
        if(!item.apiObj.links['enclosure']['length'] && ftype == 'text/html'){
            return true;
        }
    }
    return false;
};
/*
Zotero.url.itemHref = function(item){
    var href = '';
    var library = item.owningLibrary;
    href += library.libraryBaseWebsiteUrl + '/itemKey/' + item.itemKey;
    return href;
};
*/
Zotero.url.attachmentDownloadLink = function(item){
    var linkString = '';
    var enctype, enc, filesize, filesizeString;
    var downloadHref = Zotero.url.attachmentDownloadUrl(item);
    if(item.apiObj.links['enclosure']){
        if(Zotero.url.itemIsSnapshot(item)) {
            //snapshot: redirect to view
            retString += '<a href="' + downloadUrl + '">' + 'View Snapshot</a>';
        }
        else{
            //file: offer download
            enctype = Zotero.utils.translateMimeType(item.apiObj.links['enclosure'].type);
            enc = item.apiObj.links['enclosure'];
            filesize = parseInt(enc['length'], 10);
            filesizeString = "" + filesize + " B";
            if(filesize > 1073741824){
                filesizeString = "" + (filesize / 1073741824).toFixed(1) + " GB";
            }
            else if(filesize > 1048576){
                filesizeString = "" + (filesize / 1048576).toFixed(1) + " MB";
            }
            else if(filesize > 1024){
                filesizeString = "" + (filesize / 1024).toFixed(1) + " KB";
            }
            Z.debug(enctype);
            linkString += '<a href="' + downloadHref + '">';
            
            if((enctype == 'undefined') || (enctype === '') || (typeof enctype == 'undefined')){
                linkString += filesizeString + '</a>';
            }
            else{
                linkString += enctype + ', ' + filesizeString + '</a>';
            }
            
            return linkString;
        }
    }
    return linkString;
};

Zotero.url.attachmentDownloadUrl = function(item){
    var retString = '';
    if(item.apiObj.links['enclosure']){
        if(Zotero.config.directDownloads){
            return Zotero.url.apiDownloadUrl(item);
        }
        else {
            return Zotero.url.wwwDownloadUrl(item);
        }
    }
    else if(item.linkMode == 2 || item.linkMode == 3){
        if(item.apiObj['url']){
            retString = item.apiObj['url'];
        }
    }
    return retString;
};

Zotero.url.wwwDownloadUrl = function(item){
    var urlString = '';
    if(item.apiObj.links['enclosure']){
        if(Zotero.config.proxyDownloads){
            return Zotero.config.baseDownloadUrl + "?itemkey=" + item.itemKey;
        }
        
        if(Zotero.config.directDownloads){
            return Zotero.url.apiDownloadUrl(item);
        }
        
        urlString = Zotero.config.baseWebsiteUrl + Zotero.config.nonparsedBaseUrl + '/' + item.itemKey + '/file';
        if(Zotero.url.itemIsSnapshot(item)){
            //snapshot: redirect to view
            urlString += '/viewsnapshot';
        }else {
            urlString += '/view';
        }
    }
    else if(item.linkMode == 2 || item.linkMode == 3){
        if(item.apiObj['url']){
            urlString = item.apiObj['url'];
        }
    }
    return urlString;
};

Zotero.url.apiDownloadUrl = function(item){
    var retString = '';
    if(item.apiObj.links['enclosure']){
        retString = item.apiObj.links['enclosure']['href'];
    }
    else if(item.linkMode == 2 || item.linkMode == 3){
        if(item.apiObj['url']){
            retString = item.apiObj['url'];
        }
    }
    return retString;
};

Zotero.url.attachmentFileDetails = function(item){
    //file: offer download
    if(!item.apiObj.links['enclosure']) return '';
    var enctype = Zotero.utils.translateMimeType(item.apiObj.links['enclosure'].type);
    var enc = item.apiObj.links['enclosure'];
    var filesizeString = '';
    if(enc['length']){
        var filesize = parseInt(enc['length'], 10);
        filesizeString = "" + filesize + " B";
        if(filesize > 1073741824){
            filesizeString = "" + (filesize / 1073741824).toFixed(1) + " GB";
        }
        else if(filesize > 1048576){
            filesizeString = "" + (filesize / 1048576).toFixed(1) + " MB";
        }
        else if(filesize > 1024){
            filesizeString = "" + (filesize / 1024).toFixed(1) + " KB";
        }
        if((enctype == 'undefined') || (enctype === '') || (typeof enctype == 'undefined')){
            return '(' + filesizeString + ')';
        }
        else{
            return '(' + enctype + ', ' + filesizeString + ')';
        }
    }
    else {
        return '(' + enctype + ')';
    }
};

Zotero.url.exportUrls = function(config){
    Z.debug("Zotero.url.exportUrls", 3);
    var exportUrls = {};
    var exportConfig = {};
    J.each(Zotero.config.exportFormats, function(index, format){
        exportConfig = J.extend(config, {'format':format});
        exportUrls[format] = Zotero.ajax.apiRequestUrl(exportConfig) + Zotero.ajax.apiQueryString({format:format, limit:'25'});
    });
    Z.debug(exportUrls);
    return exportUrls;
};

Zotero.url.snapshotViewLink = function(item){
    return Zotero.ajax.apiRequestUrl({
        'target':'item',
        'targetModifier':'viewsnapshot',
        'libraryType': item.owningLibrary.libraryType,
        'libraryID': item.owningLibrary.libraryID,
        'itemKey': item.itemKey
    });
};

Zotero.url.requestReadApiKeyUrl = function(libraryType, libraryID, redirect){
    var apiKeyBase = Zotero.config.baseWebsiteUrl + '/settings/keys/new';
    apiKeyBase.replace('http', 'https');
    var qparams = {'name': 'Private Feed'};
    if(libraryType == 'group'){
        qparams['library_access'] = 0;
        qparams['group_' + libraryID] = 'read';
        qparams['redirect'] = redirect;
    }
    else if(libraryType == 'user'){
        qparams['library_access'] = 1;
        qparams['notes_access'] = 1;
        qparams['redirect'] = redirect;
    }
    
    queryParamsArray = [];
    J.each(qparams, function(index, value){
        queryParamsArray.push(encodeURIComponent(index) + '=' + encodeURIComponent(value));
    });
    
    //build query string by concatenating array
    queryString = '?' + queryParamsArray.join('&');
    
    return apiKeyBase + queryString;
};

Zotero.url.groupViewUrl = function(group){
    if(group.get("type") == "Private"){
        return Zotero.config.baseWebsiteUrl + "/groups/" + group.get("groupID");
    }
    else {
        return Zotero.config.baseWebsiteUrl + "/groups/" + Zotero.utils.slugify(group.get("name"));
    }
};

Zotero.url.groupLibraryUrl = function(group){
    if(group.get("type") == "Private"){
        return Zotero.config.baseWebsiteUrl + "/groups/" + group.get("groupID") + "/items";
    }
    else {
        return Zotero.config.baseWebsiteUrl + "/groups/" + Zotero.utils.slugify(group.get("name")) + "/items";
    }
};

Zotero.url.groupSettingsUrl = function(group){
    return Zotero.config.baseWebsiteUrl + "/groups/" + group.get("groupID") + "/settings";
};

Zotero.url.groupMemberSettingsUrl = function(group){
    return Zotero.config.baseWebsiteUrl + "/groups/" + group.get("groupID") + "/settings/members";
};

Zotero.url.groupLibrarySettingsUrl = function(group){
    return Zotero.config.baseWebsiteUrl + "/groups/" + group.get("groupID") + "/settings/library";
};

