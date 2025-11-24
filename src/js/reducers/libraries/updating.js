import {
	ERROR_UPLOAD_ATTACHMENT, RECEIVE_UPLOAD_ATTACHMENT, ERROR_UPDATE_COLLECTION, ERROR_UPDATE_ITEM,
	PRE_UPDATE_COLLECTION, PRE_UPDATE_ITEM, RECEIVE_UPDATE_COLLECTION, RECEIVE_UPDATE_ITEM,
	REQUEST_UPDATE_COLLECTION, REQUEST_UPDATE_ITEM, REQUEST_UPLOAD_ATTACHMENT, PRE_UPDATE_MULTIPLE_ITEMS,
	REQUEST_UPDATE_MULTIPLE_ITEMS, RECEIVE_UPDATE_MULTIPLE_ITEMS, ERROR_UPDATE_MULTIPLE_ITEMS,
	PRE_RENAME_ATTACHMENT,
	REQUEST_RENAME_ATTACHMENT,
	RECEIVE_RENAME_ATTACHMENT,
	ERROR_RENAME_ATTACHMENT
} from '../../constants/actions';
import { mapObject } from 'web-common/utils';

const stateDefault = {
	collections: {},
	items: {},
	uploads: []
};

const updating = (state = stateDefault, action) => {
	switch(action.type) {
		case PRE_UPDATE_ITEM:
			return {
				...state,
				items: {
					...state.items,
					[action.itemKey]: [
						...(action.itemKey in state.items ? state.items[action.itemKey] : []),
						{
							patch: action.patch,
							id: action.id,
							isRequested: false
						}
					]
				}
			};
		case PRE_RENAME_ATTACHMENT:
			return {
				...state,
				items: {
					...state.items,
					[action.itemKey]: [
						...(action.itemKey in state.items ? state.items[action.itemKey] : []),
						{
							patch: { filename: action.filename },
							id: action.id,
							isRequested: false
						}
					]
				}
			};
		case PRE_UPDATE_MULTIPLE_ITEMS:
			return {
				...state,
				items: {
					...state.items,
					...action.multiPatch.reduce((acc, patch) => {
						acc[patch.key] = [
							...(patch.key in state.items ? state.items[patch.key] : []),
							{
								patch: patch,
								id: action.id,
								isRequested: false
							}
						];
						return acc;
					}, {})
				}
			}
		case PRE_UPDATE_COLLECTION:
			return {
				...state,
				collections: {
					...state.collections,
					[action.collectionKey]: [
						...(action.collectionKey in state.collections ?
								state.collections[action.collectionKey] : []),
						{
							patch: action.patch,
							id: action.id,
							isRequested: false
						}
					]
				}
			};
		case REQUEST_UPDATE_ITEM:
		case REQUEST_RENAME_ATTACHMENT:
			return {
				...state,
				items: {
					...state.items,
					[action.itemKey]: (state.items[action.itemKey] || []).map(queueItem => {
						if(queueItem.id === action.id) {
							queueItem.isRequested = true;
						}
						return queueItem;
					})
				}
			};
		case REQUEST_UPDATE_MULTIPLE_ITEMS:
			return {
				...state,
				items: {
					...mapObject(state.items, (key, queueItems) => [key, queueItems.map(queueItem => {
						if(queueItem.id === action.id) {
							queueItem.isRequested = true;
						}
						return queueItem;
					})])
				}
			};
		case REQUEST_UPDATE_COLLECTION:
			return {
				...state,
				collections: {
					...state.collections,
					[action.collectionKey]: (state.collections[action.collectionKey] || []).map(queueItem => {
						if(queueItem.id === action.id) {
							queueItem.isRequested = true;
						}
						return queueItem;
					})
				}
			};
		case RECEIVE_UPDATE_ITEM:
		case ERROR_UPDATE_ITEM:
		case RECEIVE_RENAME_ATTACHMENT:
		case ERROR_RENAME_ATTACHMENT: {
			let newState = {
				...state,
				items: {
					...state.items,
					[action.itemKey]: (state.items[action.itemKey] || [])
						.filter(queueItem => queueItem.id !== action.id)
				}
			};
			if(Object.keys(newState.items[action.itemKey]).length === 0) {
				delete newState.items[action.itemKey];
			}
			return newState;
		}
		case RECEIVE_UPDATE_MULTIPLE_ITEMS:
		case ERROR_UPDATE_MULTIPLE_ITEMS: {
			let newState = {
				...state,
				items: {
					...state.items,
					...mapObject(state.items, (key, queueItems) => [key, queueItems.filter(
						queueItem => queueItem.id !== action.id)
					])
				}
			};
			Object.keys(newState.items).forEach(key => {
				if(Object.keys(newState.items[key]).length === 0) {
					delete newState.items[key];
				}
			});
			return newState;
		}
		case RECEIVE_UPDATE_COLLECTION:
		case ERROR_UPDATE_COLLECTION:
			var newState = {
				...state,
				collections: {
					...state.collections,
					[action.collectionKey]: (state.collections[action.collectionKey] || [])
						.filter(queueItem => queueItem.id !== action.id)
				}
			};
			if(Object.keys(newState.collections[action.collectionKey]).length === 0) {
				delete newState.collections[action.collectionKey];
			}
			return newState;
		case REQUEST_UPLOAD_ATTACHMENT:
			return {
				...state,
				uploads: [...state.uploads, action.itemKey]
			};
		case RECEIVE_UPLOAD_ATTACHMENT:
		case ERROR_UPLOAD_ATTACHMENT:
			return {
				...state,
				uploads: state.uploads.filter(k => k !== action.itemKey)
			};
		default:
			return state;
	}
};

export default updating;
