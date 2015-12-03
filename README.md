web-library
===========

This is zotero.org's web library capable of being installed/run on other websites for a single Zotero library (that is, one user library or one group library).

It is currently limited to the javascript interface. That is the interface most users should see and use, as much of the functionality is unavailable otherwise. Google at a minimum also appears to index the pages after javascript has been executed. Static pages may not, therefore, provide much benefit, and necessitate significantly longer page loads as the api is queried on the server while a browser sees nothing. Fallback static pages would still be desirable, but are not a high priority.

The Zotero API now supports [CORS requests](http://enable-cors.org/) so using a PHP proxy to forward requests to the API is only necessary if you need to hide the credentials being used to access the Zotero library. Otherwise a browser only needs to talk to your server for the initial page load.


Installation
------------

1. Clone git repository into target web directory (git clone --recursive https://github.com/zotero/web-library.git)
2. Try out the full library example by generating a config file (examples/reactlibrary/buildconfig.js)
3. Point browser at the base directory for the example (examples/reactlibrary/ for the full library)

Note that to work fully this must be run from a web server because of the limitations on web pages loaded locally. An Apache .htaccess file is included in that directory that will rewrite urls so that the html history api used still works when reloading deeper urls. This would have to be done in different ways on other servers, but only affects reloading the library. The library loaded from the original page should work regardless.

Requirements
------------
(earlier versions may work but have not been tested)

* htaccess with rewrite allowed (For pointing to index.php from any urls in the directory. Without this, reloading or linking to a page other than the base library, eg /baselibrary/itemKey/ASDF1234 will fail)
* a relatively modern browser


Design
------
The Zotero web library has been ported to use React components on top of libZoteroJS (and its light weight event system). State is maintained by a Zotero.State object that optionally stores variables in the url using pushState as well. With pushState enabled back/forward actions trigger events for the variables that have changed so widgets listening know to update.

This design hopefully means that you can take individual widgets and re-use them in other contexts or in modified forms without observing side-effects. 
