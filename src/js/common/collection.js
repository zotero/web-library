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

export { makeChildMap };
