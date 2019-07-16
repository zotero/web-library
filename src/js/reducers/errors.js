'use strict';


const ERRORS_STORED_COUNT = 10; //how many errors are stored before oldest are discarded

const processError = error => {
	if(error instanceof Error && error.message.startsWith('Failed to fetch')) {
		console.log('Exception', error);
		return {
			message: 'Unable to communicate with Zotero server. Please check your connection',
			raw: JSON.stringify(error)
		}
	}
	if('getResponseType' in error && error.getResponseType() === 'ErrorResponse') {
			if(error.reason) {
				return {
					message: `Received error from Zotero server: ${error.reason}.`,
					raw: JSON.stringify(error)
				}
			} else {
				return {
					message: 'Received error from Zotero server.',
					raw: JSON.stringify(error)
				}
			}
	}
	return {
		message: 'Unexpected error',
		raw: JSON.stringify(error)
	}
}

const errors = (state = [], action) => {
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
