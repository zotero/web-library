Zotero.url.itemHref = function(item){
    var href = '';
    /*
    J.each(item.links, function(index, link){
        if(link.rel === "alternate"){
            if(link.href){
                href = link.href;
            }
        }
    });
    return href;
    */
    var library = item.owningLibrary;
    href += library.libraryBaseWebsiteUrl + '/itemKey/' + item.itemKey;
    return href;
};

Zotero.url.attachmentDownloadLink = function(item){
    var retString = '';
    if(item.links['enclosure']){
        var tail = item.links['enclosure']['href'].substr(-4, 4);
        if(tail == 'view'){
            //snapshot: redirect to view
            retString += '<a href="' + Zotero.config.baseWebsiteUrl + Zotero.config.nonparsedBaseUrl + '/' + item.itemKey + '/file/view' + '">' + 'View Snapshot</a>';
            
            //retString += '<form style="margin:0;" method="POST" action="' + item.links['enclosure']['href'] + '?key=' + Zotero.config.apiKey + '">(<input type="hidden" name="h" value="1" /><a href="#" onclick="parentNode.submit()">' + item.title + '</a>)</form>';
        }
        else{
            //file: offer download
            var enctype = Zotero.utils.translateMimeType(item.links['enclosure'].type);
            var enc = item.links['enclosure'];
            var filesize = parseInt(enc['length'], 10);
            var filesizeString = "" + filesize + " B";
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
            retString += '<a href="' + Zotero.config.baseWebsiteUrl + Zotero.config.nonparsedBaseUrl + '/' + item.itemKey + '/file' + '">';
            
            if((enctype == 'undefined') || (enctype === '') || (typeof enctype == 'undefined')){
                retString += filesizeString + '</a>';
            }
            else{
                retString += enctype + ', ' + filesizeString + '</a>';
            }
            
            return retString;
        }
    }
    return retString;
};

Zotero.url.attachmentDownloadUrl = function(item){
    var retString = '';
    if(item.links['enclosure']){
        retString = Zotero.config.baseWebsiteUrl + Zotero.config.nonparsedBaseUrl + '/' + item.itemKey + '/file';
        var tail = item.links['enclosure']['href'].substr(-4, 4);
        if(tail == 'view'){
            //snapshot: redirect to view
            retString += '/view';
        }
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
    if(!item.links['enclosure']) return '';
    var enctype = Zotero.utils.translateMimeType(item.links['enclosure'].type);
    var enc = item.links['enclosure'];
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
    Z.debug("Zotero.url.exportUrls");
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
        qparams['keyredirect'] = redirect;
    }
    
    queryParamsArray = [];
    J.each(qparams, function(index, value){
        queryParamsArray.push(encodeURIComponent(index) + '=' + encodeURIComponent(value));
    });
    
    //build query string by concatenating array
    queryString = '?' + queryParamsArray.join('&');
    
    return apiKeyBase + queryString;
};
