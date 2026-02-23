let _restoreElement = null;

export const setModalFocusRestore = (element) => {
	_restoreElement = element;
};

export const executeModalFocusRestore = () => {
	const el = _restoreElement;
	if (!el) {
		return;
	}
	_restoreElement = null;
	// Defer to run after react-modal's own focus restoration
	setTimeout(() => {
		// Ensure the target is visible before focusing on it. This fixes elements
		// that are only visible on hover/focus-within (e.g., the collection tree
		// "More" dropdown toggle)
		el.style.setProperty('visibility', 'visible');
		el.focus();
		el.style.removeProperty('visibility');
	}, 0);
};
