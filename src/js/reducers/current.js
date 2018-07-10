'use strict';

const { SELECT_LIBRARY, ROUTE_CHANGE, TRIGGER_EDITING_ITEM } = require('../constants/actions');

const stateDefault = {
	library: null,
	collection: null,
	item: null,
	view: 'library',
	editing: null,
	itemsSource: null,
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
			return {
				...state,
				collection: action.params.collection || null,
				item: itemKeys && itemKeys.length === 1 ? itemKeys.pop() : null,
				view: action.params.items ?
					'item-details' : action.params.collection ?
						'item-list' : 'library',
				itemsSource: action.params.collection ? 'collection' :
					action.path.includes('/trash') ? 'trash' : 'top'
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
