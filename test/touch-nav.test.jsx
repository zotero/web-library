import { getTouchNavLayout } from '../src/js/common/touch-nav';

// A 390px wide navigation with a 16px edge, the previous title starting at 32px and the
// right-hand toolbar buttons starting at 350px
const geometry = { width: 390, edge: 16, gap: 12, previousOffset: 32, rightEdge: 338, backWidth: 40 };

describe('getTouchNavLayout', () => {
	test('keeps the current title centered when it fits', () => {
		const layout = getTouchNavLayout({ ...geometry, previousWidth: 60, currentWidth: 100 });
		expect(layout).toEqual({ isPreviousCollapsed: false, maxWidth: 234, shift: 0 });
	});

	test('shifts the current title right rather than overlapping the previous title', () => {
		const layout = getTouchNavLayout({ ...geometry, previousWidth: 120, currentWidth: 150 });
		// centered, the current title would start at 120px, but the previous title ends at 152px
		expect(layout).toEqual({ isPreviousCollapsed: false, maxWidth: 174, shift: 44 });
	});

	test('shifts the current title left rather than overlapping the toolbar buttons', () => {
		const layout = getTouchNavLayout({ ...geometry, previousWidth: null, currentWidth: 300 });
		// centered, the current title would end at 345px, past the toolbar buttons
		expect(layout).toEqual({ isPreviousCollapsed: false, maxWidth: 322, shift: -7 });
	});

	test('collapses the previous title when the current title does not fit next to it', () => {
		const layout = getTouchNavLayout({ ...geometry, previousWidth: 120, currentWidth: 200 });
		expect(layout.isPreviousCollapsed).toBe(true);
		expect(layout.maxWidth).toBe(254);
		// "Back" ends at 72px, centered the current title starts at 95px
		expect(layout.shift).toBe(0);
	});

	test('truncates the current title only once the previous title is collapsed', () => {
		const layout = getTouchNavLayout({ ...geometry, previousWidth: 60, currentWidth: 400 });
		expect(layout.isPreviousCollapsed).toBe(true);
		expect(layout.maxWidth).toBe(254);
		expect(layout.shift).toBe(16);
	});

	test('collapses a previous title that does not fit even next to an empty current title', () => {
		const layout = getTouchNavLayout({ ...geometry, previousWidth: 320, currentWidth: 0 });
		expect(layout.isPreviousCollapsed).toBe(true);
	});

	test('never collapses a missing previous title', () => {
		const layout = getTouchNavLayout({ ...geometry, previousWidth: null, currentWidth: 1000 });
		expect(layout).toEqual({ isPreviousCollapsed: false, maxWidth: 322, shift: -18 });
	});
});
