import { useEffect, useCallback, useRef, useState } from 'react';

const isModifierKey = ev => ev.getModifierState("Meta") || ev.getModifierState("Alt") ||
		ev.getModifierState("Control") || ev.getModifierState("OS");


//@TODO: rename functions from handleABC to focusABC, e.g. handleNext should be FocusNext,

const useFocusManager = (ref, { overrideFocusRef = null, initialFocusPicker = null, isCarousel = true } = {}) => {
	const [isFocused, setIsFocused] = useState(false);
	const lastFocused = useRef(null);
	const originalTabIndex = useRef(null);
	const initialFocusPickerRef = useRef(initialFocusPicker);

	const handleNext = useCallback((ev, { useCurrentTarget = true, targetEnd = null, offset = 1 } = {}) => {
		const tabbables = Array.from(
			ref.current.querySelectorAll('[tabIndex="-2"]:not([disabled]):not(.offscreen)')
		).filter(t => t.offsetParent);
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
		}
	});

	const handlePrevious = useCallback((ev, { useCurrentTarget = true, targetEnd = null, offset = 1 } = {}) => {
		const tabbables = Array.from(
			ref.current.querySelectorAll('[tabIndex="-2"]:not([disabled]):not(.offscreen)')
		).filter(t => t.offsetParent);
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
		}
	});

	const handleDrillDownNext = useCallback((ev, offset = 1) => {
		const drillables = Array.from(
			ev.currentTarget.querySelectorAll('[tabIndex="-3"]:not([disabled])')
		).filter(t => t.offsetParent);
		const nextIndex = drillables.findIndex(t => t === ev.target) + offset;
		if(nextIndex < drillables.length) {
			drillables[nextIndex].focus();
		} else {
			drillables[drillables.length - 1].focus();
		}
	});

	const handleDrillDownPrev = useCallback((ev, offset = 1) => {
		const drillables = Array.from(
			ev.currentTarget.querySelectorAll('[tabIndex="-3"]:not([disabled])')
		).filter(t => t.offsetParent);
		const prevIndex = drillables.findIndex(t => t === ev.target) - offset;
		if(prevIndex >= 0) {
			drillables[prevIndex].focus();
		} else {
			drillables[0].focus();
		}
	});

	const handleBySelector = useCallback((ev, selector) => {
		const nextEl = ev.currentTarget.querySelector(selector);
		if(nextEl) {
			nextEl.focus();
			lastFocused.current = nextEl;
		}
	});

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
		if(ref && ref.current) {
			originalTabIndex.current = originalTabIndex.current === null ? ref.current.tabIndex : originalTabIndex.current;
			ref.current.dataset.focusRoot = '';
		}
	}, [ref && ref.current]);

	useEffect(() => {
		if(overrideFocusRef !== null) {
			lastFocused.current = overrideFocusRef.current;
			if(lastFocused.current) {
				lastFocused.current.focus();
			}
		}
	}, [overrideFocusRef && overrideFocusRef.current])

	return { handleNext, handlePrevious, handleDrillDownNext, handleDrillDownPrev, handleFocus,
		handleBlur, handleBySelector, registerAutoFocus };
};

export { useFocusManager };
