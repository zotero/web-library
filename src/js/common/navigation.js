'use strict';

const getQueryFromParams = params => {
	const { collection, tags, search = '', qmode = 'titleCreatorYear' } = params;
	return { collection, tag: tagsFromUrlPart(tags), q: decodeURIComponent(search), qmode };
}

const tagsFromUrlPart = tags => tags ? tags.split(',').map(t => decodeURIComponent(t)) : [];

const tagsToUrlPart = tags => tags.map(t => encodeURIComponent(t)).join(',');

const makePath = (config, { library = null, collection = null,
	items = null, trash = false, publications = false, tags = null,
	search = null, qmode = null, view = null, noteKey = null, attachmentKey = null } = {}) => {
	const path = [];

	if(library !== null) {
		const libraryData = config.libraries.find(l => l.key === library);
		if(libraryData.isGroupLibrary) {
			path.push('groups', libraryData.id, libraryData.slug);
		} else {
			path.push(libraryData.slug);
		}
	}

	if(trash) {
		path.push('trash')
	} else if (publications) {
		path.push('publications');
	} else if(collection) {
		path.push('collections', collection);
	}

	if(tags && tags.length) {
		if(Array.isArray(tags)) {
			tags.sort();
			path.push('tags', tagsToUrlPart(tags));
		} else {
			path.push('tags', encodeURIComponent(tags));
		}
	}

	if(search && search.length) {
		if(!qmode) {
			qmode = 'titleCreatorYear';
		}
		path.push('search', encodeURIComponent(search), qmode);
	}

	if(items && items.length) {
		if(Array.isArray(items)) {
			path.push('items', items.join(','));
		} else {
			path.push('items', items);
		}
	}

	if(noteKey) {
		path.push('note', noteKey);
	} else if(attachmentKey) {
		path.push('attachment', attachmentKey);
	}

	if(view) {
		path.push(view);
	}

	return '/' + path.join('/');
}

export { makePath, getQueryFromParams, tagsFromUrlPart, tagsToUrlPart };
