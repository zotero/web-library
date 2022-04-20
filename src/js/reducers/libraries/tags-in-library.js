import deepEqual from 'deep-equal';
import { DROP_TAGS_IN_LIBRARY, ERROR_TAGS_IN_LIBRARY, RECEIVE_ADD_TAGS_TO_ITEMS,
	RECEIVE_CREATE_ITEM, RECEIVE_DELETE_TAGS, RECEIVE_FETCH_ITEMS, RECEIVE_LIBRARY_SETTINGS,
	RECEIVE_TAGS_IN_LIBRARY, RECEIVE_UPDATE_ITEM, REQUEST_TAGS_IN_LIBRARY,
	RECEIVE_UPDATE_LIBRARY_SETTINGS, RECEIVE_DELETE_LIBRARY_SETTINGS } from
	'../../constants/actions';
import { omit } from '../../common/immutable';
import { detectIfItemsChanged, filterTags, populateTags, updateFetchingState } from '../../common/reducers';

const tagsInLibrary = (state = {}, action, { items } = {}) => {
	switch(action.type) {
		case REQUEST_TAGS_IN_LIBRARY:
			return {
				...state,
				...updateFetchingState(state, action),
			}
		case RECEIVE_TAGS_IN_LIBRARY:
			return {
				...state,
				...populateTags(state, action.tags, action),
				...updateFetchingState(state, action),
			};
		case DROP_TAGS_IN_LIBRARY:
		case ERROR_TAGS_IN_LIBRARY:
			return {
				...state,
				...updateFetchingState(state, action),
			};
		case RECEIVE_LIBRARY_SETTINGS:
			return {
				...state,
				coloredTags: (action.settings?.tagColors?.value ?? []).map(t => t.name),
			}
		case RECEIVE_UPDATE_LIBRARY_SETTINGS:
			return {
				...state,
				coloredTags: (action.settingsValue?.value ?? []).map(t => t.name),
			}
		case RECEIVE_DELETE_LIBRARY_SETTINGS:
			return omit(state, 'coloredTags');
		case RECEIVE_CREATE_ITEM:
			return 'tags' in action.item && action.item.tags.length > 0 ?
				{} : state;
		case RECEIVE_UPDATE_ITEM:
			return 'tags' in action.patch ? {} : state;
		case RECEIVE_DELETE_TAGS:
			return filterTags(state, action.tags);
		case RECEIVE_ADD_TAGS_TO_ITEMS:
			return {};
		case RECEIVE_FETCH_ITEMS:
			return detectIfItemsChanged(
				action, items,
				(newItem, oldItem = {}) => (!newItem.deleted && !oldItem.deleted) && (!deepEqual(newItem.tags, oldItem.tags))
			) ? {} : state
		default:
			return state;
	}
};

export default tagsInLibrary;
