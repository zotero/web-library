'use strict';

const React = require('react');
const cx = require('classnames');
const PropTypes = require('prop-types');

const Modal = require('../ui/modal');
const Button = require('../ui/button');
const Input = require('../form/input');
const Spinner = require('../ui/spinner');

var SearchWorker = require('webworkify')(require('../../style-search-worker'));

class StyleInstallerModal extends React.PureComponent {
	state = {
		isWorkerReady: false,
		isSearching: false,
		selectedIndex: null,
		filterInput: '',
		filter: '',
		matchedCitationStyles: [],
	}

	componentDidMount() {
		const { stylesData } = this.props;

		SearchWorker.addEventListener('message', this.handleWorkerMessage);

		if(stylesData !== null) {
			SearchWorker.postMessage(['LOAD', stylesData]);
		}
	}

	componentDidUpdate({ isOpen: wasOpen, stylesData: prevStylesData }, { isSearching: wasSearching}) {
		const { fetchStyles, isOpen, stylesData, isFetching } = this.props;
		const { isSearching } = this.state;

		if( isOpen && !wasOpen && !stylesData && !isFetching) {
			fetchStyles();
		}

		if(prevStylesData === null && stylesData !== null) {
			SearchWorker.postMessage(['LOAD', stylesData]);
		}

		if(isSearching && !wasSearching) {
			const filter = this.state.filterInput.toLowerCase();
			SearchWorker.postMessage(['FILTER', filter]);
		}
	}

	componentWillUnmount() {
		SearchWorker.removeEventListener('message', this.handleWorkerMessage);
		if(this.timeout) {
			clearTimeout(this.timeout);
			delete this.timeout;
		}
	}

	handleClose = () => {
		clearTimeout(this.timeout);
		delete this.timeout;
		this.setState({
			filterInput: '',
			filter: ''
		});
		this.props.toggleModal(null, false)
	}

	handleInputKeydown = () => {

	}

	handleFilterChange = newValue => {
		if(this.timeout) {
			clearTimeout(this.timeout);
		}
		this.setState({
			filterInput: newValue
		});

		if(newValue.length > 2) {
			this.timeout = setTimeout(() => {
				this.setState({
					isSearching: true,
					selectedIndex: null
				});
			}, 250);
		}
	}

	handleDelete = () => { }
	handleInstall = () => { }

	handleWorkerMessage = event => {
		const [messageKind, payload] = event.data;
		switch(messageKind) {
			case 'READY':
				this.setState({
					isWorkerReady: true
				});
			break;
			case 'FILTER_COMPLETE':
				this.setState({
					isSearching: false,
					matchedCitationStyles: payload
				});
			break;
		}
	}

	renderStyleItem = style => {
		const { installedCitationStyles, currentCitationStyle } = this.props;
		const styleData = installedCitationStyles.find(cs => cs.name === style.name);
		const isInstalled = typeof styleData !== 'undefined';
		const isCore = isInstalled && styleData.isCore || false;
		const isActive = style.name === currentCitationStyle;
		const isSelected = false; //this.state.matchedCitationStyles[this.state.selectedIndex] ? this.state.matchedCitationStyles[this.state.selectedIndex].name === style.name : false;

		return (
			<li
				className={ cx('style', { selected: isSelected }) }
				key={ style.name }
			>
				<div className="style-title">
					{ style.title }
				</div>
				{
					isActive ? (
						<Button className="btn btn-sm btn-outline-light" disabled>
							Active
						</Button>
					) : isCore ? (
						<Button className="btn btn-sm btn-outline-light" disabled>
							Default
						</Button>
					) : isInstalled ? (
						<Button
							value={ style }
							className="btn btn-sm btn-outline-primary"
							onClick={ this.handleDelete }>
							Remove
						</Button>
					) : (
						<Button
							value={ style }
							className="btn btn-sm btn-outline-secondary"
							onClick={ this.handleInstall }>
							Add
						</Button>
					)
				}
			</li>
		);
}

	render() {
		const { installedCitationStyles, isOpen, stylesData,
			isFetching } = this.props;
		const { filterInput, matchedCitationStyles, isSearching,
			isWorkerReady } = this.state;
		const isReady = stylesData !== null && !isFetching && isWorkerReady;

		return (
			<Modal
				isOpen={ isOpen }
				contentLabel="Citation Style Installer"
				className="modal-touch modal-centered"
				onRequestClose={ this.handleClose }
				closeTimeoutMS={ 200 }
				overlayClassName={ "modal-slide" }
			>
				{ isReady ? (
				<div className="modal-content" tabIndex={ -1 }>
					<div className="modal-header">
						<div className="modal-header-left">
							<Button
								className="btn-link"
								onClick={ this.handleClose }
							>
								Close
							</Button>
						</div>
						<div className="modal-header-center">
							<h4 className="modal-title truncate">
								Citation Style Installer
							</h4>
						</div>
					</div>
					<div className="modal-body">
						<Input
							autoFocus
							className="form-control form-control-lg"
							onChange={ this.handleFilterChange }
							onKeyDown={ this.handleInputKeydown }
							placeholder="Enter three or more characters to search"
							type="text"
							value={ filterInput }
							isBusy={ isSearching }
						/>
						<ul className="style-list">
							{
								filterInput.length > 2 ?
								matchedCitationStyles.map(this.renderStyleItem) :
									installedCitationStyles.map(this.renderStyleItem)
							}
						</ul>
					</div>
				</div>
				) : <Spinner className="large" /> }
			</Modal>
		);
	}

	static propTypes = {
		fetchStyles: PropTypes.func,
		installedCitationStyles: PropTypes.array,
		isFetching: PropTypes.bool,
		isOpen: PropTypes.bool,
		currentCitationStyle: PropTypes.string,
		stylesData: PropTypes.array,
	}
}

module.exports = StyleInstallerModal;
