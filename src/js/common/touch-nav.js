// Positions the current title between the previous title and the right-hand toolbar buttons. The
// current title stays centered if it fits, otherwise it is shifted, and only truncated as a last
// resort. The previous title is never truncated: if it leaves too little room for the current
// title, it is collapsed into a generic "Back" label.
//
// All values are in px, measured from the left edge of the navigation:
// - width: width of the navigation
// - edge: left boundary for the current title when there is no previous title
// - gap: minimum spacing between the previous and the current title
// - previousOffset: where the previous title starts
// - rightEdge: right boundary for the current title
// - previousWidth: natural width of the previous title, null if there is no previous title
// - backWidth: natural width of the "Back" label
// - currentWidth: natural width of the current title
//
// Returns `shift` (offset of the current title from the center), `maxWidth` (room available for
// the current title) and `isPreviousCollapsed`.
export const getTouchNavLayout = ({ width, edge, gap, previousOffset, rightEdge, previousWidth = null,
	backWidth, currentWidth }) => {
	const hasPrevious = previousWidth !== null;
	const isPreviousCollapsed = hasPrevious &&
		previousOffset + previousWidth + gap + currentWidth > rightEdge;
	const leftEdge = hasPrevious ?
		previousOffset + (isPreviousCollapsed ? backWidth : previousWidth) + gap :
		edge;

	const maxWidth = Math.max(0, rightEdge - leftEdge);
	const visibleWidth = Math.min(currentWidth, maxWidth);
	const centeredLeft = (width - visibleWidth) / 2;
	const left = Math.min(Math.max(centeredLeft, leftEdge), rightEdge - visibleWidth);

	return { isPreviousCollapsed, maxWidth, shift: left - centeredLeft };
};
