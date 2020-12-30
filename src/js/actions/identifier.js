import { isLikeURL } from '../utils';
import { BEGIN_SEARCH_MULTIPLE_IDENTIFIERS, COMPLETE_SEARCH_MULTIPLE_IDENTIFIERS,
	ERROR_IDENTIFIER_NO_RESULT, ERROR_ADD_BY_IDENTIFIER, REQUEST_ADD_BY_IDENTIFIER,
	RECEIVE_ADD_BY_IDENTIFIER, RESET_ADD_BY_IDENTIFIER } from '../constants/actions';
import { createItem, createItems, navigate } from '.';
import { omit } from '../common/immutable';
import { EMPTY, SINGLE, CHOICE , MULTIPLE } from '../constants/identifier-result-types';

const searchIdentifier = identifier => {
	return async (dispatch, getState) => {
		identifier = identifier.trim();

		const { config } = getState();
		const { translateUrl } = config;
		const identifierIsUrl = isLikeURL(identifier);
		const url = `${translateUrl}/${((identifierIsUrl ? 'web' : 'search'))}`;
		dispatch({ type: REQUEST_ADD_BY_IDENTIFIER, identifierIsUrl });

		try {
			const response = await fetch(url, {
				method: 'post',
				mode: 'cors',
				headers: { 'content-type': 'text/plain' },
				body: identifier
			});

			if (response.status === 501 || response.status === 400) {
				const message = 'Zotero could not find any identifiers in your input. Please verify your input and try again.';
				dispatch({ type: RECEIVE_ADD_BY_IDENTIFIER, identifier, identifierIsUrl, result: EMPTY, message });
			} else if (response.status === 300) {
				const data = await response.json();
				const items = 'items' in data && 'session' in data ? data.items : data;
				dispatch({
					type: RECEIVE_ADD_BY_IDENTIFIER,
					result: CHOICE,
					identifierIsUrl,
					identifier,
					items,
					response
				});
				return items;
			} else if(response.status !== 200) {
				const message = 'Unexpected response from the server.';
				dispatch({ type: RECEIVE_ADD_BY_IDENTIFIER, identifier, identifierIsUrl, result: EMPTY, message });
			} else if (!response.headers.get('content-type').startsWith('application/json')) {
				const message = 'Unexpected response from the server.';
				dispatch({ type: RECEIVE_ADD_BY_IDENTIFIER, identifier, identifierIsUrl, result: EMPTY, message });
			} else {
				const json = await response.json();
				if (!json.length) {
					const message = 'Zotero could not find any identifiers in your input. Please verify your input and try again.';
					dispatch({ type: RECEIVE_ADD_BY_IDENTIFIER, identifier, identifierIsUrl, result: EMPTY, message });
				} else {
					const rootItems = json.filter(item => !item.parentItem);

					if(rootItems.length > 1) {
						dispatch({
							type: RECEIVE_ADD_BY_IDENTIFIER,
							result: MULTIPLE,
							items: rootItems.map(ri => omit(ri, ['key', 'version'])),
							identifierIsUrl,
							identifier,
							response
						});
						return rootItems;
					} else {
						const item = json[0];
						delete item.key;
						delete item.version;

						dispatch({
							type: RECEIVE_ADD_BY_IDENTIFIER,
							result: SINGLE,
							item,
							identifier,
							identifierIsUrl,
							response
						});
						return item;
					}
				}
			}
		} catch(error) {
			dispatch({ type: ERROR_ADD_BY_IDENTIFIER, error, identifier });
		}
	}
}

const currentAddMultipleTranslatedItems = identifiers => {
	return async(dispatch, getState) => {
		const state = getState();
		const { config } = state;
		const { collectionKey, itemsSource, libraryKey } = state.current;
		const { translateUrl } = config;

		dispatch({
			type: BEGIN_SEARCH_MULTIPLE_IDENTIFIERS,
			identifiers
		});
		const url = `${translateUrl}/search`;

		const promises = identifiers.map(identifier => fetch(url, {
			method: 'post',
			mode: 'cors',
			headers: { 'content-type': 'text/plain' },
			body: identifier
		}).then(async r => (await r.json())[0]));

		const items = await Promise.all(promises);

		if(itemsSource === 'collection' && collectionKey) {
			items.forEach(i => i.collections = [collectionKey]);
		}
		const data = await dispatch(createItems(items, libraryKey));
		const keys = data.map(d => d.key);

		dispatch(resetIdentifier());

		dispatch(navigate({
			library: libraryKey,
			collection: collectionKey,
			items: keys,
			view: 'item-list'
		}, true));

		dispatch({
			type: COMPLETE_SEARCH_MULTIPLE_IDENTIFIERS,
			identifiers,
			items,
		});
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

export { currentAddTranslatedItem, currentAddMultipleTranslatedItems, resetIdentifier, searchIdentifier, reportIdentifierNoResults };
