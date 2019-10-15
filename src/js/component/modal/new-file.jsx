'use strict';

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

import Modal from '../ui/modal';
import Button from '../ui/button';
import Spinner from '../ui/spinner';
import Icon from '../ui/icon';
import { getUniqueId } from '../../utils';
import { getFilesData } from '../../common/event';
import Dropzone from '../dropzone';
var fileCounter = 0;

const NewFileModal = props => {
	const { createAttachments, files, collection, isOpen, libraryKey, toggleModal, navigate } = props;
	const inputId = getUniqueId();
	const [isBusy, setBusy] = useState(false);
	const [filesData, setFilesData] = useState([]);

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
	}, [files]);


	const closeModal = () => {
		toggleModal(null, false);
		setFilesData([]);
	}

	const handleCreateFileClick = async () => {
		setBusy(true);
		const createdItems = await createAttachments(
			filesData, { collection: collection ? collection.key : null }
		);
		toggleModal(null, false)
		setBusy(false);
		setFilesData([]);
		navigate({
			library: libraryKey,
			collection: collection ? collection.key : null,
			items: createdItems.map(c => c.key)
		}, true);
	}

	const handleFileSelected = async ev => {
		const input = ev.currentTarget;
		const newFilesData = await getFilesData(Array.from(ev.currentTarget.files));
		input.value = null;
		setFilesData([
			...filesData,
			...newFilesData.map(fd => ({ ...fd, key: ++fileCounter}))
		]);
	}

	const handleFilesDrop = async files => {
		const newFilesData = await getFilesData(files);
		setFilesData([
			...filesData,
			...newFilesData.map(fd => ({ ...fd, key: ++fileCounter}))
		]);
	}

	const handleRemoveFileClick = ev => {
		const key = parseInt(ev.currentTarget.dataset.key, 10);
		setFilesData(filesData.filter(f => f.key !== key));
	}

	return (
		<Modal
			isOpen={ isOpen }
			contentLabel="Create a New Item"
			className={ cx('modal-touch', 'modal-centered', {
				loading: isBusy
			}) }
			onRequestClose={ closeModal }
			closeTimeoutMS={ 200 }
			overlayClassName={ "modal-slide" }
		>
			{ isBusy ? <Spinner className="large" /> : (
				<div className="modal-content" tabIndex={ -1 }>
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
										`Store copy of a file in ${collection.name}` :
										'Store copy of a file'
								}
							</h4>
						</div>
						<div className="modal-header-right">
							<Button
								className="btn-link"
								disabled={ isBusy }
								onClick={ handleCreateFileClick }
							>
								Create
							</Button>
						</div>
					</div>
					<div className="modal-body">
						{ isBusy ? <Spinner /> : (
							<div className="form">
								<ul>
									{ filesData.map(fd => (
										<li key={ fd.key }>
											{ fd.fileName }
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
								<Dropzone onFilesDrop={ handleFilesDrop } />
								<div className="form-group">
									<label htmlFor={ inputId }>
										Or Select file
									</label>
									<input onChange={ handleFileSelected } type="file" multiple="multiple" />
								</div>
							</div>
						)}
					</div>
				</div>
			)}
		</Modal>
	)
}

NewFileModal.propTypes = {
	collection: PropTypes.object,
	createAttachments: PropTypes.func,
	files: PropTypes.array,
	isOpen: PropTypes.bool,
	libraryKey: PropTypes.string,
	navigate: PropTypes.func,
	toggleModal: PropTypes.func,
}

export default NewFileModal;
