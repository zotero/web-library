/* eslint-disable react/no-deprecated */
'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const { withRouter } = require('react-router-dom');
const { connect } = require('react-redux');

const Items = require('../component/item/items');
const {
	addToCollection,
	fetchItemsInCollection,
	fetchItemsQuery,
	fetchPublicationsItems,
	fetchTopItems,
	fetchTrashItems,
	preferenceChange,
	sortItems,
} = require('../actions');
const { get, sortByKey, resizeVisibleColumns } = require('../utils');
const { getSerializedQuery } = require('../common/state');
const { makePath } = require('../common/navigation');
const processItems = require('../common/process-items');
const withDevice = require('../enhancers/with-device');

class ItemsContainer extends React.PureComponent {
	handleItemsSelect(items = []) {
		const { history, collectionKey: collection, libraryKey: library,
			itemsSource, tags, search } = this.props;
		const trash = itemsSource === 'trash';
		const publications = itemsSource === 'publications';
		const view = 'item-list';
		history.push(makePath({ library, search, tags, trash, publications, collection, items, view }));
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
		let tag = this.props.tags || [];
		const { itemsSource, dispatch, collectionKey, search: q } = this.props;
		const sortAndDirection = { start, limit, sort, direction };

		switch(itemsSource) {
			case 'query':
				return await dispatch(fetchItemsQuery({ collection: collectionKey, tag, q }, sortAndDirection));
			case 'top':
				return await dispatch(fetchTopItems(sortAndDirection));
			case 'trash':
				return await dispatch(fetchTrashItems(sortAndDirection));
			case 'publications':
				return await dispatch(fetchPublicationsItems(sortAndDirection));
			case 'collection':
				return await dispatch(fetchItemsInCollection(collectionKey, sortAndDirection));
		}
	}

	async handleSort({ sortBy, sortDirection, stopIndex }) {
		const { dispatch } = this.props;
		sortDirection = sortDirection.toLowerCase(); // react-virtualised uses ASC/DESC, zotero asc/desc
		await dispatch(sortItems(sortBy, sortDirection));
		return await this.handleLoadMore({ startIndex: 0, stopIndex });
	}

	async handleDrag({ itemKeys, targetType, collectionKey, libraryKey }) {
		const { dispatch } = this.props;
		if(targetType === 'collection') {
			return await dispatch(addToCollection(itemKeys, collectionKey, libraryKey));
		}
	}

	render() {
		let { libraryKey, collectionKey = '', itemsSource, search, tags } = this.props;
		var key;
		if(itemsSource == 'collection') {
			key = `${libraryKey}-${collectionKey}`;
		} else if(itemsSource == 'query') {
			key = `${libraryKey}-query-${getSerializedQuery({ collection: collectionKey, tag: tags, q: search })}`;
		} else {
			key = `${libraryKey}-${itemsSource}`;
		}

		return <Items
			key = { key }
			{ ...this.props }
			onColumnReorder={ this.handleColumnReorder.bind(this) }
			onColumnResize={ this.handleColumnResize.bind(this) }
			onColumnVisibilityChange={ this.handleColumnVisibilityChange.bind(this) }
			onItemDrag={ this.handleDrag.bind(this) }
			onItemsSelect={ this.handleItemsSelect.bind(this) }
			onLoadMore={ this.handleLoadMore.bind(this) }
			onSort={ this.handleSort.bind(this) }
		/>;
	}
}

const mapStateToProps = state => {
	const libraryKey = state.current.library;
	const itemsSource = state.current.itemsSource;
	const collectionKey = state.current.collection;
	const tags = state.current.tags;
	const search = state.current.search;
	const itemKey = state.current.item;
	const collection = get(state, ['libraries', libraryKey, 'collections', collectionKey]);
	const item = get(state, ['libraries', libraryKey, 'items', itemKey]);
	const isMetaAvailable = !state.fetching.meta;
	const { sortBy, sortDirection } = state.config;
	const preferences = state.preferences;
	const itemFields = state.meta.itemFields;
	const itemTypes = state.meta.itemTypes;
	const isReady = libraryKey && ((!collectionKey && itemFields) || collection !== null);
	var items = [], totalItemsCount = 0;

	if(isMetaAvailable) {
		switch(itemsSource) {
			case 'query':
				items = state.queryItems;
				totalItemsCount = state.queryItemCount;
				totalItemsCount = totalItemsCount === null ? 50 : totalItemsCount;
			break;
			case 'top':
				items = get(state, ['libraries', libraryKey, 'itemsTop'], []);
				totalItemsCount = get(state, ['itemCountTopByLibrary', libraryKey], 50);
			break;
			case 'trash':
				items = get(state, ['libraries', libraryKey, 'itemsTrash'], []);
				totalItemsCount = get(state, ['itemCountTrashByLibrary', libraryKey], 50);
			break;
			case 'publications':
				items = state.itemsPublications;
				totalItemsCount = state.itemCount.publications;
				totalItemsCount = totalItemsCount === null ? 50 : totalItemsCount;
			break;
			case 'collection':
				items = get(state, ['libraries', libraryKey, 'itemsByCollection', collectionKey], []);
				totalItemsCount = get(state, ['libraries', libraryKey, 'itemCountByCollection', collectionKey], 0)
			break;
		}

		items = processItems(
			items.map(key => get(state, ['libraries', libraryKey, 'items', key])),
			state
		);
		sortByKey(items, sortBy, sortDirection);
	}

	const isDeleting = get(state, ['libraries', libraryKey, 'deleting'], [])
			.some(itemKey => items.filter(i => i.key === itemKey));

	const isSelectMode = state.current.isSelectMode;

	return {
		collection,
		collectionKey,
		isDeleting,
		isReady,
		isSelectMode,
		itemFields,
		items,
		itemsSource,
		itemTypes,
		libraryKey,
		preferences,
		search,
		selectedItemKeys: item ? [item.key] : state.current.itemKeys,
		sortBy,
		sortDirection: sortDirection.toUpperCase(),
		tags,
		totalItemsCount,
	};
};

const mapDispatchToProps = dispatch => {
	return {
		dispatch
	};
};

ItemsContainer.propTypes = {
  collection: PropTypes.object,
  items: PropTypes.array.isRequired,
  selectedItemKey: PropTypes.string,
  dispatch: PropTypes.func.isRequired
};

module.exports = withRouter(withDevice(connect(
	mapStateToProps,
	mapDispatchToProps
)(ItemsContainer)));
