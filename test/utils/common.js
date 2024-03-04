import { act } from '@testing-library/react'

// dropdowns and such update positions asynchronously trigger 'act' warning
// this is a workaround to silence the warning (https://floating-ui.com/docs/react#testing)
export const waitForPosition = () => act(async () => { });


export const resizeWindow = (x, y) => {
	window.innerWidth = x;
	window.innerHeight = y;
	window.dispatchEvent(new Event('resize'));
}

class Worker {
	constructor(stringUrl) {
		this.url = stringUrl;
		this.onmessage = () => { };
	}

	addEventListener() {}

	postMessage(msg) {
		this.onmessage(msg);
	}
}

export const applyAdditionalJestTweaks = ({ timeout = 30000, resolution = [1280, 720] } = {}) => {
	jest.setTimeout(timeout);
	resizeWindow(resolution[0], resolution[1]);

	// https://github.com/jsdom/jsdom/issues/1695
	Element.prototype.scrollIntoView = jest.fn();

	window.Worker = Worker;

	Object.defineProperty(HTMLElement.prototype, 'offsetParent', {
		get() {
			let element = this;
			let elementStyle = {};
			let depth = 0;
			while(element) {
				elementStyle = window.getComputedStyle(element);
				if(!element || elementStyle.display === 'none' || ['body', 'html'].includes(element.tagName.toLowerCase())) {
					break;
				}
				element = element.parentElement;
				depth++;
			}

			if (elementStyle.display === 'none') {
				return null;
			}

			if (depth === 0) {
				return null;
			}

			return element;
		},
	});
}

export const waitForLoad = async page => {
	try {
		await page.waitForLoadState('networkidle');
	} catch (e) {
		console.warn('networkidle never triggered');
		// ignore as there is a good chance that everything required for the screenshot has actually loaded.
	}
}
