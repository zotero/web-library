
import { get } from '../utils';
import { getLSItem, removeLSItem, setLSItem } from '../common/local-storage';
import { ABORT_REQUEST, CONNECTION_ISSUES } from '../constants/actions';

const requestsWaiting = {}; // type -> Map of waitingId -> { id, request, payload, resolve, timeout }
const requestSchedule = [1, 2, 5, 10, 20, 30, 40, 50, 60];
var requestTracker = { id: 1 };
var nextWaitingId = 1;

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

const runRequestWaiting = (type, waitingId) => {
	return async (dispatch, getState) => {
		const waiting = requestsWaiting[type]?.get(waitingId);
		if(!waiting) {
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
			const { id, payload, request, resolve } = waiting;
			requestsWaiting[type].delete(waitingId);
			if(requestsWaiting[type].size === 0) {
				delete requestsWaiting[type];
			}
			const outcome = await runRequest(dispatch, request, { id, type, payload });
			resolve(outcome);
		} else {
			// not ready yet, reschedule the poll
			const nextCheck = (nextRequestDelay - timeSinceLastError) + 200;
			waiting.timeout = setTimeout(() => { dispatch(runRequestWaiting(type, waitingId)) }, nextCheck);
		}
	}
}

// Returns a promise that resolves with the request's outcome when it actually
// completes -- immediately when outside of a backoff window, otherwise after
// waiting out the backoff. Resolves with `undefined` if the request errors.
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
			// past the backoff window -- run now
			return await runRequest(dispatch, request, { id, type, payload });
		}

		// still inside the backoff window -- queue the request.
		const nextCheck = (nextRequestDelay - timeSinceLastError) + 200;
		const waitingId = nextWaitingId++;
		return await new Promise(resolve => {
			if(!(type in requestsWaiting)) {
				requestsWaiting[type] = new Map();
			}
			requestsWaiting[type].set(waitingId, {
				id, request, payload, resolve,
				timeout: setTimeout(() => { dispatch(runRequestWaiting(type, waitingId)) }, nextCheck)
			});
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
		cacheTimes = JSON.parse(getLSItem(CACHE_TIMES_KEY)) || {};
	} catch {
		// ignore
	}

	if(key in cacheTimes) {
		okToUseCache = (Date.now() - cacheTimes[key]) < 24 * 60 * 60 * 1000;
	}

	if(!okToUseCache) {
		cacheTimes[key] = Date.now();
		setLSItem(CACHE_TIMES_KEY, JSON.stringify(cacheTimes));
	}

	return okToUseCache;
}

const apiResetCache = key => {
	var cacheTimes = {};
	try {
		cacheTimes = JSON.parse(getLSItem(CACHE_TIMES_KEY)) || {};
		delete cacheTimes[key];
		setLSItem(CACHE_TIMES_KEY, JSON.stringify(cacheTimes));
	} catch {
		// reset all cache times
		removeLSItem(CACHE_TIMES_KEY);
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
	requestSchedule, requestTracker, requestWithBackoff, requestWithCache, requestWithCacheAndBackoff };
