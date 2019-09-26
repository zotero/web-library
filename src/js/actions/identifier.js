'use strict';

import { isLikeURL } from '../utils';
import { ERROR_ADD_BY_IDENTIFIER, REQUEST_ADD_BY_IDENTIFIER,
	RECEIVE_ADD_BY_IDENTIFIER, RESET_ADD_BY_IDENTIFIER } from '../constants/actions';


const searchIdentifier = identifier => {
	return async (dispatch, getState) => {
		const dispatchError = ({ message, response, errorType }) => {
			dispatch({ type: ERROR_ADD_BY_IDENTIFIER, error: message, errorType, identifier, response });
		}

		const { config } = getState();
		const { translateUrl } = config;
		const url = `${translateUrl}/${((isLikeURL(identifier) ? 'web?single=1' : 'search?text=0'))}`;
		dispatch({ type: REQUEST_ADD_BY_IDENTIFIER, identifier });
		try {
			const response = await fetch(url, {
				method: 'post',
				mode: 'cors',
				headers: { 'content-type': 'text/plain' },
				body: identifier
			});

			if (response.status === 501) {
				const message = 'Zotero could not find any identifiers in your input. Please verify your input and try again.';
				throw ({ message, response, errorType: 'info' });
			}

			if(response.status !== 200) {
				const message = 'Unexpected response from the server.';
				throw ({ message, response });
			}

			if (!response.headers.get('content-type').startsWith('application/json')) {
				console.error(await response.text());
				const message = 'Unexpected response from the server.';
				throw ({ message, response });
			}

			const json = await response.json();
			if (!json.length) {
				const message = 'Zotero could not find any identifiers in your input. Please verify your input and try again.';
				throw ({ message, response, errorType: 'info' });
			}

			const item = json[0];
			delete item.key;
			delete item.version;

			dispatch({
				type: RECEIVE_ADD_BY_IDENTIFIER, item, identifier, response
			});
			return item;
		} catch(error) {
			dispatchError(error);
			throw error;
		}
	}
}

const resetIdentifier = () => ({
	type: RESET_ADD_BY_IDENTIFIER
});

export { resetIdentifier, searchIdentifier };
