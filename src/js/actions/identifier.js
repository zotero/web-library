import { isLikeURL } from '../utils';
import { ERROR_IDENTIFIER_NO_RESULT, ERROR_ADD_BY_IDENTIFIER, REQUEST_ADD_BY_IDENTIFIER,
	RECEIVE_ADD_BY_IDENTIFIER, RESET_ADD_BY_IDENTIFIER } from '../constants/actions';
import { createItem, navigate } from '.';

const searchIdentifier = identifier => {
	return async (dispatch, getState) => {
		identifier = identifier.trim();

		const { config } = getState();
		const { translateUrl } = config;
		const url = `${translateUrl}/${((isLikeURL(identifier) ? 'web' : 'search'))}`;
		dispatch({ type: REQUEST_ADD_BY_IDENTIFIER, identifier });

		try {
			const response = await fetch(url, {
				method: 'post',
				mode: 'cors',
				headers: { 'content-type': 'text/plain' },
				body: identifier
			});

			if (response.status === 501 || response.status === 400) {
				const message = 'Zotero could not find any identifiers in your input. Please verify your input and try again.';
				dispatch({ type: RECEIVE_ADD_BY_IDENTIFIER, identifier, isNoResults: true, message });
			} else if (response.status === 300) {
				const data = await response.json();
				const items = 'items' in data && 'session' in data ? data.items : data;
				dispatch({
					type: RECEIVE_ADD_BY_IDENTIFIER,
					identifier,
					items,
					response
				});
			} else if(response.status !== 200) {
				const message = 'Unexpected response from the server.';
				dispatch({ type: RECEIVE_ADD_BY_IDENTIFIER, identifier, isNoResults: true, message });
			} else if (!response.headers.get('content-type').startsWith('application/json')) {
				const message = 'Unexpected response from the server.';
				dispatch({ type: RECEIVE_ADD_BY_IDENTIFIER, identifier, isNoResults: true, message });
			} else {
				const json = await response.json();
				if (!json.length) {
					const message = 'Zotero could not find any identifiers in your input. Please verify your input and try again.';
					dispatch({ type: RECEIVE_ADD_BY_IDENTIFIER, identifier, isNoResults: true, message });
				} else {
					const item = json[0];
					delete item.key;
					delete item.version;

					dispatch({
						type: RECEIVE_ADD_BY_IDENTIFIER,
						item,
						identifier,
						response
					});
				}
			}
		} catch(error) {
			dispatch({ type: ERROR_ADD_BY_IDENTIFIER, error, identifier });
		}
	}
}

const resetIdentifier = () => ({
	type: RESET_ADD_BY_IDENTIFIER
});

const currentAddTranslatedItem = translatedItem => {
	return async (dispatch, getState) => {
		const { collectionKey, itemsSource, libraryKey } = getState().current;
		if(itemsSource === 'collection' && collectionKey) {
			translatedItem.collections = [collectionKey];
		}
		const item = await dispatch(createItem(translatedItem, libraryKey));
		dispatch(resetIdentifier());
		dispatch(navigate({
			library: libraryKey,
			collection: collectionKey,
			items: [item.key],
			view: 'item-details'
		}, true));
	}
}

const reportIdentifierNoResults = () => ({
	type: ERROR_IDENTIFIER_NO_RESULT,
	error: 'Zotero could not find any identifiers in your input. Please verify your input and try again.',
	errorType: 'info',
});

export { currentAddTranslatedItem, resetIdentifier, searchIdentifier, reportIdentifierNoResults };
