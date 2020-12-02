import deepEqual from 'deep-equal';
import {
	DROP_COLORED_TAGS_IN_COLLECTION,
	DROP_TAGS_IN_COLLECTION,
	ERROR_COLORED_TAGS_IN_COLLECTION,
	ERROR_TAGS_IN_COLLECTION,
	RECEIVE_ADD_ITEMS_TO_COLLECTION,
	RECEIVE_ADD_TAGS_TO_ITEMS,
	RECEIVE_COLORED_TAGS_IN_COLLECTION,
	RECEIVE_CREATE_ITEM,
	RECEIVE_CREATE_ITEMS,
	RECEIVE_FETCH_ITEMS,
	RECEIVE_REMOVE_ITEMS_FROM_COLLECTION,
	RECEIVE_TAGS_IN_COLLECTION,
	RECEIVE_UPDATE_ITEM,
	REQUEST_COLORED_TAGS_IN_COLLECTION,
	REQUEST_TAGS_IN_COLLECTION,
} from '../../constants/actions';
import { get } from '../../utils';
import { detectItemsChanged, populateTags, updateFetchingState } from '../../common/reducers';


const getResetTagCollections = (action, isCreateItems = false, items) => {
	const newItems = 'item' in action ? [action.item] : action.items;
	const itemsChanged = detectItemsChanged({ items: newItems, libraryKey: action.libraryKey }, items, (newItem, oldItem = {}) => {
		if(isCreateItems && newItem.tags.length > 0) {
			return true;
		}

		if(newItem.deleted !== oldItem.deleted) {
			return true;
		}

		if(!deepEqual(newItem.collections, oldItem.collections)) {
			return true;
		}

		return !deepEqual(newItem.tags, oldItem.tags);
	});

	const overrides = {};

	itemsChanged.forEach(item => {
		const collections = [...(item.collections || []), ...get(items, [item.key, 'collections'], [])];
		collections.forEach(col => overrides[col] = {});
	});

	return overrides;
}

const tags = (state = {}, action, { items } = {}) => {
	switch(action.type) {
		case REQUEST_TAGS_IN_COLLECTION:
			return {
				...state,
				[action.collectionKey]: {
					...(state[action.collectionKey] || {}),
					...updateFetchingState(state[action.collectionKey], action),
				}
			}
		case RECEIVE_TAGS_IN_COLLECTION:
			return {
				...state,
				[action.collectionKey]: {
					...state[action.collectionKey],
					...populateTags(state[action.collectionKey], action.tags, action),
					...updateFetchingState(state[action.collectionKey], action),
				}
			}
		case ERROR_TAGS_IN_COLLECTION:
		case DROP_TAGS_IN_COLLECTION:
			return {
				...state,
				[action.collectionKey]: {
					...(state[action.collectionKey] || {}),
					...updateFetchingState(state[action.collectionKey], action),
				}
			}
		case REQUEST_COLORED_TAGS_IN_COLLECTION:
			return {
				...state,
				[action.collectionKey]: {
					...state[action.collectionKey],
					isFetchingColoredTags: true,
				}
			}
		case RECEIVE_COLORED_TAGS_IN_COLLECTION:
			return {
				...state,
				[action.collectionKey]: {
					...state[action.collectionKey],
					coloredTags: action.tags.map(t => t.tag),
					isFetchingColoredTags: false,
				}
			}
		case ERROR_COLORED_TAGS_IN_COLLECTION:
		case DROP_COLORED_TAGS_IN_COLLECTION:
			return {
				...state,
				[action.collectionKey]: {
					...state[action.collectionKey],
					isFetchingColoredTags: false,
				}
			}
		case RECEIVE_ADD_ITEMS_TO_COLLECTION:
		case RECEIVE_REMOVE_ITEMS_FROM_COLLECTION:
			return {
				...state,
				[action.collectionKey]: action.items.some(item => 'tags' in item && item.tags.length > 0) ?
					{} : state
			}
		case RECEIVE_CREATE_ITEMS:
			return {
				...state,
				...getResetTagCollections(action, true, items)
			}
		case RECEIVE_CREATE_ITEM:
			return {
				...state,
				...getResetTagCollections(action, true, items)
			}
		case RECEIVE_FETCH_ITEMS:
			return {
				...state,
				...getResetTagCollections(action, false, items)
			}
		case RECEIVE_UPDATE_ITEM:
			return {
				...state,
				...('collections' in action.item ? action.item.collections.reduce(
					(acc, colKey) => {
						acc[colKey] = 'tags' in action.patch ? {} : state[colKey];
						return acc;
					}, {}
				) : {})
			}
		case RECEIVE_ADD_TAGS_TO_ITEMS:
			return {
				...state,
				...(action.itemKeys.reduce(
					(acc, itemKey) => {
						if(itemKey in items && 'collections' in items[itemKey]) {
							items[itemKey].collections.forEach(colKey => {
								acc[colKey] = {};
							});
						}
						return acc;
					}, {}))
			}
		default:
			return state;
	}
};

export default tags;
