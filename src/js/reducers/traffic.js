// allow maximum of 10 requests of the same type within 5 seconds rolling window
// const requestOfTypeTrackCount = 10;
// const requestOfTypeDuration =  5 * 1000; //in ms


const traffic = (state = {}, action) => {
	if(action.type && action.type.startsWith('REQUEST_')) {
		const requestName = action.type.slice(8);

		return {
			...state,
			[requestName]: {
				...(state[requestName] || {}),
				lastRequest: Date.now()
			}
		}
	} else if(action.type && action.type.startsWith('ERROR_')) {
		const requestName = action.type.slice(6);
		return {
			...state,
			[requestName]: {
				...(state[requestName] || {}),
				lastError: Date.now(),
				errorCount: ((state[requestName] || {}).errorCount || 0) + 1
			}
		}
	} else if(action.type && action.type.startsWith('RECEIVE_')) {
		const requestName = action.type.slice(8);
		return {
			...state,
			[requestName]: {
				...(state[requestName] || {}),
				lastSuccess: Date.now(),
				errorCount: 0
			}
		}
	}

	return state;
};

export default traffic;
