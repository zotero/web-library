import { shallowEqual } from 'react-redux';

import { BEGIN_STATUS, DISMISS_ERROR, END_STATUS, RESET_QUERY, TOGGLE_ADVANCED_SEARCH, TOGGLE_HIDE_AUTOMATIC_TAGS,
	TOGGLE_MODAL, TOGGLE_NAVBAR, TOGGLE_TAG_SELECTOR, TOGGLE_TOUCH_TAG_SELECTOR, TOGGLE_TRANSITIONS,
	TRIGGER_EDITING_ITEM, TRIGGER_HIGHLIGHTED_COLLECTIONS, TRIGGER_RESIZE_VIEWPORT,
	TRIGGER_SEARCH_MODE, TRIGGER_SELECT_MODE, TRIGGER_USER_TYPE_CHANGE, } from
	'../constants/actions';
import { FETCH_SELECTED_ITEMS } from '../constants/status';
import { fetchItemsByKeys, navigate, navigateExitSearch } from './';
import { getUniqueId } from '../utils';

const triggerEditingItem = (itemKey, toggleValue) => {
	return async (dispatch, getState) => {
		const { libraryKey } = getState().current;

		return dispatch({
			type: TRIGGER_EDITING_ITEM,
			isEditing: toggleValue,
			itemKey,
			libraryKey,
		});
	}
};

const triggerSelectMode = (isSelectMode, shouldNavigate = false, items = []) => {
	return async (dispatch, getState) => {
		const { collectionKey, libraryKey, search, tags, view, isTrash, isMyPublications } = getState().current;

		if(shouldNavigate) {
			const trash = isTrash;
			const publications = isMyPublications;
			dispatch(
				navigate({ library: libraryKey, search, tags, trash, publications, collection: collectionKey, items, view }, true)
			);
		}

		return dispatch({
			type: TRIGGER_SELECT_MODE,
			libraryKey,
			isSelectMode
		});
	}
};

const toggleSelectMode = () => {
	return async (dispatch, getState) => await dispatch(triggerSelectMode(!getState().current.isSelectMode))
}

const triggerSearchMode = isSearchMode => ({
	type: TRIGGER_SEARCH_MODE,
	isSearchMode
});

const triggerResizeViewport = (width, height) => {
	return {
		type: TRIGGER_RESIZE_VIEWPORT,
		width,
		height
	};
};

const triggerUserTypeChange = userType => {
	return {
		type: TRIGGER_USER_TYPE_CHANGE,
		...userType
	}
}

const toggleAdvancedSearch = isAdvancedSearch => ({
	type: TOGGLE_ADVANCED_SEARCH, isAdvancedSearch
});

const toggleModal = (id, shouldOpen, config) => {
	return { type: TOGGLE_MODAL, id, shouldOpen, ...config }
}

const toggleNavbar = isOpen => {
	return { type: TOGGLE_NAVBAR, isOpen };
}

const toggleTagSelector = isOpen => {
	return { type: TOGGLE_TAG_SELECTOR, isOpen };
}

const toggleTouchTagSelector = isOpen => {
	return { type: TOGGLE_TOUCH_TAG_SELECTOR, isOpen };
}

const toggleTransitions = useTransitions => {
	return { type: TOGGLE_TRANSITIONS, useTransitions };
}

const toggleHideAutomaticTags = shouldHide => {
	return { type: TOGGLE_HIDE_AUTOMATIC_TAGS, shouldHide };
}

const dismissError = errorId => {
	return { type: DISMISS_ERROR, errorId };
}

const dismissErrorByTag = tag => {
	return { type: DISMISS_ERROR, errorTag: tag };
}

// Highlight waiting for the selected items to be fetched. Releasing the highlight key clears it, so a
// fetch that completes afterwards highlights nothing.
let pendingHighlight = null;

const endPendingHighlight = dispatch => {
	if(pendingHighlight) {
		dispatch({ type: END_STATUS, id: pendingHighlight.id });
		pendingHighlight = null;
	}
}

const triggerHighlightedCollections = isOn => {
	return async (dispatch, getState) => {
		const { itemKeys, libraryKey } = getState().current;
		if(isOn && itemKeys.length > 0) {
			if(pendingHighlight) {
				// repeated keydown while the selected items are being fetched
				return;
			}

			const isMissing = key => !getState().libraries[libraryKey]?.items?.[key];
			const missingKeys = itemKeys.filter(isMissing);
			if(missingKeys.length > 0) {
				const request = { id: getUniqueId() };
				pendingHighlight = request;
				dispatch({ type: BEGIN_STATUS, id: request.id, kind: FETCH_SELECTED_ITEMS });
				await dispatch(fetchItemsByKeys(missingKeys, { includeTrashed: 1 }, { current: { libraryKey } }));
				if(pendingHighlight !== request) {
					return;
				}
				endPendingHighlight(dispatch);

				// a failed fetch reports its own error
				const current = getState().current;
				if(current.libraryKey !== libraryKey || !shallowEqual(current.itemKeys, itemKeys) || itemKeys.some(isMissing)) {
					return;
				}
			}

			const state = getState();
			// child items are not in collections and have no `collections`
			const items = itemKeys.map(ik => state.libraries[libraryKey].items[ik]);
			let collections = new Set(items[0].collections ?? []);
			if(items.length > 1) {
				for(var i = 1; i < items.length; i++) {
					collections = new Set((items[i].collections ?? [])
						.filter(x => collections.has(x)));
				}
			}
			collections = [...collections];

			if(!shallowEqual(collections, state.current.highlightedCollections)) {
				dispatch({ type: TRIGGER_HIGHLIGHTED_COLLECTIONS, collections });
			}
		} else {
			endPendingHighlight(dispatch);
			if(getState().current.highlightedCollections.length !== 0) {
				// skip dispatching if no collection has been highlighted previously
				dispatch({ type: TRIGGER_HIGHLIGHTED_COLLECTIONS, collections: [] });
			}
		}
	}
}

const resetQuery = () => ({ type: RESET_QUERY });

const currentTriggerSearchMode = () => {
	return async (dispatch, getState) => {
		const { isSearchMode, itemsSource, view } = getState().current;

		if(isSearchMode) {
			dispatch(triggerSearchMode(false));
			dispatch(triggerSelectMode(false));
			dispatch(navigateExitSearch());
		} else {
			dispatch(triggerSearchMode(true));
			dispatch(triggerSelectMode(false));

			if(itemsSource === 'query' && view === 'item-details') {
				dispatch(navigate({ view: 'item-list' }));
			}
		}
	}
}

export {
	currentTriggerSearchMode, dismissError, dismissErrorByTag, resetQuery, toggleAdvancedSearch,
	toggleHideAutomaticTags, toggleModal, toggleNavbar, toggleSelectMode, toggleTagSelector,
	toggleTouchTagSelector, toggleTransitions, triggerEditingItem, triggerHighlightedCollections,
	triggerResizeViewport, triggerSearchMode, triggerSelectMode, triggerUserTypeChange, };
