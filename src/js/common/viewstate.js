import { localStorageWrapper, JSONTryParse } from '../utils';

const dbName = 'zotero-web-library';
const storeName = 'viewState';
// we use localStorage to synchroneously store view state changes before they are written to
// indexedDB. This way if user navigates away from the page before the view state is written to
// indexedDB, we can still restore the view state when they return.
const localStorageKey = 'zotero-web-library-pending-view-state';
const dbVersion = 1;

const createViewStateObjectStore = db => {
	const store = db.createObjectStore(storeName, { keyPath: ['libraryKey', 'itemKey'] });
	store.createIndex('itemKey', 'itemKey', { unique: false });
	store.createIndex('libraryKey', 'libraryKey', { unique: false });
	store.createIndex('modifyTime', 'modifyTime', { unique: false });
}

export const updateItemViewState = (itemKey, libraryKey, viewState) => {
	localStorageWrapper.setItem(localStorageKey, JSON.stringify({ itemKey, libraryKey, viewState }));
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(dbName, dbVersion);
		request.onupgradeneeded = event => {
			const db = event.target.result;
			createViewStateObjectStore(db);
		}
		request.onerror = reject;
		request.onsuccess = async event => {
			const db = event.target.result;
			const transaction = db.transaction(storeName, 'readwrite');
			const store = transaction.objectStore(storeName);
			const modifyTime = Date.now();
			const putRequest = store.put({ itemKey, libraryKey, modifyTime, viewState });
			putRequest.onerror = () => {
				localStorageKey.removeItem(localStorageKey);
				reject();
			}
			putRequest.onsuccess = () => {
				localStorageWrapper.removeItem(localStorageKey);
				resolve();
			};
		}
	});
}

export const getItemViewState = (itemKey, libraryKey) => {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(dbName, dbVersion);
		request.onupgradeneeded = event => {
			const db = event.target.result;
			createViewStateObjectStore(db);
		}
		request.onerror = reject;
		request.onsuccess = async event => {
			const db = event.target.result;

			// flush any pending view state changes to indexedDB before reading
			const pendingViewState = JSONTryParse(localStorageWrapper.getItem(localStorageKey), null);
			if (pendingViewState) {
				await updateItemViewState(pendingViewState.itemKey, pendingViewState.libraryKey, pendingViewState.viewState);
				localStorageWrapper.removeItem(localStorageKey);
			}

			const transaction = db.transaction(storeName, 'readonly');
			const store = transaction.objectStore(storeName);
			store.get([libraryKey, itemKey]).onsuccess = function (event) {
				resolve(event.target.result?.viewState ?? {});
			};
		}
	});
}
