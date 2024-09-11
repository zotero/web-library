import { RECEIVE_COLLECTIONS_IN_LIBRARY, RECEIVE_TRASH_ITEMS, SORT_ITEMS } from '../../constants/actions.js';
import { sortItemsByKey } from '../../utils';

const injectTrashedCollections = (itemsTrashState, collectionsState, dataObjectsState, meta) => {
	let trashedCollections = collectionsState.keys
		.map(key => dataObjectsState[key])
		.filter(collection => collection.deleted);

	// Skip collections that are children of other trashed collections
	const trashedCollectionKeys = new Set(trashedCollections.map(collection => collection.key));
	trashedCollections = trashedCollections.filter(collection => !trashedCollectionKeys.has(collection.parentCollection));

	if (!('keys' in itemsTrashState) || itemsTrashState.keys.length === 0) {
		return { ...itemsTrashState, keys: trashedCollections.map(collection => collection.key), injectPoints: trashedCollections.map((_, i) => i) };
	}

	const keysTrash = [
		...itemsTrashState.keys,
		...trashedCollections.map(collection => collection.key)
	];

	if('sortBy' in itemsTrashState && 'sortDirection' in itemsTrashState) {
		const { sortBy, sortDirection } = itemsTrashState;
		sortItemsByKey(meta.mappings, keysTrash, sortBy, sortDirection, key => dataObjectsState[key]);
	}

	const indices = trashedCollections.map((collection) => keysTrash.indexOf(collection.key));

	return { ...itemsTrashState, keys: keysTrash, injectPoints: indices };
}

const itemsAndCollectionsTrash = (state = {}, action, { config, itemsTrashState, dataObjectsState, collectionsState, meta }) => {
	switch (action.type) {
		case RECEIVE_COLLECTIONS_IN_LIBRARY:
			return {
				...state,
				...injectTrashedCollections(itemsTrashState, collectionsState, dataObjectsState, meta, config)
			}
		case RECEIVE_TRASH_ITEMS:
			return {
				...state,
				...injectTrashedCollections(itemsTrashState, collectionsState, dataObjectsState, meta, config)
			}
		case SORT_ITEMS:
			return {
				...state,
				...injectTrashedCollections(itemsTrashState, collectionsState, dataObjectsState, meta, { sortBy: action.sortBy, sortDirection: action.sortDirection })
			}
		default:
			return state;
	}
}

export default itemsAndCollectionsTrash;
