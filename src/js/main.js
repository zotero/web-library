import './wdyr';
import init from './init';
import { containterClassName } from './constants/defaults';

const targetDom = document.getElementById('zotero-web-library');
const configDom = document.getElementById('zotero-web-library-config');
const menuConfigDom = document.getElementById('zotero-web-library-menu-config');
const config = configDom ? JSON.parse(configDom.textContent) : {};
config.menus = menuConfigDom ? JSON.parse(menuConfigDom.textContent) : null;

if(targetDom) {
	targetDom.classList.add(({ containterClassName, ...config }).containterClassName);
	init(targetDom, config);
}
