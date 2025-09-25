import PropTypes from 'prop-types';
import { useCallback, useRef } from 'react';
import { List as UpstreamReactWindowList } from '@tnajdek/react-window';

// This wrapper adds support for initialScrollToRow, and will skip calls to onRowsRendered until after the initial scroll
const ReactWindowList = ({ initialScrollToRow, listRef: listRefFromProps, onRowsRendered, ...rest}) => {
	const listRef = useRef(null);
	const isScrolled = useRef(false);

	const handleListRef = useCallback(r => {
		listRef.current = r;
		if (listRef) {
			listRef.current = r;
		}
		if (listRefFromProps) {
			if(typeof listRefFromProps === 'function') {
				listRefFromProps(r);
			} else if (typeof listRefFromProps === 'object') {
				listRefFromProps.current = r;
			}
		}
		if (initialScrollToRow && r && !isScrolled.current) {
			r.scrollToRow({ index: initialScrollToRow, behavior: 'instant' });
			setTimeout(() => {
				isScrolled.current = true;
			}, 0);
		}
	}, [listRefFromProps, initialScrollToRow]);

	const handleRowsRendered = useCallback(args => {
		if(initialScrollToRow && !isScrolled.current) {
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
};

export default ReactWindowList;

