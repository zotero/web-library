
import { get, localStorageWrapper } from '../utils';
import { ABORT_REQUEST, CONNECTION_ISSUES } from '../constants/actions';

const requestsWaiting = {};
const requestSchedule = [1, 2, 5, 10, 20, 30, 40, 50, 60];
var requestTracker = { id: 1 };

const runRequest = async (dispatch, request, { id, type, payload }, requestOpts = {}) => {
	try {
		const outcome = await request(requestOpts);
		dispatch({
			type: `RECEIVE_${type}`,
			...payload, id,
			...outcome
		});
		return outcome;
	} catch(error) {
		if(error && (error.name === 'AbortError' || error.message === 'aborted')) {
			dispatch({
				type: `DROP_${type}`,
				...payload, id,
				reason: 'abort',
				error
			});
		} else {
			console.error(error);
			dispatch({
				type: `ERROR_${type}`,
				...payload, id,
				silent: true,
				error
			});
		}
	} finally {
		delete requestTracker[id];
	}
}

const dropRequest = (dispatch, type) => {
	const { id, payload, timeout, resolve } = requestsWaiting[type];

	dispatch({
		type: `DROP_${type}`,
		reason: 'backoff',
		...payload, id
	});
	clearTimeout(timeout);
	delete requestsWaiting[type];
	// Release the waiting caller; the outcome is "dropped", i.e. undefined.
	resolve(undefined);
}

const runRequestWaiting = type => {
	return async (dispatch, getState) => {
		if(!(type in requestsWaiting)) {
			return;
		}
		const state = getState();
		const lastError = get(state, ['traffic', type, 'lastError']);
		const errorCount = get(state, ['traffic', type, 'errorCount'], 0);

		const requestScheduleIndex = Math.min(requestSchedule.length - 1, errorCount);
		const nextRequestDelay = requestSchedule[requestScheduleIndex] * 1000;
		const timeSinceLastError = Date.now() - lastError;

		if(timeSinceLastError >= nextRequestDelay) {
			// request is ready, run it and resolve the caller's awaited promise
			// with the outcome so callers observe actual completion, not scheduling.
			const { id, payload, request, timeout, resolve } = requestsWaiting[type];
			clearTimeout(timeout);
			delete requestsWaiting[type];
			const outcome = await runRequest(dispatch, request, { id, type, payload });
			resolve(outcome);
		} else {
			// not ready yet, reschedule the poll
			const nextCheck = (nextRequestDelay - timeSinceLastError) + 200;
			requestsWaiting[type] = {
				...requestsWaiting[type],
				timeout: setTimeout(() => { dispatch(runRequestWaiting(type)) }, nextCheck)
			};
		}
	}
}

// Returns a promise that resolves with the request's outcome when it actually
// completes or with `undefined` if the request was dropped by a newer request
// for the same type while waiting in the backoff queue.
const requestWithBackoff = (request, { id, type, payload }) => {
	return async (dispatch, getState) => {
		const state = getState();
		const lastError = get(state, ['traffic', type, 'lastError']);
		const errorCount = get(state, ['traffic', type, 'errorCount'], 0);

		if(!lastError) {
			return await runRequest(dispatch, request, { id, type, payload });
		}

		const requestScheduleIndex = Math.min(requestSchedule.length - 1, errorCount);
		const nextRequestDelay = requestSchedule[requestScheduleIndex] * 1000;
		const timeSinceLastError = Date.now() - lastError;

		if(timeSinceLastError >= nextRequestDelay) {
			// past the backoff window -- run now, dropping anything queued
			if(type in requestsWaiting) {
				dropRequest(dispatch, type);
			}
			return await runRequest(dispatch, request, { id, type, payload });
		}

		// still inside the backoff window -- queue the request. The returned
		// promise resolves when either runRequestWaiting fires it, or a newer
		// request for the same type drops it via dropRequest.
		if(type in requestsWaiting) {
			dropRequest(dispatch, type);
		}
		const nextCheck = (nextRequestDelay - timeSinceLastError) + 200;
		return await new Promise(resolve => {
			requestsWaiting[type] = {
				id, request, payload, resolve,
				timeout: setTimeout(() => { dispatch(runRequestWaiting(type)) }, nextCheck)
			};
		});
	}
}

const connectionIssues = (resolved = false) => {
	if(resolved) {
		return { type: CONNECTION_ISSUES, resolved };
	} else {
		return { type: CONNECTION_ISSUES, resolved };
	}
}

const abortRequest = id => {
	if(id in requestTracker && typeof(requestTracker[id].abort) === 'function') {
		requestTracker[id].abort();
	}
	return { type: ABORT_REQUEST, id }
}

const abortAllRequests = type => {
	return async (dispatch, getState) => {
		const state = getState();
		const ongoing = get(state, ['traffic', type, 'ongoing'], null);
		if(ongoing !== null) {
			ongoing.forEach(id => { dispatch(abortRequest(id)); });
		}
	}
}

const CACHE_TIMES_KEY = 'zotero-web-library-api-cache-times';

const apiCheckCache = key => {
	var cacheTimes = {}, okToUseCache = false;
	try {
		cacheTimes = JSON.parse(localStorageWrapper.getItem(CACHE_TIMES_KEY)) || {};
	} catch {
		// ignore
	}

	if(key in cacheTimes) {
		okToUseCache = (Date.now() - cacheTimes[key]) < 24 * 60 * 60 * 1000;
	}

	if(!okToUseCache) {
		cacheTimes[key] = Date.now();
		localStorageWrapper.setItem(CACHE_TIMES_KEY, JSON.stringify(cacheTimes));
	}

	return okToUseCache;
}

const apiResetCache = key => {
	var cacheTimes = {};
	try {
		cacheTimes = JSON.parse(localStorageWrapper.getItem(CACHE_TIMES_KEY)) || {};
		delete cacheTimes[key];
		localStorageWrapper.setItem(CACHE_TIMES_KEY, JSON.stringify(cacheTimes));
	} catch {
		// reset all cache times
		localStorageWrapper.removeIem(CACHE_TIMES_KEY);
	}
}

const runRequestSimple = async (dispatch, request, { id, type, payload }, requestOpts = {}) => {
	const outcome = await request(requestOpts);
	dispatch({
		type: `RECEIVE_${type}`,
		...payload, id,
		...outcome
	});
	return outcome;
}

const requestWithCacheAndBackoff = async (dispatch, request, { id, type, payload }) => {
	const key = `${type}-${JSON.stringify(payload)}`;

	if(apiCheckCache(key)) {
		try {
			const result = await runRequestSimple(
				dispatch, request, { id, type, payload }, { useCache: true }
			);
			return result;
		} catch {
			apiResetCache(key);
		}
	}
	return dispatch(requestWithBackoff(request, { id, type, payload }));
}

const requestWithCache = async (dispatch, request, { id, type, payload }) => {
	const key = `${type}-${JSON.stringify(payload)}`;

	if(apiCheckCache(key)) {
		try {
			const result = await runRequestSimple(
				dispatch, request, { id, type, payload }, { useCache: true }
			);
			return result;
		} catch {
			apiResetCache(key);
		}
	}

	return runRequest(request, { id, type, payload });
}

export { abortAllRequests, abortRequest, apiCheckCache, apiResetCache, connectionIssues,
	requestTracker, requestWithBackoff, requestWithCache, requestWithCacheAndBackoff };
