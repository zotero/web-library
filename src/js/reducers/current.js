'use strict';

const { ROUTE_CHANGE, TRIGGER_EDITING_ITEM, TOGGLE_TRANSITIONS } = require('../constants/actions');
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
};

const current = (state = stateDefault, action) => {
	switch(action.type) {
		case ROUTE_CHANGE:
			var { defaultLibrary } = action;
			var { library, collection, items, tags, view, search = '' } = action.params;
			var itemKeys = items ? action.params.items.split(',') : [];
			var tagNames = tagsFromUrlPart(tags);
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
					view = items ? 'item-details' : collection ? 'collection' : library ? 'library' : 'libraries';
				}
			}

			return {
				...state,
				collection: collection || null,
				item: itemKeys && itemKeys.length === 1 ? itemKeys.pop() : null,
				itemsSource,
				tags: tagNames,
				search,
				itemKeys,
				view,
				library: library || defaultLibrary
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
		default:
			return state;
	}
}

module.exports = current;
