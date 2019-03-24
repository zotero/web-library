'use strict';

import api from 'zotero-api-client';
import { get } from '../utils';

import {
    REQUEST_TAGS_IN_COLLECTION,
    RECEIVE_TAGS_IN_COLLECTION,
    ERROR_TAGS_IN_COLLECTION,
    REQUEST_TAGS_IN_LIBRARY,
    RECEIVE_TAGS_IN_LIBRARY,
    ERROR_TAGS_IN_LIBRARY,
    REQUEST_TAGS_FOR_ITEM,
    RECEIVE_TAGS_FOR_ITEM,
    ERROR_TAGS_FOR_ITEM,
} from '../constants/actions';

const fetchTagsInCollection = (collectionKey, { start = 0, limit = 50, sort = 'title', direction = "asc" } = {}) => {
	return async (dispatch, getState) => {
		const state = getState();
		const config = state.config;
		const { libraryKey } = state.current;
		const totalTagsCount = get(state, ['libraries', libraryKey, 'tagsCountByCollection', collectionKey]);
		const knownTags = get(state, ['libraries', libraryKey, 'tagsByCollection', collectionKey], []);

		if(knownTags.length === totalTagsCount) {
			return knownTags.map(key => get(state, ['libraries', libraryKey, 'tags', key]))
		}

		dispatch({
			type: REQUEST_TAGS_IN_COLLECTION,
			libraryKey,
			start,
			limit,
			sort,
			direction,
			collectionKey
		});

		try {
			const response = await api(config.apiKey, config.apiConfig)
				.library(libraryKey)
				.collections(collectionKey)
				.tags()
				.get({ start, limit, sort, direction });

			const tags = response.getData().map((tagData, index) => ({
				tag: tagData.tag,
				[Symbol.for('meta')]: response.getMeta()[index] || {}
			}));

			dispatch({
				type: RECEIVE_TAGS_IN_COLLECTION,
				libraryKey,
				collectionKey,
				tags,
				response,
				start,
				limit,
			});

			return tags;
		} catch(error) {
			dispatch({
				type: ERROR_TAGS_IN_COLLECTION,
				libraryKey,
				collectionKey,
				error,
				start,
				limit,
			});

			throw error;
		}
	};
};

const fetchTagsInLibrary = ({ start = 0, limit = 50, sort = 'title', direction = "asc" } = {}) => {
	return async (dispatch, getState) => {
		const state = getState();
		const config = state.config;
		const { libraryKey } = state.current;
		const totalTagsCount = state.tagsCountByLibrary;
		const knownTags = get(state, ['tagsByLibrary', libraryKey], []);

		if(knownTags.length === totalTagsCount) {
			return knownTags.map(key => get(state, ['libraries', libraryKey, 'tags', key]))
		}

		dispatch({
			type: REQUEST_TAGS_IN_LIBRARY,
			libraryKey,
			start,
			limit,
			sort,
			direction,
		});

		try {
			const response = await api(config.apiKey, config.apiConfig)
				.library(libraryKey)
				.tags()
				.get({ start, limit, sort, direction });

			const tags = response.getData().map((tagData, index) => ({
				tag: tagData.tag,
				[Symbol.for('meta')]: response.getMeta()[index] || {}
			}));

			dispatch({
				type: RECEIVE_TAGS_IN_LIBRARY,
				libraryKey,
				tags,
				response,
				start, limit, sort, direction
			});

			return tags;
		} catch(error) {
			dispatch({
				type: ERROR_TAGS_IN_LIBRARY,
				libraryKey,
				error,
				start, limit, sort, direction
			});

			throw error;
		}
	};
};

const fetchTagsForItem = (itemKey, { start = 0, limit = 50, sort = 'title', direction = "asc" } = {}) => {
	return async (dispatch, getState) => {
		const state = getState();
		const config = state.config;
		const { libraryKey } = state.current;
		const totalTagsCount = get(state, ['libraries', libraryKey, 'tagsCountByItem', itemKey]);
		const knownTags = get(state, ['libraries', libraryKey, 'tagsByItem', itemKey], []);

		if(knownTags.length === totalTagsCount) {
			return knownTags.map(key => get(state, ['libraries', libraryKey, 'tags', key]))
		}

		dispatch({
			type: REQUEST_TAGS_FOR_ITEM,
			libraryKey,
			itemKey,
			start,
			limit,
			sort,
			direction,

		});

		try {
			const response = await api(config.apiKey, config.apiConfig)
				.library(libraryKey)
				.items(itemKey)
				.tags()
				.get({ start, limit, sort, direction });

			const tags = response.getData().map((tagData, index) => ({
				tag: tagData.tag,
				[Symbol.for('meta')]: response.getMeta()[index] || {}
			}));

			dispatch({
				type: RECEIVE_TAGS_FOR_ITEM,
				libraryKey,
				itemKey,
				tags,
				response,
				start,
				limit,
			});

			return tags;
		} catch(error) {
			dispatch({
				type: ERROR_TAGS_FOR_ITEM,
				libraryKey,
				itemKey,
				error,
				start,
				limit,
			});

			throw error;
		}
	};
};

export {
	fetchTagsInCollection,
	fetchTagsInLibrary,
	fetchTagsForItem,
};
