import PropTypes from 'prop-types';
import { Fragment, useCallback, memo } from 'react';

const focusables = 'button:not([disabled]),[href]:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"]):not([disabled])';

const FocusTrap = ({ children, disabled = false }) => {
	const handleFocus = useCallback((ev) => {
		const siblingsExclude = [...ev.currentTarget.parentElement.querySelectorAll('[data-focus-trap-after] ~ *')];
		const siblingsInclude = [...ev.currentTarget.parentElement.querySelectorAll('[data-focus-trap-before] ~ *:not([data-focus-trap-after])')];
		const siblings = siblingsInclude.filter(candidate => !siblingsExclude.includes(candidate));
		const candidates = [];

		siblings.forEach(s => {
			if(s.matches(focusables)) {
				candidates.push(s);
			}
			candidates.push(...s.querySelectorAll(focusables));
		});

		if(!candidates.length) {
			if (process.env.NODE_ENV === 'development') {
				console.error("<FocusTrap> used with no focusable elements inside the trap.");
			}
			return;
		}

		candidates[(ev.currentTarget.dataset.focusTrapBefore ? (candidates.length - 1) : 0)]
			.focus({ preventScroll: true });

	}, []);

	// Prevent react-modal's scopeTab from intercepting Tab key events when the focused element
	// has a negative tabIndex. On Safari, react-modal manually manages Tab navigation but its
	// tabbable list only includes elements with tabIndex >= 0. When the focused element has
	// tabIndex=-2 (used by useFocusManager), scopeTab can't find it in the list and jumps to
	// the wrong target. By stopping propagation only for negative-tabIndex elements, we let the
	// browser handle Tab natively while preserving react-modal's wrap-around for normal elements.
	const handleKeyDown = useCallback((ev) => {
		if(ev.key === 'Tab' && document.activeElement?.tabIndex < 0) {
			ev.stopPropagation();
		}
	}, []);

	return (
		<Fragment>
			{ !disabled && <div tabIndex={ 0 } data-focus-trap-before onFocus={ handleFocus } style={ { position: 'absolute', opacity: 0 } } /> }
			{ disabled ? children : <div onKeyDown={ handleKeyDown } style={ { display: 'contents' } }>{ children }</div> }
			{ !disabled && <div tabIndex={ 0 } data-focus-trap-after onFocus={ handleFocus } style={ { position: 'absolute', opacity: 0 } } /> }
		</Fragment>
	);
}

FocusTrap.propTypes = {
	children: PropTypes.oneOfType([PropTypes.element, PropTypes.array]),
	disabled: PropTypes.bool,
	targetRef: PropTypes.object,
}

export default memo(FocusTrap);
