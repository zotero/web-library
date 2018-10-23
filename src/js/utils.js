'use strict';

const { columnMinWidthFraction } = require('./constants/defaults');

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

const deduplicateByKey = (array, key) => {
	const seen = [];
	let i = array.length;
	let removedCounter = 0;

	while(i--) {
		if(seen.includes(array[i][key])) {
			array.splice(i, 1);
			removedCounter++;
		}
		seen.push(array[i][key]);
	}

	return removedCounter;
};

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

const isUndefinedOrNull = value => typeof value === 'undefined' || value === null;

const sortByKey = (items, key, direction) => {
	items.sort((a, b) => {
		if(isUndefinedOrNull(a[key]) && isUndefinedOrNull(b[key])) {
			return 0;
		}

		if(typeof a[key] !== typeof b[key]) {
			if(isUndefinedOrNull(a[key])) {
				return direction === 'asc' ? 1 : -1;
			}
			if(isUndefinedOrNull(b[key])) {
				return direction === 'asc' ? -1 : 1;
			}
		}

		switch(typeof a[key]) {
			case 'string':
				return direction === 'asc' ?
					a[key].toUpperCase().localeCompare(b[key].toUpperCase()):
					b[key].toUpperCase().localeCompare(a[key].toUpperCase());
			case 'number':
				return direction === 'asc' ? a[key] - b[key] : b[key] - a[key];
			default:
				return 0;
		}
	});
};

const indexByGeneratedKey = (elements, keygenerator, processor = e => e) => {
	return elements.reduce((aggr, element) => {
		aggr[keygenerator(element)] = processor(element);
		return aggr;
	}, {});
}

const indexByKey = (elements, key, processor = e => e) => {
	return elements.reduce((aggr, element) => {
		aggr[element[key]] = processor(element);
		return aggr;
	}, {});
}

const enumerateObjects = (objects, key = 'id', start = 0) => {
	return objects.map((o, i) => ({ ...o, [key]: i + start }));
}

const noop = () => {};

// @TODO: columns util, move elsewhere?
const resizeVisibleColumns = (columns, fractionBias, invert = false) => {
	const visibleColumns = columns.filter(c => c.isVisible);
	const isLastColumn = cp => invert ? cp === 0 : cp === visibleColumns.length - 1;
	const adjustColumnuPointer = cp => invert ? cp - 1 : cp + 1;

	var columnPointer = invert ? visibleColumns.length -1 : 0;

	while (fractionBias != 0 && !isLastColumn(columnPointer)) {
		const newFraction = Math.max(
			visibleColumns[columnPointer].fraction + fractionBias,
			columnMinWidthFraction
		);
		const adjustedFraction = newFraction - visibleColumns[columnPointer].fraction;
		visibleColumns[columnPointer].fraction = newFraction;
		fractionBias -= adjustedFraction;
		columnPointer = adjustColumnuPointer(columnPointer);
	}
}

// close-enough approximation
// see: https://stackoverflow.com/questions/25582882/javascript-math-random-normal-distribution-gaussian-bell-curve
const gaussianRand = () => {
  var rand = 0;

  for (var i = 0; i < 6; i += 1) {
    rand += Math.random();
  }

  return rand / 6;
};

const gaussianRandom = (start, end) => Math.floor(start + gaussianRand() * (end - start + 1));

const JSONTryParse = (json, fallback = {}) => {
	var output;
	try {
		output = JSON.parse(json);
	} catch(_) {
		output = fallback
	}
	return output;
}

module.exports = {
	deduplicate,
	deduplicateByKey,
	enumerateObjects,
	gaussianRandom,
	get,
	indexByGeneratedKey,
	indexByKey,
	JSONTryParse,
	mapRelationsToItemKeys,
	noop,
	removeRelationByItemKey,
	resizeVisibleColumns,
	reverseMap,
	sortByKey,
	splice,
	transform,
};
