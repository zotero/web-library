'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap/lib';
import Spinner from '../ui/spinner';
import Button from '../ui/button';
import Icon from '../ui/icon';
import Modal from '../ui/modal';
import CheckboxSet from '../form/checkbox-set';
import StyleSelector from '../style-selector';
import LocaleSelector from '../locale-selector';
import { noop } from '../../utils';
import { pick } from '../../common/immutable';
import cx from 'classnames';


class BibliographyModal extends React.PureComponent {
	state = {
		requestedAction: 'clipboard',
		isClipboardCopied: false,
		isHtmlCopied: false,
	}

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
							<h4 className="modal-title text-truncate">
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
									<Icon type={ '24/remove' } width="24" height="24" />
								</Button>
							)
						}
					</div>
				</div>
				<div className={ cx('modal-body', { loading: !device.isTouchOrSmall && isUpdating }) }>
					<div className="style-selector-container">
						<label>Citation Style:</label>
						<StyleSelector { ...pick(this.props,
							['citationStyle', 'citationStyles', 'onStyleChange']
						)} />
					</div>
					<div className="language-selector-container">
						<label>Language:</label>
						<LocaleSelector { ...pick(this.props,
							['locale', 'onLocaleChange']
						)} />
					</div>
					{ device.isTouchOrSmall && (
						<CheckboxSet
							onChange={ this.handleRequestedActionChange }
							options={[
								{ value: 'clipboard', label: 'Copy to Clipboard' },
								{ value: 'html', label: 'Copy HTML' },
							]}
							value={ this.state.requestedAction }
						/>
					)}
					{ !device.isTouchOrSmall && (
						<React.Fragment>
							<hr/>
							{ isUpdating ? (
								<Spinner className="large" />
								) : (
									<div className="bibliography read-only"
										dangerouslySetInnerHTML={ { __html: bibliography.join('') } }
									/>
								)
							}
						</React.Fragment>
					)}
				</div>
				{ !device.isTouchOrSmall && (
					<div className="modal-footer">
						<div className="export-tools">
							<Dropdown
								isOpen={ isDropdownOpen }
								toggle={ this.handleDropdownToggle }
								className={ cx('btn-group', { 'success': isCopied}) }
							>
								<Button
									disabled={ isUpdating }
									className='btn btn-secondary copy-to-clipboard'
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
									className="btn btn-secondary btn-xl dropdown-toggle"
								>
									<Icon type={ '16/caret-16' } width="16" height="16" />
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
