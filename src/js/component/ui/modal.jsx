import cx from 'classnames';
import PropTypes from 'prop-types';
import React, { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useRef } from 'react';
import ReactModal from 'react-modal';
import { useSelector } from 'react-redux';
import { usePrevious } from 'web-common/hooks';
import { getScrollbarWidth, pick } from 'web-common/utils';
import { Spinner } from 'web-common/components';

var initialPadding;

const Modal = forwardRef((props, ref) => {
	const { children, className, isBusy, isOpen, onAfterOpen, overlayClassName, ...rest } = props;
	const isTouchOrSmall = useSelector(state => state.device.isTouchOrSmall);
	const containterClassName = useSelector(state => state.config.containterClassName);
	const wasOpen = usePrevious(isOpen);
	const contentRef = useRef(null);

	if(typeof initialPadding === 'undefined') {
		initialPadding = parseFloat(document.body.style.paddingRight);
		initialPadding = Number.isNaN(initialPadding) ? 0 : initialPadding;
	}

	useImperativeHandle(ref, () => ({
		focus: () => {
			if(contentRef.current) {
				contentRef.current.focus();
			}
		}
	}));

	const handleModalAfterOpen = useCallback(ev => {
		if(onAfterOpen) {
			onAfterOpen(ev);
		}
	}, [onAfterOpen]);

	const setContentRef = useCallback(newRef => {
		contentRef.current = newRef;
	}, []);

	useEffect(() => { // correct for scrollbars
		if(typeof(wasOpen) === 'undefined') {
			return;
		}
		if(wasOpen !== isOpen && isOpen) {
			const calculatedPadding = initialPadding + getScrollbarWidth();
			document.body.style.paddingRight = `${calculatedPadding}px`;
		} else if(wasOpen !== isOpen && !isOpen) {
			document.body.style.paddingRight = `${initialPadding}px`;
		}
	}, [isOpen, wasOpen]);

	return (
		<ReactModal
			role="dialog"
			onAfterOpen={ handleModalAfterOpen }
			contentRef= { setContentRef }
			appElement= { document.querySelector('.library-container') }
			parentSelector={ () => document.querySelector(`.${containterClassName}`) }
			className= { cx('modal modal-content', className) }
			overlayClassName={ cx({ 'loading': isBusy }, 'modal-backdrop', overlayClassName) }
			isOpen={ isOpen }
			closeTimeoutMS={ isTouchOrSmall ? 200 : null }
			{ ...pick(rest, ['contentLabel', 'onRequestClose', 'shouldFocusAfterRender', 'shouldCloseOnOverlayClick', 'shouldCloseOnEsc', 'shouldReturnFocusAfterClose']) }
		>
			{ isBusy ? <Spinner className="large" /> : children }
		</ReactModal>
	);
});

Modal.propTypes = {
	children: PropTypes.oneOfType([PropTypes.element, PropTypes.array]),
	className: PropTypes.string,
	isBusy: PropTypes.bool,
	isOpen: PropTypes.bool,
	onAfterOpen: PropTypes.func,
	overlayClassName: PropTypes.string,
};

Modal.displayName = 'Modal';

export default memo(Modal);
