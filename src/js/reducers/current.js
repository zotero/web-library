'use strict';

const { ROUTE_CHANGE, TRIGGER_EDITING_ITEM, TRIGGER_SELECT_MODE,
	TOGGLE_TRANSITIONS } = require('../constants/actions');
const { tagsFromUrlPart } = require('../common/navigation');

const stateDefault = {
	library: null,
	collection: null,
	item: null,
	view: 'library',
	editing: null,
	itemsSource: null,
	tags: [],
	search: '',
	itemKeys: [],
	useTransitions: false,
	isSelectMode: false,
};

const current = (state = stateDefault, action) => {
	switch(action.type) {
		case ROUTE_CHANGE:
			var { defaultLibrary } = action;
			var { library, collection, items, tags, view, search = '' } = action.params;
			var itemKeys = items ? action.params.items.split(',') : [];
			var tagNames = tagsFromUrlPart(tags);
			var isSelectMode = itemKeys.length > 1 ? true : state.isSelectMode;
			var isEditing = state.isEditing;
			var itemsSource;

			if(tagNames.length || search.length) {
				itemsSource = 'query';
			} else if(action.params.collection) {
				itemsSource = 'collection';
			} else if(action.path.includes('/trash')) {
				itemsSource = 'trash';
			} else if(action.path.includes('/publications')) {
				itemsSource = 'publications';
			} else {
				itemsSource = 'top';
			}

			if(!view) {
				if(['query', 'trash', 'publications'].includes(itemsSource)) {
					view = 'item-list';
				} else {
					view = items ? isSelectMode ? 'item-list' : 'item-details' : collection ? 'collection' : library ? 'library' : 'libraries';
				}
			}

			if(isSelectMode && view !== 'item-list') {
				isSelectMode = false;
			}

			if(isEditing && view !== 'item-details') {
				isEditing = false;
			}

			return {
				...state,
				collection: collection || null,
				isEditing,
				isSelectMode,
				item: itemKeys && itemKeys.length === 1 ? itemKeys.pop() : null,
				itemKeys,
				itemsSource,
				library: library || defaultLibrary,
				search,
				tags: tagNames,
				view,
			};
		case TRIGGER_EDITING_ITEM:
			return {
				...state,
				editing: action.isEditing ? action.itemKey : null
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
