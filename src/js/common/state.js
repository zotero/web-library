'use strict';

const { get } = require('../utils');

const getCollectionsPath = state => {
	const libraryKey = state.current.library;
	const path = [];
	if(libraryKey) {
		var nextKey = state.current.collection
		while(nextKey) {
			const collection = get(state, ['libraries', libraryKey, 'collections', nextKey]);
			if(collection) {
				path.push(collection.key);
				nextKey = collection.parentCollection;
			} else {
				nextKey = null;
			}
		}
	}

	return path.reverse();
};

const getItemFieldValue = (field, state) => {
	const libraryKey = state.current.library;
	const itemKey = state.current.item;
	const item = get(state, ['libraries', libraryKey, 'items', itemKey]);
	const pendingChanges = get(state, ['libraries', libraryKey, 'updating', 'items', itemKey], []);
	const aggregatedPatch = pendingChanges.reduce((aggr, { patch }) => ({...aggr, ...patch}), {});

	return { ...item, ...aggregatedPatch}[field] || null;
};


module.exports = { getCollectionsPath, getItemFieldValue };
