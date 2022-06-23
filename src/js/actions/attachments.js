import { fetchChildItems, navigate, getAttachmentUrl } from '.';
import { cleanDOI, cleanURL, get, getDOIURL, openDelayedURL } from '../utils';

const extractItemKey = url => {
	const matchResult = url.match(/\/items\/([A-Z0-9]{8})/);
	if(matchResult) {
		return matchResult[1];
	}
	return null;
}

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
		const attachment = get(item, [Symbol.for('links'), 'attachment'], null);
		if(attachment) {
			const attachmentItemKey = extractItemKey(attachment.href);
			if(attachment.attachmentType === 'application/pdf') {
				// "best" attachment is PDF, open in reader
				return dispatch(navigate({
					item: itemKey, attachmentKey: attachmentItemKey, noteKey: null, view: 'reader' })
				);
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
		const item = get(state, ['libraries', state.current.libraryKey, 'items', attachmentItemKey], null);

		const isFile = item && item.linkMode && item.linkMode.startsWith('imported') && item[Symbol.for('links')].enclosure;
		const isLink = item && item.linkMode && item.linkMode === 'linked_url';
		const hasLink = isFile || isLink;

		if(hasLink) {
			if(item.contentType === 'application/pdf') {
				return dispatch(navigate({
					item: attachmentItemKey, attachmentKey: null, noteKey: null, view: 'reader' })
				);
			} else {
				return openDelayedURL(dispatch(getAttachmentUrl(attachmentItemKey)));
			}
		}

		return false;
	}
}

export { pickBestAttachmentItemAction, pickBestItemAction, tryGetAttachmentURL }
