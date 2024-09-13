import {
    DROP_TRASH_ITEMS,
    ERROR_TRASH_ITEMS,
    RECEIVE_COLLECTIONS_IN_LIBRARY,
    RECEIVE_CREATE_COLLECTIONS,
    RECEIVE_DELETE_COLLECTION,
    RECEIVE_DELETE_COLLECTIONS,
    RECEIVE_DELETE_ITEM,
    RECEIVE_DELETE_ITEMS,
    RECEIVE_DELETED_CONTENT,
    RECEIVE_FETCH_ITEMS,
    RECEIVE_MOVE_ITEMS_TRASH,
    RECEIVE_RECOVER_ITEMS_TRASH,
    RECEIVE_TRASH_ITEMS,
    RECEIVE_UPDATE_COLLECTIONS_TRASH,
    REQUEST_TRASH_ITEMS,
    SORT_ITEMS
} from '../../constants/actions.js';
import { injectTrashedCollections } from '../../common/reducers';


const itemsAndCollectionsTrash = (state = {}, action, { config, itemsTrashState, dataObjectsState, collectionsState, meta }) => {
	switch (action.type) {
		case RECEIVE_DELETE_ITEM:
		case RECEIVE_DELETE_ITEMS:
		case RECEIVE_DELETED_CONTENT:
		case RECEIVE_MOVE_ITEMS_TRASH:
		case RECEIVE_RECOVER_ITEMS_TRASH:
		case REQUEST_TRASH_ITEMS:
		case RECEIVE_TRASH_ITEMS:
		case ERROR_TRASH_ITEMS:
		case DROP_TRASH_ITEMS:
		case RECEIVE_FETCH_ITEMS:
		case RECEIVE_COLLECTIONS_IN_LIBRARY:
		case RECEIVE_CREATE_COLLECTIONS:
		case RECEIVE_DELETE_COLLECTION:
		case RECEIVE_DELETE_COLLECTIONS:
		case RECEIVE_UPDATE_COLLECTIONS_TRASH:
		case SORT_ITEMS:
			return {
				...state,
				...injectTrashedCollections(itemsTrashState, collectionsState, dataObjectsState, meta, config)
			}
		default:
			return state;
	}
}

export default itemsAndCollectionsTrash;
