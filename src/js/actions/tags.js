import api from 'zotero-api-client';
import { REQUEST_DELETE_TAGS, RECEIVE_DELETE_TAGS,  ERROR_DELETE_TAGS, FILTER_TAGS } from '../constants/actions';
import { MANAGE_TAGS } from '../constants/modals';
import { requestWithBackoff, updateLibrarySettings } from '.';

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

		const makeRequest = async () => {
			const response = await api.get(queryOptions);
			const tags = response.getData().map((tagData, index) => ({
				tag: tagData.tag,
				type: response.getMeta()[index]['type']
			}));
			const totalResults = parseInt(response.response.headers.get('Total-Results'), 10);
			return { tags, response, totalResults };
		}
		const payload = { libraryKey, ...queryConfig, queryOptions };
		dispatch(requestWithBackoff(makeRequest, { type, payload }));
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
	return fetchTagsBase(`${prefix}_IN_TOP_ITEMS`, {}, queryOptions);
};

const fetchTagsForItemsByQuery = (query, queryOptions, prefix = 'TAGS') => {
	const { collectionKey = null, itemTag = null, itemQ = null, itemQMode = null,
		isTrash, isMyPublications } = query;
	const queryConfig = { collectionKey, isTrash, isMyPublications };

	return fetchTagsBase(
		`${prefix}_IN_ITEMS_BY_QUERY`, queryConfig, {
			...queryOptions,
			itemTag: itemTag,
			itemQ: itemQ,
			itemQMode
	});
}

const fetchCurrentTags = (queryOptions, prefix) => {
	return async (dispatch, getState) => {
		const state = getState();
		const { collectionKey, tags, itemsSource, search, isMyPublications,
			isTrash, qmode, } = state.current;
		const isManagingTags = state.modal.id === MANAGE_TAGS;

		if(isManagingTags) {
			return await dispatch(fetchTagsInLibrary(queryOptions, prefix));
		} else {
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
		const coloredTags = state.libraries[libraryKey]?.tagColors.value;
		const isManagingTags = state.modal.id === MANAGE_TAGS;
		if(isManagingTags || !coloredTags || coloredTags.length === 0) {
			return;
		}
		const tagQuery = coloredTags.map(ct => ct.name).join(' || ');
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

const deleteTags = (tags) => {
	return async(dispatch, getState) => {
		const state = getState();
		const config = state.config;
		const { libraryKey } = state.current;
		const version = state.libraries[libraryKey].sync.version;

		dispatch({
			type: REQUEST_DELETE_TAGS,
			libraryKey,
			tags
		});

		try {
			const response = await api(config.apiKey, config.apiConfig)
				.library(libraryKey)
				.version(version)
				.tags()
				.delete(tags);

				dispatch({
					type: RECEIVE_DELETE_TAGS,
					libraryKey,
					tags,
					response,
				});
		} catch(error) {
			dispatch({
				type: ERROR_DELETE_TAGS,
				libraryKey,
				tags,
				error,
			});
			throw error;
		}
	}
}

const updateTagColors = newTagColors => {
	return async(dispatch, getState) => {
		const state = getState();
		const libraryKey = state.current.libraryKey;
		const newSettings = { ...state.libraries[libraryKey].settings };
		if(!('tagColors' in newSettings)) {
			newSettings.tagColors = {};
		}
		if(Array.isArray(newTagColors) && newTagColors.length > 0) {
			newSettings.tagColors.value = newTagColors;
			delete newSettings.tagColors.version;
		} else {
			delete newSettings.tagColors;
		}

		return await dispatch(updateLibrarySettings(newSettings, libraryKey));
	}
}

const removeTagColor = tag => {
	return async(dispatch, getState) => {
		const state = getState();
		const libraryKey = state.current.libraryKey;
		const newTagColors = [...(state.libraries[libraryKey].tagColors?.value ?? [])].filter(t => t.name !== tag);
		return await dispatch(updateTagColors(newTagColors));
	}
}



export {
	// fetchTagsForItem,
	checkColoredTags,
	deleteTags,
	fetchTags,
	fetchTagsForItemsByQuery,
	fetchTagsForPublicationsItems,
	fetchTagsForTopItems,
	fetchTagsForTrashItems,
	fetchTagsInCollection,
	fetchTagsInLibrary,
	fetchTagSuggestions,
	filterTags,
	removeTagColor,
	updateTagColors,
};
