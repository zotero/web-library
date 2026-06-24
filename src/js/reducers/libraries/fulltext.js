import { RECEIVE_ITEMS_BY_QUERY, RECEIVE_FULLTEXT_INDEX, DISMISS_FULLTEXT_COMPLETE, COMPLETE_FULLTEXT_REFRESH } from '../../constants/actions';

const defaultState = {
	indexedCount: null,
	expectedCount: null,
	isReindexing: false,
	isRefreshing: false,
	showComplete: false,
};

const fulltext = (state = defaultState, action) => {
	switch(action.type) {
		case RECEIVE_ITEMS_BY_QUERY: {
			// The reindexing header is extracted in the action layer (see items-read.js) and
			// passed as a plain flag. Only the start of a session is driven by it; its end is
			// owned by polling.
			if(!action.isFulltextReindexing || state.isReindexing) {
				return state;
			}
			// Entering a session -- clear any stale counts left from a previous one.
			return { ...defaultState, isReindexing: true };
		}
		case RECEIVE_FULLTEXT_INDEX: {
			// The "refreshing" stage shows the spinner while the search is re-run with full index ready.
			const didFinish = action.status === 'indexed' && state.isReindexing;
			return {
				...state,
				isReindexing: action.status === 'indexed' ? false : state.isReindexing,
				isRefreshing: didFinish ? true : state.isRefreshing,
				// The status endpoint reports null counts for terminal statuses
				// (indexed/deindexed); keep the last good values rather than blanking the ring.
				indexedCount: action.indexedCount ?? state.indexedCount,
				expectedCount: action.expectedCount ?? state.expectedCount,
			};
		}
		case COMPLETE_FULLTEXT_REFRESH:
			// The re-run search settled -- swap the spinner for the tick.
			return state.isRefreshing ? { ...state, isRefreshing: false, showComplete: true } : state;
		case DISMISS_FULLTEXT_COMPLETE:
			return { ...state, showComplete: false };
		default:
			return state;
	}
};

export default fulltext;
