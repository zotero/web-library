import React, { useCallback, useEffect, useRef, useState, memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import cx from 'classnames';

import Button from '../ui/button';
import Icon from '../ui/icon';
import Input from '../form/input';
import Modal from '../ui/modal';
import Spinner from '../ui/spinner';
import { ADD_BY_IDENTIFIER } from '../../constants/modals';
import { createItem, navigate, toggleModal, resetIdentifier, searchIdentifier } from '../../actions';


const AddByIdentifierModal = () => {
	const dispatch = useDispatch();
	const libraryKey = useSelector(state => state.current.libraryKey);
	const collectionKey = useSelector(state => state.current.collectionKey);
	const itemsSource = useSelector(state => state.current.itemsSource);
	const isSearching = useSelector(state => state.identifier.isSearching);
	const isTouchOrSmall = useSelector(state => state.device.isTouchOrSmall);
	const isOpen = useSelector(state => state.modal.id === ADD_BY_IDENTIFIER);
	const [identifier, setIdentifier] = useState('');
	const [isBusy, setIsBusy] = useState(false);
	const inputEl = useRef(null);

	const handleCancel = useCallback(() => {
		setIdentifier('');
		dispatch(toggleModal(ADD_BY_IDENTIFIER, false));
		dispatch(resetIdentifier());
	}, [dispatch]);

	const handleInputChange = useCallback(newIdentifier => {
		setIdentifier(newIdentifier);
	}, []);

	const handleInputBlur = useCallback(() => true, []);

	const handleAddClick = useCallback(async () => {
		try {
			setIsBusy(true);
			const reviewItem = await dispatch(searchIdentifier(identifier));

			if(itemsSource === 'collection' && collectionKey) {
				reviewItem.collections = [collectionKey];
			}

			const item = await dispatch(createItem(reviewItem, libraryKey));

			setIsBusy(false);

			setIdentifier('');
			dispatch(toggleModal(ADD_BY_IDENTIFIER, false));
			dispatch(resetIdentifier());
			dispatch(navigate({
				library: libraryKey,
				collection: collectionKey,
				items: [item.key],
				view: 'item-details'
			}, true))
		} catch(_) {
			setIsBusy(false);
			setIdentifier('');
			inputEl.current.focus();
		}
	}, [identifier, collectionKey, dispatch, libraryKey, itemsSource]);

	useEffect(() => {
		if(!isTouchOrSmall) {
			setIdentifier('');
			dispatch(toggleModal(ADD_BY_IDENTIFIER, false));
			dispatch(resetIdentifier());
		}
	}, [dispatch, isTouchOrSmall]);

	const className = cx({
		'add-by-identifier-modal': true,
		'modal-centered': isTouchOrSmall,
		'modal-xl modal-scrollable': !isTouchOrSmall,
		'modal-touch modal-form': isTouchOrSmall,
		'loading': isBusy,
	});

	return (
		<Modal
			isOpen={ isOpen }
			contentLabel="Add By Identifier"
			className={ className }
			onRequestClose={ handleCancel }
			closeTimeoutMS={ isTouchOrSmall ? 200 : null }
			overlayClassName={ isTouchOrSmall ? "modal-slide" : null }
		>
			{ isBusy ? <Spinner className="large" /> : (
				<div className="modal-content" tabIndex={ -1 }>
					<div className="modal-header">
						{
							isTouchOrSmall ? (
								<React.Fragment>
									<div className="modal-header-left">
										<Button
											className="btn-link"
											onClick={ handleCancel }
										>
											Cancel
										</Button>
									</div>
									<div className="modal-header-center">
										<h4 className="modal-title truncate">
											Add Item
										</h4>
									</div>
									<div className="modal-header-right">
										<Button
											disabled={ identifier === '' }
											className="btn-link"
											onClick={ handleAddClick }
										>
											Add
										</Button>
									</div>
								</React.Fragment>
							) : (
								<React.Fragment>
									<h4 className="modal-title truncate">
										Add Item
									</h4>
									<Button
										icon
										className="close"
										onClick={ handleCancel }
									>
										<Icon type={ '16/close' } width="16" height="16" />
									</Button>
								</React.Fragment>
							)
						}
					</div>
					<div
						className={ cx(
							'modal-body',
							{ loading: !isTouchOrSmall && isSearching }
						)}
						tabIndex={ !isTouchOrSmall ? 0 : null }
					>
						<div className="form">
							<div className="form-group">
								<Input
									autoFocus
									onChange={ handleInputChange }
									onCommit={ handleAddClick }
									onBlur={ handleInputBlur }
									value={ identifier }
									tabIndex={ 0 }
									ref={ inputEl }
									isBusy={ isSearching }
									placeholder="URL, ISBN, DOI, PMID, or arXiv ID"
								/>
							</div>
						</div>
					</div>
				</div>
			) }
		</Modal>
	);
}

export default memo(AddByIdentifierModal);
