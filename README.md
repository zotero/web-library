Web Library
===========

This is [zotero.org's Web Library](https://www.zotero.org/mylibrary) capable of being installed/run on other websites.

Web Library is a single-page application implemented in Javascript. It uses Zotero API via [CORS requests](http://enable-cors.org/) and requires [keys configured](https://www.zotero.org/settings/keys/new) in order to access private libraries.

Installation
------------

1. Clone git repository into target web directory (`git clone https://github.com/zotero/web-library.git`)
2. Ensure up-to-date version of [Node](https://nodejs.org) is used or run `nvm use` to switch to a preferred version using [nvm](https://github.com/nvm-sh/nvm)
2. Run `npm install` to install dependencies
3. Run development proces: `npm start`
4. Point browser at `http://localhost:8001/` to see the demo
5. Modyfing source files will trigger incremental build

Production-ready version can be built with `npm run build`. 
