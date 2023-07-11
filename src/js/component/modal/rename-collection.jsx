import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { Button, Icon } from 'web-common/components';

import Input from '../form/input';
import Modal from '../ui/modal';
import { COLLECTION_RENAME } from '../../constants/modals';
import { get, getUniqueId } from '../../utils';
import { makeChildMap } from '../../common/collection';
import { toggleModal, updateCollection } from '../../actions';

const RenameCollectionModal = () => {
	const dispatch = useDispatch();
	const libraryKey = useSelector(state => state.current.libraryKey);
	const collectionKey = useSelector(state => state.modal.collectionKey);
	const collection = useSelector(state => get(
		state, ['libraries', state.current.libraryKey, 'collections', 'data', state.modal.collectionKey]
	), shallowEqual);
	const collections = useSelector(state => get(
		state, ['libraries', state.current.libraryKey, 'collections', 'data']
	), shallowEqual);

	const isOpen = useSelector(state => state.modal.id === COLLECTION_RENAME);
	const isTouchOrSmall = useSelector(state => state.device.isTouchOrSmall);
	const [name, setName] = useState('');
	const inputId = useRef(getUniqueId());
	const isValid = name.length > 0 && name !== (collection && collection.name);

	const handleCollectionUpdate = useCallback(() => {
		if(!isValid) {
			return;
		}
		dispatch(updateCollection(collectionKey, { name }, libraryKey));
		dispatch(toggleModal(COLLECTION_RENAME, false));
	}, [dispatch, collectionKey, isValid, name, libraryKey]);

	const handleInputBlur = useCallback(() => true, []);
	const handleChange = useCallback(newName => setName(newName), []);
	const handleCancel = useCallback(() => dispatch(toggleModal(COLLECTION_RENAME, false)), [dispatch]);
	const childMap = useMemo(() => makeChildMap(collections.length ? collections : []), [collections]);
	const hasSubCollections = collectionKey in childMap;

	useEffect(() => {
		if(!isTouchOrSmall) {
			setName('');
			dispatch(toggleModal(COLLECTION_RENAME, false));
		}
	}, [dispatch, isTouchOrSmall]);

	useEffect(() => {
		if(isOpen && collection && collection.name) {
			setName(collection.name);
		} else {
			setName('');
		}
	}, [collection, isOpen]);

	return (
		<Modal
			className="modal-touch"
			contentLabel="Collection Editor"
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
						Rename Collection
					</h4>
				</div>
				<div className="modal-header-right">
					<Button
						className="btn-link"
						disabled={ !isValid }
						onClick={ handleCollectionUpdate }
					>
						Rename
					</Button>
				</div>
			</div>
			<div className="modal-body">
				<div className="form">
					<div className="form-group">
						<label htmlFor={ inputId.current }>
							<Icon type={ hasSubCollections ? '28/folders' : '28/folder' } width="28" height="28" />
						</label>
						<Input
							autoFocus
							id={ inputId.current }
							onBlur={ handleInputBlur }
							onChange={ handleChange }
							onCommit={ handleCollectionUpdate }
							tabIndex={ 0 }
							value={ name }
						/>
					</div>
				</div>
			</div>
		</Modal>
	);
}

export default memo(RenameCollectionModal);
