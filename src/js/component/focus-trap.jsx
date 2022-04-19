import PropTypes from 'prop-types';
import React, { useCallback, memo } from 'react';

const focusables = 'button:not([disabled]),[href]:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"]):not([disabled])';

const FocusTrap = ({ children }) => {
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

	return (
		<React.Fragment>
			<div tabIndex={ 0 } data-focus-trap-before onFocus={ handleFocus } style={ { position: 'absolute', opacity: 0 } } />
			{ children }
			<div tabIndex={ 0 } data-focus-trap-after onFocus={ handleFocus } style={ { position: 'absolute', opacity: 0 } } />
		</React.Fragment>
	);
}

FocusTrap.propTypes = {
	targetRef: PropTypes.object,
	children: PropTypes.oneOfType([PropTypes.element, PropTypes.array]),
}

export default memo(FocusTrap);
