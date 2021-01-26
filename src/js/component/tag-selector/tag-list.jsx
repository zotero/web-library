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
import { checkColoredTags, deleteTags, fetchTags } from '../../actions';
import Spinner from '../ui/spinner';
import { pick } from '../../common/immutable';
import { get, noop } from '../../utils';
import { maxColoredTags } from '../../constants/defaults';

const ROWHEIGHT = 43;
const PAGESIZE = 100;

const TagDotMenu = memo(({ onToggleTagManager }) => {
	const [isOpen, setIsOpen] = useState(false);
	const dispatch = useDispatch()
	const tagColorsLength = useSelector(state => get(state, ['libraries', state.current.libraryKey, 'tagColors', 'value', 'length'], 0));

	const handleToggle = useCallback(ev => {
		ev.stopPropagation();
		setIsOpen(!isOpen);
	}, [isOpen]);

	const handleAssignColourClick = useCallback(ev => {
		const tag = ev.currentTarget.closest('[data-tag]').dataset.tag;
		onToggleTagManager(tag);
	}, [onToggleTagManager]);

	const handleDeleteTagClick = useCallback(ev => {
		const tag = ev.currentTarget.closest('[data-tag]').dataset.tag;
		dispatch(deleteTags([tag]));
	}, [dispatch]);


	return (
		<Dropdown
			isOpen={ isOpen }
			toggle={ handleToggle }
		>
			<DropdownToggle
				tabIndex={ -3 }
				className="btn-icon dropdown-toggle"
				color={ null }
				title="More"
				onClick={ handleToggle }
			>
				<Icon type={ '24/options-sm' } width="24" height="24" className="touch" />
				<Icon type={ '16/options' } width="16" height="16" className="mouse" />
			</DropdownToggle>
			<DropdownMenu right>
				<DropdownItem
					disabled={ tagColorsLength >= maxColoredTags }
					onClick={ handleAssignColourClick }
				>
					Assign Colour
				</DropdownItem>
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
	const { tags, toggleTag, isManager, ...rest } = data;
	const tag = tags[index];

	const className = cx({
		tag: true,
		odd: (index + 1) % 2 === 1,
		placeholder: !tag
	});

	const handleClick =  useCallback(() => toggleTag(tag.tag), [tag, toggleTag]);

	return (
		<li
			data-tag={ tag ? tag.tag : null }
			style={ style }
			className={ className }
			onClick={ tag && handleClick }
		>
			<div className="tag-color" style={ tag && (tag.color && { color: tag.color }) } />
			<div className="truncate">{ tag && tag.tag }</div>
			{ isManager && tag && <TagDotMenu { ...pick(rest, ['onToggleTagManager']) } /> }
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

	const tagsSearchString = useSelector(state => state.current.tagsSearchString);
	const tagsHideAutomatic = useSelector(state => state.current.tagsHideAutomatic);
	const isFilteringOrHideAutomatic = (tagsSearchString !== '' || tagsHideAutomatic);
	const selectedTagsCount = selectedTags.length;
	const prevHasChecked = usePrevious(hasChecked);

	const [isBusy] = useDebounce(!hasChecked || (isFetching && isFilteringOrHideAutomatic), 100);

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
							<List
								className="tag-selector-list"
								height={ height }
								itemCount={ isFilteringOrHideAutomatic ? tags.length : hasChecked ? totalResults - duplicatesCount - selectedTagsCount : 0 }
								itemData={ { tags, toggleTag, isManager, ...pick(rest, ['onToggleTagManager']) } }
								itemSize={ ROWHEIGHT }
								onItemsRendered={ onItemsRendered }
								ref={ ref }
								width={ width }
							>
								{ TagListRow }
							</List>
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
