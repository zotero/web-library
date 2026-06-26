import '@testing-library/jest-dom';
import { render } from '@testing-library/react';

import List from '../src/js/component/common/list';
import { applyAdditionalJestTweaks } from './utils/common';

// `react-virtualized-auto-sizer` is mocked globally (see jest.config.mjs) to render
// its child with a fixed 640x600 box, so the underlying react-window list mounts with
// a concrete size and runs its scroll math in jsdom.
const Row = () => null;

const renderList = (props) => {
	const listRef = { current: null };
	const result = render(
		<List
			getItemData={() => null}
			itemCount={props.itemCount}
			totalResults={props.itemCount}
			scrollToRow={props.scrollToRow}
			listRef={listRef}
			listItemComponent={Row}
		/>
	);
	return { listRef, ...result };
};

describe('ReactWindowList scroll guard', () => {
	applyAdditionalJestTweaks();

	test('does not crash when the buffered initial scroll row is beyond itemCount', () => {
		// On small touch the dedicated search-mode hack zeroes itemCount (see #230) while a
		// deeply-selected item keeps scrollToRow large. That left initialScrollToRow
		// (scrollToRow - SCROLL_BUFFER) >= rowCount, and react-window v2 throws a hard
		// RangeError for out-of-range scroll indexes, crashing the whole app.
		expect(() => renderList({ itemCount: 3, scrollToRow: 50 })).not.toThrow();
	});

	test('renders without crashing when the initial scroll row is within range', () => {
		expect(() => renderList({ itemCount: 100, scrollToRow: 50 })).not.toThrow();
	});

	test('imperative scrollToRow clamps an out-of-range index instead of throwing', () => {
		// Direct callers (keyboard nav, ScrollEffect, tag focus-jump) reach scrollToRow through
		// the ref handle; a stale index must be clamped rather than crash the app.
		const { listRef } = renderList({ itemCount: 5, scrollToRow: 0 });

		expect(listRef.current).not.toBeNull();
		expect(() => listRef.current.scrollToRow({ index: 9999, align: 'smart' })).not.toThrow();
		expect(() => listRef.current.scrollToRow({ index: -10, align: 'smart' })).not.toThrow();
	});

	test('imperative scrollToRow is a no-op on an empty list', () => {
		const { listRef } = renderList({ itemCount: 0, scrollToRow: 0 });

		expect(listRef.current).not.toBeNull();
		expect(() => listRef.current.scrollToRow({ index: 0, align: 'smart' })).not.toThrow();
	});

	test('the ref handle still exposes the underlying list element', () => {
		// tag-list reads `.element` for getBoundingClientRect/addEventListener, so the wrapped
		// handle must keep delegating the element getter.
		const { listRef } = renderList({ itemCount: 5, scrollToRow: 0 });

		expect(listRef.current.element).toBeInstanceOf(HTMLElement);
	});
});
