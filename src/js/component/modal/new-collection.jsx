import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';

import Button from '../ui/button';
import Icon from '../ui/icon';
import Input from '../form/input';
import Modal from '../ui/modal';
import { COLLECTION_ADD } from '../../constants/modals';
import { get, getUniqueId } from '../../utils';
import { toggleModal, createCollection } from '../../actions';

const NewCollectionModal = () => {
	const dispatch = useDispatch();
	const [name, setName] = useState('');
	const libraryKey = useSelector(state => state.current.libraryKey);
	const parentCollection = useSelector(state =>
		get(state, ['libraries', libraryKey, 'collections', 'data', state.modal.parentCollectionKey]),
		shallowEqual
	);

	const isOpen = useSelector(state => state.modal.id === COLLECTION_ADD);
	const inputId = useRef(getUniqueId());

	const handleCollectionUpdate = useCallback(() => {
		if(name.length === 0) {
			return;
		}

		dispatch(createCollection({
			name,
			parentCollection: parentCollection ? parentCollection.key : null
		}, libraryKey));
		dispatch(toggleModal(COLLECTION_ADD, false));
	}, [dispatch, libraryKey, name, parentCollection]);

	const handleInputBlur = useCallback(() => true, []);
	const handleChange = useCallback(newName => setName(newName), []);
	const handleCancel = useCallback(() => dispatch(toggleModal(COLLECTION_ADD, false)), [dispatch]);

	useEffect(() => {
		if(!isOpen) {
			setName('');
		}
	}, [isOpen]);

	return (
		<Modal
			className="modal-touch modal-form new-collection"
			contentLabel="Add a New Collection"
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
							parentCollection ?
								`Add a new Subcollection to ${parentCollection.name}` :
								'Add a new Collection'
						}
					</h4>
				</div>
				<div className="modal-header-right">
					<Button
						className="btn-link"
						disabled={ name.length === 0 }
						onClick={ handleCollectionUpdate }
					>
						Confirm
					</Button>
				</div>
			</div>
			<div className="modal-body">
				<div className="form">
					<div className="form-group">
						<label className="icon-label" htmlFor={ inputId.current }>
							<Icon type="28/folder" width="28" height="28" />
						</label>
						<Input
							autoFocus
							id={ inputId.current }
							onBlur={ handleInputBlur }
							onChange={ handleChange }
							onCommit={ handleCollectionUpdate }
							value={ name }
							tabIndex={ 0 }
						/>
					</div>
				</div>
			</div>
		</Modal>
	)
}

export default memo(NewCollectionModal);
