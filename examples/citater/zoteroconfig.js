{
    librarySettings: {
        allowEdit: 1,
        allowUpload: 1,
    },
    baseApiUrl: 'https://apidev.zotero.org',
    baseWebsiteUrl: 'http://localhostroot/web-library/',
    baseFeedUrl: 'https://apidev.zotero.org',
    baseZoteroWebsiteUrl: 'https://www.zotero.org',
    baseDownloadUrl: '/web-library/examples/library/download.php',
    libraryPathString: '/web-library/examples/library',
    directDownloads: false,
    proxyDownloads: true,
    
    staticPath: '/web-library/static',
    staticLoadUrl: window.location.pathname,
    proxyPath: '/web-library/examples/library/proxyRequest.php',
    citationEndpoint: 'http://127.0.0.1:8085',
    ignoreLoggedInStatus: true,
    storePrefsRemote: false,
    proxy: false,
    breadcrumbsBase: [{label:'username', path:'/web-library/examples/library/'}],
    apiKey: 'NiA0ZjtZaAP8S4VGaJsmPW96',
    apiVersion: 2,
    useIndexedDB: true,
    preferUrlItem: false,
    locale: 'en-US',
    cacheStoreType: 'localStorage',
    preloadCachedLibrary: true,
    rte: 'ckeditor',
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
    exportFormatsMap: {
        'bibtex': 'BibTeX',
        'bookmarks': 'Bookmarks',
        'mods': 'MODS',
        'refer': 'Refer/BibIX',
        'rdf_bibliontology': 'Bibliontology RDF',
        'rdf_dc': 'Unqualified Dublin Core RDF',
        'rdf_zotero': 'Zotero RDF',
        'ris': 'RIS',
        'wikipedia': 'Wikipedia Citation Templates',
    },
    defaultApiArgs: {
    'order': 'title',
    'sort': 'asc',
    'limit': 50,
    'start': 0,
    'content':'json',
    'format': 'atom'
    },
    defaultPrefs: {
        server_javascript_enabled: true,
        debug_level: 3,
    } };