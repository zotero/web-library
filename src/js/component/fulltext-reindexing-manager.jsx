import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { usePrevious } from 'web-common/hooks';

import { fetchFulltextStatus, refreshFulltextSearch, dismissFulltextComplete, completeFulltextRefresh } from '../actions';

const DEFAULT_POLL_INTERVAL = 2000;

const FulltextReindexingManager = () => {
	const dispatch = useDispatch();
	const libraryKey = useSelector(state => state.current.libraryKey);
	// Reindexing only applies to full-text ("everything") searches; any other search mode
	// or a non-query source is treated like navigating away (stop polling, hide the status).
	const isFulltextSearch = useSelector(state => state.current.itemsSource === 'query' && state.current.qmode === 'everything');
	const search = useSelector(state => state.current.search);
	const pollInterval = useSelector(state => state.config.fulltextReindexPollInterval) ?? DEFAULT_POLL_INTERVAL;
	const fulltextState = useSelector(state => state.libraries[libraryKey]?.fulltext);
	const { isReindexing = false, showComplete = false } = fulltextState ?? {};

	const pollInFlightRef = useRef(false);
	const prevIsReindexing = usePrevious(isReindexing);
	const prevSearch = usePrevious(search);
	const prevLibraryKey = usePrevious(libraryKey);

	// Only poll while a full-text search is on screen
	const shouldPoll = isFulltextSearch && isReindexing;

	// Poll the index-status endpoint while reindexing is in progress.
	useEffect(() => {
		if(!shouldPoll) {
			return;
		}
		const poll = () => {
			// Dedup: skip this tick while the previous poll is still in flight
			if(pollInFlightRef.current) {
				return;
			}
			pollInFlightRef.current = true;
			dispatch(fetchFulltextStatus(libraryKey))
				.catch(() => {})
				.finally(() => { pollInFlightRef.current = false; });
		};
		poll();
		const intervalId = setInterval(poll, pollInterval);
		return () => clearInterval(intervalId);
	}, [shouldPoll, libraryKey, pollInterval, dispatch]);

	// On the indexing -> indexed transition, re-run the search to pull the now-complete
	// results, then surface the tick. The spinner (isRefreshing) shows in the meantime.
	// Capturing the key keeps a mid-flight library switch from completing the wrong slice.
	useEffect(() => {
		if(libraryKey === prevLibraryKey && isFulltextSearch && prevIsReindexing && !isReindexing) {
			const refreshedLibraryKey = libraryKey;
			dispatch(refreshFulltextSearch())
				.catch(() => {})
				.then(() => dispatch(completeFulltextRefresh(refreshedLibraryKey)));
		}
	}, [libraryKey, prevLibraryKey, isFulltextSearch, isReindexing, prevIsReindexing, dispatch]);

	// Clear the completed indicator when a new search term is entered, or once the view is
	// no longer a full-text search (different items source or search mode).
	useEffect(() => {
		if(showComplete && (search !== prevSearch || !isFulltextSearch)) {
			dispatch(dismissFulltextComplete(libraryKey));
		}
	}, [showComplete, search, prevSearch, isFulltextSearch, libraryKey, dispatch]);

	return null;
};

FulltextReindexingManager.displayName = 'FulltextReindexingManager';

export default FulltextReindexingManager;
