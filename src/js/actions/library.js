import api from 'zotero-api-client';

import { REQUEST_LIBRARY_SETTINGS, RECEIVE_LIBRARY_SETTINGS, ERROR_LIBRARY_SETTINGS, RESET_LIBRARY,
	REQUEST_UPDATE_LIBRARY_SETTINGS, RECEIVE_UPDATE_LIBRARY_SETTINGS, ERROR_UPDATE_LIBRARY_SETTINGS,
	REQUEST_DELETE_LIBRARY_SETTINGS, RECEIVE_DELETE_LIBRARY_SETTINGS, ERROR_DELETE_LIBRARY_SETTINGS,
	} from '../constants/actions';

const fetchLibrarySettings = libraryKey => {
	return async (dispatch, getState) => {
		const state = getState();
		const config = state.config;

		dispatch({
			type: REQUEST_LIBRARY_SETTINGS,
			libraryKey
		});

		try {
			const response = await api(config.apiKey, config.apiConfig)
				.library(libraryKey)
				.settings()
				.get();

			const settings = response.getData();

			dispatch({
				type: RECEIVE_LIBRARY_SETTINGS,
				libraryKey,
				settings,
				response
			});
			return settings;
		} catch(error) {
			dispatch({
				type: ERROR_LIBRARY_SETTINGS,
				libraryKey,
				error
			});
			throw error;
		}
	};
}

const updateLibrarySettings = (settingsKey, settingsValue, libraryKey) => {
	return async (dispatch, getState) => {
		const state = getState();
		const config = state.config;
		const oldValue = state.libraries?.[libraryKey].settings?.[settingsKey];
		const version = oldValue?.version ?? 0;

		dispatch({
			type: REQUEST_UPDATE_LIBRARY_SETTINGS,
			settingsKey,
			libraryKey
		});
		try {
			const response = await api(config.apiKey, config.apiConfig)
				.library(libraryKey)
				.version(version)
				.settings(settingsKey)
				.put(settingsValue);

			dispatch({
				type: RECEIVE_UPDATE_LIBRARY_SETTINGS,
				settingsKey,
				settingsValue,
				libraryKey,
				response
			});
		} catch(error) {
			dispatch({
				type: ERROR_UPDATE_LIBRARY_SETTINGS,
				settingsKey,
				settingsValue,
				libraryKey,
				error
			});
			throw error;
		}
	};
}

const deleteLibrarySettings = (settingsKey, libraryKey) => {
	return async (dispatch, getState) => {
		const state = getState();
		const config = state.config;

		dispatch({
			type: REQUEST_DELETE_LIBRARY_SETTINGS,
			settingsKey,
			libraryKey
		});
		try {
			const response = await api(config.apiKey, config.apiConfig)
				.library(libraryKey)
				.settings(settingsKey)
				.delete();

			dispatch({
				type: RECEIVE_DELETE_LIBRARY_SETTINGS,
				settingsKey,
				libraryKey,
				response
			});
		} catch(error) {
			dispatch({
				type: ERROR_DELETE_LIBRARY_SETTINGS,
				settingsKey,
				libraryKey,
				error
			});
			throw error;
		}
	};
}

const resetLibrary = libraryKey => {
	return async dispatch => {
		dispatch({
			type: RESET_LIBRARY,
			libraryKey
		});
	};
}

export { deleteLibrarySettings, fetchLibrarySettings, resetLibrary, updateLibrarySettings };
