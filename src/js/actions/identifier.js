'use strict';

import { isLikeURL } from '../utils';
import { ERROR_ADD_BY_IDENTIFIER, REQUEST_ADD_BY_IDENTIFIER,
	RECEIVE_ADD_BY_IDENTIFIER, RESET_ADD_BY_IDENTIFIER } from '../constants/actions';


const searchIdentifier = identifier => {
	return async (dispatch, getState) => {
		const dispatchError = ({ message, response }) => {
			dispatch({ type: ERROR_ADD_BY_IDENTIFIER, error: message, identifier, response });
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

			if (!response.headers.get('content-type').startsWith('application/json')) {
				const message = `Invalid response from translation-server: ${(await response.text())}`;
				throw ({ message, response });
			} else if (response.status === 501) {
				const message = 'Not Found';
				throw ({ message, response });
			} else if(response.status !== 200) {
				const message = 'Unexpected Response';
				throw ({ message, response });
			}

			const json = await response.json();
			if (!json.length) {
				const message = 'Not Found';
				throw ({ message, response });
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
