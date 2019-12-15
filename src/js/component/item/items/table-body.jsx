import React, { useEffect, forwardRef, memo, useCallback, useRef } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';

import { chunkedTrashOrDelete, navigate, triggerFocus } from '../../../actions';
import { useSourceData } from '../../../hooks';

const TableBody = memo(forwardRef((props, ref) => {
	const tableBodyRef = useRef(null);
	const dispatch = useDispatch();
	const selectedItemKeys = useSelector(state => state.current.itemKeys, shallowEqual);
	const isFocused = useSelector(state => state.current.isItemsTableFocused);
	const { keys } = useSourceData();

	const handleFocus = useCallback(ev => {
		if(isFocused) {
			return;
		}

		ev.preventDefault();

		if(selectedItemKeys && keys && selectedItemKeys.length === 0 && keys.length > 0) {
			dispatch(navigate({
				items: [keys[0]]
			}));
		}
		dispatch(triggerFocus('items-table', true));
	});

	const handleBlur = useCallback(() => {
		dispatch(triggerFocus('items-table', false));
	});

	const handleKeyDown = useCallback(ev => {
		var vector;
		if(ev.key === 'ArrowUp') {
			vector = -1;
		} else if(ev.key === 'ArrowDown') {
			vector = 1;
		} else if(ev.key === 'Backspace') {
			dispatch(chunkedTrashOrDelete(selectedItemKeys));
			dispatch(navigate({ items: [] }));
			return;
		} else if(ev.key === 'Home' && keys) {
			if(keys[0]) {
				dispatch(navigate({ items: [keys[0]] }));
			}
		} else if(ev.key === 'End') {
			if(keys[keys.length - 1]) {
				dispatch(navigate({ items: [keys[keys.length - 1]] }));
			}
		} else {
			return;
		}

		if(!vector) {
			return;
		}

		ev.preventDefault();

		const lastItemKey = selectedItemKeys[selectedItemKeys.length - 1];
		const index = keys.findIndex(key => key && key === lastItemKey);
		const nextIndex = index + vector;

		//check bounds
		if(vector > 0 && index + 1 >= keys.length) {
			return;
		}

		var nextKeys;

		if(vector < 0 && index + vector < 0) {
			if(!ev.getModifierState('Shift')) {
				nextKeys = [];
				dispatch(triggerFocus('items-table', false));
				tableBodyRef.current.closest('.items-table').querySelector('.items-table-head').focus();
			}
		} else {
			if(ev.getModifierState('Shift')) {
				if(selectedItemKeys.includes(keys[nextIndex])) {
					if(keys.slice(...(vector > 0 ? [0, index] : [index + 1])).some(
						key => selectedItemKeys.includes(key)
					)) {
						let offset = 1;
						let boundry = vector > 0 ? keys.length - 1 : 0;
						while(index + (offset * vector) !== boundry &&
							selectedItemKeys.includes(keys[index + (offset * vector)].key)
						) {
							offset++;
						}
						var consecutiveCounter = 1;
						while(selectedItemKeys.includes(keys[index + (offset * vector) + consecutiveCounter].key)) {
							consecutiveCounter++;
						}
						var consecutiveKeys;
						if(vector > 0) {
							consecutiveKeys = keys.slice(index + offset - consecutiveCounter + 1, index + offset);
						} else {
							consecutiveKeys = keys.slice(index - offset, index - offset + consecutiveCounter).reverse();
						}
						nextKeys = [
							...selectedItemKeys.filter(k => !consecutiveKeys.includes(k)),
							...consecutiveKeys,
							keys[index + (offset * vector)]
						];
					} else {
						nextKeys = selectedItemKeys.filter(k => k !== keys[index]);
					}
				} else {
					nextKeys = [...selectedItemKeys, keys[nextIndex]];
				}
			} else {
				nextKeys = [keys[nextIndex]];
			}
		}
		dispatch(navigate({ items: nextKeys }));
	});

	useEffect(() => {
		return () => dispatch(triggerFocus('items-table', false));
	}, [])

	return (
		<div
			{ ... props }
			ref={ r => { ref(r); tableBodyRef.current = r } }
			onFocus={ handleFocus }
			onBlur={ handleBlur }
			tabIndex={ 0 }
			onKeyDown={ handleKeyDown }
		/>
	);

}));

TableBody.displayName = 'TableBody';

export default TableBody;
