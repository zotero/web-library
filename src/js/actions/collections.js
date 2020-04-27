'use strict';

import api from 'zotero-api-client';

import {
    REQUEST_COLLECTIONS_IN_LIBRARY,
    RECEIVE_COLLECTIONS_IN_LIBRARY,
    ERROR_COLLECTIONS_IN_LIBRARY,
    REQUEST_CREATE_COLLECTIONS,
    RECEIVE_CREATE_COLLECTIONS,
    ERROR_CREATE_COLLECTIONS,
    PRE_UPDATE_COLLECTION,
    REQUEST_UPDATE_COLLECTION,
    RECEIVE_UPDATE_COLLECTION,
    ERROR_UPDATE_COLLECTION,
    REQUEST_DELETE_COLLECTION,
    RECEIVE_DELETE_COLLECTION,
    ERROR_DELETE_COLLECTION,
} from '../constants/actions';

import queue from './queue';
import { get } from '../utils';

const fetchCollections = (libraryKey, { start = 0, limit = 50, sort = 'dateModified', direction = "desc", ...rest } = {}) => {
	return async (dispatch, getState) => {
		dispatch({
			type: REQUEST_COLLECTIONS_IN_LIBRARY,
			libraryKey,
			start,
			limit,
			sort,
			direction,
			...rest
		});
		try {
			const { config } = getState();
			const response = await api(config.apiKey, config.apiConfig)
				.library(libraryKey)
				.collections()
				.get({ start, limit, sort, direction, ...rest });
			const collections = response.getData();

			dispatch({
				type: RECEIVE_COLLECTIONS_IN_LIBRARY,
				libraryKey,
				collections,
				response,
				start,
				limit,
				sort,
				direction,
				...rest
			});
			return { collections, response };
		} catch(error) {
			dispatch({
				type: ERROR_COLLECTIONS_IN_LIBRARY,
				libraryKey,
				error
			});
			throw error;
		}
	};
};

const fetchAllCollections = (libraryKey, { sort = 'dateModified', direction = "desc", shouldAlwaysFetch = false } = {}) => {
	return async (dispatch, getState) => {
		const state = getState();
		const isKnown = libraryKey in state.collectionCountByLibrary;
		const expectedCount = state.collectionCountByLibrary[libraryKey];
		const collections = get(state, ['libraries', libraryKey, 'collections'], {});
		const actualCount = Object.keys(collections).length;
		const isCountCorrect = expectedCount === actualCount

		if(!shouldAlwaysFetch && isKnown && isCountCorrect) {
			// skip fetching if we already know these libraries
			return;
		}

		var pointer = 0;
		const limit = 100;
		var hasMore = false;

		do {
			const { response } = await dispatch(fetchCollections(libraryKey, { start: pointer, limit, sort, direction }));
			const totalResults = parseInt(response.response.headers.get('Total-Results'), 10);
			hasMore = totalResults > pointer + limit;
			pointer += limit;
		} while(hasMore === true)
	}
}

const fetchAllCollectionsSince = (version, libraryKey) => {
	return async dispatch => {
		var pointer = 0;
		const limit = 100;
		var hasMore = false;

		do {
			const { response } = await dispatch(fetchCollections(libraryKey, { start: pointer, limit, since: version }));
			const totalResults = parseInt(response.response.headers.get('Total-Results'), 10);
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
		const queueId = ++queue.counter;

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
			const collection = get(state, ['libraries', libraryKey, 'collections', collectionKey]);
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
