import cx from 'classnames';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { saveAs } from 'file-saver';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { Button, Icon } from 'web-common/components';

import exportFormats from '../../constants/export-formats';
import Modal from '../ui/modal';
import Select from '../form/select';
import { EXPORT } from '../../constants/modals';
import { exportCollection, exportItems, toggleModal, triggerSelectMode } from '../../actions';
import { getUniqueId } from '../../utils';

const ExportModal = () => {
	const dispatch = useDispatch();
	const isOpen = useSelector(state => state.modal.id === EXPORT);
	const itemKeys = useSelector(state => state.modal.itemKeys, shallowEqual) || [];
	const libraryKey = useSelector(state => state.modal.libraryKey);
	const collectionKey = useSelector(state => state.modal.collectionKey);
	const isTouchOrSmall = useSelector(state => state.device.isTouchOrSmall);
	const [isBusy, setIsBusy] = useState(false);
	const [format, setFormat] = useState(exportFormats[0].key);
	const inputId = useRef(getUniqueId());

	const handleSelect = useCallback((newFormat, hasChanged) => {
		if(hasChanged) {
			setFormat(newFormat);
		}
	}, []);

	const handleExport = useCallback(async () => {
		const fileName = ['export-data', exportFormats.find(f => f.key === format).extension].filter(Boolean).join('.');
		setIsBusy(true);
		const exportData = await (collectionKey ?
			dispatch(exportCollection(collectionKey, libraryKey, format)) :
			dispatch(exportItems(itemKeys, libraryKey, format))
		);

		saveAs(exportData, fileName);
		setIsBusy(false);
		dispatch(toggleModal(EXPORT, false));
		dispatch(triggerSelectMode(false, true));
	}, [collectionKey, dispatch, format, itemKeys, libraryKey]);

	const handleCancel = useCallback(() => {
		dispatch(toggleModal(null, false));
	}, [dispatch]);

	const handleChange = useCallback(() => true, []);

	useEffect(() => {
		if(!isTouchOrSmall) {
			dispatch(toggleModal(EXPORT, false));
		}
	}, [dispatch, isTouchOrSmall]);

	const className = cx({
		'loading': isBusy,
		'export-modal': true,
		'modal-touch modal-form': isTouchOrSmall,
	});

	return (
		<Modal
			className={ className }
			contentLabel="Export Items"
			isBusy={ isBusy }
			isOpen={ isOpen }
			onRequestClose={ handleCancel }
			overlayClassName={ cx({ 'modal-slide modal-centered': isTouchOrSmall }) }
		>
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
								Export { itemKeys.length > 1 ? 'Items' : 'Item' }
							</h4>
						</div>
						<div className="modal-header-right">
							<Button
								className="btn-link"
								onClick={ handleExport }
							>
								Export
							</Button>
						</div>
						</React.Fragment>
				) : (
				<React.Fragment>
					<h4 className="modal-title truncate">
						Export
					</h4>
					<Button
						icon
						className="close"
						onClick={ handleCancel }
					>
						<Icon type={ '16/close' } width="16" height="16" />
					</Button>
				</React.Fragment>
			)}
			</div>
			<div className="modal-body">
				<div className="form">
					<div className="form-group">
						<label htmlFor={ inputId.current }>
							Export Format
						</label>
						<Select
							id={ inputId.current }
							className="form-control form-control-sm"
							onChange={ handleChange }
							onCommit={ handleSelect }
							options={ exportFormats.map(({ key, label }) => (
								{ value: key, label }
							)) }
							value={ format }
							searchable={ true }
						/>
					</div>
				</div>
			</div>
			{ !isTouchOrSmall && (
				<div className="modal-footer justify-content-end">
					<Button
						type="button"
						className='btn btn-lg btn-secondary'
						onClick={ handleExport }
					>
						Export
					</Button>
				</div>
			)}
		</Modal>
	);
}

export default memo(ExportModal);
