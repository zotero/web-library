import { CONNECTION_ISSUES, RESET_LIBRARY, DISMISS_ERROR } from '../constants/actions';
const ERRORS_STORED_COUNT = 10; //how many errors are stored before oldest are discarded
var errorCounter = 0;

const isDuplicate = (error, prevError) =>
	error && prevError && error.message === prevError.message &&
	error.type === prevError.type && !prevError.isDismissed;

const getErrorMessage = error => {
	if(error instanceof TypeError && (error.message === 'Failed to fetch' || error.message.startsWith('NetworkError'))) {
		return `Unable to communicate with Zotero server. Please check your connection.`;
	}
	if(typeof error === 'object' && 'getResponseType' in error && error.getResponseType() === 'ErrorResponse') {
		if('options' in error && 'resource' in error.options && error.options.resource.fileUrl === null) {
			// special case for attachment url requests failing with 404
			return 'Requested file is not available. It might not have been synced yet.';
		}

		return error.reason ?
			`Received error from Zotero server: ${error.reason}.` :
			'Received error from Zotero server.'
	}
	if(typeof error === 'string') {
		return error;
	}
	if('message' in error && error.message) {
		return `Unexpected error: ${error.message}`;
	}
	return 'Unexpected error.';
}

const processError = ({ error, errorType }) => ({
	id: ++errorCounter,
	isDismissed: false,
	message: getErrorMessage(error),
	raw: JSON.stringify(error),
	timesOccurred: 1,
	timestamp: Date.now(),
	type: errorType || 'error'
});

const errors = (state = [], action) => {
	if(action.type === DISMISS_ERROR) {
		return state.filter(error => error.id !== action.errorId);
	} else if(action.type && action.type.startsWith('ERROR_')) {
		if(action.silent) {
			return state;
		}
		if(action.error && action.error.response && action.error.response.status === 412) {
			// discard 412, these will trigger RESET_LIBRARY which is handled below
			return state;
		}
		const processedError = processError(action);

		if(isDuplicate(processedError, state[0])) {
			return [
				{ ...state[0], timesOccurred: state[0].timesOccurred + 1 },
				...state.slice(1, ERRORS_STORED_COUNT - 1)
			];
		}

		return [
			processedError,
			...state.slice(0, ERRORS_STORED_COUNT - 1)
		];
	} else if(action.type === RESET_LIBRARY) {
		return [{
				id: ++errorCounter,
				isDismissed: false,
				message: 'Current library has been modified outside of Web Library and had to be reset to remote state to allow editing.',
				raw: {},
				timesOccurred: 1,
				timestamp: Date.now(),
				type: 'error',
			},
			...state.slice(0, ERRORS_STORED_COUNT - 1)
		];
	} else if(action.type === CONNECTION_ISSUES) {
		if(action.resolved) {
			return state.filter(e => e.raw !== CONNECTION_ISSUES);
		} else {
			return [{
					id: ++errorCounter,
					isDismissed: false,
					message: 'Encountered connectivity issues. Some data might be missing temporarily.',
					raw: CONNECTION_ISSUES,
					timesOccurred: 1,
					timestamp: Date.now(),
					type: 'warning',
				},
				...state.filter(e => e.raw !== CONNECTION_ISSUES).slice(0, ERRORS_STORED_COUNT - 1)
			];
		}
	}
	return state;
}

export default errors;
