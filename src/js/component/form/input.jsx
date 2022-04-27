import cx from 'classnames';
import PropTypes from 'prop-types';
import React, { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';

import AutoResizer from './auto-resizer';
import Spinner from '../ui/spinner';
import Suggestions from './suggestions';
import { noop } from '../../utils';
import { pick } from '../../common/immutable';
import { usePrevious } from '../../hooks';

const NATIVE_INPUT_PROPS = ['autoFocus', 'form', 'id', 'inputMode', 'max', 'maxLength',
'min', 'minLength', 'name', 'placeholder', 'type', 'spellCheck', 'step', 'tabIndex'];

const Input = memo(forwardRef((props, ref) => {
	const { className = 'form-control', inputGroupClassName, isBusy, isDisabled, isReadOnly, isRequired, onBlur = noop, onCancel
	= noop, onCommit = noop, onChange = noop, onFocus = noop, onKeyDown = noop, selectOnFocus,
	suggestions, validationError, value: initialValue, resize, ...rest } = props;
	const [hasCancelledSuggestions, setHasCancelledSuggestions] = useState(false);
	const [value, setValue] = useState(initialValue);
	const input = useRef(null);
	const suggestionsElement = useRef(null);
	const prevInitialValue = usePrevious(initialValue);
	const prevValidationError = usePrevious(validationError);

	const hasBeenCancelled = useRef(false);
	const hasBeenCommitted = useRef(false);

	//reset on every render
	hasBeenCancelled.current = false;
	hasBeenCommitted.current = false;

	const groupClassName = cx({
		'input-group': true,
		'input': true,
		'busy': isBusy
	}, inputGroupClassName);

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
		setHasCancelledSuggestions(false);
		onChange(ev.currentTarget.value);
	}, [onChange]);

	const handleBlur = useCallback(ev => {
		if(ev.relatedTarget && ev.relatedTarget.dataset.suggestion) {
			return;
		}
		if (hasBeenCancelled.current || hasBeenCommitted.current) {
			return;
		}
		const shouldCancel = onBlur(event);
		if(shouldCancel) {
			onCancel(value !== initialValue, ev);
			if(input.current) {
				input.current.blur();
			}
		} else {
			onCommit(value, value !== initialValue, ev);
		}
	}, [initialValue, onBlur, onCancel, onCommit, value]);

	const handleFocus = useCallback(ev => {
		if(selectOnFocus) {
			ev.currentTarget.select();
		}
		onFocus(ev);
	}, [onFocus, selectOnFocus]);

	const handleKeyDown = useCallback(ev => {
		switch (event.key) {
			case 'Escape':
				if(suggestions && suggestions.length && !hasCancelledSuggestions) {
					setHasCancelledSuggestions(true);
					ev.stopPropagation();
				} else {
					onCancel(ev, value !== initialValue);
					input.current.blur();
				}
			break;
			case 'Enter':
				if(suggestions && suggestions.length && !hasCancelledSuggestions) {
					const newValue = suggestionsElement.current.getSuggestion() || value;
					setValue(newValue);
					onCommit(newValue, newValue !== initialValue, ev);
				} else {
					onCommit(value, value !== initialValue, ev);
				}
			break;
			case 'ArrowDown':
			case 'ArrowUp':
				if(suggestions && suggestions.length && !hasCancelledSuggestions) {
					// stop cursor from jumping to the begining/end of the input when showing suggestions
					ev.preventDefault();
				}
			break;
		}
		onKeyDown(ev);
	}, [hasCancelledSuggestions, initialValue, onCancel, onCommit, onKeyDown, suggestions, value])

	const handleSuggestionSelect = useCallback((suggestedValue, ev) => {
		setValue(suggestedValue);
		onCommit(suggestedValue, suggestedValue !== initialValue, ev);
	}, [initialValue, onCommit]);

	useEffect(() => {
		if(initialValue !== prevInitialValue) {
			setValue(initialValue);
		}
	}, [initialValue, prevInitialValue]);

	useEffect(() => {
		if(validationError !== prevValidationError && input.current.setCustomValidity) {
			input.current.setCustomValidity(validationError ? validationError : '');
		}
	}, [validationError, prevValidationError]);

	const inputProps = {
		className,
		disabled: isDisabled,
		onBlur: handleBlur,
		onChange: handleChange,
		onFocus: handleFocus,
		onKeyDown: handleKeyDown,
		readOnly: isReadOnly,
		ref: input,
		required: isRequired,
		value,
		...pick(rest, NATIVE_INPUT_PROPS),
		...pick(rest, key => key.match(/^(aria-|data-|on[A-Z]).*/))
	};

	var inputComponent = suggestions ? (
		<Suggestions
			onSelect={ handleSuggestionSelect }
			ref={ suggestionsElement }
			inputProps={ inputProps }
			suggestions={ hasCancelledSuggestions ? [] : suggestions }
		/>
	) : (
		<input { ...inputProps } />
	);

	if(resize) {
		inputComponent = (
			<AutoResizer
				content={ value }
				vertical={ resize === 'vertical' }
			>
				{ inputComponent }
			</AutoResizer>
		);
	}

	return (
		<div className={ groupClassName }>
			{ inputComponent }
			{ isBusy ? <Spinner /> : null }
		</div>
	);
}));

Input.displayName = 'Input';

Input.propTypes = {
	className: PropTypes.string,
	inputGroupClassName: PropTypes.string,
	isBusy: PropTypes.bool,
	isDisabled: PropTypes.bool,
	isReadOnly: PropTypes.bool,
	isRequired: PropTypes.bool,
	onBlur: PropTypes.func,
	onCancel: PropTypes.func,
	onChange: PropTypes.func,
	onCommit: PropTypes.func,
	onFocus: PropTypes.func,
	onKeyDown: PropTypes.func,
	resize: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
	selectOnFocus: PropTypes.bool,
	suggestions: PropTypes.array,
	validationError: PropTypes.string,
	value: PropTypes.string,
};

export default Input;
