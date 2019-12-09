import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import PropTypes from 'prop-types';
import cx from 'classnames';

import AutoSizer from 'react-virtualized-auto-sizer';
import InfiniteLoader from "react-window-infinite-loader";
import { FixedSizeList as List } from 'react-window';

import Icon from '../../ui/icon';
import Spinner from '../../ui/spinner';
import { useSourceData } from '../../../hooks';
import { fetchSource, navigate } from '../../../actions';

const ROWHEIGHT = 61;

const selectItem = (itemKey, selectedItemKeys, isSelectMode, dispatch) => {
	if(isSelectMode) {
		if(selectedItemKeys.includes(itemKey)) {
			dispatch(navigate({ items: selectedItemKeys.filter(key => key !== itemKey) }));
		} else {
			dispatch(navigate({ items: [...selectedItemKeys, itemKey] }));
		}
	} else {
		dispatch(navigate({ items: [itemKey], view: 'item-details' }));
	}
}

const Row = memo(props => {
	const { data, index, style } = props;
	const { handleFocus, handleBlur, keys } = data;
	const itemKey = keys && keys[index] ? keys[index] : null;
	const dispatch = useDispatch();
	const itemData = useSelector(
		state => itemKey ?
			state.libraries[state.current.libraryKey].items[itemKey][Symbol.for('derived')]
			: null
	);

	const isSingleColumn = useSelector(state => state.device.isSingleColumn);
	const view = useSelector(state => state.current.view);
	const isSelectMode = useSelector(state => state.current.isSelectMode);

	const shouldBeTabbable = (isSingleColumn && view === 'item-list') || !isSingleColumn;
	const selectedItemKeys = useSelector(state => state.current.itemKey ?
		[state.current.itemKey] : state.current.itemKeys,
		shallowEqual
	);

	const { title = '', creator = '', year = '', iconName = '', colors = [] } = itemData || {};
	const isActive = itemKey && selectedItemKeys.includes(itemKey);

	const className = cx({
		active: isActive,
		item: true,
		odd: (index + 1) % 2 === 1,
		placeholder: itemKey === null
	});

	const handleClick = useCallback(() => {
		selectItem(itemKey, selectedItemKeys, isSelectMode, dispatch);
	});

	const handleKeyDown = useCallback(ev => {
		const index = ev.currentTarget.dataset.index;

		if((ev.key === 'Enter' || (isSelectMode && ev.key === " ")) && keys[index]) {
			selectItem(keys[index], selectedItemKeys, isSelectMode, dispatch);
			ev.preventDefault();
		}
	});

	return (
		<div
			data-index={ index }
			className={ className }
			style={ style }
			onClick={ handleClick }
			onFocus={ handleFocus }
			onBlur={ handleBlur }
			onKeyDown={ handleKeyDown }
			tabIndex={ shouldBeTabbable ? 0 : null }
			role={ isSelectMode ? "checkbox" : null }
			aria-checked={ isSelectMode ? isActive ? "true" : "false" : null }
		>
			{ isSelectMode && itemKey !== null && (
				<input
					type="checkbox"
					tabIndex={ -1 }
					readOnly
					checked={ isActive }
				/>
			)}
			{ itemKey !== null ?
				<Icon
					type={ `28/item-types/light/${iconName}` }
					symbol={ isActive && !isSelectMode ? `${iconName}-active` : iconName }
					width="28"
					height="28"
					className="item-type hidden-xs-down"
				/> :
				<Icon
					type={ '28/item-type' }
					width="28"
					height="28"
					className="item-type hidden-xs-down"
				/>
			}
			<div className="flex-column">
				<div className="metadata title">
					{ title }
				</div>
				<div className="metadata creator-year">
					<div className="creator">
						{ creator}
					</div>
					<div className="year">
						{ year }
					</div>
					<div className="icons">
						{
							// currently blocked #191
							// <Icon type="16/attachment" width="16" height="16" />
							// <Icon type="16/note-sm" width="16" height="16" />
						}

						{ colors.map((color, index) => (
							<Icon
								key={ color }
								type={ index === 0 ? '12/circle' : '12/crescent-circle' }
								symbol={ index === 0 ?
									isActive ? 'circle-active' : 'circle' :
									isActive ? 'crescent-circle-active' : 'crescent-circle'
								}
								width={ index === 0 ? 12 : 8 }
								height="12"
								style={ { color } }
							/>
						))}
					</div>
				</div>
			</div>
			<Icon type={ '16/chevron-13' } width="16" height="16" />
		</div>
	);
});

Row.displayName = 'Row';

const ItemsList = () => {
	const loader = useRef(null);
	const [focusedRow, setFocusedRow] = useState(null);
	const dispatch = useDispatch();
	const { hasChecked, isFetching, keys, totalResults } = useSourceData();
	const isSelectMode = useSelector(state => state.current.isSelectMode);
	const columnsData = useSelector(state => state.preferences.columns, shallowEqual);

	const { field: sortBy, sort: sortDirection } = useMemo(() =>
		columnsData.find(column => 'sort' in column) || { field: 'title', sort: 'ASC' },
		[columnsData]
	);

	const selectedItemKeys = useSelector(state => state.current.itemKey ?
		[state.current.itemKey] : state.current.itemKeys,
		shallowEqual
	);

	const isLastItemFocused = totalResults && focusedRow === totalResults - 1;
	const isLastItemSelected = totalResults && keys && keys[totalResults - 1] &&
		selectedItemKeys.includes(keys[totalResults - 1]);

	const handleIsItemLoaded = useCallback(index => keys && !!keys[index]);
	const handleLoadMore = useCallback((startIndex, stopIndex) => {
		dispatch(fetchSource(startIndex, stopIndex))
	});

	const handleFocus = useCallback(ev => {
		const index = parseInt(ev.currentTarget.dataset.index, 10);
		setFocusedRow(index);
	});
	const handleBlur = useCallback(() => {
		setFocusedRow(null);
	});

	useEffect(() => {
		if(!hasChecked && !isFetching) {
			dispatch(fetchSource(0, 50));
		}
	}, []);

	useEffect(() => {
		if(loader.current) {
			loader.current.resetloadMoreItemsCache(true);
		}
	}, [sortBy, sortDirection, totalResults]);

	return (
		<div className="items-list-wrap">
			<AutoSizer>
			{({ height, width }) => (
				<InfiniteLoader
					ref={ loader }
					isItemLoaded={ handleIsItemLoaded }
					itemCount={ hasChecked ? totalResults : 0 }
					loadMoreItems={ handleLoadMore }
				>
					{({ onItemsRendered, ref }) => (
						<List
							className={ cx('items-list', {
								'editing': isSelectMode,
								'last-item-focus': isLastItemFocused,
								'last-item-active': isLastItemSelected,
							}) }
							height={ height }
							itemCount={ hasChecked ? totalResults : 0 }
							itemData={ { handleFocus, handleBlur, keys } }
							itemSize={ ROWHEIGHT }
							onItemsRendered={ onItemsRendered }
							ref={ ref }
							width={ width }
						>
							{ Row }
						</List>
					)}
				</InfiniteLoader>
			)}
			</AutoSizer>
			{ !hasChecked && <Spinner className="large" /> }
		</div>
	);
};

export default ItemsList;
