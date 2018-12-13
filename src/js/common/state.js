'use strict';

const { createMatchSelector } = require('connected-react-router');
const { get } = require('../utils');
const { tagsFromUrlPart } = require('../common/navigation');
const routes = require('../routes');

const getCollectionsPath = state => {
	const { libraryKey, collectionKey } = getCurrent(state);
	const path = [];
	if(libraryKey) {
		var nextKey = collectionKey;

		while(nextKey) {
			const collection = get(state, ['libraries', libraryKey, 'collections', nextKey]);
			if(collection) {
				path.push(collection.key);
				nextKey = collection.parentCollection;
			} else {
				nextKey = null;
			}
		}
	}

	return path.reverse();
};


const getSerializedQuery = ({ collection = null, tag = [], q = null } = {}) => {
	return `${collection}-${tag.join('-')}-${q}`;
}

//@TODO: memoize
//@NOTE: ideally we shouldn't need to match or at least should know which path
//		 has been matched, see discussion:
//		 https://github.com/supasate/connected-react-router/issues/38
//		 https://github.com/supasate/connected-react-router/issues/85
//		 https://github.com/supasate/connected-react-router/issues/97
const getParamsFromRoute = (state) => {
	for(const route of routes) {
		const match = createMatchSelector(route)(state);
		if(match !== null) {
			return match.params;
		}
	}
	return {};
}


const getCurrent = state => {
	const defaultLibraryKey = state.config.userId ? `u${state.config.userId}` : null;
	const params = getParamsFromRoute(state);
	const search = params.search || '';
	const collectionKey = params.collection || null;
	const itemKeys = params.items ? params.items.split(',') : [];
	const tags = tagsFromUrlPart(params.tags);
	const isSelectMode = itemKeys.length > 1 ? true : state.current.isSelectMode;
	var view = params.view;
	var itemsSource;


	if(tags.length || search.length) {
		itemsSource = 'query';
	} else if(collectionKey) {
		itemsSource = 'collection';
	} else if(state.router.location.pathname.includes('/trash')) {
		itemsSource = 'trash';
	} else if(state.router.location.pathname.includes('/publications')) {
		itemsSource = 'publications';
	} else {
		itemsSource = 'top';
	}

	if(!view) {
		if(['query', 'trash', 'publications'].includes(itemsSource)) {
			view = 'item-list';
		} else {
			//@TODO: Refactor
			view = itemKeys.length ?
				isSelectMode ? 'item-list' : 'item-details'
				: collectionKey ? 'collection' : params.library ? 'library' : 'libraries';
		}
	}

	return {
		collectionKey,
		editingItemKey: state.current.editingItemKey,
		isEditing: state.current.isEditing && view !== 'item-details',
		isSelectMode: isSelectMode && view !== 'item-list',
		itemKey: itemKeys && itemKeys.length === 1 ? itemKeys.pop() : null,
		itemKeys,
		itemsSource,
		libraryKey: params.library || defaultLibraryKey,
		search,
		tags: tags || [],
		userLibraryKey: state.config.userLibraryKey,
		useTransitions: state.current.useTransitions,
		view,
	};
}


module.exports = { getCollectionsPath, getSerializedQuery, getCurrent, getParamsFromRoute };
