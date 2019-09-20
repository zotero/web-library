'use strict';

import combineSectionReducers from 'combine-section-reducers';
import { connectRouter } from 'connected-react-router';

import collectionCountByLibrary from './collection-count-by-library';
import config from './config';
import current from './current';
import errors from './errors';
import fetching from './fetching';
import groups from './groups';
import identifier from './identifier';
import itemsPublications from './items-publications';
import libraries from './libraries';
import meta from './meta';
import modal from './modal';
import preferences from './preferences';
import query from './query';
import sources from './sources'
import styles from './styles';
import viewport from './viewport';
import userType from './user-type';


export default history => combineSectionReducers({
	collectionCountByLibrary, config, current, errors, fetching, groups,
	identifier, itemsPublications, libraries, meta, modal, preferences, query,
	router: connectRouter(history), sources, styles, viewport, userType,
});
