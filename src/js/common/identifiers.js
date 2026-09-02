import { requestTranslation, MULTIPLE, NOT_FOUND, TOO_LARGE, UNREACHABLE, SERVER_ERROR,
	SESSION_REJECTED, UNEXPECTED_RESPONSE } from 'web-common/utils';

const getTranslationMessage = ({ reason, serverMessage, response }) => {
	switch (reason) {
		case NOT_FOUND:
			return 'Zotero could not find any identifiers in your input. Please verify your input and try again.';
		case TOO_LARGE:
			return 'Selected file is too large.';
		case UNREACHABLE:
			return 'Unable to communicate with Zotero servers. Please check your connection and try again.';
		case SERVER_ERROR:
		case SESSION_REJECTED:
			return serverMessage ?? `Unexpected response from the server (${response.status}).`;
		case UNEXPECTED_RESPONSE:
			return response.ok
				? 'Unexpected response from the server.'
				: `Unexpected response from the server (${response.status}).`;
		default:
			return undefined;
	}
}

const getItemFromIdentifier = async (identifier, translateUrl) => {
	const outcome = await requestTranslation(`${translateUrl}/search`, identifier);
	if (outcome.result === MULTIPLE) {
		return outcome.items[0];
	}
	const error = new Error(getTranslationMessage(outcome) ?? 'Failed to get item from identifier');
	error.reason = outcome.reason;
	throw error;
}

export { getItemFromIdentifier, getTranslationMessage };
