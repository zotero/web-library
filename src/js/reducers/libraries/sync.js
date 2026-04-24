import {
	BEGIN_CATCHUP,
	COMPLETE_CATCHUP,
	STREAMING_REMOTE_LIBRARY_UPDATE,
	UPDATE_CATCHUP_TARGET,
} from '../../constants/actions';

const defaultState = {
	version: 0,
	isSynced: true,
	requestsPending: 0,
	isCatchingUp: false,
	pendingTarget: null,
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

		if(typeof action.error?.response?.getVersion?.() !== 'undefined') {
			newState.version = Math.max(action.error.response.getVersion(), state.version);
		}

		if(action.error?.response?.status === 412) {
			newState.isSynced = false;
		}
	} else if(action.type && action.type.startsWith('DROP_')) {
		newState.requestsPending--;
	} else if(action.type === STREAMING_REMOTE_LIBRARY_UPDATE) {
		newState.version = Math.max(action.version, state.version);
	} else if(action.type === BEGIN_CATCHUP) {
		newState.isCatchingUp = true;
		newState.pendingTarget = null;
	} else if(action.type === COMPLETE_CATCHUP) {
		newState.isCatchingUp = false;
	} else if(action.type === UPDATE_CATCHUP_TARGET) {
		newState.pendingTarget = Math.max(state.pendingTarget ?? 0, action.version);
	}
	return newState;
};

export default sync;
