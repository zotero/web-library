'use strict';

const memoize = require('memoize-one');
const deepEqual = require('deep-equal');

const _makeChildMap = collections => {
	return collections.reduce((aggr, col) => {
		if(!col.parentCollection) {
			return aggr;
		}
		if(!(col.parentCollection in aggr)) {
			aggr[col.parentCollection] = [];
		}
		aggr[col.parentCollection].push(col.key);
		return aggr;
	}, {});
}

const makeChildMap = memoize(_makeChildMap, deepEqual);

module.exports = { makeChildMap };
