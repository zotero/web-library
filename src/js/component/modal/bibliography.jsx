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

	handleCopyToClipboardClick = () => {
		this.props.onCopyToClipboardClick();
		this.setState({ isClipboardCopied: true });
		setTimeout(() => {
			this.setState({ isClipboardCopied: false });
		}, 1000);
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
		const { onSelectModeToggle, onCancel, onCopyHtmlClick,
			onCopyToClipboardClick } = this.props;
		if(this.state.requestedAction === 'html') {
			onCopyHtmlClick();
		} else {
			onCopyToClipboardClick();
		}
		onCancel();
		onSelectModeToggle(false);
	}

	renderModalContent() {
		const { device, bibliography, isUpdating } = this.props;
		const { isClipboardCopied, isDropdownOpen, isHtmlCopied } = this.state;
		const isCopied = false; //placeholder
		return (
			<div className="modal-content" tabIndex={ -1 }>
				<div className="modal-header">
					{
						device.isTouchOrSmall && (
							<div className="modal-header-left">
								<Button
									className="btn-link"
									onClick={ this.handleCancel }
								>
									Cancel
								</Button>
							</div>
						)
					}
					{
						device.isTouchOrSmall ? (
							<div className="modal-header-center">
								<h4 className="modal-title truncate">
									Bibliography
								</h4>
							</div>
						) : (
							<h4 className="modal-title truncate">
								Bibliography
							</h4>
						)
					}
					<div className="modal-header-right">
						{
							device.isTouchOrSmall ? (
								<Button
									disabled={ isUpdating }
									className="btn-link"
									onClick={ this.handleCreateClick }
								>
									Create
								</Button>
							) : (
								<Button
									className="close"
									onClick={ this.handleCancel }
								>
									<Icon type={ '16/close-2' } width="16" height="16" />
								</Button>
							)
						}
					</div>
				</div>
				<div className={ cx('modal-body', { loading: !device.isTouchOrSmall && isUpdating }) } tabIndex={ 0 }>
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
												{ ...pick(this.props,
													['citationStyle', 'citationStyles', 'onStyleChange']
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
												{ ...pick(this.props,
													['locale', 'onLocaleChange']
											)} />
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
											dangerouslySetInnerHTML={ { __html: bibliography.join('') } }
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
								disabled={ isUpdating }
								className='btn btn-lg btn-secondary copy-to-clipboard'
								onClick={ this.handleCopyToClipboardClick }
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
		bibliography: PropTypes.array.isRequired,
		device: PropTypes.object,
		isOpen: PropTypes.bool,
		isUpdating: PropTypes.bool,
		onCancel: PropTypes.func,
		onCopyHtmlClick: PropTypes.func.isRequired,
		onCopyToClipboardClick: PropTypes.func.isRequired,
		onSelectModeToggle: PropTypes.func.isRequired,
	}

	static defaultProps = {
		bibliography: [],
		onCancel: noop,
	}
}


export default BibliographyModal;
