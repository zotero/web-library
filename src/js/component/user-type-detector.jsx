'use strict';

import { useCallback, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';

import { triggerUserTypeChange } from '../actions';

const keysToTriggerKeyboardMode = ['Tab', 'ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp'];

const UserTypeDetector = () => {
	const dispatch = useDispatch();
	const lastTouchStartEvent = useRef(0);

	const handleKeyboard = useCallback(ev => {
		if(keysToTriggerKeyboardMode.includes(ev.key)) {
			dispatch(triggerUserTypeChange({ 'isKeyboardUser': true, }));
		}
	}, [dispatch]);

	const handleMouse = useCallback(ev => {
		// prevent simulated mouse events triggering mouse user
		if(!lastTouchStartEvent.current || ev.timeStamp - lastTouchStartEvent.current > 500) {
			dispatch(triggerUserTypeChange({
				'isKeyboardUser': false,
				'isMouseUser': true,
				'isTouchUser': false,
				'userType': 'mouse'
			}));
		}
	}, [dispatch]);

	const handleTouch = useCallback(ev => {
		lastTouchStartEvent.current = ev.timeStamp;
		dispatch(triggerUserTypeChange({
			'isKeyboardUser': false,
			'isMouseUser': false,
			'isTouchUser': true,
			'userType': 'touch'
		}));
	}, [dispatch]);

	useEffect(() => {
		document.addEventListener('keyup', handleKeyboard);
		document.addEventListener('mousedown', handleMouse);
		document.addEventListener('touchstart', handleTouch);

		return () => {
			document.removeEventListener('keyup', handleKeyboard);
			document.removeEventListener('mousedown', handleMouse);
			document.removeEventListener('touchstart', handleTouch);
		}
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	return null;
}

export default UserTypeDetector;
