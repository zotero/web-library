import React, { memo, useCallback, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from 'web-common/components';

import AddLinkedUrlForm from '../item-details/add-linked-url-form';
import Modal from '../ui/modal';
import { ADD_LINKED_URL_TOUCH } from '../../constants/modals';
import { toggleModal } from '../../actions';

const AddLinkedUrlTouchModal = () => {
	const dispatch = useDispatch();
	const formRef = useRef(null);
	const isOpen = useSelector(state => state.modal.id === ADD_LINKED_URL_TOUCH && state.device.isTouchOrSmall);
	const [isBusy, setIsBusy] = useState(false);

	const handleClose = useCallback(() => {
		dispatch(toggleModal(null, false));
	}, [dispatch]);

	const handleCreateClick = useCallback(async () => {
		setIsBusy(true);
		const isSuccess = await formRef.current.submit();
		if(isSuccess) {
			setTimeout(() => setIsBusy(false), 300);
			dispatch(toggleModal(null, false));
		} else {
			setIsBusy(false);
		}
	}, [dispatch]);

	return (
		<Modal
			className="modal-touch"
			contentLabel="Add Linked URL Attachment"
			isBusy={ isBusy }
			isOpen={ isOpen }
			onRequestClose={ handleClose }
			overlayClassName="modal-slide modal-centered"
		>
			<div className="modal-header">
				<div className="modal-header-left">
					<Button
						className="btn-link"
						onClick={ handleClose }
						disabled={ isBusy }
					>
						Cancel
					</Button>
				</div>
				<div className="modal-header-center">
					<h4 className="modal-title truncate">
						Add Linked URL Attachment
					</h4>
				</div>
				<div className="modal-header-right">
					<Button
						className="btn-link"
						disabled={ isBusy }
						onClick={ handleCreateClick }
					>
						Add
					</Button>
				</div>
			</div>
			<div className="modal-body">
				<AddLinkedUrlForm
					onClose={ handleClose }
					ref={ formRef }
				/>
			</div>
		</Modal>
	)
}

export default memo(AddLinkedUrlTouchModal);
