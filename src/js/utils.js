import { noteAsTitle } from './common/format';
import columnProperties from './constants/column-properties';

const splice = (array, at, count = 0, ...items) => {
	if (at == null) {
		at = array.length;
	}

	return [
		...array.slice(0, at),
		...items,
		...array.slice(at + count)
	];
};

//@TODO: deprecate this in favor of ?. syntax
const get = (src, path, fallback) => {
	if(typeof(src) === 'undefined' || src === null) {
		return fallback;
	}
	if(!path || !path.length) {
		return src;
	}

	const parts = Array.isArray(path) ? path : path.split('.');

	var obj = src;
	var i, ii;

	for(i = 0, ii = parts.length; i < ii; i++) {
		// eslint-disable-next-line no-prototype-builtins
		if(!obj.propertyIsEnumerable(parts[i])) {
			return fallback;
		}

		obj = obj[parts[i]];

		if(obj === null) {
			return (i !== ii - 1) ? fallback : obj;
		}
	}

	return obj;
};

const transform = (src, path, f, fallback = {}) => {
	return f(get(src, path) || fallback);
};

const reverseMap = map => {
	return Object.keys(map).reduce((acc, key) => {
		acc[map[key]] = key;
		return acc;
	}, {});
};

const deduplicate = array => [...(new Set(array))];

const deduplicateByKey = (array, key) => deduplicateByHash(array, item => item[key]);

const deduplicateByHash = (array, hasher) => {
	const seen = {};

	return array.filter(i => {
		if(hasher(i) in seen) {
			return false;
		} else {
			seen[hasher(i)] = true;
			return true;
		}
	});
};

const getItemCanonicalUrl = ({ libraryKey, itemKey }) =>
	`http://zotero.org/${libraryKey.startsWith('u') ? 'user' : 'groups'}/${libraryKey.slice(1)}/items/${itemKey}`;

const getItemFromCanonicalUrl = url => {
	const match = url.match('https?://zotero.org/(users|groups)/([0-9]+)/items/([A-Z0-9]{8})');
	if(match) {
		const [, libraryType, libraryID, itemKey] = match;
		const libraryKey = `${libraryType === 'users' ? 'u' : 'g'}${libraryID}`;
		return { libraryKey, itemKey };
	}
	return null;
}

const mapRelationsToItemKeys = (relations, libraryKey, relationType='dc:relation', shouldRemoveEmpty = true) => {
	if (!(relationType in relations)) {
		return [];
	}
	var relatedUrls = Array.isArray(relations[relationType]) ? relations[relationType] : [relations[relationType]];

	const relatedItemKeys = relatedUrls.map(relatedUrl => {
		const itemData = getItemFromCanonicalUrl(relatedUrl)
		// cannot relate items in different libraries https://github.com/zotero/zotero/blob/f0a8c9ada38bae33593f331b36384d900e7f4d63/chrome/content/zotero/bindings/relatedbox.xml#L219-L225
		return itemData && itemData.libraryKey === libraryKey ? itemData.itemKey : null;
	});

	return shouldRemoveEmpty ? relatedItemKeys.filter(Boolean) : relatedItemKeys;
};

const removeRelationByItemKey = (itemKey, relations, libraryKey, relationType='dc:relation') => {
	let relatedItemKeys = mapRelationsToItemKeys(relations, libraryKey, relationType, false);
	let index = relatedItemKeys.indexOf(itemKey);
	if(index === -1) {
		return relations;
	}
	let relatedUrls = Array.isArray(relations[relationType]) ? relations[relationType] : [relations[relationType]];
	relatedUrls.splice(index, 1);

	return {
		...relations,
		[relationType]: relatedUrls
	};
};

const isUndefinedOrNull = value =>
	typeof value === 'undefined' || value === null;

const getSortKeyForItemType = (mappings, sortKey, itemType) => {
	return itemType in mappings && sortKey in mappings[itemType] ?
		mappings[itemType][sortKey] : sortKey;
}

const getSortKeyValue = (mappings, item, sortBy = 'title') => {
	sortBy = columnProperties[sortBy].sortKey;
	if(item.itemType === 'note' && sortBy === 'title') {
		return noteAsTitle(item.note || '');
	}

	if(sortBy === 'creator') {
		return (item[Symbol.for('meta')] || {})['creatorSummary'];
	}
	if(sortBy === 'date') {
		return (item[Symbol.for('meta')] || {})['parsedDate'];
	}

	const sortKey = getSortKeyForItemType(mappings, sortBy, item.itemType);
	return item[sortKey];
}



const compareItem = (mappings, itemA, itemB, sortBy) => {
	var a = getSortKeyValue(mappings, itemA, sortBy);
	var b = getSortKeyValue(mappings, itemB, sortBy);

	// normalize nulls and empty values, if title, empty value is treated
	// as an empty string ("") and sorted first in ascending order
	// (e.g. before "a"), otherwise empty value is treated as null and sorted last
	if(sortBy === 'title') {
		if(isUndefinedOrNull(a)) {
			a = '';
		}
		if(isUndefinedOrNull(b)) {
			b = ''
		}
	} else {
		if(a == '') {
			a = null;
		}
		if(b == '') {
			b = null
		}
	}

	const compareResult = compare(a, b);

	// fallback for dateModified comparision
	if(compareResult === 0) {
		return compare(itemA.dateModified, itemB.dateModified);
	} else {
		return compareResult;
	}
}


//@NOTE: compare function treats empty strings, undefined and null values
//		 as equal to each other and indicates these should occur AFTER
//		 any actual values
const compare = (a, b) => {
	if(isUndefinedOrNull(a) && isUndefinedOrNull(b)) {
		return 0;
	}
	if(isUndefinedOrNull(a)) {
		return 1;
	}
	if(isUndefinedOrNull(b)) {
		return -1;
	}

	if(typeof(a) === 'number' && typeof('b') === 'number') {
		return a - b;
	}

	return a.localeCompare(b, { sensitivity: 'accent' });
}

const sortByKey = (items, key, direction = 'asc') => {
	items.sort((a, b) => {
		let aKeyValue = typeof(key) === 'function' ? key(a) : a[key];
		let bKeyValue = typeof(key) === 'function' ? key(b) : b[key];

		return direction === 'asc' ?
			compare(aKeyValue, bKeyValue) :
			compare(aKeyValue, bKeyValue) * -1;
	});
};

const sortItemsByKey = (mappings, items, key, direction = 'asc', getItem = item => item) => {
	items.sort((a, b) => direction === 'asc' ?
			compareItem(mappings, getItem(a), getItem(b), key) :
			compareItem(mappings, getItem(a), getItem(b), key) * -1
		);
}

const indexByGeneratedKey = (elements, keygenerator, processor = e => e) => {
	return elements.reduce((aggr, element) => {
		aggr[keygenerator(element)] = processor(element);
		return aggr;
	}, {});
}

const indexByKey = (elements, key = 'key', processor = e => e) => {
	return elements.reduce((aggr, element) => {
		aggr[element[key]] = processor(element);
		return aggr;
	}, {});
}

const enumerateObjects = (objects, key = 'id', start = 0) => {
	return objects.map((o, i) => ({ ...o, [key]: i + start }));
}

// TODO: move to common/event
const stopPropagation = ev => ev.stopPropagation();

const clamp = (number, min, max) => Math.max(min, Math.min(number, max));

// TODO: columns util, move elsewhere?
const resizeVisibleColumns = (visibleColumns, fractionBias, invert = false, isSecondIteration = false) => {
	const notLastColumn = cp => invert ? cp >= 0 : cp < visibleColumns.length;
	const adjustColumnuPointer = cp => invert ? cp - 1 : cp + 1;

	var columnPointer = invert ? visibleColumns.length -1 : 0;

	while (fractionBias !== 0 && notLastColumn(columnPointer)) {
		const minRemaningFractions = [...visibleColumns]
			.filter((_, index) => index !== columnPointer)
			.map(c => c.minFraction)
			.reduce((tmf, mf) => tmf + mf, 0);
		const maxFraction = 1 - minRemaningFractions;

		const newFraction = clamp(
			visibleColumns[columnPointer].fraction + fractionBias,
			visibleColumns[columnPointer].minFraction,
			maxFraction
		);

		const adjustedFraction = newFraction - visibleColumns[columnPointer].fraction;
		visibleColumns[columnPointer].fraction = newFraction;
		fractionBias -= adjustedFraction;
		columnPointer = adjustColumnuPointer(columnPointer);
	}

	const totalFraction = visibleColumns.reduce((acc, vc) => acc + vc.fraction, 0);
	const overflow = -(1 - totalFraction);

	if(!isSecondIteration && overflow > 0) {
		resizeVisibleColumns(visibleColumns, -overflow, !invert, true);
	}
}

const applyChangesToVisibleColumns = (visibleColumns, allColumns) => {
	visibleColumns.forEach(visibleColumn => {
		const targetColumnIndex = allColumns.findIndex(c => c.field == visibleColumn.field);
		if(targetColumnIndex > -1) {
			allColumns[targetColumnIndex] = visibleColumn;
		}
	});
	return allColumns;
}

const JSONTryParse = (json, fallback = {}) => {
	var output;
	try {
		output = JSON.parse(json);
	} catch(_) {
		output = fallback
	}
	return output;
}

let lastId = 0;

const getUniqueId = (prefix = 'id') => {
    lastId++;
    return `${prefix}${lastId}`;
}

const isLikeURL = identifier => {
	// https://stackoverflow.com/a/3809435, modified to allow up to 9-char TLDs and IP addresses
	const urlRE = /^(https?:\/\/)?([-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,9}\b|((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.|\b)){4})(\S*)$/i;
	return !!identifier.match(urlRE);
}

// https://github.com/zotero/zotero/blob/d3601bba24a83b3930711cc664e8ffad2ee41fd8/chrome/content/zotero/xpcom/utilities.js#L200
const cleanURL = (url, shouldTryHttp = false) => {
	url = url.trim();

	try {
		return (new URL(url)).href;
	} catch(e) {
		if (shouldTryHttp && /\w\.\w/.test(url)) {
			try {
				return (new URL('http://' + url)).href;
			} catch(e) {
				// unable to cleanURL, fall through and return false
			}
		}
	}

	return false;
}

const getScrollContainerPageCount = (itemEl, containerEl) => {
	const containerHeight = containerEl.getBoundingClientRect().height;
	const itemHeight = itemEl.getBoundingClientRect().height;
	return Math.floor(containerHeight / itemHeight);
}

// https://github.com/zotero/zotero/blob/5bb2486040fa1fc617c81b4aea756ba338584f6b/chrome/content/zotero/bindings/itembox.xml#L428-L440
const getDOIURL = doi => 'https://doi.org/'
									// Encode some characters that are technically valid in DOIs,
									// though generally not used. '/' doesn't need to be encoded.
									+  doi.replace(/#/g, '%23')
										.replace(/\?/g, '%3f')
										.replace(/%/g, '%25')
										.replace(/"/g, '%22');

// https://github.com/zotero/zotero/blob/5bb2486040fa1fc617c81b4aea756ba338584f6b/chrome/content/zotero/xpcom/utilities.js#L238-L249
const cleanDOI = doi => {
	if(typeof(doi) != "string") {
		throw new Error("cleanDOI: argument must be a string");
	}

	const doiMatches = doi.match(/10(?:\.[0-9]{4,})?\/[^\s]*[^\s.,]/);
	return doiMatches ? doiMatches[0] : null;
}

const getLibraryKeyFromTopic = topic => {
	if(typeof topic !== 'string') {
		return null;
	}
	const matches = topic.match(/\/(users|groups)\/(\d+)/);
	if(matches) {
		return (matches[1] === 'groups' ? 'g' : 'u') + matches[2];
	}
	return null;
}

const getFieldNameFromSortKey = sortKey => {
	const matchingKeyValuePair = Object.entries(columnProperties)
		.find(([_, properties]) => properties.sortKey === sortKey); // eslint-disable-line no-unused-vars

	if(matchingKeyValuePair) {
		return matchingKeyValuePair[0];
	} else {
		console.warn(`Unrecognized sort key ${sortKey}. Using title instead.`);
		return 'title';
	}
}

const getAbortController = () => typeof(AbortController) === 'function' ? new AbortController() : null;

const getRequestTypeFromItemsSource = itemsSource => {
	switch(itemsSource) {
		case 'query': return 'ITEMS_BY_QUERY';
		case 'trash': return 'TRASH_ITEMS';
		case 'publications': return 'PUBLICATIONS_ITEMS';
		case 'collection': return 'ITEMS_IN_COLLECTION';
		default: case 'top': return 'TOP_ITEMS';
	}
}

const processIdentifierMultipleItems = (items, itemTypes, isUrl = false) => Object.entries(items).map(([key, value]) => ({
	key,
	source: isUrl ? 'url' : 'identifier',
	title: typeof value === 'string' ? value : value.title,
	description: value.description,
	itemType: value.itemType ? ((itemTypes.find(it => it.itemType == value.itemType) || {}).localized || value.itemType) : null
}));

const vec2dist = (a, b) => {
	if(Array.isArray(a) && a.length === 2 && Array.isArray(b) && b.length === 2) {
		const dx = a[0] - b[0], dy = a[1] - b[1];
		return Math.sqrt(dx * dx + dy * dy);
	}
}

const cede = (delay = 0) => new Promise(resolve => setTimeout(resolve, delay));

/* Enables opening a URL in a new tab circumventing popup blockers, including silent popup blocker
in Safari iOS (#452). Should only be called synchroneusly from trusted events (preferable click as
some events don't work in some browsers). New tab is opened immediately to avoid popup blocker,
then, once `getURLPromise` settles, correct URL is loaded into the new tab or, if `getURLPromise`
returns false or throws an error, new tab will be closed. */
const openDelayedURL = getURLPromise => {
	const windowReference = window.open();

	if(!windowReference) {
		throw new Error('Failed to open a window.');
	}

	getURLPromise.then(url => {
		if(url) {
			windowReference.location = url;
		} else {
			windowReference.close();
		}
	});

	getURLPromise.catch(() => windowReference.close());
}

// Avoid crashing when localStorage is missing, see #465
const localStorageWrapper = window.localStorage ?? {
	getItem: () => null,
	setItem: () => undefined,
	removeItem: () => undefined
};

const parseBase64File = encoded => {
	const parts = encoded.split(',');
	const mimeType = parts[0].match(/:(.*?);base64/)?.[1];
	const decodedData = atob(parts[1]);
	const bytes = new Uint8Array(decodedData.length);
	for (var i = 0; i < decodedData.length; i++) {
		bytes[i] = decodedData.charCodeAt(i);
	}
	return { mimeType, bytes };
}

const getNextSibling = (elem, selector) => {
	let sibling = elem.nextElementSibling;

	while (sibling) {
		if (sibling.matches(selector)) {
			return sibling;
		}
		sibling = sibling.nextElementSibling;
	}
};

const getPrevSibling = (elem, selector) => {
	let sibling = elem.previousElementSibling;

	while (sibling) {
		if (sibling.matches(selector)) {
			return sibling;
		}
		sibling = sibling.previousElementSibling;
	}
};

export {
    applyChangesToVisibleColumns,
    cede,
    clamp,
    cleanDOI,
    cleanURL,
    compare,
    compareItem,
    deduplicate,
    deduplicateByHash,
    deduplicateByKey,
    enumerateObjects,
    get,
    getAbortController,
    getDOIURL,
    getFieldNameFromSortKey,
    getItemCanonicalUrl,
    getItemFromCanonicalUrl,
    getLibraryKeyFromTopic,
    getNextSibling,
    getPrevSibling,
    getRequestTypeFromItemsSource,
    getScrollContainerPageCount,
    getSortKeyValue,
    getUniqueId,
    indexByGeneratedKey,
    indexByKey,
    isLikeURL,
    JSONTryParse,
    localStorageWrapper,
    mapRelationsToItemKeys,
    openDelayedURL,
    parseBase64File,
    processIdentifierMultipleItems,
    removeRelationByItemKey,
    resizeVisibleColumns,
    reverseMap,
    sortByKey,
    sortItemsByKey,
    splice,
    stopPropagation,
    transform,
    vec2dist
};
