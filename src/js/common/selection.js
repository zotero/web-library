import { clamp } from '../utils.js';

// Keys from the selection anchor (first selected key) to `targetIndex`, anchor first. Returns
// undefined if nothing is selected or any item in the range has not been fetched yet.
export const selectItemsRange = (targetIndex, { keys, selectedItemKeys }) => {
	const anchorIndex = selectedItemKeys?.length ? keys.findIndex(key => key && key === selectedItemKeys[0]) : -1;
	if (anchorIndex === -1) {
		return undefined;
	}
	const rangeKeys = keys.slice(Math.min(anchorIndex, targetIndex), Math.max(anchorIndex, targetIndex) + 1);
	// keys is a sparse array and .every() skips empty slots, so check each index
	for (let i = 0; i < rangeKeys.length; i++) {
		if (typeof rangeKeys[i] === 'undefined') {
			return undefined;
		}
	}
	return anchorIndex <= targetIndex ? rangeKeys : rangeKeys.reverse();
}

export const selectItemsMouse = (targetItemKey, isShiftModifer, isCtrlModifer, { keys, selectedItemKeys }) => {
	let nextKeys;

	if (isShiftModifer) {
		// Without a selection, the range starts at the first row
		const anchorKeys = selectedItemKeys.length ? selectedItemKeys : [keys[0]];
		const targetIndex = keys.findIndex(key => key && key === targetItemKey);
		// A range that includes items not fetched yet selects only the target
		nextKeys = selectItemsRange(targetIndex, { keys, selectedItemKeys: anchorKeys }) ?? [targetItemKey];
	} else if (isCtrlModifer) {
		if (selectedItemKeys.includes(targetItemKey)) {
			nextKeys = selectedItemKeys.filter(key => key !== targetItemKey);
		} else {
			nextKeys = [...(new Set([...selectedItemKeys, targetItemKey]))];
		}
	} else {
		nextKeys = [targetItemKey];
	}
	return nextKeys;
}

export const selectItemsKeyboard = (direction, magnitude, isMultiSelect, { keys, selectedItemKeys, overrideStartIndex }) => {
	const vector = direction * magnitude;
	let index = -1;
	if (typeof overrideStartIndex === 'number') {
		index = overrideStartIndex;
	} else {
		// Start from the last selected item that has a row. A selected item that isn't loaded has none.
		const keyIndexes = new Map();
		keys.forEach((key, keyIndex) => keyIndexes.set(key, keyIndex));
		for (let i = selectedItemKeys.length - 1; i >= 0; i--) {
			if (keyIndexes.has(selectedItemKeys[i])) {
				index = keyIndexes.get(selectedItemKeys[i]);
				break;
			}
		}
	}

	// There is no row to extend the selection upwards from
	if (index === -1 && isMultiSelect && direction === -1) {
		return {};
	}

	let nextKeys;
	let cursorIndex;

	if (direction === -1 && magnitude === 1 && index + vector < 0 && !isMultiSelect) {
		nextKeys = [];
		cursorIndex = -1;
	} else {
		const nextIndex = clamp(index + vector, 0, keys.length - 1);
		// Guard against navigating to an unfetched item (sparse array hole).
		// Return cursorIndex without nextKeys so that the dispatch is skipped.
		if (typeof keys[nextIndex] === 'undefined') {
			return { cursorIndex: nextIndex };
		}
		cursorIndex = nextIndex;
		if (isMultiSelect) {
			let alreadySelectedCounter = 0;
			let newKeys = [];

			for (let step = 1; step <= Math.abs(nextIndex - index); step++) {
				const nextKey = keys[index + step * direction];
				newKeys.push(nextKey);
				if (selectedItemKeys.includes(nextKey)) {
					alreadySelectedCounter++;
				}
			}

			const shouldUnselect = alreadySelectedCounter === magnitude;

			if (shouldUnselect) {
				nextKeys = selectedItemKeys.filter(k => k === keys[nextIndex] || (!newKeys.includes(k) && k !== keys[index]));
			} else {
				var invertedDirection = direction * -1;
				var consecutiveSelectedItemKeys = [];
				var reverseCounter = 0;
				var boundry = invertedDirection > 0 ? keys.length : -1;

				while (index + reverseCounter * invertedDirection !== boundry) {
					const nextKey = keys[index + reverseCounter * invertedDirection];
					if (selectedItemKeys.includes(nextKey)) {
						consecutiveSelectedItemKeys.push(nextKey);
						reverseCounter++;
					} else {
						break;
					}
				}
				consecutiveSelectedItemKeys.reverse();
				nextKeys = [...consecutiveSelectedItemKeys, ...newKeys];
			}

			if (nextKeys.length === 0) {
				nextKeys = [keys[nextIndex]];
			}
		} else {
			nextKeys = [keys[nextIndex]];
			cursorIndex = nextIndex;
		}
	}

	return { nextKeys, cursorIndex };
}
