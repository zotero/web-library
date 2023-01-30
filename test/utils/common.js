import { act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// dropdowns and such update positions asynchronously trigger 'act' warning
// this is a workaround to silence the warning (https://floating-ui.com/docs/react#testing)
export const waitForPosition = () => act(async () => { });

const user = userEvent.setup({ advanceTimers: () => jest.runAllTimers() });

export const actWithFakeTimers = async actCallback => {
	jest.useFakeTimers();
	await actCallback(user);
	act(() => jest.runOnlyPendingTimers());
	jest.useRealTimers();
}

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


export const applyAdditionalJestTweaks = ({ timeout = 15000, resolution = [1280, 720] } = {}) => {
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
