import { Button, Icon } from 'web-common/components';
import { Fragment, memo, useCallback, useEffect, useState } from 'react';
import { pick } from 'web-common/utils';
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
import { PICKS_MULTIPLE_ITEMS } from '../../constants/picker-modes';

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
	const isSingleColumn = useSelector(state => state.device.isSingleColumn);
	const { navState, touchHeaderPath, handleNavigation, resetNavState } = useNavigationState({ libraryKey, collectionKey, view: 'item-list' });

	const [isBusy, setIsBusy] = useState(!isItemsReady);

	const sharedProps = {
		...pick(navState, ['libraryKey', 'collectionKey', 'itemsSource', 'view']),
		selectedItemKeys: navState.itemKeys || [], // or itemKeys?
		isPickerMode: true,
		pickerMode: PICKS_MULTIPLE_ITEMS,
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
			overlayClassName="modal-slide modal-full-height modal-centered modal-has-touch-nav"
		>
			<div className="modal-header">
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
			<div className={cx('modal-body', { [`view-${navState.view}-active`]: true }) }>
				<div className="sidebar">
					<Libraries {...sharedProps} includeLibraries={[libraryKey]} pickerAllowRoot={true} />
				</div>
				<div className={ cx('items', {
					'active': navState.view === 'item-list',
				})}>
					{ navState.libraryKey && (isTouchOrSmall ? <ItemsList {...sharedProps} /> : <ItemsTable {...sharedProps} />) }
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
