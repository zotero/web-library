import cx from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NativeTypes } from 'react-dnd-html5-backend-cjs';
import { useDrag, useDrop } from 'react-dnd-cjs'

import Button from '../ui/button';
import Icon from '../ui/icon';
import Spinner from '../ui/spinner';
import withDevice from '../../enhancers/with-device';
import withFocusManager from '../../enhancers/with-focus-manager';
import withEditMode from '../../enhancers/with-edit-mode';
import { ATTACHMENT } from '../../constants/dnd';
import { getFileData } from '../../common/event';
import { isTriggerEvent } from '../../common/event';
import { openAttachment, sortByKey } from '../../utils';
import { pick } from '../../common/immutable';
import { TabPane } from '../ui/tabs';
import { Toolbar, ToolGroup } from '../ui/toolbars';
import { navigate, sourceFile, updateItem } from '../../actions';
import { pluralize } from '../../common/format';
import AttachmentDetails from './attachment-details';

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
			ev.preventDefault();
			openAttachment(key, getAttachmentUrl, true);
		}
	});

	return (
		attachment.linkMode.startsWith('imported') && attachment[Symbol.for('links')].enclosure && !isUploading ? (
			<a
				className="btn btn-icon"
				onClick={ handleLinkInteraction }
				onMouseDown={ handleLinkInteraction }
				onKeyDown={ handleLinkInteraction }
				tabIndex={ -3 }
			>
				<Icon type={ `${iconSize}/open-link` } width={ iconSize } height={ iconSize } />
			</a>
		) : attachment.linkMode === 'linked_url' ? (
			<a
				href={ attachment.url }
				className="btn btn-icon"
				rel="nofollow noopener noreferrer"
				target="_blank"
				tabIndex={ -3 }
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

const Attachment = props => {
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

	const handleFocus = useCallback(() => {
		dispatch(navigate({ attachmentKey: attachment.key }));
		setIsFocused(true);
	});

	const handleBlur = useCallback(() => {
		setIsFocused(false);
	});

	return (
		<li
			className={ cx('attachment', { 'selected': isSelected, 'no-link': !hasLink }) }
			data-key={ attachment.key }
			ref={ drag }
			onKeyDown={ handleKeyDown }
			onClick={ handleAttachmentSelect }
			onFocus={ handleFocus }
			onBlur={ handleBlur }
			tabIndex={ -2 }
		>
			{ (device.isTouchOrSmall && !isReadOnly) && (
				<Button
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
			<div className="truncate">
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
					icon
					onClick={ handleDelete }
					tabIndex={ -3 }
				>
					<Icon type={ '16/minus-circle' } width="16" height="16" />
				</Button>
			)}
		</li>
	);
};

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
					isReadyOnly={ isReadOnly }
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

const Attachments = props => {
	const { childItems, createAttachmentsFromDropped, device, isFetched, isFetching, isReadOnly,
	itemKey, createItem, uploadAttachment, onDrillDownPrev, onDrillDownNext, onFocusNext,
	onFocusPrev, fetchChildItems, fetchItemTemplate, uploads, isActive, libraryKey, onBlur, onFocus,
	pointer, registerFocusRoot, ...rest } = props;
	const dispatch = useDispatch();

	const fileInput = useRef(null);
	const [attachments, setAttachments] = useState([]);

	const isTinymceFetching = useSelector(state => state.sources.fetching.includes('tinymce'));
	const isTinymceFetched = useSelector(state => state.sources.fetched.includes('tinymce'));

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
			onDrillDownPrev(ev);
		} else if(ev.key === "ArrowRight") {
			onDrillDownNext(ev);
		} else if(ev.key === 'ArrowDown') {
			ev.target === ev.currentTarget && onFocusNext(ev);
		} else if(ev.key === 'ArrowUp') {
			ev.target === ev.currentTarget && onFocusPrev(ev);
		} else if(ev.key === 'Tab') {
			const isFileInput = ev.currentTarget === fileInput.current;
			const isShift = ev.getModifierState('Shift');
			if(isFileInput && !isShift) {
				ev.target === ev.currentTarget && onFocusNext(ev);
			}
		} else if(isTriggerEvent(ev)) {
			ev.target.click();
			ev.preventDefault();
		}
	});

	return (
		<TabPane
			className={ cx("attachments", { 'dnd-target': canDrop && isOver }) }
			isActive={ isActive }
			isLoading={ device.shouldUseTabs && !(isFetched && isTinymceFetched) }
			ref={ drop }
		>
			<h5 className="h2 tab-pane-heading hidden-mouse">Attachments</h5>
			<div
				className="scroll-container-mouse"
				onBlur={ onBlur }
				onFocus={ onFocus }
				ref={ ref => registerFocusRoot(ref) }
				tabIndex={ 0 }
			>
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
										onChange={ handleFileInputChange }
										onKeyDown={ handleKeyDown }
										ref={ fileInput }
										tabIndex={ -2 }
										type="file"
									/>
									<Button
										disabled={ isReadOnly }
										className="btn-default"
										tabIndex={ -1 }
									>
										Add File Attachment
									</Button>
								</div>
							</ToolGroup>
							) }
						</div>
					</Toolbar>
				) }
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
										{ ...pick(rest, ['moveToTrash', 'getAttachmentUrl']) }
									/>
								})
							}
						</ul>
					</nav>
				) }
				{ device.isTouchOrSmall && !isReadOnly && (
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

export default withDevice(withFocusManager(withEditMode(Attachments)));
