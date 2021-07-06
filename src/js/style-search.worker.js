// TODO: deduplicate with bib-web
// https://github.com/zotero/bib-web/blob/dab5be3df07e3e65d24f6ceddc79e3c96b94107f/src/js/search-worker.js

let data = [];
let items = [];
let filter = null;
let index = 0;

self.addEventListener('message', function(ev) {
	const [command, payload] = ev.data;
	switch(command) {
		case 'LOAD':
			data = payload;
			self.postMessage(['READY', null]);
		break;
		case 'FILTER':
			index = 0;
			filter = payload;
			items = [];
			for(let i = 0; i < data.length; i++) {
				const style = data[i];
				const styleTitle = style.title.toLowerCase();
				if(styleTitle.startsWith(filter)){
					items.splice(index++, 0, style);
				} else if(styleTitle.includes(filter) ||
					style.name.toLowerCase().includes(filter) ||
					(style.titleShort && style.titleShort.toLowerCase().includes(filter))
				) {
					items.push(style);
				}
			}
			self.postMessage(['FILTER_COMPLETE', items]);
		break;
	}
});
