'use strict';

import { isLikeURL } from '../utils';
import { ERROR_ADD_BY_IDENTIFIER, REQUEST_ADD_BY_IDENTIFIER,
	RECEIVE_ADD_BY_IDENTIFIER, RESET_ADD_BY_IDENTIFIER } from '../constants/actions';


const searchIdentifier = identifier => {
	return async (dispatch, getState) => {
		const dispatchError = (error, response) => {
			dispatch({ type: ERROR_ADD_BY_IDENTIFIER, error, identifier, response });
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
				dispatchError(
					`Invalid response from translation-server: ${(await response.text())}`,
					response
				);
				return;
			} else if (response.status === 501) {
				dispatchError('Not Found', identifier, response);
				return;
			} else if(response.status !== 200) {
				dispatchError('Unexpected Response', response);
				return;
			}

			const json = await response.json();
			if (!json.length) {
				dispatchError('Not Found', response);
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
