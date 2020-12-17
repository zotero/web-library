import cx from 'classnames';
import PropTypes from 'prop-types';
import React, { memo, useCallback, useEffect, useRef } from 'react';
import ReactModal from 'react-modal';
import { useSelector } from 'react-redux';

import Spinner from '../ui/spinner';
import { getScrollbarWidth } from '../../utils';
import { pick } from '../../common/immutable'
import { usePrevious } from '../../hooks';

var initialPadding;

const Modal = props => {
	const { children, className, isBusy, isOpen, onAfterOpen, overlayClassName, ...rest } = props;
	const isTouchOrSmall = useSelector(state => state.device.isTouchOrSmall);
	const wasOpen = usePrevious(isOpen);
	const contentRef = useRef(null);

	if(typeof initialPadding === 'undefined') {
		initialPadding = parseFloat(document.body.style.paddingRight);
		initialPadding = Number.isNaN(initialPadding) ? 0 : initialPadding;
	}

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
			className= { cx('modal modal-content', className) }
			overlayClassName={ cx({ 'loading': isBusy }, 'modal-backdrop', overlayClassName) }
			isOpen={ isOpen }
			closeTimeoutMS={ isTouchOrSmall ? 200 : null }
			{ ...pick(rest, ['contentLabel', 'onRequestClose', 'shouldFocusAfterRender', 'shouldCloseOnOverlayClick', 'shouldCloseOnEsc', 'shouldReturnFocusAfterClose']) }
		>
			{ isBusy ? <Spinner className="large" /> : children }
		</ReactModal>
	);
}

Modal.propTypes = {
	children: PropTypes.oneOfType([PropTypes.element, PropTypes.array]),
	className: PropTypes.string,
	isBusy: PropTypes.bool,
	isOpen: PropTypes.bool,
	onAfterOpen: PropTypes.func,
	overlayClassName: PropTypes.string,
};

export default memo(Modal);
