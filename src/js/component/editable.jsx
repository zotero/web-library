import { Fragment, forwardRef, memo, useImperativeHandle, useRef } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { noop, pick } from 'web-common/utils';

import EditableContent from './editable/content';
import Input from './form/input';
import TextAreaInput from './form/text-area';
import SelectInput from './form/select';

const Editable = memo(forwardRef((props, ref) => {
	const { className, children, input, inputComponent: InputComponent = Input, isBusy, isDisabled, isSelect, isTextArea, onClick = noop,
	onFocus = noop, tabIndex = 0, ...rest } = props;
	const isActive = (props.isActive || isBusy) && !isDisabled;
	const hasChildren = typeof children !== 'undefined';
	const inputRef = useRef(null);

	useImperativeHandle(ref, () => ({
		focus: () => {
			if(!isActive) {
				return;
			}

			if(input && input.focus) {
				input.focus()
			} else if(InputComponent && inputRef.current) {
				inputRef.current.focus();
			}
		}
	}));

	const editableClassName = cx('editable', {
		'editing': isActive,
		'disabled': isDisabled,
		// input type auto-detection doesn't work if element is nested (which it can be, see
		// BoxFieldInput). This causes #440. TODO: drop auto-detection and always use explicit prop
		// to define textarea/select editables
		'textarea': InputComponent === TextAreaInput || (input && input.type === TextAreaInput) || isTextArea,
		'select': InputComponent === SelectInput || (input && input.type === SelectInput) || isSelect,
	});

	return (
        <div
			tabIndex={ isDisabled ? null : isActive ? null : tabIndex }
			onClick={ onClick }
			onFocus={ onFocus }
			className={ editableClassName }
			{ ...pick(rest, p => p.startsWith('data-')) }
		>
			{ isActive ? (
				input ? input :
				<InputComponent
					className={ cx(className, "editable-control") }
					ref={ inputRef }
					{ ...props }
				/>
			) : (
				<Fragment>
					{
					hasChildren ?
						children :
						<EditableContent { ...props } />
					}
				</Fragment>
			) }
		</div>
    );
}));

Editable.displayName = 'Editable';

Editable.propTypes = {
	children: PropTypes.oneOfType([PropTypes.element, PropTypes.array]),
	className: PropTypes.string,
	input: PropTypes.element,
	inputComponent: PropTypes.elementType,
	isActive: PropTypes.bool,
	isBusy: PropTypes.bool,
	isDisabled: PropTypes.bool,
	isSelect: PropTypes.bool,
	isTextArea: PropTypes.bool,
	onClick: PropTypes.func,
	onFocus: PropTypes.func,
	tabIndex: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

export default Editable;
