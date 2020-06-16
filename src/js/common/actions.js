import api from 'zotero-api-client';

const extractItems = response => {
	return response.getData().map((item, index) => ({
		...item,
		tags: item.tags || [],  // tags are not present on items in my publications
								// but most of the code expects tags key to be present
		[Symbol.for('meta')]: response.getMeta()[index] || {},
		[Symbol.for('links')]: response.getLinks()[index] || {}
	}));
}

//@TODO: deprecate in favour of items-write.jsx chunkedAction()
const sequentialChunkedAcion = async (action, itemKeys, extraArgs = []) => {
	do {
		const itemKeysChunk = itemKeys.splice(0, 50);
		await action(itemKeysChunk, ...extraArgs);
	} while (itemKeys.length > 0);
}

const getApiForItems = ({ config, libraryKey }, requestType, queryConfig) => {
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
		case 'FETCH_ITEM_DETAILS':
		case 'FETCH_ITEMS':
		case 'RELATED_ITEMS':
			return api(config.apiKey, config.apiConfig)
				.library(libraryKey)
				.items()
	}
}

export { extractItems, getApiForItems, sequentialChunkedAcion };
