import cx from 'classnames';
import { Fragment, useCallback, memo, useEffect } from 'react';
import { Button, Icon } from 'web-common/components';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { usePrevious } from 'web-common/hooks';

import Modal from '../ui/modal';
import { METADATA_RETRIEVAL } from '../../constants/modals';
import { currentRetrieveMetadata, toggleModal, navigate } from '../../actions';


const MetadataRetrievalModal = () => {
	const dispatch = useDispatch();
	const isTouchOrSmall = useSelector(state => state.device.isTouchOrSmall);
	const isOpen = useSelector(state => state.modal.id === METADATA_RETRIEVAL);
	const wasOpen = usePrevious(isOpen);
	const recognizeProgress = useSelector(state => state.recognize.progress);
	const recognizeEntries = useSelector(state => state.recognize.entries, shallowEqual);

	const handleCancel = useCallback(() => {
		dispatch(toggleModal());
	}, [dispatch]);

	useEffect(() => {
		if (isOpen && !wasOpen) {
			dispatch(currentRetrieveMetadata());
			// unselect items to be recognized. If recognition is successful, the items will become child items and thus disappear from the list
			setTimeout(() => { dispatch(navigate({ items: [] })); }, 0);
		}
	}, [dispatch, isOpen, wasOpen]);

	return (
		<Modal
			className={"recognize-modal"}
			contentLabel="Metadata Retrieval"
			isOpen={isOpen}
			onRequestClose={handleCancel}
			overlayClassName={cx({ 'modal-centered modal-slide': isTouchOrSmall })}
		>
			<div className="modal-header">
				{
					isTouchOrSmall ? (
						<Fragment>
							<div className="modal-header-center">
								<h4 className="modal-title truncate">
									Metadata Retrieval
								</h4>
							</div>
							<div className="modal-header-right">
								<Button
									className="btn-link"
									onClick={handleCancel}
								>
									Close
								</Button>
							</div>
						</Fragment>
					) : (
						<Fragment>
							<h4 className="modal-title truncate">
								Metadata Retrieval
							</h4>
							<Button
								icon
								className="close"
								onClick={handleCancel}
							>
								<Icon type={'16/close'} width="16" height="16" />
							</Button>
						</Fragment>
					)
				}
			</div>
			<div
				className="modal-body"
				tabIndex={!isTouchOrSmall ? 0 : null}
			>
				<div className="recognize-progress">
					<progress value={recognizeProgress} max="1" />
				</div>
				<div className="recognize-table">
					{recognizeEntries.map(recognize => {
						const { itemKey, libraryKey, error, completed, itemTitle, parentItemTitle } = recognize; //error, completed, parentItemKey
						const key = `${itemKey}-${libraryKey}`;

						return (
							<div
								key={key}
								className={cx('recognize-row')}
							>
								<div className="recognize-row-left">
									{itemTitle}
								</div>
								<div className="recognize-row-right">
									{completed ? parentItemTitle : error ? `Error: ${error}` : "Processing"}
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</Modal>
	);
}

export default memo(MetadataRetrievalModal);
