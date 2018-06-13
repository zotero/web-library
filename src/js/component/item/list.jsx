'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const paramCase = require('param-case');
const { without } = require('../../utils');
const AutoSizer = require('react-virtualized/dist/commonjs/AutoSizer').default;
const InfiniteLoader = require('react-virtualized/dist/commonjs/InfiniteLoader').default;
const Table = require('react-virtualized/dist/commonjs/Table').default;
const Column = require('react-virtualized/dist/commonjs/Table/Column').default;
const defaultRowRenderer = require('react-virtualized/dist/commonjs/Table/defaultRowRenderer').default;
const defaultHeaderRowRenderer = require('react-virtualized/dist/commonjs/Table/defaultHeaderRowRenderer').default;
const Icon = require('../ui/icon');

const LOADING = 1;
const LOADED = 2;

class ItemList extends React.PureComponent {
	constructor(props) {
		super(props);
		this.loadedRowsMap = {};
		this.handleResizeEnd = this.handleResizeEnd.bind(this);
		this.handleResize = this.handleResize.bind(this);
		this.handleMouseLeave = this.handleMouseLeave.bind(this);
		this.state = { };
	}

	static getDerivedStateFromProps({ preferences: { columns } }) {
		return { columns };
	}

	componentDidUpdate({ sortBy, sortDirection, items }) {
		if(this.props.sortBy !== sortBy ||
			this.props.sortDirection !== sortDirection ||
			this.props.items.length !== items.length ) {
			this.loadedRowsMap = {};
			this.loader.resetLoadMoreRowsCache(false);
		}
	}

	componentDidMount() {
		document.addEventListener('mouseup', this.handleResizeEnd);
		document.addEventListener('mousemove', this.handleResize);
		document.addEventListener('mouseleave', this.handleMouseLeave);
	}

	componentWillUnmount() {
		document.removeEventListener('mouseup', this.handleResizeEnd)
		document.removeEventListener('mousemove', this.handleResize);
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
					this.props.onMultipleItemsSelect([
						...this.props.selectedItemKeys.filter(k => !consecutiveKeys.includes(k)),
						...consecutiveKeys,
						this.props.items[index + offset].key
					]);
				} else {
					this.props.onMultipleItemsSelect(
						without(this.props.selectedItemKeys, this.props.items[index].key)
					);
				}
			} else {
				this.props.onMultipleItemsSelect([
					...this.props.selectedItemKeys,
					this.props.items[index + 1].key
				]);
			}
		} else {
			this.props.onItemSelect(this.props.items[index + 1].key);
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
					this.props.onMultipleItemsSelect([
						...this.props.selectedItemKeys.filter(k => !consecutiveKeys.includes(k)),
						...consecutiveKeys,
						this.props.items[index - offset].key
					]);
				} else {
					this.props.onMultipleItemsSelect(
						without(this.props.selectedItemKeys, this.props.items[index].key)
					);
				}
			} else {
				this.props.onMultipleItemsSelect([
					...this.props.selectedItemKeys,
					this.props.items[index - 1].key
				]);
			}
		} else {
			this.props.onItemSelect(this.props.items[index - 1].key);
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
		if(ev.getModifierState('Shift')) {
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
			this.props.onMultipleItemsSelect(keys);
		} else if(ev.getModifierState('Control') || ev.getModifierState('Meta')) {
			this.props.onMultipleItemsSelect([...this.props.selectedItemKeys, item.key]);
		} else {
			this.props.onItemSelect(item.key);
		}

		ev.preventDefault();
	}

	async handleLoadMore({ startIndex, stopIndex }) {
		this.startIndex = startIndex;
		this.stopIndex = stopIndex;
		for(let i = startIndex; i <= stopIndex; i++) {
			this.loadedRowsMap[i] = LOADING;
		}

		await this.props.onLoadMore({ startIndex, stopIndex });

		for(let i = startIndex; i <= stopIndex; i++) {
			this.loadedRowsMap[i] = LOADED;
		}
	}

	handleRowClick({ event, index }) {
		if(index < this.props.items.length) {
			this.handleItemSelect(this.props.items[index], event);
		}
	}

	handleSort(opts) {
		this.props.onSort({ ...opts, startIndex: this.startIndex, stopIndex: this.stopIndex });
	}

	getRow({ index }) {
		if (index < this.props.items.length) {
			return this.props.items[index];
		} else {
			return {
				title: '...',
				creator: '...',
				date: '...'
			}
		}
	}

	getRowHasLoaded({ index }) {
		return !!this.loadedRowsMap[index];
	}

	renderRow({ className, index, ...opts }) {
		className += ' item';
		if(index % 2 === 1) {
			className += ' odd';
		}
		if(index < this.props.items.length) {
			let item = this.props.items[index];
			if(this.props.selectedItemKeys.includes(item.key)) {
				className += ' active';
			}
		}

		return defaultRowRenderer({ className, index, ...opts });
	}

	handleResizeStart(index, ev) {
		const rect = this.containerDom.getBoundingClientRect();
		this.isResizing = true;
		this.resizingColumn = index - 1;
		this.availableWidth = rect.right - rect.left;
		let offset = rect.left;
		for(let i = 0; i < index - 1; i++) {
			const columnWidth = this.state.columns[i].fraction * this.availableWidth;
			offset += columnWidth;
		}

		this.resizeOffset = offset;
		ev.preventDefault();
	}

	handleResize(ev) {
		if(this.isResizing) {
			const width = Math.max(ev.clientX - this.resizeOffset, 10);
			const fraction = width / this.availableWidth;
			const columns = [ ...this.state.columns ];
			columns[this.resizingColumn].fraction = fraction;
			let aggregatedFraction = 0
			for(let i = 0; i < columns.length - 1; i++) {
				aggregatedFraction += columns[i].fraction;
			}

			columns[columns.length -1].fraction = 1.0 - aggregatedFraction;

			this.setState({ columns, t: Date.now() })
		}
	}

	handleResizeEnd() {
		if(this.isResizing) {
			this.isResizing = false;
		}
	}

	handleMouseLeave() {
		this.isResizing = false;
	}

	renderHeaderRow({ className, columns, ...opts }) {
		className += ' item-list-head';
		columns.forEach(({ props: { children } }, index) => {
			if(index === 0 ) { return }
			children.unshift(
				<div
					className="resize-handle"
					key="resize-handle"
					onMouseDown={ ev => this.handleResizeStart(index, ev) }
				/>
			);
		});
		return defaultHeaderRowRenderer({ className, columns, ...opts });
	}

	renderTitleCell({ cellData, rowData }) {
		let icon = rowData.itemType ?
			<Icon type={ `16/item-types/${paramCase(rowData.itemType)}` } width="16" height="16" /> :
			<Icon type={ `16/item-types/document` } width="16" height="16" />;

		return (
			<React.Fragment>
				{ icon }
				{ String(cellData) }
			</React.Fragment>
		);
	}

	renderColumn({ dataKey, ...opts }) {
		const key = dataKey;
		const label = dataKey; //@TODO: lookup
		const cellRenderer = dataKey === 'title' ?
			this.renderTitleCell.bind(this) : undefined;
		const className = dataKey === 'title' ?
			'metadata title' : undefined;

		return <Column { ...{ key, dataKey, className, label, cellRenderer, ...opts } } />
	}

	render() {
		if(!this.props.isReady) {
			return null;
		}

		return (
			<div
				ref={ ref => this.containerDom = ref }
				className="item-list-wrap"
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
									{ ...this.props }
									ref={ registerChild }
									className="item-list"
									width={ width }
									height={ height }
									onRowsRendered={ onRowsRendered }
									rowCount={ this.props.totalItemsCount }
									headerHeight={ 26 }
									rowHeight={ 26 }
									rowGetter={ this.getRow.bind(this) }
									rowRenderer={ this.renderRow.bind(this) }
									headerRowRenderer={ this.renderHeaderRow.bind(this) }
									onRowClick={ this.handleRowClick.bind(this) }
									sort={ this.handleSort.bind(this) }
								>
										{
											this.state.columns
											.map(({ field, fraction }, index) => this.renderColumn({
												width: Math.floor(fraction * width),
												dataKey: field
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

ItemList.propTypes = {
	items: PropTypes.array,
	selectedItemKeys: PropTypes.array,
	onItemSelect: PropTypes.func
};

ItemList.defaultProps = {
	selectedItemKeys: []
};

module.exports = ItemList;
