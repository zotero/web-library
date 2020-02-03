'use strict';

import { SORT_ITEMS, REQUEST_ATTACHMENT_URL, RECEIVE_ATTACHMENT_URL, ERROR_ATTACHMENT_URL } from '../constants/actions';
import api from 'zotero-api-client';
import { extractItems } from '../common/actions';
import { mapRelationsToItemKeys } from '../utils';
import columnProperties from '../constants/column-properties';

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
			if(queryConfig.collectionKey) {
				configuredApi = configuredApi.collections(queryConfig.collectionKey).top()
			} else if(queryConfig.isMyPublications) {
				configuredApi = configuredApi.publications();
			} else if(queryConfig.isTrash) {
				configuredApi = configuredApi.trash();
			} else {
				configuredApi = configuredApi.top();
			}
			return configuredApi;
		case 'TOP_ITEMS':
			return api(config.apiKey, config.apiConfig)
				.library(libraryKey)
				.items()
				.top();
		case 'FETCH_ITEMS':
		case 'RELATED_ITEMS':
			return api(config.apiKey, config.apiConfig)
				.library(libraryKey)
				.items()
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
			libraryKey, ...queryConfig, queryOptions
		});

		try {
			const response = await api.get(queryOptions);
			const items = extractItems(response, state);
			const totalResults = parseInt(response.response.headers.get('Total-Results'), 10);

			dispatch({
				type: `RECEIVE_${type}`,
				libraryKey, items, response, totalResults,
				...queryConfig, queryOptions
			});

			return items;
		} catch(error) {
			dispatch({
				type: `ERROR_${type}`,
				libraryKey, error, ...queryConfig, queryOptions
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
	const { collectionKey = null, tag = null, q = null, qmode = null, isTrash,
		isMyPublications } = query;
	const queryConfig = { collectionKey, isTrash, isMyPublications };
	return fetchItems(
		'ITEMS_BY_QUERY', queryConfig, { ...queryOptions, tag, q, qmode }
	);
}

const fetchChildItems = (itemKey, queryOptions) => {
	return fetchItems('CHILD_ITEMS', { itemKey }, queryOptions);
}

const fetchItemsByKeys = (itemKeys, queryOptions) => {
	return fetchItems(
		'FETCH_ITEMS', {}, { ...queryOptions, itemKey: itemKeys.join(','), }
	);
}

const fetchRelatedItems = (itemKey, queryOptions) => {
	return async (dispatch, getState) => {
		const state = getState();
		const { libraryKey } = state.current;
		const item = state.libraries[libraryKey].items[itemKey];
		const userId = state.config.userId;

		if(!item) {
			dispatch({
				type: 'ERROR_RELATED_ITEMS',
				error: `Item ${itemKey} is not found in local state`,
			});
			throw new Error(`Item ${itemKey} is not found in local state`);
		}

		const relatedItemsKeys = mapRelationsToItemKeys(item.relations || {}, userId);

		if(relatedItemsKeys.length === 0) {
			dispatch({
				type: 'REQUEST_RELATED_ITEMS', itemKey, libraryKey,...queryOptions
			});
			dispatch({
				type: 'RECEIVE_RELATED_ITEMS', itemKey, libraryKey,...queryOptions, items: []
			});
			return [];
		}

		dispatch(fetchItems(
			'RELATED_ITEMS', { itemKey }, { ...queryOptions, itemKey: relatedItemsKeys.join(',') }
		));
	}
}

const sortItems = (sortBy, sortDirection) => {
	return (dispatch, getState) => {
		const state = getState();
		const { libraryKey } = state.current;
		dispatch({
			type: SORT_ITEMS,
			sortBy,
			sortDirection,
			libraryKey,
			items: state.libraries[libraryKey].items
		});
	}
};

const getAttachmentUrl = itemKey => {
	return async (dispatch, getState) => {
		const state = getState();
		const { libraryKey } = state.current;

		dispatch({
			type: REQUEST_ATTACHMENT_URL,
			libraryKey,
			itemKey
		});

		try {
			const response = await api(state.config.apiKey, state.config.apiConfig)
				.library(libraryKey)
				.items(itemKey)
				.attachmentUrl()
				.get();

			const url = response.getData();

			dispatch({
				type: RECEIVE_ATTACHMENT_URL,
				libraryKey,
				itemKey,
				url
			});

			return url;
		} catch(error) {
			dispatch({
				type: ERROR_ATTACHMENT_URL,
				libraryKey, itemKey, error,
			});

			throw error;
		}
	}
}

const PAGE_SIZE = 100;
const fetchSource = (startIndex, stopIndex) => {
	let start = startIndex;
	let limit = (stopIndex - startIndex) + 1;
	// when filling in holes, fetch PAGE_SIZE around it. Fixes rare
	// cases where our sorting doesn't match api sorting and we miss
	// the item that was just created.
	if(limit === 1) {
		start = Math.max(0, start - PAGE_SIZE / 2);
		limit = PAGE_SIZE;
	}

	return async (dispatch, getState) => {
		const state = getState();
		const { collectionKey, isTrash, isMyPublications, itemsSource, search: q, qmode,
			tags: tag = [] } = state.current;
		const { field: sortBy, sort: sortDirection } = state.preferences.columns.find(
			column => 'sort' in column) || { field: 'title', sort: 'asc' };

		const direction = sortDirection.toLowerCase();
		const sort = (sortBy in columnProperties && columnProperties[sortBy].sortKey) || 'title';
		const sortAndDirection = { start, limit, sort, direction };

		switch(itemsSource) {
			case 'query':
				return await dispatch(fetchItemsQuery({ collectionKey, isMyPublications,
					isTrash, q, tag, qmode }, sortAndDirection));
			case 'top':
				return await dispatch(fetchTopItems(sortAndDirection));
			case 'trash':
				return await dispatch(fetchTrashItems(sortAndDirection));
			case 'publications':
				return await dispatch(fetchPublicationsItems(sortAndDirection));
			case 'collection':
				return await dispatch(fetchItemsInCollection(collectionKey, sortAndDirection));
		}
	}
}

export {
	fetchChildItems,
	fetchItemsByKeys,
	fetchItemsInCollection,
	fetchItemsQuery,
	fetchPublicationsItems,
	fetchRelatedItems,
	fetchSource,
	fetchTopItems,
	fetchTrashItems,
	getAttachmentUrl,
	sortItems,
};
