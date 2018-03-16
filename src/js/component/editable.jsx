'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const cx = require('classnames');

const EditableContent = require('./editable/content');
const Input = require('./form/input');
const SelectInput = require('./form/select');
const TextAreaInput = require('./form/text-area');

class Editable extends React.PureComponent {
	renderContent() {
		const hasChildren = typeof this.props.children !== 'undefined';
		return (
			<span className="editable-value">
				{
					hasChildren ? 
						this.props.children :
						<EditableContent { ...this.props } />
				}
			</span>
		);
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


	renderControls() {
		const InputComponent = this.props.inputComponent;
		return (
			<InputComponent
				className="editable-control"
				isReadOnly={ this.isReadOnly }
				ref={ this.setInput }
				{ ...this.props }
			/>
		);
	}

	render() {
		return (
			<div className={ cx(this.className) }>
				{ this.isActive ? this.renderControls() : this.renderContent() }
			</div>
		);
	}
	static defaultProps = {
		inputComponent: Input,
	};

	static propTypes = {
		children: PropTypes.oneOfType([PropTypes.element, PropTypes.array]),
		inputComponent: PropTypes.func,
		isActive: PropTypes.bool,
		isBusy: PropTypes.bool,
		isDisabled: PropTypes.bool,
		isReadOnly: PropTypes.bool,
	};
}


module.exports = Editable;