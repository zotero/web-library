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


const getSerializedQuery = ({ collection = null, tag = [], q = null } = {}) => {
	return `${collection}-${tag.join('-')}-${q}`;
}


module.exports = { getCollectionsPath, getSerializedQuery };
