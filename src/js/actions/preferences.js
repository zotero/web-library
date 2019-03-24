'use strict';

import { JSONTryParse } from '../utils';
import { PREFERENCES_LOAD, PREFERENCE_CHANGE } from '../constants/actions';
import { preferences as defaultPreferences } from '../constants/defaults';

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

export {
	preferencesLoad,
	preferenceChange,
};
