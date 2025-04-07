import { clamp } from '../utils.js';

export const selectItemsMouse = (targetItemKey, isShiftModifer, isCtrlModifer, { keys, selectedItemKeys }) => {
	let nextKeys;

	if (isShiftModifer) {
		let startIndex = selectedItemKeys.length ? keys.findIndex(key => key && key === selectedItemKeys[0]) : 0;
		let endIndex = keys.findIndex(key => key && key === targetItemKey);
		let isFlipped = false;
		if (startIndex > endIndex) {
			[startIndex, endIndex] = [endIndex, startIndex];
			isFlipped = true;
		}

		endIndex++;
		nextKeys = keys.slice(startIndex, endIndex);
		if (isFlipped) {
			nextKeys.reverse();
		}
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

export const selectItemsKeyboard = (direction, magnitude, isMultiSelect, { keys, selectedItemKeys }) => {
	const vector = direction * magnitude;
	const lastItemKey = selectedItemKeys[selectedItemKeys.length - 1];
	const index = keys.findIndex(key => key && key === lastItemKey);

	let nextKeys;
	let cursorIndex;

	if (direction === -1 && magnitude === 1 && index + vector < 0 && !isMultiSelect) {
		nextKeys = [];
		cursorIndex = -1;
	} else {
		const nextIndex = clamp(index + vector, 0, keys.length - 1);
		cursorIndex = nextIndex;
		if (isMultiSelect) {
			let counter = 1;
			let alreadySelectedCounter = 0;
			let newKeys = [];

			while (index + counter * direction !== nextIndex + direction) {
				const nextKey = keys[index + counter * direction];
				newKeys.push(nextKey);
				if (selectedItemKeys.includes(nextKey)) {
					alreadySelectedCounter++;
				}
				counter++;
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
