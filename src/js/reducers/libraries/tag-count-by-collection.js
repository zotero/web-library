'use strict';

import { RECEIVE_TAGS_IN_COLLECTION } from '../../constants/actions';

const tagCountByCollection = (state = {}, action) => {
	switch(action.type) {
		case RECEIVE_TAGS_IN_COLLECTION:
			return {
				...state,
				[action.collectionKey]: parseInt(action.response.response.headers.get('Total-Results'), 10)
			}
		default:
			return state;
	}
};

export default tagCountByCollection;
