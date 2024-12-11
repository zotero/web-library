import deepEqual from 'deep-equal';
import PropTypes from 'prop-types';
import { Fragment, memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Icon } from 'web-common/components';
import { usePrevious } from 'web-common/hooks';

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
	const items = useSelector(state => state.libraries?.[libraryKey]?.items);
	const isItemsReady = useSelector(state => state.current.itemKeys
		.every(key => state.libraries[state.current.libraryKey]?.dataObjects?.[key])
	);
	const wasItemsReady = usePrevious(isItemsReady);
	const sourceItemCollections = (sourceItemKeys || []).map(ik => items?.[ik]?.collections || []);
	const hasAttachment = isItemsReady ? (sourceItemKeys || []).some(ik => {
		const item = items?.[ik];
		return item?.itemType === 'attachment' || !!item?.[Symbol.for('links')]?.attachment
	}) : false;

	const isTouchOrSmall = useSelector(state => state.device.isTouchOrSmall);
	const {navState, touchHeaderPath, handleNavigation, resetNavState} = useNavigationState();

	const [isBusy, setBusy] = useState(!isItemsReady);
	const [picked, setPicked] = useState([]);

	const pickerSkipCollections = useMemo(() => {
		const result = [];

		const occurenceMap = sourceItemCollections.flat().reduce((acc, icKey) =>
			acc.set(icKey, acc.has(icKey) ? acc.get(icKey) + 1 : 1), new Map()
		);

		for(const [collectionKey, occurencesCount] of occurenceMap.entries()) {
			if(occurencesCount === sourceItemKeys.length) {
				result.push(collectionKey);
			}
		}
		return result;
	}, [sourceItemCollections, sourceItemKeys]);

	useEffect(() => {
		if (!wasItemsReady && isItemsReady) {
			setBusy(false);
		}
	}, [wasItemsReady, isItemsReady]);

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
				<Fragment>
				{ isTouchOrSmall ? (
					<TouchHeader
						isModal={ true }
						className="darker"
						path={ touchHeaderPath }
						onNavigate={ handleNavigation }
					/>
				) : (
					<Fragment>
						<div className="modal-header">
						<h4 className="modal-title truncate">
							Select target library or collection
						</h4>
						<Button
							icon
							className="close"
							onClick={ handleCancel }
							title="Close Dialog"
						>
							<Icon type={ '16/close' } width="16" height="16" />
						</Button>
					</div>
					</Fragment>
				) }
				<Libraries
					isPickerMode={ true }
					picked={ picked }
					pickerAllowRoot={ true }
					pickerNavigate={ handleNavigation }
					pickerPick={ pickerPick }
					pickerSkipCollections={ pickerSkipCollections }
					pickerRequireFileUpload={ hasAttachment }
					pickerState= { { ...navState, picked } }
				/>
				</Fragment>
			</div>
			{ isTouchOrSmall ? (
				<Fragment>
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
				</Fragment>
			) : (
				<Fragment>
					<div className="modal-footer justify-content-end">
						<Button
							disabled={ picked.length === 0}
							className="btn-link"
							onClick={ handleAddItems }
						>
							Add
						</Button>
					</div>
				</Fragment>
			) }
		</Modal>
    );
}

AddItemsToCollectionsModal.propTypes = {
	items: PropTypes.array,
}

export default memo(AddItemsToCollectionsModal);
