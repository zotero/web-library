'use strict';

import React from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import Modal from '../ui/modal';
import Button from '../ui/button';
import Icon from '../ui/icon';
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

		if(newValue.length > 0) {
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
		const styleName = ev.currentTarget.value;
		const newInstalledCitationStyles = installedCitationStyles.filter(
			c => c.name !== styleName
		);

		preferenceChange('installedCitationStyles', newInstalledCitationStyles);
	}

	handleInstall = ev => {
		const { matchedCitationStyles } = this.state;
		const styleName = ev.currentTarget.value;
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
		const { currentCitationStyle, device } = this.props;
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
						<Button
							className={ cx({
								'btn-circle btn-primary': device.isTouchOrSmall,
								'btn-outline-light': !device.isTouchOrSmall
							}) }
							disabled
						>
							{
								device.isTouchOrSmall ? (
									<Icon type="16/minus-strong" width="16" height="16" />
								) : 'Active'
							}
						</Button>
					) : isCore ? (
						<Button
							className={ cx({
								'btn-circle btn-primary': device.isTouchOrSmall,
								'btn-outline-light': !device.isTouchOrSmall
							}) }
							disabled
						>
							{
								device.isTouchOrSmall ? (
									<Icon type="16/minus-strong" width="16" height="16" />
								) : 'Default'
							}
						</Button>
					) : isInstalled ? (
						<Button
							value={ style.name }
							className={ cx({
								'btn-circle btn-primary': device.isTouchOrSmall,
								'btn-outline-primary': !device.isTouchOrSmall
							}) }
							onClick={ this.handleDelete }
						>
							{
								device.isTouchOrSmall ? (
									<Icon type="16/minus-strong" width="16" height="16" />
								) : 'Remove'
							}
						</Button>
					) : (
						<Button
							value={ style.name }
							className={ cx({
								'btn-circle btn-secondary': device.isTouchOrSmall,
								'btn-outline-secondary': !device.isTouchOrSmall
							}) }
							onClick={ this.handleInstall }
						>
							{
								device.isTouchOrSmall ? (
									<Icon type="16/plus-strong" width="16" height="16" />
								) : 'Add'
							}
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
			'style-installer modal-scrollable modal-lg': true,
			'modal-touch': device.isTouchOrSmall,
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
						{
							device.isTouchOrSmall ? (
								<React.Fragment>
									<div className="modal-header-left" />
									<div className="modal-header-center">
										<h4 className="modal-title truncate">
											Citation Styles
										</h4>
									</div>
									<div className="modal-header-right">
										<Button
											className="btn-link"
											onClick={ this.handleClose }
										>
											Close
										</Button>
									</div>
								</React.Fragment>
							) : (
								<React.Fragment>
									<h4 className="modal-title truncate">
										Citation Styles
									</h4>
									<Button
										icon
										className="close"
										onClick={ this.handleClose }
									>
										<Icon type={ '16/close' } width="16" height="16" />
									</Button>
								</React.Fragment>
							)
						}
					</div>
					<div className="modal-body" tabIndex={ 0 }>
						<div className="search-bar">
							<Input
								autoFocus
								className="form-control form-control-lg search-input"
								isBusy={ isSearching }
								onChange={ this.handleFilterChange }
								placeholder="Search"
								tabIndex={ 0 }
								type="text"
								value={ filterInput }
							/>
						</div>
						<ul className="style-list">
							{
								filterInput.length > 0 ?
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
