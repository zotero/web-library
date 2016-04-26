'use strict';

var log = require('../Log.js').Logger('zotero-web-library:ZoteroItemUpdated');

/**
 * Trigger a ZoteroItemUpdated event on the document for zotero translators
 * @return {undefined}
 */
var ZoteroItemUpdated = function(){
    try{
        //trigger event for Zotero translator detection
        var ev = document.createEvent('HTMLEvents');
        ev.initEvent('ZoteroItemUpdated', true, true);
        document.dispatchEvent(ev);
    }
    catch(e){
        log.error('Error triggering ZoteroItemUpdated event');
    }
};

module.exports = ZoteroItemUpdated;
