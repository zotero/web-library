'use strict';

import { combineReducers } from 'redux';
import reduceReducers from 'reduce-reducers';
import { connectRouter } from 'connected-react-router';

import collectionCountByLibrary from './collection-count-by-library';
import config from './config';
import current from './current';
import fetching from './fetching';
import groups from './groups';
import itemsPublications from './items-publications';
import libraries from './libraries';
import meta from './meta';
import modal from './modal';
import preferences from './preferences';
import query from './query';
import styles from './styles';
import tagCountByLibrary from './tag-count-by-library';
import viewport from './viewport';
import { LOCATION_CHANGE } from 'connected-react-router';

function crossSliceReducers(state = {}, action) {
	switch(action.type) {
		case LOCATION_CHANGE:
			return {
				...state,
				current: current(state.current, action, { config: state.config })
			}
		default:
			return state;
	}
}

export default history => reduceReducers(crossSliceReducers, combineReducers({
		collectionCountByLibrary, config, current, fetching, groups,
		itemsPublications, libraries, meta, modal, preferences, query,
		router: connectRouter(history), styles, tagCountByLibrary,
		viewport,
	}));
