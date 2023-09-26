import { JSONTryParse, localStorageWrapper, resizeVisibleColumns } from '../utils';
import { PREFERENCES_LOAD, PREFERENCE_CHANGE } from '../constants/actions';
import { preferences as defaultPreferences } from '../constants/defaults';
import { version } from '../../../data/version.json';

const getRestoredColumns = (userColumns, defaultColumns) => defaultColumns.map(defaultColumn => ({
	...defaultColumn,
	fraction: (userColumns.find(uc => uc.field === defaultColumn.field) || defaultColumn).fraction,
	isVisible: (userColumns.find(uc => uc.field === defaultColumn.field) || defaultColumn).isVisible,
}));

const getColumnsWithAttachmentVisible = (userColumns, defaultColumns) =>
	(userColumns.length === defaultColumns.length ? userColumns : getRestoredColumns(userColumns, defaultColumns))
		.map(
			uc => ({ ...uc, isVisible: uc.field === 'attachment' ? true : uc.isVisible })
		);

const getColumnsWithRecalculatedFractions = (userColumns) => {
	const visibleColumns = userColumns.filter(uc => uc.isVisible);
	resizeVisibleColumns(visibleColumns, 0.001, true, false);
	return userColumns;
}


const preferencesLoad = () => {
	var userPreferences = JSONTryParse(localStorageWrapper.getItem('zotero-web-library-prefs'));
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

			// prior to 1.1.2 column resizing could produce preferences with a column that ends up
			// with a negative fraction. To fix this we trigger resizeVisibleColumns with a very
			// small fraction change (0.001) in order to recalculate correct values.
			if(parseInt(major) === 1 && parseInt(minor) <= 1 && parseInt(patch) < 2) {
				if(userPreferences.columns && userPreferences.columns.length) {
					userPreferences = {
						...userPreferences,
						columns: getColumnsWithRecalculatedFractions(userPreferences.columns),
						version
					}
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
					...JSONTryParse(localStorageWrapper.getItem('zotero-web-library-prefs')),
					[name]: value,
					version
				};

				localStorageWrapper.setItem('zotero-web-library-prefs', JSON.stringify(preferences));
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
