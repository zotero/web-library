import { memo, useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { triggerResizeViewport } from '../actions';

const ViewportDetector = () => {
	const dispatch = useDispatch();
	const windowResizeHandler = useCallback(() => {
		dispatch(triggerResizeViewport(window.innerWidth, window.innerHeight));
	}, [dispatch]);

	useEffect(() => {
		window.addEventListener('resize', windowResizeHandler);

		return () => {
			window.removeEventListener('resize', windowResizeHandler);
		}
	}, [windowResizeHandler]);

	return null;
}

export default memo(ViewportDetector);
