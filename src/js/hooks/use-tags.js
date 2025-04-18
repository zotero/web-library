import { useMemo } from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import { get } from '../utils';
import { MANAGE_TAGS } from '../constants/modals';

const useTags = (shouldSkipDisabledAndSelected = false) => {
	const collectionKey = useSelector(state => state.current.collectionKey);
	const itemsSource = useSelector(state => state.current.itemsSource);
	const libraryKey = useSelector(state => state.current.libraryKey);
	const tagsSearchString = useSelector(state => state.current.tagsSearchString);
	const tagsHideAutomatic = useSelector(state => state.current.tagsHideAutomatic);
	const tagColors = useSelector(state => get(state, ['libraries', state.current.libraryKey, 'tagColors', 'lookup']), shallowEqual);
	const selectedTagNames = useSelector(state => state.current.tags, shallowEqual)
	const isManagingTags = useSelector(state => state.modal.id === MANAGE_TAGS);
	var selectorFn;

	if (isManagingTags) {
		selectorFn = state => get(state, ['libraries', libraryKey, 'tagsInLibrary']);
	} else {
		switch (itemsSource) {
			case 'query':
				selectorFn = state => state.query.tags || {};
				break;
			case 'trash':
				selectorFn = state => get(state, ['libraries', libraryKey, 'tagsInTrashItems']);
				break;
			case 'publications':
				selectorFn = state => get(state, ['libraries', libraryKey, 'tagsInPublicationsItems']);
				break;
			case 'collection':
				selectorFn = state => get(state, ['libraries', libraryKey, 'tagsByCollection', collectionKey]);
				break;
			case 'top':
			default:
				selectorFn = state => get(state, ['libraries', libraryKey, 'tagsTop']);
				break;
		}
	}

	const data = (useSelector(selectorFn, shallowEqual) || {});
	const { coloredTags = [], isFetching = false, isFetchingColoredTags = false, tags: sourceTags =
		[], pointer = 0, requests, tagTypeLookup, totalResults, duplicatesCount } = data;
	const hasMoreItems = totalResults > 0 && (typeof (pointer) === 'undefined' || pointer < totalResults);
	const hasChecked = typeof (totalResults) !== 'undefined';
	const hasCheckedColoredTags = 'coloredTags' in data;
	const isFetched = hasChecked && !isFetching && !hasMoreItems;
	const isFiltering = tagsSearchString !== '';
	const selectedTags = useMemo(() => {
		const tags = selectedTagNames.map(tagName => ({
			tag: tagName,
			color: (tagColors || {})[tagName] || null,
			selected: true,
			disabled: !coloredTags.includes(tagName)
		}));
		tags.sort((a, b) => {
			if (a.color && !b.color) { return -1; }
			if (b.color && !a.color) { return 1; }
			return a.tag.localeCompare(b.tag, { sensitivity: 'accent' });
		});
		return tags;
	}, [selectedTagNames, tagColors, coloredTags]);


	const tags = useMemo(() => {
		const tagsSearchStringLC = tagsSearchString.toLowerCase();
		const tags = [];

		for (let [tag, color] of Object.entries(tagColors || {})) {
			const isSelected = selectedTagNames.includes(tag);
			const isDisabled = !isSelected && !coloredTags.includes(tag);

			if (shouldSkipDisabledAndSelected && (isDisabled || isSelected)) {
				continue;
			}

			if (tagsSearchStringLC !== '' && !tag.toLowerCase().includes(tagsSearchStringLC)) {
				// apply filter
				continue;
			}

			tags.push({
				tag, color, disabled: isDisabled, selected: isSelected
			})
		}

		for (let tag of sourceTags) {
			if (typeof (tag) === 'undefined' || tag === null) {
				if (isFiltering && shouldSkipDisabledAndSelected) {
					continue;
				}

				tags.push(undefined); //placeholder
				continue;
			}

			if (isFiltering && !tag.toLowerCase().includes(tagsSearchStringLC)) {
				// apply filter
				continue;
			}

			if (tagsHideAutomatic && tagTypeLookup[tag] === 1) {
				// type: 1 automatic, 0 manual
				continue;
			}

			if (tag in (tagColors || {})) {
				// skip colored tags
				continue;
			}

			const isSelected = selectedTagNames.includes(tag);

			if (shouldSkipDisabledAndSelected && isSelected) {
				continue;
			}

			tags.push({
				tag, color: null, disabled: false, selected: isSelected
			});
		}

		return tags;
	}, [coloredTags, isFiltering, selectedTagNames, shouldSkipDisabledAndSelected, sourceTags, tagColors, tagTypeLookup, tagsHideAutomatic, tagsSearchString]);

	return {
		isFetched, duplicatesCount, tags, isFetching, isFetchingColoredTags, pointer, requests,
		totalResults, hasChecked, hasCheckedColoredTags, hasMoreItems, selectedTags, tagsSearchString
	};
}

export { useTags };
