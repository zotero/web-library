import { useMemo } from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import { deduplicateByKey, get } from '../utils';

const useFetchingState = path => {
	const { isFetching, keys, pointer, totalResults, requests = [] } = useSelector(state => get(state, path, {}), shallowEqual);
	const hasMoreItems = totalResults > 0 && (typeof(pointer) === 'undefined' || pointer < totalResults);
	const hasChecked = typeof(totalResults) !== 'undefined';
	const isFetched = hasChecked && !isFetching && !hasMoreItems;

	return { isFetching, isFetched, keys, hasChecked, hasMoreItems, pointer, totalResults, requests };
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

	const { isFetching = false, tags = [], pointer, requests, totalResults } = data;
	const hasMoreItems = totalResults > 0 && (typeof(pointer) === 'undefined' || pointer < totalResults);
	const hasChecked = typeof(totalResults) !== 'undefined';
	const isFetched = hasChecked && !isFetching && !hasMoreItems;

	return { isFetching, isFetched, tags, hasChecked, hasMoreItems, pointer, requests, totalResults };
}

const useTags = (shouldSkipDisabledAndSelected = false) => {
	const tagsSearchString = useSelector(state => state.current.tagsSearchString);
	const { isFetching, pointer = 0, tags: sourceTags = [], totalResults = null, requests, hasChecked, hasMoreItems } = useTagsData();
	const tagColors = useSelector(state =>  get(state, ['libraries', state.current.libraryKey, 'tagColors'], {}), shallowEqual);
	const selectedTags = useSelector(state => state.current.tags, shallowEqual);
	const tags = useMemo(() => {
		const tagsSearchStringLC = tagsSearchString.toLowerCase();
		const newTags = deduplicateByKey([
			...Object.keys(tagColors),
			...(tagsSearchString === '' ? sourceTags : sourceTags.filter(
				tag => tag.toLowerCase().includes(tagsSearchStringLC)
			))
		].map(tag => ({
			tag,
			color: tag in tagColors ? tagColors[tag] : null,
			disabled: tag in tagColors && !sourceTags.includes(tag),
			selected: selectedTags.includes(tag)
		})), 'tag');

		if(shouldSkipDisabledAndSelected) {
			return newTags.filter(t => !t.disabled && !selectedTags.includes(t.tag));
		}

		return newTags;
	}, [shouldSkipDisabledAndSelected, sourceTags, tagColors, tagsSearchString]);
	return { tags, isFetching, pointer, requests, totalResults, hasChecked, hasMoreItems, selectedTags, tagsSearchString };
}

export { useFetchingState, useSourceData, useTagsData, useTags };
