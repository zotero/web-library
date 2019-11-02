'use strict';

import memoize from 'memoize-one';
import deepEqual from 'deep-equal';
import { createMatchSelector } from 'connected-react-router';
import { get } from '../utils';
import { routes, redirects } from '../routes';

const getCollectionsPath = state => {
	const { libraryKey, collectionKey } = state.current;
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


const getSerializedQuery = ({ collection = null, tag = [], q = null, qmode = null } = {}) => {
	return `${collection}-${tag.join('-')}-${q}-${qmode}`;
}

//@NOTE: ideally we shouldn't need to match or at least should know which path
//		 has been matched, see discussion:
//		 https://github.com/supasate/connected-react-router/issues/38
//		 https://github.com/supasate/connected-react-router/issues/85
//		 https://github.com/supasate/connected-react-router/issues/97
const getParamsFromRoute = memoize(state => {
	for(const redirect of redirects) {
		const match = createMatchSelector(redirect.from)(state);
		if(match !== null && match.isExact) {
			return match.params;
		}
	}
	for(const route of routes) {
		const match = createMatchSelector(route)(state);
		if(match !== null) {
			return match.params;
		}
	}

	return {};
}, deepEqual);

const getTagsData = state => {
	const { collectionKey, itemsSource, libraryKey } = state.current;

	switch(itemsSource) {
		case 'query':
			return state.query.tags;
		case 'trash':
			return get(state, ['libraries', libraryKey, 'tagsInTrashItems'], {});
		case 'publications':
			return get(state, ['libraries', libraryKey, 'tagsInPublicationsItems'], {});
		case 'collection':
			return get(state, ['libraries', libraryKey, 'tagsByCollection', collectionKey], {});
		case 'top':
		default:
			return get(state, ['libraries', libraryKey, 'tagsTop'], {});
	}
}


export { getCollectionsPath, getSerializedQuery, getParamsFromRoute, getTagsData };
