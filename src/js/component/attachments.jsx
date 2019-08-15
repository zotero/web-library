'use strict';

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

import Button from './ui/button';
import Icon from './ui/icon';
import Spinner from './ui/spinner';
import withFocusManager from '../enhancers/with-focus-manager';
import { getFileData } from '../common/event';
import { pick } from '../common/immutable';
import { TabPane } from './ui/tabs';
import { Toolbar, ToolGroup } from './ui/toolbars';

const Attachment = ({ attachment, deleteItem, isReadOnly, isUploading, onKeyDown }) => {
	const handleDelete = () => {
		deleteItem(attachment);
	}

	return (
		<li
			data-key={ attachment.key }
			className="attachment"
		>
			<Icon type={ '16/attachment' } width="16" height="16" />
			{
				!isUploading && attachment[Symbol.for('attachmentUrl')] ? (
					<a
						href={ attachment[Symbol.for('attachmentUrl')] }
						onKeyDown={ onKeyDown }
						tabIndex={ -2 }
					>
						{ attachment.title || attachment.filename }
					</a>
				) : (
					<span
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
	isReadOnly: PropTypes.bool,
	isUploading: PropTypes.bool,
	onKeyDown: PropTypes.func,
}

const PAGE_SIZE = 100;

const Attachments = ({ childItems, isFetched, isFetching, isReadOnly, itemKey, createItem, uploadAttachment,
	onFocusNext, onFocusPrev, fetchChildItems, fetchItemTemplate, uploads, isActive, libraryKey, onBlur, onFocus,
	registerFocusRoot, ...props }) => {

	useEffect(() => {
		if(isActive && !isFetched) {
			const start = childItems.length;
			const limit = PAGE_SIZE;
			fetchChildItems(itemKey, { start, limit });
		}
	}, [isActive, isFetched]);

	const handleFileInputChange = async ev => {
		const fileDataPromise = getFileData(ev.currentTarget.files[0]);
		const attachmentTemplatePromise = fetchItemTemplate('attachment', { linkMode: 'imported_file' });
		const [fileData, attachmentTemplate] = await Promise.all([fileDataPromise, attachmentTemplatePromise]);

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
		<TabPane isActive={ isActive } isLoading={ isFetching }>
			<h5 className="h2 tab-pane-heading hidden-mouse">Attachments</h5>
			<div
				className="scroll-container-mouse"
				onBlur={ onBlur }
				onFocus={ onFocus }
				ref={ ref => registerFocusRoot(ref) }
				tabIndex={ 0 }
			>
				<nav>
					<ul className="details-list attachment-list">
						{
							childItems.filter(i => i.itemType === 'attachment').map(attachment => {
								const isUploading = uploads.includes(attachment.key);
								return <Attachment
									attachment={ attachment }
									key={ attachment.key }
									isUploading={ isUploading }
									onKeyDown={ handleKeyDown }
									{ ...pick(props, ['deleteItem']) }
								/>
							})
						}
					</ul>
				</nav>
				{ !isReadOnly && (
					<Toolbar>
						<div className="toolbar-left">
							<ToolGroup>
								<div className="add-file-button">
									<input
										onChange={ handleFileInputChange }
										onKeyDown={ handleKeyDown }
										tabIndex={ -2 }
										type="file"
									/>
									<Button
										className="btn-link icon-left"
										tabIndex={ -1 }
									>
										<span className="flex-row align-items-center">
											<Icon type={ '16/plus' } width="16" height="16" />
											Add Attachment
										</span>
									</Button>
								</div>
							</ToolGroup>
						</div>
					</Toolbar>
				) }
			</div>
		</TabPane>
	);
}

Attachments.propTypes = {
	childItems: PropTypes.array,
	isFetching: PropTypes.bool,
	isReadOnly: PropTypes.bool,
	onFocusNext: PropTypes.func,
	onFocusPrev: PropTypes.func,
	uploads: PropTypes.array,
};

export default withFocusManager(Attachments);
