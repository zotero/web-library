'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { saveAs } from 'file-saver';
import cx from 'classnames';
import Modal from '../ui/modal';
import Icon from '../ui/icon';
import Button from '../ui/button';
import Select from '../form/select';
import Spinner from '../ui/spinner';
import exportFormats from '../../constants/export-formats';
import { getUniqueId } from '../../utils';

const defaultState = {
	isBusy: false,
	format: exportFormats[0].key
};

class ExportModal extends React.PureComponent {
	state = defaultState;
	inputId = getUniqueId();

	componentDidUpdate({ isOpen: wasOpen }) {
		const { isOpen } = this.props;
		if(wasOpen && !isOpen) {
			this.setState(defaultState);
		}
	}

	handleSelect(format, hasChanged) {
		if(hasChanged) {
			this.setState({ format });
		}
	}

	handleExport = async () => {
		const { collectionKey, exportCollection, exportItems, itemKeys,
			libraryKey, toggleModal, onSelectModeToggle } = this.props;
		const { format } = this.state;
		const fileName = ['export-data', exportFormats.find(f => f.key === format).extension]
			.filter(Boolean).join('.');

		this.setState({ isBusy: true });
		var exportData;

		if(collectionKey) {
			exportData = await exportCollection(collectionKey, libraryKey, format);
		} else {
			exportData = await exportItems(itemKeys, libraryKey, format);
		}

		saveAs(exportData, fileName);
		this.setState({ isBusy: false });
		toggleModal(null, false);
		onSelectModeToggle(false);
	}

	handleCancel = () => {
		const { toggleModal } = this.props;
		toggleModal(null, false);
	}

	render() {
		const { device, isOpen, itemKeys } = this.props;
		const { isBusy } = this.state;
		const className = cx({
			'loading': isBusy,
			'export-modal': true,
			'modal-touch modal-centered modal-form': device.isTouchOrSmall,
		});

		return (
			<Modal
				isOpen={ isOpen }
				contentLabel="Export Items"
				className={ className }
				onRequestClose={ this.handleCancel }
				closeTimeoutMS={ 200 }
				overlayClassName={ "modal-slide" }
			>
			{ isBusy ? <Spinner className="large" /> : (
				<div className="modal-content" tabIndex={ -1 }>
					<div className="modal-header">
						{
							device.isTouchOrSmall ? (
								<React.Fragment>
								<div className="modal-header-left">
									<Button
										className="btn-link"
										onClick={ this.handleCancel }
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
										onClick={ this.handleExport }
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
								onClick={ this.handleCancel }
							>
								<Icon type={ '16/close' } width="16" height="16" />
							</Button>
						</React.Fragment>
					)}
					</div>
					<div className="modal-body">
						<div className="form">
							<div className="form-group">
								<label htmlFor={ this.inputId }>
									Export Format
								</label>
								<Select
									id={ this.inputId }
									className="form-control form-control-sm"
									onChange={ () => true }
									onCommit={ (...args) => this.handleSelect(...args) }
									options={ exportFormats.map(({ key, label }) => (
										{ value: key, label }
									)) }
									value={ this.state.format }
									searchable={ true }
								/>
							</div>
						</div>
					</div>
					{ !device.isTouchOrSmall && (
						<div className="modal-footer justify-content-end">
							<Button
								type="button"
								className='btn btn-lg btn-secondary'
								onClick={ this.handleExport }
							>
								Export
							</Button>
						</div>
					)}
				</div>
			)}
			</Modal>
		);
	}

	static propTypes = {
		collectionKey: PropTypes.string,
		device: PropTypes.object,
		exportCollection: PropTypes.func.isRequired,
		exportItems: PropTypes.func.isRequired,
		isOpen: PropTypes.bool,
		itemKeys: PropTypes.array,
		libraryKey: PropTypes.string,
		onSelectModeToggle: PropTypes.func.isRequired,
		toggleModal: PropTypes.func.isRequired,
	}

	static defaultProps = {
		itemKeys: [],
	}
}

export default ExportModal;
