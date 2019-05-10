'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import paramCase from 'param-case';
import { resizeVisibleColumns } from '../../../utils';
import AutoSizer from 'react-virtualized/dist/commonjs/AutoSizer';
import InfiniteLoader from 'react-virtualized/dist/commonjs/InfiniteLoader';
import Table from 'react-virtualized/dist/commonjs/Table';
import Column from 'react-virtualized/dist/commonjs/Table/Column';
import defaultHeaderRowRenderer from 'react-virtualized/dist/commonjs/Table/defaultHeaderRowRenderer';
import Icon from '../../ui/icon';
import Row from './row';
import Spinner from '../../ui/spinner';
import columnNames from '../../../constants/column-names';

class ItemsTable extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = { };
		this.ignoreClicks = {};
	}

	componentDidUpdate({ sortBy: prevSortBy, sortDirection: prevSortDirection,
		totalItemsCount: prevTotalItemsCount, items: prevItems,
		selectedItemKeys: prevSelectedItemKeys }) {

		const { sortBy, sortDirection, totalItemsCount, selectedItemKeys,
		items } = this.props;

		if(sortBy !== prevSortBy || sortDirection !== prevSortDirection ||
			totalItemsCount !== prevTotalItemsCount) {
			this.loader.resetLoadMoreRowsCache(true);
		}

		if(this.tableRef && selectedItemKeys.length > 0 &&
			(items.length !== prevItems.length || prevSelectedItemKeys.length === 0)
		) {
			const scrollToIndex = items.findIndex(
				i => i && selectedItemKeys.includes(i.key)
			)
			this.tableRef.scrollToRow(scrollToIndex);
		}
	}

	componentDidMount() {
		document.addEventListener('mouseup', this.handleMouseUp);
		document.addEventListener('mousemove', this.handleMouseMove);
		document.addEventListener('mouseleave', this.handleMouseLeave);
	}

	componentWillUnmount() {
		document.removeEventListener('mouseup', this.handleMouseUp)
		document.removeEventListener('mousemove', this.handleMouseMove);
		document.removeEventListener('mouseleave', this.handleMouseLeave);
	}

	handleKeyDown = ev => {
		const { items, selectedItemKeys, onItemsSelect } = this.props;

		var vector;
		if(ev.key === 'ArrowUp') {
			vector = -1;
		} else if(ev.key === 'ArrowDown') {
			vector = 1;
		} else if(ev.key === 'Enter') {
			if('index' in ev.target.dataset) {
				const index = parseInt(ev.target.dataset.index, 10);
				this.selectItem(items[index], ev);
			}
			return;
		} else {
			return;
		}

		if(vector) { ev.preventDefault(); }

		const lastItemKey = selectedItemKeys[selectedItemKeys.length - 1];
		const index = items.findIndex(i => i && i.key === lastItemKey);
		const nextIndex = index + vector;

		//check bounds
		if(vector > 0 && index + 1 >= this.props.items.length) {
			return;
		}

		if(vector < 0 && index + vector < 0) {
			return;
		}

		if(ev.getModifierState('Shift')) {
			if(selectedItemKeys.includes(items[nextIndex].key)) {
				if(items.slice(...(vector > 0 ? [0, index] : [index + 1])).some(
					i => selectedItemKeys.includes(i.key)
				)) {
					let offset = 1;
					let boundry = vector > 0 ? items.length - 1 : 0;
					while(index + (offset * vector) !== boundry &&
						selectedItemKeys.includes(items[index + (offset * vector)].key)
					) {
						offset++;
					}
					var consecutiveCounter = 1;
					while(selectedItemKeys.includes(items[index + (offset * vector) + consecutiveCounter].key)) {
						consecutiveCounter++;
					}
					var consecutiveKeys;
					if(vector > 0) {
						consecutiveKeys = items.slice(index + offset - consecutiveCounter + 1, index + offset).map(i => i.key);
					} else {
						consecutiveKeys = items.slice(index - offset, index - offset + consecutiveCounter).reverse().map(i => i.key);
					}
					onItemsSelect([
						...selectedItemKeys.filter(k => !consecutiveKeys.includes(k)),
						...consecutiveKeys,
						items[index + (offset * vector)].key
					]);
				} else {
					onItemsSelect(
						selectedItemKeys.filter(k => k !== items[index].key)
					);
				}
			} else {
				onItemsSelect([
					...selectedItemKeys,
					items[nextIndex].key
				]);
			}
		} else {
			onItemsSelect([items[nextIndex].key]);
		}
	}

	handleLoadMore = async ({ startIndex, stopIndex }) => {
		this.startIndex = startIndex;
		this.stopIndex = stopIndex;
		await this.props.onLoadMore({ startIndex, stopIndex });
	}

	//@NOTE: In order to allow item selection on "mousedown" (#161)
	//		 this event fires twice, once on "mousedown", once on "click".
	//		 Click events are discarded unless "mousedown" could
	//		 have been triggered as a drag event in which case "mousedown"
	//		 is ignored and "click" is used instead, if occurs.
	handleRowMouseEvent = ({ event, index }) => {
		const { items, selectedItemKeys } = this.props;
		const item = items[index];
		if(item) {
			const isSelected = selectedItemKeys.includes(item.key);
			if(selectedItemKeys.length > 1 &&
				isSelected && event.type === 'mousedown') {
				// ignore a "mousedown" when user might want to drag items
				return;
			} else {
				if(selectedItemKeys.length > 1 && isSelected &&
					event.type === 'click') {
					const isFollowUp = item.key in this.ignoreClicks &&
						Date.now() - this.ignoreClicks[item.key] < 500;

					if(isFollowUp) {
						// ignore a follow-up click, it has been handled as "mousedown"
						return;
					} else {
						// handle a "click" event that has been missed by "mousedown" handler
						// in anticipation of potential drag that has never happened
						this.selectItem(item, event);
						delete this.ignoreClicks[item.key];
						return
					}
				}
			}
			if(event.type === 'mousedown') {
				// finally handle mousedowns as select events
				this.ignoreClicks[item.key] = Date.now();
				this.selectItem(item, event);
			}
		}
	}

	handleSort = sortOptions => {
		if(this.ignoreNextSortTimeStamp && Date.now() - this.ignoreNextSortTimeStamp < 300) {
			// triggered by reorder or resize
			return;
		}
		this.props.onSort(sortOptions);
	}

	handleResizeStart = ev => {
		const index = ev.currentTarget.dataset.index;
		const rect = this.containerDom.getBoundingClientRect();
		const visibleColumns = this.columns.filter(c => c.isVisible);
		const column = this.columns[index];
		// index of the column among visible columns
		const visibleIndex = visibleColumns.findIndex(c => c.field === column.field);
		// previous visible column is the one being resized
		const columnToResize = visibleColumns[visibleIndex - 1];
		let offset = rect.left;
		this.availableWidth = rect.right - rect.left;

		for(let i = 0; i < visibleIndex - 1; i++) {
			const columnWidth = visibleColumns[i].fraction * this.availableWidth;
			offset += columnWidth;
		}

		this.resizeOffset = offset;
		this.resizeIndex = this.columns.findIndex(c => c.field === columnToResize.field);
		this.setState({ isResizing: true })
	}

	handleMouseMove = ev => {
		var isReordering;
		if(this.mouseDownTimestamp && (Date.now() - this.mouseDownTimestamp < 300))  {
			this.setState({ isReordering: true });
			clearTimeout(this.mouseDownTimeout);
			this.mouseDownTimestamp = null;
			isReordering = true;
		} else {
			isReordering = this.state.isReordering;
		}

		const { isResizing } = this.state;

		if(isResizing) {
			const columns = [ ...this.columns ];
			const width = ev.clientX - this.resizeOffset;
			const columnMinWidthFraction = columns[this.resizeIndex].minFraction;
			const fraction = Math.max(width / this.availableWidth, columnMinWidthFraction);
			columns[this.resizeIndex].fraction = fraction;
			const visibleColumns = columns.filter(c => c.isVisible);
			const aggregatedFraction = visibleColumns.reduce(
				(aggr, { fraction }) => aggr + fraction
			, 0);
			var overflowFraction = aggregatedFraction - 1.0;
			resizeVisibleColumns(columns, -1 * overflowFraction, true);
			this.setState({ columns });
		} else if(isReordering) {
			const visibleColumns = this.columns.filter(c => c.isVisible);
			var aggregatedOffset = this.reorderOffset;
			var targetIndex;

			if(ev.clientX < aggregatedOffset) {
				targetIndex = 0;
			} else {
				for (let i = 0; i < visibleColumns.length; i++) {
					aggregatedOffset += visibleColumns[i].fraction * this.availableWidth;
					const testOffest = aggregatedOffset - 0.5 * visibleColumns[i].fraction * this.availableWidth;
					if(ev.clientX < testOffest) {
						targetIndex = i;
						break;
					}
				}
			}

			if(this.state.reorderTargetIndex !== targetIndex) {
				var realReorderTargetIndex;
				if(targetIndex === visibleColumns.length) {
					realReorderTargetIndex = this.columns.findIndex(
						c => c.field === visibleColumns[visibleColumns.length - 1].field
					) + 1;
				} else {
					realReorderTargetIndex = this.columns.findIndex(
						c => c.field === visibleColumns[targetIndex].field
					);
				}

				this.setState({ reorderTargetIndex: realReorderTargetIndex })
			}
		}
	}

	handleMouseUp = () => {
		const { isResizing, isReordering } = this.state;
		const columns = [ ...this.columns ];

		clearTimeout(this.mouseDownTimeout);
		this.mouseDownTimestamp = null;

		if(isResizing || isReordering) {
			this.ignoreNextSortTimeStamp = Date.now();
		}

		if(isResizing) {
			this.setState({ columns, isResizing: false });
			this.props.onColumnResize(columns);
		} else if(isReordering) {
			const indexFrom = this.reorderingColumn;
			const indexTo = this.state.reorderTargetIndex;

			if(columns[indexFrom] && columns[indexTo]) {
				columns.splice(indexTo, 0, columns.splice(indexFrom, 1)[0]);
				this.props.onColumnReorder(columns);
			}

			this.setState({
				columns,
				isReordering: false,
				reorderTargetIndex: null,
			});
		}
	}

	handleMouseLeave = () => {
		this.setState({ isResizing: false });
		this.setState({ isReordering: false });
	}

	handleMouseDown = ev => {
		const index = ev.currentTarget.dataset.index;
		const rect = this.containerDom.getBoundingClientRect();
		this.availableWidth = rect.right - rect.left;
		this.reorderOffset = rect.left;
		this.reorderingColumn = parseInt(index, 10);
		this.mouseDownTimestamp = Date.now();
		this.mouseDownTimeout = setTimeout(() => {
			this.setState({ isReordering: true });
		}, 300);
	}

	handleFocus = () => {
		const { items, selectedItemKeys } = this.props;
		if(selectedItemKeys.length === 0 && items.length > 0) {
			this.props.onItemsSelect([items[0].key]);
		}
		this.setState({ isFocused: true });
	}

	handleBlur = () => {
		this.setState({ isFocused: false });
	}

	getRow({ index }) {
		if (this.props.items[index]) {
			return this.props.items[index];
		} else {
			return {
				title: '',
				creator: '',
				date: '',
				coloredTags: [],
				isPlaceholder: true
			}
		}
	}

	getRowHasLoaded({ index }) {
		return this.props.items[index] &&
			typeof(this.props.items[index]) === "object" &&
			this.props.items[index].isSynced;
	}

	renderHeaderRow({ className, ...opts }) {
		className += ' items-table-head';
		return defaultHeaderRowRenderer({ className, ...opts });
	}

	selectItem(item, ev) {
		const isCtrlModifier = ev.getModifierState('Control') || ev.getModifierState('Meta');
		const isShiftModifier = ev.getModifierState('Shift');

		if(isShiftModifier) {
			let startIndex = this.props.selectedItemKeys.length ? this.props.items.findIndex(i => i.key === this.props.selectedItemKeys[0]) : 0;
			let endIndex = this.props.items.findIndex(i => i.key === item.key);
			let isFlipped = false;
			if(startIndex > endIndex) {
				[startIndex, endIndex] = [endIndex, startIndex];
				isFlipped = true;
			}

			endIndex++;
			const keys = this.props.items.slice(startIndex, endIndex).map(i => i.key);
			if(isFlipped) {
				keys.reverse();
			}
			this.props.onItemsSelect(keys);
		} else if(isCtrlModifier) {
			if(this.props.selectedItemKeys.includes(item.key)) {
				this.props.onItemsSelect(this.props.selectedItemKeys.filter(ik => ik !== item.key))
			} else {
				this.props.onItemsSelect([...(new Set([...this.props.selectedItemKeys, item.key]))]);
			}
		} else {
			this.props.onItemsSelect([item.key]);
		}
	}

	renderTitleCell({ cellData, rowData }) {
		const { selectedItemKeys } = this.props;
		const isActive = selectedItemKeys.includes(rowData.key);
		const iconName = paramCase(rowData.itemType);
		const dvp = window.devicePixelRatio >= 2 ? 2 : 1;

		if(rowData.isPlaceholder) {
			return (
				<React.Fragment>
					<div className="placeholder-icon" />
					<div className="placeholder" />
				</React.Fragment>
			);
		}

		const icon = (
			<Icon
				type={ `16/item-types/light/${dvp}x/${iconName}` }
				// symbol={ isActive ? `${iconName}-white` : iconName }
				width="16"
				height="16"
			/>
		);

		const tagColors = rowData.coloredTags.map((tag, index) => (
			<Icon
				key={ tag.tag }
				type={ index === 0 ? '10/circle' : '10/crescent-circle' }
				symbol={ index === 0 ?
					isActive ? 'circle-focus' : 'circle' :
					isActive ? 'crescent-circle-focus' : 'crescent-circle'
				}
				width={ index === 0 ? 10 : 7 }
				height="10"
				style={ { color: tag.color} }
			/>
		));
		return (
			<React.Fragment>
				{ icon }
				<div className="truncate">{ String(cellData) }</div>
				<div className="tag-colors">
					{ tagColors }
				</div>
			</React.Fragment>
		);
	}

	renderCell(dataKey, { cellData, rowData }) {
		if(dataKey === 'title') {
			return this.renderTitleCell({ cellData, rowData });
		}

		if(rowData.isPlaceholder) {
			return <div className="placeholder" />;
		}

		return (
			<div className="truncate">
				{	(typeof(cellData) === 'undefined' || cellData === null) ? '' : cellData }
			</div>
		);
	}

	renderHeaderCell({ dataKey, label, sortBy, sortDirection }) {
		const isSortIndicatorVisible = sortBy === dataKey;
		const index = this.columns.findIndex(c => c.field === dataKey);
		const { isReordering } = this.state;

		return (
			<React.Fragment>
				{
					index === this.state.reorderTargetIndex &&
						<div className="reorder-target" />
				}
				{ index !== 0 &&
					<div
						data-index={ index }
						className="resize-handle"
						key="resize-handle"
						onMouseDown={ this.handleResizeStart }
					/>
				}
				<div
					data-index={ index }
					onMouseDown={ this.handleMouseDown }
					className="draggable-header"
				>
					<span
						className="header-label truncate"
						title={label}
					>
						{label}
					</span>
					{ isSortIndicatorVisible &&
						<Icon type={ '16/chevron-7' } width="16" height="16" className="sort-indicator" />
					}
				</div>
			</React.Fragment>
		);
	}

	renderColumn({ dataKey, ...opts }) {
		const { isReordering } = this.state;
		const index = this.columns.findIndex(c => c.field === dataKey);
		const key = dataKey;
		const label = dataKey in columnNames ? columnNames[dataKey] : dataKey;
		const cellRenderer = this.renderCell.bind(this, dataKey);
		const className = cx('metadata', dataKey);
		const headerClassName = cx({
			'reorder-source': isReordering && this.reorderingColumn === index
		});

		return <Column
			headerRenderer={ this.renderHeaderCell.bind(this) }
			{ ...{ key, dataKey, className, label, cellRenderer, headerClassName, ...opts } }
		/>
	}

	renderRow({ className: otherClassName, index,...opts }) {
		const { selectedItemKeys, items, libraryKey } = this.props;
		const className = cx({
			className: otherClassName,
			item: true,
			odd: (index + 1) % 2 === 1,
			'nth-4n-1': (index + 2) % 4 === 0,
			'nth-4n': (index + 1) % 4 === 0,
			active: items[index] && selectedItemKeys.includes(items[index].key)
		});

		//
		// @NOTE: paddingRight provided is basically scrollbar width
		// 		  however instead of padding, we want to reduce the actual
		// 		  width of a row, in oder to display outline on focused rows
		// 		  correctly. See https://github.com/zotero/web-library/issues/151#issuecomment-480270140
		opts.style.width -= opts.style.paddingRight;
		delete opts.style.paddingRight;

		return <Row
			onDrag={ this.props.onItemDrag }
			{ ...{className, index, selectedItemKeys, libraryKey, ...opts} }
		/>;
	}

	get columns() {
		const { preferences } = this.props;
		return this.state.columns || preferences.columns;
	}

	render() {
		if(!this.props.isReady) {
			return null;
		}
		const { isError, sortBy, sortDirection, totalItemsCount } = this.props;
		const { scrollToIndex } = this.state;
		const isLoadingUncounted = !isError && typeof(totalItemsCount) === 'undefined';

		return (
			<div
				ref={ ref => this.containerDom = ref }
				className={cx('items-table-wrap', {
					resizing: this.state.isResizing,
					reordering: this.state.isReordering,
				}) }
			>
				<AutoSizer>
					{({ width, height }) => (
						<InfiniteLoader
							ref={ ref => this.loader = ref }
							isRowLoaded={ this.getRowHasLoaded.bind(this) }
							loadMoreRows={ this.handleLoadMore }
							rowCount={ totalItemsCount }
						>
							{({onRowsRendered, registerChild}) => (
								<Table
									containerProps={ {
										onKeyDown: this.handleKeyDown.bind(this),
										onFocus: this.handleFocus,
										onBlur: this.handleBlur,
									} }
									className="items-table"
									headerClassName="column-header"
									headerHeight={ 26 }
									headerRowRenderer={ this.renderHeaderRow.bind(this) }
									height={ height }
									onRowClick={ this.handleRowMouseEvent }
									onRowsRendered={ onRowsRendered }
									ref={ ref => { this.tableRef = ref; registerChild(ref); } }
									rowCount={ totalItemsCount || 0 }
									rowGetter={ this.getRow.bind(this) }
									rowHeight={ 26 }
									rowRenderer={ this.renderRow.bind(this) }
									scrollToIndex={ scrollToIndex }
									sort={ this.handleSort }
									sortBy={ sortBy }
									sortDirection={ sortDirection }
									tabIndex={ 0 }
									width={ width }
								>
									{
										this.columns
										.filter(c => c.isVisible)
										.map(({ field, fraction }) => this.renderColumn({
											width: Math.floor(fraction * width),
											dataKey: field,
										}))
									}
								</Table>
							)}
						</InfiniteLoader>
					)}
				</AutoSizer>
				{ isLoadingUncounted && <Spinner className="large" /> }
			</div>
		);
	}
}

ItemsTable.propTypes = {
	items: PropTypes.array,
	selectedItemKeys: PropTypes.array,
	onItemsSelect: PropTypes.func
};

ItemsTable.defaultProps = {
	selectedItemKeys: [],
	preferences: {}
};

export default ItemsTable;
