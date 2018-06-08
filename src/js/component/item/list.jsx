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
	}
	componentDidUpdate({ sortBy, sortDirection, items }) {
		if(this.props.sortBy !== sortBy ||
			this.props.sortDirection !== sortDirection ||
			this.props.items.length !== items.length ) {
			this.loadedRowsMap = {};
			this.loader.resetLoadMoreRowsCache(false);
		}
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

	renderHeaderRow({ className, ...opts }) {
		className += ' item-list-head';
		return defaultHeaderRowRenderer({ className, ...opts });
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

	render() {
		if(!this.props.isReady) {
			return null;
		}

		return (
			<div className="item-list-wrap" onKeyDown={ this.handleKeyDown.bind(this) }>
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
									className="item list"
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
									<Column
										className="metadata title"
										cellRenderer={ this.renderTitleCell.bind(this) }
										label='Title'
										dataKey='title'
										width={ Math.floor(0.5 * width)  }
									/>
									<Column
										label='Author'
										dataKey='creator'
										width={ Math.floor(0.3 * width) }
									/>
									<Column
										label='Date'
										dataKey='date'
										width={ Math.floor(0.2 * width) }
									/>
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
