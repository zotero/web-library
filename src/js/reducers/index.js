'use strict';

import { combineReducers } from 'redux';
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

export default history => combineReducers({
	collectionCountByLibrary, config, current, fetching, groups,
	itemsPublications, libraries, meta, modal, preferences, query,
	router: connectRouter(history), styles, tagCountByLibrary,
	viewport,
});
