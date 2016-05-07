'use strict';

var log = require('../../library/libZoteroJS/src/Log.js').Logger('zotero-web-library:format');

var format = {};

/**
 * Format an item field for display
 * @param  {string} field item field name
 * @param  {Zotero_Item} item  Zotero Item
 * @param  {boolean} trim  Trim output to limit length
 * @return {string}
 */
format.itemField = function(field, item, trim){
    if(typeof trim == 'undefined'){
        trim = false;
    }
    var intlOptions = {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: false
    };

    var formatDate;
    if(window.Intl) {
        var dateFormatter = new window.Intl.DateTimeFormat(undefined, intlOptions);
        formatDate = dateFormatter.format;
    } else {
        formatDate = function(date) {
            return date.toLocaleString();
        };
    }

    var trimLength = 0;
    var formattedString = '';
    var date;
    if(Zotero.config.maxFieldSummaryLength[field]){
        trimLength = Zotero.config.maxFieldSummaryLength[field];
    }
    switch(field){
        case 'itemType':
            formattedString = Zotero.localizations.typeMap[item.apiObj.data.itemType];
            break;
        case 'dateModified':
            if(!item.apiObj.data['dateModified']){
                formattedString = '';
            }
            date = Zotero.utils.parseApiDate(item.apiObj.data['dateModified']);
            if(date){
                formattedString = formatDate(date);
            }
            else{
                formattedString = item.apiObj.data['dateModified'];
            }
            break;
        case 'dateAdded':
            if(!item.apiObj.data['dateAdded']){
                formattedString = '';
            }
            date = Zotero.utils.parseApiDate(item.apiObj.data['dateAdded']);
            if(date){
                formattedString = formatDate(date);
            }
            else{
                formattedString = item.apiObj.data['dateAdded'];
            }
            break;
        case 'title':
            formattedString = item.get('title');
            break;
        case 'creator':
        case 'creatorSummary':
            formattedString = item.get('creatorSummary');
            break;
        case 'addedBy':
            if(item.apiObj.meta.createdByUser){
                if(item.apiObj.meta.createdByUser.name !== '') {
                    formattedString = item.apiObj.meta.createdByUser.name;
                }
                else {
                    formattedString = item.apiObj.meta.createdByUser.username;
                }
            }
            break;
        case 'modifiedBy':
            if(item.apiObj.meta.lastModifiedByUser){
                if(item.apiObj.meta.lastModifiedByUser.name !== ''){
                    formattedString = item.apiObj.meta.lastModifiedByUser.name;
                }
                else {
                    formattedString = item.apiObj.meta.lastModifiedByUser.username;
                }
            }
            break;
        default:
            let fv = item.get(field);
            if(fv !== null && fv !== undefined) {
                formattedString = fv;
            }
    }
    if(typeof formattedString == 'undefined'){
        log.error('formattedString for ' + field + ' undefined');
        log.error(item);
    }
    if(trim) {
        return format.trimString(formattedString, trimLength);
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
format.trimString = function(s, maxlen){
    var trimLength = 35;
    var formattedString = s;
    if(typeof s == 'undefined'){
        log.error('formattedString passed to trimString was undefined.');
        return '';
    }
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
format.itemDateField = function(field, item){
    var date;
    var timeOptions = {
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: false
    };
    var intlOptions = {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: false
    };
    
    var formatDate;
    var formatTime;
    if(window.Intl) {
        var dateFormatter = new window.Intl.DateTimeFormat(undefined, intlOptions);
        formatDate = dateFormatter.format;
        var timeFormatter = new window.Intl.DateTimeFormat(undefined, timeOptions);
        formatTime = timeFormatter.format;
    } else {
        formatDate = function(date) {
            return date.toLocaleDateString();
        };
        formatTime = function(date) {
            return date.toLocaleTimeString();
        };
    }

    switch(field){
        case 'dateModified':
            if(!item.apiObj.data['dateModified']){
                return '';
            }
            date = Zotero.utils.parseApiDate(item.apiObj.data['dateModified']);
            if(date){
                return "<span class='localized-date-span'>" + formatDate(date) + "</span> <span class='localized-date-span'>" + formatTime(date) + '</span>';
            }
            else{
                return item.apiObj.data['dateModified'];
            }
            return date.toLocaleString();
        case 'dateAdded':
            if(!item.apiObj.data['dateAdded']){
                return '';
            }
            date = Zotero.utils.parseApiDate(item.apiObj.data['dateAdded']);
            if(date){
                return "<span class='localized-date-span'>" + formatDate(date) + "</span> <span class='localized-date-span'>" + formatTime(date) + '</span>';
            }
            else{
                return item.apiObj.data['dateAdded'];
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
format.itemContentRow = function(contentRow){
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

format.groupUrl = function(group, route){
    var groupBase;
    if(group.groupType == 'Private'){
        groupBase = '/groups/' + group.groupID;
    }
    else{
        groupBase = '/groups/' + Zotero.utils.slugify(group.groupName);
    }
    var groupIDBase = '/groups/' + group.groupID;
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

module.exports = format;
