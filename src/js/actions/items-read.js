'use strict';

const { SORT_ITEMS } = require('../constants/actions');
const api = require('zotero-api-client')().api;
const { extractItems } = require('../common/actions');

const getApi = ({ config, libraryKey }, requestType, queryConfig) => {
	switch(requestType) {
		case 'ITEMS_IN_COLLECTION':
			return api(config.apiKey, config.apiConfig)
				.library(libraryKey)
				.collections(queryConfig.collectionKey)
				.items()
				.top();
		case 'CHILD_ITEMS':
			return api(config.apiKey, config.apiConfig)
				.library(libraryKey)
				.items(queryConfig.itemKey)
				.children();
		case 'TRASH_ITEMS':
			return api(config.apiKey, config.apiConfig)
				.library(libraryKey)
				.items()
				.trash()
		case 'PUBLICATIONS_ITEMS':
			return api(config.apiKey, config.apiConfig)
				.library(libraryKey)
				.items()
				.publications()
		case 'ITEMS_BY_QUERY':
			var configuredApi = api(config.apiKey, config.apiConfig)
				.library(libraryKey)
				.items()
				.top();
			if(queryConfig.collectionKey) {
				configuredApi.collections(queryConfig.collectionKey)
			}
			return configuredApi;
		case 'FETCH_ITEMS':
		case 'TOP_ITEMS':
			return api(config.apiKey, config.apiConfig)
				.library(libraryKey)
				.items()
				.top();
	}
}

const fetchItems = (
	type,
	queryConfig,
	queryOptions = {}
) => {
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
			const items = extractItems(response, state);
			const length = parseInt(response.response.headers.get('Total-Results'), 10);

			dispatch({
				type: `RECEIVE_${type}`,
				libraryKey, items, response, length,
				...queryConfig, ...queryOptions
			});

			return items;
		} catch(error) {
			dispatch({
				type: `ERROR_${type}`,
				libraryKey, error, ...queryConfig, ...queryOptions
			});

			throw error;
		}
	}
}

const fetchTopItems = queryOptions => {
	return fetchItems('TOP_ITEMS', {}, queryOptions);
}

const fetchTrashItems = queryOptions => {
	return fetchItems('TRASH_ITEMS', {}, queryOptions);
}

const fetchPublicationsItems = queryOptions => {
	return fetchItems('PUBLICATIONS_ITEMS', {}, queryOptions);
}

const fetchItemsInCollection = (collectionKey, queryOptions) => {
	return fetchItems('ITEMS_IN_COLLECTION', { collectionKey }, queryOptions);
}

const fetchItemsQuery = (query, queryOptions) => {
	const { collection = null, tag = null, q = null } = query;
	const queryConfig = {};
	if(collection) { queryConfig.collectionKey = collection; }
	return fetchItems(
		'ITEMS_BY_QUERY', queryConfig, { ...queryOptions, tag, q}
	);
}

const fetchChildItems = (itemKey, queryOptions) => {
	return fetchItems('CHILD_ITEMS', { itemKey }, queryOptions);
}

const fetchItemsByKeys = (itemKeys, queryOptions) => {
	return fetchItems(
		'FETCH_ITEMS', {}, { queryOptions, itemKeys: itemKeys.join(','), }
	);
}

const sortItems = (sortBy, sortDirection) => {
	return {
		type: SORT_ITEMS,
		sortBy,
		sortDirection
	};
};

module.exports = {
	fetchChildItems,
	fetchItemsByKeys,
	fetchItemsInCollection,
	fetchItemsQuery,
	fetchPublicationsItems,
	fetchTopItems,
	fetchTrashItems,
	sortItems,
};
