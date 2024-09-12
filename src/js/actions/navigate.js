import { makePath } from '../common/navigation';
import { getItemKeysPath } from '../common/state';
import { LOCATION_CHANGE, push } from 'connected-react-router';
import { TRIGGER_VIEWPORT_CHANGE } from '../constants/actions';
import { clamp, get } from '../utils';

const pushEmbedded = (path) => ({
	type: LOCATION_CHANGE,
	payload: {
		location: {
			pathname: path,
			search: '',
			hash: '',
			key: '',
		},
		action: 'POP',
		isFirstRendering: false
	}
});

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
		const pushFn = isEmbedded ? pushEmbedded : push;
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

const selectItemsKeyboard = (direction, magnitude, isMultiSelect) => {
	return async (dispatch, getState) => {
		const state = getState();
		const { collectionKey, libraryKey, itemKeys: selectedItemKeys, itemsSource } = state.current;
		const path = [...getItemKeysPath({ itemsSource, libraryKey, collectionKey }), 'keys'];

		const keys = get(state, path, []);

		const vector = direction * magnitude;
		const lastItemKey = selectedItemKeys[selectedItemKeys.length - 1];
		const index = keys.findIndex(key => key && key === lastItemKey);

		var nextKeys;
		var cursorIndex;

		if(direction === -1 && magnitude === 1 && index + vector < 0 && !isMultiSelect) {
			nextKeys = [];
			cursorIndex = -1;
		} else {
			const nextIndex = clamp(index + vector, 0, keys.length -1);
			cursorIndex = nextIndex;
			if(isMultiSelect) {
				let counter = 1;
				let alreadySelectedCounter = 0;
				let newKeys = [];

				while(index + counter * direction !== nextIndex + direction) {
					const nextKey = keys[index + counter * direction];
					newKeys.push(nextKey);
					if(selectedItemKeys.includes(nextKey)) {
						alreadySelectedCounter++;
					}
					counter++;
				}

				const shouldUnselect = alreadySelectedCounter === magnitude;

				if(shouldUnselect) {
					nextKeys = selectedItemKeys.filter(k => k === keys[nextIndex] || (!newKeys.includes(k) && k !== keys[index]));
				} else {
					var invertedDirection = direction * -1;
					var consecutiveSelectedItemKeys = [];
					var reverseCounter = 0;
					var boundry = invertedDirection > 0 ? keys.length : -1;

					while(index + reverseCounter * invertedDirection !== boundry) {
						const nextKey = keys[index + reverseCounter * invertedDirection];
						if(selectedItemKeys.includes(nextKey)) {
							consecutiveSelectedItemKeys.push(nextKey);
							reverseCounter++;
						} else {
							break;
						}
					}
					consecutiveSelectedItemKeys.reverse();
					nextKeys = [...consecutiveSelectedItemKeys, ...newKeys];
				}

				if(nextKeys.length === 0) {
					nextKeys = [keys[nextIndex]];
				}
			} else {
				nextKeys = [keys[nextIndex]];
				cursorIndex = nextIndex;
			}
		}

		if(typeof nextKeys === 'undefined') {
			return cursorIndex;
		}

		dispatch(navigate({ items: nextKeys, noteKey: null, attachmentKey: null }));
		return cursorIndex;
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

const selectItemsMouse = (targetItemKey, isShiftModifer, isCtrlModifer) => {
	return async (dispatch, getState) => {
		const state = getState();
		const { collectionKey, libraryKey, itemKeys: selectedItemKeys, itemsSource } = state.current;
		const { isEmbedded } = state.config;
		const path = [...getItemKeysPath({ itemsSource, libraryKey, collectionKey }), 'keys'];
		const keys = get(state, path, []);
		var newKeys;

		if(isEmbedded) {
			dispatch(navigate({ items: [targetItemKey ], view: 'item-details' }));
			return;
		}

		if(isShiftModifer) {
			let startIndex = selectedItemKeys.length ? keys.findIndex(key => key && key === selectedItemKeys[0]) : 0;
			let endIndex = keys.findIndex(key => key && key === targetItemKey);
			let isFlipped = false;
			if(startIndex > endIndex) {
				[startIndex, endIndex] = [endIndex, startIndex];
				isFlipped = true;
			}

			endIndex++;
			newKeys = keys.slice(startIndex, endIndex);
			if(isFlipped) {
				newKeys.reverse();
			}
		} else if(isCtrlModifer) {
			if(selectedItemKeys.includes(targetItemKey)) {
				newKeys = selectedItemKeys.filter(key => key !== targetItemKey);
			} else {
				newKeys = [...(new Set([...selectedItemKeys, targetItemKey]))];
			}
		} else {
			newKeys = [targetItemKey];
		}
		dispatch(navigate({ items: newKeys, noteKey: null, attachmentKey: null }));
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

export { navigate, navigateExitSearch, openInReader, redirectIfCollectionNotFound, selectFirstItem, selectItemsKeyboard, selectItemsMouse, selectLastItem };
