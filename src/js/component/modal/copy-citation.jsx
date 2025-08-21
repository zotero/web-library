import { arrow, shift, useFloating } from '@floating-ui/react-dom';
import { Button, Icon } from 'web-common/components';
import { Fragment, forwardRef, memo, useCallback, useEffect, useId, useImperativeHandle, useLayoutEffect, useRef, useReducer } from 'react';
import { isTriggerEvent } from 'web-common/utils';
import { useDispatch, useSelector } from 'react-redux';
import { useDebouncedCallback } from 'use-debounce';
import { useFocusManager, usePrevious } from 'web-common/hooks';
import CSSTransition from 'react-transition-group/cjs/CSSTransition';
import copy from 'copy-to-clipboard';
import cx from 'classnames';
import PropTypes from 'prop-types';

import { citationFromItems, fetchCSLStyle, toggleModal } from '../../actions';
import { BIBLIOGRAPHY, COPY_CITATION } from '../../constants/modals';
import { locatorShortForms, locators } from '../../constants/locators';
import FocusTrap from '../focus-trap';
import Input from '../form/input';
import Modal from '../ui/modal';
import Select from '../form/select';
import CitationOptions from '../citation-options';
import { CITATION } from '../../constants/dnd';
import { useSortable, HORIZONTAL } from '../../hooks';

const locatorOptions = Object.entries(locators).map(([value, label]) => ({ value, label }));


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
};

const CitationForm = memo(forwardRef((props, ref) => {
	const { locator, label, mode, itemKey, onModifierChange, onClose } = props;
	const inputRef = useRef(null);
	const id = useId();

	useImperativeHandle(ref, () => ({
		focus: () => {
			if (inputRef.current) {
				inputRef.current.focus();
			}
		}
	}));

	const handleLabelChange = useCallback((newLabel) => {
		onModifierChange(itemKey, { locator, mode, label: newLabel });
	}, [itemKey, locator, mode, onModifierChange]);

	const handleLocatorChange = useDebouncedCallback(useCallback((newLocator) => {
		onModifierChange(itemKey, { locator: newLocator, mode, label });
	}, [onModifierChange, itemKey, mode, label]), 300);

	const handleModeChange = useCallback((ev) => {
		const newMode = ev.target.checked ? 'SuppressAuthor' : '';
		onModifierChange(itemKey, { locator, mode: newMode, label });
	}, [onModifierChange, itemKey, locator, label]);

	return (
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
						ref={inputRef}
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
			<div className="buttons-wrap">
				{/* <div className="left">
									<Button onClick={handleDone} className="btn btn-danger">
										Remove
									</Button>
								</div> */}
				<div className="right">
					<Button onClick={onClose} className="btn btn-default">
						Done
					</Button>
				</div>
			</div>
		</div>
	)
}));

CitationForm.displayName = 'CitationForm';

CitationForm.propTypes = {
	itemKey: PropTypes.string.isRequired,
	label: PropTypes.string,
	locator: PropTypes.string,
	mode: PropTypes.string,
	onClose: PropTypes.func.isRequired,
	onModifierChange: PropTypes.func.isRequired,
	formRef: PropTypes.object
};

// Inspired by https://github.com/zotero/zotero/blob/8df8182f01d4294482e33031567db0359cd145c3/chrome/content/zotero/elements/bubbleInput.js
const Bubble = memo((props => {
	const { isOpen, item, index, modifier, onModifierChange, onOpenPopover, onReorderPreview, onReorderCommit, onReorderCancel } = props;
	const { locator = '', label = '', mode = '' } = modifier;
	const shortLabel = locatorShortForms[label] || label;
	const id = useId();
	const wasOpen = usePrevious(isOpen);
	const ref = useRef(null);
	const popoverRef = useRef(null);
	const arrowRef = useRef(null);
	const formRef = useRef(null);
	const middleware = [shift({ padding: 8 }), arrow({ element: arrowRef })];
	const { x, y, refs, strategy, update, middlewareData } = useFloating({ placement: 'bottom', middleware });
	const { dragRef, dropRef, isDragging, isOver, canDrop } = useSortable(
		ref, CITATION, { key: item.key }, index, onReorderPreview, onReorderCommit, onReorderCancel, HORIZONTAL
	);

	dragRef(dropRef(ref));

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


	useLayoutEffect(() => {
		if (isOpen && !wasOpen) {
			update();
			formRef.current?.focus();
		}
	}, [isOpen, update, wasOpen]);

	const classNames = cx('bubble',
		{ 'open': isOpen, 'dnd-target': isOver && canDrop, 'dnd-source': isDragging }
	);

	return (
		<Fragment>
			<Button
				className={classNames}
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
						<div className="popover-body">
							<CitationForm
								itemKey={item.key}
								label={label}
								locator={locator}
								mode={mode}
								onClose={handleDone}
								onModifierChange={onModifierChange}
								ref={formRef}
							/>
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
	index: PropTypes.number.isRequired,
	item: PropTypes.shape({
		key: PropTypes.string.isRequired
	}).isRequired,
	modifier: PropTypes.shape({
		locator: PropTypes.string,
		label: PropTypes.string,
		mode: PropTypes.string
	}).isRequired,
	onModifierChange: PropTypes.func.isRequired,
	onOpenPopover: PropTypes.func.isRequired,
	onReorderCancel: PropTypes.func.isRequired,
	onReorderCommit: PropTypes.func.isRequired,
	onReorderPreview: PropTypes.func.isRequired,
};

const CitationTouch = memo(props => {
	const { isOpen, item, modifier, onOpenTouchEditor } = props;
	const { locator = '', label = '' } = modifier;
	const shortLabel = locatorShortForms[label] || label;

	const handleOpenTouchEditor = useCallback(ev => {
		onOpenTouchEditor(ev.currentTarget.closest('.citation-touch').dataset.key);
	}, [onOpenTouchEditor]);

	return (
		<div className="citation-touch" data-key={item.key}>
			<div className="form-row">
				<div className="col-12">
					<div className="form-group form-row">
						<label>{buildBubbleString(item, shortLabel, locator)}</label>
						<Button onClick={handleOpenTouchEditor} className={cx('btn btn-icon', { 'btn-active': isOpen })}>
							<Icon type={'16/quote'} width="16" height="16" />
						</Button>
					</div>
				</div>
			</div>
		</div>
	)
});

CitationTouch.displayName = 'CitationTouch';

CitationTouch.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	item: PropTypes.shape({
		key: PropTypes.string.isRequired
	}).isRequired,
	modifier: PropTypes.shape({
		locator: PropTypes.string,
		label: PropTypes.string,
		mode: PropTypes.string
	}).isRequired,
	onOpenTouchEditor: PropTypes.func.isRequired
};

const CitationTouchEditor = memo(({ modifier, itemKey, onClose, onModifierChange, isOpen }) => {
	const formRef = useRef(null);
	const fadeOverlayRef = useRef(null);
	const citationTouchEditorRef = useRef(null);

	const handleTouchEditorEnter = () => {
		formRef.current?.focus();
	};

	return (
		<Fragment>
			<CSSTransition
				in={isOpen}
				mountOnEnter
				unmountOnExit
				timeout={250}
				classNames="fade"
				nodeRef={fadeOverlayRef}
			>
				<div ref={fadeOverlayRef} onClick={onClose} className="fade-overlay"></div>
			</CSSTransition>
			<CSSTransition
				classNames="slide-down"
				in={isOpen}
				mountOnEnter
				nodeRef={citationTouchEditorRef}
				onEnter={handleTouchEditorEnter}
				timeout={500}
				unmountOnExit
			>
				<div className="citation-touch-editor" ref={citationTouchEditorRef}>
					{isOpen && <CitationForm
						itemKey={itemKey}
						label={modifier.label}
						locator={modifier.locator}
						mode={modifier.mode}
						onClose={onClose}
						onModifierChange={onModifierChange}
						ref={formRef}
					/>}
				</div>
			</CSSTransition>
		</Fragment>
	);
});

CitationTouchEditor.displayName = 'CitationTouchEditor';

CitationTouchEditor.propTypes = {
	modifier: PropTypes.shape({
		label: PropTypes.string,
		locator: PropTypes.string,
		mode: PropTypes.string
	}).isRequired,
	isOpen: PropTypes.bool.isRequired,
	itemKey: PropTypes.string.isRequired,
	onClose: PropTypes.func.isRequired,
	onModifierChange: PropTypes.func.isRequired,
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
		case 'REORDER':
			return action.commit ?
				{ ...state, currentOrder: action.newOrder, previewOrder: null, shouldUpdate: true } :
				{ ...state, previewOrder: action.newOrder };
		case 'REORDER_COMMIT':
			return { ...state, currentOrder: state.previewOrder ? [...state.previewOrder] : state.currentOrder, previewOrder: null, shouldUpdate: true };
		case 'REORDER_CANCEL':
			return { ...state, previewOrder: null };
		case 'RESET_ORDER':
			return { ...state, currentOrder: action.newOrder, previewOrder: null };
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
	const itemsLookup = useSelector(state => state.libraries[libraryKey]?.dataObjects);
	const citationStyle = useSelector(state => state.preferences.citationStyle);
	const prevCitationStyle = usePrevious(citationStyle);
	const isFetchingStyle = useSelector(state => state.cite.isFetchingStyle);
	const styleProperties = useSelector(state => state.cite.styleProperties);
	const styleXml = useSelector(state => state.cite.styleXml);
	const citationLocale = useSelector(state => state.preferences.citationLocale);
	const prevStyleXml = usePrevious(styleXml);
	const prevCitationLocale = usePrevious(citationLocale);
	const title = styleProperties?.isNoteStyle ? 'Copy Note' : 'Copy Citation';
	const bubblesRef = useRef(null);
	const citationsTouchRef = useRef(null);
	const copyDataInclude = useRef(null);
	const copyTimeout = useRef(null);
	const { receiveBlur, receiveFocus, focusNext, focusPrev } = useFocusManager(bubblesRef);

	const [state, dispatchState] = useReducer(reducer, {
		isCopied: false,
		isUpdating: false,
		modifiers: Object.fromEntries(itemKeys.map(key => [key, { label: '', locator: '', mode: '' }])),
		citationsPlain: null,
		citationsHTML: null,
		shouldUpdate: false,
		popoverOpenFor: null,
		prevPopoverOpenFor: null,
		currentOrder: itemKeys,
		previewOrder: null,
	});

	const handleCancel = useCallback(async (ev) => {
		if (ev.type === 'keydown' && ev.key === 'Escape' && state.popoverOpenFor) {
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

		if (isTouchOrSmall) {
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
			const { html, plain } = await dispatch(citationFromItems(state.currentOrder, state.modifiers, libraryKey));
			dispatchState({ type: 'COMPLETE_UPDATE', citationsHTML: html, citationsPlain: plain });
		} catch (error) {
			dispatchState({ type: 'ERROR_UPDATE' });
		}
	}, [dispatch, state.currentOrder, libraryKey, state.modifiers]);

	const handleModifierChange = useCallback((key, newModifier) => {
		const newModifiers = {
			...state.modifiers,
			[key]: newModifier,
		};
		dispatchState({ type: 'UPDATE_MODIFIERS', modifiers: newModifiers });
	}, [state.modifiers]);

	const handleOpenPopoverOrEditor = useCallback((key) => {
		dispatchState({ type: 'OPEN_POPOVER', key });
	}, []);

	const handleClosePopoverOrEditor = useCallback(() => {
		dispatchState({ type: 'OPEN_POPOVER', key: null });
	}, []);

	const handleReorder = useCallback((fromIndex, toIndex, commit = false) => {
		const newOrder = [...(state.previewOrder ?? state.currentOrder)];
		newOrder.splice(toIndex, 0, newOrder.splice(fromIndex, 1)[0]);
		dispatchState({ type: 'REORDER', newOrder, commit });
	}, [state.currentOrder, state.previewOrder]);

	const handleReorderCommit = useCallback(() => {
		dispatchState({ type: 'REORDER_COMMIT' });
	}, [dispatchState]);

	const handleReorderCancel = useCallback(() => {
		dispatchState({ type: 'REORDER_CANCEL' });
	}, [dispatchState]);

	const handleBubblesKeyDown = useCallback((ev) => {
		if (state.popoverOpenFor) {
			return;
		}
		const index = state.currentOrder.indexOf(ev.target.dataset.key);
		if (ev.key === 'ArrowRight') {
			if(ev.shiftKey) {
				if (index < state.currentOrder.length - 1) {
					handleReorder(index, state.currentOrder.indexOf(ev.target.dataset.key) + 1, true);
				}
			} else {
				focusNext(ev, { useCurrentTarget: false });
			}
		} else if (ev.key === 'ArrowLeft') {
			if (ev.shiftKey) {
				if (index > 0) {
					handleReorder(index, index - 1, true);
				}
			} else {
				focusPrev(ev, { useCurrentTarget: false });
			}
		}
	}, [focusNext, focusPrev, handleReorder, state.currentOrder, state.popoverOpenFor]);

	const handleDocumentEvent = useCallback(ev => {
		// ignore right-clicks
		if (ev.type === 'click' && ev.button === 2) {
			return;
		}

		// ignore clicks on the popover (or touch editor on touch devices) itself
		if (ev.target?.closest?.('.popover') || ev.target?.closest?.('.citation-touch-editor')) {
			return;
		}

		// Click occurred on the bubble button; let its own handler manage popover toggling
		if (ev.target?.closest('button')?.dataset?.key === state.popoverOpenFor) {
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

	const handleBibliographyClick = useCallback(() => {
		dispatch(toggleModal(COPY_CITATION, false));
		dispatch(toggleModal(BIBLIOGRAPHY, true, { itemKeys, libraryKey }));
	}, [dispatch, itemKeys, libraryKey]);

	// regenerate bibliography when locale changes
	useEffect(() => {
		if (styleXml && citationLocale !== prevCitationLocale && typeof prevCitationLocale !== 'undefined') {
			updatePreview();
		}
	}, [citationLocale, updatePreview, prevCitationLocale, styleXml]);

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
			const containerRef = isTouchOrSmall ? citationsTouchRef : bubblesRef;
			const bubbleButton = containerRef.current.querySelector(`[data-key="${state.prevPopoverOpenFor}"]`);
			if (bubbleButton) {
				bubbleButton.focus();
			}
		}
	}, [isTouchOrSmall, state.popoverOpenFor, state.prevPopoverOpenFor]);

	// Register copy event handler to inject html and plain text into clipboard
	useEffect(() => {
		document.addEventListener('copy', handleCopyToClipboard, true);
		return () => {
			document.removeEventListener('copy', handleCopyToClipboard, true);
		}
	}, [handleCopyToClipboard]);

	const className = cx({
		'copy-citation-modal': true,
		'modal-scrollable': true,
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
			{isTouchOrSmall && (
				<CitationTouchEditor
					isOpen={state.popoverOpenFor !== null}
					itemKey={state.popoverOpenFor}
					modifier={state.modifiers[state.popoverOpenFor]}
					onClose={handleClosePopoverOrEditor}
					onModifierChange={handleModifierChange}
				/>
			)}
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
				<div className="form">
					<CitationOptions />
					{itemsLookup && isTouchOrSmall && (
						<div className="citations-touch" ref={citationsTouchRef}>
							{(state.previewOrder ?? state.currentOrder).map(itemKey => (
								<CitationTouch
									isOpen={state.popoverOpenFor === itemKey}
									key={itemKey}
									item={itemsLookup[itemKey]}
									modifier={state.modifiers[itemKey]}
									onOpenTouchEditor={handleOpenPopoverOrEditor}
								/>
							))}
						</div>
					)}
				</div>
				{itemsLookup && !isTouchOrSmall && (
					<Fragment>
						<div
							className="bubbles"
							onBlur={receiveBlur}
							onFocus={receiveFocus}
							onKeyDown={handleBubblesKeyDown}
							ref={bubblesRef}
							tabIndex={0}
						>
							{(state.previewOrder ?? state.currentOrder).map((itemKey, index) => (
								<Bubble
									isOpen={state.popoverOpenFor === itemKey}
									item={itemsLookup[itemKey]}
									key={itemKey}
									modifier={state.modifiers[itemKey]}
									onModifierChange={handleModifierChange}
									onOpenPopover={handleOpenPopoverOrEditor}
									index={index}
									onReorderPreview={handleReorder}
									onReorderCommit={handleReorderCommit}
									onReorderCancel={handleReorderCancel}
								/>
							))}
						</div>
						<div className="copy-citation-container">
							<h5 id="copy-citation-preview-header">
								Preview:
							</h5>
							<figure
								aria-labelledby="copy-citation-preview-header"
								className="preview"
								dangerouslySetInnerHTML={{ __html: state.citationsHTML }}
							/>
						</div>
					</Fragment>
				)}
			</div>
			{!isTouchOrSmall && (
				<div className="modal-footer">
					<div className="modal-footer-left">
						<Button onClick={handleBibliographyClick} className="btn btn-lg btn-default">
							Bibliography
						</Button>
					</div>
					<div className="modal-footer-right">
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
				</div>
			)}
		</Modal>
	);
};

export default memo(CopyCitationModal);
