'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const cx = require('classnames');

const { default: AutoSizer } = require('react-virtualized/dist/commonjs/AutoSizer');
const { default: InfiniteLoader } = require('react-virtualized/dist/commonjs/InfiniteLoader');
const { default: List } = require('react-virtualized/dist/commonjs/List');

const LOADING = 1;
const LOADED = 2;

class ItemsList extends React.PureComponent {
	constructor(props) {
		super(props);
		this.loadedRowsMap = {};
	}

	// Identical to table.jsx
	componentDidUpdate({ sortBy, sortDirection, items }, prevState) {
		if(this.props.sortBy !== sortBy ||
			this.props.sortDirection !== sortDirection ||
			this.props.items.length !== items.length ) {
			this.loadedRowsMap = {};
			this.loader.resetLoadMoreRowsCache(false);
		}
	}

	// Identical to table.jsx
	getRowHasLoaded({ index }) {
		return !!this.loadedRowsMap[index];
	}

	// Identical to table.jsx
	getRow({ index }) {
		if (index < this.props.items.length) {
			return this.props.items[index];
		} else {
			return {
				title: '...',
				creator: '...',
				date: '...',
				coloredTags: [],
			}
		}
	}

	// Identical to table.jsx
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

	// Identical to table.jsx
	handleRowClick({ event, index }) {
		if(index < this.props.items.length) {
			this.handleItemSelect(this.props.items[index], event);
		}
	}

	//@TODO: multi select
	handleItemSelect(item, ev) {
		this.props.onItemsSelect([item.key]);
		ev.preventDefault();
	}

	renderRow({ index, isScrolling, key, style }) {
		const item = this.getRow({ index });
		const className = cx({
			item: true,
			odd: index % 2 === 1,
			active: this.props.selectedItemKeys.includes(item.key)
		});
		return (
			<div
				className={ className } key={ key } style={ style }
				onClick={ event => this.handleRowClick({ event, index }) }
				>
				{ item.title }
			</div>
		);
	}

	render() {
		if(!this.props.isReady) {
			return null;
		}

		const { totalItemsCount } = this.props;

		return (
			<div
				className='items-list-wrap'
			>
				<AutoSizer>
					{({ width, height }) => (
						<InfiniteLoader
							ref={ ref => this.loader = ref }
							isRowLoaded={ this.getRowHasLoaded.bind(this) }
							loadMoreRows={ this.handleLoadMore.bind(this) }
							rowCount={ totalItemsCount }
						>
							{({onRowsRendered, registerChild}) => (
								<List
									{ ...this.props }
									className="items-list"
									height={ height }
									onRowsRendered={ onRowsRendered }
									ref={ registerChild }
									rowCount={ totalItemsCount }
									rowHeight={ 42 }
									width={ width }
									rowRenderer={ this.renderRow.bind(this) }
								/>
							)}
						</InfiniteLoader>
					)}
				</AutoSizer>
			</div>
		);
	}
}

module.exports = ItemsList;
