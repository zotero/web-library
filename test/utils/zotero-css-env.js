import sass from 'sass';
import ZoteroEnvironment from './zotero-env.js';

const css = sass.compile('./src/scss/zotero-web-library.scss').css;

class ZoteroCssEnvironment extends ZoteroEnvironment {
	constructor(config, context) {
		super(config, context);
	}

	async setup() {
		await super.setup();
		this.global.css = css;
	}
}

export default ZoteroCssEnvironment;
