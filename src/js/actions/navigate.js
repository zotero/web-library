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

const selectItems = (direction, magnitude, isMultiSelect) => {
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
					var boundry = invertedDirection > 0 ? keys.length - 1 : 0;

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

		dispatch(navigate({ items: nextKeys }));
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
			dispatch(navigate({ items: [keys[0]] }));
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
			dispatch(navigate({ items: [keys[keys.length - 1]] }));
			return keys.length - 1;
		}
		return null;
	}
}


export { navigate, selectItems, selectFirstItem, selectLastItem };
