import { Fragment, memo, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Spinner } from 'web-common/components';

import { FETCH_SELECTED_ITEMS } from '../../../constants/status';

// Activities that end sooner are never shown, so quick requests don't flash a spinner
const SHOW_DELAY = 200;

const MESSAGES = {
	[FETCH_SELECTED_ITEMS]: () => 'Loading selected items…',
};

const StatusIndicator = () => {
	const isActive = useSelector(state => state.status.length > 0);
	const message = useSelector(state => {
		const latest = state.status[state.status.length - 1];
		return latest ? (MESSAGES[latest.kind]?.(latest.data) ?? 'Loading…') : null;
	});
	const [isDelayElapsed, setIsDelayElapsed] = useState(false);
	const isVisible = isActive && isDelayElapsed;

	useEffect(() => {
		if(!isActive) {
			return;
		}
		const timeout = setTimeout(() => setIsDelayElapsed(true), SHOW_DELAY);
		return () => {
			clearTimeout(timeout);
			setIsDelayElapsed(false);
		};
	}, [isActive]);

	// The status region stays rendered so that screen readers announce the message when it appears
	return (
		<div className="status-indicator" role="status" title={ isVisible ? message : undefined }>
			{ isVisible && (
				<Fragment>
					<Spinner small aria-hidden="true" />
					<span className="offscreen">{ message }</span>
				</Fragment>
			) }
		</div>
	);
}

export default memo(StatusIndicator);
