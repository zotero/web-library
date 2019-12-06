import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import cx from 'classnames';

import AutoSizer from 'react-virtualized-auto-sizer';
import InfiniteLoader from "react-window-infinite-loader";
import { FixedSizeList as List } from 'react-window';

import columnNames from '../../../constants/column-names';
import { fetchSource, navigate, openAttachment } from '../../../actions';
import { useSourceData } from '../../../hooks';
import Icon from '../../ui/icon';
// import CustomTable from '../../../react-virtualized/custom-table';

const ROWHEIGHT = 26;

const Cell = props => {
	const { width, index, children, columnName } = props;

	return (
		<div
			style={ { width } }
			aria-colindex={ index }
			className={ cx('metadata', columnName) }
		>
			{ children }
		</div>
	)
}

const HeaderRow = props => {
	const { columns, width } = props;

	return (
		<div className="items-table-head" style={ { height: ROWHEIGHT, width } }>
			{ columns.map((c, colIndex) => (
				<Cell
					width={ c.fraction * width }
					key={ c.field }
					columnName={ c.field }
					index={ colIndex }
				>
					<div className="header-label truncate">
						{ c.field in columnNames ? columnNames[c.field] : c.field }
					</div>
				</Cell>
			))}
		</div>
	);
}

const DataCell = props => {
	const { columnName, colIndex, width, isFocused, isActive, itemData } = props;
	const dvp = window.devicePixelRatio >= 2 ? 2 : 1;

	return (
		<Cell
			width={ width }
			columnName={ columnName }
			index={ colIndex }
		>
			{ columnName === 'title' && (
				<Icon
					type={ `16/item-types/light/${dvp}x/${itemData.iconName}` }
					symbol={ isFocused && isActive ? `${itemData.iconName}-white` : itemData.iconName }
					width="16"
					height="16"
				/>
			)}
			<div className="truncate">
				{ itemData[columnName] }
			</div>
			{ columnName === 'title' && (
				<div className="tag-colors">
					{ itemData.colors.map((color, index) => (
						<Icon
							key={ color }
							type={ index === 0 ? '10/circle' : '10/crescent-circle' }
							symbol={ index === 0 ?
								(isFocused && isActive ? 'circle-focus' : 'circle') :
								(isFocused && isActive ? 'crescent-circle-focus' : 'crescent-circle')
							}
							width={ index === 0 ? 10 : 7 }
							height="10"
							style={ { color } }
						/>
					)) }
				</div>
			) }
		</Cell>
	);
}

const PlaceholderCell = props => {
	const { columnName, colIndex, width } = props;
	return (
		<Cell
			width={ width }
			columnName={ columnName }
			index={ colIndex }
		>
			{ columnName === 'title' && <div className="placeholder-icon" /> }
			<div className="placeholder" />
		</Cell>
	);
}

const selectItem = (itemKey, ev, keys, selectedItemKeys, dispatch) => {
	const isCtrlModifier = ev.getModifierState('Control') || ev.getModifierState('Meta');
	const isShiftModifier = ev.getModifierState('Shift');
	var newKeys;

	if(isShiftModifier) {
		let startIndex = selectedItemKeys.length ? keys.findIndex(key => key && key === selectedItemKeys[0]) : 0;
		let endIndex = keys.findIndex(key => key && key === itemKey);
		let isFlipped = false;
		if(startIndex > endIndex) {
			[startIndex, endIndex] = [endIndex, startIndex];
			isFlipped = true;
		}

		endIndex++;
		newKeys = keys.slice(startIndex, endIndex);
		if(isFlipped) {
			newKeys.reverse();
		}
	} else if(isCtrlModifier) {
		if(selectedItemKeys.includes(itemKey)) {
			newKeys = selectedItemKeys.filter(key => key !== itemKey);
		} else {
			newKeys = [...(new Set([...selectedItemKeys, itemKey]))];
		}
	} else {
		newKeys = [itemKey];
	}
	dispatch(navigate({ items: newKeys }));
}

const Row = props => {
	const dispatch = useDispatch();
	const ignoreClicks = useRef({});
	const { data, index, style } = props;
	const { isFocused, keys, width, columns } = data;
	const itemKey = keys ? keys[index] : null;
	const itemData = useSelector(
		state => itemKey ?
			state.libraries[state.current.libraryKey].items[itemKey][Symbol.for('derived')]
			: null
	);
	const selectedItemKeys = useSelector(state => state.current.itemKey ?
		[state.current.itemKey] : state.current.itemKeys,
		shallowEqual
	);
	const isActive = itemKey && selectedItemKeys.includes(itemKey);

	const className = cx('item', {
		odd: (index + 1) % 2 === 1,
		'nth-4n-1': (index + 2) % 4 === 0,
		'nth-4n': (index + 1) % 4 === 0,
		active: isActive
	});

	//@NOTE: In order to allow item selection on "mousedown" (#161)
	//		 this event fires twice, once on "mousedown", once on "click".
	//		 Click events are discarded unless "mousedown" could
	//		 have been triggered as a drag event in which case "mousedown"
	//		 is ignored and "click" is used instead, if occurs.
	const handleMouseEvent = event => {
		if(itemData) {
			const isSelected = selectedItemKeys.includes(itemKey);
			if(selectedItemKeys.length > 1 &&
				isSelected && event.type === 'mousedown') {
				// ignore a "mousedown" when user might want to drag items
				return;
			} else {
				if(selectedItemKeys.length > 1 && isSelected &&
					event.type === 'click') {
					const isFollowUp = itemKey in ignoreClicks.current &&
						Date.now() - ignoreClicks.current[itemKey] < 500;

					if(isFollowUp) {
						// ignore a follow-up click, it has been handled as "mousedown"
						return;
					} else {
						// handle a "click" event that has been missed by "mousedown" handler
						// in anticipation of potential drag that has never happened
						selectItem(itemKey, event, keys, selectedItemKeys, dispatch);
						delete ignoreClicks.current[itemKey];
						return
					}
				}
				//@TODO: handle double click to open attachment
				// if(event.type === 'dblclick' && item.attachmentItemKey) {
				// 	openAttachment(item.attachmentItemKey, getAttachmentUrl, true);
				// }
			}
			if(event.type === 'mousedown') {
				// finally handle mousedowns as select events
				ignoreClicks.current[itemKey] = Date.now();
				selectItem(itemKey, event, keys, selectedItemKeys, dispatch);
			}
		}
	}

	return (
		<div
			className={ className }
			style={ style }
			data-index={ index }
			onClick={ handleMouseEvent }
			onDoubleClick={ handleMouseEvent }
			onMouseDown={ handleMouseEvent }
		>
			{ columns.map((c, colIndex) => itemData ? (
				<DataCell
					key={ c.field }
					colIndex={ colIndex }
					columnName={ c.field }
					isActive={ isActive }
					isFocused={ isFocused }
					itemData={ itemData }
					width={ c.fraction * width }
				/>
			) : <PlaceholderCell
				key={ c.field }
				width={ c.fraction * width }
				colIndex={ colIndex }
				columnName={ c.field }
			/> ) }
		</div>
	);
}

const Table = props => {
	const containerDom = useRef(null);
	const loader = useRef(null);
	const [isResizing, setIsResizing] = useState(false);
	const [isReordering, setIsReordering] = useState(false);
	const [isFocused, setIsFocused] = useState(false);
	const { hasChecked, isFetching, keys, totalResults } = useSourceData();
	const columnsData = useSelector(state => state.preferences.columns, shallowEqual);
	const columns = useMemo(() => columnsData.filter(c => c.isVisible), [columnsData]);
	const { field: sortBy, sort: sortDirection } = useMemo(() =>
		columnsData.find(column => 'sort' in column) || { field: 'title', sort: 'ASC' },
		[columnsData]
	);
	const selectedItemKeys = useSelector(state => state.current.itemKey ?
		[state.current.itemKey] : state.current.itemKeys,
		shallowEqual
	);

	const dispatch = useDispatch();
	const handleKeyDown = useCallback(() => {});
	const handleFocus = useCallback(ev => {
		ev.preventDefault();
		if(selectedItemKeys.length === 0 && keys.length > 0) {
			dispatch(navigate({
				items: [keys[0]]
			}));
		}
		setIsFocused(true);
	});

	const handleBlur = useCallback(() => {
		setIsFocused(false);
	});

	const handleIsItemLoaded = useCallback(index => keys && !!keys[index]);
	const handleLoadMore = useCallback((startIndex, stopIndex) => {
		dispatch(fetchSource(startIndex, stopIndex))
	});
	const handleRowMouseEvent = useCallback(() => {});

	useEffect(() => {
		if(!hasChecked && !isFetching) {
			dispatch(fetchSource(0, 50));
		}
	}, []);

	return (
		<div
			ref={ containerDom }
			onKeyDown={ handleKeyDown }
			className={cx('items-table-wrap', {
				resizing: isResizing,
				reordering: isReordering,
				// 'dnd-target': (isOver && canDrop) || isHoveringBetweenRows
			}) }
		>
			{ hasChecked ? (
				<AutoSizer>
				{({ height, width }) => (
					<InfiniteLoader
						isItemLoaded={ handleIsItemLoaded }
						itemCount={ totalResults }
						loadMoreItems={ handleLoadMore }
					>
						{({ onItemsRendered, ref }) => (
							<div
								className="items-table"
								onFocus={ handleFocus }
								onBlur={ handleBlur }
								tabIndex={ 0 }
							>
								<HeaderRow
									columns={ columns }
									width={ width }
								/>
								<List
									className="items-table-body"
									height={ height }
									itemCount={ totalResults }
									itemData={ { isFocused, columns, width, keys } }
									itemSize={ ROWHEIGHT }
									onItemsRendered={ onItemsRendered }
									ref={ ref }
									width={ width }
								>
									{ Row }
								</List>
							</div>
						)}
					</InfiniteLoader>
				)}
				</AutoSizer>
			) : null }
		</div>
	)
}

export default Table;
