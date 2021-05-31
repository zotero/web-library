Web Library
===========

This is [zotero.org's Web Library](https://www.zotero.org/mylibrary) capable of being installed/run on other websites.

Web Library is a single-page application implemented in Javascript. It uses Zotero API via [CORS requests](http://enable-cors.org/) and requires [keys configured](https://www.zotero.org/settings/keys/new) in order to access private libraries.

Installation
------------

1. Clone git repository into target web directory (`git clone https://github.com/zotero/web-library.git`)
2. run `npm install` to install dev dependencies
3. Try out the full library example by running `npm start`
4. Point browser at `http://localhost:8001/` to see the demo

NOTE: Edit the API key in `src/html/index.html` before you start the app. You can find your user id and generate a key here: https://www.zotero.org/settings/keys

To build changes (including compiling bootstrap less style) run `npm build`. For a development build with automatic incremental build on change, use `npm start`.
