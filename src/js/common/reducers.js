'use strict';

const { sortByKey, compare } = require('../utils');

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
			const comparisionResult = compare(
				keys[i] && sortBy in items[keys[i]] ? items[keys[i]][sortBy] : null,
				newKey && sortBy in items[newKey] ? items[newKey][sortBy] : null,
				sortDirection
			);

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
	}
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
			k => sortBy === 'creator' ?
				(items[k][Symbol.for('meta')] || {})['creatorSummary'] : items[k][sortBy],
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
