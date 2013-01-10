
/**
 * get a list of the itemKeys for items checked off in a form to know what items to operate on
 * if a single item is being displayed the form selections will be overridden
 * otherwise this function returns the data-itemkey values associated with input.itemKey-checkbox:checked
 * @param  {Form element} form Form DOM Element to pull itemkey values from
 * @return {array}
 */
Zotero.ui.getSelectedItemKeys = function(form){
    Z.debug("Zotero.ui.getSelectedItemKeys", 3);
    var itemKeys = [];
    var curItemKey = Zotero.nav.getUrlVar('itemKey');
    if(curItemKey){
        itemKeys.push(curItemKey);
    }
    else{
        if(J(form).length){
            J(form).find("input.itemKey-checkbox:checked").each(function(index, val){
                itemKeys.push(J(val).data('itemkey'));
            });
        }
        else {
            J("input.itemKey-checkbox:checked").each(function(index, val){
                itemKeys.push(J(val).data('itemkey'));
            });
        }
    }
    return itemKeys;
};

Zotero.ui.getAllFormItemKeys = function(form){
    Z.debug("Zotero.ui.getSelectedItemKeys", 3);
    var itemKeys = [];
    var curItemKey = Zotero.nav.getUrlVar('itemKey');
    if(curItemKey){
        itemKeys.push(curItemKey);
    }
    else{
        J(form).find("input.itemKey-checkbox").each(function(index, val){
            itemKeys.push(J(val).data('itemkey'));
        });
    }
    return itemKeys;
};
