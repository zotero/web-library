import { isLikeURL } from '../utils';
import { BEGIN_SEARCH_MULTIPLE_IDENTIFIERS, COMPLETE_SEARCH_MULTIPLE_IDENTIFIERS,
	ERROR_IDENTIFIER_NO_RESULT, ERROR_ADD_BY_IDENTIFIER, REQUEST_ADD_BY_IDENTIFIER,
	RECEIVE_ADD_BY_IDENTIFIER, RESET_ADD_BY_IDENTIFIER, REQUEST_IDENTIFIER_MORE,
	RECEIVE_IDENTIFIER_MORE, ERROR_IDENTIFIER_MORE } from '../constants/actions';
import { createItem, createItems, navigate } from '.';
import { omit, pick } from '../common/immutable';
import { extractIdentifiers } from '../common/identifiers';
import { EMPTY, SINGLE, CHOICE , CHOICE_EXHAUSTED, MULTIPLE } from '../constants/identifier-result-types';

const getNextLinkFromResponse = response => {
	let next = null;
	if(response.headers.has('link')) {
		const links = response.headers.get('link');
		const matches = links.match(/<(.*?)>;\s+rel="next"/i);

		if(matches && matches.length > 1) {
			next = matches[1];
		}
	}
	return next;
}


const searchIdentifier = identifier => {
	return async (dispatch, getState) => {
		identifier = identifier.trim();
		const { config } = getState();
		const { translateUrl } = config;
		const identifierIsUrl = isLikeURL(identifier);
		if(!identifierIsUrl) {
			const identifierObjects = extractIdentifiers(identifier);
			if(identifierObjects.length === 0) {
				// invalid identifier, if we don't return, it will run search for a generic term like zbib
				return;
			} else {
				return dispatch(currentAddMultipleTranslatedItems(identifierObjects.map(io => Object.values(io)[0])));
			}
		}
		const url = `${translateUrl}/${((identifierIsUrl ? 'web' : 'search'))}`;
		dispatch({ type: REQUEST_ADD_BY_IDENTIFIER, identifier, identifierIsUrl });

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
				const next = getNextLinkFromResponse(response);

				dispatch({
					type: RECEIVE_ADD_BY_IDENTIFIER,
					result: next ? CHOICE : CHOICE_EXHAUSTED,
					session: data.session,
					next,
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
		const { result, session, items, identifierIsUrl } = state.identifier;
		const { translateUrl } = config;
		var translatedItems;

		dispatch({
			type: BEGIN_SEARCH_MULTIPLE_IDENTIFIERS,
			identifiers
		});

		try {
			if(result === MULTIPLE) {
				translatedItems = identifiers.map(identifierId => items[parseInt(identifierId)]);
			} else if(identifierIsUrl && session) {
				const url = `${translateUrl}/web`;
				const selectedItems = pick(items, identifiers);
				const response = await fetch(url, {
					method: 'post',
					mode: 'cors',
					headers: { 'content-type': 'application/json' },
					body: JSON.stringify({
						items: selectedItems,
						url: state.identifier.identifier,
						session,
					})
				});
				const data = await response.json();
				translatedItems = data.filter(item => !item.parentItem);
			} else if(!identifierIsUrl) {
				const url = `${translateUrl}/search`;
				const promises = identifiers.map(identifier => fetch(url, {
					method: 'post',
					mode: 'cors',
					headers: { 'content-type': 'text/plain' },
					body: identifier
				}).then(async r => (await r.json())[0]).catch(() => null));

				translatedItems = (await Promise.all(promises)).filter(Boolean);
			}

			if(translatedItems && translatedItems.length) {
				if(itemsSource === 'collection' && collectionKey) {
					translatedItems.forEach(i => i.collections = [collectionKey]);
				}
				const data = await dispatch(createItems(translatedItems, libraryKey));
				const keys = data.map(d => d.key);

				dispatch(navigate({
					library: libraryKey,
					collection: collectionKey,
					items: keys,
					view: 'item-list'
				}, true));
			}
		} finally {
			dispatch(resetIdentifier());
			dispatch({
				type: COMPLETE_SEARCH_MULTIPLE_IDENTIFIERS,
				identifiers,
				items: translatedItems,
			});
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

const searchIdentifierMore = () => {
	return async (dispatch, getState) => {
		const state = getState();
		const { config } = state
		const { translateUrl } = config;
		const { identifier, identifierIsUrl, next, result } = state.identifier;
		if(!identifier || result !== CHOICE) {
			return;
		}

		dispatch({ type: REQUEST_IDENTIFIER_MORE, identifier });

		try {
			const response = await fetch(next, {
				method: 'post',
				mode: 'cors',
				headers: { 'content-type': 'text/plain' },
				body: identifier
			});

			if (response.status === 300) {
				const data = await response.json();
				const items = 'items' in data && 'session' in data ? data.items : data;
				const next = getNextLinkFromResponse(response)
				dispatch({
					type: RECEIVE_IDENTIFIER_MORE,
					result: next ? CHOICE : CHOICE_EXHAUSTED,
					next,
					identifier,
					items,
					response
				});
			} else {
				dispatch({
					type: RECEIVE_IDENTIFIER_MORE,
					result: CHOICE_EXHAUSTED
				});
			}
		} catch(error) {
			dispatch({ type: ERROR_IDENTIFIER_MORE, error, identifier });
			throw error;
		}
	}
}

const reportIdentifierNoResults = () => ({
	type: ERROR_IDENTIFIER_NO_RESULT,
	error: 'Zotero could not find any identifiers in your input. Please verify your input and try again.',
	errorType: 'info',
});

export { currentAddTranslatedItem, currentAddMultipleTranslatedItems, resetIdentifier, searchIdentifier, searchIdentifierMore, reportIdentifierNoResults };
