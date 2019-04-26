'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap/lib';
import Spinner from '../ui/spinner';
import Button from '../ui/button';
import Icon from '../ui/icon';
import Modal from '../ui/modal';
import RadioSet from '../form/radio-set';
import StyleSelector from '../style-selector';
import LocaleSelector from '../locale-selector';
import { noop } from '../../utils';
import { pick } from '../../common/immutable';
import { getUniqueId } from '../../utils';
import { BIBLIOGRAPHY, STYLE_INSTALLER } from '../../constants/modals';
import cx from 'classnames';


class BibliographyModal extends React.PureComponent {
	state = {
		requestedAction: 'clipboard',
		isClipboardCopied: false,
		isHtmlCopied: false,
	}
	styleSelectorId = getUniqueId();
	localeSelectorId = getUniqueId();

	handleCancel = () => {
		this.props.onCancel();
	}

	//@NOTE: handles both click and keydown explicitely because "click" is
	//		 also handled in containing element (Dropdown)  where
	//		 `preventDefault` is called on this event, hence stopping
	//		 the browser from triggering synthetic click on relevant keydowns
	handleCopyToClipboardInteraction = ev => {
		if(ev.type !== 'keydown' || (ev.key === 'Enter' || ev.key === ' ')) {
			this.props.onCopyToClipboardClick();
			this.setState({ isClipboardCopied: true });
			setTimeout(() => {
				this.setState({ isClipboardCopied: false });
			}, 1000);
		}
	}

	handleCopyHtmlClick = () => {
		this.props.onCopyHtmlClick();
		this.setState({ isHtmlCopied: true });
		setTimeout(() => {
			this.setState({ isHtmlCopied: false });
		}, 1000);
	}

	handleDropdownToggle = ev => {
		const isFromCopyTrigger = ev.target && ev.target.closest('.clipboard-trigger');
		if(this.state.isDropdownOpen && isFromCopyTrigger) {
			this.dropdownTimer = setTimeout(() => {
				this.setState({ isDropdownOpen: false });
			}, 950);
			return false;
		}
		clearTimeout(this.dropdownTimer);
		this.setState({ isDropdownOpen: !this.state.isDropdownOpen });
	}

	handleRequestedActionChange = newValue => this.setState({ requestedAction: newValue });

	handleCreateClick = () => {
		const { onSelectModeToggle, onCopyHtmlClick,
			onCopyToClipboardClick, toggleModal } = this.props;
		if(this.state.requestedAction === 'html') {
			onCopyHtmlClick();
		} else {
			onCopyToClipboardClick();
		}
		toggleModal(BIBLIOGRAPHY, false);
		onSelectModeToggle(false);
	}

	handleStyleChange = async citationStyle => {
		const { toggleModal, preferenceChange } = this.props;
		if(citationStyle === 'install') {
			await toggleModal(BIBLIOGRAPHY, false);
			await toggleModal(STYLE_INSTALLER, true);
		} else {
			preferenceChange('citationStyle', citationStyle);
		}
	}

	handleLocaleChange = locale => {
		const { preferenceChange } = this.props;
		preferenceChange('citationLocale', locale);
	}

	handleCancel = async () => {
		const { toggleModal } = this.props;
		await toggleModal(BIBLIOGRAPHY, false);
	}

	renderModalContent() {
		const { device, bibliography, isUpdating } = this.props;
		const { isClipboardCopied, isDropdownOpen, isHtmlCopied } = this.state;
		return (
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
										Bibliography
									</h4>
								</div>
								<div className="modal-header-right">
									<Button
										disabled={ isUpdating }
										className="btn-link"
										onClick={ this.handleCreateClick }
									>
										Create
									</Button>
								</div>
							</React.Fragment>
						) : (
							<React.Fragment>
								<h4 className="modal-title truncate">
									Bibliography
								</h4>
								<Button
									icon
									className="close"
									onClick={ this.handleCancel }
								>
									<Icon type={ '16/close' } width="16" height="16" />
								</Button>
							</React.Fragment>
						)
					}
				</div>
				<div
					className={ cx(
						'modal-body',
						{ loading: !device.isTouchOrSmall && isUpdating }
					)}
					tabIndex={ !device.isTouchOrSmall ? 0 : null }
				>
					<div className="form">
						<div className="citation-options">
							<div className="form-row">
								<div className="col-9">
									<div className="form-group form-row style-selector-container">
										<label
											htmlFor={ this.styleSelectorId }
											className="col-form-label"
										>
											Citation Style
										</label>
										<div className="col">
											<StyleSelector
												id={ this.styleSelectorId }
												onStyleChange={ this.handleStyleChange }
												{ ...pick(this.props,
													['citationStyle', 'citationStyles']
											)} />
										</div>
									</div>
								</div>
								<div className="col-3">
									<div className="form-group form-row language-selector-container">
										<label
											htmlFor={ this.localeSelectorId }
											className="col-form-label"
										>
											Language
										</label>
										<div className="col">
											<LocaleSelector
												id={ this.localeSelectorId }
												onLocaleChange={ this.handleLocaleChange }
												{ ...pick(this.props, ['citationLocale'] )}
											/>
										</div>
									</div>
								</div>
							</div>
						</div>
						{ device.isTouchOrSmall && (
							<RadioSet
								onChange={ this.handleRequestedActionChange }
								options={[
									{ value: 'clipboard', label: 'Copy to Clipboard' },
									{ value: 'html', label: 'Copy HTML' },
								]}
								value={ this.state.requestedAction }
							/>
						)}
						{ !device.isTouchOrSmall && (
							<div className="bibliography-container">
								{ isUpdating ? (
									<Spinner className="large" />
									) : (
										<div className="bibliography read-only"
											dangerouslySetInnerHTML={ { __html: bibliography } }
										/>
									)
								}
							</div>
						)}
					</div>
				</div>
				{ !device.isTouchOrSmall && (
					<div className="modal-footer justify-content-end">
						<Dropdown
							isOpen={ isDropdownOpen }
							toggle={ this.handleDropdownToggle }
							className={ cx('btn-group', { 'success': isClipboardCopied}) }
						>
							<Button
								type="button"
								disabled={ isUpdating }
								className='btn btn-lg btn-secondary copy-to-clipboard'
								onClick={ this.handleCopyToClipboardInteraction }
								onKeyDown={ this.handleCopyToClipboardInteraction }
							>
								<span className={ cx('inline-feedback', { 'active': isClipboardCopied }) }>
									<span className="default-text" aria-hidden={ !isClipboardCopied }>
										Copy to Clipboard
									</span>
									<span className="shorter feedback" aria-hidden={ isClipboardCopied }>
										Copied!
									</span>
								</span>
							</Button>
							<DropdownToggle
								disabled={ isUpdating }
								className="btn btn-lg btn-secondary dropdown-toggle"
							>
								<Icon type={ '16/chevron-9' } width="16" height="16" />
							</DropdownToggle>
							<DropdownMenu className="dropdown-menu">
								<DropdownItem
									onClick={ this.handleCopyHtmlClick }
									className="btn clipboard-trigger"
								>
									<span className={ cx('inline-feedback', { 'active': isHtmlCopied }) }>
										<span className="default-text" aria-hidden={ !isHtmlCopied }>
											Copy HTML
										</span>
										<span className="shorter feedback" aria-hidden={ isHtmlCopied }>
											Copied!
										</span>
									</span>
								</DropdownItem>
							</DropdownMenu>
						</Dropdown>
					</div>
				)}
			</div>
		);
	}

	render() {
		const { device, isOpen } = this.props;
		const className = cx({
			'bibliography-modal': true,
			'modal-centered': device.isTouchOrSmall,
			'modal-xl modal-scrollable': !device.isTouchOrSmall,
			'modal-touch': device.isTouchOrSmall,
		});
		return (
			<Modal
				isOpen={ isOpen }
				contentLabel="Bibliography"
				className={ className }
				onRequestClose={ this.handleCancel }
				closeTimeoutMS={ device.isTouchOrSmall ? 200 : null }
				overlayClassName={ device.isTouchOrSmall ? "modal-slide" : null }
			>
				{ this.renderModalContent() }
			</Modal>
		);
	}

	static propTypes = {
		bibliography: PropTypes.string.isRequired,
		device: PropTypes.object,
		isOpen: PropTypes.bool,
		isUpdating: PropTypes.bool,
		onCancel: PropTypes.func,
		onCopyHtmlClick: PropTypes.func.isRequired,
		onCopyToClipboardClick: PropTypes.func.isRequired,
		onSelectModeToggle: PropTypes.func.isRequired,
		preferenceChange: PropTypes.func.isRequired,
		toggleModal: PropTypes.func.isRequired,
	}

	static defaultProps = {
		onCancel: noop,
		bibliography: ''
	}
}


export default BibliographyModal;
