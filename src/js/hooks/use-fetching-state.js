import { useSelector, shallowEqual } from 'react-redux';
import { get } from '../utils';

const useFetchingState = path => {
	const { isFetching, keys, pointer, totalResults } = useSelector(state => get(state, path, {}), shallowEqual);
	const hasMoreItems = totalResults > 0 && (typeof(pointer) === 'undefined' || pointer < totalResults);
	const hasChecked = typeof(totalResults) !== 'undefined';
	const isFetched = hasChecked && !isFetching && !hasMoreItems;

	return { isFetching, isFetched, keys, hasChecked, hasMoreItems, pointer, totalResults };
};

const useSourceData = () => {
	const collectionKey = useSelector(state => state.current.collectionKey);
	const itemsSource = useSelector(state => state.current.itemsSource);
	const libraryKey = useSelector(state => state.current.libraryKey);
	var path;

	switch(itemsSource) {
		case 'query':
			path = ['query'];
		break;
		case 'top':
			path = ['libraries', libraryKey, 'itemsTop'];
		break;
		case 'trash':
			path = ['libraries', libraryKey, 'itemsTrash'];
		break;
		case 'publications':
			path = ['itemsPublications'];
		break;
		case 'collection':
			path = ['libraries', libraryKey, 'itemsByCollection', collectionKey];
		break;
	}

	return useFetchingState(path);
};

const useTagsData = () => {
	const collectionKey = useSelector(state => state.current.collectionKey);
	const itemsSource = useSelector(state => state.current.itemsSource);
	const libraryKey = useSelector(state => state.current.libraryKey);
	var data;

	switch(itemsSource) {
		case 'query':
			data = useSelector(state => state.query.tags || {}, shallowEqual);
		break;
		case 'trash':
			data = useSelector(state => get(state, ['libraries', libraryKey, 'tagsInTrashItems'], {}), shallowEqual);
		break;
		case 'publications':
			data = useSelector(state => get(state, ['libraries', libraryKey, 'tagsInPublicationsItems'], {}), shallowEqual);
		break;
		case 'collection':
			data = useSelector(state => get(state, ['libraries', libraryKey, 'tagsByCollection', collectionKey], {}), shallowEqual);
		break;
		case 'top':
		default:
			data = useSelector(state => get(state, ['libraries', libraryKey, 'tagsTop'], {}), shallowEqual);
		break;
	}

	const { isFetching = false, tags = [], pointer = null, totalResults = null } = data;
	const hasMoreItems = totalResults > 0 && (typeof(pointer) === 'undefined' || pointer < totalResults);
	const hasChecked = typeof(totalResults) !== 'undefined';
	const isFetched = hasChecked && !isFetching && !hasMoreItems;

	return { isFetching, isFetched, tags, hasChecked, hasMoreItems, pointer, totalResults };
}

export { useFetchingState, useSourceData, useTagsData };
