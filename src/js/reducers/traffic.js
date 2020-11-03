const traffic = (state = {}, action) => {
	if(action.type && action.type.startsWith('REQUEST_')) {
		const requestName = action.type.slice(8);

		return {
			...state,
			[requestName]: {
				...(state[requestName] || {}),
				lastRequest: Date.now(),
				ongoing: [...(((state[requestName] || {}).ongoing || [])), action.id].filter(Boolean)
			}
		}
	} else if(action.type && action.type.startsWith('ERROR_')) {
		const requestName = action.type.slice(6);
		return {
			...state,
			[requestName]: {
				...(state[requestName] || {}),
				lastError: Date.now(),
				errorCount: ((state[requestName] || {}).errorCount || 0) + 1,
				ongoing: (((state[requestName] || {}).ongoing || [])).filter(id => id !== action.id)
			}
		}
	} else if(action.type && action.type.startsWith('RECEIVE_')) {
		const requestName = action.type.slice(8);
		return {
			...state,
			[requestName]: {
				...(state[requestName] || {}),
				lastSuccess: Date.now(),
				errorCount: 0,
				ongoing: (((state[requestName] || {}).ongoing || [])).filter(id => id !== action.id)
			}
		}
	} else if(action.type && action.type.startsWith('DROP_')) {
		const requestName = action.type.slice(5);
		return {
			...state,
			[requestName]: {
				...(state[requestName] || {}),
				lastDrop: Date.now(),
				ongoing: (((state[requestName] || {}).ongoing || [])).filter(id => id !== action.id)
			}
		}
	}

	return state;
};

export default traffic;
