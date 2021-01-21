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
import { useFocusManager, usePrevious, useTags } from '../../hooks';
import { checkColoredTags, deleteTags, fetchTags, updateTagColors } from '../../actions';
import Spinner from '../ui/spinner';
import ColorPicker from '../ui/color-picker';
import Button from '../ui/button';
import { pick } from '../../common/immutable';
import Select from '../form/select';
import { get } from '../../utils';

const ROWHEIGHT = 43;
const PAGESIZE = 100;

const colors = ['#FF6666', '#FF8C19', '#999999', '#5FB236', '#009980', '#2EA8E5', '#576DD9', '#A28AE5', '#A6507B' ];
const maxColorsCount = 9;

const pickAvailableTagColor = ((colors, tagColorsData) => {
	const tagColors = tagColorsData.map(tgc => tgc.color);
	return colors.find(c => !tagColors.includes(c));
});

const TagColorManager = ({ onToggleTagManager, tag }) => {
	const dispatch = useDispatch();
	const ref = useRef(null);
	const { lookup: tagColorsLookup, value: tagColors } = useSelector(state => state.libraries[state.current.libraryKey].tagColors)
	const { receiveFocus, receiveBlur, focusDrillDownPrev, focusDrillDownNext } = useFocusManager(ref);
	const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);

	const indexInTagColors = tagColors.findIndex(tc => tag === tc.name);
	const options = [...Array.from({ length: tagColors.length }, (_, i) => i), indexInTagColors === -1 ? tagColors.length : null]
		.filter(o => o !== null)
		.map(o => ({ label: o.toString(), value: o.toString() }));
	const [tagColor, setTagColor] = useState(indexInTagColors === -1 ? pickAvailableTagColor(colors, tagColors) : tagColors[indexInTagColors].color);
	const [position, setPosition] = useState(indexInTagColors === -1 ? tagColors.length.toString() : indexInTagColors.toString());

	const handleColorPicked = useCallback(newColor => {
		setTagColor(newColor);
		setIsColorPickerOpen(false);
	}, []);

	const handleCancelClick = useCallback(() => {
		onToggleTagManager(null)
	}, [onToggleTagManager]);

	const handleToggleColorPicker = useCallback(() => {
		setIsColorPickerOpen(!isColorPickerOpen);
	}, [isColorPickerOpen]);

	const handlePositionChange = useCallback(newPosition => {
		setPosition(newPosition);
	}, []);

	const handleSetColor = useCallback(() => {
		const newTagColors = [...tagColors];
		if(indexInTagColors !== -1) {
			newTagColors.splice(indexInTagColors, 1);
		}
		newTagColors.splice(position, 0, { name: tag, color: tagColor });
		dispatch(updateTagColors(newTagColors));
		onToggleTagManager(null);
	}, [dispatch, indexInTagColors, onToggleTagManager, position, tag, tagColor, tagColors]);

	return (
		<div
			ref={ ref }
			onBlur={ receiveBlur }
			onFocus={ receiveFocus }
			className="tag-color-manager form"
		>
			<div className="form-group form-row">
				<label className="col-form-label">Color:</label>
				<div className="col">
					<Dropdown
						isOpen={ isColorPickerOpen }
						toggle={ handleToggleColorPicker }
						className="btn-group"
					>
						<div onClick={ handleToggleColorPicker }
							onKeyDown={ handleToggleColorPicker }
							tabIndex={ -2 }
							className="color-swatch"
							style={ { backgroundColor: tagColor } }
						>
						</div>
						<DropdownToggle
							color={ null }
							className="btn-icon dropdown-toggle"
							onKeyDown={ handleToggleColorPicker }
							tabIndex={ -2 }
						>
							<Icon type="16/chevron-9" className="touch" width="16" height="16" />
							<Icon type="16/chevron-7" className="mouse" width="16" height="16" />
						</DropdownToggle>
						<ColorPicker
							colors={ colors }
							onColorPicked={ handleColorPicked }
							onDrillDownPrev={ focusDrillDownPrev }
							onDrillDownNext={ focusDrillDownNext }
						/>
					</Dropdown>
				</div>
				<label className="col-form-label">Position:</label>
				<div className="col">
					<Select
						inputGroupClassName={ cx('position-selector') }
						clearable={ false }
						searchable={ false }
						value={ position }
						tabIndex={ 0 }
						options={ options }
						onChange={ () => true /* commit on change */ }
						onCommit={ handlePositionChange }
					/>
				</div>
			</div>
			<div>
				You can add this tag to selected items by pressing the {position} key on the keyboard.
			</div>
			<div>
				Up to {maxColorsCount} tags in each library can have colours assigned.
			</div>
			<div>
				<Button>
					Remove Color
				</Button>
				<Button onClick={ handleCancelClick } >
					Cancel
				</Button>
				<Button onClick={ handleSetColor } >
					Set Color
				</Button>
			</div>
		</div>
	)
}

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
				{
					<React.Fragment>
					{
					<DropdownItem
						disabled={ tagColorsLength === maxColorsCount }
						onClick={ handleAssignColourClick }
					>
						Assign Colour
					</DropdownItem>
					}
					<DropdownItem
						onClick={ handleDeleteTagClick }
					>
						Delete Tag
					</DropdownItem>
					</React.Fragment>
				}
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

const TouchTagListRow = memo(props => {
	const { data, index, style } = props;
	const { tags, toggleTag, ...rest } = data;
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
			{ tag && <TagDotMenu { ...pick(rest, ['onToggleTagManager']) } /> }
		</li>
	);
});

TouchTagListRow.displayName = 'TouchTagListRow';

TouchTagListRow.propTypes = {
	data: PropTypes.object,
	index: PropTypes.number,
	style: PropTypes.object,
};

const TouchTagList = ({ toggleTag, ...rest }) => {
	const dispatch = useDispatch();
	const loader = useRef(null);

	const { duplicatesCount, hasMoreItems, isFetching, pointer, requests, tags, totalResults, selectedTags, hasChecked } = useTags(true);
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
			dispatch(checkColoredTags());
		}
	}, [dispatch, hasChecked, prevHasChecked, isFetching]);

	useEffect(() => {
		// if we're filtering, we need to prefetch all matching tags under spinner
		// this is because filtering happens locally and we don't know the number of total results
		if(isFilteringOrHideAutomatic && !isFetching && hasMoreItems) {
			dispatch(fetchTags(pointer, pointer + PAGESIZE - 1));
		}
	}, [dispatch, isFilteringOrHideAutomatic, isFetching, hasMoreItems, pointer]);

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
								itemData={ { tags, toggleTag, ...pick(rest, ['onToggleTagManager']) } }
								itemSize={ ROWHEIGHT }
								onItemsRendered={ onItemsRendered }
								ref={ ref }
								width={ width }
							>
								{ TouchTagListRow }
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

TouchTagList.propTypes = {
	toggleTag: PropTypes.func,
}

export { TagColorManager };
export default memo(TouchTagList);
