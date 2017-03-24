import Zotero from 'libzotero';

export const SELECT_LIBRARY = 'SELECT_LIBRARY';
export const SELECT_ITEM = 'SELECT_ITEM';

export const REQUEST_FETCH_ITEMS = 'REQUEST_FETCH_ITEMS';
export const RECEIVE_FETCH_ITEMS = 'RECEIVE_FETCH_ITEMS';
export const ERROR_FETCH_ITEMS = 'ERROR_FETCH_ITEMS';

export const REQUEST_FETCH_COLLECTIONS = 'REQUEST_FETCH_COLLECTIONS';
export const RECEIVE_FETCH_COLLECTIONS = 'RECEIVE_FETCH_COLLECTIONS';
export const ERROR_FETCH_COLLECTIONS = 'ERROR_FETCH_COLLECTIONS';

export const REQUEST_UPDATE_ITEM = 'REQUEST_UPDATE_ITEM';
export const RECEIVE_UPDATE_ITEM = 'RECEIVE_UPDATE_ITEM';
export const ERROR_UPDATE_ITEM = 'ERROR_UPDATE_ITEM';

export function selectLibrary(type, id, key) {
	let library = new Zotero.Library(type, id, null, key);
	
	return {
		type: SELECT_LIBRARY,
		library: library
	};
}

export function requestCollections(libraryString) {
	return {
		type: REQUEST_FETCH_COLLECTIONS,
		libraryString
	};
}

export function receiveCollections(libraryString, collections) {
	collections.sort(
		(a, b) => a.apiObj.data.name.toUpperCase().localeCompare(b.apiObj.data.name.toUpperCase())
	);
	return {
		type: RECEIVE_FETCH_COLLECTIONS,
		libraryString,
		collections,
		receivedAt: Date.now()
	};
}

export function requestItems(collectionKey) {
	return {
		type: REQUEST_FETCH_ITEMS,
		collectionKey
	};
}

export function receiveItems(collectionKey, items) {
	items.sort(
		(a, b) => {
			return a.get('title').toUpperCase().localeCompare(b.get('title').toUpperCase());
		}
	);

	return {
		type: RECEIVE_FETCH_ITEMS,
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
		type: ERROR_FETCH_COLLECTIONS,
		libraryString,
		error
	};
}

export function errorFetchingItems(error) {
	return {
		type: ERROR_FETCH_ITEMS,
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
			library.loadFromKeys(keys, 'items')
			.then(results => {
				if(Array.isArray(results) && results.length >= 1 && Array.isArray(results[0].data)) {
					//@TODO: fix a memory leak/duplicate items in storage
					console.warn('items stored in the library: ', library.items.objectArray.length, library.items.objectArray);
					let items = new Zotero.Items(results[0].data);
					dispatch(receiveItems(collection.key, items.objectArray));
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

export function updateItem(item, field) {
	return async dispatch => {
		dispatch(requestUpdateItem(item, field));
		try {
			await item.writeItem();
		} catch(c) {
			dispatch(errorUpdateItem(c, item, field));
		}
		dispatch(receiveUpdateItem(item, field));
	};
}

export function requestUpdateItem(item, field) {
	return {
		type: REQUEST_UPDATE_ITEM,
		item,
		field
	};
}

export function receiveUpdateItem(item, field) {
	return {
		type: RECEIVE_UPDATE_ITEM,
		item,
		field
	};
}

export function errorUpdateItem(error, item, field) {
	return {
		type: ERROR_UPDATE_ITEM,
		error,
		item,
		field
	};
}