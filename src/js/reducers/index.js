import { mapObject } from 'web-common/utils';

import config from './config';
import current from './current';
import device from './device';
import errors from './errors';
import fetching from './fetching';
import groups from './groups';
import identifier from './identifier';
import itemsPublications from './items-publications';
import libraries from './libraries';
import meta from './meta';
import modal from './modal';
import ongoing from './ongoing';
import preferences from './preferences';
import recognize from './recognize';
import query from './query';
import queryAndCollectionsTrash from './query-and-collections-trash';
import secondary from './secondary';
import sources from './sources'
import styles from './styles';
import traffic from './traffic';


const createReducers = (extraReducers = {}) => (state, action) => {
	const nextState = {
		config: config(state?.config, action, state),
		current: current(state?.current, action, state),
		device: device(state?.device, action, state),
		errors: errors(state?.errors, action, state),
		fetching: fetching(state?.fetching, action, state),
		groups: groups(state?.groups, action, state),
		identifier: identifier(state?.identifier, action, state),
		itemsPublications: itemsPublications(state?.itemsPublications, action, state),
		libraries: libraries(state?.libraries, action, state),
		meta: meta(state?.meta, action, state),
		modal: modal(state?.modal, action, state),
		ongoing: ongoing(state?.ongoing, action, state),
		preferences: preferences(state?.preferences, action, state),
		recognize: recognize(state?.recognize, action, state),
		query: query(state?.query, action, state),
		secondary: secondary(state?.secondary, action, state),
		sources: sources(state?.sources, action, state),
		styles: styles(state?.styles, action, state),
		traffic: traffic(state?.traffic, action, state),
		...mapObject(extraReducers, (key, reducer) => [key, reducer(state?.[key], action, state)]),
	}

	return {
		...nextState,
		queryAndCollectionsTrash: queryAndCollectionsTrash(state?.queryAndCollectionsTrash, action, nextState),
	}
}

export default createReducers;
