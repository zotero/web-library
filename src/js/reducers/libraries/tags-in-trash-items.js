import deepEqual from 'deep-equal';
import { omit } from 'web-common/utils';


import { DROP_COLORED_TAGS_IN_TRASH_ITEMS, DROP_TAGS_IN_TRASH_ITEMS,
	ERROR_COLORED_TAGS_IN_TRASH_ITEMS, ERROR_TAGS_IN_TRASH_ITEMS, RECEIVE_ADD_TAGS_TO_ITEMS,
	RECEIVE_COLORED_TAGS_IN_TRASH_ITEMS, RECEIVE_DELETE_ITEMS, RECEIVE_DELETE_TAGS,
	RECEIVE_FETCH_ITEMS, RECEIVE_LIBRARY_SETTINGS, RECEIVE_MOVE_ITEMS_TRASH,
	RECEIVE_RECOVER_ITEMS_TRASH, RECEIVE_TAGS_IN_TRASH_ITEMS, RECEIVE_UPDATE_ITEM,
	RECEIVE_UPDATE_LIBRARY_SETTINGS, REQUEST_COLORED_TAGS_IN_TRASH_ITEMS,
	REQUEST_TAGS_IN_TRASH_ITEMS, RECEIVE_DELETE_LIBRARY_SETTINGS } from '../../constants/actions';
import { detectIfItemsChanged, filterTags, populateTags, updateFetchingState } from '../../common/reducers';

const tagsInTrashItems = (state = {}, action, { items } = {}) => {
	switch(action.type) {
		case REQUEST_TAGS_IN_TRASH_ITEMS:
			return {
				...state,
				...updateFetchingState(state, action),
			}
		case RECEIVE_TAGS_IN_TRASH_ITEMS:
			return {
				...state,
				...populateTags(state, action.tags, action),
				...updateFetchingState(state, action),
			}
		case ERROR_TAGS_IN_TRASH_ITEMS:
		case DROP_TAGS_IN_TRASH_ITEMS:
			return {
				...state,
				...updateFetchingState(state, action),
			}
		case REQUEST_COLORED_TAGS_IN_TRASH_ITEMS:
			return {
				...state,
				isFetchingColoredTags: true,
			}
		case RECEIVE_COLORED_TAGS_IN_TRASH_ITEMS:
			return {
				...state,
				coloredTags: action.tags.map(t => t.tag),
				isFetchingColoredTags: false,
			}
		case ERROR_COLORED_TAGS_IN_TRASH_ITEMS:
		case DROP_COLORED_TAGS_IN_TRASH_ITEMS:
			return {
				...state,
				isFetchingColoredTags: false,
			}
		case RECEIVE_DELETE_ITEMS:
		case RECEIVE_MOVE_ITEMS_TRASH:
		case RECEIVE_RECOVER_ITEMS_TRASH:
			return action.items.some(item => 'tags' in item && item.tags.length > 0) ?
				{} : state;
		case RECEIVE_UPDATE_ITEM:
			return action.item.deleted === 1 && 'tags' in action.patch ? {} : state;
		case RECEIVE_FETCH_ITEMS:
			return detectIfItemsChanged(
				action, items,
				(newItem, oldItem = {}) => (newItem.deleted || oldItem.deleted) &&
					((newItem.deleted !== oldItem.deleted) || (!deepEqual(newItem.tags, oldItem.tags)))
			) ? {} : state
		case RECEIVE_ADD_TAGS_TO_ITEMS:
			return action.itemKeys.some(itemKey => itemKey in items && items[itemKey].deleted) ? {} : state;
		case RECEIVE_DELETE_TAGS:
			return filterTags(state, action.tags);
		case RECEIVE_LIBRARY_SETTINGS:
		case RECEIVE_UPDATE_LIBRARY_SETTINGS:
		case RECEIVE_DELETE_LIBRARY_SETTINGS:
			return action.settingsKey === 'tagColors' ? omit(state, 'coloredTags') : state;
		default:
			return state;
	}
};

export default tagsInTrashItems;
