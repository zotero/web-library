import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { usePrevious } from 'web-common/hooks';
import AutoSizer from 'react-virtualized-auto-sizer';
import InfiniteLoader from "react-window-infinite-loader";
import { FixedSizeList as List } from 'react-window';
import { Spinner } from 'web-common/components';

import ListRow from './list-row';
import { abortAllRequests, connectionIssues, fetchSource } from '../../../actions';
import { useSourceData } from '../../../hooks';
import { get, getRequestTypeFromItemsSource } from '../../../utils';
import ScrollEffectComponent from './scroll-effect';
import { SCROLL_BUFFER, LIST_ROW_HEIGHT } from '../../../constants/constants';


const ItemsList = memo(props => {
	const { isSearchModeTransitioning } = props;
	const loader = useRef(null);
	const listRef = useRef(null);
	const lastRequest = useRef({});
	const dispatch = useDispatch();
	const { injectPoints, hasChecked, isFetching, keys, requests, totalResults, sortBy, sortDirection } = useSourceData();
	const prevSortBy = usePrevious(sortBy);
	const prevSortDirection = usePrevious(sortDirection);
	const isSearchMode = useSelector(state => state.current.isSearchMode);
	const isSelectMode = useSelector(state => state.current.isSelectMode);
	const itemsSource = useSelector(state => state.current.itemsSource);
	const isSingleColumn = useSelector(state => state.device.isSingleColumn);
	const view = useSelector(state => state.current.view);
	const isSearchModeTransitioningOut = !isSearchMode && isSearchModeTransitioning;
	const requestType = getRequestTypeFromItemsSource(itemsSource);
	const errorCount = useSelector(state => get(state, ['traffic', requestType, 'errorCount'], 0));
	const prevErrorCount = usePrevious(errorCount);
	const [scrollToRow, setScrollToRow] = useState(null);

	//@NOTE: On mobiles (single-column) we have a dedicated search mode where. To prevent visual glitches
	//		 where current items overlap empty search prompt we need the following hack. See #230
	const isSearchModeHack = isSingleColumn && (isSearchMode || isSearchModeTransitioningOut) &&
		itemsSource !== 'query' && view !== 'item-list';

	const selectedItemKeys = useSelector(state => state.current.itemKeys, shallowEqual);
	const isModalOpen = useSelector(state => state.modal.id);

	const handleIsItemLoaded = useCallback(index => {
		if(keys && !!keys[index]) {
			return true; // loaded
		}
		return requests.some(r => index >= r[0] && index < r[1]); // loading
	}, [keys, requests]);

	const handleLoadMore = useCallback((startIndex, stopIndex) => {
		let offset = 0;
		for (let i = 0; i <= injectPoints.length; i++) {
			if (injectPoints[i] <= startIndex) {
				offset++;
			}
		}
		dispatch(fetchSource(Math.max(startIndex - offset, 0), stopIndex))
		lastRequest.current = { startIndex, stopIndex };
	}, [dispatch, injectPoints]);

	useEffect(() => {
		if (scrollToRow !== null && !hasChecked && !isFetching) {
			let startIndex = Math.max(scrollToRow - 20, 0);
			let stopIndex = scrollToRow + 50;
			dispatch(fetchSource(startIndex, stopIndex));
			lastRequest.current = { startIndex, stopIndex };
		}
	}, [dispatch, isFetching, hasChecked, scrollToRow]);

	useEffect(() => {
		if(errorCount > 0 && errorCount > prevErrorCount) {
			const { startIndex, stopIndex } = lastRequest.current;
			if(typeof(startIndex) === 'number' && typeof(stopIndex) === 'number') {
				dispatch(fetchSource(startIndex, stopIndex));
			}
		}
		if(errorCount > 3 && prevErrorCount === 3) {
			dispatch(connectionIssues());
		} else if(errorCount === 0 && prevErrorCount > 0) {
			dispatch(connectionIssues(true));
		}
	}, [dispatch, errorCount, prevErrorCount]);

	useEffect(() => {
		if ((typeof prevSortBy === 'undefined' && typeof prevSortDirection === 'undefined') || (prevSortBy === sortBy && prevSortDirection === sortDirection)) {
			return;
		}

		if(loader.current) {
			loader.current.resetloadMoreItemsCache(true);
		}

		if(isFetching) {
			dispatch(abortAllRequests(requestType));
			setTimeout(() => {
				const { startIndex, stopIndex } = lastRequest.current;
				if(typeof(startIndex) === 'number' && typeof(stopIndex) === 'number') {
					dispatch(fetchSource(startIndex, stopIndex));
				}
			}, 0)
		}
	}, [dispatch, isFetching, prevSortBy, prevSortDirection, requestType, sortBy, sortDirection, totalResults]);

	useEffect(() => {
		if(listRef.current && selectedItemKeys.length && keys) {
			const itemKey = selectedItemKeys[selectedItemKeys.length - 1];
			const itemKeyIndex = keys.findIndex(k => k === itemKey);
			listRef.current.scrollToItem(itemKeyIndex);
		}
	}, [keys, selectedItemKeys]);

	return (
		<div className="items-list-wrap">
			<ScrollEffectComponent listRef={listRef} setScrollToRow={setScrollToRow} />
			{ hasChecked && (
				<AutoSizer>
				{({ height, width }) => (
					<InfiniteLoader
						ref={ loader }
						listRef={ listRef }
						isItemLoaded={ handleIsItemLoaded }
						itemCount={ hasChecked && !isSearchModeHack ? totalResults : 0 }
						loadMoreItems={ handleLoadMore }
					>
						{({ onItemsRendered, ref }) => (
							<div
								aria-label="items"
								className={ cx('items-list', {
									'editing': isSelectMode,
								}) }
								role={ isSelectMode ? 'listbox' : 'list' }
								aria-rowcount={ totalResults }
							>
								<List
									initialScrollOffset={Math.max(scrollToRow - SCROLL_BUFFER, 0) * LIST_ROW_HEIGHT}
									height={ height }
									itemCount={ hasChecked && !isSearchModeHack ? totalResults : 0 }
									itemData={ { keys } }
									itemSize={ LIST_ROW_HEIGHT }
									onItemsRendered={ onItemsRendered }
									ref={ r => { ref(r); listRef.current = r; } }
									width={ width }
								>
									{ ListRow }
								</List>
							</div>
						)}
					</InfiniteLoader>
				)}
				</AutoSizer>
			)}
			{!hasChecked && !isModalOpen && !isSearchModeHack && <Spinner className="large" /> }
			{ hasChecked && totalResults === 0 && (
				<div className="item-list-empty">
					No items in this view
				</div>
			) }
		</div>
	);
});

ItemsList.displayName = 'ItemsList';

ItemsList.propTypes = {
	isSearchModeTransitioning: PropTypes.bool,
}

export default memo(ItemsList);
