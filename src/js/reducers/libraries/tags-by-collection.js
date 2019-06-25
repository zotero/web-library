'use strict';

import {
	ERROR_TAGS_IN_COLLECTION,
	RECEIVE_ADD_ITEMS_TO_COLLECTION,
	RECEIVE_CREATE_ITEM,
	RECEIVE_CREATE_ITEMS,
	RECEIVE_REMOVE_ITEMS_FROM_COLLECTION,
	RECEIVE_TAGS_IN_COLLECTION,
	RECEIVE_UPDATE_ITEM,
	REQUEST_TAGS_IN_COLLECTION,
} from '../../constants/actions';
import { deduplicate } from '../../utils';

const getResetTagCollections = (state, items, resetState = {}) => {
	const overrides = {};
	items.forEach(
		item => ('tags' in item && item.tags.length > 0) &&
			item.collections.forEach(col => overrides[col] = resetState)
	);
	return overrides;
}

const tags = (state = {}, action) => {
	switch(action.type) {
		case REQUEST_TAGS_IN_COLLECTION:
			return {
				...state,
				[action.collectionKey]: {
					...(state[action.collectionKey] || {}),
					isFetching: true
				}
			}
		case RECEIVE_TAGS_IN_COLLECTION:
			return {
				...state,
				[action.collectionKey]: {
					isFetching: false,
					pointer: ('start' in action.queryOptions && 'limit' in action.queryOptions
						&& !('tag' in action.queryOptions))
						? action.queryOptions.start + action.queryOptions.limit : state[action.collectionKey].pointer,
					totalResults: action.queryOptions.tag ? state[action.collectionKey].totalResults : action.totalResults,
					tags: deduplicate([...(state[action.collectionKey].tags || []), ...action.tags.map(t => t.tag)]),
				}
			}
		case ERROR_TAGS_IN_COLLECTION:
			return {
				...state,
				[action.collectionKey]: {
					...(state[action.collectionKey] || {}),
					isFetching: false
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
				...getResetTagCollections(state, action.items, {})
			}
		case RECEIVE_CREATE_ITEM:
			return {
				...state,
				...getResetTagCollections(state, [action.item], {})
			}
		case RECEIVE_UPDATE_ITEM:
			return {
				...state,
				...action.item.collections.reduce(
					(acc, colKey) => {
						acc[colKey] = 'tags' in action.patch ? {} : state[colKey];
						return acc;
					}, {}
				)
			}
		default:
			return state;
	}
};

export default tags;
