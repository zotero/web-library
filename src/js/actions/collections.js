import api from 'zotero-api-client';

import {
    BEGIN_FETCH_ALL_COLLECTIONS,
    COMPLETE_FETCH_ALL_COLLECTIONS,
    ERROR_CREATE_COLLECTIONS,
    ERROR_DELETE_COLLECTION,
    ERROR_UPDATE_COLLECTION,
    PRE_UPDATE_COLLECTION,
    RECEIVE_CREATE_COLLECTIONS,
    RECEIVE_DELETE_COLLECTION,
    RECEIVE_UPDATE_COLLECTION,
    REQUEST_COLLECTIONS_IN_LIBRARY,
    REQUEST_CREATE_COLLECTIONS,
    REQUEST_DELETE_COLLECTION,
    REQUEST_UPDATE_COLLECTION,
    BEGIN_FETCH_COLLECTIONS_SINCE,
	COMPLETE_FETCH_COLLECTIONS_SINCE,
	PRE_UPDATE_COLLECTIONS_TRASH,
	REQUEST_UPDATE_COLLECTIONS_TRASH,
	RECEIVE_UPDATE_COLLECTIONS_TRASH,
	ERROR_UPDATE_COLLECTIONS_TRASH,
	PRE_DELETE_COLLECTIONS,
	REQUEST_DELETE_COLLECTIONS,
	RECEIVE_DELETE_COLLECTIONS,
	ERROR_DELETE_COLLECTIONS,
} from '../constants/actions';

import { requestTracker, requestWithBackoff } from '.';
import { cede, get } from '../utils';
import { chunkedAction } from '../common/actions';
import { makeChildMap, getDescendants } from '../common/collection';

const rescheduleBadRequests = (badRequestsArray, allRequestsArray, dispatch, libraryKey, args) => {
	let hasScheduledNewRequest = false;
	if(badRequestsArray && badRequestsArray.length) {
		badRequestsArray.forEach(requestId => {
			if(!(requestId in allRequestsArray) || allRequestsArray[requestId].rescheduled) {
				return;
			}
			const { start, limit } = allRequestsArray[requestId];
			const nextId = requestTracker.id++;
			allRequestsArray[nextId] = {
				start, limit,
				promise: dispatch(fetchCollections(libraryKey, { start, limit, ...args }, nextId))
			};
			allRequestsArray[requestId].rescheduled = true;
			hasScheduledNewRequest = true;
		});
	}
	return hasScheduledNewRequest;
}

const doResilientParallelisedCollectionsFetching = async (dispatch, getState, libraryKey, args) => {
	var totalResults;
	const limit = 100; // collections fetched per page

	// get the first page
	while(true) { // eslint-disable-line no-constant-condition
		await dispatch(fetchCollections(libraryKey, { start: 0, limit, ...args }));
		const updatedState = getState();
		const errorCount = get(updatedState, ['traffic', 'COLLECTIONS_IN_LIBRARY', 'errorCount'], 0);
		if('since' in args) {
			totalResults = get(updatedState, ['libraries', libraryKey, 'collections', 'remoteChangesTracker', args.since], null);
		} else {
			totalResults = get(updatedState, ['libraries', libraryKey, 'collections', 'totalResults'], null);
		}

		if(errorCount === 0) {
			break;
		} else {
			await cede(1000);
		}
	}

	// got first page, prepare requests for all subsequent pages
	const remainingCount = Math.max(totalResults - limit, 0);
	const remainingRequestsNumber = Math.ceil(remainingCount / limit);

	var requests = {};

	for(let i = 0; i < remainingRequestsNumber; i++) {
		const start = limit + (i * limit);
		const nextId = requestTracker.id++;
		requests[nextId] = {
			start, limit,
			promise: dispatch(fetchCollections(libraryKey, { start, limit, ...args }, nextId))
		};
	}

	// subsequent pages are requested in parallel. Any request dropped or errored is re-requested
	// this will respect request schedule (see request.js) but it will never give up.
	while(remainingRequestsNumber > 0) { // eslint-disable-line no-constant-condition
		const promises = Object.values(requests).map(r => r.promise);
		await Promise.allSettled(promises);
		const errored = get(getState(), ['traffic', 'COLLECTIONS_IN_LIBRARY', 'errored'], null);
		const dropped = get(getState(), ['traffic', 'COLLECTIONS_IN_LIBRARY', 'dropped'], null);

		let hasScheduledNewRequest = false;

		hasScheduledNewRequest = hasScheduledNewRequest || rescheduleBadRequests(errored, requests, dispatch, libraryKey, args);
		hasScheduledNewRequest = hasScheduledNewRequest || rescheduleBadRequests(dropped, requests, dispatch, libraryKey, args);

		const ongoing = get(getState(), ['traffic', 'COLLECTIONS_IN_LIBRARY', 'ongoing'], null);

		if(!hasScheduledNewRequest && ongoing.length === 0) {
			break;
		}

		// Promises might have settled but requests can still be ongoing so this is effectively
		// polling now. Only happens if at least one request failed.
		await cede(1000);
	}
}

const fetchCollections = (libraryKey, { start = 0, limit = 50, sort = 'dateModified', direction = "desc", ...rest } = {}, requestId = null) => {
	return async (dispatch, getState) => {
		const type = 'COLLECTIONS_IN_LIBRARY';
		const id = requestId || requestTracker.id++;
		const { config } = getState();

		dispatch({
			id,
			type: REQUEST_COLLECTIONS_IN_LIBRARY,
			libraryKey,
			start,
			limit,
			sort,
			direction,
			...rest
		});

		const makeRequest = async () => {
			const response = await api(config.apiKey, config.apiConfig)
				.library(libraryKey)
				.collections()
				.get({ start, limit, sort, direction, ...rest });
			const collections = response.getData();
			const totalResults = parseInt(response.response.headers.get('Total-Results'), 10);
			return { collections, response, totalResults };
		}

		const payload = {
			libraryKey, start, limit, sort, direction, ...rest
		};
		return dispatch(requestWithBackoff(makeRequest, { id, type, payload }));
	};
};

const fetchAllCollections = (libraryKey, { sort = 'dateModified', direction = "desc", shouldAlwaysFetch = false } = {}) => {
	return async (dispatch, getState) => {
		const state = getState();
		const expectedCount = get(state, ['libraries', libraryKey, 'collections', 'totalResults'], null);
		const isKnown = expectedCount !== null;
		const collectionKeys = state.libraries[libraryKey]?.collections?.keys ?? [];
		const isFetchingAll = get(state, ['libraries', libraryKey, 'collections', 'isFetchingAll'], null);
		const actualCount = Object.keys(collectionKeys).length;
		const isCountCorrect = expectedCount === actualCount

		if(isFetchingAll) {
			// skip fetching if already in progress
			return;
		}

		if(!shouldAlwaysFetch && isKnown && isCountCorrect) {
			// skip fetching if we already know these libraries
			return;
		}

		dispatch({
			type: BEGIN_FETCH_ALL_COLLECTIONS,
			libraryKey
		});

		await doResilientParallelisedCollectionsFetching(dispatch, getState, libraryKey, { sort, direction });

		dispatch({
			type: COMPLETE_FETCH_ALL_COLLECTIONS,
			libraryKey
		});
	}
}

const fetchAllCollectionsSince = (version, libraryKey) => {
	return async (dispatch, getState) => {

		dispatch({
			type: BEGIN_FETCH_COLLECTIONS_SINCE,
			libraryKey, since: version
		});

		await doResilientParallelisedCollectionsFetching(dispatch, getState, libraryKey, { since: version });

		dispatch({
			type: COMPLETE_FETCH_COLLECTIONS_SINCE,
			libraryKey, since: version
		});
	}
}

const createCollection = (properties, libraryKey) => {
	return async dispatch => {
		const collections = await dispatch(
			createCollections([properties], libraryKey)
		);
		return collections[0];
	}
}

const createCollections = (localCollections, libraryKey) => {
	return async (dispatch, getState) => {
		const state = getState();
		const config = state.config;

		dispatch({
			type: REQUEST_CREATE_COLLECTIONS,
			libraryKey,
			collections: localCollections
		});

		try {
			const response = await api(config.apiKey, config.apiConfig)
				.library(libraryKey)
				.collections()
				.post(localCollections);

			if(!response.isSuccess()) {
				throw response.getErrors();
			}

			const remoteCollections = response.getData();

			dispatch({
				type: RECEIVE_CREATE_COLLECTIONS,
				libraryKey,
				collections: remoteCollections,
				response
			});
			return remoteCollections;
		} catch(error) {
			dispatch({
					type: ERROR_CREATE_COLLECTIONS,
					error,
					libraryKey,
					collections: localCollections,
				});
			throw error;
		}
	};
}

const updateCollection = (collectionKey, patch, libraryKey) => {
	return async dispatch => {
		const queueId = requestTracker.id++;

		dispatch({
			type: PRE_UPDATE_COLLECTION,
			collectionKey,
			libraryKey,
			patch,
			queueId
		});

		dispatch(
			queueUpdateCollection(collectionKey, patch, libraryKey, queueId)
		);
	};
}

const queueUpdateCollection = (collectionKey, patch, libraryKey, queueId) => {
	return {
		queue: libraryKey,
		callback: async (next, dispatch, getState) => {
			const state = getState();
			const config = state.config;
			const collection = state.libraries[libraryKey]?.dataObjects[collectionKey];
			if (!collection) {
				throw new Error(`Collection ${collectionKey} not found in library ${libraryKey}`);
			}
			const version = collection.version;

			dispatch({
				type: REQUEST_UPDATE_COLLECTION,
				collectionKey,
				libraryKey,
				patch,
				queueId
			});

			try {
				const response = await api(config.apiKey, config.apiConfig)
					.library(libraryKey)
					.collections(collectionKey)
					.version(version)
					.patch(patch);

				const updatedCollection = {
					...collection,
					...response.getData()
				};

				dispatch({
					type: RECEIVE_UPDATE_COLLECTION,
					collection: updatedCollection,
					collectionKey,
					libraryKey,
					patch,
					queueId,
					response
				});

				return updateCollection;
			} catch(error) {
				dispatch({
					type: ERROR_UPDATE_COLLECTION,
					error,
					collectionKey,
					libraryKey,
					patch,
					queueId
				});
				throw error;
			} finally {
				next();
			}
		}
	};
}

const deleteCollection = (collection, libraryKey) => {
	return async (dispatch, getState) => {
		const config = getState().config;

		dispatch({
			type: REQUEST_DELETE_COLLECTION,
			libraryKey,
			collection
		});

		try {
			let response = await api(config.apiKey, config.apiConfig)
				.library(libraryKey)
				.collections(collection.key)
				.version(collection.version)
				.delete();

			dispatch({
				type: RECEIVE_DELETE_COLLECTION,
				libraryKey,
				collection,
				response
			});
		} catch(error) {
			dispatch({
					type: ERROR_DELETE_COLLECTION,
					error,
					libraryKey,
					collection,
				});
			throw error;
		}
	};
}

const deleteCollections = (collectionKeys, libraryKey, recursively = true) => {
	return async (dispatch, getState) => {
		const id = requestTracker.id++;
		const state = getState();
		const collections = state.libraries[libraryKey].collections.keys.map(key => state.libraries[libraryKey].dataObjects[key]);

		if (recursively) {
			// at this point child map should be memoized
			const childMap = makeChildMap(collections);
			const childKeys = [];
			for(const key of collectionKeys) {
				childKeys.push(...getDescendants(key, childMap));
			}
			collectionKeys.push(...childKeys);
		}

		dispatch({
			type: PRE_DELETE_COLLECTIONS,
			collectionKeys,
			libraryKey,
			id
		});

		const promise = new Promise((resolve, reject) => {
			dispatch(
				queueDeleteCollections(collectionKeys, libraryKey, id, resolve, reject)
			);
		});
		return promise;
	};
}

const chunkedDeleteCollections = (...args) => chunkedAction(deleteCollections, ...args);

const queueDeleteCollections = (collectionKeys, libraryKey, id, resolve, reject) => {
	return {
		queue: libraryKey,
		callback: async (next, dispatch, getState) => {
			const config = getState().config;

			dispatch({
				type: REQUEST_DELETE_COLLECTIONS,
				libraryKey,
				collectionKeys,
				id
			});

			try {
				let response = await api(config.apiKey, config.apiConfig)
					.library(libraryKey)
					.collections()
					.delete(collectionKeys);

				dispatch({
					type: RECEIVE_DELETE_COLLECTIONS,
					libraryKey,
					collectionKeys,
					response,
					id
				});
				resolve(response);
			} catch(error) {
				dispatch({
						type: ERROR_DELETE_COLLECTIONS,
						error,
						libraryKey,
						collectionKeys,
						id
					});
				reject(error);
			} finally {
				next();
			}
		}
	};
}

const updateCollectionsTrash = (collectionKeys, libraryKey, deleted, recursively = true) => {
	return async (dispatch, useState) => {
		const id = requestTracker.id++;
		const state = useState();
		const collections = state.libraries[libraryKey].collections.keys.map(key => state.libraries[libraryKey].dataObjects[key]);

		if (deleted !== 0 && deleted !== 1) {
			throw new Error('deleted must be 0 or 1');
		}

		if (recursively) {
			// at this point child map should be memoized
			const childMap = makeChildMap(collections);
			const childKeys = [];
			for (const key of collectionKeys) {
				childKeys.push(...getDescendants(key, childMap));
			}
			collectionKeys.push(...childKeys);
		}

		dispatch({
			type: PRE_UPDATE_COLLECTIONS_TRASH,
			collectionKeys,
			libraryKey,
			deleted,
			id
		});

		dispatch(
			queueUpdateCollectionsTrash(collectionKeys, libraryKey, deleted, id)
		);
	};
}

const chunkedUpdateCollectionsTrash = (...args) => chunkedAction(updateCollectionsTrash, ...args);

const queueUpdateCollectionsTrash = (collectionKeys, libraryKey, deleted, id) => {
	return {
		queue: libraryKey,
		callback: async (next, dispatch, getState) => {
			const state = getState();
			const config = state.config;
			const version = state.libraries[libraryKey].sync.version;

			dispatch({
				type: REQUEST_UPDATE_COLLECTIONS_TRASH,
				libraryKey,
				collectionKeys,
				deleted,
				id
			});

			try {
				let response = await api(config.apiKey, config.apiConfig)
					.library(libraryKey)
					.version(version)
					.collections()
					.post(collectionKeys.map(key => ({ key, deleted })));

				const updatedCollectionsKeys = [];
				const collections = [];

				collectionKeys.forEach((_, index) => {
					const updatedCollection = response.getEntityByIndex(index);
					collections.push(updatedCollection);
					updatedCollectionsKeys.push(updatedCollection.key);
				});

				dispatch({
					type: RECEIVE_UPDATE_COLLECTIONS_TRASH,
					libraryKey,
					collections,
					collectionKeys: updatedCollectionsKeys,
					deleted,
					response,
					id
				});
			} catch(error) {
				dispatch({
						type: ERROR_UPDATE_COLLECTIONS_TRASH,
						error,
						libraryKey,
						collectionKeys,
						deleted,
						id
					});
				throw error;
			} finally {
				next();
			}
		}
	}
}

export {
    chunkedUpdateCollectionsTrash,
    createCollection,
    createCollections,
    deleteCollection,
    deleteCollections,
    fetchAllCollections,
    fetchAllCollectionsSince,
    fetchCollections,
    queueUpdateCollection,
    updateCollection,
    updateCollectionsTrash,
	chunkedDeleteCollections
};
