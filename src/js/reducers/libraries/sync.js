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
		if('responses' in action && action.responses && action.responses.length) {
			newState.version = (action.responses.reduce((curMax, response) =>
				response.getVersion() > curMax.getVersion() ? response : curMax, action.responses[0])
			).getVersion();
		} else if(action.response && action.response.getVersion && typeof(action.response.getVersion()) === 'number' && !Number.isNaN(action.response.getVersion())) {
			newState.version = Math.max(action.response.getVersion(), state.version);
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
