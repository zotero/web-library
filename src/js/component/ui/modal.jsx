'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const ReactModal = require('react-modal');
const cx = require('classnames');
var initialPadding;

class Modal extends React.PureComponent {
	componentDidUpdate({ isOpen: wasOpen }) {
		const { isOpen } = this.props;
		if(wasOpen != isOpen && isOpen === true) {
			this.setScrollbar();
		}
		if(wasOpen != isOpen && isOpen === false) {
			this.resetScrollbar();
		}
	}

	checkScrollbar() {
		const rect = document.body.getBoundingClientRect();
		return rect.left + rect.right < window.innerWidth;
	}

	getScrollbarWidth() {
		const scrollDiv = document.createElement('div');
		scrollDiv.className = 'modal-scrollbar-measure';
		document.body.appendChild(scrollDiv);
		const scrollbarWidth = scrollDiv.getBoundingClientRect().width - scrollDiv.clientWidth;
		document.body.removeChild(scrollDiv);
		return scrollbarWidth;
	}

	setScrollbar() {
		const calculatedPadding = this.initialPadding + this.getScrollbarWidth();
		document.body.style.paddingRight = `${calculatedPadding}px`;
	}

	resetScrollbar() {
		document.body.style.paddingRight = `${this.initialPadding}px`;
	}

	handleModalOpen() {
		// remove maxHeight hack that prevents scroll on focus
		this.contentRef.style.maxHeight = null;
		this.contentRef.style.overflowY = null;
	}

	get initialPadding() {
		if(typeof initialPadding === 'undefined') {
			initialPadding = parseFloat(document.body.style.paddingRight);
			initialPadding = Number.isNaN(initialPadding) ? 0 : initialPadding;
		}
		return initialPadding;
	}

	render() {
		const { className, isOpen, transition, transitionTimeout, ...props } = this.props;
		const modalProps = {
			role: 'dialog',
			style: { content: { maxHeight: 'calc(100% - 32px)', overflowY: 'hidden' } },
			onAfterOpen: this.handleModalOpen.bind(this),
			contentRef: contentRef => { this.contentRef = contentRef; },
			appElement: document.querySelector('.library-container'),
			className: cx('modal', className, transition),
			overlayClassName: cx('modal-backdrop', transition),
			isOpen: isOpen,
			closeTimeoutMS: transitionTimeout,
			...props
		};

		return <ReactModal { ...modalProps } />;
	}

	static propTypes = {
		isOpen: PropTypes.bool
	}
}

module.exports = Modal;
