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
} from '../constants/actions';

import { requestTracker, requestWithBackoff } from '.';
import { cede, get } from '../utils';

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
			return { collections, response };
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
		const collections = get(state, ['libraries', libraryKey, 'collections', 'data'], {});
		const isFetchingAll = get(state, ['libraries', libraryKey, 'collections', 'isFetchingAll'], null);
		const actualCount = Object.keys(collections).length;
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

		var totalResults;
		const limit = 100; // collections fetched per page

		// ensure that we get the first page
		while(true) { // eslint-disable-line no-constant-condition
			await dispatch(fetchCollections(libraryKey, { start: 0, limit, sort, direction }));
			const updatedState = getState();
			const errorCount = get(updatedState, ['traffic', 'COLLECTIONS_IN_LIBRARY', 'errorCount'], 0);
			totalResults = get(updatedState, ['libraries', libraryKey, 'collections', 'totalResults'], null);

			if(errorCount === 0) {
				break;
			} else {
				await cede(1000);
			}
		}

		// got first page, prepare requests for all subsequent pages
		const remainingCount = totalResults - limit;
		const remainingRequestsNumber = Math.ceil(remainingCount / limit);

		var requests = {};

		for(let i = 0; i < remainingRequestsNumber; i++) {
			const start = limit + (i * limit);
			const nextId = requestTracker.id++;
			requests[nextId] = {
				start, limit,
				promise: dispatch(fetchCollections(libraryKey, { start, limit, sort, direction }, nextId))
			};
		}

		while(true) { // eslint-disable-line no-constant-condition
			const promises = Object.values(requests).map(r => r.promise);
			console.log(`Fetching all collections: fired ${promises.length} requests so far`);
			await Promise.allSettled(promises);
			const errored = get(getState(), ['traffic', 'COLLECTIONS_IN_LIBRARY', 'errored'], null);
			const dropped = get(getState(), ['traffic', 'COLLECTIONS_IN_LIBRARY', 'dropped'], null);

			let hasScheduledNewRequest = false;

			if(errored && errored.length) {
				errored.forEach(requestId => {
					if(!(requestId in requests) || requests[requestId].rescheduled) {
						return;
					}
					const { start, limit } = requests[requestId];
					const nextId = requestTracker.id++;
					requests[nextId] = {
						start, limit,
						promise: dispatch(fetchCollections(libraryKey, { start, limit, sort, direction }, nextId))
					};
					requests[requestId].rescheduled = true;
					hasScheduledNewRequest = true;
					console.log(`rescheduled ${requestId} as ${nextId} due to an ERROR`);
				});
			}

			if(dropped && dropped.length) {
				dropped.forEach(requestId => {
					if(!(requestId in requests) || requests[requestId].rescheduled) {
						return;
					}
					const { start, limit } = requests[requestId];
					const nextId = requestTracker.id++;
					requests[nextId] = {
						start, limit,
						promise: dispatch(fetchCollections(libraryKey, { start, limit, sort, direction }, nextId))
					};
					requests[requestId].rescheduled = true;
					hasScheduledNewRequest = true;
					console.log(`rescheduled ${requestId} as ${nextId} due to an DROP`);
				});
			}

			const ongoing = get(getState(), ['traffic', 'COLLECTIONS_IN_LIBRARY', 'ongoing'], null);

			if(!hasScheduledNewRequest && ongoing.length === 0) {
				break;
			}

			// Promises might have settled but requests can still be ongoing so this is effectively
			// polling now. Only happens if at least one request failed.
			await cede(1000);
		}

		dispatch({
			type: COMPLETE_FETCH_ALL_COLLECTIONS,
			libraryKey
		});
	}
}

const fetchAllCollectionsSince = (version, libraryKey) => {
	return async dispatch => {
		var pointer = 0;
		const limit = 100;
		var hasMore = false;

		do {
			await dispatch(fetchCollections(libraryKey, { start: pointer, limit, since: version }));
			const totalResults = get(getState(), ['libraries', libraryKey, 'collections', 'totalResults'], null);
			hasMore = totalResults > pointer + limit;
			pointer += limit;
		} while(hasMore === true)
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
			const collection = get(state, ['libraries', libraryKey, 'collections', 'data', collectionKey]);
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

export {
	createCollection,
	createCollections,
	deleteCollection,
	fetchAllCollections,
	fetchAllCollectionsSince,
	fetchCollections,
	queueUpdateCollection,
	updateCollection,
};
