'use strict';

var log = require('libzotero/lib/Log').Logger('zotero-web-library:zotero-web-library');

var Zotero = require('libzotero');

Zotero.State = require('./State.js');
Zotero.Delay = require('./Delay.js');
Zotero.Pages = Zotero.pages = require('./Pages/Pages.js');
Zotero.ui = require('./libraryUi/ui.js');
Zotero.format = require('./libraryUi/format.js');
Zotero.ui.widgets.Library = require('./libraryUi/widgets/ZoteroLibrary.js');
Zotero.ui.widgets.Libraries = require('./libraryUi/widgets/ZoteroLibraries.js');
Zotero.ui.widgets.StaticLibrary = require('./libraryUi/StaticComponents/LibraryContainer.js');
Zotero.eventful = require('./libraryUi/eventful.js');
Zotero.init = require('./Init.js');
Zotero.url = Zotero.extend({}, Zotero.url, require('./Url.js'));

Zotero.defaultPrefs = {
    debug_level: 3, //lower level is higher priority
    debug_log: true,
    debug_mock: false,
    javascript_enabled: false
};

// use existing jquery if available
if (typeof jQuery === 'undefined' && typeof $ === 'undefined') {
	var jQuery = require('jquery');
} else if(typeof jQuery === 'undefined') {
	var jQuery = $;
}

window.$ = window.jQuery = window.J = jQuery || $;
require('floatthead');
require('bootstrap-sass');

window.React = require('react');
window.ReactDOM = require('react-dom');

jQuery(document).ready(function() {
	/* The Zotero web library is built on top of libZotero as a group of
	 * relatively independent widgets. They interact by listening to and
	 * triggering events (with optional filters) on the Zotero object or
	 * individual Zotero.Library objects. State is maintained by a
	 * Zotero.State object that optionally stores variables in the url
	 * using pushState as well. With pushState enabled back/forward
	 * actions trigger events for the variables that have changed so
	 * widgets listening know to update.
	 */
	log.debug('===== DOM READY =====', 3);
	Zotero.state = new Zotero.State();
	Zotero.init();
});

module.exports = Zotero;
