'use strict';

import ZoteroWebLibrary from './zotero-web-library';
const targetDom = document.getElementById('zotero-web-library');
const configDom = document.getElementById('zotero-web-library-config');
const menuConfigDom = document.getElementById('zotero-web-library-menu-config');
const config = configDom ? JSON.parse(configDom.textContent) : {};
config.menus = menuConfigDom ? JSON.parse(menuConfigDom.textContent) : null;

if(targetDom) {
	ZoteroWebLibrary.LibraryContainer.init(targetDom, config);
}

export default ZoteroWebLibrary;
