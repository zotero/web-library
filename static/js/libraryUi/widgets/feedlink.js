Zotero.ui.widgets.feedlink = {};

Zotero.ui.widgets.feedlink.init = function(el){
    Zotero.ui.eventful.listen("displayedItemsChanged", Zotero.ui.widgets.feedlink.recalcFeedlink, {widgetEl: el});
};

Zotero.ui.widgets.feedlink.recalcFeedlink = function(evt){
    Z.debug('Zotero eventful loadFeedLinkCallback', 3);
    var widgetEl = J(evt.data.widgetEl);
    
    var library = Zotero.ui.getAssociatedLibrary(widgetEl);
    var urlconfig = Zotero.ui.getItemsConfig(library);
    var requestUrl = Zotero.ajax.apiRequestUrl(urlconfig) + Zotero.ajax.apiQueryString(urlconfig, false);
    var feedUrl = requestUrl.replace(Zotero.config.baseApiUrl, Zotero.config.baseFeedUrl);
    var newkeyurl = Zotero.url.requestReadApiKeyUrl(library.libraryType, library.libraryID, feedUrl);
    //save urlconfig on feed element for use in callbacks
    widgetEl.data('urlconfig', urlconfig);
    
    //feed link to either create a new key for private feeds or a public feed url
    if((library.libraryType == 'user' && zoteroData.libraryPublish === 0) || (library.libraryType == 'group' && zoteroData.groupType == 'Private' ) ){
        J(".feed-link").attr('href', newkeyurl);
    }
    else{
        J(".feed-link").attr('href', feedUrl);
    }
    J("#library link[rel='alternate']").attr('href', feedUrl);
};
