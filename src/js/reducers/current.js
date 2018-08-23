'use strict';

const { SELECT_LIBRARY, ROUTE_CHANGE, TRIGGER_EDITING_ITEM } = require('../constants/actions');

const stateDefault = {
	library: null,
	collection: null,
	item: null,
	view: 'library',
	editing: null,
	itemsSource: null,
	tags: [],
};

const current = (state = stateDefault, action) => {
	switch(action.type) {
		case SELECT_LIBRARY:
			return {
				...state,
				library: action.libraryKey
			};
		case ROUTE_CHANGE:
			var itemKeys = action.params.items ? action.params.items.split(',') : [];
			var tagNames = action.params.tags ? action.params.tags.split(/\b,\b/).map(t => t.replace(/,,/g, ',')) : [];
			var itemsSource;

			if(tagNames.length) {
				itemsSource = 'query';
			} else if(action.params.collection) {
				itemsSource = 'collection';
			} else if(action.path.includes('/trash')) {
				itemsSource = 'trash';
			} else {
				itemsSource = 'top';
			}

			return {
				...state,
				collection: action.params.collection || null,
				item: itemKeys && itemKeys.length === 1 ? itemKeys.pop() : null,
				view: action.params.items ?
					'item-details' : action.params.collection ?
						'item-list' : 'library',
				itemsSource,
				tags: tagNames
			};
		case TRIGGER_EDITING_ITEM:
			return {
				...state,
				editing: action.isEditing ? action.itemKey : null
			};
		default:
			return state;
	}
}

module.exports = current;
