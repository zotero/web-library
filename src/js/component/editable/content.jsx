'use strict';

const escapeHtml = require('escape-html');
const React = require('react');
const PropTypes = require('prop-types');
const cx = require('classnames');
const TextAreaInput = require('../text-area-input');

class EditableContent extends React.PureComponent {
	get content() {
		return escapeHtml(this.props.value).replace(/\n/g, '<br />');
	}

	get displayValue() {
		const { options, value, display, placeholder } = this.props;

		return value ? 
			options && options.find(e => e.value == value).label || display ||  value :
			placeholder;
	}
	
	render() {
		if(this.props.inputComponent === TextAreaInput) {
			return <span dangerouslySetInnerHTML={ { __html: this.content } } />;
		} else {
			const className = {
				'editable-content': true,
				'placeholder': !this.props.value && this.props.placeholder
			};
			return (
				<span className={ cx(className) }>{ this.displayValue }</span>
			);
		}
	}

	static defaultProps = {
		value: ''
	};

	static propTypes = {
		display: PropTypes.string,
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