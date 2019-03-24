'use strict';

import ZoteroWebLibrary from './zotero-web-library';
const targetDom = document.getElementById('zotero-web-library');
const configDom = document.getElementById('zotero-web-library-config');
const config = configDom ? JSON.parse(configDom.textContent) : {};

if(targetDom) {
	ZoteroWebLibrary.LibraryContainer.init(targetDom, config);
}

export default ZoteroWebLibrary;
