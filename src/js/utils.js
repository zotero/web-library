'use strict';

const { columnMinWidthFraction } = require('./constants/defaults');

/**
 * Marks collections as selected/open based on current path
 * @param  {Array} collections Flat list of collections
 * @param  {Array} path        A list of keys containing currently selected collection
 *                             and all of its parents in reverse order (i.e. selected
 *                             collection key is the last element of the array)
 * @return {Array}             Flat list of collections annotated with isSelected
 *                             and isOpen properties
 */
const applyPathToCollections = (collections, path) => {
	return collections.map(c => {
		let index = path.indexOf(c.key);
		c.isSelected = index >= 0 && index === path.length - 1;
		if(index >= 0 && index < path.length - 1) {
			c.isOpen = true;
		} else if(index !== -1) {
			c.isOpen = false;
		}

		return c;
	});
};

const enhanceCollections = (collections, path = []) => {
	var childMap = {};
	collections.forEach(col => {
		if(col.parentCollection) {
			if(!(col.parentCollection in childMap)) {
				childMap[col.parentCollection] = [];
			}
			childMap[col.parentCollection].push(col.key);
		}
	});

	collections.forEach(col => {
		col.hasChildren = col.key in childMap;
		col.children = childMap[col.key] || [];
	});

	return applyPathToCollections(collections, path);
};

/**
 * Returns a unique compund key for item/collection
 * or splits a compound key into individual bits
 */
const ck = (itemOrCollectionKey, libraryKey) => {
	return itemOrCollectionKey + libraryKey;
};

const uck = (coumpoundKey) => {
	//eslint-disable-next-line no-unused-vars
	const [ _, key, libraryKey ] = coumpoundKey.match(/^([A-Z0-9]+)((u|g)\d+)$/);
	return [ key, libraryKey ];
}

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

const without = (array, deleteValues) => {
	if(!Array.isArray(deleteValues)) {
		deleteValues = [deleteValues];
	}

	return array.filter(value => !deleteValues.includes(value))

	// for (let deleteValue of deleteValues) {
	// 	let pos = array.indexOf(deleteValue);
	// 	if(pos > -1) {
	// 		array = [...array.slice(0, pos), ...array.slice(pos+1)];
	// 	}
	// }

	// return array;
};

const deduplicateByKey = (array, key) => {
	return array.slice()
	.sort(function(a, b) {
		return a[key] > b[key];
	})
	.reduce(function(a, b) {
		if ((a.slice(-1)[0] && a.slice(-1)[0][key]) !== b[key]) {
			a.push(b);
		}
		return a;
	},[]);
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

module.exports = {
	ck,
	deduplicateByKey,
	enhanceCollections,
	get,
	mapRelationsToItemKeys,
	noop,
	removeRelationByItemKey,
	resizeVisibleColumns,
	reverseMap,
	sortByKey,
	splice,
	transform,
	uck,
	without,
};
