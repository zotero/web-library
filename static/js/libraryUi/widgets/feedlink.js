Zotero.ui.widgets.feedlink = {};

Zotero.ui.widgets.feedlink.init = function(el){
    Zotero.ui.eventful.listen("displayedItemsChanged", Zotero.ui.widgets.feedlink.recalcFeedlink, {widgetEl: el});
};

Zotero.ui.widgets.feedlink.recalcFeedlink = function(e){
    Z.debug('Zotero eventful loadFeedLinkCallback', 3);
    var widgetEl = event.data.widgetEl;
    var el = widgetEl;
    
    var jel = J(el);
    
    var library = Zotero.ui.getAssociatedLibrary(el);
    var loadConfig = jel.data('loadconfig');
    library.libraryLabel = decodeURIComponent(loadConfig.libraryLabel);
    
    var effectiveUrlVars = ['itemPage', 'tag', 'collectionKey', 'order', 'sort', 'q'];
    var urlConfigVals = {};
    J.each(effectiveUrlVars, function(index, value){
        var t = Zotero.nav.getUrlVar(value);
        if(t){
            urlConfigVals[value] = t;
        }
    });
    
    var defaultConfig = {target:'items',
                         targetModifier: 'top',
                         itemPage: 1,
                         limit: 25
                     };
    //Build config object that should be displayed next and compare to currently displayed
    var newConfig = J.extend({}, defaultConfig, jel.data('loadconfig'), urlConfigVals);
    newConfig['collectionKey'] = urlConfigVals['collectionKey'];//always override collectionKey, even with absence of collectionKey
    newConfig.start = parseInt(newConfig.limit, 10) * (parseInt(newConfig.itemPage, 10) - 1);
    
    if(!newConfig.sort){
        newConfig.sort = Zotero.config.sortOrdering[newConfig.order];
    }
    
    //don't pass top if we are searching for tags (or query?)
    if(newConfig.tag || newConfig.q){
        delete newConfig.targetModifier;
    }
    
    var urlconfig = J.extend({'target':'items', 'libraryType':library.libraryType, 'libraryID':library.libraryID}, newConfig);
    var requestUrl = Zotero.ajax.apiRequestUrl(urlconfig) + Zotero.ajax.apiQueryString(urlconfig, false);
    var feedUrl = requestUrl.replace(Zotero.config.baseApiUrl, Zotero.config.baseFeedUrl);
    var newkeyurl = Zotero.url.requestReadApiKeyUrl(library.libraryType, library.libraryID, feedUrl);
    //save urlconfig on feed element for use in callbacks
    jel.data('urlconfig', urlconfig);
    
    //feed link to either create a new key for private feeds or a public feed url
    if((library.libraryType == 'user' && zoteroData.libraryPublish === 0) || (library.libraryType == 'group' && zoteroData.groupType == 'Private' ) ){
        J(".feed-link").attr('href', newkeyurl);
    }
    else{
        J(".feed-link").attr('href', feedUrl);
    }
    J("#library link[rel='alternate']").attr('href', feedUrl);
    
    //get list of export urls and link them
    var exportUrls = Zotero.url.exportUrls(urlconfig);
    J("#export-list").empty().append(J("#exportformatsTemplate").tmpl({exportUrls:exportUrls}));
    J("#export-list").data('urlconfig', urlconfig);
    //hide export list until requested
    J("#export-list").hide();

};
