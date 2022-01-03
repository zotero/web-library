import { JSONTryParse } from '../utils';
import { PREFERENCES_LOAD, PREFERENCE_CHANGE } from '../constants/actions';
import { preferences as defaultPreferences, version } from '../constants/defaults';

const getRestoredColumns = (userColumns, defaultColumns) => defaultColumns.map(defaultColumn => ({
	...defaultColumn,
	fraction: (userColumns.find(uc => uc.field === defaultColumn.field) || defaultColumn).fraction,
	isVisible: (userColumns.find(uc => uc.field === defaultColumn.field) || defaultColumn).isVisible,
}));

const getColumnsWithAttachmentVisible = (userColumns, defaultColumns) =>
	getRestoredColumns(userColumns, defaultColumns).map(
		uc => ({ ...uc, isVisible: uc.field === 'attachment' ? true : uc.isVisible })
	);


const preferencesLoad = () => {
	var userPreferences = JSONTryParse(localStorage.getItem('zotero-web-library-prefs'));
	var preferences;
	try {
		if(userPreferences && userPreferences.version !== version) {
			if(!('version' in userPreferences)) {
				throw new Error('Detected pre 1.0 preferences, resetting');
			}
			const [major, minor, patchRelease] = userPreferences.version.split('.');
			const [patch, release] = patchRelease.split('-'); // eslint-disable-line no-unused-vars

			// before 1.0.9 we did not have 'more' columns
			if(parseInt(major) === 1 && parseInt(minor) === 0 && parseInt(patch) < 9) {
				userPreferences = {
					...userPreferences,
					columns: getRestoredColumns(userPreferences.columns, defaultPreferences.columns),
					version
				}
			}
			// prior 1.0.27 "attachment" column was hidden by default, switch on for everybody whose
			// preferences have been created prior to that version
			if(parseInt(major) === 1 && parseInt(minor) === 0 && parseInt(patch) < 27) {
				userPreferences = {
					...userPreferences,
					columns: getColumnsWithAttachmentVisible(userPreferences.columns, defaultPreferences.columns),
					version
				}
			}
		}
		preferences = { ...defaultPreferences,...userPreferences };
	} catch(e) {
		console.error('Preferences from localStorage appear to be corrupted.');
		preferences = { ...defaultPreferences };
	}

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
					[name]: value,
					version
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

const restoreColumnsOrder = () => {
	return async (dispatch, getState) => {
		const userColumns = getState().preferences.columns;
		const columns = getRestoredColumns(userColumns, defaultPreferences.columns);
		await dispatch(preferenceChange('columns', columns));
	}
}

const addCitationStyle = ({ name, title} = {}) => {
	return async (dispatch, getState) => {


		const newInstalledCitationStyles = [
			...(getState().preferences.installedCitationStyles || []),
			{ name, title }
		];

		return await dispatch(preferenceChange('installedCitationStyles', newInstalledCitationStyles));
	}
}

const deleteCitationStyle = styleName => {
	return async (dispatch, getState) => {

		const newInstalledCitationStyles = (getState().preferences.installedCitationStyles || []).filter(
			c => c.name !== styleName
		);

		return await dispatch(preferenceChange('installedCitationStyles', newInstalledCitationStyles));
	}
}

export {
	addCitationStyle,
	deleteCitationStyle,
	preferenceChange,
	preferencesLoad,
	restoreColumnsOrder,
};
