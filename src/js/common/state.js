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
		case 'trash':
			if(!libraryKey) {
				throw new Error('Library key is required for the trash items source');
			}
			return ['libraries', libraryKey, 'itemsAndCollectionsTrash'];
		case 'publications':
			return ['itemsPublications'];
		case 'collection':
			if(!libraryKey || !collectionKey) {
				throw new Error('Library and collection keys are required for the collection items source');
			}
			return ['libraries', libraryKey, 'itemsByCollection', collectionKey];
		case 'top':
			if(!libraryKey) {
				throw new Error('Library key is required for the top items source');
			}
			return ['libraries', libraryKey, 'itemsTop'];
		default:
			throw new Error(`Invalid itemsSource: ${itemsSource}`);
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

const getItemsSource = navStateLikeObject => {
	let itemsSource;
	if (navStateLikeObject.tags?.length || navStateLikeObject.search?.length) {
		itemsSource = 'query';
	} else if (navStateLikeObject.collectionKey) {
		itemsSource = 'collection';
	} else if (navStateLikeObject.isTrash) {
		itemsSource = 'trash';
	} else if (navStateLikeObject.isMyPublications) {
		itemsSource = 'publications';
	} else {
		itemsSource = 'top';
	}
	return itemsSource;
}


export { getItemsSource, getCollectionsPath, getItemKeysPath, getSerializedQuery, getParamsFromRoute };
