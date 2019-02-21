'use strict';

const baseMappings = require('zotero-base-mappings');
const { sortByKey, compare } = require('../utils');
const columnSortKeyLookup = require('../constants/column-sort-key-lookup');

const replaceDuplicates = entries => {
	const seen = [];
	for(let i = 0; i < entries.length; i++) {
		if(!!entries[i] && seen.includes(entries[i])) {
			delete entries[i];
		} else {
			seen.push(entries[i]);
		}
	}
	return entries;
}

const injectExtraItemKeys = (state, newKeys, items) => {
	if(!Array.isArray(newKeys)) { newKeys = [newKeys]; }
	if(!('totalResults' in state && 'keys' in state
		&& 'sortBy' in state && 'sortDirection' in state)) {
		// we don't know enough about target collection to make changes
		// clear what we know and exit
		return {};
	}
	const keys = [...state.keys];
	var hasHoles = false;

	for(let i = 0; i < keys.length; i++) {
		if(typeof(keys[i]) === 'undefined') {
			hasHoles = true;
			break;
		}
	}


	const { sortBy, sortDirection } = state;

	newKeys.forEach(newKey => {
		let injected = false;
		for(let i = 0; i < keys.length; i++) {
			var comparisionResult = compare(
				getSortKeyValue(items[keys[i]], sortBy),
				getSortKeyValue(items[newKey], sortBy)
			);

			if(sortDirection === 'desc') {
				comparisionResult = comparisionResult * -1;
			}

			if(comparisionResult >= 0) {
				keys.splice(i, 0, newKey);
				injected = true;
				break;
			}
		}
		if(!injected) { keys.push(newKey); }
	});

	return {
		...state,
		keys,
		unconfirmedKeys: hasHoles ? [...newKeys] : [],
		totalResults: keys.length
	}
}

const filterItemKeys = (state, removedKeys) => {
	if(!Array.isArray(removedKeys)) { removedKeys = [removedKeys]; }
	const keys = [...(state.keys || [])];

	for(let i = keys.length - 1; i >= 0 ; i--) {
		if(removedKeys.includes(keys[i])) {
			keys.splice(i, 1);
		}
	}

	return {
		...state,
		keys,
		totalResults: keys.length
	}
}

const populateItemKeys = (state, newKeys, action) => {
	const { keys: prevKeys = [] } = state;
	const { start, totalResults, sort, direction } = action;

	const keys = [...prevKeys];
	keys.length = totalResults;

	for(let i = 0; i < newKeys.length; i++) {
		keys[start + i] = newKeys[i];
	}

	return {
		...state,
		keys: replaceDuplicates(keys),
		totalResults,
		sortBy: sort,
		sortDirection: direction,
		isFetching: false
	}
}

const getSortKeyForItemType = (sortKey, itemType) => {
	return itemType in baseMappings && sortKey in baseMappings[itemType] ?
		baseMappings[itemType][sortKey] :
		sortKey;
}

const getSortKeyValue = (item, sortBy) => {
	sortBy = columnSortKeyLookup[sortBy];

	if(sortBy === 'creator') {
		return (item[Symbol.for('meta')] || {})['creatorSummary'];
	}
	if(sortBy === 'date') {
		return (item[Symbol.for('meta')] || {})['parsedDate'];
	}

	const sortKey = getSortKeyForItemType(sortBy, item.itemType);
	return item[sortKey];
}

const sortItemKeysOrClear = (state, items, sortBy, sortDirection) => {
	var isCompleteSet = 'totalResults' in state &&
		'keys' in state &&
		state.totalResults === state.keys.length;
	var keys = [];

	if('keys' in state) {
		for(let i = 0; i < state.keys.length; i++) {
			if(typeof(state.keys[i]) === 'undefined') {
				isCompleteSet = false;
				break;
			}
		}
	}

	if(isCompleteSet) {
		keys = [...state.keys];
		sortByKey(
			keys,
			itemKey => getSortKeyValue(items[itemKey], sortBy),
			sortDirection
		);
	} else if('totalResults' in state) {
		keys = new Array(state.totalResults);
	}

	return { ...state, keys, sortBy, sortDirection };
}

module.exports = {
	injectExtraItemKeys,
	filterItemKeys,
	populateItemKeys,
	sortItemKeysOrClear,
}
