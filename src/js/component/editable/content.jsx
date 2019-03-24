'use strict';

import escapeHtml from 'escape-html';
import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import TextAreaInput from '../form/text-area';
import Select from '../form/select';

class EditableContent extends React.PureComponent {
	get hasValue() {
		const { input, value } = this.props;
		return !!(value || input && input.props.value);
	}

	get isSelect() {
		const { input, inputComponent } = this.props;
		return inputComponent === Select || input && input.type == Select;
	}

	get isTextarea() {
		const { input, inputComponent } = this.props;
		return inputComponent === TextAreaInput || input && input.type === TextAreaInput;
	}

	get displayValue() {
		const { options, display, input } = this.props;
		const value = this.props.value || input && input.props.value;
		const placeholder = this.props.placeholder || input && input.props.placeholder;

		if(!this.hasValue) { return placeholder; }
		if(display) { return display; }

		if(this.isSelect && options) {
			const displayValue = options.find(e => e.value == value);
			return displayValue ? displayValue.label : value;
		}

		if(this.isTextarea) {
			return escapeHtml(value).replace(/\n/g, '<br />');
		} else {
			return value;
		}
	}

	render() {
		const className = {
			'editable-content': true,
			'placeholder': !this.hasValue
		};

		if(this.isTextarea) {
			return <div
				className={ cx(className) }
				dangerouslySetInnerHTML={ { __html: this.displayValue } }
			/>;
		} else {
			return <div className={ cx(className) }>{ this.displayValue }</div>;
		}
	}

	static defaultProps = {
		value: '',
		placeholder: ''
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

export default EditableContent;
