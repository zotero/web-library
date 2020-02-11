import { useEffect, useCallback, useRef, useState } from 'react';

const isModifierKey = ev => ev.getModifierState("Meta") || ev.getModifierState("Alt") ||
		ev.getModifierState("Control") || ev.getModifierState("OS");


const useFocusManager = (ref, { overrideFocusRef = null, isCarousel = true } = {}) => {
	const [isFocused, setIsFocused] = useState(false);
	const lastFocused = useRef(null);
	const originalTabIndex = useRef(null);

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

	const handleFocus = useCallback(ev => {
		if(isFocused) {
			return;
		}


		if(ref.current === null) {
			setTimeout(handleFocus);
			return;
		}

		setIsFocused(true);
		ref.current.tabIndex = -1;

		const candidates = Array.from(ref.current.querySelectorAll('[tabIndex="-2"]:not([disabled])'));
		if(lastFocused.current !== null && candidates.includes(lastFocused.current)) {
			lastFocused.current.focus();
		} else if(ev.target !== ev.currentTarget && candidates.includes(ev.target)) {
			// keep the focus on the candidate pressed
			return;
		} else if(ev.target === ev.currentTarget && candidates.length > 0) {
			candidates[0].focus();
		}
	})

	const handleBlur = useCallback(ev => {
		if(ev.relatedTarget &&
			(ev.relatedTarget === ref.current || (
			!ev.relatedTarget.dataFocusRoot && ev.relatedTarget.closest('[data-focus-root]') === ref.current))
		) {
			return;
		}
		setIsFocused(false);
		ev.currentTarget.tabIndex = originalTabIndex.current;
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

	return { handleNext, handlePrevious, handleDrillDownNext, handleDrillDownPrev, handleFocus, handleBlur, registerAutoFocus };
};

export { useFocusManager };
