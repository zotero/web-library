import { Button, Icon } from 'web-common/components';
import { Fragment, memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { usePrevious } from 'web-common/hooks';
import cx from 'classnames';
import deepEqual from 'deep-equal';
import PropTypes from 'prop-types';

import Libraries from '../../component/libraries';
import Modal from '../ui/modal';
import TouchHeader from '../touch-header.jsx';
import { toggleModal } from '../../actions';
import { ADD_RELATED } from '../../constants/modals';
import { useNavigationState } from '../../hooks';
import ItemsTable from '../item/items/table';
import ItemsList from '../item/items/list';

const AddRelatedModal = () => {
	const dispatch = useDispatch();

	const libraryKey = useSelector(state => state.current.libraryKey);
	const collectionKey = useSelector(state => state.current.collectionKey);
	const isOpen = useSelector(state => state.modal.id === ADD_RELATED);
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
	const { navState, touchHeaderPath, handleNavigation, resetNavState } = useNavigationState({ libraryKey, collectionKey });

	const [isBusy, setBusy] = useState(!isItemsReady);
	const [picked, setPicked] = useState([]);

	const pickerSkipCollections = useMemo(() => {
		const result = [];

		const occurenceMap = sourceItemCollections.flat().reduce((acc, icKey) =>
			acc.set(icKey, acc.has(icKey) ? acc.get(icKey) + 1 : 1), new Map()
		);

		for (const [collectionKey, occurencesCount] of occurenceMap.entries()) {
			if (occurencesCount === sourceItemKeys.length) {
				result.push(collectionKey);
			}
		}
		return result;
	}, [sourceItemCollections, sourceItemKeys]);

	const sharedProps = {
		libraryKey: navState.libraryKey,
		collectionKey: navState.collectionKey,
		selectedItemKeys: navState.itemKeys || [],
		itemsSource: navState.collectionKey ? 'collection' : 'top',
		isPickerMode: true,
	};

	useEffect(() => {
		if (!wasItemsReady && isItemsReady) {
			setBusy(false);
		}
	}, [wasItemsReady, isItemsReady]);

	useEffect(() => {
		if (!isOpen) {
			resetNavState();
			setPicked([]);
		}
	}, [resetNavState, isOpen]);

	const pickerPick = useCallback(newPicked => {
		if (deepEqual(picked, newPicked)) {
			setPicked([]);
		} else {
			setPicked([newPicked]);
		}
	}, [picked]);

	const handleSelectItems = useCallback(async () => {

	}, []);

	const handleCancel = useCallback(() => {
		dispatch(toggleModal(null, false));
	}, [dispatch]);

	return (
		<Modal
			className="modal-touch add-related-modal"
			contentLabel="Add Related Items"
			isBusy={isBusy}
			isOpen={isOpen}
			onRequestClose={handleCancel}
			overlayClassName="modal-slide modal-centered"
		>
			<div className='modal-header'>
				{isTouchOrSmall ? (
					<TouchHeader
						isModal={true}
						className="darker"
						path={touchHeaderPath}
						onNavigate={handleNavigation}
					/>
				) : (
					<Fragment>
						<div className="modal-header">
							<h4 className="modal-title truncate">
								Select items
							</h4>
							<Button
								icon
								className="close"
								onClick={handleCancel}
								title="Close Dialog"
							>
								<Icon type={'16/close'} width="16" height="16" />
							</Button>
						</div>
					</Fragment>
				)}
			</div>
			<div className="modal-body">
				<div className="collection-tree">
					<Libraries
						isPickerMode={true}
						picked={picked}
						pickerAllowRoot={true}
						pickerNavigate={handleNavigation}
						pickerPick={pickerPick}
						pickerSkipCollections={pickerSkipCollections}
						pickerRequireFileUpload={hasAttachment}
						pickerState={{ ...navState, picked }}
					/>
				</div>
				<div className={ cx('items-container') }>
					{isTouchOrSmall ? <ItemsList {...sharedProps} /> : <ItemsTable { ...sharedProps } /> }
				</div>
			</div>
			{isTouchOrSmall ? (
				<Fragment>
					<div className="modal-footer">
						<div className="modal-footer-left">
							<Button
								className="btn-link"
								onClick={() => dispatch(toggleModal(null, false))}
							>
								Cancel
							</Button>
						</div>
						<div className="modal-footer-center">
							<h4 className="modal-title truncate">

							</h4>
						</div>
						<div className="modal-footer-right">
							<Button
								disabled={picked.length === 0}
								className="btn-link"
								onClick={handleSelectItems}
							>
								Select Items
							</Button>
						</div>
					</div>
				</Fragment>
			) : (
				<Fragment>
					<div className="modal-footer justify-content-end">
						<Button
							disabled={picked.length === 0}
							className="btn-link"
								onClick={handleSelectItems}
						>
							Add
						</Button>
					</div>
				</Fragment>
			)}
		</Modal>
	);
}

AddRelatedModal.propTypes = {
	items: PropTypes.array,
}

export default memo(AddRelatedModal);
