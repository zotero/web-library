import cx from 'classnames';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { NativeTypes } from 'react-dnd-html5-backend-cjs';
import { useDrag, useDrop } from 'react-dnd-cjs'

import Button from '../ui/button';
import Icon from '../ui/icon';
import Spinner from '../ui/spinner';
import withDevice from '../../enhancers/with-device';
import withFocusManager from '../../enhancers/with-focus-manager';
import { ATTACHMENT } from '../../constants/dnd';
import { getFileData } from '../../common/event';
import { isTriggerEvent } from '../../common/event';
import { openAttachment, sortByKey } from '../../utils';
import { pick } from '../../common/immutable';
import { TabPane } from '../ui/tabs';
import { Toolbar, ToolGroup } from '../ui/toolbars';
import { updateItem } from '../../actions';

const Attachment = props => {
	const { attachment, deleteItem, itemKey, isReadOnly, isUploading, libraryKey, getAttachmentUrl,
		onKeyDown } = props;
	const dispatch = useDispatch();
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

	const handleDelete = () => {
		deleteItem(attachment);
	}

	const handleLinkInteraction = ev => {
		const { key } = ev.currentTarget.closest('[data-key]').dataset;
		if(isTriggerEvent(ev) || (ev.type === 'mousedown' && ev.button === 1)) {
			ev.preventDefault();
			openAttachment(key, getAttachmentUrl, true);
		} else if(ev.type === 'keydown') {
			onKeyDown(ev);
		}
	}

	const getItemIcon = item => {
		const { iconName } = item[Symbol.for('derived')];
		const dvp = window.devicePixelRatio >= 2 ? 2 : 1;
		return `16/item-types/light/${dvp}x/${iconName}`;
	}

	return (
		<li
			className="attachment"
			data-key={ attachment.key }
			ref={ drag }
		>
			<Icon type={ getItemIcon(attachment) } width="16" height="16" />
			{
				attachment.linkMode.startsWith('imported') && attachment[Symbol.for('links')].enclosure && !isUploading ? (
					<a
						onClick={ handleLinkInteraction }
						onMouseDown={ handleLinkInteraction }
						onKeyDown={ handleLinkInteraction }
						tabIndex={ -2 }
					>
						{ attachment.title || attachment.filename }
					</a>
				) : attachment.linkMode === 'linked_url' ? (
					<a target="_blank" rel="nofollow noopener noreferrer" href={ attachment.url }>
						{ attachment.title || attachment.url }
					</a>
				) : (
					<span
						className="no-link"
						onKeyDown={ onKeyDown }
						tabIndex={ -2 }
					>
						{ attachment.title || attachment.filename }
						{ isUploading && <Spinner className="small" /> }
					</span>
				)
			}
			{ !isReadOnly && (
				<Button
					icon
					onClick={ handleDelete }
					tabIndex={ -1 }
				>
					<Icon type={ '16/minus-circle' } width="16" height="16" />
				</Button>
			)}
		</li>
	);
}

Attachment.propTypes = {
	attachment: PropTypes.object,
	deleteItem: PropTypes.func,
	getAttachmentUrl: PropTypes.func.isRequired,
	isReadOnly: PropTypes.bool,
	isUploading: PropTypes.bool,
	itemKey: PropTypes.string,
	onKeyDown: PropTypes.func.isRequired,
}

const PAGE_SIZE = 100;

const Attachments = props => {
	const { childItems, createAttachmentsFromDropped, device, isFetched, isFetching, isReadOnly,
	itemKey, createItem, uploadAttachment, onFocusNext, onFocusPrev, fetchChildItems,
	fetchItemTemplate, uploads, isActive, libraryKey, onBlur, onFocus, pointer, registerFocusRoot,
	...rest } = props;

	const [attachments, setAttachments] = useState([]);

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

	const handleFileInputChange = async ev => {
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
	}

	const handleKeyDown = ev => {
		if(ev.target !== ev.currentTarget) {
			return;
		}

		if(ev.key === 'ArrowDown') {
			onFocusNext(ev);
		} else if(ev.key === 'ArrowUp') {
			onFocusPrev(ev);
		}
	}

	return (
		<TabPane
			className={ cx("attachments", { 'dnd-target': canDrop && isOver }) }
			isActive={ isActive }
			isLoading={ device.shouldUseTabs && !isFetched }
			ref={ drop }
		>
			<div
				className="scroll-container-mouse"
				onBlur={ onBlur }
				onFocus={ onFocus }
				ref={ ref => registerFocusRoot(ref) }
				tabIndex={ 0 }
			>
				<h5 className="h2 tab-pane-heading hidden-mouse">Attachments</h5>
				{ !isReadOnly && (
					<Toolbar>
						<div className="toolbar-left">
							<div className="counter">
								{ attachments.length } attachments
							</div>
							<ToolGroup>
								<div className="btn-file">
									<input
										onChange={ handleFileInputChange }
										onKeyDown={ handleKeyDown }
										type="file"
									/>
									<Button
										className="btn-default"
										tabIndex={ -1 }
									>
										Add File Attachment
									</Button>
								</div>
							</ToolGroup>
						</div>
					</Toolbar>
				) }
				<nav>
					<ul className="details-list attachment-list">
						{
							attachments.map(attachment => {
								const isUploading = uploads.includes(attachment.key);
								return <Attachment
									attachment={ attachment }
									isUploading={ isUploading }
									itemKey={ attachment.key }
									key={ attachment.key }
									libraryKey={ libraryKey }
									onKeyDown={ handleKeyDown }
									{ ...pick(rest, ['deleteItem', 'getAttachmentUrl']) }
								/>
							})
						}
					</ul>
				</nav>
			</div>
		</TabPane>
	);
}

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
	onFocus: PropTypes.func,
	onFocusNext: PropTypes.func,
	onFocusPrev: PropTypes.func,
	pointer: PropTypes.number,
	registerFocusRoot: PropTypes.func,
	uploadAttachment: PropTypes.func,
	uploads: PropTypes.array,
};

export default withDevice(withFocusManager(Attachments));
