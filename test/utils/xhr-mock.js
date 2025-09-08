import { bypass } from 'msw'

import localesGBForCiteproc from '../fixtures/locales-en-gb.xml';
import localesUSForCiteproc from '../fixtures/locales-en-us.xml';
import localesPLForCiteproc from '../fixtures/locales-pl-pl.xml';

const localesRegex = /locales-(en-US|en-GB|pl-PL)/;

export const installUnhandledRequestHandler = (server) => {
	server.listen({
		onUnhandledRequest: (req) => {
			if (req.url.match(localesRegex)) {
				// handled by XHR mock
				bypass(req);
				return;
			}
			// https://github.com/mswjs/msw/issues/946#issuecomment-1202959063
			test(`${req.method} ${req.url} is not handled`, () => { });
		},
	});
};

// msw will complain the next time it tries to mock XHR so we need to uninstall it every time
export const uninstallMockedXHR = () => {
	Reflect.deleteProperty(window, 'XMLHttpRequest');
}

// msw already mocks XHR and it supports sync requests in the browser but not in JSDOM (https://github.com/mswjs/interceptors/pull/619)
// so we need to override a mock with a custom one that supports sync requests for locales used in the tests
export const installMockedXHR = () => {
	Reflect.deleteProperty(window, 'XMLHttpRequest');
	Reflect.defineProperty(window, 'XMLHttpRequest', {
		writable: true,
		enumerable: true,
		value: class XMLHttpRequest {
			constructor() {
				this.DONE = 4;
				this.readyState = 0;
				this.status = 0;
				this.responseText = '';
				this.onreadystatechange = null;
				this._url = '';
			}

			open(method, url) {
				this._url = url;
			}

			send() {
				const match = this._url.match(localesRegex);
				if (match) {
					this.readyState = 4;
					this.status = 200;
					if (match[1] === 'en-US') {
						this.responseText = localesUSForCiteproc;
					} else if (match[1] === 'en-GB') {
						this.responseText = localesGBForCiteproc;
					} else if (match[1] === 'pl-PL') {
						this.responseText = localesPLForCiteproc;
					}
					if (this.onreadystatechange) {
						this.onreadystatechange();
					}
					return;
				}
				throw new Error(`Unhandled XHR request to ${this._url}`);
			}

			set onreadystatechange(fn) {
				this._onreadystatechange = fn;
			}

			get onreadystatechange() {
				return this._onreadystatechange;
			}
		}
	});
}
