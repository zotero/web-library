import {AutoSizer} from 'react-virtualized-auto-sizer';
import cx from 'classnames';
import {forwardRef, memo, useCallback, useEffect, useId, useImperativeHandle, useRef, useState,} from 'react';
import {useDebounce} from "use-debounce";
import {useDispatch, useSelector} from 'react-redux';
import {Button, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Icon, Spinner} from 'web-common/components';
import {useFocusManager, usePrevious} from 'web-common/hooks';
import {isTriggerEvent, noop, omit, pick} from 'web-common/utils';
import {useInfiniteLoader} from "react-window-infinite-loader";

import {checkColoredTags, fetchTags, navigate, removeColorAndDeleteTag, removeTagColor} from '../../actions';
import {maxColoredTags} from '../../constants/constants';
import {useTags} from '../../hooks';
import {makeRequestsUpTo} from '../../utils';
import ReactWindowList from '../common/react-window-list';

const PAGESIZE = 100;

const TagDotMenu = memo(({onDotMenuToggle, onToggleTagManager, hasColor, isDotMenuOpen, tagName}) => {
	const dispatch = useDispatch()
	const tagColorsLength = useSelector(state => state.libraries?.[state.current.libraryKey]?.tagColors?.value?.length ?? 0);
	const currentlySelectedTags = useSelector(state => state.current.tags);

	const handleRemoveColorClick = useCallback(() => {
		dispatch(removeTagColor(tagName));
	}, [dispatch, tagName]);

	const handleAssignColorClick = useCallback(() => {
		onToggleTagManager(tagName);
	}, [onToggleTagManager, tagName]);

	const handleDeleteTagClick = useCallback(() => {
		dispatch(removeColorAndDeleteTag(tagName));
		if (tagName && currentlySelectedTags.includes(tagName)) {
			dispatch(navigate({tags: currentlySelectedTags.filter(t => t !== tagName)}));
		}
	}, [currentlySelectedTags, dispatch, tagName]);

	return (
		<Dropdown
			isOpen={isDotMenuOpen}
			onToggle={onDotMenuToggle}
			placement="bottom-end"
			portal={true}
			strategy="fixed"
		>
			<DropdownToggle
				tabIndex={-3}
				className="btn-icon dropdown-toggle"
				title="More"
				onClick={onDotMenuToggle}
			>
				<Icon type={'24/options-sm'} width="24" height="24" className="touch"/>
				<Icon type={'16/options'} width="16" height="16" className="mouse"/>
			</DropdownToggle>
			<DropdownMenu>
				<DropdownItem
					disabled={!hasColor && tagColorsLength >= maxColoredTags}
					onClick={handleAssignColorClick}
				>
					Assign Color
				</DropdownItem>
				{hasColor && (
					<DropdownItem
						onClick={handleRemoveColorClick}
					>
						Remove Color
					</DropdownItem>
				)}
				<DropdownItem
					onClick={handleDeleteTagClick}
				>
					Delete Tag
				</DropdownItem>
			</DropdownMenu>
		</Dropdown>
	);
});

TagDotMenu.displayName = 'TagDotMenu';

const TagListItem = memo(props => {
	const {
		className, dotMenuFor, onFocusJump, onFocusNext, onFocusPrev, isManager, isSelected = false,
		onDotMenuToggle = noop, style, tag, toggleTag, index, ...rest
	} = props;
	const isTouchOrSmall = useSelector(state => state.device.isTouchOrSmall);
	const itemRef = useRef(null);
	const {receiveFocus, receiveBlur, focusNext, focusPrev} = useFocusManager(itemRef, {
		isFocusable: true, targetTabIndex: -3
	});
	const id = useId();

	const handleClick = useCallback(ev => {
		if (ev.type === 'click' && !isSelected) { // selected tags can only be removed by clicking on a 'minus' icon
			ev.currentTarget.blur();
			toggleTag(ev.currentTarget.dataset.tag);
		}
	}, [isSelected, toggleTag]);

	const handleUnselect = useCallback(ev => {
		if (isTriggerEvent(ev)) {
			ev.stopPropagation();
			ev.currentTarget.blur();
			toggleTag(ev.currentTarget.closest('[data-tag]').dataset.tag);
		}
	}, [toggleTag]);

	const handleKeyDown = useCallback(ev => {
		if (ev.key === 'ArrowDown' && ev.target === ev.currentTarget) {
			onFocusNext(ev);
			onDotMenuToggle(null);
		} else if (ev.key === 'ArrowUp' && ev.target === ev.currentTarget) {
			onFocusPrev(ev);
			onDotMenuToggle(null);
		} else if ((ev.key === 'PageDown' || ev.key === 'PageUp' || ev.key === 'Home' || ev.key === 'End') && ev.target === ev.currentTarget) {
			onFocusJump(ev, index, ev.key);
		} else if (ev.key === 'ArrowRight') {
			focusNext(ev);
		} else if (ev.key === 'ArrowLeft') {
			focusPrev(ev);
			onDotMenuToggle(null);
		} else if (isTriggerEvent(ev)) {
			ev.currentTarget.blur();
			toggleTag(ev.currentTarget.dataset.tag);
		}
	}, [focusNext, focusPrev, index, onDotMenuToggle, onFocusJump, onFocusNext, onFocusPrev, toggleTag]);

	return (
		<li
			data-index={index}
			aria-labelledby={id}
			tabIndex={-2}
			data-tag={tag ? tag.tag : null}
			style={style}
			className={cx({
				tag: true,
				placeholder: !tag,
			}, className)}
			onClick={tag && handleClick}
			onKeyDown={handleKeyDown}
			ref={itemRef}
			onFocus={receiveFocus}
			onBlur={receiveBlur}
		>
			<div className="tag-color" data-color={tag?.color?.toLowerCase()}
				 style={tag && (tag.color && {color: tag.color})}/>
			<div
				id={id}
				className="truncate"
			>
				{tag && tag.tag}
			</div>
			{isManager && tag && <TagDotMenu
				tagName={tag.tag}
				hasColor={!!tag.color}
				isDotMenuOpen={tag.tag === dotMenuFor}
				onDotMenuToggle={onDotMenuToggle}
				{...pick(rest, ['onToggleTagManager'])}
			/>}
			{isSelected && (
				isTouchOrSmall ? (
					<Button
						className="btn-circle btn-secondary"
						onClick={handleUnselect}
						onKeyDown={handleUnselect}
					>
						<Icon type="16/minus-strong" width="16" height="16"/>
					</Button>
				) : (
					<Button
						title="Delete Attachment"
						icon
						onClick={handleUnselect}
						onKeyDown={handleUnselect}
						tabIndex={-3}
					>
						<Icon type={'16/minus-circle'} width="16" height="16"/>
					</Button>
				))}
		</li>
	);
});

TagListItem.displayName = 'TagListItem';

const TagListRow = memo(({index, tags, ...rest}) => (
	<TagListItem
		index={index}
		tag={tags?.[index]}
		className={cx({odd: (index + 1) % 2 === 1})}
		{...omit(tags, ['tags', 'index'])}
		{...rest}
	/>
));

TagListRow.displayName = 'TagListRow';

// TagList is used in the ManageTags modal and in TouchTagSelector
const TagList = forwardRef(({toggleTag = noop, isManager = false, ...rest}, ref) => {
	const dispatch = useDispatch();
	const loader = useRef(null);

	const {
		duplicatesCount, hasMoreItems, isFetchingColoredTags, isFetching, pointer,
		requests, tags, totalResults, selectedTags, hasChecked, hasCheckedColoredTags
	} = useTags(!isManager);

	const listRef = useRef(null);
	const requestedPointer = useRef([]);

	const isTouchOrSmall = useSelector(state => state.device.isTouchOrSmall);
	const tagsSearchString = useSelector(state => state.current.tagsSearchString);
	const tagsHideAutomatic = useSelector(state => state.current.tagsHideAutomatic);
	const isFilteringOrHideAutomatic = (tagsSearchString !== '' || tagsHideAutomatic);
	const wasFilteringOrHideAutomatic = usePrevious(isFilteringOrHideAutomatic);
	const selectedTagsCount = selectedTags.length;
	const prevHasChecked = usePrevious(hasChecked);
	const {receiveFocus, receiveBlur, focusBySelector, focusNext, focusPrev} = useFocusManager(listRef);
	const [isBusy] = useDebounce(!hasChecked || (isFetching && isFilteringOrHideAutomatic), 100);

	const [dotMenuFor, setDotMenuFor] = useState(null);
	const pendingFocusIndexRef = useRef(null);
	const itemCountRef = useRef(0);

	const focusRow = useCallback((index) => {
		// Keep the target index pending until react-window settles
		pendingFocusIndexRef.current = index;
		const selector = `[data-index="${index}"]`;
		if (listRef.current?.querySelector(selector)) {
			focusBySelector(selector);
		} else {
			// Target row isn't in the DOM yet -- park focus on the list container to prevent focus
			listRef.current?.focus();
		}
	}, [focusBySelector]);

	const handleFocusJump = useCallback((ev, currentIndex, key) => {
		if (itemCountRef.current <= 0) {
			return;
		}

		const rowHeight = isTouchOrSmall ? 43 : 28;
		const containerHeight = rwListRef.current?.element?.getBoundingClientRect()?.height ?? 0;
		const pageSize = Math.max(1, Math.floor(containerHeight / rowHeight));

		let targetIndex;
		if (key === 'Home') {
			targetIndex = 0;
		} else if (key === 'End') {
			targetIndex = itemCountRef.current - 1;
		} else if (key === 'PageDown') {
			targetIndex = Math.min(currentIndex + pageSize, itemCountRef.current - 1);
		} else if (key === 'PageUp') {
			targetIndex = Math.max(currentIndex - pageSize, 0);
		}

		ev.preventDefault();
		setDotMenuFor(null);
		rwListRef.current?.scrollToRow?.({index: targetIndex, align: 'smart'});
		focusRow(targetIndex);
	}, [focusRow, isTouchOrSmall]);

	useImperativeHandle(ref, () => ({
		focus: () => {
			if (listRef.current) {
				listRef.current.focus();
			}
		}
	}));

	const rwListRef = useRef(null);

	const handleRWListRef = useCallback(r => {
		rwListRef.current = r;
		// The overflow list is made focusable by default in most browsers, and to prevent this, we
		// need to set `tabIndex` to -1. However, since this element is rendered by react-window, we
		// cannot pass it as a prop. As a workaround, we set the tabIndex attribute directly here.
		r?.element?.setAttribute?.('tabindex', '-1');
	}, []);

	const handleIsItemLoaded = useCallback(index => {
		if (tags && !!tags[index]) {
			return true; // loaded
		}
		return requests.some(r => index >= r[0] && index < r[1]); // loading
	}, [requests, tags]);

	const handleLoadMore = useCallback((_startIndex, stopIndex) => {
		// @NOTE: Pagination only happens if filtering disabled
		// @NOTE: Fetches entire pages of results, parallelled as needed, rather than what
		// 		  InfiniteLoader requested.
		// @NOTE: Adding duplicatesCount here is a Band-Aid rather than a proper fix. Tags, as
		// 		  returned by api, contain duplicates. These are counted and removed from the
		// 		  displayed list, which creates a discrepancy between list index and remote index, so
		// 		  when infinite scroll asks for rows n through m, we actually fetch n through m +
		// 		  duplicates count to be on the safe side. This works for as long as `m + duplicates`
		// 		  is less than the maximum page allowed by the API.

		// prepare batches from pointer to stopIndex + duplicatesCount
		let maxWanted = stopIndex + duplicatesCount;
		let nextRequests = makeRequestsUpTo(pointer, maxWanted, PAGESIZE).filter(r => !requestedPointer.current.some(rp => rp.start === r.start && rp.stop === r.stop));
		requestedPointer.current.push(...nextRequests);

		return Promise.all(nextRequests.map(r => dispatch(fetchTags(r.start, r.stop))))
	}, [dispatch, duplicatesCount, pointer]);

	let itemCount = isFilteringOrHideAutomatic ? tags.length : hasChecked ? totalResults - duplicatesCount - selectedTagsCount : 0;
	itemCountRef.current = itemCount;
	let previousItemCount = usePrevious(itemCount);

	const onRowsRendered = useInfiniteLoader({
		isRowLoaded: handleIsItemLoaded,
		loadMoreRows: handleLoadMore,
		rowCount: itemCount,
	});

	const handleRowsRendered = useCallback(args => {
		onRowsRendered(args);
		if (pendingFocusIndexRef.current === null) {
			return;
		}
		const active = document.activeElement;
		const isFocusLost = active === null || active === document.body;
		const isParked = active === listRef.current;
		if (!isFocusLost && !isParked) {
			pendingFocusIndexRef.current = null;
			return;
		}
		const pendingRow = listRef.current?.querySelector(`[data-index="${pendingFocusIndexRef.current}"]`);
		if (pendingRow) {
			pendingFocusIndexRef.current = null;
			focusBySelector(pendingRow);
		} else if (isFocusLost) {
			// The focused row was unmounted before the target row rendered -- re-park focus on the
			// list container and wait for the next render.
			listRef.current?.focus();
		}
	}, [focusBySelector, onRowsRendered]);

	const handleDotMenuToggle = useCallback(ev => {
		if (ev === null) {
			setDotMenuFor(null);
			return;
		}
		const tag = ev.currentTarget?.closest?.('[data-tag]')?.dataset.tag ?? null;
		setDotMenuFor(tag === dotMenuFor ? null : tag);
		ev.stopPropagation();
	}, [dotMenuFor]);

	useEffect(() => {
		if (hasChecked || isFetching) {
			return;
		}

		// runs on first mount (prevHasChecked is undefined) and whenever `hasChecked` becomes false
		// usually because tags have been discarded after edit or source has changed
		if (!hasChecked && (prevHasChecked === true || typeof (prevHasChecked) === 'undefined')) {
			dispatch(fetchTags(0, PAGESIZE - 1));
			requestedPointer.current = [];
		}
	}, [dispatch, hasChecked, prevHasChecked, isFetching]);

	useEffect(() => {
		// if we're filtering, we need to prefetch all matching tags under spinner
		// this is because filtering happens locally and we don't know the number of total results
		if (hasMoreItems && (isFilteringOrHideAutomatic && !wasFilteringOrHideAutomatic)) {
			Promise.all(makeRequestsUpTo(pointer, totalResults, PAGESIZE).map(r => dispatch(fetchTags(r.start, r.stop))));
		}
	}, [dispatch, hasMoreItems, isFilteringOrHideAutomatic, pointer, totalResults, wasFilteringOrHideAutomatic]);

	useEffect(() => {
		if (!hasCheckedColoredTags && !isFetchingColoredTags) {
			dispatch(checkColoredTags());
		}
	}, [dispatch, hasCheckedColoredTags, isFetchingColoredTags]);

	useEffect(() => {
		// As more pages are fetched, duplicates counter goes up causing itemCount goes down.
		// Infinite loader gets confused by this and ends up displaying rows that are not there.
		// This is a workaround to reset the cache when itemCount changes.
		if (typeof previousItemCount !== 'undefined' && itemCount !== previousItemCount) {
			if (loader.current) {
				loader.current.resetloadMoreItemsCache(true);
			}
		}
	}, [itemCount, previousItemCount]);

	useEffect(() => {
		if (dotMenuFor === null) {
			return;
		}

		if (!rwListRef?.current) {
			return;
		}
		const handleScroll = () => setDotMenuFor(null);
		rwListRef.current.element.addEventListener('scroll', handleScroll, {passive: true, capture: true});
		return () => rwListRef.current?.element?.removeEventListener('scroll', handleScroll, {capture: true});
	}, [dotMenuFor]);

	return (
		<div className="tag-selector-list-container">
			{!isBusy ? (
				<AutoSizer renderProp={({height, width}) => {
					if (typeof width === 'undefined' || typeof height === 'undefined') {
						return null;
					}
					return (
						<div
							tabIndex={tags.length > 0 ? 0 : null}
							onFocus={tags.length > 0 ? receiveFocus : noop}
							onBlur={tags.length > 0 ? receiveBlur : noop}
							ref={listRef}
							role="list"
							aria-multiselectable="true"
							aria-readonly="true"
							aria-label="Tags"
							aria-rowcount={totalResults}
						>
							<ReactWindowList
								rowComponent={TagListRow}
								className="tag-selector-list"
								rowCount={itemCount}
								rowProps={{
									tags, toggleTag, isManager, onFocusJump: handleFocusJump,
									onFocusNext: focusNext, onFocusPrev: focusPrev,
									dotMenuFor,
									onDotMenuToggle: handleDotMenuToggle, ...pick(rest, ['onToggleTagManager'])
								}}
								rowHeight={isTouchOrSmall ? 43 : 28}
								onRowsRendered={handleRowsRendered}
								listRef={handleRWListRef}
								style={{width, height}}
							/>
						</div>
					)
				}}/>
			) : (
				<Spinner large className="centered" />
			)}
		</div>
	);
});

TagList.displayName = 'TagList';

export default memo(TagList);
export {TagListItem};
