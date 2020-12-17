import React, { useCallback, useRef, useState, memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Button from '../ui/button';
import Input from '../form/input';
import Modal from '../ui/modal';
import { ADD_BY_IDENTIFIER } from '../../constants/modals';
import { createItem, navigate, toggleModal, resetIdentifier, searchIdentifier } from '../../actions';

const AddByIdentifierModal = () => {
	const dispatch = useDispatch();
	const libraryKey = useSelector(state => state.current.libraryKey);
	const collectionKey = useSelector(state => state.current.collectionKey);
	const itemsSource = useSelector(state => state.current.itemsSource);
	const isSearching = useSelector(state => state.identifier.isSearching);
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

	const handleInputBlur = useCallback(() => {
		return true;
	}, []);

	const handleModalAfterOpen = useCallback(() => {
		setTimeout(() => {
			// using autoFocus breaks the animation, hence this
			if(inputEl.current) {
				inputEl.current.focus();
			}
		}, 200);
	}, []);

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

	return (
		<Modal
			className="modal-touch"
			contentLabel="Add By Identifier"
			isBusy={ isBusy }
			isOpen={ isOpen }
			onAfterOpen={ handleModalAfterOpen }
			onRequestClose={ handleCancel }
			overlayClassName="modal-centered modal-slide"
		>
			<div className="modal-header">
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
			</div>
			<div className="modal-body">
				<div className="form">
					<div className="form-group">
						<Input
							isBusy={ isSearching }
							onBlur={ handleInputBlur }
							onChange={ handleInputChange }
							onCommit={ handleAddClick }
							placeholder="URL, ISBN, DOI, PMID, or arXiv ID"
							ref={ inputEl }
							tabIndex={ 0 }
							value={ identifier }
						/>
					</div>
				</div>
			</div>
		</Modal>
	);
}

export default memo(AddByIdentifierModal);
