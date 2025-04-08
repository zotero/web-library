import { useCallback, useEffect, useRef, useState, memo } from 'react';
import { useSelector } from 'react-redux';
import cx from 'classnames';
import PropTypes from 'prop-types';
import AutoSizer from 'react-virtualized-auto-sizer';
import InfiniteLoader from "react-window-infinite-loader";
import { FixedSizeList as ReactWindowList } from 'react-window';
import { noop } from 'web-common/utils';

import { alwaysTrue, resizeVisibleColumns } from '../../utils';
import { useThrottledCallback } from 'use-debounce';
import HeaderRow from './table-header-row';
import TableBody from './table-body';
import TableRow from './table-row';
import { ROW_HEIGHT, SCROLL_BUFFER } from '../../constants/constants';


const getColumnCssVars = (columns, width, scrollbarWidth) =>
	Object.fromEntries(columns.map((c, i) => [
		`--col-${i}-width`,
		i === columns.length - 1 ? `${c.fraction * width - scrollbarWidth}px` : `${c.fraction * width}px`
	]));


const Table = props => {
	const {
		ariaLabel = "items",
		bodyClassName = null,
		children,
		columns,
		containerClassName = null,
		drop = null,
		extraItemData = {},
		getItemData,
		headerRef = null,
		innerRef = null,
		isReady = true,
		isItemLoaded = alwaysTrue,
		itemCount,
		loaderRef = null,
		onChangeSortOrder = noop,
		onColumnsReorder = noop,
		onColumnsResize = noop,
		onDoubleClick = noop,
		onKeyDown = noop,
		onLoadMore = noop,
		onReceiveBlur = noop,
		onReceiveFocus = noop,
		onSelect = noop,
		rowComponent = null,
		scrollToRow = 0,
		selectedIndexes = [],
		sortBy = null,
		sortDirection = null,
		tableClassName = null,
		totalResults,
	} = props;

	const RowComponent = rowComponent || TableRow;
	const scrollbarWidth = useSelector(state => state.device.scrollbarWidth);

	if (process.env.NODE_ENV === 'development') {
		if (!columns.find(c => c.field === 'title')) {
			console.error('Table component requires a column with field "title"');
		}
		if (totalResults !== itemCount && (isItemLoaded === alwaysTrue || onLoadMore === noop)) {
			console.warn('For dynamic row loading onIsItemLoaded and onLoadMore must be provided. Otherwise itemCount must equal totalResults');
		}
	}

	const containerRef = useRef(null);
	const tableRef = useRef(null);
	const listRef = useRef(null);
	const outerRef = useRef(null);

	const resizing = useRef(null);
	const reordering = useRef(null);
	const mouseUpTimeout = useRef(null);

	const [isResizing, setIsResizing] = useState(false);
	const [isReordering, setIsReordering] = useState(false);
	const [reorderTarget, setReorderTarget] = useState(null);

	const handleTableFocus = useCallback(ev => {
		// The overflow list is made focusable by default in most browsers and to prevent this we
		// need to set `tabIndex` to -1. However, since this element is rendered by react-window, we
		// cannot pass it as a prop. As a workaround, we set the tabIndex attribute directly here.
		// This fixes issue #519.
		outerRef.current?.setAttribute?.('tabindex', '-1');
		onReceiveFocus(ev);
	}, [onReceiveFocus]);

	const handleResize = useCallback(ev => {
		const columnDom = ev.target.closest(['[data-colindex]']);
		const index = columnDom.dataset.colindex - 1;
		const { width } = containerRef.current.getBoundingClientRect();
		setIsResizing(true);
		resizing.current = { origin: ev.clientX, index, width };
	}, []);

	const handleReorder = useCallback(ev => {
		const columnDom = ev.target.closest(['[data-colindex]']);
		const index = parseInt(columnDom.dataset.colindex, 10);
		const { left, width } = containerRef.current.getBoundingClientRect();
		setIsReordering(true);
		reordering.current = { index, left, width };
	}, []);

	// throttle resizing to 100Hz (or current framerate) for smoother experience
	const handleMouseMove = useThrottledCallback(useCallback(ev => {
		if (resizing.current !== null) {
			const { origin, index, width } = resizing.current;
			const offsetPixels = ev.clientX - origin;
			const offset = offsetPixels / width;
			const newColumns = columns.map(c => ({ ...c }));
			newColumns[index].fraction = Math.max(
				columns[index].fraction + offset,
				columns[index].minFraction
			);
			resizeVisibleColumns(newColumns, -offset, true);

			resizing.current.newColumns = newColumns;
			const style = getColumnCssVars(newColumns, width, scrollbarWidth);
			Object.entries(style).forEach(([name, value]) =>
				tableRef.current.style.setProperty(name, value)
			);
		} else if (reordering.current !== null) {
			const { index, left, width } = reordering.current;
			var prevColumnEdge = left, columnEdge = left;
			var columnWidth;
			var targetIndex;

			if (ev.clientX < left) {
				targetIndex = 0;
			} else {

				for (let i = 0; i < columns.length; i++) {
					columnWidth = columns[i].fraction * width;
					prevColumnEdge = columnEdge;
					columnEdge += columnWidth;
					const testOffest = columnEdge;
					if (ev.clientX < testOffest) {
						targetIndex = i;
						break;
					}
				}
			}
			const isMovingRight = targetIndex > index;
			const isMovingLeft = targetIndex < index;

			if (isMovingRight && ev.clientX < prevColumnEdge + 0.5 * columnWidth) {
				targetIndex--;
			}
			if (isMovingLeft && ev.clientX > columnEdge - 0.5 * columnWidth) {
				targetIndex++;
			}

			if (targetIndex === index) {
				setReorderTarget(null);
				reordering.current.targetIndex = null;
			} else {
				reordering.current.targetIndex = targetIndex;
				setReorderTarget({ index: targetIndex, isMovingRight, isMovingLeft });
			}
		}
	}, [columns, scrollbarWidth]), 10, { leading: true });

	const handleMouseUp = useCallback(ev => {
		if (resizing.current !== null && resizing.current.newColumns) {
			ev.preventDefault();
			onColumnsResize(resizing.current.newColumns);
		} else if (reordering.current !== null && reordering.current && typeof (reordering.current.targetIndex) === 'number' && typeof (reordering.current.index) === 'number') {
			ev.preventDefault();
			onColumnsReorder(reordering.current.index, reordering.current.targetIndex);
		}

		resizing.current = null;
		reordering.current = null;

		mouseUpTimeout.current = setTimeout(() => {
			setIsResizing(false);
			setIsReordering(false);
			setReorderTarget(null)
		});
	}, [onColumnsReorder, onColumnsResize]);

	const handleMouseLeave = useCallback(() => {
		setIsReordering(false);
		setIsResizing(false);
		setReorderTarget(null);
		resizing.current = null;
		reordering.current = null;
	}, []);

	useEffect(() => {
		document.addEventListener('mouseup', handleMouseUp);
		return () => {
			document.removeEventListener('mouseup', handleMouseUp)
		}
	}, [handleMouseUp]);

	useEffect(() => {
		document.addEventListener('mousemove', handleMouseMove);
		return () => {
			document.removeEventListener('mousemove', handleMouseMove)
		}
	}, [handleMouseMove]);

	useEffect(() => {
		document.addEventListener('mouseleave', handleMouseLeave);
		return () => {
			document.removeEventListener('mouseleave', handleMouseLeave)
		}
	}, [handleMouseLeave]);

	useEffect(() => {
		return () => {
			if (mouseUpTimeout.current) {
				clearTimeout(mouseUpTimeout.current);
			}
		}
	}, []);

	const itemData = {
		columns,
		selectedIndexes,
		getItemData,
		onSelect,
		onDoubleClick,
		...extraItemData
	};

	return (
		<div
			ref={ r => {containerRef.current = r; drop && (drop(r));} }
			className={cx('items-table-wrap', containerClassName, {
				resizing: isResizing,
				reordering: isReordering,
			})}
		>
			{isReady && (
				<AutoSizer>
					{({ height, width }) => (
						<InfiniteLoader
							isItemLoaded={isItemLoaded}
							itemCount={itemCount}
							loadMoreItems={onLoadMore}
							ref={loaderRef}
						>
							{({ onItemsRendered, ref }) => (
								<div
									tabIndex={0}
									onFocus={handleTableFocus}
									onBlur={onReceiveBlur}
									onKeyDown={onKeyDown}
									ref={ r => { tableRef.current = r; props.tableRef && (props.tableRef.current = r); } }
									className={cx('items-table', tableClassName)}
									style={getColumnCssVars(columns, width, scrollbarWidth)}
									role="grid"
									aria-multiselectable="true"
									aria-readonly="true"
									aria-label={ariaLabel}
									data-width={width}
									aria-rowcount={totalResults}
								>
									<HeaderRow
										ref={headerRef}
										columns={columns}
										width={width}
										onResize={handleResize}
										onReorder={handleReorder}
										sortBy={sortBy}
										sortDirection={sortDirection}
										isResizing={isResizing}
										isReordering={isReordering}
										reorderTarget={reorderTarget}
										onChangeSortOrder={onChangeSortOrder}
									/>
									<ReactWindowList
										initialScrollOffset={Math.max(scrollToRow - SCROLL_BUFFER, 0) * ROW_HEIGHT}
										outerElementType={TableBody}
										className={cx("items-table-body", bodyClassName)}
										height={height - ROW_HEIGHT} // add margin for HeaderRow
										itemCount={itemCount}
										itemData={itemData}
										itemSize={ROW_HEIGHT}
										onItemsRendered={onItemsRendered}
										ref={r => { ref(r); listRef.current = r; props.listRef && (props.listRef.current = r); }}
										outerRef={r => { outerRef.current = r; props.outerRef && (props.outerRef.current = r); } }
										innerRef={innerRef}
										width={width - 16}
									>
										{RowComponent}
									</ReactWindowList>
								</div>
							)}
						</InfiniteLoader>
					)}
				</AutoSizer>
			)}
			{children}
		</div>
	)
}

Table.propTypes = {
	ariaLabel: PropTypes.string,
	bodyClassName: PropTypes.string,
	children: PropTypes.node,
	columns: PropTypes.arrayOf(PropTypes.shape({
		field: PropTypes.string.isRequired,
		fraction: PropTypes.number.isRequired,
		minFraction: PropTypes.number
	})).isRequired,
	containerClassName: PropTypes.string,
	drop: PropTypes.func,
	extraItemData: PropTypes.object,
	getItemData: PropTypes.func.isRequired,
	handleKeyDown: PropTypes.func,
	headerRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
	innerRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
	isItemLoaded: PropTypes.func,
	isReady: PropTypes.bool,
	itemCount: PropTypes.number.isRequired,
	listRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
	loaderRef: PropTypes.shape({ current: PropTypes.instanceOf(Object) }),
	outerRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
	onChangeSortOrder: PropTypes.func,
	onColumnsReorder: PropTypes.func,
	onColumnsResize: PropTypes.func,
	onDoubleClick: PropTypes.func,
	onKeyDown: PropTypes.func,
	onLoadMore: PropTypes.func,
	onReceiveBlur: PropTypes.func,
	onReceiveFocus: PropTypes.func,
	onSelect: PropTypes.func,
	rowComponent: PropTypes.elementType,
	sortBy: PropTypes.string,
	sortDirection: PropTypes.oneOf(['asc', 'desc', null]),
	scrollToRow: PropTypes.number,
	selectedIndexes: PropTypes.arrayOf(PropTypes.number),
	tableClassName: PropTypes.string,
	tableRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
	totalResults: PropTypes.number.isRequired,
};

export default memo(Table);
