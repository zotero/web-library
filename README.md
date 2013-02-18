web-library
===========

This is zotero.org's web library capable of being installed/run on other websites for a single Zotero library (that is, one user library or one group library).

It is currently limited to the javascript interface. That is the interface most users should see and use, as much of the functionality is unavailable otherwise, but content is unlikely to be properly crawled by search engines until static pages are also supported.

Installation
------------

1. Clone git repository into target web directory
2. Use one of the example library directories and modify config.php and zoteroconfig.js
   Required settings that likely need to be changed in config.php and zoteroconfig.js:
   * itemsPathString (full url path to the library base, eg "/root/sub/web-library/exlib1" or "/root/sub/web-library/exlib1/library.php")
   * staticPath (full url path to static subdirectory of install, or alternate location you move static files to, eg "/root/sub/web-library/static")
   * proxyPath (full url path to proxyRequest.php, eg "/root/sub/web-library/exlib1/proxyRequest.php")
   * baseDownloadUrl (full url path to download.php if proxyDownloads is true, eg "/root/sub/web-library/exlib1/download.php")
3. (optional) Move config.php somewhere not publicly accessible (but readable by apache/php), and change the references in library.php, proxyRequest.php and download.php
4. Point browser at the directory containing index.php and library.php (exlib1)

Requirements
------------
(earlier versions may work but have not been tested)

* PHP 5.3.6
* PHP cURL
* htaccess with rewrite allowed (For pointing to index.php from any urls in the directory. Without this, reloading or linking to a page other than the base library, eg /baselibrary/itemKey/ASDF1234 will fail)

Works best with "modern" browsers.
