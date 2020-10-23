import { sortItemsByKey, compareItem } from '../utils';
import { omit } from '../common/immutable';
import { shallowEqual } from 'react-redux';
import { get, getFieldNameFromSortKey } from '../utils';

const replaceDuplicates = (entries, comparer = null, useSplice = false) => {
	const seen = [];
	const compareFn = comparer ? a => seen.some(b => comparer(a,b)) : a => seen.includes(a);
	const deleteFn = useSplice ? i => entries.splice(i, 1) : i => delete entries[i] ;

	let i = entries.length;

	while(i--) {
		if(!!entries[i] && compareFn(entries[i])) {
			deleteFn(i);
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

const populate = (state, newItems, action, keyName, comparer = null) => {
	const { [keyName]: prevItems = [] } = state;
	const { queryOptions, totalResults } = action;
	const { start, limit, sort, direction } = queryOptions;

	const items = [...prevItems];
	items.length = totalResults;

	for(let i = 0; i < newItems.length; i++) {
		items[start + i] = newItems[i];
	}

	return {
		...state,
		[keyName]: replaceDuplicates(items, comparer),
		totalResults,
		sortBy: sort ? getFieldNameFromSortKey(sort) : undefined,
		sortDirection: direction,
		isFetching: false,
		isError: false,
		pointer: start + limit,
	}
}

const populateItemKeys = (state, newKeys, action) => {
	return populate(state, newKeys, action, 'keys');
}

const populateGroups = (state, newGroups, action) => {
	return populate(state, newGroups, action, 'groups', (a, b) => a && b && a.id === b.id);
}

const populateTags = (state, newTags, action) => {
	const data = populate(state, newTags, action, 'rawTags', (a, b) => a && b && a.tag === b.tag && a.type === b.type);
	const tags = replaceDuplicates(data.rawTags.map(t => typeof(t) === 'undefined' ? undefined : t.tag), null, true);
	const duplicatesCount = data.rawTags.length - tags.length;
	const pointer =('start' in action.queryOptions && 'limit' in action.queryOptions && !('tag' in action.queryOptions)) ?
		data.pointer : state.pointer;
	const totalResults = action.queryOptions.tag ? state.totalResults : action.totalResults;

	return {
		...data,
		tags,
		duplicatesCount,
		pointer,
		totalResults
	};
}

const updateFetchingState = ({ requests: prevRequests = [] } = {}, action) => {
	const start = 'queryOptions' in action ? action.queryOptions.start : null;
	const limit = 'queryOptions' in action ? action.queryOptions.limit : null;

	const end = start + limit;
	const requests = action.type.startsWith('REQUEST') ?
		[...prevRequests, [start, end]] :
		prevRequests.filter(r => !(r[0] === start && r[1] === end));

	return {
		requests,
		isFetching: requests.length > 0
	};
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

const detectItemsChanged = ({ items, libraryKey }, allItems = {}, check = () => true) => {
	if(!items || !libraryKey) {
		return false;
	}
	return items.filter(newItem => check(newItem, allItems[newItem.key]));
}

const detectIfItemsChanged = ({ items, libraryKey }, allItems = {}, check = () => true) => {
	if(!items || !libraryKey) {
		return [];
	}
	return items.some(newItem => check(newItem, allItems[newItem.key]));
}

export {
	detectIfItemsChanged,
	detectItemsChanged,
	filterItemKeys,
	injectExtraItemKeys,
	populateGroups,
	populateItemKeys,
	populateTags,
	sortItemKeysOrClear,
	updateFetchingState,
};
