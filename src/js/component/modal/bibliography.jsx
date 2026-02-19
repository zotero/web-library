import { Button, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Icon, Spinner } from 'web-common/components';
import { Fragment, useCallback, useEffect, useRef, useState, memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { usePrevious } from 'web-common/hooks';
import copy from 'copy-to-clipboard';
import cx from 'classnames';

import { BIBLIOGRAPHY } from '../../constants/modals';
import { stripTagsUsingDOM } from '../../common/format';
import { toggleModal, fetchItemKeys, fetchCSLStyle, bibliographyFromItems, triggerSelectMode, fetchItemsByKeys } from '../../actions';
import CitationOptions from '../citation-options';
import Modal from '../ui/modal';
import RadioSet from '../form/radio-set';


const BibliographyModal = () => {
	const dispatch = useDispatch();
	const isTouchOrSmall = useSelector(state => state.device.isTouchOrSmall);
	const isOpen = useSelector(state => state.modal.id === BIBLIOGRAPHY);
	const citationStyle = useSelector(state => state.preferences.citationStyle);
	const citationLocale = useSelector(state => state.preferences.citationLocale);
	const collectionKey = useSelector(state => state.modal.collectionKey);
	const libraryKey = useSelector(state => state.modal.libraryKey);
	const requestsPending = useSelector(state => state.libraries[libraryKey]?.sync?.requestsPending);
	const itemKeys = useSelector(state => state.modal.itemKeys);
	const prevItemKeys = usePrevious(itemKeys);
	const itemsLookup = useSelector(state => state.libraries[libraryKey]?.dataObjects);
	const hasMissingItems = (itemKeys || []).some(key => !(key in itemsLookup));
	const hadMissingItems = usePrevious(hasMissingItems);

	const styleXml = useSelector(state => state.cite.styleXml);
	const prevStyleXml = usePrevious(styleXml);
	const isFetchingStyle = useSelector(state => state.cite.isFetchingStyle);

	const wasOpen = usePrevious(isOpen);
	const prevCitationStyle = usePrevious(citationStyle);
	const prevCitationLocale = usePrevious(citationLocale);

	const [isItemsReady, setIsItemsReady] = useState(!hasMissingItems && !collectionKey);
	const [requestedAction, setRequestedAction] = useState('clipboard');
	const [isClipboardCopied, setIsClipboardCopied] = useState(false);
	const [isHtmlCopied, setIsHtmlCopied] = useState(false);
	const [output, setOutput] = useState(null);
	const [isUpdating, setIsUpdating] = useState(false);
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const wasDropdownOpen = usePrevious(isDropdownOpen);

	const copyDataInclude = useRef(null);
	const dropdownTimer = useRef(null);

	const makeOutput = useCallback(async () => {
		if(!libraryKey || !itemKeys) {
			return;
		}

		try {
			setIsUpdating(true);
			setOutput(await dispatch(bibliographyFromItems(itemKeys, libraryKey)));
		} finally {
			setIsUpdating(false);
		}
	}, [dispatch, itemKeys, libraryKey]);

	const copyToClipboard = useCallback(bibliographyToCopy => {
		const bibliographyText = stripTagsUsingDOM(bibliographyToCopy);

		copyDataInclude.current = [
			{ mime: 'text/plain', data: bibliographyText },
			{ mime: 'text/html', data: bibliographyToCopy },
		];
		copy(bibliographyText);
	}, []);

	const handleCopy = useCallback(ev => {
		if (copyDataInclude.current) {
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
		if (ev.type !== 'keydown' || (ev.key === 'Enter' || ev.key === ' ')) {
			copyToClipboard(output);
			setIsClipboardCopied(true);
			setTimeout(() => { setIsClipboardCopied(false); }, 1000);
		}
	}, [copyToClipboard, output]);

	const handleCopyHtmlClick = useCallback(ev => {
		ev.preventDefault();
		copy(output);
		setIsHtmlCopied(true);
		dropdownTimer.current = setTimeout(() => {
			setIsDropdownOpen(false);
		}, 950);
		setTimeout(() => { setIsHtmlCopied(false) }, 1000);
	}, [output]);

	const handleDropdownToggle = useCallback(() => {
		clearTimeout(dropdownTimer.current);
		setIsDropdownOpen(!isDropdownOpen);
	}, [isDropdownOpen]);

	const handleRequestedActionChange = useCallback(newValue => setRequestedAction(newValue), []);

	const handleCreateClick = useCallback(() => {
		if (requestedAction === 'html') {
			copy(output);
		} else {
			copyToClipboard(output);
		}
		dispatch(toggleModal(BIBLIOGRAPHY, false, { itemKeys, libraryKey }));
		dispatch(triggerSelectMode(false, true));
	}, [requestedAction, dispatch, itemKeys, libraryKey, output, copyToClipboard]);

	const handleCancel = useCallback(async () => {
		dispatch(toggleModal(BIBLIOGRAPHY, false, { itemKeys, libraryKey }));
		setOutput('');
	}, [dispatch, itemKeys, libraryKey]);

	const handleBibliographyClick = useCallback(() => {
		dispatch(toggleModal(BIBLIOGRAPHY, false, { itemKeys, libraryKey }));
		dispatch(toggleModal('COPY_CITATION', true, { itemKeys, libraryKey }));
	}, [dispatch, itemKeys, libraryKey]);

	const fetchCollectionItemKeys = useCallback(async () => {
		const itemKeys = await dispatch(fetchItemKeys('ITEMS_IN_COLLECTION', libraryKey, { collectionKey }));
		dispatch(toggleModal(BIBLIOGRAPHY, true, { libraryKey, itemKeys }));
	}, [collectionKey, dispatch, libraryKey]);

	useEffect(() => {
		document.addEventListener('copy', handleCopy, true);
		return () => {
			document.removeEventListener('copy', handleCopy, true);
		}
	}, [handleCopy]);

	// regenerate bibliography when locale changes
	useEffect(() => {
		if (isItemsReady && styleXml && citationLocale !== prevCitationLocale && typeof prevCitationLocale !== 'undefined') {
			makeOutput();
		}
	}, [citationLocale, isItemsReady, makeOutput, prevCitationLocale, styleXml]);

	// fetch style when modal is first opened. This will trigger effect below that actually generates bibliography.
	useEffect(() => {
		if (!isFetchingStyle && styleXml === null) {
			dispatch(fetchCSLStyle(citationStyle));
		}
	}, [citationStyle, dispatch, isFetchingStyle, styleXml]);

	// regenerate bibliography when style changes.
	useEffect(() => {
		if (isItemsReady && styleXml && prevStyleXml !== styleXml && typeof prevStyleXml !== 'undefined') {
			makeOutput();
		}
	}, [citationStyle, isItemsReady, makeOutput, prevCitationStyle, prevStyleXml, styleXml]);

	// regenerate bibliography when modal re-opens with style already fetched
	useEffect(() => {
		if (isItemsReady && isOpen && !wasOpen && styleXml) {
			makeOutput();
		}
	}, [isOpen, makeOutput, styleXml, wasOpen, isItemsReady]);

	useEffect(() => {
		if (!isItemsReady && hasMissingItems && requestsPending === 0) {
			const missingKeys = itemKeys.filter(key => !(key in itemsLookup));
			dispatch(fetchItemsByKeys(missingKeys, {}, { current: { libraryKey } }));
		}
	}, [dispatch, hasMissingItems, isItemsReady, itemKeys, itemsLookup, libraryKey, requestsPending]);

	// regenerate bibliography when modal opens with some items initially missing and have been fetched
	useEffect(() => {
		if (hadMissingItems && !hasMissingItems) {
			setIsItemsReady(true);
			makeOutput();
		}
	}, [hadMissingItems, hasMissingItems, makeOutput]);

	useEffect(() => {
		if (!isDropdownOpen && wasDropdownOpen) {
			setIsHtmlCopied(false);
		}
	}, [isDropdownOpen, wasDropdownOpen]);

	useEffect(() => {
		if (collectionKey) {
			fetchCollectionItemKeys();
		}
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	useEffect(() => {
		if(itemKeys !== prevItemKeys) {
			const newIsItemsReady = !(itemKeys || []).some(key => !(key in itemsLookup));
			setIsItemsReady(newIsItemsReady);
			if(styleXml && newIsItemsReady) {
				makeOutput();
			}
		}
	}, [itemKeys, prevItemKeys, itemsLookup, makeOutput, styleXml]);

	const className = cx({
		'bibliography-modal': true,
		'modal-scrollable': !isTouchOrSmall,
		'modal-touch modal-form': isTouchOrSmall,
	});

	return (
		<Modal
			className={className}
			contentLabel={'Bibliography'}
			isBusy={!isItemsReady || !!collectionKey /* show only spinner if collectionKey is set, while we fetch keys and re-open modal with itemKeys set instead */ }
			isOpen={isOpen}
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
									Bibliography
								</h4>
							</div>
							<div className="modal-header-right">
								<Button
									disabled={isUpdating}
									className="btn-link"
									onClick={handleCreateClick}
								>
									Create
								</Button>
							</div>
						</Fragment>
					) : (
						<Fragment>
							<h4 className="modal-title truncate">
								Bibliography
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
			<div
				className={cx(
					'modal-body',
					{ loading: !isTouchOrSmall && isUpdating }
				)}
				tabIndex={!isTouchOrSmall ? 0 : null}
			>
				<div className="form">
					<CitationOptions />
					{isTouchOrSmall && (
						<RadioSet
							onChange={handleRequestedActionChange}
							options={[
								{ value: 'clipboard', label: 'Copy to Clipboard' },
								{ value: 'html', label: 'Copy HTML' },
							]}
							value={requestedAction}
						/>
					)}
				</div>
				{!isTouchOrSmall && (
					<div className="bibliography-container">
						{isUpdating ? (
							<Spinner className="large" />
						) : (
							<div className="bibliography read-only"
								dangerouslySetInnerHTML={{ __html: output }}
							/>
						)
						}
					</div>
				)}
			</div>
			{!isTouchOrSmall && (
				<div className="modal-footer">
					<div className="modal-footer-left">
						<Button onClick={handleBibliographyClick} className="btn btn-lg btn-default">
							Citations
						</Button>
					</div>
					<div className="modal-footer-right">
						<Dropdown
							isOpen={isDropdownOpen}
							onToggle={handleDropdownToggle}
							className={cx('btn-group', { 'success': isClipboardCopied })}
							placement="bottom-end"
						>
							<Button
								type="button"
								disabled={isUpdating}
								className='btn btn-lg btn-secondary copy-to-clipboard'
								onClick={handleCopyToClipboardInteraction}
								onKeyDown={handleCopyToClipboardInteraction}
							>
								<span className={cx('inline-feedback', { 'active': isClipboardCopied })}>
									<span className="default-text" aria-hidden={!isClipboardCopied}>
										Copy to Clipboard
									</span>
									<span className="shorter feedback" aria-hidden={isClipboardCopied}>
										Copied!
									</span>
								</span>
							</Button>
							<DropdownToggle
								disabled={isUpdating}
								className="btn-lg btn-secondary dropdown-toggle"
							>
								<Icon type={'16/chevron-9'} width="16" height="16" />
							</DropdownToggle>
							<DropdownMenu className="dropdown-menu">
								<DropdownItem
									onClick={handleCopyHtmlClick}
									className="btn clipboard-trigger"
								>
									<span className={cx('inline-feedback', { 'active': isHtmlCopied })}>
										<span className="default-text" aria-hidden={!isHtmlCopied}>
											Copy HTML
										</span>
										<span className="shorter feedback" aria-hidden={isHtmlCopied}>
											Copied!
										</span>
									</span>
								</DropdownItem>
							</DropdownMenu>
						</Dropdown>
					</div>
				</div>
			)}
		</Modal>
	);
}

export default memo(BibliographyModal);
