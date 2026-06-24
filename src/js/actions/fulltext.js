import api from 'zotero-api-client';

import { REQUEST_FULLTEXT_INDEX, RECEIVE_FULLTEXT_INDEX, ERROR_FULLTEXT_INDEX, DISMISS_FULLTEXT_COMPLETE, COMPLETE_FULLTEXT_REFRESH } from '../constants/actions';
import { fetchItemsQuery } from './items-read';

const fetchFulltextStatus = (libraryKey = null) => {
	return async (dispatch, getState) => {
		const state = getState();
		const config = state.config;
		libraryKey = libraryKey ?? state.current.libraryKey;

		dispatch({
			type: REQUEST_FULLTEXT_INDEX,
			libraryKey
		});

		try {
			const response = await api(config.apiKey, config.apiConfig)
				.library(libraryKey)
				.fulltextStatus()
				.get();

			const status = response.getStatus();
			const indexedCount = response.getIndexedCount();
			const expectedCount = response.getExpectedCount();

			dispatch({
				type: RECEIVE_FULLTEXT_INDEX,
				libraryKey,
				status,
				indexedCount,
				expectedCount,
				response
			});

			return { status, indexedCount, expectedCount };
		} catch (error) {
			dispatch({
				type: ERROR_FULLTEXT_INDEX,
				libraryKey,
				silent: true,
				error
			});
			throw error;
		}
	};
}

// Re-run the active search to pull complete results once reindexing is complete
const refreshFulltextSearch = () => {
	return async (dispatch, getState) => {
		const state = getState();
		const last = state.traffic?.['ITEMS_BY_QUERY']?.last;
		if(!last || !last.queryOptions) {
			return;
		}
		const { libraryKey, collectionKey = null, isTrash = false, isMyPublications = false, queryOptions } = last;
		const { q = null, qmode = null, tag = null, sort, direction, limit = 50 } = queryOptions;
		return dispatch(fetchItemsQuery(
			{ collectionKey, isTrash, isMyPublications, q, qmode, tag },
			{ start: 0, limit, sort, direction },
			{ current: { libraryKey } }
		));
	};
}

// Dismiss the completed (tick) indicator for the given library
const dismissFulltextComplete = (libraryKey) => ({
	type: DISMISS_FULLTEXT_COMPLETE,
	libraryKey
});

// Mark the post-rebuild re-run search as settled, swapping the spinner for the tick
const completeFulltextRefresh = (libraryKey) => ({
	type: COMPLETE_FULLTEXT_REFRESH,
	libraryKey
});

export { fetchFulltextStatus, refreshFulltextSearch, dismissFulltextComplete, completeFulltextRefresh };
