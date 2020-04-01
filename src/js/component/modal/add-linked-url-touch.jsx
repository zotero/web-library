import React, { useCallback, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import cx from 'classnames';

import AddLinkedUrlForm from '../item-details/add-linked-url-form';
import Button from '../ui/button';
import Modal from '../ui/modal';
import Spinner from '../ui/spinner';
import { ADD_LINKED_URL_TOUCH } from '../../constants/modals';
import { toggleModal } from '../../actions';

const AddLinkedUrlTouchModal = () => {
	const dispatch = useDispatch();
	const formRef = useRef(null);
	const isOpen = useSelector(state => state.modal.id === ADD_LINKED_URL_TOUCH);
	const [isBusy, setIsBusy] = useState(false);

	const handleClose = useCallback(() => {
		dispatch(toggleModal(null, false));
	});

	const handleCreateClick = useCallback(async () => {
		setIsBusy(true);
		await formRef.current.submit();
		setTimeout(() => setIsBusy(false), 300);
	});

	return (
		<Modal
			isOpen={ isOpen }
			contentLabel="Add Linked URL Attachment"
			className={ cx('modal-touch', 'modal-centered', {
				loading: isBusy
			}) }
			onRequestClose={ handleClose }
			closeTimeoutMS={ 200 }
			overlayClassName={ "modal-slide" }
		>
			{ isBusy ? <Spinner className="large" /> : (
				<div className="modal-content" tabIndex={ -1 }>
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
				</div>
			) }
		</Modal>
	)
}

export default AddLinkedUrlTouchModal;
