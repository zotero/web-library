export const focusOnModalOpen = (contentEl, isTouchOrSmall, focusCb, fallbackMs = 750) => {
	if (isTouchOrSmall) {
		let settled = false;

		const handleTransitionEnd = (ev) => {
			if (ev.propertyName !== 'transform') {
				return;
			}
			if (settled) {
				return;
			}
			settled = true;
			clearTimeout(fallbackTimeout);
			contentEl.removeEventListener('transitionend', handleTransitionEnd);
			focusCb();
		};

		const fallbackTimeout = setTimeout(() => {
			if (settled) {
				return;
			}
			settled = true;
			contentEl.removeEventListener('transitionend', handleTransitionEnd);
			focusCb();
		}, fallbackMs);

		contentEl.addEventListener('transitionend', handleTransitionEnd);
	} else {
		requestAnimationFrame(focusCb);
	}
};
