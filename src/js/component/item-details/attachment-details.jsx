import { memo, Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import PropTypes from 'prop-types';
import { Button, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Icon, Spinner } from 'web-common/components';
import { noop } from 'web-common/utils';
import { useFocusManager, useForceUpdate } from 'web-common/hooks';

import RichEditor from 'component/rich-editor';
import { isReaderCompatibleBrowser, get } from 'utils';
import { getAttachmentUrl, updateItem, exportAttachmentWithAnnotations } from 'actions';
import { makePath }from '../../common/navigation';
import { READER_CONTENT_TYPES } from '../../constants/reader';
import { extraFields } from '../../constants/item';
import Boxfields from './boxfields';

const AttachmentDetails = ({ attachmentKey, isReadOnly }) => {
	const dispatch = useDispatch();
	const timeoutRef = useRef(null);
	const shouldUseTabs = useSelector(state => state.device.shouldUseTabs);
	const attachment = useSelector(
		state => get(state, ['libraries', state.current.libraryKey, 'items', attachmentKey], {}),
		shallowEqual
	);
	const libraryKey = useSelector(state => state.current.libraryKey);
	const isFetchingUrl = useSelector(state => get(state, ['libraries', libraryKey, 'attachmentsUrl', attachmentKey, 'isFetching'], false));
	const url = useSelector(state => get(state, ['libraries', libraryKey, 'attachmentsUrl', attachmentKey, 'url']));
	const timestamp = useSelector(state => get(state, ['libraries', libraryKey, 'attachmentsUrl', attachmentKey, 'timestamp'], 0));
	const isPreppingPDF = useSelector(state => state.libraries[libraryKey]?.attachmentsExportPDF[attachmentKey]?.isFetching);
	const preppedPDFURL = useSelector(state => state.libraries[libraryKey]?.attachmentsExportPDF[attachmentKey]?.blobURL);
	const preppedPDFFileName = useSelector(state => state.libraries[libraryKey]?.attachmentsExportPDF[attachmentKey]?.fileName);
	const collectionKey = useSelector(state => state.current.collectionKey);
	const itemKey = useSelector(state => state.current.itemKey);
	const qmode = useSelector(state => state.current.qmode);
	const search = useSelector(state => state.current.search);
	const tags = useSelector(state => state.current.tags);
	const config = useSelector(state => state.config);
	const isTouchOrSmall = useSelector(state => state.device.isTouchOrSmall);
	const isStandaloneAttachment = attachmentKey === itemKey;
	const downloadOptionsRef = useRef(null);
	const openInReaderPath = makePath(config, {
		library: libraryKey,
		collection: collectionKey,
		items: isStandaloneAttachment ? [attachmentKey] : [itemKey],
		attachmentKey: isStandaloneAttachment ? null : attachmentKey,
		view: 'reader',
		qmode: qmode,
		search: search,
		tags: tags,
	});

	const isReaderCompatible = Object.keys(READER_CONTENT_TYPES).includes(attachment.contentType);
	const isPDF = attachment.contentType === 'application/pdf';
	const hasURL = !!attachment[Symbol.for('links')]?.enclosure;
	const urlIsFresh = url && Date.now() - timestamp < 60000;
	const forceRerender = useForceUpdate();
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const { focusNext, focusPrev, receiveFocus, receiveBlur } = useFocusManager(downloadOptionsRef);

	const itemTypeFields = useSelector(state => state.meta.itemTypeFields);
	const fields = [
		itemTypeFields.attachment.find(f => f.field === 'title'),
		...(attachment.url ? [itemTypeFields.attachment.find(f => f.field === 'url')] : []),
		...(attachment.filename && attachment.linkMode.startsWith('imported') ? [{ field: 'filename', localized: 'Filename' }] : []),
		...(itemTypeFields.attachment.filter(f => !['title', 'url', 'filename', 'accessDate'].includes(f.field))), // hide accessDate and fields already included
		extraFields.find(f => f.field === 'dateModified'),
	];

	const handleChangeNote = useCallback((newContent, key) => {
		dispatch(updateItem(key, { note: newContent }));
	}, [dispatch]);

	const handleExport = useCallback((ev) => {
		ev.currentTarget.blur();
		dispatch(exportAttachmentWithAnnotations(attachmentKey));
	}, [attachmentKey, dispatch]);

	const handleKeyDown = useCallback(ev => {
		if (ev.key === "ArrowLeft") {
			focusPrev(ev);
			setIsDropdownOpen(false);
		} else if (ev.key === "ArrowRight") {
			focusNext(ev);
			setIsDropdownOpen(false);
		}
	}, [focusNext, focusPrev]);

	const handleToggleDropdown = useCallback(() => {
		setIsDropdownOpen(state => !state);
	}, []);

	useEffect(() => {
		if(urlIsFresh) {
			const urlExpiresTimestamp = timestamp + 60000;
			const urlExpriesFromNow = urlExpiresTimestamp - Date.now();
			clearTimeout(timeoutRef.current);
			timeoutRef.current = setTimeout(forceRerender, urlExpriesFromNow);
		}
		return () => clearTimeout(timeoutRef.current); // eslint-disable-line react-hooks/exhaustive-deps
	}, [forceRerender, urlIsFresh, timestamp, attachmentKey, dispatch, isFetchingUrl]);

	useEffect(() => {
		if (!urlIsFresh && !isFetchingUrl && hasURL) {
			dispatch(getAttachmentUrl(attachmentKey));
		}
	}, [attachmentKey, isFetchingUrl, urlIsFresh, dispatch, hasURL]);

	return (
        <Fragment>
		<Boxfields
			fields={ fields }
			item={ attachment }
			isReadOnly={ isReadOnly }
		/>
		{ hasURL && (
			<div
				tabIndex={ isTouchOrSmall ? null : 0 }
				onBlur={ isTouchOrSmall ? noop : receiveBlur }
				onFocus={ isTouchOrSmall ? noop : receiveFocus }
				className="download-options"
				ref={ downloadOptionsRef }
			>
				{(isReaderCompatibleBrowser() && isReaderCompatible) && (
					<a
						className="btn btn-default"
						href={ openInReaderPath }
						rel="noreferrer"
						role="button"
						target="_blank"
						title="Open in Reader"
						tabIndex={ isTouchOrSmall ? null : -2 }
						onKeyDown={handleKeyDown }
					>
						Open
					</a>
				) }
				{(isReaderCompatibleBrowser() && isPDF) ? (
					<Dropdown
						isOpen={ isDropdownOpen }
						onToggle={ handleToggleDropdown }
						className="btn-group"
					>
						{ preppedPDFURL ? (
							<a
								className="btn btn-default export-pdf"
								download={ preppedPDFFileName }
								href={ preppedPDFURL }
								rel="noreferrer"
								role="button"
								tabIndex={ isTouchOrSmall ? null : -2 }
								title="Export attachment with annotations"
								onKeyDown={handleKeyDown}
							>
								Download
							</a>
						) : (
							<Button
								className='btn-default export-pdf'
								disabled={ isPreppingPDF }
								onClick={ handleExport }
								tabIndex={ isTouchOrSmall ? null : -2 }
								onKeyDown={handleKeyDown}
							>
								{isPreppingPDF ? <Fragment>&nbsp;<Spinner className="small" /></Fragment> : "Download" }
							</Button>
						) }
						<DropdownToggle
							className="btn-default btn-icon dropdown-toggle"
							tabIndex={ isTouchOrSmall ? null : -2 }
							onKeyDown={handleKeyDown}
							title="More Download Options"
						>
							<Icon type="16/chevron-9" className="touch" width="16" height="16" />
							<Icon type="16/chevron-7" className="mouse" width="16" height="16" />
						</DropdownToggle>
						<DropdownMenu>
							<DropdownItem
								className="btn"
								href={ url }
								rel="noreferrer"
								role="listitem"
								target="_blank"
								title="Download (no annotations)"
								tag="a"
							>
								Download (no annotations)
							</DropdownItem>
						</DropdownMenu>
					</Dropdown>
				) : (
					<a
						className="btn btn-default"
						disabled={!url}
						href={url}
						rel="noreferrer"
						role="button"
						tabIndex={isTouchOrSmall ? null : -2}
						target="_blank"
						title={ isReaderCompatible ? "Download (no annotations)" : "Download Attachment" }
						onKeyDown={handleKeyDown}
					>
						{ isReaderCompatible ? "Download (no annotations)" : "Download Attachment" }
					</a>
				) }
			</div>
		) }
		<RichEditor
			autoresize={ shouldUseTabs ? false : true }
			id={ attachment.key }
			isAttachmentNote={ true }
			isReadOnly={ isReadOnly }
			value={ attachment.note }
			onChange={ handleChangeNote }
		/>
		</Fragment>
    );
}

AttachmentDetails.propTypes = {
	attachmentKey: PropTypes.string.isRequired,
	isReadOnly: PropTypes.bool,
}

export default memo(AttachmentDetails);
