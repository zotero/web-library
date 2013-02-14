
/**
 * Format an item field for display
 * @param  {string} field item field name
 * @param  {Zotero_Item} item  Zotero Item
 * @param  {boolean} trim  Trim output to limit length
 * @return {string}
 */
Zotero.ui.formatItemField = function(field, item, trim){
    if(typeof trim == 'undefined'){
        trim = false;
    }
    var trimLength = 0;
    var formattedString = '';
    var date;
    if(Zotero.config.maxFieldSummaryLength[field]){
        trimLength = Zotero.config.maxFieldSummaryLength[field];
    }
    switch(field){
        case "itemType":
            formattedString = Zotero.localizations.typeMap[item['itemType']];
            break;
        case "dateModified":
            if(!item['dateModified']){
                formattedString = '';
            }
            date = Zotero.utils.parseApiDate(item['dateModified']);
            if(date){
                formattedString = Globalize.format(date, 'd') + ' ' + Globalize.format(date, 't');
            }
            else{
                formattedString = item['dateModified'];
            }
            formattedString = date.toLocaleString();
            break;
        case "dateAdded":
            if(!item['dateAdded']){
                formattedString = '';
            }
            date = Zotero.utils.parseApiDate(item['dateAdded']);
            if(date){
                formattedString = Globalize.format(date, 'd') + ' ' + Globalize.format(date, 't');
            }
            else{
                formattedString = item['dateAdded'];
            }
            break;
        case "title":
            formattedString = item.title;
            break;
        case "creator":
            formattedString = item.creatorSummary;
            break;
        case "addedBy":
            formattedString = item.author.name;
            break;
        default:
            if(typeof(item[field]) !== "undefined"){
                formattedString = item[field];
            }
            else if(item.apiObj){
                if(item.apiObj[field]){
                    formattedString = item.apiObj[field];
                }
            }
    }
    if(trim && (trimLength > 0) && (formattedString.length > trimLength) ) {
        return formattedString.slice(0, trimLength) + '…';
    }
    else{
        return formattedString;
    }
};

/**
 * Trim string to specified length and add ellipsis
 * @param  {string} s      string to trim
 * @param  {int} maxlen maximum length to allow for string
 * @return {string}
 */
Zotero.ui.trimString = function(s, maxlen){
    var trimLength = 35;
    var formattedString = s;
    if(maxlen){
        trimLength = maxlen;
    }
    if((trimLength > 0) && (formattedString.length > trimLength) ) {
        return formattedString.slice(0, trimLength) + '…';
    }
    else{
        return formattedString;
    }
};

/**
 * Format a date field from a Zotero Item based on locale
 * @param  {string} field field name to format
 * @param  {Zotero_Item} item  Zotero Item owning the field
 * @return {string}
 */
Zotero.ui.formatItemDateField = function(field, item){
    var date;
    switch(field){
        case "dateModified":
            if(!item['dateModified']){
                return '';
            }
            date = Zotero.utils.parseApiDate(item['dateModified']);
            if(date){
                return "<span class='localized-date-span'>" + Globalize.format(date, 'd') + "</span> <span class='localized-date-span'>" + Globalize.format(date, 't') + "</span>";
            }
            else{
                return item['dateModified'];
            }
            return date.toLocaleString();
        case "dateAdded":
            if(!item['dateAdded']){
                return '';
            }
            date = Zotero.utils.parseApiDate(item['dateAdded']);
            if(date){
                return "<span class='localized-date-span'>" + Globalize.format(date, 'd') + "</span> <span class='localized-date-span'>" + Globalize.format(date, 't') + "</span>";
            }
            else{
                return item['dateAdded'];
            }
            break;
    }
    return '';
};

/**
 * Format a content row from a Zotero Item for display
 * @param  {string} contentRow contenteRow name
 * @return {string}
 */
Zotero.ui.formatItemContentRow = function(contentRow){
    if(contentRow.field == 'date'){
        if(!contentRow.fieldValue){return '';}
        var date = Zotero.utils.parseApiDate(contentRow.value);
        if(!date){
            return contentRow.fieldValue;
        }
        else{
            return date.toLocaleString();
        }
    }
    else{
        return contentRow.fieldValue;
    }
};

Zotero.ui.groupUrl = function(group, route){
    var groupBase;
    if(group.groupType == 'Private'){
        groupBase = '/groups/' + group.groupID;
    }
    else{
        groupBase = '/groups/' + Zotero.utils.slugify(group.groupName);
    }
    var groupIDBase = '/groups/' + group.groupID;
    Zotero.debug("groupBase: " + groupBase);
    switch(route){
        case 'groupView':
            return groupBase;
        case 'groupLibrary':
            return groupBase + '/items';
        case 'groupSettings':
            return groupIDBase + '/settings';
        case 'groupMembers':
            return groupIDBase + '/members';
        case 'groupLibrarySettings':
            return groupIDBase + '/settings/library';
        case 'groupMembersSettings':
            return groupIDBase + '/settings/members';
    }
};
