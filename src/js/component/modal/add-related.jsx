import { Button, Icon } from 'web-common/components';
import { Fragment, memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { usePrevious } from 'web-common/hooks';
import cx from 'classnames';
import PropTypes from 'prop-types';

import Libraries from '../../component/libraries';
import Modal from '../ui/modal';
import TouchHeader from '../touch-header.jsx';
import { addRelatedItems, toggleModal } from '../../actions';
import { ADD_RELATED } from '../../constants/modals';
import { useNavigationState } from '../../hooks';
import ItemsTable from '../item/items/table';
import ItemsList from '../item/items/list';

const AddRelatedModal = () => {
	const dispatch = useDispatch();

	const libraryKey = useSelector(state => state.current.libraryKey);
	const collectionKey = useSelector(state => state.current.collectionKey);
	const itemKeys = useSelector(state => state.current.itemKeys);
	const isOpen = useSelector(state => state.modal.id === ADD_RELATED);
	const isItemsReady = useSelector(state => state.current.itemKeys
		.every(key => state.libraries[state.current.libraryKey]?.dataObjects?.[key])
	);
	const wasItemsReady = usePrevious(isItemsReady);

	const isTouchOrSmall = useSelector(state => state.device.isTouchOrSmall);
	const { navState, touchHeaderPath, handleNavigation, resetNavState } = useNavigationState({ libraryKey, collectionKey });

	const [isBusy, setIsBusy] = useState(!isItemsReady);

	const sharedProps = {
		libraryKey: navState.libraryKey,
		collectionKey: navState.collectionKey,
		selectedItemKeys: navState.itemKeys || [],
		itemsSource: navState.collectionKey ? 'collection' : 'top',
		isPickerMode: true,
		pickerNavigate: handleNavigation
	};

	useEffect(() => {
		if (!wasItemsReady && isItemsReady) {
			setIsBusy(false);
		}
	}, [wasItemsReady, isItemsReady]);

	useEffect(() => {
		if (!isOpen) {
			resetNavState();
		}
	}, [resetNavState, isOpen]);

	const handleSelectItems = useCallback(async () => {
		for(const sourceItemKey of itemKeys) {
			setIsBusy(true);
			await dispatch(addRelatedItems(sourceItemKey, navState.itemKeys));
			setIsBusy(false);
			dispatch(toggleModal(null, false));
		}
	}, [dispatch, itemKeys, navState.itemKeys]);

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
					</Fragment>
				)}
			</div>
			<div className="modal-body">
				<div className="collection-tree">
					<Libraries
						isPickerMode={true}
						includeLibraries={[ libraryKey ]}
						pickerAllowRoot={true}
						pickerNavigate={handleNavigation}
						pickerState={ navState }
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
								disabled={navState.itemKeys.length === 0}
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
								disabled={navState.itemKeys.length === 0}
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
