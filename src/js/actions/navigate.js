import { makePath } from '../common/navigation';
import { getItemKeysPath } from '../common/state';
import { LOCATION_CHANGE } from '../constants/actions';
import { TRIGGER_VIEWPORT_CHANGE } from '../constants/actions';
import { get } from '../utils';
import { selectItemsKeyboard, selectItemsMouse } from '../common/selection';

const locationChange = (pathname, { action = 'POP', search = '', hash = '', key = '', isFirstRendering = false } = {}) => ({
	type: LOCATION_CHANGE,
	payload: {
		action,
		isFirstRendering,
		location: { pathname, search, hash, key },
	}
});

const push = (path) => {
	window.history.pushState({}, '', path);
	return locationChange(path);
}

const currentToPath = current => ({
	attachmentKey: current.attachmentKey,
	collection: current.collectionKey,
	items: current.itemKeys,
	library: current.libraryKey,
	noteKey: current.noteKey,
	publications: current.isMyPublications,
	qmode: current.qmode,
	search: current.search,
	tags: current.tags,
	trash: current.isTrash,
	view: current.view,
	location: current.location,
});


/**
 * Navigates to a specified path.
 *
 * @param {string} path - The path to navigate to.
 * @param {boolean} [isAbsolute=false] - Indicates whether the path is absolute or relative to the current path.
 * @param {boolean} [viewportChange=false] - Indicates whether a viewport change should be triggered after navigation.
 * This, for example, triggers table list to query for all item keys so that it can figure out where in the list target item is.
 * @returns {Function} - The async action function.
 */
const navigate = (path, isAbsolute = false, viewportChange = false) => {
	return async (dispatch, getState) => {
		const { config, current } = getState();
		const isEmbedded = config.isEmbedded;
		const pushFn = isEmbedded ? locationChange : push;
		if(isAbsolute) {
			const configuredPath = makePath(config, path);
			dispatch(pushFn(configuredPath));
		} else {
			const updatedPath = {
				...currentToPath(current),
				...path
			};
			const configuredPath = makePath(config, updatedPath);
			dispatch(pushFn(configuredPath));
		}
		if (viewportChange) {
			dispatch({
				type: TRIGGER_VIEWPORT_CHANGE,
			});
		}
	}
};

const openInReader = (path) => {
	return async (dispatch, getState) => {
		const state = getState();
		const readerPath = makePath(state.config, {
			...path,
			view: 'reader',
		});

		return window.open(readerPath);
	}
};

const navigateSelectItemsMouse = (targetItemKey, isShiftModifer, isCtrlModifer) => {
	return async (dispatch, getState) => {
		const state = getState();
		const { collectionKey, libraryKey, itemKeys: selectedItemKeys, itemsSource } = state.current;
		const { isEmbedded } = state.config;
		const path = [...getItemKeysPath({ itemsSource, libraryKey, collectionKey }), 'keys'];
		const keys = get(state, path, []);

		if (isEmbedded) {
			dispatch(navigate({ items: [targetItemKey], view: 'item-details' }));
			return;
		}

		const nextKeys = selectItemsMouse(targetItemKey, isShiftModifer, isCtrlModifer, { keys, selectedItemKeys });
		dispatch(navigate({ items: nextKeys, noteKey: null, attachmentKey: null }));
	}
}

const navigateSelectItemsKeyboard = (direction, magnitude, isMultiSelect) => {
	return async (dispatch, getState) => {
		const state = getState();
		const { collectionKey, libraryKey, itemKeys: selectedItemKeys, itemsSource } = state.current;
		const path = [...getItemKeysPath({ itemsSource, libraryKey, collectionKey }), 'keys'];
		const keys = get(state, path, []);

		const { nextKeys, cursorIndex } = selectItemsKeyboard(direction, magnitude, isMultiSelect, { keys, selectedItemKeys });

		if(typeof nextKeys === 'undefined') {
			return cursorIndex;
		}

		dispatch(navigate({ items: nextKeys, noteKey: null, attachmentKey: null }));
		return { nextKeys, cursorIndex };
	}
}

const selectFirstItem = (onlyIfNoneSelected = false) => {
	return async (dispatch, getState) => {
		const state = getState();
		const { collectionKey, libraryKey, itemKeys: selectedItemKeys, itemsSource } = state.current;
		const path = [...getItemKeysPath({ itemsSource, libraryKey, collectionKey }), 'keys'];

		if(onlyIfNoneSelected && selectedItemKeys.length > 0) {
			return null;
		}

		const keys = get(state, path, []);
		if(keys.length > 0) {
			dispatch(navigate({ items: [keys[0]], noteKey: null, attachmentKey: null, view: 'item-list' }));
			return 0;
		}
		return null;
	}
}

const selectLastItem = () => {
	return async (dispatch, getState) => {
		const state = getState();
		const { collectionKey, libraryKey, itemsSource } = state.current;
		const path = [...getItemKeysPath({ itemsSource, libraryKey, collectionKey }), 'keys'];

		const keys = get(state, path, []);
		if(keys.length > 0) {
			dispatch(navigate({ items: [keys[keys.length - 1]], noteKey: null, attachmentKey: null }));
			return keys.length - 1;
		}
		return null;
	}
}

const navigateExitSearch = () => {
	return async (dispatch, getState) => {
		const state = getState();
		const { collectionKey, isMyPublications, isTrash, libraryKey, searchState, view, itemKey, tags } =
		state.current;

		dispatch(navigate({
			library: view === 'libraries' ? null : libraryKey,
			collection: collectionKey,
			items: searchState.triggerView === 'item-details' && searchState.triggerItem ? searchState.triggerItem : itemKey,
			trash: isTrash,
			tags: tags,
			attachmentKey: searchState.attachmentKey || null,
			noteKey: searchState.noteKey || null,
			publications: isMyPublications,
			view: searchState.triggerView ?
				searchState.triggerView === 'item-details' ?
					searchState.triggerItem ? 'item-details' : 'item-list'
					: searchState.triggerView
				: view
		}, true));
	}
}

const redirectIfCollectionNotFound = () => {
	return async (dispatch, getState) => {
		const state = getState();
		const libraryKey = state.current.libraryKey;
		const collectionKey = state.current.collectionKey;
		const dataObjects = state.libraries[libraryKey]?.dataObjects;

		if (collectionKey !== null && dataObjects !== null && !(collectionKey in dataObjects)) {
			process.env.NODE_ENV === 'development' && console.warn(`Collection ${collectionKey} not found in library ${libraryKey}`);
			dispatch(navigate({ library: libraryKey, view: 'library' }, true));
		}
	}
}

// navigate to given item, if we know that the target item belongs to current collection, keep the collection view and scroll to the item. Otherwise, exit the collection.
const navigateToItemInSharedCollection = (itemKey, other = {}) => {
	return async (dispatch, getState) => {
		const state = getState();
		const collectionKey = state.current.collectionKey;
		const libraryKey = state.current.libraryKey;
		const dataObjects = state.libraries[libraryKey]?.dataObjects;
		const item = dataObjects?.[itemKey];
		if (item) {
			if (collectionKey && item.collections.includes(collectionKey)) {
				// navigate within the collection, scroll to the item
				dispatch(navigate({ items: [itemKey], ...other }, false, true));
			} else {
				// navigate to the root library view with the item selected
				dispatch(navigate({ items: [itemKey], ...other }, true, true));
			}
		}
	}
}

export { locationChange, navigate, navigateExitSearch, navigateSelectItemsKeyboard, navigateSelectItemsMouse, openInReader, redirectIfCollectionNotFound, selectFirstItem, selectLastItem, navigateToItemInSharedCollection };
