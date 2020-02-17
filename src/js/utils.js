'use strict';

import baseMappings from 'zotero-base-mappings';
import columnProperties from './constants/column-properties';
import { noteAsTitle } from './common/format';

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

const get = (src, path, fallback) => {
	if(src === null) {
		return fallback;
	}
	if(!path || !path.length) {
		return src;
	}

	const parts = Array.isArray(path) ? path : path.split('.');

	var obj = src;
	var i, ii;

	for(i = 0, ii = parts.length; i < ii; i++) {
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

const mapRelationsToItemKeys = (relations, userId, relationType='dc:relation') => {
	if(!('dc:relation' in relations)) {
		return [];
	}
	var relatedUrls = Array.isArray(relations[relationType]) ? relations[relationType] : [relations[relationType]];
	return relatedUrls.map(relatedUrl => {
		let match = relatedUrl.match(`https?://zotero.org/users/${userId}/items/([A-Z0-9]{8})`);
		return match ? match[1] : null;
	});
};

const removeRelationByItemKey = (itemKey, relations, userId, relationType='dc:relation') => {
	let relatedItemKeys = mapRelationsToItemKeys(relations, userId, relationType);
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

const getSortKeyForItemType = (sortKey, itemType) => {
	return itemType in baseMappings && sortKey in baseMappings[itemType] ?
		baseMappings[itemType][sortKey] : sortKey;
}

const getSortKeyValue = (item, sortBy = 'title') => {
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

	const sortKey = getSortKeyForItemType(sortBy, item.itemType);
	return item[sortKey];
}



const compareItem = (itemA, itemB, sortBy) => {
	var a = getSortKeyValue(itemA, sortBy);
	var b = getSortKeyValue(itemB, sortBy);

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

const sortItemsByKey = (items, key, direction = 'asc', getItem = item => item) => {
	items.sort((a, b) => direction === 'asc' ?
			compareItem(getItem(a), getItem(b), key) :
			compareItem(getItem(a), getItem(b), key) * -1
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

const noop = () => {};

const stopPropagation = ev => ev.stopPropagation();

// @TODO: columns util, move elsewhere?
const resizeVisibleColumns = (visibleColumns, fractionBias, invert = false) => {
	const isLastColumn = cp => invert ? cp === 0 : cp === visibleColumns.length - 1;
	const adjustColumnuPointer = cp => invert ? cp - 1 : cp + 1;

	var columnPointer = invert ? visibleColumns.length -1 : 0;

	while (fractionBias !== 0 && !isLastColumn(columnPointer)) {
		const newFraction = Math.max(
			visibleColumns[columnPointer].fraction + fractionBias,
			visibleColumns[columnPointer].minFraction
		);
		const adjustedFraction = newFraction - visibleColumns[columnPointer].fraction;
		visibleColumns[columnPointer].fraction = newFraction;
		fractionBias -= adjustedFraction;
		columnPointer = adjustColumnuPointer(columnPointer);
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

const getScrollbarWidth = () => {
	if(process.env.NODE_ENV === 'test') {
		return 0;
	}
	const scrollDiv = document.createElement('div');
	scrollDiv.className = 'modal-scrollbar-measure';
	document.body.appendChild(scrollDiv);
	const scrollbarWidth = scrollDiv.getBoundingClientRect().width - scrollDiv.clientWidth;
	document.body.removeChild(scrollDiv);
	return scrollbarWidth;
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

const loadJs = async path => {
	return new Promise((resolve, reject) => {
		const script = document.createElement('script');
		script.onload = resolve;
		script.onerror = reject;
		script.src = path;
		document.head.appendChild(script);
	});
}

const openAttachment = (key, getAttachmentUrl, isNewTab = false) => {
	const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
	isChrome || !isNewTab ?
		openAttachmentSimple(key, getAttachmentUrl, isNewTab) :
		openAttachmentBlockerWorkaround(key, getAttachmentUrl);
}

const openAttachmentSimple = async (key, getAttachmentUrl, isNewTab = false) => {
	const url = await getAttachmentUrl(key, getAttachmentUrl);
	isNewTab ? window.open(url) : window.location = url;
}

const openAttachmentBlockerWorkaround = (key, getAttachmentUrl) => {
	const pollInterval = 100;
	const checks = [];
	let checkTime = pollInterval;
	let url;

	const promise = getAttachmentUrl(key).then(obtainedUrl => url = obtainedUrl);

	const openIfReady = () => {
		if(url) {
			window.open(url);
			checks.forEach(check => clearTimeout(check))
		}
	}

	while(checkTime < 1000) {
		checks.push(setTimeout(openIfReady, checkTime));
		checkTime += pollInterval
	}

	// this last-resort check is guaranteed to trigger a popup blocker
	checks.push(setTimeout(() => {
		promise.then(url => window.open(url));
	}, checkTime));
}

const scrollIntoViewIfNeeded = (element, container, opts = {}) => {
	const containerTop = container.scrollTop;
	const containerBottom = containerTop + container.clientHeight;
	const elementTop = element.offsetTop;
	const elementBottom = elementTop + element.clientHeight;

	if(elementTop < containerTop || elementBottom > containerBottom) {
		const before = container.scrollTop;
		element.scrollIntoView(opts);
		const after = container.scrollTop;
		return after - before;
	}
	return 0;
}

export {
	applyChangesToVisibleColumns,
	compare,
	compareItem,
	deduplicate,
	deduplicateByHash,
	deduplicateByKey,
	enumerateObjects,
	get,
	getItemCanonicalUrl,
	getScrollbarWidth,
	getSortKeyValue,
	getUniqueId,
	indexByGeneratedKey,
	indexByKey,
	isLikeURL,
	JSONTryParse,
	loadJs,
	mapRelationsToItemKeys,
	noop,
	openAttachment,
	removeRelationByItemKey,
	resizeVisibleColumns,
	reverseMap,
	scrollIntoViewIfNeeded,
	sortByKey,
	sortItemsByKey,
	splice,
	stopPropagation,
	transform,
};
