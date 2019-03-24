'use strict';

import memoize from 'memoize-one';
import deepEqual from 'deep-equal';
import { createMatchSelector } from 'connected-react-router';
import { get } from '../utils';
import routes from '../routes';

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


const getSerializedQuery = ({ collection = null, tag = [], q = null } = {}) => {
	return `${collection}-${tag.join('-')}-${q}`;
}

//@NOTE: ideally we shouldn't need to match or at least should know which path
//		 has been matched, see discussion:
//		 https://github.com/supasate/connected-react-router/issues/38
//		 https://github.com/supasate/connected-react-router/issues/85
//		 https://github.com/supasate/connected-react-router/issues/97
const getParamsFromRoute = memoize(state => {
	for(const route of routes) {
		const match = createMatchSelector(route)(state);
		if(match !== null) {
			return match.params;
		}
	}
	return {};
}, deepEqual);

const getLibraries = state => {
	const { userLibraryKey } = state.current;
	const { includeMyLibrary, includeUserGroups, include = [] } = state.config.libraries;

	return [
		includeMyLibrary && { key: userLibraryKey, isMyLibrary: true, name: 'My Library' },
		...(includeUserGroups ?
			state.groups.map(g => ({ key: `g${g.id}`, isGroupLibrary: true, name: g.name })) :
			[]
		),
		...include
	].filter(Boolean);
}


export { getCollectionsPath, getLibraries, getSerializedQuery,
	getParamsFromRoute };
