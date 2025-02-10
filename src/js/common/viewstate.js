const dbName = 'zotero-web-library';
const storeName = 'viewState';
const dbVersion = 1;

const createViewStateObjectStore = db => {
	const store = db.createObjectStore(storeName, { keyPath: ['libraryKey', 'itemKey'] });
	store.createIndex('itemKey', 'itemKey', { unique: false });
	store.createIndex('libraryKey', 'libraryKey', { unique: false });
	store.createIndex('modifyTime', 'modifyTime', { unique: false });
}

export const updateItemViewState = (itemKey, libraryKey, viewState) => {
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
			putRequest.onerror = reject;
			putRequest.onsuccess = () => {
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
			const transaction = db.transaction(storeName, 'readonly');
			const store = transaction.objectStore(storeName);
			store.get([libraryKey, itemKey]).onsuccess = function (event) {
				resolve(event.target.result?.viewState ?? {});
			};
		}
	});
}
