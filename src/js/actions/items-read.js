import { SORT_ITEMS, REQUEST_ATTACHMENT_URL, RECEIVE_ATTACHMENT_URL, ERROR_ATTACHMENT_URL } from '../constants/actions';
import api from 'zotero-api-client';
import { escapeBooleanSearches, extractItems, getApiForItems } from '../common/actions';
import { getItemKeysPath } from '../common/state';
import { get, getAbortController, mapRelationsToItemKeys } from '../utils';
import columnProperties from '../constants/column-properties';
import { connectionIssues, requestTracker, requestWithBackoff } from '.';

const fetchItems = (
	type,
	queryConfig,
	queryOptions = {},
	overrides = {},
	requestId = null
) => {
	return async (dispatch, getState) => {
		const state = getState();
		const config = 'config' in overrides ? overrides.config : state.config;
		const { libraryKey } = 'current' in overrides ? overrides.current : state.current;
		const api = getApiForItems({ config, libraryKey }, type, queryConfig);
		const id = requestId || requestTracker.id++;
		const abortController = getAbortController();


		dispatch({
			type: `REQUEST_${type}`, id,
			libraryKey, ...queryConfig, queryOptions
		});

		if(abortController) {
			queryOptions['signal'] = abortController.signal;
			requestTracker[id] = abortController;
		}

		const makeRequest = async () => {
			const response = await api.get(escapeBooleanSearches(queryOptions, 'tag'));
			if(abortController?.signal.aborted) {
				// Aborted requests should reject the fetch promise, however real-world testing
				// shows this can execute. Throwing an error ensures this is handled correctly.
				throw new Error('aborted');
			}
			const items = extractItems(response, state);
			const totalResults = parseInt(response.response.headers.get('Total-Results'), 10);
			return { items, response, totalResults };
		}

		const payload = { libraryKey, ...queryConfig, queryOptions };
		return dispatch(requestWithBackoff(makeRequest, { id, type, payload }));
	}
}

const fetchTopItems = (queryOptions, overrides) => {
	return fetchItems('TOP_ITEMS', {}, queryOptions, overrides);
}

const fetchTrashItems = (queryOptions, overrides) => {
	return fetchItems('TRASH_ITEMS', {}, queryOptions, overrides);
}

const fetchPublicationsItems = (queryOptions, overrides) => {
	return fetchItems('PUBLICATIONS_ITEMS', {}, queryOptions, overrides);
}

const fetchItemsInCollection = (collectionKey, queryOptions, overrides) => {
	return fetchItems('ITEMS_IN_COLLECTION', { collectionKey }, queryOptions, overrides);
}

const fetchItemsQuery = (query, queryOptions, overrides) => {
	const { collectionKey = null, tag = null, q = null, qmode = null, isTrash,
		isMyPublications } = query;
	const queryConfig = { collectionKey, isTrash, isMyPublications };
	return fetchItems(
		'ITEMS_BY_QUERY', queryConfig, { ...queryOptions, tag, q, qmode }, overrides
	);
}

const fetchChildItems = (itemKey, queryOptions, overrides) => {
	return fetchItems('CHILD_ITEMS', { itemKey }, queryOptions, overrides);
}

const fetchItemsByKeys = (itemKeys, queryOptions, overrides) => {
	return fetchItems(
		'FETCH_ITEMS', {}, { ...queryOptions, itemKey: itemKeys.join(','), }, overrides
	);
}

// @NOTE: same as fetch items but limited to one item and ignored when considering membership
// 		  (collection, trash etc.).
const fetchItemDetails = (itemKey, queryOptions, overrides) => {
	return async (dispatch, getState) => {
		const state = getState();
		const includeTrashed = state.current.isTrash ? 1 : 0;
		return dispatch(fetchItems(
			'FETCH_ITEM_DETAILS', {}, { ...queryOptions, includeTrashed, itemKey }, overrides
		));
	};
}

const fetchAllItemsSince = (version, queryOptions, overrides) => {
	return async (dispatch, getState) => {
		var pointer = 0;
		const limit = 100;
		var hasMore = false;

		const state = getState();

		if('FETCH_ITEMS' in state.traffic &&
			Array.isArray(state.traffic['FETCH_ITEMS'].ongoing) &&
			state.traffic['FETCH_ITEMS'].ongoing.length > 0) {
				setTimeout(() => dispatch(fetchAllItemsSince(version, queryOptions, overrides), 1000));
				return;
		}

		const checkForNextBatch = (requestId) => {
			return async (dispatch, getState) => {
				const state = getState();
				const { totalResults } = get(state, ['traffic', 'FETCH_ITEMS', 'last'], {});

				if(typeof(totalResults) === 'undefined') {
					if('FETCH_ITEMS' in state.traffic &&
						Array.isArray(state.traffic['FETCH_ITEMS'].ongoing) &&
						state.traffic['FETCH_ITEMS'].ongoing.includes(requestId)
					) {
						// request was delayed, recheck later
						setTimeout(() => dispatch(checkForNextBatch(requestId)), 1000);
						return;
					}

					if('FETCH_ITEMS' in state.traffic &&
						state.traffic['FETCH_ITEMS'].errorCount > 0 &&
						state.traffic['FETCH_ITEMS'].errorCount < 3) {
						// request errored, rerun up to 3 times
						const requestId = requestTracker.id++;
						await dispatch(
							fetchItems('FETCH_ITEMS', {}, { ...queryOptions, start: pointer, limit, since: version }, overrides, requestId )
						);
						dispatch(checkForNextBatch(requestId));
						return;
					}

					// request was dropped, report connection issues, clean up, give up
					dispatch(connectionIssues());
					return;
				}


				hasMore = totalResults > pointer + limit;
				pointer += limit;

				if(hasMore) {
					const requestId = requestTracker.id++;
					await dispatch(
						fetchItems('FETCH_ITEMS', {}, { ...queryOptions, start: pointer, limit, since: version }, overrides, requestId )
					);
					dispatch(checkForNextBatch(requestId));
				}
			}
		}
		const requestId = requestTracker.id++;
		await dispatch(
			fetchItems('FETCH_ITEMS', {}, { ...queryOptions, start: pointer, limit, since: version }, overrides, requestId )
		);
		dispatch(checkForNextBatch(requestId));
	}
}

const fetchRelatedItems = (itemKey, queryOptions, overrides) => {
	return async (dispatch, getState) => {
		const state = getState();
		const { libraryKey } = state.current;
		const item = state.libraries[libraryKey].items[itemKey];

		if(!item) {
			dispatch({
				type: 'ERROR_RELATED_ITEMS',
				error: `Item ${itemKey} is not found in local state`,
			});
			throw new Error(`Item ${itemKey} is not found in local state`);
		}

		const relatedItemsKeys = mapRelationsToItemKeys(item.relations || {}, libraryKey);

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
			'RELATED_ITEMS', { itemKey }, { ...queryOptions, itemKey: relatedItemsKeys.join(',') }, overrides
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

const getAttachmentUrl = (itemKey, forceFresh = false) => {
	return async (dispatch, getState) => {
		const state = getState();
		const { libraryKey } = state.current;
		const attachmentURLdata = state.libraries[state.current.libraryKey]?.attachmentsUrl[itemKey];

		try {
			const isURLFresh = !forceFresh && (attachmentURLdata && Date.now() - attachmentURLdata.timestamp < 60000);
			const isPromise = attachmentURLdata?.promise instanceof Promise;
			const promise = (isURLFresh && isPromise) ? attachmentURLdata.promise : api(state.config.apiKey, state.config.apiConfig)
				.library(libraryKey)
				.items(itemKey)
				.attachmentUrl()
				.get();

			dispatch({
				type: REQUEST_ATTACHMENT_URL,
				libraryKey,
				itemKey,
				forceFresh,
				promise
			});

			const response = await promise;
			const url = response.getData();

			dispatch({
				type: RECEIVE_ATTACHMENT_URL,
				libraryKey,
				itemKey,
				forceFresh,
				url
			});

			return url;
		} catch(error) {
			dispatch({
				type: ERROR_ATTACHMENT_URL,
				libraryKey, itemKey, forceFresh, error,
			});

			throw error;
		}
	}
}

const PAGE_SIZE = 100;
const fetchSource = ({ startIndex, stopIndex, ...rest }) => {
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
		const { collectionKey, isTrash, isMyPublications, itemsSource, libraryKey, search: q, qmode,
			tags: tag = [] } = rest;
		const { field: sortBy, sort: sortDirection } = state.preferences.columns.find(
			column => 'sort' in column) || { field: 'title', sort: 'asc' };

		const direction = sortDirection.toLowerCase();
		const sort = (sortBy in columnProperties && columnProperties[sortBy].sortKey) || 'title';
		const sortAndDirection = { start, limit, sort, direction };

		switch(itemsSource) {
			case 'query':
				return await dispatch(fetchItemsQuery({ collectionKey, isMyPublications,
					isTrash, q, tag, qmode }, sortAndDirection, { current: { libraryKey }}));
			case 'top':
				return await dispatch(fetchTopItems(sortAndDirection, { current: { libraryKey } }));
			case 'trash':
				return await dispatch(fetchTrashItems(sortAndDirection, { current: { libraryKey } }));
			case 'publications':
				return await dispatch(fetchPublicationsItems(sortAndDirection, { current: { libraryKey } }));
				case 'collection':
				return await dispatch(fetchItemsInCollection(collectionKey, sortAndDirection, { current: { libraryKey } }));
		}
	}
}

//@TODO: improve redundancy to intermittent failure (see fetchAllItemsSince)
const fetchAllChildItems = (itemKey, queryOptions = {}, overrides) => {
	return async (dispatch, getState) => {
		let pointer = 0;
		const limit = PAGE_SIZE;

		await dispatch(fetchItems('CHILD_ITEMS', { itemKey }, { ...queryOptions, start: pointer, limit }, overrides));
		const state = getState();
		const totalResults = state.libraries[state.current.libraryKey]?.itemsByParent[itemKey]?.totalResults ?? 0;
		const requests = [];
		pointer += limit;

		while (pointer < totalResults) {
			requests.push(
				dispatch(fetchItems(
					'CHILD_ITEMS', { itemKey }, { ...queryOptions, start: pointer, limit }, overrides)
				)
			);
			pointer += limit;
		}

		await Promise.all(requests);
	}
}

const findRowIndexInSource = () => {
	return async (dispatch, getState) => {
		const state = getState();
		const itemKey = state.current.itemKeys?.[0];

		if(itemKey === null || typeof itemKey === 'undefined') {
			return 0;
		}

		const libraryKey = state.current.libraryKey;
		const config = state.config;
		const { collectionKey, isTrash, isMyPublications, itemsSource, search: q, qmode,
			tags: tag = [] } = state.current;
		const { field: sortBy, sort: sortDirection } = state.preferences.columns.find(
			column => 'sort' in column) || { field: 'title', sort: 'asc' };

		const direction = sortDirection.toLowerCase();
		const sort = (sortBy in columnProperties && columnProperties[sortBy].sortKey) || 'title';
		const sortAndDirection = { sort, direction };

		let type = 'TOP_ITEMS';
		let queryConfig = {};
		let queryOptions = { ...sortAndDirection };
		let path = getItemKeysPath({ itemsSource, libraryKey, collectionKey });
		let keys = get(state, [...path, 'keys'], []);

		switch (itemsSource) {
			case 'query':
				type = 'ITEMS_BY_QUERY';
				queryConfig = { collectionKey, isMyPublications, isTrash, };
				queryOptions = { q, tag, qmode, ...sortAndDirection };
				break;
			case 'top':
				type = 'TOP_ITEMS';
				break;
			case 'trash':
				type = 'TRASH_ITEMS';
				break;
			case 'publications':
				type = 'PUBLICATIONS_ITEMS';
				break;
			case 'collection':
				type = 'ITEMS_IN_COLLECTION';
				queryConfig = { collectionKey };
				break;
		}

		let itemIndexLocal = keys.indexOf(itemKey);

		if (itemIndexLocal !== -1) {
			return itemIndexLocal;
		}

		try {
			const api = getApiForItems({ config, libraryKey }, type, queryConfig);
			const response = await api.get({ ...escapeBooleanSearches(queryOptions, 'tag'), format: 'keys' });
			const keys = (await response.getData().text()).split("\n");
			if(keys.indexOf(itemKey) !== -1) {
				return keys.indexOf(itemKey);
			}
			return 0;
		} catch (error) {
			return 0;
		}
	}
}

export {
	fetchAllChildItems,
	fetchAllItemsSince,
	fetchChildItems,
	fetchItemDetails,
	fetchItemsByKeys,
	fetchItemsInCollection,
	fetchItemsQuery,
	fetchPublicationsItems,
	fetchRelatedItems,
	fetchSource,
	fetchTopItems,
	fetchTrashItems,
	findRowIndexInSource,
	getAttachmentUrl,
	sortItems,
};
