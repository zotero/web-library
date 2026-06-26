import PropTypes from 'prop-types';
import { useCallback, useRef } from 'react';
import { List as UpstreamReactWindowList } from 'react-window';
import { clamp } from 'web-common/utils';

// Wraps the upstream react-window handle so every imperative `scrollToRow` is bounds-checked.
const makeSafeHandle = (r, rowCount) => {
	if (!r) {
		return r;
	}
	return {
		get element() {
			return r.element;
		},
		scrollToRow: ({ index, ...rest } = {}) => {
			if (typeof rowCount !== 'number' || rowCount <= 0) {
				return;
			}
			const safeIndex = clamp(index ?? 0, 0, rowCount - 1);
			r.scrollToRow({ ...rest, index: safeIndex });
		},
	};
};

// This wrapper adds support for initialScrollToRow and will skip calls to onRowsRendered until after the initial scroll
const ReactWindowList = ({ initialScrollToRow, listRef: listRefFromProps, onRowsRendered, ...rest}) => {
	const { rowCount } = rest;
	const listRef = useRef(null);
	const isScrollInitiated = useRef(false);
	const isScrollCompleted = useRef(false);

	const handleListRef = useCallback(r => {
		const safeRef = makeSafeHandle(r, rowCount);
		listRef.current = safeRef;
		if (listRefFromProps) {
			if(typeof listRefFromProps === 'function') {
				listRefFromProps(safeRef);
			} else if (typeof listRefFromProps === 'object') {
				listRefFromProps.current = safeRef;
			}
		}
		// Ensure `scrollToRow` happens only once. Possibly fixes #648
		// Skip the initial scroll when the target is out of range (e.g. on small touch in
		// search-mode, where the row count is zeroed while a deep item is still selected) so we
		// don't mark it as initiated before there is anything to scroll to.
		if (initialScrollToRow && safeRef && safeRef.element && !isScrollInitiated.current && initialScrollToRow < rowCount) {
			isScrollInitiated.current = true;
			safeRef.scrollToRow({ index: initialScrollToRow, behavior: 'instant', align: 'start' });
			setTimeout(() => {
				isScrollCompleted.current = true;
			}, 0);
		}
	}, [listRefFromProps, initialScrollToRow, rowCount]);

	const handleRowsRendered = useCallback(args => {
		if(initialScrollToRow && !isScrollCompleted.current) {
			// ignore calls to onRowsRendered until after the initial scroll
			return;
		}
		onRowsRendered?.(args);
	}, [initialScrollToRow, onRowsRendered]);

	return <UpstreamReactWindowList
		{...rest}
		onRowsRendered={ handleRowsRendered }
		listRef={handleListRef}
	/>;
};

ReactWindowList.displayName = 'ReactWindowList';
ReactWindowList.propTypes = {
	initialScrollToRow: PropTypes.number,
	listRef: PropTypes.oneOfType([
		PropTypes.func,
		PropTypes.shape({ current: PropTypes.any }),
	]),
	onRowsRendered: PropTypes.func,
	rowCount: PropTypes.number,
};

export default ReactWindowList;

