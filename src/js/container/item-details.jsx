'use strict';

import React from 'react';
import { connect } from 'react-redux';

import ItemDetails from '../component/item/details';
import { fetchChildItems, fetchItemsByKeys } from '../actions/items-read';
import { get } from '../utils'

const ItemDetailsContainer = props => <ItemDetails { ...props } />;

const mapStateToProps = state => {
	const { collectionKey, libraryKey, isLibraryReadOnly, isSelectMode, itemKey, itemKeys,
	itemsSource, noteKey } = state.current;
	const item = get(state, ['libraries', libraryKey, 'items', itemKey], null);
	const childItemsData = get(state, ['libraries', libraryKey, 'itemsByParent', itemKey], {});

	const { isFetching, pointer, totalResults } = childItemsData;
	const hasMoreItems = totalResults > 0 && (typeof(pointer) === 'undefined' || pointer < totalResults);
	const hasChecked = typeof(totalResults) !== 'undefined';
	const isFetched = hasChecked && !isFetching && !hasMoreItems;

	var itemsCount;

	switch(itemsSource) {
		case 'query':
			itemsCount = state.query.totalResults;
		break;
		case 'top':
			itemsCount = get(state, ['libraries', libraryKey, 'itemsTop', 'totalResults'], null);
		break;
		case 'trash':
			itemsCount = get(state, ['libraries', libraryKey, 'itemsTrash', 'totalResults'], null);
		break;
		case 'collection':
			itemsCount = get(state, ['libraries', libraryKey, 'itemsByCollection', collectionKey, 'totalResults'], null)
		break;
	}

	return { isLibraryReadOnly, isSelectMode, item, itemKey, itemKeys, itemsCount, noteKey,
	hasMoreItems, hasChecked, isFetched, pointer };
}

export default connect(mapStateToProps, { fetchChildItems, fetchItemsByKeys })(ItemDetailsContainer)
