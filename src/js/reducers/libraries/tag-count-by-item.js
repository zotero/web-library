'use strict';

import { indexByKey } from '../../utils';

import {
    RECEIVE_TAGS_FOR_ITEM,
    RECEIVE_ITEMS_IN_COLLECTION,
    RECEIVE_FETCH_ITEMS,
    RECEIVE_TOP_ITEMS,
    RECEIVE_TRASH_ITEMS,
} from '../../constants/actions';

const tagCountByCollection = (state = {}, action) => {
	switch(action.type) {
		case RECEIVE_TAGS_FOR_ITEM:
			return {
				...state,
				[action.itemKey]: parseInt(action.response.response.headers.get('Total-Results'), 10)
			}
		case RECEIVE_FETCH_ITEMS:
		case RECEIVE_ITEMS_IN_COLLECTION:
		case RECEIVE_TOP_ITEMS:
		case RECEIVE_TRASH_ITEMS:
			return {
				...state,
				...indexByKey(action.items, 'key', ({ tags }) => tags.length)
			}
		default:
			return state;
	}
};

export default tagCountByCollection;
