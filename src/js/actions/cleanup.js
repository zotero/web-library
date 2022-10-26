import { chunkedDeleteItems, fetchAllChildItems } from '.';

const deleteUnusedEmbeddedImages = itemKey => {
	return async (dispatch, getState) => {
		if (!itemKey) {
			return null;
		}

		const state = getState();
		const item = state.libraries[state.current.libraryKey]?.items[itemKey];

		if (!item) {
			return null;
		}

		try {
			const parser = new DOMParser();
			await dispatch(fetchAllChildItems(item.key));
			const childItemsKeys = getState().libraries[state.current.libraryKey]?.itemsByParent[item.key]?.keys ?? [];
			const doc = parser.parseFromString(item.note, 'text/html');
			const keys = Array.from(doc.querySelectorAll('img[data-attachment-key]'))
				.map(node => node.getAttribute('data-attachment-key'));
			const redundantChildItemsKeys = childItemsKeys.filter(cik => !keys.includes(cik));
			dispatch(chunkedDeleteItems(redundantChildItemsKeys));
		} catch {
			console.warn(`Failed to cleanup embededed images on item ${item.key}`);
		}
	}
}

export { deleteUnusedEmbeddedImages };
