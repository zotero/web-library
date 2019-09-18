'use strict';

import React from 'react';
import { connect } from 'react-redux';

import ItemDetails from '../component/item/details';
import { get } from '../utils'

const ItemDetailsContainer = props => <ItemDetails { ...props } />;

const mapStateToProps = state => {
	const { collectionKey, libraryKey, isSelectMode, itemKey, itemKeys, itemsSource } = state.current;
	const { isLibraryReadOnly } = (state.config.libraries.find(l => l.key === libraryKey) || {});
	const item = get(state, ['libraries', libraryKey, 'items', itemKey], null);
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

	return { isLibraryReadOnly, isSelectMode, item, itemKeys, itemsCount };
}

export default connect(mapStateToProps)(ItemDetailsContainer)
