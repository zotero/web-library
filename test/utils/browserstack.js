import { _android, chromium, webkit } from 'playwright';
const android = _android;

const bsDescriptors = {
	'windows-chromium': {
		browser: chromium,
		caps: {
			'os': 'windows',
			'os_version': '11',
			'browser': 'playwright-chromium',
			'browser_version': 'latest',
		}
	},
	'macos-webkit': {
		browser: webkit,
		caps: {
			'os': 'os x',
			'os_version': 'ventura',
			'browser': 'playwright-webkit',
			'browser_version': 'latest',
			'resolution': '2560x1440' // so that entire emulated device screen is captured
			// 'browserstack.debug': 'true',  // enabling visual logs
			// 'browserstack.console': 'verbose',  // Enabling Console logs for the test
			// 'browserstack.networkLogs': 'true',  // Enabling network logs for the test
		}
	}
}

// for consistent date formatting
const commonContextDesc = {
	locale: 'en-US',
	timezoneId: 'America/New_York',
	geolocation: { longitude: -73.935242, latitude: 40.730610 },
};

const contexts = {
	['windows-chrome']: {
		device: 'windows-chromium',
		context: {
			viewport: { width: 1280, height: 720 }
		}
	},
	['windows-chrome-small-desktop']: {
		device: 'windows-chromium',
		context: {
			viewport: { width: 1024, height: 768 }, // on small desktop, should switch to "stacked" layout
		},
	},
	['macos-safari']: {
		device: 'macos-webkit',
		context: {
			viewport: { width: 1280, height: 720 }
		},
	},
	['iphone-emulator']: {
		device: 'macos-webkit',
		context: {
			isMobile: true,
			deviceScaleFactor: 3,
			hasTouch: true,
			screen: { width: 390, height: 844 },
			viewport: { width: 390, height: 844 },
			userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
		}
	},
	['ipad-emulator']: {
		device: 'macos-webkit',
		context: {
			isMobile: true,
			deviceScaleFactor: 2,
			hasTouch: true,
			viewport: { width: 810, height: 1080 },
			userAgent: 'Mozilla/5.0 (iPad; CPU OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
		}
	},
	['ipad-pro-landscape-emulator']: {
		device: 'macos-webkit',
		context: {
			isMobile: true,
			deviceScaleFactor: 2,
			hasTouch: true,
			viewport: { width: 1366, height: 1024 }, // 12.9" iPad Pro, should render 3-columns touch layout
			userAgent: 'Mozilla/5.0 (iPad; CPU OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
		}
	},
	['android-emulator']: {
		device: 'windows-chromium',
		context: {
			isMobile: true,
			deviceScaleFactor: 2, // real device has 2.625
			hasTouch: true,
			screen: { width: 412, height: 915 },
			viewport: { width: 412, height: 915 },
			userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0.0.0.0 Mobile Safari/537.36',
		}
	},
};

export const singleColumnMobileContexts = [
	'iphone-emulator',
	'android-emulator',
];

export const twoColumnMobileContexts = [
	'ipad-emulator',
];

export const threeColumnMobileContexts = [
	'ipad-pro-landscape-emulator',
];

export const mobileContexts = [
	'iphone-emulator',
	'ipad-emulator',
	'ipad-pro-landscape-emulator',
	'android-emulator',
];

export const desktopContexts = [
	'windows-chrome',
	'windows-chrome-small-desktop',
	'macos-safari',
];

async function getBrowserConnection(bsDescriptor, retryLimit = 3) {
	let counter = 0;
	let browserOrDevice, lastError;
	const caps = {
		'browserstack.username': process.env.BROWSERSTACK_USERNAME,
		'browserstack.accessKey': process.env.BROWSERSTACK_ACCESS_KEY,
		'browserstack.local': true,
		'client.playwrightVersion': global.clientPlaywrightVersion,
		...bsDescriptor.caps,
	};

	while (!browserOrDevice) {
		if (counter++ >= retryLimit) {
			throw lastError
		}
		try {
			browserOrDevice = await bsDescriptor.browser.connect(
				`wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(JSON.stringify(caps))}`
			);
		} catch (e) {
			lastError = e;
			console.log(`Retrying to connect to BrowserStack (${counter} / ${retryLimit})...`);
		}
	}
	return browserOrDevice;
}

export class BrowserStackManager {
	constructor() {
		this.connections = new Map();
	}

	async closeConnections() {
		for (const [device, browserOrDevicePromise] of this.connections) {
			const connection = await browserOrDevicePromise;
			try {
				await connection.close();
			} catch (e) {
				console.error(`Failed to close connection to BrowserStack (${device}): ${e}`);
			}
		}
	}

	async getBrowserContext(contextName) {
		if (!(contextName in contexts)) {
			throw new Error(`Invalid context name: ${contextName}`);
		}

		const contextDescriptor = contexts[contextName];
		const bsDescriptor = bsDescriptors[contextDescriptor.device];
		let browserOrDevice, browserOrDevicePromise, lastError;

		if (this.connections.has(contextDescriptor.device)) {
			browserOrDevicePromise = this.connections.get(contextDescriptor.device);
		} else {
			browserOrDevicePromise = getBrowserConnection(bsDescriptor);
			this.connections.set(contextDescriptor.device, browserOrDevicePromise);
		}

		try {
			browserOrDevice = await browserOrDevicePromise;
		} catch (e) {
			console.error(lastError);
			throw new Error(`Failed to connect to BrowserStack (${contextName})`);
		}

		let context;
		if (bsDescriptor.browser === android) {
			context = await browserOrDevice.launchBrowser({ ...commonContextDesc, ...(contextDescriptor?.context ?? {}) });
		} else {
			context = await browserOrDevice.newContext({ ...commonContextDesc, ...(contextDescriptor?.context ?? {}) });
		}
		return context;
	}
}

