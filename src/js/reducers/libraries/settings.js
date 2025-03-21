import { omit } from 'web-common/utils';

import {
	REQUEST_LIBRARY_SETTINGS, RECEIVE_LIBRARY_SETTINGS, RECEIVE_UPDATE_LIBRARY_SETTINGS, RECEIVE_DELETE_LIBRARY_SETTINGS,
} from '../../constants/actions';

const settings = (state = {}, action) => {
	switch(action.type) {
		case REQUEST_LIBRARY_SETTINGS:
			return {
				entries: {
					...state.entries,
					[action.settingsKey]: {
						isFetching: true
					}
				}
			}
		case RECEIVE_LIBRARY_SETTINGS:
			return {
				entries: {
					...state.entries,
					[action.settingsKey]: {
						value: action.value,
						version: action.version,
						isFetching: false
					}
				}
			}
		case RECEIVE_UPDATE_LIBRARY_SETTINGS:
			return {
				...state,
				entries: {
					...state.entries,
					[action.settingsKey]: {
						...state.entries[action.settingsKey],
						value: action.value,
						version: action.version
					}
				}
			}
		case RECEIVE_DELETE_LIBRARY_SETTINGS:
			return {
				...state,
				entries: omit(state.entries ?? {}, action.settingsKey)
			}
		default:
			return state;
	}
};

export default settings;
