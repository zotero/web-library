'use strict';

import { sortItemsByKey, compareItem } from '../utils';
import { omit } from '../common/immutable';

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
	var injectIterationEnd = keys.length;

	for(let i = 0; i < keys.length; i++) {
		if(typeof(keys[i]) === 'undefined') {
			hasHoles = true;
			injectIterationEnd = i;
			break;
		}
	}


	const { sortBy, sortDirection } = state;

	newKeys.forEach(newKey => {
		let injected = false;
		if(keys.includes(newKey)) {
			return;
		}
		for(let i = 0; i < injectIterationEnd; i++) {

			if(process.env.NODE_ENV === 'development') {
				if(!items[keys[i]]) {
					console.warn(`Key ${keys[i]} encountered but no item by that key exists in registry. This is probably a race condition.`);
				}

				if(!items[newKey]) {
					console.warn(`Key ${keys[i]} encountered but no item by that key exists in registry. This is probably a race condition.`);
				}
			}

			var comparisionResult = compareItem(
				items[keys[i]] || {}, items[newKey] || {}, sortBy
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
	var isCompleteSet = 'totalResults' in state &&
		'keys' in state &&
		state.totalResults === state.keys.length;
	var counter = 0;

	for(let i = keys.length - 1; i >= 0 ; i--) {
		if(removedKeys.includes(keys[i])) {
			keys.splice(i, 1);
			counter++;
		}
	}

	if(counter === 0) {
		return state;
	}

	if(isCompleteSet) {
		return {
			...state,
			keys,
			totalResults: keys.length
		}
	} else {
		return {
			...omit(state, 'totalResults'),
			keys
		}
	}
}

const populateItemKeys = (state, newKeys, action) => {
	const { keys: prevKeys = [] } = state;
	const { queryOptions, totalResults } = action;
	const { start, limit, sort, direction } = queryOptions;

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
		isFetching: false,
		isError: false,
		pointer: start + limit,
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
		sortItemsByKey(
			keys,
			sortBy,
			sortDirection,
			itemKey => items[itemKey]
		);
	} else if('totalResults' in state) {
		keys = new Array(state.totalResults);
	}

	return { ...state, keys, sortBy, sortDirection };
}

export {
	filterItemKeys,
	injectExtraItemKeys,
	populateItemKeys,
	sortItemKeysOrClear,
};
