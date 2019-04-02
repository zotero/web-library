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
	return async (dispatch) => {
		await (new Promise(resolve => {
			setTimeout(() => {
				const preferences = {
					...defaultPreferences,
					...JSONTryParse(localStorage.getItem('zotero-web-library-prefs')),
					[name]: value
				};

				localStorage.setItem('zotero-web-library-prefs', JSON.stringify(preferences));
				resolve();
			}, 0)
		}));

		return dispatch({
			type: PREFERENCE_CHANGE,
			name,
			value
		});
	}
}

export {
	preferencesLoad,
	preferenceChange,
};
