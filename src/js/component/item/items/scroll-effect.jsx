import { memo, useCallback, useEffect, } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { usePrevious } from 'web-common/hooks';
import PropTypes from 'prop-types';

import { findRowIndexInSource } from '../../../actions';
import { useSourceData } from '../../../hooks';
import { SCROLL_BUFFER } from '../../../constants/constants';


const ScrollEffectComponent = memo(({ listRef, setScrollToRow }) => {
	const dispatch = useDispatch();
	const selectedItemKeys = useSelector(state => state.current.itemKeys);
	const { keys } = useSourceData();
	const previousSelectedItemKeys = usePrevious(selectedItemKeys);
	const isItemsTableFocused = useSelector(state => state.current.isItemsTableFocused);

	const viewportCount = useSelector(state => state.current.viewportCount);
	const prevViewportCount = usePrevious(viewportCount);

	const findItemsPositionFromRemote = useCallback(async (skipScroll = false) => {
		// findRowIndexInSource won't run a request if no item is specified in the URL or if
		// specified item is already loaded
		let nextScrollToRow = await dispatch(findRowIndexInSource());

		// Set scrollToRow. The Table component will now run the first fetch for items around the
		// target. Once it does, it will set hasChecked to true.
		setScrollToRow(nextScrollToRow);

		if (!skipScroll) {
			let bufferedScrollToRow = Math.max(nextScrollToRow - SCROLL_BUFFER, 0);
			listRef.current?.scrollToItem?.(bufferedScrollToRow, 'start');
		}
	}, [dispatch, listRef, setScrollToRow])

	// Initial load: findItemsPositionFromRemote but skip scrolling. Once scrollToRow is set, the Table
	// component will mount the list with initialScrollOffset set to the correct value.
	useEffect(() => {
		findItemsPositionFromRemote(true);
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	// Triggers when a "viewport change" navigation happens, e.g., a reference from a note or a related item.
	useEffect(() => {
		if (typeof prevViewportCount !== 'undefined' && viewportCount !== prevViewportCount) {
			setScrollToRow(null);
			findItemsPositionFromRemote();
		}
	}, [viewportCount, prevViewportCount, findItemsPositionFromRemote, setScrollToRow]);

	// Scroll to the selected item, e.g., when using keyboard navigation.
	useEffect(() => {
		if (listRef.current && keys && selectedItemKeys.length > 0 && !shallowEqual(selectedItemKeys, previousSelectedItemKeys)) {
			const itemKey = selectedItemKeys[selectedItemKeys.length - 1];
			const itemKeyIndex = keys.findIndex(k => k === itemKey);
			if (itemKeyIndex !== -1) {
				listRef.current.scrollToItem(itemKeyIndex, 'smart');
			}
		}
	}, [selectedItemKeys, isItemsTableFocused, keys, listRef, previousSelectedItemKeys]);
	return null;
});

ScrollEffectComponent.propTypes = {
	listRef: PropTypes.object.isRequired,
	setScrollToRow: PropTypes.func.isRequired,
};

ScrollEffectComponent.displayName = "TableScroll";

export default ScrollEffectComponent;
