import cx from 'classnames';
import PropTypes from 'prop-types';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import CSSTransition from 'react-transition-group/cjs/CSSTransition';
import { NativeTypes } from 'react-dnd-html5-backend';
import { useDispatch, useSelector } from 'react-redux';
import { useDrag, useDrop } from 'react-dnd';

import AddLinkedUrlForm from './add-linked-url-form';
import AttachmentDetails from './attachment-details';
import Button from '../ui/button';
import Icon from '../ui/icon';
import Spinner from '../ui/spinner';
import { ADD_LINKED_URL_TOUCH } from '../../constants/modals';
import { ATTACHMENT } from '../../constants/dnd';
import { createAttachments, createAttachmentsFromDropped, moveToTrash, fetchChildItems, navigate,
sourceFile, tryGetAttachmentURL, toggleModal, updateItem } from '../../actions';
import { get, getScrollContainerPageCount, getUniqueId, openDelayedURL, stopPropagation, sortByKey,
noop } from '../../utils';
import { getFileData } from '../../common/event';
import { isTriggerEvent } from '../../common/event';
import { pluralize } from '../../common/format';
import { TabPane } from '../ui/tabs';
import { Toolbar, ToolGroup } from '../ui/toolbars';
import { makePath } from '../../common/navigation';
import { useForceUpdate, useFetchingState, useFocusManager, usePrevious } from '../../hooks';

const AttachmentIcon = memo(({ isActive, item, size }) => {
	const isTouchOrSmall = useSelector(state => state.device.isTouchOrSmall);
	const { iconName } = item[Symbol.for('derived')];
	const suffix = isTouchOrSmall ? 'active' : 'white';
	const symbol = isActive ? `${iconName}-${suffix}` : iconName;
	const dvp = window.devicePixelRatio >= 2 ? 2 : 1;
	const path = isTouchOrSmall ?
		`28/item-types/light/${iconName}` : `16/item-types/light/${dvp}x/${iconName}`;

	return <Icon type={ path } symbol={ symbol} width={ size } height={ size } />
});

AttachmentIcon.displayName = 'AttachmentIcon';

AttachmentIcon.propTypes = {
	isActive: PropTypes.bool,
	item: PropTypes.object.isRequired,
	size: PropTypes.string.isRequired,
};

const AttachmentActions = memo(props => {
	const { attachment, itemKey, isUploading } = props;
	const dispatch = useDispatch();
	const isTouchOrSmall = useSelector(state => state.device.isTouchOrSmall);
	const libraryKey = useSelector(state => state.current.libraryKey);
	const collectionKey = useSelector(state => state.current.collectionKey);
	const parentItemKey = useSelector(state => state.current.itemKey);
	const isFetchingUrl = useSelector(state => get(state, ['libraries', libraryKey, 'attachmentsUrl', itemKey, 'isFetching'], false));
	const url = useSelector(state => get(state, ['libraries', libraryKey, 'attachmentsUrl', itemKey, 'url']));
	const timestamp = useSelector(state => get(state, ['libraries', libraryKey, 'attachmentsUrl', itemKey, 'timestamp'], 0));
	const urlIsFresh = url && (Date.now() - timestamp) < 60000;
	const iconSize = isTouchOrSmall ? '24' : '16';
	const forceRerender = useForceUpdate();
	const timeout = useRef(null);
	const qmode = useSelector(state => state.current.qmode);
	const search = useSelector(state => state.current.search);
	const tags = useSelector(state => state.current.tags);
	const config = useSelector(state => state.config);

	const openInReaderPath = makePath(config, {
		library: libraryKey,
		collection: collectionKey,
		items: parentItemKey ? [parentItemKey] : null,
		attachmentKey: itemKey,
		view: 'reader',
		qmode: qmode,
		search: search,
		tags: tags,
	});

	const handleClick = useCallback(ev => {
		const { key } = ev.currentTarget.closest('[data-key]').dataset;

		ev.stopPropagation();
		ev.preventDefault();

		if(isFetchingUrl) {
			return;
		}

		openDelayedURL(dispatch(tryGetAttachmentURL(key)));
	}, [dispatch, isFetchingUrl]);

	const handleOpenInReader = useCallback(ev => {
		ev.preventDefault();
		const { key } = ev.currentTarget.closest('[data-key]').dataset;
		dispatch(navigate({ attachmentKey: key, noteKey: null, view: 'reader' }));
	}, [dispatch])

	useEffect(() => {
		if(urlIsFresh) {
			const urlExpiresTimestamp = timestamp + 60000;
			const urlExpriesFromNow = urlExpiresTimestamp - Date.now();
			clearTimeout(timeout.current);
			timeout.current = setTimeout(forceRerender, urlExpriesFromNow);
			return () => clearTimeout(timeout.current);
		}
	}, [forceRerender, url, timestamp]);

	return (
		attachment.linkMode.startsWith('imported') && attachment[Symbol.for('links')].enclosure && !isUploading ? (
			<React.Fragment>
				<a
					className="btn btn-icon"
					href={ openInReaderPath }
					onClick={ handleOpenInReader }
					role="button"
					tabIndex={ -3 }
					title="Open in Reader"
				>
					<Icon type={ `${iconSize}/reader` } width={ iconSize } height={ iconSize } />
				</a>
				{ urlIsFresh ? (
				<a
					className="btn btn-icon"
					href={ url }
					onClick={ stopPropagation }
					rel="noreferrer"
					role="button"
					tabIndex={ -3 }
					target="_blank"
					title="Download attachment"
				>
					<Icon type={ `${iconSize}/open-link` } width={ iconSize } height={ iconSize } />
				</a>
				) : (
				<a
					className="btn btn-icon"
					onClick={ handleClick }
					role="button"
					tabIndex={ -3 }
					title="Download attachment"
				>
					<Icon type={ `${iconSize}/open-link` } width={ iconSize } height={ iconSize } />
				</a>
				)}
			</React.Fragment>
		) : attachment.linkMode === 'linked_url' ? (
			<a
				title="Download attachment"
				className="btn btn-icon"
				href={ attachment.url }
				onClick={ stopPropagation }
				rel="nofollow noopener noreferrer"
				role="button"
				tabIndex={ -3 }
				target="_blank"
			>
				<Icon type={ `${iconSize}/open-link` } width={ iconSize } height={ iconSize } />
			</a>
		) : null
	);
});

AttachmentActions.displayName = 'AttachmentDownloadIcon';

AttachmentActions.propTypes = {
	attachment: PropTypes.object,
	itemKey: PropTypes.string,
	isUploading: PropTypes.bool,
};

const Attachment = memo(props => {
	const { attachment, focusBySelector, itemKey, isReadOnly, isUploading, onKeyDown } = props;
	const dispatch = useDispatch();

	const libraryKey = useSelector(state => state.current.libraryKey);
	const attachmentKey = useSelector(state => state.current.attachmentKey);
	const isTouchOrSmall = useSelector(state => state.device.isTouchOrSmall);

	const [isFocused, setIsFocused] = useState(false);
	const [_, drag] = useDrag({ // eslint-disable-line no-unused-vars
		type: ATTACHMENT,
		item: { itemKey, libraryKey },
		end: (item, monitor) => {
			const dropResult = monitor.getDropResult();
			if(dropResult) {
				const patch = dropResult.item ?
					{ parentItem: dropResult.item } : dropResult.collection ?
						{ parentItem: false, collections: [dropResult.collection] } :
						{ parentItem: false, collections: [] };
				dispatch(updateItem(itemKey, patch));
			}
		}
	});
	const id = useRef(getUniqueId('attachment-'));
	const iconSize = isTouchOrSmall ? '28' : '16';
	const isSelected = attachmentKey === attachment.key;
	const isFile = attachment.linkMode.startsWith('imported') &&
		attachment[Symbol.for('links')].enclosure;
	const isLink = attachment.linkMode === 'linked_url';
	const hasLink = isFile || isLink;

	const handleDelete = useCallback(ev => {
		ev.stopPropagation();
		dispatch(moveToTrash([attachment.key]));
		if(attachmentKey === attachment.key) {
			dispatch(navigate({ attachmentKey: null, noteKey: null }));
		}
		focusBySelector(`.attachment:first-child:not([data-key="${attachment.key}"]), .attachment:nth-child(2)`);
	}, [attachment, attachmentKey, focusBySelector, dispatch]);

	const handleKeyDown = useCallback(ev => onKeyDown(ev), [onKeyDown]);

	const handleAttachmentSelect = useCallback(() => {
		focusBySelector(`[data-key="${attachment.key}"]`);
		dispatch(navigate({ attachmentKey: attachment.key, noteKey: null }));
	}, [dispatch, focusBySelector, attachment]);

	const handleFocus = useCallback(ev => {
		if(ev.target !== ev.currentTarget) {
			return;
		}
		if(isTouchOrSmall) {
			return;
		}
		dispatch(navigate({ attachmentKey: attachment.key, noteKey: null }));
		setIsFocused(true);
	}, [dispatch, attachment, isTouchOrSmall]);

	const handleBlur = useCallback(() => {
		if(isTouchOrSmall) {
			return;
		}
		setIsFocused(false);
	}, [isTouchOrSmall]);

	return drag(
		<li
			aria-labelledby={ id.current }
			className={ cx('attachment', { 'selected': isSelected, 'no-link': !hasLink }) }
			data-key={ attachment.key }
			onBlur={ handleBlur }
			onClick={ handleAttachmentSelect }
			onFocus={ handleFocus }
			onKeyDown={ handleKeyDown }
			role="listitem"
			tabIndex={ -2 }
		>
			{ (isTouchOrSmall && !isReadOnly) && (
				<Button
					title="Delete attachment"
					className="btn-circle btn-primary"
					onClick={ handleDelete }
					tabIndex={ -1 }

				>
					<Icon type="16/minus-strong" width="16" height="16" />
				</Button>
			) }
			<AttachmentIcon
				item={ attachment }
				size={ iconSize }
				isActive={ isFocused && isSelected }
			/>
			<div className="truncate" id={ id.current }>
				{ attachment.title ||
					(attachment.linkMode === 'linked_url' ? attachment.url : attachment.filename)
				}
			</div>
			{ isUploading && <Spinner className="small" /> }
			<AttachmentActions
				itemKey={ itemKey }
				attachment={ attachment }
				isUploading={ isUploading }
			/>

			{ (!isTouchOrSmall && !isReadOnly) && (
				<Button
					aria-label="delete attachment"
					icon
					onClick={ handleDelete }
					tabIndex={ -3 }
				>
					<Icon type={ '16/minus-circle' } width="16" height="16" />
				</Button>
			)}
		</li>
	);
});

Attachment.propTypes = {
	attachment: PropTypes.object,
	focusBySelector: PropTypes.func.isRequired,
	isReadOnly: PropTypes.bool,
	isUploading: PropTypes.bool,
	itemKey: PropTypes.string,
	onKeyDown: PropTypes.func.isRequired,
};

Attachment.displayName = 'Attachment';

const AttachmentDetailsWrap = memo(({ isReadOnly }) => {
	const attachmentKey = useSelector(state => state.current.attachmentKey);

	if(attachmentKey) {
		return (
			<div className="attachment-details">
				<AttachmentDetails
					isReadOnly={ isReadOnly }
					attachmentKey={ attachmentKey }
				/>
			</div>
		);
	} else {
		return (
			<div className="attachment-details no-selection">
				<div className="placeholder">No attachment selected</div>
			</div>
		);
	}
});

AttachmentDetailsWrap.displayName = 'AttachmentDetailsWrap';

const PAGE_SIZE = 100;

const Attachments = ({ isActive, isReadOnly }) => {
	const dispatch = useDispatch();

	const libraryKey = useSelector(state => state.current.libraryKey);
	const itemKey = useSelector(state => state.current.itemKey);
	const { isFetching, isFetched, pointer, keys } = useFetchingState(
		['libraries', libraryKey, 'itemsByParent', itemKey]
	);
	const attachmentKey = useSelector(state => state.current.attachmentKey);
	const prevAttachmentKey = usePrevious(attachmentKey);

	const allItems = useSelector(state => state.libraries[libraryKey].items);
	const uploads = useSelector(state => get(state, ['libraries', libraryKey, 'updating', 'uploads'], []));
	const shouldUseTabs = useSelector(state => state.device.shouldUseTabs);
	const isTouchOrSmall = useSelector(state => state.device.isTouchOrSmall);
	const isTinymceFetching = useSelector(state => state.sources.fetching.includes('tinymce'));
	const isTinymceFetched = useSelector(state => state.sources.fetched.includes('tinymce'));
	const itemsSource = useSelector(state => state.current.itemsSource);
	const isFileUploadAllowedInLibrary = useSelector(
		state => (state.config.libraries.find(
			l => l.key === state.current.libraryKey
		) || {}).isFileUploadAllowed
	);
	const isFileUploadAllowed = isFileUploadAllowedInLibrary && !['trash', 'publications'].includes(itemsSource);

	const isReady = !shouldUseTabs || (shouldUseTabs && isFetched && isTinymceFetched);

	const attachments = (isReady && keys ? keys : [])
		.map(childItemKey => allItems[childItemKey])
		.filter(item => !item.deleted && item.itemType === 'attachment');

	sortByKey(attachments, a => a.title || a.fileName)

	const scrollContainerRef = useRef(null);
	const { focusNext, focusPrev, focusDrillDownNext, focusDrillDownPrev, receiveFocus,
		receiveBlur, resetLastFocused, focusBySelector } = useFocusManager(
			scrollContainerRef, '.attachment.selected', false
		);

	const fileInput = useRef(null);
	const addLinkedUrlButtonRef = useRef(null);
	const [isAddingLinkedUrl, setIsAddingLinkedUrl] = useState(false);

	const [{ isOver, canDrop }, drop] = useDrop({
		accept: NativeTypes.FILE,
		canDrop: () => isFileUploadAllowed,
		collect: monitor => ({
			isOver: monitor.isOver({ shallow: true }),
			canDrop: monitor.canDrop(),
		}),
		drop: async item => {
			if (isFileUploadAllowed && item.files && item.files.length) {
				dispatch(createAttachmentsFromDropped(item.files, { parentItem: itemKey }));
			}
		},
	});

	const handleFileInputChange = useCallback(async ev => {
		const fileData = await getFileData(ev.currentTarget.files[0]);
		dispatch(createAttachments([fileData], { parentItem: itemKey }));
	}, [dispatch, itemKey]);

	const handleKeyDown = useCallback(ev => {
		if(ev.key === "ArrowLeft") {
			focusDrillDownPrev(ev);
		} else if(ev.key === "ArrowRight") {
			focusDrillDownNext(ev);
		} else if(ev.key === 'ArrowDown') {
			ev.target === ev.currentTarget && focusNext(ev);
		} else if(ev.key === 'ArrowUp') {
			ev.target === ev.currentTarget && focusPrev(ev, { targetEnd: fileInput.current });
		} else if(ev.key === 'Home') {
			fileInput.current.focus();
			ev.preventDefault();
		} else if(ev.key === 'End') {
			focusBySelector('.attachment:last-child');
			ev.preventDefault();
		} else if(ev.key === 'PageDown' && scrollContainerRef.current) {
			const containerEl = scrollContainerRef.current;
			const itemEl = containerEl.querySelector('.attachment');
			focusNext(ev, { offset: getScrollContainerPageCount(itemEl, containerEl) });
			ev.preventDefault();
		} else if(ev.key === 'PageUp' && scrollContainerRef.current) {
			const containerEl = scrollContainerRef.current;
			const itemEl = containerEl.querySelector('.attachment');
			focusPrev(ev, { offset: getScrollContainerPageCount(itemEl, containerEl) });
			ev.preventDefault();
		} else if(ev.key === 'Tab') {
			const isFileInput = ev.currentTarget === fileInput.current;
			const isShift = ev.getModifierState('Shift');
			if(isFileInput && !isShift) {
				ev.target === ev.currentTarget && focusNext(ev);
			}
		} else if(isTriggerEvent(ev)) {
			ev.target.click();
			ev.preventDefault();
		}
	}, [focusBySelector, focusNext, focusDrillDownNext, focusDrillDownPrev, focusPrev]);

	const handleFileInputKeyDown = useCallback(ev => {
		if(ev.key === 'ArrowLeft' || ev.key === 'ArrowRight') {
			ev.currentTarget === fileInput.current ?
				addLinkedUrlButtonRef.current.focus() :
				fileInput.current.focus();
		} else if(ev.key === 'ArrowDown') {
			scrollContainerRef.current.focus();
			ev.preventDefault();
		} else if(ev.key === 'End') {
			focusBySelector('.attachment:last-child');
			ev.preventDefault();
		}
	}, [focusBySelector]);

	const handleAddLinkedUrlTouchClick = useCallback(ev => {
		dispatch(toggleModal(ADD_LINKED_URL_TOUCH, true));
	}, [dispatch]);

	const handleLinkedFileClick = useCallback(ev => {
		setIsAddingLinkedUrl(true);
	}, []);

	const handleLinkedFileCancel = useCallback(ev => {
		setIsAddingLinkedUrl(false);
	}, []);

	useEffect(() => {
		if(isActive && !isFetching && !isFetched) {
			const start = pointer || 0;
			const limit = PAGE_SIZE;
			dispatch(fetchChildItems(itemKey, { start, limit }));
		}
	}, [dispatch, itemKey, isActive, isFetching, isFetched, pointer]);

	useEffect(() => {
		if(!isTinymceFetched && !isTinymceFetching) {
			dispatch(sourceFile('tinymce'));
		}
	}, [dispatch, isTinymceFetching, isTinymceFetched]);

	return (
		<TabPane
			className={ cx("attachments", { 'dnd-target': canDrop && isOver }) }
			isActive={ isActive }
			isLoading={ !isReady }
			ref={ drop }
		>
			<CSSTransition
				classNames="slide-down"
				enter={ !isTouchOrSmall }
				exit={ !isTouchOrSmall }
				in={ !isTouchOrSmall && isAddingLinkedUrl }
				mountOnEnter
				timeout={ 500 }
				unmountOnExit
			>
				<AddLinkedUrlForm onClose={ handleLinkedFileCancel } />
			</CSSTransition>
			<h5 className="h2 tab-pane-heading hidden-mouse">Attachments</h5>
			{ !isTouchOrSmall && (
				<Toolbar>
					<div className="toolbar-left">
						<div className="counter">
							{ `${attachments.length} ${pluralize('attachment', attachments.length)}` }
						</div>
						{ !isReadOnly && (
						<ToolGroup tabIndex>
							<div className="btn-file">
								<input
									disabled={ isReadOnly || isAddingLinkedUrl || !isFileUploadAllowed }
									className="add-attachment toolbar-focusable"
									onChange={ handleFileInputChange }
									onKeyDown={ handleFileInputKeyDown }
									ref={ fileInput }
									tabIndex={ 0 }
									type="file"
								/>
								<Button
									disabled={ isReadOnly || isAddingLinkedUrl || !isFileUploadAllowed }
									className="btn-default"
									tabIndex={ -1 }
								>
									Add File
								</Button>
							</div>
							<Button
								className="btn-default toolbar-focusable"
								disabled={ isReadOnly }
								onClick={ handleLinkedFileClick }
								onKeyDown={ handleFileInputKeyDown }
								tabIndex={ -3 }
								ref={ addLinkedUrlButtonRef }
							>
								Add Linked URL
							</Button>
						</ToolGroup>
						) }
					</div>
				</Toolbar>
			) }
			<div
				aria-label="attachments list"
				className="scroll-container-mouse"
				onBlur={ isTouchOrSmall ? noop : receiveBlur }
				onFocus={ isTouchOrSmall ? noop : receiveFocus }
				ref={ scrollContainerRef }
				role="list"
				tabIndex={ 0 }
			>
				{ attachments.length > 0 && (
					<nav>
						<ul className="details-list attachment-list">
							{
								attachments.map(attachment => {
									const isUploading = uploads.includes(attachment.key);
									return <Attachment
										attachment={ attachment }
										isReadOnly={ isReadOnly }
										isUploading={ isUploading }
										itemKey={ attachment.key }
										key={ attachment.key }
										libraryKey={ libraryKey }
										onKeyDown={ handleKeyDown }
										focusBySelector={ focusBySelector }
									/>
								})
							}
						</ul>
					</nav>
				) }
				{ isTouchOrSmall && !isReadOnly && (
					<React.Fragment>
						{ isFileUploadAllowed && (
						<div className="btn-file">
							<input
								onChange={ handleFileInputChange }
								type="file"
							/>
							<Button
								className="btn-block text-left hairline-top hairline-start-icon-28 btn-transparent-secondary"
								tabIndex={ -1 }
							>
								<Icon type={ '24/plus-circle-strong' } width="24" height="24" />
								Add File Attachment
							</Button>
						</div>
						)}
						<Button
							onClick={ handleAddLinkedUrlTouchClick }
							className="btn-block text-left hairline-top hairline-start-icon-28 btn-transparent-secondary"
							tabIndex={ -1 }
						>
							<Icon type={ '24/plus-circle-strong' } width="24" height="24" />
							Add Linked URL
						</Button>
					</React.Fragment>
				)}
			</div>
			{
				(!isTouchOrSmall && attachments.length > 0) && (
					<AttachmentDetailsWrap isReadOnly={ isReadOnly } />
				)
			}
		</TabPane>
	);
};

Attachments.propTypes = {
	isReadOnly: PropTypes.bool,
	isActive: PropTypes.bool,
};

export default memo(Attachments);
