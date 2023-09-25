import cx from 'classnames';
import PropTypes from 'prop-types';
import { forwardRef, memo, useCallback, useContext, useEffect, useId, useImperativeHandle, useLayoutEffect, useRef, useState, } from 'react';
import { usePrevious } from 'web-common/hooks';
import { mod, noop, omit, pick } from 'web-common/utils';
import { Spinner } from 'web-common/components';
import { createPortal } from 'react-dom';

import AutoResizer from './auto-resizer';
import { PortalContext } from '../portal';
import { useFloating, shift, flip, size } from '@floating-ui/react-dom';

const NATIVE_INPUT_PROPS = ['autoFocus', 'form', 'id', 'inputMode', 'max', 'maxLength',
'min', 'minLength', 'name', 'placeholder', 'required', 'type', 'spellCheck', 'step', 'tabIndex'];

const AutoResizerInput = memo(forwardRef((props, ref) => props.resize ? (
	<AutoResizer
		content={props.value}
		vertical={props.resize === 'vertical'}
	>
		<input ref={ ref } {...omit(props, 'resize')} />
	</AutoResizer>
	) : (
		<input ref={ ref } {...omit(props, 'resize')} />
	)
));

AutoResizerInput.propTypes = {
	resize: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
	value: PropTypes.string
};

const Suggestions = memo(props => {
	const { highlighted, id, onMousedown, refs, show, strategy, suggestions, suggestionsRef, x, y } = props;
	return (
		<div
			aria-label='Suggestions'
			role="listbox"
			id={`${id}-suggestions`}
			style={{ position: strategy, transform: `translate3d(${x}px, ${y}px, 0px)` }}
			ref={r => { refs.setFloating(r); suggestionsRef.current = r; }}
			className={cx("suggestions", {
				'show': show,
			})}>
			{suggestions.map((s, index) =>
				<div
					aria-label={s}
					role="listitem"
					className={cx("suggestion", {
						'active': index === highlighted,
					})}
					data-suggestion={s}
					key={s}
					onMouseDown={onMousedown}
				>
					{s}
				</div>
			)}
		</div>
	);
});

Suggestions.displayName = 'Suggestions';
Suggestions.propTypes = {
	highlighted: PropTypes.number.isRequired,
	id: PropTypes.string.isRequired,
	onMousedown: PropTypes.func.isRequired,
	refs: PropTypes.object.isRequired,
	show: PropTypes.bool.isRequired,
	strategy: PropTypes.string.isRequired,
	suggestions: PropTypes.arrayOf(PropTypes.string).isRequired,
	suggestionsRef: PropTypes.object.isRequired,
	x: PropTypes.number.isRequired,
	y: PropTypes.number.isRequired,
};

const Input = memo(forwardRef((props, ref) => {
	const { className = 'form-control', inputGroupClassName, isBusy, isDisabled, isReadOnly, isRequired, onBlur = noop,
		onCancel = noop, onCommit = noop, onChange = noop, onFocus = noop, onKeyDown = noop, selectOnFocus, suggestions,
		validationError, value: initialValue, resize, ...rest } = props;
	const [hasCancelledSuggestions, setHasCancelledSuggestions] = useState(false);
	const [value, setValue] = useState(initialValue);
	const [highlighted, setHighlighted] = useState(0);
	const inputRef = useRef(null);
	const suggestionsRef = useRef(null);
	const prevInitialValue = usePrevious(initialValue);
	const prevValidationError = usePrevious(validationError);
	const id = useId();
	const hasBeenCancelled = useRef(false);
	const hasBeenCommitted = useRef(false);
	const show = !!(suggestions && suggestions.length && !hasCancelledSuggestions);
	const prevShow = usePrevious(show);
	const prevSuggestions = usePrevious(suggestions);
	const { ref: portalRef } = useContext(PortalContext);

	const { x, y, refs, strategy, update } = useFloating({
		placement: 'bottom', middleware: [shift(), flip(), size({
			apply({ rects }) {
				Object.assign(refs.floating.current.style, {
					width: `${rects.reference.width}px`,
				});
			}})]
	});

	//reset on every render
	hasBeenCancelled.current = false;
	hasBeenCommitted.current = false;

	const groupClassName = cx({
		'input-group': true,
		'input': true,
		'busy': isBusy,
		'dropdown': suggestions,
		'show': show,
	}, inputGroupClassName);

	useImperativeHandle(ref, () => ({
		focus: () => {
			inputRef.current.focus();
			if(selectOnFocus) {
				inputRef.current.select();
			}
		}
	}));

	const handleChange = useCallback(ev => {
		setValue(ev.currentTarget.value);
		setHasCancelledSuggestions(false);
		onChange(ev.currentTarget.value);
	}, [onChange]);

	const handleBlur = useCallback(ev => {
		if (ev.relatedTarget && (ev.relatedTarget?.dataset?.suggestion)) {
			return;
		}
		if (hasBeenCancelled.current || hasBeenCommitted.current) {
			return;
		}

		const shouldCancel = onBlur(ev);

		if(shouldCancel) {
			onCancel(value !== initialValue, ev);
			hasBeenCancelled.current = true;
			if (inputRef.current) {
				inputRef.current.blur();
			}
		} else {
			onCommit(value, value !== initialValue, ev, inputRef.current);
		}
	}, [initialValue, onBlur, onCancel, onCommit, value]);

	const handleFocus = useCallback(ev => {
		if(selectOnFocus) {
			ev.currentTarget.select();
		}
		onFocus(ev);
	}, [onFocus, selectOnFocus]);

	const handleKeyDown = useCallback(ev => {
		switch (ev.key) {
			case 'Escape':
				if(suggestions && suggestions.length && !hasCancelledSuggestions) {
					setHasCancelledSuggestions(true);
					ev.stopPropagation();
				} else {
					onCancel(value !== initialValue, ev);
					hasBeenCancelled.current = true;
					inputRef.current.blur();
				}
			break;
			case 'Enter':
				if(suggestions && suggestions.length && !hasCancelledSuggestions) {
					const newValue = suggestions[highlighted] || value;
					setValue(newValue);
					onCommit(newValue, newValue !== initialValue, ev, inputRef.current);
				} else {
					hasBeenCommitted.current = true;
					onCommit(value, value !== initialValue, ev, inputRef.current);
				}
			break;
			case 'ArrowDown':
				if (suggestions && suggestions.length && !hasCancelledSuggestions) {
					setHighlighted(highlighted => mod(highlighted + 1, suggestions.length ));
					ev.preventDefault();
				}
			break;
			case 'ArrowUp':
				if(suggestions && suggestions.length && !hasCancelledSuggestions) {
					setHighlighted(highlighted => mod(highlighted - 1, suggestions.length))
					ev.preventDefault();
				}
			break;
		}
		onKeyDown(ev);
	}, [hasCancelledSuggestions, highlighted, initialValue, onCancel, onCommit, onKeyDown, suggestions, value])

	const handleSuggestionMouseDown = useCallback(ev => {
		const newValue = ev.currentTarget.dataset.suggestion;
		setValue(newValue);
		onCommit(newValue, newValue !== initialValue, ev, inputRef.current);
		ev.preventDefault();
	}, [initialValue, onCommit]);

	useEffect(() => {
		if(initialValue !== prevInitialValue) {
			setValue(initialValue);
		}
	}, [initialValue, prevInitialValue]);

	useEffect(() => {
		if (validationError !== prevValidationError && inputRef.current.setCustomValidity) {
			inputRef.current.setCustomValidity(validationError ? validationError : '');
		}
	}, [validationError, prevValidationError]);

	useLayoutEffect(() => {
		if (show && prevSuggestions?.length && suggestions.length !== prevSuggestions?.length) {
			update();
		}
	}, [show, prevSuggestions, update, suggestions]);

	useLayoutEffect(() => {
		if (show && !prevShow) {
			update();
		}
	}, [show, prevShow, update]);

	const suggestionsEl = suggestions ? <Suggestions {...{ x, y, strategy, suggestions, highlighted, onMousedown: handleSuggestionMouseDown, id, refs, show, suggestionsRef }} /> : null;

	return (
		<div className={ groupClassName }>
			<AutoResizerInput
				className={ className }
				disabled={ isDisabled }
				onBlur={ handleBlur }
				onChange={ handleChange }
				onFocus={ handleFocus }
				onKeyDown={ handleKeyDown }
				readOnly={ isReadOnly }
				resize={ resize }
				ref={(r) => { refs.setReference(r); inputRef.current = r; }}
				required={ isRequired }
				value={ value }
				{ ...pick(rest, NATIVE_INPUT_PROPS) }
				{ ...pick(rest, key => key.match(/^(aria-|data-|on[A-Z]).*/)) }
				aria-autocomplete={suggestions ? 'list' : null}
				aria-controls={ `${id}-suggestions}` }
			/>
			{suggestions && (portalRef?.current ? createPortal(suggestionsEl, portalRef.current) : suggestionsEl) }
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
