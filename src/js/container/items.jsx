/* eslint-disable react/no-deprecated */
'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const { connect } = require('react-redux');
const { push } = require('connected-react-router');
const { bindActionCreators } = require('redux');

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
const { makePath } = require('../common/navigation');
const { getFormattedTableItem } = require('../common/item');
const withDevice = require('../enhancers/with-device');

class ItemsContainer extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = { items: [] };
	}

	handleItemsSelect(items = []) {
		const { push, collectionKey: collection, libraryKey: library,
			itemsSource, tags, search } = this.props;
		const trash = itemsSource === 'trash';
		const publications = itemsSource === 'publications';
		const view = 'item-list';
		push(makePath({ library, search, tags, trash, publications, collection, items, view }));
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
		let direction = this.props.sortDirection.toLowerCase();
		let tag = this.props.tags || [];
		const { itemsSource, dispatch, libraryTags, itemTypes, collectionKey,
			search: q, sortBy: sort,  } = this.props;
		const sortAndDirection = { start, limit, sort, direction };
		var sourceItems = [];

		switch(itemsSource) {
			case 'query':
				sourceItems = await dispatch(fetchItemsQuery({ collection: collectionKey, tag, q }, sortAndDirection));
				break;
			case 'top':
				sourceItems = await dispatch(fetchTopItems(sortAndDirection));
				break;
			case 'trash':
				sourceItems = await dispatch(fetchTrashItems(sortAndDirection));
				break;
			case 'publications':
				sourceItems = await dispatch(fetchPublicationsItems(sortAndDirection));
				break;
			case 'collection':
				sourceItems = await dispatch(fetchItemsInCollection(collectionKey, sortAndDirection));
				break;
		}

		const actualLimit = Math.min(limit, sourceItems.length);
		const items = [...this.state.items];

		for(let i = 0; i < actualLimit; i++) {
			items[startIndex + i] = getFormattedTableItem(
				sourceItems[i], itemTypes, libraryTags
			) || null;
		}
		sortByKey(items, sort, direction);
		this.setState({ items });
	}

	async handleSort({ sortBy, sortDirection, stopIndex }) {
		this.setState({ items: [] });
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
		return <Items
			items = { this.state.items }
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
	const {
		libraryKey,
		itemsSource,
		collectionKey,
		tags,
		search,
		itemKey,
		itemKeys,
		isSelectMode,
	} = state.current;
	const collection = get(state, ['libraries', libraryKey, 'collections', collectionKey]);
	const item = get(state, ['libraries', libraryKey, 'items', itemKey]);
	const libraryTags = get(state, ['libraries', libraryKey, 'tags']);
	const isMetaAvailable = !state.fetching.meta;
	const { sortBy, sortDirection } = state.config;
	const preferences = state.preferences;
	const itemFields = state.meta.itemFields;
	const itemTypes = state.meta.itemTypes;
	const isReady = libraryKey && ((!collectionKey && itemFields) || collection !== null);
	var totalItemsCount = 0;

	if(isMetaAvailable) {
		switch(itemsSource) {
			case 'query':
				// items = state.queryItems;
				totalItemsCount = state.query.totalResults;
				totalItemsCount = totalItemsCount === null ? 50 : totalItemsCount;
			break;
			case 'top':
				// items = get(state, ['libraries', libraryKey, 'itemsTop'], []);
				totalItemsCount = get(state, ['itemCountTopByLibrary', libraryKey], 50);
			break;
			case 'trash':
				// items = get(state, ['libraries', libraryKey, 'itemsTrash'], []);
				totalItemsCount = get(state, ['itemCountTrashByLibrary', libraryKey], 50);
			break;
			case 'publications':
				// items = state.itemsPublications;
				totalItemsCount = state.itemCount.publications;
				totalItemsCount = totalItemsCount === null ? 50 : totalItemsCount;
			break;
			case 'collection':
				// items = get(state, ['libraries', libraryKey, 'itemsByCollection', collectionKey], []);
				totalItemsCount = get(state, ['libraries', libraryKey, 'itemCountByCollection', collectionKey], 0)
			break;
		}
	}

	//@TODO: indicate if isDeleting item(s) within visible set
	// const isDeleting = get(state, ['libraries', libraryKey, 'deleting'], [])
	// 		.some(itemKey => items.filter(i => i.key === itemKey));

	return {
		collection,
		collectionKey,
		// isDeleting,
		isReady,
		isSelectMode,
		itemFields,
		itemsSource,
		itemTypes,
		libraryKey,
		preferences,
		search,
		selectedItemKeys: item ? [item.key] : itemKeys,
		sortBy,
		sortDirection: sortDirection.toUpperCase(),
		tags,
		totalItemsCount,
		libraryTags
	};
};

//@TODO: bind all action creators
const mapDispatchToProps = dispatch => ({ dispatch, ...bindActionCreators({ push }, dispatch) });

ItemsContainer.propTypes = {
  collection: PropTypes.object,
  // items: PropTypes.array.isRequired,
  selectedItemKey: PropTypes.string,
  dispatch: PropTypes.func.isRequired
};

module.exports = withDevice(connect(
	mapStateToProps,
	mapDispatchToProps
)(ItemsContainer));
