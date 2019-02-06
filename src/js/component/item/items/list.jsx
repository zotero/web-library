'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const cx = require('classnames');
const Icon = require('../../ui/icon');


const { default: AutoSizer } = require('react-virtualized/dist/commonjs/AutoSizer');
const { default: InfiniteLoader } = require('react-virtualized/dist/commonjs/InfiniteLoader');
const { default: List } = require('react-virtualized/dist/commonjs/List');

class ItemsList extends React.PureComponent {

	// Identical to table.jsx
	componentDidUpdate({ sortBy, sortDirection }) {
		if(this.props.sortBy !== sortBy ||
			this.props.sortDirection !== sortDirection) {
			this.loader.resetLoadMoreRowsCache(false);
		}
	}

	// Identical to table.jsx
	getRowHasLoaded({ index }) {
		return !!this.props.items[index];
	}

	// Identical to table.jsx
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

	// Identical to table.jsx
	async handleLoadMore({ startIndex, stopIndex }) {
		this.startIndex = startIndex;
		this.stopIndex = stopIndex;
		await this.props.onLoadMore({ startIndex, stopIndex });
	}

	handleRowClick({ event, index }) {
		if(this.props.items[index]) {
			this.handleItemSelect(this.props.items[index], event);
		}
	}

	handleItemSelect(item) {
		const { isSelectMode, selectedItemKeys } = this.props;
		if(isSelectMode) {
			if(selectedItemKeys.includes(item.key)) {
				this.props.onItemsSelect(selectedItemKeys.filter(key => key !== item.key));
			} else {
				this.props.onItemsSelect([...selectedItemKeys, item.key]);
			}
		} else {
			this.props.onItemsSelect([item.key]);
		}
	}

	renderRow({ index, key, style }) {
		const { isSelectMode, items, selectedItemKeys } = this.props;
		const item = this.getRow({ index });
		const isLoaded = index < items.length;
		const active = selectedItemKeys.includes(item.key);
		const className = cx({
			active,
			item: true,
			odd: (index + 1) % 2 === 1,
			placeholder: item.isPlaceholder
		});
		return (
			<div
				className={ className } key={ key } style={ style }
				onClick={ event => this.handleRowClick({ event, index }) }
				>
				{ isSelectMode && isLoaded && (
					<input
						className="checkbox"
						type="checkbox"
						readOnly
						checked={ active }
					/>
				)}
					<div className="metadata title">
						{ item.title }
					</div>
					<div className="metadata creator-year">
						<div className="creator">
							{ item.creator}
						</div>
						<div className="year">
							{ item.year }
						</div>
					</div>
					<Icon type={ '16/chevron-13' } width="16" height="16" />
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
									rowHeight={ 68 }
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
