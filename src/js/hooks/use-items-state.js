import { useMemo } from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import { get } from '../utils';
import { getItemKeysPath } from '../common/state';

const useItemsState = path => {
	if(!Array.isArray(path)) {
		path = getItemKeysPath(path);
	}

	const { isFetching, keys, pointer, totalResults, sortBy, sortDirection, injectPoints = [], requests = [] } = useSelector(state => get(state, path, {}), shallowEqual);
	const hasMoreItems = totalResults > 0 && (typeof(pointer) === 'undefined' || pointer < totalResults);
	const hasChecked = typeof(totalResults) !== 'undefined';
	const isFetched = hasChecked && !isFetching && !hasMoreItems;
	const adjustedTotalResults = typeof (totalResults) === 'undefined' ? Infinity : totalResults + injectPoints.length;

	const fetchingState = useMemo(() =>
		({ isFetching, isFetched, keys, hasChecked, hasMoreItems, injectPoints, pointer, sortBy, sortDirection, totalResults: adjustedTotalResults, requests }),
		[isFetching, isFetched, keys, hasChecked, hasMoreItems, injectPoints, pointer, sortBy, sortDirection, adjustedTotalResults, requests]);

	return fetchingState;
};

const useItemsKeys = path => {
	if (!Array.isArray(path)) {
		path = getItemKeysPath(path);
	}
	const keys = useSelector(state => get(state, [...path, 'keys'], []), shallowEqual);

	return keys;
}

const useSourcePath = () => {
	const collectionKey = useSelector(state => state.current.collectionKey);
	const itemsSource = useSelector(state => state.current.itemsSource);
	const libraryKey = useSelector(state => state.current.libraryKey);
	return getItemKeysPath({ itemsSource, libraryKey, collectionKey });
}

const useSourceData = () => {
	return useItemsState(useSourcePath());
};

const useSourceKeys = () => {
	const path = useSourcePath();
	const keys = useSelector(state => get(state, [...path, 'keys'], []), shallowEqual);

	return keys;
}

const useSourceSignature = () => {
	const itemsSource = useSelector(s => s.current.itemsSource);
	const libraryKey = useSelector(s => s.current.libraryKey);
	const collectionKey = useSelector(s => s.current.collectionKey);
	const search = useSelector(s => s.current.search);
	const qmode = useSelector(s => s.current.qmode);
	const tags = useSelector(s => s.current.tags, shallowEqual);

	if(itemsSource == 'collection') {
		return `${libraryKey}-${collectionKey}`;
	} else if(itemsSource == 'query') {
		return `${libraryKey}-query-${collectionKey}-${tags.join('-')}-${search}-${qmode}`;
	} else {
		return `${libraryKey}-${itemsSource}`;
	}
}

export { useItemsState, useItemsKeys, useSourceSignature, useSourceData, useSourceKeys, useSourcePath };
