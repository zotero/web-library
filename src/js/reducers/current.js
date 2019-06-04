'use strict';

import { LOCATION_CHANGE } from 'connected-react-router';

import {
    CONFIGURE_API,
    TRIGGER_EDITING_ITEM,
    TRIGGER_SELECT_MODE,
    TOGGLE_TRANSITIONS,
    TRIGGER_SEARCH_MODE,
} from '../constants/actions';

import { tagsFromUrlPart } from '../common/navigation';
import { getParamsFromRoute } from '../common/state';

const stateDefault = {
	collectionKey: null,
	editingItemKey: null,
	isEditing: false,
	isSelectMode: false,
	itemKey: null,
	itemKeys: [],
	itemsSource: null,
	libraryKey: null,
	search: '',
	qmode: 'titleCreatorYear',
	tags: [],
	userLibraryKey: null,
	useTransitions: false,
	view: 'library',
};

const getLibraryKey = (params, config) => {
	if(params.groupid && params.groupslug) {
		return `g${params.groupid}`;
	}
	if(params.userslug) {
		if(params.userslug == config.userSlug) {
			return `u${config.userId}`;
		}
		const otherUsersLibrary = config.libraries
			.find(l => l.slug === params.userslug);
		if(otherUsersLibrary) {
			return otherUsersLibrary.key;
		}
	}
	return config.defaultLibraryKey;
}


const current = (state = stateDefault, action, { config } = {}) => {
	switch(action.type) {
		case CONFIGURE_API:
			return {
				...state,
				userLibraryKey: `u${action.userId}`,
			}
		case LOCATION_CHANGE:
			if(!config) { return state; }
			var params = getParamsFromRoute({ router: { ...action.payload } });
			var search = params.search || '';
			var qmode = params.qmode || 'titleCreatorYear';
			var isTrash = action.payload.location.pathname.includes('/trash');
			var isMyPublications = action.payload.location.pathname.includes('/publications');
			var collectionKey = params.collection || null;
			var itemKeys = params.items ? params.items.split(',') : [];
			var tags = tagsFromUrlPart(params.tags);
			var isSelectMode = itemKeys.length > 1 ? true : state.isSelectMode;
			var view = params.view;
			var libraryKey = getLibraryKey(params, config);
			var itemsSource;

			if(tags.length || search.length) {
				itemsSource = 'query';
			} else if(collectionKey) {
				itemsSource = 'collection';
			} else if(isTrash) {
				itemsSource = 'trash';
			} else if(isMyPublications) {
				itemsSource = 'publications';
			} else {
				itemsSource = 'top';
			}

			if(!view) {
				//@TODO: Refactor
				view = itemKeys.length ?
					isSelectMode ? 'item-list' : 'item-details'
					: itemsSource === 'collection' && collectionKey ? 'collection' :
					['query', 'trash', 'publications'].includes(itemsSource) ? 'item-list' :
					(params.userslug || params.groupid) ? 'library' : 'libraries';
			}

			return {
				...state,
				collectionKey,
				editingItemKey: state.editingItemKey,
				isEditing: state.isEditing && view !== 'item-details',
				isSelectMode: isSelectMode && view === 'item-list',
				isSearchMode: itemsSource === 'query' || state.isSearchMode,
				itemKey: itemKeys && itemKeys.length === 1 ? itemKeys[0] : null,
				isTrash,
				isMyPublications,
				itemKeys,
				itemsSource,
				libraryKey,
				search,
				qmode,
				tags: tags || [],
				useTransitions: state.useTransitions,
				view,
			}
		case TRIGGER_EDITING_ITEM:
			return {
				...state,
				editingItemKey: action.isEditing ? action.itemKey : null
			};
		case TOGGLE_TRANSITIONS:
			return {
				...state,
				useTransitions: action.useTransitions
			}
		case TRIGGER_SELECT_MODE:
			return {
				...state,
				isSelectMode: action.isSelectMode,
			}
		case TRIGGER_SEARCH_MODE:
			return {
				...state,
				isSearchMode: action.isSearchMode
			}
		default:
			return state;
	}
}

export default current;
