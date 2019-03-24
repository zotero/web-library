'use strict';

import api from 'zotero-api-client';

import {
    REQUEST_COLLECTIONS_IN_LIBRARY,
    RECEIVE_COLLECTIONS_IN_LIBRARY,
    ERROR_COLLECTIONS_IN_LIBRARY,
    REQUEST_CREATE_COLLECTION,
    RECEIVE_CREATE_COLLECTION,
    ERROR_CREATE_COLLECTION,
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

const fetchCollections = (libraryKey, { start = 0, limit = 50, sort = 'dateModified', direction = "desc" } = {}) => {
	return async (dispatch, getState) => {
		dispatch({
			type: REQUEST_COLLECTIONS_IN_LIBRARY,
			libraryKey,
			start,
			limit,
			sort,
			direction,
		});
		try {
			const { config } = getState();
			const response = await api(config.apiKey, config.apiConfig)
				.library(libraryKey)
				.collections()
				.get({ start, limit, sort, direction });
			const collections = response.getData();

			dispatch({
				type: RECEIVE_COLLECTIONS_IN_LIBRARY,
				receivedAt: Date.now(),
				libraryKey,
				collections,
				response,
				start,
				limit,
				sort,
				direction,
			});
			return collections;
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


const createCollection = (properties, libraryKey) => {
	return async (dispatch, getState) => {
		const state = getState();
		const config = state.config;
		dispatch({
			type: REQUEST_CREATE_COLLECTION,
			libraryKey,
			properties
		});

		try {
			let response = await api(config.apiKey, config.apiConfig)
				.library(libraryKey)
				.collections()
				.post([properties]);

			if(!response.isSuccess()) {
				throw response.getErrors()[0];
			}

			const collection = {
				...response.getEntityByIndex(0)
			};

			dispatch({
				type: RECEIVE_CREATE_COLLECTION,
				libraryKey,
				collection,
				response
			});
			return response.getEntityByIndex(0);
		} catch(error) {
			dispatch({
					type: ERROR_CREATE_COLLECTION,
					error,
					libraryKey,
					properties,
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
	fetchCollections,
	createCollection,
	updateCollection,
	queueUpdateCollection,
	deleteCollection,
};
