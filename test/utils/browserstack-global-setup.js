import BSLocal from "browserstack-local";

export default async function globalSetup() {
	if (!process.env.BROWSERSTACK_USERNAME || !process.env.BROWSERSTACK_ACCESS_KEY) {
		throw new Error("BROWSERSTACK_USERNAME and BROWSERSTACK_ACCESS_KEY environment variables must be set");
	}
	const key = process.env.BROWSERSTACK_ACCESS_KEY;
	const bsLocal = new BSLocal.Local();

	await new Promise((resolve) => bsLocal.start({ key }, err => {
		if (err) {
			console.error(err);
			throw new Error("Failed to start BrowserStackLocal");
		}
		resolve()
	}));
	if (!bsLocal.isRunning()) {
		throw new Error("BrowserStackLocal is not running. Snapshot tests cannot continue.");
	}
	global.bsLocal = bsLocal;
}
