import cx from 'classnames';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { NativeTypes } from 'react-dnd-html5-backend';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { useDrop } from 'react-dnd';
import { useFocusManager, usePrevious } from 'web-common/hooks';
import { isTriggerEvent, noop } from 'web-common/utils';
import { Spinner } from 'web-common/components';
import PropTypes from 'prop-types';

import columnProperties from '../../../constants/column-properties';
import TableRow from './table-row';
import { get, applyChangesToVisibleColumns, getRequestTypeFromItemsSource } from '../../../utils';
import { ATTACHMENT } from '../../../constants/dnd';
import {
	abortAllRequests, currentTrashOrDelete, createAttachmentsFromDropped, connectionIssues, fetchSource,
	navigate, navigateSelectItemsKeyboard, selectFirstItem, selectLastItem, preferenceChange,
	triggerHighlightedCollections, currentRemoveColoredTags, currentToggleTagByIndex, updateItemsSorting
} from '../../../actions';
import { useItemsState } from '../../../hooks';
import { isDelKeyDown, isHighlightKeyDown } from '../../../common/event';
import ScrollEffectComponent from './scroll-effect';
import { ROW_HEIGHT } from '../../../constants/constants';
import Table from '../../common/table';


const ItemsTable = props => {
	const { libraryKey, collectionKey, itemsSource, pickerMode = false, pickerNavigate = noop, pickerPick = noop, isAdvancedSearch = false, selectedItemKeys = [], isTrash, isMyPublications, search, qmode, tags } = props
	const headerRef = useRef(null);
	const tableRef = useRef(null);
	const listRef = useRef(null);
	const outerRef = useRef(null);
	const loader = useRef(null);
	const lastRequest = useRef({});
	const [isHoveringBetweenRows, setIsHoveringBetweenRows] = useState(false);
	const {
		injectPoints, isFetching, keys, hasChecked, totalResults, sortBy, sortDirection, requests
	} = useItemsState({ libraryKey, collectionKey, itemsSource });
	const prevSortBy = usePrevious(sortBy);
	const prevSortDirection = usePrevious(sortDirection);
	const requestType = getRequestTypeFromItemsSource(itemsSource);
	const errorCount = useSelector(state => get(state, ['traffic', requestType, 'errorCount'], 0));
	const isEmbedded = useSelector(state => state.config.isEmbedded);
	const { field: sortByPreference, sort: sortDirectionPreference } = useSelector(state => state.preferences.columns.find(c => c.sort) || {}, shallowEqual);
	const isFileUploadAllowedInLibrary = useSelector(
		state => (state.config.libraries.find(
			l => l.key === state.current.libraryKey
		) || {}).isFileUploadAllowed
	);
	const columnsData = useSelector(state => state.preferences.columns);
	const isMyLibrary = useSelector(state =>
		(state.config.libraries.find(l => l.key === state.current.libraryKey) || {}).isMyLibrary
	);
	const isModalOpen = useSelector(state => state.modal.id);
	const prevErrorCount = usePrevious(errorCount);
	const isFileUploadAllowed = isFileUploadAllowedInLibrary && !['trash', 'publications'].includes(itemsSource);
	const [scrollToRow, setScrollToRow] = useState(null);
	const itemCount = hasChecked ? totalResults : 0;

	const columns = useMemo(() => {
		const columns = columnsData
			.filter(c => c.isVisible)
			.filter(c => !isMyLibrary || (isMyLibrary && !(c.field in columnProperties && columnProperties[c.field].excludeInMyLibrary)));

		var sumOfFractions = columns.reduce((aggr, c) => aggr + c.fraction, 0);
		if (sumOfFractions != 1) {
			let difference = sumOfFractions - 1; // overflow if positive, underflow if negative
			let adjustEachBy = difference / columns.length;
			let counter = 1;
			do {
				for (var i = 0; i < columns.length; i++) {
					const available = columns[i].fraction - columns[i].minFraction;
					// avoid dealing with very small numbers
					if ((Math.abs(difference) < 0.001 || counter > 10) && available > difference) {
						columns[i].fraction -= difference;
						difference = 0;
						break;
					}
					const reduceThisBy = Math.min(available, adjustEachBy);
					difference -= reduceThisBy;
					columns[i].fraction -= reduceThisBy;
				}
				adjustEachBy = difference / columns.length;
			} while (difference !== 0);
		}
		return columns;
	}, [columnsData, isMyLibrary]);

	const { receiveFocus, receiveBlur, focusBySelector } = useFocusManager(
		tableRef, { initialQuerySelector: ['[aria-selected="true"]', '[data-index="0"]'] }
	);

	const dispatch = useDispatch();

	const [{ isOver, canDrop }, drop] = useDrop({
		accept: [ATTACHMENT, NativeTypes.FILE],
		canDrop: () => isFileUploadAllowed,
		collect: monitor => ({
			isOver: monitor.isOver({ shallow: true }),
			canDrop: monitor.canDrop(),
		}),
		drop: (props, monitor) => {
			if (monitor.isOver({ shallow: true })) { //ignore if dropped on a row (which is handled there)
				const itemType = monitor.getItemType();
				const item = monitor.getItem();

				if (itemType === ATTACHMENT) {
					return { collection: collectionKey, library: libraryKey };
				}

				if (itemType === NativeTypes.FILE) {
					dispatch(createAttachmentsFromDropped(item.files, { collection: collectionKey }));
					return;
				}
			}
		}
	});

	const handleIsItemLoaded = useCallback(index => {
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
		dispatch(fetchSource({ startIndex: Math.max(startIndex - offset, 0), stopIndex, itemsSource, libraryKey, collectionKey, isTrash, isMyPublications, search, qmode, tags }))
		lastRequest.current = { startIndex, stopIndex };
	}, [collectionKey, dispatch, injectPoints, isMyPublications, isTrash, itemsSource, libraryKey, qmode, search, tags]);

	const handleFileHoverOnRow = useCallback((isOverRow, dropZone) => {
		setIsHoveringBetweenRows(isOverRow && dropZone !== null);
	}, []);

	const handleKeyUp = useCallback(ev => {
		if (!isHighlightKeyDown(ev)) {
			dispatch(triggerHighlightedCollections(false));
		}
	}, [dispatch]);

	const handleKeyDown = useCallback(async ev => {
		var direction, magnitude = 1;
		if (isEmbedded && isTriggerEvent(ev)) {
			dispatch(navigate({ view: 'item-details ' }));
			return;
		} else if (ev.key === 'ArrowUp') {
			direction = -1;
		} else if (ev.key === 'ArrowDown') {
			direction = 1;
		} else if (isDelKeyDown(ev)) {
			dispatch(currentTrashOrDelete());
			dispatch(navigate({ items: [], noteKey: null, attachmentKey: null }));
			return;
		} else if (ev.key === 'Home') {
			dispatch(selectFirstItem());
		} else if (ev.key === 'End') {
			dispatch(selectLastItem());
		} else if (ev.key === 'PageUp' && outerRef.current) {
			direction = -1;
			magnitude = Math.floor(outerRef.current.getBoundingClientRect().height / ROW_HEIGHT)
			ev.preventDefault();
		} else if (ev.key === 'PageDown' && outerRef.current) {
			direction = 1;
			magnitude = Math.floor(outerRef.current.getBoundingClientRect().height / ROW_HEIGHT);
			ev.preventDefault();
		} else if (Array.from({ length: 9 }, (_, i) => (i + 1).toString()).includes(ev.key)) {
			dispatch(currentToggleTagByIndex(parseInt(ev.key) - 1));
			return;
		} else if (ev.key === '0') {
			dispatch(currentRemoveColoredTags());
			return;
		} else if (isHighlightKeyDown(ev)) {
			dispatch(triggerHighlightedCollections(true));
			return;
		}

		if (!direction) {
			return;
		}

		ev.preventDefault();

		const cursorIndex = await dispatch(navigateSelectItemsKeyboard(direction, magnitude, ev.getModifierState('Shift')));

		if (cursorIndex === -1 && document.activeElement?.closest('.items-table-head') !== headerRef.current) {
			focusBySelector('.items-table-head');
		} else {
			focusBySelector(`[data-index="${cursorIndex}"]`);
		}
	}, [dispatch, isEmbedded, focusBySelector]);

	const handleTableFocus = useCallback(async ev => {
		const hasChangedFocused = receiveFocus(ev);
		if (hasChangedFocused) {
			if (pickerMode && selectedItemKeys.length === 0 && keys.length && tableRef.current) {
				pickerNavigate({ library: libraryKey, collection: collectionKey, items: [keys[0]], view: 'item-list' });
			} else if(!pickerMode) {
				const index = await dispatch(selectFirstItem(true));
				if (index !== null && tableRef.current) {
					focusBySelector('[data-index="0"]');
				}
			}
		}
	}, [collectionKey, dispatch, focusBySelector, keys, libraryKey, pickerMode, pickerNavigate, receiveFocus, selectedItemKeys]);

	const handleTableBlur = useCallback(ev => {
		receiveBlur(ev);
	}, [receiveBlur]);

	const handleColumnsResize = useCallback(newVisibleColumns => {
		const newColumnsData = columnsData.map(c => ({ ...c }));
		dispatch(preferenceChange('columns', applyChangesToVisibleColumns(newVisibleColumns, newColumnsData)));
	}, [columnsData, dispatch]);

	const handleColumnsReorder = useCallback((reorderCurrentIndex, reorderTargetIndex) => {
		const fieldFrom = columns[reorderCurrentIndex].field;
		const fieldTo = columns[reorderTargetIndex].field;
		const indexFrom = columnsData.findIndex(c => c.field === fieldFrom);
		const indexTo = columnsData.findIndex(c => c.field === fieldTo);

		if (indexFrom > -1 && indexTo > -1) {
			const newColumns = columnsData.map(c => ({ ...c }));
			newColumns.splice(indexTo, 0, newColumns.splice(indexFrom, 1)[0]);
			dispatch(preferenceChange('columns', newColumns));
		}
	}, [columns, columnsData, dispatch]);

	const handleSortOrderChange = useCallback((columnName) => {
		dispatch(updateItemsSorting(
			columnName,
			columnName === sortByPreference ? sortDirectionPreference === 'asc' ? 'desc' : 'asc' : 'asc'
		));
	}, [dispatch, sortByPreference, sortDirectionPreference]);

	useEffect(() => {
		// Initial fetch for cases where loadMore does not trigger (e.g., when
		// totalResults is unknown—such as in the main library view, trash, or
		// My Publications). In these scenarios, we either scroll to the item
		// from the URL (for the main items table) or, if this is a picker,
		// fetch the first page of results.
		if ((scrollToRow !== null || pickerMode) && !hasChecked && !isFetching) {
			let startIndex = pickerMode ? 0 : Math.max(scrollToRow - 20, 0);
			let stopIndex = pickerMode ? 50 : scrollToRow + 50;
			dispatch(fetchSource({ startIndex, stopIndex, itemsSource, libraryKey, collectionKey, isTrash, isMyPublications, search, qmode, tags }));
			lastRequest.current = { startIndex, stopIndex };
		}
	}, [dispatch, isFetching, hasChecked, scrollToRow, itemsSource, libraryKey, collectionKey, isTrash, isMyPublications, search, qmode, tags, pickerMode]);

	useEffect(() => {
		if ((typeof prevSortBy === 'undefined' && typeof prevSortDirection === 'undefined') || (prevSortBy === sortBy && prevSortDirection === sortDirection)) {
			return;
		}

		if (loader.current) {
			// this will trigger `loadMoreItems` which in turn will call `handleLoadMore`
			loader.current.resetloadMoreItemsCache(true);
		}

		// if we were fetching when sort changed, we need to abort the current request and re-fetch
		if (isFetching) {
			dispatch(abortAllRequests(requestType));
			setTimeout(() => {
				const { startIndex, stopIndex } = lastRequest.current;
				if (typeof (startIndex) === 'number' && typeof (stopIndex) === 'number') {
					dispatch(fetchSource({ startIndex, stopIndex, itemsSource, libraryKey, collectionKey, isTrash, isMyPublications, search, qmode, tags }));
				}
			}, 0)
		}
	}, [collectionKey, dispatch, isFetching, isMyPublications, isTrash, itemsSource, libraryKey, prevSortBy, prevSortDirection, qmode, requestType, search, sortBy, sortDirection, tags]);

	useEffect(() => {
		document.addEventListener('keyup', handleKeyUp);
		return () => {
			document.removeEventListener('keyup', handleKeyUp)
		}
	}, [handleKeyUp]);

	useEffect(() => {
		if (errorCount > 0 && errorCount > prevErrorCount) {
			const { startIndex, stopIndex } = lastRequest.current;
			if (typeof (startIndex) === 'number' && typeof (stopIndex) === 'number') {
				dispatch(fetchSource({ startIndex, stopIndex, itemsSource, libraryKey, collectionKey, isTrash, isMyPublications, search, qmode, tags }));
			}
		}
		if (errorCount > 3 && prevErrorCount === 3) {
			dispatch(connectionIssues());
		} else if (errorCount === 0 && prevErrorCount > 0) {
			dispatch(connectionIssues(true));
		}
	}, [collectionKey, dispatch, errorCount, isMyPublications, isTrash, itemsSource, libraryKey, prevErrorCount, qmode, search, tags]);

	return <Table
			columns={columns}
			containerClassName={cx({ 'dnd-target': (isOver && canDrop) || isHoveringBetweenRows })}
			drop={drop}
			extraItemData={{ onFileHoverOnRow: handleFileHoverOnRow, libraryKey, collectionKey, itemsSource, selectedItemKeys, pickerMode, pickerNavigate, pickerPick }}
			getItemData={noop}
			headerRef={headerRef}
			isReady={hasChecked}
			isItemLoaded={handleIsItemLoaded}
			itemCount={itemCount}
			loaderRef={loader}
			onChangeSortOrder={handleSortOrderChange}
			onKeyDown={handleKeyDown}
			onLoadMore={handleLoadMore}
			onReceiveFocus={handleTableFocus}
			onReceiveBlur={handleTableBlur}
			onColumnsResize={handleColumnsResize}
			onColumnsReorder={handleColumnsReorder}
			outerRef={outerRef}
			rowComponent={TableRow}
			scrollToRow={scrollToRow}
			tableClassName="striped"
			tableRef={tableRef}
			totalResults={totalResults}
			sortBy={sortByPreference}
			sortDirection={sortDirectionPreference}
		>
			{!pickerMode && (
				<ScrollEffectComponent
					listRef={listRef}
					setScrollToRow={setScrollToRow}
					libraryKey={libraryKey}
					collectionKey={collectionKey}
					itemsSource={itemsSource}
					selectedItemKeys={selectedItemKeys}
				/>
			)}
			{!hasChecked && !isModalOpen && <Spinner className="large" />}
			{isAdvancedSearch && (
				<div className="table-cover">
					Advanced search mode — press Enter to search.
				</div>
			)}
	</Table>
};

ItemsTable.propTypes = {
	collectionKey: PropTypes.string,
	isAdvancedSearch: PropTypes.bool,
	itemsSource: PropTypes.string.isRequired,
	libraryKey: PropTypes.string,
	selectedItemKeys: PropTypes.arrayOf(PropTypes.string),
};

export default memo(ItemsTable);
