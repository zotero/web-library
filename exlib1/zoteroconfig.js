{
    librarySettings: {allowEdit: 0},
    baseApiUrl: 'https://api.zotero.org',
    baseWebsiteUrl: 'https://zotero.org',
    baseFeedUrl: 'https://api.zotero.org',
    baseZoteroWebsiteUrl: 'https://www.zotero.org',
    baseDownloadUrl: 'https://www.zotero.org',
    directDownloads: true,
    
    baseURL: '/www-library',
    staticPath: '/www-library/static',
    baseDomain: 'localhostroot',
    staticLoadUrl: window.location.pathname,
    proxyPath: '/www-library/exlib1/proxyRequest.php',
    ignoreLoggedInStatus: true,
    storePrefsRemote: false,
    proxy: true,
    apiKey: '',
    ajax: 1,
    locale: 'en-US',
    cacheStoreType: 'localStorage',
    mobile:0,
    sortOrdering: {
     'dateAdded': 'desc',
     'dateModified': 'desc',
     'date': 'desc',
     'year': 'desc',
     'accessDate': 'desc',
     'title': 'asc',
     'creator': 'asc'
    },
    defaultSortColumn: 'title',
    defaultSortOrder: 'asc',
    largeFields: {
     'title': 1,
     'abstractNote': 1,
     'extra' : 1
    },
    richTextFields: {
     'note': 1
    },
    maxFieldSummaryLength: {title:60},
    exportFormats: [
    "bibtex",
    "bookmarks",
    "mods",
    "refer",
    "rdf_bibliontology",
    "rdf_dc",
    "rdf_zotero",
    "ris",
    "wikipedia"
    ],
    defaultApiArgs: {
    'order': 'title',
    'sort': 'asc',
    'limit': 50,
    'start': 0,
    'content':'json',
    'format': 'atom'
    } };