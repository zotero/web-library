Web Library
===========

This is [zotero.org's Web Library](https://www.zotero.org/mylibrary) capable of being installed/run on other websites.

Web Library is a single-page application implemented in Javascript. It uses Zotero API via [CORS requests](http://enable-cors.org/) and requires [keys configured](https://www.zotero.org/settings/keys/new) in order to access private libraries.

Installation
------------

1. Clone git repository into target web directory (`git clone --recursive https://github.com/zotero/web-library.git`)
2. Ensure up-to-date version of [Node](https://nodejs.org) is used. It should be possible to build Web Library with any recent version of Node, see `.nvmrc` for recommended version of Node (usually current LTS). On systems where [nvm](https://github.com/nvm-sh/nvm) is available it's possible to use `nvm install` and `nvm use` to install and switch to a preferred version of node.
3. Run `npm install` to install dependencies
4. Tweak configuration in `src/html/index.html` and/or `src/html/embedded.html`. Default configuration displays a public library in read-only mode. In order to edit a library, change `userId` and provide `apiKey`.
5. Run development proces: `npm start`
6. Point browser at `http://localhost:8001/` to see the demo
7. Modyfing source files will trigger incremental build

Production-ready version can be built with `npm run build` and served with `npm run serve`.

Configuration
----------------------
Web Library reads configuration from a DOM node with ID `zotero-web-library-config`. See example config in `src/html/index.html`. To access private libraries, `userId` and `apiKey` must be provided. It's also possible to configure Web Library to only display public libraries, in which case `libraries` object must be populated and it must include value for `defaultLibraryKey` as well as `includeMyLibrary` set to `false`.


Build targets
-------------
There are two build targets controlled by `TARGET` environment variable: `zotero` and `embedded`. Former produces a single-page app as seen on zotero.org, latter produces a web-library widget that can be embedded on other pages. Embedded build is currently considered experimental. It's also possible to build both variants using `TARGET` set to `all` (default behaviour).


Build & Development options
-------------
The following environment variables are recognized:

* `DEBUG` - if set to `1` extra info about produced bundle will be printed to the console. Increases build time.
* `EMBEDDED` - if set to `1` dev server will default to `src/html/embedded.html`, otherwise it will serve `src/html/index.html`.
* `LOCALE_CACHE_TIME` - advanced usage, see `scripts/fetch-locale.cjs`.
* `NODE_ENV` - used by build scripts to control various debug options. See `package.json`. 
* `PORT` - port on which development server listens for incoming connections.
* `STYLES_CACHE_TIME` - advanced usage, see `scripts/build-styles-json.cjs`.
* `TARGET` - see **Build targets** above.
* `TRANSLATE_URL` - URL where to proxy translation requests.
* `USE_HTTPS` - if set to `1` dev server will use HTTPS. Requires certificates, see `scripts/server.cjs`.