/* eslint-disable react/no-deprecated */
'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const { withRouter } = require('react-router-dom');
const { baseMappings } = require('../constants/item');
const { connect } = require('react-redux');
const { noteAsTitle } = require('../common/format');
const ItemList = require('../component/item/list');
const {
	deleteItems,
	fetchItemsInCollection,
	fetchTopItems,
	sortItems,
	preferenceChange
} = require('../actions');
const {
	getCollection,
	getCollectionItemCount,
	getItem,
	getItems,
	getLibraryItemCount,
	getLibraryKey,
	isFetchingItems,
	isTopLevel,
} = require('../state-utils');
const { get, sortByKey, resizeVisibleColumns } = require('../utils');

const processItems = items => {
	return items.map(item => {
		let { itemType, note } = item;
		let title = itemType === 'note' ?
			noteAsTitle(note) :
			item[itemType in baseMappings && baseMappings[itemType]['title'] || 'title'];
		let creator = Symbol.for('meta') in item ?
			item[Symbol.for('meta')].creatorSummary :
			'';
		let date = Symbol.for('meta') in item ?
			item[Symbol.for('meta')].parsedDate :
			'';

		return {
			key: item.key,
			title,
			creator,
			date,
			itemType
		}
	});
};

class ItemListContainer extends React.PureComponent {
	handleItemSelect(itemKey) {
		if(this.props.isTopLevel) {
			this.props.history.push(`/item/${itemKey}`);
		} else {
			this.props.history.push(`/collection/${this.props.collection.key}/item/${itemKey}`);
		}
	}

	handleMultipleItemsSelect(keys) {
		if(this.props.isTopLevel) {
			this.props.history.push(`/items/${keys.join(',')}`);
		} else {
			this.props.history.push(`/collection/${this.props.collection.key}/items/${keys.join(',')}`);
		}
	}

	async handleDelete() {
		const { dispatch, selectedItemKeys } = this.props;

		//@TODO: more graceful way of deleting > 50 items?
		do {
			const itemKeys = selectedItemKeys.splice(0, 50);
			await dispatch(deleteItems(itemKeys));
		} while (selectedItemKeys.length > 50);
		this.handleItemSelect('');
	}

	handleColumnVisibilityChange(field, isVisible) {
		const { preferences, dispatch } = this.props;
		const columnIndex = preferences.columns.findIndex(c => c.field === field);
		const newColumns = [ ...preferences.columns ];

		var fractionBias;
		if(!newColumns[columnIndex].isVisible && isVisible) {
			fractionBias = newColumns[columnIndex].fraction * -1;
		} else if(newColumns[columnIndex].isVisible && !isVisible) {
			fractionBias = newColumns[columnIndex].fraction;
		}

		resizeVisibleColumns(newColumns, fractionBias);
		newColumns[columnIndex].isVisible = isVisible;
		return dispatch(preferenceChange('columns', newColumns));
	}

	handleColumnReorder(columns) {
		const { dispatch } = this.props;
		return dispatch(preferenceChange('columns', columns));
	}

	handleColumnResize(columns) {
		const { dispatch } = this.props;
		return dispatch(preferenceChange('columns', columns));
	}

	async handleLoadMore({ startIndex, stopIndex }) {
		let start = startIndex;
		let limit = (stopIndex - startIndex) + 1;
		let sort = this.props.sortBy;
		let direction = this.props.sortDirection.toLowerCase();
		const { isTopLevel, dispatch, collection } = this.props;

		console.log('handleLoadMore', { isTopLevel, collection, start, limit });

		return isTopLevel ?
			await dispatch(fetchTopItems({ start, limit, sort, direction })) :
			await dispatch(fetchItemsInCollection(collection.key, { start, limit, sort, direction }));
	}

	async handleSort({ sortBy, sortDirection, stopIndex }) {
		const { dispatch } = this.props;
		sortDirection = sortDirection.toLowerCase(); // react-virtualised uses ASC/DESC, zotero asc/desc
		await dispatch(sortItems(sortBy, sortDirection));
		return await this.handleLoadMore({ startIndex: 0, stopIndex });
	}

	render() {
		let { collection, isTopLevel } = this.props;
		var key;
		if(isTopLevel) {
			key = 'top-level';
		} else if(collection) {
			key = `collection-${collection.key}`;
		} else {
			key = 'empty-list';
		}

		return <ItemList
			key = { key }
			{ ...this.props }
			onDelete={ this.handleDelete.bind(this) }
			onItemSelect={ this.handleItemSelect.bind(this) }
			onMultipleItemsSelect={ this.handleMultipleItemsSelect.bind(this) }
			onLoadMore={ this.handleLoadMore.bind(this) }
			onSort={ this.handleSort.bind(this) }
			onColumnVisibilityChange={ this.handleColumnVisibilityChange.bind(this) }
			onColumnReorder={ this.handleColumnReorder.bind(this) }
			onColumnResize={ this.handleColumnResize.bind(this) }
		/>;
	}
}

const mapStateToProps = state => {
	const library = getLibraryKey(state);
	const collection = getCollection(state);
	const item = getItem(state);
	const items = processItems(getItems(state));
	const totalItemsCount = (isTopLevel(state) ? getLibraryItemCount(state) : getCollectionItemCount(state)) || 50;
	const { sortBy, sortDirection } = state.config;
	const preferences = state.preferences;
	const itemFields = state.meta.itemFields;
	const isReady = itemFields && (isTopLevel(state) && library) || collection !== null;
	const isDeleting = state.deleting.some(itemKey => items.filter(i => i.key === itemKey));

	sortByKey(items, sortBy, sortDirection);

	return {
		collection,
		items,
		isReady,
		isDeleting,
		totalItemsCount,
		sortBy,
		preferences,
		itemFields,
		sortDirection: sortDirection.toUpperCase(),
		isTopLevel: isTopLevel(state),
		selectedItemKeys: item ? [item.key] : (state.router && 'items' in state.router.params && state.router.params.items.split(',')) || []
	};
};

const mapDispatchToProps = dispatch => {
	return {
		dispatch
	};
};

ItemListContainer.propTypes = {
  collection: PropTypes.object,
  items: PropTypes.array.isRequired,
  selectedItemKey: PropTypes.string,
  dispatch: PropTypes.func.isRequired
};

module.exports = withRouter(connect(
	mapStateToProps,
	mapDispatchToProps
)(ItemListContainer));
