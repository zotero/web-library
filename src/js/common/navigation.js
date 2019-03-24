'use strict';

const getQueryFromParams = params => {
	const { collection, tags, search = '' } = params;
	return { collection, tag: tagsFromUrlPart(tags), q: search };
}

const tagsFromUrlPart = tags => tags ? tags.split(/\b,\b/).map(t => t.replace(/,,/g, ',')) : [];

const tagsToUrlPart = tags => tags.map(t => t.replace(/,/g, ',,'));

const makePath = ({ library = null, collection = null, items = null, trash = false, publications = false, tags = null, search = null, view = null } = {}) => {
	const path = [];

	if(library !== null) {
		path.push(library);
	}

	if(trash) {
		path.push('trash')
	} else if (publications) {
		path.push('publications');
	} else if(collection) {
		path.push('collection', collection);
	}

	if(tags && tags.length) {
		if(Array.isArray(tags)) {
			tags.sort();
			path.push('tags', tagsToUrlPart(tags).join());
		} else {
			path.push('tags', tags);
		}
	}

	if(search) {
		path.push('search', search);
	}

	if(items && items.length) {
		if(Array.isArray(items)) {
			path.push('items', items.join(','));
		} else {
			path.push('items', items);
		}
	}

	if(view) {
		path.push(view);
	}

	return '/' + path.join('/');
}

export { makePath, getQueryFromParams, tagsFromUrlPart, tagsToUrlPart };
