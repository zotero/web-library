web-library
===========

This is zotero.org's web library capable of being installed/run on other websites for a single Zotero library (that is, one user library or one group library).

It is currently limited to the javascript interface. That is the interface most users should see and use, as much of the functionality is unavailable otherwise. Google at a minimum also appears to index the pages after javascript has been executed. Therefore, static pages may not provide much benefit and necessitate significantly longer page loads. Fallback static pages would still be desirable but are not a high priority.

The Zotero API now supports [CORS requests](http://enable-cors.org/). Using a PHP proxy to forward requests to the API is only necessary if you need to hide the credentials being used to access the Zotero library. Otherwise a browser only needs to talk to your server for the initial page load.


Installation
------------

1. Clone git repository into target web directory (`git clone --recursive https://github.com/zotero/web-library.git`)
2. run `npm install` to install dev dependencies
3. Check out the full library example by generating a config file (examples/reactlibrary/buildconfig.js)
4. Point browser to the base directory of the example (examples/library/ for the full library)
5. to build changes (including compiling bootstrap less style), run `npm build`. For a development build with automatic incremental build on change, use `npm start`.  

Note that this web application must be run from a web server and accessed via `http(s)` because of the limitations of web pages accessed via the `file://` scheme. An Apache .htaccess file is included in that directory that will rewrite urls so that the html history API still works when reloading deeper urls. This would have to be done in different ways on other servers, but only affects reloading the library. The library loaded from the original page should work regardless.

Requirements
------------
* htaccess with rewrite allowed (For pointing to index.php from any urls in the directory. Without this, reloading or linking to a page other than the base library, eg /baselibrary/itemKey/ASDF1234 will fail)
* a relatively modern browser
