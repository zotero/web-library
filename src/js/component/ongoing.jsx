import cx from 'classnames';
import { memo, useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { pluralize } from '../common/format';
import { Spinner } from 'web-common/components';

const getMessage = ongoing => {
	switch(ongoing.kind) {
		case 'upload':
			return `Uploading ${ongoing.count} ${pluralize('file', ongoing.count)}`;
		case 'cross-library-copy-items':
			return `Copying ${ongoing.count} ${pluralize('item', ongoing.count)}`;
	}
}

const Ongoing = () => {
	const processes = useSelector(state => state.ongoing);
	const [flash, setFlash] = useState(false);

	const handleOnBeforeUnload = useCallback((ev) => {
		if (processes.length > 0) {
			// If user cancelled the unload, flash the ongoing pane to
			// indicate that there are ongoing operations
			setTimeout(() => setFlash(true), 0);
			ev.preventDefault();
		}
	}, [processes.length]);

	useEffect(() => {
		window.addEventListener("beforeunload", handleOnBeforeUnload);
		return () => {
			window.removeEventListener("beforeunload", handleOnBeforeUnload);
		}
	}, [handleOnBeforeUnload]);

	useEffect(() => {
		if (flash) {
			const timer = setTimeout(() => {
				setFlash(false);
			}, 700); // animation takes 2x330ms
			return () => {
				clearTimeout(timer);
			}
		}
	}, [flash]);

	return (
		<div className={ cx("ongoing-pane hidden-touch hidden-sm-down", { flash }) }>
			{ processes.length > 1 ? (
				<div className="process">
					<Spinner className="small" />
					<div className="ongoing-text">Multiple ongoing operations …</div>
				</div>
			) : null }
			{ processes.length === 1 ? (
				<div className="process">
					<Spinner className="small" />
					<div className="ongoing-text">{ getMessage(processes[0]) }</div>
				</div>
			) : null }
		</div>
	);
}


export default memo(Ongoing);
