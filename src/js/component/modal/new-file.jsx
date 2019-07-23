'use strict';

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

import Modal from '../ui/modal';
import Button from '../ui/button';
import Spinner from '../ui/spinner';
import { getUniqueId } from '../../utils';
import { getFileData } from '../../common/event';

const NewFileModal = ({ createItem, fetchItemTemplate, collection, isOpen,
	libraryKey, toggleModal, uploadAttachment }) => {
	const inputId = getUniqueId();
	const [isBusy, setBusy] = useState(false);
	const [fileData, setFileData] = useState({});

	const handleCreateFileClick = async () => {
		setBusy(true);
		const attachmentTemplate = await fetchItemTemplate('attachment', { linkMode: 'imported_file' });
		const attachment = {
			...attachmentTemplate,
			collections: collection ? [collection.key] : [],
			filename: fileData.fileName,
			contentType: fileData.contentType
		};
		const item = await createItem(attachment, libraryKey);
		await uploadAttachment(item.key, fileData);
		setBusy(false);
		toggleModal(null, false)
	}

	const handleFileSelected = async ev => {
		const fileData = await getFileData(ev);
		setFileData(fileData);
	}

	return (
		<Modal
			isOpen={ isOpen }
			contentLabel="Create a New Item"
			className={ cx('modal-touch', 'modal-centered', {
				loading: isBusy
			}) }
			onRequestClose={ () => toggleModal(null, false) }
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
								onClick={ () => toggleModal(null, false) }
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
								<div className="form-group">
									<label htmlFor={ inputId }>
										Select file
									</label>
									<input onChange={ handleFileSelected } type="file" />
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
	createItem: PropTypes.func,
	fetchItemTemplate: PropTypes.func,
	isOpen: PropTypes.bool,
	libraryKey: PropTypes.string,
	toggleModal: PropTypes.func,
	uploadAttachment: PropTypes.func,
}

export default NewFileModal;
