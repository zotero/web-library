/*
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
*/
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
        return Zotero.config.baseWebsiteUrl + "/groups/" + group.get("id");
    }
    else {
        return Zotero.config.baseWebsiteUrl + "/groups/" + Zotero.utils.slugify(group.get("name"));
    }
};

Zotero.url.groupLibraryUrl = function(group){
    if(group.get("type") == "Private"){
        return Zotero.config.baseWebsiteUrl + "/groups/" + group.get("id") + "/items";
    }
    else {
        return Zotero.config.baseWebsiteUrl + "/groups/" + Zotero.utils.slugify(group.get("name")) + "/items";
    }
};

Zotero.url.groupSettingsUrl = function(group){
    return Zotero.config.baseWebsiteUrl + "/groups/" + group.get("id") + "/settings";
};

Zotero.url.groupMemberSettingsUrl = function(group){
    return Zotero.config.baseWebsiteUrl + "/groups/" + group.get("id") + "/settings/members";
};

Zotero.url.groupLibrarySettingsUrl = function(group){
    return Zotero.config.baseWebsiteUrl + "/groups/" + group.get("id") + "/settings/library";
};

