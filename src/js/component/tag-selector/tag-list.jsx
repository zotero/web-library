import AutoSizer from 'react-virtualized-auto-sizer';
import cx from 'classnames';
import InfiniteLoader from "react-window-infinite-loader";
import PropTypes from 'prop-types';
import { forwardRef, useCallback, useEffect, useId, useImperativeHandle, useRef, useState, memo, } from 'react';
import { FixedSizeList as List } from 'react-window';
import { useDebounce } from "use-debounce";
import { useDispatch, useSelector } from 'react-redux';
import { Button, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Icon, Spinner } from 'web-common/components';
import { useFocusManager, usePrevious } from 'web-common/hooks';
import { isTriggerEvent, noop, omit, pick } from 'web-common/utils';

import { checkColoredTags, fetchTags, navigate, removeColorAndDeleteTag, removeTagColor } from '../../actions';
import { maxColoredTags } from '../../constants/constants';
import { useTags } from '../../hooks';
import { makeRequestsUpTo } from '../../utils';

const PAGESIZE = 100;

const TagDotMenu = memo(({ onDotMenuToggle, onToggleTagManager, hasColor, isDotMenuOpen }) => {
	const dispatch = useDispatch()
	const tagColorsLength = useSelector(state => state.libraries?.[state.current.libraryKey]?.tagColors?.value?.length ?? 0);
	const currentlySelectedTags = useSelector(state => state.current.tags);

	const handleRemoveColorClick = useCallback((ev) => {
		const tag = ev.currentTarget.closest('[data-tag]').dataset.tag;
		dispatch(removeTagColor(tag));
	}, [dispatch]);

	const handleAssignColorClick = useCallback(ev => {
		const tag = ev.currentTarget.closest('[data-tag]').dataset.tag;
		onToggleTagManager(tag);
	}, [onToggleTagManager]);

	const handleDeleteTagClick = useCallback(ev => {
		const tag = ev.currentTarget.closest('[data-tag]').dataset.tag;
		dispatch(removeColorAndDeleteTag(tag));
		if(tag && currentlySelectedTags.includes(tag)) {
			dispatch(navigate({ tags: currentlySelectedTags.filter(t => t !== tag) }));
		}
	}, [currentlySelectedTags, dispatch]);


	return (
		<Dropdown
			isOpen={ isDotMenuOpen }
			onToggle={ onDotMenuToggle }
			placement="bottom-end"
		>
			<DropdownToggle
				tabIndex={ -3 }
				className="btn-icon dropdown-toggle"
				title="More"
				onClick={ onDotMenuToggle }
			>
				<Icon type={ '24/options-sm' } width="24" height="24" className="touch" />
				<Icon type={ '16/options' } width="16" height="16" className="mouse" />
			</DropdownToggle>
			<DropdownMenu>
				<DropdownItem
					disabled={ tagColorsLength >= maxColoredTags }
					onClick={ handleAssignColorClick }
				>
					Assign Color
				</DropdownItem>
				{ hasColor && (
					<DropdownItem
						onClick={ handleRemoveColorClick }
					>
						Remove Color
					</DropdownItem>
				) }
				<DropdownItem
					onClick={ handleDeleteTagClick }
				>
					Delete Tag
				</DropdownItem>
			</DropdownMenu>
		</Dropdown>
	);
});

TagDotMenu.propTypes = {
	collection: PropTypes.object,
	dotMenuFor: PropTypes.string,
	isReadOnly: PropTypes.bool,
	opened: PropTypes.array,
	parentLibraryKey: PropTypes.string,
	setDotMenuFor: PropTypes.func,
	setOpened: PropTypes.func,
	setRenaming: PropTypes.func,
	addVirtual: PropTypes.func,
};

TagDotMenu.displayName = 'TagDotMenu';

const TagListItem = memo(props => {
	const { className, dotMenuFor, focusDrillDownNext, focusDrillDownPrev, focusNext, focusPrev,
	isManager, isSelected = false, onDotMenuToggle = noop, style, tag, toggleTag, index, ...rest } = props;
	const isTouchOrSmall = useSelector(state => state.device.isTouchOrSmall);
	const id = useId();

	const handleClick = useCallback(ev => {
		if(ev.type === 'click' && !isSelected) { // selected tags can only be removed by clicking on a 'minus' icon
			ev.currentTarget.blur();
			toggleTag(ev.currentTarget.dataset.tag);
		}
	}, [isSelected, toggleTag]);

	const handleUnselect = useCallback(ev => {
		if(isTriggerEvent(ev)) {
			ev.stopPropagation();
			ev.currentTarget.blur();
			toggleTag(ev.currentTarget.closest('[data-tag]').dataset.tag);
		}
	}, [toggleTag]);

	const handleKeyDown = useCallback(ev => {
		if(ev.key === 'ArrowDown' && ev.target === ev.currentTarget) {
			focusNext(ev);
			onDotMenuToggle(null);
		} else if(ev.key === 'ArrowUp' && ev.target === ev.currentTarget) {
			focusPrev(ev);
			onDotMenuToggle(null);
		} else if(ev.key === 'ArrowRight') {
			focusDrillDownNext(ev);
		} else if(ev.key === 'ArrowLeft') {
			focusDrillDownPrev(ev);
			onDotMenuToggle(null);
		} else if(isTriggerEvent(ev)) {
			ev.currentTarget.blur();
			toggleTag(ev.currentTarget.dataset.tag);
		}
	}, [focusNext, focusPrev, focusDrillDownPrev, focusDrillDownNext, onDotMenuToggle, toggleTag]);

	return (
		<li
			data-index={ index }
			aria-labelledby={ id }
			tabIndex={ tag ? -2 : null }
			data-tag={ tag ? tag.tag : null }
			style={ style }
			className={ cx({
				tag: true,
				placeholder: !tag,
			}, className) }
			onClick={ tag && handleClick }
			onKeyDown={ handleKeyDown }
		>
			<div className="tag-color" style={ tag && (tag.color && { color: tag.color }) } />
			<div
				id={ id }
				className="truncate"
			>
				{ tag && tag.tag }
			</div>
			{ isManager && tag && <TagDotMenu
				hasColor={ !!tag.color }
				isDotMenuOpen={ tag.tag === dotMenuFor }
				onDotMenuToggle={ onDotMenuToggle }
				{ ...pick(rest,  ['onToggleTagManager']) }
			/> }
			{ isSelected && (
				isTouchOrSmall ? (
				<Button
					className="btn-circle btn-secondary"
					onClick={ handleUnselect }
					onKeyDown={ handleUnselect }
				>
					<Icon type="16/minus-strong" width="16" height="16" />
				</Button>
			) : (
				<Button
					title="Delete Attachment"
					icon
					onClick={ handleUnselect }
					onKeyDown={ handleUnselect }
					tabIndex={ -3 }
				>
					<Icon type={ '16/minus-circle' } width="16" height="16" />
				</Button>
			)) }
		</li>
	);
});

TagListItem.displayName = 'TagListItem';

TagListItem.propTypes = {
	className: PropTypes.string,
	dotMenuFor: PropTypes.string,
	focusDrillDownNext: PropTypes.func,
	focusDrillDownPrev: PropTypes.func,
	focusNext: PropTypes.func,
	focusPrev: PropTypes.func,
	isManager: PropTypes.bool,
	isSelected: PropTypes.bool,
	onDotMenuToggle: PropTypes.func,
	style: PropTypes.object,
	tag: PropTypes.object,
	toggleTag: PropTypes.func,
};

const TagListRow = memo(({ data, index, ...rest }) => (
	<TagListItem
		index={ index }
		tag={ data.tags?.[index] }
		className={ cx({ odd: (index + 1) % 2 === 1 }) }
		{ ...omit(data, ['tags', 'index']) }
		{ ...rest }
	/>
));

TagListRow.displayName = 'TagListRow';

TagListRow.propTypes = {
	data: PropTypes.object.isRequired,
	index: PropTypes.number.isRequired,
};

// TagList is used in the ManageTags modal and in TouchTagSelector
const TagList = forwardRef(({ toggleTag = noop, isManager = false, ...rest }, ref) => {
	const dispatch = useDispatch();
	const loader = useRef(null);

	const { duplicatesCount, hasMoreItems, isFetchingColoredTags, isFetching, pointer,
		requests, tags, totalResults, selectedTags, hasChecked, hasCheckedColoredTags } = useTags(!isManager);

	const listRef = useRef(null);
	const requestedPointer = useRef([]);

	const isTouchOrSmall = useSelector(state => state.device.isTouchOrSmall);
	const tagsSearchString = useSelector(state => state.current.tagsSearchString);
	const tagsHideAutomatic = useSelector(state => state.current.tagsHideAutomatic);
	const isFilteringOrHideAutomatic = (tagsSearchString !== '' || tagsHideAutomatic);
	const wasFilteringOrHideAutomatic = usePrevious(isFilteringOrHideAutomatic);
	const selectedTagsCount = selectedTags.length;
	const prevHasChecked = usePrevious(hasChecked);
	const { receiveFocus, receiveBlur, focusNext, focusPrev, focusDrillDownNext, focusDrillDownPrev } = useFocusManager(listRef);
	const [isBusy] = useDebounce(!hasChecked || (isFetching && isFilteringOrHideAutomatic), 100);

	const [dotMenuFor, setDotMenuFor] = useState(null);

	useImperativeHandle(ref, () => ({
		focus: () => {
			if(listRef.current) {
				listRef.current.focus();
			}
		}
	}));

	const handleIsItemLoaded = useCallback(index => {
		if(tags && !!tags[index]) {
			return true; // loaded
		}
		return requests.some(r => index >= r[0] && index < r[1]); // loading
	}, [requests, tags]);



	const handleLoadMore = useCallback((_startIndex, stopIndex) => {
		// @NOTE: Pagination only happens if filtering disabled
		// @NOTE: Fetches entire pages of results, paralleled as needed, rather than what
		// 		  InfiniteLoader requested.
		// @NOTE: Adding duplicatesCount here is a band-aid rather than a proper fix. Tags, as
		// 		  returned by api, contain duplicates. These are counted and removed from the
		// 		  displayed list, which creates disrepentancy between list index and remote index so
		// 		  when infinite scroll asks for rows n through m, we actaully fetch n through m +
		// 		  duplicates count to be on the safe side. This works for as long as m + duplicates
		// 		  is less than maximum page allowed by the API.

		// prepare batches from pointer to stopIndex + duplicatesCount
		let maxWanted = stopIndex + duplicatesCount;
		let nextRequests = makeRequestsUpTo(pointer, maxWanted, PAGESIZE).filter(r => !requestedPointer.current.some(rp => rp.start === r.start && rp.stop === r.stop));
		requestedPointer.current.push(...nextRequests);

		return Promise.all(nextRequests.map(r => dispatch(fetchTags(r.start, r.stop))))
	}, [dispatch, duplicatesCount, pointer]);

	const handleDotMenuToggle = useCallback(ev => {
		if(ev === null) {
			setDotMenuFor(null);
			return;
		}
		const tag = ev.currentTarget?.closest ? ev.currentTarget.closest('[data-tag]').dataset.tag : null;
		setDotMenuFor(tag === dotMenuFor ? null : tag);
		ev.stopPropagation();
	}, [dotMenuFor]);

	useEffect(() => {
		if(hasChecked || isFetching) {
			return;
		}

		// runs on first mount (prevHasChecked is undefined) and whenever `hasChecked` becomes false
		// usually because tags have been discarded after edit or source has changed
		if(!hasChecked && (prevHasChecked === true || typeof(prevHasChecked) === 'undefined')) {
			dispatch(fetchTags(0, PAGESIZE - 1));
			requestedPointer.current = [];
		}
	}, [dispatch, hasChecked, prevHasChecked, isFetching]);

	useEffect(() => {
		// if we're filtering, we need to prefetch all matching tags under spinner
		// this is because filtering happens locally and we don't know the number of total results
		if (hasMoreItems && (isFilteringOrHideAutomatic && !wasFilteringOrHideAutomatic))  {
			Promise.all(makeRequestsUpTo(pointer, totalResults, PAGESIZE).map(r => dispatch(fetchTags(r.start, r.stop))));
		}
	}, [dispatch, hasMoreItems, isFilteringOrHideAutomatic, pointer, totalResults, wasFilteringOrHideAutomatic]);

	useEffect(() => {
		if(!hasCheckedColoredTags && !isFetchingColoredTags) {
			dispatch(checkColoredTags());
		}
	}, [dispatch, hasCheckedColoredTags, isFetchingColoredTags]);

	let itemCount = isFilteringOrHideAutomatic ? tags.length : hasChecked ? totalResults - duplicatesCount - selectedTagsCount : 0;
	let previousItemCount = usePrevious(itemCount);

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

	return (
		<div className="scroll-container">
			{ !isBusy ? (
				<AutoSizer>
				{({ height, width }) => (
					<InfiniteLoader
						ref={ loader }
						isItemLoaded={ handleIsItemLoaded }
						itemCount={ itemCount }
						loadMoreItems={ handleLoadMore }
					>
						{({ onItemsRendered, ref }) => (
							<div
								tabIndex={ tags.length > 0 ? 0 : null }
								onFocus={ tags.length > 0 ? receiveFocus : noop }
								onBlur={ tags.length > 0 ? receiveBlur : noop }
								ref={ listRef }
								role="list"
								aria-multiselectable="true"
								aria-readonly="true"
								aria-label="Tags"
								aria-rowcount={ totalResults }
							>
								<List
									className="tag-selector-list"
									height={ height }
									itemCount={ itemCount }
									itemData={ { tags, toggleTag, isManager, focusNext, focusPrev,
										focusDrillDownNext, focusDrillDownPrev, dotMenuFor,
										onDotMenuToggle: handleDotMenuToggle, ...pick(rest, ['onToggleTagManager']) }
									}
									itemSize={ isTouchOrSmall ? 43 : 28 }
									onItemsRendered={ onItemsRendered }
									ref={ ref }
									width={ width }
								>
									{ TagListRow }
								</List>
							</div>
						)}
					</InfiniteLoader>
				)}
				</AutoSizer>
			) : (
				<Spinner className="large centered" />
			) }
		</div>
	);
});

TagList.displayName = 'TagList';

TagList.propTypes = {
	isManager: PropTypes.bool,
	toggleTag: PropTypes.func,
}

export default memo(TagList);
export { TagListItem };
