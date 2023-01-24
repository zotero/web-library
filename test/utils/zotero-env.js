import { TestEnvironment } from 'jest-environment-jsdom';

class ZoteroEnvironment extends TestEnvironment {
	async setup() {
		await super.setup();
		this.global.containerClass = 'zotero-wl';
	}

	async teardown() {
		this.global.css = undefined;
		this.global.containerClass = undefined;
		await super.teardown();
	}
}

export default ZoteroEnvironment;
