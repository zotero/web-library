/* eslint-disable react/no-deprecated */
'use strict';

import PropTypes from 'prop-types';
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import Items from '../component/item/items';
import withDevice from '../enhancers/with-device';
import withSortItems from '../enhancers/with-sort-items';
import columnSortKeyLookup from '../constants/column-sort-key-lookup';
import { copyToLibrary, addToCollection, fetchItemsInCollection, fetchItemsQuery,
	fetchPublicationsItems, fetchTopItems, fetchTrashItems, preferenceChange,
	sortItems } from '../actions';
import { get, resizeVisibleColumns } from '../utils';
import { getFormattedTableItem } from '../common/item';
import { omit } from '../common/immutable';
import { makePath } from '../common/navigation';
const defaultSort = { field: 'title', sort: 'ASC' };
const PAGE_SIZE = 50;

class ItemsContainer extends React.PureComponent {
	handleItemsSelect(items = []) {
		const { collectionKey: collection, libraryKey: library,
			itemsSource, makePath, push, tags, search } = this.props;
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

		// when filling in holes, fetch PAGE_SIZE around it. Fixes rare
		// cases where our sorting doesn't match api sorting and we miss
		// the item that was just created.
		if(limit === 1) {
			start = Math.max(0, start - PAGE_SIZE / 2);
			limit = PAGE_SIZE;
		}

		let direction = this.props.sortDirection.toLowerCase();
		let tag = this.props.tags || [];
		const { itemsSource, dispatch, collectionKey, search: q,
			sortBy, isTrash, isMyPublications  } = this.props;
		const sort = columnSortKeyLookup[sortBy] || 'title';
		const sortAndDirection = { start, limit, sort, direction };

		switch(itemsSource) {
			case 'query':
				await dispatch(fetchItemsQuery({ collectionKey, isMyPublications,
					isTrash, q, tag, }, sortAndDirection));
				break;
			case 'top':
				await dispatch(fetchTopItems(sortAndDirection));
				break;
			case 'trash':
				await dispatch(fetchTrashItems(sortAndDirection));
				break;
			case 'publications':
				await dispatch(fetchPublicationsItems(sortAndDirection));
				break;
			case 'collection':
				await dispatch(fetchItemsInCollection(collectionKey, sortAndDirection));
				break;
		}
	}

	async handleDrag({ itemKeys, targetType, collectionKey = null, libraryKey }) {
		const { dispatch } = this.props;
		if(targetType === 'library') {
			dispatch(copyToLibrary(itemKeys, libraryKey));
		}
		if(targetType === 'collection') {
			return await dispatch(addToCollection(itemKeys, collectionKey, libraryKey));
		}
	}

	render() {
		return <Items
			{ ...this.props }
			onColumnReorder={ this.handleColumnReorder.bind(this) }
			onColumnResize={ this.handleColumnResize.bind(this) }
			onColumnVisibilityChange={ this.handleColumnVisibilityChange.bind(this) }
			onItemDrag={ this.handleDrag.bind(this) }
			onItemsSelect={ this.handleItemsSelect.bind(this) }
			onLoadMore={ this.handleLoadMore.bind(this) }
		/>;
	}
}

const mapStateToProps = state => {
	const { collectionKey, isMyPublications, isSelectMode, isTrash, itemKey,
		itemKeys, itemsSource, libraryKey, search, tags, view, } = state.current;
	const collection = get(state, ['libraries', libraryKey, 'collections', collectionKey]);
	const item = get(state, ['libraries', libraryKey, 'items', itemKey]);
	const libraryTags = get(state, ['libraries', libraryKey, 'tags']);
	const isMetaAvailable = !state.fetching.meta;
	const preferences = state.preferences;
	const itemFields = state.meta.itemFields;
	const itemTypes = state.meta.itemTypes;
	const isReady = libraryKey && ((!collectionKey && itemFields) || collection !== null);
	const { field: sortBy, sort: sortDirection } = preferences.columns.find(
		column => 'sort' in column
	) || defaultSort
	var itemsData = {};

	if(isMetaAvailable) {
		switch(itemsSource) {
			case 'query':
				itemsData = state.query;
			break;
			case 'top':
				itemsData = get(state, ['libraries', libraryKey, 'itemsTop'], {});
			break;
			case 'trash':
				itemsData = get(state, ['libraries', libraryKey, 'itemsTrash'], {});
			break;
			case 'publications':
				itemsData = state.itemsPublications;
			break;
			case 'collection':
				itemsData = get(state, ['libraries', libraryKey, 'itemsByCollection', collectionKey], {});
			break;
		}
	}
	const totalItemsCount = itemsData.totalResults;
	const isFetchingItems = itemsData.isFetching;
	const isError = itemsData.isError;
	const items = (itemsData.keys || []).map(itemKey => itemKey ? getFormattedTableItem(
		get(state, ['libraries', libraryKey, 'items', itemKey]),
		itemTypes,
		libraryTags,
		!('unconfirmedKeys' in itemsData && itemsData.unconfirmedKeys.includes(itemKey))
	) : undefined);

	//@TODO: indicate if isDeleting item(s) within visible set
	// const isDeleting = get(state, ['libraries', libraryKey, 'deleting'], [])
	// 		.some(itemKey => items.filter(i => i.key === itemKey));

	return {
		// isDeleting,
		collection,
		collectionKey,
		isError,
		isFetchingItems,
		isMetaAvailable,
		isMyPublications,
		isReady,
		isSelectMode,
		isTrash,
		itemFields,
		items,
		itemsSource,
		itemTypes,
		libraryKey,
		libraryTags,
		makePath: makePath.bind(null, state.config),
		preferences,
		search,
		selectedItemKeys: item ? [item.key] : itemKeys,
		sortBy,
		sortDirection: sortDirection.toUpperCase(),
		tags,
		totalItemsCount,
		view,
	};
};

//@TODO: bind all action creators
const mapDispatchToProps = dispatch => ({ dispatch, ...bindActionCreators({ push }, dispatch) });

ItemsContainer.propTypes = {
  collection: PropTypes.object,
  // items: PropTypes.array.isRequired,
  selectedItemKey: PropTypes.string,
  dispatch: PropTypes.func.isRequired,
};

export default withSortItems(withDevice(
	connect( mapStateToProps, mapDispatchToProps)(ItemsContainer))
);
