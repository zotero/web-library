import { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { triggerResizeViewport } from '../actions';

const ViewportDetector = () => {
	const dispatch = useDispatch();
	const windowResizeHandler = useCallback(() => {
		dispatch(triggerResizeViewport(window.innerWidth, window.innerHeight));
	});

	useEffect(() => {
		window.addEventListener('resize', windowResizeHandler);

		return () => {
			window.removeEventListener('resize', windowResizeHandler);
		}
	}, []);

	return null;
}

export default ViewportDetector;
