'use strict';

const { combineReducers } = require('redux');
const { connectRouter } = require('connected-react-router');

module.exports = history => combineReducers({
	collectionCountByLibrary: require('./collection-count-by-library'),
	config: require('./config'),
	current: require('./current'),
	fetching: require('./fetching'),
	groups: require('./groups'),
	itemsPublications: require('./items-publications'),
	libraries: require('./libraries'),
	meta: require('./meta'),
	modal: require('./modal'),
	preferences: require('./preferences'),
	query: require('./query'),
	router: connectRouter(history),
	tagCountByLibrary: require('./tag-count-by-library'),
	viewport: require('./viewport'),
});
