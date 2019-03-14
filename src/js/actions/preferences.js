'use strict';

const { JSONTryParse } = require('../utils');
const {
	PREFERENCES_LOAD,
	PREFERENCE_CHANGE,
} = require('../constants/actions');
const { preferences: defaultPreferences } = require('../constants/defaults');

const preferencesLoad = () => {
	const preferences = {
		...defaultPreferences,
		...JSONTryParse(localStorage.getItem('zotero-web-library-prefs'))
	};

	return {
		type: PREFERENCES_LOAD,
		preferences
	};
}

const preferenceChange = (name, value) => {
	const preferences = {
		...defaultPreferences,
		...JSONTryParse(localStorage.getItem('zotero-web-library-prefs')),
		[name]: value
	};

	localStorage.setItem('zotero-web-library-prefs', JSON.stringify(preferences));

	return {
		type: PREFERENCE_CHANGE,
		name,
		value
	};
}

module.exports = {
	preferencesLoad,
	preferenceChange,
};
