import { TestEnvironment } from 'jest-environment-jsdom';

// based on https://github.com/jsdom/jsdom/issues/1724#issuecomment-1446858041
class FetchEnvironment extends TestEnvironment {
	constructor(...args) {
		super(...args);

		this.global.fetch = fetch;
		this.global.Headers = Headers;
		this.global.Request = Request;
		this.global.Response = Response;
	}
}

export default FetchEnvironment;
