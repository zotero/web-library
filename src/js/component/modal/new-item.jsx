import React, { memo, useCallback, useRef, useState } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';

import Button from '../ui/button';
import Modal from '../ui/modal';
import Select from '../form/select';
import { get } from '../../utils';
import { getUniqueId } from '../../utils';
import { NEW_ITEM } from '../../constants/modals';
import { toggleModal, createItem, fetchItemTemplate, navigate, triggerEditingItem } from '../../actions';

const NewItemModal = () => {
	const dispatch = useDispatch();
	const libraryKey = useSelector(state => state.current.libraryKey);
	const itemsSource = useSelector(state => state.current.itemsSource);
	const isOpen = useSelector(state => state.modal.id === NEW_ITEM);
	const collection = useSelector(state => get(
		state, ['libraries', state.current.libraryKey, 'collections', 'data', state.modal.collectionKey]
	), shallowEqual);
	const itemTypes = useSelector(state => state.meta.itemTypes, shallowEqual);
	const inputId = useRef(getUniqueId());
	const [isBusy, setIsBusy] = useState(false);
	const [itemType, setItemType] = useState('book');

	const handleNewItemCreate = useCallback(async () => {
		setIsBusy(true);
		const template = await dispatch(fetchItemTemplate(itemType));
		const newItem = {
			...template,
			collections: itemsSource === 'collection' ? [collection.key] : []
		};
		const item = await dispatch(createItem(newItem, libraryKey));

		dispatch(toggleModal(NEW_ITEM, false));
		dispatch(navigate({ items: [item.key], view: 'item-details' }));
		dispatch(triggerEditingItem(item.key, true));
		setIsBusy(false);
	}, [collection, dispatch, itemsSource, itemType, libraryKey]);

	const handleChange = useCallback(() => true, []);
	const handleCancel = useCallback(() => dispatch(toggleModal(NEW_ITEM, false)), [dispatch]);

	const handleSelect = useCallback((newItemType, hasChanged) => {
		if(hasChanged) {
			setItemType(newItemType);
		}
	}, []);

	return (
		<Modal
			className="modal-touch"
			contentLabel="Create a New Item"
			isBusy={ isBusy }
			isOpen={ isOpen }
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
						{
							collection ?
								`Create a New Item in ${collection.name}` :
								'Create a New Item'
						}
					</h4>
				</div>
				<div className="modal-header-right">
					<Button
						className="btn-link"
						onClick={ handleNewItemCreate }
					>
						Create
					</Button>
				</div>
			</div>
			<div className="modal-body">
				<div className="form">
					<div className="form-group">
						<label htmlFor={ inputId.current }>
							Item Type
						</label>
						<Select
							id={ inputId.current }
							className="form-control form-control-sm"
							onChange={ handleChange }
							onCommit={ handleSelect }
							options={ itemTypes.map(({ itemType, localized }) => (
								{ value: itemType, label: localized }
							)) }
							value={ itemType }
							searchable={ true }
						/>
					</div>
				</div>
			</div>
		</Modal>
	);
}

export default memo(NewItemModal);
