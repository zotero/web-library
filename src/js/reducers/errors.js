'use strict';

const ERRORS_STORED_COUNT = 10; //how many errors are stored before oldest are discarded
var errorCounter = 0;

const getErrorMessage = error => {
	if(error instanceof Error && error.message.startsWith('Failed to fetch')) {
		return 'Unable to communicate with Zotero server. Please check your connection.';
	}
	if('getResponseType' in error && error.getResponseType() === 'ErrorResponse') {
		return error.reason ?
			`Received error from Zotero server: ${error.reason}.` :
			'Received error from Zotero server.'
	}
	return 'Unexpected error.';
}

const processError = error => ({
	message: getErrorMessage(error),
	raw: JSON.stringify(error),
	timestamp: Date.now(),
	id: ++errorCounter,
	isDismissed: false,
});

const errors = (state = [], action) => {
	if(action.type === 'DISMISS_ERROR') {
		return state.filter(error => error.id !== action.errorId);
	}
	if(action.type && action.type.startsWith('ERROR_')) {
		if(action.error && action.error.response && action.error.response.status === 412) {
			// discard 412, these are handled separately in libraries/sync
			return state;
		}

		return [
			processError(action.error),
			...state.slice(0, ERRORS_STORED_COUNT - 1)
		];
	}
	return state;
}

export default errors;
