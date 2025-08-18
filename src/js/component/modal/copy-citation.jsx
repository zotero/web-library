import { arrow, shift, useFloating } from '@floating-ui/react-dom';
import { Button, Icon } from 'web-common/components';
import { Fragment, memo, useCallback, useEffect, useId, useLayoutEffect, useRef, useReducer } from 'react';
import { isTriggerEvent } from 'web-common/utils';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useDebouncedCallback } from 'use-debounce';
import { useFocusManager, usePrevious } from 'web-common/hooks';
import copy from 'copy-to-clipboard';
import cx from 'classnames';
import PropTypes from 'prop-types';

import { citationFromItems, fetchCSLStyle, toggleModal } from '../../actions';
import { COPY_CITATION } from '../../constants/modals';
import { locatorShortForms, locators } from '../../constants/locators';
import FocusTrap from '../focus-trap';
import Input from '../form/input';
import Modal from '../ui/modal';
import Select from '../form/select';


const buildBubbleString = (item, locatorLabel, locatorValue) => {
	// Creator
	let title;
	let str = item[Symbol.for('derived')]?.creator;

	// Title, if no creator
	title = item[Symbol.for('derived')]?.title;
	title = title.substr(0, 32) + (title.length > 32 ? "…" : "");
	if (!str && title) {
		str = `“${title}”`;
	} else if (!str) {
		str = '(no title)';
	}

	// Date
	var date = item[Symbol.for('derived')]?.date;
	if (date && (date = date.substr(0, 4)) !== "0000") {
		str += ", " + parseInt(date);
	}

	// Locator
	if (locatorValue) {
		str += `, ${locatorLabel} ${locatorValue}`;
	}

	return str;
}

// Inspired by https://github.com/zotero/zotero/blob/8df8182f01d4294482e33031567db0359cd145c3/chrome/content/zotero/elements/bubbleInput.js
const Bubble = memo((props => {
	const isTouchOrSmall = useSelector(state => state.device.isTouchOrSmall);
	const { isOpen, item, modifier, onModifierChange, onOpenPopover } = props;
	const { locator = '', label = '', mode = '' } = modifier;
	const shortLabel = locatorShortForms[label] || label;
	const id = useId();
	const wasOpen = usePrevious(isOpen);
	const ref = useRef(null);
	const popoverRef = useRef(null);
	const arrowRef = useRef(null);
	const inputRef = useRef(null);
	const middleware = [shift({ padding: 8 }), arrow({ element: arrowRef })];
	const { x, y, refs, strategy, update, middlewareData } = useFloating({ placement: 'bottom', middleware });

	const locatorOptions = Object.entries(locators).map(([value, label]) => ({ value, label }));

	const handleClick = useCallback((ev) => {
		if (isOpen) {
			onOpenPopover(null);
		} else {
			onOpenPopover(ev.currentTarget.dataset.key);
		}
	}, [isOpen, onOpenPopover]);

	const handleDone = useCallback(() => {
		ref.current.focus();
		onOpenPopover(null);
	}, [onOpenPopover]);

	const handleKeyDown = useCallback((ev) => {
		if (isTriggerEvent(ev) || (ev.type === 'keydown' && ev.key === 'ArrowDown')) {
			ev.preventDefault();
			onOpenPopover(ev.currentTarget.dataset.key);
			return;
		}
	}, [onOpenPopover]);


	const handleLabelChange = useCallback((newLabel) => {
		onModifierChange(item.key, { locator, mode, label: newLabel });
	}, [item.key, locator, mode, onModifierChange]);

	const handleLocatorChange = useDebouncedCallback(useCallback((newLocator) => {
		onModifierChange(item.key, { locator: newLocator, mode, label });
	}, [onModifierChange, item.key, mode, label]), 300);

	const handleModeChange = useCallback((ev) => {
		const newMode = ev.target.checked ? 'SuppressAuthor' : '';
		onModifierChange(item.key, { locator, mode: newMode, label });
	}, [onModifierChange, item.key, locator, label]);

	useLayoutEffect(() => {
		if (isOpen && !wasOpen) {
			update();
			if (inputRef.current) {
				inputRef.current.focus();
			}
		}
	}, [isOpen, update, wasOpen]);

	return (
		<Fragment>
			<Button
				className="bubble"
				data-key={item.key}
				aria-controls={`${id}-dialog`}
				icon
				id={id}
				onClick={handleClick}
				onKeyDown={handleKeyDown}
				tabIndex={-2}
				ref={r => { refs.setReference(r); ref.current = r; }}
			>
				{buildBubbleString(item, shortLabel, locator)}
				<Icon type="16/chevron-7" className="dropmarker" width="16" height="16" />
			</Button>
			<FocusTrap disabled={!isOpen}>
				<div
					inert={isOpen ? undefined : ''}
					aria-label="Citation Options"
					aria-hidden={!isOpen}
					id={`${id}-dialog`}
					role="dialog"
					ref={r => { refs.setFloating(r); popoverRef.current = r; }}
					className={cx('bubble-popover', 'popover', 'popover-bottom', { show: isOpen })}
					style={{ position: strategy, transform: isOpen ? `translate3d(${x}px, ${y}px, 0px)` : '' }}
				>
					<div className="popover-inner" role="tooltip">
						{ isTouchOrSmall && (
						<div className="popover-close">
							<Button
								icon
								className="btn-close"
								onClick={handleDone}
							>
								<Icon type={'10/x'} width="12" height="12" />
							</Button>
						</div>
						) }
						<div className="popover-body">
							<div className="form">
								<div className="form-row form-group">
									<div className="col-6">
										<Select
											aria-label="Locator Label"
											name="label"
											clearable={false}
											onChange={() => true}
											onCommit={handleLabelChange}
											options={locatorOptions}
											searchable={false}
											tabIndex={0}
											value={label || 'page'}
											className="form-control"
										/>
									</div>
									<div className="col-6">
										<Input
											autoComplete="off"
											ref={ inputRef }
											aria-label="Locator"
											name="Locator"
											onChange={handleLocatorChange}
											tabIndex={0}
											value={locator}
											className="form-control form-control-sm"
											placeholder="Number"
										/>
									</div>
								</div>
								<div className="form-group checkboxes">
									<div className="checkbox">
										<input
											id={`${id}-suppress-author`}
											type="checkbox"
											checked={mode === 'SuppressAuthor'}
											onChange={handleModeChange}
										/>
										<label htmlFor={`${id}-suppress-author`}>
											Omit Author
										</label>
									</div>
								</div>
								{ !isTouchOrSmall && (
								<div className="buttons-wrap">
									{/* <div className="left">
										<Button onClick={handleDone} className="btn btn-danger">
											Remove
										</Button>
									</div> */}
									<div className="right">
										<Button onClick={handleDone} className="btn-secondary">
											Done
										</Button>
									</div>
								</div>
								) }
							</div>
						</div>
					</div>
					<span className="popover-arrow" ref={arrowRef} style={{ left: middlewareData?.arrow?.x }}></span>
				</div>
			</FocusTrap>
		</Fragment>
	);
}));

Bubble.displayName = 'Bubble';

Bubble.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    item: PropTypes.shape({
        key: PropTypes.string.isRequired
    }).isRequired,
    modifier: PropTypes.shape({
        locator: PropTypes.string,
        label: PropTypes.string,
        mode: PropTypes.string
    }).isRequired,
    onModifierChange: PropTypes.func.isRequired,
    onOpenPopover: PropTypes.func.isRequired
};

const reducer = (state, action) => {
	switch (action.type) {
		case 'BEGIN_UPDATE':
			return { ...state, isUpdating: true, isCopied: false };
		case 'COMPLETE_UPDATE':
			return { ...state, isUpdating: false, citationsHTML: action.citationsHTML, citationsPlain: action.citationsPlain, shouldUpdate: false };
		case 'ERROR_UPDATE':
			return { ...state, isUpdating: false, shouldUpdate: false };
		case 'UPDATE_MODIFIERS':
			return { ...state, modifiers: action.modifiers, shouldUpdate: true };
		case 'OPEN_POPOVER':
			return { ...state, prevPopoverOpenFor: null, popoverOpenFor: action.key };
		case 'CLOSE_POPOVER':
			return { ...state, prevPopoverOpenFor: state.popoverOpenFor, popoverOpenFor: null };
		case 'COPY':
			return { ...state, isCopied: true };
		case 'RESET_COPY':
			return { ...state, isCopied: false };
		default:
			return state;
	}
};

const CopyCitationModal = () => {
	const dispatch = useDispatch();
	const isTouchOrSmall = useSelector(state => state.device.isTouchOrSmall);
	const isOpen = useSelector(state => state.modal.id === COPY_CITATION);
	const wasOpen = usePrevious(isOpen);
	const itemKeys = useSelector(state => state.modal.itemKeys || []);
	const libraryKey = useSelector(state => state.modal.libraryKey);
	const items = useSelector(state => itemKeys.map(key => state.libraries[libraryKey].dataObjects[key]), shallowEqual);
	const citationStyle = useSelector(state => state.preferences.citationStyle);
	const prevCitationStyle = usePrevious(citationStyle);
	const isFetchingStyle = useSelector(state => state.cite.isFetchingStyle);
	const styleProperties = useSelector(state => state.cite.styleProperties);
	const styleXml = useSelector(state => state.cite.styleXml);
	const prevStyleXml = usePrevious(styleXml);
	const title = styleProperties?.isNoteStyle ? 'Copy Note' : 'Copy Citation';
	const bubblesRef = useRef(null);
	const copyDataInclude = useRef(null);
	const copyTimeout = useRef(null);
	const { receiveBlur, receiveFocus, focusNext, focusPrev } = useFocusManager(bubblesRef);

	const [state, dispatchState] = useReducer(reducer, {
		isCopied: false,
		isUpdating: false,
		modifiers: itemKeys.map(() => ({ label: '', locator: '', mode: '' })),
		citationsPlain: null,
		citationsHTML: null,
		shouldUpdate: false,
		popoverOpenFor: null,
		prevPopoverOpenFor: null
	});

	const handleCancel = useCallback(async (ev) => {
		if(ev.type === 'keydown' && ev.key === 'Escape' && state.popoverOpenFor) {
			dispatchState({ type: 'CLOSE_POPOVER' });
			return;
		}
		dispatch(toggleModal(COPY_CITATION, false));
	}, [dispatch, state.popoverOpenFor]);

	const handleCopyClick = useCallback(async () => {
		copyDataInclude.current = [
			{ mime: 'text/plain', data: state.citationsPlain },
			{ mime: 'text/html', data: state.citationsHTML },
		];

		copy(state.citationsPlain);

		if(isTouchOrSmall) {
			dispatch(toggleModal(COPY_CITATION, false));
		} else {
			dispatchState({ type: 'COPY' });
			clearTimeout(copyTimeout.current);
			copyTimeout.current = setTimeout(() => {
				dispatchState({ type: 'RESET_COPY' });
			}, 950);
		}
	}, [state.citationsPlain, state.citationsHTML, isTouchOrSmall, dispatch]);

	const updatePreview = useCallback(async () => {
		clearTimeout(copyTimeout.current);
		try {
			dispatchState({ type: 'BEGIN_UPDATE' });
			const { html, plain } = await dispatch(citationFromItems(itemKeys, state.modifiers, libraryKey));
			dispatchState({ type: 'COMPLETE_UPDATE', citationsHTML: html, citationsPlain: plain });
		} catch (error) {
			dispatchState({ type: 'ERROR_UPDATE' });
		}
	}, [dispatch, itemKeys, libraryKey, state.modifiers]);

	const handleModifierChange = useCallback((key, newModifier) => {
		const index = itemKeys.indexOf(key);
		const newModifiers = [...state.modifiers];
		newModifiers[index] = newModifier;
		dispatchState({ type: 'UPDATE_MODIFIERS', modifiers: newModifiers });
	}, [itemKeys, state.modifiers]);

	const handleOpenPopover = useCallback((key) => {
		dispatchState({ type: 'OPEN_POPOVER', key });
	}, []);

	const handleBubblesKeyDown = useCallback((ev) => {
		if(state.popoverOpenFor) {
			return;
		}

		if (ev.key === 'ArrowRight') {
			focusNext(ev, { useCurrentTarget: false });
		} else if (ev.key === 'ArrowLeft') {
			focusPrev(ev, { useCurrentTarget: false });
		}
	}, [focusNext, focusPrev, state.popoverOpenFor]);

	const handleDocumentEvent = useCallback(ev => {
		if (ev.type === 'click' && ev.button === 2) {
			return;
		}

		if (ev.target?.closest?.('.popover')) {
			return;
		}

		if (ev.target?.closest('button')?.dataset?.key === state.popoverOpenFor) {
			// Click occurred on the bubble button; let its own handler manage popover toggling
			return;
		}

		dispatchState({ type: 'CLOSE_POPOVER' });
	}, [state.popoverOpenFor]);

	useEffect(() => {
		if (isOpen) {
			['click', 'touchstart'].forEach(evType =>
				document.addEventListener(evType, handleDocumentEvent, true)
			);
		} else {
			['click', 'touchstart', 'keyup'].forEach(evType =>
				document.removeEventListener(evType, handleDocumentEvent, true)
			);
		}

		return () => {
			['click', 'touchstart', 'keyup'].forEach(evType =>
				document.removeEventListener(evType, handleDocumentEvent, true)
			);
		}
	}, [isOpen, handleDocumentEvent]);

	const handleCopyToClipboard = useCallback(ev => {
		if (copyDataInclude.current) {
			copyDataInclude.current.forEach(copyDataFormat => {
				ev.clipboardData.setData(copyDataFormat.mime, copyDataFormat.data);
			});
			ev.preventDefault();
			copyDataInclude.current = null;
		}
	}, []);

	// fetch style when modal is first opened. This will trigger effect below that actually generates bibliography.
	useEffect(() => {
		if (!isFetchingStyle && styleXml === null) {
			dispatch(fetchCSLStyle(citationStyle));
		}
	}, [citationStyle, dispatch, isFetchingStyle, styleXml]);

	// regenerate citations when styleXml changes (e.g., when style is fetched for the first time or after a change)
	useEffect(() => {
		if (styleXml && prevStyleXml !== styleXml && typeof prevStyleXml !== 'undefined') {
			updatePreview();
		}
	}, [citationStyle, updatePreview, prevCitationStyle, prevStyleXml, styleXml]);

	// regenerate citations when modal re-opens with style already fetched
	useEffect(() => {
		if (isOpen && !wasOpen && styleXml) {
			updatePreview();
		}
	}, [isOpen, updatePreview, styleXml, wasOpen]);

	// regenerate citations when modifiers change
	useEffect(() => {
		if (state.shouldUpdate && !state.isUpdating && styleXml) {
			updatePreview();
		}
	}, [state.shouldUpdate, state.isUpdating, updatePreview, styleXml]);

	// Return focus to the bubble button whose popover just closed
	useEffect(() => {
		if (state.popoverOpenFor === null && state.prevPopoverOpenFor) {
			const bubbleButton = document.querySelector(`.bubble[data-key="${state.prevPopoverOpenFor}"]`);
			if (bubbleButton) {
				bubbleButton.focus();
			}
		}
	}, [state.popoverOpenFor, state.prevPopoverOpenFor]);

	// Register copy event handler to inject html and plain text into clipboard
	useEffect(() => {
		document.addEventListener('copy', handleCopyToClipboard, true);
		return () => {
			document.removeEventListener('copy', handleCopyToClipboard, true);
		}
	}, [handleCopyToClipboard]);

	const className = cx({
		'copy-citation-modal': true,
		'modal-touch modal-form': isTouchOrSmall,
	});

	return (
		<Modal
			className={className}
			contentLabel={title}
			isOpen={isOpen}
			isBusy={isFetchingStyle}
			onRequestClose={handleCancel}
			overlayClassName={cx({ 'modal-centered modal-slide': isTouchOrSmall })}
		>
			<div className="modal-header">
				{
					isTouchOrSmall ? (
						<Fragment>
							<div className="modal-header-left">
								<Button
									className="btn-link"
									onClick={handleCancel}
								>
									Cancel
								</Button>
							</div>
							<div className="modal-header-center">
								<h4 className="modal-title truncate">
									{title}
								</h4>
							</div>
							<div className="modal-header-right">
								<Button
									disabled={state.isUpdating}
									className="btn-link"
									onClick={handleCopyClick}
								>
									Copy
								</Button>
							</div>
						</Fragment>
					) : (
						<Fragment>
							<h4 className="modal-title truncate">
								{title}
							</h4>
							<Button
								icon
								className="close"
								onClick={handleCancel}
							>
								<Icon type={'16/close'} width="16" height="16" />
							</Button>
						</Fragment>
					)
				}
			</div>
			<div className="modal-body">
				<div
					className="bubbles"
					onBlur={receiveBlur}
					onFocus={receiveFocus}
					onKeyDown={handleBubblesKeyDown}
					ref={bubblesRef}
					tabIndex={0}
				>
					{items.map((item, index) => (
						<Bubble
							isOpen={state.popoverOpenFor === item.key}
							item={item}
							key={item.key}
							modifier={state.modifiers[index]}
							onModifierChange={handleModifierChange}
							onOpenPopover={handleOpenPopover}
						/>
					))}
				</div>
				<div>
					<h5 id="copy-citation-preview-header">
						Preview:
					</h5>
					<figure
						aria-labelledby="copy-citation-preview-header"
						className="preview"
						dangerouslySetInnerHTML={{ __html: state.citationsHTML }}
					/>
				</div>
			</div>
			{ !isTouchOrSmall && (
				<div className="modal-footer justify-content-end">
					<Button onClick={handleCopyClick} className="btn btn-lg btn-secondary" disabled={state.isUpdating}>
						<span className={cx('inline-feedback', { 'active': state.isCopied })}>
							<span className="default-text" aria-hidden={!state.isCopied}>
								{title}
							</span>
							<span className="shorter feedback" aria-hidden={state.isCopied}>
								Copied!
							</span>
						</span>
					</Button>
				</div>
			) }
		</Modal>
	);
};

export default memo(CopyCitationModal);
