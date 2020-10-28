import combineSectionReducers from 'combine-section-reducers';
import { connectRouter } from 'connected-react-router';

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
import query from './query';
import sources from './sources'
import styles from './styles';
import traffic from './traffic';


export default history => combineSectionReducers({ config, current, device, errors, fetching,
	groups, identifier, itemsPublications, libraries, meta, modal, ongoing, preferences, query,
	router: connectRouter(history), sources, styles, traffic });
