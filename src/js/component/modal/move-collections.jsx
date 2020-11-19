import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Button from '../ui/button';
import deepEqual from 'deep-equal';
import Libraries from '../libraries';
import Modal from '../ui/modal';
import Spinner from '../ui/spinner';
import TouchHeader from '../touch-header.jsx';
import { MOVE_COLLECTION } from '../../constants/modals';
import { toggleModal, updateCollection } from '../../actions';
import { useNavigationState } from '../../hooks';
import { get } from '../../utils';

const MoveCollectionsModal = () => {
	const dispatch = useDispatch();
	const collectionKey = useSelector(state => state.modal.collectionKey);
	const libraryKey = useSelector(state => state.modal.libraryKey);
	const currentParentCollectionKey = useSelector(
		state => get(state, ['libraries', libraryKey, 'collections', 'data', collectionKey, 'parentCollection'], false)
	);
	const isOpen = useSelector(state => state.modal.id === MOVE_COLLECTION);
	const isSingleColumn = useSelector(state => state.device.isSingleColumn);
	const [isBusy, setIsBusy] = useState(false);
	const [picked, setPicked] = useState([]);
	const {navState, touchHeaderPath, handleNavigation, resetNavState} = useNavigationState();

	// @TODO: to prevent re-renders we memoize as much of a "device" as TouchHeader requires.
	// 		  remove this once TouchHeader is rewritten to use useSelector instead
	const device = useMemo(() => ({ isSingleColumn }), [isSingleColumn]);

	useEffect(() => {
		if(!isOpen) {
			resetNavState();
			setPicked([]);
		}
	}, [resetNavState, isOpen]);

	const handlePick = useCallback(newPicked => {
		if(deepEqual(picked, newPicked)) {
			setPicked([]);
		} else {
			setPicked([newPicked]);
		}
	}, [picked]);

	const handleMove = useCallback(async () => {
		if(picked.length > 0 && 'libraryKey' in picked[0]) {
			const pickedCollectionKey = picked[0].collectionKey || false;
			if(picked[0].libraryKey !== libraryKey) {
				//@TODO: Support for moving collections across libraries #227
				return;
			}

			if(picked[0].libraryKey === libraryKey) {
				if(pickedCollectionKey === collectionKey) {
					//@TODO: handle case where source collection is a non-immediate parent of a target collection
					return;
				}

				if(pickedCollectionKey === currentParentCollectionKey) {
					// @NOTE: if parentCollection hasn't change, don't send the update
					// otherwise we get an invalid version back (https://github.com/zotero/dataserver/issues/81)
					return;
				}
			}
			setIsBusy(true);
			const patch = { parentCollection: pickedCollectionKey };
			await dispatch(updateCollection(collectionKey, patch, libraryKey));
			setIsBusy(false);
			dispatch(toggleModal(MOVE_COLLECTION, false));
		}
	}, [collectionKey, currentParentCollectionKey, dispatch, libraryKey, picked]);

	const handleCancel = useCallback(() => dispatch(toggleModal(MOVE_COLLECTION, false)), [dispatch]);

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
							<TouchHeader
								isModal={ true }
								className="darker"
								device={ device }
								path={ touchHeaderPath }
								onNavigate={ handleNavigation }
							/>
							<Libraries
								pickerIncludeLibraries={ true }
								isPickerMode={ true }
								pickerPick={ handlePick }
								picked={ picked }
								pickerNavigate={ handleNavigation }
								pickerState= { navState }
							/>
							</React.Fragment>
						)
					}
				</div>
				<div className="modal-footer">
					<div className="modal-footer-left">
						<Button
							className="btn-link"
							onClick={ handleCancel }
						>
							Cancel
						</Button>
					</div>
					<div className="modal-footer-center">
						<h4 className="modal-title truncate">
							{
								picked.length === 0 ? 'Select a Collection' : 'Confirm Move?'
							}
						</h4>
					</div>
					<div className="modal-footer-right">
						<Button
							disabled={ picked.length === 0 }
							className="btn-link"
							onClick={ handleMove }
						>
							Move
						</Button>
					</div>
				</div>
			</div>
		</Modal>
	);
}

export default memo(MoveCollectionsModal);
