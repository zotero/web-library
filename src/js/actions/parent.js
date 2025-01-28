import { pick } from 'web-common/utils';
import { getItemFromIdentifier } from '../common/identifiers';
import {
	BEGIN_CREATE_EMPTY_PARENT_ITEMS, BEGIN_CREATE_PARENT_ITEM_FROM_IDENTIFIER, BEGIN_ONGOING, CLEAR_ONGOING,
	COMPLETE_CREATE_EMPTY_PARENT_ITEMS, COMPLETE_CREATE_PARENT_ITEM_FROM_IDENTIFIER, ERROR_CREATE_EMPTY_PARENT_ITEMS,
	ERROR_CREATE_PARENT_ITEM_FROM_IDENTIFIER
} from '../constants/actions';
import { createItem, createItems, updateMultipleItems, updateItem } from '.';
import { getUniqueId } from '../utils';

const createEmptyParentItems = (itemKeys, libraryKey) => {
	return async (dispatch, getState) => {
		const id = getUniqueId();
		dispatch({
			id,
			data: { count: itemKeys.length, },
			kind: 'create-parent-items',
			libraryKey,
			type: BEGIN_ONGOING,
		});
		dispatch({ type: BEGIN_CREATE_EMPTY_PARENT_ITEMS, itemKeys, libraryKey });
		const state = getState();

		const items = itemKeys.map(itemKey => state.libraries[libraryKey]?.items?.[itemKey])
			.filter(Boolean)
			.filter(item => !item.parentItem);

		const itemsToCreate = items.map(item => {
			const isWebAttachment = item.linkMode === 'imported_file' || item.linkMode === 'linked_file';
			const parent = {
				itemType: isWebAttachment ? 'document' : 'website',
				// If the attachment was named after its filename, remove the extension
				title: item.title === item.filename ? item.title.replace(/\.[^.]+$/, '') : item.title,
				collections: item.collections,
				...(isWebAttachment ? pick(item, ['url', 'accessDate']) : {}),
			};
			return parent;
		});

		try {
			const createdItems = await dispatch(createItems(itemsToCreate, libraryKey));
			const multiItemPatch = items.map((item, index) => ({
				key: item.key,
				parentItem: createdItems[index].key,
				collections: [],
			}));
			await dispatch(updateMultipleItems(multiItemPatch, libraryKey));
			dispatch({ type: COMPLETE_CREATE_EMPTY_PARENT_ITEMS, itemKeys, libraryKey, parentItemKeys: createdItems.map(i => i.key) });
			return createdItems;
		} catch (error) {
			dispatch({ type: ERROR_CREATE_EMPTY_PARENT_ITEMS, itemKeys, libraryKey, error });
		} finally {
			dispatch({ id, type: CLEAR_ONGOING }); // auto-dismiss
		}
	}
}

const createParentItemFromIdentifier = (itemKey, identifier, libraryKey) => {
	return async (dispatch, getState) => {
		const id = getUniqueId();
		dispatch({
			id,
			data: { count: 1 },
			kind: 'create-parent-items',
			libraryKey,
			type: BEGIN_ONGOING,
		});
		dispatch({ type: BEGIN_CREATE_PARENT_ITEM_FROM_IDENTIFIER, itemKey, libraryKey });
		const state = getState();
		const attachmentItem = state.libraries[libraryKey]?.items?.[itemKey];

		try {
			const itemFromIdentifier = await getItemFromIdentifier(identifier, state.config.translateUrl);
			delete itemFromIdentifier.key;
			delete itemFromIdentifier.version;
			itemFromIdentifier.collections = [...attachmentItem.collections];
			const parentItem = await dispatch(createItem(itemFromIdentifier, libraryKey));
			await dispatch(updateItem(itemKey, {
				parentItem: parentItem.key,
				collections: [],
			}, libraryKey));
			dispatch({ type: COMPLETE_CREATE_PARENT_ITEM_FROM_IDENTIFIER, itemKeys: [itemKey], libraryKey, parentItemKey: itemFromIdentifier.key });
			return parentItem;
		} catch (error) {
			dispatch({ type: ERROR_CREATE_PARENT_ITEM_FROM_IDENTIFIER, itemKeys: [itemKey], libraryKey, error });
			throw error;
		} finally {
			dispatch({ id, type: CLEAR_ONGOING }); // auto-dismiss
		}
	}
}

export { createEmptyParentItems, createParentItemFromIdentifier };
