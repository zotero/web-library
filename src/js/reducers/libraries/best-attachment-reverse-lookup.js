import {
	RECEIVE_CHILD_ITEMS, RECEIVE_CREATE_ITEMS, RECEIVE_FETCH_ITEM_DETAILS, RECEIVE_FETCH_ITEMS,
	RECEIVE_ITEMS_BY_QUERY, RECEIVE_ITEMS_IN_COLLECTION, RECEIVE_PUBLICATIONS_ITEMS,
	RECEIVE_RELATED_ITEMS, RECEIVE_TOP_ITEMS, RECEIVE_TRASH_ITEMS, RECEIVE_ITEMS_SECONDARY
} from '../../constants/actions.js';

import { getItemFromApiUrl } from '../../utils';

const extractBestAttachmentKey = (item) => {
	const bestAttachment = item?.[Symbol.for('links')]?.attachment;
	if (!bestAttachment) {
		return null;
	}

	return getItemFromApiUrl(bestAttachment.href);
}

const bestAttachmentReverseLookup = (state = {}, action) => {
	switch (action.type) {
		case RECEIVE_CHILD_ITEMS:
		case RECEIVE_CREATE_ITEMS:
		case RECEIVE_FETCH_ITEM_DETAILS:
		case RECEIVE_FETCH_ITEMS:
		case RECEIVE_ITEMS_BY_QUERY:
		case RECEIVE_ITEMS_SECONDARY:
		case RECEIVE_ITEMS_IN_COLLECTION:
		case RECEIVE_PUBLICATIONS_ITEMS:
		case RECEIVE_RELATED_ITEMS:
		case RECEIVE_TOP_ITEMS:
		case RECEIVE_TRASH_ITEMS:
			return {
				...state,
				...action.items.reduce((acc, item) => {
					const bestAttachmentKey = extractBestAttachmentKey(item);
					if (bestAttachmentKey) {
						acc[bestAttachmentKey] = item.key;
					}
					return acc;
				}, {})
			};
		default:
			return state;
	}
}

export default bestAttachmentReverseLookup;
