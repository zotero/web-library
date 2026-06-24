import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { dismissFulltextComplete } from '../actions';

// Presentational view of the full-text reindexing state. The polling/refresh engine
// lives in a single owner (FulltextReindexingManager); this hook only reads the
// shared Redux state and exposes a dismiss action for the indicator.
const useFulltextStatus = () => {
	const dispatch = useDispatch();
	const libraryKey = useSelector(state => state.current.libraryKey);
	// Reindexing only applies to full-text ("everything") searches.
	const isFulltextSearch = useSelector(state => state.current.itemsSource === 'query' && state.current.qmode === 'everything');
	const fulltextState = useSelector(state => state.libraries[libraryKey]?.fulltext);
	const { isReindexing = false, isRefreshing = false, indexedCount = null, expectedCount = null, showComplete = false } = fulltextState ?? {};

	const dismiss = useCallback(() => {
		dispatch(dismissFulltextComplete(libraryKey));
	}, [dispatch, libraryKey]);

	// Three mutually-exclusive stages: the determinate ring (reindexing), the
	// indeterminate spinner (refreshing the results), then the completed tick.
	return {
		isActive: isFulltextSearch && (isReindexing || isRefreshing || showComplete),
		isReindexing: isFulltextSearch && isReindexing,
		isRefreshing: isFulltextSearch && isRefreshing,
		isComplete: isFulltextSearch && showComplete,
		indexedCount,
		expectedCount,
		dismiss,
	};
};

export { useFulltextStatus };
