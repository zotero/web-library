'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const { Dropdown, DropdownToggle, DropdownMenu,
	DropdownItem } = require('reactstrap/lib');
const Spinner = require('./ui/spinner');
const Button = require('./ui/button');
const Icon = require('./ui/icon');
const Modal = require('./ui/modal');
const StyleSelector = require('./style-selector');
const LocaleSelector = require('./locale-selector');
const { noop } = require('../utils');
const { pick } = require('../common/immutable');
const cx = require('classnames');


class Bibliography extends React.PureComponent {
	state = {
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

	renderModalContent() {
		const { bibliography, isUpdating } = this.props;
		const { isClipboardCopied, isDropdownOpen, isHtmlCopied } = this.state;
		const isCopied = false; //placeholder
		return (
			<div className="modal-content" tabIndex={ -1 }>
				<div className="modal-header">
					<h4 className="modal-title text-truncate">
						Bibliography
					</h4>
					<Button
						className="close"
						onClick={ this.handleCancel }
					>
						<Icon type={ '24/remove' } width="24" height="24" />
					</Button>
				</div>
				<div className={ cx('modal-body', { loading: isUpdating }) }>
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
					<hr/>
					{ isUpdating ? (
						<Spinner className="large" />
						) : (
							<div className="bibliography read-only"
								dangerouslySetInnerHTML={ { __html: bibliography.join('') } }
							/>
						)
					}
				</div>
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
			</div>
		);
	}

	render() {
		const { isOpen, isReady } = this.props;
		return (
			<Modal
				isOpen={ isOpen }
				contentLabel="Bibliography"
				className={ cx('modal-lg', 'bibliography', { loading: !isReady })}
				onRequestClose={ this.handleCancel }
			>
				{ isReady ? this.renderModalContent() : <Spinner className="large" /> }
			</Modal>
		);
	}

	static propTypes = {
		isOpen: PropTypes.bool,
		isReady: PropTypes.bool,
		onCancel: PropTypes.func,
	}

	static defaultProps = {
		onCancel: noop
	}
}


module.exports = Bibliography;
