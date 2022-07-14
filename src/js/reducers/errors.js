import { CONNECTION_ISSUES, DISMISS_ERROR, ERROR_ADD_ITEMS_TO_COLLECTION, ERROR_ADD_TAGS_TO_ITEMS, ERROR_CREATE_COLLECTIONS, ERROR_CREATE_ITEMS, ERROR_DELETE_ITEMS, ERROR_RECOVER_ITEMS_TRASH, ERROR_REMOVE_ITEMS_FROM_COLLECTION, ERROR_TRASH_ITEMS, RESET_LIBRARY } from '../constants/actions';
import { buyStorageUrl } from '../constants/defaults';
const ERRORS_STORED_COUNT = 10; //how many errors are stored before oldest are discarded
var errorCounter = 0;

const isDuplicate = (error, prevError) =>
	error && prevError && error.message === prevError.message &&
	error.type === prevError.type && !prevError.isDismissed;

const processError = ({ type, error, errorType }, meta) => {
	var message, cta;

	if(error instanceof TypeError && (error.message === 'Failed to fetch' || error.message.startsWith('NetworkError'))) {
		message = `Unable to communicate with Zotero server. Please check your connection.`;
	} else if(typeof error === 'object' && 'getResponseType' in error && error.getResponseType() === 'ErrorResponse') {
		if('options' in error && 'resource' in error.options && error.options.resource.fileUrl === null) {
			// special case for attachment url requests failing with 404
			message = 'Requested file is not available. It might not have been synced yet.';
		}

		const dateError = error.reason?.match(/^'([a-zA-Z0-9]*)' must be in ISO 8601 or UTC.*?\((.*?)\)$/);

		if(dateError) {
			const field = dateError[1];
			const value = dateError[2];
			const localized = meta?.itemFields?.find(metaData => metaData.field === field)?.localized;
			message = `'${localized ?? field}' could not be updated because '${value}' is not
			recognized as date. Please specify date in ISO 8601 or UTC 'YYYY-MM-DD[ hh:mm:ss]'
			format or use one of the following values: 'now', 'today', 'yesterday'`;
		} else if(error.reason?.includes('File would exceed quota')) {
			message = 'File was not uploaded as it would exceed quota.';
			cta = { type: 'url', label: 'Upgrade Storage', href: buyStorageUrl }
		} else {
			message = error.reason ?
				`Received error from Zotero server: ${error.reason}.` :
				'Received error from Zotero server.'
		}
	} else if(typeof error === 'string') {
		message = error;
	} else if (error !== null && [ERROR_ADD_ITEMS_TO_COLLECTION, ERROR_ADD_TAGS_TO_ITEMS, ERROR_CREATE_COLLECTIONS,
		ERROR_CREATE_ITEMS, ERROR_DELETE_ITEMS, ERROR_RECOVER_ITEMS_TRASH,
		ERROR_REMOVE_ITEMS_FROM_COLLECTION, ERROR_TRASH_ITEMS
	].includes(type)) {
		// `error` is an object where keys are indexes of the array of the original request
		const firstError = Object.values(error).find(e => e.message);
		message = `Some updates failed${firstError ? ': ' + firstError.message : ''}.`;
	} else if('message' in error && error.message) {
		message = `Unexpected error: ${error.message}`;
	} else {
		message = 'Unexpected error.';
	}

	return {
		id: ++errorCounter,
		isDismissed: false,
		message,
		cta,
		raw: JSON.stringify(error),
		timesOccurred: 1,
		timestamp: Date.now(),
		type: errorType || 'error'
	}
}

const errors = (state = [], action, { meta } = {}) => {
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

		const processedError = processError(action, meta);

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
