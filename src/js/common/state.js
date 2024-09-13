import memoize from 'memoize-one';
import deepEqual from 'deep-equal';
import { createMatchSelector } from 'connected-react-router';
import { routes, redirects } from '../routes';

const getCollectionsPath = (libraryKey, collectionKey, collectionsData = {}) => {
	const path = [];
	if(libraryKey) {
		var nextKey = collectionKey;

		while(nextKey) {
			const collection = collectionsData[nextKey];
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

const getItemKeysPath = ({ itemsSource, libraryKey, collectionKey }) => {
	switch(itemsSource) {
		case 'query':
			return ['queryAndCollectionsTrash'];
		case 'top':
			return ['libraries', libraryKey, 'itemsTop'];
		case 'trash':
			return ['libraries', libraryKey, 'itemsAndCollectionsTrash'];
		case 'publications':
			return ['itemsPublications'];
		case 'collection':
			return ['libraries', libraryKey, 'itemsByCollection', collectionKey];
	}
}

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


export { getCollectionsPath, getItemKeysPath, getSerializedQuery, getParamsFromRoute };
