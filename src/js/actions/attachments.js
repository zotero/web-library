import { fetchAllChildItems, fetchChildItems, getAttachmentUrl } from '.';
import { cleanDOI, cleanURL, get, getDOIURL, getItemFromApiUrl, openDelayedURL } from '../utils';
import { makePath } from '../common/navigation';
import { PDFWorker } from '../common/pdf-worker.js';
import { REQUEST_EXPORT_PDF, RECEIVE_EXPORT_PDF, ERROR_EXPORT_PDF  } from '../constants/actions';
import { saveAs } from 'file-saver';
import { READER_CONTENT_TYPES } from '../constants/reader';

const tryGetFirstLink = itemKey => {
	return async (dispatch, getState) => {
		const state = getState();
		let itemsByParent = get(state, ['libraries', state.current.libraryKey, 'itemsByParent', itemKey], null);
		if(!itemsByParent) {
			await dispatch(fetchChildItems(itemKey, { start: 0, limit: 100 }));
			itemsByParent = get(getState(), ['libraries', state.current.libraryKey, 'itemsByParent', itemKey], null);
		}
		if(itemsByParent && itemsByParent.keys.length > 0) {
			const firstAttachmentKey = itemsByParent.keys[0];
			const item = get(getState(), ['libraries', state.current.libraryKey, 'items', firstAttachmentKey], null);
			if(item && item.url) {
				return item.url;
			}
		}

		return false;
	}
}

// maybeGetAttachmentURL may be called for top-level attachments that are missing/unsynced so it needs to
// do additional checks before attempting to open the file to avoid erroring. #402, #410
const tryGetAttachmentURL = attachmentItemKey => {
	return async (dispatch, getState) => {
		const state = getState();
		const item = get(state, ['libraries', state.current.libraryKey, 'items', attachmentItemKey], null);

		const isFile = item && item.linkMode && item.linkMode.startsWith('imported') && item[Symbol.for('links')].enclosure;
		const isLink = item && item.linkMode && item.linkMode === 'linked_url';
		const hasLink = isFile || isLink;

		if(hasLink) {
			return dispatch(getAttachmentUrl(attachmentItemKey));
		}

		return false;
	}
}

const tryGetBestAttachmentURLFallback = itemKey => {
	return async (dispatch, getState) => {
		const state = getState();
		const item = get(state, ['libraries', state.current.libraryKey, 'items', itemKey], null);

		if(item.url) {
			const url = cleanURL(item.url, true);
			if(url) {
				return url;
			}
		}

		if(item.DOI) {
			const doi = cleanDOI(item.DOI);
			if(doi) {
				return getDOIURL(doi);
			}
		}

		return dispatch(tryGetFirstLink(itemKey));
	}
}

const pickBestItemAction = itemKey => {
	return async (dispatch, getState) => {
		const state = getState();
		const item = get(state, ['libraries', state.current.libraryKey, 'items', itemKey], null);
		const current = state.current;
		const attachment = get(item, [Symbol.for('links'), 'attachment'], null);
		if(attachment) {
			const attachmentItemKey = getItemFromApiUrl(attachment.href);
			if (Object.keys(READER_CONTENT_TYPES).includes(attachment.attachmentType)) {
				// "best" attachment is PDF, open in reader
				const readerPath = makePath(state.config, {
					attachmentKey: attachmentItemKey,
					collection: current.collectionKey,
					items: [itemKey],
					library: current.libraryKey,
					noteKey: null,
					publications: current.isMyPublications,
					qmode: current.qmode,
					search: current.search,
					tags: current.tags,
					trash: current.isTrash,
					view: 'reader',
				});
				return window.open(readerPath);
			} else if(attachment) {
				// "best" attachment exists, but is not PDF, open file
				return openDelayedURL(dispatch(getAttachmentUrl(attachmentItemKey)));
			}
		} else {
			// no "best" attachment, pick most appropriate fallback
			return openDelayedURL(dispatch(tryGetBestAttachmentURLFallback(itemKey)));
		}
	}
}

const pickBestAttachmentItemAction = attachmentItemKey => {
	return async (dispatch, getState) => {
		const state = getState();
		const current = state.current;
		const item = get(state, ['libraries', state.current.libraryKey, 'items', attachmentItemKey], null);

		const isFile = item && item.linkMode && item.linkMode.startsWith('imported') && item[Symbol.for('links')].enclosure;
		const isLink = item && item.linkMode && item.linkMode === 'linked_url';
		const hasLink = isFile || isLink;

		if(hasLink) {
			if (Object.keys(READER_CONTENT_TYPES).includes(item.contentType)) {
				const readerPath = makePath(state.config, {
					attachmentKey: null,
					collection: current.collectionKey,
					items: [attachmentItemKey],
					library: current.libraryKey,
					noteKey: null,
					publications: current.isMyPublications,
					qmode: current.qmode,
					search: current.search,
					tags: current.tags,
					trash: current.isTrash,
					view: 'reader',
				});
				return window.open(readerPath);
			} else {
				return openDelayedURL(dispatch(getAttachmentUrl(attachmentItemKey)));
			}
		}

		return false;
	}
}

const exportAttachmentWithAnnotations = itemKey => {
	return async (dispatch, getState) => {
		const libraryKey = getState().current.libraryKey;
		dispatch({
			type: REQUEST_EXPORT_PDF,
			itemKey,
			libraryKey
		});

		try {
			const attachmentURL = await dispatch(getAttachmentUrl(itemKey));
			await dispatch(fetchAllChildItems(itemKey));
			const state = getState();
			const { pdfWorkerURL, pdfReaderCMapsRoot } = state.config;
			const childItems = state.libraries[state.current.libraryKey]?.itemsByParent[itemKey]?.keys ?? [];
			const allItems = state.libraries[state.current.libraryKey]?.items;
			const attachmentItem = allItems[itemKey];
			if (attachmentItem.contentType !== 'application/pdf') {
				throw new Error("Attachment is not a PDF");
			}
			const annotations = childItems
				.map(childItemKey => allItems[childItemKey])
				.filter(item => !item.deleted && item.itemType === 'annotation');

			const pdfWorker = new PDFWorker({ pdfWorkerURL, pdfReaderCMapsRoot });
			const data = await (await fetch(attachmentURL)).arrayBuffer();
			const buf = await pdfWorker.export(data, annotations);
			const blob = new Blob([buf], { type: 'application/pdf' });
			const fileName = attachmentItem?.filename || 'file.pdf';
			saveAs(blob, fileName);

			dispatch({
				type: RECEIVE_EXPORT_PDF,
				libraryKey,
				itemKey,
				fileName,
				blob,
				annotations
			});
		} catch(error) {
			dispatch({
				type: ERROR_EXPORT_PDF,
				libraryKey,
				itemKey,
				error
			});
		}
	}
}

export { pickBestAttachmentItemAction, pickBestItemAction, exportAttachmentWithAnnotations, tryGetAttachmentURL }
