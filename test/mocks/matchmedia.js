export function mockMatchMedia({ isTouch = false, isMouse = true, isPrimaryTouch = null, isPrimaryMouse = null }) {
	isPrimaryTouch = isPrimaryTouch ?? isTouch;
	isPrimaryMouse = isPrimaryMouse ?? isMouse;

	Object.defineProperty(window, 'matchMedia', {
		writable: true,
		value: jest.fn().mockImplementation((query) => {
			const queryResult = {
				matches: false,
				media: query,
				onchange: null,
				addListener: jest.fn(), // deprecated
				removeListener: jest.fn(), // deprecated
				addEventListener: jest.fn(),
				removeEventListener: jest.fn(),
				dispatchEvent: jest.fn(),
			};

			if (query === '(pointer:fine)') {
				return { ...queryResult, matches: isPrimaryMouse };
			}
			if (query === '(any-pointer:fine)') {
				return { ...queryResult, matches: isMouse };
			}
			if (query === '(pointer:coarse)') {
				return { ...queryResult, matches: isPrimaryTouch };
			}
			if (query === '(any-pointer:coarse)') {
				return { ...queryResult, matches: isTouch };
			}
			return { ...queryResult, matches: false };
		}),
	});
}
