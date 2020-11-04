import { get } from '../utils';
import { ABORT_REQUEST, CONNECTION_ISSUES } from '../constants/actions';

const requestsWaiting = {};
const requestSchedule = [2, 5, 10, 20, 30, 40, 50, 60];
var requestTracker = { id: 1 };

const runRequest = async (dispatch, request, { id, requestType, payload }) => {
	try {
		const outcome = await request();
		dispatch({
			type: `RECEIVE_${requestType}`,
			...payload, id,
			...outcome
		});
	} catch(error) {
		if(error && (error.name === 'AbortError' || error.message === 'aborted')) {
			dispatch({
				type: `DROP_${requestType}`,
				...payload, id,
				reason: 'abort',
				error
			});
		} else {
			dispatch({
				type: `ERROR_${requestType}`,
				...payload, id,
				silent: true,
				error
			});
		}
	} finally {
		delete requestTracker[id];
	}
}

const dropRequest = (dispatch, requestType) => {
	const { id, payload, timeout } = requestsWaiting[requestType];

	dispatch({
		type: `DROP_${requestType}`,
		reason: 'backoff',
		...payload, id
	});
	clearTimeout(timeout);
	delete requestsWaiting[requestType];
}

const runRequestWaiting = requestType => {
	return async (dispatch, getState) => {
		const state = getState();
		const lastError = get(state, ['traffic', requestType, 'lastError']);
		const errorCount = get(state, ['traffic', requestType, 'errorCount'], 0);

		const requestScheduleIndex = Math.min(requestSchedule.length - 1, errorCount);
		const nextRequestDelay = requestSchedule[requestScheduleIndex] * 1000;
		const timeSinceLastError = Date.now() - lastError;
		if(requestType in requestsWaiting && timeSinceLastError >= nextRequestDelay) {
			// if there is a request waiting and ready, run it
			const { id, payload, request, timeout } = requestsWaiting[requestType];
			clearTimeout(timeout);
			runRequest(dispatch, request, { id, requestType, payload });
			delete requestsWaiting[requestType];
		} else if(requestType in requestsWaiting) {
			// if request is not ready, reschedule
			const nextCheck = (nextRequestDelay - timeSinceLastError) + 200;
			requestsWaiting[requestType] = {
				...requestsWaiting[requestType],
				timeout: setTimeout(() => { dispatch(runRequestWaiting(requestType)) }, nextCheck)
			};
		}
	}
}

const requestWithBackoff = (request, { id, type: requestType, payload }) => {
	return async (dispatch, getState) => {
		const state = getState();
		const lastError = get(state, ['traffic', requestType, 'lastError']);
		const errorCount = get(state, ['traffic', requestType, 'errorCount'], 0);

		if(lastError) {
			const requestScheduleIndex = Math.min(requestSchedule.length - 1, errorCount);
			const nextRequestDelay = requestSchedule[requestScheduleIndex] * 1000;
			const timeSinceLastError = Date.now() - lastError;
			if(timeSinceLastError < nextRequestDelay) {
				// queue the request, dropping anything in the queue already
				const nextCheck = (nextRequestDelay - timeSinceLastError) + 200;
				if(requestType in requestsWaiting) {
					dropRequest(dispatch, requestType);
				}
				requestsWaiting[requestType] = {
					id, request, payload,
					timeout: setTimeout(() => { dispatch(runRequestWaiting(requestType)) }, nextCheck)
				};
			} else {
				// run the request, if anything is in the queue, drop it
				if(requestType in requestsWaiting) {
					dropRequest(dispatch, requestType);
				}
				runRequest(dispatch, request, { id, requestType, payload });
			}
		} else {
			runRequest(dispatch, request, { id, requestType, payload });
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

const abortAllRequests = requestType => {
	return async (dispatch, getState) => {
		const state = getState();
		const ongoing = get(state, ['traffic', requestType, 'ongoing']);
		if(ongoing !== null) {
			ongoing.forEach(id => { dispatch(abortRequest(id)); });
		}
	}
}

export { abortAllRequests, abortRequest, connectionIssues, requestTracker, requestWithBackoff };
