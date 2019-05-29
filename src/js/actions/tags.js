'use strict';

import api from 'zotero-api-client';

const getApi = ({ config, libraryKey }, requestType, queryConfig) => {
	switch(requestType) {
		case 'TAGS_IN_COLLECTION':
			return api(config.apiKey, config.apiConfig)
				.library(libraryKey)
				.collections(queryConfig.collectionKey)
				.items()
				.top()
				.tags();
		case 'TAGS_IN_TRASH_ITEMS':
			return api(config.apiKey, config.apiConfig)
				.library(libraryKey)
				.items()
				.trash()
				.tags()
		case 'TAGS_IN_PUBLICATIONS_ITEMS':
			return api(config.apiKey, config.apiConfig)
				.library(libraryKey)
				.items()
				.publications()
				.tags()
		case 'TAGS_IN_ITEMS_BY_QUERY':
			var configuredApi = api(config.apiKey, config.apiConfig)
				.library(libraryKey)
				.items()
			if(queryConfig.collectionKey) {
				configuredApi = configuredApi.collections(queryConfig.collectionKey).top()
			} else if(queryConfig.isMyPublications) {
				configuredApi = configuredApi.publications();
			} else if(queryConfig.isTrash) {
				configuredApi = configuredApi.trash();
			} else {
				configuredApi = configuredApi.top();
			}
			return configuredApi.tags();
		case 'TAGS_FOR_ITEM':
			return api(config.apiKey, config.apiConfig)
				.library(libraryKey)
				.items(queryConfig.itemKey)
				.top()
				.tags();
		case 'TAGS_IN_TOP_ITEMS':
			return api(config.apiKey, config.apiConfig)
				.library(libraryKey)
				.items()
				.top()
				.tags();
		default:
		case 'TAGS_IN_LIBRARY':
			return api(config.apiKey, config.apiConfig)
				.library(libraryKey)
				.tags();
	}
}

const fetchTags = (type, queryConfig, queryOptions = {}) => {
	return async (dispatch, getState) => {
		const state = getState();
		const config = state.config;
		const { libraryKey } = state.current;
		const api = getApi({ config, libraryKey }, type, queryConfig);

		dispatch({
			type: `REQUEST_${type}`,
			libraryKey, ...queryConfig, ...queryOptions
		});

		try {
			const response = await api.get(queryOptions);
			const tags = response.getData().map((tagData, index) => ({
				tag: tagData.tag,
				[Symbol.for('meta')]: response.getMeta()[index] || {}
			}));
			const totalResults = parseInt(response.response.headers.get('Total-Results'), 10);

			dispatch({
				type: `RECEIVE_${type}`,
				libraryKey, tags, response, totalResults,
				...queryConfig,...queryOptions
			});

			return tags;
		} catch(error) {
			dispatch({
				type: `ERROR_${type}`,
				libraryKey, error, ...queryConfig, ...queryOptions
			});

			throw error;
		}
	}
}

const fetchTagsInCollection = (collectionKey, queryOptions) => {
	return fetchTags('TAGS_IN_COLLECTION', { collectionKey }, queryOptions);
};

const fetchTagsInLibrary = queryOptions => {
	return fetchTags('TAGS_IN_LIBRARY', { }, queryOptions);
};

const fetchTagsForItem = (itemKey, queryOptions) => {
	return fetchTags('TAGS_FOR_ITEM', { itemKey }, queryOptions);
};

const fetchTagsForTrashItems = queryOptions => {
	return fetchTags('TAGS_IN_TRASH_ITEMS', {}, queryOptions);
};

const fetchTagsForPublicationsItems = queryOptions => {
	return fetchTags('TAGS_IN_PUBLICATIONS_ITEMS', {}, queryOptions);
};

const fetchTagsForTopItems = queryOptions => {
	return fetchTags('TAGS_IN_TOP_ITEMS', { }, queryOptions);
};

const fetchTagsForItemsByQuery = (query, queryOptions) => {
	const { collectionKey = null, itemTag = null, itemQ = null, itemQMode = null,
		isTrash, isMyPublications } = query;
	const queryConfig = { collectionKey, isTrash, isMyPublications };

	return fetchTags(
		'TAGS_IN_ITEMS_BY_QUERY', queryConfig, { ...queryOptions, itemTag, itemQ, itemQMode }
	);
}

export {
	fetchTagsForItem,
	fetchTagsForItemsByQuery,
	fetchTagsForPublicationsItems,
	fetchTagsForTopItems,
	fetchTagsForTrashItems,
	fetchTagsInCollection,
	fetchTagsInLibrary,
};
