'use strict';

const { SELECT_LIBRARY, ROUTE_CHANGE, TRIGGER_EDITING_ITEM } = require('../constants/actions');
const { tagsFromUrlPart } = require('../common/navigation');

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
			var { collection, items, tags, search = '' } = action.params;
			var itemKeys = items ? action.params.items.split(',') : [];
			var tagNames = tagsFromUrlPart(tags);
			var itemsSource;

			if(tagNames.length || search.length) {
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
				collection: collection || null,
				item: itemKeys && itemKeys.length === 1 ? itemKeys.pop() : null,
				view: items ?
					'item-details' : action.params.collection ?
						'item-list' : 'library',
				itemsSource,
				tags: tagNames,
				search,
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
