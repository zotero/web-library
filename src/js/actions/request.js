import { get } from '../utils';
import { CONNECTION_ISSUES } from '../constants/actions';

const requestsWaiting = {};
const requestSchedule = [2, 5, 10, 20, 30, 40, 50, 60];

const runRequest = async (dispatch, request, { requestType, payload }) => {
	try {
		const outcome = await request();
		dispatch({
			type: `RECEIVE_${requestType}`,
			...payload,
			...outcome
		});
	} catch(error) {
		dispatch({
			type: `ERROR_${requestType}`,
			...payload,
			silent: true,
			error
		});
	}
}

const dropRequest = (dispatch, requestType) => {
	const { payload, timeout } = requestsWaiting[requestType];

	dispatch({
		type: `DROP_${requestType}`,
		...payload
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
			const { payload, request, timeout } = requestsWaiting[requestType];
			clearTimeout(timeout);
			runRequest(dispatch, request, { requestType, payload });
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

const requestWithBackoff = (request, { type: requestType, payload }) => {
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
					request, payload,
					timeout: setTimeout(() => { dispatch(runRequestWaiting(requestType)) }, nextCheck)
				};
			} else {
				// run the request, if anything is in the queue, drop it
				if(requestType in requestsWaiting) {
					dropRequest(dispatch, requestType);
				}
				runRequest(dispatch, request, { requestType, payload });
			}
		} else {
			runRequest(dispatch, request, { requestType, payload });
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

export { connectionIssues, requestWithBackoff };
