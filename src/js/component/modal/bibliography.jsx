import copy from 'copy-to-clipboard';
import cx from 'classnames';
import React, { useCallback, useEffect, useRef, useState, memo } from 'react';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap/lib';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';

import Button from '../ui/button';
import Icon from '../ui/icon';
import LocaleSelector from '../locale-selector';
import Modal from '../ui/modal';
import RadioSet from '../form/radio-set';
import Spinner from '../ui/spinner';
import StyleSelector from '../style-selector';
import { BIBLIOGRAPHY, STYLE_INSTALLER } from '../../constants/modals';
import { coreCitationStyles } from '../../../../data/citation-styles-data.json';
import { getUniqueId } from '../../utils';
import { stripTagsUsingDOM } from '../../common/format';
import { toggleModal, bibliographyFromCollection, bibliographyFromItems, citeItems, preferenceChange, triggerSelectMode } from '../../actions';
import { usePrevious } from '../../hooks';


const BibliographyModal = () => {
	const dispatch = useDispatch();
	const isTouchOrSmall = useSelector(state => state.device.isTouchOrSmall);
	const isOpen = useSelector(state => state.modal.id === BIBLIOGRAPHY);
	const outputMode = useSelector(state => state.modal.outputMode || 'bibliography');
	const citationStyle = useSelector(state => state.preferences.citationStyle);
	const citationLocale = useSelector(state => state.preferences.citationLocale);
	const installedCitationStyles = useSelector(state => state.preferences.installedCitationStyles, shallowEqual);
	const collectionKey = useSelector(state => state.modal.collectionKey);
	const itemKeys = useSelector(state => state.modal.itemKeys);
	const libraryKey = useSelector(state => state.modal.libraryKey);

	const prevCitationStyle = usePrevious(citationStyle);
	const prevCitationLocale = usePrevious(citationLocale);

	const citationStyles = [...coreCitationStyles, ...installedCitationStyles];

	const [requestedAction, setRequestedAction] = useState('clipboard');
	const [isClipboardCopied, setIsClipboardCopied] = useState(false);
	const [isHtmlCopied, setIsHtmlCopied] = useState(false);
	const [output, setOutput] = useState(null);
	const [isUpdating, setIsUpdating] = useState(false);
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);

	const styleSelectorId = useRef(getUniqueId());
	const localeSelectorId = useRef(getUniqueId());
	const copyDataInclude = useRef(null);
	const dropdownTimer = useRef(null);

	const makeOutput = useCallback(async () => {
		try {
			setIsUpdating(true);
			var nextOutput;
			if(outputMode === 'cite') {
				nextOutput = await dispatch(citeItems(
					itemKeys, libraryKey, citationStyle, citationLocale
				));
			} else {
				if(collectionKey) {
					nextOutput = await dispatch(bibliographyFromCollection(
						collectionKey, libraryKey, citationStyle, citationLocale
					));
				} else {
					nextOutput = await dispatch(bibliographyFromItems(
						itemKeys, libraryKey, citationStyle, citationLocale
					));
				}
			}
			setOutput(nextOutput);
		} finally {
			setIsUpdating(false);
		}
	}, [citationLocale, citationStyle, collectionKey, dispatch, itemKeys, libraryKey, outputMode]);

	const copyToClipboard = useCallback(bibliographyToCopy => {
		const bibliographyText = stripTagsUsingDOM(bibliographyToCopy);

		copyDataInclude.current = [
			{ mime: 'text/plain', data: bibliographyText },
			{ mime: 'text/html', data: bibliographyToCopy },
		];
		copy(bibliographyText);
	}, []);

	const handleCopy = useCallback(ev => {
		if(copyDataInclude.current) {
			copyDataInclude.current.forEach(copyDataFormat => {
				ev.clipboardData.setData(copyDataFormat.mime, copyDataFormat.data);
			});
			ev.preventDefault();
			copyDataInclude.current = null;
		}
	}, []);

	//@NOTE: handles both click and keydown explicitely because "click" is
	//		 also handled in containing element (Dropdown)  where
	//		 `preventDefault` is called on this event, hence stopping
	//		 the browser from triggering synthetic click on relevant keydowns
	const handleCopyToClipboardInteraction = useCallback(ev => {
		if(ev.type !== 'keydown' || (ev.key === 'Enter' || ev.key === ' ')) {
			copyToClipboard(output);
			setIsClipboardCopied(true);
			setTimeout(() => { setIsClipboardCopied(false); }, 1000);
		}
	}, [copyToClipboard, output]);

	const handleCopyHtmlClick = useCallback(() => {
		copy(output);
		setIsHtmlCopied(true);
		setTimeout(() => { setIsHtmlCopied(false); }, 1000);
	}, [output]);

	const handleDropdownToggle = useCallback(ev => {
		const isFromCopyTrigger = ev.target && ev.target.closest('.clipboard-trigger');
		if(isDropdownOpen && isFromCopyTrigger) {
			dropdownTimer.current = setTimeout(() => {
				setIsDropdownOpen(false);
			}, 950);
			return false;
		}
		clearTimeout(dropdownTimer.current);
		setIsDropdownOpen(!isDropdownOpen);
	}, [isDropdownOpen]);

	const handleRequestedActionChange = useCallback(newValue => setRequestedAction(newValue), []);

	const handleCreateClick = useCallback(() => {
		if(requestedAction === 'html') {
			copy(output);
		} else {
			copyToClipboard(output);
		}
		dispatch(toggleModal(BIBLIOGRAPHY, false));
		dispatch(triggerSelectMode(false, true));
	}, [output, copyToClipboard, dispatch, requestedAction]);

	const handleStyleChange = useCallback(async citationStyle => {
		if(citationStyle === 'install') {
			dispatch(toggleModal(BIBLIOGRAPHY, false));
			dispatch(toggleModal(STYLE_INSTALLER, true));
		} else {
			dispatch(preferenceChange('citationStyle', citationStyle));
		}
	}, [dispatch]);

	const handleLocaleChange = useCallback(locale => {
		dispatch(preferenceChange('citationLocale', locale));
	}, [dispatch]);

	const handleCancel = useCallback(async () => {
		dispatch(toggleModal(BIBLIOGRAPHY, false));
		setOutput('');
	}, [dispatch]);

	useEffect(() => {
		document.addEventListener('copy', handleCopy, true);
		return () => {
			document.removeEventListener('copy', handleCopy, true);
		}
	}, [handleCopy]);

	useEffect(() => {
		if(isOpen && (citationStyle !== prevCitationStyle || citationLocale !== prevCitationLocale)) {
			makeOutput();
		}
	}, [citationLocale, citationStyle, isOpen, makeOutput, prevCitationLocale, prevCitationStyle]);

	const className = cx({
		'bibliography-modal': true,
		'modal-xl modal-scrollable': !isTouchOrSmall,
		'modal-touch modal-form': isTouchOrSmall,
	});

	return (
		<Modal
			className={ className }
			contentLabel="Bibliography"
			isOpen={ isOpen }
			onRequestClose={ handleCancel }
			overlayClassName={ cx({ 'modal-centered modal-slide': isTouchOrSmall, 'modal-full-height': !isTouchOrSmall }) }
		>
			<div className="modal-header">
				{
					isTouchOrSmall ? (
						<React.Fragment>
							<div className="modal-header-left">
								<Button
									className="btn-link"
									onClick={ handleCancel }
								>
									Cancel
								</Button>
							</div>
							<div className="modal-header-center">
								<h4 className="modal-title truncate">
									{ outputMode === 'cite' ? 'Citations' : 'Bibliography'}
								</h4>
							</div>
							<div className="modal-header-right">
								<Button
									disabled={ isUpdating }
									className="btn-link"
									onClick={ handleCreateClick }
								>
									Create
								</Button>
							</div>
						</React.Fragment>
					) : (
						<React.Fragment>
							<h4 className="modal-title truncate">
								{ outputMode === 'cite' ? 'Citations' : 'Bibliography'}
							</h4>
							<Button
								icon
								className="close"
								onClick={ handleCancel }
							>
								<Icon type={ '16/close' } width="16" height="16" />
							</Button>
						</React.Fragment>
					)
				}
			</div>
			<div
				className={ cx(
					'modal-body',
					{ loading: !isTouchOrSmall && isUpdating }
				)}
				tabIndex={ !isTouchOrSmall ? 0 : null }
			>
				<div className="form">
					<div className="citation-options">
						<div className="form-row">
							<div className="col-9">
								<div className="form-group form-row style-selector-container">
									<label
										htmlFor={ styleSelectorId.current }
										className="col-form-label"
									>
										Citation Style
									</label>
									<div className="col">
										<StyleSelector
											id={ styleSelectorId.current }
											onStyleChange={ handleStyleChange }
											citationStyle={ citationStyle }
											citationStyles={ citationStyles }
										/>
									</div>
								</div>
							</div>
							<div className="col-3">
								<div className="form-group form-row language-selector-container">
									<label
										htmlFor={ localeSelectorId.current }
										className="col-form-label"
									>
										Language
									</label>
									<div className="col">
										<LocaleSelector
											id={ localeSelectorId.current }
											onLocaleChange={ handleLocaleChange }
											citationLocale={ citationLocale }
										/>
									</div>
								</div>
							</div>
						</div>
					</div>
					{ isTouchOrSmall && (
						<RadioSet
							onChange={ handleRequestedActionChange }
							options={[
								{ value: 'clipboard', label: 'Copy to Clipboard' },
								{ value: 'html', label: 'Copy HTML' },
							]}
							value={ requestedAction }
						/>
					)}
					{ !isTouchOrSmall && (
						<div className="bibliography-container">
							{ isUpdating ? (
								<Spinner className="large" />
								) : (
									<div className="bibliography read-only"
										dangerouslySetInnerHTML={ { __html: output } }
									/>
								)
							}
						</div>
					)}
				</div>
			</div>
			{ !isTouchOrSmall && (
				<div className="modal-footer justify-content-end">
					<Dropdown
						isOpen={ isDropdownOpen }
						toggle={ handleDropdownToggle }
						className={ cx('btn-group', { 'success': isClipboardCopied}) }
					>
						<Button
							type="button"
							disabled={ isUpdating }
							className='btn btn-lg btn-secondary copy-to-clipboard'
							onClick={ handleCopyToClipboardInteraction }
							onKeyDown={handleCopyToClipboardInteraction }
						>
							<span className={ cx('inline-feedback', { 'active': isClipboardCopied }) }>
								<span className="default-text" aria-hidden={ !isClipboardCopied }>
									Copy to Clipboard
								</span>
								<span className="shorter feedback" aria-hidden={ isClipboardCopied }>
									Copied!
								</span>
							</span>
						</Button>
						<DropdownToggle
							color={ null }
							disabled={ isUpdating }
							className="btn-lg btn-secondary dropdown-toggle"
						>
							<Icon type={ '16/chevron-9' } width="16" height="16" />
						</DropdownToggle>
						<DropdownMenu className="dropdown-menu">
							<DropdownItem
								onClick={ handleCopyHtmlClick }
								className="btn clipboard-trigger"
							>
								<span className={ cx('inline-feedback', { 'active': isHtmlCopied }) }>
									<span className="default-text" aria-hidden={ !isHtmlCopied }>
										Copy HTML
									</span>
									<span className="shorter feedback" aria-hidden={ isHtmlCopied }>
										Copied!
									</span>
								</span>
							</DropdownItem>
						</DropdownMenu>
					</Dropdown>
				</div>
			)}
		</Modal>
	);
}

export default memo(BibliographyModal);
