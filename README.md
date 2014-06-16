web-library
===========

This is zotero.org's web library capable of being installed/run on other websites for a single Zotero library (that is, one user library or one group library).

It is currently limited to the javascript interface. That is the interface most users should see and use, as much of the functionality is unavailable otherwise. Google at a minimum also appears to index the pages after javascript has been executed. Static pages may not, therefore, provide much benefit, and necessitate significantly longer page loads as the api is queried on the server while a browser sees nothing. Fallback static pages would still be desirable, but are not a high priority.

The Zotero API now supports [CORS requests](http://enable-cors.org/) so using a PHP proxy to forward requests to the API is only necessary if you need to hide the credentials being used to access the Zotero library. Otherwise a browser only needs to talk to your server for the initial page load.


Installation
------------

1. Clone git repository into target web directory
2. To try out one of the examples, modify the config.php and zoteroconfig.js files inside the example's directory.
   A full example library as used by zotero.org is in the examples/library directory.
   Required settings that likely need to be changed in config.php and zoteroconfig.js:
   * libraryType (user or group)
   * libraryID (numerican ID for the library. Either userID as noted on https://www.zotero.org/settings/keys or a group ID)
   * apiKey (a valid key obtained from https://www.zotero.org/settings/keys unless the library is public)
   
   * libraryPathString (full url path to the library base, eg "/root/sub/web-library/examples/library" or "/root/sub/web-library/examples/library/library.php")
   * staticPath (full url path to static subdirectory of install, or alternate location you move static files to, eg "/root/sub/web-library/static")
   * baseDownloadUrl (full url path to download.php if proxyDownloads is true, eg "/root/sub/web-library/examples/library/download.php")
3. (optional) Move config.php somewhere not publicly accessible (but readable by apache/php), and change the references in library.php, proxyRequest.php and download.php
4. Point browser at the base directory for the example (examples/library/ for the full library)

Requirements
------------
(earlier versions may work but have not been tested)

* htaccess with rewrite allowed (For pointing to index.php from any urls in the directory. Without this, reloading or linking to a page other than the base library, eg /baselibrary/itemKey/ASDF1234 will fail)
* PHP 5.3.6
* a relatively modern browser

For proxying requests:
* PHP cURL
* PHP proxying only works if your PHP installation supports the apache_request_headers function http://www.php.net/manual/en/function.apache-request-headers.php
* Response caching uses PHP's APC http://php.net/manual/en/book.apc.php



Design
------
The Zotero web library is built on top of libZotero as a group of relatively independent widgets. They interact by listening to and triggering events (with optional filters) on the Zotero object or individual Zotero.Library objects. State is maintained by a Zotero.State object that optionally stores variables in the url using pushState as well. With pushState enabled back/forward actions trigger events for the variables that have changed so widgets listening know to update.

This design hopefully means that you can take individual widgets and re-use them in other contexts or in modified forms without observing side-effects. 
