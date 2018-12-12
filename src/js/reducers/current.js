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
