import memoize from 'memoize-one';
import deepEqual from 'deep-equal';

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

const getDescendants = (collectionKey, childMap, keys = []) => {
	if(!(collectionKey in childMap)) {
		return keys;
	}
	for(let childKey of childMap[collectionKey]) {
		keys.push(childKey);
		getDescendants(childKey, childMap, keys);
	}
	return keys;
}

export { makeChildMap, getDescendants };
