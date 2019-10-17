'use strict';

const defaultState = {
	version: 0,
	isSynced: true,
	requestsPending: 0,
};

const sync = (state = defaultState, action) => {
	const newState = { ...state };

	if(action.type && action.type.startsWith('REQUEST_')) {
		newState.requestsPending++;
	} else if(action.type && action.type.startsWith('RECEIVE_')) {
		newState.requestsPending--;
		if(action.response && action.response.response) {
			newState.version = action.response.getVersion() || state.version;
		}
	} else if(action.type && action.type.startsWith('ERROR_')) {
		newState.requestsPending--;
		if(action.error && action.error.response && action.error.response.status === 412) {
			newState.isSynced = false;
		}
	}
	return newState;
};

export default sync;
