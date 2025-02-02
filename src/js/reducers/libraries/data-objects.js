import { mapObject, omit } from 'web-common/utils';
import {
	RECEIVE_ADD_ITEMS_TO_COLLECTION, RECEIVE_ADD_TAGS_TO_ITEMS, RECEIVE_CHILD_ITEMS,
	RECEIVE_UPDATE_COLLECTIONS_TRASH, RECEIVE_CREATE_ITEM, RECEIVE_CREATE_ITEMS,
	RECEIVE_DELETE_COLLECTIONS, RECEIVE_DELETE_ITEM, RECEIVE_DELETE_ITEMS, RECEIVE_DELETE_TAGS,
	RECEIVE_FETCH_ITEM_DETAILS, RECEIVE_FETCH_ITEMS, RECEIVE_ITEMS_BY_QUERY,
	RECEIVE_ITEMS_IN_COLLECTION, RECEIVE_LIBRARY_SETTINGS, RECEIVE_MOVE_ITEMS_TRASH,
	RECEIVE_PUBLICATIONS_ITEMS, RECEIVE_RECOVER_ITEMS_TRASH, RECEIVE_RELATED_ITEMS,
	RECEIVE_REMOVE_ITEMS_FROM_COLLECTION, RECEIVE_TOP_ITEMS, RECEIVE_TRASH_ITEMS,
	RECEIVE_UPDATE_ITEM, RECEIVE_UPDATE_LIBRARY_SETTINGS, RECEIVE_UPLOAD_ATTACHMENT,
	RECEIVE_DELETE_LIBRARY_SETTINGS, RECEIVE_UPDATE_MULTIPLE_ITEMS, RECEIVE_PATCH_ATTACHMENT,
	RECEIVE_UPDATE_COLLECTION, RECEIVE_CREATE_COLLECTIONS, RECEIVE_COLLECTIONS_IN_LIBRARY,
	RECEIVE_DELETE_COLLECTION, RECEIVE_DELETED_CONTENT,
	RECEIVE_RENAME_ATTACHMENT
} from '../../constants/actions.js';

import { get, indexByKey } from '../../utils';
import { calculateDerivedData } from '../../common/item';

const discardIfOldVersion = (newItems, oldItems) => {
	const result = {};
	for (const key of Object.keys(newItems)) {
		if (!oldItems[key] || newItems[key].version >= oldItems[key].version) {
			result[key] = newItems[key];
		}
	}
	return result;
}

const process = (kind, dataObject, ...args) => {
	if (dataObject[Symbol.for('type')] && dataObject[Symbol.for('type')] !== kind) {
		throw new Error(`Mismatched type in ${dataObject.key}: ${dataObject[Symbol.for('type')]} !== ${kind}`);
	}
	dataObject[Symbol.for('type')] = kind;
	return calculateDerivedData(dataObject, ...args);
}

const processCollection = process.bind(null, 'collection');
const processItem = process.bind(null, 'item');

const dataObjects = (state = {}, action, { meta, tagColors }) => {
	switch (action.type) {
		case RECEIVE_COLLECTIONS_IN_LIBRARY:
		case RECEIVE_CREATE_COLLECTIONS:
			return {
				...state,
				...indexByKey(action.collections, 'key', processCollection)
			};
		case RECEIVE_CREATE_ITEM:
			return {
				...state,
				[action.item.key]: processItem(action.item, { meta, tagColors })
			};
		case RECEIVE_DELETE_COLLECTION:
			return omit(state, action.collection.key);
		case RECEIVE_DELETE_COLLECTIONS:
			return omit(state, action.collectionKeys);
		case RECEIVE_DELETED_CONTENT:
			return omit(state, action.collectionKeys);
		case RECEIVE_DELETE_ITEM:
			return omit(state, action.item.key);
		case RECEIVE_DELETE_ITEMS:
			return omit(state, action.itemKeys);
		case RECEIVE_UPDATE_COLLECTION:
			return {
				...state,
				[action.collection.key]: processCollection(action.collection)
			}
		case RECEIVE_UPDATE_ITEM:
			return {
				...state,
				[action.itemKey]: processItem({
					...get(state, action.itemKey, {}),
					...action.item
				}, { meta, tagColors })
			};
		case RECEIVE_RENAME_ATTACHMENT:
			return {
				...state,
				[action.itemKey]: processItem({
					...state?.[action.itemKey] ?? {},
					version: action.response.getVersion() || state[action.itemKey].version,
					filename: action.filename
				})
			}
		case RECEIVE_UPDATE_COLLECTIONS_TRASH:
			return {
				...state,
				...indexByKey(Object.values(action.collections), 'key', collection => (processCollection({
					...state[collection.key],
					...collection
				})))
			}
		case RECEIVE_UPDATE_MULTIPLE_ITEMS:
		case RECEIVE_MOVE_ITEMS_TRASH:
		case RECEIVE_RECOVER_ITEMS_TRASH:
		case RECEIVE_ADD_ITEMS_TO_COLLECTION:
		case RECEIVE_REMOVE_ITEMS_FROM_COLLECTION:
		case RECEIVE_ADD_TAGS_TO_ITEMS:
			return {
				...state,
				...indexByKey(Object.values(action.items), 'key', item => (processItem({
					...state[item.key],
					...item
				}, { meta, tagColors })))
			}
		case RECEIVE_CHILD_ITEMS:
		case RECEIVE_CREATE_ITEMS:
		case RECEIVE_FETCH_ITEM_DETAILS:
		case RECEIVE_FETCH_ITEMS:
		case RECEIVE_ITEMS_BY_QUERY:
		case RECEIVE_ITEMS_IN_COLLECTION:
		case RECEIVE_PUBLICATIONS_ITEMS:
		case RECEIVE_RELATED_ITEMS:
		case RECEIVE_TOP_ITEMS:
		case RECEIVE_TRASH_ITEMS:
			return {
				...state,
				...discardIfOldVersion(indexByKey(action.items, 'key', item => processItem(item, { meta, tagColors })), state)
			};
		case RECEIVE_UPLOAD_ATTACHMENT:
			return {
				...state,
				[action.itemKey]: {
					...(state[action.itemKey] || {}),
					version: action.response.getVersion() || state[action.itemKey].version,
					md5: action.response.getData().md5sum,
					[Symbol.for('links')]: {
						...(state[action.itemKey][Symbol.for('links')] || {}),
						//@TODO: could copy actual value from action.response.registerResponse for responses with register step
						//		 (i.e. where file did not exist before)
						enclosure: true
					}
				}
			}
		case RECEIVE_PATCH_ATTACHMENT:
			return {
				...state,
				[action.itemKey]: {
					...(state[action.itemKey] || {}),
					version: action.response.getVersion() || state[action.itemKey].version,
					md5: action.response.getData().md5sum
				}
			}
		case RECEIVE_LIBRARY_SETTINGS:
		case RECEIVE_UPDATE_LIBRARY_SETTINGS:
			return action.settingsKey === 'tagColors' ? mapObject(state, (itemKey, item) => [itemKey, calculateDerivedData(item, {
				meta,
				tagColors: { value: action.value ?? [], lookup: indexByKey(action.value ?? [], 'name', ({ color }) => color) }
			})]) : state;
		case RECEIVE_DELETE_LIBRARY_SETTINGS:
			return action.settingsKey === 'tagColors' ? mapObject(state, (itemKey, item) => [itemKey, calculateDerivedData(item, {
				meta,
				tagColors: {}
			})]) : state;
		case RECEIVE_DELETE_TAGS:
			return mapObject(state, (itemKey, item) => [
				itemKey,
				{
					...item,
					version: item.tags.some(t => action.tags.includes(t.tag)) ? action.response.getVersion() : item.version, //deleted a tag on this item, update version of the item
					tags: item.tags.filter(t => !action.tags.includes(t.tag))
				}
			]);
		default:
			return state;
	}
}

export default dataObjects;
