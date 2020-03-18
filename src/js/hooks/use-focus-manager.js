import { useEffect, useCallback, useRef, useState } from 'react';

const isModifierKey = ev => ev.getModifierState("Meta") || ev.getModifierState("Alt") ||
		ev.getModifierState("Control") || ev.getModifierState("OS");


const useFocusManager = (ref, { overrideFocusRef = null, initialFocusPickerRef = {}, isCarousel = true, isDrillDownCarousel = false } = {}) => {
	const [isFocused, setIsFocused] = useState(false);
	const lastFocused = useRef(null);
	const originalTabIndex = useRef(null);

	const handleNext = useCallback((ev, { useCurrentTarget = true, targetEnd = null, offset = 1 } = {}) => {
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
	});

	const handlePrevious = useCallback((ev, { useCurrentTarget = true, targetEnd = null, offset = 1 } = {}) => {
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
			lastFocused.current = tabbables[0];
		} else {
			tabbables[0].focus();
			lastFocused.current = tabbables[0];
		}
	});

	const handleDrillDownNext = useCallback((ev, offset = 1) => {
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
	});

	const handleDrillDownPrev = useCallback((ev, offset = 1) => {
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
	});

	const handleBySelector = useCallback(selector => {
		const nextEl = ref.current.querySelector(selector);

		if(nextEl) {
			lastFocused.current = nextEl;
			nextEl.focus();
		}
	});

	const focusOnLast  = useCallback(() => {
		if(lastFocused.current) {
			lastFocused.current.focus();
		}
	});

	const resetLastFocused = useCallback(() => {
		lastFocused.current = null;
	})

	const handleFocus = useCallback((ev, isBounced = false) => {
		if(isFocused) {
			return false;
		}

		if(ref.current === null && !isBounced) {
			setTimeout(() => handleFocus(ev, true));
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

		setIsFocused(true);
		ref.current.tabIndex = -1;


		if(initialFocusPickerRef.current) {
			const selectedCandidate = initialFocusPickerRef.current(ev);
			if(selectedCandidate) {
				selectedCandidate.focus();
				return true;
			}
		}

		const candidates = Array.from(ref.current.querySelectorAll('[tabIndex="-2"]:not([disabled])'));
		if(lastFocused.current !== null && candidates.includes(lastFocused.current)) {
			lastFocused.current.focus();
		} else if(ev.target !== ev.currentTarget && candidates.includes(ev.target)) {
			// keep the focus on the candidate pressed
			return false;
		} else if(ev.target === ev.currentTarget && candidates.length > 0) {
			candidates[0].focus();
			return true;
		}
	});

	const handleBlur = useCallback(ev => {
		if(ev.relatedTarget &&
			(ev.relatedTarget === ref.current || (
			!ev.relatedTarget.dataFocusRoot && ev.relatedTarget.closest('[data-focus-root]') === ref.current))
		) {
			return false;
		}
		setIsFocused(false);
		ev.currentTarget.tabIndex = originalTabIndex.current;
		return true;
	});

	const registerAutoFocus = useCallback(ref => {
		if(ref === null) {
			return;
		}

		if(ref instanceof Element) {
			lastFocused.current = ref;
		}
	});

	useEffect(() => {
		if(overrideFocusRef !== null) {
			lastFocused.current = overrideFocusRef.current;
			if(lastFocused.current) {
				lastFocused.current.focus();
			}
		}
	}, [overrideFocusRef && overrideFocusRef.current])

	//@TODO: migrate to new function names

	const focusNext = handleNext;
	const focusPrev = handlePrevious;
	const focusDrillDownNext = handleDrillDownNext;
	const focusDrillDownPrev = handleDrillDownPrev;
	const focusBySelector = handleBySelector;
	const receiveFocus = handleFocus;
	const receiveBlur = handleBlur;

	return { focusNext, focusPrev, focusDrillDownNext, focusDrillDownPrev, focusBySelector,
		handleNext, handlePrevious, handleDrillDownNext, handleDrillDownPrev, handleFocus, handleBlur,
		handleBySelector, focusOnLast, receiveFocus, receiveBlur, registerAutoFocus, resetLastFocused };
};

export { useFocusManager };
