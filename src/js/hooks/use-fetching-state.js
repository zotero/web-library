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

const useTags = (shouldSkipDisabledAndSelected = false) => {
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

	const { coloredTags = [], isFetching = false, tags: sourceTags = [], pointer = 0, requests, totalResults, duplicatesCount } = data;
	const hasMoreItems = totalResults > 0 && (typeof(pointer) === 'undefined' || pointer < totalResults);
	const hasChecked = typeof(totalResults) !== 'undefined';
	const isFetched = hasChecked && !isFetching && !hasMoreItems;
	const tagsSearchString = useSelector(state => state.current.tagsSearchString);
	const tagColors = useSelector(state =>  get(state, ['libraries', state.current.libraryKey, 'tagColors'], {}), shallowEqual);
	const selectedTags = useSelector(state => state.current.tags, shallowEqual);

	const tags = useMemo(() => {
		const tagsSearchStringLC = tagsSearchString.toLowerCase();
		const tags = [];

		for(let [tag, color] of Object.entries(tagColors)) {
			const isDisabled = !coloredTags.includes(tag);
			const isSelected = selectedTags.includes(tag);

			if(shouldSkipDisabledAndSelected && (isDisabled || isSelected)) {
				continue;
			}

			tags.push({
				tag, color, disabled: isDisabled, selected: isSelected
			})
		}

		for(let tag of sourceTags) {
			if(typeof(tag) === 'undefined') {
				tags.push(undefined); //placeholder
				continue;
			}

			if(tagsSearchStringLC !== '' && !tag.toLowerCase().includes(tagsSearchStringLC)) {
				// apply filter
				continue;
			}

			if(tag in tagColors) {
				// skip colored tags
				continue;
			}

			const isSelected = selectedTags.includes(tag);

			if(shouldSkipDisabledAndSelected && isSelected) {
				continue;
			}

			tags.push({
				tag, color: null, disabled: false, selected: isSelected
			});
		}

		return tags;
	}, [coloredTags, shouldSkipDisabledAndSelected, sourceTags, tagColors, tagsSearchString]);

	return { isFetched, duplicatesCount, tags, isFetching, pointer, requests, totalResults, hasChecked, hasMoreItems, selectedTags, tagsSearchString };
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

export { useFetchingState, useSourceSignature, useSourceData, useTags };
