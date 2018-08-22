'use strict';

const makePath = ({ collection = null, items = null, trash = false, tags = null } = {}) => {
	const path = [];
	if(trash) {
		path.push('trash')
	} else if(collection) {
		path.push('collection', collection);
	}

	if(tags && tags.length) {
		if(Array.isArray(tags)) {
			tags.sort();
			path.push('tags', tags.map(t => t.replace(/,/g, ',,')).join());
		} else {
			path.push('tags', tags);
		}
	}

	if(items && items.length) {
		if(Array.isArray(items)) {
			path.push('items', items.join(','));
		} else {
			path.push('items', items);
		}
	}

	return '/' + path.join('/');
}

module.exports = { makePath };
