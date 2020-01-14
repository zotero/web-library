'use strict';

import {
	ERROR_TAGS_IN_TRASH_ITEMS,
	RECEIVE_COLORED_TAGS_IN_TRASH_ITEMS,
	RECEIVE_DELETE_ITEMS,
	RECEIVE_MOVE_ITEMS_TRASH,
	RECEIVE_RECOVER_ITEMS_TRASH,
	RECEIVE_TAGS_IN_TRASH_ITEMS,
	RECEIVE_UPDATE_ITEM,
	REQUEST_TAGS_IN_TRASH_ITEMS,
} from '../../constants/actions';
import { populateTags, updateFetchingState } from '../../common/reducers';

const tagsInTrashItems = (state = {}, action) => {
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
		case RECEIVE_COLORED_TAGS_IN_TRASH_ITEMS:
			return {
				...state,
				coloredTags: action.tags.map(t => t.tag)
			}
		case ERROR_TAGS_IN_TRASH_ITEMS:
			return {
				...state,
				...updateFetchingState(state, action),
			}
		case RECEIVE_DELETE_ITEMS:
		case RECEIVE_MOVE_ITEMS_TRASH:
		case RECEIVE_RECOVER_ITEMS_TRASH:
			return action.items.some(item => 'tags' in item && item.tags.length > 0) ?
				{} : state;
		case RECEIVE_UPDATE_ITEM:
			return action.item.deleted === 1 && 'tags' in action.patch ? {} : state;
		default:
			return state;
	}
};

export default tagsInTrashItems;
