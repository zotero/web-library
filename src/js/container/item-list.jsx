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
	addToCollection,
	createItem,
	deleteItems,
	fetchItemsInCollection,
	fetchItemTemplate,
	fetchTopItems,
	fetchTrashItems,
	moveToTrash,
	preferenceChange,
	recoverFromTrash,
	sortItems,
} = require('../actions');
const { get, sortByKey, resizeVisibleColumns } = require('../utils');

const processItems = items => {
	return items.map(item => {
		let { itemType, note } = item;
		let title = itemType === 'note' ?
			noteAsTitle(note) :
			item[itemType in baseMappings && baseMappings[itemType]['title'] || 'title'] || '';
		let creator = item[Symbol.for('meta')] && item[Symbol.for('meta')].creatorSummary ?
			item[Symbol.for('meta')].creatorSummary :
			'';
		let date = item[Symbol.for('meta')] && item[Symbol.for('meta')].parsedDate ?
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
	handleItemsSelect(keys = []) {
		switch(this.props.itemsSource) {
			case 'top':
				this.props.history.push(`/items/${keys.join(',')}`);
			break;
			case 'trash':
				this.props.history.push(`/trash/items/${keys.join(',')}`);
			break;
			case 'collection':
				this.props.history.push(`/collection/${this.props.collection.key}/items/${keys.join(',')}`);
			break;
		}
	}

	async handleDelete() {
		const { dispatch, selectedItemKeys } = this.props;

		do {
			const itemKeys = selectedItemKeys.splice(0, 50);
			await dispatch(moveToTrash(itemKeys));
		} while (selectedItemKeys.length > 50);
		this.handleItemsSelect();
	}

	async handlePermanentlyDelete() {
		const { dispatch, selectedItemKeys } = this.props;

		do {
			const itemKeys = selectedItemKeys.splice(0, 50);
			await dispatch(deleteItems(itemKeys));
		} while (selectedItemKeys.length > 50);
		this.handleItemsSelect();
	}

	async handleUndelete() {
		const { dispatch, selectedItemKeys } = this.props;

		do {
			const itemKeys = selectedItemKeys.splice(0, 50);
			await dispatch(recoverFromTrash(itemKeys));
		} while (selectedItemKeys.length > 50);
		this.handleItemsSelect();
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
		const { itemsSource, dispatch, collection } = this.props;

		switch(itemsSource) {
			case 'top':
				return await dispatch(fetchTopItems({ start, limit, sort, direction }));
			case 'trash':
				return await dispatch(fetchTrashItems({ start, limit, sort, direction }));
			case 'collection':
				return await dispatch(fetchItemsInCollection(collection.key, { start, limit, sort, direction }));
		}
	}

	async handleNewItemCreate(itemType) {
		const { itemsSource, dispatch, collection } = this.props;
		const template = await dispatch(fetchItemTemplate(itemType));
		const newItem = {
			...template,
			collections: itemsSource === 'collection' ? [collection.key] : []
		};
		const item = await dispatch(createItem(newItem));
		this.handleItemsSelect([item.key]);
	}

	async handleSort({ sortBy, sortDirection, stopIndex }) {
		const { dispatch } = this.props;
		sortDirection = sortDirection.toLowerCase(); // react-virtualised uses ASC/DESC, zotero asc/desc
		await dispatch(sortItems(sortBy, sortDirection));
		return await this.handleLoadMore({ startIndex: 0, stopIndex });
	}

	async handleDrag({ itemKeys, targetType, collectionKey }) {
		const { dispatch } = this.props;
		if(targetType === 'collection') {
			return await dispatch(addToCollection(itemKeys, collectionKey));
		}
	}

	render() {
		let { collection = {}, itemsSource } = this.props;

		return <ItemList
			key = { `${itemsSource}-${collection.key}` }
			{ ...this.props }
			onDelete={ this.handleDelete.bind(this) }
			onPermanentlyDelete={ this.handlePermanentlyDelete.bind(this) }
			onUndelete={ this.handleUndelete.bind(this) }
			onItemDrag={ this.handleDrag.bind(this) }
			onItemsSelect={ this.handleItemsSelect.bind(this) }
			onLoadMore={ this.handleLoadMore.bind(this) }
			onNewItemCreate={ this.handleNewItemCreate.bind(this) }
			onSort={ this.handleSort.bind(this) }
			onColumnVisibilityChange={ this.handleColumnVisibilityChange.bind(this) }
			onColumnReorder={ this.handleColumnReorder.bind(this) }
			onColumnResize={ this.handleColumnResize.bind(this) }
		/>;
	}
}

const mapStateToProps = state => {
	const libraryKey = state.current.library;
	const itemsSource = state.current.itemsSource;
	const collectionKey = state.current.collection;
	const itemKey = state.current.item;
	const collection = get(state, ['libraries', libraryKey, 'collections', collectionKey]);
	const item = get(state, ['libraries', libraryKey, 'items', itemKey]);
	var items = [], totalItemsCount = 0;
	switch(itemsSource) {
		case 'top':
				items = get(state, ['libraries', libraryKey, 'itemsTop'], []);
				totalItemsCount = get(state, ['itemCountTopByLibrary', libraryKey], 50);
		break;
		case 'trash':
				items = get(state, ['libraries', libraryKey, 'itemsTrash'], []);
				totalItemsCount = get(state, ['itemCountTrashByLibrary', libraryKey], 50);
		break;
		case 'collection':
				items = get(state, ['libraries', libraryKey, 'itemsByCollection', collectionKey], []);
				totalItemsCount = get(state, ['libraries', libraryKey, 'itemCountByCollection', collectionKey], 0)
		break;
	}

	items = processItems(items.map(key => get(state, ['libraries', libraryKey, 'items', key])));
	const { sortBy, sortDirection } = state.config;
	const preferences = state.preferences;
	const itemFields = state.meta.itemFields;
	const itemTypes = state.meta.itemTypes;
	const isReady = libraryKey && ((!collectionKey && itemFields) || collection !== null);
	const isDeleting = get(state, ['libraries', libraryKey, 'deleting'], [])
			.some(itemKey => items.filter(i => i.key === itemKey));

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
		itemTypes,
		itemsSource,
		sortDirection: sortDirection.toUpperCase(),
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
