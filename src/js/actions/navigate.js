import { makePath } from '../common/navigation';
import { getItemKeysPath } from '../common/state';
import { push } from 'connected-react-router';
import { clamp, get } from '../utils';

const navigate = (path, isAbsolute = false) => {
	return async (dispatch, getState) => {
		const { config, current } = getState();
		if(isAbsolute) {
			const configuredPath = makePath(config, path);
			dispatch(push(configuredPath));
		} else {
			const updatedPath = {
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
				...path
			};
			const configuredPath = makePath(config, updatedPath);
			dispatch(push(configuredPath));
		}
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
			dispatch(navigate({ items: [keys[0]], noteKey: null, attachmentKey: null }));
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
		const path = [...getItemKeysPath({ itemsSource, libraryKey, collectionKey }), 'keys'];
		const keys = get(state, path, []);
		var newKeys;

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


export { navigate, navigateExitSearch, selectFirstItem, selectItemsKeyboard, selectItemsMouse, selectLastItem };
