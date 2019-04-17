'use strict';

import React from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import Modal from '../ui/modal';
import Button from '../ui/button';
import Input from '../form/input';
import Spinner from '../ui/spinner';
import { pick } from '../../common/immutable';
import { coreCitationStyles } from '../../../../data/citation-styles-data.json';
import SearchWorkerFactory from 'webworkify';
const SearchWorker = SearchWorkerFactory(require('../../style-search.worker.js'));

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
		this.props.toggleModal(null, false);

		// clear filter once modal is really closed, but not before to avoid flicker
		setTimeout(() => {
			this.setState({
				filterInput: '',
				filter: ''
			});
		}, 300);
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

	handleDelete = ev => {
		const { installedCitationStyles, preferenceChange } = this.props;
		const styleName = ev.target.value;
		const newInstalledCitationStyles = installedCitationStyles.filter(
			c => c.name !== styleName
		);

		preferenceChange('installedCitationStyles', newInstalledCitationStyles);
	}

	handleInstall = ev => {
		const { matchedCitationStyles } = this.state;
		const styleName = ev.target.value;
		const style = matchedCitationStyles.find(c => c.name == styleName);
		const { installedCitationStyles, preferenceChange } = this.props;
		const newInstalledCitationStyles = [
			...installedCitationStyles,
			pick(style, ['title', 'name'])
		];

		preferenceChange('installedCitationStyles', newInstalledCitationStyles);
	}

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
		const { currentCitationStyle } = this.props;
		const styleData = this.localCitationStyles.find(cs => cs.name === style.name);
		const isInstalled = typeof styleData !== 'undefined';
		const isCore = isInstalled && styleData.isCore || false;
		const isActive = style.name === currentCitationStyle;
		const isSelected = this.state.matchedCitationStyles[this.state.selectedIndex] ?
			this.state.matchedCitationStyles[this.state.selectedIndex].name === style.name : false;

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
							value={ style.name }
							className="btn btn-sm btn-outline-primary"
							onClick={ this.handleDelete }>
							Remove
						</Button>
					) : (
						<Button
							value={ style.name }
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
		const { device } = this.props;
		const { installedCitationStyles, isOpen, stylesData,
			isFetching } = this.props;
		const { filterInput, matchedCitationStyles, isSearching,
			isWorkerReady } = this.state;
		const isReady = stylesData !== null && !isFetching && isWorkerReady;
		const className = cx({
			'style-installer': true,
			'modal-touch': device.isTouchOrSmall,
			'modal-lg': !device.isTouchOrSmall,
			'loading': !isReady
		});
		this.localCitationStyles = [...coreCitationStyles, ...installedCitationStyles];

		return (
			<Modal
				isOpen={ isOpen }
				contentLabel="Citation Style Installer"
				className={ className }
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
							isBusy={ isSearching }
							onChange={ this.handleFilterChange }
							placeholder="Enter three or more characters to search"
							tabIndex={ 0 }
							type="text"
							value={ filterInput }
						/>
						<ul className="style-list">
							{
								filterInput.length > 2 ?
								matchedCitationStyles.map(this.renderStyleItem) :
									this.localCitationStyles.map(this.renderStyleItem)
							}
						</ul>
					</div>
				</div>
				) : <Spinner className="large" /> }
			</Modal>
		);
	}

	static propTypes = {
		currentCitationStyle: PropTypes.string,
		fetchStyles: PropTypes.func,
		installedCitationStyles: PropTypes.array,
		isFetching: PropTypes.bool,
		isOpen: PropTypes.bool,
		preferenceChange: PropTypes.func,
		stylesData: PropTypes.array,
		toggleModal: PropTypes.func,
	}
}

export default StyleInstallerModal;
