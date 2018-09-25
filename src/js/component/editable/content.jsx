'use strict';

const escapeHtml = require('escape-html');
const React = require('react');
const PropTypes = require('prop-types');
const cx = require('classnames');
const TextAreaInput = require('../form/text-area');
const Select = require('../form/select');

class EditableContent extends React.PureComponent {
	get content() {
		return escapeHtml(this.props.value).replace(/\n/g, '<br />');
	}

	get hasValue() {
		const { input, value } = this.props;
		return !!(value || input && input.props.value);
	}

	get isSelect() {
		const { input, inputComponent } = this.props;
		return inputComponent === Select || input && input.type == Select;
	}

	get displayValue() {
		const { options, display, placeholder, input } = this.props;

		if(!this.hasValue) { return placeholder; }
		if(display) { return display; }

		var value = this.props.value || input && input.props.value;

		if(this.isSelect && options) {
			const displayValue = options.find(e => e.value == value);
			return displayValue ? displayValue.label : value;
		}

		return value;
	}

	render() {
		const { input, inputComponent } = this.props;

		if(inputComponent === TextAreaInput || input && input.type === TextAreaInput) {
			return <div className="editable-content"
				dangerouslySetInnerHTML={ { __html: this.content } } />;
		} else {
			const className = {
				'editable-content': true,
				'placeholder': !this.hasValue && this.props.placeholder
			};
			return (
				<div className={ cx(className) }>{ this.displayValue }</div>
			);
		}
	}

	static defaultProps = {
		value: ''
	};

	static propTypes = {
		display: PropTypes.string,
		input: PropTypes.element,
		inputComponent: PropTypes.func,
		options: PropTypes.array,
		placeholder: PropTypes.string,
		value: PropTypes.oneOfType([
			PropTypes.string,
			PropTypes.number
		])
	};
}

module.exports = EditableContent;
