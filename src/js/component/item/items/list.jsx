import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { noop } from 'web-common/utils';
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
import { PICKS_MULTIPLE_ITEMS, PICKS_SINGLE_ITEM } from '../../../constants/picker-modes';


const ItemsList = memo(props => {
	const { isSearchModeTransitioning, columnsKey, libraryKey, collectionKey, itemsSource,
		isSearchMode, pickerNavigate = noop, pickerPick = noop, pickerMode,
		selectedItemKeys = [], isTrash, isMyPublications, q, qmode, tags, view } = props
	const listRef = useRef(null);
	const lastRequest = useRef({});
	const dispatch = useDispatch();
	const {
		injectPoints, isFetching, keys, hasChecked, totalResults, sortBy, sortDirection, requests
	} = useItemsState({ libraryKey, collectionKey, itemsSource });
	const requestType = getRequestTypeFromItemsSource(itemsSource);
	const isSingleColumn = useSelector(state => state.device.isSingleColumn);
	const isModalOpen = useSelector(state => state.modal.id);
	const isSelectMode = props.isSelectMode || [PICKS_MULTIPLE_ITEMS, PICKS_SINGLE_ITEM].includes(pickerMode);
	const columnsData = useSelector(state => state.preferences[columnsKey]);
	const errorCount = useSelector(state => get(state, ['traffic', requestType, 'errorCount'], 0));
	const { field: sortByPreference, sort: sortDirectionPreference } = columnsData.find(c => c.sort) || {};
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
		dispatch(fetchSource({ startIndex: Math.max(startIndex - offset, 0), stopIndex,
			itemsSource, libraryKey, collectionKey, isTrash, isMyPublications, search: q, qmode, tags,
			sortBy: sortByPreference, sortDirection: sortDirectionPreference }))

		lastRequest.current = { startIndex, stopIndex };
	}, [collectionKey, dispatch, injectPoints, isMyPublications, isTrash, itemsSource, libraryKey, qmode, q, sortByPreference, sortDirectionPreference, tags]);

	const getItemData = useCallback((index) => {
		return keys && keys[index] ? keys[index] : null;
	}, [keys]);

	useEffect(() => {
		if ((scrollToRow !== null || pickerMode) && !hasChecked && !isFetching) {
			let startIndex = pickerMode ? 0 : Math.max(scrollToRow - 20, 0);
			let stopIndex = pickerMode ? 50 : scrollToRow + 50;
			dispatch(fetchSource({ startIndex, stopIndex, itemsSource, libraryKey, collectionKey,
				isTrash, isMyPublications, search: q, qmode, tags, sortBy: sortByPreference,
				sortDirection: sortDirectionPreference })
			);

			lastRequest.current = { startIndex, stopIndex };
		}
	}, [dispatch, isFetching, hasChecked, scrollToRow, itemsSource, libraryKey, collectionKey, isTrash, isMyPublications, q, qmode, tags, pickerMode, sortByPreference, sortDirectionPreference]);

	useEffect(() => {
		if (errorCount > 0 && errorCount > prevErrorCount) {
			const { startIndex, stopIndex } = lastRequest.current;
			if (typeof (startIndex) === 'number' && typeof (stopIndex) === 'number') {
				dispatch(fetchSource({ startIndex, stopIndex, itemsSource, libraryKey,
					collectionKey, isTrash, isMyPublications, search: q, qmode, tags,
					sortBy: sortByPreference, sortDirection: sortDirectionPreference })
				);
			}
		}
		if (errorCount > 3 && prevErrorCount === 3) {
			dispatch(connectionIssues());
		} else if (errorCount === 0 && prevErrorCount > 0) {
			dispatch(connectionIssues(true));
		}
	}, [collectionKey, dispatch, errorCount, isMyPublications, isTrash, itemsSource, libraryKey, prevErrorCount, qmode, q, sortByPreference, sortDirectionPreference, tags]);

	useEffect(() => {
		if ((typeof prevSortBy === 'undefined' && typeof prevSortDirection === 'undefined') || (prevSortBy === sortBy && prevSortDirection === sortDirection)) {
			return;
		}

		if (isFetching) {
			dispatch(abortAllRequests(requestType));
			setTimeout(() => {
				const { startIndex, stopIndex } = lastRequest.current;
				if (typeof (startIndex) === 'number' && typeof (stopIndex) === 'number') {
					dispatch(fetchSource({ startIndex, stopIndex, itemsSource, libraryKey,
						collectionKey, isTrash, isMyPublications, search: q, qmode, tags,
						sortBy: sortByPreference, sortDirection: sortDirectionPreference })
					);
				}
			}, 0)
		}
	}, [collectionKey, dispatch, isFetching, isMyPublications, isTrash, itemsSource, libraryKey, prevSortBy, prevSortDirection, qmode, requestType, q, sortBy, sortByPreference, sortDirection, sortDirectionPreference, tags, totalResults]);

	return (
		<List
			isReady={hasChecked}
			extraItemData={{ libraryKey, collectionKey, itemsSource, selectedItemKeys, q, qmode, isSelectMode, pickerNavigate, pickerPick, pickerMode }}
			getItemData={getItemData}
			isItemLoaded={isItemLoaded}
			itemCount={itemCount}
			listClassName={cx({ 'select-mode': isSelectMode })}
			onLoadMore={handleLoadMore}
			setScrollToRow={setScrollToRow}
			listRef={listRef}
			listItemComponent={ListRow}
			scrollToRow={scrollToRow}
			totalResults={totalResults}
		>
			{
				!pickerMode && (
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
				{!hasChecked && (pickerMode || (!isModalOpen && !isSearchModeHack)) && <Spinner className="large" />}
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
	columnsKey: PropTypes.string,
	isSearchMode: PropTypes.bool,
	isSearchModeTransitioning: PropTypes.bool,
	isSelectMode: PropTypes.bool,
	itemsSource: PropTypes.string.isRequired,
	libraryKey: PropTypes.string,
	selectedItemKeys: PropTypes.arrayOf(PropTypes.string),
	view: PropTypes.string,
	pickerNavigate: PropTypes.func,
	pickerPick: PropTypes.func,
	pickerMode: PropTypes.number,
	isTrash: PropTypes.bool,
	isMyPublications: PropTypes.bool,
	q: PropTypes.string,
	qmode: PropTypes.string,
	tags: PropTypes.array
};

export default memo(ItemsList);
