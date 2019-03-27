'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import paramCase from 'param-case';
import Icon from '../../ui/icon';
import Spinner from '../../ui/spinner';
import { default as AutoSizer } from 'react-virtualized/dist/commonjs/AutoSizer';
import { default as InfiniteLoader } from 'react-virtualized/dist/commonjs/InfiniteLoader';
import { default as List } from 'react-virtualized/dist/commonjs/List';

class ItemsList extends React.PureComponent {
	state = {};

	// Identical to table.jsx
	componentDidUpdate({ sortBy, sortDirection, items: prevItems,
	selectedItemKeys: prevSelectedItemKeys }) {
		if(this.props.sortBy !== sortBy ||
			this.props.sortDirection !== sortDirection) {
			this.loader.resetLoadMoreRowsCache(false);
		}

		const { selectedItemKeys, items } = this.props;

		if(this.listRef && selectedItemKeys.length > 0 &&
			(items.length !== prevItems.length || prevSelectedItemKeys.length === 0)
		) {
			const scrollToIndex = items.findIndex(
				i => i && selectedItemKeys.includes(i.key)
			)
			this.listRef.scrollToRow(scrollToIndex);
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

	handleKeyDown = ev => {
		const { items } = this.props;
		const index = ev.target.dataset.index;

		if(ev.key === 'Enter' && items[index]) {
			this.handleItemSelect(items[index]);
		}
	}

	renderRow({ index, key, style }) {
		const { device, isSelectMode, selectedItemKeys, onKeyNavigation,
			view } = this.props;
		const item = this.getRow({ index });
		const isLoaded = this.getRowHasLoaded({ index });
		const isActive = selectedItemKeys.includes(item.key);
		const shouldBeTabbable = (device.isSingleColumn && view === 'item-list') ||
			!device.isSingleColumn;
		const className = cx({
			active: isActive,
			item: true,
			odd: (index + 1) % 2 === 1,
			placeholder: item.isPlaceholder
		});

		return (
			<div
				data-index={ index }
				className={ className }
				key={ key }
				style={ style }
				onClick={ event => this.handleRowClick({ event, index }) }
				onFocus={ () => this.setState({ focusedRow: index }) }
				onBlur={ () => this.setState({ focusedRow: null }) }
				onKeyDown={ this.handleKeyDown }
				tabIndex={ shouldBeTabbable ? 0 : null }
				>
				{ isSelectMode && isLoaded && (
					<input
						type="checkbox"
						readOnly
						checked={ isActive }
					/>
				)}
					{ isLoaded ?
						<Icon
							type={ `16/item-types/${paramCase(item.itemType)}` }
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
							{ item.title }
						</div>
						<div className="metadata creator-year">
							<div className="creator">
								{ item.creator}
							</div>
							<div className="year">
								{ item.year }
							</div>
							<div className="icons">
								{
									// currently blocked #191
									// <Icon type="16/attachment" width="16" height="16" />
									// <Icon type="16/note-sm" width="16" height="16" />
								}

								{ item.coloredTags.map((tag, index) => (
									<Icon
										key={ tag.tag }
										type={ index === 0 ? '12/circle' : '12/crescent-circle' }
										symbol={ index === 0 ?
											isActive ? 'circle-active' : 'circle' :
											isActive ? 'crescent-circle-active' : 'crescent-circle'
										}
										width={ index === 0 ? 12 : 8 }
										height="12"
										style={ { color: tag.color } }
									/>
								))}
							</div>
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

		const { totalItemsCount, isError, isSelectMode, selectedItemKeys, items } = this.props;
		const isLoadingUncounted = !isError && typeof(totalItemsCount) === 'undefined';
		const isLastItemFocused = totalItemsCount &&
			this.state.focusedRow === totalItemsCount - 1;
		const isLastItemSelected = totalItemsCount && items[totalItemsCount - 1] &&
			selectedItemKeys.includes(items[totalItemsCount - 1].key);

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
									className={ cx('items-list', {
										'editing': isSelectMode,
										'last-item-focus': isLastItemFocused,
										'last-item-active': isLastItemSelected,
									}) }
									height={ height }
									onRowsRendered={ onRowsRendered }
									ref={ ref => { this.listRef = ref; registerChild(ref); } }
									rowCount={ totalItemsCount || 0 }
									rowHeight={ 61 }
									width={ width }
									rowRenderer={ this.renderRow.bind(this) }
									tabIndex={ -1 }
								/>
							)}
						</InfiniteLoader>
					)}
				</AutoSizer>
				{ isLoadingUncounted && <Spinner className="large" /> }
			</div>
		);
	}
}

export default ItemsList;
