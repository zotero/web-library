import cx from 'classnames';
import { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useRef, useState, } from 'react';
import { useSelector } from 'react-redux';
import { usePrevious } from 'web-common/hooks';
import { noop, pick } from 'web-common/utils';
import { Spinner } from 'web-common/components';

import AutoResizer from './auto-resizer';

const NATIVE_INPUT_PROPS = ['autoComplete', 'autoFocus', 'cols', 'disabled', 'form', 'id',
'maxLength', 'minLength', 'name', 'placeholder', 'readOnly', 'required', 'rows', 'spellCheck',
'tabIndex', 'wrap'];

const TextAreaInput = memo(forwardRef((props, ref) => {
	const { className, inputGroupClassName, isBusy, value: initialValue, isSingleLine, onBlur = noop,
		onFocus = noop, onCancel = noop, onChange = noop, onCommit = noop, onKeyDown = noop,
		onKeyUp = noop, selectOnFocus, resize, ...rest } = props;
	const isTouchOrSmall = useSelector(state => state.device.isTouchOrSmall);
	const [value, setValue] = useState(initialValue);
	const prevInitialValue = usePrevious(initialValue);

	const input = useRef(null);
	const hasBeenCancelled = useRef(false);
	const hasBeenCommitted = useRef(false);

	const groupClassName = cx({
		'input-group': true,
		'textarea': true,
		'busy': isBusy
	}, inputGroupClassName);

	//reset on every render
	hasBeenCancelled.current = false;
	hasBeenCommitted.current = false;

	useImperativeHandle(ref, () => ({
		focus: () => {
			input.current.focus();
			if(selectOnFocus) {
				input.current.select();
			}
		}
	}));

	const handleChange = useCallback(ev => {
		setValue(ev.currentTarget.value);
		onChange(ev.currentTarget.value);
	}, [onChange]);

	const handleBlur = useCallback(ev => {
		const shouldCancel = onBlur(ev);
		if (hasBeenCancelled.current || hasBeenCommitted.current) {
			return;
		}
		if(shouldCancel) {
			onCancel(value !== initialValue, ev);
			hasBeenCancelled.current = true;
		} else {
			onCommit(value, value !== initialValue, ev);
			hasBeenCommitted.current = true;
		}
	}, [onBlur, initialValue, onCancel, onCommit, value]);

	const handleFocus = useCallback(ev => {
		if(selectOnFocus) {
			ev.currentTarget.select();
		} else {
			onFocus(ev);
		}
	}, [onFocus, selectOnFocus]);

	const handleKeyDown = useCallback(ev => {
		switch (ev.key) {
			case 'Escape':
				onCancel(value !== initialValue, ev);
				hasBeenCancelled.current = true;
			break;
			case 'Enter':
				if(ev.shiftKey || isSingleLine) {
					hasBeenCommitted.current = true;
					onCommit(value, value !== initialValue, ev);
				} else {
					// line break, not a commit -- keep it away from ancestors that act on Enter
					ev.stopPropagation();
				}
			break;
		default:
			onKeyDown(ev);
			return;
		}
	}, [initialValue, isSingleLine, onCancel, onCommit, onKeyDown, value]);

	useEffect(() => {
		if(initialValue !== prevInitialValue && initialValue !== value) {
			setValue(initialValue);
		}
	}, [initialValue, value, prevInitialValue]);

	const textarea = (
		<textarea
			className={ className }
			onBlur={ handleBlur }
			onChange={ handleChange }
			onFocus={ handleFocus }
			onKeyUp={ onKeyUp }
			onKeyDown={ handleKeyDown }
			ref={ input }
			value={ value }
			{ ...pick(rest, NATIVE_INPUT_PROPS) }
			{ ...pick(rest, key => key.match(/^(aria-|data-).*/)) }
		/>
	);

	return (
		<div className={ groupClassName }>
			{ resize ? (
				<AutoResizer
					content={ value }
					vertical={ resize === 'vertical' }
				>
					{ textarea }
				</AutoResizer>
			) : textarea }
			{ isBusy && <Spinner small={ !isTouchOrSmall } /> }
		</div>
	);
}));

TextAreaInput.displayName = 'TextAreaInput';

export default TextAreaInput;
