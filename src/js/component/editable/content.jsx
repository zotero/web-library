import React, { memo } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

import Select from '../form/select';

const EditableContent = props => {
	const {  display, input, inputComponent, options, title } = props;
	const value = props.value || (input && input.props.value);
	const placeholder = props.placeholder || (input && input.props.placeholder);
	const hasValue = !!(value || input && input.props.value);
	const isSelect = inputComponent === Select || input && input.type == Select;

	const className = {
		'editable-content': true,
		'placeholder': !hasValue
	};
	const displayValue = !hasValue ? placeholder :
		display ? display :
			(isSelect && options) ? options.find(e => e.value == value)?.label ?? value : value;

	return (
		<div title={ title } className={ cx(className) }>
			{ displayValue }
		</div>
	);
}

EditableContent.propTypes = {
	title: PropTypes.string,
	display: PropTypes.string,
	input: PropTypes.element,
	inputComponent: PropTypes.elementType,
	options: PropTypes.array,
	placeholder: PropTypes.string,
	value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default memo(EditableContent);
