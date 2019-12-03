import { useState, useCallback } from 'react';

const useForceUpdate = () => {
	const [, setTick] = useState(0);
	const update = useCallback(() => {
		setTick(tick => tick + 1);
	}, []);
	return update;
}

export { useForceUpdate };
