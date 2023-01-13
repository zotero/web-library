import { act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// dropdowns and such update positions asynchronously trigger 'act' warning
// this is a workaround to silence the warning (https://floating-ui.com/docs/react#testing)
export const waitForPosition = () => act(async () => { });

export const actWithFakeTimers = async actCallback => {
	const user = userEvent.setup({ advanceTimers: () => jest.runAllTimers() });
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

export const applyAdditionalJestTweaks = () => {
	jest.setTimeout(10000);

	// https://github.com/jsdom/jsdom/issues/1695
	Element.prototype.scrollIntoView = jest.fn();
}
