import { useFloating, arrow } from '@floating-ui/react-dom';
import cx from 'classnames';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { Fragment, memo, useCallback, useEffect, useId, useLayoutEffect, useRef, useState, useReducer } from 'react';
import { Button, Icon } from 'web-common/components';
import { usePrevious } from 'web-common/hooks';

import { citationFromItems, fetchCSLStyle, toggleModal } from '../../actions';
import { locatorShortForms, locators } from '../../constants/locators';
import { COPY_CITATION } from '../../constants/modals';
import Input from '../form/input';
import Select from '../form/select';
import Modal from '../ui/modal';


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
const BubbleInput = props => {
	const { isOpen, item, modifier, onModifierChange, onOpenPopover } = props;
	const { locator = '', label = '', mode = '' } = modifier;
	const shortLabel = locatorShortForms[label] || label;
	const id = useId();
	const wasOpen = usePrevious(isOpen);

	const ref = useRef(null);
	const popoverRef = useRef(null);
	const arrowRef = useRef(null);
	const { x, y, refs, strategy, update, middlewareData } = useFloating({
		placement: 'top', middleware: [arrow({ element: arrowRef })]
	});

	const locatorOptions = Object.entries(locators).map(([value, label]) => ({ value, label }));

	const handleClick = useCallback((ev) => {
		onOpenPopover(ev.currentTarget.dataset.key);
	}, [onOpenPopover]);

	const handleDone = useCallback(() => {
		ref.current.focus();
		onOpenPopover(null);
	}, [onOpenPopover]);

	const handleLabelChange = useCallback((newLabel) => {
		onModifierChange(item.key, { locator, mode, label: newLabel });
	}, [item.key, locator, mode, onModifierChange]);

	const handleLocatorChange = useCallback((newLocator) => {
		onModifierChange(item.key, { locator: newLocator, mode, label });
	}, [onModifierChange, item.key, mode, label]);

	const handleModeChange = useCallback((ev) => {
		const newMode = ev.target.checked ? 'SuppressAuthor' : '';
		onModifierChange(item.key, { locator, mode: newMode, label });
	}, [onModifierChange, item.key, locator, label]);

	useLayoutEffect(() => {
		if (isOpen && !wasOpen) {
			update();
		}
	}, [isOpen, update, wasOpen]);

	return (
		<Fragment>
			<Button
				data-key={item.key}
				aria-controls={`${id}-dialog`}
				icon
				id={id}
				onClick={handleClick}
				tabIndex={-2}
				ref={r => { refs.setReference(r); ref.current = r; }}
			>
				{buildBubbleString(item, shortLabel, locator)}
				<Icon type="16/chevron-7" className="mouse" width="16" height="16" />
			</Button>
			<div
				inert={isOpen ? undefined : '' }
				aria-label="Citation Options"
				aria-hidden={!isOpen}
				id={`${id}-dialog`}
				role="dialog"
				ref={r => { refs.setFloating(r); popoverRef.current = r; }}
				className={cx('popover', 'popover-bottom', { show: isOpen })}
				style={{ position: strategy, transform: isOpen ? `translate3d(${x}px, ${y}px, 0px)` : '' }}
			>
				<div className="popover-inner" role="tooltip">
					<h3 className="popover-header">
						Citation Preview goes here
					</h3>
					<div className="popover-body">
						<div className="form">
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
								className="form-control form-control-sm"
							/>
							<Input
								aria-label="Locator"
								name="Locator"
								onChange={handleLocatorChange}
								tabIndex={0}
								value={locator}
								className="form-control form-control-sm"
								placeholder="Number"
							/>
							<label>
								<input
									type="checkbox"
									checked={mode === 'SuppressAuthor'}
									onChange={handleModeChange}
								/>
								Omit Author
							</label>
							<Button
								variant="primary"
								onClick={handleDone}
							>
								Done
							</Button>
						</div>
					</div>
				</div>
				<span className="popover-arrow" ref={arrowRef} style={{ left: middlewareData?.arrow?.x }}></span>
			</div>
		</Fragment>
	);
}

const reducer = (state, action) => {
	switch (action.type) {
		case 'BEGIN_UPDATE':
			return { ...state, isUpdating: true };
		case 'COMPLETE_UPDATE':
			return { ...state, isUpdating: false, preview: action.preview, previewPlain: action.previewPlain, shouldUpdate: false };
		case 'ERROR_UPDATE':
			return { ...state, isUpdating: false, shouldUpdate: true };
		case 'UPDATE_MODIFIERS':
			return { ...state, modifiers: action.modifiers, shouldUpdate: true };
		case 'OPEN_POPOVER':
			return { ...state, popoverOpenFor: action.key };
		default:
			return state;
	}
};

const CopyCitationModal = props => {
	const dispatch = useDispatch();
	const isTouchOrSmall = useSelector(state => state.device.isTouchOrSmall);
	const isOpen = useSelector(state => state.modal.id === COPY_CITATION);
	const wasOpen = usePrevious(isOpen);
	const itemKeys = useSelector(state => state.modal.itemKeys || []);
	const libraryKey = useSelector(state => state.modal.libraryKey);
	const items = useSelector(state => itemKeys.map(key => state.libraries[libraryKey].dataObjects[key]), shallowEqual);
	const citationStyle = useSelector(state => state.preferences.citationStyle);
	const citationLocale = useSelector(state => state.preferences.citationLocale);
	const prevCitationStyle = usePrevious(citationStyle);
	const prevCitationLocale = usePrevious(citationLocale);
	const isFetchingStyle = useSelector(state => state.cite.isFetchingStyle);
	const styleProperties = useSelector(state => state.cite.styleProperties);
	const styleXml = useSelector(state => state.cite.styleXml);
	const prevStyleXml = usePrevious(styleXml);
	const title = styleProperties?.isNoteStyle ? 'Copy Note' : 'Copy Citation';

	const [state, dispatchState] = useReducer(reducer, {
		isCopied: false,
		isUpdating: false,
		modifiers: itemKeys.map(() => ({ label: '', locator: '', mode: '' })),
		preview: null,
		previewPlain: null,
		shouldUpdate: false,
		popoverOpenFor: null,
	});

	const handleCancel = useCallback(async () => {
		dispatch(toggleModal(COPY_CITATION, false));
	}, [dispatch]);

	const handleCopy = useCallback(async () => {
	}, []);

	const updatePreview = useCallback(async () => {
		try {
			dispatchState({ type: 'BEGIN_UPDATE' });
			const { html, plain } = await dispatch(citationFromItems(itemKeys, state.modifiers, libraryKey));
			dispatchState({ type: 'COMPLETE_UPDATE', preview: html, previewPlain: plain });
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

	// // regenerate citations when locale changes
	// useEffect(() => {
	// 	if (styleXml && citationLocale !== prevCitationLocale && typeof prevCitationLocale !== 'undefined') {
	// 		updatePreview();
	// 	}
	// }, [citationLocale, updatePreview, prevCitationLocale, styleXml]);

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
		if(state.shouldUpdate && !state.isUpdating && styleXml) {
			updatePreview();
		}
	}, [state.shouldUpdate, state.isUpdating, updatePreview, styleXml]);

	const className = cx({
		'bibliography-modal': true,
		'modal-touch modal-form': isTouchOrSmall,
	});

	return (
		<Modal
			className={className}
			contentLabel={title}
			isOpen={isOpen}
			isBusy={isFetchingStyle}
			onRequestClose={handleCancel}
			overlayClassName={cx({ 'modal-centered modal-slide': isTouchOrSmall, 'modal-full-height': !isTouchOrSmall })}
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
									onClick={handleCopy}
								>
									Create
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
				{items.map((item, index) => (
					<BubbleInput
						isOpen={state.popoverOpenFor === item.key}
						item={item}
						key={item.key}
						modifier={state.modifiers[index]}
						onModifierChange={handleModifierChange}
						onOpenPopover={handleOpenPopover}
					/>
				))}
				<div>
					<h5 id="copy-citation-preview-header">
						Preview:
					</h5>
					<figure
						aria-labelledby="copy-citation-preview-header"
						className="preview"
						dangerouslySetInnerHTML={{ __html: state.preview }}
					/>
				</div>
			</div>
		</Modal>
	);
};

export default memo(CopyCitationModal);
