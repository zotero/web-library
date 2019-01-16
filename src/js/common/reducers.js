'use strict';

const { sortByKey } = require('../utils');

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

const populate = (prevEntries, entries, start, limit, totalResults) => {
	const newArray = [...prevEntries];
	const actualLimit = Math.min(limit, totalResults - start);
	newArray.length = totalResults;

	for(var i = 0; i < actualLimit; i++) {
		newArray[start + i] = entries[i];
	}
	return replaceDuplicates(newArray);
}

const inject = (prevEntries, entries, sortConfig = {}) => {
	const newArray = [...prevEntries];
	var firstEmptySlot;

	for(var i = 0; i < newArray.length; i++) {
		if(!newArray[i]) {
			firstEmptySlot = i;
			break;
		}
	}
	if(firstEmptySlot) {
		newArray.splice(firstEmptySlot, 0, ...entries);
	} else {
		newArray.push(...entries);
		if('sortBy' in sortConfig && 'sortDirection' in sortConfig) {
			sortByKey(
				newArray,
				sortConfig.sortBy,
				sortConfig.sortDirection
			);
		}
	}
	return replaceDuplicates(newArray);
}

module.exports = {
	populate,
	inject
}
