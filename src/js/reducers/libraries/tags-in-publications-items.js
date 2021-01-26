import deepEqual from 'deep-equal';
import {
	DROP_COLORED_TAGS_IN_PUBLICATIONS_ITEMS,
	DROP_TAGS_IN_PUBLICATIONS_ITEMS,
	ERROR_COLORED_TAGS_IN_PUBLICATIONS_ITEMS,
	ERROR_TAGS_IN_PUBLICATIONS_ITEMS,
	RECEIVE_ADD_TAGS_TO_ITEMS,
	RECEIVE_COLORED_TAGS_IN_PUBLICATIONS_ITEMS,
	RECEIVE_DELETE_TAGS,
	RECEIVE_FETCH_ITEMS,
	RECEIVE_LIBRARY_SETTINGS,
	RECEIVE_TAGS_IN_PUBLICATIONS_ITEMS,
	RECEIVE_UPDATE_ITEM,
	RECEIVE_UPDATE_LIBRARY_SETTINGS,
	REQUEST_COLORED_TAGS_IN_PUBLICATIONS_ITEMS,
	REQUEST_TAGS_IN_PUBLICATIONS_ITEMS,
} from '../../constants/actions';
import { detectIfItemsChanged, filterTags, populateTags, updateFetchingState } from '../../common/reducers';
import { omit } from '../../common/immutable';


const tagsInPublicationsItems = (state = {}, action, { items, itemsPublications } = {}) => {
	switch(action.type) {
		case REQUEST_TAGS_IN_PUBLICATIONS_ITEMS:
			return {
				...state,
				...updateFetchingState(state, action),
			}
		case RECEIVE_TAGS_IN_PUBLICATIONS_ITEMS:
			return {
				...state,
				...populateTags(state, action.tags, action),
				...updateFetchingState(state, action),
			}
		case ERROR_TAGS_IN_PUBLICATIONS_ITEMS:
		case DROP_TAGS_IN_PUBLICATIONS_ITEMS:
			return {
				...state,
				...updateFetchingState(state, action),
			};
		case REQUEST_COLORED_TAGS_IN_PUBLICATIONS_ITEMS:
			return {
				...state,
				isFetchingColoredTags: true,
			}
		case RECEIVE_COLORED_TAGS_IN_PUBLICATIONS_ITEMS:
			return {
				...state,
				coloredTags: action.tags.map(t => t.tag),
				isFetchingColoredTags: false,
			}
		case ERROR_COLORED_TAGS_IN_PUBLICATIONS_ITEMS:
		case DROP_COLORED_TAGS_IN_PUBLICATIONS_ITEMS:
			return {
				...state,
				isFetchingColoredTags: false,
			}
		case RECEIVE_UPDATE_ITEM:
			return 'tags' in action.patch ? {} : state;
		case RECEIVE_FETCH_ITEMS:
			return detectIfItemsChanged(
				action, items,
				(newItem, oldItem = {}) => (('keys' in itemsPublications ? itemsPublications.keys : []).includes(newItem.key)) && (!deepEqual(newItem.tags, oldItem.tags))
			) ? {} : state;
		case RECEIVE_ADD_TAGS_TO_ITEMS:
			return action.itemKeys.some(itemKey => 'keys' in itemsPublications && itemKey in itemsPublications.keys) ? {} : state;
		case RECEIVE_DELETE_TAGS:
			return filterTags(state, action.tags);
		case RECEIVE_LIBRARY_SETTINGS:
		case RECEIVE_UPDATE_LIBRARY_SETTINGS:
			return omit(state, 'coloredTags');
		default:
			return state;
	}
};

export default tagsInPublicationsItems;
