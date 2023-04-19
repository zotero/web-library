import { RECEIVE_ADD_ITEMS_TO_COLLECTION, RECEIVE_ADD_TAGS_TO_ITEMS, RECEIVE_CHILD_ITEMS,
    RECEIVE_CREATE_ITEM, RECEIVE_CREATE_ITEMS, RECEIVE_DELETE_ITEM, RECEIVE_DELETE_ITEMS,
    RECEIVE_DELETE_TAGS, RECEIVE_FETCH_ITEM_DETAILS, RECEIVE_FETCH_ITEMS, RECEIVE_ITEMS_BY_QUERY,
    RECEIVE_ITEMS_IN_COLLECTION, RECEIVE_LIBRARY_SETTINGS, RECEIVE_MOVE_ITEMS_TRASH,
    RECEIVE_PUBLICATIONS_ITEMS, RECEIVE_RECOVER_ITEMS_TRASH, RECEIVE_RELATED_ITEMS,
    RECEIVE_REMOVE_ITEMS_FROM_COLLECTION, RECEIVE_TOP_ITEMS, RECEIVE_TRASH_ITEMS,
    RECEIVE_UPDATE_ITEM, RECEIVE_UPDATE_LIBRARY_SETTINGS, RECEIVE_UPLOAD_ATTACHMENT,
    RECEIVE_DELETE_LIBRARY_SETTINGS, } from '../../constants/actions.js';

import { get, indexByKey } from '../../utils';
import { mapObject, removeKeys } from '../../common/immutable';
import { getDerivedData } from '../../common/item';

const calculateDerivedData = (item, { meta, tagColors }) => {
	if(Array.isArray(item)) {
		return item.map(i => calculateDerivedData(i, { meta, tagColors }));
	}

	item[Symbol.for('derived')] = getDerivedData(meta.mappings, item, meta.itemTypes, tagColors);
	return item;
}

const items = (state = {}, action, metaAndTags) => {
	switch(action.type) {
		case RECEIVE_CREATE_ITEM:
			return {
				...state,
				[action.item.key]: calculateDerivedData(action.item, metaAndTags)
			};
		case RECEIVE_DELETE_ITEM:
			return removeKeys(state, action.item.key);
		case RECEIVE_DELETE_ITEMS:
			return removeKeys(state, action.itemKeys);
		case RECEIVE_UPDATE_ITEM:
			return {
				...state,
				[action.itemKey]: calculateDerivedData({
					...get(state, action.itemKey, {}),
					...action.item
				}, metaAndTags)
			};
		case RECEIVE_MOVE_ITEMS_TRASH:
		case RECEIVE_RECOVER_ITEMS_TRASH:
		case RECEIVE_ADD_ITEMS_TO_COLLECTION:
		case RECEIVE_REMOVE_ITEMS_FROM_COLLECTION:
		case RECEIVE_ADD_TAGS_TO_ITEMS:
			return {
				...state,
				...indexByKey(Object.values(action.items), 'key', item => (calculateDerivedData({
					...state[item.key],
					...item
				}, metaAndTags)))
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
				...indexByKey(calculateDerivedData(action.items, metaAndTags), 'key')
			};
		case RECEIVE_UPLOAD_ATTACHMENT:
			return {
				...state,
				[action.itemKey]: {
					...(state[action.itemKey] || {}),
					version: action.response.getVersion() || state[action.itemKey].version,
					[Symbol.for('links')]: {
						...(state[action.itemKey][Symbol.for('links')] || {}),
						//@TODO: could copy actual value from action.response.registerResponse for responses with register step
						//		 (i.e. where file did not exist before)
						enclosure: true
					}
				}
			}
		case RECEIVE_LIBRARY_SETTINGS:
			return mapObject(state, (itemKey, item) => [itemKey, calculateDerivedData(item, {
					meta: metaAndTags.meta,
					tagColors: indexByKey(get(action, 'settings.tagColors.value', []), 'name', ({ color }) => color)
			})])
		case RECEIVE_UPDATE_LIBRARY_SETTINGS:
			return mapObject(state, (itemKey, item) => [itemKey, calculateDerivedData(item, {
					meta: metaAndTags.meta,
					tagColors: indexByKey(action.settingsValue.value, 'name', ({ color }) => color)
			})])
		case RECEIVE_DELETE_LIBRARY_SETTINGS:
			return mapObject(state, (itemKey, item) => [itemKey, calculateDerivedData(item, {
					meta: metaAndTags.meta,
					tagColors: {}
			})])
		case RECEIVE_DELETE_TAGS:
			return mapObject(state, (itemKey, item) => [
				itemKey,
				{
					...item,
					version: item.tags.some(t => action.tags.includes(t.tag)) ? action.response.getVersion() : item.version, //deleted a tag on this item, update version of the item
					tags: item.tags.filter(t => !action.tags.includes(t.tag)) }
			]);
		default:
			return state;
	}
};

export default items;
