'use strict';

//@TODO: deduplicate with bib-web
// https://github.com/zotero/bib-web/blob/dab5be3df07e3e65d24f6ceddc79e3c96b94107f/src/js/search-worker.js

module.exports = function(self) {
	var data = [];
	var items = [];
	var filter = null;

	self.addEventListener('message', function(ev) {
		const [command, payload] = ev.data;
		switch(command) {
			case 'LOAD':
				data = payload;
				self.postMessage(['READY', null]);
			break;
			case 'FILTER':
				filter = payload;
				if(filter.length < 3) {
					items = data.filter(
						style => style.name.toLowerCase().startsWith(filter)
							|| style.title.toLowerCase().startsWith(filter)
							|| (style.titleShort && style.titleShort.toLowerCase().startsWith(filter))
					);
				} else {
					items = data.filter(
						style => style.name.toLowerCase().includes(filter)
							|| style.title.toLowerCase().includes(filter)
							|| (style.titleShort && style.titleShort.toLowerCase().includes(filter))
					);
				}
				self.postMessage(['FILTER_COMPLETE', items]);
			break;
		}
	});
};
