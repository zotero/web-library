import { pick, requestTranslation, EMPTY, ERROR, CHOICE, CHOICE_EXHAUSTED, MULTIPLE, NOT_FOUND } from 'web-common/utils';
import { getZotero } from 'web-common/zotero';

import { isLikeURL } from '../utils';
import { pluralize } from '../common/format';
import { getTranslationMessage } from '../common/identifiers';
import { BEGIN_SEARCH_MULTIPLE_IDENTIFIERS, COMPLETE_SEARCH_MULTIPLE_IDENTIFIERS,
	ERROR_IDENTIFIER_LOOKUP_FAILED, ERROR_IDENTIFIER_NO_RESULT, REQUEST_ADD_BY_IDENTIFIER,
	RECEIVE_ADD_BY_IDENTIFIER, RESET_ADD_BY_IDENTIFIER } from '../constants/actions';
import { createItem, createItems, navigate } from '.';

const importFromFile = fileData => {
	return searchIdentifier(fileData.file, { shouldImport: true });
}

const searchIdentifier = (identifier, { shouldImport = false } = {}) => {
	return async (dispatch, getState) => {
		const { config } = getState();
		const { translateUrl } = config;

		let identifierIsUrl = false;
		let url;

		if(!shouldImport) {
			identifier = identifier.trim();
			const matchDOI = decodeURIComponent(identifier)
				.match(/^https?:\/\/doi.org\/(10(?:\.[0-9]{4,})?\/[^\s]*[^\s.,])$/);
			if(matchDOI) {
				identifier = matchDOI[1];
			}
			identifierIsUrl = isLikeURL(identifier);
			if(!identifierIsUrl) {
				const identifierObjects = getZotero().Utilities.extractIdentifiers(identifier);
				if(identifierObjects.length === 0) {
					// invalid identifier, if we don't return, it will run search for a generic term like zbib
					dispatch(reportIdentifierNoResults());
					return;
				} else {
					return dispatch(currentAddMultipleTranslatedItems(identifierObjects.map(io => Object.values(io)[0])));
				}
			}
			url = `${translateUrl}/${((identifierIsUrl ? 'web' : 'search'))}`;
		} else {
			url = `${translateUrl}/import`;
		}

		dispatch({ type: REQUEST_ADD_BY_IDENTIFIER, identifier, identifierIsUrl, import: shouldImport });

		const outcome = await requestTranslation(url, identifier);
		const { result, items, session, response } = outcome;
		dispatch({
			type: RECEIVE_ADD_BY_IDENTIFIER,
			result: result === CHOICE ? CHOICE_EXHAUSTED : result,
			message: getTranslationMessage(outcome),
			items,
			session,
			response,
			identifier,
			identifierIsUrl,
			import: shouldImport
		});
		return items;
	}
}

const getUnrecognizedIdentifiersMessage = (unrecognized, total) => {
	if(unrecognized.length < total) {
		return `Zotero could not recognize the following ${pluralize('identifier', unrecognized.length)}: ${unrecognized.join(', ')}.`;
	}
	return total === 1
		? 'Zotero could not recognize the specified identifier. Please verify the identifier and try again.'
		: 'Zotero could not recognize any of the specified identifiers. Please verify the identifiers and try again.';
}

const getFailedIdentifiersMessage = (failed, total) => {
	if(failed.length < total) {
		return `An error occurred while looking up the following ${pluralize('identifier', failed.length)}: ${failed.join(', ')}. Please try again later.`;
	}
	return `An error occurred while looking up the specified ${pluralize('identifier', total)}. Please try again later.`;
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
				const outcome = await requestTranslation(`${translateUrl}/web`, {
					items: pick(items, identifiers),
					url: state.identifier.identifier,
					session,
				});
				if(outcome.result === MULTIPLE) {
					translatedItems = outcome.items.filter(item => !item.parentItem);
				} else {
					const report = outcome.result === ERROR ? reportIdentifierLookupFailed : reportIdentifierNoResults;
					dispatch(report(getTranslationMessage(outcome)));
				}
			} else if(!identifierIsUrl) {
				const url = `${translateUrl}/search`;
				const outcomes = await Promise.all(identifiers.map(identifier => requestTranslation(url, identifier)));
				const unrecognized = [];
				const failed = [];

				outcomes.forEach(({ result }, index) => {
					if(result === MULTIPLE) {
						return;
					}
					if(result === EMPTY) {
						unrecognized.push(identifiers[index]);
					} else {
						failed.push(identifiers[index]);
					}
				});

				translatedItems = outcomes
					.filter(({ result }) => result === MULTIPLE)
					.map(({ items }) => items[0]);

				if(unrecognized.length) {
					dispatch(reportIdentifierNoResults(getUnrecognizedIdentifiersMessage(unrecognized, identifiers.length)));
				}
				if(failed.length) {
					dispatch(reportIdentifierLookupFailed(getFailedIdentifiersMessage(failed, identifiers.length)));
				}
			}

			if(translatedItems && translatedItems.length) {
				if(itemsSource === 'collection' && collectionKey) {
					translatedItems
						.filter(i => !i.parentItem)
						.forEach(i => i.collections = [collectionKey]);
				}
				// order items so that parent items are created before child items
				translatedItems.sort((a, b) => {
					if(a.parentItem && !b.parentItem) {
						return 1;
					} else if(b.parentItem && !a.parentItem) {
						return -1;
					}
					return 0;
				});
				const data = await dispatch(createItems(translatedItems, libraryKey));
				const rootItemKeys = data.filter(d => !d.parentItem).map(d => d.key);

				dispatch(navigate({
					library: libraryKey,
					collection: collectionKey,
					items: rootItemKeys,
					view: 'item-list'
				}, true));
			}
		} finally {
			dispatch({
				type: COMPLETE_SEARCH_MULTIPLE_IDENTIFIERS,
				identifiers,
				items: translatedItems,
			});
			dispatch(resetIdentifier());
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

const reportIdentifierLookupFailed = message => ({
	type: ERROR_IDENTIFIER_LOOKUP_FAILED,
	error: message,
	errorTag: 'identifier'
});

const reportIdentifierNoResults = (message = getTranslationMessage({ reason: NOT_FOUND })) => ({
	type: ERROR_IDENTIFIER_NO_RESULT,
	error: message,
	errorType: 'info',
	errorTag: 'identifier'
});

export { currentAddTranslatedItem, currentAddMultipleTranslatedItems, importFromFile, resetIdentifier, searchIdentifier, reportIdentifierLookupFailed, reportIdentifierNoResults };
