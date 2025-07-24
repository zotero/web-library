import deepEqual from 'deep-equal';
import { shallowEqual } from 'react-redux';
import { omit, pick } from 'web-common/utils';

import {
	DROP_COLORED_TAGS_IN_ITEMS_SECONDARY, DROP_ITEMS_SECONDARY, DROP_TAGS_IN_ITEMS_SECONDARY,
	ERROR_COLORED_TAGS_IN_ITEMS_SECONDARY, ERROR_ITEMS_SECONDARY, ERROR_TAGS_IN_ITEMS_SECONDARY,
	RECEIVE_ADD_TAGS_TO_ITEMS, RECEIVE_COLORED_TAGS_IN_ITEMS_SECONDARY, RECEIVE_DELETE_ITEM,
	RECEIVE_DELETE_ITEMS, RECEIVE_DELETE_LIBRARY_SETTINGS, RECEIVE_DELETE_TAGS, RECEIVE_ITEMS_SECONDARY,
	RECEIVE_LIBRARY_SETTINGS, RECEIVE_MOVE_ITEMS_TRASH, RECEIVE_RECOVER_ITEMS_TRASH,
	RECEIVE_REMOVE_ITEMS_FROM_COLLECTION, RECEIVE_TAGS_IN_ITEMS_SECONDARY, RECEIVE_UPDATE_ITEM,
	RECEIVE_UPDATE_LIBRARY_SETTINGS, REQUEST_COLORED_TAGS_IN_ITEMS_SECONDARY, REQUEST_ITEMS_SECONDARY,
	REQUEST_TAGS_IN_ITEMS_SECONDARY, SORT_ITEMS_SECONDARY, QUERY_SECONDARY, RECEIVE_UPDATE_MULTIPLE_ITEMS
} from '../constants/actions.js';

import { filterItemKeys, filterTags, populateTags, populateItemKeys, sortItemKeysOrClear, updateFetchingState } from '../common/reducers';

const isMatchingQuery = (action, state) => {
	const sameLibraryKey = action?.libraryKey === state.current?.libraryKey;
	const sameCollectionKey = action?.collectionKey === state.current?.collectionKey;
	const sameIsTrash = !!action?.isTrash === !!state.current?.isTrash;
	const sameIsMyPublications = !!action?.isMyPublications === !!state.current?.isMyPublications;
	const sameQuery = state.current?.q === action.queryOptions?.q && state.current.qmode === action.queryOptions?.qmode;
	const sameTags = shallowEqual(action.queryOptions.tag, state.current.tag);

	return sameLibraryKey && sameCollectionKey && sameIsTrash &&
		sameIsMyPublications && sameQuery && sameTags;
}

const defaultState = {
	current: {},
	isFetching: false,
	keys: [],
	requests: [],
	tags: {},
	totalResults: undefined,
};

const secondary = (state = defaultState, action, entireState) => {
	const isTrash = state?.current?.isTrash;
	const collectionKey = state?.current?.collectionKey;
	const { meta } = entireState || {};

	switch (action.type) {
		case QUERY_SECONDARY: {
			let isChanged = !deepEqual(action.query, state.current);
			return {
				...state,
				current: action.query,
				totalResults: isChanged ? undefined : state.totalResults,
				keys: isChanged ? [] : state.keys,
				isFetching: false,
				tags: isChanged ? {} : state.tags
			};
		}
		case REQUEST_ITEMS_SECONDARY:
			return {
				...state,
				...updateFetchingState(state, action),
			}
		case RECEIVE_ITEMS_SECONDARY:
			return {
				...(isMatchingQuery(action, state) ? populateItemKeys(state, action.items.map(item => item.key), action) : state),
				...updateFetchingState(state, action)
			}
		case ERROR_ITEMS_SECONDARY:
		case DROP_ITEMS_SECONDARY:
			return {
				...state,
				...updateFetchingState(state, action),
				isError: true
			}
		case SORT_ITEMS_SECONDARY: {
			const items = entireState?.libraries?.[state.current.libraryKey]?.dataObjects || {};
			return sortItemKeysOrClear(
				meta.mappings, state, items, action.sortBy, action.sortDirection
			);
		}
		case REQUEST_TAGS_IN_ITEMS_SECONDARY:
			return {
				...state,
				tags: {
					...state.tags,
					...updateFetchingState(state.tags, action),
				}
			}
		case RECEIVE_TAGS_IN_ITEMS_SECONDARY:
			return {
				...state,
				tags: {
					...state.tags,
					...populateTags(state.tags, action.tags, action),
					...updateFetchingState(state.tags, action),
				}
			};
		case ERROR_TAGS_IN_ITEMS_SECONDARY:
		case DROP_TAGS_IN_ITEMS_SECONDARY:
			return {
				...state,
				tags: {
					...state.tags,
					...updateFetchingState(state.tags, action),
				}
			};
		case REQUEST_COLORED_TAGS_IN_ITEMS_SECONDARY:
			return {
				...state,
				tags: {
					...state.tags,
					isFetchingColoredTags: true,
				}
			};
		case RECEIVE_COLORED_TAGS_IN_ITEMS_SECONDARY:
			return {
				...state,
				tags: {
					...state.tags,
					coloredTags: action.tags.map(t => t.tag),
					isFetchingColoredTags: false,
				}
			};
		case ERROR_COLORED_TAGS_IN_ITEMS_SECONDARY:
		case DROP_COLORED_TAGS_IN_ITEMS_SECONDARY:
			return {
				...state,
				tags: {
					...state.tags,
					isFetchingColoredTags: false,
				}
			};
		case RECEIVE_UPDATE_ITEM:
			return 'tags' in action.patch ? { ...state, tags: {} } : state;
		case RECEIVE_UPDATE_MULTIPLE_ITEMS: {
				const shouldInvalidate = action.multiPatch.some(patch => 'parentItem' in patch || 'deleted' in patch);
				if(shouldInvalidate) {
					return { ...state, ...pick(defaultState, ['keys', 'totalResults', 'requests', 'isFetching']) };
				}
				return state;
			}
		case RECEIVE_DELETE_ITEM:
			return filterItemKeys(state, action.item.key);
		case RECEIVE_DELETE_ITEMS:
			return filterItemKeys(state, action.itemKeys);
		case RECEIVE_MOVE_ITEMS_TRASH:
			return isTrash ? state : filterItemKeys(state, action.itemKeys);
		case RECEIVE_RECOVER_ITEMS_TRASH:
			return isTrash ? filterItemKeys(state, action.itemKeys) : state;
		case RECEIVE_REMOVE_ITEMS_FROM_COLLECTION:
			return (collectionKey && collectionKey === action.collectionKey) ?
				filterItemKeys(state, action.itemKeysChanged) : state;
		case RECEIVE_ADD_TAGS_TO_ITEMS:
			return state.keys.some(key => action.itemKeys.includes(key)) ? { ...state, tags: {} } : state;
		case RECEIVE_DELETE_TAGS:
			return { ...state, tags: filterTags(state.tags, action.tags) }
		case RECEIVE_LIBRARY_SETTINGS:
		case RECEIVE_UPDATE_LIBRARY_SETTINGS:
		case RECEIVE_DELETE_LIBRARY_SETTINGS:
			return {
				...state,
				tags: action.settingsKey === 'tagColors' ? omit(state.tags, 'coloredTags') : state.tags
			}
		default:
			return state;
	}
};

export default secondary;
