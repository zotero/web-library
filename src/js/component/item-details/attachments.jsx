import cx from 'classnames';
import PropTypes from 'prop-types';
import React, { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NativeTypes } from 'react-dnd-html5-backend';
import { useDrag, useDrop } from 'react-dnd';
import { CSSTransition } from 'react-transition-group';

import Button from '../ui/button';
import Icon from '../ui/icon';
import Spinner from '../ui/spinner';
import withDevice from '../../enhancers/with-device';
import withEditMode from '../../enhancers/with-edit-mode';
import { ATTACHMENT } from '../../constants/dnd';
import { getFileData } from '../../common/event';
import { isTriggerEvent } from '../../common/event';
import { getScrollContainerPageCount, getUniqueId, openAttachment, stopPropagation, sortByKey } from '../../utils';
import { pick } from '../../common/immutable';
import { TabPane } from '../ui/tabs';
import { Toolbar, ToolGroup } from '../ui/toolbars';
import { createLinkedUrlAttachments, navigate, sourceFile, updateItem } from '../../actions';
import { pluralize } from '../../common/format';
import AttachmentDetails from './attachment-details';
import { useFocusManager } from '../../hooks';
import Input from '../form/input';

const AttachmentIcon = ({ device, isActive, item, size }) => {
	const { iconName } = item[Symbol.for('derived')];
	const suffix = device.isTouchOrSmall ? 'active' : 'white';
	const symbol = isActive ? `${iconName}-${suffix}` : iconName;
	const dvp = window.devicePixelRatio >= 2 ? 2 : 1;
	const path = device.isTouchOrSmall ?
		`28/item-types/light/${iconName}` : `16/item-types/light/${dvp}x/${iconName}`;

	return <Icon type={ path } symbol={ symbol} width={ size } height={ size } />
};

AttachmentIcon.propTypes = {
	device: PropTypes.object.isRequired,
	isActive: PropTypes.bool,
	item: PropTypes.object.isRequired,
	size: PropTypes.string.isRequired,
};

const AttachmentDownloadIcon = props => {
	const { attachment, device, isUploading, getAttachmentUrl } = props;
	const iconSize = device.isTouchOrSmall ? '24' : '16';

	const handleLinkInteraction = useCallback(ev => {
		const { key } = ev.currentTarget.closest('[data-key]').dataset;
		if(isTriggerEvent(ev) || (ev.type === 'mousedown' && ev.button === 1)) {
			ev.stopPropagation();
			ev.preventDefault();
			openAttachment(key, getAttachmentUrl, true);
		}
	});

	return (
		attachment.linkMode.startsWith('imported') && attachment[Symbol.for('links')].enclosure && !isUploading ? (
			<a
				aria-label="download attachment"
				className="btn btn-icon"
				onClick={ handleLinkInteraction }
				onKeyDown={ handleLinkInteraction }
				onMouseDown={ handleLinkInteraction }
				role="button"
				tabIndex={ -3 }
			>
				<Icon type={ `${iconSize}/open-link` } width={ iconSize } height={ iconSize } />
			</a>
		) : attachment.linkMode === 'linked_url' ? (
			<a
				aria-label="download attachment"
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
};

AttachmentDownloadIcon.propTypes = {
	attachment: PropTypes.object,
	device: PropTypes.object.isRequired,
	getAttachmentUrl: PropTypes.func.isRequired,
	isUploading: PropTypes.bool,
};

const Attachment = forwardRef((props, ref) => {
	const { attachment, device, moveToTrash, itemKey, isReadOnly, isUploading, libraryKey,
		getAttachmentUrl, onKeyDown } = props;
	const attachmentKey = useSelector(state => state.current.attachmentKey);
	const dispatch = useDispatch();
	const [isFocused, setIsFocused] = useState(false);
	const [_, drag] = useDrag({ // eslint-disable-line no-unused-vars
		item: { type: ATTACHMENT, itemKey, libraryKey },
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
	const iconSize = device.isTouchOrSmall ? '28' : '16';
	const isSelected = attachmentKey === attachment.key;
	const isFile = attachment.linkMode.startsWith('imported') &&
		attachment[Symbol.for('links')].enclosure;
	const isLink = attachment.linkMode === 'linked_url';
	const hasLink = isFile || isLink;

	const handleDelete = useCallback(() => {
		moveToTrash([attachment.key]);
	});

	const handleKeyDown = useCallback(ev => onKeyDown(ev));

	const handleAttachmentSelect = useCallback(() => {
		dispatch(navigate({ attachmentKey: attachment.key }));
	});

	const handleFocus = useCallback(ev => {
		if(ev.target !== ev.currentTarget) {
			return;
		}

		dispatch(navigate({ attachmentKey: attachment.key }));
		setIsFocused(true);
	});

	const handleBlur = useCallback(() => {
		setIsFocused(false);
	});

	drag(ref);

	return (
		<li
			aria-labelledby={ id.current }
			className={ cx('attachment', { 'selected': isSelected, 'no-link': !hasLink }) }
			data-key={ attachment.key }
			onBlur={ handleBlur }
			onClick={ handleAttachmentSelect }
			onFocus={ handleFocus }
			onKeyDown={ handleKeyDown }
			ref={ ref }
			role="listitem"
			tabIndex={ -2 }
		>
			{ (device.isTouchOrSmall && !isReadOnly) && (
			<Button
					aria-label="delete attachment"
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
				device={ device }
				isActive={ isFocused && isSelected }
			/>
			<div className="truncate" id={ id.current }>
				{ attachment.title ||
					(attachment.linkMode === 'linked_url' ? attachment.url : attachment.filename)
				}
			</div>
			{ isUploading && <Spinner className="small" /> }
			<AttachmentDownloadIcon
				attachment={ attachment }
				device={ device }
				isUploading={ isUploading }
				getAttachmentUrl={ getAttachmentUrl }
			/>

			{ (!device.isTouchOrSmall && !isReadOnly) && (
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
	device: PropTypes.object.isRequired,
	getAttachmentUrl: PropTypes.func.isRequired,
	isReadOnly: PropTypes.bool,
	isUploading: PropTypes.bool,
	itemKey: PropTypes.string,
	libraryKey: PropTypes.string,
	moveToTrash: PropTypes.func,
	onKeyDown: PropTypes.func.isRequired,
};

const AttachmentDetailsWrap = ({ isReadOnly }) => {
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
};

const PAGE_SIZE = 100;

const AddLinkedUrlForm = ({ onClose }) => {
	const dispatch = useDispatch();
	const itemKey = useSelector(state => state.current.itemKey);
	const [isBusy, setBusy] = useState(false);
	const [url, setUrl] = useState('');
	const [title, setTitle] = useState('');

	const handleLinkedFileConfirmClick = useCallback(async () => {
		setBusy(true);
		await dispatch(createLinkedUrlAttachments({ url, title }, { parentItem: itemKey }));
		setBusy(false);
		onClose();
	});

	const handleUrlChange = useCallback(newValue => setUrl(newValue));
	const handleTitleChange = useCallback(newValue => setTitle(newValue));

	return (
		<div className="add-linked-url form">
			<div className="form-group form-row">
				<label className="col-form-label" htmlFor="linked-url-form-url">Link</label>
				<div className="col">
					<Input
						autoFocus
						id="linked-url-form-url"
						onChange={ handleUrlChange }
						placeholder="Enter or paste URL"
						tabIndex={ 0 }
						value={ url }
					/>
				</div>
			</div>
			<div className="form-group form-row">
				<label className="col-form-label" htmlFor="linked-url-form-title">Title</label>
				<div className="col">
					<Input
						id="linked-url-form-title"
						onChange={ handleTitleChange }
						placeholder="(Optional)"
						tabIndex={ 0 }
						value={ title }
					/>
				</div>
			</div>
			<Toolbar>
				<div className="toolbar-right">
					{isBusy ? <Spinner className="small" /> : (
					<React.Fragment>
						<Button
							onClick={ onClose }
							className="btn-default"
							tabIndex={ 0 }
						>
							Cancel
						</Button>
						<Button
							onClick={ handleLinkedFileConfirmClick }
							className="btn-default"
							tabIndex={ 0 }
						>
							Add
						</Button>
					</React.Fragment>
					)}
				</div>
			</Toolbar>
		</div>
	);
}

AddLinkedUrlForm.propTypes = {
	onClose: PropTypes.func.isRequired
}

//@TODO: migrate to non-container component
const Attachments = props => {
	const { childItems, createAttachmentsFromDropped, device, isFetched, isFetching, isReadOnly,
	itemKey, createItem, uploadAttachment, fetchChildItems, fetchItemTemplate, uploads, isActive,
	libraryKey, pointer, ...rest } = props;
	const dispatch = useDispatch();
	const scrollContainerRef = useRef(null);
	const selectedAttachmentRef = useRef(null);
	const { handleNext, handlePrevious, handleDrillDownNext, handleDrillDownPrev, handleFocus,
		handleBlur, handleBySelector } = useFocusManager(
			scrollContainerRef, { overrideFocusRef: selectedAttachmentRef, isCarousel: false }
		);

	const fileInput = useRef(null);
	const [attachments, setAttachments] = useState([]);
	const [isAddingLinkedUrl, setIsAddingLinkedUrl] = useState(false);

	const isTinymceFetching = useSelector(state => state.sources.fetching.includes('tinymce'));
	const isTinymceFetched = useSelector(state => state.sources.fetched.includes('tinymce'));
	const selectedAttachmentKey = useSelector(state => state.current.attachmentKey);

	const [{ isOver, canDrop }, drop] = useDrop({
		accept: NativeTypes.FILE,
		collect: monitor => ({
			isOver: monitor.isOver({ shallow: true }),
			canDrop: monitor.canDrop(),
		}),
		drop: async item => {
			if(item.files && item.files.length) {
				createAttachmentsFromDropped(item.files, { parentItem: itemKey });
			}
		},
	});

	useEffect(() => {
		if(isActive && !isFetching && !isFetched) {
			const start = pointer || 0;
			const limit = PAGE_SIZE;
			fetchChildItems(itemKey, { start, limit });
		}
	}, [isActive, isFetching, isFetched, childItems]);

	useEffect(() => {
		const attachments = childItems.filter(i => i.itemType === 'attachment');
		sortByKey(attachments, a => a.title || a.fileName)
		setAttachments(attachments);
	}, [childItems]);

	useEffect(() => {
		if(!isTinymceFetched && !isTinymceFetching) {
			dispatch(sourceFile('tinymce'));
		}
	}, []);

	const handleFileInputChange = useCallback(async ev => {
		const fileDataPromise = getFileData(ev.currentTarget.files[0]);
		const attachmentTemplatePromise = fetchItemTemplate(
			'attachment', { linkMode: 'imported_file' }
		);
		const [fileData, attachmentTemplate] = await Promise.all(
			[fileDataPromise, attachmentTemplatePromise]
		);

		const attachment = {
			...attachmentTemplate,
			parentItem: itemKey,
			filename: fileData.fileName,
			title: fileData.fileName,
			contentType: fileData.contentType
		};
		const item = await createItem(attachment, libraryKey);
		await uploadAttachment(item.key, fileData);
	});

	const handleKeyDown = useCallback(ev => {
		if(ev.key === "ArrowLeft") {
			handleDrillDownPrev(ev);
		} else if(ev.key === "ArrowRight") {
			handleDrillDownNext(ev);
		} else if(ev.key === 'ArrowDown') {
			ev.target === ev.currentTarget && handleNext(ev);
		} else if(ev.key === 'ArrowUp') {
			ev.target === ev.currentTarget && handlePrevious(ev, { targetEnd: fileInput.current });
		} else if(ev.key === 'Home') {
			fileInput.current.focus();
			ev.preventDefault();
		} else if(ev.key === 'End') {
			handleBySelector('.attachment:last-child');
			ev.preventDefault();
		} else if(ev.key === 'PageDown' && scrollContainerRef.current) {
			const containerEl = scrollContainerRef.current;
			const itemEl = containerEl.querySelector('.attachment');
			handleNext(ev, { offset: getScrollContainerPageCount(itemEl, containerEl) });
			ev.preventDefault();
		} else if(ev.key === 'PageUp' && scrollContainerRef.current) {
			const containerEl = scrollContainerRef.current;
			const itemEl = containerEl.querySelector('.attachment');
			handlePrevious(ev, { offset: getScrollContainerPageCount(itemEl, containerEl) });
			ev.preventDefault();
		} else if(ev.key === 'Tab') {
			const isFileInput = ev.currentTarget === fileInput.current;
			const isShift = ev.getModifierState('Shift');
			if(isFileInput && !isShift) {
				ev.target === ev.currentTarget && handleNext(ev);
			}
		} else if(isTriggerEvent(ev)) {
			ev.target.click();
			ev.preventDefault();
		}
	});

	const handleFileInputKeyDown = useCallback(ev => {
		if(ev.key === 'ArrowDown') {
			scrollContainerRef.current.focus();
			ev.preventDefault();
		} else if(ev.key === 'End') {
			handleBySelector('.attachment:last-child');
			ev.preventDefault();
		}
	});

	const handleLinkedFileClick = useCallback(ev => {
		setIsAddingLinkedUrl(true);
	});

	const handleLinkedFileCancel = useCallback(ev => {
		setIsAddingLinkedUrl(false);
	});

	return (
		<TabPane
			className={ cx("attachments", { 'dnd-target': canDrop && isOver }) }
			isActive={ isActive }
			isLoading={ device.shouldUseTabs && !(isFetched && isTinymceFetched) }
			ref={ drop }
		>
			<CSSTransition
				in={ isAddingLinkedUrl }
				timeout={ 500 }
				classNames="slide-down"
				mountOnEnter
				unmountOnExit
			>
				<AddLinkedUrlForm onClose={ handleLinkedFileCancel } />
			</CSSTransition>
			<h5 className="h2 tab-pane-heading hidden-mouse">Attachments</h5>
			{ !device.isTouchOrSmall && (
				<Toolbar>
					<div className="toolbar-left">
						<div className="counter">
							{ `${attachments.length} ${pluralize('attachment', attachments.length)}` }
						</div>
						{ !isReadOnly && (
						<ToolGroup>
							<div className="btn-file">
								<input
									disabled={ isReadOnly || isAddingLinkedUrl }
									className="add-attachment"
									onChange={ handleFileInputChange }
									onKeyDown={ handleFileInputKeyDown }
									ref={ fileInput }
									tabIndex={ 0 }
									type="file"
								/>
								<Button
									disabled={ isReadOnly || isAddingLinkedUrl }
									className="btn-default"
									tabIndex={ -1 }
								>
									Add File
								</Button>
							</div>
							<Button
								onClick={ handleLinkedFileClick }
								disabled={ isReadOnly }
								className="btn-default"
								tabIndex={ -1 }
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
				onBlur={ handleBlur }
				onFocus={ handleFocus }
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
										device={ device }
										isReadOnly={ isReadOnly }
										isUploading={ isUploading }
										itemKey={ attachment.key }
										key={ attachment.key }
										libraryKey={ libraryKey }
										onKeyDown={ handleKeyDown }
										ref={ selectedAttachmentKey === attachment.key ? selectedAttachmentRef : null }
										{ ...pick(rest, ['moveToTrash', 'getAttachmentUrl']) }
									/>
								})
							}
						</ul>
					</nav>
				) }
				{ device.isTouchOrSmall && !isReadOnly && (
					<React.Fragment>
						<div className="btn-file">
							<input
								onChange={ handleFileInputChange }
								onKeyDown={ handleKeyDown }
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
						<Button
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
				(!device.isTouchOrSmall && attachments.length > 0) && (
					<AttachmentDetailsWrap isReadOnly={ isReadOnly } />
				)
			}
		</TabPane>
	);
};

Attachments.propTypes = {
	childItems: PropTypes.array,
	createAttachmentsFromDropped: PropTypes.func,
	createItem: PropTypes.func,
	device: PropTypes.object,
	fetchChildItems: PropTypes.func,
	fetchItemTemplate: PropTypes.func,
	isActive: PropTypes.bool,
	isFetched: PropTypes.bool,
	isFetching: PropTypes.bool,
	isReadOnly: PropTypes.bool,
	itemKey: PropTypes.string,
	libraryKey: PropTypes.string,
	onBlur: PropTypes.func,
	onDrillDownNext: PropTypes.func,
	onDrillDownPrev: PropTypes.func,
	onFocus: PropTypes.func,
	onFocusNext: PropTypes.func,
	onFocusPrev: PropTypes.func,
	pointer: PropTypes.number,
	registerFocusRoot: PropTypes.func,
	uploadAttachment: PropTypes.func,
	uploads: PropTypes.array,
};

export default withDevice(withEditMode(Attachments));
