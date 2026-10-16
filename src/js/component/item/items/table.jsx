import cx from 'classnames';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { NativeTypes } from 'react-dnd-html5-backend';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { useDrop } from 'react-dnd';
import { useFocusManager, usePrevious } from 'web-common/hooks';
import { isTriggerEvent, noop } from 'web-common/utils';
import { Spinner } from 'web-common/components';

import columnProperties from '../../../constants/column-properties';
import TableRow from './table-row';
import { get, applyChangesToVisibleColumns, getRequestTypeFromItemsSource } from '../../../utils';
import { ATTACHMENT } from '../../../constants/dnd';
import {
	abortAllRequests, currentTrashOrDelete, createAttachmentsFromDropped, connectionIssues, fetchSource,
	navigate, navigateSelectItemsKeyboard, selectFirstItem, selectLastItem, preferenceChange,
	triggerHighlightedCollections, currentRemoveColoredTags, currentToggleTagByIndex, updateItemsSorting,
	sortItemsSecondary
} from '../../../actions';
import { useItemsState } from '../../../hooks';
import { isDelKeyDown, isHighlightKeyDown } from '../../../common/event';
import ScrollEffectComponent from './scroll-effect';
import { ROW_HEIGHT } from '../../../constants/constants';
import { selectItemsKeyboard } from '../../../common/selection';
import Table from '../../common/table';
import { PICKS_MULTIPLE_ITEMS } from '../../../constants/picker-modes';


const ItemsTable = props => {
	const { libraryKey, collectionKey, columnsKey, itemsSource, pickerMode = false,
		pickerNavigate = noop, pickerPick = noop, isAdvancedSearch = false,
		selectedItemKeys = [], isTrash, isMyPublications, q, qmode, tags } = props;
	const headerRef = useRef(null);
	const tableRef = useRef(null);
	const listRef = useRef(null);
	const outerRef = useRef(null);
	const lastRequest = useRef({});
	const pendingFocusRef = useRef(null);
	const pendingSelectionRef = useRef(null);
	const [isHoveringBetweenRows, setIsHoveringBetweenRows] = useState(false);
	const {
		injectPoints, isFetching, keys, hasChecked, totalResults, sortBy, sortDirection, requests
	} = useItemsState({ libraryKey, collectionKey, itemsSource });
	const requestType = getRequestTypeFromItemsSource(itemsSource);
	const errorCount = useSelector(state => get(state, ['traffic', requestType, 'errorCount'], 0));
	const isEmbedded = useSelector(state => state.config.isEmbedded);
	const columnsData = useSelector(state => state.preferences[columnsKey]);
	const { field: sortByPreference, sort: sortDirectionPreference } = useSelector(state => state.preferences[columnsKey].find(c => c.sort) || {}, shallowEqual);
	const prevSortByPreference = usePrevious(sortByPreference);
	const prevSortDirectionPreference = usePrevious(sortDirectionPreference);
	const isFileUploadAllowedInLibrary = useSelector(
		state => (state.config.libraries.find(
			l => l.key === state.current.libraryKey
		) || {}).isFileUploadAllowed
	);

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

	const focusRow = useCallback((index) => {
		if (pendingFocusRef.current) {
			cancelAnimationFrame(pendingFocusRef.current);
			pendingFocusRef.current = null;
		}

		if (index === -1) {
			focusBySelector('.items-table-head');
		} else if (index !== null) {
			const selector = `[data-index="${index}"]`;
			if (tableRef.current.querySelector(selector)) {
				focusBySelector(selector);
			} else {
				// Target row isn't in the DOM yet -- react-window hasn't
				// rendered it. Park focus on the table container to prevent
				// focus loss when the old row unmounts, then retry until the
				// target row appears.
				tableRef.current.focus();
				let retries = 0;
				const tryFocus = () => {
					if (tableRef.current?.querySelector(selector)) {
						focusBySelector(selector);
						pendingFocusRef.current = null;
					} else if (retries < 10) {
						retries++;
						pendingFocusRef.current = requestAnimationFrame(tryFocus);
					} else {
						pendingFocusRef.current = null;
					}
				};
				pendingFocusRef.current = requestAnimationFrame(tryFocus);
			}
		}
	}, [focusBySelector]);

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
		dispatch(fetchSource({ startIndex: Math.max(startIndex - offset, 0), stopIndex, itemsSource,
			libraryKey, collectionKey, isTrash, isMyPublications, search: q, qmode, tags,
			sortBy: sortByPreference, sortDirection: sortDirectionPreference })
		);

		lastRequest.current = { startIndex, stopIndex };
	}, [collectionKey, dispatch, injectPoints, isMyPublications, isTrash, itemsSource, libraryKey, qmode, q, sortByPreference, sortDirectionPreference, tags]);

	const handleFileHoverOnRow = useCallback((isOverRow, dropZone) => {
		setIsHoveringBetweenRows(isOverRow && dropZone !== null);
	}, []);

	const handleKeyUp = useCallback(ev => {
		if (!isHighlightKeyDown(ev)) {
			dispatch(triggerHighlightedCollections(false));
		}
	}, [dispatch]);

	const handleKeyDown = useCallback(async ev => {
		const prevPendingIndex = pendingSelectionRef.current?.index ?? undefined;
		pendingSelectionRef.current = null;
		var direction, magnitude = 1;
		if (isEmbedded && isTriggerEvent(ev)) {
			dispatch(navigate({ view: 'item-details' }));
			return;
		} else if (ev.key === 'ArrowUp') {
			direction = -1;
		} else if (ev.key === 'ArrowDown') {
			direction = 1;
		} else if (!pickerMode && isDelKeyDown(ev)) {
			dispatch(currentTrashOrDelete());
			dispatch(navigate({ items: [], noteKey: null, attachmentKey: null }));
			return;
		} else if (ev.key === 'Home') {
			if(pickerMode && keys.length) {
				listRef.current?.scrollToRow?.({ index: 0, align: 'smart' });
				if (keys[0]) {
					pickerNavigate({ library: libraryKey, collection: collectionKey, search: q, qmode, items: [keys[0]], view: 'item-list' });
				} else {
					pendingSelectionRef.current = {
						index: 0,
						shiftKeys: ev.getModifierState('Shift') && pickerMode === PICKS_MULTIPLE_ITEMS
							? selectedItemKeys : null
					};
				}
				focusRow(0);
			} else {
				const index = await dispatch(selectFirstItem());
				if (index !== null) {
					focusRow(index);
				} else if (keys.length > 0) {
					listRef.current?.scrollToRow?.({ index: 0, align: 'smart' });
					pendingSelectionRef.current = { index: 0, shiftKeys: ev.getModifierState('Shift') ? selectedItemKeys : null };
					focusRow(0);
				}
			}
			return;
		} else if (ev.key === 'End') {
			if(pickerMode && keys.length) {
				listRef.current?.scrollToRow?.({ index: keys.length - 1, align: 'smart' });
				if (keys[keys.length - 1]) {
					pickerNavigate({ library: libraryKey, collection: collectionKey, search: q, qmode, items: [keys[keys.length - 1]], view: 'item-list' });
				} else {
					pendingSelectionRef.current = {
						index: keys.length - 1,
						shiftKeys: ev.getModifierState('Shift') && pickerMode === PICKS_MULTIPLE_ITEMS
							? selectedItemKeys : null
					};
				}
				focusRow(keys.length - 1);
			} else {
				const index = await dispatch(selectLastItem());
				if (index !== null) {
					focusRow(index);
				} else if (keys.length > 0) {
					listRef.current?.scrollToRow?.({ index: keys.length - 1, align: 'smart' });
					pendingSelectionRef.current = { index: keys.length - 1, shiftKeys: ev.getModifierState('Shift') ? selectedItemKeys : null };
					focusRow(keys.length - 1);
				}
			}
			return;
		} else if (ev.key === 'PageUp' && outerRef.current) {
			direction = -1;
			magnitude = Math.floor(outerRef.current.getBoundingClientRect().height / ROW_HEIGHT)
			ev.preventDefault();
		} else if (ev.key === 'PageDown' && outerRef.current) {
			direction = 1;
			magnitude = Math.floor(outerRef.current.getBoundingClientRect().height / ROW_HEIGHT);
			ev.preventDefault();
		} else if (!pickerMode && Array.from({ length: 9 }, (_, i) => (i + 1).toString()).includes(ev.key)) {
			dispatch(currentToggleTagByIndex(parseInt(ev.key) - 1));
			return;
		} else if (!pickerMode && ev.key === '0') {
			dispatch(currentRemoveColoredTags());
			return;
		} else if (!pickerMode && isHighlightKeyDown(ev)) {
			dispatch(triggerHighlightedCollections(true));
			return;
		}

		if (!direction) {
			return;
		}

		ev.preventDefault();

		const { nextKeys, cursorIndex } = pickerMode ?
			selectItemsKeyboard(direction, magnitude, ev.getModifierState('Shift') && pickerMode === PICKS_MULTIPLE_ITEMS, { keys, selectedItemKeys, overrideStartIndex: prevPendingIndex }) :
			await dispatch(navigateSelectItemsKeyboard(direction, magnitude, ev.getModifierState('Shift')));

		if (pickerMode && nextKeys) {
			pickerNavigate({ library: libraryKey, collection: collectionKey, items: nextKeys, search: q, qmode, view: 'item-list' });
			// ScrollEffectComponent is not rendered in picker mode, so scroll explicitly
			listRef.current?.scrollToRow?.({ index: cursorIndex, align: 'smart' });
		}

		// When navigating to an unfetched item (sparse array hole), nextKeys is
		// undefined and no selection change is dispatched, so the scroll effect
		// won't fire. Manually scroll to the target index.
		if (typeof nextKeys === 'undefined' && cursorIndex >= 0) {
			listRef.current?.scrollToRow?.({ index: cursorIndex, align: 'smart' });
			const isShiftExtend = pickerMode
				? ev.getModifierState('Shift') && pickerMode === PICKS_MULTIPLE_ITEMS
				: ev.getModifierState('Shift');
			pendingSelectionRef.current = { index: cursorIndex, shiftKeys: isShiftExtend ? selectedItemKeys : null };
		}

		focusRow(cursorIndex);
	}, [isEmbedded, pickerMode, keys, selectedItemKeys, dispatch, pickerNavigate, libraryKey, collectionKey, q, qmode, focusRow]);

	const handleTableFocus = useCallback(async ev => {
		const hasChangedFocused = receiveFocus(ev);
		if (hasChangedFocused) {
			if (pickerMode && !selectedItemKeys?.length && keys?.length && tableRef.current) {
				pickerNavigate({ library: libraryKey, collection: collectionKey, items: [keys[0]], search: q, qmode, view: 'item-list' });
			} else if(!pickerMode) {
				const index = await dispatch(selectFirstItem(true));
				if (index !== null && tableRef.current) {
					focusBySelector('[data-index="0"]');
				}
			}
		}
	}, [collectionKey, dispatch, focusBySelector, keys, libraryKey, pickerMode, pickerNavigate, q, qmode, receiveFocus, selectedItemKeys?.length]);

	const handleTableBlur = useCallback(ev => {
		const didBlur = receiveBlur(ev);
		if (didBlur) {
			pendingSelectionRef.current = null;
		}
	}, [receiveBlur]);

	const handleColumnsResize = useCallback(newVisibleColumns => {
		const newColumnsData = columnsData.map(c => ({ ...c }));
		dispatch(preferenceChange(columnsKey, applyChangesToVisibleColumns(newVisibleColumns, newColumnsData)));
	}, [columnsData, columnsKey, dispatch]);

	const handleColumnsReorder = useCallback((reorderCurrentIndex, reorderTargetIndex) => {
		const fieldFrom = columns[reorderCurrentIndex].field;
		const fieldTo = columns[reorderTargetIndex].field;
		const indexFrom = columnsData.findIndex(c => c.field === fieldFrom);
		const indexTo = columnsData.findIndex(c => c.field === fieldTo);

		if (indexFrom > -1 && indexTo > -1) {
			const newColumns = columnsData.map(c => ({ ...c }));
			newColumns.splice(indexTo, 0, newColumns.splice(indexFrom, 1)[0]);
			dispatch(preferenceChange(columnsKey, newColumns));
		}
	}, [columns, columnsData, columnsKey, dispatch]);

	const handleSortOrderChange = useCallback((columnName) => {
		const newDirection = columnName === sortByPreference ? sortDirectionPreference === 'asc' ? 'desc' : 'asc' : 'asc'
		if (itemsSource === 'secondary') {
			dispatch(sortItemsSecondary(columnName, newDirection));
		}
		// primary sorting will be dispatched by the preference observer
		dispatch(updateItemsSorting(columnsKey, columnName, newDirection));
	}, [columnsKey, dispatch, itemsSource, sortByPreference, sortDirectionPreference]);

	useEffect(() => {
		// Initial fetch for cases where loadMore does not trigger (e.g., when
		// totalResults is unknown—such as in the main library view, trash, or
		// My Publications). In these scenarios, we either scroll to the item
		// from the URL (for the main items table) or, if this is a picker,
		// fetch the first page of results.
		if ((scrollToRow !== null || pickerMode) && !hasChecked && !isFetching) {
			let startIndex = pickerMode ? 0 : Math.max(scrollToRow - 20, 0);
			let stopIndex = pickerMode ? 50 : scrollToRow + 50;
			dispatch(fetchSource({ startIndex, stopIndex, itemsSource, libraryKey, collectionKey,
				isTrash, isMyPublications, search: q, qmode, tags,
				sortBy: sortByPreference, sortDirection: sortDirectionPreference })
			);
			lastRequest.current = { startIndex, stopIndex };
		}
	}, [dispatch, isFetching, hasChecked, scrollToRow, itemsSource, libraryKey, collectionKey, isTrash, isMyPublications, q, qmode, tags, pickerMode, sortByPreference, sortDirectionPreference]);

	useEffect(() => {
		if ((typeof prevSortByPreference === 'undefined' && typeof prevSortDirectionPreference === 'undefined') || (prevSortByPreference === sortByPreference && prevSortDirectionPreference === sortDirectionPreference)) {
			return;
		}

		// if we were fetching when sort changed, we need to abort the current request and re-fetch
		if (isFetching) {
			dispatch(abortAllRequests(requestType));
			setTimeout(() => {
				const { startIndex, stopIndex } = lastRequest.current;
				if (typeof (startIndex) === 'number' && typeof (stopIndex) === 'number') {
					dispatch(fetchSource({
						startIndex, stopIndex, itemsSource, libraryKey,
						collectionKey, isTrash, isMyPublications, search: q, qmode, tags,
						sortBy: sortByPreference, sortDirection: sortDirectionPreference
					})
					);
				}
			}, 0)
		}
	}, [collectionKey, dispatch, isFetching, isMyPublications, isTrash, itemsSource, libraryKey, prevSortByPreference, prevSortDirectionPreference, qmode, requestType, q, sortBy, sortByPreference, sortDirection, sortDirectionPreference, tags]);

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

	// When a keyboard navigation lands on an unfetched item (sparse array hole),
	// no selection is dispatched. Once the item loads, dispatch the navigation so
	// the row gets highlighted and arrow keys work from the new position.
	useEffect(() => {
		const pending = pendingSelectionRef.current;
		if (pending !== null && keys[pending.index]) {
			pendingSelectionRef.current = null;
			let items = null;

			if (pending.shiftKeys?.length > 0) {
				// Shift was held -- try to extend selection from anchor to target
				const anchorKey = pending.shiftKeys[0];
				const anchorIndex = keys.findIndex(k => k && k === anchorKey);
				if (anchorIndex !== -1) {
					const startIndex = Math.min(anchorIndex, pending.index);
					const endIndex = Math.max(anchorIndex, pending.index);
					const rangeKeys = keys.slice(startIndex, endIndex + 1);
					// Only use range if all items in between are fetched.
					// Note: keys is a sparse array -- .every() skips empty
					// slots, so use a for loop to detect holes reliably.
					let hasHoles = false;
					for (let i = 0; i < rangeKeys.length; i++) {
						if (typeof rangeKeys[i] === 'undefined') {
							hasHoles = true;
							break;
						}
					}
					if (!hasHoles) {
						items = anchorIndex <= pending.index ? rangeKeys : [...rangeKeys].reverse();
					}
				}
			}

			// Fallback: select only the target item
			if (!items) {
				items = [keys[pending.index]];
			}

			if (pickerMode) {
				pickerNavigate({ library: libraryKey, collection: collectionKey,
					search: q, qmode, items, view: 'item-list' });
				listRef.current?.scrollToRow?.({ index: pending.index, align: 'smart' });
			} else {
				dispatch(navigate({ items, noteKey: null, attachmentKey: null }));
			}
		}
	}, [keys, dispatch, pickerMode, pickerNavigate, libraryKey, collectionKey, q, qmode]);

	// Clear stale pending selection when the view changes
	useEffect(() => {
		pendingSelectionRef.current = null;
	}, [libraryKey, collectionKey, itemsSource]);

	useEffect(() => {
		return () => {
			if (pendingFocusRef.current) {
				cancelAnimationFrame(pendingFocusRef.current);
			}
		};
	}, []);

	return <Table
			columns={columns}
			containerClassName={cx({ 'dnd-target': (isOver && canDrop) || isHoveringBetweenRows })}
			drop={drop}
			extraItemData={{ onFileHoverOnRow: handleFileHoverOnRow, libraryKey, collectionKey, itemsSource, selectedItemKeys, pickerMode, pickerNavigate, pickerPick, q, qmode }}
			getItemData={noop}
			headerRef={headerRef}
			isReady={hasChecked}
			isItemLoaded={handleIsItemLoaded}
			itemCount={itemCount}
			listRef={listRef}
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
			{!hasChecked && (pickerMode || !isModalOpen) && <Spinner large />}
			{isAdvancedSearch && (
				<div className="table-cover">
					Advanced search mode — press Enter to search.
				</div>
			)}
	</Table>
};

export default memo(ItemsTable);
