import { useCallback, useMemo, useRef } from 'react';

const isModifierKey = ev => ev.getModifierState("Meta") || ev.getModifierState("Alt") ||
		ev.getModifierState("Control") || ev.getModifierState("OS");


const useFocusManager = (ref, initialQuerySelector = null, isCarousel = true, isDrillDownCarousel = false) => {
	const isFocused = useRef(false);
	const lastFocused = useRef(null);
	const originalTabIndex = useRef(null);

	const focusNext = useCallback((ev, { useCurrentTarget = true, targetEnd = null, offset = 1 } = {}) => {
		const tabbables = Array.from(
			ref.current.querySelectorAll('[tabIndex="-2"]:not([disabled]):not(.offscreen)')
		).filter(t => t.offsetParent);
		if(tabbables.length === 0) {
			return;
		}
		const target = useCurrentTarget ? ev.currentTarget : ev.target;
		const nextIndex = tabbables.findIndex(t => t === target) + offset;

		if(isModifierKey(ev)) {
			// ignore key navigation with modifier keys. See #252
			return;
		}
		ev.preventDefault();
		if(nextIndex < tabbables.length) {
			tabbables[nextIndex].focus();
			lastFocused.current = tabbables[nextIndex];
		} else if (targetEnd !== null) {
			targetEnd.focus();
			lastFocused.current = null;
		} else if(isCarousel) {
			tabbables[0].focus();
			lastFocused.current = tabbables[0];
		} else {
			tabbables[tabbables.length - 1].focus();
			lastFocused.current = tabbables[tabbables.length - 1];
		}
		return lastFocused.current;
	}, [ref, isCarousel]);

	const focusPrev = useCallback((ev, { useCurrentTarget = true, targetEnd = null, offset = 1 } = {}) => {
		const tabbables = Array.from(
			ref.current.querySelectorAll('[tabIndex="-2"]:not([disabled]):not(.offscreen)')
		).filter(t => t.offsetParent);
		if(tabbables.length === 0) {
			return;
		}
		const target = useCurrentTarget ? ev.currentTarget : ev.target;
		const prevIndex = tabbables.findIndex(t => t === target) - offset;
		if(isModifierKey(ev)) {
			// ignore key navigation with modifier keys. See #252
			return;
		}
		ev.preventDefault();
		if(prevIndex >= 0) {
			tabbables[prevIndex].focus();
			lastFocused.current = tabbables[prevIndex];
		} else if (targetEnd !== null) {
			targetEnd.focus();
			lastFocused.current = null;
		} else if(isCarousel) {
			tabbables[tabbables.length - 1].focus();
			lastFocused.current = tabbables[tabbables.length - 1];
		} else {
			tabbables[0].focus();
			lastFocused.current = tabbables[0];
		}
		return lastFocused.current;
	}, [ref, isCarousel]);

	const focusDrillDownNext = useCallback((ev, offset = 1) => {
		const drillables = Array.from(
			ev.currentTarget.querySelectorAll('[tabIndex="-3"]:not([disabled])')
		).filter(t => t.offsetParent);
		if(drillables.length === 0 ) {
			return;
		}
		const nextIndex = drillables.findIndex(t => t === ev.target) + offset;
		if(nextIndex < drillables.length) {
			drillables[nextIndex].focus();
		} else {
			if(isDrillDownCarousel) {
				drillables[0].focus();
			} else {
				drillables[drillables.length - 1].focus();
			}
		}
	}, [isDrillDownCarousel]);

	const focusDrillDownPrev = useCallback((ev, offset = 1) => {
		const drillables = Array.from(
			ev.currentTarget.querySelectorAll('[tabIndex="-3"]:not([disabled])')
		).filter(t => t.offsetParent);
		if(drillables.length === 0 ) {
			return;
		}
		const prevIndex = drillables.findIndex(t => t === ev.target) - offset;
		if(prevIndex >= 0) {
			drillables[prevIndex].focus();
		} else {
			if(isDrillDownCarousel) {
				drillables[drillables.length - 1].focus();
			} else {
				ev.currentTarget.focus();
			}
		}
	}, [isDrillDownCarousel]);

	const focusBySelector = useCallback(selectorOrEl => {
		const nextEl = typeof(selectorOrEl) === 'string' ?
			ref.current.querySelector(selectorOrEl) :
			selectorOrEl;

		if(nextEl) {
			lastFocused.current = nextEl;
			nextEl.focus();
		}
	}, [ref]);

	const focusOnLast  = useCallback(() => {
		if(lastFocused.current) {
			lastFocused.current.focus();
		}
	}, []);

	const resetLastFocused = useCallback(() => {
		lastFocused.current = null;
	}, []);

	const receiveFocus = useCallback((ev, isBounced = false) => {
		ev.stopPropagation();

		if(isFocused.current) {
			return false;
		}


		if(ref.current === null && !isBounced) {
			ev.persist();
			setTimeout(() => receiveFocus(ev, true));
			return;
		}

		if(ref.current === null && isBounced) {
			return;
		}

		if(!ref.current.dataset.focusRoot) {
			// we have not yet focused on this item yet, store original tabIndex and mark as focus root
			ref.current.dataset.focusRoot = '';
			originalTabIndex.current = originalTabIndex.current === null ? ref.current.tabIndex : originalTabIndex.current;
		}

		isFocused.current = true;
		ref.current.tabIndex = -1;

		if(lastFocused.current === null && initialQuerySelector !== null) {
			if(typeof(initialQuerySelector) === 'object' && initialQuerySelector.current && 'focus' in initialQuerySelector.current) {
				// pased as a ref
				lastFocused.current = initialQuerySelector.current;
			} else if(typeof(initialQuerySelector) === 'string') {
				//passed as a string
				const candidate = ref.current.querySelector(initialQuerySelector);
				if(candidate) {
					lastFocused.current = ref.current.querySelector(initialQuerySelector);
				}
			}

			if(lastFocused.current) {
				lastFocused.current.focus();
				return true;
			}
		}

		const candidates = Array.from(ref.current.querySelectorAll('[tabIndex="-2"]:not([disabled])'));
		if(lastFocused.current !== null && candidates.includes(lastFocused.current)) {
			lastFocused.current.focus();
			return true;
		} else if(ev.target !== ev.currentTarget && candidates.includes(ev.target)) {
			// keep the focus on the candidate pressed
			return true;
		} else if(ev.target === ev.currentTarget && candidates.length > 0) {
			candidates[0].focus();
			return true;
		}
	}, [ref, initialQuerySelector]);

	const receiveBlur = useCallback(ev => {
		if(ev.relatedTarget &&
			(ev.relatedTarget === ref.current || (
			!ev.relatedTarget.dataFocusRoot && ev.relatedTarget.closest('[data-focus-root]') === ref.current))
		) {
			return false;
		}
		isFocused.current = false;
		ev.currentTarget.tabIndex = originalTabIndex.current;
		return true;
	}, [ref]);

	const registerAutoFocus = useCallback(ref => {
		if(ref === null) {
			return;
		}

		if(ref instanceof Element) {
			lastFocused.current = ref;
		}
	}, []);

	const focusManagerFunctions = useMemo(() => (
		{ receiveFocus, receiveBlur, focusNext, focusPrev, focusBySelector, focusDrillDownNext, focusDrillDownPrev, resetLastFocused, registerAutoFocus, focusOnLast }),
		[receiveFocus, receiveBlur, focusNext, focusPrev, focusBySelector, focusDrillDownNext, focusDrillDownPrev, resetLastFocused, registerAutoFocus, focusOnLast]
	);

	return focusManagerFunctions;
};

export { useFocusManager };
