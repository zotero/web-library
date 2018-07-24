'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const cx = require('classnames');

const EditableContent = require('./editable/content');
const Input = require('./form/input');
const SelectInput = require('./form/select');
const TextAreaInput = require('./form/text-area');
const { noop } = require('../utils');
const { UserTypeContext, ViewportContext } = require('../context');

class Editable extends React.PureComponent {
	setInput(input) {
		this.props.inputRef(input);
	}

	handleClick(event) {
		this.props.onEditableClick(event);
	}

	handleFocus(event) {
		this.props.onEditableFocus(event);
	}

	get isActive() {
		return (this.props.isActive || this.props.isBusy) && !this.props.isDisabled;
	}

	get isReadOnly() {
		return this.props.isReadOnly || this.props.isBusy;
	}

	get className() {
		return {
			'editable': true,
			'editing': this.isActive,
			'textarea': this.props.inputComponent === TextAreaInput,
			'select': this.props.inputComponent === SelectInput
		};
	}

	renderContent() {
		const hasChildren = typeof this.props.children !== 'undefined';
		return (
			<React.Fragment>
				{
					hasChildren ?
						this.props.children :
						<EditableContent { ...this.props } />
				}
			</React.Fragment>
		);
	}

	renderControls() {
		const InputComponent = this.props.inputComponent;
		const { className, ...props } = this.props;
		return (
			<InputComponent
				{ ...props }
				className={ cx(className, "editable-control") }
				isReadOnly={ this.isReadOnly }
				ref={ this.setInput.bind(this) }
			/>
		);
	}

	render() {
		return (
			<UserTypeContext.Consumer>
				{ userType => (
					<ViewportContext.Consumer>
						{ viewport => (
							<div
								tabIndex={ userType === 'touch' || viewport.xxs || viewport.xs || viewport.sm ?
									null : this.isActive ? null : 0
								}
								onClick={ this.handleClick.bind(this) }
								onFocus={ this.handleFocus.bind(this) }
								className={ cx(this.className) }
							>
								{ this.isActive ? this.renderControls() : this.renderContent() }
							</div>
						)
					}
					</ViewportContext.Consumer>
				)
			}
			</UserTypeContext.Consumer>
		);
	}
	static defaultProps = {
		inputComponent: Input,
		inputRef: noop,
		onEditableClick: noop,
		onEditableFocus: noop,
	};

	static propTypes = {
		children: PropTypes.oneOfType([PropTypes.element, PropTypes.array]),
		inputComponent: PropTypes.func,
		inputRef: PropTypes.func,
		isActive: PropTypes.bool,
		isBusy: PropTypes.bool,
		isDisabled: PropTypes.bool,
		isReadOnly: PropTypes.bool,
	};
}


module.exports = Editable;
