import {
	ERROR_CREATE_ITEMS, PRE_CREATE_ITEMS, RECEIVE_CREATE_ITEMS, REQUEST_CREATE_ITEMS } from "../../constants/actions";
import { mapObject, omit } from "web-common/utils";
import { indexByKey } from '../../utils';

const stateDefault = {
	collections: {}, // TODO
	items: {},
};

const itemsBeingCreated = (state = stateDefault, action) => {
	switch (action.type) {
		// TODO: migrate createItem to queue system
		// case REQUEST_CREATE_ITEM:
		// 	return {
		// 		...state,
		// 		[action.item.key]: action.item
		// 	}
		// case RECEIVE_CREATE_ITEM:
		// case ERROR_CREATE_ITEM:
		// 	return omit(state, action.itemKey);
		case PRE_CREATE_ITEMS:
			return {
				...state,
				items: {
					...indexByKey(action.items, 'key', item => ({
						data: item,
						id: action.id,
						isRequested: false
					}))
				}
			}
		case REQUEST_CREATE_ITEMS:
			return {
				...state,
				items: mapObject(state.items, (key, creationData) => [key, creationData.id === action.id ? { ...creationData, isRequested: true } : creationData])
			}
		case RECEIVE_CREATE_ITEMS:
		case ERROR_CREATE_ITEMS:
			return {
				...state,
				items: omit(state.items, (key, creationData) => creationData.id === action.id)
			}
		default:
			return state;
	}
}

export default itemsBeingCreated;
