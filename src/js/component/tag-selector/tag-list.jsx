import AutoSizer from 'react-virtualized-auto-sizer';
import cx from 'classnames';
import InfiniteLoader from "react-window-infinite-loader";
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useRef, useState, memo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { useDebounce } from "use-debounce";
import { useDispatch, useSelector } from 'react-redux';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap/lib';

import Icon from '../ui/icon';
import { usePrevious, useTags } from '../../hooks';
import { checkColoredTags, fetchTags, navigate, removeColorAndDeleteTag, removeTagColor } from '../../actions';
import Spinner from '../ui/spinner';
import { pick } from '../../common/immutable';
import { get, noop } from '../../utils';
import { maxColoredTags } from '../../constants/defaults';
import { useFocusManager } from '../../hooks';

const ROWHEIGHT = 43;
const PAGESIZE = 100;

const TagDotMenu = memo(({ onDotMenuToggle, onToggleTagManager, hasColor, isDotMenuOpen, focusNext, focusPrev }) => {
	const dispatch = useDispatch()
	const tagColorsLength = useSelector(state => get(state, ['libraries', state.current.libraryKey, 'tagColors', 'value', 'length'], 0));
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
			toggle={ onDotMenuToggle }
		>
			<DropdownToggle
				tabIndex={ -3 }
				className="btn-icon dropdown-toggle"
				color={ null }
				title="More"
				onClick={ onDotMenuToggle }
			>
				<Icon type={ '24/options-sm' } width="24" height="24" className="touch" />
				<Icon type={ '16/options' } width="16" height="16" className="mouse" />
			</DropdownToggle>
			<DropdownMenu right>
				<DropdownItem
					disabled={ tagColorsLength >= maxColoredTags }
					onClick={ handleAssignColorClick }
				>
					Assign Colour
				</DropdownItem>
				{ hasColor && (
					<DropdownItem
						onClick={ handleRemoveColorClick }
					>
						Remove Colour
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

const TagListRow = memo(props => {
	const { data, index, style } = props;
	const { dotMenuFor, tags, toggleTag, isManager, focusNext, focusPrev, focusDrillDownNext, focusDrillDownPrev, onDotMenuToggle, ...rest } = data;
	const tag = tags[index];

	const className = cx({
		tag: true,
		odd: (index + 1) % 2 === 1,
		placeholder: !tag
	});

	const handleClick = useCallback(() => toggleTag(tag.tag), [tag, toggleTag]);

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
		}
	}, [focusNext, focusPrev, focusDrillDownPrev, focusDrillDownNext, onDotMenuToggle]);

	return (
		<li
			tabIndex={ -2 }
			data-tag={ tag ? tag.tag : null }
			style={ style }
			className={ className }
			onClick={ tag && handleClick }
			onKeyDown={ handleKeyDown }
		>
			<div className="tag-color" style={ tag && (tag.color && { color: tag.color }) } />
			<div className="truncate">{ tag && tag.tag }</div>
			{ isManager && tag && <TagDotMenu
				hasColor={ !!tag.color }
				isDotMenuOpen={ tag.tag === dotMenuFor }
				onDotMenuToggle={ onDotMenuToggle }
				{ ...pick(rest,  ['onToggleTagManager']) }
			/> }
		</li>
	);
});

TagListRow.displayName = 'TagListRow';

TagListRow.propTypes = {
	data: PropTypes.object,
	index: PropTypes.number,
	style: PropTypes.object,
};

// TagList is used in the ManageTags modal and in TouchTagSelector
const TagList = ({ toggleTag = noop, isManager = false, ...rest }) => {
	const dispatch = useDispatch();
	const loader = useRef(null);

	const { duplicatesCount, hasMoreItems, isFetchingColoredTags, isFetching, pointer, requests,
		tags, totalResults, selectedTags, hasChecked, hasCheckedColoredTags } = useTags(!isManager);

	const listRef = useRef(null);

	const tagsSearchString = useSelector(state => state.current.tagsSearchString);
	const tagsHideAutomatic = useSelector(state => state.current.tagsHideAutomatic);
	const isFilteringOrHideAutomatic = (tagsSearchString !== '' || tagsHideAutomatic);
	const selectedTagsCount = selectedTags.length;
	const prevHasChecked = usePrevious(hasChecked);
	const { receiveFocus, receiveBlur, focusNext, focusPrev, focusDrillDownNext, focusDrillDownPrev } = useFocusManager(listRef);
	const [isBusy] = useDebounce(!hasChecked || (isFetching && isFilteringOrHideAutomatic), 100);

	const [dotMenuFor, setDotMenuFor] = useState(null);

	const handleIsItemLoaded = useCallback(index => {
		if(tags && !!tags[index]) {
			return true; // loaded
		}
		return requests.some(r => index >= r[0] && index < r[1]); // loading
	}, [requests, tags]);

	const handleLoadMore = useCallback((startIndex, stopIndex) => {
		// pagination only happens if filtering disabled
		dispatch(fetchTags(startIndex, stopIndex));
	}, [dispatch]);

	const handleDotMenuToggle = useCallback(ev => {
		if(ev === null) {
			setDotMenuFor(null);
			return;
		}

		const tag = ev.currentTarget.closest('[data-tag]').dataset.tag;
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
		}
	}, [dispatch, hasChecked, prevHasChecked, isFetching]);

	useEffect(() => {
		// if we're filtering, we need to prefetch all matching tags under spinner
		// this is because filtering happens locally and we don't know the number of total results
		if(isFilteringOrHideAutomatic && !isFetching && hasMoreItems) {
			dispatch(fetchTags(pointer, pointer + PAGESIZE - 1));
		}
	}, [dispatch, isFilteringOrHideAutomatic, isFetching, hasMoreItems, pointer]);

	useEffect(() => {
		if(!hasCheckedColoredTags && !isFetchingColoredTags) {
			dispatch(checkColoredTags());
		}
	}, [dispatch, hasCheckedColoredTags, isFetchingColoredTags]);

	return (
		<div className="scroll-container">
			{ !isBusy ? (
				<AutoSizer>
				{({ height, width }) => (
					<InfiniteLoader
						ref={ loader }
						isItemLoaded={ handleIsItemLoaded }
						itemCount={ isFilteringOrHideAutomatic ? tags.length : totalResults }
						loadMoreItems={ handleLoadMore }
					>
						{({ onItemsRendered, ref }) => (
							<div
								tabIndex={ isManager  ? 0 : null }
								onFocus={ isManager  ? receiveFocus : noop }
								onBlur={ isManager  ? receiveBlur : noop }
								ref={ listRef }
								className="items-list"
								role="list"
								aria-multiselectable="true"
								aria-readonly="true"
								aria-label="items"
								aria-rowcount={ totalResults }
							>
								<List
									className="tag-selector-list"
									height={ height }
									itemCount={ isFilteringOrHideAutomatic ? tags.length : hasChecked ? totalResults - duplicatesCount - selectedTagsCount : 0 }
									itemData={ { tags, toggleTag, isManager, focusNext, focusPrev,
										focusDrillDownNext, focusDrillDownPrev, dotMenuFor,
										onDotMenuToggle: handleDotMenuToggle, ...pick(rest, ['onToggleTagManager']) }
									}
									itemSize={ ROWHEIGHT }
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
};

TagList.propTypes = {
	isManager: PropTypes.bool,
	toggleTag: PropTypes.func,
}

export default memo(TagList);
