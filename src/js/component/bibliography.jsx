'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const { UncontrolledDropdown, DropdownToggle, DropdownMenu,
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
	handleCancel() {
		this.props.onCancel();
	}

	renderModalContent() {
		const { bibliography, isUpdating } = this.props;
		const isCopied = false; //placeholder
		return (
			<div className="modal-content" tabIndex={ -1 }>
				<div className="modal-header">
					<h4 className="modal-title text-truncate">
						Bibliography
					</h4>
					<Button
						className="close"
						onClick={ this.handleCancel.bind(this) }
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
						<UncontrolledDropdown
							className={ cx('btn-group', { 'success': isCopied}) }
						>
							<Button
								disabled={ isUpdating }
								className='btn btn-secondary copy-to-clipboard'
								onClick={ this.handleCopyToClipboardClick }
							>
								<span className={ cx('inline-feedback', { 'active': isCopied }) }>
									<span className="default-text" aria-hidden={ !isCopied }>
										Copy to Clipboard
									</span>
									<span className="shorter feedback" aria-hidden={ isCopied }>
										Copied!
									</span>
								</span>
							</Button>
							<DropdownToggle
								disabled={ isUpdating }
								className="btn btn-secondary btn-xl dropdown-toggle"
							>
								<span className="dropdown-caret" />
							</DropdownToggle>
							<DropdownMenu className="dropdown-menu">
								<DropdownItem
									onClick={ this.handleCopyHtml }
									className="btn clipboard-trigger"
								>
									<span className={ cx('inline-feedback', { 'active': isCopied }) }>
										<span className="default-text" aria-hidden={ !isCopied }>
											Copy HTML
										</span>
										<span className="shorter feedback" aria-hidden={ isCopied }>
											Copied!
										</span>
									</span>
								</DropdownItem>
							</DropdownMenu>
						</UncontrolledDropdown>
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
				onRequestClose={ this.handleCancel.bind(this) }
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
