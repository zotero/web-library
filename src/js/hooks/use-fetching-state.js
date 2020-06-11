import { useMemo } from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import { get } from '../utils';
import { getItemKeysPath } from '../common/state';

const useFetchingState = path => {
	const { isFetching, keys, pointer, totalResults, requests = [] } = useSelector(state => get(state, path, {}), shallowEqual);
	const hasMoreItems = totalResults > 0 && (typeof(pointer) === 'undefined' || pointer < totalResults);
	const hasChecked = typeof(totalResults) !== 'undefined';
	const isFetched = hasChecked && !isFetching && !hasMoreItems;

	const fetchingState = useMemo(() =>
		({ isFetching, isFetched, keys, hasChecked, hasMoreItems, pointer, totalResults, requests }),
		[isFetching, isFetched, keys, hasChecked, hasMoreItems, pointer, totalResults, requests]);

	return fetchingState;
};

const useSourcePath = () => {
	const collectionKey = useSelector(state => state.current.collectionKey);
	const itemsSource = useSelector(state => state.current.itemsSource);
	const libraryKey = useSelector(state => state.current.libraryKey);
	return getItemKeysPath({ itemsSource, libraryKey, collectionKey });
}

const useSourceData = () => {
	return useFetchingState(useSourcePath());
};

const useSourceKeys = () => {
	const path = useSourcePath();
	const keys = useSelector(state => get(state, [...path, 'keys'], []), shallowEqual);

	return keys;
}

const useTags = (shouldSkipDisabledAndSelected = false) => {
	const collectionKey = useSelector(state => state.current.collectionKey);
	const itemsSource = useSelector(state => state.current.itemsSource);
	const libraryKey = useSelector(state => state.current.libraryKey);
	var selectorFn;

	switch(itemsSource) {
		case 'query':
			selectorFn = state => state.query.tags || {}, shallowEqual;
		break;
		case 'trash':
			selectorFn = state => get(state, ['libraries', libraryKey, 'tagsInTrashItems'], {}), shallowEqual;
		break;
		case 'publications':
			selectorFn = state => get(state, ['libraries', libraryKey, 'tagsInPublicationsItems'], {}), shallowEqual;
		break;
		case 'collection':
			selectorFn = state => get(state, ['libraries', libraryKey, 'tagsByCollection', collectionKey], {}), shallowEqual;
		break;
		case 'top':
		default:
			selectorFn = state => get(state, ['libraries', libraryKey, 'tagsTop'], {}), shallowEqual;
		break;
	}

	const data = useSelector(selectorFn);
	const { coloredTags = [], isFetching = false, tags: sourceTags = [], pointer = 0, requests, totalResults, duplicatesCount } = (data || {});
	const hasMoreItems = totalResults > 0 && (typeof(pointer) === 'undefined' || pointer < totalResults);
	const hasChecked = typeof(totalResults) !== 'undefined';
	const isFetched = hasChecked && !isFetching && !hasMoreItems;
	const tagsSearchString = useSelector(state => state.current.tagsSearchString);
	const tagColors = useSelector(state =>  get(state, ['libraries', state.current.libraryKey, 'tagColors'], {}), shallowEqual);
	const selectedTagNames = useSelector(state => state.current.tags, shallowEqual)
	const isFiltering = tagsSearchString !== '';
	const selectedTags = useMemo(() => {
		const tags = selectedTagNames.map(tagName => ({
			tag: tagName,
			color: tagColors[tagName] || null,
			selected: true,
			disabled: !coloredTags.includes(tagName)
		}));
		tags.sort((a, b) => {
			if(a.color && !b.color) { return -1; }
			if(b.color && !a.color) { return 1; }
			return a.tag.localeCompare(b.tag, { sensitivity: 'accent' });
		});
		return tags;
	}, [selectedTagNames, tagColors, coloredTags]);

	const tags = useMemo(() => {
		const tagsSearchStringLC = tagsSearchString.toLowerCase();
		const tags = [];

		for(let [tag, color] of Object.entries(tagColors)) {
			const isDisabled = !coloredTags.includes(tag);
			const isSelected = selectedTagNames.includes(tag);

			if(shouldSkipDisabledAndSelected && (isDisabled || isSelected)) {
				continue;
			}

			if(tagsSearchStringLC !== '' && !tag.toLowerCase().includes(tagsSearchStringLC)) {
				// apply filter
				continue;
			}

			tags.push({
				tag, color, disabled: isDisabled, selected: isSelected
			})
		}

		for(let tag of sourceTags) {
			if(typeof(tag) === 'undefined') {
				if(isFiltering && shouldSkipDisabledAndSelected) {
					continue;
				}

				tags.push(undefined); //placeholder
				continue;
			}

			if(isFiltering && !tag.toLowerCase().includes(tagsSearchStringLC)) {
				// apply filter
				continue;
			}

			if(tag in tagColors) {
				// skip colored tags
				continue;
			}

			const isSelected = selectedTagNames.includes(tag);

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

export { useFetchingState, useSourceSignature, useSourceData, useSourceKeys, useTags };
