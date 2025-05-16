import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Spinner } from 'web-common/components';
import { useDispatch, useSelector } from 'react-redux';
import { usePrevious } from 'web-common/hooks';
import cx from 'classnames';
import PropTypes from 'prop-types';

import { abortAllRequests, connectionIssues, fetchSource } from '../../../actions';
import { get, getRequestTypeFromItemsSource } from '../../../utils';
import { useItemsState } from '../../../hooks';
import List from '../../common/list';
import ListRow from './list-row';
import ScrollEffectComponent from './scroll-effect';


const ItemsList = memo(props => {
	const {
		isPickerMode, isSearchModeTransitioning, libraryKey, collectionKey, itemsSource,
		isSearchMode, isSelectMode, view, selectedItemKeys = [] } = props;
	const loader = useRef(null);
	const listRef = useRef(null);
	const lastRequest = useRef({});
	const dispatch = useDispatch();
	const {
		injectPoints, isFetching, keys, hasChecked, totalResults, sortBy, sortDirection, requests
	} = useItemsState({ libraryKey, collectionKey, itemsSource });
	const requestType = getRequestTypeFromItemsSource(itemsSource);
	const isSingleColumn = useSelector(state => state.device.isSingleColumn);
	const isModalOpen = useSelector(state => state.modal.id);
	const errorCount = useSelector(state => get(state, ['traffic', requestType, 'errorCount'], 0));
	const prevSortBy = usePrevious(sortBy);
	const prevSortDirection = usePrevious(sortDirection);
	const prevErrorCount = usePrevious(errorCount);
	const isSearchModeTransitioningOut = !isSearchMode && isSearchModeTransitioning;
	const [scrollToRow, setScrollToRow] = useState(null);

	//@NOTE: On mobiles (single-column) we have a dedicated search mode where. To prevent visual glitches
	//		 where current items overlap empty search prompt we need the following hack. See #230
	const isSearchModeHack = isSingleColumn && (isSearchMode || isSearchModeTransitioningOut) &&
		itemsSource !== 'query' && view !== 'item-list';

	const itemCount = hasChecked && !isSearchModeHack ? totalResults : 0;

	const isItemLoaded = useCallback(index => {
		if (keys && !!keys[index]) {
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
		dispatch(fetchSource({ startIndex: Math.max(startIndex - offset, 0), stopIndex, itemsSource, libraryKey, collectionKey }))
		lastRequest.current = { startIndex, stopIndex };
	}, [collectionKey, dispatch, injectPoints, itemsSource, libraryKey]);

	const getItemData = useCallback((index) => {
		return keys && keys[index] ? keys[index] : null;
	}, [keys]);

	useEffect(() => {
		if (scrollToRow !== null && !hasChecked && !isFetching) {
			let startIndex = Math.max(scrollToRow - 20, 0);
			let stopIndex = scrollToRow + 50;
			dispatch(fetchSource({ startIndex, stopIndex, itemsSource, libraryKey, collectionKey }));
			lastRequest.current = { startIndex, stopIndex };
		}
	}, [dispatch, isFetching, hasChecked, scrollToRow, itemsSource, libraryKey, collectionKey]);

	useEffect(() => {
		if (errorCount > 0 && errorCount > prevErrorCount) {
			const { startIndex, stopIndex } = lastRequest.current;
			if (typeof (startIndex) === 'number' && typeof (stopIndex) === 'number') {
				dispatch(fetchSource({ startIndex, stopIndex, itemsSource, libraryKey, collectionKey }));
			}
		}
		if (errorCount > 3 && prevErrorCount === 3) {
			dispatch(connectionIssues());
		} else if (errorCount === 0 && prevErrorCount > 0) {
			dispatch(connectionIssues(true));
		}
	}, [collectionKey, dispatch, errorCount, itemsSource, libraryKey, prevErrorCount]);

	useEffect(() => {
		if ((typeof prevSortBy === 'undefined' && typeof prevSortDirection === 'undefined') || (prevSortBy === sortBy && prevSortDirection === sortDirection)) {
			return;
		}

		if (loader.current) {
			loader.current.resetloadMoreItemsCache(true);
		}

		if (isFetching) {
			dispatch(abortAllRequests(requestType));
			setTimeout(() => {
				const { startIndex, stopIndex } = lastRequest.current;
				if (typeof (startIndex) === 'number' && typeof (stopIndex) === 'number') {
					dispatch(fetchSource({ startIndex, stopIndex, itemsSource, libraryKey, collectionKey }));
				}
			}, 0)
		}
	}, [collectionKey, dispatch, isFetching, itemsSource, libraryKey, prevSortBy, prevSortDirection, requestType, sortBy, sortDirection, totalResults]);

	return (
		<List
			isReady={hasChecked}
			getItemData={getItemData}
			isItemLoaded={isItemLoaded}
			itemCount={itemCount}
			loaderRef={loader}
			listClassName={cx({ 'editing': isSelectMode })}
			onLoadMore={handleLoadMore}
			setScrollToRow={setScrollToRow}
			listRef={listRef}
			listItemComponent={ListRow}
			scrollToRow={scrollToRow}
			totalResults={totalResults}
		>
			{
				!isPickerMode && (
					<ScrollEffectComponent
						listRef={listRef}
						setScrollToRow={setScrollToRow}
						libraryKey={libraryKey}
						collectionKey={collectionKey}
						itemsSource={itemsSource}
						selectedItemKeys={selectedItemKeys}
					/>
				)
			}
			<>

				{!hasChecked && !isModalOpen && !isSearchModeHack && <Spinner className="large" />}
				{hasChecked && totalResults === 0 && (
					<div className="item-list-empty">
						No items in this view
					</div>
				)}
			</>
		</List>
	);
});

ItemsList.displayName = 'ItemsList';

ItemsList.propTypes = {
	collectionKey: PropTypes.string,
	isSearchMode: PropTypes.bool,
	isSearchModeTransitioning: PropTypes.bool,
	isSelectMode: PropTypes.bool,
	itemsSource: PropTypes.string.isRequired,
	libraryKey: PropTypes.string,
	selectedItemKeys: PropTypes.arrayOf(PropTypes.string),
	view: PropTypes.string,
};

export default memo(ItemsList);
