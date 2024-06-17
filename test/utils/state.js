function stateProcessSymbols(state) {
	if (Array.isArray(state)) {
		return state.map(stateProcessSymbols);
	} else if (typeof state === 'object' && state !== null) {
		const newState = { ...state };
		Object.getOwnPropertySymbols(state).forEach(s => {
			newState['@@' + Symbol.keyFor(s) + '@@'] = state[s];
			delete newState[s];
		});

		Object.keys(newState)
			.forEach(k => newState[k] = stateProcessSymbols(newState[k]));
		return newState;
	} else {
		return state;
	}
}

function stateProcessSymbolsReverse(state) {
	if (Array.isArray(state)) {
		return state.map(stateProcessSymbolsReverse);
	} else if (typeof state === 'object' && state !== null) {
		const newState = { ...state };

		Object.keys(newState)
			.forEach(k => newState[k] = stateProcessSymbolsReverse(newState[k]));

		Object.keys(newState)
			.filter(k => k.startsWith('@@') && k.endsWith('@@'))
			.forEach(k => {
				const s = Symbol.for(k.slice(2, -2));
				newState[s] = state[k];
				delete newState[k];
			});

		return newState;
	} else {
		return state;
	}
}

function stateToJSON(state) {
	return JSON.stringify(stateProcessSymbols(state));
}

function JSONtoState(json) {
	if (typeof json === 'string') {
		json = JSON.parse(json);
	}
	return stateProcessSymbolsReverse(json);
}

function getPatchedState(state, path, patch) {
	const pathParts = path.split('.')
	if (pathParts.length === 1) {
		return { ...state, [path]: { ...state[path], ...patch } };
	} else {
		return { ...state, [pathParts[0]]: getPatchedState(state[pathParts[0]], pathParts.slice(1).join('.'), patch) };
	}
}


export { stateToJSON, JSONtoState, getPatchedState };
