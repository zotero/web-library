/**
 * compatibility function between jqueryUI and jqueryMobile dialog functions
 * @param  {DOMNode} el      Dom element that will become the dialog
 * @param  {object} options Options object passed to either jqueryUI or jqueryMobile
 * @return {undefined}
 */
Zotero.ui.dialog = function(el, options){
    Z.debug("Zotero.ui.dialog", 3);
    //J(el).dialog(options);
    J(el).modal(options);
    Z.debug("exiting Zotero.ui.dialog", 3);
};

/**
 * compatibility function between jqueryUI and jqueryMobile to close a dialog
 * @param  {Dom Element} el Dialog element
 * @return {undefined}
 */
Zotero.ui.closeDialog = function(el){
    J(el).dialog('close');
};
