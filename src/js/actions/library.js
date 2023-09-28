import api from 'zotero-api-client';

import { requestTracker } from '.';
import { REQUEST_LIBRARY_SETTINGS, RECEIVE_LIBRARY_SETTINGS, ERROR_LIBRARY_SETTINGS, RESET_LIBRARY,
	REQUEST_UPDATE_LIBRARY_SETTINGS, RECEIVE_UPDATE_LIBRARY_SETTINGS, ERROR_UPDATE_LIBRARY_SETTINGS,
	REQUEST_DELETE_LIBRARY_SETTINGS, RECEIVE_DELETE_LIBRARY_SETTINGS, ERROR_DELETE_LIBRARY_SETTINGS,
	PRE_UPDATE_LIBRARY_SETTINGS, CANCEL_UPDATE_LIBRARY_SETTINGS } from '../constants/actions';

const fetchLibrarySettings = (libraryKey, settingsKey) => {
	return async (dispatch, getState) => {
		const state = getState();
		const config = state.config;

		dispatch({
			type: REQUEST_LIBRARY_SETTINGS,
			settingsKey,
			libraryKey
		});

		try {
			try {
				const response = await api(config.apiKey, config.apiConfig)
					.library(libraryKey)
					.settings(settingsKey)
					.get();

				const { value, version } = response.getData();
				dispatch({
					type: RECEIVE_LIBRARY_SETTINGS,
					libraryKey,
					settingsKey,
					value,
					version,
					response
				});
				return value;
			} catch(error) {
				// 404 is a valid response for a library that has no settingsKey
				if(error?.response?.status === 404) {
					dispatch({
						type: RECEIVE_LIBRARY_SETTINGS,
						libraryKey,
						settingsKey,
						value: null,
						version: 0,
						response: error.response
					});
					return null;
				}
				throw error;
			}
		} catch(error) {
			dispatch({
				type: ERROR_LIBRARY_SETTINGS,
				libraryKey,
				settingsKey,
				error
			});
			throw error;
		}
	};
}


const updateLibrarySettings = (settingsKey, value, libraryKey = null) => {
	return async (dispatch, getState) => {
		libraryKey = libraryKey ?? getState().current.libraryKey;
		const id = requestTracker.id++;

		return new Promise((resolve, reject) => {
			dispatch({
				type: PRE_UPDATE_LIBRARY_SETTINGS,
				settingsKey,
				value,
				libraryKey
			});

			dispatch(
				queueUpdateLibrarySettings(settingsKey, value, libraryKey, { resolve, reject, id })
			);
		});
	};
}

const queueUpdateLibrarySettings = (settingsKey, value, libraryKey, { resolve, reject, id }) => {
	return {
		queue: `${libraryKey}:${settingsKey}`, // independent queue for each library/settingsKey pair, does not block libraryKey queue
		callback: async (next, dispatch, getState) => {
			const state = getState();
			const config = state.config;
			const oldValue = state.libraries?.[libraryKey].settings?.entries?.[settingsKey];
			const version = oldValue?.version ?? 0;

			if(oldValue?.value === value) {
				dispatch({
					type: CANCEL_UPDATE_LIBRARY_SETTINGS,
					settingsKey,
					value,
					libraryKey,
					id
				});
				resolve();
				next();
				return;
			}

			dispatch({
				type: REQUEST_UPDATE_LIBRARY_SETTINGS,
				settingsKey,
				value,
				libraryKey,
				id
			});
			try {
				const response = await api(config.apiKey, config.apiConfig)
					.library(libraryKey)
					.version(version)
					.settings(settingsKey)
					.put({ value });


				dispatch({
					type: RECEIVE_UPDATE_LIBRARY_SETTINGS,
					settingsKey,
					value,
					version: response.getVersion(),
					libraryKey,
					response,
					id
				});
				resolve();
			} catch(error) {
				dispatch({
					type: ERROR_UPDATE_LIBRARY_SETTINGS,
					settingsKey,
					value,
					libraryKey,
					error
				});
				reject(error);
				throw error;
			} finally {
				next();
			}
		}
	}
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
