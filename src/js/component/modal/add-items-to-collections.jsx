import deepEqual from 'deep-equal';
import PropTypes from 'prop-types';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Button from '../ui/button';
import Icon from '../ui/icon';
import Libraries from '../../component/libraries';
import Modal from '../ui/modal';
import Spinner from '../ui/spinner';
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
	const isSingleColumn = useSelector(state => state.device.isSingleColumn);
	const {navState, touchHeaderPath, handleNavigation, resetNavState} = useNavigationState();

	// @TODO: to prevent re-renders we memoize as much of a "device" as TouchHeader requires.
	// 		  remove this once TouchHeader is rewritten to use useSelector instead
	const device = useMemo(() => ({ isTouchOrSmall, isSingleColumn }), [isTouchOrSmall, isSingleColumn]);
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
			isOpen={ isOpen }
			contentLabel="Select Collection"
			className="modal-touch modal-centered collection-select-modal"
			onRequestClose={ handleCancel }
			closeTimeoutMS={ 200 }
			overlayClassName={ "modal-slide" }
		>
			<div className="modal-content" tabIndex={ -1 }>
				<div className="modal-body">
					{
						isBusy ? <Spinner className="large" /> : (
							<React.Fragment>
							{ isTouchOrSmall ? (
								<TouchHeader
									className="darker"
									device={ device }
									path={ touchHeaderPath }
									navigate={ handleNavigation }
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
								pickerPick={ pickerPick }
								picked={ picked }
								pickerNavigate={ handleNavigation }
								pickerState= { { ...navState, picked } }
							/>
							</React.Fragment>
						)
					}
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
			</div>
		</Modal>
	);
}

AddItemsToCollectionsModal.propTypes = {
	items: PropTypes.array,
}

export default memo(AddItemsToCollectionsModal);
