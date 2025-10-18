import { routeRegexp } from '../routes';

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
		case 'secondary':
			return ['secondary'];
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

const getParamsFromPath = (path) => {
	const match = routeRegexp.exec(path);
	if(match && match.groups) {
		const params = { ...match.groups };
		// Decode URI components
		for(const key of Object.keys(params)) {
			if(params[key] !== undefined) {
				params[key] = decodeURIComponent(params[key]);
			}
		}
		return params;
	}
	return null;
};


export { getItemsSource, getCollectionsPath, getItemKeysPath, getSerializedQuery, getParamsFromPath };
