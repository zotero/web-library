import { chunkedDeleteItems, fetchAllChildItems } from '.';

const deleteUnusedEmbeddedImages = itemKey => {
	return async (dispatch, getState) => {
		if (!itemKey) {
			return null;
		}

		const state = getState();
		const item = state.libraries[state.current.libraryKey]?.items[itemKey];

		if (!item || !item.note) {
			return null;
		}

		try {
			const parser = new DOMParser();
			await dispatch(fetchAllChildItems(item.key));
			const allChildItemsKeys = getState().libraries[state.current.libraryKey]?.itemsByParent[item.key]?.keys ?? [];

			const embeddedImages = allChildItemsKeys
				.map(cik => getState().libraries[state.current.libraryKey]?.items[cik])
				.filter(ci => ci && ci.linkMode === 'embedded_image')

			const doc = parser.parseFromString(item.note, 'text/html');
			const presentKeys = Array.from(doc.querySelectorAll('img[data-attachment-key]'))
				.map(node => node.getAttribute('data-attachment-key'));

			const redundantEmbeddedImageKeys = embeddedImages
				.filter(ci => !presentKeys.includes(ci.key))
				.map(ci => ci.key);

			dispatch(chunkedDeleteItems(redundantEmbeddedImageKeys));
		} catch {
			console.warn(`Failed to cleanup embededed images on item ${item.key}`);
		}
	}
}

export { deleteUnusedEmbeddedImages };
