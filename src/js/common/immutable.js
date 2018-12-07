'use strict';

const removeKeys = (object, deleteKeys) => {
	if(!Array.isArray(deleteKeys)) {
		deleteKeys = [deleteKeys];
	}

	return Object.entries(object)
		.reduce((aggr, [key, value]) => {
			if(!deleteKeys.includes(key)) { aggr[key] = value; }
			return aggr;
	}, {});
}

//@TODO: rename everywhere
const omit = removeKeys;

module.exports = { removeKeys, omit };
