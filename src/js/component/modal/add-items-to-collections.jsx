import deepEqual from 'deep-equal';
import PropTypes from 'prop-types';
import React, { memo, useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Button from '../ui/button';
import Icon from '../ui/icon';
import Libraries from '../../component/libraries';
import Modal from '../ui/modal';
import TouchHeader from '../touch-header.jsx';
import { chunkedCopyToLibrary, chunkedAddToCollection, toggleModal, triggerSelectMode } from '../../actions';
import { COLLECTION_SELECT } from '../../constants/modals';
import { useNavigationState } from '../../hooks';

const AddItemsToCollectionsModal = () => {
	const dispatch = useDispatch();

	const libraryKey = useSelector(state => state.current.libraryKey);
	const isOpen = useSelector(state => state.modal.id === COLLECTION_SELECT);
	const sourceItemKeys = useSelector(state => state.modal.items);
	const isTouchOrSmall = useSelector(state => state.device.isTouchOrSmall);
	const {navState, touchHeaderPath, handleNavigation, resetNavState} = useNavigationState();

	const [isBusy, setBusy] = useState(false);
	const [picked, setPicked] = useState([]);

	useEffect(() => {
		if(!isOpen) {
			resetNavState();
			setPicked([]);
		}
	}, [resetNavState, isOpen]);

	const pickerPick = useCallback(newPicked => {
		if(deepEqual(picked, newPicked)) {
			setPicked([]);
		} else {
			setPicked([newPicked]);
		}
	}, [picked]);

	const handleAddItems = useCallback(async () => {
		if(picked.length === 0) {
			return;
		}

		const { libraryKey: targetLibraryKey, collectionKey: targetCollectionKey } = picked[0];

		setBusy(true);

		if(targetLibraryKey === libraryKey) {
			await dispatch(
				chunkedAddToCollection(sourceItemKeys, targetCollectionKey)
			);
		} else {
			await dispatch(
				chunkedCopyToLibrary(sourceItemKeys, libraryKey, targetLibraryKey, targetCollectionKey)
			);
		}
		setBusy(false);
		dispatch(toggleModal(null, false));
		dispatch(triggerSelectMode(false, true));
	}, [dispatch, sourceItemKeys, libraryKey, picked]);

	const handleCancel = useCallback(() => {
		dispatch(toggleModal(null, false));
	}, [dispatch]);

	return (
		<Modal
			className="modal-touch collection-select-modal"
			contentLabel="Select Collection"
			isBusy={ isBusy }
			isOpen={ isOpen }
			onRequestClose={ handleCancel }
			overlayClassName="modal-slide modal-full-height modal-centered"
		>
			<div className="modal-body">
				<React.Fragment>
				{ isTouchOrSmall ? (
					<TouchHeader
						isModal={ true }
						className="darker"
						path={ touchHeaderPath }
						onNavigate={ handleNavigation }
					/>
				) : (
					<React.Fragment>
						<div className="modal-header">
						<h4 className="modal-title truncate">
							Select target library or collection
						</h4>
						<Button
							icon
							className="close"
							onClick={ handleCancel }
						>
							<Icon type={ '16/close' } width="16" height="16" />
						</Button>
					</div>
					</React.Fragment>
				) }
				<Libraries
					isPickerMode={ true }
					picked={ picked }
					pickerIncludeLibraries={ true }
					pickerNavigate={ handleNavigation }
					pickerPick={ pickerPick }
					pickerState= { { ...navState, picked } }
				/>
				</React.Fragment>
			</div>
			{ isTouchOrSmall ? (
				<React.Fragment>
					<div className="modal-footer">
						<div className="modal-footer-left">
							<Button
								className="btn-link"
								onClick={ () => dispatch(toggleModal(null, false)) }
							>
								Cancel
							</Button>
						</div>
						<div className="modal-footer-center">
							<h4 className="modal-title truncate">
								{
									picked.length > 0 ?
									'Confirm Add to Collection?' :
									'Select a Collection'
								}
							</h4>
						</div>
						<div className="modal-footer-right">
							<Button
								disabled={ picked.length === 0}
								className="btn-link"
								onClick={ handleAddItems }
							>
								Add
							</Button>
						</div>
					</div>
				</React.Fragment>
			) : (
				<React.Fragment>
					<div className="modal-footer justify-content-end">
						<Button
							disabled={ picked.length === 0}
							className="btn-link"
							onClick={ handleAddItems }
						>
							Add
						</Button>
					</div>
				</React.Fragment>
			) }
		</Modal>
	);
}

AddItemsToCollectionsModal.propTypes = {
	items: PropTypes.array,
}

export default memo(AddItemsToCollectionsModal);
