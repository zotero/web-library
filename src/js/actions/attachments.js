import { fetchChildItems, getAttachmentUrl } from '.';
import { cleanDOI, cleanURL, get, getDOIURL } from '../utils';

const extractItemKey = url => {
	const matchResult = url.match(/\/items\/([A-Z0-9]{8})/);
	if(matchResult) {
		return matchResult[1];
	}
	return null;
}

const openAttachmentSimple = attachmentItemKey => {
	return async dispatch => {
		const url = await dispatch(getAttachmentUrl(attachmentItemKey, getAttachmentUrl));
		window.open(url);
	}
}

const openAttachmentBlockerWorkaround = attachmentItemKey => {
	return async dispatch => {
		const pollInterval = 100;
		const checks = [];
		let checkTime = pollInterval;
		let url;

		const promise = dispatch(getAttachmentUrl(attachmentItemKey))
			.then(obtainedUrl => url = obtainedUrl);

		const openIfReady = () => {
			if(url) {
				window.open(url);
				checks.forEach(check => clearTimeout(check))
			}
		}

		while(checkTime < 1000) {
			checks.push(setTimeout(openIfReady, checkTime));
			checkTime += pollInterval
		}

		// this last-resort check is guaranteed to trigger a popup blocker
		checks.push(setTimeout(() => {
			promise.then(url => window.open(url));
		}, checkTime));
	}
}

// @TODO: remove code duplication
const openFirstLinkBlockerWorkaround = itemKey => {
	return (dispatch, getState) => {
		const state = getState();
		let promise = Promise.resolve();
		let itemsByParent = get(state, ['libraries', state.current.libraryKey, 'itemsByParent', itemKey], null);
		let hasFetchedChildItems = false;

		if(itemsByParent) {
			hasFetchedChildItems = true;
		} else {
			promise = dispatch(fetchChildItems(itemKey, { start: 0, limit: 100 })).then(() => hasFetchedChildItems = true);
		}

		const open = () => {
			itemsByParent = get(getState(), ['libraries', state.current.libraryKey, 'itemsByParent', itemKey], null);

			if(itemsByParent && itemsByParent.keys.length > 0) {
				const firstAttachmentKey = itemsByParent.keys[0];
				const item = get(getState(), ['libraries', state.current.libraryKey, 'items', firstAttachmentKey], null);
				if(item && item.url) {
					window.open(item.url);
				}
			}
		}

		const openIfReady = () => {
			if(hasFetchedChildItems) {
				open();
				checks.forEach(check => clearTimeout(check))
			}
		}

		const pollInterval = 100;
		const checks = [];
		let checkTime = pollInterval;

		while(checkTime < 1000) {
			checks.push(setTimeout(openIfReady, checkTime));
			checkTime += pollInterval
		}

		// this last-resort check is guaranteed to trigger a popup blocker
		checks.push(setTimeout(() => {
			promise.then(open);
		}, checkTime));

	}
}

const openFirstLinkSimple = itemKey => {
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
				window.open(item.url);
			}
		}
	}
}

const openFirstLink = itemKey => {
	return async dispatch => {
		const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);

		dispatch(isChrome ?
			openFirstLinkSimple(itemKey) :
			openFirstLinkBlockerWorkaround(itemKey)
		);
	}
}

// openAttachment may be called for top-level attachments that are missing/unsynced so it needs to
// do additional checks before attempting to open the file to avoid erroring. openBestAttachment()
// skips extra checks because it depends on parent item's 'attachment' link which will be empty if
// best attachment is missing. We need to skip checks to in the latter case to avoid erroring if
// item attachments haven't been fetched yet. #402, #410
const openAttachment = (attachmentItemKey, skipChecks = false) => {
	return async (dispatch, getState) => {
		const state = getState();
		const item = get(state, ['libraries', state.current.libraryKey, 'items', attachmentItemKey], null);
		const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);

		const isFile = item && item.linkMode && item.linkMode.startsWith('imported') && item[Symbol.for('links')].enclosure;
		const isLink = item && item.linkMode && item.linkMode === 'linked_url';
		const hasLink = isFile || isLink;

		if(skipChecks || hasLink) {
			dispatch(isChrome ?
				openAttachmentSimple(attachmentItemKey) :
				openAttachmentBlockerWorkaround(attachmentItemKey)
			);
		}
	}
}

const openBestAttachment = itemKey => {
	return async (dispatch, getState) => {
		const state = getState();
		const item = get(state, ['libraries', state.current.libraryKey, 'items', itemKey], null);
		const attachment = get(item, [Symbol.for('links'), 'attachment'], null);
		const attachmentItemKey = extractItemKey(attachment.href);
		dispatch(openAttachment(attachmentItemKey, true));
	}
};

const openBestAttachmentFallback = itemKey => {
	return async (dispatch, getState) => {
		const state = getState();
		const item = get(state, ['libraries', state.current.libraryKey, 'items', itemKey], null);

		if(item.url) {
			const url = cleanURL(item.url, true);
			if(url) {
				window.open(url);
				return;
			}
		}

		if(item.DOI) {
			const doi = cleanDOI(item.DOI);
			if(doi) {
				window.open(getDOIURL(doi));
				return;
			}
		}

		dispatch(openFirstLink(itemKey));
	}
}

export {
	openAttachment,
	openBestAttachment,
	openBestAttachmentFallback
}
