import sass from 'sass';
import { TestEnvironment } from 'jest-environment-jsdom';

const compilationResult = sass.compile('./src/scss/zotero-web-library.scss');

class ZoteroEnvironment extends TestEnvironment {
	constructor(config, context) {
		super(config, context);
	}

	async setup() {
		await super.setup();
		this.global.css = compilationResult.css;
		this.global.containerClass = 'zotero-wl';
	}

	async teardown() {
		this.global.css = undefined;
		this.global.containerClass = undefined;
		await super.teardown();
	}

	getVmContext() {
		return super.getVmContext();
	}
}

export default ZoteroEnvironment;
