'use strict';

const { LOCATION_CHANGE } = require('connected-react-router');
const { CONFIGURE_API, TRIGGER_EDITING_ITEM, TRIGGER_SELECT_MODE,
	TOGGLE_TRANSITIONS } = require('../constants/actions');
const { tagsFromUrlPart } = require('../common/navigation');
const { getParamsFromRoute } = require('../common/state');

const stateDefault = {
	collectionKey: null,
	defaultLibraryKey: null,
	editingItemKey: null,
	isEditing: false,
	isSelectMode: false,
	itemKey: null,
	itemKeys: [],
	itemsSource: null,
	libraryKey: null,
	search: '',
	tags: [],
	userLibraryKey: null,
	useTransitions: false,
	view: 'library',
};

const current = (state = stateDefault, action) => {
	switch(action.type) {
		case CONFIGURE_API:
			var userLibraryKey = `u${action.userId}`;
			return {
				...state,
				userLibraryKey,
				defaultLibraryKey: userLibraryKey,
			}
		case LOCATION_CHANGE:
			var params = getParamsFromRoute({ router: { ...action.payload } });
			var search = params.search || '';
			var collectionKey = params.collection || null;
			var itemKeys = params.items ? params.items.split(',') : [];
			var tags = tagsFromUrlPart(params.tags);
			var isSelectMode = itemKeys.length > 1 ? true : state.isSelectMode;
			var view = params.view;
			var libraryKey = params.library || state.defaultLibraryKey;
			var itemsSource;

			if(tags.length || search.length) {
				itemsSource = 'query';
			} else if(collectionKey) {
				itemsSource = 'collection';
			} else if(action.payload.location.pathname.includes('/trash')) {
				itemsSource = 'trash';
			} else if(action.payload.location.pathname.includes('/publications')) {
				itemsSource = 'publications';
			} else {
				itemsSource = 'top';
			}

			if(!view) {
				if(['query', 'trash', 'publications'].includes(itemsSource)) {
					view = 'item-list';
				} else {
					//@TODO: Refactor
					view = itemKeys.length ?
						isSelectMode ? 'item-list' : 'item-details'
						: collectionKey ? 'collection' : params.library ? 'library' : 'libraries';
				}
			}

			return {
				...state,
				collectionKey,
				editingItemKey: state.editingItemKey,
				isEditing: state.isEditing && view !== 'item-details',
				isSelectMode: isSelectMode && view === 'item-list',
				itemKey: itemKeys && itemKeys.length === 1 ? itemKeys[0] : null,
				itemKeys,
				itemsSource,
				libraryKey,
				search,
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
				isSelectMode: action.isSelectMode
			}
		default:
			return state;
	}
}

module.exports = current;
