import { memo, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useThrottledCallback } from 'use-debounce';

import { triggerResizeViewport } from '../actions';

const ViewportDetector = () => {
	const dispatch = useDispatch();

	const throttledWindowResizeHandler = useThrottledCallback(() => {
		dispatch(triggerResizeViewport(window.innerWidth, window.innerHeight));
	}, 250, { leading: false });

	useEffect(() => {
		window.addEventListener('resize', throttledWindowResizeHandler);

		return () => {
			window.removeEventListener('resize', throttledWindowResizeHandler);
		}
	}, [throttledWindowResizeHandler]);

	return null;
}

export default memo(ViewportDetector);
