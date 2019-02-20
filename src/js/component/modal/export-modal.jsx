'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const { saveAs } = require('file-saver');
const cx = require('classnames');

const Modal = require('../ui/modal');
const Button = require('../ui/button');
const Select = require('../form/select');
const Spinner = require('../ui/spinner');
const exportFormats = require('../../constants/export-formats');

const defaultState = {
	isBusy: false,
	format: exportFormats[0].key
};

class ExportModal extends React.PureComponent {
	state = defaultState;

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
		const { exportItems, itemKeys, toggleModal,
			onSelectModeToggle } = this.props;
		const { format } = this.state;
		const fileName = ['export-data', exportFormats.find(f => f.key === format).extension]
			.filter(Boolean).join('.');

		this.setState({ isBusy: true });
		const exportData = await exportItems(itemKeys, format);
		saveAs(exportData, fileName);
		this.setState({ isBusy: false });
		toggleModal(null, false);
		onSelectModeToggle(false);
	}

	render() {
		const { isOpen, toggleModal, itemKeys } = this.props;
		const { isBusy } = this.state;
		const inputId = 'collection-export-modal-input';

		return (
			<Modal
				isOpen={ isOpen }
				contentLabel="Export Items"
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
								onClick={ () => toggleModal(null, false) }
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
					</div>
					<div className="modal-body">
						<div className="form">
							<div className="form-group">
								<label htmlFor={ inputId }>
									Export Format
								</label>
								<Select
									id={ inputId }
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
				</div>
			)}
			</Modal>
		);
	}

	static propTypes = {
		exportItems: PropTypes.func.isRequired,
		isOpen: PropTypes.bool,
		itemKeys: PropTypes.array,
		onSelectModeToggle: PropTypes.func.isRequired,
		toggleModal: PropTypes.func.isRequired,
	}

	static defaultProps = {
		itemKeys: [],
	}
}

module.exports = ExportModal;
