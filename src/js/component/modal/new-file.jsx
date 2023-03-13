import React, { useCallback, useEffect, useRef, useState, memo } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';

import Button from '../ui/button';
import Icon from '../ui/icon';
import Modal from '../ui/modal';
import { get, getUniqueId } from '../../utils';
import { getFilesData } from '../../common/event';
import { NEW_FILE } from '../../constants/modals';
import { toggleModal, createAttachments, navigate } from '../../actions';

var fileCounter = 0;

const NewFileModal = () => {
	const dispatch = useDispatch();
	const isOpen = useSelector(state => state.modal.id === NEW_FILE);
	const libraryKey = useSelector(state => state.current.libraryKey);
	const collectionKey = useSelector(state => state.current.collectionKey);
	const collection = useSelector(state => get(state, ['libraries', libraryKey, 'collections', 'data', collectionKey]));
	const files = useSelector(state => state.modal.files, shallowEqual);

	const inputId = useRef(getUniqueId());
	const [isBusy, setBusy] = useState(false);
	const [filesData, setFilesData] = useState([]);

	const closeModal = useCallback(() => {
		if(!isBusy) {
			dispatch(toggleModal(NEW_FILE, false));
			setFilesData([]);
		}
	}, [dispatch, isBusy]);

	const handleCreateFileClick = useCallback(async () => {
		setBusy(true);
		const createdItems = await dispatch(createAttachments(
			filesData, { collection: collection ? collection.key : null }
		));
		dispatch(toggleModal(NEW_FILE, false));
		setBusy(false);
		setFilesData([]);
		dispatch(navigate({
			library: libraryKey,
			collection: collection ? collection.key : null,
			items: createdItems.map(c => c.key)
		}, true));
	}, [dispatch, collection, filesData, libraryKey]);

	const handleFileSelected = useCallback(async ev => {
		const input = ev.currentTarget;
		const newFilesData = await getFilesData(Array.from(ev.currentTarget.files));
		input.value = null;
		setFilesData([
			...filesData,
			...newFilesData.map(fd => ({ ...fd, key: ++fileCounter}))
		]);
	}, [filesData]);

	const handleRemoveFileClick = useCallback(ev => {
		const key = parseInt(ev.currentTarget.dataset.key, 10);
		setFilesData(filesData.filter(f => f.key !== key));
	}, [filesData]);

	useEffect(() => {
		(async () => {
			if(files) {
				const newFilesData = await getFilesData(files);
				setFilesData([
					...filesData,
					...newFilesData.map(fd => ({ ...fd, key: ++fileCounter}))
				]);
			}
		})();
	}, [files, filesData]);

	return (
		<Modal
			className="modal-touch"
			contentLabel="Upload files"
			isBusy={ isBusy }
			isOpen={ isOpen }
			onRequestClose={ closeModal }
			shouldCloseOnEsc={ !isBusy }
			overlayClassName="modal-centered modal-slide"
		>
			<div className="modal-header">
				<div className="modal-header-left">
					<Button
						className="btn-link"
						disabled={ isBusy }
						onClick={ closeModal }
					>
						Cancel
					</Button>
				</div>
				<div className="modal-header-center">
					<h4 className="modal-title truncate">
						{
							collection ?
								`Upload files to ${collection.name}` :
								'Upload files'
						}
					</h4>
				</div>
				<div className="modal-header-right">
					<Button
						className="btn-link"
						disabled={ isBusy || filesData.length === 0 }
						onClick={ handleCreateFileClick }
					>
						Upload
					</Button>
				</div>
			</div>
			<div className="modal-body">
				<div className="form">
					<ul className="form-group files">
						{ filesData.map(fd => (
							<li className="file" key={ fd.key }>
								<span>{ fd.fileName }</span>
								<Button
									icon
									data-key={ fd.key }
									onClick={ handleRemoveFileClick }
								>
									<Icon type={ '16/trash' } width="16" height="16" />
								</Button>
							</li>
						)) }
					</ul>
					<div className="flex-row justify-center">
						<div className="btn-file">
							<input
								className="add-attachment toolbar-focusable"
								id={ inputId.current }
								multiple="multiple"
								onChange={ handleFileSelected }
								tabIndex={ 0 }
								type="file"
							/>
							<Button
								className="btn-default"
								tabIndex={ -1 }
							>
								Select Files
							</Button>
						</div>
					</div>
				</div>
			</div>
		</Modal>
	)
}

export default memo(NewFileModal);
