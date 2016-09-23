import Zotero from 'libzotero';

export const SELECT_LIBRARY = 'SELECT_LIBRARY';
export const SELECT_ITEM = 'SELECT_ITEM';
export const REQUEST_ITEMS = 'REQUEST_ITEMS';
export const RECEIVE_ITEMS = 'RECEIVE_ITEMS';
export const REQUEST_COLLECTIONS = 'REQUEST_COLLECTIONS';
export const RECEIVE_COLLECTIONS = 'RECEIVE_COLLECTIONS';
export const SELECT_COLLECTION = 'SELECT_COLLECTION';
export const ERROR_FETCHING_COLLECTIONS = 'ERROR_FETCHING_COLLECTIONS';
export const ERROR_FETCHING_ITEMS = 'ERROR_FETCHING_ITEMS';

export function selectLibrary(type, id, key) {
	let library = new Zotero.Library(type, id, null, key);
	
	return {
		type: SELECT_LIBRARY,
		library: library
	};
}

export function requestCollections(libraryString) {
	return {
		type: REQUEST_COLLECTIONS,
		libraryString
	};
}

export function receiveCollections(libraryString, collections) {
	return {
		type: RECEIVE_COLLECTIONS,
		libraryString,
		collections,
		receivedAt: Date.now()
	};
}

export function selectCollection(collectionKey) {
	return {
		type: SELECT_COLLECTION,
		collectionKey
	};
}

export function requestItems(collectionKey) {
	return {
		type: REQUEST_ITEMS,
		collectionKey
	};
}

export function receiveItems(collectionKey, items) {
	return {
		type: RECEIVE_ITEMS,
		collectionKey,
		items,
		receivedAt: Date.now()
	};
}

export function selectItem(index) {
	return {
		type: SELECT_ITEM,
		index
	};
}

export function errorFetchingCollection(libraryString, error) {
	return {
		type: ERROR_FETCHING_COLLECTIONS,
		libraryString,
		error
	};
}

export function errorFetchingItems(error) {
	return {
		type: ERROR_FETCHING_ITEMS,
		error
	};
}

export function sellectItem(index) {
	return {
		type: SELECT_ITEM,
		index
	};
}

function fetchCollections(library) {
	return dispatch => {
		dispatch(requestCollections(library.libraryString));
		library.loadUpdatedCollections()
			.then(() => {
				dispatch(receiveCollections(
					library.libraryString,
					library.collections.objectArray
				));
			})
			.catch(error => {
				dispatch(errorFetchingCollection(
					library.libraryString,
					error
				));
			});
	};
}

export function fetchCollectionsIfNeeded(library) {
	return (dispatch, getState) => {
		let state = getState();
		if(!state.collections[library]) {
			dispatch(fetchCollections(library));
		}
	};
}

function fetchItems(collection, library) {
	return dispatch => {
		dispatch(requestItems(collection.key));
		collection.getMemberItemKeys()
		.then((keys) => {
			library.loadFromKeys(keys)
			.then(results => {
				if(Array.isArray(results) && results.length >= 1 && Array.isArray(results[0].data)) {
					let items = results[0].data;
					dispatch(receiveItems(collection.key, items));
				} else {
					dispatch(errorFetchingItems('Unexpected response from the API'));
				}
			})
			.catch(error => {
				dispatch(errorFetchingItems(error));
			});
		})
		.catch(error => {
			dispatch(errorFetchingItems(error));
		});
		
	};
}


export function fetchItemsIfNeeded(collection) {
	return (dispatch, getState) => {
		let state = getState();
		if(!state.items[collection]) {
			return dispatch(fetchItems(collection, state.library));
		}
	};
}