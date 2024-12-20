import cx from 'classnames';
import { memo, useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { pluralize } from '../common/format';
import { Button, Spinner } from 'web-common/components';
import { usePrevious } from 'web-common/hooks';

import Modal from './ui/modal';
import { maxByKey } from '../utils';
import { navigate } from '../actions';

const PROCESSES = {
	'upload': {
		title: 'File Upload',
		action: (process, dispatch) => {
			dispatch(navigate({
				library: process.data.libraryKey,
				collection: process.data?.collectionKey,
				items: process.data?.createdItemsKeys
			}, true));
		},
		getActionLabel: process => `Select ${pluralize('File', process.data.count)}`,
		getMessage: process => `${process.completed ? 'Uploaded' : 'Uploading'} ${process.data.count} ${pluralize('file', process.data.count)}`,
		getHasAction: process => process.completed && process.data.createdItemsKeys?.length > 0,
	},
	'cross-library-copy-items': {
		title: 'Copying Items',
		getMessage: process => `${process.completed ? 'Copied' : 'Copying'} ${process.data.count} ${pluralize('item', process.data.count)}`,
	},
};

const OngoingProcessDescription = ({ process }) => {
	const dispatch = useDispatch();
	const handleActionClick = useCallback(() => {
		dispatch({ type: 'CLEAR_ONGOING', id: process.id });
		PROCESSES[process.kind]?.action(process, dispatch);
	}, [dispatch, process]);

	return (
		<li className="process">
			<div className="ongoing-text">
				{ PROCESSES[process.kind].getMessage(process) }
			</div>
			<span className="process-status">
				{ process.completed ? (
					<Button
						onClick={ handleActionClick }
						className="btn-link"
					>
						{ PROCESSES[process.kind]?.getActionLabel?.(process) ?? 'Dismiss' }
					</Button>
				) :
					<Spinner className="small" /> }
			</span>
		</li>
	);
}

OngoingProcessDescription.propTypes = {
	process: PropTypes.shape({
		id: PropTypes.string.isRequired,
		kind: PropTypes.string.isRequired,
		completed: PropTypes.bool.isRequired,
		data: PropTypes.object,
	}).isRequired
};

const Ongoing = () => {
	const dispatch = useDispatch();
	const processes = useSelector(state => state.ongoing);
	const activeProcesses = processes.filter(p => !p.completed);
	const prevActiveProcesses = usePrevious(activeProcesses);
	const isTouchOrSmall = useSelector(state => state.device.isTouchOrSmall);
	const [flash, setFlash] = useState(false);
	const [modalOpen, setModalOpen] = useState(false);

	const handleOnBeforeUnload = useCallback((ev) => {
		if (activeProcesses.length > 0) {
			// If user pressed cancel in onBeforeUnload, flash the ongoing pane to
			// indicate that there are ongoing operations
			setTimeout(() => setFlash(true), 0);
			ev.preventDefault();
		}
	}, [activeProcesses]);

	const handleProcessCompleted = useCallback((process) => {
		PROCESSES[process.kind]?.action?.(process, dispatch);
	}, [dispatch]);

	const handleOngoingCompleted = useCallback(() => {
		let lastProcessID = maxByKey(prevActiveProcesses, 'id')?.id;
		let lastProcess = processes.find(p => p.id === lastProcessID);
		if (!lastProcess) {
			return;
		}
		dispatch({ type: 'CLEAR_ONGOING', id: lastProcess.id });
		handleProcessCompleted(lastProcess);
	}, [dispatch, handleProcessCompleted, prevActiveProcesses, processes]);

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

	useEffect(() => {
		if (isTouchOrSmall && activeProcesses?.length > 0 && prevActiveProcesses?.length === 0) {
			setModalOpen(true);
		}
		if (isTouchOrSmall && activeProcesses?.length === 0 && prevActiveProcesses?.length > 0) {
			setModalOpen(false);
			handleOngoingCompleted();
		}
	}, [processes, isTouchOrSmall, handleOngoingCompleted, activeProcesses, prevActiveProcesses]);

	return (
		<>
			{ modalOpen && (
				<Modal
					className="modal-touch ongoing-modal"
					contentLabel="Upload files"
					isBusy={true}
					isOpen={false}
					shouldCloseOnEsc={false}
					overlayClassName="modal-centered modal-slide"
				>
				</Modal>
		) }
		<ul
			style={ processes.length > 0 ? { height: `${6 + 37 * processes.length}px` } : {} }
			className={ cx("ongoing-pane hidden-touch hidden-sm-down", { flash }) }
		>
			{ (processes || []).map(process => (
				<OngoingProcessDescription key={process.id} process={process} />
			)) }
		</ul>
	</>
	);
}


export default memo(Ongoing);
