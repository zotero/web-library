'use strict';

var log = require('../Log.js').Logger('zotero-web-library:readstate');

var ui = {};
/**
 * get a list of the itemKeys for items checked off in a form to know what items to operate on
 * if a single item is being displayed the form selections will be overridden
 * otherwise this function returns the data-itemkey values associated with input.itemKey-checkbox:checked
 * @param  {DOM element} container Container DOM Element to pull itemkey values from
 * @return {array}
 */
ui.getSelectedItemKeys = function(container){
    log.debug("ui.getSelectedItemKeys", 3);
    if(!container){
        container = J("body");
    }
    else {
        container = J(container);
    }
    var itemKeys = [];
    var curItemKey = Zotero.state.getUrlVar('itemKey');
    if(curItemKey && (Zotero.config.preferUrlItem !== false) ){
        itemKeys.push(curItemKey);
    }
    else{
        container.find("input.itemKey-checkbox:checked").each(function(index, val){
            itemKeys.push(J(val).data('itemkey'));
        });
    }
    return itemKeys;
};

ui.getAllFormItemKeys = function(container){
    log.debug("ui.getAllFormItemKeys", 3);
    if(!container){
        container = J("body");
    }
    else {
        container = J(container);
    }
    var itemKeys = [];
    var curItemKey = Zotero.state.getUrlVar('itemKey');
    container.find("input.itemKey-checkbox").each(function(index, val){
        itemKeys.push(J(val).data('itemkey'));
    });
    return itemKeys;
};

ui.getRte = function(el){
    log.debug("getRte", 3);
    log.debug("getRte", 3);
    log.debug(el);
    switch(Zotero.config.rte){
        case "ckeditor":
            //var elid = "#" + el;
            //var edname = J(elid).attr('id');
            //log.debug("EdName: " + edname, 3);
            return CKEDITOR.instances[el].getData();
        default:
            return tinyMCE.get(el).getContent();
    }
};

ui.updateRte = function(el){
    log.debug("updateRte", 3);
    switch(Zotero.config.rte){
        case "ckeditor":
            var elid = "#" + el;
            var data = CKEDITOR.instances[el].getData();
            J(elid).val(data);
            break;
        default:
            tinyMCE.updateContent(el);
    }
};

ui.deactivateRte = function(el){
    log.debug("deactivateRte", 3);
    switch(Zotero.config.rte){
        case "ckeditor":
            //var elid = "#" + el;
            if(CKEDITOR.instances[el]){
                log.debug("deactivating " + el, 3);
                var data = CKEDITOR.instances[el].destroy();
            }
            break;
        default:
            tinymce.execCommand('mceRemoveControl', true, el);
    }
};

ui.cleanUpRte = function(container){
    log.debug("cleanUpRte", 3);
    J(container).find("textarea.rte").each(function(ind, el){
        ui.deactivateRte(J(el).attr('name') );
    });
};
