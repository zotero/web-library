import { memo } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { pick } from 'web-common/utils';

import Select from '../form/select';

const EditableContent = props => {
	const { display, id, input, inputComponent, labelId, options, title } = props;
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
		<div
			{ ...pick(props, p => p.startsWith('aria-')) }
			role="textbox"
			aria-readonly="true"
			aria-labelledby={ labelId }
			id={ id }
			title={ title }
			className={ cx(className) }
		>
			{ displayValue }
		</div>
	);
}

EditableContent.propTypes = {
	display: PropTypes.string,
	id: PropTypes.string,
	input: PropTypes.element,
	inputComponent: PropTypes.elementType,
	labelId: PropTypes.string,
	options: PropTypes.array,
	placeholder: PropTypes.string,
	title: PropTypes.string,
	value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default memo(EditableContent);
