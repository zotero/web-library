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
	const { id, payload, timeout } = requestsWaiting[type];

	dispatch({
		type: `DROP_${type}`,
		reason: 'backoff',
		...payload, id
	});
	clearTimeout(timeout);
	delete requestsWaiting[type];
}

const runRequestWaiting = type => {
	return async (dispatch, getState) => {
		const state = getState();
		const lastError = get(state, ['traffic', type, 'lastError']);
		const errorCount = get(state, ['traffic', type, 'errorCount'], 0);

		const requestScheduleIndex = Math.min(requestSchedule.length - 1, errorCount);
		const nextRequestDelay = requestSchedule[requestScheduleIndex] * 1000;
		const timeSinceLastError = Date.now() - lastError;
		if(type in requestsWaiting && timeSinceLastError >= nextRequestDelay) {
			// if there is a request waiting and ready, run it
			const { id, payload, request, timeout } = requestsWaiting[type];
			clearTimeout(timeout);
			runRequest(dispatch, request, { id, type, payload });
			delete requestsWaiting[type];
		} else if(type in requestsWaiting) {
			// if request is not ready, reschedule
			const nextCheck = (nextRequestDelay - timeSinceLastError) + 200;
			requestsWaiting[type] = {
				...requestsWaiting[type],
				timeout: setTimeout(() => { dispatch(runRequestWaiting(type)) }, nextCheck)
			};
		}
	}
}

//NOTE: if requests is backing off, this function resolves with undefined before the request actually executes
const requestWithBackoff = (request, { id, type, payload }) => {
	return async (dispatch, getState) => {
		const state = getState();
		const lastError = get(state, ['traffic', type, 'lastError']);
		const errorCount = get(state, ['traffic', type, 'errorCount'], 0);

		if(lastError) {
			const requestScheduleIndex = Math.min(requestSchedule.length - 1, errorCount);
			const nextRequestDelay = requestSchedule[requestScheduleIndex] * 1000;
			const timeSinceLastError = Date.now() - lastError;
			if(timeSinceLastError < nextRequestDelay) {
				// queue the request, dropping anything in the queue already
				const nextCheck = (nextRequestDelay - timeSinceLastError) + 200;
				if(type in requestsWaiting) {
					dropRequest(dispatch, type);
				}
				requestsWaiting[type] = {
					id, request, payload,
					timeout: setTimeout(() => { dispatch(runRequestWaiting(type)) }, nextCheck)
				};
			} else {
				// run the request, if anything is in the queue, drop it
				if(type in requestsWaiting) {
					dropRequest(dispatch, type);
				}
				return await runRequest(dispatch, request, { id, type, payload });
			}
		} else {
			return await runRequest(dispatch, request, { id, type, payload });
		}
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
	} catch(_) {
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
	} catch(_) {
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
		} catch(e) {
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
		} catch(e) {
			apiResetCache(key);
		}
	}

	return runRequest(request, { id, type, payload });
}

export { abortAllRequests, abortRequest, apiCheckCache, apiResetCache, connectionIssues,
	requestTracker, requestWithBackoff, requestWithCacheAndBackoff, requestWithCache };
