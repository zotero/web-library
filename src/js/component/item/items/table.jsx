'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const cx = require('classnames');
const paramCase = require('param-case');
const { without, resizeVisibleColumns } = require('../../../utils');
const AutoSizer = require('react-virtualized/dist/commonjs/AutoSizer').default;
const InfiniteLoader = require('react-virtualized/dist/commonjs/InfiniteLoader').default;
const Table = require('react-virtualized/dist/commonjs/Table').default;
const Column = require('react-virtualized/dist/commonjs/Table/Column').default;
const defaultHeaderRowRenderer = require('react-virtualized/dist/commonjs/Table/defaultHeaderRowRenderer').default;
const SortIndicator = require('react-virtualized/dist/commonjs/Table//SortIndicator').default;
const Icon = require('../../ui/icon');
const Row = require('./row');
const { columnMinWidthFraction } = require('../../../constants/defaults');

class ItemsTable extends React.PureComponent {
	constructor(props) {
		super(props);
		this.handleMouseUp = this.handleMouseUp.bind(this);
		this.handleMouseMove = this.handleMouseMove.bind(this);
		this.handleMouseLeave = this.handleMouseLeave.bind(this);
		this.state = { };
		this.ignoreClicks = {};
	}

	static getDerivedStateFromProps({ preferences: { columns } }) {
		return { columns };
	}

	componentDidUpdate({ sortBy, sortDirection, totalItemsCount }) {
		if(this.props.sortBy !== sortBy ||
			this.props.sortDirection !== sortDirection ||
			this.props.totalItemsCount !== totalItemsCount) {
			this.loader.resetLoadMoreRowsCache(true);
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

	handleKeyArrowDown(ev) {
		const lastItemKey = this.props.selectedItemKeys[this.props.selectedItemKeys.length - 1];
		const index = this.props.items.findIndex(i => i.key === lastItemKey);

		if(index + 1 >= this.props.items.length) {
			return;
		}

		if(ev.getModifierState('Shift')) {
			if(this.props.selectedItemKeys.includes(this.props.items[index + 1].key)) {
				if(this.props.items.slice(0, index).some(
					i => this.props.selectedItemKeys.includes(i.key)
				)) {
					var offset = 1;
					while(index + offset !== this.props.items.length - 1 &&
						this.props.selectedItemKeys.includes(this.props.items[index + offset].key)
					) {
						offset++;
					}
					var consecutiveCounter = 1;
					while(this.props.selectedItemKeys.includes(this.props.items[index + offset - consecutiveCounter].key)) {
						consecutiveCounter++;
					}
					const consecutiveKeys = this.props.items.slice(index + offset - consecutiveCounter + 1, index + offset).map(i => i.key);
					this.props.onItemsSelect([
						...this.props.selectedItemKeys.filter(k => !consecutiveKeys.includes(k)),
						...consecutiveKeys,
						this.props.items[index + offset].key
					]);
				} else {
					this.props.onItemsSelect(
						without(this.props.selectedItemKeys, this.props.items[index].key)
					);
				}
			} else {
				this.props.onItemsSelect([
					...this.props.selectedItemKeys,
					this.props.items[index + 1].key
				]);
			}
		} else {
			this.props.onItemsSelect([this.props.items[index + 1].key]);
		}
	}

	handleKeyArrowUp(ev) {
		const lastItemKey = this.props.selectedItemKeys[this.props.selectedItemKeys.length - 1];
		const index = this.props.items.findIndex(i => i.key === lastItemKey);

		if(index - 1 < 0) {
			return;
		}

		if(ev.getModifierState('Shift')) {
			if(this.props.selectedItemKeys.includes(this.props.items[index - 1].key)) {
				if(this.props.items.slice(index + 1).some(
					i => this.props.selectedItemKeys.includes(i.key)
				)) {
					var offset = 1;
					while(index - offset !== 0 &&
						this.props.selectedItemKeys.includes(this.props.items[index - offset].key)
					) {
						offset++;
					}
					var consecutiveCounter = 1;
					while(this.props.selectedItemKeys.includes(this.props.items[index - offset + consecutiveCounter].key)) {
						consecutiveCounter++;
					}
					const consecutiveKeys = this.props.items.slice(index - offset, index - offset + consecutiveCounter).reverse().map(i => i.key);
					this.props.onItemsSelect([
						...this.props.selectedItemKeys.filter(k => !consecutiveKeys.includes(k)),
						...consecutiveKeys,
						this.props.items[index - offset].key
					]);
				} else {
					this.props.onItemsSelect(
						without(this.props.selectedItemKeys, this.props.items[index].key)
					);
				}
			} else {
				this.props.onItemsSelect([
					...this.props.selectedItemKeys,
					this.props.items[index - 1].key
				]);
			}
		} else {
			this.props.onItemsSelect([this.props.items[index - 1].key]);
		}
	}

	//@TODO: refactor handleKeyArrowUp/handleKeyArrowDown into a signle handler
	handleKeyDown(ev) {
		if(ev.key === 'ArrowUp') {
			this.handleKeyArrowUp(ev);
			ev.preventDefault();
		} else if(ev.key === 'ArrowDown') {
			this.handleKeyArrowDown(ev);
			ev.preventDefault();
		}
	}

	handleItemSelect(item, ev) {
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

	async handleLoadMore({ startIndex, stopIndex }) {
		this.startIndex = startIndex;
		this.stopIndex = stopIndex;
		await this.props.onLoadMore({ startIndex, stopIndex });
	}

	//@NOTE: In order to allow item selection on "mousedown" (#161)
	//		 this event fires twice, once on "mousedown", once on "click".
	//		 Click events are discarded unless "mousedown" could
	//		 have been triggered as a drag event in which case "mousedown"
	//		 is ignored and "click" is used instead, if occurs.
	handleRowMouseEvent({ event, index }) {
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
						this.handleItemSelect(item, event);
						delete this.ignoreClicks[item.key];
						return
					}
				}
			}
			if(event.type === 'mousedown') {
				// finally handle mousedowns as select events
				this.ignoreClicks[item.key] = Date.now();
				this.handleItemSelect(item, event);
			}
		}
	}

	handleSort({ ...opts }) {
		this.props.onSort({ ...opts, startIndex: this.startIndex, stopIndex: this.stopIndex });
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

	renderRow({ className: otherClassName, index,...opts }) {
		const { selectedItemKeys, items } = this.props;
		const className = cx({
			className: otherClassName,
			item: true,
			odd: (index + 1) % 2 === 1,
			active: items[index] && selectedItemKeys.includes(items[index].key)
		});

		return <Row
			onDrag={ this.props.onItemDrag }
			{ ...{className, index, selectedItemKeys, ...opts} }
		/>;
	}

	handleResizeStart(index) {
		const { columns } = this.state;
		const rect = this.containerDom.getBoundingClientRect();
		const visibleColumns = columns.filter(c => c.isVisible);
		const column = this.state.columns[index];
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
		this.resizeIndex = this.state.columns.findIndex(c => c.field === columnToResize.field);
		this.setState({ isResizing: true })
	}

	handleMouseMove(ev) {
		if(this.state.isResizing) {
			const width = ev.clientX - this.resizeOffset;
			const fraction = Math.max(width / this.availableWidth, columnMinWidthFraction);
			const columns = [ ...this.state.columns ];
			columns[this.resizeIndex].fraction = fraction;
			const visibleColumns = columns.filter(c => c.isVisible);
			const aggregatedFraction = visibleColumns.reduce(
				(aggr, { fraction }) => aggr + fraction
			, 0);
			var overflowFraction = aggregatedFraction - 1.0;
			resizeVisibleColumns(columns, -1 * overflowFraction, true);
			this.props.onColumnResize(columns);
		} else if(this.state.isReordering) {
			const { columns } = this.state;
			const visibleColumns = columns.filter(c => c.isVisible);
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
					realReorderTargetIndex = columns.findIndex(c => c.field === visibleColumns[visibleColumns.length - 1].field) + 1
				} else {
					realReorderTargetIndex = columns.findIndex(c => c.field === visibleColumns[targetIndex].field);
				}

				this.setState({ reorderTargetIndex: realReorderTargetIndex })
			}
		}
	}

	handleMouseUp() {
		if(this.state.isResizing) {
			this.setState({ isResizing: false });
			const visibleColumns = this.state.columns.filter(c => c.isVisible);
		} else if(this.state.isReordering) {
			const columns = [ ...this.state.columns ];
			const indexFrom = this.reorderingColumn;
			const indexTo = this.state.reorderTargetIndex;

			if(columns[indexFrom] && columns[indexTo]) {
				columns.splice(indexTo, 0, columns.splice(indexFrom, 1)[0]);
				this.props.onColumnReorder(columns);
			}

			this.setState({
				isReordering: false,
				reorderTargetIndex: null,
			});

		}
	}

	handleMouseLeave() {
		this.setState({ isResizing: false });
		this.setState({ isReordering: false });
	}

	handleReorderStart(index) {
		const rect = this.containerDom.getBoundingClientRect();
		this.availableWidth = rect.right - rect.left;
		this.reorderOffset = rect.left;
		this.reorderingColumn = index;
		this.setState({ isReordering: true });
	}

	renderHeaderRow({ className, ...opts }) {
		className += ' items-table-head';
		return defaultHeaderRowRenderer({ className, ...opts });
	}

	renderTitleCell({ cellData, rowData }) {
		if(rowData.isPlaceholder) {
			return (
				<React.Fragment>
					<div className="placeholder-icon" />
					<div className="placeholder" />
				</React.Fragment>
			);
		}

		const icon = rowData.itemType ?
			<Icon type={ `16/item-types/${paramCase(rowData.itemType)}` } width="16" height="16" /> :
			<Icon type={ `16/item-types/document` } width="16" height="16" />;

		const coloredSquares = rowData.coloredTags.map(tag => (
			<div
				key={ tag.tag }
				className="colored-square"
				style={ { backgroundColor: tag.color } }
			/>
		));
		return (
			<React.Fragment>
				{ icon }
				{ coloredSquares }
				{ String(cellData) }
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

		return String(cellData);
	}

	renderHeaderCell({ dataKey, label, sortBy, sortDirection }) {
		const isSortIndicatorVisible = sortBy === dataKey;
		const index = this.state.columns.findIndex(c => c.field === dataKey);
		return (
			<React.Fragment>
				{
					index === this.state.reorderTargetIndex &&
						<div className="reorder-target" />
				}
				{ index !== 0 &&
					<div
						className="resize-handle"
						key="resize-handle"
						onMouseDown={ ev => this.handleResizeStart(index, ev) }
						onClick={ ev => ev.stopPropagation() }
					/>
				}
				<span
					className="header-label"
					onMouseDown={ ev => this.handleReorderStart(index, ev) }
					title={label}
				>
					{label}
				</span>
				{ isSortIndicatorVisible &&
					<SortIndicator key="SortIndicator" sortDirection={sortDirection} />
				}
			</React.Fragment>
		);
	}

	renderColumn({ dataKey, ...opts }) {
		const key = dataKey;
		const label = dataKey in this.props.columnNames ?
			this.props.columnNames[dataKey] : dataKey;
		const cellRenderer = this.renderCell.bind(this, dataKey);
		const className = ['metadata', dataKey].join(' ');

		return <Column
			headerRenderer={ this.renderHeaderCell.bind(this) }
			{ ...{ key, dataKey, className, label, cellRenderer, ...opts } }
		/>
	}

	render() {
		if(!this.props.isReady) {
			return null;
		}

		return (
			<div
				ref={ ref => this.containerDom = ref }
				className={cx('items-table-wrap', {
					resizing: this.state.isResizing,
					reordering: this.state.isReordering,
				}) }
				onKeyDown={ this.handleKeyDown.bind(this) }
			>
				<AutoSizer>
					{({ width, height }) => (
						<InfiniteLoader
							ref={ ref => this.loader = ref }
							isRowLoaded={ this.getRowHasLoaded.bind(this) }
							loadMoreRows={ this.handleLoadMore.bind(this) }
							rowCount={ this.props.totalItemsCount }
						>
							{({onRowsRendered, registerChild}) => (
								<Table
									ref={ registerChild }
									className="items-table"
									width={ width }
									height={ height }
									onRowsRendered={ onRowsRendered }
									rowCount={ this.props.totalItemsCount }
									headerHeight={ 26 }
									rowHeight={ 26 }
									rowGetter={ this.getRow.bind(this) }
									rowRenderer={ this.renderRow.bind(this) }
									headerRowRenderer={ this.renderHeaderRow.bind(this) }
									onRowClick={ this.handleRowMouseEvent.bind(this) }
									sort={ this.handleSort.bind(this) }
									sortBy={ this.props.sortBy }
									sortDirection={ this.props.sortDirection }
								>
										{
											this.state.columns
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

module.exports = ItemsTable;
