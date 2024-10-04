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

const getKeyOrSymbolKey = key => {
	const symbolMatch = key.match(/@@(.*)@@/);
	if (symbolMatch) {
		return Symbol.for(symbolMatch[1]);
	}
	return key;
}

function getPatchedState(state, path, patch) {
	const pathParts = path.split('.')
	if (pathParts.length === 1) {
		const key = getKeyOrSymbolKey(path);
		return { ...state, [key]: { ...state[key], ...patch } };
	} else {
		const key = getKeyOrSymbolKey(pathParts[0]);
		return { ...state, [key]: getPatchedState(state[key], pathParts.slice(1).join('.'), patch) };
	}
}

function getStateWithout(state, path) {
	const pathParts = path.split('.')
	if (pathParts.length === 1) {
		const newState = { ...state };
		delete newState[path];
		return newState;
	} else {
		return { ...state, [pathParts[0]]: getStateWithout(state[pathParts[0]], pathParts.slice(1).join('.')) };
	}
}

function getPachtedStateMultiple(state, patches) {
	return patches.reduce((state, [path, patch]) => getPatchedState(state, path, patch), state);
}

function getPatchedStateArray(state, path, index, patch) {
	const pathParts = path.split('.')
	let obj = state;
	for (const part of pathParts) {
		obj = obj[part];
	}
	const originalArray = obj;
	const patchedEntry = { ...originalArray[index], ...patch };
	const newArray = originalArray.toSpliced(index, 1, patchedEntry);
	return getPatchedState(state, pathParts.slice(0, -1).join('.'), { [pathParts[pathParts.length - 1]]: newArray });
}


export { stateProcessSymbols, stateToJSON, JSONtoState, getPatchedState, getPachtedStateMultiple, getPatchedStateArray, getStateWithout };
