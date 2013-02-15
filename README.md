www-library
===========

This is zotero.org's web library capable of being installed/run on other websites for a single Zotero library (that is, one user library or one group library).

It is currently limitted to the javascript interface. That is the interface most users should see and use, as much of the functionality is unavailable otherwise, but content is unlikely to be properly crawled by search engines until static pages are also supported.

Installation
------------

1. Clone git repository into target web directory
2. Use one of the example library directories and modify config.php and zoteroconfig.js
   Required settings that likely need to be changed in config.php:
   * Everything except $librarySlug and $displayName
   Required settings that likely need to be changed in zoteroconfig.js:
   * baseDownloadUrl (full url path to download.php if proxyDownloads is true)
   * baseUrl (full url path to the install directory)
   * staticPath (full url to static subdirectory of install, or alternate location you move static files to )
   * baseDomain (base domain for install, eg "example.com")
   * proxyPath (full url path to proxyRequest.php)
3. (optional) Move config.php somewhere not publicly accessible (but readable by apache/php), and change the references in library.php, proxyRequest.php and download.php

Requirements
------------
(earlier versions may work but have not been tested)

* PHP 5.3.6
* PHP cURL

Works best with "modern" browsers.
