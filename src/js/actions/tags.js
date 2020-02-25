'use strict';

import api from 'zotero-api-client';
import { FILTER_TAGS } from '../constants/actions';

const getApi = ({ config, libraryKey }, requestType, queryConfig) => {
	switch(requestType) {
		case 'COLORED_TAGS_IN_COLLECTION':
		case 'TAGS_IN_COLLECTION':
			return api(config.apiKey, config.apiConfig)
				.library(libraryKey)
				.collections(queryConfig.collectionKey)
				.items()
				.top()
				.tags();
		case 'COLORED_TAGS_IN_TRASH_ITEMS':
		case 'TAGS_IN_TRASH_ITEMS':
			return api(config.apiKey, config.apiConfig)
				.library(libraryKey)
				.items()
				.trash()
				.tags()
		case 'COLORED_TAGS_IN_PUBLICATIONS_ITEMS':
		case 'TAGS_IN_PUBLICATIONS_ITEMS':
			return api(config.apiKey, config.apiConfig)
				.library(libraryKey)
				.items()
				.publications()
				.tags()
		case 'COLORED_TAGS_IN_ITEMS_BY_QUERY':
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
		case 'COLORED_TAGS_IN_TOP_ITEMS':
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

const fetchTagsBase = (type, queryConfig, queryOptions = {}) => {
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
			const tags = response.getData().map((tagData, index) => ({
				tag: tagData.tag,
				type: response.getMeta()[index]['type']
			}));
			const totalResults = parseInt(response.response.headers.get('Total-Results'), 10);

			dispatch({
				type: `RECEIVE_${type}`,
				libraryKey, tags, response, totalResults,
				...queryConfig, queryOptions
			});

			return tags;
		} catch(error) {
			dispatch({
				type: `ERROR_${type}`,
				libraryKey, error, ...queryConfig, queryOptions
			});

			throw error;
		}
	}
}

const fetchTagsInCollection = (collectionKey, queryOptions, prefix = 'TAGS') => {
	return fetchTagsBase(`${prefix}_IN_COLLECTION`, { collectionKey }, queryOptions);
};

const fetchTagsInLibrary = (queryOptions, prefix = 'TAGS') => {
	return fetchTagsBase(`${prefix}_IN_LIBRARY`, { }, queryOptions);
};

// const fetchTagsForItem = (itemKey, queryOptions, prefix = 'TAGS') => {
// 	return fetchTagsBase(`${prefix}_FOR_ITEM`, { itemKey }, queryOptions);
// };

const fetchTagsForTrashItems = (queryOptions, prefix = 'TAGS') => {
	return fetchTagsBase(`${prefix}_IN_TRASH_ITEMS`, {}, queryOptions);
};

const fetchTagsForPublicationsItems = (queryOptions, prefix = 'TAGS') => {
	return fetchTagsBase(`${prefix}_IN_PUBLICATIONS_ITEMS`, {}, queryOptions);
};

const fetchTagsForTopItems = (queryOptions, prefix = 'TAGS') => {
	return fetchTagsBase(`${prefix}_IN_TOP_ITEMS`, { }, queryOptions);
};

const fetchTagsForItemsByQuery = (query, queryOptions, prefix = 'TAGS') => {
	const { collectionKey = null, itemTag = null, itemQ = null, itemQMode = null,
		isTrash, isMyPublications } = query;
	const queryConfig = { collectionKey, isTrash, isMyPublications };

	return fetchTagsBase(
		`${prefix}_IN_ITEMS_BY_QUERY`, queryConfig, {
			...queryOptions,
			itemTag: itemTag.map(t => encodeURIComponent(t)),
			itemQ: encodeURIComponent(itemQ),
			itemQMode
	});
}

const fetchCurrentTags = (queryOptions, prefix) => {
	return async (dispatch, getState) => {
		const state = getState();
		const { collectionKey, tags, itemsSource, search, isMyPublications,
			isTrash, qmode, } = state.current;

		switch(itemsSource) {
			case 'top':
				return await dispatch(fetchTagsForTopItems(queryOptions, prefix));
			case 'trash':
				return await dispatch(fetchTagsForTrashItems(queryOptions, prefix));
			case 'publications':
				return await dispatch(fetchTagsForPublicationsItems(queryOptions, prefix));
			case 'collection':
				return await dispatch(fetchTagsInCollection(collectionKey, queryOptions, prefix));
			case 'query':
				return await dispatch(fetchTagsForItemsByQuery({
					isTrash,
					isMyPublications,
					collectionKey,
					itemQ: search,
					itemQMode: qmode,
					itemTag: tags
				}, queryOptions, prefix));
		}
	}
}

const fetchTags = (startIndex, stopIndex, queryOptions = { }) => {
	const start = startIndex;
	const limit = (stopIndex - startIndex) + 1;

	return fetchCurrentTags({ sort: 'title',...queryOptions, start, limit }, 'TAGS');
}

const checkColoredTags = queryOptions => {
	return async (dispatch, getState) => {
		const state = getState();
		const { libraryKey } = state.current;
		const coloredTags = Object.keys(state.libraries[libraryKey].tagColors);
		if(coloredTags.length === 0) { return; }
		const tagQuery = coloredTags.join(' || ');
		return await dispatch(fetchCurrentTags({ ...queryOptions, tag: tagQuery }, 'COLORED_TAGS'));
	}
}

const fetchTagSuggestions = (searchString, queryOptions = {}) => {
	const { qmode = 'startswith', start = 0, limit = 10, sort = 'title', direction = 'asc' } = queryOptions;
	return async (_, getState) => {
		const state = getState();
		const config = state.config;
		const { libraryKey } = state.current;
		const q = searchString;

		const response = await api(config.apiKey, config.apiConfig)
			.library(libraryKey)
			.tags()
			.get({ direction, q, qmode, start, limit, sort });

		return response.getData();
	}
}

const filterTags = tagsSearchString => {
	return {
		type: FILTER_TAGS,
		tagsSearchString
	}
}

export {
	checkColoredTags,
	fetchTags,
	// fetchTagsForItem,
	fetchTagsForItemsByQuery,
	fetchTagsForPublicationsItems,
	fetchTagsForTopItems,
	fetchTagsForTrashItems,
	fetchTagsInCollection,
	fetchTagsInLibrary,
	fetchTagSuggestions,
	filterTags,
};
