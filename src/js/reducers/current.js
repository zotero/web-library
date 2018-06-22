'use strict';

const { SELECT_LIBRARY, ROUTE_CHANGE, TRIGGER_EDITING_ITEM } = require('../constants/actions');

const stateDefault = {
	library: null,
	collection: null,
	item: null,
	view: 'library',
	editing: null,
};

const current = (state = stateDefault, action) => {
	switch(action.type) {
		case SELECT_LIBRARY:
			return {
				...state,
				library: action.libraryKey
			};
		case ROUTE_CHANGE:
			return {
				...state,
				collection: action.params.collection || null,
				item: action.params.item || null,
				view: action.params.item ?
					'item-details' : action.params.collection ?
						'item-list' : 'library'
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
